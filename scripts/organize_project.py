import os
import shutil
import glob

# Create directories
os.makedirs('assets', exist_ok=True)
os.makedirs('data', exist_ok=True)
os.makedirs('logs', exist_ok=True)
os.makedirs('wiki', exist_ok=True)
os.makedirs('scripts', exist_ok=True)

# 1. Assets
for src_f in ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'apple-touch-icon-precomposed.png']:
    src_p = os.path.join('downloaded', src_f)
    if os.path.exists(src_p):
        shutil.copy2(src_p, os.path.join('assets', src_f))

# Copy audio and logo
if os.path.exists('extracted_assets/asset_0.mp3'):
    shutil.copy2('extracted_assets/asset_0.mp3', 'assets/click.mp3')
if os.path.exists('extracted_assets/logo_or_banner.png'):
    shutil.copy2('extracted_assets/logo_or_banner.png', 'assets/logo.png')

# 2. Data
data_files = [
    ('changelog.txt', 'changelog.txt'),
    ('tutorial.txt', 'tutorial.txt'),
    ('clan-results.html', 'clan-results.html'),
    ('clans.txt', 'clans.txt'),
    ('players.txt', 'players.txt'),
    ('terms.txt', 'terms.txt'),
    ('privacy.txt', 'privacy.txt'),
    ('ads.txt', 'ads.txt'),
    ('app-ads.txt', 'app-ads.txt'),
    ('robots.txt', 'robots.txt')
]

for src_name, dst_name in data_files:
    src_p = os.path.join('downloaded', src_name)
    if os.path.exists(src_p):
        shutil.copy2(src_p, os.path.join('data', dst_name))

if os.path.exists('string_table.json'):
    shutil.copy2('string_table.json', 'data/string_table.json')

# 3. Logs
log_files = glob.glob('downloaded/log_*.html')
for lf in log_files:
    dst_p = os.path.join('logs', os.path.basename(lf))
    shutil.copy2(lf, dst_p)

# 4. Wiki
wiki_files = glob.glob('downloaded/wiki*.html')
for wf in wiki_files:
    dst_p = os.path.join('wiki', os.path.basename(wf))
    shutil.copy2(wf, dst_p)

# 5. Clean up scripts into scripts/
for py_f in glob.glob('*.py'):
    if py_f != 'organize_project.py':
        shutil.move(py_f, os.path.join('scripts', py_f))

# 6. Create modular index.html that links to styles.css and game.js
local_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Territorial.io (Local Extraction)</title>
  <meta name="description" content="Territorial.io - The Art of Conquest">
  <meta name="viewport" content="width=device-width, maximum-scale=1">
  <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="canvasA" width="128" height="128"></canvas>
  <script src="game.js"></script>
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(local_html)

# Also preserve the original untouched root.html as index.original.html
if os.path.exists('downloaded/root.html'):
    shutil.copy2('downloaded/root.html', 'index.original.html')

print("[+] Organization complete.")
