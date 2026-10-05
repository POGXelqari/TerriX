/**
 * TerriX Official Map Registry
 * Contains metadata, dimensions, and baseline definitions for all 25 official Territorial.io maps.
 */

export const OFFICIAL_MAPS = [
  { index: 0, name: "White Arena", width: 232, height: 232, isRealistic: false, defaultBiome: 0 },
  { index: 1, name: "Black Arena", width: 800, height: 800, isRealistic: false, defaultBiome: 1 },
  { index: 2, name: "Island", width: 512, height: 512, isRealistic: false, defaultBiome: 2 },
  { index: 3, name: "Mountains 1", width: 960, height: 960, isRealistic: false, defaultBiome: 2 },
  { index: 4, name: "Desert", width: 900, height: 900, isRealistic: false, defaultBiome: 3 },
  { index: 5, name: "Swamp", width: 1000, height: 1000, isRealistic: false, defaultBiome: 4 },
  { index: 6, name: "White Plains", width: 1000, height: 1000, isRealistic: false, defaultBiome: 0 },
  { index: 7, name: "Cliffs", width: 1024, height: 1024, isRealistic: false, defaultBiome: 2 },
  { index: 8, name: "Pond", width: 820, height: 820, isRealistic: false, defaultBiome: 2 },
  { index: 9, name: "Halo", width: 1024, height: 1024, isRealistic: false, defaultBiome: 2 },
  { index: 10, name: "Europe", width: 932, height: 960, isRealistic: true, defaultBiome: 2 },
  { index: 11, name: "World 1", width: 1756, height: 1000, isRealistic: true, defaultBiome: 2 },
  { index: 12, name: "Caucasia", width: 1300, height: 748, isRealistic: true, defaultBiome: 2 },
  { index: 13, name: "Africa", width: 832, height: 932, isRealistic: true, defaultBiome: 3 },
  { index: 14, name: "Middle East", width: 1000, height: 708, isRealistic: true, defaultBiome: 3 },
  { index: 15, name: "Scandinavia", width: 884, height: 960, isRealistic: true, defaultBiome: 5 },
  { index: 16, name: "North America", width: 956, height: 872, isRealistic: true, defaultBiome: 2 },
  { index: 17, name: "South America", width: 692, height: 924, isRealistic: true, defaultBiome: 4 },
  { index: 18, name: "Asia", width: 940, height: 832, isRealistic: true, defaultBiome: 2 },
  { index: 19, name: "Australia", width: 1000, height: 892, isRealistic: true, defaultBiome: 3 },
  { index: 20, name: "Island Kingdom", width: 1024, height: 1024, isRealistic: false, defaultBiome: 2 },
  { index: 21, name: "Mountains 2", width: 940, height: 940, isRealistic: false, defaultBiome: 2 },
  { index: 22, name: "World 2", width: 1540, height: 1080, isRealistic: true, defaultBiome: 2 },
  { index: 23, name: "British Isles", width: 1052, height: 1392, isRealistic: true, defaultBiome: 2 },
  { index: 24, name: "Mare Nostrum", width: 1900, height: 764, isRealistic: true, defaultBiome: 2 }
];

export function getOfficialMapByIndex(index) {
  return OFFICIAL_MAPS.find(m => m.index === index) || OFFICIAL_MAPS[10];
}

/**
 * Procedural baseline landmass generator for map templates when offline.
 */
export function generateTemplateTerrain(width, height, type = "continent", seed = 14071) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Align property buffer (4 bytes per tile)
  const propBuffer = new Uint8Array(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.42;

  // Simple multi-octave synthesis for template baseline
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const n1 = Math.sin(x * 0.015 + seed * 0.1) * Math.cos(y * 0.015);
      const n2 = Math.sin(x * 0.04) * Math.sin(y * 0.04) * 0.5;
      const elevation = (1.0 - dist) + (n1 + n2) * 0.35;

      if (elevation > 0.18) {
        // Mountain peaks
        if (elevation > 0.72) {
          data[idx] = 110;
          data[idx + 1] = 110;
          data[idx + 2] = 110;
          data[idx + 3] = 255;
          propBuffer[idx + 2] = 5; // Mountain
        } else {
          // Land
          data[idx] = 52;
          data[idx + 1] = 138;
          data[idx + 2] = 64;
          data[idx + 3] = 255;
          propBuffer[idx + 2] = 1; // Land
        }
      } else {
        // Water
        data[idx] = 18;
        data[idx + 1] = 52;
        data[idx + 2] = 110;
        data[idx + 3] = 255;
        propBuffer[idx + 2] = 2; // Water
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return {
    canvas,
    visualImgData: imgData,
    enginePropertyBuffer: propBuffer,
    width,
    height
  };
}
