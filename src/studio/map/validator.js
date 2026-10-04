/**
 * TerriX Scenario Studio - Topology & Connectivity Validator
 * Analyzes landmass continuity, choke-points, and spawn reachability using BFS.
 */

export class TopologyValidator {
  constructor(width, height, enginePropertyBuffer) {
    this.width = width;
    this.height = height;
    this.propBuffer = enginePropertyBuffer; // aEE format (4 bytes per tile)
  }

  isWater(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
    const pIdx = (y * this.width + x) * 4;
    return this.propBuffer[pIdx + 2] === 2 || this.propBuffer[pIdx + 2] === 3;
  }

  isLand(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    const pIdx = (y * this.width + x) * 4;
    return this.propBuffer[pIdx + 2] === 1;
  }

  isMountain(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    const pIdx = (y * this.width + x) * 4;
    return this.propBuffer[pIdx + 2] === 5;
  }

  /**
   * Performs full topological analysis across all map tiles.
   */
  analyze() {
    const w = this.width;
    const h = this.height;
    const totalTiles = w * h;

    const componentLabels = new Int32Array(totalTiles);
    const componentSizes = new Map();
    let currentCompId = 1;
    let totalLandTiles = 0;
    let totalWaterTiles = 0;
    let totalMountainTiles = 0;

    // 1. BFS Component Labeling for Landmasses
    for (let y = 0; y < h; y++) {
      const rowOffset = y * w;
      for (let x = 0; x < w; x++) {
        const idx = rowOffset + x;
        const pIdx = idx * 4;
        const tileType = this.propBuffer[pIdx + 2];

        if (tileType === 2 || tileType === 3) {
          totalWaterTiles++;
          continue;
        }
        if (tileType === 5) {
          totalMountainTiles++;
          continue;
        }

        totalLandTiles++;
        if (componentLabels[idx] === 0) {
          // New land component discovered
          let size = 0;
          const queue = [idx];
          componentLabels[idx] = currentCompId;

          while (queue.length > 0) {
            const curr = queue.pop();
            size++;
            const cx = curr % w;
            const cy = Math.floor(curr / w);

            // 4-directional neighborhood
            const neighbors = [
              cx > 0 ? curr - 1 : -1,
              cx < w - 1 ? curr + 1 : -1,
              cy > 0 ? curr - w : -1,
              cy < h - 1 ? curr + w : -1
            ];

            for (const nIdx of neighbors) {
              if (nIdx !== -1 && componentLabels[nIdx] === 0) {
                const nType = this.propBuffer[nIdx * 4 + 2];
                if (nType === 1) { // Passable land
                  componentLabels[nIdx] = currentCompId;
                  queue.push(nIdx);
                }
              }
            }
          }

          componentSizes.set(currentCompId, size);
          currentCompId++;
        }
      }
    }

    // Sort components by size
    const sortedComponents = Array.from(componentSizes.entries())
      .map(([id, size]) => ({
        id,
        size,
        percentage: totalLandTiles > 0 ? ((size / totalLandTiles) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => b.size - a.size);

    // 2. Choke-Point Detection
    // Identifies land tiles with less than 2 passable cardinal neighbors
    let chokePointCount = 0;
    const chokeHeatmap = new Uint8Array(totalTiles);

    for (let y = 1; y < h - 1; y++) {
      const rowOffset = y * w;
      for (let x = 1; x < w - 1; x++) {
        const idx = rowOffset + x;
        if (this.isLand(x, y)) {
          let openNeighbors = 0;
          if (this.isLand(x - 1, y)) openNeighbors++;
          if (this.isLand(x + 1, y)) openNeighbors++;
          if (this.isLand(x, y - 1)) openNeighbors++;
          if (this.isLand(x, y + 1)) openNeighbors++;

          if (openNeighbors <= 2) {
            chokePointCount++;
            chokeHeatmap[idx] = 1;
          }
        }
      }
    }

    return {
      width: w,
      height: h,
      totalTiles,
      totalLandTiles,
      totalWaterTiles,
      totalMountainTiles,
      landCoveragePercent: ((totalLandTiles / totalTiles) * 100).toFixed(1),
      components: sortedComponents,
      majorContinentCount: sortedComponents.filter(c => c.size >= 1000).length,
      microIslandCount: sortedComponents.filter(c => c.size < 500).length,
      chokePointCount,
      componentLabels,
      chokeHeatmap
    };
  }

  /**
   * Validates player spawn locations against the terrain.
   */
  validateSpawns(spawningData, playerCount = 512) {
    const issues = [];
    const count = Math.min(playerCount, Math.floor(spawningData.length / 2));

    for (let i = 0; i < count; i++) {
      const x = spawningData[i * 2];
      const y = spawningData[i * 2 + 1];

      if (x === 0 && y === 0) continue; // Unset spawn

      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        issues.push({ player: i, x, y, type: "out_of_bounds", severity: "error" });
        continue;
      }

      if (this.isWater(x, y)) {
        issues.push({ player: i, x, y, type: "water_collision", severity: "error" });
      } else if (this.isMountain(x, y)) {
        issues.push({ player: i, x, y, type: "mountain_collision", severity: "warning" });
      }
    }

    return {
      valid: issues.filter(i => i.severity === "error").length === 0,
      issues
    };
  }
}
