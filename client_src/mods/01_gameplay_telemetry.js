/**
 * TerriX Tactical Gameplay Telemetry & Interest Cycle Monitor
 * ============================================================
 * Provides:
 * 1. Live Troop Interest Cycle Timer (optimizes attack timing around interest ticks)
 * 2. Expansion Efficiency & Troop Attack Projection Calculator
 * 3. Network Latency (Ping), FPS, and Integrated Settings Trigger
 * 4. Resilient Lifecycle Mounting Guard
 */

;(function(window, document) {
  'use strict';

  function initTelemetry() {
    if (!window.TerriX) return;
    if (document.getElementById('terrix-telemetry-hud')) return;
    if (!document.body) return;

    // 1. Create Telemetry HUD Container (Top Center)
    const hud = document.createElement('div');
    hud.id = 'terrix-telemetry-hud';
    hud.style.cssText = `
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000000;
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(10, 10, 10, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 4px;
      padding: 4px 10px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #ffffff;
      user-select: none;
      backdrop-filter: blur(6px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    `;

    hud.innerHTML = `
      <!-- Integrated Settings Button -->
      <button id="terrix-hud-settings-btn" title="TerriX Settings (ESC)" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.25); color:#ffffff; border-radius:3px; padding:2px 7px; font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px;">
        <span>⚙️</span> TerriX
      </button>

      <div style="width:1px; height:12px; background:rgba(255,255,255,0.2);"></div>

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

    // Settings Button Click Hook
    const settingsBtn = document.getElementById('terrix-hud-settings-btn');
    if (settingsBtn) {
      settingsBtn.onclick = function() {
        if (window.TerriX && window.TerriX.toggleSettingsModal) {
          window.TerriX.toggleSettingsModal();
        }
      };
      settingsBtn.onmouseenter = () => { settingsBtn.style.background = 'rgba(255,255,255,0.2)'; };
      settingsBtn.onmouseleave = () => { settingsBtn.style.background = 'rgba(255,255,255,0.08)'; };
    }

    // 2. Interest Cycle & Tick Engine
    let cycleDurationMs = 1000;
    let cycleStartTime = Date.now();
    const cycleBar = document.getElementById('terrix-cycle-bar');
    const cycleText = document.getElementById('terrix-cycle-text');

    TerriX.on('network:message', function() {
      const now = Date.now();
      const elapsed = now - cycleStartTime;
      if (elapsed > 400) {
        cycleDurationMs = Math.max(700, Math.min(1500, elapsed));
        cycleStartTime = now;
      }
    });

    // 3. FPS & Diagnostics Loop
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
    window.addEventListener('mousemove', function() {
      if (!TerriX.isFeatureEnabled('expansion_calculator')) return;
      const cycleElapsed = (Date.now() - cycleStartTime) % cycleDurationMs;
      const progress = cycleElapsed / cycleDurationMs;
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

  // Resilient mounting lifecycle
  function mount() {
    initTelemetry();
  }

  if (document.body) {
    mount();
  }
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('load', mount);

  setInterval(function() {
    if (!document.getElementById('terrix-telemetry-hud')) {
      initTelemetry();
    }
  }, 2500);

})(window, document);
