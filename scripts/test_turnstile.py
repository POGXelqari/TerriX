import asyncio
import json
import subprocess
import sys
import tempfile
import urllib.request
import websockets

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

async def test_turnstile():
    temp_dir = tempfile.mkdtemp()
    port = 9345
    flags = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        f"--remote-debugging-port={port}",
        f"--user-data-dir={temp_dir}",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1280,800",
        "https://territorial.io/"
    ]
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
                        args = [a.get("value", str(a)) for a in r["params"].get("args", [])]
                        print("CONSOLE:", " ".join(map(str, args)))
                    if r.get("id") == i:
                        return r

            await call("Runtime.enable")
            await asyncio.sleep(2.5)
            # Click Custom Scenario
            print("Clicking Custom Scenario...")
            await call("Runtime.evaluate", {
                "expression": """
                (() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const cs = buttons.find(b => b.textContent && b.textContent.includes('Custom Scenario'));
                    if (cs) cs.click();
                })()
                """
            })
            await asyncio.sleep(2)
            st = await call("Runtime.evaluate", {
                "expression": """
                JSON.stringify({
                    buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
                })
                """,
                "returnByValue": True
            })
            print("After Custom Scenario:", st.get("result", {}).get("result", {}).get("value"))
    finally:
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(test_turnstile())
