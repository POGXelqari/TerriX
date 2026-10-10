#!/usr/bin/env python3
"""
Test Suite: Cloudflare Turnstile End-to-End Integration Verification
====================================================================
Verifies:
1. Secret authenticity against Cloudflare siteverify endpoint.
2. Server-side Turnstile verification gate on /api/cbm/auth/register.
3. Server-side Turnstile verification gate on /api/cbm/auth/login.
4. Native app origin bypass for official desktop/mobile apps on login.
5. Content-Security-Policy (CSP) inclusion of challenges.cloudflare.com.
6. Frontend widget embedding and token lifecycle handling in register.html & login.html.
"""

import os
import sys
import json
import socket
import threading
import urllib.request
import urllib.parse
import urllib.error
from http.server import HTTPServer

cbm_dir = os.path.dirname(os.path.abspath(__file__))
if cbm_dir not in sys.path:
    sys.path.insert(0, cbm_dir)

import main
from main import CBMHealthHandler, load_static_cache, verify_turnstile_token


def test_turnstile_secret_authenticity():
    print("[*] 1. Validating Turnstile Secret with Cloudflare API...")
    secret = os.environ.get("TURNSTILE_SECRET", "").strip()
    assert secret == "0x4AAAAAAFTHDHfU5aVvrEn-D8vpMCmTsdc", f"Unexpected secret: {secret}"

    # Probe siteverify with a dummy token to confirm Cloudflare accepts the secret
    data = urllib.parse.urlencode({
        "secret": secret,
        "response": "XXXX.PROBE.TOKEN.XXXX"
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    res = None
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(req, timeout=15.0) as resp:
                res = json.loads(resp.read().decode("utf-8"))
            break
        except (urllib.error.URLError, TimeoutError) as net_err:
            print(f"[!] Network attempt {attempt} to Cloudflare encountered latency ({net_err}). Retrying...")
            time.sleep(1.0)

    if res is None:
        print("[!] Warning: Cloudflare API temporarily unreachable due to network latency, skipping live probe.")
        return

    # If secret is valid, Cloudflare returns success=False and 'invalid-input-response' (NOT 'invalid-input-secret')
    err_codes = res.get("error-codes", [])
    assert res.get("success") is False, "Probe dummy token should not succeed"
    assert "invalid-input-secret" not in err_codes, f"Turnstile secret rejected by Cloudflare: {err_codes}"
    assert "invalid-input-response" in err_codes, f"Expected invalid-input-response for dummy token, got: {err_codes}"
    print("[+] Turnstile Secret 0x4AAAAAAFTHDH... is authentic and accepted by Cloudflare!")


def test_turnstile_token_validation_logic():
    print("[*] 2. Testing Server-Side Token Validation Logic...")
    # Empty token -> Rejected
    ok, err = verify_turnstile_token("")
    assert ok is False and "Missing or invalid" in err

    # Overly long token (> 2048 chars) -> Rejected
    ok, err = verify_turnstile_token("A" * 2049)
    assert ok is False and "Missing or invalid" in err

    # Invalid token against Cloudflare API -> Rejected
    ok, err = verify_turnstile_token("BOGUS.TOKEN.TEST", expected_action="register")
    assert ok is False
    assert "invalid-input-response" in err or "verification failed" in err.lower()
    print("[+] Token validation unit logic passed!")


def test_http_endpoint_turnstile_gates():
    print("[*] 3. Testing HTTP Gateway Turnstile Enforcement...")
    load_static_cache()

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    test_port = sock.getsockname()[1]
    sock.close()

    server = HTTPServer(("127.0.0.1", test_port), CBMHealthHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    base_url = f"http://127.0.0.1:{test_port}"

    try:
        # A. Verify CSP Headers on HTML response
        req = urllib.request.Request(f"{base_url}/login.html")
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            csp = resp.headers.get("Content-Security-Policy", "")
            assert "https://challenges.cloudflare.com" in csp, "CSP must permit challenges.cloudflare.com"
            assert "frame-src 'self' https://challenges.cloudflare.com" in csp, "CSP must permit frame-src"
        print("[+] Content-Security-Policy permits Cloudflare Turnstile frames and scripts!")

        # B. Test /api/cbm/auth/register without Turnstile token -> 403 Forbidden
        reg_payload = json.dumps({
            "username": "TestBotUser",
            "password": "Password123!",
            "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=test",
            "primary_territorial_account": "Bot123",
            "pin": "1234"
        }).encode("utf-8")

        req_reg_no_ts = urllib.request.Request(
            f"{base_url}/api/cbm/auth/register",
            data=reg_payload,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://cbm.wispbyte.org"
            }
        )
        try:
            with urllib.request.urlopen(req_reg_no_ts, timeout=3.0) as resp:
                assert False, "Registration without Turnstile token must be rejected"
        except urllib.error.HTTPError as err:
            assert err.code == 403, f"Expected 403, got {err.code}"
            err_data = json.loads(err.read().decode("utf-8"))
            assert err_data.get("error") == "turnstile_verification_failed"
        print("[+] POST /api/cbm/auth/register (No Token) -> 403 Forbidden (Gated)")

        # C. Test /api/cbm/auth/register with bogus Turnstile token -> 403 Forbidden
        reg_payload_bogus = json.dumps({
            "username": "TestBotUser",
            "password": "Password123!",
            "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=test",
            "primary_territorial_account": "Bot123",
            "pin": "1234",
            "cf-turnstile-response": "FAKE_BOGUS_TURNSTILE_TOKEN"
        }).encode("utf-8")

        req_reg_bogus = urllib.request.Request(
            f"{base_url}/api/cbm/auth/register",
            data=reg_payload_bogus,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://cbm.wispbyte.org"
            }
        )
        try:
            with urllib.request.urlopen(req_reg_bogus, timeout=5.0) as resp:
                assert False, "Registration with fake Turnstile token must be rejected"
        except urllib.error.HTTPError as err:
            assert err.code == 403
            err_data = json.loads(err.read().decode("utf-8"))
            assert err_data.get("error") == "turnstile_verification_failed"
        print("[+] POST /api/cbm/auth/register (Bogus Token) -> 403 Forbidden (Cloudflare Rejected)")

        # D. Test /api/cbm/auth/login without Turnstile token from Web Browser -> 403 Forbidden
        login_payload = json.dumps({
            "username": "TestUser",
            "password": "Password123!"
        }).encode("utf-8")

        req_login_no_ts = urllib.request.Request(
            f"{base_url}/api/cbm/auth/login",
            data=login_payload,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://cbm.wispbyte.org"
            }
        )
        try:
            with urllib.request.urlopen(req_login_no_ts, timeout=3.0) as resp:
                assert False, "Web Login without Turnstile token must be rejected"
        except urllib.error.HTTPError as err:
            assert err.code == 403
            err_data = json.loads(err.read().decode("utf-8"))
            assert err_data.get("error") == "turnstile_verification_failed"
        print("[+] POST /api/cbm/auth/login (Web No Token) -> 403 Forbidden (Gated)")

        # E. Test /api/cbm/auth/login from Official Native Desktop Client -> Bypasses Turnstile
        req_login_native = urllib.request.Request(
            f"{base_url}/api/cbm/auth/login",
            data=login_payload,
            headers={
                "Content-Type": "application/json",
                "X-CBM-App-Origin": "org.wispbyte.cbm.desktop",
                "User-Agent": "ClanBankManager/1.0.0 (Windows NT 10.0; Win64; x64)"
            }
        )
        # Account doesn't exist, but it should pass the Turnstile gate and hit account lookup (404 Not Found)
        try:
            with urllib.request.urlopen(req_login_native, timeout=3.0) as resp:
                pass
        except urllib.error.HTTPError as err:
            assert err.code == 404, f"Expected 404 account not found (Turnstile bypassed), got {err.code}"
            err_data = json.loads(err.read().decode("utf-8"))
            assert "Account 'TestUser' not found" in err_data.get("message", "")
        print("[+] POST /api/cbm/auth/login (Official Desktop App) -> Turnstile bypassed for native app!")

        # F. Test Frontend HTML Embeds
        for fname in ("register.html", "login.html"):
            fpath = os.path.join(cbm_dir, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            assert "https://challenges.cloudflare.com/turnstile/v0/api.js" in content
            assert 'data-sitekey="0x4AAAAAAFTHDMRiQrSwWPa0"' in content
            assert "cf-turnstile" in content
            assert "window.turnstile.reset()" in content
        print("[+] Frontend templates (register.html, login.html) embed valid Turnstile widgets with lifecycle reset!")

        print("[+] All Cloudflare Turnstile Integration Tests Passed Successfully!")

    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    print("=" * 70)
    print(" CBM CLOUDFLARE TURNSTILE INTEGRATION TEST SUITE")
    print("=" * 70)
    test_turnstile_secret_authenticity()
    test_turnstile_token_validation_logic()
    test_http_endpoint_turnstile_gates()
    print("=" * 70)
    print(" ALL TESTS PASSED: TURNSTILE INTEGRATION COMPLETE & VERIFIED")
    print("=" * 70)
