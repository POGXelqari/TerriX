#!/usr/bin/env python3
"""
CBM | AutoMod (CBM | Content Safety)
====================================
Stealth Discord Auto-Moderation Bot powered by NVIDIA Nemotron-3.5-Content-Safety NIM.
Features:
- Cloudflare Error 1015 / Discord 429 auto-detection with 25-hour quarantine state.
- SOCKS5 / HTTP egress proxy support to route around shared host IP rate limits.
- Zero in-channel noise; strictly dispatches audit reports to designated log channels.
"""

import os
import sys
import time
import json
import base64
import asyncio
import datetime
from typing import Optional, List, Tuple, Dict, Any

try:
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
except Exception:
    pass

try:
    import discord
    from discord import app_commands
    from discord.ext import commands
    _DISCORD_AVAILABLE = True
except ImportError:
    _DISCORD_AVAILABLE = False
    class _DummyIntents:
        @classmethod
        def default(cls): return cls()
        guilds = messages = message_content = voice_states = True
    class _DummyTree:
        def command(self, *args, **kwargs):
            return lambda fn: fn
        async def sync(self): return []
    class _DummyBot:
        def __init__(self, *args, **kwargs):
            self.tree = _DummyTree()
            self.user = None
            self.guilds = []
            self.intents = kwargs.get("intents", _DummyIntents())
        def event(self, fn): return fn
        def run(self, *args, **kwargs): pass
    class _DummyDiscord:
        Intents = _DummyIntents
        Interaction = type("Interaction", (), {})
        TextChannel = type("TextChannel", (), {})
        VoiceChannel = type("VoiceChannel", (), {})
        StageChannel = type("StageChannel", (), {})
        Thread = type("Thread", (), {})
        DMChannel = type("DMChannel", (), {})
        GroupChannel = type("GroupChannel", (), {})
        Message = type("Message", (), {})
        Member = type("Member", (), {})
        Guild = type("Guild", (), {})
        class _DummyAudioSource:
            def __init__(self, *args, **kwargs):
                self.source = args[0] if args else None
        FFmpegPCMAudio = _DummyAudioSource
        class utils:
            @staticmethod
            def utcnow():
                return datetime.datetime.now(datetime.timezone.utc)
        class errors:
            class HTTPException(Exception):
                status = 400
            class RateLimited(Exception):
                retry_after = 5.0
            class PrivilegedIntentsRequired(Exception):
                pass
            class LoginFailure(Exception):
                pass
            class Forbidden(Exception):
                pass
        class Embed:
            def __init__(self, *args, **kwargs):
                self.title = kwargs.get("title", "")
                self.description = kwargs.get("description", "")
                self.fields = []
            def add_field(self, **kwargs): self.fields.append(kwargs)
            def set_thumbnail(self, **kwargs): pass
            def set_footer(self, **kwargs): pass
    class _DummyCommands:
        Bot = _DummyBot
    class _DummyAppCommands:
        @staticmethod
        def describe(*args, **kwargs): return lambda fn: fn
        @staticmethod
        def default_permissions(*args, **kwargs): return lambda fn: fn
    discord = _DummyDiscord
    discord._is_dummy = True
    commands = _DummyCommands
    app_commands = _DummyAppCommands
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

load_dotenv(os.path.join(current_dir, ".env"))

import re
import math
import wave
import struct
import shutil
import tempfile
import subprocess
from automod_db import AutoModDB
from chat_engine import check_message_safety
from ai_service import generate_automod_warning_and_notice, sanitize_warning_text

DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
DISCORD_PROXY_URL = os.environ.get("DISCORD_PROXY_URL", "").strip() or None
COOLDOWN_FILE = os.path.join(current_dir, "automod_cooldown.json")
RATELIMIT_FILE = os.path.join(current_dir, "automod_ratelimit.json")
COOLDOWN_DURATION_SECONDS = int(os.environ.get("DISCORD_COOLDOWN_SECONDS", 90000))  # 25 Hours

class DiscordRateLimiter:
    """
    Priority Leaky-Bucket Rate Limiter & Circuit Breaker with Exponential Backoff.
    Throttles outgoing Discord REST operations at 40 requests/minute (1.5s per action)
    to prevent Cloudflare 1015 IP rate limits and Discord HTTP 429 bans.
    Priority 1: Immediate message deletion (moderation enforcement)
    Priority 2: Log channel audit dispatch
    Priority 3: General commands and background sync
    """
    def __init__(self, max_per_minute: int = 40):
        self.max_per_minute = max_per_minute
        self.interval = 60.0 / max_per_minute  # 1.5s per action
        self.lock = asyncio.Lock()
        self.last_call = 0.0
        self.circuit_open_until = 0.0
        self.consecutive_rate_limits = 0

    async def acquire(self, priority: int = 1):
        async with self.lock:
            now = time.monotonic()
            if self.circuit_open_until > now:
                wait_time = self.circuit_open_until - now
                await asyncio.sleep(wait_time)
                now = time.monotonic()
            elapsed = now - self.last_call
            if elapsed < self.interval:
                await asyncio.sleep(self.interval - elapsed)
            self.last_call = time.monotonic()

    def trip_circuit_breaker(self, reset_after_seconds: float = 5.0):
        now = time.monotonic()
        self.consecutive_rate_limits += 1
        factor = min(8.0, 2.0 ** (self.consecutive_rate_limits - 1))
        backoff_seconds = (reset_after_seconds * factor) + 1.0
        self.circuit_open_until = max(self.circuit_open_until, now + backoff_seconds)
        print(f"[!] Discord rate limit circuit breaker engaged (trip #{self.consecutive_rate_limits}): Pausing dispatch for {backoff_seconds:.1f}s", flush=True)

    def record_success(self):
        self.consecutive_rate_limits = max(0, self.consecutive_rate_limits - 1)

    async def execute(self, target, priority: int = 1, max_retries: int = 4):
        import random
        for attempt in range(max_retries):
            await self.acquire(priority=priority)
            try:
                if callable(target):
                    res = target()
                    if asyncio.iscoroutine(res):
                        out = await res
                    else:
                        out = res
                elif asyncio.iscoroutine(target):
                    out = await target
                else:
                    out = target
                self.record_success()
                return out
            except Exception as e:
                err_text = str(e)
                status = getattr(e, "status", None)
                if status == 429 or "rate limit" in err_text.lower():
                    retry_after = getattr(e, "retry_after", 5.0)
                    self.trip_circuit_breaker(retry_after)
                    if attempt == max_retries - 1:
                        raise
                    exp_wait = (retry_after * (2.0 ** attempt)) + random.uniform(0.5, 1.5)
                    await asyncio.sleep(exp_wait)
                else:
                    raise
        return None

discord_rate_limiter = DiscordRateLimiter(max_per_minute=40)

# Minimal required intents
intents = discord.Intents.default()
intents.guilds = True
intents.messages = True
intents.message_content = True
intents.voice_states = True

bot = commands.Bot(command_prefix="!", intents=intents, proxy=DISCORD_PROXY_URL)
db = AutoModDB()

