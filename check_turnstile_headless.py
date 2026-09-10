import asyncio
import json
import subprocess
import sys
import tempfile
import urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

async def check_turnstile(mode="headless"):
    temp_dir = tempfile.mkdtemp()
    port = 9350
    flags = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={temp_dir}",
        "--window-size=1280,800",
        "--disable-blink-features=AutomationControlled",
        "--no-first-run",
        "--no-default-browser-check",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "https://territorial.io/"
    ]
    if mode == "headless":
        flags.append("--headless=new")
    
    proc = subprocess.Popen(flags)
    await asyncio.sleep(2)
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
        tabs = json.loads(req.read().decode())
        page_tab = next(t for t in tabs if t.get("type") == "page")
        ws_url = page_tab["webSocketDebuggerUrl"]
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
                        print("CONSOLE:", " ".join(args), flush=True)
                    if r.get("id") == i:
                        return r

            await call("Runtime.enable")
            print(f"[*] Monitoring Turnstile in mode={mode}...")
            with open("turnstile_result.txt", "w", encoding="utf-8") as out_f:
                out_f.write(f"Mode: {mode}\n")
                for s in range(14):
                    await asyncio.sleep(1)
                    res = await call("Runtime.evaluate", {
                        "expression": """
                        (() => {
                            const inp = document.querySelector('input[name="cf-turnstile-response"]');
                            return inp ? { exists: true, length: inp.value.length, val: inp.value.slice(0, 30) } : { exists: false };
                        })()
                        """,
                        "returnByValue": True
                    })
                    st = res.get('result', {}).get('result', {}).get('value')
                    out_f.write(f"[T+{s}s] {st}\n")
                    out_f.flush()
                    print(f"[T+{s}s] Input state: {st}", flush=True)
    finally:
        proc.terminate()

if __name__ == "__main__":
    if "--minimized" in sys.argv:
        mode = "minimized"
    elif "--offscreen" in sys.argv:
        mode = "offscreen"
    elif "--visible" in sys.argv:
        mode = "visible"
    else:
        mode = "headless"
    asyncio.run(check_turnstile(mode))
