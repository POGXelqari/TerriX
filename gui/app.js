// =========================================================
// TerriX Executor - Frontend Application Controller
// =========================================================

let activeMap = "Europe";
let sfxEnabled = true;
let audioPlayer = null;
let currentKeyValid = false;
let previousKeyValid = false;

// Audio Initialization
try {
  audioPlayer = new Audio("../assets/click.mp3");
} catch (e) {}

function playClickSFX() {
  if (sfxEnabled && audioPlayer) {
    try {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch(() => {});
    } catch (e) {}
  }
}

function toggleSFX() {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById("sfxToggle");
  if (btn) btn.textContent = sfxEnabled ? "🔊" : "🔇";
}

// THEME SWITCHER
function setTheme(themeName) {
  playClickSFX();
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("terrix_theme", themeName);
  
  const terrixBtn = document.getElementById("themeTerrixBtn");
  const gameBtn = document.getElementById("themeGameBtn");
  if (terrixBtn) terrixBtn.classList.toggle("active", themeName === "terrix");
  if (gameBtn) gameBtn.classList.toggle("active", themeName === "territorial");
}

// RESTORE SAVED THEME
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("terrix_theme") || "terrix";
  setTheme(savedTheme);
  
  document.querySelectorAll("button, .map-card").forEach(el => {
    el.addEventListener("click", () => playClickSFX());
  });

  window.addEventListener("pywebviewready", onPyWebViewReady);
  
  setTimeout(() => {
    if (!window.pywebview) {
      simulateDevEnvironment();
    }
  }, 1000);
});

