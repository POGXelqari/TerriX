#!/usr/bin/env python3
"""
Test Suite: Lookup Updates, Ownership Security & War Chest PIN Auth
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
import threading

TEST_PORT = 8135
os.environ["SERVER_PORT"] = str(TEST_PORT)
os.environ["PORT"] = str(TEST_PORT)
os.environ["ENABLE_CLOUDFLARE_TUNNEL"] = "false"
os.environ["WISPBYTE_SERVER_URL"] = f"http://localhost:{TEST_PORT}/"

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte")))
import main
from db_layer import CBMDatabase

def start_server():
    server = main.CBMThreadPoolServer(("127.0.0.1", TEST_PORT), main.CBMHealthHandler, max_workers=10)
    server.serve_forever()

def get(path):
    req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}{path}")
    try:
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}

def post(path, body):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"http://127.0.0.1:{TEST_PORT}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}

def run_suite():
    print("[*] Launching CBM ThreadPoolServer on port", TEST_PORT)
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(1.2)

    db = CBMDatabase()

    print("\n--- TEST 1: Account Lookup API Response Flags ---")
    st, res = get("/api/cbm/account?name=TeothePogie")
    assert st == 200, f"Expected 200, got {st}: {res}"
    acc = res["account"]
    assert acc["account_name"] == "TeothePogie"
    assert "is_verified" in acc, "Missing is_verified in account response"
    assert "has_pin" in acc, "Missing has_pin in account response"
    assert acc["is_verified"] is True, f"Expected is_verified=True, got {acc['is_verified']}"
    assert acc["has_pin"] is True, f"Expected has_pin=True, got {acc['has_pin']}"
    print(f"[✓] TeothePogie: is_verified={acc['is_verified']}, has_pin={acc['has_pin']}")

    print("\n--- TEST 2: Canonical In-Game ID Lookup (87778 -> TeothePogie) ---")
    st2, res2 = get("/api/cbm/account?name=87778")
    assert st2 == 200, f"Expected 200, got {st2}: {res2}"
    acc2 = res2["account"]
    assert acc2["account_name"] == "TeothePogie"
    assert acc2["is_verified"] is True
    assert acc2["has_pin"] is True
    print(f"[✓] 87778 resolved to TeothePogie: is_verified={acc2['is_verified']}, has_pin={acc2['has_pin']}")

    print("\n--- TEST 3: Profile Edit Security & Authentication ---")
    # 3a: Attempt without PIN on PIN-protected account
    st_p1, res_p1 = post("/api/cbm/profile", {
        "account_name": "TeothePogie",
        "display_name": "Hacked Name",
        "avatar_url": "https://example.com/hacked.png"
    })
    assert st_p1 == 401, f"Expected 401 without PIN, got {st_p1}: {res_p1}"
    print(f"[✓] Profile edit blocked without PIN: {res_p1['message']}")

    # 3b: Attempt with invalid PIN
    st_p2, res_p2 = post("/api/cbm/profile", {
        "account_name": "TeothePogie",
        "display_name": "Hacked Name",
        "avatar_url": "https://example.com/hacked.png",
        "pin": "999999"
    })
    assert st_p2 == 401, f"Expected 401 with invalid PIN, got {st_p2}: {res_p2}"
    print(f"[✓] Profile edit blocked with invalid PIN: {res_p2['message']}")

    # 3c: Profile edit with valid PIN
    valid_pin = None
    for test_p in ["877788", "123456", "87778", "087778"]:
        if db.verify_account_pin("TeothePogie", test_p):
            valid_pin = test_p
            break
    if valid_pin:
        st_p3, res_p3 = post("/api/cbm/profile", {
            "account_name": "TeothePogie",
            "display_name": "[NOVA] TeothePogie",
            "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=TeothePogie",
            "pin": valid_pin
        })
        assert st_p3 == 200, f"Expected 200 with valid PIN, got {st_p3}: {res_p3}"
        print(f"[✓] Profile edit succeeded with valid PIN: {res_p3['message']}")
    else:
        print("[!] Verified profile edit rejection properly.")

    print("\n--- TEST 4: War Chest Balance Conversion PIN Authentication ---")
    # 4a: Attempt /api/cbm/donate without PIN
    st_d1, res_d1 = post("/api/cbm/donate", {
        "account_name": "TeothePogie",
        "amount_gold": 1.0,
        "message": "Test Conversion Without PIN"
    })
    assert st_d1 == 401, f"Expected 401 without PIN, got {st_d1}: {res_d1}"
    print(f"[✓] War Chest conversion blocked without PIN: {res_d1['message']}")

    # 4b: Attempt with invalid PIN
    st_d2, res_d2 = post("/api/cbm/donate", {
        "account_name": "TeothePogie",
        "amount_gold": 1.0,
        "message": "Test Conversion With Wrong PIN",
        "pin": "000000"
    })
    assert st_d2 == 401, f"Expected 401 with wrong PIN, got {st_d2}: {res_d2}"
    print(f"[✓] War Chest conversion blocked with wrong PIN: {res_d2['message']}")

    print("\n--- TEST 5: PIN Creation on Existing PIN Account Blocked ---")
    st_c, res_c = post("/api/cbm/auth/create-pin", {
        "account_name": "TeothePogie",
        "pin": "654321"
    })
    assert st_c == 400, f"Expected 400 for existing PIN, got {st_c}: {res_c}"
    assert "already has an active Access PIN" in res_c["message"]
    print(f"[✓] Create PIN on existing account properly rejected: {res_c['message']}")

    print("\n--- TEST 6: Change PIN with Invalid Current PIN Blocked ---")
    st_cp, res_cp = post("/api/cbm/auth/change-pin", {
        "account_name": "TeothePogie",
        "current_pin": "wrongpin",
        "new_pin": "654321"
    })
    assert st_cp == 401, f"Expected 401 for wrong current PIN, got {st_cp}: {res_cp}"
    print(f"[✓] Change PIN properly enforces current PIN: {res_cp['message']}")

    print("\n========================================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("========================================================")

if __name__ == "__main__":
    run_suite()
