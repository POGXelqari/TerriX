/**
 * ====================================================================
 * TerriX Client: In-Match Disposable Chat & World Bubble System
 * ====================================================================
 * Features:
 * 1. Unmoveable 3D Circle Button on HUD with speech bubble icon.
 * 2. Self-healing DOM lifecycle with MutationObserver & staggered resurrection
 *    ladder (guarantees HUD button survives Territorial.io page transitions).
 * 3. Hotkey '/' listener to immediately focus chat input (Esc to dismiss).
 * 4. Text-only Territorial.io UI style speech bubbles anchored to player
 *    territory centroid on the world canvas (ws) that follow camera panning,
 *    zooming, and territory movement, fading out after ~6 seconds.
 * 5. Dual Authentication: CBM Member Credentials (verified badge & clan tag)
 *    and Anonymous Territorial.io in-game identity.
 * 6. Automatic deterministic match room synchronization over CBM Disposable Chat API.
 * 7. High concurrency & low CPU standard: freezes polling when document.hidden.
 * ====================================================================
 */

(function(window, document) {
  'use strict';

  var CBM_API_BASE = 'https://cbm.wispbyte.org';
  var BUBBLE_LIFETIME_MS = 6000;
  var BUBBLE_FADE_START_MS = 4200;
  var POLL_INTERVAL_MS = 1500;

  // Custom Sticker glyph replacements for text-only rendering in-game
  var STICKER_GLYPHS = {
    ':gold:': '🧈 [Gold]',
    ':crown:': '👑 [Crown]',
    ':fire:': '🔥 [Fire]',
    ':gg:': '🤝 [GG]',
    ':peace:': '🕊️ [Peace]',
    ':swords:': '⚔️ [Attack]',
    ':shield:': '🛡️ [Defense]',
    ':skull:': '💀 [RIP]',
    ':salute:': '🫡 [Salute]',
    ':popcorn:': '🍿 [Popcorn]',
    ':100:': '💯 [100]',
    ':flex:': '💪 [Flex]'
  };

  // State
  var state = {
    inboxOpen: false,
    currentRoomId: 'match_global',
    lastMessageId: null,
    activeBubbles: [], // [{ id, sender_name, sender_clan, content, player_index, auth_type, is_cbm_verified, spawnTime, lastPos }]
    pollTimer: null,
    // Persistent tracking nodes per player: pIdx -> { tileX, tileY, initialized, lastUpdate }
    playerAnchors: {},
    lastFrameTime: performance.now(),
    cachedPlayerPositions: {} // pIdx -> { x, y }
  };

  // Dual Auth Helpers
  function getCbmAuth() {
    try {
      var user = (localStorage.getItem('cbm_active_account') || localStorage.getItem('cbm_user') || '').trim();
      var pin = (sessionStorage.getItem('cbm_pin') || localStorage.getItem('cbm_pin') || '').trim();
      var pwd = (sessionStorage.getItem('cbm_password') || '').trim();
      if (user && (pin || pwd)) {
        return { username: user, pin: pin, password: pwd };
      }
    } catch(e) {}
    return null;
  }

  function getTerritorialPlayerName() {
    try {
      if (window.__fx && window.__fx.utils && typeof window.__fx.utils.getPlayerName === 'function') {
        var n = window.__fx.utils.getPlayerName();
        if (n) return n;
      }
      var d105 = localStorage.getItem('d105');
      if (d105) return d105.trim();
    } catch(e) {}
    return 'Player';
  }

  function getLocalPlayerIndex(context) {
    if (context && context.game) {
      if (typeof context.game.playerId === 'number') return context.game.playerId;
      if (typeof context.game.fJ === 'number') return context.game.fJ;
    }
    return null;
  }

  // Deterministic Match Room ID generator
  function updateMatchRoomId(context) {
    try {
      if (context && context.playerData && context.playerData.rawPlayerNames) {
        var names = context.playerData.rawPlayerNames;
        if (names && names.length > 0) {
          // Take first 12 player names sorted to derive a deterministic room hash
          var sample = [];
          for (var i = 0; i < Math.min(names.length, 12); i++) {
            if (names[i]) sample.push(String(names[i]).trim());
          }
          if (sample.length > 0) {
            sample.sort();
            var combined = sample.join('|');
            var hash = 0;
            for (var c = 0; c < combined.length; c++) {
              hash = ((hash << 5) - hash) + combined.charCodeAt(c);
              hash |= 0;
            }
            var hexHash = (hash >>> 0).toString(16);
            state.currentRoomId = 'match_' + hexHash;
            return;
          }
        }
      }
      if (window.location.hash && window.location.hash.length > 1) {
        state.currentRoomId = 'lobby_' + window.location.hash.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
        return;
      }
    } catch(e) {}
    state.currentRoomId = 'match_global';
  }

  // Format message text for text-only rendering in-game
  function formatTextOnly(text) {
    if (!text) return '';
    var out = text;
    for (var code in STICKER_GLYPHS) {
      out = out.split(code).join(STICKER_GLYPHS[code]);
    }
    return out.trim();
  }

  // Add Speech Bubble to Active Pool
  function addSpeechBubble(msg) {
    if (!msg || !msg.content) return;
    var bubble = {
      id: msg.id || ('b_' + Math.random().toString(36).slice(2, 9)),
      sender_name: msg.sender_name || 'Guest',
      sender_clan: msg.sender_clan || '',
      content: formatTextOnly(msg.content),
      player_index: (typeof msg.player_index === 'number') ? msg.player_index : null,
      auth_type: msg.auth_type || 'TERRITORIAL_ANONYMOUS',
      is_cbm_verified: !!msg.is_cbm_verified,
      cbm_role: msg.cbm_role || null,
      spawnTime: performance.now(),
      lastPos: null
    };

    // Avoid duplicate bubbles with exact same message within 2 seconds
    for (var i = 0; i < state.activeBubbles.length; i++) {
      var b = state.activeBubbles[i];
      if (b.sender_name === bubble.sender_name && b.content === bubble.content && (bubble.spawnTime - b.spawnTime) < 2000) {
        return;
      }
    }

    state.activeBubbles.push(bubble);
    // Keep at most 20 active bubbles on screen to protect FPS
    if (state.activeBubbles.length > 20) {
      state.activeBubbles.shift();
    }
  }

  // Poll CBM Disposable Chatroom API
  async function pollChatMessages() {
    if (document.hidden) return; // Low CPU standard: freeze on inactive tabs

    try {
      var url = CBM_API_BASE + '/api/cbm/chat/messages?room_id=' + encodeURIComponent(state.currentRoomId);
      if (state.lastMessageId) {
        url += '&since_id=' + encodeURIComponent(state.lastMessageId);
      }

      var res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) return;

      var data = await res.json();
      if (data && data.status === 'ok' && Array.isArray(data.messages)) {
        for (var i = 0; i < data.messages.length; i++) {
          var m = data.messages[i];
          addSpeechBubble(m);
          state.lastMessageId = m.id;
        }
      }
    } catch(e) {
      // Silently retry on next poll cycle
    }
  }

  // Send message to CBM Disposable Chatroom API
  async function sendMessage(text) {
    if (!text || !text.trim()) return;

    var cleanText = text.trim().slice(0, 200);
    var cbmAuth = getCbmAuth();
    var payload = {
      room_id: state.currentRoomId,
      content: cleanText
    };

    if (cbmAuth) {
      payload.cbm_username = cbmAuth.username;
      if (cbmAuth.pin) payload.cbm_pin = cbmAuth.pin;
      if (cbmAuth.password) payload.cbm_password = cbmAuth.password;
    } else {
      payload.sender_name = getTerritorialPlayerName();
      payload.sender_clan = '';
    }

    // Attach local player index if available
    if (window.__TERRIX_LAST_CTX__) {
      var lIdx = getLocalPlayerIndex(window.__TERRIX_LAST_CTX__);
      if (typeof lIdx === 'number') payload.player_index = lIdx;
    }

    try {
      var res = await fetch(CBM_API_BASE + '/api/cbm/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (data && data.status === 'ok' && data.message) {
        addSpeechBubble(data.message);
        state.lastMessageId = data.message.id;
      }
    } catch(e) {
      console.warn('[TerriX Chat] Error sending message:', e);
    }
  }

  // ====================================================================
  // Optimized Speech Bubble Positioning & LERP Engine
  // ====================================================================

  function getPlayerTargetTile(pIdx, context) {
    var pd = (context && context.playerData) || window.ah;
    if (!pd) return null;

    // 1. Prefer engine nametag coordinates if accessible (window.ag / aLp, aLq)
    if (window.ag && window.ag.aLp && window.ag.aLq && typeof window.ag.aLp[pIdx] === 'number') {
      var lx = window.ag.aLp[pIdx];
      var ly = window.ag.aLq[pIdx];
      var lw = window.ag.aLr ? (window.ag.aLr[pIdx] || 0) : 0;
      if (lx > 0 && ly > 0) {
        return { x: lx + (lw / 2.0), y: ly - 2.0 };
      }
    }

    // 2. Fallback to territory bounding box centroid
    var minXArr = pd.jS || pd.minX;
    var minYArr = pd.jU || pd.minY;
    var maxXArr = pd.jT || pd.maxX;
    var pTerritories = pd.jS ? pd.hN : (pd.playerTerritories || pd.hN);

    if (minXArr && minYArr && maxXArr) {
      var minX = minXArr[pIdx];
      var minY = minYArr[pIdx];
      var maxX = maxXArr[pIdx];
      var tCount = (pTerritories && typeof pTerritories[pIdx] === 'number') ? pTerritories[pIdx] : 0;

      if (typeof minX === 'number' && typeof maxX === 'number' && typeof minY === 'number' && tCount > 0 && maxX >= minX) {
        return {
          x: (minX + maxX) / 2.0,
          y: minY - 4.0 // Slightly above upper border
        };
      }
    }
    return null;
  }

  function updatePlayerAnchor(pIdx, context, dt) {
    if (!state.playerAnchors[pIdx]) {
      state.playerAnchors[pIdx] = { tileX: 0, tileY: 0, initialized: false };
    }
    var anchor = state.playerAnchors[pIdx];
    var target = getPlayerTargetTile(pIdx, context);

    if (target) {
      if (!anchor.initialized) {
        anchor.tileX = target.x;
        anchor.tileY = target.y;
        anchor.initialized = true;
      } else {
        // Framerate-independent exponential smoothing (speed = 14.0)
        var factor = 1.0 - Math.exp(-14.0 * dt);
        anchor.tileX += (target.x - anchor.tileX) * factor;
        anchor.tileY += (target.y - anchor.tileY) * factor;
      }
    }
    return anchor.initialized ? anchor : null;
  }

  function renderSpeechBubbles(context) {
    window.__TERRIX_LAST_CTX__ = context;
    if (!context || !context.ws) return;

    var ws = context.ws;
    var pd = context.playerData || window.ah;
    var now = performance.now();
    var dt = Math.min(Math.max((now - (state.lastFrameTime || now)) / 1000.0, 0.001), 0.1);
    state.lastFrameTime = now;

    updateMatchRoomId(context);

    if (state.activeBubbles.length === 0) return;

    // Camera parameters
    var zoom = (typeof context.im === 'number') ? context.im : ((typeof window.im === 'number') ? window.im : 1.0);
    var ox = (context.offsetX !== undefined) ? context.offsetX : (window.aT ? window.aT.a0L() : 0);
    var oy = (context.offsetY !== undefined) ? context.offsetY : (window.aT ? window.aT.a0M() : 0);

    // Group bubbles by sender to calculate vertical stacking
    var playerStacks = {};
    var survivingBubbles = [];

    // Filter out expired bubbles
    for (var i = 0; i < state.activeBubbles.length; i++) {
      var b = state.activeBubbles[i];
      if (now - b.spawnTime <= BUBBLE_LIFETIME_MS) {
        survivingBubbles.push(b);
      }
    }
    state.activeBubbles = survivingBubbles;

    // Sort surviving bubbles chronologically
    state.activeBubbles.sort(function(a, b) { return a.spawnTime - b.spawnTime; });

    // Switch context to Screen Space for crisp rendering
    ws.save();
    ws.setTransform(1, 0, 0, 1, 0, 0);

    var screenW = ws.canvas ? ws.canvas.width : window.innerWidth;
    var screenH = ws.canvas ? ws.canvas.height : window.innerHeight;

    for (var j = 0; j < state.activeBubbles.length; j++) {
      var bubble = state.activeBubbles[j];
      var age = now - bubble.spawnTime;

      // Resolve player index
      var pIdx = bubble.player_index;
      if ((pIdx === null || pIdx === undefined) && pd && pd.rawPlayerNames) {
        for (var p = 0; p < pd.rawPlayerNames.length; p++) {
          if (pd.rawPlayerNames[p] && pd.rawPlayerNames[p].indexOf(bubble.sender_name) !== -1) {
            pIdx = p;
            bubble.player_index = p;
            break;
          }
        }
      }

      // Calculate anchor coordinates
      var rawScreenX, rawScreenY;
      var hasAnchor = false;

      if (pIdx !== null && pIdx !== undefined) {
        var smoothAnchor = updatePlayerAnchor(pIdx, context, dt);
        if (smoothAnchor) {
          rawScreenX = (smoothAnchor.tileX + ox) * zoom;
          rawScreenY = (smoothAnchor.tileY + oy) * zoom;
          hasAnchor = true;
        }
      }

      if (!hasAnchor) {
        // Fallback: screen center stack
        rawScreenX = screenW / 2.0;
        rawScreenY = (screenH / 2.0) - 80;
      }

      // Track vertical stacking for this player
      var stackKey = (pIdx !== null && pIdx !== undefined) ? ('p_' + pIdx) : 'global';
      if (!playerStacks[stackKey]) {
        playerStacks[stackKey] = 0;
      }
      var verticalOffset = playerStacks[stackKey];

      // Draw bubble and update the stack height for next bubble
      var bubbleHeight = drawTerritorialBubble(ws, rawScreenX, rawScreenY, bubble, age, verticalOffset, screenW, screenH);
      playerStacks[stackKey] += bubbleHeight + 8; // 8px spacing between stacked bubbles
    }

    ws.restore();
  }

  function drawTerritorialBubble(ctx, targetX, targetY, bubble, age, stackOffset, screenW, screenH) {
    ctx.save();

    // 1. Entrance / Exit Animations
    var alpha = 1.0;
    var scale = 1.0;
    var driftY = 0;

    // Pop-in scale (0-180ms)
    if (age < 180) {
      var progress = age / 180.0;
      scale = 0.82 + (0.18 * Math.sin(progress * Math.PI / 2.0));
      alpha = progress;
    }
    // Float & Fade-out
    if (age > BUBBLE_FADE_START_MS) {
      var fadeProgress = (age - BUBBLE_FADE_START_MS) / (BUBBLE_LIFETIME_MS - BUBBLE_FADE_START_MS);
      alpha = Math.max(0.0, 1.0 - fadeProgress);
      driftY = -12.0 * fadeProgress; // Gently float upwards
    }

    ctx.globalAlpha = Math.max(0.0, Math.min(1.0, alpha));

    // 2. Text Metrics & Dynamic Sizing
    var fontText = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var fontHeader = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    ctx.font = fontHeader;
    var headerText = (bubble.sender_clan ? '[' + bubble.sender_clan + '] ' : '') + bubble.sender_name;
    if (bubble.is_cbm_verified) headerText = '✓ ' + headerText;
    var headerWidth = ctx.measureText(headerText).width;

    ctx.font = fontText;
    var textMetrics = ctx.measureText(bubble.content);
    var textWidth = Math.max(textMetrics.width, 42);

    var bubbleWidth = Math.min(Math.max(textWidth, headerWidth) + 24, 300);
    var bubbleHeight = 44;

    // Base position with stack offset and drift
    var totalYOffset = bubbleHeight + 10 + stackOffset - driftY;
    var idealX = targetX;
    var idealY = targetY - totalYOffset;

    // 3. Viewport Clamping (Keep within visible screen)
    var padding = 12;
    var bx = Math.min(Math.max(idealX - (bubbleWidth / 2.0), padding), screenW - bubbleWidth - padding);
    var by = Math.min(Math.max(idealY, padding), screenH - bubbleHeight - padding);

    // Apply pop-in scale around bubble center
    if (scale !== 1.0) {
      var centerX = bx + (bubbleWidth / 2.0);
      var centerY = by + (bubbleHeight / 2.0);
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    }

    // 4. Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // 5. Rounded Bubble Geometry with Dynamic Needle
    var r = 9;
    var pointerX = Math.min(Math.max(targetX, bx + 16), bx + bubbleWidth - 16);
    var drawPointer = (stackOffset === 0 && (targetY - (by + bubbleHeight)) > 2 && (targetY - (by + bubbleHeight)) < 160);

    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bubbleWidth - r, by);
    ctx.quadraticCurveTo(bx + bubbleWidth, by, bx + bubbleWidth, by + r);
    ctx.lineTo(bx + bubbleWidth, by + bubbleHeight - r);
    ctx.quadraticCurveTo(bx + bubbleWidth, by + bubbleHeight, bx + bubbleWidth - r, by + bubbleHeight);

    // Bottom pointer needle (only on bottom-most bubble in the stack)
    if (drawPointer) {
      var needleW = 6;
      ctx.lineTo(pointerX + needleW, by + bubbleHeight);
      ctx.lineTo(targetX, Math.min(targetY, by + bubbleHeight + 8));
      ctx.lineTo(pointerX - needleW, by + bubbleHeight);
    }

    ctx.lineTo(bx + r, by + bubbleHeight);
    ctx.quadraticCurveTo(bx, by + bubbleHeight, bx, by + bubbleHeight - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();

    // Fill bubble body
    ctx.fillStyle = 'rgba(10, 16, 28, 0.94)';
    ctx.fill();

    // Reset shadow for crisp border and text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 6. Modern Stroke Border (Cyan/Blue for Verified CBM, Silver for Anon)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = bubble.is_cbm_verified ? 'rgba(0, 112, 224, 0.9)' : 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // 7. Render Header Text
    ctx.font = fontHeader;
    ctx.fillStyle = bubble.is_cbm_verified ? '#38bdf8' : '#9ca3af';
    ctx.fillText(headerText, bx + 12, by + 16, bubbleWidth - 24);

    // 8. Render Message Text
    ctx.font = fontText;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(bubble.content, bx + 12, by + 34, bubbleWidth - 24);

    ctx.restore();
    return bubbleHeight;
  }

  // ====================================================================
  // Robust Self-Healing DOM Initialization & Watchers
  // ====================================================================

  var CHAT_CSS = [
    '/* Unmoveable 3D Circle Chat Button on HUD */',
    '.terrix-chat-fab {',
    '  position: fixed !important;',
    '  bottom: 88px !important;',
    '  right: 24px !important;',
    '  width: 48px !important;',
    '  height: 48px !important;',
    '  border-radius: 50% !important;',
    '  background: radial-gradient(circle at 35% 30%, #1e2c45 0%, #0e1626 70%, #080d16 100%) !important;',
    '  border: 2px solid rgba(0, 112, 224, 0.65) !important;',
    '  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 112, 224, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;',
    '  color: #ffffff !important;',
    '  display: flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  cursor: pointer !important;',
    '  z-index: 999999 !important;',
    '  user-select: none !important;',
    '  pointer-events: auto !important;',
    '  touch-action: manipulation !important;',
    '  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s ease, box-shadow 0.15s ease !important;',
    '}',
    '.terrix-chat-fab:hover {',
    '  transform: scale(1.08) translateY(-2px) !important;',
    '  border-color: #60a5fa !important;',
    '  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.85), 0 4px 14px rgba(0, 112, 224, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5) !important;',
    '}',
    '.terrix-chat-fab:active {',
    '  transform: scale(0.95) !important;',
    '}',
    '.terrix-chat-fab.active {',
    '  border-color: #38bdf8 !important;',
    '  box-shadow: 0 0 16px rgba(56, 189, 248, 0.7), 0 8px 24px rgba(0, 0, 0, 0.85) !important;',
    '  transform: scale(1.05) !important;',
    '}',
    '',
    '/* Floating Chat Inbox Bar */',
    '.terrix-chat-bar {',
    '  position: fixed !important;',
    '  bottom: 88px !important;',
    '  left: 50% !important;',
    '  transform: translateX(-50%) !important;',
    '  width: 480px !important;',
    '  max-width: calc(100vw - 32px) !important;',
    '  background: rgba(14, 22, 38, 0.96) !important;',
    '  backdrop-filter: blur(16px) !important;',
    '  -webkit-backdrop-filter: blur(16px) !important;',
    '  border: 1.5px solid rgba(0, 112, 224, 0.45) !important;',
    '  border-radius: 9999px !important;',
    '  padding: 6px 14px !important;',
    '  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 112, 224, 0.2) !important;',
    '  display: none !important;',
    '  align-items: center !important;',
    '  gap: 10px !important;',
    '  z-index: 1000000 !important;',
    '  pointer-events: auto !important;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
    '}',
    '.terrix-chat-bar.open {',
    '  display: flex !important;',
    '  animation: txChatFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;',
    '}',
    '@keyframes txChatFadeIn {',
    '  from { opacity: 0; transform: translate(-50%, 10px); }',
    '  to { opacity: 1; transform: translate(-50%, 0); }',
    '}',
    '@media (max-height: 600px) {',
    '  .terrix-chat-fab {',
    '    bottom: 48px !important;',
    '    right: 16px !important;',
    '    width: 42px !important;',
    '    height: 42px !important;',
    '  }',
    '  .terrix-chat-bar {',
    '    bottom: 50px !important;',
    '    width: calc(100vw - 32px) !important;',
    '  }',
    '}',
    '.terrix-chat-badge {',
    '  font-size: 11px !important;',
    '  font-weight: 700 !important;',
    '  padding: 3px 8px !important;',
    '  border-radius: 9999px !important;',
    '  white-space: nowrap !important;',
    '}',
    '.tx-badge-cbm {',
    '  background: rgba(0, 112, 224, 0.25) !important;',
    '  color: #60a5fa !important;',
    '  border: 1px solid rgba(0, 112, 224, 0.5) !important;',
    '}',
    '.tx-badge-anon {',
    '  background: rgba(255, 255, 255, 0.08) !important;',
    '  color: #d1d5db !important;',
    '  border: 1px solid rgba(255, 255, 255, 0.2) !important;',
    '}',
    '.terrix-chat-input {',
    '  flex: 1 !important;',
    '  background: transparent !important;',
    '  border: none !important;',
    '  outline: none !important;',
    '  color: #ffffff !important;',
    '  font-size: 13.5px !important;',
    '  font-family: inherit !important;',
    '}',
    '.terrix-chat-input::placeholder {',
    '  color: #6b7280 !important;',
    '}',
    '.terrix-chat-send-btn {',
    '  background: #0070e0 !important;',
    '  border: none !important;',
    '  border-radius: 50% !important;',
    '  width: 32px !important;',
    '  height: 32px !important;',
    '  display: flex !important;',
    '  align-items: center !important;',
    '  justify-content: center !important;',
    '  color: #ffffff !important;',
    '  cursor: pointer !important;',
    '  transition: background 0.15s ease, transform 0.1s ease !important;',
    '  flex-shrink: 0 !important;',
    '}',
    '.terrix-chat-send-btn:hover {',
    '  background: #005ea6 !important;',
    '  transform: scale(1.05) !important;',
    '}',
    '.terrix-chat-close-btn {',
    '  background: transparent !important;',
    '  border: none !important;',
    '  color: #9ca3af !important;',
    '  font-size: 18px !important;',
    '  cursor: pointer !important;',
    '  line-height: 1 !important;',
    '  padding: 0 4px !important;',
    '}',
    '.terrix-chat-close-btn:hover {',
    '  color: #ffffff !important;',
    '}'
  ].join('\n');

  // Idempotent, self-healing DOM injector
  function ensureChatDOM() {
    var docBody = document.body;
    if (!docBody) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureChatDOM, { once: true });
      } else {
        setTimeout(ensureChatDOM, 30);
      }
      return;
    }

    // 1. Ensure Stylesheet
    var style = document.getElementById('terrix-chat-styles');
    if (!style || !document.contains(style)) {
      if (style && style.parentNode) style.parentNode.removeChild(style);
      style = document.createElement('style');
      style.id = 'terrix-chat-styles';
      style.textContent = CHAT_CSS;
      (document.head || docBody).appendChild(style);
    }

    // 2. Ensure Unmoveable 3D Circle Button
    var fab = document.getElementById('terrix-chat-fab');
    if (!fab || !docBody.contains(fab)) {
      if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
      fab = document.createElement('div');
      fab.id = 'terrix-chat-fab';
      fab.className = 'terrix-chat-fab' + (state.inboxOpen ? ' active' : '');
      fab.title = 'In-Match Chat (Press /)';
      fab.innerHTML = [
        '<div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">',
        '  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">',
        '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
        '  </svg>',
        '  <div style="position:absolute; bottom:3px; right:3px; width:9px; height:9px; background:#0070e0; border:2px solid #080d16; border-radius:50%; box-shadow:0 0 6px rgba(0,112,224,0.8);"></div>',
        '</div>'
      ].join('');

      // Prevent clicks/touches from leaking through to the Territorial.io canvas
      ['pointerdown', 'mousedown', 'touchstart'].forEach(function(evt) {
        fab.addEventListener(evt, function(e) {
          e.stopPropagation();
        });
      });

      fab.onclick = function(e) {
        e.stopPropagation();
        toggleChatInbox();
      };
      docBody.appendChild(fab);
    }

    // 3. Ensure Floating Chat Inbox Bar
    var bar = document.getElementById('terrix-chat-bar');
    if (!bar || !docBody.contains(bar)) {
      if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
      bar = document.createElement('div');
      bar.id = 'terrix-chat-bar';
      bar.className = 'terrix-chat-bar';
      if (state.inboxOpen) bar.classList.add('open');

      bar.innerHTML = [
        '<span id="tx-chat-auth-badge" class="terrix-chat-badge tx-badge-anon">Guest</span>',
        '<input type="text" id="tx-chat-input" class="terrix-chat-input" placeholder="Type a message (or :gold:, :gg:)... Press Enter" maxlength="200" autocomplete="off" spellcheck="false" />',
        '<button type="button" class="terrix-chat-send-btn" id="tx-chat-send-btn" title="Send (Enter)">',
        '  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        '</button>',
        '<button type="button" class="terrix-chat-close-btn" id="tx-chat-close-btn" title="Close (Esc)">&times;</button>'
      ].join('');

      // Prevent clicks/touches from leaking through to the Territorial.io canvas
      ['pointerdown', 'mousedown', 'touchstart'].forEach(function(evt) {
        bar.addEventListener(evt, function(e) {
          e.stopPropagation();
        });
      });

      docBody.appendChild(bar);

      var input = bar.querySelector('#tx-chat-input');
      var sendBtn = bar.querySelector('#tx-chat-send-btn');
      var closeBtn = bar.querySelector('#tx-chat-close-btn');

      if (sendBtn) {
        sendBtn.onclick = function(e) {
          e.stopPropagation();
          submitInput();
        };
      }

      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.stopPropagation();
          closeChatInbox();
        };
      }

      if (input) {
        // Prevent all typing keystrokes from leaking into Territorial.io game hotkeys
        ['keydown', 'keyup', 'keypress'].forEach(function(evt) {
          input.addEventListener(evt, function(e) {
            e.stopPropagation();
          });
        });

        input.onkeydown = function(e) {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            submitInput();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            closeChatInbox();
          }
        };
      }
    }

    updateAuthBadge();
  }

  // Bind Keyboard & Dismissal Listeners once on window
  function bindGlobalKeyboard() {
    if (window.__TERRIX_CHAT_KEY_BOUND__) return;
    window.__TERRIX_CHAT_KEY_BOUND__ = true;

    // Use capture phase so TerriX Chat hotkey '/' is never swallowed by game scripts
    window.addEventListener('keydown', function(e) {
      if (e.key === '/' && !state.inboxOpen) {
        var active = document.activeElement;
        var tag = active ? active.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (active && active.isContentEditable)) {
          return; // Let user type '/' inside regular text inputs
        }
        e.preventDefault();
        e.stopPropagation();
        openChatInbox();
      } else if (e.key === 'Escape' && state.inboxOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeChatInbox();
      }
    }, true);

    // Dismiss chat bar when clicking outside on the map
    document.addEventListener('pointerdown', function(e) {
      if (state.inboxOpen) {
        var bar = document.getElementById('terrix-chat-bar');
        var fab = document.getElementById('terrix-chat-fab');
        if (bar && !bar.contains(e.target) && (!fab || !fab.contains(e.target))) {
          closeChatInbox();
        }
      }
    }, true);
  }

  // MutationObserver & Lifecycle DOM Watchers
  var domObserver = null;
  var scheduledRecheckTimer = null;

  function scheduleDomRepair() {
    if (scheduledRecheckTimer) return;
    scheduledRecheckTimer = setTimeout(function() {
      scheduledRecheckTimer = null;
      ensureChatDOM();
    }, 40);
  }

  function startDOMWatchers() {
    var target = document.body || document.documentElement;
    var Obs = window.MutationObserver || (typeof MutationObserver !== 'undefined' ? MutationObserver : null);
    if (Obs && target) {
      if (domObserver) domObserver.disconnect();
      domObserver = new Obs(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.removedNodes && m.removedNodes.length > 0) {
            for (var j = 0; j < m.removedNodes.length; j++) {
              var n = m.removedNodes[j];
              if (n.id === 'terrix-chat-fab' ||
                  n.id === 'terrix-chat-bar' ||
                  n.id === 'terrix-chat-styles' ||
                  (n.classList && n.classList.contains('terrix-chat-fab'))) {
                scheduleDomRepair();
                return;
              }
            }
          }
        }
      });
      domObserver.observe(target, { childList: true, subtree: true });
    }

    // Staged resurrection ladder across initial page load & game startup
    var loadCheckIntervals = [50, 150, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000, 16000];
    loadCheckIntervals.forEach(function(delay) {
      setTimeout(ensureChatDOM, delay);
    });

    // Window lifecycle triggers
    window.addEventListener('load', ensureChatDOM);
    window.addEventListener('resize', ensureChatDOM);
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        ensureChatDOM();
      }
    });

    // Periodic heartbeat check
    setInterval(ensureChatDOM, 2500);
  }

  function updateAuthBadge() {
    var badge = document.getElementById('tx-chat-auth-badge');
    if (!badge) return;
    var cbm = getCbmAuth();
    if (cbm) {
      badge.className = 'terrix-chat-badge tx-badge-cbm';
      badge.textContent = '✓ ' + (cbm.username.length > 12 ? cbm.username.slice(0, 10) + '..' : cbm.username);
      badge.title = 'Authenticated CBM Member: ' + cbm.username;
    } else {
      badge.className = 'terrix-chat-badge tx-badge-anon';
      badge.textContent = 'Guest';
      badge.title = 'Anonymous Territorial.io Player';
    }
  }

  function openChatInbox() {
    state.inboxOpen = true;
    ensureChatDOM();
    updateAuthBadge();

    var fab = document.getElementById('terrix-chat-fab');
    if (fab) fab.classList.add('active');

    var bar = document.getElementById('terrix-chat-bar');
    if (bar) {
      bar.classList.add('open');
      var input = document.getElementById('tx-chat-input');
      if (input) {
        input.value = '';
        input.focus();
        setTimeout(function() {
          if (state.inboxOpen && document.activeElement !== input) {
            input.focus();
          }
        }, 40);
      }
    }
  }

  function closeChatInbox() {
    state.inboxOpen = false;
    var fab = document.getElementById('terrix-chat-fab');
    if (fab) fab.classList.remove('active');

    var bar = document.getElementById('terrix-chat-bar');
    if (bar) bar.classList.remove('open');
    var input = document.getElementById('tx-chat-input');
    if (input) input.blur();
  }

  function toggleChatInbox() {
    if (state.inboxOpen) {
      closeChatInbox();
    } else {
      openChatInbox();
    }
  }

  function submitInput() {
    var input = document.getElementById('tx-chat-input');
    if (!input) return;
    var text = input.value;
    if (text && text.trim()) {
      sendMessage(text);
      input.value = '';
    }
    closeChatInbox();
  }

  // Hook into TerriX Engine Frame Callback
  function hookEngineFrame() {
    if (window.__TERRIX_ENGINE__ && typeof window.__TERRIX_ENGINE__.onRenderFrame === 'function') {
      if (!window.__TERRIX_CHAT_RENDER_HOOKED__) {
        window.__TERRIX_CHAT_RENDER_HOOKED__ = true;
        window.__TERRIX_ENGINE__.onRenderFrame(renderSpeechBubbles);
        console.log('[TerriX Chat] Successfully registered speech bubble render frame hook.');
      }
      return true;
    }
    return false;
  }

  // Initialize Chat Subsystem
  var isInitialized = false;
  function init() {
    if (isInitialized) return;
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
      } else {
        setTimeout(init, 30);
      }
      return;
    }
    isInitialized = true;

    ensureChatDOM();
    bindGlobalKeyboard();
    startDOMWatchers();

    // Start background poll timer
    if (!state.pollTimer) {
      state.pollTimer = setInterval(pollChatMessages, POLL_INTERVAL_MS);
    }

    // Register with TerriX Engine Frame Hook
    if (!hookEngineFrame()) {
      var checkEngineInterval = setInterval(function() {
        if (hookEngineFrame()) {
          clearInterval(checkEngineInterval);
        }
      }, 100);
    }

    // Expose public controller on window.__fx.chat
    window.__fx = window.__fx || {};
    window.__fx.chat = {
      open: openChatInbox,
      close: closeChatInbox,
      toggle: toggleChatInbox,
      send: sendMessage,
      ensureDOM: ensureChatDOM,
      getRoomId: function() { return state.currentRoomId; },
      state: state
    };
  }

  if (document.body) {
    init();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})(window, document);