// TOAST NOTIFICATIONS
function showToast(message, duration = 3500) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// TABS
function switchTab(tabId) {
  playClickSFX();
  document.querySelectorAll(".nav-tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  
  const activeBtn = Array.from(document.querySelectorAll(".nav-tab")).find(b => b.getAttribute("onclick") && b.getAttribute("onclick").includes(tabId));
  if (activeBtn) activeBtn.classList.add("active");
  
  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.add("active");
}

// MAP SELECTION
function selectMap(mapName, el) {
  playClickSFX();
  activeMap = mapName;
  document.querySelectorAll(".map-card").forEach(card => card.classList.remove("active"));
  if (el) el.classList.add("active");
  appendLog(`[Map] Target map set to: ${mapName}`);
}

// SLIDER
function updateBotCount(val) {
  const el = document.getElementById("botCountVal");
  if (el) el.textContent = `${val} Bots`;
}

// MODALS
function openKeyModal() {
  playClickSFX();
  const el = document.getElementById("keyModal");
  if (el) el.style.display = "flex";
}

function closeKeyModal() {
  playClickSFX();
  const el = document.getElementById("keyModal");
  if (el) el.style.display = "none";
}

function openProfileModal() {
  playClickSFX();
  const el = document.getElementById("profileModal");
  if (el) el.style.display = "flex";
}

function closeProfileModal() {
  playClickSFX();
  const el = document.getElementById("profileModal");
  if (el) el.style.display = "none";
}

// BRIDGE INITIALIZATION
function onPyWebViewReady() {
  appendLog("[System] Native in-process Python IPC bridge initialized.");
  refreshTelemetry();
  setInterval(refreshTelemetry, 1000);
}

// TELEMETRY POLLING
async function refreshTelemetry() {
  if (!window.pywebview || !window.pywebview.api) return;

  try {
    const data = await window.pywebview.api.get_telemetry();
    
    // Key status watcher
    const keyStatus = data.key_status || {};
    previousKeyValid = currentKeyValid;
    currentKeyValid = !!keyStatus.valid;
    
    const pill = document.getElementById("keyStatusPill");
    const keyText = document.getElementById("keyStatusText");
    
    if (currentKeyValid) {
      const h = Math.floor(keyStatus.remaining_seconds / 3600);
      const m = Math.floor((keyStatus.remaining_seconds % 3600) / 60);
      if (keyText) keyText.textContent = `Key Active (${h}h ${m}m)`;
      if (pill) {
        pill.style.borderColor = "var(--color-success)";
        pill.style.color = "var(--color-success)";
      }
      // Auto-dismiss key modal if it just became active
      if (!previousKeyValid && previousKeyValid !== undefined) {
        const modal = document.getElementById("keyModal");
        if (modal && modal.style.display === "flex") {
          closeKeyModal();
        }
        showToast("✓ 24-Hour Key Active! Full software features unlocked.");
        appendLog("[Auth] 24-Hour lease validated. Full features enabled.");
      }
    } else {
      if (keyText) keyText.textContent = "Key Expired";
      if (pill) {
        pill.style.borderColor = "var(--color-danger)";
        pill.style.color = "var(--color-danger)";
      }
    }

    // Profile
    const profile = data.profile || {};
    const profEl = document.getElementById("profileText");
    if (profEl) profEl.textContent = `${profile.clan_tag || ""} ${profile.username || "Player"}`.trim();
    const userInp = document.getElementById("modalUsername");
    const tagInp = document.getElementById("modalClanTag");
    if (userInp && !userInp.value) userInp.value = profile.username || "";
    if (tagInp && !tagInp.value) tagInp.value = profile.clan_tag || "";

    // Swarm Counters
    const activeBotsEl = document.getElementById("activeBotsCount");
    const inLobbyEl = document.getElementById("inLobbyCount");
    const readyEl = document.getElementById("readyCount");
    if (activeBotsEl) activeBotsEl.textContent = data.active_bots || 0;
    if (inLobbyEl) inLobbyEl.textContent = data.in_lobby || 0;
    if (readyEl) readyEl.textContent = data.ready_count || 0;

    // Swarm Button States
    const launchBtn = document.getElementById("btnLaunchSwarm");
    const readyBtn = document.getElementById("btnForceReady");
    const stopBtn = document.getElementById("btnStopSwarm");
    if (launchBtn) {
      launchBtn.disabled = !!data.is_swarm_running;
      launchBtn.textContent = data.is_swarm_running ? "⚡ Swarm Active..." : "🚀 Launch Swarm";
    }
    if (readyBtn) readyBtn.disabled = !data.is_swarm_running;
    if (stopBtn) stopBtn.disabled = !data.is_swarm_running;
    
    // Status Indicators
    const browserLabel = (data.browsers && data.browsers.length > 0) ? data.browsers[0].name.replace("Google ", "") : (data.chrome_found ? "Available" : "Not Found");
    const valChrome = document.getElementById("valChrome");
    const dotChrome = document.getElementById("dotChrome");
    if (valChrome) valChrome.textContent = browserLabel;
    if (dotChrome) dotChrome.classList.toggle("online", !!data.chrome_found);

    const valToken = document.getElementById("valTokenPool");
    const gaugeToken = document.getElementById("tokenGaugeCount");
    const dotToken = document.getElementById("dotToken");
    if (valToken) valToken.textContent = `${data.token_count || 0} Cached`;
    if (gaugeToken) gaugeToken.textContent = data.token_count || 0;
    if (dotToken) dotToken.classList.toggle("online", (data.token_count || 0) > 0);

    const valProxy = document.getElementById("valProxyCount");
    const dotProxy = document.getElementById("dotProxy");
    if (valProxy) valProxy.textContent = `${data.proxy_count || 0} Live`;
    if (dotProxy) dotProxy.classList.toggle("online", (data.proxy_count || 0) > 0);

    const vBadge = document.getElementById("versionBadge");
    if (vBadge) vBadge.textContent = `v${data.version || "4.0.0.0.0.0.0.0"}`;

    // Lobby Banner & Countdown
    if (data.active_lobby) {
      const bannerMap = document.getElementById("bannerMapName");
      const bannerTimer = document.getElementById("bannerTimer");
      if (bannerMap) bannerMap.textContent = `Target Map: ${data.active_lobby.map} | Mode: ${(data.active_lobby.mode || "").toUpperCase()}`;
      if (bannerTimer) {
        const cd = data.active_lobby.countdown || 0;
        bannerTimer.textContent = `${cd}s`;
        if (cd > 0 && cd <= 8) {
          bannerTimer.style.color = "var(--color-warning)";
        } else {
          bannerTimer.style.color = "var(--color-success)";
        }
      }
    }

    // Append logs
    if (data.logs && data.logs.length > 0) {
      data.logs.forEach(msg => appendLog(msg));
    }
  } catch (err) {
    console.error("Telemetry error:", err);
  }
}

// SWARM CONTROLS
async function launchSwarm() {
  playClickSFX();
  if (!currentKeyValid) {
    appendLog("[Auth] Cannot launch swarm: 24-hour key is expired or inactive.");
    openKeyModal();
    return;
  }

  const count = parseInt(document.getElementById("sliderBotCount").value, 10);
  const mode = document.getElementById("selGameMode").value;
  const tag = document.getElementById("inpClanTag").value;

  appendLog(`[*] Requesting swarm launch: count=${count}, map=${activeMap}, mode=${mode}, tag=${tag}`);

  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.launch_swarm({
      count: count,
      map: activeMap,
      mode: mode,
      tag: tag
    });
    showToast(res.message || "Swarm initiated.");
    appendLog(`[+] Swarm status: ${res.message || res.status}`);
  }
}

