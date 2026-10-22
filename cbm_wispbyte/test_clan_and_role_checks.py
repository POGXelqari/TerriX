#!/usr/bin/env python3
"""
Test Suite: Clan Tag Extraction, Normalization & Role Verification
==================================================================
Validates:
1. clean_clan_tag, clans_match, and extract_clan_tag on emojis, Unicode, Cyrillic, and sentinel values.
2. Handling of variation selectors (\ufe0f), zero-width characters, and Unicode NFKC normalization.
3. extract_profile_metadata priority and role determination (leader, officer, member).
4. is_privileged_role evaluation across administrative, council, leader, and staff roles.
5. check_clan_requirement resolution against handles, database records, and payload attestations.
6. HTTP integration for product attestation with emoji clan tags.
"""

import os
import sys
import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import HTTPServer

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from gold_api_client import (
    clean_clan_tag,
    clans_match,
    extract_clan_tag,
    extract_profile_metadata,
    TerritorialGoldClient,
)
from db_layer import CBMDatabase, is_privileged_role, PRIVILEGED_ROLES
from main import CBMHealthHandler, db, check_clan_requirement

OFFICIAL_TOKEN = "cbm_live_2063e984d4e66cbd90cc1fcc33e54a1199d5a978"


class TestClanAndRoleChecks(unittest.TestCase):

    def test_01_clean_clan_tag_basic_and_sentinels(self):
        """clean_clan_tag strips brackets, whitespace, and filters out sentinels."""
        self.assertEqual(clean_clan_tag("KILR"), "KILR")
        self.assertEqual(clean_clan_tag("[KILR]"), "KILR")
        self.assertEqual(clean_clan_tag(" [ANTI-OG] "), "ANTI-OG")
        self.assertEqual(clean_clan_tag("(POG)"), "POG")
        # Sentinels
        self.assertEqual(clean_clan_tag("None"), "")
        self.assertEqual(clean_clan_tag("none"), "")
        self.assertEqual(clean_clan_tag("null"), "")
        self.assertEqual(clean_clan_tag("undefined"), "")
        self.assertEqual(clean_clan_tag(""), "")
        self.assertEqual(clean_clan_tag(None), "")

    def test_02_clean_clan_tag_emojis_and_unicode(self):
        """clean_clan_tag correctly preserves and normalizes emojis and Unicode scripts."""
        self.assertEqual(clean_clan_tag("[👑]"), "👑")
        self.assertEqual(clean_clan_tag("👑"), "👑")
        # Variation selector-16 (\ufe0f) is stripped to canonical base
        self.assertEqual(clean_clan_tag("[⚔️]"), "⚔")
        self.assertEqual(clean_clan_tag("⚔"), "⚔")
        self.assertEqual(clean_clan_tag("[🔥]"), "🔥")
        self.assertEqual(clean_clan_tag("[⚡]"), "⚡")
        self.assertEqual(clean_clan_tag("[✨PRO✨]"), "✨PRO✨")
        self.assertEqual(clean_clan_tag("[КОТ]"), "КОТ")
        self.assertEqual(clean_clan_tag("[Δ]"), "Δ")

    def test_03_clans_match(self):
        """clans_match accurately equates clan tags across casings and emoji variation selectors."""
        # Emoji matching with and without variation selector
        self.assertTrue(clans_match("⚔️", "⚔"))
        self.assertTrue(clans_match("[⚔️]", "⚔"))
        self.assertTrue(clans_match("👑", "👑"))
        self.assertTrue(clans_match("[👑]", "👑"))
        self.assertTrue(clans_match("[ 👑 ]", "👑"))
        # Unicode casing
        self.assertTrue(clans_match("kilr", "KILR"))
        self.assertTrue(clans_match("[KILR]", "kilr"))
        self.assertTrue(clans_match("кот", "КОТ"))
        # Mismatches
        self.assertFalse(clans_match("👑", "⚔️"))
        self.assertFalse(clans_match("KILR", "ANTI-OG"))
        self.assertFalse(clans_match("None", "None"))
        self.assertFalse(clans_match("", "KILR"))

    def test_04_extract_clan_tag(self):
        """extract_clan_tag retrieves normalized clan tags from player usernames."""
        self.assertEqual(extract_clan_tag("[👑] King"), "👑")
        self.assertEqual(extract_clan_tag("King [👑]"), "👑")
        self.assertEqual(extract_clan_tag("[⚔️] Warrior"), "⚔")
        self.assertEqual(extract_clan_tag("[✨PRO✨] Player"), "✨PRO✨")
        self.assertEqual(extract_clan_tag("[КОТ] Мурзик"), "КОТ")
        self.assertEqual(extract_clan_tag("[ ANTI-OG ] Bob"), "ANTI-OG")
        self.assertEqual(extract_clan_tag("(POG) Champion"), "POG")
        self.assertEqual(extract_clan_tag("PlayerWithoutTag"), "")

    def test_05_extract_profile_metadata_roles_and_priority(self):
        """extract_profile_metadata evaluates clan and role for Territorial.io account data."""
        # 1. Emoji clan member
        acc_member = {
            "username": "[👑] RoyalPlayer",
            "clan_member_clan_a": "",
            "clan_leader_clan": "",
        }
        disp, clan, role = extract_profile_metadata(acc_member)
        self.assertEqual(disp, "[👑] RoyalPlayer")
        self.assertEqual(clan, "👑")
        self.assertEqual(role, "member")

        # 2. Emoji clan leader
        acc_leader = {
            "username": "[👑] KingArthur",
            "clan_member_clan_a": "👑",
            "clan_leader_clan": "👑",
        }
        disp, clan, role = extract_profile_metadata(acc_leader)
        self.assertEqual(clan, "👑")
        self.assertEqual(role, "leader")

        # 3. Leader with variation selector difference
        acc_leader_vs = {
            "username": "[⚔️] Knight",
            "clan_member_clan_a": "⚔",
            "clan_leader_clan": "⚔️", # Has \ufe0f
        }
        disp, clan, role = extract_profile_metadata(acc_leader_vs)
        self.assertEqual(clan, "⚔")
        self.assertEqual(role, "leader")

        # 4. Officer via admin_points
        acc_officer_pts = {
            "username": "[⚡] Moderator",
            "clan_member_clan_a": "⚡",
            "admin_points": 50,
        }
        disp, clan, role = extract_profile_metadata(acc_officer_pts)
        self.assertEqual(clan, "⚡")
        self.assertEqual(role, "officer")

        # 5. Officer via admin_rank
        acc_officer_rank = {
            "username": "[⚡] OfficerGuy",
            "clan_member_clan_a": "⚡",
            "admin_rank": 25,
        }
        disp, clan, role = extract_profile_metadata(acc_officer_rank)
        self.assertEqual(role, "officer")

        # 6. Fallback for untagged account
        acc_plain = {
            "username": "SoloGamer",
            "clan_member_clan_a": "",
            "clan_leader_clan": "",
        }
        disp, clan, role = extract_profile_metadata(acc_plain)
        self.assertEqual(clan, "None")
        self.assertEqual(role, "member")

    def test_06_is_privileged_role(self):
        """is_privileged_role accepts all executive, staff, and leadership roles."""
        self.assertTrue(is_privileged_role("admin"))
        self.assertTrue(is_privileged_role("council"))
        self.assertTrue(is_privileged_role("leader"))
        self.assertTrue(is_privileged_role("co-leader"))
        self.assertTrue(is_privileged_role("officer"))
        self.assertTrue(is_privileged_role("system"))
        # Case insensitivity
        self.assertTrue(is_privileged_role("LEADER"))
        self.assertTrue(is_privileged_role(" Officer "))

        # Non-privileged
        self.assertFalse(is_privileged_role("member"))
        self.assertFalse(is_privileged_role("guest"))
        self.assertFalse(is_privileged_role("restricted"))
        self.assertFalse(is_privileged_role("delinquent"))
        self.assertFalse(is_privileged_role(""))
        self.assertFalse(is_privileged_role(None))

    def test_07_check_clan_requirement(self):
        """check_clan_requirement validates clan membership across handles, DB records, and payloads."""
        # Setup temporary test account in DB
        test_uname = "test_emoji_user_99"
        db.register_or_get_account(test_uname, display_name=f"[👑] {test_uname}", clan_tag="👑")

        # 1. Matches against stored clan_tag
        self.assertTrue(check_clan_requirement(db, test_uname, "👑"))
        self.assertTrue(check_clan_requirement(db, test_uname, "[👑]"))

        # 2. Matches against raw handle with brackets
        self.assertTrue(check_clan_requirement(db, f"[👑] {test_uname}", "👑"))

        # 3. Matches emoji with variation selector mismatch
        test_sword = "test_sword_user_99"
        db.register_or_get_account(test_sword, display_name=f"[⚔] {test_sword}", clan_tag="⚔")
        self.assertTrue(check_clan_requirement(db, test_sword, "⚔️"))

        # 4. Matches via extra_payload
        self.assertTrue(check_clan_requirement(db, "unregistered_player", "KILR", extra_payload={"clan": "KILR"}))
        self.assertTrue(check_clan_requirement(db, "unregistered_player", "👑", extra_payload={"player_name": "[👑] Guest"}))

        # 5. Rejects mismatch
        self.assertFalse(check_clan_requirement(db, test_uname, "KILR"))
        self.assertFalse(check_clan_requirement(db, "PlainNoTagUser", "👑"))


