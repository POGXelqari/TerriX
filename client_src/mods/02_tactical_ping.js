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
    if (document.getElementById('terrix-ping-overlay')) return;
    if (!document.body) return;
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

  function mount() {
    initTacticalPings();
  }

  if (document.body) {
    mount();
  }
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('load', mount);

})(window, document);
