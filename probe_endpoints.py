import urllib.request
import urllib.error
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

routes = [
    '',
    'clans',
    'clan-results',
    'terms',
    'changelog',
    'tutorial',
    'privacy',
    'players',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
    'manifest.json',
    'sw.js',
    'service-worker.js',
    'game.js',
    'app.js',
    'main.js',
    'style.css',
    'styles.css',
    'tt_scenario.json',
    'map.png',
    'world.png',
    'europe.png'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'}

base_url = 'https://territorial.io/'
os.makedirs('downloaded', exist_ok=True)

for route in routes:
    url = base_url + route
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            status = resp.status
            content_type = resp.headers.get('Content-Type', '')
            filename = route if route else 'root.html'
            if '/' in filename:
                filename = filename.replace('/', '_')
            if not os.path.splitext(filename)[1]:
                if 'html' in content_type:
                    filename += '.html'
                elif 'json' in content_type:
                    filename += '.json'
                elif 'text' in content_type:
                    filename += '.txt'
            out_path = os.path.join('downloaded', filename)
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"[+] {url} -> {status} {content_type} ({len(data)} bytes) -> {out_path}")
    except urllib.error.HTTPError as e:
        print(f"[-] {url} -> HTTP {e.code}")
    except Exception as e:
        print(f"[!] {url} -> {e}")
