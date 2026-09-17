"""
End-to-End Verification Test for Admin Election Sponsorship Program:
- Runs in an isolated temporary SQLite database (zero live data pollution).
- Tests 15% reserve budget cap calculation.
- Tests claim submission and automatic 1:1 balance crediting in cbm_accounts.
- Tests double-entry ledger audit trail in cbm_ledger.
- Tests cap enforcement (rejection when claim exceeds 15% budget).
- Tests top backers leaderboard aggregation.
"""
import os
import sys
import tempfile
import sqlite3

# Add cbm_wispbyte to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte")))

from db_layer import CBMDatabase

def run_tests():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tf:
        temp_db_path = tf.name

    try:
        # Override db path to temporary DB so production DB is untouched
        db = CBMDatabase(db_path=temp_db_path)
        print("[OK] CBMDatabase initialized with election tables in temporary database.")

        # Setup test member:
        test_user = "TestVoterUser"
        db.register_or_get_account(test_user)

        # Give member initial balance of 10.00 Gold (1000 cents)
        # Give vault total gold = 500.00 Gold (50000 cents), liabilities = 10.00 Gold (1000 cents)
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

        # 1. Test Budget Summary
        summary = db.get_admin_election_summary()
        print(f"[OK] Summary: reserves={summary['bank_reserves_gold']}, cap={summary['max_campaign_budget_gold']}, available={summary['available_budget_gold']}")
        assert summary["bank_reserves_gold"] == 490.0, f"Expected 490.0 reserves, got {summary['bank_reserves_gold']}"
        assert abs(summary["max_campaign_budget_gold"] - 73.50) < 0.01, f"Expected 73.50 cap, got {summary['max_campaign_budget_gold']}"
        assert abs(summary["available_budget_gold"] - 73.50) < 0.01, f"Expected 73.50 available, got {summary['available_budget_gold']}"
        assert summary["cap_reached"] is False, "Cap should not be reached"

        # 2. Test Claim Submission (10 votes -> 11 Gold spent, 11 Gold reward credited)
        ok, msg, claim = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account="InGameGeneral",
            votes_count=10,
            gold_spent=11.0,
            auto_settle=True
        )
        assert ok is True, f"Claim failed: {msg}"
        print(f"[OK] Claim #1 successful: {msg}")
        assert claim["reward_gold"] == 11.0, f"Expected 11.0 reward gold, got {claim['reward_gold']}"
        assert claim["new_balance_gold"] == 21.0, f"Expected 21.0 new balance, got {claim['new_balance_gold']}"

        # 3. Verify member account balance in DB
        acc = db.get_account(test_user)
        balance_gold = acc["deposited_cents"] / 100.0
        assert balance_gold == 21.0, f"Expected 21.0 Gold in account, got {balance_gold}"
        print(f"[OK] Member balance verified: {balance_gold} Gold (1:1 reimbursement applied)")

        # 4. Verify Double-Entry Ledger Entry
        conn = db.get_write_connection()
        ledger_row = conn.execute("SELECT * FROM cbm_ledger WHERE account_name = ? AND entry_type = 'ADMIN_VOTE_REWARD'", (test_user,)).fetchone()
        conn.close()
        assert ledger_row is not None, "Ledger entry missing for ADMIN_VOTE_REWARD"
        print(f"[OK] Ledger audit verified: amount_cents={ledger_row[3]}, balance_after={ledger_row[4]}")

        # 5. Check Updated Campaign Summary
        summary2 = db.get_admin_election_summary()
        print(f"[DEBUG] summary2: reserves={summary2['bank_reserves_gold']}, cap={summary2['max_campaign_budget_gold']}, disbursed={summary2['total_rewards_disbursed_gold']}, available={summary2['available_budget_gold']}")
        assert abs(summary2["total_rewards_disbursed_gold"] - 11.0) < 0.01, "Total disbursed mismatch"
        assert summary2["total_votes_sponsored"] == 10, "Votes sponsored mismatch"
        print(f"[OK] Updated budget after claim #1: disbursed={summary2['total_rewards_disbursed_gold']}, remaining={summary2['available_budget_gold']}")

        # 6. Test 15% Cap Enforcement: Attempt claim exceeding remaining budget (e.g. 100 votes -> 101 Gold)
        ok_excess, msg_excess, _ = db.submit_admin_vote_claim(
            cbm_username=test_user,
            voter_account="InGameGeneral",
            votes_count=100,
            gold_spent=101.0,
            auto_settle=True
        )
        assert ok_excess is False, "Excess claim should have been blocked"
        print(f"[OK] 15% Cap enforcement verified: Excess claim blocked with: '{msg_excess}'")

        # 7. Test Top Backers Leaderboard
        summary3 = db.get_admin_election_summary()
        backers = summary3["top_backers"]
        assert len(backers) == 1, "Expected 1 top backer"
        assert backers[0]["cbm_username"] == test_user, "Backer username mismatch"
        assert backers[0]["votes_sponsored"] == 10, "Backer votes mismatch"
        assert backers[0]["reward_gold"] == 11.0, "Backer reward mismatch"
        print(f"[OK] Top Backers Leaderboard verified: {backers}")

        print("\nALL ADMIN ELECTION SPONSORSHIP VERIFICATION TESTS PASSED PERFECTLY!")

    finally:
        if os.path.exists(temp_db_path):
            try:
                os.remove(temp_db_path)
            except Exception:
                pass

if __name__ == "__main__":
    run_tests()
