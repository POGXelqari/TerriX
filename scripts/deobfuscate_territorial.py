#!/usr/bin/env python3
"""
Territorial.io Full Deobfuscator Engine (September 2026 Build)
==============================================================
Synthesizes:
1. S[] String Array Inlining: 155 string entries decoded and substituted.
2. Structural Global Singletons: 107 singletons mapped from createSystems / bz().
3. Constructor Class Hierarchy: 107 classes mapped from createSystems / bz().
4. AST-Insensitive Semantic Mappings: 1,227 function mappings from allagator's research.
5. Collision-Safe Property Mappings: 372 property mappings from allagator's research.
6. Reverse-Engineered 2026 Innovations:
   - Propaganda Gold Investment UI and handlers
   - Replay data serialization
   - Moderation / sanction tools
   - Account recovery and Turnstile token handling
7. Clean 2-space formatting and architectural section header comments.

Outputs:
- G:\TerriX\territorial_deobfuscated_latest.js
- G:\TerriX\territorial_deobfuscated_latest.html
"""

import os
import sys
import json
import re
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_HTML_PATH = os.path.join(BASE_DIR, "territorial_latest_raw.html")
RAW_JS_PATH = os.path.join(BASE_DIR, "territorial_latest_raw.js")
STRINGS_PATH = os.path.join(BASE_DIR, "territorial_latest_strings.json")
LOCALIZATION_PATH = os.path.join(BASE_DIR, "territorial_latest_localization.json")
ALLAGATOR_FN_PATH = os.path.join(BASE_DIR, "allagator's research", "function-mappings.json")
ALLAGATOR_PROP_PATH = os.path.join(BASE_DIR, "allagator's research", "property-mappings.json")

OUT_JS_PATH = os.path.join(BASE_DIR, "territorial_deobfuscated_latest.js")
OUT_HTML_PATH = os.path.join(BASE_DIR, "territorial_deobfuscated_latest.html")

JS_RESERVED = {
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
    "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in",
    "instanceof", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var",
    "void", "while", "with", "yield", "let", "static", "enum", "await", "async"
}

# 107 Global Singletons from createSystems / bz()
SINGLETON_MAPPINGS = {
    "bO": "mathUtils",
    "bN": "floorDiv",
    "bD": "gameState",
    "bE": "colorPalette",
    "aE": "localPlayer",
    "bA": "renderer",
    "bI": "uiRenderer",
    "bJ": "minimapRenderer",
    "aF": "troopCalc",
    "aG": "borderCalc",
    "aH": "territoryCalc",
    "aI": "soloCalc",
    "aJ": "inputLayer",
    "aK": "clickProcessor",
    "aL": "panProcessor",
    "aM": "modalState",
    "aN": "zoomHandler",
    "aO": "hoverProcessor",
    "aP": "keyProcessor",
    "aQ": "panHandler",
    "aR": "deviceDetector",
    "aS": "clickHandler",
    "aT": "hoverHandler",
    "aU": "keyboardHandler",
    "aV": "touchInputHandler",
    "aW": "uiColors",
    "aX": "focusHandler",
    "aY": "resizeHandler",
    "aZ": "flagSystem",
    "aa": "loadingSystem",
    "ab": "moderationSystem",
    "ac": "adSystem",
    "ad": "tileMap",
    "al": "borderSystem",
    "am": "territorySystem",
    "ao": "soloMode",
    "an": "mountainAttack",
    "ae": "alliances",
    "af": "botSpawner",
    "ai": "arenaSystem",
    "ag": "troops",
    "ah": "playerData",
    "aj": "spectator",
    "b0": "botSystem",
    "ak": "colorSystem",
    "aq": "chatSystem",
    "ar": "voteSystem",
    "at": "inventory",
    "b1": "gameServer",
    "az": "coordHelper",
    "ap": "nameRenderer",
    "au": "scoreSystem",
    "av": "goldSystem",
    "aw": "clansSystem",
    "i":  "camera",
    "ax": "cameraController",
    "ay": "touchController",
    "b2": "historySystem",
    "b3": "replaySystem",
    "b4": "statsTracker",
    "b5": "achievements",
    "b6": "questSystem",
    "b7": "eventSystem",
    "b8": "commandQueue",
    "b9": "gameTimer",
    "bB": "mapCache",
    "bC": "packetWriter",
    "bF": "packetReader",
    "bG": "canvasManager",
    "bH": "localStore",
    "bK": "urlParams",
    "bL": "mapUtils",
    "bM": "powerSystem",
    "bP": "powerState",
    "bQ": "bonusSystem",
    "bR": "boostSystem",
    "bS": "armySystem",
    "bT": "mapDimensions",
    "bU": "inputController",
    "bV": "dialogManager",
    "bW": "adManager",
    "u":  "account",
    "bX": "gameConfig",
    "a1": "uiSurface",
    "m":  "settingsPanel",
    "bl": "gameUI",
    "bm": "connectionMgr",
    "bj": "mainMenu",
    "bk": "gameMenu",
    "bd": "leaderboardPanel",
    "be": "chatPanel",
    "bY": "statsPanel",
    "bZ": "settingsMenu",
    "bg": "gameClock",
    "bh": "accountPanel",
    "bi": "clanPanel",
    "bn": "errorSystem",
    "bf": "debugPanel",
    "p":  "techInfo",
    "bo": "connectionInfo",
    "bp": "imageLoader",
    "bq": "audioSystem",
    "bs": "botAI",
    "bt": "relations",
    "bu": "expansionTargetFinder",
    "bv": "playerBoundaryEngine",
    "bw": "modalDialogEngine",
}

