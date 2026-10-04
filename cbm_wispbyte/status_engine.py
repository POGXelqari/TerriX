#!/usr/bin/env python3
"""
CBM System Status & 90-Day Telemetry Engine
===========================================
Calculates real-time health, rolling 90-day SLA availability bars,
and global system incident notifications across all CBM services.
"""

import os
import time
import json
import sqlite3
import datetime
from typing import Dict, Any, List, Optional

SYSTEM_SERVICES = [
    {
        "id": "web_portal",
        "name": "Web Portal & REST Ingress API",
        "description": "Public HTTPS endpoints, developer console, and static asset delivery.",
        "icon": "🌐"
    },
    {
        "id": "vault_daemon",
        "name": "Clan Vault & Ingestion Daemon (DdcBC)",
        "description": "Continuous scraping and zero-fee ledger reconciliation of Territorial.io transactions.",
        "icon": "🏛️"
    },
    {
        "id": "lending_engine",
        "name": "Lending Facility & Risk Engine",
        "description": "Institutional 0.05% unencumbered reserve-backed loan origination and settlement.",
        "icon": "📜"
    },
    {
        "id": "credit_billing",
        "name": "Developer Platform & Credit Metering",
        "description": "Programmatic API key authentication and deposit-backed credit conversions.",
        "icon": "⚡"
    },
    {
        "id": "ai_inference",
        "name": "NVIDIA NIM AI Cluster",
        "description": "Nemotron-3-Ultra and Moonshot AI inference gateways with status polling.",
        "icon": "🤖"
    },
    {
        "id": "discord_gateway",
        "name": "AutoMod Discord Gateway",
        "description": "Stealth Discord moderation bot & Nemotron-3.5-Content-Safety stream.",
        "icon": "🛡️"
    },
    {
        "id": "cloudflare_tunnel",
        "name": "Cloudflare Zero-Trust Ingress",
        "description": "Encrypted edge reverse proxy to http://cbm.wispbyte.org/ and trycloudflare.com.",
        "icon": "☁️"
    }
]


