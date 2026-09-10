import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

with open('downloaded/sw.js', 'r', encoding='utf-8', errors='ignore') as f:
    sw_code = f.read()

print(f"sw.js size: {len(sw_code)}")
matches = re.findall(r'["\'](https?://[^"\']+|/[a-zA-Z0-9_\-\.]+[\w/])["\']', sw_code)
print("URLs / paths in sw.js:", set(matches))

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Find all script tags in index.html
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total inline scripts in index.html: {len(scripts)}")
for idx, s in enumerate(scripts):
    print(f"  Script {idx}: {len(s)} chars, starts with: {s.strip()[:60]}...")

# Find all style tags
styles = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL)
print(f"Total inline styles: {len(styles)}")
for idx, st in enumerate(styles):
    print(f"  Style {idx}: {len(st)} chars")

# Check what other tags are in the HTML
tags = re.findall(r'<([a-zA-Z0-9\-]+)', html)
from collections import Counter
print("HTML tag counts:", Counter(tags))
