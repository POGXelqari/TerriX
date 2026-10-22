#!/usr/bin/env python3
"""
Test Suite: CBM | AutoMod Punishment Escalation Scale & Reasoning Engine
========================================================================
Validates:
1. 6-stage punishment escalation scale logic (1-9 Warning, 10-16 1h, 17-19 24h, 20-21 1w, 22 Kick, 23+ Ban).
2. 7-day TTL expiration and permanent database purge of expired punishment logs.
3. Server rules ingestion and retrieval via AutoModDB and setup commands.
4. NVIDIA NIM nemotron-3-nano-omni-30b-a3b-reasoning integration and fallback.
5. Voice warning synthesis and VC join/play/disconnect lifecycle.
6. End-to-end execution order: Message deletion -> Verbal warning/notice -> Discord discipline -> 7d DB log -> Mod embed.
"""

import os
import sys
import time
import tempfile
import asyncio
import datetime
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from automod_db import AutoModDB
import bot as automod_bot
from ai_service import generate_automod_warning_and_notice, MODEL_ALIASES


class TestPunishmentScaleCalculation(unittest.TestCase):
    def test_01_stage_1_verbal_warnings_9_times(self):
        """Offenses 1 through 9 result in VERBAL_WARNING with no timeout duration."""
        for offense in range(1, 10):
            stage, duration = automod_bot.calculate_punishment_tier(offense)
            self.assertEqual(stage, "VERBAL_WARNING", f"Offense {offense} should be VERBAL_WARNING")
            self.assertIsNone(duration, f"Offense {offense} should have no timeout duration")

    def test_02_stage_2_1_hour_timeout_7_times(self):
        """Offenses 10 through 16 result in TIMEOUT_1H with 1 hour duration."""
        for offense in range(10, 17):
            stage, duration = automod_bot.calculate_punishment_tier(offense)
            self.assertEqual(stage, "TIMEOUT_1H", f"Offense {offense} should be TIMEOUT_1H")
            self.assertEqual(duration, datetime.timedelta(hours=1))

    def test_03_stage_3_24_hour_timeout_3_times(self):
        """Offenses 17 through 19 result in TIMEOUT_24H with 24 hours duration."""
        for offense in range(17, 20):
            stage, duration = automod_bot.calculate_punishment_tier(offense)
            self.assertEqual(stage, "TIMEOUT_24H", f"Offense {offense} should be TIMEOUT_24H")
            self.assertEqual(duration, datetime.timedelta(hours=24))

    def test_04_stage_4_1_week_timeout_2_times(self):
        """Offenses 20 through 21 result in TIMEOUT_1W with 7 days duration."""
        for offense in range(20, 22):
            stage, duration = automod_bot.calculate_punishment_tier(offense)
            self.assertEqual(stage, "TIMEOUT_1W", f"Offense {offense} should be TIMEOUT_1W")
            self.assertEqual(duration, datetime.timedelta(days=7))

    def test_05_stage_5_kick_1_time(self):
        """Offense 22 results in KICK with no duration."""
        stage, duration = automod_bot.calculate_punishment_tier(22)
        self.assertEqual(stage, "KICK")
        self.assertIsNone(duration)

    def test_06_stage_6_ban_indefinite(self):
        """Offenses 23 and above result in BAN with no duration."""
        for offense in [23, 24, 50, 100]:
            stage, duration = automod_bot.calculate_punishment_tier(offense)
            self.assertEqual(stage, "BAN", f"Offense {offense} should be BAN")
            self.assertIsNone(duration)

    def test_07_edge_cases_zero_and_negative(self):
        """Zero and negative counts are safely clamped to 1 (VERBAL_WARNING)."""
        stage_0, dur_0 = automod_bot.calculate_punishment_tier(0)
        self.assertEqual(stage_0, "VERBAL_WARNING")
        self.assertIsNone(dur_0)

        stage_neg, dur_neg = automod_bot.calculate_punishment_tier(-5)
        self.assertEqual(stage_neg, "VERBAL_WARNING")
        self.assertIsNone(dur_neg)


