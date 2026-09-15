#!/usr/bin/env python3
"""
Test HTTP endpoints for Create PIN and Change PIN on dev server
"""
import urllib.request
import urllib.error
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_URL = "http://localhost:8123/api/cbm"

def post_json(endpoint, data):
    url = f"{BASE_URL}/{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}
    except Exception as e:
        return 500, {"error": str(e)}

def main():
    test_user = f"ApiPinUser_{int(time.time())}"
    print(f"Testing with user: {test_user}")

    # 1. Create PIN - invalid PIN
    st, res = post_json("auth/create-pin", {"account_name": test_user, "pin": "12"})
    print("1. Create invalid length PIN:", st, res)
    assert st == 400

    # 2. Create PIN - valid PIN
    st, res = post_json("auth/create-pin", {"account_name": test_user, "pin": "123456"})
    print("2. Create valid PIN:", st, res)
    assert st == 200 and res.get("status") == "ok"

    # 3. Create PIN again - should be rejected as PIN already exists
    st, res = post_json("auth/create-pin", {"account_name": test_user, "pin": "654321"})
    print("3. Re-create existing PIN (should fail):", st, res)
    assert st == 400

    # 4. Change PIN - wrong current PIN
    st, res = post_json("auth/change-pin", {"account_name": test_user, "current_pin": "000000", "new_pin": "654321"})
    print("4. Change PIN with wrong current (should fail):", st, res)
    assert st == 401

    # 5. Change PIN - same as current PIN
    st, res = post_json("auth/change-pin", {"account_name": test_user, "current_pin": "123456", "new_pin": "123456"})
    print("5. Change PIN to same PIN (should fail):", st, res)
    assert st == 400

    # 6. Change PIN - correct current PIN
    st, res = post_json("auth/change-pin", {"account_name": test_user, "current_pin": "123456", "new_pin": "987654"})
    print("6. Change PIN successfully:", st, res)
    assert st == 200 and res.get("status") == "ok"

    print("\n✓ ALL ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
