import asyncio
import json
import os
import platform
import random
import shutil
import subprocess
import tempfile
import time
from typing import Optional
"""
MADE BY ISMOILOFF. GOOD LUCK HAVE FUN, THIS IS JUST PROJECT, USE IT ON UR OWN RISKS!

"""
import nodriver as uc


def _find_chrome() -> str:
    """Return the Chrome executable path, checking common locations per OS."""
    if os.environ.get("CHROME_PATH"):
        return os.environ["CHROME_PATH"]

    if platform.system() == "Windows":
        candidates = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        ]
    else:
        candidates = [
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
        ]

    for path in candidates:
        if os.path.isfile(path):
            return path

    raise FileNotFoundError(
        "Chrome not found in default locations. "
        "Set the CHROME_PATH environment variable to your Chrome executable."
    )


def _get_profile_dir() -> str:
    """Return a persistent Chrome profile directory for the current OS."""
    if os.environ.get("TS_PROFILE_DIR"):
        return os.environ["TS_PROFILE_DIR"]
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".chrome_sessions")
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "ezsolver_profile")


def _start_xvfb_if_needed() -> Optional[subprocess.Popen]:
    """On Linux headless servers, start a virtual display so Chrome can run."""
    if platform.system() != "Linux":
        return None
    if os.environ.get("DISPLAY"):
        return None
    proc = subprocess.Popen(
        ["Xvfb", ":99", "-screen", "0", "1280x900x24"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    os.environ["DISPLAY"] = ":99"
    time.sleep(0.5)
    return proc


async def _solve(sitekey: str, siteurl: str, timeout: int = 45, action: str = "enter_lobby", proxy: Optional[str] = None) -> str:
    sessions_base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".chrome_sessions")
    os.makedirs(sessions_base, exist_ok=True)
    worker_profile = tempfile.mkdtemp(prefix="ez_worker_", dir=sessions_base)

    browser_args = [
        "--window-position=-2500,-2500",
        "--window-size=960,720",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--no-first-run",
        "--no-default-browser-check"
    ]
    if proxy:
        browser_args.append(f"--proxy-server={proxy}")

    browser = None
    try:
        browser = await uc.start(
            browser_executable_path=_find_chrome(),
            headless=False,
            user_data_dir=worker_profile,
            browser_args=browser_args,
        )
        page = await browser.get(siteurl)
        await asyncio.sleep(1.0)

        # 1. Wait for window.turnstile to become available and render explicit widget
        action_opt = f"action: '{action}'," if action else ""
        rendered = False
        for step in range(25):
            await asyncio.sleep(0.4)
            raw = await page.evaluate(f"""
                JSON.stringify((() => {{
                    if (typeof window.turnstile !== 'undefined' && typeof window.turnstile.render === 'function') {{
                        if (!document.getElementById('_ts_box')) {{
                            const wrap = document.createElement('div');
                            wrap.id = '_ts_box';
                            wrap.style = 'position:fixed;top:10px;left:10px;z-index:2147483647;';
                            document.body.appendChild(wrap);
                            window._tsToken = null;
                            const wid = window.turnstile.render('#_ts_box', {{
                                sitekey: '{sitekey}',
                                {action_opt}
                                callback: function(t) {{ window._tsToken = t; }}
                            }});
                            return {{ rendered: true, wid: wid }};
                        }}
                        return {{ rendered: true }};
                    }} else if (step > 6 && !document.getElementById('_ts_script')) {{
                        const s = document.createElement('script');
                        s.id = '_ts_script';
                        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                        s.async = true;
                        document.head.appendChild(s);
                    }}
                    return {{ rendered: false }};
                }})())
            """)
            if raw and isinstance(raw, str) and raw != 'null':
                try:
                    data = json.loads(raw)
                    if data.get('rendered'):
                        rendered = True
                        break
                except Exception:
                    pass

        async def get_token() -> Optional[str]:
            raw = await page.evaluate("""
                JSON.stringify((() => {
                    if (window._tsToken) return window._tsToken;
                    const customInp = document.querySelector('#_ts_box input[name="cf-turnstile-response"]');
                    if (customInp && customInp.value) return customInp.value;
                    const nativeInp = document.querySelector('input[name="cf-turnstile-response"]');
                    if (nativeInp && nativeInp.value) return nativeInp.value;
                    const anyInp = document.querySelector('input[name*="turnstile"]');
                    if (anyInp && anyInp.value) return anyInp.value;
                    return null;
                })())
            """)
            if raw and isinstance(raw, str) and raw != 'null':
                try:
                    val = json.loads(raw)
                    if val and isinstance(val, str) and len(val) > 20:
                        return val
                except Exception:
                    pass
            return None

        async def get_cf_iframe_rect() -> Optional[dict]:
            raw = await page.evaluate("""
                JSON.stringify((() => {
                    for (const f of document.querySelectorAll('iframe')) {
                        const src = f.src || f.getAttribute('src') || '';
                        if (!src.includes('challenges.cloudflare.com')) continue;
                        const r = f.getBoundingClientRect();
                        if (r.width > 50 && r.height > 20) return {x:r.x, y:r.y, w:r.width, h:r.height};
                    }
                    return null;
                })())
            """)
            if raw and isinstance(raw, str) and raw != 'null':
                try:
                    return json.loads(raw)
                except Exception:
                    pass
            return None

        async def do_click(rect: Optional[dict]):
            if rect:
                cx = rect["x"] + 28 + random.uniform(-3, 3)
                cy = rect["y"] + rect["h"] / 2 + random.uniform(-3, 3)
                print(f"[solver] clicking Cloudflare iframe at ({cx:.0f}, {cy:.0f})")
            else:
                cx = 20 + 28 + random.uniform(-3, 3)
                cy = 20 + 32 + random.uniform(-3, 3)
                print(f"[solver] iframe not in DOM, clicking fixed position ({cx:.0f}, {cy:.0f})")
            await page.mouse_move(cx - 80, cy - 20)
            await asyncio.sleep(random.uniform(0.15, 0.25))
            await page.mouse_move(cx, cy)
            await asyncio.sleep(random.uniform(0.08, 0.15))
            await page.mouse_click(cx, cy)

        # Passive resolution loop (up to 20s)
        token = None
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            token = await get_token()
            if token:
                break
            await asyncio.sleep(0.5)

        # If still not resolved after passive window, fallback to interactive iframe clicking
        if not token:
            rect = None
            for _ in range(10):
                rect = await get_cf_iframe_rect()
                if rect:
                    break
                await asyncio.sleep(0.5)

            click_count = 0
            last_click = 0.0
            while asyncio.get_event_loop().time() < deadline:
                token = await get_token()
                if token:
                    break

                now = asyncio.get_event_loop().time()
                if click_count == 0 or (now - last_click > 8):
                    if click_count >= 3:
                        await asyncio.sleep(0.5)
                        continue
                    await do_click(rect)
                    last_click = asyncio.get_event_loop().time()
                    click_count += 1
                    await asyncio.sleep(1.0)
                    rect = await get_cf_iframe_rect() or rect
                    continue

                await asyncio.sleep(0.5)

    finally:
        if browser:
            try:
                browser.stop()
            except Exception:
                pass
        if worker_profile and os.path.exists(worker_profile):
            shutil.rmtree(worker_profile, ignore_errors=True)

    if not token:
        raise TimeoutError(f"Turnstile token not obtained within {timeout}s")

    return token


def solve(sitekey: str, siteurl: str, timeout: int = 45, action: str = "enter_lobby", proxy: Optional[str] = None) -> str:
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        return asyncio.run(_solve(sitekey, siteurl, timeout, action, proxy))


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python solver.py <sitekey> <siteurl>")
        sys.exit(1)

    xvfb = _start_xvfb_if_needed()
    try:
        token = solve(sys.argv[1], sys.argv[2])
        print(token)
    finally:
        if xvfb:
            xvfb.terminate()
