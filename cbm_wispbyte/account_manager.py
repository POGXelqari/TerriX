#!/usr/bin/env python3
"""
CBM Account & Payment Method Manager
====================================
Manages CBM user accounts and linked Territorial.io payment methods (credentials):
1. Input-based verification: Validates account_name + password via Territorial.io API
2. Transaction-based verification: Scrapes public ledger to verify inbound deposit
"""

import os
import sys
import time
from typing import Dict, Any, Tuple, List, Optional
from db_layer import CBMDatabase

from gold_api_client import TerritorialGoldClient

class CBMAccountManager:
    def __init__(self, db: CBMDatabase, vault_account: str = "DdcBC"):
        self.db = db
        self.vault_account = vault_account.strip()

    def link_via_input(
        self,
        cbm_username: str,
        territorial_account: str,
        territorial_password: str,
        display_name: Optional[str] = None,
        is_primary: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Links a Territorial.io account by verifying provided credentials against the game API.
        """
        terri_acc = territorial_account.strip()
        terri_pass = territorial_password.strip()

        if not terri_acc or not terri_pass:
            return False, "Both account name and password are required for credential linking.", {}

        # Verify against Territorial.io API
        client = TerritorialGoldClient(terri_acc, terri_pass)
        acc_data = client.get_account_data()

        if acc_data.get("status") != "ok":
            err_msg = acc_data.get("status", "Unknown API error")
            return False, f"Territorial.io credentials invalid: {err_msg}", {}

        # Account is valid! Fetch in-game display name
        raw_data = acc_data.get("account_data", {})
        game_username = raw_data.get("username", terri_acc)

        pm = self.db.link_payment_method(
            cbm_username=cbm_username,
            territorial_account=terri_acc,
            territorial_password=terri_pass,
            verification_type="INPUT_CREDENTIALS",
            display_name=display_name or game_username,
            is_primary=is_primary
        )

        return True, f"Successfully linked '{terri_acc}' ({game_username}) via verified credentials.", pm

    def link_via_transaction(
        self,
        cbm_username: str,
        territorial_account: str,
        display_name: Optional[str] = None,
        is_primary: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Zero-password linking: Checks if the territorial account has ever deposited to the CBM Vault.
        If a confirmed inbound deposit is found in the ledger, the payment method is verified and linked.
        """
        terri_acc = territorial_account.strip()
        if not terri_acc:
            return False, "Territorial account name is required.", {}

        # 1. Check local processed transactions cache
        import sqlite3
        conn = sqlite3.connect(self.db.sqlite_path)
        cur = conn.cursor()
        cur.execute("""
            SELECT SUM(amount_gold), COUNT(*) 
            FROM cbm_processed_txs 
            WHERE sender = ? AND receiver = ?
        """, (terri_acc, self.vault_account))
        row = cur.fetchone()
        conn.close()

        has_deposited = row and row[1] > 0
        total_deposited = (row[0] or 0.0) if row else 0.0

        # 2. If not found locally, check live public transactions ledger
        if not has_deposited:
            txs = TerritorialGoldClient.get_public_transactions(limit=100, filter_account=terri_acc)
            for tx in txs:
                if tx["sender"].lower() == terri_acc.lower() and tx["receiver"].lower() == self.vault_account.lower():
                    has_deposited = True
                    total_deposited += tx["amount_gold"]

        if not has_deposited:
            return False, (
                f"No verified deposit found from '{terri_acc}' to vault '{self.vault_account}'. "
                f"To verify via transaction, send at least 1 Gold in-game to {self.vault_account}."
            ), {}

        pm = self.db.link_payment_method(
            cbm_username=cbm_username,
            territorial_account=terri_acc,
            territorial_password=None,
            verification_type="TRANSACTION_VERIFIED",
            display_name=display_name or terri_acc,
            is_primary=is_primary
        )

        return True, f"Successfully verified and linked '{terri_acc}' via confirmed deposit history ({total_deposited} Gold transacted).", pm

    def get_user_payment_methods(self, cbm_username: str) -> List[Dict[str, Any]]:
        return self.db.get_payment_methods(cbm_username)
