#!/usr/bin/env python3
"""
Territorial.io Gold & Account API Client
========================================
Production-grade client for Territorial.io HTTP JSON API:
- POST /api/account/get : Query balances, leaderboards, stats (Cost: 0.10 Gold / 10 cents)
- POST /api/gold/send   : Peer-to-peer gold transfer (Cost: 0.01 Gold / 1 cent + tx fee)
- POST /api/clan/stats/get : Historic clan performance metrics
- GET  /log/transactions: Public ledger stream verification
"""

import os
import sys
import json
import time
import ssl
import re
import unicodedata
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List, Tuple
from resilient_fetcher import fetcher

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

class TerritorialGoldClient:
    def __init__(self, account_name: str, password: str, timeout: float = 10.0):
        self.account_name = account_name
        self.password = password
        self.timeout = timeout
        self.base_url = "https://territorial.io"
        self._ssl_ctx = ssl.create_default_context()

    def _post(self, endpoint: str, payload: dict) -> Tuple[int, Dict[str, Any]]:
        """Sends an authenticated POST request to territorial.io API."""
        url = f"{self.base_url}{endpoint}"
        body = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        try:
            status_code, resp_bytes, _ = fetcher.fetch(
                url,
                method="POST",
                data=body,
                headers=headers,
                timeout=self.timeout
            )
            raw = resp_bytes.decode("utf-8", errors="replace")
            try:
                data = json.loads(raw)
            except Exception:
                data = {"status": "parse_error", "code": status_code, "raw": raw}
            return status_code, data
        except Exception as e:
            return 0, {"status": "client_error", "message": str(e)}

    @staticmethod
    def normalize_account_metrics(raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes Territorial.io fixed-point integers into decimal float metrics:
        - gold: divide gold_cents by 100
        - br_points: divide by 100
        - clan points (points_a, points_b, total_a, total_b): divide by 100
        - clan leader points: divide by 10
        - zombie points: divide by 100
        - 1v1 points / ELO (ovo_elo): divide by 10
        """
        disp, clan_tag, role = extract_profile_metadata(raw)
        return {
            "gold": round(raw.get("gold_cents", 0) / 100.0, 2),
            "br_points": round(raw.get("br_points", 0) / 100.0, 2),
            "clan_points_a": round(raw.get("clan_member_points_a", 0) / 100.0, 2),
            "clan_points_b": round(raw.get("clan_member_points_b", 0) / 100.0, 2),
            "clan_total_points_a": round(raw.get("clan_member_total_points_a", 0) / 100.0, 2),
            "clan_total_points_b": round(raw.get("clan_member_total_points_b", 0) / 100.0, 2),
            "clan_leader_points": round(raw.get("clan_leader_points", 0) / 10.0, 1),
            "zombie_points": round(raw.get("zombie_points", 0) / 100.0, 2),
            "ovo_elo": round(raw.get("ovo_elo", 0) / 10.0, 1),
            "username": raw.get("username", ""),
            "clan_a": raw.get("clan_member_clan_a", ""),
            "clan_b": raw.get("clan_member_clan_b", ""),
            "clan_leader_clan": raw.get("clan_leader_clan", ""),
            "clan_tag": clan_tag,
            "role": role,
            "display_name": disp,
            "gold_rank": raw.get("gold_rank", 0),
            "br_rank": raw.get("br_rank", 0),
            "zombie_rank": raw.get("zombie_rank", 0),
            "ovo_rank": raw.get("ovo_rank", 0),
            "admin_rank": raw.get("admin_rank", 0),
            "admin_points": raw.get("admin_points", 0),
        }

    @staticmethod
    def extract_profile_metadata(account_data: Dict[str, Any]) -> Tuple[str, str, str]:
        """
        Extracts normalized (display_name, clan_tag, role) from Territorial.io account_data.
        """
        return extract_profile_metadata(account_data)

    def get_account_data(self, target_account_name: Optional[str] = None, normalize: bool = True) -> Dict[str, Any]:
        """
        Retrieves comprehensive account profile, rankings, and gold balance.
        Note: Incurs an API fee of 10 cents (0.10 Gold) on the authenticated caller.
        """
        target = target_account_name or self.account_name
        payload = {
            "account_name": self.account_name,
            "password": self.password,
            "target_account_name": target
        }
        status, resp = self._post("/api/account/get", payload)
        if normalize and resp.get("status") == "ok" and "account_data" in resp:
            resp["normalized_metrics"] = self.normalize_account_metrics(resp["account_data"])
        return resp

    def get_gold_balance(self, target_account_name: Optional[str] = None) -> Tuple[float, int]:
        """
        Returns (gold_units: float, gold_cents: int).
        """
        data = self.get_account_data(target_account_name)
        if data.get("status") == "ok" and "account_data" in data:
            cents = data["account_data"].get("gold_cents", 0)
            return (cents / 100.0, cents)
        return (0.0, 0)

    def send_gold(self, target_account_name: str, amount: int) -> Dict[str, Any]:
        """
        Transfers Gold to target account.
        amount: Whole integer units of Gold (e.g., 1 = 1.0 Gold).
        Note: Incurs 1 cent (0.01 Gold) API fee plus 0-1% network transaction fee.
        """
        if amount <= 0:
            return {"status": "amount error", "message": "Amount must be greater than 0"}

        payload = {
            "account_name": self.account_name,
            "password": self.password,
            "target_account_name": target_account_name,
            "amount": int(amount)
        }
        status, resp = self._post("/api/gold/send", payload)
        return resp

    def get_clan_stats(self, clan: str, timeframe: str = "D1") -> Dict[str, Any]:
        """
        Retrieves historical performance stats for a given clan.
        Timeframes: M1, M5, H1, H4, D1, W1, MN.
        Note: Incurs an API fee of 10 cents (0.10 Gold).
        """
        payload = {
            "account_name": self.account_name,
            "password": self.password,
            "clan": clan,
            "timeframe": timeframe
        }
        status, resp = self._post("/api/clan/stats/get", payload)
        return resp

    @staticmethod
    def get_public_transactions(limit: int = 50, filter_account: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Scrapes and parses the public ledger at https://territorial.io/log/transactions.
        Returns recent transactions matching filter criteria.
        """
        url = "https://territorial.io/log/transactions"
        txs = []
        try:
            status_code, resp_bytes, _ = fetcher.fetch(url, method="GET", timeout=10.0)
            if status_code != 200:
                return txs
            text = resp_bytes.decode("utf-8", errors="replace")
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            for line in lines:
                parts = line.split(",")
                if len(parts) >= 5 and parts[0].isdigit():
                    ts = int(parts[0])
                    sender = parts[1]
                    receiver = parts[2]
                    amt = float(parts[3])
                    fee = float(parts[4])

                    if filter_account:
                        if filter_account.lower() not in (sender.lower(), receiver.lower()):
                            continue

                    txs.append({
                        "timestamp_ms": ts,
                        "timestamp_iso": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime(ts / 1000.0)),
                        "sender": sender,
                        "receiver": receiver,
                        "amount_gold": amt,
                        "fee_gold": fee
                    })
        except Exception as e:
            print(f"[!] Error fetching transaction log: {e}")
        return txs

