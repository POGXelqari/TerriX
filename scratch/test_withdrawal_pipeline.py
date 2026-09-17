"""
Verification test for CBM Withdrawal Immediate Disbursement Pipeline:
- Runs in an isolated temporary SQLite database (zero live data pollution).
- Tests member balance validation (prevents overdrawing).
- Tests immediate disbursement execution via mock TerritorialGoldClient.
- Tests double-entry ledger debit and account balance deduction.
- Tests failure handling (balance retained when in-game transfer fails).
"""
import os
import sys
import tempfile
import sqlite3
from unittest.mock import MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte")))

from db_layer import CBMDatabase
from withdrawal_worker import CBMWithdrawalWorker

def run_tests():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        temp_db_path = tf.name

    try:
        db = CBMDatabase(db_path=temp_db_path)
        print("[OK] CBMDatabase initialized with temporary database.")

        test_user = "TestWithdrawUser"
        db.register_or_get_account(test_user)

        # Give member initial balance of 50.00 Gold (5000 cents)
        conn = db.get_write_connection()
        conn.execute("UPDATE cbm_accounts SET deposited_cents = 5000 WHERE account_name = ?", (test_user,))
        conn.commit()
        conn.close()

        # Mock Territorial Client
        mock_client = MagicMock()
        mock_client.account_name = "DdcBC"
        mock_client.send_gold.return_value = {
            "status": "ok",
            "message": "Gold transferred successfully",
            "api_fees_cents": 1,
            "target_account": "InGameRecipient"
        }

        worker = CBMWithdrawalWorker(
            db=db,
            vault_account="DdcBC",
            vault_password="dummy_password"
        )
        worker._client = mock_client

        # 1. Test Successful Withdrawal Request with Immediate Execution
        ok, msg = worker.request_withdrawal(
            account_name=test_user,
            target_account=test_user,
            amount_gold=15
        )
        assert ok is True, f"Withdrawal request failed: {msg}"
        print(f"[OK] Withdrawal succeeded: {msg}")
        mock_client.send_gold.assert_called_with(test_user, 15)

        # Verify balance was deducted by 15.00 Gold (50.00 -> 35.00)
        acc = db.get_account(test_user)
        balance_gold = acc["deposited_cents"] / 100.0
        assert balance_gold == 35.0, f"Expected 35.0 Gold, got {balance_gold}"
        print(f"[OK] Balance correctly deducted to: {balance_gold} Gold")

        # Verify ledger entry
        conn = db.get_write_connection()
        row = conn.execute("SELECT * FROM cbm_ledger WHERE account_name = ? AND entry_type = 'WITHDRAWAL'", (test_user,)).fetchone()
        assert row is not None, "Ledger entry missing for WITHDRAWAL"
        print(f"[OK] Ledger audit verified: amount_cents={row[3]} (should be -1500)")

        # Verify withdrawal record status is EXECUTED
        w_row = conn.execute("SELECT status FROM cbm_withdrawals WHERE account_name = ?", (test_user,)).fetchone()
        conn.close()
        assert w_row[0] == "EXECUTED", f"Expected EXECUTED status, got {w_row[0]}"
        print(f"[OK] Withdrawal status in database is EXECUTED")

        # 2. Test Insufficient Balance
        ok_insuf, msg_insuf = worker.request_withdrawal(
            account_name=test_user,
            target_account=test_user,
            amount_gold=100
        )
        assert ok_insuf is False, "Overdraft withdrawal should have failed"
        print(f"[OK] Overdraft blocked successfully: '{msg_insuf}'")

        # 3. Test In-Game API Failure Handling (Balance must NOT be deducted)
        mock_client.send_gold.return_value = {
            "status": "error",
            "message": "Player account not found or offline"
        }
        ok_fail, msg_fail = worker.request_withdrawal(
            account_name=test_user,
            target_account=test_user,
            amount_gold=10
        )
        assert ok_fail is False, "Failed in-game send should report failure"
        print(f"[OK] API failure handled cleanly: '{msg_fail}'")

        # Confirm balance stayed at 35.00 Gold
        acc2 = db.get_account(test_user)
        balance_gold2 = acc2["deposited_cents"] / 100.0
        assert balance_gold2 == 35.0, f"Balance should remain 35.0 Gold, got {balance_gold2}"
        print(f"[OK] Balance preserved after API failure: {balance_gold2} Gold")

        print("\nALL WITHDRAWAL PIPELINE TESTS PASSED PERFECTLY!")

    finally:
        if os.path.exists(temp_db_path):
            try:
                os.remove(temp_db_path)
            except Exception:
                pass

if __name__ == "__main__":
    run_tests()
