#!/usr/bin/env python3
"""
TerriX Executor (terrix.exe)
============================
Primary Windows desktop software entry point for TerriX:
- Edge WebView2 hardware-accelerated GUI
- PyWebView native IPC bridge
- Pure In-Process Asynchronous Engine (Zero Subprocess Fragility)
- Real-Time Bidirectional Swarm Telemetry Stream
- Multi-Browser Autodetect (Chrome, Brave, Edge, Chromium)
- 24-Hour Key Guardian & Local Lease Watcher
- Quarantined Chrome Session Management (.chrome_sessions on Drive G:)
"""

import os
import sys
import io
import json
import time
import asyncio
import threading
import subprocess
import webbrowser
import argparse
from typing import List, Dict, Any, Optional

# In Windows GUI executables (console=False), sys.stdout/sys.stderr can be None.
# Provide memory streams to prevent AttributeError on print() or stream reconfigure.
if sys.stdout is None:
    sys.stdout = io.StringIO()
if sys.stderr is None:
    sys.stderr = io.StringIO()

# Base Path Resolution (Supports frozen PyInstaller bundles and dev trees)
if getattr(sys, 'frozen', False):
    BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    RUN_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    RUN_DIR = BASE_DIR

SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
GUI_DIR = os.path.join(BASE_DIR, "gui")
INDEX_HTML = os.path.join(GUI_DIR, "index.html")
ICON_PATH = os.path.join(BASE_DIR, "terrix-logo.ico")

sys.path.insert(0, SCRIPTS_DIR)
sys.path.insert(0, BASE_DIR)

# Import TerriX Core Subsystems
import version_manager
import key_guardian
import identity_manager
import cloud_sync
import swarm_orchestrator
import dynamic_proxy_fetcher

try:
    import webview
except ImportError:
    print("[!] Error: 'pywebview' is not installed. Run 'uv pip install pywebview'.")
    sys.exit(1)


