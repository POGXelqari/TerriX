#!/usr/bin/env python3
"""
CBM Deposit Ingestion Daemon
============================
High-efficiency public ledger scraper that monitors inbound deposits to the CBM vault.
- Consumes 0 API fees (streams https://territorial.io/log/transactions)
- Replay protection via cryptographic transaction hashing
- Automatic internal ledger credit for registered clan members
- Instant treasury reserve balance updating
"""

import os
import sys
import time
import hashlib
import ssl
import urllib.request
from typing import Optional, Callable
from db_layer import CBMDatabase

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

class CBMDepositDaemon:
    def __init__(self, db: CBMDatabase, vault_account: str = "DdcBC", poll_interval: float = 15.0):
        self.db = db
        self.vault_account = vault_account.strip()
        self.poll_interval = poll_interval
        self.running = False
        self._ssl_ctx = ssl.create_default_context()
        self.on_deposit_callback: Optional[Callable] = None

    def poll_once(self) -> int:
        """Polls /log/transactions once, reconciling any new inbound deposits to the vault."""
        url = "https://territorial.io/log/transactions"
        req = urllib.request.Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
        new_deposits = 0
        try:
            with urllib.request.urlopen(req, context=self._ssl_ctx, timeout=10.0) as resp:
                text = resp.read().decode("utf-8")
        except Exception as e:
            print(f"[!] Error fetching transaction stream: {e}")
            return 0

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines:
            parts = line.split(",")
            if len(parts) >= 5 and parts[0].isdigit():
                ts = int(parts[0])
                sender = parts[1].strip()
                receiver = parts[2].strip()
                try:
                    amount_gold = float(parts[3])
                    fee_gold = float(parts[4])
                except ValueError:
                    continue

                # We only care about transactions sent to our CBM Vault Account
                if receiver.lower() == self.vault_account.lower():
                    # Generate deterministic transaction ID
                    raw_hash = f"{ts}:{sender}:{receiver}:{amount_gold}:{fee_gold}"
                    tx_id = hashlib.sha256(raw_hash.encode("utf-8")).hexdigest()[:24]

                    # Check replay cache
                    if self.db.is_tx_processed(tx_id):
                        continue

                    # New inbound deposit detected!
                    amount_cents = int(round(amount_gold * 100))
                    print(f"[*] Detected Inbound Vault Transfer: {amount_gold} Gold from '{sender}' (TX: {tx_id})")

                    # Record transaction to prevent double processing
                    self.db.record_processed_tx(
                        tx_id=tx_id,
                        timestamp_ms=ts,
                        sender=sender,
                        receiver=receiver,
                        amount_gold=amount_gold,
                        fee_gold=fee_gold,
                        credited_account=sender
                    )

                    # Credit member account balance
                    self.db.credit_deposit(sender, amount_cents, tx_id)
                    new_deposits += 1

                    if self.on_deposit_callback:
                        try:
                            self.on_deposit_callback(sender, amount_gold, tx_id)
                        except Exception as cb_err:
                            print(f"[!] Callback error: {cb_err}")

        return new_deposits

    def run(self):
        """Runs the daemon loop."""
        self.running = True
        print(f"[+] CBM Deposit Ingestion Daemon started. Monitoring vault '{self.vault_account}' every {self.poll_interval}s...")
        while self.running:
            try:
                count = self.poll_once()
                if count > 0:
                    print(f"[+] Processed {count} new deposit(s).")
            except Exception as e:
                print(f"[!] Daemon loop exception: {e}")
            time.sleep(self.poll_interval)

    def stop(self):
        self.running = False
