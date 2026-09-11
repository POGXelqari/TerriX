#!/usr/bin/env python3
"""
Territorial.io High-Density Swarm Orchestrator (20 - 100+ Bots)
==============================================================
Orchestrates protocol-level asynchronous bot swarms for mass lobby entry,
clan dominance, and synchronized match convergence.

Key Features:
1. Protocol-Level Pure WebSockets (100 bots run on < 500 MB RAM).
2. Rotating HTTP/SOCKS5 Proxies via proxy.txt.
3. Automated Turnstile Token Clearing via local EzSolver TokenPool.
4. Coordinated Barrier Synchronization & Simultaneous Ready Lock.
"""

import asyncio
import argparse
import json
import os
import random
import re
import sys
import time
from typing import List, Dict, Optional, Any

if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass
sys.path.insert(0, os.path.dirname(__file__))

from proxy_manager import ProxyManager
from token_pool import TokenPool
from direct_websocket_engine import (
    BitStreamWriter, BitStreamReader,
    CHAR_TO_INDEX, GAME_MODES, MAP_REGISTRY
)

# Active Build Number / Handshake Version (Fetched dynamically or fallback 1759)
BUILD_NUMBER = 1759

def compute_mixed_hash(input_val: int, seed_a: int, seed_b: int) -> int:
    temp_l = (seed_a + input_val) & 0xFFFFFFFF
    temp_u = (seed_b + input_val) & 0xFFFFFFFF
    h = (temp_l + temp_u) & 2147483647
    for i in range(1, 17):
        h ^= (h >> i)
        h = (h >> (1 + (temp_l & 3))) & 0xFFFFFFFF
        h = (h * (7 + ((temp_l | temp_u) & 1023))) & 1073741823
        h = (h + (temp_u & 65535)) & 0xFFFFFFFF
        temp_l = (temp_l >> (1 + (h & 1))) & 0xFFFFFFFF
        temp_u = (temp_u >> (1 + (temp_l & 1))) & 0xFFFFFFFF
    return h & 1073741823

def solve_challenge_packet(reader: BitStreamReader) -> bytes:
    event_type = reader.read_bits(3)
    bit_length = reader.read_bits(5)
    seed_a = reader.read_bits(30)
    seed_b = reader.read_bits(30)
    target_hash = reader.read_bits(30)

    solution = 0
    max_val = 1 << bit_length
    for i in range(max_val):
        if compute_mixed_hash(i, seed_a, seed_b) == target_hash:
            solution = i
            break

    w = BitStreamWriter(1 + 6 + 3 + 30 + 30)
    w.write_bits(1, 0)
    w.write_bits(6, 30)  # Opcode 30: Challenge Solution
    w.write_bits(3, event_type)
    w.write_bits(30, solution)
    w.write_bits(30, 0)
    return w.get_bytes()

