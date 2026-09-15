#!/usr/bin/env python3
"""
Vercel Serverless Function: Clan Bank Manager (CBM) API Gateway
==============================================================
Endpoint: /api/cbm/*
Provides public and authenticated endpoints for the CBM Web Portal:
- GET  /api/cbm/status        : Central bank reserves, solvency ratio, loan status, verified ledger
- GET  /api/cbm/account       : Member profile, deposited balance, transaction statement
- POST /api/cbm/withdraw      : Request a withdrawal from internal balance
- POST /api/cbm/deposit-check : Query public ledger for pending inbound transfers
"""

import os
import sys
import json
import time
import hashlib
import secrets
import hmac
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

def hash_cbm_pin(pin: str, salt: str = None):
    if not salt:
        salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", str(pin).strip().encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return h, salt

def verify_cbm_pin(acc_dict: dict, pin: str) -> bool:
    if not pin or not acc_dict:
        return False
    pin_hash = acc_dict.get("pin_hash")
    salt = acc_dict.get("salt")
    if not pin_hash or not salt:
        return False
    test_h, _ = hash_cbm_pin(pin, salt)
    return hmac.compare_digest(pin_hash, test_h)

def hash_cbm_password(password: str, salt: str = None):
    if not salt:
        salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return h, salt

def verify_cbm_password(acc_dict: dict, password: str) -> bool:
    if not password or not acc_dict:
        return False
    pwd_hash = acc_dict.get("password_hash")
    salt = acc_dict.get("password_salt")
    if not pwd_hash or not salt:
        return False
    test_h, _ = hash_cbm_password(password, salt)
    return hmac.compare_digest(pwd_hash, test_h)

def verify_territorial_credentials(account_name: str, password: str):
    url = "https://territorial.io/api/account/get"
    payload = json.dumps({
        "account_name": account_name.strip(),
        "password": password.strip(),
        "target_account_name": account_name.strip()
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "CBM-Verification-Gateway/1.0"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=8.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") == "ok":
                return True, "Valid credentials", data.get("account_data", {})
            return False, data.get("status", "Invalid credentials"), {}
    except Exception as e:
        return False, str(e), {}


# Environmental credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or ""
)
VAULT_ACCOUNT = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")

def sb_query(table: str, params: str = "", method: str = "GET", body: dict = None, upsert: bool = False):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return 500, {"error": "Supabase credentials not configured in environment"}
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    prefer_val = "resolution=merge-duplicates,return=representation" if upsert else "return=representation"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer_val
    }
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            body_text = resp.read().decode("utf-8")
            return resp.status, json.loads(body_text) if body_text else []
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"error": raw}
    except Exception as e:
        return 500, {"error": str(e)}