class TestClanAndRoleHttpEndpoints(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.db = db
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def _request(self, method: str, path: str, headers: dict = None, body: dict = None) -> tuple:
        url = f"http://127.0.0.1:{self.port}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Accept", "application/json")
        if body is not None:
            req.add_header("Content-Type", "application/json")
        if headers:
            for k, v in headers.items():
                req.add_header(k, v)
        try:
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                raw = resp.read().decode("utf-8")
                return resp.status, json.loads(raw)
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                return e.code, json.loads(raw)
            except Exception:
                return e.code, {"error": raw}

    def test_08_http_emoji_clan_verification(self):
        """Tests requirement verification over HTTP with emoji and standard clan tags."""
        # Create a test product requiring an emoji clan tag [👑]
        ok_p, prod_data = db.create_product(
            owner_account="B8bbq",
            name="Crown Clan Cosmetic",
            description="Free cosmetic for [👑] clan members",
            price_gold=0.0,
            requires_client_verification=True,
            requirement_meta={"clan": "👑"}
        )
        self.assertTrue(ok_p)
        prod_id = prod_data["product_id"]

        # 1. Attestation with matching emoji handle -> 200 OK
        status_ok, res_ok = self._request(
            "POST",
            f"/api/v1/products/{prod_id}/verify-requirement",
            headers={"X-CBM-API-Key": OFFICIAL_TOKEN},
            body={
                "account": "Player [👑]",
                "client_verified": True,
                "client_id": "terrix_client",
                "ttl_seconds": 1800,
                "payload": {"clan": "👑"}
            }
        )
        self.assertEqual(status_ok, 200, f"Expected 200 for emoji clan: {res_ok}")
        self.assertTrue(res_ok.get("verified"))

        # 2. Attestation without emoji clan -> 403 Forbidden
        status_fail, res_fail = self._request(
            "POST",
            f"/api/v1/products/{prod_id}/verify-requirement",
            headers={"X-CBM-API-Key": OFFICIAL_TOKEN},
            body={
                "account": "PlayerWithoutTag",
                "client_verified": True,
                "client_id": "terrix_client",
                "ttl_seconds": 1800
            }
        )
        self.assertEqual(status_fail, 403, f"Expected 403 for missing emoji clan: {res_fail}")
        self.assertFalse(res_fail.get("verified"))


if __name__ == "__main__":
    unittest.main()
