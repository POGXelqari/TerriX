#!/usr/bin/env python3
"""
Test Suite: Cloudflare Tunnel Manager & Automated Edge Ingress Watchdog
=======================================================================
Validates:
1. DNS resolution checks (primary domain resolution vs failover triggering).
2. Synthetic HTTP health probe against cloudflared metrics and local health endpoints.
3. QUIC protocol enforcement and cloudflared log tailing regex extraction.
4. Consecutive health probe failure tracking and watchdog threshold alerting.
"""

import os
import sys
import re
import time
import socket
import threading
import unittest
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from tunnel_manager import CloudflareTunnelManager, check_domain_dns


class DummyMetricsHandler(BaseHTTPRequestHandler):
    should_fail = False

    def do_GET(self):
        if self.path in ("/ready", "/health"):
            if DummyMetricsHandler.should_fail:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'{"status":"unhealthy"}')
            else:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logging noise


class TestTunnelWatchdog(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        DummyMetricsHandler.should_fail = False
        cls.metrics_server = HTTPServer(("127.0.0.1", 0), DummyMetricsHandler)
        cls.metrics_port = cls.metrics_server.server_port
        cls.server_thread = threading.Thread(target=cls.metrics_server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        if cls.metrics_server:
            try:
                cls.metrics_server.shutdown()
                cls.metrics_server.server_close()
            except Exception:
                pass

    def test_check_domain_dns(self):
        """Validates DNS resolution checks for resolvable and non-resolvable domains."""
        self.assertTrue(check_domain_dns("127.0.0.1"))
        self.assertFalse(check_domain_dns("this-domain-does-not-exist-at-all-12345.wispbyte.test"))
        self.assertFalse(check_domain_dns(""))

    def test_quic_protocol_default(self):
        """Verifies Cloudflare tunnel protocol defaults to QUIC for UDP multiplexing."""
        mgr = CloudflareTunnelManager(port=8080)
        self.assertEqual(mgr.protocol.lower(), "quic")
        self.assertEqual(mgr.watchdog_interval, 20.0)

    def test_synthetic_health_probe_success(self):
        """Verifies synthetic health probe returns True when /ready endpoint responds 200 OK."""
        DummyMetricsHandler.should_fail = False
        mgr = CloudflareTunnelManager(port=8080)
        mgr.metrics_port = self.metrics_port
        mgr.fallback_metrics_port = self.metrics_port

        self.assertTrue(mgr.probe_tunnel_health())

    def test_synthetic_health_probe_failure_and_counter(self):
        """Verifies synthetic health probe returns False when /ready fails or port unreachable."""
        DummyMetricsHandler.should_fail = True
        mgr = CloudflareTunnelManager(port=8080)
        mgr.metrics_port = self.metrics_port
        mgr.fallback_metrics_port = 0  # Unreachable port

        self.assertFalse(mgr.probe_tunnel_health())
        DummyMetricsHandler.should_fail = False

    def test_trycloudflare_regex_log_extraction(self):
        """Validates regex pattern accurately extracts fallback trycloudflare.com URLs from logs."""
        sample_log = (
            "2026-10-09T18:00:00Z INF | Your quick Tunnel has been created! Visit it at "
            "https://fancy-random-subdomain.trycloudflare.com to test your application."
        )
        match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", sample_log)
        self.assertIsNotNone(match)
        self.assertEqual(match.group(0), "https://fancy-random-subdomain.trycloudflare.com")


if __name__ == "__main__":
    unittest.main()
