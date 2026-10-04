/**
 * TerriX Scenario Studio - Virtualized 512-Slot Roster Editor
 * High-performance list renderer with batch operations and clan tag injection.
 */

import { store } from "../state.js";

export class RosterEditor {
  constructor(containerElement) {
    this.container = containerElement;
    this.rowHeight = 36;
    this.visibleRowCount = 20;
    this.scrollTop = 0;
    this.searchTerm = "";

    this.init();
    store.subscribe((state, changedKeys) => {
      if (changedKeys.some(k => ["playerCount", "colorsData", "playerNamesData", "botDifficultyData", "sResourcesData"].includes(k))) {
        this.renderVisibleRows();
      }
    });
  }

  init() {
    this.container.innerHTML = `
      <div class="roster-toolbar">
        <input type="text" id="rosterSearch" class="studio-input" placeholder="Search players / tags..." style="flex: 1;">
        <button id="btnBatchTag" class="studio-btn">Inject Clan Tag</button>
        <button id="btnBatchTeams" class="studio-btn">Auto Teams</button>
        <button id="btnGradientColors" class="studio-btn">Color Ramp</button>
      </div>
      <div class="roster-header">
        <span style="width: 44px;">#</span>
        <span style="flex: 1;">Player Name</span>
        <span style="width: 70px;">Color</span>
        <span style="width: 80px;">Difficulty</span>
        <span style="width: 70px;">Troops</span>
      </div>
      <div class="roster-scroll-container" id="rosterScroll" style="height: 480px; overflow-y: auto; position: relative;">
        <div id="rosterTotalSpacer" style="width: 100%; height: ${512 * this.rowHeight}px;"></div>
        <div id="rosterViewport" style="position: absolute; top: 0; left: 0; right: 0;"></div>
      </div>
    `;

    this.scrollEl = document.getElementById("rosterScroll");
    this.viewportEl = document.getElementById("rosterViewport");
    this.spacerEl = document.getElementById("rosterTotalSpacer");

    if (this.scrollEl) {
      this.scrollEl.addEventListener("scroll", () => {
        this.scrollTop = this.scrollEl.scrollTop;
        this.renderVisibleRows();
      });
    }

    const searchInput = document.getElementById("rosterSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.renderVisibleRows();
      });
    }

    this.bindBatchTools();
    this.renderVisibleRows();
  }

  bindBatchTools() {
    const btnTag = document.getElementById("btnBatchTag");
    if (btnTag) {
      btnTag.addEventListener("click", () => {
        const tag = prompt("Enter clan tag to inject (e.g. [KILR]):", "[KILR]");
        if (!tag) return;
        const names = [...store.get("playerNamesData")];
        const count = store.get("playerCount");
        for (let i = 0; i < count; i++) {
          const clean = names[i].replace(/\[.*?\]\s*/g, "");
          names[i] = `${tag} ${clean}`.slice(0, 20);
        }
        store.set("playerNamesData", names, false, true);
      });
    }

    const btnTeams = document.getElementById("btnBatchTeams");
    if (btnTeams) {
      btnTeams.addEventListener("click", () => {
        const numTeams = store.get("numberTeams") || 2;
        const count = store.get("playerCount");
        const teamCounts = new Uint16Array(9);
        const perTeam = Math.floor(count / numTeams);
        for (let t = 1; t <= numTeams; t++) {
          teamCounts[t] = perTeam;
        }
        teamCounts[1] += count % numTeams;
        store.set("teamPlayerCount", teamCounts, false, true);
        alert(`Distributed ${count} players across ${numTeams} teams.`);
      });
    }

    const btnColors = document.getElementById("btnGradientColors");
    if (btnColors) {
      btnColors.addEventListener("click", () => {
        const count = store.get("playerCount");
        const colors = new Uint32Array(512);
        for (let i = 0; i < count; i++) {
          const hue = (i / count) * 360;
          const rgb = store.hslToRgb(hue, 0.8, 0.5);
          colors[i] = ((rgb.r >> 2) << 12) | ((rgb.g >> 2) << 6) | (rgb.b >> 2);
        }
        store.set("colorsData", colors, false, true);
      });
    }
  }

  renderVisibleRows() {
    if (!this.viewportEl) return;
    const count = store.get("playerCount") || 512;
    this.spacerEl.style.height = `${count * this.rowHeight}px`;

    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 2);
    const endIndex = Math.min(count, startIndex + this.visibleRowCount + 4);

    this.viewportEl.style.transform = `translateY(${startIndex * this.rowHeight}px)`;

    const names = store.get("playerNamesData");
    const colors = store.get("colorsData");
    const diffs = store.get("botDifficultyData");
    const troops = store.get("sResourcesData");

    const diffLabels = ["V.Easy", "Easy", "Normal", "Hard", "Expert", "Impos"];

    let html = "";
    for (let i = startIndex; i < endIndex; i++) {
      const name = names && names[i] ? names[i] : `Player ${i}`;
      if (this.searchTerm && !name.toLowerCase().includes(this.searchTerm)) {
        continue;
      }

      // Convert 18-bit color to hex
      let hexColor = "#10b981";
      if (colors && colors[i]) {
        const p = colors[i];
        const r = ((p >> 12) & 0x3F) << 2;
        const g = ((p >> 6) & 0x3F) << 2;
        const b = (p & 0x3F) << 2;
        hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }

      const diffVal = diffs && diffs[i] !== undefined ? diffs[i] : 2;
      const troopVal = troops && troops[i] !== undefined ? troops[i] : 512;

      html += `
        <div class="roster-row" data-index="${i}">
          <span style="width: 44px; color: var(--text-dim); font-size: 11px;">#${i}</span>
          <input type="text" class="roster-name-input" data-index="${i}" value="${name}" maxlength="20" style="flex: 1;">
          <input type="color" class="roster-color-picker" data-index="${i}" value="${hexColor}" style="width: 32px; height: 24px; padding: 0; cursor: pointer;">
          <select class="roster-diff-select" data-index="${i}" style="width: 76px; font-size: 11px;">
            ${diffLabels.map((d, dIdx) => `<option value="${dIdx}" ${diffVal === dIdx ? "selected" : ""}>${d}</option>`).join("")}
          </select>
          <input type="number" class="roster-troop-input" data-index="${i}" value="${troopVal}" min="0" max="2047" style="width: 60px; font-size: 11px;">
        </div>
      `;
    }

    this.viewportEl.innerHTML = html;
    this.bindRowInputs();
  }

  bindRowInputs() {
    this.viewportEl.querySelectorAll(".roster-name-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const names = [...store.get("playerNamesData")];
        names[idx] = e.target.value.slice(0, 20);
        store.set("playerNamesData", names, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-color-picker").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const hex = e.target.value;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const packed = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
        const colors = new Uint32Array(store.get("colorsData"));
        colors[idx] = packed;
        store.set("colorsData", colors, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-diff-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const diffs = new Uint8Array(store.get("botDifficultyData"));
        diffs[idx] = parseInt(e.target.value);
        store.set("botDifficultyData", diffs, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-troop-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const troops = new Uint16Array(store.get("sResourcesData"));
        troops[idx] = Math.max(0, Math.min(2047, parseInt(e.target.value) || 0));
        store.set("sResourcesData", troops, false, true);
      });
    });
  }
}
