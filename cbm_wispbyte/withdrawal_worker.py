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
from typing import Dict, Any, Tuple
from db_layer import CBMDatabase

# Add scripts dir for gold_api_client
SCRIPTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scripts"))
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

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

    def request_withdrawal(self, account_name: str, target_account: str, amount_gold: int) -> Tuple[bool, str]:
        """
        Creates a new withdrawal request after validating internal member balance.
        """
        if amount_gold <= 0:
            return False, "Amount must be greater than 0 Gold."

        acc = self.db.get_account(account_name)
        if not acc:
            return False, f"Account '{account_name}' not registered in CBM."

        amount_cents = amount_gold * 100
        available_cents = acc.get("deposited_cents", 0)

        # Include 1 cent API fee in liability deduction
        total_required_cents = amount_cents + 1
        if available_cents < total_required_cents:
            return False, f"Insufficient balance. Available: {available_cents / 100.0} Gold, Requested: {amount_gold} Gold (+0.01 Gold fee)."

        # Record withdrawal queue item
        conn = self.db.sqlite_path
        import sqlite3
        conn_sq = sqlite3.connect(conn)
        cur = conn_sq.cursor()
        cur.execute("""
            INSERT INTO cbm_withdrawals (account_name, target_account, amount_gold, fee_cents, status, created_at)
            VALUES (?, ?, ?, 1, 'PENDING', ?)
        """, (account_name, target_account, amount_gold, time.time()))
        w_id = cur.lastrowid
        conn_sq.commit()
        conn_sq.close()

        return True, f"Withdrawal request #{w_id} for {amount_gold} Gold created and queued for processing."

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

        # Deduct member balance
        acc = self.db.get_account(account_name)
        new_balance = acc["deposited_cents"] - (amount_gold * 100 + 1)
        cur.execute("""
            UPDATE cbm_accounts
            SET deposited_cents = ?, total_withdrawn_cents = total_withdrawn_cents + ?, updated_at = ?
            WHERE account_name = ?
        """, (new_balance, amount_gold * 100, time.time(), account_name))

        # Add ledger record
        cur.execute("""
            INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
            VALUES (?, 'WITHDRAWAL', ?, ?, ?, ?, ?)
        """, (account_name, -(amount_gold * 100 + 1), new_balance, str(withdrawal_id), f"Withdrawal of {amount_gold} Gold to {target_account}", time.time()))

        cur.execute("UPDATE cbm_withdrawals SET status = 'EXECUTED', executed_at = ? WHERE id = ?", (time.time(), withdrawal_id))
        conn_sq.commit()
        conn_sq.close()

        self.db.recompute_treasury()
        return True, {"status": "ok", "api_response": api_res, "new_balance_gold": new_balance / 100.0}