GoldApiClient = TerritorialGoldClient


def clean_clan_tag(val: Any) -> str:
    """
    Cleans, strips, and normalizes a clan tag or bracketed string:
    - Strips outer brackets if present (e.g. '[👑]' -> '👑')
    - Strips surrounding whitespace
    - Normalizes Unicode using NFKC
    - Strips invisible codepoints, variation selectors (U+FE00 through U+FE0F),
      zero-width spaces/joiners (\u200b-\u200d\u2060\ufeff)
    - Filters out null/sentinel values ('none', 'null', 'undefined', '')
    """
    if val is None:
        return ""
    s = str(val).strip()
    if not s:
        return ""
    # Strip enclosing square or round brackets if paired
    if (s.startswith("[") and s.endswith("]")) or (s.startswith("(") and s.endswith(")")):
        if len(s) >= 2:
            s = s[1:-1].strip()
    # Normalize unicode (NFKC)
    s = unicodedata.normalize("NFKC", s)
    # Strip variation selectors and zero-width joiners/spaces
    s = re.sub(r"[\ufe00-\ufe0f\u200b-\u200d\u2060\ufeff]", "", s)
    s = s.strip()
    if s.lower() in ("none", "null", "undefined", ""):
        return ""
    return s


def clans_match(clan1: Any, clan2: Any) -> bool:
    """
    Compares two clan tags for semantic equality with Unicode normalization,
    variation selector removal, and case folding.
    Returns True if both are valid and represent the same clan tag.
    """
    c1 = clean_clan_tag(clan1).casefold()
    c2 = clean_clan_tag(clan2).casefold()
    if not c1 or not c2:
        return False
    return c1 == c2


