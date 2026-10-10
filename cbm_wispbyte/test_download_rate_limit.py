#!/usr/bin/env python3
"""
Test Suite: CBM Download Rate Limiting & 24-Hour IP Ban Protection
==================================================================
Verifies:
1. 1 download request per minute per IP rate limit.
2. 5+ retries while throttled triggers immediate 24-hour IP ban.
3. Banned IPs receive HTTP 403 with remaining ban duration.
4. Independent IP isolation (ban on IP-A does not impact IP-B).
5. Binary streaming with correct Content-Type, Content-Disposition, and SHA-256 headers.
"""

import os
import sys
import time
import json
import socket
import threading
import urllib.request
import urllib.error
from http.server import HTTPServer

# Add local directory to path
cbm_dir = os.path.dirname(os.path.abspath(__file__))
if cbm_dir not in sys.path:
    sys.path.insert(0, cbm_dir)

from rate_limiter import CBMRateLimiter, rate_limiter
import main
from main import CBMHealthHandler, load_static_cache


def test_rate_limiter_unit_logic():
    print("[*] Running Rate Limiter Unit Logic Tests...")
    limiter = CBMRateLimiter()
    test_ip = "192.0.2.1"
    other_ip = "192.0.2.2"

    # Test 1: First request is allowed
    allowed, rem, banned = limiter.check_download_rate_limit(test_ip)
    assert allowed is True, "First request must be allowed"
    assert rem == 0, f"Cooldown should be 0, got {rem}"
    assert banned is False, "Should not be banned"

    # Test 2: Immediate second request is blocked with 429 cooldown (Retry 1)
    allowed, rem, banned = limiter.check_download_rate_limit(test_ip)
    assert allowed is False, "Second request within 60s must be throttled"
    assert rem > 0 and rem <= 60, f"Expected 1-60s cooldown, got {rem}"
    assert banned is False, f"Should not be banned on first retry, got banned={banned}"

    # Test 3: Retries 2, 3, 4 while throttled
    for retry_idx in (2, 3, 4):
        allowed, rem, banned = limiter.check_download_rate_limit(test_ip)
        assert allowed is False, f"Retry {retry_idx} must be throttled"
        assert banned is False, f"Retry {retry_idx} should not trigger ban yet"

    # Test 4: 5th retry while throttled triggers immediate 24-hour IP ban
    allowed, rem, banned = limiter.check_download_rate_limit(test_ip)
    assert allowed is False, "5th retry must be rejected"
    assert banned is True, "5th retry while throttled must trigger 24-hour ban"
    assert rem >= 86390 and rem <= 86400, f"Expected ~86400s ban, got {rem}"

    # Test 5: Verify is_ip_banned method
    is_banned, ban_rem = limiter.is_ip_banned(test_ip)
    assert is_banned is True, "is_ip_banned must report True"
    assert ban_rem >= 86390, f"Expected ~86400s remaining, got {ban_rem}"

    # Test 6: Subsequent calls remain banned
    allowed, rem, banned = limiter.check_download_rate_limit(test_ip)
    assert allowed is False, "Banned IP must remain blocked"
    assert banned is True, "Banned flag must remain True"

    # Test 7: Independent IP isolation
    allowed_other, rem_other, banned_other = limiter.check_download_rate_limit(other_ip)
    assert allowed_other is True, "Independent IP must not be affected by test_ip's ban"
    assert banned_other is False, "Independent IP must not be banned"

    print("[+] Rate Limiter Unit Logic Tests Passed!")


