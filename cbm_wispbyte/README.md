# Clan Bank Manager (CBM) - Wispbyte Deployment Guide

This directory contains the self-contained, continuous Python backend runtime for the **Clan Bank Manager (CBM)** designed for deployment on [Wispbyte](https://wispbyte.com) or any standard containerized Python runtime.

---

## 1. Wispbyte Server Details & Deployment

* **Direct Server URL:** `http://78.154.103.45:10093/`
* **Assigned Allocation Port:** `10093`
* **Custom Subdomain:** `http://cbm.wispbyte.org/`

### Setup Instructions:
1. **Configure Environment Variables:**
   * In your Wispbyte control panel (or `.env` file), set:
     ```bash
     PORT=10093
     SERVER_PORT=10093
     WISPBYTE_SERVER_URL=http://78.154.103.45:10093/
     WISPBYTE_SUBDOMAIN=cbm.wispbyte.org
     CBM_VAULT_ACCOUNT=DdcBC
     CBM_VAULT_PASSWORD=your_territorial_vault_password
     SUPABASE_URL=https://your-supabase-project.supabase.co
     SUPABASE_KEY=your_supabase_service_role_key

     # Cloudflare Tunnel Configuration
     ENABLE_CLOUDFLARE_TUNNEL=true
     CLOUDFLARE_TUNNEL_TOKEN=your_token_here
     ```
2. **Startup Command:**
   ```bash
   bash start.sh
   # or: python main.py
   ```
3. **Automated Endpoints:**
   * **Direct Ingress:** Requests to `http://78.154.103.45:10093/` and `http://cbm.wispbyte.org/` serve the CBM Web Portal directly, with zero cold starts.
   * **Automated Cloudflare Build Step:** `start.sh` automatically fetches `cloudflared` into `bin/` and binds port `10093` to your Zero Trust Tunnel.

---

## 2. Core Modules

| File | Purpose |
| :--- | :--- |
| `main.py` | Master daemon starting the HTTP server and ingestion thread. |
| `deposit_daemon.py` | Scrapes `https://territorial.io/log/transactions` every 15s to credit deposits with 0 API fees. |
| `loan_engine.py` | Enforces the 0.05% reserve ceiling and 1,000 Gold activation threshold rule. |
| `withdrawal_worker.py` | Processes authenticated member withdrawal requests via `/api/gold/send`. |
| `db_layer.py` | Dual-engine persistence: Supabase PostgreSQL with local SQLite automatic fallback. |
| `setup_supabase.sql` | Production SQL migration to execute in your Supabase SQL Editor. |

---

## 3. Lending Rules Summary

* **Reserve-Backed Lending:** Loans cannot exceed **0.05%** of unencumbered bank reserves.
* **Activation Floor:** If $0.05\%$ of reserves $\le 1,000\text{ Gold}$, the lending facility is **strictly locked**.
* **Minimum Activation Reserves:** The bank must accumulate at least **$2,000,000\text{ Gold}$** in unencumbered reserves before any loan can be originated.

---

## 4. CBM AutoMod Discord Bot (Nemotron-3.5-Content-Safety NIM)

The official **CBM | AutoMod** (registered as `CBM | Content Safety`) is an automated, stealth Discord content safety moderation bot integrated with NVIDIA's 4B multimodal `nvidia/nemotron-3.5-content-safety` NIM model.

### Key Capabilities:
- **Stealth Purging:** Violating messages are silently deleted (`await message.delete()`) with zero in-channel feedback or pings to offenders.
- **Moderator Audit Logging:** High-fidelity incident cards with violating categories, author tag, ID, creation date, snippet, and latency metrics are dispatched exclusively to the configured `#mod-logs` channel.
- **Tiered Moderation Pipeline:**
  1. Layer 1: Homoglyph & regex normalizer (<1ms)
  2. Layer 2: SHA-256 in-memory LRU cache (<1ms)
  3. Layer 3: NVIDIA Nemotron-3.5 NIM multimodal model (200-500ms) with circuit breaker fallback.
- **Multimodal Support:** Analyzes text and image attachments (PNG, JPEG, WebP up to 4MB).

### Setup & Usage:
1. **Invite Bot to Server:**
   [Install CBM AutoMod to Server (Guild Install)](https://discord.com/oauth2/authorize?client_id=1556061160288034898&permissions=124928&integration_type=0&scope=bot+applications.commands)
2. **Configure in Discord:**
   `/setup log_channel:#automod-logs ignore_channel:#general`
3. **Automated Server Startup (`start.sh`):**
   The bot automatically starts in the background as a supervised daemon when `start.sh` runs:
   ```bash
   bash start.sh
   ```
   PID tracking is maintained in `automod.pid`, and the daemon is cleanly terminated when the master server shuts down.
4. **Manual Daemon Execution:**
   ```bash
   py -3.12 cbm_wispbyte/run_automod.py
   # or test configuration:
   py -3.12 cbm_wispbyte/run_automod.py --check
   ```

