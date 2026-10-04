# Implementation Plan: [KILR] Clan Territory Pattern & Requirement-Agnostic Free Product API

## Overview
Adds the **[KILR] Clan Territory Pattern** as an official cosmetic product for TerriX, featuring the official KILR clan logo (`client/kilr-clanlogo-pattern.png`). Clan Logo patterns function identically to Flag Territory Patterns (single unified flag/crest rendered across the entire territory bounding box with high-resolution mipmapping rather than tiling). The product is **FREE**, but gated: players are required to have `"[KILR]"` in their Territorial.io username to equip it.

In parallel, this establishes a **requirement-agnostic CBM Product API** for free products (`price_gold = 0.0`) that require client verification. The third-party client communicates securely with the Product API to attest that the requirement is satisfied, and **this communication is required every time the product is equipped or verified**, renewing time-bounded cryptographic attestation leases.

---

## Architectural Decisions

1. **Requirement-Agnostic CBM Backend**:
   - `cbm_products` is extended with `requires_client_verification: int` and `requirement_meta: text`.
   - The backend contains zero hardcoded checks for `"KILR"` or username strings.
   - Any product with `price_gold == 0.0` must have `requires_client_verification == 1`.
   - Commercial products without client verification continue to enforce `MIN_PRODUCT_PRICE_GOLD = 100.0`.

2. **Every-Time Verification & Attestation Leases**:
   - New endpoint: `POST /api/v1/products/{product_id}/verify-requirement` (and `/api/cbm/...`).
   - Authenticated via client API key (`X-CBM-API-Key`).
   - On valid client attestation, CBM issues an HMAC-SHA256 **Attestation Lease Token** with a time-to-live (`expires_at = now + 3600s`), tracked in `cbm_product_attestations`.
   - `/api/v1/products/ownership` only reports requirement-gated products as eligible if an active, unexpired lease exists.

3. **Client-Side Domain Logic & Live Guard (TerriX Client)**:
   - TerriX client checks if `getActiveAccount()` contains `"[KILR]"`.
   - When equipped or before a match, client securely communicates with CBM to obtain or renew the attestation lease.
   - If the player removes `"[KILR]"` from their name, local check fails, the API cannot be verified, the lease lapses, and the pattern is suppressed and unequipped.

4. **Clan Logo Flag-Style Territory Masking**:
   - In `src/terrixCosmetics.js`, `isFlagPattern(patternId)` evaluates to `true` for `'kilr'`, rendering the single 515x515 KILR crest scaled across the player's territory bounding box with high-resolution mipmaps.

---

## Task List

### Phase 1: Database Layer & Requirement-Agnostic Engine
- [ ] Task 1: Schema Migrations (`requires_client_verification` & `cbm_product_attestations`)
- [ ] Task 2: Free Product Creation with Requirement in `db_layer.py`
- [ ] Task 3: Attestation Lease Persistence Methods in `db_layer.py`
- [ ] Task 4: Seed `prod_kilr` with `requires_client_verification=1`

### Phase 2: REST API Endpoints & In-Memory Asset Cache
- [ ] Task 5: Implement `POST /api/v1/products/<product_id>/verify-requirement`
- [ ] Task 6: Update Dynamic Ownership Endpoint (`has_kilr` based on active attestation)
- [ ] Task 7: In-Memory Static Asset Pre-Compression in `main.py` (`kilr-clanlogo-pattern.png`)

### Phase 3: Asset Provisioning & Distribution
- [ ] Task 8: Sync `kilr-clanlogo-pattern.png` to asset directories (`assets/patterns/`, `client/assets/patterns/`, `cbm_wispbyte/assets/patterns/`)

### Phase 4: Client Cosmetics Integration (`src/terrixCosmetics.js`)
- [ ] Task 9: Texture & Mipmap Initialization in `terrixCosmetics.js`
- [ ] Task 10: Flag-Style Territory Masking & Render Hook
- [ ] Task 11: Secure API Attestation Communication & Lease Management
- [ ] Task 12: In-Game Match Guard & Cosmetics Shop UI Card

### Phase 5: Verification & End-to-End Testing
- [ ] Task 13: Backend Test Suite (`test_product_requirements.py`)
- [ ] Task 14: Client Bundle Build (`node build.js`)
- [ ] Task 15: Full Regression Test Suite Execution
