#!/usr/bin/env python3
"""
Unit and Integration Test Suite: Bot Fleet Management & War Economy (Phase 1)
=============================================================================
Verifies:
1. Economic integer-cent calculations (Target = 3*I, Payout Cap = 2*I).
2. Bot lifecycle state transitions & validation.
3. War lifecycle state transitions & validation.
4. Capital authorization: bot funding strictly debits Admin B8bbq's personal balance.
5. Idempotent investment execution.
6. Payout intent generation with contract cap enforcement.
7. Inbound payout matching: intent claiming, investment settlement, zero member liability reserve credit.
8. Chronological audit event tracking.
"""

import os
import sys
import tempfile
import unittest

# Ensure cbm_wispbyte directory is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from db_layer import CBMDatabase
from war_engine import (
    calculate_investment_targets,
    calculate_war_financials,
    validate_bot_transition,
    validate_war_transition,
    BotState,
    WarState
)


class TestBotEconomy(unittest.TestCase):
    def setUp(self):
        # Create an isolated temporary SQLite database for zero production pollution
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix=".db")
        os.close(self.temp_db_fd)
        os.environ["CBM_ENV"] = "test"
        self.db = CBMDatabase(sqlite_path=self.temp_db_path, use_supabase=False)

        # Seed essential accounts: Vault DdcBC, Admin B8bbq with 50,000 cents (500 Gold), and a standard user
        conn = self.db.get_write_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO cbm_accounts (account_name, display_name, deposited_cents, role)
            VALUES ('B8bbq', 'B8bbq', 50000, 'admin')
        """)
        cur.execute("""
            INSERT OR REPLACE INTO cbm_accounts (account_name, display_name, deposited_cents, role)
            VALUES ('Alice', 'Alice', 20000, 'member')
        """)
        conn.commit()
        conn.close()

        # Initialize vault balance to match member liabilities (70,000 cents)
        self.db.update_vault_balance(70000)
        self.db.recompute_treasury()

    def tearDown(self):
        try:
            if hasattr(self.db, "_local") and hasattr(self.db._local, "conn") and self.db._local.conn:
                self.db._local.conn.close()
        except Exception:
            pass
        if os.path.exists(self.temp_db_path):
            try:
                os.remove(self.temp_db_path)
            except Exception:
                pass

    def test_integer_cent_math(self):
        """Test Target (3I) and Payout Cap (2I) integer-cent calculations."""
        # 100 Gold = 10,000 cents
        target, cap = calculate_investment_targets(10000)
        self.assertEqual(target, 30000)
        self.assertEqual(cap, 20000)

        # Uneven cents: 333 cents -> Target: 999 cents, Cap: 666 cents
        target2, cap2 = calculate_investment_targets(333)
        self.assertEqual(target2, 999)
        self.assertEqual(cap2, 666)

        # Financial aggregation
        fins = calculate_war_financials(25000)
        self.assertEqual(fins["investment_gold"], 250.0)
        self.assertEqual(fins["target_gold"], 750.0)
        self.assertEqual(fins["payout_cap_gold"], 500.0)

    def test_bot_state_machine(self):
        """Test bot state machine transitions and invalid edge-case rejection."""
        self.assertTrue(validate_bot_transition(BotState.PROVISIONING, BotState.READY))
        self.assertTrue(validate_bot_transition(BotState.READY, BotState.RESERVED))
        self.assertTrue(validate_bot_transition(BotState.RESERVED, BotState.RUNNING))
        self.assertTrue(validate_bot_transition(BotState.RUNNING, BotState.PAYOUT_PENDING))
        self.assertTrue(validate_bot_transition(BotState.PAYOUT_PENDING, BotState.READY))

        # Test invalid transitions
        self.assertFalse(validate_bot_transition(BotState.PROVISIONING, BotState.RUNNING))
        self.assertFalse(validate_bot_transition(BotState.READY, BotState.PAYOUT_PENDING))
        self.assertFalse(validate_bot_transition(BotState.RUNNING, BotState.READY))

    def test_war_state_machine(self):
        """Test war campaign state machine transitions."""
        self.assertTrue(validate_war_transition(WarState.DRAFT, WarState.ACTIVE))
        self.assertTrue(validate_war_transition(WarState.ACTIVE, WarState.COMPLETED))
        self.assertTrue(validate_war_transition(WarState.ACTIVE, WarState.FAILED))
        self.assertTrue(validate_war_transition(WarState.DRAFT, WarState.CANCELLED))

        # Invalid transition: COMPLETED cannot go back to ACTIVE
        self.assertFalse(validate_war_transition(WarState.COMPLETED, WarState.ACTIVE))

    def test_bot_account_crud(self):
        """Test registering, retrieving, and listing bot fleet accounts."""
        bot = self.db.create_bot_account("bot_alpha", "Vanguard_01", "SecurePass123!")
        self.assertIsNotNone(bot.get("bot_id"))
        self.assertEqual(bot["status"], "PROVISIONING")
        self.assertEqual(bot["territorial_name"], "Vanguard_01")

        # Retrieve by bot_id and username
        by_id = self.db.get_bot_account(bot["bot_id"])
        self.assertIsNotNone(by_id)
        self.assertEqual(by_id["bot_username"], "bot_alpha")

        by_user = self.db.get_bot_account("bot_alpha")
        self.assertIsNotNone(by_user)
        self.assertEqual(by_user["bot_id"], bot["bot_id"])

        # Update bot status to READY
        ok, msg, updated = self.db.update_bot_status(bot["bot_id"], "READY")
        self.assertTrue(ok)
        self.assertEqual(updated["status"], "READY")

        # List bots
        bots = self.db.list_bot_accounts(status="READY")
        self.assertEqual(len(bots), 1)

    def test_war_creation_and_authorization(self):
        """Test that only Admin B8bbq may declare clan wars."""
        # Non-admin Alice attempts to create war -> Denied
        ok_alice, msg_alice, _ = self.db.create_war("Operation Ironclad", "CORSAIR", created_by="Alice")
        self.assertFalse(ok_alice)
        self.assertIn("Unauthorized", msg_alice)

        # Admin B8bbq creates war -> Approved
        ok_b8, msg_b8, war = self.db.create_war("Operation Ironclad", "CORSAIR", created_by="B8bbq")
        self.assertTrue(ok_b8)
        self.assertIsNotNone(war.get("war_id"))
        self.assertEqual(war["status"], "DRAFT")
        self.assertEqual(war["enemy_clan"], "CORSAIR")

    def test_capital_investment_and_idempotency(self):
        """Test that bot investment strictly debits Admin B8bbq's balance with idempotency."""
        _, _, war = self.db.create_war("Operation Trident", "KILR", created_by="B8bbq")
        bot = self.db.create_bot_account("bot_bravo", "Vanguard_02", "Pass123!")
        self.db.update_bot_status(bot["bot_id"], "READY")

        # 1. Non-admin investment attempt -> Denied
        ok_nonadmin, msg_nonadmin, _ = self.db.fund_bot_investment(
            war_id=war["war_id"],
            investor_account="Alice",
            bot_id=bot["bot_id"],
            investment_cents=5000,
            idempotency_key="idemp_alice_01"
        )
        self.assertFalse(ok_nonadmin)
        self.assertIn("Unauthorized", msg_nonadmin)

        # 2. Admin B8bbq invests 10,000 cents (100.00 Gold) -> Debited from 50,000 cents
        ok_inv, msg_inv, inv = self.db.fund_bot_investment(
            war_id=war["war_id"],
            investor_account="B8bbq",
            bot_id=bot["bot_id"],
            investment_cents=10000,
            idempotency_key="idemp_b8bbq_01"
        )
        self.assertTrue(ok_inv)
        self.assertEqual(inv["investment_cents"], 10000)
        self.assertEqual(inv["target_gold_cents"], 30000)
        self.assertEqual(inv["payout_cap_cents"], 20000)

        # Verify B8bbq's balance is debited to 40,000 cents
        acc = self.db._get_account_raw("B8bbq")
        self.assertEqual(acc["deposited_cents"], 40000)

        # Verify bot is transitioned to RESERVED
        updated_bot = self.db.get_bot_account(bot["bot_id"])
        self.assertEqual(updated_bot["status"], "RESERVED")

        # 3. Idempotent replay: submitting the exact same key must not double-debit
        ok_replay, msg_replay, inv_replay = self.db.fund_bot_investment(
            war_id=war["war_id"],
            investor_account="B8bbq",
            bot_id=bot["bot_id"],
            investment_cents=10000,
            idempotency_key="idemp_b8bbq_01"
        )
        self.assertTrue(ok_replay)
        self.assertIn("idempotent", msg_replay.lower())
        self.assertEqual(inv_replay["investment_id"], inv["investment_id"])

        # Balance remains 40,000 cents
        acc_after = self.db._get_account_raw("B8bbq")
        self.assertEqual(acc_after["deposited_cents"], 40000)

    def test_payout_intent_and_inbound_claiming(self):
        """Test payout intent generation, contract cap enforcement, and claim execution."""
        _, _, war = self.db.create_war("Operation Citadel", "TITAN", created_by="B8bbq")
        bot = self.db.create_bot_account("bot_charlie", "Vanguard_03", "Pass123!")
        self.db.update_bot_status(bot["bot_id"], "READY")

        # Invest 5,000 cents (50 Gold) -> Cap = 10,000 cents (100 Gold)
        self.db.fund_bot_investment(
            war_id=war["war_id"],
            investor_account="B8bbq",
            bot_id=bot["bot_id"],
            investment_cents=5000,
            idempotency_key="idemp_b8bbq_citadel"
        )
        self.db.update_bot_status(bot["bot_id"], "RUNNING")

        # Attempt to create payout intent exceeding cap (15,000 > 10,000) -> Rejected
        ok_bad, msg_bad, _ = self.db.create_payout_intent(war["war_id"], bot["bot_id"], expected_amount_cents=15000)
        self.assertFalse(ok_bad)
        self.assertIn("exceeds contractual payout cap", msg_bad)

        # Create valid payout intent for 8,000 cents (80 Gold <= 100 Gold cap)
        ok_intent, msg_intent, intent = self.db.create_payout_intent(
            war["war_id"], bot["bot_id"], expected_amount_cents=8000
        )
        self.assertTrue(ok_intent)
        self.assertEqual(intent["status"], "PENDING")

        bot_pending = self.db.get_bot_account(bot["bot_id"])
        self.assertEqual(bot_pending["status"], "PAYOUT_PENDING")

        # Inbound transfer from bot "Vanguard_03" for 80.00 Gold (8,000 cents)
        claimed_intent = self.db.find_and_claim_payout_intent(
            territorial_account="Vanguard_03",
            amount_cents=8000,
            tx_hash="tx_match_payout_001"
        )
        self.assertIsNotNone(claimed_intent)
        self.assertEqual(claimed_intent["status"], "CLAIMED")
        self.assertEqual(claimed_intent["intent_id"], intent["intent_id"])

        # Bot is automatically restored to READY
        bot_restored = self.db.get_bot_account(bot["bot_id"])
        self.assertEqual(bot_restored["status"], "READY")
        self.assertIsNone(bot_restored["current_war_id"])

        treasury_before = self.db.get_treasury()
        reserves_before = treasury_before["bank_reserves_cents"]
        liabilities_before = treasury_before["member_liabilities_cents"]

        # Record direct donation to test treasury reserve credit
        self.db.record_direct_donation(
            donor_name=f"Bot {bot_restored['bot_username']}",
            territorial_account="Vanguard_03",
            amount_cents=8000,
            tx_hash="tx_match_payout_001",
            intent_type="BOT_WAR_PAYOUT",
            war_id=war["war_id"],
            bot_id=bot["bot_id"],
            intent_id=intent["intent_id"]
        )

        # Verify treasury: unencumbered reserves increased by 8,000, member liabilities strictly unchanged
        treasury = self.db.get_treasury()
        self.assertEqual(treasury["bank_reserves_cents"], reserves_before + 8000)
        self.assertEqual(treasury["member_liabilities_cents"], liabilities_before)
        self.assertEqual(treasury["unencumbered_capital_cents"], 8000)

        # Audit events verify complete chronological trace
        events = self.db.get_war_events(war["war_id"])
        event_types = [e["event_type"] for e in events]
        self.assertIn("WAR_CREATED", event_types)
        self.assertIn("INVESTMENT_FUNDED", event_types)
        self.assertIn("PAYOUT_INTENT_CREATED", event_types)
        self.assertIn("PAYOUT_CLAIMED", event_types)


if __name__ == "__main__":
    unittest.main()
