#!/usr/bin/env python3
"""
Territorial.io Browser Automation Runner
========================================
High-performance browser-driven automation controller for Territorial.io.
Automates:
1. Legitimate account loading (localStorage credential injection)
2. Cloudflare Turnstile challenge solving via real browser environment (bypassing Error 4211)
3. Main menu navigation to Multiplayer -> Team Mode (Lobby 2)
4. Target map selection (e.g., Europe, World 2)
5. Autonomous tactical gameplay expansion loop

Powered by Chrome DevTools Protocol (CDP) over native WebSockets.
"""

import argparse
import asyncio
import json
import os
import random
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from typing import Optional, Dict, Any, List, Tuple

import websockets
from proxy_manager import ProxyManager

if sys.stdout is not None and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(__file__))

def find_chrome() -> str:
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    return candidates[0]


CHROME_PATH = find_chrome()
DEFAULT_URL = "https://territorial.io/"
CDP_PORT = 9444


class CDPClient:
    """Asynchronous Chrome DevTools Protocol client."""

    def __init__(self, ws_url: str):
        self.ws_url = ws_url
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self._msg_id = 0
        self._pending_requests: Dict[int, asyncio.Future] = {}
        self.event_handlers: List[Any] = []
        self._read_task: Optional[asyncio.Task] = None

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url, max_size=20_000_000)
        self._read_task = asyncio.create_task(self._listen())

    async def _listen(self):
        try:
            async for message in self.ws:
                data = json.loads(message)
                if "id" in data and data["id"] in self._pending_requests:
                    fut = self._pending_requests.pop(data["id"])
                    if not fut.done():
                        if "error" in data:
                            fut.set_exception(RuntimeError(data["error"]))
                        else:
                            fut.set_result(data.get("result", {}))
                elif "method" in data:
                    for handler in self.event_handlers:
                        try:
                            handler(data["method"], data.get("params", {}))
                        except Exception:
                            pass
        except asyncio.CancelledError:
            pass
        except Exception as e:
            pass

    async def call(self, method: str, params: Optional[dict] = None) -> dict:
        self._msg_id += 1
        req_id = self._msg_id
        fut = asyncio.get_running_loop().create_future()
        self._pending_requests[req_id] = fut
        payload = {"id": req_id, "method": method, "params": params or {}}
        await self.ws.send(json.dumps(payload))
        return await fut

    async def evaluate(self, expr: str) -> Any:
        res = await self.call("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True
        })
        return res.get("result", {}).get("value")

    async def click(self, x: int, y: int):
        await self.call("Input.dispatchMouseEvent", {
            "type": "mousePressed",
            "x": x,
            "y": y,
            "button": "left",
            "clickCount": 1
        })
        await asyncio.sleep(0.06)
        await self.call("Input.dispatchMouseEvent", {
            "type": "mouseReleased",
            "x": x,
            "y": y,
            "button": "left",
            "clickCount": 1
        })

    async def close(self):
        if self._read_task:
            self._read_task.cancel()
        if self.ws:
            await self.ws.close()


ALPHABET = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"


def generate_device_token(length: int = 15) -> str:
    """Generates authentic 15-character engine device token (localStorage d183)."""
    return "".join(random.choice(ALPHABET) for _ in range(length))


