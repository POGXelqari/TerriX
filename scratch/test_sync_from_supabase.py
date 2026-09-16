import os
import sys
import json
import sqlite3
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('cbm_wispbyte/.env')
sys.path.insert(0, 'cbm_wispbyte')
from db_layer import CBMDatabase

os.environ['ALLOW_LIVE_PROD_ACCESS'] = '1'
db = CBMDatabase('cbm_wispbyte/cbm_data.db', use_supabase=True)

def parse_iso(val):
    if not val:
        return time.time()
    if isinstance(val, (int, float)):
        return float(val)
    try:
        clean = str(val).replace('Z', '+00:00')
        return datetime.fromisoformat(clean).timestamp()
    except Exception:
        return time.time()

print("--- HYDRATING SQLITE FROM SUPABASE ---")
conn = sqlite3.connect('cbm_wispbyte/cbm_data.db')
cur = conn.cursor()

# 1. Accounts
st, accs = db._sb_request('cbm_accounts', 'GET', '?select=*')
print(f"Supabase accounts returned: {len(accs) if st == 200 else st}")
if st == 200 and isinstance(accs, list):
    for a in accs:
        cur.execute("""
            INSERT INTO cbm_accounts (
                account_name, display_name, clan_tag, role, deposited_cents,
                total_deposited_cents, total_withdrawn_cents, created_at, updated_at,
                avatar_url, pin_hash, salt, is_verified, primary_territorial_account,
                password_hash, password_salt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(account_name) DO UPDATE SET
                display_name = excluded.display_name,
                clan_tag = excluded.clan_tag,
                role = excluded.role,
                deposited_cents = excluded.deposited_cents,
                total_deposited_cents = excluded.total_deposited_cents,
                total_withdrawn_cents = excluded.total_withdrawn_cents,
                avatar_url = excluded.avatar_url,
                pin_hash = COALESCE(excluded.pin_hash, cbm_accounts.pin_hash),
                salt = COALESCE(excluded.salt, cbm_accounts.salt),
                is_verified = excluded.is_verified,
                primary_territorial_account = excluded.primary_territorial_account,
                password_hash = COALESCE(excluded.password_hash, cbm_accounts.password_hash),
                password_salt = COALESCE(excluded.password_salt, cbm_accounts.password_salt),
                updated_at = excluded.updated_at
        """, (
            a.get('account_name'),
            a.get('display_name'),
            a.get('clan_tag', 'ANTI-OG'),
            a.get('role', 'member'),
            int(a.get('deposited_cents') or 0),
            int(a.get('total_deposited_cents') or 0),
            int(a.get('total_withdrawn_cents') or 0),
            parse_iso(a.get('created_at')),
            parse_iso(a.get('updated_at')),
            a.get('avatar_url', ''),
            a.get('pin_hash'),
            a.get('salt'),
            1 if a.get('is_verified') else 0,
            a.get('primary_territorial_account'),
            a.get('password_hash'),
            a.get('password_salt')
        ))
conn.commit()

# 2. Payment Methods
st, pms = db._sb_request('cbm_payment_methods', 'GET', '?select=*')
print(f"Supabase payment methods returned: {len(pms) if st == 200 else st}")
if st == 200 and isinstance(pms, list):
    for p in pms:
        cur.execute("""
            INSERT INTO cbm_payment_methods (
                cbm_username, territorial_account_name, territorial_password,
                display_name, verification_type, status, is_primary,
                total_transacted_gold, linked_at, last_used_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(territorial_account_name) DO UPDATE SET
                cbm_username = excluded.cbm_username,
                territorial_password = COALESCE(excluded.territorial_password, cbm_payment_methods.territorial_password),
                display_name = excluded.display_name,
                verification_type = excluded.verification_type,
                status = excluded.status,
                is_primary = excluded.is_primary,
                total_transacted_gold = excluded.total_transacted_gold,
                last_used_at = excluded.last_used_at
        """, (
            p.get('cbm_username'),
            p.get('territorial_account_name'),
            p.get('territorial_password', ''),
            p.get('display_name', ''),
            p.get('verification_type', 'INPUT_CREDENTIALS'),
            p.get('status', 'VERIFIED'),
            1 if p.get('is_primary') else 0,
            float(p.get('total_transacted_gold') or 0.0),
            parse_iso(p.get('linked_at')),
            parse_iso(p.get('last_used_at'))
        ))
conn.commit()

