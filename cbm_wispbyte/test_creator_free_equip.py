#!/usr/bin/env python3
"""
Test Suite: CBM Pattern Product Creator Free Equip & Entitlements
================================================================
Validates that CBM users who create pattern products:
1. Have free, permanent ownership of their created products.
2. Obtain valid creator receipts with is_creator=True.
3. Successfully pass cryptographic token verification at /api/v1/products/verify.
4. Are recognized across both /api/cbm/products/ownership and /api/v1/products/ownership.
5. Work seamlessly via canonical CBM usernames and linked in-game aliases.
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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import CBMHealthHandler, db

OFFICIAL_TOKEN = "cbm_live_2063e984d4e66cbd90cc1fcc33e54a1199d5a978"


class TestCreatorFreeEquip(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Register test merchant accounts
        db.register_or_get_account("B8bbq", display_name="B8bbq Founder")
        db.register_or_get_account("CreatorAlice", display_name="Alice Designer")
        # Link in-game handle for Alice
        db.link_payment_method("CreatorAlice", "AliceInGame", "pwd123", display_name="AliceInGame")

        # Create a new pattern product for CreatorAlice
        ok, res = db.create_product(
            owner_account="CreatorAlice",
            name="Alice Starfield Territory Pattern",
            description="Luminescent stars overlaying territory.",
            price_gold=250.0,
            image_url="/assets/patterns/starfield.png"
        )
        assert ok, f"Failed to create product for CreatorAlice: {res}"
        cls.alice_product_id = res["product_id"]

        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

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
        except urllib.error.HTTPError as e:
            resp_body = json.loads(e.read().decode("utf-8"))
            return e.code, resp_body

    def test_01_canonical_creator_b8bbq_owns_products(self):
        """B8bbq automatically owns prod_hellokitty and prod_poland for free."""
        owned = db.get_account_owned_products("B8bbq")
        self.assertIn("prod_hellokitty", owned)
        self.assertIn("prod_poland", owned)

        receipt_hk = db.get_product_receipt_for_account("B8bbq", "prod_hellokitty")
        self.assertIsNotNone(receipt_hk)
        self.assertTrue(receipt_hk.get("is_creator"))
        self.assertTrue(receipt_hk.get("order_id").startswith("ord_creator_"))

        receipt_poland = db.get_product_receipt_for_account("B8bbq", "prod_poland")
        self.assertIsNotNone(receipt_poland)
        self.assertTrue(receipt_poland.get("is_creator"))
        self.assertTrue(receipt_poland.get("order_id").startswith("ord_creator_"))

    def test_02_new_creator_alice_immediately_owns_created_pattern(self):
        """A new creator immediately owns their pattern without purchasing it."""
        owned = db.get_account_owned_products("CreatorAlice")
        self.assertIn(self.alice_product_id, owned)

        receipt = db.get_product_receipt_for_account("CreatorAlice", self.alice_product_id)
        self.assertIsNotNone(receipt)
        self.assertTrue(receipt.get("is_creator"))
        self.assertEqual(receipt.get("order_id"), f"ord_creator_{self.alice_product_id}")

    def test_03_creator_token_verification(self):
        """Cryptographic token verification succeeds for creator entitlements."""
        receipt = db.get_product_receipt_for_account("CreatorAlice", self.alice_product_id)
        self.assertIsNotNone(receipt)

        valid, order_dict = db.verify_product_order_token(
            receipt["verification_token"], receipt["order_id"]
        )
        self.assertTrue(valid)
        self.assertEqual(order_dict.get("status"), "FULFILLED")
        self.assertEqual(order_dict.get("price_gold"), 0.0)
        self.assertTrue(order_dict.get("is_creator"))

    def test_04_alias_resolution_for_in_game_account(self):
        """In-game linked handle AliceInGame resolves creator products."""
        owned = db.get_account_owned_products("AliceInGame")
        self.assertIn(self.alice_product_id, owned)

        receipt = db.get_product_receipt_for_account("AliceInGame", self.alice_product_id)
        self.assertIsNotNone(receipt)
        self.assertTrue(receipt.get("is_creator"))

    def test_05_cbm_ownership_http_endpoint(self):
        """GET /api/cbm/products/ownership returns is_creator and created_products."""
        status, body = self._request("GET", "/api/cbm/products/ownership?account=B8bbq")
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        self.assertTrue(body.get("is_creator"))
        self.assertTrue(body.get("has_hello_kitty"))
        self.assertTrue(body.get("has_poland"))
        self.assertIn("prod_hellokitty", body.get("owned_products", []))
        self.assertIn("prod_poland", body.get("owned_products", []))
        self.assertTrue(body.get("receipt", {}).get("is_creator"))
        self.assertTrue(body.get("receipt_poland", {}).get("is_creator"))

    def test_06_api_v1_ownership_and_verify_endpoints(self):
        """GET /api/v1/products/ownership and POST /api/v1/products/verify with creator token."""
        headers = {"Authorization": f"Bearer {OFFICIAL_TOKEN}"}
        status, body = self._request("GET", f"/api/v1/products/ownership?account=CreatorAlice", headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "ok")
        self.assertTrue(body.get("is_creator"))
        self.assertIn(self.alice_product_id, body.get("owned_products", []))
        self.assertIn(self.alice_product_id, body.get("created_products", []))

        # Verify token via HTTP API
        alice_receipt = db.get_product_receipt_for_account("CreatorAlice", self.alice_product_id)
        verify_status, verify_body = self._request("POST", "/api/v1/products/verify", headers=headers, body={
            "order_id": alice_receipt["order_id"],
            "token": alice_receipt["verification_token"]
        })
        self.assertEqual(verify_status, 200)
        self.assertTrue(verify_body.get("valid"))
        self.assertTrue(verify_body.get("order", {}).get("is_creator"))
        self.assertEqual(verify_body.get("order", {}).get("price_gold"), 0.0)

    def test_07_unowned_product_remains_unowned_for_non_creator(self):
        """An account that is not the creator and hasn't purchased has no entitlement."""
        owned = db.get_account_owned_products("NonCreatorUser999")
        self.assertNotIn("prod_hellokitty", owned)
        self.assertNotIn("prod_poland", owned)
        self.assertNotIn(self.alice_product_id, owned)

        receipt = db.get_product_receipt_for_account("NonCreatorUser999", self.alice_product_id)
        self.assertIsNone(receipt)


if __name__ == "__main__":
    unittest.main()
