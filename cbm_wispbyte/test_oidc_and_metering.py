#!/usr/bin/env python3
"""
Test Suite: CBM Authoritative SSO (OIDC/OAuth 2.0) and Virtual Credit Metering
==============================================================================
Validates:
1. PKCE derivation and RFC 7636 S256 verification.
2. Authoritative OAuth 2.0 / OIDC database lifecycle:
   - Client registration (public vs confidential).
   - Authorization code issuance and atomic single-use consumption.
   - Token issuance and verification.
3. Atomic Virtual Credit Metering:
   - Fail-closed overdraw protection (InsufficientCreditsError).
   - Wallet freezing (WalletFrozenError).
   - Idempotency key replay protection (deduplication).
   - Automated failure compensation (refund on downstream failure).
   - High-concurrency race condition testing (zero negative balance).
4. Authoritative HTTP Endpoints & Live Integration:
   - /.well-known/openid-configuration and /.well-known/jwks.json.
   - SSO banner asset delivery (/cbm-sso-banner.png) with CORS.
   - Complete live HTTP OAuth 2.0 flow: authorize -> code -> token exchange -> userinfo.
"""

import os
import sys
import time
import json
import base64
import hashlib
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
import urllib.parse
from typing import Dict, Any

# Ensure cbm_wispbyte directory is on path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import jwt
import main
from db_layer import CBMDatabase
from credit_engine import CBMCreditEngine, InsufficientCreditsError, WalletFrozenError
from oidc_client import OIDCClient
import crypto_util


class TestOIDCAndPKCE(unittest.TestCase):
    """Validates PKCE derivation, verification, and OIDC client security."""

    def test_pkce_generation_and_s256_verification(self):
        """RFC 7636 PKCE S256 challenge generation and verification."""
        verifier, challenge = OIDCClient.generate_pkce()

        self.assertTrue(len(verifier) >= 43)
        self.assertTrue(len(verifier) <= 128)
        self.assertTrue(len(challenge) >= 43)

        # Re-derive challenge from verifier using SHA-256
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        expected_challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
        self.assertEqual(challenge, expected_challenge)

        # Mismatched verifier test
        wrong_digest = hashlib.sha256((verifier + "_corrupted").encode("ascii")).digest()
        wrong_challenge = base64.urlsafe_b64encode(wrong_digest).decode("ascii").rstrip("=")
        self.assertNotEqual(challenge, wrong_challenge)

    def test_stdlib_hs256_jwt_interoperability(self):
        """Verifies zero-dependency HS256 JWT encoding and decoding interoperates with PyJWT."""
        key = crypto_util.get_master_hmac_key()
        payload = {
            "iss": "https://cbm.wispbyte.org",
            "sub": "TestUser123",
            "aud": "cbm_client_test",
            "exp": int(time.time()) + 3600,
            "preferred_username": "TestUser123"
        }

        # 1. Encode with stdlib crypto_util
        token = crypto_util.encode_hs256_jwt(payload, key)
        self.assertEqual(token.count("."), 2)

        # 2. Decode with stdlib crypto_util
        decoded_stdlib = crypto_util.decode_hs256_jwt(token, key, audience="cbm_client_test")
        self.assertEqual(decoded_stdlib["sub"], "TestUser123")
        self.assertEqual(decoded_stdlib["aud"], "cbm_client_test")

        # 3. Decode with PyJWT (validating strict RFC 7519 compliance)
        decoded_pyjwt = jwt.decode(token, key, algorithms=["HS256"], audience="cbm_client_test")
        self.assertEqual(decoded_pyjwt["sub"], "TestUser123")

        # 4. Tampered token signature fails
        parts = token.split(".")
        tampered_token = f"{parts[0]}.{parts[1]}.bad_sig_value"
        with self.assertRaises(ValueError):
            crypto_util.decode_hs256_jwt(tampered_token, key)


