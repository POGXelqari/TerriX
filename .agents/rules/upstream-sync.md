# TerriX Architecture & Upstream Sync Rules

## 1. Architectural Boundaries
- NEVER reference obfuscated engine identifiers (e.g. `aE`, `a0A`, `bK`, `fW`, `hN`) directly inside `src/`.
- Access all game variables exclusively via `getVar(name)` from `src/gameInterface.js`.
- If a new engine variable is required:
  1. Register the variable in `build.js` inside `codeSegments` or `rawCodeSegments`.
  2. Map it to `dictionary[name]`.
  3. Export it through `src/gameInterface.js`.

## 2. Patch Modification Rules
- Do NOT write brittle multi-line raw regex strings (`replaceRawCode`) matching more than 50 characters of minified engine code.
- Always use semantic AST transforms (`@babel/traverse`) or flexible structural templates (`modUtils.matchCode`) that tolerate variable renames.
- Every patch must fail LOUDLY. Never wrap patch logic in empty `try {} catch {}` blocks that swallow patch misses.

## 3. Hook Invariants
- The render loop hook must preserve the exact signature:
  `ws.drawImage(a0O, aT.a0L(), aT.a0M()), (window.__TERRIX_HOOK_RENDER__ && window.__TERRIX_HOOK_RENDER__(ws, a0O, im, aT.a0L(), aT.a0M()))`
- Any modification touching `terrixCosmetics.js`, `spawnOptimizer.js`, or `terrixChat.js` must consume the `context` object provided by `__TERRIX_HOOK_RENDER__`.

## 4. Verification & Testing Requirements
- Every change to the build system or patches must pass:
  `npm run build && node tests/smoke-test.js`
- `tests/smoke-test.js` is the authoritative deployment gate. Zero unhandled exceptions allowed.
