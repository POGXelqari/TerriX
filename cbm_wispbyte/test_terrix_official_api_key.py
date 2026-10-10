#!/usr/bin/env python3
"""
Test Suite: TerriX Official Client API Key Authorization
=========================================================
Validates the authoritative seeding, verification, and end-to-end HTTP
authorization of the "TerriX Official Client" API Key across:
1. Authoritative DB layer verification and scope checks
2. POST /api/cbm/chat/send (Bearer token and X-CBM-API-Key)
3. POST /api/cbm/chat/check (Pre-flight validation with client auth)
4. GET /api/cbm/chat/messages (Client polling telemetry)
5. Developer REST API endpoints (GET /api/v1/products/ownership, POST /api/v1/products/order/create)
6. Rejection of invalid, unseeded, or malformed API tokens
"""

import os
import sys
import json
import time
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer

# Ensure cbm_wispbyte is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from chat_engine import chat_engine, verdict_cache
from main import CBMHealthHandler, db


OFFICIAL_TOKEN = "cbm_live_2063e984d4e66cbd90cc1fcc33e54a1199d5a978"


class TestTerriXOfficialClientKey(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure B8bbq owner account exists with sufficient credits
        db.register_or_get_account("B8bbq", display_name="B8bbq Clan Founder")
        db.credit_deposit("B8bbq", 10000, "tx_seed_b8bbq_official")
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        verdict_cache.clear()

    def tearDown(self):
        verdict_cache.clear()
        chat_engine.end_room("auth_key_test_room")

    def _request(self, method: str, path: str, headers: dict = None, body: dict = None) -> tuple:
        url = f"http://127.0.0.1:{self.port}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Accept", "application/json")
        if body is not None:
            req.add_header("Content-Type", "application/json")
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                resp_body = json.loads(resp.read().decode("utf-8"))
                return resp.status, resp_body
        except urllib.error.HTTPError as err:
            try:
                resp_body = json.loads(err.read().decode("utf-8"))
            except Exception:
                resp_body = {"raw": "non_json"}
            return err.code, resp_body

    def test_01_db_layer_verify_official_key(self):
        """Verifies TerriX Official Client token in db_layer is active and has full scopes."""
        is_valid, record = db.verify_api_key(OFFICIAL_TOKEN)
        self.assertTrue(is_valid, "TerriX Official Client key must be valid")
        self.assertEqual(record.get("app_name"), "TerriX Official Client")
        self.assertEqual(record.get("owner_account"), "B8bbq")
        self.assertEqual(record.get("environment"), "live")
        self.assertEqual(record.get("is_active"), 1)
        scopes = [s.strip() for s in record.get("scopes", "").split(",")]
        self.assertIn("read:products", scopes)
        self.assertIn("write:products", scopes)
        self.assertIn("admin", scopes)

    def test_02_chat_send_authorized_via_bearer_token(self):
        """POST /api/cbm/chat/send with Authorization: Bearer <token> establishes TERRITORIAL_OFFICIAL_CLIENT."""
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status, body = self._request("POST", "/api/cbm/chat/send", headers=headers, body={
            "room_id": "auth_key_test_room",
            "sender_name": "TestPilot",
            "content": "Official client transmission :swords:"
        })
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        msg = body.get("message", {})
        self.assertEqual(msg.get("auth_type"), "TERRITORIAL_OFFICIAL_CLIENT")
        self.assertTrue(msg.get("is_cbm_verified"))
        self.assertEqual(msg.get("client_app"), "TerriX Official Client")

    def test_03_chat_send_authorized_via_x_cbm_api_key(self):
        """POST /api/cbm/chat/send with X-CBM-API-Key header authorizes message."""
        headers = {"X-CBM-API-Key": OFFICIAL_TOKEN}
        status, body = self._request("POST", "/api/cbm/chat/send", headers=headers, body={
            "room_id": "auth_key_test_room",
            "sender_name": "ShieldBearer",
            "content": "Defending eastern border :shield:"
        })
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        msg = body.get("message", {})
        self.assertEqual(msg.get("auth_type"), "TERRITORIAL_OFFICIAL_CLIENT")
        self.assertTrue(msg.get("is_cbm_verified"))

    def test_04_chat_check_preflight_with_official_key(self):
        """POST /api/cbm/chat/check returns client_authorized=True and client_app name."""
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status, body = self._request("POST", "/api/cbm/chat/check", headers=headers, body={
            "content": "Peace pact request :peace:"
        })
        self.assertEqual(status, 200)
        self.assertTrue(body.get("is_safe"))
        self.assertTrue(body.get("client_authorized"))
        self.assertEqual(body.get("client_app"), "TerriX Official Client")

    def test_05_chat_messages_polling_with_official_key(self):
        """GET /api/cbm/chat/messages returns client_authorized=True when official key is provided."""
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status, body = self._request("GET", "/api/cbm/chat/messages?room_id=auth_key_test_room", headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        self.assertTrue(body.get("client_authorized"))
        self.assertEqual(body.get("client_app"), "TerriX Official Client")

    def test_06_products_ownership_authorized(self):
        """GET /api/v1/products/ownership requires and succeeds with TerriX Official Client key."""
        # A. Without key -> 401 Unauthorized
        status_unauth, _ = self._request("GET", "/api/v1/products/ownership?account=B8bbq")
        self.assertEqual(status_unauth, 401)

        # B. With Official Key -> 200 OK
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status_auth, body_auth = self._request("GET", "/api/v1/products/ownership?account=B8bbq", headers=headers)
        self.assertEqual(status_auth, 200)
        self.assertEqual(body_auth.get("status"), "ok")
        self.assertIn("owned_products", body_auth)

    def test_07_products_order_create_authorized(self):
        """POST /api/v1/products/order/create requires and succeeds with TerriX Official Client key."""
        # A. Without key -> 401 Unauthorized
        status_unauth, _ = self._request("POST", "/api/v1/products/order/create", body={
            "product_id": "prod_hellokitty",
            "buyer_account_name": "B8bbq"
        })
        self.assertEqual(status_unauth, 401)

        # B. With Official Key -> 200 OK
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status_auth, body_auth = self._request("POST", "/api/v1/products/order/create", headers=headers, body={
            "product_id": "prod_hellokitty",
            "buyer_account_name": "B8bbq"
        })
        self.assertEqual(status_auth, 200)
        self.assertEqual(body_auth.get("status"), "ok")
        self.assertIn("order", body_auth)

    def test_08_invalid_api_key_rejection(self):
        """Rejects forged or invalid API tokens."""
        headers = {"Authorization": "Bearer cbm_live_forged_fake_token_12345"}
        is_valid, _ = db.verify_api_key("cbm_live_forged_fake_token_12345")
        self.assertFalse(is_valid)

        status, body = self._request("GET", "/api/v1/products/ownership?account=B8bbq", headers=headers)
        self.assertEqual(status, 401)

    def test_09_chat_endpoints_require_api_key(self):
        """Verifies all /api/cbm/chat/* endpoints strictly require a valid API key."""
        # 1. Unauthenticated requests return 401 Unauthorized
        status, body = self._request("GET", "/api/cbm/chat/messages?room_id=auth_key_test_room")
        self.assertEqual(status, 401)
        self.assertEqual(body.get("error"), "unauthorized")

        status, body = self._request("GET", "/api/cbm/chat/stickers")
        self.assertEqual(status, 401)
        self.assertEqual(body.get("error"), "unauthorized")

        status, body = self._request("POST", "/api/cbm/chat/send", body={"room_id": "auth_key_test_room", "content": "Hi"})
        self.assertEqual(status, 401)
        self.assertEqual(body.get("error"), "unauthorized")

        status, body = self._request("POST", "/api/cbm/chat/check", body={"content": "Hi"})
        self.assertEqual(status, 401)
        self.assertEqual(body.get("error"), "unauthorized")

        # 2. Forged key returns 401 invalid_key
        headers = {"X-CBM-API-Key": "cbm_live_forged_fake_token_12345"}
        status, body = self._request("GET", "/api/cbm/chat/messages?room_id=auth_key_test_room", headers=headers)
        self.assertEqual(status, 401)
        self.assertEqual(body.get("error"), "invalid_key")

        # 3. Query parameter api_key authorization succeeds
        status, body = self._request("GET", f"/api/cbm/chat/messages?room_id=auth_key_test_room&api_key={OFFICIAL_TOKEN}")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        self.assertTrue(body.get("client_authorized"))


if __name__ == "__main__":
    unittest.main()
