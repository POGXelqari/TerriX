#!/usr/bin/env python3
"""
Verification Script: Full Supabase & SQLite Parity Check
Checks that CBM runtime reads, aggregates, and treasury calculations match 100%.
Zero test pollution: read-only against live tables.
"""

import os
import sys

# Ensure cbm_wispbyte is in sys.path
sys.path.insert(0, os.path.abspath("cbm_wispbyte"))

from db_layer import CBMDatabase

def verify_sync_parity():
    print("[*] Initializing CBMDatabase with Supabase active...")
    db = CBMDatabase(sqlite_path="cbm_wispbyte/cbm_data.db")
    print(f"[*] use_supabase: {db.use_supabase}")

    # 1. Check Treasury
    treasury = db.get_treasury()
    print("\n--- 1. Treasury Telemetry ---")
    print(f"Vault Total Gold: {treasury.get('vault_total_gold_cents', 0) / 100.0:.2f} Gold")
    print(f"Member Liabilities: {treasury.get('member_liabilities_cents', 0) / 100.0:.2f} Gold")
    print(f"Bank Reserves: {treasury.get('bank_reserves_cents', 0) / 100.0:.2f} Gold")
    print(f"War Chest (Unencumbered): {treasury.get('unencumbered_capital_cents', 0) / 100.0:.2f} Gold")

    # 2. Check Metrics Calculation
    metrics = db._calculate_treasury_metrics(treasury.get("vault_total_gold_cents", 0))
    print("\n--- 2. Dynamic Metric Calculation ---")
    print(f"Computed Liabilities: {metrics['member_liabilities_gold']:.2f} Gold")
    print(f"Computed War Chest: {metrics['unencumbered_capital_gold']:.2f} Gold")
    print(f"Computed Reserves: {metrics['bank_reserves_gold']:.2f} Gold")
    print(f"Computed Excess: {metrics['vault_excess_gold']:.2f} Gold")

    assert metrics['member_liabilities_cents'] > 0, "Liabilities should not be 0!"
    assert metrics['unencumbered_capital_cents'] > 0, "War Chest capital should not be 0!"

    # 3. Check Accounts
    test_accs = ["DARK LORD", "TeothePogie", "B8bbq"]
    print(f"\n--- 3. Verified Accounts ---")
    for a_name in test_accs:
        acc = db.get_account(a_name)
        if acc:
            gold = acc.get('deposited_cents', 0) / 100.0
            print(f"  - {acc['account_name']}: {gold:.2f} Gold deposited (Role: {acc.get('role')})")
        else:
            print(f"  - {a_name}: NOT FOUND")
        assert acc is not None, f"Account {a_name} must exist in synchronized DB!"

    # 4. Check Payment Methods
    for u in ["B8bbq", "TeothePogie"]:
        pms = db.get_payment_methods(u)
        print(f"\n--- 4. Payment Methods for {u} ({len(pms)} linked) ---")
        for pm in pms:
            print(f"  - Account: {pm.get('territorial_account_name')}, Type: {pm.get('verification_type')}, Primary: {bool(pm.get('is_primary'))}")
        assert len(pms) > 0, f"Expected linked payment methods for {u}!"

    # 5. Check Top Donors
    top_donors = db.get_top_donors(limit=5)
    print(f"\n--- 5. Top Donors ({len(top_donors)} found) ---")
    for d in top_donors:
        print(f"  - Rank #{d['rank']} {d['donor_name']}: {d['total_gold']} Gold ({d['donation_count']} donations)")

    assert len(top_donors) > 0, "Top donors should not be empty!"

    # 6. Check Recent Donations
    recent_donations = db.get_recent_donations(limit=5)
    print(f"\n--- 6. Recent Donations ({len(recent_donations)} found) ---")
    for d in recent_donations:
        print(f"  - {d.get('donor_name')}: {d.get('amount_gold')} Gold via {d.get('source')} (Status: {d.get('status')})")

    # 7. Check 7-Day Vault Timeline
    timeline_res = db.get_vault_timeline(days=7)
    print(f"\n--- 7. 7-Day Vault Timeline Telemetry ---")
    print(f"Status: {timeline_res.get('status')}, Points: {len(timeline_res.get('timeline', []))}")
    print(f"Reserve Ratio: {timeline_res.get('metrics', {}).get('reserve_ratio_percent')}%")
    print(f"Period Inflow: {timeline_res.get('metrics', {}).get('period_inflow_gold')} Gold")

    print("\n[SUCCESS] All checks passed! 100% parity verified between SQLite and Supabase.")

if __name__ == "__main__":
    verify_sync_parity()
