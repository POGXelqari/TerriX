import asyncio
import json
import subprocess
import sys
import tempfile
import urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

async def test_tactical_gameplay():
    temp_dir = tempfile.mkdtemp()
    port = 9347
    flags = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={temp_dir}",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,800",
        "about:blank"
    ]
    proc = subprocess.Popen(flags)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        tabs = json.loads(req.read().decode())
        ws_url = next(t for t in tabs if t.get("type") == "page")["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            mid = 1
            async def call(m, p=None):
                nonlocal mid
                i = mid
                mid += 1
                await ws.send(json.dumps({"id": i, "method": m, "params": p or {}}))
                while True:
                    r = json.loads(await ws.recv())
                    if "method" in r and r["method"] == "Runtime.consoleAPICalled":
                        args = [str(a.get("value", "")) for a in r["params"].get("args", [])]
                        msg = " ".join(args)
                        if "[TerriX]" in msg or "spawn" in msg.lower() or "optimal" in msg.lower():
                            print(f"  [Console] {msg}", flush=True)
                    if r.get("id") == i:
                        return r

            await call("Runtime.enable")
            await call("Page.enable")
            await call("Network.enable")

            # Load tactical gameplay engine script
            with open("scripts/tactical_gameplay_engine.js", "r", encoding="utf-8") as f:
                tactical_code = f.read()

            init_script = """
            // Prototype Traps
            window.__terrix_engine = {};
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

            // Tactical Engine
            """ + tactical_code

            await call("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})
            await call("Page.navigate", {"url": "https://territorial.io/"})

            print("[*] Waiting for main menu...", flush=True)
            await asyncio.sleep(3)

            # Click Custom Scenario
            print("[*] Clicking '🗡️Custom Scenario'...", flush=True)
            await call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const cs = buttons.find(b => b.textContent && b.textContent.includes('Custom Scenario'));
                    if (cs) cs.click();
                })()
                """
            })
            await asyncio.sleep(1.5)

            # Click Play
            print("[*] Clicking '⚔️ Play'...", flush=True)
            await call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const play = buttons.find(b => b.textContent && b.textContent.includes('Play'));
                    if (play) play.click();
                })()
                """
            })

            print("[*] Match launched! Monitoring telemetry & spawn optimizer...", flush=True)
            for s in range(30):
                await asyncio.sleep(1)
                res = await call("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        try {
                            const opt = window.__terrix_optimizer;
                            const engine = window.__terrix_engine || {};
                            const aE = engine.aE;
                            const ah = engine.ah;
                            const myId = aE ? aE.fB : -1;
                            return JSON.stringify({
                                ready: !!(opt && opt.isReady()),
                                engine_keys: Object.keys(engine),
                                a1N: aE ? aE.a1N : -1,
                                hp: aE ? aE.hp : -1,
                                myPlayerId: myId,
                                pixels: (myId >= 0 && ah && ah.hF) ? ah.hF[myId] : 0,
                                troops: (myId >= 0 && ah && ah.hT) ? ah.hT[myId] : 0,
                                isSpawnPhase: opt ? opt.isSpawnPhase() : false,
                                hasSpawn: opt ? opt.hasCommittedSpawn() : false,
                                activeSpawn: window.__terrix_active_spawn || null,
                                expansion: window.__terrix_expansion ? window.__terrix_expansion.getMyState() : null
                            });
                        } catch (e) {
                            return JSON.stringify({ error: e.toString() });
                        }
                    })()
                    """,
                    "returnByValue": True
                })
                data = json.loads(res.get("result", {}).get("result", {}).get("value") or "{}")
                exp = data.get("expansion") or {}
                if s % 2 == 0 or data.get("hasSpawn") or data.get("pixels", 0) > 0:
                    px = data.get('pixels', 0)
                    tr = data.get('troops', 0)
                    phase = exp.get('phase', 'WAITING')
                    atks = exp.get('attackCount', 0)
                    has_n = exp.get('hasNeutralFrontier', False)
                    print(f"  [T+{s}s] Match Phase: {phase} | Pixels: {px} | Troops: {tr:,} | Neutral Border: {has_n} | Attacks: {atks}", flush=True)
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test_tactical_gameplay())