def evaluate_lending(bank_reserves_cents: int) -> dict:
    reserves_gold = bank_reserves_cents / 100.0
    potential_ceiling = reserves_gold * 0.0005
    is_active = potential_ceiling > 1000.0
    min_required = 2000000.0
    return {
        "is_active": is_active,
        "bank_reserves_gold": round(reserves_gold, 2),
        "calculated_ceiling_gold": round(potential_ceiling, 2),
        "max_loan_gold": int(potential_ceiling) if is_active else 0,
        "activation_threshold_gold": 1000.0,
        "min_reserves_required_gold": min_required,
        "progress_percent": min(100.0, round((reserves_gold / min_required) * 100.0, 3)),
        "status_message": (
            f"Active: Max loan per request is {int(potential_ceiling):,} Gold."
            if is_active else
            f"Locked: 0.05% of reserves ({potential_ceiling:.2f} Gold) must strictly exceed 1,000 Gold. Requires at least {min_required:,.0f} Gold in bank reserves."
        )
    }

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")
        query = ""
        if "?" in self.path:
            query = self.path.split("?", 1)[1]

        # 1. Treasury Status
        if path in ("/api/cbm/status", "/api/cbm", ""):
            st, treasury = sb_query("cbm_treasury", "?id=eq.1&select=*")
            if st == 200 and isinstance(treasury, list) and treasury:
                t_data = treasury[0]
            else:
                # Dynamically audit against processed transactions instead of arbitrary hardcoded numbers
                st_dep, tx_deps = sb_query("cbm_processed_txs", f"?receiver=eq.{VAULT_ACCOUNT}&select=amount_gold")
                total_inbound = sum(float(tx.get("amount_gold", 0)) for tx in tx_deps) if (st_dep == 200 and isinstance(tx_deps, list)) else 0.0
                st_w, tx_ws = sb_query("cbm_withdrawals", "?status=eq.EXECUTED&select=amount_gold")
                total_outbound = sum(float(w.get("amount_gold", 0)) for w in tx_ws) if (st_w == 200 and isinstance(tx_ws, list)) else 0.0
                calc_vault_cents = int(round(max(0.0, total_inbound - total_outbound) * 100))
                t_data = {
                    "vault_account_name": VAULT_ACCOUNT,
                    "vault_total_gold_cents": calc_vault_cents,
                    "member_liabilities_cents": 0,
                    "bank_reserves_cents": calc_vault_cents,
                    "last_sync_at": None,
                    "audit_status": "CALCULATED_FROM_LEDGER"
                }

            # Query donations and loan penalties to guarantee accurate unencumbered reserve breakdown
            st_d, dons = sb_query("cbm_donations", "?select=amount_cents")
            unencumbered_capital_cents = sum(d.get("amount_cents", 0) for d in dons) if (st_d == 200 and isinstance(dons, list)) else 0

            st_l, loans = sb_query("cbm_loans", "?select=penalty_cents")
            loan_penalties_cents = sum(ln.get("penalty_cents", 0) for ln in loans) if (st_l == 200 and isinstance(loans, list)) else 0

            vault_cents = t_data.get("vault_total_gold_cents", 0)
            
            # Query actual member liabilities dynamically from cbm_accounts
            st_acc, accounts = sb_query("cbm_accounts", "?select=account_name,deposited_cents")
            if st_acc == 200 and isinstance(accounts, list) and accounts:
                system_accs = {'treasury', 'war_chest', 'bank', 'vault', 'reserves'}
                liab_cents = sum(a.get("deposited_cents", 0) for a in accounts if a.get("account_name", "").lower() not in system_accs)
            else:
                liab_cents = t_data.get("member_liabilities_cents", 0)

            vault_excess_cents = max(0, vault_cents - liab_cents)
            reserves_cents = vault_excess_cents
            vault_cushion_cents = max(0, reserves_cents - unencumbered_capital_cents - loan_penalties_cents)

            vault_gold = vault_cents / 100.0
            liab_gold = liab_cents / 100.0
            vault_excess_gold = vault_excess_cents / 100.0
            unencumbered_capital_gold = unencumbered_capital_cents / 100.0
            loan_penalties_gold = loan_penalties_cents / 100.0
            vault_cushion_gold = vault_cushion_cents / 100.0
            reserves_gold = reserves_cents / 100.0

            # Recent public ledger transactions
            st_tx, recent_txs = sb_query("cbm_processed_txs", "?order=timestamp_ms.desc&limit=15&select=*")
            if st_tx != 200 or not isinstance(recent_txs, list):
                recent_txs = []

            lending = evaluate_lending(reserves_cents)
            solvency_ratio = round((vault_gold / liab_gold) * 100.0, 1) if liab_gold > 0 else 100.0

            return self._send_json(200, {
                "status": "ok",
                "vault_account": VAULT_ACCOUNT,
                "treasury": {
                    "vault_total_gold": vault_gold,
                    "member_liabilities_gold": liab_gold,
                    "vault_excess_gold": vault_excess_gold,
                    "unencumbered_capital_gold": unencumbered_capital_gold,
                    "loan_penalties_gold": loan_penalties_gold,
                    "bank_reserves_gold": reserves_gold,
                    "solvency_ratio_percent": solvency_ratio,
                    "last_sync": t_data.get("last_sync_at"),
                    "audit_status": t_data.get("audit_status", "LIVE_API_VERIFIED")
                },
                "lending_facility": lending,
                "recent_transactions": recent_txs
            })

        # 2. Member Account Lookup
        elif path == "/api/cbm/account":
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = params.get("name", "").strip()
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' query parameter."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{acc_name}&select=*")
            if st == 200 and isinstance(accounts, list) and accounts:
                acc = accounts[0]
                # Fetch recent ledger entries and active loans
                st_l, ledger = sb_query("cbm_ledger", f"?account_name=eq.{acc_name}&order=created_at.desc&limit=20&select=*")
                st_ln, loans = sb_query("cbm_loans", f"?account_name=eq.{acc_name}&order=created_at.desc&select=*")
                return self._send_json(200, {
                    "status": "ok",
                    "account": {
                        "account_name": acc.get("account_name"),
                        "display_name": acc.get("display_name"),
                        "avatar_url": acc.get("avatar_url", ""),
                        "clan_tag": acc.get("clan_tag"),
                        "role": acc.get("role"),
                        "deposited_gold": acc.get("deposited_cents", 0) / 100.0,
                        "total_deposited_gold": acc.get("total_deposited_cents", 0) / 100.0,
                        "total_withdrawn_gold": acc.get("total_withdrawn_cents", 0) / 100.0,
                        "has_pin": bool(acc.get("pin_hash")),
                        "is_verified": bool(acc.get("is_verified")),
                    },
                    "loans": loans if (st_ln == 200 and isinstance(loans, list)) else [],
                    "statement": ledger if st_l == 200 and isinstance(ledger, list) else []
                })
            else:
                return self._send_json(404, {
                    "status": "not_found",
                    "message": f"Account '{acc_name}' has no active CBM deposit balance."
                })

        # 3. Linked Payment Methods Lookup
        elif path == "/api/cbm/payment-methods":
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc)
            acc_name = params.get("name", "").strip()
            if not acc_name:
                return self._send_json(400, {"status": "error", "message": "Missing 'name' query parameter."})

            st_pm, pms = sb_query("cbm_payment_methods", f"?cbm_username=eq.{acc_name}&select=id,cbm_username,territorial_account_name,display_name,verification_type,status,is_primary,total_transacted_gold,linked_at,last_used_at")
            clean_pms = pms if (st_pm == 200 and isinstance(pms, list)) else []
            return self._send_json(200, {
                "status": "ok",
                "cbm_username": acc_name,
                "payment_methods": clean_pms
            })

        # 4. War Chest Donors API
        elif path == "/api/cbm/donors":
            st_don, donations = sb_query("cbm_donations", "?order=created_at.desc&limit=100&select=*")
            all_don = donations if (st_don == 200 and isinstance(donations, list)) else []
            donors_map = {}
            for d in all_don:
                name = d.get("donor_name", "Anonymous")
                if name not in donors_map:
                    donors_map[name] = {
                        "donor_name": name,
                        "territorial_account": d.get("territorial_account"),
                        "total_gold": 0.0,
                        "total_cents": 0,
                        "donation_count": 0,
                        "last_message": d.get("message", ""),
                        "last_donated_at": d.get("created_at")
                    }
                donors_map[name]["total_gold"] += float(d.get("amount_gold", 0))
                donors_map[name]["total_cents"] += int(d.get("amount_cents", 0))
                donors_map[name]["donation_count"] += 1
                if d.get("created_at"):
                    donors_map[name]["last_donated_at"] = d.get("created_at")
                if d.get("message"):
                    donors_map[name]["last_message"] = d.get("message")
            sorted_donors = sorted(donors_map.values(), key=lambda x: x["total_gold"], reverse=True)[:10]
            for idx, item in enumerate(sorted_donors):
                item["rank"] = idx + 1
                item["total_gold"] = round(item["total_gold"], 2)

            total_donated = sum(d.get("total_gold", 0) for d in sorted_donors)
            return self._send_json(200, {
                "status": "ok",
                "total_donated_gold": round(total_donated, 2),
                "top_donors": sorted_donors,
                "recent_donations": all_don[:20]
            })

        # 4b. Pending Donation Slips API
        elif path in ("/api/cbm/donations/pending", "/api/cbm/pending-donations"):
            params = dict(qc.split("=") for qc in query.split("&") if "=" in qc) if "query" in locals() else {}
            # Fallback parse query
            if not params and "?" in self.path:
                q_str = self.path.split("?")[1]
                params = dict(qc.split("=") for qc in q_str.split("&") if "=" in qc)
            acc_name = params.get("account", "").strip()

            filter_clause = "?status=eq.PENDING&order=created_at.desc"
            if acc_name:
                filter_clause += f"&account_name=eq.{acc_name}"

            st, res = sb_query("cbm_pending_donations", filter_clause)
            now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            pending = []
            if st == 200 and isinstance(res, list):
                for p in res:
                    exp = p.get("expires_at", "")
                    if exp and exp > now_iso:
                        pending.append(p)
            return self._send_json(200, {"status": "ok", "pending_donations": pending})

        return self._send_json(404, {"status": "error", "message": "Endpoint not found."})

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(raw_body)
        except Exception:
            return self._send_json(400, {"status": "error", "message": "Invalid JSON payload."})

        # 0. CBM Account Registration
        if path == "/api/cbm/auth/register":
            uname = body.get("username", "").strip()
            pwd = body.get("password", "").strip()
            avatar = body.get("avatar_url", "").strip()
            terri = body.get("primary_territorial_account", "").strip()
            terri_pwd = body.get("territorial_password", "").strip()
            pin = body.get("pin")

            if not uname or not pwd or not avatar or not terri:
                return self._send_json(400, {
                    "status": "error",
                    "message": "username, password, avatar_url, and primary_territorial_account are required."
                })

            if len(uname) < 3 or len(uname) > 30:
                return self._send_json(400, {"status": "error", "message": "Username must be 3-30 characters."})

            if len(pwd) < 6:
                return self._send_json(400, {"status": "error", "message": "Password must be at least 6 characters."})

            # Check if account already exists
            st, existing = sb_query("cbm_accounts", f"?account_name=eq.{uname}&select=*")
            if st == 200 and isinstance(existing, list) and existing and existing[0].get("password_hash"):
                return self._send_json(400, {"status": "error", "message": "Username already registered."})

            if terri_pwd:
                valid, t_msg, t_data = verify_territorial_credentials(terri, terri_pwd)
                if not valid and "error" not in t_msg.lower():
                    return self._send_json(401, {"status": "unauthorized", "message": f"Territorial.io credentials invalid: {t_msg}"})

            p_hash, p_salt = hash_cbm_password(pwd)
            acc_data = {
                "account_name": uname,
                "display_name": uname,
                "avatar_url": avatar,
                "clan_tag": "ANTI-OG",
                "role": "member",
                "password_hash": p_hash,
                "password_salt": p_salt,
                "primary_territorial_account": terri,
                "is_verified": True
            }
            if pin:
                pin_str = str(pin).strip()
                if pin_str.isdigit() and 4 <= len(pin_str) <= 8:
                    pin_h, pin_s = hash_cbm_pin(pin_str)
                    acc_data["pin_hash"] = pin_h
                    acc_data["salt"] = pin_s

            st_ins, res_ins = sb_query("cbm_accounts", method="POST", body=acc_data, upsert=True)
            # Also link primary payment method
            sb_query("cbm_payment_methods", method="POST", body={
                "cbm_username": uname,
                "territorial_account_name": terri,
                "territorial_password": terri_pwd or "",
                "display_name": uname,
                "verification_type": "INPUT_CREDENTIALS" if terri_pwd else "UNVERIFIED",
                "status": "VERIFIED",
                "is_primary": True
            }, upsert=True)

            clean_acc = dict(acc_data)
            clean_acc.pop("password_hash", None)
            clean_acc.pop("password_salt", None)
            clean_acc.pop("pin_hash", None)
            clean_acc.pop("salt", None)
            clean_acc["has_password"] = True
            clean_acc["has_pin"] = bool(pin)
            return self._send_json(200, {"status": "ok", "message": "Account registered successfully.", "account": clean_acc})

        # 0b. CBM Adaptive Login (Password, PIN, or Game Password Fallback)
        elif path == "/api/cbm/auth/login":
            uname = (body.get("username") or body.get("account_name") or "").strip()
            pwd = body.get("password")
            pin = body.get("pin")
            game_pwd = body.get("game_password") or body.get("territorial_password")

            if not uname:
                return self._send_json(400, {"status": "error", "message": "username is required."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{uname}&select=*")
            acc = accounts[0] if (st == 200 and isinstance(accounts, list) and accounts) else None

            if not acc:
                if game_pwd and len(uname) <= 10:
                    valid, _, _ = verify_territorial_credentials(uname, game_pwd)
                    if valid:
                        sb_query("cbm_accounts", method="POST", body={
                            "account_name": uname,
                            "display_name": uname,
                            "clan_tag": "ANTI-OG",
                            "role": "member",
                            "is_verified": True
                        }, upsert=True)
                        sb_query("cbm_payment_methods", method="POST", body={
                            "cbm_username": uname,
                            "territorial_account_name": uname,
                            "territorial_password": game_pwd,
                            "is_primary": True,
                            "status": "VERIFIED"
                        }, upsert=True)
                        return self._send_json(200, {
                            "status": "ok",
                            "message": f"Authenticated via Territorial.io primary credentials for {uname}.",
                            "auth_method": "GAME_PASSWORD",
                            "account": {"account_name": uname, "display_name": uname, "has_pin": False, "has_password": False}
                        })
                return self._send_json(404, {"status": "error", "message": f"Account '{uname}' not found."})

            clean_acc = dict(acc)
            clean_acc.pop("password_hash", None)
            clean_acc.pop("password_salt", None)
            clean_acc.pop("pin_hash", None)
            clean_acc.pop("salt", None)
            clean_acc["has_pin"] = bool(acc.get("pin_hash"))
            clean_acc["has_password"] = bool(acc.get("password_hash"))

            if pwd:
                if not acc.get("password_hash"):
                    return self._send_json(400, {"status": "error", "message": "No CBM password configured. Please log in with PIN or Territorial.io password."})
                if verify_cbm_password(acc, pwd):
                    return self._send_json(200, {"status": "ok", "message": "Login successful.", "auth_method": "PASSWORD", "account": clean_acc})
                else:
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid CBM password."})

            elif pin:
                if not acc.get("pin_hash"):
                    return self._send_json(400, {"status": "error", "message": "No PIN configured. Please use CBM password or Territorial.io credentials."})
                if verify_cbm_pin(acc, str(pin)):
                    return self._send_json(200, {"status": "ok", "message": "PIN verified successfully.", "auth_method": "PIN", "account": clean_acc})
                else:
                    return self._send_json(401, {"status": "unauthorized", "message": "Invalid Quick PIN."})

            elif game_pwd:
                terri_acc = acc.get("primary_territorial_account") or uname
                valid, msg, _ = verify_territorial_credentials(terri_acc, game_pwd)
                if valid:
                    return self._send_json(200, {"status": "ok", "message": f"Authenticated via Territorial.io primary credentials for {terri_acc}.", "auth_method": "GAME_PASSWORD", "account": clean_acc})
                else:
                    return self._send_json(401, {"status": "unauthorized", "message": f"Invalid Territorial.io password for '{terri_acc}'."})

            else:
                return self._send_json(400, {"status": "error", "message": "Please provide your CBM password, Quick PIN, or Territorial.io game password."})

        # 0c. Model 3: Web-Declared In-Game Donation Slip
        elif path in ("/api/cbm/donations/declare", "/api/cbm/pending-donations/declare"):
            account_name = body.get("account_name", "").strip()
            try:
                amount_gold = float(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0.0
            message = body.get("message", "").strip()
            ttl_minutes = int(body.get("ttl_minutes", 15))

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "account_name and positive amount_gold are required."})

            now = time.time()
            expires_at = now + (ttl_minutes * 60)
            amount_cents = int(round(amount_gold * 100))
            import uuid
            slip_id = f"slip_{uuid.uuid4().hex[:12]}"
            payload = {
                "id": slip_id,
                "account_name": account_name,
                "amount_cents": amount_cents,
                "amount_gold": round(amount_gold, 2),
                "message": message,
                "status": "PENDING",
                "expires_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at))
            }
            sb_query("cbm_pending_donations", method="POST", body=payload)
            payload["remaining_seconds"] = max(0, int(expires_at - now))
            return self._send_json(200, {
                "status": "ok",
                "message": f"Donation slip active for {ttl_minutes} minutes. Send exactly {amount_gold:.2f} Gold in-game to {VAULT_ACCOUNT}.",
                "slip": payload
            })

        # 0a. Create CBM Access PIN (First-time setup only)
        elif path == "/api/cbm/auth/create-pin":
            acc_name = body.get("account_name", "").strip()
            pin = str(body.get("pin", "")).strip()

            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            if not (pin.isdigit() and 4 <= len(pin) <= 8):
                return self._send_json(400, {"status": "error", "message": "PIN must consist of 4 to 8 numeric digits."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{acc_name}&select=*")
            if st == 200 and isinstance(accounts, list) and accounts and accounts[0].get("pin_hash"):
                return self._send_json(400, {"status": "error", "message": "This account already has an active Access PIN configured. Please use Change PIN to update it."})

            p_hash, salt = hash_cbm_pin(pin)
            if st != 200 or not accounts:
                sb_query("cbm_accounts", method="POST", body={
                    "account_name": acc_name,
                    "display_name": acc_name,
                    "clan_tag": "ANTI-OG",
                    "role": "member",
                    "pin_hash": p_hash,
                    "salt": salt,
                    "is_verified": True
                }, upsert=True)
            else:
                sb_query("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_name}", body={
                    "pin_hash": p_hash,
                    "salt": salt,
                    "is_verified": True
                })

            return self._send_json(200, {"status": "ok", "message": "CBM Access PIN created successfully."})

        # 0b. Change CBM Access PIN (Strictly requires current PIN)
        elif path == "/api/cbm/auth/change-pin":
            acc_name = body.get("account_name", "").strip()
            current_pin = str(body.get("current_pin", "")).strip()
            new_pin = str(body.get("new_pin", "") or body.get("pin", "")).strip()

            if not acc_name or not current_pin or not new_pin:
                return self._send_json(400, {"status": "error", "message": "account_name, current_pin, and new_pin are required."})

            if not (new_pin.isdigit() and 4 <= len(new_pin) <= 8):
                return self._send_json(400, {"status": "error", "message": "New PIN must consist of 4 to 8 numeric digits."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{acc_name}&select=*")
            if st != 200 or not accounts:
                return self._send_json(404, {"status": "error", "message": f"Account '{acc_name}' not found."})

            acc = accounts[0]
            if not acc.get("pin_hash"):
                return self._send_json(400, {"status": "error", "message": "No Access PIN configured for this account yet. Use Create PIN to set one."})

            if not verify_cbm_pin(acc, current_pin):
                return self._send_json(401, {"status": "unauthorized", "message": "Current PIN is incorrect. Verification failed."})

            if current_pin == new_pin:
                return self._send_json(400, {"status": "error", "message": "New PIN must be different from current PIN."})

            p_hash, salt = hash_cbm_pin(new_pin)
            sb_query("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_name}", body={
                "pin_hash": p_hash,
                "salt": salt
            })
            return self._send_json(200, {"status": "ok", "message": "CBM Access PIN changed successfully."})

        # 0c. Set / Update CBM Access PIN (Unified legacy endpoint)
        elif path == "/api/cbm/auth/set-pin":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "").strip()
            current_pin = body.get("current_pin", "").strip()

            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            if not (pin.isdigit() and 4 <= len(pin) <= 8):
                return self._send_json(400, {"status": "error", "message": "PIN must consist of 4 to 8 numeric digits."})

            p_hash, salt = hash_cbm_pin(pin)

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{acc_name}&select=*")
            if st != 200 or not accounts:
                # Brand new user setting a PIN for their account
                sb_query("cbm_accounts", method="POST", body={
                    "account_name": acc_name,
                    "display_name": acc_name,
                    "clan_tag": "ANTI-OG",
                    "role": "member",
                    "pin_hash": p_hash,
                    "salt": salt,
                    "is_verified": False
                }, upsert=True)
                return self._send_json(200, {"status": "ok", "message": "6-digit CBM Access PIN configured successfully."})

            acc = accounts[0]
            if acc.get("pin_hash"):
                if not current_pin:
                    return self._send_json(400, {"status": "error", "message": "Current PIN is required to change your PIN."})
                if not verify_cbm_pin(acc, current_pin):
                    return self._send_json(401, {"status": "unauthorized", "message": "Current PIN is incorrect."})

            st_up, res_up = sb_query("cbm_accounts", method="PATCH", params=f"?account_name=eq.{acc_name}", body={
                "pin_hash": p_hash,
                "salt": salt
            })
            return self._send_json(200, {"status": "ok", "message": "6-digit CBM Access PIN updated successfully."})

        # 0b. Verify CBM Access PIN
        elif path == "/api/cbm/auth/verify-pin":
            acc_name = body.get("account_name", "").strip()
            pin = body.get("pin", "").strip()

            if not acc_name or not pin:
                return self._send_json(400, {"status": "error", "message": "account_name and pin are required."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{acc_name}&select=*")
            if st != 200 or not accounts:
                return self._send_json(404, {"status": "error", "message": f"Account '{acc_name}' not found."})

            acc = accounts[0]
            if not acc.get("pin_hash"):
                return self._send_json(400, {"status": "error", "message": "No PIN configured for this account. Set a PIN first."})

            if verify_cbm_pin(acc, pin):
                return self._send_json(200, {"status": "ok", "message": "PIN verified successfully."})
            else:
                return self._send_json(401, {"status": "unauthorized", "message": "Invalid 6-digit CBM Access PIN."})

        # 1. Withdrawal Submission
        elif path == "/api/cbm/withdraw":
            account_name = body.get("account_name", "").strip()
            target_account = body.get("target_account", "").strip() or account_name
            try:
                amount_gold = int(body.get("amount_gold", 0))
            except ValueError:
                amount_gold = 0

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Invalid account_name or amount."})

            if account_name.upper() in ("TREASURY", "WAR_CHEST", "BANK", "VAULT", "RESERVES", "DDCBC"):
                return self._send_json(403, {
                    "status": "forbidden",
                    "message": "Covenant violation: Central bank reserves and war chest donations are permanent unencumbered clan capital and cannot be withdrawn or refunded."
                })

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{account_name}&select=*")
            if st != 200 or not accounts:
                return self._send_json(404, {"status": "error", "message": f"Account '{account_name}' not registered."})

            acc = accounts[0]

            # Enforce PIN verification if configured
            if acc.get("pin_hash"):
                pin = body.get("pin", "").strip()
                if not verify_cbm_pin(acc, pin):
                    return self._send_json(401, {
                        "status": "unauthorized",
                        "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."
                    })

            # Enforce Closed-Loop Destination Policy:
            # Funds can strictly only return to member's account or a verified linked payment method
            allowed_targets = [account_name.lower()]
            st_pm, pms = sb_query("cbm_payment_methods", f"?cbm_username=eq.{account_name}&status=eq.VERIFIED&select=territorial_account_name")
            if st_pm == 200 and isinstance(pms, list):
                for p in pms:
                    t_name = (p.get("territorial_account_name") or "").strip().lower()
                    if t_name and t_name not in allowed_targets:
                        allowed_targets.append(t_name)

            if target_account.lower() not in allowed_targets:
                return self._send_json(403, {
                    "status": "forbidden",
                    "message": f"Anti-Fraud Policy Violation: Withdrawals are strictly restricted to your verified account or linked payment methods. Target account '{target_account}' is not authorized."
                })

            # Verify account role status (downgraded accounts are blocked from withdrawing)
            if acc.get("role") in ("restricted", "downgraded", "delinquent"):
                return self._send_json(403, {
                    "status": "restricted",
                    "message": "Withdrawals suspended: Account access is downgraded to 'restricted' due to an outstanding overdue loan. Settle remaining debt to restore account access."
                })
            required_cents = amount_gold * 100  # Bank covers game fees (0 fee to member)
            if acc.get("deposited_cents", 0) < required_cents:
                return self._send_json(400, {
                    "status": "insufficient_funds",
                    "message": f"Available: {acc.get('deposited_cents', 0)/100.0} Gold. Required: {amount_gold} Gold."
                })

            # Insert queued withdrawal (fee_cents: 0 charged to user)
            w_payload = {
                "account_name": account_name,
                "target_account": target_account,
                "amount_gold": amount_gold,
                "fee_cents": 0,
                "status": "PENDING"
            }
            st_w, res_w = sb_query("cbm_withdrawals", method="POST", body=w_payload)
            return self._send_json(200, {
                "status": "queued",
                "message": f"Withdrawal request of {amount_gold} Gold queued (0 fees - game fee covered by Bank).",
                "details": res_w
            })

        # 2. Link Payment Method (Input Credentials or Transaction Deposit)
        elif path == "/api/cbm/link-payment-method":
            cbm_user = body.get("cbm_username", "").strip()
            v_type = body.get("verification_type", "INPUT_CREDENTIALS").strip()
            terri_acc = body.get("territorial_account", "").strip()
            terri_pass = body.get("territorial_password", "").strip()
            display_name = body.get("display_name", "").strip()
            is_primary = bool(body.get("is_primary", False))
            pin = body.get("pin", "").strip()

            if not cbm_user or not terri_acc:
                return self._send_json(400, {"status": "error", "message": "cbm_username and territorial_account are required."})

            st_u, u_accs = sb_query("cbm_accounts", f"?account_name=eq.{cbm_user}&select=*")
            if st_u == 200 and isinstance(u_accs, list) and u_accs:
                u_acc = u_accs[0]
                if u_acc.get("pin_hash"):
                    if not verify_cbm_pin(u_acc, pin):
                        return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})

            # Ensure CBM member account exists in cbm_accounts
            sb_query("cbm_accounts", method="POST", body={
                "account_name": cbm_user,
                "display_name": cbm_user,
                "clan_tag": "ANTI-OG",
                "role": "member"
            }, upsert=True)

            if v_type == "INPUT_CREDENTIALS":
                if not terri_pass:
                    return self._send_json(400, {"status": "error", "message": "Password is required for credential verification."})

                # Authenticate directly against Territorial.io Game API
                t_url = "https://territorial.io/api/account/get"
                t_payload = json.dumps({
                    "account_name": terri_acc,
                    "password": terri_pass,
                    "target_account_name": terri_acc
                }).encode("utf-8")
                t_req = urllib.request.Request(
                    t_url,
                    data=t_payload,
                    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
                    method="POST"
                )
                try:
                    with urllib.request.urlopen(t_req, timeout=7.0) as t_resp:
                        t_data = json.loads(t_resp.read().decode("utf-8"))
                        if t_data.get("status") != "ok":
                            return self._send_json(400, {"status": "error", "message": f"Territorial.io credentials rejected: {t_data.get('status')}"})
                        acc_data = t_data.get("account_data", {})
                        if not display_name:
                            display_name = acc_data.get("username", terri_acc)
                except Exception as e:
                    return self._send_json(400, {"status": "error", "message": f"Territorial.io authentication failure: {str(e)}"})

                pm_payload = {
                    "cbm_username": cbm_user,
                    "territorial_account_name": terri_acc,
                    "territorial_password": terri_pass,
                    "display_name": display_name or terri_acc,
                    "verification_type": "INPUT_CREDENTIALS",
                    "status": "VERIFIED",
                    "is_primary": is_primary
                }
                st_pm, res_pm = sb_query("cbm_payment_methods", method="POST", body=pm_payload, upsert=True)
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"Successfully verified & linked '{terri_acc}' via game credentials.",
                    "payment_method": {
                        "cbm_username": cbm_user,
                        "territorial_account_name": terri_acc,
                        "display_name": display_name or terri_acc,
                        "verification_type": "INPUT_CREDENTIALS",
                        "status": "VERIFIED",
                        "is_primary": is_primary
                    }
                })

            elif v_type == "TRANSACTION_VERIFIED":
                has_tx = False
                st_tx, tx_res = sb_query("cbm_processed_txs", f"?sender=eq.{terri_acc}&receiver=eq.{VAULT_ACCOUNT}&select=*")
                if st_tx == 200 and isinstance(tx_res, list) and len(tx_res) > 0:
                    has_tx = True
                else:
                    try:
                        l_req = urllib.request.Request("https://territorial.io/log/transactions", headers={"User-Agent": "Mozilla/5.0"})
                        with urllib.request.urlopen(l_req, timeout=6.0) as l_resp:
                            for line in l_resp.read().decode("utf-8").splitlines():
                                parts = line.strip().split(",")
                                if len(parts) >= 5 and parts[0].isdigit():
                                    s, r = parts[1], parts[2]
                                    if s.lower() == terri_acc.lower() and r.lower() == VAULT_ACCOUNT.lower():
                                        has_tx = True
                                        break
                    except Exception:
                        pass

                if not has_tx:
                    return self._send_json(400, {
                        "status": "not_verified",
                        "message": f"No confirmed inbound deposit found from '{terri_acc}' to vault '{VAULT_ACCOUNT}'. Transfer at least 1 Gold in-game to {VAULT_ACCOUNT} to link automatically without password."
                    })

                pm_payload = {
                    "cbm_username": cbm_user,
                    "territorial_account_name": terri_acc,
                    "territorial_password": None,
                    "display_name": display_name or terri_acc,
                    "verification_type": "TRANSACTION_VERIFIED",
                    "status": "VERIFIED",
                    "is_primary": is_primary
                }
                st_pm, res_pm = sb_query("cbm_payment_methods", method="POST", body=pm_payload, upsert=True)
                return self._send_json(200, {
                    "status": "ok",
                    "message": f"Successfully verified & linked '{terri_acc}' via confirmed deposit history.",
                    "payment_method": {
                        "cbm_username": cbm_user,
                        "territorial_account_name": terri_acc,
                        "display_name": display_name or terri_acc,
                        "verification_type": "TRANSACTION_VERIFIED",
                        "status": "VERIFIED",
                        "is_primary": is_primary
                    }
                })

            else:
                return self._send_json(400, {"status": "error", "message": f"Unknown verification_type '{v_type}'."})

        # 3. Update CBM Account Profile (Display Name & Required Profile Picture)
        elif path == "/api/cbm/profile":
            account_name = body.get("account_name", "").strip()
            display_name = body.get("display_name", "").strip()
            avatar_url = body.get("avatar_url", "").strip()
            pin = body.get("pin", "").strip()

            if not account_name:
                return self._send_json(400, {"status": "error", "message": "Account name is required."})
            if not display_name:
                return self._send_json(400, {"status": "error", "message": "Display name cannot be empty."})
            if not avatar_url:
                return self._send_json(400, {"status": "error", "message": "A profile picture URL is required for member authenticity."})

            # Check / ensure account exists in Supabase
            st_acc, accounts = sb_query("cbm_accounts", f"?account_name=eq.{account_name}&select=*")
            if st_acc == 200 and isinstance(accounts, list) and accounts:
                acc = accounts[0]
                if acc.get("pin_hash"):
                    if not verify_cbm_pin(acc, pin):
                        return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
                sb_query("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={
                    "display_name": display_name,
                    "avatar_url": avatar_url
                })
            else:
                sb_query("cbm_accounts", method="POST", body={
                    "account_name": account_name,
                    "display_name": display_name,
                    "avatar_url": avatar_url,
                    "clan_tag": "ANTI-OG",
                    "role": "member"
                }, upsert=True)

            return self._send_json(200, {
                "status": "ok",
                "message": "Account profile updated successfully.",
                "profile": {
                    "account_name": account_name,
                    "display_name": display_name,
                    "avatar_url": avatar_url
                }
            })

        # 4. War Chest / Treasury Donation
        elif path == "/api/cbm/donate":
            account_name = body.get("account_name", "").strip()
            message = body.get("message", "").strip()
            territorial_account = body.get("territorial_account", "").strip()
            pin = body.get("pin", "").strip()
            try:
                amount_gold = float(body.get("amount_gold", 0))
            except (ValueError, TypeError):
                amount_gold = 0.0

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Valid account_name and amount_gold are required."})

            st_acc, accounts = sb_query("cbm_accounts", f"?account_name=eq.{account_name}&select=*")
            if st_acc != 200 or not accounts:
                return self._send_json(404, {"status": "error", "message": f"Account '{account_name}' not registered in CBM."})

            acc = accounts[0]
            if acc.get("pin_hash"):
                if not verify_cbm_pin(acc, pin):
                    return self._send_json(401, {"status": "unauthorized", "message": "Authentication Required: Invalid or missing 6-digit CBM Access PIN."})
            amount_cents = int(round(amount_gold * 100))
            curr_bal = int(acc.get("deposited_cents", 0))

            if curr_bal < amount_cents:
                return self._send_json(400, {
                    "status": "insufficient_funds",
                    "message": f"Insufficient funds: Available balance is {curr_bal/100.0:.2f} Gold, requested donation is {amount_gold:.2f} Gold."
                })

            # Loan safety buffer check
            st_ln, loans = sb_query("cbm_loans", f"?account_name=eq.{account_name}&select=*")
            if st_ln == 200 and isinstance(loans, list):
                unpaid_loans = [l for l in loans if l.get("status") in ("ACTIVE", "OVERDUE", "PENDING")]
                if unpaid_loans and (curr_bal - amount_cents < 2000):
                    return self._send_json(400, {
                        "status": "buffer_protection",
                        "message": "Protected buffer rule: Accounts with active loans must retain at least 20.00 Gold to prevent nightly game account deletion."
                    })

            new_bal = curr_bal - amount_cents
            now = time.time()
            tx_hash = f"warchest_{account_name}_{int(now)}"
            clean_msg = message.strip() if message else "Anti-OG Clan War Chest Contribution"
            donor_name = acc.get("display_name") or account_name

            # Update account balance
            sb_query("cbm_accounts", method="PATCH", params=f"?account_name=eq.{account_name}", body={"deposited_cents": new_bal})

            # Record in ledger
            sb_query("cbm_ledger", method="POST", body={
                "account_name": account_name,
                "entry_type": "TREASURY_DONATION",
                "amount_cents": -amount_cents,
                "balance_after_cents": new_bal,
                "tx_hash": tx_hash,
                "notes": f"Clan War Chest Donation: {amount_gold:.2f} Gold. {clean_msg}".strip()
            })

            # Record in cbm_donations
            sb_query("cbm_donations", method="POST", body={
                "donor_name": donor_name,
                "territorial_account": territorial_account or account_name,
                "amount_gold": round(amount_gold, 2),
                "amount_cents": amount_cents,
                "message": clean_msg,
                "source": "BALANCE",
                "tx_hash": tx_hash,
                "is_refundable": False,
                "status": "IRREVOCABLE"
            })

            # Recalculate reserves in cbm_treasury: decrement liabilities, increment bank reserves
            st_tr, tr_list = sb_query("cbm_treasury", "?id=eq.1&select=*")
            if st_tr == 200 and isinstance(tr_list, list) and tr_list:
                tr = tr_list[0]
                new_liab = max(0, int(tr.get("member_liabilities_cents", 0)) - amount_cents)
                new_reserves = max(0, int(tr.get("vault_total_gold_cents", 0)) - new_liab)
                sb_query("cbm_treasury", method="PATCH", params="?id=eq.1", body={
                    "member_liabilities_cents": new_liab,
                    "bank_reserves_cents": new_reserves
                })

            return self._send_json(200, {
                "status": "ok",
                "message": f"Successfully contributed {amount_gold:.2f} Gold to the Clan War Chest!",
                "donation": {
                    "donor_name": donor_name,
                    "account_name": account_name,
                    "amount_gold": round(amount_gold, 2),
                    "new_balance_gold": round(new_bal / 100.0, 2),
                    "message": clean_msg,
                    "tx_hash": tx_hash
                }
            })

        return self._send_json(404, {"status": "error", "message": "Endpoint not found."})
