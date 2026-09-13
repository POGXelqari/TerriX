#!/usr/bin/env python3
"""
Clan Bank Manager (CBM) - Wispbyte Master Runtime
=================================================
Dedicated continuous runtime daemon for Wispbyte Python hosting.
Features:
- Background Deposit Ingestion Worker (polling Territorial.io ledger)
- Real-time Treasury & Unencumbered Reserve calculation
- Loan Facility Risk Engine (0.05% reserve policy & 1000 Gold activation rule)
- Lightweight HTTP Health & Metrics Server on port $PORT (default 8080)
- Graceful shutdown signal handling
"""

import os
import sys
import time
import signal
import threading
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Import local CBM modules
from db_layer import CBMDatabase
from deposit_daemon import CBMDepositDaemon
from loan_engine import CBMLoanEngine
from withdrawal_worker import CBMWithdrawalWorker

PORT = int(os.environ.get("PORT", 8080))
VAULT_ACCOUNT = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
VAULT_PASSWORD = os.environ.get("CBM_VAULT_PASSWORD", "")
POLL_INTERVAL = float(os.environ.get("CBM_POLL_INTERVAL", 15.0))

db = CBMDatabase()
loan_engine = CBMLoanEngine()
deposit_daemon = CBMDepositDaemon(db=db, vault_account=VAULT_ACCOUNT, poll_interval=POLL_INTERVAL)
withdrawal_worker = CBMWithdrawalWorker(db=db, vault_account=VAULT_ACCOUNT, vault_password=VAULT_PASSWORD)

class CBMHealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "service": "cbm-wispbyte", "uptime": time.time()}).encode())
        elif self.path == "/status":
            treasury = db.get_treasury()
            facility = loan_engine.evaluate_lending_facility(treasury.get("bank_reserves_cents", 0))
            recent_txs = db.get_recent_transactions(limit=10)
            payload = {
                "service": "Clan Bank Manager (CBM)",
                "runtime": "Wispbyte Python",
                "vault_account": VAULT_ACCOUNT,
                "treasury": {
                    "vault_total_gold": treasury.get("vault_total_gold_cents", 0) / 100.0,
                    "member_liabilities_gold": treasury.get("member_liabilities_cents", 0) / 100.0,
                    "bank_reserves_gold": treasury.get("bank_reserves_cents", 0) / 100.0,
                },
                "lending_facility": facility,
                "recent_transactions_count": len(recent_txs)
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload, indent=2).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress routine health check log spam
        pass

def run_http_server():
    server = HTTPServer(("0.0.0.0", PORT), CBMHealthHandler)
    print(f"[+] HTTP Health & Metrics server listening on 0.0.0.0:{PORT}")
    server.serve_forever()

def main():
    print("=" * 65)
    print("  Clan Bank Manager (CBM) - Wispbyte Runtime Initializing")
    print(f"  Target Vault Account: {VAULT_ACCOUNT}")
    print(f"  Ledger Polling Interval: {POLL_INTERVAL}s")
    print("=" * 65)

    # 1. Start HTTP health server in background thread
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    # 2. Start deposit ingestion worker in background thread
    daemon_thread = threading.Thread(target=deposit_daemon.run, daemon=True)
    daemon_thread.start()

    # 3. Setup graceful signal handling
    def handle_signal(sig, frame):
        print("\n[!] Received shutdown signal. Stopping CBM daemon...")
        deposit_daemon.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    print("[✓] CBM Master Runtime active and operational. Monitoring incoming ledger transfers.")

    # Keep main thread alive
    while True:
        time.sleep(60)

if __name__ == "__main__":
    main()
