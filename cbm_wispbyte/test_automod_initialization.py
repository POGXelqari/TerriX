#!/usr/bin/env python3
"""
Test Suite: AutoMod Discord Bot Initialization & Rate Limit Supervisor
=====================================================================
Validates:
1. run_automod.check_configuration runtime resolution and discord.py validation.
2. DISCORD_APPLICATION_ID derivation from DISCORD_BOT_TOKEN.
3. bot.py dummy detection and error exit code when discord.py is unavailable.
4. on_ready single-sync guard (_HAS_SYNCED_COMMANDS).
5. main.py AutoMod daemon lifecycle management (start_automod_daemon / stop_automod_daemon).
6. ExponentialBackoff delay computation, bounded jitter, and reset behavior.
7. automod_ratelimit.json telemetry handling and get_ratelimit_retry_after().
8. DiscordRateLimiter circuit breaker trips and recovery.
9. Stale PID cleanup in start_automod_daemon.
10. Process tree termination order in stop_automod_daemon (prevents orphan processes).
"""

import os
import sys
import time
import json
import base64
import unittest
from unittest.mock import patch, MagicMock

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import run_automod
import bot as automod_bot
import main as cbm_main


class TestAutoModInitialization(unittest.TestCase):
    def test_01_application_id_derivation_from_token(self):
        """DISCORD_APPLICATION_ID is derived from token when not explicitly supplied."""
        dummy_id = "123456789012345678"
        enc_id = base64.b64encode(dummy_id.encode("utf-8")).decode("utf-8").rstrip("=")
        mock_token = f"{enc_id}.dummy_timestamp.dummy_hmac"

        with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": mock_token}, clear=False):
            if "DISCORD_APPLICATION_ID" in os.environ:
                del os.environ["DISCORD_APPLICATION_ID"]

            with patch("run_automod.get_bot_python_executable", return_value=sys.executable):
                with patch("subprocess.run") as mock_sub:
                    mock_sub.return_value = MagicMock(returncode=0, stdout="2.7.1\n")
                    ok = run_automod.check_configuration()
                    self.assertTrue(ok)
                    self.assertEqual(os.environ.get("DISCORD_APPLICATION_ID"), dummy_id)

    def test_02_python_executable_resolution(self):
        """get_bot_python_executable identifies a valid python binary."""
        py_bin = run_automod.get_bot_python_executable()
        self.assertTrue(bool(py_bin))
        self.assertTrue(isinstance(py_bin, str))

    def test_03_dummy_discord_detection_in_main(self):
        """bot.py exits with status 1 when run in dummy mode without discord.py."""
        with patch.object(automod_bot.discord, "_is_dummy", True):
            with patch("sys.exit") as mock_exit:
                automod_bot.main()
                mock_exit.assert_called_once_with(1)

    def test_04_single_sync_guard(self):
        """Application commands are synced once during initial connect and not on reconnect."""
        automod_bot._HAS_SYNCED_COMMANDS = False

        mock_sync = unittest.mock.AsyncMock(return_value=[MagicMock(name="setup")])
        automod_bot.bot.tree.sync = mock_sync

        import asyncio

        # First connection: should sync
        asyncio.run(automod_bot.on_ready())
        self.assertTrue(automod_bot._HAS_SYNCED_COMMANDS)
        self.assertEqual(mock_sync.await_count, 1)

        # Second connection (e.g. reconnect): should NOT sync again
        asyncio.run(automod_bot.on_ready())
        self.assertEqual(mock_sync.await_count, 1)

    def test_05_main_automod_lifecycle_helpers(self):
        """main.py start_automod_daemon and stop_automod_daemon manage PID tracking cleanly."""
        pid_file = os.path.join(BASE_DIR, "automod.pid")
        if os.path.exists(pid_file):
            try:
                os.remove(pid_file)
            except Exception:
                pass

        # When token is missing, start_automod_daemon returns False
        with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": ""}):
            started = cbm_main.start_automod_daemon()
            self.assertFalse(started)
            self.assertFalse(os.path.exists(pid_file))

        # Test stop_automod_daemon cleans up lockfile
        with open(pid_file, "w", encoding="utf-8") as f:
            f.write("999999")
        self.assertTrue(os.path.exists(pid_file))

        with patch.object(cbm_main, "_terminate_pid_tree"):
            cbm_main.stop_automod_daemon()
            self.assertFalse(os.path.exists(pid_file))

    def test_06_exponential_backoff_scaling_and_jitter(self):
        """ExponentialBackoff scales geometrically, bounds jitter, and resets on stable run."""
        backoff = run_automod.ExponentialBackoff(
            base_delay=5.0,
            factor=2.0,
            max_delay=300.0,
            jitter_min=1.0,
            jitter_max=2.0
        )
        self.assertEqual(backoff.current_delay(), 5.0)

        # Attempt 1: (5.0 * 2^0) + [1.0, 2.0] = [6.0, 7.0]
        d1 = backoff.next_delay()
        self.assertTrue(6.0 <= d1 <= 7.0)

        # Attempt 2: (5.0 * 2^1) + [1.0, 2.0] = [11.0, 12.0]
        d2 = backoff.next_delay()
        self.assertTrue(11.0 <= d2 <= 12.0)

        # Attempt 3: (5.0 * 2^2) + [1.0, 2.0] = [21.0, 22.0]
        d3 = backoff.next_delay()
        self.assertTrue(21.0 <= d3 <= 22.0)

        # High attempt count caps at max_delay + jitter
        backoff.attempts = 15
        d_capped = backoff.next_delay()
        self.assertTrue(301.0 <= d_capped <= 302.0)

        # Reset returns to attempt 0
        backoff.reset()
        self.assertEqual(backoff.attempts, 0)
        self.assertEqual(backoff.current_delay(), 5.0)

    def test_07_ratelimit_telemetry_and_retry_after(self):
        """automod_ratelimit.json recording and get_ratelimit_retry_after telemetry work correctly."""
        automod_bot.clear_rate_limit()
        self.assertEqual(run_automod.get_ratelimit_retry_after(), 0.0)

        # Record active rate limit
        automod_bot.record_rate_limit("DISCORD_HTTP_429", retry_after=10.0, error_text="Too Many Requests")
        self.assertTrue(os.path.exists(run_automod.RATELIMIT_FILE))

        rem = run_automod.get_ratelimit_retry_after()
        self.assertTrue(8.0 <= rem <= 11.0)

        # Write expired record
        expired_data = {
            "status": "RATE_LIMITED",
            "retry_at": time.time() - 5.0
        }
        with open(run_automod.RATELIMIT_FILE, "w", encoding="utf-8") as f:
            json.dump(expired_data, f)

        # Query should clean up expired file and return 0.0
        rem_expired = run_automod.get_ratelimit_retry_after()
        self.assertEqual(rem_expired, 0.0)
        self.assertFalse(os.path.exists(run_automod.RATELIMIT_FILE))

    def test_08_discord_rate_limiter_exponential_circuit_breaker(self):
        """DiscordRateLimiter trips with exponential backoff on repeated 429s."""
        limiter = automod_bot.DiscordRateLimiter()
        self.assertEqual(limiter.consecutive_rate_limits, 0)

        # First trip: 2^0 factor
        limiter.trip_circuit_breaker(reset_after_seconds=5.0)
        self.assertEqual(limiter.consecutive_rate_limits, 1)

        # Second trip: 2^1 factor
        limiter.trip_circuit_breaker(reset_after_seconds=5.0)
        self.assertEqual(limiter.consecutive_rate_limits, 2)

        # Recovery decrements counter
        limiter.record_success()
        self.assertEqual(limiter.consecutive_rate_limits, 1)
        limiter.record_success()
        self.assertEqual(limiter.consecutive_rate_limits, 0)

    def test_09_stale_pid_cleanup_in_start_automod_daemon(self):
        """start_automod_daemon removes stale PID file if previously registered PID is not alive."""
        pid_file = os.path.join(BASE_DIR, "automod.pid")
        with open(pid_file, "w", encoding="utf-8") as f:
            f.write("99999999")

        with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": "valid_token"}):
            with patch.object(cbm_main, "_is_pid_alive", return_value=False):
                with patch("subprocess.Popen") as mock_popen:
                    mock_proc = MagicMock()
                    mock_proc.pid = 77777
                    mock_popen.return_value = mock_proc

                    started = cbm_main.start_automod_daemon()
                    self.assertTrue(started)
                    # New PID should be written
                    with open(pid_file, "r", encoding="utf-8") as f:
                        written_pid = f.read().strip()
                    self.assertEqual(written_pid, "77777")

        if os.path.exists(pid_file):
            try:
                os.remove(pid_file)
            except Exception:
                pass

    def test_10_terminate_pid_tree_called_first_in_stop_automod_daemon(self):
        """stop_automod_daemon terminates the full process tree before parent handle termination."""
        call_order = []
        mock_proc = MagicMock()
        mock_proc.pid = 54321
        mock_proc.poll.return_value = None
        mock_proc.terminate.side_effect = lambda: call_order.append("proc_terminate")
        cbm_main._AUTOMOD_PROCESS = mock_proc

        with patch.object(cbm_main, "_terminate_pid_tree", side_effect=lambda pid: call_order.append(f"tree_{pid}")):
            cbm_main.stop_automod_daemon()

        # Empirical proof: tree termination runs before proc.terminate()
        self.assertEqual(call_order, ["tree_54321", "proc_terminate"])
        self.assertIsNone(cbm_main._AUTOMOD_PROCESS)

    def test_11_check_configuration_timeout_tolerance(self):
        """check_configuration tolerates slow/timed-out subprocess verification on resource-constrained hosts."""
        dummy_id = "123456789012345678"
        enc_id = base64.b64encode(dummy_id.encode("utf-8")).decode("utf-8").rstrip("=")
        mock_token = f"{enc_id}.dummy_timestamp.dummy_hmac"

        with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": mock_token}, clear=False):
            with patch("run_automod.get_bot_python_executable", return_value="/custom/slow/python3"):
                with patch("subprocess.run", side_effect=run_automod.subprocess.TimeoutExpired(cmd="check", timeout=15)):
                    # Should log warning but not fail configuration validation
                    ok = run_automod.check_configuration()
                    self.assertTrue(ok)

    def test_12_privileged_intents_fallback_in_bot(self):
        """bot.py falls back to basic gateway intents if PrivilegedIntentsRequired is raised."""
        with patch.object(automod_bot.discord, "_is_dummy", False):
            with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": "mock_token"}):
                mock_run = MagicMock()
                mock_run.side_effect = [
                    automod_bot.discord.errors.PrivilegedIntentsRequired(),
                    None
                ]
                with patch.object(automod_bot.bot, "run", mock_run):
                    automod_bot.main()
                    self.assertEqual(mock_run.call_count, 2)
                    self.assertFalse(automod_bot.bot.intents.message_content)

    def test_13_login_failure_exit_code(self):
        """bot.py exits with status 1 on Discord LoginFailure."""
        with patch.object(automod_bot.discord, "_is_dummy", False):
            with patch.dict(os.environ, {"DISCORD_BOT_TOKEN": "bad_token"}):
                with patch.object(automod_bot.bot, "run", side_effect=automod_bot.discord.errors.LoginFailure()):
                    with patch("sys.exit") as mock_exit:
                        automod_bot.main()
                        mock_exit.assert_called_once_with(1)


if __name__ == "__main__":
    unittest.main()