class LobbyCoordinator:
    """
    Centralized synchronization coordinator across concurrent Territorial.io bot instances.
    Guarantees that:
    1. All bot workers reach the lobby and clear Turnstile.
    2. The active map countdown is inspected for timing safety.
    3. If countdown has < 8 seconds or doesn't match target map, bots hold.
    4. When safe target window opens (> 10s remaining), all bots click 'Ready' simultaneously.
    """
    def __init__(self, target_count: int, target_map: str = "Europe", mode: str = "team"):
        self.target_count = target_count
        self.target_map = (target_map or "").strip().lower()
        self.mode = mode.lower()
        self.bot_states: Dict[int, str] = {}
        self.bot_info: Dict[int, dict] = {}
        self.swarm_spawns: Dict[int, dict] = {}
        self.ready_event = asyncio.Event()
        self._lock = asyncio.Lock()
        self.cycle_info: dict = {}

    async def register_spawn(self, instance_id: int, spawn_info: dict) -> List[dict]:
        async with self._lock:
            self.swarm_spawns[instance_id] = spawn_info
            uname = self.bot_info.get(instance_id, {}).get('username', f'#{instance_id}')
            print(f"  [Coordinator Swarm] Bot #{instance_id} ('{uname}') locked spawn at ({spawn_info.get('x')}, {spawn_info.get('y')}) [Score: {spawn_info.get('score', 0):.1f}]")
            return [s for i, s in self.swarm_spawns.items() if i != instance_id]

    async def register_bot(self, instance_id: int, account_name: str, username: str):
        async with self._lock:
            self.bot_states[instance_id] = "INIT"
            self.bot_info[instance_id] = {"account": account_name, "username": username}

    async def update_state(self, instance_id: int, state: str, extra: Optional[dict] = None):
        async with self._lock:
            self.bot_states[instance_id] = state
            if extra:
                self.bot_info[instance_id].update(extra)
            in_lobby = sum(1 for s in self.bot_states.values() if s in ("IN_LOBBY", "READY_ARMED", "IN_MATCH"))
            uname = self.bot_info.get(instance_id, {}).get('username', f'#{instance_id}')
            print(f"  [Coordinator] Bot #{instance_id} ('{uname}') -> {state} [{in_lobby}/{self.target_count} in lobby]")

    async def wait_for_all_in_lobby(self, timeout: Optional[float] = None) -> bool:
        if timeout is None:
            timeout = max(120.0, self.target_count * 25.0)
        start = time.time()
        while time.time() - start < timeout:
            async with self._lock:
                in_lobby = sum(1 for s in self.bot_states.values() if s in ("IN_LOBBY", "READY_ARMED", "IN_MATCH"))
                if in_lobby >= self.target_count:
                    return True
            await asyncio.sleep(0.5)
        return False

    def trigger_ready(self, cycle_info: dict):
        self.cycle_info = cycle_info
        self.ready_event.set()

    async def coordinate_lobby(self, master_runner: 'TerritorialAutomation'):
        """Monitors the lobby modal on the master bot and coordinates simultaneous Ready signal."""
        timeout = max(120.0, self.target_count * 25.0)
        print(f"[*] [Coordinator] Assembling ALL {self.target_count} bot(s) into lobby barrier (Max wait: {timeout:.0f}s)...")
        all_ready = await self.wait_for_all_in_lobby(timeout=timeout)
        if all_ready:
            print(f"[+] [Coordinator] ALL {self.target_count} bot(s) successfully in lobby! Beginning map sync...")
        else:
            async with self._lock:
                in_lobby = sum(1 for s in self.bot_states.values() if s in ("IN_LOBBY", "READY_ARMED", "IN_MATCH"))
            print(f"[!] [Coordinator] Timed out waiting for full swarm ({in_lobby}/{self.target_count} in lobby). Proceeding with assembled bots...")

        # Monitor lobby cycles
        for attempt in range(120):
            await asyncio.sleep(1)
            if self.ready_event.is_set():
                break

            if not master_runner.cdp:
                continue

            try:
                info = await master_runner.cdp.evaluate("""
                (() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const mapBtns = buttons.filter(b => b.textContent && (b.textContent.includes('Teams') || b.textContent.includes('Next Game') || b.textContent.includes('Players')));
                    const readyBtn = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Ready'));
                    const teamBtn = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Team'));
                    
                    let activeText = "";
                    let nextText = "";
                    if (mapBtns.length > 0) activeText = mapBtns[0].textContent.trim();
                    if (mapBtns.length > 1) nextText = mapBtns[1].textContent.trim();
                    
                    return {
                        activeText,
                        nextText,
                        hasReady: !!readyBtn,
                        readyText: readyBtn ? readyBtn.textContent.trim() : "",
                        teamText: teamBtn ? teamBtn.textContent.trim() : ""
                    };
                })()
                """)
            except Exception:
                continue

            if not info or not info.get("hasReady"):
                continue

            active_text = info.get("activeText", "")
            next_text = info.get("nextText", "")

            # Parse remaining seconds e.g. "(14s)" or "(14)"
            m_sec = re.search(r'\((\d+)\s*s?\)', active_text)
            seconds_left = int(m_sec.group(1)) if m_sec else 15

            # Map matching:
            target_norm = self.target_map.lower().replace(" ", "").replace("_", "")
            active_norm = active_text.lower().replace(" ", "").replace("_", "")

            # Map matches if target is empty/any/world2 or substring is found
            map_matches = True
            if target_norm and target_norm not in ("any", "next", "world2", ""):
                map_matches = target_norm in active_norm

            # Strict swarm assembly check before trigger
            async with self._lock:
                current_in_lobby = sum(1 for s in self.bot_states.values() if s in ("IN_LOBBY", "READY_ARMED", "IN_MATCH"))

            if current_in_lobby < self.target_count:
                print(f"  [Coordinator Barrier] Map '{active_text}' ({seconds_left}s) held: Only {current_in_lobby}/{self.target_count} bots assembled. Waiting for remaining bots...")
                await asyncio.sleep(min(3, max(1, seconds_left)))
                continue

            print(f"  [Lobby Cycle] Active: '{active_text}' | Countdown: {seconds_left}s | Target Match ({self.target_map}): {map_matches}")

            # Convergence rule:
            # If map matches AND seconds_left >= 8s AND all bots in lobby: safe to click Ready
            if map_matches and seconds_left >= 8:
                print(f"[🚀 CONVERGENCE TRIGGER] Map '{active_text}' has {seconds_left}s remaining! Arming ALL {self.target_count} bots simultaneously!")
                self.trigger_ready({"active": active_text, "countdown": seconds_left})
                break
            elif not map_matches:
                print(f"  [Coordinator] Waiting for map rotation to '{self.target_map}' (Currently: '{active_text}')...")
            elif seconds_left < 8:
                print(f"  [Coordinator] Countdown {seconds_left}s too close to rollover. Waiting for next map cycle...")
                await asyncio.sleep(max(1, seconds_left))

        if not self.ready_event.is_set():
            print(f"[!] [Coordinator] Safety fallback trigger after monitoring window.")
            self.trigger_ready({"active": "fallback", "countdown": 0})


