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
    STANDARD_TERM_DAYS = 14  # 14-day standard repayment return window
    OVERDUE_PENALTY_INTEREST_PERCENT = 50.0  # 50% forced interest rate after exceeding 14 days
    ACCOUNT_BUFFER_GOLD = 20.0  # 20 Gold buffer to protect against nightly gold deletion
    ACCOUNT_BUFFER_CENTS = 2000  # 2,000 cents

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
            "standard_term_days": cls.STANDARD_TERM_DAYS,
            "overdue_penalty_interest_percent": cls.OVERDUE_PENALTY_INTEREST_PERCENT,
            "account_buffer_gold": cls.ACCOUNT_BUFFER_GOLD,
            "status_message": (
                f"Lending facility active. Maximum loan per request: {math.floor(potential_ceiling):,} Gold."
                if is_active else
                f"Lending facility locked. 0.05% of reserves ({potential_ceiling:.2f} Gold) does not exceed the required 1,000 Gold threshold. Unencumbered reserves must reach {min_reserves_required:,.0f} Gold."
            )
        }

    @classmethod
    def evaluate_borrower_creditworthiness(cls, member_account: Dict[str, Any], payment_methods: list = None) -> Dict[str, Any]:
        """
        Calculates maximum allowable borrowing cap based on borrower track record
        to prevent disposable throwaway accounts from borrowing beyond their history.
        """
        role = member_account.get("role", "member")
        is_verified = bool(member_account.get("is_verified", False))
        total_dep_gold = (member_account.get("total_deposited_cents", 0) or 0) / 100.0
        
        # Calculate total transacted volume across verified payment methods
        pm_transacted = 0.0
        verified_methods_count = 0
        if payment_methods:
            for pm in payment_methods:
                if str(pm.get("status", "")).upper() == "VERIFIED":
                    verified_methods_count += 1
                    pm_transacted += float(pm.get("total_transacted_gold", 0.0) or 0.0)

        effective_volume = max(total_dep_gold, pm_transacted)

        # Reputation Tiers:
        # Tier 0 (Unverified / Zero Volume): Capped at 50 Gold or 50% of history
        # Tier 1 (Verified Member, >100 Gold volume): Eligible up to 1,000 Gold or 100% of volume
        # Tier 2 (Established Member, >1,000 Gold volume or Officer): Eligible for full reserve ceiling
        if role in ("admin", "treasurer", "officer", "banker"):
            credit_tier = "OFFICER"
            borrower_cap_gold = 50000.0
        elif is_verified and effective_volume >= 500.0:
            credit_tier = "ESTABLISHED"
            borrower_cap_gold = max(2000.0, effective_volume * 1.5)
        elif is_verified or verified_methods_count > 0:
            credit_tier = "VERIFIED_MEMBER"
            borrower_cap_gold = max(500.0, effective_volume)
        else:
            credit_tier = "NEW_UNVERIFIED"
            borrower_cap_gold = max(50.0, effective_volume * 0.5)

        return {
            "credit_tier": credit_tier,
            "effective_volume_gold": round(effective_volume, 2),
            "borrower_cap_gold": round(borrower_cap_gold, 2),
            "verified_methods_count": verified_methods_count,
            "is_verified": is_verified
        }

    @classmethod
    def calculate_loan_schedule(
        cls,
        principal_gold: int,
        created_at_ts: float,
        current_ts: float,
        repaid_cents: int = 0,
        is_covenant_breach: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates loan due date, overdue status, and applies 50% penalty interest
        if the 14-day return window has been exceeded or if a covenant breach occurred
        (e.g., in-game password changed during active loan).
        """
        principal_cents = int(round(principal_gold * 100))
        term_seconds = cls.STANDARD_TERM_DAYS * 86400.0
        due_at_ts = created_at_ts + term_seconds
        is_overdue = (current_ts > due_at_ts) or is_covenant_breach

        if is_covenant_breach:
            effective_interest_rate = cls.OVERDUE_PENALTY_INTEREST_PERCENT
            penalty_interest_cents = int(round(principal_cents * (cls.OVERDUE_PENALTY_INTEREST_PERCENT / 100.0)))
            total_due_cents = principal_cents + penalty_interest_cents
            status = "BREACH_OF_COVENANT" if repaid_cents < total_due_cents else "REPAID"
        elif is_overdue:
            effective_interest_rate = cls.OVERDUE_PENALTY_INTEREST_PERCENT
            penalty_interest_cents = int(round(principal_cents * (cls.OVERDUE_PENALTY_INTEREST_PERCENT / 100.0)))
            total_due_cents = principal_cents + penalty_interest_cents
            status = "OVERDUE" if repaid_cents < total_due_cents else "REPAID"
        else:
            effective_interest_rate = 0.0
            penalty_interest_cents = 0
            total_due_cents = principal_cents
            status = "ACTIVE" if repaid_cents < total_due_cents else "REPAID"

        remaining_due_cents = max(0, total_due_cents - repaid_cents)
        days_remaining = max(0.0, (due_at_ts - current_ts) / 86400.0) if (not is_overdue and not is_covenant_breach) else 0.0
        days_overdue = max(0.0, (current_ts - due_at_ts) / 86400.0) if is_overdue else 0.0

        return {
            "principal_gold": principal_gold,
            "principal_cents": principal_cents,
            "term_days": cls.STANDARD_TERM_DAYS,
            "created_at": created_at_ts,
            "due_at": due_at_ts,
            "is_overdue": is_overdue,
            "is_covenant_breach": is_covenant_breach,
            "days_remaining": round(days_remaining, 1),
            "days_overdue": round(days_overdue, 1),
            "effective_interest_rate_percent": effective_interest_rate,
            "penalty_interest_cents": penalty_interest_cents,
            "penalty_interest_gold": round(penalty_interest_cents / 100.0, 2),
            "total_due_cents": total_due_cents,
            "total_due_gold": round(total_due_cents / 100.0, 2),
            "repaid_cents": repaid_cents,
            "repaid_gold": round(repaid_cents / 100.0, 2),
            "remaining_due_cents": remaining_due_cents,
            "remaining_due_gold": round(remaining_due_cents / 100.0, 2),
            "status": status
        }

    @classmethod
    def calculate_balance_garnishment(cls, current_balance_cents: int, remaining_loan_due_cents: int) -> Tuple[int, int, bool]:
        """
        Calculates how much can be garnished from the user's account balance.
        Always leaves at least 20 Gold (2,000 cents) buffer in the user account
        to prevent deletion by nightly gold deduction.

        Returns: (garnish_cents, remaining_balance_cents, is_fully_settled)
        """
        available_to_garnish = max(0, current_balance_cents - cls.ACCOUNT_BUFFER_CENTS)
        garnish_cents = min(available_to_garnish, remaining_loan_due_cents)
        remaining_balance_cents = current_balance_cents - garnish_cents
        remaining_debt_after_garnishment = remaining_loan_due_cents - garnish_cents
        is_fully_settled = remaining_debt_after_garnishment <= 0

        return garnish_cents, remaining_balance_cents, is_fully_settled

    @classmethod
    def validate_loan_request(
        cls,
        bank_reserves_cents: int,
        requested_gold: int,
        member_account: Dict[str, Any],
        active_loans_count: int = 0,
        simulate_active: bool = False,
        payment_methods: list = None
    ) -> Tuple[bool, str]:
        """
        Validates an incoming loan application.
        """
        facility = cls.evaluate_lending_facility(bank_reserves_cents)
        if not facility["is_active"] and not simulate_active:
            return False, facility["status_message"]

        if requested_gold <= 0:
            return False, "Requested loan amount must be greater than 0 Gold."

        # Reserve limit check
        max_allowed = facility["max_loan_gold"]
        if simulate_active and max_allowed <= 0:
            max_allowed = 5000  # Default staging ceiling for simulation mode

        if requested_gold > max_allowed:
            return False, f"Requested amount ({requested_gold:,} Gold) exceeds maximum allowable loan ceiling ({max_allowed:,} Gold)."

        # Limit: 1 concurrent active/overdue loan per member
        if active_loans_count > 0:
            return False, "Only one active loan facility permitted per member. Settle existing loan obligation first."

        # Restriction check: borrower must not have restricted, downgraded, or frozen accounts
        role = member_account.get("role", "member")
        if role in ("restricted", "downgraded", "frozen", "delinquent"):
            return False, "Account access is currently restricted due to outstanding loan balance. Settle outstanding loan to restore full member privileges."

        # Creditworthiness check
        credit = cls.evaluate_borrower_creditworthiness(member_account, payment_methods)
        borrower_cap = int(credit["borrower_cap_gold"])
        if requested_gold > borrower_cap:
            return False, (
                f"Requested amount ({requested_gold:,} Gold) exceeds your current credit tier ceiling "
                f"({borrower_cap:,} Gold) for tier '{credit['credit_tier']}'. Build positive deposit volume "
                f"or link additional verified accounts to expand your credit limit."
            )

        return True, f"Loan request authorized under 0.05% reserve policy (14-day return window, 50% penalty interest on default, 20 Gold balance buffer protected)."


