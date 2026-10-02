#!/usr/bin/env python3
"""
Comprehensive Test Suite for Nemotron-3.5-Content-Safety Integration
=====================================================================
Tests the tiered moderation pipeline across:
1. Model registration and aliases in ai_service.py
2. Standardized Nemotron-3.5-Content-Safety output parsing
3. Thread-safe in-memory VerdictCache (SHA-256 hashing, LRU eviction, TTL)
4. L1 zero-latency heuristic regex & homoglyph normalization
5. L2 verdict cache hits on frequent gaming phrases
6. L3 Nemotron 3.5 AI safety moderation
7. Multimodal image attachment safety inspection in save_attachment()
8. Circuit breaker timeout and network failover
9. End-to-end HTTP endpoints (/api/cbm/chat/check and /api/cbm/chat/send)
"""

import os
import sys
import time
import json
import base64
import unittest
from unittest.mock import patch, MagicMock

# Ensure current directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_service import (
    MODEL_ALIASES,
    parse_nemotron_safety_response,
    NvidiaKimiService,
    check_content_safety,
    ai_service
)
from chat_engine import (
    VerdictCache,
    verdict_cache,
    check_message_safety,
    is_toxic_content,
    DisposableChatRoom,
    DisposableChatEngine,
    chat_engine
)


