import os
import sys
import json
from dotenv import load_dotenv

load_dotenv('cbm_wispbyte/.env')
sys.path.insert(0, 'cbm_wispbyte')
from db_layer import CBMDatabase

os.environ['ALLOW_LIVE_PROD_ACCESS'] = '1'
db = CBMDatabase('cbm_wispbyte/cbm_data.db', use_supabase=True)

st, accs = db._sb_request('cbm_accounts', method='GET', params='?select=*')
print(f'Total Supabase accounts: {len(accs)}')
for a in accs:
    print(f"Account: {a.get('account_name')} | Display: {a.get('display_name')} | Primary: {a.get('primary_territorial_account')} | DepCents: {a.get('deposited_cents')} | PIN: {bool(a.get('pin_hash'))} | PWD: {bool(a.get('password_hash'))}")

st, pms = db._sb_request('cbm_payment_methods', method='GET', params='?select=*')
print(f'\nTotal Supabase payment methods: {len(pms)}')
for p in pms:
    print(f"PM: User={p.get('cbm_username')} | Terri={p.get('territorial_account_name')} | Display={p.get('display_name')}")

st, dons = db._sb_request('cbm_donations', method='GET', params='?select=*')
print(f'\nTotal Supabase donations: {len(dons)}')
for d in dons:
    print(f"Donation: {d.get('donor_name')} | Gold={d.get('amount_gold')} | Msg={d.get('message')}")

st, tr = db._sb_request('cbm_treasury', method='GET', params='?id=eq.1&select=*')
print(f'\nSupabase Treasury: {tr}')
