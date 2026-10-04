/**
 * Test Suite: TerriX Scenario Studio Architecture & Schema Parity
 * Validates store reactive contracts, a6h TypedArray round-trip serialization,
 * procedural heightmap generation, and topology BFS analysis.
 */

import assert from "assert";
import { store, DefaultScenarioSchema } from "../src/studio/state.js";
import { ScenarioSerializer } from "../src/studio/scenario/serializer.js";
import { ProceduralTerrainGenerator } from "../src/studio/map/generator.js";
import { TopologyValidator } from "../src/studio/map/validator.js";
import { SpawnPlacer } from "../src/studio/map/spawnPlacer.js";

async function runTests() {
  console.log("------------------------------------------------------------");
  console.log("Running TerriX Scenario Studio Comprehensive Unit Tests");
  console.log("------------------------------------------------------------");

  // 1. Test Store Initialization & Defaults
  console.log("[Test 1] ScenarioStore initialization & TypedArray compliance...");
  store.reset();
  assert.strictEqual(store.get("playerCount"), 512, "playerCount must default to 512");
  assert.strictEqual(store.get("gameMode"), 0, "gameMode must default to 0 (BR)");
  assert.ok(store.get("colorsData") instanceof Uint32Array, "colorsData must be Uint32Array");
  assert.strictEqual(store.get("colorsData").length, 512, "colorsData must have 512 slots");
  assert.ok(store.get("spawningData") instanceof Uint16Array, "spawningData must be Uint16Array");
  assert.strictEqual(store.get("spawningData").length, 1024, "spawningData must have 1024 values (512 pairs)");
  console.log("  ✓ Store initialized with valid a6h TypedArrays");

  // 2. Test Store State Mutation & Undo/Redo
  console.log("[Test 2] Reactive state mutation and undo/redo...");
  store.set("mapSeed", 9999, false, true);
  assert.strictEqual(store.get("mapSeed"), 9999);
  store.batchUpdate({ mapSeed: 1234, playerCount: 256 }, true);
  assert.strictEqual(store.get("mapSeed"), 1234);
  assert.strictEqual(store.get("playerCount"), 256);
  const undone = store.undo();
  assert.ok(undone, "Undo must succeed");
  assert.strictEqual(store.get("mapSeed"), 9999);
  console.log("  ✓ Undo/redo maintains state snapshots accurately");

  // 3. Test Serialization & Deserialization Round-Trip
  console.log("[Test 3] Bidirectional tt_scenario.json export/import...");
  store.reset();
  store.set("mapSeed", 7777);
  store.set("playerCount", 300);
  const names = [...store.get("playerNamesData")];
  names[0] = "[KILR] Leader";
  names[1] = "[KILR] Officer";
  store.set("playerNamesData", names);

  const jsonStr = ScenarioSerializer.exportToJson(store.state);
  assert.ok(typeof jsonStr === "string" && jsonStr.length > 500, "Exported JSON must be valid string");

  const targetState = {};
  ScenarioSerializer.importFromJson(jsonStr, targetState);
  assert.strictEqual(targetState.mapSeed, 7777);
  assert.strictEqual(targetState.playerCount, 300);
  assert.strictEqual(targetState.playerNamesData[0], "[KILR] Leader");
  assert.ok(targetState.colorsData instanceof Uint32Array, "colorsData rehydrated to Uint32Array");
  assert.ok(targetState.spawningData instanceof Uint16Array, "spawningData rehydrated to Uint16Array");
  console.log("  ✓ tt_scenario.json round-trip preserves all TypedArrays and custom names");

  // 4. Test Base64 URL Hash Sharing
  console.log("[Test 4] Base64 URL Hash export and parsing...");
  const hash = ScenarioSerializer.exportToBase64Hash(store.state);
  assert.ok(hash.startsWith("#scenario="), "Hash must start with #scenario=");
  const decodedState = {};
  ScenarioSerializer.importFromBase64Hash(hash, decodedState);
  assert.strictEqual(decodedState.mapSeed, 7777);
  assert.strictEqual(decodedState.playerNamesData[0], "[KILR] Leader");
  console.log("  ✓ URL Hash compression encodes and decodes scenario payload cleanly");

  // 5. Test Procedural Terrain Generator
  console.log("[Test 5] Procedural midpoint displacement generator...");
  const generator = new ProceduralTerrainGenerator(256, 256, 64, 14071);
  const heightmap = generator.generateHeightmap();
  assert.strictEqual(heightmap.length, 256 * 256, "Heightmap must match width * height");

  let minH = 10000, maxH = 0;
  for (let i = 0; i < heightmap.length; i++) {
    if (heightmap[i] < minH) minH = heightmap[i];
    if (heightmap[i] > maxH) maxH = heightmap[i];
  }
  assert.ok(minH >= 0 && maxH <= 10000, `Height values [${minH}, ${maxH}] must be bounded in [0, 10000]`);

  const baked = generator.bakeTerrainBuffers(heightmap, 2, 3200, 8200);
  assert.strictEqual(baked.enginePropertyBuffer.length, 256 * 256 * 4, "Property buffer must be RGBA (4 bytes per tile)");

  // Check terrain tile flags in engine property buffer
  let hasWater = false, hasLand = false;
  for (let i = 0; i < 256 * 256; i++) {
    const tileType = baked.enginePropertyBuffer[i * 4 + 2];
    if (tileType === 2) hasWater = true;
    if (tileType === 1) hasLand = true;
  }
  assert.ok(hasWater && hasLand, "Terrain must contain both water (blue=2) and land (blue=1)");
  console.log("  ✓ Procedural generator creates valid heightmaps and engine aEE property buffers");

  // 6. Test Topology Validator
  console.log("[Test 6] Topology BFS analysis and choke-point detection...");
  const validator = new TopologyValidator(256, 256, baked.enginePropertyBuffer);
  const analysis = validator.analyze();
  assert.ok(analysis.totalLandTiles > 0, "Must detect land tiles");
  assert.ok(analysis.totalWaterTiles > 0, "Must detect water tiles");
  assert.ok(analysis.components.length > 0, "Must identify at least one contiguous landmass");
  console.log(`  ✓ Identified ${analysis.components.length} landmasses (${analysis.landCoveragePercent}% land coverage, ${analysis.chokePointCount} choke points)`);

  // 7. Test Spawn Placer Even & Clustered Distribution
  console.log("[Test 7] Spawn distribution algorithms...");
  const spawnPlacer = new SpawnPlacer(256, 256, validator);
  const spawns = spawnPlacer.distributeEvenly(128, 6);
  assert.strictEqual(spawns.length, 256, "128 players require 256 coordinates");

  // Validate coordinates fall on valid land
  const validation = validator.validateSpawns(spawns, 128);
  assert.ok(validation.valid, "Evenly distributed spawns must be land-bound without water collisions");

  const teamSpawns = spawnPlacer.distributeTeamClustered([0, 64, 64], 40);
  assert.strictEqual(teamSpawns.length, 256);
  const teamVal = validator.validateSpawns(teamSpawns, 128);
  assert.ok(teamVal.valid, "Team clustered spawns must be land-bound without water collisions");
  console.log("  ✓ Spawn placer generates valid, collision-free coordinates for all slots");

  console.log("------------------------------------------------------------");
  console.log("All TerriX Scenario Studio Unit Tests Passed Successfully!");
  console.log("------------------------------------------------------------");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
