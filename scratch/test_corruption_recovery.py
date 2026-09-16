#!/usr/bin/env python3
"""
Test SQLite Corruption Self-Healing:
Simulates a 'database disk image is malformed' error and proves that CBMDatabase
quarantines the bad file and recovers cleanly without crashing.
"""

import os
import sys
import sqlite3

os.environ["ALLOW_LIVE_PROD_ACCESS"] = "1"
sys.path.insert(0, os.path.abspath("cbm_wispbyte"))
from db_layer import CBMDatabase

TEST_CORRUPT_DB = "scratch/test_corrupt.db"

# Clean up before test
for f in [TEST_CORRUPT_DB, f"{TEST_CORRUPT_DB}-wal", f"{TEST_CORRUPT_DB}-shm"]:
    if os.path.exists(f):
        try: os.remove(f)
        except Exception: pass

# 1. Create a completely malformed SQLite file (header valid SQLite format 3, but garbage btree pages)
with open(TEST_CORRUPT_DB, "wb") as f:
    f.write(b"SQLite format 3\x00" + b"\xFF" * 4096)

print("[*] Created malformed SQLite database on disk:", TEST_CORRUPT_DB)

# 2. Now instantiate CBMDatabase pointing directly to the malformed database file!
print("\n[*] Instantiating CBMDatabase on the malformed database...")
db = CBMDatabase(sqlite_path=TEST_CORRUPT_DB)

print("[+] CBMDatabase successfully initialized without crashing!")

# Verify that tables exist and are accessible
conn = sqlite3.connect(TEST_CORRUPT_DB)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in cur.fetchall()]
conn.close()

print(f"[+] Recreated tables: {len(tables)} tables found ({', '.join(tables[:4])}...)")
assert "cbm_accounts" in tables, "cbm_accounts table must exist!"
assert "cbm_treasury" in tables, "cbm_treasury table must exist!"

# Verify that backup file was created
backup_files = [f for f in os.listdir("scratch") if "test_corrupt.db.corrupted" in f]
print(f"[+] Quarantined backup files found: {backup_files}")
assert len(backup_files) > 0, "Quarantined corrupted file must be backed up!"

# Clean up
for f in backup_files:
    try: os.remove(os.path.join("scratch", f))
    except Exception: pass
for f in [TEST_CORRUPT_DB, f"{TEST_CORRUPT_DB}-wal", f"{TEST_CORRUPT_DB}-shm"]:
    if os.path.exists(f):
        try: os.remove(f)
        except Exception: pass

print("\n[SUCCESS] Self-healing from 'database disk image is malformed' verified 100%!")

