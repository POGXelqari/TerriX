/**
 * TerriX Scenario Studio - Application Entrypoint
 * Standalone suite combining procedural cartography, official map templates,
 * a6h scenario configuration, cross-tab BroadcastChannel, and live game telemetry.
 */

import { store } from "./state.js";
import { CanvasEditor } from "./map/canvasEditor.js";
import { ProceduralTerrainGenerator } from "./map/generator.js";
import { SpawnPlacer } from "./map/spawnPlacer.js";
import { ScenarioPropertiesPanel } from "./scenario/properties.js";
import { RosterEditor } from "./scenario/roster.js";
import { DiplomacyPanel } from "./scenario/diplomacy.js";
import { EconomyPanel } from "./scenario/economy.js";
import { StudioLayout } from "./ui/layout.js";
import { ScenarioSerializer } from "./scenario/serializer.js";
import { ClientController } from "./client_controller.js";
import { OFFICIAL_MAPS, generateTemplateTerrain } from "./map/templates/mapRegistry.js";
import { BIOMES } from "./map/biomes.js";
import { showToast } from "./ui/components.js";

function initStudio() {
  const canvasEl = document.getElementById("viewportCanvas");
  const overlayCanvasEl = document.getElementById("viewportOverlay");
  if (!canvasEl || !overlayCanvasEl) {
    console.error("[ScenarioStudio] Critical: canvas viewport elements not found");
    return;
  }

  // 1. Initialize Canvas Editor
  const canvasEditor = new CanvasEditor(canvasEl, overlayCanvasEl);

  // 2. Initialize Map Generator
  const mapGen = new ProceduralTerrainGenerator(1024, 1024, 64, store.get("mapSeed"));
  const heightmap = mapGen.generateHeightmap();
  const baked = mapGen.bakeTerrainBuffers(heightmap, store.get("mapProceduralIndex") || 2);
  canvasEditor.initBuffers(1024, 1024, baked.visualImgData, baked.enginePropertyBuffer);

  // 3. Initialize Spawn Placer
  const spawnPlacer = new SpawnPlacer(1024, 1024, canvasEditor.validator);

  // Initial spawn distribution
  if (store.get("spawningData")[0] === 0 && store.get("spawningData")[1] === 0) {
    const initialSpawns = spawnPlacer.distributeEvenly(store.get("playerCount") || 512, 6);
    store.set("spawningData", initialSpawns);
    canvasEditor.renderOverlays();
  }

  // 4. Initialize Inspector Panels
  const propContainer = document.getElementById("panelScenarioProps");
  if (propContainer) new ScenarioPropertiesPanel(propContainer);

  const rosterContainer = document.getElementById("panelRoster");
  if (rosterContainer) new RosterEditor(rosterContainer);

  const diplomacyContainer = document.getElementById("panelDiplomacy");
  if (diplomacyContainer) new DiplomacyPanel(diplomacyContainer);

  const econContainer = document.getElementById("panelEconomy");
  if (econContainer) new EconomyPanel(econContainer);

  // 5. Initialize Map Tools Inspector
  initMapToolsPanel(canvasEditor, mapGen, spawnPlacer);

  // 6. Initialize Workspace & Dock Layout
  const layout = new StudioLayout(canvasEditor, mapGen, spawnPlacer);

  // 7. Initialize Client Controller for BroadcastChannel link
  const clientController = new ClientController(canvasEditor);

  // 8. Check for URL hash scenario parameter or snapshot request
  if (window.location.hash) {
    if (window.location.hash.includes("scenario=")) {
      try {
        ScenarioSerializer.importFromBase64Hash(window.location.hash, store.state);
        store.notify(Object.keys(store.state));
        showToast("Loaded scenario from URL link", "success");
      } catch (err) {
        console.warn("[ScenarioStudio] Hash import warning:", err);
      }
    } else if (window.location.hash.includes("snapshot=active")) {
      setTimeout(() => {
        clientController.pullCurrentGameState();
      }, 500);
    }
  }

  // Expose global debug handle
  window.__studio = {
    store,
    canvasEditor,
    mapGen,
    spawnPlacer,
    layout,
    clientController,
    serializer: ScenarioSerializer
  };

  console.log("[TerriX Scenario Studio] Initialized successfully with multi-tab bus link.");
}

