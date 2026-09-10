"""
Territorial.io Asset & Engine Crawler
Downloads and organizes the full client bundle, wiki documentation, match logs, and ranking data.
"""

import urllib.request
import urllib.error
import os
import json
import base64
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'}
BASE_URL = 'https://territorial.io/'

def fetch_url(endpoint):
    url = BASE_URL + endpoint
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) == 935 and b'Page Not Found' in data:
                return None, None
            return data, resp.headers.get('Content-Type', '')
    except Exception as e:
        print(f"[-] Failed {url}: {e}")
        return None, None

def main():
    os.makedirs('data', exist_ok=True)
    os.makedirs('assets', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    os.makedirs('wiki', exist_ok=True)

    print("[*] Fetching index.html...")
    data, _ = fetch_url('')
    if data:
        with open('index.original.html', 'wb') as f:
            f.write(data)
        
        html_str = data.decode('utf-8', errors='ignore')

        # Extract styles
        style_match = re.search(r'<style>(.*?)</style>', html_str, re.DOTALL)
        if style_match:
            with open('styles.css', 'w', encoding='utf-8') as f:
                f.write(style_match.group(1).strip())

        # Extract game script
        script_match = re.search(r'<script>(.*?)</script>', html_str, re.DOTALL)
        if script_match:
            js = script_match.group(1).strip()
            with open('game.min.js', 'w', encoding='utf-8') as f:
                f.write(js)

            # String table
            s_match = re.search(r'var S=(\[.*?\]);', js)
            if s_match:
                try:
                    s_arr = json.loads(s_match.group(1))
                    with open('data/string_table.json', 'w', encoding='utf-8') as f:
                        json.dump(s_arr, f, indent=2, ensure_ascii=False)
                except:
                    pass

            # Audio
            audios = re.findall(r'data:audio/mpeg;base64,([A-Za-z0-9+/=]+)', js)
            if audios:
                with open('assets/click.mp3', 'wb') as f:
                    f.write(base64.b64decode(audios[0]))

    # Data endpoints
    endpoints = {
        'clans': 'data/clans.txt',
        'clan-results': 'data/clan-results.html',
        'terms': 'data/terms.txt',
        'changelog': 'data/changelog.txt',
        'tutorial': 'data/tutorial.txt',
        'privacy': 'data/privacy.txt',
        'players': 'data/players.txt',
        'robots.txt': 'data/robots.txt',
        'ads.txt': 'data/ads.txt',
        'app-ads.txt': 'data/app-ads.txt',
        'favicon.ico': 'assets/favicon.ico',
        'favicon.png': 'assets/favicon.png',
        'apple-touch-icon.png': 'assets/apple-touch-icon.png',
        'sw.js': 'sw.js',
        'wiki': 'wiki/wiki_main.html',
        'wiki/api': 'wiki/wiki_api.html',
        'wiki/clans': 'wiki/wiki_clans.html',
        'wiki/faq': 'wiki/wiki_faq.html',
        'wiki/gold': 'wiki/wiki_gold.html',
        'wiki/propaganda': 'wiki/wiki_propaganda.html',
        'wiki/reports': 'wiki/wiki_reports.html',
        'wiki/transactions': 'wiki/wiki_transactions.html',
        'log/br': 'logs/log_br.html',
        'log/1v1': 'logs/log_1v1.html',
        'log/team': 'logs/log_team.html',
        'log/zombies': 'logs/log_zombies.html',
        'log/propaganda': 'logs/log_propaganda.html',
        'log/transactions': 'logs/log_transactions.html',
        'log/team-games': 'logs/log_team-games.html'
    }

    for ep, target in endpoints.items():
        print(f"[*] Fetching {ep}...")
        res, _ = fetch_url(ep)
        if res:
            with open(target, 'wb') as f:
                f.write(res)

    print("[+] Extraction and download complete.")

if __name__ == '__main__':
    main()
