/**
 * TerriX In-Game Extension: Clan Bank Manager (CBM) HUD
 * ======================================================
 * Injects a lightweight, non-intrusive financial telemetry overlay
 * directly into the Territorial.io canvas viewport.
 *
 * Features:
 * - Live Clan Treasury status badge
 * - Instant deposit / withdrawal portal link
 * - Hotkey toggle (press 'B' or 'F2')
 */

(function initCBMHUD() {
  // Prevent duplicate injection
  if (document.getElementById('cbm-hud-container')) return;

  // 1. Inject Stylesheet
  const style = document.createElement('style');
  style.id = 'cbm-hud-styles';
  style.textContent = `
    #cbm-hud-container {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
      pointer-events: auto;
    }
    #cbm-hud-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(14, 22, 38, 0.88);
      border: 1px solid rgba(255, 215, 0, 0.35);
      border-radius: 8px;
      padding: 6px 12px;
      color: #ffd700;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #cbm-hud-badge:hover {
      background: rgba(19, 29, 49, 0.96);
      border-color: #ffd700;
      transform: translateY(-1px);
    }
    #cbm-hud-panel {
      display: none;
      position: absolute;
      top: 42px;
      right: 0;
      width: 280px;
      background: #080d16;
      border: 1px solid rgba(255, 215, 0, 0.25);
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
      color: #ffffff;
    }
    #cbm-hud-panel.open {
      display: block;
      animation: cbmFadeIn 0.18s ease-out;
    }
    @keyframes cbmFadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cbm-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
    }
    .cbm-label { color: #8899a6; }
    .cbm-val { font-weight: 600; color: #ffd700; }
    .cbm-actions {
      display: flex;
      gap: 6px;
      margin-top: 12px;
    }
    .cbm-btn {
      flex: 1;
      background: #0e1626;
      border: 1px solid rgba(255, 215, 0, 0.25);
      border-radius: 6px;
      padding: 7px 4px;
      color: #e1e8ed;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .cbm-btn:hover {
      background: #131d31;
      border-color: #ffd700;
      color: #ffd700;
    }
    .cbm-btn-primary {
      background: rgba(255, 215, 0, 0.15);
      border-color: #ffd700;
      color: #ffd700;
    }
    .cbm-btn-primary:hover {
      background: rgba(255, 215, 0, 0.25);
    }
  `;
  document.head.appendChild(style);

  // 2. Inject DOM Elements
  const container = document.createElement('div');
  container.id = 'cbm-hud-container';
  container.innerHTML = `
    <div id="cbm-hud-badge" title="Toggle Clan Bank (Press 'B' or 'F2')">
      <span>🏛️</span>
      <span>Clan Bank</span>
      <span style="font-size: 10px; opacity: 0.7;">[B]</span>
    </div>
    <div id="cbm-hud-panel">
      <div class="cbm-row" style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
        <span style="font-weight: 700; color: #ffd700;">Clan Bank Manager</span>
        <span style="font-size: 10px; color: #10b981;">● Online</span>
      </div>
      <div class="cbm-row">
        <span class="cbm-label">Vault Reserve:</span>
        <span id="cbm-vault-val" class="cbm-val">Loading...</span>
      </div>
      <div class="cbm-row">
        <span class="cbm-label">Active Host:</span>
        <span class="cbm-val" style="font-size: 11px; color: #0070e0;">cbm.wispbyte.org</span>
      </div>
      <div class="cbm-actions">
        <a class="cbm-btn cbm-btn-primary" href="https://cbm.wispbyte.org" target="_blank">🏦 Open Bank</a>
        <a class="cbm-btn" href="https://cbm.wispbyte.org/donations.html" target="_blank">⚔️ Donate</a>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // 3. Interactivity & Keyboard Shortcuts
  const badge = container.querySelector('#cbm-hud-badge');
  const panel = container.querySelector('#cbm-hud-panel');

  function togglePanel() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      refreshTelemetry();
    }
  }

  badge.addEventListener('click', togglePanel);

  window.addEventListener('keydown', (e) => {
    // Hotkey: 'b' or 'B' or 'F2' (ignore if typing in an input)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'b' || e.key === 'B' || e.key === 'F2') {
      togglePanel();
    }
  });

  // 4. Telemetry Polling
  function refreshTelemetry() {
    fetch('https://cbm.wispbyte.org/api/cbm/status')
      .then(res => res.json())
      .then(data => {
        const valEl = document.getElementById('cbm-vault-val');
        if (valEl && data.vault_balance_gold !== undefined) {
          valEl.textContent = `${data.vault_balance_gold.toLocaleString()} Gold`;
        }
      })
      .catch(() => {
        const valEl = document.getElementById('cbm-vault-val');
        if (valEl) valEl.textContent = 'Active (Ready)';
      });
  }

  // Initial poll
  refreshTelemetry();
  console.log('[TerriX Mod] Clan Bank Manager HUD initialized.');
})();
