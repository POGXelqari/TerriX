#!/usr/bin/env python3
"""
Clan Bank Manager (CBM) - Wispbyte Master Runtime
=================================================
Dedicated continuous runtime daemon for Wispbyte Python hosting.
Features:
- Background Deposit Ingestion Worker (polling Territorial.io ledger)
- Real-time Treasury & Unencumbered Reserve calculation
- Loan Facility Risk Engine (0.05% reserve policy & 1000 Gold activation rule)
- HTTP Web Portal & API Server on Wispbyte port (default 10093)
- Direct support for http://78.154.103.45:10093/ and http://cbm.wispbyte.org/
- Cloudflare Tunnel Zero-Trust Ingress supervisor
- Graceful shutdown signal handling
"""

import os
import sys
import io
import time
import signal
import threading
import json
import gzip
import hashlib
import socket
import sqlite3
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional, Dict, Tuple, Any, List

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Import local CBM modules
from db_layer import CBMDatabase
from deposit_daemon import CBMDepositDaemon
from loan_engine import CBMLoanEngine
from withdrawal_worker import CBMWithdrawalWorker
from account_manager import CBMAccountManager
from tunnel_manager import CloudflareTunnelManager
from gold_api_client import TerritorialGoldClient, extract_profile_metadata
from rate_limiter import rate_limiter

PORT = int(os.environ.get("SERVER_PORT") or os.environ.get("PORT") or 10093)
VAULT_ACCOUNT = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
VAULT_PASSWORD = os.environ.get("CBM_VAULT_PASSWORD", "")
POLL_INTERVAL = float(os.environ.get("CBM_POLL_INTERVAL", 30.0))
ENABLE_TUNNEL = os.environ.get("ENABLE_CLOUDFLARE_TUNNEL", "true").lower() in ("true", "1", "yes")
WISPBYTE_SERVER_URL = os.environ.get("WISPBYTE_SERVER_URL", f"http://78.154.103.45:{PORT}/")
WISPBYTE_SUBDOMAIN = os.environ.get("WISPBYTE_SUBDOMAIN", "cbm.wispbyte.org")

db = CBMDatabase()
loan_engine = CBMLoanEngine()
withdrawal_worker = CBMWithdrawalWorker(db=db, vault_account=VAULT_ACCOUNT, vault_password=VAULT_PASSWORD)
deposit_daemon = CBMDepositDaemon(
    db=db,
    vault_account=VAULT_ACCOUNT,
    vault_password=VAULT_PASSWORD,
    poll_interval=POLL_INTERVAL,
    withdrawal_worker=withdrawal_worker,
    invalidate_caches_cb=lambda: invalidate_caches()
)
account_mgr = CBMAccountManager(db=db, vault_account=VAULT_ACCOUNT)
tunnel_mgr = CloudflareTunnelManager(port=PORT) if ENABLE_TUNNEL else None

# In-Memory Static Asset Cache (Pre-compressed at startup for 0 disk I/O & sub-millisecond delivery)
_STATIC_CACHE = {}

def load_static_cache():
    """Pre-loads, digests, and gzip-compresses static assets into RAM at startup."""
    global _STATIC_CACHE
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Automatically ensure assets/products directory exists on startup
    try:
        os.makedirs(os.path.join(base_dir, "assets", "products"), exist_ok=True)
    except Exception as e:
        print(f"[!] Notice: Could not initialize assets/products directory: {e}")

    assets = [
        ("cbm.html", "text/html; charset=utf-8"),
        ("login.html", "text/html; charset=utf-8"),
        ("register.html", "text/html; charset=utf-8"),
        ("donations.html", "text/html; charset=utf-8"),
        ("rulebook.html", "text/html; charset=utf-8"),
        ("vault.html", "text/html; charset=utf-8"),
        ("developer.html", "text/html; charset=utf-8"),
        ("election.html", "text/html; charset=utf-8"),
        ("product.html", "text/html; charset=utf-8"),
        ("widget.html", "text/html; charset=utf-8"),
        ("widget.js", "application/javascript; charset=utf-8"),
        ("cbm_discord_sdk.py", "text/x-python; charset=utf-8"),
        ("cbm-logo.png", "image/png"),
    ]
    for fname, ctype in assets:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            try:
                with open(fpath, "rb") as f:
                    raw = f.read()
                etag = f'"{hashlib.sha256(raw).hexdigest()[:16]}"'
                gzipped = gzip.compress(raw, compresslevel=6)
                _STATIC_CACHE[fname] = {
                    "raw": raw,
                    "gzip": gzipped,
                    "etag": etag,
                    "content_type": ctype,
                    "len_raw": len(raw),
                    "len_gzip": len(gzipped)
                }
                pct = round((1.0 - (len(gzipped) / len(raw))) * 100.0, 1) if len(raw) > 0 else 0
                print(f"[CACHE] Pre-cached {fname}: {len(raw):,} B -> {len(gzipped):,} B gzip ({pct}% bandwidth saved)")
            except Exception as e:
                print(f"[!] Error pre-caching {fname}: {e}")

# Pre-serialized dynamic JSON caches to eliminate json.dumps() overhead on 35% CPU
_STATUS_CACHE_BYTES = None
_STATUS_CACHE_GZIP = None
_STATUS_CACHE_ETAG = None
_STATUS_CACHE_TIME = 0.0
_STATUS_CACHE_TTL = 15.0  # 15s cache
_STATUS_LOCK = threading.Lock()

_DONORS_CACHE_BYTES = None
_DONORS_CACHE_GZIP = None
_DONORS_CACHE_ETAG = None
_DONORS_CACHE_TIME = 0.0
_DONORS_CACHE_TTL = 30.0  # 30s cache
_DONORS_LOCK = threading.Lock()

# Pre-serialized Vault Analytics cache (7-day timeline telemetry)
_VAULT_ANALYTICS_CACHE = {}  # range_key -> {"bytes": raw_bytes, "gzip": gz_bytes, "etag": etag, "time": float}
_VAULT_ANALYTICS_TTL = 30.0  # 30s cache
_VAULT_ANALYTICS_LOCK = threading.Lock()

# Short-TTL Account Statement/Profile cache (5s TTL per account to absorb rapid tab switching)
_ACCOUNT_CACHE = {}  # username.lower() -> {"data": dict, "time": float}
_ACCOUNT_CACHE_TTL = 5.0
_ACCOUNT_LOCK = threading.Lock()

def invalidate_caches():
    global _STATUS_CACHE_TIME, _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP
    global _DONORS_CACHE_TIME, _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP
    global _VAULT_ANALYTICS_CACHE, _ACCOUNT_CACHE
    _STATUS_CACHE_TIME = 0.0
    _STATUS_CACHE_BYTES = None
    _STATUS_CACHE_GZIP = None
    _DONORS_CACHE_TIME = 0.0
    _DONORS_CACHE_BYTES = None
    _DONORS_CACHE_GZIP = None
    with _VAULT_ANALYTICS_LOCK:
        _VAULT_ANALYTICS_CACHE.clear()
    with _ACCOUNT_LOCK:
        _ACCOUNT_CACHE.clear()

def refresh_status_cache():
    """Thread-safe, stampede-protected refresh of status JSON bytes and gzip buffer."""
    global _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG, _STATUS_CACHE_TIME
    with _STATUS_LOCK:
        now = time.time()
        if _STATUS_CACHE_BYTES and (now - _STATUS_CACHE_TIME) < _STATUS_CACHE_TTL:
            return _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG

        treasury = db.get_treasury()
        vault_cents = treasury.get("vault_total_gold_cents", 0)
        metrics = db._calculate_treasury_metrics(vault_cents)
        vault_gold = metrics["vault_total_gold"]
        liab_gold = metrics["member_liabilities_gold"]
        reserves_gold = metrics["bank_reserves_gold"]
        facility = loan_engine.evaluate_lending_facility(metrics["bank_reserves_cents"])
        recent_txs = db.get_recent_transactions(limit=15)
        solvency_ratio = round((vault_gold / liab_gold) * 100.0, 1) if liab_gold > 0 else 100.0

        payload = {
            "status": "ok",
            "service": "Clan Bank Manager (CBM)",
            "runtime": "Wispbyte Python",
            "vault_account": VAULT_ACCOUNT,
            "wispbyte_server_url": WISPBYTE_SERVER_URL,
            "wispbyte_subdomain": WISPBYTE_SUBDOMAIN,
            "treasury": {
                "vault_total_gold": vault_gold,
                "member_liabilities_gold": liab_gold,
                "vault_excess_gold": metrics["vault_excess_gold"],
                "unencumbered_capital_gold": metrics["unencumbered_capital_gold"],
                "loan_penalties_gold": metrics["loan_penalties_gold"],
                "bank_reserves_gold": reserves_gold,
                "solvency_ratio_percent": solvency_ratio,
                "last_sync": treasury.get("last_sync_at"),
                "audit_status": treasury.get("audit_status", "VERIFIED_LIVE" if VAULT_PASSWORD else "ESTIMATED"),
                "is_live_verified": bool(VAULT_PASSWORD)
            },
            "lending_facility": {
                "is_active": facility.get("is_active"),
                "bank_reserves_gold": facility.get("bank_reserves_gold"),
                "calculated_ceiling_gold": facility.get("calculated_ceiling_gold"),
                "max_loan_gold": facility.get("max_loan_gold"),
                "activation_threshold_gold": facility.get("activation_threshold_gold"),
                "min_reserves_required_gold": facility.get("min_reserves_required_gold"),
                "progress_percent": facility.get("progress_percent"),
                "status_message": facility.get("status_message")
            },
            "top_donors": db.get_top_donors(limit=5),
            "recent_transactions": recent_txs
        }
        raw_bytes = json.dumps(payload).encode("utf-8")
        etag = f'"{hashlib.sha256(raw_bytes).hexdigest()[:16]}"'
        gz_bytes = gzip.compress(raw_bytes, compresslevel=5)
        _STATUS_CACHE_BYTES = raw_bytes
        _STATUS_CACHE_GZIP = gz_bytes
        _STATUS_CACHE_ETAG = etag
        _STATUS_CACHE_TIME = now
        return raw_bytes, gz_bytes, etag

def refresh_donors_cache(limit: int = 10):
    """Thread-safe, stampede-protected refresh of donors JSON bytes and gzip buffer."""
    global _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP, _DONORS_CACHE_ETAG, _DONORS_CACHE_TIME
    with _DONORS_LOCK:
        now = time.time()
        if _DONORS_CACHE_BYTES and (now - _DONORS_CACHE_TIME) < _DONORS_CACHE_TTL:
            return _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP, _DONORS_CACHE_ETAG

        top_donors = db.get_top_donors(limit=limit)
        recent = db.get_recent_donations(limit=20)
        total_donated = sum(d.get("total_gold", 0) for d in top_donors)
        payload = {
            "status": "ok",
            "total_donated_gold": round(total_donated, 2),
            "top_donors": top_donors,
            "recent_donations": recent
        }
        raw_bytes = json.dumps(payload).encode("utf-8")
        etag = f'"{hashlib.sha256(raw_bytes).hexdigest()[:16]}"'
        gz_bytes = gzip.compress(raw_bytes, compresslevel=5)
        _DONORS_CACHE_BYTES = raw_bytes
        _DONORS_CACHE_GZIP = gz_bytes
        _DONORS_CACHE_ETAG = etag
        _DONORS_CACHE_TIME = now
        return raw_bytes, gz_bytes, etag

def refresh_vault_analytics_cache(days: int = 7):
    """Thread-safe, stampede-protected refresh of vault analytics timeline bytes and gzip buffer."""
    global _VAULT_ANALYTICS_CACHE
    now = time.time()
    with _VAULT_ANALYTICS_LOCK:
        entry = _VAULT_ANALYTICS_CACHE.get(days)
        if entry and (now - entry["time"]) < _VAULT_ANALYTICS_TTL:
            return entry["bytes"], entry["gzip"], entry["etag"]

        try:
            payload = db.get_vault_timeline(days=days)
        except Exception as err:
            print(f"[!] Error fetching vault timeline ({days}d): {err}")
            if entry:
                return entry["bytes"], entry["gzip"], entry["etag"]
            payload = {
                "status": "ok",
                "range_days": days,
                "metrics": {
                    "current_vault_gold": 0.0,
                    "current_reserves_gold": 0.0,
                    "current_liabilities_gold": 0.0,
                    "reserve_ratio_percent": 100.0,
                    "period_inflow_gold": 0.0,
                    "period_outflow_gold": 0.0,
                    "period_net_flow_gold": 0.0,
                    "peak_vault_gold": 0.0,
                    "trough_vault_gold": 0.0,
                    "period_tx_count": 0,
                    "velocity_24h_percent": 0.0
                },
                "timeline": [],
                "snapshots": []
            }

        raw_bytes = json.dumps(payload).encode("utf-8")
        etag = f'"{hashlib.sha256(raw_bytes).hexdigest()[:16]}"'
        gz_bytes = gzip.compress(raw_bytes, compresslevel=5)
        _VAULT_ANALYTICS_CACHE[days] = {
            "bytes": raw_bytes,
            "gzip": gz_bytes,
            "etag": etag,
            "time": now
        }
        return raw_bytes, gz_bytes, etag

class CBMHealthHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 30.0

    def _apply_security_headers(self, allow_framing: bool = False):
        """Applies OWASP-recommended HTTP security headers to protect against common attacks."""
        self.send_header("X-Content-Type-Options", "nosniff")
        if not allow_framing:
            self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        frame_ancestor = "*" if allow_framing else "'self'"
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self' 'unsafe-inline' https://api.dicebear.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://static.cloudflareinsights.com; "
            "connect-src 'self' https://cloudflareinsights.com https://cdn.jsdelivr.net https://*.cloudflareinsights.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            f"frame-ancestors {frame_ancestor};"
        )

    def _send_cached_asset(self, asset_key: str, download_filename: Optional[str] = None, allow_framing: bool = False):
        asset = _STATIC_CACHE.get(asset_key)
        if not asset:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            return self._send_file(os.path.join(base_dir, asset_key), download_filename=download_filename, allow_framing=allow_framing)

        inm = self.headers.get("If-None-Match", "")
        if inm and asset["etag"] in inm:
            try:
                self.send_response(304)
                self.send_header("ETag", asset["etag"])
                self.send_header("Cache-Control", "public, max-age=300")
                self.send_header("Access-Control-Allow-Origin", "*")
                self._apply_security_headers(allow_framing=allow_framing)
                self.end_headers()
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
            return

        accept_encoding = self.headers.get("Accept-Encoding", "")
        supports_gzip = "gzip" in accept_encoding

        try:
            self.send_response(200)
            self.send_header("Content-Type", asset["content_type"])
            if download_filename:
                self.send_header("Content-Disposition", f'attachment; filename="{download_filename}"')
            self.send_header("ETag", asset["etag"])
            self.send_header("Cache-Control", "public, max-age=300")
            self.send_header("Access-Control-Allow-Origin", "*")
            self._apply_security_headers(allow_framing=allow_framing)

            if supports_gzip:
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(asset["len_gzip"]))
                self.end_headers()
                self.wfile.write(asset["gzip"])
            else:
                self.send_header("Content-Length", str(asset["len_raw"]))
                self.end_headers()
                self.wfile.write(asset["raw"])
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending cached asset {asset_key}: {e}")

    def _send_cached_json_bytes(self, raw_bytes: bytes, gz_bytes: bytes, etag: str, status_code: int = 200):
        inm = self.headers.get("If-None-Match", "")
        if inm and etag in inm:
            try:
                self.send_response(304)
                self.send_header("ETag", etag)
                self.send_header("Cache-Control", "public, max-age=10")
                self.send_header("Access-Control-Allow-Origin", "*")
                self._apply_security_headers()
                self.end_headers()
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
            return

        accept_encoding = self.headers.get("Accept-Encoding", "")
        supports_gzip = "gzip" in accept_encoding

        try:
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("ETag", etag)
            self.send_header("Cache-Control", "public, max-age=10")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Simulate-Lending")
            self._apply_security_headers()

            if supports_gzip:
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(len(gz_bytes)))
                self.end_headers()
                self.wfile.write(gz_bytes)
            else:
                self.send_header("Content-Length", str(len(raw_bytes)))
                self.end_headers()
                self.wfile.write(raw_bytes)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending cached JSON bytes: {e}")

    def _send_file(self, file_path: str, content_type: str = "text/html; charset=utf-8", download_filename: Optional[str] = None, allow_framing: bool = False):
        if not os.path.exists(file_path):
            self.send_error(404, "Asset not found")
            return
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            if download_filename:
                self.send_header("Content-Disposition", f'attachment; filename="{download_filename}"')
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self._apply_security_headers(allow_framing=allow_framing)
            self.end_headers()
            self.wfile.write(content)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending file {file_path}: {e}")

    def _send_json(self, status_code: int, data: dict, headers: Optional[Dict[str, str]] = None):
        if status_code < 400 and getattr(self, "command", "") == "POST":
            invalidate_caches()
        try:
            body = json.dumps(data).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._apply_security_headers()

            origin = self.headers.get("Origin", "")
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Access-Control-Allow-Credentials", "true")
            else:
                self.send_header("Access-Control-Allow-Origin", "*")

            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Simulate-Lending, X-Requested-With, X-CBM-API-Key, X-CBM-Environment")

            if headers:
                for hk, hv in headers.items():
                    self.send_header(hk, hv)

            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending JSON response: {e}")

    def _authenticate_api_v1(self, required_scope: str = "") -> Tuple[bool, Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """
        Authenticates Bearer or X-CBM-API-Key for /api/v1/* routes.
        Enforces per-key rate limits and checks credit balance for live keys.
        Returns (is_authorized, key_record, error_dict)
        """
        auth_header = self.headers.get("Authorization", "").strip()
        api_key = self.headers.get("X-CBM-API-Key", "").strip()
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        elif api_key:
            token = api_key

        if not token:
            return False, None, {
                "status": 401,
                "body": {
                    "error": "unauthorized",
                    "message": "Missing API Key. Provide token via 'Authorization: Bearer <cbm_key>' or 'X-CBM-API-Key: <cbm_key>' header."
                }
            }

        is_valid, key_record = db.verify_api_key(token)
        if not is_valid or not key_record:
            err_msg = key_record.get("error") if isinstance(key_record, dict) else None
            return False, None, {
                "status": 401,
                "body": {
                    "error": "invalid_key",
                    "message": err_msg or "Invalid, revoked, or unrecognized CBM API key."
                }
            }

        # Validate scope
        if required_scope:
            key_scopes = [s.strip() for s in key_record.get("scopes", "").split(",") if s.strip()]
            if required_scope not in key_scopes and "admin" not in key_scopes and "*" not in key_scopes:
                return False, None, {
                    "status": 403,
                    "body": {
                        "error": "insufficient_scope",
                        "message": f"API Key lacks required scope '{required_scope}'. Key scopes: {key_record.get('scopes')}"
                    }
                }

        # Rate limiting per key
        key_id = key_record["key_id"]
        rpm_limit = int(key_record.get("rate_limit_rpm", 60))
        allowed, rem_rpm = rate_limiter.check_rate_limit(f"api_key_{key_id}", limit=rpm_limit, period_seconds=60)
        if not allowed:
            return False, None, {
                "status": 429,
                "headers": {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(rpm_limit),
                    "X-RateLimit-Remaining": "0"
                },
                "body": {
                    "error": "rate_limit_exceeded",
                    "message": f"API Key rate limit of {rpm_limit} requests per minute exceeded. Please slow down."
                }
            }

        is_sandbox = (key_record.get("environment") == "test") or token.startswith("cbm_test_") or (self.headers.get("X-CBM-Environment", "").lower() == "sandbox")
        if not is_sandbox:
            owner = key_record.get("owner_account", "").strip()
            owner_acc = db.get_account(owner)
            is_leader = (
                owner.lower() in ("b8bbq", "[anti-og] leader") or
                (owner_acc and (
                    (owner_acc.get("account_name") or "").lower() == "b8bbq" or
                    "[anti-og] leader" in (owner_acc.get("display_name") or "").lower() or
                    (owner_acc.get("primary_territorial_account") or "").lower() == "b8bbq"
                ))
            )
            cost_gold = 0.01 if is_leader else 1.00
            cost_cents = int(round(cost_gold * 100))
            key_record["cost_gold"] = cost_gold
            key_record["is_leader_tier"] = is_leader

            owner_balance_cents = key_record.get("owner_balance_cents", 0)
            if owner_balance_cents < cost_cents:
                return False, None, {
                    "status": 402,
                    "body": {
                        "error": "insufficient_credits",
                        "message": f"Payment Required: API Key owner '{owner}' has {owner_balance_cents / 100.0:.2f} API Credits. A minimum balance of {cost_gold:.2f} Credit ({cost_gold:.2f} Gold) is required per live request. Deposit Gold in CBM to replenish credits.",
                        "credits_available": round(owner_balance_cents / 100.0, 2),
                        "credit_cost_per_request": cost_gold
                    }
                }

        key_record["is_sandbox"] = is_sandbox
        return True, key_record, None

    def _send_api_v1_json(self, status_code: int, data: dict, key_record: Optional[Dict[str, Any]] = None, extra_headers: Optional[Dict[str, str]] = None):
        headers = {}
        if extra_headers:
            headers.update(extra_headers)

        if key_record:
            is_sandbox = key_record.get("is_sandbox", False)
            if is_sandbox:
                headers["X-CBM-Environment"] = "sandbox"
                headers["X-CBM-Credits-Cost"] = "0.00"
                headers["X-CBM-Credits-Remaining"] = f"{key_record.get('owner_balance_gold', 0.0):.2f}"
            elif status_code >= 200 and status_code < 300:
                cost_gold = key_record.get("cost_gold", 1.0)
                # Live mode successful response: Charge credit and convert to clan reserves!
                charged, msg, billing = db.charge_api_credit(key_record["owner_account"], key_record["key_id"], cost_gold=cost_gold)
                if charged:
                    headers["X-CBM-Environment"] = "live"
                    headers["X-CBM-Credits-Cost"] = f"{cost_gold:.2f}"
                    headers["X-CBM-Credits-Remaining"] = f"{billing.get('credits_remaining', 0.0):.2f}"
                    headers["X-CBM-Billing"] = "converted_to_clan_reserves"
                    headers["X-CBM-Ledger-Tx"] = billing.get("tx_hash", "")
                    invalidate_caches()

        return self._send_json(status_code, data, headers=headers)

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")
        query = parsed[1] if len(parsed) > 1 else ""
        query_dict = urllib.parse.parse_qs(query)
        params = {k: urllib.parse.unquote_plus(v[0]).strip() if v else "" for k, v in query_dict.items()}
        base_dir = os.path.dirname(os.path.abspath(__file__))

        # 1. Standalone Dedicated HTML Pages (Served directly from In-Memory Pre-Gzipped Cache)
        if path in ("/login", "/login.html"):
            return self._send_cached_asset("login.html")

        elif path in ("/register", "/register.html"):
            return self._send_cached_asset("register.html")

        elif path in ("/donations", "/donations.html", "/warchest", "/donate"):
            return self._send_cached_asset("donations.html")

        elif path in ("/rulebook", "/rulebook.html", "/docs", "/spec"):
            return self._send_cached_asset("rulebook.html")

        elif path in ("/vault", "/vault.html", "/analytics", "/analytics.html", "/telemetry"):
            return self._send_cached_asset("vault.html")

        elif path in ("/developer", "/developer.html", "/dev", "/console", "/api-docs"):
            return self._send_cached_asset("developer.html")

        elif path in ("/election", "/election.html", "/votes", "/campaign"):
            return self._send_cached_asset("election.html")

        elif path in ("/product", "/product.html", "/checkout", "/pay"):
            return self._send_cached_asset("product.html")

        elif path in ("/widget.js", "/widget"):
            return self._send_cached_asset("widget.js")

        elif path in ("/widget.html", "/embed"):
            return self._send_cached_asset("widget.html", allow_framing=True)

        elif path.startswith("/assets/products/"):
            fname = path[len("/assets/products/"):].strip("/")
            if fname and "/" not in fname and "\\" not in fname and not fname.startswith("."):
                fpath = os.path.join(base_dir, "assets", "products", fname)
                if os.path.isfile(fpath):
                    ext = os.path.splitext(fname)[1].lower()
                    mimes = {
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".webp": "image/webp",
                        ".gif": "image/gif",
                        ".svg": "image/svg+xml"
                    }
                    return self._send_file(fpath, content_type=mimes.get(ext, "application/octet-stream"))
            return self._send_json(404, {"status": "error", "message": "Product image not found."})

        # Discord Bot SDK Download
        elif path in ("/api/cbm/dev/sdk/download", "/cbm_discord_sdk.py", "/sdk/discord", "/download/discord-sdk"):
            return self._send_cached_asset("cbm_discord_sdk.py", download_filename="cbm_discord_sdk.py")

        # 2. Web Portal Interface (/ or /cbm or /cbm.html or /bank or /index.html)
        elif path in ("", "/", "/cbm", "/cbm.html", "/bank", "/index.html"):
            accept = self.headers.get("Accept", "")
            if "application/json" in accept and "text/html" not in accept:
                return self._send_json(200, {
                    "status": "healthy",
                    "service": "Clan Bank Manager (CBM)",
                    "runtime": "Wispbyte Python",
                    "port": PORT,
                    "server_url": WISPBYTE_SERVER_URL,
                    "subdomain": WISPBYTE_SUBDOMAIN,
                    "uptime": time.time()
                })
            else:
                return self._send_cached_asset("cbm.html")

        # 2. Static Assets (CBM Shield Logo & Favicon)
        elif path in ("/cbm-logo.png", "/cbm-logo", "/logo.png", "/favicon.ico"):
            return self._send_cached_asset("cbm-logo.png")

        # 3. Health check probe
        elif path == "/health":
            return self._send_json(200, {
                "status": "healthy",
                "service": "Clan Bank Manager (CBM)",
                "runtime": "Wispbyte Python",
                "port": PORT,
                "server_url": WISPBYTE_SERVER_URL,
                "subdomain": WISPBYTE_SUBDOMAIN,
                "uptime": time.time()
            })

        # 3. Status & Treasury API (Pre-serialized byte & gzip buffer cache)
        elif path in ("/status", "/api/cbm/status", "/api/cbm"):
            now = time.time()
            if _STATUS_CACHE_BYTES and (now - _STATUS_CACHE_TIME) < _STATUS_CACHE_TTL:
                return self._send_cached_json_bytes(_STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG)

            raw_bytes, gz_bytes, etag = refresh_status_cache()
            return self._send_cached_json_bytes(raw_bytes, gz_bytes, etag)

        # 4. Member Account API
        elif path == "/api/cbm/account":
            acc_name = (params.get("name") or params.get("account") or params.get("cbm_username") or "").strip()
            if "%" in acc_name:
                try:
                    acc_name = urllib.parse.unquote_plus(acc_name).strip()
                except Exception:
                    pass
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' query parameter."})

            now = time.time()
            acc_key = acc_name.lower()
            with _ACCOUNT_LOCK:
                cached_acc = _ACCOUNT_CACHE.get(acc_key)
                if cached_acc and (now - cached_acc["time"]) < _ACCOUNT_CACHE_TTL:
                    return self._send_json(cached_acc.get("code", 200), cached_acc["data"])

            acc = db.get_account(acc_name)
            if acc:
                canonical_name = acc.get("account_name", acc_name)
                disp_name = acc.get("display_name", "")
                ledger = db.get_ledger(canonical_name, limit=20)
                loans = db.get_account_loans(canonical_name)
                resp_data = {
                    "status": "ok",
                    "account": {
                        "account_name": acc.get("account_name"),
                        "display_name": acc.get("display_name"),
                        "avatar_url": acc.get("avatar_url", ""),
                        "clan_tag": acc.get("clan_tag"),
                        "role": acc.get("role"),
                        "primary_territorial_account": acc.get("primary_territorial_account"),
                        "deposited_gold": acc.get("deposited_cents", 0) / 100.0,
                        "total_deposited_gold": acc.get("total_deposited_cents", 0) / 100.0,
                        "total_withdrawn_gold": acc.get("total_withdrawn_cents", 0) / 100.0,
                        "is_verified": acc.get("is_verified", False),
                        "has_pin": acc.get("has_pin", False),
                        "has_password": acc.get("has_password", False),
                        "is_delinquent": acc.get("is_delinquent", False)
                    },
                    "loans": loans,
                    "statement": ledger
                }
                with _ACCOUNT_LOCK:
                    _ACCOUNT_CACHE[acc_key] = {"data": resp_data, "time": now, "code": 200}
                    if canonical_name:
                        _ACCOUNT_CACHE[canonical_name.lower()] = {"data": resp_data, "time": now, "code": 200}
                    if disp_name:
                        _ACCOUNT_CACHE[disp_name.lower()] = {"data": resp_data, "time": now, "code": 200}
                return self._send_json(200, resp_data)
            else:
                resp_data = {"status": "not_found", "message": f"Account '{acc_name}' has no active CBM balance."}
                with _ACCOUNT_LOCK:
                    _ACCOUNT_CACHE[acc_key] = {"data": resp_data, "time": now, "code": 404}
                return self._send_json(404, resp_data)

        # 4b. Loans lookup API
        elif path == "/api/cbm/loans":
            acc_name = (params.get("name") or params.get("account") or params.get("cbm_username") or "").strip()
            if "%" in acc_name:
                try:
                    acc_name = urllib.parse.unquote_plus(acc_name).strip()
                except Exception:
                    pass
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' query parameter."})

            acc = db.get_account(acc_name)
            canonical_name = acc.get("account_name") if acc else acc_name

            db.reconcile_overdue_loans_and_enforce_garnishment(canonical_name)
            loans = db.get_account_loans(canonical_name)
            return self._send_json(200, {
                "status": "ok",
                "account_name": canonical_name,
                "loans": loans
            })

        # 4b-2. Lending Facility Status & Parameters API
        elif path == "/api/cbm/loan/facility":
            simulate = params.get("simulate_active", "").lower() in ("true", "1", "yes") or (self.headers.get("X-CBM-Simulate-Lending", "").lower() in ("true", "1"))
            treasury = db.get_treasury()
            metrics = db._calculate_treasury_metrics(treasury.get("vault_total_gold_cents", 0))
            facility = loan_engine.evaluate_lending_facility(metrics["bank_reserves_cents"])
            if simulate:
                facility["status"] = "FACILITY_ACTIVE"
                facility["reasons"] = ["Simulated Facility Active Mode (Dev/Testing override)"]
                facility["max_individual_loan_gold"] = round(loan_engine.DEFAULT_MAX_SINGLE_LOAN_CENTS / 100.0, 2)
            return self._send_json(200, facility)

        # 4c. Top Donors API (Pre-serialized byte & gzip buffer cache)
        elif path in ("/api/cbm/donors", "/api/cbm/donors/top", "/api/cbm/warchest/donors"):
            try:
                limit = int(params.get("limit", 10))
                if limit not in (5, 10, 20, 50):
                    limit = 10
            except ValueError:
                limit = 10
            raw_bytes, gz_bytes, etag = refresh_donors_cache(limit=limit)
            return self._send_cached_json_bytes(raw_bytes, gz_bytes, etag)

        # 4d. Vault Analytics Timeline API (Pre-serialized byte & gzip buffer cache)
        elif path in ("/api/cbm/analytics/vault-history", "/api/cbm/vault-history", "/api/cbm/vault/timeline"):
            try:
                days = int(params.get("days", 7))
                if days not in (1, 3, 7, 14, 30):
                    days = 7
            except ValueError:
                days = 7
            raw_bytes, gz_bytes, etag = refresh_vault_analytics_cache(days=days)
            return self._send_cached_json_bytes(raw_bytes, gz_bytes, etag)

        # 4e. Admin Election Campaign Telemetry API
        elif path in ("/api/cbm/election/summary", "/api/cbm/election", "/api/cbm/votes/summary"):
            summary = db.get_admin_election_summary()
            try:
                from election_worker import get_election_worker
                ew = get_election_worker(db=db)
                live_telemetry = ew.get_vault_election_telemetry()
                summary["live_election_standing"] = live_telemetry
            except Exception as ex:
                summary["live_election_standing"] = {"status": "unavailable", "error": str(ex)}
            return self._send_json(200, summary)

        # 4f. Member Admin Election Votes History
        elif path in ("/api/cbm/election/my-votes", "/api/cbm/election/votes"):
            acc_name = (params.get("name") or params.get("account") or params.get("cbm_username") or "").strip()
            if "%" in acc_name:
                try:
                    acc_name = urllib.parse.unquote_plus(acc_name).strip()
                except Exception:
                    pass
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' query parameter."})
            votes = db.list_member_admin_votes(acc_name)
            return self._send_json(200, {
                "status": "ok",
                "cbm_username": acc_name,
                "votes": votes
            })

        # 4g. Pending Election Claims Audit API (Officer / Admin review)
        elif path in ("/api/cbm/election/pending", "/api/cbm/admin/election/pending"):
            try:
                limit = int(params.get("limit", 50))
            except (ValueError, TypeError):
                limit = 50
            pending = db.get_pending_admin_votes(limit=limit)
            return self._send_json(200, {
                "status": "ok",
                "pending_claims": pending,
                "count": len(pending)
            })

        # 5. Payment Methods API
        elif path == "/api/cbm/payment-methods":
            acc_name = (params.get("cbm_username") or params.get("name") or params.get("account") or "").strip()
            if "%" in acc_name:
                try:
                    acc_name = urllib.parse.unquote_plus(acc_name).strip()
                except Exception:
                    pass
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' or 'cbm_username' query parameter."})

            acc = db.get_account(acc_name)
            canonical_name = acc.get("account_name") if acc else acc_name

            pms = account_mgr.get_user_payment_methods(canonical_name)
            clean = []
            for p in pms:
                item = dict(p)
                item.pop("territorial_password", None)
                clean.append(item)

            return self._send_json(200, {
                "status": "ok",
                "cbm_username": canonical_name,
                "payment_methods": clean
            })

        # 5b. Pending Donation Slips API
        elif path in ("/api/cbm/donations/pending", "/api/cbm/pending-donations"):
            acc_name = (params.get("account") or params.get("account_name") or params.get("cbm_username") or params.get("name") or "").strip() or None
            if acc_name and "%" in acc_name:
                try:
                    acc_name = urllib.parse.unquote_plus(acc_name).strip()
                except Exception:
                    pass
            pending = db.get_pending_donations(acc_name)
            return self._send_json(200, {
                "status": "ok",
                "pending_donations": pending
            })

        # 5c. Slip Status by ID (used by donations.html polling — returns PENDING/FULFILLED/EXPIRED)
        elif path == "/api/cbm/donations/slip-status":
            slip_id = (params.get("id") or "").strip()
            if not slip_id:
                return self._send_json(400, {"status": "error", "message": "id is required."})
            slip = db.get_donation_slip_by_id(slip_id)
            if not slip:
                return self._send_json(404, {"status": "error", "message": "Slip not found."})
            # Derive display status: if PENDING but past expires_at, surface as EXPIRED
            import time as _time
            display_status = slip.get("status", "PENDING")
            if display_status == "PENDING" and slip.get("expires_at", 0) < _time.time():
                display_status = "EXPIRED"
            return self._send_json(200, {
                "status": "ok",
                "slip_id": slip_id,
                "slip_status": display_status,
                "amount_gold": slip.get("amount_gold"),
                "amount_cents": slip.get("amount_cents"),
                "tx_hash": slip.get("tx_hash"),
                "remaining_seconds": slip.get("remaining_seconds", 0)
            })

        # --- Developer Console Management APIs (GET) ---
        elif path == "/api/cbm/dev/overview":
            acc_name = params.get("account_name") or params.get("account") or params.get("name") or ""
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})
            overview = db.get_developer_overview(acc_name)
            return self._send_json(200, {"status": "ok", "overview": overview})

        elif path == "/api/cbm/dev/keys":
            acc_name = params.get("account_name") or params.get("account") or params.get("name") or ""
            pin = params.get("pin") or ""
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})
            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to view API keys."})
            keys = db.list_api_keys(acc_name)
            return self._send_json(200, {"status": "ok", "keys": keys})

        elif path == "/api/cbm/dev/products":
            acc_name = params.get("account_name") or params.get("account") or params.get("name") or ""
            pin = params.get("pin") or ""
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})
            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to view products."})
            products = db.list_products_by_owner(acc_name, include_archived=True)
            return self._send_json(200, {"status": "ok", "products": products})

        # --- Public Scoped REST API v1 (GET Endpoints) ---
        elif path.startswith("/api/v1/"):
            # 1. Live Bank Status Telemetry
            if path == "/api/v1/bank/status":
                ok, key_rec, err = self._authenticate_api_v1("read:bank")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                treasury = db.get_treasury()
                vault_cents = treasury.get("vault_total_gold_cents", 0)
                metrics = db._calculate_treasury_metrics(vault_cents)
                vault_gold = metrics["vault_total_gold"]
                liab_gold = metrics["member_liabilities_gold"]
                reserves_gold = metrics["bank_reserves_gold"]
                unencumbered_gold = metrics.get("unencumbered_capital_gold", 0.0)
                cushion_gold = metrics.get("vault_cushion_gold", 0.0)
                solvency_ratio = round((vault_gold / liab_gold * 100.0), 2) if liab_gold > 0 else 1000.0
                solvency_tier = "PRUDENT_SURPLUS" if solvency_ratio >= 100.0 else "CAPITAL_RESTRUCTURING"

                resp_data = {
                    "status": "ok",
                    "api_version": "v1.0",
                    "timestamp": time.time(),
                    "bank": {
                        "vault_account": VAULT_ACCOUNT,
                        "vault_total_gold": round(vault_gold, 2),
                        "member_liabilities_gold": round(liab_gold, 2),
                        "unencumbered_reserves_gold": round(unencumbered_gold, 2),
                        "bank_reserves_gold": round(reserves_gold, 2),
                        "reserve_cushion_gold": round(cushion_gold, 2),
                        "solvency_ratio_percent": solvency_ratio,
                        "solvency_tier": solvency_tier,
                        "status": "HEALTHY" if solvency_ratio >= 100.0 else "DEGRADED"
                    }
                }
                return self._send_api_v1_json(200, resp_data, key_record=key_rec)

            # 2. Central Bank Reserves & Solvency Policy
            elif path == "/api/v1/bank/reserves":
                ok, key_rec, err = self._authenticate_api_v1("read:bank")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                treasury = db.get_treasury()
                vault_cents = treasury.get("vault_total_gold_cents", 0)
                metrics = db._calculate_treasury_metrics(vault_cents)
                facility = loan_engine.evaluate_lending_facility(metrics["bank_reserves_cents"])

                resp_data = {
                    "status": "ok",
                    "api_version": "v1.0",
                    "reserves": {
                        "bank_reserves_gold": round(metrics["bank_reserves_gold"], 2),
                        "unencumbered_reserves_gold": round(metrics.get("unencumbered_capital_gold", 0.0), 2),
                        "vault_cushion_gold": round(metrics.get("vault_cushion_gold", 0.0), 2),
                        "activation_floor_gold": 2000000.0,
                        "reserves_progress_percent": facility.get("reserves_progress_percent", 0.0),
                        "facility_active": facility.get("is_active", False),
                        "max_single_loan_gold": facility.get("max_loan_gold", 0),
                        "status_message": facility.get("status_message", "")
                    }
                }
                return self._send_api_v1_json(200, resp_data, key_record=key_rec)

            # 3. Top Donors Leaderboard (Honor Roll)
            elif path in ("/api/v1/donors/leaderboard", "/api/v1/donors/top"):
                ok, key_rec, err = self._authenticate_api_v1("read:bank")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                try:
                    limit = int(params.get("limit", 10))
                    limit = max(1, min(50, limit))
                except ValueError:
                    limit = 10

                top_donors = db.get_top_donors(limit=limit)
                resp_data = {
                    "status": "ok",
                    "api_version": "v1.0",
                    "count": len(top_donors),
                    "leaderboard": top_donors
                }
                return self._send_api_v1_json(200, resp_data, key_record=key_rec)

            # 4. Member Statement & Financial Profile
            elif path.startswith("/api/v1/members/"):
                parts = path.split("/")
                if len(parts) >= 5:
                    target_user = parts[4].strip()
                    is_loans = (len(parts) >= 6 and parts[5] == "loans")

                    if is_loans:
                        ok, key_rec, err = self._authenticate_api_v1("read:loans")
                        if not ok:
                            return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                        acc = db.get_account(target_user)
                        if not acc:
                            return self._send_api_v1_json(404, {"error": "not_found", "message": f"Member '{target_user}' not found."}, key_record=key_rec)

                        pms = db.get_payment_methods(target_user)
                        credit = loan_engine.evaluate_borrower_creditworthiness(acc, pms)
                        loans = db.get_account_loans(target_user)
                        clean_loans = []
                        for l in loans:
                            cl = dict(l)
                            cl.pop("territorial_password", None)
                            clean_loans.append(cl)

                        resp_data = {
                            "status": "ok",
                            "api_version": "v1.0",
                            "member": target_user,
                            "credit_assessment": credit,
                            "active_loans": [l for l in clean_loans if l.get("status") in ("ACTIVE", "OVERDUE")],
                            "loan_history_count": len(clean_loans)
                        }
                        return self._send_api_v1_json(200, resp_data, key_record=key_rec)
                    else:
                        ok, key_rec, err = self._authenticate_api_v1("read:members")
                        if not ok:
                            return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                        acc = db.get_account(target_user)
                        if not acc:
                            return self._send_api_v1_json(404, {"error": "not_found", "message": f"Member '{target_user}' not found."}, key_record=key_rec)

                        clean_acc = {
                            "account_name": acc.get("account_name"),
                            "display_name": acc.get("display_name") or acc.get("account_name"),
                            "clan_tag": acc.get("clan_tag", "ANTI-OG"),
                            "role": acc.get("role", "member"),
                            "primary_territorial_account": acc.get("primary_territorial_account"),
                            "deposited_gold": round((acc.get("deposited_cents") or 0) / 100.0, 2),
                            "total_withdrawn_gold": round((acc.get("total_withdrawn_cents") or 0) / 100.0, 2),
                            "total_transacted_gold": round((acc.get("total_transacted_cents") or 0) / 100.0, 2),
                            "is_verified": bool(acc.get("is_verified", False)),
                            "created_at": acc.get("created_at")
                        }
                        return self._send_api_v1_json(200, {"status": "ok", "api_version": "v1.0", "member": clean_acc}, key_record=key_rec)

            # 5. Product Details, Order Status & Ownership
            elif path.startswith("/api/v1/products/"):
                sub = path[len("/api/v1/products/"):].strip("/")
                if sub == "order/status":
                    order_id = params.get("order_id", "").strip()
                    if not order_id:
                        return self._send_json(400, {"status": "error", "message": "order_id parameter required."})
                    order = db.get_product_order(order_id)
                    if not order:
                        return self._send_json(404, {"error": "not_found", "message": f"Order '{order_id}' not found."})
                    return self._send_json(200, {"status": "ok", "order": order})
                elif sub == "ownership":
                    account = params.get("account", "").strip() or params.get("player", "").strip()
                    if not account:
                        return self._send_json(400, {"status": "error", "message": "account parameter required."})
                    owned = db.get_account_owned_products(account)
                    receipt = db.get_product_receipt_for_account(account, "prod_hellokitty")
                    has_hk = "prod_hellokitty" in owned
                    return self._send_json(200, {
                        "status": "ok",
                        "account": account,
                        "owned_products": owned,
                        "has_hello_kitty": has_hk,
                        "receipt": receipt
                    })
                else:
                    product_id = sub
                    prod = db.get_product(product_id)
                    is_active = prod and (prod.get("status") == "ACTIVE" or prod.get("is_active"))
                    if not prod or not is_active:
                        return self._send_json(404, {"error": "not_found", "message": f"Product '{product_id}' not found or inactive."})
                    half = round(prod["price_gold"] * 0.5, 2)
                    return self._send_json(200, {
                        "status": "ok",
                        "product": prod,
                        "reserve_split": {
                            "seller_percent": 50.0,
                            "seller_gold": half,
                            "reserve_cushion_percent": 50.0,
                            "reserve_cushion_gold": half
                        }
                    })

            return self._send_json(404, {"error": "endpoint_not_found", "message": f"API v1 route '{path}' does not exist."})

        # 6. Fallback: Serve existing static file from local directory if present
        clean_path = path.lstrip("/")
        if clean_path and "/" not in clean_path:
            local_static = os.path.join(os.path.dirname(os.path.abspath(__file__)), clean_path)
            if os.path.isfile(local_static):
                ext = os.path.splitext(clean_path)[1].lower()
                mimes = {
                    ".html": "text/html; charset=utf-8",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".ico": "image/x-icon",
                    ".svg": "image/svg+xml",
                    ".css": "text/css; charset=utf-8",
                    ".js": "application/javascript; charset=utf-8",
                    ".json": "application/json",
                    ".sql": "text/plain; charset=utf-8",
                    ".txt": "text/plain; charset=utf-8"
                }
                self.send_response(200)
                self.send_header("Content-Type", mimes.get(ext, "application/octet-stream"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                with open(local_static, "rb") as f:
                    self.wfile.write(f.read())
                return

        return self._send_json(404, {"status": "error", "message": "Not found"})

    def do_POST(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")

        # 1. Payload size boundaries (Anti-DoS / OOM protection)
        max_allowed_len = 5242880 if path == "/api/cbm/dev/products/upload-image" else 65536
        try:
            length = int(self.headers.get("Content-Length", 0))
        except (ValueError, TypeError):
            return self._send_json(400, {"status": "error", "message": "Invalid Content-Length header."})

        if length < 0:
            return self._send_json(400, {"status": "error", "message": "Negative Content-Length header is not permitted."})

        if length > max_allowed_len:
            try:
                if length <= 10485760:
                    _ = self.rfile.read(length)
            except Exception:
                pass
            return self._send_json(413, {"status": "error", "message": f"Payload Too Large: Maximum permitted request payload is {max_allowed_len // 1024}KB."}, headers={"Connection": "close"})

        raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(raw_body)
        except Exception:
            return self._send_json(400, {"status": "error", "message": "Invalid JSON payload."})

        # 2. Client IP resolution with Cloudflare & proxy header support
        client_ip = (
            self.headers.get("CF-Connecting-IP")
            or self.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or (self.client_address[0] if self.client_address else "127.0.0.1")
        )

        # 3. IP Rate Limiting on sensitive routes (30 req / min)
        sensitive_routes = {
            "/api/cbm/auth/login",
            "/api/cbm/auth/verify-pin",
            "/api/cbm/auth/create-pin",
            "/api/cbm/auth/change-pin",
            "/api/cbm/auth/set-pin",
            "/api/cbm/withdraw",
            "/api/cbm/donate",
            "/api/cbm/profile",
            "/api/cbm/loan/request",
            "/api/cbm/loan/repay",
            "/api/cbm/election/claim",
            "/api/cbm/votes/claim",
            "/api/v1/products/order/pay-direct",
            "/api/v1/products/order/pay-balance",
            "/api/cbm/dev/products/create",
            "/api/cbm/dev/products/upload-image"
        }
        if path in sensitive_routes:
            allowed, retry_after = rate_limiter.check_ip_rate_limit(client_ip, limit=30, window_seconds=60.0)
            if not allowed:
                return self._send_json(
                    429,
                    {
                        "status": "error",
                        "message": f"Too Many Requests: Rate limit exceeded for sensitive operations. Please wait {retry_after} seconds."
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        # 4. Account-level lockout check (5 failed attempts -> 15 min cooldown)
        auth_routes = {
            "/api/cbm/auth/login",
            "/api/cbm/auth/verify-pin",
            "/api/cbm/auth/change-pin",
            "/api/cbm/withdraw",
            "/api/cbm/donate",
            "/api/cbm/profile",
            "/api/cbm/loan/request",
            "/api/cbm/loan/repay",
            "/api/cbm/election/claim",
            "/api/cbm/votes/claim"
        }
        if path in auth_routes:
            target_acc = (body.get("account_name") or body.get("username") or "").strip()
            if target_acc:
                raw_target = db._get_account_raw(target_acc)
                canon_target = raw_target.get("account_name", target_acc) if raw_target else target_acc
                is_locked, rem_lockout = rate_limiter.is_account_locked(canon_target)
                if is_locked:
                    return self._send_json(
                        429,
                        {
                            "status": "error",
                            "message": f"Account Temporarily Locked: Too many failed authentication attempts. Account access is suspended for {rem_lockout} more seconds."
                        },
                        headers={"Retry-After": str(rem_lockout)}
                    )

        # 0. CBM Account Registration
        if path == "/api/cbm/auth/register":
            uname = body.get("username", "").strip()
            pwd = body.get("password", "").strip()
            avatar = body.get("avatar_url", "").strip()
            terri = body.get("primary_territorial_account", "").strip()
            terri_pwd = body.get("territorial_password", "").strip()
            pin = body.get("pin")
            inviter_ref = (body.get("referral_code") or body.get("ref") or "").strip()

            if not uname or not pwd or not avatar or not terri:
                return self._send_json(400, {
                    "status": "error",
                    "message": "username, password, avatar_url, and primary_territorial_account are required."
                })

            if len(uname) < 3 or len(uname) > 30:
                return self._send_json(400, {"status": "error", "message": "Username must be between 3 and 30 characters."})

            if len(pwd) < 6:
                return self._send_json(400, {"status": "error", "message": "Password must be at least 6 characters long."})

            # Dynamic profile extraction from Territorial.io
            display_name = uname
            clan_tag = "None"
            role = "member"

            if terri_pwd:
                try:
                    client = TerritorialGoldClient(terri, terri_pwd, timeout=5.0)
                    res = client.get_account_data()
                    t_status = str(res.get("status", "")).lower()

                    if t_status == "password error":
                        return self._send_json(401, {
                            "status": "unauthorized",
                            "message": f"Incorrect in-game password for Territorial.io account '{terri}'."
                        })
                    elif t_status == "account error":
                        return self._send_json(400, {
                            "status": "error",
                            "message": f"Territorial.io account '{terri}' not found."
                        })
                    elif t_status == "ok":
                        is_game_verified = True
                        if "account_data" in res:
                            d, c, r = extract_profile_metadata(res["account_data"])
                            if d: display_name = d
                            if c: clan_tag = c
                            if r: role = r
                    else:
                        print(f"[!] Territorial.io API returned non-ok status: {t_status} (code: {res.get('code')}). Proceeding with registration.")
                except Exception as ex:
                    print(f"[!] Warning: Unable to reach Territorial.io API during registration: {ex}")
            else:
                # Protect central vault reserves from fee exhaustion (Territorial.io charges 0.10 Gold per /api/account/get).
                # Profile metadata is enriched when credentials are authenticated or when inbound deposits are confirmed.
                display_name = uname

            ok, msg, acc = db.register_member_account(
                username=uname,
                password=pwd,
                avatar_url=avatar,
                primary_territorial_account=terri,
                pin=pin,
                clan_tag=clan_tag,
                role=role,
                display_name=display_name
            )
            if ok:
                with _ACCOUNT_LOCK:
                    _ACCOUNT_CACHE.pop(uname.lower(), None)
                    _ACCOUNT_CACHE.pop(terri.lower(), None)
                if terri_pwd:
                    try:
                        account_mgr.link_via_input(
                            cbm_username=uname,
                            territorial_account=terri,
                            territorial_password=terri_pwd,
                            display_name=uname,
                            is_primary=True
                        )
                    except Exception as e:
                        print(f"[!] link_via_input non-fatal error: {e}")
                if inviter_ref and inviter_ref.upper() != uname.upper():
                    try:
                        db.register_referral(inviter_ref, uname)
                    except Exception:
                        pass
                return self._send_json(200, {"status": "ok", "message": msg, "account": acc})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 0b. CBM Adaptive Login (Password, PIN, or Game Password Fallback)
        elif path == "/api/cbm/auth/login":
            uname = (body.get("username") or body.get("account_name") or "").strip()
            pwd = body.get("password")
            pin = body.get("pin")
            game_pwd = body.get("game_password") or body.get("territorial_password")

            if not uname:
                return self._send_json(400, {"status": "error", "message": "username is required."})

            acc = db.get_account(uname)
            raw = db._get_account_raw(uname)
            if not acc or not raw:
                # If account does not exist yet but user provided game credentials for territorial ID:
                if game_pwd and len(uname) <= 10:
                    client = TerritorialGoldClient(uname, game_pwd)
                    res = client.get_account_data()
                    if res.get("status") == "ok":
                        db.register_or_get_account(uname)
                        account_mgr.link_via_input(uname, uname, game_pwd, display_name=uname, is_primary=True)
                        acc = db.get_account(uname)
                        return self._send_json(200, {
                            "status": "ok",
                            "message": f"Authenticated via Territorial.io primary credentials for {uname}.",
                            "auth_method": "GAME_PASSWORD",
                            "account": acc
                        })
                return self._send_json(404, {"status": "error", "message": f"Account '{uname}' not found."})

            # Check authentication methods:
            if pwd:
                if db.has_account_password(uname):
                    if db.verify_account_password(uname, pwd):
                        rate_limiter.record_auth_success(uname)
                        return self._send_json(200, {
                            "status": "ok",
                            "message": "Login successful.",
                            "auth_method": "PASSWORD",
                            "account": acc
                        })
                    else:
                        rate_limiter.record_auth_failure(uname)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid CBM password."})
                else:
                    return self._send_json(400, {
                        "status": "error",
                        "message": "No CBM password set for this account. Please log in with Quick PIN or Territorial.io password."
                    })

            elif pin:
                if db.has_account_pin(uname):
                    if db.verify_account_pin(uname, str(pin)):
                        rate_limiter.record_auth_success(uname)
                        return self._send_json(200, {
                            "status": "ok",
                            "message": "PIN verified successfully.",
                            "auth_method": "PIN",
                            "account": acc
                        })
                    else:
                        rate_limiter.record_auth_failure(uname)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid Quick PIN."})
                else:
                    return self._send_json(400, {
                        "status": "error",
                        "message": "No PIN configured for this account. Please use Territorial.io credentials or CBM password."
                    })

            elif game_pwd:
                terri_acc = raw.get("primary_territorial_account") or uname
                try:
                    client = TerritorialGoldClient(terri_acc, game_pwd, timeout=5.0)
                    res = client.get_account_data()
                    t_status = str(res.get("status", "")).lower()
                    if t_status == "ok":
                        rate_limiter.record_auth_success(uname)
                        return self._send_json(200, {
                            "status": "ok",
                            "message": f"Authenticated via Territorial.io primary credentials for {terri_acc}.",
                            "auth_method": "GAME_PASSWORD",
                            "account": acc
                        })
                    elif t_status in ("password error", "account error"):
                        rate_limiter.record_auth_failure(uname)
                        return self._send_json(401, {
                            "status": "unauthorized",
                            "message": f"Invalid Territorial.io password for account '{terri_acc}'."
                        })
                    else:
                        return self._send_json(503, {
                            "status": "service_unavailable",
                            "message": f"Territorial.io game server is currently experiencing upstream connectivity issues (HTTP {res.get('code', 502)}). Please sign in using your CBM Password or Quick PIN."
                        })
                except Exception as ex:
                    return self._send_json(503, {
                        "status": "service_unavailable",
                        "message": "Unable to reach Territorial.io game server. Please sign in using your CBM Password or Quick PIN."
                    })

            else:
                return self._send_json(400, {
                    "status": "error",
                    "message": "Please provide your CBM password, Quick PIN, or Territorial.io password."
                })

        # 0c. Model 3: Web-Declared In-Game Donation Slip
        elif path in ("/api/cbm/donations/declare", "/api/cbm/pending-donations/declare"):
            account_name = body.get("account_name", "").strip()
            try:
                amount_gold = float(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0.0
            message = body.get("message", "").strip()
            ttl_minutes = int(body.get("ttl_minutes", 15))

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "account_name and positive amount_gold are required."})

            acc = db.get_account(account_name)
            canonical_name = acc.get("account_name") if acc else account_name

            slip = db.create_pending_donation(canonical_name, amount_gold, message=message, ttl_minutes=ttl_minutes)
            return self._send_json(200, {
                "status": "ok",
                "message": f"Donation slip active for {ttl_minutes} minutes. Send exactly {amount_gold:.2f} Gold in-game to {VAULT_ACCOUNT}.",
                "slip": slip
            })

        # 0a. CBM Access PIN Creation (First-time setup only)
        elif path == "/api/cbm/auth/create-pin":
            acc_name = body.get("account_name", "").strip()
            pin = str(body.get("pin", "")).strip()
            pwd = body.get("password", "").strip()
            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            raw_acc = db._get_account_raw(acc_name)
            canonical_name = raw_acc.get("account_name", acc_name) if raw_acc else acc_name

            if db.has_account_pin(canonical_name):
                return self._send_json(400, {"status": "error", "message": "This account already has an active Access PIN configured. Please use Change PIN to update it."})

            if db.has_account_password(canonical_name):
                if not pwd or not db.verify_account_password(canonical_name, pwd):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Account password required to configure initial Access PIN."})
            else:
                # Inbound deposit accounts without a CBM password:
                # Must provide valid in-game Territorial.io credentials to prove ownership and prevent PIN takeover
                game_pwd = body.get("territorial_password") or body.get("password") or pwd
                terri_id = (raw_acc.get("primary_territorial_account") if raw_acc else None) or canonical_name
                if not game_pwd:
                    return self._send_json(401, {
                        "status": "unauthorized",
                        "message": f"Verification Required: Account '{canonical_name}' has no password. Please enter your valid Territorial.io password for '{terri_id}' to establish your Access PIN."
                    })
                try:
                    client = TerritorialGoldClient(terri_id, game_pwd, timeout=5.0)
                    t_res = client.get_account_data()
                    t_stat = str(t_res.get("status", "")).lower()
                    if t_stat != "ok":
                        rate_limiter.record_auth_failure(canonical_name)
                        return self._send_json(401, {
                            "status": "unauthorized",
                            "message": f"Invalid in-game password for Territorial.io account '{terri_id}'."
                        })
                except Exception as ex:
                    return self._send_json(502, {"status": "error", "message": f"Unable to reach Territorial.io game server for credential verification: {ex}"})

            ok, msg = db.create_account_pin(canonical_name, pin)
            if ok:
                rate_limiter.record_auth_success(canonical_name)
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 0b. CBM Access PIN Modification (Change existing PIN)
        elif path == "/api/cbm/auth/change-pin":
            acc_name = body.get("account_name", "").strip()
            curr_pin = str(body.get("current_pin", "")).strip()
            new_pin = str(body.get("new_pin", "") or body.get("pin", "")).strip()
            if not acc_name or not curr_pin or not new_pin:
                return self._send_json(400, {"status": "error", "message": "account_name, current_pin, and new_pin are required."})

            ok, msg = db.change_account_pin(acc_name, curr_pin, new_pin)
            if ok:
                rate_limiter.record_auth_success(acc_name)
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                rate_limiter.record_auth_failure(acc_name)
                code = 401 if "incorrect" in msg.lower() else 400
                return self._send_json(code, {"status": "error", "message": msg})

        # 0c. Unified / Legacy PIN Management (Set / Change PIN)
        elif path == "/api/cbm/auth/set-pin":
            acc_name = body.get("account_name", "").strip()
            pin = str(body.get("pin", "")).strip()
            curr_pin = str(body.get("current_pin", "")).strip() or None
            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            ok, msg = db.set_account_pin(acc_name, pin, current_pin=curr_pin)
            if ok:
                rate_limiter.record_auth_success(acc_name)
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                rate_limiter.record_auth_failure(acc_name)
                code = 401 if "incorrect" in msg.lower() else 400
                return self._send_json(code, {"status": "error", "message": msg})

        # 0b. CBM Access PIN Verification
        elif path == "/api/cbm/auth/verify-pin":
            acc_name = body.get("account_name", "").strip()
            pin = str(body.get("pin", "")).strip()
            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            is_locked, rem_lockout = rate_limiter.is_account_locked(acc_name)
            if is_locked:
                return self._send_json(429, {
                    "status": "locked",
                    "message": f"Account temporarily locked due to 5 consecutive failed authentication attempts. Please retry in {int(rem_lockout)} seconds."
                }, headers={"Retry-After": str(max(1, int(rem_lockout)))})

            if not db.has_account_pin(acc_name):
                return self._send_json(400, {"status": "error", "message": "No Access PIN configured for this account. Set a PIN first."})

            valid = db.verify_account_pin(acc_name, pin)
            if valid:
                rate_limiter.record_auth_success(acc_name)
                return self._send_json(200, {"status": "ok", "message": "PIN verified successfully."})
            else:
                rate_limiter.record_auth_failure(acc_name)
                return self._send_json(401, {"status": "unauthorized", "message": "Invalid 6-digit CBM Access PIN."})

        # 1. Withdrawal submission (Closed-loop & PIN protected)
        elif path == "/api/cbm/withdraw":
            account_name = body.get("account_name", "").strip()
            acc_clean = account_name.upper()
            if acc_clean in ("TREASURY", "WAR_CHEST", "BANK", "VAULT", "RESERVES", "DDCBC"):
                return self._send_json(403, {
                    "status": "forbidden",
                    "message": "Covenant violation: Central bank reserves and war chest donations are permanent unencumbered clan capital and cannot be withdrawn or refunded."
                })

            raw_acc = db._get_account_raw(account_name)
            if not raw_acc:
                return self._send_json(404, {"status": "not_found", "message": f"Account '{account_name}' not registered in CBM."})

            canonical_name = raw_acc.get("account_name", account_name)
            primary_terri = (raw_acc.get("primary_territorial_account") or "").strip()
            target_account = (body.get("target_account") or primary_terri or canonical_name).strip()
            pin = body.get("pin")
            pwd = body.get("password")

            try:
                amount_gold = int(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0

            if amount_gold <= 0 or amount_gold > 1000:
                return self._send_json(400, {"status": "error", "message": "Withdrawal amount must be between 1 and 1,000 Gold per disbursement."})

            # Check account lockout before verifying authentication
            is_locked, rem_lockout = rate_limiter.is_account_locked(canonical_name)
            if is_locked:
                return self._send_json(429, {
                    "status": "locked",
                    "message": f"Account temporarily locked due to 5 consecutive failed authentication attempts. Please retry in {int(rem_lockout)} seconds."
                })

            # Security: Must authenticate PIN if PIN is configured, or verify account password
            has_pin = db.has_account_pin(canonical_name)
            if has_pin:
                if not pin or not db.verify_account_pin(canonical_name, pin):
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
            elif pwd:
                if not db.verify_account_password(canonical_name, pwd):
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid account password."})
            else:
                # If neither PIN nor password is provided, allow self-disbursement ONLY if sending to own verified primary account
                if target_account.upper() not in (primary_terri.upper(), canonical_name.upper()):
                    return self._send_json(403, {
                        "status": "forbidden",
                        "message": f"Security Requirement: Account '{canonical_name}' does not have an Access PIN configured. Please set an Access PIN before withdrawing to secondary destinations."
                    })

            # Check closed-loop target account enforcement
            allowed_targets = db.get_verified_destination_accounts(canonical_name)
            if target_account.strip().upper() not in allowed_targets:
                return self._send_json(403, {
                    "status": "forbidden",
                    "message": f"Closed-loop violation: Target account '{target_account}' is not linked or verified to CBM user '{canonical_name}'."
                })

            ok, msg = withdrawal_worker.request_withdrawal(canonical_name, target_account, amount_gold, pin=pin)

            if ok:
                invalidate_caches()
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 1c. Admin Election Vote Reward Claim (1:1 Gold Reimbursement)
        elif path in ("/api/cbm/election/claim", "/api/cbm/votes/claim"):
            cbm_username = (body.get("cbm_username") or body.get("account_name") or "").strip()
            voter_account = (body.get("voter_account") or body.get("territorial_account") or "").strip()
            pin = body.get("pin")
            pwd = body.get("password")

            if not cbm_username or not voter_account:
                return self._send_json(400, {"status": "error", "message": "Missing required fields: cbm_username and voter_account."})

            raw_acc = db._get_account_raw(cbm_username)
            if not raw_acc:
                return self._send_json(404, {"status": "not_found", "message": f"Account '{cbm_username}' not registered in CBM."})
            canonical_name = raw_acc.get("account_name", cbm_username)

            try:
                votes_count = int(body.get("votes_count", 0))
            except (ValueError, TypeError):
                votes_count = 0

            if votes_count <= 0:
                return self._send_json(400, {"status": "error", "message": "Votes count must be at least 1."})

            if db.has_account_pin(canonical_name):
                if pin and not db.verify_account_pin(canonical_name, pin):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid 6-digit CBM Access PIN."})
                if pin:
                    rate_limiter.record_auth_success(canonical_name)

            # Auto-settle is disabled by default: untrusted client claims enter audit queue
            ok, msg, details = db.submit_admin_vote_claim(
                cbm_username=canonical_name,
                voter_account=voter_account,
                votes_count=votes_count,
                auto_settle=False
            )

            if ok:
                invalidate_caches()
                return self._send_json(200, {
                    "status": "ok",
                    "message": msg,
                    "claim": details
                })
            else:
                return self._send_json(400, {
                    "status": "error",
                    "message": msg
                })

        # 1c-2. Admin Election Settlement API (Officer / Administrator review)
        elif path in ("/api/cbm/election/settle", "/api/cbm/admin/election/settle"):
            admin_user = (body.get("admin_username") or body.get("operator") or body.get("account_name") or "").strip()
            pin = body.get("pin")
            pwd = body.get("password")
            claim_id = (body.get("claim_id") or "").strip()
            verified = bool(body.get("verified", True))
            rejection_reason = body.get("rejection_reason")
            try:
                quarantine_hours = float(body.get("quarantine_hours", 24.0))
            except (ValueError, TypeError):
                quarantine_hours = 24.0

            if not admin_user or not claim_id:
                return self._send_json(400, {"status": "error", "message": "Missing required fields: admin_username and claim_id."})

            admin_acc = db.get_account(admin_user)
            if not admin_acc or admin_acc.get("role") not in ("admin", "officer", "council"):
                return self._send_json(403, {"status": "forbidden", "message": "Only Clan Bank officers and administrators can settle election claims."})

            if db.has_account_pin(admin_user):
                if not pin or not db.verify_account_pin(admin_user, pin):
                    rate_limiter.record_auth_failure(admin_user)
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid officer CBM Access PIN."})
                rate_limiter.record_auth_success(admin_user)
            elif pwd:
                if not db.verify_account_password(admin_user, pwd):
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid administrator password."})

            ok, msg, details = db.settle_admin_vote_claim(
                claim_id=claim_id,
                verified=verified,
                rejection_reason=rejection_reason,
                quarantine_hours=quarantine_hours
            )

            if ok:
                invalidate_caches()
                return self._send_json(200, {
                    "status": "ok",
                    "message": msg,
                    "details": details
                })
            else:
                return self._send_json(400, {
                    "status": "error",
                    "message": msg
                })

        # 1b. Loan facility origination
        elif path == "/api/cbm/loan/request":
            account_name = body.get("account_name", "").strip()
            pin = body.get("pin")
            try:
                amount_gold = int(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0

            simulate_active = bool(
                body.get("simulate_active", False)
                or (self.headers.get("X-CBM-Simulate-Lending", "").lower() in ("true", "1"))
            )
            terri_acc = body.get("territorial_account", "").strip()
            terri_pwd = body.get("territorial_password", "").strip()

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Valid account_name and amount_gold are required."})

            if db.has_account_pin(account_name):
                if not pin or not db.verify_account_pin(account_name, pin):
                    rate_limiter.record_auth_failure(account_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(account_name)

            acc = db.get_account(account_name)
            if not acc:
                acc = db.register_or_get_account(account_name)

            # Territorial.io Credential Verification (Required as debt recovery authorization)
            verified_cred = False
            if terri_acc and terri_pwd:
                target_terri = terri_acc
                try:
                    linked_match = db.get_account(terri_acc)
                    if linked_match and linked_match.get("primary_territorial_account"):
                        target_terri = linked_match.get("primary_territorial_account")
                except Exception:
                    pass

                try:
                    client = TerritorialGoldClient(target_terri, terri_pwd, timeout=5.0)
                    res = client.get_account_data()
                    t_stat = str(res.get("status", "")).lower()
                    if t_stat == "password error":
                        rate_limiter.record_auth_failure(account_name)
                        return self._send_json(401, {"status": "unauthorized", "message": f"Incorrect in-game password for Territorial.io account '{terri_acc}'."})
                    elif t_stat == "account error":
                        return self._send_json(400, {"status": "error", "message": f"Territorial.io account '{terri_acc}' not found."})
                    elif t_stat != "ok":
                        return self._send_json(400, {"status": "error", "message": f"Territorial.io API error: {res.get('status')}"})
                    verified_cred = True
                except Exception as ex:
                    print(f"[!] Territorial.io API check error during loan origination: {ex}")
                    if not simulate_active:
                        return self._send_json(502, {"status": "error", "message": "Unable to verify Territorial.io credentials with game server. Please try again."})
                    verified_cred = True
            else:
                # Check if borrower has a linked payment method with a verified stored password
                pms = db.get_payment_methods(account_name)
                for pm in pms:
                    if pm.get("territorial_password"):
                        terri_acc = pm.get("territorial_account_name")
                        terri_pwd = pm.get("territorial_password")
                        try:
                            client = TerritorialGoldClient(terri_acc, terri_pwd, timeout=5.0)
                            res = client.get_account_data()
                            if str(res.get("status", "")).lower() == "ok":
                                verified_cred = True
                                break
                            elif str(res.get("status", "")).lower() == "password error":
                                return self._send_json(401, {
                                    "status": "unauthorized",
                                    "message": f"Stored in-game password for linked account '{terri_acc}' is no longer valid. Please enter your valid Territorial.io password."
                                })
                        except Exception:
                            if simulate_active:
                                verified_cred = True
                                break

                if not verified_cred:
                    return self._send_json(400, {
                        "status": "error",
                        "message": "A valid Territorial.io account password is required to originate a loan as debt recovery authorization."
                    })

            # Evaluate against central bank reserve policy & creditworthiness
            treasury = db.get_treasury()
            metrics = db._calculate_treasury_metrics(treasury.get("vault_total_gold_cents", 0))
            existing_loans = db.get_account_loans(account_name)
            active_count = len([l for l in existing_loans if l.get("status") in ("ACTIVE", "OVERDUE", "BREACH_OF_COVENANT") and l.get("remaining_due_cents", 0) > 0])
            pms = db.get_payment_methods(account_name)

            ok, msg = loan_engine.validate_loan_request(
                bank_reserves_cents=metrics["bank_reserves_cents"],
                requested_gold=amount_gold,
                member_account=acc,
                active_loans_count=active_count,
                simulate_active=simulate_active,
                payment_methods=pms
            )
            if not ok:
                return self._send_json(400, {"status": "error", "message": msg})

            # If in Preview / Simulation Mode, perform a pure dry-run validation without mutating production DB
            if simulate_active:
                sim_due = time.time() + (14 * 86400.0)
                sim_loan = {
                    "id": "SIMULATED_PREVIEW",
                    "account_name": account_name,
                    "principal_gold": amount_gold,
                    "interest_rate_percent": 0.0,
                    "penalty_interest_rate": 50.0,
                    "term_days": 14,
                    "due_at": sim_due,
                    "repaid_cents": 0,
                    "penalty_cents": 0,
                    "status": "SIMULATED",
                    "is_simulated": True
                }
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"Preview Mode Validated: Successfully simulated {amount_gold} Gold loan facility (Dry-run preview only - zero database mutations).",
                    "loan": sim_loan
                })

            ok, msg, loan = db.create_loan(
                account_name=account_name,
                principal_gold=amount_gold,
                term_days=14,
                territorial_account=terri_acc,
                territorial_password=terri_pwd
            )
            if ok:
                invalidate_caches()
                return self._send_json(200, {"status": "ok", "message": msg, "loan": loan})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 1b-2. Loan manual balance repayment
        elif path == "/api/cbm/loan/repay":
            account_name = body.get("account_name", "").strip()
            loan_id = body.get("loan_id")
            pin = body.get("pin")
            repay_all = bool(body.get("repay_all", False))
            amount_gold = body.get("amount_gold")

            if not account_name:
                return self._send_json(400, {"status": "error", "message": "Valid account_name is required."})

            if db.has_account_pin(account_name):
                if not pin or not db.verify_account_pin(account_name, pin):
                    rate_limiter.record_auth_failure(account_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(account_name)

            amount_cents = None
            if not repay_all and amount_gold is not None:
                try:
                    amount_cents = int(round(float(amount_gold) * 100))
                except (ValueError, TypeError):
                    amount_cents = None

            ok, msg, res = db.repay_loan_from_balance(
                account_name=account_name,
                loan_id=loan_id,
                amount_cents=amount_cents,
                full_repay=repay_all
            )
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg, "result": res})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 1b-3. Credential liveness heartbeat & anti-evasion audit
        elif path == "/api/cbm/loan/liveness-audit":
            audit = db.audit_loan_credential_liveness()
            return self._send_json(200, {"status": "ok", "audit": audit})

        # 1b-4. In-game gold seizure execution
        elif path == "/api/cbm/loan/seize":
            loan_id = body.get("loan_id")
            if not loan_id:
                return self._send_json(400, {"status": "error", "message": "Valid loan_id is required."})
            ok, msg, res = db.execute_automated_gold_seizure(loan_id)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg, "result": res})
            else:
                return self._send_json(400, {"status": "error", "message": msg, "result": res})

        # 1c. Treasury live balance audit sync
        elif path == "/api/cbm/treasury/sync":
            ok, live_cents, audit = db.sync_vault_balance_from_live_api(VAULT_ACCOUNT, VAULT_PASSWORD)
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"Vault assets audited and synced live at {live_cents / 100.0:.2f} Gold.",
                    "audit": audit
                })
            else:
                return self._send_json(500, {
                    "status": "error",
                    "message": "Failed to sync live vault balance from Territorial.io API.",
                    "details": audit
                })

        # 2. Link Payment Method
        elif path == "/api/cbm/link-payment-method":
            cbm_user = body.get("cbm_username", "").strip()
            v_type = body.get("verification_type", "INPUT_CREDENTIALS").strip()
            terri_acc = body.get("territorial_account", "").strip()
            terri_pass = body.get("territorial_password", "").strip()
            display_name = body.get("display_name", "").strip()
            is_primary = bool(body.get("is_primary", False))
            pin = body.get("pin")

            if not cbm_user or not terri_acc:
                return self._send_json(400, {"status": "error", "message": "cbm_username and territorial_account are required."})

            if db.has_account_pin(cbm_user):
                if not pin or not db.verify_account_pin(cbm_user, pin):
                    rate_limiter.record_auth_failure(cbm_user)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(cbm_user)

            db.register_or_get_account(cbm_user)

            if v_type == "INPUT_CREDENTIALS":
                ok, msg, pm = account_mgr.link_via_input(
                    cbm_username=cbm_user,
                    territorial_account=terri_acc,
                    territorial_password=terri_pass,
                    display_name=display_name,
                    is_primary=is_primary
                )
            elif v_type == "TRANSACTION_VERIFIED":
                ok, msg, pm = account_mgr.link_via_transaction(
                    cbm_username=cbm_user,
                    territorial_account=terri_acc,
                    display_name=display_name,
                    is_primary=is_primary
                )
            else:
                return self._send_json(400, {"status": "error", "message": f"Unknown verification_type '{v_type}'."})

            if ok:
                pm_clean = dict(pm)
                pm_clean.pop("territorial_password", None)
                return self._send_json(200, {"status": "ok", "message": msg, "payment_method": pm_clean})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 3. Update CBM Profile (Display Name & Required Profile Picture)
        elif path == "/api/cbm/profile":
            account_name = body.get("account_name", "").strip()
            display_name = body.get("display_name", "").strip()
            avatar_url = body.get("avatar_url", "").strip()
            pin = body.get("pin")
            password = body.get("password", "").strip()

            if not account_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})

            raw_acc = db._get_account_raw(account_name)
            if not raw_acc:
                return self._send_json(404, {"status": "not_found", "message": f"Account '{account_name}' does not exist."})

            canonical_name = raw_acc.get("account_name", account_name)

            if db.has_account_pin(canonical_name):
                if not pin or not db.verify_account_pin(canonical_name, pin):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(canonical_name)
            elif db.has_account_password(canonical_name):
                if not password or not db.verify_account_password(canonical_name, password):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Valid CBM password required to edit profile."})
                rate_limiter.record_auth_success(canonical_name)
            else:
                if not pin and not password:
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Ownership verification required to edit profile."})

            ok, msg, updated = db.update_account_profile(canonical_name, display_name, avatar_url)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg, "profile": updated})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 4. Contribute to Clan War Chest / Treasury Reserves (Personal Balance Conversion)
        elif path == "/api/cbm/donate":
            account_name = body.get("account_name", "").strip()
            message = body.get("message", "").strip()
            territorial_account = body.get("territorial_account", "").strip()
            pin = body.get("pin")
            password = body.get("password", "").strip()
            try:
                amount_gold = float(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0.0

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Valid account_name and amount_gold are required."})

            raw_acc = db._get_account_raw(account_name)
            if not raw_acc:
                return self._send_json(404, {"status": "not_found", "message": f"Account '{account_name}' does not exist."})
            canonical_name = raw_acc.get("account_name", account_name)

            if db.has_account_pin(canonical_name):
                if not pin or not db.verify_account_pin(canonical_name, pin):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(canonical_name)
            elif db.has_account_password(canonical_name):
                if not password or not db.verify_account_password(canonical_name, password):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Valid CBM password or Access PIN required."})
                rate_limiter.record_auth_success(canonical_name)

            ok, msg, donation = db.donate_from_balance(
                account_name=canonical_name,
                amount_gold=amount_gold,
                message=message,
                territorial_account=territorial_account
            )
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": msg,
                    "donation": donation
                })
            else:
                return self._send_json(400, {
                    "status": "error",
                    "message": msg
                })

        # 5. Refund blocker (Capital Covenant)
        elif path in ("/api/cbm/donate/refund", "/api/cbm/refund"):
            return self._send_json(403, {
                "status": "forbidden",
                "message": "Covenant violation: Clan War Chest contributions are irrevocable, non-refundable unencumbered reserve capital and cannot be withdrawn or refunded."
            })

        # --- Developer Console Management APIs (POST) ---
        elif path == "/api/cbm/dev/keys/create":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            app_name = body.get("app_name", "").strip() or "Discord Bot"
            env = body.get("environment", "live").strip()
            scopes = body.get("scopes", "read:bank,read:members").strip()

            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to create API keys."})

            ok, secret, key_rec = db.create_api_key(acc_name, app_name, environment=env, scopes=scopes)
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"API Key created successfully for {app_name}. Store this secret safely - it will not be shown again!",
                    "api_key": secret,
                    "key_record": key_rec
                })
            else:
                return self._send_json(400, {"status": "error", "message": secret})

        elif path == "/api/cbm/dev/keys/revoke":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            key_id = body.get("key_id", "").strip()

            if not acc_name or not key_id:
                return self._send_json(400, {"status": "error", "message": "account_name and key_id are required."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to revoke API keys."})

            ok, msg = db.revoke_api_key(key_id, acc_name)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        elif path == "/api/cbm/dev/products/create":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            name = body.get("name", "").strip()
            description = body.get("description", "").strip()
            try:
                price_gold = float(body.get("price_gold", 0))
            except (ValueError, TypeError):
                price_gold = 0.0
            image_url = body.get("image_url", "").strip()
            callback_url = body.get("callback_url", "").strip()
            webhook_url = body.get("webhook_url", "").strip()

            if not acc_name or not name:
                return self._send_json(400, {"status": "error", "message": "account_name and name are required."})

            if price_gold < 100.0:
                return self._send_json(400, {"status": "error", "message": "Products must cost at least 100.00 Gold."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to create products."})

            ok, prod_or_err = db.create_product(
                owner_account=acc_name,
                name=name,
                description=description,
                price_gold=price_gold,
                image_url=image_url,
                callback_url=callback_url,
                webhook_url=webhook_url
            )
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": "Product created successfully.",
                    "product": prod_or_err
                })
            else:
                return self._send_json(400, {"status": "error", "message": prod_or_err})

        elif path == "/api/cbm/dev/products/update":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            product_id = body.get("product_id", "").strip()

            if not acc_name or not product_id:
                return self._send_json(400, {"status": "error", "message": "account_name and product_id are required."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to update products."})

            price_gold = None
            if "price_gold" in body:
                try:
                    price_gold = float(body["price_gold"])
                    if price_gold < 100.0:
                        return self._send_json(400, {"status": "error", "message": "Products must cost at least 100.00 Gold."})
                except (ValueError, TypeError):
                    return self._send_json(400, {"status": "error", "message": "Invalid price_gold."})

            ok, prod_or_err = db.update_product(
                product_id=product_id,
                owner_account=acc_name,
                name=body.get("name"),
                description=body.get("description"),
                price_gold=price_gold,
                image_url=body.get("image_url"),
                callback_url=body.get("callback_url"),
                webhook_url=body.get("webhook_url"),
                is_active=body.get("is_active")
            )
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": "Product updated successfully.",
                    "product": prod_or_err
                })
            else:
                return self._send_json(400, {"status": "error", "message": prod_or_err})

        elif path == "/api/cbm/dev/products/archive":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            product_id = body.get("product_id", "").strip()

            if not acc_name or not product_id:
                return self._send_json(400, {"status": "error", "message": "account_name and product_id are required."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to archive products."})

            ok, msg = db.archive_product(product_id, acc_name)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        elif path == "/api/cbm/dev/products/upload-image":
            import base64
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            filename = body.get("filename", "").strip()
            image_data = body.get("image_data", "").strip()

            if not acc_name or not image_data:
                return self._send_json(400, {"status": "error", "message": "account_name and image_data are required."})

            if db.has_account_pin(acc_name):
                if not pin or not db.verify_account_pin(acc_name, str(pin)):
                    return self._send_json(401, {"status": "unauthorized", "message": "Valid 6-digit PIN required to upload images."})

            if "," in image_data:
                image_data = image_data.split(",", 1)[1]

            try:
                raw_bytes = base64.b64decode(image_data)
            except Exception as e:
                return self._send_json(400, {"status": "error", "message": f"Invalid base64 image data: {e}"})

            if len(raw_bytes) > 4194304:
                return self._send_json(400, {"status": "error", "message": "Image exceeds 4MB maximum size."})

            ext = ".png"
            if filename:
                clean_ext = os.path.splitext(filename)[1].lower()
                if clean_ext in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"):
                    ext = clean_ext

            img_hash = hashlib.sha256(raw_bytes).hexdigest()[:16]
            safe_filename = f"prod_{int(time.time())}_{img_hash}{ext}"
            assets_dir = os.path.join(base_dir, "assets", "products")
            os.makedirs(assets_dir, exist_ok=True)
            target_path = os.path.join(assets_dir, safe_filename)

            with open(target_path, "wb") as f:
                f.write(raw_bytes)

            return self._send_json(200, {
                "status": "ok",
                "message": "Product image uploaded successfully.",
                "image_url": f"/assets/products/{safe_filename}"
            })

        # --- Public Scoped REST API v1 (POST Endpoints) ---
        elif path.startswith("/api/v1/"):
            # 1. Declare In-Game Donation Intent Slip (for Discord !donate command)
            if path == "/api/v1/donations/declare":
                ok, key_rec, err = self._authenticate_api_v1("write:donations")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                account_name = body.get("account_name", "").strip()
                try:
                    amount_gold = float(body.get("amount_gold", 0))
                except (ValueError, TypeError):
                    amount_gold = 0.0

                message = body.get("message", "").strip()
                ttl = int(body.get("ttl_minutes", 15))

                if not account_name or amount_gold <= 0:
                    return self._send_api_v1_json(400, {
                        "error": "bad_request",
                        "message": "account_name and positive amount_gold are required."
                    }, key_record=key_rec)

                acc = db.get_account(account_name)
                canonical_name = acc.get("account_name") if acc else account_name

                slip = db.create_pending_donation(canonical_name, amount_gold, message=message, ttl_minutes=ttl)
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": f"Donation slip registered. Send exactly {amount_gold:.2f} Gold in-game to {VAULT_ACCOUNT}.",
                    "donation_instructions": {
                        "target_vault_account": VAULT_ACCOUNT,
                        "exact_amount_gold": round(amount_gold, 2),
                        "donor_name": canonical_name,
                        "ttl_minutes": ttl,
                        "expires_at": slip.get("expires_at")
                    },
                    "slip": slip
                }, key_record=key_rec)

            # 2. Verify In-Game Player Identity (for Discord member verification)
            elif path == "/api/v1/verify/player":
                ok, key_rec, err = self._authenticate_api_v1("read:members")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                player_name = (body.get("player_name") or body.get("territorial_account") or body.get("account_name") or "").strip()
                if not player_name:
                    return self._send_api_v1_json(400, {"error": "bad_request", "message": "player_name is required."}, key_record=key_rec)

                pms = db.get_payment_methods(player_name)
                is_verified = False
                matched_cbm_user = player_name
                total_transacted = 0.0
                v_type = "NONE"

                for pm in pms:
                    if pm.get("status") == "VERIFIED":
                        is_verified = True
                        matched_cbm_user = pm.get("cbm_username", player_name)
                        total_transacted = pm.get("total_transacted_gold", 0.0)
                        v_type = pm.get("verification_type", "CREDENTIALS")
                        break

                if not is_verified:
                    conn = sqlite3.connect(db.sqlite_path)
                    cur = conn.cursor()
                    cur.execute("SELECT SUM(amount_gold), COUNT(*) FROM cbm_processed_txs WHERE sender = ? AND receiver = ?", (player_name, VAULT_ACCOUNT))
                    row = cur.fetchone()
                    conn.close()
                    if row and row[1] > 0:
                        is_verified = True
                        total_transacted = float(row[0] or 0.0)
                        v_type = "TRANSACTION_VERIFIED"

                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "player_name": player_name,
                    "verified": is_verified,
                    "verification_type": v_type,
                    "cbm_username": matched_cbm_user,
                    "total_gold_transacted": round(total_transacted, 2)
                }, key_record=key_rec)

            # 3. Create Product via API Key (Merchant / Bot integration)
            elif path == "/api/v1/products/create":
                ok, key_rec, err = self._authenticate_api_v1("write:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"))

                owner_acc = key_rec["owner_account"]
                name = body.get("name", "").strip()
                description = body.get("description", "").strip()
                try:
                    price_gold = float(body.get("price_gold", 0))
                except (ValueError, TypeError):
                    price_gold = 0.0
                image_url = body.get("image_url", "").strip()
                callback_url = body.get("callback_url", "").strip()
                webhook_url = body.get("webhook_url", "").strip()

                if not name:
                    return self._send_api_v1_json(400, {"error": "bad_request", "message": "Product name is required."}, key_record=key_rec)

                if price_gold < 100.0:
                    return self._send_api_v1_json(400, {"error": "bad_request", "message": "Products must cost at least 100.00 Gold."}, key_record=key_rec)

                ok, prod_or_err = db.create_product(
                    owner_account=owner_acc,
                    name=name,
                    description=description,
                    price_gold=price_gold,
                    image_url=image_url,
                    callback_url=callback_url,
                    webhook_url=webhook_url
                )
                if ok:
                    return self._send_api_v1_json(200, {
                        "status": "ok",
                        "api_version": "v1.0",
                        "product": prod_or_err
                    }, key_record=key_rec)
                else:
                    return self._send_api_v1_json(400, {"error": "bad_request", "message": prod_or_err}, key_record=key_rec)

            # 4. Create Product Order (15-minute checkout slip session)
            elif path == "/api/v1/products/order/create":
                product_id = body.get("product_id", "").strip()
                buyer_name = body.get("buyer_account_name", "").strip() or None
                return_url = body.get("return_url", "").strip() or None

                if not product_id:
                    return self._send_json(400, {"status": "error", "message": "product_id is required."})

                order = db.create_product_order(
                    product_id=product_id,
                    buyer_account_name=buyer_name,
                    target_vault_account=VAULT_ACCOUNT,
                    return_url=return_url
                )
                if not order:
                    return self._send_json(404, {"status": "error", "message": f"Product '{product_id}' not found or is inactive."})

                return self._send_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "order": order,
                    "payment_instructions": {
                        "target_vault_account": VAULT_ACCOUNT,
                        "exact_amount_gold": order["price_gold"],
                        "ttl_minutes": 15,
                        "expires_at": order["expires_at"]
                    }
                })

            # 5. Direct In-Game Credentials Payment
            elif path == "/api/v1/products/order/pay-direct":
                order_id = body.get("order_id", "").strip()
                tt_account = body.get("territorial_account", "").strip()
                tt_password = body.get("territorial_password", "").strip()

                if not order_id or not tt_account or not tt_password:
                    return self._send_json(400, {"status": "error", "message": "order_id, territorial_account, and territorial_password are required."})

                order = db.get_product_order(order_id)
                if not order:
                    return self._send_json(404, {"status": "error", "message": f"Order '{order_id}' not found."})

                if order.get("status") == "FULFILLED":
                    return self._send_json(200, {
                        "status": "ok",
                        "message": "Order is already fulfilled.",
                        "order": order,
                        "verification_token": order.get("verification_token")
                    })

                if order.get("status") != "PENDING":
                    return self._send_json(400, {"status": "error", "message": f"Order status is {order.get('status')} and cannot be paid."})

                # Check expiration
                exp_str = order.get("expires_at", "")
                if exp_str:
                    try:
                        clean_exp = exp_str.replace("T", " ")[:19]
                        exp_ts = time.mktime(time.strptime(clean_exp, "%Y-%m-%d %H:%M:%S"))
                        if time.time() > exp_ts:
                            conn = sqlite3.connect(db.sqlite_path)
                            c = conn.cursor()
                            c.execute("UPDATE cbm_product_orders SET status = 'EXPIRED' WHERE order_id = ?", (order_id,))
                            conn.commit()
                            conn.close()
                            return self._send_json(400, {"status": "error", "message": "This order slip has expired. Please create a new order."})
                    except Exception:
                        pass

                # Execute gold transfer via TerritorialGoldClient
                client = TerritorialGoldClient(account_name=tt_account, password=tt_password, timeout=12.0)
                amount_int = int(round(order["price_gold"]))
                tx_resp = client.send_gold(target_account_name=VAULT_ACCOUNT, amount=amount_int)

                if tx_resp.get("status") != "ok":
                    err_msg = tx_resp.get("message") or tx_resp.get("status") or "In-game gold transfer failed."
                    return self._send_json(400, {"status": "error", "message": f"Territorial.io transfer failed: {err_msg}"})

                # Capture transaction reference & fulfill
                tx_ref = f"tt_direct_{order_id[:8]}_{int(time.time())}"
                ok, ful_err = db.fulfill_product_order(order_id=order_id, tx_hash=tx_ref, sender=tt_account)
                if not ok:
                    return self._send_json(400, {"status": "error", "message": ful_err})

                updated_order = db.get_product_order(order_id)
                invalidate_caches()
                return self._send_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": "Payment verified and order fulfilled successfully.",
                    "order": updated_order,
                    "verification_token": updated_order.get("verification_token")
                })

            # 6. Pay with CBM Member Balance
            elif path == "/api/v1/products/order/pay-balance":
                order_id = body.get("order_id", "").strip()
                cbm_username = body.get("cbm_username", "").strip()
                pin = body.get("pin", "")
                password = body.get("password", "")

                if not order_id or not cbm_username:
                    return self._send_json(400, {"status": "error", "message": "order_id and cbm_username are required."})

                order = db.get_product_order(order_id)
                if not order:
                    return self._send_json(404, {"status": "error", "message": f"Order '{order_id}' not found."})

                if order.get("status") == "FULFILLED":
                    return self._send_json(200, {
                        "status": "ok",
                        "message": "Order is already fulfilled.",
                        "order": order,
                        "verification_token": order.get("verification_token")
                    })

                if order.get("status") != "PENDING":
                    return self._send_json(400, {"status": "error", "message": f"Order status is {order.get('status')} and cannot be paid."})

                # Verify buyer auth
                raw_acc = db._get_account_raw(cbm_username)
                if not raw_acc:
                    return self._send_json(404, {"status": "not_found", "message": f"CBM Member '{cbm_username}' not found."})
                canonical_name = raw_acc.get("account_name", cbm_username)

                if db.has_account_pin(canonical_name):
                    if not pin or not db.verify_account_pin(canonical_name, str(pin)):
                        rate_limiter.record_auth_failure(canonical_name)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid 6-digit CBM Access PIN."})
                    rate_limiter.record_auth_success(canonical_name)
                elif db.has_account_password(canonical_name):
                    auth_pwd = password or pin
                    if not auth_pwd or not db.verify_account_password(canonical_name, auth_pwd):
                        rate_limiter.record_auth_failure(canonical_name)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid password."})
                    rate_limiter.record_auth_success(canonical_name)

                # Check buyer balance
                buyer_bal_cents = raw_acc.get("deposited_cents", 0)
                price_cents = order.get("price_cents", int(round(order.get("price_gold", 0) * 100)))
                if buyer_bal_cents < price_cents:
                    return self._send_json(400, {
                        "status": "error",
                        "message": f"Insufficient member balance. You have {buyer_bal_cents / 100.0:.2f} Gold, but this product costs {price_cents / 100.0:.2f} Gold."
                    })

                # Deduct from buyer balance
                new_buyer_bal = buyer_bal_cents - price_cents
                now_ts = time.time()
                tx_hash = f"cbm_bal_{order_id[:8]}_{int(now_ts)}"
                conn = db.get_write_connection()
                cur = conn.cursor()
                cur.execute(
                    "UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?",
                    (new_buyer_bal, now_ts, canonical_name)
                )
                cur.execute(
                    """
                    INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                    VALUES (?, 'PRODUCT_PURCHASE', ?, ?, ?, ?, ?)
                    """,
                    (canonical_name, -price_cents, new_buyer_bal, tx_hash, f"Purchased product {order.get('product_id')}", now_ts)
                )
                conn.commit()
                conn.close()

                if db.use_supabase:
                    try:
                        db._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{canonical_name}", body={"deposited_cents": new_buyer_bal})
                        db._sb_request("cbm_ledger", method="POST", body={
                            "account_name": canonical_name,
                            "entry_type": "PRODUCT_PURCHASE",
                            "amount_cents": -price_cents,
                            "balance_after_cents": new_buyer_bal,
                            "tx_hash": tx_hash,
                            "notes": f"Purchased product {order.get('product_id')}"
                        })
                    except Exception:
                        pass

                # Fulfill product order (credits 50% to seller, 50% to reserve cushion)
                ok, ful_err = db.fulfill_product_order(order_id=order_id, tx_hash=tx_hash, sender=canonical_name)
                if not ok:
                    return self._send_json(400, {"status": "error", "message": ful_err})

                updated_order = db.get_product_order(order_id)
                invalidate_caches()
                return self._send_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": "Order paid from CBM member balance and fulfilled successfully.",
                    "order": updated_order,
                    "verification_token": updated_order.get("verification_token")
                })

            # 7. Cryptographic Verification of Product Order Token
            elif path in ("/api/v1/products/verify", "/api/v1/products/order/verify"):
                token = body.get("token") or body.get("cbm_token") or ""
                order_id = body.get("order_id", "").strip()

                if not token or not order_id:
                    return self._send_json(400, {"status": "error", "valid": False, "message": "token and order_id are required."})

                is_valid, order_or_err = db.verify_product_order_token(token=token, order_id=order_id)
                if is_valid:
                    return self._send_json(200, {
                        "status": "ok",
                        "api_version": "v1.0",
                        "valid": True,
                        "order": order_or_err
                    })
                else:
                    return self._send_json(400, {
                        "status": "error",
                        "api_version": "v1.0",
                        "valid": False,
                        "message": order_or_err
                    })

            return self._send_json(404, {"error": "endpoint_not_found", "message": f"API v1 route '{path}' does not exist."})

        # ---- Referral Program Endpoints ----
        elif path == "/api/cbm/referral/stats":
            account_name = (body.get("account_name") or "").strip()
            if not account_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})
            stats = db.get_referral_stats(account_name) if hasattr(db, "get_referral_stats") else {}
            # Build invite link
            import urllib.parse
            ref_code = account_name
            invite_link = f"/register?ref={urllib.parse.quote(ref_code)}"
            return self._send_json(200, {
                "status": "ok",
                "account": account_name,
                "referral_stats": stats,
                "invite_link": invite_link,
                "reward_per_qualified_referral_gold": 500,
                "threshold": {
                    "invitee_must_donate_gold": 200,
                    "invitee_must_deposit_gold": 2000
                }
            })

        elif path == "/api/cbm/referral/register":
            inviter_account = (body.get("inviter_account") or body.get("ref") or "").strip()
            invitee_account = (body.get("invitee_account") or body.get("account_name") or "").strip()
            if not inviter_account or not invitee_account:
                return self._send_json(400, {"status": "error", "message": "inviter_account and invitee_account are required."})
            ok = db.register_referral(inviter_account, invitee_account) if hasattr(db, "register_referral") else False
            if ok:
                return self._send_json(200, {"status": "ok", "message": f"Referral link established: {inviter_account} -> {invitee_account}"})
            else:
                return self._send_json(409, {"status": "conflict", "message": "Referral already exists, is a self-referral, or invitee is already referred."})

        else:
            return self._send_json(404, {"status": "error", "message": "Not found"})

    def log_message(self, format, *args):
        # Suppress routine health check log spam
        pass

