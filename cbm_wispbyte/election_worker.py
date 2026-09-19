#!/usr/bin/env python3
"""
Territorial.io Clan Bank Manager (CBM) - Admin Election Sponsorship Worker
--------------------------------------------------------------------------
Monitors live Admin Election telemetry for the Clan Vault account (DdcBC),
tracks admin points & leaderboard rank, validates vote sponsorship claims,
and disburses 1:1 Gold reimbursements funded from unencumbered bank reserves
subject to the strict 15% reserve budget cap.
"""

import os
import time
import logging
from typing import Dict, Any, Optional, List, Tuple
from db_layer import CBMDatabase
try:
    from gold_api_client import GoldApiClient
except ImportError:
    try:
        from gold_api_client import TerritorialGoldClient as GoldApiClient
    except ImportError:
        GoldApiClient = None

logger = logging.getLogger("cbm.election")

class CBMElectionWorker:
    def __init__(self, db: Optional[CBMDatabase] = None, client: Optional[Any] = None):
        self.db = db or CBMDatabase()
        self.vault_account = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
        self.vault_password = os.environ.get("CBM_VAULT_PASSWORD", "")
        if client:
            self.client = client
        elif GoldApiClient and self.vault_account and self.vault_password:
            try:
                self.client = GoldApiClient(self.vault_account, self.vault_password)
            except Exception as e:
                logger.error(f"[Admin Election] Failed to initialize GoldApiClient: {e}")
                self.client = None
        else:
            self.client = None

        self._cache: Dict[str, Any] = {
            "target_account": self.vault_account,
            "admin_points": 0,
            "admin_rank": 0,
            "timestamp": 0.0
        }
        self._cache_ttl_sec = 30.0

    def get_vault_election_telemetry(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Retrieves live Admin Election standings for vault account DdcBC.
        Uses cached data if fetched within the last 30 seconds to avoid unnecessary API fees.
        """
        now = time.time()
        if not force_refresh and (now - self._cache.get("timestamp", 0.0) < self._cache_ttl_sec) and self._cache.get("timestamp", 0.0) > 0:
            return dict(self._cache)

        if not self.client:
            if GoldApiClient and self.vault_account and self.vault_password:
                try:
                    self.client = GoldApiClient(self.vault_account, self.vault_password)
                except Exception:
                    pass

        if not self.client:
            return {
                "target_account": self.vault_account,
                "admin_points": self._cache.get("admin_points", 0),
                "admin_rank": self._cache.get("admin_rank", 0),
                "status": "unconfigured_client",
                "timestamp": now
            }

        try:
            resp = self.client.get_account_data(self.vault_account)
            if resp.get("status") == "ok" and "account_data" in resp:
                acc_data = resp["account_data"]
                self._cache = {
                    "target_account": self.vault_account,
                    "admin_points": int(acc_data.get("admin_points") or 0),
                    "admin_rank": int(acc_data.get("admin_rank") or 0),
                    "gold_cents": int(acc_data.get("gold_cents") or 0),
                    "status": "ok",
                    "timestamp": now
                }
                logger.info(
                    f"[Admin Election] Vault '{self.vault_account}' live standing: "
                    f"{self._cache['admin_points']} pts (Rank #{self._cache['admin_rank']})"
                )
        except Exception as e:
            logger.error(f"[Admin Election] Failed to fetch live election telemetry: {e}")
            self._cache["status"] = "error"
            self._cache["error"] = str(e)

        return dict(self._cache)

    def process_pending_vote_claims(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Sweeps and processes pending 15-minute vote sponsorship slips.
        Validates in-game points growth on candidate DdcBC, audits voter identity,
        reimburses 1:1 in Gold from unencumbered reserves under 15% budget cap,
        and applies promotional quarantine holding.
        """
        now = time.time()
        conn = self.db._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT claim_id, cbm_username, voter_account, votes_count, gold_spent, reward_gold, reward_cents,
                   COALESCE(baseline_admin_points, 0), COALESCE(expires_at, 0.0), created_at
            FROM cbm_admin_votes
            WHERE status IN ('PENDING', 'PENDING_REVIEW')
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        pending = cur.fetchall()

        if not pending:
            return []

        # 1. Fetch live candidate telemetry
        telemetry = self.get_vault_election_telemetry(force_refresh=True)
        current_admin_points = int(telemetry.get("admin_points") or 0)

        # Total rewarded votes across active campaign
        cur.execute("SELECT COALESCE(SUM(votes_count), 0) FROM cbm_admin_votes WHERE status = 'REWARDED'")
        total_rewarded_votes = cur.fetchone()[0] or 0
        uncredited_points = max(0, current_admin_points - total_rewarded_votes)

        # Recent transactions fallback stream
        recent_txs = []
        try:
            if self.client and hasattr(self.client, "get_recent_transactions"):
                recent_txs = self.client.get_recent_transactions()
        except Exception:
            pass

        results = []
        for row in pending:
            claim_id, cbm_username, voter_acc, votes, spent, reward, cents, baseline_pts, expires_at, created_at = row

            # 2. Check 15-Minute Expiration Window
            # If slip was explicitly given an expires_at timestamp and that time has passed
            if expires_at > 0.0 and now > expires_at:
                ok, msg, details = self.db.settle_admin_vote_claim(
                    claim_id,
                    verified=False,
                    rejection_reason="15-minute verification window expired. No matching in-game vote detected."
                )
                results.append({
                    "claim_id": claim_id,
                    "success": False,
                    "message": msg,
                    "details": details
                })
                logger.info(f"[Admin Election] Slip {claim_id} expired after 15 minutes.")
                continue

            # 3. Audit Voter Identity Binding
            verified_accounts = [a.strip().upper() for a in self.db.get_verified_destination_accounts(cbm_username)]
            if voter_acc.strip().upper() not in verified_accounts:
                ok, msg, details = self.db.settle_admin_vote_claim(
                    claim_id,
                    verified=False,
                    rejection_reason=f"Audit failed: voter account '{voter_acc}' is not verified or linked to CBM account '{cbm_username}'."
                )
                results.append({
                    "claim_id": claim_id,
                    "success": False,
                    "message": msg,
                    "details": details
                })
                logger.warning(f"[Admin Election] Rejected claim {claim_id}: voter account '{voter_acc}' not linked to '{cbm_username}'.")
                continue

            # 4. In-Game Vote Detection & Verification
            vote_confirmed = False
            verification_note = ""

            # Check 4a: Candidate Telemetry Growth
            if baseline_pts > 0:
                points_delta = current_admin_points - baseline_pts
                if points_delta >= votes and uncredited_points >= votes:
                    vote_confirmed = True
                    verification_note = f"Verified via candidate telemetry (+{points_delta} points gained, baseline {baseline_pts} -> {current_admin_points})."
            else:
                # Legacy / initial claim without stored baseline (e.g. initial launch)
                if current_admin_points >= votes and uncredited_points >= votes:
                    vote_confirmed = True
                    verification_note = f"Verified via candidate telemetry (candidate points: {current_admin_points}, needed: {votes})."

            # Check 4b: Fallback to transaction stream if direct gold transfer occurred
            if not vote_confirmed and recent_txs:
                for tx in recent_txs:
                    tx_sender = str(tx.get("sender", "")).strip().lower()
                    tx_receiver = str(tx.get("receiver", "")).strip().lower()
                    tx_amount = float(tx.get("amount", 0.0) or 0.0)
                    tx_ts = float(tx.get("timestamp", 0) or 0) / 1000.0 if tx.get("timestamp") else 0.0

                    if tx_sender == voter_acc.lower() and tx_receiver == self.vault_account.lower():
                        if tx_amount >= float(spent) - 0.01:
                            if tx_ts == 0.0 or tx_ts >= (created_at - 180.0):
                                vote_confirmed = True
                                verification_note = f"Verified via transaction log (transfer of {tx_amount:.2f} Gold from {tx_sender} to {tx_receiver})."
                                break

            # 5. Settlement Execution
            if vote_confirmed:
                ok, msg, details = self.db.settle_admin_vote_claim(
                    claim_id,
                    verified=True,
                    quarantine_hours=24.0
                )
                if ok:
                    uncredited_points = max(0, uncredited_points - votes)
                    logger.info(f"[Admin Election] Successfully settled claim {claim_id} for {cbm_username}: {reward:.2f} Gold credited. {verification_note}")
                results.append({
                    "claim_id": claim_id,
                    "success": ok,
                    "message": msg,
                    "details": details
                })
            else:
                rem_sec = max(0, int(expires_at - now)) if expires_at > 0 else 900
                logger.info(
                    f"[Admin Election] Claim {claim_id} ({voter_acc}, {votes} votes) pending in-game vote. "
                    f"Candidate points: {current_admin_points}, uncredited: {uncredited_points}, time left: {rem_sec}s."
                )

        return results


# Module singleton instance
_GLOBAL_ELECTION_WORKER: Optional[CBMElectionWorker] = None

def get_election_worker(db: Optional[CBMDatabase] = None) -> CBMElectionWorker:
    global _GLOBAL_ELECTION_WORKER
    if _GLOBAL_ELECTION_WORKER is None:
        _GLOBAL_ELECTION_WORKER = CBMElectionWorker(db=db)
    return _GLOBAL_ELECTION_WORKER
