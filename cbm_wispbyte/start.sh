#!/usr/bin/env bash
# ==============================================================================
# Clan Bank Manager (CBM) - Wispbyte Build & Startup Script
# ==============================================================================
set -e

echo "=================================================================="
echo "  Clan Bank Manager (CBM) - Wispbyte Initializing"
echo "=================================================================="

# Constrain CPU thread burst across all sub-processes (strictly enforce 1 CPU thread)
export GOMAXPROCS=1
export PYTHONUNBUFFERED=1

# 1. Install dependencies only if missing (skips 11s pip multi-thread CPU burst on restarts)
if ! python3 -c "import dotenv, urllib3" 2>/dev/null; then
    echo "[*] Installing missing Python dependencies..."
    pip install -r requirements.txt --no-cache-dir --quiet --disable-pip-version-check
else
    echo "[*] Python dependencies verified (cached in .local)."
fi

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

# 3. Execute Master Daemon with bytecode optimization
echo "[*] Starting CBM Master Runtime & Cloudflare Tunnel..."
exec python -O main.py
