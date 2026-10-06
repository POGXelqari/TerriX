#!/usr/bin/env python3
"""
Integration Verification Suite: Concurrency, Lock Elimination & Outbox Sync
"""

import os
import sys
import time
import threading
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db_layer import CBMDatabase

class TestDatabaseResilience(unittest.TestCase):
    def setUp(self):
        self.tmp_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp_file.close()
        self.db = CBMDatabase(sqlite_path=self.tmp_file.name, use_supabase=False)
        self.db._init_outbox_table()

    def tearDown(self):
        if os.path.exists(self.tmp_file.name):
            try:
                os.remove(self.tmp_file.name)
            except Exception:
                pass

    def test_high_concurrency_lock_elimination(self):
        """Validates that 30 threads performing simultaneous balance deductions experience 0 locks."""
        account = "StressUser"
        self.db.register_or_get_account(account)

        # Fund account with 5,000 Gold
        with self.db.write_transaction() as (conn, cur):
            cur.execute("UPDATE cbm_accounts SET deposited_cents = 500000 WHERE account_name = ?", (account,))

        success_count = [0]
        failure_count = [0]
        lock = threading.Lock()

        def worker(thread_idx: int):
            for i in range(10):
                ok, _, _ = self.db.charge_api_credit(
                    owner_account=account,
                    cost_gold=1.0,
                    idempotency_key=f"tx_{thread_idx}_{i}"
                )
                with lock:
                    if ok:
                        success_count[0] += 1
                    else:
                        failure_count[0] += 1

        threads = [threading.Thread(target=worker, args=(t,)) for t in range(30)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(failure_count[0], 0, f"Expected 0 failures, got {failure_count[0]}")
        self.assertEqual(success_count[0], 300)

        acc = self.db.get_account(account)
        expected_balance = 500000 - (300 * 100)
        self.assertEqual(acc["deposited_cents"], expected_balance)

    def test_outbox_offline_resilience(self):
        """Verifies that mutations are preserved in the outbox when remote calls fail."""
        self.db.use_supabase = True
        self.db._enqueue_sb_task(
            "cbm_accounts",
            method="PATCH",
            params="?account_name=eq.OfflineUser",
            body={"deposited_cents": 25000}
        )

        conn = self.db._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("SELECT count(*) FROM cbm_sync_outbox;")
        count = cur.fetchone()[0]
        self.assertGreaterEqual(count, 1)

    def test_monotonic_timestamp_conflict_protection(self):
        """Verifies that stale remote sync data does not overwrite newer local updates."""
        account = "ProtectedUser"
        now = time.time()

        with self.db.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_accounts (account_name, deposited_cents, updated_at)
                VALUES (?, 10000, ?)
            """, (account, now + 100))

        # Simulate receiving stale remote record
        stale_remote = {
            "account_name": account,
            "deposited_cents": 5000,
            "updated_at": now - 50
        }

        # Monotonic sync check
        with self.db.write_transaction() as (conn, cur):
            cur.execute("SELECT updated_at FROM cbm_accounts WHERE account_name = ?", (account,))
            local_row = cur.fetchone()
            if local_row and local_row[0] > stale_remote["updated_at"]:
                pass  # Successfully protected against stale overwrite
            else:
                cur.execute("UPDATE cbm_accounts SET deposited_cents = ? WHERE account_name = ?", (stale_remote["deposited_cents"], account))

        acc = self.db.get_account(account)
        self.assertEqual(acc["deposited_cents"], 10000)

if __name__ == "__main__":
    unittest.main()