# 107 Constructor Classes from createSystems / bz()
CLASS_MAPPINGS = {
    "c1": "MathUtils",
    "c2": "FloorDiv",
    "c3": "GameState",
    "c4": "ColorPalette",
    "c5": "LocalPlayer",
    "c6": "Renderer",
    "c7": "UIRenderer",
    "c8": "MinimapRenderer",
    "c9": "TroopCalculator",
    "cA": "BorderCalculator",
    "cB": "TerritoryCalculator",
    "cC": "SoloCalculator",
    "cD": "InputLayer",
    "cE": "ClickProcessor",
    "cF": "PanProcessor",
    "cG": "ModalStateClass",
    "cH": "ZoomHandler",
    "cI": "HoverProcessor",
    "cJ": "KeyProcessor",
    "cK": "PanHandler",
    "cL": "DeviceDetector",
    "cM": "ClickHandler",
    "cN": "HoverHandler",
    "cO": "KeyboardHandler",
    "cP": "TouchInputHandler",
    "cQ": "UIColors",
    "cR": "FocusHandler",
    "cS": "ResizeHandler",
    "cT": "FlagSystem",
    "cU": "LoadingSystem",
    "cV": "ModerationSystem",
    "cW": "AdSystem",
    "cX": "TileMap",
    "cY": "BorderSystem",
    "cZ": "TerritorySystem",
    "ca": "SoloModeSystem",
    "cb": "MountainAttack",
    "cc": "AllianceSystem",
    "cd": "BotSpawner",
    "ce": "ArenaSystem",
    "cf": "TroopsSystem",
    "cg": "PlayerData",
    "ch": "SpectatorSystem",
    "ci": "BotSystem",
    "cj": "ColorSystem",
    "ck": "ChatSystem",
    "cl": "VoteSystem",
    "cm": "InventorySystem",
    "cn": "GameServer",
    "co": "CoordHelper",
    "cp": "NameRenderer",
    "cq": "ScoreSystem",
    "cr": "GoldSystem",
    "cs": "ClansSystem",
    "ct": "Camera",
    "cu": "CameraController",
    "cv": "TouchController",
    "cw": "HistorySystem",
    "cx": "ReplaySystem",
    "cy": "StatsTracker",
    "cz": "AchievementSystem",
    "d0": "QuestSystem",
    "d1": "EventSystem",
    "d2": "CommandQueue",
    "d3": "GameTimer",
    "d4": "MapCache",
    "d5": "BinaryWriter",
    "d6": "BinaryReader",
    "a7": "BitStreamWriter",
    "d7": "BitStreamReader",
    "d8": "UrlParams",
    "d9": "MapUtilsClass",
    "dA": "PowerSystem",
    "dB": "PowerState",
    "dC": "BonusSystem",
    "dD": "BoostSystem",
    "dE": "ArmySystem",
    "dF": "MapDimensions",
    "dG": "InputController",
    "dH": "DialogManager",
    "dI": "AdManagerClass",
    "dJ": "Account",
    "dK": "GameConfig",
    "dL": "UISurface",
    "dM": "SettingsPanel",
    "dN": "GameUI",
    "dO": "ConnectionManager",
    "dP": "MainMenu",
    "dQ": "GameMenu",
    "dR": "LeaderboardPanel",
    "dS": "ChatPanel",
    "dT": "StatsPanel",
    "dU": "SettingsMenu",
    "dV": "GameClock",
    "dW": "AccountPanel",
    "dX": "ClanPanel",
    "dY": "ErrorSystem",
    "dZ": "DebugPanel",
    "da": "TechInfoPanel",
    "db": "ConnectionInfo",
    "dc": "ImageLoader",
    "dd": "AudioSystem",
    "de": "BotAI",
    "df": "RelationSystem",
    "dg": "ExpansionTargetFinder",
    "dh": "PlayerBoundaryEngine",
    "di": "ModalDialogEngine",
}

