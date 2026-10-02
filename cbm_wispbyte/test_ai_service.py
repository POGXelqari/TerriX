#!/usr/bin/env python3
"""
Unit and Integration Test Suite for CBM NVIDIA AI Inference Service
"""

import unittest
from unittest.mock import patch, MagicMock
import json
import time
import io
import urllib.error

from ai_service import NvidiaKimiService, NvidiaAIError


class MockHTTPResponse:
    def __init__(self, status=200, headers=None, body_bytes=b""):
        self.status = status
        self.headers = headers or {}
        self._body = body_bytes
        self.fp = io.BytesIO(body_bytes)

    def read(self, *args):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


class TestNvidiaKimiService(unittest.TestCase):
    def setUp(self):
        self.service = NvidiaKimiService(
            api_key="nvapi-test-mock-key-12345",
            model="moonshotai/kimi-k3",
            base_url="https://integrate.api.nvidia.com/v1"
        )

    def test_message_formatting(self):
        # 1. String normalization
        msgs = self.service.format_messages("Hello Kimi")
        self.assertEqual(msgs, [{"role": "user", "content": "Hello Kimi"}])

        # 2. ChatML list validation
        input_list = [
            {"role": "SYSTEM", "content": "You are a financial assistant."},
            {"role": "user", "content": "What is the reserve ratio?"}
        ]
        formatted = self.service.format_messages(input_list)
        self.assertEqual(len(formatted), 2)
        self.assertEqual(formatted[0]["role"], "system")
        self.assertEqual(formatted[1]["role"], "user")

        # 3. Invalid format raises ValueError
        with self.assertRaises(ValueError):
            self.service.format_messages([])

    @patch("urllib.request.urlopen")
    def test_immediate_200_completion(self, mock_urlopen):
        mock_payload = {
            "id": "chatcmpl-test-123",
            "object": "chat.completion",
            "model": "moonshotai/kimi-k3",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": "Confirmed."},
                    "finish_reason": "stop"
                }
            ],
            "usage": {"total_tokens": 12}
        }
        mock_urlopen.return_value = MockHTTPResponse(
            status=200,
            headers={"Content-Type": "application/json"},
            body_bytes=json.dumps(mock_payload).encode("utf-8")
        )

        res = self.service.chat_completion("Ping", max_tokens=64)
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["model"], "moonshotai/kimi-k3")
        self.assertEqual(res["data"]["choices"][0]["message"]["content"], "Confirmed.")

    @patch("urllib.request.urlopen")
    def test_202_accepted_and_status_polling(self, mock_urlopen):
        # First call to /chat/completions returns 202 with NVCF-REQID
        resp_202 = MockHTTPResponse(
            status=202,
            headers={"NVCF-REQID": "test-uuid-req-456", "NVCF-STATUS": "pending"},
            body_bytes=b'{"requestId": "test-uuid-req-456"}'
        )

        # Polling call to /status/test-uuid-req-456 returns 200 fulfilled
        mock_completion = {
            "id": "chatcmpl-poll-fulfilled",
            "choices": [{"message": {"role": "assistant", "content": "Kimi-K3 ready."}}]
        }
        resp_poll_200 = MockHTTPResponse(
            status=200,
            headers={"Content-Type": "application/json"},
            body_bytes=json.dumps(mock_completion).encode("utf-8")
        )

        mock_urlopen.side_effect = [resp_202, resp_poll_200]

        res = self.service.chat_completion("Reasoning test", wait_for_completion=True, poll_interval=0.01)
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["request_id"], "test-uuid-req-456")
        self.assertEqual(res["data"]["choices"][0]["message"]["content"], "Kimi-K3 ready.")

    @patch("urllib.request.urlopen")
    def test_202_accepted_without_wait(self, mock_urlopen):
        resp_202 = MockHTTPResponse(
            status=202,
            headers={"NVCF-REQID": "test-uuid-async-789"},
            body_bytes=b"{}"
        )
        mock_urlopen.return_value = resp_202

        res = self.service.chat_completion("Long reasoning", wait_for_completion=False)
        self.assertEqual(res["status"], "pending")
        self.assertEqual(res["request_id"], "test-uuid-async-789")

    @patch("urllib.request.urlopen")
    def test_background_job_execution(self, mock_urlopen):
        mock_completion = {
            "id": "chatcmpl-bg-job",
            "choices": [{"message": {"role": "assistant", "content": "Async success."}}]
        }
        mock_urlopen.return_value = MockHTTPResponse(
            status=200,
            headers={"Content-Type": "application/json"},
            body_bytes=json.dumps(mock_completion).encode("utf-8")
        )

        job_info = self.service.create_background_job("Async prompt")
        self.assertIn("job_id", job_info)
        job_id = job_info["job_id"]

        # Wait for thread to finish
        for _ in range(50):
            time.sleep(0.05)
            status = self.service.get_job(job_id)
            if status and status.get("status") == "completed":
                break

        final_job = self.service.get_job(job_id)
        self.assertEqual(final_job["status"], "completed")
        self.assertEqual(final_job["result"]["data"]["choices"][0]["message"]["content"], "Async success.")

    def test_missing_api_key(self):
        empty_service = NvidiaKimiService(api_key="", base_url="https://test.api")
        with self.assertRaises(NvidiaAIError) as ctx:
            empty_service.chat_completion("Hello")
        self.assertEqual(ctx.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
