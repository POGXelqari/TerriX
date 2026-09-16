import os
import sys
import sqlite3
import time

cbm_dir = os.path.abspath("cbm_wispbyte")
if cbm_dir not in sys.path:
    sys.path.insert(0, cbm_dir)

import db_layer

def clean():
    print("[*] Starting full purge of test pollution from Production Database and Supabase...")
    db = db_layer.CBMDatabase()

    # Legit accounts to preserve under all circumstances
    WHITELIST_ACCOUNTS = {"TeothePogie", "B8bbq", "[ANTI-OG] Leader", "DdcBC"}

    # 1. Clean Supabase
    if db.use_supabase:
        print("[*] Inspecting Supabase...")
        st, accounts = db._sb_request("cbm_accounts", method="GET", params="?select=account_name")
        if st == 200 and isinstance(accounts, list):
            for acc in accounts:
                uname = acc.get("account_name", "")
                if uname in WHITELIST_ACCOUNTS:
                    continue
                if uname.startswith("regtest_") or uname.startswith("SecTest") or uname.startswith("Test") or uname.startswith("ApiPin") or "Victim" in uname:
                    print(f"  [-] Deleting Supabase test account: {uname}")
                    # Delete loans
                    db._sb_request("cbm_loans", method="DELETE", params=f"?account_name=eq.{uname}")
                    # Delete payment methods
                    db._sb_request("cbm_payment_methods", method="DELETE", params=f"?cbm_username=eq.{uname}")
                    # Delete donation slips
                    db._sb_request("cbm_donation_slips", method="DELETE", params=f"?account_name=eq.{uname}")
                    # Delete ledger
                    db._sb_request("cbm_ledger", method="DELETE", params=f"?account_name=eq.{uname}")
                    # Delete account
                    db._sb_request("cbm_accounts", method="DELETE", params=f"?account_name=eq.{uname}")

        # Also purge any loans with SecTestUser_Loan directly
        db._sb_request("cbm_loans", method="DELETE", params="?account_name=ilike.SecTest%")
        db._sb_request("cbm_loans", method="DELETE", params="?account_name=ilike.test%")

        # Purge bad snapshots
        db._sb_request("cbm_vault_snapshots", method="DELETE", params="?member_liabilities_gold=gte.500")

    # 2. Clean Local SQLite (cbm_wispbyte/cbm_data.db)
    sqlite_path = os.path.join(cbm_dir, "cbm_data.db")
    print(f"[*] Inspecting Local SQLite: {sqlite_path}")
    if os.path.exists(sqlite_path):
        conn = sqlite3.connect(sqlite_path)
        cur = conn.cursor()

        for tbl, col in [
            ("cbm_loans", "account_name"),
            ("cbm_accounts", "account_name"),
            ("cbm_payment_methods", "cbm_username"),
            ("cbm_donation_slips", "account_name"),
            ("cbm_ledger", "account_name"),
            ("cbm_vault_snapshots", "member_liabilities_gold")
        ]:
            try:
                if tbl == "cbm_vault_snapshots":
                    cur.execute("DELETE FROM cbm_vault_snapshots WHERE member_liabilities_gold >= 500 OR unencumbered_reserves_gold <= 0")
                else:
                    cur.execute(f"DELETE FROM {tbl} WHERE {col} NOT IN ('TeothePogie', 'B8bbq', '[ANTI-OG] Leader', 'DdcBC')")
                print(f"  [-] Deleted {cur.rowcount} test rows from local SQLite {tbl}.")
            except Exception as e:
                print(f"  [.] Skipped {tbl}: {e}")

        conn.commit()
        conn.close()

    # 3. Re-verify Treasury and Record Clean Snapshot
    print("\n[*] Re-evaluating Treasury status...")
    treasury = db.get_treasury()
    print(f"  Vault Total:           {treasury.get('vault_total_gold', 0)} Gold")
    print(f"  Unencumbered Reserves: {treasury.get('unencumbered_reserves_gold', 0)} Gold")
    print(f"  Member Liabilities:    {treasury.get('member_liabilities_gold', 0)} Gold")
    print(f"  War Chest:             {treasury.get('war_chest_gold', 0)} Gold")
    print(f"  Solvency Ratio:        {treasury.get('solvency_ratio_percent', 0)}%")

    # Record clean snapshot
    db.record_vault_snapshot(
        vault_total_gold=treasury.get('vault_total_gold', 0),
        unencumbered_reserves_gold=treasury.get('unencumbered_reserves_gold', 0),
        member_liabilities_gold=treasury.get('member_liabilities_gold', 0),
        force=True
    )
    print("[✓] Clean production snapshot recorded successfully!")

if __name__ == "__main__":
    clean()
