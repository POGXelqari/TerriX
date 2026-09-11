#!/usr/bin/env python3
"""
TerriX User Profile & Identity Manager
======================================
Stores and manages local user profiles with zero email requirements,
zero passwords, and zero artificial limits or quotas.
All users possess 100% full, unrestricted access to all software features.
"""

import os
import sys
import json
import random
import uuid
import time

APPDATA_DIR = os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "TerriX")
PROFILE_FILE = os.path.join(APPDATA_DIR, "operator.json")

os.makedirs(APPDATA_DIR, exist_ok=True)

def generate_default_profile() -> dict:
    rand_id = random.randint(1000, 9999)
    return {
        "user_id": str(uuid.uuid4()),
        "username": f"Player_{rand_id}",
        "clan_tag": "[TERRIX]",
        "created_at": time.time(),
        "unrestricted": True
    }

def get_profile() -> dict:
    if not os.path.exists(PROFILE_FILE):
        profile = generate_default_profile()
        save_profile(profile)
        return profile
    try:
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["unrestricted"] = True
            return data
    except Exception:
        profile = generate_default_profile()
        save_profile(profile)
        return profile

def save_profile(profile: dict):
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)

def update_profile(username: str, clan_tag: str) -> dict:
    profile = get_profile()
    if username and username.strip():
        profile["username"] = username.strip()
    if clan_tag is not None:
        tag = clan_tag.strip()
        if tag and not tag.startswith("["):
            tag = f"[{tag}]"
        profile["clan_tag"] = tag
    save_profile(profile)
    return profile

if __name__ == "__main__":
    p = get_profile()
    print(f"[+] Loaded User Profile: {p}")
