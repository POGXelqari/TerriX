#!/usr/bin/env python3
"""
Territorial.io Proxy Pool Manager
==================================
Loads, validates, and rotates HTTP and SOCKS5 proxies from proxy.txt
for high-density bot swarms (20 - 100+ bots).
"""

import os
from typing import List, Optional, Dict, Any

class ProxyManager:
    def __init__(self, proxy_file: Optional[str] = None, auto_dynamic: bool = True):
        if not proxy_file:
            candidates = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "proxy.txt"),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "proxy.txt"),
                "proxy.txt"
            ]
            self.proxy_file = next((p for p in candidates if os.path.exists(p)), candidates[0])
        else:
            self.proxy_file = proxy_file

        self.auto_dynamic = auto_dynamic
        self.proxies: List[Dict[str, Any]] = []
        self.reload()

    def reload(self) -> int:
        """Parses proxy.txt and populates the active proxy pool. Falls back to dynamic fetch if empty."""
        self.proxies.clear()
        if os.path.exists(self.proxy_file):
            with open(self.proxy_file, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue

                    parsed = self._parse_line(line)
                    if parsed:
                        self.proxies.append(parsed)

        if len(self.proxies) == 0 and self.auto_dynamic:
            print("[*] Proxy pool empty. Invoking Dynamic Proxy Harvester...")
            self.fetch_dynamic(target_count=25)

        return len(self.proxies)

    def fetch_dynamic(self, target_count: int = 30) -> int:
        """Runs the asynchronous dynamic proxy harvester and saves verified tunnels."""
        try:
            import asyncio
            import concurrent.futures
            from dynamic_proxy_fetcher import harvest_and_validate, save_to_file

            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    results = executor.submit(
                        asyncio.run, harvest_and_validate(target_count=target_count)
                    ).result()
            else:
                results = asyncio.run(harvest_and_validate(target_count=target_count))

            if results:
                save_to_file(results, self.proxy_file)
                self.proxies = [
                    {
                        "protocol": p["protocol"],
                        "host": p["host"],
                        "port": p["port"],
                        "user": p.get("user"),
                        "password": p.get("password"),
                        "url": p["url"],
                        "raw": p["url"]
                    }
                    for p in results
                ]
                print(f"[+] Successfully loaded {len(self.proxies)} dynamic verified proxies.")
        except Exception as e:
            print(f"[!] Dynamic proxy fetch failed: {e}")
        return len(self.proxies)

    def _parse_line(self, line: str) -> Optional[Dict[str, Any]]:
        proto = "http"
        if line.startswith("http://"):
            proto = "http"
            line = line[7:]
        elif line.startswith("https://"):
            proto = "https"
            line = line[8:]
        elif line.startswith("socks5://"):
            proto = "socks5"
            line = line[9:]
        elif line.startswith("socks4://"):
            proto = "socks4"
            line = line[9:]

        user = None
        password = None

        if "@" in line:
            auth_part, host_part = line.split("@", 1)
            if ":" in auth_part:
                user, password = auth_part.split(":", 1)
            else:
                user = auth_part
            if ":" in host_part:
                host, port = host_part.split(":", 1)
            else:
                host, port = host_part, "8080"
        else:
            parts = line.split(":")
            if len(parts) == 4:
                # host:port:user:pass
                host, port, user, password = parts
            elif len(parts) == 2:
                # host:port
                host, port = parts
            else:
                return None

        try:
            port_int = int(port)
        except ValueError:
            return None

        # Build standard URL representation
        if user and password:
            url = f"{proto}://{user}:{password}@{host}:{port_int}"
        else:
            url = f"{proto}://{host}:{port_int}"

        return {
            "protocol": proto,
            "host": host,
            "port": port_int,
            "user": user,
            "password": password,
            "url": url,
            "raw": line
        }

    def count(self) -> int:
        return len(self.proxies)

    def get_proxy(self, index: int) -> Optional[Dict[str, Any]]:
        """Returns the proxy assigned to a bot index via round-robin."""
        if not self.proxies:
            return None
        return self.proxies[index % len(self.proxies)]

    def get_chrome_flag(self, index: int) -> Optional[str]:
        """Returns --proxy-server flag for Chrome launch."""
        proxy = self.get_proxy(index)
        if not proxy:
            return None
        # Chrome natively takes host:port in --proxy-server
        return f"--proxy-server={proxy['protocol']}://{proxy['host']}:{proxy['port']}"


if __name__ == "__main__":
    import sys
    pm = ProxyManager(auto_dynamic=False)
    if "--fetch" in sys.argv:
        idx = sys.argv.index("--fetch")
        target = int(sys.argv[idx + 1]) if len(sys.argv) > idx + 1 and sys.argv[idx + 1].isdigit() else 30
        print(f"[*] Force-fetching {target} dynamic proxies...")
        pm.fetch_dynamic(target_count=target)
    else:
        pm.reload()

    print(f"Loaded {pm.count()} proxies from '{pm.proxy_file}'")
    for i in range(min(5, pm.count())):
        print(f"  [{i}] {pm.get_proxy(i)['url']}")