# 3. Donations
st, dons = db._sb_request('cbm_donations', 'GET', '?select=*')
print(f"Supabase donations returned: {len(dons) if st == 200 else st}")
if st == 200 and isinstance(dons, list):
    for d in dons:
        # Check if already in sqlite
        cur.execute("SELECT 1 FROM cbm_donations WHERE tx_hash = ? AND amount_cents = ?", (d.get('tx_hash'), int(d.get('amount_cents', 0))))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO cbm_donations (
                    donor_name, territorial_account, amount_gold, amount_cents,
                    message, source, tx_hash, is_refundable, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                d.get('donor_name', ''),
                d.get('territorial_account', ''),
                float(d.get('amount_gold', 0.0)),
                int(d.get('amount_cents', 0)),
                d.get('message', ''),
                d.get('source', 'BALANCE'),
                d.get('tx_hash', ''),
                1 if d.get('is_refundable') else 0,
                d.get('status', 'IRREVOCABLE'),
                parse_iso(d.get('created_at'))
            ))
conn.commit()

# 4. Processed Txs
st, txs = db._sb_request('cbm_processed_txs', 'GET', '?select=*')
print(f"Supabase processed_txs returned: {len(txs) if st == 200 else st}")
if st == 200 and isinstance(txs, list):
    for t in txs:
        cur.execute("""
            INSERT OR IGNORE INTO cbm_processed_txs (
                tx_id, timestamp_ms, sender, receiver, amount_gold, fee_gold, credited_account, processed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t.get('tx_id'),
            int(t.get('timestamp_ms') or 0),
            t.get('sender') or t.get('sender_account', ''),
            t.get('receiver') or t.get('receiver_account', ''),
            float(t.get('amount_gold') or 0.0),
            float(t.get('fee_gold') or 0.0),
            t.get('credited_account', ''),
            parse_iso(t.get('processed_at'))
        ))
conn.commit()

# 5. Ledger
st, ledger = db._sb_request('cbm_ledger', 'GET', '?select=*')
print(f"Supabase ledger returned: {len(ledger) if st == 200 else st}")
if st == 200 and isinstance(ledger, list):
    for l in ledger:
        cur.execute("SELECT 1 FROM cbm_ledger WHERE tx_hash = ? AND entry_type = ?", (l.get('tx_hash'), l.get('entry_type')))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO cbm_ledger (
                    account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                l.get('account_name'),
                l.get('entry_type'),
                int(l.get('amount_cents') or 0),
                int(l.get('balance_after_cents') or 0),
                l.get('tx_hash', ''),
                l.get('notes', ''),
                parse_iso(l.get('created_at'))
            ))
conn.commit()

# 6. Vault Snapshots
st, snaps = db._sb_request('cbm_vault_snapshots', 'GET', '?select=*&order=timestamp_epoch.desc&limit=1000')
print(f"Supabase vault_snapshots returned: {len(snaps) if st == 200 else st}")
if st == 200 and isinstance(snaps, list):
    for s in snaps:
        cur.execute("SELECT 1 FROM cbm_vault_snapshots WHERE timestamp_epoch = ?", (float(s.get('timestamp_epoch', 0)),))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO cbm_vault_snapshots (
                    timestamp_epoch, vault_total_gold, unencumbered_reserves_gold,
                    member_liabilities_gold, inflow_period_gold, outflow_period_gold,
                    net_flow_gold, tx_count_period, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                float(s.get('timestamp_epoch', 0.0)),
                float(s.get('vault_total_gold', 0.0)),
                float(s.get('unencumbered_reserves_gold', 0.0)),
                float(s.get('member_liabilities_gold', 0.0)),
                float(s.get('inflow_period_gold', 0.0)),
                float(s.get('outflow_period_gold', 0.0)),
                float(s.get('net_flow_gold', 0.0)),
                int(s.get('tx_count_period', 0)),
                parse_iso(s.get('created_at'))
            ))
conn.commit()

# 7. Treasury
st, tr = db._sb_request('cbm_treasury', 'GET', '?id=eq.1&select=*')
print(f"Supabase treasury returned: {tr}")
if st == 200 and isinstance(tr, list) and tr:
    t = tr[0]
    cur.execute("""
        UPDATE cbm_treasury
        SET vault_total_gold_cents = ?,
            member_liabilities_cents = ?,
            bank_reserves_cents = ?,
            unencumbered_capital_cents = ?,
            loan_penalties_cents = ?,
            last_sync_at = ?
        WHERE id = 1
    """, (
        int(t.get('vault_total_gold_cents') or 0),
        int(t.get('member_liabilities_cents') or 0),
        int(t.get('bank_reserves_cents') or 0),
        int(t.get('unencumbered_capital_cents') or 0),
        int(t.get('loan_penalties_cents') or 0),
        parse_iso(t.get('last_sync_at'))
    ))
conn.commit()
conn.close()
print("Hydration complete!")
