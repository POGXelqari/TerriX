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
import hmac
import socket
import select
import struct
import sqlite3
import urllib.parse
import base64
import gc
import re
try:
    import jwt
except ImportError:
    jwt = None
from concurrent.futures import ThreadPoolExecutor
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Optional, Dict, Tuple, Any, List, Union

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
from chat_engine import chat_engine, CUSTOM_STICKERS, check_message_safety, is_toxic_content, verdict_cache
import crypto_util
from crypto_util import create_session_token, verify_session_token
from ad_engine import CBMSponsorshipEngine
from enterprise_economy import CBMEconomicEngine
from oidc_client import OIDCClient, OIDCValidationError
from ai_service import ai_service, NvidiaKimiService, NvidiaAIError, load_cbm_env

load_cbm_env()

PORT = int(os.environ.get("SERVER_PORT") or os.environ.get("PORT") or 10093)
VAULT_ACCOUNT = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
VAULT_PASSWORD = os.environ.get("CBM_VAULT_PASSWORD", "")
POLL_INTERVAL = float(os.environ.get("CBM_POLL_INTERVAL", 30.0))
ENABLE_TUNNEL = os.environ.get("ENABLE_CLOUDFLARE_TUNNEL", "true").lower() in ("true", "1", "yes")
WISPBYTE_SERVER_URL = os.environ.get("WISPBYTE_SERVER_URL", f"http://78.154.103.45:{PORT}/")
WISPBYTE_SUBDOMAIN = os.environ.get("WISPBYTE_SUBDOMAIN", "cbm.wispbyte.org")
CREDIT_PER_AI_REQUEST = float(os.environ.get("CREDIT_PER_AI_REQUEST", "1.00"))

db = CBMDatabase()
loan_engine = CBMLoanEngine()

sponsorship_engine = CBMSponsorshipEngine()
economic_engine = CBMEconomicEngine()
oidc_client = OIDCClient()
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
CANONICAL_REMOTE_ASSETS = {
    "hello-kitty-pattern.png": {
        "sub": "patterns",
        "mime": "image/png",
        "urls": [
            "https://raw.githubusercontent.com/POGXelqari/TerriX/main/client/assets/patterns/hello-kitty-pattern.png",
            "https://raw.githubusercontent.com/POGXelqari/TerriX/master/client/assets/patterns/hello-kitty-pattern.png"
        ]
    },
    "poland-pattern.avif": {
        "sub": "products",
        "mime": "image/avif",
        "urls": [
            "https://raw.githubusercontent.com/POGXelqari/TerriX/main/client/assets/patterns/poland-pattern.avif",
            "https://raw.githubusercontent.com/POGXelqari/TerriX/master/client/assets/patterns/poland-pattern.avif"
        ]
    }
}

def _fetch_canonical_asset_background(fname: str, meta: dict):
    def _worker():
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data = None
        for url in meta.get("urls", []):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "CBM-AssetManager/2.0"})
                with urllib.request.urlopen(req, timeout=8.0) as resp:
                    if resp.status == 200:
                        data = resp.read()
                        if data and len(data) > 0:
                            break
            except Exception:
                pass

        if data and len(data) > 0:
            for sub in ("patterns", "products"):
                p = os.path.join(base_dir, "assets", sub, fname)
                try:
                    with open(p, "wb") as f:
                        f.write(data)
                except Exception:
                    pass
            try:
                if db:
                    db.save_asset(fname, meta["sub"], meta["mime"], data)
            except Exception:
                pass
            print(f"[+] Programmatically initialized canonical asset: {fname} ({len(data):,} bytes)")

    t = threading.Thread(target=_worker, daemon=True)
    t.start()

