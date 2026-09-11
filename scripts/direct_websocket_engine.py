#!/usr/bin/env python3
"""
Territorial.io Direct WebSocket Interaction Engine
===================================================
Protocol-level asynchronous client for Territorial.io game servers.

Implements:
1. Binary Bitstream Serialization (Class a7 / Class d7):
   - Arbitrary bit-width packing and unpacking
   - Endianness and framing alignment (1-bit framing + 6-bit opcodes)
2. State & Handshake Flow:
   - Opcode 13: Fingerprint & Version Declaration (aV9)
   - Opcode 1:  Identity, Nickname & Color Profile (aHd)
   - Opcode 2:  Lobby Room & Team Mode Selection (aG7)
   - Opcode 4:  Lobby Heartbeat & Mode Synchronizer (aUb)
   - Opcode 21: Targeted Territory Expansion & Attack Frames (aSC)
3. Automated In-Game Logic:
   - Synchronizes incoming match ticks (Opcode 10/16/aVK)
   - Evaluates border expansion coordinates
   - Dispatches deterministic attack frames
"""

import asyncio
import argparse
import json
import os
import random
import sys
import websockets
from typing import Dict, List, Optional, Tuple

if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

# 64-character charset from game.js
ALPHABET = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
CHAR_TO_INDEX = {c: i for i, c in enumerate(ALPHABET)}

# Game Mode IDs matching engine constants
GAME_MODES = {
    "ffa": 0,
    "1v1": 3,
    "team": 2,      # Team mode (numberTeams - 2)
    "br": 4,        # Battle Royale
    "zombies": 5    # Zombie Defense
}

# Map Identifiers
MAP_REGISTRY = {
    "world1": 0,
    "world2": 1,
    "europe": 2,
    "caucasia": 3,
    "asia": 4,
    "north_america": 5,
    "south_america": 6,
    "africa": 7,
    "island": 8,
    "island_kingdom": 9
}

class BitStreamWriter:
    """Bitstream serializer implementing Class a7 logic."""
    def __init__(self, bit_capacity: int):
        self.capacity_bytes = (bit_capacity + 7) >> 3
        self.buffer = bytearray(self.capacity_bytes)
        self.bit_offset = 0

    def write_bits(self, bit_count: int, value: int):
        end_offset = self.bit_offset + bit_count - 1
        for i in range(self.bit_offset, end_offset + 1):
            byte_idx = i >> 3
            bit_in_byte = 7 - (i & 7)
            bit_val = (value >> (end_offset - i)) & 1
            self.buffer[byte_idx] |= (bit_val << bit_in_byte)
        self.bit_offset += bit_count

    def write_utf16_string(self, text: str):
        self.write_bits(5, len(text))
        for char in text:
            self.write_bits(16, ord(char))

    def get_bytes(self) -> bytes:
        return bytes(self.buffer)


class BitStreamReader:
    """Bitstream deserializer implementing Class d7 logic."""
    def __init__(self, data: bytes):
        self.data = data
        self.size = len(data)
        self.bit_offset = 0

    def read_bits(self, bit_count: int) -> int:
        ft = 0
        end_offset = self.bit_offset + bit_count - 1
        for i in range(self.bit_offset, end_offset + 1):
            byte_val = self.data[i >> 3] if (i >> 3) < self.size else 0
            bit_val = (byte_val >> (7 - (i & 7))) & 1
            ft |= (bit_val << (end_offset - i))
        self.bit_offset += bit_count
        return ft


