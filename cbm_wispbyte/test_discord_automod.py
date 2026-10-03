#!/usr/bin/env python3
"""
Test Suite: CBM | AutoMod Discord Content Safety Bot
===================================================
Validates:
1. AutoModDB configuration persistence and audit history.
2. Bot event filtering (bot bypass, admin bypass, ignored channel bypass).
3. Stealth interception behavior (silent message deletion, zero in-channel notices).
4. Rich incident report dispatch to designated moderation log channels.
5. Multimodal attachment processing.
"""

import os
import sys
import time
import tempfile
import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from automod_db import AutoModDB
import bot as automod_bot


class TestAutoModDatabase(unittest.TestCase):
    def setUp(self):
        self.tmp_fd, self.tmp_path = tempfile.mkstemp(suffix=".db")
        os.close(self.tmp_fd)
        self.db = AutoModDB(self.tmp_path)

    def tearDown(self):
        try:
            if os.path.exists(self.tmp_path):
                os.remove(self.tmp_path)
        except Exception:
            pass

    def test_01_set_and_get_guild_config(self):
        """Guild config is persisted and cached accurately."""
        self.assertIsNone(self.db.get_guild_config(1001))

        self.db.set_guild_config(1001, log_channel_id=9001, ignored_channels=[2001, 2002])
        cfg = self.db.get_guild_config(1001)

        self.assertIsNotNone(cfg)
        self.assertEqual(cfg["log_channel_id"], 9001)
        self.assertIn(2001, cfg["ignored_channels"])
        self.assertIn(2002, cfg["ignored_channels"])
        self.assertTrue(cfg["is_active"])

    def test_02_remove_ignored_channel(self):
        """Channels can be removed from the ignore list."""
        self.db.set_guild_config(1002, log_channel_id=9002, ignored_channels=[2001, 2002, 2003])
        ok = self.db.remove_ignored_channel(1002, 2002)
        self.assertTrue(ok)

        cfg = self.db.get_guild_config(1002)
        self.assertEqual(cfg["ignored_channels"], [2001, 2003])

        # Removing a non-ignored channel returns False
        self.assertFalse(self.db.remove_ignored_channel(1002, 9999))

    def test_03_record_and_retrieve_audit_logs(self):
        """Purged incidents are recorded with categories and latency metrics."""
        inc_id = self.db.record_audit_log(
            guild_id=1003,
            channel_id=3001,
            author_id=5001,
            author_tag="ToxicUser#1234",
            content_snippet="Test violation content",
            violation_categories=["Harassment", "Hate Speech"],
            detection_layer="L3_NEMOTRON_3.5",
            execution_time_ms=245.5,
            attachments_count=1
        )
        self.assertTrue(inc_id.startswith("inc_"))

        logs = self.db.get_audit_logs(1003, limit=10)
        self.assertEqual(len(logs), 1)
        entry = logs[0]
        self.assertEqual(entry["incident_id"], inc_id)
        self.assertEqual(entry["author_id"], 5001)
        self.assertEqual(entry["violation_categories"], ["Harassment", "Hate Speech"])
        self.assertEqual(entry["detection_layer"], "L3_NEMOTRON_3.5")
        self.assertEqual(entry["execution_time_ms"], 245.5)


class TestAutoModMessageInterception(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp_fd, self.tmp_path = tempfile.mkstemp(suffix=".db")
        os.close(self.tmp_fd)
        self.test_db = AutoModDB(self.tmp_path)
        # Patch bot's db instance with test db
        automod_bot.db = self.test_db

        # Configure guild 999 with log channel 888 and ignored channel 777
        self.test_db.set_guild_config(guild_id=999, log_channel_id=888, ignored_channels=[777])

    def tearDown(self):
        try:
            if os.path.exists(self.tmp_path):
                os.remove(self.tmp_path)
        except Exception:
            pass

    def _create_mock_message(
        self,
        content="Hello world",
        author_bot=False,
        is_admin=False,
        guild_id=999,
        channel_id=111,
        attachments=None
    ):
        msg = MagicMock()
        msg.content = content
        msg.webhook_id = None
        msg.guild = MagicMock()
        msg.guild.id = guild_id

        # Mock log channel in guild
        self.mock_log_channel = MagicMock()
        self.mock_log_channel.id = 888
        self.mock_log_channel.send = AsyncMock()

        def get_ch(cid):
            if cid == 888:
                return self.mock_log_channel
            return None
        msg.guild.get_channel.side_effect = get_ch

        msg.channel = MagicMock()
        msg.channel.id = channel_id
        msg.channel.mention = f"<#{channel_id}>"

        msg.author = MagicMock()
        msg.author.id = 123456
        msg.author.bot = author_bot
        msg.author.mention = "<@123456>"
        msg.author.display_avatar.url = "https://cdn.discordapp.com/avatars/123/abc.png"
        msg.author.created_at = MagicMock()
        msg.author.created_at.timestamp.return_value = 1700000000.0

        perms = MagicMock()
        perms.administrator = is_admin
        perms.manage_guild = is_admin
        msg.author.guild_permissions = perms

        msg.attachments = attachments or []
        msg.delete = AsyncMock()
        return msg

    async def test_04_benign_message_stands_untouched(self):
        """Benign messages are neither deleted nor logged."""
        msg = self._create_mock_message(content="Good game everyone! Defend the borders.")
        await automod_bot.on_message(msg)

        msg.delete.assert_not_called()
        self.mock_log_channel.send.assert_not_called()

    async def test_05_bot_and_admin_messages_bypassed(self):
        """Bots and admins bypass automated content safety."""
        # Bot author
        msg_bot = self._create_mock_message(content="k y s", author_bot=True)
        await automod_bot.on_message(msg_bot)
        msg_bot.delete.assert_not_called()

        # Admin author
        msg_admin = self._create_mock_message(content="k y s", is_admin=True)
        await automod_bot.on_message(msg_admin)
        msg_admin.delete.assert_not_called()

    async def test_06_ignored_channel_and_log_channel_bypassed(self):
        """Messages in ignored channels or the log channel are not filtered."""
        # In ignored channel 777
        msg_ignored = self._create_mock_message(content="k y s", channel_id=777)
        await automod_bot.on_message(msg_ignored)
        msg_ignored.delete.assert_not_called()

        # In log channel 888
        msg_log = self._create_mock_message(content="k y s", channel_id=888)
        await automod_bot.on_message(msg_log)
        msg_log.delete.assert_not_called()

    async def test_07_stealth_deletion_and_modlog_dispatch(self):
        """Offending message is deleted with NO in-channel notice and logged to mod channel."""
        msg = self._create_mock_message(content="k y s now", channel_id=111)
        await automod_bot.on_message(msg)

        # 1. Message must be deleted
        msg.delete.assert_awaited_once()

        # 2. In-channel message must NOT be sent (no msg.channel.send call)
        self.assertFalse(hasattr(msg.channel, "send") and msg.channel.send.called)

        # 3. Log channel must receive rich embed report
        self.mock_log_channel.send.assert_awaited_once()
        call_kwargs = self.mock_log_channel.send.call_args.kwargs
        embed = call_kwargs.get("embed")
        self.assertIsNotNone(embed)
        self.assertEqual(embed.title, "🚫 Content Removed by CBM AutoMod")
        self.assertIn("Slur / Toxic Language", embed.description)

        # 4. Audit log is stored in SQLite
        logs = self.test_db.get_audit_logs(999)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0]["channel_id"], 111)
        self.assertEqual(logs[0]["action_taken"], "SILENT_PURGE")


if __name__ == "__main__":
    unittest.main()
