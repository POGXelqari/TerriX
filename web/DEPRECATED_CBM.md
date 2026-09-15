# CBM Vercel Deployment Notice (Deprecated)

> **Status: DECOMMISSIONED / ARCHIVED**

The Clan Bank Manager (CBM) system is no longer hosted on Vercel serverless functions.

### Authoritative Master Runtime
All CBM banking services, background daemons, API routes, and web pages are now exclusively maintained and executed in:
- **Directory**: `g:\TerriX\cbm_wispbyte\`
- **Production Server**: Wispbyte Linux VPS `78.154.103.45:10093` (`cbm.wispbyte.org`)
- **Key Services**:
  - `main.py`: Authoritative HTTP server & API endpoints.
  - `db_layer.py`: Hybrid SQLite + Supabase persistence.
  - `deposit_daemon.py`: Continuous in-game vault poller & 15-minute donation slip matcher.
  - `loan_engine.py`: Continuous loan amortization and liquidation engine.
  - `withdrawal_worker.py`: Automated closed-loop withdrawal settlement engine.

Do not deploy or modify `web/api/cbm.py` for CBM banking features. All development must occur directly in `cbm_wispbyte/`.
