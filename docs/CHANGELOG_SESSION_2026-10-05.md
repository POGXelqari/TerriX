# TerriX & CBM Wispbyte — Engineering Session Changelog
**Date:** 2026-10-05  
**Commits:** `fc4b34b` → `1e2009c` on `main`  
**Scope:** Client Engine (`src/`), Authoritative Backend (`cbm_wispbyte/`), Scenario Studio, Security & Telemetry

---

## Executive Overview

This engineering session accomplished a comprehensive overhaul across the TerriX client modding ecosystem and the Clan Bank Manager (CBM) backend infrastructure. Key achievements include:

1. **Clan & Flag Pattern Cosmetics Architecture**: Single-image unified territory rendering, integration of the `[KILR]` Clan Territory Pattern, requirement-agnostic client verification attestation, and startup unequip race condition remediation.
2. **CBM Checkout & Free Requirement Products**: Modern, standard human verification gateways (reading sponsored articles, exploring promoted software, video completion) for free product acquisition with zero forced jargon.
3. **Platform Security & Domain Origin Policy**: First-party origin authorization for Cloudflare Quick Quarantine Tunnels (`*.trycloudflare.com`), dynamic ingress detection, and Cross-Origin Resource Sharing (CORS) enforcement with automated testing.
4. **TerriX Scenario Studio**: Standalone high-fidelity cartography editor, IndexedDB persistence to eliminate browser quota errors, grayscale mountain depth encoding, and direct custom scenario launching.
5. **CBM Telemetry, Health Probers & 25-Hour Discord Quarantine**: Outbound proxy routing, isolated Discord rate-limit quarantine state machine, synthetic probers, and authentic 90-day SLA status bars.
6. **Stealth Discord Content Safety Bot**: Integration of Nemotron-3.5 NIM classification for real-time Discord moderation and automod worker daemon.
7. **TerriX Chat & Spawn Optimizer**: In-game disposable match chatrooms with world-space LERP tracking and screen-space speech bubbles; 60 FPS spawn optimizer with dynamic archetype detection avoiding mainland/island traps.
8. **Upstream Sync & Architecture Governance**: Decommission of legacy `client_src/` and `web/` directories, AST-based game patcher, and automated smoke-test verification gates.

---

## Phase 1 — Clan Patterns & Cosmetics System

