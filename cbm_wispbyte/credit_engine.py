#!/usr/bin/env python3
"""
CBM API Credit Billing Compatibility Adapter
=============================================
Unified with CBM's authoritative deposit-backed API credit engine:
- Deducts 1:1 from member account deposits (cbm_accounts.deposited_cents).
- Permanently converts debited credits into unencumbered central bank reserves.
- Records all activity in cbm_ledger as API_CONSUMPTION or API_REFUND.
"""

import time
from typing import Dict, Any, Optional, Tuple, List


class InsufficientCreditsError(ValueError):
    def __init__(self, available: float, required: float):
        self.available = available
        self.required = required
        super().__init__(f"Insufficient API credits: required {required:.2f}, available {available:.2f} Gold deposit.")


class WalletFrozenError(RuntimeError):
    pass


class CBMCreditEngine:
    """
    Compatibility wrapper delegating directly to CBMDatabase native API credit methods.
    """
    def __init__(self, db):
        self.db = db

    def get_or_create_wallet(self, account_name: str) -> Dict[str, Any]:
        """Fetches the deposit-backed balance for an account."""
        acc = self.db.get_account(account_name)
        if not acc:
            return {
                "account_name": account_name,
                "credit_balance": 0.0,
                "gold_balance": 0.0,
                "is_frozen": 0,
                "updated_at": time.time()
            }
        balance_gold = round(acc.get("deposited_cents", 0) / 100.0, 2)
        is_frozen = int(bool(acc.get("is_frozen", 0)) or bool(acc.get("is_delinquent", 0)))
        return {
            "account_name": account_name,
            "credit_balance": balance_gold,
            "gold_balance": balance_gold,
            "is_frozen": is_frozen,
            "updated_at": acc.get("updated_at", time.time())
        }

    def deduct_credits_atomic(
        self,
        account_name: str,
        amount_credits: float,
        operation_type: str = "API_DEBIT",
        key_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        endpoint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, float, str]:
        """
        Deducts API credits from member's deposited gold and converts to unencumbered reserves.
        """
        acc = self.db.get_account(account_name)
        if acc and (bool(acc.get("is_frozen", 0)) or bool(acc.get("is_delinquent", 0))):
            raise WalletFrozenError(f"Account '{account_name}' is frozen.")

        cost_gold = float(amount_credits)
        charged, msg, billing = self.db.charge_api_credit(
            owner_account=account_name,
            key_id=key_id,
            cost_gold=cost_gold,
            idempotency_key=idempotency_key,
            endpoint=endpoint,
            metadata=metadata or {"operation": operation_type}
        )
        if not charged:
            available = billing.get("credits_remaining", 0.0)
            raise InsufficientCreditsError(available=available, required=cost_gold)

        return True, billing.get("credits_remaining", 0.0), billing.get("tx_hash", "")

    def grant_or_adjust_credits(
        self,
        account_name: str,
        amount_credits: float,
        operation_type: str = "ADMIN_GRANT",
        admin_account: str = "SYSTEM",
        reason: str = "",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, float, str]:
        """Adjusts member deposit balance directly."""
        self.db.register_or_get_account(account_name)
        amount_cents = int(round(amount_credits * 100))
        now = time.time()
        conn = self.db.get_write_connection(timeout=15.0)
        cur = conn.cursor()
        try:
            cur.execute("BEGIN IMMEDIATE;")
            cur.execute("""
                UPDATE cbm_accounts
                SET deposited_cents = MAX(0, deposited_cents + ?), updated_at = ?
                WHERE account_name = ?
            """, (amount_cents, now, account_name))
            cur.execute("SELECT deposited_cents FROM cbm_accounts WHERE account_name = ?", (account_name,))
            row = cur.fetchone()
            new_cents = row[0] if row else 0
            tx_hash = f"api_adj_{int(now)}"
            cur.execute("""
                INSERT INTO cbm_ledger (account_name, entry_type, amount_cents, balance_after_cents, tx_hash, notes, created_at)
                VALUES (?, 'API_ADJUSTMENT', ?, ?, ?, ?, ?)
            """, (account_name, amount_cents, new_cents, tx_hash, f"API Adjustment: {amount_credits:.2f} Gold ({reason})", now))
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

        self.db.recompute_treasury()
        return True, round(new_cents / 100.0, 2), tx_hash

    def compensate_failed_request(self, transaction_id: str, reason: str = "WORKLOAD_FAILED") -> bool:
        """Compensates a failed request by refunding credits."""
        conn = self.db._get_sqlite_conn(row_factory=True)
        cur = conn.cursor()

        # Check if already refunded
        cur.execute("SELECT 1 FROM cbm_ledger WHERE entry_type = 'API_REFUND' AND notes LIKE ?", (f"%{transaction_id}%",))
        if cur.fetchone():
            return False

        cur.execute("SELECT * FROM cbm_ledger WHERE tx_hash = ? AND entry_type = 'API_CONSUMPTION'", (transaction_id,))
        row = cur.fetchone()
        if not row:
            return False

        cost_gold = abs(row["amount_cents"]) / 100.0
        account_name = row["account_name"]
        ok, _, _ = self.db.refund_api_credit(
            owner_account=account_name,
            cost_gold=cost_gold,
            key_id=None,
            reason=reason,
            original_tx_hash=transaction_id
        )
        return ok

    def get_ledger_history(self, account_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves chronological API ledger transactions from cbm_ledger."""
        return self.db.get_api_ledger_history(account_name, limit)
