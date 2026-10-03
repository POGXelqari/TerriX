#!/usr/bin/env python3
"""
CBM AutoMod - Guild Configuration & Audit Storage
=================================================
Thread-safe SQLite storage with memory caching for sub-millisecond lookups
during live Discord chat events.
"""

import os
import sys
import json
import time
import uuid
import sqlite3
import threading
from typing import Dict, Any, Optional, List


class AutoModDB:
    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = db_path
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.dirname(base_dir)
            # Default to cbm_data.db in parent workspace or local
            cand1 = os.path.join(parent_dir, "cbm_data.db")
            cand2 = os.path.join(base_dir, "cbm_data.db")
            self.db_path = cand1 if os.path.exists(cand1) else cand2

        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_db(self):
        with self._lock:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cbm_automod_guilds (
                    guild_id TEXT PRIMARY KEY,
                    log_channel_id TEXT NOT NULL,
                    ignored_channels TEXT DEFAULT '[]',
                    is_active INTEGER DEFAULT 1,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_automod_guilds ON cbm_automod_guilds(guild_id);")

            cur.execute("""
                CREATE TABLE IF NOT EXISTS cbm_automod_audit_logs (
                    incident_id TEXT PRIMARY KEY,
                    guild_id TEXT NOT NULL,
                    channel_id TEXT NOT NULL,
                    author_id TEXT NOT NULL,
                    author_tag TEXT NOT NULL,
                    content_snippet TEXT NOT NULL,
                    violation_categories TEXT NOT NULL,
                    detection_layer TEXT NOT NULL,
                    execution_time_ms REAL NOT NULL,
                    attachments_count INTEGER DEFAULT 0,
                    action_taken TEXT DEFAULT 'SILENT_PURGE',
                    created_at REAL NOT NULL
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_automod_audit_guild ON cbm_automod_audit_logs(guild_id, created_at DESC);")
            conn.commit()
            conn.close()

    def get_guild_config(self, guild_id: int) -> Optional[Dict[str, Any]]:
        gid = str(guild_id)
        with self._lock:
            if gid in self._cache:
                return self._cache[gid].copy()

        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT log_channel_id, ignored_channels, is_active FROM cbm_automod_guilds WHERE guild_id = ?",
            (gid,)
        )
        row = cur.fetchone()
        conn.close()

        if row:
            raw_ignored = row[1] or "[]"
            try:
                parsed_ignored = [int(x) for x in json.loads(raw_ignored)]
            except Exception:
                parsed_ignored = []

            cfg = {
                "log_channel_id": int(row[0]),
                "ignored_channels": parsed_ignored,
                "is_active": bool(row[2])
            }
            with self._lock:
                self._cache[gid] = cfg
            return cfg.copy()
        return None

    def set_guild_config(
        self,
        guild_id: int,
        log_channel_id: int,
        ignored_channels: Optional[List[int]] = None
    ) -> None:
        gid = str(guild_id)
        clean_ignored = sorted(list(set(int(x) for x in (ignored_channels or []))))
        ignored_json = json.dumps([str(x) for x in clean_ignored])
        now = time.time()

        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_automod_guilds (guild_id, log_channel_id, ignored_channels, is_active, created_at, updated_at)
            VALUES (?, ?, ?, 1, ?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET
                log_channel_id = excluded.log_channel_id,
                ignored_channels = excluded.ignored_channels,
                is_active = 1,
                updated_at = excluded.updated_at
        """, (gid, str(log_channel_id), ignored_json, now, now))
        conn.commit()
        conn.close()

        with self._lock:
            self._cache[gid] = {
                "log_channel_id": int(log_channel_id),
                "ignored_channels": clean_ignored,
                "is_active": True
            }

    def remove_ignored_channel(self, guild_id: int, channel_id: int) -> bool:
        cfg = self.get_guild_config(guild_id)
        if not cfg:
            return False

        ignored = cfg.get("ignored_channels", [])
        target_cid = int(channel_id)
        if target_cid not in ignored:
            return False

        ignored.remove(target_cid)
        self.set_guild_config(guild_id, cfg["log_channel_id"], ignored)
        return True

    def record_audit_log(
        self,
        guild_id: int,
        channel_id: int,
        author_id: int,
        author_tag: str,
        content_snippet: str,
        violation_categories: List[str],
        detection_layer: str,
        execution_time_ms: float,
        attachments_count: int = 0,
        action_taken: str = "SILENT_PURGE"
    ) -> str:
        incident_id = f"inc_{uuid.uuid4().hex[:12]}"
        now = time.time()
        cat_json = json.dumps(violation_categories or [])

        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_automod_audit_logs (
                incident_id, guild_id, channel_id, author_id, author_tag,
                content_snippet, violation_categories, detection_layer,
                execution_time_ms, attachments_count, action_taken, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident_id, str(guild_id), str(channel_id), str(author_id),
            (author_tag or "Unknown"), (content_snippet or "")[:1500],
            cat_json, detection_layer, round(float(execution_time_ms), 2),
            int(attachments_count), action_taken, now
        ))
        conn.commit()
        conn.close()
        return incident_id

    def get_audit_logs(self, guild_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT incident_id, channel_id, author_id, author_tag,
                   content_snippet, violation_categories, detection_layer,
                   execution_time_ms, attachments_count, action_taken, created_at
            FROM cbm_automod_audit_logs
            WHERE guild_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (str(guild_id), limit))
        rows = cur.fetchall()
        conn.close()

        results = []
        for r in rows:
            try:
                cats = json.loads(r[5])
            except Exception:
                cats = []
            results.append({
                "incident_id": r[0],
                "channel_id": int(r[1]),
                "author_id": int(r[2]),
                "author_tag": r[3],
                "content_snippet": r[4],
                "violation_categories": cats,
                "detection_layer": r[6],
                "execution_time_ms": float(r[7]),
                "attachments_count": int(r[8]),
                "action_taken": r[9],
                "created_at": float(r[10])
            })
        return results
