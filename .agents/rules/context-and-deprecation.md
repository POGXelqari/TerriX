# Global Context & Deprecation Enforcement Rule

## 1. Always Check Global Context First
- Before researching, planning, modifying, or creating files in this repository, you **MUST** consult and adhere to:
  - [`PROJECT_CONTEXT.md`](file:///g:/TerriX/PROJECT_CONTEXT.md)
  - [`web/DEPRECATED_CBM.md`](file:///g:/TerriX/web/DEPRECATED_CBM.md)
- These files define the authoritative runtime, directory ownership, hosting architecture, and schema standards.

## 2. Absolute Deprecation of `web/` (Vercel)
- The `web/` directory (including `web/api/`, `web/pages/`, `web/static/`, and `vercel.json`) is **DEPRECATED, DECOMMISSIONED, AND OBSOLETE** for Clan Bank Manager (CBM).
- **Prohibited Actions**:
  - **DO NOT** edit `web/api/cbm.py`.
  - **DO NOT** create, modify, or mirror HTML pages to `web/` or `web/pages/`.
  - **DO NOT** run or recommend Vercel deployment commands for CBM.
  - If a user request mentions a web file or page, always map it to its active location in `cbm_wispbyte/`.

## 3. Authoritative Runtime: `cbm_wispbyte/`
- All CBM frontend pages (`cbm.html`, `vault.html`, `donations.html`, `rulebook.html`, `login.html`, `register.html`) must be created and modified **exclusively** in `cbm_wispbyte/`.
- All CBM backend code (`main.py`, `db_layer.py`, `deposit_daemon.py`, `loan_engine.py`, `withdrawal_worker.py`) must remain in `cbm_wispbyte/`.
- All database schemas must maintain exact parity between `cbm_wispbyte/setup_supabase.sql`, `scripts/setup_cbm_supabase.sql`, and `db_layer.py`.
