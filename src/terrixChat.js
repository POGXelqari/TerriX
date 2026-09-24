/**
 * ====================================================================
 * TerriX Client: In-Match Disposable Chat & World Bubble System
 * ====================================================================
 * Features:
 * 1. Unmoveable 3D Circle Button on HUD with speech bubble icon.
 * 2. Hotkey '/' listener to immediately focus chat input (Esc to dismiss).
 * 3. Text-only Territorial.io UI style speech bubbles anchored to player
 *    territory centroid on the world canvas (ws) that follow camera panning,
 *    zooming, and territory movement, fading out after ~6 seconds.
 * 4. Dual Authentication: CBM Member Credentials (verified badge & clan tag)
 *    and Anonymous Territorial.io in-game identity.
 * 5. Automatic deterministic match room synchronization over CBM Disposable Chat API.
 * 6. High concurrency & low CPU standard: freezes polling when document.hidden.
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
          // Take first 8 player names sorted to derive a deterministic room hash
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

    // Attempt to attach local player index
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

  // Render Speech Bubbles on World Canvas (ws)
  function renderSpeechBubbles(context) {
    window.__TERRIX_LAST_CTX__ = context;
    if (!context || !context.ws) return;

    var ws = context.ws;
    var ox = (context.offsetX !== undefined) ? context.offsetX : (window.aT ? window.aT.a0L() : 0);
    var oy = (context.offsetY !== undefined) ? context.offsetY : (window.aT ? window.aT.a0M() : 0);
    var pd = context.playerData;
    var now = performance.now();

    updateMatchRoomId(context);

    if (state.activeBubbles.length === 0) return;

    // Bounding Box Arrays from Engine
    var minXArr = pd ? (pd.jS || pd.minX) : null;
    var minYArr = pd ? (pd.jU || pd.minY) : null;
    var maxXArr = pd ? (pd.jT || pd.maxX) : null;
    var maxYArr = pd ? (pd.jV || pd.maxY) : null;
    var pTerritories = pd ? (pd.jS ? pd.hN : (pd.playerTerritories || pd.hN)) : null;

    var survivingBubbles = [];

    for (var i = 0; i < state.activeBubbles.length; i++) {
      var b = state.activeBubbles[i];
      var age = now - b.spawnTime;
      if (age > BUBBLE_LIFETIME_MS) continue; // Bubble expired

      // Compute Alpha Fade
      var alpha = 1.0;
      if (age > BUBBLE_FADE_START_MS) {
        alpha = Math.max(0.0, 1.0 - ((age - BUBBLE_FADE_START_MS) / (BUBBLE_LIFETIME_MS - BUBBLE_FADE_START_MS)));
      }

      // Resolve Player Index
      var pIdx = b.player_index;
      if (pIdx === null || pIdx === undefined) {
        if (pd && pd.rawPlayerNames) {
          for (var p = 0; p < pd.rawPlayerNames.length; p++) {
            if (pd.rawPlayerNames[p] && pd.rawPlayerNames[p].indexOf(b.sender_name) !== -1) {
              pIdx = p;
              b.player_index = p;
              break;
            }
          }
        }
      }

      // Calculate Anchor Coordinates
      var anchorX = null;
      var anchorY = null;

      if (pIdx !== null && pIdx !== undefined && minXArr && minYArr && maxXArr) {
        var minX = minXArr[pIdx];
        var minY = minYArr[pIdx];
        var maxX = maxXArr[pIdx];
        var tCount = (pTerritories && typeof pTerritories[pIdx] === 'number') ? pTerritories[pIdx] : 0;

        if (typeof minX === 'number' && typeof maxX === 'number' && typeof minY === 'number' && tCount > 0 && maxX >= minX) {
          var cx = (minX + maxX) / 2.0;
          var cy = minY;
          anchorX = ox + cx;
          anchorY = oy + cy - 14;
          state.cachedPlayerPositions[pIdx] = { x: anchorX, y: anchorY };
        }
      }

      if (anchorX === null && pIdx !== null && state.cachedPlayerPositions[pIdx]) {
        anchorX = state.cachedPlayerPositions[pIdx].x;
        anchorY = state.cachedPlayerPositions[pIdx].y;
      }

      if (anchorX === null) {
        // Fallback: Default to canvas center offset
        anchorX = (ws.canvas.width / 2.0);
        anchorY = (ws.canvas.height / 2.0) - 100 - (i * 45);
      }

      // Render Territorial.io UI style speech bubble on canvas
      drawTerritorialBubble(ws, anchorX, anchorY, b, alpha);
      survivingBubbles.push(b);
    }

    state.activeBubbles = survivingBubbles;
  }

  // Draw clean, high-performance Territorial.io UI style speech bubble
  function drawTerritorialBubble(ctx, x, y, bubble, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    var fontText = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var fontHeader = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.font = fontText;

    var textMetrics = ctx.measureText(bubble.content);
    var textWidth = Math.max(textMetrics.width, 40);

    var headerText = (bubble.sender_clan ? '[' + bubble.sender_clan + '] ' : '') + bubble.sender_name;
    if (bubble.is_cbm_verified) headerText = '✓ ' + headerText;
    ctx.font = fontHeader;
    var headerMetrics = ctx.measureText(headerText);
    var headerWidth = headerMetrics.width;

    var bubbleWidth = Math.min(Math.max(textWidth, headerWidth) + 20, 260);
    var bubbleHeight = 42;
    var bx = Math.round(x - (bubbleWidth / 2.0));
    var by = Math.round(y - bubbleHeight - 8);

    // 1. Drop shadow for readability on bright map terrain
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // 2. Draw Rounded Bubble Body
    ctx.beginPath();
    var r = 8;
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bubbleWidth - r, by);
    ctx.quadraticCurveTo(bx + bubbleWidth, by, bx + bubbleWidth, by + r);
    ctx.lineTo(bx + bubbleWidth, by + bubbleHeight - r);
    ctx.quadraticCurveTo(bx + bubbleWidth, by + bubbleHeight, bx + bubbleWidth - r, by + bubbleHeight);
    
    // Bottom triangle pointer
    var triW = 6;
    ctx.lineTo(x + triW, by + bubbleHeight);
    ctx.lineTo(x, by + bubbleHeight + 7);
    ctx.lineTo(x - triW, by + bubbleHeight);

    ctx.lineTo(bx + r, by + bubbleHeight);
    ctx.quadraticCurveTo(bx, by + bubbleHeight, bx, by + bubbleHeight - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();

    // Fill
    ctx.fillStyle = 'rgba(10, 16, 28, 0.94)';
    ctx.fill();

    // Reset shadow for crisp border & text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Border: Neon Blue if CBM Verified Member, Crisp Silver/White if Anonymous
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = bubble.is_cbm_verified ? 'rgba(0, 112, 224, 0.85)' : 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // 3. Sender Header (Clan & Name)
    ctx.font = fontHeader;
    ctx.fillStyle = bubble.is_cbm_verified ? '#60a5fa' : '#9ca3af';
    ctx.fillText(headerText, bx + 10, by + 15, bubbleWidth - 20);

    // 4. Message Text Content
    ctx.font = fontText;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(bubble.content, bx + 10, by + 32, bubbleWidth - 20);

    ctx.restore();
  }

  // Create HUD Elements (Unmoveable 3D Button + Chat Inbox Box)
  function setupDOM() {
    // 1. Inject Stylesheet
    var styleId = 'terrix-chat-styles';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        '/* Unmoveable 3D Circle Chat Button */',
        '.terrix-chat-fab {',
        '  position: fixed;',
        '  bottom: 84px;',
        '  right: 20px;',
        '  width: 44px;',
        '  height: 44px;',
        '  border-radius: 50%;',
        '  background: linear-gradient(135deg, #16243d, #0e1626);',
        '  border: 2px solid rgba(0, 112, 224, 0.45);',
        '  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25);',
        '  color: #ffffff;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  cursor: pointer;',
        '  z-index: 999998;',
        '  user-select: none;',
        '  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;',
        '}',
        '.terrix-chat-fab:hover {',
        '  transform: scale(1.08);',
        '  border-color: #60a5fa;',
        '  box-shadow: 0 6px 20px rgba(0, 112, 224, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35);',
        '}',
        '.terrix-chat-fab:active {',
        '  transform: scale(0.96);',
        '}',
        '',
        '/* Floating Chat Inbox Bar */',
        '.terrix-chat-bar {',
        '  position: fixed;',
        '  bottom: 84px;',
        '  left: 50%;',
        '  transform: translateX(-50%);',
        '  width: 480px;',
        '  max-width: calc(100vw - 32px);',
        '  background: rgba(14, 22, 38, 0.94);',
        '  backdrop-filter: blur(16px);',
        '  -webkit-backdrop-filter: blur(16px);',
        '  border: 1px solid rgba(0, 112, 224, 0.35);',
        '  border-radius: 9999px;',
        '  padding: 6px 14px;',
        '  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.65);',
        '  display: none;',
        '  align-items: center;',
        '  gap: 10px;',
        '  z-index: 999999;',
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        '}',
        '.terrix-chat-bar.open {',
        '  display: flex;',
        '  animation: txChatFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);',
        '}',
        '@keyframes txChatFadeIn {',
        '  from { opacity: 0; transform: translate(-50%, 10px); }',
        '  to { opacity: 1; transform: translate(-50%, 0); }',
        '}',
        '.terrix-chat-badge {',
        '  font-size: 11px;',
        '  font-weight: 700;',
        '  padding: 3px 8px;',
        '  border-radius: 9999px;',
        '  white-space: nowrap;',
        '}',
        '.tx-badge-cbm {',
        '  background: rgba(0, 112, 224, 0.2);',
        '  color: #60a5fa;',
        '  border: 1px solid rgba(0, 112, 224, 0.4);',
        '}',
        '.tx-badge-anon {',
        '  background: rgba(255, 255, 255, 0.08);',
        '  color: #d1d5db;',
        '  border: 1px solid rgba(255, 255, 255, 0.15);',
        '}',
        '.terrix-chat-input {',
        '  flex: 1;',
        '  background: transparent;',
        '  border: none;',
        '  outline: none;',
        '  color: #ffffff;',
        '  font-size: 13.5px;',
        '  font-family: inherit;',
        '}',
        '.terrix-chat-input::placeholder {',
        '  color: #6b7280;',
        '}',
        '.terrix-chat-send-btn {',
        '  background: #0070e0;',
        '  border: none;',
        '  border-radius: 50%;',
        '  width: 32px;',
        '  height: 32px;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  color: #ffffff;',
        '  cursor: pointer;',
        '  transition: background 0.15s ease, transform 0.1s ease;',
        '  flex-shrink: 0;',
        '}',
        '.terrix-chat-send-btn:hover {',
        '  background: #005ea6;',
        '  transform: scale(1.05);',
        '}',
        '.terrix-chat-close-btn {',
        '  background: transparent;',
        '  border: none;',
        '  color: #9ca3af;',
        '  font-size: 18px;',
        '  cursor: pointer;',
        '  line-height: 1;',
        '  padding: 0 4px;',
        '}',
        '.terrix-chat-close-btn:hover {',
        '  color: #ffffff;',
        '}'
      ].join('\n');
      (document.head || document.body).appendChild(style);
    }

    // 2. Unmoveable 3D Circle Button
    if (!document.getElementById('terrix-chat-fab')) {
      var fab = document.createElement('div');
      fab.id = 'terrix-chat-fab';
      fab.className = 'terrix-chat-fab';
      fab.title = 'In-Match Chat (Hotkey: /)';
      fab.innerHTML = [
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
        '</svg>'
      ].join('');
      fab.addEventListener('click', toggleChatInbox);
      document.body.appendChild(fab);
    }

    // 3. Floating Chat Inbox Bar
    if (!document.getElementById('terrix-chat-bar')) {
      var bar = document.createElement('div');
      bar.id = 'terrix-chat-bar';
      bar.className = 'terrix-chat-bar';
      bar.innerHTML = [
        '<span id="tx-chat-auth-badge" class="terrix-chat-badge tx-badge-anon">Guest</span>',
        '<input type="text" id="tx-chat-input" class="terrix-chat-input" placeholder="Type a message (or :gold:, :gg:)... Press Enter" maxlength="200" autocomplete="off" spellcheck="false" />',
        '<button type="button" class="terrix-chat-send-btn" id="tx-chat-send-btn" title="Send (Enter)">',
        '  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        '</button>',
        '<button type="button" class="terrix-chat-close-btn" id="tx-chat-close-btn" title="Close (Esc)">&times;</button>'
      ].join('');

      document.body.appendChild(bar);

      var input = bar.querySelector('#tx-chat-input');
      var sendBtn = bar.querySelector('#tx-chat-send-btn');
      var closeBtn = bar.querySelector('#tx-chat-close-btn');

      sendBtn.addEventListener('click', function() {
        submitInput();
      });

      closeBtn.addEventListener('click', function() {
        closeChatInbox();
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitInput();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeChatInbox();
        }
      });
    }

    // 4. Hotkey '/' Listener
    window.addEventListener('keydown', function(e) {
      if (e.key === '/' && !state.inboxOpen) {
        var active = document.activeElement;
        var tag = active ? active.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || (active && active.isContentEditable)) {
          return; // Let user type '/' inside regular text inputs
        }
        e.preventDefault();
        openChatInbox();
      } else if (e.key === 'Escape' && state.inboxOpen) {
        closeChatInbox();
      }
    });
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
    updateAuthBadge();
    var bar = document.getElementById('terrix-chat-bar');
    if (bar) {
      bar.classList.add('open');
      var input = document.getElementById('tx-chat-input');
      if (input) {
        input.value = '';
        setTimeout(function() { input.focus(); }, 20);
      }
    }
  }

  function closeChatInbox() {
    state.inboxOpen = false;
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
      closeChatInbox();
    }
  }

  // Initialize Chat Subsystem
  function init() {
    setupDOM();

    // Start background poll timer
    if (!state.pollTimer) {
      state.pollTimer = setInterval(pollChatMessages, POLL_INTERVAL_MS);
    }

    // Register with TerriX Engine Frame Hook
    var checkEngineInterval = setInterval(function() {
      if (window.__TERRIX_ENGINE__ && typeof window.__TERRIX_ENGINE__.onRenderFrame === 'function') {
        clearInterval(checkEngineInterval);
        window.__TERRIX_ENGINE__.onRenderFrame(renderSpeechBubbles);
        console.log('[TerriX Chat] Successfully registered speech bubble render frame hook.');
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
