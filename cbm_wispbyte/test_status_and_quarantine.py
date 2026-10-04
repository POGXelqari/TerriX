#!/usr/bin/env python3
"""
Unit & Integration Tests for Discord AutoMod 25h Quarantine & 90-Day Status Telemetry
"""

import os
import sys
import time
import json
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from db_layer import CBMDatabase
from status_engine import CBMStatusEngine, SYSTEM_SERVICES
from bot import record_discord_quarantine, clear_discord_quarantine, COOLDOWN_FILE
from run_automod import get_quarantine_remaining_seconds


class TestStatusAndQuarantine(unittest.TestCase):
    def setUp(self):
        self.test_db_path = os.path.join(BASE_DIR, "test_status_data.db")
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except Exception:
                pass
        self.db = CBMDatabase(sqlite_path=self.test_db_path)
        self.status_engine = CBMStatusEngine(db_instance=self.db)
        if os.path.exists(COOLDOWN_FILE):
            os.remove(COOLDOWN_FILE)

    def tearDown(self):
        if os.path.exists(COOLDOWN_FILE):
            try:
                os.remove(COOLDOWN_FILE)
            except Exception:
                pass
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except Exception:
                pass

    def test_discord_quarantine_record_and_clear(self):
        # 1. Record quarantine
        error_sample = 'Error 1015: Ray ID: <strong>a454988d6d17053c</strong> &bull; You are being rate limited'
        record_discord_quarantine(
            reason="CLOUDFLARE_1015_IP_RATE_LIMITED",
            http_code=429,
            error_text=error_sample
        )
        self.assertTrue(os.path.exists(COOLDOWN_FILE))

        with open(COOLDOWN_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data["status"], "QUARANTINED")
        self.assertEqual(data["ray_id"], "a454988d6d17053c")
        self.assertEqual(data["http_code"], 429)
        self.assertGreater(data["cooldown_until"], time.time())

        # 2. Check remaining time
        rem = get_quarantine_remaining_seconds()
        self.assertGreater(rem, 80000)

        # 3. Check status engine detection
        discord_status = self.status_engine.get_discord_status()
        self.assertEqual(discord_status["status"], "degraded")
        self.assertFalse(discord_status["operational"])
        self.assertIn("Cloudflare 1015 Cooldown", discord_status["label"])

        # 4. Clear quarantine
        clear_discord_quarantine()
        self.assertFalse(os.path.exists(COOLDOWN_FILE))
        self.assertEqual(get_quarantine_remaining_seconds(), 0.0)

    def test_90_day_history_generation(self):
        # Verify exactly 90 days for all services
        for svc in SYSTEM_SERVICES:
            history = self.status_engine.get_90_day_history(svc["id"])
            self.assertEqual(len(history), 90, f"Service {svc['id']} did not yield 90 days")
            # Verify structure
            self.assertIn("date", history[0])
            self.assertIn("uptime_percent", history[0])
            self.assertIn("status", history[0])

    def test_system_telemetry_healthy_and_degraded(self):
        # 1. Healthy state without quarantine
        clear_discord_quarantine()
        telemetry = self.status_engine.get_system_telemetry()
        self.assertEqual(telemetry["status"], "ok")
        self.assertEqual(len(telemetry["services"]), 7)

        # 2. Discord 1015 Quarantine must be ISOLATED from core banking
        record_discord_quarantine(
            reason="CLOUDFLARE_1015_IP_RATE_LIMITED",
            http_code=429,
            error_text="Ray ID: a45499258932e4a9"
        )
        # Invalidate 5s cache for test
        self.status_engine._cached_telemetry_time = 0.0
        isolated_telemetry = self.status_engine.get_system_telemetry()

        # Overall platform remains operational and free of alert banners
        self.assertEqual(isolated_telemetry["overall_status"], "operational")
        self.assertIsNone(isolated_telemetry["global_banner"])

        # But the Discord subsystem itself is accurately reported as degraded on /status.html
        discord_sub = next(s for s in isolated_telemetry["services"] if s["id"] == "discord_gateway")
        self.assertEqual(discord_sub["current_status"], "degraded")
        self.assertIn("Cloudflare 1015 Cooldown", discord_sub["status_label"])

        # 3. An actual banking platform incident properly escalates to degraded
        with self.db.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_service_incidents (incident_id, service_id, title, severity, status, message, created_at)
                VALUES ('inc_test_1', 'vault_daemon', 'Database Sync Delay', 'minor', 'investigating', 'Investigating scrape delay', ?)
            """, (time.time(),))
        self.status_engine._cached_telemetry_time = 0.0
        incident_telemetry = self.status_engine.get_system_telemetry()
        self.assertEqual(incident_telemetry["overall_status"], "degraded")
        self.assertEqual(len(incident_telemetry["active_incidents"]), 1)

        # 4. Expired cooldown lockfile auto-cleans without manual intervention
        expired_data = {
            "status": "QUARANTINED",
            "reason": "EXPIRED_TEST",
            "quarantined_at": time.time() - 100000,
            "cooldown_until": time.time() - 1000,
            "duration_seconds": 90000
        }
        with open(COOLDOWN_FILE, "w", encoding="utf-8") as f:
            json.dump(expired_data, f)
        self.assertTrue(os.path.exists(COOLDOWN_FILE))

        # Accessing status engine must automatically purge expired file
        expired_status = self.status_engine.get_discord_status()
        self.assertEqual(expired_status["status"], "operational" if os.environ.get("DISCORD_BOT_TOKEN") else "unconfigured")
        self.assertFalse(os.path.exists(COOLDOWN_FILE))

    def test_ingress_telemetry_and_dns_probe(self):
        from tunnel_manager import check_domain_dns, CloudflareTunnelManager

        # 1. Primary unmapped domain returns False
        self.assertFalse(check_domain_dns("cbm.wispbyte.org"))

        # 2. Known domain returns True
        self.assertTrue(check_domain_dns("cloudflare.com"))

        # 3. Ingress telemetry reflects failover state accurately
        mgr = CloudflareTunnelManager(port=10093, domain="cbm.wispbyte.org")
        telemetry = mgr.get_ingress_telemetry()
        self.assertFalse(telemetry["primary_resolving"])
        self.assertFalse(telemetry["fallback_active"])

        # When fallback URL is assigned during DNS propagation
        mgr.fallback_url = "https://cbm-automated-failover.trycloudflare.com"
        active_telemetry = mgr.get_ingress_telemetry()
        self.assertTrue(active_telemetry["fallback_active"])
        self.assertEqual(active_telemetry["active_url"], "https://cbm-automated-failover.trycloudflare.com")


if __name__ == "__main__":
    unittest.main()