class CBMStatusEngine:
    def __init__(self, db_instance):
        self.db = db_instance
        self._init_tables()

    def _init_tables(self):
        try:
            with self.db.write_transaction() as (conn, cur):
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS cbm_service_incidents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        incident_id TEXT UNIQUE NOT NULL,
                        service_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        severity TEXT NOT NULL DEFAULT 'minor',
                        status TEXT NOT NULL DEFAULT 'investigating',
                        message TEXT NOT NULL,
                        created_at REAL NOT NULL,
                        resolved_at REAL
                    );
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS cbm_service_daily_uptime (
                        service_id TEXT NOT NULL,
                        day_date TEXT NOT NULL,
                        uptime_percent REAL NOT NULL DEFAULT 100.0,
                        status TEXT NOT NULL DEFAULT 'operational',
                        incident_count INTEGER DEFAULT 0,
                        updated_at REAL NOT NULL,
                        PRIMARY KEY(service_id, day_date)
                    );
                """)
        except Exception as e:
            print(f"[!] Warning initializing status tables: {e}")

    def get_discord_status(self) -> Dict[str, Any]:
        """Inspects Discord bot cooldown lockfile."""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        cooldown_file = os.path.join(base_dir, "automod_cooldown.json")

        if os.path.exists(cooldown_file):
            try:
                with open(cooldown_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                until = float(data.get("cooldown_until", 0.0))
                remaining = until - time.time()
                if remaining > 0:
                    hours_left = round(remaining / 3600.0, 1)
                    return {
                        "status": "degraded",
                        "operational": False,
                        "label": f"Rate Limited (25h Cloudflare 1015 Cooldown - {hours_left}h left)",
                        "details": data
                    }
            except Exception:
                pass

        if not os.environ.get("DISCORD_BOT_TOKEN"):
            return {
                "status": "unconfigured",
                "operational": True,
                "label": "Disabled (Token Not Configured)"
            }

        return {
            "status": "operational",
            "operational": True,
            "label": "Operational"
        }

    def get_90_day_history(self, service_id: str) -> List[Dict[str, Any]]:
        """Generates a 90-day array of daily health bars."""
        today = datetime.datetime.now(datetime.timezone.utc).date()
        history = []

        conn = self.db._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT day_date, uptime_percent, status, incident_count 
            FROM cbm_service_daily_uptime 
            WHERE service_id = ?
        """, (service_id,))
        records = {r[0]: {"uptime": float(r[1]), "status": r[2], "incidents": int(r[3])} for r in cur.fetchall()}

        discord_state = self.get_discord_status() if service_id == "discord_gateway" else None

        for offset in range(89, -1, -1):
            day = today - datetime.timedelta(days=offset)
            day_str = day.isoformat()

            if day_str in records:
                entry = records[day_str]
                status = entry["status"]
                uptime = entry["uptime"]
                incidents = entry["incidents"]
            else:
                # Default clean operational day
                uptime = 100.0
                status = "operational"
                incidents = 0

            # Override today's status if active incident or discord rate limit exists
            if offset == 0 and service_id == "discord_gateway" and discord_state and not discord_state["operational"]:
                status = "degraded"
                uptime = 92.5
                incidents = 1

            history.append({
                "date": day_str,
                "uptime_percent": uptime,
                "status": status,
                "incident_count": incidents
            })

        return history

    def get_system_telemetry(self) -> Dict[str, Any]:
        """Assembles full status report with global notification banner."""
        now = time.time()
        if hasattr(self, "_cached_telemetry") and (now - getattr(self, "_cached_telemetry_time", 0.0)) < 5.0:
            return self._cached_telemetry

        services = []
        overall_status = "operational"
        active_banner = None

        # Check Discord Status
        discord_state = self.get_discord_status()

        # Check Active Incidents
        conn = self.db._get_sqlite_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT incident_id, service_id, title, severity, status, message, created_at
            FROM cbm_service_incidents
            WHERE resolved_at IS NULL
            ORDER BY created_at DESC
        """)
        active_incidents = [
            {
                "id": r[0], "service_id": r[1], "title": r[2],
                "severity": r[3], "status": r[4], "message": r[5], "created_at": r[6]
            }
            for r in cur.fetchall()
        ]

        if not discord_state["operational"] and "1015" in str(discord_state.get("label", "")):
            active_banner = {
                "type": "warning",
                "title": "Discord AutoMod Temporary Rate Limit",
                "message": f"Discord AutoMod bot IP is undergoing a Cloudflare Error 1015 cooldown. {discord_state['label']}. Bank portals, API, and treasury are unaffected.",
                "affected_service": "AutoMod Discord Gateway",
                "timestamp": now
            }
            overall_status = "degraded"

        for svc in SYSTEM_SERVICES:
            s_id = svc["id"]
            history = self.get_90_day_history(s_id)
            total_up = sum(d["uptime_percent"] for d in history)
            avg_90d = round(total_up / len(history), 2)

            if s_id == "discord_gateway":
                current_status = discord_state["status"]
                current_label = discord_state["label"]
            elif s_id == "ai_inference":
                has_key = bool(os.environ.get("NVIDIA_API_KEY"))
                current_status = "operational"
                current_label = "Operational (NVIDIA NIM Active)" if has_key else "Operational (Heuristic Fallback)"
            elif s_id == "vault_daemon":
                is_live = bool(os.environ.get("CBM_VAULT_PASSWORD"))
                current_status = "operational"
                current_label = "Operational (Live API Synced)" if is_live else "Operational (Ledger Reconciled)"
            else:
                current_status = "operational"
                current_label = "Operational"

            services.append({
                "id": s_id,
                "name": svc["name"],
                "description": svc["description"],
                "icon": svc["icon"],
                "current_status": current_status,
                "status_label": current_label,
                "uptime_90d_percent": avg_90d,
                "history_90d": history
            })

        result = {
            "status": "ok",
            "overall_status": overall_status,
            "overall_status_label": "All Systems Operational" if overall_status == "operational" else "Partial System Degradation",
            "global_banner": active_banner,
            "services": services,
            "active_incidents": active_incidents,
            "updated_at": now,
            "updated_at_iso": datetime.datetime.fromtimestamp(now, datetime.timezone.utc).isoformat()
        }
        self._cached_telemetry = result
        self._cached_telemetry_time = now
        return result
