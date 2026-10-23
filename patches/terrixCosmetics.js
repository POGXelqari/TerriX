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
        var g = (typeof dictionary !== 'undefined' && dictionary.game && window[dictionary.game]) ? window[dictionary.game] : (typeof c !== 'undefined' ? c : (typeof aE !== 'undefined' ? aE : (typeof game !== 'undefined' ? game : null)));
        var pd = (typeof dictionary !== 'undefined' && dictionary.playerData && window[dictionary.playerData]) ? window[dictionary.playerData] : (typeof y !== 'undefined' ? y : (typeof ah !== 'undefined' ? ah : (typeof playerData !== 'undefined' ? playerData : null)));
        var mh = (typeof dictionary !== 'undefined' && dictionary.mapHolder && window[dictionary.mapHolder]) ? window[dictionary.mapHolder] : (typeof gW !== 'undefined' ? gW : null);
        var tm = (typeof j1 !== 'undefined') ? j1 : (typeof ad !== 'undefined' ? ad : (typeof tileMap !== 'undefined' ? tileMap : null));
        var engineCtx = {
          ws: ws,
          a0O: a0O,
          im: (typeof im === 'number') ? im : ((typeof fu !== 'undefined') ? fu : null),
          offsetX: ox,
          offsetY: oy,
          game: g,
          playerData: pd,
          mapHolder: mh,
          tileMap: tm,
          tileManager: (typeof j1 !== 'undefined') ? j1 : null,
          gameClock: (typeof bc !== 'undefined') ? bc : (typeof au !== 'undefined' ? au : null)
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