class SwarmBot:
    def __init__(
        self,
        bot_id: int,
        username: str,
        account_name: str,
        password: str,
        mode: str,
        target_map: str,
        proxy: Optional[Dict[str, Any]],
        token_pool: TokenPool,
        coordinator: 'SwarmCoordinator',
        build_number: int = BUILD_NUMBER
    ):
        self.bot_id = bot_id
        self.username = username
        self.account_name = account_name
        self.password = password
        self.mode = mode.lower()
        self.target_map = target_map
        self.proxy = proxy
        self.token_pool = token_pool
        self.coordinator = coordinator
        self.build_number = build_number

        self.ws = None
        self.session_packet = None
        self.is_authenticated = False
        self.is_in_lobby = False
        self.is_ready_armed = False

    def craft_handshake(self) -> bytes:
        """Exact 178-bit Opcode 13 Handshake buffer (eliminates Code 4211 mismatch)."""
        import datetime
        w = BitStreamWriter(178)
        w.write_bits(1, 0)
        w.write_bits(6, 13)
        w.write_bits(14, self.build_number)
        w.write_bits(4, 0)
        w.write_bits(7, 0)
        w.write_bits(1, 1)  # isTerritorialDomain
        w.write_bits(1, 0)  # isInIframe
        w.write_bits(5, datetime.datetime.now().hour % 24)
        w.write_bits(8, 53)
        w.write_bits(8, 53)
        token_str = "---------------"
        for c in token_str:
            w.write_bits(6, CHAR_TO_INDEX.get(c, 0))
        w.write_bits(14, 9819)
        w.write_bits(7, 52)
        w.write_bits(12, 650)
        return w.get_bytes()

    def craft_identity(self) -> bytes:
        w = BitStreamWriter(1 + 6 + 10 + 2 + (5 + len(self.username) * 16) + 18)
        w.write_bits(1, 0)
        w.write_bits(6, 1)    # Opcode 1
        w.write_bits(10, 0)   # Flags
        w.write_bits(2, 0)    # Profile type
        w.write_utf16_string(self.username)
        # Random Clan/Bot RGB
        w.write_bits(6, random.randint(10, 60))
        w.write_bits(6, random.randint(10, 60))
        w.write_bits(6, random.randint(10, 60))
        return w.get_bytes()

    def craft_turnstile(self, token: str) -> bytes:
        fR = len(token)
        max_char = max(ord(c) for c in token) if token else 0
        bits_per_char = 7 if max_char < 128 else 16
        total_bits = 1 + 6 + 16 + 1 + (fR * bits_per_char)
        w = BitStreamWriter(total_bits)
        w.write_bits(1, 0)
        w.write_bits(6, 6)   # Opcode 6
        w.write_bits(16, fR)
        w.write_bits(1, 1 if bits_per_char == 16 else 0)
        for c in token:
            w.write_bits(bits_per_char, ord(c))
        return w.get_bytes()

    def craft_room_selector(self, mode_code: int = 2) -> bytes:
        w = BitStreamWriter(1 + 6 + 3 + 2)
        w.write_bits(1, 0)
        w.write_bits(6, 2)
        w.write_bits(3, 2)
        w.write_bits(2, mode_code)
        return w.get_bytes()

    def craft_ready_toggle(self) -> bytes:
        w = BitStreamWriter(1 + 6 + 3)
        w.write_bits(1, 0)
        w.write_bits(6, 2)
        w.write_bits(3, 4)   # Action 4: Toggle Ready
        return w.get_bytes()

    def craft_mode_heartbeat(self, mode_val: int) -> bytes:
        w = BitStreamWriter(1 + 6 + 1 + 3)
        w.write_bits(1, 0)
        w.write_bits(6, 4)
        w.write_bits(1, 0)
        w.write_bits(3, mode_val)
        return w.get_bytes()

    async def run(self):
        proxy_url = self.proxy["url"] if self.proxy else None
        proxy_desc = f"via {self.proxy['host']}:{self.proxy['port']}" if self.proxy else "Direct"

        print(f"[*] [Bot #{self.bot_id} '{self.username}'] Initiating connection ({proxy_desc})...")

        # Step 1: Obtain Turnstile token from TokenPool
        try:
            token = await self.token_pool.get_token(proxy=proxy_url, timeout=45)
            print(f"[+] [Bot #{self.bot_id}] Acquired Turnstile clearance token ({token[:16]}...)")
        except Exception as e:
            print(f"[-] [Bot #{self.bot_id}] Failed to acquire Turnstile token: {e}")
            return

        # Step 2: Connect to Server 1 (Lobby Socket)
        server_url = "wss://1.territorial.io/s52/"
        headers = {
            "Origin": "https://territorial.io",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        }

        try:
            # Connect to WebSocket (direct or via SOCKS/HTTP proxy)
            ws_kwargs = {
                "origin": headers["Origin"],
                "user_agent_header": headers["User-Agent"],
                "ping_interval": 10,
                "ping_timeout": 10
            }
            if proxy_url:
                from websockets_proxy import Proxy, proxy_connect
                proxy_obj = Proxy.from_url(proxy_url)
                ws_connect_ctx = proxy_connect(server_url, proxy=proxy_obj, **ws_kwargs)
            else:
                import websockets
                ws_connect_ctx = websockets.connect(server_url, **ws_kwargs)

            async with ws_connect_ctx as ws:
                self.ws = ws
                print(f"[+] [Bot #{self.bot_id}] WebSocket connected to Server 1 ({proxy_desc}).")

                # 1. Handshake (Opcode 13)
                await ws.send(self.craft_handshake())

                # 2. Cryptographic Challenge (Opcode 9 -> Opcode 30)
                try:
                    init_resp = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    if isinstance(init_resp, bytes) and len(init_resp) > 0:
                        r = BitStreamReader(init_resp)
                        r.read_bits(1)
                        if r.read_bits(6) == 9:
                            sol = solve_challenge_packet(r)
                            await ws.send(sol)
                            print(f"[+] [Bot #{self.bot_id}] Solved Server 1 Pre-image Challenge (Opcode 30).")
                except Exception as e:
                    print(f"[-] [Bot #{self.bot_id}] Handshake challenge error: {e}")
                    return

                # 3. Player Identity (Opcode 1)
                await ws.send(self.craft_identity())

                # 4. Cloudflare Turnstile Clearance Token (Opcode 6)
                await ws.send(self.craft_turnstile(token))
                print(f"[+] [Bot #{self.bot_id}] Turnstile token dispatched to Server 1.")

                # 5. Mode Selection (Opcode 4 & Opcode 2)
                mode_id = GAME_MODES.get(self.mode, 2)
                await ws.send(self.craft_mode_heartbeat(mode_id))
                await ws.send(self.craft_room_selector(mode_code=2))

                self.is_in_lobby = True
                await self.coordinator.register_arrival(self.bot_id)

                # Step 3: Listen for lobby cycles and wait for coordinator ready signal
                ready_task = asyncio.create_task(self.coordinator.ready_event.wait())

                heartbeat_tick = 0
                while not self.coordinator.ready_event.is_set():
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=1.0)
                        if isinstance(msg, bytes) and len(msg) > 0:
                            # Heartbeat keepalive response
                            reader = BitStreamReader(msg)
                            reader.read_bits(1)
                            op = reader.read_bits(6)
                            if op == 4:
                                await ws.send(self.craft_mode_heartbeat(mode_id))
                    except asyncio.TimeoutError:
                        pass

                    heartbeat_tick += 1
                    if heartbeat_tick % 3 == 0:
                        await ws.send(self.craft_mode_heartbeat(mode_id))

                # Step 4: Coordinated Simultaneous Ready Lock
                print(f"[🚀 READY LOCK] [Bot #{self.bot_id}] Arming Ready toggle simultaneously!")
                await ws.send(self.craft_ready_toggle())
                self.is_ready_armed = True
                await self.coordinator.register_ready(self.bot_id)

                # Step 5: Hold connection into match rollover
                for _ in range(30):
                    if self.coordinator.abort_event.is_set():
                        break
                    await asyncio.sleep(1)
                    await ws.send(self.craft_mode_heartbeat(mode_id))

        except Exception as e:
            err_type = type(e).__name__
            err_msg = str(e).strip()
            detail = f"{err_type}: {err_msg}" if err_msg else err_type
            print(f"[-] [Bot #{self.bot_id}] Connection error: {detail}")
        finally:
            print(f"[*] [Bot #{self.bot_id}] Session closed.")


