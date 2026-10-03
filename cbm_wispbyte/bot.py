#!/usr/bin/env python3
"""
CBM | AutoMod (CBM | Content Safety)
====================================
Stealth Discord Auto-Moderation Bot powered by NVIDIA Nemotron-3.5-Content-Safety NIM.
Zero in-channel noise; strictly dispatches audit reports to designated log channels.
"""

import os
import sys
import time
import base64
import asyncio
import datetime
from typing import Optional, List

import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

# Ensure local CBM modules are importable
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

load_dotenv(os.path.join(current_dir, ".env"))

from automod_db import AutoModDB
from chat_engine import check_message_safety

DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "").strip()

# Minimal required intents
intents = discord.Intents.default()
intents.guilds = True
intents.messages = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
db = AutoModDB()

# Aesthetic dark palette constants
EMBED_COLOR_VIOLATION = 0xDC2626  # Crimson / Dark Red
EMBED_COLOR_SETUP = 0x0070E0      # CBM Blue
EMBED_COLOR_STATUS = 0x10B981     # Emerald Green


@bot.event
async def on_ready():
    print(f"[+] Authenticated as {bot.user.name} ({bot.user.id})")
    print(f"[+] Display Name: {bot.user.display_name}")
    try:
        synced = await bot.tree.sync()
        print(f"[+] Synchronized {len(synced)} application command(s) globally.")
    except Exception as e:
        print(f"[!] Warning syncing commands: {e}")


# ==============================================================================
# Slash Command: /setup
# ==============================================================================
@bot.tree.command(
    name="setup",
    description="Configure CBM AutoMod stealth log channel and channel ignore list."
)
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
        return await interaction.response.send_message(
            "This command must be executed within a Discord server.",
            ephemeral=True
        )

    # Validate bot permissions in the designated log channel
    me = interaction.guild.me
    if not me:
        me = await interaction.guild.fetch_member(interaction.client.user.id)

    perms = log_channel.permissions_for(me)
    if not (perms.send_messages and perms.embed_links):
        return await interaction.response.send_message(
            f"Bot lacks **Send Messages** or **Embed Links** permissions in {log_channel.mention}. "
            f"Please update channel permissions first.",
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
        description="Stealth content safety monitoring is now active on this server.",
        color=EMBED_COLOR_SETUP,
        timestamp=datetime.datetime.now(datetime.timezone.utc)
    )
    embed.add_field(name="Log Channel", value=log_channel.mention, inline=True)
    embed.add_field(name="Ignored Channels", value=ignored_text, inline=True)
    embed.add_field(name="Model Engine", value="`nvidia/nemotron-3.5-content-safety`", inline=False)
    embed.set_footer(text="Stealth Mode Active • Violating content is purged with zero in-channel output.")

    await interaction.response.send_message(embed=embed, ephemeral=True)


# ==============================================================================
# Slash Command: /ignore_remove
# ==============================================================================
@bot.tree.command(
    name="ignore_remove",
    description="Remove a channel from the AutoMod ignore list."
)
@app_commands.describe(channel="The channel to un-ignore.")
@app_commands.default_permissions(manage_guild=True)
async def ignore_remove(interaction: discord.Interaction, channel: discord.TextChannel):
    if not interaction.guild_id:
        return await interaction.response.send_message("Must be executed in a server.", ephemeral=True)

    cfg = db.get_guild_config(interaction.guild_id)
    if not cfg:
        return await interaction.response.send_message("AutoMod is not configured yet. Run `/setup` first.", ephemeral=True)

    removed = db.remove_ignored_channel(interaction.guild_id, channel.id)
    if removed:
        await interaction.response.send_message(f"Removed {channel.mention} from ignored channels.", ephemeral=True)
    else:
        await interaction.response.send_message(f"{channel.mention} is not currently in the ignore list.", ephemeral=True)


