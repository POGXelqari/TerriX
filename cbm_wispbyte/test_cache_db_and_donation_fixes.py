#!/usr/bin/env python3
import os
import sys
import time
import sqlite3
import unittest
import tempfile
import shutil

sys.path.insert(0, os.path.dirname(__file__))

from db_layer import CBMDatabase, _row_to_dict
from status_engine import CBMStatusEngine
from withdrawal_worker import CBMWithdrawalWorker

class TestFixesVerification(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "test_cbm.db")
        # Initialize db with test sqlite file
        self.db = CBMDatabase(sqlite_path=self.db_path, use_supabase=False)

    def tearDown(self):
        try:
            if hasattr(self.db, "_local") and hasattr(self.db._local, "conn") and self.db._local.conn:
                self.db._local.conn.close()
        except Exception:
            pass
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_row_to_dict_resilience(self):
        """Verify _row_to_dict handles tuples, sqlite3.Row, and objects safely."""
        # 1. Plain tuple with cur description
        conn = sqlite3.connect(":memory:")
        cur = conn.cursor()
        cur.execute("SELECT 'slip_6669c024686a8ecfe20d4347' AS id, 10000 AS amount_cents")
        tuple_row = cur.fetchone()
        d = _row_to_dict(tuple_row, cur)
        self.assertEqual(d["id"], "slip_6669c024686a8ecfe20d4347")
        self.assertEqual(d["amount_cents"], 10000)

        # 2. sqlite3.Row
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT 'slip_123' AS id, 5000 AS amount_cents")
        row_obj = cur.fetchone()
        d2 = _row_to_dict(row_obj, cur)
        self.assertEqual(d2["id"], "slip_123")
        self.assertEqual(d2["amount_cents"], 5000)

        # 3. None row
        self.assertEqual(_row_to_dict(None), {})
        conn.close()

    def test_donation_slip_claim_and_unpacking(self):
        """Verify find_and_claim_pending_donation handles 17+ char slip IDs without error."""
        # Create a pending donation slip
        slip_id = "slip_b3fa05a7ae626b" # 17 characters
        now = time.time()
        with self.db.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_pending_donations (id, account_name, amount_cents, amount_gold, message, status, created_at, expires_at)
                VALUES (?, 'B8bbq', 11000, 110.0, 'ANTI-OG War Chest', 'PENDING', ?, ?)
            """, (slip_id, now, now + 900))

        # Claim the donation slip
        claimed = self.db.find_and_claim_pending_donation("B8bbq", 11000, "tx_test_claim_123")
        self.assertIsNotNone(claimed, "Donation slip should be claimed successfully")
        self.assertEqual(claimed["id"], slip_id)
        self.assertEqual(claimed["status"], "PENDING") # pre-update slip status in dict
        self.assertEqual(claimed["actual_amount_cents"], 11000)
        self.assertEqual(claimed["variance_cents"], 0)

        # Verify slip status is now FULFILLED in database
        slip = self.db.get_donation_slip_by_id(slip_id)
        self.assertIsNotNone(slip)
        self.assertEqual(slip["status"], "FULFILLED")
        self.assertEqual(slip["tx_hash"], "tx_test_claim_123")

    def test_credit_deposit_resilience(self):
        """Verify credit_deposit does not crash on missing or new accounts."""
        res = self.db.credit_deposit("NewPlayer123", 500, "tx_dep_test_999")
        self.assertIsNotNone(res)
        self.assertGreaterEqual(res["deposited_cents"], 500)

    def test_status_engine_missing_table_self_healing(self):
        """Verify status engine gracefully handles missing incidents/uptime table without unhandled crash."""
        status_engine = CBMStatusEngine(port=8080, db_instance=self.db)
        # Drop the table to simulate post-recovery clean slate before status_engine _init_tables
        with self.db.write_transaction() as (conn, cur):
            cur.execute("DROP TABLE IF EXISTS cbm_service_incidents")
            cur.execute("DROP TABLE IF EXISTS cbm_service_daily_uptime")

        # Telemetry query should not crash
        telemetry = status_engine.get_system_telemetry()
        self.assertIsNotNone(telemetry)
        self.assertIn("services", telemetry)
        self.assertIn("active_incidents", telemetry)
        self.assertEqual(telemetry["active_incidents"], [])

    def test_sqlite_core_schema_includes_status_tables(self):
        """Verify _init_sqlite creates cbm_service_incidents and cbm_service_daily_uptime."""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {r[0] for r in cur.fetchall()}
        self.assertIn("cbm_service_incidents", tables)
        self.assertIn("cbm_service_daily_uptime", tables)
    def test_withdrawal_worker_atomic_reservation(self):
        """Verify withdrawal worker executes atomic balance reservation and rollback via write_transaction."""
        acc_name = "Withdrawer1"
        self.db.credit_deposit(acc_name, 1000, "tx_dep_initial") # 10.00 Gold (+ 1 cent fee rebate = 1001)

        worker = CBMWithdrawalWorker(self.db, vault_account="DdcBC", vault_password="test_password")
        
        # Mock client to fail
        class MockClientFail:
            def send_gold(self, target, amount):
                return {"status": "error", "message": "Simulated in-game network failure"}

        worker._client = MockClientFail()
        ok, msg = worker.request_withdrawal(acc_name, acc_name, 5) # 5 Gold
        self.assertFalse(ok)
        self.assertIn("Simulated in-game network failure", msg)
        
        # Balance must remain intact after rollback
        acc = self.db.get_account(acc_name)
        self.assertEqual(acc["deposited_cents"], 1001)

        # Mock client to succeed
        class MockClientSuccess:
            def send_gold(self, target, amount):
                return {"status": "ok", "tx_id": "tx_mock_success_555"}

        worker._client = MockClientSuccess()
        ok2, msg2 = worker.request_withdrawal(acc_name, acc_name, 5) # 5 Gold
        self.assertTrue(ok2)
        
        # Balance must be decremented by 500 cents
        acc_after = self.db.get_account(acc_name)
        self.assertEqual(acc_after["deposited_cents"], 501)
        self.assertEqual(acc_after["total_withdrawn_cents"], 500)

if __name__ == "__main__":
    unittest.main()

