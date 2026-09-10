import urllib.request
import urllib.error
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

urls = [
    'favicon.png',
    'wiki/propaganda',
    'wiki/reports',
    'wiki/gold',
    'wiki/faq',
    'wiki/api',
    'log/team-games',
    'log/clan-election',
    'log/transactions'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'}
base_url = 'https://territorial.io/'

for u in urls:
    full_url = base_url + u
    req = urllib.request.Request(full_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            if len(data) == 935 and b'Page Not Found' in data:
                print(f"[-] {full_url} -> 404")
                continue
            content_type = resp.headers.get('Content-Type', '')
            filename = u.replace('/', '_')
            if not os.path.splitext(filename)[1]:
                if 'html' in content_type:
                    filename += '.html'
                elif 'text' in content_type:
                    filename += '.txt'
                elif 'json' in content_type:
                    filename += '.json'
                elif 'png' in content_type:
                    filename += '.png'
            out_path = os.path.join('downloaded', filename)
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"[+] {full_url} -> {content_type} ({len(data)} bytes) -> {out_path}")
    except Exception as e:
        print(f"[!] {full_url} -> {e}")
