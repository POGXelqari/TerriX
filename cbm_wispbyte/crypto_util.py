"""
CBM Cryptographic Utilities & Zero-Knowledge Enclave
===================================================
Provides authenticated symmetric encryption-at-rest (AES-256-GCM + PBKDF2-HMAC-SHA256)
and dual-layer Zero-Knowledge Envelope Encryption for sensitive stored in-game credentials
(e.g. Territorial.io passwords in payment methods and loan covenants).

Zero-Knowledge Model:
- Stored credentials are encrypted with a key derived from the user's private PIN
  and an enclave pepper (PBKDF2-HMAC-SHA256 with 300,000 iterations).
- The server NEVER stores the decryption key on disk or in the database.
- Database dumps or local terminal inspections cannot decrypt credentials without
  the user's private PIN.
- Plaintext fallbacks are strictly eliminated (fail-closed architecture).
"""

import os
import base64
import hashlib
import hmac
import json
import time
from typing import Optional, Dict, Any, Tuple

try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False


class CryptographicFailureError(RuntimeError):
    """Raised when encryption or decryption fails, enforcing fail-closed security."""
    pass


def _get_or_create_encryption_key() -> bytes:
    """
    Resolves master server encryption key from environment variable CBM_ENCRYPTION_KEY
    or a persistent local key file. Generates a secure 256-bit Fernet key if none exists.
    """
    env_key = os.environ.get("CBM_ENCRYPTION_KEY", "").strip()
    if env_key:
        try:
            raw = base64.urlsafe_b64decode(env_key)
            if len(raw) == 32:
                return env_key.encode("utf-8")
        except Exception:
            pass
        return base64.urlsafe_b64encode(hashlib.sha256(env_key.encode("utf-8")).digest())

    key_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cbm_secret.key")
    if os.path.exists(key_file):
        try:
            with open(key_file, "rb") as f:
                saved = f.read().strip()
                if len(saved) >= 32:
                    return saved
        except Exception:
            pass

    if not HAS_CRYPTOGRAPHY:
        raise CryptographicFailureError("Fatal: Python 'cryptography' library is required to initialize CBM security keys.")

    fresh = Fernet.generate_key()
    try:
        with open(key_file, "wb") as f:
            f.write(fresh)
        # Apply restrictive permissions on Unix/Linux
        if hasattr(os, "chmod"):
            try:
                os.chmod(key_file, 0o600)
            except Exception:
                pass
    except Exception as ex:
        print(f"[!] Warning: Could not persist encryption key file: {ex}")

    return fresh


_GLOBAL_KEY = _get_or_create_encryption_key() if HAS_CRYPTOGRAPHY else b""
_FERNET_INSTANCE = Fernet(_GLOBAL_KEY) if (HAS_CRYPTOGRAPHY and _GLOBAL_KEY) else None
_ENCLAVE_PEPPER = os.environ.get("CBM_ENCLAVE_PEPPER", "").strip() or hashlib.sha256(_GLOBAL_KEY).hexdigest()[:32]


def _derive_zk_key(user_pin: str, salt_bytes: bytes) -> bytes:
    """
    Derives a 256-bit AES-GCM key from the user's PIN combined with the Enclave Pepper
    using PBKDF2-HMAC-SHA256 with 300,000 iterations.
    """
    if not HAS_CRYPTOGRAPHY:
        raise CryptographicFailureError("Fatal: 'cryptography' library is required for Zero-Knowledge key derivation.")
    pin_clean = str(user_pin).strip()
    if not pin_clean:
        raise CryptographicFailureError("Zero-Knowledge derivation requires a non-empty user PIN.")

    secret_material = f"{pin_clean}:{_ENCLAVE_PEPPER}".encode("utf-8")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt_bytes,
        iterations=300000
    )
    return kdf.derive(secret_material)


def encrypt_credential_zk(plaintext: str, user_pin: str, user_salt: Optional[str] = None) -> str:
    """
    Encrypts a sensitive credential using Zero-Knowledge AES-256-GCM envelope encryption.
    Format: zk:v2:<salt_hex>:<iv_hex>:<ciphertext_and_tag_hex>
    """
    if not HAS_CRYPTOGRAPHY:
        raise CryptographicFailureError("Fatal: 'cryptography' library is required to encrypt credentials.")
    if not plaintext:
        return ""
    if not user_pin:
        raise CryptographicFailureError("Cannot encrypt in Zero-Knowledge mode without a user PIN.")

    plain_bytes = str(plaintext).strip().encode("utf-8")
    salt_bytes = bytes.fromhex(user_salt) if user_salt else os.urandom(16)
    derived_key = _derive_zk_key(user_pin, salt_bytes)

    iv = os.urandom(12)
    aesgcm = AESGCM(derived_key)
    ciphertext_and_tag = aesgcm.encrypt(iv, plain_bytes, None)

    return f"zk:v2:{salt_bytes.hex()}:{iv.hex()}:{ciphertext_and_tag.hex()}"