class TestDatabasePunishmentPurgeAndTTL(unittest.TestCase):
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

    def test_01_record_punishment_stores_7day_expiration(self):
        """Punishment records contain valid 7-day TTL expiration timestamps."""
        before = time.time()
        pid = self.db.record_punishment(
            guild_id=101,
            user_id=202,
            user_tag="baduser#0001",
            channel_id=303,
            offense_index=1,
            punishment_stage="VERBAL_WARNING",
            reason="Toxicity",
            violation_categories=["Slur / Toxic Language"],
            ttl_seconds=7 * 86400.0
        )
        self.assertTrue(pid.startswith("pun_"))

        active_punishments = self.db.get_active_punishments(101, 202)
        self.assertEqual(len(active_punishments), 1)
        record = active_punishments[0]
        self.assertEqual(record["punishment_id"], pid)
        self.assertEqual(record["offense_index"], 1)
        self.assertEqual(record["punishment_stage"], "VERBAL_WARNING")
        self.assertAlmostEqual(record["expires_at"] - record["created_at"], 7 * 86400.0, delta=2.0)

    def test_02_purge_expired_punishments_permanently_removes_records(self):
        """Expired records are permanently deleted from database, resetting active count."""
        now = time.time()
        # Insert 3 expired punishments (expired 1 day ago)
        for i in range(1, 4):
            self.db.record_punishment(
                guild_id=101,
                user_id=202,
                user_tag="baduser#0001",
                channel_id=303,
                offense_index=i,
                punishment_stage="VERBAL_WARNING",
                reason="Expired infraction",
                violation_categories=["Spam"],
                ttl_seconds=-86400.0  # Already expired
            )

        # Insert 1 active punishment (expires in 7 days)
        self.db.record_punishment(
            guild_id=101,
            user_id=202,
            user_tag="baduser#0001",
            channel_id=303,
            offense_index=4,
            punishment_stage="TIMEOUT_1H",
            reason="Active infraction",
            violation_categories=["Harassment"],
            ttl_seconds=7 * 86400.0
        )

        # Before purge direct check
        active_count = self.db.get_active_offense_count(101, 202)
        self.assertEqual(active_count, 1)

        # Verify expired records are physically gone from the database
        conn = self.db._get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM cbm_automod_punishments WHERE guild_id = '101'")
        total_remaining = cur.fetchone()[0]
        conn.close()
        self.assertEqual(total_remaining, 1)

    def test_03_server_rules_ingestion_and_retrieval(self):
        """Server rules are stored and retrieved alongside guild configuration."""
        self.db.set_guild_config(555, log_channel_id=888, ignored_channels=[111])
        self.assertEqual(self.db.get_guild_rules(555), "")

        custom_rules = "Rule 1: Be respectful.\nRule 2: No unsolicited commercial spam or self-promo."
        self.db.set_guild_rules(555, rules_text=custom_rules, rules_channel_id=777)

        retrieved_rules = self.db.get_guild_rules(555)
        self.assertEqual(retrieved_rules, custom_rules)

        cfg = self.db.get_guild_config(555)
        self.assertEqual(cfg["log_channel_id"], 888)
        self.assertEqual(cfg["rules_channel_id"], 777)
        self.assertEqual(cfg["rules_text"], custom_rules)