class CBMThreadPoolServer(HTTPServer):
    """
    High-concurrency, bounded thread pool HTTP server designed for CPU-constrained environments.
    Limits execution to at most 16 worker threads (configurable via MAX_SERVER_WORKERS),
    eliminating thread explosion and context-switch thrashing while effortlessly servicing 100+ concurrent clients.
    """
    request_queue_size = 256
    allow_reuse_address = True

    def __init__(self, server_address, RequestHandlerClass, max_workers=None):
        super().__init__(server_address, RequestHandlerClass)
        if max_workers is None:
            max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 16))
        self.executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="cbm_worker")

    def process_request(self, request, client_address):
        self.executor.submit(self._process_request_thread, request, client_address)

    def _process_request_thread(self, request, client_address):
        try:
            try:
                request.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            except Exception:
                pass
            self.finish_request(request, client_address)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, socket.timeout):
            pass
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)

    def handle_error(self, request, client_address):
        exc_type, exc_val, _ = sys.exc_info()
        if exc_type in (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, socket.timeout):
            return
        super().handle_error(request, client_address)

    def server_close(self):
        super().server_close()
        self.executor.shutdown(wait=False)

_SERVER_INSTANCE = None

def run_http_server():
    global _SERVER_INSTANCE
    max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 16))
    server = CBMThreadPoolServer(("0.0.0.0", PORT), CBMHealthHandler, max_workers=max_workers)
    _SERVER_INSTANCE = server
    print(f"[+] CBM Bounded ThreadPool Server ({max_workers} workers, backlog 256) active on 0.0.0.0:{PORT}")
    print(f"    - Direct URL: {WISPBYTE_SERVER_URL}")
    print(f"    - Subdomain:  http://{WISPBYTE_SUBDOMAIN}/")
    server.serve_forever()

