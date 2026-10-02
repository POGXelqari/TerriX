#!/usr/bin/env python3
"""
CBM Administrative PIN Reset Utility
====================================
Sets or resets a member's Access PIN across both the local SQLite database
(cbm_data.db) and remote Supabase PostgreSQL (cbm_accounts).

Usage:
    python set_pin.py [username] [pin]
    python set_pin.py v1ktorexe 0000
"""

import os
import sys
import time
import secrets
import hashlib
import sqlite3
import urllib.parse

# 1. Load environment variables (.env)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from db_layer import CBMDatabase


def hash_pin(pin: str, salt: str = None) -> tuple[str, str]:
    """Generates PBKDF2-HMAC-SHA256 hash matching CBM's internal standard."""
    if not salt:
        salt = secrets.token_hex(16)
    pin_clean = str(pin).strip()
    h = hashlib.pbkdf2_hmac(
        "sha256",
        pin_clean.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()
    return h, salt


def update_sqlite(db: CBMDatabase, username: str, pin_hash: str, salt: str) -> bool:
    """Updates or inserts the account and PIN credentials in local SQLite."""
    now = time.time()
    conn = db.get_write_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT account_name FROM cbm_accounts WHERE account_name = ? COLLATE NOCASE", (username,))
        row = cur.fetchone()

        if row:
            actual_username = row[0]
            cur.execute("""
                UPDATE cbm_accounts
                SET pin_hash = ?, salt = ?, is_verified = 1, updated_at = ?
                WHERE account_name = ?
            """, (pin_hash, salt, now, actual_username))
            print(f"[✓] SQLite: Updated PIN for existing account '{actual_username}'.")
        else:
            cur.execute("""
                INSERT INTO cbm_accounts (
                    account_name, display_name, pin_hash, salt, is_verified,
                    clan_tag, role, deposited_cents, total_deposited_cents,
                    total_withdrawn_cents, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 1, 'ANTI-OG', 'member', 0, 0, 0, ?, ?)
            """, (username, username, pin_hash, salt, now, now))
            print(f"[✓] SQLite: Created account '{username}' with configured PIN.")

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"[!] SQLite Error: {e}")
        return False
    finally:
        conn.close()


def update_supabase(db: CBMDatabase, username: str, pin_hash: str, salt: str) -> bool:
    """
    Directly updates Supabase via PostgREST without passing through the asynchronous
    sanitization queue (which strips credential hashes for Zero-Knowledge cloud isolation).
    """
    if not db.use_supabase:
        print("[*] Supabase: Skipped (SUPABASE_URL and SUPABASE_KEY not configured).")
        return True

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    encoded_user = urllib.parse.quote(username)

    # 1. Attempt PATCH on existing account
    status, res = db._sb_request(
        "cbm_accounts",
        method="PATCH",
        params=f"?account_name=ilike.{encoded_user}",
        body={
            "pin_hash": pin_hash,
            "salt": salt,
            "is_verified": True,
            "updated_at": now_iso
        }
    )

    if status in (200, 204) and res:
        print(f"[✓] Supabase: Successfully updated PIN for '{username}' (HTTP {status}).")
        return True

    # 2. If record does not exist on Supabase, upsert the account
    status, res = db._sb_request(
        "cbm_accounts",
        method="POST",
        body={
            "account_name": username,
            "display_name": username,
            "pin_hash": pin_hash,
            "salt": salt,
            "is_verified": True,
            "clan_tag": "ANTI-OG",
            "role": "member",
            "deposited_cents": 0,
            "total_deposited_cents": 0,
            "total_withdrawn_cents": 0,
            "created_at": now_iso,
            "updated_at": now_iso
        },
        upsert=True
    )

    if status in (200, 201, 204):
        print(f"[✓] Supabase: Upserted account '{username}' with PIN (HTTP {status}).")
        return True
    else:
        print(f"[!] Supabase Warning: Received HTTP {status}: {res}")
        return False


def main():
    username = sys.argv[1].strip() if len(sys.argv) > 1 else "v1ktorexe"
    new_pin = sys.argv[2].strip() if len(sys.argv) > 2 else "0000"

    print("=" * 60)
    print("  CBM Admin: Direct PIN Provisioning")
    print(f"  Target User : {username}")
    print(f"  Target PIN  : {new_pin}")
    print("=" * 60)

    db = CBMDatabase()

    # Generate PBKDF2 salt and hash (100,000 rounds)
    pin_hash, salt = hash_pin(new_pin)

    # 1. Update local database
    ok_sqlite = update_sqlite(db, username, pin_hash, salt)

    # 2. Update Supabase
    ok_sb = update_supabase(db, username, pin_hash, salt)

    # 3. Clear rate limiting failure lockouts if any were recorded
    try:
        from rate_limiter import rate_limiter
        if rate_limiter:
            rate_limiter.record_auth_success(username)
            print(f"[✓] Rate Limiter: Cleared any failed attempt lockouts for '{username}'.")
    except Exception:
        pass

    # 4. Immediate self-test validation
    if db.verify_account_pin(username, new_pin):
        print("\n[SUCCESS] Verification passed: 'verify_account_pin' succeeded with the new PIN.")
    else:
        print("\n[!] Warning: Verification check failed. Check database connectivity.")


if __name__ == "__main__":
    main()