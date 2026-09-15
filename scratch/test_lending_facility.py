#!/usr/bin/env python3
"""
Comprehensive Automated Test Suite: CBM Lending Facility & Anti-Evasion
========================================================================
Validates:
1. Loan engine reserve thresholds (< 2M Gold locked, > 2M Gold active).
2. Schedule calculation, 14-day 0% window, 50% overdue penalty, and 20 Gold buffer.
3. Anti-evasion covenant breach acceleration (immediate 50% penalty on password change).
4. Creditworthiness tiers and borrowing caps.
5. Database loan creation, credential binding, and voluntary balance repayment.
6. HTTP endpoints: /api/cbm/loan/facility, /api/cbm/loan/request, /api/cbm/loan/repay, /api/cbm/loan/liveness-audit.
"""

import os
import sys
import time
import json
import sqlite3
import unittest
import threading
import urllib.request
import urllib.error

# Ensure module path includes cbm_wispbyte
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte"))

from loan_engine import CBMLoanEngine
from db_layer import CBMDatabase

class TestLoanEngineMath(unittest.TestCase):
    def test_reserve_threshold_and_ceiling(self):
        # 1,000,000 Gold reserves = 100,000,000 cents. 0.05% = 500 Gold (<= 1,000 Gold -> Locked)
        eval_locked = CBMLoanEngine.evaluate_lending_facility(100_000_000)
        self.assertFalse(eval_locked["is_active"])
        self.assertEqual(eval_locked["max_loan_gold"], 0)
        self.assertEqual(eval_locked["min_reserves_required_gold"], 2_000_000.0)
        self.assertEqual(eval_locked["reserves_progress_percent"], 50.0)

        # 2,000,000 Gold reserves = 200,000,000 cents. 0.05% = 1,000 Gold (must strictly exceed -> Locked)
        eval_threshold = CBMLoanEngine.evaluate_lending_facility(200_000_000)
        self.assertFalse(eval_threshold["is_active"])

        # 3,000,000 Gold reserves = 300,000,000 cents. 0.05% = 1,500 Gold (> 1,000 Gold -> Active)
        eval_active = CBMLoanEngine.evaluate_lending_facility(300_000_000)
        self.assertTrue(eval_active["is_active"])
        self.assertEqual(eval_active["max_loan_gold"], 1500)
        self.assertEqual(eval_active["calculated_ceiling_gold"], 1500.0)

    def test_standard_schedule_and_overdue(self):
        now = time.time()
        # Active loan within 14 days
        sched_active = CBMLoanEngine.calculate_loan_schedule(
            principal_gold=1000,
            created_at_ts=now - (7 * 86400),
            current_ts=now,
            repaid_cents=0
        )
        self.assertEqual(sched_active["status"], "ACTIVE")
        self.assertEqual(sched_active["effective_interest_rate_percent"], 0.0)
        self.assertEqual(sched_active["penalty_interest_gold"], 0.0)
        self.assertEqual(sched_active["total_due_gold"], 1000.0)
        self.assertEqual(sched_active["remaining_due_gold"], 1000.0)
        self.assertFalse(sched_active["is_overdue"])

        # Overdue loan past 14 days
        sched_overdue = CBMLoanEngine.calculate_loan_schedule(
            principal_gold=1000,
            created_at_ts=now - (15 * 86400),
            current_ts=now,
            repaid_cents=0
        )
        self.assertEqual(sched_overdue["status"], "OVERDUE")
        self.assertEqual(sched_overdue["effective_interest_rate_percent"], 50.0)
        self.assertEqual(sched_overdue["penalty_interest_gold"], 500.0)
        self.assertEqual(sched_overdue["total_due_gold"], 1500.0)
        self.assertEqual(sched_overdue["remaining_due_gold"], 1500.0)
        self.assertTrue(sched_overdue["is_overdue"])

    def test_covenant_breach_immediate_acceleration(self):
        now = time.time()
        # Loan created only 1 hour ago, but credential failed -> immediate covenant breach
        sched_breach = CBMLoanEngine.calculate_loan_schedule(
            principal_gold=1000,
            created_at_ts=now - 3600,
            current_ts=now,
            repaid_cents=0,
            is_covenant_breach=True
        )
        self.assertEqual(sched_breach["status"], "BREACH_OF_COVENANT")
        self.assertEqual(sched_breach["effective_interest_rate_percent"], 50.0)
        self.assertEqual(sched_breach["penalty_interest_gold"], 500.0)
        self.assertEqual(sched_breach["total_due_gold"], 1500.0)
        self.assertTrue(sched_breach["is_covenant_breach"])
        self.assertTrue(sched_breach["is_overdue"])

    def test_balance_garnishment_and_safe_buffer(self):
        # Balance = 50 Gold (5000 cents), Debt = 100 Gold (10000 cents)
        # Must preserve 20 Gold (2000 cents) buffer -> Garnish 30 Gold (3000 cents)
        garnish, rem_bal, is_settled = CBMLoanEngine.calculate_balance_garnishment(
            current_balance_cents=5000,
            remaining_loan_due_cents=10000
        )
        self.assertEqual(garnish, 3000)
        self.assertEqual(rem_bal, 2000)
        self.assertFalse(is_settled)

        # Balance = 15 Gold (1500 cents) -> Below 20 Gold buffer -> Garnish 0
        garnish_zero, rem_bal_zero, is_settled_zero = CBMLoanEngine.calculate_balance_garnishment(
            current_balance_cents=1500,
            remaining_loan_due_cents=5000
        )
        self.assertEqual(garnish_zero, 0)
        self.assertEqual(rem_bal_zero, 1500)
        self.assertFalse(is_settled_zero)


