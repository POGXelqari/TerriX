#!/usr/bin/env python3
"""
CBM War & Bot Economy Engine
=============================
Pure state machine, economic target math, lifecycle transitions,
and profit/loss accounting for Clan Bank Manager Two-Clan War operations.
"""

from typing import Dict, Any, Optional, Tuple, Set


class BotState:
    PROVISIONING = "PROVISIONING"
    READY = "READY"
    RESERVED = "RESERVED"
    RUNNING = "RUNNING"
    PAYOUT_PENDING = "PAYOUT_PENDING"
    ACCOUNT_MISSING = "ACCOUNT_MISSING"
    AT_RISK = "AT_RISK"
    STOPPED = "STOPPED"
    RETIRED = "RETIRED"


class WarState:
    DRAFT = "DRAFT"
    READY = "READY"
    ACTIVE = "ACTIVE"
    RUNNING = "RUNNING"
    STOPPING = "STOPPING"
    ENDED = "ENDED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


VALID_BOT_STATUSES: Set[str] = {
    "PROVISIONING",
    "READY",
    "RESERVED",
    "RUNNING",
    "PAYOUT_PENDING",
    "ACCOUNT_MISSING",
    "AT_RISK",
    "STOPPED",
    "RETIRED"
}

VALID_WAR_STATUSES: Set[str] = {
    "DRAFT",
    "READY",
    "ACTIVE",
    "RUNNING",
    "STOPPING",
    "ENDED",
    "COMPLETED",
    "FAILED",
    "CANCELLED"
}

VALID_BOT_TRANSITIONS: Dict[str, Set[str]] = {
    "PROVISIONING": {"READY", "ACCOUNT_MISSING", "RETIRED"},
    "READY": {"RESERVED", "RETIRED", "PROVISIONING"},
    "RESERVED": {"RUNNING", "READY", "STOPPED"},
    "RUNNING": {"PAYOUT_PENDING", "ACCOUNT_MISSING", "AT_RISK", "STOPPED"},
    "PAYOUT_PENDING": {"READY", "ACCOUNT_MISSING", "AT_RISK", "STOPPED"},
    "ACCOUNT_MISSING": {"RETIRED", "READY"},
    "AT_RISK": {"READY", "ACCOUNT_MISSING", "RETIRED", "STOPPED"},
    "STOPPED": {"READY", "RETIRED"},
    "RETIRED": set()
}

VALID_WAR_TRANSITIONS: Dict[str, Set[str]] = {
    "DRAFT": {"READY", "ACTIVE", "RUNNING", "FAILED", "CANCELLED"},
    "READY": {"ACTIVE", "RUNNING", "DRAFT", "FAILED", "CANCELLED"},
    "ACTIVE": {"STOPPING", "ENDED", "COMPLETED", "FAILED", "CANCELLED"},
    "RUNNING": {"STOPPING", "ENDED", "COMPLETED", "FAILED", "CANCELLED"},
    "STOPPING": {"ENDED", "COMPLETED", "FAILED"},
    "ENDED": set(),
    "COMPLETED": set(),
    "FAILED": set(),
    "CANCELLED": set()
}


def calculate_targets(investment_cents: int) -> Dict[str, int]:
    """
    Computes integer-cent financial targets for bot investment.
    Formula:
        target_balance = I + (2 * I) = 3 * I
        earned_payout  = target_balance - I = 2 * I
    """
    if not isinstance(investment_cents, int) or isinstance(investment_cents, bool):
        raise ValueError("investment_cents must be an integer")
    if investment_cents <= 0:
        raise ValueError("investment_cents must be strictly greater than 0")

    target_cents = investment_cents * 3
    payout_cap_cents = investment_cents * 2

    return {
        "invested_cents": investment_cents,
        "target_cents": target_cents,
        "payout_cap_cents": payout_cap_cents
    }


def calculate_investment_targets(investment_cents: int) -> Tuple[int, int]:
    """Returns (target_gold_cents, payout_cap_cents) in integer cents."""
    res = calculate_targets(investment_cents)
    return res["target_cents"], res["payout_cap_cents"]


def validate_bot_transition(current_status: str, next_status: str) -> bool:
    """Validates if bot account state transition conforms to lifecycle rules."""
    current = str(current_status).upper().strip()
    target = str(next_status).upper().strip()

    if current == target:
        return True

    allowed = VALID_BOT_TRANSITIONS.get(current, set())
    return target in allowed


def validate_war_transition(current_status: str, next_status: str) -> bool:
    """Validates if war lifecycle state transition conforms to state machine rules."""
    current = str(current_status).upper().strip()
    target = str(next_status).upper().strip()

    if current == target:
        return True

    allowed = VALID_WAR_TRANSITIONS.get(current, set())
    return target in allowed


def calculate_war_financials(
    capital_committed_cents: int,
    gross_earnings_cents: int = 0,
    vault_inflow_cents: int = 0,
    capital_loss_cents: int = 0,
    fee_cents: int = 0
) -> Dict[str, Any]:
    """
    Calculates audited war profit and loss metrics in integer cents:
    - Capital Committed: Total investment I allocated to bots in this war.
    - Gross Earnings: External runner-reported earnings above baseline.
    - Vault Inflow: Actual matched WAR_PROFIT donations received by DdcBC.
    - Verified Fees: Fees incurred on authorized transfers.
    - Capital At Risk: Committed capital not yet recovered or lost.
    - War Profit: vault_inflow - capital_loss - fee_cents (floored at 0).
    - War Loss: (capital_loss + fee_cents) - vault_inflow (floored at 0).
    """
    committed = max(0, int(capital_committed_cents))
    gross = max(0, int(gross_earnings_cents))
    inflow = max(0, int(vault_inflow_cents))
    loss = max(0, int(capital_loss_cents))
    fees = max(0, int(fee_cents))

    net_outcome = inflow - (loss + fees)
    war_profit = max(0, net_outcome)
    war_loss = max(0, -net_outcome) if net_outcome < 0 else 0

    capital_at_risk = max(0, committed - inflow - loss)
    target_cents = committed * 3
    payout_cap_cents = committed * 2

    return {
        "capital_committed_cents": committed,
        "gross_earnings_cents": gross,
        "vault_inflow_cents": inflow,
        "capital_loss_cents": loss,
        "fee_cents": fees,
        "capital_at_risk_cents": capital_at_risk,
        "profit_cents": war_profit,
        "loss_cents": war_loss,
        "investment_gold": round(committed / 100.0, 2),
        "target_gold": round(target_cents / 100.0, 2),
        "payout_cap_gold": round(payout_cap_cents / 100.0, 2)
    }