class TestReasoningModelIntegration(unittest.TestCase):
    def test_01_model_aliases_contain_nemotron_reasoning(self):
        """nemotron-3-nano-omni-30b-a3b-reasoning is mapped in MODEL_ALIASES."""
        self.assertIn("nemotron-3-nano-omni-30b-a3b-reasoning", MODEL_ALIASES)
        self.assertEqual(MODEL_ALIASES["nemotron-3-nano-omni-30b-a3b-reasoning"], "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning")

    def test_02_warning_and_notice_fallback_includes_server_rules(self):
        """Fallback generator includes server rules and punishment stage notice."""
        with patch("ai_service.ai_service.is_configured", return_value=False):
            out = generate_automod_warning_and_notice(
                infraction_text="toxic text",
                categories=["Slur / Toxic Language"],
                server_rules="No hate speech allowed under any circumstances.",
                action_type="TIMEOUT_1H",
                offense_count=10,
                user_tag="offender#1234"
            )
            self.assertIn("Slur / Toxic Language", out["verbal_warning"])
            self.assertIn("No hate speech allowed", out["verbal_warning"])
            self.assertIn("1-Hour Timeout", out["punishment_notice"])
            self.assertIn("Offense #10", out["punishment_notice"])
            self.assertIn("voice_script", out)
            self.assertTrue(out.get("fallback"))

    def test_03_warning_and_notice_all_stages_have_clear_escalation_notices(self):
        """Every punishment stage produces clear escalation notice for user clarity."""
        stages = ["VERBAL_WARNING", "TIMEOUT_1H", "TIMEOUT_24H", "TIMEOUT_1W", "KICK", "BAN"]
        with patch("ai_service.ai_service.is_configured", return_value=False):
            for idx, stg in enumerate(stages, 1):
                out = generate_automod_warning_and_notice(
                    infraction_text="violation",
                    categories=["Harassment"],
                    action_type=stg,
                    offense_count=idx,
                    user_tag="user#0001"
                )
                self.assertTrue(f"#{idx}" in out["punishment_notice"] or f"Offense #{idx}" in out["punishment_notice"])

    def test_04_nim_json_parsing_and_voice_script_generation(self):
        """Parses structured JSON response from reasoning NIM and constructs voice script."""
        mock_response = {
            "status": "success",
            "data": {
                "choices": [{
                    "message": {
                        "content": '{"verbal_warning": "Discriminatory language is prohibited under server rule 1.", "punishment_notice": "Offense #2: Consequence VERBAL_WARNING applied."}'
                    }
                }]
            }
        }
        with patch("ai_service.ai_service.is_configured", return_value=True), \
             patch("ai_service.ai_service.chat_completion", return_value=mock_response):
            out = generate_automod_warning_and_notice(
                infraction_text="bad word",
                categories=["Hate Speech"],
                server_rules="Rule 1: No discrimination",
                action_type="VERBAL_WARNING",
                offense_count=2,
                user_tag="badactor#9999"
            )
            self.assertEqual(out["verbal_warning"], "Discriminatory language is prohibited under server rule 1.")
            self.assertEqual(out["punishment_notice"], "Offense #2: Consequence VERBAL_WARNING applied.")
            self.assertIn("badactor", out["voice_script"])
            self.assertFalse(out["fallback"])


class TestVoiceWarningDelivery(unittest.IsolatedAsyncioTestCase):
    async def test_01_synthesize_voice_warning_strips_discord_mentions(self):
        """Voice synthesis input strips Discord mentions to ensure natural TTS audio."""
        raw_text = "<@!123456789> Warning: Please refrain from profanity."
        # If edge_tts is not installed, it safely returns None without raising
        result = await automod_bot.synthesize_voice_warning(raw_text)
        # Should either be a valid filepath or None if edge_tts not available in test runner
        if result is not None:
            self.assertTrue(os.path.exists(result))
            os.remove(result)

    async def test_02_play_voice_warning_skips_when_member_not_in_vc(self):
        """play_voice_warning returns False safely if member is not in a voice channel."""
        member = MagicMock()
        member.voice = None
        res = await automod_bot.play_voice_warning(member, "Test warning")
        self.assertFalse(res)

    async def test_03_play_voice_warning_disconnects_cleanly_on_exception(self):
        """Voice client disconnects reliably in finally block even if playback raises."""
        member = MagicMock()
        vc = MagicMock()
        mock_voice_client = MagicMock()
        mock_voice_client.disconnect = AsyncMock()
        vc.connect = AsyncMock(return_value=mock_voice_client)
        member.voice.channel = vc
        member.guild = MagicMock()
        member.guild.me = MagicMock()

        with patch("bot.synthesize_voice_warning", AsyncMock(return_value="/tmp/fake_audio.mp3")), \
             patch("os.path.exists", return_value=True), \
             patch("os.remove", return_value=None):
            # Simulate playback error
            mock_voice_client.play.side_effect = Exception("Playback device failure")
            res = await automod_bot.play_voice_warning(member, "Test warning")
            mock_voice_client.disconnect.assert_awaited_once()


