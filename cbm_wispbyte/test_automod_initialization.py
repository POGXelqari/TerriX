#!/usr/bin/env python3
"""
Test Suite: AutoMod Discord Bot Initialization
==============================================
Validates:
1. run_automod.check_configuration runtime resolution and discord.py validation.
2. DISCORD_APPLICATION_ID derivation from DISCORD_BOT_TOKEN.
3. bot.py dummy detection and error exit code when discord.py is unavailable.
4. on_ready single-sync guard (_HAS_SYNCED_COMMANDS).
5. main.py AutoMod daemon lifecycle management (start_automod_daemon / stop_automod_daemon).
"""

import os
import sys
import time
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

            # Trigger check_configuration
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


if __name__ == "__main__":
    unittest.main()
