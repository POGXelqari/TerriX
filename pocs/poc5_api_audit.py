"""
PoC 5: REST API Audit Harness (Gold & Account Subsystem)
Reference: Territorial.io Wiki API Specifications (wiki/wiki_api.html)

Vulnerability Analysis:
1. Cleartext Credential Replay:
   Endpoints (/api/gold/send, /api/account/get, /api/clan/stats/get) accept
   `account_name` and `password` as raw string fields in JSON bodies.
2. Lack of Nonces & Idempotency Keys:
   Transactions lack client nonces, timestamp expiry, or HMAC authentication headers.
3. Automated Scripting Surface:
   Allows rapid programmatic ledger queries, transaction sniffing, and clan scraping.
"""

import json
import urllib.request
import urllib.error

API_BASE = "https://territorial.io/api"

def audit_endpoint_security(endpoint, payload):
    url = f"{API_BASE}/{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (SecurityAudit/2.0)'
    }
    
    print(f"\n[*] Probing {url} with test payload...")
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            body = resp.read().decode('utf-8', errors='ignore')
            print(f"[+] Status: {resp.status}")
            print(f"[+] Headers: {dict(resp.headers)}")
            print(f"[+] Response Body: {body[:300]}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        print(f"[!] Server HTTP Error {e.code}: {e.reason}")
        print(f"[!] Response: {err_body[:200]}")
    except Exception as e:
        print(f"[-] Connection Error: {e}")

if __name__ == '__main__':
    print("=== Territorial.io REST API Structural Security Audit ===")
    
    # 1. Test account query endpoint structure
    test_account_payload = {
        "account_name": "AuditDummyAccount",
        "password": "TestPassword123",
        "target_account_name": "AuditDummyAccount"
    }
    audit_endpoint_security("account/get", test_account_payload)

    # 2. Test clan stats query endpoint structure
    test_clan_payload = {
        "account_name": "AuditDummyAccount",
        "password": "TestPassword123",
        "clan": "OG",
        "timeframe": "D1"
    }
    audit_endpoint_security("clan/stats/get", test_clan_payload)
