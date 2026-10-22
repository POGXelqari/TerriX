#!/usr/bin/env python3
"""
CBM AutoMod - Guild Configuration, Rules & 7-Day TTL Punishment Storage
======================================================================
Thread-safe SQLite storage with memory caching for sub-millisecond lookups
during live Discord chat events. Supports custom guild rules and permanent
purging of warnings/punishments after 7-day expiration.
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
                    rules_channel_id TEXT DEFAULT NULL,
                    rules_text TEXT DEFAULT '',
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_cbm_automod_guilds ON cbm_automod_guilds(guild_id);")

            # Column migrations for existing databases
            try:
                cur.execute("ALTER TABLE cbm_automod_guilds ADD COLUMN rules_channel_id TEXT DEFAULT NULL;")
            except Exception:
                pass
            try:
                cur.execute("ALTER TABLE cbm_automod_guilds ADD COLUMN rules_text TEXT DEFAULT '';")
            except Exception:
                pass

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

            cur.execute("""
                CREATE TABLE IF NOT EXISTS cbm_automod_punishments (
                    punishment_id TEXT PRIMARY KEY,
                    guild_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    user_tag TEXT NOT NULL,
                    channel_id TEXT NOT NULL,
                    offense_index INTEGER NOT NULL,
                    punishment_stage TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    violation_categories TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    expires_at REAL NOT NULL
                );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_automod_punish_user ON cbm_automod_punishments(guild_id, user_id, expires_at);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_automod_punish_expiry ON cbm_automod_punishments(expires_at);")

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
            "SELECT log_channel_id, ignored_channels, is_active, rules_channel_id, rules_text FROM cbm_automod_guilds WHERE guild_id = ?",
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
                "is_active": bool(row[2]),
                "rules_channel_id": int(row[3]) if row[3] else None,
                "rules_text": str(row[4] or "")
            }
            with self._lock:
                self._cache[gid] = cfg
            return cfg.copy()
        return None

    def set_guild_config(
        self,
        guild_id: int,
        log_channel_id: int,
        ignored_channels: Optional[List[int]] = None,
        rules_channel_id: Optional[int] = None,
        rules_text: Optional[str] = None
    ) -> None:
        gid = str(guild_id)
        clean_ignored = sorted(list(set(int(x) for x in (ignored_channels or []))))
        ignored_json = json.dumps([str(x) for x in clean_ignored])
        now = time.time()

        existing = self.get_guild_config(guild_id)
        final_rules_cid = str(rules_channel_id) if rules_channel_id is not None else (str(existing["rules_channel_id"]) if existing and existing.get("rules_channel_id") else None)
        final_rules_text = rules_text if rules_text is not None else (existing.get("rules_text", "") if existing else "")

        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_automod_guilds (guild_id, log_channel_id, ignored_channels, is_active, rules_channel_id, rules_text, created_at, updated_at)
            VALUES (?, ?, ?, 1, ?, ?, ?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET
                log_channel_id = excluded.log_channel_id,
                ignored_channels = excluded.ignored_channels,
                is_active = 1,
                rules_channel_id = excluded.rules_channel_id,
                rules_text = excluded.rules_text,
                updated_at = excluded.updated_at
        """, (gid, str(log_channel_id), ignored_json, final_rules_cid, final_rules_text, now, now))
        conn.commit()
        conn.close()

        with self._lock:
            self._cache[gid] = {
                "log_channel_id": int(log_channel_id),
                "ignored_channels": clean_ignored,
                "is_active": True,
                "rules_channel_id": int(final_rules_cid) if final_rules_cid else None,
                "rules_text": final_rules_text
            }

    def set_guild_rules(self, guild_id: int, rules_text: str, rules_channel_id: Optional[int] = None) -> None:
        cfg = self.get_guild_config(guild_id)
        log_cid = cfg["log_channel_id"] if cfg else 0
        ignored = cfg.get("ignored_channels", []) if cfg else []
        self.set_guild_config(guild_id, log_cid, ignored, rules_channel_id=rules_channel_id, rules_text=rules_text)

    def get_guild_rules(self, guild_id: int) -> str:
        cfg = self.get_guild_config(guild_id)
        if cfg and cfg.get("rules_text"):
            return cfg["rules_text"]
        return ""

    def remove_ignored_channel(self, guild_id: int, channel_id: int) -> bool:
        cfg = self.get_guild_config(guild_id)
        if not cfg:
            return False

        ignored = cfg.get("ignored_channels", [])
        target_cid = int(channel_id)
        if target_cid not in ignored:
            return False

        ignored.remove(target_cid)
        self.set_guild_config(
            guild_id,
            cfg["log_channel_id"],
            ignored,
            rules_channel_id=cfg.get("rules_channel_id"),
            rules_text=cfg.get("rules_text", "")
        )
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

    def purge_expired_punishments(self) -> int:
        """Permanently purges punishment logs and warnings after 7-day expiration."""
        now = time.time()
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM cbm_automod_punishments WHERE expires_at <= ?", (now,))
        deleted = cur.rowcount
        conn.commit()
        conn.close()
        return deleted

    def get_active_offense_count(self, guild_id: int, user_id: int) -> int:
        """Returns the number of active, non-expired offenses for a user in the rolling 7-day window."""
        self.purge_expired_punishments()
        now = time.time()
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT COUNT(*) FROM cbm_automod_punishments WHERE guild_id = ? AND user_id = ? AND expires_at > ?",
            (str(guild_id), str(user_id), now)
        )
        row = cur.fetchone()
        conn.close()
        return int(row[0]) if row else 0

    def record_punishment(
        self,
        guild_id: int,
        user_id: int,
        user_tag: str,
        channel_id: int,
        offense_index: int,
        punishment_stage: str,
        reason: str,
        violation_categories: List[str],
        ttl_seconds: float = 7 * 86400.0  # 7 days
    ) -> str:
        """Records a punishment with an explicit 7-day expiration timestamp."""
        punishment_id = f"pun_{uuid.uuid4().hex[:12]}"
        now = time.time()
        expires_at = now + ttl_seconds
        cat_json = json.dumps(violation_categories or [])

        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO cbm_automod_punishments (
                punishment_id, guild_id, user_id, user_tag, channel_id,
                offense_index, punishment_stage, reason, violation_categories,
                created_at, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            punishment_id, str(guild_id), str(user_id), str(user_tag or "Unknown"),
            str(channel_id), int(offense_index), str(punishment_stage),
            str(reason or "")[:1000], cat_json, now, expires_at
        ))
        conn.commit()
        conn.close()
        return punishment_id

    def get_active_punishments(self, guild_id: int, user_id: int) -> List[Dict[str, Any]]:
        """Returns active punishment records for a user ordered by creation time."""
        self.purge_expired_punishments()
        now = time.time()
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT punishment_id, channel_id, offense_index, punishment_stage,
                   reason, violation_categories, created_at, expires_at
            FROM cbm_automod_punishments
            WHERE guild_id = ? AND user_id = ? AND expires_at > ?
            ORDER BY created_at ASC
        """, (str(guild_id), str(user_id), now))
        rows = cur.fetchall()
        conn.close()

        records = []
        for r in rows:
            try:
                cats = json.loads(r[5])
            except Exception:
                cats = []
            records.append({
                "punishment_id": r[0],
                "channel_id": int(r[1]),
                "offense_index": int(r[2]),
                "punishment_stage": r[3],
                "reason": r[4],
                "violation_categories": cats,
                "created_at": float(r[6]),
                "expires_at": float(r[7]),
                "remaining_seconds": max(0.0, float(r[7]) - now)
            })
        return records