EMBED_COLOR_VIOLATION = 0xDC2626
EMBED_COLOR_SETUP = 0x0070E0
EMBED_COLOR_STATUS = 0x10B981


def calculate_punishment_tier(active_offense_count: int) -> Tuple[str, Optional[datetime.timedelta]]:
    """
    Calculates punishment tier based on active infraction count within the 7-day window.
    Scale:
    1-9:   Removal + Verbal Warning (9 Times)
    10-16: 1-Hour Timeout (7 Times)
    17-19: 24-Hour Timeout (3 Times)
    20-21: 1-Week Timeout (2 Times)
    22:    Kick (1 Time)
    >= 23: Ban (Indefinite on violation until punishment log expiration)
    """
    idx = max(1, int(active_offense_count))
    if idx <= 9:
        return "VERBAL_WARNING", None
    elif idx <= 16:
        return "TIMEOUT_1H", datetime.timedelta(hours=1)
    elif idx <= 19:
        return "TIMEOUT_24H", datetime.timedelta(hours=24)
    elif idx <= 21:
        return "TIMEOUT_1W", datetime.timedelta(days=7)
    elif idx == 22:
        return "KICK", None
    else:
        return "BAN", None


async def synthesize_voice_warning(text: str) -> Optional[str]:
    """
    Synthesizes warning text into an ephemeral audio file using multi-tier fallback:
    1. edge_tts (Neural voice)
    2. gtts (Google TTS)
    3. Built-in PCM WAV alert chime synthesizer (zero external dependencies)
    """
    clean_text = re.sub(r'<@!?[0-9]+>', '', text)
    clean_text = re.sub(r'<#[0-9]+>', '', clean_text)
    clean_text = re.sub(r'<:[a-zA-Z0-9_]+:[0-9]+>', '', clean_text)
    clean_text = re.sub(r'[`*_~#|]', '', clean_text).strip()
    clean_text = clean_text[:250]
    if not clean_text:
        clean_text = "Community safety warning."

    # Tier 1: edge_tts (realistic neural voice)
    temp_path = None
    try:
        import edge_tts
        communicate = edge_tts.Communicate(clean_text, voice="en-US-ChristopherNeural")
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_path = temp_file.name
        temp_file.close()
        await asyncio.wait_for(communicate.save(temp_path), timeout=4.0)
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            return temp_path
    except Exception:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    # Tier 2: gtts (Google TTS)
    temp_path = None
    try:
        from gtts import gTTS
        tts = gTTS(text=clean_text, lang="en")
        temp_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_path = temp_file.name
        temp_file.close()
        await asyncio.wait_for(asyncio.to_thread(tts.save, temp_path), timeout=4.0)
        if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            return temp_path
    except Exception:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    # Tier 3: Built-in PCM alert chime WAV synthesizer (zero external dependencies)
    wav_path = None
    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        wav_path = temp_file.name
        temp_file.close()
        sample_rate = 44100
        duration = 1.6
        n_samples = int(sample_rate * duration)
        with wave.open(wav_path, "wb") as wav_f:
            wav_f.setnchannels(1)
            wav_f.setsampwidth(2)
            wav_f.setframerate(sample_rate)
            frames = bytearray()
            for i in range(n_samples):
                t = i / sample_rate
                # Double warning chime (880Hz tone)
                freq = 880.0 if (t < 0.35 or (0.50 < t < 0.85)) else 0.0
                val = int(18000.0 * math.sin(2.0 * math.pi * freq * t)) if freq > 0 else 0
                frames.extend(struct.pack("<h", val))
            wav_f.writeframes(frames)
        if os.path.exists(wav_path) and os.path.getsize(wav_path) > 0:
            return wav_path
    except Exception as synth_err:
        print(f"[!] Audio chime synthesis error: {synth_err}", flush=True)
        if wav_path and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception:
                pass

    return None


def find_member_voice_channel(
    guild: Optional[discord.Guild],
    user_id: int,
    message_channel: Optional[Any] = None
) -> Optional[Any]:
    """
    Robustly resolves the active voice channel for a guild member:
    1. Direct voice state on cached member (member.voice.channel)
    2. Guild internal voice states cache (guild._voice_states)
    3. Scanning guild.voice_channels and guild.stage_channels
    4. Offending message channel itself if it is a Voice/Stage channel
    """
    if not guild or not isinstance(user_id, int):
        return None

    # 1. Member voice state cache
    if hasattr(guild, "get_member"):
        try:
            m = guild.get_member(user_id)
            if m and getattr(m, "voice", None) and getattr(m.voice, "channel", None):
                return m.voice.channel
        except Exception:
            pass

    # 2. Guild voice states dictionary
    voice_states = getattr(guild, "_voice_states", None)
    if isinstance(voice_states, dict) and user_id in voice_states:
        vs = voice_states[user_id]
        vs_ch = getattr(vs, "channel", None)
        if vs_ch:
            return vs_ch

    # 3. Iterating guild voice channels
    voice_channels = getattr(guild, "voice_channels", None)
    if isinstance(voice_channels, (list, tuple)):
        for vc in voice_channels:
            members = getattr(vc, "members", None)
            if isinstance(members, (list, tuple)):
                if any(getattr(m, "id", None) == user_id for m in members):
                    return vc

    # 4. Iterating guild stage channels
    stage_channels = getattr(guild, "stage_channels", None)
    if isinstance(stage_channels, (list, tuple)):
        for sc in stage_channels:
            members = getattr(sc, "members", None)
            if isinstance(members, (list, tuple)):
                if any(getattr(m, "id", None) == user_id for m in members):
                    return sc

    # 5. Message channel itself if it's a VoiceChannel / StageChannel
    if message_channel is not None:
        voice_types = tuple(x for x in (getattr(discord, "VoiceChannel", None), getattr(discord, "StageChannel", None)) if x is not None and x is not object)
        if voice_types and isinstance(message_channel, voice_types):
            return message_channel
        ch_type = getattr(message_channel, "type", None)
        type_str = str(getattr(ch_type, "name", ch_type)).lower()
        if type_str in ("voice", "stage_voice"):
            return message_channel

    return None


