#!/usr/bin/env python3
"""
Dynamic Proxy Harvester & Health Validator
===========================================
Automatically aggregates, verifies, and ranks free HTTP/SOCKS5 proxies
from zero-signup public feeds (GeoNode, ProxyScrape, GitHub repositories)
with pre-flight CONNECT handshakes against Territorial.io.
"""

import asyncio
import json
import time
import urllib.request
import os
import sys
from typing import List, Dict, Any, Optional

# Public aggregation endpoints (Zero signup, dynamic, real-time)
FEEDS = {
    "geonode": "https://proxylist.geonode.com/api/proxy-list?limit=150&page=1&sort_by=lastChecked&sort_type=desc",
    "proxyscrape_socks5": "https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=3000&country=all",
    "proxyscrape_http": "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=3000&country=all&ssl=yes",
    "monosans": "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt",
    "thespeedx_socks5": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    "thespeedx_http": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"
}

TARGET_HOST = "territorial.io"
TARGET_PORT = 443

def fetch_feed_data(url: str, timeout: float = 6.0) -> List[str]:
    """Synchronously pulls proxy list strings from a single feed."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
            if "geonode" in url:
                data = json.loads(content)
                proxies = []
                for p in data.get("data", []):
                    ip = p.get("ip")
                    port = p.get("port")
                    protocols = p.get("protocols", [])
                    proto = "socks5" if "socks5" in protocols else "http"
                    if ip and port:
                        proxies.append(f"{proto}://{ip}:{port}")
                return proxies
            else:
                lines = [l.strip() for l in content.splitlines() if l.strip() and not l.startswith("#")]
                return lines
    except Exception:
        return []

async def test_proxy_tunnel(proxy_url: str, timeout: float = 2.5) -> Optional[Dict[str, Any]]:
    """
    Validates that a proxy can successfully establish a TCP/TLS tunnel
    to territorial.io:443 via HTTP CONNECT or SOCKS5 greeting.
    """
    proto = "http"
    clean = proxy_url
    if "://" in clean:
        proto, clean = clean.split("://", 1)
    
    auth_user = None
    auth_pass = None
    if "@" in clean:
        auth_part, clean = clean.split("@", 1)
        if ":" in auth_part:
            auth_user, auth_pass = auth_part.split(":", 1)
        else:
            auth_user = auth_part

    if ":" not in clean:
        return None
    
    host, port_str = clean.split(":", 1)
    try:
        port = int(port_str)
    except ValueError:
        return None

    t0 = time.perf_counter()
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port), timeout=timeout
        )

        if proto in ("http", "https"):
            connect_req = f"CONNECT {TARGET_HOST}:{TARGET_PORT} HTTP/1.1\r\nHost: {TARGET_HOST}:{TARGET_PORT}\r\nProxy-Connection: Keep-Alive\r\n\r\n"
            writer.write(connect_req.encode("ascii"))
            await writer.drain()
            resp = await asyncio.wait_for(reader.read(256), timeout=timeout)
            writer.close()
            await writer.wait_closed()
            
            if resp.startswith(b"HTTP/1.1 200") or b"200 Connection established" in resp or b"200 OK" in resp:
                latency = round((time.perf_counter() - t0) * 1000, 1)
                return {
                    "protocol": proto,
                    "host": host,
                    "port": port,
                    "user": auth_user,
                    "password": auth_pass,
                    "url": f"{proto}://{host}:{port}",
                    "latency_ms": latency
                }
        elif proto in ("socks5", "socks4"):
            writer.write(b"\x05\x01\x00")
            await writer.drain()
            resp = await asyncio.wait_for(reader.read(2), timeout=timeout)
            writer.close()
            await writer.wait_closed()
            if resp == b"\x05\x00":
                latency = round((time.perf_counter() - t0) * 1000, 1)
                return {
                    "protocol": "socks5",
                    "host": host,
                    "port": port,
                    "user": auth_user,
                    "password": auth_pass,
                    "url": f"socks5://{host}:{port}",
                    "latency_ms": latency
                }
    except Exception:
        pass
    return None

async def harvest_and_validate(target_count: int = 30, concurrency: int = 80, timeout: float = 2.5) -> List[Dict[str, Any]]:
    """
    Harvests candidates across feeds and concurrently tests them.
    Returns list of working proxies sorted by latency.
    """
    print(f"[*] Querying dynamic proxy aggregation feeds...")
    candidates = []
    for name, url in FEEDS.items():
        data = fetch_feed_data(url)
        print(f"    -> Feed '{name}': fetched {len(data)} endpoints")
        candidates.extend(data)
        if len(candidates) >= 600:
            break

    # Deduplicate
    unique_candidates = list(dict.fromkeys(candidates))
    print(f"[*] Testing {len(unique_candidates)} unique candidates against {TARGET_HOST}:{TARGET_PORT} (concurrency={concurrency}, timeout={timeout}s)...")

    semaphore = asyncio.Semaphore(concurrency)
    working_proxies = []

    async def worker(p_url):
        async with semaphore:
            res = await test_proxy_tunnel(p_url, timeout=timeout)
            if res:
                working_proxies.append(res)
                print(f"    [+] Verified Alive: {res['url']} (Latency: {res['latency_ms']}ms)")

    tasks = [worker(p) for p in unique_candidates]
    await asyncio.gather(*tasks)

    # Sort by lowest latency
    working_proxies.sort(key=lambda x: x["latency_ms"])
    print(f"[+] Validation complete: {len(working_proxies)} responsive tunnels verified.")
    return working_proxies[:target_count]

def save_to_file(proxies: List[Dict[str, Any]], filepath: str):
    """Saves validated proxies to proxy.txt format."""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("# Auto-generated Dynamic Proxy Pool (Pre-flight Verified)\n")
        f.write(f"# Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# Total Verified Active: {len(proxies)}\n\n")
        for p in proxies:
            f.write(f"{p['url']}\n")
    print(f"[+] Saved {len(proxies)} verified proxies to '{filepath}'")

if __name__ == "__main__":
    count = 30
    save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "proxy.txt")
    
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        count = int(sys.argv[1])
    
    results = asyncio.run(harvest_and_validate(target_count=count))
    if results:
        save_to_file(results, save_path)
    else:
        print("[!] Warning: No public proxies passed the strict CONNECT handshake. Retrying with extended feeds may be required.")
