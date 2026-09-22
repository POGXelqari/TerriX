# TerriX & CBM Wispbyte — Session Changelog
**Date:** 2026-09-22  
**Commits:** `b1bb487` → `06035a2` on `main`  
**Files changed:** 16 across client and backend

---

## Overview

This session covered six areas of work spanning the TerriX game client and the
Clan Bank Manager (CBM) backend, plus a series of bug-fix passes driven by
detailed code analysis provided by the user.

---

## Phase 1 — Git Conflict Resolution & Auto-Update Guard

**Files:** `.github/workflows/auto-update-client.yml`, `client/version.json`, `client/game.mods.js`

### Problem
The GitHub Actions auto-update workflow pulls the latest `territorial.io` game
binary on a schedule. When local feature work was present on `main`, automated
commits caused merge conflicts in `version.json` and `game.mods.js`.

### Fix
- Resolved conflict markers in both files using `-X ours` strategy.
- Updated the workflow to run `git pull --rebase -X ours` before every push so
  all future auto-updates are absorbed without conflicts.

---

## Phase 2 — Poland Flag Territory Pattern (1,000 Gold)

**Files:** `client_src/mods/01_cosmetics_shop.js`, `client/game.mods.js`, `client/assets/patterns/poland-pattern.avif`

### What Was Built
A second purchasable territory pattern — the **Poland Flag** — added alongside
the existing Hello Kitty pattern in the Cosmetics Shop (press `K`).

| Area | Change |
|---|---|
| **State** | `state.ownedPatterns` and `state.equippedPattern` support multiple pattern keys |
| **Asset loading** | `initPatternAssets()` pre-loads both textures into `patternTextures` map |
| **Shop UI** | `updatePolandUI()` renders catalog card with Buy / Equip / Unequip buttons |
| **Rendering loop** | `activeTexture` dispatch uses `patternTextures[state.equippedPattern]` |
| **Persistence** | Receipt in `localStorage`; equip state in `terrix_addon_equipped_pattern` |
| **Rendering guard** | `canUse` check includes `state.ownedPatterns['poland']`; `if (!state.equippedPattern) return` added |
| **CBM product** | `prod_poland` seeded at 1,000 Gold in `db_layer.py` |
| **Build** | `client/game.mods.js` rebuilt and syntax-validated |

---

## Phase 3 — Withdrawal Cap: 50 → 1,000 Gold

**Files:** `cbm_wispbyte/withdrawal_worker.py`, `cbm_wispbyte/main.py`, `cbm_wispbyte/cbm.html`

Raised the per-disbursement withdrawal ceiling from **50 Gold** to **1,000 Gold**
enforced at both the worker and HTTP API layers. `<input max="1000">` updated in cbm.html.

---

## Phase 4 — Clan Tag Priority & Leader Status Fix

**File:** `cbm_wispbyte/gold_api_client.py`

### New Priority Order for `extract_profile_metadata()`
```
1. clan_a          (primary API clan field)
2. [Bracket] in username
3. clan_b          (secondary clan field)
4. clan_leader_clan (fallback)
5. "None"
```
Leader status now requires `clan_leader_clan` to match the resolved primary clan.
Officer threshold tightened to rank ≤ 100.

---

## Phase 5 — Referral Reward Program

### 5a — Backend Engine

**Files:** `cbm_wispbyte/db_layer.py`, `cbm_wispbyte/deposit_daemon.py`, `cbm_wispbyte/main.py`

**Schema** — new `cbm_referrals` table + `referred_by` column migration on `cbm_accounts`.

**Qualification thresholds:**
- Invitee deposits **> 2,000 Gold** (lifetime `total_deposited_cents`)
- Invitee donates **> 200 Gold** to War Chest
- Both parties receive **500 Gold** on settlement

**Trigger points** — `check_and_settle_referral()` called after every:
- In-game deposit (deposit daemon)
- `donate_from_balance()` call
- `record_direct_donation()` call

