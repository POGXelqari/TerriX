#!/usr/bin/env python3
"""
CBM Temporary Disposable Chatroom Engine
========================================
High-performance, ephemeral in-memory chat engine for Territorial.io in-match
communication and CBM Developer Platform integrations.

Key Guarantees:
1. Disposable Lifecycle: Permanent deletion of room, messages, and uploaded
   attachments upon session conclusion or TTL expiration.
2. Max 100 Messages FIFO Window: Ring buffer (collections.deque(maxlen=100)).
3. Tight Impenetrable Moderation:
   - Profanity, slur, and toxic pattern normalizer & filter
   - SSRF-protected, size-limited OpenGraph URL metadata scraper
   - Magic-byte validation and extension blacklisting for media attachments
   - Token-bucket rate limiting and anti-spam duplicate prevention
   - Strict XSS escaping & URI sanitization
4. Rich Media & Sticker Limits:
   - Static/Animated Images (max 4 MB)
   - Videos (max 10 MB)
   - Documents/Files (max 5 MB)
   - Built-in static & animated stickers/emojis
"""

import os
import re
import time
import html
import uuid
import shutil
import socket
import urllib.parse
import urllib.request
import threading
from collections import deque
from typing import Dict, Any, List, Optional, Tuple

# Configuration & Limits
MAX_MESSAGES_WINDOW = 100
MAX_CONTENT_LENGTH = 500
MAX_IMAGE_BYTES = 4 * 1024 * 1024       # 4 MB
MAX_VIDEO_BYTES = 10 * 1024 * 1024      # 10 MB
MAX_FILE_BYTES = 5 * 1024 * 1024        # 5 MB
ROOM_IDLE_TIMEOUT_SECONDS = 30 * 60     # 30 minutes idle TTL
RATE_LIMIT_WINDOW = 3.0                 # seconds
RATE_LIMIT_MAX_MESSAGES = 4             # messages per window
MAX_CUSTOM_STICKERS_PER_ROOM = 50       # Max temporary UGC stickers per room
MAX_STICKER_IMAGE_BYTES = 512 * 1024    # 512 KB max per UGC sticker image

# Ephemeral storage directory for disposable media attachments
BASE_TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ephemeral_chat_media")

# Impenetrable Moderation: Toxic & Slur Patterns (Normalized)
_SLUR_PATTERNS = [
    r"\bn+[i1l]+g+[e3a4r]+s?\b",
    r"\bf+[a4]+g+[o0e3i1l]*t*s?\b",
    r"\bk+[i1l]+k+[e3]+s?\b",
    r"\bc+[u4]+n+t+s?\b",
    r"\br+[e3]+t+[a4]+r+d+[s]?\b",
    r"\bch+[i1l]+n+k+s?\b",
    r"\bsp+[i1l]+c+s?\b",
    r"\bg+[o0]+o+k+s?\b",
    r"\bk\s*y\s*s\b",
    r"\bkill\s+your\s*self\b",
]
_COMPILED_SLURS = [re.compile(p, re.IGNORECASE) for p in _SLUR_PATTERNS]

# Malicious / IP Logger / Phishing Domain Blacklist
_BLOCKED_DOMAINS = {
    "grabify.link", "iplogger.org", "iplogger.com", "2no.co", "yip.su",
    "iplis.ru", "02ip.ru", "ezstat.ru", "ps3cfw.com", "anon.to",
    "discorcl.com", "discord-nitro.com", "dlscord.org", "steamcommunnity.com",
    "steamcommuniity.com", "roblx.com", "free-robux.com"
}

# Dangerous File Extensions (Never Allowed)
_FORBIDDEN_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".php", ".phtml", ".js", ".mjs",
    ".vbs", ".ps1", ".py", ".pyw", ".jar", ".scr", ".msi", ".dll", ".com",
    ".hta", ".cpl", ".reg", ".wsf", ".svg"  # SVG excluded to prevent XML/XSS script execution
}

# Allowed MIME prefixes and extensions
_ALLOWED_MEDIA = {
    "image": {
        "extensions": {".png", ".jpg", ".jpeg", ".webp", ".gif"},
        "max_size": MAX_IMAGE_BYTES
    },
    "video": {
        "extensions": {".mp4", ".webm"},
        "max_size": MAX_VIDEO_BYTES
    },
    "file": {
        "extensions": {".txt", ".pdf", ".json", ".zip", ".csv"},
        "max_size": MAX_FILE_BYTES
    }
}

