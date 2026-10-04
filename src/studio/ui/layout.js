/**
 * TerriX Scenario Studio - Application Dock & Workspace Layout Manager
 */

import { store } from "../state.js";
import { ScenarioSerializer } from "../scenario/serializer.js";
import { showToast, showModal } from "./components.js";

export class StudioLayout {
  constructor(canvasEditor, proceduralGen, spawnPlacer) {
    this.editor = canvasEditor;
    this.generator = proceduralGen;
    this.spawnPlacer = spawnPlacer;

    this.activeWorkspace = "cartography"; // cartography | scenario
    this.activeInspectorTab = "map"; // map | scenario | roster | economy | topology

    this.init();
  }

  init() {
    this.bindWorkspaceTabs();
    this.bindToolDock();
    this.bindInspectorTabs();
    this.bindHeaderActions();
    this.bindStatusBar();
  }

  bindWorkspaceTabs() {
    const tabs = document.querySelectorAll(".workspace-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeWorkspace = tab.dataset.workspace;

        if (this.activeWorkspace === "cartography") {
          this.switchInspectorTab("map");
        } else {
          this.switchInspectorTab("scenario");
        }
      });
    });
  }

  bindToolDock() {
    const toolBtns = document.querySelectorAll(".tool-btn");
    toolBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tool = btn.dataset.tool;
        const terrain = btn.dataset.terrain;

        toolBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (tool) this.editor.activeTool = tool;
        if (terrain) this.editor.activeTerrainType = parseInt(terrain);
      });
    });
  }

  bindInspectorTabs() {
    const tabs = document.querySelectorAll(".inspector-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        this.switchInspectorTab(tab.dataset.tab);
      });
    });
  }

  switchInspectorTab(tabId) {
    this.activeInspectorTab = tabId;
    document.querySelectorAll(".inspector-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === tabId);
    });

    const panels = {
      map: document.getElementById("panelMapTools"),
      scenario: document.getElementById("panelScenarioProps"),
      roster: document.getElementById("panelRoster"),
      economy: document.getElementById("panelEconomy"),
      topology: document.getElementById("panelTopology")
    };

    Object.keys(panels).forEach(k => {
      if (panels[k]) {
        panels[k].style.display = k === tabId ? "block" : "none";
      }
    });

    if (tabId === "topology") {
      this.refreshTopologyView();
    }
  }

  bindHeaderActions() {
    // New Scenario
    const btnNew = document.getElementById("btnNewScenario");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        if (confirm("Reset current scenario to defaults? Unsaved changes will be lost.")) {
          store.reset();
          showToast("Scenario reset to default", "info");
        }
      });
    }

    // Export JSON
    const btnExport = document.getElementById("btnExportJson");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        ScenarioSerializer.downloadJsonFile(store.state);
        showToast("Downloaded tt_scenario.json", "success");
      });
    }

    // Import JSON
    const btnImport = document.getElementById("btnImportJson");
    const fileInput = document.getElementById("fileInputJson");
    if (btnImport && fileInput) {
      btnImport.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            ScenarioSerializer.importFromJson(ev.target.result, store.state);
            store.notify(Object.keys(store.state));
            showToast("Successfully loaded scenario", "success");
          } catch (err) {
            showToast(`Failed to parse JSON: ${err.message}`, "error");
          }
        };
        reader.readAsText(file);
      });
    }

    // Share Link
    const btnShare = document.getElementById("btnShareLink");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        try {
          const hash = ScenarioSerializer.exportToBase64Hash(store.state);
          const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
          navigator.clipboard.writeText(fullUrl);
          showToast("Shareable link copied to clipboard!", "success");
        } catch (err) {
          showToast("Failed to encode share link", "error");
        }
      });
    }

    // Launch in Game
    const btnLaunch = document.getElementById("btnLaunchGame");
    if (btnLaunch) {
      btnLaunch.addEventListener("click", () => {
        ScenarioSerializer.launchInGame(store.state, false);
      });
    }
  }

  bindStatusBar() {
    const coordsEl = document.getElementById("statusCoords");
    const tileTypeEl = document.getElementById("statusTileType");

    this.editor.canvas.parentElement.addEventListener("mousemove", (e) => {
      const { x, y } = this.editor.screenToWorld(e.clientX, e.clientY);
      if (coordsEl) coordsEl.textContent = `X: ${x} | Y: ${y}`;

      if (tileTypeEl && this.editor.enginePropBuffer) {
        const pIdx = (y * this.editor.width + x) * 4;
        const t = this.editor.enginePropBuffer[pIdx + 2];
        const label = t === 2 ? "Water" : (t === 5 ? "Mountain" : (t === 1 ? "Land" : "Border"));
        tileTypeEl.textContent = `Tile: ${label}`;
      }
    });
  }

  refreshTopologyView() {
    const container = document.getElementById("panelTopology");
    if (!container || !this.editor.validator) return;

    const analysis = this.editor.validator.analyze();
    const spawnCheck = this.editor.validator.validateSpawns(store.get("spawningData"), store.get("playerCount"));

    container.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">Landmass Topology</div>
        <div class="form-row">
          <label>Total Land Coverage</label>
          <span class="val-badge">${analysis.landCoveragePercent}%</span>
        </div>
        <div class="form-row">
          <label>Major Continents (&ge;1k px)</label>
          <span class="val-badge">${analysis.majorContinentCount}</span>
        </div>
        <div class="form-row">
          <label>Micro-Islands (&lt;500 px)</label>
          <span class="val-badge">${analysis.microIslandCount}</span>
        </div>
        <div class="form-row">
          <label>Choke-Point Passages</label>
          <span class="val-badge">${analysis.chokePointCount}</span>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-title">Spawn Collision Validation</div>
        <div class="form-row">
          <label>Spawn Integrity</label>
          <span class="val-badge" style="color: ${spawnCheck.valid ? "var(--success)" : "var(--danger)"};">
            ${spawnCheck.valid ? "✓ All Land-Bound" : "⚠ Collisions Detected"}
          </span>
        </div>
        ${spawnCheck.issues.length > 0 ? `
          <div style="font-size: 11px; color: var(--danger); margin-top: 6px;">
            ${spawnCheck.issues.length} invalid spawns detected (colliding with water or mountain boundaries).
          </div>
        ` : `
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 6px;">
            512 players positioned safely on valid landmasses.
          </div>
        `}
      </div>

      <div class="panel-section">
        <div class="panel-title">Auto-Spreader Actions</div>
        <button id="btnAutoSpreadEven" class="studio-btn" style="width: 100%; margin-bottom: 6px;">
          ⚡ Even Electrostatic Spread
        </button>
        <button id="btnAutoSpreadTeam" class="studio-btn" style="width: 100%;">
          🛡️ Team Geodesic Clusters
        </button>
      </div>
    `;

    document.getElementById("btnAutoSpreadEven")?.addEventListener("click", () => {
      const pCount = store.get("playerCount") || 512;
      const spawns = this.spawnPlacer.distributeEvenly(pCount, 10);
      store.set("spawningData", spawns);
      this.editor.renderOverlays();
      this.refreshTopologyView();
      showToast("Even electrostatic distribution applied", "success");
    });

    document.getElementById("btnAutoSpreadTeam")?.addEventListener("click", () => {
      const teamCounts = Array.from(store.get("teamPlayerCount") || [0, 256, 256]);
      const spawns = this.spawnPlacer.distributeTeamClustered(teamCounts, 80);
      store.set("spawningData", spawns);
      this.editor.renderOverlays();
      this.refreshTopologyView();
      showToast("Team geodesic clustering applied", "success");
    });
  }
}
