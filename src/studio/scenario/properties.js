/**
 * TerriX Scenario Studio - Scenario Properties Inspector
 * UI controls for match topology, map bindings, team setups, and bot mechanics.
 */

import { store } from "../state.js";

export class ScenarioPropertiesPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.init();
    store.subscribe((state, changedKeys) => this.onStateChange(state, changedKeys));
  }

  init() {
    this.render();
  }

  onStateChange(state, changedKeys) {
    const relevant = ["mapType", "gameMode", "numberTeams", "playerCount", "botDifficultyType", "spawningType"];
    if (changedKeys.some(k => relevant.includes(k))) {
      this.render();
    }
  }

  render() {
    const s = store.state;
    this.container.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">Match Topology</div>
        <div class="form-row">
          <label>Game Mode</label>
          <select id="propGameMode" class="studio-input">
            <option value="0" ${s.gameMode === 0 ? "selected" : ""}>Battle Royale</option>
            <option value="1" ${s.gameMode === 1 ? "selected" : ""}>Teams</option>
          </select>
        </div>

        ${s.gameMode === 0 ? `
          <div class="form-row">
            <label>BR Sub-Mode</label>
            <select id="propBRMode" class="studio-input">
              <option value="0" ${s.battleRoyaleMode === 0 ? "selected" : ""}>Standard</option>
              <option value="1" ${s.battleRoyaleMode === 1 ? "selected" : ""}>No Full-Send</option>
              <option value="2" ${s.battleRoyaleMode === 2 ? "selected" : ""}>1v1 Duel</option>
            </select>
          </div>
        ` : `
          <div class="form-row">
            <label>Active Teams</label>
            <select id="propNumTeams" class="studio-input">
              ${[2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${s.numberTeams === n ? "selected" : ""}>${n} Teams</option>`).join("")}
            </select>
          </div>
        `}

        <div class="form-row">
          <label>Total Players</label>
          <input type="number" id="propPlayerCount" class="studio-input" min="1" max="512" value="${s.playerCount}">
        </div>

        <div class="form-row">
          <label>Neutral Bots</label>
          <select id="propNeutralBots" class="studio-input">
            <option value="0" ${s.neutralBots === 0 ? "selected" : ""}>Disabled</option>
            <option value="1" ${s.neutralBots === 1 ? "selected" : ""}>Enabled</option>
          </select>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-title">Map Parameters</div>
        <div class="form-row">
          <label>Map Source</label>
          <select id="propMapType" class="studio-input">
            <option value="0" ${s.mapType === 0 ? "selected" : ""}>Procedural Generator</option>
            <option value="1" ${s.mapType === 1 ? "selected" : ""}>Realistic Builtin</option>
            <option value="2" ${s.mapType === 2 ? "selected" : ""}>Custom Studio Canvas</option>
          </select>
        </div>

        <div class="form-row">
          <label>Seed</label>
          <div style="display: flex; gap: 6px;">
            <input type="number" id="propMapSeed" class="studio-input" min="0" max="16383" value="${s.mapSeed}" style="flex: 1;">
            <button id="btnRandomSeed" class="studio-btn">🎲</button>
          </div>
        </div>

        <div class="form-row">
          <label>Passable Water</label>
          <select id="propPassableWater" class="studio-input">
            <option value="1" ${s.passableWater === 1 ? "selected" : ""}>Yes (Boats Enabled)</option>
            <option value="0" ${s.passableWater === 0 ? "selected" : ""}>No (Impassable)</option>
          </select>
        </div>

        <div class="form-row">
          <label>Passable Mountains</label>
          <select id="propPassableMountains" class="studio-input">
            <option value="1" ${s.passableMountains === 1 ? "selected" : ""}>Yes (Slow traversal)</option>
            <option value="0" ${s.passableMountains === 0 ? "selected" : ""}>No (Impassable Barrier)</option>
          </select>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-title">AI & Spawning</div>
        <div class="form-row">
          <label>Bot Difficulty</label>
          <select id="propBotDiffType" class="studio-input">
            <option value="0" ${s.botDifficultyType === 0 ? "selected" : ""}>Uniform Global</option>
            <option value="1" ${s.botDifficultyType === 1 ? "selected" : ""}>Mixed Variance</option>
            <option value="2" ${s.botDifficultyType === 2 ? "selected" : ""}>Team-Based</option>
            <option value="3" ${s.botDifficultyType === 3 ? "selected" : ""}>Individual Roster</option>
          </select>
        </div>

        <div class="form-row">
          <label>Base Difficulty</label>
          <select id="propBotDiffVal" class="studio-input">
            <option value="0" ${s.botDifficultyValue === 0 ? "selected" : ""}>Very Easy</option>
            <option value="1" ${s.botDifficultyValue === 1 ? "selected" : ""}>Easy</option>
            <option value="2" ${s.botDifficultyValue === 2 ? "selected" : ""}>Normal</option>
            <option value="3" ${s.botDifficultyValue === 3 ? "selected" : ""}>Hard</option>
            <option value="4" ${s.botDifficultyValue === 4 ? "selected" : ""}>Expert</option>
            <option value="5" ${s.botDifficultyValue === 5 ? "selected" : ""}>Impossible</option>
          </select>
        </div>

        <div class="form-row">
          <label>Spawn Distribution</label>
          <select id="propSpawnType" class="studio-input">
            <option value="0" ${s.spawningType === 0 ? "selected" : ""}>Random Clustered</option>
            <option value="1" ${s.spawningType === 1 ? "selected" : ""}>Team Geodesic</option>
            <option value="2" ${s.spawningType === 2 ? "selected" : ""}>Custom Studio Placed</option>
          </select>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const bindSelect = (id, key, parser = parseInt) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", (e) => store.set(key, parser(e.target.value)));
      }
    };

    bindSelect("propGameMode", "gameMode");
    bindSelect("propBRMode", "battleRoyaleMode");
    bindSelect("propNumTeams", "numberTeams");
    bindSelect("propPlayerCount", "playerCount");
    bindSelect("propNeutralBots", "neutralBots");
    bindSelect("propMapType", "mapType");
    bindSelect("propPassableWater", "passableWater");
    bindSelect("propPassableMountains", "passableMountains");
    bindSelect("propBotDiffType", "botDifficultyType");
    bindSelect("propBotDiffVal", "botDifficultyValue");
    bindSelect("propSpawnType", "spawningType");

    const seedEl = document.getElementById("propMapSeed");
    if (seedEl) {
      seedEl.addEventListener("change", (e) => store.set("mapSeed", parseInt(e.target.value) || 0));
    }
    const randBtn = document.getElementById("btnRandomSeed");
    if (randBtn) {
      randBtn.addEventListener("click", () => {
        const newSeed = Math.floor(Math.random() * 16384);
        store.set("mapSeed", newSeed);
        if (seedEl) seedEl.value = newSeed;
      });
    }
  }
}
