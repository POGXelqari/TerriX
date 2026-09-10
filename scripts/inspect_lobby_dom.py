import asyncio
import json
import os
import subprocess
import tempfile
import time
import urllib.request
import websockets

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CDP_PORT = 9450

async def main():
    temp_dir = tempfile.mkdtemp(prefix="terrix_inspect_")
    flags = [
        CHROME_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={temp_dir}",
        "--window-size=1280,800",
        "--window-position=50,50",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--mute-audio",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "about:blank"
    ]
    proc = subprocess.Popen(flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ws_url = None
        for _ in range(30):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json") as resp:
                    tabs = json.loads(resp.read().decode())
                    page_tab = next((t for t in tabs if t.get("type") == "page"), None)
                    if page_tab:
                        ws_url = page_tab["webSocketDebuggerUrl"]
                        break
            except Exception:
                time.sleep(0.2)

        ws = await websockets.connect(ws_url)
        msg_id = 0
        async def call(method, params=None):
            nonlocal msg_id
            msg_id += 1
            await ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
            while True:
                res = json.loads(await ws.recv())
                if res.get("id") == msg_id:
                    return res.get("result", {})

        async def eval_js(expr):
            r = await call("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": True})
            return r.get("result", {}).get("value")

        await call("Page.enable")
        await call("Runtime.enable")

        init_script = """
        try {
            localStorage.setItem("d105", "kK2bN");
            localStorage.setItem("d106", "kK2bN");
            localStorage.setItem("d116", "kK2bN;kK2bN");
            localStorage.setItem("d117", "0");
            localStorage.setItem("d122", "[FR] Zodiac");
            localStorage.setItem("d183", "AbCdEfGhIjKlMnO");
        } catch (e) {}
        try {
            delete Object.getPrototypeOf(navigator).webdriver;
        } catch (e) {}
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        """
        await call("Page.addScriptToEvaluateOnNewDocument", {"source": init_script})

        print("Navigating to territorial.io...")
        await call("Page.navigate", {"url": "https://territorial.io"})
        await asyncio.sleep(6.5)

        # Inspect DOM buttons before clicking Multiplayer
        dom_before = await eval_js("""
        (() => {
            return {
                buttons: Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent.trim(), display: getComputedStyle(b).display, rect: b.getBoundingClientRect() })),
                inputs: Array.from(document.querySelectorAll('input')).map(i => i.placeholder)
            };
        })()
        """)
        print("DOM Before Multiplayer:", json.dumps(dom_before, indent=2))

        # Click Multiplayer
        print("Clicking Multiplayer...")
        res = await eval_js("""
        (() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const mp = buttons.find(b => b.textContent && b.textContent.includes('Multiplayer'));
            if (mp) {
                mp.click();
                return "DOM_CLICKED";
            }
            return "NOT_FOUND";
        })()
        """)
        print("Multiplayer Click Result:", res)

        # Poll DOM state for 15 seconds
        for sec in range(15):
            await asyncio.sleep(1)
            dom_after = await eval_js("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent.trim(), display: getComputedStyle(b).display, rect: b.getBoundingClientRect() }));
                const modal = document.querySelector('dialog, .modal, [class*="modal"], [class*="lobby"]') ? true : false;
                const turnstile = document.querySelector('iframe[src*="cloudflare"]') ? true : false;
                const allDivsWithText = Array.from(document.querySelectorAll('div')).filter(d => d.textContent && (d.textContent.includes('Ready') || d.textContent.includes('Cancel') || d.textContent.includes('Team') || d.textContent.includes('Europe'))).map(d => d.textContent.trim().slice(0, 50));
                return {
                    buttons,
                    modal,
                    turnstile,
                    bodyText: document.body.innerText.replace(/\\n+/g, ' | ').slice(0, 300),
                    elements: allDivsWithText.slice(0, 5)
                };
            })()
            """)
            print(f"[T+{sec}s] DOM:", json.dumps(dom_after))

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    asyncio.run(main())
