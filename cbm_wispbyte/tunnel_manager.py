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
        self.protocol = os.getenv("CLOUDFLARE_TUNNEL_PROTOCOL", "quic").strip()
        self.metrics_port = int(os.getenv("CLOUDFLARE_METRICS_PORT", 20241))
        self.fallback_metrics_port = int(os.getenv("CLOUDFLARE_FALLBACK_METRICS_PORT", 20242))
        self.log_path = os.path.join(BASE_DIR, "cloudflared.log")
        self.consecutive_probe_failures = 0
        self.watchdog_interval = 20.0

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

    def probe_tunnel_health(self) -> bool:
        """
        Active synthetic health probe:
        Checks cloudflared internal metrics server (/ready) and service endpoint.
        """
        for p in (self.metrics_port, self.fallback_metrics_port):
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{p}/ready", headers={"User-Agent": "CBM-Tunnel-Watchdog/1.0"})
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    if resp.status == 200:
                        return True
            except Exception:
                pass

        if self.proc and self.proc.poll() is None:
            try:
                req = urllib.request.Request(f"http://127.0.0.1:{self.port}/health", headers={"User-Agent": "CBM-Tunnel-Watchdog/1.0"})
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    if resp.status == 200:
                        return True
            except Exception:
                pass

        return False

    def _tail_log_file(self, file_path: str, is_fallback: bool = False):
        """Tails the rotating cloudflared log file without holding blocking pipes."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                f.seek(0, os.SEEK_END)
                while self.running:
                    line = f.readline()
                    if not line:
                        time.sleep(0.5)
                        continue
                    line_clean = line.strip()
                    if not line_clean:
                        continue
                    if "trycloudflare.com" in line_clean:
                        match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
                        if match:
                            url = match.group(0)
                            if is_fallback:
                                self.fallback_url = url
                                self.public_url = url
                                try:
                                    with open(ACTIVE_INGRESS_FILE, "w", encoding="utf-8") as af:
                                        af.write(url)
                                except Exception:
                                    pass
                                print(f"\n[+] Automated Fallback Ingress Active: {url}\n", flush=True)
                            else:
                                self.public_url = url
                                print(f"\n[+] Cloudflare Tunnel Active Public Endpoint: {url}\n", flush=True)
                    elif any(k in line_clean for k in ["Connected to", "Registered tunnel connection", "Starting tunnel", "Connector ID"]):
                        print(f"[+] Cloudflare Edge: {line_clean}", flush=True)
                    elif any(k in line_clean.lower() for k in ["error", "err", "fail", "incorrect usage", "invalid", "unrecognized", "fatal"]):
                        print(f"[!] Cloudflare Tunnel Notice: {line_clean}", flush=True)
        except Exception:
            pass

    def _start_fallback_quick_tunnel(self, bin_path: str):
        """Launches temporary Quick Tunnel fallback during DNS failure or quarantine."""
        if self.fallback_proc and self.fallback_proc.poll() is None:
            return

        print(f"[+] Automated Ingress Failover: Launching temporary Quick Tunnel fallback on port {self.port}...", flush=True)
        cmd = [
            bin_path, "--loglevel", "info", "tunnel",
            "--protocol", self.protocol,
            "--url", f"http://127.0.0.1:{self.port}",
            "--no-autoupdate"
        ]
        try:
            proc_env = os.environ.copy()
            proc_env["GOMAXPROCS"] = "1"
            fallback_log = open(self.log_path, "a", encoding="utf-8")
            self.fallback_proc = subprocess.Popen(
                cmd,
                stdout=fallback_log,
                stderr=subprocess.STDOUT,
                env=proc_env
            )

            t = threading.Thread(target=self._tail_log_file, args=(self.log_path, True), daemon=True, name="cbm_fallback_tail")
            t.start()
        except Exception as e:
            print(f"[!] Failed to spawn fallback quick tunnel: {e}", flush=True)

    def _stop_fallback_quick_tunnel(self):
        """Stops temporary Quick Tunnel when primary domain is healthy."""
        if self.fallback_proc:
            print(f"[*] Automated Ingress Watchdog: Primary domain '{self.domain}' is now resolving in DNS.", flush=True)
            print("[*] Gracefully deactivating temporary Quick Tunnel fallback...", flush=True)
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
                print(f"[!] Warning: Cloudflare Tunnel skipped: {e}", flush=True)
                return

            force_quick = os.getenv("ENABLE_QUICK_TUNNEL", "").strip().lower() in ("true", "1", "yes")

            if self.token and not force_quick:
                cmd = [
                    bin_path, "--loglevel", "info", "tunnel", "run",
                    "--protocol", self.protocol,
                    "--token", self.token
                ]
                print(f"[+] Launching Cloudflare Named Tunnel (Token auth, protocol: {self.protocol})...", flush=True)
            else:
                cmd = [
                    bin_path, "--loglevel", "info", "tunnel",
                    "--protocol", self.protocol,
                    "--url", f"http://127.0.0.1:{self.port}",
                    "--no-autoupdate"
                ]
                print(f"[*] Launching Cloudflare Quick Tunnel on port {self.port} (protocol: {self.protocol})...", flush=True)

            # Active Synthetic Health Watchdog Thread
            def _watchdog_loop():
                # Initial domain resolution probe
                if self.token and not force_quick:
                    resolves = self.check_domain_resolvable()
                    if not resolves:
                        print(f"[!] Automated Ingress Watchdog: Primary domain '{self.domain}' has no active DNS record (NXDOMAIN).", flush=True)
                        self._start_fallback_quick_tunnel(bin_path)

                while self.running:
                    time.sleep(self.watchdog_interval)
                    if not self.running:
                        break

                    # DNS failover check for Named Tunnel
                    if self.token and not force_quick:
                        resolves = self.check_domain_resolvable()
                        if not resolves:
                            if self.fallback_proc is None or self.fallback_proc.poll() is not None:
                                self._start_fallback_quick_tunnel(bin_path)
                        else:
                            if self.fallback_proc and self.fallback_proc.poll() is None:
                                self._stop_fallback_quick_tunnel()

                    # Synthetic health check against cloudflared / ready probes
                    if self.proc and self.proc.poll() is None:
                        healthy = self.probe_tunnel_health()
                        if healthy:
                            self.consecutive_probe_failures = 0
                        else:
                            self.consecutive_probe_failures += 1
                            print(f"[!] Synthetic Ingress Watchdog: Probe failed ({self.consecutive_probe_failures}/3).", flush=True)
                            if self.consecutive_probe_failures >= 3:
                                print("[!] Synthetic Ingress Watchdog: 3 consecutive probe failures detected. Restarting tunnel...", flush=True)
                                try:
                                    self.proc.kill()
                                    self.proc.wait(timeout=2)
                                except Exception:
                                    pass
                                self.consecutive_probe_failures = 0
                                time.sleep(2.0)

            watchdog_thread = threading.Thread(target=_watchdog_loop, daemon=True, name="cbm_ingress_watchdog")
            watchdog_thread.start()

            while self.running:
                try:
                    # Defensive log rotation: cap log size at 5MB
                    try:
                        if os.path.exists(self.log_path) and os.path.getsize(self.log_path) > 5 * 1024 * 1024:
                            with open(self.log_path, "w", encoding="utf-8") as truncate_f:
                                truncate_f.write("")
                    except Exception:
                        pass

                    proc_env = os.environ.copy()
                    proc_env["GOMAXPROCS"] = "1"
                    
                    # Direct file redirection to eliminate pipe deadlocks
                    log_file = open(self.log_path, "a", encoding="utf-8")
                    self.proc = subprocess.Popen(
                        cmd,
                        stdout=log_file,
                        stderr=subprocess.STDOUT,
                        env=proc_env
                    )

                    tail_thread = threading.Thread(target=self._tail_log_file, args=(self.log_path, False), daemon=True, name="cbm_tunnel_tail")
                    tail_thread.start()

                    rc = self.proc.wait()
                    try:
                        log_file.close()
                    except Exception:
                        pass

                    if self.running:
                        print(f"[!] cloudflared process exited (exit code: {rc})", flush=True)
                        try:
                            if os.path.exists(self.log_path):
                                with open(self.log_path, "r", encoding="utf-8", errors="replace") as lf:
                                    lines = [l.strip() for l in lf.readlines() if l.strip()]
                                    tail_lines = lines[-6:]
                                    for tl in tail_lines:
                                        if not any(k in tl for k in ["Connected to", "Registered tunnel connection"]):
                                            print(f"    [cloudflared] {tl}", flush=True)
                        except Exception:
                            pass
                except Exception as e:
                    print(f"[!] Cloudflare tunnel worker error: {e}", flush=True)

                if self.running:
                    print("[*] Reconnecting Cloudflare tunnel in 5s...", flush=True)
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
