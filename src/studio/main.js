/**
 * TerriX Scenario Studio - Application Entrypoint
 * Standalone suite combining procedural cartography and a6h scenario configuration.
 */

import { store } from "./state.js";
import { CanvasEditor } from "./map/canvasEditor.js";
import { ProceduralTerrainGenerator } from "./map/generator.js";
import { SpawnPlacer } from "./map/spawnPlacer.js";
import { ScenarioPropertiesPanel } from "./scenario/properties.js";
import { RosterEditor } from "./scenario/roster.js";
import { EconomyPanel } from "./scenario/economy.js";
import { StudioLayout } from "./ui/layout.js";
import { ScenarioSerializer } from "./scenario/serializer.js";
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

  const econContainer = document.getElementById("panelEconomy");
  if (econContainer) new EconomyPanel(econContainer);

  // 5. Initialize Map Tools Inspector
  initMapToolsPanel(canvasEditor, mapGen, spawnPlacer);

  // 6. Initialize Workspace & Dock Layout
  const layout = new StudioLayout(canvasEditor, mapGen, spawnPlacer);

  // 7. Check for URL hash scenario parameter
  if (window.location.hash && window.location.hash.includes("scenario=")) {
    try {
      ScenarioSerializer.importFromBase64Hash(window.location.hash, store.state);
      store.notify(Object.keys(store.state));
      showToast("Loaded scenario from URL link", "success");
    } catch (err) {
      console.warn("[ScenarioStudio] Hash import warning:", err);
    }
  }

  // Expose global debug handle
  window.__studio = {
    store,
    canvasEditor,
    mapGen,
    spawnPlacer,
    layout,
    serializer: ScenarioSerializer
  };

  console.log("[TerriX Scenario Studio] Initialized successfully.");
}

function initMapToolsPanel(editor, generator, spawnPlacer) {
  const container = document.getElementById("panelMapTools");
  if (!container) return;

  container.innerHTML = `
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
        ⚙️ Bake Terrain to Canvas
      </button>
    </div>

    <div class="panel-section">
      <div class="panel-title">Brush Configuration</div>
      <div class="form-row">
        <label>Brush Size</label>
        <input type="range" id="brushSizeSlider" min="2" max="64" value="${editor.brushRadius}">
        <span id="lblBrushSize" class="val-badge">${editor.brushRadius}px</span>
      </div>
      <div class="form-row">
        <label>Terrain Target</label>
        <select id="brushTerrainSelect" class="studio-input">
          <option value="1" ${editor.activeTerrainType === 1 ? "selected" : ""}>Neutral Land (Green)</option>
          <option value="2" ${editor.activeTerrainType === 2 ? "selected" : ""}>Water / Ocean (Blue)</option>
          <option value="5" ${editor.activeTerrainType === 5 ? "selected" : ""}>Impassable Mountain</option>
        </select>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-title">Viewport Overlays</div>
      <div class="form-row">
        <label>Player Spawn Nodes</label>
        <input type="checkbox" id="chkShowSpawns" ${editor.showSpawns ? "checked" : ""}>
      </div>
      <button id="btnFitViewport" class="studio-btn" style="width: 100%;">
        🔍 Fit Canvas to Window
      </button>
    </div>
  `;

  document.getElementById("btnBakeProcedural")?.addEventListener("click", () => {
    const seed = parseInt(document.getElementById("mapToolSeed").value) || 14071;
    const biome = parseInt(document.getElementById("mapToolBiome").value) || 2;
    store.set("mapSeed", seed);
    store.set("mapProceduralIndex", biome);

    generator.seed = seed;
    const hmap = generator.generateHeightmap();
    const baked = generator.bakeTerrainBuffers(hmap, biome);
    editor.initBuffers(1024, 1024, baked.visualImgData, baked.enginePropertyBuffer);

    // Re-spread spawns on the new terrain
    const pCount = store.get("playerCount") || 512;
    const newSpawns = spawnPlacer.distributeEvenly(pCount, 8);
    store.set("spawningData", newSpawns);
    editor.renderOverlays();

    showToast("Baked new procedural terrain", "success");
  });

  const bSlider = document.getElementById("brushSizeSlider");
  const bLbl = document.getElementById("lblBrushSize");
  if (bSlider && bLbl) {
    bSlider.addEventListener("input", (e) => {
      const r = parseInt(e.target.value);
      editor.brushRadius = r;
      bLbl.textContent = `${r}px`;
    });
  }

  const tSelect = document.getElementById("brushTerrainSelect");
  if (tSelect) {
    tSelect.addEventListener("change", (e) => {
      editor.activeTerrainType = parseInt(e.target.value);
    });
  }

  document.getElementById("chkShowSpawns")?.addEventListener("change", (e) => {
    editor.showSpawns = e.target.checked;
    editor.renderOverlays();
  });

  document.getElementById("btnFitViewport")?.addEventListener("click", () => {
    editor.fitViewportToContainer();
  });
}

window.addEventListener("DOMContentLoaded", initStudio);