class SwarmCoordinator:
    def __init__(self, target_count: int, target_map: str = "Europe", telemetry_cb=None):
        self.target_count = target_count
        self.target_map = target_map.lower()
        self.telemetry_cb = telemetry_cb
        self.arrived_bots = set()
        self.ready_bots = set()
        self.ready_event = asyncio.Event()
        self.abort_event = asyncio.Event()
        self._lock = asyncio.Lock()

    def emit(self, event_type: str, data: dict):
        if self.telemetry_cb:
            try:
                self.telemetry_cb(event_type, data)
            except Exception:
                pass

    async def register_arrival(self, bot_id: int):
        async with self._lock:
            self.arrived_bots.add(bot_id)
            print(f"  [Coordinator] Bot #{bot_id} assembled into lobby barrier [{len(self.arrived_bots)}/{self.target_count}]")
            self.emit("lobby_arrival", {
                "bot_id": bot_id,
                "in_lobby": len(self.arrived_bots),
                "target_count": self.target_count,
                "map": self.target_map
            })
            if len(self.arrived_bots) >= self.target_count:
                print(f"[+] [Coordinator] ALL {self.target_count} BOTS ASSEMBLED IN LOBBY BARRIER!")
                self.ready_event.set()

    async def register_ready(self, bot_id: int):
        async with self._lock:
            self.ready_bots.add(bot_id)
            self.emit("ready_locked", {
                "bot_id": bot_id,
                "ready_count": len(self.ready_bots),
                "target_count": self.target_count
            })

    def trigger_force_ready(self):
        print("[*] [Coordinator] Force ready triggered!")
        self.ready_event.set()

    def abort(self):
        print("[!] [Coordinator] Abort requested.")
        self.abort_event.set()
        self.ready_event.set()  # Unblock any waiting loops so they cleanly exit


