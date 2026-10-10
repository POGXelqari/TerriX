#!/usr/bin/env python3
"""
Test Suite: Discord AutoMod Priority Leaky-Bucket Rate Limiter & Circuit Breaker
================================================================================
Validates:
1. Rate limit calculation: 40 requests/minute ceiling -> 1.5s interval per action.
2. Throttled sequential execution enforcing interval pacing.
3. Circuit breaker engagement on HTTP 429 / RateLimited exceptions.
4. Auto-recovery when circuit breaker cooldown expires.
"""

import os
import sys
import time
import asyncio
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from bot import DiscordRateLimiter


class TestDiscordRateLimiter(unittest.IsolatedAsyncioTestCase):
    async def test_default_interval_configuration(self):
        """Verifies default rate limiter configuration enforces 40 req/min (1.5s)."""
        limiter = DiscordRateLimiter(max_per_minute=40)
        self.assertEqual(limiter.max_per_minute, 40)
        self.assertAlmostEqual(limiter.interval, 1.5, places=2)

    async def test_leaky_bucket_interval_pacing(self):
        """Verifies that consecutive acquisitions enforce interval pacing."""
        # Use scaled rate limiter for fast test execution: 120 req/min -> 0.5s interval
        limiter = DiscordRateLimiter(max_per_minute=120)
        self.assertAlmostEqual(limiter.interval, 0.5, places=2)

        start = time.monotonic()
        await limiter.acquire(priority=1)
        await limiter.acquire(priority=1)
        await limiter.acquire(priority=1)
        elapsed = time.monotonic() - start

        # 3 acquisitions should space across at least 2 full intervals (>= 1.0s)
        self.assertGreaterEqual(elapsed, 0.95)

    async def test_circuit_breaker_tripping_on_429(self):
        """Simulates Discord 429 RateLimited response triggering the circuit breaker."""
        limiter = DiscordRateLimiter(max_per_minute=600)  # 0.1s interval

        class Simulated429Exception(Exception):
            status = 429
            retry_after = 0.5

        call_count = 0

        async def failing_target():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Simulated429Exception("Rate limit reached")
            return "recovered"

        start = time.monotonic()
        res = await limiter.execute(failing_target, priority=1, max_retries=2)
        elapsed = time.monotonic() - start

        self.assertEqual(res, "recovered")
        self.assertEqual(call_count, 2)
        # Should have waited for retry_after (0.5s) + 1.0s cooldown + intervals
        self.assertGreaterEqual(elapsed, 1.4)

    async def test_execute_callable_and_coroutine(self):
        """Verifies execute wraps synchronous callables and async coroutines."""
        limiter = DiscordRateLimiter(max_per_minute=1200)

        # Synchronous callable
        res_sync = await limiter.execute(lambda: 42)
        self.assertEqual(res_sync, 42)

        # Asynchronous coroutine
        async def sample_coro():
            await asyncio.sleep(0.01)
            return "ok_async"

        res_async = await limiter.execute(sample_coro())
        self.assertEqual(res_async, "ok_async")


if __name__ == "__main__":
    unittest.main()
