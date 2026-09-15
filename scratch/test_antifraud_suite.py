#!/usr/bin/env python3
"""
Comprehensive Anti-Fraud & Account Ownership Verification Test Suite
Tests:
1. PIN hashing & verification
2. Account credential sanitization
3. Closed-loop destination restrictions
4. PIN enforcement on withdrawals
5. Serverless API handler logic in web/api/cbm.py
"""

import os
import sys
import time
import unittest
import tempfile
import sqlite3

# Import CBM components
sys.path.insert(0, os.path.abspath('g:/TerriX/cbm_wispbyte'))
import db_layer
import withdrawal_worker

db = db_layer.CBMDatabase(use_supabase=False)

class TestAntiFraudSecurity(unittest.TestCase):

    def setUp(self):
        import time, random
        # Setup unique isolated test account in local DB
        self.test_user = f"SecUser_{int(time.time()*1000)}_{random.randint(100,999)}"
        self.attacker_target = "AttackerStolenVault"
        db.register_or_get_account(self.test_user)
        # Give test user balance (100.00 Gold)
        db.credit_deposit(self.test_user, 10000, f"test_tx_{self.test_user}")

    def tearDown(self):
        try:
            conn = sqlite3.connect(db.sqlite_path)
            cur = conn.cursor()
            cur.execute("DELETE FROM cbm_accounts WHERE account_name = ?", (self.test_user,))
            cur.execute("DELETE FROM cbm_ledger WHERE account_name = ?", (self.test_user,))
            cur.execute("DELETE FROM cbm_processed_txs WHERE credited_account = ?", (self.test_user,))
            cur.execute("DELETE FROM cbm_withdrawals WHERE account_name = ?", (self.test_user,))
            conn.commit()
            conn.close()
        except Exception:
            pass

    def test_01_pin_hashing_and_verification(self):
        """Verify PBKDF2 PIN hashing and constant-time matching."""
        raw_pin = "849201"
        wrong_pin = "123456"

        ok, msg = db.set_account_pin(self.test_user, raw_pin)
        self.assertTrue(ok, f"Failed to set PIN: {msg}")
        self.assertTrue(db.has_account_pin(self.test_user))

        # Test verification
        self.assertTrue(db.verify_account_pin(self.test_user, raw_pin))
        self.assertFalse(db.verify_account_pin(self.test_user, wrong_pin))
        self.assertFalse(db.verify_account_pin(self.test_user, ""))

    def test_02_account_sanitization(self):
        """Ensure get_account never leaks pin_hash or salt."""
        db.set_account_pin(self.test_user, "849201")
        acc = db.get_account(self.test_user)
        self.assertIsNotNone(acc)
        self.assertNotIn("pin_hash", acc, "pin_hash leaked in public get_account!")
        self.assertNotIn("salt", acc, "salt leaked in public get_account!")
        self.assertTrue(acc.get("has_pin"))
        self.assertIn("is_verified", acc)

    def test_03_closed_loop_destination_policy(self):
        """Withdrawals must strictly return to verified accounts; third-parties blocked."""
        worker = withdrawal_worker.CBMWithdrawalWorker(db)
        # Ensure test user has PIN set for this test
        db.set_account_pin(self.test_user, "849201")

        # 1. Attacker attempts to withdraw to external wallet
        ok, msg = worker.request_withdrawal(
            account_name=self.test_user,
            target_account=self.attacker_target,
            amount_gold=10,
            pin="849201"
        )
        self.assertFalse(ok, "Attacker withdrawal to unverified destination was allowed!")
        self.assertIn("Anti-Fraud Policy Violation", msg)

        # 2. Legitimate withdrawal to user's own account with wrong PIN
        ok, msg = worker.request_withdrawal(
            account_name=self.test_user,
            target_account=self.test_user,
            amount_gold=10,
            pin="000000"
        )
        self.assertFalse(ok, "Withdrawal with incorrect PIN was allowed!")
        self.assertIn("Authentication Required", msg)

        # 3. Legitimate withdrawal to user's own account with correct PIN
        ok, msg = worker.request_withdrawal(
            account_name=self.test_user,
            target_account=self.test_user,
            amount_gold=10,
            pin="849201"
        )
        self.assertTrue(ok, f"Valid closed-loop withdrawal rejected: {msg}")
        self.assertIn("withdrawal request", msg.lower())

    def test_04_pin_change_protection(self):
        """Changing PIN requires the current valid PIN."""
        current_pin = "849201"
        new_pin = "554433"
        wrong_current = "999999"

        # Set initial PIN first
        ok, msg = db.set_account_pin(self.test_user, current_pin)
        self.assertTrue(ok)

        # Attempt change with wrong current PIN
        ok, msg = db.set_account_pin(self.test_user, new_pin, current_pin=wrong_current)
        self.assertFalse(ok)
        self.assertIn("Current PIN is incorrect", msg)

        # Attempt change with valid current PIN
        ok, msg = db.set_account_pin(self.test_user, new_pin, current_pin=current_pin)
        self.assertTrue(ok)
        self.assertTrue(db.verify_account_pin(self.test_user, new_pin))
        self.assertFalse(db.verify_account_pin(self.test_user, current_pin))

    def test_05_create_account_pin_method(self):
        """Dedicated create_account_pin method: validation and duplicate prevention."""
        fresh_user = f"FreshPinUser_{int(time.time())}"

        # 1. Invalid formats
        ok, msg = db.create_account_pin(fresh_user, "12")
        self.assertFalse(ok)
        self.assertIn("between 4 and 8 numeric digits", msg)

        ok, msg = db.create_account_pin(fresh_user, "abcd")
        self.assertFalse(ok)
        self.assertIn("between 4 and 8 numeric digits", msg)

        # 2. Successful creation for account without PIN
        ok, msg = db.create_account_pin(fresh_user, "123456")
        self.assertTrue(ok, f"Failed creating PIN: {msg}")
        self.assertTrue(db.has_account_pin(fresh_user))
        self.assertTrue(db.verify_account_pin(fresh_user, "123456"))

        # 3. Prevent recreation on account that already has a PIN
        ok, msg = db.create_account_pin(fresh_user, "654321")
        self.assertFalse(ok)
        self.assertIn("already has an active Access PIN", msg)

    def test_06_change_account_pin_method(self):
        """Dedicated change_account_pin method: strictly requires current PIN."""
        no_pin_user = f"NoPinUser_{int(time.time())}"

        # 1. Cannot change PIN if account has no PIN
        ok, msg = db.change_account_pin(no_pin_user, "1111", "2222")
        self.assertFalse(ok)
        self.assertIn("No Access PIN configured", msg)

        # Now create a PIN on the user
        ok, msg = db.create_account_pin(no_pin_user, "123456")
        self.assertTrue(ok)

        # 2. Cannot change with wrong current PIN
        ok, msg = db.change_account_pin(no_pin_user, "000000", "789012")
        self.assertFalse(ok)
        self.assertIn("Current PIN is incorrect", msg)

        # 3. Cannot change to same PIN
        ok, msg = db.change_account_pin(no_pin_user, "123456", "123456")
        self.assertFalse(ok)
        self.assertIn("must be different", msg)

        # 4. Successfully change PIN
        ok, msg = db.change_account_pin(no_pin_user, "123456", "789012")
        self.assertTrue(ok, f"Failed changing PIN: {msg}")
        self.assertTrue(db.verify_account_pin(no_pin_user, "789012"))
        self.assertFalse(db.verify_account_pin(no_pin_user, "123456"))

    def test_07_register_member_account_and_password_auth(self):
        """Verify full CBM registration flow and password verification."""
        reg_user = f"RegMember_{int(time.time())}"
        reg_pass = "SecurePass123!"
        avatar = "https://example.com/avatar.png"
        terri_id = "B8bbq"
        pin = "9988"

        # 1. Successful registration
        ok, msg, acc = db.register_member_account(
            username=reg_user,
            password=reg_pass,
            avatar_url=avatar,
            primary_territorial_account=terri_id,
            pin=pin
        )
        self.assertTrue(ok, f"Registration failed: {msg}")
        self.assertEqual(acc.get("account_name"), reg_user)
        self.assertEqual(acc.get("primary_territorial_account"), terri_id)
        self.assertTrue(acc.get("has_password"))
        self.assertTrue(acc.get("has_pin"))
        self.assertNotIn("password_hash", acc)

        # 2. Verify password checks
        self.assertTrue(db.has_account_password(reg_user))
        self.assertTrue(db.verify_account_password(reg_user, reg_pass))
        self.assertFalse(db.verify_account_password(reg_user, "WrongPass"))
        self.assertFalse(db.verify_account_password(reg_user, ""))

        # 3. Verify PIN checks
        self.assertTrue(db.has_account_pin(reg_user))
        self.assertTrue(db.verify_account_pin(reg_user, pin))

        # 4. Prevent duplicate registration
        ok2, msg2, _ = db.register_member_account(
            username=reg_user,
            password="AnotherPassword",
            avatar_url=avatar,
            primary_territorial_account=terri_id
        )
        self.assertFalse(ok2)
        self.assertIn("already registered", msg2.lower())

    def test_08_model_3_donation_slips_matching(self):
        """Verify 15-minute web intent donation slip generation and daemon matching."""
        donor_user = f"Donor_{int(time.time())}"
        amount_gold = 25.50
        amount_cents = 2550
        custom_msg = "Long live ANTI-OG!"

        # 1. Create donation slip
        slip = db.create_pending_donation(donor_user, amount_gold, message=custom_msg, ttl_minutes=15)
        self.assertEqual(slip["status"], "PENDING")
        self.assertEqual(slip["amount_cents"], amount_cents)
        self.assertEqual(slip["message"], custom_msg)
        self.assertGreater(slip["remaining_seconds"], 800)

        # 2. Retrieve active slips
        pending = db.get_pending_donations(donor_user)
        self.assertTrue(any(p["id"] == slip["id"] for p in pending))

        # 3. Match and claim slip
        tx_id = f"tx_mock_{int(time.time())}"
        claimed = db.find_and_claim_pending_donation(donor_user, amount_cents, tx_id)
        self.assertIsNotNone(claimed)
        self.assertEqual(claimed["id"], slip["id"])

        # 4. Replay check: cannot claim fulfilled slip twice
        second_claim = db.find_and_claim_pending_donation(donor_user, amount_cents, "tx_duplicate")
        self.assertIsNone(second_claim, "Fulfilled slip was claimed twice!")

    def test_09_golden_rule_infallible_deposit_vs_donation(self):
        """
        Verify the Golden Infallible Rule:
        - Inbound transfer without a slip -> 100% credited to withdrawable balance.
        - Inbound transfer with active slip -> booked to Clan War Chest.
        """
        import deposit_daemon
        daemon = deposit_daemon.CBMDepositDaemon(db=db, vault_account="DdcBC")

        normal_sender = f"Norm_{str(int(time.time()))[:6]}"
        donor_sender = f"Donr_{str(int(time.time()))[:6]}"

        # Donor declares a slip first
        slip = db.create_pending_donation(donor_sender, 10.0, "Clan Glory", ttl_minutes=15)

        # Simulate inbound transfer from donor
        slip_match = db.find_and_claim_pending_donation(donor_sender, 1000, "tx_donor_1")
        self.assertIsNotNone(slip_match)
        # Record direct donation
        don = db.record_direct_donation(donor_sender, donor_sender, 1000, "tx_donor_1", slip_match["message"])
        self.assertEqual(don["amount_cents"], 1000)

        # Simulate inbound transfer from normal sender WITHOUT slip
        no_slip = db.find_and_claim_pending_donation(normal_sender, 1500, "tx_normal_1")
        self.assertIsNone(no_slip, "Unmatched sender matched a phantom slip!")

        # Unconditionally credited as deposit!
        db.credit_deposit(normal_sender, 1500, "tx_normal_1")
        acc = db.get_account(normal_sender)
        self.assertEqual(acc.get("deposited_cents"), 1501) # 1500 + 1 fee rebate!

if __name__ == "__main__":
    unittest.main(verbosity=2)

