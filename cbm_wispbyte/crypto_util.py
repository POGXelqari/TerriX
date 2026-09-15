"""
CBM Cryptographic Utilities
===========================
Provides authenticated symmetric encryption-at-rest (AES-128-CBC + HMAC-SHA256 via Fernet)
for sensitive stored in-game credentials (e.g. Territorial.io passwords in payment methods
and loan records).
"""

import os
import base64
import hashlib
from typing import Optional

try:
    from cryptography.fernet import Fernet
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False


def _get_or_create_encryption_key() -> bytes:
    """
    Resolves encryption key from environment variable CBM_ENCRYPTION_KEY or a persistent local key file.
    If none exists, generates a secure 256-bit Fernet key and persists it locally.
    """
    env_key = os.environ.get("CBM_ENCRYPTION_KEY", "").strip()
    if env_key:
        try:
            # Validate if it's already a valid 32-byte urlsafe base64 string
            raw = base64.urlsafe_b64decode(env_key)
            if len(raw) == 32:
                return env_key.encode("utf-8")
        except Exception:
            # Derive deterministic 32-byte key using SHA-256
            derived = base64.urlsafe_b64encode(hashlib.sha256(env_key.encode("utf-8")).digest())
            return derived

    # Check local key file
    key_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cbm_secret.key")
    if os.path.exists(key_file):
        try:
            with open(key_file, "rb") as f:
                saved = f.read().strip()
                if len(saved) >= 32:
                    return saved
        except Exception:
            pass

    # Generate fresh key
    if HAS_CRYPTOGRAPHY:
        fresh = Fernet.generate_key()
    else:
        fresh = base64.urlsafe_b64encode(os.urandom(32))

    try:
        with open(key_file, "wb") as f:
            f.write(fresh)
    except Exception as ex:
        print(f"[!] Warning: Could not persist encryption key file: {ex}")

    return fresh


_GLOBAL_KEY = _get_or_create_encryption_key()
_FERNET_INSTANCE = Fernet(_GLOBAL_KEY) if HAS_CRYPTOGRAPHY else None


def encrypt_credential(plaintext: Optional[str]) -> Optional[str]:
    """
    Encrypts sensitive credential string. Returns ciphertext with 'enc:' prefix.
    If plaintext is empty or already encrypted, returns as-is.
    """
    if plaintext is None:
        return None
    plain = str(plaintext).strip()
    if not plain:
        return ""
    if plain.startswith("enc:"):
        return plain

    if _FERNET_INSTANCE:
        try:
            token = _FERNET_INSTANCE.encrypt(plain.encode("utf-8")).decode("utf-8")
            return f"enc:{token}"
        except Exception as ex:
            print(f"[!] Warning: Encryption failed, storing fallback: {ex}")
            return plain
    return plain


def decrypt_credential(ciphertext_or_plain: Optional[str]) -> Optional[str]:
    """
    Decrypts credential string if it contains 'enc:' prefix.
    Transparently returns legacy unencrypted plaintext if prefix is absent or on decrypt error.
    """
    if ciphertext_or_plain is None:
        return None
    raw = str(ciphertext_or_plain).strip()
    if not raw:
        return ""

    if not raw.startswith("enc:"):
        return raw  # Legacy plaintext

    token = raw[4:]
    if _FERNET_INSTANCE:
        try:
            decrypted = _FERNET_INSTANCE.decrypt(token.encode("utf-8")).decode("utf-8")
            return decrypted
        except Exception as ex:
            print(f"[!] Warning: Decryption failed for credential token: {ex}")
            return raw
    return raw


def is_encrypted(val: Optional[str]) -> bool:
    """Checks whether a given string is Fernet ciphertext with 'enc:' prefix."""
    return bool(val and str(val).strip().startswith("enc:"))

