#!/usr/bin/env python3
"""
CBM Cloudflare Tunnel Manager
=============================
Automates zero-trust edge ingress for Wispbyte deployments:
- Auto-detects system architecture (Linux amd64/arm64, Windows)
- Downloads and verifies official cloudflared binary if not found in PATH
- Connects localhost:$PORT to Cloudflare edge:
    * Named Tunnel: using CLOUDFLARE_TUNNEL_TOKEN
    * Quick Tunnel fallback: generating a public *.trycloudflare.com HTTPS endpoint
- Supervised background execution with automatic restart on network blips
"""

import os
import sys
import platform
import shutil
import subprocess
import threading
import time
import re
import urllib.request
from typing import Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_BIN_DIR = os.path.join(BASE_DIR, "bin")

DOWNLOAD_URLS = {
    ("Linux", "x86_64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64",
    ("Linux", "aarch64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64",
    ("Windows", "AMD64"): "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe",
}

class CloudflareTunnelManager:
    def __init__(self, port: int = 8080, token: Optional[str] = None):
        self.port = port
        self.token = token or os.environ.get("CLOUDFLARE_TUNNEL_TOKEN", "").strip()
        self.proc: Optional[subprocess.Popen] = None
        self.public_url: Optional[str] = None
        self.running = False

    def get_cloudflared_path(self) -> str:
        """Finds or downloads cloudflared binary."""
        # 1. Check system PATH
        in_path = shutil.which("cloudflared")
        if in_path:
            return in_path

        # 2. Check local bin/ folder
        os.makedirs(CLOUDFLARED_BIN_DIR, exist_ok=True)
        exe_name = "cloudflared.exe" if platform.system() == "Windows" else "cloudflared"
        local_bin = os.path.join(CLOUDFLARED_BIN_DIR, exe_name)
        if os.path.exists(local_bin):
            return local_bin

        # 3. Auto-download binary
        sys_os = platform.system()
        sys_arch = platform.machine()
        dl_url = DOWNLOAD_URLS.get((sys_os, sys_arch))
        if not dl_url:
            # Fallback for Linux architectures
            if sys_os == "Linux":
                dl_url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
            else:
                raise RuntimeError(f"Unsupported OS/Architecture for automated cloudflared download: {sys_os} {sys_arch}")

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

    def start(self):
        """Starts cloudflared in a supervised background thread."""
        try:
            bin_path = self.get_cloudflared_path()
        except Exception as e:
            print(f"[!] Warning: Cloudflare Tunnel skipped: {e}")
            return

        self.running = True

        if self.token:
            cmd = [bin_path, "tunnel", "run", "--token", self.token]
            print(f"[+] Launching Cloudflare Named Tunnel (Token auth)...")
        else:
            cmd = [bin_path, "tunnel", "--url", f"http://localhost:{self.port}", "--no-autoupdate"]
            print(f"[*] No CLOUDFLARE_TUNNEL_TOKEN specified. Launching Cloudflare Quick Tunnel on port {self.port}...")

        def _supervise():
            while self.running:
                try:
                    self.proc = subprocess.Popen(
                        cmd,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.STDOUT,
                        text=True,
                        bufsize=1
                    )

                    for line in iter(self.proc.stdout.readline, ''):
                        if not self.running:
                            break
                        line_clean = line.strip()
                        if "trycloudflare.com" in line_clean:
                            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
                            if match:
                                self.public_url = match.group(0)
                                print("\n" + "=" * 65)
                                print(f"  [✓] Cloudflare Tunnel Active Public Endpoint:")
                                print(f"      {self.public_url}")
                                print("=" * 65 + "\n")
                        elif "Connected to" in line_clean or "Registered tunnel connection" in line_clean:
                            print(f"[+] Cloudflare Edge: {line_clean}")
                        elif "error" in line_clean.lower() and "failed" in line_clean.lower():
                            print(f"[!] Cloudflare Tunnel Warning: {line_clean}")

                    self.proc.wait()
                except Exception as e:
                    print(f"[!] Cloudflare tunnel worker error: {e}")

                if self.running:
                    print("[*] Reconnecting Cloudflare tunnel in 5s...")
                    time.sleep(5.0)

        t = threading.Thread(target=_supervise, daemon=True)
        t.start()

    def stop(self):
        """Terminates cloudflared process cleanly."""
        self.running = False
        if self.proc:
            try:
                self.proc.terminate()
                self.proc.wait(timeout=3)
            except Exception:
                try:
                    self.proc.kill()
                except Exception:
                    pass
            print("[+] Cloudflare Tunnel stopped.")

if __name__ == "__main__":
    # Test execution
    mgr = CloudflareTunnelManager(port=8080)
    print(f"[*] Cloudflared Binary: {mgr.get_cloudflared_path()}")
