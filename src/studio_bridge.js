/**
 * TerriX Studio Bridge - Client Integration Hook
 * Connects the active game client to TerriX Scenario Studio via BroadcastChannel.
 * Provides live hot-push ingestion, active memory state export, and HUD prompts.
 */

import { ScenarioStorage, ScenarioSerializer } from "./studio/scenario/serializer.js";

export class StudioBridge {
  constructor() {
    this.bus = null;
    this.pendingPushPayload = null;
    this.hudElement = null;
    this.initBus();
    this.initKeyListeners();
    this.injectMainMenuButtons();
    this.patchPauseMenu();
  }

  initBus() {
    if (typeof BroadcastChannel === "undefined") {
      console.warn("[StudioBridge] BroadcastChannel is not supported in this environment");
      return;
    }

    this.bus = new BroadcastChannel("terrix_studio_bus");

    this.bus.onmessage = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      switch (msg.type) {
        case "STUDIO_HELLO":
          this.sendClientHello();
          break;

        case "PUSH_SCENARIO_HOT":
          this.handlePushScenarioHot(msg.payload, msg.autoStart);
          break;

        case "PULL_CURRENT_GAME_STATE":
          this.handlePullGameState();
          break;

        default:
          break;
      }
    };

    // Announce client presence
    this.sendClientHello();

