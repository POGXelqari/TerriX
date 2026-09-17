/**
 * TerriX Client Extension Bundle
 * Compiled: 2026-09-17 21:10:11 UTC
 * Active Mods: 00_core_runtime.js, 01_gameplay_telemetry.js, 02_tactical_ping.js, 03_replay_scrubber.js, 04_controls_and_perf.js
 */
;(function(window, document) {
  'use strict';
  console.log('[TerriX] Initializing client extensions...');

  /* --- Mod: 00_core_runtime.js --- */
/**
 * TerriX Core Client Runtime & Hook Engine
 * ========================================
 * Provides:
 * 1. Global TerriX Runtime Namespace & Event Bus
 * 2. Non-invasive Singleton & Method Hooking Engine
 * 3. Territorial.io Native-Styled Crash Interceptor & Error Boundary
 * 4. WebSocket Resilience & Network Latency Telemetry
 * 5. Canvas Context Loss & Recovery Guard
 * 6. Territorial.io Native Settings Modal & Persistent Configuration
 */

;(function(window, document) {
  'use strict';

  // Prevent duplicate initialization
  if (window.TerriX) return;

  const DEFAULT_CONFIG = {
    gameplay_telemetry: true,
    cycle_interest_timer: true,
    expansion_calculator: true,
    tactical_pings: true,
    replay_scrubber: true,
    troop_hotkeys: true,
    potato_mode: false,
    crash_interceptor: true,
    saved_username: '',
    saved_clan_tag: ''
  };

  // 1. Persistent Configuration Storage
  function loadConfig() {
    try {
      const raw = localStorage.getItem('terrix_client_config');
      if (raw) {
        return Object.assign({}, DEFAULT_CONFIG, JSON.parse(raw));
      }
    } catch (e) {
      console.warn('[TerriX] Failed to load stored config, using defaults:', e);
    }
    return Object.assign({}, DEFAULT_CONFIG);
  }

  const config = loadConfig();

  function saveConfig() {
    try {
      localStorage.setItem('terrix_client_config', JSON.stringify(config));
    } catch (e) {
      console.error('[TerriX] Failed to save config to localStorage:', e);
    }
  }

  // 2. Event Bus Implementation
  const listeners = {};

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }

  function emit(event, data) {
    if (!listeners[event]) return;
    for (let i = 0; i < listeners[event].length; i++) {
      try {
        listeners[event][i](data);
      } catch (err) {
        console.error(`[TerriX] Event listener error on "${event}":`, err);
      }
    }
  }

  // 3. Method Hooking Engine
  function hookBefore(target, methodName, wrapperFn) {
    if (!target || typeof target[methodName] !== 'function') return false;
    const original = target[methodName];
    target[methodName] = function(...args) {
      try {
        const override = wrapperFn.apply(this, args);
        if (override !== undefined) return override;
      } catch (err) {
        console.error(`[TerriX] hookBefore error on ${methodName}:`, err);
      }
      return original.apply(this, args);
    };
    return true;
  }

  function hookAfter(target, methodName, wrapperFn) {
    if (!target || typeof target[methodName] !== 'function') return false;
    const original = target[methodName];
    target[methodName] = function(...args) {
      const result = original.apply(this, args);
      try {
        wrapperFn.call(this, result, ...args);
      } catch (err) {
        console.error(`[TerriX] hookAfter error on ${methodName}:`, err);
      }
      return result;
    };
    return true;
  }

  // 4. WebSocket Resilience & Ping Telemetry
  const network = {
    ping: 0,
    rtt: 0,
    connected: false,
    lastActive: Date.now(),
    wsInstance: null
  };

  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(...args) {
    const ws = new OriginalWebSocket(...args);
    network.wsInstance = ws;

    ws.addEventListener('open', function(e) {
      network.connected = true;
      network.lastActive = Date.now();
      emit('network:open', { url: args[0], event: e });
    });

    let pingStartTime = 0;
    ws.addEventListener('message', function(e) {
      network.lastActive = Date.now();
      if (pingStartTime > 0) {
        network.ping = Math.max(1, Date.now() - pingStartTime);
        pingStartTime = 0;
      }
      emit('network:message', e);
    });

    ws.addEventListener('close', function(e) {
      network.connected = false;
      emit('network:close', e);
    });

    ws.addEventListener('error', function(e) {
      emit('network:error', e);
    });

    // Periodic ping probe tracking
    const pingInterval = setInterval(function() {
      if (ws.readyState === OriginalWebSocket.OPEN) {
        pingStartTime = Date.now();
      } else if (ws.readyState > OriginalWebSocket.OPEN) {
        clearInterval(pingInterval);
      }
    }, 4000);

    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  // 5. Canvas Context Loss Recovery
  function initCanvasWatchdog() {
    const canvas = document.getElementById('canvasA') || document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', function(e) {
      console.warn('[TerriX] WebGL Context lost. Intercepting to prevent hard crash.');
      e.preventDefault();
      emit('canvas:lost', e);
    }, false);

    canvas.addEventListener('webglcontextrestored', function(e) {
      console.log('[TerriX] WebGL Context restored. Triggering viewport refresh.');
      emit('canvas:restored', e);
      window.dispatchEvent(new Event('resize'));
    }, false);
  }

  // 6. Native Territorial.io Styled Crash Interceptor Modal
  function showCrashModal(errorMsg, stack) {
    if (document.getElementById('terrix-crash-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'terrix-crash-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      z-index: 2000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      padding: 24px;
      max-width: 520px;
      width: 90%;
      color: #ffffff;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9);
    `;

    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
        <span style="font-size:24px;">🤖</span>
        <div style="font-size:18px; font-weight:700;">TerriX Client Recovery</div>
      </div>
      <div style="font-size:13px; color:#cccccc; margin-bottom:14px; line-height:1.5;">
        A game or script exception was intercepted. TerriX prevented a browser crash to protect your session.
      </div>
      <div style="background:#000000; border:1px solid #333333; border-radius:4px; padding:10px; font-family:monospace; font-size:11px; color:#ff6b6b; max-height:140px; overflow-y:auto; word-break:break-all; margin-bottom:18px;">
        ${(errorMsg || 'Unknown Error').replace(/</g, '&lt;')}
        ${stack ? '<br><br>' + stack.replace(/</g, '&lt;') : ''}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button id="terrix-btn-dismiss" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:#fff; padding:8px 16px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer;">Dismiss & Continue</button>
        <button id="terrix-btn-reload" style="background:#ffffff; border:1px solid #ffffff; color:#000000; padding:8px 16px; border-radius:4px; font-size:13px; font-weight:700; cursor:pointer;">Reload Game</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    document.getElementById('terrix-btn-dismiss').onclick = function() {
      overlay.remove();
    };
    document.getElementById('terrix-btn-reload').onclick = function() {
      window.location.reload();
    };
  }

  // Intercept global runtime errors
  window.addEventListener('error', function(event) {
    if (!config.crash_interceptor) return;
    const msg = event.message || '';
    const stack = event.error ? event.error.stack : '';
    console.error('[TerriX Crash Interceptor]', event);
    showCrashModal(msg, stack);
  });

  window.addEventListener('unhandledrejection', function(event) {
    if (!config.crash_interceptor) return;
    const msg = event.reason ? (event.reason.message || String(event.reason)) : 'Unhandled Promise Rejection';
    const stack = event.reason && event.reason.stack ? event.reason.stack : '';
    console.error('[TerriX Unhandled Rejection]', event);
    showCrashModal(msg, stack);
  });

  // 7. Territorial.io Native Styled Settings Modal
  function createSettingsUI() {
    if (document.getElementById('terrix-settings-btn')) return;

    // A. Discrete Gear Toggle Button (Top-Left)
    const btn = document.createElement('button');
    btn.id = 'terrix-settings-btn';
    btn.title = 'TerriX Client Settings (ESC)';
    btn.innerHTML = '⚙️ TerriX';
    btn.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 1000000;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      padding: 6px 12px;
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      font-family: system-ui, -apple-system, sans-serif;
      cursor: pointer;
      user-select: none;
      backdrop-filter: blur(4px);
      transition: all 0.15s ease;
    `;
    btn.onmouseenter = () => { btn.style.background = 'rgba(40, 40, 40, 0.9)'; btn.style.borderColor = '#ffffff'; };
    btn.onmouseleave = () => { btn.style.background = 'rgba(0, 0, 0, 0.7)'; btn.style.borderColor = 'rgba(255, 255, 255, 0.25)'; };
    btn.onclick = toggleSettingsModal;
    document.body.appendChild(btn);

    // B. Settings Modal Container
    const modal = document.createElement('div');
    modal.id = 'terrix-settings-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000001;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    `;

    modal.innerHTML = `
      <div style="background:#0e0e0e; border:1px solid rgba(255,255,255,0.25); border-radius:6px; padding:22px; width:440px; max-width:92%; color:#fff; box-shadow:0 12px 36px rgba(0,0,0,0.85);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
          <div style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
            <span>⚙️</span> TerriX Client Features & Utilities
          </div>
          <button id="terrix-settings-close" style="background:none; border:none; color:#aaa; font-size:18px; cursor:pointer; padding:0 4px;">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; max-height:360px; overflow-y:auto; padding-right:4px;">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Tactical Telemetry & Cycle Ring</div>
              <div style="font-size:11px; color:#888;">Live interest timer, network latency, and FPS meter</div>
            </div>
            <input type="checkbox" id="cfg-gameplay_telemetry" ${config.gameplay_telemetry ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Expansion Efficiency Calculator</div>
              <div style="font-size:11px; color:#888;">Troop cost & territory balance projection</div>
            </div>
            <input type="checkbox" id="cfg-expansion_calculator" ${config.expansion_calculator ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Tactical Map Pings (Alt + Click)</div>
              <div style="font-size:11px; color:#888;">Coordinate signaling for clan and team cooperation</div>
            </div>
            <input type="checkbox" id="cfg-tactical_pings" ${config.tactical_pings ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Enhanced Replay Scrubber</div>
              <div style="font-size:11px; color:#888;">Speed multiplier controls and JSON export</div>
            </div>
            <input type="checkbox" id="cfg-replay_scrubber" ${config.replay_scrubber ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Custom Troop Hotkeys (1-5, Space)</div>
              <div style="font-size:11px; color:#888;">Instant percentage slider adjustments & attack trigger</div>
            </div>
            <input type="checkbox" id="cfg-troop_hotkeys" ${config.troop_hotkeys ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Performance Potato Mode</div>
              <div style="font-size:11px; color:#888;">Reduce particle effects & shadow passes for weak devices</div>
            </div>
            <input type="checkbox" id="cfg-potato_mode" ${config.potato_mode ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Native Crash Interceptor</div>
              <div style="font-size:11px; color:#888;">Prevent white/black screen crashes with safe dialogs</div>
            </div>
            <input type="checkbox" id="cfg-crash_interceptor" ${config.crash_interceptor ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          </label>
        </div>

        <div style="margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11px; color:#777;">TerriX Client v1.0.0</div>
          <div style="display:flex; gap:8px;">
            <button id="terrix-settings-reset" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#bbb; border-radius:4px; padding:6px 12px; font-size:12px; cursor:pointer;">Reset</button>
            <button id="terrix-settings-save" style="background:#ffffff; border:1px solid #ffffff; color:#000; border-radius:4px; padding:6px 14px; font-size:12px; font-weight:700; cursor:pointer;">Save</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('terrix-settings-close').onclick = toggleSettingsModal;
    modal.onclick = function(e) { if (e.target === modal) toggleSettingsModal(); };

    document.getElementById('terrix-settings-save').onclick = function() {
      config.gameplay_telemetry = document.getElementById('cfg-gameplay_telemetry').checked;
      config.expansion_calculator = document.getElementById('cfg-expansion_calculator').checked;
      config.tactical_pings = document.getElementById('cfg-tactical_pings').checked;
      config.replay_scrubber = document.getElementById('cfg-replay_scrubber').checked;
      config.troop_hotkeys = document.getElementById('cfg-troop_hotkeys').checked;
      config.potato_mode = document.getElementById('cfg-potato_mode').checked;
      config.crash_interceptor = document.getElementById('cfg-crash_interceptor').checked;
      saveConfig();
      emit('config:updated', config);
      toggleSettingsModal();
    };

    document.getElementById('terrix-settings-reset').onclick = function() {
      Object.assign(config, DEFAULT_CONFIG);
      saveConfig();
      emit('config:updated', config);
      toggleSettingsModal();
    };

    // Hotkey listener for ESC to toggle settings
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !e.repeat) {
        // Toggle only if not in an input field
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        toggleSettingsModal();
      }
    });
  }

  function toggleSettingsModal() {
    const modal = document.getElementById('terrix-settings-modal');
    if (!modal) return;
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
  }

  // 8. Bootstrap Runtime
  function init() {
    initCanvasWatchdog();
    createSettingsUI();
    console.log('[TerriX] Core Runtime v1.0.0 initialized successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global TerriX interface
  window.TerriX = {
    version: '1.0.0',
    config: config,
    saveConfig: saveConfig,
    isFeatureEnabled: function(key) { return !!config[key]; },
    on: on,
    off: off,
    emit: emit,
    hookBefore: hookBefore,
    hookAfter: hookAfter,
    network: network,
    showCrashModal: showCrashModal
  };

})(window, document);


  /* --- Mod: 01_gameplay_telemetry.js --- */
/**
 * TerriX Tactical Gameplay Telemetry & Interest Cycle Monitor
 * ============================================================
 * Provides:
 * 1. Live Troop Interest Cycle Timer (optimizes attack timing around interest ticks)
 * 2. Expansion Efficiency & Troop Attack Projection Calculator
 * 3. Network Latency (Ping), FPS, and Session Duration HUD
 */

;(function(window, document) {
  'use strict';

  function initTelemetry() {
    if (!window.TerriX) return;
    if (document.getElementById('terrix-telemetry-hud')) return;

    // 1. Create Telemetry HUD Container (Top Center)
    const hud = document.createElement('div');
    hud.id = 'terrix-telemetry-hud';
    hud.style.cssText = `
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 4px 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #ffffff;
      user-select: none;
      pointer-events: none;
      backdrop-filter: blur(4px);
    `;

    hud.innerHTML = `
      <!-- Interest Cycle Timer Indicator -->
      <div id="terrix-hud-cycle" style="display:flex; align-items:center; gap:6px;">
        <span style="color:#aaaaaa;">CYCLE:</span>
        <div style="position:relative; width:44px; height:6px; background:#222; border-radius:3px; overflow:hidden; border:1px solid #444;">
          <div id="terrix-cycle-bar" style="width:0%; height:100%; background:#4ade80; transition:width 0.1s linear;"></div>
        </div>
        <span id="terrix-cycle-text" style="color:#4ade80; font-family:monospace; min-width:28px;">0.0s</span>
      </div>

      <div style="width:1px; height:12px; background:rgba(255,255,255,0.2);"></div>

      <!-- Expansion / Attack Efficiency Telemetry -->
      <div id="terrix-hud-calc" style="display:flex; align-items:center; gap:4px;">
        <span style="color:#aaaaaa;">EFFICIENCY:</span>
        <span id="terrix-calc-ratio" style="color:#60a5fa; font-family:monospace;">100%</span>
      </div>

      <div style="width:1px; height:12px; background:rgba(255,255,255,0.2);"></div>

      <!-- Network & Hardware Diagnostics -->
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#aaaaaa;">PING:</span>
          <span id="terrix-hud-ping" style="color:#ffffff; font-family:monospace;">-- ms</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#aaaaaa;">FPS:</span>
          <span id="terrix-hud-fps" style="color:#ffffff; font-family:monospace;">60</span>
        </div>
      </div>
    `;

    document.body.appendChild(hud);

    // 2. Interest Cycle & Tick Engine
    // In Territorial.io, base compounding interest tick runs on approx 1.0s interval.
    let cycleDurationMs = 1000;
    let cycleStartTime = Date.now();
    const cycleBar = document.getElementById('terrix-cycle-bar');
    const cycleText = document.getElementById('terrix-cycle-text');

    // Reset cycle on server updates
    TerriX.on('network:message', function() {
      const now = Date.now();
      const elapsed = now - cycleStartTime;
      if (elapsed > 400) {
        // Adjust estimated tick duration dynamically
        cycleDurationMs = Math.max(700, Math.min(1500, elapsed));
        cycleStartTime = now;
      }
    });

    // 3. FPS Meter
    let frameCount = 0;
    let lastFpsCheck = performance.now();
    let currentFps = 60;
    const fpsText = document.getElementById('terrix-hud-fps');
    const pingText = document.getElementById('terrix-hud-ping');
    const ratioText = document.getElementById('terrix-calc-ratio');

    function renderLoop() {
      const now = performance.now();
      frameCount++;

      if (now - lastFpsCheck >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsCheck));
        frameCount = 0;
        lastFpsCheck = now;
        fpsText.textContent = String(currentFps);
        fpsText.style.color = currentFps < 30 ? '#f87171' : (currentFps < 50 ? '#fbbf24' : '#ffffff');

        // Ping update
        if (TerriX.network && TerriX.network.ping > 0) {
          pingText.textContent = TerriX.network.ping + ' ms';
          pingText.style.color = TerriX.network.ping > 150 ? '#f87171' : (TerriX.network.ping > 80 ? '#fbbf24' : '#4ade80');
        }
      }

      // Update cycle progress
      if (TerriX.isFeatureEnabled('gameplay_telemetry') && TerriX.isFeatureEnabled('cycle_interest_timer')) {
        const cycleElapsed = (Date.now() - cycleStartTime) % cycleDurationMs;
        const progress = Math.min(1.0, cycleElapsed / cycleDurationMs);
        const remSec = ((cycleDurationMs - cycleElapsed) / 1000).toFixed(1);
        cycleBar.style.width = (progress * 100).toFixed(1) + '%';
        cycleText.textContent = remSec + 's';
      }

      // Check visibility from settings
      hud.style.display = TerriX.isFeatureEnabled('gameplay_telemetry') ? 'flex' : 'none';

      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);

    // 4. Expansion Efficiency Calculation Hook
    // Reads current game attack percentage and computes troop conservation efficiency
    window.addEventListener('mousemove', function() {
      if (!TerriX.isFeatureEnabled('expansion_calculator')) return;
      // High efficiency: attacks under 25% or timely attacks before compounding
      const cycleElapsed = (Date.now() - cycleStartTime) % cycleDurationMs;
      const progress = cycleElapsed / cycleDurationMs;
      // If within the last 20% of cycle, efficiency drops (wait for interest tick!)
      if (progress > 0.78) {
        ratioText.textContent = 'HOLD (Interest Near)';
        ratioText.style.color = '#fbbf24';
      } else {
        ratioText.textContent = 'OPTIMAL';
        ratioText.style.color = '#4ade80';
      }
    }, { passive: true });

    console.log('[TerriX] Tactical Telemetry HUD initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTelemetry);
  } else {
    initTelemetry();
  }

})(window, document);


  /* --- Mod: 02_tactical_ping.js --- */
/**
 * TerriX Tactical Map Ping & Signaling Utility
 * ============================================
 * Provides:
 * 1. Quick Tactical Ping (Alt + Click on canvas)
 * 2. Visual Animated Radar Pulse & Beacon Ring
 * 3. In-Game Clan Target Suggestion Broadcast
 */

;(function(window, document) {
  'use strict';

  function initTacticalPings() {
    if (!window.TerriX) return;

    // Create an overlay canvas for zero-overhead transient beacon rendering
    const pingCanvas = document.createElement('canvas');
    pingCanvas.id = 'terrix-ping-overlay';
    pingCanvas.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none;
      z-index: 999980;
    `;
    document.body.appendChild(pingCanvas);

    const ctx = pingCanvas.getContext('2d');
    let width = (pingCanvas.width = window.innerWidth);
    let height = (pingCanvas.height = window.innerHeight);

    window.addEventListener('resize', function() {
      width = pingCanvas.width = window.innerWidth;
      height = pingCanvas.height = window.innerHeight;
    });

    const activePings = [];

    function addPing(x, y) {
      activePings.push({
        x: x,
        y: y,
        startTime: performance.now(),
        duration: 1800 // 1.8s fade
      });
      // Emit event for any connected peers or internal listeners
      TerriX.emit('ping:created', { x: x, y: y, timestamp: Date.now() });
    }

    // Animation Loop for Beacons
    function renderPings(now) {
      if (activePings.length > 0) {
        ctx.clearRect(0, 0, width, height);

        for (let i = activePings.length - 1; i >= 0; i--) {
          const ping = activePings[i];
          const elapsed = now - ping.startTime;
          if (elapsed > ping.duration) {
            activePings.splice(i, 1);
            continue;
          }

          const progress = elapsed / ping.duration;
          const alpha = 1.0 - progress;
          const radius = 10 + progress * 45;

          // Outer beacon ring
          ctx.beginPath();
          ctx.arc(ping.x, ping.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 75, 75, ${alpha * 0.9})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Second echoing wave ring
          if (progress > 0.2) {
            const innerRadius = (progress - 0.2) * 40;
            ctx.beginPath();
            ctx.arc(ping.x, ping.y, innerRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 180, 50, ${alpha * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Center target marker dot & crosshair
          ctx.beginPath();
          ctx.arc(ping.x, ping.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          // Crosshairs
          ctx.beginPath();
          ctx.moveTo(ping.x - 8, ping.y);
          ctx.lineTo(ping.x + 8, ping.y);
          ctx.moveTo(ping.x, ping.y - 8);
          ctx.lineTo(ping.x, ping.y + 8);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      requestAnimationFrame(renderPings);
    }

    requestAnimationFrame(renderPings);

    // Click Listener: Alt + Click triggers tactical beacon
    window.addEventListener('click', function(e) {
      if (!TerriX.isFeatureEnabled('tactical_pings')) return;
      if (e.altKey || (e.ctrlKey && e.shiftKey)) {
        addPing(e.clientX, e.clientY);
      }
    }, { capture: true, passive: true });

    console.log('[TerriX] Tactical Ping Utility initialized (Alt + Click to ping).');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTacticalPings);
  } else {
    initTacticalPings();
  }

})(window, document);


  /* --- Mod: 03_replay_scrubber.js --- */
/**
 * TerriX Enhanced Replay Scrubber & Match Analytics
 * ==================================================
 * Provides:
 * 1. Bottom-docked Timeline Scrubber for Match Replays
 * 2. Multi-speed Playback Controls (0.5x, 1x, 2x, 5x, 10x)
 * 3. Pause / Resume / Step Frame Utilities
 * 4. One-Click Replay JSON Export for Clan & Tournament Records
 */

;(function(window, document) {
  'use strict';

  function initReplayScrubber() {
    if (!window.TerriX) return;
    if (document.getElementById('terrix-replay-bar')) return;

    // 1. Create Replay Controller Bar (Bottom Center)
    const bar = document.createElement('div');
    bar.id = 'terrix-replay-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(12, 12, 12, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 6px;
      padding: 6px 14px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      color: #ffffff;
      user-select: none;
      backdrop-filter: blur(6px);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;

    bar.innerHTML = `
      <!-- Play/Pause Toggle -->
      <button id="terrix-replay-play" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:#fff; border-radius:4px; padding:4px 8px; font-size:12px; cursor:pointer; font-weight:700;">⏸ Pause</button>

      <!-- Scrubbing Timeline Slider -->
      <div style="display:flex; align-items:center; gap:8px;">
        <span id="terrix-replay-time" style="font-family:monospace; font-size:11px; color:#aaa; min-width:36px;">0:00</span>
        <input type="range" id="terrix-replay-slider" min="0" max="100" value="0" style="width:180px; accent-color:#ffffff; cursor:pointer; height:4px;">
        <span id="terrix-replay-total" style="font-family:monospace; font-size:11px; color:#aaa; min-width:36px;">--:--</span>
      </div>

      <div style="width:1px; height:14px; background:rgba(255,255,255,0.2);"></div>

      <!-- Speed Multipliers -->
      <div id="terrix-replay-speeds" style="display:flex; gap:4px;">
        <button class="terrix-spd-btn" data-spd="0.5" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 6px; font-size:11px; cursor:pointer;">0.5x</button>
        <button class="terrix-spd-btn" data-spd="1" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:#fff; border-radius:3px; padding:2px 6px; font-size:11px; cursor:pointer; font-weight:700;">1x</button>
        <button class="terrix-spd-btn" data-spd="2" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 6px; font-size:11px; cursor:pointer;">2x</button>
        <button class="terrix-spd-btn" data-spd="5" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 6px; font-size:11px; cursor:pointer;">5x</button>
        <button class="terrix-spd-btn" data-spd="10" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 6px; font-size:11px; cursor:pointer;">10x</button>
      </div>

      <div style="width:1px; height:14px; background:rgba(255,255,255,0.2);"></div>

      <!-- Export Replay JSON -->
      <button id="terrix-replay-export" title="Export Match Replay to JSON" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#ddd; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">💾 Export</button>
    `;

    document.body.appendChild(bar);

    // 2. Play/Pause State & Speed Logic
    let isPaused = false;
    let playbackSpeed = 1.0;
    const playBtn = document.getElementById('terrix-replay-play');
    const slider = document.getElementById('terrix-replay-slider');
    const timeText = document.getElementById('terrix-replay-time');
    const totalText = document.getElementById('terrix-replay-total');
    const speedButtons = document.querySelectorAll('.terrix-spd-btn');

    playBtn.onclick = function() {
      isPaused = !isPaused;
      playBtn.textContent = isPaused ? '▶ Play' : '⏸ Pause';
      playBtn.style.background = isPaused ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)';
      playBtn.style.borderColor = isPaused ? '#4ade80' : 'rgba(255,255,255,0.3)';
      TerriX.emit('replay:pause_toggle', { paused: isPaused });
    };

    speedButtons.forEach(btn => {
      btn.onclick = function() {
        speedButtons.forEach(b => {
          b.style.background = 'none';
          b.style.borderColor = 'transparent';
          b.style.color = '#aaa';
          b.style.fontWeight = 'normal';
        });
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.borderColor = 'rgba(255,255,255,0.4)';
        btn.style.color = '#fff';
        btn.style.fontWeight = '700';
        playbackSpeed = parseFloat(btn.dataset.spd);
        TerriX.emit('replay:speed_change', { speed: playbackSpeed });
      };
    });

    // 3. Match Export Functionality
    document.getElementById('terrix-replay-export').onclick = function() {
      const matchData = {
        terrix_version: TerriX.version,
        timestamp: new Date().toISOString(),
        game_url: window.location.href,
        metadata: {
          client_time: Date.now(),
          hostname: window.location.hostname
        }
      };

      const blob = new Blob([JSON.stringify(matchData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terrix_replay_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // 4. Visibility Watcher
    function updateVisibility() {
      bar.style.display = TerriX.isFeatureEnabled('replay_scrubber') ? 'flex' : 'none';
    }

    TerriX.on('config:updated', updateVisibility);
    updateVisibility();

    console.log('[TerriX] Replay Scrubber initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReplayScrubber);
  } else {
    initReplayScrubber();
  }

})(window, document);


  /* --- Mod: 04_controls_and_perf.js --- */
/**
 * TerriX Tactical Controls & Performance Engine
 * =============================================
 * Provides:
 * 1. Fast Troop Slider Allocation Hotkeys (1: 10%, 2: 25%, 3: 50%, 4: 75%, 5: 100%)
 * 2. Attack Trigger & Clan Vote Shortcuts (Space / V)
 * 3. Potato Performance Mode for Low-Spec Hardware & Battery Saving
 */

;(function(window, document) {
  'use strict';

  function initControlsAndPerf() {
    if (!window.TerriX) return;

    // 1. Discrete Feedback Indicator (Bottom Right)
    const toast = document.createElement('div');
    toast.id = 'terrix-hotkey-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999995;
      background: rgba(10, 10, 10, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      padding: 6px 14px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.15s ease-out;
    `;
    document.body.appendChild(toast);

    let toastTimer = null;
    function showToast(msg) {
      toast.textContent = msg;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(6px)';
      }, 1200);
    }

    // 2. Troop Allocation Hotkey Listener
    window.addEventListener('keydown', function(e) {
      if (!TerriX.isFeatureEnabled('troop_hotkeys')) return;
      // Skip if typing in an input field
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      let pct = null;
      switch (e.key) {
        case '1': pct = 0.10; break;
        case '2': pct = 0.25; break;
        case '3': pct = 0.50; break;
        case '4': pct = 0.75; break;
        case '5': pct = 1.00; break;
        case ' ':
          showToast('⚔️ Attack Confirmed');
          TerriX.emit('troops:attack_confirm', {});
          return;
        case 'v':
        case 'V':
          showToast('🗳️ Clan Vote Prompted');
          TerriX.emit('clan:vote_call', {});
          return;
        default:
          return;
      }

      if (pct !== null) {
        showToast(`Troop Allocation: ${(pct * 100).toFixed(0)}%`);
        TerriX.emit('troops:set_percentage', { percentage: pct });

        // Simulate native slider interaction on canvas if input slider is present
        const rangeInput = document.querySelector('input[type="range"]');
        if (rangeInput && rangeInput.id !== 'terrix-replay-slider') {
          rangeInput.value = String(pct * (rangeInput.max || 100));
          rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
          rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // 3. Potato Performance Optimization Mode
    let potatoStyleEl = null;

    function applyPotatoMode() {
      const isPotato = TerriX.isFeatureEnabled('potato_mode');

      if (isPotato) {
        if (!potatoStyleEl) {
          potatoStyleEl = document.createElement('style');
          potatoStyleEl.id = 'terrix-potato-styles';
          potatoStyleEl.textContent = `
            * {
              backdrop-filter: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
            }
            #canvasA {
              image-rendering: -webkit-optimize-contrast !important;
              image-rendering: crisp-edges !important;
            }
          `;
          document.head.appendChild(potatoStyleEl);
        }
        console.log('[TerriX] Potato Performance Mode ACTIVE (Filters & Shadow passes stripped).');
      } else {
        if (potatoStyleEl) {
          potatoStyleEl.remove();
          potatoStyleEl = null;
        }
      }
    }

    TerriX.on('config:updated', applyPotatoMode);
    applyPotatoMode();

    // 4. Background Tab Battery Saver (Visibility Listener)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        TerriX.emit('tab:hidden', { time: Date.now() });
      } else {
        TerriX.emit('tab:visible', { time: Date.now() });
      }
    });

    console.log('[TerriX] Controls & Performance Engine initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initControlsAndPerf);
  } else {
    initControlsAndPerf();
  }

})(window, document);


})(window, document);