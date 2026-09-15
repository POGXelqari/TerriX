import sqlite3
import os
import sys
import json
sys.path.insert(0, '.')
from cbm_wispbyte.db_layer import CBMDatabase

# 1. Reset in local SQLite (cbm_wispbyte/cbm_data.db and cbm_data.db)
for db_file in ['cbm_wispbyte/cbm_data.db', 'cbm_data.db']:
    if os.path.exists(db_file):
        conn = sqlite3.connect(db_file)
        cur = conn.cursor()
        cur.execute("UPDATE cbm_accounts SET pin_hash = NULL, salt = NULL WHERE account_name = 'B8bbq'")
        conn.commit()
        print(f"Updated {db_file}: rows affected = {cur.rowcount}")
        cur.execute("SELECT account_name, pin_hash, salt, is_verified FROM cbm_accounts WHERE account_name = 'B8bbq'")
        print("Row after reset:", cur.fetchone())
        conn.close()

# 2. Reset in Supabase
db = CBMDatabase()
if db.use_supabase:
    st, resp = db._sb_request("cbm_accounts", method="PATCH", params="?account_name=eq.B8bbq", body={
        "pin_hash": None,
        "salt": None
    })
    print(f"Supabase reset status: {st}, response: {resp}")

# 3. Verify get_account
acc = db.get_account('B8bbq')
print("Sanitized get_account('B8bbq'):")
print(json.dumps(acc, indent=2))