def extract_clan_tag(text: Any) -> str:
    """
    Extracts and normalizes a clan tag enclosed in brackets from a username or text handle.
    Supports emojis, Unicode scripts (Cyrillic, Greek, etc.), alphanumeric tokens, and symbols.
    Example: '[👑] King' -> '👑', '[⚔️] Warrior' -> '⚔', 'Player [PRO]' -> 'PRO'
    """
    if not text:
        return ""
    s = str(text).strip()
    match = re.search(r"\[([^\[\]\r\n\t]{1,32})\]", s)
    if match:
        clean = clean_clan_tag(match.group(1))
        if clean:
            return clean
    # Also check round brackets if no square brackets present
    match_paren = re.search(r"\(([^()\[\]\r\n\t]{1,32})\)", s)
    if match_paren:
        clean = clean_clan_tag(match_paren.group(1))
        if clean:
            return clean
    return ""


def extract_profile_metadata(account_data: Dict[str, Any]) -> Tuple[str, str, str]:
    """
    Extracts normalized (display_name, clan_tag, role) from Territorial.io /api/account/get account_data.

    1. Display Name: Extracted from raw username.
    2. Clan Tag Priority:
       - Priority 1: clan_member_clan_a (primary monthly score clan)
       - Priority 2: Tag extracted via regex anywhere in username [TAG] (supports emojis & Unicode)
       - Priority 3: clan_member_clan_b
       - Priority 4: clan_leader_clan
       - Fallback: "None"
    3. Role:
       - "leader": if clan_leader_clan is valid AND (no clan_a OR matches clan_a OR matches extracted clan)
       - "officer": if admin_points > 0 or (0 < admin_rank <= 100)
       - Preserves explicit administrative roles ('admin', 'council', 'leader', 'co-leader', 'system', 'officer')
       - Default: "member"
    """
    if not isinstance(account_data, dict):
        return "", "None", "member"

    username = str(account_data.get("username") or "").strip()

    clan_a = clean_clan_tag(account_data.get("clan_member_clan_a"))
    clan_b = clean_clan_tag(account_data.get("clan_member_clan_b"))
    clan_leader_clan = clean_clan_tag(account_data.get("clan_leader_clan"))

    # 1. Clan extraction with robust Unicode & emoji support
    clan = ""
    if clan_a:
        clan = clan_a
    elif username:
        tag_from_name = extract_clan_tag(username)
        if tag_from_name:
            clan = tag_from_name
    if not clan and clan_b:
        clan = clan_b
    if not clan and clan_leader_clan:
        clan = clan_leader_clan
    if not clan:
        clan = "None"

    # 2. Strict role determination with Unicode-safe comparison
    admin_points = account_data.get("admin_points", 0) or 0
    admin_rank = account_data.get("admin_rank", 0) or 0
    existing_role = str(account_data.get("role") or "").strip().lower()

    is_actual_leader = bool(clan_leader_clan) and (
        not clan_a
        or clans_match(clan_leader_clan, clan_a)
        or clans_match(clan_leader_clan, clan)
    )

    if is_actual_leader:
        role = "leader"
    elif admin_points > 0 or (0 < admin_rank <= 100):
        role = "officer"
    elif existing_role in ("admin", "council", "leader", "co-leader", "system", "officer"):
        role = existing_role
    else:
        role = "member"

    display_name = username or ""
    return display_name, clan, role



if __name__ == "__main__":
    # Self-test demonstration (credentials loaded securely from environment)
    test_user = os.environ.get("TERRITORIAL_CLIENT_ACCOUNT", "test_user")
    test_pass = os.environ.get("TERRITORIAL_CLIENT_PASSWORD", "")
    client = TerritorialGoldClient(test_user, test_pass)
    print(f"[*] Fetching recent public transactions involving {test_user}...")
    history = client.get_public_transactions(filter_account=test_user)
    for tx in history:
        print(f"    [{tx['timestamp_iso']}] {tx['sender']} -> {tx['receiver']}: {tx['amount_gold']} Gold (Fee: {tx['fee_gold']})")
