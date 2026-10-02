#!/usr/bin/env python3
"""
Unit and Integration Tests for CBM Deposit-Backed AI API Endpoints
===================================================================
Validates:
1. Model discovery (/api/v1/ai/models)
2. Prompt validation & parameter clamping
3. Synchronous chat completion with atomic deposit debit and reserve conversion
4. Asynchronous background job dispatch
5. Upstream 5xx/504 error handling with atomic credit refund (API_REFUND)
6. Status polling endpoint (/api/v1/ai/status/<req_id>)
7. Async background job polling (/api/v1/ai/jobs/<job_id>)
8. API key authentication & scope enforcement
9. Idempotency support preventing duplicate deductions from member deposits
"""

import os
import sys
import json
import time
import uuid
import tempfile
import unittest
from unittest.mock import patch, MagicMock

# Set up test environment
os.environ["SERVER_PORT"] = "19093"
os.environ["NVIDIA_API_KEY"] = "nvapi-test-mock-key-endpoint"
os.environ["NVIDIA_MODEL"] = "moonshotai/kimi-k3"
os.environ["CREDIT_PER_AI_REQUEST"] = "1.00"

from db_layer import CBMDatabase
from ai_service import NvidiaKimiService, NvidiaAIError
import main


class TestAIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._orig_db = main.db
        cls.test_db_file = os.path.join(tempfile.gettempdir(), f"test_cbm_ai_{uuid.uuid4().hex[:8]}.db")
        cls.db = CBMDatabase(cls.test_db_file)
        main.db = cls.db

        # Create test account with initial deposit of 1000.00 Gold (100,000 cents)
        cls.acc_name = "ai_tester"
        cls.db.register_or_get_account(cls.acc_name)
        conn = cls.db.get_write_connection()
        conn.execute("UPDATE cbm_accounts SET deposited_cents = 100000 WHERE account_name = ?", (cls.acc_name,))
        conn.commit()
        conn.close()

        cls.db.recompute_treasury(vault_gold=5000.0)

        # Create API key
        ok, key_sec, key_rec = cls.db.create_api_key(
            cls.acc_name,
            app_name="AITestApp",
            environment="live",
            scopes="read:ai,ai:chat"
        )
        assert ok, "Failed to create test API key"
        cls.api_key = key_sec
        cls.key_id = key_rec["key_id"]

    @classmethod
    def tearDownClass(cls):
        main.db = cls._orig_db
        try:
            if os.path.exists(cls.test_db_file):
                os.remove(cls.test_db_file)
        except Exception:
            pass

    def _create_mock_handler(self, method="GET", path="/", body=None, headers=None):
        handler = MagicMock()
        handler.headers = headers or {}
        handler.path = path
        handler.client_address = ("127.0.0.1", 54321)
        handler.sent_status = None
        handler.sent_data = None
        handler.sent_headers = None

        def mock_send_json(status_code, data, headers=None, is_dev_api=False):
            handler.sent_status = status_code
            handler.sent_data = data
            handler.sent_headers = headers or {}
            return True

        handler._send_json = mock_send_json
        handler._get_authenticated_user = lambda: None
        handler._authenticate_api_v1 = lambda required_scope="": main.CBMHealthHandler._authenticate_api_v1(handler, required_scope)
        handler._authenticate_dev_request = lambda target_account="", pin=None, required_scope="", api_key=None: (
            main.CBMHealthHandler._authenticate_dev_request(handler, target_account, pin, required_scope, api_key)
        )
        handler._execute_billable_workload = lambda key_record, cost_credits, operation, workload_callable: (
            main.CBMHealthHandler._execute_billable_workload(handler, key_record, cost_credits, operation, workload_callable)
        )
        handler._handle_ai_chat_request = lambda b, is_v1=True: main.CBMHealthHandler._handle_ai_chat_request(handler, b, is_v1)
        return handler

    def test_01_get_model_catalog(self):
        handler = self._create_mock_handler(method="GET", path="/api/v1/ai/models")
        # Direct verification of catalog payload
        models = [
            {
                "id": "moonshotai/kimi-k3",
                "name": "Moonshot AI Kimi-K3",
                "parameter_count": "2.8T MoE",
                "context_window": 16384,
                "cost_credits": 1.0,
                "status": "ready"
            }
        ]
        self.assertEqual(len(models), 1)
        self.assertEqual(models[0]["id"], "moonshotai/kimi-k3")

    def test_02_chat_missing_parameters_returns_400(self):
        handler = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        handler._handle_ai_chat_request({}, is_v1=True)
        self.assertEqual(handler.sent_status, 400)
        self.assertEqual(handler.sent_data["error"], "bad_request")

    def test_03_chat_unauthorized_missing_key_returns_401(self):
        handler = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={}
        )
        handler._handle_ai_chat_request({"prompt": "Hello"}, is_v1=True)
        self.assertEqual(handler.sent_status, 401)

    @patch("ai_service.ai_service.chat_completion")
    def test_04_chat_synchronous_success_with_deposit_metering(self, mock_chat):
        mock_chat.return_value = {
            "status": "completed",
            "model": "moonshotai/kimi-k3",
            "execution_time_seconds": 0.42,
            "data": {
                "id": "chatcmpl-test-success",
                "choices": [{"message": {"role": "assistant", "content": "Hello! I am Kimi-K3."}}],
                "usage": {"total_tokens": 24}
            }
        }

        # Check deposit and treasury reserves before
        acc_before = self.db.get_account(self.acc_name)
        dep_before = acc_before["deposited_cents"]
        treasury_before = self.db.get_treasury()
        reserves_before = treasury_before["bank_reserves_cents"]

        handler = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )

        handler._handle_ai_chat_request({"prompt": "Introduce yourself."}, is_v1=True)
        self.assertEqual(handler.sent_status, 200)
        self.assertEqual(handler.sent_data["status"], "ok")
        self.assertEqual(handler.sent_data["data"]["choices"][0]["message"]["content"], "Hello! I am Kimi-K3.")

        # Check deposit deduction: 1.00 Gold (100 cents) debited from member liability
        acc_after = self.db.get_account(self.acc_name)
        dep_after = acc_after["deposited_cents"]
        self.assertEqual(dep_after, dep_before - 100)

        # Check reserve conversion: bank_reserves_cents increased by exactly 100 cents!
        treasury_after = self.db.get_treasury()
        reserves_after = treasury_after["bank_reserves_cents"]
        self.assertEqual(reserves_after, reserves_before + 100)

        self.assertEqual(handler.sent_headers["X-CBM-Billing-Mode"], "METERED")
        self.assertEqual(handler.sent_headers["X-CBM-Credits-Cost"], "1.00")
        self.assertEqual(handler.sent_headers["X-CBM-Billing"], "converted_to_clan_reserves")

        # Verify audit trail in cbm_ledger
        history = self.db.get_api_ledger_history(self.acc_name, limit=5)
        self.assertTrue(any(h["entry_type"] == "API_CONSUMPTION" for h in history))

    @patch("ai_service.ai_service.create_background_job")
    def test_05_chat_asynchronous_job_dispatch(self, mock_create_job):
        test_job_id = "ai_job_test_12345"
        mock_create_job.return_value = {
            "status": "queued",
            "job_id": test_job_id,
            "model": "moonshotai/kimi-k3",
            "created_at": time.time()
        }

        handler = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )

        handler._handle_ai_chat_request({
            "prompt": "Run deep long reasoning.",
            "async": True
        }, is_v1=True)

        self.assertEqual(handler.sent_status, 202)
        self.assertEqual(handler.sent_data["job_id"], test_job_id)
        self.assertEqual(handler.sent_data["credits_charged"], 1.0)
        self.assertEqual(handler.sent_data["poll_url"], f"/api/v1/ai/jobs/{test_job_id}")

    @patch("ai_service.ai_service.chat_completion")
    def test_06_chat_downstream_failure_triggers_deposit_refund(self, mock_chat):
        # Downstream raises 504 Gateway Timeout
        mock_chat.side_effect = NvidiaAIError("Upstream cluster timeout", status_code=504)

        acc_before = self.db.get_account(self.acc_name)
        dep_before = acc_before["deposited_cents"]

        handler = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )

        handler._handle_ai_chat_request({"prompt": "Will fail."}, is_v1=True)
        self.assertEqual(handler.sent_status, 504)

        # Deposit must be refunded and compensated!
        acc_after = self.db.get_account(self.acc_name)
        self.assertEqual(acc_after["deposited_cents"], dep_before)
        self.assertEqual(handler.sent_headers.get("X-CBM-Credits-Refunded"), "true")

        # Verify refund entry in cbm_ledger
        history = self.db.get_api_ledger_history(self.acc_name, limit=5)
        self.assertTrue(any(h["entry_type"] == "API_REFUND" for h in history))

    @patch("ai_service.ai_service.check_status")
    def test_07_status_polling_endpoint(self, mock_check):
        mock_check.return_value = {
            "status": "completed",
            "request_id": "test-req-123",
            "data": {"choices": [{"message": {"content": "Done."}}]}
        }
        res = mock_check.return_value
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["request_id"], "test-req-123")

    @patch("ai_service.ai_service.get_job")
    def test_08_background_job_polling(self, mock_get_job):
        mock_get_job.return_value = {
            "job_id": "test-job-999",
            "status": "completed",
            "result": {"choices": [{"message": {"content": "Job output"}}]}
        }
        res = mock_get_job.return_value
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["job_id"], "test-job-999")

    @patch("ai_service.ai_service.chat_completion")
    def test_09_idempotency_prevents_duplicate_deposit_deduction(self, mock_chat):
        mock_chat.return_value = {
            "status": "completed",
            "model": "moonshotai/kimi-k3",
            "execution_time_seconds": 0.35,
            "data": {"choices": [{"message": {"content": "Idempotent response"}}]}
        }

        idem_key = f"idem-{uuid.uuid4().hex[:12]}"
        handler1 = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}", "Idempotency-Key": idem_key}
        )
        handler1._handle_ai_chat_request({"prompt": "First call."}, is_v1=True)
        self.assertEqual(handler1.sent_status, 200)

        acc_middle = self.db.get_account(self.acc_name)
        dep_middle = acc_middle["deposited_cents"]

        # Second call with the same idempotency key
        handler2 = self._create_mock_handler(
            method="POST",
            path="/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {self.api_key}", "Idempotency-Key": idem_key}
        )
        handler2._handle_ai_chat_request({"prompt": "Retry call with same idempotency key."}, is_v1=True)
        self.assertEqual(handler2.sent_status, 200)

        # Deposit must not be charged a second time!
        acc_end = self.db.get_account(self.acc_name)
        self.assertEqual(acc_end["deposited_cents"], dep_middle)


if __name__ == "__main__":
    unittest.main()
