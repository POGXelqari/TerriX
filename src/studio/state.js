/**
 * TerriX Scenario Studio - Unified Reactive State Store
 * Implements the Territorial.io a6h scenario specification with typed buffer storage.
 */

export const DefaultScenarioSchema = {
  // Map Binding
  mapType: 0,               // 0: Procedural, 1: Realistic, 2: Custom Canvas
  mapProceduralIndex: 2,    // 0 - 255
  mapRealisticIndex: 0,     // 0 - 255
  mapSeed: 14071,           // 0 - 16383
  mapName: "Custom Scenario",
  canvas: null,             // HTMLCanvasElement or Base64 DataURL
  passableWater: 1,         // 0 or 1
  passableMountains: 1,     // 0 or 1

  // Match Topology
  playerCount: 512,         // 1 - 512
  humanCount: 1,            // Target player index binding
  selectedPlayer: 0,        // Player slot controlled by host (0)
  gameMode: 0,              // 0: Battle Royale, 1: Teams
  playerMode: 0,            // 0: Singleplayer, 1: Multiplayer
  battleRoyaleMode: 0,      // 0: Normal, 1: No Full-Send, 2: 1v1
  numberTeams: 2,           // 2 - 8
  teamPlayerCount: new Uint16Array(9), // Slots 0-8: [neutral, T1, T2, ... T8]
  isZombieMode: 0,
  isContest: 0,
  isReplay: 0,
  elo: new Uint16Array(2),

  // Visuals & Identities
  colorsType: 0,            // 0: Procedural/Random, 1: Custom
  colorsPersonalized: 1,
  colorsData: new Uint32Array(512), // 18-bit packed: (r>>2 << 12) | (g>>2 << 6) | (b>>2)
  selectableColor: 1,
  playerNamesType: 0,       // 0: Kingdoms, 1: Bot Numbers, 2: Custom
  playerNamesData: [],      // Array of 512 strings (max 20 chars each)
  selectableName: 1,

  // AI Mechanics
  neutralBots: 0,
  botDifficultyType: 0,     // 0: Global Uniform, 1: Mixed, 2: Team-Based, 3: Individual Slot
  botDifficultyValue: 2,    // 0: Very Easy ... 5: Impossible
  botDifficultyTeam: new Uint8Array(9),
  botDifficultyData: new Uint8Array(512),

  // Spawning Layout
  spawningType: 0,          // 0: Random Clustered, 1: Team Geodesic, 2: Custom Absolute
  spawningSeed: 0,
  spawningData: new Uint16Array(1024), // Interleaved [x0, y0, x1, y1, ...]
  selectableSpawn: 1,

  // Economic Multipliers
  aIncomeType: 0,           // 0: Base, 1: Uniform Custom, 2: Custom Array
  aIncomeValue: 0,
  aIncomeData: new Uint8Array(512),
  tIncomeType: 0,           // Territorial Growth Income
  tIncomeValue: 32,
  tIncomeData: new Uint8Array(512),
  iIncomeType: 0,           // Interest Rate System
  iIncomeValue: 64,
  iIncomeData: new Uint8Array(512),
  sResourcesType: 0,        // Starting Troops Balance
  sResourcesValue: 512,
  sResourcesData: new Uint16Array(512),
  a75: new Uint32Array(512)
};

class ScenarioStore {
  constructor() {
    this.state = this.createDefaultState();
    this.listeners = new Set();
    this.history = [this.cloneState(this.state)];
    this.historyIndex = 0;
    this.maxHistory = 30;
  }

  createDefaultState() {
    const s = { ...DefaultScenarioSchema };
    s.teamPlayerCount = new Uint16Array(9);
    s.teamPlayerCount[1] = 256;
    s.teamPlayerCount[2] = 256;

    s.colorsData = new Uint32Array(512);
    // Initialize default distinct palette colors
    for (let i = 0; i < 512; i++) {
      const hue = (i * 137.508) % 360;
      const rgb = this.hslToRgb(hue, 0.75, 0.5);
      s.colorsData[i] = ((rgb.r >> 2) << 12) | ((rgb.g >> 2) << 6) | (rgb.b >> 2);
    }

    s.elo = new Uint16Array(2);
    s.elo[0] = 500;
    s.elo[1] = 500;

    s.botDifficultyTeam = new Uint8Array(9);
    s.botDifficultyTeam.fill(2);

    s.botDifficultyData = new Uint8Array(512);
    s.botDifficultyData.fill(2);

    s.spawningData = new Uint16Array(1024);

    s.playerNamesData = new Array(512);
    for (let i = 0; i < 512; i++) {
      s.playerNamesData[i] = i === 0 ? "Player" : `Bot ${i}`;
    }

    s.aIncomeData = new Uint8Array(512);
    s.tIncomeData = new Uint8Array(512);
    s.tIncomeData.fill(32);

    s.iIncomeData = new Uint8Array(512);
    s.iIncomeData.fill(64);

    s.sResourcesData = new Uint16Array(512);
    s.sResourcesData.fill(512);

    s.a75 = new Uint32Array(512);
    return s;
  }

  hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(changedKeys = []) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, changedKeys);
      } catch (err) {
        console.error("[ScenarioStore] Listener error:", err);
      }
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value, silent = false, recordUndo = false) {
    this.state[key] = value;
    if (recordUndo) {
      this.pushHistory();
    }
    if (!silent) {
      this.notify([key]);
    }
  }

  batchUpdate(updates, recordUndo = true) {
    const keys = Object.keys(updates);
    for (const k of keys) {
      this.state[k] = updates[k];
    }
    if (recordUndo) {
      this.pushHistory();
    }
    this.notify(keys);
  }

  pushHistory() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(this.cloneState(this.state));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.cloneState(this.history[this.historyIndex]);
      this.notify(Object.keys(this.state));
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.cloneState(this.history[this.historyIndex]);
      this.notify(Object.keys(this.state));
      return true;
    }
    return false;
  }

  cloneState(source) {
    const target = { ...source };
    if (source.teamPlayerCount) target.teamPlayerCount = new Uint16Array(source.teamPlayerCount);
    if (source.colorsData) target.colorsData = new Uint32Array(source.colorsData);
    if (source.elo) target.elo = new Uint16Array(source.elo);
    if (source.botDifficultyTeam) target.botDifficultyTeam = new Uint8Array(source.botDifficultyTeam);
    if (source.botDifficultyData) target.botDifficultyData = new Uint8Array(source.botDifficultyData);
    if (source.spawningData) target.spawningData = new Uint16Array(source.spawningData);
    if (source.playerNamesData) target.playerNamesData = [...source.playerNamesData];
    if (source.aIncomeData) target.aIncomeData = new Uint8Array(source.aIncomeData);
    if (source.tIncomeData) target.tIncomeData = new Uint8Array(source.tIncomeData);
    if (source.iIncomeData) target.iIncomeData = new Uint8Array(source.iIncomeData);
    if (source.sResourcesData) target.sResourcesData = new Uint16Array(source.sResourcesData);
    if (source.a75) target.a75 = new Uint32Array(source.a75);
    return target;
  }

  reset() {
    this.state = this.createDefaultState();
    this.history = [this.cloneState(this.state)];
    this.historyIndex = 0;
    this.notify(Object.keys(this.state));
  }
}

export const store = new ScenarioStore();
