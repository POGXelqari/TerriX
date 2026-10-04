/**
 * TerriX Scenario Studio - Pixel Canvas Paint Engine
 * Hardware-accelerated 2D canvas supporting visual rendering, aEE property buffers, and overlay tools.
 */

import { store } from "../state.js";
import { TopologyValidator } from "./validator.js";

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
    this.activeTool = "brush"; // brush, fractal, stamp, fill, eyedropper, spawn, eraser
    this.activeTerrainType = 1; // 1: Land, 2: Water, 5: Mountain
    this.brushRadius = 12;
    this.isDrawing = false;
    this.lastDrawX = null;
    this.lastDrawY = null;

    // Buffers
    this.visualImageData = null;
    this.enginePropBuffer = null; // aEE format
    this.validator = null;

    // Overlays
    this.showSpawns = true;
    this.showChokePoints = false;
    this.selectedPlayerSpawn = 0;

    this.initEvents();
  }

  initBuffers(width = 1024, height = 1024, visualImageData = null, propBuffer = null) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;

    if (visualImageData) {
      this.visualImageData = visualImageData;
      this.ctx.putImageData(visualImageData, 0, 0);
    } else {
      this.visualImageData = this.ctx.createImageData(width, height);
      // Default to deep ocean blue
      const buf32 = new Uint32Array(this.visualImageData.data.buffer);
      buf32.fill((255 << 24) | (110 << 16) | (52 << 8) | 18);
      this.ctx.putImageData(this.visualImageData, 0, 0);
    }

    if (propBuffer) {
      this.enginePropBuffer = propBuffer;
    } else {
      this.enginePropBuffer = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        this.enginePropBuffer[i * 4 + 2] = 2; // Water: Blue = 2
      }
    }

    this.validator = new TopologyValidator(width, height, this.enginePropBuffer);
    this.fitViewportToContainer();
    this.renderOverlays();
  }

  fitViewportToContainer() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const pWidth = parent.clientWidth;
    const pHeight = parent.clientHeight;

    const scaleX = (pWidth - 40) / this.width;
    const scaleY = (pHeight - 40) / this.height;
    this.zoom = Math.min(1.0, Math.max(0.2, Math.min(scaleX, scaleY)));
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

    container.addEventListener("wheel", (e) => {
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
    }, { passive: false });

    container.addEventListener("mousedown", (e) => {
      if (e.button === 1 || e.shiftKey || (e.button === 0 && e.spaceKey)) {
        // Pan viewport
        this.isPanning = true;
        this.panStartX = e.clientX - this.panX;
        this.panStartY = e.clientY - this.panY;
        container.style.cursor = "grabbing";
        return;
      }

      if (e.button === 0) {
        // Left click draw
        const { x, y } = this.screenToWorld(e.clientX, e.clientY);
        this.isDrawing = true;
        this.lastDrawX = x;
        this.lastDrawY = y;
        this.handleToolStroke(x, y);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (this.isPanning) {
        this.panX = e.clientX - this.panStartX;
        this.panY = e.clientY - this.panStartY;
        this.applyTransform();
        return;
      }

      if (this.isDrawing) {
        const { x, y } = this.screenToWorld(e.clientX, e.clientY);
        this.drawLine(this.lastDrawX, this.lastDrawY, x, y);
        this.lastDrawX = x;
        this.lastDrawY = y;
      }
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
        this.renderOverlays();
        // Update store canvas binding
        store.set("canvas", this.canvas);
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
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  }

  handleToolStroke(cx, cy) {
    if (this.activeTool === "spawn") {
      this.placeSpawnAt(cx, cy);
      return;
    }
    if (this.activeTool === "fill") {
      this.floodFill(cx, cy, this.activeTerrainType);
      return;
    }

    const r = this.brushRadius;
    const targetType = this.activeTool === "eraser" ? 2 : this.activeTerrainType;

    const xMin = Math.max(0, cx - r);
    const xMax = Math.min(this.width - 1, cx + r);
    const yMin = Math.max(0, cy - r);
    const yMax = Math.min(this.height - 1, cy + r);

    const imgData = this.visualImageData;
    const data32 = new Uint32Array(imgData.data.buffer);
    const propBuf = this.enginePropBuffer;

    const colorMap = {
      1: (255 << 24) | (60 << 16) | (150 << 8) | 70,    // Land: Green
      2: (255 << 24) | (110 << 16) | (52 << 8) | 18,    // Water: Blue
      5: (255 << 24) | (90 << 16) | (80 << 8) | 80      // Mountain: Dark Slate
    };
    const cVal = colorMap[targetType] || colorMap[1];

    for (let y = yMin; y <= yMax; y++) {
      const rowOffset = y * this.width;
      for (let x = xMin; x <= xMax; x++) {
        const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        let inBounds = distSq <= r * r;

        if (this.activeTool === "fractal") {
          // Stochastic boundary noise
          const noise = Math.sin(x * 0.4) * Math.cos(y * 0.4) * (r * 0.35);
          inBounds = Math.sqrt(distSq) + noise <= r;
        }

        if (inBounds) {
          const idx = rowOffset + x;
          data32[idx] = cVal;
          const pIdx = idx * 4;
          propBuf[pIdx + 0] = 0;
          propBuf[pIdx + 1] = 0;
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
    store.set("spawningData", sData);
    this.renderOverlays();
  }

  floodFill(startX, startY, targetType) {
    const startIdx = startY * this.width + startX;
    const origType = this.enginePropBuffer[startIdx * 4 + 2];
    if (origType === targetType) return;

    const w = this.width;
    const h = this.height;
    const queue = [startIdx];
    const visited = new Uint8Array(w * h);
    visited[startIdx] = 1;

    const colorMap = {
      1: (255 << 24) | (60 << 16) | (150 << 8) | 70,
      2: (255 << 24) | (110 << 16) | (52 << 8) | 18,
      5: (255 << 24) | (90 << 16) | (80 << 8) | 80
    };
    const cVal = colorMap[targetType] || colorMap[1];
    const data32 = new Uint32Array(this.visualImageData.data.buffer);
    const propBuf = this.enginePropBuffer;

    while (queue.length > 0) {
      const idx = queue.pop();
      const cx = idx % w;
      const cy = Math.floor(idx / w);

      data32[idx] = cVal;
      propBuf[idx * 4 + 2] = targetType;

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
  }

  renderOverlays() {
    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Spawns Overlay
    if (this.showSpawns) {
      const sData = store.get("spawningData");
      const pCount = store.get("playerCount") || 512;
      const cData = store.get("colorsData");

      if (sData) {
        for (let i = 0; i < pCount; i++) {
          const x = sData[i * 2];
          const y = sData[i * 2 + 1];
          if (x === 0 && y === 0) continue;

          // Unpack 18-bit color
          let fillStyle = "#10b981";
          if (cData && cData[i]) {
            const packed = cData[i];
            const r = (packed >> 12) & 0x3F;
            const g = (packed >> 6) & 0x3F;
            const b = packed & 0x3F;
            fillStyle = `rgb(${r << 2}, ${g << 2}, ${b << 2})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = fillStyle;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = i === this.selectedPlayerSpawn ? "#f59e0b" : "#ffffff";
          ctx.stroke();

          // Marker label
          if (this.zoom >= 0.8) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px sans-serif";
            ctx.fillText(`${i}`, x + 6, y + 3);
          }
        }
      }
    }
  }
}
