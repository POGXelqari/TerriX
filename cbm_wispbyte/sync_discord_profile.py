#!/usr/bin/env python3
"""
Discord Bot Profile & Asset Synchronizer
=========================================
Synchronizes the official bot profile, display name, avatar, and application
metadata against the Discord REST API (v10).
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
APP_ID = os.environ.get("DISCORD_APPLICATION_ID", "").strip()
ICON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "developer-platform-icon.png")


def sync_bot_profile():
    if not TOKEN:
        print("[!] DISCORD_BOT_TOKEN is not configured.")
        return False

    headers = {
        "Authorization": f"Bot {TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "TerriX-CBM-AutoMod/1.0"
    }

    # Encode icon to data URI
    icon_data_uri = None
    if os.path.exists(ICON_PATH):
        with open(ICON_PATH, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("ascii")
            icon_data_uri = f"data:image/png;base64,{encoded}"
        print(f"[+] Loaded developer platform icon from {ICON_PATH}")
    else:
        print(f"[!] Icon file not found at {ICON_PATH}")

    # 1. Update Current User Profile (Avatar & Username)
    user_payload = {}
    if icon_data_uri:
        user_payload["avatar"] = icon_data_uri
    user_payload["username"] = "CBM | AutoMod"

    try:
        req = urllib.request.Request(
            "https://discord.com/api/v10/users/@me",
            data=json.dumps(user_payload).encode("utf-8"),
            headers=headers,
            method="PATCH"
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[OK] Bot user profile updated successfully: {data.get('username')}#{data.get('discriminator')} (ID: {data.get('id')})")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[!] Warning updating user profile: {e.code} - {err_msg}")
    except Exception as e:
        print(f"[!] Error updating user profile: {e}")

    # 2. Update Application Metadata & Icon
    app_payload = {
        "description": "Stealth Auto-Moderation & Content Safety service powered by NVIDIA Nemotron NIM.",
        "integration_types_config": {
            "0": {
                "oauth2_install_params": {
                    "scopes": ["bot", "applications.commands"],
                    "permissions": "124928"
                }
            },
            "1": {
                "oauth2_install_params": {
                    "scopes": ["applications.commands"]
                }
            }
        }
    }
    if icon_data_uri:
        app_payload["icon"] = icon_data_uri

    try:
        req = urllib.request.Request(
            f"https://discord.com/api/v10/applications/@me",
            data=json.dumps(app_payload).encode("utf-8"),
            headers=headers,
            method="PATCH"
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[OK] Application metadata & icon updated successfully: {data.get('name')} (ID: {data.get('id')})")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[!] Warning updating application metadata: {e.code} - {err_msg}")
    except Exception as e:
        print(f"[!] Error updating application metadata: {e}")

    return True


if __name__ == "__main__":
    sync_bot_profile()