### 1a. Single-Image Territory Rendering
- **Files:** [`src/terrixCosmetics.js`](file:///g:/TerriX/src/terrixCosmetics.js)
- **Problem:** Territory patterns (Poland flag, Hello Kitty, clan logos) originally rendered as repeated small grid tiles across territory pixels, disrupting the visual coherence of flags and heraldic emblems.
- **Solution:** Re-architected cosmetic drawing to compute the player's aggregate territory bounding box `(minX, minY, maxX, maxY)` and render a single, continuous image mapped smoothly across the territory surface using canvas destination-in compositing.

### 1b. [KILR] Clan Territory Pattern & Free Product Checkout
- **Files:** [`cbm_wispbyte/db_layer.py`](file:///g:/TerriX/cbm_wispbyte/db_layer.py), [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py), [`cbm_wispbyte/cbm.html`](file:///g:/TerriX/cbm_wispbyte/cbm.html), [`src/terrixCosmetics.js`](file:///g:/TerriX/src/terrixCosmetics.js)
- **Features Delivered:**
  - Seeded product `prod_kilr` in CBM catalog with clan requirement:
    - In-game clan tag `[KILR]` verification.
    - Free requirement verification tasks (sponsored article reading, app exploration, video completion).
    - Creator privilege checkout bypass for pattern authors.
  - Endpoints:
    - `POST /api/cbm/checkout/attestation/issue`: Issues signed attestation token upon verification task completion.
    - `POST /api/cbm/checkout/free`: Claims free product with valid verification or creator privileges.
    - `POST /api/cbm/checkout/order-status`: Returns verification token and fulfillment status.
- **Automated Tests:** [`cbm_wispbyte/test_requirement_attestation.py`](file:///g:/TerriX/cbm_wispbyte/test_requirement_attestation.py) (8/8 passed), [`cbm_wispbyte/test_creator_free_equip.py`](file:///g:/TerriX/cbm_wispbyte/test_creator_free_equip.py) (7/7 passed).

### 1c. KILR Pattern Initialization Race Condition Fix
- **Files:** [`src/main.js`](file:///g:/TerriX/src/main.js), [`src/terrixCosmetics.js`](file:///g:/TerriX/src/terrixCosmetics.js)
- **Root Cause:**
  1. On startup (in lobby/menu), `window.getVar("rawPlayerNames")` was unpopulated/undefined, causing player name extraction to fall back to raw hash IDs.
  2. `updateKilrUI()` contained an overly strict check that deleted `state.ownedPatterns['kilr']` and reset `state.equippedPattern = null` if clan tag was absent, wiping out valid saved receipts across restarts.
  3. `window.getVar` was not exposed globally in `src/main.js`.
- **Fix:**
  - Exposed `window.getVar = getVar; window.__fx.getVar = getVar;` in [`src/main.js`](file:///g:/TerriX/src/main.js).
  - Enhanced `getCurrentPlayerName()` to check receipt data, local storage fallback, and engine interface.
  - Updated `updateKilrUI()` to recognize `hasReceipt` as proof of entitlement (`isClanMember = hasClanTag || hasReceipt`), preventing false-positive startup unequip actions.
  - Implemented multi-tier image fallback ladder for pattern textures (relative path → asset folder → CDN → upstream repository).

---

## Phase 2 — Security & Domain Origin Policy

- **Files:** [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py), [`cbm_wispbyte/test_cors_bypass.py`](file:///g:/TerriX/cbm_wispbyte/test_cors_bypass.py)
- **Problem:** CBM's strict Domain Origin Policy blocked legitimate requests from Cloudflare Quick Quarantine Tunnels (`*.trycloudflare.com`) and dynamic ingress failovers with `403 Forbidden` on internal API endpoints.
- **Solution:**
  - Extended `is_authorized_first_party_origin()` to dynamically validate:
    - Subdomains of `trycloudflare.com`.
    - Active ingress URLs recorded in `active_ingress_url.txt`.
    - Environment overrides (`WISPBYTE_SUBDOMAIN`, `ACTIVE_INGRESS_URL`, `CLOUDFLARE_TUNNEL_URL`).
  - Permitted state-changing `Sec-Fetch-Site: cross-site` requests when the `Referer` matches an authorized first-party origin.
- **Automated Tests:** [`cbm_wispbyte/test_cors_bypass.py`](file:///g:/TerriX/cbm_wispbyte/test_cors_bypass.py) (10/10 passed).

---

## Phase 3 — TerriX Scenario Studio & Map Cartography Editor

- **Files:** [`cbm_wispbyte/studio.html`](file:///g:/TerriX/cbm_wispbyte/studio.html), [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py)
- **Features Delivered:**
  - High-performance standalone canvas editor for custom map cartography and game scenarios.
  - **Storage Architecture Fix:** Migrated scenario launching from `localStorage` / URL hash to **IndexedDB**, completely resolving browser `QuotaExceededError` on large scenarios and dense mountain masks.
  - **Cartography Tools:** Grayscale mountain depth encoding, custom spawn zones, territory painters, dual-dock toolbars, and instant game test launch.

---

## Phase 4 — CBM Status, Discord 25-Hour Quarantine & Automod Bot

### 4a. Discord 25-Hour Rate-Limit Quarantine & Outbound Proxy
- **Files:** [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py), [`cbm_wispbyte/status.html`](file:///g:/TerriX/cbm_wispbyte/status.html), [`cbm_wispbyte/test_status_and_quarantine.py`](file:///g:/TerriX/cbm_wispbyte/test_status_and_quarantine.py)
- **Architecture:**
  - Implemented 25-hour automated quarantine state machine triggered upon receiving Cloudflare HTTP 1015 IP rate limits from Discord webhooks.
  - Decoupled Discord outage state from core banking and chat availability: core platform remains "Operational" while Discord Integration reports "Quarantined".
  - Outbound requests routed through configurable HTTP/HTTPS proxy pool with exponential backoff.
  - Synthetic health prober evaluating real response latencies; SLA bars render true metrics without placeholder data.

### 4b. Discord Content Safety Bot (Nemotron-3.5 NIM)
- **Files:** [`cbm_wispbyte/run_automod.py`](file:///g:/TerriX/cbm_wispbyte/run_automod.py), [`cbm_wispbyte/nemotron_client.py`](file:///g:/TerriX/cbm_wispbyte/nemotron_client.py), [`cbm_wispbyte/test_discord_automod.py`](file:///g:/TerriX/cbm_wispbyte/test_discord_automod.py), [`cbm_wispbyte/start.sh`](file:///g:/TerriX/cbm_wispbyte/start.sh)
- **Features Delivered:**
  - Background moderation bot scanning messages in real time against Nemotron-3.5 NIM safety classification model.
  - Automated redaction, logging, and policy enforcement integrated into server boot script.

---

## Phase 5 — Match Chat & 60 FPS Spawn Optimizer

### 5a. Disposable Match Chatrooms
- **Files:** [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py), [`src/terrixChat.js`](file:///g:/TerriX/src/terrixChat.js)
- **Features Delivered:**
  - Ephemeral chatroom API dynamically keyed to active game match IDs.
  - Dual authentication: verified CBM session token or TerriX Official Client API Key.
  - World-space LERP tracking: chat speech bubbles float smoothly above player capitals in screen-space regardless of map zoom and pan.
  - Frontline ghost troops elimination: cleaned up orphan troop indicators on map boundaries.

### 5b. 60 FPS Spawn Optimizer
- **Files:** [`src/spawnOptimizer.js`](file:///g:/TerriX/src/spawnOptimizer.js), [`src/main.js`](file:///g:/TerriX/src/main.js)
- **Features Delivered:**
  - Real-time spawn evaluator rendering HUD reticles and quality scores during the 10-second pre-match countdown.
  - Dynamic archetype detection: recognizes landmass topology (Pangaea, Europe, World, Islands) and applies cross-ocean expansion penalties to avoid island traps (e.g. Australia isolation in World map).
  - Auto-picker integration: automatically selects optimal spawn position if timer elapses without manual click.

---

## Phase 6 — Upstream Sync & Client Architecture Governance

- **Files:** [`patcher.js`](file:///g:/TerriX/patcher.js), [`build.js`](file:///g:/TerriX/build.js), [`tests/smoke-test.js`](file:///g:/TerriX/tests/smoke-test.js), [`.agents/rules/upstream-sync.md`](file:///g:/TerriX/.agents/rules/upstream-sync.md)
- **Rules & Governance Adherence:**
  - **Directory Decommissioning:** Decommissioned legacy `client_src/` and `web/` directories; consolidated all source modules into `src/` compiling strictly to `build/fx.bundle.js` and synced to `client/fx.bundle.js`.
  - **Robust Engine Interfacing:** Prohibited direct usage of obfuscated game symbols in client code; wrapped all engine reads/writes via `getVar(name)` from [`src/gameInterface.js`](file:///g:/TerriX/src/gameInterface.js).
  - **AST Game Patcher:** Replaced fragile string and regex modifications with AST-aware code transformation.
  - **Verification Gate:** Pre-commit requirement executing `npm run build && node tests/smoke-test.js` to guarantee zero syntax or bundling regressions.

---

## Verification Test Matrix

All test suites pass 100% across client and server runtimes:

| Test Suite | Purpose | Tests | Status |
|---|---|:---:|:---:|
| [`cbm_wispbyte/test_cors_bypass.py`](file:///g:/TerriX/cbm_wispbyte/test_cors_bypass.py) | CORS, Domain Origin Policy, Tunnel Ingress | 10 | **PASS** |
| [`cbm_wispbyte/test_requirement_attestation.py`](file:///g:/TerriX/cbm_wispbyte/test_requirement_attestation.py) | Task Attestation & Free Product Checkout | 8 | **PASS** |
| [`cbm_wispbyte/test_creator_free_equip.py`](file:///g:/TerriX/cbm_wispbyte/test_creator_free_equip.py) | Creator Free Equip Privileges | 7 | **PASS** |
| [`cbm_wispbyte/test_terrix_official_api_key.py`](file:///g:/TerriX/cbm_wispbyte/test_terrix_official_api_key.py) | Official Client API Key Authentication | 8 | **PASS** |
| [`cbm_wispbyte/test_status_and_quarantine.py`](file:///g:/TerriX/cbm_wispbyte/test_status_and_quarantine.py) | Discord 25h Quarantine & Health Probers | 4 | **PASS** |
| [`cbm_wispbyte/test_discord_automod.py`](file:///g:/TerriX/cbm_wispbyte/test_discord_automod.py) | Nemotron-3.5 NIM Moderation Bot | 7 | **PASS** |
| [`tests/smoke-test.js`](file:///g:/TerriX/tests/smoke-test.js) | Client Bundle AST & Syntax Verification | 1 | **PASS** |
| **Total** | | **45** | **100% PASS** |

---

## Commit History

| Commit | Description |
|---|---|
| `1e2009c` | fix(security): permit quick quarantine tunnels and dynamic ingress in domain origin policy |
| `0d72428` | fix(studio): replace localStorage with IndexedDB for scenario launch to eliminate QuotaExceededError |
| `0b9a8fa` | fix(studio): resolve mountain grayscale encoding, store event inversion, dual tool dock states, and hash quota overflow |
| `78b08fe` | feat(studio): add TerriX Scenario Studio standalone suite and map cartography editor |
| `23741ab` | feat(status): separate quarantine quick tunnel from primary ingress and enforce zero telemetry outside quarantine |
| `767be53` | feat(status): active synthetic health prober and zero-mock grey SLA bars |
| `d58d63e` | feat(cbm): automate ingress watchdog failover and quarantine-only mitigation lifecycle |
| `8b1dd39` | fix(cbm): decouple discord rate-limit from core platform status and add quick tunnel fallback options |
| `058713b` | feat(cbm): implement Discord 25h quarantine state, outbound proxy routing, and 90-day status telemetry |
| `478ff83` | feat(sync): implement AST game patcher, headless verification gate, and hardened upstream CI/CD |
| `483b4a3` | fix(cosmetics): resolve kilr pattern startup unequip and robust asset initialization |
| `5940ae3` | feat(cosmetics,checkout): single-image flag rendering for clan patterns and CBM checkout free requirement claim |
| `f8160de` | feat(cbm,cosmetics): add [KILR] clan pattern and requirement-agnostic client verification attestation |
| `d3e9c95` | feat(cbm,automod): integrate discord bot into server startup start.sh |
| `002e20d` | feat(cbm,automod): implement stealth discord content safety bot integrated with nemotron-3.5 nim |
| `ffb782e` | feat(cbm,cosmetics): enable free pattern product equipping for creators |
| `1f46d52` | fix(client): resolve spawn optimizer re-init, map chatroom sync, and multiplayer chat gate |
| `e6dc842` | fix(optimizer): eliminate Australia island trap with dynamic archetype detection and cross-ocean normalization |
| `9dec7b8` | feat(client): overhaul chat match sync, eliminate frontline ghost troops, and balance spawn optimizer |
| `533e2b8` | fix(optimizer): resolve auto-picker countdown ticks, territory detection, and event dispatch |
| `a055227` | feat(optimizer): add spawn optimizer and auto spawn picker with 60 FPS reticle |
| `9aa680e` | feat(auth): use TerriX Official Client API key for outgoing client requests and server validation |
| `51d7390` | feat(cbm): integrate nemotron-3.5-content-safety, 3D UI, and enterprise platform enhancements |
| `a0ee485` | feat(chat): world-space LERP tracking, screen-space rendering, and multi-bubble stacking for TerriX Chat |
| `d61bd8a` | fix(chat): UI initialization and DOM self-healing for TerriX Chat |
| `59554ab` | feat(chat): temporary disposable chatroom API with dual auth and TerriX in-match speech bubbles |
| `ffb76c2` | fix(cbm): auto-heal malformed sqlite disk image and guard json parsing against html proxy pages |
| `78d175b` | fix(cbm): prevent database is locked errors with write lock, exponential backoff, and read decoupling |
| `cb6f6ea` | perf(cbm): scale wispbyte free hosting with edge caching, thread recycling, and async cloud sync |
| `0c6ea98` | fix(cosmetics): render flag patterns as single unified flag across territory |
| `de20334` | feat(referrals,cosmetics): sustainable 3-tier referral engine and Poland pattern CBM donor perks |
| `fc4b34b` | feat(client): deprecate client_src, consolidate Poland pattern into src/terrixCosmetics, and unify build pipeline |

---

## File Map

| File | Primary Role & Modifications |
|---|---|
| [`src/main.js`](file:///g:/TerriX/src/main.js) | Client entrypoint; exposed `window.getVar` and `__fx.getVar`; registered spawn optimizer and cosmetics hooks. |
| [`src/terrixCosmetics.js`](file:///g:/TerriX/src/terrixCosmetics.js) | Cosmetic patterns engine; single-image territory flag rendering; KILR clan pattern UI and receipt validation. |
| [`src/terrixChat.js`](file:///g:/TerriX/src/terrixChat.js) | In-match ephemeral chat bubbles; LERP screen-space camera tracking; ghost troop elimination. |
| [`src/spawnOptimizer.js`](file:///g:/TerriX/src/spawnOptimizer.js) | 60 FPS pre-match spawn evaluator; island trap penalty; automated position picker. |
| [`src/gameInterface.js`](file:///g:/TerriX/src/gameInterface.js) | Obfuscation-safe variable getter/setter contracts for core Territorial engine. |
| [`cbm_wispbyte/main.py`](file:///g:/TerriX/cbm_wispbyte/main.py) | Authoritative HTTP server; Domain Origin Policy; tunnel ingress handling; attestation & checkout APIs. |
| [`cbm_wispbyte/db_layer.py`](file:///g:/TerriX/cbm_wispbyte/db_layer.py) | SQLite WAL database layer; attestation tokens; creator product privileges; thread-safe locking. |
| [`cbm_wispbyte/studio.html`](file:///g:/TerriX/cbm_wispbyte/studio.html) | Standalone cartography editor suite; IndexedDB scenario launcher. |
| [`cbm_wispbyte/cbm.html`](file:///g:/TerriX/cbm_wispbyte/cbm.html) | Clan Bank Manager web portal; product catalog; requirement verification modal. |
| [`cbm_wispbyte/status.html`](file:///g:/TerriX/cbm_wispbyte/status.html) | System status page; authentic SLA probers; isolated Discord quarantine banner. |
| [`cbm_wispbyte/run_automod.py`](file:///g:/TerriX/cbm_wispbyte/run_automod.py) | Discord content moderation bot running against Nemotron-3.5 NIM. |
| [`cbm_wispbyte/nemotron_client.py`](file:///g:/TerriX/cbm_wispbyte/nemotron_client.py) | Client connector for Nemotron safety classification inference. |
| [`patcher.js`](file:///g:/TerriX/patcher.js) | AST-based JavaScript patcher injecting client extensions safely into upstream game code. |
| [`build.js`](file:///g:/TerriX/build.js) | Bundler assembling `src/` modules into `build/fx.bundle.js` and syncing to `client/fx.bundle.js`. |
| [`tests/smoke-test.js`](file:///g:/TerriX/tests/smoke-test.js) | Headless validation gate verifying syntax and bundle integrity before merge. |