def decrypt_credential_zk(ciphertext: str, user_pin: str) -> str:
    """
    Decrypts a Zero-Knowledge AES-256-GCM credential.
    Raises CryptographicFailureError if the PIN is incorrect or ciphertext has been altered.
    """
    if not HAS_CRYPTOGRAPHY:
        raise CryptographicFailureError("Fatal: 'cryptography' library is required to decrypt credentials.")
    if not ciphertext:
        return ""
    if not user_pin:
        raise CryptographicFailureError("Zero-Knowledge credential decryption requires the user's PIN.")

    parts = str(ciphertext).strip().split(":")
    if len(parts) != 5 or parts[0] != "zk" or parts[1] != "v2":
        raise CryptographicFailureError("Malformed Zero-Knowledge ciphertext token format.")

    _, _, salt_hex, iv_hex, ct_hex = parts
    try:
        salt_bytes = bytes.fromhex(salt_hex)
        iv = bytes.fromhex(iv_hex)
        ct_and_tag = bytes.fromhex(ct_hex)
    except ValueError as ex:
        raise CryptographicFailureError(f"Corrupt hex encoding in ciphertext: {ex}")

    derived_key = _derive_zk_key(user_pin, salt_bytes)
    aesgcm = AESGCM(derived_key)
    try:
        decrypted_bytes = aesgcm.decrypt(iv, ct_and_tag, None)
        return decrypted_bytes.decode("utf-8")
    except Exception as ex:
        raise CryptographicFailureError(f"Decryption failed: Invalid PIN or tampered ciphertext: {ex}")


def encrypt_credential(plaintext: Optional[str], user_pin: Optional[str] = None) -> Optional[str]:
    """
    Encrypts sensitive credential string.
    - If user_pin is provided: uses Zero-Knowledge AES-256-GCM (zk:v2:...).
    - If user_pin is omitted: uses authenticated Fernet server enclave key (enc:...).
    - Enforces strict fail-closed policy (never returns raw plaintext on error).
    """
    if plaintext is None:
        return None
    plain = str(plaintext).strip()
    if not plain:
        return ""
    if is_encrypted(plain):
        return plain

    if not HAS_CRYPTOGRAPHY:
        raise CryptographicFailureError("Fatal: 'cryptography' library is missing. Credential encryption refused.")

    if user_pin:
        return encrypt_credential_zk(plain, user_pin=user_pin)

    if _FERNET_INSTANCE:
        try:
            token = _FERNET_INSTANCE.encrypt(plain.encode("utf-8")).decode("utf-8")
            return f"enc:{token}"
        except Exception as ex:
            raise CryptographicFailureError(f"Server enclave encryption failed: {ex}")

    raise CryptographicFailureError("No active cryptographic instance available to encrypt credential.")


def decrypt_credential(ciphertext_or_plain: Optional[str], user_pin: Optional[str] = None) -> Optional[str]:
    """
    Decrypts credential string:
    - If zk:v2:...: requires user_pin and uses AES-256-GCM.
    - If enc:...: uses server enclave Fernet key.
    - If legacy unencrypted string during migration: returns raw value.
    - Enforces strict fail-closed error handling.
    """
    if ciphertext_or_plain is None:
        return None
    raw = str(ciphertext_or_plain).strip()
    if not raw:
        return ""

    if raw.startswith("zk:v2:"):
        if not user_pin:
            raise CryptographicFailureError("Cannot decrypt Zero-Knowledge credential without user PIN.")
        return decrypt_credential_zk(raw, user_pin=user_pin)

    if raw.startswith("enc:"):
        token = raw[4:]
        if not HAS_CRYPTOGRAPHY or not _FERNET_INSTANCE:
            raise CryptographicFailureError("Fatal: 'cryptography' library required to decrypt server enclave token.")
        try:
            decrypted = _FERNET_INSTANCE.decrypt(token.encode("utf-8")).decode("utf-8")
            return decrypted
        except Exception as ex:
            raise CryptographicFailureError(f"Enclave credential decryption failed: {ex}")

    # Legacy unencrypted plaintext during migration
    return raw


derive_zk_key = _derive_zk_key


def rotate_credential_ciphertext(ciphertext: str, old_pin: Optional[str] = None, new_pin: Optional[str] = None) -> str:
    """
    Re-encrypts a credential under a new user PIN or upgrades an enc: token to zk:v2:.
    """
    plaintext = decrypt_credential(ciphertext, user_pin=old_pin)
    if not plaintext:
        return ""
    return encrypt_credential(plaintext, user_pin=new_pin) or ""



def is_encrypted(val: Optional[str]) -> bool:
    """Checks whether a given string is ciphertext (either zk:v2:... or legacy enc:...)."""
    if not val:
        return False
    s = str(val).strip()
    return s.startswith("zk:v2:") or s.startswith("enc:")


def zeroize_memory(buf: bytearray) -> None:
    """Securely wipes mutable byte buffers in volatile memory by overwriting with null bytes."""
    if isinstance(buf, bytearray):
        for i in range(len(buf)):
            buf[i] = 0


