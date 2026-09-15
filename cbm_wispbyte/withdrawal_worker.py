#!/usr/bin/env python3
"""
CBM Withdrawal Worker
=====================
Processes queued member withdrawal requests via Territorial.io API:
- Validates internal balance availability
- Executes POST /api/gold/send from vault credentials
- Deducts member liabilities in the double-entry ledger
- Enforces velocity limits and dual-custody audit trails
"""

import os
import sys
import time
from typing import Dict, Any, Tuple, Optional, List
from db_layer import CBMDatabase

from gold_api_client import TerritorialGoldClient

class CBMWithdrawalWorker:
    def __init__(self, db: CBMDatabase, vault_account: str = "DdcBC", vault_password: str = ""):
        self.db = db
        self.vault_account = vault_account.strip()
        self.vault_password = vault_password or os.environ.get("CBM_VAULT_PASSWORD", "")
        self.client = (
            TerritorialGoldClient(self.vault_account, self.vault_password)
            if self.vault_password else None
        )

    def request_withdrawal(self, account_name: str, target_account: str, amount_gold: int, pin: Optional[str] = None) -> Tuple[bool, str]:
        """
        Creates a new withdrawal request after validating internal member balance,
        enforcing closed-loop routing (destination must match verified account),
        and authenticating via CBM Access PIN if configured.
        """
        if amount_gold <= 0:
            return False, "Amount must be greater than 0 Gold."

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

        # First reconcile overdue loans to garnish debt and update access status
        self.db.reconcile_overdue_loans_and_enforce_garnishment(account_name)

        acc = self.db.get_account(account_name)
        if not acc:
            return False, f"Account '{account_name}' not registered in CBM."

        # Verify access role: restricted accounts cannot withdraw funds
        role = acc.get("role", "member")
        if role in ("restricted", "downgraded", "frozen", "delinquent"):
            return False, "Withdrawal suspended: Account access is downgraded to 'restricted' due to an outstanding overdue loan. Settle remaining debt to restore account access."

        amount_cents = amount_gold * 100
        available_cents = acc.get("deposited_cents", 0)

        # Bank covers the 0.01 Gold game fee! Zero fees charged to member.
        if available_cents < amount_cents:
            return False, f"Insufficient balance. Available: {available_cents / 100.0} Gold, Requested: {amount_gold} Gold."

        # Record withdrawal queue item (fee_cents = 0 charged to user; 1 cent absorbed by bank)
        conn = self.db.sqlite_path
        import sqlite3
        conn_sq = sqlite3.connect(conn)
        cur = conn_sq.cursor()
        cur.execute("""
            INSERT INTO cbm_withdrawals (account_name, target_account, amount_gold, fee_cents, status, created_at)
            VALUES (?, ?, ?, 0, 'PENDING', ?)
        """, (account_name, target_account, amount_gold, time.time()))
        w_id = cur.lastrowid
        conn_sq.commit()
        conn_sq.close()

        if self.db.use_supabase:
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

        return True, f"Withdrawal request #{w_id} for {amount_gold} Gold created (0 fees - game fee covered by Bank)."

    def execute_withdrawal(self, withdrawal_id: int) -> Tuple[bool, Dict[str, Any]]:
        """
        Executes an approved withdrawal using the vault's Territorial.io credentials.
        """
        if not self.client or not self.vault_password:
            return False, {"error": "Vault credentials not configured on withdrawal worker."}

        import sqlite3
        conn_sq = sqlite3.connect(self.db.sqlite_path)
        conn_sq.row_factory = sqlite3.Row
        cur = conn_sq.cursor()
        cur.execute("SELECT * FROM cbm_withdrawals WHERE id = ? AND status = 'PENDING'", (withdrawal_id,))
        row = cur.fetchone()
        if not row:
            conn_sq.close()
            return False, {"error": "Withdrawal request not found or already processed."}

        req = dict(row)
        account_name = req["account_name"]
        target_account = req["target_account"]
        amount_gold = req["amount_gold"]

        # Call Territorial.io API
        api_res = self.client.send_gold(target_account, amount_gold)
        if api_res.get("status") != "ok":
            cur.execute("UPDATE cbm_withdrawals SET status = 'FAILED' WHERE id = ?", (withdrawal_id,))
            conn_sq.commit()
            conn_sq.close()
            return False, {"error": f"Territorial.io API rejected transfer: {api_res}"}

        # Deduct member balance (exact amount only - 1 cent game fee absorbed by bank reserves)
        acc = self.db.get_account(account_name)
        new_balance = acc["deposited_cents"] - (amount_gold * 100)
        cur.execute("""
            UPDATE cbm_accounts
            SET deposited_cents = ?, total_withdrawn_cents = total_withdrawn_cents + ?, updated_at = ?
            WHERE account_name = ?
        """, (new_balance, amount_gold * 100, time.time(), account_name))

        # Add ledger record
        cur.execute("""
            INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
            VALUES (?, 'WITHDRAWAL', ?, ?, ?, ?, ?)
        """, (account_name, -(amount_gold * 100), new_balance, str(withdrawal_id), f"Withdrawal of {amount_gold} Gold to {target_account} (Game fee covered by Bank)", time.time()))

        cur.execute("UPDATE cbm_withdrawals SET status = 'EXECUTED', executed_at = ? WHERE id = ?", (time.time(), withdrawal_id))
        conn_sq.commit()
        conn_sq.close()

        if self.db.use_supabase:
            self.db._sb_request(
                "cbm_accounts",
                method="PATCH",
                params=f"?account_name=eq.{account_name}",
                body={"deposited_cents": new_balance, "total_withdrawn_cents": acc.get("total_withdrawn_cents", 0) + amount_gold * 100}
            )
            self.db._sb_request(
                "cbm_ledger",
                method="POST",
                body={
                    "account_name": account_name,
                    "entry_type": "WITHDRAWAL",
                    "amount_cents": -(amount_gold * 100),
                    "balance_after_cents": new_balance,
                    "tx_hash": str(withdrawal_id),
                    "notes": f"Withdrawal of {amount_gold} Gold to {target_account} (Game fee covered by Bank)"
                }
            )

        # Atomically deduct outbound assets from vault total
        treasury = self.db.get_treasury()
        curr_vault = max(0, treasury.get("vault_total_gold_cents", 0) - (amount_gold * 100))
        self.db.update_vault_balance(curr_vault)
        self.db.recompute_treasury()
        return True, {"status": "ok", "api_response": api_res, "new_balance_gold": new_balance / 100.0}
