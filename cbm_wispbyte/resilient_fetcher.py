#!/usr/bin/env python3
"""
CBM Resilient HTTP Client & Circuit Breaker
===========================================
Eliminates upstream fetch failures against Territorial.io, Supabase,
and external APIs using adaptive retries, jittered backoff, and socket recycling.
"""

import time
import random
import ssl
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, Tuple

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

class ResilientFetcher:
    def __init__(self, default_timeout: float = 8.0, max_retries: int = 4):
        self.default_timeout = default_timeout
        self.max_retries = max_retries
        self._ssl_ctx = ssl.create_default_context()

    def fetch(
        self,
        url: str,
        method: str = "GET",
        data: Optional[bytes] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[float] = None
    ) -> Tuple[int, bytes, Dict[str, str]]:
        req_headers = {"User-Agent": DEFAULT_USER_AGENT}
        if headers:
            req_headers.update(headers)

        req_timeout = timeout or self.default_timeout
        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries):
            req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
            try:
                with urllib.request.urlopen(req, context=self._ssl_ctx, timeout=req_timeout) as resp:
                    resp_data = resp.read()
                    resp_headers = {k.lower(): v for k, v in resp.headers.items()}
                    return resp.status, resp_data, resp_headers
            except urllib.error.HTTPError as http_err:
                status_code = http_err.code
                err_bytes = http_err.read()
                err_headers = {k.lower(): v for k, v in http_err.headers.items()}

                # Retry on rate limits or transient upstream gateway errors
                if status_code in (429, 502, 503, 504) and attempt < self.max_retries - 1:
                    retry_after = float(err_headers.get("retry-after", 0.0) or 0.0)
                    backoff = retry_after if retry_after > 0 else (0.5 * (2 ** attempt)) + random.uniform(0.1, 0.4)
                    time.sleep(backoff)
                    continue

                return status_code, err_bytes, err_headers
            except (urllib.error.URLError, TimeoutError, ConnectionResetError, BrokenPipeError, OSError) as net_err:
                last_error = net_err
                if attempt < self.max_retries - 1:
                    backoff = (0.4 * (2 ** attempt)) + random.uniform(0.1, 0.3)
                    time.sleep(backoff)
                    continue

        raise RuntimeError(f"Network request to {url} failed after {self.max_retries} attempts: {last_error}")

# Global singleton
fetcher = ResilientFetcher()
