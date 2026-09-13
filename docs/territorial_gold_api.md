# Territorial.io Gold & Account API Technical Documentation

## 1. Overview & Transport Protocol

The Territorial.io platform exposes authenticated HTTP JSON API endpoints for account queries, peer-to-peer Gold transactions, and clan analytics.

* **Base URL:** `https://territorial.io`
* **Transport:** HTTPS POST / GET
* **Content-Type:** `application/json`
* **Headers Required:** `User-Agent` (Cloudflare blocks requests missing a valid browser User-Agent with HTTP 403 Forbidden).
* **Currency Units:** Internally tracked in **cents** (`gold_cents`), where:
  $$1.00\text{ Gold} = 100\text{ Cents}$$

---

## 2. API Endpoints

### 2.1 Send Gold (`POST /api/gold/send`)
Executes an immediate peer-to-peer gold transfer between accounts.

#### Request Schema
```json
{
  "account_name": "SENDER_ACCOUNT",
  "password": "SENDER_PASSWORD",
  "target_account_name": "RECIPIENT_ACCOUNT",
  "amount": 1
}
```
* `amount`: Integer representing whole units of Gold (e.g., `1` = 1.0 Gold = 100 cents).

#### Successful Response (HTTP 200)
```json
{
  "status": "ok",
  "api_fees_cents": 1,
  "transaction_fees": 0,
  "account_name": "DdcBC",
  "target_account_name": "B8bbq",
  "amount": 1
}
```

#### Error Responses
| Error Condition | Response Body | API Fee Incurred |
| :--- | :--- | :--- |
| Invalid Sender Password | `{"status": "password error"}` | **0 cents** |
| Target Account Not Found | `{"status": "account error", "api_fees_cents": 1}` | **1 cent** |
| Amount $\le 0$ | `{"status": "amount error"}` | **0 cents** |
| Insufficient Gold Balance | `{"status": "transaction error", "api_fees_cents": 1}` | **1 cent** |

---

### 2.2 Get Account Profile (`POST /api/account/get`)
Queries deep player statistics, leaderboard ranks, clan allocations, and gold balance for any target account.

#### Request Schema
```json
{
  "account_name": "CALLER_ACCOUNT",
  "password": "CALLER_PASSWORD",
  "target_account_name": "TARGET_ACCOUNT"
}
```

#### Successful Response (HTTP 200)
```json
{
  "status": "ok",
  "api_fees_cents": 10,
  "account_data": {
    "overall_accounts": 421725,
    "username": "[CBM]ClanBankManager",
    "gold_cents": 5746,
    "gold_rank": 159050,
    "ovo_elo": 0,
    "ovo_rank": 288681,
    "ovo_played_games": 1,
    "clan_member_clan_a": "CBM",
    "clan_member_clan_b": "",
    "clan_member_points_a": 0,
    "clan_member_points_b": 0,
    "clan_member_rank_a": 289996,
    "clan_member_total_points_a": 0,
    "clan_member_won_games_a": 0,
    "clan_leader_points": 0,
    "clan_leader_clan": "",
    "admin_points": 0,
    "admin_rank": 284386,
    "br_rank": 292937,
    "br_points": 0,
    "zombie_rank": 286993,
    "zombie_points": 0,
    "online_status": 0,
    "last_online": 0,
    "has_patreon": 0,
    "is_patreon_hidden": 0,
    "bio_state": 0,
    "bio_fee": 414,
    "bio_text": "",
    "bio_period": 0
  }
}
```

---

### 2.3 Get Clan Stats (`POST /api/clan/stats/get`)
Queries historical time-series performance metrics for a specified clan.

#### Request Schema
```json
{
  "account_name": "CALLER_ACCOUNT",
  "password": "CALLER_PASSWORD",
  "clan": "CLAN_NAME",
  "timeframe": "D1"
}
```
* `timeframe`: Supported values: `"M1"`, `"M5"`, `"H1"`, `"H4"`, `"D1"`, `"W1"`, `"MN"`.

#### Response (HTTP 200)
```json
{
  "status": "ok",
  "api_fees_cents": 10,
  "timeframe": "D1",
  "clan": "CLAN_NAME",
  "values": []
}
```

---

### 2.4 Public Transaction Ledger (`GET /log/transactions`)
A public real-time stream of all gold transactions across the platform.

* **URL:** `https://territorial.io/log/transactions`
* **Format:** Plain text CSV format, one record per line:
  ```csv
  <timestamp_ms>,<sender_account>,<receiver_account>,<amount_gold>,<transaction_fee>
  ```
* **Real Verification Example (from live testing):**
  ```csv
  1789320994585,DdcBC,B8bbq,1,0
  1789321030031,B8bbq,DdcBC,1,0
  ```

---

## 3. Cost & Fee Structure

| Operation | Base API Fee | Additional Network Fee | Deducted From |
| :--- | :--- | :--- | :--- |
| `/api/gold/send` | **1 cent (0.01 Gold)** | 0% (or up to 1% depending on volume) | Sender Account |
| `/api/account/get` | **10 cents (0.10 Gold)** | 0% | Authenticated Caller |
| `/api/clan/stats/get` | **10 cents (0.10 Gold)** | 0% | Authenticated Caller |
| Failed Auth (`password error`) | **0 cents** | None | N/A |

> [!NOTE]
> All successful queries directly deduct their API fees from the calling account's balance in real time. Keep queries throttled or cached to avoid balance depletion.
