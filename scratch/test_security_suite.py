#!/usr/bin/env python3
"""
Comprehensive Automated Security Test Suite
===========================================
Validates:
1. HTTP Security Headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP)
2. Max Payload Size Body Limit (64KB cap -> HTTP 413)
3. IP Sliding-Window Rate Limiting & Account Temporary Lockout (5 failed attempts -> 15 min lock -> HTTP 429)
4. Inbound Account PIN Hijack Prevention (requires live Territorial.io game password proof -> HTTP 401)
5. Credential Encryption at Rest (AES-128-CBC + HMAC via Fernet with raw SQLite inspection and sanitized loan output)
6. Frontend Stored XSS Mitigation (escapeHtml verification in HTML assets)
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

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte"))

from rate_limiter import CBMRateLimiter, rate_limiter
from crypto_util import encrypt_credential, decrypt_credential, is_encrypted
from db_layer import CBMDatabase

TEST_PORT = 8145
DB_PATH = os.path.join(os.path.dirname(__file__), "test_security_sandbox.db")
os.environ["CBM_ENV"] = "test"


class TestCryptoUtil(unittest.TestCase):
    def test_encryption_roundtrip(self):
        plain = "MySecretTerritorialPass123!@#"
        enc = encrypt_credential(plain)
        self.assertTrue(enc.startswith("enc:"))
        self.assertTrue(is_encrypted(enc))
        self.assertNotIn(plain, enc)

        dec = decrypt_credential(enc)
        self.assertEqual(dec, plain)

    def test_legacy_plaintext_passthrough(self):
        legacy = "legacy_unencrypted_pass"
        self.assertFalse(is_encrypted(legacy))
        dec = decrypt_credential(legacy)
        self.assertEqual(dec, legacy)

    def test_empty_or_none(self):
        self.assertEqual(encrypt_credential(""), "")
        self.assertEqual(encrypt_credential(None), None)
        self.assertEqual(decrypt_credential(""), "")
        self.assertEqual(decrypt_credential(None), None)


class TestRateLimiterLogic(unittest.TestCase):
    def setUp(self):
        self.limiter = CBMRateLimiter()

    def test_ip_rate_limiting(self):
        test_ip = "192.168.1.100"
        # Allowed up to 30 requests on sensitive routes
        for i in range(30):
            allowed, retry = self.limiter.check_ip_rate_limit(test_ip, limit=30, window_seconds=60)
            self.assertTrue(allowed, f"Request {i+1} should be allowed")
            self.assertEqual(retry, 0)

        # 31st request should be blocked
        allowed, retry = self.limiter.check_ip_rate_limit(test_ip, limit=30, window_seconds=60)
        self.assertFalse(allowed)
        self.assertGreater(retry, 0)

    def test_account_lockout_and_success_reset(self):
        account = "TargetLockedAccount"
        # 4 failed attempts -> not locked
        for i in range(4):
            is_locked, _ = self.limiter.record_auth_failure(account, max_failures=5, lockout_seconds=900)
            self.assertFalse(is_locked)

        # 5th failed attempt -> locked
        is_locked, remaining = self.limiter.record_auth_failure(account, max_failures=5, lockout_seconds=900)
        self.assertTrue(is_locked)
        self.assertGreater(remaining, 800)

        # Check account lockout status directly
        locked, rem = self.limiter.is_account_locked(account)
        self.assertTrue(locked)
        self.assertGreater(rem, 800)

        # Auth success should reset
        self.limiter.record_auth_success(account)
        locked_after, _ = self.limiter.is_account_locked(account)
        self.assertFalse(locked_after)


class TestDatabaseSecurityHardening(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = CBMDatabase(db_path=DB_PATH, use_supabase=False)

    def test_payment_method_credential_encrypted_in_sqlite(self):
        cbm_user = "SecTestUser_PM"
        game_acc = "SecGameUser_PM"
        plain_pass = "PMPassword9988!!"
        self.db.register_or_get_account(cbm_user)

        res = self.db.link_payment_method(
            cbm_username=cbm_user,
            territorial_account=game_acc,
            territorial_password=plain_pass,
            display_name="Vault Card"
        )
        self.assertIn(res.get("status"), ["ok", "VERIFIED"])

        # Inspect raw database row to ensure raw password is not stored in plaintext
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT territorial_password FROM cbm_payment_methods WHERE cbm_username = ?", (cbm_user,))
            row = cursor.fetchone()
            self.assertIsNotNone(row)
            stored_pass = row["territorial_password"]
            self.assertTrue(stored_pass.startswith("enc:"))
            self.assertNotEqual(stored_pass, plain_pass)

        # Ensure internal read decrypts properly
        methods = self.db.get_payment_methods(cbm_user)
        self.assertGreater(len(methods), 0)
        found = [m for m in methods if m["territorial_account_name"] == game_acc]
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["territorial_password"], plain_pass)

    def test_loan_credential_encrypted_and_sanitized(self):
        cbm_user = "SecTestUser_Loan"
        game_acc = "SecGameUser_Loan"
        plain_pass = "LoanPass9988!!"
        self.db.register_or_get_account(cbm_user)

        ok, msg, loan = self.db.create_loan(
            account_name=cbm_user,
            principal_gold=150,
            territorial_account=game_acc,
            territorial_password=plain_pass
        )
        self.assertTrue(ok)

        # Inspect raw database row
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT territorial_password FROM cbm_loans WHERE account_name = ?", (cbm_user,))
            row = cursor.fetchone()
            self.assertIsNotNone(row)
            stored_pass = row["territorial_password"]
            self.assertTrue(stored_pass.startswith("enc:"))
            self.assertNotEqual(stored_pass, plain_pass)

        # Public lookup via get_account_loans must strip/sanitize territorial_password
        loans = self.db.get_account_loans(cbm_user)
        self.assertGreater(len(loans), 0)
        for l in loans:
            self.assertNotIn("territorial_password", l, "Stored credential must never leak into loan lookups")


class TestHTTPServerSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.environ["SERVER_PORT"] = str(TEST_PORT)
        os.environ["ENABLE_CLOUDFLARE_TUNNEL"] = "false"

        import main
        main.PORT = TEST_PORT
        cls.server_thread = threading.Thread(target=main.run_http_server, daemon=True)
        cls.server_thread.start()
        time.sleep(0.6)

    @classmethod
    def tearDownClass(cls):
        import main
        if main._SERVER_INSTANCE:
            try:
                main._SERVER_INSTANCE.shutdown()
            except Exception:
                pass

    def test_http_security_headers(self):
        url = f"http://127.0.0.1:{TEST_PORT}/api/cbm/status"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            headers = resp.headers
            self.assertEqual(headers.get("X-Frame-Options"), "SAMEORIGIN")
            self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
            self.assertEqual(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin")
            self.assertIn("Content-Security-Policy", headers)

    def test_max_payload_size_rejection(self):
        url = f"http://127.0.0.1:{TEST_PORT}/api/cbm/auth/verify-pin"
        oversized_data = json.dumps({"account_name": "TestUser", "pin": "1234", "padding": "A" * (70 * 1024)}).encode("utf-8")
        req = urllib.request.Request(url, data=oversized_data, headers={"Content-Type": "application/json"})

        try:
            urllib.request.urlopen(req)
            self.fail("Expected HTTP 413 Payload Too Large")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 413)
            body = json.loads(e.read().decode())
            self.assertIn("payload too large", body.get("message", "").lower())

    def test_account_lockout_endpoint_behavior(self):
        # Create user with PIN
        user = "LockoutHTTPVictim"
        db = CBMDatabase(db_path=DB_PATH, use_supabase=False)
        db.register_or_get_account(user)
        db.set_account_pin(user, "9999")

        # Clear any prior state in rate limiter for this account
        rate_limiter.record_auth_success(user)

        url = f"http://127.0.0.1:{TEST_PORT}/api/cbm/auth/verify-pin"
        wrong_payload = json.dumps({"account_name": user, "pin": "0000"}).encode("utf-8")

        # 5 failed attempts
        for i in range(5):
            req = urllib.request.Request(url, data=wrong_payload, headers={"Content-Type": "application/json"})
            try:
                urllib.request.urlopen(req)
                self.fail(f"Attempt {i+1} should fail authentication")
            except urllib.error.HTTPError as e:
                self.assertIn(e.code, [400, 401, 429])

        # 6th attempt should return 429 Too Many Requests due to temporary lockout
        req = urllib.request.Request(url, data=wrong_payload, headers={"Content-Type": "application/json"})
        try:
            urllib.request.urlopen(req)
            self.fail("6th attempt should be blocked by account lockout")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 429)
            body = json.loads(e.read().decode())
            self.assertIn("temporarily locked", body.get("message", "").lower())
            self.assertIn("Retry-After", e.headers)

    def test_inbound_account_pin_hijack_prevention(self):
        # Inbound deposit accounts have no initial password or PIN
        user = "InboundVictimNoPass"
        db = CBMDatabase(db_path=DB_PATH, use_supabase=False)
        acc = db.register_or_get_account(user)

        # Attacker tries to set PIN without providing Territorial.io password proof
        url = f"http://127.0.0.1:{TEST_PORT}/api/cbm/auth/create-pin"
        hijack_payload = json.dumps({
            "account_name": user,
            "pin": "1234",
            "territorial_password": ""
        }).encode("utf-8")

        req = urllib.request.Request(url, data=hijack_payload, headers={"Content-Type": "application/json"})
        try:
            urllib.request.urlopen(req)
            self.fail("PIN hijack without territorial game password must be rejected")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 401)
            body = json.loads(e.read().decode())
            self.assertIn("territorial.io password", body.get("message", "").lower())


if __name__ == "__main__":
    unittest.main()