# Custom Stickers & Emojis Catalog
CUSTOM_STICKERS = {
    ":gold:": {"code": ":gold:", "name": "Gold Bar", "icon": "🧈", "category": "fintech"},
    ":crown:": {"code": ":crown:", "name": "Imperial Crown", "icon": "👑", "category": "status"},
    ":fire:": {"code": ":fire:", "name": "Fire Strike", "icon": "🔥", "category": "action"},
    ":gg:": {"code": ":gg:", "name": "Good Game", "icon": "🤝", "category": "social"},
    ":peace:": {"code": ":peace:", "name": "Non-Aggression Pact", "icon": "🕊️", "category": "diplomacy"},
    ":swords:": {"code": ":swords:", "name": "Full Invasion", "icon": "⚔️", "category": "combat"},
    ":shield:": {"code": ":shield:", "name": "Bank Reserve Defense", "icon": "🛡️", "category": "combat"},
    ":skull:": {"code": ":skull:", "name": "Player Out", "icon": "💀", "category": "combat"},
    ":salute:": {"code": ":salute:", "name": "Clan Salute", "icon": "🫡", "category": "status"},
    ":popcorn:": {"code": ":popcorn:", "name": "Spectating Conflict", "icon": "🍿", "category": "social"},
    ":100:": {"code": ":100:", "name": "Perfection", "icon": "💯", "category": "status"},
    ":flex:": {"code": ":flex:", "name": "Territory Flex", "icon": "💪", "category": "status"}
}


import unicodedata

# Cyrillic and symbol homoglyphs used in obfuscation
_HOMOGLYPH_MAP = {
    'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y',
    'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w',
    'α': 'a', 'β': 'b', 'γ': 'y', 'ε': 'e', 'ι': 'i', 'κ': 'k', 'ο': 'o', 'ρ': 'p', 'τ': 't', 'υ': 'u',
    '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '|': 'i', '0': 'o',
    '$': 's', '5': 's', '7': 't', '+': 't', '8': 'b', 'v': 'u'
}

def normalize_text_for_moderation(text: str) -> str:
    """Substitutes zero-width characters, homoglyphs, and 1337-speak for impenetrable slur detection."""
    # Strip zero-width characters and soft hyphens
    t = re.sub(r'[\u200b-\u200f\ufeff\u00ad\u202a-\u202e]', '', text)
    # Decompose unicode accents
    t = unicodedata.normalize('NFKD', t)
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    
    # Map homoglyphs
    for src, dst in _HOMOGLYPH_MAP.items():
        t = t.replace(src, dst)
        
    # Strip interior whitespace and non-alphanumeric punctuation to catch spaced slurs
    t_compressed = re.sub(r'[^a-z0-9]', '', t)
    
    # Collapse isolated single characters separated by spaces (e.g. "k y s now" -> "kys now")
    t_collapsed = t
    for _ in range(10):
        prev = t_collapsed
        t_collapsed = re.sub(r'(?<=\b[a-z])\s+(?=[a-z]\b)', '', t_collapsed)
        if t_collapsed == prev:
            break

    return t + " " + t_collapsed + " " + t_compressed


def is_toxic_content(text: str) -> Tuple[bool, str]:
    """Inspects text against compiled slur and toxic patterns."""
    normalized = normalize_text_for_moderation(text)
    for pattern in _COMPILED_SLURS:
        if pattern.search(text) or pattern.search(normalized):
            return True, "Message blocked by automated moderation policy."
    return False, ""


def is_ip_private_or_loopback(host: str) -> bool:
    """SSRF protection: Verifies host does not resolve to private/loopback/cloud metadata IP."""
    try:
        ip = socket.gethostbyname(host)
        # Parse octets
        parts = [int(x) for x in ip.split('.')]
        if parts[0] == 127:                         # Loopback
            return True
        if parts[0] == 10:                          # 10.0.0.0/8
            return True
        if parts[0] == 192 and parts[1] == 168:     # 192.168.0.0/16
            return True
        if parts[0] == 172 and (16 <= parts[1] <= 31): # 172.16.0.0/12
            return True
        if parts[0] == 169 and parts[1] == 254:     # Link-local / Cloud metadata (169.254.169.254)
            return True
        if parts[0] == 0:
            return True
        return False
    except Exception:
        return True


