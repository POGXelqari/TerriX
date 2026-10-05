/**
 * TerriX Scenario Studio - Client Controller
 * Manages the studio-side BroadcastChannel link to the TerriX Game Client tab.
 * Handles hot-push scenario deployment, state pull ingestion, and connection telemetry.
 */

import { store } from "./state.js";
import { ScenarioSerializer, ScenarioStorage } from "./scenario/serializer.js";
import { showToast } from "./ui/components.js";

export class ClientController {
  constructor(canvasEditor) {
    this.canvasEditor = canvasEditor;
    this.bus = null;
    this.isConnected = false;
    this.lastSeen = 0;
    this.clientInfo = null;
    this.statusEl = null;
    this.launchBtn = null;
    this.heartbeatTimer = null;

    this.initBus();
    this.initStatusIndicator();
    this.startHeartbeat();
  }

  initBus() {
    if (typeof BroadcastChannel === "undefined") {
      console.warn("[ClientController] BroadcastChannel not supported");
      return;
    }

    this.bus = new BroadcastChannel("terrix_studio_bus");

    this.bus.onmessage = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      switch (msg.type) {
        case "CLIENT_HELLO":
          this.handleClientHello(msg);
          break;

        case "GAME_STATE_SNAPSHOT":
          this.handleGameStateSnapshot(msg.payload);
          break;

        case "MATCH_TICK_TELEMETRY":
          this.handleMatchTelemetry(msg);
          break;

        default:
          break;
      }
    };

    // Broadcast studio presence
    this.sendStudioHello();
  }

  sendStudioHello() {
    if (!this.bus) return;
    this.bus.postMessage({
      type: "STUDIO_HELLO",
      scenarioId: store.get("mapName") || "active_scenario"
    });
  }

  handleClientHello(msg) {
    this.isConnected = true;
    this.lastSeen = Date.now();
    this.clientInfo = {
      version: msg.clientVersion || "1.0.0",
      engineState: msg.engineState || 0
    };
    this.updateStatusUi();
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendStudioHello();
      if (this.isConnected && Date.now() - this.lastSeen > 6000) {
        this.isConnected = false;
        this.clientInfo = null;
        this.updateStatusUi();
      }
    }, 2500);
  }

  initStatusIndicator() {
    // Look for status container in studio header
    this.statusEl = document.getElementById("clientConnectionStatus");
    this.launchBtn = document.getElementById("btnLaunchGame");
    this.updateStatusUi();
  }

  updateStatusUi() {
    if (this.statusEl) {
      if (this.isConnected) {
        const stateDesc =
          this.clientInfo?.engineState === 1 || this.clientInfo?.engineState === 2
            ? "In Match"
            : "Menu Ready";
        this.statusEl.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
          <span style="color:#10b981; font-weight:600;">Connected to Game (Tab #1)</span>
          <span style="color:#94a3b8; font-size:11px;">[${stateDesc}]</span>
        `;
      } else {
        this.statusEl.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#64748b;"></span>
          <span style="color:#94a3b8; font-weight:500;">Client Offline</span>
        `;
      }
    }

    if (this.launchBtn) {
      if (this.isConnected) {
        this.launchBtn.innerHTML = `⚡ Push to Client`;
        this.launchBtn.title = "Push active scenario directly to connected TerriX game tab";
        this.launchBtn.style.background = "#10b981";
        this.launchBtn.style.color = "#080d16";
      } else {
        this.launchBtn.innerHTML = `▶ Launch in Game`;
        this.launchBtn.title = "Open new TerriX tab and launch scenario";
        this.launchBtn.style.background = "#0070e0";
        this.launchBtn.style.color = "#ffffff";
      }
    }
  }

  async launchOrPushScenario(autoStart = true) {
    // Sync state
    if (this.canvasEditor && this.canvasEditor.canvas) {
      store.batchUpdate(
        {
          canvas: this.canvasEditor.canvas,
          mapType: 2,
          width: this.canvasEditor.width,
          height: this.canvasEditor.height
        },
        false
      );
    }

    const payload = JSON.parse(ScenarioSerializer.exportToJson(store.state));

    // Also persist in ScenarioStorage library with thumbnail
    try {
      const preview = ScenarioSerializer.generateThumbnail(this.canvasEditor?.canvas);
      await ScenarioStorage.saveScenario(payload, {
        name: store.get("mapName") || "Custom Scenario",
        preview
      });
      await ScenarioStorage.setLaunchScenario(JSON.stringify(payload));
    } catch (e) {
      console.warn("[ClientController] Save to storage warning:", e);
    }

    if (this.isConnected && this.bus) {
      console.log("[ClientController] Pushing scenario over terrix_studio_bus:", payload);
      this.bus.postMessage({
        type: "PUSH_SCENARIO_HOT",
        payload,
        autoStart
      });
      showToast("Pushed scenario directly to connected TerriX tab!", "success");
    } else {
      console.log("[ClientController] No client connected, opening cold index.html tab...");
      showToast("Launching TerriX Game Client...", "info");
      window.open(`index.html?play_scenario=1&t=${Date.now()}`, "_blank");
    }
  }

  pullCurrentGameState() {
    if (!this.isConnected || !this.bus) {
      showToast("Game Client tab is not connected.", "error");
      return;
    }

    showToast("Requesting live board snapshot from Game...", "info");
    this.bus.postMessage({
      type: "PULL_CURRENT_GAME_STATE"
    });
  }

  handleGameStateSnapshot(payload) {
    if (!payload) return;
    console.log("[ClientController] Ingesting GAME_STATE_SNAPSHOT:", payload);

    try {
      ScenarioSerializer.importFromJson(payload, store.state);
      store.notify(Object.keys(store.state));

      if (payload.canvas && this.canvasEditor) {
        this.canvasEditor.loadCanvasFromSource(payload.canvas);
      }

      showToast("Successfully imported live match state into Studio!", "success");
    } catch (err) {
      console.error("[ClientController] Failed to parse game state snapshot:", err);
      showToast("Failed to parse game state snapshot", "error");
    }
  }

  handleMatchTelemetry(msg) {
    // Can be consumed by economy panel or telemetry HUD
    window.__lastMatchTelemetry = msg;
  }
}
