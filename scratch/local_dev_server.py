#!/usr/bin/env python3
"""
Full-stack Local Dev Server for CBM Web Portal on Port 8123
Serves:
- Static HTML/Assets from g:/TerriX/web/pages (/cbm.html, /rulebook.html, /cbm-logo.png)
- API endpoints from web/api/cbm.py for /api/cbm/* (GET and POST)
"""

import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Set environment from cbm_wispbyte/.env
env_file = r'g:\TerriX\cbm_wispbyte\.env'
if os.path.exists(env_file):
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

sys.path.insert(0, r'g:\TerriX\web\api')
import cbm

STATIC_DIR = r'g:\TerriX\web\pages'

class LocalDevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_OPTIONS(self):
        cbm.handler.do_OPTIONS(self)

    def do_GET(self):
        req_path = self.path.split('?')[0].rstrip('/')
        if req_path.startswith('/api/cbm'):
            cbm.handler.do_GET(self)
        elif req_path in ('', '/'):
            self.path = '/cbm.html'
            super().do_GET()
        else:
            super().do_GET()

    def do_POST(self):
        req_path = self.path.split('?')[0].rstrip('/')
        if req_path.startswith('/api/cbm'):
            cbm.handler.do_POST(self)
        else:
            self.send_error(404, "Endpoint not found")

def run(port=8123):
    server = HTTPServer(('0.0.0.0', port), LocalDevHandler)
    print(f"CBM Local Dev Server active at http://localhost:{port}/")
    server.serve_forever()

if __name__ == '__main__':
    run()
