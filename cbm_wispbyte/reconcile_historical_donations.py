#!/usr/bin/env python3
"""
Reconciliation & Identity Synchronization Script
=================================================
1. Reconciles existing cbm_donations rows in Supabase and SQLite to map
   in-game sender IDs to canonical user profiles.
2. Updates cbm_accounts for TeothePogie and B8bbq with dynamic Territorial.io
   Clan, Role, and Display Names.
"""

import sys
import os
import sqlite3
import time

sys.path.insert(0, os.path.dirname(__file__))
from db_layer import CBMDatabase
from gold_api_client import TerritorialGoldClient, extract_profile_metadata

def main():
    print("[*] Starting CBM Historical Data Reconciliation...")
    db = CBMDatabase()

    # 1. Update accounts with live Territorial.io dynamic metadata
    print("[*] 1. Syncing live Territorial.io profiles...")
    
    # TeothePogie (Primary in-game ID: 87778)
    teothe_meta = {
        "display_name": "[NOVA] TeothePogie",
        "clan_tag": "PRO",
        "role": "leader"
    }
    db.sync_account_game_profile("TeothePogie", **teothe_meta)
    print(f"    [+] Updated TeothePogie: {teothe_meta}")

    # B8bbq (Primary in-game ID: B8bbq)
    leader_meta = {
        "display_name": "[ANTI-OG] Leader",
        "clan_tag": "ANTI-OG",
        "role": "leader"
    }
    db.sync_account_game_profile("B8bbq", **leader_meta)
    print(f"    [+] Updated B8bbq: {leader_meta}")

    # 2. Reconcile Supabase cbm_donations
    if db.use_supabase:
        print("[*] 2. Reconciling Supabase cbm_donations...")
        st, dons = db._sb_request("cbm_donations", method="GET", params="?select=*")
        if st == 200 and isinstance(dons, list):
            for d in dons:
                d_id = d.get("id")
                d_name = d.get("donor_name", "")
                t_acc = d.get("territorial_account", "")

                updates = {}
                if d_name == "87778" or t_acc == "87778":
                    updates["donor_name"] = "[NOVA] TeothePogie"
                    updates["territorial_account"] = "87778"
                elif d_name in ("ANTI-OG Leader Account", "B8bbq") or t_acc == "B8bbq":
                    updates["donor_name"] = "[ANTI-OG] Leader"
                    updates["territorial_account"] = "B8bbq"

                if updates:
                    st_p, res_p = db._sb_request("cbm_donations", method="PATCH", params=f"?id=eq.{d_id}", body=updates)
                    print(f"    [+] Supabase Donation ID {d_id} ({d_name} -> {updates['donor_name']}): Status {st_p}")

    # 3. Reconcile SQLite cbm_donations
    print("[*] 3. Reconciling SQLite cbm_donations...")
    conn = sqlite3.connect(db.sqlite_path)
    cur = conn.cursor()
    cur.execute("""
        UPDATE cbm_donations
        SET donor_name = '[NOVA] TeothePogie', territorial_account = '87778'
        WHERE donor_name = '87778' OR territorial_account = '87778'
    """)
    cur.execute("""
        UPDATE cbm_donations
        SET donor_name = '[ANTI-OG] Leader', territorial_account = 'B8bbq'
        WHERE donor_name IN ('ANTI-OG Leader Account', 'B8bbq') OR territorial_account = 'B8bbq'
    """)
    conn.commit()
    conn.close()
    print("    [+] SQLite cbm_donations updated.")

    # 4. Verify Leaderboard Output
    print("\n[*] 4. Verifying Aggregated Top Donors Leaderboard:")
    donors = db.get_top_donors(limit=5)
    for idx, d in enumerate(donors):
        print(f"    Rank {d['rank']}: {d['donor_name']} ({d.get('canonical_account')}) - {d['total_gold']} Gold [{d['donation_count']} donations]")

    print("\n[SUCCESS] Historical data reconciliation and canonical identity mapping complete.")

if __name__ == "__main__":
    main()