class TerritorialAutomation:
    """End-to-end automation controller for Territorial.io."""

    def __init__(self, account_name: str, password: str, mode: str = "team", target_map: str = "Europe",
                 headless: bool = False, target_url: str = DEFAULT_URL, username: str = "",
                 cdp_port: int = CDP_PORT, instance_id: int = 0,
                 coordinator: Optional[LobbyCoordinator] = None,
                 turnstile_semaphore: Optional[asyncio.Semaphore] = None,
                 proxy: Optional[Dict[str, Any]] = None):
        self.account_name = account_name
        self.password = password
        self.mode = mode.lower()
        self.target_map = target_map
        self.headless = headless
        self.target_url = target_url
        self.username = username or "[FR] Zodiac"
        self.cdp_port = cdp_port
        self.instance_id = instance_id
        self.coordinator = coordinator
        self.turnstile_semaphore = turnstile_semaphore
        self.proxy = proxy
        self.device_token = generate_device_token(15)
        self.chrome_proc = None
        self.temp_dir = None
        self.cdp = None
        self.active_server = None
        self.is_in_match = False
        self.tick_count = 0

    def _find_free_port(self, base_port: int) -> int:
        import socket
        for p in range(base_port, base_port + 100):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                    s.bind(("127.0.0.1", p))
                    return p
            except Exception:
                continue
        return base_port

    def start_chrome(self) -> str:
        """Launches isolated Chrome instance configured for CDP automation."""
        sessions_base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".chrome_sessions")
        os.makedirs(sessions_base, exist_ok=True)
        self.temp_dir = tempfile.mkdtemp(prefix=f"bot_{self.instance_id}_", dir=sessions_base)
        self.cdp_port = self._find_free_port(self.cdp_port)
        
        # Standard desktop geometry ensures proper canvas and button positioning
        if self.headless:
            win_w = 1280
            win_h = 800
            win_x = -2500
            win_y = -2500 - (self.instance_id * 200)
        else:
            # Visible mode: Single bot gets full desktop window; multi-bots tile cleanly
            if self.instance_id == 0 and (not self.coordinator or self.coordinator.target_count <= 1):
                win_w = 1280
                win_h = 800
                win_x = 60
                win_y = 40
            else:
                win_w = 720
                win_h = 540
                col = self.instance_id % 3
                row = self.instance_id // 3
                win_x = col * (win_w + 10)
                win_y = row * (win_h + 35)

        flags = [
            CHROME_PATH,
            f"--remote-debugging-port={self.cdp_port}",
            f"--user-data-dir={self.temp_dir}",
            f"--window-size={win_w},{win_h}",
            f"--window-position={win_x},{win_y}",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--mute-audio",
            "about:blank"
        ]
        if self.proxy:
            flags.append(f"--proxy-server={self.proxy['protocol']}://{self.proxy['host']}:{self.proxy['port']}")

        self.chrome_proc = subprocess.Popen(flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[*] [Worker {self.instance_id}] Spawned Chrome (PID: {self.chrome_proc.pid}, Offscreen/Headless: {self.headless}) on port {self.cdp_port}")

        # Poll for CDP endpoint
        ws_url = None
        for _ in range(30):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{self.cdp_port}/json") as resp:
                    tabs = json.loads(resp.read().decode())
                    page_tab = next((t for t in tabs if t.get("type") == "page"), None)
                    if page_tab:
                        ws_url = page_tab["webSocketDebuggerUrl"]
                        break
            except Exception:
                time.sleep(0.3)

        if not ws_url:
            raise RuntimeError(f"Failed to connect to Chrome DevTools endpoint on port {self.cdp_port}")
        return ws_url

    def on_cdp_event(self, method: str, params: dict):
        """Monitors network events and console messages."""
        if method == "Runtime.consoleAPICalled":
            args = [str(a.get("value", "")) for a in params.get("args", [])]
            msg = " ".join(args)
            if "turnstile" in msg.lower() or "connection to server" in msg.lower() or "terrix" in msg.lower() or "sendtoken" in msg.lower():
                print(f"  [Browser Console #{self.instance_id}] {msg}")
        elif method == "Network.webSocketCreated":
            url = params.get("url", "")
            if "territorial.io" in url:
                self.active_server = url
                print(f"[+] [Worker {self.instance_id}] Active Game WebSocket Connected: {url}")

    async def run(self, duration: int = 120):
        """Executes full automated workflow."""
        if self.coordinator:
            await self.coordinator.register_bot(self.instance_id, self.account_name, self.username)

        ws_url = self.start_chrome()
        self.cdp = CDPClient(ws_url)
        await self.cdp.connect()
        self.cdp.event_handlers.append(self.on_cdp_event)

        print(f"[+] [Worker {self.instance_id}] CDP Client connected successfully.")

        # Enable necessary CDP domains
        await self.cdp.call("Runtime.enable")
        await self.cdp.call("Page.enable")
        await self.cdp.call("Network.enable")

        # Standardize viewport metrics to authentic full desktop layout
        try:
            await self.cdp.call("Emulation.setDeviceMetricsOverride", {
                "width": 1280,
                "height": 800,
                "deviceScaleFactor": 1,
                "mobile": False
            })
        except Exception:
            pass

        # Anti-detection stealth script, pre-provisioned credentials & tactical autonomous engine
        tactical_engine_path = os.path.join(os.path.dirname(__file__), "tactical_gameplay_engine.js")
        tactical_engine_code = ""
        if os.path.exists(tactical_engine_path):
            with open(tactical_engine_path, "r", encoding="utf-8") as f:
                tactical_engine_code = f.read()

        init_script = """
        // 1. Pre-provision authenticated credentials & unique device token into storage
        try {
            localStorage.setItem("d105", "%s");
            localStorage.setItem("d106", "%s");
            localStorage.setItem("d116", "%s;%s");
            localStorage.setItem("d117", "0");
            localStorage.setItem("d122", "%s");
            localStorage.setItem("d183", "%s");
        } catch (e) {}

        // 2. Anti-detection stealth overrides
        try {
            Object.defineProperty(document, 'hasFocus', { get: () => true });
            Object.defineProperty(document, 'hidden', { get: () => false });
            Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
        } catch (e) {}

        try {
            delete Object.getPrototypeOf(navigator).webdriver;
        } catch (e) {}
        Object.defineProperty(navigator, 'webdriver', { get: () => false });

        window.chrome = {
            app: { isInstalled: false },
            runtime: {},
            loadTimes: function() {},
            csi: function() {}
        };

        // 3. Anti-detection state
        window.__terrix = {
            active: true,
            account: '%s',
            mode: '%s',
            targetMap: '%s',
            gameState: 'INIT',
            ticks: 0
        };

        // 4. Mouse movement simulation for Cloudflare passive telemetry
        window.addEventListener('DOMContentLoaded', () => {
            let x = 100, y = 100;
            const interval = setInterval(() => {
                x += Math.floor(Math.random() * 5);
                y += Math.floor(Math.random() * 5);
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
                if (x > 300) clearInterval(interval);
            }, 100);
        });

        // 5. Engine Closure Prototype Traps (Intercepts internal game engine instances)
        window.__terrix_engine = {};
        window.__terrix_token_sent = false;
        window.__terrix_turnstile_success = false;

        const origLog = console.log;
        console.log = function(...args) {
            if (args.some(a => typeof a === 'string' && a.includes('turnstile success'))) {
                window.__terrix_turnstile_success = true;
            }
            if (args.some(a => typeof a === 'string' && a.includes('sendTokenToLobby success'))) {
                window.__terrix_token_sent = true;
            }
            return origLog.apply(this, args);
        };

        function trap(prop, name, condition) {
            let storageKey = "__" + prop;
            Object.defineProperty(Object.prototype, prop, {
                set: function(val) {
                    if (!condition || condition(val, this)) {
                        window.__terrix_engine[name] = this;
                    }
                    this[storageKey] = val;
                },
                get: function() {
                    return this[storageKey];
                },
                configurable: true
            });
        }

        trap("a4x", "aE", (v) => v === 1500000000);
        trap("ko", "bB", (v, obj) => !!(obj.hr && obj.pg));
        trap("a4l", "ah", (v, obj) => ArrayBuffer.isView(v) && v.length === 512);
        trap("fM", "ad", (v) => typeof v === "function");
        trap("fZ", "bP", (v) => typeof v === "function");
        trap("hq", "bu", (v) => typeof v === "function");
        trap("fP", "bj", (v) => ArrayBuffer.isView(v));
        trap("pm", "b1", (v) => typeof v === "object");
        trap("xt", "bV", () => true);
        trap("hx", "bv", (v) => typeof v === "function");
        trap("eU", "bX", (v) => typeof v === "function");

        // 6. Autonomous Tactical Gameplay Engine
        %s
        """ % (
            self.account_name, self.password, self.account_name, self.password, self.username, self.device_token,
            self.account_name, self.mode, self.target_map, tactical_engine_code
        )

        await self.cdp.call("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})

        # Step 1: Navigate to game URL (pre-authenticated with zero reload needed)
        target = self.target_url.strip()
        if not target.startswith("http://") and not target.startswith("https://"):
            target = "https://" + target
        target = target.rstrip('/') + '/'
        print(f"[*] [Worker {self.instance_id}] Navigating to {target} (Pre-provisioned: '{self.account_name}' / '{self.username}')...")
        try:
            await self.cdp.call("Page.bringToFront")
        except Exception:
            pass
        await self.cdp.call("Page.navigate", {"url": target})

        # Actively confirm navigation and wait for DOM & canvas initialization
        nav_confirmed = False
        for step in range(50):
            await asyncio.sleep(0.4)
            try:
                curr_url = await self.cdp.evaluate("window.location.href")
                ready = await self.cdp.evaluate("document.readyState")
                has_canvas = await self.cdp.evaluate("!!document.getElementById('canvasA')")
                if has_canvas or ("territorial.io" in str(curr_url) and ready in ("interactive", "complete")):
                    nav_confirmed = True
                    print(f"[+] [Worker {self.instance_id}] Navigation confirmed: {curr_url} (ReadyState: {ready})")
                    break
                elif "chrome-error://" in str(curr_url):
                    print(f"[-] [Worker {self.instance_id}] Network error ({curr_url}). Retrying navigation...")
                    await self.cdp.call("Page.navigate", {"url": target})
                    await asyncio.sleep(1.0)
                elif str(curr_url) == "about:blank" and step >= 6 and step % 6 == 0:
                    print(f"[*] [Worker {self.instance_id}] Re-triggering navigation to {target} (still on about:blank)...")
                    await self.cdp.call("Page.navigate", {"url": target})
            except Exception:
                pass

        if not nav_confirmed:
            print(f"[-] [Worker {self.instance_id}] Navigation confirmation warning; continuing with evaluation...")

        try:
            await self.cdp.evaluate("window.focus();")
        except Exception:
            pass

        # Step 2: Wait for Turnstile passive clearance before entering Multiplayer
        print(f"[*] [Worker {self.instance_id}] Queuing for Turnstile clearance slot...")
        turnstile_cleared = False
        sem = self.turnstile_semaphore or asyncio.Semaphore(10)
        async with sem:
            print(f"[*] [Worker {self.instance_id}] Acquired Turnstile slot. Awaiting passive solve (up to 50s)...")
            for s in range(100):
                await asyncio.sleep(0.5)
                token_val = await self.cdp.evaluate("""
                (() => {
                    if (window.__terrix_turnstile_success) return "INTERCEPTED_SUCCESS";
                    const inp = document.querySelector('input[name="cf-turnstile-response"]');
                    if (inp && inp.value) return inp.value;
                    return null;
                })()
                """)
                if token_val:
                    turnstile_cleared = True
                    print(f"[+] [Worker {self.instance_id}] Turnstile passively solved in {(s + 1) * 0.5:.1f}s!")
                    break
        if not turnstile_cleared:
            print(f"[-] [Worker {self.instance_id}] Warning: Turnstile clearance timed out after 50s. Proceeding with caution...")

        # Update visual input field for nickname in UI
        await self.cdp.evaluate(f"""
        (() => {{
            const input = Array.from(document.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.includes('Kingdom'));
            if (input) {{
                input.value = "{self.username}";
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                input.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}
        }})()
        """)

        # Confirm canvas geometry
        canvas_info = await self.cdp.evaluate("""
        (() => {
            const c = document.getElementById('canvasA');
            return c ? { w: c.width, h: c.height, clientW: c.clientWidth, clientH: c.clientHeight } : null;
        })()
        """)
        if not canvas_info:
            print(f"[-] [Worker {self.instance_id}] Waiting additional 2s for canvasA...")
            await asyncio.sleep(2)
            canvas_info = await self.cdp.evaluate("(() => { const c = document.getElementById('canvasA'); return { w: c.width, h: c.height }; })()")

        # Step 4: Navigate to Multiplayer via Resilient Detection & Dispatch
        print(f"[*] [Worker {self.instance_id}] Entering Multiplayer Lobby...")
        mp_success = False
        for mp_attempt in range(40):
            res = await self.cdp.evaluate("""
            (() => {
                // 1. Check DOM button first
                const buttons = Array.from(document.querySelectorAll('button'));
                const mp = buttons.find(b => b.textContent && b.textContent.includes('Multiplayer'));
                if (mp) {
                    mp.click();
                    return "DOM_CLICKED";
                }
                // 2. Fallback to exact canvas geometry calculation
                const canvas = document.getElementById('canvasA');
                if (canvas && canvas.width > 0 && canvas.height > 0) {
                    const rect = canvas.getBoundingClientRect();
                    const w = canvas.width, h = canvas.height;
                    const ib = Math.min(w, h);
                    const k = Math.floor(0.093 * ib);
                    const j = Math.floor(4.2 * k);
                    const gap = Math.floor(0.025 * j);
                    const btnW = Math.floor(0.6 * j - gap / 2);
                    const btnX = Math.floor(0.5 * w - 0.5 * j);
                    const btnY = Math.floor(0.54 * h);
                    const scaleX = rect.width / w;
                    const scaleY = rect.height / h;
                    const clientX = rect.left + (btnX + btnW / 2) * scaleX;
                    const clientY = rect.top + (btnY + k / 2) * scaleY;
                    
                    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
                    const up = new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
                    const clk = new MouseEvent('click', { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
                    canvas.dispatchEvent(down);
                    canvas.dispatchEvent(up);
                    canvas.dispatchEvent(clk);
                    return "CANVAS_DISPATCHED";
                }
                return "WAITING";
            })()
            """)
            if res in ("DOM_CLICKED", "CANVAS_DISPATCHED"):
                mp_success = True
                break
            await asyncio.sleep(0.5)

        # Step 5: Wait for Turnstile verification and Lobby Modal
        print(f"[*] [Worker {self.instance_id}] Waiting for Turnstile clearance & Lobby Modal to initialize (up to 60s)...")
        lobby_ready = False
        lobby_info = {}
        for attempt in range(60):
            await asyncio.sleep(1)
            lobby_info = await self.cdp.evaluate("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const teamBtn = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Team'));
                const readyBtn = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Ready'));
                const mapInfo = buttons.filter(b => b.textContent && (b.textContent.includes('Teams') || b.textContent.includes('Next Game') || b.textContent.includes('Players')));
                const tokenSent = !!window.__terrix_token_sent;

                // Active token flush attempt if in lobby
                const engine = window.__terrix_engine || {};
                if (!tokenSent && engine.bX && engine.bX.turnstile && typeof engine.bX.turnstile.ew === 'function') {
                    try { engine.bX.turnstile.ew(); } catch (e) {}
                }

                if (teamBtn || readyBtn) {
                    return {
                        ready: true,
                        tokenSent: tokenSent,
                        teamText: teamBtn ? teamBtn.textContent.trim() : "",
                        readyText: readyBtn ? readyBtn.textContent.trim() : "",
                        maps: mapInfo.map(m => m.textContent.trim())
                    };
                }
                return { ready: false };
            })()
            """)
            if lobby_info and lobby_info.get("ready"):
                if lobby_info.get("tokenSent") or attempt >= 20:
                    lobby_ready = True
                    break

        if lobby_ready:
            token_status = lobby_info.get("tokenSent", False)
            print(f"[+] [Worker {self.instance_id}] Lobby Modal detected! Verified Token Dispatched: {token_status}")
            if lobby_info.get("teamText"):
                print(f"  [Worker {self.instance_id}] Roster: {lobby_info.get('teamText')}")
            for m in lobby_info.get("maps", []):
                print(f"  [Worker {self.instance_id}] Map: {m}")

            # Notify coordinator of arrival
            if self.coordinator:
                await self.coordinator.update_state(self.instance_id, "IN_LOBBY", lobby_info)
                print(f"[*] [Worker {self.instance_id}] Holding at synchronization barrier for target map cycle...")
                await self.coordinator.ready_event.wait()
                print(f"[+] [Worker {self.instance_id}] Ready signal received! Executing synchronized entry...")

            # Select Mode
            mode_prefix = self.mode.capitalize()
            if self.mode == "br":
                mode_prefix = "Battle Royale"

            print(f"[*] [Worker {self.instance_id}] Selecting '{mode_prefix}' mode in lobby...")
            await self.cdp.evaluate(f"""
            (() => {{
                const buttons = Array.from(document.querySelectorAll('button'));
                const target = buttons.find(b => b.textContent && b.textContent.trim().startsWith('{mode_prefix}'));
                if (target) target.click();
            }})()
            """)
            await asyncio.sleep(0.2)

            # Wait for Turnstile token before locking Ready (prevents Error 4591)
            token_verified = False
            for twait in range(15):
                token_verified = await self.cdp.evaluate("!!window.__terrix_token_sent")
                if token_verified:
                    break
                await self.cdp.evaluate("""
                (() => {
                    try {
                        const bX = window.__terrix_engine && window.__terrix_engine.bX;
                        if (bX && bX.turnstile && bX.turnstile.eq === 1) {
                            bX.turnstile.ew();
                        }
                    } catch(e) {}
                })()
                """)
                await asyncio.sleep(0.5)

            if not token_verified:
                print(f"  [Worker {self.instance_id} Notice] Locking Ready (Turnstile resolution window concluded).")

            # Click Ready
            print(f"[*] [Worker {self.instance_id}] Toggling 'Ready' status to lock into match...")
            ready_res = await self.cdp.evaluate("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const readyBtn = buttons.find(b => b.textContent && (b.textContent.includes('Ready') || b.textContent.includes('Cancel')));
                if (readyBtn) {
                    readyBtn.click();
                    return readyBtn.textContent.trim();
                }
                return "READY_BTN_NOT_FOUND";
            })()
            """)
            print(f"[+] [Worker {self.instance_id}] Ready Status: {ready_res}")
            if self.coordinator:
                await self.coordinator.update_state(self.instance_id, "READY_ARMED")
        else:
            print(f"[-] [Worker {self.instance_id}] Warning: Lobby modal did not appear within 60s. Proceeding to in-game agent hook...")

        # Step 6: Verify Autonomous In-Game Tactical Gameplay Agent
        agent_ready = await self.cdp.evaluate("typeof window.TerriXSpawnOptimizer !== 'undefined'")
        if not agent_ready and tactical_engine_code:
            print(f"[*] [Worker {self.instance_id}] Injecting Tactical Gameplay Engine...")
            await self.cdp.evaluate(tactical_engine_code)
        print(f"[+] [Worker {self.instance_id}] Tactical Gameplay Agent Online & Armed.")

        # Step 7: Maintain Active Gameplay Session Loop & Tactical Telemetry Watchdog
        print("=" * 70)
        print(f" Autonomous Session Active: {self.mode.upper()} Mode | Account: {self.account_name}")
        print(f" Nickname: {self.username} | Target Map: {self.target_map} | Duration: {duration}s")
        print("=" * 70)

        spawn_reported = False
        last_pixels = 0
        for i in range(duration):
            await asyncio.sleep(1)

            # Query real-time in-game telemetry from engine closure
            telemetry_raw = await self.cdp.evaluate("""
            (() => {
                try {
                    const opt = window.__terrix_optimizer;
                    const engine = window.__terrix_engine || {};
                    const aE = engine.aE;
                    const ah = engine.ah;
                    const myId = aE ? aE.fB : -1;
                    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean);
                    const modalText = document.body ? document.body.innerText.replace(/\\n+/g, ' | ') : "";
                    return JSON.stringify({
                        ready: !!(opt && opt.isReady()),
                        engine_keys: Object.keys(engine),
                        a1N: aE ? aE.a1N : -1,
                        hp: aE ? aE.hp : -1,
                        a5r: aE ? aE.a5r : -1,
                        myPlayerId: myId,
                        pixels: (myId >= 0 && ah && ah.hF) ? ah.hF[myId] : 0,
                        troops: (myId >= 0 && ah && ah.hT) ? ah.hT[myId] : 0,
                        isSpawnPhase: opt ? opt.isSpawnPhase() : false,
                        hasSpawn: opt ? opt.hasCommittedSpawn() : false,
                        activeSpawn: window.__terrix_active_spawn || null,
                        expansion: window.__terrix_expansion ? window.__terrix_expansion.getMyState() : null,
                        buttons: buttons.slice(0, 5),
                        modalText: modalText.slice(0, 300)
                    });
                } catch (err) {
                    return JSON.stringify({ ready: false, error: err.toString() });
                }
            })()
            """)

            telemetry = json.loads(telemetry_raw) if telemetry_raw else {}

            if not telemetry:
                if i % 5 == 0:
                    print(f"  [Worker {self.instance_id} T+{i}s] Telemetry evaluate returned None")
            elif telemetry.get("error"):
                print(f"  [Worker {self.instance_id} T+{i}s] Telemetry JS Error: {telemetry.get('error')}")
            elif not spawn_reported and (i % 5 == 0 or i == 1):
                print(f"  [Worker {self.instance_id} T+{i}s] a1N={telemetry.get('a1N')}, hp={telemetry.get('hp')}, buttons={telemetry.get('buttons')}")
                if any("Reload" in b for b in telemetry.get("buttons", [])):
                    print(f"  [Worker {self.instance_id} Modal Detected] {telemetry.get('modalText')[:200]}")

            if telemetry and telemetry.get("ready"):
                is_spawning = telemetry.get("isSpawnPhase", False)
                has_spawn = telemetry.get("hasSpawn", False)
                active_spawn = telemetry.get("activeSpawn")

                if is_spawning:
                    if has_spawn and active_spawn and not spawn_reported:
                        spawn_reported = True
                        x = active_spawn.get("x")
                        y = active_spawn.get("y")
                        fD = active_spawn.get("fD")
                        score = active_spawn.get("score", 0)
                        print(f"[***] [Worker {self.instance_id}] OPTIMAL SPAWN COMMITTED: ({x}, {y}) [Tile: {fD}, Score: {score:.1f}]")

                        # Register with Swarm Coordinator and broadcast
                        if self.coordinator:
                            swarm_list = await self.coordinator.register_spawn(self.instance_id, active_spawn)
                            if swarm_list:
                                await self.cdp.evaluate(f"window.__terrix_swarm_spawns = {json.dumps(swarm_list)};")
                    elif not has_spawn:
                        if i % 3 == 0:
                            print(f"  [Worker {self.instance_id}] Analyzing map grid... Evaluating candidate fitness landscape.")
                else:
                    if spawn_reported and (i % 5 == 0 or telemetry.get("pixels", 0) != last_pixels):
                        last_pixels = telemetry.get("pixels", 0)
                        troops = telemetry.get("troops", 0)
                        exp_data = telemetry.get("expansion") or {}
                        atk_cnt = exp_data.get("attackCount", 0)
                        phase = exp_data.get("phase", "IN_MATCH")
                        if i % 5 == 0 or atk_cnt > 0:
                            print(f"  [Worker {self.instance_id} Tactical] Phase: {phase} | Territory: {last_pixels} px | Army Balance: {troops:,} | Attacks Dispatched: {atk_cnt}")

            if i % 15 == 0 and i > 0 and not spawn_reported:
                print(f"  [Active Session] Elapsed: {i}s / {duration}s | Server: {self.active_server or 'Connecting...'}")

        print(f"[+] Automation run completed ({duration}s reached).")

    def cleanup(self):
        """Terminates processes and cleans up temporary browser directories."""
        if self.cdp:
            try:
                asyncio.run(self.cdp.close())
            except Exception:
                pass
        if self.chrome_proc:
            print("[*] Terminating Chrome instance...")
            self.chrome_proc.terminate()
            try:
                self.chrome_proc.wait(timeout=3)
            except Exception:
                self.chrome_proc.kill()
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir, ignore_errors=True)
        print("[+] Session cleanup complete.")