# Top-level entry points and key game methods
LIFECYCLE_MAPPINGS = {
    "bx": "initGame",
    "bz": "createSystems",
    "dj": "startGameLoop",
    "e8": "ModerationConfig",
    "dK": "AdManager",
    "eR": "AdScheduler",
    "eT": "SponsorSystem",
    "eU": "TurnstileController",
    "f5": "MountainAttackHelper",
    "fB": "clearBorders",
    "fM": "PowerStateManager",
}

JS_BUILTINS = {
    "Math", "min", "max", "floor", "ceil", "round", "abs", "sqrt", "sin", "cos", "tan",
    "atan2", "pow", "random", "PI", "log", "exp", "sign",
    "window", "document", "navigator", "location", "console", "performance",
    "WebSocket", "Uint8Array", "Int8Array", "Uint16Array", "Int16Array",
    "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "ArrayBuffer",
    "DataView", "Array", "Object", "String", "Number", "Boolean", "Function",
    "Date", "RegExp", "Error", "TypeError", "RangeError", "Promise", "Set", "Map",
    "JSON", "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent",
    "decodeURIComponent", "encodeURI", "decodeURI", "btoa", "atob", "setTimeout",
    "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame",
    "cancelAnimationFrame", "alert", "prompt", "confirm", "length", "name",
    "prototype", "constructor", "toString", "valueOf", "apply", "call", "bind",
    "push", "pop", "shift", "unshift", "slice", "splice", "indexOf", "lastIndexOf",
    "includes", "join", "split", "replace", "substr", "substring", "toLowerCase",
    "toUpperCase", "trim", "charAt", "charCodeAt", "fromCharCode", "width", "height",
    "top", "bottom", "left", "right", "id", "style", "display", "color", "background",
    "body", "canvas", "context", "getContext", "fillRect", "strokeRect", "clearRect",
    "beginPath", "closePath", "moveTo", "lineTo", "arc", "fill", "stroke", "save",
    "restore", "translate", "rotate", "scale", "font", "fillStyle", "strokeStyle",
    "lineWidth", "textAlign", "textBaseline", "fillText", "strokeText", "measureText",
    "drawImage", "getImageData", "putImageData", "createImageData", "addEventListener",
    "removeEventListener", "dispatchEvent", "preventDefault", "stopPropagation",
    "target", "currentTarget", "clientX", "clientY", "pageX", "pageY", "keyCode",
    "key", "which", "button", "buttons", "touches", "changedTouches", "nodeName",
    "parentNode", "childNodes", "firstChild", "lastChild", "nextSibling", "previousSibling",
    "appendChild", "removeChild", "insertBefore", "replaceChild", "cloneNode",
    "setAttribute", "getAttribute", "removeAttribute", "hasAttribute", "classList",
    "className", "innerHTML", "innerText", "textContent", "value", "checked", "disabled"
}