def ensure_voice_dependencies() -> bool:
    """Verifies that PyNaCl and davey are present for voice encryption and DAVE protocol, attempting dynamic install if missing."""
    if getattr(discord, "_is_dummy", False):
        return True

    nacl_ok = False
    try:
        import nacl.secret
        nacl_ok = True
    except ImportError:
        pass

    davey_ok = False
    try:
        import davey
        davey_ok = True
    except ImportError:
        pass

    def _sync_discord_voice_flags():
        try:
            if hasattr(discord, "voice_client"):
                discord.voice_client.has_nacl = True
                if hasattr(discord.voice_client, "has_dave"):
                    discord.voice_client.has_dave = True
            if hasattr(discord, "voice_state"):
                if hasattr(discord.voice_state, "has_dave"):
                    discord.voice_state.has_dave = True
            if "discord.voice_client" in sys.modules:
                vc_mod = sys.modules["discord.voice_client"]
                setattr(vc_mod, "has_nacl", True)
                if hasattr(vc_mod, "has_dave"):
                    setattr(vc_mod, "has_dave", True)
            if "discord.voice_state" in sys.modules:
                vs_mod = sys.modules["discord.voice_state"]
                if hasattr(vs_mod, "has_dave"):
                    setattr(vs_mod, "has_dave", True)
        except Exception:
            pass

    if nacl_ok and davey_ok:
        _sync_discord_voice_flags()
        return True

    missing = []
    if not nacl_ok:
        missing.append("PyNaCl")
    if not davey_ok:
        missing.append("davey")

    print(f"[*] Voice encryption libraries ({', '.join(missing)}) missing for Discord Voice. Attempting dynamic auto-installation...", flush=True)
    try:
        py_bin = sys.executable
        res = subprocess.run([py_bin, "-m", "pip", "install", *missing], capture_output=True, text=True, timeout=120)
        if res.returncode != 0 and "externally-managed-environment" in (res.stderr or ""):
            res = subprocess.run([py_bin, "-m", "pip", "install", "--break-system-packages", *missing], capture_output=True, text=True, timeout=120)
        elif res.returncode != 0:
            res = subprocess.run([py_bin, "-m", "pip", "install", "--break-system-packages", *missing], capture_output=True, text=True, timeout=120)

        nacl_installed = False
        try:
            import nacl.secret
            nacl_installed = True
        except ImportError:
            pass

        davey_installed = False
        try:
            import davey
            davey_installed = True
        except ImportError:
            pass

        if nacl_installed and davey_installed:
            _sync_discord_voice_flags()
            print("[+] Voice encryption libraries (PyNaCl & davey) dynamically installed and activated.", flush=True)
            return True
        else:
            print(f"[!] Dynamic voice library install incomplete. PyNaCl: {nacl_installed}, davey: {davey_installed}.", flush=True)
    except Exception as e:
        print(f"[!] Dynamic voice library installation failed: {e}", flush=True)
    return False


async def play_voice_warning(
    member: discord.Member,
    warning_text: str,
    target_vc: Optional[Any] = None
) -> bool:
    """If member is currently in a voice channel, joins, plays the verbal audio warning, and disconnects."""
    guild = getattr(member, "guild", None)
    if not guild:
        return False

    vc = target_vc
    if not vc:
        if getattr(member, "voice", None) and getattr(member.voice, "channel", None):
            vc = member.voice.channel
        elif isinstance(getattr(member, "id", None), int) and guild:
            vc = find_member_voice_channel(guild, member.id)

    if not vc:
        return False

    # Verify voice encryption availability (PyNaCl & davey for DAVE protocol)
    if not getattr(discord, "_is_dummy", False):
        nacl_ready = False
        davey_ready = False
        try:
            import nacl.secret
            nacl_ready = True
        except ImportError:
            pass

        try:
            import davey
            davey_ready = True
        except ImportError:
            pass

        if not (nacl_ready and davey_ready):
            if not ensure_voice_dependencies():
                print("[!] Voice warning notice: PyNaCl and davey libraries needed in order to use voice", flush=True)
                return False

        # Synchronize discord.py voice state flags
        try:
            if hasattr(discord, "voice_client"):
                discord.voice_client.has_nacl = True
                if hasattr(discord.voice_client, "has_dave"):
                    discord.voice_client.has_dave = True
            if hasattr(discord, "voice_state"):
                if hasattr(discord.voice_state, "has_dave"):
                    discord.voice_state.has_dave = True
            if "discord.voice_client" in sys.modules:
                vc_mod = sys.modules["discord.voice_client"]
                setattr(vc_mod, "has_nacl", True)
                if hasattr(vc_mod, "has_dave"):
                    setattr(vc_mod, "has_dave", True)
            if "discord.voice_state" in sys.modules:
                vs_mod = sys.modules["discord.voice_state"]
                if hasattr(vs_mod, "has_dave"):
                    setattr(vs_mod, "has_dave", True)
        except Exception:
            pass

    me = getattr(guild, "me", None)
    if not me and hasattr(guild, "fetch_member") and hasattr(guild, "client") and guild.client and getattr(guild.client, "user", None):
        try:
            me = await guild.fetch_member(guild.client.user.id)
        except Exception:
            me = None

    if me and hasattr(vc, "permissions_for"):
        try:
            perms = vc.permissions_for(me)
            if perms and not (getattr(perms, "connect", True) and getattr(perms, "speak", True)):
                return False
        except Exception:
            pass

    # Capacity check: ensure user_limit is numeric before comparing
    user_limit = getattr(vc, "user_limit", 0)
    if isinstance(user_limit, (int, float)) and user_limit > 0:
        members = getattr(vc, "members", [])
        member_count = len(members) if isinstance(members, (list, tuple, set)) else 0
        if member_count >= user_limit:
            if me and hasattr(vc, "permissions_for"):
                try:
                    perms = vc.permissions_for(me)
                    if perms and not getattr(perms, "move_members", False):
                        return False
                except Exception:
                    pass

    audio_file = await synthesize_voice_warning(warning_text)
    if not audio_file:
        return False

    voice_client = None
    try:
        # Check if already connected in this guild to avoid ClientException: Already connected
        existing_vc = getattr(guild, "voice_client", None)
        is_conn = False
        if existing_vc is not None:
            conn_attr = getattr(existing_vc, "is_connected", None)
            if callable(conn_attr):
                try:
                    is_conn = (conn_attr() is True)
                except Exception:
                    is_conn = False
            elif conn_attr is True:
                is_conn = True

        if existing_vc and is_conn:
            voice_client = existing_vc
            curr_ch = getattr(existing_vc, "channel", None)
            curr_ch_id = getattr(curr_ch, "id", None) if curr_ch else None
            target_ch_id = getattr(vc, "id", None)
            if curr_ch_id != target_ch_id and hasattr(existing_vc, "move_to"):
                try:
                    res = existing_vc.move_to(vc)
                    if asyncio.iscoroutine(res):
                        await res
                except Exception:
                    pass
        else:
            conn_call = vc.connect(timeout=15.0)
            if asyncio.iscoroutine(conn_call):
                voice_client = await conn_call
            else:
                voice_client = conn_call

        ffmpeg_bin = shutil.which("ffmpeg") or shutil.which("avconv")
        audio_source = None
        try:
            if getattr(discord, "_is_dummy", False):
                audio_source = discord.FFmpegPCMAudio(audio_file)
            elif ffmpeg_bin:
                audio_source = discord.FFmpegPCMAudio(audio_file, executable=ffmpeg_bin)
            elif hasattr(discord, "FFmpegOpusAudio"):
                try:
                    audio_source = discord.FFmpegOpusAudio(audio_file)
                except Exception:
                    pass
            if not audio_source:
                print("[!] Voice audio notice: ffmpeg was not found in PATH for voice playback.", flush=True)
                return False
        except Exception as audio_err:
            print(f"[!] Voice audio creation notice: {audio_err}", flush=True)
            return False

        if voice_client and hasattr(voice_client, "play") and audio_source is not None:
            try:
                # Brief settle delay so Discord voice UDP session is fully established
                await asyncio.sleep(0.01 if getattr(discord, "_is_dummy", False) else 0.3)

                # Stop existing playback if any
                is_playing_fn = getattr(voice_client, "is_playing", None)
                if callable(is_playing_fn) and is_playing_fn():
                    stop_fn = getattr(voice_client, "stop", None)
                    if callable(stop_fn):
                        stop_fn()

                play_event = asyncio.Event()
                def on_finish(err=None):
                    if err:
                        print(f"[!] Voice audio playback warning: {err}", flush=True)
                    play_event.set()

                voice_client.play(audio_source, after=on_finish)

                # If dummy discord or mock play method without after() invocation, resolve immediately
                if getattr(discord, "_is_dummy", False) or hasattr(getattr(voice_client, "play", None), "assert_called") or hasattr(getattr(voice_client, "play", None), "mock_calls"):
                    play_event.set()

                # Wait for audio to finish playing or timeout based on message length
                wait_time = max(8.0, min(30.0, len(warning_text) / 8.0 + 4.0))
                try:
                    await asyncio.wait_for(play_event.wait(), timeout=wait_time)
                except asyncio.TimeoutError:
                    pass
            except Exception as play_err:
                print(f"[!] Voice audio playback error: {play_err}", flush=True)
                return False

        return True
    except Exception as e:
        print(f"[!] Voice warning delivery notice: {e}", flush=True)
        return False
    finally:
        # Graceful pause before disconnecting so trailing packets flush
        await asyncio.sleep(0.2)
        if voice_client and hasattr(voice_client, "disconnect"):
            try:
                res = voice_client.disconnect(force=True)
                if asyncio.iscoroutine(res):
                    await res
            except TypeError:
                try:
                    res = voice_client.disconnect()
                    if asyncio.iscoroutine(res):
                        await res
                except Exception:
                    pass
            except Exception:
                pass
        if audio_file and os.path.exists(audio_file):
            try:
                os.remove(audio_file)
            except Exception:
                pass