function initMapToolsPanel(editor, generator, spawnPlacer) {
  const container = document.getElementById("panelMapTools");
  if (!container) return;

  container.innerHTML = `
    <!-- Resolution & Dimensions -->
    <div class="panel-section">
      <div class="panel-title">Canvas Resolution & Sizing</div>
      <div class="form-row">
        <label>Preset</label>
        <select id="selMapResolution" class="studio-input" style="flex: 1;">
          <option value="512x512">512 × 512 (Small / 1v1)</option>
          <option value="1024x1024" selected>1024 × 1024 (Standard)</option>
          <option value="1536x1536">1536 × 1536 (Large Arena)</option>
          <option value="2048x1024">2048 × 1024 (Panoramic)</option>
          <option value="custom">Custom Dimensions...</option>
        </select>
      </div>
      <div id="rowCustomDims" class="form-row" style="display: none;">
        <label>Dimensions (W × H)</label>
        <div style="display: flex; gap: 6px; flex: 1;">
          <input type="number" id="inpCustomW" class="studio-input" value="1024" step="4" min="128" max="4096" style="flex: 1;" placeholder="W">
          <span style="color: #64748b; line-height: 28px;">×</span>
          <input type="number" id="inpCustomH" class="studio-input" value="1024" step="4" min="128" max="4096" style="flex: 1;" placeholder="H">
        </div>
      </div>
      <button id="btnApplyResize" class="studio-btn" style="width: 100%; margin-top: 6px;">
        📐 Apply Canvas Dimensions
      </button>
    </div>

    <!-- Official Map Templates -->
    <div class="panel-section">
      <div class="panel-title">Official Map Templates (25 Maps)</div>
      <div class="form-row">
        <label>Game Map</label>
        <select id="selOfficialMap" class="studio-input" style="flex: 1;">
          ${OFFICIAL_MAPS.map(m => `<option value="${m.index}">${m.name} (${m.width}×${m.height})</option>`).join("")}
        </select>
      </div>
      <button id="btnLoadOfficialMap" class="studio-btn btn-primary" style="width: 100%; margin-top: 6px;">
        🗺️ Load Baseline Canvas Template
      </button>
    </div>

    <!-- Procedural Terrain Generator -->
    <div class="panel-section">
      <div class="panel-title">Procedural Terrain Generator</div>
      <div class="form-row">
        <label>Seed</label>
        <div style="display: flex; gap: 6px; flex: 1;">
          <input type="number" id="mapToolSeed" class="studio-input" value="${store.get("mapSeed")}" min="0" max="16383" style="flex: 1;">
          <button id="btnToolRandSeed" class="studio-btn">🎲</button>
        </div>
      </div>
      <div class="form-row">
        <label>Biome Palette</label>
        <select id="mapToolBiome" class="studio-input" style="flex: 1;">
          ${BIOMES.map(b => `<option value="${b.id}" ${b.id === (store.get("mapProceduralIndex") || 2) ? "selected" : ""}>${b.name}</option>`).join("")}
        </select>
      </div>
      <button id="btnBakeProcedural" class="studio-btn btn-primary" style="width: 100%; margin-top: 6px;">
        ⚙️ Bake Procedural Terrain
      </button>
    </div>

    <!-- Brush & Claim Configuration -->
    <div class="panel-section">
      <div class="panel-title">Brush & Claim Configuration</div>
      <div class="form-row">
        <label>Brush Size</label>
        <input type="range" id="brushSizeSlider" min="2" max="64" value="${editor.brushRadius}">
        <span id="lblBrushSize" class="val-badge">${editor.brushRadius}px</span>
      </div>
      <div class="form-row">
        <label>Terrain Target</label>
        <select id="brushTerrainSelect" class="studio-input">
          <option value="1" ${editor.activeTerrainType === 1 ? "selected" : ""}>Neutral Land (Green)</option>
          <option value="2" ${editor.activeTerrainType === 2 ? "selected" : ""}>Shallow Water / River</option>
          <option value="3" ${editor.activeTerrainType === 3 ? "selected" : ""}>Deep Ocean (Barrier)</option>
          <option value="5" ${editor.activeTerrainType === 5 ? "selected" : ""}>Impassable Mountain</option>
        </select>
      </div>
      <div class="form-row">
        <label>Claiming Player</label>
        <select id="selClaimPlayer" class="studio-input"></select>
      </div>
    </div>

    <!-- Viewport Overlays -->
    <div class="panel-section">
      <div class="panel-title">Multi-Layer Viewport Overlays</div>
      <div class="form-row">
        <label>Player Spawns (Layer 1)</label>
        <input type="checkbox" id="chkShowSpawns" ${editor.showSpawns ? "checked" : ""}>
      </div>
      <div class="form-row">
        <label>Pre-Claimed Land (Layer 1)</label>
        <input type="checkbox" id="chkShowOwnership" ${editor.showOwnership ? "checked" : ""}>
      </div>
      <div class="form-row">
        <label>Voronoi Division (Layer 2)</label>
        <input type="checkbox" id="chkShowVoronoi" ${editor.showVoronoi ? "checked" : ""}>
      </div>
      <button id="btnFitViewport" class="studio-btn" style="width: 100%; margin-top: 8px;">
        🔍 Fit Canvas to Window
      </button>
    </div>
  `;

  // Populate Claim Player selector
  const selClaim = document.getElementById("selClaimPlayer");
  if (selClaim) {
    const names = store.get("playerNamesData") || [];
    let opts = "";
    for (let i = 0; i < Math.min(store.get("playerCount") || 512, 128); i++) {
      const name = names[i] || (i === 0 ? "Player" : `Bot ${i}`);
      opts += `<option value="${i}">#${i}: ${name}</option>`;
    }
    selClaim.innerHTML = opts;
    selClaim.addEventListener("change", (e) => {
      editor.selectedClaimPlayer = parseInt(e.target.value);
    });
  }

  // Resolution selector events
  const selRes = document.getElementById("selMapResolution");
  const rowCustom = document.getElementById("rowCustomDims");
  selRes?.addEventListener("change", (e) => {
    if (rowCustom) {
      rowCustom.style.display = e.target.value === "custom" ? "flex" : "none";
    }
  });

  document.getElementById("btnApplyResize")?.addEventListener("click", () => {
    const val = selRes.value;
    let targetW = 1024;
    let targetH = 1024;

    if (val === "custom") {
      targetW = parseInt(document.getElementById("inpCustomW").value) || 1024;
      targetH = parseInt(document.getElementById("inpCustomH").value) || 1024;
    } else {
      const [wStr, hStr] = val.split("x");
      targetW = parseInt(wStr);
      targetH = parseInt(hStr);
    }

    editor.resizeMap(targetW, targetH);
    const pCount = store.get("playerCount") || 512;
    const newSpawns = spawnPlacer.distributeEvenly(pCount, 8);
    store.set("spawningData", newSpawns);
    editor.renderOverlays();
    showToast(`Resized map to ${editor.width}×${editor.height}`, "success");
  });

  // Official Map Template Loader
  document.getElementById("btnLoadOfficialMap")?.addEventListener("click", () => {
    const idx = parseInt(document.getElementById("selOfficialMap").value) || 0;
    const mapSpec = OFFICIAL_MAPS.find((m) => m.index === idx) || OFFICIAL_MAPS[0];

    const template = generateTemplateTerrain(mapSpec.width, mapSpec.height, "continent", 14071);
    editor.initBuffers(mapSpec.width, mapSpec.height, template.visualImgData, template.enginePropertyBuffer);

    store.batchUpdate(
      {
        mapName: mapSpec.name,
        width: mapSpec.width,
        height: mapSpec.height,
        mapType: 2
      },
      false
    );

    const pCount = store.get("playerCount") || 512;
    const newSpawns = spawnPlacer.distributeEvenly(pCount, 8);
    store.set("spawningData", newSpawns);
    editor.renderOverlays();

    showToast(`Loaded ${mapSpec.name} (${mapSpec.width}×${mapSpec.height}) baseline canvas`, "success");
  });

  // Procedural Terrain Baking
  document.getElementById("btnBakeProcedural")?.addEventListener("click", () => {
    const seed = parseInt(document.getElementById("mapToolSeed").value) || 14071;
    const biome = parseInt(document.getElementById("mapToolBiome").value) || 2;
    store.set("mapSeed", seed);
    store.set("mapProceduralIndex", biome);

    generator.width = editor.width;
    generator.height = editor.height;
    generator.seed = seed;
    const hmap = generator.generateHeightmap();
    const baked = generator.bakeTerrainBuffers(hmap, biome);
    editor.initBuffers(editor.width, editor.height, baked.visualImgData, baked.enginePropertyBuffer);

    const pCount = store.get("playerCount") || 512;
    const newSpawns = spawnPlacer.distributeEvenly(pCount, 8);
    store.set("spawningData", newSpawns);
    editor.renderOverlays();

    showToast("Baked new procedural terrain", "success");
  });

  // Randomize Seed
  document.getElementById("btnToolRandSeed")?.addEventListener("click", () => {
    const newSeed = Math.floor(Math.random() * 16384);
    const inp = document.getElementById("mapToolSeed");
    if (inp) inp.value = newSeed;
    store.set("mapSeed", newSeed);
  });

  // Brush Slider
  const bSlider = document.getElementById("brushSizeSlider");
  const bLbl = document.getElementById("lblBrushSize");
  if (bSlider && bLbl) {
    bSlider.addEventListener("input", (e) => {
      const r = parseInt(e.target.value);
      editor.brushRadius = r;
      bLbl.textContent = `${r}px`;
    });
  }

  // Terrain select
  const tSelect = document.getElementById("brushTerrainSelect");
  if (tSelect) {
    tSelect.addEventListener("change", (e) => {
      editor.activeTerrainType = parseInt(e.target.value);
    });
  }

  // Overlay Checkboxes
  document.getElementById("chkShowSpawns")?.addEventListener("change", (e) => {
    editor.showSpawns = e.target.checked;
    editor.renderOverlays();
  });

  document.getElementById("chkShowOwnership")?.addEventListener("change", (e) => {
    editor.showOwnership = e.target.checked;
    editor.renderOverlays();
  });

  document.getElementById("chkShowVoronoi")?.addEventListener("change", (e) => {
    editor.showVoronoi = e.target.checked;
    editor.renderOverlays();
  });

  document.getElementById("btnFitViewport")?.addEventListener("click", () => {
    editor.fitViewportToContainer();
  });
}

window.addEventListener("DOMContentLoaded", initStudio);
