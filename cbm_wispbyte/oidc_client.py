#!/usr/bin/env python3
"""
CBM OpenID Connect (OIDC) SSO Client with PKCE
==============================================
Compliant with OpenID Connect Core 1.0 & RFC 7636 (PKCE).
- Verifies iss, aud, exp, nonce, and JWKS signatures (RS256/ES256).
- Low-memory JWKS caching with lazy re-fetching for key rotation.
- State and PKCE verifier protection via encrypted cookies.
"""

import os
import json
import time
import base64
import hashlib
import secrets
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, Tuple

try:
    import jwt
    from jwt import PyJWKClient
    HAS_PYJWT = True
except ImportError:
    jwt = None
    PyJWKClient = None
    HAS_PYJWT = False


class OIDCConfigurationError(RuntimeError):
    pass


class OIDCValidationError(ValueError):
    pass


class OIDCClient:
    def __init__(
        self,
        issuer_url: Optional[str] = None,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        scopes: str = "openid email profile"
    ):
        self.issuer_url = (issuer_url or os.environ.get("OIDC_ISSUER_URL", "")).rstrip("/")
        self.client_id = client_id or os.environ.get("OIDC_CLIENT_ID", "")
        self.client_secret = client_secret or os.environ.get("OIDC_CLIENT_SECRET", "")
        self.redirect_uri = redirect_uri or os.environ.get("OIDC_REDIRECT_URI", "")
        self.scopes = scopes

        self._discovery_cache: Optional[Dict[str, Any]] = None
        self._discovery_expiry: float = 0.0
        self._jwks_client: Optional[PyJWKClient] = None

    def is_configured(self) -> bool:
        return bool(self.issuer_url and self.client_id and self.redirect_uri)

    def _get_discovery(self) -> Dict[str, Any]:
        """Fetches and caches the OpenID provider configuration."""
        now = time.time()
        if self._discovery_cache and now < self._discovery_expiry:
            return self._discovery_cache

        well_known = f"{self.issuer_url}/.well-known/openid-configuration"
        req = urllib.request.Request(well_known, headers={"User-Agent": "CBM-OIDC/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self._discovery_cache = data
                self._discovery_expiry = now + 3600.0  # 1 hour discovery cache
                return data
        except Exception as e:
            raise OIDCConfigurationError(f"Failed to fetch OIDC discovery document from {well_known}: {e}")

    def _get_jwks_client(self) -> PyJWKClient:
        """Instantiates or reuses PyJWKClient pointing to the provider's jwks_uri."""
        if self._jwks_client:
            return self._jwks_client
        disc = self._get_discovery()
        jwks_uri = disc.get("jwks_uri")
        if not jwks_uri:
            raise OIDCConfigurationError("Provider discovery document missing 'jwks_uri'.")
        self._jwks_client = PyJWKClient(jwks_uri, cache_keys=True, max_cached_keys=16, lifespan=3600)
        return self._jwks_client

    @staticmethod
    def generate_pkce() -> Tuple[str, str]:
        """Generates (code_verifier, code_challenge) using RFC 7636 S256."""
        verifier = secrets.token_urlsafe(64)
        digest = hashlib.sha256(verifier.encode("ascii")).digest()
        challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
        return verifier, challenge

    def generate_authorization_url(self) -> Dict[str, Any]:
        """
        Builds the authorization redirect URL with PKCE, state, and nonce.
        Returns a dict containing authorization_url, state, nonce, and code_verifier.
        """
        if not self.is_configured():
            raise OIDCConfigurationError("OIDC client is not fully configured.")

        disc = self._get_discovery()
        auth_endpoint = disc.get("authorization_endpoint")
        if not auth_endpoint:
            raise OIDCConfigurationError("Provider missing authorization_endpoint.")

        state = secrets.token_urlsafe(32)
        nonce = secrets.token_urlsafe(32)
        verifier, challenge = self.generate_pkce()

        query_params = {
            "client_id": self.client_id,
            "response_type": "code",
            "scope": self.scopes,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "nonce": nonce,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
        url = f"{auth_endpoint}?{urllib.parse.urlencode(query_params)}"

        return {
            "authorization_url": url,
            "state": state,
            "nonce": nonce,
            "code_verifier": verifier,
            "created_at": time.time()
        }

    def exchange_code_for_tokens(self, code: str, code_verifier: str) -> Dict[str, Any]:
        """Exchanges authorization code + code_verifier for tokens at token_endpoint."""
        disc = self._get_discovery()
        token_endpoint = disc.get("token_endpoint")
        if not token_endpoint:
            raise OIDCConfigurationError("Provider missing token_endpoint.")

        body = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "code_verifier": code_verifier,
        }
        if self.client_secret:
            body["client_secret"] = self.client_secret

        encoded_data = urllib.parse.urlencode(body).encode("utf-8")
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": "CBM-OIDC/1.0"
        }

        req = urllib.request.Request(token_endpoint, data=encoded_data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_data = e.read().decode("utf-8", errors="ignore")
            raise OIDCValidationError(f"Token exchange failed (HTTP {e.code}): {err_data}")
        except Exception as e:
            raise OIDCValidationError(f"Token endpoint communication failure: {e}")

    def validate_id_token(self, id_token: str, expected_nonce: str) -> Dict[str, Any]:
        """
        Validates ID token:
        1. Fetches signing key matching 'kid' from JWKS.
        2. Validates signature with RS256/ES256.
        3. Enforces issuer, audience, expiration, and nonce.
        """
        jwks_client = self._get_jwks_client()
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(id_token)
        except Exception as e:
            raise OIDCValidationError(f"Unable to locate valid signing key in provider JWKS: {e}")

        disc = self._get_discovery()
        expected_issuer = disc.get("issuer", self.issuer_url)

        try:
            claims = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256", "ES256"],
                audience=self.client_id,
                issuer=expected_issuer,
                options={
                    "require": ["exp", "iss", "aud", "sub"],
                    "verify_exp": True,
                    "verify_iss": True,
                    "verify_aud": True
                }
            )
        except jwt.ExpiredSignatureError:
            raise OIDCValidationError("ID token has expired.")
        except jwt.InvalidAudienceError:
            raise OIDCValidationError("ID token audience (aud) mismatch.")
        except jwt.InvalidIssuerError:
            raise OIDCValidationError("ID token issuer (iss) mismatch.")
        except Exception as e:
            raise OIDCValidationError(f"ID token cryptographic verification failed: {e}")

        # Nonce verification (critical protection against token replay)
        token_nonce = claims.get("nonce")
        if not token_nonce or token_nonce != expected_nonce:
            raise OIDCValidationError("ID token nonce does not match session nonce.")

        return claims
