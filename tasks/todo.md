# Implementation Tasks: CBM | AutoMod Discord Content Safety Bot

## Phase 1: Environment & Profile Provisioning
- [x] **Task 1: Discord Credentials Configuration**
  - **Acceptance Criteria**:
    - `cbm_wispbyte/.env` contains `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, and `DISCORD_PUBLIC_KEY`.
    - Values match the application credentials provided by the user.
  - **Verification**: `python -c "import os, dotenv; dotenv.load_dotenv('cbm_wispbyte/.env'); assert os.environ.get('DISCORD_APPLICATION_ID') == '1556061160288034898'"`
  - **Files**: `cbm_wispbyte/.env`, `.env`

- [x] **Task 2: Bot Profile & Icon Synchronization Script**
  - **Acceptance Criteria**:
    - `cbm_wispbyte/sync_discord_profile.py` reads `cbm_wispbyte/developer-platform-icon.png`.
    - Updates bot user avatar and name to `CBM | AutoMod` via Discord REST API.
    - Updates application description and icon.
  - **Verification**: `py -3.12 cbm_wispbyte/sync_discord_profile.py`
  - **Files**: `cbm_wispbyte/sync_discord_profile.py`

## Phase 2: Database Storage Engine
- [x] **Task 3: Guild Configuration Store (`automod_db.py`)**
  - **Acceptance Criteria**:
    - `cbm_automod_guilds` and `cbm_automod_audit_logs` tables created in SQLite.
    - Thread-safe caching for fast in-memory guild config lookups.
    - Methods: `get_guild_config`, `set_guild_config`, `remove_ignored_channel`, `record_audit_log`.
  - **Verification**: Run `python -m unittest cbm_wispbyte/test_discord_automod.py` (DB test cases).
  - **Files**: `cbm_wispbyte/automod_db.py`

## Phase 3: Core Bot & Stealth Moderation Engine
- [x] **Task 4: Core Bot Implementation & Slash Commands (`bot.py`)**
  - **Acceptance Criteria**:
    - Bot initializes with `intents.message_content = True`, `intents.guilds = True`, `intents.messages = True`.
    - Slash command `/setup` saves `log_channel` and optional `ignore_channel` with permission checks and ephemeral response.
    - Slash command `/ignore_remove` removes a channel from the ignore list with ephemeral response.
    - Commands sync globally on startup.
  - **Verification**: Code review and static import check.
  - **Files**: `cbm_wispbyte/bot.py`

- [x] **Task 5: Stealth Message Listener (`on_message`)**
  - **Acceptance Criteria**:
    - Ignores bots, webhooks, DMs, unconfigured guilds, ignored channels, log channel, and administrators.
    - Passes text and attachments (images up to 4MB) to `check_message_safety`.
    - Deletes unsafe messages quietly with zero in-channel output.
    - Dispatches rich embed log to the configured `log_channel`.
  - **Verification**: Integration test suite.
  - **Files**: `cbm_wispbyte/bot.py`

## Phase 4: Verification & Launcher
- [x] **Task 6: Unit and Integration Test Suite**
  - **Acceptance Criteria**:
    - Full test suite covering DB persistence, mock message evaluation, ignore channel handling, and stealth log formatting.
    - 100% test pass rate.
  - **Verification**: `py -3.12 -m unittest cbm_wispbyte/test_discord_automod.py`
  - **Files**: `cbm_wispbyte/test_discord_automod.py`

- [x] **Task 7: Daemon Runner & Documentation**
  - **Acceptance Criteria**:
    - Standalone runner script with auto-reconnect and graceful shutdown.
    - Invite link and deployment steps documented in `cbm_wispbyte/README.md`.
  - **Verification**: Run launcher with `--help` or `--check-config`.
  - **Files**: `cbm_wispbyte/run_automod.py`, `cbm_wispbyte/README.md`

## Phase 5: Server Startup Integration (`start.sh`)
- [x] **Task 8: Server Startup Script Integration (`start.sh`)**
  - **Acceptance Criteria**:
    - `cbm_wispbyte/requirements.txt` includes `discord.py>=2.3.0`.
    - `cbm_wispbyte/start.sh` validates `discord` in fast-path dependency check.
    - `cbm_wispbyte/start.sh` launches `run_automod.py` in background when `DISCORD_BOT_TOKEN` is present, tracking PID.
    - `cbm_wispbyte/run_automod.py` implements a robust subprocess supervisor loop for seamless auto-recovery.
    - `cbm_wispbyte/main.py` signal handler cleans up background automod process if tracked.
  - **Verification**: Bash syntax validation, Python environment validation, and automated test suite.
  - **Files**: `cbm_wispbyte/start.sh`, `cbm_wispbyte/requirements.txt`, `cbm_wispbyte/run_automod.py`, `cbm_wispbyte/main.py`


