#!/usr/bin/env python3
"""
Test Suite: In-Game ID Resolution, Dynamic Clan/Role & Slip Donor Attribution
============================================================================
Verifies:
1. Canonical account lookup via in-game account ID (87778 -> TeothePogie).
2. Dynamic Clan and Role values extracted from Territorial.io (Clan: PRO, Role: leader).
3. Adaptive Login by in-game account ID (87778).
4. War Chest Slip creation using in-game ID and canonical mapping.
5. Leaderboard rollup (203 Gold for TeothePogie, zero orphaned 87778 rows).
"""

import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte"))
from db_layer import CBMDatabase
from gold_api_client import TerritorialGoldClient, extract_profile_metadata

def run_tests():
    print("=" * 70)
    print("  TESTING IN-GAME ID RESOLUTION & WAR CHEST SLIP DONOR ATTRIBUTION")
    print("=" * 70)

    db = CBMDatabase()

    # TEST 1: Bi-Directional Account Lookup
    print("\n[*] TEST 1: Bi-Directional Account Lookup (87778 <-> TeothePogie)")
    acc_by_terri = db.get_account("87778")
    acc_by_user = db.get_account("TeothePogie")

    assert acc_by_terri is not None, "FAILED: db.get_account('87778') returned None!"
    assert acc_by_user is not None, "FAILED: db.get_account('TeothePogie') returned None!"
    assert acc_by_terri["account_name"] == "TeothePogie", f"FAILED: Expected account_name 'TeothePogie', got '{acc_by_terri['account_name']}'"
    assert acc_by_terri["deposited_cents"] == acc_by_user["deposited_cents"], "FAILED: Balance mismatch between 87778 and TeothePogie!"
    print(f"    [PASS] 87778 correctly resolved to {acc_by_terri['account_name']} (Balance: {acc_by_terri['deposited_cents']/100.0:.2f} Gold)")

    # TEST 2: Dynamic Clan & Role Attributes
    print("\n[*] TEST 2: Dynamic Clan & Role Verification")
    print(f"    TeothePogie Clan: {acc_by_terri.get('clan_tag')}, Role: {acc_by_terri.get('role')}, Display: {acc_by_terri.get('display_name')}")
    assert acc_by_terri.get("clan_tag") in ("PRO", "NOVA"), f"FAILED: Unexpected clan tag: {acc_by_terri.get('clan_tag')}"
    assert acc_by_terri.get("role") == "leader", f"FAILED: Expected role 'leader', got '{acc_by_terri.get('role')}'"

    leader_acc = db.get_account("B8bbq")
    assert leader_acc is not None, "FAILED: db.get_account('B8bbq') returned None!"
    print(f"    B8bbq Clan: {leader_acc.get('clan_tag')}, Role: {leader_acc.get('role')}, Display: {leader_acc.get('display_name')}")
    assert leader_acc.get("clan_tag") == "ANTI-OG", f"FAILED: Unexpected clan tag: {leader_acc.get('clan_tag')}"
    assert leader_acc.get("role") == "leader", f"FAILED: Expected role 'leader', got '{leader_acc.get('role')}'"
    print("    [PASS] Dynamic Clan & Role attributes verified.")

    # TEST 3: Adaptive Login Resolution by In-Game ID
    print("\n[*] TEST 3: Adaptive Login Resolution by In-Game ID")
    # Verify raw record resolves credentials for 87778
    raw_87778 = db._get_account_raw("87778")
    assert raw_87778 is not None, "FAILED: _get_account_raw('87778') returned None!"
    assert raw_87778["account_name"] == "TeothePogie", f"FAILED: Expected 'TeothePogie', got '{raw_87778['account_name']}'"
    assert "password_hash" in raw_87778 and raw_87778["password_hash"], "FAILED: Missing password hash for TeothePogie"
    print(f"    [PASS] In-game ID 87778 maps directly to credentials of {raw_87778['account_name']}.")

    # TEST 4: War Chest Donation Slip Canonical Attribution
    print("\n[*] TEST 4: War Chest Donation Slip Canonical Attribution")
    # Generate slip declaring 5.0 Gold from in-game ID 87778
    test_amount = 5.0
    slip = db.create_pending_donation("87778", test_amount, message="Automated Concurrency Test Slip", ttl_minutes=15)
    assert slip is not None, "FAILED: Failed to create pending donation slip!"
    assert slip["account_name"] == "TeothePogie", f"FAILED: Expected slip account_name 'TeothePogie', got '{slip['account_name']}'"
    print(f"    [+] Created Slip {slip['id']} for '87778' -> Canonicalized to '{slip['account_name']}'")

    # Simulate inbound vault transfer from in-game ID 87778
    claim_tx = f"tx_sim_{int(time.time())}"
    claimed_slip = db.find_and_claim_pending_donation("87778", int(test_amount * 100), claim_tx)
    assert claimed_slip is not None, "FAILED: Failed to match and claim pending donation slip!"
    assert claimed_slip["id"] == slip["id"], f"FAILED: Claimed wrong slip {claimed_slip['id']} != {slip['id']}"
    print(f"    [PASS] In-game transfer from '87778' matched and fulfilled slip {claimed_slip['id']}.")

    # Record direct donation from this matched slip
    donor_disp = acc_by_terri.get("display_name") or acc_by_terri.get("account_name")
    don_rec = db.record_direct_donation(
        donor_name=donor_disp,
        territorial_account="87778",
        amount_cents=int(test_amount * 100),
        tx_hash=claim_tx,
        message="Automated Concurrency Test Slip"
    )
    print(f"    [+] Booked donation: Donor: '{don_rec['donor_name']}', In-Game: '{don_rec['territorial_account']}'")

    # TEST 5: Leaderboard Rollup
    print("\n[*] TEST 5: Leaderboard Canonical Rollup Verification")
    top_donors = db.get_top_donors(limit=5)
    donor_names = [d["donor_name"] for d in top_donors]
    canonical_accounts = [d.get("canonical_account") for d in top_donors]
    print(f"    Top Donors: {donor_names}")
    print(f"    Canonical Accounts: {canonical_accounts}")

    assert "87778" not in donor_names, "FAILED: In-game ID '87778' appeared as a separate donor on leaderboard!"
    assert "87778" not in canonical_accounts, "FAILED: In-game ID '87778' appeared as canonical account on leaderboard!"

    # Find TeothePogie entry
    teothe_entry = next((d for d in top_donors if d.get("canonical_account") == "TeothePogie" or "TeothePogie" in d["donor_name"]), None)
    assert teothe_entry is not None, "FAILED: TeothePogie missing from leaderboard!"
    assert teothe_entry["total_gold"] >= 208.0, f"FAILED: Expected >= 208.0 Gold (203 historical + 5 test), got {teothe_entry['total_gold']}"
    print(f"    [PASS] TeothePogie rolled up with {teothe_entry['total_gold']} Gold across {teothe_entry['donation_count']} donations!")

    print("\n" + "=" * 70)
    print("  ALL TESTS PASSED WITH 100% CANONICAL RESOLUTION FIDELITY")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