def load_names(count: int, clan_tag: str = "[SWARM]") -> List[str]:
    names_file = os.path.join(os.path.dirname(__file__), "..", "data", "names.txt")
    if not os.path.exists(names_file):
        names_file = os.path.join(os.path.dirname(__file__), "..", "names.txt")

    base_names = []
    if os.path.exists(names_file):
        with open(names_file, "r", encoding="utf-8") as f:
            base_names = [line.strip() for line in f if line.strip()]

    out = []
    for i in range(count):
        raw_name = base_names[i % len(base_names)] if base_names else f"Unit_{i+1:02d}"
        if clan_tag:
            clean = raw_name.replace(clan_tag, "").strip()
            out.append(f"{clan_tag} {clean}"[:16])
        else:
            out.append(raw_name[:16])
    return out


async def run_swarm_in_process(
    count: int = 20,
    mode: str = "team",
    target_map: str = "Europe",
    tag: str = "[TERRIX]",
    proxies_path: str = "proxy.txt",
    dynamic_proxy: bool = False,
    telemetry_cb=None,
    coordinator_box: dict = None
):
    """Programmatic entry point for in-process execution from executor_app.py."""
    pm = ProxyManager(proxy_file=proxies_path, auto_dynamic=True)
    if dynamic_proxy:
        pm.fetch_dynamic(target_count=max(count, 25))

    token_pool = TokenPool(min_pool_size=min(count, 15), max_pool_size=count + 10)
    token_pool.ensure_service()
    await token_pool.start_background_replenisher()
    await token_pool.warm_up(target=min(count, 4))

    usernames = load_names(count, clan_tag=tag)
    coordinator = SwarmCoordinator(target_count=count, target_map=target_map, telemetry_cb=telemetry_cb)
    if coordinator_box is not None:
        coordinator_box["instance"] = coordinator

    bots = []
    for i in range(count):
        proxy = pm.get_proxy(i) if pm.count() > 0 else None
        bot = SwarmBot(
            bot_id=i,
            username=usernames[i],
            account_name=f"bot_{i:03d}",
            password="pass",
            mode=mode,
            target_map=target_map,
            proxy=proxy,
            token_pool=token_pool,
            coordinator=coordinator
        )
        bots.append(bot)

    async def run_staggered(bot, delay):
        if delay > 0:
            await asyncio.sleep(delay)
        if not coordinator.abort_event.is_set():
            await bot.run()

    tasks = [asyncio.create_task(run_staggered(b, i * 0.35)) for i, b in enumerate(bots)]
    try:
        await asyncio.gather(*tasks, return_exceptions=True)
    finally:
        token_pool.close()
        if telemetry_cb:
            try:
                telemetry_cb("swarm_finished", {})
            except Exception:
                pass


async def main_async():
    parser = argparse.ArgumentParser(description="Territorial.io High-Density Swarm Orchestrator")
    parser.add_argument("--count", type=int, default=20, help="Number of concurrent swarm bots (e.g. 20 - 100)")
    parser.add_argument("--mode", type=str, default="team", help="Game mode (team, ffa, br)")
    parser.add_argument("--map", type=str, default="Europe", help="Target map name")
    parser.add_argument("--tag", type=str, default="[SWARM]", help="Clan tag prefix")
    parser.add_argument("--proxies", type=str, default="proxy.txt", help="Path to proxy list")
    parser.add_argument("--dynamic", action="store_true", help="Force dynamic proxy harvesting on start")
    args = parser.parse_args()

    print("=" * 75)
    print(f" Territorial.io High-Density Swarm Orchestrator")
    print(f" Swarm Target: {args.count} Bots | Mode: {args.mode.upper()} | Map: {args.map}")
    print(f" Clan Tag    : {args.tag}")
    print("=" * 75)

    await run_swarm_in_process(
        count=args.count,
        mode=args.mode,
        target_map=args.map,
        tag=args.tag,
        proxies_path=args.proxies,
        dynamic_proxy=args.dynamic
    )


def main():
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        print("\n[!] Swarm aborted by user.")

if __name__ == "__main__":
    main()
