#!/usr/bin/env python3
"""
CBM Economic Equilibrium Engine (EEE)
=====================================
Casual gaming enterprise production algorithm managing:
1. Dynamic Liquidity Stress Index (LSI) telemetry.
2. Dynamic Ad Floor Pricing based on ecosystem demand and reserve metrics.
3. Adaptive Loan Risk Ceilings maintaining institutional safe gaps:
   - Minimum 2,000,000.00 Gold unencumbered reserves floor.
   - Strict 0.05% reserve cap (potential ceiling must strictly exceed 1,000 Gold).
   - Macro-solvency ratio >= 1.15 buffer.
   - Liquidity stress index <= 0.10 requirement.
4. Automatic Insolvency Circuit Breakers protecting member deposited assets.
"""

import math
import time
from typing import Dict, Any, List, Optional, Tuple


class CBMEconomicEngine:
    # Safe Gap Institutional Standards
    MIN_RESERVES_FLOOR_GOLD = 2000000.0   # 2,000,000.00 Gold
    MIN_RESERVES_FLOOR_CENTS = 200000000  # 200,000,000 cents
    LOAN_RESERVE_RATIO = 0.0005           # 0.05% of unencumbered reserves
    ACTIVATION_THRESHOLD_GOLD = 1000.0    # 1,000.00 Gold activation minimum
    MIN_SOLVENCY_RATIO = 1.15             # 115% vault-to-liabilities buffer
    MAX_LSI_FOR_LOANS = 0.10              # Strict stress ceiling for loan facility

    @classmethod
    def calculate_macro_telemetry(cls, db_instance) -> Dict[str, Any]:
        """
        Computes real-time macroeconomic health, reserves, and stress metrics.
        """
        treasury = db_instance.get_treasury()
        vault_gold_cents = int(treasury.get("vault_total_gold_cents", 0) or 0)
        liabilities_cents = int(treasury.get("member_liabilities_cents", 0) or 0)
        reserves_cents = int(treasury.get("bank_reserves_cents", 0) or 0)
        unencumbered_cents = int(treasury.get("unencumbered_capital_cents", 0) or reserves_cents)

        vault_gold = vault_gold_cents / 100.0
        liabilities_gold = liabilities_cents / 100.0
        reserves_gold = reserves_cents / 100.0
        unencumbered_gold = unencumbered_cents / 100.0

        # Liquidity Stress Index: (Liabilities) / (Vault Gold)
        if vault_gold > 0:
            lsi = liabilities_gold / vault_gold
            solvency_ratio = vault_gold / liabilities_gold if liabilities_gold > 0 else 999.0
        else:
            lsi = 1.0 if liabilities_gold > 0 else 0.0
            solvency_ratio = 0.0 if liabilities_gold > 0 else 1.0

        # Circuit breaker trigger conditions: active deficit or vault under-collateralization
        circuit_breaker_active = (
            (liabilities_gold > 0 and vault_gold < liabilities_gold) or
            reserves_gold < 0 or
            (liabilities_gold > 0 and solvency_ratio < 1.0)
        )

        return {
            "vault_gold": round(vault_gold, 2),
            "liabilities_gold": round(liabilities_gold, 2),
            "reserves_gold": round(reserves_gold, 2),
            "unencumbered_gold": round(unencumbered_gold, 2),
            "liquidity_stress_index": round(lsi, 4),
            "solvency_ratio": round(solvency_ratio, 4),
            "min_solvency_ratio": cls.MIN_SOLVENCY_RATIO,
            "circuit_breaker_active": circuit_breaker_active,
            "system_health": (
                "INSOLVENCY_ALERT" if circuit_breaker_active else
                "HIGH_STRESS" if lsi >= 0.80 else
                "BALANCED" if lsi >= 0.20 else
                "OPTIMAL"
            ),
            "timestamp": time.time()
        }

    @classmethod
    def evaluate_loan_risk_profile(
        cls,
        db_instance,
        active_loans_count: int = 0,
        defaulted_loans_count: int = 0
    ) -> Dict[str, Any]:
        """
        Enforces institutional safe-gap standards for CBM lending facilities:
        - Must maintain >= 2,000,000 Gold unencumbered reserves.
        - Must maintain >= 1.15 macro solvency buffer.
        - LSI must remain <= 0.10.
        - Adaptive ceiling scales strictly downwards if stress rises.
        """
        macro = cls.calculate_macro_telemetry(db_instance)
        reserves_gold = macro["reserves_gold"]
        solvency = macro["solvency_ratio"]
        lsi = macro["liquidity_stress_index"]
        circuit_breaker = macro["circuit_breaker_active"]

        # Base potential ceiling = 0.05% of unencumbered reserves
        raw_ceiling_gold = reserves_gold * cls.LOAN_RESERVE_RATIO
        
        # Primary qualification check: Safe Gap Rule
        reserves_eligible = (
            reserves_gold >= cls.MIN_RESERVES_FLOOR_GOLD and
            raw_ceiling_gold > cls.ACTIVATION_THRESHOLD_GOLD
        )
        solvency_eligible = solvency >= cls.MIN_SOLVENCY_RATIO
        stress_eligible = lsi <= cls.MAX_LSI_FOR_LOANS
        not_tripped = not circuit_breaker

        # Default rate dampening
        total_historical_loans = active_loans_count + defaulted_loans_count
        default_rate = (defaulted_loans_count / total_historical_loans) if total_historical_loans > 0 else 0.0
        default_safe = default_rate < 0.02  # Less than 2% default rate

        is_facility_active = (
            reserves_eligible and
            solvency_eligible and
            stress_eligible and
            not_tripped and
            default_safe
        )

        # Adaptive contraction multiplier (strictly <= 1.0)
        if is_facility_active:
            stress_factor = max(0.0, 1.0 - (lsi / cls.MAX_LSI_FOR_LOANS) * 0.5)
            adaptive_ceiling_gold = math.floor(raw_ceiling_gold * stress_factor)
        else:
            adaptive_ceiling_gold = 0

        # Detailed rejection/status reason
        if circuit_breaker:
            reason = "Circuit breaker active: Lending frozen to protect member liabilities."
        elif not reserves_eligible:
            reason = (
                f"Lending locked. Bank unencumbered reserves ({reserves_gold:,.2f} Gold) "
                f"do not meet the required {cls.MIN_RESERVES_FLOOR_GOLD:,.0f} Gold institutional safe gap."
            )
        elif not solvency_eligible:
            reason = (
                f"Lending paused. Macro solvency ratio ({solvency:.2f}) is below "
                f"the mandatory {cls.MIN_SOLVENCY_RATIO:.2f} coverage threshold."
            )
        elif not stress_eligible:
            reason = (
                f"Lending temporarily paused. Liquidity Stress Index ({lsi:.3f}) "
                f"exceeds the maximum allowable safe ceiling ({cls.MAX_LSI_FOR_LOANS:.2f})."
            )
        elif not default_safe:
            reason = f"Lending paused. Loan default rate ({default_rate * 100:.1f}%) exceeds the 2.0% threshold."
        else:
            reason = f"Lending active. Safe-gap maximum loan ceiling: {adaptive_ceiling_gold:,} Gold."

        return {
            "is_active": is_facility_active,
            "reserves_gold": reserves_gold,
            "min_reserves_required_gold": cls.MIN_RESERVES_FLOOR_GOLD,
            "reserves_progress_percent": min(100.0, round((reserves_gold / cls.MIN_RESERVES_FLOOR_GOLD) * 100.0, 3)),
            "raw_ceiling_gold": round(raw_ceiling_gold, 2),
            "adaptive_ceiling_gold": adaptive_ceiling_gold,
            "macro_solvency_ratio": solvency,
            "liquidity_stress_index": lsi,
            "circuit_breaker_active": circuit_breaker,
            "status_message": reason
        }

    @classmethod
    def calculate_dynamic_ad_price(
        cls,
        base_price_cents: int,
        macro_telemetry: Dict[str, Any],
        active_sponsors_count: int = 1
    ) -> int:
        """
        Dynamically adjusts ad slot floor pricing to maximize capital formation:
        P_ad = P_base * (1.0 + demand_multiplier) * (1.0 + 0.5 * min(1.0, LSI))
        """
        lsi = macro_telemetry.get("liquidity_stress_index", 0.0)
        # Demand multiplier: scaled if multiple inquiries or high occupancy
        demand_factor = max(0.0, (active_sponsors_count - 1) * 0.25)
        # Stress factor: gentle floor price increase during elevated ecosystem activity
        stress_factor = 0.5 * min(1.0, lsi)

        multiplier = 1.0 + demand_factor + stress_factor
        adjusted_cents = int(round(base_price_cents * multiplier))
        # Round to nearest 500 cents (5 Gold) for clean display
        return max(base_price_cents, (adjusted_cents // 500) * 500)

    @classmethod
    def synchronize_ad_pricing(cls, db_instance):
        """
        Refreshes dynamic ad slot pricing across all inventory slots in database.
        """
        macro = cls.calculate_macro_telemetry(db_instance)
        slots = db_instance.get_sponsorship_slots()
        for slot in slots:
            slot_id = slot["slot_id"]
            base_cents = slot["base_price_cents"]
            new_price_cents = cls.calculate_dynamic_ad_price(base_cents, macro)
            if new_price_cents != slot["current_price_cents"]:
                db_instance.update_sponsorship_slot_price(slot_id, new_price_cents)
