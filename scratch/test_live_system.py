#!/usr/bin/env python3
"""
End-to-End Live System Verification Test
Validates:
1. All static routes (/login, /register, /donations, /cbm, /rulebook)
2. User registration with mandatory avatar, password, and primary territorial account
3. Adaptive login (Password & Quick PIN)
4. Model 3 Web-Declared In-Game Donation Slips (declaration & retrieval)
"""

import urllib.request
import urllib.error
import json
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = "http://localhost:8123"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "TestRunner/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15.0) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")

def post(path, payload):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "TestRunner/1.0"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}

def main():
    print("=== STARTING CBM LIVE SYSTEM VERIFICATION ===")
    
    # 1. Test Static Routes
    print("\n[1] Testing Dedicated Modular HTML Routes...")
    pages = [
        ("/login", "Sign in to manage your Gold"),
        ("/login.html", "Welcome Back"),
        ("/register", "Create CBM Account"),
        ("/register.html", "Territorial.io Account Password"),
        ("/donations", "Clan War Chest Hub"),
        ("/donations.html", "In-Game Transfer Slip"),
        ("/cbm.html", "Clan Bank Manager"),
        ("/rulebook.html", "Rulebook")
    ]
    for path, expected_text in pages:
        st, body = get(path)
        print(f"  -> GET {path}: HTTP {st}")
        assert st == 200, f"Failed GET {path}: {st}"
        assert expected_text in body, f"Expected '{expected_text}' in {path}"
    print("  [PASS] All dedicated pages serve valid HTML and 200 OK.")

    # 2. Test Registration Flow
    print("\n[2] Testing Member Registration (/api/cbm/auth/register)...")
    test_user = f"LiveMember_{int(time.time())}"
    test_pass = "TestMasterPassword99!"
    test_pin = "445566"
    test_terri = "B8bbq"
    avatar_url = "https://api.dicebear.com/7.x/identicon/svg?seed=live-test"

    reg_payload = {
        "username": test_user,
        "password": test_pass,
        "avatar_url": avatar_url,
        "primary_territorial_account": test_terri,
        "pin": test_pin
    }
    st, res = post("/api/cbm/auth/register", reg_payload)
    print(f"  -> Registering '{test_user}': HTTP {st}, response: {res.get('status')}")
    assert st == 200 and res.get("status") == "ok", f"Registration failed: {res}"
    acc = res.get("account", {})
    assert acc.get("account_name") == test_user
    assert acc.get("has_password") is True
    assert acc.get("has_pin") is True
    print("  [PASS] Registration verified successfully with password and PIN.")

    # 3. Test Adaptive Login
    print("\n[3] Testing Adaptive Login (/api/cbm/auth/login)...")
    
    # 3a. Login via Password
    st_pwd, res_pwd = post("/api/cbm/auth/login", {"username": test_user, "password": test_pass})
    print(f"  -> Password Login: HTTP {st_pwd}, auth_method: {res_pwd.get('auth_method')}")
    assert st_pwd == 200 and res_pwd.get("auth_method") == "PASSWORD"

    # 3b. Login via Wrong Password
    st_wp, res_wp = post("/api/cbm/auth/login", {"username": test_user, "password": "BadPassword123"})
    print(f"  -> Wrong Password Login (should be 401): HTTP {st_wp}")
    assert st_wp == 401

    # 3c. Login via Quick PIN
    st_pin, res_pin = post("/api/cbm/auth/login", {"username": test_user, "pin": test_pin})
    print(f"  -> Quick PIN Login: HTTP {st_pin}, auth_method: {res_pin.get('auth_method')}")
    assert st_pin == 200 and res_pin.get("auth_method") == "PIN"

    # 3d. Login via Wrong PIN
    st_wpin, res_wpin = post("/api/cbm/auth/login", {"username": test_user, "pin": "000000"})
    print(f"  -> Wrong PIN Login (should be 401): HTTP {st_wpin}")
    assert st_wpin == 401
    print("  [PASS] Adaptive login methods (Password & PIN) fully validated.")

    # 4. Test Model 3 In-Game Donation Slips
    print("\n[4] Testing Model 3 Donation Slips (/api/cbm/donations/declare)...")
    slip_payload = {
        "account_name": test_user,
        "amount_gold": 12.50,
        "message": "ANTI-OG War Chest Contribution",
        "ttl_minutes": 15
    }
    st_slip, res_slip = post("/api/cbm/donations/declare", slip_payload)
    print(f"  -> Declaring Donation Slip: HTTP {st_slip}, status: {res_slip.get('status')}")
    assert st_slip == 200 and res_slip.get("status") == "ok"
    slip = res_slip.get("slip", {})
    assert slip.get("amount_cents") == 1250
    assert slip.get("status") == "PENDING"
    print(f"  -> Active Slip ID: {slip.get('id')}, Remaining: {slip.get('remaining_seconds')}s")

    # 4b. Query Active Pending Slips
    st_q, res_q = get(f"/api/cbm/donations/pending?account={test_user}")
    print(f"  -> Querying Pending Slips: HTTP {st_q}")
    assert st_q == 200
    data_q = json.loads(res_q)
    pending_list = data_q.get("pending_donations", [])
    assert any(p["id"] == slip["id"] for p in pending_list), "Declared slip not found in pending list!"
    print("  [PASS] Model 3 Donation Slips active and queryable.")

    print("\n=== ALL E2E VERIFICATION CHECKS PASSED PERFECTLY ===")

if __name__ == "__main__":
    main()
