import re
import json

with open('game.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# 1. Look for websocket instantiation
ws_matches = re.findall(r'new\s+WebSocket\([^)]+\)', js)
print("WebSocket creations:", ws_matches)

# 2. Look for server URLs or patterns
ws_urls = re.findall(r'wss?://[^"\'`\s]+', js)
print("WebSocket URLs found:", set(ws_urls))

# 3. Look for server domain pattern (e.g., sXX.territorial.io or /sXX/)
server_patterns = re.findall(r'["\']wss?://["\']\s*\+\s*[^;\n]+', js)
print("Dynamic WS patterns:", server_patterns)

# 4. Search for functions handling WebSocket messages
ws_handlers = re.findall(r'\.onmessage\s*=\s*function\s*\([^)]*\)\s*\{[\s\S]*?\}', js[:100000])
print(f"Found {len(ws_handlers)} onmessage handlers in first 100k chars")

# Let's search for all .onmessage in the entire file
all_ws_onmsg = [m.start() for m in re.finditer(r'\.onmessage\s*=', js)]
print(f"Total .onmessage handlers in game.js: {len(all_ws_onmsg)}")

for pos in all_ws_onmsg:
    snippet = js[max(0, pos-200):min(len(js), pos+400)]
    print("-" * 40)
    print(snippet)
