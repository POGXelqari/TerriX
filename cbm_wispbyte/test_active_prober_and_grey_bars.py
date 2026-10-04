#!/usr/bin/env python3
"""
Unit & Integration Tests for Active Synthetic Probing, Immediate Degradation,
and Zero-Mock Grey SLA Bars.
"""

import os
import sys
import time
import json
import unittest
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from db_layer import CBMDatabase
from status_engine import CBMStatusEngine, SYSTEM_SERVICES
from bot import record_discord_quarantine, clear_discord_quarantine, COOLDOWN_FILE


class TestActiveProberAndGreyBars(unittest.TestCase):
    def setUp(self):
        self.test_db_path = os.path.join(BASE_DIR, "test_prober_data.db")
        self.db = CBMDatabase(sqlite_path=self.test_db_path)
        self.status_engine = CBMStatusEngine(db_instance=self.db, port=10093)
        clear_discord_quarantine()

        # Clean database tables cleanly via SQL to avoid Windows SQLite file locking
        with self.db.write_transaction() as (conn, cur):
            cur.execute("DELETE FROM cbm_service_daily_uptime")
            cur.execute("DELETE FROM cbm_service_incidents")
            cur.execute("UPDATE cbm_treasury SET vault_total_gold_cents = 1000000, member_liabilities_cents = 200000 WHERE id = 1")

    def tearDown(self):
        clear_discord_quarantine()
        try:
            with self.db.write_transaction() as (conn, cur):
                cur.execute("DELETE FROM cbm_service_daily_uptime")
                cur.execute("DELETE FROM cbm_service_incidents")
        except Exception:
            pass

    def test_active_probes_healthy_baseline(self):
        """Active probes on healthy baseline return operational with genuine latency."""
        # 1. Probe Credit Billing
        cb_res = self.status_engine.probe_credit_billing()
        self.assertEqual(cb_res["status"], "operational")
        self.assertTrue(cb_res["operational"])
        self.assertGreaterEqual(cb_res["latency_ms"], 0.0)

        # 2. Probe Lending Engine Solvency
        le_res = self.status_engine.probe_lending_engine()
        self.assertEqual(le_res["status"], "operational")
        self.assertTrue(le_res["operational"])
        self.assertIn("Operational", le_res["label"])

        # 3. Probe AI Inference (without API key returns unconfigured cleanly)
        orig_key = os.environ.get("NVIDIA_API_KEY")
        if "NVIDIA_API_KEY" in os.environ:
            del os.environ["NVIDIA_API_KEY"]
        ai_res = self.status_engine.probe_ai_inference()
        self.assertEqual(ai_res["status"], "unconfigured")
        if orig_key:
            os.environ["NVIDIA_API_KEY"] = orig_key

    def test_immediate_solvency_degradation_and_recovery(self):
        """Lending engine immediately degrades when liabilities exceed vault assets."""
        # Register operational prober for web_portal so port 10093 in test process doesn't shadow lending engine
        self.status_engine.register_custom_prober(
            "web_portal",
            lambda: {"status": "operational", "operational": True, "label": "Operational (0.5ms)", "latency_ms": 0.5}
        )

        # Baseline healthy
        res1 = self.status_engine.probe_lending_engine()
        self.assertEqual(res1["status"], "operational")

        # Simulate solvency deficit (Vault: 100 Gold, Liabilities: 500 Gold)
        with self.db.write_transaction() as (conn, cur):
            cur.execute("UPDATE cbm_treasury SET vault_total_gold_cents = 10000, member_liabilities_cents = 50000")

        res_deficit = self.status_engine.probe_lending_engine()
        self.assertEqual(res_deficit["status"], "degraded")
        self.assertFalse(res_deficit["operational"])
        self.assertIn("Solvency Deficit", res_deficit["label"])

        # Platform overall status must reflect core banking degradation
        self.status_engine._cached_telemetry_time = 0.0
        self.status_engine._live_telemetry["lending_engine"] = res_deficit
        telemetry = self.status_engine.get_system_telemetry()
        self.assertEqual(telemetry["overall_status"], "degraded")
        self.assertIsNotNone(telemetry["global_banner"])
        self.assertIn("Lending Facility", telemetry["global_banner"]["title"])

        # Recover solvency (Vault: 10,000 Gold, Liabilities: 2,000 Gold)
        with self.db.write_transaction() as (conn, cur):
            cur.execute("UPDATE cbm_treasury SET vault_total_gold_cents = 1000000, member_liabilities_cents = 200000")

        res_recovered = self.status_engine.probe_lending_engine()
        self.assertEqual(res_recovered["status"], "operational")
        self.assertTrue(res_recovered["operational"])

    def test_zero_mock_grey_bars_for_unrecorded_history(self):
        """Unrecorded days must strictly return status='no_data' and uptime_percent=None (Grey bars)."""
        history = self.status_engine.get_90_day_history("web_portal")
        self.assertEqual(len(history), 90)

        # Offsets 1 to 89 (past 89 days) have no recorded data in the database
        past_days = history[:-1]
        for day_entry in past_days:
            self.assertEqual(
                day_entry["status"],
                "no_data",
                f"Day {day_entry['date']} should have status='no_data', got {day_entry['status']}"
            )
            self.assertIsNone(
                day_entry["uptime_percent"],
                f"Day {day_entry['date']} should have uptime_percent=None, got {day_entry['uptime_percent']}"
            )

        # Offset 0 (today) is backed by live prober state
        today_entry = history[-1]
        self.assertIn(today_entry["status"], ("operational", "degraded", "outage", "unconfigured"))
        self.assertIsNotNone(today_entry["uptime_percent"])

    def test_recorded_history_aggregation(self):
        """Days with actual recorded telemetry return their authentic percentage."""
        # Operational prober for web_portal
        self.status_engine.register_custom_prober(
            "web_portal",
            lambda: {"status": "operational", "operational": True, "label": "Operational (0.4ms)", "latency_ms": 0.4}
        )

        today = datetime.datetime.now(datetime.timezone.utc).date()
        yesterday = (today - datetime.timedelta(days=1)).isoformat()

        # Insert authentic recorded telemetry for yesterday (96.4% uptime)
        with self.db.write_transaction() as (conn, cur):
            cur.execute("""
                INSERT INTO cbm_service_daily_uptime (
                    service_id, day_date, total_probes, successful_probes, uptime_percent, status, incident_count, updated_at
                ) VALUES ('web_portal', ?, 100, 96, 96.4, 'operational', 1, ?)
            """, (yesterday, time.time()))

        history = self.status_engine.get_90_day_history("web_portal")
        yesterday_entry = next(d for d in history if d["date"] == yesterday)

        self.assertEqual(yesterday_entry["status"], "operational")
        self.assertEqual(yesterday_entry["uptime_percent"], 96.4)
        self.assertEqual(yesterday_entry["incident_count"], 1)

        # Average 90d uptime calculation excludes 'no_data' days
        self.status_engine._cached_telemetry_time = 0.0
        telemetry = self.status_engine.get_system_telemetry()
        wp_svc = next(s for s in telemetry["services"] if s["id"] == "web_portal")
        # Valid days: yesterday (96.4%) and today (100%) -> Average = (96.4 + 100.0) / 2 = 98.2%
        self.assertAlmostEqual(wp_svc["uptime_90d_percent"], 98.2, delta=1.5)

    def test_probe_all_services_and_sqlite_recording(self):
        """probe_all_services commits daily probe count to SQLite."""
        # Supply test probers to avoid remote network latency during full sweep
        self.status_engine.register_custom_prober(
            "web_portal",
            lambda: {"status": "operational", "operational": True, "label": "Operational", "latency_ms": 0.4}
        )
        self.status_engine.register_custom_prober(
            "vault_daemon",
            lambda: {"status": "operational", "operational": True, "label": "Operational", "latency_ms": 5.2}
        )

        results = self.status_engine.probe_all_services()
        self.assertEqual(len(results), 7)
        self.assertIn("web_portal", results)
        self.assertIn("vault_daemon", results)
        self.assertIn("lending_engine", results)
        self.assertIn("credit_billing", results)

        # Verify today's row exists in cbm_service_daily_uptime
        today_str = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
        conn = self.db._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("SELECT service_id, total_probes, successful_probes, uptime_percent FROM cbm_service_daily_uptime WHERE day_date = ?", (today_str,))
        rows = cur.fetchall()
        self.assertEqual(len(rows), 7)
        for r in rows:
            self.assertGreaterEqual(r[1], 1)  # total_probes >= 1


if __name__ == "__main__":
    unittest.main()