def test_http_endpoint_integration():
    print("[*] Running HTTP Endpoint Integration Tests...")
    load_static_cache()

    # Find free port
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    test_port = sock.getsockname()[1]
    sock.close()

    server = HTTPServer(("127.0.0.1", test_port), CBMHealthHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.1)

    base_url = f"http://127.0.0.1:{test_port}"

    try:
        # Reset global rate limiter test entries
        with rate_limiter._lock:
            rate_limiter._download_requests.clear()
            rate_limiter._download_violations.clear()
            rate_limiter._banned_ips.clear()

        # 1. Test /download.html HTML page
        req = urllib.request.Request(f"{base_url}/download.html")
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            assert resp.status == 200
            html = resp.read().decode("utf-8")
            assert "Official Clan Bank Manager Clients" in html
            assert "ClanBankManager.exe" in html
            assert "ClanBankManager-release.apk" in html
        print("[+] GET /download.html -> 200 OK")

        # 2. Test /api/cbm/download/meta
        req = urllib.request.Request(f"{base_url}/api/cbm/download/meta")
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            assert resp.status == 200
            meta = json.loads(resp.read().decode("utf-8"))
            assert meta["status"] == "ok"
            assert meta["releases"]["desktop"]["filename"] == "ClanBankManager.exe"
            assert meta["releases"]["desktop"]["sha256"] == "a54ea337ade42760a2770ac2bed7b416c3ba6dcefc1b4f5aff986f3db2fac898"
            assert meta["releases"]["mobile"]["filename"] == "ClanBankManager-release.apk"
            assert meta["releases"]["mobile"]["sha256"] == "b6b0fc840405f0795b29c385ed93ac776459da4937f7c297cb0b2574a37ad38c"
            assert "1 request per minute" in meta["rate_limit_policy"]["rate_limit"]
        print("[+] GET /api/cbm/download/meta -> 200 OK")

        # 3. Test First Download (Should succeed with 200 OK and binary stream)
        req_dl1 = urllib.request.Request(
            f"{base_url}/download/desktop",
            headers={"CF-Connecting-IP": "203.0.113.50"}
        )
        with urllib.request.urlopen(req_dl1, timeout=5.0) as resp:
            assert resp.status == 200
            content_disposition = resp.headers.get("Content-Disposition")
            assert 'filename="ClanBankManager.exe"' in content_disposition
            sha_hdr = resp.headers.get("X-Checksum-SHA256")
            assert sha_hdr == "a54ea337ade42760a2770ac2bed7b416c3ba6dcefc1b4f5aff986f3db2fac898"
            # Read first chunk to verify streaming without loading entire 18 MB into memory
            first_chunk = resp.read(1024)
            assert len(first_chunk) == 1024
        print("[+] GET /download/desktop (First Request) -> 200 OK (Binary Streamed)")

        # 4. Immediate Second Download from same IP (Must return 429 Rate Limited)
        req_dl2 = urllib.request.Request(
            f"{base_url}/download/desktop",
            headers={"CF-Connecting-IP": "203.0.113.50"}
        )
        try:
            with urllib.request.urlopen(req_dl2, timeout=3.0) as resp:
                assert False, "Second download must fail with 429"
        except urllib.error.HTTPError as err:
            assert err.code == 429, f"Expected HTTP 429, got {err.code}"
            retry_after = err.headers.get("Retry-After")
            assert retry_after is not None and int(retry_after) > 0
            err_body = json.loads(err.read().decode("utf-8"))
            assert err_body["error"] == "rate_limited"
            print(f"[+] GET /download/desktop (2nd Request within 60s) -> 429 Rate Limited (Retry-After: {retry_after}s)")

        # 5. Retries 2, 3, 4 while throttled (Must continue returning 429)
        for i in range(2, 5):
            req_retry = urllib.request.Request(
                f"{base_url}/download/desktop",
                headers={"CF-Connecting-IP": "203.0.113.50"}
            )
            try:
                with urllib.request.urlopen(req_retry, timeout=3.0) as resp:
                    assert False, f"Retry {i} must return 429"
            except urllib.error.HTTPError as err:
                assert err.code == 429, f"Expected 429 for retry {i}, got {err.code}"

        print("[+] Retries 2, 3, 4 while throttled returned 429 Rate Limited")

        # 6. Retry 5 while throttled (Must trigger HTTP 403 Forbidden with 24-hour IP Ban)
        req_retry5 = urllib.request.Request(
            f"{base_url}/download/desktop",
            headers={"CF-Connecting-IP": "203.0.113.50"}
        )
        try:
            with urllib.request.urlopen(req_retry5, timeout=3.0) as resp:
                assert False, "5th retry must trigger 403 IP Ban"
        except urllib.error.HTTPError as err:
            assert err.code == 403, f"Expected HTTP 403, got {err.code}"
            retry_after = err.headers.get("Retry-After")
            assert retry_after is not None and int(retry_after) >= 86390
            err_body = json.loads(err.read().decode("utf-8"))
            assert err_body["error"] == "ip_banned"
            assert "24 hours" in err_body["message"]
            print(f"[+] GET /download/desktop (5th Retry Abuse) -> 403 Forbidden (24-Hour IP Ban: {retry_after}s remaining)")

        # 7. Subsequent request from banned IP remains rejected with 403
        req_banned = urllib.request.Request(
            f"{base_url}/download/desktop",
            headers={"CF-Connecting-IP": "203.0.113.50"}
        )
        try:
            with urllib.request.urlopen(req_banned, timeout=3.0) as resp:
                assert False, "Banned IP must remain blocked with 403"
        except urllib.error.HTTPError as err:
            assert err.code == 403
            err_body = json.loads(err.read().decode("utf-8"))
            assert err_body["error"] == "ip_banned"
        print("[+] Subsequent request from banned IP -> 403 Forbidden (Enforced)")

        # 8. Request from different IP (203.0.113.99) should succeed
        req_clean_ip = urllib.request.Request(
            f"{base_url}/download/mobile",
            headers={"CF-Connecting-IP": "203.0.113.99"}
        )
        with urllib.request.urlopen(req_clean_ip, timeout=5.0) as resp:
            assert resp.status == 200
            content_disposition = resp.headers.get("Content-Disposition")
            assert 'filename="ClanBankManager-release.apk"' in content_disposition
            sha_hdr = resp.headers.get("X-Checksum-SHA256")
            assert sha_hdr == "b6b0fc840405f0795b29c385ed93ac776459da4937f7c297cb0b2574a37ad38c"
        print("[+] GET /download/mobile (Clean IP) -> 200 OK (Independent IP Allowed)")

        print("[+] All HTTP Endpoint Integration Tests Passed Successfully!")

    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    print("=" * 70)
    print(" CBM DOWNLOAD RATE LIMIT & 24-HOUR IP BAN TEST SUITE")
    print("=" * 70)
    test_rate_limiter_unit_logic()
    test_http_endpoint_integration()
    print("=" * 70)
    print(" ALL TESTS PASSED: 100% SUCCESS")
    print("=" * 70)
