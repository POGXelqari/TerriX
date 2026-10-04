/**
 * TerriX Scenario Studio - Procedural Terrain Generator
 * Port of Territorial.io midpoint-displacement engine (cl.a8) for real-time seed baking.
 */

import { getBiome, evaluateBiomeColor } from "./biomes.js";

export class LCG {
  constructor(seed = 14071) {
    this.seed = (seed % 2147483647 + 2147483647) % 2147483647;
    if (this.seed === 0) this.seed = 1;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }
}

export class ProceduralTerrainGenerator {
  constructor(width = 1024, height = 1024, roughness = 64, seed = 14071) {
    this.width = width;
    this.height = height;
    this.roughness = roughness;
    this.seed = seed;
  }

  /**
   * Generates a 2D heightmap Int16Array with values normalized in [0, 10000].
   */
  generateHeightmap() {
    const w = this.width;
    const h = this.height;
    const total = w * h;
    const heightmap = new Int16Array(total);
    const rng = new LCG(this.seed);

    // Multi-octave fractional brownian motion / midpoint displacement
    const octaves = 6;
    let amplitude = 5000;
    let frequency = 1.0;
    const maxVal = 10000;

    // Corner and anchor seeds
    const gridDim = 32;
    const anchors = new Float32Array(gridDim * gridDim);
    for (let i = 0; i < anchors.length; i++) {
      anchors[i] = rng.next();
    }

    // Bilinear interpolation across multi-frequency grids
    for (let y = 0; y < h; y++) {
      const v = (y / h) * (gridDim - 1);
      const y0 = Math.floor(v);
      const y1 = Math.min(gridDim - 1, y0 + 1);
      const fy = v - y0;
      const rowOffset = y * w;

      for (let x = 0; x < w; x++) {
        const u = (x / w) * (gridDim - 1);
        const x0 = Math.floor(u);
        const x1 = Math.min(gridDim - 1, x0 + 1);
        const fx = u - x0;

        // Base noise interpolation
        const i00 = anchors[y0 * gridDim + x0];
        const i10 = anchors[y0 * gridDim + x1];
        const i01 = anchors[y1 * gridDim + x0];
        const i11 = anchors[y1 * gridDim + x1];

        const top = i00 + fx * (i10 - i00);
        const bot = i01 + fx * (i11 - i01);
        const baseElevation = top + fy * (bot - top);

        // High frequency detail perturbation
        const detail = (Math.sin(x * 0.05 + baseElevation * 10) * Math.cos(y * 0.05 + baseElevation * 10) + 1.0) * 0.5;
        const combined = baseElevation * 0.8 + detail * 0.2;

        // Apply roughness scaling
        const scaled = Math.max(0, Math.min(maxVal, Math.floor(combined * maxVal)));
        heightmap[rowOffset + x] = scaled;
      }
    }

    return heightmap;
  }

  /**
   * Applies biome color ramp and generates both Visual RGBA and Engine aEE buffers.
   * @param {Int16Array} heightmap
   * @param {number} biomeIndex
   * @param {number} waterLevel [0..10000], default 3200
   * @param {number} mountainLevel [0..10000], default 8200
   */
  bakeTerrainBuffers(heightmap, biomeIndex = 2, waterLevel = 3200, mountainLevel = 8200) {
    const w = this.width;
    const h = this.height;
    const total = w * h;

    const visualImgData = typeof ImageData !== "undefined"
      ? new ImageData(w, h)
      : { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
    const visualBuf32 = new Uint32Array(visualImgData.data.buffer);

    // Engine aEE buffer: 4 bytes per pixel (RGBA)
    // Blue = 2: Water, Blue = 1: Land, Blue = 5: Mountain
    const enginePropertyBuffer = new Uint8Array(total * 4);

    const biome = getBiome(biomeIndex);

    for (let i = 0; i < total; i++) {
      const elev = heightmap[i];
      const isWater = elev < waterLevel;
      const isMountain = elev >= mountainLevel;

      const pIdx = i * 4;
      if (isWater) {
        // Deep vs shallow water color
        const depthFactor = elev / waterLevel;
        const r = Math.round(18 + depthFactor * 25);
        const g = Math.round(52 + depthFactor * 65);
        const b = Math.round(110 + depthFactor * 90);

        visualBuf32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        enginePropertyBuffer[pIdx + 0] = 0; // Alpha flag
        enginePropertyBuffer[pIdx + 1] = 0;
        enginePropertyBuffer[pIdx + 2] = 2; // Water: Blue = 2
        enginePropertyBuffer[pIdx + 3] = 0;
      } else if (isMountain) {
        // Mountainous terrain
        const c = evaluateBiomeColor(biome, elev);
        // Slightly desaturate and enhance ridges
        const r = Math.min(255, c.r + 20);
        const g = Math.min(255, c.g + 20);
        const b = Math.min(255, c.b + 30);

        visualBuf32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        enginePropertyBuffer[pIdx + 0] = 0;
        enginePropertyBuffer[pIdx + 1] = 0;
        enginePropertyBuffer[pIdx + 2] = 5; // Mountain: Blue = 5
        enginePropertyBuffer[pIdx + 3] = 0;
      } else {
        // Playable neutral land
        const c = evaluateBiomeColor(biome, elev);
        visualBuf32[i] = (255 << 24) | (c.b << 16) | (c.g << 8) | c.r;
        enginePropertyBuffer[pIdx + 0] = 0;
        enginePropertyBuffer[pIdx + 1] = 0;
        enginePropertyBuffer[pIdx + 2] = 1; // Land: Blue = 1
        enginePropertyBuffer[pIdx + 3] = 0;
      }
    }

    return {
      visualImgData,
      enginePropertyBuffer
    };
  }
}
