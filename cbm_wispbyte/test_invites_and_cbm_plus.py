#!/usr/bin/env python3
"""
Test Suite: Invite-Only Registration, Multi-Inviter Settlement & CBM Plus Subscriptions
======================================================================================
Validates:
1. Invite-Only Registration & Gatekeeper (Uninvited access blocked with 403).
2. Inviter Deduplication Constraint (Single-settlement invariant per inviter, 409 Conflict).
3. Multi-Inviter Distinct Settlement (Atomic 25 Gold sponsor stake deduction to unencumbered reserves).
4. Invite Lifecycle & Revocation (Release allocation without penalties).
5. CBM Plus Balance Subscription Rail (500 Gold converted 100% to reserves, 30-day activation).
6. CBM Plus In-Game Transfer Slip Intent & Reconciliation.
7. Paywall Middleware Enforcement across Dev APIs & TrimCraft/VidTrim tools (402 Payment Required).
"""

import os
import sys
import time
import json
import uuid
import secrets
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ["CBM_ENV"] = "test"

import main
from main import CBMHealthHandler, db
from crypto_util import create_session_token


class TestInvitesAndCBMPlus(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        main.load_static_cache()
        conn = db.get_write_connection()
        conn.execute("DELETE FROM cbm_accounts WHERE LOWER(account_name) != 'b8bbq'")
        conn.execute("DELETE FROM cbm_invites")
        conn.execute("DELETE FROM cbm_invite_prospects")
        conn.execute("DELETE FROM cbm_pending_subscriptions")
        conn.execute("DELETE FROM cbm_donations")
        conn.execute("DELETE FROM cbm_loans")
        conn.commit()
        conn.close()
        db.register_or_get_account("B8bbq")
        db.recompute_treasury(vault_gold=10000.0)
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.base_url = f"http://127.0.0.1:{cls.port}"

        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        if cls.server:
            try:
                cls.server.shutdown()
                cls.server.server_close()
            except Exception:
                pass

    def _request(self, method: str, path: str, data: dict = None, headers: dict = None):
        url = f"{self.base_url}{path}"
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_body = resp.read().decode("utf-8")
                try:
                    parsed = json.loads(resp_body)
                except Exception:
                    parsed = {"raw": resp_body}
                return resp.status, parsed, resp.headers
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            try:
                parsed = json.loads(err_body)
            except Exception:
                parsed = {"raw": err_body}
            return e.code, parsed, e.headers

    def _create_funded_user(self, prefix: str, deposit_cents: int = 10000) -> str:
        username = f"{prefix}_{uuid.uuid4().hex[:8]}"
        ok, msg, acc = db.register_member_account(
            username=username,
            password="test_password_123",
            avatar_url="https://cbm.wispbyte.org/avatar.png",
            primary_territorial_account=f"TT_{username}",
            pin="123456"
        )
        self.assertTrue(ok, f"Failed to register test user: {msg}")
        if deposit_cents > 0:
            db.credit_deposit(username, deposit_cents, f"tx_{uuid.uuid4().hex[:12]}")
        return username

    def test_duplicate_code_same_inviter_rejected(self):
        """
        Inviter UserA creates CODE_1 and CODE_2.
        Prospect tracks CODE_1 -> succeeds (200 OK).
        Prospect tracks CODE_2 -> rejected (409 Conflict).
        Database table cbm_invite_prospects contains exactly 1 row for that prospect.
        """
        user_a = self._create_funded_user("inviter_a", deposit_cents=50000)
        tok_a = create_session_token(user_a)

        # 1. UserA creates two distinct invite codes
        status, res1, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 2}, headers={"Authorization": f"Bearer {tok_a}"})
        self.assertEqual(status, 200, f"Create invite 1 failed: {res1}")
        code_1 = res1["code_id"]

        status, res2, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 2}, headers={"Authorization": f"Bearer {tok_a}"})
        self.assertEqual(status, 200, f"Create invite 2 failed: {res2}")
        code_2 = res2["code_id"]
        self.assertNotEqual(code_1, code_2)

        # 2. Prospect tracks CODE_1 -> 200 OK
        prospect_token = f"pr_{uuid.uuid4().hex[:12]}"
        status, track1, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_1,
            "ref": user_a
        })
        self.assertEqual(status, 200, f"Track invite 1 failed: {track1}")
        self.assertEqual(track1.get("status"), "ok")

        # 3. Prospect tracks CODE_2 (same inviter) -> 409 Conflict
        status, track2, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_2,
            "ref": user_a
        })
        self.assertEqual(status, 409, f"Track invite 2 expected 409 but got {status}: {track2}")
        self.assertEqual(track2.get("error"), "duplicate_inviter_code")
        self.assertIn("already linked an invitation from this user", track2.get("message", ""))

        # 4. Assert database table contains exactly 1 row for that prospect
        conn = db._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("SELECT count(*) as cnt FROM cbm_invite_prospects WHERE prospect_token = ?", (prospect_token,))
        row_count = cur.fetchone()["cnt"]
        self.assertEqual(row_count, 1)

    def test_multi_inviter_distinct_settlement(self):
        """
        Inviter UserA creates CODE_A. Inviter UserB creates CODE_B.
        Prospect tracks CODE_A -> succeeds (200 OK).
        Prospect tracks CODE_B -> succeeds (200 OK).
        Prospect registers new account.
        UserA is debited 25 Gold (2,500 cents).
        UserB is debited 25 Gold (2,500 cents).
        Bank unencumbered reserves increase by 50 Gold (5,000 cents).
        Neither inviter is debited more than once.
        """
        user_a = self._create_funded_user("multi_a", deposit_cents=10000)
        user_b = self._create_funded_user("multi_b", deposit_cents=10000)
        tok_a = create_session_token(user_a)
        tok_b = create_session_token(user_b)

        # Baseline balances & reserves
        bal_a_before = db.get_account(user_a)["deposited_cents"]
        bal_b_before = db.get_account(user_b)["deposited_cents"]
        treasury_before = db.get_treasury()["bank_reserves_cents"]

        # 1. Create codes
        status, res_a, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 2}, headers={"Authorization": f"Bearer {tok_a}"})
        self.assertEqual(status, 200)
        code_a = res_a["code_id"]

        status, res_b, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 2}, headers={"Authorization": f"Bearer {tok_b}"})
        self.assertEqual(status, 200)
        code_b = res_b["code_id"]

        # 2. Prospect tracks both distinct codes -> both 200 OK
        prospect_token = f"pr_{uuid.uuid4().hex[:12]}"
        status, track_a, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_a,
            "ref": user_a
        })
        self.assertEqual(status, 200)

        status, track_b, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_b,
            "ref": user_b
        })
        self.assertEqual(status, 200)

        # Verify DB has 2 prospect entries for this token
        conn = db._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()
        cur.execute("SELECT count(*) as cnt FROM cbm_invite_prospects WHERE prospect_token = ?", (prospect_token,))
        self.assertEqual(cur.fetchone()["cnt"], 2)

        # 3. Prospect registers new account
        new_username = f"prospect_user_{uuid.uuid4().hex[:8]}"
        reg_payload = {
            "prospect_token": prospect_token,
            "ref": user_a,
            "referral_code": user_a,
            "username": new_username,
            "password": "strong_password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": f"TT_{new_username}",
            "pin": "654321",
            "cf-turnstile-response": "test_turnstile_bypass"
        }
        status, reg_res, _ = self._request("POST", "/api/cbm/auth/register", reg_payload)
        self.assertEqual(status, 200)
        self.assertEqual(reg_res.get("status"), "ok")

        # 4. Assert balances debited exactly 2,500 cents (25 Gold) each
        bal_a_after = db.get_account(user_a)["deposited_cents"]
        bal_b_after = db.get_account(user_b)["deposited_cents"]
        self.assertEqual(bal_a_after, bal_a_before - 2500)
        self.assertEqual(bal_b_after, bal_b_before - 2500)

        # 5. Assert central bank reserves increased by 5,000 cents (50 Gold)
        treasury_after = db.get_treasury()["bank_reserves_cents"]
        self.assertEqual(treasury_after, treasury_before + 5000)

        # 6. Verify ledger entries: exactly 1 inflow debit per inviter for this registration
        cur.execute("""
            SELECT count(*) as cnt FROM cbm_ledger
            WHERE account_name = ? AND entry_type = 'INVITE_RESERVE_INFLOW' AND notes LIKE ?
        """, (user_a, f"%{new_username}%"))
        self.assertEqual(cur.fetchone()["cnt"], 1)

        cur.execute("""
            SELECT count(*) as cnt FROM cbm_ledger
            WHERE account_name = ? AND entry_type = 'INVITE_RESERVE_INFLOW' AND notes LIKE ?
        """, (user_b, f"%{new_username}%"))
        self.assertEqual(cur.fetchone()["cnt"], 1)

    def test_uninvited_registration_blocked(self):
        """Account registration without valid active invitation must be rejected with 403 Forbidden."""
        # Case A: Missing prospect token
        status, res_a, _ = self._request("POST", "/api/cbm/auth/register", {
            "username": f"uninvited_{uuid.uuid4().hex[:6]}",
            "password": "password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": "TT_Uninvited",
            "pin": "123456",
            "cf-turnstile-response": "test_turnstile_bypass"
        })
        self.assertEqual(status, 403)
        self.assertEqual(res_a.get("error"), "uninvited")

        # Case B: Arbitrary nonexistent prospect token
        status, res_b, _ = self._request("POST", "/api/cbm/auth/register", {
            "prospect_token": f"pr_fake_{uuid.uuid4().hex[:12]}",
            "username": f"uninvited_{uuid.uuid4().hex[:6]}",
            "password": "password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": "TT_Uninvited",
            "pin": "123456",
            "cf-turnstile-response": "test_turnstile_bypass"
        })
        self.assertEqual(status, 403)
        self.assertEqual(res_b.get("error"), "uninvited")

    def test_invite_revocation_releases_allocation(self):
        """Revoking an invite code prevents further redemptions and returns 404 on tracking."""
        inviter = self._create_funded_user("revoker", deposit_cents=10000)
        tok = create_session_token(inviter)

        status, create_res, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        code_id = create_res["code_id"]

        # Revoke code
        status, rev_res, _ = self._request("POST", "/api/cbm/invites/revoke", {"code_id": code_id}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        self.assertEqual(rev_res.get("status"), "ok")

        # Attempt to track revoked code
        status, track_res, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": f"pr_{uuid.uuid4().hex[:10]}",
            "invite_code": code_id,
            "ref": inviter
        })
        self.assertEqual(status, 404)

    def test_prevent_invite_over_allocation(self):
        """Users cannot create many invite codes when their deposit balance is insufficient to cover aggregate commitment."""
        # Inviter has 25 Gold (2,500 cents) deposited
        inviter = self._create_funded_user("stake_test", deposit_cents=2500)
        tok = create_session_token(inviter)

        # 1. Create first code with 1 use (2,500 cents committed) -> Succeeds (200 OK)
        status1, res1, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status1, 200, f"Expected 200, got {status1}: {res1}")
        code1 = res1["code_id"]
        self.assertIn(f"?ref={inviter}&invite={code1}", res1["invite_url"])

        # 2. Attempt to create second code with 1 use -> Must be rejected (400) because all 25 Gold is committed
        status2, res2, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status2, 400, f"Expected 400 rejection for over-allocation, got {status2}: {res2}")
        self.assertIn("Insufficient balance", res2.get("message", ""))

        # 3. Revoke first code -> Allocation released
        status_rev, res_rev, _ = self._request("POST", "/api/cbm/invites/revoke", {"code_id": code1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status_rev, 200)

        # 4. Now creating a code with 1 use succeeds
        status3, res3, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status3, 200, f"Expected 200 after revocation, got {status3}: {res3}")

    def test_base_referral_url_required_and_validated(self):
        """Invite codes are strictly invalid without a valid base referral URL matching the sponsor."""
        inviter = self._create_funded_user("ref_enforce", deposit_cents=10000)
        tok = create_session_token(inviter)
        other_user = self._create_funded_user("other_ref", deposit_cents=10000)

        status, res, _ = self._request("POST", "/api/cbm/invites/create", {"max_uses": 1}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        code = res["code_id"]
        prospect_token = f"pr_{uuid.uuid4().hex[:12]}"

        # 1. Track without ref -> rejected (400 missing_base_referral)
        status_no_ref, res_no_ref, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code
        })
        self.assertEqual(status_no_ref, 400)
        self.assertEqual(res_no_ref.get("error"), "missing_base_referral")

        # 2. Track with mismatch ref -> rejected (400 invalid_base_referral)
        status_bad_ref, res_bad_ref, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code,
            "ref": other_user
        })
        self.assertEqual(status_bad_ref, 400)
        self.assertEqual(res_bad_ref.get("error"), "invalid_base_referral")

        # 3. Track with correct ref -> succeeds (200 OK)
        status_ok_ref, res_ok_ref, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code,
            "ref": inviter
        })
        self.assertEqual(status_ok_ref, 200)
        self.assertEqual(res_ok_ref.get("status"), "ok")

        # 4. Direct registration with code but missing ref -> rejected (400 missing_base_referral)
        new_uname = f"reg_test_{uuid.uuid4().hex[:6]}"
        status_reg_no_ref, res_reg_no_ref, _ = self._request("POST", "/api/cbm/auth/register", {
            "prospect_token": prospect_token,
            "invite_code": code,
            "username": new_uname,
            "password": "password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": f"TT_{new_uname}",
            "pin": "123456",
            "cf-turnstile-response": "test_turnstile_bypass"
        })
        self.assertEqual(status_reg_no_ref, 400)
        self.assertEqual(res_reg_no_ref.get("error"), "missing_base_referral")

        # 5. Direct registration with mismatch ref -> rejected (400 invalid_base_referral)
        status_reg_bad_ref, res_reg_bad_ref, _ = self._request("POST", "/api/cbm/auth/register", {
            "prospect_token": prospect_token,
            "invite_code": code,
            "ref": other_user,
            "username": new_uname,
            "password": "password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": f"TT_{new_uname}",
            "pin": "123456",
            "cf-turnstile-response": "test_turnstile_bypass"
        })
        self.assertEqual(status_reg_bad_ref, 400)
        self.assertEqual(res_reg_bad_ref.get("error"), "invalid_base_referral")

        # 6. Direct registration with matching ref -> succeeds (200 OK)
        status_reg_ok, res_reg_ok, _ = self._request("POST", "/api/cbm/auth/register", {
            "prospect_token": prospect_token,
            "invite_code": code,
            "ref": inviter,
            "username": new_uname,
            "password": "password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": f"TT_{new_uname}",
            "pin": "123456",
            "cf-turnstile-response": "test_turnstile_bypass"
        })
        self.assertEqual(status_reg_ok, 200)
        self.assertEqual(res_reg_ok.get("status"), "ok")


    def test_cbm_plus_balance_subscription_rail(self):
        """Subscribing to CBM Plus via balance debits 500 Gold (50,000 cents) and credits bank reserves."""
        subscriber = self._create_funded_user("cbm_plus_sub", deposit_cents=100000)
        tok = create_session_token(subscriber)

        # Baseline
        self.assertFalse(db.is_cbm_plus_active(db.get_account(subscriber)))
        treasury_before = db.get_treasury()["bank_reserves_cents"]
        bal_before = db.get_account(subscriber)["deposited_cents"]

        # Subscribe via balance
        status, sub_res, _ = self._request("POST", "/api/cbm/subscription/subscribe-balance", {}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        self.assertEqual(sub_res.get("status"), "ok")
        self.assertTrue(sub_res.get("cbm_plus_until") > time.time() + 86400 * 25)

        # Verify balance debited by 50,000 cents (500 Gold)
        bal_after = db.get_account(subscriber)["deposited_cents"]
        self.assertEqual(bal_after, bal_before - 50000)

        # Verify bank reserves credited by 50,000 cents
        treasury_after = db.get_treasury()["bank_reserves_cents"]
        self.assertEqual(treasury_after, treasury_before + 50000)

        # Verify active state
        self.assertTrue(db.is_cbm_plus_active(db.get_account(subscriber)))

        # Verify status endpoint
        status, stat_res, _ = self._request("GET", "/api/cbm/subscription/status", headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        self.assertTrue(stat_res.get("cbm_plus_active"))

    def test_cbm_plus_in_game_transfer_intent_slip(self):
        """Declaring intent slip and fulfilling via deposit daemon reconciliation."""
        subscriber = self._create_funded_user("cbm_plus_slip", deposit_cents=0)
        tok = create_session_token(subscriber)

        # Declare intent slip
        status, slip_res, _ = self._request("POST", "/api/cbm/subscription/declare-slip", {}, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        slip_id = slip_res["subscription_id"]
        self.assertEqual(slip_res.get("required_amount_gold"), 500.0)

        treasury_before = db.get_treasury()["bank_reserves_cents"]

        # Simulate reconciliation by deposit daemon
        ok, msg, sub_rec = db.fulfill_pending_subscription(slip_id, tx_hash=f"tx_game_{secrets.token_hex(6)}")
        self.assertTrue(ok)
        self.assertEqual(sub_rec["status"], "FULFILLED")

        # Verify bank reserves credited
        treasury_after = db.get_treasury()["bank_reserves_cents"]
        self.assertEqual(treasury_after, treasury_before + 50000)

        # Verify subscription active
        acc = db.get_account(subscriber)
        self.assertTrue(db.is_cbm_plus_active(acc))

    def test_cbm_plus_paywall_enforcement(self):
        """Dev keys and TrimCraft/VidTrim endpoints must reject non-subscribers with 402 Payment Required."""
        non_sub = self._create_funded_user("free_tier", deposit_cents=1000)
        tok_free = create_session_token(non_sub)

        # 1. Dev Keys Create -> 402 Payment Required
        status, key_res, _ = self._request("POST", "/api/cbm/dev/keys/create", {
            "account_name": non_sub,
            "app_name": "TestBot"
        }, headers={"Authorization": f"Bearer {tok_free}"})
        self.assertEqual(status, 402)
        self.assertEqual(key_res.get("error"), "cbm_plus_required")

        # 2. TrimCraft Bounds -> 402 Payment Required
        status, trim_res, _ = self._request("POST", "/api/v1/tools/trimcraft/bounds", {
            "width": 800,
            "height": 600
        }, headers={"Authorization": f"Bearer {tok_free}"})
        self.assertEqual(status, 402)
        self.assertEqual(trim_res.get("error"), "cbm_plus_required")

        # 3. VidTrim Session -> 402 Payment Required
        status, vid_res, _ = self._request("POST", "/api/v1/tools/vidtrim/session", {
            "duration": 45.0
        }, headers={"Authorization": f"Bearer {tok_free}"})
        self.assertEqual(status, 402)
        self.assertEqual(vid_res.get("error"), "cbm_plus_required")

        # Now upgrade user to CBM Plus
        db.activate_cbm_plus(non_sub, months=1)

        # 4. Retry endpoints with active CBM Plus -> 200 OK
        status, trim_ok, _ = self._request("POST", "/api/v1/tools/trimcraft/bounds", {
            "width": 800,
            "height": 600,
            "padding": 10
        }, headers={"Authorization": f"Bearer {tok_free}"})
        self.assertEqual(status, 200)
        self.assertEqual(trim_ok.get("bounds", {}).get("width"), 780)

        status, vid_ok, _ = self._request("POST", "/api/v1/tools/vidtrim/session", {
            "duration": 45.0
        }, headers={"Authorization": f"Bearer {tok_free}"})
        self.assertEqual(status, 200)
        self.assertIn("vt_", vid_ok.get("session_id", ""))

    def test_b8bbq_admin_lifetime_cbm_plus(self):
        """Verifies admin account B8bbq holds lifetime CBM Plus without deduction or expiration."""
        acc_b8bbq = db.get_account("B8bbq")
        self.assertIsNotNone(acc_b8bbq)
        self.assertTrue(db.is_cbm_plus_active(acc_b8bbq))

        tok_b8bbq = create_session_token("B8bbq")

        # 1. Query status endpoint
        status, stat_res, _ = self._request("GET", "/api/cbm/subscription/status", headers={"Authorization": f"Bearer {tok_b8bbq}"})
        self.assertEqual(status, 200)
        self.assertTrue(stat_res.get("cbm_plus_active"))
        self.assertTrue(stat_res.get("is_lifetime"))
        self.assertEqual(stat_res.get("cost_gold"), 0.0)

        # 2. Attempt balance subscription -> succeeds with 0 Gold deducted
        bal_before = db.get_account("B8bbq")["deposited_cents"]
        status, sub_res, _ = self._request("POST", "/api/cbm/subscription/subscribe-balance", {"months": 12}, headers={"Authorization": f"Bearer {tok_b8bbq}"})
        self.assertEqual(status, 200)
        bal_after = db.get_account("B8bbq")["deposited_cents"]
        self.assertEqual(bal_after, bal_before, "B8bbq balance was deducted for CBM Plus subscription")

        # 3. Access CBM Plus restricted tool endpoints without payment
        status, trim_ok, _ = self._request("POST", "/api/v1/tools/trimcraft/bounds", {
            "width": 1024,
            "height": 768,
            "padding": 20
        }, headers={"Authorization": f"Bearer {tok_b8bbq}"})
        self.assertEqual(status, 200)
        self.assertEqual(trim_ok.get("bounds", {}).get("width"), 984)

        status, vid_ok, _ = self._request("POST", "/api/v1/tools/vidtrim/session", {
            "duration": 60.0
        }, headers={"Authorization": f"Bearer {tok_b8bbq}"})
        self.assertEqual(status, 200)
        self.assertIn("vt_", vid_ok.get("session_id", ""))

    def test_subscription_portal_routing_and_account_registration_sanitation(self):
        """Validates /subscription routing, GTM tags, CSP headers, and account hydration sanitation."""
        # 1. Test /subscription route and CSP headers
        req = urllib.request.Request(f"{self.base_url}/subscription")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            body = resp.read().decode("utf-8")
            csp = resp.headers.get("Content-Security-Policy", "")
            self.assertIn("https://www.googletagmanager.com", csp)
            self.assertIn("G-QCMCPSK0CF", body)
            self.assertIn("⭐ CBM Plus Member", body)

        # 2. Test db.get_account() non-null guarantees
        acc = db.get_account("B8bbq")
        self.assertIsNotNone(acc)
        self.assertIsInstance(acc["deposited_cents"], int)
        self.assertIsInstance(acc["deposited_gold"], float)
        self.assertIsInstance(acc["total_deposited_gold"], float)
        self.assertIsInstance(acc["total_withdrawn_gold"], float)
        self.assertIsNotNone(acc["display_name"])
        self.assertIsNotNone(acc["avatar_url"])
        self.assertIsNotNone(acc["clan_tag"])
        self.assertIsNotNone(acc["role"])
        self.assertIsNotNone(acc["primary_territorial_account"])

        # 3. Test registration with referral & invite code
        conn = db.get_write_connection()
        conn.execute("UPDATE cbm_accounts SET deposited_cents = 50000 WHERE LOWER(account_name) = 'b8bbq'")
        now = time.time()
        conn.execute("""
            INSERT OR REPLACE INTO cbm_invites (code_id, inviter_account, max_uses, uses_count, cost_per_use_cents, is_revoked, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        """, ("inv_portal_test", "B8bbq", 10, 0, 2500, now, now))
        conn.commit()
        conn.close()

        uname = f"prospect_{secrets.token_hex(4)}"
        reg_payload = {
            "username": uname,
            "terri_account": f"TT_{uname[:6]}",
            "password": "Password123!",
            "pin": "7788",
            "invite_code": "inv_portal_test",
            "referral_code": "B8bbq",
            "turnstile_token": "test_turnstile_approved"
        }
        status, reg_res, _ = self._request("POST", "/api/cbm/auth/register", reg_payload)
        self.assertEqual(status, 200)
        self.assertIn("session_token", reg_res)
        created_acc = reg_res.get("account", {})
        self.assertEqual(created_acc.get("account_name"), uname)
        self.assertIsNotNone(created_acc.get("display_name"))
        self.assertIsNotNone(created_acc.get("avatar_url"))
        self.assertEqual(created_acc.get("deposited_gold"), 0.0)
        self.assertTrue(created_acc.get("has_pin"))
        self.assertTrue(created_acc.get("has_password"))

    def test_cbm_plus_annual_plan_discount_and_pricing_plans(self):
        """Verifies Annual Plan pricing structure, 20% savings, and balance / slip settlement."""
        # 1. Verify GET /api/cbm/subscription/plans
        status, plans_res, _ = self._request("GET", "/api/cbm/subscription/plans")
        self.assertEqual(status, 200)
        self.assertEqual(plans_res.get("base_monthly_gold"), 500.0)
        plans = plans_res.get("plans", [])
        self.assertEqual(len(plans), 4)

        annual_plan = next((p for p in plans if p["months"] == 12), None)
        self.assertIsNotNone(annual_plan)
        self.assertEqual(annual_plan["cost_gold"], 4800.0)
        self.assertEqual(annual_plan["base_gold"], 6000.0)
        self.assertEqual(annual_plan["savings_gold"], 1200.0)
        self.assertEqual(annual_plan["discount_percent"], 20)
        self.assertEqual(annual_plan["monthly_gold"], 400.0)
        self.assertTrue(annual_plan["is_annual"])

        # 2. Test Annual Plan Balance Subscription (4,800 Gold = 480,000 cents)
        subscriber = self._create_funded_user("annual_sub", deposit_cents=600000)
        tok = create_session_token(subscriber)

        bal_before = db.get_account(subscriber)["deposited_cents"]
        reserves_before = db.get_treasury()["bank_reserves_cents"]

        status, sub_res, _ = self._request("POST", "/api/cbm/subscription/subscribe-balance", {
            "months": 12
        }, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        self.assertEqual(sub_res.get("cost_gold"), 4800.0)
        self.assertEqual(sub_res.get("savings_gold"), 1200.0)
        self.assertEqual(sub_res.get("discount_percent"), 20)
        self.assertTrue(sub_res.get("is_annual"))

        # Verify balance debited by exactly 480,000 cents (not 600,000)
        bal_after = db.get_account(subscriber)["deposited_cents"]
        self.assertEqual(bal_after, bal_before - 480000)

        # Verify reserves credited by 480,000 cents
        reserves_after = db.get_treasury()["bank_reserves_cents"]
        self.assertEqual(reserves_after, reserves_before + 480000)

        # Verify duration covers ~360 days (12 * 30 days)
        acc_sub = db.get_account(subscriber)
        self.assertTrue(acc_sub["cbm_plus_until"] > time.time() + 86400 * 350)

        # 3. Test Annual Plan In-Game Transfer Slip Intent
        slip_subscriber = self._create_funded_user("annual_slip_sub", deposit_cents=0)
        tok_slip = create_session_token(slip_subscriber)

        status, slip_res, _ = self._request("POST", "/api/cbm/subscription/declare-slip", {
            "months": 12
        }, headers={"Authorization": f"Bearer {tok_slip}"})
        self.assertEqual(status, 200)
        self.assertEqual(slip_res.get("required_amount_gold"), 4800.0)
        self.assertEqual(slip_res.get("savings_gold"), 1200.0)
        self.assertEqual(slip_res.get("discount_percent"), 20)
        self.assertTrue(slip_res.get("is_annual"))

        slip_id = slip_res["subscription_id"]

        # Fulfill slip
        ok, msg, sub_rec = db.fulfill_pending_subscription(slip_id, tx_hash=f"tx_game_ann_{secrets.token_hex(4)}")
        self.assertTrue(ok)
        self.assertEqual(sub_rec["amount_cents"], 480000)
        self.assertEqual(sub_rec["months"], 12)

        # Check subscriber status
        acc_fulfilled = db.get_account(slip_subscriber)
        self.assertTrue(db.is_cbm_plus_active(acc_fulfilled))
        self.assertTrue(acc_fulfilled["cbm_plus_until"] > time.time() + 86400 * 350)

    def test_csp_and_gtag_headers(self):
        """Verify Content-Security-Policy permits Google Tag Manager and Analytics domains."""
        status, res, headers = self._request("GET", "/login")
        self.assertEqual(status, 200)
        csp = headers.get("Content-Security-Policy", "")
        self.assertIn("https://www.googletagmanager.com", csp)
        self.assertIn("https://*.googletagmanager.com", csp)
        self.assertIn("https://*.google-analytics.com", csp)
        self.assertIn("https://*.analytics.google.com", csp)

    def test_privacy_and_terms_pages_served(self):
        """Verify /privacy and /terms standalone pages return 200 and include Google Tag."""
        for path in ("/privacy", "/terms"):
            status, res, headers = self._request("GET", path, headers={"Accept": "text/html"})
            self.assertEqual(status, 200)
            raw_html = res.get("raw", "")
            self.assertIn("G-QCMCPSK0CF", raw_html)
            self.assertIn("Clan Bank Manager", raw_html)

    def test_custom_error_format_json_and_html(self):
        """Verify natural language error handling with legal links across JSON and HTML clients."""
        # 1. Non-existent route with JSON Accept header
        status, res_json, _ = self._request("GET", "/api/cbm/non_existent_route", headers={"Accept": "application/json"})
        self.assertEqual(status, 404)
        self.assertEqual(res_json.get("status"), "error")
        self.assertEqual(res_json.get("error_code"), "resource_not_found")
        self.assertIn("not found", res_json.get("message", "").lower())
        self.assertIn("terms_of_service", res_json.get("legal", {}))
        self.assertIn("privacy_policy", res_json.get("legal", {}))

        # 2. Non-existent route with HTML Accept header
        status, res_html, _ = self._request("GET", "/some_unknown_page.html", headers={"Accept": "text/html"})
        self.assertEqual(status, 404)
        raw_html = res_html.get("raw", "")
        self.assertIn("<!DOCTYPE html>", raw_html)
        self.assertIn("Page or Resource Not Found", raw_html)
        self.assertIn("/privacy", raw_html)
        self.assertIn("/terms", raw_html)

    def test_gunfight_arena_page_and_reward_settlement(self):
        """Verify /gunfight route is served and /api/cbm/gunfight/claim-reward safely credits rewards."""
        # 1. GET /gunfight returns 200 and includes Google Tag & P2P Engine
        status, res_html, headers = self._request("GET", "/gunfight", headers={"Accept": "text/html"})
        self.assertEqual(status, 200)
        raw_html = res_html.get("raw", "")
        self.assertIn("CBM Gunfight", raw_html)
        self.assertIn("G-QCMCPSK0CF", raw_html)
        self.assertIn("peerjs", raw_html)

        # 2. Unauthenticated reward claim fails with 401
        status, res_unauth, _ = self._request("POST", "/api/cbm/gunfight/claim-reward", {"reward_gold": 1.0, "nonce": "unauth_nonce"})
        self.assertEqual(status, 401)

        # 3. Authenticated user claims reward
        user = self._create_funded_user("gunfight_champ", deposit_cents=1000)
        tok = create_session_token(user)
        bal_before = db.get_account(user)["deposited_cents"]

        claim_nonce = f"test_nonce_{uuid.uuid4().hex[:8]}"
        status, res_claim, _ = self._request("POST", "/api/cbm/gunfight/claim-reward", {
            "reward_gold": 2.50,
            "nonce": claim_nonce
        }, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status, 200)
        self.assertEqual(res_claim.get("status"), "ok")
        self.assertEqual(res_claim.get("reward", {}).get("reward_gold"), 2.50)

        # Verify balance credited by 250 cents (2.50 Gold)
        bal_after = db.get_account(user)["deposited_cents"]
        self.assertEqual(bal_after, bal_before + 250)

        # 4. Duplicate nonce replay rejected (400)
        status_dup, res_dup, _ = self._request("POST", "/api/cbm/gunfight/claim-reward", {
            "reward_gold": 2.50,
            "nonce": claim_nonce
        }, headers={"Authorization": f"Bearer {tok}"})
        self.assertEqual(status_dup, 400)
        self.assertIn("already been claimed", res_dup.get("message", ""))

    def test_gunfight_p2p_mesh_and_lobby_heartbeat(self):
        """Verify WebRTC P2P mesh discovery, matchmaking heartbeat, lobby stats, and clean exit."""
        peer_a_id = f"cbm-gf-test-a-{uuid.uuid4().hex[:6]}"
        peer_b_id = f"cbm-gf-test-b-{uuid.uuid4().hex[:6]}"

        # 1. Peer A heartbeat in FFA
        status_a, res_a, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_a_id,
            "name": "Operative Alpha",
            "mode": "FFA",
            "charId": "marcus",
            "gunId": "hk_usp9",
            "teamSize": 4
        })
        self.assertEqual(status_a, 200)
        self.assertEqual(res_a.get("status"), "ok")
        peers_a = res_a.get("activePeers", [])
        # Heartbeat returns OTHER peers to connect to (excludes self)
        self.assertFalse(any(p.get("peerId") == peer_a_id for p in peers_a))

        # 2. Peer B heartbeat in FFA
        status_b, res_b, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_b_id,
            "name": "Operative Bravo",
            "mode": "FFA",
            "charId": "elena",
            "gunId": "desert_eagle",
            "teamSize": 4
        })
        self.assertEqual(status_b, 200)
        peers_b = res_b.get("activePeers", [])
        # Peer B discovers Peer A
        self.assertTrue(any(p.get("peerId") == peer_a_id for p in peers_b))
        self.assertFalse(any(p.get("peerId") == peer_b_id for p in peers_b))

        # 3. GET /api/cbm/gunfight/lobby/active?mode=FFA returns both peers
        status_act, res_act, _ = self._request("GET", "/api/cbm/gunfight/lobby/active?mode=FFA")
        self.assertEqual(status_act, 200)
        active_ids = [p.get("peerId") for p in res_act.get("activePeers", [])]
        self.assertIn(peer_a_id, active_ids)
        self.assertIn(peer_b_id, active_ids)

        # 4. GET /api/cbm/gunfight/lobby/stats returns count
        status_st, res_st, _ = self._request("GET", "/api/cbm/gunfight/lobby/stats")
        self.assertEqual(status_st, 200)
        self.assertGreaterEqual(res_st.get("totalOnline", 0), 2)
        self.assertGreaterEqual(res_st.get("modes", {}).get("FFA", 0), 2)

        # 5. Peer A leaves cleanly via beacon / leave endpoint
        status_lv, res_lv, _ = self._request("POST", "/api/cbm/gunfight/lobby/leave", {
            "peerId": peer_a_id
        })
        self.assertEqual(status_lv, 200)

        # 6. Verify Peer A removed from active roster
        status_act2, res_act2, _ = self._request("GET", "/api/cbm/gunfight/lobby/active?mode=FFA")
        self.assertEqual(status_act2, 200)
        active_ids2 = [p.get("peerId") for p in res_act2.get("activePeers", [])]
        self.assertNotIn(peer_a_id, active_ids2)
        self.assertIn(peer_b_id, active_ids2)

    def test_gunfight_custom_room_creation_and_isolation(self):
        """Verify custom room creation, rate-limiting, and strict peer isolation."""
        peer_host_id = f"test_host_{uuid.uuid4().hex[:6]}"
        peer_guest_id = f"test_guest_{uuid.uuid4().hex[:6]}"
        peer_other_id = f"test_other_{uuid.uuid4().hex[:6]}"

        # 1. Host creates a custom room as anonymous guest
        status_rm, res_rm, _ = self._request("POST", "/api/cbm/gunfight/lobby/create-room", {
            "peerId": peer_host_id,
            "name": "HostAlpha",
            "mode": "FFA",
            "isAnon": True
        })
        self.assertEqual(status_rm, 200)
        self.assertEqual(res_rm.get("status"), "ok")
        room_id = res_rm.get("roomId")
        self.assertTrue(bool(room_id))
        self.assertTrue(res_rm.get("isHost"))

        # 2. Anonymous rate-limiting: immediate second room creation should return 429
        status_rate, res_rate, _ = self._request("POST", "/api/cbm/gunfight/lobby/create-room", {
            "peerId": peer_host_id,
            "name": "HostAlpha",
            "mode": "FFA",
            "isAnon": True
        })
        self.assertEqual(status_rate, 429)

        # 3. Host sends heartbeat inside custom room
        status_h, res_h, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_host_id,
            "name": "HostAlpha",
            "mode": "FFA",
            "roomId": room_id,
            "isHost": True,
            "isAnon": True
        })
        self.assertEqual(status_h, 200)

        # 4. Third player sends heartbeat in default public room
        status_oth, res_oth, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_other_id,
            "name": "PublicPlayer",
            "mode": "FFA",
            "roomId": "public-ffa",
            "isAnon": True
        })
        self.assertEqual(status_oth, 200)
        # Public player should NOT see HostAlpha in private room
        oth_peers = [p.get("peerId") for p in res_oth.get("activePeers", [])]
        self.assertNotIn(peer_host_id, oth_peers)

        # 5. Guest sends heartbeat joining HostAlpha's room
        status_g, res_g, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_guest_id,
            "name": "GuestBravo",
            "mode": "FFA",
            "roomId": room_id,
            "isAnon": True
        })
        self.assertEqual(status_g, 200)
        # Guest sees HostAlpha
        guest_seen = [p.get("peerId") for p in res_g.get("activePeers", [])]
        self.assertIn(peer_host_id, guest_seen)
        self.assertNotIn(peer_other_id, guest_seen)

        # 6. Host sends heartbeat again; now sees GuestBravo, but NOT PublicPlayer
        status_h2, res_h2, _ = self._request("POST", "/api/cbm/gunfight/lobby/heartbeat", {
            "peerId": peer_host_id,
            "name": "HostAlpha",
            "mode": "FFA",
            "roomId": room_id,
            "isHost": True,
            "isAnon": True
        })
        self.assertEqual(status_h2, 200)
        host_seen = [p.get("peerId") for p in res_h2.get("activePeers", [])]
        self.assertIn(peer_guest_id, host_seen)
        self.assertNotIn(peer_other_id, host_seen)

        # Clean up
        self._request("POST", "/api/cbm/gunfight/lobby/leave", {"peerId": peer_host_id})
        self._request("POST", "/api/cbm/gunfight/lobby/leave", {"peerId": peer_guest_id})
        self._request("POST", "/api/cbm/gunfight/lobby/leave", {"peerId": peer_other_id})


if __name__ == "__main__":
    unittest.main()



