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
import sqlite3
import hashlib
import secrets
import hmac
import urllib.request
import urllib.error
import threading
from typing import Dict, Any, Optional, List, Tuple

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
    from loan_engine import CBMLoanEngine
except ImportError:
    from cbm_wispbyte.loan_engine import CBMLoanEngine

try:
    from gold_api_client import TerritorialGoldClient
except ImportError:
    from cbm_wispbyte.gold_api_client import TerritorialGoldClient

try:
    from crypto_util import encrypt_credential, decrypt_credential
except ImportError:
    from cbm_wispbyte.crypto_util import encrypt_credential, decrypt_credential

class CBMDatabase:
    def __init__(self, sqlite_path: str = "cbm_data.db", use_supabase: Optional[bool] = None, db_path: Optional[str] = None):
        target_path = db_path or sqlite_path
        
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
            if use_supabase is None:
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

        self._init_sqlite()
        if self.use_supabase and not (is_test_env and not allow_live_prod):
            try:
                self.sync_all_from_supabase(quiet=True)
            except Exception as e:
                print(f"[!] Warning on initial Supabase hydration: {e}")

    def _recover_corrupted_sqlite(self, reason: str = ""):
        """
        Self-healing quarantine: when a SQLite database file becomes corrupt or malformed,
        safely quarantines the bad file, unlinks orphaned WAL/SHM companion files,
        and allows a clean database to be re-initialized from scratch.
        """
        print(f"[!] CRITICAL: SQLite database corruption detected ({reason}). Initiating automatic quarantine and recovery...")
        
        # Close any lingering connections on this thread
        if hasattr(self, "_local") and hasattr(self._local, "conn") and self._local.conn:
            try:
                self._local.conn.close()
            except Exception:
                pass
            self._local.conn = None

        db_path = self.sqlite_path
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
        except sqlite3.DatabaseError as db_err:
            err_msg = str(db_err).lower()
            if any(k in err_msg for k in ("malformed", "corrupt", "disk image", "not a database", "file is encrypted")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                # Re-execute initialization on clean database
                self._execute_init_sqlite()
            else:
                raise

    def _execute_init_sqlite(self):
        """Initializes local SQLite schema with high-concurrency WAL mode and indexes."""
        conn = sqlite3.connect(self.sqlite_path, timeout=10.0)
        try:
            self._do_execute_init_sqlite(conn)
            conn.commit()
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
        cur.execute("PRAGMA cache_size = -8000;")
        cur.execute("PRAGMA temp_store = MEMORY;")
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
            "is_verified INTEGER DEFAULT 0"
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
                verification_type TEXT DEFAULT 'INPUT_CREDENTIALS',
                status TEXT DEFAULT 'VERIFIED',
                is_primary INTEGER DEFAULT 0,
                total_transacted_gold REAL DEFAULT 0.0,
                linked_at REAL,
                last_used_at REAL
            )
        """)
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
                account_name TEXT NOT NULL,
                amount_cents INTEGER NOT NULL,
                amount_gold REAL NOT NULL,
                message TEXT DEFAULT '',
                status TEXT DEFAULT 'PENDING',
                tx_hash TEXT,
                created_at REAL,
                expires_at REAL
            )
        """)
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
        # High-concurrency composite indexes to eliminate full-table scans
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_ledger_acc_created ON cbm_ledger(account_name, created_at DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_sender ON cbm_processed_txs(sender);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_receiver ON cbm_processed_txs(receiver);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_processed_txs_ts ON cbm_processed_txs(timestamp_ms DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_vault_snapshots_ts ON cbm_vault_snapshots(timestamp_epoch DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_api_keys_hash ON cbm_api_keys(key_hash);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_api_keys_owner ON cbm_api_keys(owner_account);")
        # Automatic zero-pollution purge on startup:
        # Ensures no test user or mock loans ever contaminate live production tables
        try:
            cur.execute("""
                DELETE FROM cbm_loans 
                WHERE LOWER(account_name) LIKE 'sectest%' 
                   OR LOWER(account_name) LIKE 'regtest%' 
                   OR LOWER(account_name) LIKE '%victim%'
                   OR LOWER(account_name) LIKE 'testapi%'
                   OR LOWER(account_name) LIKE 'testpin%'
            """)
            cur.execute("""
                DELETE FROM cbm_accounts 
                WHERE LOWER(account_name) LIKE 'sectest%' 
                   OR LOWER(account_name) LIKE 'regtest%' 
                   OR LOWER(account_name) LIKE '%victim%'
                   OR LOWER(account_name) LIKE 'testapi%'
                   OR LOWER(account_name) LIKE 'testpin%'
            """)
            cur.execute("""
                DELETE FROM cbm_payment_methods 
                WHERE LOWER(cbm_username) LIKE 'sectest%' 
                   OR LOWER(cbm_username) LIKE 'regtest%' 
                   OR LOWER(cbm_username) LIKE '%victim%'
                   OR LOWER(cbm_username) LIKE 'testapi%'
                   OR LOWER(cbm_username) LIKE 'testpin%'
            """)
            cur.execute("""
                DELETE FROM cbm_vault_snapshots 
                WHERE member_liabilities_gold >= 400 OR unencumbered_reserves_gold <= 0
            """)
            conn.commit()
        except Exception:
            pass

    def _get_sqlite_conn(self, row_factory: bool = True) -> sqlite3.Connection:
        """
        Returns a high-performance thread-local SQLite connection configured for concurrent WAL access.
        Caches and reuses connections per worker thread to eliminate repeated open/close disk overhead.
        Self-heals if corruption is detected at runtime.
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
                    if self.use_supabase:
                        try:
                            self.sync_all_from_supabase(quiet=True)
                        except Exception:
                            pass
                conn = None
            except Exception:
                conn = None

        try:
            conn = sqlite3.connect(self.sqlite_path, timeout=30.0, check_same_thread=False)
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA synchronous = NORMAL;")
            conn.execute("PRAGMA busy_timeout = 30000;")
            conn.execute("PRAGMA cache_size = -16000;")
            conn.execute("PRAGMA temp_store = MEMORY;")
            conn.execute("PRAGMA mmap_size = 67108864;")
            conn.row_factory = sqlite3.Row if row_factory else None
            self._local.conn = conn
            return conn
        except sqlite3.DatabaseError as db_err:
            if any(k in str(db_err).lower() for k in ("malformed", "corrupt", "disk image")):
                self._recover_corrupted_sqlite(reason=str(db_err))
                self._init_sqlite()
                if self.use_supabase:
                    try:
                        self.sync_all_from_supabase(quiet=True)
                    except Exception:
                        pass
                conn = sqlite3.connect(self.sqlite_path, timeout=30.0, check_same_thread=False)
                conn.execute("PRAGMA journal_mode = WAL;")
                conn.execute("PRAGMA busy_timeout = 30000;")
                conn.row_factory = sqlite3.Row if row_factory else None
                self._local.conn = conn
                return conn
            raise

    def get_write_connection(self, timeout: float = 30.0) -> sqlite3.Connection:
        """
        Returns an isolated SQLite connection configured with generous 30s busy timeout
        and WAL pragmas to prevent 'database is locked' errors during concurrent writes.
        """
        conn = sqlite3.connect(self.sqlite_path, timeout=timeout)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        conn.execute(f"PRAGMA busy_timeout = {int(timeout * 1000)};")
        return conn

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

    def sync_all_from_supabase(self, quiet: bool = False) -> Dict[str, Any]:
        """
        Comprehensive Bi-directional Synchronization:
        Hydrates local SQLite from remote Supabase (cloud source of truth) for all core tables:
        1. cbm_accounts
        2. cbm_payment_methods
        3. cbm_donations
        4. cbm_loans
        5. cbm_processed_txs
        6. cbm_ledger
        7. cbm_vault_snapshots
        8. cbm_treasury
        Ensures local zero-latency queries never suffer from desync or stale cache issues.
        """
        if not self.use_supabase:
            return {"status": "skipped", "reason": "use_supabase is False"}

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
            "api_keys": 0
        }

        try:
            conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
            cur = conn.cursor()

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

            # 1. Accounts
            st, accs = self._sb_request('cbm_accounts', 'GET', '?select=*')
            if st == 200 and isinstance(accs, list):
                for a in accs:
                    cur.execute("""
                        INSERT INTO cbm_accounts (
                            account_name, display_name, clan_tag, role, deposited_cents,
                            total_deposited_cents, total_withdrawn_cents, created_at, updated_at,
                            avatar_url, pin_hash, salt, is_verified, primary_territorial_account,
                            password_hash, password_salt
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                            updated_at = excluded.updated_at
                    """, (
                        a.get('account_name'),
                        a.get('display_name'),
                        a.get('clan_tag', 'ANTI-OG'),
                        a.get('role', 'member'),
                        int(a.get('deposited_cents') or 0),
                        int(a.get('total_deposited_cents') or 0),
                        int(a.get('total_withdrawn_cents') or 0),
                        _parse_iso(a.get('created_at')),
                        _parse_iso(a.get('updated_at')),
                        a.get('avatar_url', ''),
                        a.get('pin_hash'),
                        a.get('salt'),
                        1 if a.get('is_verified') else 0,
                        a.get('primary_territorial_account'),
                        a.get('password_hash'),
                        a.get('password_salt')
                    ))
                    stats["accounts"] += 1
                conn.commit()

            # 2. Payment Methods
            st, pms = self._sb_request('cbm_payment_methods', 'GET', '?select=*')
            if st == 200 and isinstance(pms, list):
                for p in pms:
                    cur.execute("""
                        INSERT INTO cbm_payment_methods (
                            cbm_username, territorial_account_name, territorial_password,
                            display_name, verification_type, status, is_primary,
                            total_transacted_gold, linked_at, last_used_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(territorial_account_name) DO UPDATE SET
                            cbm_username = excluded.cbm_username,
                            territorial_password = COALESCE(excluded.territorial_password, cbm_payment_methods.territorial_password),
                            display_name = excluded.display_name,
                            verification_type = excluded.verification_type,
                            status = excluded.status,
                            is_primary = excluded.is_primary,
                            total_transacted_gold = excluded.total_transacted_gold,
                            last_used_at = excluded.last_used_at
                    """, (
                        p.get('cbm_username'),
                        p.get('territorial_account_name'),
                        p.get('territorial_password', ''),
                        p.get('display_name', ''),
                        p.get('verification_type', 'INPUT_CREDENTIALS'),
                        p.get('status', 'VERIFIED'),
                        1 if p.get('is_primary') else 0,
                        float(p.get('total_transacted_gold') or 0.0),
                        _parse_iso(p.get('linked_at')),
                        _parse_iso(p.get('last_used_at'))
                    ))
                    stats["payment_methods"] += 1
                conn.commit()

            # 3. Loans
            st, loans = self._sb_request('cbm_loans', 'GET', '?select=*')
            if st == 200 and isinstance(loans, list):
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
                conn.commit()

            # 4. Donations
            st, dons = self._sb_request('cbm_donations', 'GET', '?select=*')
            if st == 200 and isinstance(dons, list):
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
                conn.commit()

            # 5. Processed Txs
            st, txs = self._sb_request('cbm_processed_txs', 'GET', '?select=*&order=timestamp_ms.desc&limit=500')
            if st == 200 and isinstance(txs, list):
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
                conn.commit()

            # 6. Ledger
            st, ledger = self._sb_request('cbm_ledger', 'GET', '?select=*&order=created_at.desc&limit=500')
            if st == 200 and isinstance(ledger, list):
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
                conn.commit()

            # 7. Vault Snapshots
            st, snaps = self._sb_request('cbm_vault_snapshots', 'GET', '?select=*&order=timestamp_epoch.desc&limit=1000')
            if st == 200 and isinstance(snaps, list):
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
                conn.commit()

            # 8. Treasury
            st, tr = self._sb_request('cbm_treasury', 'GET', '?id=eq.1&select=*')
            if st == 200 and isinstance(tr, list) and tr:
                t = tr[0]
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
                    _parse_iso(t.get('last_sync_at'))
                ))
                stats["treasury"] = True
                conn.commit()

            # 9. Withdrawals
            st, wds = self._sb_request('cbm_withdrawals', 'GET', '?select=*&order=created_at.desc&limit=200')
            if st == 200 and isinstance(wds, list):
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
                conn.commit()

            # 10. API Keys
            st, keys = self._sb_request('cbm_api_keys', 'GET', '?select=*&order=created_at.desc&limit=200')
            if st == 200 and isinstance(keys, list):
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
                conn.commit()

            conn.close()
            if not quiet:
                print(f"[✓] Supabase bi-directional sync completed: {stats}")
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
                    cur.execute("INSERT OR IGNORE INTO cbm_processed_txs (tx_id, processed_at) VALUES (?, ?)", (tx_id, time.time()))
                    conn.commit()
                except Exception:
                    pass
                return True

        return False

    def record_processed_tx(self, tx_id: str, timestamp_ms: int, sender: str, receiver: str, amount_gold: float, fee_gold: float, credited_account: Optional[str] = None):
        now = time.time()
        # 1. Local ACID SQLite persistence
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR IGNORE INTO cbm_processed_txs (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, now))
        conn.commit()
        conn.close()

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
            self._sb_request("cbm_processed_txs", method="POST", body=payload)

    def _save_account_to_local_sqlite(self, acc: Dict[str, Any]):
        """Caches an account record fetched from remote Supabase directly into local SQLite."""
        if not acc or not acc.get("account_name"):
            return
        try:
            conn = self._get_sqlite_conn()
            cur = conn.cursor()
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
            conn.commit()
            self._clear_missing_account_cache(acc.get("account_name"), acc.get("primary_territorial_account"), acc.get("display_name"))
        except Exception as e:
            pass

    def _clear_missing_account_cache(self, *names: str):
        """Invalidates negative cache entries when an account is registered, linked, or updated."""
        with self._missing_accounts_lock:
            for n in names:
                if n:
                    self._missing_accounts_cache.pop(str(n).strip().lower(), None)

    # --- Account & Ledger Management ---
    def _get_account_raw(self, account_name: str) -> Optional[Dict[str, Any]]:
        """
        Internal helper returning raw database record including credentials.
        Performs 4-way universal canonical resolution:
        1. account_name (Direct CBM username)
        2. primary_territorial_account (In-game account ID, e.g. 87778 -> TeothePogie)
        3. cbm_payment_methods (Linked secondary in-game account IDs)
        4. display_name (In-game player handle, e.g. [NOVA] TeothePogie)
        """
        if not account_name:
            return None
        acc_key = str(account_name).strip()
        if not acc_key:
            return None

        acc_lower = acc_key.lower()
        now = time.time()

        # 0. Negative lookup cache check (instant 0.001ms return for non-existent queries)
        with self._missing_accounts_lock:
            missing_ts = self._missing_accounts_cache.get(acc_lower)
            if missing_ts and (now - missing_ts) < 30.0:
                return None

        # 1. High-speed local SQLite resolution (0.05ms)
        conn = self._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM cbm_accounts 
            WHERE account_name = ? COLLATE NOCASE 
               OR primary_territorial_account = ? COLLATE NOCASE 
               OR display_name = ? COLLATE NOCASE
            LIMIT 1
        """, (acc_key, acc_key, acc_key))
        row = cur.fetchone()
        if row:
            return dict(row)

        cur.execute("""
            SELECT a.* FROM cbm_accounts a
            JOIN cbm_payment_methods pm ON a.account_name = pm.cbm_username
            WHERE pm.territorial_account_name = ? COLLATE NOCASE
            LIMIT 1
        """, (acc_key,))
        row2 = cur.fetchone()
        if row2:
            return dict(row2)

        # 2. Remote Supabase fallback (only if not found locally)
        if self.use_supabase:
            import urllib.parse
            quoted = urllib.parse.quote(acc_key)

            # Unified 3-way check in a single HTTPS roundtrip instead of 3 sequential roundtrips
            status, res = self._sb_request(
                "cbm_accounts",
                method="GET",
                params=f"?or=(account_name.ilike.{quoted},primary_territorial_account.ilike.{quoted},display_name.ilike.{quoted})&select=*&limit=1"
            )
            if status == 200 and isinstance(res, list) and res:
                found = dict(res[0])
                self._save_account_to_local_sqlite(found)
                return found

            # Check cbm_payment_methods only if not matched
            status, res = self._sb_request("cbm_payment_methods", method="GET", params=f"?territorial_account_name=ilike.{quoted}&select=cbm_username&limit=1")
            if status == 200 and isinstance(res, list) and res:
                cbm_user = res[0].get("cbm_username")
                if cbm_user:
                    status2, res2 = self._sb_request("cbm_accounts", method="GET", params=f"?account_name=ilike.{urllib.parse.quote(cbm_user)}&select=*&limit=1")
                    if status2 == 200 and isinstance(res2, list) and res2:
                        found = dict(res2[0])
                        self._save_account_to_local_sqlite(found)
                        return found

            # Record non-existence in memory negative cache
            with self._missing_accounts_lock:
                self._missing_accounts_cache[acc_lower] = now

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
        return safe

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
        if not password:
            return False
        raw = self._get_account_raw(account_name)
        if not raw:
            return False
        pwd_hash = raw.get("password_hash")
        salt = raw.get("password_salt")
        if not pwd_hash or not salt:
            return False
        test_h, _ = self._hash_password(password, salt)
        return hmac.compare_digest(pwd_hash, test_h)

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
        if not pin:
            return False
        raw = self._get_account_raw(account_name)
        if not raw:
            return False
        pin_hash = raw.get("pin_hash")
        salt = raw.get("salt")
        if not pin_hash or not salt:
            return False
        test_h, _ = self._hash_pin(pin, salt)
        return hmac.compare_digest(pin_hash, test_h)

    def _save_pin_hash(self, account_name: str, h: str, salt: str, mark_verified: bool = True):
        now = time.time()
        if self.use_supabase:
            patch_data = {"pin_hash": h, "salt": salt}
            if mark_verified:
                patch_data["is_verified"] = True
            st, res = self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body=patch_data)
            if st in (200, 204) and (not res or len(res) == 0):
                insert_data = {
                    "account_name": account_name,
                    "display_name": account_name,
                    "clan_tag": "ANTI-OG",
                    "role": "member",
                    "pin_hash": h,
                    "salt": salt,
                    "is_verified": mark_verified
                }
                self._sb_request("cbm_accounts", method="POST", body=insert_data, upsert=True)

        conn = sqlite3.connect(self.sqlite_path)
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

    def create_account_pin(self, account_name: str, pin: str) -> Tuple[bool, str]:
        """Creates a brand new CBM Access PIN for an account that does not currently have one."""
        pin_str = str(pin).strip()
        if not pin_str.isdigit() or len(pin_str) < 4 or len(pin_str) > 8:
            return False, "Access PIN must be between 4 and 8 numeric digits."

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

        if not new_str.isdigit() or len(new_str) < 4 or len(new_str) > 8:
            return False, "New Access PIN must be between 4 and 8 numeric digits."

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
            conn = sqlite3.connect(self.sqlite_path)
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
                conn = sqlite3.connect(self.sqlite_path)
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
            if self.use_supabase:
                self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{canonical_name}", body={"is_verified": True})
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("UPDATE cbm_accounts SET is_verified = 1 WHERE account_name = ?", (canonical_name,))
            conn.commit()
            conn.close()

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

        # Hash PIN if supplied
        pin_hash, pin_salt = None, None
        if pin:
            pin_str = str(pin).strip()
            if not pin_str.isdigit() or len(pin_str) < 4 or len(pin_str) > 8:
                return False, "Access PIN must be between 4 and 8 numeric digits.", None
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
            self._sb_request("cbm_accounts", method="POST", body=acc_data, upsert=True)

        # Save to SQLite
        conn = sqlite3.connect(self.sqlite_path)
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

        if self.use_supabase:
            import urllib.parse
            self._sb_request(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{urllib.parse.quote(canonical_name)}",
                body=updates
            )

        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        set_clauses = [f"{k} = ?" for k in updates.keys()]
        values = list(updates.values()) + [canonical_name]
        cur.execute(f"UPDATE cbm_accounts SET {', '.join(set_clauses)} WHERE account_name = ?", values)
        conn.commit()
        conn.close()
        return True

    def set_account_role(self, account_name: str, role: str) -> bool:
        """Convenience method to update an account role (e.g. member, restricted, officer)."""
        return self.sync_account_game_profile(account_name, role=role)

    def register_or_get_account(self, account_name: str, display_name: str = "", clan_tag: str = "ANTI-OG", role: str = "member") -> Dict[str, Any]:
        existing = self.get_account(account_name)
        if existing:
            return existing

        now = time.time()
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
            status, res = self._sb_request("cbm_accounts", method="POST", body=payload)
            if status in (200, 201) and isinstance(res, list) and res:
                return res[0]

        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR IGNORE INTO cbm_accounts (account_name, display_name, clan_tag, role, deposited_cents, total_deposited_cents, total_withdrawn_cents, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)
        """, (account_name, display_name or account_name, clan_tag, role, now, now))
        conn.commit()
        conn.close()
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

        if self.use_supabase:
            self._sb_request(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{acc_key}",
                body={"display_name": new_name, "avatar_url": new_avatar}
            )

        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            UPDATE cbm_accounts
            SET display_name = ?, avatar_url = ?, updated_at = ?
            WHERE account_name = ?
        """, (new_name, new_avatar, now, acc_key))
        conn.commit()
        conn.close()

        updated = self.get_account(acc_key)
        return True, "Profile updated successfully.", updated

    # --- Member Loan Facilities & Forced Collection ---
    def create_loan(
        self,
        account_name: str,
        principal_gold: int,
        term_days: int = 14,
        territorial_account: str = "",
        territorial_password: str = ""
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
        enc_pwd = encrypt_credential(territorial_password) if territorial_password else ""

        # 1. Always record in local SQLite
        conn = sqlite3.connect(self.sqlite_path)
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

        # 2. Mirror to Supabase if active
        if self.use_supabase:
            payload = {
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
                "territorial_password": enc_pwd,
                "credential_status": "VALID"
            }
            status, res = self._sb_request("cbm_loans", method="POST", body=payload)
            if status in (200, 201) and isinstance(res, list) and res:
                sb_id = res[0].get("id")
                if sb_id:
                    loan_id = sb_id

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
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_balance, now, account_name))
        cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_DISBURSEMENT', ?, ?, ?, ?, ?)", (account_name, principal_cents, new_balance, tx_hash, ledger_note, now))
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase
        if self.use_supabase:
            self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"deposited_cents": new_balance})
            self._sb_request("cbm_ledger", method="POST", body={
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
        conn = sqlite3.connect(self.sqlite_path)
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
            self._sb_request("cbm_loans", method="PATCH", params=f"?id=eq.{loan_id}", body=body)

    def repay_loan_from_balance(
        self,
        account_name: str,
        loan_id: Any,
        amount_cents: Optional[int] = None,
        full_repay: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Allows a member to voluntarily repay an active, overdue, or accelerated loan
        using their liquid CBM account balance (deposited_cents).
        Preserves 20.00 Gold buffer unless full repayment clears the loan completely.
        """
        acc_key = account_name.strip()
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

        # 1. Update SQLite
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_balance, now, acc_key))
        cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (acc_key, repay_amount, new_balance, tx_hash, ledger_note, now))
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase if active
        if self.use_supabase:
            self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_key}", body={"deposited_cents": new_balance})
            self._sb_request("cbm_ledger", method="POST", body={
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
        Audits stored Territorial.io credentials for all active loan obligations.
        Detects if a borrower changed their password to evade automated gold recovery.
        Triggers immediate covenant breach acceleration (50% penalty interest, account freeze).
        """
        now = time.time()
        loans = []

        if self.use_supabase:
            status, res = self._sb_request("cbm_loans", method="GET", params="?status=in.(ACTIVE,OVERDUE)&select=*")
            if status == 200 and isinstance(res, list):
                loans = res

        if not loans:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM cbm_loans WHERE status IN ('ACTIVE', 'OVERDUE')")
            loans = [dict(r) for r in cur.fetchall()]
            conn.close()

        breaches = []
        valid_count = 0

        for l in loans:
            loan_id = l.get("id")
            acc_name = l.get("account_name")
            terri_acc = l.get("borrower_territorial_account")
            terri_pwd = decrypt_credential(l.get("territorial_password"))

            # If not directly on loan record, check payment methods
            if not terri_acc or not terri_pwd:
                pms = self.get_payment_methods(acc_name)
                for pm in pms:
                    if pm.get("territorial_password"):
                        terri_acc = pm.get("territorial_account_name")
                        terri_pwd = decrypt_credential(pm.get("territorial_password"))
                        break

            if not terri_acc or not terri_pwd:
                continue

            # Resolve in-game account ID if needed
            target_terri = terri_acc
            try:
                linked_match = self.get_account(terri_acc)
                if linked_match and linked_match.get("primary_territorial_account"):
                    target_terri = linked_match.get("primary_territorial_account")
            except Exception:
                pass

            # Check live credential validity
            try:
                client = TerritorialGoldClient(target_terri, terri_pwd, timeout=4.0)
                data = client.get_account_data()
                t_stat = str(data.get("status", "")).lower()

                if t_stat in ("password error", "account error"):
                    # COVENANT BREACH DETECTED: Password changed or account inaccessible post-origination!
                    principal_cents = int(round(float(l.get("principal_gold", 0)) * 100))
                    penalty_cents = int(round(principal_cents * (CBMLoanEngine.OVERDUE_PENALTY_INTEREST_PERCENT / 100.0)))

                    self._update_loan_record(
                        loan_id=loan_id,
                        status="BREACH_OF_COVENANT",
                        penalty_cents=penalty_cents,
                        credential_status="BREACH_OF_COVENANT",
                        last_credential_check_at=now
                    )

                    # Downgrade account to restricted
                    self.set_account_role(acc_name, "restricted")

                    # Log covenant breach in ledger
                    ledger_note = f"COVENANT BREACH: In-game credentials invalid/changed for '{terri_acc}' ({t_stat}). 50% penalty interest applied immediately. Account access restricted."
                    tx_hash = f"breach_{acc_name}_{int(now)}"

                    # 1. Update SQLite
                    conn = sqlite3.connect(self.sqlite_path)
                    cur = conn.cursor()
                    cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_PENALTY', ?, 0, ?, ?, ?)", (acc_name, penalty_cents, tx_hash, ledger_note, now))
                    conn.commit()
                    conn.close()

                    # 2. Mirror to Supabase if active
                    if self.use_supabase:
                        self._sb_request("cbm_ledger", method="POST", body={
                            "account_name": acc_name,
                            "entry_type": "LOAN_PENALTY",
                            "amount_cents": penalty_cents,
                            "balance_after_cents": 0,
                            "tx_hash": tx_hash,
                            "notes": ledger_note
                        })

                    # Trigger immediate balance garnishment
                    self.reconcile_overdue_loans_and_enforce_garnishment(acc_name, force=True)

                    breaches.append({
                        "loan_id": loan_id,
                        "account_name": acc_name,
                        "territorial_account": terri_acc,
                        "reason": f"{t_stat} (credentials revoked or changed)",
                        "penalty_cents": penalty_cents
                    })
                elif t_stat == "ok":
                    valid_count += 1
                    self._update_loan_record(
                        loan_id=loan_id,
                        status=l.get("status"),
                        penalty_cents=l.get("penalty_cents", 0),
                        credential_status="VALID",
                        last_credential_check_at=now
                    )
            except Exception as ex:
                print(f"[!] Warning: Liveness check network exception for '{terri_acc}': {ex}")

        return {
            "audited_at": now,
            "total_active_loans": len(loans),
            "valid_credentials": valid_count,
            "breaches_detected": len(breaches),
            "breaches": breaches
        }

    def execute_automated_gold_seizure(self, loan_id: Any) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Executes automated in-game gold debt recovery from borrower's in-game account
        directly to the CBM Vault (DdcBC) via TerritorialGoldClient.send_gold.
        """
        import math
        now = time.time()
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_loans WHERE id = ?", (loan_id,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return False, f"Loan with ID '{loan_id}' not found.", {}

        l = dict(row)
        acc_name = l["account_name"]
        loans = self.get_account_loans(acc_name)
        target_loan = next((x for x in loans if str(x.get("id")) == str(loan_id)), None)
        if not target_loan:
            return False, "Unable to resolve loan schedule.", {}

        rem_due_cents = target_loan.get("remaining_due_cents", 0)
        if rem_due_cents <= 0:
            return False, "Loan is already fully repaid.", target_loan

        rem_due_gold = math.ceil(rem_due_cents / 100.0)

        # Collect candidate credentials (primary first, then linked accounts)
        candidate_creds = []
        if l.get("borrower_territorial_account") and l.get("territorial_password"):
            candidate_creds.append((l["borrower_territorial_account"], decrypt_credential(l["territorial_password"])))

        pms = self.get_payment_methods(acc_name)
        for pm in pms:
            t_acc = pm.get("territorial_account_name")
            t_pwd = decrypt_credential(pm.get("territorial_password"))
            if t_acc and t_pwd and (t_acc, t_pwd) not in candidate_creds:
                candidate_creds.append((t_acc, t_pwd))

        if not candidate_creds:
            return False, "No valid in-game credentials available on file for seizure.", {}

        total_seized_gold = 0
        seizure_details = []

        for t_acc, t_pwd in candidate_creds:
            if total_seized_gold >= rem_due_gold:
                break
            try:
                client = TerritorialGoldClient(t_acc, t_pwd, timeout=5.0)
                data = client.get_account_data()
                if data.get("status") != "ok":
                    continue

                raw_acc = data.get("account_data", {})
                in_game_bal = float(raw_acc.get("gold", 0.0) or 0.0)

                available_to_recover = math.floor(in_game_bal)
                needed = rem_due_gold - total_seized_gold
                to_transfer = min(available_to_recover, needed)

                if to_transfer >= 1:
                    res = client.send_gold(target_account=self.vault_account, amount=int(to_transfer))
                    if res.get("status") == "ok":
                        total_seized_gold += to_transfer
                        seizure_details.append({
                            "source_account": t_acc,
                            "seized_gold": to_transfer,
                            "tx_id": res.get("tx_id")
                        })
            except Exception as ex:
                print(f"[!] Seizure attempt error for account '{t_acc}': {ex}")

        # Record seizure attempts
        attempts = (l.get("seizure_attempts") or 0) + 1
        self._update_loan_record(
            loan_id=loan_id,
            status=target_loan.get("status"),
            penalty_cents=target_loan.get("penalty_interest_cents", 0),
            seizure_attempts=attempts,
            last_seizure_attempt_at=now
        )

        if total_seized_gold > 0:
            seized_cents = int(total_seized_gold * 100)
            new_repaid = target_loan.get("repaid_cents", 0) + seized_cents
            is_settled = new_repaid >= target_loan.get("total_due_cents", 0)
            new_stat = "REPAID" if is_settled else target_loan.get("status")

            self._update_loan_record(
                loan_id=loan_id,
                status=new_stat,
                penalty_cents=target_loan.get("penalty_interest_cents", 0),
                repaid_cents=new_repaid
            )

            tx_hash = f"seize_{acc_name}_{int(now)}"
            note = f"Automated in-game gold recovery: {total_seized_gold} Gold seized from borrower account to Vault '{self.vault_account}'"

            # 1. Update SQLite
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (acc_name, seized_cents, 0, tx_hash, note, now))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._sb_request("cbm_ledger", method="POST", body={
                    "account_name": acc_name,
                    "entry_type": "LOAN_REPAYMENT",
                    "amount_cents": seized_cents,
                    "balance_after_cents": target_loan.get("remaining_due_cents", 0) - seized_cents,
                    "tx_hash": tx_hash,
                    "notes": note
                })

            self.recompute_treasury()
            return True, f"Successfully executed in-game recovery of {total_seized_gold} Gold.", {
                "total_seized_gold": total_seized_gold,
                "seizure_details": seizure_details,
                "is_settled": is_settled
            }
        else:
            return False, f"In-game recovery attempted across {len(candidate_creds)} account(s), but insufficient in-game balance was available.", {
                "attempts": attempts
            }

    def set_account_role(self, account_name: str, role: str):
        now = time.time()
        # 1. Update SQLite
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET role = ?, updated_at = ? WHERE account_name = ?", (role, now, account_name))
        conn.commit()
        conn.close()

        # 2. Mirror to Supabase if active
        if self.use_supabase:
            self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"role": role})

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
                conn = sqlite3.connect(self.sqlite_path)
                cur = conn.cursor()
                cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_bal, now, account_name))
                cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (account_name, garnish_cents, new_bal, tx_hash, ledger_note, now))
                conn.commit()
                conn.close()

                # 2. Mirror to Supabase if active
                if self.use_supabase:
                    self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"deposited_cents": new_bal})
                    self._sb_request("cbm_ledger", method="POST", body={
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
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at) VALUES (?, 'LOAN_REPAYMENT', ?, ?, ?, ?, ?)", (account_name, garnish, curr_bal, f"repay_{tx_hash[:16]}", ledger_note, now))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._sb_request("cbm_ledger", method="POST", body={
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
            conn = sqlite3.connect(self.sqlite_path)
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
            conn = sqlite3.connect(self.sqlite_path)
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
                self._sb_request(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{account_name}",
                    body={"deposited_cents": new_balance, "total_deposited_cents": total_dep}
                )
                self._sb_request(
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
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("UPDATE cbm_accounts SET total_deposited_cents = ?, updated_at = ? WHERE account_name = ?", (total_dep, now, account_name))
            conn.commit()
            conn.close()

            # 2. Mirror to Supabase if active
            if self.use_supabase:
                self._sb_request(
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
        if row and row["vault_total_gold_cents"] > 0:
            return dict(row)

        if self.use_supabase:
            status, res = self._sb_request("cbm_treasury", method="GET", params="?id=eq.1&select=*")
            if status == 200 and isinstance(res, list) and res:
                return res[0]

        return dict(row) if row else {
            "vault_account_name": "DdcBC",
            "vault_total_gold_cents": 0,
            "member_liabilities_cents": 0,
            "bank_reserves_cents": 0
        }

    def _calculate_treasury_metrics(self, vault_total_cents: int) -> Dict[str, Any]:
        """
        Calculates all core treasury metrics dynamically using high-speed local SQLite:
        1. Member liabilities (sum of deposited_cents for non-system accounts)
        2. Unencumbered capital (sum of war chest donations from cbm_donations)
        3. Loan interest penalties (sum of penalty_cents from cbm_loans)
        4. Vault excess = max(0, vault_total_cents - member_liabilities_cents)
        5. Bank reserves = vault_excess + unencumbered_capital + loan_penalties
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
        unencumbered_capital = row_d[0] or 0

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

        vault_excess = max(0, vault_total_cents - total_liab)
        bank_reserves = vault_excess
        vault_cushion = max(0, bank_reserves - unencumbered_capital - loan_penalties)

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
        """Helper to persist computed treasury metrics to Supabase and SQLite."""
        now = time.time()
        iso = now_iso or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))

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
            status, _ = self._sb_request("cbm_treasury", method="PATCH", params="?id=eq.1", body=patch_payload_full)
            if status != 200:
                self._sb_request("cbm_treasury", method="PATCH", params="?id=eq.1", body=patch_payload)

        conn = self.get_write_connection(timeout=30.0)
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
        except Exception:
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
        conn.commit()
        conn.close()

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
            print(f"[+] Live Vault Audit: {metrics['vault_total_gold']:.2f} Gold in vault '{vault_account}' (Reserves: {metrics['bank_reserves_gold']:.2f} Gold [Excess: {metrics['vault_excess_gold']:.2f} + WarChest: {metrics['unencumbered_capital_gold']:.2f} + Penalties: {metrics['loan_penalties_gold']:.2f}], Liabilities: {metrics['member_liabilities_gold']:.2f} Gold).")
            return True, live_gold_cents, audit_info
        except Exception as e:
            print(f"[!] Live vault audit error: {e}")
            return False, 0, {"error": str(e)}

    def update_vault_balance(self, vault_total_cents: int):
        metrics = self._calculate_treasury_metrics(vault_total_cents)
        self._persist_treasury_metrics(metrics)

    def recompute_treasury(self) -> Dict[str, Any]:
        """Re-sums member liabilities, unencumbered capital, loan penalties, and recalculates unencumbered bank reserves."""
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
        verification_type: str = "INPUT_CREDENTIALS",
        display_name: Optional[str] = None,
        is_primary: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """Links an in-game territorial.io account as a payment method for a CBM user."""
        cbm_user = cbm_username.strip()
        terri_acc = (territorial_account or kwargs.get("territorial_account_name") or "").strip()
        disp_name = display_name or terri_acc
        now = time.time()

        # Ensure user account exists in cbm_accounts
        self.register_or_get_account(cbm_user, display_name=disp_name)
        enc_pwd = encrypt_credential(territorial_password) if territorial_password else ""

        # 1. Dual-Write: Always commit to SQLite first
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        if is_primary:
            cur.execute("UPDATE cbm_payment_methods SET is_primary = 0 WHERE cbm_username = ?", (cbm_user,))

        cur.execute("""
            INSERT INTO cbm_payment_methods 
            (cbm_username, territorial_account_name, territorial_password, display_name, verification_type, status, is_primary, total_transacted_gold, linked_at, last_used_at)
            VALUES (?, ?, ?, ?, ?, 'VERIFIED', ?, 0.0, ?, ?)
            ON CONFLICT(territorial_account_name) DO UPDATE SET
            cbm_username=excluded.cbm_username,
            territorial_password=COALESCE(excluded.territorial_password, territorial_password),
            display_name=COALESCE(excluded.display_name, display_name),
            verification_type=excluded.verification_type,
            status='VERIFIED',
            is_primary=excluded.is_primary,
            last_used_at=excluded.last_used_at
        """, (cbm_user, terri_acc, enc_pwd, disp_name, verification_type, 1 if is_primary else 0, now, now))
        conn.commit()
        conn.close()

        # 2. Dual-Write: Mirror to Supabase if active
        if self.use_supabase:
            payload = {
                "cbm_username": cbm_user,
                "territorial_account_name": terri_acc,
                "territorial_password": enc_pwd,
                "display_name": disp_name,
                "verification_type": verification_type,
                "status": "VERIFIED",
                "is_primary": is_primary
            }
            if is_primary:
                self._sb_request("cbm_payment_methods", method="PATCH", params=f"?cbm_username=eq.{cbm_user}", body={"is_primary": False})
            self._sb_request("cbm_payment_methods", method="POST", body=payload)

        methods = self.get_payment_methods(cbm_user)
        for m in methods:
            if m.get("territorial_account_name") == terri_acc:
                return m
        return {"status": "linked", "cbm_username": cbm_user, "territorial_account_name": terri_acc, "display_name": disp_name, "is_primary": is_primary}

    def get_payment_methods(self, cbm_username: str) -> List[Dict[str, Any]]:
        """Retrieves all linked territorial.io payment methods for a CBM user."""
        cbm_user = cbm_username.strip()
        conn = sqlite3.connect(self.sqlite_path)
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
                    conn = sqlite3.connect(self.sqlite_path)
                    cur = conn.cursor()
                    for r in rows:
                        cur.execute("""
                            INSERT OR REPLACE INTO cbm_payment_methods (
                                id, cbm_username, territorial_account_name, territorial_password,
                                display_name, verification_type, status, is_primary,
                                total_transacted_gold, linked_at, last_used_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            r.get("id"),
                            r.get("cbm_username", cbm_user),
                            r.get("territorial_account_name", ""),
                            r.get("territorial_password", ""),
                            r.get("display_name", ""),
                            r.get("verification_type", "INPUT_CREDENTIALS"),
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
            if "territorial_password" in r and r["territorial_password"]:
                r["territorial_password"] = decrypt_credential(r["territorial_password"])
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

        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("SELECT cbm_username FROM cbm_payment_methods WHERE territorial_account_name = ? COLLATE NOCASE", (terri_acc,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

    def record_payment_method_transaction(self, territorial_account: str, amount_gold: float):
        """Updates the total transacted volume and last_used timestamp on the payment method."""
        terri_acc = territorial_account.strip()
        now = time.time()
        conn = sqlite3.connect(self.sqlite_path)
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

        # 1. Dual-Write: Always update SQLite first
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET deposited_cents = ?, updated_at = ? WHERE account_name = ?", (new_balance_cents, now, acc_key))
        cur.execute("""
            INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
            VALUES (?, 'TREASURY_DONATION', ?, ?, ?, ?, ?)
        """, (acc_key, -amount_cents, new_balance_cents, tx_hash, ledger_notes, now))
        donor_disp = acc.get("display_name") or acc_key
        cur.execute("""
            INSERT INTO cbm_donations (donor_name, territorial_account, amount_gold, amount_cents, message, source, tx_hash, is_refundable, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'BALANCE', ?, 0, 'IRREVOCABLE', ?)
        """, (donor_disp, territorial_account or acc_key, round(amount_gold, 2), amount_cents, clean_msg, tx_hash, now))
        conn.commit()
        conn.close()

        # 2. Dual-Write: Mirror to Supabase if active
        if self.use_supabase:
            self._sb_request("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_key}", body={"deposited_cents": new_balance_cents})
            self._sb_request("cbm_ledger", method="POST", body={
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
            self._sb_request("cbm_donations", method="POST", body=donation_payload)

        # Recalculate unencumbered reserves (liabilities drop, reserves expand 1:1)
        self.recompute_treasury()

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
        conn = sqlite3.connect(self.sqlite_path)
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
            self._sb_request("cbm_donations", method="POST", body=donation_payload)
            self._sb_request("cbm_ledger", method="POST", body={
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
            self._sb_request("cbm_pending_donations", method="POST", body=payload)

        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_pending_donations (id, account_name, amount_cents, amount_gold, message, status, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
        """, (slip_id, canonical_name, amount_cents, round(amount_gold, 2), clean_msg, now, expires_at))
        conn.commit()
        conn.close()

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
        conn = sqlite3.connect(self.sqlite_path)
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
        Model 3 In-Game Donation Matching:
        Finds an active pending donation slip matching the sender and exact amount.
        If matched, immediately marks as FULFILLED with tx_hash to prevent double-claiming.
        """
        now = time.time()
        sender_clean = sender_account.strip()
        candidates = [sender_clean]
        owner = self.get_cbm_username_by_territorial_account(sender_clean)
        if owner and owner not in candidates:
            candidates.append(owner)
        owner_acc = self._get_account_raw(sender_clean)
        if owner_acc:
            c_name = owner_acc.get("account_name")
            if c_name and c_name not in candidates:
                candidates.append(c_name)
            d_name = owner_acc.get("display_name")
            if d_name and d_name not in candidates:
                candidates.append(d_name)
            p_terri = owner_acc.get("primary_territorial_account")
            if p_terri and p_terri not in candidates:
                candidates.append(p_terri)

        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        placeholders = ",".join("?" for _ in candidates)
        cur.execute(f"""
            SELECT * FROM cbm_pending_donations 
            WHERE account_name IN ({placeholders}) 
              AND amount_cents = ? 
              AND status = 'PENDING' 
              AND expires_at >= ?
            ORDER BY created_at ASC 
            LIMIT 1
        """, (*candidates, amount_cents, now))
        row = cur.fetchone()
        if row:
            slip = dict(row)
            slip_id = slip["id"]
            cur.execute("UPDATE cbm_pending_donations SET status = 'FULFILLED', tx_hash = ? WHERE id = ?", (tx_id, slip_id))
            conn.commit()
            conn.close()

            if self.use_supabase:
                self._sb_request(
                    "cbm_pending_donations",
                    method="PATCH",
                    params=f"?id=eq.{slip_id}",
                    body={"status": "FULFILLED", "tx_hash": tx_id}
                )
            return slip

        conn.close()
        return None

    # --- Vault Telemetry & 7-Day Timeline Aggregation ---
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
            self._sb_request("cbm_vault_snapshots", method="POST", body=payload)

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
            tx_time_s = r["timestamp_ms"] / 1000.0
            amt = float(r["amount_gold"] or 0.0)
            total_inflow += amt
            total_tx_count += 1
            idx = int((tx_time_s - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                buckets[idx]["inflow"] += amt
                buckets[idx]["tx_count"] += 1

        # Distribute outflows
        for r in outflow_rows:
            tx_time_s = float(r["created_at"] or 0.0)
            amt = float(r["amount_gold"] or 0.0)
            total_outflow += amt
            total_tx_count += 1
            idx = int((tx_time_s - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                buckets[idx]["outflow"] += amt
                buckets[idx]["tx_count"] += 1

        # Associate any matching snapshots
        for s in snapshot_rows:
            s_time = float(s["timestamp_epoch"] or 0.0)
            idx = int((s_time - start_ts) // bucket_seconds)
            if 0 <= idx < len(buckets):
                buckets[idx]["snapshot_vault"] = float(s["vault_total_gold"] or 0.0)
                buckets[idx]["snapshot_reserves"] = float(s["unencumbered_reserves_gold"] or 0.0)

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

        conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
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
            try:
                self._sb_request("cbm_api_keys", method="POST", body={
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
            except Exception as ex:
                print(f"[!] Supabase key sync notice: {ex}")

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

        conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
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
        conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
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
        conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
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
                try:
                    self._sb_request(
                        "cbm_api_keys",
                        method="PATCH",
                        params=f"?key_id=eq.{key_id}&owner_account=eq.{owner_account}",
                        body={"is_active": False}
                    )
                except Exception as ex:
                    print(f"[!] Supabase key revoke notice: {ex}")
            return True, f"API Key '{key_id}' successfully revoked."
        return False, f"API Key '{key_id}' not found or not owned by '{owner_account}'."

    def charge_api_credit(
        self,
        owner_account: str,
        key_id: str,
        cost_gold: float = 1.0
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Atomically charges an API key owner 1.00 Credit (1.00 Gold / 100 cents) for a successful API request,
        and converts the deducted credit into permanent unencumbered central bank reserves.
        """
        cost_cents = int(round(cost_gold * 100))
        acc = self.get_account(owner_account)
        if not acc:
            return False, "API Key owner account not found.", {}

        available_cents = acc.get("deposited_cents", 0)
        if available_cents < cost_cents:
            return False, (
                f"Insufficient API Credits: {available_cents / 100.0:.2f} Gold available, "
                f"{cost_gold:.2f} Gold required per successful request."
            ), {"credits_remaining": available_cents / 100.0, "credits_cost": cost_gold}

        new_balance = available_cents - cost_cents
        now = time.time()
        tx_hash = f"api_{key_id}_{int(now)}_{secrets.token_hex(3)}"
        ledger_note = f"API Call ({key_id}): {cost_gold:.2f} Credit converted to unencumbered Clan Reserves"

        conn = sqlite3.connect(self.sqlite_path, timeout=15.0)
        cur = conn.cursor()
        cur.execute("""
            UPDATE cbm_accounts
            SET deposited_cents = ?, updated_at = ?
            WHERE account_name = ?
        """, (new_balance, now, owner_account))

        cur.execute("""
            INSERT INTO cbm_ledger (
                account_name, entry_type, amount_cents, balance_after_cents,
                tx_hash, notes, created_at
            ) VALUES (?, 'API_CONSUMPTION', ?, ?, ?, ?, ?)
        """, (owner_account, -cost_cents, new_balance, tx_hash, ledger_note, now))

        cur.execute("""
            UPDATE cbm_api_keys
            SET credits_consumed_gold = credits_consumed_gold + ?,
                total_requests = total_requests + 1,
                last_used_at = ?
            WHERE key_id = ?
        """, (cost_gold, now, key_id))

        conn.commit()
        conn.close()

        if self.use_supabase:
            try:
                self._sb_request(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{owner_account}",
                    body={"deposited_cents": new_balance}
                )
                self._sb_request(
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
            except Exception as ex:
                print(f"[!] Supabase credit sync notice: {ex}")

        # Recalculate central bank solvency:
        # Since member_liabilities_cents decreased by 100 cents, bank_reserves_cents increases by 100 cents!
        self.recompute_treasury()

        return True, "Credit charged and converted to reserves successfully.", {
            "credits_cost": cost_gold,
            "credits_remaining": round(new_balance / 100.0, 2),
            "tx_hash": tx_hash
        }

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
        return {
            "owner_account": owner_account,
            "api_credits": balance_gold,
            "credits_display": f"{balance_gold:,.2f} Credits",
            "gold_balance": balance_gold,
            "active_keys_count": len(active_keys),
            "total_keys_count": len(keys),
            "total_requests": total_requests,
            "total_credits_consumed": round(total_consumed, 2),
            "rate_conversion_note": "1 API Request = 1.00 Credit (1.00 Gold) -> Converted to Unencumbered Clan Reserves"
        }


