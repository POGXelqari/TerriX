"""
CBM Rate Limiter & Anti-Brute-Force Lockout Module
=================================================
Provides thread-safe IP sliding-window request throttling and account-level
authentication failure tracking with temporary lockout to prevent PIN/password
brute-force enumeration attacks.
"""

import time
import threading
from typing import Dict, List, Tuple, Optional


class CBMRateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        # IP request tracking: ip -> list of timestamps
        self._ip_requests: Dict[str, List[float]] = {}
        # Account auth failure tracking: account_name (lowercased) -> list of failure timestamps
        self._account_failures: Dict[str, List[float]] = {}
        # Binary download rate limiting: ip -> list of download timestamps (max 1 per min)
        self._download_requests: Dict[str, List[float]] = {}
        # Download violations / retries: ip -> list of retry timestamps while throttled
        self._download_violations: Dict[str, List[float]] = {}
        # 24-hour IP ban tracking: ip -> unban timestamp
        self._banned_ips: Dict[str, float] = {}
        # Last prune timestamp
        self._last_prune = time.time()

        # Configuration Constants
        self.MAX_FAILED_AUTH_ATTEMPTS = 5
        self.AUTH_LOCKOUT_SECONDS = 900.0  # 15 minutes
        self.SENSITIVE_IP_RATE_LIMIT = 30   # 30 requests per minute
        self.GENERAL_IP_RATE_LIMIT = 120    # 120 requests per minute
        self.WINDOW_SECONDS = 60.0          # 1 minute sliding window

        # Binary Distribution Security Constants
        self.DOWNLOAD_RATE_LIMIT = 1           # 1 request per minute
        self.DOWNLOAD_WINDOW_SECONDS = 60.0    # 60s cooldown
        self.DOWNLOAD_MAX_RETRIES = 5          # 5+ retries while throttled = 24-hour ban
        self.IP_BAN_DURATION_SECONDS = 86400.0 # 24 hours (86,400s)

    def _prune_stale_entries(self, now: float):
        """Prunes timestamps older than maximum retention window to prevent memory accumulation."""
        if now - self._last_prune < 60.0:
            return
        self._last_prune = now

        # Prune IP history (keep last 60s)
        stale_ip_cutoff = now - self.WINDOW_SECONDS
        dead_ips = []
        for ip, ts_list in self._ip_requests.items():
            valid = [t for t in ts_list if t >= stale_ip_cutoff]
            if valid:
                self._ip_requests[ip] = valid
            else:
                dead_ips.append(ip)
        for ip in dead_ips:
            del self._ip_requests[ip]

        # Prune account failure history (keep last 15 min)
        stale_auth_cutoff = now - self.AUTH_LOCKOUT_SECONDS
        dead_accounts = []
        for acc, ts_list in self._account_failures.items():
            valid = [t for t in ts_list if t >= stale_auth_cutoff]
            if valid:
                self._account_failures[acc] = valid
            else:
                dead_accounts.append(acc)
        for acc in dead_accounts:
            del self._account_failures[acc]

    def check_ip_rate_limit(self, ip: str, limit: Optional[int] = None, window_seconds: Optional[float] = None) -> Tuple[bool, int]:
        """
        Evaluates sliding-window rate limit for a client IP.
        Returns: (is_allowed: bool, retry_after_seconds: int)
        """
        if not ip:
            return True, 0

        max_reqs = limit if limit is not None else self.GENERAL_IP_RATE_LIMIT
        window = window_seconds if window_seconds is not None else self.WINDOW_SECONDS
        now = time.time()

        with self._lock:
            self._prune_stale_entries(now)
            ts_list = self._ip_requests.setdefault(ip, [])
            # Filter timestamps within current window
            cutoff = now - window
            ts_list = [t for t in ts_list if t >= cutoff]
            self._ip_requests[ip] = ts_list

            if len(ts_list) >= max_reqs:
                oldest_in_window = ts_list[0]
                retry_after = max(1, int(oldest_in_window + window - now))
                return False, retry_after

            ts_list.append(now)
            return True, 0

    def check_rate_limit(self, key: str, limit: int = 60, period_seconds: float = 60.0) -> Tuple[bool, int]:
        """Generic sliding-window rate limit checker for API keys or identifiers."""
        return self.check_ip_rate_limit(key, limit=limit, window_seconds=period_seconds)

    def is_account_locked(self, account_name: str) -> Tuple[bool, int]:
        """
        Checks if an account is currently locked due to repeated authentication failures.
        Returns: (is_locked: bool, remaining_cooldown_seconds: int)
        """
        if not account_name:
            return False, 0

        acc_key = account_name.strip().lower()
        now = time.time()

        with self._lock:
            self._prune_stale_entries(now)
            failures = self._account_failures.get(acc_key, [])
            cutoff = now - self.AUTH_LOCKOUT_SECONDS
            recent_failures = [t for t in failures if t >= cutoff]
            self._account_failures[acc_key] = recent_failures

            if len(recent_failures) >= self.MAX_FAILED_AUTH_ATTEMPTS:
                latest_failure = recent_failures[-1]
                remaining = int((latest_failure + self.AUTH_LOCKOUT_SECONDS) - now)
                if remaining > 0:
                    return True, remaining

            return False, 0

    def record_auth_failure(
        self,
        account_name: str,
        max_failures: Optional[int] = None,
        lockout_seconds: Optional[int] = None
    ) -> Tuple[bool, int]:
        """
        Records a failed authentication attempt for an account.
        Returns: (is_locked: bool, remaining_lockout_seconds_or_failure_count: int)
        """
        if not account_name:
            return False, 0

        max_f = max_failures or self.MAX_FAILED_AUTH_ATTEMPTS
        lockout_dur = lockout_seconds or self.AUTH_LOCKOUT_SECONDS
        acc_key = account_name.strip().lower()
        now = time.time()

        with self._lock:
            failures = self._account_failures.setdefault(acc_key, [])
            cutoff = now - lockout_dur
            recent = [t for t in failures if t >= cutoff]
            recent.append(now)
            self._account_failures[acc_key] = recent
            if len(recent) >= max_f:
                return True, int(lockout_dur)
            return False, len(recent)

    def record_auth_success(self, account_name: str):
        """
        Clears authentication failure history for an account upon successful login / PIN check.
        """
        if not account_name:
            return

        acc_key = account_name.strip().lower()
        with self._lock:
            if acc_key in self._account_failures:
                del self._account_failures[acc_key]

    def check_download_rate_limit(self, ip: str) -> Tuple[bool, int, bool]:
        """
        Enforces binary distribution download rate limiting:
        - Maximum 1 download request per minute per IP.
        - 5+ retries while throttled results in an immediate 24-hour IP ban.
        Returns: (is_allowed: bool, retry_or_ban_seconds: int, is_banned: bool)
        """
        if not ip:
            return True, 0, False

        now = time.time()
        with self._lock:
            # 1. Check existing IP ban
            if ip in self._banned_ips:
                ban_expiry = self._banned_ips[ip]
                if now < ban_expiry:
                    remaining_ban = max(1, int(ban_expiry - now))
                    return False, remaining_ban, True
                else:
                    del self._banned_ips[ip]
                    if ip in self._download_violations:
                        del self._download_violations[ip]

            # 2. Check sliding window (1 download per 60.0s)
            requests = self._download_requests.setdefault(ip, [])
            cutoff = now - self.DOWNLOAD_WINDOW_SECONDS
            requests = [t for t in requests if t >= cutoff]
            self._download_requests[ip] = requests

            if len(requests) >= self.DOWNLOAD_RATE_LIMIT:
                # Violation: user hit download while in cooldown
                violations = self._download_violations.setdefault(ip, [])
                v_cutoff = now - 3600.0  # retain violations within 1 hour
                violations = [t for t in violations if t >= v_cutoff]
                violations.append(now)
                self._download_violations[ip] = violations

                # Check if 5+ retries reached
                if len(violations) >= self.DOWNLOAD_MAX_RETRIES:
                    ban_until = now + self.IP_BAN_DURATION_SECONDS
                    self._banned_ips[ip] = ban_until
                    return False, int(self.IP_BAN_DURATION_SECONDS), True

                oldest = requests[0]
                retry_after = max(1, int(oldest + self.DOWNLOAD_WINDOW_SECONDS - now))
                return False, retry_after, False

            # Allowed
            requests.append(now)
            return True, 0, False

    def is_ip_banned(self, ip: str) -> Tuple[bool, int]:
        """Checks if an IP is currently banned. Returns (is_banned, remaining_seconds)."""
        if not ip:
            return False, 0
        now = time.time()
        with self._lock:
            if ip in self._banned_ips:
                ban_expiry = self._banned_ips[ip]
                if now < ban_expiry:
                    return True, max(1, int(ban_expiry - now))
                del self._banned_ips[ip]
            return False, 0


# Global rate limiter instance
rate_limiter = CBMRateLimiter()