def fetch_opengraph_metadata(url: str) -> Optional[Dict[str, str]]:
    """
    Safely scrapes OpenGraph metadata with strict SSRF protection, size caps, and timeouts.
    """
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return None
        hostname = (parsed.hostname or "").lower()
        if not hostname or hostname in _BLOCKED_DOMAINS:
            return None
        if is_ip_private_or_loopback(hostname):
            return None

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "CBM-Chat-LinkPreview/1.0 (+https://cbm.wispbyte.org)",
                "Accept": "text/html,application/xhtml+xml"
            }
        )
        with urllib.request.urlopen(req, timeout=1.8) as response:
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                return None
            # Read at most 64KB to prevent memory exhaustion
            raw_html = response.read(65536).decode("utf-8", errors="ignore")

        # Parse OG tags with regex
        def get_meta(prop_name: str) -> str:
            m = re.search(r'<meta\s+[^>]*property=[\'"]' + re.escape(prop_name) + r'[\'"][^>]*content=[\'"]([^\'"]+)[\'"]', raw_html, re.IGNORECASE)
            if not m:
                m = re.search(r'<meta\s+[^>]*content=[\'"]([^\'"]+)[\'"][^>]*property=[\'"]' + re.escape(prop_name) + r'[\'"]', raw_html, re.IGNORECASE)
            return html.unescape(m.group(1)).strip() if m else ""

        og_title = get_meta("og:title")
        if not og_title:
            m_title = re.search(r'<title[^>]*>(.*?)</title>', raw_html, re.IGNORECASE | re.DOTALL)
            og_title = html.unescape(m_title.group(1)).strip() if m_title else ""

        og_desc = get_meta("og:description")
        og_image = get_meta("og:image")
        og_site = get_meta("og:site_name")

        if not og_title and not og_desc and not og_image:
            return None

        # Resolve relative image URLs
        if og_image and not (og_image.startswith("http://") or og_image.startswith("https://")):
            og_image = urllib.parse.urljoin(url, og_image)

        return {
            "url": html.escape(url[:300]),
            "title": html.escape(og_title[:120]),
            "description": html.escape(og_desc[:240]),
            "image_url": html.escape(og_image[:300]),
            "site_name": html.escape((og_site or hostname)[:60])
        }
    except Exception:
        return None


def verify_magic_bytes(file_bytes: bytes, ext: str) -> bool:
    """Validates file magic header bytes match declared extension."""
    ext = ext.lower()
    if ext in (".png",):
        return file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    if ext in (".jpg", ".jpeg"):
        return file_bytes.startswith(b"\xff\xd8\xff")
    if ext in (".gif",):
        return file_bytes.startswith(b"GIF87a") or file_bytes.startswith(b"GIF89a")
    if ext in (".webp",):
        return len(file_bytes) > 12 and file_bytes[:4] == b"RIFF" and file_bytes[8:12] == b"WEBP"
    if ext in (".mp4",):
        return len(file_bytes) > 8 and file_bytes[4:8] == b"ftyp"
    if ext in (".webm",):
        return file_bytes.startswith(b"\x1a\x45\xdf\xa3")
    if ext in (".pdf",):
        return file_bytes.startswith(b"%PDF-")
    if ext in (".zip",):
        return file_bytes.startswith(b"PK\x03\x04")
    if ext in (".txt", ".json", ".csv"):
        # Ensure utf-8 readable
        try:
            file_bytes[:1024].decode("utf-8")
            return True
        except Exception:
            return False
    return True


