import sys, os
sys.path.insert(0, r'g:\TerriX\cbm_wispbyte')
from db_layer import CBMDatabase

db = CBMDatabase(use_supabase=True)

print("--- Cleaning SecurityTestUser from live Supabase ---")
# 1. Delete from cbm_ledger
st, res = db._sb_request("cbm_ledger", method="DELETE", params="?account_name=eq.SecurityTestUser")
print("Deleted SecurityTestUser ledger:", st)

# 2. Delete test transactions from cbm_processed_txs if any
st, res = db._sb_request("cbm_processed_txs", method="DELETE", params="?credited_account=eq.SecurityTestUser")
print("Deleted SecurityTestUser processed_txs:", st)

# 3. Delete from cbm_accounts
st, res = db._sb_request("cbm_accounts", method="DELETE", params="?account_name=eq.SecurityTestUser")
print("Deleted SecurityTestUser account:", st)

# Also clean local sqlite
import sqlite3
conn = sqlite3.connect(db.sqlite_path)
cur = conn.cursor()
cur.execute("DELETE FROM cbm_ledger WHERE account_name LIKE 'SecUser%' OR account_name = 'SecurityTestUser'")
cur.execute("DELETE FROM cbm_accounts WHERE account_name LIKE 'SecUser%' OR account_name = 'SecurityTestUser'")
cur.execute("DELETE FROM cbm_processed_txs WHERE credited_account LIKE 'SecUser%' OR credited_account = 'SecurityTestUser'")
conn.commit()
conn.close()
print("Cleaned local SQLite.")

# 4. Reconcile Treasury
# Live vault is 154.34 Gold (15434 cents)
# Real accounts in Supabase
st_a, accs = db._sb_request("cbm_accounts", method="GET", params="?select=*")
real_liabilities_cents = sum(a.get("deposited_cents", 0) for a in accs) if isinstance(accs, list) else 5002
print(f"Real accounts remaining: {[a.get('account_name') for a in accs]}")
print(f"Real member liabilities: {real_liabilities_cents} cents ({real_liabilities_cents/100.0} Gold)")

vault_cents = 15434
# War chest donations:
st_d, dons = db._sb_request("cbm_donations", method="GET", params="?select=*")
unencumbered_capital_cents = sum(d.get("amount_cents", 0) for d in dons) if isinstance(dons, list) else 5100
print(f"Unencumbered War Chest Capital: {unencumbered_capital_cents} cents ({unencumbered_capital_cents/100.0} Gold)")

# Total bank reserves = vault - liabilities
reserves_cents = max(0, vault_cents - real_liabilities_cents)
print(f"Calculated Bank Reserves: {reserves_cents} cents ({reserves_cents/100.0} Gold)")

# Patch cbm_treasury
st_patch, patch_res = db._sb_request("cbm_treasury", method="PATCH", params="?id=eq.1", body={
    "vault_total_gold_cents": vault_cents,
    "member_liabilities_cents": real_liabilities_cents,
    "bank_reserves_cents": reserves_cents,
    "unencumbered_capital_cents": unencumbered_capital_cents,
    "loan_penalties_cents": 0
})
print("Treasury patched:", st_patch)

# Also update local treasury
conn = sqlite3.connect(db.sqlite_path)
cur = conn.cursor()
cur.execute("""
    UPDATE cbm_treasury SET
        vault_total_gold_cents = ?,
        member_liabilities_cents = ?,
        bank_reserves_cents = ?,
        unencumbered_capital_cents = ?,
        loan_penalties_cents = 0
    WHERE id = 1
""", (vault_cents, real_liabilities_cents, reserves_cents, unencumbered_capital_cents))
conn.commit()
conn.close()

# Verify
metrics = db._calculate_treasury_metrics(vault_cents)
print("\n--- NEW RECONCILED METRICS ---")
print(f"Vault Assets: {metrics['vault_total_gold']} Gold")
print(f"Member Liabilities: {metrics['member_liabilities_gold']} Gold")
print(f"Unencumbered Reserves: {metrics['bank_reserves_gold']} Gold (Includes {metrics['unencumbered_capital_gold']} Gold War Chest)")
solvency = round((metrics['vault_total_gold'] / metrics['member_liabilities_gold']) * 100.0, 1)
print(f"Solvency Ratio: {solvency}%")
