# Implementation Plan: CBM | AutoMod Discord Content Safety Bot

## Overview
Deploys the official "CBM | AutoMod" ("CBM | Content Safety") Discord bot, integrated with the existing NVIDIA Nemotron-3.5-Content-Safety NIM tiered moderation pipeline (`chat_engine.py` & `ai_service.py`). The bot operates in **stealth mode**: flagged messages are quietly deleted without in-channel bot feedback, and detailed audit reports with flagged categories and latency telemetry are dispatched exclusively to the server's configured moderator log channel.

---

## Architectural Decisions

1. **Location in Authoritative Master Runtime**:
   - In adherence to repository guidelines, all bot components reside in `cbm_wispbyte/`:
     - `cbm_wispbyte/automod_db.py`: Guild configuration persistence (SQLite backed with in-memory caching).
     - `cbm_wispbyte/bot.py` (or `automod_bot.py`): Core Discord Gateway & Application Command daemon.
     - `cbm_wispbyte/sync_discord_profile.py`: Automated profile synchronization (sets application name, display name, and icon).
2. **Integration with Existing Tiered Moderation Pipeline**:
   - Reuses `check_message_safety(text, attachments, image_b64, use_cache=True)` from `cbm_wispbyte/chat_engine.py`.
   - **Layer 1**: Zero-latency homoglyph & regex normalizer (<1ms).
   - **Layer 2**: SHA-256 in-memory LRU verdict cache (<1ms).
   - **Layer 3**: NVIDIA Nemotron-3.5-Content-Safety NIM (200-500ms) with circuit-breaker fallback.
3. **Multimodal Safety Inspection**:
   - Inspects image attachments (PNG, JPEG, WebP up to 4MB) by reading the attachment stream asynchronously and passing base64 bytes to Layer 3 multimodal safety.
4. **Stealth Operation Paradigm**:
   - Zero in-channel feedback (no public pings, no warning messages in the infraction channel).
   - Offending messages are removed via `await message.delete()`.
   - A structured dark-themed embed is dispatched to the designated `log_channel`.
5. **Permissions & Security Scopes**:
   - Minimal permissions integer: `124928` (`VIEW_CHANNEL` + `SEND_MESSAGES` + `MANAGE_MESSAGES` + `EMBED_LINKS` + `ATTACH_FILES` + `READ_MESSAGE_HISTORY`).
   - Slash command `/setup` restricted via `@app_commands.default_permissions(manage_guild=True)`.
   - Admins and moderators (`manage_guild` or `administrator`) bypass automated filtration.

---

## Task List

### Phase 1: Environment & Profile Provisioning
- [ ] **Task 1: Discord Credentials & Environment Setup**
  - Add `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, and `DISCORD_PUBLIC_KEY` to `cbm_wispbyte/.env` and `g:\TerriX\.env`.
  - Validate environment loading in `cbm_wispbyte`.
- [ ] **Task 2: Automated Bot Profile & Icon Synchronization**
  - Create `cbm_wispbyte/sync_discord_profile.py` using Discord REST API (`PATCH /users/@me` and `PATCH /applications/@me`).
  - Read `G:\TerriX\cbm_wispbyte\developer-platform-icon.png` as base64 and set bot avatar and application icon.
  - Set username / display name to `CBM | AutoMod`.

### Checkpoint: Profile & Credentials
- [ ] Environment contains valid credentials.
- [ ] Bot icon and application profile synced on Discord Developer Portal.

---

### Phase 2: Database Storage Engine
- [ ] **Task 3: Guild Configuration Store (`cbm_wispbyte/automod_db.py`)**
  - Create `AutoModDB` class managing `cbm_automod_guilds` table in `cbm_data.db`.
  - Implement `get_guild_config(guild_id: int)` with in-memory caching.
  - Implement `set_guild_config(guild_id: int, log_channel_id: int, ignored_channels: List[int])`.
  - Implement `remove_ignored_channel(guild_id: int, channel_id: int)`.
  - Create table `cbm_automod_audit_logs` for historical persistence of purged content.

### Checkpoint: Database Storage
- [ ] Run unit test for `automod_db.py` verifying CRUD operations and cache invalidation.

---

### Phase 3: Core Bot & Stealth Moderation Engine
- [ ] **Task 4: Core Bot Implementation (`cbm_wispbyte/bot.py`)**
  - Implement `commands.Bot` with `intents.message_content = True`, `intents.guilds = True`, `intents.messages = True`.
  - Implement global slash commands:
    - `/setup log_channel [ignore_channel]`: Configures log channel and initial ignore channel. Ephemeral response.
    - `/ignore_remove channel`: Removes a channel from the ignore list. Ephemeral response.
  - Implement `on_ready` with `await bot.tree.sync()` to register global slash commands.
- [ ] **Task 5: Stealth Message Listener (`on_message`)**
  - Guard clauses: ignore bots, webhooks, DMs, unconfigured guilds, ignored channels, log channel, and administrators.
  - Multimodal extraction: extract text content and image attachments (convert to base64 for images <= 4MB).
  - Call `check_message_safety(text, image_b64=..., use_cache=True)` asynchronously using `asyncio.to_thread`.
  - If unsafe:
    - Silently delete offending message (`await message.delete()`).
    - Format and dispatch rich embed to the configured `log_channel`.
    - Persist event in `cbm_automod_audit_logs`.

### Checkpoint: Core Engine
- [ ] Run headless test suite validating event processing, stealth message deletion, and log channel dispatch without in-channel leakage.

---

### Phase 4: Verification & Daemon Superposition
- [ ] **Task 6: Unit & Integration Test Suite (`cbm_wispbyte/test_discord_automod.py`)**
  - Mock Discord Gateway events and verify L1, L2, L3 moderation routing.
  - Verify ignore channels bypass filtration.
  - Verify admin users bypass filtration.
  - Verify deleted messages do not trigger in-channel text responses.
  - Verify modlog embed formatting and field truncations.
- [ ] **Task 7: Daemon Runner & Process Supervision**
  - Add start script / launcher entrypoint in `cbm_wispbyte/run_automod.py`.
  - Add documentation and invite link to `cbm_wispbyte/README.md`.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Discord API Rate Limits on rapid message deletion | Medium | Wrap `message.delete()` with exception handling (`discord.NotFound`, `discord.Forbidden`, `discord.HTTPException`). |
| Missing Gateway Message Content Intent | High | Explicitly document and verify `Message Content Intent` enabled in Developer Portal. |
| NVIDIA NIM Latency Spikes | Medium | Pipeline uses Layer 1 heuristic (<1ms) and Layer 2 LRU cache (<1ms). Layer 3 has bounded timeout (1.5s) with circuit-breaker failover. |
| Bot Permission Revocation | Medium | `/setup` pre-checks bot permissions in the target log channel and alerts admin ephemerally. |

---

## Invite & Application Summary
- **Application ID**: `1556061160288034898`
- **Permissions Integer**: `124928`
- **Guild Install Invite URL**:
  `https://discord.com/oauth2/authorize?client_id=1556061160288034898&permissions=124928&integration_type=0&scope=bot+applications.commands`
- **User Install Invite URL**:
  `https://discord.com/oauth2/authorize?client_id=1556061160288034898&integration_type=1&scope=applications.commands`
