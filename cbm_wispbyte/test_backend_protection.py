#!/usr/bin/env python3
"""
Test Suite: Backend Source Code & Secret Anti-Theft Protection
==============================================================
Verifies:
1. Direct requests to .py, .db, .env, .key, .sql, .sh, .log files return 403 Forbidden.
2. Double URL-encoded, trailing-slash, and backslash traversal probes are blocked.
3. Repeated or critical probes trigger an automatic 24-hour IP quarantine.
4. Automated site-rippers (HTTrack, Wget, sqlmap, etc.) are blocked via User-Agent.
5. Legitimate HTML, PWA, and SDK download routes continue to return 200 OK.
"""

import os
import sys
import unittest
import threading
import urllib.request
import urllib.error
from http.server import HTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import main
from main import CBMHealthHandler, load_static_cache, rate_limiter


class TestBackendProtection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load_static_cache()
        cls.server = HTTPServer(("127.0.0.1", 0), CBMHealthHandler)
        cls.port = cls.server.server_port
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        with rate_limiter._lock:
            rate_limiter._banned_ips.clear()
            rate_limiter._download_violations.clear()

    def _get(self, path: str, ip: str = "198.51.100.10", ua: str = "Mozilla/5.0"):
        req = urllib.request.Request(
            f"{self.base_url}{path}",
            headers={"CF-Connecting-IP": ip, "User-Agent": ua}
        )
        try:
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                return resp.status, resp.read(), dict(resp.headers)
        except urllib.error.HTTPError as e:
            return e.code, e.read(), dict(e.headers)

    def test_01_backend_source_and_secrets_blocked(self):
        """All backend source files, databases, keys, and SQL scripts must be blocked."""
        sensitive_paths = [
            "/main.py",
            "/db_layer.py",
            "/bot.py",
            "/crypto_util.py",
            "/ai_service.py",
            "/.env",
            "/cbm_secret.key",
            "/cbm_data.db",
            "/cbm_data.db-wal",
            "/setup_supabase.sql",
            "/setup_oidc_and_credits.sql",
            "/automod.log",
            "/start.sh",
            "/requirements.txt",
            "/README.md",
            "/main.py/",
            "/MAIN.PY",
            "/%6d%61%69%6e.py",
            "/assets/products/../../main.py",
            "/assets/patterns/..%5c..%5c.env",
        ]
        for idx, path in enumerate(sensitive_paths):
            # Use distinct test IPs per probe to test individual path rules
            status, body, _ = self._get(path, ip=f"198.51.100.{20 + idx}")
            self.assertIn(status, (403, 404), f"VULNERABILITY: {path} returned HTTP {status}!")
            self.assertNotIn(b"def _do_GET", body)
            self.assertNotIn(b"CBMDatabase", body)

    def test_02_instant_ip_quarantine_on_critical_probe(self):
        """Probing /.env or /cbm_data.db immediately bans the attacker IP from all routes."""
        attacker_ip = "203.0.113.66"
        status, _, _ = self._get("/.env", ip=attacker_ip)
        self.assertEqual(status, 403)

        # Subsequent request to a normal public page (/cbm.html) from the same IP is now blocked
        status_after, body_after, _ = self._get("/cbm.html", ip=attacker_ip)
        self.assertEqual(status_after, 403)
        self.assertIn(b"ip_quarantined", body_after)

    def test_03_site_ripper_user_agents_blocked(self):
        """Offline site-cloners like HTTrack and Wget are rejected with 403."""
        for bad_ua in ("HTTrack/3.49", "Wget/1.21.4", "sqlmap/1.7"):
            status, _, _ = self._get("/cbm.html", ip="198.51.100.99", ua=bad_ua)
            self.assertEqual(status, 403)

    def test_04_legitimate_public_routes_unaffected(self):
        """Public web portals, icons, and the official Discord SDK download remain accessible."""
        valid_routes = ["/cbm.html", "/gunfight", "/cbm-logo-new.png", "/api/cbm/dev/sdk/download"]
        for route in valid_routes:
            status, _, hdrs = self._get(route, ip="198.51.100.200")
            self.assertEqual(status, 200, f"Legitimate route {route} failed with {status}")
            self.assertNotIn("Python", hdrs.get("Server", ""))

    def test_05_browser_probes_render_inline_html_not_download(self):
        """Browser navigation to sensitive paths (with Accept: text/html) must render HTML inline and never prompt downloads."""
        browser_headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        for idx, probe_path in enumerate(("/.env", "/main.py", "/cbm_data.db", "/cbm_secret.key")):
            req = urllib.request.Request(
                f"{self.base_url}{probe_path}",
                headers={**browser_headers, "CF-Connecting-IP": f"198.51.100.{160 + idx}"}
            )
            try:
                urllib.request.urlopen(req, timeout=3.0)
                self.fail(f"Expected 403 for {probe_path}")
            except urllib.error.HTTPError as err:
                self.assertEqual(err.code, 403)
                ctype = err.headers.get("Content-Type", "")
                self.assertIn("text/html", ctype, f"Expected text/html for browser probe {probe_path}, got {ctype}")
                cdisp = err.headers.get("Content-Disposition", "")
                self.assertEqual(cdisp, "inline", f"Expected Content-Disposition: inline, got {cdisp}")
                body = err.read().decode("utf-8")
                self.assertIn("<!DOCTYPE html>", body)
                self.assertIn("Restricted System Resource", body)


if __name__ == "__main__":
    unittest.main()
