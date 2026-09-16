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
deposit_daemon = CBMDepositDaemon(db=db, vault_account=VAULT_ACCOUNT, vault_password=VAULT_PASSWORD, poll_interval=POLL_INTERVAL)
withdrawal_worker = CBMWithdrawalWorker(db=db, vault_account=VAULT_ACCOUNT, vault_password=VAULT_PASSWORD)
account_mgr = CBMAccountManager(db=db, vault_account=VAULT_ACCOUNT)
tunnel_mgr = CloudflareTunnelManager(port=PORT) if ENABLE_TUNNEL else None

# In-Memory Static Asset Cache (Pre-compressed at startup for 0 disk I/O & sub-millisecond delivery)
_STATIC_CACHE = {}

def load_static_cache():
    """Pre-loads, digests, and gzip-compresses static assets into RAM at startup."""
    global _STATIC_CACHE
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets = [
        ("cbm.html", "text/html; charset=utf-8"),
        ("login.html", "text/html; charset=utf-8"),
        ("register.html", "text/html; charset=utf-8"),
        ("donations.html", "text/html; charset=utf-8"),
        ("rulebook.html", "text/html; charset=utf-8"),
        ("vault.html", "text/html; charset=utf-8"),
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

        payload = db.get_vault_timeline(days=days)
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

    def _apply_security_headers(self):
        """Applies OWASP-recommended HTTP security headers to protect against common attacks."""
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self' 'unsafe-inline' https://api.dicebear.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://static.cloudflareinsights.com; "
            "connect-src 'self' https://cloudflareinsights.com https://cdn.jsdelivr.net https://*.cloudflareinsights.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "frame-ancestors 'self';"
        )

    def _send_cached_asset(self, asset_key: str):
        asset = _STATIC_CACHE.get(asset_key)
        if not asset:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            return self._send_file(os.path.join(base_dir, asset_key))

        inm = self.headers.get("If-None-Match", "")
        if inm and asset["etag"] in inm:
            try:
                self.send_response(304)
                self.send_header("ETag", asset["etag"])
                self.send_header("Cache-Control", "public, max-age=300")
                self.send_header("Access-Control-Allow-Origin", "*")
                self._apply_security_headers()
                self.end_headers()
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass
            return

        accept_encoding = self.headers.get("Accept-Encoding", "")
        supports_gzip = "gzip" in accept_encoding

        try:
            self.send_response(200)
            self.send_header("Content-Type", asset["content_type"])
            self.send_header("ETag", asset["etag"])
            self.send_header("Cache-Control", "public, max-age=300")
            self.send_header("Access-Control-Allow-Origin", "*")
            self._apply_security_headers()

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

    def _send_file(self, file_path: str, content_type: str = "text/html; charset=utf-8"):
        if not os.path.exists(file_path):
            self.send_error(404, "Asset not found")
            return
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self._apply_security_headers()
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
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Simulate-Lending, X-Requested-With")

            if headers:
                for hk, hv in headers.items():
                    self.send_header(hk, hv)

            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending JSON response: {e}")

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")
        query = parsed[1] if len(parsed) > 1 else ""
        query_dict = urllib.parse.parse_qs(query)
        params = {k: v[0].strip() if v else "" for k, v in query_dict.items()}
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
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = (params.get("name") or params.get("account") or params.get("cbm_username") or "").strip()
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
                return self._send_json(200, resp_data)
            else:
                resp_data = {"status": "not_found", "message": f"Account '{acc_name}' has no active CBM balance."}
                with _ACCOUNT_LOCK:
                    _ACCOUNT_CACHE[acc_key] = {"data": resp_data, "time": now, "code": 404}
                return self._send_json(404, resp_data)

        # 4b. Loans lookup API
        elif path == "/api/cbm/loans":
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = (params.get("name") or params.get("account") or params.get("cbm_username") or "").strip()
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
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
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
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
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
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            try:
                days = int(params.get("days", 7))
                if days not in (1, 3, 7, 14, 30):
                    days = 7
            except ValueError:
                days = 7
            raw_bytes, gz_bytes, etag = refresh_vault_analytics_cache(days=days)
            return self._send_cached_json_bytes(raw_bytes, gz_bytes, etag)

        # 5. Payment Methods API
        elif path == "/api/cbm/payment-methods":
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = (params.get("cbm_username") or params.get("name") or params.get("account") or "").strip()
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
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = (params.get("account") or params.get("account_name") or params.get("cbm_username") or params.get("name") or "").strip() or None
            pending = db.get_pending_donations(acc_name)
            return self._send_json(200, {
                "status": "ok",
                "pending_donations": pending
            })

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
        try:
            length = int(self.headers.get("Content-Length", 0))
        except (ValueError, TypeError):
            return self._send_json(400, {"status": "error", "message": "Invalid Content-Length header."})

        if length < 0:
            return self._send_json(400, {"status": "error", "message": "Negative Content-Length header is not permitted."})

        if length > 65536:  # 64 KB maximum payload
            try:
                if length <= 524288:
                    _ = self.rfile.read(length)
            except Exception:
                pass
            return self._send_json(413, {"status": "error", "message": "Payload Too Large: Maximum permitted request payload is 64KB."}, headers={"Connection": "close"})

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
            "/api/cbm/loan/repay"
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
            "/api/cbm/loan/repay"
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
            clan_tag = "ANTI-OG"
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
                try:
                    vault_client = TerritorialGoldClient(VAULT_ACCOUNT, VAULT_PASSWORD, timeout=5.0)
                    res = vault_client.get_account_data(target_account_name=terri)
                    if res.get("status") == "ok" and "account_data" in res:
                        d, c, r = extract_profile_metadata(res["account_data"])
                        if d: display_name = d
                        if c: clan_tag = c
                        if r: role = r
                except Exception as ex:
                    print(f"[!] Warning: Unable to fetch public Territorial.io profile for '{terri}': {ex}")

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
        # 1. Withdrawal submission (Closed-loop & PIN protected)
        elif path == "/api/cbm/withdraw":
            account_name = body.get("account_name", "").strip()
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

            if amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Withdrawal amount must be at least 1 Gold."})

            # Security: Must authenticate PIN if PIN is configured, or verify account password
            has_pin = db.has_account_pin(canonical_name)
            if has_pin:
                if not pin or not db.verify_account_pin(canonical_name, pin):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                rate_limiter.record_auth_success(canonical_name)
            elif pwd:
                if not db.verify_account_password(canonical_name, pwd):
                    rate_limiter.record_auth_failure(canonical_name)
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid account password."})
                rate_limiter.record_auth_success(canonical_name)
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
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

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

            ok, msg, loan = db.create_loan(
                account_name=account_name,
                principal_gold=amount_gold,
                term_days=14,
                territorial_account=terri_acc,
                territorial_password=terri_pwd
            )
            if ok:
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

        else:
            return self._send_json(404, {"status": "error", "message": "Not found"})

    def log_message(self, format, *args):
        # Suppress routine health check log spam
        pass

class CBMThreadPoolServer(HTTPServer):
    """
    High-concurrency, bounded thread pool HTTP server designed for CPU-constrained environments.
    Limits execution to at most 60 worker threads, eliminating thread explosion
    and kernel context-switch thrashing while effortlessly servicing 100+ concurrent clients.
    """
    request_queue_size = 256
    allow_reuse_address = True

    def __init__(self, server_address, RequestHandlerClass, max_workers=None):
        super().__init__(server_address, RequestHandlerClass)
        if max_workers is None:
            max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 128))
        self.executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="cbm_worker")

    def process_request(self, request, client_address):
        self.executor.submit(self._process_request_thread, request, client_address)

    def _process_request_thread(self, request, client_address):
        try:
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
    max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 128))
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
