import unittest
import urllib.request
import urllib.error
import json
import threading
import socket
from http.server import HTTPServer
import os
import sys

# Ensure cbm_wispbyte directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import (
    CBMHealthHandler,
    is_internal_cbm_function,
    is_cors_bypassed_endpoint,
    is_authorized_first_party_origin,
    db,
)


class TestCORSClassificationPredicates(unittest.TestCase):
    """
    Validates classification of routes between internal CBM functions
    and public developer endpoints.
    """

    def test_developer_endpoints_bypass_cors(self):
        dev_routes = [
            "/api/v1/bank/status",
            "/api/v1/bank/reserves",
            "/api/v1/members/Commander",
            "/api/v1/members/Commander/loans",
            "/api/v1/donations/declare",
            "/api/v1/donors/leaderboard",
            "/api/v1/verify/player",
            "/api/v1/economy/telemetry",
            "/api/v1/ai/chat",
            "/api/v1/ai/models",
            "/api/v1/ai/status/sample-req",
            "/api/v1/products/create",
            "/api/v1/products/order/create",
            "/api/v1/products/verify",
            "/api/v1/ads/inventory",
            "/api/v1/ads/serve",
            "/api/v1/sponsorships/purchase",
            "/api/cbm/chat/create",
            "/api/cbm/chat/send",
            "/api/cbm/chat/messages",
            "/api/cbm/chat/stickers",
            "/api/cbm/chat/stickers/create",
            "/api/cbm/chat/upload",
            "/api/cbm/chat/end",
            "/api/cbm/dev/keys",
            "/api/cbm/dev/keys/create",
            "/api/cbm/dev/keys/revoke",
            "/api/cbm/dev/overview",
            "/api/cbm/dev/products",
            "/api/cbm/dev/products/create",
            "/api/cbm/dev/products/archive",
            "/api/cbm/dev/products/upload-image",
            "/api/cbm/dev/sdk/download",
            "/api/cbm/oauth/clients",
            "/api/cbm/oauth/clients/create",
            "/api/cbm/credits/wallet",
            "/api/cbm/ads/inventory",
            "/api/cbm/ads/serve",
            "/api/cbm/sponsorships/purchase",
            "/api/cbm/economy/telemetry",
            "/api/oauth/authorize",
            "/api/oauth/token",
            "/api/oauth/userinfo",
            "/.well-known/openid-configuration",
            "/.well-known/jwks.json",
            "/status",
            "/health",
            "/widget.js",
            "/widget.html",
            "/cbm-logo.png",
            "/cbm-sso-banner.png",
        ]

        for route in dev_routes:
            with self.subTest(route=route):
                self.assertFalse(
                    is_internal_cbm_function(route),
                    f"{route} should NOT be classified as internal CBM function",
                )
                self.assertTrue(
                    is_cors_bypassed_endpoint(route),
                    f"{route} should be classified as CORS-bypassed endpoint",
                )

    def test_internal_cbm_endpoints_retained(self):
        internal_routes = [
            "/api/cbm/auth/login",
            "/api/cbm/auth/register",
            "/api/cbm/auth/create-pin",
            "/api/cbm/auth/verify-pin",
            "/api/cbm/auth/change-pin",
            "/api/cbm/auth/set-pin",
            "/api/cbm/account",
            "/api/cbm/profile",
            "/api/cbm/withdraw",
            "/api/cbm/loan/request",
            "/api/cbm/loan/repay",
            "/api/cbm/loan/facility",
            "/api/cbm/loans",
            "/api/cbm/donate",
            "/api/cbm/donations/slip-status",
            "/api/cbm/payment-methods",
            "/api/cbm/link-payment-method",
            "/api/cbm/referral/register",
            "/api/cbm/referral/stats",
            "/api/cbm/treasury/sync",
            "/api/cbm/election/claim",
            "/api/cbm/votes/claim",
        ]

        for route in internal_routes:
            with self.subTest(route=route):
                self.assertTrue(
                    is_internal_cbm_function(route),
                    f"{route} MUST be classified as internal CBM function",
                )
                self.assertFalse(
                    is_cors_bypassed_endpoint(route),
                    f"{route} MUST NOT bypass CORS restrictions",
                )


class TestLiveCORSServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def _make_request(self, method: str, path: str, headers: dict = None, body: bytes = None):
        url = f"http://127.0.0.1:{self.port}{path}"
        req = urllib.request.Request(url, data=body, method=method)
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, dict(resp.headers), resp.read()
        except urllib.error.HTTPError as err:
            return err.code, dict(err.headers), err.read()

    def test_preflight_options_on_developer_endpoints(self):
        """
        External third-party origin OPTIONS preflight requests to developer endpoints
        must return HTTP 200 with permissive CORS headers.
        """
        external_origin = "https://third-party-mod.com"
        test_paths = [
            "/api/v1/bank/status",
            "/api/v1/ai/chat",
            "/api/cbm/chat/create",
            "/api/cbm/chat/send",
            "/api/cbm/chat/messages",
            "/api/cbm/ads/inventory",
            "/api/cbm/ads/serve",
            "/api/cbm/dev/overview",
            "/api/cbm/dev/keys",
            "/api/oauth/authorize",
            "/api/oauth/token",
            "/api/oauth/userinfo",
            "/.well-known/openid-configuration",
            "/.well-known/jwks.json",
            "/status",
        ]

        for p in test_paths:
            with self.subTest(path=p):
                status, hdrs, body = self._make_request(
                    "OPTIONS",
                    p,
                    headers={
                        "Origin": external_origin,
                        "Access-Control-Request-Method": "POST",
                        "Access-Control-Request-Headers": "authorization, content-type, x-cbm-api-key",
                    },
                )
                self.assertEqual(status, 200, f"Expected 200 for OPTIONS {p}, got {status}: {body}")
                allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
                self.assertIn(
                    allow_origin,
                    (external_origin, "*"),
                    f"Expected permissive Access-Control-Allow-Origin for {p}, got {allow_origin}",
                )
                allow_methods = hdrs.get("Access-Control-Allow-Methods") or hdrs.get("access-control-allow-methods")
                self.assertIsNotNone(allow_methods, f"Expected Access-Control-Allow-Methods for {p}")
                self.assertIn("OPTIONS", allow_methods)

    def test_preflight_options_on_internal_endpoints_rejected(self):
        """
        External third-party origin OPTIONS preflight to internal CBM banking endpoints
        must be rejected with HTTP 403 forbidden_origin.
        """
        external_origin = "https://malicious-external-site.com"
        internal_paths = [
            "/api/cbm/account",
            "/api/cbm/withdraw",
            "/api/cbm/loan/request",
            "/api/cbm/auth/login",
            "/api/cbm/auth/verify-pin",
            "/api/cbm/donate",
        ]

        for p in internal_paths:
            with self.subTest(path=p):
                status, hdrs, body = self._make_request(
                    "OPTIONS",
                    p,
                    headers={
                        "Origin": external_origin,
                        "Access-Control-Request-Method": "POST",
                    },
                )
                self.assertEqual(status, 403, f"Expected 403 for OPTIONS {p}, got {status}")
                data = json.loads(body.decode("utf-8"))
                self.assertEqual(data.get("error"), "forbidden_origin")

    def test_cross_origin_get_on_developer_endpoint(self):
        """
        GET /api/cbm/ads/inventory from external origin returns 200 and includes CORS origin header.
        """
        external_origin = "https://partner-portal.io"
        status, hdrs, body = self._make_request(
            "GET",
            "/api/cbm/ads/inventory",
            headers={"Origin": external_origin},
        )
        self.assertEqual(status, 200, f"Expected 200, got {status}: {body}")
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertIn(allow_origin, (external_origin, "*"))

    def test_cross_origin_get_on_api_v1_endpoint_cors_headers(self):
        """
        GET /api/v1/bank/status from external origin emits permissive CORS headers
        even on authentication challenge (401), and on valid authentication (200).
        """
        external_origin = "https://partner-portal.io"
        # 1. Unauthenticated challenge
        status, hdrs, body = self._make_request(
            "GET",
            "/api/v1/bank/status",
            headers={"Origin": external_origin},
        )
        self.assertEqual(status, 401)
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertIn(allow_origin, (external_origin, "*"))

        # 2. Authenticated with valid developer key
        acc = "CorsDevTestUser"
        db.register_member_account(
            username=acc,
            password="test_password_123",
            avatar_url="https://cbm.wispbyte.org/avatar.png",
            primary_territorial_account="TerritoryCorsPlayer",
            pin="123456",
        )
        db.credit_deposit(acc, 10000, "tx_test_cors_setup_123")
        ok, secret_token, key_meta = db.create_api_key(
            owner_account=acc,
            app_name="CORS Test Key",
            scopes="read:bank,write:donations",
        )
        status, hdrs, body = self._make_request(
            "GET",
            "/api/v1/bank/status",
            headers={
                "Origin": external_origin,
                "Authorization": f"Bearer {secret_token}",
            },
        )
        self.assertEqual(status, 200, f"Expected 200, got {status}: {body}")
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertIn(allow_origin, (external_origin, "*"))

    def test_cross_origin_get_on_internal_endpoint_blocked(self):
        """
        GET /api/cbm/account with external Origin header must be rejected with 403.
        """
        external_origin = "https://unauthorized-consumer.org"
        status, hdrs, body = self._make_request(
            "GET",
            "/api/cbm/account?name=Alice",
            headers={"Origin": external_origin},
        )
        self.assertEqual(status, 403)
        data = json.loads(body.decode("utf-8"))
        self.assertEqual(data.get("error"), "forbidden_origin")

    def test_cross_origin_post_on_developer_chat_bypasses_origin_block(self):
        """
        POST /api/cbm/chat/send from external origin should not be blocked by Domain Origin Policy.
        (It will reach authentication/payload handler rather than 403 forbidden_origin).
        """
        external_origin = "https://game-client-app.com"
        payload = json.dumps({"session_id": "test_sess", "message": "Hello world"}).encode("utf-8")
        status, hdrs, body = self._make_request(
            "POST",
            "/api/cbm/chat/send",
            headers={
                "Origin": external_origin,
                "Content-Type": "application/json",
            },
            body=payload,
        )
        # Should not be 403 forbidden_origin; will be 401 or 400 or 200 depending on session validity
        self.assertNotEqual(status, 403, f"Cross-origin POST /api/cbm/chat/send was blocked with 403: {body}")
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertIn(allow_origin, (external_origin, "*"))

    def test_first_party_origin_allowed_on_internal_endpoints(self):
        """
        Requests to internal endpoints from authorized first-party origin (e.g. cbm.wispbyte.org)
        succeed and are not blocked by Domain Origin Policy.
        """
        first_party = "https://cbm.wispbyte.org"
        status, hdrs, body = self._make_request(
            "OPTIONS",
            "/api/cbm/account",
            headers={
                "Origin": first_party,
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertEqual(status, 200)
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertEqual(allow_origin, first_party)

    def test_quick_quarantine_tunnel_allowed_on_internal_endpoints(self):
        """
        Requests to internal endpoints from Cloudflare Quick Quarantine Tunnels (*.trycloudflare.com)
        must succeed and not be blocked by Domain Origin Policy.
        """
        tunnel_origin = "https://seekers-underground-editorial-carlos.trycloudflare.com"

        # Preflight OPTIONS
        status, hdrs, body = self._make_request(
            "OPTIONS",
            "/api/cbm/account",
            headers={
                "Origin": tunnel_origin,
                "Access-Control-Request-Method": "GET",
            },
        )
        self.assertEqual(status, 200, f"Expected 200 for tunnel preflight, got {status}: {body}")
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertEqual(allow_origin, tunnel_origin)

        # GET request with tunnel Origin
        status, hdrs, body = self._make_request(
            "GET",
            "/api/cbm/account?name=Alice",
            headers={"Origin": tunnel_origin},
        )
        self.assertNotEqual(status, 403, f"Quick quarantine tunnel was blocked by 403: {body}")
        allow_origin = hdrs.get("Access-Control-Allow-Origin") or hdrs.get("access-control-allow-origin")
        self.assertEqual(allow_origin, tunnel_origin)


if __name__ == "__main__":
    unittest.main()

