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
from typing import Optional, List

try:
    import discord
    from discord import app_commands
    from discord.ext import commands
except ImportError:
    class _DummyIntents:
        @classmethod
        def default(cls): return cls()
        guilds = messages = message_content = True
    class _DummyTree:
        def command(self, *args, **kwargs):
            return lambda fn: fn
        async def sync(self): return []
    class _DummyBot:
        def __init__(self, *args, **kwargs):
            self.tree = _DummyTree()
            self.user = None
        def event(self, fn): return fn
        def run(self, *args, **kwargs): pass
    class _DummyDiscord:
        Intents = _DummyIntents
        Interaction = object
        TextChannel = object
        Message = object
        class errors:
            class HTTPException(Exception):
                status = 400
            class RateLimited(Exception):
                retry_after = 5.0
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
    commands = _DummyCommands
    app_commands = _DummyAppCommands
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

load_dotenv(os.path.join(current_dir, ".env"))

from automod_db import AutoModDB
from chat_engine import check_message_safety

DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
DISCORD_PROXY_URL = os.environ.get("DISCORD_PROXY_URL", "").strip() or None
COOLDOWN_FILE = os.path.join(current_dir, "automod_cooldown.json")
COOLDOWN_DURATION_SECONDS = int(os.environ.get("DISCORD_COOLDOWN_SECONDS", 90000))  # 25 Hours