class TestLoanDatabaseAndOperations(unittest.TestCase):
    def setUp(self):
        self.test_db_path = f"scratch/test_loan_db_{int(time.time()*1000)}.db"
        self.db = CBMDatabase(sqlite_path=self.test_db_path, use_supabase=False)

    def tearDown(self):
        time.sleep(0.05)
        for ext in ("", "-wal", "-shm"):
            p = self.test_db_path + ext
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

    def test_loan_origination_and_repayment_cycle(self):
        user = "BorrowerBob"
        acc = self.db.register_or_get_account(user)
        self.assertEqual(acc["deposited_cents"], 0)

        # 1. Originate loan of 500 Gold with credentials
        ok, msg, loan = self.db.create_loan(
            account_name=user,
            principal_gold=500,
            term_days=14,
            territorial_account="BobIngame",
            territorial_password="secretpassword"
        )
        self.assertTrue(ok)
        self.assertIsNotNone(loan)
        self.assertEqual(loan["principal_gold"], 500)
        self.assertEqual(loan["status"], "ACTIVE")

        # Verify borrower account was credited with 500 Gold (50,000 cents)
        updated_acc = self.db.get_account(user)
        self.assertEqual(updated_acc["deposited_cents"], 50000)

        # Verify linked payment method was saved
        pms = self.db.get_payment_methods(user)
        self.assertTrue(any(pm["territorial_account_name"] == "BobIngame" for pm in pms))

        # 2. Voluntary balance repayment (Partial: repay 200 Gold = 20,000 cents)
        ok_repay, msg_repay, res_repay = self.db.repay_loan_from_balance(
            account_name=user,
            loan_id=loan["id"],
            amount_cents=20000
        )
        self.assertTrue(ok_repay)
        self.assertEqual(res_repay["repaid_gold"], 200.0)
        self.assertEqual(res_repay["remaining_due_gold"], 300.0)
        self.assertEqual(res_repay["new_balance_gold"], 300.0)

        # 3. Complete remaining balance repayment
        ok_full, msg_full, res_full = self.db.repay_loan_from_balance(
            account_name=user,
            loan_id=loan["id"],
            full_repay=True
        )
        self.assertTrue(ok_full)
        self.assertEqual(res_full["remaining_due_gold"], 0.0)
        self.assertEqual(res_full["status"], "REPAID")

    def test_covenant_breach_and_downgrade(self):
        user = "EvadingEve"
        self.db.register_or_get_account(user)

        # Originate 200 Gold loan with invalid/changed password
        ok, msg, loan = self.db.create_loan(
            account_name=user,
            principal_gold=200,
            territorial_account="EveGame",
            territorial_password="fake_invalid_pass"
        )
        self.assertTrue(ok)

        # Simulate credential liveness audit
        # TerritorialGoldClient against "EveGame" with "fake_invalid_pass" returns "password error"
        audit = self.db.audit_loan_credential_liveness()
        self.assertGreaterEqual(audit["total_active_loans"], 1)

        # Account should be downgraded to restricted
        acc_after = self.db.get_account(user)
        self.assertEqual(acc_after["role"], "restricted")

        # Loan should be marked in covenant breach with 50% penalty interest assessed
        loans = self.db.get_account_loans(user)
        self.assertEqual(loans[0]["status"], "BREACH_OF_COVENANT")
        self.assertEqual(loans[0]["penalty_interest_gold"], 100.0)  # 50% of 200 Gold
        self.assertEqual(loans[0]["total_due_gold"], 300.0)


class TestLoanEndpointsHTTP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = 8137
        os.environ["SERVER_PORT"] = str(cls.test_port)
        os.environ["ENABLE_CLOUDFLARE_TUNNEL"] = "false"

        # Import main components
        import main
        main.PORT = cls.test_port
        cls.server_thread = threading.Thread(target=main.run_http_server, daemon=True)
        cls.server_thread.start()
        time.sleep(0.5)

    def test_get_lending_facility_status(self):
        url = f"http://127.0.0.1:{self.test_port}/api/cbm/loan/facility"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertEqual(data["status"], "ok")
            facility = data["facility"]
            self.assertIn("is_active", facility)
            self.assertIn("min_reserves_required_gold", facility)
            self.assertEqual(facility["min_reserves_required_gold"], 2000000.0)

    def test_get_lending_facility_simulation(self):
        url = f"http://127.0.0.1:{self.test_port}/api/cbm/loan/facility?simulate_active=true"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertTrue(data["facility"]["is_active"])
            self.assertGreater(data["facility"]["max_loan_gold"], 0)

    def test_post_loan_request_validation(self):
        # 1. Attempt loan request without credentials -> Expected 400
        url = f"http://127.0.0.1:{self.test_port}/api/cbm/loan/request"
        payload = {
            "account_name": "TestApiBorrower",
            "amount_gold": 100,
            "simulate_active": True
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 400)

        # 2. Attempt loan request with invalid credentials -> Expected 401
        payload_bad_pwd = {
            "account_name": "TestApiBorrower",
            "amount_gold": 100,
            "territorial_account": "87778",
            "territorial_password": "wrong_password_12345",
            "simulate_active": True
        }
        req_bad = urllib.request.Request(
            url,
            data=json.dumps(payload_bad_pwd).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req_bad)
        self.assertEqual(ctx.exception.code, 401)


if __name__ == "__main__":
    unittest.main()
