import urllib.request
import os

logs = [
    'log/br',
    'log/1v1',
    'log/team',
    'log/zombies',
    'log/propaganda',
    'log/transactions',
    'log/team-games',
    'log/clan-election'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
base_url = 'https://territorial.io/'

for lg in logs:
    url = base_url + lg
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            if len(data) == 935 and b'Page Not Found' in data:
                print(f"[-] {url} -> 404")
                continue
            fname = lg.replace('/', '_') + '.html'
            out_path = os.path.join('downloaded', fname)
            with open(out_path, 'wb') as f:
                f.write(data)
            print(f"[+] {url} -> {len(data)} bytes -> {out_path}")
    except Exception as e:
        print(f"[!] {url} -> {e}")
