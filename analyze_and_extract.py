import re
import os
import json
import base64
import sys

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 1. Extract CSS
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    css_content = style_match.group(1).strip()
    with open('styles.css', 'w', encoding='utf-8') as f:
        f.write(css_content)
    print(f"[+] Saved styles.css ({len(css_content)} bytes)")

# 2. Extract Javascript
# The script starts with <script> and ends with </script>
script_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
if script_match:
    js_content = script_match.group(1).strip()
    with open('game.min.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"[+] Saved game.min.js ({len(js_content)} bytes)")
else:
    print("[-] Could not find script tag!")
    sys.exit(1)

# 3. Find String Table S = [...]
s_match = re.search(r'var S=(\[.*?\]);', js_content)
if s_match:
    s_raw = s_match.group(1)
    try:
        s_arr = json.loads(s_raw)
        with open('string_table.json', 'w', encoding='utf-8') as f:
            json.dump(s_arr, f, indent=2, ensure_ascii=False)
        print(f"[+] Extracted string table S: {len(s_arr)} strings saved to string_table.json")
    except Exception as e:
        print(f"[!] Could not parse string table with json.loads: {e}")
        # fallback eval or regex extraction
        with open('string_table_raw.js', 'w', encoding='utf-8') as f:
            f.write(s_raw)

# 4. Find all Base64 / Data URIs in js_content
data_uris = re.findall(r'data:([^;,]+);base64,([A-Za-z0-9+/=]+)', js_content)
print(f"[+] Found {len(data_uris)} data URIs")
os.makedirs('extracted_assets', exist_ok=True)
for i, (mime, b64_data) in enumerate(data_uris):
    try:
        raw_bytes = base64.b64decode(b64_data)
        ext = 'bin'
        if 'audio/mpeg' in mime or 'audio/mp3' in mime:
            ext = 'mp3'
        elif 'audio/ogg' in mime:
            ext = 'ogg'
        elif 'image/png' in mime:
            ext = 'png'
        elif 'image/jpeg' in mime or 'image/jpg' in mime:
            ext = 'jpg'
        elif 'image/svg' in mime:
            ext = 'svg'
        filename = f"asset_{i}.{ext}"
        filepath = os.path.join('extracted_assets', filename)
        with open(filepath, 'wb') as f:
            f.write(raw_bytes)
        print(f"    -> Saved {filepath} ({mime}, {len(raw_bytes)} bytes)")
    except Exception as e:
        print(f"    [!] Failed to decode asset {i}: {e}")

# 5. Extract WebSocket and server configurations
servers = re.findall(r'wss?://[a-zA-Z0-9_\-\./]+', js_content)
print("[+] Referenced WebSocket servers:", set(servers))

# 6. Extract turnstile or cloudflare keys if present
cf_keys = re.findall(r'0x4AAAAAA[a-zA-Z0-9_\-]+', js_content)
print("[+] Cloudflare Turnstile keys:", set(cf_keys))