def ensure_programmatic_assets():
    """
    Programmatically initializes all required asset directories and synchronizes
    both database-stored assets and canonical fallback textures.
    Guarantees that headless/remote hosting environments without repo connections
    or pre-uploaded asset subdirectories function autonomously.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dirs = [
        os.path.join(base_dir, "assets"),
        os.path.join(base_dir, "assets", "products"),
        os.path.join(base_dir, "assets", "patterns"),
        os.path.join(base_dir, "ephemeral_chat_media"),
    ]
    for d in dirs:
        try:
            os.makedirs(d, exist_ok=True)
        except Exception as e:
            print(f"[!] Could not create directory {d}: {e}")

    # 1. Restore any DB-backed assets onto disk if missing
    try:
        if db:
            stored_assets = db.get_all_assets()
            for asset in stored_assets:
                fname = asset["filename"]
                sub = asset.get("subfolder", "products")
                target = os.path.join(base_dir, "assets", sub, fname)
                if not os.path.isfile(target):
                    try:
                        with open(target, "wb") as f:
                            f.write(asset["data"])
                        alt_sub = "patterns" if sub == "products" else "products"
                        alt_target = os.path.join(base_dir, "assets", alt_sub, fname)
                        if not os.path.isfile(alt_target):
                            with open(alt_target, "wb") as f:
                                f.write(asset["data"])
                    except Exception as e:
                        print(f"[!] Error restoring asset {fname} to disk: {e}")
    except Exception as e:
        pass

    # 2. Check canonical assets; sync local disk with DB or fetch remotely if completely missing
    for fname, meta in CANONICAL_REMOTE_ASSETS.items():
        pat_path = os.path.join(base_dir, "assets", "patterns", fname)
        prod_path = os.path.join(base_dir, "assets", "products", fname)
        found_data = None

        if os.path.isfile(pat_path):
            try:
                with open(pat_path, "rb") as f:
                    found_data = f.read()
            except Exception:
                pass
        elif os.path.isfile(prod_path):
            try:
                with open(prod_path, "rb") as f:
                    found_data = f.read()
            except Exception:
                pass

        if found_data and len(found_data) > 0:
            if not os.path.isfile(pat_path):
                try:
                    with open(pat_path, "wb") as f:
                        f.write(found_data)
                except Exception:
                    pass
            if not os.path.isfile(prod_path):
                try:
                    with open(prod_path, "wb") as f:
                        f.write(found_data)
                except Exception:
                    pass
            try:
                if db and not db.get_asset(fname):
                    db.save_asset(fname, meta["sub"], meta["mime"], found_data)
            except Exception:
                pass
        else:
            _fetch_canonical_asset_background(fname, meta)

_STATIC_CACHE = {}

def load_static_cache():
    """Pre-loads, digests, and gzip-compresses static assets into RAM at startup."""
    global _STATIC_CACHE
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Programmatically initialize all directories and asset backups
    ensure_programmatic_assets()

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
        ("cbm-logo-new.png", "image/png"),
        ("cbm-sso-banner.png", "image/png"),
        ("total-vault-assets-icon.png", "image/png"),
        ("unencumbered-reserves-icon.png", "image/png"),
        ("member-liabilities-icon.png", "image/png"),
        ("solvency-ratio-icon.png", "image/png"),
        ("sponsorship-available-icon1.png", "image/png"),
        ("welcome-back-login-icon.png", "image/png"),
        ("you-were-invited-invitation-image-asset.png", "image/png"),
        ("top-donors-icon.png", "image/png"),
        ("developer-platform-icon.png", "image/png"),
        ("painsel-pointing-left.png", "image/png"),
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

def _mask_account_name(name: str) -> str:
    if not name:
        return ""
    name_str = str(name).strip()
    if name_str.upper() == VAULT_ACCOUNT.upper():
        return name_str
    if len(name_str) <= 2:
        return name_str[0] + "*"
    if len(name_str) <= 4:
        return name_str[0] + "**" + name_str[-1]
    return name_str[:2] + "***" + name_str[-1]

def refresh_status_cache():
    """Thread-safe, stampede-protected refresh of status JSON bytes and gzip buffer."""
    global _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG, _STATUS_CACHE_TIME
    with _STATUS_LOCK:
        now = time.time()
        if _STATUS_CACHE_BYTES and (now - _STATUS_CACHE_TIME) < _STATUS_CACHE_TTL:
            return _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG

        try:
            treasury = db.get_treasury()
            vault_cents = treasury.get("vault_total_gold_cents", 0)
            metrics = db._calculate_treasury_metrics(vault_cents)
            vault_gold = metrics["vault_total_gold"]
            liab_gold = metrics["member_liabilities_gold"]
            reserves_gold = metrics["bank_reserves_gold"]
            facility = loan_engine.evaluate_lending_facility(metrics["bank_reserves_cents"])
            recent_txs = db.get_recent_transactions(limit=15)
            masked_txs = []
            for tx in recent_txs:
                t = dict(tx)
                s = t.get("sender") or ""
                r = t.get("receiver") or ""
                c = t.get("credited_account") or ""
                if s and s.upper() != VAULT_ACCOUNT.upper():
                    t["sender"] = _mask_account_name(s)
                if r and r.upper() != VAULT_ACCOUNT.upper():
                    t["receiver"] = _mask_account_name(r)
                if c and c.upper() != VAULT_ACCOUNT.upper():
                    t["credited_account"] = _mask_account_name(c)
                masked_txs.append(t)
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
                "community": db.get_community_metrics(),
                "top_donors": db.get_top_donors(limit=5),
                "recent_transactions": masked_txs
            }
            raw_bytes = json.dumps(payload).encode("utf-8")
            etag = f'"{hashlib.sha256(raw_bytes).hexdigest()[:16]}"'
            gz_bytes = gzip.compress(raw_bytes, compresslevel=5)
            _STATUS_CACHE_BYTES = raw_bytes
            _STATUS_CACHE_GZIP = gz_bytes
            _STATUS_CACHE_ETAG = etag
            _STATUS_CACHE_TIME = now
            return raw_bytes, gz_bytes, etag
        except Exception as ex:
            print(f"[!] refresh_status_cache fallback notice: {ex}")
            if _STATUS_CACHE_BYTES:
                return _STATUS_CACHE_BYTES, _STATUS_CACHE_GZIP, _STATUS_CACHE_ETAG
            fallback = {
                "status": "ok",
                "service": "Clan Bank Manager (CBM)",
                "runtime": "Wispbyte Python",
                "vault_account": VAULT_ACCOUNT,
                "treasury": {
                    "vault_total_gold": 0.0,
                    "member_liabilities_gold": 0.0,
                    "vault_excess_gold": 0.0,
                    "bank_reserves_gold": 0.0,
                    "solvency_ratio_percent": 100.0
                },
                "community": {
                    "total_members": 0,
                    "active_depositors": 0,
                    "total_transactions": 0,
                    "total_volume_gold": 0.0,
                    "volume_24h_gold": 0.0
                },
                "top_donors": [],
                "recent_transactions": []
            }
            raw_b = json.dumps(fallback).encode("utf-8")
            return raw_b, gzip.compress(raw_b, compresslevel=5), '"fallback"'

def refresh_donors_cache(limit: int = 10):
    """Thread-safe, stampede-protected refresh of donors JSON bytes and gzip buffer."""
    global _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP, _DONORS_CACHE_ETAG, _DONORS_CACHE_TIME
    with _DONORS_LOCK:
        now = time.time()
        if _DONORS_CACHE_BYTES and (now - _DONORS_CACHE_TIME) < _DONORS_CACHE_TTL:
            return _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP, _DONORS_CACHE_ETAG

        try:
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
        except Exception as ex:
            print(f"[!] refresh_donors_cache fallback notice: {ex}")
            if _DONORS_CACHE_BYTES:
                return _DONORS_CACHE_BYTES, _DONORS_CACHE_GZIP, _DONORS_CACHE_ETAG
            fallback = {
                "status": "ok",
                "total_donated_gold": 0.0,
                "top_donors": [],
                "recent_donations": []
            }
            raw_b = json.dumps(fallback).encode("utf-8")
            return raw_b, gzip.compress(raw_b, compresslevel=5), '"fallback"'

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

# -----------------------------------------------------------------------------
# First-Party Authorized Origins Whitelist & Domain Origin Policies
# -----------------------------------------------------------------------------
AUTHORIZED_FIRST_PARTY_ORIGINS = {
    "https://cbm.wispbyte.org",
    "http://cbm.wispbyte.org",
    "http://78.154.103.45:10093",
    "http://78.154.103.45",
    "http://localhost:10093",
    "http://127.0.0.1:10093",
    "http://localhost:3000",
    "http://localhost:8080"
}

def is_authorized_first_party_origin(origin: str) -> bool:
    if not origin:
        return False
    clean = origin.strip().rstrip("/").lower()
    if clean in AUTHORIZED_FIRST_PARTY_ORIGINS:
        return True
    try:
        parsed = urllib.parse.urlparse(clean)
        host = parsed.hostname or ""
        if host in ("localhost", "127.0.0.1", "78.154.103.45"):
            return True
        if host == "cbm.wispbyte.org" or host.endswith(".wispbyte.org"):
            return True
    except Exception:
        pass
    return False

def is_internal_cbm_function(path: str) -> bool:
    """
    Identifies internal first-party Clan Bank Manager operations (member registration,
    login, PIN lifecycle, private account telemetry, loans, withdrawals, deposits,
    treasury sync, payment methods, and governance elections).
    These endpoints enforce strict Domain Origin Policy.
    """
    p = path.split("?")[0].rstrip("/")
    if p in ("/api/auth/oidc/callback", "/api/auth/oidc/login"):
        return False
    if (
        p.startswith("/api/cbm/auth/")
        or (p.startswith("/api/auth/") and not p.startswith("/api/oauth/"))
        or p == "/api/cbm/account"
        or p == "/api/cbm/profile"
        or p == "/api/cbm/withdraw"
        or p.startswith("/api/cbm/loan")
        or p in ("/api/cbm/donate", "/api/cbm/donations/slip-status")
        or p.startswith("/api/cbm/payment-methods")
        or p == "/api/cbm/link-payment-method"
        or p.startswith("/api/cbm/referral")
        or p == "/api/cbm/treasury/sync"
        or p.startswith("/api/cbm/election")
        or p.startswith("/api/cbm/votes")
    ):
        return True
    return False

def is_cors_bypassed_endpoint(path: str) -> bool:
    """
    Returns True for any API endpoint or public asset that is NOT an internal CBM function,
    including all endpoints documented in developer.html, API v1 routes, In-Game Chat SDK,
    OAuth 2.0 / OIDC discovery, developer key/client management, public ads, and widgets.
    These endpoints bypass CORS origin validation and emit permissive cross-origin headers.
    """
    p = path.split("?")[0].rstrip("/")
    if is_internal_cbm_function(p):
        return False
    if p.startswith("/api/v1/") or p.startswith("/api/oauth/") or p.startswith("/.well-known/"):
        return True
    if p.startswith("/api/cbm/"):
        return True
    if p in (
        "/status",
        "/health",
        "/widget.js",
        "/widget.html",
        "/cbm-logo.png",
        "/cbm-logo-new.png",
        "/cbm-sso-banner.png",
        "/total-vault-assets-icon.png",
        "/unencumbered-reserves-icon.png",
        "/member-liabilities-icon.png",
        "/solvency-ratio-icon.png",
        "/sponsorship-available-icon1.png",
        "/welcome-back-login-icon.png",
        "/you-were-invited-invitation-image-asset.png",
        "/top-donors-icon.png",
        "/developer-platform-icon.png",
        "/painsel-pointing-left.png",
    ) or p.startswith("/assets/"):
        return True
    return False

class CBMHealthHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 3.0  # Fast 3s socket recycling prevents keepalive worker thread starvation
    MAX_KEEPALIVE_REQUESTS = 50

    def handle_one_request(self):
        self._req_count = getattr(self, "_req_count", 0) + 1
        if self._req_count >= self.MAX_KEEPALIVE_REQUESTS:
            self.close_connection = True
        res = super().handle_one_request()
        # Fast thread recycling: If no further pipelined data is immediately waiting
        # in the socket buffer, close the connection immediately.
        # This prevents worker threads from blocking for 3.0s in rfile.readline(),
        # eliminating thread pool exhaustion (timeouts) and socket timeout resets.
        if not self.close_connection:
            try:
                r, _, _ = select.select([self.connection], [], [], 0.0)
                if not r:
                    self.close_connection = True
            except Exception:
                self.close_connection = True
        return res

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
        if getattr(self, "close_connection", False):
            self.send_header("Connection", "close")
        else:
            req_left = max(1, self.MAX_KEEPALIVE_REQUESTS - getattr(self, "_req_count", 0))
            self.send_header("Connection", "keep-alive")
            self.send_header("Keep-Alive", f"timeout=3, max={req_left}")

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
                self.send_header("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=60")
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
            self.send_header("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=60")
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
            try:
                self.wfile.flush()
            except Exception:
                pass
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
                self.send_header("Cache-Control", "public, max-age=10, s-maxage=10, stale-while-revalidate=5")
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
            req_path = getattr(self, "path", "")
            origin = self.headers.get("Origin", "").strip()
            if is_cors_bypassed_endpoint(req_path):
                if origin and origin != "null":
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Access-Control-Allow-Credentials", "true")
                    self.send_header("Vary", "Origin")
                else:
                    self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-API-Key, X-CBM-PIN, X-CBM-Session, X-CBM-Environment, X-Requested-With, Idempotency-Key")
            else:
                if origin and origin != "null" and is_authorized_first_party_origin(origin):
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Access-Control-Allow-Credentials", "true")
                    self.send_header("Vary", "Origin")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Session, X-CBM-PIN, X-Requested-With")
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
            try:
                self.wfile.flush()
            except Exception:
                pass
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
            try:
                self.wfile.flush()
            except Exception:
                pass
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending file {file_path}: {e}")

    def _enforce_domain_origin_policy(self) -> Tuple[bool, Optional[str]]:
        """
        Enforces Domain Origin Policy on internal first-party endpoints (/api/cbm/*, /api/auth/*).
        Rejects cross-origin requests from unauthorized origins with 403 Forbidden.
        """
        origin = self.headers.get("Origin", "").strip()
        if origin:
            if not is_authorized_first_party_origin(origin):
                return False, f"Cross-origin request from '{origin}' blocked by Domain Origin Policy."
            return True, None

        # Check Sec-Fetch-Site on state-changing requests
        sec_fetch_site = self.headers.get("Sec-Fetch-Site", "").lower()
        if sec_fetch_site == "cross-site":
            return False, "Cross-site request blocked by Domain Origin Policy."

        # Check Referer on state-changing requests if present
        cmd = getattr(self, "command", "")
        if cmd in ("POST", "PUT", "DELETE"):
            referer = self.headers.get("Referer", "").strip()
            if referer:
                try:
                    ref_parsed = urllib.parse.urlparse(referer)
                    ref_origin = f"{ref_parsed.scheme}://{ref_parsed.netloc}"
                    if not is_authorized_first_party_origin(ref_origin):
                        return False, f"Cross-origin Referer '{ref_origin}' blocked by Domain Origin Policy."
                except Exception:
                    return False, "Malformed Referer header blocked by Domain Origin Policy."

        return True, None

    def _send_json(self, status_code: int, data: dict, headers: Optional[Dict[str, str]] = None, is_dev_api: bool = False):
        if status_code < 400 and getattr(self, "command", "") == "POST":
            invalidate_caches()
        try:
            body = json.dumps(data).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._apply_security_headers()

            req_path = getattr(self, "path", "")
            is_dev = is_dev_api or is_cors_bypassed_endpoint(req_path)
            origin = self.headers.get("Origin", "").strip()

            if is_dev:
                # Zone A: Developer REST API & Public Endpoints (bypasses CORS)
                if origin and origin != "null":
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Access-Control-Allow-Credentials", "true")
                    self.send_header("Vary", "Origin")
                else:
                    self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-API-Key, X-CBM-PIN, X-CBM-Session, X-CBM-Environment, X-Requested-With, Idempotency-Key")
                self.send_header("Access-Control-Max-Age", "86400")
            else:
                # Zone B: Internal First-Party Endpoints (meant solely for cbm.wispbyte.org)
                if origin and origin != "null" and is_authorized_first_party_origin(origin):
                    self.send_header("Access-Control-Allow-Origin", origin)
                    self.send_header("Access-Control-Allow-Credentials", "true")
                    self.send_header("Vary", "Origin")

                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Session, X-CBM-PIN, X-Requested-With, X-CBM-Environment")

            if headers:
                for hk, hv in headers.items():
                    self.send_header(hk, hv)

            self.end_headers()
            self.wfile.write(body)
            try:
                self.wfile.flush()
            except Exception:
                pass
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass
        except Exception as e:
            print(f"[!] Error sending JSON response: {e}")

    def _get_authenticated_user(self) -> Optional[str]:
        """
        Extracts and verifies authenticated user from Authorization header,
        X-CBM-Session header, or cbm_session cookie.
        Returns canonical account_name or None.
        """
        auth_hdr = self.headers.get("Authorization", "").strip()
        if auth_hdr.startswith("Bearer "):
            token = auth_hdr[7:].strip()
            if "." in token:
                user = verify_session_token(token)
                if user:
                    return user

        session_hdr = self.headers.get("X-CBM-Session", "").strip()
        if session_hdr:
            user = verify_session_token(session_hdr)
            if user:
                return user

        cookie_hdr = self.headers.get("Cookie", "")
        if cookie_hdr:
            for piece in cookie_hdr.split(";"):
                piece = piece.strip()
                if piece.startswith("cbm_session="):
                    token = piece.split("=", 1)[1].strip()
                    user = verify_session_token(token)
                    if user:
                        return user

        return None

    def _is_account_authorized(self, target_account: str, pin: Optional[str] = None) -> bool:
        """
        Verifies whether the current requester is authorized as the owner of target_account.
        Accepts valid CBM API Key, valid session token, X-CBM-PIN header, or provided PIN param.
        """
        if not target_account:
            return False

        # 1. Check API Key in headers (Authorization: Bearer <cbm_key> or X-CBM-API-Key)
        auth_header = self.headers.get("Authorization", "").strip()
        api_key_hdr = self.headers.get("X-CBM-API-Key", "").strip()
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        elif api_key_hdr:
            token = api_key_hdr

        if token and (token.startswith("cbm_live_") or token.startswith("cbm_test_") or token.startswith("cbm_key_") or token.startswith("cbm_")):
            is_valid, key_record = db.verify_api_key(token)
            if is_valid and key_record:
                key_owner = (key_record.get("owner_account") or "").strip().lower()
                target_clean = target_account.strip().lower()
                if key_owner == target_clean:
                    return True
                raw = db._get_account_raw(target_account)
                if raw:
                    canonical = (raw.get("account_name") or "").lower()
                    primary_terri = (raw.get("primary_territorial_account") or "").lower()
                    if key_owner in (canonical, primary_terri):
                        return True
                key_scopes = [s.strip() for s in key_record.get("scopes", "").split(",") if s.strip()]
                if "admin" in key_scopes or "*" in key_scopes:
                    return True

        # 2. Check Session Token
        auth_user = self._get_authenticated_user()
        if auth_user:
            if auth_user.lower() == target_account.lower():
                return True
            raw = db._get_account_raw(target_account)
            if raw:
                canonical = (raw.get("account_name") or "").lower()
                primary_terri = (raw.get("primary_territorial_account") or "").lower()
                if auth_user.lower() in (canonical, primary_terri):
                    return True
            auth_raw = db._get_account_raw(auth_user)
            if auth_raw and auth_raw.get("role") in ("admin", "council", "leader", "officer"):
                return True

        # 3. Check PIN
        check_pin = pin or self.headers.get("X-CBM-PIN", "").strip()
        if check_pin:
            is_locked, _ = rate_limiter.is_account_locked(target_account)
            if not is_locked and db.verify_account_pin(target_account, str(check_pin)):
                return True

        return False

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
            is_leader = bool(owner_acc and owner_acc.get("role") in ("admin", "council", "leader", "officer"))
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

    def _execute_billable_workload(self, key_record: Dict[str, Any], cost_credits: Union[int, float], operation: str, workload_callable):
        """
        Executes a metered API call:
        Authenticate -> Determine Price -> Deduct Deposit Credits -> Execute -> Compensate on Failure
        Debited credits are permanently converted into unencumbered Clan Bank reserves.
        """
        account_name = key_record["owner_account"]
        key_id = key_record.get("key_id")
        idempotency_key = self.headers.get("Idempotency-Key", "").strip() or None
        endpoint = getattr(self, "path", "").split("?")[0]
        cost_gold = float(cost_credits)

        # In Sandbox / Test environment, bypass ledger deduction
        if key_record.get("is_sandbox"):
            result_code, result_data = workload_callable()
            headers = {"X-CBM-Billing-Mode": "SANDBOX", "X-CBM-Credits-Charged": "0.00"}
            return self._send_json(result_code, result_data, headers=headers, is_dev_api=True)

        charged, msg, billing = db.charge_api_credit(
            owner_account=account_name,
            key_id=key_id,
            cost_gold=cost_gold,
            idempotency_key=idempotency_key,
            endpoint=endpoint,
            metadata={"operation": operation}
        )
        if not charged:
            return self._send_json(402, {
                "error": "insufficient_credits",
                "message": msg,
                "credits_available": billing.get("credits_remaining", 0.0),
                "credits_required": cost_gold
            }, is_dev_api=True)

        tx_hash = billing.get("tx_hash", "")
        balance_after = billing.get("credits_remaining", 0.0)

        try:
            result_code, result_data = workload_callable()
            headers = {
                "X-CBM-Billing-Mode": "METERED",
                "X-CBM-Credits-Cost": f"{cost_gold:.2f}",
                "X-CBM-Credits-Remaining": f"{balance_after:.2f}",
                "X-CBM-Billing": "converted_to_clan_reserves",
                "X-CBM-Ledger-Tx": tx_hash
            }
            if result_code >= 500:
                db.refund_api_credit(
                    owner_account=account_name,
                    cost_gold=cost_gold,
                    key_id=key_id,
                    reason="DOWNSTREAM_SERVER_ERROR",
                    original_tx_hash=tx_hash
                )
                headers["X-CBM-Credits-Refunded"] = "true"

            invalidate_caches()
            return self._send_json(result_code, result_data, headers=headers, is_dev_api=True)
        except Exception as ex:
            db.refund_api_credit(
                owner_account=account_name,
                cost_gold=cost_gold,
                key_id=key_id,
                reason="UNHANDLED_EXCEPTION",
                original_tx_hash=tx_hash
            )
            invalidate_caches()
            return self._send_json(500, {
                "error": "internal_error",
                "message": "Internal error occurred. Consumed credits were automatically refunded."
            }, is_dev_api=True)

    def _handle_ai_chat_request(self, body: Dict[str, Any], is_v1_api: bool = True):
        """
        Processes AI inference requests targeting NVIDIA NIM models (default: nvidia/nemotron-3-ultra-550b-a55b).
        Enforces atomic deposit-backed credit metering and permanent conversion into unencumbered Clan Reserves.
        Supports stateful multi-turn session memory with sliding-window compaction and lifecycle pruning.
        """
        raw_messages = body.get("messages") or body.get("prompt")
        if not raw_messages:
            return self._send_json(400, {
                "error": "bad_request",
                "message": "Missing 'messages' or 'prompt' parameter in request body."
            }, is_dev_api=is_v1_api)

        model = body.get("model") or ai_service.default_model
        try:
            max_tokens = int(body.get("max_tokens", 1024))
            temperature = float(body.get("temperature", 0.7))
        except (ValueError, TypeError):
            max_tokens = 1024
            temperature = 0.7

        async_mode = bool(body.get("async") or body.get("async_job") or False)
        wait_timeout = float(body.get("timeout") or body.get("wait_timeout") or 90.0)

        # Authenticate developer request
        acc_name = body.get("account_name", "").strip()
        pin = body.get("pin", "")
        api_k = body.get("api_key") or body.get("key") or ""
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(
            target_account=acc_name,
            pin=pin,
            required_scope="ai:chat",
            api_key=api_k
        )
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else acc_name)
        cost_gold = float(CREDIT_PER_AI_REQUEST)

        # Chat Session Memory Parameters
        session_id_param = body.get("session_id")
        session_id = None
        if session_id_param is True or session_id_param == "new" or body.get("new_session"):
            session_id = f"cbm_sess_{uuid.uuid4().hex[:16]}"
        elif isinstance(session_id_param, str) and session_id_param.strip():
            session_id = session_id_param.strip()

        end_session = bool(body.get("end_session", False))
        try:
            ttl_seconds = int(body.get("ttl_seconds", 3600))
        except (ValueError, TypeError):
            ttl_seconds = 3600
        system_prompt = body.get("system_prompt")
        session_title = body.get("title") or body.get("session_title")

        active_session = None
        new_turns_to_commit: List[Dict[str, Any]] = []
        messages_for_inference = raw_messages

        if session_id:
            active_session = db.get_ai_session(session_id, touch=True)
            if not active_session:
                active_session = db.create_ai_session(
                    owner_account=target_acc,
                    key_id=key_rec.get("key_id") if key_rec else None,
                    session_id=session_id,
                    title=session_title or "Ad-hoc Chat Session",
                    system_prompt=system_prompt,
                    model=model,
                    ttl_seconds=ttl_seconds
                )
            elif system_prompt and not active_session.get("system_prompt"):
                db.update_ai_session(session_id, system_prompt=system_prompt)

            if (not body.get("model") or body.get("model") == ai_service.default_model) and active_session.get("model"):
                model = active_session["model"]

            try:
                messages_for_inference, active_session, new_turns_to_commit = db.assemble_ai_session_context(
                    session_id=session_id,
                    incoming_messages=raw_messages,
                    max_turns=active_session.get("max_context_turns", 20)
                )
            except Exception as ctx_err:
                return self._send_json(500, {
                    "error": "session_context_error",
                    "message": f"Failed to assemble session context: {ctx_err}"
                }, is_dev_api=is_v1_api)

        is_stream_requested = bool(body.get("stream") or "text/event-stream" in self.headers.get("Accept", ""))

        # Streaming Mode (Server-Sent Events)
        if is_stream_requested:
            is_sandbox = bool(key_rec and key_rec.get("is_sandbox"))
            key_id = key_rec.get("key_id") if key_rec else None
            idempotency_key = self.headers.get("Idempotency-Key", "").strip() or None

            if not is_sandbox:
                charged, msg, billing = db.charge_api_credit(
                    owner_account=target_acc,
                    key_id=key_id,
                    cost_gold=cost_gold,
                    idempotency_key=idempotency_key,
                    endpoint=self.path.split("?")[0],
                    metadata={"operation": "AI_INFERENCE_STREAM"}
                )
                if not charged:
                    return self._send_json(402, {
                        "error": "insufficient_credits",
                        "message": msg,
                        "credits_available": billing.get("credits_remaining", 0.0),
                        "credits_required": cost_gold
                    }, is_dev_api=is_v1_api)
                tx_hash = billing.get("tx_hash", "")
                bal_after = billing.get("credits_remaining", 0.0)
            else:
                tx_hash = "sandbox_stream"
                bal_after = key_rec.get("owner_balance_gold", 0.0)

            origin = self.headers.get("Origin", "").strip()
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")

            if origin and origin != "null":
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Access-Control-Allow-Credentials", "true")
                self.send_header("Vary", "Origin")
            else:
                self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-API-Key, X-CBM-PIN, X-CBM-Session, X-CBM-Environment, X-Requested-With, Idempotency-Key")

            if not is_sandbox:
                self.send_header("X-CBM-Billing-Mode", "METERED")
                self.send_header("X-CBM-Credits-Cost", f"{cost_gold:.2f}")
                self.send_header("X-CBM-Credits-Remaining", f"{bal_after:.2f}")
                self.send_header("X-CBM-Billing", "converted_to_clan_reserves")
                self.send_header("X-CBM-Ledger-Tx", tx_hash)
            else:
                self.send_header("X-CBM-Billing-Mode", "SANDBOX")
                self.send_header("X-CBM-Credits-Charged", "0.00")

            self._apply_security_headers()
            self.end_headers()

            had_first_chunk = False
            accumulated_content: List[str] = []
            accumulated_reasoning: List[str] = []

            try:
                for line in ai_service.stream_chat_completion(
                    messages=messages_for_inference,
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    extra_payload=body
                ):
                    had_first_chunk = True
                    out_chunk = f"{line}\n\n".encode("utf-8") if not line.endswith("\n\n") else f"{line}\n".encode("utf-8")
                    self.wfile.write(out_chunk)
                    self.wfile.flush()

                    if session_id and line.startswith("data: "):
                        raw_data = line[6:].strip()
                        if raw_data and raw_data != "[DONE]":
                            try:
                                chunk_obj = json.loads(raw_data)
                                choices = chunk_obj.get("choices", [])
                                if choices and isinstance(choices, list) and choices[0]:
                                    delta = choices[0].get("delta", {})
                                    if "content" in delta and delta["content"]:
                                        accumulated_content.append(str(delta["content"]))
                                    if "reasoning_content" in delta and delta["reasoning_content"]:
                                        accumulated_reasoning.append(str(delta["reasoning_content"]))
                            except Exception:
                                pass

                # Stream completed successfully -> record session turns
                if session_id:
                    full_reply = "".join(accumulated_content)
                    full_reasoning = "".join(accumulated_reasoning) or None
                    for u_turn in new_turns_to_commit:
                        db.append_ai_session_message(
                            session_id=session_id,
                            role=u_turn.get("role", "user"),
                            content=u_turn.get("content", "")
                        )
                    asst_record = db.append_ai_session_message(
                        session_id=session_id,
                        role="assistant",
                        content=full_reply,
                        reasoning_content=full_reasoning
                    )
                    if end_session:
                        db.delete_ai_session(session_id)

                    meta_payload = json.dumps({
                        "session_id": session_id,
                        "turn_index": asst_record.get("turn_index") if asst_record else None,
                        "session_ended": end_session
                    })
                    self.wfile.write(f"data: {meta_payload}\n\n".encode("utf-8"))
                    self.wfile.flush()

                invalidate_caches()
            except Exception as stream_err:
                if not had_first_chunk and not is_sandbox:
                    db.refund_api_credit(
                        owner_account=target_acc,
                        cost_gold=cost_gold,
                        key_id=key_id,
                        reason="STREAMING_FAILED_BEFORE_OUTPUT",
                        original_tx_hash=tx_hash
                    )
                    invalidate_caches()
                try:
                    err_payload = json.dumps({"error": "stream_error", "message": str(stream_err)})
                    self.wfile.write(f"data: {err_payload}\n\n".encode("utf-8"))
                    self.wfile.flush()
                except Exception:
                    pass
            return

        # Non-blocking Asynchronous Mode
        if async_mode:
            idempotency_key = self.headers.get("Idempotency-Key", "").strip() or None
            charged, msg, billing = db.charge_api_credit(
                owner_account=target_acc,
                key_id=key_rec.get("key_id") if key_rec else None,
                cost_gold=cost_gold,
                idempotency_key=idempotency_key,
                endpoint=self.path.split("?")[0],
                metadata={"operation": "AI_INFERENCE_ASYNC"}
            )
            if not charged:
                return self._send_json(402, {
                    "error": "insufficient_credits",
                    "message": msg,
                    "credits_available": billing.get("credits_remaining", 0.0),
                    "credits_required": cost_gold
                }, is_dev_api=is_v1_api)

            tx_hash = billing.get("tx_hash", "")
            bal_after = billing.get("credits_remaining", 0.0)

            try:
                job_meta = ai_service.create_background_job(
                    messages=messages_for_inference,
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    extra_payload=body
                )
                job_meta["credits_charged"] = cost_gold
                job_meta["credit_balance"] = bal_after
                job_meta["transaction_id"] = tx_hash
                if session_id:
                    job_meta["session_id"] = session_id
                job_meta["poll_url"] = f"/api/v1/ai/jobs/{job_meta['job_id']}" if is_v1_api else f"/api/cbm/ai/jobs/{job_meta['job_id']}"
                invalidate_caches()
                return self._send_json(202, job_meta, is_dev_api=is_v1_api)
            except Exception as ex:
                db.refund_api_credit(
                    owner_account=target_acc,
                    cost_gold=cost_gold,
                    key_id=key_rec.get("key_id") if key_rec else None,
                    reason="BACKGROUND_JOB_DISPATCH_FAILED",
                    original_tx_hash=tx_hash
                )
                invalidate_caches()
                return self._send_json(500, {"error": "internal_error", "message": f"Job creation failed: {ex}"}, is_dev_api=is_v1_api)

        # Synchronous Metered Inference
        def _execute_inference():
            try:
                res = ai_service.chat_completion(
                    messages=messages_for_inference,
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    wait_for_completion=True,
                    max_poll_seconds=wait_timeout,
                    extra_payload=body
                )
                if res.get("status") == "completed":
                    res_body = {
                        "status": "ok",
                        "api_version": "v1.0",
                        "model": res.get("model", model),
                        "execution_time_seconds": res.get("execution_time_seconds"),
                        "data": res.get("data")
                    }
                    if isinstance(res.get("data"), dict):
                        for k, v in res["data"].items():
                            if k not in res_body:
                                res_body[k] = v

                    if session_id:
                        choices = res_body.get("choices") or (res.get("data", {}).get("choices", []) if isinstance(res.get("data"), dict) else [])
                        asst_content = ""
                        asst_reasoning = None
                        if choices and isinstance(choices, list) and choices[0]:
                            msg_obj = choices[0].get("message", {})
                            asst_content = msg_obj.get("content", "")
                            asst_reasoning = msg_obj.get("reasoning_content")

                        tokens_used = 0
                        usage = res_body.get("usage") or (res.get("data", {}).get("usage", {}) if isinstance(res.get("data"), dict) else {})
                        if isinstance(usage, dict):
                            tokens_used = int(usage.get("total_tokens", 0))

                        # 1. Commit new user turns
                        for u_turn in new_turns_to_commit:
                            db.append_ai_session_message(
                                session_id=session_id,
                                role=u_turn.get("role", "user"),
                                content=u_turn.get("content", "")
                            )

                        # 2. Commit assistant turn
                        asst_record = db.append_ai_session_message(
                            session_id=session_id,
                            role="assistant",
                            content=asst_content,
                            reasoning_content=asst_reasoning,
                            tokens=tokens_used
                        )

                        res_body["session_id"] = session_id
                        res_body["turn_index"] = asst_record.get("turn_index")
                        res_body["session_ended"] = end_session

                        if end_session:
                            db.delete_ai_session(session_id)
                        else:
                            active_s = db.get_ai_session(session_id, touch=False)
                            if active_s:
                                res_body["session_expires_at"] = active_s.get("expires_at")

                    return 200, res_body
                elif res.get("status") == "pending":
                    req_id = res.get("request_id")
                    return 202, {
                        "status": "pending",
                        "api_version": "v1.0",
                        "request_id": req_id,
                        "model": res.get("model", model),
                        "message": "Inference request accepted and currently queued on NVIDIA NIM cluster.",
                        "poll_url": f"/api/v1/ai/status/{req_id}" if is_v1_api else f"/api/cbm/ai/status/{req_id}"
                    }
                else:
                    return 500, {"error": "inference_failed", "details": res}
            except NvidiaAIError as nae:
                return nae.status_code, {"error": "nvidia_api_error", "message": str(nae), "details": nae.error_details}
            except Exception as ex:
                return 500, {"error": "internal_error", "message": str(ex)}

        if key_rec:
            return self._execute_billable_workload(
                key_record=key_rec,
                cost_credits=cost_gold,
                operation="AI_INFERENCE",
                workload_callable=_execute_inference
            )
        else:
            idempotency_key = self.headers.get("Idempotency-Key", "").strip() or None
            charged, msg, billing = db.charge_api_credit(
                owner_account=target_acc,
                key_id=None,
                cost_gold=cost_gold,
                idempotency_key=idempotency_key,
                endpoint=self.path.split("?")[0],
                metadata={"operation": "AI_INFERENCE_PLAYGROUND"}
            )
            if not charged:
                return self._send_json(402, {
                    "error": "insufficient_credits",
                    "message": msg,
                    "credits_available": billing.get("credits_remaining", 0.0),
                    "credits_required": cost_gold
                }, is_dev_api=is_v1_api)

            tx_hash = billing.get("tx_hash", "")
            bal_after = billing.get("credits_remaining", 0.0)

            code, data = _execute_inference()
            headers = {
                "X-CBM-Billing-Mode": "METERED",
                "X-CBM-Credits-Cost": f"{cost_gold:.2f}",
                "X-CBM-Credits-Remaining": f"{bal_after:.2f}",
                "X-CBM-Billing": "converted_to_clan_reserves",
                "X-CBM-Ledger-Tx": tx_hash
            }
            if code >= 500:
                db.refund_api_credit(
                    owner_account=target_acc,
                    cost_gold=cost_gold,
                    key_id=None,
                    reason="DOWNSTREAM_SERVER_ERROR",
                    original_tx_hash=tx_hash
                )
                headers["X-CBM-Credits-Refunded"] = "true"

            invalidate_caches()
            return self._send_json(code, data, headers=headers, is_dev_api=is_v1_api)

    def _handle_ai_sessions_list(self, params: Dict[str, str], is_v1_api: bool = True):
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(required_scope="ai:chat")
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else "")
        key_id = key_rec.get("key_id") if key_rec else None
        try:
            limit = int(params.get("limit", 50))
            offset = int(params.get("offset", 0))
        except (ValueError, TypeError):
            limit = 50
            offset = 0

        sessions = db.list_ai_sessions(owner_account=target_acc, key_id=key_id, limit=limit, offset=offset)
        return self._send_json(200, {
            "status": "ok",
            "api_version": "v1.0",
            "sessions": sessions,
            "count": len(sessions)
        }, is_dev_api=is_v1_api)

    def _handle_ai_session_get(self, session_id: str, is_v1_api: bool = True):
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(required_scope="ai:chat")
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else "")
        sess = db.get_ai_session(session_id, touch=True)
        if not sess:
            return self._send_json(404, {
                "error": "session_not_found",
                "message": f"AI session '{session_id}' not found or has expired."
            }, is_dev_api=is_v1_api)

        key_scopes = [s.strip() for s in key_rec.get("scopes", "").split(",") if s.strip()] if key_rec else []
        is_admin = ("admin" in key_scopes or "*" in key_scopes)
        if not is_admin and sess.get("owner_account") and target_acc and sess["owner_account"].lower() != target_acc.lower():
            return self._send_json(403, {"error": "forbidden", "message": "Access denied to session owned by another account."}, is_dev_api=is_v1_api)

        messages = db.get_ai_session_messages(session_id)
        return self._send_json(200, {
            "status": "ok",
            "api_version": "v1.0",
            "session": sess,
            "messages": messages,
            "message_count": len(messages)
        }, is_dev_api=is_v1_api)

    def _handle_ai_session_create(self, body: Dict[str, Any], is_v1_api: bool = True):
        acc_name = body.get("account_name", "").strip() if body else ""
        pin = body.get("pin", "") if body else ""
        api_k = (body.get("api_key") or body.get("key") or "") if body else ""
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(
            target_account=acc_name,
            pin=pin,
            required_scope="ai:chat",
            api_key=api_k
        )
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else acc_name)
        key_id = key_rec.get("key_id") if key_rec else None

        session_id = body.get("session_id")
        title = body.get("title") or body.get("session_title")
        system_prompt = body.get("system_prompt")
        model = body.get("model") or ai_service.default_model
        try:
            ttl_seconds = int(body.get("ttl_seconds", 3600))
            max_turns = int(body.get("max_turns", 20))
        except (ValueError, TypeError):
            ttl_seconds = 3600
            max_turns = 20

        metadata = body.get("metadata")

        try:
            sess = db.create_ai_session(
                owner_account=target_acc,
                key_id=key_id,
                session_id=session_id,
                title=title,
                system_prompt=system_prompt,
                model=model,
                ttl_seconds=ttl_seconds,
                max_turns=max_turns,
                metadata=metadata
            )
            invalidate_caches()
            return self._send_json(201, {
                "status": "ok",
                "api_version": "v1.0",
                "session": sess
            }, is_dev_api=is_v1_api)
        except Exception as e:
            return self._send_json(500, {"error": "internal_error", "message": f"Failed to create AI session: {e}"}, is_dev_api=is_v1_api)

    def _handle_ai_session_update(self, session_id: str, body: Dict[str, Any], is_v1_api: bool = True):
        acc_name = body.get("account_name", "").strip() if body else ""
        pin = body.get("pin", "") if body else ""
        api_k = (body.get("api_key") or body.get("key") or "") if body else ""
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(
            target_account=acc_name,
            pin=pin,
            required_scope="ai:chat",
            api_key=api_k
        )
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else acc_name)
        sess = db.get_ai_session(session_id, touch=False)
        if not sess:
            return self._send_json(404, {"error": "session_not_found", "message": f"AI session '{session_id}' not found or has expired."}, is_dev_api=is_v1_api)

        key_scopes = [s.strip() for s in key_rec.get("scopes", "").split(",") if s.strip()] if key_rec else []
        is_admin = ("admin" in key_scopes or "*" in key_scopes)
        if not is_admin and sess.get("owner_account") and target_acc and sess["owner_account"].lower() != target_acc.lower():
            return self._send_json(403, {"error": "forbidden", "message": "Access denied to session owned by another account."}, is_dev_api=is_v1_api)

        ttl_seconds = int(body["ttl_seconds"]) if "ttl_seconds" in body else None
        max_turns = int(body["max_turns"]) if "max_turns" in body else None

        updated = db.update_ai_session(
            session_id=session_id,
            owner_account=target_acc if not is_admin else None,
            title=body.get("title"),
            system_prompt=body.get("system_prompt"),
            model=body.get("model"),
            ttl_seconds=ttl_seconds,
            max_turns=max_turns,
            metadata=body.get("metadata")
        )
        if not updated:
            return self._send_json(404, {"error": "session_not_found", "message": f"AI session '{session_id}' could not be updated."}, is_dev_api=is_v1_api)

        refreshed_sess = db.get_ai_session(session_id, touch=False)
        invalidate_caches()
        return self._send_json(200, {
            "status": "ok",
            "api_version": "v1.0",
            "session": refreshed_sess
        }, is_dev_api=is_v1_api)

    def _handle_ai_session_delete(self, session_id: str, is_v1_api: bool = True):
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(required_scope="ai:chat")
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else "")
        sess = db.get_ai_session(session_id, touch=False)
        if not sess:
            return self._send_json(404, {"error": "session_not_found", "message": f"AI session '{session_id}' not found or already deleted."}, is_dev_api=is_v1_api)

        key_scopes = [s.strip() for s in key_rec.get("scopes", "").split(",") if s.strip()] if key_rec else []
        is_admin = ("admin" in key_scopes or "*" in key_scopes)
        if not is_admin and sess.get("owner_account") and target_acc and sess["owner_account"].lower() != target_acc.lower():
            return self._send_json(403, {"error": "forbidden", "message": "Access denied to session owned by another account."}, is_dev_api=is_v1_api)

        deleted = db.delete_ai_session(session_id, owner_account=target_acc if not is_admin else None)
        if not deleted:
            return self._send_json(404, {"error": "session_not_found", "message": f"AI session '{session_id}' could not be deleted."}, is_dev_api=is_v1_api)

        invalidate_caches()
        return self._send_json(200, {
            "status": "ok",
            "api_version": "v1.0",
            "message": f"AI session '{session_id}' and all message history permanently deleted.",
            "session_id": session_id,
            "deleted": True
        }, is_dev_api=is_v1_api)

    def _handle_ai_session_clear(self, session_id: str, is_v1_api: bool = True):
        ok_auth, key_rec, auth_user, err = self._authenticate_dev_request(required_scope="ai:chat")
        if not ok_auth:
            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=is_v1_api)

        target_acc = auth_user or (key_rec.get("owner_account") if key_rec else "")
        sess = db.get_ai_session(session_id, touch=False)
        if not sess:
            return self._send_json(404, {"error": "session_not_found", "message": f"AI session '{session_id}' not found or already deleted."}, is_dev_api=is_v1_api)

        key_scopes = [s.strip() for s in key_rec.get("scopes", "").split(",") if s.strip()] if key_rec else []
        is_admin = ("admin" in key_scopes or "*" in key_scopes)
        if not is_admin and sess.get("owner_account") and target_acc and sess["owner_account"].lower() != target_acc.lower():
            return self._send_json(403, {"error": "forbidden", "message": "Access denied to session owned by another account."}, is_dev_api=is_v1_api)

        cleared = db.clear_ai_session_messages(session_id, owner_account=target_acc if not is_admin else None)
        if not cleared:
            return self._send_json(404, {"error": "session_not_found", "message": f"Message history for session '{session_id}' could not be cleared."}, is_dev_api=is_v1_api)

        invalidate_caches()
        return self._send_json(200, {
            "status": "ok",
            "api_version": "v1.0",
            "message": f"Message history for session '{session_id}' cleared.",
            "session_id": session_id
        }, is_dev_api=is_v1_api)

    def _authenticate_dev_request(
        self,
        target_account: str = "",
        pin: Optional[str] = None,
        required_scope: str = "",
        api_key: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str], Optional[Dict[str, Any]]]:
        """
        Comprehensive security gatekeeper for all CBM Developer Endpoints.
        Enforces proper authorization and security:
        1. CBM API Key ('Authorization: Bearer cbm_...', 'X-CBM-API-Key', 'X-API-Key', or api_key parameter)
        2. Web Developer Session Token ('Authorization: Bearer cbm_session_...' or cookie)
        3. Security Access PIN ('X-CBM-PIN' header or pin parameter)
        Returns (is_authorized, key_record, authenticated_account, error_dict)
        """
        auth_header = self.headers.get("Authorization", "").strip()
        api_key_hdr = self.headers.get("X-CBM-API-Key", "").strip() or self.headers.get("X-API-Key", "").strip()

        # 1. API Key Authentication
        token = ""
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
        elif auth_header.startswith("cbm_"):
            token = auth_header
        elif api_key_hdr:
            token = api_key_hdr
        elif api_key:
            token = api_key.strip()
        elif pin and (pin.startswith("cbm_live_") or pin.startswith("cbm_test_") or pin.startswith("cbm_key_") or pin.startswith("cbm_")):
            token = pin

        if token and (token.startswith("cbm_live_") or token.startswith("cbm_test_") or token.startswith("cbm_key_") or token.startswith("cbm_")):
            is_valid, key_record = db.verify_api_key(token)
            if not is_valid or not key_record:
                err_msg = key_record.get("error") if isinstance(key_record, dict) else None
                return False, None, None, {
                    "status": 401,
                    "body": {
                        "error": "invalid_key",
                        "status": "unauthorized",
                        "message": err_msg or "Invalid, revoked, or unrecognized CBM API key."
                    }
                }

            # Scope enforcement
            key_scopes = [s.strip() for s in key_record.get("scopes", "").split(",") if s.strip()]
            has_admin = ("admin" in key_scopes or "*" in key_scopes)
            if required_scope and not has_admin:
                if required_scope not in key_scopes and "dev:manage" not in key_scopes:
                    return False, None, None, {
                        "status": 403,
                        "body": {
                            "error": "insufficient_scope",
                            "status": "forbidden",
                            "message": f"API Key lacks required scope '{required_scope}'. Key scopes: {key_record.get('scopes')}"
                        }
                    }

            # Per-key rate limiting
            key_id = key_record["key_id"]
            rpm_limit = int(key_record.get("rate_limit_rpm", 60))
            allowed, _ = rate_limiter.check_rate_limit(f"api_key_{key_id}", limit=rpm_limit, period_seconds=60)
            if not allowed:
                return False, None, None, {
                    "status": 429,
                    "headers": {
                        "Retry-After": "60",
                        "X-RateLimit-Limit": str(rpm_limit),
                        "X-RateLimit-Remaining": "0"
                    },
                    "body": {
                        "error": "rate_limit_exceeded",
                        "status": "rate_limited",
                        "message": f"API Key rate limit of {rpm_limit} requests per minute exceeded. Please slow down."
                    }
                }

            key_owner = (key_record.get("owner_account") or "").strip()
            # If target_account specified, verify it matches key owner (unless admin)
            if target_account and not has_admin:
                target_clean = target_account.strip().lower()
                raw_target = db._get_account_raw(target_account)
                canonical = (raw_target.get("account_name") or target_clean).lower() if raw_target else target_clean
                primary_terri = (raw_target.get("primary_territorial_account") or "").lower() if raw_target else ""

                if key_owner.lower() not in (canonical, primary_terri):
                    return False, None, None, {
                        "status": 403,
                        "body": {
                            "error": "forbidden",
                            "status": "forbidden",
                            "message": f"API Key belongs to '{key_owner}' and cannot manage resources for '{target_account}'."
                        }
                    }

            return True, key_record, key_owner, None

        # 2. Session Token Authentication (Interactive Web Console)
        auth_user = self._get_authenticated_user()
        if auth_user:
            if not target_account:
                return True, None, auth_user, None
            if auth_user.lower() == target_account.lower():
                return True, None, auth_user, None
            raw = db._get_account_raw(target_account)
            if raw:
                canonical = (raw.get("account_name") or "").lower()
                primary_terri = (raw.get("primary_territorial_account") or "").lower()
                if auth_user.lower() in (canonical, primary_terri):
                    return True, None, auth_user, None
            auth_raw = db._get_account_raw(auth_user)
            if auth_raw and auth_raw.get("role") in ("admin", "council", "leader", "officer"):
                return True, None, auth_user, None

        # 3. Access PIN Authentication (Interactive Unlock with Brute-Force Protection)
        check_pin = pin or self.headers.get("X-CBM-PIN", "").strip()
        if target_account and check_pin:
            is_locked, rem_lock = rate_limiter.is_account_locked(target_account)
            if is_locked:
                return False, None, None, {
                    "status": 429,
                    "body": {
                        "error": "account_locked",
                        "status": "locked",
                        "message": f"Account '{target_account}' is temporarily locked due to excessive failed attempts. Try again in {rem_lock}s."
                    }
                }
            if db.verify_account_pin(target_account, str(check_pin)):
                rate_limiter.record_auth_success(target_account)
                return True, None, target_account, None
            else:
                rate_limiter.record_auth_failure(target_account)

        # 4. No valid credential provided
        return False, None, None, {
            "status": 401,
            "body": {
                "error": "unauthorized",
                "status": "unauthorized",
                "message": "Valid authentication required: CBM API Key ('Authorization: Bearer <cbm_key>' or 'X-CBM-API-Key'), CBM session token, or Access PIN."
            }
        }

    def do_OPTIONS(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")

        if is_cors_bypassed_endpoint(path):
            origin = self.headers.get("Origin", "").strip()
            req_headers = self.headers.get("Access-Control-Request-Headers", "").strip()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            if origin and origin != "null":
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Access-Control-Allow-Credentials", "true")
                self.send_header("Vary", "Origin")
            else:
                self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
            allowed_headers = "Content-Type, Authorization, X-CBM-API-Key, X-CBM-PIN, X-CBM-Session, X-CBM-Environment, X-Requested-With, Idempotency-Key"
            if req_headers:
                self.send_header("Access-Control-Allow-Headers", req_headers)
            else:
                self.send_header("Access-Control-Allow-Headers", allowed_headers)
            self.send_header("Access-Control-Max-Age", "86400")
            self._apply_security_headers()
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        # Internal endpoints (/api/cbm/*, /api/auth/*, etc.)
        origin = self.headers.get("Origin", "").strip()
        if origin and not is_authorized_first_party_origin(origin):
            self.send_response(403)
            self.send_header("Content-Type", "application/json")
            self._apply_security_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "forbidden_origin",
                "message": f"Preflight cross-origin check rejected for origin '{origin}'."
            }).encode("utf-8"))
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        if origin and is_authorized_first_party_origin(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CBM-Session, X-CBM-PIN, X-Requested-With, X-CBM-Environment")
        self.send_header("Access-Control-Max-Age", "86400")
        self._apply_security_headers()
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')

    def do_GET(self):
        try:
            self._do_GET()
        except Exception as unhandled:
            print(f"[!] Unhandled error in do_GET: {unhandled}")
            try:
                self._send_json(500, {"status": "error", "message": "Service temporarily busy. Please retry."})
            except Exception:
                pass

    def _do_GET(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")
        query = parsed[1] if len(parsed) > 1 else ""
        query_dict = urllib.parse.parse_qs(query)
        params = {k: urllib.parse.unquote_plus(v[0]).strip() if v else "" for k, v in query_dict.items()}
        base_dir = os.path.dirname(os.path.abspath(__file__))

        # Domain Origin Policy Enforcement for Internal First-Party Endpoints
        if is_internal_cbm_function(path):
            ok_origin, origin_err = self._enforce_domain_origin_policy()
            if not ok_origin:
                return self._send_json(403, {
                    "error": "forbidden_origin",
                    "message": origin_err
                })

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

        elif path.startswith("/assets/products/") or path.startswith("/assets/patterns/"):
            if path.startswith("/assets/products/"):
                sub = "products"
                fname = path[len("/assets/products/"):].strip("/")
            else:
                sub = "patterns"
                fname = path[len("/assets/patterns/"):].strip("/")

            if fname and "/" not in fname and "\\" not in fname and not fname.startswith("."):
                fpath = os.path.join(base_dir, "assets", sub, fname)
                if not os.path.isfile(fpath):
                    fpath = os.path.join(base_dir, "assets", "products", fname)
                if not os.path.isfile(fpath):
                    fpath = os.path.join(base_dir, "assets", "patterns", fname)
                if not os.path.isfile(fpath):
                    fpath = os.path.join(os.path.dirname(base_dir), "assets", sub, fname)

                # Programmatic DB fallback: check if asset is stored in database
                if not os.path.isfile(fpath) and db:
                    db_asset = db.get_asset(fname)
                    if db_asset and db_asset.get("data"):
                        target_dir = os.path.join(base_dir, "assets", sub)
                        os.makedirs(target_dir, exist_ok=True)
                        fpath = os.path.join(target_dir, fname)
                        try:
                            with open(fpath, "wb") as f:
                                f.write(db_asset["data"])
                        except Exception:
                            pass

                # Programmatic On-Demand Remote Fallback: fetch canonical assets if missing from disk & DB
                if not os.path.isfile(fpath) and fname in CANONICAL_REMOTE_ASSETS:
                    meta = CANONICAL_REMOTE_ASSETS[fname]
                    for url in meta.get("urls", []):
                        try:
                            req = urllib.request.Request(url, headers={"User-Agent": "CBM-AssetManager/2.0"})
                            with urllib.request.urlopen(req, timeout=5.0) as resp:
                                if resp.status == 200:
                                    fetched_data = resp.read()
                                    if fetched_data:
                                        target_dir = os.path.join(base_dir, "assets", sub)
                                        os.makedirs(target_dir, exist_ok=True)
                                        fpath = os.path.join(target_dir, fname)
                                        with open(fpath, "wb") as f:
                                            f.write(fetched_data)
                                        if db:
                                            db.save_asset(fname, sub, meta["mime"], fetched_data)
                                        break
                        except Exception:
                            pass

                if os.path.isfile(fpath):
                    ext = os.path.splitext(fname)[1].lower()
                    mimes = {
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".webp": "image/webp",
                        ".gif": "image/gif",
                        ".svg": "image/svg+xml",
                        ".avif": "image/avif"
                    }
                    return self._send_file(fpath, content_type=mimes.get(ext, "application/octet-stream"))
            return self._send_json(404, {"status": "error", "message": "Asset image not found."})

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

        # 2b. Clickable SSO Banner for Third-Party Identity Provider Integration
        elif path in ("/cbm-sso-banner.png", "/cbm-sso-banner", "/assets/cbm-sso-banner.png", "/api/oauth/sso-banner"):
            return self._send_cached_asset("cbm-sso-banner.png")

        # 2c. 3D Sculptural Assets & Diegetic Badges
        elif path in ("/cbm-logo-new.png", "/cbm-logo-new", "/assets/cbm-logo-new.png"):
            return self._send_cached_asset("cbm-logo-new.png")

        elif path in ("/total-vault-assets-icon.png", "/assets/total-vault-assets-icon.png"):
            return self._send_cached_asset("total-vault-assets-icon.png")

        elif path in ("/unencumbered-reserves-icon.png", "/assets/unencumbered-reserves-icon.png"):
            return self._send_cached_asset("unencumbered-reserves-icon.png")

        elif path in ("/member-liabilities-icon.png", "/assets/member-liabilities-icon.png"):
            return self._send_cached_asset("member-liabilities-icon.png")

        elif path in ("/solvency-ratio-icon.png", "/assets/solvency-ratio-icon.png"):
            return self._send_cached_asset("solvency-ratio-icon.png")

        elif path in ("/sponsorship-available-icon1.png", "/assets/sponsorship-available-icon1.png"):
            return self._send_cached_asset("sponsorship-available-icon1.png")

        elif path in ("/welcome-back-login-icon.png", "/assets/welcome-back-login-icon.png"):
            return self._send_cached_asset("welcome-back-login-icon.png")

        elif path in ("/you-were-invited-invitation-image-asset.png", "/assets/you-were-invited-invitation-image-asset.png"):
            return self._send_cached_asset("you-were-invited-invitation-image-asset.png")

        elif path in ("/top-donors-icon.png", "/assets/top-donors-icon.png"):
            return self._send_cached_asset("top-donors-icon.png")

        elif path in ("/developer-platform-icon.png", "/assets/developer-platform-icon.png"):
            return self._send_cached_asset("developer-platform-icon.png")

        elif path in ("/painsel-pointing-left.png", "/assets/painsel-pointing-left.png"):
            return self._send_cached_asset("painsel-pointing-left.png")

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

            acc = db.get_account(acc_name)
            if not acc:
                resp_data = {"status": "not_found", "message": f"Account '{acc_name}' has no active CBM balance."}
                return self._send_json(404, resp_data)

            canonical_name = acc.get("account_name", acc_name)
            disp_name = acc.get("display_name", "")
            is_owner = self._is_account_authorized(canonical_name, pin=params.get("pin"))

            now = time.time()
            acc_key = f"{canonical_name.lower()}:{'owner' if is_owner else 'public'}"
            with _ACCOUNT_LOCK:
                cached_acc = _ACCOUNT_CACHE.get(acc_key)
                if cached_acc and (now - cached_acc["time"]) < _ACCOUNT_CACHE_TTL:
                    return self._send_json(cached_acc.get("code", 200), cached_acc["data"])

            if is_owner:
                ledger = db.get_ledger(canonical_name, limit=20)
                loans = db.get_account_loans(canonical_name)
                resp_data = {
                    "status": "ok",
                    "is_owner": True,
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
            else:
                resp_data = {
                    "status": "ok",
                    "is_owner": False,
                    "account": {
                        "account_name": acc.get("account_name"),
                        "display_name": acc.get("display_name"),
                        "avatar_url": acc.get("avatar_url", ""),
                        "clan_tag": acc.get("clan_tag"),
                        "role": acc.get("role"),
                        "primary_territorial_account": None,
                        "deposited_gold": None,
                        "total_deposited_gold": None,
                        "total_withdrawn_gold": None,
                        "is_verified": acc.get("is_verified", False),
                        "has_pin": None,
                        "has_password": None,
                        "is_delinquent": None
                    },
                    "loans": [],
                    "statement": []
                }

            with _ACCOUNT_LOCK:
                _ACCOUNT_CACHE[acc_key] = {"data": resp_data, "time": now, "code": 200}
                if disp_name:
                    _ACCOUNT_CACHE[f"{disp_name.lower()}:{'owner' if is_owner else 'public'}"] = {"data": resp_data, "time": now, "code": 200}
            return self._send_json(200, resp_data)

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

            if not self._is_account_authorized(canonical_name, pin=params.get("pin")):
                return self._send_json(401, {
                    "status": "unauthorized",
                    "message": "Authentication required to view loan records."
                })

            try:
                db.reconcile_overdue_loans_and_enforce_garnishment(canonical_name)
            except Exception as ex:
                print(f"[!] Loan reconcile non-critical notice: {ex}")
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

            if not self._is_account_authorized(canonical_name, pin=params.get("pin")):
                return self._send_json(401, {
                    "status": "unauthorized",
                    "message": "Authentication required to view linked payment methods."
                })

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
            pin = params.get("pin") or ""
            api_k = params.get("api_key") or params.get("key") or ""
            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="read:bank", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))
            target_acc = auth_user or acc_name
            overview = db.get_developer_overview(target_acc)
            resp = {"status": "ok", "overview": overview}
            if pin and db.verify_account_pin(target_acc, str(pin)):
                resp["session_token"] = create_session_token(target_acc)
            return self._send_json(200, resp)

        elif path == "/api/cbm/dev/keys":
            acc_name = params.get("account_name") or params.get("account") or params.get("name") or ""
            pin = params.get("pin") or ""
            api_k = params.get("api_key") or params.get("key") or ""
            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="read:members", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))
            target_acc = auth_user or acc_name
            keys = db.list_api_keys(target_acc)
            resp = {"status": "ok", "keys": keys}
            if pin and db.verify_account_pin(target_acc, str(pin)):
                resp["session_token"] = create_session_token(target_acc)
            return self._send_json(200, resp)

        elif path == "/api/cbm/dev/products":
            acc_name = params.get("account_name") or params.get("account") or params.get("name") or ""
            pin = params.get("pin") or ""
            api_k = params.get("api_key") or params.get("key") or ""
            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="read:products", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))
            target_acc = auth_user or acc_name
            products = db.list_products_by_owner(target_acc, include_archived=True)
            resp = {"status": "ok", "products": products}
            if pin and db.verify_account_pin(target_acc, str(pin)):
                resp["session_token"] = create_session_token(target_acc)
            return self._send_json(200, resp)

        # Temporary Disposable Chatroom Endpoints (GET)
        elif path == "/api/cbm/chat/messages":
            room_id = (params.get("room_id") or params.get("id") or "").strip()
            since_id = (params.get("since_id") or "").strip() or None
            if not room_id:
                return self._send_json(400, {"status": "error", "message": "room_id parameter required."})

            # Check client API Key authorization (e.g. TerriX Official Client)
            auth_header = self.headers.get("Authorization", "").strip()
            api_key_hdr = self.headers.get("X-CBM-API-Key", "").strip()
            token_key = auth_header[7:].strip() if auth_header.startswith("Bearer ") else (api_key_hdr or str(params.get("api_key") or "").strip())
            is_client_authorized = False
            client_app_name = None
            if token_key and (token_key.startswith("cbm_live_") or token_key.startswith("cbm_test_") or token_key.startswith("cbm_key_") or token_key.startswith("cbm_")):
                key_valid, key_record = db.verify_api_key(token_key)
                if key_valid and key_record:
                    is_client_authorized = True
                    client_app_name = key_record.get("app_name")

            room = chat_engine.get_room(room_id)
            if not room:
                resp = {
                    "status": "ok",
                    "room_id": room_id,
                    "messages": [],
                    "count": 0,
                    "is_active": False
                }
                if is_client_authorized:
                    resp["client_authorized"] = True
                    resp["client_app"] = client_app_name
                return self._send_json(200, resp)

            messages = room.get_messages(since_id=since_id)
            resp = {
                "status": "ok",
                "room_id": room_id,
                "messages": messages,
                "count": len(messages),
                "is_active": not room.is_ended
            }
            if is_client_authorized:
                resp["client_authorized"] = True
                resp["client_app"] = client_app_name
            return self._send_json(200, resp)

        elif path == "/api/cbm/chat/stickers":
            room_id = (params.get("room_id") or "").strip()
            room = chat_engine.get_room(room_id) if room_id else None
            stickers = room.get_stickers() if room else CUSTOM_STICKERS
            return self._send_json(200, {
                "status": "ok",
                "room_id": room_id if room else None,
                "stickers": stickers
            })

        elif path == "/api/cbm/chat/media":
            room_id = (params.get("room_id") or "").strip()
            filename = (params.get("file") or params.get("filename") or "").strip()
            if not room_id or not filename:
                return self._send_json(400, {"status": "error", "message": "room_id and file parameters required."})

            room = chat_engine.get_room(room_id)
            if not room or room.is_ended:
                return self._send_json(404, {"status": "error", "message": "Chatroom has ended or does not exist."})

            # Security: Prevent path traversal
            safe_name = os.path.basename(filename)
            file_path = os.path.join(room.storage_dir, safe_name)
            if not os.path.isfile(file_path):
                return self._send_json(404, {"status": "error", "message": "File not found."})

            ext = os.path.splitext(safe_name)[1].lower()
            mimes = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".webp": "image/webp",
                ".gif": "image/gif",
                ".mp4": "video/mp4",
                ".webm": "video/webm",
                ".pdf": "application/pdf",
                ".txt": "text/plain; charset=utf-8",
                ".json": "application/json",
                ".zip": "application/zip",
                ".csv": "text/csv"
            }
            content_type = mimes.get(ext, "application/octet-stream")

            try:
                with open(file_path, "rb") as f:
                    data = f.read()

                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception as ex:
                return self._send_json(500, {"status": "error", "message": str(ex)})

        elif path in ("/api/cbm/chat/auth/check", "/api/v1/chat/auth/check"):
            acc = (params.get("account") or params.get("account_name") or params.get("username") or "").strip()
            if not acc:
                return self._send_json(400, {"status": "error", "message": "account parameter required."})
            is_whitelisted = db.is_account_whitelisted(acc)
            raw_acc = db._get_account_raw(acc)
            role = raw_acc.get("role", "member") if raw_acc else "guest"
            return self._send_json(200, {
                "status": "ok",
                "account": acc,
                "is_whitelisted": is_whitelisted,
                "role": role
            })

        elif path in ("/api/cbm/chat/whitelist", "/api/v1/chat/whitelist"):
            whitelist = db.get_chat_whitelist()
            return self._send_json(200, {"status": "ok", "whitelist": whitelist})

        # --- First-Party Internal Endpoints (cbm.wispbyte.org) ---
        elif path == "/api/cbm/ads/serve":
            slot_id = params.get("slot_id", "SLOT_HERO").strip()
            fmt = params.get("format", "json").strip().lower()
            if fmt == "html":
                banner_html = sponsorship_engine.render_website_banner_html(db, slot_id)
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self._apply_security_headers()
                self.end_headers()
                self.wfile.write(banner_html.encode("utf-8"))
                return
            else:
                ad_response = sponsorship_engine.serve_ad_request(
                    db_instance=db,
                    slot_id=slot_id,
                    context="website"
                )
                return self._send_json(200, {
                    "api_version": "v1.0",
                    **ad_response
                })

        elif path == "/api/cbm/ads/inventory":
            economic_engine.synchronize_ad_pricing(db)
            inventory = sponsorship_engine.get_inventory_status(db)
            return self._send_json(200, {
                "status": "ok",
                "api_version": "v1.0",
                "timestamp": time.time(),
                "inventory": inventory
            })

        elif path == "/api/cbm/economy/telemetry":
            macro = economic_engine.calculate_macro_telemetry(db)
            loan_risk = economic_engine.evaluate_loan_risk_profile(db)
            return self._send_json(200, {
                "status": "ok",
                "api_version": "v1.0",
                "timestamp": time.time(),
                "macro": macro,
                "loan_risk": loan_risk
            })

        elif path.startswith("/api/cbm/products/"):
            sub = path[len("/api/cbm/products/"):].strip("/")
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
                receipt_hk = db.get_product_receipt_for_account(account, "prod_hellokitty")
                receipt_poland = db.get_product_receipt_for_account(account, "prod_poland")
                created_prods = db.list_products_by_owner(account, include_archived=False)
                created_ids = [p["product_id"] for p in created_prods] if created_prods else []
                all_owned = list(dict.fromkeys(owned + created_ids))
                is_creator = len(created_ids) > 0
                has_hk = ("prod_hellokitty" in all_owned)
                has_poland = ("prod_poland" in all_owned)
                return self._send_json(200, {
                    "status": "ok",
                    "account": account,
                    "owned_products": all_owned,
                    "created_products": created_ids,
                    "is_creator": is_creator,
                    "has_hello_kitty": has_hk,
                    "has_poland": has_poland,
                    "receipt": receipt_hk,
                    "receipt_poland": receipt_poland
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

        # --- Internal / First-Party AI Telemetry & Status APIs (GET) ---
        elif path == "/api/cbm/ai/chat":
            return self._send_json(200, {
                "status": "ok",
                "endpoint": "/api/cbm/ai/chat",
                "method": "POST",
                "description": "NVIDIA NIM AI chat completions endpoint. Send a POST request with JSON payload.",
                "default_model": ai_service.default_model,
                "supported_models": [ai_service.default_model, "moonshotai/kimi-k3"],
                "streaming_supported": True
            }, is_dev_api=True)

        elif path == "/api/cbm/ai/models":
            return self._send_json(200, {
                "status": "ok",
                "provider": "NVIDIA NIM",
                "default_model": ai_service.default_model,
                "supported_models": [ai_service.default_model, "moonshotai/kimi-k3"],
                "status_polling_supported": True,
                "streaming_supported": True,
                "configured": ai_service.is_configured(),
                "pricing": {"credits_per_request": CREDIT_PER_AI_REQUEST}
            }, is_dev_api=True)

        elif path.startswith("/api/cbm/ai/status/"):
            req_id = path[len("/api/cbm/ai/status/"):].strip("/")
            if not req_id:
                return self._send_json(400, {"status": "error", "message": "Missing request_id."})
            res = ai_service.check_status(req_id)
            code = 200 if res.get("status") == "completed" else (202 if res.get("status") == "pending" else res.get("code", 500))
            return self._send_json(code, res)

        elif path.startswith("/api/cbm/ai/jobs/"):
            job_id = path[len("/api/cbm/ai/jobs/"):].strip("/")
            if not job_id:
                return self._send_json(400, {"status": "error", "message": "Missing job_id."})
            job = ai_service.get_job(job_id)
            if not job:
                return self._send_json(404, {"status": "error", "message": f"Job '{job_id}' not found."})
            return self._send_json(200, {"status": "ok", "job": job})

        elif path == "/api/cbm/ai/sessions":
            return self._handle_ai_sessions_list(params=params, is_v1_api=False)

        elif path.startswith("/api/cbm/ai/sessions/"):
            sess_id = path[len("/api/cbm/ai/sessions/"):].strip("/")
            return self._handle_ai_session_get(sess_id, is_v1_api=False)

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
                ok, key_rec, err = self._authenticate_api_v1("read:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                sub = path[len("/api/v1/products/"):].strip("/")
                if sub == "order/status":
                    order_id = params.get("order_id", "").strip()
                    if not order_id:
                        return self._send_api_v1_json(400, {"status": "error", "message": "order_id parameter required."}, key_record=key_rec)
                    order = db.get_product_order(order_id)
                    if not order:
                        return self._send_api_v1_json(404, {"error": "not_found", "message": f"Order '{order_id}' not found."}, key_record=key_rec)
                    return self._send_api_v1_json(200, {"status": "ok", "order": order}, key_record=key_rec)
                elif sub == "ownership":
                    account = params.get("account", "").strip() or params.get("player", "").strip()
                    if not account:
                        return self._send_api_v1_json(400, {"status": "error", "message": "account parameter required."}, key_record=key_rec)
                    owned = db.get_account_owned_products(account)
                    receipt_hk = db.get_product_receipt_for_account(account, "prod_hellokitty")
                    receipt_poland = db.get_product_receipt_for_account(account, "prod_poland")
                    created_prods = db.list_products_by_owner(account, include_archived=False)
                    created_ids = [p["product_id"] for p in created_prods] if created_prods else []
                    all_owned = list(dict.fromkeys(owned + created_ids))
                    is_creator = len(created_ids) > 0
                    has_hk = ("prod_hellokitty" in all_owned)
                    has_poland = ("prod_poland" in all_owned)
                    return self._send_api_v1_json(200, {
                        "status": "ok",
                        "account": account,
                        "owned_products": all_owned,
                        "created_products": created_ids,
                        "is_creator": is_creator,
                        "has_hello_kitty": has_hk,
                        "has_poland": has_poland,
                        "receipt": receipt_hk,
                        "receipt_poland": receipt_poland
                    }, key_record=key_rec)
                else:
                    product_id = sub
                    prod = db.get_product(product_id)
                    is_active = prod and (prod.get("status") == "ACTIVE" or prod.get("is_active"))
                    if not prod or not is_active:
                        return self._send_api_v1_json(404, {"error": "not_found", "message": f"Product '{product_id}' not found or inactive."}, key_record=key_rec)
                    half = round(prod["price_gold"] * 0.5, 2)
                    return self._send_api_v1_json(200, {
                        "status": "ok",
                        "product": prod,
                        "reserve_split": {
                            "seller_percent": 50.0,
                            "seller_gold": half,
                            "reserve_cushion_percent": 50.0,
                            "reserve_cushion_gold": half
                        }
                    }, key_record=key_rec)

            # 6. Sponsorship & Ad Inventory Endpoints
            elif path == "/api/v1/ads/inventory":
                ok, key_rec, err = self._authenticate_api_v1("read:ads")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                economic_engine.synchronize_ad_pricing(db)
                inventory = sponsorship_engine.get_inventory_status(db)
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "timestamp": time.time(),
                    "inventory": inventory
                }, key_record=key_rec)

            elif path == "/api/v1/ads/serve":
                slot_id = params.get("slot_id", "SLOT_HERO").strip()
                fmt = params.get("format", "json").strip().lower()
                context = params.get("context", "external").strip().lower()
                publisher_id = params.get("publisher_id", "").strip() or None
                client_ip = (self.headers.get("CF-Connecting-IP") or self.headers.get("X-Forwarded-For", "").split(",")[0].strip() or (self.client_address[0] if self.client_address else "127.0.0.1"))

                # Authentication enforcement:
                # - Website context: First-party public banner display (cbm.wispbyte.org)
                # - External context: Requires valid Developer API Key (read:ads) or registered publisher_id
                key_rec = None
                if context != "website":
                    ok, key_rec, err = self._authenticate_api_v1("read:ads")
                    if not ok:
                        if publisher_id:
                            pub = db.get_ad_publisher(publisher_id)
                            if not pub or not pub.get("is_active"):
                                return self._send_json(401, {"error": "unauthorized", "message": "Invalid or unverified publisher_id."}, is_dev_api=True)
                        else:
                            return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                if fmt == "html":
                    banner_html = sponsorship_engine.render_website_banner_html(db, slot_id)
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(banner_html.encode("utf-8"))
                    return
                else:
                    ad_response = sponsorship_engine.serve_ad_request(
                        db_instance=db,
                        slot_id=slot_id,
                        context=context,
                        client_ip=client_ip,
                        publisher_id=publisher_id
                    )
                    return self._send_api_v1_json(200, {
                        "api_version": "v1.0",
                        **ad_response
                    }, key_record=key_rec)

            # 7. Enterprise Economic Equilibrium Telemetry & Safe-Gap Risk Telemetry
            elif path == "/api/v1/economy/telemetry":
                ok, key_rec, err = self._authenticate_api_v1("read:bank")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                macro = economic_engine.calculate_macro_telemetry(db)
                loan_risk = economic_engine.evaluate_loan_risk_profile(db)
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "timestamp": time.time(),
                    "macro": macro,
                    "loan_risk": loan_risk
                }, key_record=key_rec)

            # 8. Sponsorship Inventory & Lease Booking Discovery (GET Schema & Available Slots)
            elif path in (
                "/api/v1/sponsorships/purchase", "/api/v1/sponsorship/purchase",
                "/api/v1/sponsorships", "/api/v1/sponsorship/slots", "/api/v1/sponsorships/slots"
            ):
                ok, key_rec, err = self._authenticate_api_v1("read:ads")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                economic_engine.synchronize_ad_pricing(db)
                inventory = sponsorship_engine.get_inventory_status(db)
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "endpoint": path,
                    "method_info": "Send a POST request with an API Key (write:sponsorships) to execute a sponsorship lease booking.",
                    "schema": {
                        "method": "POST",
                        "headers": {"Content-Type": "application/json", "Authorization": "Bearer <cbm_key>"},
                        "body": {
                            "slot_id": "SLOT_HERO | SLOT_TELEMETRY | SLOT_DISCORD (required)",
                            "title": "string (1-80 chars, required)",
                            "tagline": "string (1-200 chars, required)",
                            "target_url": "https://... (required)",
                            "image_url": "https://... or /assets/... (optional)",
                            "badge_text": "string (default: PROMOTED)",
                            "duration_days": 7
                        }
                    },
                    "slots": inventory
                }, key_record=key_rec)

            # 9. AI Inference Telemetry, Models & Status Polling
            elif path == "/api/v1/ai/chat":
                return self._send_json(200, {
                    "status": "ok",
                    "endpoint": "/api/v1/ai/chat",
                    "method": "POST",
                    "description": "NVIDIA NIM AI chat completions endpoint. Send a POST request with JSON payload.",
                    "default_model": ai_service.default_model,
                    "supported_models": [ai_service.default_model, "moonshotai/kimi-k3"],
                    "streaming_supported": True,
                    "pricing": {
                        "credits_per_request": CREDIT_PER_AI_REQUEST,
                        "currency": "VIRTUAL_CREDITS"
                    },
                    "sample_request": {
                        "model": ai_service.default_model,
                        "messages": [
                            {"role": "user", "content": "Analyze current clan treasury liquidity."}
                        ],
                        "max_tokens": 1024,
                        "temperature": 0.7,
                        "stream": False
                    }
                }, is_dev_api=True)

            elif path == "/api/v1/ai/models":
                ok_key, key_rec, err = self._authenticate_api_v1("read:ai")
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "provider": "NVIDIA NIM",
                    "default_model": ai_service.default_model,
                    "supported_models": [ai_service.default_model, "moonshotai/kimi-k3"],
                    "status_polling_supported": True,
                    "streaming_supported": True,
                    "configured": ai_service.is_configured(),
                    "pricing": {
                        "credits_per_request": CREDIT_PER_AI_REQUEST,
                        "currency": "VIRTUAL_CREDITS"
                    },
                    "endpoints": {
                        "chat_completion": "POST /api/v1/ai/chat",
                        "status_polling": "GET /api/v1/ai/status/<request_id>",
                        "job_status": "GET /api/v1/ai/jobs/<job_id>"
                    }
                }, key_record=key_rec if ok_key else None)

            elif path.startswith("/api/v1/ai/status/"):
                req_id = path[len("/api/v1/ai/status/"):].strip("/")
                if not req_id:
                    return self._send_json(400, {"error": "bad_request", "message": "Missing request_id parameter."}, is_dev_api=True)
                res = ai_service.check_status(req_id)
                status_code = 200 if res.get("status") == "completed" else (202 if res.get("status") == "pending" else res.get("code", 500))
                return self._send_json(status_code, res, is_dev_api=True)

            elif path.startswith("/api/v1/ai/jobs/"):
                job_id = path[len("/api/v1/ai/jobs/"):].strip("/")
                if not job_id:
                    return self._send_json(400, {"error": "bad_request", "message": "Missing job_id parameter."}, is_dev_api=True)
                job = ai_service.get_job(job_id)
                if not job:
                    return self._send_json(404, {"error": "job_not_found", "message": f"Background job '{job_id}' not found."}, is_dev_api=True)
                return self._send_json(200, {"status": "ok", "job": job}, is_dev_api=True)

            elif path == "/api/v1/ai/sessions":
                return self._handle_ai_sessions_list(params=params, is_v1_api=True)

            elif path.startswith("/api/v1/ai/sessions/"):
                sess_id = path[len("/api/v1/ai/sessions/"):].strip("/")
                return self._handle_ai_session_get(sess_id, is_v1_api=True)

            return self._send_json(404, {"error": "endpoint_not_found", "message": f"API v1 route '{path}' does not exist."}, is_dev_api=True)

        # --- Authoritative OIDC Discovery & JWKS ---
        elif path in ("/.well-known/openid-configuration", "/api/oauth/.well-known/openid-configuration"):
            base = WISPBYTE_SERVER_URL.rstrip("/")
            return self._send_json(200, {
                "issuer": base,
                "authorization_endpoint": f"{base}/api/oauth/authorize",
                "token_endpoint": f"{base}/api/oauth/token",
                "userinfo_endpoint": f"{base}/api/oauth/userinfo",
                "jwks_uri": f"{base}/.well-known/jwks.json",
                "response_types_supported": ["code"],
                "subject_types_supported": ["public"],
                "id_token_signing_alg_values_supported": ["HS256"],
                "scopes_supported": ["openid", "profile", "email"],
                "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic", "none"],
                "claims_supported": ["sub", "iss", "aud", "exp", "iat", "nonce", "preferred_username", "display_name", "email", "email_verified", "clan_role"],
                "code_challenge_methods_supported": ["S256"]
            }, is_dev_api=True)

        elif path in ("/.well-known/jwks.json", "/api/oauth/jwks.json"):
            return self._send_json(200, {
                "keys": [
                    {
                        "kty": "oct",
                        "use": "sig",
                        "alg": "HS256",
                        "kid": "cbm_master_key_1"
                    }
                ]
            }, is_dev_api=True)

        # --- Authoritative OAuth 2.0 / OIDC Authorization Endpoint ---
        elif path == "/api/oauth/authorize":
            client_id = params.get("client_id")
            redirect_uri = params.get("redirect_uri")
            response_type = params.get("response_type", "code")
            scope = params.get("scope", "openid profile")
            state = params.get("state", "")
            code_challenge = params.get("code_challenge", "")
            code_challenge_method = params.get("code_challenge_method", "S256")
            nonce = params.get("nonce", "")

            if not client_id or not redirect_uri:
                return self._send_json(400, {
                    "error": "invalid_request",
                    "message": "Missing required parameters: client_id and redirect_uri are mandatory."
                }, is_dev_api=True)

            if response_type != "code":
                return self._send_json(400, {
                    "error": "unsupported_response_type",
                    "message": "Only response_type='code' is supported."
                }, is_dev_api=True)

            client = db.get_oauth_client(client_id)
            if not client:
                return self._send_json(400, {
                    "error": "unauthorized_client",
                    "message": f"Client application '{client_id}' is not recognized or is inactive."
                }, is_dev_api=True)

            reg_uris = client.get("redirect_uris", [])
            clean_redir = redirect_uri.split("?")[0].rstrip("/")
            matched = any(r.split("?")[0].rstrip("/") == clean_redir for r in reg_uris)
            if not matched:
                return self._send_json(400, {
                    "error": "invalid_redirect_uri",
                    "message": f"The redirect_uri '{redirect_uri}' is not authorized for this client."
                }, is_dev_api=True)

            auth_user = self._get_authenticated_user()
            if not auth_user:
                full_req = f"{self.path}"
                login_url = f"/login.html?redirect_to={urllib.parse.quote(full_req)}"
                self.send_response(302)
                self.send_header("Location", login_url)
                self._apply_security_headers()
                self.end_headers()
                return

            ok_code, raw_code = db.create_oauth_code(
                client_id=client_id,
                account_name=auth_user,
                redirect_uri=redirect_uri,
                scope=scope,
                code_challenge=code_challenge,
                code_challenge_method=code_challenge_method,
                nonce=nonce,
                ttl_seconds=300
            )
            if not ok_code:
                return self._send_json(500, {
                    "error": "server_error",
                    "message": f"Failed to issue authorization code: {raw_code}"
                }, is_dev_api=True)

            sep = "&" if "?" in redirect_uri else "?"
            redirect_dest = f"{redirect_uri}{sep}code={raw_code}&state={urllib.parse.quote(state)}"
            self.send_response(302)
            self.send_header("Location", redirect_dest)
            self._apply_security_headers()
            self.end_headers()
            return

        # --- Authoritative OIDC UserInfo Endpoint (GET) ---
        elif path == "/api/oauth/userinfo":
            auth_header = self.headers.get("Authorization", "").strip()
            token = ""
            if auth_header.startswith("Bearer "):
                token = auth_header[7:].strip()
            elif params.get("access_token"):
                token = params.get("access_token")

            if not token:
                return self._send_json(401, {
                    "error": "unauthorized",
                    "message": "Missing Bearer access token."
                }, headers={"WWW-Authenticate": 'Bearer error="invalid_token"'}, is_dev_api=True)

            tok_record = db.verify_oauth_access_token(token)
            if not tok_record:
                return self._send_json(401, {
                    "error": "invalid_token",
                    "message": "Access token is invalid, expired, or revoked."
                }, headers={"WWW-Authenticate": 'Bearer error="invalid_token"'}, is_dev_api=True)

            acc_name = tok_record["account_name"]
            acc = db.get_account(acc_name)
            disp_name = (acc.get("display_name") if acc else None) or acc_name
            email = acc.get("email") if acc else None

            claims = {
                "sub": acc_name,
                "preferred_username": acc_name,
                "display_name": disp_name,
                "email": email,
                "email_verified": bool(email),
                "avatar_url": acc.get("avatar_url") if acc else None,
                "clan_role": acc.get("role", "member") if acc else "member",
                "client_id": tok_record.get("client_id")
            }
            return self._send_json(200, claims, is_dev_api=True)

        # --- Developer Portal OAuth Apps Management (GET) ---
        elif path == "/api/cbm/oauth/clients":
            auth_user = self._get_authenticated_user()
            if not auth_user:
                return self._send_json(401, {"status": "error", "message": "Authentication required."})

            clients = db.list_oauth_clients_by_owner(auth_user)
            return self._send_json(200, {"status": "ok", "clients": clients})

        # --- Developer API Credit Wallet & Ledger Telemetry (GET) ---
        elif path == "/api/cbm/credits/wallet":
            auth_user = self._get_authenticated_user()
            if not auth_user:
                return self._send_json(401, {"status": "error", "message": "Authentication required."})

            acc = db.get_account(auth_user)
            balance_gold = round((acc.get("deposited_cents", 0) if acc else 0) / 100.0, 2)
            ledger = db.get_api_ledger_history(auth_user, limit=50)
            return self._send_json(200, {
                "status": "ok",
                "wallet": {
                    "account_name": auth_user,
                    "credit_balance": balance_gold,
                    "gold_balance": balance_gold,
                    "conversion_rule": "1 Credit = 1.00 Gold debited from member deposit and converted to unencumbered clan reserves"
                },
                "ledger": ledger
            })

        # --- Upstream OIDC SSO Ingress ---
        elif path == "/api/auth/oidc/login":
            if not oidc_client.is_configured():
                return self._send_json(503, {
                    "error": "sso_unavailable",
                    "message": "OpenID Connect SSO is not configured on this server instance."
                })

            auth_params = oidc_client.generate_authorization_url()
            cookie_payload = {
                "state": auth_params["state"],
                "nonce": auth_params["nonce"],
                "verifier": auth_params["code_verifier"],
                "exp": int(time.time() + 300)
            }
            cookie_val = create_session_token(json.dumps(cookie_payload), expiry_seconds=300)
            self.send_response(302)
            self.send_header("Location", auth_params["authorization_url"])
            self.send_header("Set-Cookie", f"cbm_oidc_state={cookie_val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300")
            self._apply_security_headers()
            self.end_headers()
            return

        elif path == "/api/auth/oidc/callback":
            error = params.get("error")
            if error:
                return self._send_json(400, {
                    "error": "provider_error",
                    "message": f"IdP returned an error: {params.get('error_description', error)}"
                })

            code = params.get("code")
            state = params.get("state")
            if not code or not state:
                return self._send_json(400, {"error": "bad_request", "message": "Missing authorization code or state."})

            cookie_hdr = self.headers.get("Cookie", "")
            raw_state_cookie = None
            for part in cookie_hdr.split(";"):
                part = part.strip()
                if part.startswith("cbm_oidc_state="):
                    raw_state_cookie = part.split("=", 1)[1]
                    break

            if not raw_state_cookie:
                return self._send_json(400, {"error": "state_missing", "message": "OIDC state cookie expired or missing."})

            verified_json = verify_session_token(raw_state_cookie)
            if not verified_json:
                return self._send_json(400, {"error": "invalid_state", "message": "State cookie validation failed or expired."})

            try:
                state_data = json.loads(verified_json)
            except Exception:
                return self._send_json(400, {"error": "invalid_state", "message": "Malformed state cookie data."})

            if state_data.get("state") != state:
                return self._send_json(400, {"error": "csrf_detected", "message": "State parameter mismatch."})

            try:
                tokens = oidc_client.exchange_code_for_tokens(code, state_data["verifier"])
                id_token = tokens.get("id_token")
                if not id_token:
                    return self._send_json(502, {"error": "id_token_missing", "message": "Provider failed to return ID token."})

                claims = oidc_client.validate_id_token(id_token, expected_nonce=state_data["nonce"])
            except OIDCValidationError as val_err:
                return self._send_json(401, {"error": "validation_failed", "message": str(val_err)})
            except Exception as ex:
                return self._send_json(502, {"error": "exchange_failed", "message": f"OIDC verification error: {ex}"})

            sub = claims["sub"]
            iss = claims["iss"]
            email = claims.get("email")
            email_verified = bool(claims.get("email_verified", False))

            local_user = db.find_account_by_oidc(iss, sub)
            if not local_user:
                auth_user = self._get_authenticated_user()
                if auth_user:
                    account_name = auth_user
                    db.link_oidc_identity(
                        account_name=account_name,
                        provider=iss,
                        provider_sub=sub,
                        email=email,
                        email_verified=email_verified,
                        username=claims.get("preferred_username"),
                        display_name=claims.get("name"),
                        avatar_url=claims.get("picture"),
                        profile_data=claims
                    )
                else:
                    suggested_name = claims.get("preferred_username") or (email.split("@")[0] if email else f"user_{sub[:8]}")
                    clean_name = re.sub(r'[^a-zA-Z0-9_-]', '', suggested_name)[:20]
                    if db.get_account(clean_name):
                        clean_name = f"{clean_name[:14]}_{secrets.token_hex(2)}"

                    db.register_or_get_account(clean_name, display_name=claims.get("name", clean_name))
                    db.link_oidc_identity(
                        account_name=clean_name,
                        provider=iss,
                        provider_sub=sub,
                        email=email,
                        email_verified=email_verified,
                        username=claims.get("preferred_username"),
                        display_name=claims.get("name"),
                        avatar_url=claims.get("picture"),
                        profile_data=claims
                    )
                    account_name = clean_name
            else:
                account_name = local_user["account_name"]

            session_tok = create_session_token(account_name)
            clear_oidc_cookie = "cbm_oidc_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
            session_cookie = f"cbm_session={session_tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400"

            self.send_response(302)
            self.send_header("Location", "/cbm.html")
            self.send_header("Set-Cookie", clear_oidc_cookie)
            self.send_header("Set-Cookie", session_cookie)
            self._apply_security_headers()
            self.end_headers()
            return

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
        if path in ("/api/cbm/chat/upload", "/api/cbm/chat/stickers/create", "/api/cbm/chat/sticker/create"):
            max_allowed_len = 15728640  # 15 MB for base64 encoded media uploads
        elif path == "/api/cbm/dev/products/upload-image":
            max_allowed_len = 1572864   # 1.5 MB for product icons
        else:
            max_allowed_len = 65536     # 64 KB default

        try:
            length = int(self.headers.get("Content-Length", 0))
        except (ValueError, TypeError):
            return self._send_json(400, {"status": "error", "message": "Invalid Content-Length header."})

        if length < 0:
            return self._send_json(400, {"status": "error", "message": "Negative Content-Length header is not permitted."})

        if length > max_allowed_len:
            try:
                if length <= 20971520:
                    _ = self.rfile.read(length)
            except Exception:
                pass
            return self._send_json(413, {"status": "error", "message": f"Payload Too Large: Maximum permitted request payload is {max_allowed_len // 1024}KB."}, headers={"Connection": "close"})

        try:
            raw_body = self.rfile.read(length).decode("utf-8", errors="replace") if length > 0 else "{}"
            ctype = self.headers.get("Content-Type", "")
            if "application/x-www-form-urlencoded" in ctype:
                parsed_form = urllib.parse.parse_qs(raw_body)
                body = {k: v[0] if v else "" for k, v in parsed_form.items()}
            else:
                try:
                    body = json.loads(raw_body)
                except Exception:
                    if "=" in raw_body and "{" not in raw_body:
                        parsed_form = urllib.parse.parse_qs(raw_body)
                        body = {k: v[0] if v else "" for k, v in parsed_form.items()}
                    else:
                        raise
        except Exception:
            return self._send_json(400, {"status": "error", "message": "Invalid request payload or encoding."})

        # 2. Client IP resolution with Cloudflare & trusted proxy header verification
        raw_client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
        trusted_proxies = {"127.0.0.1", "::1"}
        if raw_client_ip in trusted_proxies:
            client_ip = (
                self.headers.get("CF-Connecting-IP")
                or self.headers.get("X-Forwarded-For", "").split(",")[0].strip()
                or raw_client_ip
            )
        else:
            client_ip = raw_client_ip

        # Domain Origin Policy Enforcement for Internal First-Party Endpoints
        if is_internal_cbm_function(path):
            ok_origin, origin_err = self._enforce_domain_origin_policy()
            if not ok_origin:
                return self._send_json(403, {
                    "error": "forbidden_origin",
                    "message": origin_err
                })

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
            "/api/cbm/dev/keys/create",
            "/api/cbm/dev/keys/revoke",
            "/api/cbm/dev/products/create",
            "/api/cbm/dev/products/update",
            "/api/cbm/dev/products/archive",
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

            if not uname or not pwd or not avatar or not terri or not pin:
                return self._send_json(400, {
                    "status": "error",
                    "message": "username, password, avatar_url, primary_territorial_account, and pin are required."
                })

            pin_clean = str(pin).strip()
            if not pin_clean.isdigit() or len(pin_clean) < 4 or len(pin_clean) > 8:
                return self._send_json(400, {
                    "status": "error",
                    "message": "Quick Access PIN must consist of 4 to 8 numeric digits."
                })

            if len(uname) < 3 or len(uname) > 30:
                return self._send_json(400, {"status": "error", "message": "Username must be between 3 and 30 characters."})

            if len(pwd) < 6:
                return self._send_json(400, {"status": "error", "message": "Password must be at least 6 characters long."})

            # Non-custodial profile defaults
            display_name = uname
            clan_tag = "None"
            role = "member"

            ok, msg, acc = db.register_member_account(
                username=uname,
                password=pwd,
                avatar_url=avatar,
                primary_territorial_account=terri,
                pin=pin_clean,
                clan_tag=clan_tag,
                role=role,
                display_name=display_name
            )
            if ok:
                with _ACCOUNT_LOCK:
                    _ACCOUNT_CACHE.pop(uname.lower(), None)
                    _ACCOUNT_CACHE.pop(terri.lower(), None)
                if inviter_ref and inviter_ref.upper() != uname.upper():
                    try:
                        db.register_referral(inviter_ref, uname)
                    except Exception:
                        pass
                session_tok = create_session_token(uname)
                cookie_str = f"cbm_session={session_tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
                return self._send_json(
                    200,
                    {"status": "ok", "message": msg, "account": acc, "session_token": session_tok},
                    headers={"Set-Cookie": cookie_str}
                )
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        # 0b. CBM Non-Custodial Login (Password or PIN)
        elif path == "/api/cbm/auth/login":
            uname = (body.get("username") or body.get("account_name") or "").strip()
            pwd = body.get("password")
            pin = body.get("pin")

            if not uname:
                return self._send_json(400, {"status": "error", "message": "username is required."})

            acc = db.get_account(uname)
            if not acc:
                return self._send_json(404, {"status": "error", "message": f"Account '{uname}' not found."})

            # Check authentication methods:
            if pwd:
                if db.has_account_password(uname):
                    if db.verify_account_password(uname, pwd):
                        rate_limiter.record_auth_success(uname)
                        session_tok = create_session_token(uname)
                        cookie_str = f"cbm_session={session_tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
                        return self._send_json(200, {
                            "status": "ok",
                            "message": "Login successful.",
                            "auth_method": "PASSWORD",
                            "account": acc,
                            "session_token": session_tok
                        }, headers={"Set-Cookie": cookie_str})
                    else:
                        rate_limiter.record_auth_failure(uname)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid CBM password."})
                else:
                    return self._send_json(400, {
                        "status": "error",
                        "message": "No CBM password set for this account. Please log in with Quick PIN."
                    })

            elif pin:
                if db.has_account_pin(uname):
                    if db.verify_account_pin(uname, str(pin)):
                        rate_limiter.record_auth_success(uname)
                        session_tok = create_session_token(uname)
                        cookie_str = f"cbm_session={session_tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
                        return self._send_json(200, {
                            "status": "ok",
                            "message": "PIN verified successfully.",
                            "auth_method": "PIN",
                            "account": acc,
                            "session_token": session_tok
                        }, headers={"Set-Cookie": cookie_str})
                    else:
                        rate_limiter.record_auth_failure(uname)
                        return self._send_json(401, {"status": "unauthorized", "message": "Invalid Quick PIN."})
                else:
                    return self._send_json(400, {
                        "status": "error",
                        "message": "No PIN configured for this account. Please use CBM password."
                    })

            else:
                return self._send_json(400, {
                    "status": "error",
                    "message": "Please provide your CBM password or Quick PIN."
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
                session_tok = create_session_token(acc_name)
                cookie_str = f"cbm_session={session_tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
                return self._send_json(
                    200,
                    {"status": "ok", "message": "PIN verified successfully.", "session_token": session_tok},
                    headers={"Set-Cookie": cookie_str}
                )
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

            # Non-custodial protocol: Loans are backed by internal member collateral, transaction volume, and CBM authorization.
            # Player game passwords are never required, accepted, or handled.

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

        # 2. Link Payment Method (Strictly Non-Custodial via Transaction Ledger)
        elif path == "/api/cbm/link-payment-method":
            cbm_user = body.get("cbm_username", "").strip()
            terri_acc = body.get("territorial_account", "").strip()
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

            ok, msg, pm = account_mgr.link_via_transaction(
                cbm_username=cbm_user,
                territorial_account=terri_acc,
                display_name=display_name,
                is_primary=is_primary
            )

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
            api_k = body.get("api_key") or body.get("key") or ""
            app_name = body.get("app_name", "").strip() or "Discord Bot"
            env = body.get("environment", "live").strip()
            scopes = body.get("scopes", "read:bank,read:members").strip()

            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="admin", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            target_acc = auth_user or acc_name
            ok, secret, key_rec_out = db.create_api_key(target_acc, app_name, environment=env, scopes=scopes)
            if ok:
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"API Key created successfully for {app_name}. Store this secret safely - it will not be shown again!",
                    "api_key": secret,
                    "key_record": key_rec_out
                })
            else:
                return self._send_json(400, {"status": "error", "message": secret})

        elif path == "/api/cbm/dev/keys/revoke":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            api_k = body.get("api_key") or body.get("key") or ""
            key_id = body.get("key_id", "").strip()

            if not acc_name or not key_id:
                return self._send_json(400, {"status": "error", "message": "account_name and key_id are required."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="admin", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            target_acc = auth_user or acc_name
            ok, msg = db.revoke_api_key(key_id, target_acc)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        elif path == "/api/cbm/dev/products/create":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            api_k = body.get("api_key") or body.get("key") or ""
            name = body.get("name", "").strip()
            description = body.get("description", "").strip()
            try:
                price_gold = float(body.get("price_gold", 0))
            except (ValueError, TypeError):
                price_gold = 0.0
            image_url = body.get("image_url", "").strip()
            callback_url = body.get("callback_url", "").strip()
            if not callback_url or "territorial.io" in callback_url:
                callback_url = "https://pogxelqari.github.io/TerriX/client/"
            webhook_url = body.get("webhook_url", "").strip()

            if not acc_name or not name:
                return self._send_json(400, {"status": "error", "message": "account_name and name are required."})

            if price_gold < 100.0:
                return self._send_json(400, {"status": "error", "message": "Products must cost at least 100.00 Gold."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="write:products", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            target_acc = auth_user or acc_name
            ok, prod_or_err = db.create_product(
                owner_account=target_acc,
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
            api_k = body.get("api_key") or body.get("key") or ""
            product_id = body.get("product_id", "").strip()

            if not acc_name or not product_id:
                return self._send_json(400, {"status": "error", "message": "account_name and product_id are required."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="write:products", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            target_acc = auth_user or acc_name
            price_gold = None
            if "price_gold" in body:
                try:
                    price_gold = float(body["price_gold"])
                    if price_gold < 100.0:
                        return self._send_json(400, {"status": "error", "message": "Products must cost at least 100.00 Gold."})
                except (ValueError, TypeError):
                    return self._send_json(400, {"status": "error", "message": "Invalid price_gold."})

            cb = body.get("callback_url")
            if cb and "territorial.io" in cb:
                cb = "https://pogxelqari.github.io/TerriX/client/"

            ok, prod_or_err = db.update_product(
                product_id=product_id,
                owner_account=target_acc,
                name=body.get("name"),
                description=body.get("description"),
                price_gold=price_gold,
                image_url=body.get("image_url"),
                callback_url=cb,
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
            api_k = body.get("api_key") or body.get("key") or ""
            product_id = body.get("product_id", "").strip()

            if not acc_name or not product_id:
                return self._send_json(400, {"status": "error", "message": "account_name and product_id are required."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="write:products", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            target_acc = auth_user or acc_name
            ok, msg = db.archive_product(product_id, target_acc)
            if ok:
                return self._send_json(200, {"status": "ok", "message": msg})
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        elif path == "/api/cbm/dev/products/upload-image":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "")
            api_k = body.get("api_key") or body.get("key") or ""
            filename = body.get("filename", "").strip()
            image_data = body.get("image_data", "").strip()

            if not acc_name or not image_data:
                return self._send_json(400, {"status": "error", "message": "account_name and image_data are required."})

            ok, key_rec, auth_user, err = self._authenticate_dev_request(target_account=acc_name, pin=pin, required_scope="write:products", api_key=api_k)
            if not ok:
                return self._send_json(err["status"], err["body"], headers=err.get("headers"))

            if "," in image_data:
                image_data = image_data.split(",", 1)[1]

            try:
                raw_bytes = base64.b64decode(image_data)
            except Exception as e:
                return self._send_json(400, {"status": "error", "message": f"Invalid base64 image data: {e}"})

            if len(raw_bytes) > 1048576:
                return self._send_json(400, {"status": "error", "message": "Image exceeds 1MB maximum permitted size."})

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

            # Programmatically persist to database storage for recovery
            try:
                if db:
                    mimes = {
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".webp": "image/webp",
                        ".gif": "image/gif",
                        ".svg": "image/svg+xml",
                        ".avif": "image/avif"
                    }
                    db.save_asset(safe_filename, "products", mimes.get(ext, "image/png"), raw_bytes)
            except Exception as e:
                print(f"[!] Warning: Could not persist uploaded asset to DB: {e}")

            return self._send_json(200, {
                "status": "ok",
                "message": "Product image uploaded successfully.",
                "image_url": f"/assets/products/{safe_filename}"
            })

        # --- Internal / First-Party AI Inference APIs (POST) ---
        elif path == "/api/cbm/ai/chat":
            return self._handle_ai_chat_request(body, is_v1_api=False)

        elif path == "/api/cbm/ai/sessions":
            return self._handle_ai_session_create(body, is_v1_api=False)

        elif path.startswith("/api/cbm/ai/sessions/"):
            subpath = path[len("/api/cbm/ai/sessions/"):].strip("/")
            if "/" in subpath:
                sess_id, action = subpath.split("/", 1)
                if action in ("end", "delete"):
                    return self._handle_ai_session_delete(sess_id, is_v1_api=False)
                elif action == "clear":
                    return self._handle_ai_session_clear(sess_id, is_v1_api=False)
                else:
                    return self._send_json(404, {"error": "action_not_found", "message": f"Unknown session action '{action}'."}, is_dev_api=True)
            else:
                return self._handle_ai_session_update(subpath, body, is_v1_api=False)

        # --- First-Party Internal Endpoints (cbm.wispbyte.org) ---
        elif path == "/api/cbm/sponsorships/purchase":
            buyer = self._get_authenticated_user()
            if not buyer:
                req_account = body.get("account_name", "").strip()
                req_pin = body.get("pin", "").strip()
                if req_account and req_pin and db.verify_account_pin(req_account, req_pin):
                    buyer = req_account

            if not buyer:
                return self._send_json(401, {"status": "error", "message": "Authentication required to book a sponsorship lease. Please log in or provide valid credentials."})

            slot_id = body.get("slot_id", "").strip()
            title = body.get("title", "").strip()
            tagline = body.get("tagline", "").strip()
            target_url = body.get("target_url", "").strip()
            badge_text = body.get("badge_text", "PROMOTED").strip()
            image_url = body.get("image_url", "").strip() or None
            duration_days = int(body.get("duration_days", 7))

            success, msg, ad_rec = sponsorship_engine.purchase_sponsorship(
                db_instance=db,
                slot_id=slot_id,
                buyer_account=buyer,
                title=title,
                tagline=tagline,
                target_url=target_url,
                badge_text=badge_text,
                duration_days=duration_days,
                image_url=image_url
            )
            if success:
                invalidate_caches()
                return self._send_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": msg,
                    "sponsorship": ad_rec
                })
            else:
                return self._send_json(400, {"status": "error", "message": msg})

        elif path == "/api/cbm/products/order/create":
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

        elif path == "/api/cbm/products/order/pay-direct":
            return self._send_json(410, {
                "status": "deprecated",
                "message": "Direct credential payments are permanently discontinued for non-custodial security. Please pay via 15-Minute In-Game Slip or CBM Balance."
            })

        elif path == "/api/cbm/products/order/pay-balance":
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

            buyer_bal_cents = raw_acc.get("deposited_cents", 0)
            price_cents = order.get("price_cents", int(round(order.get("price_gold", 0) * 100)))
            if buyer_bal_cents < price_cents:
                return self._send_json(400, {
                    "status": "error",
                    "message": f"Insufficient member balance. You have {buyer_bal_cents / 100.0:.2f} Gold, but this product costs {price_cents / 100.0:.2f} Gold."
                })

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

            # 4. Create Product Order (15-minute checkout slip session via Developer API)
            elif path == "/api/v1/products/order/create":
                ok, key_rec, err = self._authenticate_api_v1("read:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                product_id = body.get("product_id", "").strip()
                buyer_name = body.get("buyer_account_name", "").strip() or None
                return_url = body.get("return_url", "").strip() or None

                if not product_id:
                    return self._send_api_v1_json(400, {"status": "error", "message": "product_id is required."}, key_record=key_rec)

                order = db.create_product_order(
                    product_id=product_id,
                    buyer_account_name=buyer_name,
                    target_vault_account=VAULT_ACCOUNT,
                    return_url=return_url
                )
                if not order:
                    return self._send_api_v1_json(404, {"status": "error", "message": f"Product '{product_id}' not found or is inactive."}, key_record=key_rec)

                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "order": order,
                    "payment_instructions": {
                        "target_vault_account": VAULT_ACCOUNT,
                        "exact_amount_gold": order["price_gold"],
                        "ttl_minutes": 15,
                        "expires_at": order["expires_at"]
                    }
                }, key_record=key_rec)

            # 5. Direct In-Game Credentials Payment (Permanently Decommissioned)
            elif path == "/api/v1/products/order/pay-direct":
                ok, key_rec, err = self._authenticate_api_v1("read:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)
                return self._send_api_v1_json(410, {
                    "status": "deprecated",
                    "message": "Direct credential payments are permanently discontinued for non-custodial security. Please pay via 15-Minute In-Game Slip or CBM Balance."
                }, key_record=key_rec)

            # 6. Pay with CBM Member Balance via Developer API
            elif path == "/api/v1/products/order/pay-balance":
                ok, key_rec, err = self._authenticate_api_v1("read:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                order_id = body.get("order_id", "").strip()
                cbm_username = body.get("cbm_username", "").strip()
                pin = body.get("pin", "")
                password = body.get("password", "")

                if not order_id or not cbm_username:
                    return self._send_api_v1_json(400, {"status": "error", "message": "order_id and cbm_username are required."}, key_record=key_rec)

                order = db.get_product_order(order_id)
                if not order:
                    return self._send_api_v1_json(404, {"status": "error", "message": f"Order '{order_id}' not found."}, key_record=key_rec)

                if order.get("status") == "FULFILLED":
                    return self._send_api_v1_json(200, {
                        "status": "ok",
                        "message": "Order is already fulfilled.",
                        "order": order,
                        "verification_token": order.get("verification_token")
                    }, key_record=key_rec)

                if order.get("status") != "PENDING":
                    return self._send_api_v1_json(400, {"status": "error", "message": f"Order status is {order.get('status')} and cannot be paid."}, key_record=key_rec)

                # Verify buyer auth
                raw_acc = db._get_account_raw(cbm_username)
                if not raw_acc:
                    return self._send_api_v1_json(404, {"status": "not_found", "message": f"CBM Member '{cbm_username}' not found."}, key_record=key_rec)
                canonical_name = raw_acc.get("account_name", cbm_username)

                if db.has_account_pin(canonical_name):
                    if not pin or not db.verify_account_pin(canonical_name, str(pin)):
                        rate_limiter.record_auth_failure(canonical_name)
                        return self._send_api_v1_json(401, {"status": "unauthorized", "message": "Invalid 6-digit CBM Access PIN."}, key_record=key_rec)
                    rate_limiter.record_auth_success(canonical_name)
                elif db.has_account_password(canonical_name):
                    auth_pwd = password or pin
                    if not auth_pwd or not db.verify_account_password(canonical_name, auth_pwd):
                        rate_limiter.record_auth_failure(canonical_name)
                        return self._send_api_v1_json(401, {"status": "unauthorized", "message": "Invalid password."}, key_record=key_rec)
                    rate_limiter.record_auth_success(canonical_name)

                # Check buyer balance
                buyer_bal_cents = raw_acc.get("deposited_cents", 0)
                price_cents = order.get("price_cents", int(round(order.get("price_gold", 0) * 100)))
                if buyer_bal_cents < price_cents:
                    return self._send_api_v1_json(400, {
                        "status": "error",
                        "message": f"Insufficient member balance. You have {buyer_bal_cents / 100.0:.2f} Gold, but this product costs {price_cents / 100.0:.2f} Gold."
                    }, key_record=key_rec)

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
                    return self._send_api_v1_json(400, {"status": "error", "message": ful_err}, key_record=key_rec)

                updated_order = db.get_product_order(order_id)
                invalidate_caches()
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": "Order paid from CBM member balance and fulfilled successfully.",
                    "order": updated_order,
                    "verification_token": updated_order.get("verification_token")
                }, key_record=key_rec)

            # 7. Cryptographic Verification of Product Order Token
            elif path in ("/api/v1/products/verify", "/api/v1/products/order/verify"):
                ok, key_rec, err = self._authenticate_api_v1("read:products")
                if not ok:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                token = body.get("token") or body.get("cbm_token") or ""
                order_id = body.get("order_id", "").strip()

                if not token or not order_id:
                    return self._send_api_v1_json(400, {"status": "error", "valid": False, "message": "token and order_id are required."}, key_record=key_rec)

                is_valid, order_or_err = db.verify_product_order_token(token=token, order_id=order_id)
                if is_valid:
                    return self._send_api_v1_json(200, {
                        "status": "ok",
                        "api_version": "v1.0",
                        "valid": True,
                        "order": order_or_err
                    }, key_record=key_rec)
                else:
                    return self._send_api_v1_json(400, {
                        "status": "error",
                        "api_version": "v1.0",
                        "valid": False,
                        "message": order_or_err
                    }, key_record=key_rec)

            # 8. Sponsorship Purchase & Ad Click Telemetry
            elif path in ("/api/v1/ads/click", "/api/cbm/ads/click"):
                ad_id = body.get("ad_id") or ""
                publisher_id = body.get("publisher_id") or None
                if not ad_id and "?" in self.path:
                    parsed_q = urllib.parse.parse_qs(self.path.split("?")[1])
                    ad_id = (parsed_q.get("ad_id") or [""])[0]
                    if not publisher_id:
                        publisher_id = (parsed_q.get("publisher_id") or [None])[0]

                if not ad_id:
                    return self._send_json(400, {"status": "error", "message": "ad_id parameter required."}, is_dev_api=True)

                client_ip = (self.headers.get("CF-Connecting-IP") or self.headers.get("X-Forwarded-For", "").split(",")[0].strip() or (self.client_address[0] if self.client_address else "127.0.0.1"))
                success = sponsorship_engine.record_click(db, ad_id, publisher_id=publisher_id, client_ip=client_ip)
                return self._send_json(200, {"status": "ok", "recorded": success, "ad_id": ad_id}, is_dev_api=True)

            elif path == "/api/v1/sponsorships/purchase":
                ok_key, key_rec, err = self._authenticate_api_v1("write:sponsorships")
                if not ok_key:
                    return self._send_json(err["status"], err["body"], headers=err.get("headers"), is_dev_api=True)

                buyer = key_rec.get("owner_account")
                slot_id = body.get("slot_id", "").strip()
                title = body.get("title", "").strip()
                tagline = body.get("tagline", "").strip()
                target_url = body.get("target_url", "").strip()
                badge_text = body.get("badge_text", "PROMOTED").strip()
                image_url = body.get("image_url", "").strip() or None
                duration_days = int(body.get("duration_days", 7))

                success, msg, ad_rec = sponsorship_engine.purchase_sponsorship(
                    db_instance=db,
                    slot_id=slot_id,
                    buyer_account=buyer,
                    title=title,
                    tagline=tagline,
                    target_url=target_url,
                    badge_text=badge_text,
                    image_url=image_url,
                    duration_days=duration_days
                )
                if not success:
                    return self._send_api_v1_json(400, {"error": "bad_request", "message": msg}, key_record=key_rec)

                invalidate_caches()
                return self._send_api_v1_json(200, {
                    "status": "ok",
                    "api_version": "v1.0",
                    "message": msg,
                    "sponsorship": ad_rec
                }, key_record=key_rec)

            # 9. AI Inference Chat Completion & Session Management
            elif path == "/api/v1/ai/chat":
                return self._handle_ai_chat_request(body, is_v1_api=True)

            elif path == "/api/v1/ai/sessions":
                return self._handle_ai_session_create(body, is_v1_api=True)

            elif path.startswith("/api/v1/ai/sessions/"):
                subpath = path[len("/api/v1/ai/sessions/"):].strip("/")
                if "/" in subpath:
                    sess_id, action = subpath.split("/", 1)
                    if action in ("end", "delete"):
                        return self._handle_ai_session_delete(sess_id, is_v1_api=True)
                    elif action == "clear":
                        return self._handle_ai_session_clear(sess_id, is_v1_api=True)
                    else:
                        return self._send_json(404, {"error": "action_not_found", "message": f"Unknown session action '{action}'."}, is_dev_api=True)
                else:
                    return self._handle_ai_session_update(subpath, body, is_v1_api=True)

            return self._send_json(404, {"error": "endpoint_not_found", "message": f"API v1 route '{path}' does not exist."}, is_dev_api=True)

        # ---- Referral Program Endpoints ----
        elif path == "/api/cbm/referral/stats":
            account_name = (body.get("account_name") or "").strip()
            if not account_name:
                return self._send_json(400, {"status": "error", "message": "account_name is required."})
            stats = db.get_referral_stats(account_name) if hasattr(db, "get_referral_stats") else {}
            # Build invite link
            ref_code = account_name
            invite_link = f"/register?ref={urllib.parse.quote(ref_code)}"
            return self._send_json(200, {
                "status": "ok",
                "account": account_name,
                "referral_stats": stats,
                "invite_link": invite_link,
                "tiers": [
                    {
                        "tier": 1,
                        "name": "Member Onboarding",
                        "inviter_reward_gold": 15,
                        "invitee_reward_gold": 10,
                        "required_deposits_gold": 500,
                        "required_donations_gold": 100
                    },
                    {
                        "tier": 2,
                        "name": "Active Supporter",
                        "inviter_reward_gold": 35,
                        "invitee_reward_gold": 0,
                        "required_deposits_gold": 1000,
                        "required_donations_gold": 300
                    },
                    {
                        "tier": 3,
                        "name": "Clan Benefactor",
                        "inviter_reward_gold": 100,
                        "invitee_reward_gold": 25,
                        "required_deposits_gold": 2500,
                        "required_donations_gold": 1000
                    }
                ],
                "perpetual_patron_commission_percent": 10
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

        # Temporary Disposable Chatroom Endpoints (POST)
        elif path == "/api/cbm/chat/create":
            room_id = (body.get("room_id") or "").strip()
            creator_name = (body.get("creator_name") or body.get("sender_name") or "Anonymous").strip()
            room = chat_engine.get_or_create_room(room_id, creator_name=creator_name)
            return self._send_json(200, {
                "status": "ok",
                "room_id": room.room_id,
                "created_at": room.created_at,
                "max_messages": 100,
                "limits": {
                    "max_content_length": 500,
                    "max_image_bytes": 4 * 1024 * 1024,
                    "max_video_bytes": 10 * 1024 * 1024,
                    "max_file_bytes": 5 * 1024 * 1024
                }
            })

        elif path == "/api/cbm/chat/check":
            # Pre-flight content moderation endpoint
            content = (body.get("content") or "").strip()
            image_b64 = body.get("image_data") or body.get("image_b64") or None

            # Check client API Key authorization (e.g. TerriX Official Client)
            auth_header = self.headers.get("Authorization", "").strip()
            api_key_hdr = self.headers.get("X-CBM-API-Key", "").strip()
            token_key = auth_header[7:].strip() if auth_header.startswith("Bearer ") else (api_key_hdr or str(body.get("api_key") or "").strip())
            is_client_authorized = False
            client_app_name = None
            if token_key and (token_key.startswith("cbm_live_") or token_key.startswith("cbm_test_") or token_key.startswith("cbm_key_") or token_key.startswith("cbm_")):
                key_valid, key_record = db.verify_api_key(token_key)
                if key_valid and key_record:
                    is_client_authorized = True
                    client_app_name = key_record.get("app_name")

            safety_res = check_message_safety(content, image_b64=image_b64)
            resp = {
                "status": "ok",
                "is_safe": safety_res.get("is_safe", True),
                "reason": safety_res.get("reason", ""),
                "categories": safety_res.get("categories", []),
                "layer": safety_res.get("layer", "L3_NEMOTRON_3.5"),
                "model": safety_res.get("model", "nvidia/nemotron-3.5-content-safety")
            }
            if is_client_authorized:
                resp["client_authorized"] = True
                resp["client_app"] = client_app_name
            return self._send_json(200, resp)

        elif path == "/api/cbm/chat/send":
            room_id = (body.get("room_id") or "").strip()
            if not room_id:
                return self._send_json(400, {"status": "error", "message": "room_id is required."})

            room = chat_engine.get_room(room_id)
            if not room:
                room = chat_engine.get_or_create_room(room_id, creator_name=body.get("sender_name", "Anonymous"))

            # Check client API Key authorization (e.g. TerriX Official Client)
            auth_header = self.headers.get("Authorization", "").strip()
            api_key_hdr = self.headers.get("X-CBM-API-Key", "").strip()
            token_key = auth_header[7:].strip() if auth_header.startswith("Bearer ") else (api_key_hdr or str(body.get("api_key") or "").strip())
            is_client_authorized = False
            client_app_name = None
            key_record = None
            if token_key and (token_key.startswith("cbm_live_") or token_key.startswith("cbm_test_") or token_key.startswith("cbm_key_") or token_key.startswith("cbm_")):
                key_valid, k_rec = db.verify_api_key(token_key)
                if key_valid and k_rec:
                    is_client_authorized = True
                    client_app_name = k_rec.get("app_name")
                    key_record = k_rec

            # Dual Authentication: CBM Member Auth vs. Anonymous Territorial.io Auth
            auth_type = "TERRITORIAL_ANONYMOUS"
            is_cbm_verified = False
            cbm_role = None
            cbm_auth = body.get("cbm_auth") or {}
            cbm_user = (body.get("cbm_username") or cbm_auth.get("username") or "").strip()
            cbm_pwd = body.get("cbm_password") or cbm_auth.get("password") or ""
            cbm_pin = body.get("cbm_pin") or cbm_auth.get("pin") or ""

            if cbm_user and (cbm_pwd or cbm_pin):
                raw_acc = db._get_account_raw(cbm_user)
                if raw_acc:
                    canon_name = raw_acc.get("account_name", cbm_user)
                    auth_ok = False
                    if cbm_pin and db.has_account_pin(canon_name):
                        auth_ok = db.verify_account_pin(canon_name, str(cbm_pin))
                    elif cbm_pwd and db.has_account_password(canon_name):
                        auth_ok = db.verify_account_password(canon_name, cbm_pwd)

                    if auth_ok:
                        auth_type = "CBM_MEMBER"
                        is_cbm_verified = True
                        sender_name = canon_name
                        sender_clan = raw_acc.get("clan_tag", "ANTI-OG")
                        cbm_role = raw_acc.get("role", "member")
                    else:
                        return self._send_json(401, {
                            "status": "unauthorized",
                            "message": f"CBM Member authentication failed for '{cbm_user}'. Incorrect PIN or password."
                        })
                else:
                    return self._send_json(404, {
                        "status": "error",
                        "message": f"CBM account '{cbm_user}' not found."
                    })
            elif is_client_authorized:
                # Authorized Client (e.g. TerriX Official Client)
                auth_type = "TERRITORIAL_OFFICIAL_CLIENT"
                is_cbm_verified = True
                sender_name = (body.get("sender_name") or body.get("player_name") or "TerriX Player").strip()
                sender_clan = (body.get("sender_clan") or body.get("clan") or "").strip()
            else:
                # Anonymous Territorial.io Player
                sender_name = (body.get("sender_name") or body.get("player_name") or "Anonymous").strip()
                sender_clan = (body.get("sender_clan") or body.get("clan") or "").strip()

            # Token-bucket rate limiting (prioritize API Key RPM for authorized client)
            if is_client_authorized and key_record:
                key_id = key_record.get("key_id", "terrix_official")
                key_rpm = int(key_record.get("rate_limit_rpm", 600))
                allowed, _ = rate_limiter.check_rate_limit(f"api_key_chat_{key_id}_{client_ip}", limit=key_rpm, period_seconds=60)
                if not allowed:
                    return self._send_json(429, {
                        "status": "error",
                        "message": "Chat rate limit exceeded for client API key. Please slow down."
                    }, headers={"Retry-After": "2"})
            else:
                rate_key = f"{client_ip}_{sender_name}"
                if not room.check_rate_limit(rate_key):
                    return self._send_json(429, {
                        "status": "error",
                        "message": "Chat rate limit exceeded. Please wait a moment before sending more messages."
                    }, headers={"Retry-After": "3"})

            content = body.get("content", "")
            player_index = body.get("player_index")
            try:
                if player_index is not None:
                    player_index = int(player_index)
            except (ValueError, TypeError):
                player_index = None

            attachments = body.get("attachments", [])
            if not isinstance(attachments, list):
                attachments = []
            is_whitelisted = db.is_account_whitelisted(sender_name) if is_cbm_verified else False

            # Ingress Gate: validate message via Nemotron 3.5 Content Safety pipeline before storing
            safety_res = check_message_safety(content, attachments=attachments)
            if not safety_res.get("is_safe", True):
                reason = safety_res.get("reason") or "Message blocked by automated AI safety policy."
                categories = safety_res.get("categories", [])
                return self._send_json(400, {
                    "status": "error",
                    "error": "content_safety_violation",
                    "message": reason,
                    "categories": categories,
                    "layer": safety_res.get("layer", "L3_NEMOTRON_3.5")
                })

            ok, msg_or_err = room.add_message(
                sender_name=sender_name,
                sender_clan=sender_clan,
                content=content,
                player_index=player_index,
                attachments=attachments,
                auth_type=auth_type,
                is_cbm_verified=is_cbm_verified,
                cbm_role=cbm_role,
                is_whitelisted=is_whitelisted,
                client_app=client_app_name
            )
            if not ok:
                return self._send_json(400, {"status": "error", "message": msg_or_err})

            return self._send_json(200, {
                "status": "ok",
                "message": msg_or_err
            })

        # Temporary User-Generated Custom Stickers & Emojis Endpoint (POST)
        elif path in ("/api/cbm/chat/stickers/create", "/api/cbm/chat/sticker/create"):
            room_id = (body.get("room_id") or "").strip()
            shortcode = (body.get("shortcode") or body.get("code") or "").strip()
            name = (body.get("name") or "").strip()
            img_b64 = body.get("image_data") or body.get("image_bytes") or body.get("data") or ""
            creator_name = (body.get("creator_name") or body.get("sender_name") or "Anonymous").strip()

            if not room_id or not shortcode or not img_b64:
                return self._send_json(400, {"status": "error", "message": "room_id, shortcode (e.g. :pepe:), and image_data (base64) are required."})

            room = chat_engine.get_room(room_id)
            if not room or room.is_ended:
                return self._send_json(404, {"status": "error", "message": "Chatroom has ended or does not exist."})

            try:
                if "," in img_b64:
                    img_b64 = img_b64.split(",", 1)[1]
                img_bytes = base64.b64decode(img_b64)
            except Exception as e:
                return self._send_json(400, {"status": "error", "message": f"Invalid base64 image data: {e}"})

            ok, sticker_or_err = room.register_custom_sticker(
                shortcode=shortcode,
                name=name or shortcode.strip(":"),
                image_bytes=img_bytes,
                creator_name=creator_name
            )
            if not ok:
                return self._send_json(400, {"status": "error", "message": sticker_or_err})

            return self._send_json(200, {
                "status": "ok",
                "sticker": sticker_or_err,
                "message": f"Temporary custom sticker '{shortcode}' created for room '{room_id}'."
            })

        elif path == "/api/cbm/chat/upload":
            room_id = (body.get("room_id") or "").strip()
            filename = (body.get("filename") or "").strip()
            file_data_b64 = body.get("file_data") or body.get("data") or ""
            category = (body.get("category") or "file").strip().lower()

            if not room_id or not filename or not file_data_b64:
                return self._send_json(400, {"status": "error", "message": "room_id, filename, and file_data (base64) are required."})

            if category not in ("image", "video", "file"):
                category = "file"

            try:
                # Strip data URL scheme prefix if present
                if "," in file_data_b64:
                    file_data_b64 = file_data_b64.split(",", 1)[1]
                file_bytes = base64.b64decode(file_data_b64)
            except Exception as e:
                return self._send_json(400, {"status": "error", "message": f"Invalid base64 payload: {e}"})

            ok, att_or_err = chat_engine.save_attachment(
                room_id=room_id,
                filename=filename,
                file_bytes=file_bytes,
                category=category
            )
            if not ok:
                return self._send_json(400, {"status": "error", "message": att_or_err})

            return self._send_json(200, {
                "status": "ok",
                "attachment": att_or_err
            })

        elif path == "/api/cbm/chat/end":
            room_id = (body.get("room_id") or "").strip()
            if not room_id:
                return self._send_json(400, {"status": "error", "message": "room_id is required."})

            ended = chat_engine.end_room(room_id)
            return self._send_json(200, {
                "status": "ok",
                "room_id": room_id,
                "ended": ended,
                "message": f"Disposable chatroom '{room_id}' and all ephemeral media permanently deleted."
            })

        elif path in ("/api/cbm/chat/whitelist/add", "/api/v1/chat/whitelist/add"):
            admin_user = (body.get("admin_account") or body.get("admin_user") or "").strip()
            admin_pin = str(body.get("admin_pin", "")).strip()
            target_acc = (body.get("account_name") or body.get("account") or "").strip()
            notes = (body.get("notes") or "").strip()

            auth_header = self.headers.get("Authorization", "")
            token_auth_user = None
            if auth_header.startswith("Bearer "):
                tok = auth_header.split(" ", 1)[1].strip()
                tok_user = verify_session_token(tok)
                if tok_user:
                    token_auth_user = tok_user

            operator = token_auth_user or admin_user
            if not operator:
                return self._send_json(401, {"status": "unauthorized", "message": "Admin authentication required."})

            raw_admin = db._get_account_raw(operator)
            if not raw_admin or raw_admin.get("role") not in ("leader", "system", "admin", "co-leader"):
                return self._send_json(403, {"status": "forbidden", "message": "Only clan administrators can manage the chat whitelist."})

            if not token_auth_user and not db.verify_account_pin(operator, admin_pin):
                return self._send_json(401, {"status": "unauthorized", "message": "Invalid admin PIN."})

            ok, msg = db.add_to_chat_whitelist(target_acc, added_by=operator, notes=notes)
            return self._send_json(200 if ok else 400, {"status": "ok" if ok else "error", "message": msg})

        elif path in ("/api/cbm/chat/whitelist/remove", "/api/v1/chat/whitelist/remove"):
            admin_user = (body.get("admin_account") or body.get("admin_user") or "").strip()
            admin_pin = str(body.get("admin_pin", "")).strip()
            target_acc = (body.get("account_name") or body.get("account") or "").strip()

            auth_header = self.headers.get("Authorization", "")
            token_auth_user = None
            if auth_header.startswith("Bearer "):
                tok = auth_header.split(" ", 1)[1].strip()
                tok_user = verify_session_token(tok)
                if tok_user:
                    token_auth_user = tok_user

            operator = token_auth_user or admin_user
            if not operator:
                return self._send_json(401, {"status": "unauthorized", "message": "Admin authentication required."})

            raw_admin = db._get_account_raw(operator)
            if not raw_admin or raw_admin.get("role") not in ("leader", "system", "admin", "co-leader"):
                return self._send_json(403, {"status": "forbidden", "message": "Only clan administrators can manage the chat whitelist."})

            if not token_auth_user and not db.verify_account_pin(operator, admin_pin):
                return self._send_json(401, {"status": "unauthorized", "message": "Invalid admin PIN."})

            ok, msg = db.remove_from_chat_whitelist(target_acc)
            return self._send_json(200 if ok else 400, {"status": "ok" if ok else "error", "message": msg})

        # --- Authoritative OAuth 2.0 Token Exchange ---
        elif path == "/api/oauth/token":
            grant_type = body.get("grant_type", "")
            code = body.get("code", "")
            redirect_uri = body.get("redirect_uri", "")
            client_id = body.get("client_id", "")
            client_secret = body.get("client_secret", "")
            code_verifier = body.get("code_verifier", "")

            # Support HTTP Basic Auth for client_id:client_secret (RFC 6749 Section 2.3.1)
            auth_hdr = self.headers.get("Authorization", "").strip()
            if auth_hdr.startswith("Basic "):
                try:
                    decoded = base64.b64decode(auth_hdr[6:].strip()).decode("utf-8")
                    if ":" in decoded:
                        b_id, b_sec = decoded.split(":", 1)
                        if not client_id:
                            client_id = b_id
                        if not client_secret:
                            client_secret = b_sec
                except Exception:
                    pass

            if grant_type != "authorization_code":
                return self._send_json(400, {
                    "error": "unsupported_grant_type",
                    "message": "Only grant_type='authorization_code' is supported."
                }, is_dev_api=True)

            if not code or not client_id or not redirect_uri:
                return self._send_json(400, {
                    "error": "invalid_request",
                    "message": "Missing required parameters: code, client_id, and redirect_uri are required."
                }, is_dev_api=True)

            client = db.get_oauth_client(client_id)
            if not client:
                return self._send_json(401, {
                    "error": "invalid_client",
                    "message": "Unknown or inactive client application."
                }, is_dev_api=True)

            # Validate client credentials for confidential clients
            if client.get("client_type") == "confidential":
                if not db.verify_oauth_client_secret(client_id, client_secret):
                    return self._send_json(401, {
                        "error": "invalid_client",
                        "message": "Client secret authentication failed."
                    }, is_dev_api=True)

            # Atomically consume authorization code
            code_record = db.consume_oauth_code(code, client_id, redirect_uri)
            if not code_record:
                return self._send_json(400, {
                    "error": "invalid_grant",
                    "message": "Authorization code is invalid, expired, or has already been consumed."
                }, is_dev_api=True)

            # Validate PKCE code_verifier if code_challenge was established
            stored_challenge = code_record.get("code_challenge", "")
            if stored_challenge:
                if not code_verifier:
                    return self._send_json(400, {
                        "error": "invalid_request",
                        "message": "Code verifier is required for PKCE-bound authorization codes."
                    }, is_dev_api=True)

                digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
                computed_challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
                if not hmac.compare_digest(computed_challenge, stored_challenge):
                    return self._send_json(400, {
                        "error": "invalid_grant",
                        "message": "PKCE code_verifier does not match the original code_challenge."
                    }, is_dev_api=True)

            # Issue OAuth Access Token
            raw_token, expires_in = db.create_oauth_tokens(
                client_id=client_id,
                account_name=code_record["account_name"],
                scope=code_record.get("scope", "openid profile"),
                access_ttl=3600
            )

            # Issue Signed ID Token (JWT)
            now_ts = int(time.time())
            acc = db.get_account(code_record["account_name"])
            disp_name = (acc.get("display_name") if acc else None) or code_record["account_name"]
            base_issuer = WISPBYTE_SERVER_URL.rstrip("/")
            id_payload = {
                "iss": base_issuer,
                "sub": code_record["account_name"],
                "aud": client_id,
                "exp": now_ts + 3600,
                "iat": now_ts,
                "auth_time": int(code_record.get("created_at", now_ts)),
                "preferred_username": code_record["account_name"],
                "display_name": disp_name,
                "clan_role": acc.get("role", "member") if acc else "member"
            }
            if acc and acc.get("email"):
                id_payload["email"] = acc["email"]
                id_payload["email_verified"] = bool(acc.get("email"))
            if code_record.get("nonce"):
                id_payload["nonce"] = code_record["nonce"]

            hmac_key = crypto_util.get_master_hmac_key()
            if jwt is not None:
                id_token = jwt.encode(id_payload, hmac_key, algorithm="HS256")
            else:
                id_token = crypto_util.encode_hs256_jwt(id_payload, hmac_key)

            token_response = {
                "access_token": raw_token,
                "token_type": "Bearer",
                "expires_in": expires_in,
                "id_token": id_token,
                "scope": code_record.get("scope", "openid profile")
            }
            return self._send_json(200, token_response, is_dev_api=True)

        # --- Authoritative OIDC UserInfo Endpoint (POST) ---
        elif path == "/api/oauth/userinfo":
            auth_header = self.headers.get("Authorization", "").strip()
            token = ""
            if auth_header.startswith("Bearer "):
                token = auth_header[7:].strip()
            elif body.get("access_token"):
                token = body.get("access_token")

            if not token:
                return self._send_json(401, {
                    "error": "unauthorized",
                    "message": "Missing Bearer access token."
                }, headers={"WWW-Authenticate": 'Bearer error="invalid_token"'}, is_dev_api=True)

            tok_record = db.verify_oauth_access_token(token)
            if not tok_record:
                return self._send_json(401, {
                    "error": "invalid_token",
                    "message": "Access token is invalid, expired, or revoked."
                }, headers={"WWW-Authenticate": 'Bearer error="invalid_token"'}, is_dev_api=True)

            acc_name = tok_record["account_name"]
            acc = db.get_account(acc_name)
            disp_name = (acc.get("display_name") if acc else None) or acc_name
            email = acc.get("email") if acc else None

            claims = {
                "sub": acc_name,
                "preferred_username": acc_name,
                "display_name": disp_name,
                "email": email,
                "email_verified": bool(email),
                "avatar_url": acc.get("avatar_url") if acc else None,
                "clan_role": acc.get("role", "member") if acc else "member",
                "client_id": tok_record.get("client_id")
            }
            return self._send_json(200, claims, is_dev_api=True)

        # --- Register New OAuth Client Application (POST) ---
        elif path == "/api/cbm/oauth/clients/create":
            auth_user = self._get_authenticated_user()
            if not auth_user:
                return self._send_json(401, {"status": "error", "message": "Authentication required."})

            client_name = body.get("client_name", "").strip()
            redirect_uris = body.get("redirect_uris", [])
            client_type = body.get("client_type", "confidential").strip()
            allowed_scopes = body.get("allowed_scopes", "openid profile email").strip()
            logo_url = body.get("logo_url")

            if isinstance(redirect_uris, str):
                redirect_uris = [u.strip() for u in redirect_uris.split("\n") if u.strip()]

            ok, client_record, msg = db.create_oauth_client(
                owner_account=auth_user,
                client_name=client_name,
                redirect_uris=redirect_uris,
                client_type=client_type,
                allowed_scopes=allowed_scopes,
                logo_url=logo_url
            )
            if not ok:
                return self._send_json(400, {"status": "error", "message": msg})

            return self._send_json(200, {
                "status": "ok",
                "message": msg,
                "client": client_record
            })

        else:
            return self._send_json(404, {"status": "error", "message": "Not found"})

    def do_DELETE(self):
        try:
            self._do_DELETE()
        except Exception as unhandled:
            print(f"[!] Unhandled error in do_DELETE: {unhandled}")
            try:
                self._send_json(500, {"status": "error", "message": "Service temporarily busy. Please retry."})
            except Exception:
                pass

    def _do_DELETE(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")

        if path.startswith("/api/v1/ai/sessions/"):
            session_id = path[len("/api/v1/ai/sessions/"):].strip("/")
            return self._handle_ai_session_delete(session_id, is_v1_api=True)
        elif path.startswith("/api/cbm/ai/sessions/"):
            session_id = path[len("/api/cbm/ai/sessions/"):].strip("/")
            return self._handle_ai_session_delete(session_id, is_v1_api=False)

        return self._send_json(404, {"error": "endpoint_not_found", "message": f"DELETE route '{path}' does not exist."}, is_dev_api=is_cors_bypassed_endpoint(path))

    def do_PATCH(self):
        try:
            self._do_PATCH()
        except Exception as unhandled:
            print(f"[!] Unhandled error in do_PATCH: {unhandled}")
            try:
                self._send_json(500, {"status": "error", "message": "Service temporarily busy. Please retry."})
            except Exception:
                pass

    def _do_PATCH(self):
        parsed = self.path.split("?")
        path = parsed[0].rstrip("/")

        try:
            length = int(self.headers.get("Content-Length", 0))
        except (ValueError, TypeError):
            return self._send_json(400, {"status": "error", "message": "Invalid Content-Length header."})

        try:
            raw_body = self.rfile.read(length).decode("utf-8", errors="replace") if length > 0 else "{}"
            body = json.loads(raw_body) if raw_body.strip() else {}
        except Exception:
            return self._send_json(400, {"status": "error", "message": "Invalid JSON in PATCH body."})

        if path.startswith("/api/v1/ai/sessions/"):
            session_id = path[len("/api/v1/ai/sessions/"):].strip("/")
            return self._handle_ai_session_update(session_id, body, is_v1_api=True)
        elif path.startswith("/api/cbm/ai/sessions/"):
            session_id = path[len("/api/cbm/ai/sessions/"):].strip("/")
            return self._handle_ai_session_update(session_id, body, is_v1_api=False)

        return self._send_json(404, {"error": "endpoint_not_found", "message": f"PATCH route '{path}' does not exist."}, is_dev_api=is_cors_bypassed_endpoint(path))

    def log_message(self, format, *args):
        # Suppress routine health check log spam
        pass

class CBMThreadPoolServer(HTTPServer):
    """
    High-concurrency, bounded thread pool HTTP server designed for CPU-constrained environments.
    Limits execution to at most 24 worker threads (configurable via MAX_SERVER_WORKERS),
    eliminating thread explosion and context-switch thrashing while effortlessly servicing 100+ concurrent clients.
    """
    request_queue_size = 256
    allow_reuse_address = True

    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        if hasattr(socket, "SO_REUSEPORT"):
            try:
                self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
            except Exception:
                pass
        super().server_bind()

    def __init__(self, server_address, RequestHandlerClass, max_workers=None):
        super().__init__(server_address, RequestHandlerClass)
        if max_workers is None:
            max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 24))
        self.executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="cbm_worker")

    def process_request(self, request, client_address):
        self.executor.submit(self._process_request_thread, request, client_address)

    def _process_request_thread(self, request, client_address):
        try:
            try:
                request.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            except Exception:
                pass
            try:
                # 1s linger allows kernel to gracefully deliver pending data before closing
                request.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack('ii', 1, 1))
            except Exception:
                pass
            self.finish_request(request, client_address)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, socket.timeout):
            pass
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)

    def shutdown_request(self, request):
        try:
            request.shutdown(socket.SHUT_WR)
        except Exception:
            pass
        self.close_request(request)

    def handle_error(self, request, client_address):
        exc_type, exc_val, _ = sys.exc_info()
        if exc_type in (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, socket.timeout):
            return
        if exc_type is sqlite3.OperationalError and any(k in str(exc_val).lower() for k in ("locked", "busy")):
            print(f"[!] Server concurrency notice: Database busy for request from {client_address}")
            return
        super().handle_error(request, client_address)

    def server_close(self):
        super().server_close()
        self.executor.shutdown(wait=False)

_SERVER_INSTANCE = None
_AI_SESSION_GC_STARTED = False

def _start_ai_session_gc_daemon():
    """Starts the background AI session garbage collection worker if not already running."""
    global _AI_SESSION_GC_STARTED
    if _AI_SESSION_GC_STARTED:
        return
    _AI_SESSION_GC_STARTED = True

    def _gc_loop():
        while True:
            try:
                time.sleep(600)  # Sweep every 10 minutes
                if db:
                    pruned = db.prune_expired_ai_sessions()
                    if pruned > 0:
                        print(f"[*] AI Session GC: Cleaned up {pruned} expired sessions.")
            except Exception:
                time.sleep(30)

    t = threading.Thread(target=_gc_loop, daemon=True, name="cbm_ai_session_gc")
    t.start()

def run_http_server():
    global _SERVER_INSTANCE
    _start_ai_session_gc_daemon()
    max_workers = int(os.environ.get("MAX_SERVER_WORKERS", 24))
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

    # 1. Start HTTP health server immediately (binds port 10093 in < 50ms)
    http_thread = threading.Thread(target=run_http_server, daemon=True, name="cbm_http_server")
    http_thread.start()

    # 2. Pre-load static assets sequentially in main thread (now cached in RAM)
    load_static_cache()
    gc.collect()

    # 3. Start deposit ingestion worker in background thread
    daemon_thread = threading.Thread(target=deposit_daemon.run, daemon=True, name="cbm_deposit_daemon")
    daemon_thread.start()

    # 3. Start Cloudflare Tunnel (Zero-Trust Ingress)
    if tunnel_mgr:
        tunnel_mgr.start()

    # 4. Setup graceful signal handling
    def handle_signal(sig, frame):
        print("\n[!] Received shutdown signal. Stopping CBM server, daemon, and tunnel...")
        if _SERVER_INSTANCE:
            try:
                _SERVER_INSTANCE.shutdown()
            except Exception:
                pass
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
        try:
            now = time.time()
            if (now - last_loan_audit) > 600.0:  # Check every 10 minutes
                last_loan_audit = now
                try:
                    db.audit_loan_credential_liveness()
                except Exception as e:
                    print(f"[!] Background loan audit error: {e}")
                try:
                    db.prune_expired_ai_sessions()
                except Exception:
                    pass
            time.sleep(30)
        except (KeyboardInterrupt, SystemExit):
            break
        except Exception as loop_err:
            print(f"[!] Background supervisor loop notice: {loop_err}")
            time.sleep(5)

if __name__ == "__main__":
    main()
