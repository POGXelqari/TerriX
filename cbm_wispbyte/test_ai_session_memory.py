#!/usr/bin/env python3
"""
Comprehensive Integration Test Suite for AI Chat Session Memory
================================================================
Validates:
1. CORS Preflight (OPTIONS) with Origin 'null' and third-party origins
2. Session Management (POST create, GET list, GET detail, PATCH update)
3. Multi-turn contextual continuity & sliding window assembly
4. Ad-hoc session creation via /api/v1/ai/chat
5. Streaming SSE turn accumulation into database history
6. History reset (/api/v1/ai/sessions/<id>/clear)
7. Explicit session termination (DELETE, /end, end_session=True)
8. Idle TTL expiration & Garbage Collection purging
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
from unittest.mock import patch, MagicMock

# Ensure cbm_wispbyte directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main
from main import CBMHealthHandler, db, ai_service


class TestAISessionMemory(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Bind ephemeral local port for real HTTP socket tests
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.base_url = f"http://127.0.0.1:{cls.port}"

        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

        # Seed test account with ample credit deposit
        cls.test_user = f"tester_sess_{uuid.uuid4().hex[:6]}"
        db.register_member_account(
            username=cls.test_user,
            password="test_password_123",
            avatar_url="https://cbm.wispbyte.org/avatar.png",
            primary_territorial_account="TestTerritoryPlayer",
            pin="123456"
        )
        db.credit_deposit(cls.test_user, 100000, f"tx_{uuid.uuid4().hex}")
        ok, key_sec, key_rec = db.create_api_key(
            owner_account=cls.test_user,
            app_name="SessionMemoryApp",
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

    def _api_request(self, method: str, endpoint: str, body: dict = None, headers: dict = None):
        """Helper to send HTTP requests to test server."""
        url = f"{self.base_url}{endpoint}"
        req_headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        if headers:
            req_headers.update(headers)

        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=10.0) as resp:
                status_code = resp.status
                resp_headers = {k.lower(): v for k, v in resp.headers.items()}
                content = resp.read().decode("utf-8")
                try:
                    payload = json.loads(content)
                except Exception:
                    payload = content
                return status_code, payload, resp_headers
        except urllib.error.HTTPError as http_err:
            status_code = http_err.code
            resp_headers = {k.lower(): v for k, v in http_err.headers.items()}
            content = http_err.read().decode("utf-8")
            try:
                payload = json.loads(content)
            except Exception:
                payload = content
            return status_code, payload, resp_headers

    def test_01_cors_options_preflight(self):
        """Verify OPTIONS preflight on /api/v1/ai/sessions allows Origin 'null' and all REST verbs."""
        # 1. Origin: null
        status, _, headers = self._api_request(
            method="OPTIONS",
            endpoint="/api/v1/ai/sessions",
            headers={"Origin": "null", "Access-Control-Request-Method": "POST"}
        )
        self.assertEqual(status, 200)
        self.assertEqual(headers.get("access-control-allow-origin"), "*")
        allowed_methods = headers.get("access-control-allow-methods", "")
        for verb in ("GET", "POST", "OPTIONS", "PATCH", "DELETE"):
            self.assertIn(verb, allowed_methods)

        # 2. Origin: http://localhost:8080
        status, _, headers = self._api_request(
            method="OPTIONS",
            endpoint="/api/v1/ai/sessions/cbm_sess_test123",
            headers={"Origin": "http://localhost:8080", "Access-Control-Request-Method": "DELETE"}
        )
        self.assertEqual(status, 200)
        self.assertEqual(headers.get("access-control-allow-origin"), "http://localhost:8080")

    def test_02_create_session(self):
        """Verify POST /api/v1/ai/sessions creates a new stateful session."""
        status, data, _ = self._api_request(
            method="POST",
            endpoint="/api/v1/ai/sessions",
            body={
                "title": "Treasury Strategic Plan",
                "system_prompt": "You are a quantitative Clan Bank treasurer.",
                "ttl_seconds": 7200,
                "max_turns": 30
            }
        )
        self.assertEqual(status, 201)
        self.assertEqual(data.get("status"), "ok")
        session = data.get("session", {})
        self.assertTrue(session.get("session_id", "").startswith("cbm_sess_"))
        self.assertEqual(session.get("title"), "Treasury Strategic Plan")
        self.assertEqual(session.get("system_prompt"), "You are a quantitative Clan Bank treasurer.")
        self.assertEqual(session.get("total_turns"), 0)
        self.assertEqual(session.get("model"), "nvidia/nemotron-3-ultra-550b-a55b")
        self.assertEqual(session.get("ttl_seconds"), 7200)

        # Save for subsequent tests
        TestAISessionMemory.active_session_id = session["session_id"]

    def test_03_list_sessions(self):
        """Verify GET /api/v1/ai/sessions lists active sessions for authenticated account."""
        status, data, _ = self._api_request(
            method="GET",
            endpoint="/api/v1/ai/sessions"
        )
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")
        sessions = data.get("sessions", [])
        self.assertGreaterEqual(len(sessions), 1)
        sess_ids = [s["session_id"] for s in sessions]
        self.assertIn(TestAISessionMemory.active_session_id, sess_ids)

    def test_04_get_session_details(self):
        """Verify GET /api/v1/ai/sessions/<id> returns session metadata and message history."""
        sess_id = TestAISessionMemory.active_session_id
        status, data, _ = self._api_request(
            method="GET",
            endpoint=f"/api/v1/ai/sessions/{sess_id}"
        )
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("session", {}).get("session_id"), sess_id)
        self.assertEqual(data.get("messages"), [])
        self.assertEqual(data.get("message_count"), 0)

    def test_05_update_session_patch(self):
        """Verify PATCH /api/v1/ai/sessions/<id> updates session metadata."""
        sess_id = TestAISessionMemory.active_session_id
        status, data, _ = self._api_request(
            method="PATCH",
            endpoint=f"/api/v1/ai/sessions/{sess_id}",
            body={
                "title": "Updated Treasury Model",
                "ttl_seconds": 10800
            }
        )
        self.assertEqual(status, 200)
        session = data.get("session", {})
        self.assertEqual(session.get("title"), "Updated Treasury Model")
        self.assertEqual(session.get("ttl_seconds"), 10800)

    def test_06_multi_turn_contextual_continuity(self):
        """Verify POST /api/v1/ai/chat maintains stateful history and context across turns."""
        sess_id = TestAISessionMemory.active_session_id
        captured_contexts = []

        def mock_chat_completion(messages, model, **kwargs):
            captured_contexts.append(list(messages))
            # Determine mock response based on turn
            if len(messages) <= 2:
                reply = "Confirmed, your clan name is 'Aegis Sentinel'."
            else:
                reply = "Your clan is Aegis Sentinel with 50,000 Gold reserves."
            return {
                "status": "completed",
                "model": model,
                "execution_time_seconds": 0.12,
                "data": {
                    "id": f"chatcmpl_{uuid.uuid4().hex[:8]}",
                    "choices": [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": reply,
                            "reasoning_content": "Context verified."
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {"total_tokens": 42}
                }
            }

        with patch.object(ai_service, "chat_completion", side_effect=mock_chat_completion):
            # Turn 1: User introduces information
            status1, data1, _ = self._api_request(
                method="POST",
                endpoint="/api/v1/ai/chat",
                body={
                    "session_id": sess_id,
                    "messages": [{"role": "user", "content": "Our clan is named 'Aegis Sentinel'."}]
                }
            )
            self.assertEqual(status1, 200)
            self.assertEqual(data1.get("session_id"), sess_id)
            self.assertEqual(data1.get("turn_index"), 2)  # User turn (1) + Assistant turn (2)
            self.assertFalse(data1.get("session_ended"))
            self.assertIsNotNone(data1.get("session_expires_at"))

            # Verify turn 1 context sent to model
            self.assertEqual(len(captured_contexts), 1)
            t1_msgs = captured_contexts[0]
            # [system_prompt, user_msg]
            self.assertEqual(t1_msgs[0]["role"], "system")
            self.assertEqual(t1_msgs[0]["content"], "You are a quantitative Clan Bank treasurer.")
            self.assertEqual(t1_msgs[1]["role"], "user")
            self.assertEqual(t1_msgs[1]["content"], "Our clan is named 'Aegis Sentinel'.")

            # Turn 2: Follow-up question referencing turn 1 without repeating clan name
            status2, data2, _ = self._api_request(
                method="POST",
                endpoint="/api/v1/ai/chat",
                body={
                    "session_id": sess_id,
                    "messages": [{"role": "user", "content": "What is our clan name?"}]
                }
            )
            self.assertEqual(status2, 200)
            self.assertEqual(data2.get("turn_index"), 4)  # 2 historical + 1 user + 1 assistant

            # Verify turn 2 context sent to model had full history!
            self.assertEqual(len(captured_contexts), 2)
            t2_msgs = captured_contexts[1]
            self.assertEqual(len(t2_msgs), 4)  # system + user1 + asst1 + user2
            self.assertEqual(t2_msgs[0]["role"], "system")
            self.assertEqual(t2_msgs[1]["role"], "user")
            self.assertEqual(t2_msgs[2]["role"], "assistant")
            self.assertEqual(t2_msgs[3]["role"], "user")
            self.assertEqual(t2_msgs[3]["content"], "What is our clan name?")

        # Verify DB records
        history = db.get_ai_session_messages(sess_id)
        self.assertEqual(len(history), 4)
        self.assertEqual(history[0]["role"], "user")
        self.assertEqual(history[1]["role"], "assistant")
        self.assertEqual(history[2]["role"], "user")
        self.assertEqual(history[3]["role"], "assistant")

    def test_07_adhoc_session_auto_creation(self):
        """Verify /api/v1/ai/chat auto-creates ad-hoc sessions when session_id is provided."""
        adhoc_id = f"adhoc_test_{uuid.uuid4().hex[:8]}"

        def mock_chat(messages, model, **kwargs):
            return {
                "status": "completed",
                "model": model,
                "execution_time_seconds": 0.05,
                "data": {
                    "choices": [{"message": {"role": "assistant", "content": "Ad-hoc session ready."}}]
                }
            }

        with patch.object(ai_service, "chat_completion", side_effect=mock_chat):
            status, data, _ = self._api_request(
                method="POST",
                endpoint="/api/v1/ai/chat",
                body={
                    "session_id": adhoc_id,
                    "prompt": "Initialize ad-hoc thread."
                }
            )
            self.assertEqual(status, 200)
            self.assertEqual(data.get("session_id"), adhoc_id)
            self.assertEqual(data.get("turn_index"), 2)

        # Verify session exists in DB
        sess = db.get_ai_session(adhoc_id)
        self.assertIsNotNone(sess)
        self.assertEqual(sess["session_id"], adhoc_id)

        # Cleanup
        db.delete_ai_session(adhoc_id)

    def test_08_clear_session_messages(self):
        """Verify POST /api/v1/ai/sessions/<id>/clear wipes turns while keeping session alive."""
        sess_id = TestAISessionMemory.active_session_id
        # Confirm messages existed
        self.assertGreater(len(db.get_ai_session_messages(sess_id)), 0)

        status, data, _ = self._api_request(
            method="POST",
            endpoint=f"/api/v1/ai/sessions/{sess_id}/clear"
        )
        self.assertEqual(status, 200)
        self.assertEqual(data.get("status"), "ok")

        # Verify turns wiped in DB
        self.assertEqual(len(db.get_ai_session_messages(sess_id)), 0)
        sess = db.get_ai_session(sess_id)
        self.assertEqual(sess["total_turns"], 0)

    def test_09_stream_chat_session_accumulation(self):
        """Verify SSE streaming chat completion accumulates full reply into session DB."""
        sess_id = TestAISessionMemory.active_session_id

        def mock_stream(messages, model, **kwargs):
            # Yield SSE data chunks simulating NVIDIA NIM streaming
            chunks = ["Financial ", "liquidity ", "is ", "optimal."]
            for c in chunks:
                yield f"data: {json.dumps({'choices': [{'delta': {'content': c}}]})}"
            yield "data: [DONE]"

        with patch.object(ai_service, "stream_chat_completion", side_effect=mock_stream):
            url = f"{self.base_url}/api/v1/ai/chat"
            req = urllib.request.Request(
                url,
                data=json.dumps({
                    "session_id": sess_id,
                    "stream": True,
                    "prompt": "Evaluate treasury liquidity."
                }).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=10.0) as resp:
                self.assertEqual(resp.status, 200)
                sse_output = resp.read().decode("utf-8")
                self.assertIn("Financial ", sse_output)
                self.assertIn("liquidity ", sse_output)
                self.assertIn("optimal.", sse_output)

        # Verify DB accumulated user turn and complete assistant turn
        messages = db.get_ai_session_messages(sess_id)
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "user")
        self.assertEqual(messages[0]["content"], "Evaluate treasury liquidity.")
        self.assertEqual(messages[1]["role"], "assistant")
        self.assertEqual(messages[1]["content"], "Financial liquidity is optimal.")

    def test_10_explicit_session_termination(self):
        """Verify explicit termination cascades and deletes session + turns."""
        sess_id = TestAISessionMemory.active_session_id

        # 1. Delete via DELETE /api/v1/ai/sessions/<id>
        status, data, _ = self._api_request(
            method="DELETE",
            endpoint=f"/api/v1/ai/sessions/{sess_id}"
        )
        self.assertEqual(status, 200)
        self.assertTrue(data.get("deleted"))
        self.assertIsNone(db.get_ai_session(sess_id))
        self.assertEqual(len(db.get_ai_session_messages(sess_id)), 0)

        # 2. Test termination via /end endpoint
        sess2 = db.create_ai_session(owner_account=self.test_user, title="End Test")
        s2_id = sess2["session_id"]
        db.append_ai_session_message(s2_id, "user", "Message before end")
        self.assertIsNotNone(db.get_ai_session(s2_id))

        status_end, _, _ = self._api_request(
            method="POST",
            endpoint=f"/api/v1/ai/sessions/{s2_id}/end"
        )
        self.assertEqual(status_end, 200)
        self.assertIsNone(db.get_ai_session(s2_id))
        self.assertEqual(len(db.get_ai_session_messages(s2_id)), 0)

        # 3. Test termination via end_session=True in chat
        sess3 = db.create_ai_session(owner_account=self.test_user, title="Chat End Test")
        s3_id = sess3["session_id"]

        def mock_final_chat(messages, model, **kwargs):
            return {
                "status": "completed",
                "model": model,
                "data": {"choices": [{"message": {"role": "assistant", "content": "Goodbye."}}]}
            }

        with patch.object(ai_service, "chat_completion", side_effect=mock_final_chat):
            status_chat, data_chat, _ = self._api_request(
                method="POST",
                endpoint="/api/v1/ai/chat",
                body={
                    "session_id": s3_id,
                    "prompt": "Wrap up and close session.",
                    "end_session": True
                }
            )
            self.assertEqual(status_chat, 200)
            self.assertTrue(data_chat.get("session_ended"))

        # Verify session was pruned upon completion
        self.assertIsNone(db.get_ai_session(s3_id))
        self.assertEqual(len(db.get_ai_session_messages(s3_id)), 0)

    def test_11_ttl_expiration_and_gc(self):
        """Verify idle TTL expiration auto-prunes sessions on read and via GC sweeper."""
        # Create session with tiny 1-second TTL
        sess = db.create_ai_session(
            owner_account=self.test_user,
            title="Short TTL Session",
            ttl_seconds=1
        )
        short_id = sess["session_id"]
        db.append_ai_session_message(short_id, "user", "Will expire soon")

        # Confirm session exists initially
        self.assertIsNotNone(db.get_ai_session(short_id, touch=False))

        # Wait for TTL to lapse
        time.sleep(1.2)

        # 1. On-access auto-purge: GET /api/v1/ai/sessions/<short_id> returns 404
        status, data, _ = self._api_request(
            method="GET",
            endpoint=f"/api/v1/ai/sessions/{short_id}"
        )
        self.assertEqual(status, 404)
        self.assertEqual(data.get("error"), "session_not_found")

        # 2. GC Sweeper: prune_expired_ai_sessions
        # Create another expired session directly in DB
        sess_gc = db.create_ai_session(
            owner_account=self.test_user,
            title="GC Target",
            ttl_seconds=1
        )
        gc_id = sess_gc["session_id"]
        db.append_ai_session_message(gc_id, "user", "Prune me")
        time.sleep(1.2)

        pruned = db.prune_expired_ai_sessions()
        self.assertGreaterEqual(pruned, 1)
        self.assertIsNone(db.get_ai_session(gc_id, touch=False))
        self.assertEqual(len(db.get_ai_session_messages(gc_id)), 0)


if __name__ == "__main__":
    unittest.main()
