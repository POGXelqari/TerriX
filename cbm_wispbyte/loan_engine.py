#!/usr/bin/env python3
"""
CBM Lending & Risk Assessment Engine
====================================
Enforces strict institutional reserve ratios and member lending parameters:
1. Loans must not exceed 0.05% of the bank's unencumbered reserves.
   (Reserves = Vault Balance - Total Member Deposited Liabilities).
2. If 0.05% of the bank's reserves does not exceed 1,000 Gold, loans are strictly disabled.
   (Requires minimum 2,000,000 Gold unencumbered reserves for lending facility to activate).
"""

import math
from typing import Dict, Any, Tuple

class CBMLoanEngine:
    LOAN_PERCENT_LIMIT = 0.0005  # 0.05% = 0.0005
    ACTIVATION_THRESHOLD_GOLD = 1000.0  # Must strictly exceed 1000 Gold

    @classmethod
    def evaluate_lending_facility(cls, bank_reserves_cents: int) -> Dict[str, Any]:
        """
        Calculates current loan capacity and eligibility based on central bank reserves.
        """
        reserves_gold = bank_reserves_cents / 100.0
        potential_ceiling = reserves_gold * cls.LOAN_PERCENT_LIMIT
        
        # Rule: if 0.05% does not exceed 1,000 Gold, loans cannot be requested at all
        is_active = potential_ceiling > cls.ACTIVATION_THRESHOLD_GOLD
        min_reserves_required = cls.ACTIVATION_THRESHOLD_GOLD / cls.LOAN_PERCENT_LIMIT  # 2,000,000.0 Gold

        return {
            "is_active": is_active,
            "bank_reserves_gold": round(reserves_gold, 2),
            "bank_reserves_cents": bank_reserves_cents,
            "calculated_ceiling_gold": round(potential_ceiling, 2),
            "max_loan_gold": math.floor(potential_ceiling) if is_active else 0,
            "activation_threshold_gold": cls.ACTIVATION_THRESHOLD_GOLD,
            "min_reserves_required_gold": min_reserves_required,
            "reserves_progress_percent": min(100.0, round((reserves_gold / min_reserves_required) * 100.0, 3)),
            "status_message": (
                f"Lending facility active. Maximum loan per request: {math.floor(potential_ceiling):,} Gold."
                if is_active else
                f"Lending facility locked. 0.05% of reserves ({potential_ceiling:.2f} Gold) does not exceed the required 1,000 Gold threshold. Unencumbered reserves must reach {min_reserves_required:,.0f} Gold."
            )
        }

    @classmethod
    def validate_loan_request(cls, bank_reserves_cents: int, requested_gold: int, member_account: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates an incoming loan application.
        """
        facility = cls.evaluate_lending_facility(bank_reserves_cents)
        if not facility["is_active"]:
            return False, facility["status_message"]

        if requested_gold <= 0:
            return False, "Requested loan amount must be greater than 0 Gold."

        max_allowed = facility["max_loan_gold"]
        if requested_gold > max_allowed:
            return False, f"Requested amount ({requested_gold:,} Gold) exceeds maximum allowable loan ceiling ({max_allowed:,} Gold)."

        # Additional risk check: borrower must not have defaulted accounts
        if member_account.get("role") == "frozen":
            return False, "Account is currently restricted from credit operations."

        return True, "Loan request authorized under 0.05% reserve policy."
