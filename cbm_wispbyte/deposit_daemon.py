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
    def __init__(self, db: CBMDatabase, vault_account: str = "DdcBC", vault_password: str = "", poll_interval: float = 30.0):
        self.db = db
        self.vault_account = vault_account.strip()
        self.vault_password = vault_password.strip() or os.environ.get("CBM_VAULT_PASSWORD", "").strip()
        self.poll_interval = poll_interval
        self.running = False
        self._ssl_ctx = ssl.create_default_context()
        self.on_deposit_callback: Optional[Callable] = None
        self._poll_count = 0
        self._processed_cache = set()

    def sync_live_vault(self):
        """Audits and syncs actual live vault balance against Territorial.io API."""
        if self.vault_password and hasattr(self.db, "sync_vault_balance_from_live_api"):
            try:
                ok, live_cents, audit = self.db.sync_vault_balance_from_live_api(self.vault_account, self.vault_password)
                if ok:
                    print(f"[✓] Vault balance verified against live Territorial.io API: {live_cents / 100:.2f} Gold.")
            except Exception as e:
                print(f"[!] Live vault sync error: {e}")

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

                    # Check in-memory replay cache first (0 DB overhead)
                    if tx_id in self._processed_cache:
                        continue
                    if self.db.is_tx_processed(tx_id):
                        self._processed_cache.add(tx_id)
                        if len(self._processed_cache) > 5000:
                            self._processed_cache = set(list(self._processed_cache)[-2000:])
                        continue
                    self._processed_cache.add(tx_id)
                    if len(self._processed_cache) > 5000:
                        self._processed_cache = set(list(self._processed_cache)[-2000:])

                    # New inbound transfer detected!
                    amount_cents = int(round(amount_gold * 100))
                    print(f"[*] Detected Inbound Vault Transfer: {amount_gold} Gold from '{sender}' (TX: {tx_id})")

                    # STEP 1: Check if an active 15-minute Web Intent Donation Slip matches this transfer
                    slip = self.db.find_and_claim_pending_donation(sender, amount_cents, tx_id)
                    if slip:
                        # User explicitly declared this in-game transfer as a Clan War Chest Donation on the web!
                        raw_donor = slip.get("account_name") or sender
                        canonical_acc = self.db.get_account(raw_donor) or self.db.get_account(sender)
                        if canonical_acc:
                            donor_name = canonical_acc.get("display_name") or canonical_acc.get("account_name")
                            target_user = canonical_acc.get("account_name")
                        else:
                            donor_name = raw_donor
                            target_user = raw_donor

                        custom_message = slip.get("message") or "Web-Declared War Chest Donation"
                        print(f"[+] Matched Web-Declared Donation Slip {slip.get('id')} from '{sender}' (CBM: {target_user}) -> Booking to Clan War Chest!")
                        self.db.record_processed_tx(
                            tx_id=tx_id,
                            timestamp_ms=ts,
                            sender=sender,
                            receiver=receiver,
                            amount_gold=amount_gold,
                            fee_gold=fee_gold,
                            credited_account="TREASURY"
                        )
                        self.db.record_direct_donation(
                            donor_name=donor_name,
                            territorial_account=sender,
                            amount_cents=amount_cents,
                            tx_hash=tx_id,
                            message=custom_message
                        )
                        new_deposits += 1
                        target_user = donor_name
                    else:
                        # STEP 2: The Golden Infallible Rule:
                        # Pure in-game transactions are DEPOSITS unless Web Intent explicitly declared otherwise!
                        # Unconditionally credit sender's withdrawable balance (creating or updating account).
                        cbm_user = self.db.get_cbm_username_by_territorial_account(sender)
                        target_user = cbm_user if cbm_user else sender

                        print(f"[+] The Golden Rule: Inbound transfer from '{sender}' booked as DEPOSIT for '{target_user}' (withdrawable balance)")
                        self.db.record_payment_method_transaction(sender, amount_gold)

                        self.db.record_processed_tx(
                            tx_id=tx_id,
                            timestamp_ms=ts,
                            sender=sender,
                            receiver=receiver,
                            amount_gold=amount_gold,
                            fee_gold=fee_gold,
                            credited_account=target_user
                        )

                        # Credit member balance (Bank covers the 0.01 Gold game fee)
                        self.db.credit_deposit(target_user, amount_cents, tx_id, fee_rebate_cents=1)
                        new_deposits += 1

                    if self.on_deposit_callback:
                        try:
                            self.on_deposit_callback(target_user, sender, amount_gold, tx_id)
                        except Exception as cb_err:
                            print(f"[!] Callback error: {cb_err}")

        return new_deposits

    def run(self):
        """Runs the daemon loop."""
        self.running = True
        print(f"[+] CBM Deposit Ingestion Daemon started. Monitoring vault '{self.vault_account}' every {self.poll_interval}s...")
        # Initial live check against Territorial.io API
        self.sync_live_vault()

        while self.running:
            try:
                count = self.poll_once()
                if count > 0:
                    print(f"[+] Processed {count} new deposit(s).")
                
                self._poll_count += 1
                # Periodically re-verify vault balance against live API (every 30 cycles ~ 7.5 min)
                if self._poll_count % 30 == 0:
                    self.sync_live_vault()
            except Exception as e:
                print(f"[!] Daemon loop exception: {e}")
            time.sleep(self.poll_interval)

    def stop(self):
        self.running = False
