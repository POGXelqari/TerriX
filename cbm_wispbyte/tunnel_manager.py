#!/usr/bin/env python3
"""
CBM Cloudflare Tunnel Manager & Automated Ingress Watchdog
==========================================================
Automates zero-trust edge ingress for Wispbyte deployments:
- Connects localhost:$PORT to Cloudflare edge via Named Tunnel or Quick Tunnel.
- Automated Ingress Watchdog: Continually probes primary domain (e.g. cbm.wispbyte.org).
- Automated Failover: If primary domain returns NXDOMAIN / fails DNS, or during quarantine,
  AUTOMATICALLY spawns a temporary Cloudflare Quick Tunnel (*.trycloudflare.com).
- Automated Teardown: As soon as the primary domain resolves in DNS, the temporary fallback
  tunnel is automatically shut down, ensuring fallback is ONLY active when needed.
"""

import os
import sys
import platform
import shutil
import subprocess
import threading
import time
import re
import socket
import urllib.request
from typing import Optional, Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_BIN_DIR = os.path.join(BASE_DIR, "bin")
ACTIVE_INGRESS_FILE = os.path.join(BASE_DIR, "active_ingress_url.txt")

DOWNLOAD_URLS = {
    ("Linux", "x86_64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64",
    ("Linux", "aarch64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64",
    ("Windows", "AMD64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe",
}


def check_domain_dns(domain: str) -> bool:
    """Checks whether the domain resolves in DNS."""
    if not domain:
        return False
    clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0].strip()
    try:
        socket.getaddrinfo(clean_domain, 80, socket.AF_UNSPEC, socket.SOCK_STREAM)
        return True
    except (socket.gaierror, socket.herror, Exception):
        return False


class CloudflareTunnelManager:
    def __init__(self, port: int = 8080, token: Optional[str] = None, domain: Optional[str] = None):
        self.port = port
        self.token = token or os.environ.get("CLOUDFLARE_TUNNEL_TOKEN", "").strip()
        raw_domain = domain or os.environ.get("WISPBYTE_SUBDOMAIN", "cbm.wispbyte.org")
        self.domain = raw_domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0].strip()
        self.protocol = os.getenv("CLOUDFLARE_TUNNEL_PROTOCOL", "http2").strip()

        self.proc: Optional[subprocess.Popen] = None
        self.fallback_proc: Optional[subprocess.Popen] = None
        self.public_url: Optional[str] = None
        self.fallback_url: Optional[str] = None
        self.running = False
        self.primary_resolving = False

    def get_cloudflared_path(self) -> str:
        """Finds or downloads cloudflared binary."""
        in_path = shutil.which("cloudflared")
        if in_path:
            return in_path

        os.makedirs(CLOUDFLARED_BIN_DIR, exist_ok=True)
        exe_name = "cloudflared.exe" if platform.system() == "Windows" else "cloudflared"
        local_bin = os.path.join(CLOUDFLARED_BIN_DIR, exe_name)
        if os.path.exists(local_bin):
            return local_bin

        sys_os = platform.system()
        raw_arch = platform.machine()
        sys_arch = raw_arch.lower()
        if sys_arch in ("aarch64", "arm64", "armv8l", "armv8"):
            norm_arch = "aarch64"
        elif sys_arch in ("x86_64", "amd64", "x64"):
            norm_arch = "x86_64" if sys_os == "Linux" else "AMD64"
        else:
            norm_arch = raw_arch

        dl_url = DOWNLOAD_URLS.get((sys_os, norm_arch))
        if not dl_url:
            if sys_os == "Linux":
                dl_url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
            else:
                raise RuntimeError(f"Unsupported OS/Architecture for cloudflared: {sys_os} {raw_arch}")

        print(f"[*] Downloading cloudflared binary for {sys_os} ({sys_arch})...")
        try:
            req = urllib.request.Request(dl_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30.0) as resp, open(local_bin, "wb") as f:
                shutil.copyfileobj(resp, f)

            if sys_os != "Windows":
                os.chmod(local_bin, 0o755)

            print(f"[+] Downloaded cloudflared to: {local_bin}")
            return local_bin
        except Exception as e:
            raise RuntimeError(f"Failed to download cloudflared: {e}")

    def check_domain_resolvable(self) -> bool:
        resolves = check_domain_dns(self.domain)
        self.primary_resolving = resolves
        return resolves

    def _start_fallback_quick_tunnel(self, bin_path: str):
        """Launches temporary Quick Tunnel fallback during DNS failure or quarantine."""
        if self.fallback_proc and self.fallback_proc.poll() is None:
            return

        print(f"[+] Automated Ingress Failover: Launching temporary Quick Tunnel fallback on port {self.port}...")
        cmd = [bin_path, "--loglevel", "info", "tunnel", "--protocol", self.protocol, "--url", f"http://127.0.0.1:{self.port}", "--no-autoupdate"]
        try:
            proc_env = os.environ.copy()
            proc_env["GOMAXPROCS"] = "1"
            self.fallback_proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=proc_env
            )

            def _read_fallback():
                for line in iter(self.fallback_proc.stdout.readline, ''):
                    if not self.running:
                        break
                    line_clean = line.strip()
                    if not line_clean:
                        continue
                    if "trycloudflare.com" in line_clean:
                        match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
                        if match:
                            self.fallback_url = match.group(0)
                            self.public_url = self.fallback_url
                            try:
                                with open(ACTIVE_INGRESS_FILE, "w", encoding="utf-8") as f:
                                    f.write(self.fallback_url)
                            except Exception:
                                pass
                            print("\n" + "=" * 68)
                            print(f"  [+] Automated Fallback Ingress Active (NXDOMAIN Failover):")
                            print(f"      {self.fallback_url}")
                            print(f"      (Temporary SSL access while {self.domain} DNS propagates)")
                            print("=" * 68 + "\n")
                    elif any(k in line_clean for k in ["Registered tunnel connection", "Starting tunnel"]):
                        print(f"[+] Fallback Tunnel: {line_clean}")

            t = threading.Thread(target=_read_fallback, daemon=True, name="cbm_fallback_reader")
            t.start()
        except Exception as e:
            print(f"[!] Failed to spawn fallback quick tunnel: {e}")

    def _stop_fallback_quick_tunnel(self):
        """Stops temporary Quick Tunnel when primary domain is healthy."""
        if self.fallback_proc:
            print(f"[*] Automated Ingress Watchdog: Primary domain '{self.domain}' is now resolving in DNS.")
            print("[*] Gracefully deactivating temporary Quick Tunnel fallback...")
            try:
                self.fallback_proc.terminate()
                self.fallback_proc.wait(timeout=3)
            except Exception:
                try:
                    self.fallback_proc.kill()
                except Exception:
                    pass
            self.fallback_proc = None
            self.fallback_url = None
            if os.path.exists(ACTIVE_INGRESS_FILE):
                try:
                    os.remove(ACTIVE_INGRESS_FILE)
                except Exception:
                    pass

    def start(self):
        """Starts tunnel supervisor and automated ingress watchdog."""
        self.running = True

        def _supervise():
            tmp_path = os.path.join(CLOUDFLARED_BIN_DIR, "cloudflared.tmp")
            for _ in range(15):
                if not os.path.exists(tmp_path):
                    break
                time.sleep(1.0)

            bin_path = None
            try:
                bin_path = self.get_cloudflared_path()
            except Exception as e:
                print(f"[!] Warning: Cloudflare Tunnel skipped: {e}")
                return

            force_quick = os.getenv("ENABLE_QUICK_TUNNEL", "").strip().lower() in ("true", "1", "yes")

            if self.token and not force_quick:
                cmd = [bin_path, "--loglevel", "info", "tunnel", "run", "--protocol", self.protocol, "--token", self.token]
                print(f"[+] Launching Cloudflare Named Tunnel (Token auth, protocol: {self.protocol})...")
            else:
                cmd = [bin_path, "--loglevel", "info", "tunnel", "--protocol", self.protocol, "--url", f"http://127.0.0.1:{self.port}", "--no-autoupdate"]
                print(f"[*] Launching Cloudflare Quick Tunnel on port {self.port} (protocol: {self.protocol})...")

            # Start Automated Ingress Watchdog if running Named Tunnel
            if self.token and not force_quick:
                def _watchdog_loop():
                    # Initial probe immediately
                    resolves = self.check_domain_resolvable()
                    if not resolves:
                        print(f"[!] Automated Ingress Watchdog: Primary domain '{self.domain}' has no active DNS record (NXDOMAIN).")
                        self._start_fallback_quick_tunnel(bin_path)

                    while self.running:
                        time.sleep(30.0)
                        resolves = self.check_domain_resolvable()
                        if not resolves:
                            if self.fallback_proc is None or self.fallback_proc.poll() is not None:
                                self._start_fallback_quick_tunnel(bin_path)
                        else:
                            if self.fallback_proc and self.fallback_proc.poll() is None:
                                self._stop_fallback_quick_tunnel()

                watchdog_thread = threading.Thread(target=_watchdog_loop, daemon=True, name="cbm_ingress_watchdog")
                watchdog_thread.start()

            while self.running:
                try:
                    proc_env = os.environ.copy()
                    proc_env["GOMAXPROCS"] = "1"
                    self.proc = subprocess.Popen(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True,
                        bufsize=1,
                        env=proc_env
                    )

                    for line in iter(self.proc.stdout.readline, ''):
                        if not self.running:
                            break
                        line_clean = line.strip()
                        if not line_clean:
                            continue
                        if "trycloudflare.com" in line_clean:
                            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
                            if match:
                                self.public_url = match.group(0)
                                print("\n" + "=" * 68)
                                print(f"  [+] Cloudflare Tunnel Active Public Endpoint:")
                                print(f"      {self.public_url}")
                                print("=" * 68 + "\n")
                        elif any(k in line_clean for k in ["Connected to", "Registered tunnel connection", "Starting tunnel", "Connector ID"]):
                            print(f"[+] Cloudflare Edge: {line_clean}")
                        elif any(k in line_clean.lower() for k in ["error", "err", "fail", "incorrect usage", "invalid"]):
                            print(f"[!] Cloudflare Tunnel Notice: {line_clean}")

                    rc = self.proc.wait()
                    if self.running and rc != 0:
                        print(f"[!] cloudflared process exited with code {rc}")
                except Exception as e:
                    print(f"[!] Cloudflare tunnel worker error: {e}")

                if self.running:
                    print("[*] Reconnecting Cloudflare tunnel in 5s...")
                    time.sleep(5.0)

        t = threading.Thread(target=_supervise, daemon=True, name="cbm_tunnel_supervisor")
        t.start()

    def get_active_url(self) -> str:
        """Returns the primary domain if resolving, else fallback or direct URL."""
        if self.primary_resolving:
            return f"https://{self.domain}/"
        if self.fallback_url:
            return self.fallback_url
        if self.public_url:
            return self.public_url
        return f"http://78.154.103.45:{self.port}/"

    def get_ingress_telemetry(self) -> Dict[str, Any]:
        """Returns status metadata for /api/v1/system/status and /api/cbm/ingress."""
        self.check_domain_resolvable()
        return {
            "primary_domain": self.domain,
            "primary_resolving": self.primary_resolving,
            "active_url": self.get_active_url(),
            "fallback_active": bool(self.fallback_url and not self.primary_resolving),
            "fallback_url": self.fallback_url,
            "direct_url": f"http://78.154.103.45:{self.port}/"
        }

    def stop(self):
        """Terminates cloudflared processes cleanly."""
        self.running = False
        self._stop_fallback_quick_tunnel()
        if self.proc:
            try:
                if self.proc.stdout:
                    try:
                        self.proc.stdout.close()
                    except Exception:
                        pass
                self.proc.terminate()
                self.proc.wait(timeout=3)
            except Exception:
                try:
                    self.proc.kill()
                except Exception:
                    pass
            print("[+] Cloudflare Tunnel stopped.")