class DiscordRateLimiter:
    """
    Priority Leaky-Bucket Rate Limiter & Circuit Breaker.
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
        self.circuit_open_until = max(self.circuit_open_until, now + reset_after_seconds + 1.0)
        print(f"[!] Discord rate limit circuit breaker engaged: Pausing dispatch for {reset_after_seconds + 1.0:.1f}s")

    async def execute(self, target, priority: int = 1, max_retries: int = 3):
        for attempt in range(max_retries):
            await self.acquire(priority=priority)
            try:
                if callable(target):
                    res = target()
                    if asyncio.iscoroutine(res):
                        return await res
                    return res
                elif asyncio.iscoroutine(target):
                    return await target
                return target
            except Exception as e:
                err_text = str(e)
                status = getattr(e, "status", None)
                if status == 429 or "rate limit" in err_text.lower():
                    retry_after = getattr(e, "retry_after", 5.0)
                    self.trip_circuit_breaker(retry_after)
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(retry_after + 1.0)
                else:
                    raise
        return None

discord_rate_limiter = DiscordRateLimiter(max_per_minute=40)

# Minimal required intents
intents = discord.Intents.default()
intents.guilds = True
intents.messages = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents, proxy=DISCORD_PROXY_URL)
db = AutoModDB()

EMBED_COLOR_VIOLATION = 0xDC2626
EMBED_COLOR_SETUP = 0x0070E0
EMBED_COLOR_STATUS = 0x10B981


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
            print("[+] Discord connection verified. Quarantine cleared.")
        except Exception:
            pass


@bot.event
async def on_ready():
    clear_discord_quarantine()
    print(f"[+] Authenticated as {bot.user.name} ({bot.user.id})")
    print(f"[+] Display Name: {bot.user.display_name}")
    try:
        synced = await bot.tree.sync()
        print(f"[+] Synchronized {len(synced)} application command(s) globally.")
    except Exception as e:
        print(f"[!] Warning syncing commands: {e}")


@bot.tree.command(name="setup", description="Configure CBM AutoMod stealth log channel and ignore list.")
@app_commands.describe(
    log_channel="The private moderator channel where deleted message logs are delivered.",
    ignore_channel="Channel to exclude from automated moderation (optional)."
)
@app_commands.default_permissions(manage_guild=True)
async def setup_command(
    interaction: discord.Interaction,
    log_channel: discord.TextChannel,
    ignore_channel: Optional[discord.TextChannel] = None
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

    db.set_guild_config(interaction.guild_id, log_channel.id, ignored)
    ignored_text = ", ".join([f"<#{cid}>" for cid in ignored]) if ignored else "None"

    embed = discord.Embed(
        title="CBM AutoMod • Stealth Configuration Active",
        description="Content safety monitoring is now active on this server.",
        color=EMBED_COLOR_SETUP,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    embed.add_field(name="Log Channel", value=log_channel.mention, inline=True)
    embed.add_field(name="Ignored Channels", value=ignored_text, inline=True)
    embed.add_field(name="Model Engine", value="`nvidia/nemotron-3.5-content-safety`", inline=False)
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

    embed = discord.Embed(
        title="CBM AutoMod • Server Status",
        color=EMBED_COLOR_STATUS,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    embed.add_field(name="Monitoring Status", value="`ACTIVE (Stealth)`", inline=True)
    embed.add_field(name="Log Channel", value=f"<#{cfg.get('log_channel_id')}>", inline=True)
    embed.add_field(name="Ignored Channels", value=ignored_text, inline=False)
    embed.add_field(name="Recent Interceptions", value=f"{len(logs)} incident(s) logged.", inline=False)
    await interaction.response.send_message(embed=embed, ephemeral=True)


@bot.event
async def on_message(message: discord.Message):
    if message.author.bot or message.webhook_id or not message.guild:
        return

    cfg = db.get_guild_config(message.guild.id)
    if not cfg or not cfg.get("is_active"):
        return

    if message.channel.id in cfg.get("ignored_channels", []) or message.channel.id == cfg.get("log_channel_id"):
        return

    perms = getattr(message.author, "guild_permissions", None)
    if perms and (perms.administrator or perms.manage_guild):
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
        print(f"[!] Safety check exception: {e}")
        return

    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    if not safety_result.get("is_safe", True):
        try:
            await discord_rate_limiter.execute(message.delete, priority=1)
        except Exception:
            return

        log_channel_id = cfg.get("log_channel_id")
        log_channel = message.guild.get_channel(log_channel_id)
        if not log_channel:
            return

        categories = safety_result.get("categories", [])
        cat_str = ", ".join(categories) if categories else "Policy Violation"
        layer = safety_result.get("layer", "L3_NEMOTRON_3.5")

        embed = discord.Embed(
            title="🚫 Content Removed by CBM AutoMod",
            description=f"**Violating Categories:** `{cat_str}`\n**Detection Engine:** `{layer}` (`{elapsed_ms}ms`)",
            color=EMBED_COLOR_VIOLATION,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )
        embed.set_thumbnail(url=message.author.display_avatar.url)
        embed.add_field(name="Subject / Offender", value=f"{message.author.mention} (`{message.author.id}`)", inline=True)
        embed.add_field(name="Channel", value=message.channel.mention, inline=True)
        embed.add_field(name="Account Created", value=f"<t:{int(message.author.created_at.timestamp())}:R>", inline=True)

        if content_text:
            displayed_content = content_text if len(content_text) <= 1000 else content_text[:997] + "..."
            embed.add_field(name="Deleted Message Content", value=f"```{displayed_content}```", inline=False)

        if message.attachments:
            att_names = ", ".join([att.filename for att in message.attachments])
            embed.add_field(name="Attachments", value=f"`{att_names}`", inline=False)

        embed.set_footer(text="Stealth Moderation • Zero Public In-Channel Feedback")

        try:
            await discord_rate_limiter.execute(lambda: log_channel.send(embed=embed), priority=2)
        except Exception as e:
            print(f"[!] Failed to deliver log embed: {e}")

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
                action_taken="SILENT_PURGE"
            )
        except Exception as e:
            print(f"[!] Warning recording audit log: {e}")


def main():
    if not DISCORD_BOT_TOKEN:
        print("[!] DISCORD_BOT_TOKEN is not configured.")
        sys.exit(1)

    try:
        bot.run(DISCORD_BOT_TOKEN)
    except discord.errors.HTTPException as http_err:
        err_text = str(http_err)
        if http_err.status == 429 or "1015" in err_text or "rate limit" in err_text.lower():
            record_discord_quarantine(
                reason="CLOUDFLARE_1015_IP_RATE_LIMITED",
                http_code=http_err.status,
                error_text=err_text
            )
            # Exit code 42 signals to the supervisor that a 25-hour quarantine was initiated
            sys.exit(42)
        else:
            print(f"[!] Discord HTTP Exception ({http_err.status}): {http_err}")
            sys.exit(1)
    except Exception as e:
        print(f"[!] Fatal AutoMod runtime error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
