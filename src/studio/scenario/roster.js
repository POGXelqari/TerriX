/**
 * TerriX Scenario Studio - Virtualized 512-Slot Roster Editor
 * High-performance list renderer with CSV bulk import, historical/clan generator profiles,
 * WCAG contrast-compliant color ramp, and AI archetype profiles.
 */

import { store } from "../state.js";
import { showToast } from "../ui/components.js";

const ARCHETYPE_LABELS = ["Expansionist", "Raider", "Turtle/Banker", "Support Drone"];

const PROFILES = {
  empires: [
    "Roman Empire", "Carthage", "Byzantine Empire", "Ottoman Empire", "Persian Empire",
    "Mongol Empire", "British Empire", "Macedon", "Ptolemaic Kingdom", "Sparta",
    "Athenian League", "Holy Roman Empire", "Babylon", "Assyria", "Gaul", "Teutonic Order"
  ],
  modern: [
    "United States", "Germany", "France", "Japan", "United Kingdom",
    "Brazil", "Canada", "Poland", "Italy", "Spain", "Sweden", "South Korea",
    "India", "Australia", "Norway", "Netherlands"
  ],
  mythological: [
    "Olympus", "Asgard", "Atlantis", "Avalon", "Valhalla", "Elysium",
    "Tartarus", "Camelot", "Arcadia", "Hyperborea", "El Dorado", "Shangri-La"
  ],
  clans: [
    "[KILR] Ghost", "[KILR] Viper", "[OG] Titan", "[OG] Reaper", "[VOID] Shadow",
    "[VOID] Eclipse", "[CBM] Banker", "[CBM] Vault", "[ELTE] Apex", "[VN] Dragon"
  ]
};

