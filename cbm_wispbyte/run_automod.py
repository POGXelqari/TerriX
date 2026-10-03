#!/usr/bin/env python3
"""
CBM | AutoMod - Daemon Launcher & Supervisor
============================================
Supervises the Discord AutoMod bot daemon with auto-recovery, signal handling,
and pre-flight configuration validation.
"""

import os
import sys
import time
import signal
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


def check_configuration():
    print("[*] Validating CBM AutoMod runtime environment...")
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    app_id = os.environ.get("DISCORD_APPLICATION_ID", "").strip()
    nim_key = os.environ.get("NVIDIA_API_KEY", "").strip()

    errors = []
    if not token:
        errors.append("DISCORD_BOT_TOKEN is not set.")
    if not app_id:
        errors.append("DISCORD_APPLICATION_ID is not set.")
    if not nim_key:
        print("[!] Warning: NVIDIA_API_KEY is not set. Bot will operate on Layer 1 heuristic fallback.")

    icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "developer-platform-icon.png")
    if not os.path.exists(icon_path):
        print(f"[!] Notice: Icon file not found at {icon_path}")

    if errors:
        for err in errors:
            print(f"[x] Error: {err}")
        return False

    print(f"[OK] Application ID: {app_id}")
    print(f"[OK] Token configured (length: {len(token)})")
    print(f"[OK] NVIDIA NIM Key: {'Configured' if nim_key else 'Fallback mode'}")
    return True


def run_bot():
    if not check_configuration():
        sys.exit(1)

    from bot import bot, DISCORD_BOT_TOKEN

    def handle_signal(sig, frame):
        print("\n[*] Received shutdown signal. Closing AutoMod gateway...")
        # Closing bot connection cleanly
        import asyncio
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(bot.close())
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    print("[+] Launching CBM AutoMod Daemon (Stealth Moderation Mode)...")
    retry_delay = 5
    while True:
        try:
            bot.run(DISCORD_BOT_TOKEN)
            break
        except Exception as e:
            print(f"[!] AutoMod gateway interrupted: {e}")
            print(f"[*] Reconnecting in {retry_delay}s...")
            time.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 60)


def main():
    parser = argparse.ArgumentParser(description="CBM AutoMod Discord Bot Supervisor")
    parser.add_argument("--check", action="store_true", help="Validate runtime configuration and exit")
    parser.add_argument("--sync-profile", action="store_true", help="Synchronize bot avatar and display name on Discord and exit")
    args = parser.parse_args()

    if args.check:
        ok = check_configuration()
        sys.exit(0 if ok else 1)

    if args.sync_profile:
        from sync_discord_profile import sync_bot_profile
        ok = sync_bot_profile()
        sys.exit(0 if ok else 1)

    run_bot()


if __name__ == "__main__":
    main()
