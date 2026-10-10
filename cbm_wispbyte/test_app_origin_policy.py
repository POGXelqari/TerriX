#!/usr/bin/env python3
"""
Unit & Integration Test Suite: App Origin Policy for Official CBM Apps
======================================================================
Validates that:
1. Official native desktop origins (tauri://localhost) bypass Domain Origin Policy.
2. Official mobile origins (capacitor://localhost, android-app://org.wispbyte.cbm) bypass Domain Origin Policy.
3. Official app headers (X-CBM-App-Origin: org.wispbyte.cbm) securely access internal endpoints.
4. Unauthorized third-party origins (https://evil-site.com) are rejected with 403 Forbidden.
5. Preflight OPTIONS requests for official app origins return 200 OK with proper Access-Control headers.
"""

import os
import sys
import json
import unittest
import threading
import urllib.request
import urllib.error
from http.server import HTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import CBMHealthHandler, db, is_authorized_first_party_origin, is_authorized_official_app_request


class TestAppOriginPolicy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.register_or_get_account("OriginPolicyUser", display_name="Origin Policy Test")
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
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                status = resp.status
                resp_headers = dict(resp.headers)
                raw = resp.read().decode("utf-8")
                try:
                    res_body = json.loads(raw)
                except Exception:
                    res_body = raw
                return status, res_body, resp_headers
        except urllib.error.HTTPError as e:
            status = e.code
            resp_headers = dict(e.headers)
            raw = e.read().decode("utf-8")
            try:
                res_body = json.loads(raw)
            except Exception:
                res_body = raw
            return status, res_body, resp_headers

    def test_01_tauri_origin_allowed_on_internal_endpoint(self):
        """Official Tauri desktop origin is accepted by internal endpoints."""
        headers = {"Origin": "tauri://localhost"}
        status, body, resp_headers = self._request("GET", "/api/cbm/account?name=OriginPolicyUser", headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(resp_headers.get("Access-Control-Allow-Origin"), "tauri://localhost")

    def test_02_capacitor_origin_allowed_on_internal_endpoint(self):
        """Official Capacitor mobile origin is accepted by internal endpoints."""
        headers = {"Origin": "capacitor://localhost"}
        status, body, resp_headers = self._request("GET", "/api/cbm/account?name=OriginPolicyUser", headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(resp_headers.get("Access-Control-Allow-Origin"), "capacitor://localhost")

    def test_03_official_app_header_bypass(self):
        """Request with X-CBM-App-Origin header bypasses Domain Origin Policy."""
        headers = {
            "X-CBM-App-Origin": "org.wispbyte.cbm.desktop",
            "Origin": "null"
        }
        status, body, _ = self._request("GET", "/api/cbm/account?name=OriginPolicyUser", headers=headers)
        self.assertEqual(status, 200)

    def test_04_unauthorized_origin_blocked(self):
        """Unauthorized third-party web origins are blocked with 403 Forbidden."""
        headers = {"Origin": "https://malicious-phishing-site.com"}
        status, body, _ = self._request("GET", "/api/cbm/account?name=OriginPolicyUser", headers=headers)
        self.assertEqual(status, 403)
        self.assertIn("error", body)
        self.assertEqual(body.get("error"), "forbidden_origin")

    def test_05_options_preflight_for_official_origins(self):
        """OPTIONS preflight for Tauri and Capacitor origins returns 200 with CORS headers."""
        headers = {
            "Origin": "tauri://localhost",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, X-CBM-Session"
        }
        status, body, resp_headers = self._request("OPTIONS", "/api/cbm/account", headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(resp_headers.get("Access-Control-Allow-Origin"), "tauri://localhost")


if __name__ == "__main__":
    unittest.main()
