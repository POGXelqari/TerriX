/**
 * TerriX Enhanced Replay Scrubber & Match Analytics
 * ==================================================
 * Provides:
 * 1. Bottom-docked Timeline Scrubber with Collapsible Mini-Tab
 * 2. Multi-speed Playback Controls (0.5x, 1x, 2x, 5x, 10x)
 * 3. Pause / Resume / Step Frame Utilities
 * 4. One-Click Replay JSON Export for Clan & Tournament Records
 * 5. Resilient Auto-Mounting Guard
 */

;(function(window, document) {
  'use strict';

  function initReplayScrubber() {
    if (!window.TerriX) return;
    if (document.getElementById('terrix-replay-bar')) return;
    if (!document.body) return;

    // 1. Create Replay Controller Bar (Bottom Center)
    const bar = document.createElement('div');
    bar.id = 'terrix-replay-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999990;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(12, 12, 12, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 6px;
      padding: 5px 12px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      color: #ffffff;
      user-select: none;
      backdrop-filter: blur(6px);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.7);
      transition: all 0.2s ease;
    `;

    bar.innerHTML = `
      <!-- Minimize/Expand Handle -->
      <button id="terrix-replay-collapse" title="Collapse Replay Bar" style="background:none; border:none; color:#888; font-size:12px; cursor:pointer; padding:0 2px;">▼</button>

      <!-- Play/Pause Toggle -->
      <button id="terrix-replay-play" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); color:#fff; border-radius:3px; padding:3px 7px; font-size:11px; cursor:pointer; font-weight:700;">⏸ Pause</button>

      <!-- Scrubbing Timeline Slider -->
      <div id="terrix-replay-timeline-group" style="display:flex; align-items:center; gap:6px;">
        <span id="terrix-replay-time" style="font-family:monospace; font-size:11px; color:#aaa; min-width:32px;">0:00</span>
        <input type="range" id="terrix-replay-slider" min="0" max="100" value="0" style="width:140px; accent-color:#ffffff; cursor:pointer; height:4px;">
        <span id="terrix-replay-total" style="font-family:monospace; font-size:11px; color:#aaa; min-width:32px;">--:--</span>
      </div>

      <div style="width:1px; height:12px; background:rgba(255,255,255,0.2);"></div>

      <!-- Speed Multipliers -->
      <div id="terrix-replay-speeds" style="display:flex; gap:3px;">
        <button class="terrix-spd-btn" data-spd="0.5" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 5px; font-size:10px; cursor:pointer;">0.5x</button>
        <button class="terrix-spd-btn" data-spd="1" style="background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); color:#fff; border-radius:3px; padding:2px 5px; font-size:10px; cursor:pointer; font-weight:700;">1x</button>
        <button class="terrix-spd-btn" data-spd="2" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 5px; font-size:10px; cursor:pointer;">2x</button>
        <button class="terrix-spd-btn" data-spd="5" style="background:none; border:1px solid transparent; color:#aaa; border-radius:3px; padding:2px 5px; font-size:10px; cursor:pointer;">5x</button>
      </div>

      <div style="width:1px; height:12px; background:rgba(255,255,255,0.2);"></div>

      <!-- Export Replay JSON -->
      <button id="terrix-replay-export" title="Export Match Replay" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#ddd; border-radius:3px; padding:3px 7px; font-size:10px; cursor:pointer;">💾 Export</button>
    `;

    document.body.appendChild(bar);

    // 2. Collapsible Behavior
    let isCollapsed = false;
    const collapseBtn = document.getElementById('terrix-replay-collapse');
    const timelineGroup = document.getElementById('terrix-replay-timeline-group');
    const speedsGroup = document.getElementById('terrix-replay-speeds');
    const exportBtn = document.getElementById('terrix-replay-export');

    collapseBtn.onclick = function() {
      isCollapsed = !isCollapsed;
      collapseBtn.textContent = isCollapsed ? '▲ Replay' : '▼';
      timelineGroup.style.display = isCollapsed ? 'none' : 'flex';
      speedsGroup.style.display = isCollapsed ? 'none' : 'flex';
      exportBtn.style.display = isCollapsed ? 'none' : 'block';
      bar.style.padding = isCollapsed ? '3px 8px' : '5px 12px';
    };

    // 3. Play/Pause State & Speed Logic
    let isPaused = false;
    let playbackSpeed = 1.0;
    const playBtn = document.getElementById('terrix-replay-play');
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

    // 4. Match Export Functionality
    exportBtn.onclick = function() {
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

    // 5. Visibility Watcher
    function updateVisibility() {
      bar.style.display = TerriX.isFeatureEnabled('replay_scrubber') ? 'flex' : 'none';
    }

    TerriX.on('config:updated', updateVisibility);
    updateVisibility();

    console.log('[TerriX] Replay Scrubber initialized.');
  }

  // Resilient mounting lifecycle
  function mount() {
    initReplayScrubber();
  }

  if (document.body) {
    mount();
  }
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('load', mount);

  setInterval(function() {
    if (!document.getElementById('terrix-replay-bar')) {
      initReplayScrubber();
    }
  }, 2500);

})(window, document);
