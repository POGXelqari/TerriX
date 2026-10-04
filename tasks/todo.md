# Implementation Tasks: [KILR] Clan Territory Pattern & Requirement-Agnostic Free Product API

## Phase 1: Database Layer & Requirement-Agnostic Engine
- [x] **Task 1: Schema Migrations (`requires_client_verification` & `cbm_product_attestations`)**
  - **Acceptance Criteria**:
    - `cbm_products` contains `requires_client_verification INTEGER DEFAULT 0` and `requirement_meta TEXT`.
    - `cbm_product_attestations` table created with columns `product_id`, `account_name`, `client_id`, `attestation_token`, `attestation_payload`, `verified_at`, `expires_at`.
    - SQLite migration is idempotent in `_init_sqlite_schema`.
    - Mirrored in `setup_supabase.sql`.
  - **Verification**: Verified with automated test suite in `cbm_wispbyte/test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/db_layer.py`, `cbm_wispbyte/setup_supabase.sql`

- [x] **Task 2: Free Product Creation with Verification Requirement**
  - **Acceptance Criteria**:
    - `db.create_product()` accepts `requires_client_verification: bool = False` and `requirement_meta: Optional[Dict] = None`.
    - If `price_gold == 0.0`, `requires_client_verification` must be True.
    - If `requires_client_verification` is False, `price_gold >= 100.0` continues to be enforced.
  - **Verification**: Verified in `test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/db_layer.py`

- [x] **Task 3: Attestation Lease Persistence Methods**
  - **Acceptance Criteria**:
    - `db.create_or_renew_attestation(product_id, account, client_id, payload, ttl_seconds)` generates signed token and stores lease with `expires_at`.
    - `db.get_active_attestation(product_id, account)` returns active lease if unexpired.
    - `db.get_account_owned_products(account)` includes requirement-gated products with active leases.
  - **Verification**: Verified in `test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/db_layer.py`

- [x] **Task 4: Seed `prod_kilr`**
  - **Acceptance Criteria**:
    - `prod_kilr` is seeded in `db_layer.py` with `name='[KILR] Clan Territory Pattern'`, `price_gold=0.0`, `requires_client_verification=1`, and `image_url='/assets/patterns/kilr-clanlogo-pattern.png'`.
  - **Verification**: Verified in `test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/db_layer.py`

## Phase 2: REST API Endpoints & In-Memory Asset Cache
- [x] **Task 5: Implement `POST /api/v1/products/<product_id>/verify-requirement`**
  - **Acceptance Criteria**:
    - Authenticates client with `X-CBM-API-Key` or Bearer token.
    - Requirement-agnostic: receives `{ account, client_verified: bool, client_id, payload }`.
    - If `client_verified: true`, calls `db.create_or_renew_attestation` and returns `{ status: 'ok', verified: true, attestation_token, expires_at }`.
    - If `client_verified: false`, returns 403 Forbidden.
  - **Verification**: Verified over HTTP in `test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/main.py`

- [x] **Task 6: Update Dynamic Ownership Endpoint**
  - **Acceptance Criteria**:
    - `/api/v1/products/ownership` and `/api/cbm/products/ownership` evaluate active attestations.
    - `has_kilr: bool` reflects whether an active unexpired attestation is present for the account.
  - **Verification**: Verified over HTTP in `test_requirement_attestation.py`.
  - **Files**: `cbm_wispbyte/main.py`

- [x] **Task 7: In-Memory Static Asset Pre-Compression**
  - **Acceptance Criteria**:
    - `kilr-clanlogo-pattern.png` added to `CANONICAL_REMOTE_ASSETS` in `main.py` and pre-compressed at startup for zero disk I/O.
  - **Verification**: Verified in `main.py`.
  - **Files**: `cbm_wispbyte/main.py`