def main():
    print("=" * 68)
    print("  Clan Bank Manager (CBM) - Wispbyte Master Runtime")
    print(f"  Target Vault Account:    {VAULT_ACCOUNT}")
    print(f"  Allocated Server Port:   {PORT}")
    print(f"  Direct Server URL:       {WISPBYTE_SERVER_URL}")
    print(f"  Configured Subdomain:    http://{WISPBYTE_SUBDOMAIN}/")
    print(f"  Ledger Polling Interval: {POLL_INTERVAL}s")
    print("=" * 68)

    # 0. Pre-load static assets sequentially in main thread (eliminates startup thread thrashing)
    load_static_cache()

    # 1. Start HTTP health server in background thread
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    # 2. Start deposit ingestion worker in background thread
    daemon_thread = threading.Thread(target=deposit_daemon.run, daemon=True)
    daemon_thread.start()

    # 3. Start Cloudflare Tunnel (Zero-Trust Ingress)
    if tunnel_mgr:
        tunnel_mgr.start()

    # 4. Setup graceful signal handling
    def handle_signal(sig, frame):
        print("\n[!] Received shutdown signal. Stopping CBM daemon and tunnel...")
        deposit_daemon.stop()
        if tunnel_mgr:
            tunnel_mgr.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    print("[OK] CBM Master Runtime active and operational. Monitoring incoming ledger transfers.")

    # Keep main thread alive and run background loan liveness & covenant audits
    last_loan_audit = 0.0
    while True:
        now = time.time()
        if (now - last_loan_audit) > 600.0:  # Check every 10 minutes
            last_loan_audit = now
            try:
                db.audit_loan_credential_liveness()
            except Exception as e:
                print(f"[!] Background loan audit error: {e}")
        time.sleep(30)

if __name__ == "__main__":
    main()
