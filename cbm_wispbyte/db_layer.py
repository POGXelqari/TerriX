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
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List, Tuple

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class CBMDatabase:
    def __init__(self, sqlite_path: str = "cbm_data.db"):
        self.sqlite_path = sqlite_path
        self.supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.supabase_key = (
            os.environ.get("SUPABASE_KEY")
            or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            or ""
        )
        self.use_supabase = bool(self.supabase_url and self.supabase_key)
        self._init_sqlite()

    def _init_sqlite(self):
        """Initializes local SQLite schema for fallback and local execution."""
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cbm_accounts (
                account_name TEXT PRIMARY KEY,
                display_name TEXT,
                clan_tag TEXT DEFAULT 'ANTI-OG',
                role TEXT DEFAULT 'member',
                deposited_cents INTEGER DEFAULT 0,
                total_deposited_cents INTEGER DEFAULT 0,
                total_withdrawn_cents INTEGER DEFAULT 0,
                created_at REAL,
                updated_at REAL
            )
        """)
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
                last_sync_at REAL
            )
        """)
        cur.execute("""
            INSERT OR IGNORE INTO cbm_treasury (id, vault_account_name, vault_total_gold_cents, member_liabilities_cents, bank_reserves_cents, last_sync_at)
            VALUES (1, 'DdcBC', 5646, 0, 5646, ?)
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
                term_days INTEGER DEFAULT 14,
                due_at REAL,
                repaid_cents INTEGER DEFAULT 0,
                status TEXT DEFAULT 'PENDING',
                created_at REAL
            )
        """)
        conn.commit()
        conn.close()

    def _sb_request(self, table: str, method: str = "GET", params: str = "", body: Optional[dict] = None) -> Tuple[int, Any]:
        """Executes a PostgREST request to Supabase."""
        if not self.use_supabase:
            return 404, None
        url = f"{self.supabase_url}/rest/v1/{table}{params}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        data = json.dumps(body).encode("utf-8") if body else None
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

    # --- Transaction Deduplication & Reconciled Cache ---
    def is_tx_processed(self, tx_id: str) -> bool:
        if self.use_supabase:
            status, res = self._sb_request("cbm_processed_txs", method="GET", params=f"?tx_id=eq.{tx_id}&select=tx_id")
            if status == 200 and isinstance(res, list):
                return len(res) > 0

        # SQLite fallback
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM cbm_processed_txs WHERE tx_id = ?", (tx_id,))
        row = cur.fetchone()
        conn.close()
        return bool(row)

    def record_processed_tx(self, tx_id: str, timestamp_ms: int, sender: str, receiver: str, amount_gold: float, fee_gold: float, credited_account: Optional[str] = None):
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
            status, _ = self._sb_request("cbm_processed_txs", method="POST", body=payload)
            if status in (200, 201):
                return

        # SQLite fallback
        conn = sqlite3.connect(self.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR IGNORE INTO cbm_processed_txs (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, time.time()))
        conn.commit()
        conn.close()

    # --- Account & Ledger Management ---
    def get_account(self, account_name: str) -> Optional[Dict[str, Any]]:
        acc_key = account_name.strip()
        if self.use_supabase:
            status, res = self._sb_request("cbm_accounts", method="GET", params=f"?account_name=eq.{acc_key}&select=*")
            if status == 200 and isinstance(res, list) and res:
                return res[0]

        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_accounts WHERE account_name = ?", (acc_key,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

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

    def credit_deposit(self, account_name: str, amount_cents: int, tx_hash: str) -> Dict[str, Any]:
        """Atomically credits a member's account with deposited gold cents."""
        acc = self.register_or_get_account(account_name)
        new_balance = acc["deposited_cents"] + amount_cents
        total_dep = acc["total_deposited_cents"] + amount_cents
        now = time.time()

        if self.use_supabase:
            # Update account
            self._sb_request(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{account_name}",
                body={"deposited_cents": new_balance, "total_deposited_cents": total_dep}
            )
            # Add ledger entry
            self._sb_request(
                "cbm_ledger",
                method="POST",
                body={
                    "account_name": account_name,
                    "entry_type": "DEPOSIT",
                    "amount_cents": amount_cents,
                    "balance_after_cents": new_balance,
                    "tx_hash": tx_hash,
                    "notes": f"Automated ledger credit of {amount_cents / 100.0} Gold"
                }
            )
        else:
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
            """, (account_name, amount_cents, new_balance, tx_hash, f"Automated ledger credit of {amount_cents / 100.0} Gold", now))
            conn.commit()
            conn.close()

        self.recompute_treasury()
        return self.get_account(account_name)

    # --- Treasury & Reserves ---
    def get_treasury(self) -> Dict[str, Any]:
        if self.use_supabase:
            status, res = self._sb_request("cbm_treasury", method="GET", params="?id=eq.1&select=*")
            if status == 200 and isinstance(res, list) and res:
                return res[0]

        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_treasury WHERE id = 1")
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else {
            "vault_account_name": "DdcBC",
            "vault_total_gold_cents": 5646,
            "member_liabilities_cents": 0,
            "bank_reserves_cents": 5646
        }

    def update_vault_balance(self, vault_total_cents: int):
        treasury = self.get_treasury()
        liabilities = treasury.get("member_liabilities_cents", 0)
        reserves = max(0, vault_total_cents - liabilities)
        now = time.time()

        if self.use_supabase:
            self._sb_request(
                "cbm_treasury",
                method="PATCH",
                params="?id=eq.1",
                body={
                    "vault_total_gold_cents": vault_total_cents,
                    "bank_reserves_cents": reserves
                }
            )
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("""
                UPDATE cbm_treasury
                SET vault_total_gold_cents = ?, bank_reserves_cents = ?, last_sync_at = ?
                WHERE id = 1
            """, (vault_total_cents, reserves, now))
            conn.commit()
            conn.close()

    def recompute_treasury(self):
        """Re-sums member liabilities and recalculates unencumbered bank reserves."""
        total_liab = 0
        if self.use_supabase:
            status, res = self._sb_request("cbm_accounts", method="GET", params="?select=deposited_cents")
            if status == 200 and isinstance(res, list):
                total_liab = sum(r.get("deposited_cents", 0) for r in res)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("SELECT SUM(deposited_cents) FROM cbm_accounts")
            row = cur.fetchone()
            total_liab = row[0] or 0
            conn.close()

        treasury = self.get_treasury()
        vault_total = treasury.get("vault_total_gold_cents", 5646)
        reserves = max(0, vault_total - total_liab)

        if self.use_supabase:
            self._sb_request(
                "cbm_treasury",
                method="PATCH",
                params="?id=eq.1",
                body={"member_liabilities_cents": total_liab, "bank_reserves_cents": reserves}
            )
        else:
            conn = sqlite3.connect(self.sqlite_path)
            cur = conn.cursor()
            cur.execute("""
                UPDATE cbm_treasury
                SET member_liabilities_cents = ?, bank_reserves_cents = ?, last_sync_at = ?
                WHERE id = 1
            """, (total_liab, reserves, time.time()))
            conn.commit()
            conn.close()

    # --- Recent Transactions & Audits ---
    def get_recent_transactions(self, limit: int = 25) -> List[Dict[str, Any]]:
        if self.use_supabase:
            status, res = self._sb_request("cbm_processed_txs", method="GET", params=f"?order=timestamp_ms.desc&limit={limit}&select=*")
            if status == 200 and isinstance(res, list):
                return res

        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM cbm_processed_txs ORDER BY timestamp_ms DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows
