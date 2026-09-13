# Clan Bank Manager (CBM) - Wispbyte Deployment Guide

This directory contains the self-contained, continuous Python backend runtime for the **Clan Bank Manager (CBM)** designed for deployment on [Wispbyte](https://wispbyte.com) or any standard containerized Python runtime.

---

## 1. Quick Deployment on Wispbyte

1. **Upload / Link Directory:**
   * Create a new Python application in your Wispbyte panel.
   * Point the project directory or git repository to `cbm_wispbyte/`.
2. **Configure Environment Variables:**
   * In the Wispbyte environment settings, set:
     ```bash
     PORT=8080
     CBM_VAULT_ACCOUNT=DdcBC
     CBM_VAULT_PASSWORD=your_territorial_password
     SUPABASE_URL=https://your-supabase-project.supabase.co
     SUPABASE_KEY=your_supabase_service_role_key
     ```
3. **Startup Command:**
   ```bash
   python main.py
   ```
4. **Health Check:**
   * Wispbyte will automatically ping `http://localhost:8080/health` or `http://localhost:8080/status`.

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
