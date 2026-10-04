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
if ! python3 -c "import dotenv, urllib3, cryptography, jwt, discord" 2>/dev/null; then
    echo "[*] Installing missing Python dependencies..."
    pip install -r requirements.txt --no-cache-dir --quiet --disable-pip-version-check
else
    echo "[*] Python dependencies verified (cached in .local)."
fi

# 2. Ensure cloudflared binary and programmatic asset directories are ready
mkdir -p bin assets/patterns assets/products ephemeral_chat_media
export PATH="$(pwd)/bin:$PATH"

if ! command -v cloudflared &> /dev/null && [ ! -f "bin/cloudflared" ]; then
    (
        ARCH=$(uname -m)
        echo "[*] Background fetch: cloudflared binary for architecture: ${ARCH}..."
        DL_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
        if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
            DL_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
        fi
        curl -sL "$DL_URL" -o "bin/cloudflared.tmp" && mv "bin/cloudflared.tmp" "bin/cloudflared" && chmod +x "bin/cloudflared" && echo "[+] Background cloudflared binary ready."
    ) &
fi

# 3. Supervised AutoMod Launch (Isolated background execution)
if [ -f "run_automod.py" ] && python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); exit(0 if os.getenv('DISCORD_BOT_TOKEN') else 1)" 2>/dev/null; then
    (
        python3 -O run_automod.py > automod.log 2>&1 &
        echo $! > automod.pid
    )
    echo "[+] CBM AutoMod background worker dispatched."
else
    echo "[*] DISCORD_BOT_TOKEN not configured. Skipping AutoMod startup."
fi

# 4. Execute Master Daemon with bytecode optimization immediately (binds port in < 1s)
echo "[*] Starting CBM Master Runtime..."
exec python3 -O main.py