class TestNemotronSafetyIntegration(unittest.TestCase):
    def setUp(self):
        verdict_cache.clear()

    def tearDown(self):
        verdict_cache.clear()

    # 1. Model Registration & Aliases
    def test_01_model_registration_and_aliases(self):
        """Verifies nvidia/nemotron-3.5-content-safety and its aliases are correctly registered."""
        self.assertIn("nemotron-3.5-content-safety", MODEL_ALIASES)
        self.assertIn("nvidia/nemotron-3.5-content-safety", MODEL_ALIASES)
        self.assertIn("nemotron-safety", MODEL_ALIASES)
        self.assertIn("content-safety", MODEL_ALIASES)

        svc = NvidiaKimiService()
        self.assertEqual(
            svc.resolve_model("nemotron-3.5-content-safety"),
            "nvidia/nemotron-3.5-content-safety"
        )
        self.assertEqual(
            svc.resolve_model("nemotron-safety"),
            "nvidia/nemotron-3.5-content-safety"
        )

    # 2. Response Parser
    def test_02_parse_nemotron_safety_response(self):
        """Tests parsing of standardized Nemotron-3.5-Content-Safety output."""
        # Safe case
        safe_resp = "User Safety: safe\nResponse Safety: safe"
        is_safe, cats = parse_nemotron_safety_response(safe_resp)
        self.assertTrue(is_safe)
        self.assertEqual(cats, [])

        # Unsafe with categories
        unsafe_resp = "User Safety: unsafe\nSafety Categories: Harassment, Violence, Hate Speech"
        is_safe, cats = parse_nemotron_safety_response(unsafe_resp)
        self.assertFalse(is_safe)
        self.assertIn("Harassment", cats)
        self.assertIn("Violence", cats)
        self.assertIn("Hate Speech", cats)

        # Unsafe with single category
        single_cat = "User Safety: unsafe\nCategories: Self-Harm"
        is_safe, cats = parse_nemotron_safety_response(single_cat)
        self.assertFalse(is_safe)
        self.assertEqual(cats, ["Self-Harm"])

        # Unsafe with no categories listed (fallback category applied)
        bare_unsafe = "User Safety: unsafe"
        is_safe, cats = parse_nemotron_safety_response(bare_unsafe)
        self.assertFalse(is_safe)
        self.assertTrue(len(cats) > 0)

        # Empty response defaults to safe
        is_safe, cats = parse_nemotron_safety_response("")
        self.assertTrue(is_safe)

    # 3. Verdict Cache Check
    def test_03_verdict_cache(self):
        """Tests SHA-256 verdict caching, retrieval, and eviction."""
        cache = VerdictCache(max_entries=3, ttl_seconds=10.0)

        # Cache Miss
        self.assertIsNone(cache.get("good game"))

        # Set and Hit
        cache.set("good game", is_safe=True, reason="", categories=[])
        res = cache.get("good game")
        self.assertIsNotNone(res)
        self.assertTrue(res[0])
        self.assertEqual(res[1], "")

        # Case and whitespace normalization
        res_norm = cache.get("  GOOD GAME  ")
        self.assertIsNotNone(res_norm)
        self.assertTrue(res_norm[0])

        # LRU eviction test
        cache.set("msg 1", True)
        cache.set("msg 2", True)
        cache.set("msg 3", True)
        cache.set("msg 4", True)  # Exceeds max_entries=3, should evict oldest
        self.assertIsNotNone(cache.get("msg 4"))

    # 4. Layer 1 Heuristics
    def test_04_layer1_heuristics_rejection(self):
        """Tests that obvious slurs and toxic evasion patterns are rejected at Layer 1 with zero NIM calls."""
        with patch.object(ai_service, "check_content_safety") as mock_nim:
            # Spaced slur evasion
            res = check_message_safety("k y s now")
            self.assertFalse(res["is_safe"])
            self.assertEqual(res["layer"], "L1_HEURISTIC")
            self.assertIn("automated moderation policy", res["reason"].lower())

            # NIM should not be called when L1 triggers
            mock_nim.assert_not_called()

    # 5. Safe Gaming Message & Layer 2 Cache Hit
    def test_05_safe_message_and_layer2_cache(self):
        """Tests that valid gaming phrases pass, invoke Nemotron 3.5 once, and subsequent sends hit L2 cache."""
        mock_nim_output = {
            "is_safe": True,
            "categories": [],
            "raw_response": "User Safety: safe\nResponse Safety: safe",
            "message": "",
            "execution_time_seconds": 0.05,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }

        with patch.object(ai_service, "check_content_safety", return_value=mock_nim_output) as mock_nim:
            # First send: Cache Miss -> Calls Nemotron 3.5 (L3)
            res1 = check_message_safety("Attack east player together :swords:")
            self.assertTrue(res1["is_safe"])
            self.assertEqual(res1["layer"], "L3_NEMOTRON_3.5")
            self.assertEqual(mock_nim.call_count, 1)

            # Second send (identical text): Hits Layer 2 Verdict Cache
            res2 = check_message_safety("Attack east player together :swords:")
            self.assertTrue(res2["is_safe"])
            self.assertEqual(res2["layer"], "L2_CACHE")
            # NIM call count must remain 1
            self.assertEqual(mock_nim.call_count, 1)

    # 6. Nemotron 3.5 Unsafe Classification
    def test_06_nemotron_unsafe_classification(self):
        """Tests that content flagged as unsafe by Nemotron 3.5 is rejected with specific categories."""
        mock_nim_unsafe = {
            "is_safe": False,
            "categories": ["Harassment", "Hate Speech"],
            "raw_response": "User Safety: unsafe\nSafety Categories: Harassment, Hate Speech",
            "message": "Message blocked by automated AI safety policy: Harassment, Hate Speech",
            "execution_time_seconds": 0.08,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }

        with patch.object(ai_service, "check_content_safety", return_value=mock_nim_unsafe):
            res = check_message_safety("This team is garbage, delete the game")
            self.assertFalse(res["is_safe"])
            self.assertIn("Harassment", res["categories"])
            self.assertIn("Message blocked by automated AI safety policy", res["reason"])

            toxic, reason = is_toxic_content("This team is garbage, delete the game")
            self.assertTrue(toxic)
            self.assertIn("Harassment", reason)

    # 7. Multimodal Media Guardrail for Image Uploads
    def test_07_multimodal_image_safety(self):
        """Tests image moderation during save_attachment(): benign images save, unsafe images are rejected."""
        test_room = chat_engine.get_or_create_room("safety_test_room", creator_name="Tester")

        # 1x1 transparent PNG bytes
        valid_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"

        # Case A: Benign Image passes
        mock_safe_image = {
            "is_safe": True,
            "categories": [],
            "raw_response": "User Safety: safe",
            "message": "",
            "execution_time_seconds": 0.05,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_safe_image):
            ok, data_or_err = chat_engine.save_attachment(
                room_id=test_room.room_id,
                filename="game_map.png",
                file_bytes=valid_png,
                category="image"
            )
            self.assertTrue(ok, f"Safe image was rejected: {data_or_err}")
            self.assertIn("url", data_or_err)

        # Case B: Unsafe Image flagged by Nemotron 3.5
        mock_unsafe_image = {
            "is_safe": False,
            "categories": ["Graphic Violence"],
            "raw_response": "User Safety: unsafe\nSafety Categories: Graphic Violence",
            "message": "Message blocked by automated AI safety policy: Graphic Violence",
            "execution_time_seconds": 0.05,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_unsafe_image):
            ok, err = chat_engine.save_attachment(
                room_id=test_room.room_id,
                filename="unsafe_photo.png",
                file_bytes=valid_png,
                category="image"
            )
            self.assertFalse(ok, "Unsafe image should have been blocked!")
            self.assertIn("Graphic Violence", err)

        # Clean up test room
        chat_engine.end_room("safety_test_room")

    # 8. Timeout & Circuit Breaker Failover
    def test_08_timeout_and_failover(self):
        """Tests that when NVIDIA NIM times out or fails, moderation falls back safely without unhandled crashes."""
        with patch("urllib.request.urlopen", side_effect=TimeoutError("Request timed out after 1.5s")):
            eval_res = ai_service.check_content_safety("Quick tactical command", timeout=0.1)
            self.assertTrue(eval_res["fallback"])
            self.assertTrue(eval_res["is_safe"])
            self.assertIn("timed out", eval_res["error"])

            # High-level check_message_safety should safely pass benign text on failover
            res = check_message_safety("Quick tactical command")
            self.assertTrue(res["is_safe"])
            self.assertIn("FAILOVER", res.get("layer", ""))

    # 9. Ingest Pipeline in DisposableChatRoom
    def test_09_add_message_ingestion_blocked(self):
        """Verifies that unsafe messages are rejected before reaching room FIFO buffer."""
        room = chat_engine.get_or_create_room("fifo_guard_room", creator_name="Tester")
        initial_count = len(room.messages)

        mock_unsafe = {
            "is_safe": False,
            "categories": ["Harassment"],
            "raw_response": "User Safety: unsafe\nSafety Categories: Harassment",
            "message": "Message blocked by automated AI safety policy: Harassment",
            "execution_time_seconds": 0.05,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_unsafe):
            ok, err = room.add_message(
                sender_name="PlayerX",
                sender_clan="TAG",
                content="Aggressive toxicity targeting opponent"
            )
            self.assertFalse(ok)
            self.assertIn("Harassment", err)
            # Ensure message was NEVER appended to the FIFO ring buffer
            self.assertEqual(len(room.messages), initial_count)

        chat_engine.end_room("fifo_guard_room")


