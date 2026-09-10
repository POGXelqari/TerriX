import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

for w in ['wiki.html', 'wiki_clans.html', 'wiki_transactions.html']:
    with open('downloaded/' + w, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    links = set(re.findall(r'(?:href|src)\s*=\s*["\']([^"\']+)["\']', html))
    print(w, 'links:', links)