class TestAuthoritativeOAuthDatabase(unittest.TestCase):
    """Validates db_layer methods for OAuth 2.0 client and token lifecycle."""

    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        self.db = CBMDatabase(db_path=self.temp_db.name, use_supabase=False)

    def tearDown(self):
        try:
            if os.path.exists(self.temp_db.name):
                os.remove(self.temp_db.name)
        except Exception:
            pass

    def test_create_and_get_oauth_client(self):
        """Confidential and public client registration and retrieval."""
        # 1. Register confidential client
        ok, client, msg = self.db.create_oauth_client(
            owner_account="LeaderAccount",
            client_name="Clan War Dashboard",
            redirect_uris=["https://wardash.example.com/callback"],
            client_type="confidential",
            allowed_scopes="openid profile email"
        )
        self.assertTrue(ok)
        self.assertTrue(client["client_id"].startswith("cbm_client_"))
        self.assertTrue(client["client_secret"].startswith("cbm_sec_"))
        self.assertEqual(client["client_type"], "confidential")

        # Retrieve client
        retrieved = self.db.get_oauth_client(client["client_id"])
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["client_name"], "Clan War Dashboard")
        self.assertIn("https://wardash.example.com/callback", retrieved["redirect_uris"])

        # Verify client secret
        self.assertTrue(self.db.verify_oauth_client_secret(client["client_id"], client["client_secret"]))
        self.assertFalse(self.db.verify_oauth_client_secret(client["client_id"], "wrong_secret"))

        # 2. Register public client (PKCE only, no secret)
        ok_pub, pub_client, _ = self.db.create_oauth_client(
            owner_account="LeaderAccount",
            client_name="Mobile SPA App",
            redirect_uris=["https://mobile.example.com/oauth/callback"],
            client_type="public"
        )
        self.assertTrue(ok_pub)
        self.assertIsNone(pub_client["client_secret"])
        self.assertEqual(pub_client["client_type"], "public")
        self.assertTrue(self.db.verify_oauth_client_secret(pub_client["client_id"], None))

    def test_list_oauth_clients_by_owner(self):
        """Filters clients by owner account name."""
        self.db.create_oauth_client("OwnerA", "App 1", ["https://a.com/cb"])
        self.db.create_oauth_client("OwnerA", "App 2", ["https://a2.com/cb"])
        self.db.create_oauth_client("OwnerB", "App 3", ["https://b.com/cb"])

        clients_a = self.db.list_oauth_clients_by_owner("OwnerA")
        self.assertEqual(len(clients_a), 2)
        clients_b = self.db.list_oauth_clients_by_owner("OwnerB")
        self.assertEqual(len(clients_b), 1)

    def test_oauth_code_issuance_and_single_use_consumption(self):
        """Authorization code bound to PKCE, redirect_uri, and single-use."""
        _, challenge = OIDCClient.generate_pkce()
        redirect_uri = "https://myclan.org/oauth/callback"

        # Issue code
        ok, raw_code = self.db.create_oauth_code(
            client_id="cbm_client_test",
            account_name="GeneralV",
            redirect_uri=redirect_uri,
            scope="openid profile",
            code_challenge=challenge,
            code_challenge_method="S256"
        )
        self.assertTrue(ok)
        self.assertTrue(raw_code.startswith("cbm_code_"))

        # Consume code with wrong redirect_uri -> fails
        bad_consume = self.db.consume_oauth_code(raw_code, "cbm_client_test", "https://attacker.com/callback")
        self.assertIsNone(bad_consume)

        # Consume code with wrong client_id -> fails
        bad_client = self.db.consume_oauth_code(raw_code, "cbm_client_wrong", redirect_uri)
        self.assertIsNone(bad_client)

        # Valid consumption
        consumed = self.db.consume_oauth_code(raw_code, "cbm_client_test", redirect_uri)
        self.assertIsNotNone(consumed)
        self.assertEqual(consumed["account_name"], "GeneralV")
        self.assertEqual(consumed["code_challenge"], challenge)

        # Single-use guarantee: Replay attempt must return None
        replay = self.db.consume_oauth_code(raw_code, "cbm_client_test", redirect_uri)
        self.assertIsNone(replay)

    def test_oauth_access_token_issuance_and_verification(self):
        """Issues bearer access tokens, hashes in SQLite, and validates."""
        raw_token, expires_in = self.db.create_oauth_tokens(
            client_id="cbm_client_test",
            account_name="CommanderX",
            scope="openid profile email",
            access_ttl=3600
        )
        self.assertTrue(raw_token.startswith("cbm_at_"))
        self.assertEqual(expires_in, 3600)

        # Valid verification
        record = self.db.verify_oauth_access_token(raw_token)
        self.assertIsNotNone(record)
        self.assertEqual(record["account_name"], "CommanderX")
        self.assertEqual(record["client_id"], "cbm_client_test")

        # Invalid token verification
        invalid_record = self.db.verify_oauth_access_token(raw_token + "_tampered")
        self.assertIsNone(invalid_record)


