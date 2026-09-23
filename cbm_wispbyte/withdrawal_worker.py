#!/usr/bin/env python3
"""
CBM Withdrawal Worker
=====================
Processes member withdrawal requests via Territorial.io API:
- Validates internal balance availability
- Executes POST /api/gold/send from vault credentials
- Deducts member liabilities in the double-entry ledger
- Enforces closed-loop destination policies & dual-custody audit trails
- Sweeps and processes pending withdrawal queue automatically
"""

import os
import sys
import time
import datetime
import sqlite3
from typing import Dict, Any, Tuple, Optional, List
from db_layer import CBMDatabase
from gold_api_client import TerritorialGoldClient

class CBMWithdrawalWorker:
    def __init__(self, db: CBMDatabase, vault_account: str = "DdcBC", vault_password: str = ""):
        self.db = db
        self.vault_account = vault_account.strip()
        self.vault_password = vault_password.strip() or os.environ.get("CBM_VAULT_PASSWORD", "").strip()
        self._client: Optional[TerritorialGoldClient] = None
        if self.vault_password:
            self._client = TerritorialGoldClient(self.vault_account, self.vault_password)

    @property
    def client(self) -> Optional[TerritorialGoldClient]:
        if not self._client:
            pwd = self.vault_password or os.environ.get("CBM_VAULT_PASSWORD", "").strip()
            if pwd:
                self.vault_password = pwd
                self._client = TerritorialGoldClient(self.vault_account, self.vault_password)
        return self._client

    def _get_db_conn(self, timeout: float = 30.0) -> sqlite3.Connection:
        if hasattr(self.db, "get_write_connection"):
            return self.db.get_write_connection(timeout=timeout)
        conn = sqlite3.connect(self.db.sqlite_path, timeout=timeout)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute(f"PRAGMA busy_timeout = {int(timeout * 1000)};")
        return conn

    def request_withdrawal(self, account_name: str, target_account: str, amount_gold: int, pin: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validates internal member balance, closed-loop routing, and PIN authentication,
        then dispatches real-time disbursement directly to the member's in-game account.
        """
        if amount_gold <= 0 or amount_gold > 1000:
            return False, "Withdrawal amount must be between 1 and 1,000 Gold."

        acc_clean = account_name.strip().upper()
        if acc_clean in ("TREASURY", "WAR_CHEST", "BANK", "VAULT", "RESERVES", "DDCBC"):
            return False, "Covenant violation: Central bank reserves and war chest donations are permanent unencumbered clan capital and cannot be withdrawn or refunded."

        # 1. Closed-Loop Anti-Fraud Check: Destination MUST match owner or verified linked method
        allowed_destinations = self.db.get_verified_destination_accounts(account_name) if hasattr(self.db, "get_verified_destination_accounts") else [acc_clean]
        target_clean = target_account.strip().upper() if target_account else acc_clean

        if target_clean not in allowed_destinations:
            return False, (
                f"Anti-Fraud Policy Violation: Funds can only be withdrawn directly back to your verified in-game account ('{account_name}'). "
                f"Rerouting to unverified third-party account ('{target_account}') is strictly blocked."
            )

        # 2. CBM Access PIN Verification (if account has a PIN configured)
        if hasattr(self.db, "has_account_pin") and self.db.has_account_pin(account_name):
            if not pin or not self.db.verify_account_pin(account_name, pin):
                return False, "Authentication Required: Invalid or missing 6-digit CBM Access PIN."

        # Reconcile overdue loans to garnish debt and update access status
        self.db.reconcile_overdue_loans_and_enforce_garnishment(account_name)

        acc = self.db.get_account(account_name)
        if not acc:
            return False, f"Account '{account_name}' not registered in CBM."

        # Verify access role: restricted accounts cannot withdraw funds
        role = acc.get("role", "member")
        if role in ("restricted", "downgraded", "frozen", "delinquent"):
            return False, "Withdrawal suspended: Account access is downgraded to 'restricted' due to an outstanding overdue loan. Settle remaining debt to restore account access."

        amount_cents = amount_gold * 100
        total_cents = acc.get("deposited_cents", 0) or 0
        withdrawable_cents = self.db.get_withdrawable_balance_cents(account_name) if hasattr(self.db, "get_withdrawable_balance_cents") else total_cents

        # Bank covers the 0.01 Gold game fee! Zero fees charged to member.
        if withdrawable_cents < amount_cents:
            if total_cents >= amount_cents:
                quarantined_gold = (total_cents - withdrawable_cents) / 100.0
                return False, f"Withdrawal restricted: {quarantined_gold:.2f} Gold is currently held under promotional audit quarantine. Withdrawable balance: {withdrawable_cents / 100.0:.2f} Gold."
            return False, f"Insufficient balance. Available: {withdrawable_cents / 100.0:.2f} Gold, Requested: {amount_gold} Gold."

        # Verify vault client availability
        if not self.client or not self.vault_password:
            return False, "Withdrawal execution unavailable: Vault credentials not configured on withdrawal worker."

        # Record withdrawal queue item in SQLite (fee_cents = 0 charged to user; 1 cent absorbed by bank)
        conn_sq = self._get_db_conn(timeout=30.0)
        try:
            cur = conn_sq.cursor()
            now_ts = time.time()
            cur.execute("""
                INSERT INTO cbm_withdrawals (account_name, target_account, amount_gold, fee_cents, status, created_at)
                VALUES (?, ?, ?, 0, 'PENDING', ?)
            """, (account_name, target_account, amount_gold, now_ts))
            w_id = cur.lastrowid
            conn_sq.commit()
        finally:
            conn_sq.close()

        if self.db.use_supabase:
            try:
                self.db._sb_request(
                    "cbm_withdrawals",
                    method="POST",
                    body={
                        "account_name": account_name,
                        "target_account": target_account,
                        "amount_gold": amount_gold,
                        "fee_cents": 0,
                        "status": "PENDING"
                    }
                )
            except Exception as sb_err:
                print(f"[!] Supabase withdrawal queue notice: {sb_err}")

        # Execute immediate disbursement via Territorial.io API
        ok, res = self.execute_withdrawal(w_id)
        if ok:
            new_bal = res.get("new_balance_gold", (total_cents - amount_cents) / 100.0)
            tx = res.get("tx_id", str(w_id))
            return True, f"Disbursed {amount_gold} Gold directly to '{target_account}' in Territorial.io successfully. Transaction ID: {tx}. Remaining balance: {new_bal:.2f} Gold (0 fees - game fee covered by Clan Bank)."
        else:
            err_msg = res.get("error", "Territorial.io transfer rejected.")
            return False, f"Withdrawal disbursement failed: {err_msg} Your account balance remains intact."

    def execute_withdrawal(self, withdrawal_id: int) -> Tuple[bool, Dict[str, Any]]:
        """
        Executes a withdrawal using the vault's Territorial.io credentials,
        deducts internal balance, records ledger transactions, and synchronizes state.
        """
        if not self.client or not self.vault_password:
            return False, {"error": "Vault credentials not configured on withdrawal worker."}

        conn_sq = self._get_db_conn(timeout=30.0)
        conn_sq.row_factory = sqlite3.Row
        try:
            cur = conn_sq.cursor()
            cur.execute("SELECT * FROM cbm_withdrawals WHERE id = ? AND status = 'PENDING'", (withdrawal_id,))
            row = cur.fetchone()
            if not row:
                return False, {"error": "Withdrawal request not found or already processed."}

            req = dict(row)
            account_name = req["account_name"]
            target_account = req["target_account"]
            amount_gold = req["amount_gold"]
            amount_cents = amount_gold * 100

            # 1. Atomic Balance Reservation: Decrement member balance immediately in SQLite
            # If available balance < amount_cents, rowcount is 0, rejecting race conditions and double-spends.
            now_ts = time.time()
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = deposited_cents - ?, updated_at = ?
                WHERE account_name = ? AND deposited_cents >= ?
            """, (amount_cents, now_ts, account_name, amount_cents))
            if cur.rowcount == 0:
                cur.execute("UPDATE cbm_withdrawals SET status = 'FAILED' WHERE id = ?", (withdrawal_id,))
                conn_sq.commit()
                return False, {"error": "Insufficient member balance or concurrent transaction in progress."}

            conn_sq.commit()

            # 2. Call Territorial.io API
            try:
                api_res = self.client.send_gold(target_account, amount_gold)
            except Exception as net_ex:
                api_res = {"status": "error", "message": f"Network exception: {net_ex}"}

            if api_res.get("status") != "ok":
                err_msg = api_res.get("message") or api_res.get("status") or str(api_res)
                # Payout rejected or failed: Rollback the atomic reservation!
                rollback_ts = time.time()
                cur.execute("""
                    UPDATE cbm_accounts
                    SET deposited_cents = deposited_cents + ?, updated_at = ?
                    WHERE account_name = ?
                """, (amount_cents, rollback_ts, account_name))
                cur.execute("UPDATE cbm_withdrawals SET status = 'FAILED' WHERE id = ?", (withdrawal_id,))
                conn_sq.commit()
                if self.db.use_supabase:
                    try:
                        self.db._sb_request(
                            "cbm_withdrawals",
                            method="PATCH",
                            params=f"?account_name=eq.{account_name}&status=eq.PENDING&amount_gold=eq.{amount_gold}",
                            body={"status": "FAILED"}
                        )
                    except Exception as sb_err:
                        print(f"[!] Supabase status update notice: {sb_err}")
                return False, {"error": f"Territorial.io API rejected transfer: {err_msg}"}

            # 3. Payout Succeeded: Finalize total_withdrawn_cents, ledger, and withdrawal status
            cur.execute("SELECT deposited_cents, total_withdrawn_cents FROM cbm_accounts WHERE account_name = ?", (account_name,))
            acc_row = cur.fetchone()
            new_balance = acc_row["deposited_cents"] if acc_row else 0
            total_withdrawn = ((acc_row["total_withdrawn_cents"] or 0) + amount_cents) if acc_row else amount_cents
            cur.execute("""
                UPDATE cbm_accounts
                SET total_withdrawn_cents = ?, updated_at = ?
                WHERE account_name = ?
            """, (total_withdrawn, now_ts, account_name))

            # Add ledger record
            tx_hash = f"W-{withdrawal_id}-{int(now_ts)}"
            cur.execute("""
                INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                VALUES (?, 'WITHDRAWAL', ?, ?, ?, ?, ?)
            """, (account_name, -amount_cents, new_balance, tx_hash, f"Withdrawal of {amount_gold} Gold to {target_account} (Game fee covered by Clan Bank)", now_ts))

            cur.execute("UPDATE cbm_withdrawals SET status = 'EXECUTED', executed_at = ?, tx_id = ? WHERE id = ?", (now_ts, tx_hash, withdrawal_id))
            conn_sq.commit()
        finally:
            conn_sq.close()

        # Supabase dual-write
        if self.db.use_supabase:
            try:
                self.db._sb_request(
                    "cbm_accounts",
                    method="PATCH",
                    params=f"?account_name=eq.{account_name}",
                    body={"deposited_cents": new_balance, "total_withdrawn_cents": total_withdrawn}
                )
                self.db._sb_request(
                    "cbm_ledger",
                    method="POST",
                    body={
                        "account_name": account_name,
                        "entry_type": "WITHDRAWAL",
                        "amount_cents": -amount_cents,
                        "balance_after_cents": new_balance,
                        "tx_hash": tx_hash,
                        "notes": f"Withdrawal of {amount_gold} Gold to {target_account} (Game fee covered by Clan Bank)"
                    }
                )
                iso_now = datetime.datetime.now(datetime.timezone.utc).isoformat()
                self.db._sb_request(
                    "cbm_withdrawals",
                    method="PATCH",
                    params=f"?account_name=eq.{account_name}&status=eq.PENDING&amount_gold=eq.{amount_gold}",
                    body={
                        "status": "EXECUTED",
                        "executed_at": iso_now,
                        "tx_id": tx_hash
                    }
                )
            except Exception as sb_err:
                print(f"[!] Supabase withdrawal sync notice: {sb_err}")

        # Atomically deduct outbound assets from vault total in treasury
        treasury = self.db.get_treasury()
        curr_vault = max(0, treasury.get("vault_total_gold_cents", 0) - amount_cents)
        self.db.update_vault_balance(curr_vault)
        self.db.recompute_treasury()

        return True, {"status": "ok", "api_response": api_res, "new_balance_gold": new_balance / 100.0, "tx_id": tx_hash}

    def process_pending_queue(self, max_batch: int = 5) -> int:
        """
        Scans for and executes any pending withdrawals in chronological order.
        Stale requests older than 12 hours are marked EXPIRED to avoid unexpected delayed transfers.
        """
        if not self.client or not self.vault_password:
            return 0

        # Sync any pending requests from Supabase
        if self.db.use_supabase:
            try:
                st, sb_rows = self.db._sb_request("cbm_withdrawals", "GET", "?status=eq.PENDING&order=created_at.asc&limit=10")
                if st == 200 and isinstance(sb_rows, list) and sb_rows:
                    conn_sq = self._get_db_conn(timeout=30.0)
                    cur = conn_sq.cursor()
                    for r in sb_rows:
                        acc = r.get("account_name")
                        tgt = r.get("target_account") or acc
                        amt = int(r.get("amount_gold") or 0)
                        cur.execute("SELECT id FROM cbm_withdrawals WHERE account_name = ? AND amount_gold = ? AND status = 'PENDING'", (acc, amt))
                        if not cur.fetchone():
                            cur.execute("""
                                INSERT INTO cbm_withdrawals (account_name, target_account, amount_gold, fee_cents, status, created_at)
                                VALUES (?, ?, ?, 0, 'PENDING', ?)
                            """, (acc, tgt, amt, time.time()))
                    conn_sq.commit()
                    conn_sq.close()
            except Exception as e:
                print(f"[!] Error fetching remote pending withdrawals: {e}")

        conn_sq = self._get_db_conn(timeout=30.0)
        conn_sq.row_factory = sqlite3.Row
        cur = conn_sq.cursor()
        now = time.time()
        # Expire stale requests older than 12 hours (43200s)
        cur.execute("UPDATE cbm_withdrawals SET status = 'EXPIRED' WHERE status = 'PENDING' AND (? - created_at) > 43200", (now,))
        conn_sq.commit()

        cur.execute("SELECT id, account_name, amount_gold, created_at FROM cbm_withdrawals WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ?", (max_batch,))
        pending = [dict(r) for r in cur.fetchall()]
        conn_sq.close()

        processed_count = 0
        for req in pending:
            w_id = req["id"]
            ok, res = self.execute_withdrawal(w_id)
            if ok:
                processed_count += 1
                print(f"[+] Processed queued withdrawal #{w_id} ({req['amount_gold']} Gold for '{req['account_name']}').")
            else:
                print(f"[!] Failed queued withdrawal #{w_id}: {res.get('error')}")

        return processed_count

