import re
import json

with open('game.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

results = {}
map_keywords = ['World', 'Europe', 'Caucasus', 'Asia', 'America', 'Africa', 'Oceania', 'Pacific', 'Antarctica', 'Island', 'Map']
for kw in map_keywords:
    matches = list(set(re.findall(rf'["\'][^"\']*{kw}[^"\']*["\']', js, re.IGNORECASE)))
    if matches:
        results[kw] = matches[:10]

# Look for map loading functions or image loading
img_loads = list(set(re.findall(r'(\.src\s*=\s*[^;\n]+)', js)))
results['img_loads'] = img_loads

# Look for large arrays or binary buffers (maps are often RLE or bit-packed in territorial.io!)
# Notice function names or array declarations
large_arrays = re.findall(r'(\w+)\s*=\s*new\s+(Uint8Array|Uint16Array|Uint32Array|Int32Array)\(([^)]+)\)', js)
results['typed_arrays'] = [f"{m[0]} = new {m[1]}({m[2]})" for m in large_arrays[:30]]

with open('map_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print("Saved map_analysis.json successfully.")
