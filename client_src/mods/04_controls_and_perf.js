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
    if (document.getElementById('terrix-hotkey-toast')) return;
    if (!document.body) return;

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

  function mount() {
    initControlsAndPerf();
  }

  if (document.body) {
    mount();
  }
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('load', mount);

})(window, document);
