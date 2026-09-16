"""
CBM Developer Platform - Official Discord Bot SDK
Zero-dependency Python SDK for Clan Bank Manager (CBM) API v1.

Usage:
    from cbm_discord_sdk import CBMClient, CBMDiscordEmbeds

    client = CBMClient(api_key="cbm_live_YOUR_KEY_HERE")
    status = client.get_bank_status()
    embed = CBMDiscordEmbeds.bank_status_embed(status)
"""

import json
import urllib.request
import urllib.error
import urllib.parse
from typing import Dict, Any, Optional

DEFAULT_BASE_URL = "https://cbm.wispbyte.org"

class CBMAPIError(Exception):
    """Raised when the CBM API returns an error or non-200 status code."""
    def __init__(self, status_code: int, error_code: str, message: str, payload: Optional[dict] = None):
        super().__init__(f"[{status_code} {error_code}] {message}")
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.payload = payload or {}

class CBMClient:
    """
    Standard synchronous CBM API v1 Client.
    Thread-safe and zero external dependencies.
    """
    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 10.0,
        is_sandbox: bool = False
    ):
        self.api_key = api_key.strip()
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.is_sandbox = is_sandbox or self.api_key.startswith("cbm_test_")

    def _request(
        self,
        method: str,
        path: str,
        body: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        if params:
            qs = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
            url = f"{url}?{qs}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "CBM-Discord-SDK/1.0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        if self.is_sandbox:
            headers["X-CBM-Environment"] = "sandbox"

        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                resp_bytes = resp.read()
                return json.loads(resp_bytes.decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = {}
            try:
                err_body = json.loads(e.read().decode("utf-8"))
            except Exception:
                pass
            err_code = err_body.get("error", "http_error")
            err_msg = err_body.get("message", e.reason)
            raise CBMAPIError(e.code, err_code, err_msg, err_body)
        except Exception as ex:
            raise CBMAPIError(500, "network_error", str(ex))

    # --- Endpoints ---

    def get_bank_status(self) -> Dict[str, Any]:
        """Queries live vault solvency, unencumbered reserves, liabilities, and status."""
        return self._request("GET", "/api/v1/bank/status")

    def get_bank_reserves(self) -> Dict[str, Any]:
        """Queries central bank reserve floor, progress, and lending facility status."""
        return self._request("GET", "/api/v1/bank/reserves")

    def get_member(self, username: str) -> Dict[str, Any]:
        """Queries public financial statement, verification tier, and gold deposits for a member."""
        clean_user = urllib.parse.quote(username.strip())
        return self._request("GET", f"/api/v1/members/{clean_user}")

    def get_member_loans(self, username: str) -> Dict[str, Any]:
        """Queries borrower creditworthiness, active loans, and borrowing limit."""
        clean_user = urllib.parse.quote(username.strip())
        return self._request("GET", f"/api/v1/members/{clean_user}/loans")

    def declare_donation(self, account_name: str, amount_gold: float, message: str = "") -> Dict[str, Any]:
        """
        Creates a 15-minute donation intent slip.
        Returns target account and in-game gold transfer instructions.
        """
        return self._request("POST", "/api/v1/donations/declare", body={
            "account_name": account_name.strip(),
            "amount_gold": float(amount_gold),
            "message": message.strip()
        })

    def verify_player(self, player_name: str) -> Dict[str, Any]:
        """Checks if a Territorial.io player account is verified on CBM."""
        return self._request("POST", "/api/v1/verify/player", body={
            "player_name": player_name.strip()
        })

    def get_donors_leaderboard(self, limit: int = 10) -> Dict[str, Any]:
        """Fetches top clan donors (Clan War Chest Honor Roll)."""
        return self._request("GET", "/api/v1/donors/leaderboard", params={"limit": limit})


class CBMDiscordEmbeds:
    """
    Pre-formatted Discord embed dictionary generators for Discord.py / Disnake.
    Can be passed directly into `discord.Embed.from_dict(...)`.
    """
    EMBED_COLOR_VIOLET = 0xa855f7
    EMBED_COLOR_GOLD = 0xffc83b
    EMBED_COLOR_EMERALD = 0x10b981

    @classmethod
    def bank_status_embed(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        bank = data.get("bank", {})
        solvency = bank.get("solvency_ratio_percent", 0.0)
        status_str = "🟢 Fully Solvent" if solvency >= 100 else "🟡 Capital Restructuring"

        return {
            "title": "🏛️ Clan Bank Manager (CBM) • Solvency Report",
            "description": f"**Solvency Status:** {status_str} (`{solvency:.2f}%`)",
            "color": cls.EMBED_COLOR_VIOLET,
            "fields": [
                {
                    "name": "Vault Account",
                    "value": f"`{bank.get('vault_account', 'DdcBC')}`",
                    "inline": True
                },
                {
                    "name": "Total Gold in Vault",
                    "value": f"**{bank.get('vault_total_gold', 0.0):,.2f}** Gold",
                    "inline": True
                },
                {
                    "name": "Member Liabilities",
                    "value": f"{bank.get('member_liabilities_gold', 0.0):,.2f} Gold",
                    "inline": True
                },
                {
                    "name": "Unencumbered Reserves",
                    "value": f"**{bank.get('unencumbered_reserves_gold', 0.0):,.2f}** Gold",
                    "inline": True
                },
                {
                    "name": "Central Bank Cushion",
                    "value": f"{bank.get('reserve_cushion_gold', 0.0):,.2f} Gold",
                    "inline": True
                },
                {
                    "name": "Solvency Tier",
                    "value": f"`{bank.get('solvency_tier', 'UNRESTRICTED_RESERVES')}`",
                    "inline": True
                }
            ],
            "footer": {
                "text": "CBM Master Runtime Telemetry • Automated In-Game Verification"
            }
        }

    @classmethod
    def donation_slip_embed(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        instr = data.get("donation_instructions", {})
        target = instr.get("target_vault_account", "DdcBC")
        amount = instr.get("exact_amount_gold", 0.0)
        donor = instr.get("donor_name", "Member")

        return {
            "title": "🏆 Clan War Chest • In-Game Donation Instructions",
            "description": (
                f"**Donor:** `{donor}`\n"
                f"**Amount to Send:** **{amount:,.2f} Gold**\n\n"
                f"1. Open Territorial.io in-game banking.\n"
                f"2. Send **exactly {amount:,.2f} Gold** to account: **`{target}`**\n"
                f"3. CBM will detect and credit your donation within 60 seconds."
            ),
            "color": cls.EMBED_COLOR_GOLD,
            "footer": {
                "text": "15-minute intent slip registered • Non-refundable unencumbered reserve"
            }
        }

    @classmethod
    def member_profile_embed(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        m = data.get("member", {})
        verified_str = "Verified Clan Member" if m.get("is_verified") else "Unverified"

        return {
            "title": f"👤 Member Statement • {m.get('account_name', 'Player')}",
            "description": f"Clan Tag: `{m.get('clan_tag', 'ANTI-OG')}` • Status: **{verified_str}**",
            "color": cls.EMBED_COLOR_VIOLET,
            "fields": [
                {
                    "name": "Deposited Balance",
                    "value": f"**{m.get('deposited_gold', 0.0):,.2f}** Gold",
                    "inline": True
                },
                {
                    "name": "Total Transacted",
                    "value": f"{m.get('total_transacted_gold', 0.0):,.2f} Gold",
                    "inline": True
                },
                {
                    "name": "Primary In-Game Account",
                    "value": f"`{m.get('primary_territorial_account', 'N/A')}`",
                    "inline": True
                }
            ],
            "footer": {
                "text": "Programmatic Banking API v1"
            }
        }