    // Announce when tab becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.sendClientHello();
      }
    });

    console.log("[StudioBridge] Continuous BroadcastChannel established on 'terrix_studio_bus'");
  }

  sendClientHello() {
    if (!this.bus) return;
    const engineState = window.aE && window.aE.a2G ? window.aE.a2G : 0;
    this.bus.postMessage({
      type: "CLIENT_HELLO",
      clientVersion: "1.0.0",
      engineState: engineState
    });
  }

  handlePushScenarioHot(payload, autoStart = true) {
    if (!payload) return;
    console.log("[StudioBridge] Received PUSH_SCENARIO_HOT from Studio:", payload);

    const isMatchRunning = window.aE && window.aE.a2G && (window.aE.a2G === 1 || window.aE.a2G === 2);

    if (!isMatchRunning && autoStart) {
      this.loadScenarioIntoEngine(payload);
    } else {
      // In-game match is running: queue payload and show HUD confirmation banner
      this.pendingPushPayload = payload;
      this.showHudPrompt("New scenario push received from Studio. Press [Y] to load.");
    }
  }

  showHudPrompt(text) {
    if (this.hudElement) {
      this.hudElement.remove();
      this.hudElement = null;
    }

    const hud = document.createElement("div");
    hud.id = "terrixStudioHudPrompt";
    hud.style.cssText = `
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(14, 22, 38, 0.94);
      border: 1px solid #10b981;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(16, 185, 129, 0.4);
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 14px;
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
    `;

    hud.innerHTML = `
      <span style="color: #10b981;">⚡</span>
      <span>${text}</span>
      <button id="btnHudAcceptScenario" style="
        background: #10b981;
        border: none;
        color: #080d16;
        padding: 5px 12px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
      ">Load [Y]</button>
      <button id="btnHudDismissScenario" style="
        background: #334155;
        border: none;
        color: #ffffff;
        padding: 5px 8px;
        border-radius: 4px;
        cursor: pointer;
      ">✕</button>
    `;

    document.body.appendChild(hud);
    this.hudElement = hud;

    hud.querySelector("#btnHudAcceptScenario")?.addEventListener("click", () => {
      this.acceptPendingPush();
    });

    hud.querySelector("#btnHudDismissScenario")?.addEventListener("click", () => {
      this.dismissHudPrompt();
    });

    // Auto-dismiss after 15 seconds if not acted upon
    setTimeout(() => {
      if (this.hudElement === hud) {
        this.dismissHudPrompt();
      }
    }, 15000);
  }

  dismissHudPrompt() {
    if (this.hudElement) {
      this.hudElement.remove();
      this.hudElement = null;
    }
    this.pendingPushPayload = null;
  }

  acceptPendingPush() {
    if (!this.pendingPushPayload) return;
    const payload = this.pendingPushPayload;
    this.dismissHudPrompt();
    this.loadScenarioIntoEngine(payload);
  }

  initKeyListeners() {
    window.addEventListener("keydown", (e) => {
      // Ignore if typing inside input, textarea, or chat box
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if ((e.key === "y" || e.key === "Y") && this.pendingPushPayload) {
        e.preventDefault();
        this.acceptPendingPush();
      }
    });
  }

  loadScenarioIntoEngine(parsed) {
    if (!parsed) return;
    console.log("[StudioBridge] Ingesting scenario into active TerriX runtime...");

    try {
      if (!window.aE || !window.u || typeof window.u.v !== "function") {
        console.warn("[StudioBridge] Game engine is not yet ready to load scenario");
        return;
      }

      const ctor = window.a6h || (window.aE.data ? window.aE.data.constructor : null);
      const data = ctor ? new ctor() : {};
      Object.assign(data, parsed);

      // Force custom spawning mode if custom coordinates are provided
      if (parsed.spawningData && (parsed.spawningType === 2 || parsed.spawningType === 0)) {
        data.spawningType = 2;
      }

      if (parsed.teamPlayerCount) data.teamPlayerCount = new Uint16Array(parsed.teamPlayerCount);
      if (parsed.colorsData) data.colorsData = new Uint32Array(parsed.colorsData);
      if (parsed.botDifficultyTeam) data.botDifficultyTeam = new Uint8Array(parsed.botDifficultyTeam);
      if (parsed.botDifficultyData) data.botDifficultyData = new Uint8Array(parsed.botDifficultyData);
      if (parsed.spawningData) data.spawningData = new Uint16Array(parsed.spawningData);
      if (parsed.aIncomeData) data.aIncomeData = new Uint8Array(parsed.aIncomeData);
      if (parsed.tIncomeData) data.tIncomeData = new Uint8Array(parsed.tIncomeData);
      if (parsed.iIncomeData) data.iIncomeData = new Uint8Array(parsed.iIncomeData);
      if (parsed.sResourcesData) data.sResourcesData = new Uint16Array(parsed.sResourcesData);
      if (parsed.a75) data.a75 = new Uint32Array(parsed.a75);

      // Store custom diplomacy and pre-claimed territory on engine global hooks
      window.__scenarioDiplomacy = parsed.diplomacy || null;
      window.__scenarioPreClaimed = parsed.preClaimedTerritory || null;
      window.__scenarioBotArchetypes = parsed.botArchetypes || null;

      window.aE.data = data;

      if (parsed.mapType === 2 && parsed.canvas && typeof parsed.canvas === "string") {
        data.mapType = 2;
        const img = new Image();
        img.onload = () => {
          if (window.bC && window.bC.aLJ && typeof window.bC.aLJ.aLK === "function") {
            window.bC.aLJ.aLK(img, 1);
          }
          if (window.bV && typeof window.bV.a6K === "function") {
            window.bV.a6K(img);
          }
          window.u.y();
          if (window.u.z && window.u.z.uS) window.u.z.uS[0] = 0;
          window.u.v(19);
          this.applyPostLaunchState(parsed);
        };
        img.src = parsed.canvas;
      } else {
        window.u.y();
        if (window.u.z && window.u.z.uS) window.u.z.uS[0] = 0;
        window.u.v(19);
        this.applyPostLaunchState(parsed);
      }

      this.sendClientHello();
    } catch (err) {
      console.error("[StudioBridge] Failed to hot-load scenario:", err);
    }
  }

  applyPostLaunchState(parsed) {
    // If pre-claimed territory is specified, inject into aEE and territory counters
    if (parsed.preClaimedTerritory && Array.isArray(parsed.preClaimedTerritory)) {
      setTimeout(() => {
        try {
          if (window.aEE && window.bV && window.ah) {
            const arr = parsed.preClaimedTerritory;
            const w = window.bV.fk;
            const h = window.bV.fl;
            const total = Math.min(w * h, arr.length);
            for (let i = 0; i < total; i++) {
              const pid = arr[i];
              if (pid > 0 && pid < 512) {
                const idx = i * 4;
                window.aEE[idx + 1] = pid; // Territory ID / Owner
                if (window.ah.hN) {
                  window.ah.hN[pid] = (window.ah.hN[pid] || 0) + 1;
                }
              }
            }
          }
        } catch (e) {
          console.warn("[StudioBridge] Error applying pre-claimed territory:", e);
        }
      }, 100);
    }
  }

  handlePullGameState() {
    if (!this.bus) return;
    console.log("[StudioBridge] Exporting active board state snapshot to Studio...");

    try {
      const state = this.serializeCurrentBoardState();
      this.bus.postMessage({
        type: "GAME_STATE_SNAPSHOT",
        payload: state
      });
    } catch (err) {
      console.error("[StudioBridge] Error exporting board state:", err);
    }
  }

  serializeCurrentBoardState() {
    const w = (window.bV && window.bV.fk) || 1024;
    const h = (window.bV && window.bV.fl) || 1024;

    let canvasDataUrl = "";
    if (window.bV && window.bV.yn && typeof window.bV.yn.toDataURL === "function") {
      canvasDataUrl = window.bV.yn.toDataURL("image/png");
    }

    const state = {
      mapType: 2,
      mapName: "Exported Match Snapshot",
      width: w,
      height: h,
      canvas: canvasDataUrl,
      playerCount: (window.aE && window.aE.yR) || 512,
      humanCount: 1,
      selectedPlayer: 0,
      gameMode: 0,
      playerMode: 0,
      battleRoyaleMode: 0,
      passableWater: 1,
      passableMountains: 1,
      spawningType: 2,
      colorsData: Array.from((window.aE && window.aE.data && window.aE.data.colorsData) || new Uint32Array(512)),
      playerNamesData: Array.from((window.ah && window.ah.a2w) || new Array(512).fill("Bot")),
      spawningData: Array.from((window.aE && window.aE.data && window.aE.data.spawningData) || new Uint16Array(1024)),
      diplomacy: window.__scenarioDiplomacy || { naps: [], alliances: [], truces: [] }
    };

    // Extract pre-claimed territory from aEE if present
    if (window.aEE) {
      const totalTiles = w * h;
      const claimed = new Array(totalTiles);
      for (let i = 0; i < totalTiles; i++) {
        claimed[i] = window.aEE[i * 4 + 1] || 0;
      }
      state.preClaimedTerritory = claimed;
    }

    return state;
  }

  injectMainMenuButtons() {
    // Periodically inspect DOM for menu appearance and inject "Open Scenario Studio" and "Scenario Library"
    const interval = setInterval(() => {
      const singleplayerBtn = document.querySelector("#btnSingleplayer, [data-menu='singleplayer']");
      if (document.body && !document.getElementById("btnTerrixScenarioStudio")) {
        this.createStudioLauncherFab();
      }
      if (singleplayerBtn) {
        clearInterval(interval);
      }
    }, 1000);
  }

  createStudioLauncherFab() {
    if (document.getElementById("btnTerrixScenarioStudio")) return;

    const fab = document.createElement("div");
    fab.id = "btnTerrixScenarioStudio";
    fab.title = "Open TerriX Scenario Studio";
    fab.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0e1626;
      border: 1px solid #10b981;
      color: #10b981;
      padding: 9px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      transition: all 0.2s ease;
      backdrop-filter: blur(6px);
    `;
    fab.innerHTML = `<span>🎨</span><span>Scenario Studio</span>`;

    fab.addEventListener("mouseenter", () => {
      fab.style.background = "#131d31";
      fab.style.borderColor = "#34d399";
      fab.style.transform = "translateY(-2px)";
    });
    fab.addEventListener("mouseleave", () => {
      fab.style.background = "#0e1626";
      fab.style.borderColor = "#10b981";
      fab.style.transform = "translateY(0)";
    });

    fab.addEventListener("click", () => {
      window.open("studio.html", "_blank");
    });

    document.body.appendChild(fab);
  }

  patchPauseMenu() {
    // Listen for Escape key to inject "Export State to Studio" into the in-game escape dialog
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setTimeout(() => {
          this.injectExportButtonIntoPauseMenu();
        }, 120);
      }
    });
  }

  injectExportButtonIntoPauseMenu() {
    if (document.getElementById("btnExportToStudio")) return;

    // Search for modal windows or pause containers
    const dialogs = document.querySelectorAll("div, dialog");
    for (const d of dialogs) {
      if (
        d.textContent &&
        (d.textContent.includes("Surrender") ||
          d.textContent.includes("Leave") ||
          d.textContent.includes("Resume") ||
          d.textContent.includes("Options")) &&
        d.children.length > 0 &&
        d.offsetHeight > 100
      ) {
        const btn = document.createElement("button");
        btn.id = "btnExportToStudio";
        btn.textContent = "🗺️ Export State to Studio";
        btn.style.cssText = `
          display: block;
          width: 80%;
          margin: 8px auto;
          padding: 8px 14px;
          background: #0070e0;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s ease;
        `;
        btn.addEventListener("mouseenter", () => (btn.style.background = "#005bb5"));
        btn.addEventListener("mouseleave", () => (btn.style.background = "#0070e0"));

        btn.addEventListener("click", () => {
          const snapshot = this.serializeCurrentBoardState();
          if (this.bus) {
            this.bus.postMessage({
              type: "GAME_STATE_SNAPSHOT",
              payload: snapshot
            });
          }
          window.open("studio.html#snapshot=active", "_blank");
        });

        d.appendChild(btn);
        break;
      }
    }
  }

  dispatchTelemetry(tick, livingPlayers, leaderboard) {
    if (!this.bus) return;
    this.bus.postMessage({
      type: "MATCH_TICK_TELEMETRY",
      tick,
      livingPlayers,
      leaderboard
    });
  }
}

export const studioBridge = new StudioBridge();
