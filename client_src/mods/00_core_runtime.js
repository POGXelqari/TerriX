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
 * 7. Saved Clan Credentials Auto-Fill & Persistent DOM Guard
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
        A game exception was intercepted. TerriX prevented a browser crash to protect your session.
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

  // Intercept ONLY genuine unhandled fatal exceptions (filter benign cross-origin Script error)
  window.addEventListener('error', function(event) {
    if (!config.crash_interceptor) return;
    const msg = event.message || '';
    // Benign external / cross-origin / ResizeObserver checks matching Territorial.io standards
    if (!msg || msg === 'Script error.' || msg.includes('ResizeObserver') || !event.error || (event.lineno !== undefined && event.lineno < 2)) {
      return;
    }
    const stack = event.error ? event.error.stack : '';
    console.warn('[TerriX Crash Interceptor]', msg);
    showCrashModal(msg, stack);
  });

  window.addEventListener('unhandledrejection', function(event) {
    if (!config.crash_interceptor) return;
    const msg = event.reason ? (event.reason.message || String(event.reason)) : '';
    if (!msg || msg.includes('Script error') || msg.includes('ResizeObserver')) return;
    const stack = event.reason && event.reason.stack ? event.reason.stack : '';
    console.warn('[TerriX Unhandled Rejection]', msg);
    showCrashModal(msg, stack);
  });

  // 7. Territorial.io Native Styled Settings Modal & Synchronization Engine
  function syncSettingsInputs() {
    const modal = document.getElementById('terrix-settings-modal');
    if (!modal) return;

    // Checkboxes
    const keys = [
      'gameplay_telemetry', 'expansion_calculator', 'tactical_pings',
      'replay_scrubber', 'troop_hotkeys', 'potato_mode', 'crash_interceptor'
    ];
    keys.forEach(k => {
      const el = document.getElementById(`cfg-${k}`);
      if (el) el.checked = !!config[k];
    });

    // Saved Clan Credentials inputs
    const userEl = document.getElementById('cfg-saved-username');
    const clanEl = document.getElementById('cfg-saved-clan-tag');
    if (userEl) userEl.value = config.saved_username || '';
    if (clanEl) clanEl.value = config.saved_clan_tag || '';
  }

  function autoFillCredentials() {
    if (!config.saved_username) return;
    const input0 = document.getElementById('input0');
    if (input0 && (!input0.value || input0.value.startsWith('Player '))) {
      input0.value = config.saved_username;
      input0.dispatchEvent(new Event('input', { bubbles: true }));
      input0.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`[TerriX] Auto-filled saved username: ${config.saved_username}`);
    }
  }

  function createSettingsUI() {
    if (document.getElementById('terrix-settings-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'terrix-settings-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000005;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    `;

    modal.innerHTML = `
      <div style="background:#0e0e0e; border:1px solid rgba(255,255,255,0.25); border-radius:6px; padding:22px; width:460px; max-width:92%; color:#fff; box-shadow:0 12px 36px rgba(0,0,0,0.85);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
          <div style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
            <span>⚙️</span> TerriX Client Features & Settings
          </div>
          <button id="terrix-settings-close" style="background:none; border:none; color:#aaa; font-size:18px; cursor:pointer; padding:0 4px;">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; max-height:360px; overflow-y:auto; padding-right:4px;">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Tactical Telemetry & Cycle Ring</div>
              <div style="font-size:11px; color:#888;">Live interest timer, network latency, and FPS meter</div>
            </div>
            <input type="checkbox" id="cfg-gameplay_telemetry" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Expansion Efficiency Calculator</div>
              <div style="font-size:11px; color:#888;">Troop cost & territory balance projection</div>
            </div>
            <input type="checkbox" id="cfg-expansion_calculator" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Tactical Map Pings (Alt + Click)</div>
              <div style="font-size:11px; color:#888;">Coordinate signaling for clan and team cooperation</div>
            </div>
            <input type="checkbox" id="cfg-tactical_pings" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Enhanced Replay Scrubber</div>
              <div style="font-size:11px; color:#888;">Speed multiplier controls and JSON export</div>
            </div>
            <input type="checkbox" id="cfg-replay_scrubber" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Custom Troop Hotkeys (1-5, Space)</div>
              <div style="font-size:11px; color:#888;">Instant percentage slider adjustments & attack trigger</div>
            </div>
            <input type="checkbox" id="cfg-troop_hotkeys" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Performance Potato Mode</div>
              <div style="font-size:11px; color:#888;">Reduce particle effects & shadow passes for weak devices</div>
            </div>
            <input type="checkbox" id="cfg-potato_mode" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:13px;">
            <div>
              <div style="font-weight:600;">Native Crash Interceptor</div>
              <div style="font-size:11px; color:#888;">Prevent white/black screen crashes with safe dialogs</div>
            </div>
            <input type="checkbox" id="cfg-crash_interceptor" style="cursor:pointer; width:16px; height:16px;">
          </label>

          <!-- Saved Clan Credentials Support -->
          <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
            <div style="font-size:12px; font-weight:700; color:#ddd; margin-bottom:8px;">Saved Clan Credentials</div>
            <div style="display:flex; gap:8px;">
              <input type="text" id="cfg-saved-username" placeholder="Saved Username" style="flex:1; background:#1c1c1c; border:1px solid #444; border-radius:4px; padding:6px 10px; color:#fff; font-size:12px;">
              <input type="text" id="cfg-saved-clan-tag" placeholder="Clan Tag (e.g. [OG])" style="width:130px; background:#1c1c1c; border:1px solid #444; border-radius:4px; padding:6px 10px; color:#fff; font-size:12px;">
            </div>
          </div>
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
      config.saved_username = (document.getElementById('cfg-saved-username').value || '').trim();
      config.saved_clan_tag = (document.getElementById('cfg-saved-clan-tag').value || '').trim();

      saveConfig();
      autoFillCredentials();
      emit('config:updated', config);
      toggleSettingsModal();
    };

    document.getElementById('terrix-settings-reset').onclick = function() {
      Object.assign(config, DEFAULT_CONFIG);
      saveConfig();
      syncSettingsInputs();
      emit('config:updated', config);
      toggleSettingsModal();
    };

    // Hotkey listener for ESC to toggle settings
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !e.repeat) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        toggleSettingsModal();
      }
    });
  }

  function toggleSettingsModal(forceOpen) {
    createSettingsUI();
    const modal = document.getElementById('terrix-settings-modal');
    if (!modal) return;
    const isCurrentlyVisible = modal.style.display === 'flex';
    const shouldShow = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyVisible;

    if (shouldShow) {
      syncSettingsInputs();
      modal.style.display = 'flex';
    } else {
      modal.style.display = 'none';
    }
  }

  // 8. Bootstrap & Resilient Persistence Loop
  function mount() {
    initCanvasWatchdog();
    createSettingsUI();
    autoFillCredentials();
  }

  // Execute mount immediately and attach to lifecycle hooks
  if (document.body) {
    mount();
  }
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('load', mount);

  // Persistence Watchdog: Ensures UI elements remain attached across game state transitions
  setInterval(function() {
    if (!document.getElementById('terrix-settings-modal')) {
      createSettingsUI();
    }
    autoFillCredentials();
  }, 2500);

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
    showCrashModal: showCrashModal,
    toggleSettingsModal: toggleSettingsModal
  };

  console.log('[TerriX] Core Runtime v1.0.0 initialized successfully.');

})(window, document);