## Phase 3: Asset Provisioning & Distribution
- [x] **Task 8: Sync `kilr-clanlogo-pattern.png` to Asset Directories**
  - **Acceptance Criteria**:
    - `client/kilr-clanlogo-pattern.png` copied to `assets/patterns/`, `build/assets/patterns/`, `cbm_wispbyte/assets/patterns/`, `cbm_wispbyte/assets/products/`, `static/assets/patterns/`.
  - **Verification**: Verified file existence and size (243,991 bytes).
  - **Files**: `assets/patterns/kilr-clanlogo-pattern.png`, `cbm_wispbyte/assets/patterns/kilr-clanlogo-pattern.png`

## Phase 4: Client Cosmetics Integration (`src/terrixCosmetics.js`)
- [x] **Task 9: Texture & Mipmap Initialization**
  - **Acceptance Criteria**:
    - `state.patternImageKilr` loads `assets/patterns/kilr-clanlogo-pattern.png`.
    - `state.mipmapsKilr` generated via `buildMipmaps`.
  - **Verification**: Verified in `src/terrixCosmetics.js` and `fx.bundle.js`.
  - **Files**: `src/terrixCosmetics.js`

- [x] **Task 10: Territory Masking & Render Hook**
  - **Acceptance Criteria**:
    - Repeating tiled pattern texture coating player territory during live matches.
    - Canvas pattern rendering supports `kilr` texture, mipmaps, and active match notifications.
  - **Verification**: Verified in `src/terrixCosmetics.js` and `fx.bundle.js`.
  - **Files**: `src/terrixCosmetics.js`

- [x] **Task 11: Secure API Attestation Communication & Lease Management**
  - **Acceptance Criteria**:
    - Client checks local domain rule (`hasKilrClanTag(name)`).
    - When satisfied, client communicates securely with `POST /api/v1/products/prod_kilr/verify-requirement` to obtain/renew the attestation token.
    - Token and expiry stored in `localStorage['terrix_cbm_receipt_kilr']`.
  - **Verification**: Verified in `src/terrixCosmetics.js` and `fx.bundle.js`.
  - **Files**: `src/terrixCosmetics.js`

- [x] **Task 12: In-Game Match Guard & Cosmetics Shop UI Card**
  - **Acceptance Criteria**:
    - Real-time gatekeeper verifies clan tag requirement. If tag missing (and not creator), pattern is unequipped.
    - Cosmetics Shop modal shows `#tx-kilr-card` with dynamic button states (`Equipped ✓`, `Equip [KILR] Clan Pattern (Free)`, `Requires [KILR] Clan Tag`).
  - **Verification**: Verified in `src/terrixCosmetics.js` and `fx.bundle.js`.
  - **Files**: `src/terrixCosmetics.js`

## Phase 5: Verification & End-to-End Testing
- [x] **Task 13: Backend Test Suite (`test_requirement_attestation.py`)**
  - **Acceptance Criteria**:
    - 100% pass rate on requirement-agnostic creation, attestation issuance, lease expiration, and dynamic ownership.
  - **Verification**: `py -3.12 cbm_wispbyte/test_requirement_attestation.py` passed (6/6 tests).
  - **Files**: `cbm_wispbyte/test_requirement_attestation.py`

- [x] **Task 14: Client Bundle Build (`node build.js`)**
  - **Acceptance Criteria**:
    - Webpack compilation succeeds with 0 errors.
    - `build/fx.bundle.js` synced to `client/fx.bundle.js`.
  - **Verification**: Built and synced cleanly with `node build.js --skip-patching`.
  - **Files**: `build/fx.bundle.js`, `client/fx.bundle.js`

- [x] **Task 15: Full Regression Test Suite Execution**
  - **Acceptance Criteria**:
    - All test suites (`test_requirement_attestation.py`, `test_creator_free_equip.py`, `test_terrix_official_api_key.py`, `test_discord_automod.py`) pass.
  - **Verification**: 28/28 tests passed across all 4 suites.
