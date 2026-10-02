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
import './terrixCosmetics.js';
import './terrixChat.js';
import { spawnOptimizer } from './spawnOptimizer.js';

window.__fx = window.__fx || {};
const __fx = window.__fx;
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

// User click override listener: disable auto-pick if player manually clicks
function bindCanvasOverrideListener() {
  const canvas = document.getElementById("canvasA");
  if (canvas) {
    canvas.addEventListener("pointerdown", function() {
      spawnOptimizer.registerUserOverride();
    }, { passive: true });
  } else {
    setTimeout(bindCanvasOverrideListener, 300);
  }
}
bindCanvasOverrideListener();

// Reset optimizer state on match transition
window.addEventListener("hashchange", () => spawnOptimizer.reset());

console.log('Successfully loaded FX Client');

