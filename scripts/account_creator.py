#!/usr/bin/env python3
"""
Territorial.io Account Provisioning & Validation Suite
=====================================================
Automated Account Registration, Management, and Nickname Override Tool

Capabilities:
1. Automated Server-Side Account Registration (--register N / --ensure N / --count N):
   - Automates creation of legitimate, server-registered 5-character accounts
   - Uses headless Chrome via CDP to trigger engine registration (Opcode 18 -> Opcode 10)
   - Automatically validates new credentials against the official API (/api/account/get)
   - Scales on demand to any requested account count N
2. Nickname / Username Customization (names.txt):
   - Loads custom usernames from names.txt (or data/names.txt)
   - Overrides default "Player [0-9]+" username in localStorage key 'd122'
   - Maps each account to a unique authentic nickname from the roster
3. Real-Time Cryptographic Validation (--validate / --check-all):
   - Validates accounts against https://territorial.io/api/account/get
4. Browser Injection Generator (--inject-js):
   - Generates snippet injecting accounts and custom nickname into browser storage
"""

import argparse
import asyncio
import json
import os
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from typing import Dict, List, Optional, Tuple

import websockets

sys.stdout.reconfigure(encoding='utf-8')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ACCOUNTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "valid_accounts.json")
DEFAULT_NAMES_FILE = os.path.join(os.path.dirname(__file__), "..", "names.txt")
DATA_NAMES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "names.txt")
API_ENDPOINT = "https://territorial.io/api/account/get"
ALPHABET = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"
CDP_PORT = 9450


def load_names(names_file: Optional[str] = None) -> List[str]:
    """Loads custom usernames from names.txt or fallback candidates."""
    candidates = []
    if names_file:
        candidates.append(names_file)
    candidates.append(DEFAULT_NAMES_FILE)
    candidates.append(DATA_NAMES_FILE)

    for path in candidates:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    names = [line.strip() for line in f if line.strip() and not line.startswith("#")]
                    if names:
                        return names
            except Exception as e:
                print(f"[-] Warning reading {path}: {e}")

    # Fallback names if no file exists
    return [
        "[FR] Zodiac", "[ARCH] VNVRCHY", "joksiel", "vor quit. Farewell",
        "notabunny", "[Lone] SLΛMNATION", "kop", "[TECH] SmartPlayer",
        "goataru", "[Lone] ΛЯMΛDΛ", "[GGS] Botanot🗿", "[DRAGON] winsterie",
        "[OG] Kium", "[Lone] WΛЯƬΛИK", "Ren", "[FIFA] Pelé"
    ]