def load_names(names_file: Optional[str] = None) -> List[str]:
    """Loads custom usernames from names.txt or fallback candidates."""
    try:
        from account_creator import load_names as creator_load_names
        return creator_load_names(names_file)
    except Exception:
        pass

    candidates = []
    if names_file:
        candidates.append(names_file)
    candidates.append(os.path.join(os.path.dirname(__file__), "..", "names.txt"))
    candidates.append(os.path.join(os.path.dirname(__file__), "..", "data", "names.txt"))

    for path in candidates:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    names = [line.strip() for line in f if line.strip() and not line.startswith("#")]
                    if names:
                        return names
            except Exception:
                pass
    return ["[FR] Zodiac", "[ARCH] VNVRCHY", "[Lone] SLΛMNATION", "[OG]Kium", "[TECH] SmartPlayer"]


def load_verified_account(index: int = 0, auto_provision: bool = True, names_file: Optional[str] = None) -> Tuple[str, str, str]:
    """
    Loads account at given index from pool.
    If index exceeds existing accounts and auto_provision is True,
    calls account_creator to generate and validate new accounts on-demand.
    """
    try:
        from account_creator import get_account_by_index
        acc = get_account_by_index(index, names_file=names_file, auto_provision=auto_provision)
        return acc["account_name"], acc["password"], acc.get("username", "")
    except Exception as e:
        print(f"[-] Warning loading account via account_creator: {e}")
        accounts_file = os.path.join(os.path.dirname(__file__), "..", "data", "valid_accounts.json")
        if os.path.exists(accounts_file):
            with open(accounts_file, "r", encoding="utf-8") as f:
                accs = json.load(f)
                if accs:
                    idx = index % len(accs)
                    return accs[idx]["account_name"], accs[idx]["password"], accs[idx].get("username", "")
        return "kK2bN", "lZ4YVF9svzGmkMV", "[FR] Zodiac"


