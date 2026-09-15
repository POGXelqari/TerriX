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