def load_verified_accounts() -> List[Dict[str, str]]:
    """Loads the database of server-registered, active accounts."""
    if os.path.exists(ACCOUNTS_FILE):
        try:
            with open(ACCOUNTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[-] Error loading {ACCOUNTS_FILE}: {e}")
    return []


def save_verified_accounts(accounts: List[Dict[str, str]]):
    """Saves verified accounts to the database file."""
    os.makedirs(os.path.dirname(ACCOUNTS_FILE), exist_ok=True)
    with open(ACCOUNTS_FILE, "w", encoding="utf-8") as f:
        json.dump(accounts, f, indent=2)


def validate_account(account_name: str, password: str) -> Tuple[bool, str]:
    """
    Validates an account against the official Territorial.io API.
    Returns (True, body) if account exists and is active.
    """
    payload = {
        "account_name": account_name,
        "password": password,
        "target_account_name": account_name
    }
    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    req = urllib.request.Request(API_ENDPOINT, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            if "insufficient funds" in body or ("status" in body and "account error" not in body):
                return True, body.strip()
            return False, body.strip()
    except Exception as e:
        return False, str(e)


def generate_offline_password() -> str:
    """Generates a 15-char 90-bit password using the engine's 64-char charset."""
    return "".join(ALPHABET[secrets.randbelow(64)] for _ in range(15))


def generate_injection_code(accounts: List[Dict[str, str]], username: Optional[str] = None, count: Optional[int] = None, account_index: int = 0) -> str:
    """Generates console injection snippet to load accounts and custom nickname into browser."""
    if not accounts:
        return "// No accounts available for injection."
    if count and count > 0:
        accounts = accounts[:count]

    idx = account_index % len(accounts)
    primary = accounts[idx]
    registry_str = ";".join(f"{a['account_name']};{a['password']}" for a in accounts)
    display_name = username or primary.get("username") or "[OG] Territorial"

    return f"""// Paste into browser Developer Tools Console on http://localhost:8085/index.html or https://territorial.io
(function() {{
    localStorage.setItem("d105", "{primary['account_name']}");
    localStorage.setItem("d106", "{primary['password']}");
    localStorage.setItem("d116", "{registry_str}");
    localStorage.setItem("d117", "0");
    localStorage.setItem("d122", "{display_name}"); // Overrides "Player" username
    console.log("[+] Injected {len(accounts)} verified account(s) into Territorial.io storage.");
    console.log("[+] Active Account: {primary['account_name']} | Password: {primary['password']}");
    console.log("[+] Custom Nickname: '{display_name}' (overriding default 'Player')");
    location.reload();
}})();"""


async def register_accounts_headless(count: int, names: List[str], name_offset: int = 0) -> List[Dict[str, str]]:
    """
    Automates registration of new legitimate accounts against Territorial.io
    using an isolated headless Chrome instance via Chrome DevTools Protocol.
    Handles dynamic UI transitions and real-time API verification.
    """
    temp_dir = tempfile.mkdtemp(prefix="terrix_reg_")
    flags = [
        CHROME_PATH,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={temp_dir}",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1280,800",
        "--disable-blink-features=AutomationControlled",
        "https://territorial.io"
    ]

    proc = subprocess.Popen(flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[*] Launched isolated registration worker (PID: {proc.pid}) on port {CDP_PORT}...")

    registered_accounts = []

    try:
        # Connect to CDP
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
                await asyncio.sleep(0.3)

        if not ws_url:
            raise RuntimeError("Failed to attach to Chrome CDP debugger.")

        async with websockets.connect(ws_url, max_size=10_000_000) as ws:
            msg_id = 0

            async def call(method: str, params: Optional[dict] = None) -> dict:
                nonlocal msg_id
                msg_id += 1
                payload = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(payload))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get("id") == payload["id"]:
                        return res.get("result", {})

            await call("Runtime.enable")
            print("[*] Initializing game runtime and clearing Turnstile...")
            await asyncio.sleep(4)

            # Accept terms on initial session
            accept_script = """
            (() => {
                const myAcc = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('My Account'));
                if (myAcc) myAcc.click();
            })()
            """
            await call("Runtime.evaluate", {"expression": accept_script})
            await asyncio.sleep(1.2)

            click_terms = """
            (() => {
                const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept'));
                if (acceptBtn) { acceptBtn.click(); return true; }
                return false;
            })()
            """
            await call("Runtime.evaluate", {"expression": click_terms})
            await asyncio.sleep(1.2)

            print(f"[*] Beginning automated generation of {count} verified account(s)...")

            known_names = set()
            attempts = 0
            max_attempts = max(count * 4, 15)

            while len(registered_accounts) < count and attempts < max_attempts:
                attempts += 1

                # Click 'Create New Account' button (or navigate to it if menu closed)
                action_script = """
                (() => {
                    const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Create New Account'));
                    if (createBtn) {
                        createBtn.click();
                        return "clicked_create";
                    }
                    const myAcc = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('My Account'));
                    if (myAcc) {
                        myAcc.click();
                        return "clicked_my_account";
                    }
                    const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept'));
                    if (acceptBtn) {
                        acceptBtn.click();
                        return "clicked_accept";
                    }
                    return "none";
                })()
                """
                act_res = await call("Runtime.evaluate", {"expression": action_script, "returnByValue": True})
                action_taken = act_res.get("result", {}).get("value", "none")

                if action_taken == "clicked_create":
                    await asyncio.sleep(2.5)
                elif action_taken in ("clicked_my_account", "clicked_accept"):
                    await asyncio.sleep(1.2)
                    continue
                else:
                    await asyncio.sleep(1.0)

                # Fetch updated localStorage d105, d106, d116
                read_script = """
                (() => {
                    return {
                        name: localStorage.getItem('d105'),
                        pass: localStorage.getItem('d106'),
                        registry: localStorage.getItem('d116')
                    };
                })()
                """
                res = await call("Runtime.evaluate", {"expression": read_script, "returnByValue": True})
                storage = res.get("result", {}).get("value", {})
                acc_name = storage.get("name")
                acc_pass = storage.get("pass")
                registry = storage.get("registry", "")

                # Collect all candidates
                candidates = []
                if registry:
                    parts = registry.split(";")
                    for p_idx in range(0, len(parts) - 1, 2):
                        n, p = parts[p_idx], parts[p_idx + 1]
                        if n and p and n not in known_names:
                            candidates.append((n, p))
                if acc_name and acc_pass and acc_name not in known_names:
                    if not any(c[0] == acc_name for c in candidates):
                        candidates.append((acc_name, acc_pass))

                for n, p in candidates:
                    if n not in known_names and not any(a["account_name"] == n for a in registered_accounts):
                        # Validate against API
                        is_valid, resp = validate_account(n, p)
                        if is_valid:
                            nick_idx = (name_offset + len(registered_accounts)) % len(names)
                            nickname = names[nick_idx]
                            account_entry = {
                                "account_name": n,
                                "password": p,
                                "username": nickname,
                                "status": "Active / Server-Registered"
                            }
                            registered_accounts.append(account_entry)
                            known_names.add(n)
                            print(f"  [Verified Active] [{len(registered_accounts)}/{count}] Account: {n} | Pass: {p} | Nickname: {nickname} (names.txt override)")
                            if len(registered_accounts) >= count:
                                break

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

    return registered_accounts[:count]


def ensure_account_pool(required_count: int, names_file: Optional[str] = None, validate_all: bool = False) -> List[Dict[str, str]]:
    """
    Ensures that at least `required_count` verified active accounts exist.
    If the current pool has fewer than required_count accounts,
    automatically provisions and validates new accounts on-demand.
    Overrides all usernames with authentic names from names.txt.
    """
    names = load_names(names_file)
    accounts = load_verified_accounts()

    # Reconcile nicknames with names.txt
    for idx, acc in enumerate(accounts):
        acc["username"] = names[idx % len(names)]

    # Validate existing if requested
    if validate_all:
        print(f"[*] Validating existing account pool ({len(accounts)} accounts)...")
        active = []
        for acc in accounts:
            is_valid, _ = validate_account(acc["account_name"], acc["password"])
            if is_valid:
                acc["status"] = "Active / Server-Registered"
                active.append(acc)
        accounts = active

    needed = max(0, required_count - len(accounts))
    if needed > 0:
        print(f"[*] Current pool has {len(accounts)} accounts. Provisioning {needed} new verified account(s)...")
        new_accs = asyncio.run(register_accounts_headless(needed, names, name_offset=len(accounts)))
        existing_names = {a["account_name"] for a in accounts}
        for n_acc in new_accs:
            if n_acc["account_name"] not in existing_names:
                accounts.append(n_acc)
        save_verified_accounts(accounts)
        print(f"[+] Account pool updated. Total active accounts: {len(accounts)}")
    else:
        # Save updated nicknames
        save_verified_accounts(accounts)

    return accounts


def get_account_by_index(index: int, names_file: Optional[str] = None, auto_provision: bool = True) -> Dict[str, str]:
    """
    Retrieves account at specific index.
    If index >= available accounts and auto_provision is True,
    automatically creates and validates accounts until index is satisfied.
    """
    accounts = load_verified_accounts()
    names = load_names(names_file)

    if index >= len(accounts):
        if auto_provision:
            print(f"[*] Account index {index} exceeds current pool ({len(accounts)}). Auto-provisioning...")
            accounts = ensure_account_pool(index + 1, names_file=names_file)
        else:
            index = index % len(accounts) if accounts else 0

    acc = accounts[index]
    acc["username"] = names[index % len(names)]
    return acc


def main():
    parser = argparse.ArgumentParser(description="Territorial.io Account Provisioning & Validation Suite")
    parser.add_argument("--list", action="store_true", help="List all verified server-registered accounts")
    parser.add_argument("--count", type=int, default=0, help="Target account count to list, ensure, or inject")
    parser.add_argument("--ensure", type=int, metavar="N", help="Ensure at least N verified active accounts exist (creates difference)")
    parser.add_argument("--register", type=int, metavar="N", help="Register N new usable accounts via automated server handshake")
    parser.add_argument("--account-index", type=int, default=0, help="Specific account index (0-indexed) for injection or inspection")
    parser.add_argument("--validate", nargs=2, metavar=("NAME", "PASSWORD"), help="Validate specific credentials against the live API")
    parser.add_argument("--inject-js", action="store_true", help="Generate browser console injection snippet with custom nickname")
    parser.add_argument("--names", type=str, default="", help="Path to names.txt to override 'Player' username")
    parser.add_argument("--check-all", action="store_true", help="Re-verify all stored accounts against the official API")
    parser.add_argument("--generate-offline-pass", action="store_true", help="Generate a compliant 90-bit entropy password")
    args = parser.parse_args()

    names = load_names(args.names or None)
    accounts = load_verified_accounts()

    # Reconcile nicknames with names.txt across existing accounts
    for idx, acc in enumerate(accounts):
        acc["username"] = names[idx % len(names)]
    save_verified_accounts(accounts)

    # Feature 1: Ensure N accounts exist
    target_ensure = args.ensure or (args.count if args.count > 0 and not (args.list or args.register or args.validate or args.check_all or args.inject_js) else 0)
    if target_ensure > 0:
        print("=" * 70)
        print(f" Territorial.io Account Pool Manager [Target: {target_ensure}]")
        print(f" Loaded {len(names)} nickname(s) from names.txt")
        print("=" * 70)
        pool = ensure_account_pool(target_ensure, names_file=args.names or None)
        print("=" * 70)
        print(f"[+] Active Account Pool is ready with {len(pool)} verified account(s).")
        return

    # Feature 2: Force register N new accounts
    if args.register and args.register > 0:
        print("=" * 70)
        print(f" Territorial.io Automated Account Provisioner [Register: {args.register}]")
        print(f" Loaded {len(names)} nickname(s) from names.txt")
        print("=" * 70)

        new_accounts = asyncio.run(register_accounts_headless(args.register, names, name_offset=len(accounts)))

        existing_names = {a["account_name"] for a in accounts}
        for n_acc in new_accounts:
            if n_acc["account_name"] not in existing_names:
                accounts.append(n_acc)

        save_verified_accounts(accounts)
        print("=" * 70)
        print(f"[+] Successfully registered & saved {len(new_accounts)} new verified account(s) to data/valid_accounts.json")
        print(f"[+] Total Active Account Pool: {len(accounts)}")
        return

    # Feature 3: Validate single account
    if args.validate:
        name, pw = args.validate
        print(f"[*] Querying Territorial.io API for account '{name}'...")
        is_valid, resp = validate_account(name, pw)
        print(f"[+] Result: Valid={is_valid} | Server Response: {resp}")
        return

    # Feature 4: Re-verify all accounts
    if args.check_all:
        target_list = accounts[:args.count] if args.count > 0 else accounts
        print(f"[*] Re-verifying {len(target_list)} stored accounts against official API...")
        active = []
        for idx, a in enumerate(target_list):
            is_valid, resp = validate_account(a["account_name"], a["password"])
            status_str = "Verified Active" if is_valid else "Rejected"
            nickname = names[idx % len(names)]
            a["username"] = nickname
            print(f"  [{status_str}] {a['account_name']} : {a['password']} (Nickname: {nickname}) -> {resp}")
            if is_valid:
                a["status"] = "Active / Server-Registered"
                active.append(a)
        save_verified_accounts(active)
        print(f"[+] Completed. {len(active)} active accounts confirmed.")
        return

    # Feature 5: Generate offline password
    if args.generate_offline_pass:
        pw = generate_offline_password()
        print(f"[+] Generated 90-bit Engine Password: {pw}")
        return

    # Feature 6: Browser injection code
    if args.inject_js:
        count = args.count if args.count > 0 else None
        target_acc = accounts[args.account_index % len(accounts)] if accounts else None
        chosen_nick = target_acc.get("username") if target_acc else (names[0] if names else None)
        print("\n--- BROWSER CONSOLE INJECTION CODE ---")
        print(generate_injection_code(accounts, username=chosen_nick, count=count, account_index=args.account_index))
        return

    # Default / --list: Display verified accounts table
    display_list = accounts[:args.count] if args.count > 0 else accounts
    print("=" * 70)
    print(f" Territorial.io Server-Registered Accounts [{len(display_list)} Active]")
    print(f" Loaded {len(names)} nickname(s) from names.txt (overriding 'Player' username)")
    print("=" * 70)
    for idx, acc in enumerate(display_list, 1):
        nick = acc.get("username", names[(idx - 1) % len(names)])
        print(f"[{idx}] Account Name : {acc['account_name']}")
        print(f"    Password     : {acc['password']}")
        print(f"    Nickname     : {nick} (d122 override)")
        print(f"    Status       : {acc.get('status', 'Active / Server-Registered')}")
        print("-" * 70)

    print("\n[ℹ️ Instructions]")
    print(" - To ensure N active accounts: python scripts/account_creator.py --ensure <COUNT>")
    print(" - To register N new accounts:  python scripts/account_creator.py --register <COUNT>")
    print(" - To inject into browser:     python scripts/account_creator.py --inject-js [--account-index I]")
    print(" - To validate an account:     python scripts/account_creator.py --validate <NAME> <PASS>")
    print(" - To re-verify all accounts:  python scripts/account_creator.py --check-all")


if __name__ == '__main__':
    main()
