#!/usr/bin/env python3
"""
CBM Administrative Utility: Reset B8bbq PIN
===========================================
Sets the CBM Access PIN for the 'B8bbq' account to '0000' across both:
1. Local SQLite database (cbm_data.db)
2. Remote Supabase PostgreSQL instance (cbm_accounts)

Usage:
    python reset_b8bbq_pin.py
"""

import os
import sys
import time
import secrets
import hashlib
import sqlite3
import urllib.parse

# Load environment configuration (.env)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from db_layer import CBMDatabase

TARGET_USER = "B8bbq"
TARGET_PIN = "0000"


def generate_pin_hash(pin: str, salt: str = None) -> tuple[str, str]:
    """Generates the PBKDF2-HMAC-SHA256 hash matching CBM's internal standard."""
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


def update_sqlite_pin(db: CBMDatabase, username: str, pin_hash: str, salt: str) -> bool:
    """Updates B8bbq's PIN in the local SQLite database."""
    now = time.time()
    conn = db.get_write_connection()
    cur = conn.cursor()
    try:
        # Case-insensitive lookup
        cur.execute("SELECT account_name FROM cbm_accounts WHERE account_name = ? COLLATE NOCASE", (username,))
        row = cur.fetchone()

        if row:
            canonical_name = row[0]
            cur.execute("""
                UPDATE cbm_accounts
                SET pin_hash = ?, salt = ?, is_verified = 1, updated_at = ?
                WHERE account_name = ?
            """, (pin_hash, salt, now, canonical_name))
            print(f"[✓] SQLite: Updated PIN for account '{canonical_name}'.")
        else:
            cur.execute("""
                INSERT INTO cbm_accounts (
                    account_name, display_name, pin_hash, salt, is_verified,
                    clan_tag, role, deposited_cents, total_deposited_cents,
                    total_withdrawn_cents, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 1, 'ANTI-OG', 'admin', 0, 0, 0, ?, ?)
            """, (username, username, pin_hash, salt, now, now))
            print(f"[✓] SQLite: Seeded account '{username}' with admin role and PIN.")

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"[!] SQLite Update Error: {e}")
        return False
    finally:
        conn.close()


def update_supabase_pin(db: CBMDatabase, username: str, pin_hash: str, salt: str) -> bool:
    """
    Directly updates Supabase via PostgREST.
    Bypasses _enqueue_sb_task() to ensure the pin_hash is committed rather than
    stripped by the background zero-knowledge sanitization queue.
    """
    if not db.use_supabase:
        print("[*] Supabase: Skipped (SUPABASE_URL and SUPABASE_KEY not configured).")
        return True

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    encoded_user = urllib.parse.quote(username)

    # 1. Attempt PATCH on existing record
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

    # 2. If record does not exist on Supabase, insert/upsert
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
            "role": "admin",
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
        print(f"[!] Supabase Warning: HTTP {status} returned: {res}")
        return False


def main():
    print("=" * 60)
    print("  CBM Admin: Resetting PIN for B8bbq")
    print(f"  Target User : {TARGET_USER}")
    print(f"  New PIN     : {TARGET_PIN}")
    print("=" * 60)

    db = CBMDatabase()

    # Generate salt and PBKDF2 hash (100,000 rounds)
    pin_hash, salt = generate_pin_hash(TARGET_PIN)

    # 1. Update SQLite
    update_sqlite_pin(db, TARGET_USER, pin_hash, salt)

    # 2. Update Supabase
    update_supabase_pin(db, TARGET_USER, pin_hash, salt)

    # 3. Clear rate limiter failure lockout if present
    try:
        from rate_limiter import rate_limiter
        if rate_limiter:
            rate_limiter.record_auth_success(TARGET_USER)
            print(f"[✓] Rate Limiter: Cleared any failed attempt lockouts for '{TARGET_USER}'.")
    except Exception:
        pass

    # 4. Invalidate memory negative caches if active
    if hasattr(db, "_clear_missing_account_cache"):
        db._clear_missing_account_cache(TARGET_USER)

    # 5. Verify the updated PIN
    if db.verify_account_pin(TARGET_USER, TARGET_PIN):
        print(f"\n[SUCCESS] PIN for '{TARGET_USER}' verified successfully as '{TARGET_PIN}'.")
    else:
        print(f"\n[!] Verification check failed. Verify database connectivity and file permissions.")


if __name__ == "__main__":
    main()