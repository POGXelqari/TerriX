# Territorial.io Codebase & Asset Extraction

Comprehensive disassembly, extraction, and reverse-engineering repository for [territorial.io](https://territorial.io) (David Tschacher).

---

## Technical Architecture Overview

Territorial.io is an ultra-optimized HTML5 Canvas strategy game engine designed with minimal dependencies:
- **Canvas-based rendering pipeline**: Zero external UI frameworks; UI widgets, buttons, modal dialogs, and map tiles are rendered directly to `<canvas id="canvasA">`.
- **Procedural & Bit-packed Map Generation**: Landmasses, contour boundaries, elevations, and water bodies are generated procedurally or decoded from bitstream data into typed arrays (`Uint8Array`, `Uint16Array`, `Uint32Array`).
- **Binary WebSocket Engine**: Multiplayer communication uses low-latency binary streams (`b.binaryType = "arraybuffer"`) across servers `wss://game.territorial.io/s50/`, `/s51/`, and `/s52/`. Includes a built-in development mode redirecting traffic to local test ports (`ws://localhost:7130+`).
- **Bot & Game Loop Simulation**: Deterministic tick loop (`bi.aCo = 56ms` baseline) simulating territorial expansion, troop interest rates, border friction, and neutral aggression.
- **Embedded Assets**: Single-file distribution containing base64 audio and image data.

---

## Directory Structure

```text
g:/TerriX/
├── index.html                  # Modular local runner referencing game.js and styles.css
├── index.original.html         # Exact upstream single-file distribution bundle
├── game.js                     # Beautified JavaScript game engine (39,594 lines, 1,267 functions)
├── game.min.js                 # Original minified production client script
├── styles.css                  # Extracted CSS styling
├── sw.js                       # Service worker script (offline caching & PWA)
├── map_analysis.json           # Extracted map types, seed parameters, and typed array specifications
├── assets/                     # Media and icons
│   ├── click.mp3               # Decoded core game audio (action/attack click)
│   ├── logo.png                # Decoded game logo
│   ├── favicon.ico             # Site icon (ICO format)
│   ├── favicon.png             # Site icon (PNG format)
│   ├── apple-touch-icon.png    # iOS touch icon
│   └── preview.png             # Headless browser verification render
├── data/                       # Game data, ranking tables, and legal specs
│   ├── string_table.json       # Decoded string dictionary (Array S)
│   ├── clans.txt               # Current clan rankings and scores
│   ├── clan-results.html       # Match result feed, winning clans, and Gold payout logs
│   ├── players.txt             # Top player leaderboard
│   ├── tutorial.txt            # Official game mechanics manual
│   ├── changelog.txt           # Complete game version changelog
│   ├── terms.txt               # Terms of service
│   ├── privacy.txt             # Privacy policy
│   ├── ads.txt / app-ads.txt   # Advertising publisher records
│   └── robots.txt              # Crawler instructions
├── logs/                       # Game telemetry and match audit logs
│   ├── log_1v1.html            # 1v1 competitive match logs
│   ├── log_br.html             # Battle Royale match logs
│   ├── log_team.html           # Team game match logs
│   ├── log_zombies.html        # Zombie defense mode logs
│   ├── log_propaganda.html     # Clan propaganda ledger
│   └── log_transactions.html   # Gold transfer audit logs
├── wiki/                       # Extracted official documentation
│   ├── wiki_api.html           # Official REST API specification (POST /api/gold/send, etc.)
│   ├── wiki_clans.html         # Clan mechanics, elections, and leaderboards
│   ├── wiki_gold.html          # Gold currency and interest economics
│   ├── wiki_propaganda.html    # Propaganda mechanics
│   ├── wiki_reports.html       # Report system and moderation rules
│   ├── wiki_transactions.html  # Transaction fee schedules
│   └── wiki_faq.html           # Gameplay and mechanics FAQ
└── scripts/                    # Research and extraction tools
    ├── download_all.py         # Unified crawler to re-fetch and extract latest assets
    ├── analyze_networking.py   # WebSocket protocol and server extractor
    ├── analyze_maps.py         # Map definition and array extractor
    └── organize_project.py     # Directory organization pipeline
```

---

## Local Execution Instructions

To run Territorial.io locally:

```powershell
python -m http.server 8080
```

Navigate to `http://localhost:8080/index.html` in any modern web browser.
- **Singleplayer / Custom Scenario**: 100% functional offline against AI bots with all maps (World, Europe, Asia, Americas, Procedural).
- **Multiplayer**: Connects directly to upstream game servers or local WebSocket server on `7130+`.

---

## Multiplayer Protocol Details

- **Binary Serialization**: Packets are bit-packed and unpacked via custom bitstream wrappers (`qS` / `a9` bitfield operations).
- **Server Endpoints**:
  - `wss://game.territorial.io/s50/`
  - `wss://game.territorial.io/s51/`
  - `wss://game.territorial.io/s52/`
- **Verification**: Protected by Cloudflare Turnstile token validation (`sitekey: 0x4AAAAAAEI8HZoG8nJMzxt1`).
