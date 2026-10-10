#!/usr/bin/env python3
"""
CBM Database & Ledger Access Layer
===================================
Hybrid backend supporting:
1. Supabase PostgreSQL via PostgREST REST API (cloud multi-instance sync)
2. Local ACID SQLite fallback (immediate zero-dependency execution)
"""

import os
import sys
import json
import time
import datetime
import sqlite3
import uuid
import hashlib
import secrets
import hmac
import unicodedata
import re
import urllib.parse
import urllib.request
import urllib.error
import threading
import queue
from contextlib import contextmanager
from typing import Dict, Any, Optional, List, Tuple, Set, Union

_DB_WRITE_LOCK = threading.RLock()
_PENDING_IMPRESSIONS: Dict[str, int] = {}
_PENDING_IMPRESSIONS_LOCK = threading.Lock()

def _configure_sqlite_pragmas(conn: sqlite3.Connection):
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 60000;")
    conn.execute("PRAGMA cache_size = -4000;")       # 4 MB memory cache max
    conn.execute("PRAGMA temp_store = MEMORY;")
    conn.execute("PRAGMA wal_autocheckpoint = 100;") # Prevent WAL growth over 10 MB
    conn.execute("PRAGMA mmap_size = 16777216;")     # 16 MB memory-mapped I/O


def is_cbm_plus_active(account_dict: Optional[Dict[str, Any]]) -> bool:
    """Evaluates whether an account holds an active CBM Plus subscription or root privilege."""
    if not account_dict:
        return False
    if account_dict.get("role") in ("admin", "council", "leader", "system"):
        return True
    until = account_dict.get("cbm_plus_until")
    if not until:
        return False
    if isinstance(until, (int, float)):
        return float(until) > time.time()
    try:
        clean = str(until).replace("Z", "+00:00")
        dt = datetime.datetime.fromisoformat(clean)
        return dt.timestamp() > time.time()
    except Exception:
        return False


try:
    import urllib3
except ImportError:
    urllib3 = None

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from rate_limiter import rate_limiter
except ImportError:
    try:
        from cbm_wispbyte.rate_limiter import rate_limiter
    except ImportError:
        rate_limiter = None

try:
    from loan_engine import CBMLoanEngine
except ImportError:
    from cbm_wispbyte.loan_engine import CBMLoanEngine

try:
    from gold_api_client import TerritorialGoldClient
except ImportError:
    from cbm_wispbyte.gold_api_client import TerritorialGoldClient

try:
    from crypto_util import (
        encrypt_credential, decrypt_credential,
        generate_order_verification_token, constant_time_verify, get_master_hmac_key
    )
except ImportError:
    from cbm_wispbyte.crypto_util import (
        encrypt_credential, decrypt_credential,
        generate_order_verification_token, constant_time_verify, get_master_hmac_key
    )
class CBMDatabase:
    def __init__(self, sqlite_path: str = "cbm_data.db", use_supabase: Optional[bool] = None, db_path: Optional[str] = None):
        target_path = db_path or sqlite_path
        base_dir = os.path.dirname(os.path.abspath(__file__))
        if not os.path.isabs(target_path):
            target_path = os.path.join(base_dir, target_path)

        # ZERO PRODUCTION POLLUTION SAFETY GUARD:
        # Automatically detects unit tests, pytest, or scratch test suites.
        # Under NO circumstances should automated tests ever touch production cbm_data.db or Supabase!
        is_test_env = (
            "unittest" in sys.modules
            or "pytest" in sys.modules
            or os.environ.get("CBM_ENV") == "test"
            or bool(os.environ.get("PYTEST_CURRENT_TEST"))
            or (len(sys.argv) > 0 and any("test" in str(arg).lower() for arg in sys.argv))
        )
        allow_live_prod = os.environ.get("ALLOW_LIVE_PROD_ACCESS", "").lower() in ("1", "true")

        if is_test_env and not allow_live_prod:
            use_supabase = False
            # Divert production cbm_data.db to isolated sandbox
            if os.path.basename(target_path) == "cbm_data.db":
                import tempfile
                sandbox_path = os.path.join(tempfile.gettempdir(), "cbm_test_sandbox.db")
                target_path = sandbox_path

        self.sqlite_path = target_path
        self.supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.supabase_key = (
            os.environ.get("SUPABASE_KEY")
            or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            or ""
        )
        if use_supabase is not None:
            self.use_supabase = use_supabase
        else:
            self.use_supabase = bool(self.supabase_url and self.supabase_key)
        self.vault_account = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
        self._loan_reconcile_throttle: Dict[str, float] = {}

        if urllib3 is not None and self.use_supabase:
            self._http_pool = urllib3.PoolManager(
                maxsize=20,
                timeout=urllib3.Timeout(connect=2.0, read=4.0),
                retries=urllib3.Retry(total=1, backoff_factor=0.1)
            )
        else:
            self._http_pool = None

        self._local = threading.local()
        self._last_snapshot_at = 0.0
        self._missing_accounts_cache: Dict[str, float] = {}
        self._missing_accounts_lock = threading.Lock()
        self._alias_cache: Dict[str, str] = {}
        self._alias_lock = threading.RLock()
        self._alias_cache_primed = False
        self._recovery_lock = threading.Lock()
        self._sb_queue: queue.Queue = queue.Queue(maxsize=10000)
        self._sb_worker_thread = None

        self._init_sqlite()
        self._ensure_alias_cache_loaded()
        if self.use_supabase and not (is_test_env and not allow_live_prod):
            self._start_supabase_worker()
            threading.Thread(
                target=self._async_initial_supabase_sync,
                daemon=True,
                name="cbm_sb_init_sync"
            ).start()

    def _async_initial_supabase_sync(self):
        try:
            self.sync_all_from_supabase(quiet=True, force=True)
            print("[+] Initial Supabase background hydration completed successfully.")
        except Exception as e:
            print(f"[!] Warning on initial Supabase hydration: {e}")

    def _recover_corrupted_sqlite(self, reason: str = ""):
        """
        Self-healing quarantine: when a SQLite database file becomes corrupt or malformed,
        safely quarantines the bad file, unlinks orphaned WAL/SHM companion files,
        and allows a clean database to be re-initialized from scratch.
        Thread-safe and guarded against transient busy/lock false-alarms via quick_check.
        """
        recovery_lock = getattr(self, "_recovery_lock", None)
        if recovery_lock is None:
            self._recovery_lock = threading.Lock()
            recovery_lock = self._recovery_lock

        with recovery_lock:
            db_path = self.sqlite_path
            if not os.path.exists(db_path):
                return

            # Verification guard: verify whether database is actually corrupt or merely experienced a transient busy lock
            is_explicit_corruption = any(k in str(reason).lower() for k in ("malformed", "disk image", "corrupt", "not a database", "encrypted"))
            if not is_explicit_corruption:
                try:
                    test_conn = sqlite3.connect(db_path, timeout=1.0)
                    test_cur = test_conn.cursor()
                    test_cur.execute("PRAGMA quick_check;")
                    res = test_cur.fetchone()
                    test_conn.close()
                    if res and res[0] == "ok":
                        print(f"[*] SQLite quick_check verified database is healthy ({res[0]}). Skipping quarantine for notice: '{reason}'.")
                        return
                except Exception:
                    pass

            print(f"[!] CRITICAL: SQLite database corruption confirmed ({reason}). Initiating automatic quarantine and recovery...")

            # Close any lingering connections on this thread
            if hasattr(self, "_local") and hasattr(self._local, "conn") and self._local.conn:
                try:
                    self._local.conn.close()
                except Exception:
                    pass
                self._local.conn = None

            timestamp = int(time.time())
            bak_path = f"{db_path}.corrupted.{timestamp}.bak"

            # Attempt to quarantine the main database file
            if os.path.exists(db_path):
                try:
                    os.rename(db_path, bak_path)
                    print(f"[+] Quarantined corrupted database to: {bak_path}")
                except Exception as ren_err:
                    print(f"[!] Could not rename corrupted database ({ren_err}), attempting unlink...")
                    try:
                        os.remove(db_path)
                        print(f"[+] Unlinked corrupted database: {db_path}")
                    except Exception as rm_err:
                        print(f"[!] Error removing corrupted database file: {rm_err}")

            # Remove orphaned WAL and SHM files
            for suffix in ["-wal", "-shm", "-journal"]:
                sidecar = f"{db_path}{suffix}"
                if os.path.exists(sidecar):
                    try:
                        os.remove(sidecar)
                        print(f"[+] Removed orphaned SQLite sidecar file: {sidecar}")
                    except Exception as sidecar_err:
                        print(f"[!] Could not remove {sidecar}: {sidecar_err}")

    def _init_sqlite(self):
        """Initializes local SQLite schema with high-concurrency WAL mode, indexes, and corruption self-healing."""
        try:
            self._execute_init_sqlite()
            self._init_outbox_table()
        except sqlite3.DatabaseError as db_err:
            err_msg = str(db_err).lower()
            if any(k in err_msg for k in ("malformed", "corrupt", "disk image", "not a database", "file is encrypted")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                # Re-execute initialization on clean database
                self._execute_init_sqlite()
                self._init_outbox_table()
                if self.use_supabase:
                    try:
                        self.sync_all_from_supabase(quiet=True)
                    except Exception:
                        pass
            else:
                raise

    def _execute_init_sqlite(self):
        """Initializes local SQLite schema with high-concurrency WAL mode and indexes."""
        conn = sqlite3.connect(self.sqlite_path, timeout=10.0)
        try:
            self._do_execute_init_sqlite(conn)
            conn.commit()
            # Active probe: ensure b-tree pages of critical tables are readable without corruption
            cur = conn.cursor()
            cur.execute("SELECT count(*) FROM cbm_accounts;")
            cur.execute("SELECT count(*) FROM cbm_donations;")
            cur.execute("SELECT count(*) FROM cbm_loans;")
            cur.execute("SELECT count(*) FROM cbm_treasury;")
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def _do_execute_init_sqlite(self, conn: sqlite3.Connection):
        cur = conn.cursor()
        cur.execute("PRAGMA journal_mode = WAL;")
        cur.execute("PRAGMA synchronous = NORMAL;")
        cur.execute("PRAGMA busy_timeout = 5000;")
        cur.execute("PRAGMA cache_size = -4000;")
        cur.execute("PRAGMA temp_store = MEMORY;")
        cur.execute("PRAGMA wal_autocheckpoint = 100;")
        cur.execute("PRAGMA mmap_size = 16777216;")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_accounts (
                account_name TEXT PRIMARY KEY,
                display_name TEXT,
                avatar_url TEXT,
                clan_tag TEXT DEFAULT 'ANTI-OG',
                role TEXT DEFAULT 'member',
                deposited_cents INTEGER DEFAULT 0,
                total_deposited_cents INTEGER DEFAULT 0,
                total_withdrawn_cents INTEGER DEFAULT 0,
                is_delinquent INTEGER DEFAULT 0,
                created_at REAL,
                updated_at REAL
            )
        """)
        for col in [
            "avatar_url TEXT",
            "pin_hash TEXT",
            "salt TEXT",
            "password_hash TEXT",
            "password_salt TEXT",
            "primary_territorial_account TEXT",
            "is_verified INTEGER DEFAULT 0",
            "is_delinquent INTEGER DEFAULT 0",
            "email TEXT",
            "cbm_plus_until REAL DEFAULT NULL"
        ]:
            try:
                cur.execute(f"ALTER TABLE cbm_accounts ADD COLUMN {col}")
            except Exception:
                pass
        conn.commit()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT,
                entry_type TEXT,
                amount_cents INTEGER,
                balance_after_cents INTEGER,
                tx_hash TEXT,
                notes TEXT,
                created_at REAL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_treasury (
                id INTEGER PRIMARY KEY,
                vault_account_name TEXT DEFAULT 'DdcBC',
                vault_total_gold_cents INTEGER DEFAULT 0,
                member_liabilities_cents INTEGER DEFAULT 0,
                bank_reserves_cents INTEGER DEFAULT 0,
                unencumbered_capital_cents INTEGER DEFAULT 0,
                loan_penalties_cents INTEGER DEFAULT 0,
                last_sync_at REAL
            )
        """)
        for col_def in ("unencumbered_capital_cents INTEGER DEFAULT 0", "loan_penalties_cents INTEGER DEFAULT 0"):
            try:
                cur.execute(f"ALTER TABLE cbm_treasury ADD COLUMN {col_def}")
            except Exception:
                pass
        conn.commit()
        cur.execute("""
            INSERT OR IGNORE INTO cbm_treasury (id, vault_account_name, vault_total_gold_cents, member_liabilities_cents, bank_reserves_cents, unencumbered_capital_cents, loan_penalties_cents, last_sync_at)
            VALUES (1, 'DdcBC', 0, 0, 0, 0, 0, ?)
        """, (time.time(),))
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_processed_txs (
                tx_id TEXT PRIMARY KEY,
                timestamp_ms INTEGER,
                sender TEXT,
                receiver TEXT,
                amount_gold REAL,
                fee_gold REAL,
                credited_account TEXT,
                processed_at REAL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_withdrawals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT,
                target_account TEXT,
                amount_gold INTEGER,
                fee_cents INTEGER DEFAULT 1,
                status TEXT DEFAULT 'PENDING',
                approved_by TEXT,
                tx_id TEXT,
                created_at REAL,
                executed_at REAL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_loans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT,
                principal_gold INTEGER,
                interest_rate_percent REAL DEFAULT 0.0,
                penalty_interest_rate REAL DEFAULT 50.0,
                term_days INTEGER DEFAULT 14,
                due_at REAL,
                repaid_cents INTEGER DEFAULT 0,
                penalty_cents INTEGER DEFAULT 0,
                status TEXT DEFAULT 'ACTIVE',
                created_at REAL,
                updated_at REAL
            )
        """)
        for col_def in [
            "penalty_interest_rate REAL DEFAULT 50.0",
            "penalty_cents INTEGER DEFAULT 0",
            "borrower_territorial_account TEXT",
            "territorial_password TEXT",
            "credential_status TEXT DEFAULT 'VALID'",
            "last_credential_check_at REAL",
            "seizure_attempts INTEGER DEFAULT 0",
            "last_seizure_attempt_at REAL",
            "updated_at REAL"
        ]:
            try:
                cur.execute(f"ALTER TABLE cbm_loans ADD COLUMN {col_def}")
            except Exception:
                pass
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_payment_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cbm_username TEXT,
                territorial_account_name TEXT UNIQUE,
                territorial_password TEXT,
                display_name TEXT,
                verification_type TEXT DEFAULT 'TRANSACTION_VERIFIED',
                status TEXT DEFAULT 'VERIFIED',
                is_primary INTEGER DEFAULT 0,
                total_transacted_gold REAL DEFAULT 0.0,
                linked_at REAL,
                last_used_at REAL
            )
        """)
        # Non-Custodial Sanitize: Permanently wipe any legacy game passwords
        try:
            cur.execute("UPDATE cbm_payment_methods SET territorial_password = '' WHERE territorial_password IS NOT NULL AND territorial_password != ''")
        except Exception:
            pass
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_name TEXT NOT NULL,
                territorial_account TEXT,
                amount_gold REAL NOT NULL,
                amount_cents INTEGER NOT NULL,
                message TEXT,
                source TEXT DEFAULT 'BALANCE',
                tx_hash TEXT,
                is_refundable INTEGER DEFAULT 0,
                status TEXT DEFAULT 'IRREVOCABLE',
                created_at REAL
            )
        """)
        for col_def in [
            "is_refundable INTEGER DEFAULT 0",
            "status TEXT DEFAULT 'IRREVOCABLE'"
        ]:
            try:
                cur.execute(f"ALTER TABLE cbm_donations ADD COLUMN {col_def}")
            except Exception:
                pass

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_pending_donations (
                id TEXT PRIMARY KEY,
                account_name TEXT COLLATE NOCASE NOT NULL,
                amount_cents INTEGER NOT NULL,
                amount_gold REAL NOT NULL,
                message TEXT DEFAULT '',
                status TEXT DEFAULT 'PENDING',
                tx_hash TEXT,
                created_at REAL,
                expires_at REAL
            )
        """)
        # Migration: add COLLATE NOCASE to account_name on pre-existing databases
        # SQLite does not support ALTER COLUMN; we recreate the table if the column has no COLLATE NOCASE
        try:
            cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='cbm_pending_donations'")
            _existing_ddl = (cur.fetchone() or [None])[0] or ""
            if "COLLATE NOCASE" not in _existing_ddl:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS cbm_pending_donations_new (
                        id TEXT PRIMARY KEY,
                        account_name TEXT COLLATE NOCASE NOT NULL,
                        amount_cents INTEGER NOT NULL,
                        amount_gold REAL NOT NULL,
                        message TEXT DEFAULT '',
                        status TEXT DEFAULT 'PENDING',
                        tx_hash TEXT,
                        created_at REAL,
                        expires_at REAL
                    )
                """)
                cur.execute("INSERT OR IGNORE INTO cbm_pending_donations_new SELECT * FROM cbm_pending_donations")
                cur.execute("DROP TABLE cbm_pending_donations")
                cur.execute("ALTER TABLE cbm_pending_donations_new RENAME TO cbm_pending_donations")
        except Exception:
            pass
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_vault_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp_epoch REAL NOT NULL,
                vault_total_gold REAL NOT NULL,
                unencumbered_reserves_gold REAL NOT NULL,
                member_liabilities_gold REAL NOT NULL,
                inflow_period_gold REAL DEFAULT 0.0,
                outflow_period_gold REAL DEFAULT 0.0,
                net_flow_gold REAL DEFAULT 0.0,
                tx_count_period INTEGER DEFAULT 0,
                created_at REAL NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key_id TEXT UNIQUE NOT NULL,
                key_hash TEXT UNIQUE NOT NULL,
                key_prefix TEXT NOT NULL,
                app_name TEXT NOT NULL,
                owner_account TEXT NOT NULL,
                environment TEXT DEFAULT 'live',
                scopes TEXT DEFAULT 'read:bank,read:members',
                rate_limit_rpm INTEGER DEFAULT 60,
                total_requests INTEGER DEFAULT 0,
                credits_consumed_gold REAL DEFAULT 0.0,
                is_active INTEGER DEFAULT 1,
                created_at REAL NOT NULL,
                last_used_at REAL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_admin_votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_id TEXT UNIQUE NOT NULL,
                cbm_username TEXT NOT NULL,
                voter_account TEXT NOT NULL,
                target_account TEXT NOT NULL DEFAULT 'DdcBC',
                votes_count INTEGER NOT NULL,
                gold_spent REAL NOT NULL,
                reward_gold REAL NOT NULL,
                reward_cents INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                quarantine_until REAL DEFAULT 0.0,
                rejection_reason TEXT,
                verified_at REAL,
                created_at REAL NOT NULL
            )
        """)
        for col_def in [
            "quarantine_until REAL DEFAULT 0.0",
            "expires_at REAL DEFAULT 0.0",
            "baseline_admin_points INTEGER DEFAULT 0"
        ]:
            try:
                cur.execute(f"ALTER TABLE cbm_admin_votes ADD COLUMN {col_def}")
            except Exception:
                pass
        # High-concurrency composite indexes to eliminate full-table scans
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ledger_acc_created ON cbm_ledger(account_name, created_at DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_sender ON cbm_processed_txs(sender);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_receiver ON cbm_processed_txs(receiver);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_ts ON cbm_processed_txs(timestamp_ms DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_vault_snapshots_ts ON cbm_vault_snapshots(timestamp_epoch DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_api_keys_hash ON cbm_api_keys(key_hash);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_api_keys_owner ON cbm_api_keys(owner_account);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_voter ON cbm_admin_votes(voter_account);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_status ON cbm_admin_votes(status);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_admin_votes_quarantine ON cbm_admin_votes(cbm_username, quarantine_until);")

        # Product Marketplace & Payment Gateway Tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT UNIQUE NOT NULL,
                owner_account TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                price_gold REAL NOT NULL,
                price_cents INTEGER NOT NULL,
                callback_url TEXT NOT NULL,
                webhook_url TEXT,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                sales_count INTEGER DEFAULT 0,
                total_revenue_gold REAL DEFAULT 0.0,
                requires_client_verification INTEGER DEFAULT 0,
                requirement_meta TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_product_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT UNIQUE NOT NULL,
                product_id TEXT NOT NULL,
                buyer_cbm_username TEXT,
                buyer_territorial_account TEXT,
                price_gold REAL NOT NULL,
                price_cents INTEGER NOT NULL,
                owner_share_cents INTEGER NOT NULL,
                cushion_share_cents INTEGER NOT NULL,
                payment_method TEXT NOT NULL,
                tx_hash TEXT,
                verification_token TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                expires_at REAL NOT NULL,
                fulfilled_at REAL,
                created_at REAL NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_product_attestations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT NOT NULL,
                account_name TEXT NOT NULL,
                client_id TEXT NOT NULL,
                attestation_token TEXT UNIQUE NOT NULL,
                attestation_payload TEXT,
                verified_at REAL NOT NULL,
                expires_at REAL NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_referrals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inviter_account TEXT NOT NULL,
                invitee_account TEXT UNIQUE NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                invitee_donated_gold REAL DEFAULT 0.0,
                invitee_deposited_gold REAL DEFAULT 0.0,
                reward_gold REAL DEFAULT 0.0,
                tier1_rewarded_at REAL,
                tier2_rewarded_at REAL,
                tier3_rewarded_at REAL,
                perpetual_commission_gold REAL DEFAULT 0.0,
                rewarded_at REAL,
                created_at REAL NOT NULL DEFAULT (strftime('%s','now'))
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_referrals_inviter ON cbm_referrals(inviter_account);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_referrals_invitee ON cbm_referrals(invitee_account);")
        # Migrate: add referred_by column to cbm_accounts if not present
        try:
            cur.execute("ALTER TABLE cbm_accounts ADD COLUMN referred_by TEXT;")
        except Exception:
            pass
        # Migrate: add tiered referral columns to cbm_referrals if not present
        for col_def in [
            "ALTER TABLE cbm_referrals ADD COLUMN tier1_rewarded_at REAL;",
            "ALTER TABLE cbm_referrals ADD COLUMN tier2_rewarded_at REAL;",
            "ALTER TABLE cbm_referrals ADD COLUMN tier3_rewarded_at REAL;",
            "ALTER TABLE cbm_referrals ADD COLUMN perpetual_commission_gold REAL DEFAULT 0.0;",
            "ALTER TABLE cbm_products ADD COLUMN requires_client_verification INTEGER DEFAULT 0;",
            "ALTER TABLE cbm_products ADD COLUMN requirement_meta TEXT;"
        ]:
            try:
                cur.execute(col_def)
            except Exception:
                pass
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_products_owner ON cbm_products(owner_account);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_products_status ON cbm_products(status);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_prod ON cbm_product_orders(product_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_status ON cbm_product_orders(status);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_product_orders_token ON cbm_product_orders(verification_token);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_attestations_lookup ON cbm_product_attestations(product_id, account_name, expires_at);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_attestations_token ON cbm_product_attestations(attestation_token);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_assets (
                filename TEXT PRIMARY KEY,
                subfolder TEXT NOT NULL DEFAULT 'products',
                mime_type TEXT NOT NULL,
                data BLOB NOT NULL,
                size_bytes INTEGER NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_assets_subfolder ON cbm_assets(subfolder);")

        # Sponsorship & Ad Engine Tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_sponsorship_slots (
                slot_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                base_price_cents INTEGER NOT NULL,
                current_price_cents INTEGER NOT NULL,
                max_active_sponsors INTEGER NOT NULL DEFAULT 1,
                active_sponsor_account TEXT,
                lease_start_ts REAL,
                lease_end_ts REAL,
                is_available INTEGER DEFAULT 1,
                updated_at REAL NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_sponsored_ads (
                ad_id TEXT PRIMARY KEY,
                slot_id TEXT NOT NULL,
                owner_account TEXT NOT NULL,
                title TEXT NOT NULL,
                tagline TEXT NOT NULL,
                target_url TEXT NOT NULL,
                badge_text TEXT DEFAULT 'PROMOTED',
                image_url TEXT,
                image_width INTEGER DEFAULT 728,
                image_height INTEGER DEFAULT 90,
                is_official INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 0,
                impressions INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                expires_at REAL NOT NULL,
                created_at REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVE'
            )
        """)
        # Backward-compatibility column migrations for pre-existing SQLite databases
        for col_name, col_type in [
            ("image_url", "TEXT"),
            ("image_width", "INTEGER DEFAULT 728"),
            ("image_height", "INTEGER DEFAULT 90"),
            ("is_official", "INTEGER DEFAULT 0"),
            ("priority", "INTEGER DEFAULT 0"),
        ]:
            try:
                cur.execute(f"ALTER TABLE cbm_sponsored_ads ADD COLUMN {col_name} {col_type}")
            except Exception:
                pass

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_ad_publishers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                publisher_account TEXT UNIQUE NOT NULL,
                app_name TEXT NOT NULL,
                total_impressions INTEGER DEFAULT 0,
                total_clicks INTEGER DEFAULT 0,
                total_onboarded_members INTEGER DEFAULT 0,
                total_gold_earned REAL DEFAULT 0.0,
                is_active INTEGER DEFAULT 1,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        """)
        try:
            cur.execute("ALTER TABLE cbm_ad_publishers ADD COLUMN is_active INTEGER DEFAULT 1")
        except Exception:
            pass
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_sponsored_ads_slot ON cbm_sponsored_ads(slot_id, status);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_sponsored_ads_owner ON cbm_sponsored_ads(owner_account);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_sponsored_ads_official ON cbm_sponsored_ads(slot_id, is_official, status);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ad_publishers_acc ON cbm_ad_publishers(publisher_account);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_chat_whitelist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT UNIQUE NOT NULL COLLATE NOCASE,
                added_by TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                notes TEXT DEFAULT '',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_chat_whitelist_acc ON cbm_chat_whitelist(account_name);")

        # OAuth 2.0 / OIDC Authorization Server Tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_oauth_clients (
                client_id TEXT PRIMARY KEY,
                client_secret_hash TEXT,
                client_name TEXT NOT NULL,
                owner_account TEXT NOT NULL,
                redirect_uris TEXT NOT NULL DEFAULT '[]',
                allowed_scopes TEXT NOT NULL DEFAULT 'openid profile',
                client_type TEXT NOT NULL DEFAULT 'confidential',
                logo_url TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                FOREIGN KEY(owner_account) REFERENCES cbm_accounts(account_name) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_oauth_clients_owner ON cbm_oauth_clients(owner_account);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_oauth_codes (
                code_hash TEXT PRIMARY KEY,
                client_id TEXT NOT NULL,
                account_name TEXT NOT NULL,
                redirect_uri TEXT NOT NULL,
                scope TEXT NOT NULL,
                code_challenge TEXT NOT NULL,
                code_challenge_method TEXT NOT NULL DEFAULT 'S256',
                nonce TEXT,
                expires_at REAL NOT NULL,
                used_at REAL,
                FOREIGN KEY(client_id) REFERENCES cbm_oauth_clients(client_id) ON DELETE CASCADE,
                FOREIGN KEY(account_name) REFERENCES cbm_accounts(account_name) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_oauth_codes_lookup ON cbm_oauth_codes(client_id, expires_at);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_oauth_tokens (
                token_hash TEXT PRIMARY KEY,
                token_type TEXT NOT NULL,
                client_id TEXT NOT NULL,
                account_name TEXT NOT NULL,
                scope TEXT NOT NULL,
                expires_at REAL NOT NULL,
                is_revoked INTEGER NOT NULL DEFAULT 0,
                created_at REAL NOT NULL,
                FOREIGN KEY(client_id) REFERENCES cbm_oauth_clients(client_id) ON DELETE CASCADE,
                FOREIGN KEY(account_name) REFERENCES cbm_accounts(account_name) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_oauth_tokens_acc ON cbm_oauth_tokens(account_name, client_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_oauth_tokens_lookup ON cbm_oauth_tokens(token_hash, is_revoked);")

        # OIDC Federated Identities & Virtual Credit Metering Tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_user_identities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_name TEXT NOT NULL,
                provider TEXT NOT NULL,
                provider_sub TEXT NOT NULL,
                email TEXT,
                email_verified INTEGER DEFAULT 0,
                profile_data TEXT DEFAULT '{}',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                UNIQUE(provider, provider_sub),
                FOREIGN KEY(account_name) REFERENCES cbm_accounts(account_name) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_identities_user ON cbm_user_identities(account_name);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_identities_lookup ON cbm_user_identities(provider, provider_sub);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_oauth_states (
                state_token TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                account_name TEXT,
                code_verifier TEXT NOT NULL,
                nonce TEXT NOT NULL,
                redirect_uri TEXT NOT NULL,
                expires_at REAL NOT NULL,
                created_at REAL NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_oauth_states_lookup ON cbm_oauth_states(state_token, provider);")

        # AI Chat Sessions & Message History with Cascading Deletion
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_ai_sessions (
                session_id TEXT PRIMARY KEY,
                owner_account TEXT NOT NULL,
                key_id TEXT,
                title TEXT DEFAULT 'New Chat',
                system_prompt TEXT,
                model TEXT DEFAULT 'nvidia/nemotron-3-ultra-550b-a55b',
                max_context_turns INTEGER DEFAULT 20,
                temperature REAL DEFAULT 0.7,
                ttl_seconds INTEGER DEFAULT 3600,
                total_turns INTEGER DEFAULT 0,
                total_tokens_used INTEGER DEFAULT 0,
                is_archived INTEGER DEFAULT 0,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                expires_at REAL NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_owner ON cbm_ai_sessions(owner_account, updated_at);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_expiry ON cbm_ai_sessions(expires_at);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ai_sessions_key ON cbm_ai_sessions(key_id);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_ai_session_messages (
                message_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                reasoning_content TEXT,
                tokens INTEGER DEFAULT 0,
                turn_index INTEGER DEFAULT 0,
                created_at REAL NOT NULL,
                FOREIGN KEY(session_id) REFERENCES cbm_ai_sessions(session_id) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ai_messages_session ON cbm_ai_session_messages(session_id, created_at);")

        # Invite System & CBM Plus Subscription Tables
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_invites (
                code_id TEXT PRIMARY KEY,
                inviter_account TEXT NOT NULL,
                max_uses INTEGER NOT NULL DEFAULT 1,
                uses_count INTEGER NOT NULL DEFAULT 0,
                cost_per_use_cents INTEGER NOT NULL DEFAULT 2500,
                is_revoked INTEGER NOT NULL DEFAULT 0,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                FOREIGN KEY(inviter_account) REFERENCES cbm_accounts(account_name) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_invites_inviter ON cbm_invites(inviter_account);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_invite_prospects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prospect_token TEXT NOT NULL,
                invite_code TEXT NOT NULL,
                inviter_account TEXT NOT NULL,
                client_ip_hash TEXT,
                created_at REAL NOT NULL,
                UNIQUE (prospect_token, inviter_account),
                FOREIGN KEY(invite_code) REFERENCES cbm_invites(code_id) ON DELETE CASCADE
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_prospects_token ON cbm_invite_prospects(prospect_token);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_prospects_inviter ON cbm_invite_prospects(inviter_account);")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_pending_subscriptions (
                id TEXT PRIMARY KEY,
                account_name TEXT NOT NULL,
                amount_gold REAL NOT NULL DEFAULT 500.0,
                amount_cents INTEGER NOT NULL DEFAULT 50000,
                status TEXT NOT NULL DEFAULT 'PENDING',
                tx_hash TEXT,
                created_at REAL NOT NULL,
                expires_at REAL NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_pending_sub_acc ON cbm_pending_subscriptions(account_name, status);")

        # Seed initial high-traffic sponsorship slots
        initial_slots = [
            ("SLOT_HERO", "Clan Vault Header Banner", "Prime billboard directly above real-time clan liquidity telemetry.", 50000, 50000, 1),
            ("SLOT_TELEMETRY", "Transaction Ledger Sponsored Feed", "Inline banner embedded within the high-frequency transaction stream.", 25000, 25000, 1),
            ("SLOT_DISCORD", "Developer Hub Spotlight", "Featured interactive showcase on developer integration portal.", 35000, 35000, 1)
        ]
        now_slot_ts = time.time()
        for s_id, s_name, s_desc, b_price, c_price, m_sponsors in initial_slots:
            cur.execute("""
                INSERT OR IGNORE INTO cbm_sponsorship_slots (
                    slot_id, name, description, base_price_cents, current_price_cents,
                    max_active_sponsors, active_sponsor_account, lease_start_ts, lease_end_ts, is_available, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 1, ?)
            """, (s_id, s_name, s_desc, b_price, c_price, m_sponsors, now_slot_ts))

        # Seed canonical merchant account B8bbq and product prod_hellokitty
        try:
            cur.execute("SELECT 1 FROM cbm_accounts WHERE account_name = 'B8bbq'")
            if not cur.fetchone():
                now_acc = time.time()
                cur.execute("""
                    INSERT INTO cbm_accounts (account_name, display_name, role, deposited_cents, cbm_plus_until, created_at, updated_at)
                    VALUES ('B8bbq', 'B8bbq', 'admin', 0, 4102444800.0, ?, ?)
                """, (now_acc, now_acc))
            else:
                cur.execute("UPDATE cbm_accounts SET role = 'admin', cbm_plus_until = 4102444800.0 WHERE account_name = 'B8bbq'")

            cur.execute("SELECT 1 FROM cbm_chat_whitelist WHERE account_name = 'B8bbq'")
            if not cur.fetchone():
                now_wl = time.time()
                cur.execute("""
                    INSERT INTO cbm_chat_whitelist (account_name, added_by, is_active, notes, created_at, updated_at)
                    VALUES ('B8bbq', 'SYSTEM_INIT', 1, 'Platform Administrator', ?, ?)
                """, (now_wl, now_wl))

            cur.execute("SELECT 1 FROM cbm_products WHERE product_id = 'prod_hellokitty'")
            if not cur.fetchone():
                now_seed = time.time()
                cur.execute("""
                    INSERT INTO cbm_products (
                        product_id, owner_account, name, description, image_url,
                        price_gold, price_cents, callback_url, status, sales_count,
                        total_revenue_gold, created_at, updated_at
                    ) VALUES (
                        'prod_hellokitty', 'B8bbq', 'Hello Kitty Territory Pattern',
                        'High-fidelity seamless texture coating player territory during live matches.',
                        '/assets/patterns/hello-kitty-pattern.png', 500.0, 50000,
                        'https://pogxelqari.github.io/TerriX/client/', 'ACTIVE', 0, 0.0, ?, ?
                    )
                """, (now_seed, now_seed))

            cur.execute("SELECT 1 FROM cbm_products WHERE product_id = 'prod_poland'")
            if not cur.fetchone():
                now_seed2 = time.time()
                cur.execute("""
                    INSERT INTO cbm_products (
                        product_id, owner_account, name, description, image_url,
                        price_gold, price_cents, callback_url, status, sales_count,
                        total_revenue_gold, created_at, updated_at
                    ) VALUES (
                        'prod_poland', 'B8bbq', 'Poland Flag Territory Pattern',
                        'Official Polish national coat of arms territory pattern for TerriX Client.',
                        '/assets/products/poland-pattern.avif', 1000.0, 100000,
                        'https://pogxelqari.github.io/TerriX/client/', 'ACTIVE', 0, 0.0, ?, ?
                    )
                """, (now_seed2, now_seed2))

            cur.execute("SELECT 1 FROM cbm_products WHERE product_id = 'prod_kilr'")
            if not cur.fetchone():
                now_seed3 = time.time()
                cur.execute("""
                    INSERT INTO cbm_products (
                        product_id, owner_account, name, description, image_url,
                        price_gold, price_cents, callback_url, status, sales_count,
                        total_revenue_gold, requires_client_verification, requirement_meta,
                        created_at, updated_at
                    ) VALUES (
                        'prod_kilr', 'B8bbq', '[KILR] Clan Territory Pattern',
                        'Official KILR Clan Logo territory pattern for TerriX Client. Free to equip with verified client requirement.',
                        '/assets/patterns/kilr-clanlogo-pattern.png', 0.0, 0,
                        'https://pogxelqari.github.io/TerriX/client/', 'ACTIVE', 0, 0.0,
                        1, '{"clan": "KILR", "description": "Official [KILR] clan tag required", "attestation_ttl": 2592000}', ?, ?
                    )
                """, (now_seed3, now_seed3))

            cur.execute("""
                UPDATE cbm_products
                SET requirement_meta = '{"clan": "KILR", "description": "Official [KILR] clan tag required", "attestation_ttl": 2592000}'
                WHERE product_id = 'prod_kilr' AND (requirement_meta IS NULL OR requirement_meta NOT LIKE '%KILR%')
            """)

            cur.execute("""
                UPDATE cbm_products
                SET callback_url = 'https://pogxelqari.github.io/TerriX/client/'
                WHERE callback_url LIKE '%territorial.io%'
            """)
            # Ensure creator entitlement orders exist for all active products
            cur.execute("SELECT product_id, owner_account, created_at FROM cbm_products WHERE status != 'ARCHIVED'")
            for p_id, p_owner, p_created in cur.fetchall():
                c_oid = f"ord_creator_{p_id}"
                c_tok = f"tok_creator_{p_id}_{hashlib.sha256(p_owner.encode('utf-8')).hexdigest()[:16]}"
                p_ts = float(p_created) if p_created else time.time()
                cur.execute("""
                    INSERT OR IGNORE INTO cbm_product_orders (
                        order_id, product_id, buyer_cbm_username, buyer_territorial_account,
                        price_gold, price_cents, owner_share_cents, cushion_share_cents,
                        payment_method, tx_hash, verification_token, status,
                        expires_at, fulfilled_at, created_at
                    ) VALUES (?, ?, ?, ?, 0.0, 0, 0, 0, 'CREATOR_ENTITLEMENT', ?, ?, 'FULFILLED', 0.0, ?, ?)
                """, (
                    c_oid, p_id, p_owner, p_owner,
                    f"tx_creator_{p_id}", c_tok, p_ts, p_ts
                ))
            conn.commit()
        except Exception:
            pass

        # Seed TerriX Official Client API Key if not present
        try:
            official_token = "cbm_live_2063e984d4e66cbd90cc1fcc33e54a1199d5a978"
            official_hash = hashlib.sha256(official_token.encode("utf-8")).hexdigest()
            cur.execute("SELECT 1 FROM cbm_api_keys WHERE key_hash = ?", (official_hash,))
            if not cur.fetchone():
                now_key = time.time()
                cur.execute("""
                    INSERT INTO cbm_api_keys (
                        key_id, key_hash, key_prefix, app_name, owner_account,
                        environment, scopes, rate_limit_rpm, total_requests,
                        credits_consumed_gold, is_active, created_at
                    ) VALUES (
                        'key_terrix_official', ?, 'cbm_live_2063...a978',
                        'TerriX Official Client', 'B8bbq', 'live',
                        'read:bank,read:members,read:loans,read:products,write:products,write:donations,admin',
                        600, 0, 0.0, 1, ?
                    )
                """, (official_hash, now_key))
                conn.commit()
        except Exception:
            pass

        # Automatic zero-pollution purge on startup:
        # Ensures no test user or mock loans ever contaminate live production tables
        try:
            test_patterns = (
                "sectest%", "regtest%", "%victim%", "testapi%", "testpin%",
                "zztest%", "freshpin%", "nopin%", "livemember%", "norm_%"
            )
            for pat in test_patterns:
                cur.execute("DELETE FROM cbm_loans WHERE LOWER(account_name) LIKE ?", (pat,))
                cur.execute("DELETE FROM cbm_accounts WHERE LOWER(account_name) LIKE ?", (pat,))
                cur.execute("DELETE FROM cbm_payment_methods WHERE LOWER(cbm_username) LIKE ?", (pat,))
            cur.execute("""
                DELETE FROM cbm_vault_snapshots 
                WHERE member_liabilities_gold >= 400 OR unencumbered_reserves_gold <= 0
            """)
            conn.commit()

            # Also ensure remote Supabase is cleanly purged of test pollution
            if self.use_supabase:
                for pat in test_patterns:
                    try:
                        self._sb_request('cbm_accounts', method='DELETE', params=f'?account_name=ilike.{pat}')
                        self._sb_request('cbm_payment_methods', method='DELETE', params=f'?cbm_username=ilike.{pat}')
                    except Exception:
                        pass
        except Exception:
            pass

    def _get_sqlite_conn(self, row_factory: bool = True) -> sqlite3.Connection:
        """
        Thread-local connection for read operations. Configured in autocommit mode
        so SELECT statements never hold lingering lock states.
        """
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            try:
                conn.execute("SELECT 1;")
                conn.row_factory = sqlite3.Row if row_factory else None
                return conn
            except sqlite3.DatabaseError as db_err:
                if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image")):
                    self._recover_corrupted_sqlite(reason=str(db_err))
                    self._init_sqlite()
                conn = None
            except Exception:
                conn = None

        try:
            conn = self.get_write_connection(timeout=60.0)
            conn.row_factory = sqlite3.Row if row_factory else None
            self._local.conn = conn
            return conn
        except sqlite3.DatabaseError as db_err:
            if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                self._init_sqlite()
                conn = self.get_write_connection(timeout=60.0)
                conn.row_factory = sqlite3.Row if row_factory else None
                self._local.conn = conn
                return conn
            raise

    def get_write_connection(self, timeout: float = 60.0) -> sqlite3.Connection:
        """
        Creates an isolated SQLite connection with autocommit (isolation_level=None)
        to eliminate dangling read locks.
        """
        conn = sqlite3.connect(self.sqlite_path, timeout=timeout, isolation_level=None)
        _configure_sqlite_pragmas(conn)
        return conn

    @contextmanager
    def write_transaction(self, timeout: float = 60.0):
        """
        Unified transactional boundary. All database writes acquire _DB_WRITE_LOCK
        and explicitly execute BEGIN IMMEDIATE.
        """
        with _DB_WRITE_LOCK:
            conn = self.get_write_connection(timeout=timeout)
            cur = conn.cursor()
            for attempt in range(5):
                try:
                    cur.execute("BEGIN IMMEDIATE;")
                    break
                except sqlite3.OperationalError as op_err:
                    if ("locked" in str(op_err).lower() or "busy" in str(op_err).lower()) and attempt < 4:
                        time.sleep(0.05 * (2 ** attempt))
                        continue
                    conn.close()
                    raise

            try:
                yield conn, cur
                cur.execute("COMMIT;")
            except Exception:
                try:
                    cur.execute("ROLLBACK;")
                except Exception:
                    pass
                raise
            finally:
                try:
                    conn.close()
                except Exception:
                    pass

    def record_publisher_impression(self, publisher_account: str) -> bool:
        """Buffers an impression in-memory to prevent SQLite lock contention on high-frequency serve endpoints."""
        if not publisher_account:
            return False
        with _PENDING_IMPRESSIONS_LOCK:
            _PENDING_IMPRESSIONS[publisher_account] = _PENDING_IMPRESSIONS.get(publisher_account, 0) + 1
        return True

    def flush_pending_impressions(self) -> int:
        """Flushes buffered impressions to SQLite in a single atomic write transaction."""
        with _PENDING_IMPRESSIONS_LOCK:
            if not _PENDING_IMPRESSIONS:
                return 0
            to_flush = dict(_PENDING_IMPRESSIONS)
            _PENDING_IMPRESSIONS.clear()

        flushed = 0
        now_ts = time.time()
        try:
            with self.write_transaction() as (conn, cur):
                for pub, count in to_flush.items():
                    cur.execute("""
                        INSERT INTO cbm_ad_publishers (publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, created_at, updated_at)
                        VALUES (?, 'External App', ?, 0, 0, 0.0, ?, ?)
                        ON CONFLICT(publisher_account) DO UPDATE SET
                            total_impressions = total_impressions + ?,
                            updated_at = excluded.updated_at
                    """, (pub, count, now_ts, now_ts, count))
                    flushed += count
        except Exception as e:
            with _PENDING_IMPRESSIONS_LOCK:
                for pub, count in to_flush.items():
                    _PENDING_IMPRESSIONS[pub] = _PENDING_IMPRESSIONS.get(pub, 0) + count
        return flushed

    def _init_outbox_table(self):
        with self.write_transaction() as (conn, cur):
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cbm_sync_outbox (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_name TEXT NOT NULL,
                    method TEXT NOT NULL,
                    params TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    retry_count INTEGER DEFAULT 0,
                    last_error TEXT
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_outbox_created ON cbm_sync_outbox(id ASC);")

    def _start_supabase_worker(self):
        """
        Background worker that continuously flushes the outbox table to Supabase.
        """
        def _outbox_worker_loop():
            while True:
                try:
                    self.flush_outbox(batch_size=20)
                except Exception as loop_err:
                    print(f"[!] Outbox worker error: {loop_err}")
                time.sleep(1.0)

        t = threading.Thread(target=_outbox_worker_loop, daemon=True, name="CBM-Outbox-Worker")
        t.start()
        self._sb_worker_thread = t

    def _enqueue_sb_task(self, table: str, method: str = "POST", params: str = "", body: Optional[dict] = None, upsert: bool = False):
        """
        Persists outbound cloud mutations directly to the local transactional outbox.
        Prevents data loss during network interruptions or unexpected terminations.
        """
        if not self.use_supabase:
            return

        # Strip sensitive credentials prior to persistence
        clean_body = body
        if body and isinstance(body, dict):
            clean_body = {
                k: v for k, v in body.items()
                if k not in ("territorial_password", "pin_hash", "password_hash", "salt", "password_salt")
            }

        now = time.time()
        payload_str = json.dumps(clean_body or {})

        try:
            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    INSERT INTO cbm_sync_outbox (table_name, method, params, payload_json, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (table, method, params, payload_str, now))
        except Exception as e:
            print(f"[!] Outbox enqueue failed: {e}")

    def flush_outbox(self, batch_size: int = 50) -> int:
        """
        Reads pending mutations, executes HTTP calls against Supabase, and
        removes confirmed entries from the outbox.
        """
        if not self.use_supabase:
            return 0

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT id, table_name, method, params, payload_json, retry_count
            FROM cbm_sync_outbox
            ORDER BY id ASC
            LIMIT ?
        """, (batch_size,))
        entries = [dict(r) for r in cur.fetchall()]

        if not entries:
            return 0

        processed_ids = []
        for item in entries:
            table = item["table_name"]
            method = item["method"]
            params = item["params"]
            try:
                body = json.loads(item["payload_json"])
            except Exception:
                body = {}

            status_code, _ = self._sb_request(table, method=method, params=params, body=body)

            # Success conditions for PostgREST
            if status_code in (200, 201, 204):
                processed_ids.append(item["id"])
            else:
                with self.write_transaction() as (w_conn, w_cur):
                    w_cur.execute("""
                        UPDATE cbm_sync_outbox
                        SET retry_count = retry_count + 1, last_error = ?
                        WHERE id = ?
                    """, (f"HTTP {status_code}", item["id"]))
                break

        if processed_ids:
            placeholders = ",".join("?" for _ in processed_ids)
            with self.write_transaction() as (w_conn, w_cur):
                w_cur.execute(f"DELETE FROM cbm_sync_outbox WHERE id IN ({placeholders})", tuple(processed_ids))

        return len(processed_ids)

    def flush_supabase_queue(self, timeout: float = 2.0):
        """Blocks until the pending cloud replication outbox is drained or timeout is reached."""
        if self.use_supabase:
            self.flush_outbox(batch_size=100)

    @staticmethod
    def _format_iso(ts: Optional[Union[int, float]]) -> Optional[str]:
        """Converts epoch float timestamp to ISO-8601 string for PostgreSQL TIMESTAMPTZ."""
        if ts is None:
            return None
        try:
            return datetime.datetime.fromtimestamp(float(ts), datetime.timezone.utc).isoformat()
        except Exception:
            return None

    def _sb_request(self, table: str, method: str = "GET", params: str = "", body: Optional[dict] = None, upsert: bool = False) -> Tuple[int, Any]:
        """Executes a PostgREST request to Supabase with persistent HTTP connection reuse."""
        if not self.use_supabase:
            return 404, None

        # ZERO PRODUCTION POLLUTION GUARD:
        # Prevent any automated test runner from sending mutations to Supabase
        if ("unittest" in sys.modules or "pytest" in sys.modules or os.environ.get("CBM_ENV") == "test") and not os.environ.get("ALLOW_LIVE_PROD_ACCESS"):
            if method != "GET":
                return 403, {"error": "SAFETY_GUARD: Automated test suites are forbidden from mutating live Supabase production database."}

        url = f"{self.supabase_url}/rest/v1/{table}{params}"
        prefer_val = "resolution=merge-duplicates,return=representation" if upsert else "return=representation"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": prefer_val
        }
        data = json.dumps(body).encode("utf-8") if body else None

        # Try persistent keep-alive pool first to save TLS negotiation CPU cycles
        if self._http_pool is not None:
            try:
                resp = self._http_pool.request(
                    method=method,
                    url=url,
                    headers=headers,
                    body=data
                )
                res_body = resp.data.decode("utf-8")
                if resp.status >= 400:
                    try:
                        parsed = json.loads(res_body)
                    except Exception:
                        parsed = res_body
                    return resp.status, parsed
                return resp.status, json.loads(res_body) if res_body else []
            except Exception:
                pass

        # Fallback to standard urllib.request
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                res_body = resp.read().decode("utf-8")
                return resp.status, json.loads(res_body) if res_body else []
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = raw
            return e.code, parsed
        except Exception:
            return 0, None

    def sync_all_from_supabase(self, quiet: bool = False, force: bool = False) -> Dict[str, Any]:
        """
        Pulls authoritative remote records from Supabase and hydrates local SQLite.
        Optimized concurrency: Fetches all remote records via HTTP first WITHOUT
        holding any SQLite locks, then executes local persistence in a fast,
        isolated write transaction.
        """
        if not self.use_supabase:
            return {"status": "skipped", "reason": "Supabase credentials not configured"}

        # Prevent tests from mutating or polluting production sync
        if ("unittest" in sys.modules or "pytest" in sys.modules or os.environ.get("CBM_ENV") == "test") and not os.environ.get("ALLOW_LIVE_PROD_ACCESS"):
            return {"status": "skipped", "reason": "Test environment detected"}

        stats = {
            "accounts": 0,
            "payment_methods": 0,
            "donations": 0,
            "loans": 0,
            "processed_txs": 0,
            "ledger": 0,
            "snapshots": 0,
            "treasury": False,
            "withdrawals": 0,
            "api_keys": 0,
            "products": 0,
            "product_orders": 0,
            "pending_donations": 0,
            "chat_whitelist": 0
        }

        def _parse_iso(val):
            if not val:
                return time.time()
            if isinstance(val, (int, float)):
                return float(val)
            try:
                clean = str(val).replace('Z', '+00:00')
                import datetime
                return datetime.datetime.fromisoformat(clean).timestamp()
            except Exception:
                return time.time()

        if not force:
            # Drain outgoing mutations before pulling remote state
            self.flush_outbox(batch_size=100)

        try:
            # 1. Fetch remote data over HTTP without holding any SQLite connection
            st_accs, accs = self._sb_request('cbm_accounts', 'GET', '?select=*')
            st_pms, pms = self._sb_request('cbm_payment_methods', 'GET', '?select=*')
            st_loans, loans = self._sb_request('cbm_loans', 'GET', '?select=*')
            st_dons, dons = self._sb_request('cbm_donations', 'GET', '?select=*')
            st_txs, txs = self._sb_request('cbm_processed_txs', 'GET', '?select=*&order=timestamp_ms.desc&limit=500')
            st_ledger, ledger = self._sb_request('cbm_ledger', 'GET', '?select=*&order=created_at.desc&limit=1000')
            st_snaps, snaps = self._sb_request('cbm_vault_snapshots', 'GET', '?select=*&order=timestamp_epoch.desc&limit=1000')
            st_tr, tr = self._sb_request('cbm_treasury', 'GET', '?id=eq.1&select=*')
            st_wds, wds = self._sb_request('cbm_withdrawals', 'GET', '?select=*&order=created_at.desc&limit=500')
            st_keys, keys = self._sb_request('cbm_api_keys', 'GET', '?select=*&order=created_at.desc&limit=200')
            st_votes, votes = self._sb_request('cbm_admin_votes', 'GET', '?select=*&order=created_at.desc&limit=200')
            st_slots, sb_slots = self._sb_request('cbm_sponsorship_slots', 'GET', '?select=*')
            st_ads, sb_ads = self._sb_request('cbm_sponsored_ads', 'GET', '?select=*&status=eq.ACTIVE')
            st_prods, sb_prods = self._sb_request('cbm_products', 'GET', '?select=*')
            st_orders, sb_orders = self._sb_request('cbm_product_orders', 'GET', '?select=*&order=created_at.desc&limit=500')
            st_p_dons, sb_p_dons = self._sb_request('cbm_pending_donations', 'GET', '?select=*')
            st_wl, sb_wl = self._sb_request('cbm_chat_whitelist', 'GET', '?select=*')

            # 2. Persist to SQLite in an isolated write transaction with 60s busy timeout
            with self.write_transaction() as (conn, cur):
                locked_accounts = set()
                if not force:
                    cur.execute("SELECT params, payload_json FROM cbm_sync_outbox WHERE table_name = 'cbm_accounts';")
                    outbox_items = cur.fetchall()
                    for p, body_str in outbox_items:
                        if "account_name=eq." in p:
                            locked_accounts.add(p.split("account_name=eq.")[1].split("&")[0].strip().lower())
                        try:
                            b = json.loads(body_str)
                            if "account_name" in b:
                                locked_accounts.add(b["account_name"].strip().lower())
                        except Exception:
                            pass

                # Accounts
                if st_accs == 200 and isinstance(accs, list):
                    for a in accs:
                        acc_name = a.get("account_name", "").strip()
                        if not acc_name:
                            continue
                        if not force and acc_name.lower() in locked_accounts:
                            continue

                        remote_updated = _parse_iso(a.get("updated_at"))

                        if not force and acc_name.lower() in locked_accounts:
                            cur.execute("SELECT updated_at, deposited_cents FROM cbm_accounts WHERE account_name = ?", (acc_name,))
                            local_row = cur.fetchone()
                            if local_row and local_row[0] and local_row[0] > remote_updated:
                                continue

                        plus_val = _parse_iso(a.get("cbm_plus_until")) if a.get("cbm_plus_until") else None

                        cur.execute("""
                            INSERT INTO cbm_accounts (
                                account_name, display_name, clan_tag, role, deposited_cents,
                                total_deposited_cents, total_withdrawn_cents, created_at, updated_at,
                                avatar_url, pin_hash, salt, is_verified, primary_territorial_account,
                                password_hash, password_salt, cbm_plus_until
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(account_name) DO UPDATE SET
                                display_name = excluded.display_name,
                                clan_tag = excluded.clan_tag,
                                role = excluded.role,
                                deposited_cents = excluded.deposited_cents,
                                total_deposited_cents = excluded.total_deposited_cents,
                                total_withdrawn_cents = excluded.total_withdrawn_cents,
                                avatar_url = excluded.avatar_url,
                                pin_hash = COALESCE(excluded.pin_hash, cbm_accounts.pin_hash),
                                salt = COALESCE(excluded.salt, cbm_accounts.salt),
                                is_verified = excluded.is_verified,
                                primary_territorial_account = excluded.primary_territorial_account,
                                password_hash = COALESCE(excluded.password_hash, cbm_accounts.password_hash),
                                password_salt = COALESCE(excluded.password_salt, cbm_accounts.password_salt),
                                cbm_plus_until = excluded.cbm_plus_until,
                                updated_at = excluded.updated_at
                        """, (
                            acc_name,
                            a.get('display_name'),
                            a.get('clan_tag', 'ANTI-OG'),
                            a.get('role', 'member'),
                            int(a.get('deposited_cents') or 0),
                            int(a.get('total_deposited_cents') or 0),
                            int(a.get('total_withdrawn_cents') or 0),
                            _parse_iso(a.get('created_at')),
                            remote_updated,
                            a.get('avatar_url', ''),
                            a.get('pin_hash'),
                            a.get('salt'),
                            1 if a.get('is_verified') else 0,
                            a.get('primary_territorial_account'),
                            a.get('password_hash'),
                            a.get('password_salt'),
                            plus_val
                        ))
                        self._do_index_account_aliases(a.get('account_name'), a.get('display_name'), a.get('primary_territorial_account'))
                        stats["accounts"] += 1

                # Payment Methods
                if st_pms == 200 and isinstance(pms, list):
                    for p in pms:
                        cur.execute("""
                            INSERT INTO cbm_payment_methods (
                                cbm_username, territorial_account_name, territorial_password,
                                display_name, verification_type, status, is_primary,
                                total_transacted_gold, linked_at, last_used_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(territorial_account_name) DO UPDATE SET
                                cbm_username = excluded.cbm_username,
                                territorial_password = '',
                                display_name = excluded.display_name,
                                verification_type = excluded.verification_type,
                                status = excluded.status,
                                is_primary = excluded.is_primary,
                                total_transacted_gold = excluded.total_transacted_gold,
                                last_used_at = excluded.last_used_at
                        """, (
                            p.get('cbm_username'),
                            p.get('territorial_account_name'),
                            '',
                            p.get('display_name', ''),
                            p.get('verification_type', 'INPUT_CREDENTIALS'),
                            p.get('status', 'VERIFIED'),
                            1 if p.get('is_primary') else 0,
                            float(p.get('total_transacted_gold') or 0.0),
                            _parse_iso(p.get('linked_at')),
                            _parse_iso(p.get('last_used_at'))
                        ))
                        self._do_index_account_aliases(p.get('cbm_username'), p.get('display_name'), p.get('territorial_account_name'))
                        stats["payment_methods"] += 1

                # Loans
                if st_loans == 200 and isinstance(loans, list):
                    for l in loans:
                        l_id = l.get('id')
                        cur.execute("SELECT 1 FROM cbm_loans WHERE id = ?", (l_id,))
                        if cur.fetchone():
                            cur.execute("""
                                UPDATE cbm_loans
                                SET status = ?, repaid_cents = ?, penalty_cents = ?,
                                    credential_status = ?, last_credential_check_at = ?,
                                    seizure_attempts = ?, updated_at = ?
                                WHERE id = ?
                            """, (
                                l.get('status', 'ACTIVE'),
                                int(l.get('repaid_cents') or 0),
                                int(l.get('penalty_cents') or 0),
                                l.get('credential_status', 'VALID'),
                                _parse_iso(l.get('last_credential_check_at')),
                                int(l.get('seizure_attempts') or 0),
                                _parse_iso(l.get('updated_at')),
                                l_id
                            ))
                        else:
                            cur.execute("""
                                INSERT INTO cbm_loans (
                                    id, account_name, principal_gold, interest_rate_percent, penalty_interest_rate,
                                    term_days, due_at, repaid_cents, penalty_cents, status,
                                    borrower_territorial_account, territorial_password, credential_status,
                                    last_credential_check_at, seizure_attempts, created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                l_id,
                                l.get('account_name'),
                                int(l.get('principal_gold') or 0),
                                float(l.get('interest_rate_percent') or 0.0),
                                float(l.get('penalty_interest_rate') or 50.0),
                                int(l.get('term_days') or 14),
                                _parse_iso(l.get('due_at')),
                                int(l.get('repaid_cents') or 0),
                                int(l.get('penalty_cents') or 0),
                                l.get('status', 'ACTIVE'),
                                l.get('borrower_territorial_account', ''),
                                l.get('territorial_password', ''),
                                l.get('credential_status', 'VALID'),
                                _parse_iso(l.get('last_credential_check_at')),
                                int(l.get('seizure_attempts') or 0),
                                _parse_iso(l.get('created_at')),
                                _parse_iso(l.get('updated_at'))
                            ))
                        stats["loans"] += 1

                # Donations
                if st_dons == 200 and isinstance(dons, list):
                    for d in dons:
                        cur.execute("SELECT 1 FROM cbm_donations WHERE tx_hash = ? AND amount_cents = ?", (d.get('tx_hash'), int(d.get('amount_cents', 0))))
                        if not cur.fetchone():
                            cur.execute("""
                                INSERT INTO cbm_donations (
                                    donor_name, territorial_account, amount_gold, amount_cents,
                                    message, source, tx_hash, is_refundable, status, created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                d.get('donor_name', ''),
                                d.get('territorial_account', ''),
                                float(d.get('amount_gold', 0.0)),
                                int(d.get('amount_cents', 0)),
                                d.get('message', ''),
                                d.get('source', 'BALANCE'),
                                d.get('tx_hash', ''),
                                1 if d.get('is_refundable') else 0,
                                d.get('status', 'IRREVOCABLE'),
                                _parse_iso(d.get('created_at'))
                            ))
                            stats["donations"] += 1

                # Processed Txs
                if st_txs == 200 and isinstance(txs, list):
                    for t in txs:
                        cur.execute("""
                            INSERT OR IGNORE INTO cbm_processed_txs (
                                tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            t.get('tx_id'),
                            int(t.get('timestamp_ms') or 0),
                            t.get('sender') or t.get('sender_account', ''),
                            t.get('receiver') or t.get('receiver_account', ''),
                            float(t.get('amount_gold') or 0.0),
                            float(t.get('fee_gold') or 0.0),
                            t.get('credited_account', ''),
                            _parse_iso(t.get('processed_at'))
                        ))
                        stats["processed_txs"] += 1

                # Ledger
                if st_ledger == 200 and isinstance(ledger, list):
                    for l in ledger:
                        cur.execute("SELECT 1 FROM cbm_ledger WHERE tx_hash = ? AND entry_type = ?", (l.get('tx_hash'), l.get('entry_type')))
                        if not cur.fetchone():
                            cur.execute("""
                                INSERT INTO cbm_ledger (
                                    account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            """, (
                                l.get('account_name'),
                                l.get('entry_type'),
                                int(l.get('amount_cents') or 0),
                                int(l.get('balance_after_cents') or 0),
                                l.get('tx_hash', ''),
                                l.get('notes', ''),
                                _parse_iso(l.get('created_at'))
                            ))
                            stats["ledger"] += 1

                # Vault Snapshots
                if st_snaps == 200 and isinstance(snaps, list):
                    for s in snaps:
                        cur.execute("SELECT 1 FROM cbm_vault_snapshots WHERE timestamp_epoch = ?", (float(s.get('timestamp_epoch', 0)),))
                        if not cur.fetchone():
                            cur.execute("""
                                INSERT INTO cbm_vault_snapshots (
                                    timestamp_epoch, vault_total_gold, unencumbered_reserves_gold,
                                    member_liabilities_gold, inflow_period_gold, outflow_period_gold,
                                    net_flow_gold, tx_count_period, created_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                float(s.get('timestamp_epoch', 0.0)),
                                float(s.get('vault_total_gold', 0.0)),
                                float(s.get('unencumbered_reserves_gold', 0.0)),
                                float(s.get('member_liabilities_gold', 0.0)),
                                float(s.get('inflow_period_gold', 0.0)),
                                float(s.get('outflow_period_gold', 0.0)),
                                float(s.get('net_flow_gold', 0.0)),
                                int(s.get('tx_count_period', 0)),
                                _parse_iso(s.get('created_at'))
                            ))
                            stats["snapshots"] += 1

                # Treasury
                if st_tr == 200 and isinstance(tr, list) and tr:
                    t = tr[0]
                    remote_sync_time = _parse_iso(t.get('last_sync_at'))
                    cur.execute("SELECT last_sync_at FROM cbm_treasury WHERE id = 1")
                    local_t = cur.fetchone()

                    if force or not (local_t and local_t[0] and local_t[0] > remote_sync_time):
                        cur.execute("""
                            UPDATE cbm_treasury
                            SET vault_total_gold_cents = ?,
                                member_liabilities_cents = ?,
                                bank_reserves_cents = ?,
                                unencumbered_capital_cents = ?,
                                loan_penalties_cents = ?,
                                last_sync_at = ?
                            WHERE id = 1
                        """, (
                            int(t.get('vault_total_gold_cents') or 0),
                            int(t.get('member_liabilities_cents') or 0),
                            int(t.get('bank_reserves_cents') or 0),
                            int(t.get('unencumbered_capital_cents') or 0),
                            int(t.get('loan_penalties_cents') or 0),
                            remote_sync_time
                        ))
                        stats["treasury"] = True

                # Withdrawals
                if st_wds == 200 and isinstance(wds, list):
                    for w in wds:
                        acc = w.get('account_name')
                        tgt = w.get('target_account') or acc
                        amt = int(w.get('amount_gold') or 0)
                        status = w.get('status', 'PENDING')
                        tx_id = w.get('tx_id')
                        c_at = _parse_iso(w.get('created_at'))
                        e_at = _parse_iso(w.get('executed_at')) if w.get('executed_at') else None
                        cur.execute("SELECT id FROM cbm_withdrawals WHERE account_name = ? AND target_account = ? AND amount_gold = ? AND ABS(created_at - ?) < 5", (acc, tgt, amt, c_at))
                        existing = cur.fetchone()
                        if existing:
                            cur.execute("UPDATE cbm_withdrawals SET status = ?, tx_id = ?, executed_at = ? WHERE id = ?", (status, tx_id, e_at, existing[0]))
                        else:
                            cur.execute("""
                                INSERT INTO cbm_withdrawals (
                                    account_name, target_account, amount_gold, fee_cents,
                                    status, tx_id, created_at, executed_at
                                ) VALUES (?, ?, ?, 0, ?, ?, ?, ?)
                            """, (acc, tgt, amt, status, tx_id, c_at, e_at))
                            stats["withdrawals"] += 1

                # API Keys
                if st_keys == 200 and isinstance(keys, list):
                    for k in keys:
                        cur.execute("""
                            INSERT INTO cbm_api_keys (
                                key_id, key_hash, key_prefix, app_name, owner_account,
                                environment, scopes, rate_limit_rpm, total_requests,
                                credits_consumed_gold, is_active, created_at, last_used_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(key_id) DO UPDATE SET
                                app_name = excluded.app_name,
                                scopes = excluded.scopes,
                                rate_limit_rpm = excluded.rate_limit_rpm,
                                total_requests = excluded.total_requests,
                                credits_consumed_gold = excluded.credits_consumed_gold,
                                is_active = excluded.is_active,
                                last_used_at = excluded.last_used_at
                        """, (
                            k.get('key_id'),
                            k.get('key_hash'),
                            k.get('key_prefix'),
                            k.get('app_name', 'Default App'),
                            k.get('owner_account'),
                            k.get('environment', 'live'),
                            k.get('scopes', 'read:bank,read:members'),
                            int(k.get('rate_limit_rpm') or 60),
                            int(k.get('total_requests') or 0),
                            float(k.get('credits_consumed_gold') or 0.0),
                            1 if k.get('is_active') else 0,
                            _parse_iso(k.get('created_at')),
                            _parse_iso(k.get('last_used_at')) if k.get('last_used_at') else None
                        ))
                        stats["api_keys"] += 1

                # Admin Election Votes
                if st_votes == 200 and isinstance(votes, list):
                    for v in votes:
                        cur.execute("""
                            INSERT INTO cbm_admin_votes (
                                claim_id, cbm_username, voter_account, target_account,
                                votes_count, gold_spent, reward_gold, reward_cents,
                                status, rejection_reason, verified_at, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(claim_id) DO UPDATE SET
                                status = excluded.status,
                                rejection_reason = excluded.rejection_reason,
                                verified_at = excluded.verified_at
                        """, (
                            v.get('claim_id'),
                            v.get('cbm_username'),
                            v.get('voter_account'),
                            v.get('target_account', 'DdcBC'),
                            int(v.get('votes_count') or 0),
                            float(v.get('gold_spent') or 0.0),
                            float(v.get('reward_gold') or 0.0),
                            int(v.get('reward_cents') or 0),
                            v.get('status', 'PENDING'),
                            v.get('rejection_reason'),
                            _parse_iso(v.get('verified_at')) if v.get('verified_at') else None,
                            _parse_iso(v.get('created_at'))
                        ))
                        stats["admin_votes"] = stats.get("admin_votes", 0) + 1

                # Sponsorship Slots
                if st_slots == 200 and isinstance(sb_slots, list):
                    for sl in sb_slots:
                        cur.execute("""
                            INSERT INTO cbm_sponsorship_slots (
                                slot_id, name, description, base_price_cents, current_price_cents,
                                max_active_sponsors, active_sponsor_account, lease_start_ts,
                                lease_end_ts, is_available, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(slot_id) DO UPDATE SET
                                name = excluded.name,
                                description = excluded.description,
                                base_price_cents = excluded.base_price_cents,
                                current_price_cents = excluded.current_price_cents,
                                max_active_sponsors = excluded.max_active_sponsors,
                                active_sponsor_account = excluded.active_sponsor_account,
                                lease_start_ts = excluded.lease_start_ts,
                                lease_end_ts = excluded.lease_end_ts,
                                is_available = excluded.is_available,
                                updated_at = excluded.updated_at
                        """, (
                            sl.get('slot_id'),
                            sl.get('name') or sl.get('slot_name'),
                            sl.get('description'),
                            int(sl.get('base_price_cents') or 50000),
                            int(sl.get('current_price_cents') or 50000),
                            int(sl.get('max_active_sponsors') or 1),
                            sl.get('active_sponsor_account') or sl.get('current_sponsor_account'),
                            _parse_iso(sl.get('lease_start_ts')) if sl.get('lease_start_ts') else None,
                            _parse_iso(sl.get('lease_end_ts') or sl.get('leased_until')) if (sl.get('lease_end_ts') or sl.get('leased_until')) else None,
                            1 if sl.get('is_available') else 0,
                            _parse_iso(sl.get('updated_at'))
                        ))
                    stats["sponsorship_slots"] = len(sb_slots)

                # Sponsored Ads
                if st_ads == 200 and isinstance(sb_ads, list):
                    for ad in sb_ads:
                        cur.execute("""
                            INSERT INTO cbm_sponsored_ads (
                                ad_id, slot_id, owner_account, title, tagline, target_url,
                                badge_text, image_url, image_width, image_height, is_official,
                                priority, impressions, clicks, expires_at, created_at, status
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(ad_id) DO UPDATE SET
                                title = excluded.title,
                                tagline = excluded.tagline,
                                target_url = excluded.target_url,
                                badge_text = excluded.badge_text,
                                image_url = excluded.image_url,
                                image_width = excluded.image_width,
                                image_height = excluded.image_height,
                                is_official = excluded.is_official,
                                priority = excluded.priority,
                                impressions = excluded.impressions,
                                clicks = excluded.clicks,
                                expires_at = excluded.expires_at,
                                status = excluded.status
                        """, (
                            ad.get('ad_id'),
                            ad.get('slot_id'),
                            ad.get('owner_account'),
                            ad.get('title'),
                            ad.get('tagline'),
                            ad.get('target_url'),
                            ad.get('badge_text', 'PROMOTED'),
                            ad.get('image_url'),
                            int(ad.get('image_width') or 728),
                            int(ad.get('image_height') or 90),
                            1 if ad.get('is_official') else 0,
                            int(ad.get('priority') or 0),
                            int(ad.get('impressions') or 0),
                            int(ad.get('clicks') or 0),
                            _parse_iso(ad.get('expires_at')),
                            _parse_iso(ad.get('created_at')),
                            ad.get('status', 'ACTIVE')
                        ))
                    stats["sponsored_ads"] = len(sb_ads)

                # Products
                if st_prods == 200 and isinstance(sb_prods, list):
                    for pr in sb_prods:
                        cur.execute("""
                            INSERT INTO cbm_products (
                                product_id, owner_account, name, description, image_url,
                                price_gold, price_cents, callback_url, webhook_url, status,
                                sales_count, total_revenue_gold, created_at, updated_at,
                                requires_client_verification, requirement_meta
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(product_id) DO UPDATE SET
                                owner_account = excluded.owner_account,
                                name = excluded.name,
                                description = excluded.description,
                                image_url = excluded.image_url,
                                price_gold = excluded.price_gold,
                                price_cents = excluded.price_cents,
                                callback_url = excluded.callback_url,
                                webhook_url = excluded.webhook_url,
                                status = excluded.status,
                                sales_count = excluded.sales_count,
                                total_revenue_gold = excluded.total_revenue_gold,
                                updated_at = excluded.updated_at,
                                requires_client_verification = excluded.requires_client_verification,
                                requirement_meta = excluded.requirement_meta
                        """, (
                            pr.get('product_id'),
                            pr.get('owner_account'),
                            pr.get('name'),
                            pr.get('description'),
                            pr.get('image_url'),
                            float(pr.get('price_gold') or 0.0),
                            int(pr.get('price_cents') or 0),
                            pr.get('callback_url'),
                            pr.get('webhook_url'),
                            pr.get('status', 'ACTIVE'),
                            int(pr.get('sales_count') or 0),
                            float(pr.get('total_revenue_gold') or 0.0),
                            _parse_iso(pr.get('created_at')),
                            _parse_iso(pr.get('updated_at')),
                            1 if pr.get('requires_client_verification') else 0,
                            json.dumps(pr.get('requirement_meta')) if isinstance(pr.get('requirement_meta'), (dict, list)) else pr.get('requirement_meta')
                        ))
                    stats["products"] = len(sb_prods)

                # Product Orders
                if st_orders == 200 and isinstance(sb_orders, list):
                    for o in sb_orders:
                        cur.execute("""
                            INSERT INTO cbm_product_orders (
                                order_id, product_id, buyer_cbm_username, buyer_territorial_account,
                                price_gold, price_cents, owner_share_cents, cushion_share_cents,
                                payment_method, tx_hash, verification_token, status,
                                expires_at, fulfilled_at, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(order_id) DO UPDATE SET
                                status = excluded.status,
                                fulfilled_at = excluded.fulfilled_at,
                                tx_hash = excluded.tx_hash,
                                verification_token = excluded.verification_token
                        """, (
                            o.get('order_id'),
                            o.get('product_id'),
                            o.get('buyer_cbm_username'),
                            o.get('buyer_territorial_account'),
                            float(o.get('price_gold') or 0.0),
                            int(o.get('price_cents') or 0),
                            int(o.get('owner_share_cents') or 0),
                            int(o.get('cushion_share_cents') or 0),
                            o.get('payment_method'),
                            o.get('tx_hash'),
                            o.get('verification_token'),
                            o.get('status'),
                            _parse_iso(o.get('expires_at')),
                            _parse_iso(o.get('fulfilled_at')),
                            _parse_iso(o.get('created_at'))
                        ))
                    stats["product_orders"] = len(sb_orders)

                # Pending Donations
                if st_p_dons == 200 and isinstance(sb_p_dons, list):
                    for pd in sb_p_dons:
                        cur.execute("SELECT 1 FROM cbm_pending_donations WHERE id = ?", (pd.get('id'),))
                        if not cur.fetchone():
                            cur.execute("""
                                INSERT INTO cbm_pending_donations (
                                    id, account_name, amount_cents, amount_gold, message, status, tx_hash, created_at, expires_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                pd.get('id'),
                                pd.get('account_name'),
                                int(pd.get('amount_cents') or 0),
                                float(pd.get('amount_gold') or 0.0),
                                pd.get('message', ''),
                                pd.get('status', 'PENDING'),
                                pd.get('tx_hash', ''),
                                _parse_iso(pd.get('created_at')),
                                _parse_iso(pd.get('expires_at'))
                            ))
                    stats["pending_donations"] = len(sb_p_dons)

                # Chat Whitelist
                if st_wl == 200 and isinstance(sb_wl, list):
                    for w in sb_wl:
                        cur.execute("""
                            INSERT INTO cbm_chat_whitelist (
                                account_name, added_by, is_active, notes, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?)
                            ON CONFLICT(account_name) DO UPDATE SET
                                is_active = excluded.is_active,
                                notes = excluded.notes,
                                updated_at = excluded.updated_at
                        """, (
                            w.get('account_name'),
                            w.get('added_by'),
                            1 if w.get('is_active') else 0,
                            w.get('notes'),
                            _parse_iso(w.get('created_at')),
                            _parse_iso(w.get('updated_at'))
                        ))
                    stats["chat_whitelist"] = len(sb_wl)

            if not quiet:
                print(f"[+] Supabase bi-directional sync completed: {stats}")
            return {"status": "ok", "stats": stats}
        except Exception as e:
            if not quiet:
                print(f"[!] Supabase sync error: {e}")
            return {"status": "error", "error": str(e)}

    # --- Transaction Deduplication & Reconciled Cache ---
    def is_tx_processed(self, tx_id: str) -> bool:
        # SQLite first (instant local resolution)
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM cbm_processed_txs WHERE tx_id = ?", (tx_id,))
        row = cur.fetchone()
        if row:
            return True

        if self.use_supabase:
            status, res = self._sb_request("cbm_processed_txs", method="GET", params=f"?tx_id=eq.{tx_id}&select=tx_id")
            if status == 200 and isinstance(res, list) and len(res) > 0:
                try:
                    with self.write_transaction() as (w_conn, w_cur):
                        w_cur.execute("INSERT OR IGNORE INTO cbm_processed_txs (tx_id, processed_at) VALUES (?, ?)", (tx_id, time.time()))
                except Exception:
                    pass
                return True

        return False

    def record_processed_tx(self, tx_id: str, timestamp_ms: int, sender: str, receiver: str, amount_gold: float, fee_gold: float, credited_account: Optional[str] = None):
        now = time.time()
        # 1. Local ACID SQLite persistence with serialized write transaction
        with self.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT OR IGNORE INTO cbm_processed_txs (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, now))

        # 2. Cloud multi-instance sync
        if self.use_supabase:
            payload = {
                "tx_id": tx_id,
                "timestamp_ms": timestamp_ms,
                "sender": sender,
                "receiver": receiver,
                "amount_gold": amount_gold,
                "fee_gold": fee_gold,
                "credited_account": credited_account
            }
            self._enqueue_sb_task("cbm_processed_txs", method="POST", body=payload)

    def _save_account_to_local_sqlite(self, acc: Dict[str, Any]):
        """Caches an account record fetched from remote Supabase directly into local SQLite."""
        if not acc or not acc.get("account_name"):
            return
        try:
            def _parse_ts(val):
                if isinstance(val, (int, float)):
                    return float(val)
                if isinstance(val, str) and val.strip():
                    try:
                        return float(val)
                    except ValueError:
                        try:
                            import datetime
                            clean = val.replace("Z", "+00:00")
                            return datetime.datetime.fromisoformat(clean).timestamp()
                        except Exception:
                            return time.time()
                return time.time()

            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    INSERT INTO cbm_accounts (
                        account_name, display_name, avatar_url, clan_tag, role,
                        deposited_cents, total_deposited_cents, total_withdrawn_cents,
                        created_at, updated_at, pin_hash, salt, is_verified,
                        primary_territorial_account, password_hash, is_delinquent
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(account_name) DO UPDATE SET
                        display_name = COALESCE(excluded.display_name, cbm_accounts.display_name),
                        avatar_url = COALESCE(excluded.avatar_url, cbm_accounts.avatar_url),
                        clan_tag = COALESCE(excluded.clan_tag, cbm_accounts.clan_tag),
                        role = COALESCE(excluded.role, cbm_accounts.role),
                        deposited_cents = excluded.deposited_cents,
                        total_deposited_cents = excluded.total_deposited_cents,
                        total_withdrawn_cents = excluded.total_withdrawn_cents,
                        updated_at = excluded.updated_at,
                        pin_hash = COALESCE(excluded.pin_hash, cbm_accounts.pin_hash),
                        salt = COALESCE(excluded.salt, cbm_accounts.salt),
                        is_verified = excluded.is_verified,
                        primary_territorial_account = COALESCE(excluded.primary_territorial_account, cbm_accounts.primary_territorial_account),
                        password_hash = COALESCE(excluded.password_hash, cbm_accounts.password_hash),
                        is_delinquent = excluded.is_delinquent
                """, (
                    acc.get("account_name"),
                    acc.get("display_name"),
                    acc.get("avatar_url", ""),
                    acc.get("clan_tag", "ANTI-OG"),
                    acc.get("role", "member"),
                    int(acc.get("deposited_cents") or 0),
                    int(acc.get("total_deposited_cents") or 0),
                    int(acc.get("total_withdrawn_cents") or 0),
                    _parse_ts(acc.get("created_at")),
                    _parse_ts(acc.get("updated_at")),
                    acc.get("pin_hash"),
                    acc.get("salt"),
                    1 if acc.get("is_verified") else 0,
                    acc.get("primary_territorial_account"),
                    acc.get("password_hash"),
                    1 if acc.get("is_delinquent") else 0
                ))
            self._do_index_account_aliases(acc.get("account_name"), acc.get("display_name"), acc.get("primary_territorial_account"))
            self._clear_missing_account_cache(acc.get("account_name"), acc.get("primary_territorial_account"), acc.get("display_name"))
        except Exception as e:
            pass

    def _clear_missing_account_cache(self, *names: str):
        """Invalidates negative cache entries when an account is registered, linked, or updated."""
        with self._missing_accounts_lock:
            for n in names:
                if n:
                    raw = str(n).strip()
                    self._missing_accounts_cache.pop(raw.lower(), None)
                    norm = unicodedata.normalize("NFKC", raw).strip().lower()
                    self._missing_accounts_cache.pop(norm, None)

    @staticmethod
    def _generate_name_candidates(raw_input: str) -> List[str]:
        """
        Generates canonical and compatibility candidate keys for player account resolution.
        Handles:
        1. URL-encoded strings (e.g. %5BPRIME%5D%F0%9D%90%87%F0%9D%90%94%F0%9D%90%8C%F0%9D%90%80%F0%9D%90%8D%F0%9F%95%8A)
        2. Unicode mathematical alphanumeric glyphs (e.g. 𝐇𝐔𝐌𝐀𝐍 -> HUMAN)
        3. Clan tags (e.g. [PRIME], [ANTI-OG], (TAG))
        4. Trailing decorative emojis and symbols (e.g. 🕊, ⚔️, 🔥)
        5. Spacing variations
        """
        if not raw_input:
            return []

        unquoted = str(raw_input).strip()
        if "%" in unquoted:
            try:
                unquoted = urllib.parse.unquote_plus(unquoted).strip()
            except Exception:
                pass
        if "%" in unquoted:
            try:
                unquoted = urllib.parse.unquote_plus(unquoted).strip()
            except Exception:
                pass

        if not unquoted:
            return []

        seen: Set[str] = set()
        candidates: List[str] = []

        def _add(cand: str):
            c = str(cand).strip()
            if c and c not in seen:
                seen.add(c)
                candidates.append(c)

        # 1. Raw unquoted input
        _add(unquoted)

        # 2. NFKC normalized (canonical decomposition for math bold, script, fraktur, fullwidth, etc.)
        nfkc = unicodedata.normalize("NFKC", unquoted).strip()
        _add(nfkc)

        # 3. Clan tag stripped variants (e.g. [PRIME] or [ANTI-OG] or (TAG))
        tagless_raw = re.sub(r'^[\[\(].*?[\]\)]\s*', '', unquoted).strip()
        _add(tagless_raw)

        tagless_nfkc = re.sub(r'^[\[\(].*?[\]\)]\s*', '', nfkc).strip()
        _add(tagless_nfkc)

        # 4. Emojis and decorative symbols stripped
        symbolless_raw = re.sub(r'[^\w\s\-]', '', tagless_raw).strip()
        _add(symbolless_raw)

        symbolless_nfkc = re.sub(r'[^\w\s\-]', '', tagless_nfkc).strip()
        _add(symbolless_nfkc)

        # 5. Core alphanumeric only
        alphanumeric = re.sub(r'[^a-zA-Z0-9_\-]', '', tagless_nfkc).strip()
        _add(alphanumeric)

        # 6. Spacing variations with clan tag
        clan_match = re.match(r'^([\[\(].*?[\]\)])\s*(.*)$', unquoted)
        if clan_match:
            tag, rest = clan_match.group(1), clan_match.group(2)
            norm_rest = unicodedata.normalize("NFKC", rest).strip()
            _add(f"{tag}{rest}")
            _add(f"{tag} {rest}")
            _add(f"{tag}{norm_rest}")
            _add(f"{tag} {norm_rest}")

        return candidates

    def _do_index_account_aliases(self, acc_name: Optional[str], disp_name: Optional[str] = None, prim_acc: Optional[str] = None):
        """Indexes all candidate representations of an account into the in-memory alias fast cache."""
        if not acc_name:
            return
        canonical = str(acc_name).strip()
        with self._alias_lock:
            for src in (acc_name, disp_name, prim_acc):
                if not src:
                    continue
                cands = self._generate_name_candidates(str(src))
                for c in cands:
                    self._alias_cache[c.lower()] = canonical
                    c_nfkc = unicodedata.normalize("NFKC", c).lower()
                    self._alias_cache[c_nfkc] = canonical
                    clean = re.sub(r'[^a-zA-Z0-9_\-]', '', c_nfkc)
                    if clean:
                        self._alias_cache[clean] = canonical

    def _ensure_alias_cache_loaded(self):
        """Pre-populates the in-memory alias index from SQLite on initial startup."""
        with self._alias_lock:
            if getattr(self, "_alias_cache_primed", False):
                return
            self._alias_cache_primed = True
        try:
            conn = self._get_sqlite_conn()
            cur = conn.cursor()
            cur.execute("SELECT account_name, display_name, primary_territorial_account FROM cbm_accounts")
            acc_rows = [dict(r) for r in cur.fetchall()]
            cur.execute("SELECT cbm_username, display_name, territorial_account_name FROM cbm_payment_methods")
            pm_rows = [dict(r) for r in cur.fetchall()]
            for r in acc_rows:
                self._do_index_account_aliases(r.get("account_name"), r.get("display_name"), r.get("primary_territorial_account"))
            for r in pm_rows:
                self._do_index_account_aliases(r.get("cbm_username"), r.get("display_name"), r.get("territorial_account_name"))
        except Exception:
            pass

    # --- Account & Ledger Management ---
    def _get_account_raw(self, account_name: str) -> Optional[Dict[str, Any]]:
        """
        Internal helper returning raw database record including credentials.
        Performs 4-way universal canonical resolution with NFKC font normalization,
        URL decoding, and tag/symbol-stripped multi-variant alias resolution:
        1. account_name (Direct CBM username / font variant)
        2. primary_territorial_account (In-game account ID, e.g. 87778 -> TeothePogie)
        3. cbm_payment_methods (Linked secondary in-game account IDs)
        4. display_name (In-game player handle, e.g. [PRO] Player)
        """
        if not account_name:
            return None

        candidates = self._generate_name_candidates(str(account_name))
        if not candidates:
            return None

        now = time.time()

        # Ensure alias cache is primed from SQLite
        self._ensure_alias_cache_loaded()

        # Check negative lookup cache ONLY if none of the candidates are known aliases
        with self._alias_lock:
            known_alias = any(
                c.lower() in self._alias_cache or unicodedata.normalize("NFKC", c).lower() in self._alias_cache
                for c in candidates
            )

        if not known_alias:
            with self._missing_accounts_lock:
                for c in candidates:
                    missing_ts = self._missing_accounts_cache.get(c.lower())
                    if missing_ts and (now - missing_ts) < 30.0:
                        return None

        # Fast-path: Check in-memory alias cache (< 0.0001ms)
        resolved_primary = None
        with self._alias_lock:
            for c in candidates:
                c_low = c.lower()
                if c_low in self._alias_cache:
                    resolved_primary = self._alias_cache[c_low]
                    break
                c_nfkc_low = unicodedata.normalize("NFKC", c).lower()
                if c_nfkc_low in self._alias_cache:
                    resolved_primary = self._alias_cache[c_nfkc_low]
                    break
                c_clean = re.sub(r'[^a-zA-Z0-9_\-]', '', c_nfkc_low)
                if c_clean and c_clean in self._alias_cache:
                    resolved_primary = self._alias_cache[c_clean]
                    break

        conn = self._get_sqlite_conn()
        cur = conn.cursor()

        if resolved_primary:
            cur.execute("SELECT * FROM cbm_accounts WHERE account_name = ? COLLATE NOCASE LIMIT 1", (resolved_primary,))
            row = cur.fetchone()
            if row:
                return dict(row)

        # 1. High-speed local SQLite resolution (0.05ms) across all generated candidates
        placeholders = ",".join("?" for _ in candidates)
        cur.execute(f"""
            SELECT * FROM cbm_accounts 
            WHERE account_name IN ({placeholders}) COLLATE NOCASE 
               OR primary_territorial_account IN ({placeholders}) COLLATE NOCASE 
               OR display_name IN ({placeholders}) COLLATE NOCASE
            LIMIT 1
        """, (*candidates, *candidates, *candidates))
        row = cur.fetchone()
        if row:
            d = dict(row)
            self._do_index_account_aliases(d.get("account_name"), d.get("display_name"), d.get("primary_territorial_account"))
            return d

        cur.execute(f"""
            SELECT a.* FROM cbm_accounts a
            JOIN cbm_payment_methods pm ON a.account_name = pm.cbm_username
            WHERE pm.territorial_account_name IN ({placeholders}) COLLATE NOCASE
            LIMIT 1
        """, (*candidates,))
        row2 = cur.fetchone()
        if row2:
            d = dict(row2)
            self._do_index_account_aliases(d.get("account_name"), d.get("display_name"), d.get("primary_territorial_account"))
            return d

        # 2. Remote Supabase fallback (only if not found locally)
        if self.use_supabase:
            import urllib.parse
            # Try candidates against Supabase cbm_accounts
            for c in candidates:
                quoted = urllib.parse.quote(c)
                status, res = self._sb_request(
                    "cbm_accounts",
                    method="GET",
                    params=f"?or=(account_name.ilike.{quoted},primary_territorial_account.ilike.{quoted},display_name.ilike.{quoted})&select=*&limit=1"
                )
                if status == 200 and isinstance(res, list) and res:
                    found = dict(res[0])
                    self._save_account_to_local_sqlite(found)
                    self._do_index_account_aliases(found.get("account_name"), found.get("display_name"), found.get("primary_territorial_account"))
                    return found

            # Try candidates against Supabase cbm_payment_methods
            for c in candidates:
                quoted = urllib.parse.quote(c)
                status, res = self._sb_request("cbm_payment_methods", method="GET", params=f"?territorial_account_name=ilike.{quoted}&select=cbm_username&limit=1")
                if status == 200 and isinstance(res, list) and res:
                    cbm_user = res[0].get("cbm_username")
                    if cbm_user:
                        status2, res2 = self._sb_request("cbm_accounts", method="GET", params=f"?account_name=ilike.{urllib.parse.quote(cbm_user)}&select=*&limit=1")
                        if status2 == 200 and isinstance(res2, list) and res2:
                            found = dict(res2[0])
                            self._save_account_to_local_sqlite(found)
                            self._do_index_account_aliases(found.get("account_name"), found.get("display_name"), found.get("primary_territorial_account"))
                            return found

            # Record non-existence in memory negative cache
            with self._missing_accounts_lock:
                for c in candidates:
                    self._missing_accounts_cache[c.lower()] = now

        return None

    def get_account(self, account_name: str) -> Optional[Dict[str, Any]]:
        """Returns public/member account details with sensitive credential hashes securely stripped."""
        raw = self._get_account_raw(account_name)
        if not raw:
            return None
        safe = dict(raw)
        safe.pop("pin_hash", None)
        safe.pop("salt", None)
        safe.pop("password_hash", None)
        safe.pop("password_salt", None)
        safe["has_pin"] = bool(raw.get("pin_hash"))
        safe["has_password"] = bool(raw.get("password_hash"))
        safe["primary_territorial_account"] = raw.get("primary_territorial_account")
        safe["is_verified"] = self.is_account_verified(safe.get("account_name", account_name))
        safe["cbm_plus_until"] = raw.get("cbm_plus_until")
        safe["cbm_plus_active"] = self.is_cbm_plus_active(raw)
        return safe

    def _get_all_account_aliases(self, account: str) -> List[str]:
        """Resolves an account name or alias to all associated identifiers (CBM username, in-game name, display name)."""
        clean = (account or "").strip()
        if not clean:
            return []
        aliases = {clean}
        raw = self._get_account_raw(clean)
        if raw:
            for k in ("account_name", "display_name", "primary_territorial_account"):
                v = raw.get(k)
                if v and isinstance(v, str) and v.strip():
                    aliases.add(v.strip())
            canonical = raw.get("account_name")
            if canonical:
                try:
                    conn = self._get_sqlite_conn()
                    cur = conn.cursor()
                    cur.execute(
                        "SELECT territorial_account_name, display_name FROM cbm_payment_methods WHERE cbm_username = ? COLLATE NOCASE",
                        (canonical,)
                    )
                    for r in cur.fetchall():
                        if r[0] and str(r[0]).strip():
                            aliases.add(str(r[0]).strip())
                        if r[1] and str(r[1]).strip():
                            aliases.add(str(r[1]).strip())
                except Exception:
                    pass
        return list(aliases)

    # --- CBM Password Authentication ---
    @staticmethod
    def _hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
        if not salt:
            salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return h, salt

    def has_account_password(self, account_name: str) -> bool:
        raw = self._get_account_raw(account_name)
        return bool(raw and raw.get("password_hash"))

    def verify_account_password(self, account_name: str, password: str) -> bool:
        if not password or not account_name:
            return False
        acc_norm = unicodedata.normalize("NFKC", str(account_name)).strip()
        if rate_limiter:
            is_locked, _ = rate_limiter.is_account_locked(acc_norm)
            if is_locked:
                return False
        raw = self._get_account_raw(acc_norm)
        if not raw:
            return False
        pwd_hash = raw.get("password_hash")
        salt = raw.get("password_salt")
        if not pwd_hash or not salt:
            return False
        test_h, _ = self._hash_password(password, salt)
        valid = hmac.compare_digest(pwd_hash, test_h)
        if rate_limiter:
            if valid:
                rate_limiter.record_auth_success(acc_norm)
            else:
                rate_limiter.record_auth_failure(acc_norm)
        return valid

    # --- CBM Access PIN & Ownership Authentication ---
    @staticmethod
    def _hash_pin(pin: str, salt: Optional[str] = None) -> Tuple[str, str]:
        if not salt:
            salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac("sha256", str(pin).strip().encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return h, salt

    def has_account_pin(self, account_name: str) -> bool:
        raw = self._get_account_raw(account_name)
        return bool(raw and raw.get("pin_hash"))

    def verify_account_pin(self, account_name: str, pin: str) -> bool:
        if not pin or not account_name:
            return False
        acc_norm = unicodedata.normalize("NFKC", str(account_name)).strip()
        if rate_limiter:
            is_locked, _ = rate_limiter.is_account_locked(acc_norm)
            if is_locked:
                return False
        raw = self._get_account_raw(acc_norm)
        if not raw:
            return False
        pin_hash = raw.get("pin_hash")
        salt = raw.get("salt")
        if not pin_hash or not salt:
            return False
        test_h, _ = self._hash_pin(pin, salt)
        valid = hmac.compare_digest(pin_hash, test_h)
        if rate_limiter:
            if valid:
                rate_limiter.record_auth_success(acc_norm)
            else:
                rate_limiter.record_auth_failure(acc_norm)
        return valid

    def _save_pin_hash(self, account_name: str, h: str, salt: str, mark_verified: bool = True):
        now = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, pin_hash, salt, is_verified, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(account_name) DO UPDATE SET
                pin_hash = excluded.pin_hash,
                salt = excluded.salt,
                is_verified = CASE WHEN ? = 1 THEN 1 ELSE cbm_accounts.is_verified END,
                updated_at = excluded.updated_at
        """, (account_name, account_name, h, salt, 1 if mark_verified else 0, now, now, 1 if mark_verified else 0))
        conn.commit()
        conn.close()

        if self.use_supabase:
            insert_data = {
                "account_name": account_name,
                "display_name": account_name,
                "clan_tag": "ANTI-OG",
                "role": "member",
                "pin_hash": h,
                "salt": salt,
                "is_verified": mark_verified
            }
            self._enqueue_sb_task("cbm_accounts", method="POST", body=insert_data, upsert=True)

    def create_account_pin(self, account_name: str, pin: str) -> Tuple[bool, str]:
        """Creates a brand new CBM Access PIN for an account that does not currently have one."""
        pin_str = str(pin).strip()
        if not pin_str.isdigit() or len(pin_str) < 6 or len(pin_str) > 8:
            return False, "Access PIN must be between 6 and 8 numeric digits."

        raw = self._get_account_raw(account_name)
        if not raw:
            raw = self.register_or_get_account(account_name)

        if raw.get("pin_hash"):
            return False, "This account already has an active Access PIN configured. Please use Change PIN to update it."

        h, salt = self._hash_pin(pin_str)
        self._save_pin_hash(account_name, h, salt, mark_verified=True)
        return True, "CBM Access PIN created successfully."

    def change_account_pin(self, account_name: str, current_pin: str, new_pin: str) -> Tuple[bool, str]:
        """Changes an existing CBM Access PIN. Strictly requires the current PIN for verification."""
        curr_str = str(current_pin).strip()
        new_str = str(new_pin).strip()

        if not new_str.isdigit() or len(new_str) < 6 or len(new_str) > 8:
            return False, "New Access PIN must be between 6 and 8 numeric digits."

        if not self.has_account_pin(account_name):
            return False, "No Access PIN configured for this account. Use Create PIN to set one."

        if not self.verify_account_pin(account_name, curr_str):
            return False, "Current PIN is incorrect. Verification failed."

        if curr_str == new_str:
            return False, "New PIN must be different from current PIN."

        h, salt = self._hash_pin(new_str)
        self._save_pin_hash(account_name, h, salt, mark_verified=False)
        return True, "CBM Access PIN changed successfully."

    def set_account_pin(self, account_name: str, pin: str, current_pin: Optional[str] = None) -> Tuple[bool, str]:
        """Backward-compatible unified method: routes to change_account_pin or create_account_pin."""
        if self.has_account_pin(account_name):
            if not current_pin:
                return False, "Current PIN is required to change your PIN."
            return self.change_account_pin(account_name, current_pin, pin)
        else:
            return self.create_account_pin(account_name, pin)

    def is_account_verified(self, account_name: str) -> bool:
        raw = self._get_account_raw(account_name)
        if not raw:
            return False
        if raw.get("is_verified"):
            return True

        canonical_name = raw.get("account_name", account_name)
        primary_terri = raw.get("primary_territorial_account")
        candidate_senders = list({s.strip() for s in [account_name, canonical_name, primary_terri] if s and s.strip()})

        verified = False

        # Check 1: Inbound transactions from any candidate sender
        if self.use_supabase:
            for s in candidate_senders:
                st, res = self._sb_request(
                    "cbm_processed_txs",
                    method="GET",
                    params=f"?sender=eq.{s}&receiver=eq.{self.vault_account}&select=tx_id"
                )
                if st == 200 and isinstance(res, list) and len(res) > 0:
                    verified = True
                    break

        if not verified:
            conn = self.get_write_connection()
            cur = conn.cursor()
            for s in candidate_senders:
                cur.execute("SELECT 1 FROM cbm_processed_txs WHERE sender = ? AND receiver = ?", (s, self.vault_account))
                if cur.fetchone():
                    verified = True
                    break
            conn.close()

        # Check 2: Linked payment methods with status 'VERIFIED'
        if not verified:
            if self.use_supabase:
                st, pms = self._sb_request(
                    "cbm_payment_methods",
                    method="GET",
                    params=f"?cbm_username=eq.{canonical_name}&status=eq.VERIFIED&select=id"
                )
                if st == 200 and isinstance(pms, list) and len(pms) > 0:
                    verified = True

            if not verified:
                conn = self.get_write_connection()
                cur = conn.cursor()
                try:
                    cur.execute("SELECT 1 FROM cbm_payment_methods WHERE cbm_username = ? AND status = 'VERIFIED'", (canonical_name,))
                    if cur.fetchone():
                        verified = True
                except Exception:
                    pass
                conn.close()

        # Check 3: Registered account with active password credentials
        if not verified and raw.get("password_hash"):
            verified = True

        # Auto-heal: persist is_verified = 1 in both Supabase and SQLite
        if verified:
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("UPDATE cbm_accounts SET is_verified = 1 WHERE account_name = ?", (canonical_name,))
            conn.commit()
            conn.close()
            if self.use_supabase:
                self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{canonical_name}", body={"is_verified": True})

        return verified

    def get_verified_destination_accounts(self, account_name: str) -> List[str]:
        """Closed-loop enforcement: Returns list of allowed in-game accounts where funds can be sent."""
        if not account_name:
            return []
        raw_acc = self._get_account_raw(account_name)
        canonical_name = raw_acc.get("account_name", account_name) if raw_acc else account_name

        allowed = {account_name.strip().upper(), canonical_name.strip().upper()}
        if raw_acc:
            if raw_acc.get("primary_territorial_account"):
                allowed.add(raw_acc["primary_territorial_account"].strip().upper())
            if raw_acc.get("display_name"):
                allowed.add(raw_acc["display_name"].strip().upper())

        check_names = {account_name, canonical_name}
        if raw_acc and raw_acc.get("primary_territorial_account"):
            check_names.add(raw_acc["primary_territorial_account"])

        # Check linked verified payment methods
        if self.use_supabase:
            import urllib.parse
            for cn in check_names:
                st, pms = self._sb_request(
                    "cbm_payment_methods",
                    method="GET",
                    params=f"?cbm_username=eq.{urllib.parse.quote(cn)}&select=territorial_account_name"
                )
                if st == 200 and isinstance(pms, list):
                    for p in pms:
                        t = p.get("territorial_account_name")
                        if t:
                            allowed.add(t.strip().upper())

        conn = self._get_sqlite_conn(row_factory=False)
        cur = conn.cursor()
        for cn in check_names:
            try:
                cur.execute("SELECT territorial_account_name FROM cbm_payment_methods WHERE cbm_username = ? COLLATE NOCASE", (cn,))
                for r in cur.fetchall():
                    if r[0]:
                        allowed.add(r[0].strip().upper())
            except Exception:
                pass
        return list(allowed)

    def register_member_account(
        self,
        username: str,
        password: str,
        avatar_url: str,
        primary_territorial_account: str,
        pin: Optional[str] = None,
        clan_tag: str = "ANTI-OG",
        role: str = "member",
        display_name: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Registers a new CBM Account with full credentials:
        - username (3-30 chars)
        - password (>= 6 chars, PBKDF2 hashed)
        - avatar_url (mandatory file upload or image URL)
        - primary_territorial_account (in-game account ID)
        - optional 4-8 digit quick PIN
        - dynamic clan_tag, role, and display_name fetched from Territorial.io
        """
        uname = username.strip()
        pwd = password.strip()
        avatar = avatar_url.strip()
        terri = primary_territorial_account.strip()
        final_disp = (display_name or uname).strip()

        if not uname or len(uname) < 3 or len(uname) > 30:
            return False, "Username must be between 3 and 30 characters.", None

        if not pwd or len(pwd) < 6:
            return False, "Password must be at least 6 characters long.", None

        if not avatar:
            return False, "A profile picture (uploaded file or image URL) is required.", None

        if not terri:
            return False, "Primary Territorial.io account ID is required.", None

        # Check if username already exists
        existing = self._get_account_raw(uname)
        if existing and existing.get("password_hash"):
            return False, "Username is already registered. Please choose another or log in.", None

        # Hash password
        pwd_hash, pwd_salt = self._hash_password(pwd)

        # Validate and hash mandatory Quick Access PIN
        if not pin:
            return False, "A 4 to 8 digit numeric Quick Access PIN is required for account registration.", None

        pin_str = str(pin).strip()
        if not pin_str.isdigit() or len(pin_str) < 4 or len(pin_str) > 8:
            return False, "Quick Access PIN must consist of 4 to 8 numeric digits.", None

        pin_hash, pin_salt = self._hash_pin(pin_str)

        now = time.time()
        # Save to Supabase if active
        if self.use_supabase:
            acc_data = {
                "account_name": uname,
                "display_name": final_disp,
                "avatar_url": avatar,
                "clan_tag": clan_tag,
                "role": role,
                "password_hash": pwd_hash,
                "password_salt": pwd_salt,
                "primary_territorial_account": terri,
                "is_verified": True
            }
            if pin_hash:
                acc_data["pin_hash"] = pin_hash
                acc_data["salt"] = pin_salt
            self._enqueue_sb_task("cbm_accounts", method="POST", body=acc_data, upsert=True)

        # Save to SQLite
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_accounts (
                account_name, display_name, avatar_url, clan_tag, role,
                password_hash, password_salt, primary_territorial_account,
                pin_hash, salt, is_verified, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(account_name) DO UPDATE SET
                display_name = excluded.display_name,
                avatar_url = excluded.avatar_url,
                clan_tag = excluded.clan_tag,
                role = excluded.role,
                password_hash = excluded.password_hash,
                password_salt = excluded.password_salt,
                primary_territorial_account = excluded.primary_territorial_account,
                pin_hash = COALESCE(excluded.pin_hash, cbm_accounts.pin_hash),
                salt = COALESCE(excluded.salt, cbm_accounts.salt),
                is_verified = 1,
                updated_at = excluded.updated_at
        """, (uname, final_disp, avatar, clan_tag, role, pwd_hash, pwd_salt, terri, pin_hash, pin_salt, now, now))
        conn.commit()
        conn.close()

        # Link primary payment method
        self.link_payment_method(
            cbm_username=uname,
            territorial_account=terri,
            is_primary=True,
            display_name=final_disp
        )
        self._clear_missing_account_cache(uname, terri, final_disp)
        acc = self.get_account(uname)
        return True, "Account registered successfully.", acc

    def sync_account_game_profile(
        self,
        account_name: str,
        display_name: Optional[str] = None,
        clan_tag: Optional[str] = None,
        role: Optional[str] = None,
        primary_territorial_account: Optional[str] = None
    ) -> bool:
        """Updates or enriches an account with dynamic in-game profile data from Territorial.io."""
        raw = self._get_account_raw(account_name)
        if not raw:
            return False

        canonical_name = raw["account_name"]
        updates = {}
        if display_name:
            updates["display_name"] = str(display_name).strip()
        if clan_tag:
            updates["clan_tag"] = str(clan_tag).strip()
        if role:
            updates["role"] = str(role).strip()
        if primary_territorial_account:
            updates["primary_territorial_account"] = str(primary_territorial_account).strip()

        if not updates:
            return True

        now = time.time()
        updates["updated_at"] = now

        conn = self.get_write_connection()
        cur = conn.cursor()
        set_clauses = [f"{k} = ?" for k in updates.keys()]
        values = list(updates.values()) + [canonical_name]
        cur.execute(f"UPDATE cbm_accounts SET {', '.join(set_clauses)} WHERE account_name = ?", values)
        conn.commit()
        conn.close()

        if self.use_supabase:
            import urllib.parse
            self._enqueue_sb_task(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{urllib.parse.quote(canonical_name)}",
                body=updates
            )
        return True

    def set_account_role(self, account_name: str, role: str) -> bool:
        """Convenience method to update an account role (e.g. member, restricted, officer)."""
        return self.sync_account_game_profile(account_name, role=role)

    def register_or_get_account(self, account_name: str, display_name: str = "", clan_tag: str = "ANTI-OG", role: str = "member") -> Dict[str, Any]:
        existing = self.get_account(account_name)
        if existing:
            return existing

        now = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT OR IGNORE INTO cbm_accounts (account_name, display_name, clan_tag, role, deposited_cents, total_deposited_cents, total_withdrawn_cents, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)
        """, (account_name, display_name or account_name, clan_tag, role, now, now))
        conn.commit()
        conn.close()

        if self.use_supabase:
            payload = {
                "account_name": account_name,
                "display_name": display_name or account_name,
                "clan_tag": clan_tag,
                "role": role,
                "deposited_cents": 0,
                "total_deposited_cents": 0,
                "total_withdrawn_cents": 0
            }
            self._enqueue_sb_task("cbm_accounts", method="POST", body=payload, upsert=True)

        return self.get_account(account_name)

    def update_account_profile(self, account_name: str, display_name: str, avatar_url: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Updates the editable display_name and required avatar_url for an account.
        Enforces that avatar_url is provided for member authenticity.
        """
        acc_key = account_name.strip()
        new_name = display_name.strip()
        new_avatar = avatar_url.strip()

        if not acc_key:
            return False, "Account name is required.", None
        if not new_name:
            return False, "Display name cannot be blank.", None
        if not new_avatar:
            return False, "A verified profile picture is required for member authenticity.", None

        # Ensure account exists
        self.register_or_get_account(acc_key)
        now = time.time()

        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE cbm_accounts
            SET display_name = ?, avatar_url = ?, updated_at = ?
            WHERE account_name = ?
        """, (new_name, new_avatar, now, acc_key))
        conn.commit()
        conn.close()

        if self.use_supabase:
            self._enqueue_sb_task(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{acc_key}",
                body={"display_name": new_name, "avatar_url": new_avatar}
            )

        updated = self.get_account(acc_key)
        return True, "Profile updated successfully.", updated

    # --- Member Loan Facilities & Forced Collection ---
    def create_loan(
        self,
        account_name: str,
        principal_gold: int,
        term_days: int = 14,
        territorial_account: str = "",
        territorial_password: str = "",
        user_pin: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Originates an authorized member loan facility under the 0.05% reserve cap.
        Standard term is 14 days with 0% initial rate.
        If unpaid after 14 days, a 50% forced penalty interest rate applies.
        Validates and binds borrower's Territorial.io credentials as debt recovery authorization.
        """
        acc = self.register_or_get_account(account_name)
        now = time.time()
        due_at = now + (term_days * 86400.0)
        principal_cents = int(round(principal_gold * 100))

        loan_id = None
        enc_pwd = encrypt_credential(territorial_password, user_pin=user_pin) if territorial_password else ""

        # 1. Always record in local SQLite
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_loans (
                account_name, principal_gold, interest_rate_percent, penalty_interest_rate,
                term_days, due_at, repaid_cents, penalty_cents, status,
                borrower_territorial_account, territorial_password, credential_status,
                last_credential_check_at, seizure_attempts, created_at, updated_at
            )
            VALUES (?, ?, 0.0, 50.0, ?, ?, 0, 0, 'ACTIVE', ?, ?, 'VALID', ?, 0, ?, ?)
        """, (account_name, principal_gold, term_days, due_at, territorial_account or "", enc_pwd, now, now, now))
        loan_id = cur.lastrowid
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase if active (Zero-Knowledge Cloud Isolation: Credentials NEVER dispatched)
        if self.use_supabase:
            payload = {
                "id": loan_id,
                "account_name": account_name,
                "principal_gold": principal_gold,
                "interest_rate_percent": 0.0,
                "penalty_interest_rate": 50.0,
                "term_days": term_days,
                "due_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(due_at)),
                "repaid_cents": 0,
                "penalty_cents": 0,
                "status": "ACTIVE",
                "borrower_territorial_account": territorial_account or "",
                "credential_status": "VALID"
            }
            self._enqueue_sb_task("cbm_loans", method="POST", body=payload, upsert=True)

        # Ensure payment method is linked for borrower
        if territorial_account:
            try:
                self.link_payment_method(
                    cbm_username=account_name,
                    territorial_account=territorial_account,
                    territorial_password=territorial_password or "",
                    verification_type="INPUT_CREDENTIALS",
                    display_name=territorial_account
                )
            except Exception as ex:
                print(f"[!] Warning linking payment method during loan origination: {ex}")

        # Credit borrower account with the borrowed funds
        new_balance = acc["deposited_cents"] + principal_cents
        tx_hash = f"loan_disburse_{account_name}_{int(now)}"
        ledger_note = f"Loan disbursement: {principal_gold} Gold (14-day return window, 50% penalty interest on default)"

        # 1. Update SQLite
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_balance, now, account_name))
        cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_DISBURSEMENT', ?, ?, ?, ?, ?)", (account_name, principal_cents, new_balance, tx_hash, ledger_note, now))
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase
        if self.use_supabase:
            self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"deposited_cents": new_balance})
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": account_name,
                "entry_type": "LOAN_DISBURSEMENT",
                "amount_cents": principal_cents,
                "balance_after_cents": new_balance,
                "tx_hash": tx_hash,
                "notes": ledger_note
            })

        self.recompute_treasury()
        loans = self.get_account_loans(account_name)
        return True, f"Loan of {principal_gold} Gold disbursed. Return window: 14 days (50% penalty interest on default).", loans[0] if loans else None

    def get_account_loans(self, account_name: str) -> List[Dict[str, Any]]:
        acc_key = account_name.strip()
        now = time.time()

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_loans WHERE account_name = ? ORDER BY created_at DESC", (acc_key,))
        loans = [dict(r) for r in cur.fetchall()]

        if not loans and self.use_supabase:
            status, res = self._sb_request("cbm_loans", method="GET", params=f"?account_name=eq.{acc_key}&order=created_at.desc&select=*")
            if status == 200 and isinstance(res, list):
                loans = res

        enriched = []
        for l in loans:
            created_ts = l.get("created_at")
            if isinstance(created_ts, str):
                try:
                    import datetime
                    created_ts = datetime.datetime.fromisoformat(created_ts.replace("Z", "+00:00")).timestamp()
                except Exception:
                    created_ts = now
            elif not created_ts:
                created_ts = now

            is_covenant_breach = (
                str(l.get("credential_status", "")).upper() == "BREACH_OF_COVENANT"
                or str(l.get("status", "")).upper() == "BREACH_OF_COVENANT"
            )

            sched = CBMLoanEngine.calculate_loan_schedule(
                principal_gold=int(l.get("principal_gold", 0)),
                created_at_ts=float(created_ts),
                current_ts=now,
                repaid_cents=int(l.get("repaid_cents", 0)),
                is_covenant_breach=is_covenant_breach
            )

            # Sync overdue status and penalty in DB if transitioned to OVERDUE
            if sched["is_overdue"] and l.get("status") not in ("OVERDUE", "REPAID", "BREACH_OF_COVENANT"):
                self._update_loan_record(l.get("id"), "OVERDUE", sched["penalty_interest_cents"])

            merged = {**l, **sched}
            merged.pop("territorial_password", None)
            enriched.append(merged)
        return enriched

    def _update_loan_record(
        self,
        loan_id: Any,
        status: str,
        penalty_cents: int,
        repaid_cents: Optional[int] = None,
        credential_status: Optional[str] = None,
        last_credential_check_at: Optional[float] = None,
        seizure_attempts: Optional[int] = None,
        last_seizure_attempt_at: Optional[float] = None
    ):
        now = time.time()
        body: Dict[str, Any] = {
            "status": status,
            "penalty_cents": penalty_cents,
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
        }
        if repaid_cents is not None:
            body["repaid_cents"] = repaid_cents
        if credential_status is not None:
            body["credential_status"] = credential_status
        if last_credential_check_at is not None:
            body["last_credential_check_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(last_credential_check_at))
        if seizure_attempts is not None:
            body["seizure_attempts"] = seizure_attempts
        if last_seizure_attempt_at is not None:
            body["last_seizure_attempt_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(last_seizure_attempt_at))

        # 1. Update SQLite
        conn = self.get_write_connection()
        cur = conn.cursor()
        set_clauses = ["status = ?", "penalty_cents = ?", "updated_at = ?"]
        params: list = [status, penalty_cents, now]

        if repaid_cents is not None:
            set_clauses.append("repaid_cents = ?")
            params.append(repaid_cents)
        if credential_status is not None:
            set_clauses.append("credential_status = ?")
            params.append(credential_status)
        if last_credential_check_at is not None:
            set_clauses.append("last_credential_check_at = ?")
            params.append(last_credential_check_at)
        if seizure_attempts is not None:
            set_clauses.append("seizure_attempts = ?")
            params.append(seizure_attempts)
        if last_seizure_attempt_at is not None:
            set_clauses.append("last_seizure_attempt_at = ?")
            params.append(last_seizure_attempt_at)

        params.append(loan_id)
        query = f"UPDATE cbm_loans SET {', '.join(set_clauses)} WHERE id = ?"
        cur.execute(query, tuple(params))
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase if active
        if self.use_supabase:
            self._enqueue_sb_task("cbm_loans", method="PATCH", params=f"?id=eq.{loan_id}", body=body)

    def repay_loan_from_balance(
        self,
        account_name: Optional[str] = None,
        loan_id: Any = None,
        amount_cents: Optional[int] = None,
        full_repay: bool = False,
        cbm_username: Optional[str] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Allows a member to voluntarily repay an active, overdue, or accelerated loan
        using their liquid CBM account balance (deposited_cents).
        Preserves 20.00 Gold buffer unless full repayment clears the loan completely.
        """
        acc_key = (account_name or cbm_username or "").strip()
        if not acc_key:
            return False, "Account name required for loan repayment.", {}
        acc = self.get_account(acc_key)
        if not acc:
            return False, f"Account '{acc_key}' not found.", {}

        loans = self.get_account_loans(acc_key)
        target_loan = None
        for l in loans:
            if str(l.get("id")) == str(loan_id):
                target_loan = l
                break

        # Fallback to first unpaid loan if loan_id is 'any' or None
        if not target_loan and (loan_id in ("any", None, "") and loans):
            for l in loans:
                if l.get("remaining_due_cents", 0) > 0:
                    target_loan = l
                    break

        if not target_loan:
            return False, "No outstanding loan found matching the specified ID.", {}

        remaining_due = target_loan.get("remaining_due_cents", 0)
        if remaining_due <= 0:
            return False, "This loan obligation has already been fully repaid.", target_loan

        current_balance = acc.get("deposited_cents", 0)
        if current_balance <= 0:
            return False, "Insufficient CBM balance. Inbound deposit required to repay loan.", {}

        # Determine repayment amount
        if full_repay or amount_cents is None or amount_cents <= 0:
            repay_amount = min(current_balance, remaining_due)
        else:
            repay_amount = min(int(amount_cents), remaining_due, current_balance)

        # Buffer preservation rule:
        # If repaying doesn't clear the full debt, preserve 20.00 Gold buffer (2,000 cents)
        if repay_amount < remaining_due and (current_balance - repay_amount) < CBMLoanEngine.ACCOUNT_BUFFER_CENTS:
            max_permitted = max(0, current_balance - CBMLoanEngine.ACCOUNT_BUFFER_CENTS)
            if max_permitted <= 0:
                return False, f"Repayment rejected: 20.00 Gold protected account buffer required. Current balance is {current_balance/100.0:.2f} Gold.", {}
            repay_amount = min(repay_amount, max_permitted)

        if repay_amount <= 0:
            return False, "No payable amount available after buffer calculation.", {}

        now = time.time()
        new_balance = current_balance - repay_amount
        new_repaid = target_loan.get("repaid_cents", 0) + repay_amount
        is_settled = new_repaid >= target_loan.get("total_due_cents", 0)

        new_status = "REPAID" if is_settled else (
            "BREACH_OF_COVENANT" if target_loan.get("is_covenant_breach") else (
                "OVERDUE" if target_loan.get("is_overdue") else "ACTIVE"
            )
        )

        # Update loan record
        self._update_loan_record(
            target_loan.get("id"),
            new_status,
            target_loan.get("penalty_interest_cents", 0),
            repaid_cents=new_repaid
        )

        # Record in ledger and update account balance
        tx_hash = f"repay_bal_{acc_key}_{int(now)}"
        ledger_note = f"Voluntary loan repayment: {repay_amount / 100.0:.2f} Gold toward {target_loan.get('principal_gold')} Gold loan (Status: {new_status})"

        # 1. Update SQLite with atomic decrement and lock
        try:
            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    UPDATE cbm_accounts
                    SET deposited_cents = deposited_cents - ?, updated_at = ?
                    WHERE account_name = ? AND deposited_cents >= ?
                """, (repay_amount, now, acc_key, repay_amount))

                if cur.rowcount == 0:
                    return False, "Insufficient balance or concurrent update conflict.", {}

                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (acc_key,))
                new_balance = cur.fetchone()[0]

                cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (acc_key, repay_amount, new_balance, tx_hash, ledger_note, now))
        except Exception as e:
            return False, f"Transaction error: {e}", {}

        # 2. Mirror to Supabase if active
        if self.use_supabase:
            self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_key}", body={"deposited_cents": new_balance})
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": acc_key,
                "entry_type": "LOAN_REPAYMENT",
                "amount_cents": repay_amount,
                "balance_after_cents": new_balance,
                "tx_hash": tx_hash,
                "notes": ledger_note
            })

        # Check if all loans are settled and restore account role if restricted
        updated_loans = self.get_account_loans(acc_key)
        unpaid = [l for l in updated_loans if l.get("status") in ("ACTIVE", "OVERDUE", "BREACH_OF_COVENANT") and l["remaining_due_cents"] > 0]
        if not unpaid:
            if acc.get("role") in ("restricted", "delinquent"):
                self.set_account_role(acc_key, "member")
                print(f"[+] Restored account '{acc_key}' to 'member' role after voluntary loan settlement.")

        self.recompute_treasury()

        updated_loan = next((l for l in updated_loans if str(l.get("id")) == str(target_loan.get("id"))), target_loan)
        return True, f"Repaid {repay_amount / 100.0:.2f} Gold. Remaining loan debt: {updated_loan.get('remaining_due_gold', 0.0):.2f} Gold.", {
            "repaid_gold": round(repay_amount / 100.0, 2),
            "remaining_due_gold": updated_loan.get("remaining_due_gold", 0.0),
            "new_balance_gold": round(new_balance / 100.0, 2),
            "status": new_status,
            "loan": updated_loan
        }

    def audit_loan_credential_liveness(self) -> Dict[str, Any]:
        """
        Non-Custodial Loan Maturity & Delinquency Audit.
        Audits active loan obligations for maturity and overdue status.
        If an active loan is past maturity (due_date_epoch < now):
        1. Transitions status to OVERDUE.
        2. Applies standard penalty interest.
        3. Restricts member withdrawal privileges until repaid.
        4. Garnishes internal CBM balances if available.
        Zero external game credentials are requested, decrypted, or touched.
        """
        now = time.time()
        loans = []

        if self.use_supabase:
            status, res = self._sb_request("cbm_loans", method="GET", params="?status=in.(ACTIVE,OVERDUE)&select=*")
            if status == 200 and isinstance(res, list):
                loans = res

        if not loans:
            conn = self.get_write_connection()
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM cbm_loans WHERE status IN ('ACTIVE', 'OVERDUE')")
            loans = [dict(r) for r in cur.fetchall()]
            conn.close()

        actions = []

        for l in loans:
            try:
                loan_id = l.get("id")
                acc_name = l.get("account_name")
                raw_due = l.get("due_at") or l.get("due_date_epoch")
                if isinstance(raw_due, (int, float)):
                    due_epoch = float(raw_due)
                elif isinstance(raw_due, str) and raw_due.strip():
                    try:
                        due_epoch = datetime.datetime.fromisoformat(raw_due.replace("Z", "+00:00")).timestamp()
                    except Exception:
                        try:
                            due_epoch = float(raw_due)
                        except Exception:
                            due_epoch = 0.0
                else:
                    due_epoch = 0.0
                status = l.get("status")

                if due_epoch > 0.0 and now > due_epoch and status == "ACTIVE":
                    principal_cents = int(round(float(l.get("principal_gold", 0)) * 100))
                    penalty_cents = int(round(principal_cents * (CBMLoanEngine.OVERDUE_PENALTY_INTEREST_PERCENT / 100.0)))

                    self._update_loan_record(
                        loan_id=loan_id,
                        status="OVERDUE",
                        penalty_cents=penalty_cents
                    )
                    self.set_account_role(acc_name, "restricted")

                    # Attempt internal balance garnishment
                    try:
                        self.reconcile_overdue_loans_and_enforce_garnishment(acc_name, force=True)
                    except Exception:
                        pass

                    actions.append({
                        "loan_id": loan_id,
                        "account_name": acc_name,
                        "status": "OVERDUE",
                        "penalty_cents": penalty_cents
                    })
            except Exception as item_err:
                print(f"[!] Warning on loan audit for id {l.get('id')}: {item_err}")

        return {
            "audited_at": now,
            "total_active_loans": len(loans),
            "overdue_actions": len(actions),
            "actions": actions
        }

    def execute_automated_gold_seizure(self, loan_id: Any, borrower_pin: Optional[str] = None) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Executes internal non-custodial loan settlement from borrower's deposited CBM balance.
        """
        conn = self.get_write_connection()
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_loans WHERE id = ?", (loan_id,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return False, f"Loan with ID '{loan_id}' not found.", {}

        l = dict(row)
        acc_name = l["account_name"]
        return self.repay_loan_from_balance(account_name=acc_name, loan_id=loan_id, full_repay=True)

    # Authoritative alias for collateral settlement under Loan Covenant
    execute_authorized_collateral_settlement = execute_automated_gold_seizure

    def reconcile_overdue_loans_and_enforce_garnishment(self, account_name: str, force: bool = False) -> Dict[str, Any]:
        """
        Evaluates loans for account.
        If any loan is overdue (>14 days, 50% interest applied):
        - Garnishes available balance from user's account while ALWAYS preserving
          a 20.00 Gold buffer (2,000 cents) so the account is not deleted by nightly gold deductions.
        - If the account does not have enough to fully clear the debt, downgrades role to 'restricted'.
        - If the debt is fully cleared, restores role to 'member'.
        """
        now = time.time()
        if not force:
            throttle_map = getattr(self, "_loan_reconcile_throttle", None)
            if throttle_map is None:
                self._loan_reconcile_throttle = {}
                throttle_map = self._loan_reconcile_throttle
            last_checked = throttle_map.get(account_name, 0.0)
            if (now - last_checked) < 60.0:
                return {"status": "ok", "throttled": True}
            throttle_map[account_name] = now

        loans = self.get_account_loans(account_name)
        active_loans = [l for l in loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING", "BREACH_OF_COVENANT")]
        total_remaining_debt = sum(l["remaining_due_cents"] for l in active_loans)
        has_overdue = any(l["is_overdue"] or l.get("status") in ("OVERDUE", "BREACH_OF_COVENANT") for l in active_loans)

        acc = self.get_account(account_name)
        if not acc:
            return {"status": "ok", "remaining_debt_cents": total_remaining_debt}

        current_balance = acc.get("deposited_cents", 0)
        total_garnished = 0
        now = time.time()

        if (has_overdue or force) and total_remaining_debt > 0 and current_balance > CBMLoanEngine.ACCOUNT_BUFFER_CENTS:
            garnish_cents, remaining_bal, is_settled = CBMLoanEngine.calculate_balance_garnishment(
                current_balance, total_remaining_debt
            )
            if garnish_cents > 0:
                # Deduct from user account balance
                new_bal = current_balance - garnish_cents
                tx_hash = f"force_garnish_{account_name}_{int(now)}"
                ledger_note = f"Forced balance garnishment: {garnish_cents / 100.0:.2f} Gold (50% overdue loan penalty, 20.00 Gold buffer protected)"

                # 1. Update SQLite
                conn = self.get_write_connection()
                cur = conn.cursor()
                cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_bal, now, account_name))
                cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (account_name, garnish_cents, new_bal, tx_hash, ledger_note, now))
                conn.commit()
                conn.close()

                # 2. Mirror to Supabase if active
                if self.use_supabase:
                    self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"deposited_cents": new_bal})
                    self._enqueue_sb_task("cbm_ledger", method="POST", body={
                        "account_name": account_name,
                        "entry_type": "LOAN_REPAYMENT",
                        "amount_cents": garnish_cents,
                        "balance_after_cents": new_bal,
                        "tx_hash": tx_hash,
                        "notes": ledger_note
                    })

                # Allocate garnish across overdue loans
                rem_garnish = garnish_cents
                for l in active_loans:
                    if rem_garnish <= 0:
                        break
                    due = l["remaining_due_cents"]
                    if due <= 0:
                        continue
                    part = min(rem_garnish, due)
                    new_repaid = l["repaid_cents"] + part
                    new_stat = "REPAID" if new_repaid >= l["total_due_cents"] else ("BREACH_OF_COVENANT" if l.get("status") == "BREACH_OF_COVENANT" else "OVERDUE")
                    self._update_loan_record(l.get("id"), new_stat, l["penalty_interest_cents"], repaid_cents=new_repaid)
                    rem_garnish -= part

                total_garnished = garnish_cents
                current_balance = new_bal
                # Re-fetch remaining debt
                loans = self.get_account_loans(account_name)
                active_loans = [l for l in loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING", "BREACH_OF_COVENANT")]
                total_remaining_debt = sum(l["remaining_due_cents"] for l in active_loans)

        # Enforce access downgrade if overdue and debt remains
        current_role = acc.get("role", "member")
        if (has_overdue or force) and total_remaining_debt > 0:
            if current_role != "restricted":
                self.set_account_role(account_name, "restricted")
                print(f"[!] Downgraded account '{account_name}' access to 'restricted' (Overdue debt: {total_remaining_debt/100.0:.2f} Gold, buffer: 20.00 Gold preserved).")
        elif total_remaining_debt == 0 and current_role == "restricted":
            self.set_account_role(account_name, "member")
            print(f"[+] Restored account '{account_name}' access to 'member' (All loans fully satisfied).")

        if total_garnished > 0:
            self.recompute_treasury()
        return {
            "account_name": account_name,
            "total_garnished_cents": total_garnished,
            "remaining_debt_cents": total_remaining_debt,
            "role": "restricted" if (has_overdue and total_remaining_debt > 0) else "member",
            "active_loans_count": len(active_loans)
        }

    def process_forced_loan_repayment_from_deposit(self, account_name: str, deposit_cents: int, tx_hash: str) -> Tuple[int, int, List[Dict[str, Any]]]:
        """
        Intercepts incoming member deposits and forces automatic repayment of outstanding loans.
        If the loan exceeded the 14-day return window, enforces the 50% interest rate penalty.
        If fully paid, automatically lifts account downgrade restriction.
        Returns: (total_garnished_cents, remaining_deposit_cents, settled_loans)
        """
        loans = self.get_account_loans(account_name)
        active_loans = [l for l in loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING", "BREACH_OF_COVENANT")]
        if not active_loans or deposit_cents <= 0:
            return 0, deposit_cents, []

        remaining_deposit = deposit_cents
        total_garnished = 0
        settled_loans = []
        now = time.time()

        for l in active_loans:
            if remaining_deposit <= 0:
                break
            
            rem_due = l["remaining_due_cents"]
            if rem_due <= 0:
                continue

            garnish = min(remaining_deposit, rem_due)
            new_repaid = l["repaid_cents"] + garnish
            is_settled = new_repaid >= l["total_due_cents"]
            new_status = "REPAID" if is_settled else ("BREACH_OF_COVENANT" if l.get("status") == "BREACH_OF_COVENANT" else ("OVERDUE" if l["is_overdue"] else "ACTIVE"))

            self._update_loan_record(l.get("id"), new_status, l["penalty_interest_cents"], repaid_cents=new_repaid)

            penalty_msg = f" (50% forced interest rate applied - loan exceeded 14-day window)" if l["is_overdue"] else " (Within 14-day return window - 0% interest)"
            ledger_note = f"Forced loan deposit deduction: {garnish / 100.0:.2f} Gold toward {l['principal_gold']} Gold loan{penalty_msg}"
            
            curr_acc = self.get_account(account_name)
            curr_bal = curr_acc.get("deposited_cents", 0) if curr_acc else 0

            # 1. Update SQLite
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (account_name, garnish, curr_bal, f"repay_{tx_hash[:16]}", ledger_note, now))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._enqueue_sb_task("cbm_ledger", method="POST", body={
                    "account_name": account_name,
                    "entry_type": "LOAN_REPAYMENT",
                    "amount_cents": garnish,
                    "balance_after_cents": curr_bal,
                    "tx_hash": f"repay_{tx_hash[:16]}",
                    "notes": ledger_note
                })

            remaining_deposit -= garnish
            total_garnished += garnish
            settled_loans.append({
                "loan_id": l.get("id"),
                "garnished_gold": garnish / 100.0,
                "status": new_status,
                "is_overdue": l["is_overdue"],
                "effective_interest_rate_percent": l["effective_interest_rate_percent"]
            })

        # Check if all loans are now settled; if so, restore access
        updated_loans = self.get_account_loans(account_name)
        unpaid = [l for l in updated_loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING", "BREACH_OF_COVENANT") and l["remaining_due_cents"] > 0]
        if not unpaid:
            curr_acc = self.get_account(account_name)
            if curr_acc and curr_acc.get("role") == "restricted":
                self.set_account_role(account_name, "member")
                print(f"[+] Restored account '{account_name}' to 'member' role after deposit cleared all outstanding loan balances.")

        return total_garnished, remaining_deposit, settled_loans

    def credit_deposit(self, account_name: str, amount_cents: int, tx_hash: str, fee_rebate_cents: int = 1) -> Dict[str, Any]:
        """
        Atomically credits a member's account with deposited gold cents.
        Also credits fee_rebate_cents (default 1 cent = 0.01 Gold) to cover the game's transaction fee.
        First applies deposit toward any forced loan repayment (with 50% penalty interest if overdue).
        Surplus deposit is added to available balance.
        """
        acc = self.register_or_get_account(account_name)

        # Deduplication check: Never double-credit a transaction that has already been recorded in the ledger
        if tx_hash:
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("SELECT id FROM cbm_ledger WHERE tx_hash = ? AND entry_type = 'DEPOSIT'", (tx_hash,))
            row = cur.fetchone()
            conn.close()
            if row:
                print(f"[!] Replay protection: tx_hash '{tx_hash}' already credited in ledger. Skipping.")
                return self.get_account(account_name) or acc

            if self.use_supabase:
                st, existing = self._sb_request(
                    "cbm_ledger",
                    method="GET",
                    params=f"?tx_hash=eq.{tx_hash}&entry_type=eq.DEPOSIT&select=id"
                )
                if st == 200 and isinstance(existing, list) and len(existing) > 0:
                    print(f"[!] Replay protection: tx_hash '{tx_hash}' already credited in ledger (Supabase). Skipping.")
                    return self.get_account(account_name) or acc

        total_credit_cents = amount_cents + fee_rebate_cents
        fee_note = f" (+{fee_rebate_cents / 100.0:.2f} Gold game fee covered by Bank)" if fee_rebate_cents > 0 else ""

        # Step 1: Intercept forced loan repayment if outstanding loans exist
        garnished_cents, remaining_credit_cents, settled = self.process_forced_loan_repayment_from_deposit(
            account_name, total_credit_cents, tx_hash
        )

        now = time.time()
        new_balance = acc["deposited_cents"] + remaining_credit_cents
        total_dep = acc["total_deposited_cents"] + total_credit_cents

        if remaining_credit_cents > 0:
            ledger_notes = f"Deposit credit of {remaining_credit_cents / 100.0:.2f} Gold{fee_note}"
            if garnished_cents > 0:
                ledger_notes += f" ({garnished_cents / 100.0:.2f} Gold garnished for loan repayment)"

            # 1. Update SQLite
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = ?, total_deposited_cents = ?, updated_at = ?
                WHERE account_name = ?
            """, (new_balance, total_dep, now, account_name))
            cur.execute("""
                INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                VALUES (?, 'DEPOSIT', ?, ?, ?, ?, ?)
            """, (account_name, remaining_credit_cents, new_balance, tx_hash, ledger_notes, now))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._enqueue_sb_task(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{account_name}",
                    body={"deposited_cents": new_balance, "total_deposited_cents": total_dep}
                )
                self._enqueue_sb_task(
                    "cbm_ledger",
                    method="POST",
                    body={
                        "account_name": account_name,
                        "entry_type": "DEPOSIT",
                        "amount_cents": remaining_credit_cents,
                        "balance_after_cents": new_balance,
                        "tx_hash": tx_hash,
                        "notes": ledger_notes
                    }
                )
        elif garnished_cents > 0:
            # Entire deposit was absorbed by loan debt
            # 1. Update SQLite
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("UPDATE cbm_accounts SET total_deposited_cents = ?, updated_at = ? WHERE account_name = ?", (total_dep, now, account_name))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._enqueue_sb_task(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{account_name}",
                    body={"total_deposited_cents": total_dep}
                )

        # Step 2: Also perform overdue reconciliation and 20 Gold buffer check
        self.reconcile_overdue_loans_and_enforce_garnishment(account_name)

        # Update vault assets in treasury (new inbound asset received)
        treasury = self.get_treasury()
        curr_vault = treasury.get("vault_total_gold_cents", 0) + amount_cents
        self.update_vault_balance(curr_vault)

        self.recompute_treasury()
        return self.get_account(account_name)

    def get_ledger(self, account_name: str, limit: int = 20) -> List[Dict[str, Any]]:
        acc_key = account_name.strip()
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_ledger WHERE account_name = ? ORDER BY created_at DESC LIMIT ?", (acc_key, limit))
        rows = [dict(r) for r in cur.fetchall()]
        if rows:
            return rows

        if self.use_supabase:
            status, res = self._sb_request("cbm_ledger", method="GET", params=f"?account_name=eq.{acc_key}&order=created_at.desc&limit={limit}&select=*")
            if status == 200 and isinstance(res, list):
                return res
        return []

    # --- Treasury & Reserves ---
    def get_treasury(self) -> Dict[str, Any]:
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_treasury WHERE id = 1")
        row = cur.fetchone()
        res_dict = None
        if row and row["vault_total_gold_cents"] > 0:
            res_dict = dict(row)
        elif self.use_supabase:
            status, res = self._sb_request("cbm_treasury", method="GET", params="?id=eq.1&select=*")
            if status == 200 and isinstance(res, list) and res:
                res_dict = res[0]

        if not res_dict:
            res_dict = dict(row) if row else {
                "vault_account_name": "DdcBC",
                "vault_total_gold_cents": 0,
                "member_liabilities_cents": 0,
                "bank_reserves_cents": 0
            }
        vt = res_dict.get("vault_total_gold_cents", 0)
        ml = res_dict.get("member_liabilities_cents", 0)
        res_dict["vault_excess_cents"] = max(0, vt - ml)
        res_dict["vault_excess_gold"] = res_dict["vault_excess_cents"] / 100.0
        return res_dict

    def get_community_metrics(self) -> Dict[str, Any]:
        """
        Returns high-level social proof and community adoption telemetry:
        - total_members: Count of registered CBM accounts (excluding system accounts)
        - active_depositors: Count of accounts with deposited_cents > 0
        - total_volume_gold: Cumulative all-time gold transacted across the ledger
        - volume_24h_gold: Gold transacted in the last 24 hours
        - total_transactions: Total count of ledger operations
        """
        try:
            conn = self._get_sqlite_conn()
            cur = conn.cursor()

            vault_clean = (self.vault_account or "DdcBC").strip().lower()
            cur.execute("""
                SELECT count(*) FROM cbm_accounts
                WHERE role != 'system'
                  AND LOWER(account_name) NOT IN ('treasury', 'war_chest', 'bank', 'vault', 'reserves', 'system')
                  AND LOWER(account_name) != ?;
            """, (vault_clean,))
            row = cur.fetchone()
            total_members = row[0] if row else 0

            cur.execute("""
                SELECT count(*) FROM cbm_accounts
                WHERE role != 'system'
                  AND LOWER(account_name) NOT IN ('treasury', 'war_chest', 'bank', 'vault', 'reserves', 'system')
                  AND LOWER(account_name) != ?
                  AND deposited_cents > 0;
            """, (vault_clean,))
            row = cur.fetchone()
            active_depositors = row[0] if row else 0

            now_ts = time.time()
            ts_24h_ago = now_ts - 86400

            cur.execute("SELECT count(*), COALESCE(SUM(amount_cents), 0) FROM cbm_ledger;")
            tx_row = cur.fetchone()
            total_txs = tx_row[0] if tx_row else 0
            total_vol_cents = tx_row[1] if tx_row else 0

            cur.execute("SELECT COALESCE(SUM(amount_cents), 0) FROM cbm_ledger WHERE created_at >= ?;", (ts_24h_ago,))
            vol_24h_row = cur.fetchone()
            vol_24h_cents = vol_24h_row[0] if vol_24h_row else 0

            return {
                "total_members": int(total_members),
                "active_depositors": int(active_depositors),
                "total_transactions": int(total_txs),
                "total_volume_gold": round(total_vol_cents / 100.0, 2),
                "volume_24h_gold": round(vol_24h_cents / 100.0, 2)
            }
        except Exception as ex:
            print(f"[!] Warning in get_community_metrics: {ex}")
            return {
                "total_members": 0,
                "active_depositors": 0,
                "total_transactions": 0,
                "total_volume_gold": 0.0,
                "volume_24h_gold": 0.0
            }

    def _calculate_treasury_metrics(self, vault_total_cents: int) -> Dict[str, Any]:
        try:
            return self._do_calculate_treasury_metrics(vault_total_cents)
        except sqlite3.DatabaseError as db_err:
            if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image", "not a database")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                self._init_sqlite()
                if self.use_supabase:
                    try:
                        self.sync_all_from_supabase(quiet=True)
                    except Exception:
                        pass
                try:
                    return self._do_calculate_treasury_metrics(vault_total_cents)
                except Exception as retry_err:
                    print(f"[!] Error on retrying _calculate_treasury_metrics: {retry_err}")
            raise

    def _do_calculate_treasury_metrics(self, vault_total_cents: int) -> Dict[str, Any]:
        """
        Calculates all core treasury metrics dynamically using high-speed local SQLite:
        1. Member liabilities (sum of deposited_cents for non-system accounts)
        2. Unencumbered capital (sum of war chest donations from cbm_donations)
        3. Loan interest penalties (sum of penalty_cents from cbm_loans)
        4. Bank reserves = max(0, vault_total_cents - member_liabilities_cents)
        5. Vault excess = bank_reserves
        6. Vault cushion = max(0, bank_reserves - unencumbered_capital)
        """
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT SUM(deposited_cents) FROM cbm_accounts
            WHERE LOWER(account_name) NOT IN ('treasury', 'war_chest', 'bank', 'vault', 'reserves')
        """)
        row = cur.fetchone()
        total_liab = row[0] or 0

        cur.execute("SELECT SUM(amount_cents) FROM cbm_donations")
        row_d = cur.fetchone()
        donations_capital = row_d[0] or 0
        unencumbered_capital = donations_capital

        cur.execute("SELECT SUM(penalty_cents) FROM cbm_loans")
        row_l = cur.fetchone()
        loan_penalties = row_l[0] or 0

        if self.use_supabase:
            # Independent cold-start fallbacks from Supabase if local SQLite was empty
            if total_liab == 0:
                status, res = self._sb_request("cbm_accounts", method="GET", params="?select=account_name,deposited_cents")
                if status == 200 and isinstance(res, list) and res:
                    system_accs = {'treasury', 'war_chest', 'bank', 'vault', 'reserves'}
                    total_liab = sum(
                        r.get("deposited_cents", 0)
                        for r in res
                        if r.get("account_name", "").lower() not in system_accs
                    )

            if unencumbered_capital == 0:
                st_d, dons = self._sb_request("cbm_donations", method="GET", params="?select=amount_cents")
                if st_d == 200 and isinstance(dons, list) and dons:
                    unencumbered_capital = sum(d.get("amount_cents", 0) for d in dons)

            if loan_penalties == 0:
                st_l, loans = self._sb_request("cbm_loans", method="GET", params="?select=penalty_cents")
                if st_l == 200 and isinstance(loans, list) and loans:
                    loan_penalties = sum(ln.get("penalty_cents", 0) for ln in loans)

        bank_reserves = max(0, vault_total_cents - total_liab)
        vault_excess = bank_reserves
        vault_cushion = max(0, bank_reserves - unencumbered_capital)

        return {
            "vault_total_gold_cents": vault_total_cents,
            "member_liabilities_cents": total_liab,
            "vault_excess_cents": vault_excess,
            "unencumbered_capital_cents": unencumbered_capital,
            "loan_penalties_cents": loan_penalties,
            "vault_cushion_cents": vault_cushion,
            "bank_reserves_cents": bank_reserves,
            "vault_total_gold": vault_total_cents / 100.0,
            "member_liabilities_gold": total_liab / 100.0,
            "vault_excess_gold": vault_excess / 100.0,
            "unencumbered_capital_gold": unencumbered_capital / 100.0,
            "loan_penalties_gold": loan_penalties / 100.0,
            "vault_cushion_gold": vault_cushion / 100.0,
            "bank_reserves_gold": bank_reserves / 100.0
        }

    def _persist_treasury_metrics(self, metrics: Dict[str, Any], now_iso: Optional[str] = None):
        """Helper to persist computed treasury metrics to Supabase and SQLite with lock retry resilience."""
        now = time.time()
        iso = now_iso or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))

        for attempt in range(5):
            conn = None
            try:
                with _DB_WRITE_LOCK:
                    conn = self.get_write_connection(timeout=10.0)
                    cur = conn.cursor()
                    try:
                        cur.execute("""
                            UPDATE cbm_treasury
                            SET vault_total_gold_cents = ?, member_liabilities_cents = ?, bank_reserves_cents = ?,
                                unencumbered_capital_cents = ?, loan_penalties_cents = ?, last_sync_at = ?
                            WHERE id = 1
                        """, (
                            metrics["vault_total_gold_cents"],
                            metrics["member_liabilities_cents"],
                            metrics["bank_reserves_cents"],
                            metrics["unencumbered_capital_cents"],
                            metrics["loan_penalties_cents"],
                            now
                        ))
                    except sqlite3.OperationalError as col_err:
                        if "no such column" in str(col_err).lower():
                            cur.execute("""
                                UPDATE cbm_treasury
                                SET vault_total_gold_cents = ?, member_liabilities_cents = ?, bank_reserves_cents = ?, last_sync_at = ?
                                WHERE id = 1
                            """, (
                                metrics["vault_total_gold_cents"],
                                metrics["member_liabilities_cents"],
                                metrics["bank_reserves_cents"],
                                now
                            ))
                        else:
                            raise
                    conn.commit()
                break
            except sqlite3.OperationalError as lock_err:
                if "locked" in str(lock_err).lower() or "busy" in str(lock_err).lower():
                    if attempt < 4:
                        time.sleep(0.05 * (2 ** attempt))
                        continue
                print(f"[!] Warning: _persist_treasury_metrics locked after {attempt+1} attempts: {lock_err}")
                break
            except Exception as e:
                print(f"[!] Notice in _persist_treasury_metrics: {e}")
                break
            finally:
                if conn:
                    try:
                        conn.close()
                    except Exception:
                        pass

        if self.use_supabase:
            patch_payload = {
                "vault_total_gold_cents": metrics["vault_total_gold_cents"],
                "member_liabilities_cents": metrics["member_liabilities_cents"],
                "bank_reserves_cents": metrics["bank_reserves_cents"],
                "last_sync_at": iso
            }
            patch_payload_full = dict(patch_payload)
            patch_payload_full["unencumbered_capital_cents"] = metrics["unencumbered_capital_cents"]
            patch_payload_full["loan_penalties_cents"] = metrics["loan_penalties_cents"]
            self._enqueue_sb_task("cbm_treasury", method="PATCH", params="?id=eq.1", body=patch_payload_full)

    def sync_vault_balance_from_live_api(self, vault_account: str, vault_password: str) -> Tuple[bool, int, Dict[str, Any]]:
        """
        Queries the official Territorial.io API directly to verify the EXACT live vault balance.
        Reconciles against internal member liabilities, unencumbered war chest capital, and loan penalties.
        """
        if not vault_account or not vault_password:
            return False, 0, {"error": "Vault credentials missing. Cannot execute live API verification."}

        try:
            client = TerritorialGoldClient(vault_account, vault_password)
            res = client.get_account_data(vault_account)
            if res.get("status") != "ok":
                return False, 0, {"error": f"Territorial.io API rejected authentication: {res.get('status')}"}

            raw_acc = res.get("account_data", {})
            live_gold_cents = int(raw_acc.get("gold_cents", 0))

            metrics = self._calculate_treasury_metrics(live_gold_cents)
            now = time.time()
            now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))

            self._persist_treasury_metrics(metrics, now_iso=now_iso)

            audit_info = {
                "vault_account": vault_account,
                "vault_total_gold": metrics["vault_total_gold"],
                "vault_total_gold_cents": live_gold_cents,
                "member_liabilities_gold": metrics["member_liabilities_gold"],
                "vault_excess_gold": metrics["vault_excess_gold"],
                "unencumbered_capital_gold": metrics["unencumbered_capital_gold"],
                "loan_penalties_gold": metrics["loan_penalties_gold"],
                "bank_reserves_gold": metrics["bank_reserves_gold"],
                "audit_status": "VERIFIED_LIVE",
                "last_sync_at": now_iso
            }
            print(f"[+] Live Vault Audit: {metrics['vault_total_gold']:.2f} Gold in vault '{vault_account}' (Reserves: {metrics['bank_reserves_gold']:.2f} Gold [WarChest: {metrics['unencumbered_capital_gold']:.2f} + Cushion: {metrics['vault_cushion_gold']:.2f}], Liabilities: {metrics['member_liabilities_gold']:.2f} Gold).")
            return True, live_gold_cents, audit_info
        except Exception as e:
            print(f"[!] Live vault audit error: {e}")
            return False, 0, {"error": str(e)}

    def update_vault_balance(self, vault_total_cents: int):
        metrics = self._calculate_treasury_metrics(vault_total_cents)
        self._persist_treasury_metrics(metrics)

    def recompute_treasury(self, vault_gold: Optional[float] = None) -> Dict[str, Any]:
        """Re-sums member liabilities, unencumbered capital, loan penalties, and recalculates unencumbered bank reserves."""
        if vault_gold is not None:
            vault_total = int(round(float(vault_gold) * 100))
        else:
            treasury = self.get_treasury()
            vault_total = treasury.get("vault_total_gold_cents", 0)
        metrics = self._calculate_treasury_metrics(vault_total)
        self._persist_treasury_metrics(metrics)
        return metrics

    # --- Recent Transactions & Audits ---
    def get_recent_transactions(self, limit: int = 25) -> List[Dict[str, Any]]:
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_processed_txs ORDER BY timestamp_ms DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        if rows:
            return rows

        if self.use_supabase:
            status, res = self._sb_request("cbm_processed_txs", method="GET", params=f"?order=timestamp_ms.desc&limit={limit}&select=*")
            if status == 200 and isinstance(res, list) and res:
                try:
                    for r in res:
                        cur.execute("""
                            INSERT OR IGNORE INTO cbm_processed_txs (
                                tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            r.get("tx_id"),
                            r.get("timestamp_ms", 0),
                            r.get("sender") or r.get("sender_account", ""),
                            r.get("receiver") or r.get("receiver_account", ""),
                            r.get("amount_gold", 0.0),
                            r.get("fee_gold", 0.0),
                            r.get("credited_account", ""),
                            r.get("processed_at", time.time())
                        ))
                    conn.commit()
                except Exception as e:
                    print(f"[!] Error caching txs to SQLite: {e}")
                return res

        return []

    # --- Linked Territorial.io Payment Methods ---
    def link_payment_method(
        self,
        cbm_username: str,
        territorial_account: str = "",
        territorial_password: Optional[str] = None,
        verification_type: str = "TRANSACTION_VERIFIED",
        display_name: Optional[str] = None,
        is_primary: bool = False,
        user_pin: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Links an in-game territorial.io account as a payment method for a CBM user (Strictly Non-Custodial)."""
        cbm_user = cbm_username.strip()
        terri_acc = (territorial_account or kwargs.get("territorial_account_name") or "").strip()
        disp_name = display_name or terri_acc
        now = time.time()

        # Ensure user account exists in cbm_accounts
        self.register_or_get_account(cbm_user, display_name=disp_name)

        # 1. Dual-Write: Always commit to SQLite first (Zero password storage)
        conn = self.get_write_connection()
        cur = conn.cursor()
        if is_primary:
            cur.execute("UPDATE cbm_payment_methods SET is_primary = 0 WHERE cbm_username = ?", (cbm_user,))

        cur.execute("""
            INSERT INTO cbm_payment_methods 
            (cbm_username, territorial_account_name, territorial_password, display_name, verification_type, status, is_primary, total_transacted_gold, linked_at, last_used_at)
            VALUES (?, ?, '', ?, ?, 'VERIFIED', ?, 0.0, ?, ?)
            ON CONFLICT(territorial_account_name) DO UPDATE SET
            cbm_username=excluded.cbm_username,
            territorial_password='',
            display_name=COALESCE(excluded.display_name, display_name),
            verification_type=excluded.verification_type,
            status='VERIFIED',
            is_primary=excluded.is_primary,
            last_used_at=excluded.last_used_at
        """, (cbm_user, terri_acc, disp_name, verification_type, 1 if is_primary else 0, now, now))
        conn.commit()
        conn.close()
        self._do_index_account_aliases(cbm_user, disp_name, terri_acc)
        self._clear_missing_account_cache(cbm_user, terri_acc, disp_name)

        # 2. Dual-Write: Mirror to Supabase if active (Non-Custodial: Passwords NEVER dispatched)
        if self.use_supabase:
            payload = {
                "cbm_username": cbm_user,
                "territorial_account_name": terri_acc,
                "display_name": disp_name,
                "verification_type": verification_type,
                "status": "VERIFIED",
                "is_primary": is_primary
            }
            if is_primary:
                self._enqueue_sb_task("cbm_payment_methods", method="PATCH", params=f"?cbm_username=eq.{cbm_user}", body={"is_primary": False})
            self._enqueue_sb_task("cbm_payment_methods", method="POST", body=payload)

        methods = self.get_payment_methods(cbm_user)
        for m in methods:
            if m.get("territorial_account_name") == terri_acc:
                return m
        return {"status": "linked", "cbm_username": cbm_user, "territorial_account_name": terri_acc, "display_name": disp_name, "is_primary": is_primary}

    def get_payment_methods(self, cbm_username: str, include_credentials: bool = False, user_pin: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves linked payment methods for a CBM member.
        Strictly Non-Custodial: Game passwords are never retained, returned, or handled.
        """
        cbm_user = cbm_username.strip()
        conn = self.get_write_connection()
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_payment_methods WHERE cbm_username = ? ORDER BY is_primary DESC, linked_at ASC", (cbm_user,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()

        if not rows and self.use_supabase:
            status, res = self._sb_request("cbm_payment_methods", method="GET", params=f"?cbm_username=eq.{cbm_user}&select=*")
            if status == 200 and isinstance(res, list) and res:
                rows = [dict(r) for r in res]
                try:
                    conn = self.get_write_connection()
                    cur = conn.cursor()
                    for r in rows:
                        cur.execute("""
                            INSERT OR REPLACE INTO cbm_payment_methods (
                                id, cbm_username, territorial_account_name, territorial_password,
                                display_name, verification_type, status, is_primary,
                                total_transacted_gold, linked_at, last_used_at
                            ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            r.get("id"),
                            r.get("cbm_username", cbm_user),
                            r.get("territorial_account_name", ""),
                            r.get("display_name", ""),
                            r.get("verification_type", "TRANSACTION_VERIFIED"),
                            r.get("status", "VERIFIED"),
                            1 if r.get("is_primary") else 0,
                            float(r.get("total_transacted_gold", 0.0) or 0.0),
                            float(r.get("linked_at", time.time()) or time.time()),
                            float(r.get("last_used_at", time.time()) or time.time())
                        ))
                    conn.commit()
                    conn.close()
                except Exception as cache_err:
                    print(f"[!] Error caching payment methods to SQLite: {cache_err}")

        for r in rows:
            r["has_stored_credentials"] = False
            r.pop("territorial_password", None)
        return rows

    def get_cbm_username_by_territorial_account(self, territorial_account: str) -> Optional[str]:
        """Resolves which CBM user owns a specific territorial.io account."""
        if not territorial_account:
            return None
        terri_acc = str(territorial_account).strip()
        raw = self._get_account_raw(terri_acc)
        if raw and raw.get("account_name"):
            return raw["account_name"]

        if self.use_supabase:
            import urllib.parse
            status, res = self._sb_request("cbm_payment_methods", method="GET", params=f"?territorial_account_name=ilike.{urllib.parse.quote(terri_acc)}&select=cbm_username")
            if status == 200 and isinstance(res, list) and res:
                return res[0].get("cbm_username")

        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("SELECT cbm_username FROM cbm_payment_methods WHERE territorial_account_name = ? COLLATE NOCASE", (terri_acc,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

    def record_payment_method_transaction(self, territorial_account: str, amount_gold: float):
        """Updates the total transacted volume and last_used timestamp on the payment method."""
        terri_acc = territorial_account.strip()
        now = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE cbm_payment_methods
            SET total_transacted_gold = total_transacted_gold + ?, last_used_at = ?
            WHERE territorial_account_name = ?
        """, (amount_gold, now, terri_acc))
        conn.commit()
        conn.close()

    # --- Clan War Chest & Treasury Donations ---
    def donate_from_balance(
        self,
        account_name: str,
        amount_gold: float,
        message: str = "",
        territorial_account: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Transfers gold from a member's deposited balance directly into Unencumbered Bank Reserves.
        - Reduces member_liabilities_cents by amount_cents.
        - Vault assets remain constant, so bank_reserves_cents increases 1:1.
        - Preserves the 20.00 Gold buffer if user has active/overdue loans.
        """
        acc_key = account_name.strip()
        if not acc_key:
            return False, "Account name is required.", None

        if amount_gold <= 0:
            return False, "Donation amount must be strictly greater than 0 Gold.", None

        amount_cents = int(round(amount_gold * 100))
        if amount_cents <= 0:
            return False, "Donation amount must be at least 0.01 Gold.", None

        acc = self.get_account(acc_key)
        if not acc:
            return False, f"Account '{acc_key}' not found.", None

        curr_balance_cents = int(acc.get("deposited_cents", 0))
        if curr_balance_cents < amount_cents:
            avail_gold = curr_balance_cents / 100.0
            return False, f"Insufficient funds: available balance is {avail_gold:.2f} Gold, requested donation is {amount_gold:.2f} Gold.", None

        # Check loan status: if account has active or overdue loans, preserve 20 Gold buffer
        loans = self.get_account_loans(acc_key)
        active_loans = [l for l in loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING") and l.get("remaining_due_cents", 0) > 0]
        if active_loans:
            min_buffer_cents = 2000  # 20.00 Gold buffer
            if curr_balance_cents - amount_cents < min_buffer_cents:
                return False, "Protected buffer rule: Accounts with active loans must retain at least 20.00 Gold to prevent nightly game account deletion.", None

        now = time.time()
        new_balance_cents = curr_balance_cents - amount_cents
        tx_hash = f"warchest_{acc_key}_{int(now)}"
        clean_msg = message.strip() if message else "Anti-OG Clan War Chest Contribution"
        ledger_notes = f"Clan War Chest Donation: {amount_gold:.2f} Gold. {clean_msg}".strip()

        # 1. Dual-Write: Always update SQLite first with atomic balance deduction
        try:
            with self.write_transaction() as (conn, cur):
                min_req_cents = amount_cents + (2000 if active_loans else 0)
                cur.execute("""
                    UPDATE cbm_accounts
                    SET deposited_cents = deposited_cents - ?, updated_at = ?
                    WHERE account_name = ? AND deposited_cents >= ?
                """, (amount_cents, now, acc_key, min_req_cents))

                if cur.rowcount == 0:
                    return False, "Insufficient available balance or protected account buffer constraint.", None

                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (acc_key,))
                new_balance_cents = cur.fetchone()[0]

                cur.execute("""
                    INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                    VALUES (?, 'TREASURY_DONATION', ?, ?, ?, ?, ?)
                """, (acc_key, -amount_cents, new_balance_cents, tx_hash, ledger_notes, now))
                donor_disp = acc.get("display_name") or acc_key
                cur.execute("""
                    INSERT INTO cbm_donations (donor_name, territorial_account, amount_gold, amount_cents, message, source, tx_hash, is_refundable, status, created_at)
                    VALUES (?, ?, ?, ?, ?, 'BALANCE', ?, 0, 'IRREVOCABLE', ?)
                """, (donor_disp, territorial_account or acc_key, round(amount_gold, 2), amount_cents, clean_msg, tx_hash, now))
        except Exception as e:
            return False, f"Donation transaction failed: {e}", None

        # 2. Dual-Write: Mirror to Supabase if active
        if self.use_supabase:
            self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_key}", body={"deposited_cents": new_balance_cents})
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": acc_key,
                "entry_type": "TREASURY_DONATION",
                "amount_cents": -amount_cents,
                "balance_after_cents": new_balance_cents,
                "tx_hash": tx_hash,
                "notes": ledger_notes
            })
            donation_payload = {
                "donor_name": donor_disp,
                "territorial_account": territorial_account or acc_key,
                "amount_gold": round(amount_gold, 2),
                "amount_cents": amount_cents,
                "message": clean_msg,
                "source": "BALANCE",
                "tx_hash": tx_hash,
                "is_refundable": False,
                "status": "IRREVOCABLE"
            }
            self._enqueue_sb_task("cbm_donations", method="POST", body=donation_payload)

        # Recalculate unencumbered reserves (liabilities drop, reserves expand 1:1)
        self.recompute_treasury()

        # Bug B fix: trigger referral qualification check for this donor after the donation completes
        try:
            self.check_and_settle_referral(acc_key)
        except Exception:
            pass

        donation_info = {
            "donor_name": acc.get("display_name") or acc_key,
            "account_name": acc_key,
            "amount_gold": round(amount_gold, 2),
            "amount_cents": amount_cents,
            "message": clean_msg,
            "new_balance_gold": round(new_balance_cents / 100.0, 2),
            "tx_hash": tx_hash,
            "is_refundable": False,
            "status": "IRREVOCABLE",
            "created_at": now
        }
        return True, f"Successfully contributed {amount_gold:.2f} Gold to the Clan War Chest!", donation_info

    def record_direct_donation(
        self,
        donor_name: str,
        territorial_account: str,
        amount_cents: int,
        tx_hash: str,
        message: str = ""
    ) -> Dict[str, Any]:
        """
        Records an unencumbered direct inflow sent straight to the vault.
        Adds directly to vault_total_gold_cents and bank_reserves_cents with ZERO member liabilities.
        Resolves in-game sender IDs to canonical CBM master profiles.
        """
        now = time.time()
        amount_gold = round(amount_cents / 100.0, 2)
        raw_donor = donor_name.strip() if donor_name else ""
        raw_terri = territorial_account.strip() if territorial_account else ""

        # Resolve canonical account identity for the donor
        acc = None
        if raw_donor:
            acc = self._get_account_raw(raw_donor)
        if not acc and raw_terri:
            acc = self._get_account_raw(raw_terri)

        if acc:
            clean_donor = acc.get("display_name") or acc.get("account_name")
            linked_terri = raw_terri or acc.get("primary_territorial_account") or ""
        else:
            clean_donor = raw_donor or raw_terri or "Anonymous Donor"
            linked_terri = raw_terri

        clean_msg = message.strip() if message else "Direct War Chest Transfer"

        # 1. Dual-Write: Always update SQLite first
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_donations (donor_name, territorial_account, amount_gold, amount_cents, message, source, tx_hash, is_refundable, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'DIRECT_TRANSFER', ?, 0, 'IRREVOCABLE', ?)
        """, (clean_donor, linked_terri, amount_gold, amount_cents, clean_msg, tx_hash, now))
        cur.execute("""
            INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
            VALUES ('TREASURY', 'DIRECT_RESERVE_INJECTION', ?, 0, ?, ?, ?)
        """, (amount_cents, tx_hash, f"Direct War Chest contribution from {clean_donor}: {amount_gold} Gold", now))
        conn.commit()
        conn.close()

        # 2. Dual-Write: Mirror to Supabase if active
        if self.use_supabase:
            donation_payload = {
                "donor_name": clean_donor,
                "territorial_account": linked_terri,
                "amount_gold": amount_gold,
                "amount_cents": amount_cents,
                "message": clean_msg,
                "source": "DIRECT_TRANSFER",
                "tx_hash": tx_hash,
                "is_refundable": False,
                "status": "IRREVOCABLE"
            }
            self._enqueue_sb_task("cbm_donations", method="POST", body=donation_payload)
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": "TREASURY",
                "entry_type": "DIRECT_RESERVE_INJECTION",
                "amount_cents": amount_cents,
                "balance_after_cents": 0,
                "tx_hash": tx_hash,
                "notes": f"Direct War Chest contribution from {clean_donor}: {amount_gold} Gold"
            })

        treasury = self.get_treasury()
        curr_vault = treasury.get("vault_total_gold_cents", 0) + amount_cents
        self.update_vault_balance(curr_vault)
        self.recompute_treasury()

        # Bug B fix: if the direct sender maps to a CBM account, check referral qualification
        # (they may have now crossed the donation threshold for their inviter's reward)
        if acc:
            cbm_account_name = acc.get("account_name") or raw_donor
            try:
                self.check_and_settle_referral(cbm_account_name)
            except Exception:
                pass

        return {
            "donor_name": clean_donor,
            "territorial_account": linked_terri,
            "amount_gold": amount_gold,
            "amount_cents": amount_cents,
            "message": clean_msg,
            "tx_hash": tx_hash,
            "created_at": now
        }

    def get_top_donors(self, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            return self._do_get_top_donors(limit=limit)
        except sqlite3.DatabaseError as db_err:
            if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image", "not a database")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                self._init_sqlite()
                if self.use_supabase:
                    try:
                        self.sync_all_from_supabase(quiet=True)
                    except Exception:
                        pass
                try:
                    return self._do_get_top_donors(limit=limit)
                except Exception as retry_err:
                    print(f"[!] Error on retrying get_top_donors: {retry_err}")
            raise

    def _do_get_top_donors(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Returns top donors ranked by total gold contributed to the Clan War Chest.
        Uses high-speed local SQLite aggregation query (<1ms) with full canonical member identity resolution.
        """
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                COALESCE(a.account_name, d.donor_name, d.territorial_account, 'Anonymous') as canonical_account,
                COALESCE(a.display_name, a.account_name, d.donor_name, d.territorial_account, 'Anonymous Donor') as donor_name,
                COALESCE(a.primary_territorial_account, d.territorial_account, '') as territorial_account,
                COALESCE(a.avatar_url, '') as avatar_url,
                SUM(d.amount_cents) as total_cents,
                COUNT(d.id) as donation_count,
                MAX(d.created_at) as last_donation_at,
                MAX(d.message) as last_message
            FROM cbm_donations d
            LEFT JOIN cbm_accounts a ON (
                LOWER(d.donor_name) = LOWER(a.account_name)
                OR LOWER(d.territorial_account) = LOWER(a.account_name)
                OR LOWER(d.territorial_account) = LOWER(a.primary_territorial_account)
            )
            GROUP BY canonical_account
            ORDER BY total_cents DESC
            LIMIT ?
        """, (limit,))
        rows = cur.fetchall()

        donors = []
        for idx, r in enumerate(rows):
            donors.append({
                "rank": idx + 1,
                "donor_name": r["donor_name"],
                "canonical_account": r["canonical_account"],
                "territorial_account": r["territorial_account"],
                "total_gold": round((r["total_cents"] or 0) / 100.0, 2),
                "total_cents": r["total_cents"] or 0,
                "donation_count": r["donation_count"] or 0,
                "last_message": r["last_message"] or "",
                "last_donated_at": r["last_donation_at"],
                "avatar_url": r["avatar_url"] or ""
            })

        if donors:
            return donors

        if self.use_supabase:
            status, res = self._sb_request("cbm_donations", method="GET", params="?select=*")
            if status == 200 and isinstance(res, list) and res:
                donors_map = {}
                for d in res:
                    c_id = d.get("donor_name") or d.get("territorial_account") or "Anonymous"
                    if c_id not in donors_map:
                        donors_map[c_id] = {
                            "donor_name": c_id,
                            "canonical_account": c_id,
                            "territorial_account": d.get("territorial_account", ""),
                            "total_gold": 0.0,
                            "total_cents": 0,
                            "donation_count": 0,
                            "last_message": d.get("message", ""),
                            "last_donated_at": d.get("created_at"),
                            "avatar_url": ""
                        }
                    donors_map[c_id]["total_gold"] += float(d.get("amount_gold", 0))
                    donors_map[c_id]["total_cents"] += int(d.get("amount_cents", 0))
                    donors_map[c_id]["donation_count"] += 1

                try:
                    conn_c = self._get_sqlite_conn()
                    cur_c = conn_c.cursor()
                    for r in res:
                        cur_c.execute("""
                            INSERT OR IGNORE INTO cbm_donations (
                                id, donor_name, territorial_account, amount_gold, amount_cents,
                                message, source, tx_hash, is_refundable, status, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            r.get("id"),
                            r.get("donor_name", "Anonymous"),
                            r.get("territorial_account", ""),
                            float(r.get("amount_gold", 0.0) or 0.0),
                            int(r.get("amount_cents", 0) or 0),
                            r.get("message", ""),
                            r.get("source", "BALANCE"),
                            r.get("tx_hash", ""),
                            1 if r.get("is_refundable") else 0,
                            r.get("status", "IRREVOCABLE"),
                            float(r.get("created_at", time.time()) or time.time())
                        ))
                    conn_c.commit()
                except Exception:
                    pass

                sorted_donors = sorted(donors_map.values(), key=lambda x: x["total_gold"], reverse=True)[:limit]
                for idx, item in enumerate(sorted_donors):
                    item["rank"] = idx + 1
                    item["total_gold"] = round(item["total_gold"], 2)
                return sorted_donors

        return []

    def get_recent_donations(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Returns the most recent contributions made to the Clan War Chest."""
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_donations ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        if rows:
            return rows

        if self.use_supabase:
            status, res = self._sb_request("cbm_donations", method="GET", params=f"?order=created_at.desc&limit={limit}&select=*")
            if status == 200 and isinstance(res, list) and res:
                try:
                    conn = self._get_sqlite_conn()
                    cur = conn.cursor()
                    for r in res:
                        cur.execute("""
                            INSERT OR IGNORE INTO cbm_donations (
                                id, donor_name, territorial_account, amount_gold, amount_cents,
                                message, source, tx_hash, is_refundable, status, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            r.get("id"),
                            r.get("donor_name", "Anonymous"),
                            r.get("territorial_account", ""),
                            float(r.get("amount_gold", 0.0) or 0.0),
                            int(r.get("amount_cents", 0) or 0),
                            r.get("message", ""),
                            r.get("source", "BALANCE"),
                            r.get("tx_hash", ""),
                            1 if r.get("is_refundable") else 0,
                            r.get("status", "IRREVOCABLE"),
                            float(r.get("created_at", time.time()) or time.time())
                        ))
                    conn.commit()
                except Exception as cache_err:
                    print(f"[!] Error caching donations to SQLite: {cache_err}")
                return res

        return []

    # --- Model 3: Web-Declared In-Game Donation Slips ---
    def create_pending_donation(
        self,
        account_name: str,
        amount_gold: float,
        message: str = "",
        ttl_minutes: int = 15
    ) -> Dict[str, Any]:
        """Creates a 15-minute web intent donation slip for an incoming in-game transfer."""
        import uuid
        now = time.time()
        expires_at = now + (ttl_minutes * 60)
        amount_cents = int(round(amount_gold * 100))
        slip_id = f"slip_{uuid.uuid4().hex[:12]}"
        clean_msg = message.strip()
        raw_acc = account_name.strip()

        # Canonical resolution: map in-game account ID or display name to canonical CBM master username
        canonical_acc = self._get_account_raw(raw_acc)
        canonical_name = canonical_acc.get("account_name") if canonical_acc else raw_acc

        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_pending_donations (id, account_name, amount_cents, amount_gold, message, status, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
        """, (slip_id, canonical_name, amount_cents, round(amount_gold, 2), clean_msg, now, expires_at))
        conn.commit()
        conn.close()

        if self.use_supabase:
            payload = {
                "id": slip_id,
                "account_name": canonical_name,
                "amount_cents": amount_cents,
                "amount_gold": round(amount_gold, 2),
                "message": clean_msg,
                "status": "PENDING",
                "expires_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at))
            }
            self._enqueue_sb_task("cbm_pending_donations", method="POST", body=payload)

        return {
            "id": slip_id,
            "account_name": canonical_name,
            "amount_cents": amount_cents,
            "amount_gold": round(amount_gold, 2),
            "message": clean_msg,
            "status": "PENDING",
            "created_at": now,
            "expires_at": expires_at,
            "remaining_seconds": max(0, int(expires_at - now))
        }

    def get_pending_donations(self, account_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves active unexpired donation slips."""
        now = time.time()
        conn = self.get_write_connection()
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        if account_name:
            acc_clean = account_name.strip()
            linked = self.get_payment_methods(acc_clean)
            candidate_names = [acc_clean] + [m.get("territorial_account_name") for m in linked if m.get("territorial_account_name")]
            # Also check if acc_clean is a territorial account that belongs to a cbm user
            owner = self.get_cbm_username_by_territorial_account(acc_clean)
            if owner and owner not in candidate_names:
                candidate_names.append(owner)
            owner_acc = self._get_account_raw(acc_clean)
            if owner_acc:
                c_name = owner_acc.get("account_name")
                if c_name and c_name not in candidate_names:
                    candidate_names.append(c_name)
            placeholders = ",".join("?" for _ in candidate_names)
            cur.execute(f"""
                SELECT * FROM cbm_pending_donations 
                WHERE account_name IN ({placeholders}) AND status = 'PENDING' AND expires_at > ?
                ORDER BY created_at DESC
            """, (*candidate_names, now))
        else:
            cur.execute("""
                SELECT * FROM cbm_pending_donations 
                WHERE status = 'PENDING' AND expires_at > ?
                ORDER BY created_at DESC
            """, (now,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        for r in rows:
            r["remaining_seconds"] = max(0, int(r.get("expires_at", 0) - now))
        return rows


    def find_and_claim_pending_donation(self, sender_account: str, amount_cents: int, tx_id: str) -> Optional[Dict[str, Any]]:
        """
        Model 3 In-Game Donation Matching (hardened):
        - Expands candidates to ALL linked territorial.io payment methods, not just primary.
        - Matches by sender identity with COLLATE NOCASE (case-insensitive IN clause handled via LOWER()).
        - Tolerant amount matching: picks the nearest pending slip by ABS(amount_cents - ?),
          falling back gracefully when no exact match exists.
        - Uses BEGIN IMMEDIATE to prevent double-claim race conditions.
        - Books the actual received amount to the War Chest, logs variance if it differs from the slip.
        """
        now = time.time()
        sender_clean = sender_account.strip()

        # Build candidate set: sender as-is, then resolve all identity surfaces
        seen = set()
        candidates = []
        def _add(v):
            if v and v.lower() not in seen:
                seen.add(v.lower())
                candidates.append(v)

        _add(sender_clean)

        # 1. Primary CBM owner via payment_methods table
        owner = self.get_cbm_username_by_territorial_account(sender_clean)
        _add(owner)

        # 2. Direct account lookup by the sender string
        owner_acc = self._get_account_raw(sender_clean)
        if owner_acc:
            _add(owner_acc.get("account_name"))
            _add(owner_acc.get("display_name"))
            _add(owner_acc.get("primary_territorial_account"))
            # 3. Expand ALL linked alts (Fix 3: previously only primary_territorial_account was checked)
            linked_methods = self.get_payment_methods(owner_acc.get("account_name") or sender_clean)
            for pm in linked_methods:
                _add(pm.get("territorial_account_name"))
        elif owner:
            # Owner resolved but not directly in cbm_accounts — expand owner's alts
            linked_methods = self.get_payment_methods(owner)
            for pm in linked_methods:
                _add(pm.get("territorial_account_name"))

        if not candidates:
            return None

        try:
            with self.write_transaction() as (conn, cur):
                conn.row_factory = sqlite3.Row
                lower_candidates = [c.lower() for c in candidates]
                placeholders = ",".join("?" for _ in lower_candidates)

                cur.execute(f"""
                    SELECT * FROM cbm_pending_donations
                    WHERE LOWER(account_name) IN ({placeholders})
                      AND status = 'PENDING'
                      AND expires_at >= ?
                    ORDER BY ABS(amount_cents - ?) ASC, created_at ASC
                    LIMIT 1
                """, (*lower_candidates, now, amount_cents))
                row = cur.fetchone()
                if not row:
                    return None

                slip = dict(row)
                slip_id = slip["id"]
                slip_amount = slip["amount_cents"]
                variance_cents = amount_cents - slip_amount

                cur.execute(
                    "UPDATE cbm_pending_donations SET status = 'FULFILLED', tx_hash = ? WHERE id = ? AND status = 'PENDING'",
                    (tx_id, slip_id)
                )
                if cur.rowcount == 0:
                    return None

            if variance_cents != 0:
                print(
                    f"[CBM Slip] VARIANCE on slip {slip_id}: declared {slip_amount/100:.2f}G, "
                    f"received {amount_cents/100:.2f}G, delta {variance_cents/100:+.2f}G. "
                    f"Booking actual received amount to War Chest."
                )
            slip["actual_amount_cents"] = amount_cents
            slip["variance_cents"] = variance_cents

            if self.use_supabase:
                self._enqueue_sb_task(
                    "cbm_pending_donations",
                    method="PATCH",
                    params=f"?id=eq.{slip_id}",
                    body={"status": "FULFILLED", "tx_hash": tx_id}
                )
            return slip
        except Exception as e:
            print(f"[!] find_and_claim_pending_donation error: {e}")
            return None

    def get_donation_slip_by_id(self, slip_id: str) -> Optional[Dict[str, Any]]:
        """Returns a single donation slip row by its ID, regardless of status. Used by the slip-status polling endpoint."""
        if not slip_id:
            return None
        conn = self._get_sqlite_conn()
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_pending_donations WHERE id = ?", (slip_id.strip(),))
        row = cur.fetchone()
        if not row:
            return None
        slip = dict(row)
        now = time.time()
        slip["remaining_seconds"] = max(0, int(slip.get("expires_at", 0) - now))
        return slip

    def record_vault_snapshot(
        self,
        vault_total_gold: float,
        unencumbered_reserves_gold: float,
        member_liabilities_gold: float,
        inflow_gold: float = 0.0,
        outflow_gold: float = 0.0,
        tx_count: int = 0,
        snapshot_time: Optional[float] = None,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Records a point-in-time vault balance and liquidity snapshot for the 7-day timeline telemetry.
        Throttled to at most once per 60 seconds unless force=True.
        """
        now = time.time() if snapshot_time is None else snapshot_time
        if not force and (now - self._last_snapshot_at) < 60.0:
            return {"status": "skipped", "message": "Snapshot throttled"}

        self._last_snapshot_at = now
        net_flow = inflow_gold - outflow_gold

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_vault_snapshots (
                timestamp_epoch, vault_total_gold, unencumbered_reserves_gold,
                member_liabilities_gold, inflow_period_gold, outflow_period_gold,
                net_flow_gold, tx_count_period, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            now, vault_total_gold, unencumbered_reserves_gold,
            member_liabilities_gold, inflow_gold, outflow_gold,
            net_flow, tx_count, time.time()
        ))
        conn.commit()

        if self.use_supabase:
            payload = {
                "timestamp_epoch": now,
                "vault_total_gold": vault_total_gold,
                "unencumbered_reserves_gold": unencumbered_reserves_gold,
                "member_liabilities_gold": member_liabilities_gold,
                "inflow_period_gold": inflow_gold,
                "outflow_period_gold": outflow_gold,
                "net_flow_gold": net_flow,
                "tx_count_period": tx_count
            }
            self._enqueue_sb_task("cbm_vault_snapshots", method="POST", body=payload)

        return {"status": "ok", "snapshot_at": now}

    def get_vault_timeline(self, days: int = 7, bucket_hours: Optional[int] = None) -> Dict[str, Any]:
        """
        Constructs a high-resolution time-series timeline of vault balance, unencumbered reserves,
        and cash inflow/outflow dynamics over the requested period.
        Protected by runtime SQLite database corruption self-healing.
        """
        try:
            return self._do_get_vault_timeline(days=days, bucket_hours=bucket_hours)
        except sqlite3.DatabaseError as db_err:
            if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image", "not a database")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                self._init_sqlite()
                if self.use_supabase:
                    try:
                        self.sync_all_from_supabase(quiet=True)
                    except Exception:
                        pass
                try:
                    return self._do_get_vault_timeline(days=days, bucket_hours=bucket_hours)
                except Exception as retry_err:
                    print(f"[!] Error on retrying get_vault_timeline after recovery: {retry_err}")
            raise

    def _do_get_vault_timeline(self, days: int = 7, bucket_hours: Optional[int] = None) -> Dict[str, Any]:
        """
        Internal implementation of get_vault_timeline.
        """
        days = max(1, min(30, int(days)))
        now = time.time()
        start_ts = now - (days * 86400.0)

        # Determine bucket resolution dynamically if not specified
        if not bucket_hours or bucket_hours <= 0:
            if days <= 1:
                bucket_hours = 1   # 24 1-hour buckets for 24h
            elif days <= 3:
                bucket_hours = 2   # 36 2-hour buckets for 3d
            else:
                bucket_hours = 4   # 42 4-hour buckets for 7d

        bucket_seconds = bucket_hours * 3600.0
        num_buckets = max(1, int((now - start_ts) // bucket_seconds) + 1)

        # 1. Fetch current live treasury state
        treasury = self.get_treasury()
        curr_vault_gold = treasury.get("vault_total_gold_cents", 0) / 100.0
        curr_liabilities_gold = treasury.get("member_liabilities_cents", 0) / 100.0
        metrics = self._calculate_treasury_metrics(treasury.get("vault_total_gold_cents", 0))
        curr_reserves_gold = metrics.get("bank_reserves_gold", 0.0)

        # 2. Query transactions and snapshots within period
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()

        # Inflows from cbm_processed_txs (timestamp_ms in epoch ms)
        start_ms = int(start_ts * 1000)
        cur.execute("""
            SELECT timestamp_ms, amount_gold, fee_gold, sender, receiver
            FROM cbm_processed_txs
            WHERE timestamp_ms >= ?
            ORDER BY timestamp_ms ASC
        """, (start_ms,))
        inflow_rows = cur.fetchall()

        # Outflows from cbm_withdrawals (created_at or executed_at in epoch s)
        cur.execute("""
            SELECT created_at, amount_gold, status
            FROM cbm_withdrawals
            WHERE created_at >= ? AND status = 'EXECUTED'
            ORDER BY created_at ASC
        """, (start_ts,))
        outflow_rows = cur.fetchall()

        # Recorded high-resolution snapshots if available
        cur.execute("""
            SELECT timestamp_epoch, vault_total_gold, unencumbered_reserves_gold,
                   member_liabilities_gold, net_flow_gold
            FROM cbm_vault_snapshots
            WHERE timestamp_epoch >= ?
            ORDER BY timestamp_epoch ASC
        """, (start_ts,))
        snapshot_rows = cur.fetchall()

        # 3. Bucket aggregation
        buckets = []
        total_inflow = 0.0
        total_outflow = 0.0
        total_tx_count = 0

        # Create time slice intervals
        for i in range(num_buckets):
            b_start = start_ts + (i * bucket_seconds)
            b_end = min(now, b_start + bucket_seconds)
            b_center = (b_start + b_end) / 2.0
            buckets.append({
                "start": b_start,
                "end": b_end,
                "center": b_center,
                "inflow": 0.0,
                "outflow": 0.0,
                "tx_count": 0,
                "snapshot_vault": None,
                "snapshot_reserves": None
            })

        # Distribute inflows
        for r in inflow_rows:
            try:
                tx_time_s = float(r["timestamp_ms"] or 0.0) / 1000.0
            except (ValueError, TypeError):
                tx_time_s = 0.0
            try:
                amt = float(r["amount_gold"] or 0.0)
            except (ValueError, TypeError):
                amt = 0.0
            total_inflow += amt
            total_tx_count += 1
            idx = int((tx_time_s - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                buckets[idx]["inflow"] += amt
                buckets[idx]["tx_count"] += 1

        # Distribute outflows
        for r in outflow_rows:
            try:
                tx_time_s = float(r["created_at"] or 0.0)
            except (ValueError, TypeError):
                tx_time_s = 0.0
            try:
                amt = float(r["amount_gold"] or 0.0)
            except (ValueError, TypeError):
                amt = 0.0
            total_outflow += amt
            total_tx_count += 1
            idx = int((tx_time_s - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                buckets[idx]["outflow"] += amt
                buckets[idx]["tx_count"] += 1

        # Associate any matching snapshots
        for s in snapshot_rows:
            try:
                s_time = float(s["timestamp_epoch"] or 0.0)
            except (ValueError, TypeError):
                s_time = 0.0
            idx = int((s_time - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                try:
                    buckets[idx]["snapshot_vault"] = float(s["vault_total_gold"] or 0.0)
                except (ValueError, TypeError):
                    buckets[idx]["snapshot_vault"] = 0.0
                try:
                    buckets[idx]["snapshot_reserves"] = float(s["unencumbered_reserves_gold"] or 0.0)
                except (ValueError, TypeError):
                    buckets[idx]["snapshot_reserves"] = 0.0

        # 4. Step backwards to reconstruct historical balance trajectory accurately
        # Ending balance at bucket[-1] is curr_vault_gold
        timeline = []
        running_vault = curr_vault_gold
        running_reserves = curr_reserves_gold

        reversed_points = []
        for b in reversed(buckets):
            net = b["inflow"] - b["outflow"]
            point_vault = b["snapshot_vault"] if b["snapshot_vault"] is not None else running_vault
            point_reserves = b["snapshot_reserves"] if b["snapshot_reserves"] is not None else max(0.0, running_reserves)

            point_vault = round(max(0.0, point_vault), 2)
            point_reserves = round(max(0.0, point_reserves), 2)

            point_liab = round(max(0.0, point_vault - point_reserves), 2)

            reversed_points.append({
                "timestamp": int(b["center"] * 1000),
                "timestamp_epoch": int(b["center"]),
                "date_str": time.strftime("%b %d, %H:%M", time.gmtime(b["center"])),
                "day_str": time.strftime("%a %d", time.gmtime(b["center"])),
                "vault_total_gold": point_vault,
                "vault_gold": point_vault,
                "member_liabilities_gold": point_liab,
                "bank_reserves_gold": point_reserves,
                "unencumbered_reserves_gold": point_reserves,
                "reserves_gold": point_reserves,
                "war_chest_gold": point_reserves,
                "inflow_gold": round(b["inflow"], 2),
                "outflow_gold": round(b["outflow"], 2),
                "net_flow_gold": round(net, 2),
                "tx_count": b["tx_count"]
            })

            # Step back for preceding bucket
            running_vault = max(0.0, running_vault - net)
            res_ratio = (curr_reserves_gold / curr_vault_gold) if curr_vault_gold > 0 else 0.5
            running_reserves = max(0.0, running_vault * res_ratio)

        timeline = list(reversed(reversed_points))

        # 5. Compute summary metrics & velocity
        vault_points = [p["vault_total_gold"] for p in timeline]
        peak_gold = max(vault_points) if vault_points else curr_vault_gold
        trough_gold = min(vault_points) if vault_points else curr_vault_gold
        net_flow_period = total_inflow - total_outflow

        # 24-hour velocity (% change)
        velocity_24h = 0.0
        if len(timeline) >= 6:
            idx_24h = max(0, len(timeline) - int(86400 // bucket_seconds))
            bal_24h_ago = timeline[idx_24h]["vault_total_gold"]
            if bal_24h_ago > 0:
                velocity_24h = round(((curr_vault_gold - bal_24h_ago) / bal_24h_ago) * 100.0, 2)

        reserve_ratio = round((curr_reserves_gold / curr_vault_gold * 100.0), 2) if curr_vault_gold > 0 else 0.0

        # 6. Fetch recent snapshots for the Recent Telemetry Checkpoints table
        cur.execute("""
            SELECT id, timestamp_epoch, vault_total_gold, unencumbered_reserves_gold,
                   member_liabilities_gold, inflow_period_gold, outflow_period_gold,
                   net_flow_gold, tx_count_period, created_at
            FROM cbm_vault_snapshots
            ORDER BY timestamp_epoch DESC
            LIMIT 20
        """)
        raw_snaps = cur.fetchall()
        snapshots = []
        for s in raw_snaps:
            ts_epoch = float(s["timestamp_epoch"] or 0.0)
            v_gold = float(s["vault_total_gold"] or 0.0)
            r_gold = float(s["unencumbered_reserves_gold"] or 0.0)
            l_gold = float(s["member_liabilities_gold"] or 0.0)
            solv = round((r_gold / v_gold * 100.0), 1) if v_gold > 0 else 100.0
            snapshots.append({
                "id": s["id"],
                "timestamp": int(ts_epoch * 1000),
                "timestamp_epoch": ts_epoch,
                "created_at": s["created_at"],
                "date_str": time.strftime("%b %d, %H:%M:%S", time.gmtime(ts_epoch)),
                "vault_total_gold": round(v_gold, 2),
                "vault_gold": round(v_gold, 2),
                "member_liabilities_gold": round(l_gold, 2),
                "unencumbered_reserves_gold": round(r_gold, 2),
                "bank_reserves_gold": round(r_gold, 2),
                "reserves_gold": round(r_gold, 2),
                "solvency_ratio_percent": solv,
                "audit_source": "DAEMON_TELEMETRY"
            })

        if not snapshots:
            solv = round((curr_reserves_gold / curr_vault_gold * 100.0), 1) if curr_vault_gold > 0 else 100.0
            snapshots.append({
                "id": 1,
                "timestamp": int(now * 1000),
                "timestamp_epoch": now,
                "created_at": now,
                "date_str": time.strftime("%b %d, %H:%M:%S", time.gmtime(now)),
                "vault_total_gold": round(curr_vault_gold, 2),
                "vault_gold": round(curr_vault_gold, 2),
                "member_liabilities_gold": round(curr_liabilities_gold, 2),
                "unencumbered_reserves_gold": round(curr_reserves_gold, 2),
                "bank_reserves_gold": round(curr_reserves_gold, 2),
                "reserves_gold": round(curr_reserves_gold, 2),
                "solvency_ratio_percent": solv,
                "audit_source": "LIVE_TELEMETRY"
            })

        return {
            "status": "ok",
            "range_days": days,
            "bucket_hours": bucket_hours,
            "metrics": {
                "current_vault_gold": round(curr_vault_gold, 2),
                "current_reserves_gold": round(curr_reserves_gold, 2),
                "current_liabilities_gold": round(curr_liabilities_gold, 2),
                "reserve_ratio_percent": reserve_ratio,
                "period_inflow_gold": round(total_inflow, 2),
                "period_outflow_gold": round(total_outflow, 2),
                "period_net_flow_gold": round(net_flow_period, 2),
                "peak_vault_gold": round(peak_gold, 2),
                "trough_vault_gold": round(trough_gold, 2),
                "period_tx_count": total_tx_count,
                "velocity_24h_percent": velocity_24h
            },
            "timeline": timeline,
            "snapshots": snapshots
        }

    # =========================================================================
    # --- Developer Platform: API Keys & Credit Billing Engine ---
    # =========================================================================

    def create_api_key(
        self,
        owner_account: str,
        app_name: str,
        environment: str = "live",
        scopes: str = "read:bank,read:members",
        rate_limit_rpm: int = 60
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Issues a new scoped API key for developer and Discord bot integrations.
        Returns the plaintext secret token ONCE at creation.
        """
        acc = self.get_account(owner_account)
        if not acc:
            return False, "API key owner account does not exist.", {}

        env = environment.lower().strip()
        if env not in ("live", "test"):
            env = "live"

        clean_app = app_name.strip() or "CBM App"
        clean_scopes = ",".join(s.strip() for s in scopes.split(",") if s.strip()) or "read:bank,read:members"
        rpm = max(10, min(600, int(rate_limit_rpm)))

        key_id = f"key_{secrets.token_hex(6)}"
        secret_token = f"cbm_test_{secrets.token_hex(20)}" if env == "test" else f"cbm_live_{secrets.token_hex(20)}"
        key_prefix = f"{secret_token[:13]}...{secret_token[-4:]}"
        key_hash = hashlib.sha256(secret_token.encode("utf-8")).hexdigest()
        now = time.time()

        conn = self.get_write_connection(timeout=15.0)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_api_keys (
                key_id, key_hash, key_prefix, app_name, owner_account,
                environment, scopes, rate_limit_rpm, total_requests,
                credits_consumed_gold, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.0, 1, ?)
        """, (key_id, key_hash, key_prefix, clean_app, owner_account, env, clean_scopes, rpm, now))
        conn.commit()
        conn.close()

        key_record = {
            "key_id": key_id,
            "key_prefix": key_prefix,
            "app_name": clean_app,
            "owner_account": owner_account,
            "environment": env,
            "scopes": clean_scopes,
            "rate_limit_rpm": rpm,
            "total_requests": 0,
            "credits_consumed_gold": 0.0,
            "is_active": 1,
            "created_at": now
        }

        if self.use_supabase:
            self._enqueue_sb_task("cbm_api_keys", method="POST", body={
                "key_id": key_id,
                "key_hash": key_hash,
                "key_prefix": key_prefix,
                "app_name": clean_app,
                "owner_account": owner_account,
                "environment": env,
                "scopes": clean_scopes,
                "rate_limit_rpm": rpm,
                "total_requests": 0,
                "credits_consumed_gold": 0.0,
                "is_active": True
            })

        return True, secret_token, key_record

    def verify_api_key(self, raw_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validates an incoming Bearer API key or X-CBM-API-Key token.
        Returns (is_valid, key_record).
        """
        if not raw_token or not isinstance(raw_token, str):
            return False, {}

        token = raw_token.strip()
        if not token.startswith("cbm_live_") and not token.startswith("cbm_test_"):
            return False, {}

        key_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

        conn = self.get_write_connection(timeout=15.0)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_api_keys WHERE key_hash = ? AND is_active = 1", (key_hash,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return False, {}

        key_dict = dict(row)
        # Check owner status
        acc = self.get_account(key_dict["owner_account"])
        if not acc:
            return False, {"error": "API Key owner account not found."}

        role = acc.get("role", "member")
        if role in ("restricted", "frozen", "delinquent"):
            return False, {"error": "API Key suspended: Account access is currently restricted."}

        key_dict["owner_balance_cents"] = acc.get("deposited_cents", 0)
        key_dict["owner_balance_gold"] = round(acc.get("deposited_cents", 0) / 100.0, 2)
        return True, key_dict

    def list_api_keys(self, owner_account: str) -> List[Dict[str, Any]]:
        """
        Returns all active and revoked API keys owned by a specific member.
        Redacts the key_hash for absolute security.
        """
        conn = self.get_write_connection(timeout=15.0)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("""
            SELECT id, key_id, key_prefix, app_name, owner_account,
                   environment, scopes, rate_limit_rpm, total_requests,
                   credits_consumed_gold, is_active, created_at, last_used_at
            FROM cbm_api_keys
            WHERE owner_account = ?
            ORDER BY created_at DESC
        """, (owner_account,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    def revoke_api_key(self, key_id: str, owner_account: str) -> Tuple[bool, str]:
        """Deactivates an API key owned by the specified member."""
        conn = self.get_write_connection(timeout=15.0)
        cur = conn.cursor()
        cur.execute("""
            UPDATE cbm_api_keys
            SET is_active = 0
            WHERE key_id = ? AND owner_account = ?
        """, (key_id, owner_account))
        affected = cur.rowcount
        conn.commit()
        conn.close()

        if affected > 0:
            if self.use_supabase:
                self._enqueue_sb_task(
                    "cbm_api_keys",
                    method="PATCH",
                    params=f"?key_id=eq.{key_id}&owner_account=eq.{owner_account}",
                    body={"is_active": False}
                )
            return True, f"API Key '{key_id}' successfully revoked."
        return False, f"API Key '{key_id}' not found or not owned by '{owner_account}'."

    def charge_api_credit(
        self,
        owner_account: str,
        key_id: Optional[str] = None,
        cost_gold: float = 1.0,
        idempotency_key: Optional[str] = None,
        endpoint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Atomically charges an account owner for an API request against their deposited Gold balance,
        and converts the deducted credit into permanent unencumbered central bank reserves.
        Supports idempotency to prevent double-charging on network retries.
        Supports keyless requests (e.g. session-authenticated web developer console).
        """
        cost_cents = int(round(cost_gold * 100))
        if cost_cents <= 0:
            return False, "Credit deduction amount must be greater than zero.", {}

        acc = self.get_account(owner_account)
        if not acc:
            return False, "API Key owner account not found.", {}

        available_cents = acc.get("deposited_cents", 0)
        if available_cents < cost_cents:
            return False, (
                f"Insufficient API Credits: {available_cents / 100.0:.2f} Gold available, "
                f"{cost_gold:.2f} Gold required per successful request."
            ), {"credits_remaining": available_cents / 100.0, "credits_cost": cost_gold}

        now = time.time()
        if idempotency_key:
            clean_idem = re.sub(r'[^a-zA-Z0-9_\-]', '', str(idempotency_key))[:48]
            tx_hash = f"api_idem_{key_id or 'direct'}_{clean_idem}"
        else:
            tx_hash = f"api_{key_id or 'direct'}_{int(now)}_{secrets.token_hex(3)}"

        ep_tag = f" [{endpoint}]" if endpoint else ""
        ledger_note = f"API Call ({key_id or 'direct'}){ep_tag}: {cost_gold:.2f} Credit converted to unencumbered Clan Reserves"
        if metadata:
            try:
                ledger_note += f" | {json.dumps(metadata)}"
            except Exception:
                pass

        # Atomic write transaction via global write coordinator
        with self.write_transaction() as (conn, cur):
            # 1. Idempotency Check
            if idempotency_key:
                cur.execute("""
                    SELECT balance_after_cents, tx_hash FROM cbm_ledger
                    WHERE account_name = ? AND tx_hash = ?
                """, (owner_account, tx_hash))
                existing = cur.fetchone()
                if existing:
                    return True, "Idempotent transaction already executed.", {
                        "credits_cost": 0.0,
                        "credits_remaining": round(existing[0] / 100.0, 2),
                        "tx_hash": existing[1],
                        "is_idempotent_replay": True
                    }

            # 2. Check and decrement balance
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = deposited_cents - ?, updated_at = ?
                WHERE account_name = ? AND deposited_cents >= ?
            """, (cost_cents, now, owner_account, cost_cents))

            if cur.rowcount == 0:
                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (owner_account,))
                row = cur.fetchone()
                avail = (row[0] / 100.0) if row else 0.0
                return False, f"Insufficient API credits. Required: {cost_gold:.2f}, Available: {avail:.2f}", {
                    "credits_remaining": avail,
                    "credits_cost": cost_gold
                }

            cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (owner_account,))
            new_balance = cur.fetchone()[0]

            # 3. Append to Ledger
            cur.execute("""
                INSERT INTO cbm_ledger (
                    account_name, entry_type, amount_cents, balance_after_cents,
                    tx_hash, notes, created_at
                ) VALUES (?, 'API_CONSUMPTION', ?, ?, ?, ?, ?)
            """, (owner_account, -cost_cents, new_balance, tx_hash, ledger_note, now))

            # 4. Update key metrics if key_id is present
            if key_id:
                cur.execute("""
                    UPDATE cbm_api_keys
                    SET credits_consumed_gold = credits_consumed_gold + ?,
                        total_requests = total_requests + 1,
                        last_used_at = ?
                    WHERE key_id = ?
                """, (cost_gold, now, key_id))

        if self.use_supabase:
            self._enqueue_sb_task(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{owner_account}",
                body={"deposited_cents": new_balance}
            )
            self._enqueue_sb_task(
                "cbm_ledger",
                method="POST",
                body={
                    "account_name": owner_account,
                    "entry_type": "API_CONSUMPTION",
                    "amount_cents": -cost_cents,
                    "balance_after_cents": new_balance,
                    "tx_hash": tx_hash,
                    "notes": ledger_note
                }
            )

        # Recalculate central bank solvency:
        # Since member liabilities decreased, unencumbered bank reserves increase 1:1!
        self.recompute_treasury()

        return True, "Credit charged and converted to reserves successfully.", {
            "credits_cost": cost_gold,
            "credits_remaining": round(new_balance / 100.0, 2),
            "tx_hash": tx_hash
        }

    def refund_api_credit(
        self,
        owner_account: str,
        cost_gold: float,
        key_id: Optional[str] = None,
        reason: str = "WORKLOAD_FAILED",
        original_tx_hash: Optional[str] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Atomically refunds an API credit deduction back to member deposit balance if downstream workload failed.
        Rebalances central bank reserves and updates audit trail in cbm_ledger.
        """
        cost_cents = int(round(cost_gold * 100))
        if cost_cents <= 0:
            return False, "Refund amount must be positive.", {}

        now = time.time()
        refund_tx_hash = f"api_refund_{key_id or 'direct'}_{int(now)}_{secrets.token_hex(3)}"
        orig_tag = f" [orig: {original_tx_hash}]" if original_tx_hash else ""
        notes = f"API Refund ({key_id or 'direct'}): {cost_gold:.2f} Credit refunded to deposit ({reason}){orig_tag}"

        with self.write_transaction() as (conn, cur):
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = deposited_cents + ?, updated_at = ?
                WHERE account_name = ?
            """, (cost_cents, now, owner_account))

            if cur.rowcount == 0:
                return False, "Account not found for refund.", {}

            cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (owner_account,))
            new_balance = cur.fetchone()[0]

            cur.execute("""
                INSERT INTO cbm_ledger (
                    account_name, entry_type, amount_cents, balance_after_cents,
                    tx_hash, notes, created_at
                ) VALUES (?, 'API_REFUND', ?, ?, ?, ?, ?)
            """, (owner_account, cost_cents, new_balance, refund_tx_hash, notes, now))

            if key_id:
                cur.execute("""
                    UPDATE cbm_api_keys
                    SET credits_consumed_gold = MAX(0.0, credits_consumed_gold - ?),
                        total_requests = MAX(0, total_requests - 1)
                    WHERE key_id = ?
                """, (cost_gold, key_id))

        if self.use_supabase:
            self._enqueue_sb_task(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{owner_account}",
                body={"deposited_cents": new_balance}
            )
            self._enqueue_sb_task(
                "cbm_ledger",
                method="POST",
                body={
                    "account_name": owner_account,
                    "entry_type": "API_REFUND",
                    "amount_cents": cost_cents,
                    "balance_after_cents": new_balance,
                    "tx_hash": refund_tx_hash,
                    "notes": notes
                }
            )

        # Recompute treasury metrics to account for restored liabilities
        self.recompute_treasury()

        return True, "Credit refunded and reserves adjusted successfully.", {
            "credits_refunded": cost_gold,
            "credits_remaining": round(new_balance / 100.0, 2),
            "tx_hash": refund_tx_hash
        }

    def get_api_ledger_history(self, account_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves chronological API consumption and refund transactions for an account from cbm_ledger."""
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT id, account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at
            FROM cbm_ledger
            WHERE account_name = ? AND entry_type IN ('API_CONSUMPTION', 'API_REFUND')
            ORDER BY created_at DESC, id DESC
            LIMIT ?
        """, (account_name, limit))
        rows = [dict(r) for r in cur.fetchall()]
        for r in rows:
            r["amount_gold"] = round(r["amount_cents"] / 100.0, 2)
            r["balance_after_gold"] = round(r["balance_after_cents"] / 100.0, 2)
        return rows

    def get_developer_overview(self, owner_account: str) -> Dict[str, Any]:
        """Returns API credit balance, key count, and aggregate consumption metrics for Developer Console."""
        acc = self.get_account(owner_account)
        if not acc:
            return {
                "owner_account": owner_account,
                "api_credits": 0.0,
                "credits_display": "0.00 Credits",
                "gold_balance": 0.0,
                "active_keys_count": 0,
                "total_requests": 0,
                "total_credits_consumed": 0.0
            }

        keys = self.list_api_keys(owner_account)
        active_keys = [k for k in keys if k.get("is_active")]
        total_requests = sum(k.get("total_requests", 0) for k in keys)
        total_consumed = sum(k.get("credits_consumed_gold", 0.0) for k in keys)

        balance_gold = round(acc.get("deposited_cents", 0) / 100.0, 2)
        is_leader = (
            owner_account.lower() in ("b8bbq", "[anti-og] leader") or
            (acc.get("account_name") or "").lower() == "b8bbq" or
            "[anti-og] leader" in (acc.get("display_name") or "").lower() or
            (acc.get("primary_territorial_account") or "").lower() == "b8bbq"
        )
        cost_gold = 0.01 if is_leader else 1.00
        rate_note = (
            "Special Leader Rate: 1 API Request = 0.01 Credit (0.01 Gold) -> Converted to Unencumbered Clan Reserves"
            if is_leader else
            "1 API Request = 1.00 Credit (1.00 Gold) -> Converted to Unencumbered Clan Reserves"
        )
        return {
            "owner_account": owner_account,
            "api_credits": balance_gold,
            "credits_display": f"{balance_gold:,.2f} Credits",
            "gold_balance": balance_gold,
            "active_keys_count": len(active_keys),
            "total_keys_count": len(keys),
            "total_requests": total_requests,
            "total_credits_consumed": round(total_consumed, 2),
            "cost_per_request_gold": cost_gold,
            "is_leader_tier": is_leader,
            "rate_conversion_note": rate_note
        }

    # -------------------------------------------------------------------------
    # ADMIN ELECTION CAMPAIGN & VOTE REWARD ENGINE
    # 1:1 Reimbursement funded from Unencumbered Reserves (Max 15% Budget Cap)
    # -------------------------------------------------------------------------
    def get_admin_election_summary(self) -> Dict[str, Any]:
        """
        Returns real-time telemetry on the Admin Election campaign for vault DdcBC:
        - Current unencumbered reserves and 15% budget cap
        - Total votes sponsored by members
        - Total rewards disbursed from reserves
        - Remaining campaign budget
        - Top election backers
        """
        treasury = self.get_treasury()
        reserves_cents = int(treasury.get("bank_reserves_cents", 0))
        reserves_gold = round(reserves_cents / 100.0, 2)

        # 15% Campaign Cap enforced on Unencumbered Reserves
        cap_pct = 15.0
        max_budget_cents = int(round(0.15 * reserves_cents))
        max_budget_gold = round(max_budget_cents / 100.0, 2)

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                COALESCE(SUM(votes_count), 0),
                COALESCE(SUM(reward_cents), 0),
                COUNT(*)
            FROM cbm_admin_votes
            WHERE status = 'REWARDED'
        """)
        row = cur.fetchone()
        total_votes = row[0] if row else 0
        total_rewarded_cents = row[1] if row else 0
        total_rewarded_gold = round(total_rewarded_cents / 100.0, 2)

        cur.execute("""
            SELECT 
                COALESCE(SUM(votes_count), 0),
                COALESCE(SUM(reward_cents), 0),
                COUNT(*)
            FROM cbm_admin_votes
            WHERE status IN ('PENDING', 'PENDING_REVIEW')
        """)
        row_p = cur.fetchone()
        pending_votes = row_p[0] if row_p else 0
        pending_reward_cents = row_p[1] if row_p else 0
        pending_reward_gold = round(pending_reward_cents / 100.0, 2)

        # Remaining available budget under 15% cap
        available_budget_cents = max(0, max_budget_cents - (total_rewarded_cents + pending_reward_cents))
        available_budget_gold = round(available_budget_cents / 100.0, 2)

        # Top 10 Election Backers
        cur.execute("""
            SELECT 
                cbm_username,
                voter_account,
                SUM(votes_count) as total_votes,
                SUM(gold_spent) as total_spent,
                SUM(reward_gold) as total_reward
            FROM cbm_admin_votes
            WHERE status = 'REWARDED'
            GROUP BY cbm_username
            ORDER BY total_votes DESC
            LIMIT 10
        """)
        backers = []
        for r in cur.fetchall():
            backers.append({
                "cbm_username": r[0],
                "voter_account": r[1],
                "votes_sponsored": r[2],
                "gold_spent": round(r[3], 2),
                "reward_gold": round(r[4], 2)
            })

        # Recent 10 Disbursements or Submissions
        cur.execute("""
            SELECT claim_id, cbm_username, voter_account, votes_count, reward_gold, status, verified_at, created_at,
                   COALESCE(expires_at, 0.0)
            FROM cbm_admin_votes
            WHERE status IN ('REWARDED', 'PENDING', 'PENDING_REVIEW')
            ORDER BY created_at DESC
            LIMIT 10
        """)
        now = time.time()
        recent_disbursements = []
        for r in cur.fetchall():
            exp = float(r[8]) if r[8] else 0.0
            rem = max(0, int(exp - now)) if exp > now else 0
            recent_disbursements.append({
                "claim_id": r[0],
                "cbm_username": r[1],
                "voter_account": r[2],
                "votes_count": r[3],
                "reward_gold": round(r[4], 2),
                "status": r[5],
                "verified_at": r[6],
                "created_at": r[7],
                "expires_at": exp,
                "remaining_seconds": rem
            })

        target_vault = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")

        return {
            "target_vault_account": target_vault,
            "reward_ratio": "1:1 Reimbursement (1.00 CBM Gold credited per 1.00 Gold spent)",
            "reserve_cap_pct": cap_pct,
            "bank_reserves_gold": reserves_gold,
            "max_campaign_budget_gold": max_budget_gold,
            "total_rewards_disbursed_gold": total_rewarded_gold,
            "pending_rewards_gold": pending_reward_gold,
            "available_budget_gold": available_budget_gold,
            "cap_reached": available_budget_cents <= 0,
            "total_votes_sponsored": total_votes,
            "pending_votes_count": pending_votes,
            "top_backers": backers,
            "recent_disbursements": recent_disbursements
        }

    def submit_admin_vote_claim(
        self,
        cbm_username: str,
        voter_account: str,
        votes_count: int,
        gold_spent: Optional[float] = None,
        auto_settle: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Submits an Admin Election vote reward claim for purchasing votes for vault account DdcBC.
        Enforces:
        1. Strict voter identity binding (voter account must be verified/linked to cbm_username).
        2. Server-side cost calculation (ft Gold buys ft - 1 votes, so N votes strictly costs N + 1.00 Gold).
        3. Atomic write-locked 15% budget cap validation on unencumbered central bank reserves.
        4. Anti-replay and daily volume rate limits per voter account.
        5. Asynchronous audit verification by default.
        """
        acc = self.get_account(cbm_username)
        if not acc:
            return False, f"CBM member account '{cbm_username}' not found.", {}

        if votes_count <= 0:
            return False, "Votes count must be at least 1.", {}

        if votes_count > 5000:
            return False, "Votes count exceeds maximum single claim limit (5,000 votes).", {}

        # 1. Strict Voter Identity Binding
        verified_accounts = [a.strip().upper() for a in self.get_verified_destination_accounts(cbm_username)]
        if voter_account.strip().upper() not in verified_accounts:
            return False, (
                f"Voter account '{voter_account}' is not linked or verified to CBM account '{cbm_username}'. "
                f"Link this account under Clan Bank Payment Methods before submitting vote claims."
            ), {}

        # 2. Server-Side Cost Calculation: Eliminate client parameter tampering
        # In Territorial.io, purchasing N votes strictly costs N + 1.00 Gold (1.00 base fee + 1.00/vote).
        calculated_gold_spent = round(float(votes_count + 1), 2)
        reward_gold = calculated_gold_spent
        reward_cents = int(round(reward_gold * 100))

        target_vault = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
        now = time.time()
        claim_id = f"av_{voter_account.lower().strip()}_{votes_count}_{int(now)}"

        # Telemetry baseline for candidate points (retrieved before acquiring DB write lock)
        baseline_points = 0
        try:
            from election_worker import get_election_worker
            ew = get_election_worker(db=self)
            t = ew.get_vault_election_telemetry()
            baseline_points = int(t.get("admin_points") or 0)
        except Exception:
            pass

        # 3. Atomic Write Lock: Budget Cap & Anti-Abuse Verification
        try:
            with self.write_transaction() as (conn, cur):
                # Auto-expire outdated pending slips for this voter
                cur.execute("""
                    UPDATE cbm_admin_votes
                    SET status = 'EXPIRED', rejection_reason = '15-minute verification window expired.'
                    WHERE voter_account = ? COLLATE NOCASE AND status IN ('PENDING', 'PENDING_REVIEW')
                      AND expires_at > 0 AND expires_at < ?
                """, (voter_account.strip(), now))

                # 3a. Disallow multiple unsettled pending claims for the same voter
                cur.execute("""
                    SELECT claim_id FROM cbm_admin_votes
                    WHERE voter_account = ? COLLATE NOCASE AND status IN ('PENDING', 'PENDING_REVIEW')
                """, (voter_account.strip(),))
                active_pending = cur.fetchone()
                if active_pending:
                    return False, f"Voter account '{voter_account}' already has an active pending slip ({active_pending[0]}). Await audit verification before submitting new claims.", {}

                # 3b. Anti-replay: Prevent duplicate identical volume claims within 24 hours
                cur.execute("""
                    SELECT claim_id FROM cbm_admin_votes
                    WHERE voter_account = ? COLLATE NOCASE AND votes_count = ? AND status = 'REWARDED'
                      AND created_at > ?
                """, (voter_account.strip(), votes_count, now - 86400))
                dup = cur.fetchone()
                if dup:
                    return False, f"Duplicate claim detected: identical vote volume ({votes_count} votes) for voter '{voter_account}' was already rewarded within the last 24 hours.", {}

                # 3c. Rate limit: Max 10 claims or 5,000 votes per voter per 24 hours
                cur.execute("""
                    SELECT COUNT(*), COALESCE(SUM(votes_count), 0) FROM cbm_admin_votes
                    WHERE voter_account = ? COLLATE NOCASE AND created_at > ?
                """, (voter_account.strip(), now - 86400))
                row_daily = cur.fetchone()
                daily_claims = row_daily[0] if row_daily else 0
                daily_votes = row_daily[1] if row_daily else 0
                if daily_claims >= 10 or (daily_votes + votes_count) > 5000:
                    return False, f"Daily sponsorship limit reached for voter '{voter_account}' (max 10 claims or 5,000 votes / 24h).", {}

                # 3d. Check 15% Reserve Budget Cap under exclusive write lock
                cur.execute("SELECT bank_reserves_cents FROM cbm_treasury WHERE id = 1")
                t_row = cur.fetchone()
                reserves_cents = t_row[0] if t_row else 0
                max_budget_cents = int(round(0.15 * reserves_cents))

                cur.execute("""
                    SELECT COALESCE(SUM(reward_cents), 0)
                    FROM cbm_admin_votes
                    WHERE status IN ('REWARDED', 'PENDING', 'PENDING_REVIEW')
                """)
                allocated_cents = cur.fetchone()[0] or 0
                available_budget_cents = max(0, max_budget_cents - allocated_cents)

                if reward_cents > available_budget_cents:
                    available_budget_gold = available_budget_cents / 100.0
                    max_budget_gold = max_budget_cents / 100.0
                    return False, (
                        f"Campaign reserve cap reached. Current available budget is {available_budget_gold:.2f} Gold "
                        f"(maximum 15% of bank reserves: {max_budget_gold:.2f} Gold). "
                        f"Claim of {reward_gold:.2f} Gold exceeds remaining cap."
                    ), {}

                expires_at = now + 900.0  # 15-minute verification slip window
                initial_status = "PENDING"
                cur.execute("""
                    INSERT INTO cbm_admin_votes (
                        claim_id, cbm_username, voter_account, target_account,
                        votes_count, gold_spent, reward_gold, reward_cents,
                        status, quarantine_until, created_at, expires_at, baseline_admin_points
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?)
                """, (
                    claim_id, cbm_username, voter_account.strip(), target_vault,
                    votes_count, calculated_gold_spent, reward_gold, reward_cents,
                    initial_status, now, expires_at, baseline_points
                ))
        except Exception as e:
            return False, f"Failed to record claim: {e}", {}

        if self.use_supabase:
            self._enqueue_sb_task("cbm_admin_votes", method="POST", body={
                "claim_id": claim_id,
                "cbm_username": cbm_username,
                "voter_account": voter_account.strip(),
                "target_account": target_vault,
                "votes_count": votes_count,
                "gold_spent": calculated_gold_spent,
                "reward_gold": reward_gold,
                "reward_cents": reward_cents,
                "status": "PENDING"
            })

        if auto_settle:
            return self.settle_admin_vote_claim(claim_id)

        return True, f"Admin vote slip #{claim_id} generated. Cast your vote for {target_vault} in-game within 15 minutes for 1:1 reimbursement.", {
            "claim_id": claim_id,
            "cbm_username": cbm_username,
            "voter_account": voter_account,
            "votes_count": votes_count,
            "reward_gold": reward_gold,
            "status": "PENDING",
            "expires_at": expires_at,
            "remaining_seconds": 900,
            "baseline_admin_points": baseline_points
        }

    def settle_admin_vote_claim(
        self,
        claim_id: str,
        verified: bool = True,
        rejection_reason: Optional[str] = None,
        quarantine_hours: float = 24.0
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Settles a pending Admin Election claim.
        If verified=True:
        - Credits member balance
        - Applies promotional quarantine holding period (quarantine_hours) to safeguard bank vault liquidity
        - Debits unencumbered bank reserves (satisfying 15% budget cap)
        - Records double-entry audit entry in cbm_ledger
        - Recalculates treasury
        """
        now = time.time()
        try:
            with self.write_transaction() as (conn, cur):
                cur.execute("SELECT * FROM cbm_admin_votes WHERE claim_id = ?", (claim_id,))
                row = cur.fetchone()
                if not row:
                    return False, f"Admin vote claim '{claim_id}' not found.", {}

                col_names = [d[0] for d in cur.description]
                claim = dict(zip(col_names, row))

                if claim.get("status") == "REWARDED":
                    return False, f"Claim '{claim_id}' has already been settled and rewarded.", {}

                cbm_username = claim["cbm_username"]
                reward_gold = float(claim["reward_gold"])
                reward_cents = int(claim["reward_cents"])

                if not verified:
                    reason = rejection_reason or "Verification failed or rejected by administrator."
                    cur.execute("""
                        UPDATE cbm_admin_votes
                        SET status = 'REJECTED', rejection_reason = ?, verified_at = ?
                        WHERE claim_id = ?
                    """, (reason, now, claim_id))
                else:
                    cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (cbm_username,))
                    acc_row = cur.fetchone()
                    if not acc_row:
                        return False, f"Member account '{cbm_username}' not found.", {}

                    current_balance_cents = acc_row[0] or 0
                    new_balance_cents = current_balance_cents + reward_cents
                    tx_hash = f"tx_adminvote_{claim_id}"
                    notes = f"Admin Election Reward: 1:1 reimbursement for {claim['votes_count']} votes ({reward_gold:.2f} Gold) cast for {claim['target_account']}"
                    quarantine_until = now + (quarantine_hours * 3600.0)

                    # Atomic settlement in SQLite
                    cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_balance_cents, now, cbm_username))
                    cur.execute("""
                        INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                        VALUES (?, 'ADMIN_VOTE_REWARD', ?, ?, ?, ?, ?)
                    """, (cbm_username, reward_cents, new_balance_cents, tx_hash, notes, now))
                    cur.execute("""
                        UPDATE cbm_admin_votes
                        SET status = 'REWARDED', verified_at = ?, quarantine_until = ?
                        WHERE claim_id = ?
                    """, (now, quarantine_until, claim_id))
        except Exception as e:
            return False, f"Failed to settle claim: {e}", {}

        if not verified:
            if self.use_supabase:
                self._enqueue_sb_task("cbm_admin_votes", method="PATCH", params=f"?claim_id=eq.{claim_id}", body={
                    "status": "REJECTED",
                    "rejection_reason": reason
                })
            return True, f"Claim '{claim_id}' rejected: {reason}", {"claim_id": claim_id, "status": "REJECTED"}

        # Dual-Write to Supabase
        if self.use_supabase:
            self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{cbm_username}", body={"deposited_cents": new_balance_cents})
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": cbm_username,
                "entry_type": "ADMIN_VOTE_REWARD",
                "amount_cents": reward_cents,
                "balance_after_cents": new_balance_cents,
                "tx_hash": tx_hash,
                "notes": notes
            })
            self._enqueue_sb_task("cbm_admin_votes", method="PATCH", params=f"?claim_id=eq.{claim_id}", body={
                "status": "REWARDED",
                "quarantine_until": quarantine_until
            })

        # Recalculate central bank solvency (liabilities grew by reward_cents, reserves funded it)
        self.recompute_treasury()

        return True, f"Admin vote reward of {reward_gold:.2f} Gold credited to {cbm_username} successfully!", {
            "claim_id": claim_id,
            "cbm_username": cbm_username,
            "voter_account": claim["voter_account"],
            "target_account": claim["target_account"],
            "votes_count": claim["votes_count"],
            "gold_spent": claim["gold_spent"],
            "reward_gold": reward_gold,
            "new_balance_gold": round(new_balance_cents / 100.0, 2),
            "status": "REWARDED",
            "quarantine_until": quarantine_until,
            "quarantine_hours": quarantine_hours,
            "tx_hash": tx_hash
        }

    def get_withdrawable_balance_cents(self, account_name: str) -> int:
        """
        Calculates withdrawable balance in cents, subtracting promotional/quarantined credits
        (e.g., admin election vote sponsorship rewards held in audit quarantine).
        """
        acc = self.get_account(account_name)
        if not acc:
            return 0
        total_cents = int(acc.get("deposited_cents", 0) or 0)

        now = time.time()
        conn = self._get_sqlite_conn(row_factory=False)
        cur = conn.cursor()
        cur.execute("""
            SELECT COALESCE(SUM(reward_cents), 0)
            FROM cbm_admin_votes
            WHERE cbm_username = ? AND status = 'REWARDED' AND quarantine_until > ?
        """, (account_name, now))
        row = cur.fetchone()
        quarantined_cents = int(row[0]) if row and row[0] is not None else 0

        return max(0, total_cents - quarantined_cents)

    def get_pending_admin_votes(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns list of pending vote claims awaiting review/audit."""
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT claim_id, cbm_username, voter_account, target_account, votes_count, gold_spent, reward_gold, status, created_at
            FROM cbm_admin_votes
            WHERE status IN ('PENDING', 'PENDING_REVIEW')
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        pending = []
        for r in cur.fetchall():
            pending.append({
                "claim_id": r[0],
                "cbm_username": r[1],
                "voter_account": r[2],
                "target_account": r[3],
                "votes_count": r[4],
                "gold_spent": r[5],
                "reward_gold": r[6],
                "status": r[7],
                "created_at": r[8]
            })
        return pending

    def list_member_admin_votes(self, cbm_username: str) -> List[Dict[str, Any]]:
        """Returns history of Admin Election vote claims for a specific member."""
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT claim_id, voter_account, target_account, votes_count, gold_spent, reward_gold, status, quarantine_until, created_at, verified_at
            FROM cbm_admin_votes
            WHERE cbm_username = ?
            ORDER BY created_at DESC
            LIMIT 50
        """, (cbm_username,))
        votes = []
        now = time.time()
        for r in cur.fetchall():
            q_until = r[7] or 0.0
            is_quarantined = (r[6] == "REWARDED") and (q_until > now)
            votes.append({
                "claim_id": r[0],
                "voter_account": r[1],
                "target_account": r[2],
                "votes_count": r[3],
                "gold_spent": r[4],
                "reward_gold": r[5],
                "status": r[6],
                "quarantine_until": q_until,
                "is_quarantined": is_quarantined,
                "created_at": r[8],
                "verified_at": r[9]
            })
        return votes

    # -------------------------------------------------------------------------
    # PRODUCT MARKETPLACE & PAYMENT GATEWAY ENGINE
    # 50% Product Owner Payout / 50% Central Bank Reserve Cushion Split
    # Minimum product price: 100.00 Gold
    # -------------------------------------------------------------------------
    MIN_PRODUCT_PRICE_GOLD = 100.0

    def create_product(
        self,
        owner_account: str,
        name: str,
        description: str = "",
        price_gold: float = 100.0,
        image_url: str = "",
        callback_url: str = "",
        webhook_url: str = "",
        requires_client_verification: bool = False,
        requirement_meta: Optional[Union[Dict[str, Any], str]] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Creates a new marketplace product.
        Enforces:
        1. Minimum price of 100.00 Gold unless requires_client_verification is True.
        2. Valid owner account registered in CBM.
        """
        clean_owner = (owner_account or "").strip()
        acc = self.get_account(clean_owner)
        if not acc:
            return False, f"Merchant account '{clean_owner}' not found in CBM."

        clean_name = (name or "").strip()
        if not clean_name:
            return False, "Product name cannot be empty."

        try:
            p_gold = round(float(price_gold), 2)
        except (ValueError, TypeError):
            return False, "Invalid product price format."

        if p_gold < self.MIN_PRODUCT_PRICE_GOLD:
            if not (p_gold == 0.0 and requires_client_verification):
                return False, f"Product price must be at least {self.MIN_PRODUCT_PRICE_GOLD:.2f} Gold (received {p_gold:.2f} Gold) unless client verification is required."

        clean_callback = (callback_url or "").strip()
        if not clean_callback or "territorial.io" in clean_callback:
            clean_callback = "https://pogxelqari.github.io/TerriX/client/"

        product_id = f"prod_{secrets.token_hex(6)}"
        price_cents = int(round(p_gold * 100))
        now = time.time()
        req_verify_int = 1 if requires_client_verification else 0
        req_meta_str = json.dumps(requirement_meta) if isinstance(requirement_meta, dict) else (requirement_meta or None)

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_products (
                    product_id, owner_account, name, description, image_url,
                    price_gold, price_cents, callback_url, webhook_url,
                    status, sales_count, total_revenue_gold,
                    requires_client_verification, requirement_meta,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0, 0.0, ?, ?, ?, ?)
            """, (
                product_id, clean_owner, clean_name, (description or "").strip(),
                (image_url or "").strip(), p_gold, price_cents, clean_callback,
                (webhook_url or "").strip(), req_verify_int, req_meta_str, now, now
            ))
            creator_order_id = f"ord_creator_{product_id}"
            creator_token = f"tok_creator_{product_id}_{hashlib.sha256(clean_owner.encode('utf-8')).hexdigest()[:16]}"
            cur.execute("""
                INSERT OR IGNORE INTO cbm_product_orders (
                    order_id, product_id, buyer_cbm_username, buyer_territorial_account,
                    price_gold, price_cents, owner_share_cents, cushion_share_cents,
                    payment_method, tx_hash, verification_token, status,
                    expires_at, fulfilled_at, created_at
                ) VALUES (?, ?, ?, ?, 0.0, 0, 0, 0, 'CREATOR_ENTITLEMENT', ?, ?, 'FULFILLED', 0.0, ?, ?)
            """, (
                creator_order_id, product_id, clean_owner, clean_owner,
                f"tx_creator_{product_id}", creator_token, now, now
            ))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return False, f"Failed to persist product: {e}"
        finally:
            conn.close()

        prod_record = {
            "product_id": product_id,
            "owner_account": clean_owner,
            "name": clean_name,
            "description": description or "",
            "image_url": image_url or "",
            "price_gold": p_gold,
            "price_cents": price_cents,
            "callback_url": clean_callback,
            "webhook_url": webhook_url or "",
            "status": "ACTIVE",
            "sales_count": 0,
            "total_revenue_gold": 0.0,
            "requires_client_verification": bool(requires_client_verification),
            "requirement_meta": requirement_meta,
            "is_free": p_gold == 0.0,
            "created_at": now
        }

        if self.use_supabase:
            self._enqueue_sb_task("cbm_products", method="POST", body=prod_record)

        return True, prod_record



    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves public product details by product_id."""
        clean_id = (product_id or "").strip()
        if not clean_id:
            return None

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT product_id, owner_account, name, description, image_url,
                   price_gold, price_cents, callback_url, webhook_url,
                   status, sales_count, total_revenue_gold, created_at,
                   requires_client_verification, requirement_meta
            FROM cbm_products
            WHERE product_id = ?
        """, (clean_id,))
        row = cur.fetchone()
        if not row:
            return None

        acc = self.get_account(row[1])
        display_name = acc.get("display_name") if acc else row[1]
        cb = row[7] or ""
        if not cb or "territorial.io" in cb:
            cb = "https://pogxelqari.github.io/TerriX/client/"

        req_verify = bool(row[13]) if len(row) > 13 and row[13] else False
        req_meta = None
        if len(row) > 14 and row[14]:
            try:
                req_meta = json.loads(row[14])
            except Exception:
                req_meta = {"description": row[14]}

        return {
            "product_id": row[0],
            "owner_account": row[1],
            "owner_display_name": display_name or row[1],
            "name": row[2],
            "description": row[3] or "",
            "image_url": row[4] or "",
            "price_gold": float(row[5]),
            "price_cents": int(row[6]),
            "callback_url": cb,
            "webhook_url": row[8] or "",
            "status": row[9],
            "sales_count": int(row[10] or 0),
            "total_revenue_gold": float(row[11] or 0.0),
            "created_at": float(row[12]),
            "requires_client_verification": req_verify,
            "requirement_meta": req_meta,
            "is_free": float(row[5]) == 0.0
        }


    def list_products_by_owner(self, owner_account: str, include_archived: bool = True) -> List[Dict[str, Any]]:
        """Lists all products created by a developer/merchant."""
        clean_owner = (owner_account or "").strip()
        if not clean_owner:
            return []

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        if include_archived:
            cur.execute("""
                SELECT product_id, owner_account, name, description, image_url,
                       price_gold, price_cents, callback_url, webhook_url,
                       status, sales_count, total_revenue_gold, created_at
                FROM cbm_products
                WHERE owner_account = ? COLLATE NOCASE
                ORDER BY created_at DESC
            """, (clean_owner,))
        else:
            cur.execute("""
                SELECT product_id, owner_account, name, description, image_url,
                       price_gold, price_cents, callback_url, webhook_url,
                       status, sales_count, total_revenue_gold, created_at
                FROM cbm_products
                WHERE owner_account = ? COLLATE NOCASE AND status = 'ACTIVE'
                ORDER BY created_at DESC
            """, (clean_owner,))

        products = []
        for row in cur.fetchall():
            products.append({
                "product_id": row[0],
                "owner_account": row[1],
                "name": row[2],
                "description": row[3] or "",
                "image_url": row[4] or "",
                "price_gold": float(row[5]),
                "price_cents": int(row[6]),
                "callback_url": row[7],
                "webhook_url": row[8] or "",
                "status": row[9],
                "sales_count": int(row[10] or 0),
                "total_revenue_gold": float(row[11] or 0.0),
                "created_at": float(row[12])
            })
        return products

    def update_product(
        self,
        product_id: str,
        owner_account: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        image_url: Optional[str] = None,
        price_gold: Optional[float] = None,
        callback_url: Optional[str] = None,
        webhook_url: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[bool, Union[Dict[str, Any], str]]:
        """Updates product parameters."""
        prod = self.get_product(product_id)
        if not prod:
            return False, f"Product '{product_id}' not found."
        if prod["owner_account"].lower() != owner_account.strip().lower():
            return False, "Unauthorized: Only the product owner can modify this product."

        new_name = name.strip() if name is not None and name.strip() else prod["name"]
        new_desc = description.strip() if description is not None else prod["description"]
        new_img = image_url.strip() if image_url is not None else prod["image_url"]
        new_cb = callback_url.strip() if callback_url is not None and callback_url.strip() else prod["callback_url"]
        new_wh = webhook_url.strip() if webhook_url is not None else prod["webhook_url"]

        if is_active is not None:
            new_status = "ACTIVE" if is_active else "ARCHIVED"
        else:
            new_status = prod.get("status", "ACTIVE")

        if price_gold is not None:
            if float(price_gold) < self.MIN_PRODUCT_PRICE_GOLD:
                return False, f"Product price must be at least {self.MIN_PRODUCT_PRICE_GOLD:.2f} Gold."
            new_price_gold = round(float(price_gold), 2)
        else:
            new_price_gold = prod["price_gold"]

        new_price_cents = int(round(new_price_gold * 100))
        now = time.time()

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                UPDATE cbm_products
                SET name = ?, description = ?, image_url = ?, price_gold = ?, price_cents = ?,
                    callback_url = ?, webhook_url = ?, status = ?, updated_at = ?
                WHERE product_id = ?
            """, (new_name, new_desc, new_img, new_price_gold, new_price_cents, new_cb, new_wh, new_status, now, product_id))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return False, f"Failed to update product: {e}"
        finally:
            conn.close()

        updated = self.get_product(product_id) or {}
        if self.use_supabase:
            self._enqueue_sb_task("cbm_products", method="PATCH", params=f"?product_id=eq.{product_id}", body=updated)

        return True, updated

    def archive_product(self, product_id: str, owner_account: str) -> Tuple[bool, str]:
        """Archives/deactivates a product."""
        prod = self.get_product(product_id)
        if not prod:
            return False, f"Product '{product_id}' not found."
        if prod["owner_account"].lower() != owner_account.strip().lower():
            return False, "Unauthorized."

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE cbm_products SET status = 'ARCHIVED', updated_at = ? WHERE product_id = ?", (time.time(), product_id))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return False, f"Failed to archive product: {e}"
        finally:
            conn.close()

        if self.use_supabase:
            self._enqueue_sb_task("cbm_products", method="PATCH", params=f"?product_id=eq.{product_id}", body={"status": "ARCHIVED"})

        return True, "Product archived."

    def create_or_renew_attestation(
        self,
        product_id: str,
        account: str,
        client_id: str = "terrix_client",
        payload: Optional[Dict[str, Any]] = None,
        ttl_seconds: float = 3600.0
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Creates or renews a time-bounded requirement attestation lease for a client.
        Enforces:
        1. Product exists, is active, and requires client verification.
        2. Generates cryptographic attestation token valid for ttl_seconds.
        """
        clean_prod = (product_id or "").strip()
        clean_acc = (account or "").strip()
        if not clean_prod or not clean_acc:
            return False, "product_id and account are required.", {}

        prod = self.get_product(clean_prod)
        if not prod or prod.get("status") != "ACTIVE":
            return False, f"Product '{clean_prod}' not found or inactive.", {}

        if not prod.get("requires_client_verification"):
            return False, f"Product '{clean_prod}' does not require client verification.", {}

        now = time.time()
        ttl = max(60.0, min(float(ttl_seconds), 86400.0))  # Between 1 minute and 24 hours
        expires_at = now + ttl

        # Cryptographic attestation token
        attest_token = f"tok_attest_{clean_prod}_{secrets.token_hex(16)}"
        payload_str = json.dumps(payload or {})

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            # Delete any existing attestations for this product & account
            cur.execute("""
                DELETE FROM cbm_product_attestations
                WHERE product_id = ? AND account_name = ? COLLATE NOCASE
            """, (clean_prod, clean_acc))

            cur.execute("""
                INSERT INTO cbm_product_attestations (
                    product_id, account_name, client_id, attestation_token,
                    attestation_payload, verified_at, expires_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                clean_prod, clean_acc, client_id or "terrix_client",
                attest_token, payload_str, now, expires_at, now
            ))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return False, f"Database error saving attestation: {e}", {}
        finally:
            conn.close()

        record = {
            "product_id": clean_prod,
            "account": clean_acc,
            "client_id": client_id,
            "attestation_token": attest_token,
            "verified_at": now,
            "expires_at": expires_at,
            "ttl": int(ttl)
        }
        return True, "Attestation lease verified and active.", record

    def get_active_attestation(self, product_id: str, account: str) -> Optional[Dict[str, Any]]:
        """Retrieves an active, unexpired requirement attestation lease for an account."""
        clean_prod = (product_id or "").strip()
        clean_acc = (account or "").strip()
        if not clean_prod or not clean_acc:
            return None

        aliases = self._get_all_account_aliases(clean_acc)
        if not aliases:
            aliases = [clean_acc]

        placeholders = ",".join("?" for _ in aliases)
        now = time.time()
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT product_id, account_name, client_id, attestation_token,
                   attestation_payload, verified_at, expires_at
            FROM cbm_product_attestations
            WHERE product_id = ?
              AND account_name IN ({placeholders}) COLLATE NOCASE
              AND expires_at > ?
            ORDER BY verified_at DESC LIMIT 1
        """, [clean_prod] + aliases + [now])
        row = cur.fetchone()
        if not row:
            return None

        payload_obj = {}
        if row[4]:
            try:
                payload_obj = json.loads(row[4])
            except Exception:
                payload_obj = {"raw": row[4]}

        return {
            "product_id": row[0],
            "account": row[1],
            "client_id": row[2],
            "attestation_token": row[3],
            "attestation_payload": payload_obj,
            "verified_at": float(row[5]),
            "expires_at": float(row[6]),
            "ttl_remaining": max(0.0, float(row[6]) - now)
        }


    def save_asset(self, filename: str, subfolder: str, mime_type: str, data: bytes) -> bool:
        """Stores a static asset binary programmatically in database storage."""
        if not filename or not data:
            return False
        now = time.time()
        size_bytes = len(data)
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_assets (filename, subfolder, mime_type, data, size_bytes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(filename) DO UPDATE SET
                    subfolder = excluded.subfolder,
                    mime_type = excluded.mime_type,
                    data = excluded.data,
                    size_bytes = excluded.size_bytes,
                    updated_at = excluded.updated_at
            """, (filename, subfolder, mime_type, data, size_bytes, now, now))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"[!] Error saving asset {filename} to DB: {e}")
            return False
        finally:
            conn.close()

    def get_asset(self, filename: str) -> Optional[Dict[str, Any]]:
        """Retrieves a stored asset record by filename."""
        if not filename:
            return None
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        try:
            cur.execute("SELECT filename, subfolder, mime_type, data, size_bytes, created_at, updated_at FROM cbm_assets WHERE filename = ?", (filename,))
            row = cur.fetchone()
            if row:
                return {
                    "filename": row[0],
                    "subfolder": row[1],
                    "mime_type": row[2],
                    "data": row[3],
                    "size_bytes": row[4],
                    "created_at": row[5],
                    "updated_at": row[6]
                }
            return None
        except Exception as e:
            print(f"[!] Error getting asset {filename} from DB: {e}")
            return None
        finally:
            conn.close()

    def get_all_assets(self) -> List[Dict[str, Any]]:
        """Retrieves all programmatically stored assets."""
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        try:
            cur.execute("SELECT filename, subfolder, mime_type, data, size_bytes, created_at, updated_at FROM cbm_assets")
            rows = cur.fetchall()
            return [
                {
                    "filename": r[0],
                    "subfolder": r[1],
                    "mime_type": r[2],
                    "data": r[3],
                    "size_bytes": r[4],
                    "created_at": r[5],
                    "updated_at": r[6]
                }
                for r in rows
            ]
        except Exception as e:
            print(f"[!] Error getting all assets from DB: {e}")
            return []
        finally:
            conn.close()

    def create_product_order(
        self,
        product_id: str,
        buyer_cbm_username: Optional[str] = None,
        buyer_territorial_account: Optional[str] = None,
        buyer_name: Optional[str] = None,
        buyer_account_name: Optional[str] = None,
        payment_method: str = "15MIN_SLIP",
        target_vault_account: Optional[str] = None,
        return_url: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Creates a pending product order slip (valid for 15 minutes).
        Calculates the 50/50 revenue split:
        - 50% to Product Owner (cbm_accounts.deposited_cents)
        - 50% to Central Bank Reserve Cushion (reserve_cushion_gold)
        Generates a cryptographic verification token for merchant confirmation.
        Returns the order dict on success, or None on failure.
        """
        prod = self.get_product(product_id)
        if not prod or prod.get("status") != "ACTIVE":
            return None

        now = time.time()
        expires_at = now + 900.0  # 15 minutes
        order_id = f"ord_{secrets.token_hex(8)}"

        price_cents = prod["price_cents"]
        price_gold = prod["price_gold"]

        # 50/50 split in cents
        owner_share_cents = price_cents // 2
        cushion_share_cents = price_cents - owner_share_cents

        # Generate cryptographic HMAC-SHA256 verification token via master crypto engine
        verification_token = generate_order_verification_token(order_id, product_id, price_cents, int(now))

        clean_buyer_cbm = (buyer_cbm_username or buyer_account_name or buyer_name or "").strip() or None
        clean_buyer_terri = (buyer_territorial_account or "").strip() or None
        target_vault = (target_vault_account or os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")).strip()
        cb_url = (return_url or prod.get("callback_url") or "").strip()
        if not cb_url or "territorial.io" in cb_url:
            cb_url = "https://pogxelqari.github.io/TerriX/client/"
        expires_at_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at))

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_product_orders (
                    order_id, product_id, buyer_cbm_username, buyer_territorial_account,
                    price_gold, price_cents, owner_share_cents, cushion_share_cents,
                    payment_method, tx_hash, verification_token, status,
                    expires_at, fulfilled_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'PENDING', ?, NULL, ?)
            """, (
                order_id, product_id, clean_buyer_cbm, clean_buyer_terri,
                price_gold, price_cents, owner_share_cents, cushion_share_cents,
                payment_method, verification_token, expires_at, now
            ))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return None
        finally:
            conn.close()

        order_record = {
            "order_id": order_id,
            "product_id": product_id,
            "product_name": prod["name"],
            "price_gold": price_gold,
            "price_cents": price_cents,
            "owner_share_gold": round(owner_share_cents / 100.0, 2),
            "cushion_share_gold": round(cushion_share_cents / 100.0, 2),
            "target_vault_account": target_vault,
            "buyer_cbm_username": clean_buyer_cbm,
            "buyer_territorial_account": clean_buyer_terri,
            "payment_method": payment_method,
            "status": "PENDING",
            "expires_at": expires_at_iso,
            "expires_at_iso": expires_at_iso,
            "expires_at_timestamp": expires_at,
            "remaining_seconds": max(0, int(expires_at - now)),
            "callback_url": cb_url,
            "return_url": cb_url,
            "verification_token": verification_token,
            "token_secret": verification_token,
            "created_at": now
        }

        if self.use_supabase:
            self._enqueue_sb_task("cbm_product_orders", method="POST", body={
                "order_id": order_id,
                "product_id": product_id,
                "buyer_cbm_username": clean_buyer_cbm,
                "buyer_territorial_account": clean_buyer_terri,
                "price_gold": price_gold,
                "price_cents": price_cents,
                "owner_share_cents": owner_share_cents,
                "cushion_share_cents": cushion_share_cents,
                "payment_method": payment_method,
                "verification_token": verification_token,
                "status": "PENDING",
                "expires_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at))
            })

        return order_record

    def get_product_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves product order details and current status."""
        clean_id = (order_id or "").strip()
        if not clean_id:
            return None

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT o.order_id, o.product_id, o.buyer_cbm_username, o.buyer_territorial_account,
                   o.price_gold, o.price_cents, o.owner_share_cents, o.cushion_share_cents,
                   o.payment_method, o.tx_hash, o.verification_token, o.status,
                   o.expires_at, o.fulfilled_at, o.created_at,
                   p.name, p.owner_account, p.callback_url
            FROM cbm_product_orders o
            LEFT JOIN cbm_products p ON o.product_id = p.product_id
            WHERE o.order_id = ?
        """, (clean_id,))
        row = cur.fetchone()
        if not row:
            if clean_id.startswith("ord_creator_"):
                prod_id = clean_id[len("ord_creator_"):]
                prod = self.get_product(prod_id)
                if prod:
                    owner = prod["owner_account"]
                    ctok = f"tok_creator_{prod_id}_{hashlib.sha256(owner.encode('utf-8')).hexdigest()[:16]}"
                    pts = prod.get("created_at") or time.time()
                    return {
                        "order_id": clean_id,
                        "product_id": prod_id,
                        "buyer_cbm_username": owner,
                        "buyer_territorial_account": owner,
                        "price_gold": 0.0,
                        "price_cents": 0,
                        "owner_share_gold": 0.0,
                        "cushion_share_gold": 0.0,
                        "payment_method": "CREATOR_ENTITLEMENT",
                        "tx_hash": f"tx_creator_{prod_id}",
                        "verification_token": ctok,
                        "token_secret": ctok,
                        "status": "FULFILLED",
                        "expires_at": "",
                        "expires_at_iso": "",
                        "expires_at_timestamp": 0.0,
                        "remaining_seconds": 0,
                        "fulfilled_at": pts,
                        "created_at": pts,
                        "product_name": prod.get("name", "Product"),
                        "owner_account": owner,
                        "callback_url": prod.get("callback_url", "https://pogxelqari.github.io/TerriX/client/"),
                        "return_url": prod.get("callback_url", "https://pogxelqari.github.io/TerriX/client/"),
                        "target_vault_account": os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC"),
                        "is_creator": True
                    }
            return None

        now = time.time()
        exp = float(row[12]) if row[12] else 0.0
        rem = max(0, int(exp - now)) if exp > now else 0
        exp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(exp)) if exp > 0 else ""

        # Auto-detect expired
        current_status = row[11]
        if current_status == "PENDING" and exp > 0 and now > exp:
            current_status = "EXPIRED"

        cb_url = row[17] or ""
        if not cb_url or "territorial.io" in cb_url:
            cb_url = "https://pogxelqari.github.io/TerriX/client/"
        v_token = row[10] or ""

        return {
            "order_id": row[0],
            "product_id": row[1],
            "buyer_cbm_username": row[2],
            "buyer_territorial_account": row[3],
            "price_gold": float(row[4]),
            "price_cents": int(row[5]),
            "owner_share_gold": round(int(row[6]) / 100.0, 2),
            "cushion_share_gold": round(int(row[7]) / 100.0, 2),
            "payment_method": row[8],
            "tx_hash": row[9],
            "verification_token": v_token,
            "token_secret": v_token,
            "status": current_status,
            "expires_at": exp_iso,
            "expires_at_iso": exp_iso,
            "expires_at_timestamp": exp,
            "remaining_seconds": rem,
            "fulfilled_at": float(row[13]) if row[13] else None,
            "created_at": float(row[14]),
            "product_name": row[15] or "Product",
            "owner_account": row[16] or "",
            "callback_url": cb_url,
            "return_url": cb_url,
            "target_vault_account": os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC"),
            "is_creator": bool(row[8] == "CREATOR_ENTITLEMENT" or clean_id.startswith("ord_creator_"))
        }

    def get_product_order_by_tx(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieves fulfilled product order details by transaction hash."""
        clean_tx = (tx_hash or "").strip()
        if not clean_tx:
            return None
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT order_id FROM cbm_product_orders WHERE tx_hash = ? LIMIT 1", (clean_tx,))
        row = cur.fetchone()
        return self.get_product_order(row[0]) if row else None

    def fulfill_product_order(self, order_id: str, tx_hash: str, sender: Optional[str] = None) -> Tuple[bool, str]:
        """
        Fulfills a product order once payment is verified:
        - 50% credited to Product Owner (cbm_accounts.deposited_cents)
        - 50% retained in Central Bank Reserve Cushion (reserve_cushion_gold)
        - Records double-entry ledger entry PRODUCT_SALE_REVENUE
        - Increments product sales stats
        """
        order = self.get_product_order(order_id)
        if not order:
            return False, f"Order '{order_id}' not found."
        if order["status"] == "FULFILLED":
            return True, "Order already fulfilled."

        owner_account = order["owner_account"]
        owner_share_cents = int(order["price_cents"] * 0.5)
        now = time.time()

        notes = f"Product Sale: 50% revenue share for '{order['product_name']}' (Order {order_id})"
        new_bal = 0
        try:
            with self.write_transaction() as (conn, cur):
                # 1. Update order status
                cur.execute("""
                    UPDATE cbm_product_orders
                    SET status = 'FULFILLED', tx_hash = ?, fulfilled_at = ?
                    WHERE order_id = ?
                """, (tx_hash, now, order_id))

                # 2. Credit 50% share to product owner
                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (owner_account,))
                acc_row = cur.fetchone()
                current_bal = acc_row[0] if acc_row else 0
                new_bal = current_bal + owner_share_cents

                cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_bal, now, owner_account))

                # 3. Double-entry ledger entry
                cur.execute("""
                    INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                    VALUES (?, 'PRODUCT_SALE_REVENUE', ?, ?, ?, ?, ?)
                """, (owner_account, owner_share_cents, new_bal, tx_hash, notes, now))

                # 4. Update product statistics
                cur.execute("""
                    UPDATE cbm_products
                    SET sales_count = sales_count + 1,
                        total_revenue_gold = total_revenue_gold + ?,
                        updated_at = ?
                    WHERE product_id = ?
                """, (order["price_gold"], now, order["product_id"]))
        except Exception as e:
            return False, f"Failed to fulfill order: {e}"

        # Dual-write to Supabase
        if self.use_supabase:
            self._enqueue_sb_task("cbm_product_orders", method="PATCH", params=f"?order_id=eq.{order_id}", body={
                "status": "FULFILLED",
                "tx_hash": tx_hash,
                "fulfilled_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            })
            self._enqueue_sb_task("cbm_accounts", method="PATCH", params=f"?account_name=eq.{owner_account}", body={"deposited_cents": new_bal})
            self._enqueue_sb_task("cbm_ledger", method="POST", body={
                "account_name": owner_account,
                "entry_type": "PRODUCT_SALE_REVENUE",
                "amount_cents": owner_share_cents,
                "balance_after_cents": new_bal,
                "tx_hash": tx_hash,
                "notes": notes
            })

        # Recalculate treasury: since 100% came into vault and only 50% was given to owner,
        # vault_excess and reserve_cushion_gold automatically increase by the remaining 50%!
        self.recompute_treasury()

        return True, ""

    def find_and_claim_pending_product_order(
        self,
        sender: Optional[str] = None,
        amount_cents: Optional[int] = None,
        tx_id: Optional[str] = None,
        amount_gold: Optional[float] = None,
        tx_hash: Optional[str] = None,
        sender_account: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Model 3 In-Game Payment Matching for Product Slips:
        Finds an active 15-minute product order slip matching the exact amount.
        If matched and tx provided, marks as FULFILLED, executes 50/50 split, and returns order dict.
        """
        now = time.time()
        conn = self._get_sqlite_conn()
        cur = conn.cursor()

        clean_sender = (sender or sender_account or "").strip()
        actual_cents = amount_cents if amount_cents is not None else (int(round(float(amount_gold) * 100)) if amount_gold is not None else 0)
        actual_tx = (tx_id or tx_hash or "").strip()

        row = None
        # Priority 1: Match on sender account if declared
        if clean_sender:
            cur.execute("""
                SELECT order_id FROM cbm_product_orders
                WHERE status = 'PENDING' AND expires_at >= ? AND price_cents = ?
                  AND (buyer_territorial_account = ? COLLATE NOCASE OR buyer_cbm_username = ? COLLATE NOCASE)
                ORDER BY created_at ASC
                LIMIT 1
            """, (now, actual_cents, clean_sender, clean_sender))
            row = cur.fetchone()

        # Priority 2: Match by exact price_cents on any active pending slip
        if not row:
            cur.execute("""
                SELECT order_id FROM cbm_product_orders
                WHERE status = 'PENDING' AND expires_at >= ? AND price_cents = ?
                ORDER BY created_at ASC
                LIMIT 1
            """, (now, actual_cents))
            row = cur.fetchone()

        if row:
            order_id = row[0]
            if actual_tx:
                ok, _ = self.fulfill_product_order(order_id, actual_tx, sender=clean_sender)
                if ok:
                    return self.get_product_order(order_id)
            else:
                return self.get_product_order(order_id)

        return None

    def verify_product_order_token(
        self,
        token_or_order_id: str = "",
        order_id_or_token: str = "",
        token: Optional[str] = None,
        order_id: Optional[str] = None
    ) -> Tuple[bool, Union[Dict[str, Any], str]]:
        """
        Validates a product order verification token for third-party merchants.
        Accepts flexible positional or keyword arguments.
        Returns: (True, order_dict) on success, or (False, error_message) on failure.
        """
        t = (token or "").strip()
        oid = (order_id or "").strip()

        if not t and not oid:
            p1 = (token_or_order_id or "").strip()
            p2 = (order_id_or_token or "").strip()
            if p1.startswith("tok_") or len(p1) > len(p2):
                t, oid = p1, p2
            elif p2.startswith("tok_"):
                t, oid = p2, p1
            elif p1.startswith("ord_"):
                oid, t = p1, p2
            elif p2.startswith("ord_"):
                oid, t = p2, p1
            else:
                t, oid = p1, p2
        elif not t:
            p1 = (token_or_order_id or "").strip()
            p2 = (order_id_or_token or "").strip()
            t = p1 if p1 != oid else p2
        elif not oid:
            p1 = (token_or_order_id or "").strip()
            p2 = (order_id_or_token or "").strip()
            oid = p1 if p1 != t else p2

        order = self.get_product_order(oid)
        if not order:
            return False, f"Order '{oid}' not found."

        expected_token = order.get("verification_token")
        if not expected_token or not constant_time_verify(expected_token, t):
            return False, "Invalid verification token."

        if order.get("status") != "FULFILLED":
            return False, f"Order is not fulfilled (status: {order.get('status')})."

        return True, {
            "order_id": order["order_id"],
            "product_id": order["product_id"],
            "product_name": order.get("product_name", "Product"),
            "price_gold": order["price_gold"],
            "buyer_territorial_account": order.get("buyer_territorial_account"),
            "buyer_cbm_username": order.get("buyer_cbm_username"),
            "status": "FULFILLED",
            "is_creator": bool(order.get("is_creator", False)),
            "fulfilled_at": order.get("fulfilled_at"),
            "created_at": order.get("created_at")
        }

    def get_account_owned_products(self, account: str) -> List[str]:
        """Returns a list of distinct product_id strings fulfilled or created for a player account."""
        clean_acc = (account or "").strip()
        if not clean_acc:
            return []
        aliases = self._get_all_account_aliases(clean_acc)
        if not aliases:
            aliases = [clean_acc]

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        placeholders = ",".join("?" for _ in aliases)

        # 1. Fulfilled orders where buyer matches any alias
        cur.execute(f"""
            SELECT DISTINCT product_id FROM cbm_product_orders
            WHERE status = 'FULFILLED'
              AND (buyer_territorial_account IN ({placeholders}) COLLATE NOCASE 
                   OR buyer_cbm_username IN ({placeholders}) COLLATE NOCASE)
        """, aliases + aliases)
        purchased = [r[0] for r in cur.fetchall() if r[0]]

        # 2. Created products where owner_account matches any alias
        cur.execute(f"""
            SELECT DISTINCT product_id FROM cbm_products
            WHERE owner_account IN ({placeholders}) COLLATE NOCASE
              AND status != 'ARCHIVED'
        """, aliases)
        created = [r[0] for r in cur.fetchall() if r[0]]

        # 3. Active requirement attestations where account matches any alias
        now = time.time()
        cur.execute(f"""
            SELECT DISTINCT product_id FROM cbm_product_attestations
            WHERE account_name IN ({placeholders}) COLLATE NOCASE
              AND expires_at > ?
        """, aliases + [now])
        attested = [r[0] for r in cur.fetchall() if r[0]]

        seen = set()
        result = []
        for pid in (purchased + created + attested):
            if pid not in seen:
                seen.add(pid)
                result.append(pid)
        return result

    def get_product_receipt_for_account(self, account: str, product_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves the latest fulfilled order receipt, creator entitlement receipt, or active attestation for an account and product."""
        clean_acc = (account or "").strip()
        clean_prod = (product_id or "").strip()
        if not clean_acc or not clean_prod:
            return None

        aliases = self._get_all_account_aliases(clean_acc)
        if not aliases:
            aliases = [clean_acc]

        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        placeholders = ",".join("?" for _ in aliases)

        # 1. Check fulfilled orders in cbm_product_orders
        cur.execute(f"""
            SELECT order_id, verification_token, fulfilled_at, created_at
            FROM cbm_product_orders
            WHERE status = 'FULFILLED'
              AND product_id = ?
              AND (buyer_territorial_account IN ({placeholders}) COLLATE NOCASE 
                   OR buyer_cbm_username IN ({placeholders}) COLLATE NOCASE)
            ORDER BY fulfilled_at DESC LIMIT 1
        """, [clean_prod] + aliases + aliases)
        row = cur.fetchone()
        if row:
            is_c = str(row[0]).startswith("ord_creator_")
            return {
                "order_id": row[0],
                "verification_token": row[1],
                "fulfilled_at": float(row[2]) if row[2] else None,
                "created_at": float(row[3]) if row[3] else None,
                "is_creator": is_c
            }

        # 2. Check if account is the creator/owner of the product
        cur.execute(f"""
            SELECT product_id, owner_account, created_at
            FROM cbm_products
            WHERE product_id = ?
              AND owner_account IN ({placeholders}) COLLATE NOCASE
        """, [clean_prod] + aliases)
        prow = cur.fetchone()
        if prow:
            owner = prow[1]
            cid = f"ord_creator_{clean_prod}"
            ctok = f"tok_creator_{clean_prod}_{hashlib.sha256(owner.encode('utf-8')).hexdigest()[:16]}"
            pts = float(prow[2]) if prow[2] else time.time()
            return {
                "order_id": cid,
                "verification_token": ctok,
                "fulfilled_at": pts,
                "created_at": pts,
                "is_creator": True
            }

        # 3. Check active requirement attestation
        now = time.time()
        cur.execute(f"""
            SELECT attestation_token, verified_at, expires_at, client_id
            FROM cbm_product_attestations
            WHERE product_id = ?
              AND account_name IN ({placeholders}) COLLATE NOCASE
              AND expires_at > ?
            ORDER BY verified_at DESC LIMIT 1
        """, [clean_prod] + aliases + [now])
        arow = cur.fetchone()
        if arow:
            return {
                "order_id": f"attest_{clean_prod}_{clean_acc}",
                "verification_token": arow[0],
                "fulfilled_at": float(arow[1]),
                "created_at": float(arow[1]),
                "expires_at": float(arow[2]),
                "client_id": arow[3],
                "is_attestation": True
            }

        return None


    # -------------------------------------------------------------------------
    # Referral Reward Program Engine
    # -------------------------------------------------------------------------

    def register_referral(self, inviter_account: str, invitee_account: str) -> bool:
        """
        Records a referral relationship. Called during invitee registration.
        Rejects self-referrals and duplicate invitee entries.
        Returns True on success, False if already exists or invalid.
        """
        clean_inviter = (inviter_account or "").strip()
        clean_invitee = (invitee_account or "").strip()
        if not clean_inviter or not clean_invitee:
            return False
        if clean_inviter.upper() == clean_invitee.upper():
            return False
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "INSERT OR IGNORE INTO cbm_referrals (inviter_account, invitee_account, status, created_at) VALUES (?, ?, 'PENDING', ?)",
                (clean_inviter, clean_invitee, time.time())
            )
            if cur.rowcount > 0:
                cur.execute(
                    "UPDATE cbm_accounts SET referred_by = ? WHERE LOWER(account_name) = LOWER(?)",
                    (clean_inviter, clean_invitee)
                )
                conn.commit()
                return True
            conn.rollback()
            return False
        except Exception as e:
            conn.rollback()
            print(f"[!] Referral registration error: {e}")
            return False
        finally:
            conn.close()

    def check_and_settle_referral(self, invitee_account: str) -> None:
        """
        Evaluates progressive referral milestones and perpetual donation revenue share.
        Guaranteed 75%-90% net profit margin to Clan Bank:
          - Tier 1 (Member Onboarding): Deposits >= 500G & Donations >= 100G -> 15G to inviter, 10G to invitee (+75G net profit).
          - Tier 2 (Active Supporter): Deposits >= 1,000G & Donations >= 300G -> 35G to inviter (+240G cumulative profit).
          - Tier 3 (Clan Benefactor): Deposits >= 2,500G & Donations >= 1,000G -> 100G to inviter, 25G to invitee (+815G cumulative profit).
          - Perpetual Patron Share: 10% commission to inviter on all donations beyond 1,000G (90% net profit on every donation).
        """
        clean_invitee = (invitee_account or "").strip()
        if not clean_invitee:
            return

        now = time.time()
        should_recompute = False
        try:
            with self.write_transaction() as (conn, cur):
                cur.execute(
                    "SELECT inviter_account, status, tier1_rewarded_at, tier2_rewarded_at, tier3_rewarded_at, COALESCE(perpetual_commission_gold, 0.0), rewarded_at FROM cbm_referrals WHERE LOWER(invitee_account) = LOWER(?)",
                    (clean_invitee,)
                )
                ref = cur.fetchone()
                if not ref:
                    return

                inviter, current_status, t1_at, t2_at, t3_at, perp_comm, old_rewarded_at = ref

                # Legacy migration safety: if already marked REWARDED under old scheme, treat Tier 1 as settled
                if current_status == "REWARDED" and not t1_at:
                    t1_at = old_rewarded_at or now

                # Fetch lifetime gross deposited gold
                cur.execute(
                    "SELECT total_deposited_cents FROM cbm_accounts WHERE LOWER(account_name) = LOWER(?)",
                    (clean_invitee,)
                )
                acc_row = cur.fetchone()
                deposited_gold = (acc_row[0] or 0) / 100.0 if acc_row else 0.0

                # Sum verified War Chest donations for invitee
                cur.execute("""
                    SELECT COALESCE(SUM(d.amount_cents), 0)
                    FROM cbm_donations d
                    LEFT JOIN cbm_accounts a
                        ON LOWER(d.donor_name) = LOWER(a.display_name)
                        OR LOWER(d.donor_name) = LOWER(a.account_name)
                        OR LOWER(d.territorial_account) = LOWER(a.primary_territorial_account)
                    WHERE
                        LOWER(a.account_name) = LOWER(?)
                        OR LOWER(d.donor_name) = LOWER(?)
                        OR LOWER(d.territorial_account) = LOWER(?)
                """, (clean_invitee, clean_invitee, clean_invitee))
                donated_gold = (cur.fetchone()[0] or 0) / 100.0

                # Update progress tracking
                cur.execute(
                    "UPDATE cbm_referrals SET invitee_deposited_gold = ?, invitee_donated_gold = ? WHERE LOWER(invitee_account) = LOWER(?)",
                    (deposited_gold, donated_gold, clean_invitee)
                )

                payouts = []
                new_t1_at = t1_at
                new_t2_at = t2_at
                new_t3_at = t3_at
                new_perp_comm = perp_comm

                # 1. Tier 1 Milestone: Deposits >= 500G & Donations >= 100G (Inviter: 15G, Invitee: 10G)
                if deposited_gold >= 500.0 and donated_gold >= 100.0 and not t1_at:
                    new_t1_at = now
                    payouts.append({
                        "recipient": inviter,
                        "amount_cents": 1500,
                        "note": f"Referral Milestone Tier 1: {clean_invitee} qualified (>=100G donated & >=500G deposited)"
                    })
                    payouts.append({
                        "recipient": clean_invitee,
                        "amount_cents": 1000,
                        "note": f"Referral Welcome Bonus Tier 1: Qualified under sponsor {inviter}"
                    })

                # 2. Tier 2 Milestone: Deposits >= 1,000G & Donations >= 300G (Inviter: 35G)
                if deposited_gold >= 1000.0 and donated_gold >= 300.0 and not t2_at:
                    new_t2_at = now
                    payouts.append({
                        "recipient": inviter,
                        "amount_cents": 3500,
                        "note": f"Referral Milestone Tier 2: {clean_invitee} qualified (>=300G donated & >=1,000G deposited)"
                    })

                # 3. Tier 3 Milestone: Deposits >= 2,500G & Donations >= 1,000G (Inviter: 100G, Invitee: 25G)
                if deposited_gold >= 2500.0 and donated_gold >= 1000.0 and not t3_at:
                    new_t3_at = now
                    payouts.append({
                        "recipient": inviter,
                        "amount_cents": 10000,
                        "note": f"Referral Milestone Tier 3: {clean_invitee} reached Benefactor (>=1,000G donated & >=2,500G deposited)"
                    })
                    payouts.append({
                        "recipient": clean_invitee,
                        "amount_cents": 2500,
                        "note": f"Referral Benefactor Bonus Tier 3: Qualified under sponsor {inviter}"
                    })

                # 4. Perpetual Patron Share: 10% commission on donations beyond 1,000G once Tier 3 is achieved
                if (t3_at or new_t3_at) and donated_gold > 1000.0:
                    excess_donated_cents = max(0, int(round((donated_gold - 1000.0) * 100)))
                    already_commissioned_basis_cents = int(round(perp_comm * 1000))
                    commissionable_cents = excess_donated_cents - already_commissioned_basis_cents
                    if commissionable_cents >= 100:  # At least 1.00 Gold in new donations
                        comm_cents = int(round(commissionable_cents * 0.10))
                        if comm_cents > 0:
                            new_perp_comm += (comm_cents / 100.0)
                            payouts.append({
                                "recipient": inviter,
                                "amount_cents": comm_cents,
                                "note": f"Referral Perpetual Patron Share (10%): {clean_invitee} donated additional {commissionable_cents/100:.2f}G"
                            })

                total_payout_cents = sum(p["amount_cents"] for p in payouts)
                if total_payout_cents > 0:
                    cur.execute("SELECT vault_total_gold_cents, member_liabilities_cents FROM cbm_treasury WHERE id = 1")
                    tr_row = cur.fetchone()
                    vault_excess_cents = (tr_row[0] - tr_row[1]) if tr_row else 0
                    if vault_excess_cents < total_payout_cents:
                        print(
                            f"[CBM Referral] Insufficient vault excess ({vault_excess_cents/100:.2f}G) "
                            f"to settle referral {inviter} -> {clean_invitee}. "
                            f"Required: {total_payout_cents/100:.2f}G. Deferred."
                        )
                        return

                    for p in payouts:
                        recip = p["recipient"]
                        amt = p["amount_cents"]
                        note = p["note"]

                        cur.execute(
                            "UPDATE cbm_accounts SET deposited_cents = deposited_cents + ?, updated_at = ? WHERE LOWER(account_name) = LOWER(?)",
                            (amt, now, recip)
                        )
                        cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE LOWER(account_name) = LOWER(?)", (recip,))
                        bal_row = cur.fetchone()
                        bal_after = bal_row[0] if bal_row else 0

                        cur.execute(
                            "INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'REFERRAL_REWARD', ?, ?, ?, ?, ?)",
                            (recip, amt, bal_after, f"ref_{recip}_{clean_invitee}_{int(now)}_{amt}", note, now)
                        )
                        vault_excess_cents -= amt
                        cur.execute(
                            "INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'RESERVE_DEBIT', ?, ?, ?, ?, ?)",
                            ("reserves", amt, max(0, vault_excess_cents), f"ref_rsv_{recip}_{clean_invitee}_{int(now)}_{amt}", f"Reserve debit: {note}", now)
                        )

                    new_status = 'TIER3' if new_t3_at else ('TIER2' if new_t2_at else ('TIER1' if new_t1_at else 'PENDING'))
                    cur.execute("""
                        UPDATE cbm_referrals
                        SET status = ?,
                            tier1_rewarded_at = ?,
                            tier2_rewarded_at = ?,
                            tier3_rewarded_at = ?,
                            perpetual_commission_gold = ?,
                            rewarded_at = COALESCE(rewarded_at, ?)
                        WHERE LOWER(invitee_account) = LOWER(?)
                    """, (new_status, new_t1_at, new_t2_at, new_t3_at, new_perp_comm, now, clean_invitee))

                    should_recompute = True
                    print(
                        f"[CBM Referral] Settled milestone/commission for {inviter} <- {clean_invitee}: "
                        f"{total_payout_cents/100:.2f}G distributed across {len(payouts)} payouts."
                    )
        except Exception as e:
            print(f"[!] Referral settlement error: {e}")

        if should_recompute:
            self.recompute_treasury()

    def get_referral_stats(self, inviter_account: str) -> dict:
        """Returns referral program statistics for a given inviter account."""
        clean = (inviter_account or "").strip()
        if not clean:
            return {
                "total": 0, "pending": 0, "tier1": 0, "tier2": 0, "tier3": 0,
                "total_gold_earned": 0.0, "referrals": []
            }
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT invitee_account, status, invitee_deposited_gold, invitee_donated_gold,
                   tier1_rewarded_at, tier2_rewarded_at, tier3_rewarded_at,
                   COALESCE(perpetual_commission_gold, 0.0), created_at
            FROM cbm_referrals
            WHERE LOWER(inviter_account) = LOWER(?)
            ORDER BY created_at DESC
        """, (clean,))
        rows = cur.fetchall()
        stats = {
            "total": len(rows),
            "pending": 0,
            "tier1": 0,
            "tier2": 0,
            "tier3": 0,
            "total_gold_earned": 0.0,
            "referrals": []
        }
        for r in rows:
            inv_acc, st, dep, don, t1, t2, t3, perp, c_at = r
            earned = 0.0
            if t1: earned += 15.0
            if t2: earned += 35.0
            if t3: earned += 100.0
            earned += perp
            stats["total_gold_earned"] += earned

            if t3:
                stats["tier3"] += 1
            elif t2:
                stats["tier2"] += 1
            elif t1:
                stats["tier1"] += 1
            else:
                stats["pending"] += 1

            stats["referrals"].append({
                "invitee_account": inv_acc,
                "status": st,
                "deposited_gold": round(dep, 2),
                "donated_gold": round(don, 2),
                "tier1_qualified": bool(t1),
                "tier2_qualified": bool(t2),
                "tier3_qualified": bool(t3),
                "gold_earned": round(earned, 2),
                "created_at": c_at
            })
        stats["total_gold_earned"] = round(stats["total_gold_earned"], 2)
        return stats

    # =========================================================================
    # CBM Sponsorship & Third-Party Advertising Infrastructure
    # =========================================================================

    def get_sponsorship_slots(self) -> List[Dict[str, Any]]:
        """
        Retrieves all registered sponsorship ad slots, reconciling expired leases.
        """
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        now_ts = time.time()
        
        # Lazy expiration reconciliation
        try:
            cur.execute("""
                UPDATE cbm_sponsorship_slots
                SET is_available = 1, active_sponsor_account = NULL
                WHERE lease_end_ts IS NOT NULL AND lease_end_ts <= ? AND is_available = 0
            """, (now_ts,))
            slots_expired = cur.rowcount
            cur.execute("""
                UPDATE cbm_sponsored_ads
                SET status = 'EXPIRED'
                WHERE expires_at <= ? AND status = 'ACTIVE'
            """, (now_ts,))
            ads_expired = cur.rowcount
            conn.commit()

            if (slots_expired > 0 or ads_expired > 0) and self.use_supabase:
                now_iso = self._format_iso(now_ts)
                self._enqueue_sb_task(
                    "cbm_sponsorship_slots",
                    method="PATCH",
                    params=f"?lease_end_ts=lte.{now_iso}&is_available=eq.false",
                    body={"is_available": True, "active_sponsor_account": None, "updated_at": now_iso}
                )
                self._enqueue_sb_task(
                    "cbm_sponsored_ads",
                    method="PATCH",
                    params=f"?expires_at=lte.{now_iso}&status=eq.ACTIVE",
                    body={"status": "EXPIRED"}
                )
        except Exception:
            pass

        cur.execute("""
            SELECT slot_id, name, description, base_price_cents, current_price_cents,
                   max_active_sponsors, active_sponsor_account, lease_start_ts, lease_end_ts,
                   is_available, updated_at
            FROM cbm_sponsorship_slots
            ORDER BY slot_id ASC
        """)
        rows = cur.fetchall()
        slots = []
        for r in rows:
            slots.append({
                "slot_id": r[0],
                "name": r[1],
                "description": r[2],
                "base_price_gold": round(r[3] / 100.0, 2),
                "base_price_cents": r[3],
                "current_price_gold": round(r[4] / 100.0, 2),
                "current_price_cents": r[4],
                "max_active_sponsors": r[5],
                "active_sponsor_account": r[6],
                "lease_start_ts": r[7],
                "lease_end_ts": r[8],
                "is_available": bool(r[9]),
                "time_remaining_seconds": max(0.0, (r[8] or 0.0) - now_ts) if r[8] else 0.0,
                "updated_at": r[10]
            })
        return slots

    def get_sponsorship_slot(self, slot_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single sponsorship slot by its identifier."""
        slots = self.get_sponsorship_slots()
        for s in slots:
            if s["slot_id"] == slot_id:
                return s
        return None

    def purchase_sponsorship_lease(
        self,
        slot_id: str,
        buyer_account: str,
        title: str,
        tagline: str,
        target_url: str,
        badge_text: str = "PROMOTED",
        image_url: Optional[str] = None,
        image_width: int = 728,
        image_height: int = 90,
        duration_days: int = 7
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Executes an atomic purchase of a limited-availability sponsorship lease.
        Enforces 60/40 Capital Covenant:
        - 60% of fees credited directly to Unencumbered Bank Reserves (cbm_treasury).
        - 40% reserved for Community Referral and Rewards Pool.
        """
        slot = self.get_sponsorship_slot(slot_id)
        if not slot:
            return False, f"Sponsorship slot '{slot_id}' does not exist.", None

        now_ts = time.time()
        if not slot["is_available"] and slot["lease_end_ts"] and now_ts < slot["lease_end_ts"]:
            rem_days = round((slot["lease_end_ts"] - now_ts) / 86400.0, 1)
            return False, f"Slot '{slot['name']}' is currently leased to '{slot['active_sponsor_account']}'. Available in {rem_days} days.", None

        # Content validations
        clean_title = (title or "").strip()
        clean_tagline = (tagline or "").strip()
        clean_url = (target_url or "").strip()
        clean_badge = (badge_text or "PROMOTED").strip()[:16]
        clean_image = (image_url or "").strip() if image_url else None

        if not clean_title or len(clean_title) > 80:
            return False, "Sponsorship title must be between 1 and 80 characters.", None
        if not clean_tagline or len(clean_tagline) > 200:
            return False, "Sponsorship tagline must be between 1 and 200 characters.", None
        if not (clean_url.startswith("http://") or clean_url.startswith("https://")):
            return False, "Target URL must begin with http:// or https://.", None

        # Balance check
        acc = self.get_account(buyer_account)
        if not acc:
            return False, f"Buyer account '{buyer_account}' not found.", None

        role = acc.get("role", "member")
        if role in ("restricted", "downgraded", "frozen", "delinquent"):
            return False, "Account is restricted from booking sponsorships.", None

        price_cents = slot["current_price_cents"]
        curr_balance_cents = int(acc.get("deposited_cents", 0))
        if curr_balance_cents < price_cents:
            req_gold = price_cents / 100.0
            avail_gold = curr_balance_cents / 100.0
            return False, f"Insufficient balance: {avail_gold:.2f} Gold available, {req_gold:.2f} Gold required.", None

        # 60/40 Capital Covenant Calculation
        reserve_split_cents = int(round(price_cents * 0.60))
        referral_split_cents = price_cents - reserve_split_cents
        lease_duration_sec = duration_days * 86400.0
        lease_end_ts = now_ts + lease_duration_sec
        ad_id = f"ad_{uuid.uuid4().hex[:12]}"
        tx_hash = f"sponsor_{slot_id}_{int(now_ts)}"

        new_bal_cents = 0
        try:
            with self.write_transaction() as (conn, cur):
                # 1. Deduct price atomically from buyer
                cur.execute("""
                    UPDATE cbm_accounts
                    SET deposited_cents = deposited_cents - ?, updated_at = ?
                    WHERE account_name = ? AND deposited_cents >= ?
                """, (price_cents, now_ts, buyer_account, price_cents))

                if cur.rowcount == 0:
                    return False, "Insufficient balance during atomic deduction.", None

                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (buyer_account,))
                new_bal_cents = cur.fetchone()[0]

                # 2. Record ledger entry
                cur.execute("""
                    INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                    VALUES (?, 'SPONSORSHIP_LEASE', ?, ?, ?, ?, ?)
                """, (buyer_account, -price_cents, new_bal_cents, tx_hash, f"Booked {duration_days}-day lease for {slot['name']}", now_ts))

                # 3. Inject 60% share directly into Bank Unencumbered Reserves
                cur.execute("""
                    UPDATE cbm_treasury
                    SET bank_reserves_cents = bank_reserves_cents + ?,
                        unencumbered_capital_cents = unencumbered_capital_cents + ?,
                        last_sync_at = ?
                    WHERE id = 1
                """, (reserve_split_cents, reserve_split_cents, now_ts))

                # 4. Deactivate old active ads for this slot
                cur.execute("""
                    UPDATE cbm_sponsored_ads
                    SET status = 'EXPIRED'
                    WHERE slot_id = ? AND status = 'ACTIVE' AND (is_official IS NULL OR is_official = 0)
                """, (slot_id,))

                # 5. Insert new active sponsored ad
                cur.execute("""
                    INSERT INTO cbm_sponsored_ads (
                        ad_id, slot_id, owner_account, title, tagline, target_url, badge_text,
                        image_url, image_width, image_height, is_official, priority,
                        impressions, clicks, expires_at, created_at, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, 'ACTIVE')
                """, (ad_id, slot_id, buyer_account, clean_title, clean_tagline, clean_url, clean_badge, clean_image, image_width, image_height, lease_end_ts, now_ts))

                # 6. Update slot lease status
                cur.execute("""
                    UPDATE cbm_sponsorship_slots
                    SET active_sponsor_account = ?, lease_start_ts = ?, lease_end_ts = ?, is_available = 0, updated_at = ?
                    WHERE slot_id = ?
                """, (buyer_account, now_ts, lease_end_ts, now_ts, slot_id))
        except Exception as e:
            return False, f"Failed to execute lease transaction: {e}", None

        # 7. Mirror mutations to Supabase for multi-instance persistent synchronization
        try:
            now_iso = self._format_iso(now_ts)
            end_iso = self._format_iso(lease_end_ts)

            # Replicate buyer balance
            self._enqueue_sb_task(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{buyer_account}",
                body={"deposited_cents": new_bal_cents, "updated_at": now_iso}
            )

            # Replicate ledger entry
            self._enqueue_sb_task(
                "cbm_ledger",
                method="POST",
                body={
                    "account_name": buyer_account,
                    "entry_type": "SPONSORSHIP_LEASE",
                    "amount_cents": -price_cents,
                    "balance_after_cents": new_bal_cents,
                    "tx_hash": tx_hash,
                    "notes": f"Booked {duration_days}-day lease for {slot['name']}",
                    "created_at": now_iso
                }
            )

            # Replicate treasury reserves
            cur_tr = self.get_treasury()
            self._enqueue_sb_task(
                "cbm_treasury",
                method="PATCH",
                params="?id=eq.1",
                body={
                    "bank_reserves_cents": cur_tr.get("bank_reserves_cents", 0),
                    "unencumbered_capital_cents": cur_tr.get("unencumbered_capital_cents", 0),
                    "updated_at": now_iso
                }
            )

            # Deactivate previous active ads for this slot in Supabase
            self._enqueue_sb_task(
                "cbm_sponsored_ads",
                method="PATCH",
                params=f"?slot_id=eq.{slot_id}&status=eq.ACTIVE&is_official=eq.false",
                body={"status": "EXPIRED"}
            )

            # Replicate new active sponsored ad in Supabase
            self._enqueue_sb_task(
                "cbm_sponsored_ads",
                method="POST",
                body={
                    "ad_id": ad_id,
                    "slot_id": slot_id,
                    "owner_account": buyer_account,
                    "title": clean_title,
                    "tagline": clean_tagline,
                    "target_url": clean_url,
                    "badge_text": clean_badge,
                    "image_url": clean_image,
                    "image_width": image_width,
                    "image_height": image_height,
                    "is_official": False,
                    "priority": 0,
                    "impressions": 0,
                    "clicks": 0,
                    "expires_at": end_iso,
                    "created_at": now_iso,
                    "status": "ACTIVE"
                }
            )

            # Replicate slot lease status in Supabase
            self._enqueue_sb_task(
                "cbm_sponsorship_slots",
                method="PATCH",
                params=f"?slot_id=eq.{slot_id}",
                body={
                    "active_sponsor_account": buyer_account,
                    "lease_start_ts": now_iso,
                    "lease_end_ts": end_iso,
                    "is_available": False,
                    "updated_at": now_iso
                }
            )
        except Exception as sb_sync_err:
            print(f"[!] Warning: Non-fatal Supabase sync failure on sponsorship purchase: {sb_sync_err}")

        ad_record = {
            "ad_id": ad_id,
            "slot_id": slot_id,
            "owner_account": buyer_account,
            "title": clean_title,
            "tagline": clean_tagline,
            "target_url": clean_url,
            "badge_text": clean_badge,
            "image_url": clean_image,
            "image_width": image_width,
            "image_height": image_height,
            "price_gold": round(price_cents / 100.0, 2),
            "reserve_share_gold": round(reserve_split_cents / 100.0, 2),
            "referral_pool_share_gold": round(referral_split_cents / 100.0, 2),
            "lease_start_ts": now_ts,
            "lease_end_ts": lease_end_ts,
            "duration_days": duration_days,
            "status": "ACTIVE"
        }
        return True, "Sponsorship slot leased successfully. Ad is now live.", ad_record

    def get_active_ad_for_slot(self, slot_id: str, include_official: bool = False) -> Optional[Dict[str, Any]]:
        """
        Fetches the live sponsored ad for a slot and atomically increments impression telemetry.
        When include_official is False, strictly returns paid member/merchant sponsor ads.
        """
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        now_ts = time.time()
        official_filter = "" if include_official else " AND (is_official IS NULL OR is_official = 0)"
        cur.execute(f"""
            SELECT ad_id, slot_id, owner_account, title, tagline, target_url, badge_text,
                   image_url, image_width, image_height, is_official, priority,
                   impressions, clicks, expires_at, created_at
            FROM cbm_sponsored_ads
            WHERE slot_id = ? AND status = 'ACTIVE' AND expires_at > ? {official_filter}
            ORDER BY created_at DESC LIMIT 1
        """, (slot_id, now_ts))
        row = cur.fetchone()
        if not row:
            return None

        ad_id = row[0]
        # Atomic impression increment
        try:
            with self.write_transaction() as (w_conn, w_cur):
                w_cur.execute("UPDATE cbm_sponsored_ads SET impressions = impressions + 1 WHERE ad_id = ?", (ad_id,))
        except Exception:
            pass

        return {
            "ad_id": row[0],
            "slot_id": row[1],
            "owner_account": row[2],
            "title": row[3],
            "tagline": row[4],
            "target_url": row[5],
            "badge_text": row[6],
            "image_url": row[7],
            "image_width": row[8],
            "image_height": row[9],
            "is_official": bool(row[10]),
            "priority": row[11],
            "impressions": row[12] + 1,
            "clicks": row[13],
            "expires_at": row[14],
            "created_at": row[15]
        }

    def get_official_cbm_ad(self, slot_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches an active official CBM campaign for external third-party delivery.
        Official CBM ads are strictly served off-site and never on cbm.wispbyte.org.
        """
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        now_ts = time.time()
        cur.execute("""
            SELECT ad_id, slot_id, owner_account, title, tagline, target_url, badge_text,
                   image_url, image_width, image_height, is_official, priority,
                   impressions, clicks, expires_at, created_at
            FROM cbm_sponsored_ads
            WHERE slot_id = ? AND status = 'ACTIVE' AND is_official = 1 AND expires_at > ?
            ORDER BY priority DESC, created_at DESC LIMIT 1
        """, (slot_id, now_ts))
        row = cur.fetchone()
        if not row:
            return None

        ad_id = row[0]
        try:
            with self.write_transaction() as (w_conn, w_cur):
                w_cur.execute("UPDATE cbm_sponsored_ads SET impressions = impressions + 1 WHERE ad_id = ?", (ad_id,))
        except Exception:
            pass

        return {
            "ad_id": row[0],
            "slot_id": row[1],
            "owner_account": row[2],
            "title": row[3],
            "tagline": row[4],
            "target_url": row[5],
            "badge_text": row[6],
            "image_url": row[7],
            "image_width": row[8],
            "image_height": row[9],
            "is_official": bool(row[10]),
            "priority": row[11],
            "impressions": row[12] + 1,
            "clicks": row[13],
            "expires_at": row[14],
            "created_at": row[15]
        }

    def record_ad_click(self, ad_id: str) -> bool:
        """Atomically increments the click counter for a sponsored ad."""
        try:
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("UPDATE cbm_sponsored_ads SET clicks = clicks + 1 WHERE ad_id = ?", (ad_id,))
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False

    def update_sponsorship_slot_price(self, slot_id: str, new_price_cents: int) -> bool:
        """Dynamically updates floor price of a sponsorship slot based on liquidity index."""
        try:
            conn = self.get_write_connection()
            cur = conn.cursor()
            cur.execute("""
                UPDATE cbm_sponsorship_slots
                SET current_price_cents = ?, updated_at = ?
                WHERE slot_id = ?
            """, (new_price_cents, time.time(), slot_id))
            conn.commit()
            conn.close()
            return True
        except Exception:
            return False

    def get_ad_publisher(self, publisher_id_or_account: str) -> Optional[Dict[str, Any]]:
        """Retrieves external ad publisher by ID or publisher_account."""
        if not publisher_id_or_account:
            return None
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        if str(publisher_id_or_account).isdigit():
            cur.execute("""
                SELECT id, publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, is_active
                FROM cbm_ad_publishers WHERE id = ? OR publisher_account = ?
            """, (int(publisher_id_or_account), str(publisher_id_or_account)))
        else:
            cur.execute("""
                SELECT id, publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, is_active
                FROM cbm_ad_publishers WHERE publisher_account = ?
            """, (str(publisher_id_or_account),))
        row = cur.fetchone()
        if not row:
            return None
        return {
            "id": row[0],
            "publisher_id": str(row[0]),
            "publisher_account": row[1],
            "app_name": row[2],
            "total_impressions": row[3],
            "total_clicks": row[4],
            "total_onboarded_members": row[5],
            "total_gold_earned": row[6],
            "is_active": bool(row[7])
        }

    def get_or_create_ad_publisher(self, publisher_account: str, app_name: str = "External App") -> Dict[str, Any]:
        """Retrieves or registers an external publisher for the Ad Partner & Earn program."""
        conn = self.get_write_connection()
        cur = conn.cursor()
        now_ts = time.time()
        cur.execute("SELECT id, publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, is_active FROM cbm_ad_publishers WHERE publisher_account = ?", (publisher_account,))
        row = cur.fetchone()
        if row:
            conn.close()
            return {
                "id": row[0],
                "publisher_id": str(row[0]),
                "publisher_account": row[1],
                "app_name": row[2],
                "total_impressions": row[3],
                "total_clicks": row[4],
                "total_onboarded_members": row[5],
                "total_gold_earned": row[6],
                "is_active": bool(row[7])
            }

        cur.execute("""
            INSERT INTO cbm_ad_publishers (publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, is_active, created_at, updated_at)
            VALUES (?, ?, 0, 0, 0, 0.0, 1, ?, ?)
        """, (publisher_account, app_name, now_ts, now_ts))
        conn.commit()
        pub_id = cur.lastrowid
        conn.close()
        return {
            "id": pub_id,
            "publisher_id": str(pub_id),
            "publisher_account": publisher_account,
            "app_name": app_name,
            "total_impressions": 0,
            "total_clicks": 0,
            "total_onboarded_members": 0,
            "total_gold_earned": 0.0,
            "is_active": True
        }

    def record_publisher_impression(self, publisher_account: str) -> bool:
        """Buffers an impression in-memory to prevent SQLite lock contention on high-frequency serve endpoints."""
        if not publisher_account:
            return False
        with _PENDING_IMPRESSIONS_LOCK:
            _PENDING_IMPRESSIONS[publisher_account] = _PENDING_IMPRESSIONS.get(publisher_account, 0) + 1
        return True

    def record_publisher_click(self, publisher_account: str) -> bool:
        """Increments click counter for an external ad publisher."""
        try:
            now_ts = time.time()
            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    INSERT INTO cbm_ad_publishers (publisher_account, app_name, total_impressions, total_clicks, total_onboarded_members, total_gold_earned, created_at, updated_at)
                    VALUES (?, 'External App', 0, 1, 0, 0.0, ?, ?)
                    ON CONFLICT(publisher_account) DO UPDATE SET
                        total_clicks = total_clicks + 1,
                        updated_at = excluded.updated_at
                """, (publisher_account, now_ts, now_ts))
            return True
        except Exception:
            return False

    def is_account_whitelisted(self, account_name: str) -> bool:
        """Returns True if the given account is active in the chat whitelist."""
        if not account_name:
            return False
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT is_active FROM cbm_chat_whitelist WHERE account_name = ? COLLATE NOCASE", (account_name.strip(),))
        row = cur.fetchone()
        return bool(row and row[0] == 1)

    def add_to_chat_whitelist(self, account_name: str, added_by: str, notes: str = "") -> Tuple[bool, str]:
        """Adds or reactivates an account on the chat whitelist."""
        if not account_name or not account_name.strip():
            return False, "Invalid account name."
        clean_acc = account_name.strip()
        now_ts = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_chat_whitelist (account_name, added_by, is_active, notes, created_at, updated_at)
                VALUES (?, ?, 1, ?, ?, ?)
                ON CONFLICT(account_name) DO UPDATE SET
                    is_active = 1,
                    added_by = excluded.added_by,
                    notes = excluded.notes,
                    updated_at = excluded.updated_at
            """, (clean_acc, added_by, notes, now_ts, now_ts))
            conn.commit()
            conn.close()
            return True, f"Account '{clean_acc}' successfully whitelisted."
        except Exception as e:
            conn.rollback()
            conn.close()
            return False, str(e)

    def remove_from_chat_whitelist(self, account_name: str) -> Tuple[bool, str]:
        """Deactivates an account from the chat whitelist."""
        if not account_name or not account_name.strip():
            return False, "Invalid account name."
        clean_acc = account_name.strip()
        now_ts = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                UPDATE cbm_chat_whitelist
                SET is_active = 0, updated_at = ?
                WHERE account_name = ? COLLATE NOCASE
            """, (now_ts, clean_acc))
            conn.commit()
            conn.close()
            return True, f"Account '{clean_acc}' removed from whitelist."
        except Exception as e:
            conn.rollback()
            conn.close()
            return False, str(e)

    def get_chat_whitelist(self) -> List[Dict[str, Any]]:
        """Returns all entries in the chat whitelist."""
        conn = self.get_write_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, account_name, added_by, is_active, notes, created_at, updated_at FROM cbm_chat_whitelist ORDER BY id ASC")
        rows = cur.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "account_name": r[1],
                "added_by": r[2],
                "is_active": bool(r[3]),
                "notes": r[4] or "",
                "created_at": r[5],
                "updated_at": r[6]
            }
            for r in rows
        ]

    def find_account_by_oidc(self, provider: str, provider_sub: str) -> Optional[Dict[str, Any]]:
        """Resolves local CBM account linked to the external OIDC (provider, sub) pair."""
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT a.* FROM cbm_accounts a
            JOIN cbm_user_identities i ON a.account_name = i.account_name
            WHERE i.provider = ? AND i.provider_sub = ?
            LIMIT 1
        """, (str(provider).lower(), str(provider_sub)))
        row = cur.fetchone()
        if row:
            return dict(row)

        # Fallback query directly against Supabase if enabled
        if getattr(self, "use_supabase", False):
            try:
                st, res = self._sb_request(
                    "cbm_user_identities",
                    method="GET",
                    params=f"?provider=eq.{str(provider).lower()}&provider_sub=eq.{str(provider_sub)}&select=account_name&limit=1"
                )
                if st == 200 and res and len(res) > 0:
                    matched_acc = res[0].get("account_name")
                    if matched_acc:
                        return self.get_account(matched_acc)
            except Exception:
                pass

        return None

    def get_account_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Look up a local CBM account by verified email."""
        if not email:
            return None
        email_clean = str(email).strip().lower()
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        
        # 1. Check in cbm_accounts directly
        cur.execute("SELECT * FROM cbm_accounts WHERE LOWER(email) = ? LIMIT 1", (email_clean,))
        row = cur.fetchone()
        if row:
            return dict(row)

        # 2. Check in cbm_user_identities with email_verified = 1
        cur.execute("""
            SELECT a.* FROM cbm_accounts a
            JOIN cbm_user_identities i ON a.account_name = i.account_name
            WHERE LOWER(i.email) = ? AND i.email_verified = 1
            LIMIT 1
        """, (email_clean,))
        row2 = cur.fetchone()
        if row2:
            return dict(row2)

        return None

    def link_oidc_identity(
        self,
        account_name: str,
        provider: str,
        provider_sub: str,
        email: Optional[str] = None,
        email_verified: bool = False,
        username: Optional[str] = None,
        display_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        profile_data: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """Binds or updates a verified external OIDC identity to a local CBM account."""
        clean_acc = (account_name or "").strip()
        if not clean_acc:
            return False, "Invalid account name."

        prov_clean = str(provider).lower().strip()
        sub_clean = str(provider_sub).strip()
        if not prov_clean or not sub_clean:
            return False, "Invalid provider or provider_sub."

        profile_obj = dict(profile_data or {})
        if username:
            profile_obj["username"] = username
        if display_name:
            profile_obj["display_name"] = display_name
        if avatar_url:
            profile_obj["avatar_url"] = avatar_url

        now = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            # Check if this external identity is already linked
            cur.execute("SELECT account_name FROM cbm_user_identities WHERE provider = ? AND provider_sub = ?", (prov_clean, sub_clean))
            existing = cur.fetchone()
            if existing:
                if existing[0].lower() != clean_acc.lower():
                    conn.close()
                    return False, f"External identity is already linked to a different local account ({existing[0]})."
                # Update existing link
                cur.execute("""
                    UPDATE cbm_user_identities
                    SET email = ?, email_verified = ?, profile_data = ?, updated_at = ?
                    WHERE provider = ? AND provider_sub = ?
                """, (email, 1 if email_verified else 0, json.dumps(profile_obj), now, prov_clean, sub_clean))
                conn.commit()
                conn.close()
                return True, "External identity refreshed successfully."

            # Verify local account exists
            cur.execute("SELECT account_name, avatar_url, email FROM cbm_accounts WHERE account_name = ? COLLATE NOCASE", (clean_acc,))
            acc_row = cur.fetchone()
            if not acc_row:
                conn.close()
                return False, f"Local account '{clean_acc}' does not exist."

            # Insert new identity link
            cur.execute("""
                INSERT INTO cbm_user_identities (
                    account_name, provider, provider_sub, email,
                    email_verified, profile_data, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                clean_acc, prov_clean, sub_clean, email,
                1 if email_verified else 0, json.dumps(profile_obj), now, now
            ))

            # Populate account avatar or email if currently blank
            updates = []
            vals = []
            if avatar_url and (not acc_row[1] or acc_row[1] == "/cbm-logo.png"):
                updates.append("avatar_url = ?")
                vals.append(avatar_url)
            if email and (len(acc_row) > 2 and not acc_row[2]):
                updates.append("email = ?")
                vals.append(email)
            if updates:
                vals.append(clean_acc)
                cur.execute(f"UPDATE cbm_accounts SET {', '.join(updates)} WHERE account_name = ? COLLATE NOCASE", vals)

            conn.commit()

            if getattr(self, "use_supabase", False):
                self._enqueue_sb_task(
                    "cbm_user_identities",
                    method="POST",
                    body={
                        "account_name": clean_acc,
                        "provider": prov_clean,
                        "provider_sub": sub_clean,
                        "email": email,
                        "email_verified": bool(email_verified),
                        "profile_data": profile_obj
                    }
                )

            conn.close()
            return True, "External identity linked successfully."
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            conn.close()
            return False, f"Failed to link identity: {e}"

    def get_linked_oidc_identities(self, account_name: str) -> List[Dict[str, Any]]:
        """Returns all external OIDC / OAuth2 identities linked to an account."""
        clean_acc = (account_name or "").strip()
        if not clean_acc:
            return []

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT id, account_name, provider, provider_sub, email, email_verified, profile_data, created_at, updated_at
            FROM cbm_user_identities
            WHERE account_name = ? COLLATE NOCASE
            ORDER BY created_at ASC
        """, (clean_acc,))
        rows = cur.fetchall()
        identities = []
        for r in rows:
            prof = {}
            if r["profile_data"]:
                try:
                    prof = json.loads(r["profile_data"])
                except Exception:
                    pass
            identities.append({
                "id": r["id"],
                "account_name": r["account_name"],
                "provider": r["provider"],
                "provider_sub": r["provider_sub"],
                "email": r["email"],
                "email_verified": bool(r["email_verified"]),
                "username": prof.get("username"),
                "display_name": prof.get("display_name"),
                "avatar_url": prof.get("avatar_url"),
                "created_at": r["created_at"],
                "updated_at": r["updated_at"]
            })
        return identities

    def unlink_oidc_identity(self, account_name: str, provider: str) -> Tuple[bool, str]:
        """Unlinks an external identity from an account."""
        clean_acc = (account_name or "").strip()
        prov_clean = str(provider).lower().strip()
        if not clean_acc or not prov_clean:
            return False, "Invalid account or provider."

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT id FROM cbm_user_identities
                WHERE account_name = ? COLLATE NOCASE AND provider = ?
            """, (clean_acc, prov_clean))
            row = cur.fetchone()
            if not row:
                conn.close()
                return False, f"No linked identity found for provider '{prov_clean}'."

            cur.execute("""
                DELETE FROM cbm_user_identities
                WHERE account_name = ? COLLATE NOCASE AND provider = ?
            """, (clean_acc, prov_clean))
            conn.commit()

            if getattr(self, "use_supabase", False):
                self._enqueue_sb_task(
                    "cbm_user_identities",
                    method="DELETE",
                    params=f"?account_name=ilike.{urllib.parse.quote(clean_acc)}&provider=eq.{prov_clean}"
                )

            conn.close()
            return True, f"Successfully unlinked {prov_clean.capitalize()} identity."
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            conn.close()
            return False, f"Failed to unlink identity: {e}"

    # -------------------------------------------------------------------------
    # Authoritative OAuth 2.0 / OIDC Provider Operations
    # -------------------------------------------------------------------------

    def create_oauth_client(
        self,
        owner_account: str,
        client_name: str,
        redirect_uris: List[str],
        client_type: str = "confidential",
        allowed_scopes: str = "openid profile email",
        logo_url: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any], str]:
        """
        Registers a new third-party OAuth 2.0 / OIDC client application.
        Returns (success, client_record, message).
        For confidential clients, raw client_secret is returned ONLY once here.
        """
        clean_owner = (owner_account or "").strip()
        clean_name = (client_name or "").strip()
        if not clean_owner or not clean_name:
            return False, {}, "Owner account and client application name are required."

        if not isinstance(redirect_uris, list) or len(redirect_uris) == 0:
            return False, {}, "At least one valid redirect URI is required."

        for uri in redirect_uris:
            parsed = urllib.parse.urlparse(uri)
            if not parsed.scheme or not parsed.netloc:
                return False, {}, f"Invalid redirect URI format: {uri}"

        client_id = f"cbm_client_{secrets.token_hex(12)}"
        client_type = "public" if client_type.lower() == "public" else "confidential"
        raw_secret = None
        secret_hash = None

        if client_type == "confidential":
            raw_secret = f"cbm_sec_{secrets.token_urlsafe(32)}"
            secret_hash = hashlib.sha256(raw_secret.encode("utf-8")).hexdigest()

        now = time.time()
        uris_json = json.dumps(redirect_uris)

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_oauth_clients (
                    client_id, client_secret_hash, client_name, owner_account,
                    redirect_uris, allowed_scopes, client_type, logo_url,
                    is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (
                client_id, secret_hash, clean_name, clean_owner,
                uris_json, allowed_scopes, client_type, logo_url,
                now, now
            ))
            conn.commit()

            if getattr(self, "use_supabase", False):
                self._enqueue_sb_task(
                    "cbm_oauth_clients",
                    method="POST",
                    body={
                        "client_id": client_id,
                        "client_secret_hash": secret_hash,
                        "client_name": clean_name,
                        "owner_account": clean_owner,
                        "redirect_uris": redirect_uris,
                        "allowed_scopes": allowed_scopes,
                        "client_type": client_type,
                        "logo_url": logo_url,
                        "is_active": True
                    }
                )

            client_record = {
                "client_id": client_id,
                "client_name": clean_name,
                "owner_account": clean_owner,
                "client_type": client_type,
                "client_secret": raw_secret,
                "redirect_uris": redirect_uris,
                "allowed_scopes": allowed_scopes,
                "logo_url": logo_url,
                "is_active": True,
                "created_at": now
            }
            return True, client_record, "OAuth client registered successfully."
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            return False, {}, f"Failed to register OAuth client: {e}"
        finally:
            conn.close()

    def get_oauth_client(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves active OAuth client application by client_id."""
        clean_id = (client_id or "").strip()
        if not clean_id:
            return None

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM cbm_oauth_clients
            WHERE client_id = ? AND is_active = 1
            LIMIT 1
        """, (clean_id,))
        row = cur.fetchone()
        if not row:
            return None

        client = dict(row)
        try:
            client["redirect_uris"] = json.loads(client.get("redirect_uris") or "[]")
        except Exception:
            client["redirect_uris"] = []
        return client

    def list_oauth_clients_by_owner(self, owner_account: str) -> List[Dict[str, Any]]:
        """Lists all OAuth client applications created by an account."""
        clean_owner = (owner_account or "").strip()
        if not clean_owner:
            return []

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT client_id, client_name, owner_account, redirect_uris, allowed_scopes,
                   client_type, logo_url, is_active, created_at, updated_at
            FROM cbm_oauth_clients
            WHERE owner_account = ? COLLATE NOCASE
            ORDER BY created_at DESC
        """, (clean_owner,))
        rows = cur.fetchall()
        clients = []
        for r in rows:
            c = dict(r)
            try:
                c["redirect_uris"] = json.loads(c.get("redirect_uris") or "[]")
            except Exception:
                c["redirect_uris"] = []
            clients.append(c)
        return clients

    def verify_oauth_client_secret(self, client_id: str, client_secret: Optional[str]) -> bool:
        """Verifies confidential client credentials."""
        client = self.get_oauth_client(client_id)
        if not client:
            return False
        if client.get("client_type") == "public":
            return True
        if not client_secret:
            return False

        expected_hash = client.get("client_secret_hash")
        if not expected_hash:
            return False

        computed_hash = hashlib.sha256(client_secret.strip().encode("utf-8")).hexdigest()
        return hmac.compare_digest(computed_hash, expected_hash)

    def create_oauth_code(
        self,
        client_id: str,
        account_name: str,
        redirect_uri: str,
        scope: str = "openid profile",
        code_challenge: str = "",
        code_challenge_method: str = "S256",
        nonce: Optional[str] = None,
        ttl_seconds: int = 300
    ) -> Tuple[bool, str]:
        """
        Creates a single-use authorization code bound to PKCE and client redirect URI.
        Returns (success, raw_code).
        """
        raw_code = f"cbm_code_{secrets.token_urlsafe(32)}"
        code_hash = hashlib.sha256(raw_code.encode("utf-8")).hexdigest()
        now = time.time()
        expires_at = now + ttl_seconds

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_oauth_codes (
                    code_hash, client_id, account_name, redirect_uri,
                    scope, code_challenge, code_challenge_method, nonce,
                    expires_at, used_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
            """, (
                code_hash, client_id, account_name, redirect_uri,
                scope, code_challenge or "", code_challenge_method or "S256",
                nonce, expires_at
            ))
            conn.commit()
            return True, raw_code
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            return False, f"Failed to issue authorization code: {e}"
        finally:
            conn.close()

    def consume_oauth_code(
        self,
        raw_code: str,
        client_id: str,
        redirect_uri: str
    ) -> Optional[Dict[str, Any]]:
        """
        Atomically consumes an authorization code, ensuring single-use and validity.
        Returns the code record dict if valid, else None.
        """
        if not raw_code:
            return None

        code_hash = hashlib.sha256(raw_code.strip().encode("utf-8")).hexdigest()
        now = time.time()

        try:
            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    SELECT * FROM cbm_oauth_codes
                    WHERE code_hash = ? AND client_id = ? AND used_at IS NULL AND expires_at > ?
                """, (code_hash, client_id, now))
                row = cur.fetchone()
                if not row:
                    return None

                col_names = [d[0] for d in cur.description] if cur.description else []
                rec = dict(zip(col_names, row))
                if rec.get("redirect_uri") != redirect_uri:
                    return None

                cur.execute("UPDATE cbm_oauth_codes SET used_at = ? WHERE code_hash = ?", (now, code_hash))
                return rec
        except Exception:
            return None

    def create_oauth_tokens(
        self,
        client_id: str,
        account_name: str,
        scope: str = "openid profile",
        access_ttl: int = 3600
    ) -> Tuple[str, int]:
        """
        Issues an OAuth 2.0 access token for an authenticated user and client.
        Returns (raw_access_token, expires_in).
        """
        raw_token = f"cbm_at_{secrets.token_urlsafe(36)}"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        now = time.time()
        expires_at = now + access_ttl

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_oauth_tokens (
                    token_hash, token_type, client_id, account_name,
                    scope, expires_at, is_revoked, created_at
                ) VALUES (?, 'access', ?, ?, ?, ?, 0, ?)
            """, (token_hash, client_id, account_name, scope, expires_at, now))
            conn.commit()
            return raw_token, access_ttl
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
        finally:
            conn.close()

    def verify_oauth_access_token(self, raw_token: str) -> Optional[Dict[str, Any]]:
        """Validates OAuth access token and returns payload if active and unexpired."""
        if not raw_token or not raw_token.startswith("cbm_at_"):
            return None

        token_hash = hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()
        now = time.time()

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT token_hash, token_type, client_id, account_name, scope, expires_at, created_at
            FROM cbm_oauth_tokens
            WHERE token_hash = ? AND is_revoked = 0 AND expires_at > ?
            LIMIT 1
        """, (token_hash, now))
        row = cur.fetchone()
        return dict(row) if row else None

    # =========================================================================
    # AI Chat Session Memory & Lifecycle Management
    # =========================================================================

    def create_ai_session(
        self,
        owner_account: str,
        title: Optional[str] = None,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        max_context_turns: int = 20,
        temperature: float = 0.7,
        ttl_seconds: int = 3600,
        key_id: Optional[str] = None,
        session_id: Optional[str] = None,
        max_turns: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates a new AI chat session with TTL and expiration timestamp."""
        sess_id = (session_id or f"cbm_sess_{uuid.uuid4().hex}").strip()
        now = time.time()
        ttl = max(1, min(int(ttl_seconds or 3600), 604800))  # 1 sec to 7 days
        expires_at = now + ttl
        clean_title = (title or "New Chat").strip()[:255]
        target_model = (model or "nvidia/nemotron-3-ultra-550b-a55b").strip()
        effective_turns = max_turns if max_turns is not None else max_context_turns
        clamped_turns = max(1, min(int(effective_turns or 20), 100))
        clamped_temp = max(0.0, min(float(temperature if temperature is not None else 0.7), 2.0))

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO cbm_ai_sessions (
                    session_id, owner_account, key_id, title, system_prompt,
                    model, max_context_turns, temperature, ttl_seconds,
                    total_turns, total_tokens_used, is_archived,
                    created_at, updated_at, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?)
            """, (
                sess_id, owner_account.strip(), key_id.strip() if key_id else None,
                clean_title, system_prompt, target_model, clamped_turns, clamped_temp, ttl,
                now, now, expires_at
            ))
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
        finally:
            conn.close()

        return {
            "session_id": sess_id,
            "owner_account": owner_account.strip(),
            "key_id": key_id.strip() if key_id else None,
            "title": clean_title,
            "system_prompt": system_prompt,
            "model": target_model,
            "max_context_turns": clamped_turns,
            "temperature": clamped_temp,
            "ttl_seconds": ttl,
            "total_turns": 0,
            "total_tokens_used": 0,
            "created_at": now,
            "updated_at": now,
            "expires_at": expires_at
        }

    def get_ai_session(
        self,
        session_id: str,
        owner_account: Optional[str] = None,
        touch: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves active AI chat session.
        If expired, immediately deletes it and returns None.
        If touch=True and active, extends expires_at by ttl_seconds.
        """
        if not session_id:
            return None

        clean_id = session_id.strip()
        now = time.time()

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        if owner_account:
            cur.execute("""
                SELECT * FROM cbm_ai_sessions
                WHERE session_id = ? AND owner_account = ? AND is_archived = 0
                LIMIT 1
            """, (clean_id, owner_account.strip()))
        else:
            cur.execute("""
                SELECT * FROM cbm_ai_sessions
                WHERE session_id = ? AND is_archived = 0
                LIMIT 1
            """, (clean_id,))
        row = cur.fetchone()
        if not row:
            return None

        sess = dict(row)

        # Check expiration
        if sess["expires_at"] <= now:
            self.delete_ai_session(clean_id)
            return None

        if touch:
            new_expiry = now + float(sess.get("ttl_seconds", 3600))
            wconn = self.get_write_connection()
            try:
                wcur = wconn.cursor()
                wcur.execute("""
                    UPDATE cbm_ai_sessions
                    SET updated_at = ?, expires_at = ?
                    WHERE session_id = ?
                """, (now, new_expiry, clean_id))
                wconn.commit()
                sess["updated_at"] = now
                sess["expires_at"] = new_expiry
            except Exception:
                try:
                    wconn.rollback()
                except Exception:
                    pass
            finally:
                wconn.close()

        return sess

    def list_ai_sessions(
        self,
        owner_account: str,
        key_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Lists active AI sessions for an account, pruning expired sessions opportunistically."""
        if not owner_account:
            return []

        now = time.time()
        clean_acc = owner_account.strip()

        # Opportunistic prune of expired sessions
        self.prune_expired_ai_sessions()

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        params = [clean_acc, now]
        query = """
            SELECT session_id, owner_account, key_id, title, system_prompt,
                   model, max_context_turns, temperature, ttl_seconds,
                   total_turns, total_tokens_used, created_at, updated_at, expires_at
            FROM cbm_ai_sessions
            WHERE owner_account = ? AND expires_at > ? AND is_archived = 0
        """
        if key_id:
            query += " AND (key_id = ? OR key_id IS NULL)"
            params.append(key_id.strip())

        query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
        params.extend([max(1, min(int(limit), 100)), max(0, int(offset))])

        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def update_ai_session(
        self,
        session_id: str,
        owner_account: Optional[str] = None,
        title: Optional[str] = None,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        max_context_turns: Optional[int] = None,
        ttl_seconds: Optional[int] = None,
        max_turns: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Updates AI session settings and refreshes expiration."""
        sess = self.get_ai_session(session_id, owner_account=owner_account, touch=False)
        if not sess:
            return False

        now = time.time()
        ttl = max(1, min(int(ttl_seconds), 604800)) if ttl_seconds is not None else sess.get("ttl_seconds", 3600)
        new_expiry = now + ttl

        updates = ["updated_at = ?", "expires_at = ?", "ttl_seconds = ?"]
        params = [now, new_expiry, ttl]

        if title is not None:
            updates.append("title = ?")
            params.append(str(title).strip()[:255])
        if system_prompt is not None:
            updates.append("system_prompt = ?")
            params.append(str(system_prompt))
        if model is not None:
            updates.append("model = ?")
            params.append(str(model).strip())
        effective_turns = max_turns if max_turns is not None else max_context_turns
        if effective_turns is not None:
            updates.append("max_context_turns = ?")
            params.append(max(1, min(int(effective_turns), 100)))

        params.append(session_id.strip())
        where_clause = "session_id = ?"
        if owner_account:
            where_clause += " AND owner_account = ?"
            params.append(owner_account.strip())

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute(f"UPDATE cbm_ai_sessions SET {', '.join(updates)} WHERE {where_clause}", tuple(params))
            conn.commit()
            return cur.rowcount > 0
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            return False
        finally:
            conn.close()

    def delete_ai_session(self, session_id: str, owner_account: Optional[str] = None) -> bool:
        """Permanently purges an AI session and all associated turns via cascading deletion."""
        if not session_id:
            return False

        clean_id = session_id.strip()
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("PRAGMA foreign_keys = ON;")
            if owner_account:
                cur.execute("DELETE FROM cbm_ai_sessions WHERE session_id = ? AND owner_account = ?", (clean_id, owner_account.strip()))
            else:
                cur.execute("DELETE FROM cbm_ai_sessions WHERE session_id = ?", (clean_id,))
            deleted = cur.rowcount > 0
            cur.execute("DELETE FROM cbm_ai_session_messages WHERE session_id = ?", (clean_id,))
            conn.commit()
            return deleted
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            return False
        finally:
            conn.close()

    def clear_ai_session_messages(self, session_id: str, owner_account: Optional[str] = None) -> bool:
        """Clears all turns for a session while keeping the session alive and resetting turn count."""
        sess = self.get_ai_session(session_id, owner_account=owner_account, touch=True)
        if not sess:
            return False

        clean_id = session_id.strip()
        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM cbm_ai_session_messages WHERE session_id = ?", (clean_id,))
            cur.execute("""
                UPDATE cbm_ai_sessions
                SET total_turns = 0, total_tokens_used = 0, updated_at = ?
                WHERE session_id = ?
            """, (time.time(), clean_id))
            conn.commit()
            return True
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            return False
        finally:
            conn.close()

    def append_ai_session_message(
        self,
        session_id: str,
        role: str,
        content: str,
        reasoning_content: Optional[str] = None,
        tokens: int = 0
    ) -> Dict[str, Any]:
        """Appends a turn to the session message history and updates session metadata."""
        clean_id = session_id.strip()
        clean_role = role.strip().lower()
        msg_id = f"ai_msg_{uuid.uuid4().hex}"
        now = time.time()

        conn = self.get_write_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT total_turns, ttl_seconds FROM cbm_ai_sessions WHERE session_id = ?", (clean_id,))
            row = cur.fetchone()
            if not row:
                raise ValueError(f"AI session '{clean_id}' does not exist or has expired.")

            cur_turns, ttl = row[0], row[1]
            new_turns = cur_turns + 1
            new_expiry = now + float(ttl)

            cur.execute("""
                INSERT INTO cbm_ai_session_messages (
                    message_id, session_id, role, content, reasoning_content,
                    tokens, turn_index, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (msg_id, clean_id, clean_role, content, reasoning_content, int(tokens or 0), new_turns, now))

            cur.execute("""
                UPDATE cbm_ai_sessions
                SET total_turns = ?,
                    total_tokens_used = total_tokens_used + ?,
                    updated_at = ?,
                    expires_at = ?
                WHERE session_id = ?
            """, (new_turns, int(tokens or 0), now, new_expiry, clean_id))

            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
            raise
        finally:
            conn.close()

        return {
            "message_id": msg_id,
            "session_id": clean_id,
            "role": clean_role,
            "content": content,
            "reasoning_content": reasoning_content,
            "tokens": int(tokens or 0),
            "turn_index": new_turns,
            "created_at": now
        }

    def get_ai_session_messages(
        self,
        session_id: str,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves messages for an active session ordered chronologically."""
        if not session_id:
            return []

        clean_id = session_id.strip()
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()

        if limit:
            cur.execute("""
                SELECT message_id, session_id, role, content, reasoning_content, tokens, turn_index, created_at
                FROM cbm_ai_session_messages
                WHERE session_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            """, (clean_id, max(1, int(limit))))
            rows = cur.fetchall()
            return [dict(r) for r in reversed(rows)]
        else:
            cur.execute("""
                SELECT message_id, session_id, role, content, reasoning_content, tokens, turn_index, created_at
                FROM cbm_ai_session_messages
                WHERE session_id = ?
                ORDER BY created_at ASC
            """, (clean_id,))
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def assemble_ai_session_context(
        self,
        session_id: str,
        incoming_messages: Union[str, List[Dict[str, Any]]],
        max_turns: Optional[int] = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
        """
        Assembles a sliding-window context list for NVIDIA NIM:
        [persistent system_prompt] + [recent session turns] + [incoming messages].
        Returns (assembled_messages, session_record, new_incoming_turns).
        """
        sess = self.get_ai_session(session_id, touch=True)
        if not sess:
            raise ValueError(f"Chat session '{session_id}' not found or has expired.")

        max_history_count = (max_turns or sess.get("max_context_turns", 20)) * 2
        history_msgs = self.get_ai_session_messages(session_id, limit=max_history_count)

        assembled: List[Dict[str, Any]] = []

        # 1. Persistent System Prompt (if defined in session and not overridden)
        sys_prompt = sess.get("system_prompt")
        has_system_in_history = any(m["role"] == "system" for m in history_msgs)
        if sys_prompt and not has_system_in_history:
            assembled.append({"role": "system", "content": sys_prompt})

        # 2. Historical turns
        for m in history_msgs:
            assembled.append({
                "role": m["role"],
                "content": m["content"]
            })

        # 3. Normalize & append incoming turn
        if isinstance(incoming_messages, str):
            incoming_normalized = [{"role": "user", "content": incoming_messages.strip()}]
        elif isinstance(incoming_messages, list):
            incoming_normalized = []
            for item in incoming_messages:
                if isinstance(item, dict) and "role" in item and "content" in item:
                    incoming_normalized.append({
                        "role": str(item["role"]).strip().lower(),
                        "content": item["content"]
                    })
        else:
            incoming_normalized = []

        # Deduplicate prefix if client resent historical turns
        new_turns = incoming_normalized
        if history_msgs and incoming_normalized:
            hist_pairs = [(m["role"], m["content"]) for m in history_msgs]
            inc_pairs = [(m["role"], m["content"]) for m in incoming_normalized]
            match_len = 0
            for k in range(min(len(hist_pairs), len(inc_pairs)), 0, -1):
                if hist_pairs[-k:] == inc_pairs[:k]:
                    match_len = k
                    break
            if match_len > 0:
                new_turns = incoming_normalized[match_len:]

        assembled.extend(new_turns)
        return assembled, sess, new_turns

    def prune_expired_ai_sessions(self) -> int:
        """
        Garbage collection sweeper: permanently purges all sessions and messages
        whose expires_at timestamp has passed.
        """
        now = time.time()
        conn = self.get_write_connection()
        cur = conn.cursor()
        pruned_count = 0
        try:
            cur.execute("PRAGMA foreign_keys = ON;")
            cur.execute("SELECT session_id FROM cbm_ai_sessions WHERE expires_at < ?", (now,))
            expired_ids = [row[0] for row in cur.fetchall()]
            if expired_ids:
                cur.execute("DELETE FROM cbm_ai_sessions WHERE expires_at < ?", (now,))
                pruned_count = cur.rowcount
                placeholders = ",".join(["?"] * len(expired_ids))
                cur.execute(f"DELETE FROM cbm_ai_session_messages WHERE session_id IN ({placeholders})", tuple(expired_ids))
                conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
        finally:
            conn.close()

        return pruned_count

    # -------------------------------------------------------------------------
    # Module A: Invite-Only Registration & Multi-Inviter Settlement Engine
    # -------------------------------------------------------------------------

    def create_invite_code(self, inviter: str, max_uses: int = 1) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Creates a new cryptographically secure invite code.
        Requires deposited_cents >= max_uses * 2500 (25 Gold per use).
        Funds are not deducted upfront, but held as sponsor stake until redemption.
        """
        clean_inviter = (inviter or "").strip()
        if not clean_inviter:
            return False, "Inviter account name is required.", None

        acc = self.get_account(clean_inviter)
        if not acc:
            return False, f"Account '{clean_inviter}' not found.", None

        max_uses = max(1, int(max_uses))
        required_cents = max_uses * 2500
        deposited_cents = int(acc.get("deposited_cents", 0) or 0)
        if deposited_cents < required_cents:
            avail_gold = deposited_cents / 100.0
            req_gold = required_cents / 100.0
            return False, f"Insufficient balance to issue invite(s). Required: {req_gold:.2f} Gold, Available: {avail_gold:.2f} Gold.", None

        code_id = f"inv_{secrets.token_urlsafe(12)}"
        now = time.time()

        with self.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_invites (
                    code_id, inviter_account, max_uses, uses_count,
                    cost_per_use_cents, is_revoked, created_at, updated_at
                ) VALUES (?, ?, ?, 0, 2500, 0, ?, ?)
            """, (code_id, clean_inviter, max_uses, now, now))

        invite_record = {
            "code_id": code_id,
            "inviter_account": clean_inviter,
            "max_uses": max_uses,
            "uses_count": 0,
            "cost_per_use_cents": 2500,
            "cost_per_use_gold": 25.0,
            "is_revoked": False,
            "created_at": now,
            "updated_at": now
        }

        self._enqueue_sb_task(
            "cbm_invites",
            method="POST",
            body={
                "code_id": code_id,
                "inviter_account": clean_inviter,
                "max_uses": max_uses,
                "uses_count": 0,
                "cost_per_use_cents": 2500,
                "is_revoked": False,
                "created_at": self._format_iso(now),
                "updated_at": self._format_iso(now)
            }
        )

        return True, "Invite code generated successfully.", invite_record

    def track_invite_prospect(self, prospect_token: str, invite_code: str, client_ip_hash: Optional[str] = None) -> Tuple[bool, str, str]:
        """
        Binds a visitor's prospect token to an active invite code in cbm_invite_prospects.
        Enforces single-settlement invariant: intra-inviter duplication is strictly prohibited (409 Conflict),
        while multi-inviter tracking across distinct inviters is permitted.
        Returns: (success, message, code)
        """
        clean_token = (prospect_token or "").strip()
        clean_code = (invite_code or "").strip()
        if not clean_token or not clean_code:
            return False, "prospect_token and invite_code are required.", "bad_request"

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT code_id, inviter_account, max_uses, uses_count, is_revoked
            FROM cbm_invites
            WHERE code_id = ?
        """, (clean_code,))
        inv = cur.fetchone()
        if not inv:
            return False, "Invalid invite code.", "not_found"

        if inv["is_revoked"]:
            return False, "This invite code has been revoked by the sponsor.", "not_found"

        if inv["uses_count"] >= inv["max_uses"]:
            return False, "This invite code has reached its maximum redemptions.", "exhausted"

        inviter = inv["inviter_account"]
        cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (inviter,))
        acc_row = cur.fetchone()
        if not acc_row or (acc_row["deposited_cents"] or 0) < 2500:
            return False, "Invite code sponsor currently lacks sufficient balance (25.00 Gold required).", "insufficient_balance"

        # Check existing prospect binding for this inviter
        cur.execute("""
            SELECT invite_code FROM cbm_invite_prospects
            WHERE prospect_token = ? AND inviter_account = ?
        """, (clean_token, inviter))
        existing_binding = cur.fetchone()
        if existing_binding:
            if existing_binding["invite_code"] == clean_code:
                return True, "Invite code attached to prospect session.", "ok"
            else:
                return False, "You have already linked an invitation from this user. Only one code per inviter is valid.", "duplicate_inviter_code"

        now = time.time()
        with self.write_transaction() as (w_conn, w_cur):
            w_cur.execute("""
                INSERT INTO cbm_invite_prospects (
                    prospect_token, invite_code, inviter_account, client_ip_hash, created_at
                ) VALUES (?, ?, ?, ?, ?)
            """, (clean_token, clean_code, inviter, client_ip_hash, now))

        self._enqueue_sb_task(
            "cbm_invite_prospects",
            method="POST",
            body={
                "prospect_token": clean_token,
                "invite_code": clean_code,
                "inviter_account": inviter,
                "client_ip_hash": client_ip_hash,
                "created_at": self._format_iso(now)
            }
        )

        return True, "Invite code attached to prospect session.", "ok"

    def get_prospect_inviters(self, prospect_token: str) -> List[Dict[str, Any]]:
        """
        Returns all valid, active, funded invitations linked to this prospect token.
        """
        clean_token = (prospect_token or "").strip()
        if not clean_token:
            return []

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT p.invite_code, p.inviter_account, i.max_uses, i.uses_count, i.cost_per_use_cents, a.deposited_cents
            FROM cbm_invite_prospects p
            JOIN cbm_invites i ON p.invite_code = i.code_id
            JOIN cbm_accounts a ON i.inviter_account = a.account_name
            WHERE p.prospect_token = ?
              AND i.is_revoked = 0
              AND i.uses_count < i.max_uses
              AND a.deposited_cents >= i.cost_per_use_cents
            ORDER BY p.id ASC
        """, (clean_token,))
        return [dict(r) for r in cur.fetchall()]

    def revoke_invite_code(self, code_id: str, inviter: str) -> Tuple[bool, str]:
        """Revokes an unused invite code and releases allocation."""
        clean_code = (code_id or "").strip()
        clean_inviter = (inviter or "").strip()
        now = time.time()

        with self.write_transaction() as (conn, cur):
            cur.execute("""
                UPDATE cbm_invites
                SET is_revoked = 1, updated_at = ?
                WHERE code_id = ? AND inviter_account = ?
            """, (now, clean_code, clean_inviter))
            if cur.rowcount == 0:
                return False, "Invite code not found or unauthorized."

        self._enqueue_sb_task(
            "cbm_invites",
            method="PATCH",
            params=f"?code_id=eq.{clean_code}",
            body={"is_revoked": True, "updated_at": self._format_iso(now)}
        )
        return True, "Invite code revoked successfully."

    def list_invites(self, inviter: str) -> List[Dict[str, Any]]:
        """Lists all active and redeemed invite codes generated by an account."""
        clean_inviter = (inviter or "").strip()
        if not clean_inviter:
            return []
        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("""
            SELECT code_id, inviter_account, max_uses, uses_count, cost_per_use_cents, is_revoked, created_at, updated_at
            FROM cbm_invites
            WHERE inviter_account = ?
            ORDER BY created_at DESC
        """, (clean_inviter,))
        res = []
        for r in cur.fetchall():
            d = dict(r)
            d["cost_per_use_gold"] = d["cost_per_use_cents"] / 100.0
            d["is_revoked"] = bool(d["is_revoked"])
            res.append(d)
        return res

    def settle_invite_registration(self, prospect_token: str, new_user: str) -> Tuple[bool, str, int]:
        """
        Executes atomic multi-inviter settlement upon successful account registration:
        - Deducts 25 Gold (2,500 cents) from each qualifying inviter who referred this prospect.
        - Adds 100% of deducted amounts directly to unencumbered central bank reserves.
        - Increments invite redemption counters and appends double-entry ledger entries.
        """
        clean_token = (prospect_token or "").strip()
        clean_user = (new_user or "").strip()
        if not clean_token or not clean_user:
            return False, "prospect_token and new_user required.", 0

        valid_invites = self.get_prospect_inviters(clean_token)
        if not valid_invites:
            return False, "No valid funded invitation found for prospect.", 0

        seen_inviters = set()
        unique_settlements = []
        for item in valid_invites:
            inv = item["inviter_account"]
            if inv not in seen_inviters and inv.lower() != clean_user.lower():
                seen_inviters.add(inv)
                unique_settlements.append(item)

        if not unique_settlements:
            return False, "No valid distinct inviters found.", 0

        now = time.time()
        total_settled_cents = 0

        with self.write_transaction() as (conn, cur):
            for item in unique_settlements:
                code_id = item["invite_code"]
                inviter = item["inviter_account"]
                cost_cents = int(item["cost_per_use_cents"])

                # Deduct cost from inviter
                cur.execute("""
                    UPDATE cbm_accounts
                    SET deposited_cents = deposited_cents - ?, updated_at = ?
                    WHERE account_name = ? AND deposited_cents >= ?
                """, (cost_cents, now, inviter, cost_cents))
                if cur.rowcount == 0:
                    continue

                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (inviter,))
                bal_after = cur.fetchone()[0]

                # Increment uses_count
                cur.execute("""
                    UPDATE cbm_invites
                    SET uses_count = uses_count + 1, updated_at = ?
                    WHERE code_id = ?
                """, (now, code_id))

                # Inject 100% into Central Bank Unencumbered Reserves
                cur.execute("""
                    UPDATE cbm_treasury
                    SET bank_reserves_cents = bank_reserves_cents + ?,
                        unencumbered_capital_cents = unencumbered_capital_cents + ?,
                        last_sync_at = ?
                    WHERE id = 1
                """, (cost_cents, cost_cents, now))

                # Append double-entry ledger entry
                tx_hash = f"inv_settle_{code_id}_{int(now)}_{secrets.token_hex(3)}"
                notes = f"Invite Reserve Inflow: Sponsored registration of '{clean_user}' via {code_id}"
                cur.execute("""
                    INSERT INTO cbm_ledger (
                        account_name, entry_type, amount_cents, balance_after_cents,
                        tx_hash, notes, created_at
                    ) VALUES (?, 'INVITE_RESERVE_INFLOW', ?, ?, ?, ?, ?)
                """, (inviter, -cost_cents, bal_after, tx_hash, notes, now))

                total_settled_cents += cost_cents

                # Outbox replication
                self._enqueue_sb_task(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{inviter}",
                    body={"deposited_cents": bal_after, "updated_at": self._format_iso(now)}
                )
                self._enqueue_sb_task(
                    "cbm_invites",
                    method="PATCH",
                    params=f"?code_id=eq.{code_id}",
                    body={"uses_count": item["uses_count"] + 1, "updated_at": self._format_iso(now)}
                )
                self._enqueue_sb_task(
                    "cbm_ledger",
                    method="POST",
                    body={
                        "account_name": inviter,
                        "entry_type": "INVITE_RESERVE_INFLOW",
                        "amount_cents": -cost_cents,
                        "balance_after_cents": bal_after,
                        "tx_hash": tx_hash,
                        "notes": notes,
                        "created_at": self._format_iso(now)
                    }
                )

        if total_settled_cents == 0:
            return False, "All sponsors had insufficient funds at execution.", 0

        self.recompute_treasury()
        return True, f"Settled {total_settled_cents // 100} Gold across {len(seen_inviters)} sponsor(s).", total_settled_cents

    # -------------------------------------------------------------------------
    # Module B: CBM Plus Subscription Engine & Paywall Enforcement
    # -------------------------------------------------------------------------

    def is_cbm_plus_active(self, account_dict: Optional[Dict[str, Any]]) -> bool:
        """Evaluates whether an account holds an active CBM Plus subscription or root privilege."""
        if not account_dict:
            return False
        acc_name = (account_dict.get("account_name") or "").strip().lower()
        terri_name = (account_dict.get("primary_territorial_account") or "").strip().lower()
        if acc_name in ("b8bbq", "admin") or terri_name == "b8bbq":
            return True
        if account_dict.get("role") in ("admin", "council", "leader", "system"):
            return True
        until = account_dict.get("cbm_plus_until")
        if not until:
            return False
        if isinstance(until, (int, float)):
            return float(until) > time.time()
        try:
            clean = str(until).replace("Z", "+00:00")
            dt = datetime.datetime.fromisoformat(clean)
            return dt.timestamp() > time.time()
        except Exception:
            return False

    def check_cbm_plus(self, account_name: str) -> bool:
        """Returns True if the specified account has an active CBM Plus subscription."""
        clean = (account_name or "").strip()
        if not clean:
            return False
        acc = self.get_account(clean)
        return self.is_cbm_plus_active(acc)

    def activate_cbm_plus(self, account_name: str, months: int = 1, tx_hash: Optional[str] = None) -> Tuple[bool, str, float]:
        """Extends or activates CBM Plus subscription duration for the given account."""
        clean = (account_name or "").strip()
        if not clean:
            return False, "account_name required.", 0.0

        now = time.time()
        months = max(1, int(months))
        duration_sec = months * 30 * 86400.0

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("SELECT cbm_plus_until FROM cbm_accounts WHERE account_name = ?", (clean,))
        row = cur.fetchone()
        if not row:
            return False, f"Account '{clean}' not found.", 0.0

        current_until = row["cbm_plus_until"] or 0.0
        base_time = max(now, float(current_until))
        new_until = base_time + duration_sec

        with self.write_transaction() as (w_conn, w_cur):
            w_cur.execute("""
                UPDATE cbm_accounts
                SET cbm_plus_until = ?, updated_at = ?
                WHERE account_name = ?
            """, (new_until, now, clean))

        self._enqueue_sb_task(
            "cbm_accounts",
            method="PATCH",
            params=f"?account_name=eq.{clean}",
            body={
                "cbm_plus_until": self._format_iso(new_until),
                "updated_at": self._format_iso(now)
            }
        )

        return True, f"CBM Plus active until {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(new_until))}", new_until

    def subscribe_cbm_plus_from_balance(self, account_name: str, months: int = 1) -> Tuple[bool, str, Optional[float]]:
        """Deducts 500 Gold (50,000 cents) per month directly from balance to activate CBM Plus (free for B8bbq/admins)."""
        clean = (account_name or "").strip()
        if not clean:
            return False, "account_name required.", None

        now = time.time()
        if clean.lower() in ("b8bbq", "admin"):
            lifetime_until = 4102444800.0  # Year 2100 lifetime timestamp
            with self.write_transaction() as (conn, cur):
                cur.execute("""
                    UPDATE cbm_accounts
                    SET cbm_plus_until = ?, updated_at = ?
                    WHERE account_name = ?
                """, (lifetime_until, now, clean))
            return True, "CBM Administrator account possesses lifetime CBM Plus privileges without payment.", lifetime_until

        months = max(1, int(months))
        cost_cents = months * 50000
        tx_hash = f"sub_bal_{clean}_{int(now)}_{secrets.token_hex(3)}"
        notes = f"CBM Plus Subscription: {months} month(s) (500G/mo converted to Bank Reserves)"

        with self.write_transaction() as (conn, cur):
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = deposited_cents - ?, updated_at = ?
                WHERE account_name = ? AND deposited_cents >= ?
            """, (cost_cents, now, clean, cost_cents))
            if cur.rowcount == 0:
                cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (clean,))
                r = cur.fetchone()
                avail = (r[0] / 100.0) if r else 0.0
                return False, f"Insufficient balance. Required: {cost_cents / 100.0:.2f} Gold, Available: {avail:.2f} Gold.", None

            cur.execute("SELECT deposited_cents, cbm_plus_until FROM cbm_accounts WHERE account_name = ?", (clean,))
            acc_row = cur.fetchone()
            bal_after = acc_row[0]
            current_until = acc_row[1] or 0.0

            base_time = max(now, float(current_until))
            new_until = base_time + (months * 30 * 86400.0)

            cur.execute("""
                UPDATE cbm_accounts
                SET cbm_plus_until = ?, updated_at = ?
                WHERE account_name = ?
            """, (new_until, now, clean))

            cur.execute("""
                UPDATE cbm_treasury
                SET bank_reserves_cents = bank_reserves_cents + ?,
                    unencumbered_capital_cents = unencumbered_capital_cents + ?,
                    last_sync_at = ?
                WHERE id = 1
            """, (cost_cents, cost_cents, now))

            cur.execute("""
                INSERT INTO cbm_ledger (
                    account_name, entry_type, amount_cents, balance_after_cents,
                    tx_hash, notes, created_at
                ) VALUES (?, 'SUBSCRIPTION_CBM_PLUS', ?, ?, ?, ?, ?)
            """, (clean, -cost_cents, bal_after, tx_hash, notes, now))

        self._enqueue_sb_task(
            "cbm_accounts",
            method="PATCH",
            params=f"?account_name=eq.{clean}",
            body={
                "deposited_cents": bal_after,
                "cbm_plus_until": self._format_iso(new_until),
                "updated_at": self._format_iso(now)
            }
        )
        self._enqueue_sb_task(
            "cbm_ledger",
            method="POST",
            body={
                "account_name": clean,
                "entry_type": "SUBSCRIPTION_CBM_PLUS",
                "amount_cents": -cost_cents,
                "balance_after_cents": bal_after,
                "tx_hash": tx_hash,
                "notes": notes,
                "created_at": self._format_iso(now)
            }
        )

        self.recompute_treasury()
        return True, f"CBM Plus activated until {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(new_until))}", new_until

    def create_pending_subscription(self, account_name: str, amount_gold: float = 500.0) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Generates a 15-minute in-game transfer intent slip for CBM Plus subscription."""
        clean = (account_name or "").strip()
        acc = self.get_account(clean)
        if not acc:
            return False, f"Account '{clean}' not found.", None

        slip_id = f"sub_{secrets.token_hex(8)}"
        now = time.time()
        expires_at = now + 900.0
        gold_val = float(amount_gold or 500.0)
        cents_val = int(round(gold_val * 100))

        with self.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_pending_subscriptions (
                    id, account_name, amount_gold, amount_cents, status, created_at, expires_at
                ) VALUES (?, ?, ?, ?, 'PENDING', ?, ?)
            """, (slip_id, clean, gold_val, cents_val, now, expires_at))

        slip = {
            "id": slip_id,
            "account_name": clean,
            "amount_gold": gold_val,
            "amount_cents": cents_val,
            "status": "PENDING",
            "created_at": now,
            "expires_at": expires_at
        }

        self._enqueue_sb_task(
            "cbm_pending_subscriptions",
            method="POST",
            body={
                "id": slip_id,
                "account_name": clean,
                "amount_gold": gold_val,
                "amount_cents": cents_val,
                "status": "PENDING",
                "created_at": self._format_iso(now),
                "expires_at": self._format_iso(expires_at)
            }
        )

        return True, "Intent slip generated successfully.", slip

    def fulfill_pending_subscription(self, slip_id: str, tx_hash: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Fulfills an in-game subscription intent slip and credits CBM Plus."""
        clean_id = (slip_id or "").strip()
        now = time.time()

        conn = self._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_pending_subscriptions WHERE id = ? AND status = 'PENDING'", (clean_id,))
        row = cur.fetchone()
        if not row:
            return False, "Pending subscription not found or already fulfilled.", None

        account_name = row["account_name"]
        amount_cents = row["amount_cents"]

        with self.write_transaction() as (w_conn, w_cur):
            w_cur.execute("""
                UPDATE cbm_pending_subscriptions
                SET status = 'FULFILLED', tx_hash = ?
                WHERE id = ? AND status = 'PENDING'
            """, (tx_hash, clean_id))
            if w_cur.rowcount == 0:
                return False, "Failed to update subscription status.", None

            w_cur.execute("""
                UPDATE cbm_treasury
                SET vault_total_gold_cents = vault_total_gold_cents + ?,
                    bank_reserves_cents = bank_reserves_cents + ?,
                    unencumbered_capital_cents = unencumbered_capital_cents + ?,
                    last_sync_at = ?
                WHERE id = 1
            """, (amount_cents, amount_cents, amount_cents, now))

        self.activate_cbm_plus(account_name, months=1, tx_hash=tx_hash)
        self.recompute_treasury()

        self._enqueue_sb_task(
            "cbm_pending_subscriptions",
            method="PATCH",
            params=f"?id=eq.{clean_id}",
            body={"status": "FULFILLED", "tx_hash": tx_hash}
        )

        fulfilled = dict(row)
        fulfilled["status"] = "FULFILLED"
        fulfilled["tx_hash"] = tx_hash
        return True, "Subscription fulfilled successfully.", fulfilled

    def find_and_claim_pending_subscription(self, sender: str, amount_cents: int, tx_id: str) -> Optional[Dict[str, Any]]:
        """Matches an inbound in-game transfer against active subscription intent slips."""
        if amount_cents < 50000:
            return None

        clean_sender = (sender or "").strip()
        candidates = self._generate_name_candidates(clean_sender)
        now = time.time()

        with self.write_transaction() as (conn, cur):
            placeholders = ",".join("?" for _ in candidates)
            cur.execute(f"""
                SELECT id, account_name, amount_cents, amount_gold
                FROM cbm_pending_subscriptions
                WHERE account_name IN ({placeholders}) COLLATE NOCASE
                  AND status = 'PENDING'
                  AND expires_at >= ?
                ORDER BY created_at ASC
                LIMIT 1
            """, (*candidates, now))
            row = cur.fetchone()
            if not row:
                return None

            slip_id = row[0]
            slip_account = row[1]
            slip_cents = row[2]

            cur.execute("""
                UPDATE cbm_pending_subscriptions
                SET status = 'FULFILLED', tx_hash = ?
                WHERE id = ? AND status = 'PENDING'
            """, (tx_id, slip_id))
            if cur.rowcount == 0:
                return None

            cur.execute("""
                UPDATE cbm_treasury
                SET vault_total_gold_cents = vault_total_gold_cents + ?,
                    bank_reserves_cents = bank_reserves_cents + ?,
                    unencumbered_capital_cents = unencumbered_capital_cents + ?,
                    last_sync_at = ?
                WHERE id = 1
            """, (slip_cents, slip_cents, slip_cents, now))

            cur.execute("SELECT cbm_plus_until FROM cbm_accounts WHERE account_name = ?", (slip_account,))
            acc_row = cur.fetchone()
            current_until = acc_row[0] if acc_row and acc_row[0] else 0.0
            base_time = max(now, float(current_until))
            new_until = base_time + (30 * 86400.0)

            cur.execute("""
                UPDATE cbm_accounts
                SET cbm_plus_until = ?, updated_at = ?
                WHERE account_name = ?
            """, (new_until, now, slip_account))

        self.recompute_treasury()

        self._enqueue_sb_task(
            "cbm_pending_subscriptions",
            method="PATCH",
            params=f"?id=eq.{slip_id}",
            body={"status": "FULFILLED", "tx_hash": tx_id}
        )
        self._enqueue_sb_task(
            "cbm_accounts",
            method="PATCH",
            params=f"?account_name=eq.{slip_account}",
            body={"cbm_plus_until": self._format_iso(new_until), "updated_at": self._format_iso(now)}
        )

        return {
            "id": slip_id,
            "account_name": slip_account,
            "amount_cents": slip_cents,
            "tx_hash": tx_id,
            "cbm_plus_until": new_until
        }


