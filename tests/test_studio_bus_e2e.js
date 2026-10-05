/**
 * Test Suite: TerriX Scenario Studio & Client Bidirectional Cross-Tab Interop E2E
 * Launches both game client and studio tabs simultaneously in Playwright,
 * verifies BroadcastChannel handshakes, hot scenario pushes, and state pull snapshots.
 */

import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import assert from "assert";

const PORT = 8095;
const server = http.createServer((req, res) => {
  let filePath = path.join(
    process.cwd(),
    "build",
    req.url === "/" ? "index.html" : req.url.split("?")[0]
  );
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end();
  }
  const ext = path.extname(filePath);
  const mimeMap = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".json": "application/json"
  };
  res.writeHead(200, { "Content-Type": mimeMap[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

async function runCrossTabBusTest() {
  await new Promise((resolve) => server.listen(0, resolve));
  const PORT = server.address().port;
  console.log(`[CrossTabTest] Serving build from http://localhost:${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"]
  });

  const context = await browser.newContext();
  const gamePage = await context.newPage();
  const studioPage = await context.newPage();

  const gameErrors = [];
  const studioErrors = [];

  gamePage.on("pageerror", (err) => gameErrors.push(err.message));
  studioPage.on("pageerror", (err) => studioErrors.push(err.message));

  try {
    // 1. Boot Game Client Tab
    console.log("[CrossTabTest] Booting TerriX Game Client Tab (index.html)...");
    await gamePage.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await gamePage.waitForFunction(() => window.__fx && window.__fx.studioBridge, { timeout: 8000 });
    console.log("  ✓ Game tab booted with active StudioBridge");

    // 2. Boot Studio Tab in same origin context
    console.log("[CrossTabTest] Booting TerriX Scenario Studio Tab (studio.html)...");
    await studioPage.goto(`http://localhost:${PORT}/studio.html`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await studioPage.waitForFunction(() => window.__studio && window.__studio.clientController, { timeout: 8000 });
    console.log("  ✓ Studio tab booted with active ClientController");

    // 3. Verify BroadcastChannel Handshake
    console.log("[CrossTabTest] Waiting for BroadcastChannel handshake between tabs...");
    await studioPage.waitForFunction(
      () => window.__studio.clientController.isConnected === true,
      { timeout: 8000 }
    );

    const connectionInfo = await studioPage.evaluate(() => ({
      connected: window.__studio.clientController.isConnected,
      clientInfo: window.__studio.clientController.clientInfo
    }));

    assert.strictEqual(connectionInfo.connected, true, "Studio must detect connected game tab");
    assert.strictEqual(connectionInfo.clientInfo.version, "1.0.0");
    console.log(`  ✓ Studio successfully connected to Game Client: Version ${connectionInfo.clientInfo.version}`);

    // 4. Test Scenario Hot Push from Studio to Game Client
    console.log("[CrossTabTest] Testing PUSH_SCENARIO_HOT from Studio...");
    await studioPage.evaluate(() => {
      window.__studio.store.batchUpdate({
        mapName: "Cross-Tab Test Battle",
        playerCount: 128,
        sResourcesValue: 999
      });
      window.__studio.clientController.launchOrPushScenario(true);
    });

    // Verify game tab received the payload and updated its state
    await gamePage.waitForFunction(
      () => window.aE && window.aE.data && window.aE.data.mapName === "Cross-Tab Test Battle",
      { timeout: 8000 }
    );

    const ingestedData = await gamePage.evaluate(() => ({
      mapName: window.aE.data.mapName,
      playerCount: window.aE.data.playerCount,
      sResourcesValue: window.aE.data.sResourcesValue
    }));

    assert.strictEqual(ingestedData.mapName, "Cross-Tab Test Battle");
    assert.strictEqual(ingestedData.playerCount, 128);
    assert.strictEqual(ingestedData.sResourcesValue, 999);
    console.log("  ✓ Game Client successfully ingested hot scenario push via terrix_studio_bus");

    // 5. Test Pull Game State Snapshot
    console.log("[CrossTabTest] Testing PULL_CURRENT_GAME_STATE from Studio...");
    await studioPage.evaluate(() => {
      window.__studio.clientController.pullCurrentGameState();
    });

    await studioPage.waitForFunction(
      () => window.__studio.store.get("mapName") === "Exported Match Snapshot",
      { timeout: 8000 }
    );

    const snapshotState = await studioPage.evaluate(() => ({
      name: window.__studio.store.get("mapName"),
      playerCount: window.__studio.store.get("playerCount"),
      mapType: window.__studio.store.get("mapType")
    }));

    assert.strictEqual(snapshotState.name, "Exported Match Snapshot");
    assert.strictEqual(snapshotState.mapType, 2);
    console.log("  ✓ Studio successfully pulled live game state snapshot from active Game Client tab");

    // Filter non-fatal sandbox warnings
    const criticalErrors = [...gameErrors, ...studioErrors].filter(
      (err) =>
        !err.includes("WebGL") &&
        !err.includes("audio") &&
        !err.includes("Turnstile") &&
        !err.includes("favicon.ico")
    );

    if (criticalErrors.length > 0) {
      throw new Error(`Uncaught runtime errors:\n${criticalErrors.join("\n")}`);
    }

    console.log("------------------------------------------------------------");
    console.log("All Cross-Tab Interop & BroadcastChannel Tests Passed!");
    console.log("------------------------------------------------------------");
    process.exit(0);
  } finally {
    await browser.close();
    server.close();
  }
}

runCrossTabBusTest().catch((err) => {
  console.error("Cross-tab test failed:", err);
  process.exit(1);
});