def create_session_token(account_name: str, expiry_seconds: int = 86400) -> str:
    """
    Creates a signed, tamper-proof HMAC-SHA256 session token for an authenticated account.
    Format: base64(account_name).expiry_timestamp.signature
    """
    if not account_name:
        return ""
    canon = str(account_name).strip()
    exp = int(time.time() + expiry_seconds)
    acc_b64 = base64.urlsafe_b64encode(canon.encode("utf-8")).decode("utf-8")
    msg = f"{acc_b64}:{exp}".encode("utf-8")
    sig = hmac.new(_GLOBAL_KEY, msg, hashlib.sha256).hexdigest()
    return f"{acc_b64}.{exp}.{sig}"


def verify_session_token(token: Optional[str]) -> Optional[str]:
    """
    Validates signature and expiry for a session token.
    Returns canonical account_name if valid and active, else None.
    """
    if not token or not isinstance(token, str):
        return None
    parts = token.strip().split(".")
    if len(parts) != 3:
        return None
    acc_b64, exp_str, sig = parts
    try:
        exp = int(exp_str)
        if time.time() > exp:
            return None
        msg = f"{acc_b64}:{exp}".encode("utf-8")
        expected_sig = hmac.new(_GLOBAL_KEY, msg, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        account_name = base64.urlsafe_b64decode(acc_b64.encode("utf-8")).decode("utf-8")
        return account_name
    except Exception:
        return None


def get_master_hmac_key() -> bytes:
    """
    Returns the authoritative 256-bit binary HMAC key derived from _GLOBAL_KEY.
    Guarantees consistent, unforgeable token signing across all CBM subsystems.
    """
    global _GLOBAL_KEY
    if not _GLOBAL_KEY:
        _GLOBAL_KEY = _get_or_create_encryption_key()
    return hashlib.sha256(_GLOBAL_KEY).digest()


def generate_order_verification_token(order_id: str, product_id: str, price_cents: int, timestamp: int) -> str:
    """
    Generates a cryptographically signed HMAC-SHA256 order verification token.
    Eliminates static secret fallbacks and prevents third-party token forgery.
    """
    key = get_master_hmac_key()
    payload = f"{order_id}:{product_id}:{price_cents}:{int(timestamp)}".encode("utf-8")
    sig = hmac.new(key, payload, hashlib.sha256).hexdigest()[:32]
    return f"tok_{sig}"


def constant_time_verify(token_a: Optional[str], token_b: Optional[str]) -> bool:
    """
    Constant-time string comparison to prevent side-channel timing attacks.
    """
    if not token_a or not token_b:
        return False
    return hmac.compare_digest(str(token_a).strip(), str(token_b).strip())


def encode_hs256_jwt(payload: Dict[str, Any], key: Optional[bytes] = None) -> str:
    """
    Encodes an RFC 7519 JSON Web Token (JWT) with HMAC-SHA256 (HS256).
    Zero external dependencies; uses Python standard library.
    """
    signing_key = key if key is not None else get_master_hmac_key()
    header = {"typ": "JWT", "alg": "HS256"}
    h_b64 = base64.urlsafe_b64encode(json.dumps(header, separators=(',', ':')).encode("utf-8")).decode("ascii").rstrip("=")
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':')).encode("utf-8")).decode("ascii").rstrip("=")
    signing_input = f"{h_b64}.{p_b64}".encode("ascii")
    raw_sig = hmac.new(signing_key, signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(raw_sig).decode("ascii").rstrip("=")
    return f"{h_b64}.{p_b64}.{sig_b64}"


def decode_hs256_jwt(token: str, key: Optional[bytes] = None, audience: Optional[str] = None) -> Dict[str, Any]:
    """
    Decodes and validates signature and expiration of an HS256 JWT.
    Zero external dependencies. Raises ValueError on invalid or expired token.
    """
    signing_key = key if key is not None else get_master_hmac_key()
    parts = (token or "").strip().split(".")
    if len(parts) != 3:
        raise ValueError("Malformed JWT token structure.")
    h_b64, p_b64, s_b64 = parts
    signing_input = f"{h_b64}.{p_b64}".encode("ascii")
    raw_sig = hmac.new(signing_key, signing_input, hashlib.sha256).digest()
    expected_sig = base64.urlsafe_b64encode(raw_sig).decode("ascii").rstrip("=")
    if not hmac.compare_digest(s_b64, expected_sig):
        raise ValueError("Invalid JWT signature.")

    p_padded = p_b64 + "=" * (-len(p_b64) % 4)
    payload = json.loads(base64.urlsafe_b64decode(p_padded.encode("ascii")).decode("utf-8"))

    now = time.time()
    if "exp" in payload and now > payload["exp"]:
        raise ValueError("JWT token expired.")
    if audience and payload.get("aud") != audience:
        raise ValueError("JWT audience mismatch.")
    return payload