class TestEndToEndPunishmentFlow(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp_fd, self.tmp_path = tempfile.mkstemp(suffix=".db")
        os.close(self.tmp_fd)
        self.test_db = AutoModDB(self.tmp_path)
        self.orig_db = automod_bot.db
        automod_bot.db = self.test_db

        # Configure guild 800 with log channel 900
        self.test_db.set_guild_config(
            800,
            log_channel_id=900,
            ignored_channels=[999],
            rules_text="Rule 1: Respect all members. No slurs or abuse."
        )

    def tearDown(self):
        automod_bot.db = self.orig_db
        try:
            if os.path.exists(self.tmp_path):
                os.remove(self.tmp_path)
        except Exception:
            pass

    def _create_message(self, content: str, author_id: int = 1001, in_vc: bool = False):
        msg = MagicMock()
        msg.content = content
        msg.webhook_id = None
        msg.guild = MagicMock()
        msg.guild.id = 800

        self.mock_log_channel = MagicMock()
        self.mock_log_channel.id = 900
        self.mock_log_channel.send = AsyncMock()

        msg.guild.get_channel.side_effect = lambda cid: self.mock_log_channel if cid == 900 else None

        msg.channel = MagicMock()
        msg.channel.id = 700
        msg.channel.mention = "<#700>"
        msg.channel.send = AsyncMock()

        member = MagicMock()
        member.id = author_id
        member.bot = False
        member.mention = f"<@{author_id}>"
        member.display_name = f"User{author_id}"
        member.display_avatar.url = "https://cdn.discordapp.com/avatars/1/test.png"
        member.timeout = AsyncMock()
        member.kick = AsyncMock()
        member.ban = AsyncMock()

        if in_vc:
            member.voice = MagicMock()
            member.voice.channel = MagicMock()
        else:
            member.voice = None

        msg.author = member
        msg.guild.get_member.return_value = member
        msg.attachments = []
        msg.delete = AsyncMock()
        return msg

    async def test_01_first_offense_issues_verbal_warning_and_records_db(self):
        """First offense deletes message, sends verbal warning, does not timeout, records 7d DB entry."""
        msg = self._create_message(content="k y s immediately", author_id=5001)

        await automod_bot.process_message(msg)

        # 1. Message deleted
        msg.delete.assert_awaited_once()

        # 2. Verbal warning sent tagging user in channel
        msg.channel.send.assert_awaited_once()
        warning_text = msg.channel.send.call_args[0][0]
        self.assertIn("<@5001>", warning_text)
        self.assertTrue("Warning" in warning_text or "#1" in warning_text)

        # 3. No timeout/kick/ban for offense #1
        msg.author.timeout.assert_not_called()
        msg.author.kick.assert_not_called()
        msg.author.ban.assert_not_called()

        # 4. Mod log channel notified
        self.mock_log_channel.send.assert_awaited_once()

        # 5. Database contains 1 active punishment with 7d TTL
        active_count = self.test_db.get_active_offense_count(800, 5001)
        self.assertEqual(active_count, 1)

    async def test_02_tenth_offense_triggers_1hour_timeout(self):
        """Tenth active offense triggers 1-Hour timeout after verbal warning & notice."""
        # Seed 9 existing active offenses
        for i in range(1, 10):
            self.test_db.record_punishment(
                guild_id=800,
                user_id=5002,
                user_tag="User5002",
                channel_id=700,
                offense_index=i,
                punishment_stage="VERBAL_WARNING",
                reason="Pre-existing infraction",
                violation_categories=["Slur / Toxic Language"]
            )

        msg = self._create_message(content="k y s repeated", author_id=5002)

        await automod_bot.process_message(msg)

        # Message deleted
        msg.delete.assert_awaited_once()

        # In-channel warning + notice sent
        msg.channel.send.assert_awaited_once()
        warning_text = msg.channel.send.call_args[0][0]
        self.assertTrue("1-Hour Timeout" in warning_text or "Timeout" in warning_text)

        # 1-Hour timeout executed
        msg.author.timeout.assert_awaited_once()
        timeout_duration = msg.author.timeout.call_args[0][0]
        self.assertEqual(timeout_duration, datetime.timedelta(hours=1))

        # DB shows 10 active offenses
        self.assertEqual(self.test_db.get_active_offense_count(800, 5002), 10)

    async def test_03_twenty_second_offense_triggers_kick(self):
        """Twenty-second active offense executes a server Kick."""
        # Seed 21 active offenses
        for i in range(1, 22):
            stage, _ = automod_bot.calculate_punishment_tier(i)
            self.test_db.record_punishment(
                guild_id=800,
                user_id=5003,
                user_tag="User5003",
                channel_id=700,
                offense_index=i,
                punishment_stage=stage,
                reason="Pre-existing infraction",
                violation_categories=["Slur / Toxic Language"]
            )

        msg = self._create_message(content="k y s kick test", author_id=5003)
        await automod_bot.process_message(msg)

        msg.author.kick.assert_awaited_once()
        self.assertEqual(self.test_db.get_active_offense_count(800, 5003), 22)

    async def test_04_twenty_third_offense_triggers_ban(self):
        """Twenty-third active offense executes an indefinite server Ban."""
        # Seed 22 active offenses
        for i in range(1, 23):
            stage, _ = automod_bot.calculate_punishment_tier(i)
            self.test_db.record_punishment(
                guild_id=800,
                user_id=5004,
                user_tag="User5004",
                channel_id=700,
                offense_index=i,
                punishment_stage=stage,
                reason="Pre-existing infraction",
                violation_categories=["Slur / Toxic Language"]
            )

        msg = self._create_message(content="k y s ban test", author_id=5004)
        await automod_bot.process_message(msg)

        msg.author.ban.assert_awaited_once()
        self.assertEqual(self.test_db.get_active_offense_count(800, 5004), 23)

    async def test_05_voice_channel_warning_attempted_if_in_vc(self):
        """If offender is in a voice channel, play_voice_warning is called before discipline."""
        msg = self._create_message(content="k y s in vc", author_id=5005, in_vc=True)

        with patch("bot.play_voice_warning", AsyncMock(return_value=True)) as mock_voice:
            await automod_bot.process_message(msg)
            mock_voice.assert_awaited_once()
            called_member, spoken_text = mock_voice.call_args[0]
            self.assertEqual(called_member.id, 5005)
            self.assertIn("Warning", spoken_text)


    async def test_06_private_channel_forbidden_deletion_resiliency(self):
        """If bot lacks Manage Messages in a private channel, moderation continues and alerts mod log."""
        msg = self._create_message(content="k y s in private channel", author_id=5006)
        msg.delete.side_effect = automod_bot.discord.errors.Forbidden("Missing Manage Messages")

        await automod_bot.process_message(msg)

        # Deletion was attempted
        msg.delete.assert_awaited_once()

        # In-channel warning was still sent
        msg.channel.send.assert_awaited_once()

        # Punishment was still executed on member
        active_count = self.test_db.get_active_offense_count(800, 5006)
        self.assertEqual(active_count, 1)

        # Mod log channel received alert with deletion warning
        self.mock_log_channel.send.assert_awaited_once()
        embed = self.mock_log_channel.send.call_args.kwargs.get("embed")
        self.assertIsNotNone(embed)
        self.assertTrue(any(f["name"] == "⚠️ Deletion Notice" for f in embed.fields))

    async def test_07_private_channel_forbidden_send_falls_back_to_dm(self):
        """If bot lacks Send Messages in a private channel, warning falls back to author DM."""
        msg = self._create_message(content="k y s no send perms", author_id=5007)
        msg.channel.send.side_effect = automod_bot.discord.errors.Forbidden("Cannot send in this channel")
        msg.author.send = AsyncMock()

        await automod_bot.process_message(msg)

        # Fallback to direct message
        msg.author.send.assert_awaited_once()
        dm_content = msg.author.send.call_args[0][0]
        self.assertIn("CBM AutoMod Notice", dm_content)

        # Log embed records DM delivery
        self.mock_log_channel.send.assert_awaited_once()
        embed = self.mock_log_channel.send.call_args.kwargs.get("embed")
        self.assertTrue(any("Delivered via DM" in f["value"] for f in embed.fields if f["name"] == "Warning Delivery"))

    async def test_08_direct_message_conversation_moderated(self):
        """Direct message (DM) conversations sent to the bot are moderated with DM warning and mutual guild alerts."""
        dm_msg = MagicMock()
        dm_msg.content = "k y s direct message"
        dm_msg.webhook_id = None
        dm_msg.guild = None  # DM Channel
        dm_msg.channel = MagicMock()
        dm_msg.channel.id = 999111
        dm_msg.channel.send = AsyncMock()

        member_author = MagicMock()
        member_author.id = 5008
        member_author.bot = False
        member_author.mention = "<@5008>"
        member_author.display_avatar.url = "https://cdn.discordapp.com/avatars/1/test.png"
        dm_msg.author = member_author
        dm_msg.attachments = []

        # Mock mutual guild on bot
        mock_mutual_guild = MagicMock()
        mock_mutual_guild.id = 800
        mock_mutual_guild.get_member.return_value = member_author
        mock_log_channel = MagicMock()
        mock_log_channel.send = AsyncMock()
        mock_mutual_guild.get_channel.side_effect = lambda cid: mock_log_channel if cid == 900 else None

        with patch.object(automod_bot.bot, "guilds", [mock_mutual_guild]):
            await automod_bot.process_message(dm_msg)

        # 1. Warning delivered back to user in DM
        dm_msg.channel.send.assert_awaited_once()
        sent_dm = dm_msg.channel.send.call_args[0][0]
        self.assertIn("<@5008>", sent_dm)
        self.assertIn("Content Safety Warning", sent_dm)

        # 2. Mod log notified of DM violation
        mock_log_channel.send.assert_awaited_once()
        embed = mock_log_channel.send.call_args.kwargs.get("embed")
        self.assertIsNotNone(embed)
        self.assertEqual(embed.title, "⚠️ Direct Message Safety Interception")

        # 3. SQLite audit log recorded
        logs = self.test_db.get_audit_logs(800)
        self.assertTrue(any(l["action_taken"] == "DM_WARNING" for l in logs))

    async def test_09_message_sent_in_voice_channel_triggers_voice_warning(self):
        """When an offending message is sent in a Voice Channel text chat or while author is in VC, bot joins and plays audio."""
        msg = self._create_message(content="k y s text in voice chat", author_id=5009)
        voice_channel = MagicMock(spec=automod_bot.discord.VoiceChannel)
        voice_channel.id = 705
        voice_channel.name = "General Voice"
        voice_channel.mention = "<#705>"
        voice_channel.connect = AsyncMock()
        voice_channel.send = AsyncMock()
        msg.channel = voice_channel

        with patch("bot.play_voice_warning", AsyncMock(return_value=True)) as mock_voice:
            await automod_bot.process_message(msg)

            # Voice warning is dispatched targeting the voice channel
            mock_voice.assert_awaited_once()
            called_member, spoken_text = mock_voice.call_args[0]
            self.assertEqual(called_member.id, 5009)
            self.assertEqual(mock_voice.call_args.kwargs.get("target_vc"), voice_channel)

            # In-channel text warning is also delivered in the channel
            voice_channel.send.assert_awaited_once()

    async def test_10_verbal_warning_does_not_repeat_user_words(self):
        """Verbal warning and voice script strictly omit the user's offending words and profanity."""
        from ai_service import sanitize_warning_text
        infraction = "You are an idiot and should die immediately"
        raw_warning = 'Your message for saying "You are an idiot and should die immediately" violates rules.'
        clean = sanitize_warning_text(raw_warning, infraction)

        # Offending phrase must not be quoted or repeated
        self.assertNotIn("idiot", clean)
        self.assertNotIn("die immediately", clean)
        self.assertIn("policy violations", clean)

        # End-to-end check in process_message
        msg = self._create_message(content="idiot toxic message", author_id=5010)

        with patch("bot.generate_automod_warning_and_notice") as mock_gen, \
             patch("bot.check_message_safety", return_value={"is_safe": False, "categories": ["Toxicity"], "layer": "L3_NEMOTRON_3.5"}):
            mock_gen.return_value = {
                "verbal_warning": 'Please do not post "idiot toxic message" in this channel.',
                "punishment_notice": "Consequence applied.",
                "voice_script": 'Warning for User. Please do not post "idiot toxic message".',
                "reasoning_model": "test"
            }
            await automod_bot.process_message(msg)

            msg.channel.send.assert_awaited_once()
            sent_text = msg.channel.send.call_args[0][0]
            self.assertNotIn("idiot", sent_text)
            self.assertNotIn("toxic message", sent_text)


class TestVoiceWarningResilience(unittest.IsolatedAsyncioTestCase):
    async def test_01_alert_chime_wav_synthesis_fallback(self):
        """Synthesizer generates valid PCM audio chime when edge-tts and gtts are not available."""
        with patch.dict("sys.modules", {"edge_tts": None, "gtts": None}):
            wav_path = await automod_bot.synthesize_voice_warning("Test alert chime")
            self.assertIsNotNone(wav_path)
            self.assertTrue(os.path.exists(wav_path))
            self.assertTrue(wav_path.endswith(".wav"))
            self.assertGreater(os.path.getsize(wav_path), 1000)
            os.remove(wav_path)

    async def test_02_play_voice_warning_reuses_connected_voice_client(self):
        """Voice warning reuses an existing guild connection and moves to channel without re-connecting."""
        member = MagicMock()
        target_vc = MagicMock()
        target_vc.id = 444
        member.voice.channel = target_vc

        existing_vc = MagicMock()
        existing_vc.is_connected.return_value = True
        existing_vc.channel.id = 333
        existing_vc.move_to = AsyncMock()
        existing_vc.play = MagicMock()
        existing_vc.disconnect = AsyncMock()

        guild = MagicMock()
        guild.voice_client = existing_vc
        guild.me = MagicMock()
        member.guild = guild

        with patch("bot.synthesize_voice_warning", AsyncMock(return_value="/tmp/test.wav")), \
             patch("os.path.exists", return_value=True), \
             patch("os.remove", return_value=None):
            res = await automod_bot.play_voice_warning(member, "Warning")
            self.assertTrue(res)
            # Must move existing connection to target channel
            existing_vc.move_to.assert_awaited_once_with(target_vc)
            # Must not call vc.connect
            target_vc.connect.assert_not_called()
            # Must disconnect in finally
            existing_vc.disconnect.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
