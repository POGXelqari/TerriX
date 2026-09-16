# TerriX Workspace Agent Guidelines

> **PRIMARY DIRECTIVE**: Always check [`PROJECT_CONTEXT.md`](file:///g:/TerriX/PROJECT_CONTEXT.md) and [`.agents/rules/context-and-deprecation.md`](file:///g:/TerriX/.agents/rules/context-and-deprecation.md) before performing any work.

### Core Rules
1. **Authoritative Master Runtime**:
   - All Clan Bank Manager (CBM) components (APIs, daemons, HTML portals, stylesheets, database logic) belong exclusively in `cbm_wispbyte/`.
2. **Deprecated Directory (`web/`)**:
   - `web/` is deprecated and decommissioned.
   - Do NOT edit `web/` or mirror pages into `web/pages/`.
3. **High Concurrency & Low CPU Standards**:
   - Thread-local SQLite pooling with WAL mode.
   - In-memory pre-gzipped byte buffers for high-frequency endpoints.
   - Client-side `visibilitychange` listeners to freeze polling on hidden tabs.
4. **Design Philosophy**:
   - Clean, realistic financial telemetry (PayPal dark mode palette).
   - No forced sci-fi or military jargon.
