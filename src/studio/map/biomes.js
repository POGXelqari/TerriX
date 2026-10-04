/**
 * TerriX Scenario Studio - Biome Color Ramps
 * Implements the Territorial.io native 25-biome color grading table (aOO dictionary).
 */

export const BIOMES = [
  {
    id: 0,
    name: "Classic Desert",
    j: [0, 5000, 8000, 10000],
    r: [220, 250, 255, 220],
    g: [190, 220, 0, 0],
    b: [170, 200, 0, 0]
  },
  {
    id: 1,
    name: "Dark Abyss",
    j: [0, 4000, 5000, 6000, 10000],
    r: [25, 0, 100, 0, 25],
    g: [25, 0, 0, 0, 25],
    b: [25, 0, 0, 0, 25]
  },
  {
    id: 2,
    name: "Europe Temperate",
    j: [0, 1000, 3000, 4000, 6000, 8000, 10000],
    r: [30, 45, 80, 120, 180, 220, 240],
    g: [60, 120, 160, 170, 190, 210, 230],
    b: [30, 40, 50, 60, 80, 130, 210]
  },
  {
    id: 3,
    name: "Caucasia Highland",
    j: [0, 400, 1899, 1900, 3200, 4500, 6000, 7700, 8499, 8500, 9500, 10000],
    r: [40, 60, 100, 120, 150, 170, 190, 210, 230, 235, 250, 255],
    g: [80, 120, 150, 160, 170, 180, 190, 200, 210, 215, 240, 250],
    b: [80, 80, 200, 10, 60, 10, 16, 40, 50, 55, 230, 230]
  },
  {
    id: 4,
    name: "Island Kingdom",
    j: [0, 300, 1400, 1700, 3000, 4000, 10000],
    r: [20, 35, 70, 110, 160, 200, 240],
    g: [70, 110, 150, 170, 190, 210, 230],
    b: [50, 60, 70, 90, 120, 160, 220]
  },
  {
    id: 5,
    name: "Volcanic Crags",
    j: [0, 1000, 3000, 3500, 4000, 4500, 7000, 7500, 8000, 10000],
    r: [10, 10, 20, 10, 5, 10, 20, 5, 20, 25],
    g: [15, 25, 30, 40, 60, 80, 100, 120, 140, 180],
    b: [15, 20, 25, 30, 40, 50, 60, 70, 80, 100]
  },
  {
    id: 6,
    name: "Halo Ring",
    j: [0, 700, 2650, 3200, 5000, 8000, 10000],
    r: [10, 10, 60, 255, 255, 200, 200],
    g: [10, 10, 60, 255, 255, 200, 200],
    b: [80, 80, 255, 255, 255, 200, 200]
  },
  {
    id: 7,
    name: "Tundra & Glaciers",
    j: [0, 1500, 3500, 5000, 7500, 9000, 10000],
    r: [180, 195, 210, 225, 240, 250, 255],
    g: [200, 215, 225, 235, 245, 252, 255],
    b: [220, 230, 240, 248, 255, 255, 255]
  },
  {
    id: 8,
    name: "Emerald Savannah",
    j: [0, 700, 1300, 1900, 1901, 2500, 3400, 6000, 10000],
    r: [25, 30, 30, 30, 255, 255, 30, 40, 20],
    g: [25, 30, 150, 150, 245, 245, 80, 150, 70],
    b: [60, 170, 170, 170, 235, 235, 30, 40, 40]
  },
  {
    id: 9,
    name: "Deep Ocean Trench",
    j: [0, 1200, 3000, 5500, 7000, 8500, 10000],
    r: [10, 15, 25, 40, 80, 130, 180],
    g: [20, 40, 70, 110, 150, 180, 210],
    b: [60, 90, 140, 180, 210, 230, 245]
  }
];

export function getBiome(biomeIndex = 2) {
  const idx = Math.max(0, Math.min(BIOMES.length - 1, biomeIndex));
  return BIOMES[idx];
}

/**
 * Maps a continuous elevation [0..10000] to an RGB color using piece-wise linear interpolation.
 */
export function evaluateBiomeColor(biome, elevation) {
  const elev = Math.max(0, Math.min(10000, elevation));
  const j = biome.j;
  const r = biome.r;
  const g = biome.g;
  const b = biome.b;

  const len = j.length;
  if (elev <= j[0]) {
    return { r: r[0], g: g[0], b: b[0] };
  }
  if (elev >= j[len - 1]) {
    return { r: r[len - 1], g: g[len - 1], b: b[len - 1] };
  }

  for (let i = 0; i < len - 1; i++) {
    if (elev >= j[i] && elev <= j[i + 1]) {
      const span = j[i + 1] - j[i];
      const factor = span === 0 ? 0 : (elev - j[i]) / span;
      return {
        r: Math.round(r[i] + factor * (r[i + 1] - r[i])),
        g: Math.round(g[i] + factor * (g[i + 1] - g[i])),
        b: Math.round(b[i] + factor * (b[i + 1] - b[i]))
      };
    }
  }

  return { r: 128, g: 128, b: 128 };
}
