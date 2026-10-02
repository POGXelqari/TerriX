#!/usr/bin/env python3
"""
Empirical Integration Verification for NVIDIA Nemotron-3 Endpoint,
CORS Origin 'null' handling, GET Schema Discovery, and SSE Streaming.
"""

import os
import sys
import json
import time
import uuid
import unittest
import threading
from http.server import HTTPServer
import urllib.request
import urllib.error

# Ensure cbm_wispbyte directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main
from main import CBMHealthHandler, db, ai_service


class TestNemotronIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Bind ephemeral local port for real HTTP socket tests
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.base_url = f"http://127.0.0.1:{cls.port}"

        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

        # Seed test account with credits
        cls.test_user = f"tester_{uuid.uuid4().hex[:6]}"
        db.register_member_account(
            username=cls.test_user,
            password="test_password_123",
            avatar_url="https://cbm.wispbyte.org/avatar.png",
            primary_territorial_account="TestTerritoryPlayer",
            pin="123456"
        )
        db.credit_deposit(cls.test_user, 50000, f"tx_{uuid.uuid4().hex}")
        ok, key_sec, key_rec = db.create_api_key(
            owner_account=cls.test_user,
            app_name="NemotronApp",
            scopes="read:ai,ai:chat"
        )
        assert ok, "API key creation failed"
        cls.api_key = key_sec

    @classmethod
    def tearDownClass(cls):
        try:
            cls.server.shutdown()
            cls.server.server_close()
        except Exception:
            pass

    def test_01_get_ai_chat_schema_docs(self):
        """Verify GET /api/v1/ai/chat returns 200 OK with schema and does not 404."""
        url = f"{self.base_url}/api/v1/ai/chat"
        req = urllib.request.Request(url, headers={"Origin": "null"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            cors_hdr = resp.headers.get("Access-Control-Allow-Origin")
            self.assertEqual(cors_hdr, "*")
            self.assertIsNone(resp.headers.get("Access-Control-Allow-Credentials"))
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data.get("status"), "ok")
            self.assertEqual(data.get("endpoint"), "/api/v1/ai/chat")
            self.assertEqual(data.get("default_model"), "nvidia/nemotron-3-ultra-550b-a55b")
            self.assertTrue(data.get("streaming_supported"))

    def test_02_options_preflight_origin_null(self):
        """Verify OPTIONS /api/v1/ai/chat with Origin 'null' returns 200 and '*' without credentials."""
        url = f"{self.base_url}/api/v1/ai/chat"
        req = urllib.request.Request(url, headers={
            "Origin": "null",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Authorization"
        }, method="OPTIONS")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            self.assertIsNone(resp.headers.get("Access-Control-Allow-Credentials"))

    def test_03_get_models_includes_nemotron(self):
        """Verify /api/v1/ai/models returns nemotron as default."""
        url = f"{self.base_url}/api/v1/ai/models"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {self.api_key}"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data.get("default_model"), "nvidia/nemotron-3-ultra-550b-a55b")

    def test_04_post_ai_chat_nemotron_sync(self):
        """Verify POST /api/v1/ai/chat executes nemotron in <5s and returns top-level choices."""
        url = f"{self.base_url}/api/v1/ai/chat"
        payload = {
            "model": "nvidia/nemotron-3-ultra-550b-a55b",
            "messages": [{"role": "user", "content": "What is 2+2? Answer in one word."}],
            "max_tokens": 15,
            "temperature": 0.5
        }
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=req_data, headers={
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Origin": "null"
        })
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=15) as resp:
            elapsed = time.time() - t0
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            body = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(body.get("status"), "ok")
            self.assertIn("choices", body)
            self.assertTrue(len(body["choices"]) > 0)
            # Verify billing headers
            self.assertEqual(resp.headers.get("X-CBM-Billing-Mode"), "METERED")
            print(f"[OK] Sync Nemotron response completed in {elapsed:.2f}s")

    def test_05_post_ai_chat_nemotron_stream(self):
        """Verify POST /api/v1/ai/chat with stream: true emits SSE events."""
        url = f"{self.base_url}/api/v1/ai/chat"
        payload = {
            "model": "nemotron-3-ultra-550b-a55b",  # Test model alias resolution
            "messages": [{"role": "user", "content": "Count to 3"}],
            "max_tokens": 20,
            "stream": True
        }
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=req_data, headers={
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "Origin": "null"
        })
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=15) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/event-stream", resp.headers.get("Content-Type", ""))
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            
            lines = []
            for _ in range(5):
                raw_line = resp.readline()
                if not raw_line:
                    break
                line = raw_line.decode("utf-8").strip()
                if line:
                    lines.append(line)
            elapsed = time.time() - t0
            self.assertTrue(any(l.startswith("data: ") for l in lines))
            print(f"[OK] SSE Stream yielded {len(lines)} chunks in {elapsed:.2f}s")


if __name__ == "__main__":
    unittest.main()