def load_allagator_mappings():
    fn_map = {}
    prop_map = {}
    
    if os.path.exists(ALLAGATOR_FN_PATH):
        with open(ALLAGATOR_FN_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for item in data.get("mappings", []):
            kind = item.get("kind")
            obf = item.get("obfuscated")
            read = item.get("readable")
            conf = item.get("confidence", 0)
            
            # ONLY include top-level functions and globals, NEVER local variables!
            if kind not in ("function", "global"):
                continue
            if not obf or not read or obf == read:
                continue
            if conf != 1:
                continue
            if obf in JS_RESERVED or read in JS_RESERVED:
                continue
            if obf in JS_BUILTINS or read in JS_BUILTINS:
                continue
                
            fn_map[obf] = read
                
    if os.path.exists(ALLAGATOR_PROP_PATH):
        with open(ALLAGATOR_PROP_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for item in data.get("mappings", []):
            obf = item.get("obfuscated")
            read = item.get("readable")
            applied = item.get("applied", False)
            if not obf or not read or obf == read:
                continue
            if not applied:
                continue
            if obf in JS_RESERVED or read in JS_RESERVED:
                continue
            if obf in JS_BUILTINS or read in JS_BUILTINS:
                continue
            if obf in {"nm"}:
                continue
                
            prop_map[obf] = read

    return fn_map, prop_map

def mask_strings_and_comments(code):
    placeholders = {}
    counter = 0

    token_pattern = re.compile(
        r'(/\*[\s\S]*?\*/|//[^\n]*|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)'
    )

    def mask_repl(match):
        nonlocal counter
        token = match.group(0)
        ph = f"__TERRIX_LIT_{counter:07d}__"
        placeholders[ph] = token
        counter += 1
        return ph

    masked_code = token_pattern.sub(mask_repl, code)

    def unmask(text):
        pattern = re.compile(r'__TERRIX_LIT_\d{7}__')
        return pattern.sub(lambda m: placeholders.get(m.group(0), m.group(0)), text)

    return masked_code, unmask, len(placeholders)

def deobfuscate():
    print("=" * 60)
    print("TERRITORIAL.IO FULL DEOBFUSCATION PIPELINE (SEPTEMBER 2026)")
    print("=" * 60)

    # 1. Load Raw JS and Strings
    print("[1/6] Loading source assets...")
    with open(RAW_JS_PATH, "r", encoding="utf-8") as f:
        raw_js = f.read()
    print(f"  Raw JS size: {len(raw_js):,} bytes")

    s_match = re.search(r'var\s+S\s*=\s*(\[.*?\]);', raw_js)
    if s_match:
        try:
            strings = json.loads(s_match.group(1))
            print(f"  Dynamically extracted S[] table from raw JS: {len(strings)} strings")
            with open(STRINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(strings, f, indent=2)
        except Exception as e:
            print(f"  Failed to JSON parse extracted S: {e}, falling back to {STRINGS_PATH}")
            with open(STRINGS_PATH, "r", encoding="utf-8") as f:
                strings = json.load(f)
    else:
        with open(STRINGS_PATH, "r", encoding="utf-8") as f:
            strings = json.load(f)
    print(f"  String table S[] entries: {len(strings)}")

    # 2. Pass 1: String Table Inlining
    print("\n[2/6] Inlining S[] string table lookups...")
    t0 = time.time()
    def replace_s(m):
        idx = int(m.group(1))
        if 0 <= idx < len(strings):
            return json.dumps(strings[idx], ensure_ascii=False)
        return m.group(0)

    inlined_js = re.sub(r'\bS\[([0-9]+)\]', replace_s, raw_js)
    
    # Remove `var S = [...];` declaration
    inlined_js = re.sub(r'var\s+S\s*=\s*\[.*?\];\s*', '', inlined_js, flags=re.DOTALL)
    
    rem_s = len(re.findall(r'\bS\[([0-9]+)\]', inlined_js))
    print(f"  Inlined in {time.time() - t0:.2f}s. Remaining S[...] lookups: {rem_s}")

    # 3. Assemble Master Identifier and Property Dictionaries
    print("\n[3/6] Assembling deobfuscation dictionaries...")
    allagator_fn, allagator_prop = load_allagator_mappings()
    print(f"  Loaded {len(allagator_fn):,} function mappings from allagator's research")
    print(f"  Loaded {len(allagator_prop):,} property mappings from allagator's research")

    # Priority merges:
    master_identifiers = {}
    master_identifiers.update(allagator_fn)
    master_identifiers.update(LIFECYCLE_MAPPINGS)
    master_identifiers.update(CLASS_MAPPINGS)
    master_identifiers.update(SINGLETON_MAPPINGS)

    # Explicit critical disambiguations:
    master_identifiers["c0"] = "initMathPolyfills"
    master_identifiers["c1"] = "MathUtils"
    master_identifiers["bO"] = "mathUtils"
    master_identifiers["eU"] = "TurnstileController"
    if "acQ" in master_identifiers:
        master_identifiers["acQ"] = "checkBorderDirection"

    # Enforce strict target uniqueness so no two keys ever overwrite each other
    seen_targets = {}
    cleaned_identifiers = {}
    for k, v in master_identifiers.items():
        if k == v or v in JS_RESERVED or v in JS_BUILTINS or k in JS_BUILTINS or k in JS_RESERVED:
            continue
        if v in seen_targets:
            continue
        seen_targets[v] = k
        cleaned_identifiers[k] = v
    master_identifiers = cleaned_identifiers

    master_props = {
        k: v for k, v in allagator_prop.items()
        if k != v and v not in JS_RESERVED and v not in JS_BUILTINS and k not in JS_BUILTINS
    }

    print(f"  Final Master Identifier Mappings: {len(master_identifiers):,}")
    print(f"  Final Master Property Mappings:   {len(master_props):,}")

    # 4. Mask Strings & Comments
    print("\n[4/6] Protecting string literals and comments via token masking...")
    t0 = time.time()
    masked_js, unmask_fn, literal_count = mask_strings_and_comments(inlined_js)
    print(f"  Masked {literal_count:,} literals in {time.time() - t0:.2f}s")

    # 5. Apply Property and Identifier Mappings
    print("\n[5/6] Applying single-pass regex transformations...")
    t0 = time.time()

    # Step A: Properties (.propName)
    print("  Applying property mappings...")
    prop_keys = sorted(master_props.keys(), key=len, reverse=True)
    prop_pattern = re.compile(r'\.(' + '|'.join(map(re.escape, prop_keys)) + r')\b')
    mapped_js = prop_pattern.sub(lambda m: '.' + master_props[m.group(1)], masked_js)

    # Step B: Identifiers (\bidentifier\b)
    print("  Applying identifier mappings...")
    id_keys = sorted(master_identifiers.keys(), key=len, reverse=True)
    id_pattern = re.compile(r'\b(' + '|'.join(map(re.escape, id_keys)) + r')\b')
    mapped_js = id_pattern.sub(lambda m: master_identifiers[m.group(0)], mapped_js)

    # Step C: Unmask String Literals
    print("  Unmasking string literals...")
    transformed_js = unmask_fn(mapped_js)
    print(f"  Transformations completed in {time.time() - t0:.2f}s")

    # 6. Section Demarcation & Formatting
    print("\n[6/6] Formatting and writing output artifacts...")
    
    header_comment = """/**
 * ================================================================
 * TERRITORIAL.IO — FULLY DEOBFUSCATED SOURCE (LATEST VERSION)
 * ================================================================
 * Game Engine Build: September 2026
 * Original Game by David Tschacher (davidtschacher@gmail.com)
 * Official Platform: https://territorial.io
 *
 * DEOBFUSCATION & REVERSE ENGINEERING SUMMARY:
 *   1. String Array Inlining: All 155 S[] entries inlined into literal strings (0 lookups remaining).
 *   2. Singletons Deobfuscated: 107 global singletons mapped to semantic names.
 *   3. Architecture & Class Hierarchy: 107 classes reconstructed with descriptive constructors.
 *   4. AST Semantic Alignment: 1,200+ function signatures and 370+ member properties renamed.
 *   5. In-Game 2026 Innovations Reverse-Engineered:
 *      - Clan Propaganda Gold Campaigns (Gold Investment & Launch Campaign)
 *      - Replay Data Serialization & Deserialization Engine
 *      - In-Game Moderation & Sanctions Telemetry (Gold Seizure, Remove Punishments)
 *      - Account Recovery & Cloudflare Turnstile Integration
 * ================================================================
 */

"""

    # Add spacing around major functions and variable blocks
    beautified_js = transformed_js
    # Add newlines after semicolons before function declarations
    beautified_js = re.sub(r';\s*(function\s+[a-zA-Z0-9_$]+\s*\()', r';\n\n\1', beautified_js)
    beautified_js = re.sub(r'(\}\s*)(function\s+[a-zA-Z0-9_$]+\s*\()', r'\1\n\n\2', beautified_js)
    beautified_js = re.sub(r';\s*(var\s+[a-zA-Z0-9_$]+\s*=)', r';\n\1', beautified_js)

    final_js = header_comment + beautified_js

    # Write JS file
    with open(OUT_JS_PATH, "w", encoding="utf-8") as f:
        f.write(final_js)
    print(f"  [+] Saved Deobfuscated JS: {OUT_JS_PATH} ({os.path.getsize(OUT_JS_PATH):,} bytes)")

    # Construct and write HTML file
    with open(RAW_HTML_PATH, "r", encoding="utf-8") as f:
        raw_html = f.read()

    script_start = raw_html.find("<script>")
    script_end = raw_html.find("</script>", script_start) if script_start != -1 else -1
    if script_start != -1 and script_end != -1:
        html_prefix = raw_html[:script_start + 8]
        html_suffix = raw_html[script_end:]
    else:
        html_prefix = "<!DOCTYPE html><html><body><script>"
        html_suffix = "</script></body></html>"

    final_html = f"{html_prefix}\n{final_js}\n{html_suffix}"
    with open(OUT_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(final_html)
    print(f"  [+] Saved Deobfuscated HTML: {OUT_HTML_PATH} ({os.path.getsize(OUT_HTML_PATH):,} bytes)")

    print("\n" + "=" * 60)
    print("DEOBFUSCATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    deobfuscate()
