import sys
sys.path.insert(0, 'cbm_wispbyte')
from db_layer import CBMDatabase
import sqlite3

db = CBMDatabase('cbm_wispbyte/cbm_data.db')
print('Before test, has_pin:', db.has_account_pin('B8bbq'))

# Test setting a new PIN without current_pin
ok, msg = db.set_account_pin('B8bbq', '998877')
print('Set PIN result:', ok, msg)
assert ok, 'Failed to set new PIN'
print('After test, has_pin:', db.has_account_pin('B8bbq'))
print('Verify 998877:', db.verify_account_pin('B8bbq', '998877'))

# Now reset it back so B8bbq is completely fresh for the user!
conn = sqlite3.connect('cbm_wispbyte/cbm_data.db')
cur = conn.cursor()
cur.execute("UPDATE cbm_accounts SET pin_hash = NULL, salt = NULL WHERE account_name = 'B8bbq'")
conn.commit()
conn.close()

if db.use_supabase:
    db._sb_request('cbm_accounts', method='PATCH', params='?account_name=eq.B8bbq', body={'pin_hash': None, 'salt': None})

print('Reset back to fresh: has_pin =', db.has_account_pin('B8bbq'))