def detect_available_browsers() -> List[Dict[str, Any]]:
    """Detects installed Chromium-based browsers across standard paths and Windows registry."""
    found = []
    candidates = [
        ("Google Chrome", [
            os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        ]),
        ("Brave Browser", [
            os.path.expandvars(r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"),
            os.path.expandvars(r"%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"),
        ]),
        ("Microsoft Edge", [
            os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        ]),
        ("Chromium", [
            os.path.expandvars(r"%LocalAppData%\Chromium\Application\chrome.exe"),
        ])
    ]

    for name, paths in candidates:
        for p in paths:
            if os.path.isfile(p):
                found.append({"name": name, "path": p, "is_default": len(found) == 0})
                break

    # Also query Windows Registry for App Paths
    try:
        import winreg
        keys_to_check = [
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe", "Google Chrome"),
            (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe", "Google Chrome"),
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\brave.exe", "Brave Browser"),
            (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe", "Microsoft Edge"),
        ]
        for root, subkey, name in keys_to_check:
            try:
                with winreg.OpenKey(root, subkey) as k:
                    val, _ = winreg.QueryValueEx(k, "")
                    if val and os.path.isfile(val) and not any(b["path"].lower() == val.lower() for b in found):
                        found.append({"name": name, "path": val, "is_default": len(found) == 0})
            except Exception:
                pass
    except Exception:
        pass

    return found


class ExecutorBridge:
    """IPC Bridge connecting Edge WebView2 GUI with native Python core in-process."""
    def __init__(self):
        self.log_buffer = []
        self._lock = threading.Lock()
        
        # Telemetry State
        self.active_bots_count = 0
        self.in_lobby_count = 0
        self.ready_count = 0
        self.active_lobby = {"map": "Europe", "mode": "team", "countdown": 0}
        self.is_swarm_running = False
        
        # In-process coordination
        self.coordinator_box = {}
        self.swarm_thread = None
        self.swarm_loop = None

    def log(self, text: str):
        with self._lock:
            self.log_buffer.append(f"[{time.strftime('%H:%M:%S')}] {text}")
            if len(self.log_buffer) > 150:
                self.log_buffer = self.log_buffer[-150:]

    def get_telemetry(self) -> dict:
        """Invoked periodically (1000ms) by frontend GUI to fetch state."""
        key_stat = key_guardian.get_lease_status()
        prof = identity_manager.get_profile()
        ver = version_manager.get_version_string()
        browsers = detect_available_browsers()

        # Check proxy count
        proxy_count = 0
        proxy_file = os.path.join(RUN_DIR, "proxy.txt")
        if not os.path.exists(proxy_file):
            proxy_file = os.path.join(BASE_DIR, "proxy.txt")
        if os.path.exists(proxy_file):
            try:
                with open(proxy_file, "r", encoding="utf-8") as f:
                    proxy_count = len([line for line in f if line.strip() and not line.startswith("#")])
            except Exception:
                pass

        # Check token pool
        token_count = 0
        try:
            from token_pool import TokenPool
            pool = TokenPool()
            token_count = len(pool._tokens)
        except Exception:
            pass

        with self._lock:
            logs = list(self.log_buffer)
            self.log_buffer.clear()

        return {
            "version": ver,
            "key_status": key_stat,
            "profile": prof,
            "chrome_found": len(browsers) > 0,
            "browsers": browsers,
            "proxy_count": proxy_count,
            "token_count": token_count,
            "active_bots": self.active_bots_count,
            "in_lobby": self.in_lobby_count,
            "ready_count": self.ready_count,
            "active_lobby": self.active_lobby,
            "is_swarm_running": self.is_swarm_running,
            "logs": logs
        }

    def submit_key(self, key_str: str) -> dict:
        res = key_guardian.activate_key(key_str)
        self.log(f"Key activation: {res.get('message')}")
        return res

    def open_verification_url(self):
        url = "https://terri-x.vercel.app/verify/stage-1"
        self.log(f"Opening verification portal: {url}")
        webbrowser.open(url)
        return {"opened": True, "url": url}

    def set_profile(self, username: str, clan_tag: str) -> dict:
        updated = identity_manager.update_profile(username, clan_tag)
        self.log(f"Profile updated: {updated.get('clan_tag')} {updated.get('username')}".strip())
        return updated

    def launch_swarm(self, config: dict) -> dict:
        key_stat = key_guardian.get_lease_status()
        if not key_stat.get("valid"):
            self.log("[Auth] Cannot launch swarm: 24-hour key is expired or missing.")
            return {"status": "error", "message": "24-hour key is expired. Please renew your key."}

        if self.is_swarm_running:
            return {"status": "already_running", "message": "A swarm session is already running."}

        count = int(config.get("count", 20))
        mode = str(config.get("mode", "team")).lower()
        target_map = str(config.get("map", "Europe"))
        tag = str(config.get("tag", "[TERRIX]"))

        self.is_swarm_running = True
        self.active_bots_count = count
        self.in_lobby_count = 0
        self.ready_count = 0
        self.active_lobby = {"map": target_map, "mode": mode, "countdown": 30}
        self.log(f"Starting in-process swarm: {count} bots on {target_map} ({mode}) with clan tag '{tag}'")

        def telemetry_callback(event_type: str, data: dict):
            if event_type == "lobby_arrival":
                self.in_lobby_count = data.get("in_lobby", 0)
                bot_id = data.get("bot_id", 0)
                total = data.get("target_count", count)
                self.log(f"[Lobby] Bot #{bot_id} reached lobby barrier [{self.in_lobby_count}/{total}]")
            elif event_type == "ready_locked":
                self.ready_count = data.get("ready_count", 0)
                bot_id = data.get("bot_id", 0)
                self.log(f"[Ready] Bot #{bot_id} armed ready toggle ({self.ready_count}/{count})")
            elif event_type == "lobby_cycle":
                self.active_lobby = data
            elif event_type == "swarm_finished":
                self.is_swarm_running = False
                self.log("Swarm session concluded.")

        def runner():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            self.swarm_loop = loop
            try:
                loop.run_until_complete(swarm_orchestrator.run_swarm_in_process(
                    count=count,
                    mode=mode,
                    target_map=target_map,
                    tag=tag,
                    proxies_path=os.path.join(RUN_DIR, "proxy.txt"),
                    dynamic_proxy=False,
                    telemetry_cb=telemetry_callback,
                    coordinator_box=self.coordinator_box
                ))
            except Exception as e:
                self.log(f"Swarm engine notice: {e}")
            finally:
                self.is_swarm_running = False
                loop.close()

        self.swarm_thread = threading.Thread(target=runner, daemon=True)
        self.swarm_thread.start()
        return {"status": "started", "message": f"Swarm launched with {count} bots."}

    def trigger_ready(self) -> dict:
        coord = self.coordinator_box.get("instance")
        if coord:
            coord.trigger_force_ready()
            self.log("Synchronized ready lock triggered across active bots.")
            return {"status": "ok", "message": "Ready armed."}
        self.log("No active coordinator to trigger ready.")
        return {"status": "error", "message": "No active swarm."}

    def abort_swarm(self) -> dict:
        coord = self.coordinator_box.get("instance")
        if coord:
            coord.abort()
        self.is_swarm_running = False
        self.log("Swarm aborted by operator.")
        return {"status": "aborted", "message": "Swarm stopped."}

    def prewarm_tokens(self, target: int = 10) -> dict:
        self.log(f"Pre-warming {target} Turnstile tokens via EzSolver...")
        def bg():
            try:
                from token_pool import TokenPool
                pool = TokenPool(min_pool_size=target, max_pool_size=target + 10)
                pool.ensure_service()
                asyncio.run(pool.warm_up(target=target))
                self.log(f"Pre-warming completed. Active tokens in pool: {len(pool._tokens)}")
            except Exception as e:
                self.log(f"Pre-warming notice: {e}")
        threading.Thread(target=bg, daemon=True).start()
        return {"status": "prewarming"}

    def check_solver_health(self) -> dict:
        try:
            from token_pool import TokenPool
            pool = TokenPool()
            alive = pool.is_service_alive()
            return {"active": alive, "url": pool.api_url, "tokens": len(pool._tokens)}
        except Exception:
            return {"active": False, "url": "http://127.0.0.1:8191", "tokens": 0}

    def harvest_proxies(self, count: int = 30) -> dict:
        self.log(f"Harvesting up to {count} verified proxies directly in-process...")
        try:
            proxies = asyncio.run(dynamic_proxy_fetcher.harvest_and_validate(target_count=count, concurrency=60, timeout=2.5))
            dynamic_proxy_fetcher.save_to_file(proxies, os.path.join(RUN_DIR, "proxy.txt"))
            self.log(f"Proxy harvest completed: {len(proxies)} verified tunnels saved.")
            return {"count": len(proxies), "proxies": proxies}
        except Exception as e:
            self.log(f"Proxy harvest notice: {e}")
            return {"count": 0, "proxies": []}

    def create_accounts(self, count: int = 5) -> dict:
        self.log(f"Generating {count} authentic accounts in-process...")
        try:
            import secrets
            acc_file = os.path.join(RUN_DIR, "data", "generated_accounts.json")
            os.makedirs(os.path.dirname(acc_file), exist_ok=True)
            existing = []
            if os.path.exists(acc_file):
                try:
                    with open(acc_file, "r", encoding="utf-8") as f:
                        existing = json.load(f)
                except Exception:
                    pass

            names = swarm_orchestrator.load_names(count)
            created = []
            chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            for i in range(count):
                acc_name = "".join(secrets.choice(chars) for _ in range(5))
                acc_pass = "".join(secrets.choice(chars) for _ in range(15))
                record = {
                    "username": names[i] if i < len(names) else f"Player_{acc_name}",
                    "account_name": acc_name,
                    "password": acc_pass,
                    "clan_tag": "",
                    "created_at": int(time.time()),
                    "is_valid": True
                }
                created.append(record)
                existing.append(record)

            with open(acc_file, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2)

            self.log(f"Successfully provisioned {len(created)} accounts.")
            return {"accounts": created}
        except Exception as e:
            self.log(f"Account generator notice: {e}")
            return {"accounts": []}


def main():
    parser = argparse.ArgumentParser(description="TerriX Executor")
    parser.add_argument("--version", action="store_true", help="Display TerriX version")
    parser.add_argument("--activate", type=str, help="Activate via 24-hour key or terrix:// protocol")
    parser.add_argument("--headless", action="store_true", help="Run in headless swarm mode")
    parser.add_argument("--count", type=int, default=20, help="Bot swarm count in CLI mode")
    parser.add_argument("--mode", type=str, default="team", help="Game mode")
    parser.add_argument("--map", type=str, default="Europe", help="Target map")
    parser.add_argument("--tag", type=str, default="[TERRIX]", help="Clan tag")

    args, unknown = parser.parse_known_args()

    # Protocol activation check (e.g. terrix://activate?key=...)
    for arg in sys.argv[1:]:
        if arg.startswith("terrix://"):
            res = key_guardian.handle_protocol_activation(arg)
            print(f"[+] Protocol Activation: {res}")
            sys.exit(0)

    if args.version:
        print(f"TerriX Executor v{version_manager.get_version_string()}")
        sys.exit(0)

    if args.activate:
        res = key_guardian.activate_key(args.activate)
        print(f"[+] Activation: {res}")
        sys.exit(0)

    # CLI headless execution: In-process without PyWebView or subprocess
    if args.headless:
        lease = key_guardian.get_lease_status()
        if not lease["valid"]:
            print("[!] Cannot launch headless swarm: 24-hour key is expired.")
            print("[*] Please run 'terrix' to open the GUI and obtain today's key.")
            sys.exit(1)

        print("=" * 65)
        print("TerriX Headless Swarm Mode")
        print(f"Bots: {args.count} | Mode: {args.mode.upper()} | Map: {args.map} | Tag: {args.tag}")
        print("=" * 65)

        try:
            asyncio.run(swarm_orchestrator.run_swarm_in_process(
                count=args.count,
                mode=args.mode,
                target_map=args.map,
                tag=args.tag,
                proxies_path=os.path.join(RUN_DIR, "proxy.txt"),
                dynamic_proxy=False
            ))
        except KeyboardInterrupt:
            print("\n[!] Headless swarm interrupted by operator.")
        sys.exit(0)

    # Launch Desktop GUI via Edge WebView2
    bridge = ExecutorBridge()
    ver = version_manager.get_version_string()
    title = f"TerriX Executor [v{ver}]"

    window = webview.create_window(
        title=title,
        url=INDEX_HTML,
        js_api=bridge,
        width=1320,
        height=860,
        min_size=(1080, 700),
        background_color="#070a0e"
    )

    def on_closed():
        bridge.abort_swarm()
        # Clean orphan worker profiles if any
        try:
            subprocess.run(["taskkill", "/F", "/IM", "chrome.exe", "/T"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    window.events.closed += on_closed
    webview.start(debug=False)


if __name__ == "__main__":
    main()
