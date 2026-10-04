import versionData from '../version.json';
const { version, lastUpdated, isSignificant } = versionData;

import settingsManager from './settings.js';
import { clanFilter, leaderboardFilter } from "./clanFilters.js";
import WindowManager from "./windowManager.js";
import donationsTracker from "./donationsTracker.js";
import winCounter from "./winCounter.js";
import playerList from "./playerList.js";
import gameScriptUtils from "./gameScriptUtils.js";
import hoveringTooltip from "./hoveringTooltip.js";
import { keybindFunctions, keybindHandler, mobileKeybinds } from "./keybinds.js";
import customLobby from './customLobby.js';
import { displayChangelog } from './changelog.js';
import { reportError } from './debugging.js';
import replayHistory from './replayHistory.js';
import replay from './replay.js';
import lobbyReminders from './lobbyReminders.js';
import pingFilter from './pingFilter.js';
import nameFilter from './nameFilter.js';
import followedAccounts from './followedAccounts.js';
import { getVar } from "./gameInterface.js";
import './terrixCosmetics.js';
import './terrixChat.js';
import { spawnOptimizer } from './spawnOptimizer.js';

window.__fx = window.__fx || {};
const __fx = window.__fx;
window.getVar = getVar;
__fx.getVar = getVar;
__fx.version = version + " " + lastUpdated;
__fx.isCustomLobbyVersion = window.location.href.startsWith("https://fxclient.github.io/custom-lobbies")

const savedVersion = localStorage.getItem("fx_version");
if (savedVersion !== version && !__fx.isCustomLobbyVersion) {
  localStorage.setItem("fx_version", version);
  if (savedVersion !== null && isSignificant) displayChangelog();
}

__fx.settingsManager = settingsManager;
__fx.leaderboardFilter = leaderboardFilter;
__fx.utils = gameScriptUtils;
__fx.WindowManager = WindowManager;
__fx.keybindFunctions = keybindFunctions;
__fx.keybindHandler = keybindHandler;
__fx.mobileKeybinds = mobileKeybinds;
__fx.donationsTracker = donationsTracker;
__fx.reportError = reportError;
__fx.playerList = playerList;
__fx.hoveringTooltip = hoveringTooltip;
__fx.clanFilter = clanFilter;
__fx.wins = winCounter;
__fx.customLobby = customLobby;
__fx.replayHistory = replayHistory;
__fx.replay = replay;
__fx.lobbyReminders = lobbyReminders;
__fx.pingFilter = pingFilter;
__fx.nameFilter = nameFilter;
__fx.followedAccounts = followedAccounts;
__fx.chat = window.__fx.chat;
__fx.spawnOptimizer = spawnOptimizer;

// Register Spawn Optimizer Frame Lifecycle Hook
const checkEngineForOptimizer = setInterval(function() {
  if (window.__TERRIX_ENGINE__ && typeof window.__TERRIX_ENGINE__.onRenderFrame === 'function') {
    clearInterval(checkEngineForOptimizer);
    window.__TERRIX_ENGINE__.onRenderFrame(function(context) {
      spawnOptimizer.update(context);
      spawnOptimizer.render(context);
    });
  }
}, 100);

// Reset optimizer state on match transition
window.addEventListener("hashchange", () => spawnOptimizer.reset());

// Auto-Launch Scenarios from TerriX Scenario Studio
async function fetchPendingScenario() {
  if (typeof indexedDB !== "undefined") {
    try {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open("terrix_studio_db", 1);
        req.onupgradeneeded = (e) => {
          const d = e.target.result;
          if (!d.objectStoreNames.contains("scenarios")) d.createObjectStore("scenarios");
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      const data = await new Promise((resolve) => {
        const tx = db.transaction("scenarios", "readwrite");
        const store = tx.objectStore("scenarios");
        const getReq = store.get("launch_scenario");
        getReq.onsuccess = () => {
          store.delete("launch_scenario");
          resolve(getReq.result);
        };
        getReq.onerror = () => resolve(null);
      });

      if (data) return data;
    } catch (err) {
      console.warn('[TerriX] IndexedDB read failed, falling back to storage:', err);
    }
  }

  try {
    const val = localStorage.getItem('terrix_launch_scenario');
    if (val) {
      localStorage.removeItem('terrix_launch_scenario');
      return val;
    }
  } catch (e) {}

  try {
    const val = sessionStorage.getItem('terrix_launch_scenario');
    if (val) {
      sessionStorage.removeItem('terrix_launch_scenario');
      return val;
    }
  } catch (e) {}

  return null;
}

function checkPendingScenarioLaunch() {
  fetchPendingScenario().then(pending => {
    if (!pending) return;

    let attempts = 0;
    const launchInterval = setInterval(() => {
      attempts++;
      if (window.aE && window.u && typeof window.u.v === 'function') {
        clearInterval(launchInterval);
        try {
          console.log('[TerriX] Ingesting custom scenario from TerriX Scenario Studio...');
          const parsed = typeof pending === 'string' ? JSON.parse(pending) : pending;
          
          if (!window.aE.a2G && typeof window.a6h === 'function') {
            const data = window.aE.data = new window.a6h();
            Object.assign(data, parsed);

            // Force custom spawning mode if custom spawns were passed
            if (parsed.spawningData && parsed.spawningType === 2) {
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

            if (parsed.mapType === 2 && parsed.canvas && typeof parsed.canvas === 'string') {
              data.mapType = 2;
              const img = new Image();
              img.onload = function() {
                if (window.bC && window.bC.aLJ && typeof window.bC.aLJ.aLK === 'function') {
                  window.bC.aLJ.aLK(img, 1);
                }
                window.u.y();
                if (window.u.z && window.u.z.uS) window.u.z.uS[0] = 0;
                window.u.v(19);
              };
              img.src = parsed.canvas;
            } else {
              window.u.y();
              if (window.u.z && window.u.z.uS) window.u.z.uS[0] = 0;
              window.u.v(19);
            }
          }
        } catch (err) {
          console.error('[TerriX] Error launching custom scenario:', err);
        }
      } else if (attempts > 50) {
        clearInterval(launchInterval);
      }
    }, 200);
  });
}

if (window.location.search.includes('play_scenario=1')) {
  checkPendingScenarioLaunch();
}

console.log('Successfully loaded FX Client');

