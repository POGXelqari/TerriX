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
        # Last prune timestamp
        self._last_prune = time.time()

        # Configuration Constants
        self.MAX_FAILED_AUTH_ATTEMPTS = 5
        self.AUTH_LOCKOUT_SECONDS = 900.0  # 15 minutes
        self.SENSITIVE_IP_RATE_LIMIT = 30   # 30 requests per minute
        self.GENERAL_IP_RATE_LIMIT = 120    # 120 requests per minute
        self.WINDOW_SECONDS = 60.0          # 1 minute sliding window

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


# Global rate limiter instance
rate_limiter = CBMRateLimiter()
