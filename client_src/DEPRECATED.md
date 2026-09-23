# DEPRECATION NOTICE: `client_src/` is Obsolete

> **STATUS**: **DEPRECATED, DECOMMISSIONED, AND OBSOLETE**  
> **REPLACEMENT**: [`src/`](file:///g:/TerriX/src/) (FXclient Modular Architecture with Webpack)

---

### Why Was `client_src/` Deprecated?
1. **Monolithic Concatenation Issues**: `client_src/mods/` relied on alphabetical script concatenation into `client/game.mods.js`. This lacked true modular bundling, type safety, tree-shaking, and ES module imports.
2. **Architecture Collision**: A conflict existed between `scripts/build_client.py` assembling `client_src/mods/` and the modern Webpack build pipeline (`build.js`, `index.js`, `src/main.js`) outputting to `build/fx.bundle.js`. Running `build_client.py` was overwriting the modern distribution bundle.
3. **Unified Single Source of Truth**: All client features, game hooks, telemetry engines, settings managers, and cosmetic territory patterns are now consolidated exclusively into `src/`.

---

### Migration Guide for Developers & Agents
- **Mod Directory**: Author all game enhancements in `src/`.
- **Cosmetics & Territory Patterns**: Implement patterns and shop features in [`src/terrixCosmetics.js`](file:///g:/TerriX/src/terrixCosmetics.js).
- **Client Entry Point**: Register components in [`src/main.js`](file:///g:/TerriX/src/main.js).
- **Building Client**:
  - `npm run build` or `node index.js` (downloads upstream, patches engine, compiles bundle, syncs to `client/`).
  - `npm run build-only` or `node build.js` (compiles and syncs without re-downloading upstream).
  - `python scripts/build_client.py` (executes the authoritative Node build pipeline).
- **Prohibited**: Do NOT add new scripts to `client_src/mods/` or modify `client/game.mods.js`.
