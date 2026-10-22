#!/usr/bin/env python3
"""
Test Suite: Automated 30-Day Idle Unassociated Deposit Conversion to Unencumbered Reserves
========================================================================================
Validates:
1. Unassociated territorial.io deposits sitting idle for >= 30 days are converted 1:1 to unencumbered bank reserves.
2. Member liabilities decrease and unencumbered capital increases dynamically.
3. Registered CBM accounts (with credentials / verification) are protected and never converted.
4. Accounts linked via cbm_payment_methods or primary_territorial_account are recognized as associated and protected.
5. Deposits with activity within 30 days are preserved.
6. HTTP API endpoints (GET /api/cbm/treasury/idle-deposits, POST /api/cbm/treasury/sweep-idle).
"""

import os
import sys
import time
import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ["CBM_ENV"] = "test"
os.environ["CBM_TESTING"] = "1"

import main
from main import CBMHealthHandler, db


class TestIdleDepositConversion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        main.load_static_cache()
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.base_url = f"http://127.0.0.1:{cls.port}"

        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    def setUp(self):
        conn = db.get_write_connection()
        conn.execute("DELETE FROM cbm_accounts WHERE LOWER(account_name) != 'b8bbq'")
        conn.execute("DELETE FROM cbm_payment_methods")
        conn.execute("DELETE FROM cbm_donations")
        conn.execute("DELETE FROM cbm_ledger")
        conn.commit()
        conn.close()
        db.register_or_get_account("B8bbq")
        db.recompute_treasury(vault_gold=100000.0)

    def _request(self, method: str, path: str, body=None, headers=None):
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        all_headers = {"Content-Type": "application/json"}
        if headers:
            all_headers.update(headers)
        req = urllib.request.Request(url, data=data, headers=all_headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                resp_body = resp.read().decode("utf-8")
                return resp.status, json.loads(resp_body) if resp_body else {}, resp.headers
        except urllib.error.HTTPError as err:
            err_body = err.read().decode("utf-8")
            try:
                parsed = json.loads(err_body)
            except Exception:
                parsed = {"raw": err_body}
            return err.code, parsed, err.headers

    def test_unassociated_30_day_idle_deposit_converts_to_unencumbered_reserves(self):
        """Validates that pure territorial.io deposits idle >= 30 days convert to unencumbered reserves."""
        now = time.time()
        idle_timestamp = now - (35 * 86400.0)  # 35 days ago

        # 1. Simulate an inbound pure in-game deposit from an unassociated territorial account
        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, total_deposited_cents, created_at, updated_at, is_verified)
            VALUES ('Unassoc_Player1', 'Unassoc_Player1', 50000, 50000, ?, ?, 0)
        """, (idle_timestamp, idle_timestamp))
        conn.execute("""
            INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
            VALUES ('Unassoc_Player1', 'DEPOSIT', 50000, 50000, 'tx_init_unassoc_1', 'Inbound Vault Transfer', ?)
        """, (idle_timestamp,))
        conn.commit()
        conn.close()

        # Recompute baseline treasury
        t_before = db.recompute_treasury(vault_gold=10000.0)
        self.assertGreaterEqual(t_before["member_liabilities_cents"], 50000)
        reserves_before = t_before["bank_reserves_cents"]
        unencumbered_before = t_before["unencumbered_capital_cents"]

        # 2. Check candidate detection
        candidates = db.get_unassociated_idle_deposits(min_idle_seconds=30 * 86400.0)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["account_name"], "Unassoc_Player1")
        self.assertEqual(candidates[0]["deposited_gold"], 500.0)
        self.assertGreaterEqual(candidates[0]["idle_days"], 34.9)

        # 3. Execute automated sweep
        sweep_res = db.sweep_idle_unassociated_deposits(max_idle_seconds=30 * 86400.0)
        self.assertEqual(sweep_res["status"], "ok")
        self.assertEqual(sweep_res["swept_count"], 1)
        self.assertEqual(sweep_res["total_converted_gold"], 500.0)
        self.assertEqual(sweep_res["total_converted_cents"], 50000)

        # 4. Verify account balance zeroed
        acc_after = db.get_account("Unassoc_Player1")
        self.assertEqual(acc_after["deposited_cents"], 0)
        self.assertEqual(acc_after["deposited_gold"], 0.0)

        # 5. Verify ledger entry
        conn = db.get_write_connection()
        cur = conn.cursor()
        cur.execute("SELECT entry_type, amount_cents, balance_after_cents FROM cbm_ledger WHERE account_name = 'Unassoc_Player1' ORDER BY id DESC LIMIT 1")
        ledg_row = cur.fetchone()
        self.assertIsNotNone(ledg_row)
        self.assertEqual(ledg_row[0], "UNENCUMBERED_CONVERSION")
        self.assertEqual(ledg_row[1], -50000)
        self.assertEqual(ledg_row[2], 0)

        # 6. Verify cbm_donations record
        cur.execute("SELECT amount_gold, amount_cents, source, status FROM cbm_donations WHERE territorial_account = 'Unassoc_Player1'")
        don_row = cur.fetchone()
        self.assertIsNotNone(don_row)
        self.assertEqual(don_row[0], 500.0)
        self.assertEqual(don_row[1], 50000)
        self.assertEqual(don_row[2], "IDLE_DEPOSIT_EXPIRATION")
        self.assertEqual(don_row[3], "IRREVOCABLE")
        conn.close()

        # 7. Verify Treasury Impact
        t_after = db.get_treasury()
        self.assertEqual(t_after["unencumbered_capital_cents"], unencumbered_before + 50000)
        self.assertEqual(t_after["bank_reserves_cents"], reserves_before + 50000)

    def test_registered_cbm_accounts_are_protected_from_conversion(self):
        """Validates that registered/verified CBM members are NOT converted even if idle > 30 days."""
        now = time.time()
        idle_timestamp = now - (60 * 86400.0)  # 60 days ago

        # Registered CBM account with PIN and verification
        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, total_deposited_cents, created_at, updated_at, is_verified, pin_hash)
            VALUES ('CBM_VerifiedUser', 'Commander Verified', 25000, 25000, ?, ?, 1, 'fake_pin_hash')
        """, (idle_timestamp, idle_timestamp))
        conn.commit()
        conn.close()

        # Candidate check must return empty
        candidates = db.get_unassociated_idle_deposits(min_idle_seconds=30 * 86400.0)
        self.assertEqual(len(candidates), 0)

        # Sweep must do nothing to this account
        sweep_res = db.sweep_idle_unassociated_deposits(max_idle_seconds=30 * 86400.0)
        self.assertEqual(sweep_res["swept_count"], 0)

        acc = db.get_account("CBM_VerifiedUser")
        self.assertEqual(acc["deposited_cents"], 25000)
        self.assertEqual(acc["deposited_gold"], 250.0)

    def test_associated_via_payment_method_or_primary_territorial_are_protected(self):
        """Validates that territorial accounts linked to a registered CBM member are protected."""
        now = time.time()
        idle_timestamp = now - (40 * 86400.0)

        # Registered CBM master account
        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, created_at, updated_at, is_verified, password_hash)
            VALUES ('CBM_MasterAccount', 'Master Account', 0, ?, ?, 1, 'fake_hash')
        """, (idle_timestamp, idle_timestamp))

        # Territorial account 1: Linked via cbm_payment_methods
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, created_at, updated_at, is_verified)
            VALUES ('Terri_Alt_Linked', 'Terri_Alt_Linked', 15000, ?, ?, 0)
        """, (idle_timestamp, idle_timestamp))
        conn.execute("""
            INSERT INTO cbm_payment_methods (cbm_username, territorial_account_name, status, linked_at, last_used_at)
            VALUES ('CBM_MasterAccount', 'Terri_Alt_Linked', 'VERIFIED', ?, ?)
        """, (idle_timestamp, idle_timestamp))

        # Territorial account 2: Linked via primary_territorial_account of another registered CBM member
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, primary_territorial_account, deposited_cents, created_at, updated_at, is_verified, pin_hash)
            VALUES ('CBM_SecondUser', 'Second User', 'Terri_Primary_Alt', 0, ?, ?, 1, 'fake_pin')
        """, (idle_timestamp, idle_timestamp))
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, created_at, updated_at, is_verified)
            VALUES ('Terri_Primary_Alt', 'Terri_Primary_Alt', 12000, ?, ?, 0)
        """, (idle_timestamp, idle_timestamp))
        conn.commit()
        conn.close()

        # Both linked accounts must be excluded from candidates
        candidates = db.get_unassociated_idle_deposits(min_idle_seconds=30 * 86400.0)
        self.assertEqual(len(candidates), 0)

        sweep_res = db.sweep_idle_unassociated_deposits(max_idle_seconds=30 * 86400.0)
        self.assertEqual(sweep_res["swept_count"], 0)

        conn = db.get_write_connection()
        cur = conn.cursor()
        cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = 'Terri_Alt_Linked'")
        row1 = cur.fetchone()
        cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = 'Terri_Primary_Alt'")
        row2 = cur.fetchone()
        conn.close()

        self.assertIsNotNone(row1)
        self.assertEqual(row1[0], 15000)
        self.assertIsNotNone(row2)
        self.assertEqual(row2[0], 12000)

    def test_recent_activity_within_30_days_is_preserved(self):
        """Validates that unassociated accounts with deposits < 30 days old are NOT swept."""
        now = time.time()
        recent_timestamp = now - (10 * 86400.0)  # Only 10 days ago

        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, created_at, updated_at, is_verified)
            VALUES ('Unassoc_RecentUser', 'Unassoc_RecentUser', 10000, ?, ?, 0)
        """, (recent_timestamp, recent_timestamp))
        conn.commit()
        conn.close()

        candidates = db.get_unassociated_idle_deposits(min_idle_seconds=30 * 86400.0)
        self.assertEqual(len(candidates), 0)

        sweep_res = db.sweep_idle_unassociated_deposits(max_idle_seconds=30 * 86400.0)
        self.assertEqual(sweep_res["swept_count"], 0)

        acc = db.get_account("Unassoc_RecentUser")
        self.assertEqual(acc["deposited_cents"], 10000)

    def test_http_api_endpoints_for_idle_deposits(self):
        """Validates GET /api/cbm/treasury/idle-deposits and POST /api/cbm/treasury/sweep-idle."""
        now = time.time()
        old_time = now - (32 * 86400.0)

        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_accounts (account_name, display_name, deposited_cents, created_at, updated_at, is_verified)
            VALUES ('API_Idle_Tester', 'API_Idle_Tester', 7500, ?, ?, 0)
        """, (old_time, old_time))
        conn.commit()
        conn.close()

        # 1. GET inspection endpoint
        status, data, _ = self._request("GET", "/api/cbm/treasury/idle-deposits?min_days=30")
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("policy_idle_days"), 30.0)
        self.assertGreaterEqual(data.get("count", 0), 1)
        found = [d for d in data.get("unassociated_idle_deposits", []) if d["account_name"] == "API_Idle_Tester"]
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["deposited_gold"], 75.0)

        # 2. POST sweep endpoint
        status, sweep_data, _ = self._request("POST", "/api/cbm/treasury/sweep-idle", {"max_idle_days": 30.0})
        self.assertEqual(status, 200)
        self.assertEqual(sweep_data.get("status"), "ok")
        self.assertGreaterEqual(sweep_data.get("sweep_result", {}).get("swept_count", 0), 1)
        self.assertGreaterEqual(sweep_data.get("sweep_result", {}).get("total_converted_gold", 0), 75.0)

        # 3. Verify balance cleared
        acc = db.get_account("API_Idle_Tester")
        self.assertEqual(acc["deposited_cents"], 0)


if __name__ == "__main__":
    unittest.main()
