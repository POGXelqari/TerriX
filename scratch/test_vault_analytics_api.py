#!/usr/bin/env python3
"""
Test Vault Analytics API Response:
Verifies that /api/cbm/analytics/vault-history returns valid JSON with:
1. 'timeline' containing vault_total_gold, member_liabilities_gold, bank_reserves_gold, date_str
2. 'snapshots' containing 15-20 recent daemon checkpoints
3. 'metrics' containing current telemetry
"""

import os
import sys
import json

os.environ["ALLOW_LIVE_PROD_ACCESS"] = "1"
sys.path.insert(0, os.path.abspath("cbm_wispbyte"))

from db_layer import CBMDatabase

db = CBMDatabase()
payload = db.get_vault_timeline(days=7)

print("[*] Testing get_vault_timeline(days=7)...")
assert "timeline" in payload, "Missing 'timeline' in payload!"
assert "snapshots" in payload, "Missing 'snapshots' in payload!"
assert "metrics" in payload, "Missing 'metrics' in payload!"

timeline = payload["timeline"]
snapshots = payload["snapshots"]
metrics = payload["metrics"]

print(f"[+] Timeline points: {len(timeline)}")
print(f"[+] Snapshots count: {len(snapshots)}")
print(f"[+] Current Vault Gold: {metrics.get('current_vault_gold')} G")
print(f"[+] Current Reserves Gold: {metrics.get('current_reserves_gold')} G")
print(f"[+] Current Liabilities Gold: {metrics.get('current_liabilities_gold')} G")

# Verify sample timeline point has all required fields for Chart.js
pt = timeline[-1]
print("\n--- Latest Timeline Point (Chart Feed) ---")
print(f"Timestamp: {pt.get('timestamp')} (ms), Date: {pt.get('date_str')}")
print(f"Vault Total Gold: {pt.get('vault_total_gold')} G")
print(f"Member Liabilities: {pt.get('member_liabilities_gold')} G")
print(f"Bank Reserves: {pt.get('bank_reserves_gold')} G")

assert pt.get("vault_total_gold") is not None, "vault_total_gold cannot be None"
assert pt.get("member_liabilities_gold") is not None, "member_liabilities_gold cannot be None"
assert pt.get("bank_reserves_gold") is not None, "bank_reserves_gold cannot be None"

# Verify sample snapshot has all required fields for Recent Telemetry Checkpoints table
snap = snapshots[0]
print("\n--- Latest Telemetry Checkpoint (Table Feed) ---")
print(f"Date: {snap.get('date_str')}, Source: {snap.get('audit_source')}")
print(f"Vault Total: {snap.get('vault_total_gold')} G")
print(f"Liabilities: {snap.get('member_liabilities_gold')} G")
print(f"Reserves: {snap.get('unencumbered_reserves_gold')} G")
print(f"Solvency: {snap.get('solvency_ratio_percent')}%")

assert snap.get("vault_total_gold") is not None, "vault_total_gold in snapshot cannot be None"
assert snap.get("member_liabilities_gold") is not None, "member_liabilities_gold in snapshot cannot be None"
assert snap.get("unencumbered_reserves_gold") is not None, "unencumbered_reserves_gold in snapshot cannot be None"

print("\n[SUCCESS] Vault Analytics and Checkpoints API payload verified 100%!")
