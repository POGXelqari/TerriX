import sys, os
sys.path.insert(0, r'g:\TerriX\cbm_wispbyte')
from db_layer import CBMDatabase

db = CBMDatabase()
print("use_supabase:", db.use_supabase)

st, accs = db._sb_request("cbm_accounts", method="GET", params="?select=*")
print("Accounts:", len(accs) if isinstance(accs, list) else accs)
total_liab = 0
if isinstance(accs, list):
    for a in accs:
        dep = a.get('deposited_cents', 0)
        total_liab += dep
        print(f"  {a.get('account_name')}: deposited={dep} ({dep/100.0} Gold)")
print(f"Total Member Liabilities across accounts: {total_liab} cents ({total_liab/100.0} Gold)")

st_d, dons = db._sb_request("cbm_donations", method="GET", params="?select=*")
print("Donations:", len(dons) if isinstance(dons, list) else dons)
if isinstance(dons, list):
    for d in dons:
        print(f"  {d.get('donor_name') or d.get('account_name')}: amount={d.get('amount_cents')} ({d.get('amount_cents',0)/100.0} Gold)")

treasury = db.get_treasury()
print("Treasury record:", treasury)
metrics = db._calculate_treasury_metrics(treasury.get("vault_total_gold_cents", 0))
print("Calculated metrics:", metrics)
