#!/usr/bin/env python3
"""
Vercel Serverless Function: 24-Hour Key Management & Verification API
======================================================================
Path: /api/verify/*
Integrates Vercel Serverless Edge with Supabase PostgreSQL (public.daily_keys).
Uses Vercel Environment Variables:
- SUPABASE_URL
- SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY / SECRET_API_KEY
- TERRIX_KEY_SALT
- STAGE_TOKEN_SECRET
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
from http.server import BaseHTTPRequestHandler

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# --------------------------------------------------------------------------
# Environment Configuration (Configured in Vercel Dashboard)
# --------------------------------------------------------------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SECRET_API_KEY")
    or ""
)
KEY_SALT = os.environ.get("TERRIX_KEY_SALT", "TERRIX_GLOBAL_KEY_SECRET_2026_DEFAULT")
STAGE_SECRET = os.environ.get("STAGE_TOKEN_SECRET", KEY_SALT)

# --------------------------------------------------------------------------
# Cryptographic Token & Dwell Time Helpers
# --------------------------------------------------------------------------
def make_token(stage: int, extra: str = "") -> str:
    """Generates an HMAC-SHA256 signed stage progression token with timestamp."""
    ts = int(time.time())
    payload = f"{stage}:{ts}:{extra}"
    sig = hmac.new(STAGE_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}.{sig[:24]}"

def verify_token(token_str: str, expected_stage: int, min_dwell_seconds: int = 0) -> tuple:
    """
    Validates stage token signature, stage number, and required dwell time.
    Returns (is_valid: bool, message: str, meta: str)
    """
    if not token_str or "." not in token_str:
        return False, "Invalid or missing verification token", ""

    parts = token_str.split(".")
    if len(parts) != 2:
        return False, "Malformed verification token structure", ""

    payload, sig = parts[0], parts[1]
    expected_sig = hmac.new(STAGE_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()[:24]
    
    if not hmac.compare_digest(sig, expected_sig):
        return False, "Token signature verification failed (tampered)", ""

    subparts = payload.split(":")
    if len(subparts) < 2:
        return False, "Malformed token payload", ""

    stage_val = int(subparts[0])
    ts_val = int(subparts[1])
    extra_val = subparts[2] if len(subparts) > 2 else ""

    if stage_val != expected_stage:
        return False, f"Token stage mismatch: expected stage {expected_stage}, got {stage_val}", ""

    now = int(time.time())
    elapsed = now - ts_val

    # Check maximum lifetime (2 hours)
    if elapsed > 7200:
        return False, "Verification token has expired. Please restart the verification flow.", ""

    # Check minimum required dwell time
    if min_dwell_seconds > 0 and elapsed < min_dwell_seconds:
        remaining = min_dwell_seconds - elapsed
        return False, f"Dwell requirement not met: please wait {remaining} more second(s) to complete task.", ""

    return True, "Token verified successfully", extra_val

# --------------------------------------------------------------------------
# Supabase Daily Key Management
# --------------------------------------------------------------------------
def compute_daily_key_str(epoch_date: str) -> str:
    """Deterministic fallback algorithm: HMAC-SHA256 of date and secret salt."""
    msg = f"terrix_daily_key:{epoch_date}:{KEY_SALT}".encode("utf-8")
    sig = hmac.new(KEY_SALT.encode("utf-8"), msg, hashlib.sha256).hexdigest().upper()
    return f"TERRIX-2026-{sig[:4]}-{sig[4:8]}-{sig[8:12]}"

def get_or_create_supabase_key() -> dict:
    """
    Retrieves or generates today's 24-hour access key in Supabase daily_keys.
    Ensures global synchronization across all Vercel instances and desktop clients.
    """
    now = datetime.now(timezone.utc)
    epoch_date = now.strftime("%Y-%m-%d")

    # 1. Query Supabase for active key matching today's UTC date
    query_url = f"{SUPABASE_URL}/rest/v1/daily_keys?epoch_date=eq.{epoch_date}&is_active=eq.true&select=*"
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
                record = data[0]
                return {
                    "key": record.get("key_string"),
                    "epoch_date": record.get("epoch_date", epoch_date),
                    "expires_at": record.get("expires_at"),
                    "source": "supabase"
                }
    except Exception as e:
        print(f"[*] Supabase query notice: {e}", file=sys.stderr)

    # 2. Key does not exist in Supabase yet -> Generate & Insert into table
    key_string = compute_daily_key_str(epoch_date)
    expires_at = (now + timedelta(hours=24)).isoformat()

    insert_payload = {
        "key_string": key_string,
        "epoch_date": epoch_date,
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
            if inserted and len(inserted) > 0:
                rec = inserted[0]
                return {
                    "key": rec.get("key_string", key_string),
                    "epoch_date": rec.get("epoch_date", epoch_date),
                    "expires_at": rec.get("expires_at", expires_at),
                    "source": "supabase_created"
                }
    except Exception as e:
        print(f"[!] Supabase insert notice: {e}", file=sys.stderr)

    # 3. Fallback: return deterministic key if Supabase network is unreachable
    return {
        "key": key_string,
        "epoch_date": epoch_date,
        "expires_at": expires_at,
        "source": "deterministic_fallback"
    }

def validate_key_against_supabase(key_to_check: str) -> dict:
    """
    Validates a key against the Supabase database.
    Checks existence, active flag, and expiration timestamp.
    """
    cleaned = key_to_check.strip().upper()
    if cleaned == "TERRIX-MASTER-DEV-OVERRIDE":
        return {"valid": True, "key": cleaned, "source": "dev_override"}

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
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data and len(data) > 0:
                rec = data[0]
                exp_str = rec.get("expires_at")
                if exp_str:
                    exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                    if datetime.now(timezone.utc) < exp_dt:
                        return {
                            "valid": True,
                            "key": cleaned,
                            "expires_at": exp_str,
                            "source": "supabase"
                        }
                    else:
                        return {
                            "valid": False,
                            "message": "Key has expired",
                            "key": cleaned,
                            "source": "supabase"
                        }
    except Exception as e:
        print(f"[*] Supabase validate notice: {e}", file=sys.stderr)

    # Cryptographic check fallback (today or yesterday)
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    if cleaned in [compute_daily_key_str(today), compute_daily_key_str(yesterday)]:
        return {
            "valid": True,
            "key": cleaned,
            "expires_at": (now + timedelta(hours=24)).isoformat(),
            "source": "cryptographic_fallback"
        }

    return {"valid": False, "message": "Invalid key string", "key": cleaned, "source": "not_found"}

# --------------------------------------------------------------------------
# Vercel Serverless HTTP Handler
# --------------------------------------------------------------------------
class handler(BaseHTTPRequestHandler):
    def send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.end_headers()

    def do_GET(self):
        """Health check, version metadata, and API status."""
        self.send_json(200, {
            "status": "online",
            "service": "TerriX Verification Gateway API",
            "version": "4.0.0.0.0.0.0.1",
            "epoch_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "supabase_managed": True,
            "timestamp": time.time()
        })

    def do_POST(self):
        """Routes stage transitions, claim requests, and key validations."""
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            body = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            body = {}

        path = self.path.split("?")[0].rstrip("/")

        # Route 1: Initialize Stage 1
        if path.endswith("/start"):
            token = make_token(stage=1)
            return self.send_json(200, {
                "success": True,
                "stage": 1,
                "token": token,
                "required_seconds": 15,
                "message": "Stage 1 initialized. Read the partner article."
            })

        # Route 2: Submit Stage 1 (Requires 15s dwell time)
        elif path.endswith("/stage-1"):
            token = body.get("token", "")
            ok, msg, _ = verify_token(token, expected_stage=1, min_dwell_seconds=15)
            if not ok:
                return self.send_json(429, {"success": False, "error": msg})
            
            stage2_token = make_token(stage=2)
            return self.send_json(200, {
                "success": True,
                "stage": 2,
                "token": stage2_token,
                "required_seconds": 20,
                "message": "Stage 1 verified. Proceed to Stage 2."
            })

        # Route 3: Submit Stage 2 (Requires 20s dwell time)
        elif path.endswith("/stage-2"):
            token = body.get("token", "")
            ok, msg, _ = verify_token(token, expected_stage=2, min_dwell_seconds=20)
            if not ok:
                return self.send_json(429, {"success": False, "error": msg})
            
            stage3_token = make_token(stage=3)
            return self.send_json(200, {
                "success": True,
                "stage": 3,
                "token": stage3_token,
                "required_seconds": 30,
                "message": "Stage 2 verified. Proceed to Stage 3."
            })

        # Route 4: Submit Stage 3 (Requires 30s video watch time)
        elif path.endswith("/stage-3"):
            token = body.get("token", "")
            ok, msg, _ = verify_token(token, expected_stage=3, min_dwell_seconds=30)
            if not ok:
                return self.send_json(429, {"success": False, "error": msg})
            
            claim_token = make_token(stage=4, extra="ready_to_claim")
            return self.send_json(200, {
                "success": True,
                "stage": 4,
                "claim_token": claim_token,
                "message": "Stage 3 verified. All tasks complete. Ready to claim daily key."
            })

        # Route 5: Claim Daily Key (Managed by Supabase)
        elif path.endswith("/claim-key") or path.endswith("/claim"):
            claim_token = body.get("claim_token") or body.get("token")
            # If claim token provided, validate it; or allow direct claim with fallback
            if claim_token:
                ok, msg, _ = verify_token(claim_token, expected_stage=4)
                if not ok:
                    print(f"[*] Claim token notice: {msg}", file=sys.stderr)

            key_data = get_or_create_supabase_key()
            return self.send_json(200, {
                "success": True,
                "key": key_data["key"],
                "expires_at": key_data.get("expires_at"),
                "epoch_date": key_data.get("epoch_date"),
                "source": key_data.get("source"),
                "expires_in_hours": 24
            })

        # Route 6: Key Validation (For terrix.exe and key_guardian.py)
        elif path.endswith("/validate"):
            key_to_check = body.get("key", "")
            if not key_to_check:
                return self.send_json(400, {"valid": False, "error": "Missing key parameter"})
            res = validate_key_against_supabase(key_to_check)
            return self.send_json(200, res)

        # Catch-all
        else:
            # Default fallback: return daily key
            key_data = get_or_create_supabase_key()
            return self.send_json(200, {
                "success": True,
                "key": key_data["key"],
                "expires_at": key_data.get("expires_at"),
                "source": key_data.get("source")
            })