**New API endpoints in `main.py`:**

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/cbm/auth/register` | POST | Accepts `referral_code`; calls `register_referral()` |
| `/api/cbm/referral/stats` | POST | Returns referral stats for account |
| `/api/cbm/referral/register` | POST | Manually registers a referral pair |

### 5b — Frontend UI

**`cbm.html` — "Refer & Earn" Tab:**
- Nav button between Loans and War Chest
- Invite link box with one-click copy
- Stat cards: Total · Pending · Rewarded · Gold Earned (live from API)
- How-it-works explainer

**`register.html` — Invite Flow:**
- Green referral banner shown when `?ref=<inviter>` is present in URL
- `referral_code` auto-injected into registration POST payload

---

## Phase 5c — Referral Reserve Accounting Fix

**File:** `cbm_wispbyte/db_layer.py`

### Problem
`check_and_settle_referral()` performed `deposited_cents += 50000` on both
accounts with no vault debit. Since `bank_reserves = vault_total - SUM(deposited_cents)`,
this silently depleted reserves by **1,000 Gold per referral settled**.

### Fix
1. **Solvency gate** — abort with "Deferred" if `vault_excess < 1,000G`
2. **`RESERVE_DEBIT` ledger entries** — two offsetting `cbm_ledger` rows written to account `"reserves"` inside the same transaction
3. **Idempotent retry** — progress rows always updated; payout fires once reserves recover

---

## Phase 6 — Referral Qualification Bugs (A / B / C)

**File:** `cbm_wispbyte/db_layer.py`

### Bug A — `deposited_cents` vs `total_deposited_cents`
Reading the current liquid balance instead of lifetime gross inflows caused
the 2,000G threshold to fail for any user who donated or withdrew after depositing.

**Fix:** `SELECT total_deposited_cents FROM cbm_accounts`

### Bug B — Missing trigger on donation path
Referral was never re-evaluated when the invitee donated via the dashboard.

**Fix:** `check_and_settle_referral()` added to `donate_from_balance()` and
`record_direct_donation()` after `recompute_treasury()`.

### Bug C — `donor_name` vs canonical `account_name` mismatch
Donations stored under a display name (e.g. `Commander_Bob`) were invisible to a
lookup against the account name (`b8bbq`), returning SUM = 0G.

**Fix:** Replaced flat `WHERE` clause with a `LEFT JOIN` on `cbm_accounts`
matching `display_name`, `account_name`, and `primary_territorial_account`.

---

## Phase 7 — War Chest Donation Slip Hardening (5 Issues)

**Files:** `cbm_wispbyte/db_layer.py`, `cbm_wispbyte/main.py`, `cbm_wispbyte/donations.html`

### Issue 1 — Case-insensitive slip matching
**Root cause:** SQLite `TEXT IN (...)` is case-sensitive. `CommanderBob` ≠ `commanderbob`.  
**Fix:** `COLLATE NOCASE` on `cbm_pending_donations.account_name` + automatic
table-rebuild migration at startup (checks `sqlite_master` DDL).

### Issue 2 — Tolerance-based amount matching
**Root cause:** `amount_cents = ?` strict equality — any mismatch bypassed the slip.  
**Fix:** `ORDER BY ABS(amount_cents - ?) ASC` — nearest slip wins; actual
received amount booked; variance logged.

### Issue 3 — Unlinked alt accounts not in candidate set
**Root cause:** Only `primary_territorial_account` was added to candidates.  
**Fix:** Calls `get_payment_methods(account_name)` and adds every linked alt's
`territorial_account_name` row. Deduplication via lowercased `seen` set.

### Issue 4 — Race condition on concurrent claims
**Root cause:** `SELECT` then `UPDATE` without a write lock allowed two concurrent
transactions to claim the same slip.  
**Fix:** `BEGIN IMMEDIATE` lock + `if cur.rowcount == 0: rollback()` guard.

### Issue 5 — False-positive "success" alert in `donations.html`
**Root cause:** Frontend polled `/api/cbm/donations/pending` and triggered
success when the slip disappeared — expired slips also disappear, giving a false confirmation.

**Fix:**

| | Before | After |
|---|---|---|
| **Endpoint polled** | `/api/cbm/donations/pending` | `/api/cbm/donations/slip-status?id=<id>` |
| **Detection** | `if (!match)` — slip absent from list | `if (data.slip_status === 'FULFILLED')` |
| **Expiry** | False success alert | Distinct warning: *"booked as personal deposit"* |

New endpoint `GET /api/cbm/donations/slip-status` returns `slip_status: PENDING | FULFILLED | EXPIRED`.  
New `get_donation_slip_by_id()` helper in `db_layer.py`.

---

## Commit History (This Session)

| Commit | Summary |
|---|---|
| `b1bb487` | Phases 1–5: Poland pattern, withdrawal cap 1K, clan tag fix, referral engine, auto-update guard |
| `5f6116d` | feat(ui): Referral Reward Program frontend — cbm.html tab + register.html invite flow |
| `e272260` | fix(referral): gate 500G reward on vault_excess solvency, add RESERVE_DEBIT ledger entries |
| `6bf10c9` | fix(referral): correct all 3 qualification bugs (A/B/C) |
| `8ac215f` | fix(donations): harden War Chest Donation Slip matching — 5 issues fixed |
| `06035a2` | chore(merge): absorb upstream auto-update |

---

## File Map

| File | Changes |
|---|---|
| `.github/workflows/auto-update-client.yml` | `git pull --rebase -X ours` before push |
| `client/assets/patterns/poland-pattern.avif` | New Poland flag texture asset |
| `client_src/mods/01_cosmetics_shop.js` | Multi-pattern state, Poland UI, rendering dispatch |
| `client/game.mods.js` | Rebuilt compiled bundle |
| `client/version.json` | Conflict resolved |
| `cbm_wispbyte/withdrawal_worker.py` | Cap raised to 1,000G |
| `cbm_wispbyte/main.py` | Cap at API layer; referral + slip-status endpoints |
| `cbm_wispbyte/cbm.html` | Withdrawal input max; Refer & Earn tab |
| `cbm_wispbyte/register.html` | Referral banner; `referral_code` payload injection |
| `cbm_wispbyte/donations.html` | Accurate slip status polling |
| `cbm_wispbyte/gold_api_client.py` | Clan tag priority + leader status fix |
| `cbm_wispbyte/db_layer.py` | Referral schema/settlement/reserve accounting; 3 qualification fixes; donation slip hardening |
| `cbm_wispbyte/deposit_daemon.py` | `check_and_settle_referral()` trigger after every deposit |
