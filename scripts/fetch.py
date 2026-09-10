import urllib.request
import re
import os

url = 'https://territorial.io/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Saved index.html ({len(html)} bytes)")

# Search for referenced links, assets, scripts, etc.
hrefs = re.findall(r'(?:href|src)\s*=\s*["\']([^"\']+)["\']', html)
print("Explicit src/href attributes:", set(hrefs))

# Find any strings ending with common web file extensions
asset_pattern = re.compile(r'["\']([a-zA-Z0-9_\-\./]+\.(?:png|jpg|jpeg|svg|mp3|ogg|wav|wasm|js|css|json|bin|ico|webp|txt|html))["\']')
matches = set(asset_pattern.findall(html))
print("String assets detected in script:", matches)

# Check for websocket urls or server endpoints
endpoints = set(re.findall(r'wss?://[^\s"\'`]+|https?://[^\s"\'`]+', html))
print("Full URLs detected:", endpoints)