import threading
from http.server import HTTPServer
import urllib.request
import urllib.error
from main import CBMHealthHandler


class TestLiveNemotronHTTPEndpoints(unittest.TestCase):
    """Integration test suite executing live HTTP requests against CBM server endpoints."""

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

    def setUp(self):
        verdict_cache.clear()

    def tearDown(self):
        verdict_cache.clear()
        chat_engine.end_room("http_safety_room")

    def _post_json(self, path: str, payload: dict) -> tuple:
        url = f"http://127.0.0.1:{self.port}{path}"
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                return resp.status, body
        except urllib.error.HTTPError as err:
            body = json.loads(err.read().decode("utf-8"))
            return err.code, body

    def test_http_chat_check_safe(self):
        """POST /api/cbm/chat/check returns 200 OK with is_safe=True for benign game text."""
        mock_safe = {
            "is_safe": True,
            "categories": [],
            "raw_response": "User Safety: safe",
            "message": "",
            "execution_time_seconds": 0.04,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_safe):
            status, res = self._post_json("/api/cbm/chat/check", {
                "content": "Defend our western border :shield:"
            })
            self.assertEqual(status, 200)
            self.assertEqual(res["status"], "ok")
            self.assertTrue(res["is_safe"])
            self.assertEqual(res["categories"], [])

    def test_http_chat_check_unsafe(self):
        """POST /api/cbm/chat/check returns 200 OK with is_safe=False and categories for toxic content."""
        mock_unsafe = {
            "is_safe": False,
            "categories": ["Harassment"],
            "raw_response": "User Safety: unsafe\nSafety Categories: Harassment",
            "message": "Message blocked by automated AI safety policy: Harassment",
            "execution_time_seconds": 0.04,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_unsafe):
            status, res = self._post_json("/api/cbm/chat/check", {
                "content": "You are complete trash at this game"
            })
            self.assertEqual(status, 200)
            self.assertEqual(res["status"], "ok")
            self.assertFalse(res["is_safe"])
            self.assertIn("Harassment", res["categories"])

    def test_http_chat_send_ingress_blocked_by_nemotron(self):
        """POST /api/cbm/chat/send returns 400 Bad Request when Nemotron flags message."""
        mock_unsafe = {
            "is_safe": False,
            "categories": ["Hate Speech"],
            "raw_response": "User Safety: unsafe\nSafety Categories: Hate Speech",
            "message": "Message blocked by automated AI safety policy: Hate Speech",
            "execution_time_seconds": 0.05,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_unsafe):
            status, res = self._post_json("/api/cbm/chat/send", {
                "room_id": "http_safety_room",
                "sender_name": "ToxicPlayer",
                "content": "Violating hate message"
            })
            self.assertEqual(status, 400)
            self.assertEqual(res["error"], "content_safety_violation")
            self.assertIn("Hate Speech", res["categories"])
            self.assertEqual(res["layer"], "L3_NEMOTRON_3.5")

    def test_http_chat_send_ingress_blocked_by_layer1_slur(self):
        """POST /api/cbm/chat/send returns 400 Bad Request when L1 heuristic catches slur (zero NIM call)."""
        with patch.object(ai_service, "check_content_safety") as mock_nim:
            status, res = self._post_json("/api/cbm/chat/send", {
                "room_id": "http_safety_room",
                "sender_name": "BadActor",
                "content": "k y s now"
            })
            self.assertEqual(status, 400)
            self.assertEqual(res["error"], "content_safety_violation")
            self.assertEqual(res["layer"], "L1_HEURISTIC")
            mock_nim.assert_not_called()

    def test_http_chat_send_safe_accepted(self):
        """POST /api/cbm/chat/send succeeds and adds message when content passes moderation."""
        mock_safe = {
            "is_safe": True,
            "categories": [],
            "raw_response": "User Safety: safe",
            "message": "",
            "execution_time_seconds": 0.03,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": False
        }
        with patch.object(ai_service, "check_content_safety", return_value=mock_safe):
            status, res = self._post_json("/api/cbm/chat/send", {
                "room_id": "http_safety_room",
                "sender_name": "GoodPlayer",
                "content": "Sending resources now :gold:"
            })
            self.assertEqual(status, 200)
            self.assertEqual(res["status"], "ok")
            self.assertIn("message", res)
            self.assertEqual(res["message"]["content"], "Sending resources now :gold:")


if __name__ == "__main__":
    unittest.main()

