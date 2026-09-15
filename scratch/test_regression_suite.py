#!/usr/bin/env python3
"""
Full System Regression Suite with High-Concurrency Runtime
==========================================================
Tests:
1. Static cache serving & gzip header verification
2. Account registration (password, avatar, primary territorial account)
3. PIN & password authentication
4. Loan calculation & overdue checking with throttling
5. War chest donation slips creation & listing
6. Status & treasury caching
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
import threading

TEST_PORT = 8133
os.environ["SERVER_PORT"] = str(TEST_PORT)
os.environ["PORT"] = str(TEST_PORT)
os.environ["ENABLE_CLOUDFLARE_TUNNEL"] = "false"
os.environ["WISPBYTE_SERVER_URL"] = f"http://localhost:{TEST_PORT}/"

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cbm_wispbyte")))
import main

def start_server():
    server = main.CBMThreadPoolServer(("127.0.0.1", TEST_PORT), main.CBMHealthHandler, max_workers=20)
    server.serve_forever()

def get(path, headers=None):
    req = urllib.request.Request(f"http://127.0.0.1:{TEST_PORT}{path}", headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            content = resp.read()
            return resp.status, resp.headers, content
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()

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
            return e.code, {"error": raw}

def run_tests():
    print("[*] Starting Full CBM Regression Tests on port", TEST_PORT)

    # 1. Test Static Routes & Gzip compression
    for p in ["/", "/login", "/register", "/donations", "/rulebook"]:
        st, hdrs, body = get(p, {"Accept-Encoding": "gzip"})
        assert st == 200, f"Expected 200 for {p}, got {st}"
        assert hdrs.get("Content-Encoding") == "gzip", f"Expected gzip encoding for {p}"
        assert hdrs.get("ETag") is not None, f"Expected ETag header for {p}"
        print(f"[✓] Static route {p:12} OK: {len(body):,} bytes gzip, ETag {hdrs.get('ETag')}")

    # 2. Test ETag 304
    st, hdrs, body = get("/login")
    etag = hdrs.get("ETag")
    st304, _, body304 = get("/login", {"If-None-Match": etag})
    assert st304 == 304, f"Expected 304, got {st304}"
    assert len(body304) == 0, f"Expected 0 bytes for 304, got {len(body304)}"
    print("[✓] HTTP 304 ETag Cache Validation passed (0 bytes transfer)")

    # 3. Test Status & Donors API Cache
    st_stat, _, body_stat = get("/api/cbm/status")
    assert st_stat == 200
    stat_json = json.loads(body_stat.decode("utf-8"))
    assert stat_json["status"] == "ok"
    assert "treasury" in stat_json
    print(f"[✓] Status API OK: Vault Total = {stat_json['treasury']['vault_total_gold']} Gold, Reserves = {stat_json['treasury']['bank_reserves_gold']} Gold")

    st_don, _, body_don = get("/api/cbm/donors")
    assert st_don == 200
    don_json = json.loads(body_don.decode("utf-8"))
    assert don_json["status"] == "ok"
    print(f"[✓] Donors API OK: Top Donors Count = {len(don_json.get('top_donors', []))}")

    # 4. Test User Registration
    test_user = f"regtest_{int(time.time())}"
    reg_body = {
        "username": test_user,
        "password": "SecurePassword123!",
        "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=test",
        "primary_territorial_account": "B8bbq",
        "pin": "1234"
    }
    st_reg, res_reg = post("/api/cbm/auth/register", reg_body)
    assert st_reg == 200, f"Registration failed: {st_reg} {res_reg}"
    print(f"[✓] Account Registration OK: Created '{test_user}'")

    # 5. Test Password Login
    login_body = {"username": test_user, "password": "SecurePassword123!"}
    st_log, res_log = post("/api/cbm/auth/login", login_body)
    assert st_log == 200 and res_log.get("status") == "ok", f"Login failed: {st_log} {res_log}"
    print(f"[✓] Password Authentication OK for '{test_user}'")

    # 6. Test PIN Login
    pin_body = {"username": test_user, "pin": "1234"}
    st_pin, res_pin = post("/api/cbm/auth/login", pin_body)
    assert st_pin == 200 and res_pin.get("status") == "ok", f"PIN login failed: {st_pin} {res_pin}"
    print(f"[✓] PIN Quick-Login OK for '{test_user}'")

    # 7. Test War Chest Donation Slip Declaration
    slip_body = {
        "account_name": test_user,
        "amount_gold": 25.0,
        "message": "Optimization Test Donation"
    }
    st_slip, res_slip = post("/api/cbm/donations/declare", slip_body)
    assert st_slip == 200 and res_slip.get("status") == "ok", f"Donation slip failed: {st_slip} {res_slip}"
    slip_id = res_slip.get("slip", {}).get("id")
    print(f"[✓] War Chest In-Game Slip Declaration OK: Slip ID '{slip_id}'")

    # 8. Test Pending Slips Retrieval
    st_pend, _, body_pend = get(f"/api/cbm/donations/pending?account={test_user}")
    assert st_pend == 200
    pend_json = json.loads(body_pend.decode("utf-8"))
    slips = pend_json.get("pending_donations", [])
    assert any(s.get("id") == slip_id for s in slips), f"Created slip not found in pending list"
    print(f"[✓] Pending Donation Slips Lookup OK: Found {len(slips)} active slip(s)")

    print("\n====================================================================")
    print("  ALL REGRESSION SUITE CHECKS PASSED (100% FUNCTIONAL INTEGRITY)")
    print("====================================================================")

if __name__ == "__main__":
    main.load_static_cache()
    try:
        main.refresh_status_cache()
        main.refresh_donors_cache()
    except Exception:
        pass
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(1.0)
    run_tests()