class TerritorialClient:
    """Protocol-level client managing connection, room navigation, and gameplay loop."""

    def __init__(self, server_url: str, account_name: str, password: str, mode: str = "team", map_name: str = "world2", username: str = "", turnstile_token: str = ""):
        self.server_url = server_url
        self.account_name = account_name
        self.password = password
        self.mode = mode.lower()
        self.map_name = map_name.lower()
        self.username = username or account_name
        self.turnstile_token = turnstile_token
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.is_in_match = False
        self.local_player_id = -1
        self.current_tick = 0

    def craft_handshake(self) -> bytes:
        """Crafts Opcode 13 initial client identification and fingerprint frame."""
        # Bits: 1 (0) + 6 (13) + (14 + 4 + 7 + 1 + 1 + 5 + 16) + (90 + 14 + 7 + 12) = 178 bits
        w = BitStreamWriter(178)
        w.write_bits(1, 0)
        w.write_bits(6, 13)   # Opcode 13
        w.write_bits(14, 0)   # Client build signature
        w.write_bits(4, 0)    # Platform: Web
        w.write_bits(7, 46)   # Version: 2.16.46
        w.write_bits(1, 0)    # Flag A
        w.write_bits(1, 0)    # Flag B
        w.write_bits(5, 12)   # Timezone hour
        w.write_bits(8, 0)    # Locality 0
        w.write_bits(8, 0)    # Locality 1
        # Persistent device token (15 chars) - authentic randomized base64 engine token
        device_token = "".join(random.choice(ALPHABET) for _ in range(15))
        for c in device_token:
            w.write_bits(6, CHAR_TO_INDEX.get(c, 0))
        # Canvas & WebGL fingerprint hash constants (realistic randomized variation)
        w.write_bits(14, random.randint(1200, 8500))
        w.write_bits(7, random.randint(30, 85))
        w.write_bits(12, random.randint(600, 3200))
        return w.get_bytes()

    def craft_identity(self) -> bytes:
        """Crafts Opcode 1 player identity & color payload."""
        username = self.username
        # 1 + 6 + 10 + 2 + 5 + (username.length * 16) + 18
        total_bits = 1 + 6 + 10 + 2 + 5 + (len(username) * 16) + 18
        w = BitStreamWriter(total_bits)
        w.write_bits(1, 0)
        w.write_bits(6, 1)    # Opcode 1: Set Player Identity
        w.write_bits(10, 0)   # Client flags
        w.write_bits(2, 0)    # Profile type
        w.write_utf16_string(username)
        # Color: RGB (6 bits each)
        w.write_bits(6, 10)   # Red
        w.write_bits(6, 45)   # Green
        w.write_bits(6, 60)   # Blue
        return w.get_bytes()

    def craft_turnstile_token(self, token: str) -> bytes:
        """Crafts Opcode 6 Cloudflare Turnstile token verification frame."""
        fR = len(token)
        max_char = max(ord(c) for c in token) if token else 0
        bits_per_char = 7 if max_char < 128 else 16
        total_bits = 1 + 6 + 16 + 1 + (fR * bits_per_char)
        w = BitStreamWriter(total_bits)
        w.write_bits(1, 0)
        w.write_bits(6, 6)   # Opcode 6: Turnstile Token
        w.write_bits(16, fR) # Length of token string
        w.write_bits(1, 1 if bits_per_char == 16 else 0)
        for c in token:
            w.write_bits(bits_per_char, ord(c))
        return w.get_bytes()

    def craft_room_selector(self, mode_code: int = 2) -> bytes:
        """Crafts Opcode 2 room / team selector frame."""
        w = BitStreamWriter(1 + 6 + 3 + 2)
        w.write_bits(1, 0)
        w.write_bits(6, 2)    # Opcode 2
        w.write_bits(3, 2)    # Room selection action
        w.write_bits(2, mode_code)  # Target room/mode
        return w.get_bytes()

    def craft_ready_toggle(self) -> bytes:
        """Crafts Opcode 2 action 4 toggle ready frame (aTJ(1))."""
        w = BitStreamWriter(1 + 6 + 3)
        w.write_bits(1, 0)
        w.write_bits(6, 2)   # Opcode 2
        w.write_bits(3, 4)   # Action 4: Toggle Ready
        return w.get_bytes()

    def craft_account_auth(self, account_name: str, password: str) -> bytes:
        """Crafts Opcode 17 account authentication frame (b1.aGe.aVx)."""
        w = BitStreamWriter(1 + 6 + 30 + 90)
        w.write_bits(1, 0)
        w.write_bits(6, 17)   # Opcode 17: Account Credentials
        acc_padded = account_name.rjust(5, '-')[:5]
        for c in acc_padded:
            w.write_bits(6, CHAR_TO_INDEX.get(c, 0))
        pass_padded = password.rjust(15, '-')[:15]
        for c in pass_padded:
            w.write_bits(6, CHAR_TO_INDEX.get(c, 0))
        return w.get_bytes()

    def craft_mode_heartbeat(self, mode_val: int) -> bytes:
        """Crafts Opcode 4 mode state synchronizer."""
        w = BitStreamWriter(1 + 6 + 1 + 3)
        w.write_bits(1, 0)
        w.write_bits(6, 4)    # Opcode 4
        w.write_bits(1, 0)    # Heartbeat flag
        w.write_bits(3, mode_val)
        return w.get_bytes()

    def craft_spawn_action(self, fD: int) -> bytes:
        """Crafts 27-bit binary spawn packet (b1.pm.pn in game.js)."""
        w = BitStreamWriter(1 + 4 + 22)
        w.write_bits(1, 1)   # In-game Action flag
        w.write_bits(4, 0)   # Action 0: Spawn point selection
        w.write_bits(22, fD) # Map tile index
        return w.get_bytes()

    def craft_attack_action(self, target_id: int, coord_x: int, coord_y: int) -> bytes:
        """Crafts Opcode 21 targeted coordinate expansion action."""
        w = BitStreamWriter(1 + 6 + 6 + 2 * (1 + 30))
        w.write_bits(1, 0)
        w.write_bits(6, 21)   # Opcode 21: Attack Coordinates
        w.write_bits(6, target_id)
        w.write_bits(1, 1 if coord_x < 0 else 0)
        w.write_bits(1, 1 if coord_y < 0 else 0)
        w.write_bits(30, abs(coord_x))
        w.write_bits(30, abs(coord_y))
        return w.get_bytes()

    async def run(self):
        """Main asynchronous event loop managing WebSocket communication and gameplay."""
        headers = {
            "Origin": "https://territorial.io",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        print("=" * 70)
        print(f" Territorial.io Direct WebSocket Engine Client")
        print(f" Target Server : {self.server_url}")
        print(f" Account       : {self.account_name}")
        print(f" Selected Mode : {self.mode.upper()} Mode")
        print(f" Target Map    : {self.map_name.upper()} (Index: {MAP_REGISTRY.get(self.map_name, 1)})")
        print("=" * 70)

        try:
            async with websockets.connect(
                self.server_url,
                origin=headers["Origin"],
                user_agent_header=headers["User-Agent"],
                ping_interval=10,
                ping_timeout=10
            ) as ws:
                self.ws = ws
                print(f"[+] WebSocket connection established to {self.server_url}")

                # Step 1: Handshake (Opcode 13)
                print("[*] Transmitting Opcode 13 (Fingerprint & Version Handshake)...")
                await ws.send(self.craft_handshake())

                # Step 2: Set Identity (Opcode 1)
                print(f"[*] Transmitting Opcode 1 (Player Identity: {self.username})...")
                await ws.send(self.craft_identity())

                # Step 2.5: Transmit Turnstile token if available (Opcode 6)
                if self.turnstile_token:
                    print(f"[*] Transmitting Opcode 6 (Turnstile Token Verification: {self.turnstile_token[:15]}...)...")
                    await ws.send(self.craft_turnstile_token(self.turnstile_token))

                # Step 3: Select Mode (Opcode 4 & Opcode 2)
                mode_id = GAME_MODES.get(self.mode, 2)
                print(f"[*] Transmitting Opcode 4 (Mode Heartbeat: {self.mode} [ID={mode_id}])...")
                await ws.send(self.craft_mode_heartbeat(mode_id))

                print(f"[*] Transmitting Opcode 2 (Joining Team Lobby Room)...")
                await ws.send(self.craft_room_selector(mode_code=2))

                # Step 4: Game Event & Ingestion Loop
                print("[*] Entering synchronized packet listening loop...")
                while True:
                    msg = await ws.recv()
                    if not isinstance(msg, bytes):
                        continue

                    reader = BitStreamReader(msg)
                    framing = reader.read_bits(1)
                    opcode = reader.read_bits(6)

                    # Log incoming events
                    if framing == 0:
                        # Status/Lobby Packet
                        if opcode == 0:
                            print(f"[Lobby] Received Lobby Table Status (Size: {len(msg)} bytes)")
                        elif opcode == 9:
                            print(f"[Server] Received Opcode 9 (Account Challenge). Replying with Opcode 17 ({self.account_name})...")
                            await ws.send(self.craft_account_auth(self.account_name, self.password))
                        elif opcode == 16:
                            print(f"[Lobby] Received Room Metadata Broadcast")
                        elif opcode == 10:
                            print(f"[Lobby] Account Data Confirmed by Server (Opcode 10)")
                            print(f"[*] Transmitting Opcode 2 Action 4 (Arming Ready Status)...")
                            await ws.send(self.craft_ready_toggle())
                        elif opcode == 2:
                            print(f"[Lobby] Room Roster Updated")
                    else:
                        # Match Simulation Packet (Framing 1)
                        if not self.is_in_match:
                            self.is_in_match = True
                            print(f"\n[🚀 MATCH STARTED] Synchronized Simulation Ticking Active!")

                        self.current_tick += 1
                        # Periodic automated gameplay decision (every 20 ticks ~ 1.1 seconds)
                        if self.current_tick % 20 == 0:
                            # Automated expansion coordinate calculation (Center-outward spiral)
                            target_x = 512 + (self.current_tick * 7) % 250
                            target_y = 512 + (self.current_tick * 11) % 250
                            attack_pkt = self.craft_attack_action(target_id=0, coord_x=target_x, coord_y=target_y)
                            await ws.send(attack_pkt)
                            print(f"  [Tick {self.current_tick}] Dispatched Expansion Action -> Coord: ({target_x}, {target_y})")

        except websockets.exceptions.ConnectionClosed as e:
            if e.code == 4211:
                print(f"\n[!] Server disconnected socket with Code 4211.")
                print(f"    Cause: Cloudflare Turnstile verification (Opcode 6) is enforced on live public multiplayer.")
                print(f"    Solutions:")
                print(f"    1. Run via browser engine: python scripts/browser_automation_runner.py --account-index {self.account_name} --mode {self.mode} --map {self.map_name}")
                print(f"    2. Use browser bridge:     python scripts/direct_websocket_engine.py --bridge-browser --account-index 0 --mode {self.mode} --map {self.map_name}")
                print(f"    3. Pass solved token:      python scripts/direct_websocket_engine.py --token <CF_TURNSTILE_TOKEN>")
            else:
                print(f"[-] Connection closed: Code {e.code}, Reason: {e.reason}")
        except Exception as e:
            print(f"[-] Client Error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Territorial.io Direct WebSocket Engine Client")
    parser.add_argument("--server", type=str, default="wss://1.territorial.io/s52/", help="WebSocket server URL (default: wss://1.territorial.io/s52/)")
    parser.add_argument("--mode", type=str, default="team", choices=["team", "ffa", "1v1", "br", "zombies"], help="Game mode (default: team)")
    parser.add_argument("--map", type=str.lower, default="world2", choices=list(MAP_REGISTRY.keys()), help="Target map (default: world2)")
    parser.add_argument("--account", type=str, default="", help="Account Name (default: first verified from valid_accounts.json)")
    parser.add_argument("--password", type=str, default="", help="Account Password")
    parser.add_argument("--account-index", type=int, default=0, help="Account index from valid_accounts.json (default: 0)")
    parser.add_argument("--username", type=str, default="", help="Nickname to override 'Player' username")
    parser.add_argument("--names", type=str, default="", help="Path to names.txt to override 'Player' username")
    parser.add_argument("--token", type=str, default="", help="Active Cloudflare Turnstile token string (for Opcode 6)")
    parser.add_argument("--duration", type=int, default=60, help="Session duration in seconds (default: 60)")
    parser.add_argument("--count", type=int, default=1, help="Number of concurrent accounts to run")
    parser.add_argument("--multi", type=int, default=0, help="Alias for --count")
    parser.add_argument("--auto-generate", action="store_true", help="Auto-generate and validate accounts if index exceeds current pool")
    parser.add_argument("--raw", action="store_true", help="Force raw WebSocket mode without automated Turnstile solver")
    parser.add_argument("--bridge-browser", action="store_true", help="Bridge execution through browser automation runner to clear Turnstile")
    args = parser.parse_args()

    bot_count = max(args.count, args.multi, 1)

    # Automatic Turnstile Resolution:
    # On live public multiplayer (territorial.io), Cloudflare Turnstile is strictly required.
    # If no manual --token is provided and --raw is not forced, automatically bridge via the headless engine.
    is_public_server = "territorial.io" in args.server
    needs_auto_bridge = args.bridge_browser or (is_public_server and not args.token and not args.raw)

    if needs_auto_bridge:
        # Load names to display assigned nickname
        names_list = []
        names_paths = [args.names, os.path.join(os.path.dirname(__file__), "..", "names.txt"), os.path.join(os.path.dirname(__file__), "..", "data", "names.txt")]
        for p in names_paths:
            if p and os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        names_list = [line.strip() for line in f if line.strip() and not line.startswith("#")]
                        if names_list:
                            break
                except Exception:
                    pass
        chosen_nick = args.username or (names_list[args.account_index % len(names_list)] if names_list else "Player")

        print("=" * 70)
        print(f" Territorial.io Autonomous Client [Account Index: {args.account_index} | Count: {bot_count}]")
        print(f" Nickname: {chosen_nick} (names.txt override) | Mode: {args.mode.upper()} | Map: {args.map.upper()}")
        print(f" Live public server enforces Cloudflare Turnstile token verification.")
        print(f" [*] Auto-solving Turnstile via Headless Engine with Lobby Convergence Coordinator...")
        print("=" * 70)

        import subprocess
        cmd = [
            sys.executable,
            os.path.join(os.path.dirname(__file__), "browser_automation_runner.py"),
            "--account-index", str(args.account_index),
            "--mode", args.mode,
            "--map", args.map,
            "--duration", str(args.duration),
            "--count", str(bot_count),
            "--headless"
        ]
        if chosen_nick:
            cmd.extend(["--username", chosen_nick])
        if args.names:
            cmd.extend(["--names", args.names])
        if args.auto_generate:
            cmd.append("--auto-generate")
        subprocess.run(cmd)
        return

    # Load names from names.txt
    names = []
    names_paths = [args.names, os.path.join(os.path.dirname(__file__), "..", "names.txt"), os.path.join(os.path.dirname(__file__), "..", "data", "names.txt")]
    for p in names_paths:
        if p and os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    names = [line.strip() for line in f if line.strip() and not line.startswith("#")]
                    if names:
                        break
            except Exception:
                pass
    if not names:
        names = ["[FR] Zodiac", "[ARCH] VNVRCHY", "joksiel", "[Lone] SLΛMNATION"]

    # 1. Nickname from names.txt mapped directly to account_index
    acc_nick = args.username
    if not acc_nick:
        acc_nick = names[args.account_index % len(names)]

    # 2. Account loading / auto-generation
    acc_name = args.account
    acc_pass = args.password

    if not acc_name:
        accounts_file = os.path.join(os.path.dirname(__file__), "..", "data", "valid_accounts.json")
        accounts = []
        if os.path.exists(accounts_file):
            try:
                with open(accounts_file, "r", encoding="utf-8") as f:
                    accounts = json.load(f)
            except Exception:
                pass

        if args.auto_generate and args.account_index >= len(accounts):
            try:
                sys.path.insert(0, os.path.dirname(__file__))
                from account_creator import get_account_by_index
                acc_obj = get_account_by_index(args.account_index, names_file=args.names, auto_provision=True)
                acc_name = acc_obj["account_name"]
                acc_pass = acc_obj["password"]
            except Exception as e:
                print(f"[-] Auto-provisioning failed: {e}")

        if not acc_name and accounts:
            idx = args.account_index % len(accounts)
            acc_name = accounts[idx]["account_name"]
            acc_pass = accounts[idx]["password"]

        if not acc_name:
            acc_name = "Player" + str(abs(hash(os.times())) % 1000)
            acc_pass = "DefaultPass123"

    if bot_count > 1:
        print("=" * 70)
        print(f" Launching {bot_count} Synchronized Direct WebSocket Clients")
        print(f" Mode: {args.mode} | Target Map: {args.map} | Server: {args.server}")
        print("=" * 70)

        clients = []
        for i in range(bot_count):
            c_idx = (args.account_index + i) % len(accounts) if accounts else 0
            a_name = accounts[c_idx]["account_name"] if accounts else f"Player{i}"
            a_pass = accounts[c_idx]["password"] if accounts else "Pass123"
            u_name = names[c_idx % len(names)]
            client = TerritorialClient(
                server_url=args.server,
                account_name=a_name,
                password=a_pass,
                mode=args.mode,
                map_name=args.map,
                username=u_name,
                turnstile_token=args.token
            )
            clients.append(client)

        async def run_all_clients():
            await asyncio.gather(*[c.run() for c in clients], return_exceptions=True)

        asyncio.run(run_all_clients())
        return

    print("=" * 70)
    print(f" Territorial.io Direct WebSocket Engine Client")
    print(f" Account: {acc_name} (Index: {args.account_index}) | Nickname: {acc_nick} (names.txt override)")
    print(f" Mode: {args.mode} | Target Map: {args.map} | Server: {args.server}")
    print("=" * 70)

    client = TerritorialClient(
        server_url=args.server,
        account_name=acc_name,
        password=acc_pass,
        mode=args.mode,
        map_name=args.map,
        username=acc_nick,
        turnstile_token=args.token
    )

    asyncio.run(client.run())


if __name__ == '__main__':
    main()