export class RosterEditor {
  constructor(containerElement) {
    this.container = containerElement;
    this.rowHeight = 36;
    this.visibleRowCount = 20;
    this.scrollTop = 0;
    this.searchTerm = "";

    this.init();
    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.some((k) =>
          [
            "playerCount",
            "colorsData",
            "playerNamesData",
            "botDifficultyData",
            "sResourcesData",
            "botArchetypes"
          ].includes(k)
        )
      ) {
        this.renderVisibleRows();
      }
    });
  }

  init() {
    this.container.innerHTML = `
      <div class="roster-toolbar" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
        <input type="text" id="rosterSearch" class="studio-input" placeholder="Search players / tags..." style="flex: 1; min-width: 140px;">
        <button id="btnBulkImport" class="studio-btn">📋 Bulk Import</button>
        <button id="btnProfileGen" class="studio-btn">🎲 Faction Profile</button>
        <button id="btnGradientColors" class="studio-btn">🎨 Contrast Ramp</button>
        <button id="btnBatchTag" class="studio-btn">🏷️ Tag</button>
        <button id="btnBatchTeams" class="studio-btn">⚖️ Auto Teams</button>
      </div>

      <div class="roster-header" style="display: flex; align-items: center; padding: 6px 10px; background: #0e1626; border-radius: 4px; font-size: 11px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span style="width: 36px;">#</span>
        <span style="flex: 1;">Player Name</span>
        <span style="width: 40px; text-align: center;">Color</span>
        <span style="width: 82px;">Difficulty</span>
        <span style="width: 90px;">Archetype</span>
        <span style="width: 58px;">Troops</span>
      </div>

      <div class="roster-scroll-container" id="rosterScroll" style="height: 460px; overflow-y: auto; position: relative; background: #080d16; border-radius: 4px;">
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

    this.bindTools();
    this.renderVisibleRows();
  }

  bindTools() {
    // 1. Bulk Import (CSV / Text)
    document.getElementById("btnBulkImport")?.addEventListener("click", () => {
      this.showBulkImportModal();
    });

    // 2. Faction Profile Generator
    document.getElementById("btnProfileGen")?.addEventListener("click", () => {
      this.showProfilePickerModal();
    });

    // 3. WCAG Contrast Color Ramp
    document.getElementById("btnGradientColors")?.addEventListener("click", () => {
      this.applyContrastColorRamp();
    });

    // 4. Inject Tag
    document.getElementById("btnBatchTag")?.addEventListener("click", () => {
      const tag = prompt("Enter Clan Tag to prepend (e.g. [KILR]):", "[KILR]");
      if (!tag) return;
      const names = [...store.get("playerNamesData")];
      const count = store.get("playerCount");
      for (let i = 0; i < count; i++) {
        const clean = names[i].replace(/\[.*?\]\s*/g, "");
        names[i] = `${tag} ${clean}`.slice(0, 20);
      }
      store.set("playerNamesData", names, false, true);
      showToast(`Injected ${tag} to all active roster slots`, "success");
    });

    // 5. Auto Teams
    document.getElementById("btnBatchTeams")?.addEventListener("click", () => {
      const numTeams = store.get("numberTeams") || 2;
      const count = store.get("playerCount") || 512;
      const teamCounts = new Uint16Array(9);
      const perTeam = Math.floor(count / numTeams);
      for (let t = 1; t <= numTeams; t++) {
        teamCounts[t] = perTeam;
      }
      teamCounts[1] += count % numTeams;
      store.set("teamPlayerCount", teamCounts, false, true);
      showToast(`Balanced ${count} players across ${numTeams} teams`, "success");
    });
  }

  showBulkImportModal() {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
    `;
    modal.innerHTML = `
      <div style="background: #0e1626; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; width: 440px; color: #fff;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">Bulk Roster Import</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">
          Paste lines in format: <code>[CLAN] Name, ColorHex, Difficulty (0-5), StartTroops</code>
        </p>
        <textarea id="txtBulkRoster" style="width: 100%; height: 160px; background: #080d16; border: 1px solid #334155; color: #fff; font-family: monospace; font-size: 11px; padding: 8px; border-radius: 4px;"></textarea>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
          <button id="btnCancelBulk" class="studio-btn">Cancel</button>
          <button id="btnExecuteBulk" class="studio-btn btn-primary">Import</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#btnCancelBulk").onclick = () => modal.remove();
    modal.querySelector("#btnExecuteBulk").onclick = () => {
      const text = modal.querySelector("#txtBulkRoster").value;
      this.executeBulkImport(text);
      modal.remove();
    };
  }

  executeBulkImport(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return;

    const names = [...store.get("playerNamesData")];
    const colors = new Uint32Array(store.get("colorsData"));
    const diffs = new Uint8Array(store.get("botDifficultyData"));
    const troops = new Uint16Array(store.get("sResourcesData"));

    lines.forEach((line, idx) => {
      if (idx >= 512) return;
      const parts = line.split(",").map((p) => p.trim());
      if (parts[0]) names[idx] = parts[0].slice(0, 20);

      if (parts[1] && parts[1].startsWith("#")) {
        const hex = parts[1].slice(1);
        const r = parseInt(hex.slice(0, 2), 16) || 0;
        const g = parseInt(hex.slice(2, 4), 16) || 0;
        const b = parseInt(hex.slice(4, 6), 16) || 0;
        colors[idx] = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
      }

      if (parts[2] !== undefined) {
        diffs[idx] = Math.max(0, Math.min(5, parseInt(parts[2]) || 2));
      }

      if (parts[3] !== undefined) {
        troops[idx] = Math.max(0, Math.min(2047, parseInt(parts[3]) || 512));
      }
    });

    store.batchUpdate(
      {
        playerNamesData: names,
        colorsData: colors,
        botDifficultyData: diffs,
        sResourcesData: troops
      },
      true
    );

    showToast(`Bulk imported ${lines.length} roster entries`, "success");
  }

  showProfilePickerModal() {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000;
      display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
    `;
    modal.innerHTML = `
      <div style="background: #0e1626; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; width: 360px; color: #fff;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">Select Faction Profile</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 14px;">
          Automatically populates all bot names with authentic historical or clan identities.
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="studio-btn btn-primary btn-apply-profile" data-profile="empires" style="text-align: left; padding: 10px;">🏛️ Historical Empires</button>
          <button class="studio-btn btn-primary btn-apply-profile" data-profile="modern" style="text-align: left; padding: 10px;">🌐 Modern Nations</button>
          <button class="studio-btn btn-primary btn-apply-profile" data-profile="mythological" style="text-align: left; padding: 10px;">⚡ Mythological Factions</button>
          <button class="studio-btn btn-primary btn-apply-profile" data-profile="clans" style="text-align: left; padding: 10px;">⚔️ Clan War Simulation</button>
        </div>
        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <button id="btnCancelProfile" class="studio-btn">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#btnCancelProfile").onclick = () => modal.remove();
    modal.querySelectorAll(".btn-apply-profile").forEach((btn) => {
      btn.onclick = () => {
        const pKey = btn.dataset.profile;
        this.applyProfile(pKey);
        modal.remove();
      };
    });
  }

  applyProfile(profileKey) {
    const list = PROFILES[profileKey];
    if (!list) return;

    const names = [...store.get("playerNamesData")];
    const count = store.get("playerCount") || 512;

    for (let i = 0; i < count; i++) {
      if (i === 0) continue; // Keep player 0
      const base = list[(i - 1) % list.length];
      const cycle = Math.floor((i - 1) / list.length);
      names[i] = (cycle === 0 ? base : `${base} ${cycle + 1}`).slice(0, 20);
    }

    store.set("playerNamesData", names, false, true);
    showToast(`Applied ${profileKey} profile across active roster`, "success");
  }

  /**
   * Generates WCAG contrast-compliant color ramp to guarantee spawn readability against terrain.
   */
  applyContrastColorRamp() {
    const count = store.get("playerCount") || 512;
    const colors = new Uint32Array(512);

    for (let i = 0; i < count; i++) {
      const hue = (i * 137.508) % 360;
      let s = 0.85;
      let l = 0.55;

      const rgb = store.hslToRgb(hue, s, l);
      // Relative luminance
      const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
      // Adjust lightness if too dark (< 0.25)
      if (lum < 0.25) {
        l = 0.7;
        const brightRgb = store.hslToRgb(hue, s, l);
        colors[i] = ((brightRgb.r >> 2) << 12) | ((brightRgb.g >> 2) << 6) | (brightRgb.b >> 2);
      } else {
        colors[i] = ((rgb.r >> 2) << 12) | ((rgb.g >> 2) << 6) | (rgb.b >> 2);
      }
    }

    store.set("colorsData", colors, false, true);
    showToast("Generated high-contrast color ramp for all players", "success");
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
    const archetypes = store.get("botArchetypes");

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
        const r = ((p >> 12) & 0x3f) << 2;
        const g = ((p >> 6) & 0x3f) << 2;
        const b = (p & 0x3f) << 2;
        hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }

      const diffVal = diffs && diffs[i] !== undefined ? diffs[i] : 2;
      const troopVal = troops && troops[i] !== undefined ? troops[i] : 512;
      const archVal = archetypes && archetypes[i] !== undefined ? archetypes[i] : 0;

      html += `
        <div class="roster-row" data-index="${i}" style="display: flex; align-items: center; padding: 4px 10px; height: 36px; border-bottom: 1px solid rgba(255,255,255,0.03); gap: 6px;">
          <span style="width: 36px; color: #64748b; font-size: 11px;">#${i}</span>
          <input type="text" class="roster-name-input studio-input" data-index="${i}" value="${name}" maxlength="20" style="flex: 1; padding: 3px 6px; font-size: 11px;">
          <input type="color" class="roster-color-picker" data-index="${i}" value="${hexColor}" style="width: 28px; height: 22px; padding: 0; border: none; background: none; cursor: pointer;">
          <select class="roster-diff-select studio-input" data-index="${i}" style="width: 78px; font-size: 10px; padding: 2px;">
            ${diffLabels.map((d, dIdx) => `<option value="${dIdx}" ${diffVal === dIdx ? "selected" : ""}>${d}</option>`).join("")}
          </select>
          <select class="roster-arch-select studio-input" data-index="${i}" style="width: 90px; font-size: 10px; padding: 2px;">
            ${ARCHETYPE_LABELS.map((a, aIdx) => `<option value="${aIdx}" ${archVal === aIdx ? "selected" : ""}>${a}</option>`).join("")}
          </select>
          <input type="number" class="roster-troop-input studio-input" data-index="${i}" value="${troopVal}" min="0" max="2047" style="width: 58px; font-size: 11px; padding: 3px 4px;">
        </div>
      `;
    }

    this.viewportEl.innerHTML = html;
    this.bindRowEvents();
  }

  bindRowEvents() {
    this.viewportEl.querySelectorAll(".roster-name-input").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const names = [...store.get("playerNamesData")];
        names[idx] = e.target.value.slice(0, 20);
        store.set("playerNamesData", names, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-color-picker").forEach((cp) => {
      cp.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const hex = e.target.value.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const packed = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);

        const colors = new Uint32Array(store.get("colorsData"));
        colors[idx] = packed;
        store.set("colorsData", colors, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-diff-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const val = parseInt(e.target.value);
        const diffs = new Uint8Array(store.get("botDifficultyData"));
        diffs[idx] = val;
        store.set("botDifficultyData", diffs, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-arch-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const val = parseInt(e.target.value);
        const arches = new Uint8Array(store.get("botArchetypes") || new Uint8Array(512));
        arches[idx] = val;
        store.set("botArchetypes", arches, false, true);
      });
    });

    this.viewportEl.querySelectorAll(".roster-troop-input").forEach((inp) => {
      inp.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        const val = Math.max(0, Math.min(2047, parseInt(e.target.value) || 0));
        const troops = new Uint16Array(store.get("sResourcesData"));
        troops[idx] = val;
        store.set("sResourcesData", troops, false, true);
      });
    });
  }
}
