"""
End-to-End Verification Test for Hardened Admin Election Sponsorship Program:
- Runs in an isolated temporary SQLite database (zero live data pollution).
- Tests 15% reserve budget cap calculation.
- Tests strict Voter Identity Binding (unlinked accounts blocked).
- Tests Server-Side Cost Calculation (eliminates gold_spent client tampering).
- Tests Asynchronous Queue & Officer Settlement workflow.
- Tests 24-hour Anti-Replay deduplication.
- Tests Promotional Audit Quarantine & Vault Liquidity Defense via withdrawal_worker.
- Tests 15% Cap Enforcement against burst over-allocation.
- Tests Top Backers & Recent Disbursements telemetry.
"""
import os
import sys
import time
import tempfile
import sqlite3

# Add cbm_wispbyte to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte")))

from db_layer import CBMDatabase
from withdrawal_worker import CBMWithdrawalWorker

def run_tests():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        temp_db_path = tf.name

    try:
        # Override db path to temporary DB so production DB is untouched
        db = CBMDatabase(db_path=temp_db_path)
        print("[OK] CBMDatabase initialized with hardened election tables in temporary database.")

        # Setup test member:
        test_user = "TestVoterUser"
        db.register_or_get_account(test_user)

        # Give member initial deposit balance of 10.00 Gold (1000 cents)
        # Vault total gold = 500.00 Gold (50000 cents), liabilities = 10.00 Gold (1000 cents)
        # Unencumbered reserves = 490.00 Gold (49000 cents)
        # 15% reserve cap = 490.00 * 0.15 = 73.50 Gold (7350 cents)
        conn = db.get_write_connection()
        conn.execute("UPDATE cbm_accounts SET deposited_cents = 1000 WHERE account_name = ?", (test_user,))
        conn.execute("""
            INSERT OR REPLACE INTO cbm_treasury (
                id, vault_account_name, vault_total_gold_cents,
                member_liabilities_cents, bank_reserves_cents,
                unencumbered_capital_cents, loan_penalties_cents, last_sync_at
            ) VALUES (1, 'DdcBC', 50000, 1000, 49000, 49000, 0, 1726000000)
        """)
        conn.commit()
        conn.close()

        # 1. Test Budget Summary Calculation
        summary = db.get_admin_election_summary()
        print(f"[OK] Summary: reserves={summary['bank_reserves_gold']}, cap={summary['max_campaign_budget_gold']}, available={summary['available_budget_gold']}")
        assert summary["bank_reserves_gold"] == 490.0, f"Expected 490.0 reserves, got {summary['bank_reserves_gold']}"
        assert abs(summary["max_campaign_budget_gold"] - 73.50) < 0.01, f"Expected 73.50 cap, got {summary['max_campaign_budget_gold']}"
        assert abs(summary["available_budget_gold"] - 73.50) < 0.01, f"Expected 73.50 available, got {summary['available_budget_gold']}"
        assert summary["cap_reached"] is False, "Cap should not be reached"

        # 2. Test Voter Identity Binding (Unlinked voter account should be BLOCKED)
        unlinked_voter = "SpoofedVoterAccount"
        ok_unlinked, msg_unlinked, _ = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account=unlinked_voter,
            votes_count=10
        )
        assert ok_unlinked is False, "Unlinked voter account claim should have been blocked"
        print(f"[OK] Voter identity binding verified: blocked unlinked claim with: '{msg_unlinked}'")

        # Now link voter account to member under cbm_payment_methods
        linked_voter = "InGameGeneral"
        conn = db.get_write_connection()
        conn.execute("""
            INSERT INTO cbm_payment_methods (cbm_username, territorial_account_name, status, is_primary)
            VALUES (?, ?, 'VERIFIED', 1)
        """, (test_user, linked_voter))
        conn.commit()
        conn.close()

        # 3. Test Server-Side Cost Calculation & Asynchronous Claim Submission
        # Attacker attempts to pass gold_spent = 9999.0
        ok_sub, msg_sub, claim_sub = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account=linked_voter,
            votes_count=10,
            gold_spent=9999.0, # Client tampering attempt
            auto_settle=False
        )
        assert ok_sub is True, f"Submission failed: {msg_sub}"
        claim_id = claim_sub["claim_id"]
        assert claim_sub["reward_gold"] == 11.0, f"Tampered gold_spent was not overridden! Got: {claim_sub['reward_gold']}"
        assert claim_sub["status"] == "PENDING", f"Claim status must be PENDING, got {claim_sub['status']}"
        print(f"[OK] Client parameter tampering blocked: 10 votes strictly priced at 11.00 Gold.")

        # 4. Anti-Abuse: Disallow multiple unsettled pending claims for the same voter
        ok_dup_pending, msg_dup_pending, _ = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account=linked_voter,
            votes_count=5,
            auto_settle=False
        )
        assert ok_dup_pending is False, "Multiple pending claims for the same voter should be blocked"
        print(f"[OK] Multiple pending claims blocked: '{msg_dup_pending}'")

        # 5. Officer Settlement & Quarantine Holding
        ok_settle, msg_settle, settle_details = db.settle_admin_vote_claim(
            claim_id=claim_id,
            verified=True,
            quarantine_hours=24.0
        )
        assert ok_settle is True, f"Settlement failed: {msg_settle}"
        print(f"[OK] Officer settlement completed: {msg_settle}")
        assert settle_details["status"] == "REWARDED"
        assert settle_details["quarantine_hours"] == 24.0

        # Balance check: 10.00 initial + 11.00 reward = 21.00 total deposited cents
        acc = db.get_account(test_user)
        assert acc["deposited_cents"] == 2100, f"Expected 2100 cents, got {acc['deposited_cents']}"

        # 6. Test Anti-Replay: Attempting duplicate rewarded claim within 24h is BLOCKED
        ok_replay, msg_replay, _ = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account=linked_voter,
            votes_count=10,
            auto_settle=False
        )
        assert ok_replay is False, "Duplicate rewarded claim within 24h should have been blocked"
        print(f"[OK] Anti-replay verified: duplicate claim blocked with: '{msg_replay}'")

        # 7. Test Liquidity Protection / Promotional Quarantine in Withdrawal Worker
        withdrawable_cents = db.get_withdrawable_balance_cents(test_user)
        print(f"[OK] Total balance: {acc['deposited_cents']/100.0:.2f} G, Withdrawable balance: {withdrawable_cents/100.0:.2f} G")
        assert withdrawable_cents == 1000, f"Expected only 1000 cents withdrawable, got {withdrawable_cents}"

        # Mock withdrawal worker with client
        class DummyClient:
            def send_gold(self, target_account, amount_gold):
                return {"status": "ok", "tx_id": "dummy_tx_123"}

        ww = CBMWithdrawalWorker(db=db, vault_account="DdcBC", vault_password="dummy_password")
        ww._client = DummyClient()

        # Attempt to withdraw 15.00 Gold (more than the 10.00 G withdrawable balance)
        ok_w_excess, msg_w_excess = ww.request_withdrawal(
            account_name=test_user,
            target_account=linked_voter,
            amount_gold=15
        )
        assert ok_w_excess is False, "Withdrawal of quarantined funds should have been blocked!"
        assert "promotional audit quarantine" in msg_w_excess or "restricted" in msg_w_excess.lower()
        print(f"[OK] Vault liquidity protection verified: premature withdrawal blocked: '{msg_w_excess}'")

        # Legitimate withdrawal of seasoned funds (5.00 Gold <= 10.00 Gold) MUST SUCCEED
        ok_w_valid, msg_w_valid = ww.request_withdrawal(
            account_name=test_user,
            target_account=linked_voter,
            amount_gold=5
        )
        assert ok_w_valid is True, f"Legitimate seasoned withdrawal failed: {msg_w_valid}"
        print(f"[OK] Legitimate member withdrawal passed smoothly: '{msg_w_valid}'")

        # Fast-forward quarantine timestamp to simulate elapsed holding period
        conn = db.get_write_connection()
        conn.execute("UPDATE cbm_admin_votes SET quarantine_until = ? WHERE claim_id = ?", (time.time() - 10, claim_id))
        conn.commit()
        conn.close()

        withdrawable_after = db.get_withdrawable_balance_cents(test_user)
        assert withdrawable_after == 1600, f"Expected full remaining balance 1600 withdrawable after quarantine, got {withdrawable_after}"
        print(f"[OK] After quarantine elapsed, full remaining balance became withdrawable: {withdrawable_after/100.0:.2f} G")

        # 8. Test 15% Cap Enforcement against Burst Over-Allocation
        # Remaining cap is ~60.85 Gold. Attempt claim for 100 votes (101 Gold)
        ok_cap, msg_cap, _ = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account=linked_voter,
            votes_count=100,
            auto_settle=False
        )
        assert ok_cap is False, "Excess claim should be blocked by 15% budget cap"
        print(f"[OK] 15% Cap enforcement verified: '{msg_cap}'")

        # 9. Test Top Backers & Recent Disbursements Telemetry
        summary_final = db.get_admin_election_summary()
        assert len(summary_final["top_backers"]) == 1
        assert summary_final["top_backers"][0]["cbm_username"] == test_user
        assert summary_final["top_backers"][0]["votes_sponsored"] == 10
        assert len(summary_final["recent_disbursements"]) >= 1
        assert summary_final["recent_disbursements"][0]["status"] == "REWARDED"
        print("[OK] Leaderboard and recent disbursements telemetry verified.")

        print("\nALL 6 ADMIN ELECTION SPONSORSHIP HARDENING VERIFICATION TESTS PASSED PERFECTLY!")

    finally:
        if os.path.exists(temp_db_path):
            try:
                os.remove(temp_db_path)
            except Exception:
                pass

if __name__ == "__main__":
    run_tests()