# ==============================================================================
# Slash Command: /automod_status
# ==============================================================================
@bot.tree.command(
    name="automod_status",
    description="View current CBM AutoMod status and audit summary."
)
@app_commands.default_permissions(manage_guild=True)
async def automod_status(interaction: discord.Interaction):
    if not interaction.guild_id:
        return await interaction.response.send_message("Must be executed in a server.", ephemeral=True)

    cfg = db.get_guild_config(interaction.guild_id)
    if not cfg:
        return await interaction.response.send_message("AutoMod is not configured on this server. Run `/setup` to initialize.", ephemeral=True)

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
    embed.add_field(name="Recent Interceptions", value=f"{len(logs)} incident(s) logged in database.", inline=False)
    embed.set_footer(text="CBM | Content Safety • NVIDIA Nemotron NIM Engine")

    await interaction.response.send_message(embed=embed, ephemeral=True)


# ==============================================================================
# Stealth AutoMod Listener
# ==============================================================================
@bot.event
async def on_message(message: discord.Message):
    # Ignore bots, webhooks, and DMs
    if message.author.bot or message.webhook_id or not message.guild:
        return

    # Check guild configuration
    cfg = db.get_guild_config(message.guild.id)
    if not cfg or not cfg.get("is_active"):
        return

    # Skip ignored channels or the log channel itself
    if message.channel.id in cfg.get("ignored_channels", []) or message.channel.id == cfg.get("log_channel_id"):
        return

    # Skip users with administrator/manage_guild permissions
    perms = getattr(message.author, "guild_permissions", None)
    if perms and (perms.administrator or perms.manage_guild):
        return

    content_text = message.content or ""
    image_b64 = None

    # Check for image attachments to inspect with Multimodal Nemotron 3.5
    for att in message.attachments:
        if att.content_type and any(att.content_type.startswith(x) for x in ("image/png", "image/jpeg", "image/webp")):
            if att.size <= 4 * 1024 * 1024:  # Max 4MB
                try:
                    img_bytes = await att.read()
                    image_b64 = base64.b64encode(img_bytes).decode("ascii")
                    break
                except Exception:
                    pass

    # Nothing to moderate
    if not content_text and not image_b64:
        return

    # Execute Tiered Moderation Pipeline asynchronously off the gateway thread
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

    # Action: If content is flagged unsafe
    if not safety_result.get("is_safe", True):
        # 1. STEALTH DELETION: Never send any public messages to the offending user/channel
        try:
            await message.delete()
        except discord.NotFound:
            pass  # Message was already deleted
        except discord.Forbidden:
            print(f"[!] Lacking Manage Messages permission in guild {message.guild.id}, channel {message.channel.id}")
            return
        except Exception as e:
            print(f"[!] Unexpected error deleting message: {e}")
            return

        # 2. LOG DISPATCH: Send detailed audit record to the designated log channel
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
        embed.add_field(
            name="Subject / Offender",
            value=f"{message.author.mention} (`{message.author.id}`)",
            inline=True
        )
        embed.add_field(name="Channel", value=message.channel.mention, inline=True)
        embed.add_field(
            name="Account Created",
            value=f"<t:{int(message.author.created_at.timestamp())}:R>",
            inline=True
        )

        if content_text:
            displayed_content = content_text if len(content_text) <= 1000 else content_text[:997] + "..."
            embed.add_field(name="Deleted Message Content", value=f"```{displayed_content}```", inline=False)

        if message.attachments:
            att_names = ", ".join([att.filename for att in message.attachments])
            embed.add_field(name="Attachments", value=f"`{att_names}`", inline=False)

        embed.set_footer(text="Stealth Moderation • Zero Public In-Channel Feedback")

        try:
            await log_channel.send(embed=embed)
        except Exception as e:
            print(f"[!] Failed to deliver log embed to {log_channel_id}: {e}")

        # 3. RECORD AUDIT LOG IN SQLITE
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


# ==============================================================================
# Entry Point
# ==============================================================================
def main():
    if not DISCORD_BOT_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN is not configured in environment or .env")
    bot.run(DISCORD_BOT_TOKEN)


if __name__ == "__main__":
    main()
