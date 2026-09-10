import re
import urllib.request
import urllib.error
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Scan downloaded files for links
for fname in ['changelog.txt', 'tutorial.txt', 'clan-results.html', 'clans.txt', 'players.txt', 'terms.txt', 'privacy.txt']:
    path = os.path.join('downloaded', fname)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        urls = list(set(re.findall(r'https?://[^\s"\'<>]+|/[a-zA-Z0-9_\-\./]+', content)))
        print(f"{fname} ({len(content)} bytes), URLs found: {urls[:5]}")

# 2. Check additional standard web endpoints on territorial.io
candidates = [
    'ads.txt',
    'app-ads.txt',
    '.well-known/security.txt',
    'security.txt',
    'version',
    'version.json',
    'leaderboard',
    'leaderboards',
    'stats',
    'rules',
    'api',
    'api/',
    'api/clans',
    'api/players',
    'api/stats',
    's52/',
    'ws',
    'server',
    'servers',
    'servers.json',
    'wiki',
    'wiki/clans',
    'wiki/transactions',
    'logo.png',
    'icon.png',
    'apple-touch-icon.png',
    'apple-touch-icon-precomposed.png'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'}
base_url = 'https://territorial.io/'

for cand in candidates:
    url = base_url + cand
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            # If it's the 935 byte 404 fallback page, skip
            if len(data) == 935 and b'Page Not Found' in data:
                continue
            content_type = resp.headers.get('Content-Type', '')
            out_name = cand.replace('/', '_')
            if not os.path.splitext(out_name)[1]:
                if 'html' in content_type:
                    out_name += '.html'
                elif 'json' in content_type:
                    out_name += '.json'
                elif 'text' in content_type:
                    out_name += '.txt'
                elif 'image/png' in content_type:
                    out_name += '.png'
            out_path = os.path.join('downloaded', out_name)
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"[FOUND] {url} -> {content_type} ({len(data)} bytes) -> {out_path}")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print(f"[{e.code}] {url}")
    except Exception as e:
        pass
