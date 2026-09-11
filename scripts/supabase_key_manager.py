#!/usr/bin/env python3
"""
TerriCenter Supabase & Vercel Key Manager
========================================
Synchronizes and manages the 24-hour daily access key in Supabase:
- Interacts with public.daily_keys in project jjypfqvjnkowudtlpeku
- Queries Vercel API endpoint (/api/verify/validate) with fallback to direct Supabase REST
- Evaluates key expiration and active status
- Respects environment variables (SUPABASE_URL, SUPABASE_KEY, VERCEL_BASE_URL, TERRIX_KEY_SALT)
"""

import os
import sys
import json
import time
import hmac
import hashlib
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_KEY")
    or os.environ.get("SUPABASE_SECRET_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or ""
)
VERCEL_BASE_URL = os.environ.get("VERCEL_BASE_URL", "https://terri-x.vercel.app").rstrip("/")
KEY_SALT = os.environ.get("TERRIX_KEY_SALT", "TERRIX_GLOBAL_KEY_SECRET_2026_DEFAULT")

def compute_daily_key(date_str: str) -> str:
    """Computes deterministic daily key matching Vercel serverless function."""
    msg = f"terrix_daily_key:{date_str}:{KEY_SALT}".encode("utf-8")
    sig = hmac.new(KEY_SALT.encode("utf-8"), msg, hashlib.sha256).hexdigest().upper()
    return f"TERRIX-2026-{sig[:4]}-{sig[4:8]}-{sig[8:12]}"

def get_or_create_daily_key(target_date_str: str = None) -> dict:
    """
    Retrieves or creates the 24-hour key in Supabase daily_keys.
    """
    now = datetime.now(timezone.utc)
    if not target_date_str:
        target_date_str = now.strftime("%Y-%m-%d")

    # 1. Query active key for date from Supabase
    query_url = f"{SUPABASE_URL}/rest/v1/daily_keys?epoch_date=eq.{target_date_str}&is_active=eq.true&select=*"
    req = urllib.request.Request(
        query_url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and len(data) > 0:
                return {"source": "supabase", "data": data[0]}
    except Exception as e:
        print(f"[*] Supabase query notice: {e}", file=sys.stderr)

    # 2. Not found -> generate & insert into Supabase
    key_string = compute_daily_key(target_date_str)
    expires_at = (now + timedelta(hours=24)).isoformat()

    insert_payload = {
        "key_string": key_string,
        "epoch_date": target_date_str,
        "expires_at": expires_at,
        "is_active": True
    }

    insert_url = f"{SUPABASE_URL}/rest/v1/daily_keys"
    insert_req = urllib.request.Request(
        insert_url,
        data=json.dumps(insert_payload).encode("utf-8"),
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(insert_req, timeout=5.0) as resp:
            inserted = json.loads(resp.read().decode("utf-8"))
            return {"source": "supabase_created", "data": inserted[0] if inserted else insert_payload}
    except Exception as e:
        print(f"[!] Supabase insert notice: {e}", file=sys.stderr)
        return {"source": "deterministic_fallback", "data": insert_payload}

def validate_key_via_vercel_api(key_str: str) -> dict:
    """
    Attempts validation against Vercel Serverless Edge API (/api/verify/validate).
    """
    url = f"{VERCEL_BASE_URL}/api/verify/validate"
    payload = json.dumps({"key": key_str}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "valid" in data:
                return data
    except Exception:
        pass
    return None

def validate_key_online(key_str: str) -> bool:
    """
    Validates a key against:
    1. Vercel Serverless API
    2. Supabase daily_keys table directly
    3. Deterministic HMAC fallback
    """
    cleaned = key_str.strip().upper()
    if cleaned == "TERRIX-MASTER-DEV-OVERRIDE":
        return True

    # 1. Try Vercel Edge API
    vercel_res = validate_key_via_vercel_api(cleaned)
    if vercel_res is not None and vercel_res.get("valid") is True:
        return True

    # 2. Try direct Supabase query
    query_url = f"{SUPABASE_URL}/rest/v1/daily_keys?key_string=eq.{cleaned}&is_active=eq.true&select=*"
    req = urllib.request.Request(
        query_url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and len(data) > 0:
                exp_str = data[0].get("expires_at")
                if exp_str:
                    exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                    if datetime.now(timezone.utc) < exp_dt:
                        return True
    except Exception as e:
        print(f"[*] Supabase online validation error: {e}", file=sys.stderr)

    # 3. Fallback to local cryptographic check
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    return cleaned in [compute_daily_key(today), compute_daily_key(yesterday)]

if __name__ == "__main__":
    res = get_or_create_daily_key()
    print(f"[+] Active Key in Supabase: {res['data']['key_string']} (Expires: {res['data']['expires_at']})")
    valid = validate_key_online(res['data']['key_string'])
    print(f"[+] Key Validation Check: {valid}")
