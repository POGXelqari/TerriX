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
from gold_api_client import GoldApiClient

logger = logging.getLogger("cbm.election")

class CBMElectionWorker:
    def __init__(self, db: Optional[CBMDatabase] = None, client: Optional[GoldApiClient] = None):
        self.db = db or CBMDatabase()
        self.vault_account = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")
        self.vault_password = os.environ.get("CBM_VAULT_PASSWORD", "")
        if client:
            self.client = client
        elif self.vault_account and self.vault_password:
            self.client = GoldApiClient(self.vault_account, self.vault_password)
        else:
            self.client = None

        self._cache: Dict[str, Any] = {
            "target_account": self.vault_account,
            "admin_points": 0,
            "admin_rank": 0,
            "timestamp": 0.0
        }
        self._cache_ttl_sec = 60.0

    def get_vault_election_telemetry(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Retrieves live Admin Election standings for vault account DdcBC.
        Uses cached data if fetched within the last 60 seconds to avoid unnecessary API fees.
        """
        now = time.time()
        if not force_refresh and (now - self._cache.get("timestamp", 0.0) < self._cache_ttl_sec) and self._cache.get("timestamp", 0.0) > 0:
            return dict(self._cache)

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
        Sweeps and processes pending vote sponsorship claims.
        Enforces voter identity verification, 1:1 reimbursement, 15% reserve cap,
        and promotional audit quarantine holding.
        """
        conn = self.db._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT claim_id, cbm_username, voter_account, votes_count, gold_spent, reward_gold, reward_cents
            FROM cbm_admin_votes
            WHERE status IN ('PENDING', 'PENDING_REVIEW')
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        pending = cur.fetchall()

        results = []
        for row in pending:
            claim_id, cbm_username, voter_acc, votes, spent, reward, cents = row
            # 1. Audit Voter Identity Binding
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
                logger.warning(f"[Admin Election] Rejected claim {claim_id}: {msg}")
                continue

            # 2. Settle with 24-hour promotional holding quarantine
            ok, msg, details = self.db.settle_admin_vote_claim(
                claim_id,
                verified=True,
                quarantine_hours=24.0
            )
            results.append({
                "claim_id": claim_id,
                "success": ok,
                "message": msg,
                "details": details
            })
            if ok:
                logger.info(f"[Admin Election] Audited and settled claim {claim_id} for {cbm_username}: {reward:.2f} Gold credited (24h quarantine applied).")
            else:
                logger.warning(f"[Admin Election] Settlement failed for {claim_id}: {msg}")

        return results


# Module singleton instance
_GLOBAL_ELECTION_WORKER: Optional[CBMElectionWorker] = None

def get_election_worker(db: Optional[CBMDatabase] = None) -> CBMElectionWorker:
    global _GLOBAL_ELECTION_WORKER
    if _GLOBAL_ELECTION_WORKER is None:
        _GLOBAL_ELECTION_WORKER = CBMElectionWorker(db=db)
    return _GLOBAL_ELECTION_WORKER
