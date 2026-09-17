# TerriX Client Architecture & Modding Guide

This directory (`client_src/`) contains source assets, custom extensions, and modifications for the TerriX Territorial.io Web Client.

---

## 1. Directory Layout

```text
TerriX/
├── client_src/
│   ├── mods/                       # Custom game extensions and HUD overlays
│   │   └── 01_cbm_hud.js           # Clan Bank Manager (CBM) in-game HUD overlay
│   └── README.md                   # This developer documentation
├── scripts/
│   └── build_client.py             # Client build, mod compiler, & upstream tracking engine
├── client/                         # Distribution bundle (deployed to GitHub Pages)
│   ├── index.html                  # Game canvas host + injected mod tags
│   ├── game.js                     # Deobfuscated Territorial.io core engine
│   ├── game.mods.js                # Bundled client modifications
│   ├── styles.css                  # Core presentation styles
│   ├── assets/                     # Sound and image game assets
│   └── version.json                # Build metadata, upstream hash, and active mod list
└── .github/workflows/
    ├── auto-update-client.yml      # Cron task checking upstream territorial.io every 6h
    └── deploy-pages.yml            # Automatic GitHub Pages deployment upon git push
```

---

## 2. Developing Custom Mods

To add a new mod or client modification:

1. Create a `.js` file in `client_src/mods/` with a numeric prefix to determine load order:
   - Example: `client_src/mods/02_ping_meter.js`
   - Example: `client_src/mods/03_custom_hotkeys.js`
2. Wrap your code in an IIFE:
   ```javascript
   (function () {
     "use strict";
     console.log("[MyMod] Initializing custom feature...");
     // Your logic here
   })();
   ```
3. Run the client build step:
   ```bash
   python scripts/build_client.py --apply-mods
   ```
4. The builder compiles all scripts in `client_src/mods/` into `client/game.mods.js`, links it in `client/index.html`, and verifies JavaScript syntax with `node -c`.

---

## 3. Keeping the Client Up-to-Date

### Automatic Scheduled Sync (GitHub Actions)
The workflow `.github/workflows/auto-update-client.yml` runs automatically every 6 hours via GitHub Actions:
1. Polls `https://territorial.io/` to check for updates.
2. If upstream changed, downloads the new version and runs the full AST-safe deobfuscator.
3. Recompiles all custom mods on top of the newly updated engine.
4. Validates JavaScript syntax.
5. Commits and pushes the update to `main`, which triggers automatic deployment on GitHub Pages.

### Manual CLI Build Commands
You can also run the build step locally:

- **Check upstream & rebuild only if upstream has updated**:
  ```bash
  python scripts/build_client.py --check-upstream
  ```

- **Force re-fetch and re-deobfuscate upstream**:
  ```bash
  python scripts/build_client.py --force-upstream
  ```

- **Compile mods without touching upstream**:
  ```bash
  python scripts/build_client.py --apply-mods
  ```