async function forceReady() {
  playClickSFX();
  appendLog("[*] Triggering synchronized ready lock across active bots...");
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.trigger_ready();
    showToast(res.message || "Ready triggered.");
  }
}

async function stopSwarm() {
  playClickSFX();
  appendLog("[*] Disconnecting all bots and halting swarm...");
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.abort_swarm();
    showToast(res.message || "Swarm stopped.");
  }
}

// TOKEN PRE-WARMING
async function prewarmTokens() {
  playClickSFX();
  appendLog("[*] Starting offscreen Turnstile solver replenishment...");
  if (window.pywebview && window.pywebview.api) {
    await window.pywebview.api.prewarm_tokens(10);
    showToast("Pre-warming Turnstile clearance tokens...");
  }
}

async function checkSolverHealth() {
  playClickSFX();
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.check_solver_health();
    appendLog(`[Solver Health] Active: ${res.active} | Tokens: ${res.tokens || 0} | Endpoint: ${res.url}`);
    showToast(res.active ? "✓ Solver service online" : "⚠️ Solver service offline");
  }
}

// PROXY HARVESTING
async function harvestProxies() {
  playClickSFX();
  appendLog("[*] Harvesting dynamic zero-signup proxies with CONNECT pre-flight filter...");
  showToast("Harvesting live verified proxies...");
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.harvest_proxies(30);
    renderProxyTable(res.proxies || []);
    appendLog(`[+] Proxies updated: ${res.count || 0} verified tunnels ready.`);
    showToast(`✓ ${res.count || 0} proxies verified.`);
  }
}

function renderProxyTable(proxies) {
  const tbody = document.getElementById("proxyTableBody");
  if (!tbody) return;
  if (!proxies || proxies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No proxies available.</td></tr>';
    return;
  }

  tbody.innerHTML = proxies.map(p => {
    const proto = (p.protocol || "http").toUpperCase();
    const lat = p.latency_ms || 180;
    const latColor = lat < 200 ? "var(--color-success)" : (lat < 400 ? "var(--color-warning)" : "var(--color-danger)");
    return `
      <tr>
        <td><span class="status-badge">${proto}</span></td>
        <td><code>${p.endpoint}</code></td>
        <td><strong style="color: ${latColor};">${lat}ms</strong></td>
        <td><span class="status-dot online"></span> Active</td>
      </tr>
    `;
  }).join("");
}

// ACCOUNTS
async function generateAccountsPrompt() {
  playClickSFX();
  const count = prompt("How many accounts to batch generate?", "5");
  if (!count) return;
  
  appendLog(`[*] Generating ${count} accounts with alphanumeric credentials...`);
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.create_accounts(parseInt(count, 10));
    renderAccountTable(res.accounts || []);
    appendLog(`[+] Accounts created: ${res.accounts ? res.accounts.length : count}`);
    showToast(`✓ Generated ${res.accounts ? res.accounts.length : count} accounts.`);
  }
}

