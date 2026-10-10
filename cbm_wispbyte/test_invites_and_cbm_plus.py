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
            "invite_code": code_1
        })
        self.assertEqual(status, 200, f"Track invite 1 failed: {track1}")
        self.assertEqual(track1.get("status"), "ok")

        # 3. Prospect tracks CODE_2 (same inviter) -> 409 Conflict
        status, track2, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_2
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
            "invite_code": code_a
        })
        self.assertEqual(status, 200)

        status, track_b, _ = self._request("POST", "/api/cbm/invites/track", {
            "prospect_token": prospect_token,
            "invite_code": code_b
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
            "username": new_username,
            "password": "strong_password_123",
            "avatar_url": "https://cbm.wispbyte.org/avatar.png",
            "primary_territorial_account": f"TT_{new_username}",
            "pin": "654321"
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
            "pin": "123456"
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
            "pin": "123456"
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
            "invite_code": code_id
        })
        self.assertEqual(status, 404)

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


if __name__ == "__main__":
    unittest.main()
