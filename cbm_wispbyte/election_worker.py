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
        conn = self.db.get_write_connection()
        try:
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

            # Total rewarded votes across active campaign
            cur.execute("SELECT COALESCE(SUM(votes_count), 0) FROM cbm_admin_votes WHERE status = 'REWARDED'")
            total_rewarded_votes = cur.fetchone()[0] or 0
        finally:
            conn.close()

        if not pending:
            return []

        # 1. Fetch live candidate telemetry
        telemetry = self.get_vault_election_telemetry(force_refresh=True)
        current_admin_points = int(telemetry.get("admin_points") or 0)
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
            # 4. In-Game Vote Detection & Audit Quarantine
            # Security Rule: Public transaction streams to DdcBC are DEPOSITS and must NEVER
            # be used as election vote proof to prevent double-crediting vault drain attacks.
            # Security Rule: Candidate telemetry growth (+points) indicates votes occurred,
            # but does not identify the specific voter. All claims require manual officer review.
            if baseline_pts > 0 and (current_admin_points - baseline_pts) >= votes:
                verification_note = f"Candidate telemetry grew by +{current_admin_points - baseline_pts} points. Queued for officer audit."
            elif current_admin_points >= votes:
                verification_note = f"Candidate holds {current_admin_points} points. Queued for officer audit."
            else:
                verification_note = f"Insufficient candidate point growth observed ({current_admin_points} current, baseline was {baseline_pts})."

            # Transition to PENDING_REVIEW so officers can verify voter proof before any payout
            conn_u = self.db.get_write_connection()
            try:
                cur_u = conn_u.cursor()
                cur_u.execute("""
                    UPDATE cbm_admin_votes
                    SET status = 'PENDING_REVIEW',
                        rejection_reason = ?
                    WHERE claim_id = ? AND status = 'PENDING'
                """, (verification_note, claim_id))
                conn_u.commit()
            finally:
                conn_u.close()

            results.append({
                "claim_id": claim_id,
                "success": True,
                "message": f"Claim held in PENDING_REVIEW for officer authorization: {verification_note}",
                "status": "PENDING_REVIEW"
            })

        return results


# Module singleton instance
_GLOBAL_ELECTION_WORKER: Optional[CBMElectionWorker] = None

def get_election_worker(db: Optional[CBMDatabase] = None) -> CBMElectionWorker:
    global _GLOBAL_ELECTION_WORKER
    if _GLOBAL_ELECTION_WORKER is None:
        _GLOBAL_ELECTION_WORKER = CBMElectionWorker(db=db)
    return _GLOBAL_ELECTION_WORKER