class TestVirtualCreditMeteringEngine(unittest.TestCase):
    """Validates atomic virtual credit debiting, fail-closed protection, and compensation."""

    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        self.db = CBMDatabase(db_path=self.temp_db.name, use_supabase=False)
        self.engine = CBMCreditEngine(db=self.db)

    def tearDown(self):
        try:
            if os.path.exists(self.temp_db.name):
                os.remove(self.temp_db.name)
        except Exception:
            pass

    def test_grant_and_atomic_debit(self):
        """Grants credits and verifies balance decrements accurately."""
        # 1. New wallet defaults to 0
        wallet = self.engine.get_or_create_wallet("PlayerOne")
        self.assertEqual(wallet["credit_balance"], 0)

        # 2. Debit without credits raises InsufficientCreditsError (fail-closed)
        with self.assertRaises(InsufficientCreditsError):
            self.engine.deduct_credits_atomic("PlayerOne", 10)

        # 3. Grant 100 credits
        ok, bal, tx_id = self.engine.grant_or_adjust_credits("PlayerOne", 100, reason="Starter Pack")
        self.assertTrue(ok)
        self.assertEqual(bal, 100)

        # 4. Deduct 35 credits
        ok, new_bal, debit_tx = self.engine.deduct_credits_atomic(
            "PlayerOne", 35, endpoint="/api/v1/bank/status"
        )
        self.assertTrue(ok)
        self.assertEqual(new_bal, 65)

        # Verify wallet state in DB
        w_after = self.engine.get_or_create_wallet("PlayerOne")
        self.assertEqual(w_after["credit_balance"], 65)

    def test_wallet_freezing(self):
        """Frozen account rejects all debits immediately."""
        self.engine.grant_or_adjust_credits("FrozenPlayer", 50)

        # Freeze account directly in SQLite
        conn = self.db.get_write_connection()
        conn.execute("UPDATE cbm_accounts SET is_delinquent = 1 WHERE account_name = 'FrozenPlayer'")
        conn.commit()
        conn.close()

        with self.assertRaises(WalletFrozenError):
            self.engine.deduct_credits_atomic("FrozenPlayer", 10)

    def test_idempotency_key_deduplication(self):
        """Duplicate request with same idempotency key does not charge wallet twice."""
        self.engine.grant_or_adjust_credits("IdempUser", 100)
        idemp_key = "req_uuid_unique_999"

        # First request
        ok1, bal1, tx1 = self.engine.deduct_credits_atomic(
            "IdempUser", 20, idempotency_key=idemp_key, endpoint="/api/v1/verify"
        )
        self.assertTrue(ok1)
        self.assertEqual(bal1, 80)

        # Second request with identical idempotency key (e.g. network retry)
        ok2, bal2, tx2 = self.engine.deduct_credits_atomic(
            "IdempUser", 20, idempotency_key=idemp_key, endpoint="/api/v1/verify"
        )
        self.assertTrue(ok2)
        # Balance must remain 80 (not decremented to 60)
        self.assertEqual(bal2, 80)
        self.assertEqual(tx1, tx2)

        w = self.engine.get_or_create_wallet("IdempUser")
        self.assertEqual(w["credit_balance"], 80)

    def test_automated_failure_compensation(self):
        """Downstream workload crash triggers automated credit refund."""
        self.engine.grant_or_adjust_credits("CompensateUser", 50)

        # Deduct 30 credits for an operation
        _, bal_after, tx_id = self.engine.deduct_credits_atomic("CompensateUser", 30)
        self.assertEqual(bal_after, 20)

        # Workload failed: compensate original transaction
        refund_ok = self.engine.compensate_failed_request(tx_id, reason="UPSTREAM_TIMEOUT")
        self.assertTrue(refund_ok)

        # Balance should be fully restored to 50
        w = self.engine.get_or_create_wallet("CompensateUser")
        self.assertEqual(w["credit_balance"], 50)

        # Calling compensate a second time returns False (already compensated)
        second_refund = self.engine.compensate_failed_request(tx_id)
        self.assertFalse(second_refund)

    def test_concurrent_multi_threaded_race_conditions(self):
        """
        10 concurrent threads attempt to debit 10 credits each from a wallet with only 50 credits.
        Strict fail-closed overdraw protection: exactly 5 must succeed, 5 must fail.
        Final balance must be exactly 0, NEVER negative.
        """
        self.engine.grant_or_adjust_credits("RacePlayer", 50)

        success_count = [0]
        fail_count = [0]
        lock = threading.Lock()

        def worker():
            try:
                ok, _, _ = self.engine.deduct_credits_atomic("RacePlayer", 10)
                if ok:
                    with lock:
                        success_count[0] += 1
            except InsufficientCreditsError:
                with lock:
                    fail_count[0] += 1

        threads = [threading.Thread(target=worker) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(success_count[0], 5)
        self.assertEqual(fail_count[0], 5)

        w = self.engine.get_or_create_wallet("RacePlayer")
        self.assertEqual(w["credit_balance"], 0)


class TestFullAuthoritativeSSOFlow(unittest.TestCase):
    """Validates end-to-end OAuth 2.0 / OIDC provider flow with JWT verification."""

    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db.close()
        self.db = CBMDatabase(db_path=self.temp_db.name, use_supabase=False)

        # Register test account
        self.db.register_or_get_account("SsoUser", display_name="SSO Commander")

    def tearDown(self):
        try:
            if os.path.exists(self.temp_db.name):
                os.remove(self.temp_db.name)
        except Exception:
            pass

    def test_complete_sso_authorization_and_token_exchange(self):
        """Simulates full OAuth 2.0 PKCE flow: register -> code -> token -> id_token -> userinfo."""
        # 1. Register Client Application
        ok, client, _ = self.db.create_oauth_client(
            owner_account="AdminAccount",
            client_name="ThirdPartyApp",
            redirect_uris=["https://thirdparty.org/callback"],
            client_type="confidential"
        )
        self.assertTrue(ok)
        client_id = client["client_id"]
        client_secret = client["client_secret"]

        # 2. Client initiates authorization with PKCE
        verifier, challenge = OIDCClient.generate_pkce()
        redirect_uri = "https://thirdparty.org/callback"

        # 3. Server issues authorization code for authenticated user
        ok_code, raw_code = self.db.create_oauth_code(
            client_id=client_id,
            account_name="SsoUser",
            redirect_uri=redirect_uri,
            scope="openid profile email",
            code_challenge=challenge,
            code_challenge_method="S256"
        )
        self.assertTrue(ok_code)

        # 4. Client exchanges code + verifier for tokens
        # Verify client credentials
        self.assertTrue(self.db.verify_oauth_client_secret(client_id, client_secret))

        # Consume code
        code_record = self.db.consume_oauth_code(raw_code, client_id, redirect_uri)
        self.assertIsNotNone(code_record)

        # Validate PKCE verifier matches code_challenge
        computed_digest = hashlib.sha256(verifier.encode("ascii")).digest()
        computed_challenge = base64.urlsafe_b64encode(computed_digest).decode("ascii").rstrip("=")
        self.assertEqual(computed_challenge, code_record["code_challenge"])

        # Issue tokens
        access_token, expires_in = self.db.create_oauth_tokens(
            client_id=client_id,
            account_name=code_record["account_name"],
            scope=code_record["scope"]
        )
        self.assertTrue(access_token.startswith("cbm_at_"))

        # Issue signed ID Token JWT
        now_ts = int(time.time())
        id_payload = {
            "iss": "https://cbm.wispbyte.org",
            "sub": code_record["account_name"],
            "aud": client_id,
            "exp": now_ts + 3600,
            "iat": now_ts,
            "preferred_username": code_record["account_name"]
        }
        hmac_key = crypto_util.get_master_hmac_key()
        id_token = jwt.encode(id_payload, hmac_key, algorithm="HS256")

        # 5. Client decodes and verifies ID Token JWT
        decoded = jwt.decode(id_token, hmac_key, algorithms=["HS256"], audience=client_id)
        self.assertEqual(decoded["sub"], "SsoUser")
        self.assertEqual(decoded["preferred_username"], "SsoUser")
        self.assertEqual(decoded["aud"], client_id)

        # 6. UserInfo endpoint verification
        token_info = self.db.verify_oauth_access_token(access_token)
        self.assertIsNotNone(token_info)
        self.assertEqual(token_info["account_name"], "SsoUser")


class TestSSOBannerAsset(unittest.TestCase):
    """Validates that the official SSO Banner asset exists and is loadable."""

    def test_banner_asset_file_integrity(self):
        banner_path = os.path.join(BASE_DIR, "cbm-sso-banner.png")
        self.assertTrue(os.path.exists(banner_path), f"Banner file missing at {banner_path}")
        size = os.path.getsize(banner_path)
        self.assertGreater(size, 10000, "Banner asset file is unexpectedly empty or corrupted")

        # Check PNG header magic bytes
        with open(banner_path, "rb") as f:
            header = f.read(8)
            self.assertEqual(header, b"\x89PNG\r\n\x1a\n", "Banner file does not have valid PNG header magic")


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Handler that prevents following 302 redirects, returning the redirect response."""
    def http_error_302(self, req, fp, code, msg, headers):
        return fp


class TestLiveHTTPEndpoints(unittest.TestCase):
    """Starts live HTTP server on local port and verifies endpoints end-to-end."""

    SERVER_PORT = 10098
    server_thread = None
    server_instance = None

    @classmethod
    def setUpClass(cls):
        # Preload static assets including cbm-sso-banner.png
        main.load_static_cache()

        cls.server_instance = main.CBMThreadPoolServer(
            ("127.0.0.1", cls.SERVER_PORT),
            main.CBMHealthHandler,
            max_workers=4
        )
        cls.server_thread = threading.Thread(target=cls.server_instance.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)  # Allow socket to bind

    @classmethod
    def tearDownClass(cls):
        if cls.server_instance:
            try:
                cls.server_instance.shutdown()
                cls.server_instance.server_close()
            except Exception:
                pass

    def _url(self, path: str) -> str:
        return f"http://127.0.0.1:{self.SERVER_PORT}{path}"

    def test_http_sso_banner_asset_delivery(self):
        """Verifies GET /cbm-sso-banner.png serves PNG image with CORS header."""
        req = urllib.request.Request(self._url("/cbm-sso-banner.png"))
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Content-Type"), "image/png")
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            data = resp.read()
            self.assertGreater(len(data), 100000)
            self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")

    def test_http_openid_configuration(self):
        """Verifies GET /.well-known/openid-configuration RFC compliance."""
        req = urllib.request.Request(self._url("/.well-known/openid-configuration"))
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Content-Type"), "application/json")
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            data = json.loads(resp.read().decode("utf-8"))

            self.assertIn("issuer", data)
            self.assertIn("authorization_endpoint", data)
            self.assertIn("token_endpoint", data)
            self.assertIn("userinfo_endpoint", data)
            self.assertIn("jwks_uri", data)
            self.assertIn("S256", data.get("code_challenge_methods_supported", []))

    def test_http_jwks_endpoint(self):
        """Verifies GET /.well-known/jwks.json."""
        req = urllib.request.Request(self._url("/.well-known/jwks.json"))
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Content-Type"), "application/json")
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("keys", data)
            self.assertIsInstance(data["keys"], list)

    def test_http_oauth_authorize_validation(self):
        """Verifies GET /api/oauth/authorize input validation."""
        # Missing client_id
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(self._url("/api/oauth/authorize"))
        self.assertEqual(ctx.exception.code, 400)

        # Invalid client_id
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(self._url("/api/oauth/authorize?client_id=nonexistent&redirect_uri=https://a.com"))
        self.assertEqual(ctx.exception.code, 400)

    def test_http_complete_oauth_flow(self):
        """Full end-to-end OAuth flow through HTTP server."""
        # 1. Create client in DB
        ok, client, _ = main.db.create_oauth_client(
            owner_account="LiveAdmin",
            client_name="LiveTestApp",
            redirect_uris=["http://localhost:9999/callback"],
            client_type="confidential"
        )
        self.assertTrue(ok)
        client_id = client["client_id"]
        client_secret = client["client_secret"]

        # 2. Register user and generate valid session token
        main.db.register_or_get_account("LiveUser", display_name="Live Soldier")
        session_token = crypto_util.create_session_token("LiveUser")

        # 3. Call /api/oauth/authorize
        verifier, challenge = OIDCClient.generate_pkce()
        redirect_uri = "http://localhost:9999/callback"
        auth_url = self._url(
            f"/api/oauth/authorize?client_id={client_id}&redirect_uri={urllib.parse.quote(redirect_uri)}"
            f"&response_type=code&scope=openid+profile+email&code_challenge={challenge}"
            f"&code_challenge_method=S256&state=state_live_123"
        )

        opener = urllib.request.build_opener(NoRedirectHandler)
        req = urllib.request.Request(auth_url, headers={
            "Authorization": f"Bearer {session_token}"
        })
        resp = opener.open(req)
        # Server should issue 302 redirect to redirect_uri with code
        self.assertEqual(resp.status, 302)
        location = resp.headers.get("Location")
        self.assertTrue(location.startswith(redirect_uri))

        parsed_loc = urllib.parse.urlparse(location)
        query_params = urllib.parse.parse_qs(parsed_loc.query)
        self.assertIn("code", query_params)
        self.assertEqual(query_params.get("state"), ["state_live_123"])
        auth_code = query_params["code"][0]

        # 4. Exchange code for tokens via POST /api/oauth/token
        token_payload = urllib.parse.urlencode({
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "code": auth_code,
            "redirect_uri": redirect_uri,
            "code_verifier": verifier
        }).encode("utf-8")

        token_req = urllib.request.Request(
            self._url("/api/oauth/token"),
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        with urllib.request.urlopen(token_req, timeout=5) as token_resp:
            self.assertEqual(token_resp.status, 200)
            token_data = json.loads(token_resp.read().decode("utf-8"))
            self.assertIn("access_token", token_data)
            self.assertIn("id_token", token_data)
            self.assertEqual(token_data.get("token_type"), "Bearer")

            access_token = token_data["access_token"]
            id_token = token_data["id_token"]

        # Decode ID token
        hmac_key = crypto_util.get_master_hmac_key()
        claims = jwt.decode(id_token, hmac_key, algorithms=["HS256"], audience=client_id)
        self.assertEqual(claims["sub"], "LiveUser")

        # 5. Access /api/oauth/userinfo with Bearer token
        userinfo_req = urllib.request.Request(
            self._url("/api/oauth/userinfo"),
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(userinfo_req, timeout=5) as userinfo_resp:
            self.assertEqual(userinfo_resp.status, 200)
            user_data = json.loads(userinfo_resp.read().decode("utf-8"))
            self.assertEqual(user_data["sub"], "LiveUser")
            self.assertEqual(user_data["preferred_username"], "LiveUser")


if __name__ == "__main__":
    unittest.main(verbosity=2)
