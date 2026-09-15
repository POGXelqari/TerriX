import sqlite3

conn = sqlite3.connect('cbm_wispbyte/cbm_data.db')
cur = conn.cursor()
cur.execute("SELECT * FROM cbm_accounts WHERE account_name = 'B8bbq'")
row = cur.fetchone()
cols = [d[0] for d in cur.description]
print("B8bbq in cbm_wispbyte/cbm_data.db:")
for c, val in zip(cols, row):
    print(f"  {c}: {val}")
