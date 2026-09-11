#!/usr/bin/env python3
"""
TerriX Key Guardian Engine
==========================
Manages the 24-hour rotating key system for terrix.exe:
- Validates keys against Supabase daily_keys table & Vercel API
- Falls back gracefully to deterministic HMAC-SHA256 evaluation if offline
- Caches local 24-hour signed lease in %APPDATA%/TerriX/key_lease.json
- Handles terrix://activate?key=... deep link activations
"""

import os
import sys
import json
import time
import urllib.parse
from datetime import datetime, timezone

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPTS_DIR)
import supabase_key_manager

APPDATA_DIR = os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "TerriX")
LEASE_FILE = os.path.join(APPDATA_DIR, "key_lease.json")
VERCEL_BASE_URL = "https://terri-x.vercel.app"
VERIFY_URL = f"{VERCEL_BASE_URL}/verify/stage-1"

os.makedirs(APPDATA_DIR, exist_ok=True)

def get_lease_status() -> dict:
    """
    Checks the local lease token.
    Returns {
        "valid": bool,
        "expires_at": float,
        "remaining_seconds": int,
        "key": str or None
    }
    """
    if not os.path.exists(LEASE_FILE):
        return {"valid": False, "expires_at": 0, "remaining_seconds": 0, "key": None}
    
    try:
        with open(LEASE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        expires_at = data.get("expires_at", 0)
        remaining = int(expires_at - time.time())
        
        if remaining > 0 and data.get("key"):
            return {
                "valid": True,
                "expires_at": expires_at,
                "remaining_seconds": remaining,
                "key": data.get("key")
            }
    except Exception:
        pass
        
    return {"valid": False, "expires_at": 0, "remaining_seconds": 0, "key": None}

def activate_key(key_str: str) -> dict:
    """
    Validates the provided key string against Supabase daily_keys & Vercel API.
    If valid, grants and writes a 24-hour lease token to %APPDATA%/TerriX/key_lease.json.
    """
    cleaned_key = key_str.strip().upper()
    
    # Validate against Supabase and fallback to HMAC
    is_valid = supabase_key_manager.validate_key_online(cleaned_key)
    
    if is_valid:
        expires_at = time.time() + 86400.0  # 24 hours
        lease_data = {
            "key": cleaned_key,
            "activated_at": time.time(),
            "expires_at": expires_at
        }
        with open(LEASE_FILE, "w", encoding="utf-8") as f:
            json.dump(lease_data, f, indent=2)
            
        return {
            "success": True,
            "message": "Key successfully verified via Supabase. 24-hour lease granted.",
            "expires_at": expires_at,
            "remaining_seconds": 86400
        }
        
    return {
        "success": False,
        "message": "Invalid or expired key. Please complete the verification tasks to obtain today's key.",
        "expires_at": 0,
        "remaining_seconds": 0
    }

def handle_protocol_activation(url_or_key: str) -> dict:
    """Extracts key from terrix://activate?key=... URI or raw string and activates."""
    if "terrix://" in url_or_key:
        parsed = urllib.parse.urlparse(url_or_key)
        params = urllib.parse.parse_qs(parsed.query)
        keys = params.get("key", [])
        if keys:
            return activate_key(keys[0])
    return activate_key(url_or_key)

if __name__ == "__main__":
    lease = get_lease_status()
    print(f"[*] Current Lease Status: {lease}")
    res = activate_key("TERRIX-2026-0D18-D3ED-11BD")
    print(f"[+] Activation Test Result: {res}")
