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
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

# Environmental credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_KEY")
    or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or ""
)
VAULT_ACCOUNT = os.environ.get("CBM_VAULT_ACCOUNT", "DdcBC")

def sb_query(table: str, params: str = "", method: str = "GET", body: dict = None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return 500, {"error": "Supabase credentials not configured in environment"}
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
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
            t_data = treasury[0] if (st == 200 and isinstance(treasury, list) and treasury) else {
                "vault_account_name": VAULT_ACCOUNT,
                "vault_total_gold_cents": 5646,
                "member_liabilities_cents": 0,
                "bank_reserves_cents": 5646
            }

            vault_gold = t_data.get("vault_total_gold_cents", 0) / 100.0
            liab_gold = t_data.get("member_liabilities_cents", 0) / 100.0
            reserves_gold = t_data.get("bank_reserves_cents", 0) / 100.0
            reserves_cents = t_data.get("bank_reserves_cents", 0)

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
                    "bank_reserves_gold": reserves_gold,
                    "solvency_ratio_percent": solvency_ratio,
                    "last_sync": t_data.get("last_sync_at")
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
                # Fetch recent ledger entries
                st_l, ledger = sb_query("cbm_ledger", f"?account_name=eq.{acc_name}&order=created_at.desc&limit=20&select=*")
                return self._send_json(200, {
                    "status": "ok",
                    "account": {
                        "account_name": acc.get("account_name"),
                        "display_name": acc.get("display_name"),
                        "clan_tag": acc.get("clan_tag"),
                        "role": acc.get("role"),
                        "deposited_gold": acc.get("deposited_cents", 0) / 100.0,
                        "total_deposited_gold": acc.get("total_deposited_cents", 0) / 100.0,
                        "total_withdrawn_gold": acc.get("total_withdrawn_cents", 0) / 100.0,
                    },
                    "statement": ledger if st_l == 200 and isinstance(ledger, list) else []
                })
            else:
                return self._send_json(404, {
                    "status": "not_found",
                    "message": f"Account '{acc_name}' has no active CBM deposit balance."
                })

        return self._send_json(404, {"status": "error", "message": "Endpoint not found."})

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(raw_body)
        except Exception:
            return self._send_json(400, {"status": "error", "message": "Invalid JSON payload."})

        # 1. Withdrawal Submission
        if path == "/api/cbm/withdraw":
            account_name = body.get("account_name", "").strip()
            target_account = body.get("target_account", "").strip() or account_name
            try:
                amount_gold = int(body.get("amount_gold", 0))
            except ValueError:
                amount_gold = 0

            if not account_name or amount_gold <= 0:
                return self._send_json(400, {"status": "error", "message": "Invalid account_name or amount."})

            st, accounts = sb_query("cbm_accounts", f"?account_name=eq.{account_name}&select=*")
            if st != 200 or not accounts:
                return self._send_json(404, {"status": "error", "message": f"Account '{account_name}' not registered."})

            acc = accounts[0]
            required_cents = amount_gold * 100 + 1
            if acc.get("deposited_cents", 0) < required_cents:
                return self._send_json(400, {
                    "status": "insufficient_funds",
                    "message": f"Available: {acc.get('deposited_cents', 0)/100.0} Gold. Required: {amount_gold + 0.01} Gold."
                })

            # Insert queued withdrawal
            w_payload = {
                "account_name": account_name,
                "target_account": target_account,
                "amount_gold": amount_gold,
                "fee_cents": 1,
                "status": "PENDING"
            }
            st_w, res_w = sb_query("cbm_withdrawals", method="POST", body=w_payload)
            return self._send_json(200, {
                "status": "queued",
                "message": f"Withdrawal request of {amount_gold} Gold queued for disbursement.",
                "details": res_w
            })

        return self._send_json(404, {"status": "error", "message": "Endpoint not found."})