class DisposableChatRoom:
    """Represents a single temporary chatroom with strict FIFO window and disposable assets."""
    def __init__(self, room_id: str, creator_name: str = "Anonymous"):
        self.room_id = room_id
        self.creator_name = creator_name
        self.created_at = time.time()
        self.last_active_at = time.time()
        self.is_ended = False
        self.messages: deque = deque(maxlen=MAX_MESSAGES_WINDOW)
        self.media_file_paths: List[str] = []
        self.custom_stickers: Dict[str, Dict[str, Any]] = {}
        self.rate_limit_tracker: Dict[str, List[float]] = {}
        self.last_messages_by_sender: Dict[str, Tuple[str, float]] = {}
        self.lock = threading.RLock()

        # Dedicated ephemeral media folder on disk
        self.storage_dir = os.path.join(BASE_TEMP_DIR, re.sub(r"[^a-zA-Z0-9_-]", "", room_id))
        try:
            os.makedirs(self.storage_dir, exist_ok=True)
        except Exception:
            pass

    def check_rate_limit(self, sender_key: str) -> bool:
        """Returns True if sender has not exceeded burst rate limits."""
        now = time.time()
        history = self.rate_limit_tracker.setdefault(sender_key, [])
        # Prune old timestamps
        history = [t for t in history if (now - t) < RATE_LIMIT_WINDOW]
        self.rate_limit_tracker[sender_key] = history
        if len(history) >= RATE_LIMIT_MAX_MESSAGES:
            return False
        history.append(now)
        return True

    def register_custom_sticker(
        self,
        shortcode: str,
        name: str,
        image_bytes: bytes,
        creator_name: str = "Anonymous"
    ) -> Tuple[bool, Any]:
        """
        Registers a temporary user-generated sticker or animated emoji for this disposable room.
        All UGC stickers are permanently deleted when the room is destroyed.
        """
        with self.lock:
            if self.is_ended:
                return False, "This chatroom session has ended and is permanently closed."

            shortcode = shortcode.strip().lower()
            if not shortcode.startswith(":") or not shortcode.endswith(":") or len(shortcode) < 3 or len(shortcode) > 24:
                return False, "Shortcode must be in format :emoji_name: (3-24 characters, alphanumeric/underscores)."

            raw_name_part = shortcode[1:-1]
            if not re.match(r"^[a-zA-Z0-9_\-]+$", raw_name_part):
                return False, "Shortcode can only contain letters, numbers, hyphens, and underscores."

            # Moderation check on sticker shortcode and name
            toxic, reason = is_toxic_content(shortcode + " " + name)
            if toxic:
                return False, "Sticker name or code blocked by automated moderation policy."

            if len(self.custom_stickers) >= MAX_CUSTOM_STICKERS_PER_ROOM:
                return False, f"Maximum of {MAX_CUSTOM_STICKERS_PER_ROOM} custom stickers per room reached."

            if len(image_bytes) > MAX_STICKER_IMAGE_BYTES:
                return False, f"Sticker image exceeds maximum limit of {MAX_STICKER_IMAGE_BYTES // 1024} KB."

            # Determine image extension from magic bytes
            ext = None
            if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                ext = ".png"
            elif image_bytes.startswith(b"\xff\xd8\xff"):
                ext = ".jpg"
            elif image_bytes.startswith(b"GIF87a") or image_bytes.startswith(b"GIF89a"):
                ext = ".gif"
            elif len(image_bytes) > 12 and image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
                ext = ".webp"
            else:
                return False, "Invalid image format. Supported formats: PNG, JPG, GIF, WEBP."

            clean_code = re.sub(r'[^a-zA-Z0-9_\-]', '', raw_name_part)
            safe_fname = f"ugc_{clean_code}_{uuid.uuid4().hex[:6]}{ext}"
            file_path = os.path.join(self.storage_dir, safe_fname)
            try:
                with open(file_path, "wb") as f:
                    f.write(image_bytes)
                self.media_file_paths.append(file_path)
            except Exception as e:
                return False, f"Failed to save sticker file: {e}"

            public_url = f"/api/cbm/chat/media?room_id={urllib.parse.quote(self.room_id)}&file={urllib.parse.quote(safe_fname)}"
            clean_name = html.escape(name.strip()[:32] or raw_name_part)
            clean_creator = html.escape(creator_name.strip()[:32] or "Anonymous")

            sticker_meta = {
                "code": shortcode,
                "name": clean_name,
                "url": public_url,
                "creator": clean_creator,
                "is_animated": ext in (".gif", ".webp"),
                "is_ugc": True,
                "created_at": time.time()
            }
            self.custom_stickers[shortcode] = sticker_meta
            return True, sticker_meta

    def get_stickers(self) -> Dict[str, Dict[str, Any]]:
        """Returns standard emojis catalog combined with room-specific temporary UGC stickers."""
        with self.lock:
            all_stickers = dict(CUSTOM_STICKERS)
            all_stickers.update(self.custom_stickers)
            return all_stickers

    def add_message(
        self,
        sender_name: str,
        sender_clan: str,
        content: str,
        player_index: Optional[int] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        auth_type: str = "TERRITORIAL_ANONYMOUS",
        is_cbm_verified: bool = False,
        cbm_role: Optional[str] = None
    ) -> Tuple[bool, Any]:
        """
        Validates, moderates, parses, and pushes a message to the FIFO ring buffer.
        Supports dual CBM Member Auth and Anonymous Territorial.io Auth.
        """
        with self.lock:
            if self.is_ended:
                return False, "This chatroom session has ended and is permanently closed."

            self.last_active_at = time.time()
            clean_sender = html.escape(sender_name.strip()[:32] or "Guest")
            clean_clan = html.escape(sender_clan.strip()[:16] or "")
            raw_content = content.strip()

            if not raw_content and not attachments:
                return False, "Cannot send an empty message."

            if len(raw_content) > MAX_CONTENT_LENGTH:
                return False, f"Message content exceeds maximum limit of {MAX_CONTENT_LENGTH} characters."

            # Anti-Spam: Duplicate check within 4 seconds
            now = time.time()
            last_text, last_time = self.last_messages_by_sender.get(clean_sender, ("", 0.0))
            if raw_content and raw_content == last_text and (now - last_time) < 4.0:
                return False, "Duplicate message rejected (slow down)."
            self.last_messages_by_sender[clean_sender] = (raw_content, now)

            # Impenetrable Moderation Check
            if raw_content:
                toxic, reason = is_toxic_content(raw_content)
                if toxic:
                    return False, reason

            # Safe XSS Escaping
            escaped_content = html.escape(raw_content)

            # Extract URLs for OpenGraph Embeds (capped at 2 embeds)
            og_embeds = []
            if raw_content:
                urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', raw_content)
                for u in urls[:2]:
                    if not u.startswith("http"):
                        u = "https://" + u
                    preview = fetch_opengraph_metadata(u)
                    if preview:
                        og_embeds.append(preview)

            # Process custom sticker shortcodes in content (Standard + Temporary Room UGC)
            detected_stickers = []
            available_stickers = dict(CUSTOM_STICKERS)
            available_stickers.update(self.custom_stickers)
            for code, meta in available_stickers.items():
                if code in raw_content:
                    detected_stickers.append(meta)

            msg_id = f"msg_{uuid.uuid4().hex[:12]}"
            msg_obj = {
                "id": msg_id,
                "room_id": self.room_id,
                "sender_name": clean_sender,
                "sender_clan": clean_clan,
                "player_index": player_index,
                "auth_type": auth_type,                 # "CBM_MEMBER" or "TERRITORIAL_ANONYMOUS"
                "is_cbm_verified": bool(is_cbm_verified),
                "cbm_role": html.escape(cbm_role[:20]) if cbm_role else None,
                "content": escaped_content,
                "stickers": detected_stickers,
                "og_embeds": og_embeds,
                "attachments": attachments or [],
                "timestamp": now,
                "timestamp_iso": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(now))
            }

            self.messages.append(msg_obj)
            return True, msg_obj

    def get_messages(self, since_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns message list from the 100-message FIFO buffer."""
        with self.lock:
            if self.is_ended:
                return []
            self.last_active_at = time.time()
            all_msgs = list(self.messages)
            if not since_id:
                return all_msgs
            
            # Find index of since_id
            for idx, m in enumerate(all_msgs):
                if m["id"] == since_id:
                    return all_msgs[idx + 1:]
            return all_msgs

    def destroy(self):
        """Irrevocably and permanently purges the chatroom, UGC stickers, and unlinks all media files."""
        with self.lock:
            self.is_ended = True
            self.messages.clear()
            self.custom_stickers.clear()
            self.rate_limit_tracker.clear()
            self.last_messages_by_sender.clear()
            if os.path.exists(self.storage_dir):
                try:
                    shutil.rmtree(self.storage_dir, ignore_errors=True)
                except Exception:
                    pass


class DisposableChatEngine:
    """Global manager coordinating all active temporary disposable chatrooms."""
    _instance = None
    _lock = threading.RLock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DisposableChatEngine, cls).__new__(cls)
                cls._instance._init()
            return cls._instance

    def _init(self):
        self.rooms: Dict[str, DisposableChatRoom] = {}
        self.sweep_running = True
        self._ensure_temp_dir()
        self._start_sweep_thread()

    def _ensure_temp_dir(self):
        try:
            os.makedirs(BASE_TEMP_DIR, exist_ok=True)
        except Exception:
            pass

    def _start_sweep_thread(self):
        def sweep_loop():
            while self.sweep_running:
                time.sleep(60)
                try:
                    self.prune_idle_rooms()
                except Exception as ex:
                    print(f"[!] Chat engine sweep warning: {ex}")

        t = threading.Thread(target=sweep_loop, daemon=True, name="CBM-ChatEngine-Prune")
        t.start()

    def get_or_create_room(self, room_id: str, creator_name: str = "Anonymous") -> DisposableChatRoom:
        """Retrieves existing room or constructs a new disposable room."""
        clean_id = re.sub(r"[^a-zA-Z0-9_\-\.:]", "", room_id.strip())[:64]
        if not clean_id:
            clean_id = f"match_{uuid.uuid4().hex[:10]}"

        with self._lock:
            room = self.rooms.get(clean_id)
            if not room or room.is_ended:
                room = DisposableChatRoom(clean_id, creator_name=creator_name)
                self.rooms[clean_id] = room
            return room

    def get_room(self, room_id: str) -> Optional[DisposableChatRoom]:
        with self._lock:
            clean_id = re.sub(r"[^a-zA-Z0-9_\-\.:]", "", room_id.strip())
            return self.rooms.get(clean_id)

    def end_room(self, room_id: str) -> bool:
        """Permanently terminates and wipes a chatroom session immediately."""
        with self._lock:
            clean_id = re.sub(r"[^a-zA-Z0-9_\-\.:]", "", room_id.strip())
            room = self.rooms.pop(clean_id, None)
            if room:
                room.destroy()
                return True
            return False

    def prune_idle_rooms(self):
        """Scans for rooms idle beyond TTL and permanently destroys them."""
        now = time.time()
        expired = []
        with self._lock:
            for rid, room in self.rooms.items():
                if (now - room.last_active_at) > ROOM_IDLE_TIMEOUT_SECONDS or room.is_ended:
                    expired.append(rid)

            for rid in expired:
                room = self.rooms.pop(rid, None)
                if room:
                    room.destroy()
                    print(f"[*] Ephemeral chatroom '{rid}' expired and permanently deleted.")

    def save_attachment(
        self,
        room_id: str,
        filename: str,
        file_bytes: bytes,
        category: str = "file"
    ) -> Tuple[bool, Any]:
        """
        Surgically saves and verifies an uploaded attachment for an active disposable room.
        Enforces size limits, magic bytes, and extension safety.
        """
        room = self.get_room(room_id)
        if not room or room.is_ended:
            return False, "Chatroom does not exist or has ended."

        # Extension inspection
        _, raw_ext = os.path.splitext(filename)
        ext = raw_ext.lower().strip()
        if ext in _FORBIDDEN_EXTENSIONS or not ext:
            return False, f"File extension '{ext}' is forbidden by security policy."

        # Category and size validation
        media_rule = _ALLOWED_MEDIA.get(category, _ALLOWED_MEDIA["file"])
        if ext not in media_rule["extensions"]:
            return False, f"Extension '{ext}' not permitted for category '{category}'."

        if len(file_bytes) > media_rule["max_size"]:
            return False, f"Attachment exceeds limit of {media_rule['max_size'] // (1024*1024)} MB."

        # Magic byte verification
        if not verify_magic_bytes(file_bytes, ext):
            return False, "File failed binary signature / magic byte authenticity inspection."

        # Save to room storage folder
        clean_base = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', filename)
        safe_filename = f"{uuid.uuid4().hex[:12]}_{clean_base}"
        file_path = os.path.join(room.storage_dir, safe_filename)
        try:
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            room.media_file_paths.append(file_path)
            
            # Public download URL
            public_url = f"/api/cbm/chat/media?room_id={urllib.parse.quote(room_id)}&file={urllib.parse.quote(safe_filename)}"
            return True, {
                "name": html.escape(filename[:80]),
                "type": category,
                "url": public_url,
                "size_bytes": len(file_bytes),
                "extension": ext
            }
        except Exception as ex:
            return False, f"Failed to store attachment: {ex}"


# Global Singleton Instance
chat_engine = DisposableChatEngine()
