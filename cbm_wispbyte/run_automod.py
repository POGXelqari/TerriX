#!/usr/bin/env python3
"""
CBM | AutoMod - Daemon Launcher & Supervisor
============================================
Supervises the Discord AutoMod bot daemon with auto-recovery, signal handling,
Cloudflare Error 1015 detection, and 25-hour rate-limit quarantine enforcement.
"""

import os
import sys
import time
import json
import signal
import argparse
import subprocess
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
load_dotenv(os.path.join(BASE_DIR, ".env"))

COOLDOWN_FILE = os.path.join(BASE_DIR, "automod_cooldown.json")
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


def check_configuration():
    print("[*] Validating CBM AutoMod runtime environment...")
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    app_id = os.environ.get("DISCORD_APPLICATION_ID", "").strip()
    nim_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    proxy = os.environ.get("DISCORD_PROXY_URL", "").strip()

    errors = []
    if not token:
        errors.append("DISCORD_BOT_TOKEN is not set.")
    if not app_id:
        errors.append("DISCORD_APPLICATION_ID is not set.")
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

    if errors:
        for err in errors:
            print(f"[x] Error: {err}")
        return False

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

    def handle_signal(sig, frame):
        print("\n[*] Stopping AutoMod supervisor...")
        nonlocal current_proc
        if current_proc and current_proc.poll() is None:
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

    while True:
        # Check if we are currently in 25-hour quarantine
        rem_sec = get_quarantine_remaining_seconds()
        if rem_sec > 0:
            hours = round(rem_sec / 3600.0, 2)
            print(f"[*] Discord Rate Limit Quarantine Active. Pausing connection attempts for {hours}h to clear Cloudflare ban.")
            # Sleep in 60-second chunks to allow graceful SIGTERM handling
            sleep_chunks = int(rem_sec // 60) + 1
            for _ in range(sleep_chunks):
                if get_quarantine_remaining_seconds() <= 0:
                    break
                time.sleep(60)
            print("[+] 25-Hour Quarantine period expired. Attempting clean reconnection...")

        # Spawn bot process
        cmd = [sys.executable, "-O", bot_script]
        current_proc = subprocess.Popen(cmd)
        exit_code = current_proc.wait()

        if exit_code == 0:
            print("[*] CBM AutoMod terminated cleanly.")
            break
        elif exit_code == 42:
            # 25-hour quarantine was initiated by bot.py
            print("[!] Exit code 42 received: Cloudflare Error 1015 detected. Entering 25-hour quarantine sleep.")
            continue
        else:
            # Check if quarantine file was written before standard exit
            if get_quarantine_remaining_seconds() > 0:
                continue
            retry_delay = 30
            print(f"[!] CBM AutoMod exited with code {exit_code}. Reconnecting in {retry_delay}s...")
            time.sleep(retry_delay)

    if os.path.exists(PID_FILE):
        try:
            os.remove(PID_FILE)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="CBM AutoMod Discord Bot Supervisor")
    parser.add_argument("--check", action="store_true", help="Validate runtime configuration and exit")
    parser.add_argument("--clear-cooldown", action="store_true", help="Force-remove 25-hour cooldown lockfile")
    args = parser.parse_args()

    if args.clear_cooldown:
        if os.path.exists(COOLDOWN_FILE):
            os.remove(COOLDOWN_FILE)
            print("[+] Cooldown lockfile deleted.")
        else:
            print("[*] No active cooldown lockfile found.")
        sys.exit(0)

    if args.check:
        ok = check_configuration()
        sys.exit(0 if ok else 1)

    run_bot()


if __name__ == "__main__":
    main()
