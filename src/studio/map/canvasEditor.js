/**
 * TerriX Scenario Studio - Pixel Canvas Paint & Cartography Engine
 * Multi-layer rendering pipeline, multi-resolution 4-byte stride alignment,
 * engine-compliant property buffers, pre-claimed territory painting, and Voronoi analysis.
 */

import { store } from "../state.js";
import { TopologyValidator } from "./validator.js";

const TERRAIN_COLOR_MAP = {
  1: (255 << 24) | (60 << 16) | (150 << 8) | 70,   // Neutral Land (Green: R=70, G=150, B=60)
  2: (255 << 24) | (110 << 16) | (52 << 8) | 18,   // Shallow Water (Blue: R=18, G=52, B=110)
  3: (255 << 24) | (80 << 16) | (35 << 8) | 10,    // Deep Ocean (Dark Blue: R=10, G=35, B=80)
  5: (255 << 24) | (90 << 16) | (90 << 8) | 90     // Mountain: Strict Grayscale (R=90, G=90, B=90)
};

export class CanvasEditor {
  constructor(canvasElement, overlayCanvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.overlayCanvas = overlayCanvasElement;
    this.overlayCtx = this.overlayCanvas.getContext("2d");

    this.width = 1024;
    this.height = 1024;

    // Viewport transform
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;

    // Active tool state
    this.activeTool = "brush"; // brush, claim, eraser, fill, spawn, fractal
    this.activeTerrainType = 1; // 1: Land, 2: Water, 3: Ocean, 5: Mountain
    this.selectedClaimPlayer = 0; // Player index for Claim Brush (0: Player, 1+: Bots)
    this.brushRadius = 12;
    this.isDrawing = false;
    this.lastDrawX = null;
    this.lastDrawY = null;
    this.cursorX = -100;
    this.cursorY = -100;

    // Multi-Layer Offscreen Pipeline
    // Layer 0: Base Terrain (rendered on this.canvas)
    // Layer 1: Ownership & Border Overlays (offscreen)
    this.layer1Ownership = document.createElement("canvas");
    this.ctxOwnership = this.layer1Ownership.getContext("2d");

    // Layer 2: Strategic Analysis (Voronoi & Chokepoint heatmap) (offscreen)
    this.layer2Strategic = document.createElement("canvas");
    this.ctxStrategic = this.layer2Strategic.getContext("2d");

    // Layer 3: Active Tool UI (Cursor & Handles) (rendered on this.overlayCanvas along with 1 & 2)

    // Buffers aligned to game.js ad/aEE format:
    // Byte 0: Team flag
    // Byte 1: Territory ID (0 = unowned/neutral, 1..511 = player)
    // Byte 2: Terrain classification (1: Land, 2: Shallow Water, 3: Ocean, 5: Mountain)
    // Byte 3: Border flag (0 = unowned, 208+ = owned)
    this.visualImageData = null;
    this.enginePropBuffer = null;
    this.validator = null;

    // Overlay Toggles
    this.showSpawns = true;
    this.showVoronoi = false;
    this.showChokePoints = false;
    this.showOwnership = true;
    this.selectedPlayerSpawn = 0;

    this.initEvents();

    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.some((k) =>
          ["spawningData", "playerCount", "colorsData", "preClaimedTerritory"].includes(k)
        )
      ) {
        this.renderOverlays();
      }
      if (changedKeys.includes("canvas") && state.canvas && state.canvas !== this.canvas) {
        this.loadCanvasFromSource(state.canvas);
      }
    });
  }

  /**
   * Resizes map with strict 4-byte stride alignment.
   */
  resizeMap(targetW, targetH) {
    const alignedW = Math.max(128, Math.min(4096, Math.round(targetW / 4) * 4));
    const alignedH = Math.max(128, Math.min(4096, Math.round(targetH / 4) * 4));

    console.log(`[CanvasEditor] Resizing canvas to ${alignedW}x${alignedH} (stride-4 aligned)`);

    const oldW = this.width;
    const oldH = this.height;
    const oldVisual = this.visualImageData;
    const oldProps = this.enginePropBuffer;

    this.initBuffers(alignedW, alignedH);

    // Resample previous terrain if exists
    if (oldVisual && oldProps) {
      const srcW = oldW;
      const srcH = oldH;
      const destData = this.visualImageData.data;
      const destProps = this.enginePropBuffer;
      const srcData = oldVisual.data;

      const scaleX = srcW / alignedW;
      const scaleY = srcH / alignedH;

      for (let y = 0; y < alignedH; y++) {
        const sy = Math.min(srcH - 1, Math.floor(y * scaleY));
        for (let x = 0; x < alignedW; x++) {
          const sx = Math.min(srcW - 1, Math.floor(x * scaleX));
          const srcIdx = (sy * srcW + sx) * 4;
          const destIdx = (y * alignedW + x) * 4;

          destData[destIdx] = srcData[srcIdx];
          destData[destIdx + 1] = srcData[srcIdx + 1];
          destData[destIdx + 2] = srcData[srcIdx + 2];
          destData[destIdx + 3] = srcData[srcIdx + 3];

          destProps[destIdx] = oldProps[srcIdx];
          destProps[destIdx + 1] = oldProps[srcIdx + 1];
          destProps[destIdx + 2] = oldProps[srcIdx + 2];
          destProps[destIdx + 3] = oldProps[srcIdx + 3];
        }
      }
      this.ctx.putImageData(this.visualImageData, 0, 0);
    }

    store.batchUpdate(
      {
        width: alignedW,
        height: alignedH,
        canvas: this.canvas
      },
      false
    );

    this.fitViewportToContainer();
    this.renderOverlays();
  }

  loadCanvasFromSource(source) {
    if (typeof source === "string" && source.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        const w = Math.round(img.width / 4) * 4;
        const h = Math.round(img.height / 4) * 4;
        this.initBuffers(w, h);
        this.ctx.drawImage(img, 0, 0, w, h);
        this.visualImageData = this.ctx.getImageData(0, 0, w, h);

        const total = w * h;
        const data = this.visualImageData.data;
        const propBuf = this.enginePropBuffer;

        for (let i = 0; i < total; i++) {
          const pIdx = i * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          if (r === g && r === b) {
            propBuf[pIdx + 2] = 5; // Mountain
          } else if (b > g && b > r) {
            propBuf[pIdx + 2] = 2; // Water
          } else {
            propBuf[pIdx + 2] = 1; // Land
          }
        }

        this.validator = new TopologyValidator(w, h, this.enginePropBuffer);
        this.fitViewportToContainer();
        this.renderOverlays();
      };
      img.src = source;
    }
  }

  initBuffers(width = 1024, height = 1024, visualImageData = null, propBuffer = null) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;

    this.layer1Ownership.width = width;
    this.layer1Ownership.height = height;
    this.layer2Strategic.width = width;
    this.layer2Strategic.height = height;

    if (visualImageData) {
      this.visualImageData = visualImageData;
      this.ctx.putImageData(visualImageData, 0, 0);
    } else {
      this.visualImageData = this.ctx.createImageData(width, height);
      // Default to deep ocean
      const buf32 = new Uint32Array(this.visualImageData.data.buffer);
      buf32.fill(TERRAIN_COLOR_MAP[2]);
      this.ctx.putImageData(this.visualImageData, 0, 0);
    }

    if (propBuffer) {
      this.enginePropBuffer = propBuffer;
    } else {
      this.enginePropBuffer = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        this.enginePropBuffer[i * 4 + 2] = 2; // Default water
      }
    }

    this.validator = new TopologyValidator(width, height, this.enginePropBuffer);

    // Register canvas and custom mapType with state store
    store.batchUpdate(
      {
        canvas: this.canvas,
        mapType: 2,
        width,
        height
      },
      false
    );

    this.renderOverlays();
  }

  fitViewportToContainer() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const pWidth = parent.clientWidth;
    const pHeight = parent.clientHeight;

    const scaleX = (pWidth - 40) / this.width;
    const scaleY = (pHeight - 40) / this.height;
    this.zoom = Math.min(1.0, Math.max(0.15, Math.min(scaleX, scaleY)));
    this.panX = Math.round((pWidth - this.width * this.zoom) / 2);
    this.panY = Math.round((pHeight - this.height * this.zoom) / 2);
    this.applyTransform();
  }

  applyTransform() {
    const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.canvas.style.transform = transform;
    this.canvas.style.transformOrigin = "0 0";
    this.overlayCanvas.style.transform = transform;
    this.overlayCanvas.style.transformOrigin = "0 0";
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const relX = clientX - rect.left - this.panX;
    const relY = clientY - rect.top - this.panY;
    const wx = Math.floor(relX / this.zoom);
    const wy = Math.floor(relY / this.zoom);
    return {
      x: Math.max(0, Math.min(this.width - 1, wx)),
      y: Math.max(0, Math.min(this.height - 1, wy))
    };
  }

  initEvents() {
    const container = this.canvas.parentElement;
    if (!container) return;

    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
        const newZoom = Math.max(0.1, Math.min(16.0, this.zoom * zoomFactor));

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
        this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
        this.zoom = newZoom;
        this.applyTransform();
      },
      { passive: false }
    );

    container.addEventListener("mousedown", (e) => {
      if (e.button === 1 || e.shiftKey || (e.button === 0 && e.spaceKey)) {
        this.isPanning = true;
        this.panStartX = e.clientX - this.panX;
        this.panStartY = e.clientY - this.panY;
        container.style.cursor = "grabbing";
        return;
      }

      if (e.button === 0) {
        const { x, y } = this.screenToWorld(e.clientX, e.clientY);
        this.isDrawing = true;
        this.lastDrawX = x;
        this.lastDrawY = y;
        this.handleToolStroke(x, y);
      }
    });

    window.addEventListener("mousemove", (e) => {
      const { x, y } = this.screenToWorld(e.clientX, e.clientY);
      this.cursorX = x;
      this.cursorY = y;

      if (this.isPanning) {
        this.panX = e.clientX - this.panStartX;
        this.panY = e.clientY - this.panStartY;
        this.applyTransform();
        return;
      }

      if (this.isDrawing) {
        this.drawLine(this.lastDrawX, this.lastDrawY, x, y);
        this.lastDrawX = x;
        this.lastDrawY = y;
      }

      this.renderToolUi();
    });

    window.addEventListener("mouseup", () => {
      if (this.isPanning) {
        this.isPanning = false;
        container.style.cursor = "default";
      }
      if (this.isDrawing) {
        this.isDrawing = false;
        this.lastDrawX = null;
        this.lastDrawY = null;

        // Sync pre-claimed territory if claim brush was used
        if (this.activeTool === "claim" || this.activeTool === "eraser") {
          this.syncClaimState();
        }

        this.renderOverlays();
        store.batchUpdate(
          {
            canvas: this.canvas,
            mapType: 2
          },
          false
        );
      }
    });
  }

  drawLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;
    while (true) {
      this.handleToolStroke(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  handleToolStroke(cx, cy) {
    if (this.activeTool === "spawn") {
      this.placeSpawnAt(cx, cy);
      return;
    }
    if (this.activeTool === "fill") {
      this.floodFill(cx, cy);
      return;
    }

    const r = this.brushRadius;
    const xMin = Math.max(0, cx - r);
    const xMax = Math.min(this.width - 1, cx + r);
    const yMin = Math.max(0, cy - r);
    const yMax = Math.min(this.height - 1, cy + r);

    const imgData = this.visualImageData;
    const data32 = new Uint32Array(imgData.data.buffer);
    const propBuf = this.enginePropBuffer;

    if (this.activeTool === "claim") {
      // Paint nation territory into Byte 1 of propBuffer (only on land tiles)
      const playerId = this.selectedClaimPlayer;
      for (let y = yMin; y <= yMax; y++) {
        const rowOffset = y * this.width;
        for (let x = xMin; x <= xMax; x++) {
          const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (distSq <= r * r) {
            const idx = rowOffset + x;
            const pIdx = idx * 4;
            // Only claim passable land (tileType 1)
            if (propBuf[pIdx + 2] === 1) {
              propBuf[pIdx + 1] = playerId; // Owner slot
              propBuf[pIdx + 3] = 208; // Owned edge flag
            }
          }
        }
      }
      this.renderOwnershipLayer();
      return;
    }

    // Terrain Painting (brush, fractal, eraser)
    const targetType = this.activeTool === "eraser" ? 2 : this.activeTerrainType;
    const cVal = TERRAIN_COLOR_MAP[targetType] || TERRAIN_COLOR_MAP[1];

    for (let y = yMin; y <= yMax; y++) {
      const rowOffset = y * this.width;
      for (let x = xMin; x <= xMax; x++) {
        const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        let inBounds = distSq <= r * r;

        if (this.activeTool === "fractal") {
          const noise = Math.sin(x * 0.4) * Math.cos(y * 0.4) * (r * 0.35);
          inBounds = Math.sqrt(distSq) + noise <= r;
        }

        if (inBounds) {
          const idx = rowOffset + x;
          data32[idx] = cVal;
          const pIdx = idx * 4;
          propBuf[pIdx + 0] = 0;
          propBuf[pIdx + 1] = 0; // Clears owner on terrain change
          propBuf[pIdx + 2] = targetType;
          propBuf[pIdx + 3] = 0;
        }
      }
    }

    this.ctx.putImageData(imgData, 0, 0, xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
  }

  placeSpawnAt(x, y) {
    const sData = store.get("spawningData");
    if (!sData) return;
    const p = this.selectedPlayerSpawn;
    sData[p * 2] = x;
    sData[p * 2 + 1] = y;

    store.batchUpdate(
      {
        spawningData: sData,
        spawningType: 2
      },
      true
    );

    this.renderOverlays();
  }

  floodFill(startX, startY) {
    const startIdx = startY * this.width + startX;
    const propBuf = this.enginePropBuffer;
    const w = this.width;
    const h = this.height;

    if (this.activeTool === "claim") {
      const targetOwner = this.selectedClaimPlayer;
      const origOwner = propBuf[startIdx * 4 + 1];
      if (origOwner === targetOwner) return;

      const queue = [startIdx];
      const visited = new Uint8Array(w * h);
      visited[startIdx] = 1;

      while (queue.length > 0) {
        const idx = queue.pop();
        const cx = idx % w;
        const cy = Math.floor(idx / w);
        const pIdx = idx * 4;

        if (propBuf[pIdx + 2] === 1) {
          // Only on land
          propBuf[pIdx + 1] = targetOwner;
          propBuf[pIdx + 3] = targetOwner > 0 ? 208 : 0;
        }

        const neighbors = [
          cx > 0 ? idx - 1 : -1,
          cx < w - 1 ? idx + 1 : -1,
          cy > 0 ? idx - w : -1,
          cy < h - 1 ? idx + w : -1
        ];

        for (const n of neighbors) {
          if (n !== -1 && !visited[n]) {
            if (propBuf[n * 4 + 1] === origOwner && propBuf[n * 4 + 2] === 1) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }
      }
      this.syncClaimState();
      this.renderOwnershipLayer();
      this.renderOverlays();
      return;
    }

    // Terrain Floodfill
    const targetType = this.activeTerrainType;
    const origType = propBuf[startIdx * 4 + 2];
    if (origType === targetType) return;

    const queue = [startIdx];
    const visited = new Uint8Array(w * h);
    visited[startIdx] = 1;
    const cVal = TERRAIN_COLOR_MAP[targetType] || TERRAIN_COLOR_MAP[1];
    const data32 = new Uint32Array(this.visualImageData.data.buffer);

    while (queue.length > 0) {
      const idx = queue.pop();
      const cx = idx % w;
      const cy = Math.floor(idx / w);

      data32[idx] = cVal;
      propBuf[idx * 4 + 2] = targetType;
      propBuf[idx * 4 + 1] = 0; // Clear ownership

      const neighbors = [
        cx > 0 ? idx - 1 : -1,
        cx < w - 1 ? idx + 1 : -1,
        cy > 0 ? idx - w : -1,
        cy < h - 1 ? idx + w : -1
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n]) {
          if (propBuf[n * 4 + 2] === origType) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    this.ctx.putImageData(this.visualImageData, 0, 0);
    this.renderOverlays();
  }

  syncClaimState() {
    const total = this.width * this.height;
    const claims = new Uint16Array(total);
    let hasClaims = false;

    for (let i = 0; i < total; i++) {
      const owner = this.enginePropBuffer[i * 4 + 1];
      claims[i] = owner;
      if (owner > 0) hasClaims = true;
    }

    store.set("preClaimedTerritory", hasClaims ? Array.from(claims) : null);
  }

  /**
   * Layer 1: Renders pre-claimed nation borders and ownership fills.
   */
  renderOwnershipLayer() {
    const ctx = this.ctxOwnership;
    ctx.clearRect(0, 0, this.width, this.height);

    if (!this.showOwnership) return;

    const cData = store.get("colorsData");
    const propBuf = this.enginePropBuffer;
    const w = this.width;
    const h = this.height;

    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const owner = propBuf[idx * 4 + 1];

        if (owner > 0 && owner < 512) {
          const pIdx = idx * 4;
          // Unpack 18-bit color
          let r = 16, g = 185, b = 129;
          if (cData && cData[owner]) {
            const packed = cData[owner];
            r = ((packed >> 12) & 0x3f) << 2;
            g = ((packed >> 6) & 0x3f) << 2;
            b = (packed & 0x3f) << 2;
          }

          data[pIdx] = r;
          data[pIdx + 1] = g;
          data[pIdx + 2] = b;
          data[pIdx + 3] = 120; // 47% opacity territory fill
        }
      }
    }

    ctx.putImageData(img, 0, 0);
  }

  /**
   * Layer 2: Renders strategic Voronoi land division and chokepoints.
   */
  renderStrategicLayer() {
    const ctx = this.ctxStrategic;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.showVoronoi) {
      this.renderVoronoiCells(ctx);
    }
  }

  renderVoronoiCells(ctx) {
    const sData = store.get("spawningData");
    const pCount = store.get("playerCount") || 512;
    if (!sData) return;

    const validSpawns = [];
    for (let i = 0; i < pCount; i++) {
      const sx = sData[i * 2];
      const sy = sData[i * 2 + 1];
      if (sx > 0 || sy > 0) {
        validSpawns.push({ id: i, x: sx, y: sy });
      }
    }

    if (validSpawns.length < 2) return;

    // Sample grid points for Voronoi boundary detection
    const step = 8;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const pIdx = (y * this.width + x) * 4;
        if (this.enginePropBuffer[pIdx + 2] !== 1) continue; // Land only

        // Find 2 nearest spawns
        let d1 = Infinity, d2 = Infinity;
        let c1 = -1, c2 = -1;

        for (let s = 0; s < validSpawns.length; s++) {
          const sp = validSpawns[s];
          const dist = (x - sp.x) * (x - sp.x) + (y - sp.y) * (y - sp.y);
          if (dist < d1) {
            d2 = d1;
            c2 = c1;
            d1 = dist;
            c1 = sp.id;
          } else if (dist < d2) {
            d2 = dist;
            c2 = sp.id;
          }
        }

        // Draw boundary points where distance ratio is close to 1
        if (d2 - d1 < (step * step * 16) && c1 !== c2) {
          ctx.fillStyle = "rgba(255, 215, 0, 0.4)";
          ctx.fillRect(x, y, step, step);
        }
      }
    }
  }

  /**
   * Main overlay compositor: combines Layer 1, Layer 2, spawns, and Layer 3 UI onto viewportOverlay.
   */
  renderOverlays() {
    this.renderOwnershipLayer();
    this.renderStrategicLayer();

    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Composite Layer 1 (Ownership)
    ctx.drawImage(this.layer1Ownership, 0, 0);

    // Composite Layer 2 (Strategic Analysis)
    ctx.drawImage(this.layer2Strategic, 0, 0);

    // Render Player Spawn Nodes
    if (this.showSpawns) {
      const sData = store.get("spawningData");
      const pCount = store.get("playerCount") || 512;
      const cData = store.get("colorsData");

      if (sData) {
        for (let i = 0; i < pCount; i++) {
          const x = sData[i * 2];
          const y = sData[i * 2 + 1];
          if (x === 0 && y === 0) continue;

          let fillStyle = "#10b981";
          if (cData && cData[i]) {
            const packed = cData[i];
            const r = ((packed >> 12) & 0x3f) << 2;
            const g = ((packed >> 6) & 0x3f) << 2;
            const b = (packed & 0x3f) << 2;
            fillStyle = `rgb(${r}, ${g}, ${b})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = fillStyle;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = i === this.selectedPlayerSpawn ? "#f59e0b" : "#ffffff";
          ctx.stroke();

          if (this.zoom >= 0.8) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px sans-serif";
            ctx.fillText(`${i}`, x + 6, y + 3);
          }
        }
      }
    }

    this.renderToolUi();
  }

  /**
   * Layer 3: Brush cursor circle and UI indicator.
   */
  renderToolUi() {
    if (this.cursorX < 0 || this.cursorY < 0) return;

    const ctx = this.overlayCtx;
    if (this.activeTool === "brush" || this.activeTool === "claim" || this.activeTool === "eraser" || this.activeTool === "fractal") {
      ctx.beginPath();
      ctx.arc(this.cursorX, this.cursorY, this.brushRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.activeTool === "claim" ? "#ffd700" : "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
