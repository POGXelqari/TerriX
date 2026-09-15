#!/usr/bin/env python3
"""
Clean Full-Stack Local Development Server for CBM (Port 8123)
Powered directly by cbm_wispbyte/main.py CBMHealthHandler
"""
import os
import sys

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

os.environ["SERVER_PORT"] = "8123"
os.environ["PORT"] = "8123"
os.environ["ENABLE_CLOUDFLARE_TUNNEL"] = "false"
os.environ["WISPBYTE_SERVER_URL"] = "http://localhost:8123/"

# Import cbm_wispbyte master components
sys.path.insert(0, os.path.abspath(r'g:\TerriX\cbm_wispbyte'))
import main

if __name__ == '__main__':
    print("[+] Starting CBM Local Development Server on port 8123...")
    main.run_http_server()
