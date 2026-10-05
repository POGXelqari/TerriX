/**
 * TerriX Scenario Studio - Scenario Serializer & Interop Engine
 * Handles bidirectional tt_scenario.json export/import, Base64 URL compression,
 * multi-scenario IndexedDB library management, and cross-tab launch packaging.
 */

export const ScenarioStorage = {
  DB_NAME: "terrix_studio_db",
  STORE_NAME: "scenarios",
  METADATA_STORE: "scenario_meta",
  LAUNCH_KEY: "launch_scenario",

  openDb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        return reject(new Error("IndexedDB unavailable"));
      }
      const req = indexedDB.open(this.DB_NAME, 2);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
        if (!db.objectStoreNames.contains(this.METADATA_STORE)) {
          const metaStore = db.createObjectStore(this.METADATA_STORE, { keyPath: "id" });
          metaStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Saves a scenario into the persistent multi-scenario library.
   */
  async saveScenario(scenarioData, meta = {}) {
    const id = meta.id || `sc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      name: meta.name || scenarioData.mapName || "Untitled Scenario",
      author: meta.author || "Player",
      dimensions: {
        width: scenarioData.width || 1024,
        height: scenarioData.height || 1024
      },
      updatedAt: Date.now(),
      preview: meta.preview || "",
      data: scenarioData
    };

    try {
      const db = await this.openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction([this.STORE_NAME, this.METADATA_STORE], "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const metaStore = tx.objectStore(this.METADATA_STORE);

        store.put(record.data, id);
        metaStore.put({
          id: record.id,
          name: record.name,
          author: record.author,
          dimensions: record.dimensions,
          updatedAt: record.updatedAt,
          preview: record.preview
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return id;
    } catch (e) {
      console.warn("[ScenarioStorage] IndexedDB library save failed, falling back to localStorage", e);
      try {
        localStorage.setItem(`terrix_sc_${id}`, JSON.stringify(record));
        return id;
      } catch (err) {
        console.error("[ScenarioStorage] LocalStorage quota exceeded:", err);
        return id;
      }
    }
  },

  /**
   * Retrieves all saved scenario headers/metadata for the library browser.
   */
  async listScenarios() {
    try {
      const db = await this.openDb();
      return await new Promise((resolve) => {
        const tx = db.transaction(this.METADATA_STORE, "readonly");
        const metaStore = tx.objectStore(this.METADATA_STORE);
        const req = metaStore.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      const list = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("terrix_sc_")) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              list.push({
                id: parsed.id,
                name: parsed.name,
                author: parsed.author,
                dimensions: parsed.dimensions,
                updatedAt: parsed.updatedAt,
                preview: parsed.preview
              });
            }
          }
        }
      } catch (err) {}
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return list;
    }
  },

  /**
   * Fetches full scenario data by id.
   */
  async getScenario(id) {
    try {
      const db = await this.openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readonly");
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      try {
        const raw = localStorage.getItem(`terrix_sc_${id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.data || null;
        }
      } catch (err) {}
      return null;
    }
  },

  /**
   * Deletes a scenario from the library.
   */
  async deleteScenario(id) {
    try {
      const db = await this.openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction([this.STORE_NAME, this.METADATA_STORE], "readwrite");
        tx.objectStore(this.STORE_NAME).delete(id);
        tx.objectStore(this.METADATA_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      try {
        localStorage.removeItem(`terrix_sc_${id}`);
      } catch (err) {}
    }
  },

  /**
   * Sets the single launch_scenario record for cold game client boot.
   */
  async setLaunchScenario(scenarioJson) {
    try {
      const db = await this.openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.put(scenarioJson, this.LAUNCH_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return true;
    } catch (e) {
      console.warn("[ScenarioStorage] IndexedDB storage failed, attempting local/session fallback", e);
      try {
        localStorage.setItem("terrix_launch_scenario", scenarioJson);
        return true;
      } catch (err) {
        try {
          sessionStorage.setItem("terrix_launch_scenario", scenarioJson);
          return true;
        } catch (sErr) {
          console.error("[ScenarioStorage] All browser storage exceeded quota:", sErr);
          throw new Error("Scenario payload exceeds browser storage quota. Please export JSON instead.");
        }
      }
    }
  }
};

export class ScenarioSerializer {
  /**
   * Scales a canvas into a compact preview thumbnail DataURL.
   */
  static generateThumbnail(canvas, maxWidth = 160, maxHeight = 160) {
    if (!canvas || !canvas.width || !canvas.height) return "";
    try {
      const aspect = canvas.width / canvas.height;
      let w = maxWidth;
      let h = Math.round(w / aspect);
      if (h > maxHeight) {
        h = maxHeight;
        w = Math.round(h * aspect);
      }
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = Math.max(1, w);
      thumbCanvas.height = Math.max(1, h);
      const ctx = thumbCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        return thumbCanvas.toDataURL("image/jpeg", 0.75);
      }
    } catch (err) {
      console.warn("[ScenarioSerializer] Failed to generate thumbnail:", err);
    }
    return "";
  }

  /**
   * Serializes active state tree to the official tt_scenario.json format.
   */
  static exportToJson(state) {
    const raw = { ...state };

    // Convert typed arrays to plain arrays for JSON compatibility
    for (const [k, v] of Object.entries(raw)) {
      if (
        v instanceof Uint8Array ||
        v instanceof Uint16Array ||
        v instanceof Uint32Array ||
        v instanceof Int16Array
      ) {
        raw[k] = Array.from(v);
      }
    }

    // Convert HTMLCanvasElement to Base64 DataURL if custom map type
    if (raw.mapType === 2 && raw.canvas && typeof raw.canvas.toDataURL === "function") {
      raw.canvas = raw.canvas.toDataURL("image/png");
    } else if (typeof raw.canvas !== "string") {
      raw.canvas = null;
    }

    return JSON.stringify(raw, null, 2);
  }

  /**
   * Rehydrates scenario state from tt_scenario.json string or parsed object.
   */
  static importFromJson(jsonStringOrObject, targetState) {
    const parsed =
      typeof jsonStringOrObject === "string"
        ? JSON.parse(jsonStringOrObject)
        : jsonStringOrObject;
    Object.assign(targetState, parsed);

    // Map Dimensions
    targetState.width = parsed.width || 1024;
    targetState.height = parsed.height || 1024;

    // Rehydrate TypedArrays
    targetState.teamPlayerCount = new Uint16Array(parsed.teamPlayerCount || 9);
    targetState.colorsData = new Uint32Array(parsed.colorsData || 512);
    targetState.elo = new Uint16Array(parsed.elo || 2);
    targetState.botDifficultyTeam = new Uint8Array(parsed.botDifficultyTeam || 9);
    targetState.botDifficultyData = new Uint8Array(parsed.botDifficultyData || 512);
    targetState.spawningData = new Uint16Array(parsed.spawningData || 1024);
    targetState.aIncomeData = new Uint8Array(parsed.aIncomeData || 512);
    targetState.tIncomeData = new Uint8Array(parsed.tIncomeData || 512);
    targetState.iIncomeData = new Uint8Array(parsed.iIncomeData || 512);
    targetState.sResourcesData = new Uint16Array(parsed.sResourcesData || 512);
    targetState.a75 = new Uint32Array(parsed.a75 || 512);

    // AI Archetypes: 0: Expansionist, 1: Aggressive Raider, 2: Turtle/Banker, 3: Support Drone
    if (parsed.botArchetypes) {
      targetState.botArchetypes = new Uint8Array(parsed.botArchetypes);
    } else {
      targetState.botArchetypes = new Uint8Array(512);
    }

    // Pre-claimed land ownership mask (RLE or array of player IDs per tile)
    if (parsed.preClaimedTerritory) {
      targetState.preClaimedTerritory = Array.isArray(parsed.preClaimedTerritory)
        ? parsed.preClaimedTerritory
        : parsed.preClaimedTerritory;
    } else {
      targetState.preClaimedTerritory = null;
    }

    // Diplomacy Matrix
    if (parsed.diplomacy && typeof parsed.diplomacy === "object") {
      targetState.diplomacy = {
        naps: Array.isArray(parsed.diplomacy.naps) ? parsed.diplomacy.naps : [],
        alliances: Array.isArray(parsed.diplomacy.alliances) ? parsed.diplomacy.alliances : [],
        truces: Array.isArray(parsed.diplomacy.truces) ? parsed.diplomacy.truces : []
      };
    } else {
      targetState.diplomacy = { naps: [], alliances: [], truces: [] };
    }

    // Ensure playerNamesData has 512 elements
    if (!targetState.playerNamesData || !Array.isArray(targetState.playerNamesData)) {
      targetState.playerNamesData = new Array(512);
      for (let i = 0; i < 512; i++) {
        targetState.playerNamesData[i] = i === 0 ? "Player" : `Bot ${i}`;
      }
    }

    return targetState;
  }

  /**
   * Compresses scenario state to a Base64 URL hash parameter.
   */
  static exportToBase64Hash(state) {
    const shallow = { ...state };
    // If sharing via URL hash, omit full large image string if too large
    if (shallow.mapType === 2 && shallow.canvas) {
      if (typeof shallow.canvas === "string" && shallow.canvas.length > 30000) {
        delete shallow.canvas;
        shallow.mapType = 0; // Fall back to procedural seed in URL hash
      }
    }
    const jsonStr = this.exportToJson(shallow);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    return `#scenario=${encoded}`;
  }

  /**
   * Decodes scenario from a Base64 URL hash parameter.
   */
  static importFromBase64Hash(hash, targetState) {
    const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
    const match = cleanHash.match(/scenario=([^&]+)/);
    if (!match) throw new Error("Invalid scenario hash parameter");

    const decoded = decodeURIComponent(escape(atob(match[1])));
    return this.importFromJson(decoded, targetState);
  }

  /**
   * Stores current scenario into IndexedDB/storage and launches the TerriX client.
   */
  static async launchInGame(state, openNewTab = false) {
    const jsonStr = this.exportToJson(state);
    await ScenarioStorage.setLaunchScenario(jsonStr);
    const targetUrl = `index.html?play_scenario=1&t=${Date.now()}`;
    if (openNewTab) {
      window.open(targetUrl, "_blank");
    } else {
      window.location.href = targetUrl;
    }
  }

  /**
   * Triggers a browser file download of tt_scenario.json.
   */
  static downloadJsonFile(state, filename = "tt_scenario.json") {
    const jsonStr = this.exportToJson(state);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
