#!/usr/bin/env bash
# ==============================================================================
# Clan Bank Manager (CBM) - Wispbyte Build & Startup Script
# ==============================================================================
set -e

echo "=================================================================="
echo "  Clan Bank Manager (CBM) - Wispbyte Initializing"
echo "=================================================================="

# 1. Install dependencies
echo "[*] Installing Python dependencies..."
pip install -r requirements.txt --no-cache-dir

# 2. Ensure cloudflared binary is ready in build step
mkdir -p bin
if ! command -v cloudflared &> /dev/null; then
    if [ ! -f "bin/cloudflared" ]; then
        ARCH=$(uname -m)
        echo "[*] Fetching cloudflared binary for architecture: ${ARCH}..."
        if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
            curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o bin/cloudflared
        else
            curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o bin/cloudflared
        fi
        chmod +x bin/cloudflared
        echo "[+] cloudflared ready in bin/cloudflared"
    fi
    export PATH="$(pwd)/bin:$PATH"
fi

# 3. Execute Master Daemon
echo "[*] Starting CBM Master Runtime & Cloudflare Tunnel..."
exec python main.py
