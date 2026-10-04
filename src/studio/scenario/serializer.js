/**
 * TerriX Scenario Studio - Scenario Serializer & Interop Engine
 * Handles bidirectional tt_scenario.json export/import, Base64 URL compression, and in-game launch packaging.
 */

export class ScenarioSerializer {
  /**
   * Serializes active state tree to the official tt_scenario.json format.
   */
  static exportToJson(state) {
    const raw = { ...state };

    // Convert typed arrays to plain arrays for JSON compatibility
    for (const [k, v] of Object.entries(raw)) {
      if (v instanceof Uint8Array || v instanceof Uint16Array || v instanceof Uint32Array || v instanceof Int16Array) {
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
   * Rehydrates scenario state from tt_scenario.json string.
   */
  static importFromJson(jsonString, targetState) {
    const parsed = JSON.parse(jsonString);
    Object.assign(targetState, parsed);

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
    const jsonStr = this.exportToJson(state);
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
   * Stores current scenario into local storage and launches the TerriX client.
   */
  static launchInGame(state, openNewTab = false) {
    const jsonStr = this.exportToJson(state);
    localStorage.setItem("terrix_launch_scenario", jsonStr);
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