function renderAccountTable(accounts) {
  const tbody = document.getElementById("accountTableBody");
  if (!tbody || !accounts || accounts.length === 0) return;
  tbody.innerHTML = accounts.map(a => `
    <tr>
      <td><strong>${a.username}</strong></td>
      <td>${a.clan_tag || "-"}</td>
      <td><code>${a.password ? a.password.slice(0, 6) + "..." : "******"}</code></td>
      <td><span class="status-dot online"></span> Valid</td>
    </tr>
  `).join("");
}

// KEY SYSTEM ACTIONS
async function submitKey() {
  const keyInput = document.getElementById("modalKeyInput");
  const keyVal = keyInput ? keyInput.value.trim() : "";
  if (!keyVal) return;

  appendLog(`[*] Validating key: ${keyVal}`);
  if (window.pywebview && window.pywebview.api) {
    const res = await window.pywebview.api.submit_key(keyVal);
    if (res.success) {
      appendLog(`[+] ${res.message}`);
      closeKeyModal();
      showToast("✓ 24-Hour Key Activated!");
      refreshTelemetry();
    } else {
      alert(res.message);
    }
  }
}

function openKeyUrl() {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.open_verification_url();
  }
}

async function saveProfileChanges() {
  const user = document.getElementById("modalUsername").value;
  const tag = document.getElementById("modalClanTag").value;
  if (window.pywebview && window.pywebview.api) {
    await window.pywebview.api.set_profile(user, tag);
    closeProfileModal();
    showToast("Profile updated.");
    refreshTelemetry();
  }
}

// LOGGING
function appendLog(text) {
  const quick = document.getElementById("quickLog");
  const full = document.getElementById("fullTerminal");
  const autoScrollCheck = document.getElementById("autoScrollCheck");
  const autoScroll = autoScrollCheck ? autoScrollCheck.checked : true;

  if (quick) {
    const line1 = document.createElement("div");
    line1.className = "log-line";
    line1.textContent = text;
    quick.appendChild(line1);
    quick.scrollTop = quick.scrollHeight;
  }

  if (full) {
    const line2 = document.createElement("div");
    line2.className = "log-line";
    line2.textContent = text;
    full.appendChild(line2);
    if (autoScroll) {
      full.scrollTop = full.scrollHeight;
    }
  }
}

function clearLogs() {
  const full = document.getElementById("fullTerminal");
  const quick = document.getElementById("quickLog");
  if (full) full.innerHTML = "";
  if (quick) quick.innerHTML = "";
}

// SIMULATE DEV ENVIRONMENT IF LOADED STANDALONE
function simulateDevEnvironment() {
  const keyText = document.getElementById("keyStatusText");
  const profText = document.getElementById("profileText");
  const valChrome = document.getElementById("valChrome");
  const dotChrome = document.getElementById("dotChrome");
  const valToken = document.getElementById("valTokenPool");
  const tokenCount = document.getElementById("tokenGaugeCount");
  const dotToken = document.getElementById("dotToken");
  const valProxy = document.getElementById("valProxyCount");
  const dotProxy = document.getElementById("dotProxy");

  if (keyText) keyText.textContent = "Key Active (23h 59m)";
  if (profText) profText.textContent = "[TERRIX] Player_Dev";
  if (valChrome) valChrome.textContent = "Available";
  if (dotChrome) dotChrome.classList.add("online");
  if (valToken) valToken.textContent = "5 Cached";
  if (tokenCount) tokenCount.textContent = "5";
  if (dotToken) dotToken.classList.add("online");
  if (valProxy) valProxy.textContent = "24 Live";
  if (dotProxy) dotProxy.classList.add("online");
  appendLog("[Preview Mode] Running in local HTML browser test mode.");
}
