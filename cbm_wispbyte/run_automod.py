#!/usr/bin/env python3
"""
CBM | AutoMod - Daemon Launcher & Supervisor
============================================
Supervises the Discord AutoMod bot daemon with auto-recovery, signal handling,
exponential backoff, Cloudflare Error 1015 detection, and 25-hour rate-limit quarantine enforcement.
"""

import os
import sys
import time
import json
import signal
import random
import base64
import argparse
import subprocess
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
load_dotenv(os.path.join(BASE_DIR, ".env"))

COOLDOWN_FILE = os.path.join(BASE_DIR, "automod_cooldown.json")
RATELIMIT_FILE = os.path.join(BASE_DIR, "automod_ratelimit.json")
PID_FILE = os.path.join(BASE_DIR, "automod.pid")


def get_quarantine_remaining_seconds() -> float:
    """Returns remaining seconds if active cooldown exists, else 0.0."""
    if not os.path.exists(COOLDOWN_FILE):
        return 0.0
    try:
        with open(COOLDOWN_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        until = float(data.get("cooldown_until", 0.0))
        remaining = until - time.time()
        return max(0.0, remaining)
    except Exception:
        return 0.0


def get_ratelimit_retry_after() -> float:
    """
    Checks automod_ratelimit.json for active rate limit and returns remaining seconds.
    Cleans up stale or expired rate limit telemetry.
    """
    if not os.path.exists(RATELIMIT_FILE):
        return 0.0
    try:
        with open(RATELIMIT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        retry_at = float(data.get("retry_at", 0.0))
        remaining = retry_at - time.time()
        if remaining > 0:
            return remaining
        # Expired, clean up
        try:
            os.remove(RATELIMIT_FILE)
        except Exception:
            pass
        return 0.0
    except Exception:
        return 0.0


class ExponentialBackoff:
    """
    Exponential backoff manager with bounded jitter for resilient daemon retries.
    Prevents stampeding API gateways and edge firewalls (Discord / Cloudflare) on repeated failures.
    """
    def __init__(
        self,
        base_delay: float = 5.0,
        factor: float = 2.0,
        max_delay: float = 300.0,
        jitter_min: float = 0.5,
        jitter_max: float = 2.0
    ):
        self.base_delay = base_delay
        self.factor = factor
        self.max_delay = max_delay
        self.jitter_min = jitter_min
        self.jitter_max = jitter_max
        self.attempts = 0

    def next_delay(self) -> float:
        """Calculates the next backoff delay with randomized jitter and increments attempt count."""
        raw_delay = min(self.max_delay, self.base_delay * (self.factor ** self.attempts))
        jitter = random.uniform(self.jitter_min, self.jitter_max)
        delay = raw_delay + jitter
        self.attempts += 1
        return delay

    def current_delay(self) -> float:
        """Returns the current raw delay without incrementing attempts."""
        if self.attempts == 0:
            return self.base_delay
        return min(self.max_delay, self.base_delay * (self.factor ** (self.attempts - 1)))

    def reset(self):
        """Resets backoff state after a stable execution period."""
        self.attempts = 0


def interruptible_sleep(seconds: float, step: float = 1.0) -> None:
    """Sleeps for the specified seconds in small increments to allow rapid signal termination."""
    end_time = time.time() + max(0.0, seconds)
    while time.time() < end_time:
        rem = end_time - time.time()
        if rem <= 0:
            break
        time.sleep(min(step, rem))


def get_bot_python_executable() -> str:
    """Finds the Python interpreter that has discord.py installed."""
    # 1. In-process check: if discord is already importable, return sys.executable immediately
    try:
        import discord
        return sys.executable
    except ImportError:
        pass

    # 2. Check sys.executable via subprocess with 10s timeout
    try:
        res = subprocess.run([sys.executable, "-c", "import discord"], capture_output=True, timeout=10)
        if res.returncode == 0:
            return sys.executable
    except Exception:
        pass

    candidates = []
    if sys.platform == "win32":
        candidates = [
            r"C:\Users\a2b\AppData\Local\Programs\Python\Python312\python.exe",
            r"C:\Users\a2b\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe",
            "python",
            "python3"
        ]
    else:
        candidates = [
            "/usr/local/bin/python3",
            "/usr/bin/python3",
            "python3",
            "python"
        ]

    for cand in candidates:
        if cand == sys.executable:
            continue
        try:
            res = subprocess.run([cand, "-c", "import discord"], capture_output=True, timeout=10)
            if res.returncode == 0:
                return cand
        except Exception:
            pass

    return sys.executable


def check_configuration():
    print("[*] Validating CBM AutoMod runtime environment...")
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    app_id = os.environ.get("DISCORD_APPLICATION_ID", "").strip()
    nim_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    proxy = os.environ.get("DISCORD_PROXY_URL", "").strip()

    errors = []
    if not token:
        errors.append("DISCORD_BOT_TOKEN is not set.")

    # Derive application ID from bot token if missing
    if not app_id and token:
        try:
            part = token.split(".")[0]
            part += "=" * ((4 - len(part) % 4) % 4)
            app_id = base64.b64decode(part).decode("utf-8")
            os.environ["DISCORD_APPLICATION_ID"] = app_id
        except Exception:
            pass

    if not app_id:
        print("[!] Warning: DISCORD_APPLICATION_ID is not configured (will be populated on Gateway connect).")

    py_bin = get_bot_python_executable()
    discord_ver = None

    # 1. In-process fast path if targeting current interpreter
    if py_bin == sys.executable:
        try:
            import discord
            discord_ver = getattr(discord, "__version__", "unknown")
            print(f"[+] Discord.py Engine: v{discord_ver} ({py_bin})")
        except ImportError:
            pass

    # 2. Subprocess check if targeting different interpreter or not found in-process
    if not discord_ver:
        try:
            res = subprocess.run(
                [py_bin, "-c", "import discord; print(discord.__version__)"],
                capture_output=True,
                text=True,
                timeout=15
            )
            if res.returncode == 0:
                discord_ver = res.stdout.strip()
                print(f"[+] Discord.py Engine: v{discord_ver} ({py_bin})")
            else:
                errors.append(f"discord.py is not installed in the target interpreter ({py_bin}).")
        except subprocess.TimeoutExpired:
            # On resource-constrained or shared hosting environments (Wispbyte 512MB),
            # cold start package imports can exceed nominal timeouts. Warn but do not abort.
            print(f"[!] Warning: discord.py verification check timed out (>15s) on {py_bin}. Proceeding with launch attempt...")
        except Exception as e:
            errors.append(f"Failed verifying discord.py runtime: {e}")

    # Voice encryption library verification (PyNaCl & davey for Discord DAVE protocol)
    try:
        missing_voice = []
        try:
            res_nacl = subprocess.run([py_bin, "-c", "import nacl.secret"], capture_output=True, timeout=10)
            if res_nacl.returncode != 0:
                missing_voice.append("PyNaCl")
        except Exception:
            missing_voice.append("PyNaCl")

        try:
            res_davey = subprocess.run([py_bin, "-c", "import davey"], capture_output=True, timeout=10)
            if res_davey.returncode != 0:
                missing_voice.append("davey")
        except Exception:
            missing_voice.append("davey")

        if not missing_voice:
            print(f"[+] Discord Voice Engine: PyNaCl & davey active ({py_bin})")
        else:
            print(f"[*] Voice encryption libraries ({', '.join(missing_voice)}) not found on {py_bin}. Attempting auto-installation...")
            try:
                inst_res = subprocess.run([py_bin, "-m", "pip", "install", *missing_voice], capture_output=True, timeout=120)
                if inst_res.returncode != 0:
                    subprocess.run([py_bin, "-m", "pip", "install", "--break-system-packages", *missing_voice], capture_output=True, timeout=120)
            except Exception:
                pass
    except Exception:
        pass

    if not nim_key:
        print("[!] Warning: NVIDIA_API_KEY is not set. Bot operates on Layer 1 heuristic fallback.")

    if proxy:
        print(f"[+] Outbound Egress Proxy: Configured ({proxy.split('@')[-1] if '@' in proxy else proxy})")
    else:
        print("[*] Outbound Egress Proxy: Direct server connection (Shared Hosting IP).")

    rem_quarantine = get_quarantine_remaining_seconds()
    if rem_quarantine > 0:
        hours = round(rem_quarantine / 3600.0, 2)
        print(f"[!] NOTICE: Server IP is under active Discord/Cloudflare 25h quarantine ({hours} hours remaining).")

    rem_ratelimit = get_ratelimit_retry_after()
    if rem_ratelimit > 0:
        print(f"[!] NOTICE: Temporary Discord rate limit active ({round(rem_ratelimit, 1)}s remaining).")

    if errors:
        for err in errors:
            print(f"[x] Error: {err}")
        return False

    if app_id:
        print(f"[OK] Application ID: {app_id}")
    print(f"[OK] Token configured (length: {len(token)})")
    return True


def run_bot(direct: bool = False):
    if not check_configuration():
        sys.exit(1)

    bot_script = os.path.join(BASE_DIR, "bot.py")

    try:
        with open(PID_FILE, "w") as f:
            f.write(str(os.getpid()))
    except Exception:
        pass

    current_proc = None
    backoff = ExponentialBackoff(base_delay=5.0, factor=2.0, max_delay=300.0)
    STABLE_RUNTIME_THRESHOLD = 120.0  # Stable runtime threshold in seconds to reset backoff

    def handle_signal(sig, frame):
        print("\n[*] Stopping AutoMod supervisor...", flush=True)
        nonlocal current_proc
        if current_proc and current_proc.poll() is None:
            if sys.platform == "win32":
                try:
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(current_proc.pid)], capture_output=True, timeout=5)
                except Exception:
                    pass
            current_proc.terminate()
            try:
                current_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                current_proc.kill()
        if os.path.exists(PID_FILE):
            try:
                os.remove(PID_FILE)
            except Exception:
                pass
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    print("[+] Launching CBM AutoMod Daemon (Stealth Moderation Supervisor)...")

    py_bin = get_bot_python_executable()

    while True:
        # Check if we are currently in 25-hour quarantine
        rem_sec = get_quarantine_remaining_seconds()
        quarantine_proxy = os.getenv("DISCORD_QUARANTINE_PROXY_URL") or os.getenv("DISCORD_PROXY_URL")

        if rem_sec > 0:
            if quarantine_proxy:
                print(f"[+] Automated Quarantine Failover: Server IP is under Cloudflare 1015 ban.")
                print(f"    Activating egress proxy routing during quarantine to keep Discord AutoMod operational...")
                proc_env = os.environ.copy()
                proc_env["DISCORD_PROXY_URL"] = quarantine_proxy
                proc_env["PYTHONUNBUFFERED"] = "1"
                cmd = [py_bin, "-O", bot_script]
                start_t = time.time()
                current_proc = subprocess.Popen(cmd, env=proc_env)
                exit_code = current_proc.wait()
                runtime = time.time() - start_t
                if runtime >= STABLE_RUNTIME_THRESHOLD:
                    backoff.reset()

                if exit_code == 0:
                    print("[*] CBM AutoMod terminated cleanly.")
                    break
                elif exit_code == 42:
                    print("[!] Egress proxy also rate-limited. Falling back to non-blocking quarantine sleep.")
                elif exit_code == 429:
                    ratelimit_rem = get_ratelimit_retry_after()
                    delay = max(ratelimit_rem, backoff.next_delay())
                    print(f"[!] Discord HTTP 429 rate limit on proxy. Backing off for {delay:.1f}s...")
                    interruptible_sleep(delay)
                    continue
                else:
                    delay = backoff.next_delay()
                    print(f"[!] Egress proxy exited with code {exit_code}. Retrying with backoff in {delay:.1f}s...")
                    interruptible_sleep(delay)
                    continue

            hours = round(rem_sec / 3600.0, 2)
            print(f"[*] Discord Rate Limit Quarantine Active. Pausing connection attempts for {hours}h to clear Cloudflare ban.")
            # Sleep in 60-second chunks to allow graceful SIGTERM handling
            while get_quarantine_remaining_seconds() > 0:
                interruptible_sleep(min(60.0, get_quarantine_remaining_seconds()))

            # Auto-expire cooldown lockfile
            if os.path.exists(COOLDOWN_FILE):
                try:
                    os.remove(COOLDOWN_FILE)
                except Exception:
                    pass
            print("[+] 25-Hour Quarantine period expired. Attempting clean reconnection...")

        # Pre-check temporary Discord rate limit before launching bot
        ratelimit_rem = get_ratelimit_retry_after()
        if ratelimit_rem > 0:
            delay = max(ratelimit_rem, backoff.next_delay())
            print(f"[!] Active Discord rate limit detected ({ratelimit_rem:.1f}s remaining). Waiting {delay:.1f}s before launch...")
            interruptible_sleep(delay)

        # Spawn bot process directly on server IP
        proc_env = os.environ.copy()
        proc_env["PYTHONUNBUFFERED"] = "1"
        cmd = [py_bin, "-O", bot_script]
        start_t = time.time()
        current_proc = subprocess.Popen(cmd, env=proc_env)
        exit_code = current_proc.wait()
        runtime = time.time() - start_t

        if runtime >= STABLE_RUNTIME_THRESHOLD:
            backoff.reset()

        if exit_code == 0:
            print("[*] CBM AutoMod terminated cleanly.")
            break
        elif exit_code == 42:
            # 25-hour quarantine was initiated by bot.py
            print("[!] Exit code 42 received: Cloudflare Error 1015 detected. Entering 25-hour quarantine sleep.")
            continue
        elif exit_code == 429:
            ratelimit_rem = get_ratelimit_retry_after()
            delay = max(ratelimit_rem, backoff.next_delay())
            print(f"[!] Exit code 429 received: Discord HTTP rate limit. Exponential backoff active ({delay:.1f}s).")
            interruptible_sleep(delay)
            continue
        else:
            # Check if quarantine file was written before standard exit
            if get_quarantine_remaining_seconds() > 0:
                continue
            delay = backoff.next_delay()
            print(f"[!] CBM AutoMod exited with code {exit_code}. Reconnecting with backoff in {delay:.1f}s...")
            interruptible_sleep(delay)

    if os.path.exists(PID_FILE):
        try:
            os.remove(PID_FILE)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="CBM AutoMod Discord Bot Supervisor")
    parser.add_argument("--check", action="store_true", help="Validate runtime configuration and exit")
    parser.add_argument("--clear-cooldown", action="store_true", help="Force-remove 25-hour cooldown lockfile")
    parser.add_argument("--clear-ratelimit", action="store_true", help="Force-remove temporary rate limit file")
    args = parser.parse_args()

    if args.clear_cooldown:
        if os.path.exists(COOLDOWN_FILE):
            os.remove(COOLDOWN_FILE)
            print("[+] Cooldown lockfile deleted.")
        else:
            print("[*] No active cooldown lockfile found.")
        sys.exit(0)

    if args.clear_ratelimit:
        if os.path.exists(RATELIMIT_FILE):
            os.remove(RATELIMIT_FILE)
            print("[+] Rate limit file deleted.")
        else:
            print("[*] No active rate limit file found.")
        sys.exit(0)

    if args.check:
        ok = check_configuration()
        sys.exit(0 if ok else 1)

    run_bot()


if __name__ == "__main__":
    main()
