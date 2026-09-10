#!/usr/bin/env python3
"""
Territorial.io Turnstile Token Pool & Buffer Manager
====================================================
Integrates with local EzSolver (http://127.0.0.1:8191) to pre-fetch,
validate, and buffer Cloudflare Turnstile tokens for high-density bot swarms.

Eliminates in-match solve latency:
- Turnstile tokens are valid for 5 minutes (game.js line 750).
- Pre-caches tokens so 20–100+ bots can join simultaneously with 0s delay.
"""

import asyncio
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error
from typing import Optional, List, Dict, Tuple

PYTHON_EXE = r"C:\Users\a2b\AppData\Local\Programs\Python\Python312\python.exe"
EZSOLVER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ezsolver_repo")
EZSOLVER_SERVICE = os.path.join(EZSOLVER_DIR, "service.py")
DEFAULT_API_URL = "http://127.0.0.1:8191"
SITEKEY = "0x4AAAAAAEI8HZoG8nJMzxt1"
SITEURL = "https://territorial.io/"
ACTION = "enter_lobby"
MAX_TOKEN_AGE_SEC = 240.0  # Expire tokens older than 4 minutes (game allows 5 min)


class TokenPool:
    def __init__(self, api_url: str = DEFAULT_API_URL, min_pool_size: int = 5, max_pool_size: int = 25):
        self.api_url = api_url.rstrip("/")
        self.min_pool_size = min_pool_size
        self.max_pool_size = max_pool_size
        self._tokens: List[Tuple[str, float]] = []  # [(token_str, timestamp)]
        self._lock = asyncio.Lock()
        self._worker_task: Optional[asyncio.Task] = None
        self._service_proc: Optional[subprocess.Popen] = None

    def is_service_alive(self) -> bool:
        """Checks if the local EzSolver service is responding."""
        try:
            req = urllib.request.Request(f"{self.api_url}/health", method="GET")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def ensure_service(self):
        """Starts the EzSolver local service process if not already active."""
        if self.is_service_alive():
            print(f"[+] [TokenPool] EzSolver service active on {self.api_url}")
            return

        print(f"[*] [TokenPool] Starting local EzSolver service ({EZSOLVER_SERVICE})...")
        env = os.environ.copy()
        env["TS_PROFILE_DIR"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".chrome_sessions", "ezsolver_profile")
        os.makedirs(env["TS_PROFILE_DIR"], exist_ok=True)

        self._service_proc = subprocess.Popen(
            [PYTHON_EXE, EZSOLVER_SERVICE],
            cwd=EZSOLVER_DIR,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        for _ in range(25):
            time.sleep(0.5)
            if self.is_service_alive():
                print(f"[+] [TokenPool] EzSolver service successfully online (PID: {self._service_proc.pid})")
                return

        raise RuntimeError("Failed to start or connect to local EzSolver service on port 8191.")

    def _purge_expired(self):
        now = time.time()
        self._tokens = [(t, ts) for t, ts in self._tokens if (now - ts) < MAX_TOKEN_AGE_SEC]

    async def fetch_token_from_ezsolver(self, proxy: Optional[str] = None, timeout: int = 50) -> str:
        """Requests a single Turnstile token from the EzSolver HTTP endpoint."""
        payload = {
            "sitekey": SITEKEY,
            "siteurl": SITEURL,
            "action": ACTION,
            "timeout": timeout
        }
        if proxy:
            payload["proxy"] = proxy

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.api_url}/solve",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        loop = asyncio.get_running_loop()

        def do_request():
            with urllib.request.urlopen(req, timeout=timeout + 5) as resp:
                res_body = resp.read().decode("utf-8")
                return json.loads(res_body)

        res = await loop.run_in_executor(None, do_request)
        if "token" in res and res["token"]:
            return res["token"]
        raise RuntimeError(f"EzSolver returned error: {res.get('error', 'unknown error')}")

    async def get_token(self, proxy: Optional[str] = None, timeout: int = 50) -> str:
        """
        Retrieves a valid Turnstile token. Returns immediately if a pre-cached token exists,
        otherwise requests one directly from EzSolver.
        """
        async with self._lock:
            self._purge_expired()
            if self._tokens:
                token, ts = self._tokens.pop(0)
                age = time.time() - ts
                print(f"[+] [TokenPool] Instant token retrieved from pool (Age: {age:.1f}s | Remaining in pool: {len(self._tokens)})")
                return token

        # If pool is empty, fetch directly via EzSolver
        print(f"[*] [TokenPool] Pool empty. Fetching live token via EzSolver...")
        token = await self.fetch_token_from_ezsolver(timeout=timeout)
        return token

    async def start_background_replenisher(self):
        """Asynchronously maintains pool size between min_pool_size and max_pool_size."""
        self._worker_task = asyncio.create_task(self._replenish_loop())

    async def _replenish_loop(self):
        while True:
            try:
                async with self._lock:
                    self._purge_expired()
                    current_count = len(self._tokens)

                if current_count < self.min_pool_size:
                    needed = self.min_pool_size - current_count
                    print(f"[*] [TokenPool Worker] Replenishing {needed} token(s)... (Current: {current_count}/{self.min_pool_size})")
                    try:
                        token = await self.fetch_token_from_ezsolver(timeout=50)
                        async with self._lock:
                            self._tokens.append((token, time.time()))
                            print(f"[+] [TokenPool Worker] Buffered fresh token. Pool size: {len(self._tokens)}")
                    except Exception as e:
                        print(f"[-] [TokenPool Worker] Fetch failed: {e}")
                        await asyncio.sleep(3)
                else:
                    await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[-] [TokenPool Error] {e}")
                await asyncio.sleep(5)

    def status(self) -> dict:
        self._purge_expired()
        return {
            "service_alive": self.is_service_alive(),
            "pool_size": len(self._tokens),
            "tokens": [{"age_sec": round(time.time() - ts, 1)} for _, ts in self._tokens]
        }

    def close(self):
        if self._worker_task:
            self._worker_task.cancel()
        if self._service_proc:
            print("[*] [TokenPool] Stopping local EzSolver service process...")
            self._service_proc.terminate()
            try:
                self._service_proc.wait(timeout=3)
            except Exception:
                self._service_proc.kill()


if __name__ == "__main__":
    tp = TokenPool(min_pool_size=2)
    tp.ensure_service()
    print("Initial Status:", json.dumps(tp.status(), indent=2))
