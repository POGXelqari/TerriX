import asyncio
import json
import subprocess
import sys
import tempfile
import urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

async def test_stealth_headless():
    temp_dir = tempfile.mkdtemp()
    port = 9361
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    flags = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={temp_dir}",
        "--disable-blink-features=AutomationControlled",
        "--window-position=-2500,-2500",
        "--window-size=800,600",
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
                        print("CONSOLE:", " ".join(args))
                    if r.get("id") == i:
                        return r

            await call("Runtime.enable")
            await call("Page.enable")

            stealth_script = """
            // 1. Focus & Visibility
            try {
                Object.defineProperty(document, 'hasFocus', { get: () => true });
                Object.defineProperty(document, 'hidden', { get: () => false });
                Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
            } catch (e) {}

            // 2. Webdriver & Plugins
            try {
                delete Object.getPrototypeOf(navigator).webdriver;
            } catch (e) {}
            Object.defineProperty(navigator, 'webdriver', { get: () => false });

            // 3. Chrome Runtime Mock
            window.chrome = {
                app: { isInstalled: false },
                runtime: {},
                loadTimes: function() {},
                csi: function() {}
            };

            // 4. Mouse movement simulation on load
            window.addEventListener('DOMContentLoaded', () => {
                let x = 100, y = 100;
                const interval = setInterval(() => {
                    x += Math.floor(Math.random() * 5);
                    y += Math.floor(Math.random() * 5);
                    window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
                    if (x > 300) clearInterval(interval);
                }, 100);
            });
            """
            await call("Page.addScriptToEvaluateOnNewDocument", {"source": stealth_script})
            await call("Page.navigate", {"url": "https://territorial.io/"})

            print("[*] Navigated with stealth. Waiting 10s for Turnstile...")
            for s in range(10):
                await asyncio.sleep(1)
                val = await call("Runtime.evaluate", {
                    "expression": """
                    (() => {
                        const inp = document.querySelector('input[name="cf-turnstile-response"]');
                        return inp ? inp.value : "NO_INPUT";
                    })()
                    """,
                    "returnByValue": True
                })
                t = val.get("result", {}).get("result", {}).get("value")
                if t and t != "NO_INPUT" and t != "":
                    print(f"[+] [T+{s}s] TURNSTILE SOLVED IN HEADLESS! Token length: {len(t)}")
                else:
                    print(f"  [T+{s}s] Status: '{t}'")
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test_stealth_headless())
