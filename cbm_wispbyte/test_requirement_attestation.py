#!/usr/bin/env python3
"""
Test Suite for CBM Requirement-Agnostic Client Attestation & Free Cosmetic Verification
Validates:
1. Database schema, attestation leases, and active TTL tracking
2. Zero-gold product creation rules (requires_client_verification enforcement)
3. Dynamic ownership queries including active attestations
4. REST API verify-requirement & ownership responses over HTTP
5. Client bundle build artifacts and pattern asset delivery
"""

import os
import sys
import time
import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db_layer import CBMDatabase
from main import CBMHealthHandler, db

OFFICIAL_TOKEN = "cbm_live_2063e984d4e66cbd90cc1fcc33e54a1199d5a978"


class TestRequirementAttestation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db = db
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
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.status
                raw = response.read().decode("utf-8")
                return status, json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                parsed = json.loads(raw)
            except Exception:
                parsed = {"raw": raw}
            return e.code, parsed

    def test_01_schema_and_kilr_seeding(self):
        """Validates that prod_kilr is seeded as a free client-verified product."""
        prod = self.db.get_product("prod_kilr")
        self.assertIsNotNone(prod, "prod_kilr must exist in cbm_products.")
        self.assertEqual(prod.get("price_gold"), 0.0, "prod_kilr price must be 0.0 Gold.")
        self.assertTrue(prod.get("requires_client_verification"), "prod_kilr must require client verification.")
        self.assertEqual(prod.get("status"), "ACTIVE")
        self.assertTrue(prod.get("is_free"))

    def test_02_zero_gold_product_validation(self):
        """Ensures 0-gold products require requires_client_verification flag."""
        # 1. Zero gold with client verification flag = True -> Allowed
        ok, prod_data = self.db.create_product(
            owner_account="B8bbq",
            name="Test Free Verified Product",
            description="Testing free client verified product.",
            image_url="/assets/patterns/test.png",
            price_gold=0.0,
            callback_url="",
            webhook_url="",
            requires_client_verification=True,
            requirement_meta={"clan": "TEST"}
        )
        self.assertTrue(ok, f"Creating free verified product should succeed: {prod_data}")
        test_pid = prod_data["product_id"]

        # Clean up
        self.db.archive_product(test_pid, "B8bbq")

        # 2. Zero gold WITHOUT client verification flag -> Rejected
        fail_ok, err_msg = self.db.create_product(
            owner_account="B8bbq",
            name="Test Free Unverified Product",
            description="Should fail without verification flag.",
            image_url="/assets/patterns/test.png",
            price_gold=0.0,
            callback_url="",
            webhook_url="",
            requires_client_verification=False
        )
        self.assertFalse(fail_ok, "Zero-gold product without client verification must be rejected.")
        self.assertIn("client verification", err_msg.lower())


    def test_03_attestation_lease_lifecycle(self):
        """Tests creation, renewal, active lookup, and TTL calculation of attestations."""
        test_account = "UnitTester [KILR]"

        # Create 10-minute attestation lease
        ok, msg, record = self.db.create_or_renew_attestation(
            product_id="prod_kilr",
            account=test_account,
            client_id="terrix_client_test",
            payload={"clan": "KILR", "rank": "Member"},
            ttl_seconds=600.0
        )
        self.assertTrue(ok, f"Attestation creation failed: {msg}")
        self.assertIn("tok_attest_prod_kilr_", record["attestation_token"])
        self.assertEqual(record["ttl"], 600)

        # Lookup active attestation
        active = self.db.get_active_attestation("prod_kilr", test_account)
        self.assertIsNotNone(active, "Active attestation must be retrievable.")
        self.assertEqual(active["product_id"], "prod_kilr")
        self.assertEqual(active["account"], test_account)
        self.assertEqual(active["attestation_payload"].get("clan"), "KILR")
        self.assertGreater(active["ttl_remaining"], 500)

        # Verify account ownership includes prod_kilr
        owned = self.db.get_account_owned_products(test_account)
        self.assertIn("prod_kilr", owned, "Account with active attestation must own prod_kilr.")

        # Verify receipt lookup returns attestation metadata
        receipt = self.db.get_product_receipt_for_account(test_account, "prod_kilr")
        self.assertIsNotNone(receipt)
        self.assertTrue(receipt.get("is_attestation"))
        self.assertEqual(receipt.get("verification_token"), record["attestation_token"])

    def test_04_attestation_expiration(self):
        """Verifies that expired attestations are ignored."""
        expired_acc = "ExpiredPlayer [KILR]"

        # Insert directly into DB with past expiration
        conn = self.db.get_write_connection()
        cur = conn.cursor()
        now = time.time()
        past = now - 3600
        cur.execute("""
            INSERT OR REPLACE INTO cbm_product_attestations (
                product_id, account_name, client_id, attestation_token,
                attestation_payload, verified_at, expires_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("prod_kilr", expired_acc, "terrix_client", "tok_expired_123", "{}", past, past, past))
        conn.commit()
        conn.close()

        # get_active_attestation should return None
        active = self.db.get_active_attestation("prod_kilr", expired_acc)
        self.assertIsNone(active, "Expired attestation must not be active.")

        # get_account_owned_products should not list prod_kilr for this account
        owned = self.db.get_account_owned_products(expired_acc)
        self.assertNotIn("prod_kilr", owned, "Expired attestation must not grant ownership.")

    def test_05_client_bundle_artifacts(self):
        """Verifies that client source and bundle contain KILR pattern logic and assets."""
        # 1. Verify src/terrixCosmetics.js contains source functions
        src_path = os.path.join(os.path.dirname(__file__), "..", "src", "terrixCosmetics.js")
        self.assertTrue(os.path.exists(src_path), f"Source file missing: {src_path}")
        with open(src_path, "r", encoding="utf-8") as f:
            src_code = f.read()
        self.assertIn("hasKilrClanTag", src_code, "Source must implement hasKilrClanTag.")
        self.assertIn("updateKilrUI", src_code, "Source must implement updateKilrUI.")
        self.assertIn("PRODUCT_ID_KILR", src_code, "Source must declare PRODUCT_ID_KILR.")

        # 2. Verify compiled bundle in client/fx.bundle.js
        bundle_path = os.path.join(os.path.dirname(__file__), "..", "client", "fx.bundle.js")
        self.assertTrue(os.path.exists(bundle_path), f"Bundle not found at {bundle_path}")
        with open(bundle_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        self.assertIn("prod_kilr", content, "Bundle must contain prod_kilr identifier.")
        self.assertIn("[KILR]", content, "Bundle must contain [KILR] clan tag match.")
        self.assertIn("tx-kilr-card", content, "Bundle must contain tx-kilr-card UI element.")
        self.assertIn("kilr-clanlogo-pattern.png", content, "Bundle must reference kilr pattern asset.")

        # 3. Verify pattern image asset in client/assets/patterns/
        asset_path = os.path.join(os.path.dirname(__file__), "..", "client", "assets", "patterns", "kilr-clanlogo-pattern.png")
        self.assertTrue(os.path.exists(asset_path), f"Pattern asset missing at {asset_path}")
        self.assertGreater(os.path.getsize(asset_path), 50000, "Pattern image must be valid high-res PNG.")

    def test_06_http_verify_requirement_endpoint(self):
        """Tests POST /api/v1/products/prod_kilr/verify-requirement over HTTP."""
        acc = "LivePlayer [KILR]"

        # 1. Unverified requirement attempt -> 403 Forbidden
        status_unverified, res_unverified = self._request(
            "POST",
            "/api/v1/products/prod_kilr/verify-requirement",
            headers={"X-CBM-API-Key": OFFICIAL_TOKEN},
            body={
                "account": acc,
                "client_verified": False,
                "client_id": "terrix_client"
            }
        )
        self.assertEqual(status_unverified, 403, f"Expected 403 for unverified requirement: {res_unverified}")
        self.assertFalse(res_unverified.get("verified"))

        # 2. Verified requirement attempt with client_verified: True -> 200 OK
        status_ok, res_ok = self._request(
            "POST",
            "/api/v1/products/prod_kilr/verify-requirement",
            headers={"X-CBM-API-Key": OFFICIAL_TOKEN},
            body={
                "account": acc,
                "client_verified": True,
                "client_id": "terrix_client",
                "ttl_seconds": 1800,
                "payload": {"clan": "KILR"}
            }
        )
        self.assertEqual(status_ok, 200, f"Expected 200 for valid attestation: {res_ok}")
        self.assertTrue(res_ok.get("verified"))
        self.assertEqual(res_ok.get("product_id"), "prod_kilr")
        self.assertIn("tok_attest_prod_kilr_", res_ok.get("attestation_token", ""))

        # 3. Verify GET /api/v1/products/ownership reflects the attestation lease
        status_own, res_own = self._request(
            "GET",
            f"/api/v1/products/ownership?account={urllib.parse.quote(acc)}",
            headers={"X-CBM-API-Key": OFFICIAL_TOKEN}
        )
        self.assertEqual(status_own, 200)
        self.assertTrue(res_own.get("has_kilr"), "Ownership response must report has_kilr = True")
        self.assertIn("prod_kilr", res_own.get("owned_products", []))
        self.assertIsNotNone(res_own.get("receipt_kilr"))
        self.assertTrue(res_own["receipt_kilr"].get("is_attestation"))


if __name__ == "__main__":
    unittest.main()