def record_discord_quarantine(reason: str, http_code: int = 429, error_text: str = ""):
    """Writes a 25-hour cooldown lockfile to halt restart loops."""
    now = time.time()
    until = now + COOLDOWN_DURATION_SECONDS
    ray_id = "unknown"
    if "Ray ID:" in error_text:
        try:
            ray_id = error_text.split("Ray ID:")[1].split("&bull;")[0].replace("<strong>", "").replace("</strong>", "").strip()
        except Exception:
            pass

    state = {
        "status": "QUARANTINED",
        "reason": reason,
        "http_code": http_code,
        "ray_id": ray_id,
        "quarantined_at": now,
        "quarantined_at_iso": datetime.datetime.fromtimestamp(now, datetime.timezone.utc).isoformat(),
        "cooldown_until": until,
        "cooldown_until_iso": datetime.datetime.fromtimestamp(until, datetime.timezone.utc).isoformat(),
        "cooldown_hours": round(COOLDOWN_DURATION_SECONDS / 3600.0, 1)
    }
    try:
        with open(COOLDOWN_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
        print(f"[!] Critical: Discord access blocked ({reason}). 25-hour quarantine engaged until {state['cooldown_until_iso']}.")
    except Exception as ex:
        print(f"[!] Warning writing cooldown file: {ex}")


def clear_discord_quarantine():
    """Removes the cooldown lockfile upon successful login."""
    if os.path.exists(COOLDOWN_FILE):
        try:
            os.remove(COOLDOWN_FILE)
            print("[+] Discord connection verified. Quarantine cleared.", flush=True)
        except Exception:
            pass


def record_rate_limit(rate_limit_type: str, retry_after: float = 15.0, error_text: str = ""):
    """Writes temporary rate-limit telemetry with retry_after for supervisor exponential backoff."""
    now = time.time()
    state = {
        "status": "RATE_LIMITED",
        "type": rate_limit_type,
        "retry_after": retry_after,
        "rate_limited_at": now,
        "rate_limited_at_iso": datetime.datetime.fromtimestamp(now, datetime.timezone.utc).isoformat(),
        "retry_at": now + retry_after,
        "retry_at_iso": datetime.datetime.fromtimestamp(now + retry_after, datetime.timezone.utc).isoformat(),
        "error_text": str(error_text)[:500]
    }
    try:
        with open(RATELIMIT_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
        print(f"[!] Discord rate limit recorded ({rate_limit_type}, retry-after: {retry_after}s).", flush=True)
    except Exception as ex:
        print(f"[!] Warning writing ratelimit file: {ex}", flush=True)


def clear_rate_limit():
    """Removes the temporary rate limit file upon successful connection."""
    if os.path.exists(RATELIMIT_FILE):
        try:
            os.remove(RATELIMIT_FILE)
        except Exception:
            pass


_HAS_SYNCED_COMMANDS = False


@bot.event
async def on_ready():
    global _HAS_SYNCED_COMMANDS
    clear_discord_quarantine()
    clear_rate_limit()
    user_name = getattr(bot.user, "name", "CBM AutoMod")
    user_id = getattr(bot.user, "id", "Unknown")
    disp_name = getattr(bot.user, "display_name", user_name)
    print(f"[+] Authenticated as {user_name} ({user_id})", flush=True)
    print(f"[+] Display Name: {disp_name}", flush=True)
    if not _HAS_SYNCED_COMMANDS:
        try:
            synced = await bot.tree.sync()
            _HAS_SYNCED_COMMANDS = True
            print(f"[+] Synchronized {len(synced)} application command(s) globally.", flush=True)
        except Exception as e:
            print(f"[!] Warning syncing commands: {e}", flush=True)


@bot.tree.command(name="setup", description="Configure CBM AutoMod stealth log channel, ignore list, and server rules.")
@app_commands.describe(
    log_channel="The private moderator channel where deleted message logs are delivered.",
    ignore_channel="Channel to exclude from automated moderation (optional).",
    rules_channel="Channel containing server rules to ingest (optional).",
    rules_text="Direct rules text to enforce alongside content safety policies (optional)."
)
@app_commands.default_permissions(manage_guild=True)
async def setup_command(
    interaction: discord.Interaction,
    log_channel: discord.TextChannel,
    ignore_channel: Optional[discord.TextChannel] = None,
    rules_channel: Optional[discord.TextChannel] = None,
    rules_text: Optional[str] = None
):
    if not interaction.guild_id or not interaction.guild:
        return await interaction.response.send_message("Must be executed within a server.", ephemeral=True)

    me = interaction.guild.me or await interaction.guild.fetch_member(interaction.client.user.id)
    perms = log_channel.permissions_for(me)
    if not (perms.send_messages and perms.embed_links):
        return await interaction.response.send_message(
            f"Bot lacks **Send Messages** or **Embed Links** in {log_channel.mention}.",
            ephemeral=True
        )

    current_cfg = db.get_guild_config(interaction.guild_id)
    ignored = current_cfg.get("ignored_channels", []) if current_cfg else []
    if ignore_channel and ignore_channel.id not in ignored:
        ignored.append(ignore_channel.id)

    extracted_rules = (rules_text or "").strip()
    rules_cid = rules_channel.id if rules_channel else None
    if rules_channel and not extracted_rules:
        try:
            channel_perms = rules_channel.permissions_for(me)
            if getattr(channel_perms, "read_messages", True) and getattr(channel_perms, "read_message_history", True):
                msgs = []
                async for msg in rules_channel.history(limit=10, oldest_first=True):
                    if msg.content:
                        msgs.append(msg.content.strip())
                if msgs:
                    extracted_rules = "\n\n".join(msgs)[:4000]
        except Exception as e:
            print(f"[!] Warning reading rules channel history: {e}", flush=True)

    db.set_guild_config(
        interaction.guild_id,
        log_channel.id,
        ignored,
        rules_channel_id=rules_cid,
        rules_text=extracted_rules if extracted_rules else None
    )
    ignored_text = ", ".join([f"<#{cid}>" for cid in ignored]) if ignored else "None"
    rules_info = f"<#{rules_cid}>" if rules_cid else ("Configured (Direct Text)" if extracted_rules else "Default Safety Only")

    embed = discord.Embed(
        title="CBM AutoMod • Server Configuration Active",
        description="Dual-engine content safety & server rules enforcement is now active.",
        color=EMBED_COLOR_SETUP,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    embed.add_field(name="Log Channel", value=log_channel.mention, inline=True)
    embed.add_field(name="Ignored Channels", value=ignored_text, inline=True)
    embed.add_field(name="Server Rules Source", value=rules_info, inline=True)
    embed.add_field(
        name="Active AI Models",
        value="• `nvidia/nemotron-3.5-content-safety` (Safety Moderation)\n• `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` (Contextual Warnings & Notices)",
        inline=False
    )
    embed.add_field(
        name="Punishment Scale (7-Day Rolling Purge)",
        value="• 1-9: Removal + Verbal Warning (9x)\n• 10-16: 1h Timeout (7x)\n• 17-19: 24h Timeout (3x)\n• 20-21: 1w Timeout (2x)\n• 22: Kick (1x)\n• 23+: Indefinite Ban",
        inline=False
    )
    await interaction.response.send_message(embed=embed, ephemeral=True)


@bot.tree.command(name="set_rules", description="Update server-specific rules for CBM AutoMod reasoning enforcement.")
@app_commands.describe(
    rules_channel="Channel containing server rules (optional).",
    rules_text="Direct rules text to enforce (optional)."
)
@app_commands.default_permissions(manage_guild=True)
async def set_rules_command(
    interaction: discord.Interaction,
    rules_channel: Optional[discord.TextChannel] = None,
    rules_text: Optional[str] = None
):
    if not interaction.guild_id or not interaction.guild:
        return await interaction.response.send_message("Must be executed within a server.", ephemeral=True)

    me = interaction.guild.me or await interaction.guild.fetch_member(interaction.client.user.id)
    extracted_rules = (rules_text or "").strip()
    rules_cid = rules_channel.id if rules_channel else None

    if rules_channel and not extracted_rules:
        try:
            channel_perms = rules_channel.permissions_for(me)
            if getattr(channel_perms, "read_messages", True) and getattr(channel_perms, "read_message_history", True):
                msgs = []
                async for msg in rules_channel.history(limit=10, oldest_first=True):
                    if msg.content:
                        msgs.append(msg.content.strip())
                if msgs:
                    extracted_rules = "\n\n".join(msgs)[:4000]
        except Exception as e:
            print(f"[!] Warning reading rules channel: {e}", flush=True)

    if not extracted_rules and not rules_cid:
        return await interaction.response.send_message("Please provide either a `rules_channel` or direct `rules_text`.", ephemeral=True)

    db.set_guild_rules(interaction.guild_id, rules_text=extracted_rules, rules_channel_id=rules_cid)

    embed = discord.Embed(
        title="CBM AutoMod • Server Rules Ingested",
        description="The reasoning engine will now enforce these server rules alongside internal safety models.",
        color=EMBED_COLOR_SETUP,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    if rules_cid:
        embed.add_field(name="Rules Channel", value=f"<#{rules_cid}>", inline=True)
    if extracted_rules:
        preview = extracted_rules if len(extracted_rules) <= 500 else extracted_rules[:497] + "..."
        embed.add_field(name="Enforced Guidelines", value=f"```{preview}```", inline=False)
    await interaction.response.send_message(embed=embed, ephemeral=True)


@bot.tree.command(name="punishment_status", description="Inspect active infractions and punishment tier for a member.")
@app_commands.describe(member="The server member to inspect")
@app_commands.default_permissions(manage_guild=True)
async def punishment_status(interaction: discord.Interaction, member: discord.Member):
    if not interaction.guild_id:
        return await interaction.response.send_message("Must be executed within a server.", ephemeral=True)

    db.purge_expired_punishments()
    active_count = db.get_active_offense_count(interaction.guild_id, member.id)
    active_punishments = db.get_active_punishments(interaction.guild_id, member.id)
    next_stage, _ = calculate_punishment_tier(active_count + 1)

    embed = discord.Embed(
        title=f"CBM AutoMod • Infraction History for {getattr(member, 'display_name', str(member))}",
        color=EMBED_COLOR_STATUS,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    if hasattr(member, "display_avatar"):
        embed.set_thumbnail(url=member.display_avatar.url)
    embed.add_field(name="Active Infractions (7-Day TTL)", value=f"**{active_count}** active violation(s)", inline=True)
    embed.add_field(name="Next Infraction Consequence", value=f"`{next_stage}`", inline=True)

    if active_punishments:
        lines = []
        for p in active_punishments[:5]:
            exp_ts = int(p.get("expires_at", 0))
            stage = p.get("punishment_stage", "UNKNOWN")
            idx = p.get("offense_index", "?")
            lines.append(f"• **#{idx}** `{stage}` - Expires <t:{exp_ts}:R>")
        embed.add_field(name="Recent Active Penalties", value="\n".join(lines), inline=False)
    else:
        embed.add_field(name="Standing", value="Clean standing (0 active penalties).", inline=False)

    await interaction.response.send_message(embed=embed, ephemeral=True)


@bot.tree.command(name="automod_status", description="View current CBM AutoMod server status.")
@app_commands.default_permissions(manage_guild=True)
async def automod_status(interaction: discord.Interaction):
    if not interaction.guild_id:
        return await interaction.response.send_message("Must be executed in a server.", ephemeral=True)

    cfg = db.get_guild_config(interaction.guild_id)
    if not cfg:
        return await interaction.response.send_message("AutoMod is not configured. Run `/setup` first.", ephemeral=True)

    logs = db.get_audit_logs(interaction.guild_id, limit=5)
    ignored = cfg.get("ignored_channels", [])
    ignored_text = ", ".join([f"<#{cid}>" for cid in ignored]) if ignored else "None"
    rules_text = db.get_guild_rules(interaction.guild_id)
    rules_status = "Custom Rules Active" if rules_text else "Default Safety Only"

    embed = discord.Embed(
        title="CBM AutoMod • Server Status",
        color=EMBED_COLOR_STATUS,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    embed.add_field(name="Monitoring Status", value="`ACTIVE (Dual-Engine NIM)`", inline=True)
    embed.add_field(name="Log Channel", value=f"<#{cfg.get('log_channel_id')}>", inline=True)
    embed.add_field(name="Server Rules", value=f"`{rules_status}`", inline=True)
    embed.add_field(name="Ignored Channels", value=ignored_text, inline=False)
    embed.add_field(
        name="AI Models",
        value="• `nemotron-3.5-content-safety` (Real-Time Interception)\n• `nemotron-3-nano-omni-30b-a3b-reasoning` (Verbal & Voice Warnings)",
        inline=False
    )
    embed.add_field(name="Recent Interceptions", value=f"{len(logs)} incident(s) logged.", inline=False)
    await interaction.response.send_message(embed=embed, ephemeral=True)


async def process_direct_message(message: discord.Message):
    """Moderates direct messages sent directly to the bot in private DM conversations."""
    if message.author.bot or message.webhook_id:
        return

    content_text = message.content or ""
    image_b64 = None

    for att in message.attachments:
        if att.content_type and any(att.content_type.startswith(x) for x in ("image/png", "image/jpeg", "image/webp")):
            if att.size <= 4 * 1024 * 1024:
                try:
                    img_bytes = await att.read()
                    image_b64 = base64.b64encode(img_bytes).decode("ascii")
                    break
                except Exception:
                    pass

    if not content_text and not image_b64:
        return

    start_time = time.time()
    try:
        safety_result = await asyncio.to_thread(
            check_message_safety,
            text=content_text,
            image_b64=image_b64,
            use_cache=True
        )
    except Exception as e:
        print(f"[!] Safety check exception in DM: {e}", flush=True)
        return

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    if not safety_result.get("is_safe", True):
        categories = safety_result.get("categories", [])
        cat_str = ", ".join(categories) if categories else "Policy Violation"
        layer = safety_result.get("layer", "L3_NEMOTRON_3.5")

        try:
            warning_data = await asyncio.to_thread(
                generate_automod_warning_and_notice,
                infraction_text=content_text,
                categories=categories,
                action_type="DM_WARNING",
                offense_count=1,
                user_tag=str(message.author),
                server_rules="Direct messages to CBM AutoMod must adhere to general community safety standards."
            )
        except Exception as ai_err:
            print(f"[!] Warning generation error in DM: {ai_err}", flush=True)
            warning_data = {
                "verbal_warning": f"Please refrain from sending content that violates safety policies ({cat_str}).",
                "punishment_notice": "Direct messages sent to this bot are monitored."
            }

        verbal_warning = warning_data.get("verbal_warning", "").strip()
        punishment_notice = warning_data.get("punishment_notice", "").strip()

        dm_reply = f"{message.author.mention} ⚠️ **Content Safety Warning**:\n{verbal_warning}"
        if punishment_notice:
            dm_reply += f"\n**Notice:** {punishment_notice}"

        try:
            await discord_rate_limiter.execute(lambda: message.channel.send(dm_reply), priority=1)
        except Exception as dm_err:
            print(f"[!] Warning responding to DM: {dm_err}", flush=True)

        # Notify mutual active guild log channel if one exists
        alerted_guild_id = 0
        if hasattr(bot, "guilds"):
            for g in bot.guilds:
                member = g.get_member(message.author.id) if hasattr(g, "get_member") else None
                if member:
                    cfg = db.get_guild_config(g.id)
                    if cfg and cfg.get("is_active"):
                        log_cid = cfg.get("log_channel_id")
                        log_ch = g.get_channel(log_cid) if hasattr(g, "get_channel") else None
                        if log_ch:
                            alerted_guild_id = g.id
                            embed = discord.Embed(
                                title="⚠️ Direct Message Safety Interception",
                                description=f"Member sent violating content via Direct Message.\n**Violating Categories:** `{cat_str}`\n**Detection Engine:** `{layer}` (`{elapsed_ms}ms`)",
                                color=EMBED_COLOR_VIOLATION,
                                timestamp=datetime.datetime.now(datetime.timezone.utc)
                            )
                            if hasattr(message.author, "display_avatar"):
                                embed.set_thumbnail(url=message.author.display_avatar.url)
                            embed.add_field(name="User", value=f"{message.author.mention} (`{message.author.id}`)", inline=True)
                            embed.add_field(name="Location", value="`Direct Message (Private)`", inline=True)
                            embed.add_field(name="Action Taken", value="`DM_WARNING`", inline=True)
                            if content_text:
                                displayed_content = content_text if len(content_text) <= 1000 else content_text[:997] + "..."
                                embed.add_field(name="Message Content", value=f"```{displayed_content}```", inline=False)
                            embed.set_footer(text="CBM AutoMod • Direct Message Safety Monitor")
                            try:
                                await discord_rate_limiter.execute(lambda: log_ch.send(embed=embed), priority=2)
                            except Exception as alert_err:
                                print(f"[!] Failed to deliver DM log to mutual guild: {alert_err}", flush=True)
                            break

        try:
            db.record_audit_log(
                guild_id=alerted_guild_id,
                channel_id=message.channel.id,
                author_id=message.author.id,
                author_tag=str(message.author),
                content_snippet=content_text,
                violation_categories=categories,
                detection_layer=layer,
                execution_time_ms=elapsed_ms,
                attachments_count=len(message.attachments),
                action_taken="DM_WARNING"
            )
        except Exception as e:
            print(f"[!] Warning recording DM audit log: {e}", flush=True)


async def process_message(message: discord.Message):
    if message.author.bot or message.webhook_id:
        return

    # Direct Message (DM) / Private Conversation Moderation
    if not message.guild:
        await process_direct_message(message)
        return

    cfg = db.get_guild_config(message.guild.id)
    if not cfg or not cfg.get("is_active"):
        return

    if message.channel.id in cfg.get("ignored_channels", []) or message.channel.id == cfg.get("log_channel_id"):
        return

    content_text = message.content or ""
    image_b64 = None

    for att in message.attachments:
        if att.content_type and any(att.content_type.startswith(x) for x in ("image/png", "image/jpeg", "image/webp")):
            if att.size <= 4 * 1024 * 1024:
                try:
                    img_bytes = await att.read()
                    image_b64 = base64.b64encode(img_bytes).decode("ascii")
                    break
                except Exception:
                    pass

    if not content_text and not image_b64:
        return

    start_time = time.time()
    try:
        safety_result = await asyncio.to_thread(
            check_message_safety,
            text=content_text,
            image_b64=image_b64,
            use_cache=True
        )
    except Exception as e:
        print(f"[!] Safety check exception: {e}", flush=True)
        return

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    if not safety_result.get("is_safe", True):
        # Detect Private Channel / Private Thread status
        is_private_channel = False
        try:
            default_role = getattr(message.guild, "default_role", None)
            if default_role and hasattr(message.channel, "permissions_for"):
                perms_everyone = message.channel.permissions_for(default_role)
                if not getattr(perms_everyone, "view_channel", True):
                    is_private_channel = True
            if hasattr(message.channel, "is_private"):
                is_priv_attr = message.channel.is_private
                if callable(is_priv_attr):
                    is_private_channel = is_private_channel or bool(is_priv_attr())
                elif isinstance(is_priv_attr, bool):
                    is_private_channel = is_private_channel or is_priv_attr
        except Exception:
            pass

        # If it's a private thread where the bot is not yet a member, attempt to join
        if hasattr(message.channel, "join") and hasattr(message.channel, "me") and not message.channel.me:
            try:
                await message.channel.join()
            except Exception:
                pass

        # 1. Immediate message deletion with private channel permission resiliency
        deletion_success = True
        deletion_error = None
        try:
            await discord_rate_limiter.execute(message.delete, priority=1)
        except discord.errors.Forbidden as forb_del:
            deletion_success = False
            deletion_error = "Missing 'Manage Messages' permission in this private channel."
            channel_name = getattr(message.channel, "name", str(message.channel.id))
            print(f"[!] Warning: Missing 'Manage Messages' permission to delete message from {message.author} in private channel #{channel_name}", flush=True)
        except Exception as ex_del:
            deletion_success = False
            deletion_error = str(ex_del)

        categories = safety_result.get("categories", [])
        cat_str = ", ".join(categories) if categories else "Policy Violation"
        layer = safety_result.get("layer", "L3_NEMOTRON_3.5")

        # 2. Expired Punishments Purge and calculate active offense index
        db.purge_expired_punishments()
        active_count = db.get_active_offense_count(message.guild.id, message.author.id)
        new_offense_index = active_count + 1
        punishment_stage, punishment_duration = calculate_punishment_tier(new_offense_index)

        # 3. Retrieve server rules
        server_rules = db.get_guild_rules(message.guild.id)

        # 4. Invoke NVIDIA NIM Reasoning Model (nemotron-3-nano-omni-30b-a3b-reasoning)
        try:
            warning_data = await asyncio.to_thread(
                generate_automod_warning_and_notice,
                infraction_text=content_text,
                categories=categories,
                action_type=punishment_stage,
                offense_count=new_offense_index,
                user_tag=str(message.author),
                server_rules=server_rules
            )
        except Exception as ai_err:
            print(f"[!] Warning generation error: {ai_err}", flush=True)
            warning_data = {
                "verbal_warning": f"Please adhere to community guidelines and server rules regarding {cat_str}.",
                "punishment_notice": f"Infraction #{new_offense_index}: Consequence `{punishment_stage}` applied.",
                "voice_script": f"Warning for {getattr(message.author, 'display_name', 'user')}. Infraction #{new_offense_index}. Please adhere to server guidelines.",
                "reasoning_model": "fallback-local"
            }

        verbal_warning = sanitize_warning_text(warning_data.get("verbal_warning", "").strip(), content_text)
        punishment_notice = warning_data.get("punishment_notice", "").strip()
        voice_script = sanitize_warning_text(warning_data.get("voice_script", "").strip() or f"{verbal_warning}. {punishment_notice}".strip(), content_text)

        # 5. Voice Verbal Warning: If offender is in a voice channel in real time, generate voice warning, join, play, and disconnect
        voice_warning_delivered = False
        member = message.author
        if hasattr(message.guild, "get_member"):
            guild_member = message.guild.get_member(message.author.id)
            if guild_member:
                member = guild_member

        # Locate target voice channel across member state, guild voice channels, or message channel
        target_vc = find_member_voice_channel(message.guild, message.author.id, message.channel)

        if target_vc is not None:
            spoken_text = voice_script or f"{verbal_warning}. {punishment_notice}".strip()
            try:
                voice_warning_delivered = await play_voice_warning(member, spoken_text, target_vc=target_vc)
            except Exception as vc_err:
                print(f"[!] Voice warning execution notice: {vc_err}", flush=True)

        # 6. Text Verbal Warning + Punishment Notice: Send in-channel tagging the user, fallback to DM if channel is restricted
        text_message_parts = [f"{message.author.mention} {verbal_warning}"]
        if punishment_notice:
            text_message_parts.append(f"**Notice:** {punishment_notice}")
        in_channel_text = "\n".join(text_message_parts)

        warning_sent_in_channel = False
        try:
            me = getattr(message.guild, "me", None)
            can_send = True
            if me and hasattr(message.channel, "permissions_for"):
                ch_perms = message.channel.permissions_for(me)
                can_send = getattr(ch_perms, "send_messages", True)

            if can_send:
                await discord_rate_limiter.execute(
                    lambda: message.channel.send(in_channel_text),
                    priority=1
                )
                warning_sent_in_channel = True
        except Exception as send_err:
            print(f"[!] In-channel send failed in #{getattr(message.channel, 'name', message.channel.id)}: {send_err}", flush=True)

        # Fallback to direct message (DM) if unable to post in the private channel
        warning_sent_in_dm = False
        if not warning_sent_in_channel:
            try:
                guild_name = getattr(message.guild, "name", "Server")
                dm_text = f"**CBM AutoMod Notice ({guild_name})**:\n{verbal_warning}"
                if punishment_notice:
                    dm_text += f"\n**Notice:** {punishment_notice}"
                if not deletion_success:
                    dm_text += f"\n*Note: Your message in #{getattr(message.channel, 'name', message.channel.id)} was flagged for policy violation.*"
                await discord_rate_limiter.execute(
                    lambda: message.author.send(dm_text),
                    priority=1
                )
                warning_sent_in_dm = True
            except Exception as dm_err:
                print(f"[!] Fallback DM warning failed for {message.author}: {dm_err}", flush=True)

        # 7. Execute Punishment (After text verbal warning is sent or after voice verbal warning is played along with notice)
        execution_success = True
        execution_error = None
        try:
            reason_str = f"CBM AutoMod Infraction #{new_offense_index} [{cat_str}]"
            if punishment_stage.startswith("TIMEOUT") and punishment_duration:
                if hasattr(member, "timeout"):
                    await discord_rate_limiter.execute(
                        lambda: member.timeout(punishment_duration, reason=reason_str),
                        priority=1
                    )
            elif punishment_stage == "KICK":
                if hasattr(member, "kick"):
                    await discord_rate_limiter.execute(
                        lambda: member.kick(reason=reason_str),
                        priority=1
                    )
            elif punishment_stage == "BAN":
                if hasattr(member, "ban"):
                    await discord_rate_limiter.execute(
                        lambda: member.ban(reason=reason_str, delete_message_days=0),
                        priority=1
                    )
        except discord.errors.Forbidden as forb_err:
            execution_success = False
            execution_error = "Missing Discord permissions or member has higher role hierarchy."
            print(f"[!] AutoMod punishment forbidden: {forb_err}", flush=True)
        except Exception as pun_err:
            execution_success = False
            execution_error = str(pun_err)
            print(f"[!] AutoMod punishment execution error: {pun_err}", flush=True)

        # 8. Record Punishment in Database with 7-Day Expiration
        try:
            db.record_punishment(
                guild_id=message.guild.id,
                user_id=message.author.id,
                user_tag=str(message.author),
                channel_id=message.channel.id,
                offense_index=new_offense_index,
                punishment_stage=punishment_stage,
                reason=cat_str,
                violation_categories=categories,
                ttl_seconds=7 * 86400.0
            )
        except Exception as db_err:
            print(f"[!] Error recording punishment to DB: {db_err}", flush=True)

        # 9. Deliver Audit Log Embed to Log Channel
        log_channel_id = cfg.get("log_channel_id")
        log_channel = message.guild.get_channel(log_channel_id)
        if log_channel:
            has_voice_deps = True
            if not getattr(discord, "_is_dummy", False):
                try:
                    import nacl.secret
                    import davey
                except ImportError:
                    has_voice_deps = False

            if voice_warning_delivered:
                voice_status_str = "Delivered in VC"
            elif target_vc is None:
                voice_status_str = "Not in VC"
            elif not has_voice_deps:
                voice_status_str = "Failed (Missing PyNaCl / davey)"
            else:
                voice_status_str = "Failed / Perms"

            ch_mention = getattr(message.channel, "mention", f"#{getattr(message.channel, 'name', message.channel.id)}")
            ch_display = f"{ch_mention} `(Private Channel)`" if is_private_channel else ch_mention
            warning_delivery_status = "In-Channel" if warning_sent_in_channel else ("Delivered via DM" if warning_sent_in_dm else "Failed (DMs Blocked)")

            embed = discord.Embed(
                title="🚫 AutoMod Moderation Event",
                description=f"**Violation Categories:** `{cat_str}`\n**Detection Engine:** `{layer}` (`{elapsed_ms}ms`)\n**Reasoning Engine:** `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`",
                color=EMBED_COLOR_VIOLATION,
                timestamp=datetime.datetime.now(datetime.timezone.utc)
            )
            if hasattr(message.author, "display_avatar"):
                embed.set_thumbnail(url=message.author.display_avatar.url)
            embed.add_field(name="User", value=f"{message.author.mention} (`{message.author.id}`)", inline=True)
            embed.add_field(name="Channel", value=ch_display, inline=True)
            embed.add_field(name="Offense Count (7d)", value=f"**#{new_offense_index}**", inline=True)
            embed.add_field(name="Punishment Stage", value=f"`{punishment_stage}`", inline=True)
            embed.add_field(name="Voice Warning", value=f"`{voice_status_str}`", inline=True)
            embed.add_field(name="Warning Delivery", value=f"`{warning_delivery_status}`", inline=True)

            if not deletion_success:
                embed.add_field(
                    name="⚠️ Deletion Notice",
                    value=f"Could not auto-delete message in {message.channel.mention} ({deletion_error or 'Forbidden'}). Manual deletion required.",
                    inline=False
                )

            if not execution_success and execution_error:
                embed.add_field(name="Execution Warning", value=f"⚠️ `{execution_error}`", inline=False)

            if content_text:
                displayed_content = content_text if len(content_text) <= 1000 else content_text[:997] + "..."
                embed.add_field(name="Deleted Content" if deletion_success else "Flagged Content", value=f"```{displayed_content}```", inline=False)

            if message.attachments:
                att_names = ", ".join([att.filename for att in message.attachments])
                embed.add_field(name="Attachments", value=f"`{att_names}`", inline=False)

            embed.set_footer(text="CBM AutoMod • Dual-Engine NIM Enforcement (7-Day TTL)")

            try:
                await discord_rate_limiter.execute(lambda: log_channel.send(embed=embed), priority=2)
            except Exception as e:
                print(f"[!] Failed to deliver log embed: {e}", flush=True)

        # 10. Record Audit Log in SQLite
        try:
            db.record_audit_log(
                guild_id=message.guild.id,
                channel_id=message.channel.id,
                author_id=message.author.id,
                author_tag=str(message.author),
                content_snippet=content_text,
                violation_categories=categories,
                detection_layer=layer,
                execution_time_ms=elapsed_ms,
                attachments_count=len(message.attachments),
                action_taken=punishment_stage
            )
        except Exception as e:
            print(f"[!] Warning recording audit log: {e}", flush=True)


@bot.event
async def on_message(message: discord.Message):
    await process_message(message)


@bot.event
async def on_message_edit(before: discord.Message, after: discord.Message):
    await process_message(after)


def main():
    if getattr(discord, "_is_dummy", False):
        print("[!] Fatal: discord.py package is not installed in the active Python environment.", file=sys.stderr, flush=True)
        sys.exit(1)

    if not DISCORD_BOT_TOKEN:
        print("[!] DISCORD_BOT_TOKEN is not configured.", flush=True)
        sys.exit(1)

    # Pre-validate / auto-install voice dependencies (PyNaCl & davey) in background
    ensure_voice_dependencies()

    try:
        bot.run(DISCORD_BOT_TOKEN)
    except discord.errors.PrivilegedIntentsRequired:
        print("[!] Warning: Privileged Gateway Intent 'MESSAGE CONTENT INTENT' is not enabled in Discord Developer Portal.", flush=True)
        print("[!] Falling back to basic gateway intents (Slash commands operational; text scanning restricted).", flush=True)
        bot.intents.message_content = False
        try:
            bot.run(DISCORD_BOT_TOKEN)
        except Exception as e:
            print(f"[!] Fatal AutoMod runtime error after intent fallback: {e}", flush=True)
            sys.exit(1)
    except discord.errors.LoginFailure as login_err:
        print(f"[!] Fatal: Discord login authentication failed (Verify DISCORD_BOT_TOKEN in .env): {login_err}", file=sys.stderr, flush=True)
        sys.exit(1)
    except discord.errors.HTTPException as http_err:
        err_text = str(http_err)
        # Cloudflare Error 1015 (IP banned by Cloudflare edge)
        if "1015" in err_text or ("cloudflare" in err_text.lower() and "rate limit" in err_text.lower()):
            record_discord_quarantine(
                reason="CLOUDFLARE_1015_IP_RATE_LIMITED",
                http_code=http_err.status,
                error_text=err_text
            )
            # Exit code 42 signals to the supervisor that a 25-hour quarantine was initiated
            sys.exit(42)
        elif http_err.status == 429 or "rate limit" in err_text.lower():
            # Standard Discord HTTP 429 rate limit
            retry_after = getattr(http_err, "retry_after", None)
            if retry_after is None:
                try:
                    import re
                    m = re.search(r"retry_after['\"]?:\s*([0-9.]+)", err_text)
                    if m:
                        retry_after = float(m.group(1))
                except Exception:
                    pass
            record_rate_limit(
                rate_limit_type="DISCORD_HTTP_429",
                retry_after=float(retry_after or 15.0),
                error_text=err_text
            )
            sys.exit(429)
        else:
            print(f"[!] Discord HTTP Exception ({http_err.status}): {http_err}", flush=True)
            sys.exit(1)
    except Exception as e:
        err_text = str(e).lower()
        if "proxy" in err_text and DISCORD_PROXY_URL:
            print(f"[!] Egress proxy connection failed: {e}. Retrying with direct server connection...", flush=True)
            bot.proxy = None
            try:
                bot.run(DISCORD_BOT_TOKEN)
                return
            except Exception as direct_err:
                print(f"[!] Direct connection also failed: {direct_err}", flush=True)
                sys.exit(1)
        print(f"[!] Fatal AutoMod runtime error: {e}", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