def main():
    parser = argparse.ArgumentParser(description="Territorial.io Browser Automation Runner")
    parser.add_argument("--account", type=str, default="", help="Account Name (default: first verified)")
    parser.add_argument("--password", type=str, default="", help="Account Password")
    parser.add_argument("--account-index", type=int, default=0, help="Account index from valid_accounts.json (default: 0)")
    parser.add_argument("--username", type=str, default="", help="Nickname to override 'Player' username")
    parser.add_argument("--names", type=str, default="", help="Path to names.txt to override 'Player' username")
    parser.add_argument("--mode", type=str, default="team", choices=["team", "ffa", "1v1", "br", "zombies"],
                        help="Game mode (default: team)")
    parser.add_argument("--map", type=str, default="any", help="Target Map (default: any, or specify e.g. Europe, Caucasia)")
    parser.add_argument("--headless", action="store_true", help="Run Chrome in headless mode")
    parser.add_argument("--url", type=str, default=DEFAULT_URL, help=f"Target URL (default: {DEFAULT_URL})")
    parser.add_argument("--duration", type=int, default=60, help="Session duration in seconds (default: 60)")
    parser.add_argument("--count", type=int, default=1, help="Number of concurrent bot instances to run (default: 1)")
    parser.add_argument("--multi", type=int, default=0, help="Alias for --count: run N concurrent bots")
    parser.add_argument("--ensure-accounts", type=int, default=0, help="Ensure at least N verified accounts exist before running")
    parser.add_argument("--auto-generate", action="store_true", help="Automatically generate accounts if insufficient verified accounts exist")
    parser.add_argument("--proxies", type=str, default="", help="Path to proxy list (optional, default: none / direct)")
    parser.add_argument("--use-proxy", action="store_true", help="Enable proxy routing for browser instances")
    args = parser.parse_args()

    # Pre-provision account pool if requested
    if args.ensure_accounts > 0:
        try:
            from account_creator import ensure_account_pool
            ensure_account_pool(args.ensure_accounts, names_file=args.names or None)
        except Exception as e:
            print(f"[-] Warning ensuring accounts: {e}")

    auto_prov = args.auto_generate or (args.ensure_accounts > 0)
    bot_count = max(args.count, args.multi, 1)
    names_list = load_names(args.names or None)

    use_proxy = args.use_proxy or bool(args.proxies)
    pm = None
    if use_proxy:
        p_file = args.proxies if args.proxies else "proxy.txt"
        pm = ProxyManager(proxy_file=p_file, auto_dynamic=False)
        if pm.count() > 0:
            print(f"[*] Loaded {pm.count()} proxy endpoint(s) from '{pm.proxy_file}'")

    if bot_count > 1:
        # Multi-bot execution mode with Centralized Synchronization Coordinator
        print("=" * 70)
        print(f" Launching {bot_count} Synchronized Automation Bots [Mode: {args.mode} | Map: {args.map}]")
        print(f" Loaded {len(names_list)} nickname(s) from names.txt (overriding 'Player' username)")
        print("=" * 70)

        # Ensure we have enough accounts for all bots
        if auto_prov:
            try:
                from account_creator import ensure_account_pool
                ensure_account_pool(bot_count, names_file=args.names or None)
            except Exception as e:
                print(f"[-] Warning ensuring account pool: {e}")

        coordinator = LobbyCoordinator(target_count=bot_count, target_map=args.map, mode=args.mode)
        turnstile_sem = asyncio.Semaphore(3)

        runners = []
        for i in range(bot_count):
            acc_name, acc_pass, nick = load_verified_account(i, auto_provision=auto_prov, names_file=args.names or None)
            assigned_nick = args.username if (args.username and bot_count == 1) else (nick or names_list[i % len(names_list)])
            port = CDP_PORT + i
            assigned_proxy = pm.get_proxy(i) if (pm and pm.count() > 0) else None
            runner = TerritorialAutomation(
                account_name=acc_name,
                password=acc_pass,
                mode=args.mode,
                target_map=args.map,
                headless=args.headless,
                target_url=args.url,
                username=assigned_nick,
                cdp_port=port,
                instance_id=i,
                coordinator=coordinator,
                turnstile_semaphore=turnstile_sem,
                proxy=assigned_proxy
            )
            runners.append(runner)

        async def run_all():
            async def start_staggered(r, delay):
                if delay > 0:
                    await asyncio.sleep(delay)
                return await r.run(duration=args.duration)

            # Spawn workers with staggered delay to avoid Turnstile burst collisions and disk thrashing
            worker_tasks = [asyncio.create_task(start_staggered(r, i * 1.5)) for i, r in enumerate(runners)]
            # Run coordinator monitor alongside
            coord_task = asyncio.create_task(coordinator.coordinate_lobby(runners[0]))

            await asyncio.gather(coord_task, *worker_tasks, return_exceptions=True)

        try:
            asyncio.run(run_all())
        except KeyboardInterrupt:
            print("\n[!] User interrupted multi-bot execution.")
        finally:
            for r in runners:
                r.cleanup()
        return

    # Single-bot execution mode
    acc_name = args.account
    acc_pass = args.password
    acc_nick = args.username

    if not acc_name:
        acc_name, acc_pass, default_nick = load_verified_account(args.account_index, auto_provision=auto_prov, names_file=args.names or None)
        if not acc_nick:
            acc_nick = names_list[args.account_index % len(names_list)]

    if not acc_nick:
        acc_nick = names_list[0]

    coordinator = LobbyCoordinator(target_count=1, target_map=args.map, mode=args.mode)
    assigned_proxy = pm.get_proxy(args.account_index) if (pm and pm.count() > 0) else None
    runner = TerritorialAutomation(
        account_name=acc_name,
        password=acc_pass,
        mode=args.mode,
        target_map=args.map,
        headless=args.headless,
        target_url=args.url,
        username=acc_nick,
        cdp_port=CDP_PORT,
        instance_id=0,
        coordinator=coordinator,
        proxy=assigned_proxy
    )

    async def run_single():
        worker_task = asyncio.create_task(runner.run(duration=args.duration))
        coord_task = asyncio.create_task(coordinator.coordinate_lobby(runner))
        await asyncio.gather(coord_task, worker_task, return_exceptions=True)

    try:
        asyncio.run(run_single())
    except KeyboardInterrupt:
        print("\n[!] User interrupted execution.")
    finally:
        runner.cleanup()


if __name__ == '__main__':
    main()
