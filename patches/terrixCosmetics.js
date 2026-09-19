import { definePatch } from "../modUtils.js";

export default definePatch(({ replaceCode }) => {
  // Defensive a6L & TerriX Engine bridge with live render frame hook
  replaceCode(
    `this.a6L = function(g1, o7, a6E) { return (g1 * o7).toFixed(a6E); };`,
    `this.a6L = function(g1, o7, a6E) {
      var n = Number(g1);
      var val = isNaN(n) ? 0 : n;
      return (val * o7).toFixed(a6E);
    };
    window.__TERRIX_ENGINE__ = window.__TERRIX_ENGINE__ || {
      getAccountGold: function() {
        if (typeof account !== 'undefined' && account.z && account.z.aPy && account.z.aPy.y4 != null && account.z.aPy.y4 !== 0) return account.z.aPy.y4;
        if (typeof connectionMgr !== 'undefined' && connectionMgr.buffer && connectionMgr.buffer.data && connectionMgr.buffer.data[113] && connectionMgr.buffer.data[113].value !== undefined) return connectionMgr.buffer.data[113].value;
        return 0;
      },
      getAccountUsername: function() {
        if (typeof connectionMgr !== 'undefined' && connectionMgr.buffer && connectionMgr.buffer.data && connectionMgr.buffer.data[105]) return connectionMgr.buffer.data[105].value || '';
        return '';
      },
      onRenderFrameCallbacks: [],
      onRenderFrame: function(cb) { this.onRenderFrameCallbacks.push(cb); }
    };
    window.__TERRIX_HOOK_RENDER__ = function(ws, a0O, im, ox, oy) {
      if (window.__TERRIX_ENGINE__ && window.__TERRIX_ENGINE__.onRenderFrameCallbacks.length > 0) {
        var engineCtx = {
          ws: ws, a0O: a0O, im: im, offsetX: ox, offsetY: oy,
          game: typeof aE !== 'undefined' ? aE : (typeof game !== 'undefined' ? game : null),
          playerData: typeof ah !== 'undefined' ? ah : (typeof playerData !== 'undefined' ? playerData : null),
          tileMap: typeof ad !== 'undefined' ? ad : (typeof tileMap !== 'undefined' ? tileMap : null),
          gameClock: typeof au !== 'undefined' ? au : (typeof gameClock !== 'undefined' ? gameClock : null)
        };
        for (var i = 0; i < window.__TERRIX_ENGINE__.onRenderFrameCallbacks.length; i++) {
          try {
            window.__TERRIX_ENGINE__.onRenderFrameCallbacks[i](engineCtx);
          } catch(e) { console.error("[TerriX Engine Hook Error]", e); }
        }
      }
    };`
  );
});
