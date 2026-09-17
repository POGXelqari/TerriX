# TerriX & Clan Bank Manager (CBM) — Global Project Context

> **CRITICAL DIRECTIVE FOR ALL AGENTS**:
> Always inspect and consult this file before researching, proposing changes, or writing any code.
> Any work relating to Clan Bank Manager (CBM) must strictly follow the directory and runtime authority guidelines defined below.

---

## 1. Authoritative Runtime vs. Deprecated Directories

### ✅ AUTHORITATIVE: `cbm_wispbyte/` (Single Source of Truth)
All active Clan Bank Manager (CBM) development, APIs, background daemons, and web interfaces reside **exclusively** in:
`g:\TerriX\cbm_wispbyte\`

- **Primary Server & Routing**: `cbm_wispbyte/main.py`
  - Bounded ThreadPool HTTP/1.1 Server (`CBMThreadPoolServer`)
  - In-memory pre-gzipped static asset caching & 304 ETag caching
  - Dynamic JSON caching for status, donors, account statements, and vault analytics
- **Database Engine**: `cbm_wispbyte/db_layer.py`
  - Thread-local SQLite connection pooling (`cbm_data.db`) with WAL mode, 64MB mmap, and 16MB cache
  - Supabase PostgreSQL remote persistence & fallback
- **Deposit & Telemetry Daemon**: `cbm_wispbyte/deposit_daemon.py`
  - Automated continuous ledger polling and periodic vault snapshot recording
- **Lending Facility Engine**: `cbm_wispbyte/loan_engine.py`
  - Unencumbered reserve buffer enforcement, interest accrual, and debt reconciliation
- **Withdrawal Settlement Worker**: `cbm_wispbyte/withdrawal_worker.py`
  - In-game automated gold transfer and settlement
- **Web Pages & Frontends**:
  - `cbm.html`: Main PayPal Dark Mode Clan Banking Portal & HUD
  - `vault.html`: Dedicated 7-day Vault Graphs & Telemetry Dashboard (Chart.js)
  - `donations.html`: Clan War Chest & Irrevocable Reserve Donation Gateway
  - `rulebook.html`: Official Banking Covenant & Rules Documentation
  - `login.html` & `register.html`: Member Authentication & PIN registration

### ❌ DEPRECATED & ARCHIVED: `web/` (Vercel Deployment)
- **Status**: **DECOMMISSIONED / OBSOLETE** (See `web/DEPRECATED_CBM.md`).
- The Vercel serverless setup (`web/api/cbm.py`, `web/pages/`, etc.) is legacy code from an earlier iteration.
- **MANDATORY RULE**:
  - **NEVER** edit, create, or mirror CBM web pages, endpoints, or assets to `web/` or `web/pages/`.
  - **NEVER** propose Vercel deployment commands for CBM.
  - All new pages, styling changes, and API fixes belong directly in `cbm_wispbyte/`.

---

## 2. Production Environment & Hosting

- **Hosting Platform**: Wispbyte Linux VPS (`78.154.103.45:10093`)
- **Public Domain**: `cbm.wispbyte.org` / Cloudflare Tunnel
- **Target In-Game Vault Account**: Configured via `VAULT_ACCOUNT` (e.g., `DdcBC`)
- **Concurrency & Scaling Architecture**:
  - `MAX_SERVER_WORKERS`: Default 60 threads (bounded thread pool to eliminate thread explosion)
  - `request_queue_size`: 256 connection backlog
  - `protocol_version`: `HTTP/1.1` (TCP Keep-Alive connection reuse)
  - Pre-serialized Gzip Buffers: In-memory byte caches for `/api/cbm/status`, `/api/cbm/donors`, and `/api/cbm/analytics/vault-history`
  - Idle CPU Throttling: Client-side `document.visibilitychange` event listeners halt polling when browser tabs are hidden/inactive

---

## 3. Database & Schema Parity

Whenever modifying tables or schemas, ensure 100% parity between:
1. `cbm_wispbyte/setup_supabase.sql` (Authoritative Supabase setup)
2. `scripts/setup_cbm_supabase.sql` (Root migration script)
3. SQLite table initialization in `cbm_wispbyte/db_layer.py` (`_init_sqlite()`)

Key Tables:
- `cbm_accounts`: Member registration, PIN hashes, territorial credential mappings
- `cbm_ledger`: Deposit, withdrawal, and transfer records
- `cbm_loans`: Active borrowing facilities and amortization schedules
- `cbm_donations`: Irrevocable Clan War Chest capital donations
- `cbm_vault_snapshots`: Historical telemetry checkpoints for 7-day analytics

---

## 4. UI Design & Communication Guidelines

- **Realistic Design**: Emulate standard financial telemetry and modern fintech portals (PayPal dark palette: `#080d16`, `#0e1626`, `#131d31`, `#ffd700`, `#10b981`, `#0070e0`).
- **No Forced Roleplay Jargon**: Do not inject tactical, sci-fi, or military jargon into consumer banking features, documentation, or user communications.