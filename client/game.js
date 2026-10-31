var pv,
  dE,
  a5D,
  a5E,
  vL,
  vM,
  u2,
  iw,
  eQ,
  e5,
  e4,
  e7,
  aJr,
  aJq,
  aJs,
  aK7,
  aK5,
  aJf,
  aJt,
  aOf,
  aKA,
  aOg,
  aOh,
  aOi,
  aJp,
  c8,
  ct,
  tV,
  gy,
  gu,
  hI,
  vH,
  vI,
  acE,
  eu,
  my,
  fA,
  tA,
  h7,
  hK,
  hB,
  qA,
  uF,
  h6,
  h2,
  gG,
  hJ,
  u7,
  mF,
  jE,
  dQ,
  d5,
  lA,
  gw,
  di,
  d3,
  n8,
  v8,
  da,
  a7y,
  eI,
  pC,
  gv,
  gz,
  vD,
  aEE,
  q9,
  vF,
  aI6,
  hL,
  hC,
  hO,
  d9,
  iW,
  h3,
  aF,
  gt,
  aan,
  aEz,
  gx,
  hA,
  a7Z,
  hN,
  h8,
  ad,
  gD,
  gF,
  aR,
  bG,
  hM,
  bc,
  br,
  bs,
  aZ,
  ft,
  aRB,
  a5t,
  zK,
  he,
  dr,
  h0,
  k3,
  h5,
  p9,
  nH,
  fU,
  aIC,
  aq,
  hG,
  h4,
  aR3,
  aFx,
  uE,
  uD,
  aA4,
  gJ,
  lS,
  hD,
  vK,
  dy,
  ey,
  hE,
  cA,
  be,
  b6,
  nT,
  a71,
  ov,
  a0g,
  aI,
  a0B,
  nr,
  v4,
  aQZ,
  kl,
  mT,
  S = ["div", "100%", "⬅️ ", "absolute", "canvas", "0.75em", "none", "<br>", "inherit", "0.8em", "rgb(", "center", "auto", "rgba(", "   ", "flex", "hidden", "span", "1em", "0.5em", "email", "Data", " / ", "territorial.io", "click", "pre", "password", "input", "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==", "function", "undefined", "middle", "break-word", "Escape", "50%", "0.6em", "underline", "text", "scroll", "pointer", "bold", "Value", "Player ", "Enter", "1.5em", "0.4em", "' target='_blank'>", "🔄 Reload", "string", "rgba(0,0,0,0.8)", "pre-wrap", "orange", "number", "nowrap", "mouseleave", "keydown", "inline-block", "game.territorial.io", "focus", "fixed", "button", "blur", "aria-label", "Space", "Reload", "Redacted ", "Gold Seizure", "<a href='", "</a>", "100,100,100", "1.2em", "1.0em", "0px", "0.3em", "0.0em 0.9em", " voted with ", "  • ", "   Gold: ", "⚠️ ", "wheel", "true", "translate(-50%, -50%)", "top", "tls7", "system-ui", "style", "rgba(140,10,10,0.75)", "rgba(100,0,0,0.8)", "rgba(10,140,10,0.75)", "rgba(0,100,0,0.8)", "rgba(0,", "rgb(10,220,10)", "placeholder", "mouseover", "mouseout", "long", "logo", "loading", "italic ", "https://territorial.io/", "file", "error", "en-US", "dotted", "data:image/png;base64,", "column", "break-all", "blur(4px)", "aria-pressed", "arena", "account", "accept", "_blank", "[Redacted Message]", "Zombie", "Seed", "Remove Punishments", "Patreon", "Interest", "False Reporter", "Close", "Cheater", "Bot ", "Block Account", "Battle Royale", "Ban IP", "Back", "Audit Log", "Arial Black, system-ui", "@room", "255,255,255", "1v1", "1px 1px 0 lightgray", "1px -1px 0 lightgray,", "1 Minute", "1 Hour", "1 Day", "0em", "000", "0.4em 0em", "0.2em", "0,0,0", "/wiki/transactions", "/wiki/clans", "/privacy", ". Duration: x", "-1px 1px 0 lightgray,", "-1px -1px 0 lightgray,", ",0,0.85)", " solid white;}", " Rank: ", " / 180", " / 160", " -> ", "   Contest"];
function a() {
  this.b = new c(), this.d = new e(), this.f = new g(), this.h = new i(), this.j = new k(), this.l = new m(), this.canvas = new n(), this.color = new o(), this.p = new q(), this.r = function () {
    this.b.s();
  };
}
function t() {
  var u = 0,
    v = "",
    w = 0,
    x = 0,
    y = 0;
  function a2(aE) {
    aF.aG.aH(3, aE);
  }
  function aC(aL) {
    u = 1, aI.message.aJ({
      id: 6,
      value: aL
    });
  }
  function a5(a0) {
    var ai = new RegExp("\\B@[-\\w\\[\\]]+", "g");
    return a0.match(ai);
  }
  this.z = function (a0) {
    var a1, a6, a8;
    if (u) return u = 0, "yes" === (a1 = a0.toLowerCase()) || "y" === a1 ? void a2(v) : void aI.message.aJ({
      id: 5,
      aK: 7
    });
    !(a0.indexOf("@") < 0) && (a1 = a5(a0)) ? (v = a0, a6 = function (a4) {
      for (var aM = a4.length, aP = [0, 0, 0, 0], aN = 0; aN < aM; aN++) for (var aO = a4[aN], aQ = 0; aQ < 4; aQ++) aO === "@room" + (aQ + 1) && (aP[aQ] = 1);
      if ((x = aR.d.aS(aP)) % 4 == 0) return aR.d.aT(aI.aU.aV);
      for (aQ = 0; aQ < 4; aQ++) aP[aQ] = aP[aQ] ? aI.aU.aV[aQ] : [];
      return aR.d.aT(aP);
    }(a1), function (a4, a8, a0) {
      if (!w) return;
      for (var aM = a8.length, aN = 0; aN < aM; aN++) 2 === a8[aN].id && (a0 = a0.replace(a4[a8[aN].af], "@" + a8[aN].aY));
      return u = 1, a2((v = a0).slice(0, 126) + "|"), 1;
    }(a1, a8 = function (a4) {
      for (var a8 = [], aM = (y = w = 0, a4.length), aN = 0; aN < aM; aN++) {
        var aO = a4[aN],
          aW = aO.length;
        aR.h.startsWith(aO, "@[") ? aW <= 9 && aR.h.aX(aO, "]") && a8.push({
          id: 0,
          aY: aO.substring(2, aW - 1).toUpperCase()
        }) : 6 === aW ? aR.h.startsWith(aO, "@room") || (y++, a8.push({
          id: 1,
          aY: aZ.aa.ab(aO.substring(1), 5)
        })) : 1 < aW && aW < 5 && 0 <= (aW = ad.data.ae(aO.substring(1))) && (a8.push({
          id: 2,
          aY: aW,
          af: aN
        }), w = 1);
      }
      return a8;
    }(a1), a0) || (0 === a8.length ? x || function (a4) {
      for (var aM = a4.length, aN = 0; aN < aM; aN++) {
        var aO = a4[aN];
        if ("@all" === aO || "@everyone" === aO) return 1;
      }
      return;
    }(a1) ? aC(a6.length) : a2(a0) : a1.length === y ? a2(a0) : (function (a6, a8) {
      var aW = a8.length;
      if (0 === aW) return;
      var aM = a6.length;
      loop: for (var aN = aM - 1; 0 <= aN; aN--) {
        for (var aQ = 0; aQ < aW; aQ++) if (0 === a8[aQ].id) {
          if (a8[aQ].aY === aR.h.ag(a6[aN].username)) continue loop;
        } else if (1 === a8[aQ].id && a8[aQ].aY === a6[aN].ah) continue loop;
        a6[aN] = a6[--aM], a6.pop();
      }
    }(a6, a8), aC(a6.length)))) : a2(a0);
  }, this.aj = function (a0) {
    var a4 = a5(a0);
    if (a4) for (var ak = new RegExp("^[0-9]+$"), aM = a4.length, aN = 0; aN < aM; aN++) {
      var aO = a4[aN].substring(1),
        aW = aO.length;
      1 <= aW && aW <= 3 && ak.test(aO) && (aW = parseInt(aO, 10), !isNaN(aW)) && 0 <= aW && aW < ad.data.a6.length && (a0 = a0.replace("@" + aO, "@" + ad.data.a6[aW]));
    }
    return a0;
  };
}
function al() {
  var am, an, aw;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(0), [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })]), an = new at(am.au, ((aw = []).push(function () {
    function bC() {
      bD.button.textContent = L(5), b9.b7.readOnly = !1, bB.b7.readOnly = !1, bE.bF(1), bE.button.style.color = bG.bH;
    }
    var ay = new az(),
      b4 = (ay.b0(aF.b1.b2("/wiki/transactions"), "0.75em").style.marginBottom = "0.8em", ay.b3(L(2)), new b5({
        value: b6.buffer.data[105].value,
        af: -1
      })),
      b9 = (b4.b7.readOnly = !0, ay.b8(b4), ay.b3(L(3), "0.8em"), new b5(b6.buffer.data[148], 0, void 0, function (b7) {
        bA(b6.buffer.data[149].value, b7.target.value);
      })),
      bB = (ay.b8(b9), ay.b3(L(4), "0.8em"), new b5(b6.buffer.data[149], 1, void 0, function (b7) {
        bA(b7.target.value, b6.buffer.data[148].value);
      })),
      bD = (ay.b8(bB), new ap(L(5), function (b7) {
        return b7.textContent === L(5) ? (b7.textContent = L(6), b9.b7.readOnly = !0, bB.b7.readOnly = !0, bE.bF(0), bE.button.style.color = bG.bI, b6.bJ.bK(149, bB.b7.value), bA(b6.buffer.data[149].value, b6.buffer.data[148].value)) : bC(), !0;
      })),
      bE = (ay.b8(new bL([bD.button])), new ap(L(7), function (b7) {
        return b9.b7.readOnly && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.bP({
          action: 0,
          ah: b6.buffer.data[148].value,
          value: parseInt(b6.buffer.data[149].value, 10)
        })), !0;
      }, 1)),
      bQ = ay.bR(),
      bA = (ay.bR(L(8)).style.fontWeight = "bold", function (aY, bS) {
        bQ.innerHTML = aq.b1.bT(aY, b6.buffer.data[105].value, bS);
      });
    return ay.b8(new bL([bE.button])), bA(b6.buffer.data[149].value, b6.buffer.data[148].value), ay;
  }()), aw));
}
function bZ() {
  this.ba = function (bb) {
    var cE;
    bc.bd(55 + be.bf.bg()), bc.bh(1, 0), bc.bh(6, 13), bc.bh(14, c8.c9), bc.bh(4, cA.id), bc.bh(7, cA.cB), bc.bh(1, +c8.cC), bc.bh(1, +c8.cD), bc.bh(5, new Date().getHours() % 24), cE = ad.cF(), bc.bh(8, cE[0]), bc.bh(8, cE[1]), be.bf.bj(), aF.b1.send(bb, bc.bk);
  }, this.bl = function (bb, bm, bn, bo) {
    bc.bd(70), bc.bh(1, 0), bc.bh(6, 30), bc.bh(3, bn), bc.bh(30, bm), bc.bh(30, bo), aF.b1.send(bb, bc.bk);
  }, this.bp = function (bq) {
    br.r(), br.bh(1, 0), br.bh(6, 6), bs.bt.bj(bq, 16, br), aF.b1.send(aF.b1.bu, br.bv());
  }, this.bw = function (id) {
    bc.bd(13), bc.bh(1, 0), bc.bh(6, 15), bc.bh(6, id), aF.b1.send(0, bc.bk);
  }, this.bx = function (id, value) {
    bc.bd(43), bc.bh(1, 0), bc.bh(6, 3), bc.bh(6, id), bc.bh(30, value), aF.b1.send(0, bc.bk);
  }, this.by = function (id, bS) {
    var aM = Math.min(bS.length, 63);
    bc.bd(19 + 16 * aM), bc.bh(1, 0), bc.bh(6, 26), bc.bh(6, id), bc.bh(6, aM), bs.bz.c0(bS), aF.b1.send(0, bc.bk);
  }, this.c1 = function (c2, c3) {
    bc.bd(7 + 26 * c3.length), bc.bh(1, 0), bc.bh(6, 9);
    for (var aN = 0; aN < c3.length; aN++) bc.bh(16, c3[aN][0]), bc.bh(10, c3[aN][1]);
    aF.b1.send(c2, bc.bk);
  }, this.c4 = function (c5, c6) {
    bc.bd(20), bc.bh(1, 0), bc.bh(6, 19), bc.bh(1, c5), bc.bh(12, c6), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.cG = function (username) {
    bc.bh(5, username.length), bs.bz.c0(username);
  }, this.cH = function (cI, cJ, bb, pow) {
    bc.bd(88), bc.bh(1, 0), bc.bh(6, 8), bc.bh(3, pow.bn), bc.bh(30, pow.bm), bc.cK(32, cJ), bc.bh(16, cI), aF.b1.send(bb, bc.bk);
  };
}
function cL() {
  var cM,
    cN,
    cO,
    cP,
    cQ,
    cR,
    cS,
    cT,
    cU,
    cV,
    cW,
    cX,
    cY,
    cZ,
    ca,
    cb,
    cc,
    cd,
    cf,
    cg,
    ch,
    ci,
    cj,
    cp,
    cq,
    ce = null,
    cl = 0,
    cm = !1,
    cn = new Float32Array(4),
    co = 0,
    cr = 112,
    cs = 0;
  function cw() {
    cU = Math.floor(+d9.dC), cV = Math.floor(.5 * cU), ce.width = d9.aO, ce.height = d9.dA, cf = ce.getContext("2d", {
      alpha: !0
    }), aR.b.textAlign(cf, 1), aR.b.textBaseline(cf, 1), cf.imageSmoothingEnabled = !0;
  }
  function cx() {
    var aN, dD;
    for (dE.font = aR.b.dF(1, 100 * cW), dD = 80 / Math.floor(dE.measureText(aR.h.dG(ct.dH)).width), dE.font = aR.b.dF(1, 100), aN = ct.cv - 1; 0 <= aN; aN--) cT[aN] = 100 / Math.floor(dE.measureText(d3.dI[aN]).width), cS[aN] = Math.min(dD, cT[aN]);
  }
  function dJ(aN) {
    return !cs || (aN = d3.dL[aN]) < 1e6 ? 1 : aN < 1e7 ? cn[0] : cn[Math.min(Math.floor(Math.log10(aN)) - 6, 3)];
  }
  function dB(e2) {
    cm = !1, cl = dy.dz, cd = !1, cc = 1, ca = cb = 0, e2.clearRect(0, 0, d9.aO, d9.dA);
    for (var eA, eB, aN, eC, fontSize, eD, e3 = e4 / e5, e6 = e7 / e5, e8 = (d9.aO + e4) / e5, e9 = (d9.dA + e7) / e5, eE = 0 !== d3.eF[ct.eG] && !aR.f.eH(ct.eG), aQ = eI.eJ - 1; 0 <= aQ; aQ--) aN = eI.eK[aQ], (fontSize = Math.floor(cZ * e5 * dJ(aN) * cS[aN] * cQ[aN])) < cY || cU <= fontSize || cO[aN] + cQ[aN] > e3 && cO[aN] < e8 && cP[aN] + cR[aN] > e6 && cP[aN] < e9 && (eA = Math.floor(d9.aO * (cO[aN] + cQ[aN] / 2 - e3) / (e8 - e3)), eB = Math.floor(d9.dA * (cP[aN] + cR[aN] / 2 - e6) / (e9 - e6) - .1 * fontSize), eC = d5.d6[aN], e2.font = aR.b.dF(1 === d3.eL[aN] ? 4 : 1, fontSize), e2.fillStyle = eM(fontSize, eC % 2), cs ? eN(e2, aN, fontSize, eA, eB, eC) : eO(aN, fontSize, eA, eB, e2), cd = !0, 0 < ch[aN] ? function (eA, eB, fontSize, aN, e2) {
      0 === eQ[aN] ? da.db.dc(cg[aN]) ? (function (eA, eB, fontSize, player, ek, e2) {
        for (var ee = eB, ew = (e2.globalAlpha = ef(fontSize), dJ(player) * (cs ? co : cT[player])), ed = eA - .5 * fontSize / ew - .9 * fontSize, ex = 0; ex < 2; ex++) e2.fillText(da.db.er(ek), ed, ee), ed = eA + .5 * fontSize / ew + .9 * fontSize;
        e2.globalAlpha = 1;
      }(eA, eB, fontSize, aN, cg[aN], e2), eR(eA, eB, fontSize, 0, 0, e2)) : da.db.ei(cg[aN]) ? (ej(eA, eB, fontSize, cg[aN], 0, e2), eR(eA, eB, fontSize, 0, 1, e2)) : (ej(eA, eB, fontSize, cg[aN], 1, e2), eR(eA, eB, fontSize, 1, 0, e2)) : ej(eA, eB, fontSize, cg[aN], 0, e2);
    }(eA, eB, fontSize, aN, e2) : 0 === eQ[aN] && eR(eA, eB, fontSize, 0, 0, e2), eE && (0 < ch[aN + ct.cv] || 0 < ch[aN + 2 * ct.cv] || 0 < ch[aN + 3 * ct.cv] || 0 < ch[aN + 4 * ct.cv]) && function (eA, eB, fontSize, aN, e2) {
      var bW,
        aL = -1;
      for (bW = 4; 1 <= bW; bW--) 0 < ch[aN + bW * ct.cv] && aL++;
      for (bW = 1; bW < 5; bW++) 0 < ch[aN + bW * ct.cv] && (!function (eA, eB, fontSize, bW, aN, ea, eZ, e2) {
        var es;
        if (1 === bW) {
          aN = cg[aN + ct.cv];
          if (!da.db.em(aN)) return function (eA, eB, fontSize, ek, ea, e2) {
            e2.globalAlpha = ef(fontSize);
            eA -= .534 * ea * fontSize, ea = eB + 1.59 * fontSize;
            e2.font = aR.b.dF(0, .785 * fontSize), e2.fillText(da.db.er(ek), eA, ea), e2.globalAlpha = 1;
          }(eA, eB, fontSize, aN, ea, e2);
          es = da.en.ep[aN - 1024 + da.db.eq];
        } else es = 2 === bW ? eu.ev()[4].canvas[+(eZ < 255)] : (3 === bW ? eu.ev()[5] : eu.ev()[6]).canvas[0];
        aN = da.en.eo, eZ = .8 * fontSize / aN, bW = eA - .5 * eZ * aN - .534 * ea * fontSize, eA = eB + 1.4 * eZ * aN;
        e2.setTransform(eZ, 0, 0, eZ, bW, eA), e2.globalAlpha = ef(fontSize), e2.drawImage(es, 0, 0), e2.globalAlpha = 1, e2.setTransform(1, 0, 0, 1, 0, 0);
      }(eA, eB, fontSize, bW, aN, aL, ch[aN + bW * ct.cv], e2), aL -= 2);
    }(eA, eB, fontSize, aN, e2), (eD = cW * fontSize) < cY || (e2.font = aR.b.dF(1, eD), eB += Math.floor(.78 * fontSize), cs ? eO(aN, eD, eA, eB, e2) : eN(e2, aN, eD, eA, eB, eC)));
  }
  function eO(aN, fontSize, eT, eU, e2) {
    var ___id = aN;
    var showName = aN < ct.dP || !__fx.settings.hideBotNames;
    if (showName) e2.fillText(d3.dI[aN], eT, eU), aN < ct.dP && 2 !== d3.eL[aN] || (aN = fontSize / cT[aN], e2.fillRect(eT - .5 * aN, eU + aR.b.eW * fontSize, aN, Math.max(1, .1 * fontSize)));
    cs && __fx.settings.showPlayerDensity && (__fx.settings.coloredDensity && (e2.fillStyle = __fx.utils.textStyleBasedOnDensity(___id)), e2.fillText(__fx.utils.getDensity(___id), eT, showName ? eU + fontSize : eU));
  }
  function eN(e2, aN, fontSize, eA, eB, eC) {
    var eX = d3.eX[aN],
      eY = aR.h.dG(d3.dL[aN] - eX);
    function drawDensity() {
      !cs && __fx.settings.showPlayerDensity && (__fx.settings.coloredDensity && (e2.fillStyle = __fx.utils.textStyleBasedOnDensity(aN)), e2.fillText(__fx.utils.getDensity(aN), eA, eB + fontSize));
    }
    eX ? (eX = e2.fillStyle, e2.fillStyle = eM(fontSize, 2 + eC % 2), e2.fillText(eY, eA, eB), e2.fillStyle = eX) : eC >> 1 & 1 ? (e2.lineWidth = .05 * fontSize, e2.strokeStyle = eM(fontSize, eC % 2), e2.strokeText(eY, eA, eB)) : (1 < eC && (e2.lineWidth = .12 * fontSize, e2.strokeStyle = eM(fontSize, eC), e2.strokeText(eY, eA, eB)), e2.fillText(eY, eA, eB)), drawDensity();
  }
  function eR(eA, eB, fontSize, ea, eb, e2) {
    var ec = .95 * fontSize / cj,
      eA = eA - .5 * ec * ci + .8 * ea * fontSize,
      ea = eB - 1.76 * ec * cj - (.35 - aR.b.eW + .7) * eb * fontSize;
    e2.setTransform(ec, 0, 0, ec, eA, ea), e2.globalAlpha = ef(fontSize), e2.drawImage(dQ.get(4), 0, 0), e2.globalAlpha = 1, e2.setTransform(1, 0, 0, 1, 0, 0);
  }
  function ej(eA, eB, fontSize, ek, ea, e2) {
    var el, ed, ec;
    e2.globalAlpha = ef(fontSize), da.db.em(ek) ? (el = da.en.eo, e2.setTransform(ec = 1.1 * fontSize / el, 0, 0, ec, ed = eA - .5 * ec * el - .8 * ea * fontSize, ec = eB - 1.55 * ec * el), e2.drawImage(da.en.ep[ek - 1024 + da.db.eq], 0, 0), e2.setTransform(1, 0, 0, 1, 0, 0)) : (ed = eA - .8 * ea * fontSize, ec = eB - (.35 - aR.b.eW + 1) * fontSize, e2.fillText(da.db.er(ek), ed, ec)), e2.globalAlpha = 1;
  }
  function eM(fontSize, eC) {
    return cV <= fontSize && fontSize < cU ? ey.ez[eC] + ef(fontSize).toFixed(3) + ")" : ey.f0[eC];
  }
  function ef(fontSize) {
    return cV <= fontSize && fontSize < cU ? 1 - (fontSize - cV) / (cU - cV) : 1;
  }
  function fJ(ew, aO) {
    return 1 + Math.floor(cX * ew * aO);
  }
  function fG(aN) {
    for (var left = cO[aN], aQ = cO[aN] - d3.dM[aN] - 1; 0 <= aQ; aQ--) if (!fQ(aN, --left, cP[aN], cR[aN])) {
      left++;
      break;
    }
    var right = cO[aN];
    for (aQ = d3.dS[aN] - cO[aN] - cQ[aN]; 0 <= aQ; aQ--) if (!fQ(aN, ++right + cQ[aN] - 1, cP[aN], cR[aN])) {
      right--;
      break;
    }
    var eT = Math.floor((left + right) / 2),
      top = cP[aN];
    for (aQ = cP[aN] - d3.dN[aN] - 1; 0 <= aQ; aQ--) if (!fR(aN, eT, --top, cQ[aN])) {
      top++;
      break;
    }
    var bottom = cP[aN];
    for (aQ = d3.dT[aN] - cP[aN] - cR[aN]; 0 <= aQ; aQ--) if (!fR(aN, eT, ++bottom + cR[aN] - 1, cQ[aN])) {
      bottom--;
      break;
    }
    var eU = Math.floor((top + bottom) / 2);
    fD(aN, eT, eU, cQ[aN], cR[aN]) && (cO[aN] = eT, cP[aN] = eU);
  }
  function fD(player, eT, eU, aO, dA) {
    fS = Math.floor(.2 * aO);
    for (var fS, bW = eT + aO - 1; eT <= bW; bW--) if (!fQ(player, bW, eU, dA)) return;
    for (bW = eU + dA - 1 - (fS = (fS = Math.floor(.25 * dA)) < 1 ? 1 : fS); eU + fS <= bW; bW--) if (!fR(player, eT, bW, aO)) return;
    return 1;
  }
  function fQ(player, eT, eU, dA) {
    return d5.fT(player, 4 * (eU * fU.fV + eT)) && d5.fT(player, 4 * ((eU + dA - 1) * fU.fV + eT));
  }
  function fR(player, eT, eU, aO) {
    return d5.fT(player, 4 * (eU * fU.fV + eT)) && d5.fT(player, 4 * (eU * fU.fV + eT + aO - 1));
  }
  this.r = function () {
    if (cs = b6.buffer.data[7].value || 8 === ct.cu, cd = !1, cZ = .88, cW = .5, cX = 1.8, cY = 12 - 3 * b6.buffer.data[9].value, cN = cM = 0, cO = new Uint16Array(ct.cv), cP = new Uint16Array(ct.cv), cQ = new Uint16Array(ct.cv), cR = new Uint16Array(ct.cv), cS = new Float32Array(ct.cv), cT = new Float32Array(ct.cv), cg = new Uint16Array(2 * ct.cv), ch = new Uint8Array(5 * ct.cv), cp = new Uint8Array(ct.cv), cq = new Uint8Array(ct.cv), ce = ce || document.createElement("canvas"), cw(), cb = ca = 0, cc = 1, cs) {
      var aN, dD;
      for (cx(), dE.font = aR.b.dF(1, 100), dD = 100 / Math.floor(dE.measureText("900 000").width), aN = ct.cv - 1; 0 <= aN; aN--) cS[aN] = Math.min(dD, 2 * cT[aN]);
      co = dD, cn[0] = 100 / (dD * Math.floor(dE.measureText("5 000 000").width)), cn[1] = 100 / (dD * Math.floor(dE.measureText("50 000 000").width)), cn[2] = 100 / (dD * Math.floor(dE.measureText("500 000 000").width)), cn[3] = 100 / (dD * Math.floor(dE.measureText("1 000 000 000").width));
    } else cx();
    !function () {
      var aN;
      for (aN = ct.cv - 1; 0 <= aN; aN--) d3.d4[aN] < 12 ? (cO[aN] = d3.dM[aN] + 1, cP[aN] = d3.dN[aN] + 1, cQ[aN] = 1, cR[aN] = 1) : (cO[aN] = d3.dM[aN], cP[aN] = d3.dN[aN] + 1, cQ[aN] = 4, cR[aN] = 2);
      if (ct.dO) for (aN = 0; aN < ct.dP; aN++) cQ[aN] = 0;
      ci = dQ.get(4).width, cj = dQ.get(4).height;
    }();
  }, this.d0 = function (d1, d2) {
    d2 > 18 * d3.d4[d1] ? (cq[d1] = 6, d5.d6[d1] = 2 + d5.d6[d1] % 2) : (cp[d1] = 4, (d5.d6[d1] < 2 || 3 < d5.d6[d1]) && (d5.d6[d1] = 6 + d5.d6[d1] % 2));
  }, this.d7 = function (d1, d2) {
    d2 > 6 * d3.d4[d1] ? (cq[d1] = 6, d5.d6[d1] = 4 + d5.d6[d1] % 2) : (cp[d1] = 4, (d5.d6[d1] < 4 || 5 < d5.d6[d1]) && (d5.d6[d1] = 8 + d5.d6[d1] % 2));
  }, this.resize = function () {
    cw(), dB(cf);
  }, this.dR = function () {
    for (var aN = 0; aN < ct.dP; aN++) d3.dS[aN] - d3.dM[aN] != 3 || d3.dT[aN] - d3.dN[aN] != 3 ? (cO[aN] = d3.dM[aN] + (d3.dS[aN] !== d3.dM[aN] ? 1 : 0), cP[aN] = d3.dN[aN], cQ[aN] = 1, cR[aN] = 1) : (cO[aN] = d3.dM[aN], cP[aN] = d3.dN[aN] + 1, cQ[aN] = 4, cR[aN] = 2);
  }, this.dU = function (player, af, dV) {
    !function (player, af, dV) {
      player += af * ct.cv;
      0 === af ? cg[player] === dV && 0 < ch[player] ? ch[player] = 0 : (cg[player] = dV, ch[player] = da.db.dc(dV) ? 255 : 64) : 1 === af ? (ch[player] = 64, cg[player] = dV) : ch[player] = dV;
    }(player, af, dV), 2 === ct.dX && this.dY(!0);
  }, this.dd = function () {
    cd && (1 !== cc ? (dE.imageSmoothingEnabled = !0, dE.setTransform(cc, 0, 0, cc, 0, 0), dE.drawImage(ce, -ca / cc, -cb / cc), dE.setTransform(1, 0, 0, 1, 0, 0), dE.imageSmoothingEnabled = !1) : dE.drawImage(ce, -ca, -cb));
  }, this.de = function (df, dg) {
    ca += df, cb += dg;
  }, this.dh = function (df, dg) {
    di.de(df, dg);
  }, this.zoom = function (dj, dk, dl) {
    cc *= dj, ca = (ca + dk) * dj - dk, cb = (cb + dl) * dj - dl;
  }, this.dp = function (player) {
    var dM = d3.dM[player],
      dS = d3.dS[player],
      dN = d3.dN[player],
      dT = d3.dT[player],
      dq = dr.ds(0),
      dt = dr.du(0),
      dv = dr.ds(d9.aO),
      dw = dr.du(d9.dA);
    dM < dv && dq < dS && dN < dw && dt < dT && (cQ[player] = 0, cm = !0);
  }, this.dY = function (dx) {
    return !(!cm && !dx && dy.dz < cl + (1 === cc && 0 === ca && 0 === cb && (ct.dn() || ct.dO || 2 === ct.dX) ? 1e3 : cr) || (dB(cf), 0));
  }, this.e0 = function (aN) {
    return dJ(aN) * cS[aN];
  }, this.e1 = function (player) {
    return cS[player];
  }, this.f1 = function () {
    dy.f2() % 10 == 9 && (cm = cm || ct.f3() && !ct.dn()), !ct.dn() && 4 <= ++cN && function () {
      var aN, aQ, ex;
      for (cN = 0, ex = 4; 1 <= ex; ex--) for (aQ = eI.eJ - 1; 0 <= aQ; aQ--) aN = eI.eK[aQ] + ex * ct.cv, 0 < ch[aN] && ch[aN] < 255 && ch[aN]--;
      if (2 !== ct.dX) for (aQ = eI.eJ - 1; 0 <= aQ; aQ--) aN = eI.eK[aQ], 0 < ch[aN] && ch[aN] < 255 && ch[aN]--;
    }();
    var aN,
      aQ,
      aM = Math.floor(.1 * eI.eJ);
    for (aM = (aM = aM < 8 ? 8 : aM) > eI.eJ ? eI.eJ : aM, aN = cM + aM - 1; cM <= aN; aN--) aQ = aN % eI.eJ, !function (aN) {
      var ew = dJ(aN) * cS[aN];
      0 < cQ[aN] && fD(aN, cO[aN], cP[aN], cQ[aN], cR[aN]) ? !function (aN) {
        for (var eT, eU, aO, dA, fK = !1, ex = 0; ex < 8; ex++) {
          if (aO = cQ[aN] + 2, dA = cR[aN] + 2, aO > d3.dS[aN] - d3.dM[aN] + 1 || dA > d3.dT[aN] - d3.dN[aN] + 1) return fK;
          if (eT = cO[aN] - 1, eU = cP[aN] - 1, !fD(aN, eT, eU, aO, dA)) return fK;
          cO[aN] = eT, cP[aN] = eU, cQ[aN] = aO, cR[aN] = dA, fK = !0;
        }
        return fK;
      }(aN) && function (aN, ew) {
        for (var eT, eU, aO, dA, fK = !1, fL = cQ[aN], fM = 1 + Math.floor(.02 * fL), ex = 1; ex < 5; ex++) {
          if ((aO = fL + ex * fM) > d3.dS[aN] - d3.dM[aN] + 1) return fK;
          if ((dA = fJ(ew, aO)) > d3.dT[aN] - d3.dN[aN] + 1) return fK;
          eT = d3.dM[aN] + Math.floor(Math.random() * (d3.dS[aN] - d3.dM[aN] + 2 - aO)), eU = d3.dN[aN] + Math.floor(Math.random() * (d3.dT[aN] - d3.dN[aN] + 2 - dA)), fD(aN, eT, eU, aO, dA) && (cO[aN] = eT, cP[aN] = eU, cQ[aN] = aO, cR[aN] = dA, fK = !0);
        }
        return fK;
      }(aN, ew) && fG(aN) : !function (aN, ew) {
        var dA,
          eT = cO[aN] + 1,
          eU = cP[aN] + 1,
          aO = cQ[aN] - 2;
        for (;;) {
          if (aO < 1) {
            cQ[aN] = 0;
            break;
          }
          if (dA = fJ(ew, aO), fD(aN, eT, eU, aO, dA)) return cO[aN] = eT, cP[aN] = eU, cQ[aN] = aO, cR[aN] = dA, 1;
          eT++, eU++, aO -= 2;
        }
        return;
      }(aN, ew) ? function (aN, ew) {
        var eT,
          eU,
          aO,
          dA,
          ex,
          fN,
          fO = d3.dS[aN] - d3.dM[aN] + 1,
          fP = Math.floor(.02 * fO);
        for (fN = -6 * (fP = fP < 1 ? 1 : fP), ex = fO; fN <= ex; ex -= fP) if (dA = fJ(ew, aO = 0 < ex ? ex : 1), eT = d3.dM[aN] + Math.floor(Math.random() * (d3.dS[aN] - d3.dM[aN] + 2 - aO)), eU = d3.dN[aN] + Math.floor(Math.random() * (d3.dT[aN] - d3.dN[aN] + 2 - dA)), fD(aN, eT, eU, aO, dA)) return cO[aN] = eT, cP[aN] = eU, cQ[aN] = aO, cR[aN] = dA;
      }(aN, ew) : fG(aN);
    }(eI.eK[aQ]);
    cM = (cM += aM) % eI.eJ;
  }, this.f6 = function () {
    var aN, d1, f7, f8;
    if (dy.f2() % 4 == 1) for (aN = eI.eJ - 1; 0 <= aN; aN--) d1 = eI.eK[aN], d5.d6[d1] < 2 || ((f7 = Math.max(cp[d1] - 1, 0)) === (f8 = Math.max(cq[d1] - 1, 0)) ? 0 === f7 && (d5.d6[d1] %= 2) : 0 === f8 && d5.d6[d1] < 6 && (d5.d6[d1] += 4), cp[d1] = f7, cq[d1] = f8);
  }, this.f9 = function (player) {
    var aN = player + 2 * ct.cv,
      eZ = ch[aN];
    return 0 < eZ && (fA.fB(50, player), ch[aN] = 0, 255 === eZ);
  }, this.fC = function (player) {
    return 255 === ch[player + 2 * ct.cv];
  };
}
function fW(fX, data, fY) {
  var aM = data.fZ.length,
    fa = document.createElement("div"),
    fb = document.createElement("div"),
    fc = document.createElement("div"),
    fd = new Array(aM),
    aw = new Array(aM),
    fe = new Array(data.ff.length),
    fg = aR.color.fh(70, 70, 0, .35);
  function fp() {
    this.style.backgroundColor = aR.color.fp(fg, 160);
  }
  function fq() {
    this.style.backgroundColor = fg;
  }
  function cw() {
    var aQ;
    for (fX.style.font = aR.b.dF(0, aR.b.g0(.026, .5, .03)), aN = 1; aN < fe.length; aN++) aR.b.g1(fe[aN], 4);
    if (aR.b.g1(fa, 2), aM) {
      for (var g4, g2 = fa.offsetWidth, g3 = fc.offsetWidth, aN = 0; aN < fe.length; aN++) g4 = .01 * data.fo[aN] * g3, fe[aN].style.width = (100 * g4 / g2).toFixed(2) + "%";
      var aW = data.fZ[0].length;
      for (aN = 0; aN < aM; aN++) for (aR.b.g1(fd[aN], 2), aQ = 1; aQ < aW; aQ++) aR.b.g1(aw[aN][aQ], 4);
      fb.fi && (fb.scrollTop = fb.fi);
    }
  }
  this.resize = function () {
    cw(), cw();
  }, fX.style.display = "flex", fX.style.flexDirection = "column", fb.style.overflowX = "hidden", fb.style.overflowY = "auto", fb.addEventListener("scroll", function () {
    this.fi = this.scrollTop, fY && fY.fj && (aq.b1.fk[fY.fj] = this.scrollTop);
  }), function () {
    var fS,
      aN,
      fZ = data.fZ,
      aW = aM ? fZ[0].length : 0;
    for (aN = 0; aN < aM; aN++) {
      fd[aN] = document.createElement("div"), fd[aN].style.backgroundColor = function (aN) {
        return aN % 2 == 1 ? aR.color.fh(130, 130, 130, .35) : bG.fz;
      }(aN), fd[aN].style.width = "100%", fd[aN].style.display = "flex", aw[aN] = new Array(aW);
      for (var aQ = 0; aQ < aW; aQ++) aw[aN][aQ] = fS = document.createElement("div"), fS.style.display = "flex", fS.style.justifyContent = "center", fS.style.wordBreak = "break-all", fS.style.padding = "0.4em 0em", fS.style.width = data.fo[aQ] + "%", fS.textContent = fZ[aN][aQ].aY, 1 === fZ[aN][aQ].eZ && (fS.name = "" + aN, fS.style.color = bG.bI, fS.style.backgroundColor = fg, fS.addEventListener("mouseover", fp), fS.addEventListener("mouseout", fq), function (fS, ah, fs) {
        2147483647 !== fs && fS.addEventListener("click", function () {
          bc.bd(30), bc.bh(30, ah), ft.r(bc.bk), this.style.backgroundColor = fg, aq.fu(8, aq.fv, new fw(25, {
            action: 0,
            ah: bs.aa.fx(bs.aa.fy(5)),
            fs: fs
          }));
        });
      }(fS, fZ[aN][aQ].ah, fZ[aN][aQ].fs)), fd[aN].appendChild(fS);
    }
    for (fa.style.display = "flex", fa.style.backgroundColor = aR.color.fh(0, 120, 0, .35), aN = 0; aN < fe.length; aN++) fe[aN] = fS = document.createElement("div"), fS.style.display = "flex", fS.style.justifyContent = "center", fS.style.wordBreak = "break-all", fS.style.padding = "0.4em 0em", fS.style.width = data.fo[aN] + "%", fS.innerHTML = data.ff[aN], fa.appendChild(fS);
  }();
  for (var aN = 0; aN < aM; aN++) fc.appendChild(fd[aN]);
  fb.appendChild(fc), fX.appendChild(fa), fX.appendChild(fb), fY && fY.fj && (fb.fi = aq.b1.fk[fY.fj]);
}
function g5() {
  this.dz = dy.dz, this.af = 0, this.g6 = 0, this.g7 = 0, this.g8 = null, this.g9 = 7, this.gA = 0, this.r = function () {
    this.g7 = 0, this.g8 = [], this.af = 0, this.g6 = 0;
  }, this.gB = function (bk) {
    if (ct.dO) this.gC(bk);else if (this.g8.push(bk), 2 === ct.dX) {
      for (var aN = 0; aN < this.g8.length; aN++) gD.gE.f1(this.g8[aN]);
      this.g8 = [];
    }
  }, this.gC = function (bk) {
    2 !== ct.dX && (gD.gE.f1(bk), gF.f1(), gG.gC(this.g7), this.g7 === ct.gH ? (ct.gI.f1(), this.g7 = 0, this.af = 0, this.g6 = 0, this.dz = dy.dz) : (this.g7++, di.dR(), di.dY(!0), gJ.render()));
  }, this.f1 = function () {
    d9.f1(), ct.dO ? (dy.gK = gG.gC(-1) || dy.gK, gL()) : (0 !== this.af || dy.dz >= this.dz && (this.dz += dy.gM * Math.floor(1 + (dy.dz - this.dz) / dy.gM), 2 === ct.dX ? gN() : this.gO(), this.af++, 27 < dy.dz - this.gA)) && this.gP(), gQ(), dy.gK && (dy.gK = !1, gR()), this.gA = dy.dz;
  }, this.gP = function () {
    dy.gK = !0, gS(), this.af = 0;
  }, this.gO = function () {
    var gT, aN;
    if (this.g6 !== 7 * this.g7) gU(), gJ.render();else {
      gT = !1;
      loop: for (; this.gV() && (gT = !0, gU(), 2 !== ct.dX) && 0 < this.g8.length;) for (aN = this.g9 - 2; 0 <= aN; aN--) if (gU(), 2 === ct.dX) break loop;
      gT ? gJ.render() : (gN(), gJ.gW());
    }
  }, this.gV = function () {
    return 0 < this.g8.length && (this.g7++, gD.gE.f1(this.g8[0]), this.g8.shift(), !0);
  };
}
function gX() {
  var gY = [];
  this.r = function () {
    gY = [];
  }, this.gZ = function () {
    return 65536 === gY.length;
  }, this.ga = function (gb, gc) {
    for (var gd = gY, aM = gd.length, aN = 0; aN < aM; aN++) {
      var d1 = gd[aN];
      if (d1[0] === gb && d1[d1.length - 1] === gc) return aN;
    }
    return -1;
  }, this.ge = function (gf) {
    var gg = new Uint32Array(gf.length);
    return gg.set(gf), gg.reverse();
  }, this.gh = function (g4, gi) {
    var aL = g4.length - 1,
      gj = new Uint32Array(aL + gi.length);
    return gj.set(g4, 0), gj.set(gi, aL), gj;
  }, this.gk = function (g4, gi, gl, gm, gn) {
    gn && (gl = (gi = this.ge(gi)).length - gl - 2);
    gn = gi.subarray(gl + 1 + (gm === gi[gl + 1])), gm = new Uint32Array(g4.length + gn.length);
    return gm.set(g4, 0), gm.set(gn, g4.length), gm;
  }, this.gp = function (gf) {
    return gY.push(gf), gY.length - 1;
  }, this.get = function (aN) {
    return gY[aN];
  }, this.gq = function () {
    return gY;
  }, this.gr = function (gb, gc) {
    return null;
  };
}
function gN() {
  fA.f1(), di.f1(), gG.gs(), aF.b1.f1();
}
function gU() {
  gt.f1(), gu.f1(), gv.f1(), gw.f1(), gx.f1(), gy.f1(), gz.f1(), h0.b1.f1(), eI.h1(), h2.f1(), h3.f1(), h4.f1(), di.f1(), di.f6(), gG.f1(), h5.f1(), h6.f1(), h7.f1(), h8.h9(), fA.f1(), hA.f1(), hB.f1(), hC.f1(), hD.f1(), hE.f1(), aF.b1.f1(), aF.hF.f1(), aq.f1(), hG.hH.f1(), gF.f1(), dy.f1();
}
function gQ() {
  hI.f1(), hJ.f1(), hK.f1(), hL.f1(), hM.f1(), hN.f1(), h8.f1(), hO.hP();
}
function gS() {
  h2.dY(!1), h7.dY(), gG.dY(!1), h6.dY(), hB.dY(), hC.dY(), di.dY(!1), hE.hQ();
}
function gL() {
  di.dY(!1) && (dy.gK = !0), aF.b1.f1();
}
function hR(hS, hT, hU, hV, hW) {
  var self;
  this.hX = document.createElement("span"), this.resize = function () {
    this.hX.style.fontSize = ((hV - hU) * hT.offsetHeight).toFixed(1) + "px";
  }, (self = this).hX.textContent = hS, self.hX.style.color = bG.bH, self.hX.style.font = "inherit", self.hX.style.margin = "0.1em 0.6em", self.hX.style.pointerEvents = "none", hW && (self.hX.style.fontWeight = "bold"), self.hX.style.whiteSpace = "nowrap", self.hX.style.display = "block", hT.appendChild(self.hX);
}
function hZ() {
  this.ha = new Int16Array(4), this.hb = new Int16Array(4), this.hc = null, this.r = function () {
    var aN;
    for (this.ha[0] = -fU.fV, this.ha[1] = 1, this.ha[2] = fU.fV, this.ha[3] = -1, this.hc = new Int16Array([-fU.fV, 1 - fU.fV, 1, fU.fV + 1, fU.fV, fU.fV - 1, -1, -fU.fV - 1]), aN = 0; aN < 4; aN++) this.hb[aN] = 4 * this.ha[aN];
  }, this.hd = function () {
    return he.hf(Math.floor(.15 * (1 + .25 * cA.hg.hh()) * d9.dC / e5), 4, 128);
  }, this.hi = function (fK, id) {
    for (var hj = this.hb, aN = 0; aN < 4; aN++) {
      var hk = fK + hj[aN];
      if (d5.hl(hk) && d5.hm(hk) === id) return !0;
    }
    return !1;
  }, this.hn = function (player, fK) {
    return !d5.ho(fK) && player === d5.hp(fK);
  }, this.hq = function (hr, hs, gm) {
    return (hr -= this.ht(gm)) * hr + (hs -= this.hu(gm)) * hs;
  }, this.hv = function (hw, hx, hy) {
    hw = this.hz(hw) - this.i0(hy), hx = this.i1(hx) - this.i2(hy);
    return Math.sqrt(hw * hw + hx * hx);
  }, this.i3 = function (i4, i5) {
    var df = this.ht(i4) - this.ht(i5),
      i4 = this.hu(i4) - this.hu(i5);
    return ~~Math.sqrt(df * df + i4 * i4 + .5);
  }, this.i6 = function (i4, i5) {
    var df = this.ht(i4) - this.ht(i5),
      i4 = this.hu(i4) - this.hu(i5);
    return df * df + i4 * i4;
  }, this.i7 = function (dq, dt, dv, dw) {
    return (dq -= dv) * dq + (dt -= dw) * dt;
  }, this.i8 = function (d1, i9) {
    return he.iA(i9 * d3.dL[d1], 1e3);
  }, this.hz = function (hw) {
    return 16 * (hw + e4) / e5;
  }, this.i1 = function (hx) {
    return 16 * (hx + e7) / e5;
  }, this.iB = function (fS) {
    return 16 * fS / e5;
  }, this.ds = function (hw) {
    return Math.floor((hw + e4) / e5);
  }, this.du = function (hx) {
    return Math.floor((hx + e7) / e5);
  }, this.iC = function (hr, hs) {
    return 1 <= hr && 1 <= hs && hr < fU.fV - 1 && hs < fU.iD - 1;
  }, this.ht = function (gm) {
    return gm % fU.fV;
  }, this.hu = function (gm) {
    return he.iA(gm, fU.fV);
  }, this.iE = function (hr, hs) {
    return hs * fU.fV + hr;
  }, this.iF = function (hr, hs) {
    return 4 * this.iE(hr, hs);
  }, this.iG = function (gm) {
    return this.iH(this.ht(gm), this.hu(gm));
  }, this.iH = function (hr, hs) {
    return 0 < hr && hr < fU.fV - 1 && 0 < hs && hs < fU.iD - 1;
  }, this.iI = function (gm) {
    return gm << 2;
  }, this.iJ = function (fK) {
    return fK >> 2;
  }, this.iK = function (gm) {
    return fU.fV * this.hu(gm) * 256 + (this.ht(gm) << 4);
  }, this.iL = function (gm) {
    return this.iK(gm) + 8 + (fU.fV << 7);
  }, this.iM = function (hy) {
    return fU.fV * (this.i2(hy) >> 4) + (this.i0(hy) >> 4);
  }, this.iN = function (hy) {
    hy = this.iM(hy);
    return (this.ht(hy) >> 5) + h0.iO.iP * (this.hu(hy) >> 5);
  }, this.i0 = function (hy) {
    return hy % (fU.fV << 4);
  }, this.i2 = function (hy) {
    return he.iA(hy, fU.fV << 4);
  }, this.iQ = function (gm, iR) {
    return gm + this.ha[iR];
  }, this.iS = function (fK, iR) {
    return fK + this.hb[iR];
  }, this.iT = function (i4, i5) {
    var df = this.ht(i5) - this.ht(i4),
      i5 = this.hu(i5) - this.hu(i4);
    return Math.abs(df) >= Math.abs(i5) ? 1 + 2 * (df < 0) : 2 * (0 < i5);
  }, this.iU = function (player) {
    return this.iE(d3.dM[player] + d3.dS[player] >> 1, d3.dN[player] + d3.dT[player] >> 1);
  }, this.iV = function (player) {
    return this.iE(iW.iX(d3.dM[player], d3.dS[player]), iW.iX(d3.dN[player], d3.dT[player]));
  };
}
function iY() {
  var iZ;
  this.r = function () {
    iZ = !1;
  }, this.f1 = function () {
    var d1;
    if (function () {
      if (!iZ) {
        if (dy.f2() % 30 != 9) return;
        if (!aR.f.ih(90)) return;
        iZ = !0;
      }
      return 1;
    }() && !function () {
      var c3 = fA.ii(956);
      if (c3) {
        if (aR.f.ij(c3.player)) return 1;
        fA.ik(956, 0);
      }
      return;
    }() && (-1 === (d1 = (ct.il ? function () {
      var id = hE.iu(),
        aM = eI.eJ;
      if (ey.iv[id]) for (var ix = eI.eK, iy = ey.iy, aN = 0; aN < aM; aN++) {
        var d1 = ix[aN];
        if (iy[d1] !== id) return d1;
      } else if (1 < aM) return iw[aM - 1];
      return -1;
    } : function () {
      for (var ir = eI.eJ, is = eI.eK, it = eQ, aN = 0; aN < ir; aN++) {
        var d1 = is[aN];
        if (0 !== it[d1]) return d1;
      }
      return -1;
    })()) ? !function () {
      var c3 = fA.ii(957);
      if (c3 && c3.iz) {
        if (d5.ho(c3.iz.gm << 2)) return 1;
        fA.ik(957, 0);
      }
      return;
    }() : (fA.ip(0, L(9, [d3.dI[d1]]), 956, d1, bG.bH, bG.iq, -1, !0), 0))) {
      var aM = gz.j0.j1;
      if (0 !== aM) for (var buffer = gz.j0.buffer, aN = 0; aN < aM; aN++) {
        var gm = buffer[aN];
        if (d5.ho(gm << 2)) return void fA.ip(0, L(10, [dr.ht(gm), dr.hu(gm)]), 957, 0, bG.bH, bG.iq, -1, !0, void 0, {
          aQ: 1,
          gm: gm
        });
      }
    }
  };
}
function j2() {
  function j6(a6) {
    if (0 === a6.length) b6.bJ.bK(116, "");else {
      for (var j9 = a6[0], aN = 1; aN < a6.length; aN++) j9 += ";" + a6[aN];
      b6.bJ.bK(116, j9);
    }
  }
  this.j3 = function () {
    b6.buffer.data[110].value.length && (b6.buffer.data[106].value = b6.buffer.data[110], b6.bJ.bK(110, ""), this.j4());
  }, this.j4 = function () {
    var a6 = b6.buffer.data[116].value.split(";");
    for (a6.length % 2 == 1 && a6.pop(), a6.unshift(b6.buffer.data[106].value), a6.unshift(b6.buffer.data[105].value), aN = 2; aN < a6.length; aN += 2) if (a6[aN] === a6[0]) {
      a6.splice(aN, 2);
      break;
    }
    for (var j5 = [], aN = 0; aN < a6.length; aN += 2) j5.push(a6[aN]);
    j6(a6), b6.buffer.data[117].value = 0, b6.buffer.data[117].fY = j5;
  }, this.j7 = function (af) {
    b6.buffer.data[117].fY.splice(af, 1), b6.buffer.data[117].value = Math.min(af, b6.buffer.data[117].fY.length - 1);
    var a6 = b6.buffer.data[116].value.split(";");
    a6.splice(2 * af, 2), j6(a6);
  }, this.j8 = function (af) {
    var a6 = b6.buffer.data[116].value.split(";");
    return {
      ah: a6[2 * af],
      password: a6[2 * af + 1]
    };
  }, this.jA = function () {
    var aY = he.hf(b6.buffer.data[121].value, -1, 262143);
    return aY = -1 === aY ? ~~(262144 * Math.random()) : aY;
  }, this.jB = function () {
    for (var a6 = document.cookie.split(";"), aN = 0; aN < a6.length; aN++) {
      var gl,
        bS = a6[aN].trim();
      0 !== bS.length && (gl = 0 <= (gl = bS.indexOf("=")) ? bS.substring(0, gl) : bS, document.cookie = gl + "=;expires=0;path=/", document.cookie = gl + "=;expires=0;path=/;domain=" + location.hostname, document.cookie = gl + "=;expires=0;path=/;domain=." + location.hostname);
    }
  };
}
function jC() {
  function jp() {
    var id = ft.bg(3);
    return 0 === id ? {
      id: id,
      ah: ft.bg(30),
      a0: aI.js.aj(aZ.bt.jS(7))
    } : 1 === id ? {
      id: id,
      ah: ft.bg(30),
      aK: ft.bg(3),
      value: ft.bg(30),
      target: ft.bg(30)
    } : 2 === id ? {
      id: id,
      ah: ft.bg(30),
      aK: ft.bg(3)
    } : 3 === id ? {
      id: id,
      ah: ft.bg(30),
      aK: ft.bg(3),
      value: ft.bg(4),
      target: ft.bg(30)
    } : 4 === id ? {
      id: id,
      ah: ft.bg(30),
      aK: ft.bg(3),
      target: ft.bg(30)
    } : 5 === id ? {
      id: id,
      aK: ft.bg(6)
    } : 6 === id ? {
      id: id,
      value: ft.bg(17)
    } : null;
  }
  this.jD = function (bb) {
    if (bb !== aF.b1.bu) aF.b1.close(bb, 3239);else if (6 !== jE.jF()) aF.b1.close(bb, 3271);else {
      aI.r();
      for (var aN = 0; aN < 4; aN++) {
        var jG = aI.b1.jH[aN],
          playerCount = (jG.jI = ft.bg(10), jG.jJ = ft.bg(6), jG.mapSeed = ft.bg(14), jG.jK = ft.bg(4), jG.jL = ft.bg(6), jG.jM = ft.bg(14), jG.jN = ft.bg(4), jG.jO = ft.bg(1), jG.jP = ft.bg(12), jG.spawningSeed = ft.bg(14), ft.bg(16));
        aI.aU.jQ[aN] = ft.bg(16);
        for (var aQ = 0; aQ < playerCount; aQ++) aI.aU.jR(aN, ft.bg(30), aZ.bt.jS(5), ft.bg(4), ft.bg(30), ft.bg(7), ft.bg(16), ft.bg(18), ft.bg(11), ft.bg(12), ft.bg(6));
      }
      aq.fu(29), aI.b1.jT(!0);
    }
  }, this.jU = function (bb) {
    if (bb !== aF.b1.bu) aF.b1.close(bb, 3239);else if (aI.jV) {
      aI.b1.jW[0] = ft.bg(20), aI.b1.jW[1] = ft.bg(20);
      for (var jX = ft.bg(16), aQ = 0; aQ < jX; aQ++) {
        var id = ft.bg(3);
        0 === id ? aI.aU.jR(ft.bg(2), ft.bg(30), aZ.bt.jS(5), 0, 1234566, 127, 0, ft.bg(18), 0, ft.bg(12), 0) : 1 === id ? aI.aU.jY(ft.bg(16), ft.bg(2)) : 2 === id ? aI.aU.jZ(ft.bg(16), ft.bg(2), ft.bg(2)) : 3 === id ? aI.aU.ja(ft.bg(16), ft.bg(2)) : 4 === id ? aI.aU.jb(ft.bg(16), ft.bg(2), ft.bg(4), ft.bg(30), ft.bg(7), ft.bg(16), ft.bg(11), ft.bg(18)) : 5 === id ? aI.aU.jc(ft.bg(16), ft.bg(2), ft.bg(1)) : 6 === id && aI.aU.jd(ft.bg(16), ft.bg(2), ft.bg(6));
      }
      for (var aN = 0; aN < 4; aN++) {
        var jG = aI.b1.jH[aN];
        if (jG.jI = ft.bg(10), jG.jL = ft.bg(6), jG.jM = ft.bg(14), jG.jN = ft.bg(4), 0 === jG.jI) {
          if (jG.c7 = ft.bg(10), jG.je = ft.bg(10), aI.jf.jg(aN)) return;
          jG.jJ = ft.bg(6), jG.mapSeed = ft.bg(14), jG.jK = ft.bg(4), jG.jO = ft.bg(1), jG.jP = ft.bg(12), jG.spawningSeed = ft.bg(14), jG.jh.push(jG.jh[0]), jG.jh.shift();
        }
      }
      aI.b1.ji();
    } else aF.b1.close(bb, 3251);
  }, this.jj = function (bb) {
    if (bb !== aF.b1.bu) aF.b1.close(bb, 3272);else if (aI.jV) {
      for (var jk = ft.bg(4), jG = aI.b1.jH[jk], jl = jG.jl, jn = (jG.jm = ft.bg(20), ft.bg(6)), aN = 0; aN < jn; aN++) {
        var jo = jp();
        aI.db.jq(jo), jl.push(jo);
      }
      aI.b1.jr(jk);
    } else aF.b1.close(bb, 3273);
  }, this.jt = function (bb) {
    bb !== aF.b1.bu ? aF.b1.close(bb, 3276) : aI.jV ? aI.message.aJ(jp()) : aF.b1.close(bb, 3277);
  };
}
function ju() {
  var jv = new Uint16Array(ct.cv),
    jw = 0;
  function k8(k5, k6) {
    var bW = dy.f2();
    return 3213 <= bW ? 4 + he.iA(100 * k6, gw.k9(k5)) : (k5 = 1 + he.iA(ct.kB, 300), bW < 357 ? 2 + he.iA(100 * k6, k5) : bW < 714 ? 2 + he.iA(100 * k6, 4 * k5) : bW < 1071 ? 2 + he.iA(100 * k6, 10 * k5) : bW < 2142 ? 2 + he.iA(100 * k6, 30 * k5) : 2 + he.iA(100 * k6, 100 * k5));
  }
  function k7(k5) {
    return ct.kD || 4284 <= dy.f2() || aR.f.eH(k5);
  }
  this.r = function () {
    jv.fill(0), jw = 15;
  }, this.jx = function (jy) {
    var player = ct.eG;
    return !!aR.f.jz(player, jy) && !(!aR.f.k0(player, aR.f.i8(player, hB.k1()), jy) || (player = jy, jy = k3.k4[0], !k7(player) && jv[player] + k8(player, jy) > jw));
  }, this.kC = function (k5, k6) {
    if (!k7(k5)) {
      k6 = k8(k5, k6);
      if (jv[k5] + k6 > jw) return !1;
      jv[k5] += k6;
    }
    return !0;
  }, this.f1 = function () {
    dy.f2() % 100 == 99 && (dy.f2() < 1071 ? jw += 4 : dy.f2() < 2142 ? jw += 6 : dy.f2() < 3213 ? jw += 8 : jw += 10);
  };
}
function kE() {
  this.j0 = new kF(), this.kG = new kH(), this.kI = new kJ(), this.performance = new kK(), this.kL = new kM(), this.kN = new kO(), this.kP = new kQ(), this.kR = new kS(), this.kT = new kU(), this.r = function () {
    this.j0.r(), this.kI.r(), this.performance.r(), this.kL.r(), this.kN.r();
  }, this.f1 = function () {
    this.performance.f1(), this.j0.f1(), this.kI.kV();
  };
}
function kW() {
  function kz(player, ki, kq, kt) {
    var l5;
    if (d5.ho(kq)) l5 = ct.cv;else {
      if ((l5 = d5.hp(kq)) === player) return void hD.l6(player, ki - aR.f.l7(player, ki), 12);
      if (!kl.km(player, l5)) return void gD.l8.l9(player, l5, ki);
    }
    lA.lB(player, l5) || lA.lC(player) ? (d3.lD[player].push(kt << 2), lA.kC(player, ki, l5), gy.lE(player, !0)) : hD.l6(player, ki, 12);
  }
  this.f1 = function () {
    for (var kX = h0.b1.kX, kY = h0.b1.kY, kZ = h0.b1.kZ, aN = h0.b1.ka - 1; 0 <= aN; aN--) 65535 === kZ[aN] && function (aN, kt, iR) {
      if (6 === iR) {
        if (h0.kc.ku(aN, kt)) return h0.b1.kv[aN]++, h0.b1.kZ[aN] = 0, 0;
      } else {
        var player = h0.b1.kw[aN] >> 3,
          aN = h0.b1.kx[aN];
        hD.ky(player), iR < 4 ? kz(player, aN, kt + dr.ha[iR] << 2, kt) : 4 === iR ? function (player, ki, kt) {
          var aN,
            l2,
            hj = dr.hb,
            hk = dr.iI(kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.ho(l2)) return kz(player, ki, l2, kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.l3(l2) && !d5.l4(player, l2)) return kz(player, ki, l2, kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.l3(l2)) return kz(player, ki, l2, kt);
        }(player, aN, kt) : 5 === iR && function (player, ki, kt) {
          var aN,
            l2,
            hj = dr.hb,
            hk = dr.iI(kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.l3(l2) && d5.l4(player, l2)) return kz(player, ki, l2, kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.l3(l2)) return kz(player, ki, l2, kt);
          for (aN = 0; aN < 4; aN++) if (l2 = hk + hj[aN], d5.ho(l2)) return kz(player, ki, l2, kt);
        }(player, aN, kt);
      }
      return 1;
    }(aN, dr.iM(kY[aN]), kX[aN] % 64) && (h0.kc.kd(aN), h0.ke.kf(aN));
  }, this.kg = function (player, gm, iR, kh, ki) {
    if (!(5 <= iR)) {
      var kj = ct.eG;
      if (aR.f.kk(kj) && kl.km(player, kj) && player !== kj && 0 !== d3.kn[kj].length && aR.f.ko(player, 5)) {
        for (var kq, kp = !1, aN = 0; aN < 4; aN++) if (kq = gm + dr.ha[aN] << 2, d5.kr(kq) && !d5.ho(kq) && d5.hp(kq) === kj) {
          kp = !0;
          break;
        }
        kp && (fA.ik(719, 0), iR = ki < 25e3 ? L(11) + " (" + aR.h.dG(ki) + ") ⛵" : L(12) + " (" + aR.h.dG(ki) + ") 🚢", fA.ip(180, iR, 719, player, bG.ks, bG.iq, -1, !0, void 0, {
          ex: 1,
          kh: kh
        }));
      }
    }
  };
}
function lF() {
  var lG, aO, eU, lH, lI, lJ, canvas, j, lK, lL, lM, lN, lO, lP;
  this.eT = 0, this.dA = 0, this.r = function () {
    lJ = ct.lQ, lN = "rgba(0,100,0,0.8)", lO = "rgba(150,0,0,0.8)", lK = lM = !0, lL = d3.dL[ct.eG], this.resize();
  }, this.resize = function () {
    aO = Math.floor((cA.hg.hh() ? .305 : .24) * d9.dC), this.dA = Math.floor(.5 + .13 * aO), aO = Math.floor(6 * this.dA), lG = aR.b.dF(1, Math.floor(.8 * this.dA)), lI = aR.b.dF(1, Math.floor(.45 * this.dA)), lP = Math.floor(.5 * this.dA), fU.lR.font = lG, eU = lS.gap, lH = Math.floor(1 + .13 * this.dA), (canvas = document.createElement("canvas")).width = aO, canvas.height = this.dA, j = canvas.getContext("2d", {
      alpha: !0
    }), aR.b.textBaseline(j, 1), aR.b.textAlign(j, 1), this.lT();
  }, this.lU = function () {
    return cA.hg.hh() && d9.aO < 1.2 * d9.dA;
  }, this.lV = function () {
    this.lU() ? this.eT = d9.aO - aO - lS.gap : this.eT = Math.floor(h2.lW() + (d9.aO - h2.lW() - gG.aO - aO) / 2 - .5 * lS.gap);
  }, this.dY = function () {
    lK && (lK = !1, this.lT());
  }, this.lT = function () {
    j.font = lG, j.clearRect(0, 0, aO, this.dA), j.fillStyle = lM ? lN : lO, j.fillRect(0, 0, aO, this.dA), j.fillStyle = bG.lX;
    var bW = this.lY(),
      la = (this.lZ(), j.fillStyle = d3.dL[ct.eG] >= gw.k9(ct.eG) ? bG.ks : bG.bH, aR.h.dG(lL)),
      la = (j.fillText(la, Math.floor(aO / 2), lP), j.measureText(la).width),
      lc = (j.font = lI, j.fillStyle = 9 === bW ? bG.lb : bG.bH, gw.ld),
      le = "+" + lc,
      g3 = j.measureText(le).width,
      lf = Math.floor(this.dA / 12),
      la = .5 * (aO + la) + lf;
    (la + g3 + lH <= aO || 1e3 <= lc && (le = "+" + Math.floor(lc / 1e3) + "K", la + (g3 = j.measureText(le).width) + lH <= aO)) && j.fillText(le, Math.floor(la + .5 * g3), Math.floor(.3 * this.dA)), __fx.settings.displayTickNumber && j.fillText(9 - bW, Math.floor(2 * lH + lf), Math.floor(.3 * this.dA)), j.fillStyle = bG.bH, j.fillRect(0, 0, aO, 1), j.fillRect(0, 0, 1, this.dA), j.fillRect(0, this.dA - 1, aO, 1), j.fillRect(aO - 1, 0, 1, this.dA);
  }, this.lY = function () {
    var bW = dy.f2() % 100,
      ee = (bW = 9 - he.iA(bW -= bW % 10, 10), Math.floor(bW * (this.dA - lH) / 9));
    return j.fillRect(0, ee, lH, this.dA - ee), j.fillRect(aO - lH, ee, lH, this.dA - ee), bW;
  }, this.lZ = function () {
    j.fillRect(lH, this.dA - lH, Math.floor((aO - 2 * lH) * d3.dL[ct.eG] / lJ), lH);
  }, this.f1 = function () {
    var d1 = ct.eG;
    aR.f.kk(d1) && (d1 = d3.dL[d1] - d3.eX[d1], lL !== d1 ? (lJ = lg(d1, lJ), lM = lL < d1 && 10 <= d1, lL = d1, lK = !0) : dy.f2() % 10 == 9 && (lK = !0));
  }, this.dd = function () {
    0 === d3.eF[ct.eG] || ct.dO || 2 === d3.eL[ct.eG] || dE.drawImage(canvas, this.eT, eU);
  };
}
function lh() {
  this.li = function (bb) {
    var username = b6.buffer.data[122].value.slice(0, 20),
      username = (bc.bd(24 + 16 * username.length + 18), bc.bh(1, 0), bc.bh(6, 1), bc.bh(10, c8.lj), bc.bh(2, b6.buffer.data[158].value), aF.lk.cG(username), aR.color.lm(b6.b1.jA()));
    bc.bh(6, username[0]), bc.bh(6, username[1]), bc.bh(6, username[2]), aF.b1.bu = bb, aF.b1.send(bb, bc.bk);
  }, this.aH = function (ln, lo) {
    br.r(), br.bh(1, 0), br.bh(6, 2), br.bh(3, ln), 2 === ln ? br.bh(2, lo) : 3 === ln ? bs.bt.bj(lo, 7, br) : 5 === ln && (br.bh(3, lo.id), br.bh(3, lo.value), br.bh(30, lo.ah)), aF.b1.send(aF.b1.bu, br.bv());
  };
}
function lp() {
  var lq = [];
  function lv(ah) {
    lq.unshift(ah), b6.bJ.bK(161, lq.join(";"));
  }
  function lu(ah) {
    for (var lx = lq, aM = lx.length, aN = 0; aN < aM; aN++) if (lx[aN] === ah) return lx.splice(aN, 1), b6.bJ.bK(161, lx.join(";")), 1;
  }
  this.r = function () {
    var bS = b6.buffer.data[161].value;
    bS.length && (lq = bS.split(";"));
  }, this.get = function () {
    return lq;
  }, __fx.followedAccounts.setSource(this.get), this.lr = function () {
    return {
      fY: __fx.followedAccounts.decorate(lq),
      value: 0
    };
  }, this.ls = function (ah) {
    return aR.d.has(lq, ah);
  }, this.lt = function (ah) {
    return lu(ah) ? 0 : (lv(ah), 1);
  }, this.hQ = function (ah) {
    lu(ah) && lv(ah);
  }, this.lw = function (af) {
    af < lq.length && (lq.splice(af, 1), b6.bJ.bK(161, lq.join(";")));
  };
}
function ly() {
  this.b1 = new lz(), this.m0 = new m1(), this.r = function () {
    this.b1.r();
  }, this.f1 = function () {
    0 !== this.b1.m2 && this.b1.m2--;
  };
}
function m3() {
  function m6(b7) {
    mN(b7), aq.fu(4, 5, new mC("🚀 New Game Update", "The game was updated! Please reload the game. An internet connection is required." + "<div style='border: white; border-width: 1px; border-style: solid; margin: 10px; padding: 5px;'><h2>FX Client is not yet compatible with the latest version of the game.</h2><p>Updates should normally be available within a few hours.<br>You can still use FX to play in singleplayer mode.</p></div>", !0, [new ap("⬅️ " + L(1), function () {
      aq.ar();
    }), new ap("🔄 Reload", function () {
      cA.hg.mP();
    }, bG.mQ)]));
  }
  function mK(b7) {
    mN(b7), aq.fu(4, 5, new mC(L(13), mD(b7), !0));
  }
  function mD(b7) {
    var bS = " [" + b7 + "]";
    return 3249 === b7 || 1006 === b7 ? "No Internet / No Server Response / Server Restart" + bS : 4527 === b7 ? "Player already in lobby" + bS : 4577 === b7 ? "Your IP is banned." + bS : 4530 === b7 ? "Lobby Timeout" + bS : 4528 === b7 ? "Lobby Kick: Another login detected." + bS : 4540 === b7 ? "You have been kicked." + bS : 4495 === b7 ? "Account doesn't exist." : 4229 === b7 ? "Bad Internet / Unresponsive Client" + bS : 4555 === b7 ? "This Account is blocked." + bS : 4580 === b7 ? "More Gold needed" + bS : 4557 <= b7 && b7 <= 4560 || 4589 == b7 ? "Please try again later!" + bS : 4591 === b7 ? "The algo determined you are a bot." + bS : "Unknown error" + bS;
  }
  function mN(b7) {
    m7(b7), aq.b1.mR();
  }
  function m7(b7) {
    4540 === b7 && aF.b1.mS(b7);
    var mE = jE.jF();
    mT.close(), 6 === mE ? aF.b1.mS(b7) : aI.jV ? (aq.mU(), aI.mV(), aF.b1.close(aF.b1.bu, 3256)) : 8 === mE && ct.mW(!0);
  }
  this.m4 = [], this.m5 = function (bb, b7) {
    if (console.log("socket close index " + bb + " error " + b7), this.m4.push(b7), 4321 === b7 && (data = b6.b1.j8(0), console.log("Reset to: " + data.ah), b6.bJ.bK(105, data.ah), b6.bJ.bK(106, data.password)), 8 === aq.fv && 0 === bb) {
      if (4211 === b7) m6(b7);else {
        if (aI.jV && (4495 === b7 || 4480 === b7) && aF.b1.bu !== bb) return void aq.ar();
        if (8 !== jE.jF() && m7(), 4480 === b7) return b6.bJ.mO(), void aq.fu(4, 0, new mC(L(15), L(16), !0));
        var data = 0;
        aq.mA() && 10 === aq.mA().mB && (data = aq.mA().mB), aq.fu(4, data, new mC(L(13), mD(b7), !0));
      }
    } else {
      data = jE.jF();
      if (6 === data) {
        if (4211 === b7) return void m6(b7);
        if (4215 !== b7 && 4516 !== b7 && 4527 !== b7 && 4533 !== b7 && 4528 !== b7 && !(4557 <= b7 && b7 <= 4560) && 4577 !== b7 && 4576 !== b7) return void mF.mG(bb);
      } else if (aI.jV) {
        if (bb !== aF.b1.bu) return;
      } else {
        if (8 === data) return void (bb !== aF.b1.c7 || ct.kD || 1 !== ct.dX || ct.mH || fA.mI(L(14, [b7])));
        if (!(4579 <= b7 && b7 <= 4589)) return;
      }
      (4591 === b7 ? function (b7) {
        mN(b7), aq.fu(4, 5, new mC("🤖 Bot Detection", "The algo thinks you are a bot. Please reload the game to fix this issue. An internet connection is required.", !0, [new ap("⬅️ " + L(1), function () {
          aq.ar();
        }), new ap("🔄 Reload", function () {
          cA.hg.mP();
        }, bG.mQ)]));
      } : mK)(b7);
    }
  }, this.mL = function (b7) {
    this.m4.push(b7), 8 === jE.jF() ? ct.kD || 1 !== ct.dX || fA.mI(L(14, [b7])) : mK(b7);
  }, this.mM = function () {
    this.m4.push(3268), mN(3268);
  };
}
function mX() {
  var dA,
    canvas,
    j,
    mY,
    mZ,
    ma,
    mb,
    lK,
    mc,
    md,
    me,
    mh,
    mf = !1,
    es = (this.mg = !1, this.aO = 0, new Array(2)),
    mi = 0;
  function hQ() {
    var aO = hC.aO,
      aW = (lK = !1, mn(j, aO, dA), Math.floor(aO / 2));
    1 === mY ? (j.fillStyle = bG.mo, j.fillRect(aW, 0, aW, dA)) : -1 === mY && (j.fillStyle = bG.mp, j.fillRect(0, 0, aW, dA)), mq(j, aO, dA, 2);
    var aW = (aW = Math.floor(.25 * dA)) < 2 ? 2 : aW,
      ms = (j.fillStyle = bG.mr, Math.floor((dA - 4) * mZ[1] / ma[1]));
    0 < ms && j.fillRect(2, dA - 2 - ms, aW, ms), 0 < (ms = Math.floor((dA - 4) * mZ[0] / ma[0])) && j.fillRect(aO - 2 - aW, dA - 2 - ms, aW, ms);
    aW = (aW = Math.floor(dA / 8)) < 2 ? 2 : aW, mu(j, Math.floor(.4 * dA), 0, dA, aW, .5, !1), mu(j, Math.floor(aO - 1.4 * dA), 0, dA, aW, .5, !0), ms = 1.1 * dA / es[0].width;
    j.imageSmoothingEnabled = !0, j.setTransform(ms, 0, 0, ms, (aO - ms * es[0].width) / 2, -.05 * dA), j.drawImage(es[+mf], 0, 0), j.setTransform(1, 0, 0, 1, 0, 0);
  }
  function n7() {
    mh = -1, mf = n8.n9(), fA.nA(257), fA.nB(mf), hC.mg = !0, lK = !0, mc = 360;
    for (var aY, eZ = 0, aN = eI.eJ - 1; 0 <= aN; aN--) aR.f.eH(eI.eK[aN]) || (eZ += d3.d4[eI.eK[aN]]);
    mf ? ma[0] = Math.max(he.iA(3 * eZ, 4), 1) : ct.il ? (aY = 9 === ct.cu ? 8 === ey.iv[hE.iu()] ? 80 : (aY = he.iA(100 * hE.nG(), ct.kB), he.iA(he.hf(1550 - 11 * aY, 400, 1e3), 10)) : (aY = he.iA(100 * hE.nG(), ct.kB), he.iA(he.hf(1600 - 12 * aY, 400, 1e3), 10)), aY = he.iA(aY * eZ, 100), ma[0] = Math.max(aY, 1)) : 8 === ct.cu ? ma[0] = Math.max(he.iA(3 * eZ, 4), 1) : ma[0] = Math.max(he.iA(3 * eZ, 5), 1), ma[1] = Math.max(eZ - ma[0], 1);
  }
  function n3() {
    me = dy.f2(), lK = !0, mc = mY = 0, mb = [], hC.mg = !1, fA.fB(247), mZ[0] = mZ[1] = 0, fA.nA(673);
  }
  function mw() {
    return hB.nQ(fA.nR()) ? __fx.settings.keybindButtons ? hB.eU - 2 * (dA + lS.gap) : hB.eU - dA - lS.gap : hM.nQ(fA.nS()) ? hM.mw() - dA - lS.gap : d9.dA - dA - nT.nU() * lS.gap;
  }
  this.mj = function () {
    for (var aN = 0; aN < 2; aN++) es[aN] = aR.canvas.mk(dQ.get(3), 8 - aN, bG.ml), es[aN] = aR.canvas.mm(es[aN]);
  }, this.r = function () {
    me = -1e4, md = mi = 0, mh = -1, this.mg = !1, lK = mf = !1, mZ = [mY = mc = 0, 0], ma = [1, 1], mb = [], this.resize();
  }, this.resize = function () {
    dA = hB.dA, this.aO = 4 * dA, (canvas = document.createElement("canvas")).width = this.aO, canvas.height = dA, j = canvas.getContext("2d", {
      alpha: !0
    }), hQ();
  }, this.dY = function () {
    lK && hQ();
  }, this.mv = function (eT, eU) {
    return !!this.mg && !(eT < d9.aO - this.aO - lS.gap || eU < mw() || (ct.mH || this.mx(ct.eG) && (my.mz && my.n0(), gD.n1.n2(eT > d9.aO - lS.gap - this.aO / 2 ? 1 : 0)), 0));
  }, this.f1 = function () {
    0 < md ? 0 === --md && n3() : this.mg ? 180 == --mc && 3 * mZ[0] < ma[0] ? n3() : mZ[0] >= ma[0] ? mf ? nH.nI.nJ() : nH.nI.nK() : mZ[1] >= ma[1] ? md = 4 : mc <= 0 && n3() : !function () {
      var nD = dy.f2();
      if (nD % 40 == 14) {
        if (mi) return !(nD < mi) && !(nD < me + 535) && (mi = nD + 1071, aR.f.nE()) ? (n7(), 1) : 0;
        (1 === eI.eJ || (ct.il ? hE.nG() : d3.d4[iw[0]]) >= he.iA(96 * ct.kB, 100)) && (mi = nD + 535);
      }
      return;
    }() && 0 <= mh && (fA.ip(250, L(17, [d3.dI[mh]]), 673, mh, bG.bH, bG.iq, -1, !0), n7());
  }, this.nL = function () {
    this.mg && mZ[0] < ma[0] && n3();
  }, this.nM = function (player, nN) {
    var nO = L(nN ? 18 : 19, [d3.dI[player]]),
      nO = (fA.ip(450, nO, 257, player, nN ? bG.nP : bG.ks, bG.iq, -1, !0), mb.push(player), lK = !0, ct.kD ? Math.max(ma[0], ma[1]) : d3.d4[player]),
      nO = Math.max(nO, 1);
    nN ? mZ[0] += nO : mZ[1] += nO, player === ct.eG && (mY = nN ? 1 : -1);
  }, this.dd = function () {
    var eU;
    this.mg && (eU = mw(), dE.drawImage(canvas, d9.aO - this.aO - lS.gap, eU));
  }, this.nV = function (player) {
    if (0 !== mc) return !1;
    if (!aR.f.nW(1)) return !1;
    if (!aR.f.kk(player)) return !1;
    if (10 <= eQ[player] && !aR.f.nX(player, 9)) return !1;
    if (!ct.kD) {
      player = dy.f2();
      if (player < me + 100) return !!void 0;
      if (player < 1607) return !!void 0;
    }
    return !!1;
  }, this.mx = function (d1) {
    if (!aR.f.nW(1)) return !1;
    if (!aR.f.kk(d1)) return !1;
    if (!this.mg) return !1;
    for (var aN = mb.length - 1; 0 <= aN; aN--) if (mb[aN] === d1) return !1;
    return !0;
  }, this.nZ = function (player) {
    mh = player;
  };
}
function na() {
  this.nb = 0, this.nc = null, this.aU = null, this.nd = null, this.b1 = null, this.ne = null, this.nf = null, this.message = null, this.js = null, this.db = null, this.ng = null, this.jf = new nh(), this.jV = 0, this.ni = 0, this.r = function () {
    this.ni = dy.dz, this.nb = aZ.aa.ab(b6.buffer.data[105].value, 5), this.aU = new nj(), this.nd = new nk(), this.b1 = new nl(), this.ne = new nm(), this.nf = new nn(), this.message = new no(), this.js = new t(), this.db = new np(), this.ng = new nq(), this.b1.r(), nr.r(), this.jV = 1, cA.hg.setState(1), jE.setState(0), hG.turnstile.ns();
  }, this.mV = function () {
    this.db && this.db.mV(), this.nc = null, this.aU = null, this.nd = null, this.b1 = null, this.ne = null, this.nf = null, this.message = null, this.js = null, this.db = null, this.ng = null, this.jV = 0, nr.mV(), cA.hg.setState(0);
  };
}
function nt() {
  this.mapType = 0, this.mapProceduralIndex = 2, this.mapRealisticIndex = 0, this.mapSeed = 14071, this.mapName = "", this.canvas = null, this.passableWater = 1, this.passableMountains = 1, this.playerCount = 512, this.humanCount = 1, this.selectedPlayer = 0, this.gameMode = 0, this.playerMode = 0, this.battleRoyaleMode = 0, this.numberTeams = 0, this.isZombieMode = 0, this.isContest = 0, this.isReplay = 0, this.elo = null, this.colorsType = 0, this.colorsPersonalized = 1, this.colorsData = null, this.selectableColor = 1, this.teamPlayerCount = null, this.neutralBots = 0, this.botDifficultyType = 0, this.botDifficultyValue = 0, this.botDifficultyTeam = null, this.botDifficultyData = null, this.spawningType = 0, this.spawningSeed = 0, this.spawningData = null, this.selectableSpawn = 1, this.playerNamesType = 0, this.playerNamesData = null, this.selectableName = 1, this.aIncomeType = 0, this.aIncomeValue = 0, this.aIncomeData = null, this.tIncomeType = 0, this.tIncomeValue = 32, this.tIncomeData = null, this.iIncomeType = 0, this.iIncomeValue = 64, this.iIncomeData = null, this.sResourcesType = 0, this.sResourcesValue = 0, this.sResourcesData = null, this.nu = null;
}
function nv(nw, fX) {
  var nx;
  this.resize = function () {
    for (var aN = 0; aN < nw.length; aN++) aR.b.g1(nw[aN].button);
    nx.style.gap = nx.style.padding = aR.b.nz(lS.o0);
  }, (nx = document.createElement("div")).style.display = "grid", nx.style.gridTemplateColumns = "repeat(auto-fill, minmax(9.5em, 1fr))", nx.style.overflowY = "auto", nx.style.gridAutoRows = "5.3em", nx.style.maxHeight = "100%";
  for (var aN = 0; aN < nw.length; aN++) nw[aN].ny(1), nx.appendChild(nw[aN].button);
  fX.appendChild(nx);
}
function o1() {
  this.o2 = 0, this.gap = 0, this.o3 = 0, this.o0 = 0, this.r = function () {
    this.resize();
  }, this.resize = function () {
    this.o2 = .0022 * aR.b.o4(.5) * d9.dC, this.o3 = this.o2 / d9.o5, this.gap = Math.max(Math.floor((cA.hg.hh() ? .0114 : .01296) * d9.dC), 2), this.o0 = this.gap / d9.o5;
  };
}
function o6() {
  this.bj = function () {
    var dK = function () {
        for (var oR = gF.oK.oR, aM = oR.length, max = 0, aN = 0; aN < aM; aN++) max = Math.max(max, oR[aN]);
        return oU(Math.max(max, 1));
      }(),
      aO = (c3 = ct.data, (aO = br).r(), aO.bh(12, c8.rVersion), aO.af += 43, aO.bh(2, c3.mapType), aO.bh(8, c3.mapProceduralIndex), aO.bh(8, c3.mapRealisticIndex), aO.bh(14, c3.mapSeed), aO.oF(c3.mapName, 5), 2 === c3.mapType && aO.oG(c3.canvas), aO.bh(1, c3.passableWater), aO.bh(1, c3.passableMountains), aO.bh(10, c3.playerCount), aO.bh(10, c3.humanCount), aO.bh(9, c3.selectedPlayer), aO.bh(1, c3.gameMode), aO.bh(2, c3.playerMode), aO.bh(2, c3.battleRoyaleMode), aO.bh(4, c3.numberTeams), aO.bh(1, c3.isZombieMode), aO.bh(1, c3.isContest), aO.bh(1, c3.isReplay), aO.oH(c3.elo, 2, 14), aO.bh(1, c3.colorsType), aO.bh(1, c3.colorsPersonalized), aO.oH(c3.colorsData, 10, 18), aO.bh(1, c3.selectableColor), aO.oH(c3.teamPlayerCount, 4, 10), aO.bh(1, c3.neutralBots), aO.bh(2, c3.botDifficultyType), aO.bh(4, c3.botDifficultyValue), aO.oH(c3.botDifficultyTeam, 4, 4), aO.oH(c3.botDifficultyData, 10, 4), aO.bh(2, c3.spawningType), aO.bh(14, c3.spawningSeed), aO.oH(c3.spawningData, 11, 12), aO.bh(1, c3.selectableSpawn), aO.bh(2, c3.playerNamesType), aO.oI(c3.playerNamesData, 10, 5), aO.bh(1, c3.selectableName), aO.bh(2, c3.aIncomeType), aO.bh(8, c3.aIncomeValue), aO.oH(c3.aIncomeData, 10, 8), aO.bh(2, c3.tIncomeType), aO.bh(8, c3.tIncomeValue), aO.oH(c3.tIncomeData, 10, 8), aO.bh(2, c3.iIncomeType), aO.bh(8, c3.iIncomeValue), aO.oH(c3.iIncomeData, 10, 8), aO.bh(2, c3.sResourcesType), aO.bh(11, c3.sResourcesValue), aO.oH(c3.sResourcesData, 10, 11), aO.oH(c3.nu, 10, 30), !function (dK) {
        var aO = br,
          oJ = gF.oK.oJ,
          oL = gF.oK.oM,
          oN = gF.oK.oO,
          oP = gF.oK.oQ,
          aM = oJ.length;
        aO.bh(5, dK), aO.bh(30, aM), aO.bh(30, gF.oK.oR.length);
        for (var aN = 0; aN < aM; aN++) {
          var bW = oJ[aN];
          aO.bh(4, bW), aO.bh(9, oL[aN]), 0 === bW ? aO.bh(22, oN[aN]) : 1 === bW ? (aO.bh(10, oN[aN]), aO.bh(10, oP[aN])) : 2 === bW ? (aO.bh(10, oN[aN]), aO.bh(9, oP[aN])) : 3 === bW ? (aO.bh(10, oN[aN]), aO.bh(27, oP[aN])) : 4 === bW ? (aO.bh(10, oN[aN]), aO.bh(16, oP[aN])) : 5 === bW || 6 === bW ? aO.bh(10, oN[aN]) : 7 === bW ? aO.bh(1, oN[aN]) : 10 === bW && (aO.bh(20, oN[aN]), aO.bh(22, oP[aN]));
        }
      }(dK), !function (dK) {
        for (var aO = br, oS = gF.oK.oS, oR = gF.oK.oR, aM = oS.length, aN = 0; aN < aM; aN++) aO.bh(1, oS[aN]), aO.bh(dK, oR[aN]);
      }(dK), br.af),
      c3 = he.iA(aO - 1, 6) + 1,
      dK = (bc.oD(6 * c3) !== br.a6.length && br.a6.push(0), !function () {
        var aO = br;
        aO.af = 24, aO.bh(31, aO.a6.length), aO.af = 12, aO.bh(12, function () {
          for (var a6 = br.a6, aM = a6.length, c6 = c8.rVersion, aN = 3; aN < aM; aN++) c6 = c6 + a6[aN] & 4095;
          return c6;
        }());
      }(), ft.r(br.a6), bs.aa.fx(bs.aa.fy(c3)));
    return ft.mV(), br.r(), dK;
  };
}
function oV() {
  this.oW = function (player, gm) {
    aR.f.nW(0) && aR.f.kk(player) && dr.iG(gm) && (gF.oK.oX(0, player, gm), ct.gI.kC(player, gm));
  }, this.oY = function (player, i9, l5) {
    aR.f.nW(1) && aR.f.kk(player) && aR.f.oZ(player, l5) && aR.f.oa(player, i9, 12, 0) && aR.f.ob(player, l5) && ((l5 = lA.lB(player, k3.od[0])) || lA.lC(player)) && (d3.oe[player]++, gF.oK.oX(1, player, i9, k3.od[0]), gz.kL.og(player, l5)) && (aR.f.oh(player), hD.oi(player, i9), gz.kL.oj(player));
  }, this.ok = function (player, i9, jy) {
    aR.f.nW(1) && aR.f.kk(player) && ct.il && aR.f.oZ(player, jy) && aR.f.jz(player, jy) && aR.f.k0(player, aR.f.i8(player, i9), jy) && gv.kC(jy, k3.k4[0]) && (gF.oK.oX(2, player, i9, jy), gw.ol(player, jy));
  }, this.om = function (player, i9, on) {
    k3.oo[1] = 7 & on;
    var gm = on >> 3;
    aR.f.nW(1) && aR.f.kk(player) && dr.iG(gm) && h0.op.oq(player) && h0.op.or(gm) && aR.f.oa(player, i9, 32, 0) && h0.os.ot(player, gm, 1) && (hD.ou(player), gF.oK.oX(3, player, i9, on), aR.f.oh(player), ov.ow.om(player), h0.b1.ox(player));
  }, this.oy = function (player, i9, kh) {
    849 === i9 ? this.oz(player, kh) : aR.f.nW(1) && aR.f.kk(player) && aR.f.oa(player, i9, 32, 0) && h0.p0.p1(player, kh) && (hD.ou(player), gF.oK.oX(4, player, i9, kh), aR.f.oh(player), ov.ow.oy(player), h0.b1.ox(player));
  }, this.oz = function (player, kh) {
    aR.f.nW(1) && aR.f.kk(player) && h0.p2.f1(player, kh) && gF.oK.oX(4, player, 849, kh);
  }, this.p3 = function (player, l5) {
    513 === l5 ? this.nZ(player) : aR.f.nW(1) && aR.f.kk(player) && (l5 = Math.min(l5, ct.cv), lA.lB(player, l5)) && (gF.oK.oX(5, player, l5), lA.p4(player, l5));
  }, this.p5 = function (player, ek) {
    (aR.f.nW(1) || aR.f.nW(2)) && aR.f.kk(player) && (ek = he.hf(ek, 0, 1023), gF.oK.oX(6, player, ek), di.dU(player, 0, ek));
  }, this.n2 = function (player, p6) {
    hC.mx(player) && (gF.oK.oX(7, player, p6), hC.nM(player, p6));
  }, this.p7 = function (player) {
    (aR.f.nW(0) || aR.f.nW(1)) && aR.f.kk(player) && my.p8(player) && (gF.oK.oX(8, player), p9.p7(player));
  }, this.pA = function (player) {
    gF.oK.oX(9, player), p9.pA(player);
  }, this.nZ = function (player) {
    hC.nV(player) && (gF.oK.oX(5, player, 513), hC.nZ(player));
  }, this.pB = function (player, i9, gm, l5) {
    aR.f.nW(1) && aR.f.kk(player) && aR.f.oZ(player, l5) && aR.f.ob(player, l5) && dr.iG(gm) && pC.pD.pE(player, gm) && (lA.lB(player, k3.od[0]) || lA.lC(player)) && (gF.oK.oX(10, player, (i9 << 10) + k3.od[0], gm), l5 = aR.f.pF(player, i9), d3.lD[player].push(k3.pG[0]), lA.kC(player, l5, k3.od[0]), gy.lE(player, !0), hD.pH(player));
  };
}
function pI() {
  this.pJ = function (pK, pL, pM) {
    bc.bd(75), bc.bh(1, 0), bc.bh(6, 21), bc.bh(6, pK), bc.bh(1, +(pL < 0)), bc.bh(1, +(pM < 0)), bc.bh(30, Math.abs(pL)), bc.bh(30, Math.abs(pM)), aF.b1.send(0, bc.bk);
  }, this.pN = function (pK, pO, pP) {
    bc.bd(18 + 16 * pO.length + 30), bc.bh(1, 0), bc.bh(6, 22), bc.bh(6, pK), aF.lk.cG(pO), bc.bh(30, pP), aF.b1.send(0, bc.bk);
  }, this.pQ = function (pK, pO, pP) {
    bc.bd(73), bc.bh(1, 0), bc.bh(6, 28), bc.bh(6, pK), aZ.aa.pR(pO, 5), bc.bh(30, pP), aF.b1.send(0, bc.bk);
  }, this.pS = function (pT, pU) {
    for (var aM = pU.length, pV = 0, aN = 0; aN < aM; aN++) pV += pU[aN].length;
    for (bc.bd(21 + 3 * aM + 16 * pV), bc.bh(1, 0), bc.bh(6, 23), bc.bh(3, pT), bc.bh(4, aM), bc.bh(7, pV), aN = 0; aN < aM; aN++) bc.bh(3, pU[aN].length), bs.bz.c0(pU[aN]);
    aF.b1.send(0, bc.bk);
  }, this.pW = function (pT, pL, pM) {
    bc.bd(52), bc.bh(1, 0), bc.bh(6, 24), bc.bh(3, pT), bc.bh(1, +(pL < 0)), bc.bh(1, +(pM < 0)), bc.bh(20, Math.abs(pL)), bc.bh(20, Math.abs(pM)), aF.b1.send(0, bc.bk);
  };
}
function pX() {
  var pY = 0,
    pZ = null;
  this.r = function () {
    null === pZ && (pZ = new Uint16Array(2 * h0.b1.pa)), pY = 0;
  }, this.kC = function (pb, kc) {
    var pc = pZ;
    pc[pY++] = pb, pc[pY++] = kc;
  }, this.pd = function (player, pe) {
    for (var pc = pZ, aM = pY, aN = 0; aN < aM; aN += 2) if (pc[aN] === pe && h0.nd.pf(pc[aN + 1]) && player === h0.b1.kw[k3.oo[2]] >> 3) return !0;
    return !1;
  }, this.kd = function (pg) {
    var ph = h0.b1.kX[pg];
    if (!(ph < 64)) {
      for (var pe = h0.b1.pj[pg], pc = pZ, aM = pY, aN = aM - 2; 0 <= aN; aN -= 2) if (pc[aN] === pe) {
        {
          pm = void 0;
          var pm = pc[aN + 1];
          h0.nd.pf(pm) && h0.kc.pt(k3.oo[2]);
        }
        pc[aN] = pc[aM - 2], pc[aN + 1] = pc[aM - 1], aM -= 2;
      }
      pY = aM;
    }
  }, this.ku = function (pk, pl) {
    for (var pm = h0.b1.pj[pk], pe = -1, pc = pZ, aM = pY, aN = 1; aN < aM; aN += 2) if (pc[aN] === pm) {
      pe = pc[aN - 1];
      break;
    }
    if (-1 === pe) return !1;
    if (!h0.nd.pf(pe)) return !1;
    var pg = k3.oo[2],
      gf = h0.b1.pn[pg];
    if (pl === gf[gf.length - 1]) h0.b1.pn[pk] = h0.gd.gh(h0.b1.pn[pk], h0.gd.ge(gf));else {
      var po = h0.nd.pp(gf, pl);
      if (-1 === po) return !1;
      var pq = h0.b1.kv[pg];
      po === pq ? (pg = dr.iM(h0.b1.kY[pg]), h0.b1.pn[pk] = h0.gd.gk(h0.b1.pn[pk], gf, po, pl, dr.i3(gf[po], pl) > dr.i3(gf[po], pg))) : h0.b1.pn[pk] = h0.gd.gk(h0.b1.pn[pk], gf, po, pl, pq < po);
    }
    return !0;
  }, this.pt = function (pu) {
    var gf,
      aW = h0.b1,
      ph = aW.kX[pu];
    return ph % 64 != 5 && (gf = aW.pn[pu], aW.kZ[pu] = 65535 - aW.kZ[pu], aW.kv[pu] = gf.length - aW.kv[pu] - 2, aW.pn[pu] = h0.gd.ge(gf), aW.kX[pu] = ph - ph % 64 + 5, !0);
  };
}
function pw() {
  var py,
    pz,
    q0,
    q1,
    px = !1;
  function q2() {
    px = !0, py = -1, pz = new Array(4);
    for (var aN = 3; 0 <= aN; aN--) pz[aN] = !1;
    var q3 = Math.floor(1 + .02 * d9.min);
    q0 = new Array(4), (q1 = new Array(4))[1] = q1[3] = q0[0] = q0[2] = 0, q1[0] = q0[3] = -q3, q0[1] = q1[2] = q3;
  }
  function q5() {
    if (-1 !== py) if (0 !== ct.dX && hI.fN()) {
      for (var q7 = !1, aN = 3; 0 <= aN; aN--) pz[aN] && (q7 = !0, e4 += q0[aN], e7 += q1[aN], di.dh(q0[aN], q1[aN]), qA.qB());
      q7 ? dy.gK = !0 : q9.q8();
    } else q9.q8();
  }
  this.q4 = function (af) {
    0 !== ct.dX && hI.fN() && (px || q2(), pz[af] = !0, -1 === py) && (py = setInterval(q5, 20), q5());
  }, this.q6 = function (af) {
    if (0 !== ct.dX && (px || q2(), pz[af] = !1, -1 !== py)) {
      for (var q7 = !1, aN = 3; 0 <= aN; aN--) q7 = q7 || pz[aN];
      q7 || this.q8();
    }
  }, this.q8 = function () {
    if (px && -1 !== py) {
      for (var aN = 3; 0 <= aN; aN--) pz[aN] = !1;
      clearInterval(py), py = -1;
    }
  };
}
function qC() {
  this.om = function (player) {
    aR.f.qD(player) && fA.ip(80, L(20), 637, 0, bG.qE, bG.iq, -1, !1);
  }, this.oy = function (player) {
    aR.f.qD(player) && fA.ip(80, L(21), 637, 0, bG.qE, bG.iq, -1, !1);
  };
}
function qF() {
  var canvas, j, eT, eU, qG, qH, gap, qI, fontSize, qJ, qK, qL, qM, qN, qO, qP, qQ, qR;
  function qY() {
    j.clearRect(0, 0, gG.aO, gG.dA), j.fillStyle = bG.iq, j.fillRect(0, 0, gG.aO, gG.dA), j.fillStyle = bG.mo, fK = 0 < qP ? qP : qM[4] / 1e4, j.fillRect(0, gG.dA - qG - 1, Math.floor(fK * gG.aO), qG), j.fillStyle = bG.bH, j.fillRect(0, 0, gG.aO, 1), j.fillRect(0, 0, 1, gG.dA), j.fillRect(gG.aO - 1, 0, 1, gG.dA), j.fillRect(0, gG.dA - 1, gG.aO, 1), j.fillRect(0, gG.dA - qG - 1, gG.aO, 1);
    for (var fK, qb, eZ = 0, aN = 0; aN < qL.length; aN++) qN[aN] ? (aR.b.textAlign(j, 0), qb = Math.floor((qH - qG + 2 * qI) * (aN - eZ + 1) / (qL.length + 1) - .7 * qI), j.fillText(qL[aN], gap, qb), aR.b.textAlign(j, 2), 5 === aN && 0 !== d3.eF[ct.eG] && d3.dL[ct.eG] >= gw.k9(ct.eG) ? (j.fillStyle = bG.qc, j.fillText(qV(aN), gG.aO - gap, qb), j.fillStyle = bG.bH) : j.fillText(qV(aN), gG.aO - gap, qb)) : eZ++;
  }
  function qV(aN) {
    return aN < 3 ? qM[aN].toString() : 3 === aN || 4 === aN || 5 === aN ? aR.h.qd(qM[aN] / 100, 2) : aN < 7 ? aR.h.dG(qM[aN]) : aN === 7 ? gG.qe(qM[7]) : aN === 8 ? __fx.utils.getMaxTroops(d3.d4, ct.eG) : __fx.utils.getDensity(ct.eG);
  }
  function qU() {
    d3.d4[ct.eG] !== qM[6] && (qM[6] = d3.d4[ct.eG], qJ++);
  }
  this.r = function () {
    qP = qQ = 0, (qK = new Array(8))[0] = L(22), qK[1] = ct.kD ? L(23) : L(24), qK[2] = L(25), qK[3] = L(26), qK[4] = L(27), qK[5] = L(28, 0, "Interest"), qK[6] = L(29), qK[7] = L(30), qK.push("Max Troops", "Density"),
    // add qK
    (qL = new Array(qK.length)).fill(""), (qM = new Array(qK.length))[0] = ct.kD ? 0 : ct.dP, qM[1] = ct.kD ? eI.eJ : ct.qS, qM[2] = ct.qT, qM[3] = 0, qM[4] = he.iA(1e4 * d3.d4[0], Math.max(ct.kB, 1)), qM[5] = 0 === ct.data.iIncomeType ? 700 : 1 === ct.data.iIncomeType ? he.iA(700 * ct.data.iIncomeValue, 64) : he.iA(700 * ct.data.iIncomeData[ct.eG], 64), qM[6] = 0, qU(), qM[7] = 0, qO = qV(6), (qN = new Array(qK.length)).fill(!0), qR = 0, qR = ct.kD ? (qN[0] = !1, qN[2] = !1, qN[3] = !1, 3) : (qN[3] = !1, 1), qJ = 0, this.resize();
  }, this.resize = function () {
    this.aO = Math.floor((cA.hg.hh() ? .1646 : .126) * 1.25 * d9.dC), this.dA = Math.floor(1.18 * this.aO), qG = Math.floor(.04 * this.aO), gap = Math.floor(.035 * this.aO), qI = .04 * this.aO, qH = this.dA, this.dA -= Math.floor(qR * (this.dA - 2 * qG) / qK.length), fontSize = Math.floor(.7 * (qH - qG) / qK.length);
    var lG = aR.b.dF(1, fontSize);
    (canvas = document.createElement("canvas")).width = this.aO, canvas.height = this.dA, function (lG, aO) {
      for (var aN = 0; aN < qL.length; aN++) qL[aN] = aR.j.qZ(qK[aN], lG, aO);
    }((j = canvas.getContext("2d", {
      alpha: !0
    })).font = lG, .575 * this.aO), aR.b.textBaseline(j, 1), j.lineWidth = 1, this.qX(), this.lV(), h6.lV(), qY();
  }, this.lV = function () {
    eT = d9.aO - this.aO - lS.gap;
  }, this.qa = function () {
    eU = lS.gap;
  }, this.qX = function () {
    eU = lS.gap + (h6.lU() && 0 !== d3.eF[ct.eG] && !ct.dO ? h6.dA + lS.gap : 0);
  }, this.dY = function (dx) {
    (dx || 100 <= qJ) && (qJ = 0, qY());
  }, this.qf = function () {
    return qM[7];
  }, this.qe = function (value) {
    var aW = Math.floor(value / 1e3 / 60),
      value = Math.floor((value - 6e4 * aW) / 1e3);
    return value < 10 ? aW + ":0" + value : aW + ":" + value;
  }, this.f1 = function () {
    var qr, per;
    qN[0] && ct.qm - ct.qT !== qM[0] && (qM[0] = ct.qm - ct.qT, qJ++), eI.eJ - qM[0] !== qM[1] && (qM[1] = eI.eJ - qM[0], qJ++), this.gs(), (qr = gw.qs(ct.eG)) !== qM[5] && (qM[5] = qr, qJ++), qU(), qM[7] += dy.gM, qr = qV(7), qO !== qr && (qO = qr, qJ += 100), qr = ct.il ? hE.nG() : d3.d4[iw[0]], per = he.iA(1e4 * qr, Math.max(ct.kB, 1)), qM[3] = qr, qM[4] !== per && (qJ++, qM[4] = per), 8 === ct.cu && function () {
      for (var aN = 0; aN < 2; aN++) if (!aR.f.kk(aN)) return nH.nI.nK(), 1;
      return;
    }() || qM[3] < ct.kB || !function () {
      for (var aN = eI.eJ - 1; 0 <= aN; aN--) if (0 < d3.lD[eI.eK[aN]].length) return;
      return 1;
    }() || h0.nd.qq().length || ct.il && hE.nG(1) < ct.kB || nH.nI.nK();
  }, this.gs = function () {
    qN[2] && ct.qT !== qM[2] && (qM[2] = ct.qT, qJ += 2 === ct.dX ? 100 : 1);
  }, this.qn = function () {
    return qM[3] === ct.kB;
  }, this.gC = function (aN) {
    var kA, qt, eZ;
    return 2 !== ct.dX && (aN % 2 == 1 && (h2.dY(1, 1), dy.gK = !0), aN === ct.gH ? (qP = 0, qY(), !1) : (-1 !== aN || 0 !== qQ) && (qt = qP, qP = ct.mH ? aN / ct.gH : (eZ = performance.now(), 0 <= aN && (kA = eZ - 392 * aN, qQ = 0 === aN || kA < qQ ? kA : qQ), 1 < (qP = (eZ - qQ) / (392 * ct.gH)) ? 1 : qP), qY(), qP !== qt));
  }, this.dd = function () {
    dE.drawImage(canvas, eT, eU);
  };
}
function qu() {
  this.qv = function () {
    var qw = ct.data;
    aR.d.qx(qw.teamPlayerCount, qw.playerCount), qw.numberTeams = aR.d.qy(qw.teamPlayerCount, 0), qw.teamPlayerCount[0] && qw.teamPlayerCount[7] && (qw.teamPlayerCount[7] = 0, this.qv());
  }, this.qz = function () {
    var qw = ct.data;
    qw.mapType < 2 ? fU.bd(fU.r0(qw), qw.mapSeed) : fU.r1(qw.canvas);
  }, this.r2 = function () {
    var qw = ct.data;
    qw.colorsData || (qw.colorsData = new Uint32Array(1)), 0 === qw.gameMode && (qw.colorsData[0] = b6.b1.jA()), qw.selectableName && (qw.playerNamesData || (qw.playerNamesData = new Array(1)), qw.playerNamesData[0] = b6.buffer.data[122].value), qw.nu = new Uint32Array(1), qw.nu[0] = aZ.aa.ab(b6.buffer.data[105].value, 5);
  }, this.r3 = function () {
    ct.data = new nt();
  };
}
function r4() {
  this.r5 = ["rgba(90,90,90,0.88)", "rgba(130,12,12,0.88)", "rgba(12,130,12,0.88)", "rgba(12,12,130,0.88)", "rgba(130,130,12,0.88)", "rgba(130,12,130,0.88)", "rgba(12,130,130,0.88)", "rgba(130,130,130,0.88)", "rgba(0,0,0,0.88)"], this.r6 = ["rgb(210,200,200)", "rgb(255,120,120)", "rgb(0,230,0)", "rgb(150,150,255)", "rgb(240,240,25)", "rgb(255,70,255)", "rgb(25,240,240)", bG.bH, "rgb(170,170,170)"], this.r7 = [bG.bH, "rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,255,0)", "rgb(255,0,255)", "rgb(0,255,255)", bG.bH, bG.r8], this.r9 = [bG.r8, bG.bH, bG.bH, bG.bH, bG.r8, bG.r8, bG.r8, bG.r8, bG.bH];
  var rA = ["255,255,255", "0,0,0", "255,170,170", "190,4,4", "4,255,4", "4,180,4", "255,195,195", "90,3,3", "200,255,200", "3,84,3"];
  this.ez = ["rgba(" + rA[0] + ",", "rgba(" + rA[1] + ",", "rgba(" + rA[2] + ",", "rgba(" + rA[3] + ",", "rgba(" + rA[4] + ",", "rgba(" + rA[5] + ",", "rgba(" + rA[6] + ",", "rgba(" + rA[7] + ",", "rgba(" + rA[8] + ",", "rgba(" + rA[9] + ","], this.f0 = ["rgb(" + rA[0] + ")", "rgb(" + rA[1] + ")", "rgb(" + rA[2] + ")", "rgb(" + rA[3] + ")", "rgb(" + rA[4] + ")", "rgb(" + rA[5] + ")", "rgb(" + rA[6] + ")", "rgb(" + rA[7] + ")", "rgb(" + rA[8] + ")", "rgb(" + rA[9] + ")"], this.rB = null, this.rC = [[128, 158, 168, 180], [255, 0, 0, 180], [0, 255, 0, 180], [50, 50, 255, 180], [255, 255, 0, 180], [255, 0, 255, 180], [0, 255, 255, 180], [255, 255, 255, 180], [0, 0, 0, 180]], this.rD = [[128, 128, 128], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255], [255, 255, 255], [0, 0, 0]], this.iv = [0, 1, 2, 3, 4, 5, 6, 7, 8], this.iy = new Uint8Array(ct.cv), this.rE = new Uint8Array(ct.cv), this.rF = new Uint16Array(ct.cv), this.rG = new Uint16Array(this.iv.length + 1), this.rH = new Uint16Array(this.iv.length), this.mj = function () {
    this.rB = [L(31), L(32), L(33), L(34), L(35), L(36), L(37), L(38), L(39)];
  }, this.r = function () {
    if (this.iy.fill(0), this.rE.fill(0), this.rI(), ct.il) {
      if (9 === ct.cu) {
        for (var iy = ey.iy, aN = ct.data.teamPlayerCount[7] - 1; 0 <= aN; aN--) iy[aN] = 1;
        var aM = ct.cv;
        for (aN = ct.data.teamPlayerCount[7]; aN < aM; aN++) iy[aN] = 2;
        ey.iv[1] = 7, ey.iv[2] = 8;
      } else ct.kD ? function () {
        var rD = ey.rD,
          colorsData = ct.data.colorsData;
        if (!ct.data.selectableColor) for (var aN = ct.dP - 1; 0 <= aN; aN--) colorsData[aN] = iW.rU(262144);
        var rV = 0,
          rW = 768,
          ll = [4 * (colorsData[0] >> 12), 4 * (colorsData[0] >> 6 & 63), 4 * (63 & colorsData[0])],
          teamPlayerCount = ct.data.teamPlayerCount;
        for (aN = 0; aN < 9; aN++) if (teamPlayerCount[aN]) {
          for (var fS = 0, ex = 0; ex < 3; ex++) fS += Math.abs(rD[aN][ex] - ll[ex]);
          fS < rW && (rV = aN, rW = fS);
        }
        var rX = new Uint16Array(9);
        for (aN = 0; aN < 9; aN++) rX[aN] = teamPlayerCount[aN];
        var iv = ey.iv,
          rY = new Uint8Array(9),
          aL = (iv[0] = 0, 1);
        for (aN = 1; aN < 9; aN++) rX[aN] && (rY[aN] = aL, iv[aL++] = aN);
        var fO = ct.dP,
          iy = ey.iy;
        rX[rV] ? (rX[rV]--, iy[0] = rY[rV]) : fO = 0;
        var bW = 0;
        for (aN = fO; aN < ct.rZ; aN++) {
          var dZ = iv[bW];
          if (rX[dZ]) rX[dZ]--, iy[aN] = rY[dZ];else if (aN--, 9 <= ++bW) return console.log("error 325");
        }
      }() : this.f1();
      !function () {
        for (var aM = ct.cv, rF = ey.rF, rG = ey.rG, rH = ey.rH, iy = ey.iy, iv = ey.iv, rn = iv.length, buffer = new Array(rn), aN = 0; aN < rn; aN++) buffer[aN] = [];
        for (aN = 0; aN < aM; aN++) buffer[iv[iy[aN]]].push(aN);
        for (aN = 1; aN <= rn; aN++) rG[aN] = rG[aN - 1] + buffer[aN - 1].length;
        for (aN = 0; aN < rn; aN++) for (var aL = buffer[aN].length, aW = rG[aN], dZ = 0; dZ < aL; dZ++) rF[dZ + aW] = buffer[aN][dZ];
        var dP = ct.dP;
        for (aN = 0; aN < rn; aN++) for (aL = buffer[aN].length, aW = rG[aN], dZ = 0; dZ < aL; dZ++) if (rF[dZ + aW] >= dP) {
          rH[aN] = dZ;
          break;
        }
      }(), !function () {
        for (var aM = ct.cv, iy = ey.iy, rE = ey.rE, iv = ey.iv, aN = 0; aN < aM; aN++) rE[aN] = iv[iy[aN]];
        9 === ct.cu && rE.fill(1, aM - h3.ro[5]);
      }();
    }
  }, this.rI = function () {
    for (var aN = this.iv.length - 1; 0 <= aN; aN--) this.iv[aN] = aN;
  }, this.f1 = function () {
    var f7 = new Uint8Array(ct.dP),
      f8 = new Uint8Array(ct.dP),
      rN = new Uint16Array(8),
      rO = new Uint16Array(this.iv.length);
    this.rP(f7, f8, rN, 1), this.rQ(rN), this.rR(rO, f7, f8), this.rS(f7, f8, rO), this.rT();
  }, this.rP = function (f7, f8, rX, ra) {
    for (var ex, b7, rb, aM = this.iv.length - ra, a6 = new Uint16Array(aM), rD = this.rD, colorsData = ct.data.colorsData, aN = ct.dP - 1; 0 <= aN; aN--) {
      for (ex = aM; ra <= ex; ex--) a6[ex - 1] = Math.abs(4 * (colorsData[aN] >> 12) - rD[ex][0]) + Math.abs(4 * (colorsData[aN] >> 6 & 63) - rD[ex][1]) + Math.abs(4 * (63 & colorsData[aN]) - rD[ex][2]);
      for (rb = 768, ex = aM - 1; 0 <= ex; ex--) a6[b7 = (ex + aN) % aM] < rb && (rb = a6[b7], f7[aN] = b7);
      for (rX[f7[aN]] += 4, rb = 768, ex = aM - 1; 0 <= ex; ex--) a6[b7 = (ex + aN) % aM] < rb && b7 !== f7[aN] && (rb = a6[b7], f8[aN] = b7);
      rX[f8[aN]]++;
    }
  }, this.rQ = function (rX) {
    for (var ex, rc, aM = this.iv.length - 1, aN = aM; 0 <= aN; aN--) this.iv[aN] = aN;
    for (aN = aM - 1; 0 <= aN; aN--) rX[aN]++;
    for (aN = 1; aN <= aM; aN++) {
      for (rc = 0, ex = 1; ex < aM; ex++) rX[ex] > rX[rc] && (rc = ex);
      rX[rc] = 0, this.iv[aN] = rc + 1;
    }
  }, this.rR = function (rO, f7, f8) {
    var ex,
      rd,
      bW,
      fS,
      b7,
      fM,
      kA,
      re = this.iv.length - 1,
      rf = new Uint16Array(re),
      rg = [],
      rh = 0,
      pU = [],
      ri = [];
    loop: for (var aN = 0; aN < ct.dP; aN++) if (null !== (rd = aR.h.ag(d3.rj[aN]))) {
      for (ex = pU.length - 1; 0 <= ex; ex--) if (rd === pU[ex]) {
        ri[ex].push(aN), rh = Math.max(rh, ri[ex].length);
        continue loop;
      }
      pU.push(rd), rg.push(!1), ri.push([aN]), rh = Math.max(rh, 1);
    }
    for (; 2 < ct.rk && rh > he.iA(ct.dP, ct.rk);) ct.rk--, ct.cu--;
    for (ex = pU.length - 1; 0 <= ex; ex--) {
      for (fS = -1, bW = pU.length - 1; 0 <= bW; bW--) !rg[bW] && (-1 === fS || ri[bW].length > ri[fS].length) && (fS = bW);
      for (bW = re - 1; 0 <= bW; bW--) rf[bW] = 1;
      for (bW = ri[fS].length - 1; 0 <= bW; bW--) rf[f7[ri[fS][bW]]] += 3, rf[f8[ri[fS][bW]]]++;
      for (aN = re - 1; 0 <= aN; aN--) {
        for (b7 = fS % re, bW = re - 1; 0 <= bW; bW--) rf[bW] > rf[b7] && (b7 = bW);
        for (fM = -1, bW = ct.rk; 0 < bW; bW--) if (this.iv[bW] === b7 + 1) {
          fM = bW;
          break;
        }
        if (rf[b7] = 0, -1 !== fM) {
          for (kA = 0, bW = ct.rk; 0 < bW; bW--) rO[fM] > rO[bW] && kA++;
          if (kA !== ct.rk - 1) {
            for (bW = ri[fS].length - 1; 0 <= bW; bW--) rO[fM]++, this.iy[ri[fS][bW]] = fM;
            break;
          }
        }
      }
      rg[fS] = !0;
    }
  }, this.rS = function (f7, f8, rO) {
    for (var aN, hy, aM = this.iv.length - 1, border = he.iA(ct.dP, ct.rk), rl = (0 < ct.dP % ct.rk && border++, new Uint8Array(1 + aM)), ex = aM; 1 <= ex; ex--) rl[this.iv[ex]] = ex;
    for (aN = 0; aN < ct.dP; aN++) hy = rl[f7[aN] + 1], 0 === this.iy[aN] && hy <= ct.rk && rO[hy] < border && (rO[hy]++, this.iy[aN] = hy);
    for (aN = 0; aN < ct.dP; aN++) hy = rl[f8[aN] + 1], 0 === this.iy[aN] && hy <= ct.rk && rO[hy] < border && (rO[hy]++, this.iy[aN] = hy);
    for (ex = ct.rk; 1 <= ex; ex--) for (aN = ct.dP - 1; 0 <= aN && !(rO[ex] >= border); aN--) 0 === this.iy[aN] && (rO[ex]++, this.iy[aN] = ex);
  }, this.rT = function () {
    if (ct.rk < 8) ct.rk++, ct.cu++, ct.rm = 1;else for (var aN = ct.dP; aN < ct.cv; aN++) this.iy[aN] = 1 + aN % ct.rk;
  };
}
function rp(data) {
  var am,
    rq,
    rr,
    rs,
    rt,
    ru,
    rv,
    colors,
    rw,
    rx,
    ry = 0,
    rz = 0,
    s0 = !1,
    s1 = !1,
    s2 = [1, 5, 60, 240, 1440, 10080, 43200];
  function sk(dk, dl) {
    !function (dk, dl) {
      return rq < dk && dk < rq + rs && rr < dl && dl < rr + rt;
    }(ry = dk, rz = dl) ? (s0 && (dy.gK = !0), s0 = !1) : (s0 = !0, dy.gK = !0);
  }
  this.show = function () {
    s1 = b6.buffer.data[127].value, am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize();
    var bW = d9.o5,
      sE = am.sF(),
      sG = bW * sE.sH,
      bW = bW * sE.sI;
    ru = aR.b.sJ(.06), rv = aR.b.sJ(.04), rq = aR.b.sJ(.06), rr = bW + ru, rs = d9.aO - rq - rv, rt = sG + bW - rr - rv;
  }, this.dd = function () {
    am.dd(), function () {
      var aN,
        s8,
        aL,
        eT,
        aQ,
        a6 = data.data,
        sN = 1,
        sO = .125,
        sP = s1 ? 65536 : 0;
      for (aN = 0; aN < a6.length; aN++) for (s8 = a6[aN].s8, aL = s8.length, sN = Math.max(aL, sN), aQ = 0; aQ < aL; aQ++) sO = Math.max(s8[aQ], sO), sP = Math.min(s8[aQ], sP);
      var e6 = rr + rt,
        sQ = rt / (sO - sP),
        sR = 1 / (sN - 1);
      for (dE.lineWidth = lS.o2, aN = 0; aN < a6.length; aN++) {
        for (s8 = a6[aN].s8, aL = s8.length, eT = rq, dE.beginPath(), dE.moveTo(eT + rs, e6 - sQ * (s8[aL - 1] - sP)), aQ = aL - 2; 0 <= aQ; aQ--) dE.lineTo(eT + sR * aQ * rs, e6 - sQ * (s8[aQ] - sP));
        dE.strokeStyle = colors[aN], dE.stroke();
      }
      (function (sP, sO, e6, sQ) {
        dE.font = aR.b.dF(0, .25 * rq), aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 2), dE.fillStyle = colors[0];
        for (var eT = .92 * rq, aN = 0; aN < 3; aN++) {
          var aY = sP + aN * (sO - sP) / 2;
          dE.fillText((aY / 1e3).toFixed(3), eT, e6 - sQ * (aY - sP));
        }
      })(sP, sO, e6, sQ), function (sN) {
        var eU = rr + rt + .15 * rv;
        dE.font = aR.b.dF(0, Math.min(.4 * rv, .028 * d9.aO)), aR.b.textBaseline(dE, 0), aR.b.textAlign(dE, 2), dE.fillStyle = colors[0], dE.fillText(aR.p.sV(rw), rq + rs, eU), aR.b.textAlign(dE, 0), dE.fillText(aR.p.sV(new Date(rx.getTime() - 6e4 * (sN - 1) * s2[data.pT])), rq, eU);
      }(sN), function (sN, sP, sO) {
        if (s0 && !(sN < 2)) {
          for (var sg, af = (ry - rq) / rs * (sN - 1), sW = Math.floor(af), sX = Math.floor(1 + af), sY = af - sW, sZ = 1e5, sa = -1, sb = -1, sc = sO - (sO - sP) * (rz - rr) / rt, a6 = data.data, aN = 0; aN < a6.length; aN++) {
            var sd,
              s8 = a6[aN].s8;
            s8.length <= sX || (s8 = s8[sW] + sY * (s8[sX] - s8[sW]), (sd = Math.abs(sc - s8)) < sZ && (sZ = sd, sa = aN, sb = s8));
          }
          -1 !== sa && (sO = rr + rt - (sb - sP) / (sO - sP) * rt, dE.lineWidth = .5 * lS.o2, dE.strokeStyle = colors[sa], dE.beginPath(), dE.moveTo(rq, sO), dE.lineTo(ry, sO), dE.lineTo(ry, rr + rt), dE.stroke(), dE.beginPath(), dE.arc(ry, sO, .1 * rq, 0, 2 * Math.PI), dE.fillStyle = colors[sa], dE.fill(), sP = rr + rt + .15 * rv, aR.b.textAlign(dE, 1), sg = sN - 2 < af ? (sg = rx.getTime() - 6e4 * s2[data.pT], new Date(sg + (af - (sN - 2)) * (rw.getTime() - sg))) : new Date(rx.getTime() - 6e4 * (sN - af - 1) * s2[data.pT]), sN = aR.p.sV(sg), af = aR.b.measureText(sN), sg = he.hf(ry, rq + .5 * af, rq + rs - .5 * af), dE.fillStyle = aR.color.sD(70, 50, 20), dE.fillRect(sg - .52 * af, rr + rt, 1.04 * af, .55 * rv), dE.fillStyle = colors[0], dE.fillText(sN, sg, sP), dE.font = aR.b.dF(0, .25 * rq), aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 2), sg = .92 * rq, sN = (sb / 1e3).toFixed(3), af = aR.b.measureText(sN), sP = sg - 1.04 * af, dE.fillStyle = aR.color.sD(70, 50, 20), dE.fillRect(sP, sO - .1625 * rq, rq - sP, .275 * rq), dE.fillStyle = colors[sa], dE.fillText(sN, sg, sO));
        }
      }(sN, sP, sO);
    }(), dE.lineWidth = lS.o2, dE.strokeStyle = bG.bH, dE.beginPath(), dE.moveTo(rq, rr), dE.lineTo(rq, rr + rt), dE.lineTo(rq + rs, rr + rt), dE.stroke();
    var aN,
      fontSize = .5 * ru,
      a6 = (dE.font = aR.b.dF(0, fontSize), aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 0), data.data),
      aM = a6.length,
      eU = rr - .5 * ru,
      bS = "";
    for (aN = 0; aN < aM; aN++) bS += a6[aN].name + "  ";
    bS = bS.trim();
    var sh = aR.b.measureText(bS),
      eT = .5 * (d9.aO - sh);
    for (d9.aO < sh && (eT = 0, dE.font = aR.b.dF(0, d9.aO / sh * fontSize)), aN = 0; aN < aM; aN++) dE.fillStyle = colors[aN], dE.fillText(a6[aN].name, eT, eU), eT += aR.b.measureText(a6[aN].name + "  ");
  }, this.mv = function (dk, dl) {
    sk(dk, dl);
  }, this.dh = function (dk, dl) {
    sk(dk, dl);
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  };
  var aN,
    eZ,
    sA,
    dZ,
    fS = data.data,
    aM = fS.length,
    max = 1;
  for (aN = 0; aN < aM; aN++) max = Math.max(max, fS[aN].s8.length);
  for (aN = 0; aN < aM; aN++) for (; fS[aN].s8.length < max;) fS[aN].s8.unshift(0);
  eZ = new Date(), sA = 6e4 * eZ.getTimezoneOffset(), dZ = eZ.getTime() - sA, rw = new Date(dZ), 6 === data.pT ? function (eZ, sA) {
    var sC = eZ.getUTCFullYear(),
      eZ = eZ.getUTCMonth() + 1;
    rx = eZ < 12 ? new Date(Date.UTC(sC, eZ) - sA) : new Date(Date.UTC(sC + 1, 0) - sA);
  }(eZ, sA) : (sA = 6e4 * s2[data.pT], rx = data.pT <= 4 ? new Date(dZ + sA - eZ.getTime() % sA) : new Date(dZ + sA - (eZ.getTime() + 2592e5) % sA)), dZ = aR.color, colors = [bG.bH, dZ.sD(255, 0, 0), dZ.sD(0, 200, 0), dZ.sD(80, 80, 255), dZ.sD(255, 255, 0), dZ.sD(255, 0, 255), dZ.sD(0, 255, 255), dZ.sD(255, 140, 0), dZ.sD(128, 128, 128), dZ.sD(0, 255, 140)], am = new ao(L(40) + ", " + ["M1", "M5", "H1", "H4", "D1", "W1", "MN"][data.pT] + ", " + aR.p.s7(rw), [new ap("⬅️ " + L(1), function () {
    aq.fu(1);
  }), new ap(L(41), function () {
    aq.fu(14);
  })], !1);
}
function sm() {
  var sq,
    sr,
    sn = document.createElement("div"),
    so = document.createElement("div"),
    sp = document.createElement("div"),
    fc = document.createElement("div"),
    nw = [],
    ss = [L(42), L(43), L(44), L(45), L(46), L(47), L(48), L(49)],
    st = [1, 2, 3, 0, 9, 10, 11, 13];
  function sw(aN) {
    aq.fu(8, 0, new fw(21, {
      pK: st[aN],
      pL: 0,
      pM: 10
    }));
  }
  this.show = function () {
    this.bK(aq.b1.t3), document.body.appendChild(sn);
  }, this.bU = function () {
    aq.removeChild(document.body, sn);
  }, this.bK = function (t3) {
    for (var t4 = [3, 0, 1, 2, 4, 5, 6, 7], aN = 0; aN < nw.length; aN++) {
      var aO = t3[aN];
      sq[t4[aN]][1].hX.textContent = aO || "";
    }
  }, this.resize = function () {
    var aN,
      kA = lS.gap,
      dA = aR.b.sJ(.085),
      aO = Math.min(4 * dA, d9.aO - 2 * kA),
      aM = nw.length;
    for (aR.b.t5(sn, kA, d9.dA - kA - dA, aO, dA), aR.b.g1(sn), aR.b.g1(so, 6), aN = 0; aN < aM - 1; aN++) aR.b.g1(nw[aN].button, 6);
    for (aN = 0; aN < aM; aN++) sq[aN][0].resize(), sq[aN][1].resize();
    for (nw[0].eT = 0, nw[0].button.style.left = aR.b.nz(nw[0].eT), nw[0].button.style.width = aR.b.t6(1.7 * dA), aN = 1; aN < aM; aN++) nw[aN].eT = nw[aN - 1].eT + nw[aN - 1].button.offsetWidth, nw[aN].button.style.left = aR.b.nz(nw[aN].eT);
    if (!sr) {
      if (!dQ.t7()) return;
      (sr = dQ.get(14)).style.width = "24%", sr.style.position = "absolute", so.appendChild(sr);
    }
    sr.style.left = aR.b.nz(0), sr.style.top = "7%", sp.t8 && (sp.scrollLeft = sp.t8);
  }, sn.style.position = "absolute", so.style.width = "25%", so.style.height = "100%", so.style.backgroundColor = bG.su, sp.style.position = "absolute", sp.style.width = "75%", sp.style.height = "100%", sp.style.backgroundColor = bG.su, sp.style.top = sp.style.right = aR.b.nz(0), aR.b.sv(sp), fc.style.height = fc.style.maxHeight = "100%", nw.push(new ap("", function () {
    sw(0);
  }, bG.sx)), nw.push(new ap("", function () {
    sw(1);
  }, bG.sy)), nw.push(new ap("", function () {
    sw(2);
  }, bG.sz)), nw.push(new ap("", function () {
    sw(3);
  }, bG.t0)), nw.push(new ap("", function () {
    sw(4);
  }, bG.t1)), nw.push(new ap("", function () {
    sw(5);
  }, bG.t2)), nw.push(new ap("", function () {
    sw(6);
  }, bG.t1)), nw.push(new ap("", function () {
    sw(7);
  }, bG.r8)), sq = new Array(nw.length);
  for (var aN = 0; aN < nw.length; aN++) nw[aN].button.style.position = "absolute", sq[aN] = [new hR(ss[aN], nw[aN].button, .25, .45), new hR("", nw[aN].button, .53, .84, 1)], nw[aN].button.style.height = nw[aN].button.style.maxHeight = "100%", nw[aN].button.top = aR.b.nz(0), fc.appendChild(nw[aN].button);
  sp.appendChild(fc), sn.appendChild(so), sn.appendChild(sp);
}
function t9() {
  this.g6 = 0, this.f1 = function () {
    tA.f1(), mF.f1(), d9.f1(), aF.b1.f1(), hO.tB(), hG.hH.f1(), dy.gK && (dy.gK = !1, jE.dd());
  };
}
function tC() {
  this.aa = new tD(), this.bz = new tE(), this.bt = new tF(), this.r = function () {
    this.aa.r();
  };
}
function tG() {
  this.resize = function () {
    var aN,
      tH = document.head.querySelector("style#ss");
    if (tH) for (aN = tH.sheet.cssRules.length - 1; 0 <= aN; aN--) tH.sheet.deleteRule(0);else (tH = document.createElement("style")).id = "ss", document.head.appendChild(tH);
    var sg = "::-webkit-scrollbar",
      tI = aR.b.nz(lS.o3),
      el = aR.b.nz(Math.max(aR.b.tJ(.012), 8));
    try {
      tH.sheet.insertRule(sg + "{width:" + el + ";height:" + el + ";}", tH.sheet.cssRules.length), tH.sheet.insertRule(sg + "-thumb{background-color:white;}", tH.sheet.cssRules.length), tH.sheet.insertRule(sg + "-track{background:" + bG.su + ";}", tH.sheet.cssRules.length), tH.sheet.insertRule(sg + "-track:horizontal{border-top:" + tI + " solid white;}", tH.sheet.cssRules.length), tH.sheet.insertRule(sg + "-track:vertical{border-left:" + tI + " solid white;}", tH.sheet.cssRules.length), tH.sheet.insertRule(sg + "-button{display:none;}", tH.sheet.cssRules.length);
    } catch (b7) {
      for (console.log("error 3425: " + b7), aN = tH.sheet.cssRules.length - 1; 0 <= aN; aN--) tH.sheet.deleteRule(0);
    }
  };
}
function tK() {
  var tL, tM, tN;
  function tO() {
    tQ(), 3 !== ct.data.botDifficultyType || aR.d.aS(ct.data.botDifficultyData) || (ct.data.botDifficultyType = 0), 3 !== ct.data.botDifficultyType && (ct.data.botDifficultyData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    3 === ct.data.botDifficultyType && aR.d.tT(tN.tU(), ct.data.botDifficultyData, tV.tW.length - 1);
  }
  function tY(aw, af) {
    var ay = new az(),
      value = (ay.b3(af < 0 ? L(50) : L(56) + " " + ey.rB[af % 9]), 0 <= af && (ay.b0(L(57) + ": " + ct.data.teamPlayerCount[af]).style.marginBottom = "1em"), af < 0 ? ct.data.botDifficultyValue : ct.data.botDifficultyTeam[af]);
    ay.ta(new tb({
      fY: tV.tW,
      value: value
    }, function (dZ) {
      af < 0 ? ct.data.botDifficultyValue = dZ : ct.data.botDifficultyTeam[af] = dZ;
    })), aw.push(ay);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(50), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, function () {
    var aw = [];
    if (function (aw) {
      var ay = new az(),
        fY = (ay.b3(L(51)), [L(52), L(53), L(54), L(55)]),
        value = ct.data.botDifficultyType;
      0 === ct.data.gameMode && (value = Math.min(value, 2), fY.splice(2, 1));
      ay.ta(new tb({
        fY: fY,
        value: value
      }, function (af) {
        tQ(), ct.data.botDifficultyType = af, 0 === ct.data.gameMode && 2 === af && (ct.data.botDifficultyType = 3), 3 !== ct.data.botDifficultyType || ct.data.botDifficultyData || (ct.data.botDifficultyData = new Uint8Array(ct.cv)), 2 !== ct.data.botDifficultyType || ct.data.botDifficultyTeam || (ct.data.botDifficultyTeam = new Uint8Array(9)), aq.fu(25);
      })), aw.push(ay);
    }(aw), 0 === ct.data.botDifficultyType) tY(aw, -1);else if (2 === ct.data.botDifficultyType) for (var aN = 0; aN < ct.data.teamPlayerCount.length; aN++) ct.data.teamPlayerCount[aN] && tY(aw, aN);else 3 === ct.data.botDifficultyType && !function (aw) {
      var ay = new az();
      ay.b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.botDifficultyData, 8)), ay.b8(tN), aw.push(ay);
    }(aw);
    return aw;
  }());
}
function tf() {
  var tg, th, ti, tj, dA, lG, fontSize, tk, tl, tm, tn, canvas, j, tp, tq;
  function tU(aN) {
    return L(0 === aN ? 58 : 1 === aN ? 59 : 2 === aN ? 60 : 61);
  }
  function u1() {
    ct.il ? u2 + 4 * lS.gap + dA + hE.u3() > hB.eU ? dE.drawImage(canvas, 2 * lS.gap + hE.u3(), u2 + 2 * lS.gap) : dE.drawImage(canvas, lS.gap, u2 + 3 * lS.gap + hE.u3()) : dE.drawImage(canvas, lS.gap, u2 + 2 * lS.gap);
  }
  function tr() {
    canvas.width = tg[0].width + tm, canvas.height = dA + tm, (j = canvas.getContext("2d", {
      alpha: !0
    })).clearRect(0, 0, tg[0].width + tm, dA + tm), j.translate(Math.floor(tm / 2), Math.floor(tm / 2)), j.lineWidth = tm, j.fillStyle = 1 === tg[0].tz ? bG.u4 : bG.iq, u5(), j.fill(), j.strokeStyle = 1 === tg[0].tz ? bG.r8 : bG.bH, u5(), j.stroke(), aR.b.textAlign(j, 1), aR.b.textBaseline(j, 1), j.fillStyle = 1 === tg[0].tz ? bG.r8 : bG.bH, j.font = lG[0], j.fillText(tU(tg[0].ty), Math.floor(tg[0].width / 2), Math.floor(.72 * tk[0] * dA)), j.font = lG[1], j.fillText(tg[0].bS, Math.floor(tg[0].width / 2), Math.floor((tk[0] + .48 * tk[1]) * dA));
  }
  function u5() {
    j.beginPath(), j.moveTo(tn, 0), j.lineTo(tg[0].width - tn, 0), j.lineTo(tg[0].width, tn), j.lineTo(tg[0].width, dA - tn), j.lineTo(tg[0].width - tn, dA), j.lineTo(tn, dA), j.lineTo(0, dA - tn), j.lineTo(0, tn), j.closePath();
  }
  this.r = function () {
    th = 4, ti = tj = tp = 0, tg = [], lG = new Array(2), fontSize = new Array(2), (tk = new Array(2))[0] = .3, tk[1] = .7, tl = new Array(4), canvas = document.createElement("canvas"), tq = dy.dz + 2e3, this.resize();
  }, this.resize = function () {
    var aN, aO;
    for (dA = Math.floor((cA.hg.hh() ? .062 : .047) * d9.dC), fontSize[0] = Math.floor(.85 * tk[0] * dA), fontSize[1] = Math.floor(.85 * tk[1] * dA), lG[0] = aR.b.dF(1, fontSize[0]), lG[1] = aR.b.dF(1, fontSize[1]), aN = tl.length - 1; 0 <= aN; aN--) tl[aN] = this.measureText(tU(aN) + "000", lG[0]);
    if (tm = Math.floor(1 + .05 * dA), tn = Math.floor(.2 * dA), 0 < tg.length) {
      for (aN = tg.length - 1; 0 <= aN; aN--) aO = this.measureText(tg[aN].bS + "00", lG[1]), tg[aN].width = aO < tl[aN] ? tl[aN] : aO;
      tr();
    }
  }, this.f1 = function () {
    0 !== th && (4 === th ? dy.dz > tq && (th = 0, 1 === ct.dX) && hK.tt(fU.tu.tv[fU.jJ].name, 3, 1, 9) : (1 === th ? (0 === ti && (tr(), ti = 1e-4), 1 <= (ti += .002 * (dy.dz - tp)) && (tj = 0, th = 2, ti = 1), dy.gK = !0) : 2 === th ? ((tj += (dy.dz - tp) / 1e3) > tg[0].u0 || 1 < tj && 1 < tg.length) && (th = 3) : 3 === th && ((ti -= .002 * (dy.dz - tp)) <= 0 && (ti = 0, tg.shift(), th = 0 < tg.length ? 1 : 0), dy.gK = !0), tp = dy.dz));
  }, this.measureText = function (bS, lG) {
    return dE.font = lG, Math.floor(dE.measureText(bS).width);
  }, this.kC = function (tx, aN) {
    this.tt(d3.dI[tx], aN, 1, 0 === aN ? 3 : 7);
  }, this.tt = function (bS, ty, tz, u0) {
    var aO;
    bS.length && (aO = (aO = this.measureText(bS + "00", lG[1])) < tl[ty] ? tl[ty] : aO, tg.push({
      bS: bS,
      width: aO,
      ty: ty,
      tz: tz,
      u0: u0
    }), 0 === th) && (ti = 0, th = 1, tp = dy.dz);
  }, this.dd = function () {
    0 !== th && 0 !== ti && (ti < 1 ? (dE.globalAlpha = ti, u1(), dE.globalAlpha = 1) : u1());
  };
}
function u6() {
  var mE = 0;
  this.r = function () {
    u7.r(), mE = 0;
  }, this.setState = function (u8) {
    mE = u8;
  }, this.jF = function () {
    return mE;
  }, this.u9 = function () {
    this.setState(8), aq.mU();
  }, this.bV = function (b7) {
    if (!fU.uA) return !1;
    if (!(dy.dz < 400)) {
      if ("Enter" === b7.key || "Escape" === b7.key) {
        if (this.uB()) return !0;
        if ("Enter" === b7.key) {
          if (0 === mE) return !0;
          if (7 === mE) return !0;
        }
      }
      return !1;
    }
  }, this.uC = function () {
    uD.resize();
  }, this.uB = function () {
    return !!uD.bU();
  }, this.mv = function (eT, eU) {
    !fU.uA || uD.mv(eT, eU) || 6 === mE && mF.mv(eT, eU) || uE.mv(eT, eU) || uF.mv(eT, eU);
  }, this.dh = function (eT, eU) {
    !uF.uG && u7.dh(eT, eU, !0) || uF.dh(eT, eU);
  }, this.click = function (eT, eU) {
    uF.uH();
  }, this.uI = function (eT, eU, deltaY) {}, this.uJ = function () {
    u7.uK(), dy.gK = !0;
  }, this.dd = function () {
    8 !== mE && 10 !== mE && (dE.imageSmoothingEnabled = !0, this.uL(), 0 !== mE && (uF.dd(), tA.dd(), this.uM(), uE.dd()), 0 !== mE && 6 === mE && mF.dd(), uD.dd(), aq.dd());
  }, this.uL = function () {
    var uO, uN;
    if (__fx.makeMainMenuTransparent) dE.clearRect(0, 0, d9.aO, d9.dA);else fU.uA ? (uN = d9.aO / fU.fV, uO = d9.dA / fU.iD, dE.setTransform(uN = uO < uN ? uN : uO, 0, 0, uN, Math.floor((d9.aO - uN * fU.fV) / 2), Math.floor((d9.dA - uN * fU.iD) / 2)), dE.drawImage(fU.uP, 0, 0), dE.setTransform(1, 0, 0, 1, 0, 0), dE.fillStyle = bG.uQ) : dE.fillStyle = bG.r8, dE.fillRect(0, 0, d9.aO, d9.dA);
  }, this.uM = function () {
    var eU = Math.floor(.3 * d9.dA),
      canvas = dQ.uR("territorial.io"),
      ew = (ew = 1.75 * d9.dA / canvas.width) * canvas.width < .98 * d9.aO ? .98 * d9.aO / canvas.width : ew,
      eT = (dE.globalAlpha = .15, dE.imageSmoothingEnabled = !1, Math.floor(.5 * (d9.aO - ew * canvas.width))),
      eT = Math.floor(eT / ew),
      eU = Math.floor(eU - .5 * canvas.height * ew),
      eU = Math.floor(eU / ew);
    dE.setTransform(ew, 0, 0, ew, eT, eU), dE.drawImage(canvas, eT, eU), dE.setTransform(1, 0, 0, 1, 0, 0), dE.globalAlpha = 1, dE.imageSmoothingEnabled = !0;
  };
}
function o() {
  this.lm = function (aY) {
    return [aY >> 12 & 63, aY >> 6 & 63, 63 & aY];
  }, this.uT = function (aY) {
    for (var a6 = this.lm(aY), aN = 0; aN < 3; aN++) a6[aN] = ~~(4.05 * a6[aN]);
    return a6;
  }, this.uU = function (aY) {
    aY = this.uT(aY);
    return aR.color.sD(aY[0], aY[1], aY[2]);
  }, this.uV = function (a6) {
    for (var aN = 0; aN < 3; aN++) a6[aN] = ~~(a6[aN] / 4.04);
    return (a6[0] << 12) + (a6[1] << 6) + a6[2];
  }, this.sD = function (uW, kA, ex) {
    return "rgb(" + uW + "," + kA + "," + ex + ")";
  }, this.fh = function (uW, kA, ex, aQ) {
    return "rgba(" + uW + "," + kA + "," + ex + "," + aQ.toFixed(3) + ")";
  }, this.uX = function (bW) {
    for (var a6 = bW.split("(")[1].split(","), uY = k3.uY, aN = 0; aN < 3; aN++) uY[aN] = parseInt(a6[aN]);
    return 4 === a6.length ? uY[3] = 255 * parseFloat(a6[3].slice(0, -1)) : uY[3] = 255, uY;
  }, this.fp = function (uZ, fS) {
    for (var a6 = uZ.slice(uZ.indexOf("(") + 1, uZ.indexOf(")")).split(","), uY = k3.uY, aN = 0; aN < 3; aN++) uY[aN] = he.hf(parseInt(a6[aN].trim(), 10) + fS, 0, 255);
    return 3 === a6.length ? this.sD(uY[0], uY[1], uY[2]) : (uZ = parseFloat(a6[3].trim()), this.fh(uY[0], uY[1], uY[2], uZ = 0 === uZ ? .3 : uZ));
  }, this.ua = function (ub, uc) {
    for (var ud = 0, aN = 0; aN < 3; aN++) ud += Math.abs(uc[aN] - ub[aN]);
    if (!(240 <= ud)) for (aN = 0; aN < 3; aN++) uc[aN] = ub[aN] + (ub[aN] < 128 ? 80 : -80);
  }, this.ue = function (a6) {
    for (var bS = "#", aN = 0; aN < 3; aN++) {
      var uW = a6[aN].toString(16);
      bS += 1 === uW.length ? "0" + uW : uW;
    }
    return bS;
  }, this.uf = function (bS) {
    var uW, kA;
    return bS.length < 7 ? bG.r8 : (uW = parseInt(bS.slice(1, 3), 16), kA = parseInt(bS.slice(3, 5), 16), bS = parseInt(bS.slice(5, 7), 16), this.sD(uW, kA, bS));
  };
}
function ug() {
  var am, uh, ui, uk;
  function uj(aN) {
    aq.fu(8, aq.fv, new fw(21, {
      pK: aN,
      pL: 0,
      pM: 10
    }));
  }
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), uh.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, ui = [new ap(L(62), function () {
    uj(5);
  }, 0, 0, 1), new ap(L(63), function () {
    uj(6);
  }, 0, 0, 1), new ap(L(64), function () {
    uj(7);
  }, 0, 0, 1), new ap("Audit Log", function () {
    uj(12);
  }, 0, 0, 1)], uk = [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })], am = new ao(L(65), uk), uh = new nv(ui, am.au);
}
function ul() {
  this.cv = 512, this.dH = 15e8, this.um = 1e9, this.un = 5e4, this.lQ = 512, this.uo = 2, this.eG = 0, this.dP = 0, this.qm = 0, this.qS = 0, this.qT = 0, this.rZ = 512, this.up = 512, this.uq = 150, this.kD = !0, this.mH = 0, this.dX = 0, this.kB = 0, this.ur = !1, this.dO = 0, this.us = 0, this.il = !1, this.rk = 0, this.rm = 0, this.cu = 0, this.ut = 0, this.gI = null, this.uu = new uv(), this.gH = 30, this.uw = 0, this.ux = 0, this.uy = 0, this.uz = 0, this.data = new nt(), this.v0 = new qu(), this.v1 = 0, this.v2 = "", this.v3 = function () {
    hG.turnstile.close(), k3.r(), nH.r(), v4.clear(), this.qm = this.dP = this.data.humanCount, this.kD = 1 === this.qm, this.ur = !1, this.mH = this.data.isReplay, this.cu = 0 === this.data.gameMode ? [7, 10, 8][this.data.battleRoyaleMode] : this.data.isZombieMode ? 9 : this.data.numberTeams - 2, this.ut = this.data.isContest, this.il = this.cu < 7 || 9 === this.cu, this.cu = 10 === this.cu && this.kD ? 7 : this.cu, this.cu = 8 === this.cu && 2 !== this.dP ? 7 : this.cu, h3.r(), this.rk = this.data.numberTeams, this.data.teamPlayerCount ? this.rm = +(0 < this.data.teamPlayerCount[0]) : (this.rm = 0, this.il && this.kD && (this.data.teamPlayerCount = new Uint16Array(9), this.data.teamPlayerCount.fill(1, 1, this.rk + 1), ct.v0.qv())), this.gH = this.dP <= 2 ? 30 : this.dP <= 50 ? 40 : 50, this.us = this.dO = this.data.selectableSpawn, this.gI = this.dO ? new v5() : null, 1 === c8.v6 ? this.rZ = this.dP : this.rZ = this.data.playerCount, this.up = this.rZ, this.qS = this.rZ - this.dP, this.qT = 0, this.eG = this.data.selectedPlayer, this.uw = 0, this.ux = 0, this.uy = 0, this.uz = 0, iW.v7(this.data.spawningSeed), gw.r(), d3.r(), gv.r(), v8.v9(), gD.gE.vA = [], gD.n1.vB = 1, __fx.donationsTracker.reset(), __fx.leaderboardFilter.reset(), __fx.spawnOptimizer && __fx.spawnOptimizer.reset(), __fx.customLobby.isActive() && __fx.customLobby.hideWindow(), ey.r(), this.dX = 1, hD.r(), vC(), d5.mj(), vD.vE(), gJ.r(), d5.r(), vF.r(), dr.r(), h0.r(), gz.r(), h4.vG(), tV.r(), v8.bd(), vH.r(), vI.r(), eI.vJ(), gF.r(), hE.r(), h5.r(), vK.r(), vL.putImageData(vM, 0, 0), h2.r(), qA.r(), hB.r(), hM.r(), hC.r(), h6.r(), gG.r(), my.r(), hK.r(), fA.r(), h7.r(), eu.r(), hJ.r(), gy.r(), gu.r(), vN(), lA.r(), di.r(), gx.r(), hA.r(), gt.r(), hN.r(), h8.r(), this.uu.r(), dy.vG(), hI.vP(), 0 === d3.eF[ct.eG] && hJ.show(!1, !0), di.dY(!0), hL.r(), dy.gK = !0, this.mH || this.kD && this.dO || cA.hg.setState(1), this.v1 = 0;
  }, this.mW = function (vQ) {
    gF.oK.vR.length ? this.v2 = gF.oK.vR : (this.v2 = gF.vS.bj(), __fx.replayHistory.save(this.v2)), aF.b1.vT(), v4.clear(), this.dX = 0, dy.vU(), cA.hg.setState(0), jE.setState(0), hG.vV.show(vQ), 2 === this.v1 ? aq.b1.vW(0) : 1 === this.v1 ? aq.fu(19) : aq.fu(5, 5);
  }, this.dn = function () {
    return this.mH ? my.mz || !hM.vX : this.kD && (my.mz || this.dO);
  }, this.f3 = function () {
    return 1 === this.dX && !this.dO;
  };
}
function vY() {
  for (var bW = document.createElement("canvas"), bW = (bW.width = 24, bW.height = 24, bW.getContext("2d", {
      alpha: !1
    })), fS = (bW.fillStyle = "rgb(0,0,0)", bW.fillRect(0, 0, 24, 24), bW.font = "22px system-ui", bW.textBaseline = "middle", bW.textAlign = "center", bW.fillStyle = "rgb(255,255,255)", bW.fillText("Q", 12, 12), bW.getImageData(0, 0, 24, 24).data), aM = fS.length, aW = 0, aN = 0; aN < aM; aN += 4) aW += fS[aN];
  return 16383 & aW;
}
function vZ() {
  var va, canvas, rB, vb;
  function vh(af, name, vi, bS) {
    rB[af] = name, canvas[af] = new Image(), canvas[af].onload = function () {
      !function (af, vi) {
        var vl,
          lo = null;
        7 === vi ? vl = aR.l.vm : 8 === vi ? (vl = aR.l.vn, lo = .1) : 3 === vi ? (vl = aR.l.vo, lo = .06) : 5 === vi ? vl = aR.l.vp : 6 === vi ? vl = aR.l.vq : 4 === vi && (vl = aR.l.vr);
        canvas[af] = aR.l.vs(canvas[af], vl, lo);
      }(af, vi), vk();
    }, canvas[af].onerror = function (b7) {
      console.error("Error loading image at index", af, "Error:", b7), vk();
    }, canvas[af].src = "data:image/png;base64," + bS;
  }
  function vk() {
    va--, ve();
  }
  function ve() {
    0 === va && (va = -1, vg(), dy.gK = !0, canvas[7] = vb, canvas[8] = vb, canvas[9] = vb, canvas[10] = vb, 5 === aq.fv) && aq.mA().vu.resize();
  }
  function vg() {
    eu.vv(), uE.vw([canvas[8], canvas[16], canvas[9], canvas[9], canvas[10]], [2 !== cA.id, 1 !== cA.id, !0, !0, !0]), da.en = new vx(), da.en.r(), hC.mj();
  }
  this.r = function () {
    if (void 0 === canvas) {
      va = 23, canvas = new Array(va), rB = new Array(va), (vb = document.createElement("canvas")).width = 1;
      for (var aN = va - (vb.height = 1); 0 <= aN; aN--) canvas[aN] = vb;
      vg(), vh(0, "exit", 6, "iVBORw0KGgoAAAANSUhEUgAAAFYAAABGBAMAAACkrn5fAAAAHlBMVEUAAAAiJCI4OjdcXltoameIioejpqPExsPY29j///9xarZIAAAAyUlEQVRIx+3WQQqCQBTG8TdOB5DUI+S6nRcoPIFhu1bBHGGO4Any3TYxAkWTv1DSYr71D4b5mOE9kWmszkeC/ZptT6Ocl+xj5qgtbVR1iZn9VE2wU2uO2Jryhm2h2OaKbdZgu/NKrXVK7f6q1JpaqTWFYpvrUtqhPTTYpst0aBOv2Drltlxh392iu0U1t5I4biX13PZvF7+zvOFWihXWlNy+aqZ/M3LcivXcds1xK9kKK3GYAVtYe+8CZ/c/7Br9blSNcgn75O/tE26TasUvH0ImAAAAAElFTkSuQmCC"), vh(1, "victory", 6, "iVBORw0KGgoAAAANSUhEUgAAADYAAAAKAQMAAADFMz9IAAAABlBMVEUAAAD///+l2Z/dAAAASUlEQVQI12M4lvj+++efLQzHkoH0jxaGI+yMbcIcZxiOpEHoMyD6xx+GHBB9oIIhA0Q/MGCoSAfSBQYMBskP2z9bAOlEIC1hAADJYSFMvxXXTAAAAABJRU5ErkJggg=="), vh(2, "defeat", 6, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(3, "orders", 6, "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"), vh(4, "crown", 4, "iVBORw0KGgoAAAANSUhEUgAAANIAAADSCAIAAACw+wkVAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIyLTEyLTIzVDE0OjA0OjQ3KzAzOjMwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTEyLTIzVDE0OjA0OjQ3KzAzOjMwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0xMi0yM1QxNDowNDo0NyswMzozMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1ZmFkNDE3NC03OWNiLTUwNDgtYWIyMi04NThmMGExODUzZTEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo4ZDQ1NTIyYS02MDRlLWYxNDUtYWM3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"), vh(5, "arena", 6, "iVBORw0KGgoAAAANSUhEUgAAACsAAAAKAQMAAAAXYzUQAAAABlBMVEUAAAD///+l2Z/dAAAARklEQVQI12OwqbdXOHyAoabe3uD4AYaURAOLYw4gygZE1dvpAKl/FXZq/g8Y/tUYGAOpY3kGxj4JDMfS7Q3PAKlke4MzCQCHpxoxsfTs8gAAAABJRU5ErkJggg=="), vh(6, "territorial.io", 6, "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phjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZYrgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEwx3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAphjuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBTDPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkCmGewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIFMM9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSK4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMsVwDwAAAAAAAAAAAAAA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jz//+c+xZMmS+PWvfx3Lly9PnQXUssWLF8c3vvGN1BmZM3To0Jg1a1bqDBJp3rx5LF++PHbcccfUKZm2dOnS+PrXv546AwAAAAAAAAAAAACAWlYvdQAAAAAAAAAAAAAAAGxLRUVFcfzxx8fhhx8eBxxwQLRv3z6aNm2aOiuv7bDDDrHffvvFfvvtFyeddFJcddVVsWrVqnjppZdi8eLFcd9998Wrr76aOhMA8t7IkSON9uSAAw44II455piYP39+6hQAAAAAAAAAAAAAAGqR4R4AAAAAAAAAAAAAAPJe7969o0+fPtG9e/fo1KlTNGrUKHVSnVZQUBB77rln7LnnntG3b9+49NJL469//Ws899xz8cQTT8Ttt98eH330UepMAMg7/fv3T53APw0ZMsRwDwAAAAAAAAAAAABAHWe4BwAAAAAAAAAAAACAvNOyZcs49dRT49BDD41u3bpF8+bNUydlWkFBQbRp0ybatGkTJ554Ylx77bXxwgsvxJNPPhn33HNPLF26NHUiAOS83r17x9577506g3864ogjon79+rFhw4bUKQAAAAAAAAAAAAAA1BLDPQAAAAAAAAAAAAAA5IX9998/TjnllDj88MNj//33j3r1XBKfq0pKSuKggw6Kgw46KC688MJYtmxZPPnkk3HXXXfFU089lToPAHLSwIEDUyfwb5o2bRpnn312zJw5M3UKAAAAAAAAAAAAAAC1xKcUAQAAAAAAAAAAAADIWd26dYvBgwfHEUccER06dIiCgoLUSVRTQUFBdOjQITp06BDnnHNOrFixIhYsWBCzZ8+ORYsWpc4DgJzRs2fP1Al8QZ8+fQz3AAAAAAAAAAAAAADUYYZ7AAAAAAAAAAAAAADIKR06dIgzzzwzevfuHZ06dTLWU8e0adMmvve978XZZ58dr776asydOzdmzpwZK1asSJ0GAMkccsghsccee6TO4AsOOuig1AkAAAAAAAAAAAAAANSiwtQBAAAAAAAAAAAAAABQv379GD58eCxcuDD++Mc/xsiRI6Nz585Ge+qwgoKC2GeffWLEiBHx5z//OZ588sk477zzoqioKHUaAGx3/fr1S53AlygtLY3evXunzgAAAAAAAAAAAAAAoJbUSx0AAAAAAAAAsK3df//9sdtuu6XOAHLE9OnT44477kidwSaMGzfOgZR1wG233RYzZ85MnUEeuuWWW2KfffZJnUEVvffee16zAagVRx55ZJx99tlx1FFHRdOmTVPnkEj9+vWjV69e0atXrxg/fnw8/PDDMW3atHj++edTpwHAdtG9e/fUCWzC0UcfHfPmzUudAQAAAAAAAAAAAABALTDcAwAAAAAAANQ5Xbp0iT333DN1BpAjdt9999QJbMacOXOivLw8iouLU6ewFZo2bWq4h2rr2bNnDBw4MIqKilKnUEVXXHFF6gQA6pD69evHiBEj4uSTT479998/dQ45plmzZnHaaafFwIEDY8mSJTF79uy48cYbU2cBQK0ybpy7unbtmjoBAAAAAAAAAAAAAIBaUpg6AAAAAAAAAACA7HrxxRfjvvvuS53BVmrXrl2cddZZqTPIM6NGjTLak0dWrVoV48aNS50BQB3QsWPHuOWWW+Lvf/97TJ482WgPm1VUVBQHHXRQXH/99bFy5cqYMmVKlJaWps4CgG1u//33j2bNmqXOYBP23nvv1AkAAAAAAAAAAAAAANQSwz0AAAAAAAAAACQ1bty4WLduXeoMttK5556bOoE80rlz5zjmmGNSZ1AN11xzTVRUVKTOACCPHXPMMfHQQw/F888/H6eddprxFaptjz32iAsvvDBWrFgRs2fPjs6dO6dOAoBt5rDDDkudwGbstttu0bp169QZAAAAAAAAAAAAAADUAsM9AAAAAAAAAAAktXLlyrjjjjtSZ7CVunbtGv3790+dQZ4oKyuLBg0apM6gil588cWYNm1a6gwA8tSgQYNi8eLF8cgjj8Q3v/lN7wHYajvuuGMMGjQolixZEg8++GD07NkzdRIAbLX27dunTmALevTokToBAAAAAAAAAAAAAIBaYLgHAAAAAAAAAIDkxo4dG++//37qDLbSj370o9QJ5IFWrVrFcccdlzqDKtq4cWNceumlqTMAyEPf+9734oUXXojZs2fHN77xjSgoKEidRB1TXFwcxx57bDzxxBMxb968OPLII1MnAUCNfe1rX0udwBZ06tQpdQIAAAAAAAAAAAAAALXAcA8AAAAAAAAAAMmtWbMmbrrpptQZbKVevXpFr169UmeQ48rLy6NRo0apM6iixx9/PO6///7UGQDkkWHDhsUrr7wSN9xwQ+y3336pc8iAoqKiOProo2PevHmxYMECAz4A5KUWLVqkTmALvvrVr6ZOAAAAAAAAAAAAAACgFhju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FpLMnDkzmjZtmp1RdEpLS7MTAAAAAAAAAFhKDbIDAAAAAAAAAACgEAwdOjR23333qKioyE5hMcrKyuKUU06JX/ziF9kpNebggw822lPH3HDDDUZ7AOqhX//610Z7CtT8+fPj5ptvjr59+0ZVVVV2TkEZPnx4PPvss3HddddFx44ds3NYRj169Iju3bvH2LFjs1MAAChSO+ywQ/Ts2TM23njjWGeddWLNNdes80MFy2qVVVaJVVZZJbp06fKtf//ZZ5/FO++8E//6179izJgx8fjjj8f777+fVAnA8tS2bds46KCDomfPnrHRRhtFu3btspOW2P//eLbRRhvFvvvuGxdddFF88sknMW7cuBg7dmzcc889fucEAAAAAAAAAECdVBIR87MjAAAAAAAAAGrSv//971hzzTWzM4raBx98EGuvvXZ2BkCtu+yyy+K4447LzqAa5s6dG926dYu33347O6VGjB49Onr06JGdwQIfffRRdOrUKebNm5edAsASeu+99/w8W4Bmz54dQ4YMiUsvvTQ7paCVl5fHyJEjY/vtt89OYRndcMMNcdRRR2VnUEe89NJLsemmm2ZnFJ1+/frFddddl50BAMtdw4YNY++9946tt946unfvHuutt140b948O6vOmj9/fnz00Ucxbty4GDNmTDz22GPx4osvZmcBsJS6d+8eBx98cGy11VbRtWvXaNCgQXbScjdhwoR44YUX4vHHH4877rjD86mwnMycOTOaNm2anVF0SktLsxMAAAAAAAAAWEqGewAAAAAAAICCY7gnn+EeoFiVl5fHW2+9Fa1bt85OoRpuvvnmOPzww7Mzltmuu+4af/rTn7IzWMivf/3ruOSSS7IzAFhCBx98cNx8883ZGdSwKVOmxGGHHRaPPPJIdkrRuPTSS6N///5RVlaWncJS+vjjj2ONNdbIzqCOMNyTw3APAIWsd+/esdtuu8UWW2wRG2ywQTRp0iQ7qV77z3/+E6+99lq88MILMXLkyHj33XezkwBYhE6dOsWRRx4ZO+20U2ywwQZRUlKSnZTmyy+/jOeffz7uvffeuOmmm6Kqqio7CQqG4Z4chnsAAAAAAAAA6i/DPQAAAAAAAEDBMdyTz3APUMzOOuusGDJkSHYG1fDll19Gp06dYsqUKdkpy+Svf/1rbL311tkZLPDGG29Et27dsjMAWApPPvlkbLPN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ZwAAUIPatm0bd955Zzz22GPxk5/8JDuHeqisrCz22GOPGDNmTFx22WXRsGHD7CSAGtOtW7d45ZVXYu+9985OYRmsscYacffdd8dZZ52VnQIAAAAAAAAAQB1nuAcAAAAAAAAAAGrBxIkT45ZbbsnOoBp23nnn6NSpU3bG/zjyyCOzE1hg1KhR8dRTT2VnALAMDj744OwElkJlZWWccsopMWHChOwUatCbb74ZJ510UnzzzTfZKSzCLrvskp0AAEANOfPMM+ONN96IfffdNxo0aJCdQz3XvHnzOO644+Ktt96KQw45JDsHYJn16dMn/vKXv8QGG2yQnUINaNSoUQwZMiQefPBBI3MAAAAAAAAAAPwgwz0AAAAAAAAAAFBLBg0aFJ999ll2BouxwgorxODBg7MzvuWggw6KLl26ZGcQEbNnz46BAwdmZwCwjHr37p2dwFK46aab4tZbb83OYDm47bbb4qabbsrOYBG23HLL7AQAAJZR796947XXXoszzjgjVl555ewcCsxaa60VN910Uzz22GOx7rrrZucALJWBAwfGjTfeGKusskp2CjXs5z//ebz88sseowAAAAAAAAAA+F6GewAAAAAAAAAAoJbMmDEjbrjhhuwMqmHPPfeMli1bZmf8V//+/bMTWOC2226LN998MzsDgGWw0047xRprrJGdwRJ6/fXX4+ijj87OYDn61a9+FePHj8/O4Ad07NjRwaYAAPVU48aN4/e//338+c9/jm7dumXnUOC22267GD16dAwePDg7BWCJXHvttTFixIho1KhRdgrLSbdu3eKvf/1rbLXVVtkpAAAAAAAAAADUMYZ7AAAAAAAAAACgFg0dOjQmTpyYncFilJeX15lD5XbZZZfYdNNNszOIiM8++ywGDBiQnQHAMvrFL36RncASmjNnTvTv3z+qqqqyU1iOKisr45hjjok5c+Zkp/A9SkpKYu+9987OAABgCe2+++4xbty4OPzww6Nhw4bZORSJlVZaKc4+++x48cUXo2vXrtk5AItUWloa999/fxx55JFRUlKSncNy1rZt23jggQdin332yU4BAAAAAAAAAKAOMdwDAAAAAAAAAAC1qLKyMq644orsDKph//33j8aNG2dnxIknnuiQqDrimmuuienTp2dnALCMevXqlZ3AErrmmmvihRdeyM6gFjz77LNxzTXXZGfwA7ba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XFRVVWXnLFcnnHBC7LfffjF58uTsFBY44ogjshMAKDAbbLBBdgIAAAAAAAAAAAsx3AMAAAAAAAAAAEXq+uuvj9deey07A37QXXfdFW+88UZ2BgB1WIsWLbITWMg777yTnQAAALDM9t9//+wEFjJmzJjYcsst4/77789OqTX3339/bL311jFu3LjsFCKid+/e0axZs+wMAApIhw4dshMAAAAAAAAAAFhIg+wAAAAAAAAAAAAgz/nnnx933nlnlJSUZKfAt0ybNi0GDBiQnQFAHdapU6do2LBhdgYLGTt2bHYCAADAMtlyyy1jk002yc5ggbvuuisOPPDAqKqqyk6pdW+++WZsuumm8fDDD0evXr2yc4raSiutFP369YuLL744OwWoY6ZNmxZTp06NL774Ij7//PP46quvIiJi5syZ0bx584iIaNSoUZSXl8eKK64YK6+8cqy66qrRuHHjzGzqgDXWWCM7AQAAAAAAAACAhRjuAQAAAAAAAACAInb33XfHscceGz/96U+zU+Bbrr322pgyZUp2BgB12DrrrJOdwELmzJljuAcAAKj3jj76aEP3dcD8+fPjiiuuiBNPPDE7JdWcOXNiu+22i3vvvTd233337JyitsceexjugSJWVVUV77zzTvzrX/+KcePGxauvvhrPPPNMTJ8+famut/7668emm24a3bp1i/XWWy822GCDaN++ve9BishKK60U66+/frz55pvZKQAAAAAAAAAAhOEeAAAAAAAAAAAoemeffXY88sgjUVZWlp0CERExYcKEOOOMM7IzAKjjVl999ewEFvLZZ59lJwAAACyTsrKy2HHHHbMzit78+fPjnHPO8TviBaqqqmLPPfeMe+65J/baa6/snKK16aabRocOHeL999/PTgFqyaxZs+LFF1+Mxx9/PEaOHBkffvhhjV37zTff/J/Blg4dOsTee+8dvXv3jk033TRWWmmlGrsfdVPPnj0N9wAAAAAAAAAA1BGl2QEAAAAAAAAAAECuJ598Mh577LHsDPiviy++OCorK7MzAKjjVltttewEFjJlypTsBAAAgGVy5JFHRsuWLbMziprRnh+27777xiOPPJKdUbQaNmwYRx55ZHYGsJxVVVXFyy+/HKecckq0adMmtt9++7joootqdLTnh7z//vtx4YUXxg477BCtWrWKE044IZ599tn45ptvlvu9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222XnUIttWvXLh588MHo0KFDdgq19Pjjj2cnAADUi2nTpmUnFJX9998/tt566+wMAACARrHddttFeXl5dgYAAAAAAAAAG8BwDwAAAAAAAAAANICKioooLXV7TiGaOXNmjB8/Pjvjcy1evDhuueWW7AxqoUWLFjFixIjsDAA20NKlS2Py5MnZGWykr33ta/Hggw86DK0JKC8vj4cffji6dOmSnUItrVu3Lm677bbsDACAenHffffF2rVrszOKRuvWreP000/PzgAAAGgUpaWl8b3vfS87AwAAAAAAAIAN4GQQAAAAAAAAAACoZz/60Y9iv/32y86gBmPHjs1OqJUhQ4bEwoULszOohQMOOCAOP/zw7AwANtCtt96anUA96Nq1a/zhD3+IFi1aZKdQgxYtWsRDDz0UXbt2zU6hDl5++eWYNWtWdgYAQL1YunRpvPHGG9kZReWYY47JTgAAAGg03/nOd7ITAAAAAAAAANgAhnsAAAAAAAAAAKCeDRo0KEpKSrIzWI9nnnkm7rjjjuyMWlmxYkXceOON2RnUQklJSQwePDg7A4ANdOedd8bbb7+dnUE9+M53vhOPPfaY8Z4CVF5eHk8++WR07949O4U6euKJJ7ITAADq1QsvvJCdUFR22WUX4z0AAEDR6Nq1a3YCAAAAAAAAABvAcA8AAAAAAAAAANSj448/3iEMBWrdunUxatSo7Iw6qaioiHfffTc7g1rYe++945e//GV2BgAb6IEHHshOoJ706NHDeE+Badu2bUyaNCm6deuWnUIdrVu3Lm6++ebsDACAevXMM89kJxSdU089NTsBAACgUXTp0iVKSx3nBAAAAAAAANDUbJIdAAAAAAAAAAAAzck555yTnUANpkyZEg899FB2Rp2sWbMmxo8fH0OHDs1OoRbOOuusuP7666O6ujo7BYA6uuyyy+LUU0+NTTfdNDuFetCjR4+YPHly9OrVK5YtW5adU9R23nnneOCBB2L33XfPTmEDvPTSS/Hcc89lZwAA1Kt77rknxo4d6yDlRvSd73wnunfvHlOnTs1O4TO23nrrOPnkk7Mzmp2VK1fGFVdckZ0BAECCzTffPA4//PC49957s1MAAAAAAAAAqAPDPQAAAAAAAAAAUE/69esXu+22W3YG61FdXR2jRo3KztggI0eOjBNPPDE6duyYncIX6NSpUwwePDhGjBiRnQJAHc2dOzemTJkSPXv2zE6hnuy7774xefLkOPzww+Odd97JzilK3bt3j9tuuy123HHH7BQ20KOPPpqdAABQ7+bOnRuvvfZa7LLLLtkpRaO0tDTOO++8OPjgg7NT+IzTTz89KioqsjOanZdfftlwDwBAETvyyCMN9wAAAAAAAAA0MaXZAQAAAAAAAAAA0ByUlpZG//79szOowaOPPhqTJk3Kztgg1dXVce2112ZnUEunnXZalJeXZ2cAsAFuuumm7ATq2Te/+c2YPHlydO3aNTul6BxzzDHx4IMPGu1pwtauXRvjx4/PzgAAaBB/+9vfshOKzkEHHRT77rtvdgafceihh2YnNEtvvfVWdgIAAIkOOOCAKC11pBMAAAAAAABAU+K3vAAAAAAAAAAAUA/OPvvs6NSpU3YG67FmzZqorKzMztgoY8eOjddeey07g1rYdtttm/znG0CxmjBhQrzxxhvZGdSzjh07xp/+9Kc4+uijs1OKxpgxY+KWW26Jtm3bZqewEZ577rmYM2dOdgYAQIOYPHlydkLRKSsrixEjRmRn8Cl77713fPOb38zOaJZeffXV7AQAABJtt9120bt37+wMAAAAAAAAAOrAcA8AAAAAAAAAAGyksrKy6NevX3YGNZg4cWJMmzYtO2OjXXXVVdkJ1NKJJ54YHTt2zM4AYAPccccd2Qk0gK222ipuvvnmGDp0aHZKs1ZeXh4PP/xwnHPOObHJJptk57CR7rvvvuwEAIAGc+utt8bKlSuzM4rOd7/73Tj88MOzM/hfp556apSUlGRnNEsvvPBCdgIAAMlOOumk7AQAAAAAAAAA6sBwDwAAAAAAAAAAbKQRI0bEDjvskJ3BeqxevTqGDBmSnVEvLr/88pg9e3Z2BrWw+eabx6hRo7IzANgAF198cSxbtiw7gwaw6aabxtChQ+OBBx6I8vLy7Jxm55BDDomZM2dGr169slOoBx999FFcffXV2RkAAA1m1apVMWvWrOyMolNSUhIVFRXZGUREq1at4kc/+lF2RrP15JNPZicAAJDs29/+dvTs2TM7AwAAAAAAAIBaMtwDAAAAAAAAAAAboby8PPr06ZOdQQ3uv//+eOGFF7Iz6s24ceOyE6ilI488Mrp27ZqdAUAdLV26NB5++OHsDBrQoYceGjNmzIiDDjooO6XZuPTSS+Oee+6Jjh07ZqdQT5544olYsWJFdgYAQIN66qmnshOK0je/+c0YPHhwdkbRGzp0aGy11VbZGc3S+++/H3Pnzs3OAAAgWWlpaQwaNCg7AwAAAAAAAIBaMtwDAAAAAAAAAAAbYfjw4dG+ffvsDNZj5cqVMWTIkOyMenX99dfHzJkzszOohU033TQqKyuzMwDYAJdffnlUVVVlZ9CAdt5553jwwQfjoosuitJSt9RvqP333z+ef/75+NWvfhWbbrppdg716IYbbshOAABocPfcc092QtH61a9+FR06dMjOKFqtWrWKn//859kZzdZrr72WnQAAQIE44IAD4qijjsrOAAAAAAAAAKAWPMsQAAAAAAAAAAA2ULt27eLEE0/MzqAGd955Z7z++uvZGfXu0ksvzU6glnr27Bm9evXKzgCgjp555pmYOnVqdgYNrGXLlnHmmWfG3/72t+jRo0d2TpPSqlWruOaaa+JPf/pTfOMb38jOoZ7NmTMnHnrooewMAIAG9+yzz8Ybb7yRnVGUttpqq7j66quzM4pWZWVlbLvtttkZzdYLL7yQnQAAQIEoKSmJkSNHRllZWXYKAAAAAAAAAF/AcA8AAAAAAAAAAGygUaNGRdu2bbMzWI9ly5ZFRUVFdkaDuPXWW2P69OnZGdRCaWlpDB06NDsDgA1wxRVXZCfQSL7xjW/Eo48+Gtddd12Ul5dn5xS8fv36xSuvvBK/+MUvYtNNN83OoQE88MAD2QkAAI3GaGuegw8+OE4//fTsjKKz8847R58+fbIzmrVp06ZlJwAAUEB22WWXuPzyy7MzAAAAAAAAAPgChnsAAAAAAAAAAGADdO7cOX7yk59kZ1CDCRMmxLx587IzGszFF18c69aty86gFv7f//t/0bt37+wMAOro3nvvjVmzZmVn0Eg23XTTOPnkk2POnDlx3nnnZecUpB/84Acxffr0uPzyy2OnnXbKzqGBrFixIsaNG5edAQDQaO69997shKI2dOjQ2HXXXbMzisq4ceNiiy22yM5ottauXRsPPvhgdgYAQKxZsyY7gU855ZRT4uijj87OAAAAAAAAAOBzGO4BAAAAAAAAAIANMGzYsGjTpk12BuuxePHiGDZsWHZGg7r77rvj6aefzs6gls4+++zsBAA2wA033JCdQCPbbrvtorKyMmbPnh3HHntsdk5B6NmzZ0yaNCkeeuih6Nq1a3YODeyRRx6JBQsWZGcAADSaP/zhD7Fw4cLsjKK11VZbxS233BKlpZ7q3Bj69OkTBx98cHZGs/bWW2/F0qVLszMAAAz3FJhNNtkkrrjiithrr72yUwAAAAAAAACogbtZAQAAAAAAAACgjrp06RJHHnlkdgY1uPnmm2PRokXZGQ1u7NixUV1dnZ1BLeyyyy5x7rnnZmcAUEdXXnllvP3229kZJNh1113j1ltvjWeffTZ69+6dnZPiiCOOiCeeeCL+9Kc/xXe/+10HaReBdevWxZVXXpmdAQDQ6KZMmZKdUNS+9a1vxXXXXZed0ex16NAhKisro6SkJDulWXvppZeyEwAAKFDt2rWLO++8M3beeefsFAAAAAAAAADWw7PnAAAAAAAAAACgjkaOHBktW7bMzmA9Fi5cGOeff352RqN4+OGHY/LkydkZ1FK/fv2iVatW2RkA1NGNN96YnUCib33rWzF+/Ph4+eWXY8CAAc1+vKasrCzOPPPMmDVrVtxzzz2x//77N/uPmf/Pc8895/sLAKAo3XvvvdkJRe+kk06KX//619kZzdqtt94a2267bXZGs/fXv/41OwEAgALWqVOn+NOf/mS8BwAAAAAAAKAAeRYdAAAAAAAAAADUQbdu3eLggw/OzqAG48ePj1WrVmVnNJoxY8ZEVVVVdga18OUvfzlGjRqVnQFAHVVWVsb8+fOzM0i2yy67xMUXXxzvvvtu3HDDDdG1a9fspHrVo0ePuPXWW2PBggVx0UUXxR577JGdRIKbbropOwEAIMUdd9wR7733XnZGUSspKYlRo0bFEUcckZ3SLF1xxRXRvXv37Ixmr7q6Ou68887sDACAiIiium+mqencuXM88cQTvkYHAAAAAAAAKDCGewAAAAAAAAAAoA4qKiqiRYsW2Rmsx7vvvhvDhg3LzmhUjz/+eDz22GPZGdTSSSedFDvuuGN2BgB1UFVVFbfcckt2BgVi2223jZNOOin++te/xvTp0+O8886L7bffPjtrg+yzzz5x+eWXx+zZs+PJJ5+MY489NrbeeuvsLJLMnTs3rr766uwMAIA0f/7zn7MTil6rVq3i+uuvj27dumWnNCtnnHFG/Nd//Vd2RlF49dVXY+7cudkZAAAREbF69ersBD5Hhw4d4uGHH45+/fplpwAAAAAAAADwvwz3AAAAAAAAAABALfXs2TN69uyZnUENrrzyyqiqqsrOaHSVlZWxZs2a7AxqoW3btlFZWZmdAUAdDR8+PN57773sDApIaWlpdO3aNSorK+Ott96K6dOnx4UXXhh77bVXdlqNysrK4rjjjosbb7wxXn755fjrX/8a/fr1i1133TVKSkqy80h26623ZicAAKS67bbbshOIiK222iruueee6Nq1a3ZKs3DsscfGhRde6Hu+RvLcc89lJwAA/JPhnsK3+eabx+WXXx4PPPBAdOjQITsHAAAAAAAAoOgZ7gEAAAAAAAAAgFqqqKiI0lK33BSiN998My666KLsjBTTpk2LiRMnZmdQS0cffXR84xvfyM4AoA5WrVoVEyZMyM6gQLVo0SK6du0aZ511Vjz33HMxd+7ceOihh2LYsGHRrVu3tK527dpF796947rrrou//OUv8cEHH8Qtt9wSJ5xwQuyyyy4ObuaflixZEqNHj87OAABI9cADD8Tbb7+dnUFEbLvttnHPPff4GepGOvzww+O3v/1tbLrpptkpReOJJ57ITgAA+Kfly5dnJ1BLhx56aDz//PMxZsyYaNWqVXYOAAAAAAAAQNHaJDsAAAAAAAAAAACagh/96Eex3377ZWdQgyuuuCKqq6uzM9KMGDEivv/970fLli2zU/gCrVq1isrKyjj00EOzUwCog/PPPz+OPfbY2HbbbbNTKGAlJSXRoUOH6NChQxx88MFRUVERS5YsiXfeeSfmzp0br732WsyZMydmzJgRL7zwQr18/dqlS5fYbbfdolOnTrHrrrvGV7/61fjKV74S22+/fZSVldXDR0Vzd8cdd8SqVauyMwAA0j366KNxyimnZGcQETvttFP86U9/ih//+McxderU7Jwm57jjjourr746Nt988+yUorFy5UqjzwBAQVm9enV2AnWw5ZZbxjnnnBM/+9nP4vbbb4+xY8fG4sWLs7MAAAAAAAAAiorhHgAAAAAAAAAAqIVBgwZFSUlJdgbrMXv27Bg3blx2RqoZM2bEgw8+GD/+8Y+zU6iFH/zgB9GzZ8+YNGlSdgoAtbRq1aq48cYb45xzzslOoYnZaqutYquttopvfvOb//LyqqqqWLZsWSxZsiSWLl0aH374YVRVVcXHH38ca9eujY8//jgiIlq0aBGtWrWKiIjy8vLYfPPNY/PNN482bdrENttsE5tuumljf0g0I8uXL4+RI0dmZwAAFITx48fHySef7PcABWLbbbeN+++/P04++eS4//77s3OajDPOOCPGjh0bLVu2zE4pKjNmzIg1a9ZkZwAA/JOx9qZphx12iLPOOitOPfXUePLJJ+Puu++OCRMmRHV1dXYaAAAAAAAAQLNnuAcAAAAAAAAAAL7A8ccfH127ds3OoAaXXXZZdkJBGD58eBxyyCHRunXr7BS+QFlZWQwfPtxwD0ATU1FRET/72c9ihx12yE6hGSgrK4stt9wyttxyy+wUitidd94ZCxYsyM4AACgIzz77bMycOTP22muv7BT+11ZbbRW33XZbDB48OC699NLsnII3bty46Nevn/GpBI8++mh2AgDAv1i2bFl2AhuhTZs2ceihh8ahhx4al112WcyYMSOeeeaZePrpp2PSpEkpo5G77rpr7LnnntGpU6fo0KFDvPTSS3HllVc2egcAAAAAAABAQzHcAwAAAAAAAAAAX+Ccc87JTqAGM2fOjPHjx2dnFITZs2fHfffdF8cdd1x2CrWw7777xnHHHRcTJkzITgGgltasWRPjx4+PoUOHZqcAbLSVK1fG6NGjszMAAArKPffcY7inwLRq1Souuuii2H333eOUU06J6urq7KSCs/3228eECRPiP/7jP7JTitKaNWvixhtvzM4AAPgXS5cuzU6gnmy55ZZx4IEHxoEHHhgREZ988km89dZbMXfu3FiwYEEsWLAg3n333Zg3b14sWbIkVq9eHYsXL44PP/wwqqurY8stt/znY2222WaxxRZbRETEl770pWjbtm1sscUWseWWW8bmm28ebdq0ifLy8thmm21iq622iq222uqfr2/VqtW/dE2YMMFwDwAAAAAAANCsGO4BAAAAAAAAAIDP0a9fv9htt92yM6jBRRddlJ1QUIYOHRqHHXZYtGnTJjuFWjj33HMN9wA0MSNHjowTTjghvvrVr2anAGyU++67L958883sDACAgnLllVfGwIEDo7y8PDuFTykpKYmTTjop9t577/j5z38es2bNyk4qGMcee2xcdNFF8eUvfzk7pWjNnDkz5s2bl50BAPAvlixZkp1AA9l0001jl112iV122SU7BQAAAAAAAKBZKc0OAAAAAAAAAACAQlVaWhr9+/fPzqAG06dPj9tvvz07o6C8+eabceedd2ZnUEu77bZbnHnmmdkZANRBdXV1XHLJJdkZABtl+fLlMWTIkOwMAICCs2zZsnj88cezM6jBN77xjZg8eXKce+652Snptt566/jv//7vuOmmm4z2JHvssceyEwAA/o/33nsvOwEAAAAAAAAAmhTDPQAAAAAAAAAAUIOzzz47OnXqlJ3Beqxbty4qKyuzMwpSRUVFLF26NDuDWurfv3+UlZVlZwBQB1dffXU8//zz2RkAG+zOO++MuXPnZmcAABSk3/72t9kJfI4tttgiRo0aFU8//XR07do1O6fRlZaWxpAhQ+Kll16Ko48+2s+Wk1VVVcWtt96anQEA8H8sWrQoOwEAAAAAAAAAmhTDPQAAAAAAAAAAsB5lZWXRr1+/7AxqMGXKlHjooYeyMwrS/Pnz4/bbb8/OoJZ23HHHGDVqVHYGAHVUWVkZ69aty84AqLNly5bFsGHDsjMAAArWpEmTYtasWdkZfIF99903pkyZEjfccENsvfXW2TmNonfv3vHyyy/H8OHDo3379tk5RMTf/va3mDNnTnYGAMD/8Y9//CM7AQAAAAAAAACaFMM9AAAAAAAAAACwHiNHjowddtghO4P1qK6uNnTyBSoqKmLx4sXZGdTSySefHO3atcvOAKAO7rvvvnjiiSeyMwDq7Kabbop58+ZlZwAAFDTD6E1Dq1at4qSTToo5c+bEpZdeGuXl5dlJ9a60tDROP/30mDlzZowfPz7+7d/+LTuJT7nvvvuyEwAA1mvGjBnZCQAAAAAAAADQpBjuAQAAAAAAAACAzygvL4/evXtnZ1CDxx57LCZNmpSdUdAWL14ct9xyS3YGtbTVVlvFmDFjsjMAqKNzzjknVq1alZ0BUGsLFiyI8847LzsDAKDg/eY3v4n3338/O4Na2nrrreNXv/pVvPHGG3H55ZdHhw4dspM22vbbbx9jxoyJt956K8aNGxd77rlndhKf8dFHH8WVV16ZnQEAsF6LFy+Ojz76KDsDAAAAAAAAAJoMwz0AAAAAAAAAAPAZI0aMiPbt22dnsB5r1qyJUaNGZWc0CUOGDImFCxdmZ1BLP/nJT2K33XbLzgCgDmbMmBETJkzIzgCotauvvjpWrFiRnQEAUPDWrFkT9957b3YGdbT11ltHv3794uWXX4777rsvDj/88OykOikrK4u+ffvG448/Hm+88Uacc845sdNOO2VnUYMnn3zS91cAQEEzRgoAAAAAAAAAtWe4BwAAAAAAAAAAPqVdu3ZxwgknZGdQg4kTJ8bUqVOzM5qEFStWxI033pidQS21bt06KisrszMAqKOzzz7bUB7QJLz22msxevTo7AwAgCbjwgsvjFWrVmVnsAG+9KUvxWGHHRb33ntvvPXWW3HttdfGgQcemJ21Xh07doxzzz03HnnkkVi0aFFcccUVccABB0TLli2z0/gCxpwBgEL33nvvZScAAAAAAAAAQJNhuAcAAAAAAAAAAD5l9OjR0bZt2+wM1mP16tUxdOjQ7IwmpaKiIt59993sDGrp0EMPjR49emRnAFAHS5cujUsvvTQ7A+ALVVZWRnV1dXYGAECT8eabb8ajjz6ancFG+spXvhKnnHJKPPbYYzFv3ry455574swzz4xdd901pWfvvfeOgQMHxu233x4vvvhivPbaazFq1Kg46KCD/G6qCZk7d27cdddd2RkAAJ/LcA8AAAAAAAAA1N4m2QEAAAAAAAAAAFAoOnfuHMccc0x2BjV44IEHYtasWdkZTcqaNWti/PjxBo+aiLKyshg+fHgccMAB2SkA1MFFF10UxxxzTOy9997ZKQDrNXny5LjllluyMwAAmpxLLrkk/vM//zNKS0uzU6gH22+/fRxxxBFxxBFHxIUXXhjz5s2LN998M1599dV46aWX4oUXXojp06fHihUrNuo6LVq0iH322Sf22GOP+Ld/+7f46le/GjvuuGN06tQpttpqq3r6aMh0xx13ZCcAAHyhefPmZScAAAAAAAAAQJNhuAcAAAAAAAAAAP7XsGHDok2bNtkZrMfKlStj8ODB2RlN0siRI+PEE0+Mjh07ZqdQCz169Igf//jHcdddd2WnAFAHZ511VjzyyCPRokWL7BSAf/HJJ5/Eueeem50BANAkPfXUUzFlypTYf//9s1OoZyUlJbHTTjvFTjvtFP/xH//xz5evW7culixZEkuXLo2PPvooli1bFsuXL4+1a9fGunXr4uOPP47WrVtHRMRmm20WJSUl8aUvfSnatm0bW2yxRWy++eax+eabZ31YNIKPPvooLr744uwMAIAv9Morr2QnAAAAAAAAAECTYbgHAAAAAAAAAAAiokuXLnHkkUdmZ1CDu+66K15//fXsjCapuro6rr322hgzZkx2CrVQUlIS559/vuEegCZm8uTJcdttt8WJJ56YnQLwL2699dZ45plnsjMAAJqsSy+9NP7jP/4jSkpKslNoBCUl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N96II488Mqqrq7NTAACohdmzZ8f5558f69aty04BvkBVVVWceeaZficCABSVe++9NzsBAAAAAAAAAAqO4R4AAAAAAAAAAJql7t27R69evbIzqMEDDzwQzz//fHYG6zF//vy4/fbbszOog29/+9tx0kknZWcAsJGOOOKImDVrVnYGUEAWL14cP/3pT2PRokXZKQAA1ME111wTd911V3YG8AWuu+46/68CAEXnsssuiwULFmRnAAAAAAAAAEBBMdwDAAAAAAAAAECzNHjw4GjRokV2BuuxcuXKGDx4cHYGn6OioiIWL16cnUEdDBw4MDsBgI20atWqOPLII2PevHnZKUAB+Pjjj6N3797x3HPPZacAALAB+vTpE6+//np2BlCDZ555Jk4//fTsDACARldVVWW8EAAAAAAAAAA+w3APAAAAAAAAAADNTs+ePaNnz57ZGdTgrrvucmBhgVu8eHHccsst2RnUwS677BLnnHNOdgYAG+nNN9+M4447Lj744IPsFCBRVVVVnHnmmfGHP/whOwUAgA20YsWK6N27d6xYsSI7BfiMRYsWxYknnhjV1dXZKQAAKS666KJYuXJldgYAAAAAAAAAFAzDPQAAAAAAAAAANDsVFRVRWurWmEK0fPnyGDJkSHYGtTBkyJBYuHBhdgZ1cPrpp0erVq2yMwDYSE899VScfPLJ8fHHH2enAEkuuOCCuOaaa7IzAADYSFOnTo0hQ4bEunXrslOA/1VVVRUDBgyIV199NTsFACDNvHnz4pFHHsnOAAAAAAAAAICC4XQSAAAAAAAAAACalaOOOir222+/7AxqcMstt8S8efOyM6iFFStWxI033pidQR1sv/32UVlZmZ0BQD247777on///rFmzZrsFKCR/fa3vzV2CgDQjFx22WVx++23Z2cA/+uqq66KCRMmZGcAAKSrrKyM1atXZ2cAAAAAAAAAQEEw3AMAAAAAAAAAQLMycODAKCkpyc5gPZYsWRLDhg3LzqAOKioq4t13383OoA569+4d22+/fXYGAPVg/PjxMXTo0Fi3bl12CtBIbr/99ujbt292BgAA9ezEE0+M5557LjsDit4f//jH+NWvfpWdAQBQEJ5//vl48MEHszMAAAAAAAAAoCAY7gEAAAAAAAAAoNk44YQTomvXrtkZ1ODmm2+ORYsWZWdQB2vWrInx48dnZ1AHbdu2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L14c06ZNiyeffDKamppST6KXO378eKxevTpKS0vjrrvuihMnTqSeBAAAPVZnZ2esXLkyJk+eHLfeemvs2LEjOjs7U88ioa6urti5c2fceeedH4adhFIBAPi07dmzJ+69996YN29ejBo1Ku644454+umn480334wzZ86kngcAAAAAAABADybcAwAAAAAAAABAUl/84hdj0aJFqWfwMXbt2hUbN25MPYNe4Oc//3ns378/9QzO09e//vWYPXt26hkA9FC1tbVx++23x8SJE2PVqlVRW1ubehK9TFVVVfz4xz+OSy65JJYuXRrNzc2pJwEAQK/yy1/+MubNmxcLFiyIX/3qV665M9PQ0BDPPPNMXHnllXH55ZfHunXrUk8CAICIiGhra4snnngibrnllqioqIgRI0bEN7/5zVi3bl3s2LEj/vGPf6Se2Ou0t7dHVVVVbN68OZ577rnUcwAAAAAAAAD+o/qlHgAAAAAAAAAAQN7uu+++6NfP31i6o66urvjpT3+aega9yMMPP+zGfj3MwIEDY/ny5XHttdemngJAD9bY2Bh333133HPPPfG9730vFi9eHNOnT089ix6qs7Mzdu3aFevXr4+nnnoq9RwAAMjC1q1bY+vWrVFUVBRLly6NG264IS699NLUs7gA2tvbY+fOnfHss8/GY489Fh0dHaknAQDA/6mtrS02bdoUmzZt+vBYaWlpLFy4MGbOnBlTp06NSy65JEpKSmLAgAEJl/YMra2t8e6778ahQ4fi73//e7zxxhvx/PPPR2NjY+ppAAAAAAAAABeEO54AAAAAAAAAAJDMVVddFVdeeWXqGXyMbdu2xW9/+9vUM+hFnnjiiViyZElUVFSknsJ5uPrqq+Oaa66JP/zhD6mnANDDdXZ2xkMPPRQPPfRQXHvttXHHHXfEVVddFYWFhamn0QM0NzfH73//+3j00Udj+/btqecAAECWmpubY9myZbFs2bKYP39+3HbbbXH11VfHqFGjUk/j/6GrqysOHjwYL730Ujz++OOxf//+1JMAAOD/7dChQ7F27dqPHOvbt2/MmzcvZs2aFZMnT46JEyfGxRdfHGPGjIkxY8ZEv3753Iqpubk56uvr49ixY1FTUxPvvPNOVFdXx969e2PPnj2p5wEAAAAAAAB8qvL5tRgAAAAAAAAAgG7nvvvui4KCgtQz+Cc6OztjxYoVqWfQCz344IOxYcOG1DM4DwUFBbFs2TLhHgD+o7Zs2RJbtmyJ8ePHx/e///247rrrorS0NPUsuqHKysr4zW9+Ew8++GA0NzenngMAAPy3V155JV555ZUoKCiIxYsXx/XXXx9XXHFFFBUVpZ7GJ1RVVRUvvPBCbNiwIf7yl7+kngMAABdcR0dHbN26NbZu3fpPn581a1aUl5dHaWlpjB49OsaMGRPFxcUxatSoGD58eIwYMSKGDBkSAwcO/JSXfzLnzp2L1tbWaGxsjMbGxmhqaor6+vo4efJkHD9+PGpqauLtt9+O3bt3R2NjY+q5AAAAAAAAAN1Gn4joSj0CAAAAAAAAAAAAAIC8XX/99bF48eJYsGBBDB06NPUcEjp58mS89NJLsX79+vjTn/6Ueg5kbdy4cTF48ODUM7JTW1sbbW1tqWeQ2JAhQ6KkpCT1jOycPXs2ampqUs+AHqt///7xne98J6655pqYO3duXHTRRakn8T+0t7fH/v3749VXX41nnnkmtm3blnoSdGuux9JoamqKEydOpJ6RpYKCAnH1RA4fPhwdHR2pZwDnobCwMMrKymLs2LExevToGDFiRAwbNiyGDx8effv2jaFDh8aAAQOisLAwBg0aFP369YuIiH79+kVhYeG/fO2urq5obW398HFLS0u0t7dHa2trtLW1xdmzZ6O5uTlaWlqioaEh6uvr4/jx43H48GExHgAAAAAAAIB/k3APAAAAAAAAAAAAAADdRlFRUSxZsiS++tWvxuzZs6N///6pJ/EpaGtri+3bt8fmzZtjzZo1blQJAAA9XEFBQdx0002xaNGiuOyyy2LixInRp0+f1LOy09DQEK+//nq8/PLLsWHDhjh69GjqSQAAAAAAAAAAAADdinAPAAAAAAAAAAAAAADd0oQJE+L222+PRYsWxfTp06Nv376pJ/EfdO7cudi9e3e88MIL8fjjj8exY8dSTwIAAC6QGTNmxI033hhz5syJGTNmxMiRI1NP6pU++OCDqKys/DDWs3nz5tSTAAAAAAAAAAAAALo14R4AAAAAAAAAAAAAALq9yZMnx7e+9a1YsGBBzJo1KwYMGJB6Ev+Gtra22Lt3b7z44ovxi1/8Impra1NPAgAAEvjKV74SCxcujM9//vNRXl4eY8eOTT2pR6qrq4uDBw/Gnj174s9//nM899xz0dnZmXoWAAAAAAAAAAAAQI8h3AMAAAAAAAAAAAAAQI8yevTouPXWW2P+/Pkxe/bsGDlyZOpJ/Av19fWxc+fOePHFF+Ppp5+OxsbG1JMAAIBuZsaMGbFw4cKoqKiI8vLymDRpUgwbNiz1rG6lqakpqqqq4m9/+1u88cYb8cc//jHeeuut1LMAAAAAAAAAAAAAejThHgAAAAAAAAAAAAAAerTrrrsuFi1aFJdddllMmTIlBgwYkHpS1trb22Pfvn3x2muvxZYtW+L5559PPQkAAOiB5s6dG3PmzIlp06ZFWVlZfOYzn4lx48b1+u98H3zwQdTW1sa7774bb7/9duzbty927doVe/bsST0NAAAAAAAAAAAAoNcR7gEAAAAAAAAAAAAAoNcoKiqKG2+8Mb785S/HzJkzY/LkydGvX7/Us3q1jo6OqK6ujt27d8fWrVvj17/+ddTX16eeBQAA9FJz586NioqKmDRpUowfPz5KSkri4osvjjFjxkRRUVH06dMn9cR/qb29Perq6uL48eNx/PjxOHLkSNTU1MShQ4di7969UVlZmXoiAAAAAAAAAAAAQDaEewAAAAAAAAAAAAAA6LWKioria1/7WsybNy+mT58e06ZNi+Li4tSzerSWlpY4cOBAvPnmm7Fjx4743e9+FydOnEg9CwAAIAoLC2P69OkxZcqUKCkpidGjR8dFF10UxcXFMXz48Bg2bFgMHjw4Bg0aFIMHD47+/fvH4MGDo6CgIAoLCz/xeU6fPh1dXV1x9uzZaGtri9OnT8fp06ejpaUlTp8+Ha2trdHU1BQnTpyIurq6eP/99+PIkSNRXV0d1dXVF/AdAAAAAAAAAAAAAOB8CPcAAAAAAAAAAAAAAJCVWbNmxfz582PGjBlRXl4eEyZMiFGjRqWe1S21tLTE4cOH48CBA/HWW2/Fq6++Gi+//HLqWQAAABdM3759Y+LEiR85VldXF42NjWkGAQAAAAAAAAAAAHDBCPcAAAAAAAAAAAAAAJC9srKy+NKXvhTTpk2Lz372szFhwoQYN25cjBw5Mvr06ZN63gXX2toaR44ciffeey8OHToU+/bti+3bt8frr7+eehoAAAAAAAAAAAAAAAAAXBDCPQAAAAAAAAAAAAAA8DGKi4vj8ssvj0svvTRKS0ujpKQkxowZE6NHj45Ro0ZFcXFx6omfyLlz56K+vj4aGhri/fffj6NHj0ZNTU0cPnw4du3aFZWVlaknAgAAAAAAAAAAAAAAAMCnSrgHAAAAAAAAAAAAAAD+TUVFRVFeXh4TJkz4SNSnqKgohg0bFkOHDo2hQ4fGkCFDorCwMAYNGhT9+/eP/v37x6BBg6JPnz6f+FxdXV1x+vTp6OjoiDNnzkRbW1u0trbGqVOnorW1NVpaWqKpqSnq6uqioaEh6urqoqamJg4ePBgHDhy4gO8CAAAAAAAAAAAAAAAAAPQ8wj0AAAAAAAAAAAAAAJBYWVnZxz7X0tISx44d+xTXAAAAAAAAAAAAAAAAAEDvJ9wDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFYKUg8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgE+TcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBWhHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyIpwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZEe4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICvCPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkRbgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKwI9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQFeEeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALIi3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVoR7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiKcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBWhHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyIpwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZEe4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICvCPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkRbgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKwI9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQFeEeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALIi3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVoR7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiKcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBWhHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyIpwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZEe4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICvCPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkRbgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKwI9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQFeEeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALIi3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVoR7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiKcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBWhHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyIpwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZEe4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICvCPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkRbgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKwI9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQFeEeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALIi3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVoR7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiKcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBWhHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyIpwDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABZEe4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICvCPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkRbgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgKwI9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQFeEeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALIi3AMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVoR7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiKcA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWRHuAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArwj0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZEW4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICsCPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBXhHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACyItwDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQFaEewAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIinAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkR7gEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgK8I9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRFuAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACArAj3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAV4R4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsiLcAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBW/guPa8fbi/a0LQAAAABJRU5ErkJggg=="), vh(7, "youtube", 7, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(8, "googleplay", 3, "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"), vh(9, "discord", 7, "iVBORw0KGgoAAAANSUhEUgAAACwAAAAyBAMAAADVdiTZAAAAG1BMVEUA/wBI/0lu/26P/5Cl/6O8/73R/9Hn/+j///+iRuwXAAABJUlEQVQ4y83TvW7CMBQF4BsKdKVIpYxIRaJjVLUSI6JDGSNlCCOq1JC1f+CxFIL92D22E+di/ABciZB8seRj35joVZ3VN1FXBSqhRYgPJEIsSQXrAnmjL2uP5Usm81z83Bec5WM+J9T4vS8Yfzz1yFQ0v2ackKsrxr2G7d4ZPjK1O214z3no+Jdz1/EKTy1NI/w6jmcIID6JJirGe8cYdIdGIcQOwx3j/gEpI6X+qoRkGqrnd6OXFR/NRAcdOWFc6hDPera0Xk/Fozo1ck4bHsSVpg0jYJSlervGW9zWSdQXhhXozlbGek1uY9/s2hRWect7ucnsf5ld7DfosX+kcsv+AdwtDfvHdW877x/u0raB6Oa0qG35rKZhbokg41sKclQEmTr/f+SUPtWxuyYAAAAASUVORK5CYII="), vh(10, "insta", 3, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(11, "emojis", 4, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(12, "flags", 3, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(13, "bestTeam", 5, "iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg=="), vh(14, "bestPlayer", 5, "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"), vh(15, "zoom", 6, "iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuBAMAAACllzYEAAAAHlBMVEUAAAAhIyA3ODZTVVJrbWqEhoOkpqO8v7vX2tb///8goTJXAAABaElEQVQ4y32Tu1ODQBDGL8QAdlg5dml8dZTa2TijXQpnIh2TwoQOxwehi2PB0flKYP/b7HFv5nALBn5337d7ewshXZyuKX2PST8egUW76OE7EJFa+BhJ9bSsUWFaeTV3GKHbn8EvlB79bjSv4VO8jUr4VdiHNnK938MHPie0Yh+ZLqmGuNsJ7CNURgewI5qPoRE86GwkJyWIBIfcUfJrmMm0sclDyDnPWmLyADacl8jnRbEGKIoiJRP4EmU2LJmIDfLvAf7z/37mv6IUm08pzbV/rx5f1pPA1Fn/iX3eS3nekAslz7gcGw9bg3uqn6Rup5oH+uaTLpO4r0SmZVuUFE2lfTc+z1qr9+BVtGJqzq1RHNfQdAtnrEW75UwuXOFgvj3crpCyDu6UIpP9fPHZU5XkiYVXvsXIPcc+VwspzY2pPorE/NgCfYK+QJ5+QFA6fjQt2A4IWuIWODixe2ELcuIUNJGL+zQle92exY5pfDIaAAAAAElFTkSuQmCC"), vh(16, "apple", 3, "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"), vh(17, "loading", 6, "iVBORw0KGgoAAAANSUhEUgAAAEEAAAAKAQMAAADRpqGpAAAABlBMVEUAAAD///+l2Z/dAAAATklEQVQI12M48E/OzoinjoGB4cA/O3tjnn8g1iEjY+aeAxCWofGZBijLCMqqNzRKmQdhGRubNINZyeYQ1p9/yXbGMv9yG0AsG2OemtwGAJcsIuxbPF7gAAAAAElFTkSuQmCC"), vh(18, "target", 7, "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAJFBMVEXUAADLSwDYWli/eQCzlQGgswDloaGC0wAA/wBk5wDx09P///8NUBuBAAADWElEQVRYw62YvW/aUBDADwghTRakqoJuTBmSBamNSjcyJSMZotINZciQLCxVnQ1EkO0N1ET1iDJkgCViyGD/c7UN8bv37t5Hq96EbH6+j3fv3d2DgJPw52Uqd+y7AJhnP05hI6WTOyfksQ1IPnhWJLwAWUrfLYjfBSJfjIjfBkYaBoQnVAYjYRc08lWHXIBW+jwy0RNQijjErxsQqHJID4xyTpF7MwEVirQtCHxUkYmNEBEAVyVCDbgqEWq2SNcBgQ5GpsrLw+UqSZbPAzZoG2QovdpN/7+R5xaTNjkSSgt/lAiJJaYmkImOUJiSQHCu7CeJnjl/Q7Bdu4kqr6ploKTXLUGSJ8UykON1lDDSkmMGUrKUOSJZC+TdBvHFk2MWSQbSTkuRsUWJpCbKkaE2wIw3/RwRrqx0yKL4SzNDQsOa0LWpZcjU5rxkWSVDxna7sGVRisz4eMUay/op0uPilW2UQ6wVbU0I6owrm7Qqr5jV3AsgZFx5paa+iJCBSBcmPvvUmWoAU7oqKD8KzbGIMkzoF1vcHi0eBTB6+3nAbcMy/U4EM7IfF8Dt0iJkHoNI59AB+VAfhqqnsXwMkiifQ09FXiWkTJCOQJgQs48Z5EVGiPIOdFVk8f+Rvb9Hmv/iiyvCRYxfFzCti/vqk4SRc2yfybGZPmelAwEhI/JyzXmPk39MTIg5V4S5AdzTtwNmh8Wi9onjoswcjbv02Q5/jj3RYrtGh1LAFeMBKbYLUS1BNEkH6Ay/yh7ccNWimSJDtiItn2/wKR6jBgOCkUt9EWvlpci9qbMgcS9lVcy3F2RkVzWvyHW7ZWvcXgBurY6tdmX9ZYqMrFUc7TovR6ZgC8BC6kizTgksamK5hwO5T7w1e5K3yhkyBmOvhM+PaIv4YGr7cD9aLTrYtqm5xEdBs0DmuKCstM1oHuIt4oOWeaIDGTCDxY2yb5TRArjx5XDJTgnbAWaDhOqAWL6+vr5S55eaNPLMXUYeT0J8B6KqjG9DO9JXELuaGhlF546eICS0TJYNZqw2D8mViJv3e26DOEZMpjU0FxFTLbGjvSF50Dni6e9hfvHztGe67Xmw6qB3So/k0mMnst1c+acyceZyP/aI9uiJ53alFvy+/JTa9/7zt8j1Fs4ifwCmXBmOYkld0AAAAABJRU5ErkJggg=="), vh(19, "members", 7, "iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAAGFBMVEUAAABSVFGanJkA/wDMz8x4/3ey/7L///+GDHoaAAACZElEQVRIx9WWwYrjMAyGlVCYa6cs5JqGQh5gaObaDYU8QJnOA5SS66RN49dfSZZt2U2WZZeFXc9h2r9fZEmRJcPbLyz4d6GzMdM1/uXcG3PV0KehFVFnlh4Baoxdl8BEEkF7EcwUoN5pJ4HenRBMNV66C4QfxxI2nTKFhsYt5CgZC9FTawDIxbg4UKKUWevAuw1Aq/D7NUq6M9RbQ2zKhkwpKVnK2AWGRrCrc04lEpDfgyg1u8mh3EQqSGLoS5QXY/a4+XSKJIIwkkNQOIlTgFYUcQq59TuQcrwI0PDk+M3Hayh2+RcC1smkl3DDj1ltlMR5old38LutHT04l/BVAVfOSL9lnXelUBKaAltxt2gTv3Ft6w6k4sajdtf6zhLVHUHltzTwkIzvOUGf9PhOJJdVdphWS0YfFnJUCrVgISmdTVWVnVQa19+YV9VWKgohl2+MRUFKjaAXDX0tQCvt0+HPIJWnJajWGV9wPDPutPFhXs9CK+PLr1aJjSF+5aUzpOQY6mwZURWNCRRO9JZq43ikMtnog44v2LlojK1EW6n4zYXz4HqSb/gsty1qaWjAt5o7NAEiL7Jdu2vX7IqHLikEIYdzUJ5CZQQdJJcJ5GSE9i5tC1BNR4oadGub76ChwrZfKn48wTRXsGfrQvHFQr0dmy245o8nMYHGoxsToMZIAoWBA2qOzEMXmVJiK4nO2jn5oXju5yGZpn4Gf/QpNH08D+pn6O3vQqOGulkIX0+1fbXd93VT+dkXQe/SO3F1fkSnUBjgT7cEdVdJodkLTbNkKLr1NH1ApstPrkbnK/39B9e1H85NJPjxrK7zAAAAAElFTkSuQmCC"), vh(20, "hourglass", 7, "iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAAGFBMVEUAAABKTEqZm5gA/wDJzMh3/3iz/7L///+iyVF/AAACjklEQVRIx72W3aqyQBSGJwk6dceGTv1C8AJEO60QvACJLkDI02xPrtvf75pJ58cx2iffIqT0aWb9vGuNIrft0hSX8WqZ4Etxg9HM+G4zQVdatOcEdSSrqkr3juFOVdMwQXQUC7YmAyVLUPQZ1PxtJSJ5js7KX7j/+pKkNR5Y0RE9Ij/6JMPFRFfebt0cOmbD7dZOEOwQgn7ssnwOrf8rJAMp8KFSrnwormcQCR8S1HpQgT8qVVXnVCsJS/tQzlV4mMpmJLUCXOi4I2mgmnotOAfqcJPiCUIGNsMMunJdEqMjbP+cQQcOrx+hnZ0BA5XsuTQuPUxwBoLnZj98Oxq/LaiTHNK4G34MAQj7jfGhQqeIfgJQzm7ofELccUZ5CDpQjKBO3LbUr+gZhAo8QhMl8FoCb4IQhkvyUt7JWciBCnhUa5VkJkkexEtxQ3KjPvMlqKD7hk7fdF/bHnlQfoUU4LglgBCElVCP+ztIbQfDdXk7OL5jqH/juE7BA4pBUZr8XTJZMadoKZklKlxriMvSBqGO4m8ejJmuy5AH9aTqq02CbwPQlfeYDH94ziEWilqDW5xniiUWq6VUjs6szFTnat5SHYuXdcnGAcTZrINLrpmZGJnqqXY26WLONJ7rfqm5qfwh1vXckPahAh8HD/Imjzt7xJgACLe3oZ01xYQ1Mo/umWmGprBOjcQ96cyEEtacc89DrDx6PkJQrHSh2kjdgh4ulH0C7YIQuS8P3nYlDa9ecg33OpUF8TqnFyB9UitIVujsALSmqp6g+/5fHKVpxQfQqM6q2ier7X5joFdAMX++YrEyMc6hgP0RkuoVZbvfTqfU6gs/VbZG6M3bmn5fE0pxb6x1Ori4eNbkY3f+AriuYpjQCOoxAAAAAElFTkSuQmCC"), vh(21, "stalemate", 6, "iVBORw0KGgoAAAANSUhEUgAAAEoAAAAKAQMAAAApRlpeAAAABlBMVEUAAAD///+l2Z/dAAAAX0lEQVQI12P4/afiwJ+G9vnvDzD8/vPjwJ+D/SDmgYQTBw487mnmYYAwv4OZBUDmj/89zfwNDBWJfw78uDv/MJApAWQeODn/MFABR2LPgQMHZ4CYPxJ7/vwBMvkPIDEB8vo+S3L7oMwAAAAASUVORK5CYII="), vh(22, "logo", 8, "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAATzaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0NSA3OS4xNjM0OTksIDIwMTgvMDgvMTMtMTY6NDA6MjIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjItMTItMjNUMTQ6NDQ6NDYrMDM6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMTItMjNUMTQ6NDQ6NDYrMDM6MzAiIHhtcDpNb2RpZnlEYXRlPSIyMDIyLTEyLTIzVDE0OjQ0OjQ2KzAzOjMwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyZTU0YWVlOS01ZDdhLWQ3NDgtYTRjYS0yODQ1NmQ1ZWFlZDYiIHhtcE1NOkRvY3Vt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");
    }
  }, this.get = function (af) {
    return canvas[af];
  }, this.uR = function (name) {
    for (var aN = rB.length - 1; 0 <= aN; aN--) if (rB[aN] === name) return canvas[aN];
    return vb;
  }, this.t7 = function () {
    return va <= 0;
  }, this.vd = function () {
    va = 0, ve();
  };
}
function vy() {
  this.b1 = new vz(), this.fv = 0;
  var w0 = new Array(32);
  function w3() {
    for (var aM = w0.length, aN = 0; aN < aM; aN++) w0[aN] = null;
  }
  this.r = function () {
    for (var w1, w2 = document.body.firstChild; w2;) w1 = w2.nextSibling, !document.body.contains(w2) || "DIV" !== w2.tagName && "INPUT" !== w2.tagName && "BUTTON" !== w2.tagName || aq.removeChild(document.body, w2), w2 = w1;
  }, this.fu = function (af, mB, lo) {
    void 0 === mB && (mB = this.fv), dy.gK = !0, 0 === af && (0 === jE.jF() ? af = 5 : cA.hg.setState(13)), this.bU(), this.fv === af && (mB = w0[af].mB, w0[af] = null), this.fv = af;
    var aW = w0[af];
    if (!aW || 4 === af || 7 === af || 8 === af || 9 === af || 10 === af || 11 === af || 13 === af || 15 === af || 18 === af || 20 <= af && af <= 28 || 32 === af || 33 === af) {
      if (0 === af) return void w3();
      1 === af ? aW = new w4() : 2 === af ? aW = new w5() : 3 === af ? aW = new w6() : 4 === af || 9 === af || 10 === af || 11 === af || 13 === af || 33 === af ? aW = lo : 5 === af ? aW = new w7() : 6 === af ? aW = new w8() : 7 === af ? aW = new w9(aq.b1.wA) : 8 === af ? aW = lo : 12 === af ? aW = new wB() : 14 === af ? aW = new wC() : 15 === af ? aW = new w9(aq.b1.wD) : 16 === af ? aW = new wE() : 17 === af ? aW = new ug() : 18 === af ? aW = new al() : 19 === af ? aW = new wF() : 20 === af ? aW = new wG() : 21 === af ? aW = new wH() : 22 === af ? aW = new wI() : 23 === af ? aW = new wJ() : 24 === af ? aW = new wK() : 25 === af ? aW = new tK() : 26 === af ? aW = new wL() : 27 === af ? aW = new wM() : 28 === af ? aW = new wN() : 29 === af ? aW = new wO() : 30 === af ? aW = new wP() : 31 === af ? aW = new wQ() : 32 === af && (aW = new wR()), aW.mB = mB, w0[af] = aW;
    }
    aW.show(lo);
  }, this.ar = function () {
    this.mg() && this.wS(this.mA().mB);
  }, this.wS = function (af) {
    this.mg() && (w0[af] ? (this.bU(), dy.gK = !0, this.fv = af, w0[af].show()) : this.fu(af));
  }, this.bU = function () {
    this.mg() && w0[this.fv].bU();
  }, this.mU = function () {
    this.mg() && (w0[this.fv].bU(), w3(), this.fv = 0, cA.hg.setState(13));
  }, this.dd = function () {
    var aW;
    this.mg() && (aW = w0[this.fv]).dd && aW.dd();
  }, this.resize = function () {
    if (!this.mg()) return !1;
    w0[this.fv].resize();
  }, this.mv = function (eT, eU) {
    var aW;
    this.mg() && (aW = w0[this.fv]).mv && aW.mv(eT, eU);
  }, this.dh = function (eT, eU) {
    var aW;
    this.mg() && (aW = w0[this.fv]).dh && aW.dh(eT, eU);
  }, this.wT = function () {
    var aW;
    this.mg() && (aW = w0[this.fv]).wT && aW.wT();
  }, this.uI = function (dk, dl, deltaY) {
    var aW;
    this.mg() && (aW = w0[this.fv]).uI && aW.uI(dk, dl, deltaY);
  }, this.bV = function (code) {
    var aW;
    return !!this.mg() && ((aW = w0[this.fv]).bV && aW.bV(code), !0);
  }, this.f1 = function () {
    var aW;
    this.mg() && (aW = w0[this.fv]) && aW.f1 && aW.f1();
  }, this.mg = function () {
    return 0 < this.fv;
  }, this.mA = function () {
    return w0[this.fv];
  }, this.wU = function (af) {
    return w0[af];
  }, this.tS = function () {
    return w0;
  }, this.removeChild = function (wV, wW) {
    try {
      wV.removeChild(wW);
    } catch (b7) {
      console.log("removeChild error " + b7);
    }
  };
}
function wX(fY) {
  this.bb = -1, this.pow = -1;
  var wY = fY || {},
    wZ = this,
    wa = null,
    wb = null,
    wc = null,
    wd = null,
    we = null,
    wf = [],
    wg = 0,
    wh = null,
    wi = null,
    wj = null,
    wk = !1,
    wl = null,
    wo = 1 === new Uint8Array(new Uint32Array([1]).buffer)[0] ? 4278190080 : 255;
  function wp(wq, wV, className) {
    wq = document.createElement(wq);
    return className && (wq.className = className), wV && wV.appendChild(wq), wq;
  }
  function wr(ws, wV, action) {
    wV = wp("button", wV);
    return wV.type = "button", wV.textContent = ws, wV.addEventListener("click", action), wV;
  }
  function wt(wV) {
    wV = wp("canvas", wV);
    return wV.width = wV.height = 128, wV;
  }
  function wz(canvas, x0) {
    for (var canvas = canvas.getContext("2d"), data = (wi || (wi = canvas.createImageData(128, 128), wj = new Uint32Array(wi.data.buffer)), x0), wv = wj, ww = 0, position = 0, color = 0; position < 16384; ww += 6, color ^= 1) {
      for (var af = ww >> 3, fN = position + ((data[af] << 8 | data[1 + af]) >> 10 - (7 & ww) & 63), l = color ? wo : 4294967295, aN = position; aN < fN; aN++) wv[aN] = l;
      position = fN;
    }
    canvas.putImageData(wi, 0, 0);
  }
  function x1() {
    if (wa) {
      wa.setAttribute("aria-busy", String(wk)), we.disabled = wk, wd.disabled = wk || !wg;
      for (var aN = 0; aN < wf.length; aN++) wf[aN].disabled = wk, wf[aN].setAttribute("aria-pressed", String(Boolean(wg & 1 << aN)));
    }
  }
  function x3(event) {
    var x4, nw;
    "Escape" === event.key && (event.preventDefault(), wZ.close()), "Tab" === event.key && wa && (x4 = (nw = wa.querySelectorAll("button:not(:disabled)"))[0], nw = nw[nw.length - 1], event.shiftKey && document.activeElement === x4 ? (event.preventDefault(), nw.focus()) : event.shiftKey || document.activeElement !== nw || (event.preventDefault(), x4.focus()));
  }
  function x6() {
    wl = document.activeElement, (wa = wp("div", document.body, "captcha-overlay")).setAttribute("role", "dialog"), wa.setAttribute("aria-modal", "true"), wa.setAttribute("aria-label", "Select all images matching the reference");
    wp("style", wa).textContent = ".captcha-overlay{position:fixed;inset:0;z-index:5;min-width:200px;min-height:200px;background:rgba(0,0,0,.85);color:#fff;display:flex;flex-direction:column;align-items:center;gap:0;padding:0;margin:0;box-sizing:border-box;overflow:hidden;font-family:system-ui,sans-serif;--tile:80px}.captcha-overlay *{box-sizing:border-box}.captcha-overlay canvas{display:block;width:100%;height:100%;image-rendering:pixelated;background:white}.captcha-reference-row{position:relative;display:flex;justify-content:center;width:calc(4 * var(--tile));height:var(--tile);flex:none;margin-top:auto}.captcha-reference-label{position:absolute;left:0;top:0;width:calc(1.5 * var(--tile));height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:calc(var(--tile) * .3);line-height:1;font-weight:700}.captcha-overlay .captcha-reference{width:var(--tile);height:var(--tile);border:4px solid #000;flex:none}.captcha-grid{display:grid;grid-template-columns:repeat(4,var(--tile));gap:0;flex:none}.captcha-overlay button{appearance:none;margin:0;padding:0;border:3px solid #000;border-radius:0;background:#253343;color:white;font:600 17px system-ui,sans-serif;cursor:pointer;touch-action:manipulation;outline:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}.captcha-overlay button:focus{outline:none}.captcha-overlay .captcha-tile{position:relative;width:var(--tile);height:var(--tile);min-width:0;min-height:0;border-width:4px}.captcha-overlay .captcha-tile[aria-pressed=true]{border-color:#bcf56b}.captcha-actions{display:flex;gap:0;width:100%;height:62px;flex:none;margin-top:auto}.captcha-actions button{flex:1;min-width:0;padding:0 2px}.captcha-actions button:last-child{background:#bcf56b;color:#101319}.captcha-overlay button:disabled{color:#697580;cursor:default}";
    var x7 = wp("div", wa, "captcha-reference-row");
    wp("span", x7, "captcha-reference-label").textContent = "Find All:", (wc = wt(x7)).className = "captcha-reference", wc.setAttribute("aria-label", "Reference image"), wb = wp("div", wa, "captcha-grid");
    for (var aN = 0; aN < 16; aN++) wf.push(function (af) {
      var button = wr("", wb, function () {
        wk || (wg ^= 1 << af, x1());
      });
      return button.className = "captcha-tile", button.setAttribute("aria-label", "Select image " + (af + 1)), button.setAttribute("aria-pressed", "false"), wt(button).setAttribute("aria-hidden", "true"), button;
    }(aN));
    var x7 = wp("div", wa, "captcha-actions"),
      xA = wr("Close", x7, function () {
        wZ.close();
      });
    we = wr("Reload", x7, xB), wd = wr("Verify", x7, xC), wa.addEventListener("keydown", x3), wZ.resize(), x1(), xA.focus();
  }
  function xB() {
    wk || (wZ.close(), aF.lk.cH(0, 0, mT.bb, mT.pow));
  }
  function xC() {
    var cI, cJ;
    !wk && wg && (cI = wg, cJ = wh, wZ.close(), aF.lk.cH(cI, cJ, mT.bb, mT.pow));
  }
  this.show = function (xD, cJ, bb, pow) {
    this.bb = bb, this.pow = pow, wh = cJ, wa || x6(), wz(wc, xD[0]);
    for (var dZ = 0; dZ < 16; dZ++) wz(wf[dZ].firstChild, xD[dZ + 1]);
    wg = 0, wk = !1, x1(), "function" == typeof wY.xE && wY.xE();
  }, this.resize = function () {
    var size;
    wa && (size = Math.min(Math.max(200, window.innerWidth) / 4, (Math.max(200, window.innerHeight) - 62) / 5), wa.style.setProperty("--tile", size + "px"));
  }, this.close = function () {
    if (wa) {
      for (var xF = wa.querySelectorAll("canvas"), aN = 0; aN < xF.length; aN++) xF[aN].width = xF[aN].height = 0;
      wa.remove(), wa = wb = wc = wd = we = null, wi = wj = wh = null, wg = 0, wk = !(wf = []), wl && document.body.contains(wl) && wl.focus(), wl = null, "function" == typeof wY.xG && wY.xG();
    }
  };
}
function e() {
  this.xH = function (a6) {
    a6.fill(0);
  }, this.xI = function (a6) {
    for (var aM = a6.length, aN = 0; aN < aM; aN++) a6[aN] = [];
  }, this.xJ = function (f7, dj) {
    for (var f8 = k3.xK, aN = 0; aN < 3; aN++) f8[aN] = dj * f7[aN];
    return f8;
  }, this.xL = function (f7, f8, xM) {
    for (var ud = 0, aN = 0; aN < 3; aN++) ud += Math.abs(f7[aN] - f8[aN]);
    return xM <= ud;
  }, this.xN = function (f7, xO) {
    for (var aN = 0; aN < 3; aN++) f7[aN] = he.hf(f7[aN] + xO, 0, 255);
    return f7;
  }, this.aS = function (a6, pL, pM) {
    pM = pM || a6.length - 1;
    for (var xP = 0, aN = pL = pL || 0; aN <= pM; aN++) xP += a6[aN];
    return xP;
  }, this.xQ = function (a6, xR) {
    for (var aN, xS, aM = a6.length, xT = [], aQ = aM - 1; 0 <= aQ; aQ--) {
      for (aN = xS = 0; aN < aM; aN++) xR(a6[aN]) < xR(a6[xS]) && (xS = aN);
      aM--, xT.push(a6[xS]), a6[xS] = a6[aM], a6.pop();
    }
    return xT;
  }, this.min = function (a6) {
    var aN,
      aY,
      aM = a6.length;
    if (0 === aM) return 0;
    for (aY = a6[0], aN = 1; aN < aM; aN++) aY = Math.min(aY, a6[aN]);
    return aY;
  }, this.max = function (a6) {
    var aM = a6.length;
    if (0 === aM) return 0;
    for (var aY = a6[0], aN = 1; aN < aM; aN++) aY = Math.max(aY, a6[aN]);
    return aY;
  }, this.qy = function (a6, aY) {
    for (var aM = a6.length, aL = 0, aN = 0; aN < aM; aN++) aL += a6[aN] > aY;
    return aL;
  }, this.xU = function (xV, xW, min) {
    for (var aM = xW[0], aN = aM - 1; 0 <= aN; aN--) xV[aN] < min && (xV[aN] = xV[--aM]);
    xW[0] = aM;
  }, this.xX = function (a6, aM, value) {
    for (var aN = 0; aN < aM; aN++) a6[aN] -= value;
  }, this.xY = function (a6) {
    for (var aM = a6.length, aN = 0; aN < aM; aN++) if ("string" != typeof a6[aN]) return !1;
    return !0;
  }, this.tT = function (bS, a6, xZ) {
    a6.fill(0);
    for (var kA = bS.split(","), aM = Math.min(kA.length, a6.length), aN = 0; aN < aM; aN++) a6[aN] = Math.min(parseInt(kA[aN]), xZ);
  }, this.xa = function (bS, a6, xb) {
    a6.fill("");
    for (var kA = bS.split('"'), aM = Math.min(kA.length, 2 * a6.length), dZ = 0, aN = 1; aN < aM; aN += 2) a6[dZ++] = kA[aN].slice(0, xb);
  }, this.qx = function (a6, aL) {
    if (0 === aL) a6.fill(0);else {
      var xP = this.aS(a6),
        aM = a6.length;
      if (0 === xP) a6.fill(he.iA(aL, aM));else for (var aN = 0; aN < aM; aN++) a6[aN] = he.iA(aL * a6[aN], xP);
      if (0 === (xP = this.aS(a6))) a6[1] = aL;else for (var dZ = 0; xP++ < aL;) a6[dZ = (dZ + 1) % aM] && a6[dZ]++;
    }
  }, this.xc = function (a6) {
    if (!a6) return 0;
    var aM = a6.length;
    if (0 === aM) return 0;
    for (var aY = a6[aM - 1], aN = aM - 2; 0 <= aN; aN--) if (a6[aN] !== aY) return aN + 2;
    return 1;
  }, this.xd = function (a6) {
    for (var xP = 0, aN = 0; aN < a6.length; aN++) xP += a6[aN].length;
    return xP;
  }, this.aT = function (xe) {
    for (var a6 = [], aN = 0; aN < xe.length; aN++) a6 = a6.concat(xe[aN]);
    return a6;
  }, this.has = function (a6, aY) {
    for (var aM = a6.length, aN = 0; aN < aM; aN++) if (a6[aN] === aY) return !0;
    return !1;
  };
}
function xf() {
  var xg,
    xh = 8,
    xi = null;
  function xq(en, gm, af) {
    gm *= 4;
    en[gm] = 255, en[1 + gm] = 255, en[2 + gm] = af, en[3 + gm] = 255;
  }
  function xs(e2, xu) {
    var eT,
      eU,
      df,
      gm,
      xv,
      xw,
      el = xh,
      xp = aR.b.getImageData(e2, el, el),
      en = xp.data,
      aW = (el >> 1) - .5,
      xy = aR.d.xJ(xu, .5);
    for (aR.d.xL(xu, xy, 300) || aR.d.xN(xu, 100), eU = 0; eU < el; eU++) for (eT = 0; eT < el; eT++) xw = (el - 1.5) * (el - 1.5) / 4, en[gm = 4 * (eU * el + eT)] = (xv = (df = (df = eT - aW) * df + (df = eU - aW) * df) <= (el - 4.5) * (el - 4.5) / 4 ? xy : xu)[0], en[1 + gm] = xv[1], en[2 + gm] = xv[2], en[3 + gm] = xw < df ? 0 : 255;
    e2.putImageData(xp, 0, 0);
  }
  this.r = function () {
    var af, el, es, e2, xp, en;
    (xg = xg || new Array(ct.cv)).fill(null), af = 255, el = xh + 4, es = aR.b.xo(el, el), e2 = aR.b.getContext(es, !0), xp = aR.b.getImageData(e2, el, el), xq(en = xp.data, el + 1, af), xq(en, el + 2, af), xq(en, 2 * el + 1, af), xq(en, 2 * el - 3, af), xq(en, 2 * el - 2, af), xq(en, 3 * el - 2, af), xq(en, el * (el - 3) + 1, af), xq(en, el * (el - 2) + 1, af), xq(en, el * (el - 2) + 2, af), xq(en, el * (el - 2) - 2, af), xq(en, el * (el - 1) - 3, af), xq(en, el * (el - 1) - 2, af), e2.putImageData(xp, 0, 0), xi = es, function () {
      if (ct.il) for (var es = new Array(ey.iv.length), aM = ct.cv, xl = xg, rE = ey.rE, aN = 0; aN < aM; aN++) {
        var xm = rE[aN];
        es[xm] || (es[xm] = function (xm) {
          var es = aR.b.xo(xh, xh),
            e2 = aR.b.getContext(es, !0),
            a6 = k3.uY;
          return a6.set(ey.rD[xm]), xs(e2, a6), es;
        }(xm)), xl[aN] = es[xm];
      }
    }();
  }, this.dd = function () {
    var aN,
      player,
      xz,
      y0,
      ki,
      hy,
      y3,
      y5,
      y6,
      kY = h0.b1.kY,
      kw = h0.b1.kw,
      kx = h0.b1.kx,
      y7 = h0.b1.y7,
      y8 = xg,
      kj = ct.eG,
      aM = h0.b1.ka,
      y9 = d9.aO,
      yA = d9.dA,
      yB = fU.fV << 4,
      hk = e5,
      fK = hk / xh,
      e3 = e4 / hk,
      e6 = e7 / hk,
      df = (y9 + e4) / hk - e3,
      dg = (yA + e7) / hk - e6,
      e2 = dE;
    for (e2.imageSmoothingEnabled = hk < 9, aR.b.textAlign(e2, 1), aR.b.textBaseline(e2, 1), aN = 0; aN < aM; aN++) player = kw[aN] >> 3, ki = kx[aN], xz = .9 + .1 * Math.log10(ki), y0 = (hy = kY[aN]) % yB / 16 - xz, hy = yA * (Math.floor(hy / yB) / 16 - xz - e6) / dg, y3 = -2 * (y6 = hk * xz) * (1 + (y5 = +(player === kj)) / 8), y5 = y5 * y6 / 4, (y6 = y9 * (y0 - e3) / df) < y3 || hy < y3 || y9 + y5 < y6 || yA + y5 < hy || (y0 = 2 * xz * fK, y3 = xz * hk, null === (y5 = y8[player]) && (y8[player] = y5 = function (player) {
      var es = aR.b.xo(xh, xh);
      return xs(aR.b.getContext(es, !0), d5.xt(player)), es;
    }(player)), player === kj && (e2.setTransform(y0, 0, 0, y0, y6 - 2 * y0, hy - 2 * y0), e2.drawImage(xi, 0, 0)), e2.setTransform(y0, 0, 0, y0, y6, hy), e2.drawImage(y5, 0, 0), (xz = Math.floor(function (ki) {
      if (ki < 1e3) return .42;
      if (ki < 1e4) return .34;
      if (ki < 1e6) return .26;
      if (ki < 1e8) return .19;
      return .15;
    }(ki) * y3)) < 6) || (e2.setTransform(1, 0, 0, 1, 0, 0), e2.fillStyle = y7[aN] ? bG.yE : bG.bH, e2.font = aR.b.dF(1, xz), e2.fillText(aR.h.dG(ki), y6 + y3, hy + y3 + .1 * xz));
    e2.imageSmoothingEnabled = !1, e2.setTransform(1, 0, 0, 1, 0, 0);
  };
}
function yF() {
  this.yG = function (bb, yH) {
    bc.bd(11), bc.bh(1, 0), bc.bh(6, 4), bc.bh(1, yH ? 1 : 0), bc.bh(3, 0 === ct.dX ? aI.jV ? 6 : 0 : ct.mH ? 1 : ct.kD ? 7 : ct.cu < 7 ? 2 : 8 === ct.cu ? 4 : 9 === ct.cu ? 5 : 3), aF.b1.send(bb, bc.bk);
  }, this.yI = function () {
    bc.bd(58), bc.bh(1, 0), bc.bh(6, 5), bc.bh(8, aF.b1.bu), bc.bh(10, hO.je), bc.bh(9, hO.yJ), bc.bh(10, c8.lj), bc.bh(14, c8.c9), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yK = function (gm) {
    bc.bd(27), bc.bh(1, 1), bc.bh(4, 0), bc.bh(22, gm), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yL = function (i9, l5) {
    bc.bd(25), bc.bh(1, 1), bc.bh(4, 1), bc.bh(10, i9), bc.bh(10, l5), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yM = function (i9, jy) {
    bc.bd(24), bc.bh(1, 1), bc.bh(4, 2), bc.bh(10, i9), bc.bh(9, jy), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yN = function (i9, on) {
    bc.bd(42), bc.bh(1, 1), bc.bh(4, 3), bc.bh(10, i9), bc.bh(27, on), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yO = function (i9, kh) {
    bc.bd(31), bc.bh(1, 1), bc.bh(4, 4), bc.bh(10, i9), bc.bh(16, kh), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yP = function (l5) {
    bc.bd(15), bc.bh(1, 1), bc.bh(4, 5), bc.bh(10, l5), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yQ = function (af) {
    bc.bd(15), bc.bh(1, 1), bc.bh(4, 6), bc.bh(10, af), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yR = function (p6) {
    bc.bd(6), bc.bh(1, 1), bc.bh(4, 7), bc.bh(1, p6), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yS = function () {
    bc.bd(5), bc.bh(1, 1), bc.bh(4, 8), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yT = function (i9, gm, l5) {
    bc.bd(47), bc.bh(1, 1), bc.bh(4, 10), bc.bh(10, i9), bc.bh(10, l5), bc.bh(22, gm), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yU = function (yV, yW) {
    bc.bd(24), bc.bh(1, 1), bc.bh(4, 15), bc.bh(9, yW), bc.bh(10, yV), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yX = function (k5) {
    bc.bd(14), bc.bh(1, 1), bc.bh(4, 14), bc.bh(9, k5), aF.b1.send(aF.b1.c7, bc.bk);
  }, this.yY = function (yZ, target) {
    var aN,
      aM = yZ.length;
    for (bc.bd(14 + 9 * aM), bc.bh(1, 1), bc.bh(4, 13), bc.bh(9, target), aN = 0; aN < aM; aN++) bc.bh(9, yZ[aN]);
    aF.b1.send(aF.b1.c7, bc.bk);
  };
}
function ya() {
  this.yb = 32, this.eT = 0, this.eU = 0, this.iP = 0, this.yc = 0, this.yd = 4, this.iO = null, this.ye = new Int16Array(9), this.r = function () {
    this.iP = 1 + he.iA(fU.fV - 1, this.yb), this.yc = 1 + he.iA(fU.iD - 1, this.yb), this.iO = new Array(this.iP * this.yc), aR.d.xI(this.iO);
    var eT,
      eU,
      ye = this.ye,
      aO = this.iP;
    for (eT = -1; eT <= 1; eT++) for (eU = -1; eU <= 1; eU++) ye[3 * (1 + eU) + 1 + eT] = eU * aO + eT;
  }, this.ox = function (yg, aN) {
    return this.iO[aN].push(yg), this.iO[aN].length - 1;
  }, this.yh = function (yi, yj, yk) {
    var yl,
      ym,
      yj = dr.iN(yj),
      yk = dr.iN(yk);
    return yj === yk ? yi : (yl = this.iO[yj].pop(), this.iO[yj].length === yi ? this.ox(yl, yk) : (ym = this.iO[yj][yi], this.iO[yj][yi] = yl, h0.b1.yn[yl] = yi, this.ox(ym, yk)));
  };
}
function yo() {
  var yp, yq, yr;
  function yw(aN) {
    var button = u7.nw[aN],
      eT = button.eT,
      eU = button.eU,
      aO = button.aO,
      dA = button.dA;
    dE.fillStyle = button.yu, dE.fillRect(eT, eU, aO, dA), aN === yp && (dE.fillStyle = yr, dE.fillRect(eT, eU, aO, dA)), dE.lineWidth = lS.o2, dE.strokeStyle = yq, dE.strokeRect(eT, eU, aO, dA), function (button) {
      var eT = button.eT,
        eU = button.eU,
        aO = button.aO,
        dA = button.dA;
      aR.b.textAlign(dE, 1), aR.b.textBaseline(dE, 1), dE.font = button.font, dE.fillStyle = yq, dE.fillText(button.aE, Math.floor(eT + aO / 2), Math.floor(eU + dA / 2 + .1 * button.fontSize));
    }(button);
  }
  this.aO = 0, this.dA = 0, this.eU = 0, this.gap = 0, this.r = function () {
    yp = -1, yq = bG.bH, yr = "rgba(255,255,255,0.16)", this.nw = new Array(7), this.dA = Math.floor((cA.hg.hh() ? .123 : .093) * d9.dC), this.aO = Math.floor((cA.hg.hh() ? 3.96 : 4.2) * this.dA), this.gap = Math.floor(.025 * this.aO);
    var ys = Math.floor(.26 * this.dA),
      yt = aR.b.dF(1, ys);
    this.nw[0] = {
      eT: 0,
      eU: 0,
      aO: Math.floor(.6 * this.aO - this.gap / 2),
      dA: this.dA,
      aE: "Multiplayer",
      font: yt,
      yu: "rgba(22,88,22,0.8)",
      fontSize: ys
    }, ys = Math.floor(.18 * this.dA), yt = aR.b.dF(1, ys), this.nw[1] = {
      eT: 0,
      eU: 0,
      aO: this.aO - this.nw[0].aO - this.gap,
      dA: this.dA,
      aE: "Single Player",
      font: yt,
      yu: "rgba(22,88,88,0.8)",
      fontSize: ys
    }, this.nw[2] = {
      eT: 0,
      eU: 0,
      aO: this.aO,
      dA: Math.floor(.3 * this.dA),
      aE: "",
      font: this.nw[1].font,
      yu: "rgba(100,0,0,0.8)",
      fontSize: this.nw[1].fontSize
    }, this.nw[3] = {
      eT: 0,
      eU: 0,
      aO: this.aO,
      dA: this.dA,
      aE: "Back",
      font: this.nw[0].font,
      yu: "rgba(0,0,0,0.8)",
      fontSize: this.nw[0].fontSize
    }, this.nw[4] = {
      eT: 0,
      eU: 0,
      aO: this.aO,
      dA: Math.floor(.3 * this.dA),
      aE: "The game was updated!",
      font: this.nw[1].font,
      yu: "rgba(100,0,0,0.8)",
      fontSize: this.nw[1].fontSize
    }, this.nw[5] = {
      eT: 0,
      eU: 0,
      aO: this.nw[0].aO,
      dA: Math.floor(.8 * this.dA),
      aE: "Reload",
      font: this.nw[0].font,
      yu: "rgba(0,100,0,0.8)",
      fontSize: this.nw[0].fontSize
    }, this.nw[6] = {
      eT: 0,
      eU: 0,
      aO: this.nw[1].aO,
      dA: this.nw[5].dA,
      aE: "Back",
      font: this.nw[0].font,
      yu: "rgba(0,0,0,0.8)",
      fontSize: this.nw[0].fontSize
    }, this.uK();
  }, this.uK = function () {
    this.eU = Math.floor(.54 * d9.dA), this.nw[0].eT = Math.floor(.5 * d9.aO - .5 * this.aO), this.nw[1].eT = this.nw[0].eT + this.nw[0].aO + this.gap, this.nw[2].eT = this.nw[3].eT = this.nw[0].eT, this.nw[4].eT = this.nw[5].eT = this.nw[0].eT, this.nw[6].eT = this.nw[1].eT, this.nw[0].eU = Math.floor(.54 * d9.dA), this.nw[1].eU = this.nw[0].eU, this.nw[2].eU = Math.floor((d9.dA - this.nw[2].dA - this.nw[3].dA - this.gap) / 2), this.nw[3].eU = this.nw[2].eU + this.nw[2].dA + this.gap, this.nw[4].eU = Math.floor((d9.dA - this.nw[4].dA - this.nw[5].dA - this.gap) / 2), this.nw[5].eU = this.nw[6].eU = this.nw[4].eU + this.nw[4].dA + this.gap;
  }, this.yv = function () {
    yw(0), yw(1);
  }, this.yx = function () {
    yw(2), yw(3);
  }, this.yy = function () {
    yw(4), yw(5), yw(6);
  }, this.dh = function (eT, eU, dY) {
    var aN = -1;
    return 0 === jE.jF() ? aN = this.sl(eT, eU, 0, 2) : 3 === jE.jF() ? aN = this.sl(eT, eU, 3, 1) : 5 === jE.jF() && (aN = this.sl(eT, eU, 5, 2)), yp !== aN && (yp = aN, dY) && (dy.gK = !0), -1 !== aN && (uF.reset(), !0);
  }, this.sl = function (eT, eU, yz, size) {
    for (var aN = yz; aN < yz + size; aN++) if (eT >= this.nw[aN].eT && eU >= this.nw[aN].eU && eT <= this.nw[aN].eT + this.nw[aN].aO && eU <= this.nw[aN].eU + this.nw[aN].dA) return aN;
    return -1;
  };
}
function n() {
  this.mk = function (z1, af, z2) {
    var el = z1.height,
      es = aR.b.xo(el, el),
      e2 = aR.b.getContext(es);
    return function (aO, e2, z2) {
      e2.fillStyle = z2, e2.beginPath(), e2.arc(aO / 2, aO / 2, .47 * aO, 0, 2 * Math.PI), e2.fill();
    }(el, e2, z2), e2.drawImage(z1, -af * el, 0), es;
  }, this.mm = function (z4) {
    var e2,
      xp,
      el = z4.height;
    return z4.width === el && (xp = (e2 = aR.b.getContext(z4, !0)).getImageData(0, 0, el, el), aR.l.z5(xp.data, el, el, .9), e2.putImageData(xp, 0, 0)), z4;
  };
}
function w4() {
  var am, uh, ui, uk;
  function z6(id) {
    0 !== cA.id || b6.buffer.data[140].value ? 0 === id ? aq.fu(8, 1, new fw(16)) : aq.fu(2) : aq.b1.zH(aq.fv, 0 === id ? 16 : 0);
  }
  this.show = function () {
    cA.hg.setState(12), am.show(), this.resize(), this.f1();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), uh.resize();
  }, this.f1 = function () {
    8 === jE.jF() && (2 <= hD.zF ? ui[2].zS === bG.zT && ui[2].bF(0) : ui[2].zS !== bG.zT && ui[2].bF(bG.zT), !ct.mH && my.p8(ct.eG) ? ui[1].zS === bG.zT && ui[1].bF(0) : ui[1].zS !== bG.zT && ui[1].bF(bG.zT), !ct.mH && hC.nV(ct.eG) ? ui[0].zS === bG.zT && ui[0].bF(0) : ui[0].zS !== bG.zT && ui[0].bF(bG.zT));
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, ui = [new ap(L(66), function () {
    z6(0);
  }), new ap(L(67), function () {
    aq.fu(16);
  }), new ap(L(65), function () {
    aq.fu(17);
  }), new ap(L(68), function () {
    aq.b1.z7();
  }, 0, 0, 1), new ap(L(69), function () {
    aq.fu(3, 1);
  }), new ap(L(0), function () {
    aq.fu(18);
  }), new ap(L(70), function () {
    aq.fu(31);
  }), new ap(L(71), function () {
    aq.b1.vW(2);
  }), new ap(L(72), function () {
    z6(1);
  }), new ap("🔒 " + L(73), function () {
    aq.fu(32);
  }), new ap(L(74), function () {
    var zI, zJ;
    (zI = []).push(["Wiki", (zJ = "https://territorial.io/") + "wiki/gold"]), zI.push(["Team Games", zJ + "log/team"]), zI.push(["Battle Royale Games", zJ + "log/br"]), zI.push(["1v1 Games", zJ + "log/1v1"]), zI.push(["Zombie Games", zJ + "log/zombies"]), zI.push(["Transactions", zJ + "log/transactions"]), zI.push(["Changelog", zJ + "changelog"]), 2 !== cA.id && zI.push(["Android App", zK.zL]), 1 !== cA.id && zI.push(["iOS App", zK.zM]), 0 === cA.id && zI.push(["Patreon", zK.zN]), zI.push(["Terms", zK.zO]), zI.push(["Privacy", zK.zP]), aq.fu(4, 1, new mC(L(74), aR.b.zQ(zI), !1, [new ap("⬅️ " + L(1), function () {
      aq.fu(1);
    })]));
  }), new ap(L(75), function () {
    aq.fu(4, 1, new mC(L(75), c8.cB + "<br>" + aF.b1.b2("/changelog") + "<br><br><c8>FX Client v" + __fx.version + "<br><a href='https://discord.gg/dyxcwdNKwK' target='_blank'>FX Client Discord server</a><br><a href='https://github.com/fxclient/FXclient' target='_blank'>Github repository</a></c8>", !0, [new ap("⬅️ " + L(1), function () {
      aq.fu(1);
    })]));
  }), new ap(L(76), function () {
    aq.fu(4, 1, new mC(L(76), L(84) + "<br>" + L(85), !1, [new ap("⬅️ " + L(1), function () {
      aq.fu(1);
    }), new ap(L(86), function () {
      cA.hg.zR(), aq.fu(1);
    })]));
  }), new ap("👁️ " + L(77), function () {
    cA.hg.zB(), aq.fu(4, 1, new mC(L(87), L(88) + " " + aF.b1.b2("/privacy"), !1, [new ap("⬅️ " + L(1), function () {
      aq.fu(1);
    })]));
  })], uk = [new ap("⬅️ " + L(1), function () {
    aq.b1.zC();
  })], 8 === jE.jF() && (ui.unshift(new ap(L(80), function () {
    aq.fu(30);
  })), ui.unshift(new ap(L(81), function () {
    2 <= hD.zF && (aq.mU(), vK.n0(), dy.gK = !0);
  }, 0, 1)), ui.unshift(new ap(L(82), function () {
    !ct.mH && my.p8(ct.eG) && (gD.n1.p7(), aq.mU(), my.mz) && my.n0();
  }, 0, 1)), ui.unshift(new ap(L(83), function () {
    !ct.mH && hC.nV(ct.eG) && (h4.zG(2), gD.n1.nZ(), aq.mU(), my.mz) && my.n0();
  }, 0, 1))), 1 === cA.id && 5 <= cA.cB && ui.push(new ap(L(78), function () {
    cA.hg.zE();
  })), am = new ao(L(79), uk), uh = new nv(ui, am.au);
}
function zU() {
  this.zV = "https://territorial.io/changelog", this.zO = "https://territorial.io/terms", this.zP = "https://territorial.io/privacy", this.zW = "https://territorial.io/tutorial", this.zX = "https://territorial.io/players", this.zY = "https://territorial.io/clans", this.zZ = "https://territorial.io/clan-results", this.zN = "https://patreon.com/c/territorial", this.zL = "https://play.google.com/store/apps/details?id=territorial.io", this.zM = "https://apps.apple.com/app/id1581110913", this.za = "https://discord.gg/pthqvpTXmh", this.zb = "https://www.instagram.com/davidtschacher/", this.zc = "🇦🇫🇦🇽🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇶🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇮🇴🇻🇬🇧🇳🇧🇬🇧🇫🇧🇮🇨🇻🇰🇭🇨🇲🇨🇦🇮🇨🇰🇾🇨🇫🇹🇩🇨🇱🇨🇳🇨🇽🇨🇨🇨🇴🇰🇲🇨🇬🇨🇩🇨🇷🇭🇷🇨🇺🇨🇼🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇸🇿🇪🇹🇪🇺🇫🇰🇫🇴🇫🇯🇫🇮🇫🇷🇬🇫🇵🇫🇹🇫🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇮🇬🇷🇬🇱🇬🇩🇬🇵🇬🇺🇬🇹🇬🇬🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇰🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇲🇮🇱🇮🇹🇨🇮🇯🇲🇯🇵🇯🇪🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇴🇲🇰🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇶🇲🇷🇲🇺🇾🇹🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇸🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇨🇳🇿🇳🇮🇳🇪🇳🇬🇳🇺🇳🇫🇰🇵🇲🇵🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇱🇵🇹🇵🇷🇶🇦🇷🇴🇷🇺🇷🇼🇼🇸🇸🇲🇸🇹🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇽🇸🇰🇸🇮🇸🇧🇸🇴🇿🇦🇬🇸🇰🇷🇸🇸🇪🇸🇱🇰🇧🇱🇸🇭🇰🇳🇱🇨🇲🇫🇵🇲🇻🇨🇸🇩🇸🇷🇸🇪🇸🇾🇨🇭🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇰🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇨🇹🇻🇺🇬🇺🇦🇦🇪🇬🇧🇺🇳🇺🇸🇻🇮🇺🇾🇺🇿🇻🇺🇻🇦🇻🇪🇻🇳🇼🇫🇪🇭🇾🇪🇿🇲🇿🇼";
}
function zd(fX, ze) {
  var nx = document.createElement("div");
  this.zf = nx, this.resize = function () {
    nx.style.padding = aR.b.nz(lS.o0), nx.style.lineHeight = aR.b.nz(aR.b.tJ(.035));
  }, fX.style.overflowX = "hidden", fX.style.overflowY = "auto", nx.innerHTML = ze, fX.appendChild(nx);
}
function zg() {
  var dA,
    canvas,
    lG,
    zh,
    zi,
    zj = -1;
  function zk() {
    var ec,
      j = canvas.getContext("2d", {
        alpha: !0
      });
    j.clearRect(0, 0, dA, dA), j.fillStyle = bG.su, j.fillRect(0, 0, dA, dA), 9 === zh && (j.fillStyle = bG.zl, j.fillRect(0, 0, dA, dA)), j.fillStyle = bG.bH, j.fillRect(0, 0, dA, 1), j.fillRect(0, 0, 1, dA), j.fillRect(0, dA - 1, dA, 1), j.fillRect(dA - 1, 0, 1, dA), ec = .9 * dA / dQ.get(0).width, j.imageSmoothingEnabled = !0, j.setTransform(ec, 0, 0, ec, Math.floor((dA - ec * dQ.get(0).width) / 2), Math.floor((dA - ec * dQ.get(0).height) / 2)), j.drawImage(dQ.get(0), 0, 0), j.setTransform(1, 0, 0, 1, 0, 0);
  }
  function zr(dk, dl) {
    if (!my.mz) return dk <= dA + lS.gap && dl >= hB.eU ? 9 : -1;
    if (dk <= 4 * dA + lS.gap) {
      if (dl >= hB.eU) return 0;
      if (dl >= hB.eU - dA - zi * lS.gap) return 2;
    } else if (dk <= 7 * dA + lS.gap && dl >= hB.eU - dA - zi * lS.gap) return 1;
    return -1;
  }
  this.mz = !1, this.r = function () {
    zh = -1, this.mz = !1, zi = cA.hg.hh() ? 1.2 : .6, this.resize();
  }, this.resize = function () {
    dA = hB.dA, (canvas = document.createElement("canvas")).width = dA, canvas.height = dA, lG = aR.b.dF(1, (cA.hg.hh() ? .5 : .45) * dA), zk();
  }, this.zm = function () {
    return !(1 !== ct.dX || ct.dO || (ct.mH ? !hM.vX : this.mz && ct.kD));
  }, this.n0 = function () {
    this.mz = !this.mz, this.mz ? (hM.zn(!1), ct.mH && hM.vX && hM.zo(!0), this.zp(), 9 === zh && (zh = 0)) : (zh = -1, zk(), !ct.kD || 1 !== ct.dX || ct.dO || ct.mH || cA.hg.setState(1)), dy.gK = !0;
  }, this.zp = function () {
    (ct.kD || ct.mH) && 1 === ct.dX && (h2.dY(!0), ct.dO || setTimeout(function () {
      gJ.zq();
    }, 0), cA.hg.setState(0));
  }, this.mv = function (dk, dl) {
    return 0 <= (zj = zr(dk, dl)) || !my.mz || ct.kD || ct.mH || vK.mg || my.n0(), zj;
  }, this.dh = function (dk, dl) {
    dk = zr(dk, dl);
    dk !== zh && (zh = dk, this.mz || zk(), dy.gK = !0);
  }, this.zt = function (dk, dl) {
    dk = zr(dk, dl);
    return -1 !== dk && zj === dk && (this.mz ? ct.ur ? (0 <= dk && hM.zn(!1), !ct.mH) : (0 === dk ? ct.mW() : 1 === dk ? this.n0() : 2 === dk && aq.fu(1, 0), !0) : 9 === dk && (this.n0(), !0));
  }, this.dd = function () {
    var aO;
    this.mz ? (aO = Math.floor(5.5 * dA), dE.setTransform(1, 0, 0, 1, lS.gap, hB.eU), dE.fillStyle = bG.su, dE.fillRect(0, 0, aO, dA), 0 === zh ? (dE.fillStyle = bG.zl, dE.fillRect(0, 0, 4 * dA, dA)) : 1 === zh && (dE.fillStyle = bG.zl, dE.fillRect(4 * dA, 0, Math.floor(1.5 * dA), dA)), dE.fillStyle = bG.bH, dE.fillRect(0, 0, aO, 1), dE.fillRect(0, 0, 1, dA), dE.fillRect(4 * dA, 0, 1, dA), dE.fillRect(0, dA - 1, aO, 1), dE.fillRect(aO - 1, 0, 1, dA), dE.font = lG, aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 1), dE.fillText(L(89), 2 * dA, .54 * dA), aO = .4 * dA, my.sU(lS.gap + 4 * dA + (1.5 * dA - aO) / 2, hB.eU + .3 * dA, aO), aO = 1, dE.setTransform(1, 0, 0, 1, lS.gap, hB.eU - aO * zi * lS.gap - aO * dA), dE.fillStyle = bG.su, dE.fillRect(0, 0, 4 * dA, dA), zh === aO + 1 && (dE.fillStyle = bG.zl, dE.fillRect(0, 0, 4 * dA, dA)), dE.fillStyle = bG.bH, dE.fillRect(0, 0, 4 * dA, 1), dE.fillRect(0, 0, 1, dA), dE.fillRect(4 * dA, 0, 1, dA), dE.fillRect(0, dA - 1, 4 * dA, 1), dE.fillText(L(0 === aO ? 89 : 90), 2 * dA, .54 * dA), dE.setTransform(1, 0, 0, 1, 0, 0)) : dE.drawImage(canvas, lS.gap, hB.eU);
  }, this.p8 = function (player) {
    return 0 !== d3.eF[player] && 2 !== ct.dX && !aR.f.eH(player);
  }, this.sU = function (eT, eU, aM) {
    dE.setTransform(1, 0, 0, 1, eT, eU), dE.lineWidth = lS.o2, dE.strokeStyle = bG.bH, dE.beginPath(), dE.moveTo(0, 0), dE.lineTo(aM, aM), dE.moveTo(0, aM), dE.lineTo(aM, 0), dE.stroke();
  };
}
function zx(data) {
  var am, zy;
  function a0A(aM) {
    return aM < 60 ? 1 === aM ? aM + " Second" : aM + " Seconds" : aM < 3600 ? 1 === (aM = Math.floor(aM / 60)) ? aM + " Minute" : aM + " Minutes" : aM < 172800 ? 1 === (aM = Math.floor(aM / 3600)) ? aM + " Hour" : aM + " Hours" : (aM = Math.floor(aM / 172800)) + " Days";
  }
  function a02(ud) {
    var aM = data.data.length;
    if (aM) {
      for (var pL, max = min = parseInt(data.data[0][0]), aN = 1; aN < aM; aN++) var ac = parseInt(data.data[aN][0]), min = Math.min(ac, min), max = Math.max(ac, max);
      pL = ud < 0 ? min + ud : max + 1, aq.fu(8, aq.mA().mB, new fw(21, {
        pK: data.pK,
        pL: pL,
        pM: pL + Math.abs(ud)
      }));
    }
  }
  if (this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), zy.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, data.zz) {
    am = new ao(L(23), [new ap("⬅️ " + L(1), function () {
      aq.ar();
    })]);
    var fS = {
        fZ: [],
        ff: [L(103), L(104), L(105) + " ↗"],
        fo: [12, 50, 38]
      },
      nu = ct.data.nu;
    if (nu) {
      for (var aM = nu.length, fZ = fS.fZ, dI = d3.dI, aN = 0; aN < aM; aN++) fZ.push([{
        aY: aN + 1 + ".",
        eZ: 0
      }, {
        aY: dI[aN],
        eZ: 0
      }, {
        aY: bs.aa.dG(nu[aN], 5),
        eZ: 1,
        ah: nu[aN],
        fs: 0
      }]);
      zy = new fW(am.au, fS, {
        fj: 1
      });
    } else zy = new fW(am.au, fS);
  } else {
    var fS = data.data.length ? 0 : 1,
      a01 = [new ap("⬅️ " + L(1), function () {
        aq.ar();
      }), new ap(L(91), function () {
        a02(-10);
      }, fS, 0, 1), new ap(L(92), function () {
        a02(10);
      }, fS, 0, 1), new ap(L(41), function () {
        aq.fu(11, 10, new a03({
          pK: data.pK
        }));
      })],
      ff = [L(93), L(94), L(95), L(96), L(97), L(62), L(63), L(64), L(98), L(99), L(100), L(101), "Audit Log", L(102)];
    am = new ao(ff[data.pK], a01), !function () {
      var aN,
        fS = {
          fZ: []
        },
        fZ = fS.fZ,
        a05 = data.data,
        aM = a05.length;
      aM && 0 === a05[0][0] && 0 <= (af = [0, 1, 2, 3, -1, -1, -1, -1, -1, 4, 5, 6, -1, 7][data.pK]) && (aq.b1.t3[af] = a05[0][1]);
      var fM = [.1, .001, .01, 1, 100, 1, 1, .1, 100, .01, .01, .01, 1, .01][data.pK],
        a08 = [1, 3, 2, 0, 0, 0, 0, 1, 0, 2, 2, 2, 0, 2][data.pK],
        af = [[L(106), L(107) + " ↗", L(108)], [L(106), L(109), L(110), L(111) + " ↗"], [L(106), L(107) + " ↗", L(110)], [L(106), L(107) + " ↗", L(110)], [L(103), L(112), L(113) + " ↗", L(114) + " ↗", L(27)], [L(103), L(112), L(115) + " ↗", L(3) + " ↗", L(116)], [L(103), L(112), L(117) + " ↗", L(118) + " ↗", L(4)], [L(103), L(112), L(115) + " ↗", L(3) + " ↗", L(119)], [L(103), L(112), L(113) + " ↗", L(114) + " ↗", L(27)], [L(106), L(107) + " ↗", L(110)], [L(106), L(107) + " ↗", L(120)], [L(106), L(107) + " ↗", L(110)], [L(103), L(112), L(113) + " ↗", L(114) + " ↗", L(121)], [L(106), L(107) + " ↗", L(110)]];
      if (fS.ff = af[data.pK], fS.fo = [[25, 40, 35], [15, 25, 25, 35], [25, 40, 35], [25, 40, 35], [10, 18, 30, 30, 12], [10, 18, 30, 30, 12], [10, 18, 30, 30, 12], [10, 18, 30, 30, 12], [10, 18, 30, 30, 12], [25, 40, 35], [25, 40, 35], [25, 40, 35], [10, 15, 25, 25, 25], [25, 40, 35]][data.pK], 0 === data.pK || 2 === data.pK || 3 === data.pK || 9 === data.pK || 10 === data.pK || 11 === data.pK || 13 === data.pK) for (aN = 0; aN < aM; aN++) fZ.push([{
        aY: a05[aN][0] + 1 + ".",
        eZ: 0
      }, {
        aY: a05[aN][1],
        eZ: 1,
        ah: a05[aN][4],
        fs: a05[aN][3]
      }, {
        aY: (fM * a05[aN][2]).toFixed(a08),
        eZ: 0
      }]);else if (12 === data.pK) for (aN = 0; aN < aM; aN++) {
        var a09 = a05[aN][3];
        fZ.push([{
          aY: "" + a05[aN][0],
          eZ: 0
        }, {
          aY: a0A(a05[aN][4]),
          eZ: 0
        }, {
          aY: a05[aN][5],
          eZ: 1,
          ah: a05[aN][1],
          fs: 0
        }, {
          aY: a05[aN][6],
          eZ: 1,
          ah: a05[aN][2],
          fs: 0
        }, {
          aY: a0B.a0C(a09, bs.aa.dG(a05[aN][1], 5)),
          eZ: 0
        }]);
      } else if (1 === data.pK) for (aN = 0; aN < aM; aN++) fZ.push([{
        aY: a05[aN][0] + 1 + ".",
        eZ: 0
      }, {
        aY: a05[aN][1],
        eZ: 0
      }, {
        aY: (fM * a05[aN][2]).toFixed(a08),
        eZ: 0
      }, {
        aY: a05[aN][3],
        eZ: 1,
        ah: a05[aN][5],
        fs: a05[aN][4]
      }]);else if (4 === data.pK || 5 === data.pK || 6 === data.pK || 7 === data.pK || 8 === data.pK) for (aN = 0; aN < aM; aN++) {
        var a0D = a05[aN][5];
        4 === data.pK || 8 === data.pK ? "100%" === (a0D = (a0D % 64 * 100 / (a0D >> 6)).toFixed(0) + "%") && (4 === data.pK ? a0D += " (" + L(122) + ")" : a0D += " (" + L(123) + ")") : 5 === data.pK ? 32768 <= a0D && (a0D = -(a0D - 32768)) : a0D = (fM * a0D).toFixed(a08), fZ.push([{
          aY: "" + a05[aN][0],
          eZ: 0
        }, {
          aY: a0A(a05[aN][6]),
          eZ: 0
        }, {
          aY: a05[aN][7],
          eZ: 1,
          ah: a05[aN][1],
          fs: a05[aN][2]
        }, {
          aY: a05[aN][8],
          eZ: 1,
          ah: a05[aN][3],
          fs: a05[aN][4]
        }, {
          aY: "" + a0D,
          eZ: 0
        }]);
      }
      zy = new fW(am.au, fS);
    }();
  }
}
function tb(a0E, a0F) {
  this.a0G = [];
  var a0H = this.a0G;
  function click() {
    for (var aN = 0; aN < a0H.length; aN++) a0H[aN].textContent = a0H[aN].textContent.replace("🟢", "⚪");
    this.textContent = this.textContent.replace("⚪", "🟢");
    var af = parseInt(this.name);
    void 0 !== a0E.af && b6.bJ.bK(a0E.af, af), a0F && a0F(af);
  }
  for (var a0I, aM = a0E.fY.length, aN = 0; aN < aM; aN++) (a0I = document.createElement("p")).textContent = "⚪ " + a0E.fY[aN], a0I.style.margin = "0", a0I.name = "" + aN, a0I.style.cursor = "pointer", a0I.style.fontSize = "1em", a0I.addEventListener("click", click), a0H.push(a0I);
  a0H[a0E.value].textContent = a0H[a0E.value].textContent.replace("⚪", "🟢");
}
function wF() {
  var tL, tM, aw;
  function a0L() {
    var aL;
    1 === ct.data.gameMode ? (ct.data.teamPlayerCount || (ct.data.teamPlayerCount = new Uint16Array([0, 1, 1, 0, 0, 0, 0, 0, 0]), ct.v0.qv()), aL = aR.d.qy(ct.data.teamPlayerCount, 0), ct.data.numberTeams = aL) : (2 === ct.data.botDifficultyType && (ct.data.botDifficultyType = 0), 1 === ct.data.spawningType && (ct.data.spawningType = 0));
  }
  function tO() {
    1 !== ct.data.gameMode && (ct.data.teamPlayerCount = null), a0O(), ct.data.canvas = null, aq.fu(5, 5);
  }
  function a0O() {
    gF.oK.r(), b6.bJ.bK(156, gF.vS.bj());
  }
  function a0J() {
    ct.data.isReplay = 0, a0O(), ct.v0.r2(), jE.u9(), ct.v0.qz(), ct.data.canvas = 2 === ct.data.mapType ? fU.uP : null, ct.v3(), ct.v1 = 1;
  }
  function a0d() {
    a0L();
    for (var a6 = [a0S(), a0T(), a0U()], aN = 3; aN < 6; aN++) aq.removeChild(tM.zf, tM.a0e[aN].nx), tM.a0e[aN] = a6[aN - 3], tM.zf.appendChild(tM.a0e[aN].nx);
    tM.resize();
  }
  function a0S() {
    var a0f,
      ay = new az();
    return ay.b3(L(129)), a0f = 0 === ct.data.gameMode ? [L(130), L(55)][ct.data.colorsType] : ct.data.numberTeams + " Team" + (1 === ct.data.numberTeams ? "" : "s"), ay.b0(a0f), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(21);
    }).button])), ay;
  }
  function a0T() {
    var ay = new az(),
      a6 = (ay.b3(L(50)), [L(52) + ": " + tV.tW[ct.data.botDifficultyValue], L(53), L(54), L(55)]);
    return ay.b0(a6[ct.data.botDifficultyType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(25);
    }).button])), ay;
  }
  function a0U() {
    var ay = new az(),
      a6 = (ay.b3("Spawning"), [L(130), L(131), L(55)]);
    return ay.b0(a6[ct.data.spawningType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(24);
    }).button])), ay;
  }
  this.show = function () {
    tL.show(), this.resize(), tL.au.scrollTop = aq.b1.fk[0];
  }, this.bU = function () {
    aq.b1.fk[0] = tL.au.scrollTop, tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao("🔧 " + L(124), [new ap("⬅️ " + L(1), tO), new ap(L(125), a0J)]), a0L(), ct.data.canvas || (2 === ct.data.mapType ? ct.data.canvas = fU.uP : 1 === ct.data.mapType ? ct.data.canvas = fU.a0N(fU.r0(ct.data), 0).uP : (ct.data.mapType = 0, ct.data.passableWater = ct.data.passableMountains = 1, ct.data.canvas = fU.a0N(fU.r0(ct.data), ct.data.mapSeed).uP)), tM = new at(tL.au, (function (aw) {
    var ay = new az(),
      es = (ay.b3(L(126)), ct.data.canvas);
    es.style.width = "100%", ay.b8({
      b7: es
    }), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(20);
    }).button])), aw.push(ay);
  }(aw = []), function (aw) {
    var ay = new az();
    ay.b3(L(57)), ay.b8(new b5({
      af: -1,
      value: ct.data.playerCount
    }, 1, 0, function (b7) {
      var playerCount = he.hf(Math.floor(b7.target.value), 1, 512);
      b7.target.value = ct.data.playerCount = playerCount, 1 === ct.data.gameMode && (b7 = aR.d.qy(ct.data.teamPlayerCount, 0), ct.v0.qv(), aR.d.qy(ct.data.teamPlayerCount, 0) !== b7) && a0d();
    })), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az();
    ay.b3(L(128)), ay.ta(new tb({
      fY: ["Battle Royale", "Teams"],
      value: ct.data.gameMode
    }, function (af) {
      ct.data.gameMode !== af && (1 === (ct.data.gameMode = af) && (ct.data.colorsData || (ct.data.colorsData = new Uint32Array(1)), ct.data.colorsData[0] = 258049), a0d());
    })), aw.push(ay);
  }(aw), aw.push(a0S()), aw.push(a0T()), aw.push(a0U()), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(132)), [L(133), L(134), L(55)]);
    ay.b0(a6[ct.data.playerNamesType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(23);
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(135)), [L(136), L(52) + ": " + ct.data.aIncomeValue, L(55)]);
    ay.b0(a6[ct.data.aIncomeType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(22);
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(137)), [L(136), L(52) + ": " + ct.data.tIncomeValue, L(55)]);
    ay.b0(a6[ct.data.tIncomeType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(26);
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(138)), [L(136), L(52) + ": " + ct.data.iIncomeValue, L(55)]);
    ay.b0(a6[ct.data.iIncomeType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(27);
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(139)), [L(136), L(52) + ": " + ct.data.sResourcesValue, L(55)]);
    ay.b0(a6[ct.data.sResourcesType]), ay.b8(new bL([new ap(L(127), function () {
      aq.fu(28);
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az();
    ay.b3(L(140)), ay.b8(new bL([new ap(L(141), function () {
      aq.mU(), ct.v0.r3(), aq.b1.fk[0] = 0, aq.fu(19);
    }).button])), ay.b8(new bL([new ap(L(142), function () {
      a0g.a0h();
    }).button])), ay.b8(new bL([new ap(L(143), function () {
      return a0g.a0i(), !0;
    }).button])), aw.push(ay);
  }(aw), aw));
}
function a0j() {
  this.a0k = function (af, cB) {
    return Number(this.a0l(af, cB));
  }, this.a0l = function (af, cB) {
    var aY = null;
    return 0 === cA.id ? cA.a0m && (aY = cA.a0m.getItem((cB ? "v" : "d") + af)) : 1 === cA.id ? aY = cA.a0n.loadString((cB ? 1e3 : 2e3) + af) : 2 === cA.id && (aY = cA.a0o[(cB ? "v" : "d") + af]), aY && 0 !== aY.length ? aY : null;
  }, this.a0p = function (aM, a0q) {
    var a6 = [],
      a0r = a0q ? "e" : "l";
    if (0 === cA.id) {
      if (cA.a0m) for (aN = 0; aN < aM; aN++) a6.push(cA.a0m.getItem(a0r + aN));
    } else if (1 === cA.id) for (var a0s = a0q ? 5e3 : 3e3, aN = 0; aN < aM; aN++) a6.push(cA.a0n.loadString(a0s + aN));else if (2 === cA.id) for (aN = 0; aN < aM; aN++) a6.push(cA.a0o[a0r + aN]);
    return a6;
  }, this.save = function (af, value, cB) {
    var gT = (cB ? "v" : "d") + af;
    if (0 === cA.id) {
      if (cA.a0m && b6.buffer.data[140].value) try {
        cA.a0m.setItem(gT, value);
      } catch (b7) {
        console.log(b7);
      }
    } else 1 === cA.id ? cA.a0n.saveString((cB ? 1e3 : 2e3) + af, value) : 2 === cA.id && (cA.a0o[gT] = value, cA.a0t.postMessage(gT + " " + value));
  }, this.a0u = function (a6, a0q) {
    var aM = a6.length,
      a0r = a0q ? "e" : "l";
    if (0 === cA.id) {
      if (cA.a0m && b6.buffer.data[140].value) try {
        for (aN = 0; aN < aM; aN++) cA.a0m.setItem(a0r + aN, a6[aN]);
      } catch (b7) {
        console.log(b7);
      }
    } else if (1 === cA.id) for (var a0s = a0q ? 5e3 : 3e3, aN = 0; aN < aM; aN++) cA.a0n.saveString(a0s + aN, a6[aN]);else if (2 === cA.id) for (aN = 0; aN < aM; aN++) cA.a0o[a0r + aN] = a6[aN], cA.a0t.postMessage(a0r + aN + " " + a6[aN]);
  };
}
function a0v() {
  var a0w = new Array(1),
    a0x = new Array(1),
    a0y = 20,
    a0z = 0,
    a10 = !1;
  function a12() {
    a0y++, nr.play();
  }
  this.r = function () {
    if (!window.document.documentMode) {
      for (var aN = 0; 0 <= aN; aN--) !function (aN, src) {
        a0x[aN] = 0, a0w[aN] = document.createElement("audio"), a0w[aN].src = src, a0w[aN].setAttribute("preload", "auto"), a0w[aN].setAttribute("controls", "none"), a0w[aN].style.display = "none", a0w[aN].onpause = function () {
          a0x[aN] = 1;
        }, a0w[aN].oncanplaythrough = function () {
          a0x[aN] = 0 === a0x[aN] ? 1 : a0x[aN];
        }, document.body.appendChild(a0w[aN]);
      }(aN, "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAACoABtbW1tbW1tbW1tbW1tbW1tbW1tkpKSkpKSkpKSkpKSkpKSkpKSkpK2tra2tra2tra2tra2tra2tra2ttvb29vb29vb29vb29vb29vb29vb//////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAaRAAAAAAAAAqDGJ7xx//sUZAAAAGoWTAUAQAILQojwoBQAQfh1YBgWgAA6iqWDANAA/qchCEIRugQAAAAQRX//zh8AAIKQ8PDADzH/4F4SAs/99er//lD9Zr+tH6BPCvRPDCOshGlfMtv/C4Rh//sUZAKAAIsdXIYVQAANgrkgwBQAAcwBhTwBgDA2CmODgQABAR4bRp///9fF/i9tH5q+c5QFAvcPgcvpBBIAHN+AAH5s2HXJpNQxh/+tf3ukWgQIyReNoQ1S//5ABgKY//sUZAMAAJgc2oUJQAILwpkQoBQAQgQvbhgSgAA8CuaXAFAAEBISGGZh7////3cSlP9OrSjmBg0TESm6X8APjixspcDhfT2cK+sRfD4AEkAAH+b8YABosOqFm9Fv/wrw//sUZAIAAHAMXYYUwAANo2jwwBwAAnABaZwBgAAyimODgCABAwEGWG/+31clmP0m+005fUbgtQ478mJAAArgAAMAPg0DQNDhKCv//8RBx3//mMFAQEBEioQKCilMQU1F//sUZAIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      a10 = !0;
    }
  }, this.mV = function () {
    if (a10) {
      a10 = !1;
      for (var aN = 0; 0 <= aN; aN--) a0w[aN].onpause = null, a0w[aN].oncanplaythrough = null, aq.removeChild(document.body, a0w[aN]), a0w[aN] = null;
    }
  }, __fx.lobbyReminders.setSound(function () {
    nr.play();
  }), this.play = function () {
    if (a10) {
      var eZ = performance.now();
      if (a0z + 66 < eZ) for (var aN = 0; 0 <= aN; aN--) if (1 === a0x[aN]) return a0z = eZ, a0x[aN] = 2, void a0w[aN].play();
      0 < a0y && (a0y--, setTimeout(a12, 66));
    }
  };
}
function a13() {
  this.tv = null, this.a14 = null, this.a15 = null, this.r = function () {
    this.a16 = [L(144), L(145), L(146), L(147), L(148), L(149), L(150), L(151), L(152), L(153), L(154), L(155), L(156), L(157), L(158), L(159), L(160), L(161), L(162), L(163), L(164), L(165), L(166), L(167), "Mare Nostrum"];
    var a17 = [120, 105, 92],
      cos = [12, 12, 60],
      a18 = [300, 300, 9827, 26, 18, 36, 36, 8, 32, 3, 9],
      a19 = [140, 130, 120],
      a1A = [12, 12, 76],
      a1B = [240, 120, 1024, 30, 19, 30, 70, 8, 20, 3, 9],
      a1C = [130, 117, 106],
      a1D = [12, 12, 68],
      a1E = [270, 210, 1024, 28, 19, 33, 50, 8, 26, 3, 9];
    this.tv = new Array(fU.a1H + 1), this.tv[0] = {
      aO: 230,
      dA: 230,
      a1I: 1e3,
      a1J: 2e3,
      a1K: 173
    }, this.tv[1] = {
      aO: 800,
      dA: 800,
      a1I: 100,
      a1J: 50,
      a1K: 43
    }, this.tv[2] = {
      aO: 512,
      dA: 512,
      a1I: 128,
      a1J: 32,
      a1K: 0
    }, this.tv[3] = {
      aO: 960,
      dA: 960,
      a1I: 60,
      a1J: 8,
      a1K: 0
    }, this.tv[4] = {
      aO: 900,
      dA: 900,
      a1I: 100,
      a1J: 5,
      a1K: 0
    }, this.tv[5] = {
      aO: 1e3,
      dA: 1e3,
      a1I: 100,
      a1J: 40,
      a1K: 0
    }, this.tv[6] = {
      aO: 1e3,
      dA: 1e3,
      a1I: 100,
      a1J: 20,
      a1K: 0
    }, this.tv[7] = {
      aO: 1024,
      dA: 1024,
      a1I: 128,
      a1J: 32,
      a1K: 0
    }, this.tv[8] = {
      aO: 820,
      dA: 820,
      a1I: 200,
      a1J: 100,
      a1K: 0
    }, this.tv[9] = {
      aO: 1024,
      dA: 1024,
      a1I: 128,
      a1J: 32,
      a1K: 0
    }, this.tv[10] = {
      a1L: a19,
      a1M: a1A,
      a1N: a1B
    }, this.tv[11] = {
      a1L: a1C,
      a1M: a1D,
      a1N: a1E
    }, this.tv[12] = {
      a1L: a1C,
      a1M: a1D,
      a1N: a1E
    }, this.tv[13] = {
      a1L: a17,
      a1M: cos,
      a1N: a18
    }, this.tv[14] = {
      a1L: a17,
      a1M: cos,
      a1N: a18
    }, this.tv[15] = {
      a1L: a19,
      a1M: a1A,
      a1N: a1B
    }, this.tv[16] = {
      a1L: a19,
      a1M: a1A,
      a1N: a1B
    }, this.tv[17] = {
      a1L: a17,
      a1M: cos,
      a1N: a18
    }, this.tv[18] = {
      a1L: a1C,
      a1M: a1D,
      a1N: a1E
    }, this.tv[19] = {
      a1L: a17,
      a1M: cos,
      a1N: a18
    }, this.tv[20] = {
      aO: 1024,
      dA: 1024,
      a1I: 128,
      a1J: 32,
      a1K: 0
    }, this.tv[21] = {
      aO: 940,
      dA: 940,
      a1I: 80,
      a1J: 8,
      a1K: 0
    }, this.tv[22] = {
      a1L: a1C,
      a1M: a1D,
      a1N: a1E
    }, this.tv[23] = {
      a1L: a19,
      a1M: a1A,
      a1N: a1B
    }, this.tv[24] = {
      a1L: [157, 136, 117],
      a1M: [16, 13, 68],
      a1N: [300, 300, 9827, 26, 18, 36, 36, 8, 32, 3, 9],
      a1O: "[OG] Neutronian"
    };
    for (var aN = 0; aN < fU.a1H; aN++) this.tv[aN].name = this.a16[aN];
    this.tv[fU.a1H] = {
      name: ""
    }, this.a14 = new Uint8Array(12);
    for (aN = 0; aN < 10; aN++) this.a14[aN] = aN;
    for (this.a14[10] = 20, this.a14[11] = 21, this.a15 = new Uint8Array(fU.a1P), aN = 0; aN < 10; aN++) this.a15[aN] = 10 + aN;
    this.a15[10] = 22, this.a15[11] = 23, this.a15[12] = 24;
  };
}
function a1Q() {
  this.r = function () {
    this.a6 = [], this.af = 0;
  }, this.bv = function () {
    return new Uint8Array(this.a6);
  }, this.bh = function (a1R, value) {
    for (var a6 = this.a6, fN = this.af + a1R - 1, a1S = 1 + (fN >> 3); a6.length < a1S;) a6.push(0);
    for (var aN = this.af; aN <= fN; aN++) a6[aN >> 3] |= (value >> fN - aN & 1) << 7 - (7 & aN);
    this.af += a1R;
  }, this.oH = function (a6, a1T, a1U) {
    var a1V = aR.d.xc(a6);
    this.bh(a1T, a1V);
    for (var aN = 0; aN < a1V; aN++) this.bh(a1U, a6[aN]);
  }, this.oI = function (a6, a1T, a1W) {
    var a1V = aR.d.xc(a6);
    this.bh(a1T, a1V);
    for (var aN = 0; aN < a1V; aN++) this.oF(a6[aN], a1W);
  }, this.oF = function (bS, a1T) {
    var aM = bS.length;
    this.bh(a1T, aM);
    for (var aN = 0; aN < aM; aN++) this.bh(16, bS.charCodeAt(aN));
  }, this.oG = function (es) {
    var a1X = (es = es.toDataURL()).split(",");
    if (a1X.length < 2) console.log("error 266");else {
      es = aR.h.a1Y(es = a1X[a1X.length - 1], "/", "_"), es = aR.h.a1Y(es, "\\+", "-");
      var es = aR.h.a1Y(es, "=", ""),
        a1Z = aZ.aa.a1a(es),
        aM = a1Z.length;
      this.bh(30, aM);
      for (var aN = 0; aN < aM; aN++) this.bh(6, a1Z[aN]);
    }
  };
}
function a1b() {
  var aO, dA, a1c;
  function a1t(g4, fS, a1r, a1f, en) {
    fS = a1s(g4, fS + 1 + 2 * a1f & 3);
    !function (g4, gi) {
      return 1 < Math.abs(g4 % aO - gi % aO) || 1 < Math.abs(a1w(g4) - a1w(gi));
    }(g4, fS) && 0 === en[fS << 2] && (en[fS << 2] = a1r);
  }
  function a1w(d1) {
    return Math.floor((d1 + .5) / aO) % dA;
  }
  function a1s(d1, fS) {
    return d1 + a1c[fS];
  }
  this.jS = function (bS) {
    var aN,
      dK,
      aM,
      a1d,
      a1g = ft;
    for (aZ.aa.a1h(aZ.aa.a1a(bS)), fU.tu.tv[fU.jJ].aO = fU.fV = aO = a1g.bg(12), fU.tu.tv[fU.jJ].dA = fU.iD = dA = a1g.bg(12), a1c = [-aO, -1, aO, 1], fU.uP = document.createElement("canvas"), fU.uP.width = fU.fV, fU.uP.height = fU.iD, fU.lR = fU.uP.getContext("2d", {
      alpha: !1
    }), fU.a1k = fU.a1m = null, fU.a1k = fU.lR.getImageData(0, 0, fU.fV, fU.iD), fU.a1m = fU.a1k.data, aR.d.xH(fU.a1m), aM = a1g.bg(12), dK = a1g.bg(5), a1d = oU(aO * dA - 1), aN = 0; aN < aM; aN++) !function (aW, d1, a1e, a1f) {
      var aN,
        fS,
        a1g = ft,
        en = fU.a1m,
        a1n = d1,
        a1o = d1,
        a1p = 0,
        a1q = 1 + a1e,
        a1r = 2 - a1e;
      for (en[d1 << 2] = a1q, aN = 0; aN < aW; aN++) fS = a1g.bg(2), d1 = a1s(d1, fS), en[d1 << 2] === a1q ? a1p % 2 == 1 && a1t(a1o, a1p + 2 * a1f + 3, a1r, a1f, en) : en[d1 << 2] = a1q, a1t(d1, fS, a1r, a1f, en), a1t(a1o, fS, a1r, a1f, en), a1o = d1, a1p = fS;
      a1s(d1, 0) === a1n ? (a1t(d1, 0, a1r, a1f, en), a1t(a1n, 0, a1r, a1f, en)) : a1s(d1, 1) === a1n && (a1t(d1, 0, a1r, a1f, en), a1t(a1n, 2, a1r, a1f, en));
      0 === aW && (a1t(a1n, 0, a1r, a1f, en), a1t(a1n, 2, a1r, a1f, en));
    }(a1g.bg(dK), a1g.bg(a1d), 1 === a1g.bg(1), 1 === a1g.bg(1));
    var eT,
      eU,
      dZ,
      a1x,
      a1y,
      a1z,
      en = fU.a1m,
      a20 = !0,
      a1L = fU.tu.tv[fU.jJ].a1L,
      a1M = fU.tu.tv[fU.jJ].a1M;
    for (eU = 0; eU < dA; eU++) for (a1x = !0, a1y = a20, eT = a1z = 0; eT < aO; eT++) dZ = 4 * eU * aO + 4 * eT, a1z <= eT && 0 < en[dZ] && (a1y = 2 === en[dZ], a1x) && (a1x = !1, a1y !== a20) ? (a20 = a1y, a1z = eT + 1, eT = -1) : (a1y ? (en[dZ] = a1M[0], en[1 + dZ] = a1M[1], en[2 + dZ] = a1M[2]) : (en[dZ] = a1L[0], en[1 + dZ] = a1L[1], en[2 + dZ] = a1L[2]), en[3 + dZ] = 255);
    fU.lR.putImageData(fU.a1k, 0, 0), fU.uA = !0, fU.a1l.r(), dy.gK = !0;
  };
}
function a21() {
  this.a22 = function () {
    for (var id = ft.bg(20), colors = new Array(11), aN = 0; aN < 11; aN++) colors[aN] = new Uint8Array([ft.bg(8), ft.bg(8), ft.bg(8)]);
    var ws = aZ.bt.jS(8);
    hG.hH.kC({
      id: id,
      colors: colors,
      ws: ws
    });
  }, this.a23 = function (bb) {
    var bn = ft.bg(3),
      fS = ft.bg(5),
      fS = be.a24.a25(fS, ft.bg(30), ft.bg(30), ft.bg(30));
    aF.lk.bl(bb, fS, bn, 0);
  }, this.a26 = function (bb) {
    this.a23(bb), b6.bJ.bK(183, bs.aa.fx(bs.aa.fy(15))), 0 === bb && 0 === b6.buffer.data[105].value.length ? aF.lk.bw(0) : aF.bO.a27(bb), 4 === aF.b1.a28(bb).a29() ? 6 === jE.jF() && aF.aG.li(bb) : 5 !== aF.b1.a28(bb).a29() || 8 !== jE.jF() && 10 !== jE.jF() || aF.a2A.yI();
  }, this.a2B = function (bb) {
    var id = ft.bg(6);
    1 === id ? (b6.bJ.bK(160, ft.bg(30)), aF.b1.a2C(bb), uF.a2D || aF.lk.bw(1), ad.a2E(), 8 === aq.fv && aq.mA().a2F()) : 21 === id ? 8 === aq.fv && aq.mA().a2G(17) : 22 === id && (b6.bJ.bK(106, b6.buffer.data[110].value), b6.bJ.bK(110, ""), 8 === aq.fv) && aq.mA().a2G(15);
  }, this.a2H = function () {
    var aM = ft.bg(16),
      a2I = ft.bg(16);
    if (ft.a2J(55 + 10 * aM + 16 * a2I)) {
      for (var a6 = [], aN = 0; aN < aM; aN++) a6.push(aZ.bz.a2L(ft.bg(10)));
      ad.a2M(a6);
    } else aF.b1.a2K(0, 3270);
  }, this.a2N = function (bb) {
    for (var bn = ft.bg(3), fS = ft.bg(5), bn = {
        bn: bn,
        bm: be.a24.a25(fS, ft.bg(30), ft.bg(30), ft.bg(30))
      }, fS = ft.a2O(32), a2P = [], aN = 0; aN < 17; aN++) a2P.push(new Uint8Array(ft.bg(16)));
    for (aN = 0; aN < 17; aN++) for (var a6 = a2P[aN], aM = a6.length, dZ = 0; dZ < aM; dZ++) a6[dZ] = ft.a2O(8);
    mT.show(a2P, fS, bb, bn);
  };
}
function a2Q() {
  this.r = function () {
    !function () {
      var data = b6.buffer.data;
      0 === data[2].cB && (d9.dA > d9.aO || 0 !== cA.id) && (data[2].value = data[2].a2T = 1);
      0 === data[100].cB && (data[100].value = data[100].a2T = (0 === cA.id ? "Player " : 1 === cA.id ? "Android User " : "iOS User ") + Math.floor(1e3 * Math.random()));
    }();
    var aN,
      data = b6.buffer.data,
      aM = data.length;
    for (aN = 0; aN < aM; aN++) {
      var a2U = b6.bY.a0k(aN, !0);
      data[aN] && data[aN].cB === a2U && (null === (a2U = b6.bY.a0l(aN)) ? data[aN].value = data[aN].a2T : 2 === data[aN].type ? data[aN].value = a2U : (a2U = Number(a2U), isNaN(a2U) ? data[aN].value = data[aN].a2T : data[aN].value = a2U));
    }
  };
}
function a2W() {
  this.nI = new a2X(), this.result = new a2Y(), this.a2Z = new a2a(), this.a2b = new a2c(), this.a2d = new a2e(), this.a2f = new a2g(), this.r = function () {
    this.result.r();
  };
}
function a2h() {
  var a2i, a2j, a2k;
  this.r = function () {
    a2i = "Abbasid Caliphate;Aceh s;Achaemenid Z;Afsharid z;Aghlabid Emirate;Ahom z;Akkadian Z;Aksumite Z;Akwamu;Alaouite z;Almohad Caliphate;Almoravid z;Angevin Z;Aq Qoyunlu;Armenian Z;Assyria;Ashanti Z;Austrian Z;Austria-Hungary;Ayyubid z;Aztec Z;Aulikara Z;Babylonian Z;Balhae;Banten s;S Banjar;Bamana Z;Bengal s;Benin Z;Kadamba z;Bornu Z;E Brazil;Britannic Z;British Z;British Raj;Bruneian Z;Bukhara Z;Burgundian State;Buyid z;Byzantine Z;Caliphate of Córdoba;Cao Wei;Carthaginian Z;Cebu Rajahnate;Chagatai Khanate;Chalukya z;Chauhan z;Chavín Z;Chenla;Chera z;Chola z;Comanche Z;Congo Free State;Crimean Khanate;Dacian Z;Delhi s;Demak s;Durrani Z;Dutch Z;Egyptian Z;Elamite Z;Exarchate of Africa;Abyssinia;Fatimid Caliphate;First French Z;Frankish Z;Funan;Gallic Z;Gaza Z;Republic of Genoa;German Z;Ghana Z;Ghaznavid z;Ghurid z;Goguryeo;Goryeo;Gorkha Z;Göktürk Khaganate;Golden Horde;S Gowa;Seljuq Z;Gupta Z;Hafsid Y;Han z;Hanseatic League;E Harsha;Hephthalite Z;Hittite Z;Holy Roman Z;Hotak z;Hoysala Z;Hunnic Z;Husainid z;Idrisid z;Ilkhanate;K Israel;K Judah;Inca Z;Italian Z;E Japan;Jin z;Johor Z;Jolof Z;Joseon;Kaabu Z;Kachari Y;Kalmar Union;Kanem Z;Kanva z;Kara-Khanid Khanate;Kazakh Khanate;Khazar Khaganate;Khmer Z;Khilji z;Khwarazmian z;Kievan Rus';Konbaung z;Kong Z;Korean Z;Kushan Z;K Kush;Lakota;Latin Z;Later Lê z;Liao z;Lodi s;Khmer Z;Macedonian Z;Majapahit Z;Mali Z;Malacca Z;Mamluk s;Manchukuo;Maratha Z;Marinid z;Massina Z;Mataram s;Mauretania;Mauryan Z;Median Z;Mlechchha z;Ming z;Mitanni Z;Mongol Z;Mughal Z;Nanda Z;Nguyễn z;North Sea Z;E Nicaea;Numidia;Omani Z;Ottoman Z;Oyo Z;Pagan Z;Pahlavi z;Pala Z;Palmyrene Z;Parthian Z;Pontic Z;Portuguese Z;K Prussia;Ptolemaic Z;Qajar z;Qara Qoyunlu;Qin z;Qing z;Ramnad Sethupathis;Rashidun Caliphate;Rashtrakuta z;Roman Z;Rouran Khaganate;Rozwi Z;Rustamid z;Russian Z;Tsardom of Russia;Saadi z;Safavid z;Saffarid z;Sassanid z;Satavahana z;Samanid Z;Soviet Union;Saudeleur z;Duchy of Savoy;Seleucid Z;Serbian Z;Shu Han;Shang z;Siam Z;Sikh Z;Singhasari;Sokoto Caliphate;Song z;Songhai Z;Spanish Z;Srivijaya Z;Sui z;K Mysore;Shunga Z;S Sulu;Sumer;Sur Z;Swedish Z;Tahirid z;Tang z;Tây Sơn z;S Ternate;E Thessalonica;German Reich;Tibetan Z;Tondo z;S Tidore;Timurid Z;K Tlemcen;E Trebizond;Toltec Z;Toungoo z;Toucouleur Z;Tu'i Tonga Z;Turgesh Khaganate;Umayyad Caliphate;Uyunid Emirate;Uyghur Khaganate;Uzbek Khanate;Vandal Y;Vijayanagara Z;Republic of Venice;Wari Z;Wassoulou Z;Wattasids;Western Roman Z;Eastern Wu;Western Xia z;Xin z;Yuan z;Zand z;Zhou z;Zulu Z;Yugoslavia;Kosovo;Sikkim;Kanem–Bornu Z;Wadai Z;Ethiopian Z;Rozvi Z;Sasanian Z;E Vietnam;Shilluk Y;K Aksum;Gwiriko Y;Toro Y;Malindi Y;K Loango;K Mapungubwe;Ryukyu Y;K Cyprus;K Jerusalem;Garhwal Y;K Nepal;K Cambodia;Champa Y;Hanthawaddy Y;Phayao Y;K Sardinia;K Sicily;K Gwynedd;K Scotland;K Desmond;K Poland;K Hungary;K Croatia;K Bohemia;Albanian Y;K Georgia;K Portugal;Khanate of Sibir;K Romania;Cossack Hetmanate;Duchy of Bouillon;K Ireland;Lordship of Ireland;K Italy;Republic of Pisa;Idrisid z;Almoravid z;Almohad Caliphate;Marinid z;Wattasid z;Saadian z;Republic of Salé;Rif Republic;K Kush;Makuria;Alodia;Ayyubid z;Mamluk s;Egypt Eyalet;K Fazughli;S Sennar;S Darfur;Mahdist State;S Egypt;K Egypt;Emirate of Cyrenaica;K Libya;Republic of Egypt;Republic of the Sudan;United Arab Republic;Libyan Arab Republic;Zirid z;Hafsid z;K Kuku;Regency of Algiers;Gurunsi;Liptako;Tenkodogo;Wogodogo;Yatenga;Bilanga;Bilayanga;Bongandini;Con;Macakoali;Piela;Nungu;K Sine;K Saloum;K Baol;K Cayor;K Waalo;Bundu;Bonoman;Gyaaman;Denkyira;Mankessim Y;K Dahomey;Oyo Z;K Nri;Aro Confederacy;Kwararafa;Biafra;Buganda;Bunyoro;Ankole;Busoga;Tanganyika;Kuba Y;K Luba;K Lunda;Yeke Y;K Ndongo;Kasanje Y;K Matamba;Mbunda Y;Chokwe Y;Kazembe Y;K Butua;Ndebele Y;Mthethwa Z;Bophuthatswana;Ciskei;Transkei;Venda;Rhodesia;Kart z;Nogai Horde;Khanate of Bukhara;Khanate of Khiva;Khamag Mongol;Northern Fujiwara;Kamakura Shogunate;Ashikaga Shogunate;Jaxa;Republic of Ezo;Jiangxi Soviet;Hunan Soviet;Guangzhou Commune;Gojoseon;Alaiye;Beylik of Bafra;Kara Koyunlu;Kars Republic;K Iraq;Arab Federation;Kar-Kiya z;Baduspanids;Marashiyan z;Afrasiyab z;Mihrabanid z;Safavid Iran;Sheikhdom of Kuwait;Bani Khalid Emirate;Emirate of Diriyah;Emirate of Najd;Muscat and Oman;Emirate of Riyadh;S Najd;K Hejaz;Fadhli s;Emirate of Beihan;Emirate of Dhala;S Lahej;Republic of Kuwait;K Cochin;Jaffna Y;Laur Y;Pandya z;Jaunpur s;Jaintia Y;Hyderabad State;Travancore;Udaipur State;Manikya z;Lan Xang;K Vientiane;K Champasak;Lao Issara;K Laos;Pyu States;Ava;Mon Ys;Pegu;K Mrauk U;Taungoo z;Shan States;Arakan;Raktamaritika;Singhanavati;Dvaravati;Ngoenyang;Hariphunchai;Tambralinga;Lavo Y;Langkasuka;Sukhothai Y;S Singora;Ayutthaya Y;Thonburi Y;Lan Na;Pattani Y;Jambi s;Palembang s;S Deli;S Langkat;S Serdang;S Cirebon;K Pajang;K Bali;Bima s;K Larantuka;K Banggai;Luwu;S Bone;Caucasian Albania;Kabardia;Circassia;K Abkhazia;Elisu s;Avar Khanate;Caucasian Imamate;K Imereti;K Kartli;K Kakheti;Crown of Aragon;Emirate of Granada;K Majorca;Crown of Castile;K Haiti;Cocollán;Zapotec Civilization;Mosquito Y;Somoza Regime;Iroquois Confederacy;Cherokee Nation;Vermont Republic;State of Muskogee;K Alo;K Sigave;K Fiji;K Nauru;K Chile;Muisca Confederation;El Stronato;K Chimor;Jungle Republic;Liga Federal;Supreme Junta;Weimar Republic;K Bavaria;Bremen;Frankfurt;Hamburg;K Hanover;Holstein;Lippe;Nassau;Oldenburg;Pomerania;Reuss;Saxe-Altenburg;Saxony;Schleswig;Waldeck;Württemberg;Helvetic Republic;Republic of Florence;Duchy of Urbino;Republic of Cospaia;Duchy of Lucca;Duchy of Mantua;Duchy of Milan;Papal States".split(";"), a2j = "Corrupted Earth;Returning Nature;Abandoned Areas;Restricted Area;Contaminated Area;Burning Land;Barren Land;Ravenland;Deadland;Dangerous Area;Devastated Land;Swampland;Plundered Land;Overrun Area;Undead Masses;Roaming Horde;Lurking Horde;Fallen Territory;Ghostland;Doomstruck Land;Infected Enclave;Plagued Nation;Forbidden Zone;Toxic Ground;Scorched Earth;Ruined City;Cursed Land;Diseased Colony;Forsaken Fields;Necromancer".split(";"), a2k = "Protected Zone;Quarantine Zone;Last Bastion;Buffer Zone;Liberated Area;Resistance Zone;Rising Territory;Recovered Region;Rebel Sector;Emerging Lands;Safety Corridor;Isolation Area;Guarded Sector".split(";");
    for (var a2l = ["K ", " Y", "E ", " Z", " z", " s", "S "], a2m = ["Kingdom of ", " Kingdom", "Empire of ", " Empire", " Dynasty", " Sultanate", "Sultanate of "], aN = a2i.length - 1; 0 <= aN; aN--) for (var aQ = a2l.length - 1; 0 <= aQ; aQ--) a2i[aN] = a2i[aN].replace(a2l[aQ], a2m[aQ]);
    if (__fx.settings.realisticNames) a2i = realisticNames;
  }, this.v9 = function () {
    var aM = ct.dP,
      dI = d3.dI,
      rj = d3.rj,
      playerNamesData = ct.data.playerNamesData;
    if (!playerNamesData || playerNamesData.length < aM) for (var aN = 0; aN < aM; aN++) dI[aN] = rj[aN] = "Player " + iW.rU(1e3);else for (aN = 0; aN < aM; aN++) dI[aN] = rj[aN] = __fx.nameFilter.filter(playerNamesData[aN]);
  }, this.bd = function () {
    if (9 === ct.cu) {
      for (var uW = iW.random(), a2s = a2k, a2t = a2j, ki = tV.ki, aM = a2s.length, aW = ct.data.teamPlayerCount[7], dI = d3.dI, rj = d3.rj, aN = aW - 1; aN >= ct.dP; aN--) dI[aN] = rj[aN] = a2s[(aN + uW) % aM];
      for (aM = a2t.length - 1, aN = aW; aN < ct.cv; aN++) dI[aN] = rj[aN] = a2t[ki[aN] ? aM : aN % aM];
    } else (2 === ct.data.playerNamesType ? function () {
      for (var aM = ct.cv, dI = d3.dI, rj = d3.rj, playerNamesData = ct.data.playerNamesData, aN = ct.dP; aN < aM; aN++) dI[aN] = rj[aN] = __fx.nameFilter.filter(playerNamesData[aN]);
    } : 1 === ct.data.playerNamesType ? function () {
      for (var dI = d3.dI, rj = d3.rj, aN = ct.dP; aN < ct.cv; aN++) dI[aN] = rj[aN] = "Bot " + iW.rU(1e3);
    } : function () {
      for (var a2u = a2i, aM = a2u.length, uW = iW.random(), dI = d3.dI, rj = d3.rj, aN = ct.dP; aN < ct.cv; aN++) dI[aN] = rj[aN] = a2u[(aN + uW) % aM];
    })();
  };
}
function tD() {
  var a2v = new Uint8Array(78);
  this.r = function () {
    var aN;
    for (a2v[50] = 37, aN = 0; aN < 10; aN++) a2v[aN + 3] = aN + 1;
    for (aN = 0; aN < 26; aN++) a2v[aN + 20] = aN + 11, a2v[aN + 52] = aN + 38;
  }, this.a2w = function (bS) {
    return bS.trim().replace(new RegExp("[^a-zA-Z0-9_\\-]", "g"), "-");
  }, this.a2x = function (bS, size) {
    if ((bS = this.a2w(bS)).length > size) return bS.substring(0, size);
    for (; bS.length < size;) bS = "-" + bS;
    return bS;
  }, this.a1a = function (bS) {
    for (var a2y = a2v, aM = bS.length, a6 = new Uint8Array(aM), aN = 0; aN < aM; aN++) a6[aN] = a2y[bS.charCodeAt(aN) - 45];
    return a6;
  }, this.a1h = function (a1Z) {
    bc.bd(6 * a1Z.length), this.a2z(a1Z), ft.r(bc.bk);
  }, this.a2z = function (a1Z) {
    for (var aM = a1Z.length, aO = bc, aN = 0; aN < aM; aN++) aO.bh(6, a1Z[aN]);
  }, this.c0 = function (bS) {
    this.a2z(this.a1a(bS));
  }, this.pR = function (bS, size) {
    this.a2z(this.a1a(this.a2x(bS, size)));
  }, this.ab = function (bS, size) {
    for (var a6 = this.a1a(this.a2x(bS, size)), aY = 0, fM = 1, aN = a6.length - 1; 0 <= aN; aN--) aY += fM * a6[aN], fM *= 64;
    return aY;
  };
}
function nl() {
  function a33() {
    aq.wU(29) && (aI.b1.a31 && 1 === aI.b1.a30[2] && aq.wU(29).a36(), aI.b1.a31 = 0, aq.wU(29).a37(), aq.wU(29).a38(), aI.nf.a39());
  }
  this.jH = new Array(4), this.a30 = [0, 0, 1, 0], this.a31 = 0, this.jW = [0, 0], this.r = function () {
    for (var aN = 0; aN < this.jH.length; aN++) this.jH[aN] = new a32();
    this.a30[0] = b6.buffer.data[158].value, __fx.lobbyReminders.setRooms(this.jH), __fx.lobbyReminders.setPopupHandler(function (text) {
      aI.message.aJ({
        id: 7,
        a0: text
      });
    });
  }, this.jT = function () {
    a33(), aI.ng.r(), __fx.lobbyReminders.check();
  }, this.ji = function () {
    aI.ng.ji();
    for (var aN = 0; aN < aI.b1.jH.length; aN++) {
      var jG = aI.b1.jH[aN];
      0 === jG.jI ? jG.a3A = 0 : (jG.jP = Math.max(jG.jP - jG.a3A % 2, 0), jG.a3A++);
    }
    a33(), __fx.lobbyReminders.check();
  }, this.jr = function (jk) {
    this.a30[0] !== jk || this.a30[2] || aq.wU(29).a3B();
  };
}
function vz() {
  this.buffer = {}, this.t3 = new Array(8), this.wD = null, this.wA = null, this.a3C = 0, this.fk = [0, 0], this.mR = function () {
    aq.fu(5, 5);
  }, this.vW = function (c2) {
    c2 && (mF.a3D = c2), aq.mU(), mF.r();
  }, this.zC = function () {
    aq.fu(0 === jE.jF() ? 5 : 0);
  }, this.z7 = function () {
    if (1 === b6.buffer.data[130].value) aq.fu(8, aq.mA().mB, new fw(24, {
      pT: b6.buffer.data[125].value,
      pL: b6.buffer.data[128].value,
      pM: b6.buffer.data[129].value
    }));else {
      for (var a6 = (a6 = b6.buffer.data[126].value.split(",")).slice(0, 10), aN = 0; aN < a6.length; aN++) a6[aN] = a6[aN].trim().slice(0, 7).toUpperCase();
      1 === a6.length && 0 === a6[0].length && (a6 = []), aq.fu(8, aq.mA().mB, new fw(23, {
        pT: b6.buffer.data[125].value,
        pU: a6
      }));
    }
  }, this.zH = function (mB, target) {
    aq.fu(4, mB, new mC("Data Usage Information", "Do you want your username and other data to be remembered for the next session?<br>The app might not function correctly if you decline data usage.<br>Please read our privacy policy for more information: " + aF.b1.b2("/privacy"), !1, [new ap("⬅️ " + L(1), function () {
      aq.fu(mB);
    }), new ap("✅ Accept", function () {
      b6.bJ.bK(140, 1), 0 === target ? aq.fu(2, mB) : aq.fu(8, mB, new fw(target));
    })]));
  }, this.a3E = function () {
    for (var aN = 0; aN < 8; aN++) this.t3[aN] = aZ.bz.a2L(ft.bg(5));
    this.t3[1] = "[" + this.t3[1] + "]", 5 === aq.fv && (aq.mA().vu.bK(this.t3), aq.mA().resize());
  }, this.bT = function (aY, a2A, k5) {
    aY = aR.f.a3F(aY, 1, 1e6);
    a2A = L(168, [a2A]);
    return (a2A += "<br>") + L(169, [k5]) + "<br>" + L(170, [aY + "–" + (aY + 2)]) + "<br>" + L(171, [aY]);
  };
}
function a3G() {
  var a3H = null,
    a0z = 2e4,
    a3I = 0;
  this.f1 = function () {
    dy.dz < a0z || (a0z = dy.dz + 1e4, 0 !== cA.id) || a3H || hG.a3J() || (aF.b1.bM(0) ? __fx.settings.hidePropagandaPopup || __fx.customLobby.isActive() || aF.lk.bw(5) : a0z = dy.dz + 1e3);
  }, this.kC = function (bW) {
    a3H = bW;
  }, this.show = function () {
    return !(!a3H || dy.dz < a3I) && (__fx.settings.hidePropagandaPopup || __fx.customLobby.isActive() ? void 0 : (a3I = dy.dz + 6e4, new a3K().show(a3H.ws, a3H.colors, a3H.id), !(a3H = null)));
  };
}
function a3L() {
  var af = 0,
    dz = dy.dz;
  this.g6 = 0, this.f1 = function () {
    d9.f1(), ct.dO ? gL() : 0 === af ? dy.dz >= dz && (dz += dy.gM * Math.floor(1 + (dy.dz - dz) / dy.gM), 2 === ct.dX || my.mz ? gN() : (gU(), gJ.render()), af++) : ((my.mz ? gL : (dy.gK = !0, gS))(), af = 0), gQ(), dy.gK && (dy.gK = !1, gR());
  };
}
function a3M() {
  var aO,
    eT,
    a3N,
    canvas,
    j,
    mg,
    i9,
    a3O,
    lG,
    lK,
    a3P = 11 / 12;
  function a3R() {
    var a3T = Math.floor(i9 * (aO - 2 * a3N)),
      a3U = 1 + Math.floor(.0625 * hB.dA),
      a3V = 1 + Math.floor(.3 * hB.dA),
      a3W = Math.floor(.55 * hB.dA);
    j.clearRect(0, 0, aO, hB.dA), j.fillStyle = bG.su, j.fillRect(0, 0, a3N, hB.dA), j.fillRect(a3N + a3T, 0, aO - a3N - a3T, hB.dA), j.fillStyle = i9 < 1 / 3 ? "rgba(" + Math.floor(3 * i9 * 130) + ",130,0,0.85)" : i9 < 2 / 3 ? "rgba(130," + (130 - Math.floor(3 * (i9 - 1 / 3) * 130)) + ",0,0.85)" : "rgba(130,0," + Math.floor(3 * (i9 - 2 / 3) * 130) + ",0.85)", j.fillRect(a3N, 0, a3T, hB.dA), j.fillStyle = bG.bH, j.fillRect(0, 0, aO, 1), j.fillRect(0, hB.dA - 1, aO, 1), j.fillRect(0, 0, 1, hB.dA), j.fillRect(a3N, 0, 1, hB.dA), j.fillRect(a3N + a3T, 0, 1, hB.dA), j.fillRect(aO - a3N, 0, 1, hB.dA), j.fillRect(aO - 1, 0, 1, hB.dA), j.fillRect(Math.floor(.25 * hB.dA) + a3V, Math.floor((hB.dA - a3U) / 2), hB.dA - 2 * a3V, a3U), j.fillRect(Math.floor(aO - 1.25 * hB.dA) + a3V, Math.floor((hB.dA - a3U) / 2), hB.dA - 2 * a3V - a3V % 2, a3U), j.fillRect(Math.floor(aO - 1.25 * hB.dA) + Math.floor((hB.dA - a3U) / 2), a3V, a3U, hB.dA - 2 * a3V - a3V % 2), a3O = aR.f.i8(ct.eG, hB.k1()), j.fillText(aR.h.dG(a3O) + " (" + aR.h.qd(100 * i9, +(i9 < .1)) + ")", Math.floor(.5 * aO), a3W);
  }
  this.setAbsolutePercentage = function (newPercentage) {
    i9 = newPercentage;
  };
  __fx.keybindFunctions.setAbsolute = this.setAbsolutePercentage;
  __fx.keybindFunctions.setRelative = arg1 => hB.a3g(arg1);
  function a3e(dj) {
    return !(1 < dj && 1 === i9 || (1 < dj && dj * i9 - i9 < 1 / 1024 ? dj = (i9 + 1 / 1024) / i9 : dj < 1 && i9 - dj * i9 < 1 / 1024 && (dj = (i9 - 1 / 1024) / i9), i9 = he.hf(i9 * dj, 1 / 1024, 1), a3R(), 0));
  }
  function a3f(dk) {
    return i9 !== (i9 = he.hf((dk - eT - a3N) / (aO - 2 * a3N), 1 / 1024, 1)) && (a3R(), !0);
  }
  __fx.keybindFunctions.repaintAttackPercentageBar = function () {
    a3R(), dy.gK = !0;
  }, this.eU = 0, this.a3Q = !1, this.r = function () {
    mg = !ct.dO && !ct.mH, lK = !1, i9 = __fx.settings.startingPercentageEnabled ? (__fx.settings.startingPercentage || 50) / 100 : (b6.buffer.data[182].value + 1) / 1024, a3O = 0, this.a3Q = !1, this.resize();
  }, this.resize = function () {
    cA.hg.hh() && d9.aO < .8 * d9.dA ? (this.dA = Math.floor(.066 * d9.dC), aO = d9.aO - 4 * lS.gap - this.dA) : (aO = Math.floor((cA.hg.hh() ? .65 : .389) * d9.dC), aO += 12 - aO % 12, this.dA = Math.floor(aO / 12)), a3N = Math.floor(3 * this.dA / 2), lG = aR.b.dF(1, Math.floor(.5 * this.dA)), (canvas = document.createElement("canvas")).width = aO, __fx.mobileKeybinds.setSize(aO, this.dA, dE), canvas.height = this.dA, (j = canvas.getContext("2d", {
      alpha: !0
    })).font = lG, aR.b.textBaseline(j, 1), aR.b.textAlign(j, 1), this.lV(), a3R();
  }, this.lV = function () {
    eT = cA.hg.hh() && d9.aO < .8 * d9.dA ? this.dA + 3 * lS.gap : Math.floor((d9.aO - aO) / 2), this.eU = d9.dA - this.dA - nT.nU() * lS.gap;
  }, this.dY = function () {
    lK && (lK = !1, a3R());
  }, this.mg = function () {
    return !(!mg || my.mz && eT < Math.floor(lS.gap + 5.5 * this.dA));
  }, this.nQ = function (a3X) {
    return !!this.mg() && eT + aO > d9.aO - a3X - lS.gap;
  }, this.a3Y = function () {
    mg = !ct.mH;
  }, this.n3 = function () {
    mg = !1;
  }, this.k1 = function () {
    return he.hf(Math.floor(1024 * i9 + .5) - 1, 0, 1023);
  }, this.sl = function (dk, dl) {
    return this.mg() && eT < dk && dk < eT + aO && dl > this.eU;
  }, this.mv = function (dk, dl) {
    if (!this.mg()) return !1;
    if (!(__fx.settings.keybindButtons && dl > this.eU - Math.floor(lS.gap / 4) - this.dA && dl < this.eU - Math.floor(lS.gap / 4) && __fx.mobileKeybinds.click(dk - eT))) {
      if (!hB.sl(dk, dl)) return !1;
      qA.a3b = !1, !function (a3d, dk, dl) {
        if (function (dk, dl) {
          return eT < dk && dk < eT + a3N && dl > hB.eU;
        }(dk, dl)) return a3e(a3P);
        if (function (dk, dl) {
          return eT + aO - a3N < dk && dk < eT + aO && dl > hB.eU;
        }(dk, dl)) return a3e(1 / a3P);
        return a3d.a3Q = !0, a3f(dk);
      }(this, dk, dl) || (dy.gK = !0);
    }
    return !0;
  }, this.a3g = function (fM) {
    0 !== ct.dX && this.mg() && a3e(fM) && (dy.gK = !0);
  }, this.uI = function (deltaY) {
    var fM;
    return !(0 === deltaY || !this.mg()) && a3e(fM = 0 < deltaY ? (fM = 400 / (400 + deltaY)) < a3P ? a3P : fM : 1 / a3P < (fM = (400 - deltaY) / 400) ? 1 / a3P : fM);
  }, this.dh = function (dk) {
    return !!this.a3Q && a3f(dk);
  }, this.a3h = function () {
    this.a3Q = !1;
  }, this.f1 = function () {
    this.mg() && a3O !== aR.f.i8(ct.eG, this.k1()) && (lK = !0);
  }, this.dd = function () {
    this.mg() && (dE.drawImage(canvas, eT, this.eU), __fx.settings.keybindButtons) && __fx.mobileKeybinds.draw(dE, eT, this.eU);
  };
}
function a3i() {
  this.aa = new a3j(), this.bz = new a3k(), this.bt = new a3l(), this.r = function () {
    this.aa.r();
  };
}
function a3m() {
  var a3n;
  function a3p(player) {
    var uW, a3r;
    return aR.f.eH(player) && player < ct.dP ? 0 : (uW = a3n[he.iA((ct.cv - 1) * d3.d4[player], ct.kB)], dy.f2() < 1920 && (uW = Math.max(he.iA(100 * (13440 - 6 * dy.f2()), 1920), uW)), a3r = gw.k9(player), d3.dL[player] > a3r && (uW -= he.iA(2 * uW * (d3.dL[player] - a3r), a3r)), Math.min(Math.max(uW, 0), 700));
  }
  function a43(fM) {
    for (var d4 = d3.d4, eK = eI.eK, aN = eI.eJ - 1; 0 <= aN; aN--) {
      var d1 = eK[aN];
      aR.f.l7(d1, he.iA(fM * d4[d1], 32));
    }
  }
  function a40() {
    var a1n = ct.eG;
    k3.a47[0] = d3.dL[a1n] - d3.eX[a1n];
  }
  function a42(af) {
    var a1n = ct.eG,
      a1n = d3.dL[a1n] - d3.eX[a1n] - k3.a47[0];
    gw.ld += a1n, hD.a48[af] += a1n;
  }
  this.ld = 0, this.oH = function () {
    for (var aM = ct.cv, aN = (a3n = new Uint16Array(aM), 0); aN < aM; aN++) a3n[aN] = 100 + a3o(he.iA(25600 * aN, aM - 4), 9);
  }, this.r = function () {
    (this.ld = 0) === ct.data.iIncomeType ? this.qs = a3p : 1 === ct.data.iIncomeType ? this.qs = function (player) {
      return he.iA(ct.data.iIncomeValue * a3p(player), 64);
    } : this.qs = function (player) {
      return he.iA(ct.data.iIncomeData[player] * a3p(player), 64);
    };
  }, this.f1 = function () {
    if (dy.f2() % 10 == 9 && (gw.ld = 0, function () {
      a40();
      for (var eK = eI.eK, dL = d3.dL, aN = eI.eJ - 1; 0 <= aN; aN--) {
        var d1 = eK[aN],
          a41 = he.iA(gw.qs(d1) * dL[d1], 1e4);
        aR.f.l7(d1, Math.max(a41, 1));
      }
      a42(9);
    }(), function () {
      if (0 !== ct.data.aIncomeType) {
        if (a40(), 1 === ct.data.aIncomeType) for (var d4 = d3.d4, eK = eI.eK, fM = ct.data.aIncomeValue, aN = eI.eJ - 1; 0 <= aN; aN--) {
          var d1 = eK[aN];
          aR.f.l7(d1, he.iA(fM * d4[d1], 128));
        } else 2 === ct.data.aIncomeType && function () {
          for (var d4 = d3.d4, eK = eI.eK, fM = ct.data.aIncomeData, aN = eI.eJ - 1; 0 <= aN; aN--) {
            var d1 = eK[aN];
            aR.f.l7(d1, he.iA(fM[d1] * d4[d1], 128));
          }
        }();
        a42(18);
      }
    }(), dy.f2() % 100 == 99)) {
      if (a40(), 0 === ct.data.tIncomeType) a43(32);else if (1 === ct.data.tIncomeType) a43(ct.data.tIncomeValue);else for (var d4 = d3.d4, eK = eI.eK, fM = ct.data.tIncomeData, aN = eI.eJ - 1; 0 <= aN; aN--) {
        var d1 = eK[aN];
        aR.f.l7(d1, he.iA(fM[d1] * d4[d1], 32));
      }
      a42(8);
    }
  }, this.k9 = function (player) {
    return Math.min(100 * d3.d4[player], ct.um);
  }, this.ol = function (player, jy) {
    v4.a3s(player, jy, k3.k4[0], 0), aR.f.l7(jy, k3.k4[0]), hD.a3t(player, jy), di.d0(player, k3.k4[0] + k3.k4[1]), di.d7(jy, k3.k4[0]), aR.f.oh(player);
  }, this.a3u = function () {
    for (var aM = eI.eJ, ix = eI.eK, aW = 0, lL = d3.dL, aN = 0; aN < aM; aN++) aW += lL[ix[aN]];
    return aW;
  }, this.a3v = function (a3w) {
    for (var d1, aM = eI.eJ, ix = eI.eK, aW = 0, lL = d3.dL, iy = ey.iy, aN = 0; aN < aM; aN++) iy[d1 = ix[aN]] === a3w && (aW += lL[d1]);
    return aW;
  };
}
function a49() {
  this.a4A = function (player, id) {
    for (var a4B = d3.kn[player], aM = a4B.length, aN = 0; aN < aM; aN++) if (dr.hi(a4B[aN], id)) return !0;
    return !1;
  }, this.a4C = function (player, gm) {
    for (var i5, a4D, fK, a4B = d3.kn[player], aM = a4B.length, aO = fU.fV, a4F = dr.ht(gm), a4G = dr.hu(gm), a4H = -1, min = fU.fV * fU.fV + fU.iD * fU.iD, id = d5.hm(dr.iI(gm)), aN = 0; aN < aM; aN++) (a4D = (a4D = a4F - (i5 = (fK = a4B[aN]) >> 2) % aO) * a4D + (a4D = a4G - ~~((.5 + i5) / aO)) * a4D) < min && dr.hi(fK, id) && (min = a4D, a4H = i5);
    return a4H;
  }, this.a4I = function (i4, i5) {
    for (var id = d5.hm(dr.iI(i5)), hj = dr.hb, fK = dr.iI(i4), a4J = -1, aN = 0; aN < 4; aN++) {
      var hk = fK + hj[aN];
      d5.hl(hk) && d5.hm(hk) === id && (-1 === a4J || dr.i6(dr.iJ(hk), i5) < dr.i6(a4J, i5)) && (a4J = dr.iJ(hk));
    }
    return a4J;
  }, this.a4K = function (player, gm) {
    for (var hj = dr.hb, fK = dr.iI(gm), aN = 0; aN < 4; aN++) {
      var hk = fK + hj[aN];
      if (d5.l3(hk) && d5.l4(player, hk)) return !0;
    }
    return !1;
  }, this.a4L = function (player, gm) {
    for (var hj = dr.hb, fK = dr.iI(gm), aN = 0; aN < 4; aN++) {
      var hk = fK + hj[aN];
      if (d5.ho(hk)) return !0;
      if (d5.l3(hk)) {
        hk = d5.hp(hk);
        if (player !== hk && kl.km(player, hk)) return !0;
      }
    }
    return !1;
  }, this.a4M = function (gm) {
    for (var hj = dr.hb, fK = dr.iI(gm), aN = 0; aN < 4; aN++) {
      var hk = fK + hj[aN];
      if (d5.l3(hk)) {
        hk = d5.hp(hk);
        if (aR.f.eH(hk)) return hk;
      }
    }
    return -1;
  }, this.a4N = function (fK) {
    if (d5.hl(fK)) for (var hj = dr.hb, aN = 0; aN < 4; aN++) if (d5.kr(fK + hj[aN])) return !0;
    return !1;
  }, this.a4O = function (player, id) {
    for (var pL = player << 3, pM = pL + h0.b1.a4P[player], pj = h0.b1.pj, a4Q = h0.b1.a4Q, aN = pL; aN < pM; aN++) {
      var a4R = a4Q[aN];
      if (pj[a4R] === id) return a4R;
    }
    return -1;
  }, this.a4S = function (player) {
    return 0 === h0.b1.a4P[player] ? -1 : h0.b1.a4Q[player << 3];
  }, this.a4T = function (dk, dl) {
    var aM = h0.b1.ka;
    if (aM < 1) return -1;
    for (var kY = h0.b1.kY, a4U = 80, sa = -1, aN = 0; aN < aM; aN++) {
      var rW = dr.hv(dk, dl, kY[aN]);
      rW < a4U && (a4U = rW, sa = aN);
    }
    return function (aN, dk, dl) {
      if (aN < 0) return;
      var a4c = h0.b1.kY[aN],
        a4d = dr.i0(a4c),
        a4c = dr.i2(a4c),
        aN = 20 * (.9 + .1 * Math.log10(h0.b1.kx[aN]));
      return aN = Math.max(aN, dr.iB(aR.b.sJ(.02, 1.7))), he.a4g(dr.hz(dk), dr.i1(dl), a4d, a4c, aN);
    }(sa, dk, dl) ? sa : -1;
  }, this.pf = function (kh) {
    for (var aM = h0.b1.ka, pj = h0.b1.pj, aN = 0; aN < aM; aN++) if (pj[aN] === kh) return k3.oo[2] = aN, !0;
    return !1;
  }, this.a4W = function (player) {
    for (var pL = player << 3, pM = pL + h0.b1.a4P[player], a4Q = h0.b1.a4Q, kx = h0.b1.kx, ki = 0, aN = pL; aN < pM; aN++) ki += kx[a4Q[aN]];
    return ki;
  }, this.a4X = function (player, pu) {
    pu = h0.b1.pn[pu];
    return this.a4K(player, pu[pu.length - 1]);
  }, this.a4Y = function (i4, i5, rW, a4Z) {
    var dq = dr.ht(i4),
      i4 = dr.hu(i4),
      dv = dr.ht(i5),
      i5 = dr.hu(i5),
      dv = (rW = Math.max(rW, 1), dv - dq),
      i5 = i5 - i4,
      df = he.iA(Math.abs(dv) * a4Z, rW),
      a4Z = he.iA(Math.abs(i5) * a4Z, rW);
    return dr.iE(dq + Math.sign(dv) * df, i4 + Math.sign(i5) * a4Z);
  }, this.pp = function (gf, gm) {
    for (var aM = gf.length - 1, eT = dr.ht(gm), eU = dr.hu(gm), aN = 0; aN < aM; aN++) {
      var i4 = gf[aN],
        i5 = gf[aN + 1],
        e3 = dr.ht(i4),
        i4 = dr.hu(i4),
        e8 = dr.ht(i5),
        i5 = dr.hu(i5);
      if (!(eT !== e3 && eT !== e8 && Math.sign(eT - e3) === Math.sign(eT - e8) || eU !== i4 && eU !== i5 && Math.sign(eU - i4) === Math.sign(eU - i5))) {
        if (e3 === e8 || i4 === i5) return aN;
        if (Math.abs(eT - e3) === Math.abs(eU - i4) && Math.abs(eT - e8) === Math.abs(eU - i5)) return aN;
      }
    }
    return -1;
  }, this.qq = function () {
    for (var a4h = iw[0], kw = h0.b1.kw, ka = h0.b1.ka, a6 = [], aN = 0; aN < ka; aN++) aR.f.a4i(a4h, kw[aN] >> 3) && a6.push(aN);
    return a6;
  }, this.a4j = function (player, gf) {
    for (var pL = player << 3, pM = pL + h0.b1.a4P[player], a4Q = h0.b1.a4Q, pn = h0.b1.pn, g4 = gf[0], gi = gf[gf.length - 1], aN = pL; aN < pM; aN++) {
      var d1 = pn[a4Q[aN]];
      if (d1[0] === g4 && d1[d1.length - 1] === gi) return !0;
    }
    return !1;
  };
}
function lz() {
  this.a4k = 28, this.m2 = 0, this.a4l = null;
  var a4n = this.a4m = null;
  new Uint8Array([2, 0, 2, 1, 1, 1, 1, 2, 0, 2]);
  function a4s(el, a4u) {
    var eT,
      eU,
      gm,
      df,
      es = aR.b.xo(el, el),
      e2 = aR.b.getContext(es, !0),
      xp = aR.b.getImageData(e2, el, el),
      en = xp.data,
      aW = (el >> 1) - .5,
      a4v = .5 + aW;
    for (a4v *= a4v, eU = 0; eU < el; eU++) for (eT = 0; eT < el; eT++) df = (df = eT - aW) * df + (df = eU - aW) * df, en[gm = 4 * (eU * el + eT)] = a4u[0], en[1 + gm] = a4u[1], en[2 + gm] = a4u[2], en[3 + gm] = (a4v - df) * a4u[3] / a4v;
    return e2.putImageData(xp, 0, 0), es;
  }
  function a51(aN, e2, es, el) {
    var highlight, eT, eU;
    0 !== d3.eF[aN] && 0 !== d3.d4[aN] && ((highlight = __fx.settings.highlightClanSpawns && __fx.clanFilter.inOwnClan[aN]) && (el *= 2), eT = d3.dM[aN] + d3.dS[aN] + 1 - el - 2 >> 1, eU = d3.dN[aN] + d3.dT[aN] + 1 - el - 2 >> 1, highlight ? e2.drawImage(es[ct.il ? 9 === ct.cu && 5 === tV.ki[aN] ? 3 : ey.iy[aN] : aN < ct.dP ? 1 : 0], eT, eU, el, el) : e2.drawImage(es[ct.il ? 9 === ct.cu && 5 === tV.ki[aN] ? 3 : ey.iy[aN] : aN < ct.dP ? 1 : 0], eT, eU));
  }
  this.r = function () {
    var a3d;
    this.m2 = 700, function (a3d) {
      var el = a3d.a4k;
      if (a3d.a4m = [], a4n = [], ct.il) {
        for (var aN = 0; aN <= ct.rk; aN++) a3d.a4m.push(a4s(el, ey.rC[ey.iv[aN]])), a4n.push(a4s(el >> 1, ey.rC[ey.iv[aN]]));
        9 === ct.cu && a4n.push(a4s(el, ey.rC[1]));
      } else a3d.a4m.push(a4s(el, ey.rC[7])), a3d.a4m.push(a4s(el, ey.rC[4])), a4n.push(a4s(el >> 1, ey.rC[7]));
    }(this), function (a3d, a4z) {
      var aN,
        a4l = a3d.a4l,
        e2 = aR.b.getContext(a4l, !0),
        aM = ct.cv,
        el = a3d.a4k >> 1;
      e2.imageSmoothingEnabled = !1, e2.setTransform(1, 0, 0, 1, 0, 0), a4z && e2.clearRect(0, 0, a4l.width, a4l.height);
      if (9 === ct.cu) {
        el <<= 1;
        a3d = h3.ro[5];
        for (aN = aM - a3d; aN < aM; aN++) a51(aN, e2, a4n, el);
        aM -= a3d, el >>= 1;
      }
      for (aN = ct.dP; aN < aM; aN++) a51(aN, e2, a4n, el);
    }(this, null !== (a3d = this).a4l && a3d.a4l.width === fU.fV - 2 && a3d.a4l.height === fU.iD - 2 || (a3d.a4l = aR.b.xo(fU.fV - 2, fU.iD - 2), !1)), ct.dO || this.a4r();
  }, this.a4t = a4s, this.a4r = function () {
    for (var aM = ct.dP, el = this.a4k, a4m = this.a4m, e2 = aR.b.getContext(this.a4l, !0), aN = 0; aN < aM; aN++) a51(aN, e2, a4m, el);
  };
}
function kK() {
  this.a52 = 0, this.r = function () {
    this.a52 = 0;
  }, this.f1 = function () {
    if (!this.a52 && dy.f2() % 30 == 7 && aR.f.ih(90) && (gz.performance.a52 = 1)) {
      if (ct.il) {
        var a57 = hE.iu();
        if (ey.iv[a57]) {
          hE.a58(a57);
          var a6 = k3.a59,
            aM = k3.a5A[0];
          if (0 !== aM) for (var a5B = Math.min(100 + 10 * (aM - 1), 400), aN = 0; aN < aM; aN++) tV.a5C(a6[aN], a5B);
        }
      }
      tV.a5C(iw[0], 100);
    }
  };
}
function vC() {
  (a5D = void 0 === a5D ? document.createElement("canvas") : a5D).width = fU.fV, a5D.height = fU.iD, vL = a5D.getContext("2d", {
    alpha: !0
  }), vM = a5E = null, vM = vL.getImageData(0, 0, fU.fV, fU.iD), a5E = vM.data, aR.d.xH(a5E);
}
function a5F() {
  var a5G = 0;
  function a5L(bS, id) {
    console.log(bS), a5G || (id ? 1 === id ? fA.a5I = L(173) + ": " + bS : aq.fu(4, 3, new mC(L(174), bS, 1)) : aq.fu(4, 3, new mC("⚠️ " + L(172), bS, 1)));
  }
  this.jS = function (bS, a5H) {
    var hy, c3;
    return a5G = a5H, aZ.aa.a1h(aZ.aa.a1a(aZ.aa.a2w(bS))), fA.a5I = "", !!function () {
      if (ft.size < 10) a5L("File Too Small");else {
        var a5Q = ft.bg(12),
          a0 = (a5Q !== c8.rVersion && (a0 = "Incompatible Version   Required: " + c8.rVersion, a5L(a0 = (a0 += "   Found: " + a5Q) + ("   Compatible at " + aF.b1.a5R() + "/" + a5Q), 1)), ft.bg(12)),
          a5S = ft.bg(31);
        if (a5S !== ft.size) a5L("Size Error: Stated Size " + a5S + " Actual Size " + ft.size);else if (function (dA, a5Q) {
          for (var d1 = ft.bk, aM = ft.size, c6 = a5Q, aN = 3; aN < aM; aN++) c6 = c6 + d1[aN] & 4095;
          return c6 === dA || (a5L("Hash Error: " + c6 + " " + dA + " " + aM), !1);
        }(a0, a5Q)) return 1;
      }
      return;
    }() && (hy = ft, (c3 = ct.data = new nt()).mapType = hy.bg(2), c3.mapProceduralIndex = hy.bg(8), c3.mapRealisticIndex = hy.bg(8), c3.mapSeed = hy.bg(14), c3.mapName = hy.a5U(5), 2 === c3.mapType && hy.a5V(), c3.passableWater = hy.bg(1), c3.passableMountains = hy.bg(1), c3.playerCount = hy.bg(10), c3.humanCount = hy.bg(10), c3.selectedPlayer = hy.bg(9), c3.gameMode = hy.bg(1), c3.playerMode = hy.bg(2), c3.battleRoyaleMode = hy.bg(2), c3.numberTeams = hy.bg(4), c3.isZombieMode = hy.bg(1), c3.isContest = hy.bg(1), c3.isReplay = hy.bg(1), c3.elo = hy.a5W(2, 14, 2), c3.colorsType = hy.bg(1), c3.colorsPersonalized = hy.bg(1), c3.colorsData = hy.a5W(10, 18, 512), c3.selectableColor = hy.bg(1), c3.teamPlayerCount = hy.a5W(4, 10, 9), c3.neutralBots = hy.bg(1), c3.botDifficultyType = hy.bg(2), c3.botDifficultyValue = hy.bg(4), c3.botDifficultyTeam = hy.a5W(4, 4, 9), c3.botDifficultyData = hy.a5W(10, 4, 512), c3.spawningType = hy.bg(2), c3.spawningSeed = hy.bg(14), c3.spawningData = hy.a5W(11, 12, 1024), c3.selectableSpawn = hy.bg(1), c3.playerNamesType = hy.bg(2), c3.playerNamesData = hy.a5X(10, 5, 512), c3.selectableName = hy.bg(1), c3.aIncomeType = hy.bg(2), c3.aIncomeValue = hy.bg(8), c3.aIncomeData = hy.a5W(10, 8, 512), c3.tIncomeType = hy.bg(2), c3.tIncomeValue = hy.bg(8), c3.tIncomeData = hy.a5W(10, 8, 512), c3.iIncomeType = hy.bg(2), c3.iIncomeValue = hy.bg(8), c3.iIncomeData = hy.a5W(10, 8, 512), c3.sResourcesType = hy.bg(2), c3.sResourcesValue = hy.bg(11), c3.sResourcesData = hy.a5W(10, 11, 512), c3.nu = hy.a5W(10, 30, 0), !!function () {
      var hy = ft,
        dK = hy.bg(5),
        a5Y = hy.bg(30),
        a5Z = hy.bg(30);
      if (a5Y + a5Z > 8 * hy.size) return void a5L("Corrupted File");
      return function (aM) {
        var a5c = new Uint8Array(aM),
          a5d = new Uint16Array(aM),
          a5e = new Uint32Array(aM),
          a5f = new Uint32Array(aM);
        gF.oK.oJ = a5c, gF.oK.oM = a5d, gF.oK.oO = a5e, gF.oK.oQ = a5f;
        for (var aN = 0; aN < aM; aN++) {
          var id = ft.bg(4);
          a5c[aN] = id, a5d[aN] = ft.bg(9), 0 === id ? a5e[aN] = ft.bg(22) : 1 === id ? (a5e[aN] = ft.bg(10), a5f[aN] = ft.bg(10)) : 2 === id ? (a5e[aN] = ft.bg(10), a5f[aN] = ft.bg(9)) : 3 === id ? (a5e[aN] = ft.bg(10), a5f[aN] = ft.bg(27)) : 4 === id ? (a5e[aN] = ft.bg(10), a5f[aN] = ft.bg(16)) : 5 === id || 6 === id ? a5e[aN] = ft.bg(10) : 7 === id ? a5e[aN] = ft.bg(1) : 10 === id && (a5e[aN] = ft.bg(20), a5f[aN] = ft.bg(22));
        }
      }(a5Y), function (aM, dK) {
        var oS = new Uint8Array(aM),
          oR = new Array(aM);
        oR.fill(0), gF.oK.oS = oS, gF.oK.oR = oR;
        for (var aN = 0; aN < aM; aN++) oS[aN] = ft.bg(1), oR[aN] = ft.bg(dK);
      }(a5Z, dK), 1;
    }()) && (ft.af < 8 * ft.size - 13 || ft.af > 8 * ft.size ? (a5L("Out Of Bounds Error: " + ft.af + " " + 8 * ft.size), !1) : (gF.oK.vR = bS, 2 !== ct.data.mapType || (a5L("Load base64 image...", 2), a5H)));
  }, this.a5M = function (a5N, a5O) {
    var es = document.createElement("canvas"),
      e2 = es.getContext("2d");
    if (es.width = a5N.width, es.height = a5N.height, e2.drawImage(a5N, 0, 0), ct.data.canvas = es, a5G || a5O) return ct.dX ? void 0 : (ct.data.mapType = 2, aq.mU(), void aq.fu(19));
    gF.a5P();
  };
}
function a5g() {
  this.a5h = function () {
    for (var d1, aM = eI.eJ, ix = eI.eK, a5i = d3.a5i, nD = this.a5j(), aN = 0; aN < aM; aN++) d1 = ix[aN], aR.f.eH(d1) || (a5i[d1] = nD);
    var oe = d3.oe,
      a5k = d3.a5k,
      a5l = d3.a5l,
      a5m = d3.a5m,
      aM = ct.dP;
    for (aN = 0; aN < aM; aN++) (0 === a5m[aN] || a5l[aN] < 1 || 2 * oe[aN] > 3 * (a5k[aN] + a5l[aN])) && (a5i[aN] = 0);
    var a5n = 0;
    for (aN = 0; aN < aM; aN++) a5n += 0 < a5i[aN];
    return a5n;
  }, this.a5j = function () {
    return Math.min(65535, dy.f2());
  };
}
function a5o() {
  var a5p = -1,
    a5q = null,
    a5r = -1,
    a5s = 4;
  function a5y() {
    my.zm() ? gJ.render() : gJ.zq();
  }
  function a68(bW, fS) {
    var uW = bW >> 16,
      kA = bW >> 8 & 255,
      bW = 255 & bW,
      a69 = 255 - fS,
      a69 = (a69 < uW && a69 < kA && a69 < bW && (fS = -fS), a5p >> 7),
      a6B = a5p >> 5 & 3,
      a6C = a5p >> 3 & 3;
    return (Math.max(Math.min(uW + fS, 252 + a69), a69) << 16) + (Math.max(Math.min(kA + fS, 252 + a6B), a6B) << 8) + Math.max(Math.min(bW + fS, 252 + a6C), a6C);
  }
  function a5x() {
    return -1 !== a5p && (d5.a64(a5p, a5q[0], a5q[1], a5q[2]), a65(a5p), a5p = -1);
  }
  function a65(player) {
    dy.gK = !0;
    for (var dM = d3.dM[player], dN = d3.dN[player], dS = d3.dS[player], dT = d3.dT[player], eU = dN; eU <= dT; eU++) for (var eT = dM; eT <= dS; eT++) {
      var fK = d5.a6D(eT, eU);
      d5.fT(player, fK) && (d5.a6E(fK) ? d5.a6F(fK, player) : d5.a6G(fK) ? d5.a6H(fK, player) : d5.a6I(fK, player));
    }
  }
  this.r = function () {
    a5q = null, a5r = a5p = -1, a5s = he.hf(Math.floor(b6.buffer.data[16].value), 0, 16);
  }, this.f1 = function (dx) {
    if (b6.buffer.data[15].value && 0 !== a5s && (dx || !a5t.a5u())) {
      var dx = dr.ds(a5t.a5v),
        hs = dr.du(a5t.a5w);
      if (dr.iC(dx, hs)) {
        dx = dr.iE(dx, hs), hs = dr.iI(dx);
        if (a5r === hs) if (d5.l3(hs)) {
          if (a5p === d5.hp(hs)) return;
        } else if (-1 === a5p) return;
        !function (fK) {
          d5.l3(fK) ? (fK = d5.hp(fK)) !== a5p && (a5x(), function (player) {
            a5p = player, a5q = d5.a61(player);
            var a62 = function () {
              var c3 = a5q,
                a66 = a5s << 2,
                a67 = a66 << 1;
              return [a68(c3[0], a66), a68(c3[1], a67), a68(c3[2], a67)];
            }();
            d5.a64(player, a62[0], a62[1], a62[2]), a65(player);
          }(fK), a5y()) : a5x() && a5y();
        }(a5r = hs);
      } else a5x() && a5y();
    }
  };
}
function a6J() {
  this.L84 = ["🧈 Gold Transfer", "Back", "Source Account", "Target Account", "Amount", "Confirm", "Cancel", "Send", "Send gold only to trusted accounts!", "{0} still needs to be conquered!", "A neutral pixel at position ({10}, {11}) still needs to be conquered!", "Incoming Boat!", "Incoming Ship!", "Error", "Error {10}", "Not Enough Gold!", "You need more gold to perform this action.", "{0} called the peace vote.", "{0} voted for peace.", "{0} rejected peace.", "Ship launched!", "Ship intercepted!", "Humans", "Players", "Bots", "Spectators", "Threshold", "Percentage", "Growth", "Income", "Time", "Neutral", "Red", "Green", "Blue", "Yellow", "Magenta", "Cyan", "White", "Black", "Clan Chart", "🛠️ Options", "Top Clan", "Best Clan Member", "Top Admin", "Best 1v1 Player", "Best Battle Royale Player", "Richest Player", "Top Patreon", "Best Zombie Player", "Bot Difficulty", "Options", "Uniform", "Mixed", "Team dependent", "Customized", "Team", "Player Count", "YOU CONQUERED", "YOU WERE CONQUERED BY", "THE GAME WAS WON BY", "MAP:", "Admin Election", "Blockchain", "Clan Leader Election", "📜 Logs", "🔑 My Account", "🏆 Leaderboards", "📈 Clan Charts", "▶️ Replay", "📰 Propaganda", "⚔️ Join Lobby 2", "⚙️ Settings", "Account Recovery", "🔗 Links", "ℹ️ Game Version", "🗑️ Delete Data", "Privacy Settings", "Force Restart Game", "☰ Game Menu", "📜 Game Log", "📊 Game Statistics", "🏳️ Surrender", "🕊️ Call Peace Vote", "Do you want to delete all locally stored data, like usernames, setting data and account data like passwords and account names?", "Please make sure to safely store passwords before performing this action.", "🗑️ Delete", "User Privacy", "Check out our Privacy Policy at:", "Quit Game", "More", "Previous 10", "Next 10", "1v1 Player Ranking", "Clan Ranking", "Clan Member Ranking", "Admin Ranking", "1v1 Reports", "Bio Reports", "Battle Royale Players", "Richest Players", "Patreon Members", "Zombie Players", "Index", "Username", "Account", "Ranking", "Player", "Elo", "Clan", "Rating", "Leader", "Time Ago", "Accuser", "Accused", "Voter", "Votes", "Sender", "Receiver", "Number", "Gold", "Type", "Elo Deducted", "Bio Removed", "Custom Scenario", "⚔️ Play", "Map", "Settings", "Game Mode", "Colors", "Random", "Clustered", "Player Names", "Kingdom Names", "Simple Names", "Additional Income", "Default", "Territorial Income", "Interest Income", "Starting Resources", "More Settings", "Reset Scenario", "Open File...", "Save As File...", "White Arena", "Black Arena", "Island", "Mountains 1", "Desert", "Swamp", "White Plains", "Cliffs", "Pond", "Halo", "Europe", "World 1", "Caucasia", "Africa", "Middle East", "Scandinavia", "North America", "South America", "Asia", "Australia", "Island Kingdom", "Mountains 2", "World 2", "British Isles", "Source Account: {0}", "Target Account: {0}", "Gold to be Sent: {10}", "Gold to be Received: {10}", "Replay Error", "Warning", "Loading...", "Account Name", "Email", "Request Email", "LEADERBOARD", "Contest", "Lobby", "Propaganda", "Close {button}", "Report Abuse", "🛠️ List Options", "Start Index", "End Index", "Load Data", "Clan Name Search", "Username Search", "Quantity", "Account Name Search", "Initiate Land Attack At Mouse Pointer", "Launch Ship Towards Mouse Pointer", "Increase Percentage Bar", "Decrease Percentage Bar", "Slightly Increase Percentage Bar", "Slightly Decrease Percentage Bar", "Switch UI Visibility", "Zoom In", "Zoom Out", "Camera Left", "Camera Right", "Camera Up", "Camera Down", "Add To Weakest Attack", "Call Peace Vote", "Intercept Ship At Mouse Pointer", "You earned a participation reward of {10} gold.", "The prize money was distributed as follows:", "and {10} more", "You earned {10} gold.", "You earned {10} points!", "Clan {0} gained {11} points. ✨", "You earned {10} clan points!", "You earned an additional {10} gold because you played for {1}.", "Choose Your Nation's Color!", "National Color", "Red: ", "Green: ", "Blue: ", "Spawning", "Manual Spawn", "Activated", "Very Easy", "Easy", "Normal", "Hard", "Very Hard", "Impossible", "🔄 Reset", "Information", "Increasing resolution, shrinking minimum font size, and speeding up text rendering can strain your system and hinder gameplay responsiveness.", "Resolution", "Low", "Medium", "High", "Very High", "Minimum Font Size", "Small", "Very Small", "Text Rendering Speed", "Slow", "Fast", "Large UI", "Place Balance Above", "Hide Zoom Buttons", "Font", "Message Box", "Keep Closed", "Is Muted", "Multiplayer Connection", "Automatic (recommended)", "Direct", "Via Proxy", "Highlighting", "Intensity", "Shortcut Keys", "Reset", "Language", "🛠️ Chart Options", "Search Terms", "Separate search terms with a comma.", "Timeframe", "More Options", "Y-Axis Compression", "Multiplayer", "My Account", "Game Menu", "Your Kingdom's Name", "Procedural Map", "Realistic Map", "Custom Map", "Passable Water", "Passable Mountains", "Maximum Dimension", "Map File", "Select File", "Map Name", "Preview", "🔲 Select All", "📋 Copy", "🗑️ Clear", "▶️ Launch", "Insert the replay data here!", "Adjust", "My Color", "You are leaving Territorial.io!", "Hint: The top 9 emojis are ordered by usage.", "Hint: Call the peace vote by pressing {0}.", "Hint: Add troops to your weakest ongoing attack with {0}.", "Hint: Hover with the mouse over a player and press {0} to attack them.", "Type your message here...", "Login", "➡️ Login", "Password", "Show", "Hide", "Security Tip", "The only official domain is territorial.io", "If you log in on a different website, your account may be stolen!", "If you play with the official Android or iOS App, you are fine.", "Selectable Name", "Links", "Propaganda Text", "Launch Campaign", "Gold Investment", "Launch", "Avg. Attack Strength", "Land Attacks", "Ships launched", "Bots conquered", "Humans conquered", "Attacked by Bots", "Attacked by Humans", "Territorial Loss", "Received Support", "Overall Income", "Additional Costs", "Land War Losses", "Naval Losses", "Transmitted Support", "Overall Expenses", "Mountain Attacks", "Ships landed", "You earned {10} gold!", "{0} earned {11} gold!", "Team {0}", "Team {0} won the game!", "Clans", "Clan Members", "Admins", "1v1 Players", "Battle Royale", "second played", "seconds played", "You are leaving Territorial.io.", "Refresh", "Public Profile", "🧈 Gold", "Large Bank", "Medium Bank", "Small Bank", "Capitalist", "Rich Person", "Landowner", "Merchant", "Taxpayer", "Worker", "Peasant", "Serf", "Daylaborer", "Nomad", "Beggar", "Account Balance: ", "Rank: ", "Status: ", "Gold Transfer", "Sell Account", "Asking Price:", "Account to receive the gold:", "Publish Offer", "Buy This Account", "Buy", "Copy", "Search", "Request New Password", "To safeguard your account, never disclose your password to anyone. We will never ask for your password, as we do not require it for any service.", "If you have accessed your account through unofficial webpages or apps, your security may be compromised. We recommend changing your password.", "If you lose your password or account name, you may lose access to your account. In such a case, we are unable to recover it. Please ensure that you store your account name and password in a safe place.", "Account Options", "Log in to a Different Account", "Create New Account", "Delete Account: ", "🗑️ Account Deletion", "Accounts without gold will be deleted automatically after 8 days. To initiate this process, deplete all your gold.", "Followed Accounts", "➡️ Show", "🗑️ Remove", "Saved Accounts", "Listed accounts may have been removed in the meantime due to insufficient funds.", "1v1 Rating", "Elo: ", "Played Games: ", "Battle Royale Rating", "Commander", "Strategist", "Soldier", "Recruit", "Rating: ", "Zombie Rating", "Savior", "Veteran", "Hunter", "Defender", "Refugee", "Admin Statistics", "Votes: ", "Elect", "You are about to purchase {10} votes for {11} Gold with your Account {2}.", "User", "Email Verified", "🟢 Online", "Browsing the menus.", "Watching a replay.", "Playing a team game.", "Playing a battle royale game.", "Playing a 1v1 match.", "Fighting zombies.", "In the lobby.", "Playing in single player.", "🔴 Offline", "Last active some seconds ago.", "Last active 1 minute ago.", "Last active {10} minutes ago.", "Last active 1 hour ago.", "Last active {10} hours ago.", "Last active 1 day ago.", "Last active {10} days ago.", "Last active a long time ago.", "🚫 Unfollow", "📥 Follow", "You are following this user. ✅", "Please choose a respectful username.", "Active punishments:", "Offensive Name", "Hate Speech", "Email Verification", "You already have {10} gold. Secure your account to prevent account loss.", "New Email", "Request Code", "Make sure to also check your spam folder.", "Code", "Submit Code", "Bio", "Upload Bio", "Enable Auto Renew", "Disable Auto Renew", "Auto Renew is off. The subscription will end in {10} day(s).", "Auto Renew is on. The subscription will renew in {10} day(s).", "The monthly fee is currently {10} gold.", "Description", "Report Player", "Primary Clan Stats", "Clan: {0}", "Monthly Points: {0}", "Rank: {0}", "Total Points: {0}", "Won Games: {0}", "Avg. Points per Game: {0}", "Secondary Clan Stats", "Clan Leader Statistics", "Clan Leader of {0}", "No Clan Leader", "Rating: {10}", "Rank: {10}", "Status: {10}", "Active", "Inactive", "Unlink Account", "Benefits:", "No Ads", "Separate Leaderboard", "Exclusive Username Color", "Status: Not Linked", "Join Territorial.io on Patreon:", "Once you have joined, connect your account:", "If you hide Patreon, no one can transfer a membership to your account.", "1v1", "Zombie", "Chat", "Ready", "Next Game", "Territory", "Numbers", "Statistics", "🔑 Show Account", "🚩 Report Abuse", "💬 Mention", "This is a contest!", "Accept", "You conquered {0}. 🔥", "You were conquered by {0}.", "Congratulations! You won the game.", "{0} won the game.", "{0} broke the non-aggression pact.", "{0} attacks you! ⚔️", "Choose your start position!", "You surrendered! 🏳️", "The game ended in a stalemate!", "Error: {10}", "{0} was immortalized!", "Neutral Land: {0}", "Player: {0}", "Strength: {10}", "Territory: {10}", "Index: {10}", "Coordinates: {10}", "Mountain: {10}", "Water: {10}", "Ship Owner: {0}", "Message to {0}", "Humanity triumphs! The undead were defeated.", "The Resistance", "Mankind's era ends, overrun by the relentless tide of the undead.", "The Virus", "If peace is agreed upon, the game ends in a stalemate.", "If peace is agreed upon, the largest territory holder wins the game.", "You signed a non-aggression pact with {0}.", "You asked {0} to sign a non-aggression pact.", "{0} accepted the non-aggression pact.", "{0} requests a non-aggression pact.", "You asked {10} players to attack {1}.", "You asked {0} to attack {1}.", "{0} suggests you attack {1}. 🎯", "You exported 1 resource to {0}.", "You exported {10} resources to {1}.", "Incoming Bot Support!", "{0} supported you!", "Map: {0}", "Creator: {0}", "Dimension: {10}", "Overall Pixels: {10}", "Land: {10}", "Mountains: {10}", "Full sending is disabled.", "{0} was conquered by {1}.", "{0} left the game.", "{0} surrendered.", "{0} joined the game.", "{10} players were conquered.", "{10} players left the game.", "{10} players surrendered.", "Outside", "Water", "Mountains", "Neutral Land", "No Admin", "Helper", "Junior Moderator", "Moderator", "Senior Moderator", "Lead Moderator", "Head Admin", "Loading", "⏳ Connecting...", "Find Server...", "New Connection...", "Reload Required", "A game reload is required to apply the new configuration.", "{0} defeated {1}!", "Upcoming Team Contest!", "Upcoming Battle Royale Contest!", "Upcoming 1v1 Contest!", "Upcoming Zombie Contest!"];
}
function wL() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 !== ct.data.tIncomeType && (ct.data.tIncomeData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.tIncomeType && aR.d.tT(tN.tU(), ct.data.tIncomeData, 255);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(137), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(136), L(52), L(55)],
      value: ct.data.tIncomeType
    }, function (af) {
      tQ(), 2 !== af || ct.data.tIncomeData || (ct.data.tIncomeData = new Uint8Array(ct.cv), ct.data.tIncomeData.fill(32)), ct.data.tIncomeType = af, aq.fu(26);
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay;
    1 === ct.data.tIncomeType && ((ay = new az()).b3("Value"), ay.b8(new b5({
      af: -1,
      value: ct.data.tIncomeValue
    }, 1, 0, function (b7) {
      var value = he.hf(Math.floor(b7.target.value), 0, 255);
      b7.target.value = ct.data.tIncomeValue = value;
    })), aw.push(ay));
  }(aw), function (aw) {
    var ay;
    2 === ct.data.tIncomeType && ((ay = new az()).b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.tIncomeData, 4)), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function a6L(a6M) {
  var a6N = document.createElement("div"),
    a6O = document.createElement("div"),
    a6P = (this.eT = 0, this.eU = 0);
  function a6S() {
    aI.ne.bU();
  }
  this.nw = a6M, this.show = function (eT, eU, a6U) {
    if (a6P) return [0, 0];
    a6P = 1, this.eT = eT, this.eU = eU, function (self, a6U) {
      var aO = aR.b.tJ(.16, .7),
        dA = a6M.length * aO / 3,
        a6W = d9.aO / d9.o5,
        a6X = d9.dA / d9.o5,
        fM = Math.min(1, Math.min(a6W / aO, a6X / dA));
      aO *= fM, dA *= fM, a6U && (self.eT += aR.b.tJ(.03, .5)), self.eT = he.hf(self.eT, 0, a6W - aO), self.eU = he.hf(self.eU, 0, a6X - dA), a6O.style.left = self.eT + "px", a6O.style.top = self.eU + "px", a6O.style.width = aO + "px", a6O.style.height = dA + "px", a6O.style.font = aR.b.dF(0, .3 * dA / a6M.length), aR.b.g1(a6O, 5);
      for (var aN = 1; aN < a6M.length; aN++) aR.b.g1(a6M[aN].button, 8);
    }(this, a6U), document.body.appendChild(a6N);
  }, this.bU = function () {
    a6P && (a6P = 0, a6N.removeEventListener("click", a6S), aq.removeChild(document.body, a6N));
  };
  for (var aN = 0; aN < a6M.length; aN++) new a6Q("" + (1 + aN), a6M[aN].button, 0, 1);
  a6N.style.position = "fixed", a6N.style.top = "0", a6N.style.left = "0", a6N.style.width = "100%", a6N.style.height = "100%", a6N.style.zIndex = "5", a6O.style.position = "absolute", function () {
    for (var a6T = (100 / a6M.length).toFixed(2) + "%", aN = 0; aN < a6M.length; aN++) a6M[aN].button.style.width = "100%", a6M[aN].button.style.height = a6M[aN].button.style.maxHeight = a6T, a6M[aN].button.style.padding = "0.0em 0.9em", a6O.appendChild(a6M[aN].button);
  }(), a6N.appendChild(a6O), a6N.addEventListener("click", a6S);
}
function a6Y() {
  var a6Z, a6;
  this.r = function () {
    for (var aN = (a6 = new Uint16Array(101)).length - 1; 0 <= aN; aN--) a6[aN] = he.iA(32768 * aN, 100);
    this.v7(0);
  }, this.value = function (d1) {
    return a6[d1];
  }, this.a6a = function () {
    return he.iA(a6Z - 1, 2);
  }, this.v7 = function (a1K) {
    a6Z = 2 * a1K % 32768 + 1;
  }, this.random = function () {
    return a6Z = 167 * a6Z % 32768;
  }, this.rU = function (a6b) {
    return he.iA(a6b * this.random(), 32768);
  }, this.a6c = function (d1) {
    return 0 !== d1 && this.random() < this.value(d1);
  }, this.iX = function (aQ, ex) {
    return aQ + this.rU(ex - aQ);
  };
}
function a6d() {
  this.a6e = function (player, jy, ki) {
    aR.f.k0(player, ki, jy) && (gw.ol(player, jy), !aR.f.eH(jy)) && gz.kN.a6f[jy] && gz.kN.a6f[jy]--;
  }, this.l9 = function (player, jy, ki) {
    aR.f.a6g(ki, jy) ? gv.kC(jy, k3.k4[0]) && (v4.a3s(player, jy, k3.k4[0], 1), aR.f.l7(jy, k3.k4[0]), hD.a3t(player, jy), di.d7(jy, k3.k4[0])) : hD.l6(player, ki, 12);
  };
}
function a6h() {
  this.iA = function (aQ, ex) {
    return Math.floor((aQ + .5) / ex);
  }, this.a6i = function (aQ, ex) {
    return Math.floor(aQ * (ex + .5));
  }, this.sqrt = function (aY) {
    return ~~Math.sqrt(aY + .5);
  }, this.pow = function (b7) {
    return Math.floor(Math.pow(2, b7) + .5);
  }, this.hf = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  }, this.a6j = function (oL, oN, oP) {
    return Math.max(Math.min(oL, oN), oP);
  }, this.a6k = function (a6l, a6m, eT, eU) {
    eT -= a6l, a6l = eU - a6m, eU = 0;
    return 0 == eT ? eU = 0 <= a6l ? Math.PI : 0 : (eU = Math.atan(a6l / eT), eU += 0 < eT ? .5 * Math.PI : 1.5 * Math.PI), eU;
  }, this.log2 = function (aY) {
    return Math.floor(!!aY * (1 + Math.log2(aY + .5)));
  }, this.log10 = function (aY) {
    return Math.floor(Math.log10(aY + .5));
  }, this.a4g = function (y0, y1, a6o, a6p, a6q) {
    return a6o - a6q < y0 && y0 < a6o + a6q && a6p - a6q < y1 && y1 < a6p + a6q;
  }, this.q3 = function (a6r, a6s) {
    return a6r * a6r + a6s * a6s;
  };
}
function a6t() {
  var a6u, a6v;
  function a72() {
    (a6u = new WebSocket("wss://territorial.io/s52/")).onopen = a73, a6u.onclose = function () {
      a74();
    };
  }
  function a73() {
    if (a6u && a6u.readyState === a6u.OPEN) {
      var aO = new a75();
      aO.bd(1608), aO.bh(1, 0), aO.bh(6, 7), aO.bh(2, cA ? cA.id : 3), aO.bh(1, c8.cC ? 1 : 0), aO.bh(1, c8.cD ? 1 : 0), aO.bh(1, c8 ? c8.a6z : 0);
      for (var aN = 0; aN < a6v.length && aN < 228; aN++) aO.bh(7, a6v.charCodeAt(aN) % 128);
      a6u.send(aO.bk), a74();
    }
  }
  function a74() {
    a6u && (a6u.onclose = null, a6u.onopen = null, a6u = null);
  }
  window.addEventListener("error", function a6w(b7) {
    a6v = "";
    try {
      var a6x = function (b7) {
        if (!b7.error) return 0;
        var stack = b7.error.stack;
        if (!stack || !stack.length) return 0;
        for (var match, ak = new RegExp(":([0-9]+):([0-9]+)", "g"), result = []; null !== (match = ak.exec(stack));) result.push(parseInt(match[1], 10)), result.push(parseInt(match[2], 10));
        return result.length ? result.join(" ") : 0;
      }(b7);
      return 0 === a6x || b7.lineno <= 3 ? void console.log("Error: External Code | " + a6x) : (window.removeEventListener("error", a6w), a6v = b7.lineno + " " + b7.colno + "|" + a6x, __fx.reportError(b7, a6v), alert("Error:\n" + b7.filename + " " + b7.lineno + " " + b7.colno + " " + b7.message));
    } catch (b7) {
      a6v = "SE|" + a6v + "|" + b7, console.log(a6v), alert(a6v);
    }
    a72();
  });
}
function wR() {
  var am, an, aw;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao("🔒 " + L(73), [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })]), an = new at(am.au, ((aw = []).push(function () {
    var ay = new az(),
      a77 = (ay.b0(aF.b1.b2("/wiki/faq"), "0.75em").style.marginBottom = "0.8em", ay.b3(L(175)), new b5({
        value: "",
        af: -1
      })),
      a78 = (ay.b8(a77), ay.b3(L(176), "0.8em"), new b5({
        value: "",
        af: -1
      }, 0, 0)),
      bE = (a78.b7.type = "email", a78.b7.autocomplete = "email", a78.b7.name = "email", a78.b7.inputMode = "email", a78.b7.spellcheck = !1, ay.b8(a78), new ap(L(177), function (b7) {
        return aR.b.bN(b7), aF.bO.a79({
          action: 4,
          bS: a77.b7.value.trim() + a78.b7.value.trim().substring(0, 63)
        }), !0;
      }));
    return ay.b8(new bL([bE.button])), ay;
  }()), aw));
}
function a7A() {
  var gap,
    a7B = !1,
    m2 = 0,
    aO = 0,
    g2 = 0,
    canvas = null,
    j = null,
    xP = null;
  function a7F() {
    for (var aN = ct.rk; 0 <= aN; aN--) xP[aN] = 0;
    for (aN = eI.eJ - 1; 0 <= aN; aN--) xP[ey.iy[eI.eK[aN]]] += d3.d4[eI.eK[aN]];
    a7B = !0;
  }
  function a7D() {
    for (var a7N, a7L = 0, aM = 0, bW = Math.floor(aO / 2), uW = Math.floor(g2 / 2), a7M = 1.5 * Math.PI, aN = ct.rk; 0 <= aN; aN--) aM += xP[aN], 0 === xP[aN] && a7L++;
    if (a7B = !1, j.clearRect(0, 0, aO, aO), 0 < aM) if (a7L === ct.rk) {
      for (aN = ct.rk; 0 <= aN; aN--) if (0 < xP[aN]) {
        !function (aN, bW, uW) {
          j.fillStyle = ey.r5[ey.iv[aN]], j.beginPath(), j.arc(bW, bW, uW, 0, 2 * Math.PI), j.fill();
        }(aN, bW, uW);
        break;
      }
      !function (bW) {
        var fontSize = bW / 3;
        j.font = aR.b.dF(1, fontSize), j.fillStyle = bG.bH, j.fillText("100%", bW, bW + .1 * fontSize);
      }(bW);
    } else {
      for (aN = 0; aN <= ct.rk; aN++) 0 < xP[aN] && (!function (aN, bW, uW, a7M, a7N) {
        j.fillStyle = ey.r5[ey.iv[aN]], j.beginPath(), j.arc(bW, bW, uW, a7M, a7N), j.lineTo(bW, bW), j.fill();
      }(aN, bW, uW, a7M, a7N = a7M + 2 * Math.PI * xP[aN] / aM), function (bW, uW, a7M, a7N) {
        var aY = (a7N - a7M) / (2 * Math.PI),
          fontSize = (__fx.settings.detailedTeamPercentage ? 0.75 : 1) * uW * Math.min(aY, .37);
        fontSize < 8 || (a7M = (a7M + a7N) / 2, a7N = (__fx.settings.detailedTeamPercentage ? (100 * aY).toFixed(2) : Math.floor(100 * aY + .5)) + "%", uW *= .525 - Math.max(.6 * (aY - .7), 0), j.font = aR.b.dF(1, fontSize), j.fillStyle = bG.bH, j.fillText(a7N, bW + Math.cos(a7M) * uW, bW + Math.cos(a7M + 1.5 * Math.PI) * uW));
      }(bW, uW, a7M, a7N), 0 !== aN && a7S(bW, uW, a7M), a7M = a7N);
      a7S(bW, uW, 1.5 * Math.PI);
    }
    !function (bW, uW) {
      j.beginPath(), j.arc(bW, bW, uW, 0, 2 * Math.PI), j.stroke();
    }(bW, uW);
  }
  function a7S(bW, uW, a7U) {
    j.beginPath(), j.moveTo(bW, bW), j.lineTo(bW + Math.cos(a7U) * uW, bW + Math.cos(a7U + 1.5 * Math.PI) * uW), j.stroke();
  }
  this.r = function () {
    if (ct.il) {
      m2 = 0, xP = new Uint32Array(ct.rk + 1);
      for (var aN = ct.rk; 0 <= aN; aN--) xP[aN] = 0;
      for (aN = eI.eJ - 1; 0 <= aN; aN--) xP[ey.iy[eI.eK[aN]]] += 1;
      this.resize();
    } else xP = j = canvas = null;
  }, this.u3 = function () {
    return aO;
  }, this.resize = function () {
    ct.il && (aO = Math.floor(.95 * (cA.hg.hh() && !ct.ur ? .18 * d9.min : .13 * d9.dC)), aO = (aO *= 1 + (.5 + .2 * cA.hg.hh()) * ct.ur) + aO % 2, gap = Math.max(1, .015 * aO), g2 = Math.floor(aO - .5 * gap), (canvas = canvas || document.createElement("canvas")).width = aO, canvas.height = aO, (j = canvas.getContext("2d", {
      alpha: !0
    })).lineWidth = gap, j.strokeStyle = bG.bH, aR.b.textAlign(j, 1), aR.b.textBaseline(j, 1), a7D());
  }, this.nG = function (a7E) {
    a7E && a7F();
    var eZ,
      a7E = this.iu();
    return ey.iv[a7E] || (a7E = function () {
      for (var a57 = -1, aN = ct.rk; 1 <= aN; aN--) (-1 === a57 || xP[aN] > xP[a57]) && (a57 = aN);
      return a57;
    }(), eZ = d3.d4[iw[0]], -1 !== a7E && xP[a7E] > eZ) ? xP[a7E] : eZ;
  }, this.a7H = function () {
    return m2 = 31, this.f1(), this.iu();
  }, this.iu = function () {
    for (var a57 = 0, aN = ct.rk; 0 < aN; aN--) xP[aN] > xP[a57] && (a57 = aN);
    return a57;
  }, this.a58 = function (a7I) {
    for (var aL = 0, eK = eI.eK, iy = ey.iy, aM = eI.eJ, a59 = k3.a59, aN = 0; aN < aM; aN++) {
      var d1 = eK[aN];
      iy[d1] === a7I && (a59[aL++] = d1);
    }
    k3.a5A[0] = aL;
  }, this.a7J = function (a7I) {
    for (var aL = 0, eK = eI.eK, iy = ey.iy, aM = eI.eJ, a59 = k3.a59, aN = 0; aN < aM; aN++) {
      var d1 = eK[aN];
      iy[d1] !== a7I && (a59[aL++] = d1);
    }
    k3.a5A[0] = aL;
  }, this.a7K = function () {
    for (var aL = 0, aN = ct.rk; 0 <= aN; aN--) aL += 0 < xP[aN];
    return aL;
  }, this.f1 = function () {
    ct.il && 32 <= ++m2 && (m2 = 0, a7F());
  }, this.hQ = function () {
    ct.il && a7B && a7D();
  }, this.dd = function () {
    ct.il && (ct.ur ? dE.drawImage(canvas, lS.gap, lS.gap) : dE.drawImage(canvas, lS.gap, u2 + 2 * lS.gap));
  };
}
function a7V() {
  var input;
  function a7W(b7) {
    (b7 = b7.target.files) && 0 < b7.length && a7Z.a7a(b7[0]);
  }
  function a7e(b7) {
    var bW = new Image();
    bW.onload = a7f, bW.src = b7.target.result;
  }
  function a7f(b7) {
    var b7 = b7.target,
      aO = b7.width,
      dA = b7.height,
      a7g = b6.buffer.data[162].value,
      max = Math.min(fU.a7h, a7g),
      a7g = (max = cA.id || a5t.a5u() ? Math.min(1400, a7g) : max) / Math.max(aO, dA);
    if (a7g < 1 && (aO = Math.floor(a7g * aO + .125), dA = Math.floor(a7g * dA + .125)), max < aO || max < dA || aO < 10 || dA < 10) a7g = "Invalid Image Dimensions!", cA.a0n ? cA.a0n.showToast(a7g) : alert(a7g);else {
      for (var max = document.createElement("canvas"), a7g = (max.width = aO, max.height = dA, max.getContext("2d")), a7j = document.createElement("canvas"), a7k = (a7j.width = b7.width, a7j.height = b7.height, a7j.getContext("2d")), b7 = (a7k.drawImage(b7, 0, 0), a7k.getImageData(0, 0, a7j.width, a7j.height)), a7k = a7g.createImageData(aO, dA), src = b7.data, a7n = a7k.data, a7o = a7j.width / aO, a7p = a7j.height / dA, eU = 0; eU < dA; eU++) for (var eT = 0; eT < aO; eT++) {
        var a7q = Math.floor(eT * a7o),
          a7q = 4 * (Math.floor(eU * a7p) * a7j.width + a7q),
          a7t = 4 * (eU * aO + eT);
        a7n[a7t] = src[a7q], a7n[1 + a7t] = src[1 + a7q], a7n[2 + a7t] = src[2 + a7q], a7n[3 + a7t] = 255;
      }
      a7g.putImageData(a7k, 0, 0), 20 === aq.fv && aq.mA().a7f(max);
    }
  }
  this.r = function () {
    (input = document.createElement("input")).type = "file", input.setAttribute("accept", ".png, .jpg, .gif, .jpeg"), input.onchange = a7W;
  }, this.mV = function () {
    input && (input.onchange = null, input.value = "", input = null);
  }, this.a7X = function () {
    input.click();
  }, this.a7a = function (a7b) {
    var a6 = a7b.name.split("."),
      a6 = a6[a6.length - 1].toLowerCase();
    "gif" !== a6 && "jpg" !== a6 && "jpeg" !== a6 && "png" !== a6 || ((a6 = new FileReader()).onload = a7e, a6.readAsDataURL(a7b));
  };
}
function a7u() {
  this.eK = null, this.eJ = 0, this.vJ = function () {
    for (this.eJ = 0, aN = ct.cv - 1; 0 <= aN; aN--) 0 !== d3.eF[aN] && this.eJ++;
    this.eK = new Uint16Array(this.eJ);
    for (var aM = 0, aN = 0; aN < ct.cv; aN++) 0 !== d3.eF[aN] && (this.eK[aM++] = aN);
  }, this.h1 = function () {
    for (var d4 = d3.d4, a7x = d3.a7x, a5m = d3.a5m, eK = eI.eK, aN = eI.eJ - 1; 0 <= aN; aN--) {
      var d1 = eK[aN],
        eZ = d4[d1],
        aW = a7x[d1];
      eZ <= he.iA(aW, 4) ? a7y.jg(d1) : aW <= eZ ? 250 <= (a7x[d1] = eZ) && (a5m[d1] = 1) : a7x[d1] = aW - Math.max(1, he.iA(aW - eZ, 1e3));
    }
    this.a7w();
  }, this.a7w = function () {
    for (var eF = d3.eF, is = this.eK, ir = this.eJ, aN = ir - 1; 0 <= aN; aN--) 0 === eF[is[aN]] && (is[aN] = is[--ir]);
    this.eJ = ir;
  };
}
function nh() {
  this.jg = function (af) {
    if ((jQ = aI.aU.jQ[af]) < 2) return !1;
    var jG = aI.b1.jH[af],
      a7z = 9 === jG.jK ? 333 : 512,
      jQ = Math.min(jQ, a7z);
    8 === jG.jK && (jQ -= jQ % 2);
    a7z = aI.aU.aV[af].splice(0, jQ), aI.aU.jQ[af] -= jQ, jQ = function (a80) {
      if (aI.nc) for (var aM = a80.length, ah = aI.nc.ah, aN = 0; aN < aM; aN++) if (a80[aN].ah === ah) return aN;
      return -1;
    }(a7z);
    return -1 === jQ ? (aI.aU.a83 = aI.aU.a83.concat(a7z), 1e3 < aI.aU.a83.length && aI.aU.a83.splice(0, aI.aU.a83.length - 1e3), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === af && 1 === aI.b1.a30[2], !1) : (8 === jG.jK && (jG.je = (jG.je + (jQ >> 1)) % 1024, af = jQ - jQ % 2, jQ %= 2, a7z = a7z.slice(af, 2 + af)), hO.r(jG, a7z, jQ), !0);
  }, this.a84 = function (jG, a80, a81) {
    var fS = ct.data = new nt(),
      a87 = (fS.spawningSeed = jG.spawningSeed, jG.jK < 7 ? (fS.gameMode = 1, fS.numberTeams = jG.jK + 2) : 9 === jG.jK ? (fS.gameMode = fS.isZombieMode = 1, fS.numberTeams = 2) : (fS.gameMode = 0, fS.battleRoyaleMode = 7 === jG.jK ? 0 : 10 === jG.jK ? 1 : 2), fS.selectedPlayer = a81, fS.isContest = jG.jO, fS.mapType = fU.a85(jG.jJ) ? 0 : 1, fU.a86(fS, jG.jJ), fS.mapSeed = jG.mapSeed, fS.humanCount = a80.length);
    fS.selectableSpawn = 1 === fS.gameMode || a87 < 100, fS.colorsData = new Uint32Array(a87), fS.playerNamesData = new Array(a87), fS.nu = new Uint32Array(a87);
    for (var aN = 0; aN < a87; aN++) fS.colorsData[aN] = a80[aN].color, fS.playerNamesData[aN] = a80[aN].username, fS.nu[aN] = a80[aN].ah;
    if (2 === fS.battleRoyaleMode) for (fS.elo = new Uint16Array(a87), aN = 0; aN < a87; aN++) fS.elo[aN] = a80[aN].elo;
    mT.close(), jE.setState(8), fU.bd(jG.jJ, fS.mapSeed), ct.v3(), ct.v1 = 2;
  };
}
function no() {
  var a88,
    a89 = [],
    a8A = -1,
    a8B = 0,
    a8C = 0;
  function a8M() {
    a8B = dy.dz, (3 === this.a8N ? a8L : (a8A = (a89.length + a8A + 2 * this.a8N - 1) % a89.length, a8K))();
  }
  function a8K() {
    0 !== a89.length && (a8C = 0, a88 && a88.mV(), (a88 = new a8O(a8M)).bK(a8A, a89.length), a88.show(a89[a8A]), aI.message.resize());
  }
  function a8L() {
    a8C = 1, a88 && a88.mV(), (a88 = new a8P(a8K)).bK(a89.length), a88.show(), aI.message.resize();
  }
  this.aJ = function (a8D) {
    var c3;
    2 === a8D.id && 3 === a8D.aK ? aI.nd.a8E(a8D.ah) : (c3 = aI.nd.a8F(a8D, aI.nd.a8G(a8D)), (5 !== a8D.id && 6 !== a8D.id || (aq.wU(29).a8H().a8I(c3), 5 === a8D.id)) && (c3 = dy.dz < a8B + 2e4, a8A !== a89.length - 1 && c3 || (a8A = a89.length), __fx.pingFilter.isMuted(a8D, "a0") || (a89.push(a8D), b6.buffer.data[14].value || 7 === a8D.id || nr.play(), a88 && (a8C && (b6.buffer.data[13].value || c3) ? a88.bK(a89.length) : a8K()))));
  }, this.show = function () {
    a8L();
  }, this.bU = function () {
    a8A = a89.length - 1, a88 && a88.mV(), a88 = null;
  }, this.resize = function () {
    a88 && a88.resize();
  }, this.a8Q = function () {
    return a89;
  };
}
function a8R() {
  function a8U(player, pu) {
    pu = dr.iM(h0.b1.kY[pu]), pu = d5.hm(dr.iI(pu));
    return !!h0.nd.a4A(player, pu);
  }
  function a8S(player) {
    return h0.op.oq(player) && !h0.gd.gZ();
  }
  this.jx = function (player, gm) {
    return !!a8S(player) && -1 !== (gm = function (player, gm) {
      for (var aM = h0.b1.ka, kY = h0.b1.kY, kw = h0.b1.kw, a4U = dr.hd(), sa = -1, aN = 0; aN < aM; aN++) {
        var rW = dr.i3(gm, dr.iM(kY[aN]));
        rW < a4U && aR.f.a4i(player, kw[aN] >> 3) && (a4U = rW, sa = aN);
      }
      return sa;
    }(player, gm)) && !!a8U(player, gm) && (k3.oo[3] = h0.b1.pj[gm], !0);
  }, this.a8V = function (player, kh) {
    return !!a8S(player) && !!h0.nd.pf(kh) && !!a8U(player, k3.oo[2]);
  }, this.p1 = function (player, kh, a8W) {
    return !!function (player, kh, a8W) {
      if (a8S(player) && h0.nd.pf(kh)) {
        kh = k3.oo[2];
        if (aR.f.a4i(player, h0.b1.kw[kh] >> 3)) {
          if (function (player, pu) {
            return h0.nd.a4X(player, pu) && (k3.a6[0] = h0.gd.ge(h0.b1.pn[pu]), k3.oo[1] = 6, !0);
          }(player, kh)) return 1;
          var kt = dr.iM(h0.b1.kY[kh]),
            a8b = h0.nd.a4C(player, kt);
          if (-1 !== a8b) {
            a8b = dr.i3(a8b, kt);
            if (!(a8W && 120 < a8b)) {
              a8W = function (pu, a8c, kt) {
                var gf = h0.b1.pn[pu],
                  pu = h0.b1.kv[pu],
                  a8g = dr.i3(kt, gf[pu + 1]);
                if (a8c <= a8g) return h0.nd.a4Y(kt, gf[pu + 1], a8g, a8c);
                for (var rW = a8c - a8g, aM = gf.length - 1, aN = pu + 1; aN < aM; aN++) {
                  var a8h = dr.i3(gf[aN], gf[aN + 1]);
                  if (rW <= a8h) return h0.nd.a4Y(gf[aN], gf[aN + 1], a8h, rW);
                  rW -= a8h;
                }
                return gf[aM];
              }(kh, a8b, kt);
              if (h0.os.ot(player, a8W, 1)) return k3.oo[1] = 6, 1;
            }
          }
        }
      }
      return;
    }(player, kh, a8W) && (player = k3.oo[2], h0.b1.kX[player] = 64 + h0.b1.kX[player] % 64, h0.kc.kC(kh, h0.b1.a8Y), !0);
  };
}
function a8i() {
  var bS;
  10 === fU.jJ ? bS = "DYDz2ESNu-0UYCCrS9c3pBUrKHc94BhIBhIJpIIBnMIAAIrKSSpKABmgf9e7X7ecX-5P0baOy191XXX7eegf9mcfUrrxrKppppKpKSrzUMMMSKKKrJcXcXcmgcXnKIKBmnCIJonCKrrSrrSSxSS9XcJnBe9XemmWXeX99chMIAEprrSrrtbrxIrMKBn9eBcecX9X7f99X90e577VX1VcOWX16XX7X999cX7eWyXXccVVX6rUSrrwUrlzpbbrrU6xzztzxzrztzbaOtaOa5-0WV-77e-9119HcXXZecccceXXX7ce9Xcce9e9meeVof919ee9Wzy5XeXYS9KBcXee_He6ce1ee0zxzta5UaX99c1mXcXhEJp9cNHWcTN9BcnAzJoorIBe0c--nIJoonSIBe-OX-NNOXWbcBgzIHX9xHzS9mcCSI9-nBrrorK9VcP-jHe9_BhxzKHcWC9mZp9-3n9fBnS970a6zs7egrIAAIRUKocXX9gx9npKaUxBppABe5OdHpBe-AC9-17TOWABpKI9-7JmnC6zGtxIBmen9egp6aUlyOzbrbbqUzxHXgjKKBc-ZehlxoeeoxObonox9XonAUbzS9efBdCAArHmjISBhEJnAofBUIJgrpocXxIBUoxHVmnBmmXAExoUxABmdAIBgnBonIAC6oxHVgfMHcXcUXAAGxIBgfxJch9c3enCMzSBe9eXomxHeBgmeCSBgpKMp9hzHfIEzHnArSxHX7pSrUHcnCMrUpSa5UIonABrSBccnBopJttzbxpBonHXpIEKMrMSrxpKxzUzltyUtaTOaOaObaT5UzNTOV0c116rMMKSKrxIKpJpKMSKMGxISCrKMSpKMKrSpSpI9xp9_pMMMMSBoxSryTUUxa5P7-0ttbWzzzxzaN5-NOWVN--0Wa5-0X-0VNVN7TOzaOWzL0bbX0y7NN5Ua17V111749c79e1c-V-----Ow7--N57-OzaN0ba156byNNT6q5OzWaT55-OsOX1777Oa55-5T5UX16tzUOyUtzrpzUrSKKSSAoemnKCIAIICI9KHn9CKBhCSHgenSAJnIJxSMMKKSSpKoopKKHpSoorSzxpWxMS-UKISaOxMOxttyOzy5OzbbtyTOzbtaUxyUyTT6porUrSztzzMSp9eceoogeZp9ZxJx9geeeXe9eZgeC9gegemp9gmpKMSonSxKrrbaUMIKJpMKKKpIACBmeccV71XX7V1mmmmhCCCKJompKKJpMKSKSKpKMJpKBeeceenKpzHnBnBmceee-X1117ememfBn9mfCBmgemf9mfBmf9xromcec7Us8He0u99cWtbc-PeCCS9VecZnBnBemfBn9X9c6aOXA997Y99755VXc6tXXmV5Os-ObVN0yN0bzaT-7ec7N70Wa-OV-5eggnHon9f9efCBpMzop97epCKIpSIBpKrrSKKIKKMKMJehzKKErJeABnIAJc717f9eBnAJzrHe7V9d9ef9gmopKUKC9gmcV6tX73eCIJoonIBnBnBgnCHgjJeZfA9megeegfKCICCJnIA9meZf9mfIEMof9XceXe97X-59XdCIKKpKKCJoeVcf97mZmVVV199YJmX7gceY9gpEOxMMJecrSSGzOxSrxprSxzJzUopSrIxKBpUMIpMprSropEMHnBrpprK91AJpJpIICpBopICCJonKBn9mcme9VcX9ee7X7e9ece9Xe19XcX91Xee9Xcce9VVVccefAAABe7emhBnSSKMSIJhCIJpKJppCKKIIIICJgpIBpAIHpBcoooonIKLObpBnKlzrKIKCJpCJpBnBpUzrrxpxSbbwUxzUprpppppJppMMIrrSSRUbWsOwUzUltbzrxzUzSzUbrrTTUUrSbbV6WbaTOzxzyN5TN-T5TOxbtts71-X-70V0sOWsObbaT0sTObw70tbbzbxbzzyOtyUtbyUaOV1-N0cVN-50aOtza6tzlxzUxSrzUzSSxUSzzOzzs5OyOtyOyUztyObaNOtaUrUxrrUSrrUrMSJrSIMSpKISzKUSpSrSSrzSMMxMSrMSpSrUzSSzzrTUMSpprSzMSzUxSSIEUSrzrUSpMKKxpKrKMKBmmrIKBgpKrzs6VOsUa--5ObzyN77-7X7e970V-5Oa5ObzxSxrzzSrKMUw-OV17X7X1X99X97X9X99cXXXXX977OaOVXeeeeecX7cX7X7X177-7-X-71-7XX97X97cX7VVV1--VObs970cVObtzbtyObrzxSomdKKSSMKqTN5NN0xrMIM5UrKKKpEKrSMSMprSrxMMUzrzrzSrSrSrHXenOtxrrxrxzSrrSrUrrSrSxMSxxKJpKKKJnKKrKIUUSrSrKKzKxKrSrSwUxIBnrxpSSpUzyOzzzzyUSxzRUpCBee7ecXce89omegpIBrpxzSrMJnKrMSFT0tbrMKxKL0VObxprSSlXV-11-c-X-WxzxFUaPcX777OzztzrSrMV-V75X96zzMKrUa9e-7V17gc9XeV90Bf957cVOzrMOX17X7X-X7X7V-N-6aUxCKzUUKprcX-UzSrN17WzrxrNX7ecV17WzzbaOtbxraObrOxrbxwUxpUzrzraOy5OVOWtzyOzzxbzVNXccXcXcX1-V197V-ec5Oy5N1--555UyN-N1---VOWX0Wtcc0aUMMyOs----Zc5-TOtsOWX7c0xzLN-NWbyOyUyUzrbxJe9gfTUxAMxrxzlbzbzbq5UKrJnAABnAAICETUtxSrzrpIpKIUSxraOaOVNTObzWa5NOtxxyOyOc-5A9YBmnBfHceX7-XXcX9e9Y9e5OzUbxSyVUX5OcUa1-UMqNNUbyOtsUWtWbWaObtzbyUWy6bzpJmoh9nIUI99oghSUzrrrSHeHohKCJgrKJemgcrS9nry6xSrUMStxzUSzqUrbrUxUSxxrrprUU6zSrbrtzUSUSzxMKxSMprMKIIIoonIBmohAIAHgf9eHeemfI9nA9mf9c9n9ZeXc9d9n9ccX7VZmoceeHVX1Zn9meZegegegfBhABehABonAHnABhCIBemee9eBfBeecgeohCUxzUbzxI9egegfAUUrHmegemecWcfCUp9meX9Beeef9onrSpAAKKKIyOzyUzJnBjSrxSSIBhMSHgcVYKxBmnzrROzpzxzSKKCKUzKBnoUzzbzpJmegfzyUzFObyUzrrzpKUSlzry6sUyUVN-7NOzbzzlzrzUrUSrrURUxzbzsTUsUWts5NOWa5ObzrUxrtyOWWaOzMSJnIAIprMJorKMIrSKMKKpUKCBonKMJnCJpCIKIKMJmpKIMKJpCJpBxBonHomoemmegnHf9f9cX7ce99emecgn9h9eA9nCHgfBnAIBfHh9eXXce9emec7f9ec1me89eeceme89fHeemX77-ceeeemeX9X9eeecV-V9e9Xe7e9eefBnBeefBfHmnBnBnKBpIEpKxMSKJnBpBnBnBmgmeeX9cXXVcX7Xce1eXcXe7ee9eXeeeX9X7V7V77V--XcXee7ec7X9eXXceX9f9eeee997X9Ve7Zee7WaX5X2Be-cee17X--0tsUbtaT0ta5-Oc--7Xe-X7--OVUtbVT--QA9nBmcXV--97X9ememggnBecJceeXme-cXdABeXeX97cnHgeeI9IA9XcVX7eX99e9e9mgeXeXemmceZmXe9ceXemXmggf9mmnAI9X1eIHcXfBghBmf9BemcX9Y9Ve9--JmZeccXA9Xd9cX9VXVVc7-V-Xee_BnJhIIBnJnBmohBgohBcmmf9eHf99Hf9HmommmmV5N-MvxppxrIICWzsOxX--OV5s0i1mopMKppzTOaN-0XXceV--0lJ7-90mzBlV2N7tRof9JqUsOaW7c8bwrrJchpK9-X7PBfHjKogcP0Jd92SMUwUlxMSErHegnrlxI9X7cY99e7hSzxpxSIIUHozogmgecYIExxxrrrKpKrSrMMrrlxtyUtxblxUyTUbyUUSaUy6Wzttbbc5N5N7V7XWaT7V6aZeVWsV9nIA9X2BmcWc7ooc--f9IBomV-0cnICBeXgn90Wc5TOa7-1-5cX---d11---esD---m8D-1VvAYqV-92glC5--NEEiqV-7Hsjk014I4wognBxwOs0Wc-D4y4gcT--0Y8X-0WalAk--0pHX-1Wsy6EV-a7EDhCBtaT9--X3IIV--_VJV0Ndepmzq1-0XeJbD-5XhvrCqTe-07iCnpteV-7iejk-iAtCxEIrrX71-2smknnEUUpze-e-c-1BtMB--2Kbq--YMmzV-sqPmrF7--Culc-HCwyxxcV-DEWXhte-DZ7mzorSr56eX170LG-rUSrSItzOueVc93c-5ZH-rrRP9-2d613nHdRUR6kP7-CZVZUEKUyUe91e-2ZYhnTPV-t8OMny7-1HZrT-DZf16A9mjFUzlsV--Hh_N-1HlyB-CZhCrSpzrkX7cX-2ZibAr-VMdC8brSrzUxSSIBxpHX17c8CrJe7rrUIpSrUxxzSrMIMOs5OVV7X7X7977V-7P19Xcce--8DNHk-LIcPSpN7-0ODtgnMN1-7Zz5USxyX9c--J2As-9J2CSu-08FHSrR7V-0G5xV-OH5vqV-0LEoV0OLiAnMN70D_f4UKIBnSBgzSrSxSSMSxpSpppzc-5TTUMbV716s117X1Xcce-cXXHcX--0Rs7V3dS04nKonpSSkV7----TMGPxrS-V7--MN-c0HMYnBnrIAIrK-OWV75V-tTEHotV-qMoqSMUUbe9HXV-mNcawnr6xtcVe-3aNiUIq1-6aOwMISlc1-6aSe6rROec-8ac9fISzuX-V1tf-1mnBrlWaN-NajMY9ggeoopCTTTTN6aN1HdgkXoohABnK9n9KJmpogeV-0XJenppSrUzJgghomhp9VnxIAAzOxWbbrIBnJmenBegozlWyObxIKBonIGaOVT50xSk6xJpEpIHnBonBoptxpr56xrzzbonCBnCMMSonzxJmopCIJomX7mceHcV7nJxSABhrbxEKCIJhAA9HgenABrUMbqUpSUrprSrbzzp9hABeXce9YAHcoomnBmmnBmmnpzaTTUrzzMpzWWblbyUUSrUrxbbzzblxrUUbrzSrtztzw6btV19ceWXWzq0aU6aTOta0a0V5777Xce7nA97VOa0X-17VUVV0V17-17X7V7-V----1-V-VcX9A9cWbbzyV-U5T5TOa5NNOaOV1Xe9ce99mZee5OtcWbaTTTTTOWe9ZeXcmcXVV38gtRnCMzSw1X6VcV08hu4rq9--tiGRrac-1Qfbg-dax4zrrIKoeBxErUlzSGbs0VP3eXX97XV-9R0KCsV1OlXjprrP7X7-HRQsCpVc2TRgLxJrKBeKKJe7BhIKKBlwOaUrNTUsNNNcNP91V---PS6VgopVN-LbHRrK999ezrxxoy5Tc7-0bJGjF--6Spy-5bU7rSbuXV4tsIYpKSSrSp50aX-177e-2baNMC5-2Otd7nHrpOba7cV2tv2dnICxz-Uk7cc0mUIkRnBpCBpCIJOWa0VNOtc-19UQnBeegmnIISxJns56zaOWtu7TV--URWN--VDLc-eVE7zSrUX7Xc-5WM4BN1DWTIggpBnEKKKESCWV5T5Wa-N0a9VsP6YRn9cmY9JggoggzUKHfA9XmcP9XZfIJhronABfISpxrUrrI9ABnBggrxxoe9fHmeBdCDUUrHf9orUogrzzJfUU6zUzbbbzrty6brbrxxz57OtsN5OsN5V5VT5V57N56yTUtsNN1cNNVV5VNeeeZeWtu77-XX-KgxCqWVV-P8w5qV-uAjtz5c15XwhBooopBonIKKJNN5-N5-6WVN-8ckmzArUOVeV-uDoWxNV--YoA7-TYoYRoxa57-1_P1T--8NKD-9dNS2ACAUta---dQzr-DPM79mmgcpI9chMKCppxxxrSzIbXc0aT1WVOxk7-N-9c0eauZgfAKrSrrSla-5-7n9-V1eVE3nKUwNVcV0eWZinCF5N0TcbkCMSrzr5OVPXCA9VXV-1b0uV0ezUBxUsXc--mhTc--n9_c1DnTIxCCSMKC9eCKClsT5OsN-V7NNV6QJcYxzUSxzSwUa7X9I99Xd9X-BhW8EE6rUw7ceV6fXkApBmf9f9hKGaOWzzzObV1V-PuipRpJ5--6iiarprP77--DrhL-0iv-fN-7jNKjExzXcc-Y1kshKK-5-V-wF2umWs-03EWs-03_Ms-23gdy-qlmyACJmcgfBnCIIrKpICUSIprUa0VOV5N5---V5---wRnFru7-E6kMClX-4lwIAzq9c-A7r-z5V7gdk8monBgfCCCElzbzxsN995-T5-KgiSunBnABmeeIHprrKJxpIISKICJpKprUzOcOzzUTN---0V--50aN1-1-PV7XX-SnCeY9f9mnUSSKzMtaOWa9VX--bBy1gzSxX-e-4nFNEAqTc-6C7Wgs-EC_DBjN-0nVb2N-3n_EYByN--nfWnV1Bx8ZorUaV9-CnqgbKISrNN9-9-8o5aACrSVWXV-C0gPk-jFRwSM6rsW9VV3h23TmfBjOxMUtaX17-6GYfE-0UHSjwfEzbxpUUq17ZcXeV-h8rqr--3odX6MF--8ogzvMJrN--V1xAI4npKwT7cV0Xp-Yf9nBeehKMKrzzSxrSxrUSzzSxrSMzSzzV-T-7V10Wa6VOWVT1mmeeegn9eeeXmcX97V-IJGnCr1--2JVvD-Bp7gzSxw6aeZcV0hHX5merts-EJjUhq7-2pGMvBtV-hJmVz1-1pJofqV-0KQ3c-0KztN-0L5k7-6LYvE--ILYxhTNc-0LZ57-ALu1CaV-4SIqV-hSQ3na--KpjX--ppknVESTPknBgmgn9f9f9onBmenSpMGzxbtbzbaOV6zbX9-NObWV-4TmmV3SToLnBnJnST5Oa-1-0px0YD-0pylvD--L3Ge--q54IV2CWmWnUUz5Pcec-nO-URhBoUy6VX-1qFuQGc-MOcagpR---CcERs-0PQUc3MPs8gehClzSzbzzUzxMr6tyUzzbzaTP0HgmcVXegeeeXeh9eX7e-JqqUEKIMpzz5T7cXX97-bRBpSKoT5X7--M4g1-grMIbBecemgfMxUpzMzObtu7V0zrrq7e9eV-MTaFhOy9VfLnt2-9-17117VcX1-1X97cVXX9177V-VXV9-WaOSMSSSSrrUSKMKxrrrUSxrrUzsOV7--N-tVN--N0bKIKKQCKRnKQCUtrTUtUSxpMprrUUKxSpxrpprMrxF-EcVGxTX" : 11 === fU.jJ ? bS = "QREc7lR7oVUYGy_KJOJKKKKuK4OKT_K4KG_u_GJJO_3K_KKKL_4KL__KK_4_LKK_MjzuOOK_KKKOKLKKLLUjzji_KKMgyzdMjzgzzzEszzyzzjvuQvieeid_POOvzkzvzy_TvuOK4GKKvyyzzydJQi_OdKKaLOLajdOPuueaYBzydJdPOybvdbjeuvizwzujuQnunl2wBnBE2-EYBz2nk2kFzwBzznBydnwznEYwnnEBnnwkyvwzEgznzzEwwwwznnxK4KGOJ2zl2nzifvwyw-J0GGJ042nvzEvzwznJEnzlG42zg02KKGFzzEzzeT-woKK3EvoKLOJBnBnzE2EznnwnwznznzpJKKKKOOKG_G_LKFwl2zK8K4JK4KKKKKKKKKKKKF_g38EBemXeeeeeemeemgeXeegf9XgeeexCxzzzoenErMroeXeeegfEzSS9eVcghoeemf9YBe9ee9eXghrzzzKBfIUzrbzUzzzbryOxrzzbbsTXe9geY9egeeBeY91cUy6z6xtxbxzbzlzObrx6ztztue5UyT6zzbzbae7UxyOzzbzzbbtzyUyUtzztbyUzzbuecZeBeXeeecgeV--1ViZ-00JJIV379xwOLKKgzyzK2zF5g4ccBgcn9ggepUxAprzztxtyOzbzzbe90f9cXX99V-cAQAOx-PFLqqmemxp9zzttzIAzrrzzxzzze7X9ZeceX5ece---AorF0B4uUghzzae9-6VjJh_UznK---NUXV1NBEpOLYnzlJ--0X1X--Vl4pk-B5KYEc-D29vazJ-HkP9DmexzxxzzzrbztbseeeHeYHceXV-NC5uUF-R5YYCyX-2Vpc0jCF--5lM7-12TuM-hkQrZrS9X7f9e9enrSxrzaUxx9f9zzHhzUxqOaOsObbzSxoqUxyUY999c9Xcecce7eV5NDrSOLauUwzzzzEGK4K_0F2Z6YfEUoefUtzUzMyNNe9ceec0a2zdLQdyjwynxKKFznpGGJ--1-_X-AW0ZpjvnzCKKJ--1309--02HO---WrDV1sGfOOjzzn4KK-0FYN1qP-2W7RtfkF6J8G-geeemf9gemegfEbqUrxEbyTgecOwUbbxEbyTTUac-H3crrjCLEE1KoQBrofHegeecBefBeeegfAACxUHemeeeeegxrSrzxxoeeXXe9ecdAzUomXexzrzroeXeecc711_rI9nUSxxKMSryUzrzUpxKx9cV7cceghrrJnJmhBe9ee9VUrxy0a5-7e7VVX-7XccOVX99eefKKAAMxMIUxzMrxK9XXXXeXceXceee9mxxp9oeV9mf9eHgmeeWsXnHcmfA9oenJf9XcXcOby999exKKzMIJcceYBggghxrI9e9e99pxzpHeccceX110cXe7cXWzrUzUxzzrzrtzbaOcVcceXccce9Xceegcce6emeZe96buXeXoe7TZhBe2Bmc6eIBdC9eC9fHcHcAC9erxHed90C9MTUzoh9ZjJeofIAzHghHzI9nHYACCA9VxIHcfx9gmmnEJrKErJzSC9xrrrtyTOaUa0xSxKroxMSSrIMKqUlc6bztWx51--P7OyOy0tcX997V-NP6WsUaUbaOaX6VTOzzzxxpHnBnBggofCKSpJxUUo6pzzbtzyUzbxSzogfABeceef9mpSzoppI9e7X9nCCKMMK9fEI9ee19mfBgemh9W91WuI9gf9e5eX17N5NUXc0a1nBenUHfSorpMKMrHXh9XgmY9nMJmV1nIISC93fA9gnKBemp9e9XxKoeeeA9fSMzrxrpMSxMMHorIKII9eecgeceeee9gmghrKKCpKCIJonMozKJp6xyUzSppr5OttzzzzWWtyN5ObcV-5OaOWttyTTN5VWWbbzzrrxaOtbyNTUUrrSMMSpxrrSrUxxUUpSzSMKonIOaN6aVcVNOzUrL17ccXccVPeccX7717cXX-5V0zbzJxOboUKrKrrUxxrrSxxrSorIKSrMpUUISxxAESpGxrsVWzP7XXWzrrxVNXoccWcOcX-6xrV6tx0zxzUtbtzq99777WWVUV-50xaV0tsNUbzpUUzp9nUrpIyOzaUy9ge197e6zlbbbzbbyUzommhxonCHeIxxrxrxrUSxrUrrMKoogmmecmeeZcceX7eXHeeemmmn9eedCzHfoeeeZe_IMzIpoxHXKzUJxxUoUUprza0zxxxrUtyOaUUlbxIMKKKoopCIJpJoommeeeX9A9mmn9cce9Xe9ee19eXe17eA9mgnCKpJnBee7XXXcee7X-99XXeee9993cXV0ba5-XV0aOA919HgmeeBeY9mmX9ememef9ggn9ghA9mXcmeecX7gpCCCBnAAAABnCIICIKpJonCABnBgf9hBpBnBnCCCJonBnJnJonCIKprSKIMKKpJpCIKIIIHrSMpJjJxMpz6zHxCrrMMUSprKSIrMrMUUMrSxrSrSrrUUyTUbbtz6zbr6xxxtbtyOtyU56tzyUTUxzrSpxKMU6lWxzqNUSxpUxEMKJxCJnMKEUHhICEMrHxSUMSrMSrSppppMKMSSMKpKBxMKpppKKCBnCBopIKIKCEKCKKMMSpppSSSMMMMSSKKKKpSKKSKSMMMSrSSSMKpSSSppKICppMrUSyTUztbzzbrxaUq6zttbaObaOa5TOa5NOWWa5TT5-N50V7WWbaUbbtaOX-N-7-1-170cTT5ObaOa5OtttttbaOa5N5-1510c5V--0VVcX-1-V51-N7X-WWV55N55550ta6aNNOa5Oa5OaOaOtbaOaOaOaNOa55NNOV50a5-T50WWV-N--7nBf9mcmgcmmmeBgmee7X17eWba11X7VX7X79X97Jc7V7-V7117X7cV7---V1-X7X97--7X111111711-VX77V7-UMMMSMSrN0V5-UKKCMxpprSSSrMSSKprxrSSSMKKSKrMrrSrMKpprSrKrSSCKKppKpoxMUOzaTOzyUaTUttWtzbbyOts-OyUbbztVObyNNOyTV-0WxWWaNNN7X7VXceXXX17-7WWIBnIBonBd9eAA9Vc7NNV1CIK9117-797X7VX1111WbWy0xUzprSSSpprUxrSxxrzTUbqP6zrSKprxzxzzTUUUztzztxzzbtzSSUSMSzprSrrtzJmmfrSrSUSzaTN756xKxCSSIKMMKKpSKpMKprKprMKpSKpprMMMMMKrJxSSrSaNNOtVN6s---0WV17N-V-0aUWbyN0baOaOaNNOWbyOsN70btaUL0xLT6o-UM6lX6brSppSSSUUSrppEF6pSSSMKKCKVUMUL0tba-USSUKSKSSMKrMKpKSKKCKpIKIM6rSSpxMSppKSMKSSSpSrSxrUSlwT777VV---777X7XX19XXX--7V1Hc1--N0VN570c6bzKMUzrSxprK6xMxxrpCKS5NTT6cN0zltaTOa--57-11-V7X7VcX7c7X77977VN-Oa0aTObaUUoOxpKpqP70btyOwUsOw776rS6twUkUOtWaObX6ta0bVcOcWy5N-5T96XWaWccZeWWtaX97cecWzUxxq1X7cVX77VX999750a6VOttw1XecXnIBe9-VZceX7V0zTT-OtWWbrzSpCCUJltWbbbzxzUpoxopxTUUxprS9zMMSKKxGtaUtzV177177cX7X7X997-OtWaNX150a6V6rxUxtbaOV-NN0WV-75-0V77777X711-1X195XccccXZe_on9c29c799ecVOWaN-55NP-T-TUzzzzlzzzsUzxzzrxAqUyUzuA9770V-5UzbzOzSSUrOVOac7WzzxCrSUMJgpIJrKIHgrSJxSrMSrSrSrrSrSrSrrSrSrU55-X77TOe775OxsXX7X15WzMcXccX-Xee77-VX-UzkOzSq7UbzzxzSX5OVNUbaTP6xzrzccccce1XXeccWzzsP7ce-U6rSzSzbzUxxxzxzUwUqXcPVTT99XXce9eeXzS9cXXX9XceXe9e9ce9cece9e9ececeeeeeceexxxxrHee7ece7Ue9omeeXeeeeeeeccX999e9eeXgef9eeXXXeceec5eXefC9eWcPn9WeXeeef9hzSxHcfx9cBe9emee9X_Sp9e9Xe999XWyce7X9ceeeeXerp9eeeceecVeeeeen97d9ec_BemgeemVTOyTNUbttXVe9cce9eeef9e1ee95eeec--3mJ3-01RcfV-NIoOUF8R8uLgf9hIHeec1Xe9fBeh9mfEzzyUrHenxyUyUtzyUxzzbyTTNf9e0a0cWEvKdK_KKKLKOK_aJaPPOOUeKdUddLTyEukyvizjzzzGK43G3322EBkwBzkwwzwzwzwznwoKKJ0K1X2ABrpzzozzzaUWtacme9hxBcXBoeV9--7KZ5R0K1i5QpxUxzUyUzbxztyX9e9oe7eAHXe9eV--KycF0gAC-Bf9rUzta7c-54dtbV-61qbAAy---LztF1oAWqEUzrzxzbeXeecf9V-94pL6xF--Agu7--4xl31226aIBogfABfBf9nxxMyUztttttzbbzbyUtzbsX9f9e99eeec--5HLZ-A28MQry9f055LVqKKPKOaOddaKaKOOd_bizvy_MeOOOK_LPPK42BnJFzszEo0G4aLKOUjuOLO__GKKKKJHKG32K_KOKbnzzdKOLOeOO_-EoJG5KK_KKKGK2wzElGLK4K44JGJKLLLKFnLLOJF23dLLLK43_OK_KOOKFqKOKeK4KG43KKGGGOKKGKKJKKKKG0OKF_FOK_OKKKPLJK_KLK____LKOKKOLLMjidbzzdPPKOKJOG2pOKOKLLKOUu_PUzzzzYwzwydKdaOOKKOOKKLKaOK_OO__aEeOLTdzzEBydaaKdbEnzjfBnuzdPLLO_OLLOK_OLLLUzEnnEnzEnwwnz42zuRzEwwwwznK2nnwzEnEEEnnwzEzvdKKOLO_OOdOUEnwznnzYwnkEEzyEiuUvjzzzvjnyaTyuiz02yyawBkyeQeeOueddaUibuPJi__9gwnyaOOPTvuPJTbeLzEiYuEiaQEeRydiddddaJ-x4K4deadddaa_daaOdaOaOddePaPOaauddeufEeaLiuOfevduazjuzfvieeeuPueefiviiebe_3KvfjfEfiveePivjfiuiE-FGJ--3--4-FFF-FF33F-B-22vjyjeauefeiiuzefujidavuyuivfiuuvfeeuePaPiuvvjiiyyzyivvvvvyziyvzjzEnnEvyviviuvivjjzvjyyzwEii_viuviuo-2vjffdKHPdivgEijjieEigzjvfYyfno3-z2BzvvjeOiivffdideeeieOdeLKbeLuOOOOedaeOeidjgnueaaLOaafeveLyyvivffiiuuiiiiiiiivevfiiieiiviviyyvvvvvvvjiuvvjefeueieieeeddveTefeaieeeeQePevedeffeuieeuaeeeaeee_fiffiieeQeffideufj3323FwEjdyuMeuaveTuQeuLEeudG33_eLVzizvdjfzi_JibeJF44fzeeu2vc3BEfdvdjfy_vvfyEvd_TyfyeTgyY2yzFF-wz2zJGF3F-kz-F22Bn-0GKG43F-2BwzFk3-BoFC4300-EyzjzBo3-l0-zzzwzwzEBk2B-440-04443-EivzjjvzzwwkkBn2-B322BB-zyadY2-B2-nBkk-oF0-o-o2wBnnBnnEsnE2Ezsnvzk2nn32-nB-kk--BBl-2-23-3-BF-B-ysn2-kBBnEBBkn22-B--00-00GKK43GG03JG43KKOGJ_444OOFddF23BJHJGGGJJKOddG-kBKHJ44G-nB-K3-F3-F403JG3GJK45KGdGK8J3G44-3G04J3_LK2B23JK8G3FExKOLK__KGG4KOKG-3K4OHLK_affedaK-G-n2-F-wn3_aO___KaPJ4aOeadaOaLdG3G3GGK5O_OOOGGJFG3FFFF-k-22--n--GJ2K4KK_KKG_KF2n2-2-C-nu22-2-nBn-KKKOK_OPaeOdd_eOK0O_KOLJG44J33-FFF3-F-2-B-B-k2E202--n-wnE2yEEEB2ynkygEfynEvijz2y2GJ2zgzEgwygwyzvyigwwziiiveaaidfuuevfiE22-k-0---F----knBnBnnnnBnBwzBnnEwx-EsnGJEnkCJBBBFkB22nyaLdfeaBknB-EsnBnB-zznzKK2nzznEzx03BknBnBwznByEwzBnzBynnzjzdLJ_OL_aOigwnnBnyEnzEEnlGOJK4FpF-FnBOJGFzywnwkoJKOK_OK____aOJBEBwnEEEwwknwzzzzzzzzzzzEBwnnwzEswwwk-nC3LK2BLKK2wznJK4JK23J4-FzYsCG2lFoJEC332JCaOT_aLPJ8_OOJ34JBFnFwBEK4JF3G48K_4_44HLLPdaPaeOOaLLQiuudeOdaLOOOOOLKOeePPduOaOdGOdGJB3G2FFnBB-nB4K4_GG44GJC3GJK4KOKFwB-kG_F2BknBnnBwnEBzBwwnzwzC3EzwnEjzEEEEE4KK0-zjizwwwwFzzvih-yC02yijEnnnwkF2Ez2CJGGKKdeOKaO_Gbd___Fo-nEB48O_aOG2k2pK3EBzF2042wwwnzznnEEnlK_4F--Bnu7-D5P0Mj4-NFneHn99fHdEpA9e1mrUrMMy6rbyObacVUbsXc-95VQqU-0RC72gfrLTUX9WL7PGHOKOLKaLLO_aOzjzdKK8fyy2yvzzzzjnvEyszn-yvuyji_KjEzfvvdedLOOK_au_K_8KK4O_Oavznwzj2vYyiizdQjjyvjvzjnFJ43FEvyyvysEV2vkG-oJJ-J2vC2nzfvdvcyvB2EgwkznoHKJEKF44K444Fwkzjx4JEwoLK2EGKJ34KOGFCFK2C3GKKKLujnzuK_aK4K2Bl0KK_K__OOd_id_032E-wwwznKK-5koy5rxzzye9XeV0NQGfQzp409Fr2emf9gemeoemhxzoeenrzzzzzzxoeeeeHeeemnrUzzJr6zzzzbyUztttzIzrzrtzaP5Uxy1XXc7TOVNOcXemnCBoeVOX9IHeX9ec9V-7QyMR-O2VLYCrzOcTXeV-7R7oR-42W7vEc-16Tkb---xZJV2sUexOjjEzzlK4KJ--2yzH--10C8--0-gFV-7VNER-038rYV-7WePR--3FiX-8X7VOizvlGJF--GAnc-q7b4qavzwz43KJ--3In9--193W--G5YBk--7uzo-03SVI---Z6nF-JH3JgtV1NZFfOiznCGJ-03ZUnV-NZy-Ok--HUC7-18Epr--G9ncs--8SB3-23innD--1O-0-6lCPTmmnCzzbWa9c--8glJ--3qO1-3XRYCbzK-XlIJjmegemef9efDUzwUzx9fHfBfxyTTTUpsTUxzWttf9eeWtzu7-19Vk6-2lJH2nUze9VKcf22OuK5ObzzuOLKUzviaKzzzfzvwwzEwwwzYBzB0GF5JGaKOJOG__3a_OJBG4-PlNXPmfBnBnBofADUzJzbbbbbzpxzbXe0ccX9Bc6s--1mmx-6lYOwmextzUrP7cc-5BSZbV-45HC2T7-9BdhMxF6JOkqwemmmmf9e19nJemmmenzryUyTTUyUbbbbzbtzue7-qBstqKOOYvEEBo-45TmAqV-1Bzxq-CGcDCxzS9dEMrxowOX7V19X-6YINKaOgnk--leh3lV-cqZnQo-AGhLznASpxpObxa-cXcXV--sj9F--RjYc-9DO8aRk-JRodC5V1Ntt6OKvznCJ--6Flm--Yf48k-BTXJhc-LEJ7aTYC-0BTkwjJhyP7P1LYtQd_KPPLbePLnuafp-yEeddzzEuOiydeKOGdzeaK_jzjjuKKaOaOUEnynBzvnzVyzzEE4FnBwBGGOJBF334G0-3JKJEknBBlKKK-wnCF-RUIqgju-4Yv7daLnB--6voH-EYxyt_ueaYBBE24F-wUjugoqOWc09F4K5OGOOYyzBzElK-1m02NnLNP--32h4-0m0qgnqV-1FPCq--H2Gus--FRXJ--7Gue--38td-6H3zimfGzxLPWaX--3E7C--16gBV2O3CZOuLecn-n3--RX7jgyP--3G5C--18RXV3t3nbP_3_iju_Hz2-B-03XWAgfxyTcV-047KF--Xjy7--GPHJ0W7iC6CSKKIICJnCBemzqUbV6sUa5PX6w1711-V0d4t8OOwwo--7o-P-3ZP3pin4--1CVBV-85mEN0d7rPv9hEIBeXrICxpCAIBtxrtbttztWV--UWc7ec--ZRVOk-3Y_fi--3SWl-1HE1urq7V-06YZF0JYnKBgltzy9c-1GuEq--1Ey3V-87P_R--8B0X--3aep-1HIL9xw7V-08jeF1RZt2BoxCKLV5NOaTeV-LHXk5OUn-3B_KjRnEJxK6xSIBnGsOV5-5-N7e0PZfppdQivevivviuviuvfffiviiiuuivV2vxJG3G400-F2zoG43G3G3G43G3043FJF-B_XHC--1HrHb--1Ml9V0OBPSTykK--mPGuw--0CdCF-3bQrg--_-bGk--c3w7-1J1Tb-nHWSNmnBmnCBnBognAxAACOzzzUbzOzIAAEbaOtbpICxtaNHW9WWttge-Ou9dHce0uXWaOaNTc0qJ_j5Tfuiyfuvyn-43-C4GJJF-ZdZ-CEN--qKF5MivvzoGGJJ--9fZm--4NVG0OHj5Imgmgn9mggggggzbxlyUttxUxrltzzxUp9mcegf9nBx9HzICBnICCIKMbaOWa0c55OWaUlaOaUxxrIJogmqTUpK6aNNOaN0xMUNT1-XXceee7cN575ec0cecV-0P9QF-3hh-D-7_jKnaJ2nyZ-YA_nYBnBnEUttXVOc8aMCmTLLKaaLKPddbjiuievivijivfivy_PPeaeffjyyvjjvzEnzso3-F-3G42l4J-2zvEBGG00LLuJF-3KFK003GFEyxG-nEzvp-B33G_JK--muI9w-5OSJStaOeji--wBzzzKGOK-0JieNwmeCzzaV-TMQgDzvlJJ-GAk2vrxkPe7--MV8o-6At0AC5--OURXy--gjqMEraeV2OUrqueTfVFl22F--jvyN-PNAgydcnF-Yn1WRrSpppMJeYrJnrUKq6ce7WzTUzUUUNVNUtsX7VJece9XXX97c--5440-2I2OHnJsOV-1NxR5-Bn6z2mgeegenBzbzzUbtsN--0_72F--nKlc11OxXDLKKO_OKLQvzwwwzEnnnnKF0RnydBghMMNN--dOfypPMdfibveueeaPaOO_3eafd_J8KOKKaaOaLuLaLvcyEieQevy2l---GFpJFzz-ynwwzzyeiyv-Bx3FEjjzVEvV2s2ufk2G0--3FF2020003JG33F-dC_NYAASKopSbtV--77--QufZ--CxYX-5b-NCbjY3F--sGR7-DRSQ6v4--2ZTFV-OmFuQF--tWp7--Rrk3-2DRQfF-ObG_p_LKK4LQjvvvvjk3BB--2cnkV-0opdF-BuUUE--1SP5b--2fOPV-0qQ8F-JvLKBlV-ttYkOgB--EKfm-GbimObjzjzzK4JOJJ-QEW629fAEU6aT5-Kbx48aOGeQiv-nzVk1K--4-Bei-2c4b_aEF-00fX7--VsoZ--FYHH--7bwK--3KeVV-19ymF-456Wg-0cmm4s--oPB-o--PCDOOk-46F9i--7vjd--oSsBlV-uEMIQY3-0GwSv--1EeMF-06tTc-5Z2ZLk-2HUyYu-0dG4tY--3dhcV-1KhfF-09wIc0ea0y5OddePfiivc-kk---0--hB85hIq---PPqqQ-ACDhYBegf9nBoyOyOtzzxAUzUxrxzxKrqUSHnEyUzzOzbcXXe5e9X97XXXccX9Xee--1UpAF-SFcxhOX-1eB0xgo--Jd31--9KJS-9pBVymefBnKMUUaOVNN72Xdb-LMveiuLKJKMinzzzvfY2BzjEzzY3GK3FK4KOGKF-0Ji17-ueZcLLyvwzYGGK-0KK8igpzza9cc4aecw5eQeefeK3iifeyVyyaPysnzivW-yvivjf3G32JdFG5OJG-3--EB2003-C_GGF-0M4Pc--fYVJ-0L1VIV-1kjSF-0NOQ7--gXeJ--LIdm--AAXh--Kaimk--h2YJ--LYMm--fHOlV-4QMoB-1fQzGbV-OM1DQUKrSV17XV-PsGvQ--0R8xc-Pi9hLee----4n7gV0uuK8Ovwo_F-0SPF7-Tihf5jioG3-rMLqIMSxJfMpp51-Uk7-X7mV-1vH3F-0SiM7--ivJJ-4MU-YL--5j0_5V--MW4m-Ffnz4uebcnu-E0K3--4umFV-1xQQF0KULdhJnCaOX--5ji96o-jMt7YCKBproNN55-KC9-7-Pjp4LPbw---4zuVV-2-p7F-4VdEB-3g5r8awo-6q3GTnIBnBlaOaOV--kXLJ-0NJ5IV7f1wFOePedueiffjEBwB-FFFFFG0F7pWV6CJfCAHcXBnHgpIN5Ox6lbxrJpMSxbpNN7V56rMF5-7-X577V--lo2Z-0O25AV-28oRFJ__7yBm_ICCAEJgcnBdJonCBgegnJpS9XXe7nIKCSSKpxppCpKUrbzKOzaUUoUzKLOttxGVV557-OWtbVWV0a6ryX7X70cX1-cUu-Uy90zaPcXe90XX--AA8ER--Oap9--gnQdkH4b2ThSprSrUSrMSSUSxpMKpUSprMKrMKSpprUMMSrrSrSR6rbr--N--0X71d9-VV7e7WaWu1Zc-cVe95BcZe7917X7cXV7VX9eeX9--Bw-4--LXIak-9oUkasF-KdZHh5--QKOSQF-0f7Ac-DpZnLQC--5ifVV-2M_TF2_g-RhCKoxKSR7-6xX7OVh9-77uqCsLOaOKKK4K45PKaadudaaeddaejyeedeTsz--o-k0-nzuafiueskznG3FB3FG3EBnknEs4_OOGa_K03F-BBzvnywzvvzEBBkk-EQ93ASrF17--hcV8V-0ho3c-1r18a-KLsKtn9ghIKopJxGbzlz5PcOWWV6bZeVXV-erChLbuawo3F-0QgRIV0AS_oTz4F-0iqsc-LrVEayh0F-0jBw7-1raaM0sqwtimmmocCrUzKrUzbxJeYBexrSIoT50xMUUSrzrrxxxrppMMIrI9gnJzzaUOzSrSUUzxtbX7OsU-UOzrUxxSSSpxSrzxzrr57cWue-BcVX-X7X10bqN7e7ce7-7cX7eX7ecccXce9e9997eBhHmhBnBme7791-5119cXV-ATZeR--Qs0X--CxF4-2M-EHrMNVV-1s18b-0M09Rrc-3i33Gcy3-7r1pBmhExpSrcP9-7-3i6ThbzJ-0r2kLmxV-LsT9bywKF-Cl8ajc-5sg76o--RNyP--DBcS--r75Dw--AZP8N-CRYLYIrWcV-AZ_gR-hRb0Q9efBUUzzxrq7Ve9--DIcG--69X3V-2_KXF0CmrNBxUTN7e--DM2x--MBNss1qtbGTeeeiebfeviufifjG-FF-FK-2F-F0-F--6CEoV-2b0EF-pnx7hKlVX--DWBO-IrGX5pJgomd9Beefrr6rUttyNUsWaN9c-iuOLLLPjcnF2--0p_uc--uwAJ-ISZnnCIKWa---QgbdT-0_qJ7CprKy7917--Do60-0MPdwpc0LirO4eLzjezyyzzzyyzjzjzzzvvsFEiyn3OJFKKJFEwwKOKJJKGd_GKKG3JK4KJ-ESx2nSrP79-5j2XKaPVn--_t4Cgjtc-1wYGa--6ZPXV-Ama9N-CTK4nUSXX--2n3-F24thzhrHcXnIqUttxbcd97-3jCxpvh0-1rbiZpEa1-JjETd_azzgznzC_KK4F-0TTz2V-2nrwF-Ctvzgs-Dwy-LEp--Mcags11x3uLKKLPLLLOeNwzBknnwwzECF-0uAGc-ax4e5iii30---6dYeV-2pDWF-0v0pc-uxhu5KvzivnG3GF-0vS9c-Tximavyl4F0GTtRbKpKKKIMKorSKxcP77--50cV1--X-0jSM8x--MlFHs-PyMyriv3J--6njmV-AuIRR--UKqu7wjf1GaaeOdiaPdeeaeadePOdd_OGG3FK43G443G3G-nBB-En2B3P_3HKJKGJJHPdOKJO_aOeOaaQe_K4_F3G3O_8PKOeLOPeOK9TddJ01OaPPu_aOdaO__OKKaK___GOOOaLLLOd_-9PPeaPPefeueOH_Afeeeueuaeaieeeaadd_OdvvivzynwnnwnEnzzzzzznBnBzEEEEzznwzEnwzzzzvizyzuuaveuePv-wnBwwnBnEePaOaPaOLEwBknueaaMwzeeePPujjczvyvwnnnEuuusEnnEEEEzznEBBBkn2BnE2BknknBnBwwn2Bn2B2BBBkkn2--3Bk-k-F3F3J0F-BK8J-0-3Fl43J0JJFC0220-FFB--434_F02-3-FoF-3--ULK1-9jk6__KPzsnC-0rs2uxu7-5z6oLo-0Ua7Y--2yTuFFpzEegnKCAHYSIEIBgmnBen9mhJonKKpKpKIICCBopKMKpCMMMSxxtbbyOVNN50V550VN50VN50WVN-0a--0xLN-V--711-V0R4w-PfBJ-5sCnMpUSzGcVcX--36DPF-a3T2CpX7-21Rkb--7L9iV-3CdyF-D7K1E--E3yyLPB-AsdryprMSrUMUXVXX77X7-0lNuCb-0sh-cpsV-24z4a-0O5skoP--HJcO--8cjcVMwvW_PePffuOedddaOd_OLivedaLOQswwnnBwnnBBEEz2EknBl___JJF2-ddFJBB-kFJF-3Oxo3mryUe9--oNo0k-L_0tBtV-x9UXPVk0Kd_2QCCKJnKMU6Wy6x0a5OtWWaA9f9eX9VNhBeeOaOaK_aOaOOOOOOOLK___aLLLL_aLbzjjjEnnnEEBnEBnBwwzEzFnBzBnnnBwkBOJ3--9Q2JV0hFDWPTj03-0esaIV-4M3pF-DfxqCV-0LPM3-8fbYnBy5-Cq8_WadYzEwLK3--A59FV-CZXbR-2ghDYk--LQk_-0vCsPnTV-0OncZ--gxEe--LXbt-4QGLNnIMaTP9V-4d4NF0DoYGBxBttWe--LdTx--AJjgV-4fDgF-1q1n72bQ0Tq_fzyaLyy__JbzjyiyEvnzoEzz4K44GG440J0GJ--AQaoV-hj4xQW--QUtTs-0QzBZ-2hzuIu--M0W0-3QVpXzUSX9X--r954k-6-LVD--s6udk-U12pBUe--NKbO--B9nkV-55gUGAILAU-ee9eeXeeXeee9eeXeyN9eeeee9XAzbzzzUUtzxzrza1fzrzs7Xe9XmeeiUzrWztzbzzsUztbyUUrztzUzzyUVfzMzzzzzzzzzzyUzzzy1SzSxzrzVczzSpUzbrzzztzzzzrzzy1cXXecXe9zzxzV9eeee99USzzzztzSzzzzzzzzzzWtzMUbUztUSzzzrzzsD2xzxrzbxrzbVeXUzMMzbztzztyUWVX7cX7X7ccX8rtVX2Vc1gVWrVNOta1UbbaT6byOyTMqXggpFemnBnLpThScXXopfJppUhSzt_USUrxSxSzUUKwepzznMzUwefMzSCJXAKRemgegeeoeeeeeeXe99eACMxzUrxzUzzzPmeceeeeXeepzrzzzr9eee9e9ehUrxzrzryUzzzxwg-3sRUlgzK-1wGfBrUXc-1s_20ck-8lARQMsc-6sakWaUYsG--BJEyXtygSR0KGMwzkKK_KK_KJKK4JRnEEEEzEnwznzwzwzzzwzzwzjw3wkznnnkKOKGnEzwEEwzB0wn2vyizz0nEEqPvnzzzwjjEjzEEwznzzEzzwnvz2jjvvzwnkTzzzj2vznzvzyzzyzzwzzwzzwzwzzzEnwnknzfjvuzECfjDzEBBwzEwzEwzwzzE2vfwzk6njvw-nzEEzEzyzvjvLizyyzzzyzzzzzvzzzzzeOPPKd_4aPuwnaLK_aOezjEwznnn2EEnn2wzzEmwznzEn2nwwzznwwnywwzzvzEznwwnDPzzwzzzzvzEvznzjEyjEEnnwzzzzvzvzywviwzzEBwzwzzveznyuzjEzzzwznzjwzjwwztfvzznEEEnzzzzzwn2BwuO_fizzvzzjzjDywzjjEqKfyvzEOfzzyLjzmzzn2hPjjAwzjvjezvnfzzzjAzfjjqKOO___OL_KKKOK_LKLO_KKaKKOaOOLOO_ePLiKKKLKKLKKLOOKa--wN-ww--DBg5N-4latIyc-MYUfaRyCF066q1CJxa5X--5F6mF7z9BugfEUSrSArzxBefBeJcrrzbtzUzHmfUzzzttVX7X7XXX7XXX9--yKGGTsF-2mkw2k-3tQstjx4--BkdsV0DNK7PzGF-6B9ki-9tXkO_K_zznl-0RovXrc--OeZW-IRqTXoeXefUzzzxHYUyWzzzu9XZmZe7-1tmAWzJ-0nbeYV0DRxYTvG--2Dto7-0bYlJ-0nm6v-4DTdBTzyzvzvlJKJK4K-8wxJTrrrzrzOceXce9V-DTg9R-dnsbYExxryUzaeeceec-6bz2Lk-2o5Gnu-1u2YOv3-0oCyAV-iaLAUp--CCXRV2Db2oOOwzvnpKF-ppYW0bVVaOyUzzzrxpxpzPk-2eBMb-8xGoerUUxzry9Xce9XV2ydQ2OK_OjjnBwnJ--pC19-2uliNEyk" : 12 === fU.jJ ? bS = "JJAf25PfV-0nEiiuyywnyueuTbfevfvvjivivivjfvivviyvuuyEgzjjzzvviyvizvviuNziyvijvijfvyvgzvvvvfeuaeaLLeifdueuaeOd_LJGKJJKLdJJPKG5KPPuedePLLddOaeOeOKOOKJOK__LK_OLLOO_K34K04-F-2BkG0021Pifiddaedd_GK8OJ3__K4--B09eduPKLKJJK43G--aieyizvePde_aPPOd_3G-3JF3HOfiviyifeOaOdaO_HOJHeKLvdO_3331PaeQidvzePeaeKHudePPedaKKKKLK__-zBl4-kx3OHOeudaLPiaOdcwEePLOd_daueePduPOePaeeduaOdaJJJOJ_POddOaddedeedeLK8dOdLKdjziuieffiuiveiedOieifeuviviyviyvviyvvvzyeLeOdaK_JKJGK443K4KOOaKG3K8KKdddaOaOOOOKOLK_OOaO_aLO_aa___J2Bkn--nnnnwzEnnnC4LK8JKKKJK30-o-oGKGK4GJJG3K4J0HK_aK_K3FG4KaOdOOLKJJGGOPffeeQijjzivfiiueK33F3K3G43_KeiivvuueddJFFFFFF3JJGGaQfeveyvuuK444JF-F2-FGG3J43F3-Ew05OOK_eePaaaeeiufieveefevifiuuiuuideK_--33GG5dKauviiue__LLKGJMjjjjizjuffjjvedvjvyiiuvuvvvvieOaeedueeeaK0FF3GF30G3-OK_KKOKG003Fwzvzgl3FJJGK3CG3C4aJ-FOdKGKJG3JKK_K4OG0G3OaJGF2-0F--K230_F-2nzzvfw-FKFJKP_F-G000-G430-BG--l3GG-o2-o30-433G33J333-2vcB--F322B2-B22-kBn-3-22z--z-2-03K403G0--333FG330434FFFG333FFxT-2bhSxwTUzUMpopJpKrUUUUUUSxxrrrrMra7N-0bzKCKrSISrSrSrUMUUrSrrrrUxUrbpEUMMSrSrSrrrUzxrq56xICMKpKKK9fSrH_MIKSKCxppSJnBeemmcX7XX9mfJeHgeXhKCCCBgpHmnCCKA9YA9eeemmf9mgfABgmfBce9ece99AApqUzUUSxBfA9jrxzUMxpUUUrtzyUrxaUzUxrrMtsOzKIpSxBoeI9fBgf9mmmggmnBmgfBnpUqTOzzUzJprSSxttbzxS9jSKpKpCHxIKBhCCrSzUMMzxyUbaOtbaNNObbbbtzzzrtWaOtbaNOttzUrSrRUzbzUtza-150bcUq-99e9efBn9cX2BnIBemf9cXX9X7X0sN7779V9eWaY90Be0Wy7n9VX7ZccXXXe7Y9776zzUpprV5-UMMML5USpJoxTNNN0txr0WaUzaOaNUpT-770V0zKKMMyTOaObtzbzzzttyUbzzSWaOaUbbbrROa5OaUzzzzyUS5OyUtxzztzaT0ztzxrzzzzzrzzzOaOaObaUbtyUbzzzbztzzbtyUbztyOWaOsN--UpKSr6btba--NV10yOy5-NVVUxbyOWWWbrbbzbzUUUUSrTTP-0WWWbV-5Oa5-5N--0WWVNNN5550X-50WVOa0txUF-t8y_LOaaPadeeePeaOaPdeaePePdydd_uO_dePOaPTdQjFnvdyvyznzzyywnynvvjjizjfjji2ueePfivyvivivviyviivivziiuiiyvivjizjeivziivfffivvyyzjivivivfiivivvvBBo-zivgC-BoFFFFnzuuzil43EyzzijBFF22---nsn-n2w22EW2EykE2ns2EnEwwzzEjYyveKTyvvisEzp4J2zvgzvvvskB200FzvvzEjEEzfivvfeiyiieiifekyeaTePfeee_Lvijiyyvjjvyw3JJFnzskEwB2wzyyvuyevyyuvvjyijjud_aPPOd__OKJGPOdOOOGLaPaaiePPPeaaPKauaeOaK43G0-E-nzgBB-B2-k-kB-kkEBnC304PK5LOOKaK4KKGJFOGKKOK44G_KK_aOOOOOaeTee_OdafzfiuuvfzzjjeKOK8GdaKJJG3GK_KLJKKaeTefjizzgyzzivfeiijuuavfivijjjiefeeeeYzwzEyeyvivffiEBwzyuyBnzzjizffeaPeeaePPaaeffiudedvvueuQvjivfffeuifix3F33300-BF-21O_32FFBBB222BknBnznnEzEnzjzveueTuviueuffuyyyyyzjvvivjiveQidaaa_iaOdKOLKK8__OaKKF3009d__KOaKKOG3-kF33deeaeuiadePeefffeevfvf3BznzEvwnEzEzjvyi_KGLLPaaveuuidJKaKOdeusn2zzjyyffEyefjzujyeauPaebdeuieieeiePeeieieuiiffeeevfeuuuifeeOOOKOKOKK3C_LLLLLLLLLLKOOLK_____aKPJPJKKKJK4JOK4_GKGJJJJK43K43JJJG00003KGKKKKKGK_4JJJKJG3FFFG-F--3-30---F--F-F02BB---BBaOG2EC2yiivnB--2zjFG40-2-Bn3-B3-Bl32-BnBwnnBnEvnnzzvs03G3JG3K8OLK8_1K3GFF-K3G433G330-33FFG340403G33J3JGG4G3F3G3033G4-GG033GG33-30443G0-232-00-2---B2-B2BE2GLiaOOaJJ3303G0-FOGJ303G3OG2n03-BzEg-Eis---2-kkkB2--22wk2-BzuivV3BK2Fnzeefcl0-nEeik-wzuvoFzgzvsx-2-0-zg3JJG3G033G3G3G44GGJJG3333G3JK3-G4JG3G3JG0-G04JG3G03GG4433G3JK03--C043JG44443JLLKJGGKOKKGJGKaLKK3G44448KOOOaOaOauPOdLeaaazeKauuuedJ08aLJ_8aPPK8_LLOJJLKK_OLK_KLKK_KKK_OLK_O_aOaObzzjzzzvzyzjvjjuyvvveeyyyiyvjjvzjzzzyuUizyyzueujjjvzyiivzjiyyyvfjjjiyvvjjizzze_JJKJGGG43JGGGG03JJJGGK3JFGK4GGFFGGKGOFFF0JKKKK44GG3JFJJJ-04JFJ4GGJGKGK4KKKGKK4GKKK4KKKKPieQdJOK_aOO_LKKOdfzii_OK4G0OO__KKG9uuifvvyyvivYEiuavviuOOJG3G5aada_0-paPPdePaLLLPePeaaLOJLKTd_J-C443JLPizyuLKKaKTivzzK-nzzvvudeEuMuiuiffivyzjBEviuviyuvivvzjyzjjivvfjvfjffvjfivfiviyfyuuvviiyvvvvvieiwzjvizjzzijviiiiyzvyviffebfeTveueieuiuueeadddaPLdaPO___aO_aOLKOLaOOOKKOaO__K3KKGGKK43G4OOKGOLKK_O__GO_OGKGKJKK4K330OaOGK3G4K4GJJ3C43JKGJaaO_K43FG400--03G4OOLKKK443JJG00FF-nCK3L____GKOKJKK4JK4KKKJKJKGKOOOOK_OKKLKdKOaOKaO__OLLLKOOaLLKaOddOOKOGKKGK3KJKG448PKKGKK4GJK4GJJKK8aPaaQiviviuvjjzzjuKKKKKOOGKOLK_TivzvudOKK44OJJKJKKGKK_4FBz3GKGPiuyaLJK4K4GG304KO_GG4KOaOOaLLaaLOaJaaauaeePLaayzzzwzzzzzyuPLOaOOaiiuveu_aijEjeOPPLKPaiuvevYvEeOGKKKJdJ3-k3303LaevfePOKHPjyiyiik2zEiuiijyvizviededaLK8TyvuedeinnyejvfuaPOOJJHLeQgzzvjzzvEzzvnyzy__d_KTddKGKGKOKLLMvzzj2EzzyEvuPPvYBBn-nyzzvvefvziknyyjfdbiuddfjfivjvizvyvvnnnznvnEzzjeBn-Fkn2-B--kknvzvzzjzjvvyvjiyvviyvjyyvjfiiviiiivijiyyvvyEEnzyEEyznzzyEEwwwEEvgnB2BwnBnwBwEBwnzEzyjjjjijvvh3FzivenEjvBnBoG2znwnnBnEiyuveePuOaaLLLOaOauuuuuueda_aQedaPPfiviieeeaPPeeeuueuV1sEsYnICCWaOX-A2Djiew0-1sTHxmoxqUs7X-E2rdDKTv2k-T7vOx9zbac-oJG2uvnFJ-H9UMRn5N-oKUiyjVoJ-HA2lxTNc3gMUxtOOOLKOOKK8KTjznnzznwnznBF1NuDlpS6w177-BUJYv--00C4V0m2fUiVF-03C1V1mBTb_UzF-9H1uSP-2mOCruPsBF-3_SbzUP7--A9Uw--OX9c-BobJvF-0eUxV-2LGE-2b7RzC0V0nZFnil--8odfk--uxRk-OuzUyV1Is4tdj--0bkCEF-6EeL6jG-5bpJQAEbaV2IxB8_QjV-0OzS4pMVX-6EwNrjG--c-bQ-9J2KYdeaeedzY3F2----5VPpx--_0YCvf3F-12_CV1o6LCaeB---Vy4s-K15tuR-0cH3EP-AFalyPf--0e55nrM0X7-S27pux3-aWsZUMKlVX1--GLvZ--Y1Ac-K74MuB-3d06bzP9-CHYRaMekB-0dKyEP-8I9NDvoF-1aXND--Ihqo-5bYjjc-0EccF-1Vu9V7K29M_OLMfgznEB4-IfrEMASpSUSq-7-Nee-ANaSDyx3F0A69npL---5gz4-4hcoEEr-V0hnXluPePzB2-G-2vgnOppIBlzbV-X7-hrg5tinF-5kFunMrXX-6N7gW_aezjYB-G3-00N173L3LdOduivfdiiuvi04---32Bl4K-0wFQ-rMy1XV1sbFlfnCJ164IlRgxKzrzxxxzUyXXXXXXXXX7--Xt-w-r4m1wxxxzse9Xc0iBe2OKaQvnsw0-0wObdmxrN-V-ssA2x-NloQnIKUr6xR0WaNgmVccV7NuMUaivyzEl3K4K-8m2rMAMzq-XV2t7IEvinJJ--HLqL--Zk4Z-Q8XXwgttu0GZmlybvjfjfeffizwznk04GG34JJGG4F-09Gfs15JrEOddacysn-B0-0RdjOpSV9-0_IU5-2mqMIBtV-ORQlk0BiqgxTc--8TzC-AmzgMrUzuBeXV05NGjtMzsnK0on4Xn9nA9fET6rSzprSxpprMKrJxSrSxbr6zSKMSSKMrMS6rTN-999X7V-1-50Vc719e7XXX7cX79--V7Xc-aODYuu--8wnsHopI9YCCRP-UpKSErxru-719--P-5aOzGOO_KKaPivjsnBnye__biyvvywno-0-G00-KF0woW-ppL1-V2Om28efk3F0BwpPnRNWutw68_OadKK3LaPOaOKadyviefjiuvifeiedaOaPeiuiaejjuun-2-2zyyevffeueuTeaTun--nB2knyziievfeuyijVoFG--2B3-0-o-3F--F3--F-zuvjjjiudfgnnzyn3FF2POG3G-B-044-34GFF3G3G3K43JJJFFG3GJ0AGPRghSSSr5UX77X700dGV5KLveufdaPiyBnBl--kl3GF5SBr6mpUzrUMSxsXe77X7X-2uSYzezx3K-Bovu6Uxpz-XXe-1PW82bsl-4p3V2ALOc3acdcuudaLPPPffevvwz--33F-kF33-EKrYCq9-devwqeyuuvfC3B3GF0F0xNEYopzV7V1PkcrfwJ0SpZObBgefKpHmeY9egegghpJgnBqTUTUUxSaUxzKUUblVObsP197V50ba6yT5TUceXeVLunIfdi_3HPOQzvjBzgzyvYyv3FGKKK3OF2--hQSWr1--f_Xg-UMKDRgxlWV05jJ-tiix-G-6pwPQBoTNP-Cg4lTeEBG--L5bP-MgHJ6iiykoGGF-xXN4nq--Lll-OU-6qEHEBntbe-GgaXLadYBl-4SZqqmplzSrtyTHXXXXc2qmSotPQjfePOeygkBkFl3J223-EOffgpV-Ygv4LObgnvnBzK_KF-Cbaxk05oR6tyEjJJ-7qY_zAAEbbc-5ocqR-fPfaxCBxa0aV-1pO9k0CfPzzT9VfQPtE_Pzie_dPbyjfvjeeeeuieufviyBkBnByg-0333FFF_LK03-kF--Bo03_4J-2QQGB02hngiQfffeudeEYnyBl04-033GK-1qydETc0asUMtaOsnnECJ-bRXYBgpqUV1-UiGJaKaPfezB2---4rA7vMGX--1wG8F1xtkgolzOyHe9--jHPo-ITixgjbc-qxqDOLRzk-QTvNhITNX-0jWb6-2rnnYM1--Quvxk2hxXonKKpsOX915-6jgl5Mn05rrKrBxomfJeenIBn9V-OaT3nBc7KK9nprSzrrTX6tV0bttzVOV1-0jljM-Is4hYAA9nDUqTOztce-Ake5iQYBF-y5UNoT7-b2rnPNn--59HTV-BKqG-2siNISX--RTmWk3DEtjn9mnAACrzzzVIRaQd_OLOOdaauaefEBnBzw-nBBkk4J-6_RRwNIMAmVPdeOeuTyzyzvjvvyzjyzivjiziudiyzynyzzzzvzzvzynzvzjwn--laK3OK_KKF--C4KKK3GGJKJFGKGJK4_KKKGG-J3E45KK443O_G--yQ5WzNc1rCYKvyijzeUvBG4JG43F0TQYbxRNc-GnlXTijnKG--5V1qV-x1Jxc--uDnn-6S8wKaPedvn-FFB-zea6RfESrSq7-WX-6pPVqNx-dun9rIIKMSrSrSxxBzbts7XeX97XX7N---2MXGF3ilDMnrSppGa50VeXcHjS0jOLKO_LOaK_K_K_LKK_JKK4K4KGPedaOK44KOPaK_3aefffeTzivizzzyuvkBzwzszEEnwnn-nzyzwzv03G00-B2EzBEBwzBwnEE2-ow4SEIJmcccxxrUJnBonSrrztzyTOts-9X7VX7X9-YvBN2wwwwzvvjjzzk0zOXTUyUxzV" : 13 === fU.jJ ? bS = "C0DX0NP1V--QqeadnzzjynEEzzjjivdivfezjj2BBwzwnEzzzzzEjnnvYBBBBEBnzz-UV-hflzUUSrrUzSxSxzk0a1-V50K-0pMiudevf-zvfeBnyviVF-F33-yzgp3bVV02IKUrHnUzzpHz5UzUzSKrUrzbyNN-OzzxzUUUSrSrrrtzttzWaOaTUzSxxaOaOxrKBnCSKCIMSKKKKIBpIJoonIJopCJpJpCCCBnBggeXn9eccc9X7geXXn9efHfBnABemcXX9eece7XHXeXecegeeVV1ee9eX9ecc70eXcXe9enA9fAABnBnJpMKpKJnBnHmmeeXX7X7cceXXce9eeccXVVVV-VeXe97Xcee9f9eXeXXXXceWVWBc29cX7V-6aOaTOWWV-1XX17-NOtWaNVnBn97X-7cf9mmnBemXgece9I9eXXomgeh9eX99eeeemf9BmmeHgeeegfBggmnHoeABeggnIBggeeeecVI9eeemeXe7cX1-ZmfIKCCIJooonIIBnAAAA9mmgnIIBnBpKCBnCCCKKKMSKJoonIBohBmnABnCABfA9gd9mhBopCIJonABgmnJopCCKJpBnBnBnCJnCCCJnKBoggpIKCKJ-UMSGxrMMKKIIISrKpSKKKKJopCIIKKKCCCBnIBjSrSSpKppqUI9cpKIKrrrKSzyUpKpMxS5UKxMSrSxxxpSrSKpIrHxrSMSzHfrxxzUUUSxrSrSxxxrSrrSrSrrrrrrUUxryOtttzbttyUzzbtzzUzzxzzUxzrTTTTUbyTTTTTUbbxy0byUtzyUzyUzzzzxzrrSrSSSppSSMrRN-OxpSMztzbzzzVUrLUSpprUtxKbxBfrSKJpKKJonICppKHnKKJoopKISppSrMKrSrrUSSpxxMSxprUSMMSSpKMSttzzI9f9hMMMSrKSMKpprKKHnCSSKpMMSSrKKKKKCIIC9gnJonBpKAKJpJpBpKBnCpMKKCKCKpKSSSrSrMMMMKrMSSMKSSSprMMMpUKppSJpKKKKMKSSppIMIpKKMSKSpKMSSSprMrSrMMSSrKppMMKSSMSSSSSprSMKKSKBmgprSSppSIMzxCUzprMUyTObbyUzzzaOaUzzzUtzzzUUqOaUxy0bzzzbbtaTOaTOaOaObaOa5OWbaOtWaOWa555555NNOWaOaObaOa57-6WV0WWV--O97VWWWaObbbtyTUttyTOaNNNHV0V-N---9-V-777579775-0taTOaOaObyNOa5OaOWbbaTTTTTUztWbbbaOVOWaOa5-5N-7X--V-517T7---7-Wa0V-X7ccX7-7-77VV-5-7-5N17X7XV-0VN5-N5TNNNNN50aN-5Oza5OaOtsOWWaOWaOWaOaOaOaOaObaOaObaTTTOtbaTOtaOaOWaOaOaNOaOWWWaNOa5NNNN5-Oa5NN0WaT550WaNNN--N0aN7--0WcefIBf9en9geecmmf9eAAABgee9egfBgmeee7cX7X777cce5TTT-VVX1cX1c7197X977X7Xe79eX15hHX11717-7-V-V71177VXX7X7ce-V-1-1-----117--cXX77ce1-VVV-0u7X777117771177V771-717VV-977X77VVV-7X-OWxpSSMSrMKMSSrSrSy5150WV0V5OzJpKCKCCUzSrSSSrKrSprMKprpMUMMMpKKSpzSxxrUMSSMKpppSCKKSMISMSrMMUUrrSrUKSSpppMpSSSpxrrSKrSpSMKKJhSMKppKKppSKKSSprxtzaUTObbaObzzzbyUby5OtzrtzWsObbbtzttbtztzaTTUs-o-9SuvkpF---4GN0--Akuevkk-0Z-5DzUUzzUMMSrUUrrxzzV0k24nbEF-72uPs-31lfR-X0zvBgpOsN---Fjh-1VahUR-033plvivC44-bVp12CUzzrxpztzzzy2A979eeXd9eXXVGkPch_OLJKKa_OLujjznwwkzo-Eno-q32WRrMKpkV7-V--7jXk2-IvW9e-7xySpV2kZ-vaazk0-HWAOjKHprsWxta7ccV2FavYivl3F2cIsAppKMwN117X-81g-ifoF-L4N9UrkcVDFfPz___bjvjjEB3ByvEGJKK--WQlvV0kn8QjoF0NPnGrScX-E2V6yPuEF3-D6-ISGX-42b3rh-0NYH_ooy-3P8eEOJFGGIB-B-0-2043LaPdaeeiZ30003G002j-03-JGFGJ-4K-03G-3303330NBzB-UzzB3DvzuzByyfiivieivifevefjzyw-D9vlxqX-A58vaOYw-07nF-rFPV4lbM4aaabBn3B-mC6fBmmjSOa5N-25o35o--CiYN-gQSZPTw0--2QiX--66YJ-9FT6CN-BHQ8jadHQyddcyvG2232-F-8Hr8k--dcfk6dIezn9YpIBhC5Oa6y5UrWZmX70C2JVtUzzp4J-mXEjworrq557e-6IQmyv4--dmmEV-JuCMk-9SVlk3KDxRuPiueObi_JGTyycnBk--4-BF-eicPos02KqRDLPefeTiuiviuk-K33F-----6f9qfBnUWV-jMD3iO_aOaPOiwBnBnn--0evOEn5U5c1_T5ktLKKGTvjzzYp-w0Rg9s6ABmeWBmghJonKxCIKIKKSKWa6zzro5Uxltbe9e5OtVOWaN-N6w6y2ABcX17cXV-SWU2PBo-alHDReopsOa-OOYdiPPPgnE00--BsPu--Oo5J-5oKjx-AxeUxtaeeTeeffeuePauuvivijfieiivePgyvvC000000-3-3G35JG-2BF0-30-2FFFF--3hlWISD1-ER5o5evV0-0eu7_RjSSprzrSrcX7X7X7X--6KDt-HirDjBnBnKMba5551-3rQbzaaEBnpFJAmhxnKSSSSKKKKonIKKpKpMKrSKIr5UrNV79V1----V55N-1V1-7-7-X79-IUBriLagwC2-3jm7YKkV7jUvJLaLMeudeP_LPK3PfeaLeaa_F8aaLLOaO__KHdOK8__KeePOdaaieeeiiefifeeddddaaPadOPePPeeiiveueaeeivfeiuyzjvvizEBwwwzzEE2-kkBB2-2-kB-2-B222-B-k22-BB2-B-BB222-k-kF-B22Bk0-F32nyevg220-FF-0--0-F003G-G0-Cl0ab9eefxzzba-AX5ODuklF2RKFUonyUUaPXeV9sgwrddaLaPNn2BnEE0F3RULpn9opxbbbtXVe-Y_1riO_LKfvEink--0BfCIpy1V" : 14 === fU.jJ ? bS = "EcA20EP9t--46idaPadePOddiaeuuuebieeiiivuO_aRnufezijzzvzjvfuuPKJFJGG3GPKGPOaTiiiedaduus2EYuiedn2nyffdv32--0202EzeRwoG--Ezzjevck20202zeufik43BFBFK0G4-0_J--nyioC03-0002-n22wyddyjfzven3Eyv3JJ20-zynnEyjnnvjizjjejzyy_wznnBn2zvnzyvzBl3GG3G--23FFo0-wzBB8m--ZISrMUUSpzrxxrKrrSKpppKKIACBnAA9mmgfBcee9cXef9geeeXVf9999199ge17V7Hgce7c15ABee99eeXegegegfBgfA9mgomeecXcXgeXceXnBrxSxxzHecefAUUJceccgce0AxBeXXXeceY9nTUJgoepCJnzzzxIBfrMpIJmnpHmc58EJmnrSbrMrUKJnIKxrHgrUzrxKCbtzprzxKISpxzU5Ulzq0a-NOzzxxzSxrprSSpxxrzrtztyUtaOaTObzxpxrUyObaOxMKBn9pMKICCKSKIKKCMKCACBpCACBonIJnKIHhKBpKBpBonCBmnHmgeme1ggeeeX17Xc7VY9e7emdBe97gfBfBfBfBf9e7X7cXeXc19eX-ecXceX9Vf9cee7V-P1e9cecX7e9X7X-0XcX7c97e9V0--O6glDk-BjnBnJpKKMSKrrMSSpSSrxMrSSrMKMprSKzUzzSI9cmgonCKIJppI9YKCKCKKSKKSMMrrUzzzUSMSrUUUSzrzUzryUaUyUyUbxlzzs7-V15X----V---NNccX-ccc0y10WeeeeV--70V6xUztWxMSzbbc6xta11cX9X7V7-X-eHeggnCISpKHX1V1X-7-Oa-N5Xe98HeVVVeeV0X9711-3--XjabvBG-0s7nSrxGc9-BFOunededziszBzG0-G-KF2NDz6rSzzu9d99-0FVIObk153LiReenAUbbxzxzrpxq--e9e9e-A1JTaukCF07J23pq7---cVM--WN3QV1khy_awxF-H4kIRjyV-oCGnvjx3J-16-Ny-U2iSDjyffv33G4F-CWtG2GxSUlV79e--2nbB--6j1s0REhiviizkJG4-4X-vYML77-ZHJ3Pv3-1cZeNponGtV-V4lDIreOiuBl-3-DAESjT9-r4cgTLLKKOaQjzyvgn3FBEB--1pnH-E4zQyafnG--5BKbgN-3Oxws0iCDazIKxKMMIr5OVX1V7759-05hoa-4YPwIzTXc0oS4-OaOaanwnB0-qYoDA9pIrzxzpzpKzzzzUzrWVf9cP1ceceVemcc7cV0H9uMvF-eGU9USSbuX975JYvsOLKOKKK4OaLJKPueTzjEzjzBn2zj3-Bnwn-B_HnzBpIzyNX7V1mi7bfz3J09L-pSKKCSrs5P7VX7-YBjWieueuusF-F03-0dhx_nILN-03vANuaQYl---6b56-jf6VcBknBBn-Bk2BnEBkBkn-BnBkBw-----n2Bk------kn04GKKKaOaO__KKKPLOKLKGKKLKaKKKKKLLKaOOLGKKK3KaKLKOaKaOKKKG3G43G3J33F3G4G4JGznnE2--G-G3334L33G43J-33JG3KG303F433GK3K3GKG3G3k3GKOffaF--GG-FG3---F-3I-3F0-0303F40GGG-G03GG4FF0--FF2-----0---k-G-F3--04343G-G3KG030-0-Gk-2DwkG43F3G0-30-F3F30-00-G30-0-F-3--G33I--03FG3303F3-I0--3F-nDtfefeuvfideeviivfiuviuzwn--B2BBB22--wn9PeLeeLeaPOfjzyvuiveuifhfifiivevefffjiafjiuifeypeeeiivejEivjiivijfiuieiiueuieeeeeafieeeujvifffiuzziviuzivieifiififPivfeifivPvyvijviefivevevafieeaOeueevfeeveeeuiufiaeefifivizizzwmznEzzBnEzBnBnznEzzzzwzwEzwnBnEnAyzzBzzBn-nEnBznEwzzwnBnzzEEzBznnnBznEk--22B2zkzwnnwnzznBnnEzzzmvwEEBkBk-B2znEzEznBn--kBnBEnzBzzw---4--2-n-RB2Dvfzn0n-kB2BnB2nBknBBB2-n-3-KK3JG0304-G43GLJJK_K4JJJKJG3F43G03F3-Fk3-3-k--FLOadeOaOaOOaPOada__aOe_LPaPOK_KOGGKKKKOaOKKJG-K3Gk--nB-FF-3Rk-JGGKaPPeaPPeuieW00-FF3G3FFF--2-J0-GJ43G3JG-0KK2-3G3G-3F0-3G00-F4N2znB-3jEzzBk-ivzzfjEBAzievivivieevivueiuiuufivzzzvivzuivivjvyvzejvjwzzvyvzwnnBzn_ejEBzzEB2-LOKOaMBBzzBnzwzizieveefifieizzzvyzzznyyvzznvjEzzwzBijzjyzznDzzwnnEyznzznEnEEw2yajzDjwBvnznEnzkzEznivvheejwzjefievveyzByvnmeziuvfiyvyzjnzjBwnkzaeO_PO_dLLG4PPvjivjivjiuviyviyzjwzwnE2zBnBnB2-k--4222BzEOOaeiejxPeeuuuuqeuaeeuuefifefefeeffeuuifeveffeueiieuvfiiveufiivvfeuuiuffieeuufuffieyvjiyfeveiuiffifefieevuiivfjivvjwwnBn2BB--BBnnBwn--2-k2BBwzE---0--0B3F-k2-kBB--k---JF-3B---3F03-k2--wkzEn2-B2wEEE2Bn0BB0-kknBkwE-kk22--eUSCSJrLT7V71K0YLtevvyl3KFzwGJ-DWcRRqP-hG7KyLafizivwwG03G0F-acjpSSKy-VX-IJltLePvV---PeSVrBgmoxprMRTTOa77X77-0N3vk7eoElnII93nzSKBooUSX0aNX0a5V-1pfNUugBJ-9iOdUNV-4v1z-Sfs-zBgmX8MKAxy5NOzKbse7V-0U-Fk-1y-lV-4x-6--g6bj-3L4kbaTYn2J-apmECIJlaN--MR8FTPQYEwpGF-2W9GV-62Hz-7i5cMKKGV---y2dwQvz4K-NgIMwmnUzJopKCCKKIJnKKpKSKKSKMKrMMbrWbWtaT6a550VN---X157cV-VX77VVX7ce7V-nZT45OKJLLPzjzzBz2wLJF0I80TwpCpzpOWa5P7eeV-9fnj-3pOZ6JOX-2f5dcs" : 15 === fU.jJ ? bS = "CoE-7lR-YWRa2AEJenMxJpbqTObaOBcX5NeW_xnVto5UUzzrzUrtxtxrMKMUSSyN1XXV5NNOtaUUxzztzUxxpUSIBpSSyNN1aUrSpCCIJpKs50WVNN--7N6bbzrzxzrrpSMMSSMSzs9X7-X-VVVX99ccVVDUV19D--998a6rztVXaOV1771-78VN0V0V-7V---YV7Xh17XOWWV0V6pTOs-8V7XXpCF5-N-N-N-N0VObSxrSrSUyN-aNOsObrxMABnKUaUs-V1-N5NUzrxUWbzUSxprzCKHenMtzKoopSSSzzxxrMCJmnABegmXOs1ABmnCSKCKIC77gcepzSKBe9XfKrHh9eprxmnKMKLmehKCUrSrII7XnMUSxrUSIMpIABpryURpMbtxrrSrMUWtbzSnKKABgnAAKUxztrMUxrsObWtWzzUttraOtbUtbbVefaOrxxpStySStzVXaNTNN5SJhSry1zzSgmpSM9mmgofKpxryU_rUSxrPXmhMQIKSxrUrrxSxrprKLpMa-2V7Va-OV1XXAI97ee9m8a6TNSxSzzrtyTStbtzyUbzzbtztzzzyObaNObaOyUtzzaOttyUMy-f_zztztztzzxxrSopKprKKMSzrzzxzztttyOtaOaOZnBnBmn9mmmpMzbbzWaTOta5UyObtV9eg7XnBNN-7-ObrTUzztaOaOaOaNOa555-4KCCCBnIBnBnBnBpzzSzzxzba-7--6WV-1--771-VV------71-----NN-5---OaTOaNN---0WWWaNN56bzzbbaTTTTUCKSSprrSrMrrSMKpKSUUrSxzzzttaTNOaOVN---VV--X--1N0WVN5-7-0aN79enKBmVX9e9177-X770Ws7VX-WbVccOa-7OtzaUzy1WbyObaMxyN6UV4rUUy4zzaOaMWxyOzrzxrrTOzUUUrztzUzzzzzaNN--770aSSSztV-6rxzbbs5-NOUzzyMxzUxzV-1X9777e9gf9ege997VX7X9X71MMrV-V75-gnAHommmgf9emem9eefBmenA1AHmmfCC9h9m91AIHegn9emnAABnIBmV1mmegon9f9mXenI9fbV1ge7tzV--cgoon99gc0s76tV99nCLo1977Ebs50Vf-AKJcc-1fMMKr9c7-Aa-1mpBme9c-5OWWV-XV-50a0VVUV---1N18xy11--V1717V-0a0VV117V7-0VcWaN7Oa6aNN--OVV0SrWyUxzVe8UxyNN7X2bVSMVN50bbzWVXhH7aNTSraTObbWV0Us0WVOaN55OaOaOV5-OsND0tbzaUrrtVXX6rrV-X91V0V-N-V7X17X99f17X1XXeemXcgeA9hBce17XpA17fKKCK9e97hSrSHpomf9ABpSxHpKIKHhHhIJhMUhKnKUrKKyICCBnABpAAJpKBnIICA9opBme9hC9nCKQ97-XhJmfIKBhJoXA9empmpHhMTehICIBehIKSRkgomfKQ1971hKxQBpprSghCCJonCKKqpMSpBX17XhSnBopKSgpKopnKpIJpKSppIJprSzzKMTTTUQKMrKrrps5-KpUKKSSpMppSSKrrKMI9fBnBpHnK779nAMrSxzwonBmXXppQAI9fCLmhBop-s1-WV1hKBAJpBofBegp9mefKrpqfABfKzbpIAKMKHpKKBpIBpqmpKKKRnABooppKpLmnKJpCBpKABoonIIJpBpBnIHVX9e9f7ceeceegpSRe7f9mmonCJpKSpSQIIHn99cXee9mgf9Xce97V-5OV511711-V--7X1--MrSTT--VcNUUWV-7971--X77c1-VV-V1---AJXN--N5-7eYWs17Wa---cXcWs2aOVgc1ca0tVVD---V0V--55-1eX7X511V-8V5-ge9pMKpKJoepIIBmegXc-fCBmgfCIABfIBogmnAC1gnBnBfAABgm99ggefBXXccXf7VXe9XX6ba-XXX7c91X7VV7X1VV1-D0s55--6USrMSMSrWWbzs1menB1N7VUsN----2bVemACUSKKBk-VVfICKSpg9777--7hCSJpC-----bsN-OaOa56rJnIKT0a5SrtaUs99150zy50ty-55ObaOzbopHpMWa555Uzs9ef79gf9eopBcgnKRkAJomVa0V1da5-gnIBmWVVVWWzV-VXAMLkVVXNOVza-1hRmVNEtSrrpMSy17VTN1mgX7X2yN56zrMTUtztzSxzMrStbtyMxSppKST-V-UTUraUy1Xe-OaN9nHpKLegA9a1ccX1nIBcXXXcXcefA9gX7VVzs9XVbzyUVef-Obzs91UV-e9WWaUWaUzrUSrUrpzzUUrsUrs7efB999e971ceXX9ec7c4rMyTN11X-SprMMMbVcYa4xzzrIMpry1X-V19ge-zza5OzMUUUKpKps1-1OyTSzKMKnIKKSy1V0WxzT19XX-V-Xcf7gekcaUby19f9mdtyMtbzxtzSrWUzrSyOzzbrtrV9gXf1me-eecaTMs7cX8aTTMxSrMtrxtzrKKs--VXDOxSSSSCMUy-XUs7gV97V6tV6xprV7tVA8ySrVEzzxRopzbVXOVaUzbtzKopxRpMrV5StxzrzUV7TOVgiOtbaUzba-emVOtbaTObtbzbztbs9emgf9fBggf9mnAKRpgmmn9mmn9egge1-0ttV9mmme6a-iUbbzaOV7NSs5O_s8baNUVaMT0brs54SMMUICMaNOzzMsD1eeccXUSs8WVObttVVgfAIV71g7XmkXtaT2rxrSryOyMsAxs8a5UKtWWxpKztyObWs1mmon9Yy-X7N9on8V5OWVaNMMSrStVXVcV0WaST-aN55OVfABda6bUthMSrT17XN1fVU_ttzyUwprs2zzbWa6s1eopAA99eef9ttbyN9gcX0y-VDMptzs9cdV6s8WvKy0zy171OsUxT0V2brBpMs8s51kTTUxzxzxxrV17es1mfA-egeiTTOtV55OtttppSzUMV199-8bbrUVcAtSrs7XX7gnBnA9eTOs1cT5T2WxRpzbtyN9bs9ABkYWbbaShMsOWt_QMIKKxzT18VXTTUT-1hPecVOUVbaUzUU_rSSUVVX8tzzUT-ce9f9VemeeABfB8a5UzbWWWzzbbs6tSrVVWxrV79f755OWtyUs1-0aN-OUKMpry-c17aOzWUIMKprUUIMa-1X918V770aTObyUxIKSIJpCUVNN5--sNOMVN56_pKCJpSJoonKMVNNOa---OVsOptaKMT55NNUrKxxrMMT11115N7s9kc9V9VttMT0UTNO_xU_nJpUs7NUSzzSKKUMUts1e1T-c5TOVNOaOaUy2V50_zSUVX119X7USxs7--OzSCUbbKSzsUxRnCBnCCBnKrCIKJnIKM_pUVN5NN-7T50a5OWV0aNNNOWWxKKMBnAMxpIKKIMaSxs1X6rV-D6V-sT-UUVX1e9Os7zy-5SMUTOtpKySqpCBoe9nCTURnBpyOt_oonBnKttU_zV7a-5-tWWWtxxrqpKTOttSMsOrSxhBpT6bxSxrtUUIKAA9nHpHnBgeecf1ee9XnMxzxrUzUQCUxSs6SompyMs-0rSTUxtTMzzrrrUV1-sSxs777UrrrUMUtzUpMJn9e9ee-VhKgnMzUrynKtWzrzzzUxJpSKJnACKKs0Wba0V--UTOxyUrxzxyUxs-xyUrxzrUzprzUrpzUrrUrSyMrUSrrSUUUSxUaSfMT6xrSzrUrUUby18SrSrxrUpMUTNSUUzSSKSMSrMKhSzTKSpMLpMCSCCJopCIJpJonBonIIHnABggnBnA9nBf9geeg9ecce9cf1e9mm9mecf1eeece9X7cXXfBn97V9eA9cX7XfMQB97cX9997VV7ceXXnKSxxpSKxSxzQMUtxxhUr9Xs1AJmhUzUUSzzKSz1hUU_Sz_xrrSzUMUKrSxprqnH19pSKSpBpQABhMrKSxrKSzMBpxrppIMygpSrBopryKpzKy0nMMzba0rrUMStUSpSrMryMrxzbyUUMUty5-Ortbs78V77X77--Xe79pHfBg997X7X7X77ce-X7-zTOa0VV75TUUzUrrxSrrUrzzwfACKrsObs6TSz_zxrzxrrrtVN5Sy-4W_BQCq0c--5XUc-X5rCBxMa7PVDNUK-nSJp971_ESHe-mocmeKzxIIOxttzsTT-Ota0ee-057TlBpMMMlsOV7Xe---Z41V6NZVgpBmXJgnKMpr6WaNT0c7--3XZyYK57-DXainASrrUs-cXc0D9q9BhrKpMy6e7VHVV-19qEB--1him-7XjEvIohy--0DA35ggnKEGzTOs90X7-DANdhT7-7Xt_vISba9c11AoEBnACBxrSxSa0Wbba7ZmcWXV0Nl-LpUX7--232P--Y4hn-1NmHcmmnUy5--yBtECSKpGaNP197-0YF0nN-QYKBvKofomhMUtzba-1WcBcV17r9ZnpzsX9-4YWUUKaNc-1DHqB03YaRQJjHc9K9Mp9XmrHhrJhromghUxoOVT5OzMxtV5VNT--7VBc--DVec-5DXQxV-9EWOSk-7cyKynBpBnABoopJ5OaTT5NOs-OcVH7zjtnSIAHcgnCBomn9gjzUxrxCBeo6yT5Uc5Wzxru-e-Wy0s0aPc-39Fz7gpKSBcCHgcWggnIpRObztbxHggpoehryP6tbaT-VN-17---ZFFrV-t3OTpa7--GJ2c--GJFN-5GL3xc-9GPigq-T84fLpBpAMHpSBfACoemeoefCACAJrzttaUM5TUa5TUIErr0WWxOtWaOzyNNNN77977KACKBnAC90aTN1VN-7c-eGPvhSrq0ceV-1GRaD-9ZO8jSpKF--7--ZPZE--O6VKyV1O6qJppObVXc-aHHGgonUbVV-1ZZurAs1XHQCRnMzMppopDOVNWbttbYBec3mgce---HWfN-LHY8SS5X--09ahV-tAuEpN--TI4hxDUT7c-PI_QzrqXX-3ZxNzHzV--ZyYEV0dEl0pKsV---J06s--J71N--J8is--JDws-5JFcRs--JKrN0iJQsgnonCCL6xba6yOWXe9e--_6BUV2dHDArSUrz1XXX9-E_ADrICMKoN176X--0I2AV58JkgmgfIIICCTOaT0wNN--PKIxzUTcc-3_KPjIqV-1_MDbCV0yKYtSHpIpCSKHZlzLNV-10V55--5Kcizc-9KeMwq--0MPIV-dMpxrc--_Ul6V0OMzAnSN7-O_Wd6ppSppKMwNP-7X97V7-F_Zn6CzUrMOX9Xc7--_a82V-0OcIV-8OxHk--LW2N-DLaXxTX--4fBH-2_fwzLPV-0QFUV3OQn6xKMSxy0X-ee7-F_tjEBemhT6zzP7N-1_yrzR71uMvlwxIBemeefSu6zp9zTOzq-5TUxxWc9A97-9N1TU5V-0Va0V-8W-ps--NFDs--NFLN0aNK0UKptxxxrUNXXX9997V-DOBAzTX-2aJfQBy--0a2hV-0a3SV08aU0zT9V-taUEntc-5OtESV-eP2MzUSk6e9c-XPIwxMSN7VV-ddFArc-7aafrpUq-e7-TPquRnTTNc-mPxXxrrKlcVV9-3amCbSkV--5oXa-Gat6zSSzrUR7X7ec7-HQgPwxu7-9R1zzP-1tkzEmgj6zzXc-2b3DrLP--Ol2rq-78lqzrHegrzzzKEUTN6seVNcgeX-kbAFvBghCIKIIBpBognIJpMKSSxUSrSSxUrpK--0ogPV0OpIUnBOs-SbSprpUSI9jxa6aPeWzz5XeeV-PSyVwpEsV-CbXszKCCGWbsV7-0bZmzN--bbTv--0uTlV08uUInDTV-OulbqV1tuqQnCMF-5Ue-2bh7jJP--0vJ6V-0vjlV-OwCMqV-OwVCw-0twdKojFTNV3dwdbnUSMzs-PCA91V-HUDFBraV-5UKsSc-DUR5ByP--6rqa-2bsubMc--tyOApa7-yUdojJmnIqOtWV9--bxunV-0zWdVAOzeUnxBmfrrICrUUUUrpHzWVcWX1175X-Xc--UzJs-9VELhk--e0DGpX-2c8yvE5V0P1YAmzTX-Fc9eEBhHgn5Uta5N-OcBY6pSrIAUJgTOa-09We7-GcENbMSppzye9777c-9VzggtV-94IUs-9WO6SNV-95_ss-DWdaSDP-mcR2MBoggxrpUzzKSEzxUqUyX9ecWaNVe79V79c--WkEs-9WoBzNV2u6I8rMJpGaOV7Xc-9WxeRyV197X5onrsN9-1cXrMEc-uXElzMKM575NHe-09AHrpNP--1AZrV-eBC4rX--7ndq-4coH6ETP70HYKWxSMOxxc9XWbkd9V-9Edzk-HZ0xhyPc09Z7pBmpSxpy5O9V79--82Ca--86Zu-2dAgzUcV-PI-Bq--eIQcrX-1dKuADN-H_k1UrXc-9_qWSsV8uMPGmzMTNUUUSEMSxxze7e71c-XHee7-Ha0vzScV--aLfs01aO1woxIC6a-0tuc-DaUtSq7-6dh56pM0X7-7dp2zMSR-X--abWegmjUOWc-EdszfAKSzV5UNe9V1PUQ2nABUzc7-5by5U---cAvN--cHps-5cLGhV-DcONzR7--98tL-4e9eMrR7V-HciUxpX7-udBoSJfErlbuVX-29aVfmxIpGa7P--DdjHRtu-6eW7EKSN11--9XeD-jeZFrBfCpCSxpSrzJ5TUcOzaOXfBh9X9X--1c-1eGYR-5efWrCracV-1fXrV-ufyWxkV-ufAyBoeezUrzV-V-ugwopa7--fJNN-LfPwSpkVV-9iyzs--fqes-ifsnRxzxyXecV0ejZ8nMbe7-9ftmzP-FujbporSIzSpMUISCxzx-VUzrrTc6zy7Xh9ecVWuXX-7mcVHe1--ejc_xc-3ezMzK51-4ezOMKGV7-1g-Dw-Rf-nQAA9gnpMtzzzbttXXX7e-1f-oITV-agD2xzola9X-Ff2bjASrxSr-97VV-4f47MJyP7-9gJYUP--9lWRs-qg_aBfJxrzs117--gavs-PghqUKGX---fCFz-09nVOpqV--9njxk--gyON-Dh4IxL7-2fGYEENV-1ob8V-upTOpa7--hVws-XhbrSpLOcXV1eqiCpKR0yX7--9qk6k-PhjSS9c6y-7fR-rUrR7Xc-ehsTBgrqUscc-PiJ1hASaV-bfaA6AI9MMMHhzpUbzOyOz1X97-1ge7V-1tzIV1uu69nCrtwP-e-9ffCUprUkVXc-5fgVYCM5-V-9vpss-5jH-E--HjT-wxu--XjYHx9xSVN-19yPqognyT--pfugbS9rSrSMSrzpaUpSUMSkVV-VVVPHgccX1XX1c-9jiyz5V0Pz_GnSN1-4g0rMKR-7-HkBVxlu7--kCK70LkGUSpMSrOzuXWse7X9-4g57jrTXV-DkQfwxX--B98T--g9En-1v1y0pKorN7-7--gDm6V-v2vCxNV--l12N-Pl34RxUcX-0gHXnD-7gHhbKrq7X7-TlB1xMxcVcJ1lBSSrSSppzUzxpzT6xSSrKrMJopBmcXcxrMRUSpMKBgc7N1cX97971AMHYSSrMHcce7eVVN77XVX7-Oc1dMSHooe-V-CMKSSKq1VUpkUSrUSCMMMUSzSprKKHexxrSSxSxxyUSzzSUUSpSpSxKKBhUpttx57OaP0WyOaP-9-0V7X5CHcV77X1VVXXV-97cV----0c-7VXcY97X7ece1XABcc9--23yxV3v42inCMKrbVBe-0xXV-A4Ugk-aliIwpIMs----BS4D-2gSBER5V1v6fGpCCptV-X--BTnq-7gVUzKKT-VV--m1DN-qm1FRfpppNVN7N-DmEsxT9-QgZUjCSKEKR6xGWe57N-ZmVV0A8RQxR7--A8TUk-imT5xSTTTd9cV4Q8thxpponSpTN7-X77V--mZcN1immTUMSKCKMR16VUSprGbxkXBcVcX77V7V-TmmkSpUVcV-un7nSrMSxkX797V1ABckpMba99-0go5MN-5gpKjMMX7V-QCSMnV-vCllpk7-Pn_7wppc--6gu_jIIqN7-3gwCEUP1-HgwGzMMMSxlu7X7X1V1vETrmxSrTVX1--C-0D-Eh0RESoxSRN-X09--AFrbk--oIos-aoMTSIKFN5--5h58vIRNNV-2GitV-vH2_psV--oc-s0aoc_xKMSJe9JUUqN5P17VV-XoimSI5OycV-fHxjnk--CB5q-0hHcbN-VhHl6KpASSSKIMxsVWyP77VXV-7-HpEKxUX7-mpKbRoeKSo-NN--CNDi-7hOczxzTcXc--pboN-DpiAwpV-5hTmMpR5X-0QMjrnMN7-1hUQAT7-HqBoxK---DqWZRr--IhdNrKrSzOV5QBeX3e-9hfVIBpUzX17--CfpD-phgbjBmccjMJrzke76zrrMMSrUrpSyc17VVX7X7X7-HqmXSSX---qmvs--qqEN0HqtqSrxKESrNN7Xc1XV-2R4lV-fTzpnk-1hwNUTV4Prr2xMJnIC9EIrJomnqUKKCJeIIMOxp9MKzKSr6XX7--V57OV70WXV-5-N6a--V5fUUEofHchpKMOba7X5UTP7-0hzqEP-2i1rMSX-2vVmOnHpplxk-WcV-9sS7x5-2fXLhnESoxu7T17-2iCDURP-3fYKfrK9fISr6s-57---sq1c-DsqBSTX--DFu5-1iHcjR7Bmt9wxogcf95IIESpAAJegxUJfxI9onJeCrrrUrSUSSrSpMKSpUSrMKrMMMSMSppSKCyUUz5N71-0aP5OzyOzUSrUN6aOX10ty-7-0s-7cV-7X1X1-VX9XX7e9cecge16yX-X7X7BmXXcV-2iHoMUcV4Q_4_nBrpyOzSq5cXX7c-HtGWSpX7--tUGs-5u0pzc-Tu6aUSS-17-Tu7VxACOa---u7iN-5uEYS--5uEcz--auFlSKqNO99-2i_aUGuV0QdwKony7-BicpMJrMSc1-5V0feEApSWcc-5uYrSV-1uf6R--igpMV9vfYUppKHexxMzxxrUROttX1e7cW97HX17--2fYfV-Qf_oq-0Afj_rL7V0vfwMpMaX5V3Ag7opBpKpT575-7--fgPSna-4iqejAoOV-avQIxxrycce-0isQUF-1is_AGc-LvkFzM5X--fjqbr1--Dz_T-6j-zjASq75-1j1jzlc-9wL5ww--2lNpV-flSUxX-3j5MbM5X-Hj6HUJm_prMSk--7X--vlsIpk7-HwadwjOV-1wepR-2jAT6Ia-1fnTTxHnEy0X--Anark-9wvRwtV5QospnoxMSOzr0aNn9X797V-Qp0rq--QpG4o-0QpR0mxlX-4jL0rSq-c0XxPBBfBnEMKKyNNTOVN1e-6jMXUJlz11-EEgqwecX-s5OaSs-AjV-jKppq-17c-9y-hSkV3fsD9ppKIKDNNOVV17-Ty3bxJp0V--9yERww-0Ax-_npV--Ax2Ik-9zfaxkV-vzr2xk7-A-1BRy--3-zvV-w0lpqTc-I-kixr-c-A0MPENV3R55SnBpKkWa0zGVX-nkNrfACJeonMrxSrrrSrT55-IC9e-0ztVNX7X99--35IBV-R5UCqV-35iqV-w6ltpWc-60xjx--A1PugyV-B95ws-E1cpgpV--ki4IV1wAqXpUTUa1ee-4kl7ACOa7-02LhN-02YwN-I2aoBjy7-f2fQUKrScVc--I2gExS-V-b2tvSppo-7X-0kyWUF-1kyZMq7-036Ns-M36nwhr---RFUnqV-BFvKk-03Kgs-A3kyxNV-wI34p57-644wwN-64BcS--04PSN064PVSKSTUF14HcWc--BL4Uk-64ckSV-04jBN7r4jQxHppKKpMJxHe7V1-ecnIIKABoopUSognBnIAUtbotyOyNOsNTUSJnKq0a6ztbttVOzOVOX-5c0a5OV1XX7Ze9jpI977AI97--lSWj-FgMRSmf9zbrpzMKc0bxrKESxrlVXHVUbbpSkV7XccomXX9ZcP7-E4xwwja--lXvjV-wQInrsc0Q5ozSpKEryObbuVgce1c-Q64OwhMWX-0lmZbk-0lpy6P--GtFD-2lu5jKVV0RUb6mp6V-0m9erN-5mBT2BjNOV0wZLzpUk5XVPBZWrmmmmnIJrMSrSSSSKSMUxKpKrSESpbxSSrMOts7-7Ve7cnA9119-Oa0Wba7V---V7---ece-cmKJQBmp9ggzzrSKMMy-OyTTOX7X997X06mLdEBgnABnIIIICCAJnJpCCJnKJ0a5OtWa55Oa0WbaTObcV0WWV--I8QGBxs7-U8RIgpzs7c-29W_w-3mdg6Ctc-0mguE5-ZmlOjKBmmonUUUUbw-OzwN-VHmc1eV-wgZprsc-rANbgnKrUtX17c4UAhBhBenHYBocVgprSCHZnrrUMSxHnIKLOa-0VObaUzxWza0bsNOy1X7Xe9n9cV-1n8XjDN-IBkvzxXc-2BlYi-RnBjzIEMMKppKKF51-1-0V-9--nBzMVXBp7smn9f9XehBnCAIBomnABmceXeZegccZmonAAIBnKSMSrMVc57OyOaVUzWzOzxxzzztxzxxrrSrtbVOWtVN-OVP7V-0aT--RstSq--gtJnqP-3nilrCq7-AniufCAM0bbcV4UEFHBomghIHoonBnCKpKICSKpMxIBnJOtV-OsTOtsN0aUX7VN---6zOa--7fJe1-7nuYnACrtVc0EFVzgfBofKUUaOV0a73zH2ShKICCCCICCIBgnBpBpCICKpKCKRN55N-5N5OV0a0aN5-NNNOWV-NP7-zHTMwnJhpJ5-OVP-5oiBECSkV-0hBVAn9M6V-IIDDgzZc-2IgAR-1pHnrR--2KH6w-4pLvUIOaV-0KUwN92LmEgfBfBgqUSCrKKKBeVUX5-X4JmoocX-57NNmconHdBpJce99pKppppKIKopMrtxxxprKrMUStaN7-6yUza-7X9775ObzzStV--51--N-PcXX7-ILxOwoOV-UMCUghM5N--AMQdSNV0STQGrScX-8ptlrCCCta1-0CTnYnqP-0SVFsrM-70Eq1sfHnA9XcYCppSKKSErrSSCzpUUzKTOWaN0V0WX7VXWa-2KBme0WX19c-4qODnHrVN-2OnhB-Cqb12CCKJ-UcWV-IqjjQSrKAMzTNV7VXc-Nqu9fBnACIHnSLNOWWaOV--hjnFrX--r-vI-1xkFZpprOu97V-zr6zAApICSUpzKUxlyUrwUxKV56a6a7VVXY9_HmmeXVX1X9V4CmRVp9mrMaTUxT-e7c-OrAdfJnKrrSrrsN0X979X9-0rFTQP--MKdX--M_8P-DreVnCCSrzVVNec-AVFgBTV-T02FyV0L0slMs1c-6VTDEc-6V_Ajc-AV_JBtV-D5hsk-b_7iwnSROX1--OPBa-1tQurDN-Ya80xERTNXV" : 16 === fU.jJ ? bS = "DwCd1sP0j--RaO__ddedddifv2EEznnnyfEeRwyzBBBB2Bn00-17-2fEMK9dCrtzUrrMMqN-X-789V----Sf-T--yfzIrzohrxy6kX6rSk16k7---11J7Z-35CISoOxsUKESpEP6qOV6pJp9mec17cmhpxUSogfBnMMGWxptyUUzc5UrtttzpoTOV6lVVZme-gcfBc5cUrztbV73cWztaEO-1I5dLOfvkygzEyaOdzjzsl2knvg2EW2zEznvzzyzyfyyzzvjuMyzdzjivvvyyinyaTVyydzufvevjgwBoG-znzdiEdbg2vkyjEyiazuK_4OGaJaPjzYnzzjBwnvyfiigEnuP_vjuiaOMdezeififiiEfgzfusnEeO_ivviEuvjzyzivivivg3EjuyjiezjjisnvvEffvznviyviYEYyzjygnBz1_Fl-zivjEzyuwnB2z0434-4G304-44-CGJFKJEK42Bo-38G-340403LK2kl44G_GFn-G402l2x2433432vuvfvY4-l-0-FkF3G-J43G3FJ3-G5J2---20L-Y-8CqLKOzvEjYn3GF5N0A3mrIprrIryT1Wace1XV0F2MKYo-H05ahSVV1R1RHOKefiznn0-z4KUy5MEe17X7Xa17X7X7X7X7e7X7-17Xe1XeX1VXT0aN7X7X9X7V19X7V17-Xec7X-7X77X7VfBctaT-17917-X--7V0V-9Xe19X1cX991hJpKJpKMSKMSKUIMUrMprSrMSrKMSKrKKrMSrSKrMprSrMpKMSMMpMSKrKKCKMUzrxrSUMUKIABceV17-XcX7X7917X9X7X7e--0aN-7V17XcX77eceVX7X17919X1EzyTN5T-c-7X77X7V197XcVXN-7V-17-X18VXD---X7a11--7a17-99177Vce91X7XX1cVXe9XV-N-7a11177VVX12V0V-VX9-N0VVVX1-1171777s0V5-N7V7Va0bVN0VUV-VN-2Vs--a-NTN0WbV50WsN5-N5-N5-N5-OrxzST-VXcc-VN-1N5-V51-15OxUSxUrxSxSJpMs0V-8V5Oa1D18V91191X11-VVX19nCSSKSSSrMrKQKpK7cXXX7Xcs-1X1VXVV7777719-csN7714yUSpUSSryN77c7X0V-16a0VenB5-D0WV9X-a0WWVN-gpC7X-gm10tV0yN7NNN1VV-N1mm-N--s-7WWyN--fLocccAAC9555NUsSpy-Wa555-c--hIJpCCBmg5NN-NNN8_y--N0VD-epnIKCCLVXYWV-919prKSC9cV77-V0Vc11111TTUVVgkf1991D-e1-ceXX7X-WWs9cXXgcUxy10Va1cXei1monICI7g9-XgegmVgem7X6xyUVc8bbta6bbtrzMST--15NAA9egemfABXnBm9n9XmfBpMI9mggfA1eceeegn9eeXe9AIBme7g7Vecg7dV9mgecVfWzzyUzxSvCMtbtbzxtUryOzzttbtaOaTOzs97ea0VenBmN5N-XN9X9XiOa5ObtaNNNNOttVgggnB7e17OVN0WbtT-tWV5MV0ztbaUzMy2aOyStI7fCMtxrzzbKrUyUa5Oa0bUsOa1me7f9cD-1997-VTOWaUV-WWrzzxprWzUrqnBnCKrSSzySSza19Es9aOs-c-WsOaN50V-NObttrSSxzzbtyUbzzUUzUtxrUUTUyULpf7hKyTSBpMzpompqpSxUrSSrKprUSMMUTMxSrKSKrrrppMKMSSprSy50byOSzaKgpxza6zUtbz_zUmgf9mA1egmgf9pMsOzbtzMyTOzzMbttWy2WrKKIKSKSUtVOsUCLnKUtza5SzUxSSrSSzUSrMrUzMttSxxMSSHemgnKzUSzrzxzyUrtbbpSrzKtKrSAMKSs-T---X55UbsN9eem7iObtztyU_rQMKrUSMzzSrxUzzbyUxxyUs18s1UaUprzxMKJhSrMxpps-V-798VUtaOVOVD-XhHDN-6V9XXm7ce7VVtV-951-Ors18Wa-7-177--1-UVcOyUbzMTUbURopIKCIA7f1hMShJonIMTUMUSUKKUMrSrRchMJpSryOxxhIMprSJpxrs---Wa4xxrSprKmpKKxUSrUT5OV7N2a--7-ztVYVXcVV2aOzrzzxrSrbrIMxJogAMSMSUUSrrKJgpQJnAJX97hMMU7fHeX-en99pSrxwopCICBmcXXccXehSrprUxzbztTpKJonKCBfHeXnCLpBmX9XpSzrpKpABeepS9nKnBofKwnBopRpBopCJpKpKKMKIKxzSzzzxKMSSSSKxKSIKtTUWyTObUrrxzrzrbrSzrMSrpzUxySrxxzrrrzzbtztzyMxrUKQKKSSppMKpSKpxprrSrUUSxxrMprrttVD5SrV-a-NN71-cX7791-77VVVVX71-TT6WWbWWWVN-NN8V711-V777X11XVcccceXVXXNNN8V-15-9-VV791dV1-VVX7X1-sNOtrtxtxtySyUVNStUrUrrbUMrppzzrbbry6pKKrMMMrMMCSUUKepKxs0aTTMUUU_rMT-OVN-6T-7-a-777V-5-XMxSSxxrxMU_pzhUxSmpra6QKUbSyOSSnMxSyUKSxCMKUtprySzrxxKttbzbSrbTN0xzUKBpyTSrrMtttzprrSSrMSpprKCILpJhBhIBonKMKLnKICJnBgmmpBm9mnAABgggmeommnAAAJghKKKhKgmpAAJpIJopCIMIMIJpCKJpKUa-s550V2VN50VNT0s5OWs6VT5NNTTTTTMyUSSxQJpJpAA7fBprxpttWbbSSQKSSSMMzSrt_rUUbUbaMyTOVzTOs7777N70V70_pzKKzbbSJpBp11hIKqnKUtIAJmnJnJmnIBnBnJnKKLpBnJhI7e9778V1N5-NT0VOtbaNN9gmmmkfICCACBgonCBpQICBnI1fJo9pSQJohBchKhCKJopSMKSSMrSMCIBomooenABfAIABgnIIMtsOaObbxI9mmon9gnKUwpMJpJpJpBmpSCShMKCMKCBpCK10V7-77X1-cVV-7hKKCMKrppMKSKpIAKtxzxSKpxnHghUySrvCICBfCJpMbnAIBhBgompIIMC9mgfCCKBoonIIICBfIIICBopIIIKKCKKSKMUKpKxpSSxxMUMKKSKxpUpKrSKSKSKnICCJnCA1999-1A9e-7-cXXX17V70a-f7VV-1--7XXm997cXX9AAC9mgoekccXg97XXABmkf9f9fA9emXn9emgmgonKtxgnBfI9nBemef1X9-9gn9meeXA9eemegoefBmgnBnC9gnC9eeggnCJhBpBnKJnKKKKxpIKrRhBhAKBhKSKKKIMKKKF7Z2MkT__44OOaO__O_LLTbYvkyffBkEcw2knyaaiBkyEC-x-nl3-3VQ3QMsc-O-txaOjzzk4K_-7VS-vCSzc7V0J2qEPevjFF3F--6mTV-FGRlV--92TV0kLotbx-a7AuPnIUUoxxzbzrKrpKKMSSSlWxrUsWtzKlzTUyOzbw516xSUzWbsX6wNgc55Xc7mcXmgmeJmofomXXIBcYHcVPXZcVTUceX1d9me17ee9-A0Y6qioC-asBoenIBjSUIBjUSJe9ceV7177eV7fC9gpzzHeeICyUxA9efIrzM0zKaP6kOxIMtxzbxBgef9gfMSxyU6ttaUttzGzryOa-OV1XCJc9VcN7---40ekqQ--NDEDyV--Red-6VumnMUacX--0pcZ3P2fIBnrozKocX7X7poxognBU6zbzojHxISryUWX-U0XV--V9YHX7--6M-k--Do0VDFSy8__bfuePPaEykFkk03C2-3VwCbAMV--0t6o-92oUS0V4FUCSaOQzBn4---ywe-Y13Y5KOjuRyaEBG2F--GW_V0FZtli---3co7-38GgR-93kCEP-1kaQpeNn--L4BWBn5T-BFdZS_ePOvjjjjwk3-FJGF0sL9epCyN9-mkhAhaefdPOOaOd_eO_dPLyiiveeeyEnnEiEwBk2nEnBnEEEnnwwznnF3333GGKJJG3G4KKGJ-94g9CkV--ipW-VWVbABxrMKz5OzJxsNNNVXmXe9c--B49F--PnOV-FqcSV7sQLqmeeppUUSSxtaTU6yT97997eeMC2a-LKOaOaOi_vdPiuzjd_dvijyu_KFJGF33303FC2-oBBB4KLOOaaOiaeduaeeffdiuzzzyyydKKJLfivjjjYBwyuyynzyEnznvszkxFzwzjvEBG0G2zjgyuyYvybvzjyieKbfYBkwzivYvyvyEiviyvfuuuPfePPaadvvvjjeOLP_MdOKKK_UeaPMefvjjYzYknkkzznFzyEjzjfyvvEzjeQfjYvzznzyiyEsywzwzYvEgkG43K4GJJKGJJK3-zjsEzjjvzwyyvvC3J2G3FJ2yjFG04FK4F4K-OKGJGJG0GK43EB4GG2EEzyvvn2yduyvjyinzx33G033Eiw-o-KF2k-GGJeKO_-0PL_JBFGKOF_KOHK4GFxOHKGGFwp08J-yEYnlKKFJBwFJK9eOFHLTdJ-kkn0KKdFPPe_3-B3HeOaJ_2-EeVC-3JKLdi_FHK20dPJFk0O_JBl3KT_3K5LLfjdJeu_Fo3_JiePJF30-l3FGJFoGF-X6dJBfEOtsV0FxOWbo-D6uCS6X1v2zp5_4fu_4ivEdiuPdKJF45aiivivyyiviiijsn-znBkBF235J-GG_-nBl-w44aKKG-KX2_nCErSSSkOWa11XeXLG1g8_OK_OOO_aPuKOdajsydQjznzydLKK_5KaiuyzyvzzzyzjvjidLK3KKGKKKKKaQfefjizjzyvdefiiznyzzyEwznBzwzkn2Eifzjufwyyzjwww--GPO_--zVBnvgEekk3K3GG3JGGFFG2B-333-0--03G3HK4ePeefeQiaOK--3-0-JFKiydeJHKJ2C40GG_ddKFnB2-JF0cWyMmmyTN-ZGfute2---ZAWV0G8Ihi3--8AO7--I0sk-7aWNk-RIFpuEF018vKgpKEM6tWV7XV--L5Mk-NgeYlV6GUzf_eczf24_-k-1C0lB-I5ZZqOynkqK-5YJBIArlX-1Gfu8_yC-6YOlnKIOV---5qJB-DCgdwja-C61_LTvoG-kYgE2KIJnAAMUxzUrOxzTOWaZcV9176qXeX7cVDlqEh_PPeffijjnEBC203FFGJ-mDm3BfEMtyP89-C6VITdTn---2mET-26bSqk--EMts2wUQzuiijiibfV-EYnn3G4LJJGF1szi7nJnr550e--78qw-1FShy-27J7aR-eFczBxKoT7-V-oWi1tLgwk-9FyXENV7H7Of_bisywyoGJG-GZSgYBepxxpyN5X97-gZ3Btfw30yZX6E9mY9eememXeefSzxzT6xzUrMommceKIABhBeMUSxyOWbbbxzHpATTTV5OzxzSy15Ua5O93eme9cXWWbbyVcmVAmK5MiyiajY2Eil3G445J--Hp-s--aMYk-0CdpV2HW8xuvoG-28GGLmemxr6tsV-oczDQis3F11JY8BgnBopr6ztzzNOWX7e7omX-0mZRx_UkRdHRBnKMKpMJppJxponBop6bbzxpxKlbWa0WWWX-UzUUrMzlxrWaWXVd9n9WVVc91e99X7eeVjHcccOe1V--dDLF0OOWLmpy1-6AISazG-5_hMYrq3e-2mvLGeyn04-Ca5w69nUrSq17--QBDVUivzzlJKJJ-qNYawozzyNn97c23mKCO_OLdiffgwnBBBl-J-5OPQhV0wnGIOeeyin0230F5uPAsSSUrHprMSI9BenCHoeXAIrrUUUzTUzyN56rzbV0bxbtcOyOttztcmefBgfBn9ef9X7VXX7X7X7V9IG_jaaeivzB-pFn2KJ09Pe2Rhbzzxxu7cemc-CCRoydz-p--5k5q-ICZKiPvjk34--5npT0dDEw5Oeuaufdeu_PeijB-BBFkoFG2EfswFk3-JLJ-9Ul6xk-7nzgraaOeQfVBB-n-1XVgnghCEpKSIIIMKxML5-0Wc0c5V71-7-C0ccQ-B92pWnABnIBgmxUa-UbtbrzzrtbbueXBee5Pec-C21Ktk6e6I4rJpIBrMM0c-0zzbae91c7Qh2tpO_ddeeTbeeiiduuffeeefydbefjiedeeaijY-nnBwnznEBnnEwk-nveefdbYw3B-2koFFnyjueuTw2FyvfiB-32G0-oGK3-OdveeJFFFo3BoLK0JF-40OOaOa_8KKFB3OKefddFF0--02F-00G2--5cWxzMSV1V0JNHMaB-uYI9RnKMGWWaNe-HJRYn_aayu_jjjeBC-FJFFEjiwC44F2uEcgpJxIIy5-NVV-07cwk-PGjhlV3oZcraOPzkC-5eHK_nABpKKrK55-575TT-e0fHO2qaaabeuauQeiffeQffF-33-kk-BB222n4J3K--9LCls-CAWRtk-1QXrVIK7Wd___4aLywyizYzYEyEBw0JOJOJJ-edEvRpK5Os1V1CKLfOdOyszywkGG4-5etPbKtae-jKWNneePfiuiifiijifiw2yfeii-zefeeeeefYBBn--0033F3F03-G-3F03-4-0GGGKJ-ufB4MHjSzSomcXfMpzS6xKKKKMSsV-10a7V-75Ouec17-6Lbx5JE-PfeifA9eme9AJzrzxztyN57-SVW5uU-0qkprRxMSKSpKSrtV7X7X17--V-58t6-LgVLbBpIKrWzSqV0V7Ve--O0SB8LoLpxJnBgmpICBomogn9oghBnIBpUbWxpMOzzVUsUbaTOa55ObxonKESyUSzrzRUtWztsTUzrMtcVV-V-eX-0Zegee977XX-cemcY9ecV8q__U_OdujEvnBmK30--hDurV-5vfz37hzjz9gemecf9genrI9ggn97gegegoenBgopCJonEJUzpCKKIKonKSKMKKKSMSpUKrbzV0V5NN-77VV-7X-WWVV-N-0aNOWWbsN-0yUUUxzrzSMKrSICpJnIIErL5NOaUSxpSUMSSkOWWaV1-1-55--Vc7X5UxrpUSUxty51-cVXX97VcXZecV9r1ep_LLasznvgyw343F-AZ4Kk6pnU1tLuaOG5K_a_OLLPKeOddYzwwwzEnzEnwzE2E2C-JF3-4id5YIMV7-Cs_ftkIvpQOmnA9nBgf9YBoooofICBeeCBoqUUUxtza6aNUWba6aOaOWba5T5THcV7NLKvdveejzG-33F-5q05bAzy9VCvXK8_eeiyvujin304_-3-0FZT-95mmcgfAACBn9ggeAA9mmnCUtzrprpUSAAIBggecmmggghM6tzNOtttyTTTUbbbxzKa5N0bbbbbbaNTTTTTTUy551ccfAA99XXcWnw5hG_OLKOLKaO_LKOK_POOKdaPOaPOaaUzBnEknwknzE2En2nzEnzeKazEyzzjnwzzznyszgzzzwziyzjvvzjEnueOOdawzEnnwzEEnwwzEEnknEnB0JLJJ__OJ0K_JLK4K4_G8K4445K_48LK_OK4G44K4OKGF1TETamnMTOVc" : 17 === fU.jJ ? bS = "9mDS-FP-F--0TedPPOXo0HCGSpxrMptUSrUztztbbsUtaTTOzzzzStzSzSrSrSrppT-0btaOaNNUttVOa---56y6aOSrUaN5OzztztaOtTObtaNNUzaOSrSvHogmgfKpKSrCJgnIICMKrSryUWs--17XD--OaUzaOzyObzzztzrrUxUKprrzyUzzzzzzrSrrbzUSzyOaOsOzzzztbzzrAMSKzrUzzUSrUrrMKKSzzxrrxrxrrSrSrUSpMJnCKUV6aSxxUSxrSSMzzzWzz_zzzzzzxrUzxUzzrSzpxpxUSUxrxxSrrMSrSKKMKMSKKxrSKxzxpJmegnKzWzzoeepBpABgohBnBpMSKyOsT5T---OWWt_onKzzS9ehSrUzzzzrzzKKAILmfHnBpUztWsT0WaOaUzzzUrUrSzpxzzrSMSrzzzSKKKKpyTUaOzxzxrxxrxrUzzxzzzzzzzSrxrUrSrSzMSrSSrSrUprMKzUUUrbrbrbrrSMKxKKKpIKKKMKKKIBpKBnJnBhBgnCAIBnBnBnBgonIJoonIJnBnKBen17AKICIKKJgpKKCSSKKCKJpBpKIKBnKKKCACBpKMIKponBgfBnCHoonBnAKCKKCI9nBenBnBgmepCBn9cecegX-9eenHmognBmegefBnBenBnBenBgmonAKICCKKCKKKIKKJnCJnBmfBnBmpBnICIBpIBmpBmnBnABn8aObbaOa0bVOV1n9fCBonIHmonCMpQ9hCAJnJgnCBnBmpBpBgfA9nBmX9eeeXeXcXX9eee77gpKrSrzSrSrJnKKrrrrKJnCBnCBhCIBgemggeggef9eemmeecceAKKrKICJproomgmgeee9X9eXfKMSMAKMzrMyOtxrKCBe7VcfBprrBAIHnKhSKIBp9emgfBnCBpSMSUSxrrzzrKKLmnBmmnABpIKIBmgmnKSpSKUSrPkf9en9nAIKpIBgmXEV9gpB7Ve9VX9XbrUV1cc9V7Ws11chBeaN7tV7AIC7XN1N1777c2V-a5USy117aNN-ceef97Oa-Wzy1N-17WbyMMKSCKrs10WV-Ws978V-5-D5-s-7VcgmfMopCSppIA7XV--1-2bs717V15--a52aN-X1-cVN-X-V-ts-0V0VOV1OaOa1-2WV-sOV--7OV-V--VX-7--7-0yN7--7-X1OWa--1-0WVT--9N7OV--1-NN---V-17V-15Us--V--15NN7----VX1N7---X71--17eX7X7XX1VcX9XXcX9999A77eVeX9A17X9cX7X7X9cX7V7VV---717cV1717X717X-X7X71177X-X71N19--97X-X7-X7c-91X-X-7X7g7XVeX7Ws-177-17-5Oa5NOsOa5OaOV1XmX7eVcOV-95--5-sUWVNT5N--0WWtztaTT6WaOV7-0aOaOzza0aN0a--7VOV7s-s--6V-X---17X1Vc118V5OV7eX7XcXemnCCBfBnBoprSp9gn9cV17ee-9eee7eV4kDJ_aeiwn-FJ-u28mgpMSzsN-XeV5Fop6aeecBBk-F1t5Zdn9xxrs-9-O9QZyeevz-G3G-YcmK6CIIrUrrSrrrqOa9-X9X7X9cV1_beTuOPOPfznwwC3-4-Jh78rBeejprrSrNN--7-T5ITPw30U8E3BgonBzrtWzzaNVeeV8t9XtaOdOyzBwnEBKK-AmPDvCxrr-7X7ByJT4OdKaTizEydLQi_G48_OUdOvEvyuv-zyevvnzyBFzjvyBnzzznE0KKJJJK43JJG3JF0GKK-2BiSRpxxpWX7Xc" : 18 === fU.jJ ? bS = "DgBy1vR-AV60YBnopk-O_9DCIs4rUUrSSMUrSrSSSMKzypKSSMRpKMSrUKMSpKSSrUrSKIKSueXgnCKBgme9XenIKKMBpSKpKMMxpLppKKpnBoopKMMMMKpMKKKKrSzzza55ObzzUUSxppppCCSSpSSrRopSrrSSSppMMSSrKSzUtpxrxxphSMUMUSrrUzzaOtbaOtbbbaOzWWaN5Os6yN-ee117eme97cX--1117XmmccVaN1-Xy-XD-NT-6sDOa0y-cWtzrrKrrSpptWSxs1W_rMUMMUTUUzrrrrSrSxKSrKKzKSrMSrxxprUUzUyTOa-N-1-X-7--1-VV1D-EUUaOtSs-SyMzy-Xe1XXe999XcefCIKKUUn7X7eXee8aOV11UUUa-X7X0Ss1N1mVcf9ecekgk1AJmnABgn99mn9hIJhKKMB7797ee17y17V79Ve79nFX8s19nAIKI1n9pMKKT5Jp-hFgV1goV1nIF-hB-1kOsN56rSpppMtVX-77c7a5N-D550V-ObbaTTN-OVa----N--7s50y0VTNN-9maOzV17cVeepABnBpKKCBnBoopIKMMS9pKKKKKKIBWV-D-XemgpKBe9gm9eOzbyOa5OWV15NN7-N--V5-OV55-50aOaOa----99e77X9e770V1OVX-ccefABn997Xc77VccgceXegfBnH7cegcVX9ecD-VV-7-XV7Xcs5OaUT155-51XD--UtyUy--zWzzUzrbzyMT5OtztyOaOzKpxxIKKKKpIKKSMIKSKKSzztzbyUxtaUaNN5OyKs-6V0WV0_y-SppSICMKMTTTOtQBpSCMSsSrMSzyTMSprSptSUbzzygfKxUaObrMJpTO_pmpUxraTTOtttVUtaSSptzIAK99eXegfKgpCLmpMrUSpz7fKBoohUttrSrUrrSrSAKKUUra4pSzbaNTObaUyUxopBpSrzbaOyN10baSrrpzKpSSUtSzpUs-75N7cc91cXoX7V7Ws1-5TUbaOaOaSySzzzrzzzUtaN0V971A9eenBeee7Xe9cgcfAA9gggnKJgpgeee9eA9mfBgf9geVVX9fB7X6baOTTNNOtaOty52tzVNN9m7Xcce9715N5ObKt_y-8rMbzs90My6_s4raOUxrrpUMrz_rCMUry-eXUzrpySrxyObrztrzUMUttpztrVMrzrMsURhUxpsOpCUbrzqmenMtzmpzb_mfKzpooXX1pBpxSSKpSMSMKKCMKQKnCBmmeXcc71171-V--XpIIKKnIAAIBnCMMCKprzWV7sObKKrKUMsNN5UyMzzrBpztttWVaTObW_xpI99ghKKMxztaUUbzzzMy6vBgnACUtz_yTMrUzbnIMUtttV-UrUSrSSprMSSMyOWVX-18a0a-0yTOa5NOzrrRoonBpSKBpCKCCKSnCCBhBmme7efMSUSzUUaOyT5OaN-0aUxpoopMSzTN99WbV2VVXX9eYV0WaN-V-OtvKKUSzMrs1797VtpzV6rrSSrzBhKCKMSrT-Wa-V0V-X77ca--UzzzyHpMT-yT-7-sOaObbyTTOzUtsUIMSpSRnMzMT0WsTOs97hIBeX-X7tVVtzVc8WWaUonMzbKUsTUbSxrnMUKBoonJnJgpBpBoptaNOttaT5NUxprCUT1-VObbzrUzzyTUzzzy2zSxxxzry-1-Wrbtbs9zbzV9UV19-fa-taTOpUWxMsN716aUKyUps0xzaNN0VOWbaUzSrzaMrzVcX155OVOV0ztby-199f1XOWa-N-TOWa5UaNUaOa5OaUtzxtaN7egYy-VTOaUrnMwnKtzxpzaICTmoomenCKS9e9hSKxzbrSrSKBgpMKrWs-_yTNMbMyTOzrJnHnKxrKpSMKMSpprKSSMU9fBopKKpcfKSMAIKSrUMMpSSrUzVbrMUUTMympKrSrUUzMBnKSKrSxpJpMrUSSpSKS97cXXXXcXXXX9997ccX7c7X7V11171N-V-VVX1-71117-7-X19997V1mopKrSxpMMKpPeVX7hJfKCCKMMMMMKKpprUa6BpepKAK8V1meommnKMPgpAACReonACBopKSIKMMCKKKKKRpKCKJoprUtbbSSUs4MtaT-78sUxzzwpxxpxrKKSSSUSpUSSSSSKKKSKKMKSKJpKKKIKKKJoopBn9mccgpKICAMIKKKrKCJnIIBopMMzxxrrSxxxrSpSMSpKABofBnBn97710VA112V1171mmgn9k7V51-7XecXpAHhAIBooo-X75NN-XeXnBnKIBnCCKBnB9gpKprryU_ppSzyOWVObrzyTShPfIBnCK9hKCCJpKzrzxprSrSSUrxxqeeehUxzUrrABnIBhMzsOxrxSmgpxnMHnHhMnMICHmpMnHhSyMBhLopC9fIMhBnBnCJommmfAA1nBo97c9nMMrFhBgnBehBgfABfIKSx9X17N1emXABf9gmnJepJmhRmopKCMSUSxrMSrrUSxrrxrSrSrMSSMKKppCKKRognBggogeefI9mpxrr9nBggoog7--N-e999fAa-XfJV17s7XA97XcgecWV7eeAJpKKJoopCKBpKKKrTTMMKSxRpKrSzrzxxrStSrUUUSSpLpCMSKMSzMSSRef7Xce7e9X997-cX9-c-777-11197VXX17X7cgc0V0VNN1VOV-1-WVV-77VcV71-V-71--AJVV7XhMCBmfBnC797g-ACI7-Oa--11-Vc-1XVX9979X17V1-VV7cec9oppnBn1gXo71oome-1nHmgfBpKIBgmmcenIBnBnBnAAAIA9mmonI9egoXmggopCMKKKLpQCIBoopKopJcgnIBp9fACJmge7X77VVa-11-V7-VVVX-V72V7-7-VVV11-V7----V---N78V5NN-V6s9XOy1cepgpQIA9f9e7X777VX7UTUbta1eekXX7X0VcX91c--g7-11emXceeXX9ee99ce9g7cX999XXXX99X7XV-5-V7ceeegeX7X977X77-X7XVV-5-1-7--ecD-9hBX99onAMSKIMJpKSpKrMKJhIMKopST-NOaOrRopIBfIMSSMzxzUpzUUaUaUbttyUaOhBpIJppMKprSxrUrrKMKprRnBn9ggnBms9gnICIK99efBomceXgnIBcXceeeXeefBp9emceececeegmeXXeekee9X9Xf9ecee7X7-5N-a-N--NOWVN--V-1-V1--5---711171--550aN5--0V1-V77-55---------N-7XOta6aN1ggnBmnI7VD-VNN--NN1ghKBpKIKKJpKIIKCKKKCKIKKRnBopKKrKSSIJpIIJoopCIJpKUKSMLpSKKIIJpKKMSnKrUSSppKpMSMKpSKrKp9eepUrpSSKpSprrrzzzSrrzzzrUrzxrUzUzUyTSxnICKCACCCBnABnBgnBmnABnCBnBgmnBgmmmgggggf9meemeXggf9mgemmmenAAABmmmmXhA7cgnIIAIBnBmhBnIBnKKSMSpgnCKRnKKMKKpKSprQMQCIKKCKMKCJpKKpMBohRmnABfB-1V9sQR73q09kCIBed989cCHZpMUMMSMSUOxbpy0bbxSraOaOc7TVP29C9Vc0VBecV--7NVV-N8H9w--c9BgrX-BVhQICKrSsV-1VkNB1Dn9choeAEHp9A9eAKKp9fCI9Xme118BgecX7IKKAKrJce70cXXXcXMSppCzSpJxSMKSKSSrk-0xpxxzba-17Oxta56paOsNNTOyTOa--USkWzMUUzs--VWbrxrrVV-d9e7VHsFGFpA9BnCzzII9X97pxS9XHVZoogqUtzqUyUxx50WsTOXmgcOuVOXc0T4CohpochopxzyN7X7NXV-cNWurX-AW_mQ9horyWa--D6JABqN-51WZ4aN79-1XOJ2Oc-58_IBN-i8hrCBfItza-V2Nd5onEIMLOs-X-0se3gprOX1V5NezHrS9eACprpxy0aN7cVV07h4Zpy1V3shEFnKMUrzcVN7I91V-chgRwP--Xvb6V37jO2mfSxrUba79cV3cjXTpJpJOyTOX7gc--1B70i-6Y102KttXe-4Y2-QBrWV-qBklBoptztf9-7-aBzewzzyPee--YGg2-DspvZoeeeXmeA9mgmogn9fSApra0tzWzy6tzzbzztza-e-1YR0fR--PDnihKtVX-SYi0nMS9VecnMSUzxc7UNN5eV4HE3LxHx9HfA9nBxpaX5TUbzUpKDNUKBh9e5BfCMSFT6zUbaOd9V0aP7OZecWV-dYlL2AAIBmcozMopohpzU---NOaOa6X97-LEHZBzbeV07yFszq9V-cz9FrX-4YxwbHc6s-9FJpByV0d0kXnUT7V--FTac-5FvBCV-XGFeBnEUa1-686HMnJmxCIATUpUzV5--57eV2t6dDnABplyUaN1c--GxMc-9HB5gtV38862nCBopa0taT7V0d8AyppN7-1THOURmocpAKpBc9zSMU0aN551-USL---WZbifBogn9ghCUrLTTTOyOWs7e7V08F5moo5-48NGSmzJmVCKK6ls-0V-1_meQFN19MIGBrKKKKopKzWaUbsX7X77-17c-1P80D09ablQKBxrSSMSxzUSpSrSrSprMMUSVVVVV0baXX997XX7ccXVX17X7c-DQ9vBxX-PblGIMMSrMMMkVVOte97eX7-DUDUCL1-0bwmfD-3c-SvC55-NcAPfppppSrSr1117X171-Ju42Zn9gmd9ceceAMSrSppKrSIBfrKCMUUKk-T9mcV5Ua5Ubz6tX--0aOa1X902cKbrCKKJpHpIJnIKBnCCBfBfEryOttVOu5OaTN5OX0a-7--1---cRyM--P9esnVneG9xnBmn9grKKJnIJpKSKMKJporUonHe2IBmmnCBpCKrSrKpppxrSzUzxxrV5-NNNOV-Ws-XV55UrSrxyOc775-7egoe50Wta7X777N--7VOxrSVWtbzUUSqV6bWaN19cVX99gecemd9ec1xdFn2SrJeCpKrMSrKpSKSKIKKIICCI9XKMKCMSII9comomnAABpCIJpBmrTObs0taT5OsNOzaUSKMUtV-0aXX0WxOzaOV0zr1750zrGWX--XVVV-77X7V0VV-117XXXcHX1V39Nu-nKrUUyP7X9XVFeTW0xrI997KBcXBgnCAJpta50aUpIIBnKSzba-0VVUzbqNX1c--dA_c19eGowgggnCSSGWWWbaUsUUUccee705ejHzrzUUyNA9eXeV19fFvonOaTX-Rf_UfKCBeISJxrT-0WbbVNXe--AcyX--Aenu-lfzAABeconJnUP5UrSpKIpxLV0zML5-V7--1X7-2gTJfAOV-AQx3k--sU3c1TvB1BnKCIKIKCpMSGzr-0VN--751-19-0iur2k0FkOrQBgceZgnKKMMKKSJmXxpSSprMs6rJnrUra5NX7-X10X0aOVN-1cV70c16258gfA9fJmnIMKxzyOaOs-NNNX-7lElAMryXe7-042oc-A4AKhN-7gKbcmpIrX6zrxrMzUVeVX-gocVXV-3MmVV-3NpHV4wNq3mmmrUUrMUTP77-X7--lazYV3RQ6imfrrSprs-1X9-7liMQEOxse70E6TIBmZxlxxKOa77VV0I6vXBefKMIM5Ota50cV-RW4Rw-0RW5cnK5--Om5EABpMKBhSxxs17-0V5X--H5H1-9mCaYBoxbaP70emCc2MSIBepJfIIBmVP7mnCIAACCKIlV50bxqUV6zxxpCKprzzaUKa577cWVNUrOtV17V17V7Xcc--HEP1-0mI5IF-0mLgQF-amT1YIBonIIICBgonGaOaNOWVNOWba-02AS3hKIKIJN0V-5--AByfCsV-BqE5k-6CtMgN-0D4wcDzDLQCCCBpIIAAUJmmfBnAAJonCBoomgggfABpAKCJeecme9IBnKKKrMJrSrzUSKpMKpzrtttbxpMbbqOaUwUxObzrrK6aTTTOa5550Vc155ObWaOs9--0WWbtzyNce9cc-Ne7Vcc90zbcV0ztte90byTOXeXeeeVNXeeV0RupTnClV-hngH2CCCCJpKKKppUUtzbta5-V777-X177XV1wx_ZnIKKaN-V-PnvrYCJooerSo-OzuXVTOV71MEjtggeeeggnIAACJoTUzrMUbbttyN-AEykhD--x0GZrsc-2FY2g-4o9gQCSX-CjFseBonHonBf9en9eegf9XfCIBfBpCKMMHhCCKpCKICIpOtzSMMKKIJxUbbs7VN1---VV5ObbxrKCESzUpISy0bbbse1cX5-XVcXeV6y6aTNNNfBmehCCBee19cVV-0a6bzttyUyTUtzwUtttaNNOWV-1oImQL--AGQ0CNV-x5IkxkV0IIIYXm2V7XXeyUta5UV-46fyV0C78BrT7V0S83qnAyP2IoidnCSprrSxrSzrUMSxpMxzUUSSMMMMSzSSrrSprMSpMSSxrSxxxprrrrrUrxrSUUbtaUUL----WX-5N97X9emVP97719ecX-0aNcgmme6a9eX7199e77gecVX7cXXXXXcXX77X7X9egeeXX9-2oitACsV0hAoJnEbsc1EIX0Bgeen9gf9rSaOzzWyUrzqNX9-0CE-XnxVV-4FqeV0SGIunObe-1p622T7-0JRDc-0JfGc-vK0CgggrUzaT19V-CLDDs-6Ku0CV-ALMbENV-COvBk-bLoRjSrR-cX-8pp72IJoOWV--4T3HV-STYBq--hTbPoN-6pzxnBpT0X-5q4TfCGaNV-xXFHpN7-6N_hh--2NfsB-NqBUQHeCCtzSSSzT1cX11-1CZ-NpprX17-7qMXnCMyN7c-IOb-BnaN-0Owzc2fPAlBgggf9fAHoonAABgnCKCbbaT5OWaOaTOtbaTTOaN-0PiN7-MPkJBf6tV-4fLuV-SgO9lV-phLT7tV-4gqNV-4hl5V3xiFwnA9nAROzqOaOXV-SifanVGKwWFOaOV6zzzzUUy6tztbKta56s-WrzzsN-5T4rKpppSKSKKKM-6Sk2RmmeXgeggnTUbxyTUbyOe-OMnm0a50aOV-NNOyNOxtyN-fRZugenzttuc6MRg2gooef9eemeX7XeeeA9Y9BehCIUzrMUzzbrxzttzztzUzrzqUzzbzzzbbzrzzV-9fA9eeX0XeBeeY9e7-DrA8vSzrOtaXeec-0S7u7-rS8wBhCUbttcec-bSGCgnCzaN9-BrL6QBezxyTPXV4hpYLmgfCtzxzSttX9ce-" : 19 === fU.jJ ? bS = "EcCx-VQCO1iiqOLOKeeedae_ddadadadOfiveOeLeeeedadaPiuuiePPeeyeeeeOeaPadaeeydPeOedaOPLOeeeOadLOKLKKLJG4G3G4G4G3F-3GJG4G4KKG443G3G3G3G4K3K3K3GKKK3FJ40F33GK0K0K3G3F3F2nBnBnBnB-Bn-04G--BzzwEByvn-wG-BnnB2BkG44K-4KPKQyde_K-G3GKFwGPKO_O_K3J4KG4KKG4KKKJG4KJKK30304LOJG3GKKKKKQvjzuzziviueeaKaKPKKKKKKKKK3K_eOKO_OedaKaLaOevedaOGOeOeeaOaOaOeOjzvjyaPeOKKKOK43K_KKaveJGJ0-JG3G3GF3G3G43KaKF3G4aOedaOFKLK4_eee_dJK33KeaOLOaOjveeKLO_OaOaeKLPeivjeaOeOaJKGKJ4PdadafiyjedLPeueK3F-G30F3G3-3LOaOjeKLPe_O_OeaPfieieeyeaOaPOKOeedeOdada_daOdaKd_O_aOKPOKLKaKdK4LK3LTdaOdKaOK_KLPOaaO_LPKGKKK_KOaLO_aOOaaOdaPOdaO_OaKOdaPOdaPedeOJF--00LaPdeaeOfeyeiuudaueaaPdbeOeuefefuivfifujifieviivifeeid_G-04OF0-03KaPvievjizfeeLJ0-JG-KdOTvfiyviyujffviujeiufeiefivivfivvfeevivveiuueieiefeeiyejffuiuuiviuvfiifiieePeeaieieveuePdaPKJKefefefiuzzvzivviyfvnvjvzEzzjzwzzzBnzwnnk2Bwkn2zzknB-n2BnEBzyzzBzzEwnzznzzzjfzBzwzznziz2zwnBnBBkB--B2EBznEzBwnBnBzzBknEnEByywzzzzzEzz2wnzkzznEBwwEnEnEzznEzzzzzzzzEzwwEEizizizivjvjfznnzyyyvivzzwnyviuizyeyeKbifiuizzvifieeuyviuiuefie_iviiyjzvn3F3Bnw-BnBn2BnBnwnwnwnBkBBk22nEn-EeeieKdeiudaOaOPedaeePeee_KKLPOefzkzEEjzwk2B-k-kBB2yiiuieueeaeeaOOaOvzzzBzvjivjuiuyevieifiedaOeueuivivieuvfyvzvyvvuuvwzzyyvzzvjivvivvjyvznBnn2wzznwoLK-z2BknzEivePPLOOvjBwnEffeuyzefzuuujnkkGG-yzEEzBnEBnnBwnEBnznzzvzzznzvzzEBnzn-k-k-k-2-wB2B-k2-2nBB2kBBwnBw-nB-2Bk22Bw-BkknnBBBBBnBE-znznkkEnE2--kEBknBBkBBk2E-3-2Bk-k2B22BB2k-k-k2BBn-w2-32k-C3F--k-FG0G-22-2-FB--k-2-w-G32En--nB-2kKLePLdFJG3-F0033G043-l3-G3K3JK-32B3G4K4F--B--B--FGLJGJ3F03JLaeKFG--0---BFK--203FGGFG33F2nBFG3FGJ4GJ4K02GKF03-GKKG3K0JFK3G03F--G--l43--Bk--kG-FF3F03G-403G----l0----G--Bn33GJG340JG3-G4KaLKPKG-4-3F3F03-B-------G3FJ00--3KGF--0---03G0032T4mfgmegmeX7fBnJnKIEzzzzbrpzzaObtVOaNX9c9c0JN9cQfjzGG0F4NoWynBpJnKzzzV---Xc1RfMlOOvfvzwEw3GKKF-0gAIV-2OK2-3aoazBjs-pIUdyOaKaKaOfzzvgBnBF---1gInV-4OaA-BexerKESrs-V9V3q6e6dauVn3-0fPHBpMs-c-SiqWQwJ1mtRSUSKKKKKKJOzzxrROc11--TX-X7V7eeV4Meo2avi2kCK--EcNy-OUJfiLKdTzsBk-0kCPrF0fVVRjiveveiueOuveeeeaNn-n22-BG--030303K3F3B6-nnBnBrSr0a---EsTXQudeviviedazk-2-G-030K-4l1tMCkOc-57MIs-E3IhS5P-CYA-DLew--koIyA9emmfACMSrUtbzzzTTObrUtV7ge7X7eeV8QnZxddaebjwnB-30F3xzBZnMKCMzra71-7cV3wA4p_Qzzo4Ffy5yanHpIKSKMKSMSSrKKMofJppMKSKrSpSMKSzrzzrUtaOzsTN1oc5OaUzrHnCTOtaP755N5-T-NUTNN-N-5-5-N-P7X97gn9gmeee9n9meeX97cX7eVeX9cXV" : 22 === fU.jJ ? bS = "N4Fs5OR-kV95d_aOaaKYvyajjyyvzgzE3J2Bk034aK2GJF1R0LkBzzrrzTNX9emcc-m-iMauzjnCJKK-yk5xZpEUMKElbzzSSSSKCCCMUzUrrzzxbxlzy56pUSqOzNUsV-X9e7eeXAA9ABe1cX9XBeV6zyccc5XcemV5HcX9e-DVEO_bjeuQE300J-4-WhfT70908ULKKfjjzzBFxKJ---8YoVBs3ywOKQieK3G0avuP_LUzzeLujvykC22k--C32J0x-eifBcggf9mmn9erKtzNUpr56a0aUSCKABnsOs56y5P0cV1a0RALO_4_dffe_LaTiyjwzx-C-Bo3-2-kIo1sOhKCpSMUMrzKA9cccXIpJpMJmX7XAppICpJe7X-4HeeKrSSUrSUppUu-7VWzxSWbxqOWc70bxzrlaOtbze-OzzaX-1e75X7X97cXh9c29991EN59GPOa_J0K5KKOLiyuOa__K3K5JKJJaPuufjjjeKGGJGQfiuJMevyuzjuviifedeuaddePOaaOfeOdLbeddaOOi_PbeaQddeeeeviufiEEBnEwz2kEgyyyvzyEwwynvizjjvynvzo3G42EgBzeeisn-2F32-yuPuBl-FEuivyBG2vvy3B-zgBFx3--yjyvf2J32E3_FwnEBznn2C-nyEivv042Ejivwzzz-33G4OOG0FK_KK2nwwwn-K_KJK-zvBG3GGJK4J2Ejyzvjvjiyyzw33FFBoK3G3FyyyyoFG-G043GGGGGJau_KG23G-KG5uJFMivivivedG-FJG3TeeK--3HaieedK--30-3HPe_JG-k8uLOK2E22FKGJK9e_3B3J0A-pLYC9pJpCHxaOzzyUttc179XBmVP-_VQqOePKyfjyavzzB2BlGGH_FoeJG--2FEDXmfTTN-916ZaEFAg3MTBmprIES9eHcV7X9e3ch9rHjp9hzUzsUStzzJmXfAArz6yUbzbxtxyNNP1ge71-1-3VXzpaEV-rFIB3pKKp97--_He5PgopzKHfzMoxa0xzJhBfGzoodMSpo0V0a-N0aOxKIUKBUota7VBc5P7971V9-9-1Vd-Wgo-b0H129pBoxzSzs-719-2Ve_4bh---4_yc-91n-LUQEZ5L1ggfCISxC9eep9n9eHmcP6afBeeHeIUHgemmf9gggeeomeIIrSSHcemeeeepMJrUxxromee997cef9oedSxzSoeXeXV-57VrKHmhBgzUIrKCKEOzzxzrSS9cX7emhMJmpBgenJe9fBnA9emnBpKpKJpSprSprKKKKEMrUUzzrrSzUSxzzxxSpSKIBpKKKETUbzzzzzbzzzzrxrSrKJnBopSzrxzUUMSxzzUSrSzUSrSzbzyUtyUzzzUrrJe99eBeHggeef9gce7X9997X7e9eX7X7ceXXe91-NNOaNVXX9eHY9eegeeeemeeX-5-7-55OX-VXXeeX7ce7XXeee7XX1--N-777X7VV-0VV7-NOaOtzyTN76zTUzWba516eVcNVN0X3e716xV5OWceeeenEIBnJf9hJzxJnIzMSzpBe9cceXX9cceeXHcce7gxzSzMSIBecPBfA9eYAA9c-PnAA9mYAAA9gfKI9cgcXX5OzVX7eXejrKJmxzKIJe7e9mnAAESEJeeXmVeBfpzxHeHcXe79-Occcc6zrxzrtzrzzzbs6XX-cXVccY97X7cXX9eeX77f9eee5e96yOxtucXccI9V9IJoc-onCJe-NNHcZxJhCJcVXfrJfA9ecgmmmrzJoge5Q9X55ognCbrJxIJpIHnACKBhBpICCAIBfJmgp92AHfK9x9xKKrKMpBmrbxoh9KrUSSy6xaTT0Wby-UppKMUMKKrMSKJzKKtzV5OzxkTUV5171-NOWtbs5N51c71ce91eV-N6e5Ua6yUttbyT6aV0aTTTUzzzzxzSIA9nBgnAAABmXnAMSCpIMzzrzrzbztztztzzbzxzJhBn9ee1ecmh9mf9h9rSIBfUKWza-WaUSKUxKKKK9eX777f9opJpKKKMK9ompCBeeX17Y9h9nBemfJpHe9-1-XIHf9n979eVUs751mc0bbaX-X0a-OBgnA9gnUp9xKpKKpMSCrI9efBeHgmmnKAEzbzzUMMMKpxSpUxSKIKBoopIMzzzxpJmc-f9eXX--N55NN--e777X11-VXd9gemn9omfBon9mnBeh972CIp9eBmehBzSzrUrSoxSxrKKKKBnBeee1gme1h9e1eceeenBerSpSpHxpKKKKBpIKHprKUpKJhrUxrzzxMSUzaOy6zzzzyNTUta-0VOX7-VOa0WtbWaOtyOy5T---UtbxUzSrtaNUTObzUxrKMIMprKrprMUzSrMSrMKpBpEOtWa-P75UzKlwP9-X1eVV599e77WVVc17c--0bzxrKKxzrSrSrUSxpzrxrUrSrSMonKMSrSKrSSprSKKKStbrJURN7VOxlcV6zSKtzX7c-V7X7X7X-0z6xL5N6zzrSyTUa5Uta71V7X-0bWy--N5Oe99KMJomgeggmmceBeecc79cceeX7eccX---5V-1meXX7eXZgeece9cXAA9geVTUttbxxrxzUUbbzrxzSxztzSSIMKIKMMUxzSqUxrbrrMMTUzzUaOyUyN7-5OzUUUN55TOaUzUttta55Ua-X9XXccce97XXX1-V--517VX15---VN5USJppISJprMSrKBpMKMSxrSxzUrxxxxxppJomgnIHmnEzpACrzSpKUtaOyOztyP1eeece-5OyObzyUtbyUzIBnCSompHmoxrUzrUSrUrSrUUSrSKCKBgf9eef9XVeefBcV2A9V3eeeemmnABmge9BeegrzS9geA9gggfMUKKJmrUKrKUSKKyObxxrsOzyNTUrSrrtbrTNObzzzJpKpKJpCJpBnCKCKJcVmxKpSpMKSKSSzKrKRUzzrKpxSpSrKUMSKIMzUMSrSMSSKBrpMSMSpSSrSrSpMKrKrSUKSrKKKKKMKUKKMKrKztzaNOza5Oy5ObqNNOWbbtbbsTT-VNOaUbsUraNN0tzs0a5Oty-V-7OV5TOWa5OVV57VX997X1HegecXV91---nBnHfHefHcmeXWa-1ggmV-X119-c7V79V97cceXXX99e97X1--VX99X7X79eccX77VXXcee970X--5TTOa7cc0aX0bbttxaUzaObrJhBefHmXggjMIErSKCABghMKKzUxzrSrMMSzzrrMSUUxxpppKpprzUxxrUrzSxrrRT0zxUrKxUMpMUxpxxrUxby5UbzMKSpxzzSzzzUzzzzbzUzyUrKSxUMpa0a5-77-N5ObbtbWaN--0V-550WWWWWta0VNTUztzrrUSSpzrrSSrxxprzxxpoocV9XeX799XVVXe977X7XemdACIKBgnIIIJopIKKKGbtyTOtyOaOzzUsUyUtbzxzSzrJmcXX9XnA9fBgee7gnBmmgmmgggmgonBgfABpKSMJooorzJmrxUrUaUxpI9meXpSrSpUrUzzaUs0aOzKKKKKBpUKKKMSMpKMSKMKMSMSMSrKpKIrSrSpSpMSKKpKxUxUa0aN0a--VN550VVX---Otba55Oa-NTTNOWVTNOWa--OyUyUa6zq5TUrKrMSrxpSprUSxpSKKMzMa50a6zrSKpppSpSpKMSKKKKBxJnKKKKpKzxrMSrMMSSpSpKSpKMpxrKMSzrSxxzSxUSrSs-77XcV-X----7X77X7XcX-c97ec-7VX7V-ee-1---T-OVN-OVc-OzzxrSrzrMUzKKSrpxKpraUSxKSKzV-XX7X770tWa71-V1-X197VV7cXBn9cfBe70V-29ecX-0WV77X17-57XXX7V7-71-VV77VVX7X7X11-UprKrSrSrMSSSSMKppKpSSxzSpKIpprSSpIJoxqUbzpKKCOxyTWzxrUUMMKrrSSpSMKpSKIIBrMSxr-N5TT5UWa5-19-5-cV7X7X1XXXY9999VV79e7771-N6WWtVOtyObrMMqUaX0bsOaOWsOs5Urrpa-0a6bsV5UVOba56X5TTN-19-OtX-NNNN7-0WcXVV71-V7c7c191-XXXXX-V715OyOVNNUwNNVmXZmonBnJoonBnKCBemeefBoome7V--77--VV0V7-N7ef9ecgnCCSMKKKJogmnCrKIAAIA9efABrUrrzxrKBc79ecccX-5NTTUzyOaOu7-OaTOV-571--NOWbzzzzbzUUKKKMJpSSJppppKFOWtzyUzbVNOaNNNNOaOWaNVV-NNT5UV6bxxpaOzSrJohrT6brrMKIxpopSMU5UsN5NUX57V-997X109XX77-TNN0sP-P-N5-0zyT0V-70V-1-5-V7V1--5X117VX777P77X7XZfBn99BeVOaOa5OaN5NOaUbzw7WbrzKKtaUls19-N0s-N-Wbz0z6xKSClxrLP7NWu1-OzKUJxpCCpSSKKonIUKMSpxrSrUUSr-5X1-TX7-59V0X9V2Hc71710bc-UR--UzyX-5V0VP50aOtc1ZccY9-OV1-OxpSpqNTUxSpxzUGzaV6a91-Ulba-UyX9ee1XX89nHXCK97-V9989XVce7VeX9997ccXgmf9eXZefSHpzMSKBhBe7WW99V9ZoeHmmXBeYBghIpIC9X172971-OcX71XeYBgmf9nBefAICCKKJpKrUxzUSrSrKJoxKKpSMKCIIIMUztxzrMJTUUxrMKJrzJgeX755119n9e1-7egeccX-0WVN-V7--V-NP17XXXeXX11-5--0VNOX57cmVdHXVOyXX9cmnKIJn9VV0aOgeoge0aOz6uHXeef9megrxBpp9e9xp9ce7ceZmecX2BnIKBeeX7X-Wa15VX7eccgeVXeemnSxHf9eceee-Nf9ecmfAACHe0VWBeY9X6efBntzSHeedBh9Xe0bttaTTTVTUbsOta5N51VVXXXHf9eh9gee0aT9eegcWbWbY9ceVCcCaqOLK_veauOePUiyujEEsnF2n-nBwzBoJFJKKK3-80h0YMsX-1VrHCgo-20kufu--VtxWV-B6UlBN-52nkrV2Y0uFfIEHn9meBjH_9ZnIp9I9KKEIBgrSHnof6pI9pUrpEURU6q1X71-N0V0sN5556taOtWza6byOV57Zc-P2xzMis2K--FUuQs7X32vL_OOOaTdOvuzy_LPzEYzzzuT_K_GOLayvzyavYzwznznn2yayjzzC4GFzEnGG3GG-J23F-3GHeeeK32341d_JCGO_JB---11ea-oW1WhaavuuK45Jevfvvjiin2nEF23F_FBxFx4OK0-2FWPtxxuX7-13IEU-OFXU-mmnKorUMzWxbzlu9-6xKrbWXX9cXJcoe7c4IW4c4aLOLdaeQeTvuiiEjfzjvvzynziyC3EzjduzfidKzzuiyiveeLO__veKJ_KGGPLuzjEzzivfvjdiygzjjjvoGGFFnyviyvv-EG303JG-Fw2ziviffyBBznE3KJ4F1J43GJ3JFBzsG42z4K2C44JKG2EoGOGGFpFnK03KJPLK0JaJ2Fo2nvevzEjzh-C3K5K4GaJ03_O_5aLdaEuaJTvveOG343-B-kknlKK5CJ7sXgggrpC92ICEJppUURUrzomYEIE5UKAI9gpMon9-X-5mVccohzrJe9HeAA97cceece77Y9en9pttzUHfCMJnHX7OcX9VPmf9megeXeXWy0zTcVXXp9XX9X9ecVXeXfJmeVN0cnIBnxHcX7X7-c9ogmY9p9gmgnCBppS9c-1WsXoocXeccV9ecee9e7A9eccZemVeemXfBc7XWXegc-mXe7YHgmme1ZeBgoeXnBgfABgnA9mf9ecBhAErSprMUSMMKzrrSUrzzJee9cenxomeXccX0yNXgenJceXmgfESxESSzU6zOzUbzrJhKBecn9cxUSMzUUa-50Wta0aOzxxbaUzzztyNUbyUzrzxxrKxzUMSSrrKKMUzzrzUUSxrTObrJgmecX97ccee9ecX1-0e9777Xe7V7eceemfAHmeeef9n9e9BoonBnKCKBegccce777XmenIUUUUSHccxSCzztzKHxIzzMzSbzOzKABnBgmYA9me9mgjzzz6zztaUzttbtzyTNcOzOWzlbyUxzSK9c99gmrIEyUz6rqTVUqUpCSpEMUSKSSpMKCMWzJpxMKBn9YKxIArpHgwUSHenIK9KrISomXBeJrIKIpMK9VpKJxBnCCCCCBnABopIIIIpJnJpKMMSJpMMJxSIMSrprSrxKpEJxJporKSKKSJxrpprMKHmhSxxSrSprMJhISUSrSppCpSbba-VX971-V57-77-X11-VVV77VV0V0bxzMKSpMKKrKSKrMSrSSSppCpCrxppMSSxSSppSKKIKJpSpprUMMrSUzpprUpzpzSzMSSzzxUy50bzrSSKxrMprUMxrxSp5UMSzxpKppprKpKSKprKzrMKpzzzpppxrWc-6WsX1eeeWHcWa177VVX-7-0VOV-0V-0V11-9ecXen9eegmV-T----0V5T5N--N-NN0VNeeeeoefKCKKJnJpIHe-C9eoefHc77V777--9VV1-------0s--99XXXVV-77VV777VXggmeXX7X-1177X7VV710V5NN-NN55Oa--19e76zUxrSKIKIHnJonKJnKCKppprSSrMMIprUObbzzSprMSMKrMKKrUrUk-X7V0tbs556zzzyObWyOzzzzSr-OzSKrzycVVVX77X7X---0WaOtaOV50VNNTObttttbttWaOby1---77VNOX77NV77-55OyT-Ozxs-71-V-NN7111777X7-17VV-OaUzy17VcdBcWWzzSxrMSSIBmeepKrSMKSrMMSSpSMIIKKpSKpKBme9IKA9gpKSSKMSpIBrSMJpKppIBenBommn9mmmmgnIJopIIIBgnBpKKSrSSrSSSMrrUxa-7c91ec5UzxrzzzzzyOxpUzpzzaUzzpKMpzpKJnKKzxonKrUpSzxMzs5N---7XV1V-1V7XV-6V7V-5UVNOzaUy0taUsOaOzyV6taUX--NXX0a-5---UrKpKKVOWa-OaT6V-7-ObzbzpzaUxrzV-3ee7-0baOVTUWtaUzbzbtaTTOtxzxHgmgnBgnSpSrOaUbVOWbzyOsUztsTc17HgmeVh9X76zzsT-eee77AKKHe--175PeV0ztaT0a19ee9eemn9n9mgnBnBgogmfAAABnABgpAA9e9eenp9mf9emgf9Ze910bVV-c-6WVXXXhAJegonKSKJggecV-PV6V0sTeX6a6VUzTUxzzw17eBeeme7XX7Pmmf9eXe90tyTTUaTTUrbzUxzSSrxxKSxSRUzUrzrxxMSpI9ecX117X_rSrSJpJognHzaUzqUza-6zUzrtyOyOtbaOttttbWtaN6WtaObzy0s5Ua0bzzzrUzzpzzaUpzzaUpzWtbbV0sUzzzs6zy0c170aTVe7d90yeVVcX90sX5Vc5VVWBgn9mXc9e5TVTWY97X7X-eeXXXeAACpHgmhJnCIAHmgpopCJpCBnIBf9ecXxCICICBpI9mmmX7P97X15575Ne7e9e7X7X97XcXf9V1-V9cVNOWaN6Ws6aOxaOzUzcX0zrbbzrSbWbaUXVTUbtccWbtxzKSrxUScObyUbzy0scX-c7UxtVN99-P99ccXcxJponAJmgmp9ec7-TV7X1opBmX-X0adBeX5T0y1e7X-VX7-V-L3UrqfY0-138kAEKUrlzWe9e9V0m49k5LOdbfjEsnvnnE3GGHK3-A1cjM9nzV-54Q8qk-61u3fr1-3sMFpOyuaLEzzwGGK-F-oBM_CzOXe-6W_-Wdag2l-EFmZonCIBxzSrzObsP9Wy9cce--P5pFqbzC4--Fqeis-560MMV-62XLvSVV07RSpOvkF9RDJawmn9enA9gtzq5UxrJhKBohxWWWbzMIIBObaP7VUzrk-552IIHeXc-OaPV-sS_yOzF-E2lW2BrkOX--0tNK-1kxuPmj6a-6WyFxbvv0G--G-7Ws097TviUivzyj344_3G-2G2vonU55c-H7sL5vBJ-I3TOb9mzx6V-27YoxtvivgoFK3-O3chQBnrzbsXcV1s_iwtejsz3J3-UlBAVmpCJnpBgzUrzJzOsObbbrIMUxryP9V179797cXee577-m8hBTjjvwoKGJ-6GFdpoxrSbVNed9-EXXkY_OLTdzEFwnF0BJjqSCzRN7c-AXbLQavvyl3J3-K4GtYIEL5OZe-8Xfk2ayEsCJF63KT5RjMrSrrJdCSBfEMxbWWyTWV6xWV-ZogmmVecX7-37iKTtLNwyzzzJJKF0ZMYtCBjraUaee-BXzPI_LPQwwnkF2gN3fCKpMOWzrzMN519e-gmcX-0sk9BTyskKF-gNfCwnTNV1smThtaeOwwk0-blddLofEICtzpIBhzzSHmrzzMUlaTUbbWaUc571V7PeCAAHXAHWJgmV0e7-07p55tiBF03PYgwgntyNV0ssWhPvnF_F-ZRPRBjyV-yDODaLyzyEx4G8K-DGnFpnEHhMKSxMKT-77-V0WVV0sv3MOabz0--wSXFgrzse7-iDyADjevY00GF-JT8txaV-Nx6JQ-03URgzKMNV1-0czMkPTi-3-46wSQE--PFP-6iBxK--m3-Lw--01ZbF-ZWN8ESXV-1Fp9r01m7Q9nJfAJnJhICJpIBmerpBmhSMrNTOxrzpaUaUSMzJgrUtaOa0zxohKSr6zs-170a90a9e7T-99eXJe7X71ec0a0s-0eV-d3ruQC-5m9_npBhUzq-71VaO4NlPeLeadfidaUc2zieOdejegB2EebjyafdKOLOzed_azyveKaO_jnzYBzzgEzjwny2G3Bnx-3GJFFF-GF43-F43K222-nBpKK3FBnCKK3-E7l5YBp5OV--ZOW4V0ZYGOgnKKbtV-9-0ZQ08Y-0mFmanR-0qHSRLvyzivizzzwKJ-4KJGKKF-B_3TC--aHcDbeuEJ2G-uHMABnIMrSJnrKESprSUzSKrMSprKSxrMSCzSSsV5UzTX1A9HX77V-V0blzyX9VXc9X77XeVWX7X5ce9-VX-JZjCha_OfyaOjg2kB---28VXfD-4Zl_8eNko-68kVYU1-08DGkPP2-03bIVhxx0ce-CdE9eO_HLdbuO_5PeTeedQfvgnwnByw-B0-kn-3-JF-695wno5V-tGZSvg3-I9ETUKBxV0sV-OHgcv--BdN1CV-aJrDTeff3---QHauhnCHpCIABnBpABon9fAzqTUaOtaOtWa5NN-5N7-DK35qf0-EHckqpICHnErSzxUT-c-T7XVc--9KE4TgF-weZUCMta9c-XKiF5fdv-F--wfapxpKV1--qLkTLObeekk-nF-GAgqMEKL5-V-PMsgaOen--1HzhMmly--OVCzv-ABkKHggnUSSSKMIKBejSomopMzST0tXe-TTTTUqUrs7-NT6bbsNe7VZgefA9ce7cX--dVyCyl--n4ilq-4tYanu_aTvznvjwlKJFJ0--n9ESqVeOaBotKaOKaOaLKOeaOdbjveeeuvfvezeuvfvdaPeaLeaufyjzijjizzBzzz-4----G-kK3F-Ef2vjkw3G3F0Ka_-24G44F0-G4FwywFBEzzz4-n--GKKGF-Zo2YSBy--HP0pTUx3-2CBuzD1OayrO_OGeffedeueOTePL__FGdQuuaadaJKa__OaPPaOPTdaOOjnveeQcz2kBFBFJ-zjevBp-nnwnEznl-w2BnzB2EkknE0---32--k003JF0wshYhAASoxN-6s1-MbOFS_K_feaQiwyw--n3--4E6XAL--1TPHb-3InNcnKTOcX--bdaKk-BxkuhV-1TsTa-1nrxeoyOe-0bl6lg-5nstSrUMKy-77eV-OwglQ-2ByuwCCrUSTUMUa751ceecc-9UXcbxF-JzIigy--OzHkP--JzpRhse79-TEOKuOKOKJaKO_GKLKaOKKKOaOaKKdLOaOJK4KKOKG3G4dadedaPOaOOaOPaeaeePedeOeadaPOaOKO_KaeadaKdOePedPOaPOePePLadaPiufyvueeafufeeePeeeeeOd_feiuze_PeeiuuyjyuaPyjuefzuveezeeOeiuvEuzfiyuviivvfuuviyvfyjzwEkzwEknzvf2EzijuzyVz2wkz2zkz2Ezkz2zwnzizuzfevfifejkBBk2------3GGGGJG3F---3GG303G43G30-G43FFG033-FFG3FF3K4_OKOLOaO_OevedaPLLLLLO_aKOO__daaOaaPOaO__J2EnBkknBnBBBnEBzEEnBwwwwwnB00-BnEEBnBwzwzEzzjiuiiviuueuviiiviviuffiyyvfiiviuueeevvvyyviuwzzvvwzEBnEEBwkwwzzjjyzivie_G-GGKG4G_aLaLLLOaOLKKK44_aePeeeedddaaVz2wE2-nveeiivfueeefuaOeeeddeeKeeuviiviivfiufiffinwwnBnnnBnEBBBF-BBkknBnE2--n2BnnnzEnwzzzzjiyvzEwnBwzjyzvjywznveK_KKGJJKGLLaK_KKK3G4GKLK__LKOaOaeadaOaLPPOeeeaaOaLPO___d___LeiuiufeveeeeedaiuieveeeeeOdeOdL_eeeeddPvedaeeeeiviivejeiufufieveffuveeaPeeeeeviueefieeeffifievivvefieeiuyeviiueedMfeeeufzvejvijzkwkkEzcB-Bzzznzis-kzkknzikBEBkkkkkkknkn222222222B-B--BBz-BB0----0-2BF---knBkkzz-n222-K3Bk-B33-0J-0FBkkBknBB2J3G03GFFFG4443G3GK_KKKKLLPdaK_aOdaLKKJGGKGG3G3G0-33-2-k033--BnEuaOeuiueeaeifeiyvfjyzjjzwknBnnn22BwzzzEzzzzvivjjvisFF02-n-K-03--F-2---0-G-zyjefieeuadbieeijePeddeuuieevjffivgkn-kzwwknwBn2-n2w---3-------0-FFF3F3G0-----BG3J3-Bn-B-Bkn-kkBn2-n2BwknBwknBBn2Bwn-nBknB-nBB22Bk2B-BEk-k-B2BBn--BB----FPKdaLOKLOK_PK0OaaOK0G33G-22oFK30-G0KF-G0FK3K03K--3F--F3GJFGJG3-B---Bl--J3G3G34G-B3F-0-3G30000F03F-G3-3-3-F333-34K4HKTveuffiieaaaeePfivfivijzveeeveeeeeuePLKKOaePaOaOaieeQeieivjn2BBnE2BzyyieuiieePddaOOOePedeauiiuuieeeeadaOfePOaOOGKLaifeuiivfiiuveudePevieOaPizjieyviie-zyyujvd_QidaOajeL_HeOJ-JaOJ------E-Ek04G3-GK30-knB3FF-kB-FFG03FG00-F3--BEEzvwkn022Bn-----3FFFF--kB--knBzBk2-l-FF-GLaOOaaaOLJK33F3-3---322BnnB-B2EEzwk-F-k-33F-BKJG33G3FG3F-k-B22-033F-FG5KOaKdKG4JGKKGKKK3KJG-KK3J4G4KOaLdabeiaK8OeKG3G0JGJGKK4-G2G34FK0KGKJGJGG3G0-nz2wF0-F-n-8_JF-0F4BY--P0tSP--h0VngrNNV-131JF-C1OFgs-yWMryufyvwl3G3K-0JCKqr--QcWZtfifvzzjzEn4JKKJK3JF-S3GgCOX-3cY5hbu--BJGZkn9eegnMzStbs6tbXc-LXKO5dz0F-45ACB-0coCds-0oPt3r5V-PYdD5PvC0--JSsLs-1Z8kq-1JWy1plXV-9GBhR-6HHYfBOV-uIEYPn3--HWaX--8HId--oeiBlV-uKjHQgF-4HqwnBN-9_twqwF0xAqDhMSrU5P7X-e-IdWHnezeuQYn-F24OJ--okfDw-1eO79Ofu2z43FESCuGgmceeen9mgnI9xbtyOzzzrSTUzzpSzzzxpIMStaUxpI9pUtbxzzSyOzzq17ee7X9VecXec7XcXX9eX7X7e1-1djLCck-4IbhIT7-DbXXaf---oxnunV0PUH9Pjk4-1p-eZnSs1-4e0e0aTkk02J3sQCKKICEKSGxr5V1-NOV-N19V09ViePwlF-pFUggozs1-5e58teQE3F-0GUQ7-Hcpl5Qw3-2JPuvN-3eMuhfw4--KBcHk2HdfwLue_KGGQvyzfivkwzjvzvivkJ3FGGJFKJGG3-0K9aA-0PdgWPfkG-0pIONpN-0PeQwadK4ivizwzz3KJ3F-lKgCABxUUrxWbzle9ece9-09k9WOv2F-_O0RhEu-9TgqsLLOKJKKOuOeePMifveeOeaeueyBnEieeKaPdejnEyfjzvdaifY2yv2kn0-wzzpG3Fnzgzuezuviz03-GGJGK--HKG43GG4JK3J--knBo2B0FF-Bo--KP8gCN-79oXKPdOLLabezivvEEB-C-k-JK-1pfbTnSsV-0fVFlg-0Knt9oN--fko8V-CTqeCV-LjQxauBlIVxUDAgmonJeeeohBhKrKI97X75VfpxHogofCHX7X9ecfprUSKSpUMUKKAKxKJhrSonJn9nAAHpKBgnCHfIKJnKMpKrbzpAI9nBnBpKKrKJnxUxrxzSpJnrUrSpKrKxMSrKrKKUKUKUxrSrKBpxrSrSrKzzxUSrSrSzpzzSzSrSxrrMSKKSKKKSICCrKKSKKCCKKJpMKKBppAMMSJorKpKIpKCIIKIKI9fKEMSSpKMKCBpKSIpUOzxJrKKCCMMJonCrKKKHec10YJfCIKJhSkT0bzrUrKBpKKSpJmc92CxKKKKKzSrKpJpMxKBpKKKKzWsUzzxpIBmgrUMtbxKJ-0bzxonKzrSpUMUzzzrUrUaUbs9ce9997X770cVgcVUy1-c1-V-OtV6aOVWVNObts--1ecX7X7N5OWWyOy5--0aOu-UrTN19eX7170brMzUaUy--517V-UxzRUzttztzaN5T5-NNeX-0cceXcXXece7X11-WV50WVN--VV-OV750X--NN-55--551-77X7X1777--711-55517--VOWaV5UrKCBopKSrKICCKSSKSKSSpSrSrMMKKJpIKIJpJpCpKIKKIIppKKKIJoopKprSzxzUUTUSrUzbxqObbyT5-V0WWWV5-VNNOsNNN-NN0X55-5-5---P77----T55--NUaOzSwOa7V0a0bxza6ry56a6cV50a50yOX--6bX-5N--N51-OV-0baNOaN55OaUaP7ccccX77e99nBgmfA9mgnCBnCCKMKCKCJopCJnCABnCSSKJooprKIBop9X0WaN1-0WVN77755OtaOWV50WV5--70V0tWaOWtbtyTUtbaTUUxxxxSpxxxxr0WaN0VN--7-1-ceeXcX1Vce1Ve7XcXgmeBee72BcX7Zh9X-79c9e9eecYBee-Pc9ccXccIBogpBggfA9gggge999HnHmefBn9geXef9mmggcgeeXeXX97XXXeeghBgefBon9e1Xme97eehJonCCCBfCCKMMMSpKMKpMJe77-71-1177---NTTOWWaN50bbzzxrUzzrLN5TUzaOaTUzzxzpxrUSzUzzzbtyTUyUUzyOaOzztaOzzUUqOyUbtttWa5OaOaTX0y7Xc71V-c1c7c99cXc9eBeeXemeV7X9eX-79719Xf9e0VXcXc-5NeeenAJeeeeX7ee7fHe7-e1ceee7X7V-uypUPx3-6Mtb2ENV09zcUPj-F-pVBFgrLN1-2g66tikF-CVu8CV-9kVxas--4W7XD-3gCOhfw4--L8Nik-elDN5ivBkdJ3-8NhBfKs1-0gPHxg-0qF99nlc1mm0s5adaeOaaOdPPeb2kn2BwnBknBE2K30F1KZoDhMKJpMWVNP-7X-Kgf1KaPOaeLviyB--B--9Sa7_gnBppBfHgmceonCBfMKKT-ObtzzxIKKrUxrUs-VOz-OWy-V-91V57V97V-vBZGPg--6OeXYUXV0QCqDPvVF-6qTL3pHepzzaT1e--5nnAqk-4OwbATV-5nteLk-0P7sA--QGpKUF-_cujCJN715opaLTaaeievevjnBno-303FGG0-0LdEmrX-2hcRlzpF-ChnoCV-DrMzqf-0RLvrTonIKBnBorSI9onIICBorI9mfAICEJpK9e9conIISKpUMKxSUxSrrr5OxpST6xaOzbwNUzSUxs--55T7-c555T1-555TOtsXXX97117VNNOWcWbtWX29cceVV911V-QTUTQ-JSkGCCHprSSrMxSKSKxrMSrKMMSprSSpSSrJnSSrMSpKSSrKpxzxSprStbzs0a10s-N17Xcc-1-V-71775ecVV717X9cme7-9X-X7c7X-0ceXcXeXc7-PsDBqPfV--1M2GczyeV-fX4uQl-0M6BDrX-1iG4tzJ-4RoEIT725tjkLLaaieKKKP_zjuzzzu_QvBBn-F-Bx34_F--6Rw6vCs-1fbfrOvfiB34F-Ko7cCN-1vfosOdizv3FG-4MZRcpSKbVVX-YQoW9OddLKOK_K_4L_OaaLufeeOeuezuieeTvivs-3-B2yjjfiBkwpG43B4-3-nEEvkFlG9O_8_Oa_K3F022EnzjkwzyzBnkw2-F-ATmuACMV-0Lxs1aLjuivivBC3J-G4-1MkyLpy1V0AwF5TwpF-xylXBrzaXc-TzU45O_wwk4lUpQIAACUxxKzbzJmefSxKOaUprSzrzrpzMMKrSIrKUzUMSzSsUs-OzVUrSrxMMMrprSzxrxy7c7XX-c7V7e10aOXec1XX-7XX91e9ccXXXecX9ceoofBecV971-9cXe-ijumhzedaPdeOOPOKOjvznnkn-nB-kwl23KK-0ryhorsc-Dzu75f--SN-4rronMSKKKKSpSrSpKrKMyP71717-7X75-c---7-XV-w-WaOj3-0V8tI--R0bKUFCq-pABmpIBgrSrzrMzrxrMSUzaUxprMrzpyUrpbzzrpzL-57cX9e77X1X7eX1ggme9e90ccXX-7Xe9e-1w3gUOOTev2k0-0N9-5rX-0kKVCx-0NASVp--2kOvGanF-L3-KjuV-g86STl--7HQNV1B8CmPef-k3-0sI8aoy7-A1OR5Q--T49YCOc--kgKhk-D6-BCV-62a4qk-CWqkYAStc--gEBTQl-0NTP5xX-0kxzOg--NU81k162t_qKLfvzvzywnvzvC43GKJKJK-8sUQ_pSzKrzT-7X7XeV0wEs6O_jBwF-q7MWCIq51-3l32xjwK--NYW3s-63k-5k-4XS6fE-063vsqajviyE-oG4K-2a8rrgrKTUzrzrby1cemeX7ec2E477LPaK_aaOKKPaOavyBznwwnyBznnz0-2BGKJ-0NdJyoN-2lHeCek--D9ROhV-A4eNLwFJyBG2hBnKKBenEICKIBn9ofCA9fBnEICKMKKMSMpBpBooonJpKKSMzpKpKMSxzxqTOyTUsN--5OaNV0a1-0a0VOV0V--Wa0a5--1V7-6zR--7V-7VXc-7--gNtVPk--so2gw-1gQF5PyznlKGF-TCc8hT7-2ll8lbc0ZLDNKhJpJecXY9XgnJmhJnSSJe97gn9V-V77VfBmgofI9mnC9fBpBe--IICBppJmhBmnBeceeX99geecXmgmn9nA9mcBonKAKJonKSKIBedIKMSrUMSpJpKKxKKMMKKSMKKASKJeepJprzrMMUpzzUzWaUyOWzxlWzSbzpUrtWzta0aUzzaUtzzzUttbzbzUxUbzzSpSyUzMKxpKSxKSUprOaOzyNOzKJnBpBrsOaUxJnKEqT-OVOaUzOzzUzSprxrKrSrpptzzSzxrzzrSKJmc511ge97ecYA9cX17XX1-eXV19eBgeXIIIIJpKpSppCCCpxzSxrzrzxrrT5U0VUrKExSrMsOy-TObzzxz6aOV70a5NOa6zX--5Os70btbaNOWV5N5N75NOWV517--T-NX7-V7189Ve1X-V7X9e0X-NP1e71V9XX9-V0a7X--X-1---VX1geX1-OV7--V517epCBnISJgpIICKKpJnCBhCA9e9171Hec7XeX77X77eX156tyP-0xlaT570emXXBgf9cV77Xc-E7xKqsl-0t8v-pk--E8QS5z4-0OGoLpV-0mYdOc-0OM-9rc-5mlytazw4F-DLJ3CV-MAUnqfw0F-DNImhV-ACAhqg--LTbECsV3CFn8Oauedjl-FkBF-TfD9BrX-9q-PtjvjEG4K-iv0lVorSMMMMSSrKJpK9hMMxxpJmpSqTOV56VVObzs5N0aXZgmeX17KHcV-V-7V7Xc1c-vNnj5dKHfzvg-J--qnfrCKL---6qi1S_ejk0-1QS1Pojs-0CimSPQkF-is8ahSF--NSkIsOaiaOaaPO_OPaLKLOaPOOe_aPvEyuddwn2EjzY2BnB2-kBnBwyvBF2E-nEF2BJK3FF-ysNsCEKs172jRiqLePuuPuaiuiifiyvBB-EnnFB2n2-03LKHO_3JGG3F-yth7CMtucV-ESPhLMw-9vhdJpKHfSJ5NTOba9c7-rSzAadeUwEE4GJ-4j1Q2EV-nTXv6evjwpFKF-2QoSerOtec-QTvjqLnnp-0vrTHnT-0nUI7aKLiejfzkEyfnBKJG3F3-4jgt2T7-EUOnbzK5ugg3JUzba-9cXf9eedtrtyUUzbztzSzzzbbtUbzyUzbyUrzb_zzbzzaObzrzzzzxztztaUzaTOV-Xe79pMIJmgmmeeecXe7tbzzTUba--70zprSy5OtVN-XOta5UbbbaOxvI9moggnICSrzbbpSzpMxxKMSURgppBgeeeeegeenCCUzzzzbzzzzzzbrzpMUrzrbzttzbts9eeeebtyUzzzUbzbyUzbyUzxzzzzzzzzzzztVUxtaUxrStaObtwpMbzbzzxzzztztyOtbUxzbtzzzrrrzyTUzzzzzzzbzzrzUzUtzyUtyUbzbzrsN6txrrUzzSxza5ObbyUyUbzzySxztaUrs5OzztyUUxzqnMzrzzzzrzzySzrzzzzzqmmgpPpSzIKxzaTObaOzbzyTUbyTOyTUzb_zyUbzzyUyUzzyUrzzzzyUzzzzzzaOzzzUTUzxxxzrbbaTUtzUUrrxxzzzzzbtzzrzyTTSxxxzzaTUzyUxzzzxtzzxzzzzzxzQMzzTnKxyTTUzzSrzyO_SzzzUUzzzrSrSztbxzTUtzzzrxzzxzUbHmmeeenJmme9ggmnCKUxrzUSyecXf9geen--4zUTF-DzvjEc-6V4xro-0k4zvV0T0byObgk-Fw2QHohEUrSrMWuVOzzMX7-9eeec-AVbxbxF-U0MYhT1-1sBWGj3-8kUrYUae-2sF-daRk1z1YMBmeoegxrztbxrV9---D4KBR-0khenV1y7spOObjzBoG-1RHHipOX-0y8sYOeyB-F-M4VqC5--iD9xTo-1RSYPnqP-0DF1uOykF1U7BRgeerzzzzyPmccc-rZu65UyzznKKGJ" : 23 === fU.jJ ? bS = "FPKk37R-2VBxOek-5J0jaCHmenHgnrKSSyP0zSrKrX77Ve7VN6zp-N7-9N5ZUO_au__aOaPgBn2EjzkEE-laLKFnC-1FC8Fpq7-6c7bTOafiaOF09efjfj---BFBF-l0KHYCCSprUzzP--VHeX7V0cAg7PekBF3O0YbnBefSBpJxKCKKKKrq5OzSKSrUyOttzaOxKrKMtxrplX56bzs750AABp9c10ta2ABn9c0bX7Zp9cXgec5T0bs-97VX9X1ccc--2AWo-00boQV-cCjKOU-4kQUanKMttc79-4Vt14egl3-40uDAlc0H2oUa_aK4ddzzysB-B--J7Gixk-1cG_7t_Gifz--739S8gmefCISSrKrSSprSzOztVeomc0yUV6XCHX-P17e7c6s7-14fPa-JkiRsp9gzSHchpISpCSrOWc--5OXc0z-V--0VzW-3kl-TnASTOV7-95NULg---BrZc-D6ia5Qk9lkypinCSSzJeeeeeX9efAABnBmcgegeX9X7onBcdABfBme7mgnBmV5XX7X9XHdCKJmonIBeWWsNN7c9cA9797eXZe7ZpJopIHgnCKUSrJgnUJmYC9hMMSJrrSBjrICA97cAEI9e7VnCSrSpSpJnbzIKpII9Xe7XBpKMSzxrKBUSrzRUxpACHeee99BxxrxprMx9eX71cXnIIBe7X7-X9ICEKKzMSJnISHXV9-17-XemhIppMJpMSxzrKHcepBpKzSMSSSS9eX7XnKIJpKKSzSCKKSpyOaUaObxJhrzpHf9XgnBpJmmn9ggcVXge18Bc5NXe7-X--7cN5N-7V5P0c7Oc7V19c-9179hIIACKpMSJpMK98SC9XVX919V-X7ZpKSSxSHfIpppBe7177VBopJgpSzKpSrxrxr5--OzL6pKCBxa-UU5UMSHcdIAMKMSrSpSr6zK6zz6VUlzKKMWa55-USKUzzJggnBrIIICESrtbtV6cOaOaOcVOzaOaOV6xMJnICCrObrUrKrJe7VXmcfACIBnMxGbzrICrSHcX19XgnCKKBpEUHedCrqOzyUxBpoggegorKKBcX7_BeeeenAAIKpzTUzzUUzzlzzxBeeegnCKrUorSrUxlyUprMxbpc6btaN5N576zVUyN5OaOyOVT-OaOaN5TNN5ObaP50aOaNOsOts50s6V555T5OaOaOV6w0a6VOWaOa0aNOWaOaOV9emeX15OxxzzwN57OtaUa-6aOVOyVenA9eXBenAIBgohBcVOaOsOs0zq6zzaOVUyUSJnUaOa5NNOaOa55OVBnJgeX91IBgmeXXecVme7UtxrztbzVOc1X76xkOWaUyNOs50aUtta5TTOaOaObsNNNOtVOaUbbbyOWbaOaOV0a-N-3eX17NOs5557Os-99ge99eemeVV3YXL38eO_aOaKaOaO_aPOO_KOdOO__OeTedJG5uidQzdaKJFC3KJLPeKedaPPiivfuue_J43afjuEffivysnzvivfdKGLaeLOd_OJGevuivviuun-EBwnEEBnB33JB2EiyuyunGFl3FnEvnyw2ynn2BG32znw23--G1KFkn2vV--nskl3Fwo2w-nn-wB3Fkk2B0-0303F-oI13RnJNN--XSMAV-BJoVxc0HAo8aOaOOaPjwnBnB-F-3MlBT-5Y16Uebn3F--Nfac-LD6jqaMn-0oRMTxBrSEMNX----ct-xQl--0mV0V1cwJGOOdYzn3--RTQexq9--2oNx--lwHxo-0cy9QviwG3-06tO6-0O-7OQgxG-2H1sFmnUs7-aFnkLPanEkGWqH6dBmmfBepC9n9p9X1con9gggogmeee9mnxJfBonBnBfKBnBonIIJomopBhJhIBnICHnBnABmnICJonBpBgpCIBnBnIBnBnCIACIABpCBmpMprzbpBeee7omgnSBnCBfJnxrKSHX7ZpBqUxKtbpzxJcd9Heegnon9AAKzKIACBepppCCJrSF6X-0zzzHnpCBpCUpKKHmoonIJonIETUJpBpTOaOzJnBpCBpKSxKxpJonBnKKCIKICKKKKKoogonBppCMKUyUzzaTN5T-7V10V55-5N-0a----5-6VObtbs-7cWcX77V---VV--OxSraN-0zSKJnCKKKKMSKUzSlX7176bxCpprxopporUSrKlVVN-171171VT-USKKrra0Wc-T0X0s---6xKKSSUy7OzMrSMxxxxzHee9ecXccmghEJopKKKrKpKJgpMUMMMrUrUxprKKMSpJpKAA9ghCKJgnBppJnKKBgnJnBnKCCBpCISMMKSSSJmcc7V--7XnBnKKKpSSprSrSSUpKrSpKCpSzOV77-VV7-7WWaTTTUrrKzzSrSzSpSrSrSzrrTOVV0a1157XX--6zSUSxzWbpKMSrSzlV-6xpBpzxbaTTTUX7WtaUr6aUzzaOVV-0WxxrsUkUUqUzrUaUrUaUxKzHfBecX9YBgoxrome9ACIICCKpICCBnCCBnJpCKKKCBnSrSSSrSpSrMUSIpKKrKrSSURUlV56xKKIASJgpOxIGWzraOa0WWV6zSSSzWX5UzMMMMKIJmmnCISSpSJmeghJoc-ACKKKKKKpSrzzSBonBpBgoooopMSpKSpMSJmVNZgmgmnCMMSrKSSKHXX7X7XX19X7f9mmfC9ZggeeeeV9XcXAMSJggggggmf9eVOsOVNeggge59-X7X57X1ee9mgmehSpBpKKHX-XepSzrKTOxSSpMrpUrrqUzIK9WESKIICBn9nCBmn9mnAAJnBnICJrNUbza6xxpUy77VUa5OtbyTUzbxzyUrHmpppBnMSSrKrSonBoopCMSMMMKKpBpCKJoopCCBoognABgmfABnBmnHeeemgoenIBnACBeXon9c7eerJxI9gfBmgmnIMUaUrUzrIpSKBmchBmnzSSk6zxbzxUxS9cXYBezprKUUUza6bbzRNUxa-NVObttzUzzbyOxrUHnMSrzzbzSUpAA9cmmnMKpzSaUaUzzzV0aUr5U6xrSSSrKSpprzpzSpprzxxzzzyUtzyN-55ObaUaOzzztbtbtza0yNNT0aTTNObrIIBmnIIHnIBpIIII9enBnBoon9gpIIJoxKKKJmXA9BedA9mmeeeX7e7e7emmee7eeA9emeef9meegfCJnCrSKMxHenBonA9ec7e7fCKKCIIKSSKKCBmnCBnIBnBgpKBmegghKrHe-WBghCKKJnBmmnKIBnBonBgnBmfIBmcXXmmnAC9gnKpJpSrtbyOV0bbrxzxxzUUKKrIEUSlWaOzVOaV290Wa-OX0zKlz5-UtaTUUaNV0V5UbzM6wOzxtzyVUzzzzSzSsNc6xUxKUzrLUzrxzpKMrxtxxaUc5--Obtbta0VeX--UtVV-NNNOWbyTUtWaObzzzaOzqOztaUxxzxzSzSxxrUSrSrrR5N0bzrUzzUbzUSzxwTUsOX797X3e-Uxrzxbbbzzz-UzzrrqOaOttzbzV6VX7X76xrUSprxrSzSbzUa-0aUKKIra-UKSrrrSr5NOaUttzzbbzzzztbqUzzzzUUxxzrrxxxzxrtaOa55OyUzyOzyOzaTOaOttzrrzzsV-0WWaObaUzyOaUOttaOyOV--11-1-6yT0c97n9egmcXmgeeZfBmeee0yNP9VXe99gmhJc-NT19ccme9gepC9eecee99X99geHeeVgf9nBme7eIKKCBmXAHn9VXcVVcHc0cmVeXc0V29gefSJnBnBn99997XeX11--NNP9X9ec756V1717HdCpKHeen9efBeeemmgfBeeeeX9-76xrKzzzbyOyTUzztbzzbzs-0sUzxrMrKorMJfSzUzSrJopAMMUUSlxrRTOaN7V-Oxr6wOzzzUKKMwUzpMKzSSrFTOzz---OzOzrqOaOzzzrUyOzzzMrrUzrUza-ObzbxzWbzzzU5UaOaTTN---57-7mn9fBce0bzyTObyTT0xrKzyTTTTOWsNNeVN5Oceeeee6zaUSztzrOaOaOa55OaOza16a-0V0X--NNOa50WWV--5N-7V-----71-VX17X7c7X7X7X7X997Xcce9eece9XmeeX9me9eXf9eeefIIKBpBpIABgocXecX7X71Xccc5N5Oa0aOaObbaOaOV----71-V7717717-VX11X7ccX9777X9ccX7X7X7X-1eemefA9ecXXe0bxzSzbzbztbzzxSSrSrSrSzyOzzUrR-7V7X7V7X17X777X-X-X1-17-VV-0a56btyP7e99XcX7V-X9e-V1VV1-17X7X-77X7ceX7X97Xe99XXecce79eC9X0c115VX7X7VX--111-----X7X1-V-X7V-X10aN7X11-70V-X7776a---111--X7V9X9X13gcX-7X7X1Vc7-VVX1-1cX17cceece7e17cX9X9eV7X7eeefBnAJnCI9gggeecc97ef99e7ge9ee99Y9e7eX-6pzbzqUKzzrUz5TTObtzTUV-OaOtWWyT0bzzxSttyTTTObWaT197cX9ecX17NN-7cXegn9n9mmmmc-OaObzzyOzzbbzzU5VOtaTNT6baNOWaVV0bsN--5OaTOaOs56a50WV---OWa0aN5NNN0VX7NN-550VOV55TNTOWa0bVNNNP-1--VV-197VVVXecce9fBn9Xe9AAAA9eeee99ceeee9cefBmgmeeXce999X7ec6uGFSaLO_K6dGdd_3GKPaddHvyfgnzfydaugEvivvdJGKdLPiivvyyEdYzBF4K22no2zVkFn--n0JFBBzfBl4JJFoG--HA4ek-9GVnLnF-wZBKjKK----PHLZLQfV---1JIPV-098zk13_D7xLUxbbwPeXec-1HjA5--HLPFk-1Hqrb--1LtNV-8Awps--8WoH-XZlwS_feKaPeeefiikn-G---2BB---1S_XV-8EZes1G9-NnBpKKKKCJpEMKKMKMMMUtzqUX9-7-1-5NV5OaP7X-UXXX-e7e-0dFKoudwB3-29I4IN--_BZzV0RdZphCUUtX79V-OIPivF1BeLHRejzSztbugeVV-0JwhF--eUEs-5KIJUV-29dgMN-4_LtYfj43--9q-a-6__B_aTwn4--mpgBo--OQ5wv--whuwBpSa-V--LxUZ-2AXqAF-__nS_a_8d__LuadPawnzzk-z33G2nB-5mtkmnEtzryX9eV78S83Oa_PfjiiizgnBn03FwFJJK--1vpcV-tTeHObk--B6uH-Fa5-xe_LQivnn--G--22VwV-OXEjQ--JlVUCu--dZHwOx--I7aHk--O4RR-4BciQq7--OGkw--BelX-3aMK4iw4-0nDDcwTc-1Olsa--nDI6q--dcAAts-8IFn1nIIIIIGWWa0WV-9PYcDY--Zp6IRzNV0ePfb5OaOLOeOfvnkwEBBB-F-ZpMlSyPcBaQ-DaOaPOKKLfuaObvvzzivi_JKKPzvjzkzzBzEudOd_KLaP_aPinzwnwzeaKaOGKaK5aK03JOaeQfyvwnwwzvYEnywnEwnkEyeTzYBwnBnkBn3Bk0_F4JJFK43KdJK-F-GF-PJ-3K0-0INzon5-1aqF_y3-2CmUIu-2avHlaw--3rPOi-bayMKeOJLOK3aLOeuiusn-BwznFBzw3-1grniBnICAACUa5N6aOX--ayTnV-gs3CRpy-V1dl9Iua_aEBB---tags-5Rzdjo--Dg2i--bL1rV--v-cN--Skio-2DuPQ5-3bUBxvYG--Ikdgs--T86J-xEI86BmgmYJhSHoOa-ObbkTOsV-0usyF0JyT6gnKtta7c-9UUWinF--yzRN-5UUkDB-AEnv6HjtV-9Ug2TT-9BzUjggnBmmnBnBnIIBprK9gnBopKKKSrzUN--OVObs-OV-Oa550a5OaWa-1-KbwxWaOLOeOfiwn-2BB-0gzcFwoonCbWbV--1UwRy-2nza2xryccV-P-nOsk-C-X_xV-5VWMyV-2FNt6N-2cCLtiBF-p1RnSSR-X-GcJbbaeVydzjWG03-2lFnKnABgnJgn9-gmenIKJrKJhCCIKttsObWV5N6zzpBofJrUSSpIABpKUTOa5UztbtaOVVV--VX-X5V5171--V-P8jmsk-C4-PC--9XcWDQ--04u0N-TXxBqOiv----Gkve05csV4aLPKaPedfiuuuaaiyuiuvjzjEz2BG-BJ-k0JJBk-0033FGJ-4JRjgnJpSV5V-09ETJUi0F-C9OOj--1aDAEK2JolqnSSSHhI9emXjSICpIIrMSrMKCK9fMUohC9nBn9c0yOaN7c0aUVOX7X7VX-57V1BnBmdBegfKRTOxpBdCCBc-XBec5NcgpIHgfBomX7eempKIBpJmnJmc_SIKpCKzSpJggeYHXrrSxoefUUHeVeeenIACIBhMSrzSrrzqUyOxRUObrR56tzKIDTTTUprx9nBnIBpMx9fBfBemeAIpBmnAABn9fMSlsUxpESzSHeehrKrpA917V1XAA99_Bece77eeenCJoomf99-5V19VX9emeeXcmY9Y9ee99X9mmpxxp9fHee7VY9nICKopKGaOs6sUyUpA9frpIKUJmmjKMObsWbxpCBnSKxrKzK97ehK9V-X-OcXgeXggeXCBmrUzzOzxKMUSrSEUzyOyObxtzrzxK9frzHerxrOxomge73ogf9Xf9gmpKIKpMUJgmemcmpzpHce9YBggpzxSUJxrSBccfCKrOaUxpUzRUz16yOtxCogmfIKUSzSaUWWbbrUS9n9pKAHrzza-7c6xaUKJhM5N0zKSUzbbzzzzbrbqUzbbzzpCBfEzzxBxJe9en9jUHfBccXXYCCIIHnJonSBhEIBrTUbpKABgpKJnBpCJeegnJnIABnABgomnAByUrbzaN6bzzta76xKrxxrzaTUxBnrtaUzsObs5N5NN-OzSxKBrSyOzrUzzrUqObyOtWV5Oa0VX0a597cOtsTUUtVXV0yOV-NTUyNNNNTTOttsTNXX1X0s-OaTOa-71777-V5-X7X---OVTNN5OaNN5c-VcX955-Xmec-V5NN110V--110ba6WtbzbtzIABeHgnESMKCKIC9pSpIIKKDT6zSSKrrKKrKrJpBnBnCKBpKppSpltzxoonCCKIACxMKJoommnKCSrUSCIHmnAABgoopSBn9nKCCKKIKBmcgnJnJnKICBnKCBmemnHeX9XZmXXggen9p9X8JcgnAA9ggee7emggcme9XmnIIKJnABgmmgcegpzSzxKKKBhCtzUUomemmf999X7-2KBnBeX-7ABggggmfKKJe7YAMKJpraUWzUrtzzOz6tbztbzzaUzroofBcgpHnJfA9gf9gmmgmnAJnBgepUKITUxJpGaUa0bzrSJpEURUraUtaUaUzyNOzbbbzpHmcnIBfCJfBcfAACxJn9efExSC9efBjbrbzzOyOyUUztXcWzzaOzUzaOyObxzrJmcCK9fBn9ABfHnACBzbbbzaObxIBnBnA9gnABprbtWbaUxxtz5OyTUrIHjSzrtbzzOa6s6bbzttzSp0bq-56rzzUxk-5X7UzxqOzpSX-5OyObxWbzaN-55X-0zaN6zKIAACrUUqObztbu0aUtbzuXWaNOVUMxyT0ztby-0be97WbzOWtyObzzztzUzs6zrpztaOVVN0zMSpKLOaNNUqUzzzMUU6bzzzrqN0a-XcV7X71Vc5UKbxs0WWWWaN5Oa5OV11--0VN6a5---5OVOa55-OVOX91------77VNX7--57XXcV-OtaUrps7cVVV19Wby-OsV117X7X7X1------P9--NXXe91---5OaUxzSzzsP-XcX7X77c7USrzSxrSzKztaTOWbaN15NP7VOaNUyTUUzoN6rFNOaOaV6sN7UX--6Wc-c-V57VX1--VXeeeeenABmec0a0aOyOzbWWV--X1AIHc-1X-cV777cXV-0VceVV5-0a17c1X7XmmeeXX9A9ceghA9mgeggp9eeee7eIKIIJmppCA9ecceZoeWa-5T5NNUaUaOttzba199c99cXcc-V99eX9cV-ebIfrjzvV4KJ-AIfizEze7--bYTo-2J5JzF-7e4Cveve-33--JDSm-0e7F_s-0p5hSp5---dD4Z--JhAe--9NdC--pBL_q-1ebAlOejzkK3--KJUNww--1d3vF-CJs-Uc-5esiio--KWC9-1eph_ak--Kx9T--f0e2k4xNrdwgge7ggpSIAAMMKKzzrts17VNX5OaTN5--1oVgF-0PFWs-1hRm6-0pg5yny71uhi0yPdvjydTeiebebfziC3F2BB--003G43J1rMZKA9mmgnBpIBopCBhCBgnJpSIIICCMbWzpqTObbaOaT7TTUV-5TPWbV5X7V--5NX--frBUk-CUlBUc0ukKbDLOivvifyeizBG-033J34--L2d2s-HkjgTOYB-0NUZf-2f4OmOaeivnFFk3-0LAowpX-0gXRxx-1LKqcmcUV-AB3ZR-0Op3z-1fGBZOizwnJKF-4eWGi-0hJsrx-5qjBsnAtzrUXX9V0fNcdzzxKJ-2QIMIu--Cj7A--5tSdV-QUQbu--hk1IRnTNV5QVSGuuvevvzEzB4KKG443-1ho7gjxUrUrTPc59Y9ce-6iaDleQnBG-0rKfZrNV-Dxq_5jG--6sEpV0QwNEunnK--6wn1V-33G9k-129AN-60dGDo--Vsiq--FeTd--7RqOV-3GGnk-57tGy-2l7KYvp--yA0SRfByOs-04mn3-4XwGzTV-04yPo--Xz_P-1lVB2go-4YNGMAs-65rrUV--YVN9--Gl1M--Nueus-06i6B-0Yt5zV-RUu1Ok-DFK_hV-z7H0idKbjjgBkBK--O5rvs-E9EXLbV1Ov8biOzyOV-Vs1-9A7ghCJnIB70V--79AACCKpQ17N-VVVXeenCJogmVVXXf9fBgmgee9Xe1XcX-5550a0V55OaOyOzaTOttaUaTOtttzzzttyUbyTOzzyTUaTTOtaOaObaTOaOtWV-OaObUxtV917XX--NOs-X-0WV-------110a55--1-V0byOaOWtaUzbbbbbzzbtzaSzaUbyUV0goJQtMew-0par0fJmfAA9fBozUzSrxUSxrUztaOV5OtsP797ee7XXe-1nZgKso-0bEIj--RtwnOk-TSCdSJ---Im4G-3Ou09nKL55X--J9VI--9XscV0hMvWOiEC3IxgZclzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzVVVXcX---V71X55N---X7Xe-8bxrzSrxtxrxrxtzyTOaUt_xzzprSSIK9ghMSKrSMSrSSSKrUa6byUzrrUUrzUtxzTSzzzzzzUUUzzzzzzzztttaNOaOzttzzyUtbtbbzMSrryOaOV8aUxpSpCKrMraN--5SSIJnKpKU_y0y55-5UqppMK9fA1nF0YMdQ5OaLLOPQzzvgk-223-0v0HHnT-" : 24 === fU.jJ && (bS = "SgAw3LR2oV-FhaeaePePePaePdePePPyaaeaeddePePPadePaaePaddaaOaOaOKKOOGLK_JJKJGG3JJJGGKGLLQdGHJJG444KFl0JLKaJ3KLKKaKJ_4GKJKJGGJJK44GGK3G4JKGJGJG3FLLLJOJK0LKK4KJKKGJKG_JJKK-304045K0-AV-7fxSpppKKMF-V---V--3-18i-0J-4-USUJlV-N-9-1WDK--F-4Bx-7-V0OvdePaaaPPPPffefeiideeeeeieveeaaaOGJOLOLOeea_beeeTfeieeieKKe_Pu_LKMefnnyzvevydijjivvuvffeuLPviuviiviyyzizyzjzjzjyyzwzueTYF2BnzzzzywzzzzEzEzE22nyzjzzzzjnzznnnnwwkkkF-BnBwnBnBn2EBwnBwBn-knBwnEBEEnnnnnnn2nEBnkwzzzzwznznwzzzznnnEEywnwwn22-zyvnEveKdiuviyvvjzjzzEEBnn2nEvvyivfeuvviyzjjsn22-EzEzyzvyuizwwzvzvyvBk2EzEffyznzzznzvEnEBnEsn2EkEEnnnEsn2yzyw---F85---AeA--k5qSlnzvTe-evnzEw-nfn-kwn2BnnwzznmzjvznknzBnBnzjjzzkuzzyyzzyzizzwzvzyzzyvvvjzwwBnEyzEjiffjnwwknBnEB-kn2-BnBnBnEEnwnBwwvzAiwnzizwznz-GJ3BkkkknBn-222Ewk-BwwkwnwzzEBknzEEEBkF3GGG43G030-F2-30-F--BBknBBknBkwk02nBwzBknBn2EBnBBE2222EEzzEn-G04GzBnBBnnBzEwzznznzwzznzEzzwwn22BnwwwwwwwzEnnwznEBn2nwkB-FB33G-kvjEkk04K--0-JF-B-2-B-3kkn22BnnnnyzEBnnEBwwnBwzDufizzjzzyuezyzzk2ifvzzzzAiOevzizAzujiqiznwAvyuvw3Byzj-nznnjn-B3knBjwnBkBwz-kkwzznzEBvzwwzzEEEnBkBBkBnEw2B-nwnnnEDzvyyzijjEivjjvivvjiviz1yzvvfivfeeeieuPufijivffeuaeeaaezwzjiuOevzvvvffvevvPtKefizBBjzvvjivjiiiuuuizniivvuyjeeyyvuvjfiuvfzvjzjiviiivnnBwzjjvvznEviviiuvuveuiefwnjnEiyyyOaOPewwwzzkznziiuuuuvaOeafjvizAvjivivzwknEjiivffeieuifeuivjfffeueueiffijfeddaKKaLLPeveePadeO_ZG44_aO_LKLaO_4K3LLL4OPO_OOKOLKK4OKKK___JJJG3GKJ-JKK_KaPfO__443-JKe__aLPOeOeiPfeivjvfizwzzziizDyyvfjiyyvzjjivjvvvjEzzzvvviviiuiiizwvjjjwwvvzuzE-3-222Bknk0033GB-K3F3-2Bkk-2-BBBkkkn2BkkBB2Defddeuvuzzwzjwwkkk-22Bkn2nnnnBn---3-F-BBnEBEEnnjzzBkB0GFFkk332-kK43443K33KKWK3F0-BBBk-0-nBkk2-kn-nBnnnnjdajjjjjyyzznzjzjfevfeifijfvjzyvwB--2-kk-03033GGG0FJJJG003JKJJJGJKG3JJJG3GGGG444K4JKG4JK44GGJGJK3K43G-FBwnnBnE--G0G44LKOK_K4OK_KGLKK3G444JJG3FGGG043J3G3JG3G3G003FFFF0-F-F0-FFFF30-FF33G0LNGGG4343JG3JGG43K43G3J3G03G-F0--F-0-I-2AjwEB-k-G43G0-02-222nwzBzEBwwnkzwnBzjyzBzB3AviyvhOPfLKOaPifeuueeiijivfifeviwz-B-nzk-22-k-kBvjvueaLaiuyzDuzjij-GE-G34RDyvfeiePecGFKaPvyyjmii4W3LiiuvffvviyfGPjiteviviiyviviviivzjizjvPeevivzEwzz0EEezAjjjvzzivivivivvjvjjivivp444GKGKKPizvzvvyyyzjvyvzDujyyyvvzvPvjjjjiz1ivwivfzivjjjjiuievjjvvzzvuPuehdPeaPPevivdePeteitdedeePPfiiiuyid03KaffuiviyvyyzjiyyuviuveZK4OLKPPiuyivvfevvvvvzk33KZJF0-JGBwn9fziyvPezefjevizziivivjiyeveqL_aPaeeejBvnBk0k1wniijLajknfeffw9ieeyzEn2nAujjzBwwjxaadd_K3KOaePeOaO_PefvvyyeuzvjjjiviiiuiPOPaeievivieiuPz9jk0mjfj2B-33-BnEzeevnivevfueuqPivziwk-G-n-0n-nEEiiifyiviujkAfjjnw3G33JG0-nB033F333004JB33G33G-F30mvizBvizzdaiytPjjk6BE-EEznn00-KZI-GKafiJGGF3-R-44KW2znBnEzknnnyNKOajOevz2BAnyzefjEfivijzB--030-3-33Rwk343GGKJKK4wzzzzEtezffviqeyzuPjEjkvjnB--30OOGKGG-0FFFFB0436-GLKLKGKG3KKGGG-3J3G4LLLOPOaOaKaPzznnjnyyyyyvjfvfzuvP3GOZKG6-G4GKdWk43KLFKLGGInEEEBn2B0L-G434G2Ek2fzyviiOWKefwzEBwwk3403FG3G3G3KGFG00-34G3FG3JFG-F-22B-40EB3UwBzBBufO_OfivewvvjjyyzviPuivdezwzjjzEkGG4GGGFG4362EjzyyyvfiivvizkB-303K4K3G32wwyjmyzziivvfzE-3JG3G4FKJG4eKG32-JFJ3JBnEvzjzEBnEBn0BBwnyiuzDzEnBBnwknfzzwvvyzwyzzEzwviuuuuizzEzEnzwkwzzDuOLaKaO_aOaO_deuvaPePezBnBmPPOKedfeeeiiddeefzwzBznnEEnnnzz2yd_aOfPLZ3LfePyzfizjiqOeqfjznzdaOPiKO_aifizufmvfjwEzPKLLOKW0KdcFJw-GG33G4KaPeiiufnqfPL3KaiLezvzyyvjzB-zDjiuizBzvvjzmuheevaOaJ34KOJKKOL_aeizBzjfzBkwuzyzteufutevzBn2afvwmPjjBaPiaJGKOaaeiivnBByywzzBzwnnznznwndad4OPfOfLKK__ZKddLKOdPjjwzEAzk-nmzwzEEALOajyqKdfvnBwB2BnB3G2vjnk9zwnfejEziyiwB3BnyvmqOefwzaeufvvyvvvkjzjzyjwznBwEwnEn2Bwvyyiwk20k-F-2-0-0--RBnvzEnzEzzwzyzvzjzjjzvjwvzzjiyvivivfjvjjjvzzjzznE2Bzzn2EnnnzEEjkByz0wBkkEiiw-Bn-0kkn22222knBBknBnnwyvizEvzjyzjvzBBzzn--kkKnnwBkkknBjvviuiiiPLaOddaPPaPeyiuvjivfdedeLfiuaPfaPuvjzjiifiiiaeeueifiiiuvfiiePPOPh_eaPPiPiiuehedKafiqaeePeuaddPiePejaPPPeudeuuKeeeeeeeeueeeeeeeaeePaePePaadePaaaaaaOaOaLO_aOO_OOLK_GPpaO4PLO3k40kLPqLa__nE0LOaha4PxaJLKKG3JG44GKKK44JG3G3KOOaO__OKKGJK4KKKKOOaLOOajEEBnnzyKPaOa4ZLOd4OaJBwww0LOOOOOG4LfeaaPLLJKPOdaPOaLaOaPOaOaOaLLOO__OKJKGG44GKK4KK4LOKOKKKK_FFFKO_aKKGOK4033KLKKK4GKOKJKKOKKWKKK4KKK4KK_OO_O___OLLK_K4F-FFG0G03-44KKGKKLLOKKK_KKKJG44KK4GKLKLKK4KO33JK3Bk-G36B3KKGKGK4GJKK43KKKKJGKOLK_KGKKOaOaO_OO_KKOK__aOO___aOOOaLOaPLaOaPOaaOdeaaaPaeteeeik-318nR--VGPMV-J1cyRlV0c555udY-k-2-pMrD---TOI-7kF6znBpIErxsPVV--OVfRraPOOOePfgk-BknBwo-4kWWfpA6rrX17--08DA-VFaSWpMMSUKCMKMKMKHcYpSrrHe91V-V0u-7770blcV7X-0zV-sLmjuE3--1yxm-0We-vg---zVXV-7VCwN--38Cy-5X5LvaQj-F--FniN--7WAZ-O3JLUSrr6cZe7V--XXqk-BHQVCc--8Cpw--3ebH-4XKJIivG3-43m0Ao--D8Z2aQV-1lDMlow6c--1VSI--0G87V-NcZutk-3JHWT--Xa-4k-3Jyrg-0XfZWY--0Md9V-7gHHR-64_zAr1---gk1F--Larc-9APr6h---M3Vc-PAdfbisp3--0T87V--jXGF03MzzESrP7X--skSXQh3--5Dp9-3Y8GOisF-3lcLHxrrNccV--C1nJ-25Yaju--2IeI--Gg31k--D4dJ-065XIV0svUnviglG-3ZUBSCxzUUrrzUtzts99eXeecp9999-YZ9GC_OLzyzjzzzzzzz4KJKKKGJK3-I7p_UCSlaNcV1O5jDOuUzBJJ-t8042SEUzzOtzzUaXceeeeXe-3ZbgKdsl0FmKgLnKJpKpIHc9YABomeBmnHdCBpIBgrUMHghpMUSxpBpAEMbzKCCBrUrzKAAMMrSxzrrGxEaNN5OWcNN----N0WbWVN----V5--177V0a--7-VX-JZlG8bjyzyzjlJKGK4F--8dzX-5Zqo8_vwp-23bW-gnHXmcmprzbzMsWV1-7_HRz_evn03-49jsvGV0LKrUEjiivvywl3G3JKK-0Hk36pV-8_ZGffyjoG0FUBghYRpIA9gmmeVme7eA9enAABpBeXXfBgfACpKBnIKBnBnAABhBghBgnIC0aUyUxbWWzttzrKrUxzaUzbaNmX7cV0tzzxzzJnHrqUbtzaTUbbzryOtzzxyOWVggecceVTObVTUbbbyTOzaOxqOyTUzsgeeegemn9cXc19cXXXX---4cG6--Hqlvk-HLsy5iBF-EAT2rBfEta-2_k3leB---i9AN--O9Ww-YBjdE9efIUzTUba97--OVmg-4Bo5jJ--VPRAtK39vz-4nGQwmnMqTOVe--aZXrk-Jon3xNV08gQQOik--ZqRaBrN7-LQoYjiwK-1ZrofBnJpSzStbV-7X9V3dkX8uefefgn-C-343-ID7cz9ejUTOV28mSguLfEnz3GJ-KDMtMpItbuXX-FbCT0_OayyvBwkJJ-7nbZKnSxpC5UN1-X9--bGDMV-RuaRwze--6Jvn--nfK0yV-0pgbk--v48N-PSdzTPLnB-0ni44nGV1mStzUfiuOdaPaeuyjiuzEw-00043F0-l3G-XgvurghKBegohABpBgfAHmmeceXX-7N0bs7oogpIKpCCIKrICMyUrKSpKIrSpKKMIBnKCMTUrKKBeCKpKKBopKMKHpSpoepMKq-NUrKprKbzrraOaT5-V-ObzT6zUUMUxra--0a10V-0V--N-5-0X-5NVX11-NOWaOWWV7X-1-V757X1VOse7-7BmX19cX7--T3s3-AE1RQEU-c--TDAg-4E65bR--HTE4DuV--IE7sMCFOzu9V4OtOgOOOaLPzgznnw303--ED_5-_c2G_aO_3K_5LPvevyw-EeyvY3-2-k-2o4M9mrSa7V-130zk-p1C9CUtce--7Gyf--o8DGqV-182RF-x5-RRnLTNV05YE6iOOKiivjkkB-F-x5tiBpLNNV2eYS3LLuO___KPPQfvvzgzivzvzvnwnE03FFGG4G20G4J06HD4fAKJz6zxzSrSrzX-1117Xeecc-PZq7iPQ2B--oarQnVO9IasOLLLLLLLLaLLOLLPvyuikBwzyydeevjzYvfiwwwwBkk2nBkkn-3JHO_JG02n4JBnp_4F-K8uQCNV-1JEMF-C9Ntxc-D_Psav3-5oj3TnCCJqObV7--1M_Ek-pApuzKkNX--8X1Q-FJl3bmpKzxSIKBxrqN--779e0a1--dZuzk-0BvKs-ua_1LiivvBlK43F-SCENx6e-5dgxdajn3F-0CvuN--b1no04IdRzAEUSrMMMSKaUaOX7VccXX7c-6dqdvaOvg--AJw3TpIrSzKzFT17XV7cV0PWlHPikF-Kp4NHmgpSrrSrKBnCSxrlWtV5-7-X5-XceV-9Y4vN-AJVbYSOVc-PdM-DQzCG-5KA12nBghraOa-0PdNJyKaLPOee-nBEBknB-zJhSA9gfAJmnKRUrSaOaOaT--c-SeMWzfu_snyEzvcEk05K_5K4F-0Jj6UV-1_vfF-0Hy77-1daXi-0pCEwnOV--dh4R--JuFL-6empp_ijk3--4Of_V-1hn6k1CMEoBhCROzMUVXc9--eimdyo--KUEsk-Tfu6TMzvGF--LEYu0df6q6aeLKJPK4JK8LKOgznvyvjvvyzyzgzvyyziyvvgwoK32nEywnwl4HKK5JHKJFoK38adJF43-74PMBBppJefKCISU5USUTOxxqTN7X77Y9--V6pppqP-919I9729hQ8qOevjvfjiviyvjjiynk04KKGK2-330K3G4-2KREugmoegnCBr6tbbba555V-1sxeF-KRU8UuV1PtQMPOKzgBo-4MT-nlc-9jc3qc--0UG27-qjjX5aPfcwBB-J--Mry9-8fxgpbijBBKF-KUi1CsV0uzSLPiYFC--_VBQEqPc-ekCO5eyBklOF-4N9EAGV-mkJjLiuPgn303--51edV-v1FytYB-zNK8ABppprSxrOcObxXVcXce7V-1gBbpf3-GNONISxqVXV-ql0BaOfeQYBB0354Ngc2AHnBmnBmoomnBgnA9mnI9mnA9meegegeeXxMMKJnBeXgggnIII9eXpSrMKSxrMrUzrzzbaUrrSlyVVNOtztttbWtbWa5-56bbxqOaUzX7XX97c10VNUa0WaOaT5NOWa5T--qlUJMeiawnkGGF-nNuf2BhBnCpprMtbV-N77X-0gW2lg--LFYks15m3UaOLO_daO_evVkBzwn2kzB8G-BqIIBnCCHnCE6sUwOsNV59V0Q955OaE2-0LK6JqP-9geGtdasyw30-9qNsZnIBhHnEyOa5ObXV-1nIZb-4LPlsnCrwNWe--2Cp5F0Sb82hrKr0V91V-2DHlF-hb8PBhz-V-2DlYF-0bbb7-PnuwaLNwn-2LVKHnETP72Xo1q5LLLOaOaOPPPaaTvueeQji2kn2-wBz3-Bkk-----Sd0YCGc-Dh8r0eiyvwFoJG3-YPIoIJx9AMMs5TNXV-iojDaOfyswJG-34dgJgnSBeC9pK6btyT7VTUSX91-0fKEnOaYBk-0PpKQ-1AM5LQyvkKG--5j7JV0AN2eOQn--0gUC7-yqTD5vueKvwk0G3-0qpcTmxV-Pqh7aPzl46nb6W7MtaOzxpIKCSMpKKrSxSMSrSSrSrSrxxrzUUUzbzzzbzxSzy5Orprrrrxzzbza6TOaOW_JppKrAKSrrzrrzzaUUUpxzbSzzTUyUtttttbtzzaTT50WVOyOtbttxtWbMUSztaTN5UbrSMSxzzbaOa6WWWtaOzaOtyTUbtbztztaOtzztxzbbrxyUzxzbzxzzzttztxrUrztttbtaOWbzzpKzta6Mxzzzby6aTUzzUzxySySzzzUzrryOSxrrUUUQKrUSzztzttWbbtbrzyUyUbbyOVWaTTUUxrKSzrzzSSztyUTTOV-94zxtpxzUMUxzxKSzrttzaUaSxzrzzaUtzxsUaNOWWtzbaOUtyTUb_zaUbUxrSzzxrrrvAJopSMSrrRnCMSrTTUa555UyTTOaN6btxIMMMKABnIIICCCIIBmfBenIIJpIKMKSppppprSztrCMUUUxopSopKCSprRhHnKhJofKJnIIAIIBmnCCA9gmomnABfBgoonKKKMMKrMSrSxprSzrztyTUVVN-6zUzUSxABonA-X9nCKCCKryUby-1UbSrSpCKMSrUTcenMSrzrzTOrrxrUUzxrrrrUUUSxxxxzzUzUzzzyUtzbbbbtzzTSxUUrzUzzzzUUrzzrSxxxSxxrzxxzzrzzxzzxxrSpSSSKKS-0vUHOuvwl4F-0kZgs1XsRiaaudedeaQiueQiw-wl3G0-B-32-F-fRVXnCCrKMSzX5N7cc7V1Qd2JOfiwkGF-ISqFQAILOaNV-fjC8Pl-1rXaGpxV92NjCXdaifeaLJ-3eeaeefiywzzEzjEvgznzjzEyzyvznyyeejEEzznwzEnkzzzEEnzEznnnzzvEE22-032-_dddJKaOLLaOKFFB324K__aKK4LKKHKK2JK_LK4LLO__OOKKG-3_Fn33KPeLKKKK-F3--Cu9YCV-XymfLQjz3JF1KyjcBpKrrryN199X9--Er2_--6w9TV1w48YtPevi----1sCjknrN7-Dkd8M_daQswn2BJ-4WIe2TV-Y6MNa_aRzl--5F6li-3m1odvnK-It0xxpKIpSKpKMKxJhxa-1-7--1-X--71EDbJiTeedivzEvyj2n2oKJJK4040F-qWOwRnqOc--JGhS-0P8m7xc-9oUZUaKdvwk2-8Pa5WorMUUzlXXcX7c0SNaEc322222-kifeeiee-8A3iK5N-X5SxxpMrr-"), new a1b().jS(bS);
}
function a8j() {
  var a8k,
    a8l,
    a8m,
    a8n,
    a8o,
    a8p = 0,
    a8q = 0;
  function a8s(aN) {
    var a8t = !0,
      f7 = bG.bH,
      aO = (1 === a8k[aN].id ? a8k[aN].j.fillStyle = bG.a8u : a8k[aN].l5 === ct.cv ? a8k[aN].j.fillStyle = bG.a8v : (d5.xt(a8k[aN].l5), a8k[aN].j.fillStyle = aR.color.fh(k3.uY[0], k3.uY[1], k3.uY[2], .87), 400 < aR.d.aS(k3.uY, 0, 2) && (a8t = !1, f7 = bG.r8)), a8k[aN].canvas.width),
      g2 = (a8k[aN].j.clearRect(0, 0, aO, a8n), a8k[aN].j.fillRect(0, 0, aO, a8n), a8k[aN].j.fillStyle = f7, !function (j, aO, a8n) {
        j.fillRect(0, 0, aO, 1), j.fillRect(0, a8n - 1, aO, 1), j.fillRect(0, 0, 1, a8n), j.fillRect(aO - 1, 0, 1, a8n);
      }(a8k[aN].j, aO, a8n), a8l + 2 * a8n < aO && (a8k[aN].j.fillRect(aO - a8l - a8n, 0, 1, a8n), a8k[aN].j.fillText(d3.dI[a8k[aN].l5], Math.floor((aO - a8l) / 2), Math.floor(.57 * a8n))), 0 !== a8k[aN].id ? 0 : a8n);
    a8k[aN].j.fillText(aR.h.dG(a8k[aN].ki), Math.floor(aO - a8l / 2 - g2), Math.floor(.57 * a8n)), function (aN, aO, g2, a8t) {
      a8k[aN].j.fillStyle = a8t ? bG.lX : bG.a90;
      a8t = Math.floor(a8l * a8k[aN].ki / a8k[aN].a91);
      a8k[aN].j.fillRect(Math.floor(aO - a8l - g2), a8n - a8o, a8t, a8o);
    }(aN, aO, g2, a8t), 0 === a8k[aN].id ? (a8y(aN, aO, a8t, f7), function (aN, aO, a8t) {
      a8k[aN].j.strokeStyle = a8t ? bG.nP : bG.a95, a8k[aN].j.fillRect(a8n, 0, 1, a8n);
      a8t = aO - a8n;
      a8k[aN].j.beginPath(), a8k[aN].j.moveTo(Math.floor(.3 * a8n + a8t), Math.floor(a8n / 2)), a8k[aN].j.lineTo(Math.floor(a8n - .3 * a8n + 0 + a8t), Math.floor(a8n / 2)), a8k[aN].j.stroke(), a8k[aN].j.beginPath(), a8k[aN].j.moveTo(Math.floor(a8n / 2 + a8t), Math.floor(.3 * a8n)), a8k[aN].j.lineTo(Math.floor(a8n / 2 + a8t), Math.floor(a8n - .3 * a8n + 0)), a8k[aN].j.stroke();
    }(aN, aO, a8t)) : a8y(aN, 2 * a8n, a8t, f7);
  }
  function a8y(aN, aO, a8t, f7) {
    a8k[aN].j.strokeStyle = a8k[aN].a92 ? bG.a93 : a8t ? bG.yE : bG.a94, a8k[aN].j.fillStyle = f7, a8k[aN].j.fillRect(aO - a8n, 0, 1, a8n), a8k[aN].j.lineWidth = Math.max(Math.floor(a8n / 12), 3), a8k[aN].j.lineCap = "round";
    a8t = .35;
    aO = a8n + 1, a8k[aN].j.beginPath(), a8k[aN].j.moveTo(Math.floor(aO - a8t * a8n + 0), Math.floor(a8t * a8n)), a8k[aN].j.lineTo(Math.floor(aO - a8n + a8t * a8n), Math.floor(a8n - a8t * a8n + 0)), a8k[aN].j.stroke(), a8k[aN].j.beginPath(), a8k[aN].j.moveTo(Math.floor(aO - a8n + a8t * a8n), Math.floor(a8t * a8n)), a8k[aN].j.lineTo(Math.floor(aO - a8t * a8n + 0), Math.floor(a8n - a8t * a8n + 0)), a8k[aN].j.stroke();
  }
  function a9I(a6, a0b) {
    for (var ki, aN = a0b - 1; 0 <= aN; aN--) ki = lA.a9O(ct.eG, aN), a6[aN].ki !== ki && (a6[aN].ki = ki, a6[aN].a91 = Math.max(ki, a6[aN].a91), a6[aN].lK = !0);
  }
  function a9L(a6, a0c) {
    for (var pL = ct.eG << 3, kx = h0.b1.kx, kX = h0.b1.kX, a4Q = h0.b1.a4Q, aN = a0c - 1; 0 <= aN; aN--) {
      var a4R = a4Q[pL + aN],
        ki = kx[a4R];
      a6[aN].ki !== ki ? (a6[aN].ki = ki, a6[aN].a91 = Math.max(ki, a6[aN].a91), a6[aN].lK = !0) : a6[aN].a92 || kX[a4R] % 64 != 5 || (a6[aN].a92 = !0, a6[aN].lK = !0);
    }
  }
  function a8r(a9P) {
    a9P.canvas = document.createElement("canvas"), fU.lR.font = a8m;
    var aO = a8l;
    a9P.l5 < ct.cv && 0 === a9P.id && (aO += Math.floor(fU.lR.measureText(d3.dI[a9P.l5] + "000").width)), aO += a8n, 0 === a9P.id && (aO += a8n), a9P.canvas.width = aO, a9P.canvas.height = a8n, a9P.j = a9P.canvas.getContext("2d", {
      alpha: !0
    }), a9P.j.font = a8m, aR.b.textBaseline(a9P.j, 1), aR.b.textAlign(a9P.j, 1);
  }
  function a9C(aN) {
    return h6.lU() ? d9.aO - a8k[aN].canvas.width - lS.gap : h6.eT;
  }
  function a9D(aN) {
    return Math.floor(2 * lS.gap + (h6.lU() ? gG.dA + lS.gap : 0) + h6.dA + aN * (1.3 * a8n));
  }
  this.r = function () {
    a8p = a8q = 0, a8k = [], this.resize();
  }, this.resize = function () {
    a8m = fA.lG, a8n = fA.fontSize + 5, a8n = Math.floor(1.25 * a8n), cA.hg.hh() && (a8n = Math.floor(1.25 * a8n)), a8o = Math.floor(.15 * a8n), fU.lR.font = a8m, a8l = Math.floor(fU.lR.measureText("02 000 000 0000").width);
    for (var aN = a8k.length - 1; 0 <= aN; aN--) a8r(a8k[aN]), a8s(aN);
  }, this.dY = function () {
    for (var aN = a8k.length - 1; 0 <= aN; aN--) a8k[aN].lK && (a8k[aN].lK = !1, a8s(aN));
  }, this.mv = function (dk, dl) {
    if (2 !== ct.dX && 0 !== d3.eF[ct.eG] && !ct.mH && !aR.f.eH(ct.eG)) for (var a97, a98, a99, a9A = cA.hg.hh() ? a8n : 0, a9B = cA.hg.hh() ? Math.floor(.15 * a8n) : 0, aN = a8k.length - 1; 0 <= aN; aN--) if (a97 = a9C(aN), a98 = a9D(aN), a99 = a8k[aN].canvas.width, a98 - a9B <= dl && dl <= a98 + a8n + a9B) {
      if (a97 - a9A <= dk && dk <= a97 + a8n + a9A) return a8k[aN].a92 || (a8k[aN].lK = !0, a8k[aN].a92 = !0, 0 === a8k[aN].id ? gD.n1.p3(a8k[aN].l5) : gD.n1.oz(a8k[aN].l5)), !0;
      if (0 === a8k[aN].id && a97 + a99 - a8n - a9A <= dk && dk <= a97 + a99 + a9A) return h4.zG(3), gD.n1.oY(hB.k1(), a8k[aN].l5), !0;
    }
    return !1;
  }, this.f1 = function () {
    var xV, xW, a6, a0b;
    0 === d3.eF[ct.eG] || aR.f.eH(ct.eG) && !ct.mH || (xV = a8k.slice(0, a8p), xW = a8k.slice(a8p, a8p + a8q), a6 = xV, a0b = lA.a9G(ct.eG), function (a6, a0b) {
      if (a8p !== a0b) return 1;
      for (var aN = a0b - 1; 0 <= aN; aN--) if (a6[aN].l5 !== lA.a9N(ct.eG, aN)) return 1;
      return;
    }(a6, a0b) ? a9I(a6 = function (a6, a0b) {
      var aN,
        l5,
        ex,
        ki,
        a9Q = [];
      loop: for (aN = 0; aN < a0b; aN++) {
        for (l5 = lA.a9N(ct.eG, aN), ex = 0; ex < a6.length; ex++) if (a6[ex].l5 === l5) {
          a9Q.push(a6.splice(ex, 1)[0]);
          continue loop;
        }
        ki = lA.a9O(ct.eG, aN), a8r(ki = {
          l5: l5,
          ki: ki,
          a91: ki,
          id: 0,
          lK: !0,
          a92: !1,
          canvas: null,
          j: null
        }), a9Q.push(ki);
      }
      return a9Q;
    }(a6, a0b), a0b) : a9I(a6, a0b), xV = a6, xW = function (a6) {
      var a0c = h0.b1.a4P[ct.eG];
      return function (a6, a0c) {
        if (a8q !== a0c) return 1;
        for (var pL = ct.eG << 3, pj = h0.b1.pj, a4Q = h0.b1.a4Q, aN = a0c - 1; 0 <= aN; aN--) {
          var a4R = a4Q[pL + aN];
          if (a6[aN].l5 !== pj[a4R]) return 1;
        }
        return;
      }(a6, a0c) ? a9L(a6 = function (a6, a0c) {
        var aN,
          l5,
          ex,
          a9Q = [],
          pL = ct.eG << 3,
          pj = h0.b1.pj,
          kx = h0.b1.kx,
          a4Q = h0.b1.a4Q;
        loop: for (aN = 0; aN < a0c; aN++) {
          var a4R = a4Q[pL + aN];
          for (l5 = pj[a4R], ex = 0; ex < a6.length; ex++) if (a6[ex].l5 === l5) {
            a9Q.push(a6.splice(ex, 1)[0]);
            continue loop;
          }
          a4R = kx[a4R], a8r(a4R = {
            l5: l5,
            ki: a4R,
            a91: a4R,
            id: 1,
            lK: !0,
            a92: !1,
            canvas: null,
            j: null
          }), a9Q.push(a4R);
        }
        return a9Q;
      }(a6, a0c), a0c) : a9L(a6, a0c), a6;
    }(xW), a8p = xV.length, a8q = xW.length, a8k = xV.concat(xW));
  }, this.dd = function () {
    if (0 !== d3.eF[ct.eG] && (!aR.f.eH(ct.eG) || ct.mH)) for (var aN = a8k.length - 1; 0 <= aN; aN--) dE.drawImage(a8k[aN].canvas, a9C(aN), a9D(aN));
  };
}
function kS() {
  this.f1 = function (player) {
    var a9R = function (player) {
      for (var gd = h0.gd.gq(), aM = gd.length, aW = Math.min(aM, 32), dZ = iW.rU(aM), aN = 0; aN < aW; aN++) {
        var a9R = (aN + dZ) % aM,
          gf = gd[a9R],
          i4 = gf[0],
          i5 = gf[gf.length - 1];
        if (h0.nd.a4K(player, i4) && h0.nd.a4L(player, i5)) return a9R;
        if (h0.nd.a4K(player, i5) && h0.nd.a4L(player, i4)) return 0 <= (a9R = h0.gd.ga(i5, i4)) ? a9R : h0.gd.gZ() ? -1 : h0.gd.gp(h0.gd.ge(gf));
      }
      return -1;
    }(player);
    return -1 !== a9R && (a9R = h0.gd.get(a9R), !h0.nd.a4j(player, a9R)) && (k3.a6[0] = a9R, !0);
  };
}
function a9S() {
  this.a9T = 0;
  var a9W,
    a9U = null,
    a9V = 0,
    a9X = "",
    a9Y = 0,
    a9Z = null,
    a9a = -1,
    a9b = -1,
    a9c = 0;
  function lu() {
    if (null !== a9Z && null !== a9U) {
      a9V = 0;
      try {
        window.turnstile.remove(a9U), a9Z.remove();
      } catch (b7) {
        console.log("turnstile remove failed " + b7);
      }
      a9U = a9Z = null;
    }
  }
  function a9i(a9j) {
    return "" !== a9X && a9Y + 1e3 * (300 - a9j) > performance.now();
  }
  this.r = function () {
    var a9g;
    c8.a9e || !c8.cC && !c8.a9f ? (console.log("turnstile cannot be loaded"), this.a9T = -1) : ((a9g = document.createElement("script")).src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", a9g.async = !0, a9g.onload = function () {
      hG.turnstile.a9T = 1, console.log("turnstile onload"), hG.turnstile.a9h();
    }, a9g.onerror = function () {
      hG.turnstile.a9T = -1, console.log("turnstile onerror");
    }, document.head.appendChild(a9g));
  }, this.a9h = function () {
    var eZ;
    return !(1 !== this.a9T || (window.turnstile ? a9V ? (console.log("turnstile error 246"), 1) : a9i(30) || (eZ = performance.now()) < a9c && a9a === aZ.aa.ab(b6.buffer.data[105].value, 5) && a9b === mF.a3D || (a9X = "", a9V = 1, a9W = eZ, (a9Z = document.createElement("div")).style.position = "fixed", a9Z.style.left = "0", a9Z.style.top = "0", a9Z.style.zIndex = "100", document.body.appendChild(a9Z), console.log("turnstile render"), a9U = window.turnstile.render(a9Z, {
      sitekey: "0x4AAAAAAEI8HZoG8nJMzxt1",
      action: "enter_lobby",
      appearance: "interaction-only",
      callback: function (bq) {
        console.log("turnstile success " + Math.floor(performance.now() - a9W)), a9X = bq, a9Y = performance.now(), hG.turnstile.ns(), lu();
      },
      "expired-callback": function () {
        lu(), console.log("turnstile expired " + Math.floor(performance.now() - a9W));
      },
      "error-callback": function () {
        lu(), console.log("turnstile callback error " + Math.floor(performance.now() - a9W)), hG.turnstile.a9T = -1;
      }
    }), 0) : (console.log("turnstile error 245"), 1)));
  }, this.close = function () {
    lu();
  }, this.ns = function () {
    a9i(8) && aI.jV && aF.b1.bM(aF.b1.bu) && (a9c = performance.now() + 36e5 - 1e4, a9a = aZ.aa.ab(b6.buffer.data[105].value, 5), a9b = mF.a3D, aF.lk.bp(a9X), a9X = "", console.log("sendTokenToLobby success"));
  };
}
function a9k() {
  this.zR = function () {
    b6.bJ.a9l(), b6.bJ.a9m(), aF.b1.close(0, 3255), 0 === cA.id ? cA.a0m && cA.a0m.clear() : 1 === cA.id ? cA.a0n.saveString(199, "") : 2 === cA.id && cA.a0t.postMessage("clear");
  }, this.zB = function () {
    2 === cA.id ? cA.a0t.postMessage("showConsentForm") : 1 === cA.id && cA.a0n.setState(7);
  }, this.zE = function () {
    this.setState(14);
  }, this.hh = function () {
    return 1 === b6.buffer.a9n(2);
  }, this.a9o = function () {
    b6.buffer.a9p(102, "");
  }, this.setState = function (mE) {
    1 === cA.id && 5 <= cA.cB && cA.a0n.setState(mE);
  }, this.mP = function () {
    var a9q;
    1 === cA.id && 7 <= cA.cB ? cA.a0n.setState(5) : 2 === cA.id ? cA.a0t.postMessage("reload 0") : ((a9q = new URL(window.location)).searchParams.set("v", "" + Math.floor(1e3 * Math.random())), window.location.href = a9q.toString());
  }, this.a9r = function () {
    0 !== cA.id && (1 === cA.id ? cA.a0n.prepareAd("8646194357") : 2 === cA.id && (0 === cA.cB ? cA.a0t.postMessage("prepare ad 2904813909") : cA.a0t.postMessage("loadAds 2904813909")));
  }, this.a9s = function (eZ) {
    return 0 !== cA.id && (1 === cA.id ? 12 <= cA.cB && (cA.a0n.presentAd(eZ), !0) : 2 === cA.id && 0 !== cA.cB && (cA.a0t.postMessage("showAd"), !0));
  }, this.a9t = function () {
    2 === cA.id && cA.cB < 23 && aq.fu(4, 1, new mC("App Update Required", "A new iOS app version with bug fixes was published.<br>Please download the new Territorial.io app version for iOS:<br><a href='" + zK.zM + "' target='_blank'>" + zK.zM + "</a>", !0, [new ap("⬅️ " + L(1), function () {
      aq.fu(0);
    }, bG.a9u)]));
  };
}
function a9v() {
  var a9w, a9x, hl, xu;
  this.r = function () {
    var aN, eT, eU, ll, a9y, aO, dA, j, xp, en, aY, d1, rW, aQ, aA2;
    if (function () {
      if (hl = !0, xu = "rgb(" + fU.a1m[0] + "," + fU.a1m[1] + "," + fU.a1m[2] + ")", fU.aA1(fU.jJ)) return 1;
      return hl = !1, 0;
    }()) a9x = null;else {
      for (a9w = he.iA(96, 4), a9y = 1 === fU.jJ ? (ll = 0, 160) : (ll = 128, 32), xu = "rgb(" + ll + "," + ll + "," + ll + ")", a9x = new Array(4), aN = 3; 0 <= aN; aN--) {
        if (a9x[aN] = document.createElement("canvas"), aO = aN % 2 == 0 ? fU.fV : a9w, dA = aN % 2 == 0 ? a9w : fU.iD + 2 * a9w, a9x[aN].width = aO, a9x[aN].height = dA, en = (xp = (j = a9x[aN].getContext("2d", {
          alpha: !1
        })).getImageData(0, 0, aO, dA)).data, aN % 2 == 0) for (eU = a9w - 1; 0 <= eU; eU--) for (aY = a9y + Math.floor((eU + 1) * (ll - a9y) / (a9w + 1)), eT = aO - 1; 0 <= eT; eT--) en[d1 = 4 * ((0 === aN ? a9w - eU - 1 : eU) * aO + eT)] = aY, en[d1 + 1] = aY, en[d1 + 2] = aY, en[d1 + 3] = 255;else {
          for (eT = a9w - 1; 0 <= eT; eT--) for (aY = a9y + Math.floor((eT + 1) * (ll - a9y) / (a9w + 1)), eU = dA - 1 - a9w; a9w <= eU; eU--) en[d1 = 4 * (eU * aO + (3 === aN ? a9w - eT - 1 : eT))] = aY, en[d1 + 1] = aY, en[d1 + 2] = aY, en[d1 + 3] = 255;
          for (aQ = 1; 0 <= aQ; aQ--) for (eT = a9w - 1; 0 <= eT; eT--) for (eU = a9w - 1; 0 <= eU; eU--) rW = (Math.pow(eT * eT + eU * eU, .5) + 1) / (a9w + 1), aY = a9y + Math.floor((1 < rW ? 1 : rW) * (ll - a9y)), en[d1 = 4 * ((0 === aQ ? a9w - eU - 1 : eU + aQ * (dA - a9w)) * aO + (1 === aN ? eT : a9w - eT - 1))] = aY, en[d1 + 1] = aY, en[d1 + 2] = aY, en[d1 + 3] = 255;
        }
        j.putImageData(xp, 0, 0);
      }
      aA2 = a9y, fU.lR.fillStyle = "rgb(" + aA2 + "," + aA2 + "," + aA2 + ")", fU.lR.fillRect(0, 0, fU.fV, 1), fU.lR.fillRect(0, fU.iD - 1, fU.fV, 1), fU.lR.fillRect(0, 0, 1, fU.iD), fU.lR.fillRect(fU.fV - 1, 0, 1, fU.iD);
    }
  }, this.uL = function () {
    var aQ = hl ? 0 : -a9w;
    aA3(aQ, aQ, fU.fV - 2 * aQ, fU.iD - 2 * aQ, aA4.aA5, aA4.aA6, aA4.aA7, aA4.aA8) || (dE.fillStyle = xu, dE.fillRect(0, 0, d9.aO, d9.dA));
  }, this.dd = function () {
    hl || (aA9(0, -a9w, fU.fV, a9w, aA4.aA5, aA4.aA6, aA4.aA7, aA4.aA8) && dE.drawImage(a9x[0], aA4.aAA, aA4.aAB - a9w), aA9(fU.fV, -a9w, a9w, fU.iD + 2 * a9w, aA4.aA5, aA4.aA6, aA4.aA7, aA4.aA8) && dE.drawImage(a9x[1], aA4.aAA + fU.fV, aA4.aAB - a9w), aA9(0, fU.iD, fU.fV, a9w, aA4.aA5, aA4.aA6, aA4.aA7, aA4.aA8) && dE.drawImage(a9x[2], aA4.aAA, aA4.aAB + fU.iD), aA9(-a9w, -a9w, a9w, fU.iD + 2 * a9w, aA4.aA5, aA4.aA6, aA4.aA7, aA4.aA8) && dE.drawImage(a9x[3], aA4.aAA - a9w, aA4.aAB - a9w));
  };
}
function aAC() {
  var aAD,
    aAE,
    aAF,
    aAG,
    aAH,
    aAI,
    aAJ,
    aAK,
    aAL,
    aAM,
    aAN,
    aAO,
    aAP,
    aAQ,
    aAR,
    aAS,
    aAT,
    aAU,
    aAV,
    aAW,
    aAX,
    aAY,
    position,
    aAZ,
    aAa,
    aAb,
    aAc,
    aAd,
    aAe = 1,
    cr = 1,
    aAf = "";
  var leaderboardHasChanged = true;
  this.playerPos = ct.eG;
  __fx.leaderboardFilter.setUpdateFlag = () => leaderboardHasChanged = true;
  function updateFilteredLb() {
    if (!leaderboardHasChanged) return;
    __fx.leaderboardFilter.filteredLeaderboard = __fx.leaderboardFilter.playersToInclude.map(id => eQ[id]).sort((a, b) => a - b);
    leaderboardHasChanged = false;
    this.playerPos = __fx.leaderboardFilter.filteredLeaderboard.indexOf(eQ[ct.eG]);
  }
  function aAh() {
    aAJ.clearRect(0, 0, aAD, u2), aAJ.fillStyle = aAd ? bG.aAj : bG.aAk, aAJ.fillRect(0, 0, aAD, aAO), aAJ.fillStyle = bG.su, aAJ.fillRect(0, aAO, aAD, u2 - aAO);
    if (__fx.leaderboardFilter.enabled) updateFilteredLb();
    if (__fx.leaderboardFilter.showingRivals && leaderboardHasChanged) {
      __fx.leaderboardFilter.computeRivals();
      leaderboardHasChanged = false;
    }
    var playerPos = __fx.leaderboardFilter.enabled ? this.playerPos : eQ[ct.eG];
    if (__fx.leaderboardFilter.hoveringOverTabs) aAY = -1;
    if (__fx.leaderboardFilter.enabled && aAY >= __fx.leaderboardFilter.filteredLeaderboard.length) aAY = -1;
    __fx.leaderboardFilter.showingRivals ? function () {
      var ownClanIndex = __fx.leaderboardFilter.getOwnClanIndex();
      if (ownClanIndex >= 0 && ownClanIndex >= position) aAl(ownClanIndex - position, bG.aAm);
    }() : (playerPos >= position && aAl(playerPos - position, bG.aAm), 0 !== eQ[ct.eG] && 0 === position && aAl(0, bG.aAn)), -1 !== aAY && aAl(aAY, bG.zl), aAJ.fillStyle = bG.su,
    //console.log("drawing", aAY),
    aAJ.clearRect(0, u2 - __fx.leaderboardFilter.tabBarOffset, aAD, __fx.leaderboardFilter.tabBarOffset);
    aAJ.fillRect(0, u2 - __fx.leaderboardFilter.tabBarOffset, aAD, __fx.leaderboardFilter.tabBarOffset);
    aAJ.fillStyle = bG.bH, aAJ.fillRect(0, aAO, aAD, 1), aAJ.fillRect(0, u2 - __fx.leaderboardFilter.tabBarOffset, aAD, 1), __fx.leaderboardFilter.drawTabs(aAJ, aAD, u2 - __fx.leaderboardFilter.tabBarOffset, bG.aAm), aAJ.fillRect(0, 0, aAD, lS.o2), aAJ.fillRect(0, 0, lS.o2, u2), aAJ.fillRect(aAD - lS.o2, 0, lS.o2, u2), aAJ.fillRect(0, u2 - lS.o2, aAD, lS.o2), aAJ.font = aAE, aR.b.textBaseline(aAJ, 1), aR.b.textAlign(aAJ, 1), aAJ.fillText(aAf, Math.floor((aAD + aAO - 22) / 2), Math.floor(aAM + aAF / 2));
    __fx.playerList.drawButton(aAJ, 12, 12, aAO - 22);
    var aQ,
      s9 = playerPos < position + aAH - 1 ? 1 : 2;
    if (__fx.leaderboardFilter.showingRivals) s9 = 1;
    if (__fx.leaderboardFilter.showingRivals) {
      let rivalsCount = __fx.leaderboardFilter.rivalsData.length;
      if (position !== 0 && position >= rivalsCount - aAH) position = (rivalsCount > aAH ? rivalsCount : aAH) - aAH;
      var rivalsRestore = [];
      try {
        for (var rivalsRow = 0; rivalsRow < aAH; rivalsRow++) {
          var rivalsEntry = __fx.leaderboardFilter.rivalsData[rivalsRow + position];
          if (rivalsEntry === undefined) break;
          var repId = rivalsEntry.representativeId;
          rivalsRestore.push([repId, d3.d4[repId], d3.dI[repId], d3.eL[repId]]);
          d3.d4[repId] = rivalsEntry.territory;
          d3.dI[repId] = "[" + rivalsEntry.clan + "]";
          d3.eL[repId] = 0;
        }
        for (aAJ.font = aAG, aR.b.textAlign(aAJ, 0), aQ = aAH - s9; 0 <= aQ; aQ--) {
          const rivalsEntryLeft = __fx.leaderboardFilter.rivalsData[aQ + position];
          if (rivalsEntryLeft !== undefined) aAo(rivalsEntryLeft.representativeId), aAp(aQ, aQ + position, rivalsEntryLeft.representativeId);
        }
        for (aR.b.textAlign(aAJ, 2), aQ = aAH - s9; 0 <= aQ; aQ--) {
          const rivalsEntryRight = __fx.leaderboardFilter.rivalsData[aQ + position];
          if (rivalsEntryRight !== undefined) aAo(rivalsEntryRight.representativeId), aAq(aQ, rivalsEntryRight.representativeId);
        }
      } finally {
        rivalsRestore.forEach(function (entry) {
          d3.d4[entry[0]] = entry[1];
          d3.dI[entry[0]] = entry[2];
          d3.eL[entry[0]] = entry[3];
        });
      }
    } else if (__fx.leaderboardFilter.enabled) {
      let result = __fx.leaderboardFilter.filteredLeaderboard;
      if (position !== 0 && position >= result.length - aAH) position = (result.length > aAH ? result.length : aAH) - aAH;
      //if (position >= result.length) position = result.length - 1;
      for (aAJ.font = aAG, aR.b.textAlign(aAJ, 0), aQ = aAH - s9; 0 <= aQ; aQ--) {
        const pos = result[aQ + position];
        if (pos !== undefined) aAo(iw[pos]), aAp(aQ, pos, iw[pos]);
      }
      for (aR.b.textAlign(aAJ, 2), aQ = aAH - s9; 0 <= aQ; aQ--) {
        const pos = result[aQ + position];
        if (pos !== undefined) aAo(iw[pos]), aAq(aQ, iw[pos]);
      }
    } else {
      for (aAJ.font = aAG, aR.b.textAlign(aAJ, 0), aQ = aAH - s9; 0 <= aQ; aQ--) aAo(iw[aQ + position]), aAp(aQ, aQ + position, iw[aQ + position]);
      for (aR.b.textAlign(aAJ, 2), aQ = aAH - s9; 0 <= aQ; aQ--) aAo(iw[aQ + position]), aAq(aQ, iw[aQ + position]);
    }
    !__fx.leaderboardFilter.showingRivals && 2 == s9 && (aAo(ct.eG), aR.b.textAlign(aAJ, 0), aAp(aAH - 1, eQ[ct.eG], ct.eG), aR.b.textAlign(aAJ, 2), aAq(aAH - 1, ct.eG)), 0 === position && (s9 = .7 * aAP / dQ.get(4).height, aAJ.setTransform(s9, 0, 0, s9, Math.floor(aAQ + .58 * aAP + .5 * s9 * dQ.get(4).width), Math.floor(aAM + aAF + .4 * aAP)), aAJ.imageSmoothingEnabled = !0, aAJ.drawImage(dQ.get(4), -Math.floor(dQ.get(4).width / 2), -Math.floor(dQ.get(4).height / 2)), aAJ.setTransform(1, 0, 0, 1, 0, 0));
  }
  function aAo(player) {
    ct.il && (aAJ.fillStyle = ey.r6[ey.rE[player]]);
  }
  function aAl(aN, aAs) {
    aAJ.fillStyle = aAs, aN = aAH - 1 < aN ? aAH - 1 : aN;
    aAs = Math.floor((aN === aAH - 1 ? 2 : 0 === aN ? 1.15 : 1) * aAP), aAs = aN === aAH - 2 ? Math.floor(aAO + 9.15 * aAP) - Math.floor(aAO + 8.15 * aAP) : aAs;
    aAJ.fillRect(0, Math.floor(aAO + (aN + (0 === aN ? 0 : .15)) * aAP), aAD, aAs);
  }
  function aAp(gl, aAu, aN) {
    aAJ.fillText(aAU[aAu], aAQ, Math.floor(aAM + aAF + (gl + .5) * aAP)), 1 === d3.eL[aN] && (aAJ.font = "italic " + aAG);
    aAu = Math.floor(aAM + aAF + (gl + .5) * aAP);
    aAJ.fillText(d3.dI[aN], aAR, aAu), 0 !== d3.eL[aN] && (aAJ.font = aAG), aN < ct.dP && 2 !== d3.eL[aN] || aAJ.fillRect(aAR, aAu + .35 * aAe, aAT[aN], Math.max(1, .1 * aAe));
  }
  function aAq(gl, aN) {
    aAJ.fillText(d3.d4[aN], aAS, Math.floor(aAM + aAF + (gl + .5) * aAP));
  }
  this.r = function () {
    var aN;
    for (aq.b1.fk[0] = 0, aAc = aAb = aAZ = 0, aAd = aAa = !1, aAY = -1, aAH = cA.hg.hh() ? 6 : 10, cr = (position = 0) === (cr = b6.buffer.data[11].value) ? 10 : 1 === cr ? 5 : 1, aAX = !1, aAV = new Uint16Array(aAH + 1), aAW = new Uint32Array(aAH + 1), aAL = ct.cv, iw = new Uint16Array(aAL), eQ = new Uint16Array(aAL), aN = aAL - 1; 0 <= aN; aN--) iw[aN] = aN, eQ[aN] = aN;
    this.resize(!0), aAT = new Uint16Array(ct.cv);
    var aAg = Math.floor(aAD - aAR - aAQ - aAK);
    for (aAU = new Array(ct.cv), aAJ.font = aAG, aN = ct.cv - 1; 0 <= aN; aN--) aAU[aN] = aN + 1 + ".", d3.dI[aN] = aR.j.qZ(d3.rj[aN], aAG, aAg), aAT[aN] = Math.floor(aAJ.measureText(d3.dI[aN]).width);
    aAh();
  }, this.resize = function (r) {
    if (u2 = cA.hg.hh() ? (aAD = Math.floor(.335 * d9.dC), Math.floor(aAH * aAD / 8)) : (aAD = Math.floor(.27 * d9.dC), Math.floor(aAH * aAD / 10)), aAD = Math.floor(.97 * aAD), (aAI = document.createElement("canvas")).width = aAD, aAI.height = u2, aAJ = aAI.getContext("2d", {
      alpha: !0
    }), aAM = .025 * aAD, aAF = .16 * aAD, aAN = 0 * aAD, aAO = Math.floor(.45 * aAM + aAF), aAP = (u2 - aAF - 2 * aAM - aAN) / aAH, aAI.height = u2 += aAP, __fx.leaderboardFilter.tabBarOffset = Math.floor(aAP * 1.3), __fx.leaderboardFilter.verticalClickThreshold = u2 - __fx.leaderboardFilter.tabBarOffset, __fx.leaderboardFilter.windowWidth = aAD, aAE = aR.b.dF(1, Math.floor(.55 * aAF)), aAe = Math.floor((cA.hg.hh() ? .67 : .72) * aAP), aAG = aR.b.dF(0, aAe), aAJ.font = aAG, aAQ = Math.floor(.04 * aAD), aAR = Math.floor((cA.hg.hh() ? .195 : .18) * aAD), aAK = Math.floor(aAJ.measureText("00920600").width), aAJ.font = aAE, aAS = aAD - aAQ, !r) {
      aAJ.font = aAG;
      for (var aN = ct.cv - 1; 0 <= aN; aN--) aAT[aN] = Math.floor(aAJ.measureText(d3.dI[aN]).width);
      aAh();
    }
    aAf = aR.j.qZ(L(178), aAE, .96 * aAD);
  }, this.lW = function () {
    return aAD;
  }, this.dY = function (dx, aAi) {
    (aAi || aAX && (dx || dy.f2() % cr == 0)) && (aAX = !1, aAh());
  }, this.f1 = function () {
    !function () {
      for (var aQ = aAL - 1; 0 <= aQ; aQ--) 0 === d3.eF[iw[aQ]] && !function (aQ) {
        var aB1 = iw[aQ];
        aAL--;
        for (var aN = aQ; aN < aAL; aN++) iw[aN] = iw[aN + 1], eQ[iw[aN]] = aN;
        iw[aAL] = aB1, eQ[iw[aAL]] = aAL;
      }(aQ);
    }();
    for (var aAz, fN = aAL - 1, aQ = 0; aQ < fN; aQ++) d3.d4[iw[aQ]] < d3.d4[iw[aQ + 1]] && (aAz = iw[aQ], iw[aQ] = iw[aQ + 1], iw[aQ + 1] = aAz, eQ[iw[aQ]] = aQ, eQ[iw[aQ + 1]] = aQ + 1);
    !function () {
      for (var eZ = aAX, s9 = (aAX = !0, eQ[ct.eG] >= aAH - 1 ? aAH - 2 : aAH - 1), aN = s9; 0 <= aN; aN--) if (aAV[aN] !== iw[aN] || aAW[aN] !== d3.d4[iw[aN]]) return;
      (s9 != aAH - 2 || aAV[aAH] === eQ[ct.eG] && aAW[aAH] === d3.d4[ct.eG]) && (aAX = eZ);
    }();
    for (var aN = aAH - 1; 0 <= aN; aN--) aAV[aN] = iw[aN], aAW[aN] = d3.d4[iw[aN]];
    aAV[aAH] = eQ[ct.eG], aAW[aAH] = d3.d4[ct.eG];
    leaderboardHasChanged = true;
  }, __fx.leaderboardFilter.scrollToTop = function () {
    position = 0;
  }, this.mv = function (eT, eU) {
    if (aB2(eT, eU)) {
      if (__fx.utils.isPointInRectangle(eT, eU, lS.gap + 12, lS.gap + 12, aAO - 22, aAO - 22)) __fx.playerList.display(d3.rj);else {
        if (eU - lS.gap > __fx.leaderboardFilter.verticalClickThreshold) return __fx.leaderboardFilter.handleMouseDown(eT - lS.gap);
        eT = aB4(eU);
        0 <= eT ? (aAZ = dy.dz, aAa = !0, aAb = aAc = eT, a5t.aB5() && (eT = aB6(-1, aAc, aAH), aAY !== (eT = eT === aAH ? -1 : eT)) && (aAY = eT, aAh(), dy.gK = !0)) : (aAd && (aAd = !1, aAh(), dy.gK = !0), aq.fu(10, 0, new zx({
          zz: 1
        })));
      }
      return !0;
    }
    return !1;
  };
  var repaintLb = __fx.leaderboardFilter.repaintLeaderboard = function () {
    aAh(), dy.gK = !0;
  };
  function aB4(eU) {
    return (eU -= lS.gap + aAO) < 0 ? Math.floor(eU / aAP) - 1 : eU < (aAH - 1) * aAP ? Math.floor(eU / aAP) : eU < u2 - aAO ? aAH - 1 : (eU -= u2 - aAO, aAH + Math.floor(eU / aAP));
  }
  function aB2(eT, eU) {
    return eT >= lS.gap && eT < lS.gap + aAD && eU >= lS.gap && eU < lS.gap + u2;
  }
  this.dh = function (eT, eU) {
    var eZ, aB3;
    if (__fx.utils.isPointInRectangle(eT, eU, lS.gap + 12, lS.gap + 12, aAO - 22, aAO - 22) ? !1 === __fx.playerList.hoveringOverButton && (__fx.playerList.hoveringOverButton = !0, repaintLb()) : !0 === __fx.playerList.hoveringOverButton && (__fx.playerList.hoveringOverButton = !1, repaintLb()), !__fx.leaderboardFilter.setHovering(__fx.utils.isPointInRectangle(eT, eU, lS.gap, lS.gap + __fx.leaderboardFilter.verticalClickThreshold, __fx.leaderboardFilter.windowWidth, __fx.leaderboardFilter.tabBarOffset), eT - lS.gap)) return aB3 = aB4(eU), eT = aB2(eT, eU), eU = !(!(aB3 < 0 && eT) || a5t.aB5()), aAa ? (eZ = position, (position = aB6(0, position += aAb - aB3, ct.cv - aAH)) !== eZ ? (aAd = eU, aB3 = aB6(-1, aAb = aB3, aAH), aAY = aB3 = aB3 !== aAH && eT ? aB3 : -1, aAh(), dy.gK = !0) : aAd !== eU && (aAd = eU, aAh(), dy.gK = !0), !0) : (aB3 = (aB3 = aB6(-1, aB3, aAH)) === aAH || !eT || a5t.aB5() ? -1 : aB3, (aAY !== aB3 || aAd !== eU) && (aAY = aB3, aAd = eU, aAh(), dy.gK = !0));
  }, this.uH = function (eT, eU) {
    if (!aAa) return !1;
    aAa = !1;
    var aB3 = aB4(eU);
    var isEmptySpace = false;
    return a5t.aB5() && -1 !== aAY && (aAY = -1, aAh(), dy.gK = !0), dy.dz - aAZ < 350 && aAc === aB3 && -1 !== (aB3 = (aB3 = aB6(-1, aB3, aAH)) !== aAH && aB2(eT, eU) ? aB3 : -1) && (eT = __fx.leaderboardFilter.showingRivals ? (isEmptySpace = __fx.leaderboardFilter.rivalsData[aB3 + position] === undefined, __fx.leaderboardFilter.rivalsData[aB3 + position]?.representativeId ?? ct.eG) : __fx.leaderboardFilter.enabled ? (updateFilteredLb(), iw[__fx.leaderboardFilter.filteredLeaderboard[aB3 + position] ?? (isEmptySpace = true, eQ[ct.eG])]) : iw[aB3 + position], aB3 === aAH - 1 && !__fx.leaderboardFilter.showingRivals && (__fx.leaderboardFilter.enabled ? this.playerPos : eQ[ct.eG]) >= position + aAH - 1 && (eT = ct.eG), !isEmptySpace && ct.il && __fx.settings.openDonationHistoryFromLb && __fx.donationsTracker.displayHistory(eT, d3.rj, ct.kD), 0 === d3.eF[eT] || isEmptySpace || ct.dO && !ct.kD && !ct.mH && eT !== ct.eG || hI.aB9(eT, 800, !1, 0)), !0;
  }, this.uI = function (eT, eU, deltaY) {
    var aBA;
    return !(aAa || ct.ur || (aBA = Math.max(Math.floor(Math.abs(deltaY) / 40), 1), !aB2(eT, eU)) || (eT = (eT = aB6(-1, aB4(eU), aAH)) === aAH || a5t.aB5() ? -1 : eT, 0 < deltaY ? position < ct.cv - aAH && (position += Math.min(ct.cv - aAH - position, aBA), aAY = eT, aAh(), dy.gK = !0) : 0 < position && (position -= Math.min(position, aBA), aAY = eT, aAh(), dy.gK = !0), 0));
  }, this.dd = function () {
    dE.drawImage(aAI, lS.gap, lS.gap);
  };
}
function aBB() {
  var aBE,
    aBF,
    hS = "",
    aBC = 0,
    a8n = 0,
    aBD = -1,
    ss = ["Team", "Zombie", "BR", "1v1"];
  function aBG() {
    for (var eZ = new Date(), aBH = eZ.getUTCMinutes(), eZ = eZ.getUTCSeconds(), aBJ = [], aBK = 0, aN = 0; aN < 6; aN++) aBJ.push(aBK), aBJ.push(aBK + 2), aBJ.push(aBK + 5), aBJ.push(aBK + 7), aBK += 10;
    for (var aM = aBJ.length, aN = 1; aN < aM && !(aBH < aBJ[aN]); aN++);
    aN %= aM;
    eZ = (aBJ[0] = 60) * (aBJ[aN] - aBH) - eZ;
    return eZ !== aBD && (hS = ss[aN % 4] + " " + aBF + ": " + aBM(Math.floor(eZ / 60)) + ":" + aBM(eZ % 60), aBD = eZ, aBC = hK.measureText(hS, aBE), aBC += Math.floor(.4 * a8n), 1);
  }
  function aBM(aBN) {
    return aBN < 10 ? "0" + aBN : String(aBN);
  }
  this.r = function () {
    aBF = L(179);
  }, this.resize = function () {
    aBC = Math.floor((cA.hg.hh() ? .53 : .36) * d9.dC), a8n = Math.floor(.065 * aBC), aBE = aR.b.dF(1, Math.floor(.9 * a8n)), aBD += 1e3, aBG();
  }, this.f1 = function () {
    aBG() && (dy.gK = !0);
  }, this.dd = function (eU) {
    dE.lineWidth = 1 + Math.floor(a8n / 15), dE.translate(d9.aO - a8n, eU + aBC), dE.rotate(-Math.PI / 2), dE.fillStyle = bG.bH, dE.fillRect(0, 0, aBC, a8n), dE.strokeStyle = bG.r8, dE.strokeRect(0, 0, aBC, a8n + 10), dE.fillStyle = bG.r8, dE.font = aBE, aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 1), dE.fillText(hS, Math.floor(aBC / 2), Math.floor(.59 * a8n)), dE.setTransform(1, 0, 0, 1, 0, 0);
  };
}
function aBO() {
  var aBP,
    aBQ,
    a6u,
    aBR = ["wss://", "/s50/", "/s51/", "/s52/"],
    aBS = 0;
  function aBb() {
    aF.b1.aBb(aBP, aBQ);
  }
  function aBc(b7) {
    aF.k5.aBf(aBP, new Uint8Array(b7.data));
  }
  function aBe() {}
  function aBd(b7) {
    aF.b1.aBd(aBP, b7);
  }
  this.r = function (af, mB, aBT) {
    aBP = af, aBQ = mB, function (aBT) {
      aBT = c8.a9e ? "ws://localhost:" + (7130 + aBP) + "/" : aBT ? aBR[0] + "game.territorial.io/x0" + aBP + "/" : aBR[0] + aF.b1.aBa[aBP] + aBR[1 + c8.v6];
      (a6u = new WebSocket(aBT)).binaryType = "arraybuffer", a6u.onopen = aBb, a6u.onmessage = aBc, a6u.onclose = aBd, a6u.onerror = aBe;
    }(aBT);
  }, this.aBV = function () {
    return a6u.readyState === a6u.CONNECTING;
  }, this.bM = function () {
    return a6u.readyState === a6u.OPEN;
  }, this.aBW = function () {
    return aBS;
  }, this.a2C = function () {
    aBS = 1;
  }, this.aBX = function () {
    return this.aBV() || this.bM();
  }, this.aBY = function (mB) {
    aBQ = mB;
  }, this.a29 = function () {
    return aBQ;
  }, this.send = function (bk) {
    this.bM() && a6u.send(bk);
  }, this.close = function (aBZ) {
    this.aBX() && (this.bU(), a6u.close(aBZ));
  }, this.bU = function () {
    a6u.onopen = null, a6u.onmessage = null, a6u.onclose = null, a6u.onerror = null;
  };
}
function mC(title, ze, aBg, a01) {
  var am, aBh;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), aBh.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, a01 = a01 || [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })], am = new ao(title, a01), aBh = new zd(am.au, ze), aBg && aR.b.textAlign(am.au.style, 1);
}
function aBi(aBj, aBk, aBl, aBm, aBn, aBo) {
  var a6N = document.createElement("div"),
    aBp = document.createElement("div"),
    aBq = document.createElement("div"),
    aBr = document.createElement("div"),
    aBs = document.createElement("div"),
    aBt = document.createElement("div"),
    aBu = document.createElement("div"),
    aBv = document.createElement("div"),
    aBw = document.createElement("span"),
    aBx = document.createElement("div");
  this.aBy = new aBz(aBn, aBo), this.aC0 = new aC1(aBo), this.aC2 = [aBj, aBk, aBl, aBm], this.aC7 = function (jI) {
    jI = (jI / 10).toFixed(1) + "%";
    aBv.style.width = jI, aBw.innerHTML = jI;
  }, this.aC8 = function () {
    this.aC0.bU(aBt), this.aBy.show(aBt);
  }, this.aC9 = function () {
    this.aBy.bU(aBt), this.aC0.show(aBt);
  }, this.aCA = function () {
    return aBp;
  }, this.show = function () {
    document.body.appendChild(a6N);
  }, this.bU = function () {
    aq.removeChild(document.body, a6N);
  }, this.resize = function (aCB) {
    var aCC = 1 - .4 * cA.hg.hh() * (d9.aO > 1.6 * d9.dA),
      aCD = aR.b.tJ(.05 * aCC),
      aCE = d9.dA > d9.aO,
      aCF = aR.b.tJ(.06 * aCC + .03 * aCE),
      aCG = aR.b.tJ(.08 * aCC + .03 * aCE),
      aCH = aR.b.tJ(.04 + .02 * aCE),
      aCE = aR.b.tJ(.02 * aCC + .01 * aCE),
      aCJ = aR.b.tJ(.025);
    a6N.style.font = aR.b.dF(0, aCJ), aBs.style.font = aR.b.dF(0, .9 * aCJ), aBx.style.font = aR.b.dF(0, .9 * aCJ), aCC < 1 && (aCJ = aR.b.dF(0, aCC * aCJ), aBq.style.font = aCJ, aBs.style.font = aCJ, aBx.style.font = aCJ, aBu.style.font = aCJ, aBr.style.font = aCJ), aBp.style.height = aR.b.nz(aCD), aBp.style.font = aR.b.dF(0, .72 * aCD), aR.b.g1(aBp, 2), aBq.style.top = aR.b.nz(aCD), aBq.style.height = aR.b.nz(aCG), aR.b.g1(aBq, 2), aBr.style.font = aR.b.dF(0, aCC * aR.b.tJ(.02)), aBr.style.top = aR.b.nz(aCD + aCG), aBr.style.height = aR.b.nz(aCH), aR.b.g1(aBr, 2), aBs.style.top = aR.b.nz(aCD + aCG + aCH), aBs.style.height = aR.b.nz(aCF), aR.b.g1(aBs, 2), aBt.style.top = aR.b.nz(aCD + aCG + aCH + aCF), aBt.style.height = aR.b.nz(d9.dA / d9.o5 - aCD - aCG - 2 * aCF - aCH - aCE), aBu.style.top = aR.b.nz(d9.dA / d9.o5 - aCF - aCE), aBu.style.height = aR.b.nz(aCE), aR.b.g1(aBu, 8), aBw.style.font = aR.b.dF(0, .8 * aCE), aBx.style.top = aR.b.nz(d9.dA / d9.o5 - aCF), aBx.style.height = aR.b.nz(aCF), aR.b.g1(aBx, 8), aBj.resize(aBq), aBk.resize(aBq), aBl.resize(aBq), aBm.resize(aBq), aCB ? this.aBy.resize(aBt) : this.aC0.resize();
  };
  aBn = this;
  a6N.style.position = "absolute", a6N.style.top = "0", a6N.style.left = "0", a6N.style.width = "100%", a6N.style.height = "100%", a6N.style.backgroundColor = bG.fz, a5t.a5u() || (a6N.style.backdropFilter = "blur(4px)", a6N.style.webkitBackdropFilter = "blur(4px)"), aBp.style.position = "absolute", aBp.style.top = "0", aBp.style.left = "0", aBp.style.width = "100%", aBp.style.display = "flex", aBp.style.alignItems = "center", aBp.translate = !1;
  for (var a6 = [aBq, aBr, aBs, aBx], aN = 0; aN < a6.length; aN++) a6[aN].style.position = "absolute", a6[aN].style.left = "0", a6[aN].style.width = "100%", aR.b.sv(a6[aN]);
  aBt.style.position = "absolute", aBt.style.left = "0", aBt.style.width = "100%", aBt.style.font = "inherit", aBu.style.position = "absolute", aBu.style.left = "0", aBu.style.width = "100%", aBv.style.position = "absolute", aBv.style.top = "0", aBv.style.left = "0", aBv.style.height = "100%", aBv.style.width = "50%", aBv.style.backgroundColor = bG.aC3, aBw.innerHTML = "", aBw.style.position = "absolute", aBw.style.top = "50%", aBw.style.left = "50%", aBw.style.transform = "translate(-50%, -50%)", aBw.translate = !1, aBp.appendChild(function () {
    var aC6 = document.createElement("h1");
    return aC6.textContent = L(180), aC6.style.margin = "0 auto 0.15em auto", aC6.style.fontFamily = "Arial Black, system-ui", aC6.style.fontSize = "inherit", aC6.style.fontWeight = "inherit", aC6;
  }()), aBq.appendChild(aBj.nx), aBr.appendChild(aBk.nx), aBs.appendChild(aBl.nx), aBu.appendChild(aBv), aBu.appendChild(aBw), aBx.appendChild(aBm.nx), a6N.appendChild(aBp), a6N.appendChild(aBq), a6N.appendChild(aBr), a6N.appendChild(aBs), a6N.appendChild(aBt), a6N.appendChild(aBu), a6N.appendChild(aBx), aBn.aC0.show(aBt);
}
function aCL() {
  this.aCM = function () {
    for (var d1, eT, oL, aCN = a5E, aCO = fU.a1m, aO = fU.fV, aCP = aO - 1, aCQ = fU.iD - 1, aL = 0, eU = 1; eU < aCQ; eU++) for (oL = eU * aO, eT = 1; eT < aCP; eT++) aCO[d1 = oL + eT << 2] === aCO[1 + d1] && aCO[d1] === aCO[2 + d1] && (aL++, aCN[2 + d1] = 4);
    vD.aCR = aL;
  }, this.aCS = function (aCT, aCU) {
    for (var aCN = a5E, aO = fU.fV, aCP = aO - 1, aCQ = fU.iD - 1, id = 0, eU = 1; eU < aCQ; eU++) for (var oL = eU * aO, eT = 1; eT < aCP; eT++) {
      var fK = 2 + (oL + eT << 2);
      aCN[fK] === aCT && (!function (fK, id, aCT, aCU) {
        var aM = 1,
          aCN = a5E,
          aCW = d5.aCX,
          xV = [fK],
          aCY = id >> 8 << 1,
          aCZ = 255 & id;
        aCN[fK - 2] = aCY, aCN[fK - 1] = aCZ, aCN[fK] = 5;
        for (; aM;) {
          for (var xW = [], aN = 0; aN < aM; aN++) for (var hk = xV[aN], fS = 0; fS < 8; fS++) {
            var l2 = hk + aCW[fS];
            aCN[l2] === aCT && (aCN[l2 - 2] = aCY, aCN[l2 - 1] = aCZ, aCN[l2] = aCU, xW.push(l2));
          }
          aM = (xV = xW).length;
        }
      }(fK, id, aCT, aCU), id = (id + 1) % 32768);
    }
  }, this.aCa = function () {
    for (var aCN = a5E, aO = fU.fV, aCP = aO - 3, aCQ = fU.iD - 3, aCc = 12 * aO, eU = 3; eU < aCQ; eU++) for (var oL = eU * aO, eT = 3; eT < aCP; eT++) {
      var fK = 2 + (oL + eT << 2);
      2 !== aCN[fK] || 2 === aCN[fK - 12] && 2 === aCN[12 + fK] && 2 === aCN[fK - aCc] && 2 === aCN[fK + aCc] || (aCN[fK - 2] = 1 | aCN[fK - 2]);
    }
  };
}
function aCd() {
  this.oq = function (player) {
    return !!ct.data.passableWater && h0.b1.ka !== h0.b1.pa && h0.b1.a4P[player] !== h0.b1.aCe && 0 !== d3.kn[player].length;
  }, this.or = function (a8d) {
    var ph = k3.oo[1];
    return !(4 <= ph || !h0.nd.a4N(dr.iI(a8d))) && d5.kr(dr.iI(dr.iQ(a8d, ph)));
  };
}
function aCf() {
  this.aCg = [], this.aCh = [], this.r = function () {
    this.aCg = [], this.aCh = [];
  }, this.f1 = function () {
    0 <= this.aCg.length && this.aCi(this.aCg), 0 <= this.aCh.length && this.aCi(this.aCh);
  }, this.aCi = function (a6) {
    for (var ex = -1, aN = a6.length - 1; 0 <= aN; aN--) if (a6[aN].dz--, a6[aN].dz <= 0) {
      ex = aN;
      break;
    }
    for (aN = ex; 0 <= aN; aN--) a6.shift();
  }, this.aCj = function (id, ix, aCk) {
    return this.aCl(this.aCg, id, ix, aCk);
  }, this.aCm = function (id, ix, aCk) {
    return this.aCl(this.aCh, id, ix, aCk);
  }, this.aCl = function (a6, id, ix, aCk) {
    return !function (a6, id, ix) {
      var aN, dZ;
      for (aN = ix.length - 1; 0 <= aN; aN--) for (dZ = a6.length - 1; 0 <= dZ; dZ--) if (a6[dZ].player === ix[aN] && id === a6[dZ].id) return 1;
      return;
    }(a6, id, ix) && (aCk && function (a6, id, ix) {
      var aN;
      for (aN = ix.length - 1; 0 <= aN; aN--) a6.push({
        player: ix[aN],
        id: id,
        dz: 384
      });
    }(a6, id, ix), !0);
  };
}
function i() {
  var aCp = {
      ":joy:": "😂",
      ":rofl:": "🤣",
      ":sob:": "😭",
      ":sad": "😔",
      ":eyes:": "👀",
      ":skull:": "💀",
      ":fire:": "🔥",
      ":100:": "💯",
      ":clown:": "🤡",
      ":sunglasses:": "😎",
      ":thinking:": "🤔",
      ":zzz:": "😴",
      ":rage:": "😡",
      ":poop:": "💩",
      ":thumbsup:": "👍",
      ":thumbsdown:": "👎",
      ":pray:": "🙏",
      ":clap:": "👏",
      ":trophy:": "🏆",
      ":sparkles:": "✨",
      ":heart:": "❤️",
      ":brokenheart:": "💔",
      ":laughing:": "😆",
      ":grimacing:": "😬",
      ":grinning:": "😀",
      ":ok:": "👌",
      ":pepehands:": "🙌",
      ":gold:": "🧈"
    },
    aCq = new RegExp(":[a-zA-Z0-9_]+:", "g");
  this.aCr = function (ws) {
    return ws.replace(aCq, function (match) {
      return aCp[match] || match;
    });
  }, this.dG = function (aY) {
    var aN, a08, aCs, aCt, aCu;
    if (aY < 0) return "-" + this.dG(Math.abs(aY));
    if (aY < 1e3) return aY.toString();
    for (a08 = Math.floor(Math.log(aY + .5) / Math.log(10)) + 1, aCs = Math.floor((a08 - 1) / 3), aCu = (aCt = aY.toString()).substring(a08 - 3, a08), aN = 1; aN < aCs; aN++) aCu = aCt.substring(a08 - 3 * (aN + 1), a08 - 3 * aN) + " " + aCu;
    return aCt.substring(0, a08 - 3 * aCs) + " " + aCu;
  }, this.qd = function (d1, a08) {
    return d1.toFixed(a08) + "%";
  }, this.aCv = function (aY, aCw) {
    return aY.toFixed(he.hf(Math.floor((void 0 === aCw ? 3 : aCw) - Math.log10(Math.max(aY, 1))), 0, 8));
  }, this.aCx = function (aY, fM, a08) {
    aY = Number(aY);
    return ((isNaN(aY) ? 0 : aY) * fM).toFixed(a08);
  }, window.__TERRIX_ENGINE__ = window.__TERRIX_ENGINE__ || {}, window.__TERRIX_ENGINE__.onRenderFrameCallbacks = window.__TERRIX_ENGINE__.onRenderFrameCallbacks || [], window.__TERRIX_ENGINE__.onRenderFrame = window.__TERRIX_ENGINE__.onRenderFrame || function (cb) {
    this.onRenderFrameCallbacks.push(cb);
  }, window.__TERRIX_ENGINE__.getAccountGold = window.__TERRIX_ENGINE__.getAccountGold || function () {
    return "undefined" != typeof account && account.z && account.z.aPy && null != account.z.aPy.y4 && 0 !== account.z.aPy.y4 ? account.z.aPy.y4 : "undefined" != typeof connectionMgr && connectionMgr.buffer && connectionMgr.buffer.data && connectionMgr.buffer.data[113] && void 0 !== connectionMgr.buffer.data[113].value ? connectionMgr.buffer.data[113].value : 0;
  }, window.__TERRIX_ENGINE__.getAccountUsername = window.__TERRIX_ENGINE__.getAccountUsername || function () {
    return "undefined" != typeof connectionMgr && connectionMgr.buffer && connectionMgr.buffer.data && connectionMgr.buffer.data[105] && connectionMgr.buffer.data[105].value || "";
  }, window.__TERRIX_HOOK_RENDER__ = function (ws, a0O, im, ox, oy) {
    if (window.__TERRIX_ENGINE__ && 0 < window.__TERRIX_ENGINE__.onRenderFrameCallbacks.length) for (var g = "undefined" != typeof dictionary && dictionary.game && window[dictionary.game] ? window[dictionary.game] : void 0 !== c ? c : "undefined" != typeof aE ? aE : "undefined" != typeof game ? game : null, pd = "undefined" != typeof dictionary && dictionary.playerData && window[dictionary.playerData] ? window[dictionary.playerData] : "undefined" != typeof y ? y : "undefined" != typeof ah ? ah : "undefined" != typeof playerData ? playerData : null, mh = "undefined" != typeof dictionary && dictionary.mapHolder && window[dictionary.mapHolder] ? window[dictionary.mapHolder] : "undefined" != typeof gW ? gW : null, tm = "undefined" != typeof j1 ? j1 : void 0 !== ad ? ad : "undefined" != typeof tileMap ? tileMap : null, engineCtx = {
        ws: ws,
        a0O: a0O,
        im: "number" == typeof im ? im : "undefined" != typeof fu ? fu : null,
        offsetX: ox,
        offsetY: oy,
        game: g,
        playerData: pd,
        mapHolder: mh,
        tileMap: tm,
        tileManager: "undefined" != typeof j1 ? j1 : null,
        gameClock: void 0 !== bc ? bc : "undefined" != typeof au ? au : null
      }, i = 0; i < window.__TERRIX_ENGINE__.onRenderFrameCallbacks.length; i++) try {
      window.__TERRIX_ENGINE__.onRenderFrameCallbacks[i](engineCtx);
    } catch (e) {
      console.error("[TerriX Engine Hook Error]", e);
    }
  }, this.ag = function (username) {
    var l2,
      hk = username.indexOf("[");
    return !(hk < 0) && 1 < (l2 = username.indexOf("]")) - hk && l2 - hk <= 8 ? username.substring(hk + 1, l2).toUpperCase().trim() : null;
  }, __fx.leaderboardFilter.parseClanFromPlayerName = this.ag;
  this.aCy = function (bS) {
    for (var aQ = Math.floor(.5 * bS.length + .5), fN = Math.floor(.5 * (aQ - 1)), aN = 0; aN < fN; aN++) for (var ex = -1; ex < 2; ex += 2) {
      var bW = aQ + ex * aN;
      if (" " === bS[bW]) return [this.aCz(bS.substring(0, bW)), this.aD0(bS.substring(bW))];
    }
    return [bS.substring(0, aQ), bS.substring(aQ)];
  }, this.aD0 = function (bS) {
    for (var aM = bS.length, aN = 0; aN < aM; aN++) if (" " !== bS[aN]) return bS.substring(aN);
    return bS;
  }, this.aCz = function (bS) {
    for (var aN = bS.length - 1; 0 <= aN; aN--) if (" " !== bS[aN]) return bS.substring(0, aN + 1);
    return bS;
  }, this.aD1 = function (bS, a3O) {
    return bS.split("(")[0] + "(🧈 " + a3O.toFixed(2) + ")";
  }, this.startsWith = function (bS, aD2) {
    return bS.substring(0, aD2.length) === aD2;
  }, this.aX = function (bS, aD2) {
    var aM = bS.length;
    return bS.substring(aM - aD2.length, aM) === aD2;
  }, this.te = function (a6, aD3, aD4) {
    var bS = "",
      aM = a6.length - 1;
    aD4 = aD4 || "";
    for (var aN = 0; aN < aM; aN++) bS += aD4 + a6[aN] + aD4 + ",", (aN + 1) % aD3 == 0 && (bS += "\n");
    return bS += aD4 + a6[aM] + aD4;
  }, this.a1Y = function (bS, f7, f8) {
    return bS.replace(new RegExp(f7, "g"), f8);
  };
}
function aD5(title, ze, a01) {
  var am, aBh;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), aBh.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, a01 = a01 || [new ap("⬅️ " + L(1), function () {
    aq.ar();
  }, bG.a9u)], am = new ao(title, a01), aBh = new zd(am.au, ze), aR.b.textAlign(am.au.style, 1);
}
function ap(aD6, aD7, aD8, aD9, aDA) {
  var self,
    aDB = document.createElement("button");
  function aDD() {
    var rf;
    a5t.a5u() || (rf = aR.color.uX(aD8), !1 !== aD9 && 0 < rf[0] && rf[0] < 255 && rf[0] === rf[1] && rf[0] === rf[2]) || (128 < rf[0] && 128 < rf[1] && 128 < rf[2] ? aDB.style.backgroundColor = aR.color.fp(aD8, -50) : aDB.style.backgroundColor = aR.color.fp(aD8, rf[3] && rf[3] < 120 ? 150 : 50));
  }
  function aDC() {
    if (aD9) {
      var rf = aR.color.uX(aD8);
      if (rf[0] === rf[1] && rf[0] === rf[2]) return;
    }
    aD7 && ((rf = aD7(this)) ? 2 === rf && aDD() : aDI(this));
  }
  function aDF() {
    this.style.backgroundColor = aD8;
  }
  function aDE() {
    aDI(this);
  }
  function aDI(fS) {
    fS.style.backgroundColor = aD8, fS.blur();
  }
  this.button = aDB, this.bY = aD7, this.zS = aD8, this.ny = function (aDG) {
    aDG = 1.1 - Math.min(.01 * aD6.length, .6) + .2 * aDG;
    aDB.style.fontSize = aDG.toFixed(1) + "em";
  }, this.bF = function (bW) {
    bW ? 1 === bW ? bW = bG.zT : 2 === bW && (aD9 = 1, bW = bG.zT) : (aD9 = 0, bW = bG.su), this.zS = aD8 = bW, aDB.style.backgroundColor = bW;
  }, self = this, aDB.innerHTML = aD6, aDB.style.color = aDA ? bG.bI : bG.bH, aDB.style.userSelect = "none", aDB.style.outline = "none", aDB.style.overflowWrap = "break-word", self.bF(aD8), aDB.style.border = "none", aDB.style.font = "inherit", self.ny(0), aDB.style.padding = "0em 0.3em", aDB.onclick = aDC, aDB.addEventListener("mouseover", aDD), aDB.addEventListener("mouseout", aDE), aDB.addEventListener("focus", aDD), aDB.addEventListener("blur", aDF);
}
function aDJ() {
  this.f1 = function (player, kh) {
    player = h0.nd.a4O(player, kh);
    return !(player < 0 || !h0.kc.pt(player) || (h0.kc.kd(player), 0));
  };
}
function aDL() {
  var aDM, aDN, aO, eT, eU, aDO, aDP;
  this.r = function () {
    aDM = new Array(2), aDN = new Array(2), this.a3b = !1, aDP = aDO = e7 = e4 = 0, e5 = 1, this.resize();
  }, this.resize = function () {
    aO = (aO = Math.floor((cA.hg.hh() ? .072 : .0502) * d9.dC)) < 8 ? 8 : aO;
    for (var aN = 1; 0 <= aN; aN--) aDM[aN] = document.createElement("canvas"), aDM[aN].width = aO, aDM[aN].height = aO, aDN[aN] = aDM[aN].getContext("2d", {
      alpha: !0
    });
    this.lV(), function () {
      for (var aDe = Math.floor(1 + aO / 20), aN = 1; 0 <= aN; aN--) aDN[aN].clearRect(0, 0, aO, aO), aDN[aN].fillStyle = bG.aDf, aDN[aN].beginPath(), aDN[aN].arc(aO / 2, aO / 2, aO / 2 - aDe, 0, 2 * Math.PI), aDN[aN].fill(), aDN[aN].lineWidth = aDe, aDN[aN].fillStyle = bG.bH, aDN[aN].strokeStyle = bG.bH, aDN[aN].beginPath(), aDN[aN].arc(aO / 2, aO / 2, aO / 2 - aDe, 0, 2 * Math.PI), aDN[aN].stroke(), mu(aDN[aN], 0, 0, aO, aDe, .3, 0 === aN);
    }();
  }, this.aDT = function () {
    return -e4 / e5;
  }, this.mw = function () {
    return -e7 / e5;
  }, this.aDU = function (a7o, hw) {
    e4 = e5 * a7o - hw;
  }, this.aDV = function (a7p, hx) {
    e7 = e5 * a7p - hx;
  }, this.mv = function (aDS, uS) {
    return ct.ur || !function (aDS, uS) {
      return Math.pow(aDS - (eT + aO / 2), 2) + Math.pow(uS - (eU + aO / 2), 2) < aO * aO / 4 || Math.pow(aDS - (eT + aO / 2), 2) + Math.pow(uS - (eU + 2 * aO), 2) < aO * aO / 4;
    }(aDS, uS) || b6.buffer.data[8].value ? (hI.fN() && (this.a3b = !0, aDO = aDS, aDP = uS), !1) : uS < eU + 1.25 * aO ? this.uI(Math.floor(d9.aO / 2), Math.floor(d9.dA / 2), -200) : this.uI(Math.floor(d9.aO / 2), Math.floor(d9.dA / 2), 200);
  }, this.dh = function (aDS, uS) {
    var aDW, aDX, df, dg;
    return !hI.fN() || (aDW = e4, aDX = e7, e4 += df = aDO - aDS, e7 += dg = aDP - uS, di.dh(df, dg), this.qB(), aDO = aDS, aDP = uS, aDW !== e4) || aDX !== e7;
  }, this.uI = function (dk, dl, deltaY) {
    var fM;
    if (hI.fN()) {
      if (0 < deltaY) fM = (fM = 500 / (500 + deltaY)) < .5 ? .5 : fM;else {
        if (!(deltaY < 0)) return !1;
        fM = 2 < (fM = (500 - deltaY) / 500) ? 2 : fM;
      }
      this.aDY(dk, dl, fM), dy.gK = !0;
    }
    return !0;
  }, this.aDY = function (eT, eU, fK) {
    var dj;
    fK = dj = (dj = 1024 < (dj = fK) * e5 ? 1024 / e5 : dj) * e5 < .125 ? .125 / e5 : dj, di.zoom(fK, eT, eU), function (dj, dk, dl) {
      e5 *= dj, e4 = (e4 + dk) * dj - dk, e7 = (e7 + dl) * dj - dl, qA.qB();
    }(fK, eT, eU);
  }, this.qB = function () {
    var aDb = d9.aO / 16,
      a6r = 0,
      aDc = d9.dA / 16,
      a6s = 0;
    e4 < aDb - d9.aO && (a6r = -d9.aO + aDb - e4), e4 > e5 * fU.fV - aDb && (a6r = e5 * fU.fV - aDb - e4), e7 < aDc - d9.dA && (a6s = -d9.dA + aDc - e7), e5 * fU.iD - aDc < e7 && (a6s = e5 * fU.iD - aDc - e7), e4 += a6r, e7 += a6s, aA4.aDd(), di.de(a6r, a6s);
  }, this.lV = function () {
    eT = d9.aO - aO - lS.gap, eU = Math.floor(d9.dA / 2 - 1.25 * aO);
  }, this.dd = function () {
    b6.buffer.data[8].value || (dE.drawImage(aDM[0], eT, eU), dE.drawImage(aDM[1], eT, Math.floor(eU + 3 * aO / 2)));
  };
}
function a3K() {
  var aDg, aDh, aDi;
  function aDo(aN) {
    return aR.color.sD(aDh[aN][0], aDh[aN][1], aDh[aN][2]);
  }
  function a5s(aQ, ex) {
    return aR.color.ua(aDh[aQ], aDh[ex]), aDo(ex);
  }
  function aDm() {
    aDg && (aDg.remove(), aDg = null);
  }
  this.show = function (ws, colors, id) {
    0 <= (aDi = id) && aF.b1.bM(0) && aF.lk.bx(0, id), ws = (ws = (ws = (ws = (ws = (ws = (ws = (ws = (ws = (ws = (ws = (ws = ws.trim()).replace(new RegExp("[<>]", "g"), "")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?discord\\.gg\\/([A-Za-z0-9_-]+)\\b", "g"), "<a href='https://discord.gg/$1' target='_blank'>discord.gg/$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/watch\\?v=([A-Za-z0-9_-]+)\\b", "g"), "<a href='https://youtube.com/watch?v=$1' target='_blank'>youtube.com/watch?v=$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/@([A-Za-z0-9_-]+)\\b", "g"), "<a href='https://youtube.com/@$1' target='_blank'>youtube.com/@$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?tiktok\\.com\\/(@[A-Za-z0-9._-]+\\/video\\/([0-9]+))\\b", "g"), "<a href='https://tiktok.com/$1' target='_blank'>tiktok.com/$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?t\\.me\\/([A-Za-z0-9_]+)\\b", "g"), "<a href='https://t.me/$1' target='_blank'>t.me/$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?x\\.com\\/([A-Za-z0-9_]+)\\b", "g"), "<a href='https://x.com/$1' target='_blank'>x.com/$1</a>")).replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?patreon\\.com\\/([A-Za-z0-9_-]+)\\b", "g"), "<a href='https://patreon.com/$1' target='_blank'>patreon.com/$1</a>")).replace(new RegExp("\\r?\\n", "g"), "<br>")).replace(new RegExp("\\*\\*(.*?)\\*\\*", "g"), "<b>$1</b>")).replace(new RegExp("\\*(.*?)\\*", "g"), "<i>$1</i>"), aDh = colors, (aDg = document.createElement("div")).style.position = "fixed", aDg.style.top = "0", aDg.style.left = "0", aDg.style.width = "100%", aDg.style.height = "100%", aDg.style.backgroundColor = aR.color.fh(aDh[0][0], aDh[0][1], aDh[0][2], .6), aDg.style.zIndex = "6", aDg.onclick = function (b7) {
      b7.target === aDg && aDm();
    }, function (ws) {
      var el,
        aDn = document.createElement("div");
      aDn.style.position = "absolute", aDn.style.display = "flex", aDn.style.flexDirection = "column", aDn.style.top = "50%", aDn.style.left = "50%", aDn.style.backgroundColor = aDo(2), el = cA.hg.hh() ? aR.b.aDp(d9.min) : aR.b.tJ(.4);
      el = Math.max(el, 200), aDn.style.width = aR.b.nz(el), aDn.style.height = aR.b.nz(el), aDn.style.transform = "translate(-50%, -50%)", function (aDn, el) {
        var aDt = document.createElement("div");
        aDt.style.flex = "0 0 10%", aDt.style.overflow = "hidden", aDt.style.backgroundColor = aDo(1), aDt.style.color = a5s(1, 7), aDt.style.font = aR.b.dF(1, .05 * el), aDt.style.display = "flex", aDt.style.alignItems = "center", aDt.style.justifyContent = "center", aDt.innerHTML = L(181), aDn.appendChild(aDt);
      }(aDn, el), function (aDn, ws, el) {
        var aDu = document.createElement("div");
        aDu.style.flex = "0 0 70%", aDu.style.overflowY = "auto", aDu.style.overflowX = "hidden", aDu.style.whiteSpace = "pre-wrap", aDu.style.wordWrap = "break-word", aDu.style.padding = aR.b.nz(.02 * el), aDu.style.backgroundColor = aDo(2), aDu.style.color = a5s(2, 8), aDu.style.font = aR.b.dF(0, .07 * el), aDu.innerHTML = ws, aDu.innerHTML = "<style>a { color: inherit; }</style>" + aDu.innerHTML, aDn.appendChild(aDu);
      }(aDn, ws, el), function (aDn, el) {
        var wV = document.createElement("div"),
          aDv = (wV.style.display = "flex", wV.style.flexDirection = "row", wV.style.justifyContent = "space-between", wV.style.alignItems = "stretch", wV.style.backgroundColor = aDo(3), wV.style.flex = "1", wV.style.padding = aR.b.nz(.01 * el), wV.style.gap = aR.b.nz(.01 * el), document.createElement("div")),
          aDw = (aDv.style.flex = "0 0 60%", aDv.style.height = "100%", new ap(L(182, 0, 0, 1), function () {
            aDm();
          }, aDo(4), !1)),
          aDw = (aDw.button.style.width = "100%", aDw.button.style.height = "100%", aDw.button.style.color = a5s(4, 9), aDw.button.style.font = aR.b.dF(1, .05 * el), aDv.appendChild(aDw.button), document.createElement("div")),
          aDy = (aDw.style.flex = "0 0 15%", aDw.style.height = "100%", aDw.style.backgroundColor = aDo(5), document.createElement("div")),
          aDz = (aDy.style.flex = "1", aDy.style.height = "100%", new ap(L(183), function (b7) {
            return aR.b.bN(b7), aDi < 0 || aF.b1.bM(0) && (aF.lk.bx(1, aDi), aDi = -1), !0;
          }, aDo(6), !1));
        aDz.button.style.width = "100%", aDz.button.style.height = "100%", aDz.button.style.color = a5s(6, 10), aDz.button.style.font = aR.b.dF(1, .035 * el), aDy.appendChild(aDz.button), wV.appendChild(aDv), wV.appendChild(aDw), wV.appendChild(aDy), aDn.appendChild(wV);
      }(aDn, el), aDg.appendChild(aDn);
    }(ws), document.body.appendChild(aDg);
  };
}
function a03(lo) {
  var am, an, aw;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(184), [new ap("⬅️ " + L(1), function () {
    aq.wS(10);
  })]), an = new at(am.au, ((aw = []).push(function () {
    var aE4,
      ay = new az(),
      aE5 = new b5(b6.buffer.data[132], 1, function () {
        aE4.button.click();
      }),
      aE6 = new b5(b6.buffer.data[131], 1, function () {
        aE5.b7.focus();
      });
    ay.b3(L(185)), ay.b8(aE6), aE6.b7.style.marginBottom = "0.8em", ay.b3(L(186)), ay.b8(aE5);
    return aE4 = new ap(L(187), function () {
      pL = Math.floor(aE6.b7.value), pM = Math.floor(aE5.b7.value);
      var pM,
        pL = {
          xS: Math.min(pL, pM),
          aE8: Math.max(pL, pM)
        };
      aq.fu(8, aq.wU(10).mB, new fw(21, {
        pK: lo.pK,
        pL: pL.xS,
        pM: pL.aE8
      }));
    }, 0, 0, 1), ay.b8(new bL([aE4.button])), ay;
  }()), aw.push(function () {
    var aE4,
      ay = new az(),
      aE5 = new b5(b6.buffer.data[134], 1, function () {
        aE4.button.click();
      }),
      aE6 = new b5(b6.buffer.data[133], 0, function () {
        aE5.b7.focus();
      });
    return ay.b3(1 === lo.pK ? L(188) : L(189)), ay.b8(aE6), aE6.b7.style.marginBottom = "0.8em", ay.b3(L(190)), ay.b8(aE5), aE4 = new ap(L(187), function () {
      var pO = aE6.b7.value.slice(0, 20),
        pP = Math.abs(Math.floor(aE5.b7.value));
      aq.fu(8, aq.wU(10).mB, new fw(22, {
        pK: lo.pK,
        pO: pO,
        pP: pP
      }));
    }, 0, 0, 1), ay.b8(new bL([aE4.button])), ay;
  }()), aw.push(function () {
    var aE4,
      ay = new az(),
      aE5 = new b5(b6.buffer.data[152], 1, function () {
        aE4.button.click();
      }),
      aE6 = new b5(b6.buffer.data[151], 0, function () {
        aE5.b7.focus();
      });
    return ay.b3(L(191)), ay.b8(aE6), aE6.b7.style.marginBottom = "0.8em", ay.b3(L(190)), ay.b8(aE5), aE4 = new ap(L(187), function () {
      var pO = aE6.b7.value.slice(0, 5),
        pP = Math.abs(Math.floor(aE5.b7.value));
      aq.fu(8, aq.wU(10).mB, new fw(28, {
        pK: lo.pK,
        pO: pO,
        pP: pP
      }));
    }, 0, 0, 1), ay.b8(new bL([aE4.button])), ay;
  }()), aw));
}
function aE9() {
  function aEI() {
    return {
      fV: fU.fV,
      iD: fU.iD,
      uP: fU.uP,
      lR: fU.lR,
      a1k: fU.a1k,
      a1m: fU.a1m,
      jJ: fU.jJ,
      mapSeed: fU.mapSeed,
      uA: fU.uA
    };
  }
  function aEC(aN) {
    return 1 !== aN && fU.a85(aN) && aN !== fU.aEK();
  }
  this.a1H = 25, this.a1P = 13, this.a7h = 4096, this.fV = 0, this.iD = 0, this.uP = null, this.lR = null, this.a1k = null, this.a1m = null, this.jJ = 0, this.mapSeed = 0, this.uA = !1, this.a1l = new aEA(), this.tu = new a13(), this.aCR = new aCL(), this.r = function () {
    this.tu.r();
  }, this.bd = function (map, aEB) {
    ((map %= this.a1H) !== this.jJ || aEC(this.jJ) && aEB !== this.mapSeed) && (this.uA = !1, this.a1l.aED(), iW.v7(map), this.jJ = map, this.mapSeed = aEB, aEC(map) && (fU.tu.tv[map].a1K = aEB), this.a85(this.jJ) ? (map = fU.tu.tv[this.jJ], this.fV = map.aO, this.iD = map.dA, iW.v7(map.a1K), aEE.bd([this.fV, this.iD, map.a1I, map.a1J]), aEF(), vD.aEG(), aEE.aEH()) : a8i());
  }, this.a0N = function (map, aEB) {
    var oL = aEI(),
      map = (this.bd(map, aEB), this.a1l.aED(), aEI());
    return aEB = oL, fU.fV = aEB.fV, fU.iD = aEB.iD, fU.uP = aEB.uP, fU.lR = aEB.lR, fU.a1k = aEB.a1k, fU.a1m = aEB.a1m, fU.jJ = aEB.jJ, fU.mapSeed = aEB.mapSeed, fU.uA = aEB.uA, map;
  }, this.r1 = function (canvas) {
    canvas && this.uP !== canvas && (this.fV = canvas.width, this.iD = canvas.height, this.uP = canvas, this.lR = this.uP.getContext("2d", {
      alpha: !1
    }), this.xp = this.lR.getImageData(0, 0, this.fV, this.iD), this.a1m = this.xp.data, this.jJ = this.aEK(), this.mapSeed = 0, fU.tu.tv[this.jJ].name = ct.data.mapName);
  }, this.aEL = function (aN) {
    return 3 === aN || 7 === aN || 9 === aN || 21 === aN || aN === this.aEK();
  }, this.aA1 = function (aN) {
    return 2 === aN || 7 === aN || 9 === aN || 20 === aN;
  }, this.aEM = function (aN) {
    return 1 === aN;
  }, this.aEK = function () {
    return this.a1H;
  }, this.a85 = function (aN) {
    return void 0 === this.tu.tv[aN].a1N;
  }, this.r0 = function (c3) {
    return 0 === c3.mapType ? c3.mapProceduralIndex < 10 ? c3.mapProceduralIndex : 10 + c3.mapProceduralIndex : 1 === c3.mapType ? 10 <= c3.mapRealisticIndex ? 22 + c3.mapRealisticIndex - 10 : c3.mapRealisticIndex + 10 : void 0;
  }, this.a86 = function (c3, aEN) {
    0 === c3.mapType ? c3.mapProceduralIndex = aEN < 10 ? aEN : aEN - 10 : 1 === c3.mapType && (c3.mapRealisticIndex = aEN - (22 <= aEN ? 12 : 10));
  };
}
function aEO() {
  this.aEP = null, this.gK = !1, this.dz = 0, this.gM = 56;
  var aEQ = 0;
  function aER() {
    dy.dz = aEQ = performance.now(), dy.aEP.f1(), window.requestAnimationFrame(aER);
  }
  this.r = function () {
    this.vU(), window.requestAnimationFrame(aER), this.dz = performance.now();
  }, this.vG = function () {
    ct.mH ? (this.aEP = new aES(), this.aEP.r()) : ct.kD ? this.aEP = new a3L() : (this.aEP = new g5(), this.aEP.r());
  }, this.vU = function () {
    this.aEP = new t9(), this.gK = !0;
  }, this.f1 = function () {
    this.aEP.g6++;
  }, this.f2 = function () {
    return this.aEP.g6;
  }, this.aET = function () {
    var eZ = performance.now();
    eZ < aEQ + 1e3 || (this.dz = eZ, this.aEP.f1());
  };
}
function aEU() {
  var aEV, aEW, aEX;
  function aEa(a6b) {
    for (var aN = aEV - 1; 0 <= aN; aN--) 0 === aEX[aEW[aN]] && d3.d4[aEW[aN]] >= a6b && aEZ(aEW[aN]);
  }
  function aEY(player) {
    var eZ;
    64 === aEX[player] ? aEX[player] = 6 : (eZ = d3.d4[player], aEX[player] = eZ < 1e3 ? 3 : eZ < 1e4 ? 2 : eZ < 6e4 ? 1 : 0);
  }
  this.r = function () {
    aEV = 0, aEW = new Uint16Array(ct.cv), aEX = new Uint8Array(ct.cv);
  }, this.f1 = function () {
    for (var aN = aEV - 1; 0 <= aN; aN--) 64 === aEX[aEW[aN]] ? aEY(aEW[aN]) : 0 == aEX[aEW[aN]]-- && (aEY(aEW[aN]), aEZ(aEW[aN]));
    16e4 <= d3.d4[iw[0]] && (aEa(16e4), 3e5 <= d3.d4[iw[0]]) && aEa(3e5), aR.f.ij(ct.eG) && (hD.a48[7] = Math.max(d3.d4[ct.eG], hD.a48[7]));
  }, this.aEc = function (player) {
    for (var aQ, aN = aEV - 1; 0 <= aN; aN--) if (player === aEW[aN]) {
      for (aEV--, aQ = aN; aQ < aEV; aQ++) aEW[aQ] = aEW[aQ + 1];
      return;
    }
  }, this.lE = function (player, aEd) {
    for (var aN = aEV - 1; 0 <= aN; aN--) if (player === aEW[aN]) return;
    aEW[aEV++] = player, aEX[player] = aEd ? 2 : 64;
  };
}
function aEe() {
  this.bY = new a0j(), this.buffer = new aEf(), this.bJ = new aEg(), this.b1 = new j2(), this.aEh = new lp(), this.r = function () {
    this.buffer.r(), new a2Q().r(), this.aEh.r(), this.b1.jB();
  };
}
function aEi() {
  var aEm,
    aEn,
    aEj = document.createElement("div"),
    aEk = document.createElement("div"),
    a6P = 0,
    aEl = 0;
  this.show = function (eT, eU, bS, aEo, aEp, bW) {
    if (a6P) {
      if (!aEo) return;
      this.bU();
    }
    eT === eU && -1 === eT ? (eT = aEm, eU = aEn) : (aEm = eT, aEn = eU);
    var aEq = Math.floor(aR.b.tJ(.018)),
      aEp = (eT = Math.max(aEq + 2, eT), aEp || (aEl = aEo), a6P = 1, d9.aO / d9.o5),
      aEo = (aEj.style.whiteSpace = "pre", aEj.textContent = bS, aR.b.g1(aEj, 5), aEj.style.font = aR.b.dF(0, aR.b.tJ(.015)), aEj.style.padding = "0.3em 0.6em", aEj.style.left = eT + "px", aEj.style.top = "0px", document.body.appendChild(aEj), eT + aEj.offsetWidth - aEp),
      bS = (0 < aEo && (eT -= aEo, eT = Math.max(aEq + 1, eT), aEj.style.left = eT + "px", eT < aEq + 2) && (aEj.style.whiteSpace = "pre-wrap"), aEj.offsetHeight);
    aEj.style.top = eU - bS + aEl * lS.o3 + "px", eT -= aEq, aEk.style.backgroundColor = aR.color.sD(bW >> 12 << 2, (bW >> 6 & 63) << 2, (63 & bW) << 2), aEk.style.left = eT + "px", aEk.style.top = aEj.style.top, aEk.style.width = aEq + "px", aEk.style.height = bS + "px", aR.b.g1(aEk, 4), aR.b.g1(aEk, 8), aR.b.g1(aEk, 2), document.body.appendChild(aEk);
  }, this.bU = function (aEt) {
    if (a6P) {
      if (aEt && aEl) return 0;
      a6P = 0, aq.removeChild(document.body, aEj), aq.removeChild(document.body, aEk);
    }
    return 1;
  }, aEj.style.position = "absolute", aEj.style.backgroundColor = bG.su, aEj.style.color = bG.bH, aEj.style.pointerEvents = "none", aEj.style.zIndex = "5", aEj.style.maxWidth = "100%", aEk.style.position = "absolute", aEk.style.color = bG.bH, aEk.style.pointerEvents = "none", aEk.style.zIndex = "5";
}
function aEu() {
  function aEx() {
    8 === ct.cu && 1 === ct.dX && nH.nI.nK();
  }
  function aEw(player) {
    ct.dO ? (a7y.aEy(player), eI.a7w(), ct.kD && ct.gI.f1()) : aEz.jR(player);
  }
  this.p7 = function (player) {
    fA.aEv(player, player === ct.eG ? 21 : 22), aEw(player), aEx();
  }, this.pA = function (player) {
    1 === ct.dX && 0 !== d3.eF[player] && 2 !== d3.eL[player] && aEw(player), ct.qm--, ct.qT--, fA.aEv(player, 4), aR.f.nW(2) && gG.dY(!0), aEx();
  };
}
function aF0(el, size, pV, aF1, font) {
  var aN,
    ew = .2,
    canvas = document.createElement("canvas"),
    e2 = canvas.getContext("2d", {
      alpha: !1
    });
  for (canvas.width = el, canvas.height = el, e2.font = size + font, e2.textAlign = "center", e2.textBaseline = "middle", e2.fillStyle = "red", aN = 0; aN < pV.length; aN++) e2.fillText(pV[aN], .5 * el, .5 * el);
  return -1 < (canvas = function (xp) {
    var aN,
      uW,
      fS = xp.data;
    for (aN = fS.length - 4; 0 <= aN; aN -= 4) if (uW = fS[aN], aF1 <= uW) return Math.floor(aN / (4 * el));
    return -1;
  }(e2.getImageData(0, 0, el, el))) && (ew = (canvas - .5 * el + .1 * size) / size), Math.max(ew, 0);
}
function aF4() {
  var size, aF5;
  this.r = function () {
    size = ct.qS, aF5 = new Uint16Array(ct.cv);
    for (var dP = ct.dP, aN = ct.qS - 1; 0 <= aN; aN--) aF5[aN] = dP + aN;
  }, this.f1 = function () {
    gz.kT.f1();
    for (var aN = size - 1; 0 <= aN; aN--) if (0 === d3.eF[aF5[aN]]) {
      aQ = void 0;
      var aQ = aN;
      size--, aF5[aQ] = aF5[size];
    } else tV.f1(aF5[aN]);
  }, this.aF7 = function (d1) {
    aF5[size++] = d1;
  };
}
function aF9() {
  var bW = aR.color;
  this.r8 = bW.sD(0, 0, 0), this.aDf = bW.fh(0, 0, 0, .7), this.uQ = bW.fh(0, 0, 0, .5), this.su = bW.fh(0, 0, 0, .85), this.iq = bW.fh(0, 0, 0, .75), this.a90 = bW.fh(0, 0, 0, .6), this.fz = bW.fh(0, 0, 0, .35), this.bH = bW.sD(255, 255, 255), this.zl = bW.fh(255, 255, 255, .3), this.lX = bW.fh(255, 255, 255, .6), this.aFA = bW.fh(255, 255, 255, .4), this.aFB = bW.fh(255, 255, 255, .25), this.u4 = bW.fh(255, 255, 255, .85), this.mr = bW.fh(255, 255, 255, .75), this.aFC = bW.fh(255, 255, 255, .15), this.aFD = bW.fh(255, 255, 255, .11), this.a93 = bW.sD(128, 128, 128), this.aFE = bW.fh(64, 64, 64, .75), this.a8v = bW.fh(88, 88, 88, .83), this.zT = bW.fh(60, 60, 60, .85), this.aFF = bW.fh(80, 60, 60, .85), this.aFG = bW.sD(170, 170, 170), this.aFH = bW.sD(200, 235, 245), this.aFI = bW.sD(30, 255, 30), this.aFJ = bW.sD(0, 200, 0), this.nP = bW.sD(128, 255, 128), this.aFK = bW.fh(10, 65, 10, .75), this.mo = bW.fh(0, 255, 0, .6), this.aFL = bW.fh(0, 255, 0, .5), this.aC3 = bW.fh(0, 200, 0, .5), this.mQ = bW.fh(0, 100, 0, .75), this.t0 = bW.fh(0, 60, 0, .8), this.aAm = bW.fh(0, 255, 0, .3), this.aFM = bW.fh(0, 180, 0, .6), this.aFN = bW.fh(0, 120, 0, .85), this.a95 = bW.sD(0, 120, 0), this.aFO = bW.fh(0, 70, 0, .85), this.aFP = bW.sD(190, 230, 190), this.aFQ = bW.sD(0, 255, 0), this.aFR = bW.sD(255, 120, 120), this.ks = bW.sD(255, 160, 160), this.yE = bW.sD(255, 70, 70), this.a94 = bW.sD(230, 0, 0), this.mp = bW.fh(220, 0, 0, .6), this.aFS = bW.fh(255, 100, 100, .8), this.aFT = bW.fh(100, 0, 0, .85), this.sz = bW.fh(60, 0, 0, .85), this.aFU = bW.fh(200, 0, 0, .6), this.a9u = bW.fh(120, 0, 0, .85), this.aFV = bW.sD(255, 70, 10), this.aFW = bW.sD(230, 190, 190), this.aFX = bW.sD(255, 0, 0), this.aFY = bW.sD(255, 0, 255), this.sx = bW.fh(60, 0, 60, .85), this.sy = bW.fh(0, 60, 60, .85), this.aFZ = bW.fh(10, 60, 60, .9), this.aFa = bW.fh(0, 96, 96, .75), this.aFb = bW.sD(0, 255, 255), this.qE = bW.sD(160, 160, 255), this.aAk = bW.fh(0, 40, 90, .75), this.aFc = bW.fh(0, 0, 255, .6), this.aFd = bW.sD(200, 200, 255), this.a8u = bW.fh(50, 50, 255, .83), this.aAj = bW.fh(20, 90, 150, .75), this.aFe = bW.fh(10, 10, 120, .75), this.qc = bW.sD(255, 120, 100), this.aFf = bW.fh(255, 255, 0, .5), this.aAn = bW.fh(255, 255, 150, .2), this.bI = bW.sD(255, 255, 0), this.aFg = bW.sD(255, 255, 200), this.aFh = bW.fh(200, 200, 0, .6), this.aFi = bW.fh(140, 120, 0, .75), this.aFj = bW.fh(180, 160, 40, .75), this.aFk = bW.fh(70, 50, 20, .85), this.aFl = bW.fh(30, 30, 0, .85), this.t2 = bW.fh(60, 60, 0, .85), this.lb = bW.sD(255, 255, 100), this.aFm = bW.sD(255, 255, 140), this.aFn = bW.fh(255, 140, 0, .75), this.t1 = bW.fh(70, 40, 0, .85), this.aFo = bW.sD(255, 150, 0), this.aFp = bW.fh(255, 200, 80, .85), this.ml = bW.fh(0, 0, 0, 0), this.aFq = bW.fh(255, 255, 255, 0), this.aFr = bW.fh(254, 254, 254, 0);
}
function aFs() {
  this.aFt = [L(192), L(193), L(194), L(195), L(196), L(197), L(198), L(199), L(200), L(201), L(202), L(203), L(204), L(205), L(206), L(207)];
  var aFu = ["Space", "", "KeyB", "", "KeyW", "", "KeyS", "", "KeyD", "", "KeyA", "", "KeyH", "", "NumpadAdd", "", "NumpadSubtract", "", "ArrowLeft", "", "ArrowRight", "", "ArrowUp", "", "ArrowDown", "", "KeyM", "", "KeyP", "", "KeyI", ""];
  this.aFv = new Array(aFu.length), this.r = function () {
    var a6 = b6.buffer.data[155].value.split(";"),
      aW = a6.length;
    if (function () {
      for (var aM = aFu.length, aN = 0; aN < aM; aN++) aFx.aFv[aN] = aFu[aN];
    }(), !(aW > aFu.length)) for (var aN = 0; aN < aW; aN++) a6[aN].length && (this.aFv[aN] = a6[aN]);
  }, this.aFy = function (af, code) {
    for (var aFv = this.aFv, aFz = aFu, bS = (aFv[af] = code, ""), aM = aFv.length, aG0 = [], aN = 0; aN < aM; aN++) aG0.push(aFv[aN] === aFz[aN] ? "" : aFv[aN]);
    aM--;
    for (aN = 0; aN < aM; aN++) bS += aG0[aN] + ";";
    b6.bJ.bK(155, bS += aG0[aM]);
  }, this.aG1 = function () {
    b6.bJ.bK(155, ""), this.r();
  }, this.bW = function (code, af) {
    return code === this.aFv[af] || code === this.aFv[af + 1];
  };
}
function aG2() {
  var aG4, aG5;
  this.aG3 = 4, this.aBa = null, this.c7 = 0, this.bu = 0;
  function aGD() {
    return 0 === mF.aGE ? c8.aGF ? 1 : 0 : mF.aGE - 1;
  }
  function aGH(bb, mB, aBT) {
    aG5[bb].px = !0, aG8(bb), aG4[bb] = new aBO(), aG4[bb].r(bb, mB, aBT);
  }
  function aBX(aN) {
    return aG5[aN].px && aG4[aN].aBX();
  }
  function aG8(bb) {
    aG5[bb].dz = dy.dz, aG5[bb].yH = !1;
  }
  this.r = function () {
    this.aBa = new Array(this.aG3), this.aBa[0] = "territorial.io", this.aBa[1] = "1.territorial.io", this.aBa[2] = "4.territorial.io", this.aBa[3] = "5.territorial.io", aG4 = new Array(this.aG3), aG5 = new Array(this.aG3);
    for (var aN = this.aG3 - 1; 0 <= aN; aN--) aG5[aN] = {
      px: !1,
      dz: 0,
      yH: !1
    };
    this.aG7(0, 0, 0);
  }, this.a28 = function (aN) {
    return aG4[aN];
  }, this.f1 = function () {
    for (var aN = this.aG3 - 1; 0 <= aN; aN--) this.bM(aN) && dy.dz > aG5[aN].dz + 15e3 && (aF.a2A.yG(aN, aG5[aN].yH), aG8(aN));
    !this.bM(0) && dy.dz > aG5[0].dz + 8e3 && (aG5[0].dz = dy.dz, this.aG7(0, 0, 0));
  }, this.aG9 = function (id) {
    return this.aG7(0, id, 0) && this.aBW(0);
  }, this.aGA = function (aGB) {
    return aGB ? mF.aGC : aGD();
  }, this.a5R = function () {
    return aGD() ? "game.territorial.io" : "territorial.io";
  }, this.b2 = function (aGG) {
    aGG = this.a5R() + aGG;
    return "<a href='https://" + aGG + "' target='_blank'>" + aGG + "</a>";
  }, this.aG7 = function (bb, mB, aGB) {
    aGB = this.aGA(aGB);
    if (aG5[bb].px) {
      if (aG4[bb].aBX()) return aG4[bb].aBY(mB), aG4[bb].bM();
      aG4[bb].bU();
    }
    return aGH(bb, mB, aGB), !1;
  }, this.aBb = function (bb, mB) {
    console.log("Connection to Server " + bb), aF.lk.ba(bb);
  }, this.aBW = function (aN) {
    return this.bM(aN) && aG4[aN].aBW();
  }, this.a2C = function (aN) {
    aG4[aN].a2C();
  }, this.bM = function (aN) {
    return aG5[aN].px && aG4[aN].bM();
  }, this.send = function (bb, bk) {
    0 !== bb && aG8(bb), aG4[bb].send(bk);
  }, this.aGI = function (bb) {
    8 === jE.jF() && (aG5[bb].yH = !0, aF.hF.aGJ = !0);
  }, this.close = function (bb, aBZ) {
    aBX(bb) && aG4[bb].close(aBZ);
  }, this.a2K = function (bb, aBZ) {
    a71.mL(aBZ), aBX(bb) && aG4[bb].close(aBZ);
  }, this.mS = function (aBZ) {
    for (var aN = this.aG3 - 1; 0 <= aN; aN--) this.close(aN, aBZ);
  }, this.aGK = function (bb, aBZ) {
    for (var aN = this.aG3 - 1; 0 <= aN; aN--) aN !== bb && this.close(aN, aBZ);
  }, this.vT = function () {
    0 === this.c7 && (ct.kD || ct.mH) || this.close(this.c7, 3246);
  }, this.aBd = function (bb, b7) {
    aG4[bb].bU(), a71.m5(bb, b7.code);
  };
}
function a2g() {
  function aGW() {
    var kA;
    return 8 === ct.cu ? 0 : (kA = Math.floor(d3.a5i[ct.eG] / 50), (kA = Math.min(kA, 200)) / 100);
  }
  function aGP() {
    var kA = aGW();
    0 !== kA && fA.ip(440, L(208, [kA.toFixed(2)]), 40, 0, bG.nP, bG.iq, -1, !1);
  }
  this.f1 = function () {
    var aGQ;
    0 === nH.result.aGN || 0 === nH.result.aGO.length || 8 === ct.cu ? aR.f.kk(ct.eG) && aGP() : (function (aGQ) {
      7 !== ct.cu && 10 !== ct.cu && 9 !== ct.cu || 0 !== ct.ux && aGQ && fA.ip(600, L(212, [aGQ.toFixed(2)]), 40, 0, bG.bH, bG.iq, -1, !1);
    }(aGQ = function () {
      fA.ip(520, L(209), 40, 0, bG.bH, bG.iq, -1, !1);
      for (var aGO = nH.result.aGO, aM = aGO.length, d4 = d3.d4, a6 = [], aN = 0; aN < aM; aN++) {
        var d1 = aGO[aN];
        a6.push({
          d1: d1,
          eZ: d4[d1]
        });
      }
      a6.sort((aQ, ex) => ex.eZ - aQ.eZ);
      var rB = d3.dI,
        eZ = nH.result.aGX,
        kA = nH.result.aGN,
        bS = "",
        aGQ = 0;
      for (aN = 0; aN < aM; aN++) {
        var aGZ = a6[aN].eZ * kA / (100 * eZ),
          aGa = rB[a6[aN].d1] + ": " + aGZ.toFixed(2) + "   ";
        a6[aN].d1 === ct.eG && (aGQ = aGZ), 2 < aN && 4 !== aM ? 3 === aN && (bS += "(" + L(210, [aM - 3]) + ")") : bS += aGa;
      }
      fA.ip(560, aR.h.aCz(bS), 40, 0, bG.nP, bG.iq, -1, !1), aGQ ? fA.ip(580, L(211, [aGQ.toFixed(2) + " + " + aGW().toFixed(2)]), 40, 0, bG.nP, bG.iq, -1, !1) : aR.f.kk(ct.eG) && aGP();
      return aGQ;
    }()), 2 === ct.uw || 7 <= ct.cu || function (aGQ) {
      var aGO = nH.result.aGO,
        aM = aGO.length,
        rj = d3.rj,
        d4 = d3.d4,
        pU = [];
      loop: for (var aN = 0; aN < aM; aN++) {
        var d1 = aGO[aN],
          rd = aR.h.ag(rj[d1]);
        if (null !== rd) {
          for (var aGb = d4[d1], ex = pU.length - 1; 0 <= ex; ex--) if (rd === pU[ex].name) {
            pU[ex].eZ += aGb, pU[ex].a6.push({
              d1: d1,
              eZ: aGb
            });
            continue loop;
          }
          pU.push({
            name: rd,
            eZ: aGb,
            a6: [{
              d1: d1,
              eZ: aGb
            }]
          });
        }
      }
      if (0 !== pU.length) {
        pU.sort((aQ, ex) => ex.eZ - aQ.eZ);
        var a6 = pU[0].a6,
          aGc = (a6.sort((aQ, ex) => ex.eZ - aQ.eZ), "[" + pU[0].name + "]"),
          aGd = 512 * nH.result.aGN / 26214400,
          aW = (fA.ip(0, L(213, [aGc, aGd.toFixed(4)]), 40, 0, bG.bH, bG.iq, -1, !1), a6.length),
          a2y = pU[0].eZ,
          aGe = 1e4 * aGd;
        for (aN = 0; aN < aW; aN++) if (a6[aN].d1 === ct.eG) {
          fA.ip(600, L(214, [(aGe * a6[aN].eZ / (10 * a2y)).toFixed(2)]), 40, 0, bG.bH, bG.iq, -1, !1), fA.ip(640, L(215, [(.2 * aGQ).toFixed(2), aGc]), 40, 0, bG.bH, bG.iq, -1, !1);
          break;
        }
      }
    }(aGQ));
  }, this.aGU = function () {
    var aGV, a1n;
    ct.kD || (aGV = d3, a1n = ct.eG, 0 === aGV.a5m[a1n]) || aGV.a5l[a1n] < 1 || 2 * aGV.oe[a1n] > 3 * (aGV.a5k[a1n] + aGV.a5l[a1n]) || aGP();
  };
}
function a8P(aGf) {
  var aEj = document.createElement("div");
  function aDD() {
    a5t.a5u() || (aEj.style.backgroundColor = aR.color.fp(bG.su, 50));
  }
  function aDE() {
    aEj.style.backgroundColor = bG.su;
  }
  this.bK = function (jn) {
    aEj.textContent = jn;
  }, this.show = function () {
    document.body.appendChild(aEj);
  }, this.resize = function () {
    var dA = aR.b.tJ(.03, .5);
    aEj.style.width = 2 * dA + "px", aEj.style.height = dA + "px", aEj.style.font = aR.b.dF(1, .75 * dA), aR.b.g1(aEj, 4), aR.b.g1(aEj, 2);
  }, this.mV = function () {
    aEj.onclick = null, aEj.onmouseover = null, aEj.onmouseout = null, aq.removeChild(document.body, aEj), aEj = null;
  }, aEj.style.position = "absolute", aDE(), aEj.style.color = bG.bH, aEj.style.zIndex = "3", aEj.style.right = "0", aEj.style.top = "0", aEj.style.display = "flex", aEj.style.justifyContent = "center", aEj.style.alignItems = "center", aEj.style.userSelect = "none", aEj.style.outline = "none", aEj.onclick = aGf, aEj.onmouseover = aDD, aEj.onmouseout = aDE;
}
function aGg() {
  var a0z = 12e3;
  this.show = function (vQ) {
    return !vQ && !hG.a3J() && (0 === cA.id ? hG.hH.show() : !(dy.dz < a0z) && (vQ = 1 === cA.id ? 72e4 : 108e4, a0z = dy.dz + vQ, 2 === c8.v6) && cA.hg.a9s(Math.floor(vQ)));
  };
}
function kM() {
  var aGh,
    aGj = new Uint16Array(8);
  function aGm(size, player) {
    for (var aN = d3.lD[player].length - 1; size <= aN; aN--) d5.a6F(d3.lD[player][aN], player);
  }
  this.r = function () {
    aGh = 0;
  }, this.og = function (player, oc) {
    return k3.od[1] = d3.lD[player].length, k3.od[0] === ct.cv ? gz.kL.aGk(player) : this.aGl(player, k3.od[0]), (0 !== k3.od[1] || 0 !== d3.lD[player].length) && !(!oc && k3.od[1] === d3.lD[player].length || (k3.od[0] === ct.cv ? d3.a5k[player]++ : d3.a5l[player]++, 0));
  }, this.oj = function (player) {
    aGm(k3.od[1], player), lA.kC(player, k3.k4[0], k3.od[0]), gy.lE(player, !1);
  }, this.aGn = function (player, l5, aM, ki) {
    var aGo = he.iA(12 * d3.dL[player], 1024);
    ki -= ki >= he.iA(d3.dL[player], 2) ? aGo : 0, aGm(aM, player), lA.kC(player, ki, l5), d3.dL[player] -= ki + aGo, gy.lE(player, !1);
  }, this.aGl = function (player, l5) {
    for (var iR, aCW = d5.aCW, aN = d3.aGp[player].length - 1; 0 <= aN; aN--) if (d5.a6G(d3.aGp[player][aN])) for (iR = 3; 0 <= iR; iR--) if (d5.l3(d3.aGp[player][aN] + aCW[iR]) && d5.hp(d3.aGp[player][aN] + aCW[iR]) === l5) {
      d3.lD[player].push(d3.aGp[player][aN]);
      break;
    }
  }, this.aGk = function (player) {
    for (var aCW = d5.aCW, aN = d3.aGp[player].length - 1; 0 <= aN; aN--) if (d5.a6G(d3.aGp[player][aN])) for (var iR = 3; 0 <= iR; iR--) if (d5.ho(d3.aGp[player][aN] + aCW[iR])) {
      d3.lD[player].push(d3.aGp[player][aN]);
      break;
    }
  }, this.aGq = function (player, aGr) {
    var aN,
      aQ,
      iR,
      aGs,
      aM = d3.aGp[player].length,
      ud = 256 <= aM ? 12 : 32 <= aM ? 6 : 1,
      fO = aM - 1 - iW.rU(ud),
      aCW = d5.aCW;
    aGh = 0;
    loop: for (aN = fO; 0 <= aN; aN -= ud) for (iR = 3; 0 <= iR; iR--) if ((aGs = d5.ho(d3.aGp[player][aN] + aCW[iR]) ? ct.cv : d5.hp(d3.aGp[player][aN] + aCW[iR])) === ct.cv || d5.l3(d3.aGp[player][aN] + aCW[iR]) && aGs !== player && (aGr || kl.km(player, aGs))) {
      for (aQ = aGh - 1; 0 <= aQ; aQ--) if (aGj[aQ] === aGs) continue loop;
      if (aGj[aGh] = aGs, 8 <= ++aGh) return !0;
    }
    return 0 < aGh;
  }, this.aGt = function (player, aGr) {
    var aN,
      iR,
      aGs,
      aCW = d5.aCW;
    for (aGh = 0, aN = d3.aGp[player].length - 1; 0 <= aN; aN--) for (iR = 3; 0 <= iR; iR--) if ((aGs = d5.ho(d3.aGp[player][aN] + aCW[iR]) ? ct.cv : d5.hp(d3.aGp[player][aN] + aCW[iR])) === ct.cv || d5.l3(d3.aGp[player][aN] + aCW[iR]) && aGs !== player && (aGr || kl.km(player, aGs))) return aGj[aGh++] = aGs, !0;
    return !1;
  }, this.aGu = function () {
    for (var ex, aN = aGh - 1; 0 <= aN; aN--) if (aGj[aN] === ct.cv) {
      for (aGh--, ex = aN; ex < aGh; ex++) aGj[ex] = aGj[ex + 1];
      return !0;
    }
    return !1;
  }, this.aGv = function (player) {
    for (var ex, aN = aGh - 1; 0 <= aN; aN--) if (lA.lB(player, aGj[aN])) for (aGh--, ex = aN; ex < aGh; ex++) aGj[ex] = aGj[ex + 1];
    return 0 === aGh;
  }, this.aGw = function () {
    for (var aN = aGh - 1; 0 <= aN; aN--) if (aR.f.eH(aGj[aN])) return !0;
    return !1;
  }, this.aGx = function () {
    for (var aN = aGh - 1; 0 <= aN; aN--) aR.f.eH(aGj[aN]) || (aGj[aN] = aGj[--aGh]);
    return 0 < aGh;
  }, this.aGy = function (player) {
    for (var ex, aGz = aGj[0], aH0 = d3.dL[aGz] + lA.aH1(aGz, player), aN = aGh - 1; 1 <= aN; aN--) (ex = d3.dL[aGj[aN]] + lA.aH1(aGj[aN], player)) < aH0 && (aGz = aGj[aN], aH0 = ex);
    return aGz;
  }, this.aH2 = function (player) {
    var dA,
      aH3 = aGj[0];
    if (1 !== aGh) for (var aH4 = he.iA(d3.dS[player] + d3.dM[player], 2), aH5 = he.iA(d3.dT[player] + d3.dN[player], 2), rW = aH6(aH4 - he.iA(d3.dS[aH3] + d3.dM[aH3], 2)) + aH6(aH5 - he.iA(d3.dT[aH3] + d3.dN[aH3], 2)), aN = aGh - 1; 1 <= aN; aN--) (dA = aH6(aH4 - he.iA(d3.dS[aGj[aN]] + d3.dM[aGj[aN]], 2)) + aH6(aH5 - he.iA(d3.dT[aGj[aN]] + d3.dN[aGj[aN]], 2))) < rW && (rW = dA, aH3 = aGj[aN]);
    return aH3;
  }, this.aH7 = function () {
    for (var aH8 = aGj, aH9 = aH8[0], dL = d3.dL, aHA = dL[aH9], aN = aGh - 1; 1 <= aN; aN--) {
      var d1 = aH8[aN],
        ex = dL[d1];
      aHA < ex && (aH9 = d1, aHA = ex);
    }
    return aH9;
  }, this.aHB = function () {
    return aGj[iW.rU(aGh)];
  };
}
function wB() {
  var am,
    aHC,
    rs,
    aHD,
    aHE,
    aHF,
    colors = [0, 0, 0],
    aHG = -1;
  function aHK(aN) {
    var aHL = aHC.eU + aN * (lS.gap + aHF);
    dE.fillStyle = "rgb(" + (0 === aN ? 150 : 2 === aN ? 30 : 0) + "," + (1 === aN ? 130 : 2 === aN ? 30 : 0) + "," + (2 === aN ? 220 : 0) + ")", dE.fillRect(aHD, aHL, colors[aN] * aHE, aHF), dE.strokeStyle = bG.bH, dE.strokeRect(aHD, aHL, aHE, aHF), dE.fillStyle = bG.bH, dE.font = aR.b.dF(0, .32 * aHF), aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 0), dE.fillText(L(0 === aN ? 218 : 1 === aN ? 219 : 220) + aHI(aN), aHD + lS.gap, aHL + .53 * aHF);
  }
  function aHI(aN, aHM) {
    return aHM = aHM || 256, he.hf(Math.floor(aHM * colors[aN]), 0, aHM - 1);
  }
  function sl(dk, dl) {
    return !(dk < aHD || dl < aHC.eU || dk > aHC.eT + aHC.aO || dl > aHC.eU + aHC.dA);
  }
  this.show = function () {
    var aY = b6.buffer.data[121].value;
    colors[0] = (aY >> 12) / 63, colors[1] = (aY >> 6 & 63) / 63, colors[2] = (63 & aY) / 63, am.show(), this.resize();
  }, this.bU = function () {
    b6.bJ.bK(121, (aHI(0, 64) << 12) + (aHI(1, 64) << 6) + aHI(2, 64)), am.bU();
  }, this.resize = function () {
    am.resize(), aHC.resize();
    var bW = d9.o5,
      sE = am.sF(),
      aHJ = (aHC.eU = Math.max(aHC.eU, bW * sE.sI + lS.gap), bW * sE.sH - 2 * lS.gap);
    aHC.dA = Math.min(aHC.dA, aHJ), aHC.aO = 2 * aHC.dA, aHC.eU = bW * sE.sI + .5 * (bW * sE.sH - aHC.dA), aHC.eT = .5 * (d9.aO - aHC.aO), rs = .25 * aHC.aO, aHD = aHC.eT + rs + lS.gap, aHE = aHC.aO - rs - lS.gap, aHF = (aHC.dA - 2 * lS.gap) / 3;
  }, this.dd = function () {
    var uW, kA, ex;
    am.dd(), dE.lineWidth = lS.o2, uW = aHI(0), kA = aHI(1), ex = aHI(2), dE.fillStyle = "rgb(" + uW + "," + kA + "," + ex + ")", dE.fillRect(aHC.eT, aHC.eU, rs, aHC.dA), dE.strokeStyle = bG.bH, dE.strokeRect(aHC.eT, aHC.eU, rs, aHC.dA), dE.fillStyle = uW + kA + ex < 306 && kA < 150 ? bG.bH : bG.r8, aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 1), dE.font = aR.b.dF(0, .1 * aHC.dA), dE.rotate(-Math.PI / 2), dE.fillText(L(217), -aHC.eU - .5 * aHC.dA, aHC.eT + .5 * rs), dE.setTransform(1, 0, 0, 1, 0, 0), aHK(0), aHK(1), aHK(2);
  }, this.mv = function (dk, dl) {
    sl(dk, dl) && (aHG = he.hf(Math.floor((dl - aHC.eU) / (aHF + .75 * lS.gap)), 0, 2), colors[aHG] = he.hf((dk - aHD) / aHE, 0, 1), dy.gK = !0);
  }, this.dh = function (dk) {
    -1 !== aHG && (colors[aHG] = he.hf((dk - aHD) / aHE, 0, 1), dy.gK = !0);
  }, this.uI = function (dk, dl, deltaY) {
    sl(dk, dl) && (dk = he.hf(Math.floor((dl - aHC.eU) / (aHF + .75 * lS.gap)), 0, 2), colors[dk] = he.hf(colors[dk] + (1 - 2 * (0 < deltaY)) / 256, 0, 1), dy.gK = !0);
  }, this.wT = function () {
    0 <= aHG && (aHG = -1, dy.gK = !0);
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(216), [new ap("⬅️ " + L(1), function () {
    aq.b1.zC();
  })], !1), aHC = new aHH([.5, .25], [.5, .5], 1);
}
function aHN() {
  var aHO, aHP, size, l5, ki, aHQ;
  function aHR(player) {
    return player < ct.dP ? aHO * player : aHO * ct.dP + aHP * (player - ct.dP);
  }
  this.r = function () {
    aHO = ct.dP < 16 ? 12 : 8, aHP = 4;
    var aM = aHR(ct.cv);
    size = new Uint8Array(ct.cv), l5 = new Uint16Array(aM), ki = new Uint32Array(aM), aHQ = new Uint8Array(aM);
  }, this.p4 = function (tx, aHS) {
    var aHT = this.aH1(tx, aHS),
      aHS = (this.aHU(tx, aHS, 0), aR.f.l7(tx, aHT));
    hD.l6(tx, aHT - aHS, 12);
  }, this.clear = function (player) {
    size[player] = 0;
  }, this.aHW = function (player, aHS) {
    var aHY,
      aHS = function (player, aHS) {
        var aN,
          aW = aHR(player);
        for (aN = size[player] - 1; 0 <= aN; aN--) if (l5[aW + aN] === aHS) return aN;
        return size[player];
      }(player, aHS);
    aHS !== size[player] && (aHY = ki[aHR(player) + aHS], this.aHZ(player, aHS), this.kC(player, aHY, ct.cv));
  }, this.lB = function (player, aHS) {
    for (var aW = aHR(player), aN = size[player] - 1; 0 <= aN; aN--) if (l5[aW + aN] === aHS) return !0;
    return !1;
  }, this.lC = function (player) {
    return player < ct.dP ? size[player] < aHO : size[player] < aHP;
  }, this.a9G = function (player) {
    return size[player];
  }, this.a9N = function (player, aN) {
    return l5[aHR(player) + aN];
  }, this.a9O = function (player, aN) {
    return ki[aHR(player) + aN];
  }, this.aH1 = function (player, aHS) {
    for (var aW = aHR(player), aN = size[player] - 1; 0 <= aN; aN--) if (l5[aW + aN] === aHS) return ki[aW + aN];
    return 0;
  }, this.a4W = function (player) {
    for (var aW = aHR(player), aY = 0, aN = size[player] - 1; 0 <= aN; aN--) aY += ki[aW + aN];
    return aY;
  }, this.aHU = function (player, aHS, aHY) {
    for (var aW = aHR(player), aN = size[player] - 1; 0 <= aN; aN--) l5[aW + aN] === aHS && (ki[aW + aN] = aHY);
  }, this.aHa = function (player, aN, aHY) {
    ki[aHR(player) + aN] = Math.max(aHY, 0);
  }, this.aHb = function (player, aN) {
    aHQ[aHR(player) + aN] = 0;
  }, this.aHc = function (player, aN) {
    return aHQ[aHR(player) + aN];
  }, this.kC = function (player, aHY, aHS) {
    gz.kN.a6f[player] = gz.kN.a6f[aHS] = 8, aR.f.aHd(aHS) && hD.a48[6 - aR.f.eH(player)]++;
    for (var aW = aHR(player), aN = size[player] - 1; 0 <= aN; aN--) if (l5[aW + aN] === aHS) return ki[aW + aN] += aHY, void (ki[aW + aN] = ki[aW + aN] > ct.dH ? ct.dH : ki[aW + aN]);
    l5[aW + size[player]] = aHS, ki[aW + size[player]] = aHY, aHQ[aW + size[player]] = 1, size[player]++, aHS === ct.eG ? fA.aEv(player, 5) : player < ct.dP && player === ct.eG && di.f9(aHS);
  }, this.aHZ = function (player, af) {
    var aQ, aW;
    if (0 !== size[player]) for (aW = aHR(player), size[player]--, aQ = af; aQ < size[player]; aQ++) l5[aW + aQ] = l5[aW + aQ + 1], ki[aW + aQ] = ki[aW + aQ + 1], aHQ[aW + aQ] = aHQ[aW + aQ + 1];
  }, this.aHe = function (player) {
    for (var aQ, aW, aHf = [], aN = eI.eJ - 1; 0 <= aN; aN--) for (aW = aHR(eI.eK[aN]), aQ = size[eI.eK[aN]] - 1; 0 <= aQ; aQ--) if (l5[aW + aQ] === player) {
      aHf.push(eI.eK[aN]);
      break;
    }
    return aHf;
  };
}
function wK() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 !== ct.data.spawningType || aR.d.aS(ct.data.spawningData) || (ct.data.spawningType = 0), 2 !== ct.data.spawningType && (ct.data.spawningData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.spawningType && aR.d.tT(tN.tU(), ct.data.spawningData, fU.a7h - 1);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(221), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az(),
      fY = (ay.b3(L(51)), [L(130), L(131), L(55)]),
      value = ct.data.spawningType;
    0 === ct.data.gameMode && (fY.splice(1, 1), 0 < value) && (value = 1);
    ay.ta(new tb({
      fY: fY,
      value: value
    }, function (af) {
      tQ(), ct.data.spawningType = af, 0 === ct.data.gameMode && 1 === af && (ct.data.spawningType = 2), 2 !== ct.data.spawningType || ct.data.spawningData || (ct.data.spawningData = new Uint16Array(2 * ct.cv)), aq.fu(24);
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay = new az();
    ay.b3("My Spawn"), ay.b8(new aHh({
      value: ct.data.selectableSpawn
    }, L(222), function (value) {
      ct.data.selectableSpawn = value;
    })), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      aHi = (ay.b3("Seed"), new b5({
        af: -1,
        value: ct.data.spawningSeed
      }, 1, 0, function (b7) {
        var value = Math.abs(Math.floor(b7.target.value)) % 16384;
        b7.target.value = ct.data.spawningSeed = value;
      }));
    ay.b8(aHi), ay.b8(new bL([new ap(L(130), function () {
      aHi.b7.value = ct.data.spawningSeed = Math.floor(16384 * Math.random());
    }).button])), aw.push(ay);
  }(aw), function (aw) {
    var ay;
    2 === ct.data.spawningType && ((ay = new az()).b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.spawningData, 2)), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function aHj() {
  var aHk,
    aHl,
    aHm = -15e3,
    aHn = !1;
  function mv(b7) {
    aI3() || (aHn = !0, aI4(b7, 1), aF.b1.aGI(aF.b1.c7), aI5(Math.floor(d9.o5 * b7.clientX), Math.floor(d9.o5 * b7.clientY)));
  }
  function aHs(b7) {
    aHm = dy.dz, aI4(b7, 1), aF.b1.aGI(aF.b1.c7), 0 < b7.touches.length && (aHk = Math.floor(d9.o5 * b7.touches[0].clientX), aHl = Math.floor(d9.o5 * b7.touches[0].clientY), aI6.aHs(b7) || aI5(aHk, aHl));
  }
  function aI5(eT, eU) {
    aq.mv(eT, eU), 0 === ct.dX ? jE.mv(eT, eU) : hM.aI7(eT, eU) || vK.mv(eT, eU) || hJ.mv(eT, eU) || eu.aI8(eT, eU) || h7.mv(eT, eU) || 0 <= my.mv(eT, eU) || hC.mv(eT, eU) || a5t.aI9(eT, eU) || eu.aIA(eT, eU);
  }
  function dh(b7) {
    aI3() || (aHn = !0, aI4(b7, 1), aIB(Math.floor(d9.o5 * b7.clientX), Math.floor(d9.o5 * b7.clientY)));
  }
  function aHt(b7) {
    aHm = dy.dz, aI4(b7, 1), 0 < b7.touches.length && (aHk = Math.floor(d9.o5 * b7.touches[0].clientX), aHl = Math.floor(d9.o5 * b7.touches[0].clientY), aI6.aHt(b7) || aIB(aHk, aHl));
  }
  function aIB(eT, eU) {
    a5t.a5u() || (a5t.a5v = eT, a5t.a5w = eU), aq.dh(eT, eU), 0 === ct.dX ? jE.dh(eT, eU) : (aIC.aID(eT, eU), vK.dh(eT, eU) || (my.dh(eT, eU), eu.mg() ? eu.dh(eT, eU) : hB.a3Q ? hB.dh(eT) && (dy.gK = !0) : (h2.dh(eT, eU), qA.a3b && qA.dh(eT, eU) && (dy.gK = !0))));
  }
  function aHr(b7) {
    aI3() || (aI4(b7, 1), wT(), 0 === ct.dX ? (jE.click(-1024, -1024), uF.reset()) : (h2.uH(-1024, -1024), my.dh(-1024, -1024), hB.a3h(), qA.a3b = !1));
  }
  function zt(b7) {
    aI3() || (aI4(b7, 1), aIE(Math.floor(d9.o5 * b7.clientX), Math.floor(d9.o5 * b7.clientY), 2 === b7.button), a5t.aHq && (a5t.aHq = !1, b7.preventDefault()));
  }
  function click(b7) {
    aI3() || aI4(b7, 1);
  }
  function aHu(b7) {
    aHm = dy.dz, aI4(b7, 1), b7 && b7.touches && 0 < b7.touches.length && 0 !== ct.dX ? qA.a3b = !1 : aI6.aIF() || (aIE(aHk, aHl, !1), a5t.aHq && (a5t.aHq = !1, b7.preventDefault()));
  }
  function aHv(b7) {
    aHm = dy.dz, aI4(b7, 1), aIE(aHk, aHl, !1), a5t.aHq && (a5t.aHq = !1, b7.preventDefault());
  }
  function aHw(b7) {}
  function aHx(b7) {}
  function aHy(b7) {
    aI3() || aI4(b7, 0);
  }
  function aIE(eT, eU, aIG) {
    wT(), 0 === ct.dX ? jE.click(eT, eU) : (h2.uH(eT, eU), vK.uH(), hB.a3h(), qA.a3b = !1, eu.click(eT, eU, aIG) ? dy.gK = !0 : my.zt(eT, eU));
  }
  function wT() {
    aq.wT();
  }
  function uI(b7) {
    var eT, eU, deltaY;
    aI3() || (aI4(b7, 1), aF.b1.aGI(aF.b1.c7), eT = Math.floor(d9.o5 * b7.clientX), eU = Math.floor(d9.o5 * b7.clientY), deltaY = b7.deltaY, 1 === b7.deltaMode && (deltaY *= 16), aq.uI(eT, eU, deltaY), 0 === ct.dX ? jE.uI(eT, eU, deltaY) : h2.uI(eT, eU, deltaY) || (hB.sl(eT, eU) ? hB.uI(deltaY) && (dy.gK = !0) : qA.uI(eT, eU, deltaY)));
  }
  function aHz(b7) {
    aI4(b7, 0);
  }
  function aI4(b7, id) {
    0 === id && aq.mg() || (id = window.innerWidth / document.documentElement.clientWidth) < .999 || 1.001 < id || 0 !== jE.jF() && b7.preventDefault();
  }
  function aI0(b7) {
    if (__fx.keybindHandler(b7.key)) return;
    aI3() || 0 < d9.aII || (b7 = b7.code) && b7.length && (aFx.bW(b7, 18) ? q9.q4(3) : aFx.bW(b7, 22) ? q9.q4(0) : aFx.bW(b7, 20) ? q9.q4(1) : aFx.bW(b7, 24) ? q9.q4(2) : aFx.bW(b7, 10) ? hB.a3g(31 / 32) : aFx.bW(b7, 8) ? hB.a3g(32 / 31) : aFx.bW(b7, 6) ? hB.a3g(7 / 8) : aFx.bW(b7, 4) ? hB.a3g(8 / 7) : aFx.bW(b7, 14) ? 0 !== ct.dX && qA.uI(Math.floor(d9.aO / 2), Math.floor(d9.dA / 2), -200) : aFx.bW(b7, 16) ? 0 !== ct.dX && qA.uI(Math.floor(d9.aO / 2), Math.floor(d9.dA / 2), 200) : aFx.bW(b7, 0) ? ct.dX && aIC.aIJ(0) : aFx.bW(b7, 2) ? ct.dX && aIC.aIJ(1) : aFx.bW(b7, 30) ? ct.dX && aIC.aIJ(2) : aFx.bW(b7, 26) ? ct.dX && aIC.aIK() : aFx.bW(b7, 28) && ct.dX && aIC.nZ());
  }
  function aI1(b7) {
    if (!aI3() && !(0 < d9.aII || dy.dz < 400)) {
      var code = b7.code;
      if (code && code.length && !("Enter" === code && aq.bV(1) || "Space" === code && aq.bV(0))) return aI.jV ? aI.ne.bV(code) ? void 0 : void ("Escape" === code && a5t.aGM()) : void (8 !== jE.jF() && jE.bV(b7) ? dy.gK = !0 : "Escape" === code ? a5t.aGM() : aFx.bW(code, 18) ? q9.q6(3) : aFx.bW(code, 22) ? q9.q6(0) : aFx.bW(code, 20) ? q9.q6(1) : aFx.bW(code, 24) ? q9.q6(2) : aFx.bW(code, 12) ? hM.zn(!ct.ur) : "Space" === code && ct.dX && (my.mz && my.n0(), ct.mH) && hM.zo(!1));
    }
  }
  function aI2() {
    "hidden" !== document.visibilityState && (dy.gK = !0);
  }
  function aI3() {
    return aHm + 15e3 > dy.dz;
  }
  function resize() {
    d9.aIL();
  }
  this.aHo = 0, this.aHp = "", this.aHq = !1, this.a5v = 0, this.a5w = 0, this.r = function () {
    pv.addEventListener("mousedown", mv, {
      passive: !1
    }), pv.addEventListener("mousemove", dh, {
      passive: !1
    }), pv.addEventListener("mouseup", zt, {
      passive: !1
    }), pv.addEventListener("click", click, {
      passive: !1
    }), pv.addEventListener("mouseleave", aHr, {
      passive: !1
    }), pv.addEventListener("wheel", uI, {
      passive: !1
    }), pv.addEventListener("touchstart", aHs, {
      passive: !1
    }), pv.addEventListener("touchmove", aHt, {
      passive: !1
    }), pv.addEventListener("touchend", aHu, {
      passive: !1
    }), pv.addEventListener("touchcancel", aHv, {
      passive: !1
    }), pv.addEventListener("dragover", aHw), pv.addEventListener("drop", aHx), pv.addEventListener("dblclick", aHy), document.addEventListener("contextmenu", aHz), document.addEventListener("keydown", aI0), document.addEventListener("keyup", aI1), document.addEventListener("visibilitychange", aI2), window.addEventListener("resize", resize);
  }, this.aI9 = function (eT, eU) {
    return !!hM.mv(eT, eU) || !!(h2.mv(eT, eU) || qA.mv(eT, eU) || hB.mv(eT, eU) || fA.mv(eT, eU));
  }, this.aB5 = aI3, this.a5u = function () {
    return !aHn || 0 < aHm;
  }, this.aGM = function () {
    if (!aq.mg()) return 8 === jE.jF() ? ct.ur ? void hM.zn(!1) : vK.mg ? void vK.n0() : void my.n0() : void (7 !== jE.jF() && 6 === jE.jF() && mF.aIM());
    aq.bV(2);
  };
}
function aIN() {
  var mg, aIO, aO, dA, a3W, aIP, aIQ, ti, canvas, tp, aIR;
  function mw() {
    return Math.floor((d9.aO - aO) / 2) < hB.dA + 2 * lS.gap ? d9.dA - dA - 4 * lS.gap - hB.dA : d9.dA - dA - 2 * lS.gap;
  }
  this.r = function () {
    aIR = mg = !1, a3W = .61, aIP = .07, aIQ = .09, tp = ti = dA = 0;
  }, this.resize = function () {
    var j, e3, bW, aIW, aIX, ec;
    mg && (aO = aIS(aO = cA.hg.hh() ? Math.floor(.69 * d9.dC) : Math.floor(.5 * d9.dC), lg(d9.aO - 2 * lS.gap, 10)), aO = aIS(aO, Math.floor(3.57 * lg(d9.dA - 2 * lS.gap, 3))), dA = Math.floor(.28 * aO), (canvas = document.createElement("canvas")).width = aO, canvas.height = dA, j = canvas.getContext("2d", {
      alpha: !0
    }), e3 = Math.floor(1 + dA / 40), j.clearRect(0, 0, aO, dA), j.fillStyle = bG.iq, j.fillRect(e3, e3, aO - 2 * e3, dA - 2 * e3), j.lineJoin = "bevel", j.lineWidth = 2 * e3, j.strokeStyle = bG.bH, j.strokeRect(e3, e3, aO - 2 * e3, dA - 2 * e3), j.imageSmoothingEnabled = !1, bW = dQ.get(aIO), aIW = bW.width, ec = (1 === aIO ? .85 : 21 === aIO ? .666 : .9) * a3W * dA / (aIX = bW.height), j.setTransform(ec, 0, 0, ec, Math.floor((aO - ec * aIW) / 2), Math.floor((dA - ec * aIX) / 2)), j.drawImage(bW, 0, 0), j.setTransform(1, 0, 0, 1, Math.floor(aO - aIQ * dA - aIP * dA - e3), Math.floor(e3 + aIP * dA)), function (j, aM) {
      j.lineWidth = Math.floor(1 + dA / 80), j.strokeStyle = bG.bH, j.beginPath(), j.moveTo(0, 0), j.lineTo(aM, aM), j.moveTo(0, aM), j.lineTo(aM, 0), j.stroke();
    }(j, Math.floor(aIQ * dA)), j.setTransform(1, 0, 0, 1, 0, 0));
  }, this.show = function (aY, aIU, n9, aIV) {
    mg || aIV && aIR || (aIO = n9 ? 21 : aY ? 1 : 2, mg = aIR = !0, this.resize(), eu.bU(), hB.n3(), tp = dy.dz, ti = aIU ? 1 : 0);
  }, this.f1 = function () {
    !mg || 1 <= ti || (ti = 1 < (ti += 5e-4 * (dy.dz - tp)) ? 1 : ti, tp = dy.dz, dy.gK = !0);
  }, this.mv = function (eT, eU) {
    return !(!mg || ti <= 0 || (eT -= Math.floor((d9.aO - aO) / 2), eU -= mw(), eT < 0) || eU < 0 || aO < eT || dA < eU || (aO - dA / 3 < eT && eU < dA / 3 && (mg = !1, dy.gK = !0), 0));
  }, this.dd = function () {
    !mg || ti <= 0 || (dE.globalAlpha = ti, dE.drawImage(canvas, Math.floor((d9.aO - aO) / 2), mw()), dE.globalAlpha = 1);
  };
}
function aIZ() {
  var aIa;
  this.r = function () {
    if (!aIa) {
      aIa = new Array(ey.rC.length);
      for (var aN = 0; aN < aIa.length; aN++) aIa[aN] = h5.b1.a4t(20, ey.rC[aN]);
    }
  }, this.dd = function () {
    var aIc = e5;
    if (!(5 <= aIc)) {
      var y9 = d9.aO,
        yA = d9.dA,
        e3 = e4 / aIc,
        e6 = e7 / aIc,
        e8 = (y9 + e4) / aIc,
        e9 = (yA + e7) / aIc,
        s9 = -20 * aIc,
        aId = .5 * s9,
        yB = fU.fV << 4,
        aM = h0.b1.ka,
        kY = h0.b1.kY,
        kw = h0.b1.kw,
        rE = ey.rE,
        es = aIa,
        e2 = dE;
      3 < aIc && (e2.globalAlpha = .5 * (5 - aIc));
      for (var aN = 0; aN < aM; aN++) {
        var hy = kY[aN],
          eT = y9 * (hy % yB / 16 - e3) / (e8 - e3) + aId,
          hy = yA * (Math.floor(hy / yB) / 16 - e6) / (e9 - e6) + aId;
        y9 < eT || yA < hy || eT < s9 || hy < s9 || (e2.setTransform(aIc, 0, 0, aIc, eT, hy), eT = es[rE[kw[aN] >> 3]], e2.drawImage(eT, 0, 0));
      }
      e2.globalAlpha = 1, e2.setTransform(aIc, 0, 0, aIc, 0, 0);
    }
  };
}
function aHh(aIg, aD6, aIh) {
  function click() {
    var value = 1 - aIg.value;
    this.textContent = (value ? "🟩 " : "⬜ ") + aD6, void 0 !== aIg.af ? b6.bJ.bK(aIg.af, value) : aIg.value = value, aIh && aIh(value);
  }
  var b7;
  aD6 = aD6 || L(223), this.b7 = document.createElement("p"), (b7 = this.b7).textContent = (aIg.value ? "🟩 " : "⬜ ") + aD6, b7.style.margin = "0", b7.style.marginBottom = "0.5em", b7.style.cursor = "pointer", b7.addEventListener("click", click);
}
function aIi() {
  this.pD = new aIj();
}
function aIk() {
  this.f1 = function (player) {
    return !!h0.op.oq(player) && !(h0.b1.a4P[player] >= Math.max(3 * gz.performance.a52, tV.pa[tV.ki[player]]) || !aR.f.oa(player, tV.aIl[tV.ki[player]], 32, 0)) && (gG.qn() ? function (player) {
      var aIo = h0.nd.qq(),
        aM = aIo.length;
      if (0 === aM) return !1;
      aIo = aIo[iW.rU(aM)], aM = h0.b1.pj[aIo];
      if (h0.kc.pd(player, aM)) return !1;
      return !!function (player, aDK) {
        var aDK = dr.iM(h0.b1.kY[aDK]),
          hr = dr.ht(aDK),
          aDK = dr.hu(aDK),
          e3 = d3.dM[player],
          e6 = d3.dN[player],
          e8 = d3.dS[player],
          player = d3.dT[player],
          e8 = Math.max(hr - e8, e3 - hr),
          e3 = Math.max(aDK - player, e6 - aDK);
        return e8 < 100 && e3 < 100;
      }(player, aIo) && !!h0.p0.p1(player, aM, 1) && (aR.f.oh(player), h0.b1.ox(player), !0);
    }(player) : !!(gz.kR.f1(player) || gz.kG.f1(player) || gz.kI.f1(player)) && (function (player) {
      k3.oo[1] = 4, aR.f.oh(player), h0.b1.ox(player);
    }(player), !0));
  };
}
function kF() {
  var aIq = 0,
    aIr = 0,
    aIs = 300,
    aIt = 300,
    aIu = 0;
  this.j1 = 0, this.buffer = new Uint32Array(512), this.r = function () {
    aIr = aIq = 0, this.j1 = 0, aIu = 0;
  }, this.f1 = function () {
    if (function () {
      var aM = gz.j0.j1;
      if (0 === aM) return 1;
      var buffer = gz.j0.buffer;
      if (dy.f2() % 35 == 6) {
        for (var aN = aM - 1; 0 <= aN; aN--) d5.ho(buffer[aN] << 2) || (aM--, buffer[aN] = buffer[aM]);
        gz.j0.j1 = aM;
      }
      return aM < buffer.length;
    }()) if (aIs <= aIq) {
      var aIy = gz.j0.j1;
      if (aIy) {
        if (dy.f2() % 350 != 1) return;
        if (aIu !== aIy) return void (aIu = aIy);
        if (!aR.f.eH(iw[0])) return;
      } else if (dy.f2() % 12 != 8) return;
      aR.f.aIz() || gz.j0.r();
    } else {
      var aN,
        aO = fU.fV,
        aJ0 = aO - 2,
        aIy = aJ0 * (fU.iD - 2),
        aJ1 = aIs,
        buffer = gz.j0.buffer,
        aW = gz.j0.j1,
        aJ2 = buffer.length,
        s9 = Math.min(aIr + aJ1 * ((1 + 19 * gz.performance.a52) * aIt), aIy);
      for (aN = aIr; aN < s9; aN += aJ1) {
        var fK = 4 * (aN % aJ0 + (he.iA(aN, aJ0) + 1) * aO + 1);
        if (d5.ho(fK) && (buffer[aW] = fK >> 2, ++aW === aJ2)) {
          aN += aJ1;
          break;
        }
      }
      (aIr = aN) >= aIy && (aIr = ++aIq), gz.j0.j1 = aW;
    }
  };
}
function aJ3() {
  var th = new Uint8Array(ct.cv),
    aJ4 = new Uint16Array(ct.cv),
    aJ5 = new Uint16Array(ct.cv),
    aJ6 = new Uint8Array(ct.cv),
    aJ7 = (this.ki = new Uint8Array(ct.cv), new Uint16Array(ct.cv)),
    aJ8 = new Uint16Array(ct.cv);
  function aJI(aN) {
    th[aN] = 1 + he.iA(aJ7[aN] * iW.random(), 10 * iW.value(100));
  }
  this.tW = null, this.aJ9 = [97, 94, 70, 40, 20, 0, 100], this.aIl = [500, 450, 400, 300, 80, 50, 100], this.aJA = [0, 0, 5, 25, 50, 100, 0], this.aJB = [60, 74, 112, 200, 256, 512, 512], this.pa = [1, 2, 3, 4, 6, 8, 1], this.aJC = [500, 450, 400, 300, 80, 50, 100], this.aJD = [100, 150, 250, 400, 600, 1e3, 100], this.mj = function () {
    this.tW = [L(224), L(225), L(226), L(227), L(228), L(229), "H Bot"];
  }, this.r = function () {
    th.fill(0), aJ4.fill(0), aJ5.fill(0), aJ6.fill(0), this.ki.fill(0), aJ7.fill(0), aJ8.fill(0);
    var aJE = ct.dP;
    if (9 === ct.cu) this.aJF();else if (ct.kD) {
      if (3 === ct.data.botDifficultyType) for (aN = ct.qS - 1; 0 <= aN; aN--) {
        var dZ = aN + aJE;
        this.ki[dZ] = ct.data.botDifficultyData[dZ];
      } else if (2 === ct.data.botDifficultyType) for (aN = ct.qS - 1; 0 <= aN; aN--) this.ki[dZ = aN + aJE] = ct.data.botDifficultyTeam[ey.iv[ey.iy[dZ]]];else if (1 === ct.data.botDifficultyType) {
        var aJH = this.tW.length;
        for (aN = ct.qS - 1; 0 <= aN; aN--) this.ki[aN + aJE] = aN % aJH;
      } else for (aJH = ct.data.botDifficultyValue, aN = ct.qS - 1; 0 <= aN; aN--) this.ki[aN + aJE] = aJH;
    } else for (var aJG = 8 === ct.cu ? 1 : 0, aN = ct.qS - 1; 0 <= aN; aN--) this.ki[aN + aJE] = aJG;
    for (aN = 0; aN < aJE; aN++) this.ki[aN] = 6;
    var aM = ct.cv;
    for (aN = 0; aN < aM; aN++) this.ki[aN] <= 2 ? (aJ6[aN] = 5, aJ7[aN] = aJ8[aN] = 1040, 0 === this.ki[aN] ? (aJ4[aN] = 980, aJ5[aN] = 980) : 1 === this.ki[aN] ? (aJ4[aN] = 980, aJ5[aN] = 920, aJ7[aN] = aJ8[aN] = 1100) : (aJ4[aN] = 825, aJ5[aN] = 750)) : this.ki[aN] <= 4 ? (aJ6[aN] = 1 + iW.rU(20), 3 === this.ki[aN] ? (aJ4[aN] = aJ5[aN] = 500, aJ7[aN] = aJ8[aN] = 1e3) : (aJ8[aN] = 250 + iW.rU(1501), aJ7[aN] = 500 + iW.rU(501), aJ4[aN] = 300 + iW.rU(201), aJ5[aN] = 100 + iW.rU(201))) : this.ki[aN] <= 5 ? (aJ7[aN] = 1e3, aJ8[aN] = 1e3, aJ6[aN] = 35 + iW.rU(16), aJ4[aN] = 300 + iW.rU(201), aJ5[aN] = 50 + iW.rU(101)) : (aJ7[aN] = aJ8[aN] = 800, aJ6[aN] = 5, aJ4[aN] = 10, aJ5[aN] = 250), aJI(aN);
  }, this.aJF = function () {
    for (var fK = h3.aJJ, aJE = ct.dP, aN = fK - 1; 0 <= aN; aN--) this.ki[aN + aJE] = 0;
    for (var ex = 0; ex < 6; ex++) {
      for (aN = fK + h3.ro[ex] - 1; fK <= aN; aN--) this.ki[aN + aJE] = ex;
      fK += h3.ro[ex];
    }
  }, this.aJK = function (d1, value) {
    th[d1] = Math.min(value, th[d1]);
  }, this.f1 = function (d1) {
    0 == --th[d1] && !function (d1) {
      (function (d1) {
        aJ7[d1] !== aJ8[d1] && (aJ7[d1] += aJ7[d1] < aJ8[d1] ? 3 : -3);
        aJ4[d1] !== aJ5[d1] && (aJ4[d1] += aJ4[d1] < aJ5[d1] ? aJ6[d1] : -aJ6[d1], aJ4[d1] = (Math.abs(aJ4[d1] - aJ5[d1]) <= aJ6[d1] ? aJ5 : aJ4)[d1]);
        th[d1] = he.iA(aJ7[d1], 10);
      })(d1), gz.kN.aJN(d1, he.iA(aJ4[d1] * d3.dL[d1], 1e3));
    }(d1);
  }, this.a5C = function (d1, aL) {
    aJ7[d1] = aJ8[d1] = aL;
  };
}
function wM() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 !== ct.data.iIncomeType && (ct.data.iIncomeData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.iIncomeType && aR.d.tT(tN.tU(), ct.data.iIncomeData, 255);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(138), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(136), L(52), L(55)],
      value: ct.data.iIncomeType
    }, function (af) {
      tQ(), 2 !== af || ct.data.iIncomeData || (ct.data.iIncomeData = new Uint8Array(ct.cv), ct.data.iIncomeData.fill(32)), ct.data.iIncomeType = af, aq.fu(27);
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay;
    1 === ct.data.iIncomeType && ((ay = new az()).b3("Value"), ay.b8(new b5({
      af: -1,
      value: ct.data.iIncomeValue
    }, 1, 0, function (b7) {
      var value = he.hf(Math.floor(b7.target.value), 0, 255);
      b7.target.value = ct.data.iIncomeValue = value;
    })), aw.push(ay));
  }(aw), function (aw) {
    var ay;
    2 === ct.data.iIncomeType && ((ay = new az()).b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.iIncomeData, 4)), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function a8O(aGf) {
  var a6N = document.createElement("div"),
    aJO = document.createElement("div"),
    aJP = [];
  function aDD() {
    a5t.a5u() || (this.style.backgroundColor = aR.color.fp(bG.su, 50));
  }
  function aDE() {
    this.style.backgroundColor = bG.su;
  }
  this.bK = function (aJQ, jn) {
    aJP[2].textContent = aJQ + 1 + " / " + jn;
  }, this.show = function (c3) {
    c3 = aI.nd.a8F(c3, aI.nd.a8G(c3)), aJO.appendChild(aI.db.transform(c3)), document.body.appendChild(a6N);
  }, this.resize = function () {
    var dA = aR.b.tJ(.03, .5);
    a6N.style.width = 10 * dA + "px", a6N.style.font = aR.b.dF(1, .75 * dA), aR.b.g1(a6N, 4), aJO.style.top = dA + "px", aJO.style.font = aR.b.dF(0, .55 * dA), aR.b.g1(aJO, 2), a6N.style.height = dA + aJO.offsetHeight + "px";
    for (var aN = 0; aN < 3; aN++) aR.b.g1(aJP[aN], 6), aJP[[0, 1, 3][aN]].style.width = 2 * dA + "px";
    for (aN = 0; aN < 4; aN++) aJP[aN].style.height = dA + "px", aR.b.g1(aJP[aN], 2);
    aJP[2].style.width = 4 * dA + "px", aJP[1].style.left = 2 * dA + "px", aJP[2].style.left = 4 * dA + "px", aJP[3].style.left = 8 * dA + "px";
  }, this.mV = function () {
    for (var aN = 0; aN < 4; aN++) aJP[aN].onclick = null, aJP[aN].onmouseover = null, aJP[aN].onmouseout = null;
    aq.removeChild(document.body, a6N), a6N = aJO = aJP = null;
  }, a6N.style.position = "absolute", a6N.style.color = bG.bH, a6N.style.zIndex = "3", a6N.style.right = "0", a6N.style.top = "0", aJO.style.position = "absolute", aJO.style.height = "auto", aJO.style.color = bG.bH, aJO.style.backgroundColor = bG.su, aJO.style.left = "0", aJO.style.width = "100%", aJO.style.overflowWrap = "break-word", a6N.appendChild(aJO);
  for (var aN = 0; aN < 4; aN++) aJP[aN] = document.createElement("div"), aJP[aN].style.position = "absolute", aJP[aN].style.backgroundColor = bG.su, aJP[aN].style.color = bG.bH, aJP[aN].style.top = "0", aJP[aN].style.display = "flex", aJP[aN].style.justifyContent = "center", aJP[aN].style.alignItems = "center", aJP[aN].style.userSelect = "none", aJP[aN].style.outline = "none", aJP[aN].style.font = "inherit", 2 !== (aJP[aN].a8N = aN) && (aJP[aN].onclick = aGf, aJP[aN].onmouseover = aDD, aJP[aN].onmouseout = aDE), a6N.appendChild(aJP[aN]);
  aJP[0].textContent = "◀", aJP[1].textContent = "▶", aJP[3].textContent = "✖";
}
function aJR(a6M, aD8, aJS) {
  this.nx = document.createElement("div"), this.nw = a6M;
  var aJT = 0;
  this.resize = function (fX, aJU) {
    var aM = a6M.length;
    if (!aJS) for (var aN = 1; aN < aM; aN++) aR.b.g1(a6M[aN].button, 4);
    for (var aJV = 0, aN = 0; aN < aM; aN++) aJV += a6M[aN].button.offsetWidth;
    if (fX && (aJT = fX.offsetWidth), aJU && aJV < aJT) for (aN = 0; aN < aM; aN++) a6M[aN].button.style.width = (100 * a6M[aN].button.offsetWidth / aJV).toFixed(2) + "%";else for (aN = 0; aN < aM; aN++) a6M[aN].button.style.width = "auto";
    aJU || this.resize(fX, 1);
  };
  var a3d = this;
  a3d.nx.style.height = a3d.nx.style.maxHeight = "100%";
  for (var aN = 0; aN < a6M.length; aN++) a6M[aN].bF(aD8), a6M[aN].button.style.height = "100%", a6M[aN].button.style.padding = "0.0em 0.9em", a6M[aN].button.style.whiteSpace = "pre", a3d.nx.appendChild(a6M[aN].button);
}
function aJW() {
  this.aJX = !1, this.aJY = !1, this.aJZ = !1, this.aJa = [0, 0, 0, 0], this.render = function () {
    var e3, e6, e8, e9;
    this.aJZ = this.aJZ || this.aJY, (this.aJY || this.aJX && this.aJZ) && (e3 = aA4.aJb[0], e6 = aA4.aJb[1], e8 = aA4.aJb[2], e9 = aA4.aJb[3], e3 = e3 < this.aJa[0] ? this.aJa[0] : e3, e6 = e6 < this.aJa[1] ? this.aJa[1] : e6, e8 = e8 > this.aJa[2] ? this.aJa[2] : e8, e9 = e9 > this.aJa[3] ? this.aJa[3] : e9, this.aJY = !1, this.aJX = !1, e3 === this.aJa[0] && e6 === this.aJa[1] && e8 === this.aJa[2] && e9 === this.aJa[3] ? this.gW() : e3 <= e8 && e6 <= e9 && vL.putImageData(vM, 0, 0, e3, e6, e8 - e3 + 1, e9 - e6 + 1));
  }, this.gW = function () {
    this.aJZ && this.aJa[2] >= this.aJa[0] && this.aJa[3] >= this.aJa[1] && vL.putImageData(vM, 0, 0, this.aJa[0], this.aJa[1], this.aJa[2] - this.aJa[0] + 1, this.aJa[3] - this.aJa[1] + 1), this.aJZ = !1;
  }, this.zq = function () {
    this.aJa[2] >= this.aJa[0] && this.aJa[3] >= this.aJa[1] && vL.putImageData(vM, 0, 0, this.aJa[0], this.aJa[1], this.aJa[2] - this.aJa[0] + 1, this.aJa[3] - this.aJa[1] + 1), this.aJZ = !1;
  }, this.r = function () {
    var eT, eU;
    this.aJX = !1, this.aJY = !1, this.aJZ = !1, this.aJa[0] = fU.fV, this.aJa[1] = fU.iD, this.aJa[2] = this.aJa[3] = 0;
    loop: for (eT = 1; eT < fU.fV - 1; eT++) for (eU = fU.iD - 2; 1 < eU; eU--) if (1 === a5E[d5.a6D(eT, eU) + 2]) {
      this.aJa[0] = eT;
      break loop;
    }
    loop: for (eU = 1; eU < fU.iD - 1; eU++) for (eT = fU.fV - 2; 1 < eT; eT--) if (1 === a5E[d5.a6D(eT, eU) + 2]) {
      this.aJa[1] = eU;
      break loop;
    }
    loop: for (eT = fU.fV - 2; 0 < eT; eT--) for (eU = fU.iD - 2; 1 < eU; eU--) if (1 === a5E[d5.a6D(eT, eU) + 2]) {
      this.aJa[2] = eT;
      break loop;
    }
    loop: for (eU = fU.iD - 2; 0 < eU; eU--) for (eT = fU.fV - 2; 1 < eT; eT--) if (1 === a5E[d5.a6D(eT, eU) + 2]) {
      this.aJa[3] = eU;
      break loop;
    }
  };
}
function aJc() {
  aJd() ? (aJe(), aJf !== ct.cv && aJg()) : aJh();
}
function aJg() {
  kl.aJi(), kl.aJj(d3.aGp[aJf]), kl.aJj(d3.kn[aJf]), fU.aEL(fU.jJ) && kl.aJj(d3.aJk[aJf]), kl.aJl(d3.lD[aJf]), kl.aJm(d3.kn[aJf]), kl.aJm(d3.aJk[aJf]), kl.aJn(), kl.aJo();
}
function aJe() {
  aJp = !0, lA.aHa(aJq, aJr, aJs), lA.aHb(aJq, aJr), d3.d4[aJq] += aJt, kl.aJu(), aJv();
}
function aJd() {
  return (aJf === ct.cv ? aJw : aJx)();
}
function aJx() {
  var aJy = aJt * ct.uo,
    aJz = aK0(),
    aK1 = aK2(),
    aJz = aJy + 2 * aJz + aK1,
    aK4 = aK5 * aJt;
  return aJz < aK4 ? (aJs -= aJz, hD.l6(aJq, aJz, 13), aK6(aJz - aJy, aK1), !0) : aK7 && 0 === aK1 ? (aJs -= aK4, aK4 += aR.f.aK8(aJq, aJz - aK4 + 1), hD.l6(aJq, aK4, 13), aK6(aK4 - aJy, 0), !0) : (aJs -= aK4, hD.l6(aJq, aK4, 13), aK6(aK4 - aJy, aK1), !1);
}
function aK6(aK4, aK1) {
  if (0 < aK1) {
    if (aK4 <= aK1) return hD.l6(aJf, aK4, 13), void lA.aHU(aJf, aJq, aK1 - aK4);
    lA.aHU(aJf, aJq, 0), aK4 -= aK1;
  }
  aK4 = he.iA(aK4, 2), aK4 = Math.min(d3.dL[aJf], aK4), hD.l6(aJf, aK4, 13), d3.dL[aJf] -= aK4;
}
function aK2() {
  return lA.aH1(aJf, aJq);
}
function aK0() {
  return he.iA(aJt * d3.dL[aJf], 1 + he.iA(10 * d3.d4[aJf], 16));
}
function aJw() {
  var aK9 = aJt * ct.uo;
  return aJs -= aK9, hD.l6(aJq, aK9, 13), !0;
}
function aJv() {
  for (var aN = aJt - 1; 0 <= aN; aN--) d3.lD[aJq].push(aKA[aN]), d3.aGp[aJq].push(aKA[aN]), d5.a6H(aKA[aN], aJq);
}
function aKB() {
  this.oJ = null, this.oM = null, this.oO = null, this.oQ = null, this.oS = null, this.oR = null, this.vR = "";
  var aKC = 0;
  this.r = function () {
    this.oJ = [], this.oM = [], this.oO = [], this.oQ = [], this.oS = [0], this.oR = [0], aKC = 0, this.vR = "";
  }, this.oX = function (id, oL, oN, oP) {
    ct.mH || 2 === ct.dX || (0 === this.oS[aKC] && (this.oR[aKC] ? (this.oS.push(1), this.oR.push(0), aKC++) : this.oS[aKC] = 1), this.oJ.push(id), this.oM.push(oL), this.oO.push(void 0 === oN ? 0 : oN), this.oQ.push(void 0 === oP ? 0 : oP), this.oR[aKC]++);
  }, this.f1 = function () {
    0 === this.oS[aKC] ? this.oR[aKC]++ : (this.oS.push(0), this.oR.push(0), aKC++);
  };
}
function w5() {
  var am, an, aw, ay;
  function aKD() {
    ad.aKE !== b6.buffer.data[12].value ? (ad.r(), aq.fu(8, 1, new fw(30))) : aq.fu(1);
  }
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(72), [new ap("⬅️ " + L(1), aKD), new ap(L(230), function () {
    aq.mU(), b6.bJ.a9l(), aq.fu(2);
  })]), aw = [], (ay = new az()).b3(L(231)), ay.bR(L(232)), aw.push(ay), function (aw) {
    var ay = new az(),
      a6 = (ay.b3(L(259)), ad.data.aKJ());
    ay.ta(new tb({
      fY: a6,
      value: ad.data.aKK(a6)
    }, function (af) {
      return b6.bJ.bK(12, a6[af].split(":")[0]), !0;
    })), aw.push(ay);
  }(aw), function (aw) {
    var ay = new az(),
      aKH = (ay.b3(L(257)), []);
    ay.b8(new bL([new ap(L(258), function (b7) {
      aFx.aG1();
      for (var aN = 0; aN < aKH.length; aN++) aKH[aN].b7.value = aFx.aFv[aN];
      return aR.b.bN(b7), !0;
    }).button]));
    for (var aN = 0; aN < aFx.aFt.length; aN++) {
      ay.bR(aFx.aFt[aN]);
      for (var aQ = 0; aQ < 2; aQ++) {
        var af = 2 * aN + aQ,
          a77 = new b5({
            value: aFx.aFv[af],
            af: -1
          });
        a77.b7.aKI = af, aKH.push(a77), a77.b7.addEventListener("keydown", function (b7) {
          b7.preventDefault();
          var code = b7.code;
          b7.target.value = code, aFx.aFy(b7.target.aKI, code);
        }), aQ && (a77.b7.style.marginLeft = "4%"), a77.b7.style.width = "48%", ay.b8(a77);
      }
    }
    aw.push(ay);
  }(aw), (ay = new az()).b3(L(233)), b6.buffer.data[1].fY = [L(234), L(235), L(236), L(237)], ay.ta(new tb(b6.buffer.data[1])), aw.push(ay), (ay = new az()).b3(L(238)), b6.buffer.data[9].fY = [L(235), L(239), L(240)], ay.ta(new tb(b6.buffer.data[9])), aw.push(ay), (ay = new az()).b3(L(241)), b6.buffer.data[11].fY = [L(242), L(226), L(243)], ay.ta(new tb(b6.buffer.data[11])), aw.push(ay), (ay = new az()).b3(L(244)), ay.b8(new aHh(b6.buffer.data[2])), aw.push(ay), (ay = new az()).b3(L(245)), ay.b8(new aHh(b6.buffer.data[7])), aw.push(ay), (ay = new az()).b3(L(246)), ay.b8(new aHh(b6.buffer.data[8])), aw.push(ay), (ay = new az()).b3(L(247)), ay.b8(new b5(b6.buffer.data[5])), aw.push(ay), (ay = new az()).b3(L(248)), ay.b8(new aHh(b6.buffer.data[13], L(249))), ay.b8(new aHh(b6.buffer.data[14], L(250))), aw.push(ay), (ay = new az()).b3(L(251)), ay.ta(new tb({
    fY: [L(252), L(253), L(254)],
    value: mF.aGE
  }, function (aN) {
    mF.aGE = aN;
  })), aw.push(ay), (ay = new az()).b3(L(255)), ay.b8(new aHh(b6.buffer.data[15])), ay.bR(L(256)), ay.b8(new b5(b6.buffer.data[16], 1, 0, function (b7) {
    b7.target.value = he.hf(Math.floor(b7.target.value), 0, 16);
  })), aw.push(ay), an = new at(am.au, aw);
}
function wC() {
  var am,
    an,
    aw,
    aKL = -1;
  this.show = function () {
    am.show(), this.resize(), aKL = b6.buffer.data[125].value;
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(260), [new ap("⬅️ " + L(1), function () {
    aKL !== b6.buffer.data[125].value ? aq.b1.z7() : aq.wS(13);
  })]), an = new at(am.au, ((aw = []).push(function () {
    var ay = new az(),
      aE4 = (ay.b3(L(261)), ay.bR(L(262)), new ap(L(187), function () {
        b6.bJ.bK(130, 0), aq.b1.z7();
      }, 0, 0, 1)),
      a77 = new b5(b6.buffer.data[126], 0, function () {
        aE4.button.click();
      });
    return ay.b8(a77), a77.b7.placeholder = "a,b,c", a77.b7.style.marginTop = "0.5em", ay.b8(new bL([aE4.button])), ay;
  }()), aw.push(function () {
    var ay = new az(),
      aE4 = new ap(L(187), function () {
        b6.bJ.bK(130, 1), aq.b1.z7();
      }, 0, 0, 1),
      aE5 = new b5(b6.buffer.data[129], 1, function () {
        aE5.b7.focus();
      }),
      aE6 = new b5(b6.buffer.data[128], 1, function () {
        aE4.button.click();
      });
    return ay.b3(L(185)), ay.b8(aE6), aE6.b7.style.marginBottom = "0.5em", ay.b3(L(186)), ay.b8(aE5), ay.b8(new bL([aE4.button])), ay;
  }()), aw.push(function () {
    var ay = new az();
    return ay.b3(L(263)), b6.buffer.data[125].fY = ["M1", "M5", "H1", "H4", "D1", "W1", "MN"], ay.ta(new tb(b6.buffer.data[125])), ay;
  }()), aw.push(function () {
    var ay = new az();
    return ay.b3(L(264)), ay.b8(new aHh(b6.buffer.data[127], L(265))), ay;
  }()), aw));
}
function w7() {
  var aKP,
    aKQ,
    aHC,
    a77,
    aKR,
    aEn = 0;
  this.vu = new sm(), aHC = new aHH([.45, .27], [.5, .5], 2 / 3), aKQ = [new ap("⚔️<br>" + L(266), function () {
    __fx.isCustomLobbyVersion ? alert("This version is for use with custom lobbies only. For normal multiplayer, use the version at https://fxclient.github.io/FXclient/") : aKS(0);
  }, __fx.isCustomLobbyVersion ? "rgba(50, 50, 50, 0.6)" : bG.aFO), new ap("🗡️<br>" + L(124), function () {
    aKS(1);
  }, bG.sy), new ap("🔑<br>" + L(267), function () {
    aKS(2);
  }, bG.aFk), new ap("☰<br>" + L(268), function () {
    aKS(3);
  }, bG.aFF), new ap("", function () {
    aq.fu(12);
  }, bG.su, !1), new ap("FX Client settings", function () {
    __fx.WindowManager.openWindow("settings");
  }, "rgba(0, 0, 20, 0.5)"), new ap("Join/Create custom lobby", function () {
    __fx.customLobby.showJoinPrompt();
  }, "rgba(20, 9, 77, 0.5)")], a77 = new b5(b6.buffer.data[122]);
  for (var aN = 0; aN < aKQ.length; aN++) aKQ[aN].button.style.position = "absolute";
  function aKS(af) {
    cA.hg.setState(10), dQ.t7() || dQ.vd(), 0 === af ? aq.b1.vW(1) : 1 === af ? (gF.aKT.jS(b6.buffer.data[156].value, 1) || ct.v0.r3(), aq.fu(19)) : 2 === af ? 0 !== cA.id || b6.buffer.data[140].value ? aq.fu(8, aq.fv, new fw(16)) : aq.b1.zH(aq.fv, 16) : 3 === af && aq.fu(1);
  }
  a77.b7.style.position = "absolute", a77.b7.style.textAlign = "center", a77.b7.placeholder = L(269), this.show = function () {
    jE.setState(0), cA.hg.setState(12), this.vu.show(), aKQ[4].bF(aR.color.uU(b6.buffer.data[121].value)), this.resize(), document.body.appendChild(a77.b7);
    for (var aN = 0; aN < aKQ.length; aN++) document.body.appendChild(aKQ[aN].button);
    1 !== cA.id || cA.cB < 5 || (aKR && dy.dz > aKR + 144e5 ? cA.a0n.setState(14) : aKR = dy.dz);
  }, this.bU = function () {
    this.vu.bU(), aq.removeChild(document.body, a77.b7);
    for (var aN = 0; aN < aKQ.length; aN++) aq.removeChild(document.body, aKQ[aN].button);
  }, this.resize = function () {
    this.vu.resize(), this.vu.resize(), aHC.resize();
    var gap = .5 * lS.gap,
      aCD = 10 / 99 * .84 * aHC.aO,
      aKW = .16 * aHC.dA,
      aDb = .19 * aHC.aO,
      eT = aHC.eT + aDb,
      aCD = aHC.eU + aCD + 3 * gap,
      aO = .5 * (aHC.aO - gap) - aDb,
      aDb = aHC.aO - 2 * aDb - aKW - gap,
      aDb = (aR.b.t5(a77.b7, eT, aCD, aDb, aKW), aR.b.t5(aKQ[4].button, eT + aDb + gap, aCD, aKW, aKW), aEn = aCD, .5 * (aHC.eU + aHC.dA - (aCD += aKW + gap) - gap));
    aR.b.t5(aKQ[0].button, eT, aCD, aO, aDb), aR.b.t5(aKQ[1].button, eT + aO + gap, aCD, aO, aDb), aR.b.t5(aKQ[2].button, eT, aCD + aDb + gap, aO, aDb), aR.b.t5(aKQ[3].button, eT + aO + gap, aCD + aDb + gap, aO, aDb);
    aR.b.t5(aKQ[5].button, eT, aCD + aDb * 2 + gap * 2, aO * 2 + gap, aDb / 3);
    aR.b.t5(aKQ[6].button, eT, aCD + aDb * 2.33 + gap * 3, aO * 2 + gap, aDb / 3);
    for (var aN = 0; aN < aKQ.length; aN++) aKQ[aN].button.style.font = aR.b.dF(0, aR.b.aDp(.065 * aHC.dA)), aR.b.g1(aKQ[aN].button, 5);
    a77.b7.style.font = aR.b.dF(0, aR.b.aDp(.08 * aHC.dA)), aR.b.g1(a77.b7, 5);
  }, this.dd = function () {
    if (jE.uM(), uF.dd(), aM = Math.floor((cA.hg.hh() ? .018 : .0137) * d9.dC), dE.font = aR.b.dF(0, Math.max(5, aM)), aR.b.textBaseline(dE, 0), aR.b.textAlign(dE, 2), dE.fillStyle = bG.bH, dE.fillText(c8.cB, d9.aO, 0), text = "Win count: " + __fx.wins.count, textLength = dE.measureText(text).width, aM = Math.max(5, aM), dE.textAlign = "left", dE.textBaseline = "middle", dE.fillText(text, dE.canvas.width - textLength - aM / 2, 2 * aM), tA.dd(aEn), uE.dd(), dQ.t7()) {
      dE.imageSmoothingEnabled = !1;
      var text = dQ.uR("territorial.io"),
        textLength = .84 * aHC.aO / text.width;
      dE.setTransform(textLength, 0, 0, textLength, aHC.eT + .08 * aHC.aO, aHC.eU), aKP = aKP || aR.l.vs(text, aR.l.aKa, [0, 0, 0]);
      for (var eT = -1; eT <= 1; eT += 2) for (var eU = -1; eU <= 1; eU += 2) dE.drawImage(aKP, eT, eU);
      dE.drawImage(text, 0, 0), dE.imageSmoothingEnabled = !0;
      var aM = dQ.uR("logo"),
        aKb = .6666 * textLength * text.height / aM.height,
        e8 = .5 * d9.aO,
        e9 = aHC.eU + .5 * textLength * text.height - .5 * aKb * aM.height;
      dE.setTransform(aKb, 0, 0, aKb, e8 - .6 * textLength * text.width, e9), dE.drawImage(aM, 0, 0), dE.setTransform(aKb, 0, 0, aKb, e8 + .6 * textLength * text.width - aKb * aM.width, e9), dE.drawImage(aM, 0, 0), dE.setTransform(1, 0, 0, 1, 0, 0), dE.imageSmoothingEnabled = !0;
    }
  };
}
function aKc() {
  this.vB = 1, this.oW = function (gm) {
    ct.kD ? gD.aKd.oW(ct.eG, gm) : aF.a2A.yK(gm);
  }, this.oY = function (i9, l5) {
    this.vB && (this.vB = 0, b6.bJ.bK(182, i9)), ct.kD ? gD.aKd.oY(ct.eG, i9, l5) : aF.a2A.yL(i9, l5);
  }, this.ol = function (i9, jy) {
    ct.kD ? gD.aKd.ok(ct.eG, i9, jy) : aF.a2A.yM(i9, jy);
  }, this.om = function (i9, gm) {
    gm = (gm << 3) + k3.oo[6];
    ct.kD ? gD.aKd.om(ct.eG, i9, gm) : h0.op.oq(ct.eG) && aF.a2A.yN(i9, gm);
  }, this.oy = function (i9) {
    849 === i9 && (i9 = 850);
    var kh = k3.oo[3];
    ct.kD ? gD.aKd.oy(ct.eG, i9, kh) : h0.p0.a8V(ct.eG, kh) && aF.a2A.yO(i9, kh);
  }, this.oz = function (kh) {
    ct.kD ? gD.aKd.oz(ct.eG, kh) : aF.a2A.yO(849, kh);
  }, this.p3 = function (l5) {
    ct.kD ? gD.aKd.p3(ct.eG, l5) : aF.a2A.yP(l5);
  }, this.aKe = function (ek) {
    ct.kD ? gD.aKd.p5(ct.eG, ek) : aF.a2A.yQ(ek);
  }, this.n2 = function (p6) {
    ct.kD ? gD.aKd.n2(ct.eG, p6) : aF.a2A.yR(p6);
  }, this.p7 = function () {
    ct.kD ? gD.aKd.p7(ct.eG) : aF.a2A.yS();
  }, this.nZ = function () {
    ct.kD ? gD.aKd.nZ(ct.eG) : aF.a2A.yP(513);
  }, this.pB = function (i9, gm, l5) {
    ct.kD ? gD.aKd.pB(ct.eG, i9, gm, l5) : aF.a2A.yT(i9, gm, l5);
  };
}
function aKf() {
  var aKg = [[100, 100, 100], [144, 0, 0], [0, 128, 0], [0, 0, 144], [128, 128, 0], [128, 0, 128], [0, 128, 128], [196, 196, 196], [0, 0, 0]],
    aKh = [[4, 4, 4, 20], [4, 0, 0, 27], [0, 4, 0, 31], [0, 0, 4, 27], [4, 4, 0, 31], [4, 0, 4, 31], [0, 4, 4, 31], [4, 4, 4, 14], [4, 4, 4, 13]];
  this.aKi = null, this.aKj = null, this.aKk = null, this.aKl = null, this.aKm = null, this.aKn = null, this.aKo = null, this.aKp = null, this.aKq = null, this.aKr = null;
  function aKw(fO, fN) {
    for (var aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aN = fO; aN < fN; aN++) aKi[aN] = he.iA(64 * iW.random(), iW.value(100)) << 2, aKj[aN] = he.iA(64 * iW.random(), iW.value(100)) << 2, aKk[aN] = he.iA(64 * iW.random(), iW.value(100)) << 2;
  }
  function aKv(fO, fN) {
    for (var colorsData = ct.data.colorsData, aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aN = fO; aN < fN; aN++) {
      var aY = colorsData[aN];
      aKi[aN] = 4 * (aY >> 12), aKj[aN] = 4 * (aY >> 6 & 63), aKk[aN] = 4 * (63 & aY);
    }
  }
  function aLG(fK, aLI) {
    a5E[fK] = 0, a5E[fK + 1] = 0, a5E[fK + 2] = aLI, a5E[fK + 3] = 0, aLJ(fK);
  }
  function aLJ(fK) {
    var eT;
    gJ.aJY || (eT = d5.aDT(fK), fK = d5.mw(fK), gJ.aJY = eT >= aA4.aJb[0] && eT <= aA4.aJb[2] && fK >= aA4.aJb[1] && fK <= aA4.aJb[3]);
  }
  this.aCW = new Int32Array(4), this.aCX = new Int32Array(8), this.mj = function () {
    var aCW = this.aCW,
      aCW = (aCW[0] = -4 * fU.fV, aCW[1] = 4, aCW[2] = -aCW[0], aCW[3] = -aCW[1], this.aCX);
    aCW[0] = -4 * fU.fV - 4, aCW[1] = -4 * fU.fV, aCW[2] = -4 * fU.fV + 4, aCW[3] = -4, aCW[4] = 4, aCW[5] = 4 * fU.fV - 4, aCW[6] = 4 * fU.fV, aCW[7] = 4 * fU.fV + 4;
  }, this.r = function () {
    if (this.aKi ? (this.aKi.fill(0), this.aKj.fill(0), this.aKk.fill(0), this.aKl.fill(0), this.aKm.fill(0), this.aKn.fill(0), this.aKo.fill(0), this.aKp.fill(0), this.aKq.fill(0), this.aKr.fill(0), this.d6.fill(0)) : (this.aKi = new Uint8Array(ct.cv), this.aKj = new Uint8Array(ct.cv), this.aKk = new Uint8Array(ct.cv), this.aKl = new Uint8Array(ct.cv), this.aKm = new Uint8Array(ct.cv), this.aKn = new Uint8Array(ct.cv), this.aKo = new Uint8Array(ct.cv), this.aKp = new Uint8Array(ct.cv), this.aKq = new Uint8Array(ct.cv), this.aKr = new Uint8Array(ct.cv), this.d6 = new Uint8Array(ct.cv)), ct.il) for (var rE = ey.rE, aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aN = ct.cv - 1; 0 <= aN; aN--) {
      var bW = rE[aN],
        aW = he.iA((aKh[bW][3] + 1) * iW.random(), iW.value(100));
      aKi[aN] = aKg[bW][0] + aW * aKh[bW][0], aKj[aN] = aKg[bW][1] + aW * aKh[bW][1], aKk[aN] = aKg[bW][2] + aW * aKh[bW][2];
    } else 0 === ct.data.colorsType ? ct.data.selectableColor ? (aKv(0, ct.dP), aKw(ct.dP, ct.cv)) : aKw(0, ct.cv) : aKv(0, ct.cv);
    !function () {
      var aN,
        fS,
        aKi = d5.aKi,
        aKj = d5.aKj,
        aKk = d5.aKk;
      for (aN = ct.cv - 1; 0 <= aN; aN--) fS = he.iA(aKi[aN] + aKj[aN] + aKk[aN], 3), aKi[aN] += aL2(fS - aKi[aN], 2), aKj[aN] += aL2(fS - aKj[aN], 2), aKk[aN] += aL2(fS - aKk[aN], 2), aKi[aN] -= aKi[aN] % 4, aKj[aN] -= aKj[aN] % 4, aKk[aN] -= aKk[aN] % 4;
    }(), function () {
      for (var aM = ct.cv, aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aKl = d5.aKl, aN = 0; aN < aM; aN++) aKi[aN] += aN >> 7, aKj[aN] += aN >> 5 & 3, aKk[aN] += aN >> 3 & 3, aKl[aN] = 7 & aN;
    }(), this.aKz(), function () {
      for (var aM = ct.cv, aKm = d5.aKm, aKn = d5.aKn, aKo = d5.aKo, aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aN = 0; aN < aM; aN++) {
        var uW = aKi[aN],
          kA = aKj[aN],
          ex = aKk[aN];
        60 <= uW + kA + ex ? (aKm[aN] = Math.max(uW - 40, 3 & uW), aKn[aN] = Math.max(kA - 40, 3 & kA), aKo[aN] = Math.max(ex - 40, 3 & ex)) : (aKm[aN] = uW + 40, aKn[aN] = kA + 40, aKo[aN] = ex + 40);
      }
    }(), function () {
      for (var aM = ct.cv, aKp = d5.aKp, aKq = d5.aKq, aKr = d5.aKr, aKi = d5.aKi, aKj = d5.aKj, aKk = d5.aKk, aN = 0; aN < aM; aN++) {
        var uW = aKi[aN],
          kA = aKj[aN],
          ex = aKk[aN];
        688 <= uW + kA + ex ? (aKp[aN] = uW - 88, aKq[aN] = kA - 88, aKr[aN] = ex - 88) : (aKp[aN] = Math.min(uW + 88, 252 + (3 & uW)), aKq[aN] = Math.min(kA + 88, 252 + (3 & kA)), aKr[aN] = Math.min(ex + 88, 252 + (3 & ex)));
      }
    }();
  }, this.xt = function (player) {
    var a6 = k3.uY;
    return a6[0] = this.aKi[player], a6[1] = this.aKj[player], a6[2] = this.aKk[player], a6;
  }, this.aKz = function () {
    for (var aN = ct.cv - 1; 0 <= aN; aN--) this.d6[aN] = this.aKi[aN] + this.aKj[aN] + this.aKk[aN] < 280 ? 0 : 1;
  }, this.aDT = function (fK) {
    return he.iA(fK, 4) % fU.fV;
  }, this.mw = function (fK) {
    return he.iA(fK, 4 * fU.fV);
  }, this.a6D = function (eT, eU) {
    return Math.floor(4 * (eU * fU.fV + eT));
  }, this.aL3 = function (fK) {
    var aCW = this.aCW;
    return this.aL4(fK + aCW[0]) || this.aL4(fK + aCW[1]) || this.aL4(fK + aCW[2]) || this.aL4(fK + aCW[3]);
  }, this.aL5 = function (fK) {
    var aCW = this.aCW;
    return this.aL6(fK + aCW[0]) || this.aL6(fK + aCW[1]) || this.aL6(fK + aCW[2]) || this.aL6(fK + aCW[3]);
  }, this.aL7 = function (fK, player) {
    var aCW = this.aCW;
    return this.aL8(fK + aCW[0], player) || this.aL8(fK + aCW[1], player) || this.aL8(fK + aCW[2], player) || this.aL8(fK + aCW[3], player);
  }, this.a64 = function (aN, aL9, aLA, aLB) {
    this.aKi[aN] = aL9 >> 16, this.aKj[aN] = aL9 >> 8 & 255, this.aKk[aN] = 255 & aL9, this.aKm[aN] = aLA >> 16, this.aKn[aN] = aLA >> 8 & 255, this.aKo[aN] = 255 & aLA, this.aKp[aN] = aLB >> 16, this.aKq[aN] = aLB >> 8 & 255, this.aKr[aN] = 255 & aLB;
  }, this.a61 = function (aN) {
    return [(this.aKi[aN] << 16) + (this.aKj[aN] << 8) + this.aKk[aN], (this.aKm[aN] << 16) + (this.aKn[aN] << 8) + this.aKo[aN], (this.aKp[aN] << 16) + (this.aKq[aN] << 8) + this.aKr[aN]];
  }, this.l3 = function (fK) {
    return 208 <= a5E[fK + 3];
  }, this.fT = function (player, fK) {
    return this.l3(fK) && this.l4(player, fK);
  }, this.l4 = function (player, fK) {
    return player === this.hp(fK);
  }, this.aLC = function (fK) {
    return 208 <= a5E[fK + 3] && a5E[fK + 3] < 224;
  }, this.a6G = function (fK) {
    return 224 <= a5E[fK + 3] && a5E[fK + 3] < 248;
  }, this.a6E = function (fK) {
    return 248 <= a5E[fK + 3];
  }, this.aLD = function (fK) {
    for (var aCW = this.aCW, aN = 3; 0 <= aN; aN--) if (this.hl(fK + aCW[aN])) return !0;
    return !1;
  }, this.kr = function (fK) {
    return this.l3(fK) || this.ho(fK);
  }, this.hl = function (fK) {
    return 0 === a5E[fK + 3] && 2 === a5E[fK + 2];
  }, this.ho = function (fK) {
    return 0 === a5E[fK + 3] && 1 === a5E[fK + 2];
  }, this.a1u = function (fK) {
    return 0 === a5E[fK + 3] && 3 === a5E[fK + 2];
  }, this.aL6 = function (fK) {
    return 0 === a5E[fK + 3] && 5 === a5E[fK + 2];
  }, this.aL4 = function (fK) {
    return 0 === a5E[fK + 3] && 3 <= a5E[fK + 2];
  }, this.hm = function (fK) {
    return (a5E[fK] >> 1 << 8) + a5E[fK + 1];
  }, this.aLE = function (fK) {
    return 1 & a5E[fK];
  }, this.aL8 = function (fK, player) {
    return this.ho(fK) || this.l3(fK) && player !== this.hp(fK);
  }, this.hp = function (fK) {
    return ((3 & a5E[fK]) << 7) + ((3 & a5E[fK + 1]) << 5) + ((3 & a5E[fK + 2]) << 3) + (7 & a5E[fK + 3]);
  }, this.aLF = function (fK) {
    aLG(fK, 1);
  }, this.aLH = function (fK) {
    aLG(fK, 2);
  }, this.a6I = function (fK, player) {
    a5E[fK] = this.aKi[player], a5E[fK + 1] = this.aKj[player], a5E[fK + 2] = this.aKk[player], a5E[fK + 3] = 208 + this.aKl[player], aLJ(fK);
  }, this.a6H = function (fK, player) {
    a5E[fK] = this.aKm[player], a5E[fK + 1] = this.aKn[player], a5E[fK + 2] = this.aKo[player], a5E[fK + 3] = 224 + this.aKl[player], aLJ(fK);
  }, this.a6F = function (fK, player) {
    a5E[fK] = this.aKp[player], a5E[fK + 1] = this.aKq[player], a5E[fK + 2] = this.aKr[player], a5E[fK + 3] = 248 + this.aKl[player], aLJ(fK);
  };
}
function a2Y() {
  this.r = function () {
    this.a5n = 0, this.aGO = [], this.aGX = 0, this.aGN = 0;
  }, this.z = function () {
    var a3d;
    ct.kD || (a3d = this, 2 === ct.uw ? a3d.aGO = nH.a2Z.aLL() : ct.il ? a3d.aGO = nH.a2Z.aLM() : a3d.aGO = nH.a2Z.aLN(), a3d.a5n = be.aLO.a5h(), a3d.aGX = Math.max(1, nH.a2Z.aLP(a3d.aGO)), gD.f.aLQ(), 8 === ct.cu ? nH.result.aGN = 0 : a3d.aGN = 100 * nH.result.a5n * (1 + ct.ut));
  };
}
function m() {
  this.vs = function (canvas, vl, lo) {
    var aO = canvas.width,
      dA = canvas.height,
      bW = aR.b.xo(aO, dA),
      e2 = aR.b.getContext(bW, !0),
      canvas = (e2.drawImage(canvas, 0, 0), e2.getImageData(0, 0, aO, dA));
    return vl(canvas.data, aO, dA, lo), e2.putImageData(canvas, 0, 0), bW;
  }, this.vq = function (en, aO, dA) {
    for (var eT = aO - 1; 0 <= eT; eT--) for (var eU = dA - 1; 0 <= eU; eU--) {
      var aN = 4 * (eT + eU * aO);
      en[3 + aN] = en[aN], en[aN] = en[1 + aN] = en[2 + aN] = 255;
    }
  }, this.vm = function (en, aO, dA) {
    for (var eT = aO - 1; 0 <= eT; eT--) for (var eU = dA - 1; 0 <= eU; eU--) {
      var aN = 4 * (eT + eU * aO);
      en[1 + aN] > en[2 + aN] + 10 && (en[3 + aN] = en[aN], en[1 + aN] = en[2 + aN]);
    }
  }, this.vo = function (en, aO, dA, lo) {
    for (var gap = Math.floor(Math.min(aO, dA) * lo), eT = 0; eT < aO; eT++) for (var aN, eU = 0; eU < dA; eU++) (eT < gap || eU < gap || aO - gap <= eT || dA - gap <= eU) && (en[3 + (aN = 4 * (eT + eU * aO))] = 255 - 255 * (en[1 + aN] - en[aN]) / (255 - en[aN]));
  }, this.aKa = function (en, aO, dA, lo) {
    for (var eT = aO - 1; 0 <= eT; eT--) for (var eU = dA - 1; 0 <= eU; eU--) {
      var aN = 4 * (eT + eU * aO);
      en[aN] = lo[0], en[1 + aN] = lo[1], en[2 + aN] = lo[2];
    }
  }, this.vn = function (en, aO, dA, lo) {
    for (var gap = Math.floor(aO * lo), eT = 0; eT < aO; eT++) for (var aN, eU = 0; eU < dA; eU++) (eT < gap || eU < gap || aO - gap <= eT || dA - gap <= eU) && (en[aN = 4 * (eT + eU * aO)] = en[1 + aN] = en[2 + aN] = 0);
  }, this.vp = function (en, aO, dA) {
    for (var eU, aN, eT = aO - 1; 0 <= eT; eT--) for (eU = dA - 1; 0 <= eU; eU--) 200 < en[1 + (aN = 4 * (eT + eU * aO))] && en[1 + aN] - 20 > en[aN] && en[1 + aN] - 20 > en[2 + aN] ? en[aN] + en[2 + aN] < 40 ? en[3 + aN] = 0 : (en[3 + aN] = en[aN], en[aN] = 255, en[1 + aN] = 255, en[2 + aN] = 255) : en[aN] < 50 && en[1 + aN] < 50 && en[2 + aN] < 50 && (en[aN] + en[1 + aN] + en[2 + aN] < 50 ? en[3 + aN] = 180 : en[3 + aN] = 180 + Math.floor(75 * (en[aN] + en[1 + aN] + en[2 + aN] - 50) / 100));
  }, this.vr = function (en, aO, dA) {
    for (var eU, aN, eT = aO - 1; 0 <= eT; eT--) for (eU = dA - 1; 0 <= eU; eU--) en[1 + (aN = 4 * (eT + eU * aO))] > en[aN] + 20 && en[1 + aN] > en[2 + aN] + 20 && en[aN] + en[2] < 40 && (en[3 + aN] = 255 - en[1 + aN], en[aN] = en[1 + aN] = en[2 + aN] = en[aN]);
  }, this.z5 = function (en, aO, dA, lo) {
    for (var uW = aO >> 1, eT = 0; eT < aO; eT++) for (var eU = 0; eU < dA; eU++) Math.sqrt((eT - uW) * (eT - uW) + (eU - uW) * (eU - uW)) > lo * uW && (en[4 * (eT + eU * aO) + 3] = 0);
  };
}
function wP() {
  var tL,
    aLS = !0;
  function aLX(aLW, a9P) {
    var nx = document.createElement("div"),
      aLY = document.createElement("span"),
      aLZ = document.createElement("span");
    aLY.textContent = gG.qe(a9P.dz) + ":", aLY.style.color = bG.aFH, aLY.style.paddingRight = "0.4em", aLY.style.display = "table-cell", aLY.style.width = "6ch", aLY.style.textAlign = "end", nx.appendChild(aLY), aLZ.textContent = a9P.bS, nx.appendChild(aLZ), nx.style.display = "table", a9P.ek && function (nx, ek) {
      {
        var a5N;
        ek >= 1024 - da.db.eq ? ((a5N = document.createElement("img")).src = da.en.ep[ek - 1024 + da.db.eq].toDataURL(), a5N.style.width = "1.5em", a5N.style.height = "1.5em", a5N.style.verticalAlign = "middle", nx.appendChild(a5N)) : ((a5N = document.createElement("span")).textContent = da.db.er(ek), a5N.style.display = "inline-block", a5N.style.fontSize = "1.5em", a5N.style.lineHeight = "1em", a5N.style.verticalAlign = "middle", nx.appendChild(a5N));
      }
    }(nx, a9P.ek), aLW.appendChild(nx);
  }
  function aLU() {
    aLS && (tL.au.scrollTop = tL.au.scrollHeight);
  }
  this.clear = function () {
    tL.au.textContent = "";
  }, this.show = function () {
    this.clear();
    for (var tg = v4.aLV(), aM = tg.length, aLW = document.createDocumentFragment(), aN = 0; aN < aM; aN++) aLX(aLW, tg[aN]);
    tL.au.appendChild(aLW), aLU(), tL.show(), this.resize(), aLS = !0, aLU();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tL.au.style.padding = "0.4em " + aR.b.nz(lS.o0);
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, this.ip = function (a9P) {
    var aLW = document.createDocumentFragment();
    aLX(aLW, a9P), tL.au.appendChild(aLW), aLU();
  }, (tL = new ao(L(80), [new ap("⬅️ " + L(1), function () {
    aq.wS(1);
  })])).au.style.overflowY = "auto", tL.au.addEventListener("scroll", function () {
    aLS = tL.au.scrollTop >= tL.au.scrollHeight - tL.au.clientHeight - 2;
  });
}
function aLb() {
  this.pa = 512, this.aCe = 8, this.ka = 0, this.a8Y = 0, this.kw = new Uint16Array(this.pa), this.kY = new Uint32Array(this.pa), this.kZ = new Uint16Array(this.pa), this.kx = new Uint32Array(this.pa), this.yn = new Uint16Array(this.pa), this.pj = new Uint16Array(this.pa), this.kX = new Uint8Array(this.pa), this.y7 = new Uint8Array(this.pa), this.pn = new Array(this.pa), this.kv = new Uint16Array(this.pa), this.a4P = new Uint8Array(ct.cv), this.a4Q = new Uint16Array(this.aCe * ct.cv), this.r = function () {
    this.ka = 0, this.a8Y = 0, this.a4P.fill(0), this.pn.fill(null);
  }, this.ox = function (player) {
    var ki = k3.k4[0],
      ph = k3.oo[1],
      gf = k3.a6[0],
      aLc = this.a8Y,
      aM = this.ka,
      yj = dr.iL(gf[0]),
      aLd = this.a4P[player],
      aLe = (player << 3) + aLd;
    this.kw[aM] = aLe, this.kY[aM] = yj, this.kZ[aM] = 0, ki < 60 && (aR.f.aK8(player, 60 - ki), ki = 60), this.kx[aM] = ki, this.yn[aM] = h0.iO.ox(aM, dr.iN(yj)), this.pj[aM] = aLc, this.kX[aM] = ph, this.y7[aM] = 0, this.pn[aM] = gf, this.kv[aM] = 0, this.a8Y = (aLc + 1) % 65536, this.a4P[player] = aLd + 1, this.a4Q[aLe] = aM, this.ka++, h0.ph.kg(player, gf[gf.length - 1], ph, aLc, ki);
  }, this.f1 = function () {
    h0.ph.f1();
    for (var d1 = ct.eG, eZ = h0.nd.a4W(d1), a3d = (!function (a3d) {
        for (var aLj, kY = a3d.kY, kx = a3d.kx, y7 = a3d.y7, kZ = a3d.kZ, yn = a3d.yn, pn = a3d.pn, kv = a3d.kv, a3d = a3d.ka, yB = fU.fV << 4, aN = a3d - 1; 0 <= aN; aN--) {
          var aLk = kY[aN],
            gf = pn[aN],
            aLl = kv[aN],
            yj = dr.iL(gf[aLl]),
            yk = dr.iL(gf[aLl + 1]),
            aLm = yj % yB,
            yj = ~~((yj + .5) / yB),
            aLo = yk % yB,
            aLp = ~~((yk + .5) / yB),
            aLq = aLo - aLm,
            aLr = aLp - yj,
            fS = Math.max(~~Math.sqrt(aLq * aLq + aLr * aLr + .5), 1),
            aLs = kx[aN],
            aLs = (aLs = y7[aN] ? 4e4 : 25e4 + Math.min(20 * aLs, 3e5) + Math.min(aLs >> 3, 5e4), kZ[aN] + Math.max(~~((aLs + .5) / fS), 1));
          65535 <= aLs ? aLl + 2 < gf.length ? (kv[aN] = aLl + 1, kY[aN] = aLj = function (aN, aLt, aLm, aLn, aLl, fS, gf, yB) {
            aLt = Math.min(aLt - 65535, 65535);
            var gf = dr.iL(gf[aLl + 2]),
              aLl = gf % yB - aLm,
              gf = ~~((gf + .5) / yB) - aLn,
              aLv = Math.max(~~Math.sqrt(aLl * aLl + gf * gf + .5), 1);
            return aLt = Math.min(Math.floor((fS * aLt + .5) / aLv), 65534), h0.b1.kZ[aN] = aLt, aLm + he.iA(aLt * aLl, 65535) + yB * (aLn + he.iA(aLt * gf, 65535));
          }(aN, aLs, aLo, aLp, aLl, fS, gf, yB)) : (kY[aN] = aLj = yk, kZ[aN] = 65535) : (kZ[aN] = aLs, kY[aN] = aLj = aLm + he.iA(aLs * aLq, 65535) + yB * (yj + he.iA(aLs * aLr, 65535))), yn[aN] = h0.iO.yh(yn[aN], aLk, aLj);
        }
      }(this), !function (a3d) {
        if (dy.f2() % 2 == 1) {
          var aN,
            dZ,
            aW,
            ex,
            bW,
            aLw,
            aLx,
            aLy,
            g4,
            e3,
            e6,
            yj,
            aLz,
            a6r,
            aM1,
            gi,
            aM = a3d.ka,
            kY = a3d.kY,
            kw = a3d.kw,
            kx = a3d.kx,
            y7 = a3d.y7,
            iO = h0.iO.iO,
            aM3 = iO.length,
            ye = h0.iO.ye,
            yB = fU.fV << 4,
            aM4 = ct.il,
            a7I = ey.iy,
            s9 = (aM - 1) * (he.iA(dy.f2(), 2) % 2);
          for (aN = 0; aN < aM; aN++) for (dZ = Math.abs(aN - s9), yj = kY[dZ], aW = dr.iN(yj), g4 = kw[dZ] >> 3, e3 = yj % yB, e6 = ~~((yj + .5) / yB), aM1 = kx[dZ], ex = 0; ex < 9; ex++) if (!((aLw = aW + ye[ex]) < 0 || aM3 <= aLw)) for (aLy = iO[aLw], aLx = aLy.length, bW = 0; bW < aLx; bW++) aLz = aLy[bW], gi = kw[aLz] >> 3, g4 == gi || aM4 && a7I[g4] === a7I[gi] && a7I[g4] || (gi = kY[aLz], (a6r = e3 - gi % yB) * a6r + (a6r = e6 - ~~((gi + .5) / yB)) * a6r < 14400 && (gi = kx[aLz], a6r = gi <= aM1 ? Math.max(1, he.iA(gi + he.iA(aM1 - gi, 10), 10)) : Math.max(1, he.iA(aM1, 10)), kx[aLz] = Math.max(gi - a6r, 0), y7[aLz] = 4));
        }
      }(this), !function (a3d) {
        if (dy.f2() % 5 == 3) for (var kx = a3d.kx, aM = a3d.ka, aN = 0; aN < aM; aN++) {
          var ki = kx[aN];
          kx[aN] = Math.max(ki - Math.max(1, ki >> 7), 0);
        }
      }(this), this), kx = a3d.kx, y7 = a3d.y7, aN = a3d.ka - 1; 0 <= aN; aN--) y7[aN] = y7[aN] >> 1, 0 === kx[aN] && (h0.kc.kd(aN), h0.ke.kf(aN));
    hD.l6(d1, eZ - h0.nd.a4W(d1), 15);
  };
}
function aM5() {
  this.vV = new aGg(), this.hH = new a3G(), this.turnstile = new a9S(), this.r = function () {
    cA.hg.a9r(), this.turnstile.r();
  }, this.a3J = function () {
    return b6.buffer.data[160].value;
  };
}
function aEA() {
  function aME() {
    fU.a1l.f1();
  }
  function aML(d1, aMK) {
    0 < aMK && (fU.a1m[d1] += aMK, fU.a1m[d1 + 1] += aMK, fU.a1m[d1 + 2] += aMK);
  }
  function hl(d1) {
    return fU.a1m[d1 + 2] > fU.a1m[d1] && fU.a1m[d1 + 2] > fU.a1m[d1 + 1];
  }
  this.py = -1, this.mE = 0, this.aM6 = 0, this.aM7 = 8, this.aM8 = 32, this.aM9 = 8, this.aMA = 32, this.aMB = [0, 0], this.d6 = [0, 0, 0, 0], this.iO = null, this.aMC = !0, this.aMD = !1, this.aED = function () {
    -1 !== this.py && clearTimeout(this.py), this.py = -1, this.iO = null, aEE.aEH();
  }, this.r = function () {
    7 === jE.jF() || this.aMD || (this.aMC = !0, this.mE = 0, this.aM6 = 1, this.aMB = [fU.tu.tv[fU.jJ].a1L[0], fU.tu.tv[fU.jJ].a1M[0]], this.d6 = [fU.tu.tv[fU.jJ].a1N[3], fU.tu.tv[fU.jJ].a1N[4], fU.tu.tv[fU.jJ].a1N[5], fU.tu.tv[fU.jJ].a1N[6]], this.aM7 = fU.tu.tv[fU.jJ].a1N[7], this.aM8 = fU.tu.tv[fU.jJ].a1N[8], this.aM9 = fU.tu.tv[fU.jJ].a1N[9], this.aMA = fU.tu.tv[fU.jJ].a1N[10], this.aMC ? this.py = setTimeout(aME, 16) : this.f1());
  }, this.f1 = function () {
    if (8 === jE.jF() && hI.aMF()) this.py = setTimeout(aME, 16);else {
      if (0 === this.mE) {
        var a1K = iW.a6a();
        if (iW.v7(fU.tu.tv[fU.jJ].a1N[2]), aEE.bd([fU.fV, fU.iD, fU.tu.tv[fU.jJ].a1N[0], fU.tu.tv[fU.jJ].a1N[1]]), iW.v7(a1K), this.iO = aEE.aMG(), this.mE++, this.aMC) return void (this.py = setTimeout(aME, 16));
      }
      for (var d1, gm, a1K = this.aMC ? 10 : 1e6, a1K = fU.iD - this.aM6 - 1 < a1K ? fU.iD - this.aM6 - 1 : a1K, aMH = this.aM6 + a1K, eU = this.aM6; eU < aMH; eU++) for (var eT = 1; eT < fU.fV - 1; eT++) hl(d1 = 4 * (gm = eT + eU * fU.fV)) ? this.aMI(d1, gm, 1) : (this.aMI(d1, gm, 0), function (eT, eU, d1) {
        return 1 < eT && hl(d1 - 4) || eT < fU.fV - 2 && hl(d1 + 4) || 1 < eU && hl(d1 - 4 * fU.fV) || eU < fU.iD - 2 && hl(d1 + 4 * fU.fV);
      }(eT, eU, d1) && this.aMJ(eT, eU));
      this.aM6 = aMH, this.aM6 >= fU.iD - 1 ? (fU.lR.putImageData(fU.a1k, 0, 0, 1, 1, fU.fV - 2, fU.iD - 2), dy.gK = !0, this.aED()) : this.aMC && (this.py = setTimeout(aME, 16));
    }
  }, this.aMI = function (d1, gm, af) {
    aML(d1, Math.floor(this.aMB[af] + this.d6[af] * this.iO[gm] / 1e4) - fU.a1m[d1]);
  }, this.aMM = function (d1, uW, aMN, af, d6) {
    aML(d1, Math.floor(this.aMB[af] + (1 - uW / aMN) * d6) - fU.a1m[d1]);
  }, this.aMJ = function (dk, dl) {
    for (var d1, uW, aMN, aMO = dk - this.aM8, aMP = dl - this.aM8, aMQ = dk + this.aM8, aMH = dl + this.aM8, aMO = aMO < 1 ? 1 : aMO, aMQ = aMQ > fU.fV - 2 ? fU.fV - 2 : aMQ, aMH = fU.iD - 2 < aMH ? fU.iD - 2 : aMH, eU = aMP < 1 ? 1 : aMP; eU <= aMH; eU++) for (var eT = aMO; eT <= aMQ; eT++) hl(d1 = 4 * (eT + eU * fU.fV)) ? (aMN = this.aM7 + (this.aM8 - this.aM7) * this.iO[eT + fU.fV * eU] / 1e4, Math.abs(dk - eT) > aMN || Math.abs(dl - eU) > aMN || aMN <= (uW = Math.sqrt((dk - eT) * (dk - eT) + (dl - eU) * (dl - eU))) || this.aMM(d1, uW, aMN, 1, this.d6[3])) : (aMN = this.aM9 + (this.aMA - this.aM9) * this.iO[eT + fU.fV * eU] / 1e4, Math.abs(dk - eT) > aMN || Math.abs(dl - eU) > aMN || aMN <= (uW = Math.sqrt((dk - eT) * (dk - eT) + (dl - eU) * (dl - eU))) || this.aMM(d1, uW, aMN, 0, this.d6[2]));
  };
}
function aMR() {
  this.aMS = function () {
    bc.bd(39), bc.bh(1, 0), bc.bh(6, 16), aF.lk.aMT(), aF.b1.send(0, bc.bk);
  }, this.a27 = function (bb) {
    bc.bd(127), bc.bh(1, 0), bc.bh(6, 17), aZ.aa.pR(b6.buffer.data[105].value, 5), aZ.aa.pR(b6.buffer.data[106].value, 15), aF.b1.send(bb, bc.bk);
  }, this.aMV = function () {
    bc.bd(97), bc.bh(1, 0), bc.bh(6, 18), aZ.aa.pR(b6.buffer.data[110].value, 15), aF.b1.send(0, bc.bk);
  }, this.a79 = function (lo) {
    var aM = lo.bS.length;
    bc.bd(21 + 16 * aM), bc.bh(1, 0), bc.bh(6, 29), bc.bh(6, lo.action), bc.bh(8, aM), bs.bz.c0(lo.bS), aF.b1.send(0, bc.bk);
  }, this.aMW = function (aMX, colors, aMY, ws) {
    br.r(), br.bh(1, 0), br.bh(6, 16), br.bh(20, Math.min(aMX, 1e6));
    for (var aN = 0; aN < 11; aN++) for (var aQ = 0; aQ < 3; aQ++) br.bh(8, colors[aN][aQ]);
    aMX = ad.data.ae(aMY.trim());
    br.bh(8, -1 === aMX ? 255 : aMX), bs.bt.bj(ws.trim().substring(0, 180), 8, br), aF.b1.send(0, br.bv());
  }, this.aMZ = function (data) {
    bc.bd(43), bc.bh(1, 0), bc.bh(6, 25), bc.bh(6, data.action), aZ.aa.pR(data.ah, 5), aF.b1.send(0, bc.bk);
  }, this.bP = function (data) {
    bc.bd(75), bc.bh(1, 0), bc.bh(6, 27), bc.bh(6, data.action), aZ.aa.pR(data.ah, 5), bc.cK(32, data.value), aF.b1.send(0, bc.bk);
  };
}
function aMa() {
  this.a6 = ["en", "aa", "ab", "ace", "ach", "af", "ak", "alz", "am", "ar", "as", "av", "awa", "ay", "az", "ba", "bal", "ban", "bbc", "bci", "be", "bem", "ber", "ber-Latn", "bew", "bg", "bho", "bik", "bm", "bm-Nkoo", "bn", "bo", "br", "bs", "bts", "btx", "bua", "ca", "ce", "ceb", "cgg", "ch", "chk", "chm", "ckb", "cnh", "co", "crh", "crs", "cs", "cv", "cy", "da", "de", "din", "doi", "dov", "dv", "dyu", "dz", "ee", "el", "eo", "es", "et", "eu", "fa", "fa-AF", "ff", "fi", "fj", "fo", "fon", "fr", "fur", "fy", "ga", "gaa", "gd", "gl", "gn", "gom", "gu", "gv", "ha", "haw", "he", "hi", "hil", "hmn", "hr", "hrx", "ht", "hu", "hy", "iba", "id", "ig", "ilo", "is", "it", "iw", "ja", "jam", "jv", "jw", "ka", "kac", "kek", "kg", "kha", "kk", "kl", "km", "kn", "ko", "kr", "kri", "ktu", "ku", "kv", "ky", "la", "lb", "lg", "li", "lij", "lmo", "ln", "lo", "lt", "ltg", "luo", "lus", "lv", "mad", "mai", "mak", "mam", "mfe", "mg", "mh", "mi", "min", "mk", "ml", "mn", "mni-Mtei", "mr", "ms", "ms-Arab", "mt", "mwr", "my", "ndc-ZW", "ne", "new", "nhe", "nl", "no", "nr", "nso", "nus", "ny", "oc", "om", "or", "os", "pa", "pa-Arab", "pag", "pam", "pap", "pl", "ps", "pt", "pt-PT", "qu", "rn", "ro", "rom", "ru", "rw", "sa", "sah", "scn", "sd", "se", "sg", "shn", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sus", "sv", "sw", "szl", "ta", "tcy", "te", "tet", "tg", "th", "ti", "tiv", "tk", "tl", "tn", "to", "tpi", "tr", "trp", "ts", "tt", "tum", "ty", "tyv", "udm", "ug", "uk", "ur", "uz", "ve", "vec", "vi", "war", "wo", "xh", "yi", "yo", "yua", "yue", "zap", "zh", "zh-CN", "zh-TW", "zu", "nb", "fil", "sh"], this.aKJ = function () {
    for (var aMb = [], a6 = this.a6, aM = a6.length, aN = 0; aN < aM; aN++) aMb.push(a6[aN]);
    var sd = b6.buffer.data[12].a2T;
    for (aN = 0; aN < aM; aN++) if (aMb[aN] === sd) {
      aMb.splice(aN, 1), aM--;
      break;
    }
    aMb.sort(), aM++, aMb.unshift(sd);
    try {
      if ("undefined" == typeof Intl) return aMb;
      for (aN = 0; aN < aM; aN++) {
        var bS = new Intl.DisplayNames([aMb[aN]], {
          type: "language"
        }).of(aMb[aN]);
        bS !== aMb[aN] && (aMb[aN] = aMb[aN] + ": " + bS);
      }
    } catch (b7) {
      console.log("error 3646: " + b7);
    }
    return aMb;
  }, this.aKK = function (ch) {
    for (var bS = b6.buffer.data[12].value, aM = ch.length, aN = 0; aN < aM; aN++) if (bS === ch[aN].split(":")[0]) return aN;
    return 0;
  }, this.ae = function (aMd) {
    if (aMd && !(aMd.length < 2)) {
      aMd = aMd.split("-")[0].toLowerCase();
      for (var a6 = this.a6, aM = a6.length, aN = 0; aN < aM; aN++) if (aMd === a6[aN]) return aN;
    }
    return -1;
  };
}
function wG() {
  var tL, tM, aMe, aw;
  function tO() {
    a7Z.mV(), aq.tS()[19] = null, aq.ar();
  }
  function aMm() {
    aMp(), aMn();
  }
  function aMp() {
    aMe.nx.lastChild && aq.removeChild(aMe.nx, aMe.nx.lastChild);
  }
  function aMn() {
    var aMq = fU.r0(ct.data);
    ct.data.canvas = fU.a0N(aMq, ct.data.mapSeed).uP, aMo();
  }
  function aMo() {
    var es = ct.data.canvas;
    es.style.width = "100%", aMe.nx.appendChild(es);
  }
  this.a7f = function (es) {
    ct.data.canvas && aMp(), ct.data.canvas = es, aMo();
  }, this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(126), [new ap("⬅️ " + L(1), tO)]), 2 === ct.data.mapType && a7Z.r(), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(270), L(271), L(272)],
      value: ct.data.mapType
    }, function (af) {
      2 === (ct.data.mapType = af) ? (a7Z.r(), ct.data.canvas = null) : (ct.data.passableWater = ct.data.passableMountains = 1, a7Z.mV()), aq.fu(20);
    })), 2 <= ct.data.mapType && (ay.b8(new aMl()), ay.b8(new aHh({
      value: ct.data.passableWater
    }, L(273), function (value) {
      ct.data.passableWater = value;
    })), ay.b8(new aHh({
      value: ct.data.passableMountains
    }, L(274), function (value) {
      ct.data.passableMountains = value;
    })));
    aw.push(ay);
  }(aw = []), function (aw) {
    if (0 === ct.data.mapType) {
      for (var ay = new az(), fY = (ay.b3(L(126)), []), aN = 0; aN < fU.tu.a14.length; aN++) fY.push(fU.tu.tv[fU.tu.a14[aN]].name);
      ay.ta(new tb({
        fY: fY,
        value: ct.data.mapProceduralIndex
      }, function (af) {
        ct.data.mapProceduralIndex = af, aMm();
      })), aw.push(ay);
    }
  }(aw), function (aw) {
    if (1 === ct.data.mapType) {
      for (var ay = new az(), fY = (ay.b3(L(126)), []), aN = 0; aN < fU.tu.a15.length; aN++) fY.push(fU.tu.tv[fU.tu.a15[aN]].name);
      ay.ta(new tb({
        fY: fY,
        value: ct.data.mapRealisticIndex
      }, function (af) {
        ct.data.mapRealisticIndex = af, aMm();
      })), aw.push(ay);
    }
  }(aw), function (aw) {
    var ay;
    2 === ct.data.mapType && ((ay = new az()).b3(L(275)), ay.b8(new b5(b6.buffer.data[162], 1)), ay.b3(L(276), "0.8em"), ay.b8(new bL([new ap(L(277), function () {
      return a7Z.a7X(), !0;
    }).button])), aw.push(ay));
  }(aw), function (aw) {
    var ay, a77;
    2 === ct.data.mapType && ((ay = new az()).b3(L(278)), a77 = new b5({
      af: -1,
      value: ct.data.mapName
    }, 0, 0, function (b7) {
      ct.data.mapName = b7.target.value = b7.target.value.slice(0, 20);
    }), ay.b8(a77), aw.push(ay));
  }(aw), function (aw) {
    var ay, a77, aE4;
    0 === ct.data.mapType && ((ay = new az()).b3("Seed"), a77 = new b5({
      af: -1,
      value: ct.data.mapSeed
    }, 1, 0, function (b7) {
      b7 = Math.abs(Math.floor(b7.target.value)) % 16384;
      ct.data.mapSeed !== b7 && (ct.data.mapSeed = b7, aMm());
    }), aE4 = new ap(L(130), function (b7) {
      var a1K = Math.floor(16384 * Math.random());
      if (ct.data.mapSeed !== a1K) return a77.b7.value = ct.data.mapSeed = a1K, aMm(), !0;
    }), ay.b8(a77), ay.b8(new bL([aE4.button])), aw.push(ay));
  }(aw), function (aw) {
    (aMe = new az()).b3(L(279)), 2 !== ct.data.mapType ? aMn() : ct.data.canvas && aMo();
    aw.push(aMe);
  }(aw), aw));
}
function aMr() {
  this.id = 0, this.cB = 0, this.a0m = null, this.a0n = null, this.a0o = null, this.a0t = null, this.hg = new a9k(), this.r = function () {
    var self, cB;
    self = this, "undefined" == typeof Android || "function" != typeof Android.getVersion || (cB = Android.getVersion()) < 12 || (self.cB = cB, self.id = 1, self.a0n = Android), function (self) {
      var cB;
      "undefined" != typeof mwIOSdataX && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosCommandA && (self.id = 2, self.a0o = mwIOSdataX, self.a0t = window.webkit.messageHandlers.iosCommandA, cB = self.a0o.version, self.cB = cB ? Number(cB) : 0);
    }(this), function (self) {
      var a0m;
      try {
        if (!(a0m = window.localStorage)) return;
        a0m.setItem("tls7", "1"), a0m.removeItem("tls7");
      } catch (error) {
        return;
      }
      self.a0m = a0m;
    }(this);
  };
}
function w6() {
  var tL, aMv;
  function aMy() {
    aq.mU();
    var bS = gF.aN2(aMv.tU());
    (ct.dX && 0 < bS.length && bS === gF.oK.vR || gF.aKT.jS(bS)) && gF.a5P();
  }
  this.show = function (aMz) {
    this.aN0(aMz), tL.show(), this.resize();
  }, this.aN0 = function (aMz) {
    0 === ct.dX ? aMz ? aMv.td(aMz) : ct.v2.length && aMv.td(ct.v2) : (ct.mH || (gF.oK.vR = gF.vS.bj()), aMv.td(gF.aN1(gF.oK.vR)));
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), aMv.resize();
  }, this.bV = function (bW) {
    2 === bW ? tL.bX[0].bY() : aMy();
  }, tL = new ao(L(69), [new ap("⬅️ " + L(1), function () {
    aq.wS(1);
  }), new ap(L(280), function () {
    aMv.aMw();
  }), new ap(L(281), function () {
    aMv.aMx();
  }), new ap(L(282), function () {
    aMv.clear();
  }), new ap(L(283), function () {
    aMy();
  })]), aMv = new tc(L(284)), tL.au.appendChild(aMv.b7);
}
function aN3() {
  this.jR = function (player) {
    gu.aF7(player), ct.qT++, d3.eL[player] = 2, d3.a5i[player] = be.aLO.a5j(), player === ct.eG && (hJ.show(!1, !1), gG.qa(), nH.a2f.aGU()), di.f9(player);
  };
}
function kU() {
  this.f1 = function () {
    if (dy.f2() % 51 == 45) for (var aM = h0.b1.ka, kX = h0.b1.kX, pn = h0.b1.pn, pj = h0.b1.pj, kw = h0.b1.kw, aJD = tV.aJD, ki = tV.ki, aN = 0; aN < aM; aN++) {
      var gf,
        player,
        pe,
        ph = kX[aN];
      ph % 64 == 6 || (gf = pn[aN], (player = h0.nd.a4M(gf[gf.length - 1])) < 0) || !aR.f.a4i(player, kw[aN] >> 3) || iW.rU(1e3) >= aJD[ki[player]] || !function (aDK, gf) {
        for (var aM = gf.length - 1, a8f = h0.b1.kv[aDK], rW = 0, aN = a8f + 1; aN < aM; aN++) rW += dr.i3(gf[aN], gf[aN + 1]);
        return (rW += dr.i3(dr.iM(h0.b1.kY[aDK]), gf[a8f + 1])) <= 60;
      }(aN, gf) || (pe = pj[aN], 64 <= ph && h0.kc.pd(player, pe)) || function (player, gf, pe, aDK, ph) {
        h0.op.oq(player) && aR.f.oa(player, tV.aIl[tV.ki[player]], 32, 0) && (h0.b1.kX[aDK] = 64 + ph % 64, h0.kc.kC(pe, h0.b1.a8Y), k3.a6[0] = h0.gd.ge(gf), k3.oo[1] = 6, aR.f.oh(player), h0.b1.ox(player));
      }(player, gf, pe, aN, ph);
    }
  };
}
function aN7() {
  function aNB(a6, aY, dZ) {
    for (var aN = 0; aN < 256; aN++) a6[aN] = (a6[aN] + (aY >> (aN + dZ) % 30 & 1)) % 256;
  }
  this.f1 = function (aN8, aN9) {
    var a6 = new Uint8Array(256);
    return function (a6, aN8, aN9) {
      var aN,
        aNE = 3 + (4 + aN8) % 32768,
        aNF = 12 + aN9 % 32768,
        aNG = 17 + ((aN8 & aN9) + (aN8 | aN9) + aN8) % 32768;
      for (aN = 0; aN < 256; aN++) aNE = 1 + aNE * aNF % aNG, a6[aN] = aNE % 256;
    }(a6, aN8, aN9), aNB(a6, aN8, 2), aNB(a6, aN9, 7), function (a6) {
      var aN,
        aY,
        af = 0;
      for (aN = 0; aN < 3e4; aN++) aY = a6[af], a6[af] = (aY + aN + a6[(af + aN) % 256]) % 256, af = (aY + aN + af + (aY & af)) % 256;
    }(a6), function (a6) {
      var aN,
        a3W = 1,
        aC6 = 1;
      for (aN = 0; aN < 256; aN += 2) a3W = (1 + a3W) * (a6[aN] + 1) % 1073741824, aC6 = (1 + aC6) * (a6[aN + 1] + 1) % 1073741824;
      return [a3W, aC6];
    }(a6);
  }, this.a25 = function (aNH, aNI, aNJ, result) {
    for (var aL = 1 << aNH, aN = 0; aN < aL; aN++) if (this.aNK(aN, aNI, aNJ) === result) return aN;
    return 0;
  }, this.aNK = function (aNL, aNI, aNJ) {
    for (var aNM = aNI + aNL, aNN = aNJ + aNL, aY = aNM + aNN & 2147483647, aQ = 1; aQ <= 16; aQ++) aY = (aY = (aY ^ aY >> aQ) >>> 1 + (3 & aNM)) * (7 + (1023 & (aNM | aNN))) & 1073741823, aNN >>= 1 + (1 & (aNM >>= 1 + (1 & (aY += 65535 & aNN))));
    return aY &= 1073741823;
  };
}
function aNO() {
  this.b1 = new aG2(), this.hF = new aNP(), this.a2A = new yF(), this.aG = new lh(), this.lk = new bZ(), this.bO = new aMR(), this.aNQ = new aNR(), this.aNS = new pI(), this.k5 = new aNT(), this.aNU = new jC(), this.aNV = new a21(), this.aNW = new aNX(), this.aNY = new aNZ(), this.r = function () {
    this.b1.r();
  };
}
function aNa() {
  "function" != typeof Math.log2 && (Math.log2 = function (eT) {
    return Math.log(eT) / Math.log(2);
  }), "function" != typeof Math.log10 && (Math.log10 = function (eT) {
    return Math.log(eT) / Math.log(10);
  }), "function" != typeof Math.sign && (Math.sign = function (eT) {
    return 0 < eT ? 1 : eT < 0 ? -1 : 0;
  });
}
function nn() {
  var a6P = 0,
    aNb = 0,
    aNc = 0,
    aNd = null,
    aNe = null;
  function aNh(c3, aNj, aNl) {
    var bS = c3.username;
    return (bS += "   " + aI.nd.aNm(c3.aNn, c3.aAu, c3.aNo)) + function (c3) {
      c3 = c3.aMX;
      if (c3 < 1e3) return "   Gold: " + c3;
      if ((c3 %= 1024) < 1e3) return "   Gold: " + c3 + "k";
      return "   Gold: " + (c3 - 999) + "M";
    }(c3) + ("   IP: " + bs.aa.dG(c3.aNq, 2)) + ("   " + ["🟥 Offline", "🟩 Online"][aNl ? aNb : aNg(c3, aNj)]);
  }
  function aNg(c3, aNj) {
    return aNb = aNj || aI.aU.aNr(c3.ah) ? 1 : 0;
  }
  this.aNf = 0, this.a39 = function () {
    !a6P || aNb === aNg(aNe) && aNc === aNe.aMX || (aNc = aNe.aMX, aNd.show(-1, -1, aNh(aNe, 0, 1), 1, 1, aNe.color));
  }, this.aNi = function (b7, c3, aNj) {
    var aNk = b7.getBoundingClientRect();
    this.show(aNk.left, aNk.top, c3, 0, aNj), b7.addEventListener("mouseleave", function remove() {
      b7.removeEventListener("mouseleave", remove), aI.nf && aI.nf.bU(1);
    }), this.aNf = aNj;
  }, this.show = function (eT, eU, c3, aEo, aNj) {
    aNd = aNd || new aEi(), aNc = (aNe = c3).aMX, aNd.show(eT, eU, aNh(c3, aNj), aEo, 0, aNe.color), a6P = 1;
  }, this.bU = function (aEt) {
    this.aNf = 0, aNd && aNd.bU(aEt) && (a6P = 0, aNe = null);
  };
}
function wH() {
  var tL, tM, tN, nw;
  function tO() {
    tQ(), aq.tS()[19] = null, aq.ar();
  }
  function aNs() {
    tQ(), aq.fu(21);
  }
  function tQ() {
    1 === ct.data.gameMode ? ct.v0.qv() : 0 === ct.data.gameMode && 1 === ct.data.colorsType && aR.d.tT(tN.tU(), ct.data.colorsData, 262143);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, nw = [new ap("⬅️ " + L(1), tO)], 1 === ct.data.gameMode && nw.push(new ap(L(285), aNs, 1, 1)), tL = new ao(L(129), nw), tM = new at(tL.au, (nw = [], 0 === ct.data.gameMode ? (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(130), L(55)],
      value: ct.data.colorsType
    }, function (af) {
      tQ(), ct.data.colorsType = af, 1 !== ct.data.colorsType || ct.data.colorsData && ct.data.colorsData.length === ct.cv || (ct.data.colorsData = new Uint32Array(ct.cv)), aq.fu(21);
    })), aw.push(ay);
  }(nw), 1 === ct.data.colorsType && function (aw) {
    var ay = new az();
    ay.b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.colorsData, 1)), ay.b8(tN), aw.push(ay);
  }(nw)) : (ct.v0.qv(), nw.push(function () {
    var ay = new az();
    ay.b3(L(57));
    for (var aN = 0; aN < ey.rB.length; aN++) {
      var dZ = (aN + 1) % ey.rB.length,
        b7 = ay.b0((0 == dZ ? "" : "Team ") + ey.rB[dZ]);
      aN && (b7.style.marginTop = "0.5em"), ay.b8(new b5({
        af: -1,
        value: ct.data.teamPlayerCount[dZ]
      }, 1, 0, function (b7) {
        tL.bX[1].bF(0);
        var playerCount = he.hf(Math.floor(b7.target.value), 0, 512);
        b7.target.value = playerCount, ct.data.teamPlayerCount[b7.target.aNu] = playerCount;
      })).b7.aNu = dZ;
    }
    return ay;
  }()), function (aw) {
    for (var ay = new az(), fY = (ay.b3(L(286)), []), aN = 0; aN < ey.rB.length; aN++) {
      var dZ = (aN + 1) % ey.rB.length;
      fY.push(ey.rB[dZ]);
    }
    ct.data.colorsData || (ct.data.colorsData = new Uint32Array(1));
    ay.ta(new tb({
      fY: fY,
      value: (ct.data.colorsData[0] % 16 + ey.rB.length - 1) % ey.rB.length
    }, function (af) {
      var af = (af + 1) % ey.rB.length,
        ll = ey.rD[af],
        ll = (ll[0] >> 2 << 12) + (ll[1] >> 2 << 6) + (ll[2] >> 2);
      ct.data.colorsData[0] = ll - (15 & ll) + af;
    })), aw.push(ay);
  }(nw)), nw));
}
function kQ() {
  function aNx(player) {
    for (var aJk = d3.aJk[player], aM = aJk.length, aO4 = Math.max(he.iA(aM, 12), 1), aCW = d5.aCW, uW = iW.rU(aM), aN = 0; aN < aM; aN += aO4) for (var hk = aJk[(aN + uW) % aM], fS = 3; 0 <= fS; fS--) {
      var l2 = hk + aCW[fS];
      if (d5.aL6(l2)) return {
        fK: l2,
        id: d5.hm(l2),
        d1: player
      };
    }
    return null;
  }
  function aO2(player, aO6) {
    var ki = aR.f.pF(player, tV.aJC[tV.ki[player]]);
    d3.lD[player].push(aO6.fK), lA.kC(player, ki, aO6.d1), gy.lE(player, !0);
  }
  this.f1 = function (player) {
    return !!fU.aEL(fU.jJ) && !!ct.data.passableMountains && 0 !== d3.aJk[player].length && function (player) {
      var aNw = aNx(player);
      if (null === aNw) return !1;
      !function (player) {
        for (var eK = eI.eK, eJ = eI.eJ, aM = Math.min(eJ, 12), s9 = iW.rU(eJ), aO5 = k3.aO5, aJk = d3.aJk, aL = 0, aN = 0; aN < aM; aN++) {
          var d1 = eK[(aN + s9) % eJ];
          d1 !== player && aJk[d1].length && kl.km(player, d1) && (aO5[aL++] = d1);
        }
        k3.a5A[0] = aL;
      }(player);
      var aNz = function (aO3) {
        for (var aM = k3.a5A[0], aO5 = k3.aO5, aN = 0; aN < aM; aN++) {
          var aO6 = aNx(aO5[aN]);
          if (null !== aO6 && aO6.id === aO3) return aO6;
        }
        return null;
      }(aNw.id);
      return null !== aNz ? (aO2(player, aNz), !0) : function (player, aO3) {
        var aM = gz.j0.j1;
        if (0 !== aM) for (var fK = gz.j0.buffer[iW.rU(aM)] << 2, aCW = d5.aCW, fS = iW.rU(4);;) {
          if (fK += aCW[fS], d5.aL6(fK)) {
            if (d5.hm(fK) === aO3) return aO2(player, {
              fK: fK,
              d1: ct.cv
            }), !0;
            break;
          }
          if (!d5.ho(fK)) break;
        }
        return !1;
      }(player, aNw.id);
    }(player);
  };
}
function aO7() {
  var eT, eU, dA, aCD, aO8, aO9, aOA, aOB, aOC, aO, aOD, aOE;
  this.mg = !1, this.r = function (bS, aOF) {
    if (1 === cA.id && 13 <= cA.cB && cA.cB < 18) return aOF ? void (aOD = bS) : aOD !== bS ? void 0 : void cA.a0n.saveString(200, bS);
    aOF && (aOD = bS, (aOE = document.createElement("a")).appendChild(document.createTextNode(aOD)), this.mg = !0, aOE.title = aOD, aOE.target = "_blank", aOE.href = aOD, aOE.style.textAlign = "center", aOE.style.color = bG.bH, aOE.style.position = "absolute", aOE.style.padding = "0px", aOE.style.margin = "0px", this.resize(), document.body.appendChild(aOE), dy.gK = !0);
  }, this.bU = function () {
    return !(!this.mg || (aq.removeChild(document.body, aOE), this.mg = !1));
  }, this.mv = function (hw, hx) {
    return !!this.mg && ((hw < eT || hx < eU || eT + aO < hw || eU + dA < hx || eT + aO - aCD < hw && hx < eU + aCD) && (dy.gK = !0, this.mg = !1, aq.removeChild(document.body, aOE)), !0);
  }, this.resize = function () {
    var lG, fL;
    this.mg && (aOB = Math.floor(.8 * (cA.hg.hh() ? d9.aO > d9.dA ? .6 : .55 : .4) * d9.dC), aCD = Math.floor(.15 * aOB), aO8 = Math.floor(.35 * aCD), aO9 = Math.floor(.5 * aCD), aOA = Math.floor(2.5 * aO9), dA = aCD + aO8 + 3 * aO9, lG = aR.b.dF(1, aO8 / d9.o5), aOC = Math.floor(d9.o5 * hK.measureText(aOD, lG)), fL = aO = (aOB < aOC ? aOC : aOB) + 2 * aOA, aO = Math.min(aO, d9.aO - 2 * (cA.hg.hh() ? 2 : 1) * lS.gap), lG = aR.b.dF(1, aO / fL * aO8 / d9.o5), aOC = Math.floor(d9.o5 * hK.measureText(aOD, lG)), eT = Math.floor((d9.aO - aO) / 2), eU = Math.floor((d9.dA - dA) / 2), aOE.style.font = lG, aOE.style.top = Math.floor((eU + 1.4 * aO9 + aCD) / d9.o5) + "px", aOE.style.left = Math.floor((eT + (aO - aOC) / 2) / d9.o5) + "px");
  }, this.dd = function () {
    this.mg && (dE.fillStyle = bG.iq, dE.fillRect(eT, eU + aCD, aO, dA - aCD), dE.fillStyle = bG.aFn, dE.fillRect(eT, eU, aO, aCD), dE.fillStyle = bG.bH, dE.lineWidth = lS.o2, dE.strokeStyle = bG.bH, dE.strokeRect(eT, eU, aO, dA), dE.fillRect(eT, eU + aCD, aO, lS.o2), dE.font = aR.b.dF(1, .48 * aCD), aR.b.textAlign(dE, 1), aR.b.textBaseline(dE, 1), dE.fillText(L(287), Math.floor(eT + (aO - .5 * aCD) / 2), Math.floor(eU + .55 * aCD)), my.sU(Math.floor(eT + aO - .8 * aCD), Math.floor(eU + .25 * aCD), Math.floor(.5 * aCD)), dE.setTransform(1, 0, 0, 1, 0, 0));
  };
}
function aMl() {
  var b7;
  this.b7 = document.createElement("hr"), this.resize = function () {
    aR.b.g1(this.b7, 8, bG.a93);
  }, (b7 = this.b7).style.marginBottom = b7.style.marginTop = "0.65em", b7.style.marginLeft = b7.style.marginRight = "-4%", b7.style.border = "none";
}
function aOG() {
  var aOH,
    aOI = new Uint8Array(5),
    aOJ = new Uint8Array(5);
  this.aOK = new iY(), this.r = function () {
    for (var aY = b6.buffer.data[119].value, aN = 0; aN < aOI.length; aN++) aOI[aN] = (aY >> 2 * aN) % 4;
  }, this.vG = function () {
    aOH = [L(288), "", L(289, [aFx.aFv[28]]), L(290, [aFx.aFv[26]]), L(291, [aFx.aFv[0]])], this.aOK.r();
  }, this.f1 = function () {
    this.aOK.f1();
  }, this.zG = function (id) {
    1 < id && a5t.a5u() || !function (af) {
      if (3 === aOI[af] || 1 === aOJ[af]) return;
      if (aOJ[af] = 1, !(Math.random() < .6)) {
        aOI[af]++;
        for (var aY = 0, aN = 0; aN < aOI.length; aN++) aY += aOI[aN] << 2 * aN;
        b6.bJ.bK(119, aY);
      }
      return 1;
    }(id) || fA.aOM(aOH[id]);
  };
}
function aON() {
  var eo = 32,
    ep = new Array(2);
  function xo(bW) {
    var eT,
      eU,
      gm,
      dg,
      df,
      el = eo,
      es = aR.b.xo(el, el),
      e2 = aR.b.getContext(es, !0),
      xp = aR.b.getImageData(e2, el, el),
      en = xp.data,
      aW = (el >> 1) - .5,
      aOP = Math.sqrt(aW * aW);
    for (en.fill(255), eU = 0; eU < el; eU++) for (eT = 0; eT < el; eT++) df = eT - aW, dg = eU - aW, gm = 4 * (eU * el + eT), df = 714 * (aOP - Math.sqrt(df * df + dg * dg)) / aOP, en[2 + gm] = bW, en[3 + gm] = 255 < df ? 0 : df;
    return e2.putImageData(xp, 0, 0), es;
  }
  this.aOO = -1, this.r = function () {
    this.aOO = -1, ep[0] || (ep[0] = xo(255), ep[1] = xo(0));
  }, this.a51 = function (e2, fK, eT, eU, uW, aN) {
    aR.f.kk(ct.eG) && (e2.setTransform(fK *= 4 / 3 * .625, 0, 0, fK, eT - (uW *= 4 / 3), eU - uW), e2.drawImage(ep[+(h0.b1.pj[aN] === this.aOO)], 0, 0));
  };
}
function aBz(aBn, aBo) {
  var aOV,
    self,
    aOQ = document.createElement("div"),
    aOR = document.createElement("div"),
    aJO = document.createElement("div"),
    aOS = null,
    aOW = (this.a77 = new b5({
      value: "",
      af: -1
    }, 0, aOT, function (b7) {
      b7.target.value = aR.h.aCr(b7.target.value), aOS.hX.textContent = 127 - b7.target.value.length;
    }), 0),
    aLS = 1,
    aOX = 0,
    aOY = 1048575;
  function aOT() {
    aBn(), aOS.hX.textContent = 127;
  }
  function aLX(aLW, c3) {
    c3 && (c3.aOa = 1, aLW.appendChild(aI.db.transform(c3)));
  }
  function aLU(dx) {
    aLS ? aOQ.scrollTop = aOQ.scrollHeight : dx && (aOQ.scrollTop = aOX);
  }
  this.reset = function (aOZ) {
    aOY = 1048575, aOR.textContent = "", aOZ || this.hQ();
  }, this.hQ = function () {
    var jk = aI.b1.a30[0],
      jk = aI.b1.jH[jk],
      jl = jk.jl,
      aM = jl.length,
      fO = 1048575 === aOY ? 0 : aM - (jk.jm - aOY + 1048575) % 1048575;
    if (aOY = jk.jm, !(aM <= (fO = Math.max(fO, 0)))) {
      for (var aLW = document.createDocumentFragment(), aN = fO; aN < aM; aN++) aLX(aLW, aI.nd.a8F(jl[aN], aI.nd.a8G(jl[aN])));
      aOR.appendChild(aLW), aLU();
    }
  }, this.a8I = function (a0) {
    var aLW = document.createDocumentFragment();
    aLX(aLW, a0), aOR.appendChild(aLW), aLU();
  }, this.show = function (fX) {
    fX.appendChild(aOQ), fX.appendChild(aJO), this.resize(fX);
  }, this.bU = function (fX) {
    aq.removeChild(fX, aOQ), aq.removeChild(fX, aJO);
  }, this.resize = function (fX) {
    aOW = fX ? fX.offsetHeight : aOW;
    var fX = aR.b.tJ(.04, .75),
      sI = Math.max(fX, aOW - fX),
      aOc = d9.aO / d9.o5,
      aKX = .7 * aOc,
      aOd = aR.b.nz(aOW - fX - sI),
      sI = (aJO.style.height = aR.b.nz(fX), aOQ.style.height = aR.b.nz(sI), d9.dA > d9.aO || cA.hg.hh() ? (aJO.style.top = aOd, aOQ.style.top = aR.b.nz(aOW - sI), aR.b.g1(aOQ, 8)) : (aOQ.style.top = aOd, aJO.style.top = aR.b.nz(aOW - fX), aR.b.g1(aOQ, 2)), this.a77.b7.style.width = aR.b.nz(aKX), this.a77.b7.style.fontSize = aOV.button.style.fontSize = aR.b.nz(.5 * fX), aR.b.g1(this.a77.b7, 6), aOV.button.style.left = aR.b.nz(aKX), aOV.button.style.width = aR.b.nz(aOc - aKX), .385 * fX);
    cA.hg.hh() && (sI *= .8 - .12 * (d9.aO > d9.dA)), aOR.style.marginLeft = aOR.style.marginRight = aR.b.nz(.5 * sI), aOR.style.fontSize = aR.b.nz(sI), aLU(1);
  }, (self = this).a77.b7.xb = 127, aOQ.style.position = "absolute", aOQ.style.left = "0", aOQ.style.width = "100%", aOQ.style.overflowX = "hidden", aOQ.style.overflowY = "auto", aOQ.style.font = "inherit", aOQ.style.backgroundColor = bG.a90, aOQ.addEventListener("scroll", function () {
    aOX = aOQ.scrollTop, aLS = aOX < aOQ.scrollHeight - aOQ.clientHeight - 2 ? 0 : 1;
  }), aOR.style.font = "inherit", aJO.style.position = "absolute", aJO.style.left = "0", aJO.style.width = "100%", self.a77.b7.setAttribute("placeholder", L(292)), self.a77.b7.style.position = "absolute", self.a77.b7.style.top = "0", self.a77.b7.style.left = "0", self.a77.b7.style.height = "100%", self.a77.b7.style.backgroundColor = bG.uQ, self.a77.b7.style.textAlign = "center", (aOV = new ap(L(7), aOT)).button.top = "0", aOV.button.style.position = "absolute", aOV.button.style.height = "100%", aOV.bF(bG.aFq), aOS = new a6Q("127", aOV.button, 1, 1), aOQ.appendChild(aOR), aJO.appendChild(self.a77.b7), aJO.appendChild(aOV.button);
}
function aNP() {
  this.aGJ = !1, this.f1 = function () {
    dy.f2() % 250 != 249 || ct.mH || (aF.lk.c4(+(this.aGJ && d3.eF[ct.eG]), eI.eJ + h0.b1.ka), this.aGJ = !1);
  };
}
function vN() {
  aJt = 0, aOf = 2048, aKA = new Uint32Array(4 * aOf), aOg = 0, aOh = new Uint32Array(aOf), aOi = new Uint8Array(fU.fV * fU.iD);
}
function aEZ(player) {
  aJq = player, aJp = !1, aOj(), aOk();
  for (var aN = lA.a9G(aJq) - 1; 0 <= aN; aN--) aJr = aN, aOl();
  aJp && aOm();
}
function aOm() {
  kl.aOn(), kl.aOo();
}
function aOl() {
  aJf = lA.a9N(aJq, aJr), aJs = lA.a9O(aJq, aJr), aK7 = lA.aHc(aJq, aJr), aOp(), (0 !== aJt && (aOq(), aOr()) ? aJc : aJh)();
}
function aOr() {
  if (!((aK5 = he.iA(aJs, aJt)) > ct.uo)) {
    if (!aK7) return !1;
    var aOs = aJt * (1 + ct.uo);
    aJs += aR.f.aK8(aJq, aOs - aJs), aK5 = he.iA(aJs, aJt);
  }
  return !0;
}
function aOq() {
  for (var aN = aJt - 1; 0 <= aN; aN--) aOi[he.iA(aKA[aN], 4)] = 0;
}
function aJh() {
  1 === lA.a9G(aJq) && gy.aEc(aJq);
  var eZ = aR.f.l7(aJq, aJs);
  hD.l6(aJq, aJs - eZ, 12), lA.aHZ(aJq, aJr);
}
function aOj() {
  for (var player = aJq, lD = d3.lD, aM = Math.min(lD[player].length, aOf), aL = 0, aOt = aOh, aN = aM - 1; 0 <= aN; aN--) aOt[aL++] = lD[player][aN];
  aOg = aL;
}
function aOk() {
  for (var aN = d3.lD[aJq].length - 1; 0 <= aN; aN--) d5.kr(d3.lD[aJq][aN]) && d5.a6H(d3.lD[aJq][aN], aJq);
  d3.lD[aJq] = [];
}
function aOp() {
  aJt = 0, (aJf === ct.cv ? aOu : aOv)();
}
function aOv() {
  for (var d1, s9, aN, aCW = d5.aCW, fS = 3; 0 <= fS; fS--) for (aN = aOg - 1; 0 <= aN; aN--) d1 = aOh[aN] + aCW[fS], s9 = he.iA(d1, 4), 0 === aOi[s9] && d5.l3(d1) && d5.hp(d1) === aJf && (aOi[s9] = 1, aKA[aJt++] = d1);
}
function aOu() {
  for (var d1, s9, aN, aCW = d5.aCW, fS = 3; 0 <= fS; fS--) for (aN = aOg - 1; 0 <= aN; aN--) d1 = aOh[aN] + aCW[fS], s9 = he.iA(d1, 4), 0 === aOi[s9] && d5.ho(d1) && (aOi[s9] = 1, aKA[aJt++] = d1);
}
function aOw() {
  function aP3(eT, aM, eU, nI, aP1, aO4) {
    if (!(eU < 1 || aP1 < eU)) for (var aN = 0; aN <= aM; aN++) {
      var fK = dr.iF(eT, eU);
      if (nI(fK)) return fK >> 2;
      eT += aO4;
    }
    return -1;
  }
  function aP7(eU, aM, eT, nI, aP0, aO4) {
    if (!(eT < 1 || aP0 < eT)) {
      aM = Math.max(aM, 0);
      for (var aN = 0; aN <= aM; aN++) {
        var fK = dr.iF(eT, eU);
        if (nI(fK)) return fK >> 2;
        eU += aO4;
      }
    }
    return -1;
  }
  function aPB(i4, i5, a8d) {
    return -1 !== i5 && (-1 === i4 || dr.i6(i5, a8d) < dr.i6(i4, a8d)) ? i5 : i4;
  }
  this.aOx = function (a8d) {
    return this.z(a8d, function (fK) {
      return d5.kr(fK);
    });
  }, this.aOy = function (a8d) {
    return this.z(a8d, function (fK) {
      return d5.aL8(fK, ct.eG);
    });
  }, this.z = function (a8d, nI) {
    return function (a8d, a4f, nI) {
      for (var hr = dr.ht(a8d), hs = dr.hu(a8d), aP0 = fU.fV - 2, aP1 = fU.iD - 2, aP2 = -1, fS = 0; fS < a4f; fS++) {
        var aMO = Math.max(hr - fS, 1),
          aMP = Math.max(hs - fS, 1),
          aMQ = Math.min(hr + fS, aP0),
          aMH = Math.min(hs + fS, aP1),
          i4 = aP3(hr, aMQ - hr, hs - fS, nI, aP1, 1),
          i5 = aP3(hr - 1, hr - aMO - 1, hs - fS, nI, aP1, -1),
          aMQ = aP3(hr, aMQ - hr, hs + fS, nI, aP1, 1),
          aMO = aP3(hr - 1, hr - aMO - 1, hs + fS, nI, aP1, -1),
          aP6 = aP7(hs, aMH - hs - 1, hr - fS, nI, aP0, 1),
          aP8 = aP7(hs - 1, hs - aMP - 2, hr - fS, nI, aP0, -1),
          aMH = aP7(hs, aMH - hs - 1, hr + fS, nI, aP0, 1),
          aMP = aP7(hs - 1, hs - aMP - 2, hr + fS, nI, aP0, -1);
        if (aP2 = aPB(aP2, i4, a8d), aP2 = aPB(aP2, i5, a8d), aP2 = aPB(aP2, aMQ, a8d), aP2 = aPB(aP2, aMO, a8d), aP2 = aPB(aP2, aP6, a8d), aP2 = aPB(aP2, aP8, a8d), aP2 = aPB(aP2, aMH, a8d), 0 <= (aP2 = aPB(aP2, aMP, a8d)) && fS * fS >= dr.i6(aP2, a8d)) return aP2;
      }
      return -1;
    }(a8d, dr.hd(), nI);
  };
}
function w8() {
  var am, an, aw;
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(293), [new ap("⬅️ " + L(1), function () {
    aq.fu(7, aq.wU(7).mB);
  }), new ap(L(294), function () {
    b6.bJ.bK(105, aZ.aa.a2x(an.a0e[0].aPD[0].b7.value, 5)), b6.bJ.bK(106, aZ.aa.a2x(an.a0e[1].aPD[0].b7.value, 15)), aq.fu(8, aq.wU(7).mB, new fw(18));
  })]), an = new at(am.au, ((aw = []).push(function () {
    var ay = new az();
    return ay.b3(L(175)), ay.b8(new b5({
      value: "",
      af: -1
    })), ay;
  }()), aw.push(function () {
    var ay = new az(),
      aPH = (ay.b3(L(295)), new b5({
        value: "",
        af: -1
      }));
    return aPH.b7.type = "password", ay.b8(aPH), ay.b8(new bL([new ap(L(296), function (b7) {
      return b7.textContent === L(296) ? (b7.textContent = L(297), aPH.b7.type = "text") : (b7.textContent = L(296), aPH.b7.type = "password"), !0;
    }).button])), ay;
  }()), aw.push(function () {
    var ay = new az();
    return ay.b3(L(298)), ay.bR(L(299)), ay.bR(L(300)), ay.bR(L(301)), ay;
  }()), aw));
}
function aPI() {
  this.n9 = function () {
    var aPL;
    return !(eI.eJ < 3 || d3.d4[iw[0]] >= ct.kB >> 1) && (ct.il ? 9 !== ct.cu && (aPL = gw.a3u(), !(2 * gw.a3v(hE.iu()) >= aPL)) : function () {
      if (8 === ct.cu) return !1;
      var aPL = gw.a3u();
      if (2 * d3.dL[iw[0]] >= aPL) return !1;
      return !0;
    }());
  };
}
function aPN() {
  function aPP(hr, dt, dw) {
    for (var fO = Math.min(dt, dw), fN = Math.max(dt, dw), eU = fO + 1; eU < fN; eU++) if (!d5.hl(dr.iF(hr, eU))) return;
    return 1;
  }
  function aPQ(hs, dq, dv) {
    for (var fO = Math.min(dq, dv), fN = Math.max(dq, dv), eT = fO + 1; eT < fN; eT++) if (!d5.hl(dr.iF(eT, hs))) return;
    return 1;
  }
  function aPR(dq, dt, dv, dw, gb, gc) {
    for (var aM = Math.min(Math.abs(dv - dq), Math.abs(dw - dt)), df = Math.sign(dv - dq), dg = Math.sign(dw - dt), aN = 0; aN < aM; aN++) if (!d5.hl(dr.iF(dq += df, dt += dg))) return null;
    return dq === dv ? aPP(dq, dt, dw) ? new Uint32Array([gb, dr.iE(dq, dt), gc]) : null : aPQ(dt, dq, dv) ? new Uint32Array([gb, dr.iE(dq, dt), gc]) : null;
  }
  this.ot = function (gb, gc) {
    gb = function (gb, gc) {
      var dq = dr.ht(gb),
        dt = dr.hu(gb),
        dv = dr.ht(gc),
        dw = dr.hu(gc);
      if (dq === dv) {
        if (aPP(dq, dt, dw)) return new Uint32Array([gb, gc]);
      } else {
        if (dt !== dw) return aPR(dq, dt, dv, dw, gb, gc) || aPR(dv, dw, dq, dt, gb, gc);
        if (aPQ(dt, dq, dv)) return new Uint32Array([gb, gc]);
      }
      return null;
    }(gb, gc);
    return null === gb ? -1 : h0.gd.gp(gb);
  };
}
function aPS() {
  function aP3(eT, aM, eU, aPU, aP1, aO4, player) {
    if (!(eU < 1 || aP1 < eU)) for (var aN = 0; aN <= aM; aN++) {
      var fK = dr.iF(eT, eU);
      if (h0.nd.a4N(fK) && !aR.d.has(aPU, d5.hm(fK)) && d5.aL7(fK, player)) return fK >> 2;
      eT += aO4;
    }
    return -1;
  }
  function aP7(eU, aM, eT, aPU, aP0, aO4, player) {
    if (!(eT < 1 || aP0 < eT)) {
      aM = Math.max(aM, 0);
      for (var aN = 0; aN <= aM; aN++) {
        var fK = dr.iF(eT, eU);
        if (h0.nd.a4N(fK) && !aR.d.has(aPU, d5.hm(fK)) && d5.aL7(fK, player)) return fK >> 2;
        eU += aO4;
      }
    }
    return -1;
  }
  function aPB(i4, i5, a8d) {
    return -1 !== i5 && (-1 === i4 || dr.i6(i5, a8d) < dr.i6(i4, a8d)) ? i5 : i4;
  }
  this.aPT = function (player, a8d) {
    if (h0.op.oq(player)) for (var a4f = dr.hd(), aPU = [];;) {
      var aPV = function (a8d, a4f, aPU, player) {
        for (var hr = dr.ht(a8d), hs = dr.hu(a8d), aP0 = fU.fV - 2, aP1 = fU.iD - 2, aP2 = -1, fS = 0; fS < a4f; fS++) {
          var aMO = Math.max(hr - fS, 1),
            aMP = Math.max(hs - fS, 1),
            aMQ = Math.min(hr + fS, aP0),
            aMH = Math.min(hs + fS, aP1),
            i4 = aP3(hr, aMQ - hr, hs - fS, aPU, aP1, 1, player),
            i5 = aP3(hr - 1, hr - aMO - 1, hs - fS, aPU, aP1, -1, player),
            aMQ = aP3(hr, aMQ - hr, hs + fS, aPU, aP1, 1, player),
            aMO = aP3(hr - 1, hr - aMO - 1, hs + fS, aPU, aP1, -1, player),
            aP6 = aP7(hs, aMH - hs - 1, hr - fS, aPU, aP0, 1, player),
            aP8 = aP7(hs - 1, hs - aMP - 2, hr - fS, aPU, aP0, -1, player),
            aMH = aP7(hs, aMH - hs - 1, hr + fS, aPU, aP0, 1, player),
            aMP = aP7(hs - 1, hs - aMP - 2, hr + fS, aPU, aP0, -1, player);
          if (aP2 = aPB(aP2, i4, a8d), aP2 = aPB(aP2, i5, a8d), aP2 = aPB(aP2, aMQ, a8d), aP2 = aPB(aP2, aMO, a8d), aP2 = aPB(aP2, aP6, a8d), aP2 = aPB(aP2, aP8, a8d), aP2 = aPB(aP2, aMH, a8d), 0 <= (aP2 = aPB(aP2, aMP, a8d)) && fS * fS >= dr.i6(aP2, a8d)) return aP2;
        }
        return -1;
      }(a8d, a4f, aPU, player);
      if (-1 === aPV) break;
      var id = d5.hm(dr.iI(aPV));
      if (h0.nd.a4A(player, id)) return !!function (player, aPV, a8d) {
        for (var iR = dr.iT(aPV, a8d), aN = 0; aN < 4; aN++) {
          var gm = dr.iQ(aPV, iR);
          if (d5.aL8(dr.iI(gm), player)) return k3.oo[6] = iR, 1;
          iR = (iR + 1) % 4;
        }
        return;
      }(player, aPV, a8d) && (k3.oo[7] = aPV, !0);
      aPU.push(id);
    }
    return !1;
  };
}
function L(value, aPY, a2T, aPZ) {
  var bS = "number" == typeof value ? ad.aPa[value] : value;
  if (a2T && ad.aPb() && (bS = a2T), !aPY) return aPZ ? bS.replace(new RegExp("\\s*\\{.*?\\}\\s*", "g"), " ").trim() : bS;
  for (var aM = aPY.length, aN = 0; aN < aM; aN++) for (var aQ = 0; aQ < 3; aQ++) bS = bS.replace("{" + (10 * aQ + aN) + "}", aPY[aN]);
  return bS;
}
function tc(aPc, aPd, aPe, wY) {
  var aMv = document.createElement("textarea"),
    aPf = (this.b7 = aMv, !0);
  function aPg() {
    aMv.select(), document.execCommand("copy");
  }
  this.resize = function () {
    aPd && aR.b.g1(aMv, 5);
  }, this.td = function (ws) {
    aMv.value = ws;
  }, this.tU = function () {
    return aMv.value;
  }, this.aMw = function () {
    aMv.select();
  }, this.clear = function () {
    aMv.value = "";
  }, this.aMx = function () {
    aPf && navigator.clipboard ? (aMv.select(), navigator.clipboard.writeText(aMv.value).catch(function () {
      aPf = !1, aPg();
    })) : aPg();
  }, aMv.setAttribute("id", "textArea" + aq.b1.a3C++), aMv.setAttribute("autocomplete", "off"), aPc && aMv.setAttribute("placeholder", aPc), aMv.style.top = "0", aMv.style.left = "0", aMv.style.width = "100%", aMv.style.height = "100%", aMv.style.userSelect = "none", aMv.style.outline = "none", aMv.style.resize = "none", aMv.style.border = "none", aMv.style.color = bG.bH, aMv.style.backgroundColor = bG.aDf, wY ? (aMv.style.fontSize = "1em", aMv.rows = 6, aMv.style.padding = "0.25em") : (aMv.style.padding = "0.45em", aMv.style.fontSize = "1.2em"), aPe && aMv.addEventListener("input", function (b7) {
    aPe(b7);
  }), aMv.addEventListener("focus", function () {
    d9.aII++;
  }), aMv.addEventListener("blur", function () {
    d9.aII--;
  });
}
function aL2(aQ, ex) {
  return 0 <= aQ ? he.iA(aQ, ex) : -he.iA(-aQ, ex);
}
function aH6(aY) {
  return aY * aY;
}
function lg(aQ, ex) {
  return ex < aQ ? aQ : ex;
}
function aIS(aQ, ex) {
  return aQ < ex ? aQ : ex;
}
function aB6(aQ, aY, ex) {
  return aY < aQ ? aQ : ex < aY ? ex : aY;
}
function aPh(aY, aM) {
  for (var bW = he.iA(aY + 1, 2), aN = 0; aN < aM; aN++) bW = he.iA(bW + he.iA(aY, bW), 2);
  return bW;
}
function a3o(aY, aM) {
  return aY < 1 ? 0 : aPh(aY, aM);
}
function aA9(e3, e6, g2, a3W, e8, e9, g3, aC6) {
  return !(e3 + g2 <= e8 || e6 + a3W <= e9 || e8 + g3 <= e3 || e9 + aC6 <= e6);
}
function aA3(e3, e6, g2, a3W, e8, e9, g3, aC6) {
  return e3 <= e8 && e6 <= e9 && e8 + g3 <= e3 + g2 && e9 + aC6 <= e6 + a3W;
}
function oU(aY) {
  return Math.floor(!!aY * (1 + Math.log2(aY + .5)));
}
function aPi() {
  var aPj;
  this.ro = null, this.aJJ = 0, this.r = function () {
    aPj = [], 9 === ct.cu && this.aPk();
  }, this.aPk = function () {
    this.ro = [0, 0, 0, 0, 0, 0];
    for (var aPl = [250, 226, 166, 148, 100, this.aJJ = 0, 0, 0], rA = [0, 8, 24, 30, 46, 70, 256, 333], aPm = [0, 0, 3, 9, 17, 25, 256, 179], dA = ct.dP, aN = 1; aN < aPl.length; aN++) if (dA <= rA[aN]) {
      this.aJJ = aPl[aN - 1] - he.iA((dA - rA[aN - 1]) * (aPl[aN - 1] - aPl[aN]), rA[aN] - rA[aN - 1]), this.ro[5] = aPm[aN - 1] - he.iA((dA - rA[aN - 1]) * (aPm[aN - 1] - aPm[aN]), rA[aN] - rA[aN - 1]), this.ro[0] = ct.cv - dA - this.aJJ - this.ro[5];
      break;
    }
    ct.qS = ct.cv - ct.dP, ct.data.numberTeams = (0 < ct.dP) + (0 < ct.qS), ct.data.playerCount = ct.rZ = ct.dP + ct.qS, ct.data.teamPlayerCount = new Uint16Array([0, 0, 0, 0, 0, 0, 0, ct.dP + this.aJJ, ct.qS - this.aJJ]), ct.v0.qv();
  }, this.aPn = function (player) {
    aPj.push({
      player: player,
      aL: 14 + iW.rU(20)
    });
  }, this.f1 = function () {
    if (9 === ct.cu) for (var aN = aPj.length - 1; 0 <= aN; aN--) --aPj[aN].aL <= 0 && (di.dU(aPj[aN].player, 0, da.db.aPp + da.db.aPq), aPj.splice(aN, 1));
  };
}
function wJ() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 === ct.data.playerNamesType && 1 === aR.d.aS(ct.data.playerNamesData).length && (ct.data.playerNamesType = 0), 2 !== ct.data.playerNamesType && (ct.data.playerNamesData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.playerNamesType && aR.d.xa(tN.tU(), ct.data.playerNamesData, 20);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(132), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(133), L(134), L(55)],
      value: ct.data.playerNamesType
    }, function (af) {
      tQ(), ct.data.playerNamesType = af, aq.fu(23);
    })), ay.b8(new aMl()), ay.b8(new aHh({
      value: ct.data.selectableName
    }, L(302), function (value) {
      ct.data.selectableName = value;
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay;
    2 === ct.data.playerNamesType && ((ay = new az()).b3("Data"), tN = new tc(0, 1, 0, 1), ct.data.playerNamesData && ct.data.playerNamesData.length === ct.cv || (ct.data.playerNamesData = new Array(ct.cv), ct.data.playerNamesData.fill("")), tN.td(aR.h.te(ct.data.playerNamesData, 1, '"')), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function wQ() {
  var tL, tM, aw;
  function aPx() {
    for (var colors = new Array(11), aN = 0; aN < 11; aN++) {
      var a6 = b6.buffer.data[163 + aN].value.split(",");
      colors[aN] = new Uint8Array(3);
      for (var aQ = 0; aQ < 3; aQ++) aQ < a6.length && (colors[aN][aQ] = Number(a6[aQ]));
    }
    return colors;
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(70), [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })]), tM = new at(tL.au, ((aw = []).push(function () {
    var ay = new az();
    return ay.b3(L(303)), ay.b0(aF.b1.b2("/wiki/propaganda"), "0.75em").style.marginBottom = "0.8em", ay.b0("<a href='https://tt-propagandio.vercel.app/' target='_blank'>Unofficial Propaganda Generator</a>", "0.75em"), ay;
  }()), aw.push(function () {
    var ay = new az(),
      ws = (ay.b3(L(304)), b6.buffer.data[174].value),
      bQ = ay.bR(ws.length + " / 180"),
      aPw = (bQ.style.textAlign = "center", new tc(0, 1, function (b7) {
        var b7 = b7.target.value,
          aL = b7.length;
        bQ.textContent = aL + " / 180", aL <= 180 && b6.bJ.bK(174, b7);
      }));
    return aPw.b7.rows = 6, aPw.b7.style.fontSize = "1em", aPw.td(ws), ay.b8(aPw), ay;
  }()), aw.push(function () {
    var ay = new az();
    ay.b3(L(129));
    for (var aN = 0; aN < 11; aN++) {
      var hy = ay.b8(new b5(b6.buffer.data[163 + aN]));
      aN && (hy.b7.style.marginTop = "0.6em");
    }
    return ay.b8(new bL([new ap(L(258), function () {
      for (var data = b6.buffer.data, aN = 163; aN < 174; aN++) data[aN] && b6.buffer.a9p(aN, data[aN].a2T);
      aq.ar(), aq.tS()[31] = null, aq.fu(31);
    }).button])), ay;
  }()), aw.push(function () {
    var ay = new az();
    return ay.b3("Targeting"), ay.b0(L(259)), ay.b8(new b5(b6.buffer.data[175], 0, 0)), ay;
  }()), aw.push(function () {
    var ay = new az();
    return ay.b3(L(279)), ay.b8(new bL([new ap(L(296), function () {
      new a3K().show(b6.buffer.data[174].value, aPx(), -1);
    }).button])), ay;
  }()), aw.push(function () {
    var ay = new az(),
      aPy = (ay.b3(L(305)), ay.b0(L(306)), new b5(b6.buffer.data[176], 1, 0)),
      aPz = (ay.b8(aPy), new ap(L(307), function (b7) {
        return bD.button.textContent === L(6) && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.aMW(b6.buffer.data[176].value, aPx(), b6.buffer.data[175].value, b6.buffer.data[174].value)), !0;
      }, 1)),
      bC = function () {
        bD.button.textContent = L(5), aPz.bF(1), aPz.button.style.color = bG.bH;
      },
      bD = new ap(L(5), function (b7) {
        return b7.textContent === L(5) ? (b7.textContent = L(6), aPz.bF(0), aPz.button.style.color = bG.bI) : bC(), !0;
      });
    return ay.b8(new bL([bD.button, aPz.button])), ay;
  }()), aw));
}
function wI() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 !== ct.data.aIncomeType && (ct.data.aIncomeData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.aIncomeType ? (aR.d.tT(tN.tU(), ct.data.aIncomeData, 255), aR.d.max(ct.data.aIncomeData) || (ct.data.aIncomeType = 0)) : 1 !== ct.data.aIncomeType || ct.data.aIncomeValue || (ct.data.aIncomeType = 0);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(135), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(136), L(52), L(55)],
      value: ct.data.aIncomeType
    }, function (af) {
      tQ(), 2 !== af || ct.data.aIncomeData || (ct.data.aIncomeData = new Uint8Array(ct.cv)), ct.data.aIncomeType = af, aq.fu(22);
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay;
    1 === ct.data.aIncomeType && ((ay = new az()).b3("Value"), ay.b8(new b5({
      af: -1,
      value: ct.data.aIncomeValue
    }, 1, 0, function (b7) {
      var value = he.hf(Math.floor(b7.target.value), 0, 255);
      b7.target.value = ct.data.aIncomeValue = value;
    })), aw.push(ay));
  }(aw), function (aw) {
    var ay;
    2 === ct.data.aIncomeType && ((ay = new az()).b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.aIncomeData, 4)), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function aNT() {
  this.aBf = function (bb, bk) {
    ft.r(bk), 0 === ft.size ? aF.b1.a2K(bb, 3205) : ((0 === ft.bg(1) ? function (bb) {
      var aQ2 = ft.bg(6);
      0 === aQ2 ? function (bb) {
        if (0 === bb && 8 !== jE.jF()) {
          aq.b1.a3E();
          for (var aQ8 = ft.bg(12), aQ9 = ft.bg(6), a6 = new Array(aQ8), aN = 0; aN < aQ8; aN++) a6[aN] = ft.bg(aQ9);
          uF.aQA(a6);
        }
      }(bb) : 2 === aQ2 ? aF.aNU.jD(bb) : 3 === aQ2 || 4 === aQ2 ? hO.r() : 5 === aQ2 ? aF.aNV.a22() : 9 === aQ2 ? aF.aNV.a26(bb) : 10 === aQ2 ? aF.aNW.aQ4() : 11 === aQ2 ? aF.aNV.a2B(bb) : 12 === aQ2 ? aF.aNW.aQ5() : 13 === aQ2 ? aF.aNY.aQ6() : 14 === aQ2 ? aF.aNY.aQ7() : 15 === aQ2 ? aF.aNV.a2H() : 16 === aQ2 ? aF.aNU.jU(bb) : 17 === aQ2 ? aF.aNU.jj(bb) : 19 === aQ2 ? aF.aNU.jt(bb) : 20 === aQ2 ? aF.aNV.a23(bb) : 21 !== aQ2 && 22 !== aQ2 && 23 === aQ2 && aF.aNV.a2N(bb);
    } : function (bb) {
      if (8 !== jE.jF() && !hO.aQB()) return;
      if (bb !== aF.b1.c7) aF.b1.a2K(bb, 3244);else if (0 === ft.bg(1)) dy.aEP.gB(ft.bk);else {
        var aN,
          bb = ft.bg(2);
        if (0 === bb) {
          var ek,
            a2A = ft.bg(9);
          0 !== d3.eF[a2A] && 0 !== d3.eF[ct.eG] && (ek = ft.bg(10), fA.aKe(a2A, ct.eG, ek), di.dU(a2A, 1, ek));
        } else if (1 === bb) !function () {
          var a2A = ft.bg(9);
          0 !== d3.eF[a2A] && 0 !== d3.eF[ct.eG] && hA.aCm(0, [a2A], !0) && fA.aQH(a2A, 1);
        }();else if (2 === bb) !function () {
          var a2A = ft.bg(9),
            target = ft.bg(9);
          0 !== d3.eF[a2A] && 0 !== d3.eF[target] && 0 !== d3.eF[ct.eG] && hA.aCm(1, [a2A], !0) && (di.dU(a2A, 3, 96), di.dU(target, 4, 96), fA.aQI(a2A, target));
        }();else if (c8.cC && !c8.cD) {
          var aM = 540;
          for (bc.bd(17287), bc.bh(1, 0), bc.bh(6, 10), aM = Math.min(gD.gE.vA.length, 540), aN = 0; aN < aM; aN++) bc.cK(32, gD.gE.vA[aN]);
          aF.b1.send(aF.b1.c7, bc.bk);
        }
      }
    })(bb), dy.aET());
  };
}
function aQJ() {
  var aQK = 501,
    aQM = (this.aQL = new Uint32Array(aQK), this.lL = new Uint32Array(aQK), this.qr = new Uint16Array(aQK), this.zF = 0, 1),
    aDh = 0;
  function aQP(self) {
    self.max.fill(0);
  }
  function aQS(self, aN) {
    self.max[0] = Math.max(self.aQL[aN], self.max[0]), self.max[1] = Math.max(self.lL[aN], self.max[1]), self.max[2] = Math.max(self.qr[aN], self.max[2]);
  }
  this.max = [0, 0, 0], this.aQN = 0, this.a48 = new Array(21), this.aQO = null, this.mj = function () {
    this.aQO = [L(308), L(309), L(310), L(311), L(312), L(313), L(314), L(315), L(137), L(138), L(316), L(317), L(318), L(319), "", L(320), L(321), L(322), L(135), L(323), L(324)];
  }, this.r = function () {
    this.zF = 0, aQM = 1, this.aQN = 0, aDh = 0, aQP(this), this.a48.fill(0);
  }, this.oi = function (player, i9) {
    aR.f.aHd(player) && (this.a48[0] += i9 + 1, this.a48[1]++, this.a48[12] += k3.k4[1]);
  }, this.a3t = function (player, jy) {
    __fx.donationsTracker.logDonation(player, jy, k3.k4[0], gG.qf());
    player === ct.eG && (fA.a3t(k3.k4[0], k3.k4[1], jy), this.a48[12] += k3.k4[1], this.a48[16] += k3.k4[0]), jy === ct.eG && (fA.aQQ(k3.k4[0], player), this.a48[10] += k3.k4[0]);
  }, this.ou = function (player) {
    aR.f.aHd(player) && (this.a48[2]++, this.a48[12] += k3.k4[1]);
  }, this.pH = function (player) {
    aR.f.aHd(player) && (this.a48[19]++, this.a48[12] += k3.k4[1]);
  }, this.ky = function (player) {
    aR.f.aHd(player) && this.a48[20]++;
  }, this.l6 = function (player, a3O, af) {
    aR.f.aHd(player) && (this.a48[af] += a3O);
  }, this.f1 = function () {
    var self;
    this.aQN || 0 < aDh-- || ((self = this).aQL[self.zF] = d3.d4[ct.eG], self.lL[self.zF] = d3.dL[ct.eG], self.qr[self.zF] = gw.qs(ct.eG), aQS(self, self.zF), self.zF++, self.zF === aQK && function (self) {
      aQP(self), aQS(self, 0), self.zF = 1 + he.iA(aQK, 2);
      for (var aN = 1; aN < self.zF; aN++) self.aQL[aN] = self.aQL[2 * aN], self.lL[aN] = self.lL[2 * aN], self.qr[aN] = self.qr[2 * aN], aQS(self, aN);
      aQM *= 2;
    }(self), aDh = aQM - 1, vK.hQ(), 0 === d3.eF[ct.eG] && (self.aQN = dy.f2()));
  };
}
function aQU() {
  var a5v = 0,
    a5w = 0;
  this.aID = function (eT, eU) {
    a5v = eT, a5w = eU;
  }, this.aIJ = function (code) {
    var hr, hs, gm;
    ct.mH || my.mz || (aR.f.nW(0) || aR.f.nW(1)) && aR.f.kk(ct.eG) && (hB.mv(a5v, a5w) ? hB.a3Q = !1 : h7.mv(a5v, a5w) || (hr = dr.ds(a5v), hs = dr.du(a5w), gm = dr.iE(hr, hs), dr.iC(hr, hs) && (0 === code ? function (gm) {
      var aQY, fK, hk;
      ct.dO ? -1 !== (aQY = aQZ.aOx(gm)) && gD.n1.oW(gm) : (fK = dr.iI(gm), d5.aL6(fK) ? (aQY = pC.pD.aQa(fK)) && (hk = dr.iI(aQY), hk = d5.ho(hk) ? ct.cv : d5.hp(hk), gD.n1.pB(hB.k1(), aQY, hk)) : (aQY = aQZ.aOy(gm)) < 0 || (fK = dr.iI(aQY), d5.ho(fK) ? kl.aQb(ct.eG) ? gD.n1.oY(hB.k1(), ct.cv) : lA.a9G(ct.eG) && gt.aQc(ct.cv, hB.k1()) : (hk = d5.hp(fK), kl.km(hk, ct.eG) && (kl.aQd(ct.eG, hk) ? gD.n1.oY(hB.k1(), hk) : lA.a9G(ct.eG) && gt.aQc(hk, hB.k1())))));
    }(gm) : 1 === code ? function (gm) {
      h0.aQe.aPT(ct.eG, gm) && gD.n1.om(hB.k1(), k3.oo[7]);
    }(gm) : 2 === code && function (gm) {
      h0.p0.jx(ct.eG, gm) && gD.n1.oy(hB.k1());
    }(gm))));
  }, this.aIK = function () {
    if (!ct.mH && !my.mz && aR.f.nW(1)) {
      var d1 = ct.eG;
      if (aR.f.kk(d1)) {
        var aM = lA.a9G(d1);
        if (aM < 1) !function () {
          var d1 = ct.eG;
          if (kl.aQb(d1)) gD.n1.oY(hB.k1(), ct.cv);else for (var aCW = d5.aCW, aGp = d3.aGp, aM = aGp[d1].length, aCQ = Math.floor(Math.random() * aM), aN = 0; aN < aM; aN++) for (var iR = 3; 0 <= iR; iR--) {
            var dZ = aGp[d1][(aN + aCQ) % aM] + aCW[iR];
            if (d5.l3(dZ)) {
              dZ = d5.hp(dZ);
              if (dZ !== d1 && (!ct.il || kl.km(d1, dZ))) return gD.n1.oY(hB.k1(), dZ);
            }
          }
        }();else {
          for (var aQg = 0, ki = lA.a9O(d1, 0), aN = 1; aN < aM; aN++) {
            var aGZ = lA.a9O(d1, aN);
            aGZ < ki && (ki = aGZ, aQg = aN);
          }
          gD.n1.oY(hB.k1(), lA.a9N(d1, aQg));
        }
      }
    }
  }, this.nZ = function () {
    if (!ct.mH && !my.mz && aR.f.kk(ct.eG) && aR.f.nW(1)) return hC.mg ? hC.mx(ct.eG) ? void gD.n1.n2(1) : void 0 : void (hC.nV(ct.eG) && gD.n1.nZ());
  };
}
function uv() {
  this.r = function () {
    8 === ct.cu && fA.aQh();
  }, this.aQi = function (aQj) {
    var elo = ct.data.elo,
      ud = (elo[aQj] - elo[1 - aQj]) / 10,
      ud = 8 / (1 + Math.pow(2, ud / 32)),
      ud = Math.floor(10 * ud + .5),
      aQl = elo[aQj] + ud,
      aQm = this.aQn(aQl),
      elo = this.aQn(elo[1 - aQj] - ud),
      ud = (0 === aQj ? fA.aQp(aQm, elo, ["rgba(10,140,10,0.75)", "rgba(140,10,10,0.75)"]) : fA.aQp(elo, aQm, ["rgba(140,10,10,0.75)", "rgba(10,140,10,0.75)"]), aQl * he.sqrt(aQl) >> 8),
      elo = ((1 + ct.ut) * ud / 100).toFixed(2);
    aQj === ct.eG ? fA.ip(640, L(325, [elo]), 40, 0, bG.bH, bG.iq, -1, !1) : fA.ip(640, L(326, [d3.dI[aQj], elo]), 40, 0, bG.bH, bG.iq, -1, !1);
  }, this.aQn = function (elo) {
    return 16e3 === (elo = he.hf(elo, 0, 16e3)) ? "Unknown" : (elo / 10).toFixed(1);
  };
}
function aQs() {
  var bW,
    dx = !1,
    aQt = !1,
    aQu = -1e4,
    aQv = -1,
    aQw = 0;
  function resize(aR2) {
    bW = 0, dQ.t7() && (aQz(aR2) || dx) && (dx = !1, lS.resize(), aR3.aR4.resize(), u7.r(), uE.r(), mF.resize(), uF.resize(), tA.resize(), mT.resize(), aq.resize(), 1 <= ct.dX ? (h2.resize(!1), h6.resize(), gG.resize(), qA.resize(), hB.resize(), fA.resize(), my.resize(), hM.resize(), hC.resize(), h7.resize(), hK.resize(), eu.resize(), vK.resize(), di.resize(), hJ.resize(), hE.resize(), qA.qB()) : (jE.uC(), jE.uJ()), dy.gK = !0);
  }
  function aQy(aY) {
    return aY && 128 < aY ? Math.floor(aY) : 128;
  }
  function aQz(aR2) {
    var aO, dA, aR6, g2, a3W;
    if (!(0 < d9.aII)) return g2 = aQy(document.documentElement.clientWidth), a3W = aQy(window.visualViewport && 2 !== cA.id ? window.visualViewport.height : document.documentElement.clientHeight), aO = g2, dA = a3W, aR6 = 0 !== cA.id || aO < dA ? 700 : 1200, aR6 = Math.min(aR6 / ((aO + dA) / 2), 1), aR6 = 0 === b6.buffer.data[1].value ? 2 * aR6 / 3 : Math.min(aR6 + (b6.buffer.data[1].value - 1) * (1 - aR6) / 2, 1), d9.o5 = (window.devicePixelRatio || 1) * aR6, __fx.hoveringTooltip.canvasPixelScale = d9.o5, aR2 && !aQt ? (aQt = !0, aq.removeChild(document.body, pv)) : aQt && (aQt = !1, document.body.appendChild(pv)), aO = Math.floor(.5 + g2 * d9.o5), dA = Math.floor(.5 + a3W * d9.o5), aO !== d9.aO || dA !== d9.dA ? (d9.aO = aO, d9.dA = dA, d9.min = aIS(aO, dA), d9.max = lg(aO, dA), d9.dC = he.iA(aO + dA, 2), d9.aQx = aO / dA, pv.width = aO, pv.height = dA, pv.style.width = g2 + "px", pv.style.height = a3W + "px", aQv = dy.dz + 1e3, 1) : void 0;
  }
  this.aO = 0, this.dA = 0, this.min = 0, this.max = 0, this.dC = 0, this.aQx = 1, this.o5 = 1, this.aII = 0, this.mj = function () {
    this.aO = aQy(document.documentElement.clientWidth) + 2, this.dA = aQy(document.documentElement.clientHeight) + 2;
  }, this.r = function () {
    bW = 1, pv = document.getElementById("canvasA"), 2 === cA.id && (pv.style.webkitUserSelect = "none"), (dE = pv.getContext("2d", {
      alpha: !!__fx.makeMainMenuTransparent
    })).imageSmoothingEnabled = !1, aQz(0);
  }, this.f1 = function () {
    50 <= ++bW && resize(0), -1 === aQv || dy.dz < aQv || (aQw++, aQv = -1, dy.dz + 8e3 <= 2e3 * aQw ? console.log("error 3748") : cA.hg.setState(15));
  }, this.aR1 = function (ud) {
    dx = !0, resize(ud);
  }, this.aIL = function () {
    aQu + 1e3 > dy.dz || (aQu = dy.dz, resize(0));
  };
}
function aR8() {
  function aRA(key) {
    var aMz;
    return "undefined" == typeof URLSearchParams || (aMz = window.location.search, "string" != typeof (aMz = new URLSearchParams(aMz).get(key))) || aMz.length < 1 ? null : aZ.aa.a2x(aMz, 5);
  }
  this.jg = function () {
    if (0 !== cA.id) return !1;
    if (!function () {
      var value = aRA("account");
      if (!value && !(value = aRA("a"))) return void aRB.clear();
      return aRB.clear(), aq.fu(8, aq.fv, new fw(1e3, {
        action: 0,
        ah: value,
        fs: 0
      })), 1;
    }()) {
      var value = aRA("replay");
      if (!this.clear()) return !1;
      if (!value) return !1;
      aq.fu(3, 0, value);
    }
    return !0;
  }, this.clear = function () {
    var a9q = new URL(window.location.href);
    a9q.search = "";
    try {
      return history.replaceState(null, "", a9q.toString()), !0;
    } catch (b7) {
      console.log("error 352: " + b7);
    }
    return !1;
  }, this.aRD = function (key, value) {
    if (0 === cA.id) try {
      var a9q = new URL(window.location.href),
        d1 = a9q.searchParams;
      d1.set(key, value), a9q.search = d1.toString(), history.replaceState(null, "", a9q.toString());
    } catch (b7) {
      console.log("error 358: " + b7);
    }
  };
}
function bL(aRE) {
  var nx = document.createElement("div");
  this.b7 = nx, this.aRF = aRE, this.resize = function () {
    for (var aM = aRE.length, aN = 1; aN < aM; aN++) aR.b.g1(aRE[aN], 4);
  };
  var aN,
    aM = aRE.length;
  for (nx.style.width = "100%", nx.style.height = "2.7em", nx.style.marginTop = "0.6em", nx.style.border = "inherit", aN = 0; aN < aM; aN++) aRE[aN].style.verticalAlign = "top", aRE[aN].style.width = (100 / aM).toFixed(2) + "%", aRE[aN].style.height = "100%", aRE[aN].style.fontSize = "0.75em", nx.appendChild(aRE[aN]);
}
function aRG() {
  this.a24 = new aN7(), this.aLO = new a5g(), this.bf = new aRH();
}
function aEg() {
  this.bK = function (af, value) {
    2 !== b6.buffer.data[af].type && (value = Math.floor(value)), b6.buffer.data[af].value !== value && (b6.buffer.a9p(af, value), 0 === af ? (aq.mU(), ad.r(), aq.fu(2)) : 1 === af ? d9.aR1(1) : 2 === af ? d9.aR1(0) : 5 === af && (aR.b.s(), d9.aR1(0)));
  }, this.a9l = function () {
    for (var data = b6.buffer.data, aN = 0; aN < 100; aN++) data[aN] && b6.buffer.a9p(aN, data[aN].a2T);
    aR.b.s(), d9.aR1(1);
  }, this.a9m = function () {
    for (var data = b6.buffer.data, aN = 0; aN < data.length; aN++) data[aN] && b6.buffer.bK(aN, data[aN].a2T);
  }, this.mO = function () {
    for (var ex = b6.buffer, aN = 128; aN < 135; aN++) ex.a9p(aN, ex.data[aN].a2T);
  }, this.aRI = function (data) {
    b6.bJ.bK(109, data.fs), b6.bJ.bK(107, data.aRJ), b6.bJ.bK(108, data.aRK), b6.bJ.bK(112, data.aRL), b6.bJ.bK(111, data.aRM), b6.bJ.bK(113, data.aMX), b6.bJ.bK(135, data.aRN), b6.bJ.bK(136, data.aRO), b6.bJ.bK(137, data.aRP), b6.bJ.bK(138, data.aRQ), b6.bJ.bK(139, data.aRR), b6.bJ.bK(141, data.aRS), b6.bJ.bK(142, data.aRT), b6.bJ.bK(143, data.aRU), b6.bJ.bK(144, data.aRV);
  };
}
function aRW() {
  this.n1 = new aKc(), this.f = new aRX(), this.aKd = new oV(), this.gE = new aRY(), this.l8 = new a6d();
}
function q() {
  var aRZ = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  this.s7 = function (dz) {
    var aRa,
      bS = new Date(dz.getTime() - 6e4 * dz.getTimezoneOffset()).toUTCString();
    return bS.length < 12 || (bS = bS.substring(5, bS.length), 0 === (dz = dz.getTimezoneOffset())) ? bS : (aRa = (dz < 0 ? "+" : "-") + he.iA(Math.abs(dz), 60), 0 == (dz = Math.abs(dz) % 60) ? bS + aRa : bS + aRa + ":" + (dz < 10 ? "0" : "") + dz);
  }, this.sV = function (dz) {
    var bS = dz.toUTCString();
    return bS.length < 12 ? bS : function (dz) {
      return aRZ[dz.getUTCDay()];
    }(dz) + ", " + bS.substring(5, bS.length - 4);
  };
}
function aRc() {
  var aEm, aEn, aBC, a8n, aRd, aRe, aRf, aRg, aRh, aRi;
  function aRk() {
    var rZ = ct.rZ;
    for (aRh = rZ; aRh < ct.cv; aRh++) aRj();
    for (aRh = ct.dO ? ct.dP : 0; aRh < rZ; aRh++) {
      if (!aRn()) {
        for (var ex = ct.up = aRh; ex < rZ; ex++) aRh = ex, aRj();
        return;
      }
      aRo(aRe + aEm * aRd + he.iA(aRd, 2), aRf + aEn * aRd + he.iA(aRd, 2));
    }
  }
  function aS7(player) {
    for (var dM = d3.dM, dN = d3.dN, dS = d3.dS, dT = d3.dT, eU = dN[player]; eU <= dT[player]; eU++) for (var eT = dM[player]; eT <= dS[player]; eT++) {
      var fK = d5.a6D(eT, eU);
      d5.l3(fK) && (d5.a6G(fK) ? d5.a6H(fK, player) : d5.a6I(fK, player));
    }
  }
  function aS6(a6, pL, pM) {
    var eZ = a6[pL];
    a6[pL] = a6[pM], a6[pM] = eZ;
  }
  function aRn() {
    return function () {
      var aN;
      for (aN = 0; aN < 8; aN++) if (aEm = he.iA(aBC * iW.random(), iW.value(100)), aEn = he.iA(a8n * iW.random(), iW.value(100)), aSC()) return 1;
      return;
    }() || function () {
      var df, dg, aQ, ee, ex, ed;
      for (df = he.iA(aBC * iW.random(), iW.value(100)), dg = he.iA(a8n * iW.random(), iW.value(100)), aQ = 40; 1 <= aQ; aQ--) for (ee = a8n - aQ; 0 <= ee; ee -= 40) for (aEn = (ee + dg) % a8n, ex = 40; 1 <= ex; ex--) for (ed = aBC - ex; 0 <= ed; ed -= 40) if (aEm = (ed + df) % aBC, aSC()) return 1;
      return;
    }();
  }
  function aSC() {
    for (var d1, aSE, gap = he.iA(aRd - aRg, 2), aMH = aRf + aEn * aRd + gap, aMQ = aRe + aEm * aRd + gap, aSD = aMH + aRg - 1; aMH <= aSD; aSD--) for (aSE = aMQ + aRg - 1; aMQ <= aSE; aSE--) if (d1 = d5.a6D(aSE, aSD), !d5.kr(d1) || d5.a6G(d1)) return;
    return 1;
  }
  function aRo(ed, ee) {
    aRj(), aSF(ed - 2, ee - 2);
  }
  function aRj() {
    d3.eF[aRh] = 0, d3.d4[aRh] = d3.a7x[aRh] = 0, d3.lD[aRh] = [], d3.aGp[aRh] = [], d3.kn[aRh] = [], d3.aJk[aRh] = [], d3.dM[aRh] = d3.dN[aRh] = d3.dS[aRh] = d3.dT[aRh] = 0;
  }
  function aSF(ed, ee) {
    var d1, aN, aSG, aSH;
    for (d3.eF[aRh] = 1, d3.dM[aRh] = ed + 10, d3.dN[aRh] = ee + 10, d3.dT[aRh] = d3.dS[aRh] = 0, aSG = ed; aSG < ed + 4; aSG++) for (aSH = ee; aSH < ee + 4; aSH++) (ed < aSG && aSG < ed + 3 || ee < aSH && aSH < ee + 3) && (d1 = d5.a6D(aSG, aSH), d5.kr(d1)) && (d3.dM[aRh] = Math.min(aSG, d3.dM[aRh]), d3.dS[aRh] = Math.max(aSG, d3.dS[aRh]), d3.dN[aRh] = Math.min(aSH, d3.dN[aRh]), d3.dT[aRh] = Math.max(aSH, d3.dT[aRh]), aRi[d3.d4[aRh]] = d1, d3.d4[aRh]++, d5.a6I(d1, aRh));
    for (d3.a7x[aRh] = d3.d4[aRh], aN = d3.d4[aRh] - 1; 0 <= aN; aN--) d5.aL7(aRi[aN], aRh) ? (d5.a6H(aRi[aN], aRh), d3.aGp[aRh].push(aRi[aN])) : d5.aLD(aRi[aN]) ? (d5.a6H(aRi[aN], aRh), d3.kn[aRh].push(aRi[aN])) : d5.aL3(aRi[aN]) && (d5.a6H(aRi[aN], aRh), d3.aJk[aRh].push(aRi[aN]));
  }
  this.r = function () {
    if (aRi = new Array(12), aRg = 6, aRd = 10, aBC = he.iA(fU.fV, aRd), a8n = he.iA(fU.iD, aRd), aRe = he.iA(fU.fV - aRd * aBC, 2), aRf = he.iA(fU.iD - aRd * a8n, 2), ct.dO) for (var aN = 0; aN < ct.dP; aN++) aRh = aN, aRj(), d3.eF[aRh] = 1;
    (0 === ct.data.spawningType ? aRk : 1 === ct.data.spawningType ? (aRk(), function () {
      var rn = ct.rk;
      ct.rm || rn++;
      if (!(rn < 3)) {
        for (var data = ct.data, fO = (ct.dO ? ct.dP : 0) + data.teamPlayerCount[0], fN = ct.up, aRp = new Uint32Array(rn), aRq = new Uint32Array(rn), aRr = new Uint16Array(rn), aRs = new Uint16Array(rn), iy = ey.iy, dM = d3.dM, dN = d3.dN, dS = d3.dS, dT = d3.dT, aRt = k3.aRt, aRu = k3.aRu, aN = fO; aN < fN; aN++) aRt[aN] = dM[aN] + dS[aN] >> 1, aRu[aN] = dN[aN] + dT[aN] >> 1;
        for (aN = fO; aN < fN; aN++) {
          var id = iy[aN];
          aRp[id] += aRt[aN], aRq[id] += aRu[aN];
        }
        var iv = ey.iv;
        for (aN = 1; aN < rn; aN++) {
          var aL = Math.max(data.teamPlayerCount[iv[aN]], 1);
          aRr[aN] = he.iA(aRp[aN], aL), aRs[aN] = he.iA(aRq[aN], aL);
        }
        var rF = ey.rF,
          rG = ey.rG,
          rH = ey.rH,
          a59 = k3.a59;
        for (aN = 0; aN < 512; aN++) a59[aN] = aN;
        for (var uW = 0; uW < 2 + (4 <= rn); uW++) for (aN = fO; aN < fN; aN++) {
          for (var g4 = aN, aNM = a59[g4], aRv = 1, rW = he.q3(aRt[aNM] - aRr[1], aRu[aNM] - aRs[1]), aQ = 2; aQ < rn; aQ++) {
            var a96 = he.q3(aRt[aNM] - aRr[aQ], aRu[aNM] - aRs[aQ]);
            a96 < rW && (rW = a96, aRv = aQ);
          }
          var aRw = iy[g4];
          if (aRv !== aRw) {
            if (2 === uW && 4 <= rn) {
              var aRx = Math.max((aRv + 1) % rn, 1),
                aRy = he.q3(aRt[aNM] - aRr[aRx], aRu[aNM] - aRs[aRx]);
              for (aQ = 1; aQ < rn; aQ++) a96 = he.q3(aRt[aNM] - aRr[aQ], aRu[aNM] - aRs[aQ]), rW < a96 && a96 < aRy && (aRy = a96, aRx = aQ);
              aRx !== aRw && he.q3(aRr[aRw] - aRr[aRx], aRs[aRw] - aRs[aRx]) < he.q3(aRr[aRw] - aRr[aRv], aRs[aRw] - aRs[aRv]) && (aRv = aRx);
            }
            var aRz = iv[aRv],
              aS0 = rG[aRz] + (ct.dO ? 0 : rH[aRz]),
              gi = rF[aS0],
              aNN = a59[gi],
              aS1 = rG[aRz + 1];
            rW = he.q3(aRt[aNN] - aRr[aRw], aRu[aNN] - aRs[aRw]);
            for (var bW = aS0 + 1; bW < aS1; bW++) {
              var aS2 = rF[bW],
                aS3 = a59[aS2];
              (a96 = he.q3(aRt[aS3] - aRr[aRw], aRu[aS3] - aRs[aRw])) < rW && (rW = a96, gi = aS2);
            }
            gi < fO || fN <= gi || (aNN = a59[gi], aRp[aRw] += aRt[aNN] - aRt[aNM], aRq[aRw] += aRu[aNN] - aRu[aNM], aRp[aRv] += aRt[aNM] - aRt[aNN], aRq[aRv] += aRu[aNM] - aRu[aNN], aL = data.teamPlayerCount[iv[aRw]], aRr[aRw] = he.iA(aRp[aRw], aL), aRs[aRw] = he.iA(aRq[aRw], aL), aL = data.teamPlayerCount[aRz], aRr[aRv] = he.iA(aRp[aRv], aL), aRs[aRv] = he.iA(aRq[aRv], aL), a59[g4] = aNN, a59[gi] = aNM);
          }
        }
        !function () {
          for (var a59 = k3.a59, dM = d3.dM, dN = d3.dN, dS = d3.dS, dT = d3.dT, d4 = d3.d4, a7x = d3.a7x, aGp = d3.aGp, kn = d3.kn, aJk = d3.aJk, aN = 0; aN < 512; aN++) {
            var aS5 = a59[aN];
            if (aS5 !== aN) {
              aS6(dM, aN, aS5), aS6(dN, aN, aS5), aS6(dS, aN, aS5), aS6(dT, aN, aS5), aS6(d4, aN, aS5), aS6(a7x, aN, aS5), aS6(aGp, aN, aS5), aS6(kn, aN, aS5), aS6(aJk, aN, aS5), aS7(aN), aS7(aS5), a59[aN] = aN;
              for (var dA = aS5, s9 = a59[dA]; s9 !== aN;) s9 = a59[dA = s9];
              a59[dA] = aS5;
            }
          }
        }();
      }
    }) : function () {
      var rZ = ct.rZ;
      for (aRh = rZ; aRh < ct.cv; aRh++) aRj();
      for (aRh = ct.dO ? ct.dP : 0; aRh < rZ; aRh++) if (!function () {
        var spawningData = ct.data.spawningData,
          ed = spawningData[2 * aRh] + 1,
          spawningData = spawningData[2 * aRh + 1] + 1;
        if (3 < ed && ed < fU.fV - 5 && 3 < spawningData && spawningData < fU.iD - 5 && d5.kr(d5.a6D(ed, spawningData)) && function (ed, ee) {
          var d1, aSE, aSD;
          for (aSD = ee; ee - 6 < aSD; aSD--) for (aSE = ed; ed - 6 < aSE; aSE--) if (d1 = d5.a6D(aSE, aSD), d5.a6G(d1)) return;
          return 1;
        }(ed + 3, spawningData + 3)) return aRo(ed + 1, spawningData + 1), 1;
        return;
      }()) {
        if (!aRn()) {
          for (var ex = ct.up = aRh; ex < rZ; ex++) aRh = ex, aRj();
          return;
        }
        var ed = aRe + aEm * aRd + he.iA(aRd, 2),
          ee = aRf + aEn * aRd + he.iA(aRd, 2);
        aRo(ed, ee);
      }
    })(), hD.a48[7] = d3.d4[ct.eG];
  }, this.aSI = function (l5, sR, sQ) {
    var aN, ed, ee, d1, aEm, aEn;
    for (aRh = l5, aN = 0; aN < 20; aN++) for (ed = sR + aN; sR - aN <= ed; ed--) for (ee = sQ + aN; sQ - aN <= ee; ee--) if ((ed === sR + aN || ed === sR - aN || ee === sQ + aN || ee === sQ - aN) && 3 < ed && ed < fU.fV - 5 && 3 < ee && ee < fU.iD - 5 && d5.kr(d5.a6D(ed, ee)) && function (ed, ee) {
      var d1, aSE, aSD;
      for (aSD = ee; ee - 6 < aSD; aSD--) for (aSE = ed; ed - 6 < aSE; aSE--) if (d1 = d5.a6D(aSE, aSD), d5.a6G(d1) && !d5.l4(aRh, d1)) return;
      return 1;
    }(ed + 3, ee + 3)) {
      if (0 < d3.d4[aRh]) {
        for (aEn = aEm = d1 = void 0, aEm = d3.dS[aRh]; aEm >= d3.dM[aRh]; aEm--) for (aEn = d3.dT[aRh]; aEn >= d3.dN[aRh]; aEn--) d1 = 4 * (aEn * fU.fV + aEm), d5.fT(aRh, d1) && (d5.aLF(d1), d3.d4[aRh]--);
        aRj();
      }
      return aSF(ed - 1, ee - 1), !0;
    }
    return !1;
  }, this.aSL = function (l5) {
    aRh = l5, aRn() ? aRo(aRe + aEm * aRd + he.iA(aRd, 2), aRf + aEn * aRd + he.iA(aRd, 2)) : aRj();
  };
}
function ao(title, uk, aSM) {
  var sn = document.createElement("div"),
    aSN = document.createElement("div"),
    fc = document.createElement("div"),
    aSO = document.createElement("div"),
    aSP = document.createElement("div");
  this.au = fc, this.bX = uk, this.show = function () {
    !1 !== aSM ? document.body.appendChild(sn) : (document.body.appendChild(aSN), document.body.appendChild(aSO));
  }, this.bU = function () {
    !1 !== aSM ? aq.removeChild(document.body, sn) : (aq.removeChild(document.body, aSN), aq.removeChild(document.body, aSO));
  }, this.sF = function () {
    var sI = aR.b.tJ(.1),
      aOb = aR.b.tJ(.08 + .04 * (d9.aQx < 1), .3);
    return {
      sI: sI,
      aOb: aOb,
      sH: d9.dA / d9.o5 - sI - aOb
    };
  }, this.resize = function (aJU) {
    var aM = uk.length,
      sE = this.sF(),
      sI = sE.sI,
      aOb = sE.aOb;
    for (aSN.style.height = aR.b.nz(sI), aR.b.g1(aSN, 2), aSO.style.top = aR.b.nz(d9.dA / d9.o5 - aOb), aSO.style.height = aR.b.nz(aOb), aR.b.g1(aSO, 8), fc.style.top = aR.b.nz(sI), fc.style.height = fc.style.maxHeight = aR.b.nz(sE.sH), aSN.style.font = aR.b.dF(0, aR.b.tJ(.02, .15)), aSO.style.font = aR.b.dF(0, aR.b.tJ(.02, .7)), fc.style.font = aR.b.dF(0, aR.b.tJ(.02, .35)), aN = 1; aN < aM; aN++) aR.b.g1(uk[aN].button, 4);
    for (var aJV = 0, aN = 0; aN < aM; aN++) aJV += uk[aN].button.offsetWidth;
    if (aJU && aJV < aSO.offsetWidth) for (aN = 0; aN < aM; aN++) uk[aN].button.style.width = (100 * uk[aN].button.offsetWidth / aJV).toFixed(2) + "%";else for (aN = 0; aN < aM; aN++) uk[aN].button.style.width = "auto";
    aSO.t8 && (aSO.scrollLeft = aSO.t8), aJU || this.resize(!0);
  }, this.dd = function () {
    var sE = this.sF(),
      bW = d9.o5;
    dE.fillStyle = bG.su, dE.fillRect(0, bW * sE.sI, d9.aO, bW * sE.sH);
  }, sn.style.position = "absolute", sn.style.top = "0", sn.style.left = "0", sn.style.width = "100%", sn.style.height = "100%", aSN.style.position = "absolute", aSN.style.top = "0", aSN.style.left = "0", aSN.style.width = "100%", aSN.style.display = "flex", aSN.style.backgroundColor = bG.su, aSO.style.position = "absolute", aSO.style.left = "0", aSO.style.width = "100%", aR.b.sv(aSO), aSP.style.height = aSP.style.maxHeight = "100%", fc.style.position = "absolute", fc.style.width = "100%", fc.style.backgroundColor = bG.su, function () {
    for (var aN = 0; aN < uk.length; aN++) uk[aN].button.style.height = "100%", uk[aN].button.style.padding = "0.0em 0.9em";
  }();
  for (var aN = 0; aN < uk.length; aN++) aSP.appendChild(uk[aN].button);
  aSN.appendChild(function () {
    var aSS = document.createElement("h1");
    return aSS.textContent = title, aSS.style.margin = "auto", aSS.style.fontSize = 18 <= title.length && d9.dA > d9.aO ? "1.8em" : "2.3em", aSS.style.fontFamily = "Arial Black, system-ui", aSS;
  }()), aSO.appendChild(aSP), !1 !== aSM && (sn.appendChild(fc), sn.appendChild(aSN), sn.appendChild(aSO));
}
function a2c() {
  this.f1 = function () {
    var aSY;
    2 === ct.uw ? (fA.aEv(0, 59), hI.aST(2700)) : ct.cu < 7 ? (aSY = ey.iv[ct.uz], aSY = ey.rB[aSY], hK.tt(L(327, [aSY]), 2, 1, 12), fA.ip(0, L(328, [aSY]), 40, 0, bG.bH, bG.iq, -1, !1), hI.aST(2700)) : 8 === ct.cu ? (ct.ux ? fA.aEv(ct.uy, 2) : fA.aEv(1 - ct.eG, 3), ct.uu.aQi(ct.uy), hI.aB9(ct.uy, 2700, !1, 0)) : 9 === ct.cu ? (fA.aSa(), hI.aST(2700)) : (fA.aSb(ct.uy), hI.aB9(ct.uy, 2700, !1, 0));
  }, this.aSc = function () {
    var bS;
    ct.mH || ct.kD || (bS = aF.b1.a5R(), ct.cu < 7 ? bS += "/log/team" : 8 === ct.cu ? bS += "/log/1v1" : 9 === ct.cu ? bS += "/log/zombies" : bS += "/log/br", fA.ip(720, bS, 736, 0, bG.bH, bG.t0, -1, !1));
  };
}
function k() {
  this.qZ = function (bS, font, maxWidth) {
    if (font && (dE.font = font), dE.measureText(bS).width <= maxWidth) return bS;
    for (var aN = bS.length - 1; 1 <= aN; aN--) if (bS = bS.substring(0, aN), dE.measureText(bS + "...").width <= maxWidth) return bS + "...";
    return "...";
  };
}
function aNX() {
  this.aQ4 = function () {
    b6.b1.j3(), b6.bJ.bK(105, bs.aa.fx(bs.aa.fy(5))), b6.bJ.bK(106, bs.aa.fx(bs.aa.fy(15))), b6.bJ.bK(109, 0), b6.bJ.bK(108, b6.buffer.data[109].value), b6.bJ.bK(111, b6.buffer.data[109].value + 1), b6.bJ.bK(107, 0), b6.bJ.bK(110, "");
  }, this.aQ5 = function () {
    var data;
    ft.size < bc.oD(29) ? aF.b1.a2K(0, 3254) : ((data = {
      fs: ft.bg(30),
      aRJ: ft.bg(16),
      aRK: ft.bg(30),
      aRL: ft.bg(30),
      aRM: ft.bg(30),
      aMX: ft.a2O(32),
      username: aZ.bt.jS(5),
      aRN: aZ.bt.jS(3),
      aRO: aZ.bt.jS(3),
      aRP: ft.a2O(32),
      aRQ: ft.a2O(32),
      aRR: ft.bg(30),
      aRS: ft.a2O(32),
      aRT: ft.a2O(32),
      aRU: ft.a2O(32),
      aRV: ft.a2O(32),
      aSe: ft.a2O(32),
      aSf: ft.a2O(30),
      aSg: ft.a2O(32),
      aSh: aZ.bt.jS(3),
      aSi: ft.a2O(2),
      aSj: ft.a2O(10),
      aSk: aZ.bt.jS(8),
      aSl: ft.a2O(5),
      aSm: ft.bg(30),
      aSn: ft.bg(30),
      aGQ: ft.a2O(32),
      aSo: ft.bg(3),
      aSp: ft.bg(8),
      aSq: ft.bg(30),
      aSr: ft.a2O(32),
      aSs: ft.bg(1),
      aSt: aZ.bt.jS(6),
      aSu: ft.bg(1),
      aSv: ft.bg(1),
      aSw: ft.bg(1),
      aSx: ft.bg(30),
      aSy: ft.bg(1),
      aSz: ft.bg(1)
    }).aSy && (data.aT0 = ft.a2O(32), data.aT1 = ft.bg(30), data.aT2 = ft.bg(30), data.aT3 = ft.bg(1)), 8 === aq.fv && (25 === aq.mA().aT4 ? (data.aT5 = !0, aq.b1.wD = data, aq.mA().a2G(25, !1)) : (data.aT5 = !1, b6.bJ.bK(160, +(data.aSy && data.aT3)), data.ah = b6.buffer.data[105].value, aq.b1.wA = data, b6.bJ.aRI(data), aq.mA().a2G(16, !0))));
  };
}
function gR() {
  vF.uL(), dE.setTransform(e5, 0, 0, e5, 0, 0), dE.imageSmoothingEnabled = e5 < 3, dE.drawImage(fU.uP, qA.aDT(), qA.mw()), h5.m0.dd(), dE.drawImage(a5D, qA.aDT(), qA.mw()), window.__TERRIX_HOOK_RENDER__ && window.__TERRIX_HOOK_RENDER__(dE, a5D, e5, qA.aDT(), qA.mw()), vF.dd(), h0.dd(), di.dd(), (ct.ur ? (hE.dd(), hM) : (fA.dd(), h2.dd(), hB.dd(), hM.dd(), hC.dd(), gG.dd(), qA.dd(), hK.dd(), hE.dd(), h6.dd(), h7.dd(), my.dd(), eu.dd(), hJ.dd(), vK.dd(), hL)).dd(), aq.dd();
}
function mn(j, aO, dA) {
  j.clearRect(0, 0, aO, dA), j.fillStyle = bG.iq, j.fillRect(0, 0, aO, dA);
}
function mq(j, aO, dA, mt) {
  j.fillStyle = bG.bH, j.fillRect(0, 0, aO, mt), j.fillRect(0, 0, mt, dA), j.fillRect(aO - mt, 0, mt, dA), j.fillRect(0, dA - mt, aO, mt);
}
function mu(j, eT, eU, el, mt, d1, aT6) {
  j.fillStyle = bG.bH;
  var d1 = Math.floor(el * d1),
    g3 = (d1 += (d1 - mt) % 2, Math.floor((d1 - mt) / 2)),
    el = Math.floor((el - d1) / 2);
  j.fillRect(eT + el, eU + el + g3, d1, mt), aT6 && j.fillRect(eT + el + g3, eU + el, mt, d1);
}
function a6Q(hS, hT, aT8, aT9) {
  var self;
  this.hX = document.createElement("span"), (self = this).hX.textContent = hS, self.hX.style.color = bG.bH, self.hX.style.position = "absolute", self.hX.style.font = "inherit", aT9 ? self.hX.style.bottom = "0.06em" : self.hX.style.top = "0.12em", aT8 ? self.hX.style.left = "0.2em" : self.hX.style.right = "0.2em", self.hX.style.fontSize = "0.6em", self.hX.style.pointerEvents = "none", self.hX.style.whiteSpace = "pre", hT.style.position = "relative", hT.style.overflow = "hidden", hT.appendChild(self.hX);
}
function aTA() {
  var aY,
    aO,
    dA,
    max,
    aTB,
    a1J,
    aTD,
    aTE,
    aTF,
    aTG,
    aTH,
    aTI,
    aTJ,
    aTK,
    aTC = 1e4;
  function aTR(aTQ, a1I, aM) {
    var aN;
    for (aTD[0] = aTQ, aN = 1; aN < aM; aN++) aTD[aN] = aTD[aN - 1] + a1I, a1I = aTD[aN] >= aTC ? (aTD[aN] = aTC - 1, -a1I) : aTD[aN] < 0 ? (aTD[aN] = 0, -a1I) : (a1I += 16384 <= iW.random() ? a1J : -a1J) < -aTB ? -aTB : aTB < a1I ? aTB : a1I;
  }
  function aTT(eT, eU, aTU, aM) {
    (aTU ? function (eT, eU, aM) {
      var aN;
      for (aN = 0; aN < aM; aN++) aY[eU * aO + eT + aN] = aTD[aN];
    } : function (eT, eU, aM) {
      var aN;
      for (aN = 0; aN < aM; aN++) aY[eU * aO + eT + aN * aO] = aTD[aN];
    })(eT, eU, aM);
  }
  function aTX(value, aM) {
    var aN,
      fP,
      fK,
      ud = value - aTD[aM - 1];
    if (0 != ud) {
      for (fP = 1 + he.iA(Math.abs(ud), aM - 1), fP = ud < 0 ? -fP : fP, aTD[aM - 1] = value, fK = (fK = aM - 1 - he.iA(Math.abs(ud), Math.abs(fP))) < 1 ? 1 : aM - 2 < fK ? aM - 2 : fK, aN = aM - 2; fK <= aN; aN--) aTD[aN] += ud - (aM - 1 - aN) * fP;
      (ud < 0 ? function (aM) {
        var aN;
        for (aN = aM - 2; 1 <= aN; aN--) aTD[aN] < 0 && (aTD[aN] = -aTD[aN] - 1);
      } : function (aM) {
        var aN;
        for (aN = aM - 2; 1 <= aN; aN--) aTD[aN] >= aTC && (aTD[aN] = 2 * aTC - aTD[aN] - 1);
      })(aM);
    }
  }
  function aTa(xV, xW, aM) {
    for (var aN = 0; aN < aM; aN++) xV[aN] = xW[aN];
  }
  function aTb(a6) {
    for (var aN = 0; aN < a6.length - 1; aN++) a6[aN] = a6[aN + 1] - a6[aN];
    a6[a6.length - 1] = a6[a6.length - 3];
  }
  function aTc(xm, gap, iR) {
    aTE.push(xm), aTF.push(gap), aTG.push(iR);
  }
  this.bd = function (lo) {
    !function (lo) {
      var aN;
      for (aO = lo[0], dA = lo[1], aTB = lo[2], a1J = lo[3], aY = new Int16Array(aO * dA), max = dA < aO ? aO : dA, aTD = new Int16Array(max), aTE = [], aTF = [], aTG = [], aTH = new Array(aO), aTI = new Array(dA), aN = aO - 1; 0 <= aN; aN--) aTH[aN] = !1;
      for (aN = dA - 1; 0 <= aN; aN--) aTI[aN] = !1;
      aTJ = new Int16Array(aO), aTK = new Int16Array(dA);
    }(lo), function (aM) {
      var aTQ = iW.random() % aTC,
        a1I = iW.random() % (2 * aTB + 1) - aTB;
      aTR(aTQ, a1I, aM);
    }(max), aTa(aTK, aTD, dA), aTT(0, 0, !0, aO);
    var eT,
      eU,
      lo = aY[0],
      aM = max,
      a1I = iW.random() % (2 * aTB + 1) - aTB;
    for (aTR(lo, a1I, aM), aTa(aTJ, aTD, aO), aTT(0, 0, !1, dA), aTb(aTJ), aTb(aTK), aTR(aY[aO - 1], aTJ[aO - 1], dA), aTT(aO - 1, 0, !1, dA), aTR(aY[aO * (dA - 1)], aTK[dA - 1], aO), aTX(aY[aO * dA - 1], aO), aTT(0, dA - 1, !0, aO), aTH[aO - 1] = aTH[0] = !0, aTI[dA - 1] = aTI[0] = !0, aTc(0, aO, !0), aTc(0, dA, !1), !function () {
      var aE8, xm;
      for (;;) {
        if (aE8 = function () {
          var aN,
            aE8 = aTE.length - 1;
          for (aN = aE8 - 1; 0 <= aN; aN--) aTF[aN] > aTF[aE8] && (aE8 = aN);
          return aE8;
        }(), aTF[aE8] < 5) return;
        xm = aTE[aE8] + he.iA(aTF[aE8], 2), (aTG[aE8] ? function (eT) {
          var aM,
            aTg,
            aN,
            yz = 0,
            aTh = 0;
          for (; aTh < dA - 1;) {
            for (aN = yz + 1; aN < dA; aN++) if (aTI[aN]) {
              aTh = aN;
              break;
            }
            aM = aTh - yz + 1, aTR(aY[eT + aO * yz], 0 === yz ? aTJ[eT] : aTD[aTg - 1] - aTD[aTg - 2], aM), aTX(aY[aTh * aO + eT], aM), aTT(eT, yz, !1, aM), aTg = aM, yz = aTh;
          }
          aTH[eT] = !0;
        } : function (eU) {
          var aM,
            aTg,
            aN,
            yz = 0,
            aTh = 0;
          for (; aTh < aO - 1;) {
            for (aN = yz + 1; aN < aO; aN++) if (aTH[aN]) {
              aTh = aN;
              break;
            }
            aM = aTh - yz + 1, aTR(aY[eU * aO + yz], 0 === yz ? aTK[eU] : aTD[aTg - 1] - aTD[aTg - 2], aM), aTX(aY[eU * aO + aTh], aM), aTT(yz, eU, !0, aM), aTg = aM, yz = aTh;
          }
          aTI[eU] = !0;
        })(xm), aTc(xm, aTE[aE8] + aTF[aE8] - xm, aTG[aE8]), aTF[aE8] = xm - aTE[aE8] + 1;
      }
    }(), eT = 0; eT < aO; eT++) if (!aTH[eT]) for (eU = 0; eU < dA; eU++) aTI[eU] || !function (eT, eU) {
      var value = aY[eU * aO + eT - 1] + aY[(eU - 1) * aO + eT],
        aBN = 2;
      aTH[eT + 1] && (aBN++, value += aY[eU * aO + eT + 1]);
      aTI[eU + 1] && (aBN++, value += aY[(eU + 1) * aO + eT]);
      aY[eU * aO + eT] = he.iA(value, aBN);
    }(eT, eU);
  }, this.aMG = function () {
    return aY;
  }, this.aEH = function () {
    aY = null;
  };
}
function aTj() {
  this.data = new aMa();
  var aTk = new a6J().L84,
    aTl = (this.aPa = aTk, !(this.aKE = "en"));
  this.r = function () {
    var bS, a6;
    aTl = !1, ("en" === (bS = b6.buffer.data[12].value).split("-")[0].toLowerCase() ? (ad.aPa = aTk, ad.aKE = bS, 1) : b6.buffer.data[12].value === b6.buffer.data[145].value && 0 < b6.buffer.data[146].value && (bS = b6.buffer.data[146].value, (a6 = b6.bY.a0p(bS, !1)).length === bS) && !!aR.d.xY(a6) && function (a6) {
      for (var aM = a6.length, dA = 0; dA < aM; dA++) a6[dA] = a6[dA].replace("&#39;", "'");
      var aTt = b6.bY.a0p(aM, !0);
      if (aM !== aTt.length) return !1;
      if (!aR.d.xY(aTt)) return !1;
      for (var aW = aTk.length, aTu = new Array(aW), aTv = aW === aM, aL = Math.min(aM, aW), aN = 0; aN < aW; aN++) if (aTu[aN] = aTk[aN], aN < aM && aTt[aN] === aTu[aN]) aTu[aN] = a6[aN];else {
        aTv = !1;
        for (var ex = 0; ex < aL; ex++) if (aTt[ex] === aTu[aN]) {
          aTu[aN] = a6[ex];
          break;
        }
      }
      return ad.aPa = aTu, ad.aKE = b6.buffer.data[12].value, aTv;
    }(a6)) || (aTl = !0);
  }, this.aTq = function () {
    ey.mj(), tV.mj(), vK.mj(), hD.mj(), tA.r(), a0B = new aTr();
  }, this.aPb = function () {
    return this.aPa === aTk || !aTk.length;
  }, this.a2E = function () {
    var aTw;
    return !!aTl && (aTl = !1, 0 !== aTk.length) && (aTw = b6.buffer.data[12].value, aF.lk.by(0, aTw.slice(0, 20)), !0);
  }, this.a2M = function (a6) {
    a6.length !== aTk.length ? 8 === aq.fv && aq.mA().a2G(30, 0, 1) : (this.aPa = a6, this.aKE = b6.buffer.data[12].value, b6.bJ.bK(145, this.aKE), b6.bJ.bK(146, a6.length), b6.bY.a0u(a6, !1), b6.bY.a0u(aTk, !0), 8 === aq.fv ? aq.mA().a2G(30) : 0 === jE.jF() && 5 === aq.fv && aq.b1.zC());
  }, this.cF = function () {
    var a2U,
      a6 = navigator.languages;
    return a6 && a6.length ? (a2U = Math.max(ad.data.ae(a6[0]), 0), 1 === a6.length ? [a2U, a2U] : [a2U, Math.max(ad.data.ae(a6[1]), 0)]) : [0, 0];
  };
}
function aTx() {
  var aTy;
  function aUA(es, ew, eT, eU, globalAlpha) {
    fU.lR.save(), fU.lR.globalAlpha = globalAlpha, fU.lR.imageSmoothingEnabled = !1, fU.lR.scale(ew, ew), fU.lR.drawImage(es, Math.floor(eT * (fU.fV / ew - es.width)), Math.floor(eU * (fU.iD / ew - es.height))), fU.lR.restore();
  }
  this.ms = 0, this.aTz = 0, this.aU0 = 0, this.aCR = 0, this.r = function () {
    (aTy = new Array(fU.a1H))[0] = {
      aO: [0, 5e3, 8e3, 1e4],
      uW: [220, 250, 255, 220],
      kA: [190, 220, 0, 0],
      ex: [170, 200, 0, 0]
    }, aTy[1] = {
      aO: [0, 4e3, 5e3, 6e3, 1e4],
      uW: [25, 0, 100, 0, 25],
      kA: [25, 0, 0, 0, 25],
      ex: [25, 0, 0, 0, 25]
    }, aTy[2] = {
      aO: [0, 500, 2500, 2999, 3e3, 3200, 4200, 5200, 5700, 8800, 1e4],
      uW: [15, 15, 70, 40, 48, 48, 252, 40, 40, 20, 30],
      kA: [80, 80, 190, 90, 46, 46, 248, 180, 180, 90, 140],
      ex: [120, 120, 220, 110, 37, 37, 217, 10, 10, 10, 10]
    }, aTy[3] = {
      aO: [0, 400, 1899, 1900, 3200, 4500, 6e3, 7700, 8499, 8500, 9500, 1e4],
      uW: [10, 10, 20, 10, 30, 10, 16, 40, 50, 55, 230, 230],
      kA: [10, 10, 40, 50, 100, 40, 80, 120, 80, 55, 230, 230],
      ex: [80, 80, 200, 10, 60, 10, 16, 40, 50, 55, 230, 230]
    }, aTy[4] = {
      aO: [0, 300, 1400, 1700, 3e3, 4e3, 1e4],
      uW: [10, 10, 20, 10, 10, 170, 212],
      kA: [20, 20, 60, 100, 100, 110, 170],
      ex: [70, 70, 160, 30, 30, 60, 120]
    }, aTy[5] = {
      aO: [0, 1e3, 3e3, 3500, 4e3, 4500, 7e3, 7500, 8e3, 1e4],
      uW: [10, 10, 20, 10, 5, 10, 20, 5, 20, 25],
      kA: [30, 30, 50, 100, 30, 100, 140, 60, 140, 200],
      ex: [80, 80, 200, 10, 5, 10, 20, 5, 20, 25]
    }, aTy[6] = {
      aO: [0, 700, 2650, 3200, 5e3, 8e3, 1e4],
      uW: [10, 10, 60, 255, 255, 200, 200],
      kA: [10, 10, 60, 255, 255, 200, 200],
      ex: [80, 80, 255, 255, 255, 200, 200]
    }, aTy[7] = {
      aO: [0, 400, 1999, 2e3, 3200, 4e3, 4700, 5500, 6500, 9500, 1e4],
      uW: [10, 10, 80, 255, 255, 55, 6, 70, 20, 155, 255],
      kA: [10, 10, 90, 245, 245, 170, 80, 190, 20, 155, 255],
      ex: [80, 80, 255, 235, 235, 55, 26, 10, 20, 155, 255]
    }, aTy[8] = {
      aO: [0, 700, 1300, 1900, 1901, 2500, 3400, 6e3, 1e4],
      uW: [25, 30, 30, 30, 255, 255, 30, 40, 20],
      kA: [25, 30, 150, 150, 245, 245, 80, 150, 70],
      ex: [60, 170, 170, 170, 235, 235, 30, 40, 40]
    }, aTy[9] = {
      aO: [0, 400, 2009, 2010, 3300, 4e3, 5200, 6500, 8e3, 9500, 1e4],
      uW: [10, 10, 80, 255, 255, 55, 23, 36, 20, 155, 255],
      kA: [10, 10, 90, 245, 245, 170, 60, 160, 20, 155, 255],
      ex: [80, 80, 255, 235, 235, 55, 9, 72, 20, 155, 255]
    }, aTy[20] = {
      aO: [0, 5500, 6700, 6999, 7e3, 7300, 7600, 8200, 1e4],
      uW: [5, 5, 70, 70, 255, 255, 252, 10, 8],
      kA: [20, 28, 190, 190, 255, 255, 248, 90, 60],
      ex: [60, 80, 220, 220, 220, 220, 217, 10, 8]
    }, aTy[21] = {
      aO: [0, 1500, 3e3, 4e3, 5e3, 5999, 6e3, 9500, 1e4],
      uW: [12, 30, 10, 16, 40, 50, 55, 170, 170],
      kA: [45, 100, 40, 80, 120, 80, 55, 170, 170],
      ex: [12, 60, 10, 16, 40, 50, 55, 170, 170]
    };
  }, this.aEG = function () {
    var aU9,
      aN,
      aQ,
      oL,
      xp = function () {
        var xp;
        return fU.uP = document.createElement("canvas"), fU.uP.width = fU.fV, fU.uP.height = fU.iD, fU.lR = fU.uP.getContext("2d", {
          alpha: !1
        }), xp = fU.lR.getImageData(0, 0, fU.fV, fU.iD), fU.a1m = xp.data, xp;
      }(),
      aO = aTy[fU.jJ].aO,
      uW = aTy[fU.jJ].uW,
      kA = aTy[fU.jJ].kA,
      ex = aTy[fU.jJ].ex,
      aY = aEE.aMG(),
      aM = aO.length - 2,
      aU4 = new Array(1 + aM),
      aU5 = new Array(1 + aM),
      aU6 = new Array(1 + aM),
      aU7 = new Array(1 + aM);
    for (aQ = aM; 0 <= aQ; aQ--) aU4[aQ] = aO[aQ + 1] - aO[aQ], aU5[aQ] = uW[aQ + 1] - uW[aQ], aU6[aQ] = kA[aQ + 1] - kA[aQ], aU7[aQ] = ex[aQ + 1] - ex[aQ];
    for (aN = fU.fV * fU.iD - 1; 0 <= aN; aN--) for (aQ = aM; 0 <= aQ; aQ--) if (aY[aN] >= aO[aQ]) {
      oL = aY[aN] - aO[aQ], fU.a1m[4 * aN] = uW[aQ] + aL2(aU5[aQ] * oL, aU4[aQ]), fU.a1m[4 * aN + 1] = kA[aQ] + aL2(aU6[aQ] * oL, aU4[aQ]), fU.a1m[4 * aN + 2] = ex[aQ] + aL2(aU7[aQ] * oL, aU4[aQ]), fU.a1m[4 * aN + 3] = 255;
      break;
    }
    fU.lR.putImageData(xp, 0, 0), fU.aEM(fU.jJ) && dQ.t7() && fU.aEM(fU.jJ) && (xp = dQ.uR("arena"), aU9 = dQ.uR("territorial.io"), aUA(xp, 5, .5, .5, .1), aUA(aU9, 2, .5, .45, .1)), fU.uA = !0, dy.gK = !0;
  }, this.vE = function () {
    for (var d1, eT, eU, aCP, aCQ, oN, aTz = 0, aO = fU.fV, dA = fU.iD, oL = aO * dA * 4, aCN = a5E, aCO = fU.a1m, aN = aO - 1; 0 <= aN; aN--) aCN[(d1 = aN << 2) + 2] = aCN[oL - d1 - 2] = 3;
    for (oL = 4 * aO, aN = dA - 1; 0 <= aN; aN--) aCN[(d1 = aN * oL) + 2] = aCN[d1 + oL - 2] = 3;
    for (aCP = aO - 1, aCQ = dA - 1, eU = 1; eU < aCQ; eU++) for (oL = eU * aO, eT = 1; eT < aCP; eT++) oN = 1 - (aCO[(d1 = oL + eT << 2) + 2] > aCO[d1 + 1] && aCO[d1 + 2] > aCO[d1]), aCN[d1 + 2] = 6 - 5 * oN, aTz += oN;
    this.ms = (aO - 2) * (dA - 2), this.aCR = 0, fU.aEL(fU.jJ) && (fU.aCR.aCM(), fU.aCR.aCS(4, 5)), this.aTz = ct.kB = aTz - this.aCR, this.aU0 = this.ms - this.aTz - this.aCR, this.aU0 && (fU.aCR.aCS(6, 2), fU.aCR.aCa());
  };
}
function b5(a0E, type, aUB, aUC) {
  var b7;
  this.b7 = document.createElement("input"), (b7 = this.b7).type = type ? "number" : "text", b7.id = "input" + aq.b1.a3C++, b7.value = a0E.value, b7.style.width = "100%", b7.style.userSelect = "none", b7.style.outline = "none", b7.style.resize = "none", b7.style.border = "inherit", b7.style.font = "inherit", b7.style.color = bG.bH, b7.style.backgroundColor = bG.aDf, b7.style.fontSize = "1em", b7.style.padding = "0.1em 0.2em", b7.addEventListener("focus", function () {
    d9.aII++;
  }), b7.addEventListener("blur", function () {
    d9.aII--, -1 !== a0E.af && b6.bJ.bK(a0E.af, b7.value);
  }), b7.addEventListener("keypress", function (event) {
    "Enter" === event.key && (event.preventDefault(), -1 !== a0E.af && b6.bJ.bK(a0E.af, b7.value), aUB ? aUB() : b7.blur());
  }), aUC && b7.addEventListener("input", function (c3) {
    aUC(c3);
  });
}
function aUD() {
  this.emojis = ["🥰", "😎", "😘", "😜", "🤗", "🥳", "😇", "😊", "🥱", "🙄", "🤔", "🥺", "😡", "😭", "😱", "😞", "💀", "👹", "👋", "🙏", "👏", "💪", "🙋‍♂️", "🤦‍♂️", "⬆️", "➡️", "⬇️", "⬅️", "👀", "❤️", "💔", "💥", "🔥", "🪦", "🥇", "🥈", "🥉", "🎖️", "🏅", "👑", "🎉", "💯", "✝️", "☪️", "🕉️", "☸️", "✡️", "☦️", "⚛️"], this.eq = 13, this.aUE = this.emojis.length, this.aPp = 676, __fx.quickEmojis = __fx.quickEmojis || {}, __fx.quickEmojis.emojiList = this.emojis, __fx.quickEmojis.emojiBaseCode = this.aPp, this.aUF = 1024, this.aPq = this.emojis.indexOf("💀"), this.aUG = this.aPq + 1, this.aUH = this.emojis.indexOf("🥇"), this.aUI = this.emojis.indexOf("😊"), this.er = function (aY) {
    return aY < this.aPp ? String.fromCharCode(55356, 56806 + he.iA(aY, 26), 55356, 56806 + aY % 26) : this.emojis[Math.min(aY - this.aPp, this.aUE - 1)];
  }, this.aUJ = function (bS) {
    for (var aM = bS.length - 2, a6 = [], aN = 0; aN < aM; aN++) {
      var f7 = bS.charCodeAt(aN) - 56806,
        f8 = bS.charCodeAt(aN + 2) - 56806;
      0 <= f7 && f7 < 26 && 0 <= f8 && f8 < 26 && (a6.push(26 * f7 + f8), aN += 3);
    }
    return a6;
  }, this.dc = function (aY) {
    return aY < this.aPp;
  }, this.em = function (aY) {
    return aY >= 1024 - this.eq;
  }, this.ei = function (aY) {
    return aY >= this.aPp && aY < this.aPp + this.aUG;
  };
}
function aIj() {
  this.aQa = function (fK) {
    var aO3;
    return fU.aEL(fU.jJ) && ct.data.passableMountains && (aO3 = d5.hm(fK), this.aUK(ct.eG, aO3) || this.aUL(ct.eG, aO3)) && 0 !== (aO3 = function (a4H) {
      for (var eT = dr.ht(a4H), eU = dr.hu(a4H), max = Math.max(fU.fV, fU.iD) - 2, aUO = max * max, kp = !1, aUP = 0, rW = 0; rW < max; rW++) {
        var aUQ,
          gm = function (eT, eU, rW) {
            for (var aN = 0; aN <= rW; aN++) for (var aQ = -1; aQ < 2; aQ += 2) for (var ex = -1; ex < 2; ex += 2) for (var bW = 0; bW < 2; bW++) {
              var fK = function (eT, eU) {
                if (dr.iH(eT, eU)) {
                  eT = dr.iE(eT, eU), eU = dr.iI(eT);
                  if (d5.kr(eU) && d5.aL5(eU)) return eT;
                }
                return 0;
              }(eT + bW * aQ * aN + (1 - bW) * ex * rW, eU + bW * ex * rW + (1 - bW) * aQ * aN);
              if (fK) return fK;
            }
            return 0;
          }(eT, eU, rW);
        gm && (aUQ = dr.hq(eT, eU, gm)) < aUO && (aUP = gm, aUO = aUQ, kp || (kp = !0, max = Math.floor(Math.sqrt(aUQ)) + 1));
      }
      return aUP;
    }(dr.iJ(fK))) && (fK = dr.iI(aO3), d5.ho(fK) || (fK = d5.hp(fK)) !== ct.eG && kl.km(fK, ct.eG)) ? aO3 : 0;
  }, this.pE = function (player, gm) {
    gm = dr.iI(gm);
    if (d5.kr(gm)) {
      if (d5.ho(gm)) k3.od[0] = ct.cv;else if (d5.hp(gm) !== k3.od[0]) return !1;
      for (var iy = function (fK) {
          var aCW = d5.aCW,
            iy = [];
          loop: for (var fS = 3; 0 <= fS; fS--) {
            var l2 = fK + aCW[fS];
            if (d5.aL6(l2)) {
              for (var id = d5.hm(l2), aN = 0; aN < iy.length; aN++) if (id === iy[aN]) continue loop;
              k3.pG[iy.length] = l2, iy.push(id);
            }
          }
          return iy;
        }(gm), aM = iy.length, aN = 0; aN < aM; aN++) if (this.aUK(player, iy[aN]) || this.aUL(player, iy[aN])) return k3.pG[0] = k3.pG[aN], !0;
    }
    return !1;
  }, this.aUK = function (player, aO3) {
    for (var aJk = d3.aJk[player], aM = aJk.length, aO4 = Math.max(he.iA(aM, 12), 1), aCW = d5.aCW, aN = 0; aN < aM; aN += aO4) for (var hk = aJk[aN], fS = 3; 0 <= fS; fS--) {
      var l2 = hk + aCW[fS];
      if (d5.aL6(l2) && aO3 === d5.hm(l2)) return !0;
    }
    return !1;
  }, this.aUL = function (player, aO3) {
    for (var aJk = d3.aJk[player], aM = aJk.length, aCW = d5.aCW, aN = 0; aN < aM; aN++) for (var hk = aJk[aN], fS = 3; 0 <= fS; fS--) {
      var l2 = hk + aCW[fS];
      if (d5.aL6(l2) && aO3 === d5.hm(l2)) return !0;
    }
    return !1;
  };
}
function nk() {
  var aUR = ["", "", "", "Admin", "Clan Leader", "1v1", "Clan Member", "", "Battle Royale", "Wealthy Player", "Patreon Member", "Zombie"],
    aUS = [bG.aFG, bG.aFG, bG.aFH, bG.aFX, bG.aFY, bG.aFQ, bG.aFb, bG.aFH, bG.aFo, bG.bI, bG.aFm, bG.r8],
    aUT = [[1], [1], [1.2], [1.4, 1.2], [1.7, 1.4, 1.2], [1.4, 1.2], [1.4, 1.2], [1.2], [1.4, 1.2], [1.4, 1.2], [1.4, 1.2], [1.4, 1.2]],
    aUU = ["Your account is too new.", "The server couldn't process your request.", "Spam detected.", "You are muted.", "Player couldn't be found.", "You don't have permission for this operation.", "Not enough gold.", "Action cancelled.", "User received this punishment already.", "Lobby restarts in 2 minutes.", "Lobby restarts in 10 seconds."];
  function aUj(jl, ah, aUk) {
    for (var ex = jl.length - 1; 0 <= ex; ex--) {
      var c3 = jl[ex];
      0 === c3.id && c3.ah === ah && (c3.a0 = "[Redacted Message]", aUk) && (c3.aUl = 1);
    }
  }
  this.a8G = function (a8D) {
    var aUV, aGb;
    return a8D.id < 5 && (aUV = "@" + bs.aa.dG(a8D.ah, 5)), 0 === a8D.id ? aUV + ": " + a8D.a0 : 1 === a8D.id ? (aGb = "@" + bs.aa.dG(a8D.target, 5), 0 === a8D.aK ? 32768 <= a8D.value ? aUV + " voted with " + (a8D.value - 32768 + 1) + " gold against " + aGb + " to weaken the latter's admin position. 📉" : aUV + " voted with " + (a8D.value + 1) + " gold for " + aGb + " to strengthen the latter's admin position. 💪" : 1 === a8D.aK ? aUV + " sent " + Math.floor(a8D.value / 100) + " 🧈 gold to " + aGb + "." : aUV + " voted with " + (a8D.value / 10).toFixed(1) + " points for " + aGb + " to acknowledge the latter as clan leader. ✅") : 2 === a8D.id ? 0 === a8D.aK ? aUV + " was 🔇 muted for 1 Hour." : 1 === a8D.aK ? "The username of " + aUV + " was ✂️ redacted. Duration: 1 Day" : aUV + " 👢 was kicked." : 3 === a8D.id ? aUV + a0B.aUW(a8D.aK, a0B.aUX[a8D.aK][a8D.value]) + "@" + bs.aa.dG(a8D.target, 5) + a0B.aUY(a8D.aK, a0B.aUX[a8D.aK][a8D.value]) : 4 === a8D.id ? aUV + a0B.aUW(5, a0B.aUX[5][a8D.aK]) + "@" + bs.aa.dG(a8D.target, 5) + a0B.aUY(5, a0B.aUX[5][a8D.aK]) : 5 === a8D.id ? aUU[a8D.aK] : 6 === a8D.id ? "You are about to mention " + a8D.value + " player" + (1 === a8D.value ? "" : "s") + ". This action will cost " + (Math.max(10 * a8D.value, 10) / 100).toFixed(2) + " Gold. Proceed? (yes / no)" : 7 === a8D.id ? a8D.a0 : void 0;
  }, this.a8F = function (a8D, aE) {
    return {
      a8D: a8D,
      a0: aE,
      aUZ: 0,
      fontSize: 1,
      aOa: 0,
      aUa: a8D.id ? bG.aFW : bG.bH
    };
  }, this.aUb = function (player, jk) {
    return (2 === jk ? "(" + (player.elo / 10).toFixed(1) + ") " : "") + player.username;
  }, this.aUc = function (aNn) {
    return aUS[aNn];
  }, this.aUd = function (aNn, aAu) {
    return aNn < 3 || 7 === aNn ? aUT[aNn][0] : 4 === aNn ? aUT[aNn][aAu < 1 ? 0 : aAu < 10 ? 1 : 2] : aUT[aNn][aAu < 10 ? 0 : 1];
  }, this.aUe = function (aAu) {
    return 0 === aAu;
  }, this.aNr = function (jk, ah) {
    for (var aV = aI.aU.aV, aU = aV[jk], aM = aU.length, aN = 0; aN < aM; aN++) if (ah === aU[aN].ah) return aU[aN];
    for (var ex = 0; ex < aV.length; ex++) if (jk !== ex) for (aM = (aU = aV[ex]).length, aN = 0; aN < aM; aN++) if (ah === aU[aN].ah) return aU[aN];
    return null;
  }, this.aUf = function (c3) {
    return !!aI.nc && c3.ah === aI.nc.ah;
  }, this.aUg = function (aU, aUh, aUi) {
    var pU = [];
    loop: for (var aN = aUh; aN < aUi; aN++) {
      var rd = aR.h.ag(aU[aN].username);
      if (rd) {
        for (var ex = pU.length - 1; 0 <= ex; ex--) if (rd === pU[ex].name) {
          pU[ex].aL++;
          continue loop;
        }
        pU.push({
          name: rd,
          aL: 1
        });
      }
    }
    if (pU.sort(function (aQ, ex) {
      return ex.aL - aQ.aL;
    }), 0 === pU.length) return "";
    for (var bS = pU[0].name + ": " + pU[0].aL, aN = 1; aN < pU.length; aN++) bS += "   " + pU[aN].name + ": " + pU[aN].aL;
    return bS;
  }, this.aNm = function (aNn, aAu, aNo) {
    return 0 === aUR[aNn].length ? "Rank: " + (aAu + 1) : aUR[aNn] + " Rank: " + (aAu + 1) + (3 !== aNn && aNo < 100 ? "   " + aUR[3] + " Rank: " + (aNo + 1) : "");
  }, this.a8E = function (ah) {
    for (var jH = aI.b1.jH, aN = 0; aN < jH.length; aN++) aUj(jH[aN].jl, ah);
    aUj(aI.message.a8Q(), ah, 1), aI.db.a8E(ah);
  };
}
function aUm() {
  this.je = 0;
  var aUn,
    aUo,
    aUp,
    aUq,
    aUr,
    aUs = this.yJ = 0;
  function aUt() {
    aUq = aUr = null, aUs = 0;
  }
  this.r = function (jG, a80, a81) {
    aq.mU(), aI.mV(), jE.setState(10), aUq = jG, aUr = a80, aUs = a81, this.je = jG.je, this.yJ = a81, aUn = 0, aUo = dy.dz + 4500, aF.b1.c7 = jG.c7, aF.b1.bu === jG.c7 ? (console.log("direct pass"), aUp = 0) : (console.log("delayed pass"), aF.b1.close(aF.b1.bu, 3247), aUp = 2, aF.b1.aG7(jG.c7, 5, 2) && aF.a2A.yI()), dE.imageSmoothingEnabled = !0, jE.uL();
    a80 = dQ.uR("loading"), a81 = (cA.hg.hh() ? .396 : .25) * d9.dC / a80.width;
    dE.setTransform(a81, 0, 0, a81, Math.floor((d9.aO - a81 * a80.width) / 2), Math.floor((d9.dA - a81 * a80.height) / 2)), dE.imageSmoothingEnabled = !1, dE.drawImage(a80, 0, 0), dE.setTransform(1, 0, 0, 1, 0, 0);
  }, this.hP = function () {
    0 < aUp && dy.dz > aUo && (aUp--, aUo += 4500, 0 === dy.g7) && 0 === dy.f2() && aF.b1.aG7(aF.b1.c7, 5, 2);
  }, this.aQB = function () {
    return 10 === jE.jF() && (aI.jf.a84(aUq, aUr, aUs), aUt(), !0);
  }, this.tB = function () {
    10 === jE.jF() && 2 <= ++aUn && (aI.jf.a84(aUq, aUr, aUs), aUt());
  };
}
function wE() {
  var am, uh, ui, uk;
  function uj(aN) {
    aq.fu(8, aq.fv, new fw(21, {
      pK: aN,
      pL: 0,
      pM: 10
    }));
  }
  this.show = function () {
    am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), uh.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, ui = [new ap(L(329), function () {
    uj(1);
  }, 0, 0, 1), new ap(L(330), function () {
    uj(2);
  }, 0, 0, 1), new ap(L(331), function () {
    uj(3);
  }, 0, 0, 1), new ap(L(332), function () {
    uj(0);
  }, 0, 0, 1), new ap(L(333), function () {
    uj(9);
  }, 0, 0, 1), new ap(L(100), function () {
    uj(10);
  }, 0, 0, 1), new ap(L(101), function () {
    uj(11);
  }, 0, 0, 1), new ap(L(102), function () {
    uj(13);
  }, 0, 0, 1)], uk = [new ap("⬅️ " + L(1), function () {
    aq.ar();
  })], am = new ao(L(67), uk), uh = new nv(ui, am.au);
}
function a3k() {
  this.c0 = function (bS) {
    for (var aM = bS.length, aO = bc, aN = 0; aN < aM; aN++) aO.bh(16, bS.charCodeAt(aN));
  };
}
function aUv() {
  var canvas,
    j,
    aNk,
    font,
    sg = 0,
    aUw = !1,
    aUx = [10, 5, 3, 2, 1.5, 1, .75, .5, .25],
    aUy = 5;
  function aV5() {
    if (aUw) {
      var aN,
        aM = aUx.length,
        a3W = Math.floor(.5 * aNk.dA),
        dA = aM * a3W,
        eT = Math.floor(Math.floor(aNk.eT) + .3 * aNk.aO - .5),
        eU = Math.floor(Math.floor(aNk.eU) - dA),
        aO = Math.floor(.4 * aNk.aO + 2.5);
      for (dE.fillStyle = bG.su, dE.fillRect(eT, eU, aO, dA), dE.fillStyle = bG.aAm, dE.fillRect(eT, eU + aUy * a3W, aO, a3W), dE.fillStyle = bG.bH, dE.fillRect(eT, eU, 2, dA), dE.fillRect(eT, eU, aO, 2), dE.fillRect(eT + aO - 2, eU, 2, dA), aN = 1; aN < aM; aN++) dE.fillRect(eT, eU + aN * a3W, aO, 2);
      for (dE.fillStyle = bG.bH, aR.b.textAlign(dE, 1), aR.b.textBaseline(dE, 1), dE.font = aR.b.dF(0, .6 * a3W), eT += .5 * aO, aN = 0; aN < aM; aN++) dE.fillText(aVD(aN), eT, eU + (aN + .6) * a3W);
    }
    dE.drawImage(canvas, Math.floor(aNk.eT), Math.floor(aNk.eU));
  }
  function hQ(a3d) {
    var eT, e3, e6, a3W;
    j.clearRect(0, 0, Math.floor(aNk.aO), Math.floor(aNk.dA)), j.fillStyle = bG.su, j.fillRect(0, 0, Math.floor(aNk.aO), Math.floor(aNk.dA)), ct.ur && (j.fillStyle = bG.aAm, j.fillRect(0, 0, Math.floor(.3 * aNk.aO), Math.floor(aNk.dA))), j.fillStyle = bG.bH, j.fillText("Hide UI", .15 * aNk.aO, .5 * aNk.dA), j.fillRect(Math.floor(.3 * aNk.aO - .5), 0, 2, Math.floor(aNk.dA)), eT = .5 * aNk.aO, j.fillText("Replay Speed", eT, .31 * aNk.dA), j.fillText(aVD(aUy), eT, .69 * aNk.dA), j.fillRect(Math.floor(.7 * aNk.aO - .5), 0, 2, Math.floor(aNk.dA)), a3d.vX ? (eT = Math.floor(.02 * aNk.aO), a3d = Math.floor(.025 * aNk.aO), e3 = Math.floor(.85 * aNk.aO - eT - .5 * a3d), e6 = Math.floor(.25 * aNk.dA), a3W = Math.floor(aNk.dA) - 2 * e6, j.fillRect(e3, e6, eT, a3W), j.fillRect(e3 + eT + a3d, e6, eT, a3W)) : function () {
      var aO = Math.floor(.46 * aNk.dA),
        dA = Math.floor(.23 * aNk.dA),
        eT = Math.floor(.85 * aNk.aO - .5 * aO + aO / 12),
        eU = Math.floor(.5 * aNk.dA - dA);
      j.beginPath(), j.moveTo(eT, eU), j.lineTo(eT + aO, eU + dA), j.lineTo(eT, eU + (dA << 1)), j.fill();
    }(), j.fillRect(0, 0, Math.floor(aNk.aO), 2), j.fillRect(0, 0, 2, Math.floor(aNk.dA)), j.fillRect(0, Math.floor(aNk.dA) - 2, Math.floor(aNk.aO), 2), j.fillRect(Math.floor(aNk.aO - 2), 0, 2, Math.floor(aNk.dA));
  }
  function aVD(aN) {
    return 5 === aN ? "Normal" : "" + aUx[aN];
  }
  this.vX = !1, this.r = function () {
    ct.mH && (aUy = 5, this.vX = !1, aUw = !1, aNk = new aHH([.3, .3 / 6], [.5, 1]), this.resize());
  }, this.aUz = function () {
    return aUx[aUy];
  }, this.mw = function () {
    return aNk.eU;
  }, __fx.replay.controls = {
    fxIsPlaying: () => this.vX,
    fxGetSpeedIndex: () => aUy,
    fxSetSpeedIndex: index => {
      aUy = index, this.resize();
    },
    fxGetPanelTop: () => aNk && aNk.eU
  }, this.nQ = function (a3X) {
    return !!ct.mH && aNk.eT + aNk.aO > d9.aO - a3X - lS.gap;
  }, this.resize = function () {
    ct.mH && (aNk.resize(), aNk.eU -= (nT.nU() - 1) * lS.gap, font = aR.b.dF(0, .3 * aNk.dA), (canvas = document.createElement("canvas")).width = Math.floor(aNk.aO), canvas.height = Math.floor(aNk.dA), (j = canvas.getContext("2d", {
      alpha: !0
    })).font = font, aR.b.textAlign(j, 1), aR.b.textBaseline(j, 1), hQ(this));
  }, this.zn = function (aV0) {
    0 === ct.dX || aq.mg() || aV0 !== ct.ur && (ct.ur = aV0, hE.resize(), dy.gK = !0, ct.mH) && (sg = dy.dz + 2e3, hQ(this));
  }, this.mv = function (eT, eU) {
    if (!ct.mH) return !1;
    if (eT < aNk.eT || eU < aNk.eU || eT > aNk.eT + aNk.aO) return aUw && function (a3d, eT, eU) {
      var aM = aUx.length,
        a3W = Math.floor(.5 * aNk.dA),
        dA = aM * a3W,
        e3 = Math.floor(Math.floor(aNk.eT) + .3 * aNk.aO - .5),
        dA = Math.floor(Math.floor(aNk.eU) - dA),
        aO = Math.floor(.4 * aNk.aO + 2.5);
      return aUw = !1, dy.gK = !0, eT < e3 || e3 + aO < eT || eU < dA || (aUy = aB6(0, Math.floor((eU - dA) / a3W), aM - 1), hQ(a3d)), !0;
    }(this, eT, eU);
    if ((eT -= aNk.eT) < .3 * aNk.aO) aUw = !1, this.zn(!ct.ur);else {
      if (eT < .7 * aNk.aO) return aUw = !aUw, dy.gK = !0;
      this.zo(!1);
    }
    return !0;
  }, __fx.replay.togglePlayPause = () => this.zo(!0), this.zo = function (aV2) {
    2 === ct.dX ? (this.zn(!1), aq.fu(3)) : (aUw = !1, this.vX = !this.vX, this.vX ? (my.mz && my.n0(), cA.hg.setState(1)) : aV2 || my.zp(), dy.gK = !0, hQ(this));
  }, this.aV3 = function () {
    this.vX = !1, my.zp(), dy.gK = !0, hQ(this);
  }, this.aI7 = function (eT, eU) {
    return !!ct.ur && (0 <= my.mv(eT, eU) || (ct.mH ? ((dy.dz > sg || !this.mv(eT, eU)) && qA.mv(eT, eU), dy.gK = !0, sg = dy.dz + 2e3) : qA.mv(eT, eU)), !0);
  }, this.f1 = function () {
    ct.mH && ct.ur && dy.dz > sg - 1e3 && dy.dz < sg && (dy.gK = !0);
  }, this.aV4 = function () {
    ct.mH && (this.vX = !1, dy.gK = !0, hQ(this));
  }, this.dd = function () {
    if (ct.mH) {
      if (ct.ur) {
        if (dy.dz > sg) return;
        if (sg - 1e3 < dy.dz) return dE.globalAlpha = aB6(0, (1e3 - (dy.dz - (sg - 1e3))) / 1e3, 1), aV5(), void (dE.globalAlpha = 1);
      }
      aV5();
    }
  };
}
function aVE() {
  var a6, aMO, aP1, aVF, gap, aVG, aVH, aVI, aVJ, aVK, lG, ni, a5v, aVL, a3T, py, aVM;
  function aVO() {
    aVF = Math.floor(.2 * (cA.hg.hh() ? .07 : .035) * d9.dC), aVF = lg(cA.hg.hh() ? 3 : 1, aVF);
    var aVP = d9.aO / (a6.length + gap);
    aVF = aVF < aVP ? aVP : aVF, a3T = Math.floor((1 - gap) * aVF), aMO = 0, aVQ();
  }
  function aVQ() {
    aMO = (aMO = aMO < -20 ? -20 : aMO) > (a6.length - 15) * aVF ? (a6.length - 15) * aVF : aMO, aVH = Math.floor(aMO / aVF), aVI = (aVI = aVH + Math.floor(d9.aO / aVF)) > a6.length - 1 ? a6.length - 1 : aVI, aVH = (aVH = aVI < aVH ? aVI : aVH) < 0 ? 0 : aVH;
    var aW = aVI;
    aVG = aP1 / a6[aW];
    for (var aN = aVI - 1; aVH <= aN; aN--) a6[aN] > a6[aW] && (aW = aN, aVG = aP1 / Math.pow(a6[aN], aVL));
  }
  function aVS(eT) {
    eT = Math.floor((aMO + d9.aO - eT - gap * aVF) / aVF);
    return (eT = eT < -1 ? -1 : -1 === eT ? 0 : eT > a6.length - 1 ? -1 : eT) !== aVJ && (aVJ = eT, -1 === py && 0 === aVJ && uF.a2D && (py = setInterval(aVT, 100)), 1);
  }
  function aVU(aN) {
    var qG = Math.floor(aVG * Math.pow(a6[aN], aVL));
    dE.fillRect(aMO + d9.aO - (aN + 1) * aVF, d9.dA - qG, a3T, qG);
  }
  function aVT() {
    var d1;
    0 !== (aVJ = 8 === jE.jF() ? -1 : aVJ) ? (aVM = new Date().getTime(), clearInterval(py), py = -1) : (d1 = a6[1] / 864e3, -1 !== aVM && (d1 += (new Date().getTime() - aVM) * a6[1] / 864e5, aVM = -1), 0 < d1 && (a6[0] += Math.floor(d1), dy.gK = !0));
  }
  this.a2D = !1, this.r = function () {
    aVM = py = -1, aVJ = -(aVL = 1), this.uG = !1, a5v = 0, ni = new Date(), aMO = 0, gap = .3, a6 = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], this.resize();
  }, this.resize = function () {
    aP1 = Math.floor(.15 * d9.dA), aVK = (aVK = Math.floor((cA.hg.hh() ? .018 : .0137) * d9.dC)) < 2 ? 2 : aVK, lG = aR.b.dF(1, aVK), aVO();
  }, this.aQA = function (aTu) {
    var aN;
    for (this.a2D = !0, aN = 0; aN < aTu.length; aN++) a6.unshift(aTu[aN]);
    aVO(), dy.gK = !0;
  }, this.uK = function () {
    aVQ();
  }, this.dh = function (eT, eU) {
    eU > d9.dA - .6 * aP1 ? this.uG ? eT !== a5v && (aMO += eT - a5v, a5v = eT, aVQ(), aVS(eT), this.uG = -1 !== aVJ, dy.gK = !0) : aVS(eT) && (dy.gK = !0) : this.reset();
  }, this.reset = function () {
    -1 !== aVJ && (this.uG = !1, aVJ = -1, dy.gK = !0);
  }, this.uI = function (eT, deltaY) {
    -1 !== aVJ && (aMO += Math.floor(deltaY), aVQ(), aVS(eT), dy.gK = !0);
  }, this.mv = function (eT, eU) {
    this.dh(eT, eU), -1 !== aVJ && (a5v = eT, this.uG = !0);
  }, this.uH = function () {
    -1 !== aVJ && (this.uG = !1);
  }, this.dd = function () {
    dE.fillStyle = bG.aFA;
    for (var aVW, month, eZ, g3, aVZ, aVa, e6, aVb, aVc, aN = aVI; aVH <= aN; aN--) aVU(aN);
    this.a2D && 0 === aVH && (dE.fillStyle = bG.mp, aVU(0)), -1 !== aVJ && (dE.fillStyle = bG.lX, aVU(aVJ)), -1 !== aVJ && (dE.font = lG, aR.b.textBaseline(dE, 2), (eZ = new Date()).setTime(ni.getTime() - 1e3 * aVJ * 60 * 60 * 24), month = "month", aVW = "day", "undefined" != typeof Intl && (month = new Intl.DateTimeFormat("en-US", {
      month: "long"
    }).format(eZ), aVW = new Intl.DateTimeFormat("en-US", {
      weekday: "long"
    }).format(eZ)), aVW = aVW + ", " + eZ.getUTCDate() + " " + month + " " + eZ.getFullYear(), month = 1 === a6[aVJ] ? L(334) : L(335), month = aR.h.dG(a6[aVJ]) + " " + month, eZ = Math.floor(dE.measureText(aVW).width), g3 = Math.floor(dE.measureText(month).width), aVZ = Math.floor(.5 * (eZ + aVK)), aVa = (aVa = aMO + d9.aO - (aVJ + 1) * aVF) < aVZ ? aVZ : aVa > d9.aO - aVZ ? d9.aO - aVZ : aVa, e6 = d9.dA - Math.floor(aVG * Math.pow(a6[aVJ], aVL)), aVb = Math.floor(1.1 * aVK), aVc = e6 > d9.dA - aVb ? d9.dA - aVb : e6, dE.fillStyle = bG.iq, dE.fillRect(d9.aO - g3 - aVK, aVc - aVb, g3 + aVK, aVb), dE.fillRect(aVa - aVZ, d9.dA - aVb, eZ + aVK, aVb), dE.fillStyle = bG.bH, aR.b.textAlign(dE, 2), dE.fillText(month, Math.floor(d9.aO - .5 * aVK), aVc), aR.b.textAlign(dE, 1), dE.fillText(aVW, aVa, d9.dA), dE.strokeStyle = bG.aFB, dE.lineWidth = 1, dE.beginPath(), dE.moveTo(0, e6), dE.lineTo(d9.aO, e6), dE.closePath(), dE.stroke());
  };
}
function tF() {
  this.jS = function (a1T) {
    for (var a1g = ft, size = a1g.bg(a1T), aVd = 7 + 9 * a1g.bg(1), a6 = [], aN = 0; aN < size; aN++) a6.push(String.fromCharCode(a1g.bg(aVd)));
    return a6.join("");
  };
}
function kJ() {
  var aVe = new Uint16Array(ct.cv);
  function aVl(player, aVj) {
    for (var aM = k3.a5A[0], aO5 = k3.aO5, aOP = -1, rc = ct.cv, aN = 0; aN < aM; aN++) {
      var rW,
        d1 = aO5[aN];
      kl.km(player, d1) && (rW = dr.i6(aVj, dr.iU(d1)), -1 === aOP || rW < aOP) && (aOP = rW, rc = d1);
    }
    return rc;
  }
  function aVn(aVk, aVj) {
    if (aVk === ct.cv) return 0;
    var kn = d3.kn[aVk],
      aW = kn.length;
    if (0 === aW) return 0;
    for (var aM = Math.min(aW, 10), rc = 0, aOP = dr.i6(kn[rc] >> 2, aVj), aN = 0; aN < aM; aN++) {
      var dZ = iW.rU(aW),
        rW = dr.i6(kn[dZ] >> 2, aVj);
      rW < aOP && (aOP = rW, rc = dZ);
    }
    return kn[rc] >> 2;
  }
  function aVp(player, aVj, l5, aVs) {
    var aVt;
    (aVs === ct.cv || (aVt = dr.iU(l5), aVs = dr.iU(aVs), dr.i6(aVj, aVt) < dr.i6(aVj, aVs))) && (aVe[player] = l5);
  }
  this.r = function () {
    aVe.fill(ct.cv);
  }, this.kV = function () {
    if (dy.f2() % 109 == 9 && !(eI.eJ < 20) && ct.il && !(hE.nG() < he.iA(8 * ct.kB, 10))) {
      var a57 = hE.iu();
      if (ey.iv[a57]) {
        hE.a7J(a57);
        var aM = k3.a5A[0];
        if (0 !== aM) for (var a6 = k3.a59, eK = eI.eK, eJ = eI.eJ, aVf = aVe, dZ = iW.rU(aM), aN = 0; aN < eJ; aN++) {
          var g4 = eK[aN],
            gi = a6[dZ];
          aR.f.a4i(g4, gi) && 512 === aVf[g4] && (aVf[g4] = gi, dZ = (dZ + 1) % aM);
        }
      }
    }
  }, this.f1 = function (player) {
    var aVj,
      aVm,
      aVk,
      aVg = function (player) {
        var l5 = aVe[player];
        if (l5 !== ct.cv) {
          if (aR.f.ij(l5) && d3.kn[l5]) return l5;
          aVe[player] = ct.cv;
        }
        return ct.cv;
      }(player);
    return function (player) {
      for (var is = eI.eK, aW = eI.eJ, aM = Math.min(aW, aW < 17 && 5 === iW.rU(20) ? 1 : 16), s9 = iW.rU(aW), aO5 = k3.aO5, kn = d3.kn, aL = 0, aN = 0; aN < aM; aN++) {
        var d1 = is[(aN + s9) % aW];
        d1 !== player && kn[d1].length && (aO5[aL++] = d1);
      }
      k3.a5A[0] = aL;
    }(player), 0 !== k3.a5A[0] && (0 < (aVm = aVn(aVk = aVl(player, aVj = dr.iV(player)), aVj)) && h0.os.aVo(player, h0.nd.a4I(aVm, aVj)) ? (aVp(player, aVj, aVk, aVg), !0) : 0 < (aVk = function (player, aVj) {
      for (var aM = k3.a5A[0], aO5 = k3.aO5, aVf = aVe, s9 = 0, aN = 0; aN < aM; aN++) {
        var d1 = aO5[aN],
          d1 = aVf[d1];
        d1 !== ct.cv && aR.f.ij(d1) && player !== d1 && kl.km(player, d1) && (aO5[s9++] = d1);
      }
      return 0 !== (k3.a5A[0] = s9) ? aVn(aVl(player, aVj), aVj) : 0;
    }(player, aVj)) && h0.os.aVo(player, h0.nd.a4I(aVk, aVj)) ? (aVp(player, aVj, d5.hp(aVk << 2), aVg), !0) : !!(0 < (aVm = aVn(aVg, aVj)) && h0.os.aVo(player, h0.nd.a4I(aVm, aVj))));
  };
}
function at(fX, aw) {
  var nx = document.createElement("div");
  function cw() {
    var aN,
      zJ,
      dA,
      s9,
      fS,
      aVw = d9.o5 * nx.offsetWidth,
      aVy = new Float64Array(function (aVw) {
        var aO = .25 * aR.b.o4(.6) * d9.dC;
        return Math.max(Math.floor(aVw / aO), 1);
      }(aVw)),
      o0 = lS.o0,
      aVz = (aVw - (aVy.length + 1) * lS.gap) / (aVy.length * d9.o5);
    for (aVy.fill(o0), aN = 0; aN < aw.length; aN++) zJ = (fS = aw[aN].nx).style, dA = aR.d.min(aVy), s9 = aVy.indexOf(dA), zJ.top = aR.b.nz(dA), zJ.left = aR.b.nz(o0 + s9 * (aVz + o0)), zJ.width = aR.b.nz(aVz), aR.b.g1(fS, 5), aVy[s9] += fS.offsetHeight + 3 * o0;
    nx.style.height = aR.b.nz(aR.d.max(aVy) - 2 * o0);
  }
  this.zf = nx, this.a0e = aw, this.resize = function () {
    var aN;
    for (aN = 0; aN < aw.length; aN++) aw[aN].resize();
    cw(), cw();
  }, nx.style.width = "100%", nx.style.maxWidth = "100%", fX.style.lineHeight = "1.5em", fX.style.overflowX = "hidden", fX.style.overflowY = "auto";
  for (var aN = 0; aN < aw.length; aN++) nx.appendChild(aw[aN].nx);
  fX.appendChild(nx);
}
function aW0() {
  var a1J,
    aW1,
    aW2,
    a1I,
    aW3,
    aW4,
    aW5,
    aW6,
    aW7,
    aW8,
    aW9,
    tp,
    aWA,
    aWB = !1,
    aWC = !1;
  function aWD(u0) {
    tp = dy.dz, aW2 = a1I = aW1 = 0, aW3 = (aWA = 33) / u0, a1J = 1 / (u0 / aWA / 4), aW4 = (d9.aO / 2 + e4) / e5, aW5 = (d9.dA / 2 + e7) / e5, aW6 = e5;
  }
  function aWG(aN) {
    var e3;
    -1 !== aN && (aN = dr.iM(h0.b1.kY[aN]), e3 = dr.ht(aN) - 15, aN = dr.hu(aN) - 15, hI.aWE(e3, aN, 29 + e3, 29 + aN));
  }
  function aWL(aWM) {
    Math.abs(Math.log(aW9 / aW6)) < .125 && (aW9 = aWM * aW6);
  }
  function aWK(e3, e6, e8, e9) {
    aW7 = (e3 + e8 + 1) / 2, aW8 = (e6 + e9 + 1) / 2;
    e8 = d9.aO / (e8 - e3 + 1), e3 = d9.dA / (e9 - e6 + 1);
    aW9 = .9 * (e8 < e3 ? e8 : e3);
  }
  this.aMF = function () {
    return aWB;
  }, this.vP = function () {
    aWD(1), this.aWE(0, 0, fU.fV - 1, fU.iD - 1), ct.dO || ct.mH || this.aB9(ct.eG, 3e3, !0, .3);
  }, this.aWF = function (player, kh) {
    aWG(h0.nd.a4O(player, kh));
  }, this.aB9 = function (player, u0, aWH, zoom) {
    ct.ur || aWB && !aWH && aWC || (0 === d3.d4[player] ? aWG(h0.nd.a4S(player)) : (qA.a3b = !1, aWC = aWH, aWD(u0), function (player) {
      aW7 = (d3.dM[player] + d3.dS[player] + 1) / 2, aW8 = (d3.dN[player] + d3.dT[player] + 1) / 2;
    }(player), function (zoom, player) {
      var df = d3.dS[player] - d3.dM[player] + 1,
        player = d3.dT[player] - d3.dN[player] + 1,
        aQ = d9.aO / df,
        ex = d9.dA / player,
        aQ = (aW9 = aQ < ex ? aQ : ex, 0 !== zoom ? zoom : df < 20 && player < 20 ? .5 : .9);
      aW9 *= aQ, aWL(7 / 8);
    }(zoom, player), aWB = !0, q9.q8()));
  }, this.aST = function (u0) {
    ct.mH || ct.ur || (qA.a3b = !1, aWC = !1, aWD(u0), aWK(0, 0, fU.fV - 1, fU.iD - 1), aWL(7 / 8), aWB = !0, q9.q8());
  }, this.aWE = function (e3, e6, e8, e9) {
    aWB = !1, aWK(e3, e6, e8, e9), e5 = aW9, qA.aDU(aW7, d9.aO / 2), qA.aDV(aW8, d9.dA / 2), aA4.aDd(), dy.gK = !0;
  }, this.fN = function () {
    return !(aWB && aWC || (aWB = !1));
  }, this.f1 = function () {
    var aWO, aWP, fS, aWS;
    aWB && (aW1 < .5 ? a1I < aW3 && (a1I += aW3 * a1J, aW2 = aW1) : 1 - aW2 < aW1 && (a1I = (a1I -= aW3 * a1J) < aW3 * a1J ? aW3 * a1J : a1I), tp = tp >= dy.dz ? dy.dz - 1 : tp, aW1 = 1e3 < (fS = dy.dz - tp) || 1 < (aW1 += a1I * fS / aWA) ? 1 : aW1, tp = dy.dz, fS = e5, aWO = e4, aWP = e7, fS = (e5 = aW6 * Math.pow(aW9 / aW6, aW1)) / fS, aWS = 1 - (aW6 * Math.pow(aW9 / aW6, 1 - aW1) - aW6) / (aW9 - aW6), qA.aDU(aW4 + aWS * (aW7 - aW4), d9.aO / 2), qA.aDV(aW5 + aWS * (aW8 - aW5), d9.dA / 2), di.zoom(fS, (aWO * fS - e4) / (1 - fS), (aWP * fS - e7) / (1 - fS)), aA4.aDd(), 1 <= aW1 && (aWB = !1, gJ.aJY = !0), dy.gK = !0);
  };
}
function a3j() {
  var aWT = new Uint8Array(64);
  this.r = function () {
    var aN;
    for (aWT[0] = 45, aWT[37] = 95, aN = 0; aN < 10; aN++) aWT[aN + 1] = 48 + aN;
    for (aN = 0; aN < 26; aN++) aWT[aN + 11] = 65 + aN, aWT[aN + 38] = 97 + aN;
  }, this.fy = function (oC) {
    for (var a1g = ft, a1Z = new Uint8Array(oC), aN = 0; aN < oC; aN++) a1Z[aN] = a1g.bg(6);
    return a1Z;
  }, this.fx = function (a1Z) {
    for (var aM = a1Z.length, aWU = aWT, a6 = [], aN = 0; aN < aM; aN++) a6.push(String.fromCharCode(aWU[a1Z[aN]]));
    return a6.join("");
  }, this.dG = function (value, aWV) {
    for (var aWU = aWT, a6 = [], aN = 0; aN < aWV; aN++) a6.push(String.fromCharCode(aWU[value >> 6 * (aWV - 1 - aN) & 63]));
    return a6.join("");
  };
}
function aWW() {
  var gap,
    qK,
    eT = [0, 0, 0, 0, 0],
    eU = [0, 0, 0, 0, 0],
    fM = [1, 1, 1, 1, 1],
    aY = [!0, !0, !0, !1, !1],
    bW = (this.oP = [!0, !0, !0, !1, !1], null);
  this.vw = function (es, aWX) {
    bW = es, aY = aWX, qK = [zK.zL, zK.zM, zK.za, zK.za, zK.zb], this.r();
  }, this.r = function () {
    if (dQ.t7()) {
      var aN,
        g2 = Math.floor((cA.hg.hh() ? .261 : .195) * d9.dC),
        g3 = Math.floor(.9 * g2),
        a3W = Math.floor(.17 * g3);
      if (gap = cA.hg.hh() ? 2 * lS.gap : lS.gap, fM[0] = g2 / bW[0].width, fM[1] = g3 / bW[1].width, fM[2] = a3W / bW[2].height, fM[3] = a3W / bW[3].height, fM[4] = a3W / bW[4].height, fM[2] *= 1.7, fM[3] *= 1.07, eT[0] = gap, eT[1] = gap, eT[2] = gap, eT[3] = gap, eT[4] = Math.floor(2 * gap + fM[3] * bW[3].width), eU[0] = gap, eU[1] = eU[0] + gap + fM[0] * bW[0].height, eU[2] = eU[1] + gap + fM[1] * bW[1].height, eU[3] = eU[2] + gap + fM[2] * bW[2].height, eU[4] = eU[3], !aY[0]) for (aN = 0; aN < 5; aN++) eU[aN] -= fM[0] * bW[0].height + gap;
      if (!aY[1]) for (aN = 2; aN < 5; aN++) eU[aN] -= fM[1] * bW[1].height + gap;
    }
  }, this.mg = function () {
    return !(7 === jE.jF() && cA.hg.hh());
  }, this.mv = function (hw, hx) {
    if (bW && this.mg()) for (var aN = aY.length - 1; 0 <= aN; aN--) if (aY[aN] && this.oP[aN] && eT[aN] < hw && eU[aN] < hx && hw < eT[aN] + fM[aN] * bW[aN].width && hx < eU[aN] + fM[aN] * bW[aN].height) return aq.fu(9, aq.fv, new aD5(L(336), aR.b.aWY(qK[aN]))), !0;
    return !1;
  }, this.dd = function () {
    if (bW && this.mg()) {
      var aN;
      for (dE.imageSmoothingEnabled = !0, aN = 0; aN < 5; aN++) aY[aN] && this.oP[aN] && (dE.setTransform(fM[aN], 0, 0, fM[aN], eT[aN], eU[aN]), dE.drawImage(bW[aN], 0, 0));
      dE.setTransform(1, 0, 0, 1, 0, 0);
    }
  };
}
function aWZ() {
  this.v6 = 2, this.c9 = 1764, this.a9e = 0;
  this.rVersion = 25, this.r = function () {
    this.a70 = "2.16.66", this.cB = "🎃 30 Oct 2026 [" + this.a70 + "]", this.hostname = window.location.hostname.toLowerCase(), this.cC = 0 <= this.hostname.indexOf("territorial.io"), this.a9f = 0 <= this.hostname.indexOf("github.io"), this.aGF = 0 <= this.hostname.indexOf("game.territorial.io"), this.cD = function () {
      try {
        return window.self !== window.top;
      } catch (b7) {
        return !0;
      }
    }(), this.lj = new Date().getTime() % 1048576, console.log("hostname: [" + this.hostname + "] validHostname: " + +this.cC + " validMod: " + +this.a9f);
  }, this.a6z = 0;
}
function aWf() {
  this.oK = new aKB(), this.vS = new o6(), this.aKT = new a5F(), this.r = function () {
    ct.mH || this.oK.r();
  }, this.f1 = function () {
    ct.mH || (this.oK.f1(), 3 !== aq.fv) || dy.f2() % 15 != 5 && 2 !== ct.dX || aq.mA().aN0();
  }, __fx.replay.restartReplay = () => this.a5P(), this.a5P = function () {
    var aWh = 0 !== ct.dX,
      aWi = ct.v1;
    aWh || jE.u9(), ct.v0.qz(), ct.data.canvas = null, aF.b1.close(aF.b1.c7, 3257), aF.b1.c7 = 0, ct.data.isReplay = 1, ct.v3(), aWh && (ct.v1 = aWi);
  }, this.aN2 = function (bS) {
    var aN = bS.indexOf("=");
    return 0 <= aN ? bS.substring(aN + 1) : bS;
  }, this.aN1 = function (bS) {
    return bS;
  }, __fx.replayHistory.load = saved => {
    saved = gF.aN2(saved), gF.aKT.jS(saved) && gF.a5P();
  };
}
function m1() {
  this.dd = function () {
    if (0 !== h5.b1.m2 && (dE.globalAlpha = Math.min(h5.b1.m2 / 580, 1), dE.drawImage(h5.b1.a4l, 1 + qA.aDT(), 1 + qA.mw()), dE.globalAlpha = 1, ct.dO)) {
      for (var e3 = e4 / e5, e6 = e7 / e5, e8 = (d9.aO + e4) / e5, e9 = (d9.dA + e7) / e5, s9 = h5.b1.a4k * e5, a4m = h5.b1.a4m, aN = ct.dP - 1; 0 <= aN; aN--) !function (aN, s9, e3, e6, e8, e9, a4m) {
        var highlight;
        0 === d3.eF[aN] || 0 === d3.d4[aN] || ((highlight = __fx.settings.highlightClanSpawns && __fx.clanFilter.inOwnClan[aN]) && (s9 *= 2), e8 = d9.aO * ((d3.dM[aN] + d3.dS[aN] + 1) / 2 - e3) / (e8 - e3) - .5 * s9, e3 = d9.dA * ((d3.dN[aN] + d3.dT[aN] + 1) / 2 - e6) / (e9 - e6) - .5 * s9, d9.aO < e8) || e3 > d9.dA || e8 < -s9 || e3 < -s9 || (highlight ? dE.setTransform(2 * e5, 0, 0, 2 * e5, e8, e3) : dE.setTransform(e5, 0, 0, e5, e8, e3), dE.drawImage(a4m[ct.il ? ey.iy[aN] : 1], 0, 0));
      }(aN, s9, e3, e6, e8, e9, a4m);
      dE.setTransform(e5, 0, 0, e5, 0, 0);
    }
  };
}
function aRX() {
  this.aWm = function (ek, player) {
    fA.aKe(ct.eG, player, ek), aF.a2A.yU(ek, player);
  }, this.aWn = function (player) {
    fA.aQH(player, 0), aF.a2A.yX(player);
  }, this.aWo = function (aWp, player) {
    fA.aWq(aWp, player), aF.a2A.yY(aWp, player);
  }, this.aLQ = function () {
    ct.kD || ct.mH || aF.aNQ.aLQ();
  };
}
function aHH(aWr, aWs, aWt) {
  this.eT = 0, this.eU = 0, this.aO = 0, this.dA = 0, this.resize = function () {
    this.dA = Math.min(aR.b.o4(aWt || .5) * aWr[1] * d9.dC, d9.dA - 2 * lS.gap), this.aO = Math.min(this.dA * (aWr[0] / aWr[1]), d9.aO - 2 * lS.gap), this.dA = aWr[1] * this.aO / aWr[0], this.eT = lS.gap + aWs[0] * (d9.aO - this.aO - 2 * lS.gap), this.eU = lS.gap + aWs[1] * (d9.dA - this.dA - 2 * lS.gap);
  }, this.aWu = function () {
    return this.eT + .5 * this.aO;
  };
}
function aWv() {
  var fS = new Date().getTimezoneOffset();
  return 127 & Math.abs(Math.floor((900 + fS + .5) / 15));
}
function wN() {
  var tL, tM, tN, aw;
  function tO() {
    tQ(), 2 !== ct.data.sResourcesType && (ct.data.sResourcesData = null), aq.tS()[19] = null, aq.ar();
  }
  function tQ() {
    2 === ct.data.sResourcesType && aR.d.tT(tN.tU(), ct.data.sResourcesData, 2047);
  }
  this.show = function () {
    tL.show(), this.resize();
  }, this.bU = function () {
    tL.bU();
  }, this.resize = function () {
    tL.resize(), tM.resize();
  }, this.bV = function (bW) {
    2 === bW && tL.bX[0].bY();
  }, tL = new ao(L(139), [new ap("⬅️ " + L(1), tO)]), tM = new at(tL.au, (function (aw) {
    var ay = new az();
    ay.b3(L(51)), ay.ta(new tb({
      fY: [L(136), L(52), L(55)],
      value: ct.data.sResourcesType
    }, function (af) {
      tQ(), 2 !== af || ct.data.sResourcesData || (ct.data.sResourcesData = new Uint16Array(ct.cv)), ct.data.sResourcesType = af, aq.fu(28);
    })), aw.push(ay);
  }(aw = []), function (aw) {
    var ay;
    1 === ct.data.sResourcesType && ((ay = new az()).b3("Value"), ay.b8(new b5({
      af: -1,
      value: ct.data.sResourcesValue
    }, 1, 0, function (b7) {
      var value = he.hf(Math.floor(b7.target.value), 0, 2047);
      b7.target.value = ct.data.sResourcesValue = value;
    })), aw.push(ay));
  }(aw), function (aw) {
    var ay;
    2 === ct.data.sResourcesType && ((ay = new az()).b3("Data"), (tN = new tc(0, 1, 0, 1)).td(aR.h.te(ct.data.sResourcesData, 2)), ay.b8(tN), aw.push(ay));
  }(aw), aw));
}
function aWw() {
  this.aVo = function (player, gc) {
    return -1 !== gc && !!h0.nd.a4L(player, gc) && this.ot(player, gc, 0);
  }, this.ot = function (player, gc, aWx) {
    player = function (player, gc, aWx) {
      var a8b = h0.nd.a4C(player, gc);
      if (-1 === a8b) return -1;
      a8b = h0.nd.a4I(a8b, gc);
      if (-1 === a8b) return -1;
      var a9R = h0.gd.ga(a8b, gc);
      if (0 <= a9R) return a9R;
      if (h0.gd.gZ()) return -1;
      if (0 <= (a9R = h0.gd.ga(gc, a8b))) return h0.gd.gp(h0.gd.ge(h0.gd.get(a9R)));
      if (a8b === gc) return h0.gd.gp(new Uint32Array([a8b, gc]));
      if (0 <= (a9R = h0.aWy.ot(a8b, gc))) return a9R;
      return aWx ? function (aX0, player) {
        var aX1 = k3.aX1,
          buffer = (aX1.fill(0), [aX0]),
          hc = (aX1[aX0] = 1, dr.hc),
          aPV = -1,
          aM = buffer.length;
        for (; -1 === aPV && aM;) {
          for (var a6 = [], aN = 0; aN < aM; aN++) for (var gm = buffer[aN], a3O = aX1[gm], fS = 0; fS < 8; fS++) {
            var a2y,
              aGc,
              a4H = gm + hc[fS],
              fK = 4 * a4H;
            d5.hl(fK) ? (a2y = aX1[a4H], aGc = a3O + 5 + ((1 & fS) << 1), 0 === a2y ? (a6.push(a4H), aX1[a4H] = aGc) : aX1[a4H] = Math.min(aGc, a2y)) : -1 === aPV && fS % 2 == 0 && d5.fT(player, fK) && (aPV = gm);
          }
          aM = (buffer = a6).length;
        }
        return -1 !== aPV ? function (i4, aX3) {
          var hc = dr.hc,
            aX4 = -1,
            iR = 0,
            a48 = [];
          for (; aX3 !== i4;) (iR = function (gm, iR) {
            var aX1 = k3.aX1,
              hc = dr.hc,
              a3O = aX1[gm];
            if (a3O - aX1[gm + hc[iR]] != 5 + ((1 & iR) << 1)) for (var aQ = 0; aQ < 8; aQ++) {
              var fS = aQ + iR + 6 & 7;
              if (a3O - aX1[gm + hc[fS]] == 5 + ((1 & fS) << 1)) return fS;
            }
            return iR;
          }(aX3, iR)) !== aX4 && (a48.push(aX3), aX4 = iR), aX3 += hc[iR];
          a48.push(i4);
          var a9R = h0.gd.ga(a48[0], i4);
          if (0 <= a9R) return a9R;
          return h0.gd.gp(new Uint32Array(a48));
        }(aX0, aPV) : -1;
      }(gc, player) : -1;
    }(player, gc, aWx);
    return -1 !== player && (k3.a6[0] = h0.gd.get(player), !0);
  };
}
function w9(data) {
  var am, an;
  function aX6(aw, aXY) {
    if (!data.aT5) {
      if (data.aSs) {
        if (aXY) return;
      } else {
        if (!aXY) return;
        if (data.aMX < 1e4) return;
      }
      var aXb,
        ay = new az(),
        aXZ = aXY && 1e5 <= data.aMX,
        aXa = ay.b3(aXY ? (aXZ ? "⚠️ " : "") + L(427) : L(176)),
        a78 = (aXZ && (aXa.style.color = "yellow"), aXY ? ay.bR(L(428, [aR.h.aCx(data.aMX, .01, 0)])) : ((aXb = new b5({
          value: data.aSt,
          af: -1
        })).b7.readOnly = !0, aXb.b7.type = "password", ay.b8(aXb), ay.b8(new bL([new ap(L(296), function (b7) {
          return b7.textContent === L(296) ? (b7.textContent = L(297), aXb.b7.type = "text") : (b7.textContent = L(296), aXb.b7.type = "password"), !0;
        }).button, new ap(L(364), function (b7) {
          return aR.b.aXR(aXb.b7), aR.b.bN(b7), !0;
        }).button]))), ay.b0(L(aXY ? 176 : 429)).style.marginTop = "0.75em", new b5({
          value: "",
          af: -1
        }, 0, 0)),
        aXc = (a78.b7.type = "email", a78.b7.autocomplete = "email", a78.b7.name = "email", a78.b7.inputMode = "email", a78.b7.spellcheck = !1, ay.b8(a78), ay.b8(new bL([new ap(L(430), function (b7) {
          return aF.bO.a79({
            action: 3,
            bS: a78.b7.value.trim().substring(0, 63)
          }), aR.b.bN(b7), !0;
        }).button])), aXY && ay.bR(L(431)), ay.b0(L(432)).style.marginTop = "0.75em", new b5({
          value: "",
          af: -1
        }, 1));
      ay.b8(aXc), ay.b8(new bL([new ap(L(433), function () {
        aF.bO.bP({
          action: 4,
          ah: "",
          value: Math.floor(+aXc.b7.value)
        }), aq.fu(8, aq.mA().mB, new fw(18));
      }).button])), aw.push(ay);
    }
  }
  this.show = function () {
    data.aT5 && aRB.aRD("account", data.ah), am.show(), this.resize();
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), an.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(data.username, [new ap("⬅️ " + L(1), function () {
    aRB.clear(), aq.ar();
  }), new ap(data.aT5 ? "🔄 " + L(337) : L(338), function () {
    aq.fu(8, data.aT5 ? aq.mA().mB : void 0, new fw(25, {
      action: 0,
      ah: data.ah,
      fs: data.fs
    }));
  }, 0, 0, 1)]), an = new at(am.au, function () {
    var aw = [];
    aX6(aw, 1), aw.push(function () {
      var ay = new az();
      ay.b3(L(400)), data.aSs && (ay.b0("✅ " + L(401)).style.marginBottom = "0.75em");
      var aGb = data.aSp;
      aGb < 1 ? (ay.b0(L(402)), 0 === data.aSo ? ay.bR(L(403)) : 1 === data.aSo ? ay.bR(L(404)) : 2 === data.aSo ? ay.bR(L(405)) : 3 === data.aSo ? ay.bR(L(406)) : 4 === data.aSo ? ay.bR(L(407)) : 5 === data.aSo ? ay.bR(L(408)) : 6 === data.aSo ? ay.bR(L(409)) : ay.bR(L(410))) : (ay.b0(L(411)), aGb = aGb < 2 ? L(412) : aGb < 61 ? 2 === aGb ? L(413) : L(414, [aGb - 1]) : aGb < 84 ? 61 === aGb ? L(415) : L(416, [aGb - 60]) : aGb < 255 ? 84 === aGb ? L(417) : L(418, [aGb - 83]) : L(419), ay.bR(aGb));
      {
        var bQ, bA;
        ay.b8(new aMl()), data.aT5 && (bQ = ay.bR(), ay.b8(new bL([new ap(b6.aEh.ls(data.ah) ? L(420) : L(421), function (b7) {
          return b6.aEh.lt(data.ah) ? (b7.textContent = L(420), bA(1)) : (b7.textContent = L(421), bA(0)), !0;
        }).button])), bA = function (aY) {
          bQ.textContent = aY ? L(422) : "";
        }, b6.aEh.ls(data.ah) && bA(1), ay.b8(new aMl()));
      }
      var zJ,
        a77 = new b5({
          value: data.username,
          af: -1
        });
      a77.b7.readOnly = !0, ay.b8(a77), ay.b8(new bL([new ap(L(364), function (b7) {
        return aR.b.aXR(a77.b7), aR.b.bN(b7), !0;
      }).button])), data.aT5 || ay.bR(L(423));
      (data.aSu || data.aSv || data.aSw) && (ay.b8(new aMl()), ay.bR(L(424)), data.aSu && (ay.bR("• Account Timeout").style.color = "orange"), data.aSv && ((zJ = ay.bR("• Muted")).style.color = "orange", zJ.style.marginTop = "0.5em"), data.aSw) && ((zJ = ay.bR("• Redacted")).style.color = "orange", zJ.style.marginTop = "0.5em");
      data.aT5 && (ay.b8(new aMl()), ay.b0(aF.b1.b2("/wiki/reports"), "0.75em").style.marginBottom = "0.8em", ay.b8(new bL([new ap(L(425), function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 0
        }), aR.b.bN(b7), !0;
      }, bG.a9u).button])), ay.b8(new bL([new ap(L(426), function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 1
        }), aR.b.bN(b7), !0;
      }, bG.a9u).button])), ay.b8(new bL([new ap("Cheater", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 2
        }), aR.b.bN(b7), !0;
      }, bG.a9u).button])), ay.b8(new bL([new ap("False Reporter", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 3
        }), aR.b.bN(b7), !0;
      }, bG.a9u).button])), aGb = "CRTOR" === (aGb = b6.buffer.data[105].value) || "ADMIN" === aGb) && (ay.b8(new bL([new ap("Block Account", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 4
        }), aR.b.bN(b7), !0;
      }, bG.sz).button])), ay.b8(new bL([new ap("Ban IP", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 5
        }), aR.b.bN(b7), !0;
      }, bG.sz).button])), ay.b8(new bL([new ap("Gold Seizure", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 6
        }), aR.b.bN(b7), !0;
      }, bG.sz).button])), ay.b8(new bL([new ap("Remove Punishments", function (b7) {
        return aF.bO.bP({
          action: 3,
          ah: data.ah,
          value: 7
        }), aR.b.bN(b7), !0;
      }, bG.a95).button])));
      return ay;
    }()), function (aw) {
      var ay, a77, dA, bE, aE4, bC;
      data.aT5 && data.aSx && ((ay = new az()).b3(L(362)), ay.bR(L(359)), (a77 = new b5({
        value: data.aSx,
        af: -1
      })).b7.readOnly = !0, ay.b8(a77), dA = !1, bE = new ap(L(363), function (b7) {
        return dA && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.aMZ({
          action: 9,
          ah: data.ah
        }), b6.bJ.bK(105, aZ.aa.a2x(data.ah, 5)), aq.fu(8, aq.wU(7).mB, new fw(18))), !0;
      }, 1), aE4 = new ap(L(5), function (b7) {
        return b7.textContent === L(5) ? (dA = !0, b7.textContent = L(6), bE.bF(0), bE.button.style.color = bG.bI) : bC(), !0;
      }), ay.b8(new bL([aE4.button])), bC = function () {
        dA = !1, aE4.button.textContent = L(5), bE.bF(1), bE.button.style.color = bG.bH;
      }, ay.b8(new bL([bE.button])), aw.push(ay));
    }(aw), function (aw) {
      var ay, bQ, aTv, aPw, bE, aE4, bC;
      data.aT5 || ((ay = new az()).b3(L(434)), (bQ = ay.bR(data.aSk.length + " / 160")).style.textAlign = "center", aTv = !0, (aPw = new tc(0, 1, function (b7) {
        b7 = b7.target.value.length;
        bQ.textContent = b7 + " / 160", 160 < b7 ? aTv && (aTv = !1, aE4.bF(1)) : aTv || (aTv = !0, aE4.bF(0));
      })).b7.rows = 6, aPw.b7.style.fontSize = "1em", aPw.td(data.aSk), ay.b8(aPw), 0 !== data.aSi ? (aE4 = new ap(L(435), function () {
        if (!aTv) return !0;
        aq.fu(8, aq.mA().mB, new fw(29, {
          action: 1,
          bS: aPw.tU().substring(0, 160)
        }));
      }, 0, 0, 1), ay.b8(new bL([aE4.button])), ay.b8(new bL([new ap(1 === data.aSi ? L(436) : L(437), function () {
        aq.fu(8, aq.mA().mB, new fw(29, {
          action: 0,
          bS: ""
        }));
      }, 0, 0, 1).button])), ay.bR(1 === data.aSi ? L(438, [data.aSl - 1]) : L(439, [data.aSl - 1])), ay.bR(L(440, [data.aSj]))) : (bE = new ap(L(363), function () {
        if (!aPw.b7.readOnly) return !0;
        aq.fu(8, aq.mA().mB, new fw(29, {
          action: 1,
          bS: aPw.tU().substring(0, 160)
        }));
      }, 1), aE4 = new ap(L(5), function (b7) {
        if (b7.textContent === L(5)) {
          if (!aTv) return !0;
          b7.textContent = L(6), aPw.b7.readOnly = !0, bE.bF(0), bE.button.style.color = bG.bI;
        } else bC();
        return !0;
      }), ay.b8(new bL([aE4.button])), ay.bR(L(440, [data.aSj])), bC = function () {
        aE4.button.textContent = L(5), aPw.b7.readOnly = !1, bE.bF(1), bE.button.style.color = bG.bH;
      }, ay.b8(new bL([bE.button]))), aw.push(ay));
    }(aw), function (aw) {
      var ay;
      data.aT5 && 0 !== data.aSi && ((ay = new az()).b3(L(441)), ay.aXd(data.aSk), ay.b8(new bL([new ap(L(442, 0, "Report"), function (b7) {
        return aF.b1.bM(0) && (aR.b.bN(b7), aF.bO.aMZ({
          action: 5,
          ah: data.ah
        })), !0;
      }, 0, 0, 1).button])), aw.push(ay));
    }(aw), aw.push(function () {
      var ay = new az(),
        aXO = (ay.b3(L(339)), ay.b0(aF.b1.b2("/wiki/gold"), "0.75em").style.marginBottom = "0.8em", [L(340), L(341), L(342), L(343), L(344), L(345), L(346), L(347), L(348), L(349), L(350), L(351), L(352), L(353)]),
        uW = data.aSm;
      return ay.b0(L(354) + aR.h.aCx(data.aMX, .01, 2) + "<br>" + L(355) + (uW + 1) + " / " + data.aRM + "<br>" + L(356) + aXO[function (uW, aMX) {
        if (uW < 10) return 0;
        if (uW < 30) return 1;
        if (uW < 60) return 2;
        if (3e4 <= (aMX = he.iA(aMX, 100))) return 3;
        if (12e3 <= aMX) return 4;
        if (7e3 <= aMX) return 5;
        if (3e3 <= aMX) return 6;
        if (1e3 <= aMX) return 7;
        if (500 <= aMX) return 8;
        if (200 <= aMX) return 9;
        if (70 <= aMX) return 10;
        if (20 <= aMX) return 11;
        if (3 <= aMX) return 12;
        return 13;
      }(uW, data.aMX)]), ay;
    }()), data.aT5 && aw.push(function () {
      var ay = new az(),
        a77 = (ay.b3(L(357)), ay.b0(aF.b1.b2("/wiki/transactions"), "0.75em").style.marginBottom = "0.8em", new b5({
          value: b6.buffer.data[147].value,
          af: -1
        }, 1, void 0, function (b7) {
          b6.bJ.bK(147, bA(b7.target.value));
        })),
        bE = (ay.b8(a77), new ap(L(7), function (b7) {
          return a77.b7.readOnly && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.bP({
            action: 0,
            ah: data.ah,
            value: parseInt(b6.buffer.data[147].value, 10)
          })), !0;
        }, 1)),
        aE4 = new ap(L(5), function (b7) {
          return b7.textContent === L(5) ? (b7.textContent = L(6), a77.b7.readOnly = !0, bE.bF(0), bE.button.style.color = bG.bI, b6.bJ.bK(147, a77.b7.value), bA(b6.buffer.data[147].value)) : bC(), !0;
        }),
        bQ = (ay.b8(new bL([aE4.button])), ay.bR()),
        bA = function (aY) {
          return bQ.innerHTML = aq.b1.bT(aY, b6.buffer.data[105].value, data.ah), aY;
        },
        bC = function () {
          aE4.button.textContent = L(5), a77.b7.readOnly = !1, bE.bF(1), bE.button.style.color = bG.bH;
        };
      return bA(b6.buffer.data[147].value), ay.b8(new bL([bE.button])), ay;
    }());
    aw.push(function () {
      var ay = new az(),
        a77 = (ay.b3(L(175)), new b5({
          value: data.ah,
          af: -1
        })),
        aXQ = (a77.b7.readOnly = !0, ay.b8(a77), ay.b8(new bL([new ap(L(364), function (b7) {
          return aR.b.aXR(a77.b7), aR.b.bN(b7), !0;
        }).button])), ay.b8(new aMl()), new b5({
          value: data.ah,
          af: -1
        }));
      return ay.b8(aXQ), ay.b8(new bL([new ap(L(365), function (b7) {
        aq.fu(8, aq.mA().mB, new fw(25, {
          action: 0,
          ah: aXQ.b7.value,
          fs: 0
        }));
      }).button])), ay;
    }()), data.aT5 || (aw.push(function () {
      var ay = new az(),
        aPH = (ay.b3(L(295)), new b5(b6.buffer.data[106]));
      return aPH.b7.readOnly = !0, aPH.b7.type = "password", ay.b8(aPH), ay.b8(new bL([new ap(L(296), function (b7) {
        return b7.textContent === L(296) ? (b7.textContent = L(297), aPH.b7.type = "text") : (b7.textContent = L(296), aPH.b7.type = "password"), !0;
      }).button, new ap(L(364), function (b7) {
        return aR.b.aXR(aPH.b7), aR.b.bN(b7), !0;
      }).button])), ay.b8(new bL([new ap(L(366), function () {
        aq.fu(8, aq.mA().mB, new fw(15));
      }).button])), ay.b3(L(298), "0.8em"), ay.bR(L(367)), ay.bR(L(368)), ay.bR(L(369)), ay;
    }()), aw.push(function () {
      var ay = new az();
      return ay.b3(L(370)), ay.b8(new bL([new ap(L(371), function () {
        aq.fu(6, aq.mA().mB);
      }).button])), ay.b8(new bL([new ap(L(372), function () {
        b6.bJ.bK(105, ""), aq.fu(8, aq.mA().mB, new fw(18));
      }).button])), ay.b8(new bL([new ap(L(373) + b6.buffer.data[105].value, function () {
        aq.fu(4, 0, new mC(L(374), L(375), !0, [new ap("⬅️ " + L(1), function () {
          aq.fu(7, aq.wU(7).mB);
        })]));
      }, bG.a9u).button])), ay;
    }()), aw.push(function () {
      function aXU(af) {
        aXT[0].bF(0 === af ? bG.zT : bG.mQ), aXT[1].bF(0 === af ? bG.zT : bG.a9u);
      }
      var aXS,
        aXT,
        ay = new az();
      ay.b3(L(379)), ay.bR(L(380)), b6.b1.j4();
      return aXT = [new ap(L(294), function () {
        var af = Math.min(b6.buffer.data[117].value, aXS.a0G.length - 1);
        af < 1 || (af = b6.b1.j8(af), b6.bJ.bK(105, af.ah), b6.bJ.bK(106, af.password), aq.fu(8, aq.mA().mB, new fw(18)));
      }, bG.zT, 1), new ap(L(378), function () {
        var af = Math.min(b6.buffer.data[117].value, aXS.a0G.length - 1);
        if (!(af < 1)) {
          aXS.a0G[af].remove(), aXS.a0G.splice(af, 1);
          for (var aN = af; aN < aXS.a0G.length; aN++) aXS.a0G[aN].name = "" + aN;
          b6.b1.j7(af), af = b6.buffer.data[117].value, aXS.a0G[af].textContent = aXS.a0G[af].textContent.replace("⚪", "🟢"), aXU(af);
        }
      }, bG.zT, 1)], aXS = new tb(b6.buffer.data[117], aXU), aXU(0), aXS.a0G[0].style.marginTop = "0.5em", ay.ta(aXS), ay.b8(new bL([aXT[0].button])), ay.b8(new bL([aXT[1].button])), ay;
    }()));
    return aw.push(function () {
      var ay = new az(),
        aXO = (ay.b3(L(384)), [L(385), L(386), L(387), L(388)]),
        uW = data.aSn;
      return ay.b0(L(389) + (data.aGQ / 100).toFixed(2) + "<br>" + L(355) + (uW + 1) + " / " + data.aRM + "<br>" + L(356) + aXO[uW < 10 ? 0 : uW < 50 ? 1 : uW < 200 ? 2 : 3]), ay;
    }()), aw.push(function () {
      var ay = new az();
      return ay.b3(L(381)), ay.b0(L(382) + aR.h.aCx(data.aRJ, .1, 1) + "<br>" + L(355) + (data.aRK + 1) + " / " + data.aRM + "<br>" + L(383) + data.aRL), ay;
    }()), function (aw) {
      var ay = new az(),
        aXe = data.aRP,
        aXf = (ay.b3(L(443)), ay.b0(L(444, [data.aRN.length ? "[" + data.aRN + "]" : "-"])), ay.b0(L(445, [aR.h.aCx(aXe, .01, 2)])), ay.b0(L(446, [data.aRR + 1 + " / " + data.aRM])), data.aRS),
        aXg = (ay.b0(L(447, [aR.h.aCx(aXf, .1, 1)])), data.aRU);
      ay.b0(L(448, [aXg])), ay.b0(L(449, [aR.h.aCx(aXf / Math.max(aXg, 1), .1, 2)])), aXe = data.aRQ, ay.b3(L(450), "0.8em"), ay.b0(L(444, [data.aRO.length ? "[" + data.aRO + "]" : "-"])), ay.b0(L(445, [aR.h.aCx(aXe, .01, 2)])), aXf = data.aRT, ay.b0(L(447, [aR.h.aCx(aXf, .1, 1)])), aXg = data.aRV, ay.b0(L(448, [aXg])), ay.b0(L(449, [aR.h.aCx(aXf / Math.max(aXg, 1), .1, 2)])), ay.b0(aF.b1.b2("/wiki/clans"), "0.75em").style.marginTop = "0.8em", aw.push(ay);
    }(aw), function (aw) {
      var ay = new az();
      ay.b3(L(451)), ay.b0(L(389) + (data.aSg / 10).toFixed(1) + "<br>" + L(356) + (data.aSh.length ? L(452, [data.aSh]) : L(453))), data.aT5 && ay.b8(new bL([new ap(L(398), function (b7) {
        return aF.b1.bM(0) && (aR.b.bN(b7), aF.bO.aMZ({
          action: 4,
          ah: data.ah
        })), !0;
      }, 0, 0, 1).button]));
      ay.b0(aF.b1.b2("/wiki/clans"), "0.75em").style.marginTop = "0.8em", aw.push(ay);
    }(aw), aw.push(function () {
      var ay = new az();
      {
        var a77, aE4, aXW, bQ, bA, bC;
        ay.b3(L(396)), ay.b0(L(397) + data.aSe + "<br>" + L(355) + (data.aSf + 1) + " / " + data.aRM + "<br>" + L(356) + a0B.aXV(data.aSf)), data.aT5 && ((a77 = new b5({
          value: b6.buffer.data[157].value,
          af: -1
        }, 1, void 0, function (b7) {
          b6.bJ.bK(157, bA(b7.target.value));
        })).b7.style.marginTop = "0.6em", ay.b8(a77), aE4 = new ap(L(5), function (b7) {
          return b7.textContent === L(5) ? (b7.textContent = L(6), a77.b7.readOnly = !0, aXW[0].bF(0), aXW[0].button.style.color = bG.bI, bA(b6.buffer.data[157].value)) : bC(), !0;
        }), ay.b8(new bL([aE4.button])), aXW = [new ap(L(398), function (b7) {
          return a77.b7.readOnly && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.bP({
            action: 1,
            ah: data.ah,
            value: he.hf(parseInt(b6.buffer.data[157].value, 10), 2, 3e4)
          })), !0;
        }, 1)], bQ = ay.bR(), bA = function (aY) {
          return aY = aR.f.a3F(aY, 2, 3e4), bQ.textContent = L(399, [aY - 1, aY, b6.buffer.data[105].value]), aY;
        }, ay.b8(new bL([aXW[0].button])), bC = function () {
          aE4.button.textContent = L(5), a77.b7.readOnly = !1, aXW[0].bF(1), aXW[0].button.style.color = bG.bH;
        }, bA(b6.buffer.data[157].value));
      }
      return ay;
    }()), function (aw) {
      var ay, aOD;
      data.aT5 && !data.aSy || (0 === cA.id || data.aT5 || data.aSy) && ((ay = new az()).b3("Patreon"), !data.aT5 && data.aSz ? ay.b8(new bL([new ap(L(296), function () {
        aF.bO.aMZ({
          action: 7,
          ah: data.ah
        }), data.aSz = 0, aq.fu(7);
      }).button])) : data.aSy ? (ay.b0(L(454, [(data.aT0 / 100).toFixed(2)]) + "<br>" + L(455, [1 + data.aT1 + " / " + data.aT2]) + "<br>" + L(456, [data.aT3 ? L(457) : L(458)])), data.aT5 || ay.b8(new bL([new ap(L(459), function () {
        aF.bO.aMZ({
          action: 8,
          ah: data.ah
        }), data.aSy = 0, b6.bJ.bK(160, 0), aq.fu(7);
      }).button]))) : (ay.b0(L(460), "0.75em").style.marginBottom = "0.3em", ay.b0("  • " + L(461), "0.75em").style.whiteSpace = "pre", ay.b0("  • " + L(462), "0.75em").style.whiteSpace = "pre", ay.b0("  • " + L(463), "0.75em").style.whiteSpace = "pre", ay.b0(L(464), "0.75em").style.marginTop = "1.0em", ay.b0(L(465), "0.75em").style.marginTop = "1.0em", ay.b0("<a href='" + zK.zN + "' target='_blank'>patreon.com/c/territorial</a>", "0.75em").style.marginTop = "0.3em", aOD = "https://www.patreon.com/oauth2/authorize?state=" + data.ah + "&response_type=code&client_id=wWuOlDVZwn1sxSN9Wm4I9sJA3Ewfw7Zz4MjTMf9el2v3lviVkDwFtr92n7Tdlrhc&redirect_uri=https://" + aF.b1.a5R() + "/", ay.b0(L(466), "0.75em").style.marginTop = "1.0em", ay.b0("<a href='" + aOD + "' target='_blank'>patreon.com/oauth2/...</a>", "0.75em").style.marginTop = "0.3em", data.aT5 || (ay.b8(new aMl()), ay.b8(new bL([new ap(L(297), function () {
        aF.bO.aMZ({
          action: 6,
          ah: data.ah
        }), data.aSz = 1, aq.fu(7);
      }).button])), ay.b0(L(467), "0.75em").style.marginTop = "0.75em")), aw.push(ay));
    }(aw), aw.push(function () {
      var ay = new az(),
        aXO = (ay.b3(L(390)), [L(391), L(392), L(393), L(394), "Scout", L(395)]),
        uW = data.aSq;
      return ay.b0(L(389) + (data.aSr / 100).toFixed(2) + "<br>" + L(355) + (uW + 1) + " / " + data.aRM + "<br>" + L(356) + aXO[uW < 3 ? 0 : uW < 20 ? 1 : uW < 100 ? 2 : uW < 500 ? 3 : uW < 2e3 ? 4 : 5]), ay.b0("<a href='https://territorial.fandom.com/wiki/Zombie_mode' target='_blank'>Unofficial Tutorial</a>", "0.75em").style.marginTop = "0.8em", ay;
    }()), function (aw) {
      var ay, a77, aXQ, bE, aE4, bC;
      data.aT5 || ((ay = new az()).b3(L(358)), ay.bR(L(359)), a77 = new b5({
        value: b6.buffer.data[184].value,
        af: -1
      }, 1, void 0, function (b7) {
        b6.bJ.bK(184, b7.target.value);
      }), ay.b8(a77), ay.bR(L(360)), aXQ = new b5({
        value: b6.buffer.data[185].value,
        af: -1
      }, 0, void 0, function (b7) {
        b6.bJ.bK(185, b7.target.value);
      }), ay.b8(aXQ), bE = new ap(L(361), function (b7) {
        return a77.b7.readOnly && aF.b1.bM(0) && (aR.b.bN(b7), bC(), aF.bO.bP({
          action: 5,
          ah: b6.buffer.data[185].value,
          value: he.hf(parseInt(b6.buffer.data[184].value, 10), 1, 1e9)
        })), !0;
      }, 1), aE4 = new ap(L(5), function (b7) {
        return b7.textContent === L(5) ? (b7.textContent = L(6), a77.b7.readOnly = !0, aXQ.b7.readOnly = !0, bE.bF(0), bE.button.style.color = bG.bI, b6.bJ.bK(184, a77.b7.value)) : bC(), !0;
      }), ay.b8(new bL([aE4.button])), bC = function () {
        aE4.button.textContent = L(5), a77.b7.readOnly = !1, aXQ.b7.readOnly = !1, bE.bF(1), bE.button.style.color = bG.bH;
      }, ay.b8(new bL([bE.button])), aw.push(ay));
    }(aw), function (aw) {
      var ay, aXS, aXT, af, aXU;
      data.aT5 || b6.aEh.get().length && ((ay = new az()).b3(L(376)), af = 0, aXU = function () {
        var tH = b6.aEh.get().length;
        aXT[0].bF(af === tH ? bG.zT : bG.mQ), aXT[1].bF(af === tH ? bG.zT : bG.a9u);
      }, aXT = [new ap(L(377), function () {
        aq.fu(8, void 0, new fw(25, {
          action: 0,
          ah: b6.aEh.get()[af],
          fs: 0
        }));
      }, bG.zT, 1), new ap(L(378), function () {
        b6.aEh.lw(af), aXS.a0G[af].remove(), aXS.a0G.splice(af, 1);
        for (var aN = af; aN < aXS.a0G.length; aN++) aXS.a0G[aN].name = "" + aN;
        b6.aEh.get().length && (af = Math.max(af - 1, 0), aXS.a0G[af].textContent = aXS.a0G[af].textContent.replace("⚪", "🟢")), aXU();
      }, bG.zT, 1)], aXU(), (aXS = new tb(b6.aEh.lr(), function (aN) {
        af = aN, aXU();
      })).a0G[0].style.marginTop = "0.5em", ay.ta(aXS), ay.b8(new bL([aXT[0].button])), ay.b8(new bL([aXT[1].button])), aw.push(ay));
    }(aw), aX6(aw, 0), aw;
  }());
}
function az() {
  var nx;
  this.aPD = [], this.nx = document.createElement("div"), this.b3 = function (bS, marginTop) {
    var title = document.createElement("h2");
    return title.textContent = bS, title.style.margin = "0", title.style.marginBottom = "0.6em", marginTop && (title.style.marginTop = marginTop), title.style.fontSize = "1.3em", title.style.overflowWrap = "break-word", this.nx.appendChild(title), title;
  }, this.bR = function (bS, marginBottom) {
    var bQ = document.createElement("p");
    return bQ.textContent = bS, bQ.style.fontSize = "0.75em", bQ.style.lineHeight = "1.2em", bQ.style.marginBottom = marginBottom || "0", this.nx.appendChild(bQ), bQ;
  }, this.aXd = function (bS) {
    var aXh = document.createElement("p");
    return aXh.textContent = bS, aXh.style.fontSize = "1em", aXh.style.marginBottom = "0", aXh.style.whiteSpace = "pre-wrap", aXh.style.overflowWrap = "break-word", this.nx.appendChild(aXh), aXh;
  }, this.b0 = function (ze, fontSize) {
    var nx = document.createElement("div");
    return nx.innerHTML = ze, nx.style.fontSize = fontSize || "1em", nx.style.lineHeight = "1.2em", this.nx.appendChild(nx), nx;
  }, this.ta = function (aXS) {
    for (var a0G = aXS.a0G, aM = a0G.length, aN = 0; aN < aM; aN++) this.nx.appendChild(a0G[aN]);
  }, this.b8 = function (c3) {
    return this.aPD.push(c3), this.nx.appendChild(c3.b7), c3;
  }, this.resize = function () {
    for (var aM = this.aPD.length, aN = 0; aN < aM; aN++) this.aPD[aN].resize && this.aPD[aN].resize();
  }, (nx = this.nx).style.position = "absolute", nx.style.height = "auto", nx.style.padding = "0.5em";
}
function aXi() {
  this.aR4 = new tG(), this.r = function () {
    this.aR4.resize();
  };
}
function aNR() {
  this.aLQ = function () {
    for (var aM = ct.dP, aGO = nH.result.aGO, aW = aGO.length, a5i = (bc.bd(17 + 16 * aM + 33 * aW), bc.bh(1, 1), bc.bh(4, 12), bc.bh(10, aW), bc.bh(1, +(2 === ct.uw)), bc.bh(1, ct.uy % 2), d3.a5i), aN = 0; aN < aM; aN++) bc.bh(16, a5i[aN]);
    for (var d4 = d3.d4, aN = 0; aN < aW; aN++) {
      var d1 = aGO[aN];
      bc.bh(9, d1), bc.bh(24, d4[d1]);
    }
    aF.b1.send(aF.b1.c7, bc.bk);
  };
}
function nj() {
  function aXw(a6, pL, pM) {
    var aXx = a6[pL];
    a6[pL] = a6[pM], a6[pM] = aXx;
  }
  this.aV = [[], [], [], []], this.jQ = [0, 0, 0, 0], this.a83 = [], this.jR = function (aXj, ah, username, aNn, aAu, aNo, elo, color, aMX, aNq, code) {
    username = this.aXl(ah, username, aNn, aAu, aNo, elo, color, aMX, aNq, code);
    this.aV[aXj].push(username), aI.nb === ah && (aI.nc = username), aI.ng.aXm(ah) && (username.ls = 1), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXj && 1 === aI.b1.a30[2];
  }, this.aXl = function (ah, username, aNn, aAu, aNo, elo, color, aMX, aNq, code) {
    return username = __fx.nameFilter.filter(username), {
      ah: ah,
      username: code ? username : "Player " + bs.aa.dG(ah, 2),
      aXn: username,
      aNn: aNn,
      aAu: aAu,
      aNo: aNo,
      elo: elo,
      color: color,
      aMX: aMX,
      aNq: aNq
    };
  }, this.jb = function (af, aXj, aNn, aAu, aNo, elo, aMX, color) {
    af = this.aV[aXj][af];
    af.aNn = aNn, af.aAu = aAu, af.aNo = aNo, af.elo = elo, af.aMX = aMX, af.color = color, aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXj && 1 === aI.b1.a30[2];
  }, this.jd = function (af, aXj, code) {
    af = this.aV[aXj][af];
    1 === code && (af.username = af.aXn), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXj && 1 === aI.b1.a30[2];
  }, this.jc = function (af, aXj, aXo) {
    var af = this.aV[aXj][af],
      aXp = af.username,
      aXq = "Redacted " + bs.aa.dG(af.ah, 2);
    af.username = aXo ? "[" + aR.h.ag(aXp) + "] " + aXq : aXq, aXp.indexOf("Redacted") < 0 && (af.aXr = aXp), aI.db.aXs(af.ah), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXj && 1 === aI.b1.a30[2];
  }, this.jZ = function (af, aXt, aXu) {
    var player = this.aV[aXt][af];
    this.ja(af, aXt), this.aV[aXu].push(player), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXu && 1 === aI.b1.a30[2];
  }, this.ja = function (af, aXt) {
    var aU = this.aV[aXt];
    this.a83.push(aU[af]), 1e3 < this.a83.length && this.a83.shift(), af >= this.jQ[aXt] ? aU[af] = aU[aU.length - 1] : (this.jQ[aXt]--, 2 === aXt ? (aU.splice(this.jQ[aXt] + 1, 0, aU[aU.length - 1]), aU.splice(af, 1)) : (aU[af] = aU[this.jQ[aXt]], aU[this.jQ[aXt]] = aU[aU.length - 1])), aU.pop(), aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === aXt && 1 === aI.b1.a30[2];
  }, this.jY = function (af, jk) {
    aI.b1.a31 += 29 === aq.fv && aI.b1.a30[0] === jk && 1 === aI.b1.a30[2];
    var aU = this.aV[jk],
      c3 = aU[af];
    if (2 === jk) {
      if (af >= this.jQ[jk]) {
        aI.ng.join(c3);
        for (var aXv = this.jQ[jk], elo = c3.elo; aXv && elo > aU[aXv - 1].elo;) aXv--;
        aU[af] = aU[this.jQ[jk]], aU.splice(this.jQ[jk]++, 1), aU.splice(aXv, 0, c3);
      } else aU.splice(this.jQ[jk]--, 0, c3), aU.splice(af, 1);
    } else af >= this.jQ[jk] ? (aI.ng.join(c3), aXw(aU, this.jQ[jk]++, af)) : aXw(aU, --this.jQ[jk], af);
  }, this.aNr = function (ah) {
    for (var aV = this.aV, aM = aV.length, aN = 0; aN < aM; aN++) for (var aU = aV[aN], aW = aU.length, aQ = 0; aQ < aW; aQ++) if (ah === aU[aQ].ah) return aU[aQ];
    return null;
  };
}
function aRY() {
  this.f1 = function (bk) {
    var id, oL, fN;
    for (ft.r(bk), ft.af += 2, fN = 8 * ft.size; ft.af + 8 <= fN;) id = ft.bg(4), oL = ft.bg(9), 0 === id ? this.aXy(id, oL, ft.bg(22)) : 1 === id ? this.aXy(id, oL, ft.bg(10), ft.bg(10)) : 2 === id ? this.aXy(id, oL, ft.bg(10), ft.bg(9)) : 3 === id ? this.aXy(id, oL, ft.bg(10), ft.bg(27)) : 4 === id ? this.aXy(id, oL, ft.bg(10), ft.bg(16)) : 5 === id || 6 === id ? this.aXy(id, oL, ft.bg(10)) : 7 === id ? this.aXy(id, oL, ft.bg(1)) : 10 === id ? this.aXy(id, oL, ft.bg(20), ft.bg(22)) : this.aXy(id, oL);
  }, this.vA = [], this.aXz = function () {
    for (var aY1 = 0, aY2 = 0, aY3 = 0, aY4 = 0, aY5 = 0, aY6 = 0, aN = 0; aN < 512; aN++) aY1 += d3.eF[aN], aY2 += d3.d4[aN], aY3 += d3.dL[aN], aY4 += h0.b1.a4P[aN];
    aY5 += h0.b1.ka, aY6 += eI.eJ, this.vA.push(aY3 % 1073741824 * 4 + (aY1 + aY2 + aY4 + aY5 + aY6) % 4);
  }, this.aXy = function (id, oL, oN, oP) {
    0 === id ? gD.aKd.oW(oL, oN) : 1 === id ? gD.aKd.oY(oL, oN, oP) : 2 === id ? gD.aKd.ok(oL, oN, oP) : 3 === id ? gD.aKd.om(oL, oN, oP) : 4 === id ? gD.aKd.oy(oL, oN, oP) : 5 === id ? gD.aKd.p3(oL, oN) : 6 === id ? gD.aKd.p5(oL, oN) : 7 === id ? gD.aKd.n2(oL, oN) : 8 === id ? gD.aKd.p7(oL) : 9 === id ? gD.aKd.pA(oL) : 10 === id && gD.aKd.pB(oL, oN >> 10, oP, oN % 1024);
  };
}
function aY7() {
  this.nU = function () {
    return cA.hg.hh() ? 2 : 1;
  };
}
function nq() {
  var aY8 = [],
    aY9 = [],
    aYA = 0;
  function aYB(a6, a2l, a2m, aYD) {
    var aM = a6.length;
    if (0 === aM) return "";
    var bS = "@" + a6[0];
    if (1 === aM) return bS + a2l + aYD;
    for (var aN = 1; aN < aM - 1; aN++) bS += ", @" + a6[aN];
    return bS + " and @" + a6[aM - 1] + a2m + aYD;
  }
  this.r = function () {
    var bS = aYB(aY9, " is", " are", " in the lobby.");
    bS.length && aI.message.aJ({
      id: 7,
      a0: bS
    }), aY8 = [], aY9 = [], aYA = 0;
  }, this.aXm = function (aYC) {
    return aI.nb !== aYC && (aYC = bs.aa.dG(aYC, 5), !!b6.aEh.ls(aYC)) && (aY9.push(aYC), !0);
  }, this.join = function (player) {
    aI.nb !== player.ah && (player = bs.aa.dG(player.ah, 5), b6.aEh.ls(player)) && aY8.push(player);
  }, this.ji = function () {
    var a2l, a2m;
    ++aYA < 3 || (aYA = 0, a2l = aYB(aY9, "", "", " entered the lobby!"), (a2l = (a2m = aYB(aY8, "", "", " joined a game!")).length ? a2l.length ? a2l + " " + a2m : a2m : a2l).length && aI.message.aJ({
      id: 7,
      a0: a2l
    }), aY8 = [], aY9 = []);
  };
}
function aYE() {
  this.a6 = new Array(4), this.aYF = new Uint16Array(2), this.a5A = new Uint16Array(2), this.a47 = new Int32Array(2), this.k4 = new Uint32Array(2), this.aYG = new Uint32Array(2), this.uY = new Uint8Array(4), this.xK = new Uint8Array(4), this.pG = new Uint32Array(4), this.aYH = new Uint32Array(5), this.od = new Uint32Array(8), this.oo = new Uint32Array(8), this.aO5 = new Uint16Array(16), this.a59 = new Uint16Array(512), this.aRt = new Uint16Array(512), this.aRu = new Uint16Array(512), this.aX1 = new Uint16Array(0), this.r = function () {
    var aM = fU.fV * fU.iD;
    this.aX1.length !== aM && (this.aX1 = new Uint16Array(aM));
  }, this.aYI = function (a6, oL) {
    return a6[0] = oL, a6;
  }, this.aYJ = function (a6, oL, oN) {
    return a6[0] = oL, a6[1] = oN, a6;
  }, this.aYK = function (a6, oL, oN, oP) {
    return a6[0] = oL, a6[1] = oN, a6[2] = oP, a6;
  }, this.aYL = function (a6, oL, oN, oP, aYM) {
    return a6[0] = oL, a6[1] = oN, a6[2] = oP, a6[3] = aYM, a6;
  };
}
function a2e() {
  this.z = function () {
    if (2 === ct.uw) ct.ux = 2;else {
      if (8 === ct.cu) aR.f.eH(0) || 0 === d3.eF[0] ? ct.uy = 1 : aR.f.eH(1) || 0 === d3.eF[1] ? ct.uy = 0 : ct.uy = +(d3.d4[1] > d3.d4[0]);else {
        if (ct.il) {
          var a57 = hE.a7H();
          if (ct.uz = a57, ey.iv[a57]) return void (ct.ux = +(ey.iy[ct.eG] === a57));
        }
        ct.uy = iw[0];
      }
      ct.ux = +(ct.uy === ct.eG);
    }
  };
}
function aEf() {
  function aYO(aN, type, a2T, cB) {
    b6.buffer.data.push({
      af: aN,
      type: type || 0,
      value: a2T || 0,
      a2T: a2T || 0,
      cB: cB || 0
    });
  }
  function aYP(aN, type, a2T, cB) {
    b6.buffer.data.push({
      af: aN,
      type: type,
      value: a2T || "",
      a2T: a2T || "",
      cB: cB || 0
    });
  }
  function aYQ(fN) {
    for (var aN = b6.buffer.data.length; aN < fN; aN++) b6.buffer.data.push(null);
  }
  this.data = [], this.r = function () {
    aYO(0, 1, 0, 5), aYO(1, 1, 1), aYO(2, 0), aYP(3, 2), aYO(4, 1), aYP(5, 2, "system-ui", 2), aYO(6, 0), aYO(7, 0, 0), aYO(8, 0), aYO(9, 1, 1), aYO(10, 1), aYO(11, 1, 1), aYP(12, 2, navigator.language), aYO(13), aYO(14), aYO(15, 0, 1), aYO(16, 0, 3), aYQ(100), aYP(100, 2), aYP(101, 2), aYP(102, 2), aYP(103, 2), aYP(104, 2), aYP(105, 2), aYP(106, 2), aYO(107), aYO(108), aYO(109), aYP(110, 2), aYO(111), aYO(112), aYO(113), aYP(114, 2), aYO(115), aYP(116, 2), aYO(117, 1), aYP(118, 2, "", 2), aYO(119, 1, 0, 1), aYP(120, 2), aYO(121, 1, ~~(262144 * Math.random())), aYP(122, 2, "Player " + Math.floor(1e3 * Math.random())), aYO(123), aYP(124), aYO(125, 1), aYP(126, 2), aYO(127, 0, 1), aYO(128), aYO(129), aYO(130), aYO(131), aYO(132), aYP(133, 2), aYO(134, 0, 5), aYP(135, 2), aYP(136, 2), aYO(137), aYO(138), aYO(139), aYO(140), aYO(141), aYO(142), aYO(143), aYO(144), aYP(145, 2), aYO(146), aYO(147), aYP(148, 2), aYO(149), aYO(150, 0, 1), aYP(151, 2), aYO(152, 0, 5), aYO(153, 1), aYO(154, 1), aYP(155, 2), aYP(156, 2), aYO(157), aYO(158), aYO(159), aYO(160), aYP(161, 2), aYO(162, 0, 1024), aYP(163, 2, "0,0,0"), aYP(164, 2, "100,100,100"), aYP(165, 2, "30,30,30"), aYP(166, 2, "70,70,70"), aYP(167, 2, "100,100,100"), aYP(168, 2, "85,85,85"), aYP(169, 2, "100,100,100");
    for (var aN = 0; aN < 4; aN++) aYP(170 + aN, 2, "255,255,255");
    aYP(174, 2), aYP(175, 2), aYO(176, 0, 200), aYQ(180), aYO(180, 0), aYO(181, 0), aYO(182, 0, 1023), aYP(183, 2), aYO(184, 0, 100), aYP(185, 2);
  }, this.bK = function (af, value) {
    this.data[af].value = value;
  }, this.a9p = function (af, value) {
    this.bK(af, value);
    var value = String(value),
      aM = value.length;
    5e4 < aM ? console.log("storage value too large: index " + af + " size " + aM) : (b6.bY.save(af, value), b6.bY.save(af, String(this.data[af].cB), !0));
  }, this.a9n = function (af) {
    return Number(this.data[af].value);
  }, this.aYR = function (af) {
    return String(this.data[af].value);
  };
}
function aYS() {
  var ti, tp;
  this.r = function () {
    ti = 1, tp = 0;
  }, this.f1 = function () {
    0 < ti && (tp = 0 === tp ? dy.dz + 16 : tp, ti = (ti -= .001 * (dy.dz - tp)) < 0 ? 0 : ti, tp = dy.dz, dy.gK = !0);
  }, this.dd = function () {
    0 < ti && (dE.fillStyle = "rgba(0,0,0," + ti + ")", dE.fillRect(0, 0, d9.aO, d9.dA));
  };
}
function aYV() {
  var nw, eT, eU, aYW, aYX, aYY, dz, aYZ, aYa, aYb, aYc, gap, zoom, aWp, aYd;
  function aYn(dk, dl, fK) {
    d5.kr(fK) || -1 === (dk = h0.nd.a4T(dk, dl)) ? fA.aYu(fK) : fA.aYv(dk);
  }
  function aYl(aYZ) {
    for (var aN = aWp.length - 1; 0 <= aN; aN--) if (aWp[aN] === aYZ) return 1;
  }
  function aYj(xm) {
    var aN, aM;
    if (-1 !== xm) for (aM = nw.length, aN = 0; aN < aM; aN++) if (nw[aN].mg && nw[aN].eT + 1 === xm % 4 && nw[aN].eU + 1 === xm >> 2) return aN;
    return -1;
  }
  function aYh(dk, dl) {
    var kA = gap / 2;
    return dk < eT - aYW - 3 * kA || eT + 3 * aYW + 5 * kA < dk || dl < eU - aYW - 3 * kA || eU + 2 * aYW + 3 * kA < dl ? -1 : 4 * (dl < eU - kA ? 0 : dl < eU + aYW + kA ? 1 : 2) + (dk < eT - kA ? 0 : dk < eT + aYW + kA ? 1 : dk < eT + 2 * aYW + 3 * kA ? 2 : 3);
  }
  this.vv = function () {
    var aN,
      ex,
      aYf = [bG.aFM, bG.aFU, bG.a90, bG.aFh, bG.aFc];
    for (nw = new Array(10), aN = 0; aN < 10; aN++) nw[aN] = {
      id: aN,
      mg: !1,
      rc: 0,
      canvas: [],
      eT: 0,
      eU: 0
    };
    for (nw[0].colors = [0, 1, 2, 3], nw[0].eT = 0, nw[0].eU = 0, nw[1].colors = [1, 4], nw[1].eT = 1, nw[1].eU = 0, nw[2].colors = [0, 1], nw[2].eT = -1, nw[2].eU = 0, nw[3].colors = [0], nw[3].eT = 0, nw[3].eU = 0, nw[4].colors = [0, 2], nw[4].eT = 1, nw[4].eU = 1, nw[5].colors = [3], nw[5].eT = 0, nw[5].eU = -1, nw[6].id = 20, nw[6].colors = [0], nw[6].eT = 1, nw[6].eU = -1, nw[7].id = 21, nw[7].colors = [0], nw[7].eT = 0, nw[7].eU = 1, nw[8].id = 16, nw[8].colors = [0], nw[8].eT = 0, nw[8].eU = 0, nw[9].id = 10, nw[9].colors = [4], nw[9].eT = 2, nw[9].eU = 0, aN = 0; aN < 10; aN++) for (ex = 0; ex < nw[aN].colors.length; ex++) nw[aN].canvas.push(function (id, z2) {
      if (id < 20) return aR.canvas.mk(dQ.get(3), id, z2);
      var z2 = dQ.get(3).height,
        es = aR.b.xo(z2, z2),
        e2 = aR.b.getContext(es);
      20 === id ? e2.drawImage(dQ.get(18), 0, 0) : 21 === id && da.en.aYg(da.db.aPp + da.db.aUI, e2, 0, 0, z2);
      return es;
    }(nw[aN].id, aYf[nw[aN].colors[ex]]));
  }, this.ev = function () {
    return nw;
  }, this.r = function () {
    aWp = [], eT = eU = dz = 0, aYX = aYY = -1e3, this.resize();
  }, this.resize = function () {
    aYW = Math.floor((cA.hg.hh() ? .075 : .0468) * d9.dC), zoom = aYW / dQ.get(3).height, gap = Math.floor(aYW / 3);
  }, this.aI8 = function (dk, dl) {
    return !!this.mg() && (dy.gK = !0, !!da.en.mv(dk, dl, aYa) || (dk = function (dk, dl) {
      aYY = aYX = -1e3;
      var aYi = aYj(aYh(dk, dl));
      if (-1 === aYi) return 0;
      if (1 !== nw[aYi].colors[nw[aYi].rc]) if (5 === aYi) {
        if (!function () {
          var eZ = performance.now();
          aYd + 4e3 < eZ && (aWp = []);
          aYd = eZ;
        }(), aYl(aYZ)) return 1;
        aWp.push(aYZ), 16 < aWp.length && aWp.shift();
      } else if (6 === aYi) {
        for (var aN = aWp.length - 1; 0 <= aN; aN--) 0 === d3.eF[aWp[aN]] && aWp.splice(aN, 1);
        0 < aWp.length && (hA.aCj(1, aWp, !0) && gD.f.aWo(aWp, aYZ), aWp = []);
      } else if (2 === aYi) gv.jx(aYZ) && gD.n1.ol(hB.k1(), aYZ);else if (3 === aYi) ct.dO && gD.n1.oW(aYb);else if (0 === aYi) {
        if (0 === nw[0].rc) {
          if (ct.us && gG.qf() < 350) return 1;
          h4.zG(4), gD.n1.oY(hB.k1(), aYZ);
        } else gt.aQc(aYZ, hB.k1());
      } else if (1 === aYi) gD.n1.om(hB.k1(), aYb);else if (9 === aYi) gD.n1.oy(hB.k1());else {
        if (7 === aYi) return h4.zG(0), da.en.show(dk, dl), 2;
        if (4 === aYi) hA.aCj(0, [aYZ], !0) && gD.f.aWn(aYZ);else {
          if (8 !== aYi) return 0;
          gD.n1.pB(hB.k1(), aYc, aYZ);
        }
      }
      return 1;
    }(dk, dl), this.bU(), 2 === dk && (da.en.mg = !0), 0 < dk));
  }, this.aIA = function (dk, dl) {
    this.mg() || (aYX = dk, aYY = dl, dz = performance.now());
  }, __fx.hoveringTooltip.display = function (mouseX, mouseY) {
    var coordX = dr.ds(mouseX),
      coordY = dr.du(mouseY),
      point = dr.iI(dr.iE(coordX, coordY));
    dr.iC(coordX, coordY) && aYn(mouseX, mouseY, point);
  }, this.click = function (dk, dl, aIG) {
    var hr = dr.ds(dk),
      hs = dr.du(dl),
      gm = dr.iE(hr, hs),
      fK = dr.iI(gm),
      aYm = (cA.hg.hh() ? .025 : .0144) * d9.dC,
      eZ = performance.now();
    return !(Math.abs(dk - aYX) > aYm || Math.abs(dl - aYY) > aYm || dz + 500 < eZ || (dz = eZ, a5t.a5u() && (a5t.a5v = dk, a5t.a5w = dl, hN.f1(1), h8.f1(1)), !dr.iC(hr, hs))) && (aIG ? (aYn(dk, dl, fK), !1) : my.mz || this.mg() || !aR.f.kk(ct.eG) || ct.mH ? (this.bU(), !1) : (ct.dO ? 0 <= (aYb = aQZ.aOx(gm)) && (nw[3].mg = !0) : 2 === ct.dX ? d5.l3(fK) && (aYZ = d5.hp(fK), aR.f.eH(aYZ) || (nw[0].mg = !0, nw[0].rc = 1, nw[7].mg = !0)) : (h0.p0.jx(ct.eG, gm) && (nw[0].mg = !0, nw[0].rc = 1, nw[1].mg = !0, nw[1].rc = 0, nw[9].mg = !0, nw[9].rc = 0), h0.aQe.aPT(ct.eG, gm) && (nw[0].mg = !0, nw[0].rc = 1, nw[1].mg = !0, nw[1].rc = 1, aYb = k3.oo[7]), d5.aL6(fK) ? (aYc = pC.pD.aQa(fK)) && (aYm = dr.iI(aYc), nw[8].mg = !0, aYZ = d5.ho(aYm) ? ct.cv : d5.hp(aYm)) : (d5.fT(ct.eG, fK) && (aYa = ct.eG, nw[0].mg = !0, nw[0].rc = 1, nw[7].mg = !0), -1 !== (eZ = aQZ.aOy(gm)) && (d5.ho(eZ << 2) ? (aYZ = ct.cv, kl.aQb(ct.eG) ? (nw[0].mg = !0, nw[0].rc = 0) : lA.a9G(ct.eG) && (nw[0].mg = !0, nw[0].rc = 3)) : (aYZ = d5.hp(eZ << 2), nw[0].rc = 1, nw[5].mg = function (aYZ) {
      return !aR.f.eH(aYZ) && !aYl(aYZ) && hA.aCj(1, [aYZ], !1);
    }(aYZ), nw[7].mg || aR.f.eH(aYZ) || (aYa = aYZ, nw[7].mg = !0), nw[4].mg = !aR.f.eH(aYZ) && !di.fC(aYZ) && hA.aCj(0, [aYZ], !1), nw[6].mg = function (aYZ) {
      if (0 === aWp.length) return !1;
      if (performance.now() > aYd + 4e3) return !(aWp = []);
      return !aYl(aYZ) && !function (aYZ) {
        var aN;
        if (ct.il) for (aN = aWp.length - 1; 0 <= aN; aN--) if (!kl.km(aYZ, aWp[aN])) return 1;
        return;
      }(aYZ);
    }(aYZ), kl.km(aYZ, ct.eG) ? (kl.aQd(ct.eG, aYZ) ? (nw[0].rc = 0, nw[0].mg = !0) : lA.a9G(ct.eG) && (nw[0].rc = 3, nw[0].mg = !0), nw[0].mg = this.aYs()) : (nw[2].mg = !0, gv.jx(aYZ) ? nw[2].rc = 0 : nw[2].rc = 1, nw[0].mg = !0))))), this.aYo(dk, dl)));
  }, this.aYo = function (dk, dl) {
    return eT = dk - Math.floor(aYW / 2), eU = dl - Math.floor(aYW / 2), !!this.mg();
  }, this.dh = function (dk, dl) {
    return !!this.mg() && (da.en.mg ? !da.en.aB2(dk, dl) && (da.en.mg = !1, dy.gK = !0) : function (a3d, dk, dl) {
      dk = aYh(dk, dl);
      if (0 <= aYj(dk)) return !1;
      if ((1 === dk || 6 === dk) && 0 <= aYj(2)) return !1;
      if ((6 === dk || 9 === dk) && 0 <= aYj(10)) return !1;
      return a3d.bU(), dy.gK = !0;
    }(this, dk, dl));
  }, this.bU = function () {
    for (var aN = nw.length - 1; 0 <= aN; aN--) nw[aN].mg = !1, nw[aN].rc = 0;
    da.en.mg = !1;
  }, this.mg = function () {
    return this.aYs() || da.en.mg;
  }, this.aYs = function () {
    for (var aM = nw.length, aN = 0; aN < aM; aN++) if (nw[aN].mg) return !0;
    return !1;
  }, this.dd = function () {
    if (this.mg()) if (da.en.mg) da.en.dd();else {
      var aN,
        e2 = dE,
        ex = nw,
        aM = ex.length,
        aYz = (aYW + gap) / zoom;
      for (e2.imageSmoothingEnabled = !0, e2.setTransform(zoom, 0, 0, zoom, eT, eU), aN = 0; aN < aM; aN++) ex[aN].mg && dE.drawImage(ex[aN].canvas[ex[aN].rc], ex[aN].eT * aYz, ex[aN].eU * aYz);
      e2.imageSmoothingEnabled = !1, e2.setTransform(1, 0, 0, 1, 0, 0);
    }
  };
}
function wO() {
  var aZ0,
    aBk,
    aZ3,
    aBj,
    aBm,
    aZ1 = [new Array(4), new Array(4), new Array(2), new Array(2)],
    aZ2 = new Array(4),
    aZ4 = new Array(2),
    aZ5 = [L(56), L(333), L(468), L(469)];
  function a2() {
    var aE;
    !aI.jV || (aE = aZ0.aBy.a77.b7.value.trim().slice(0, 127)).length < 1 || (aZ0.aBy.a77.b7.value = "", aI.js.z(aE));
  }
  function aZ8(aZB) {
    aI.b1.a30[3] = 1 - aI.b1.a30[3], aZA(3, 1, aI.b1.a30[3]), aZB && aF.aG.aH(4), aI.b1.a30[3] && b6.bJ.bK(158, aI.b1.a30[0]);
  }
  function aZ6(aQ, ex) {
    aI.b1.a30[aQ] !== ex && (0 === aQ && aI.b1.a30[3] && aZ8(0), aZA(aQ, aI.b1.a30[aQ], 0), aZA(aQ, ex, 1), aI.b1.a30[aQ] = ex, 0 === aQ ? (aF.aG.aH(2, ex), aI.b1.a30[2] ? (aZ0.aC0.hQ(), aZ0.aBy.reset(1)) : aZ0.aBy.reset(0), aq.mA().a38(), aq.mA().a37()) : 2 === aQ && (0 === ex ? (aF.aG.aH(0), aZ0.aBy.hQ(), aZ0.aC8()) : (aF.aG.aH(1), aZ0.aC0.hQ(), aZ0.aC9())));
  }
  function aZA(aQ, ex, color) {
    aZ0.aC2[aQ].nw[ex].bF(color ? bG.aAm : bG.aFq);
  }
  function aZE(jJ) {
    return fU.tu.a16[jJ];
  }
  function aZF(jK) {
    return jK < 7 ? "   " + (jK + 2) + " Teams" : 10 === jK ? "   No Full-Sending" : "";
  }
  function aZG(jP, aZN) {
    return aZN ? jP <= 90 && 60 < jP ? "   Contest" : "" : jP <= 60 ? "   Contest" : "";
  }
  this.a8H = function () {
    return aZ0.aBy;
  }, this.js = function (ah) {
    aZ6(2, 0);
    var bS = aZ0.aBy.a77.b7.value,
      ah = "@" + ah + " ";
    bS.length && !aR.h.aX(bS, " ") && (ah = " " + ah), aZ0.aBy.a77.b7.value = bS += ah, aZ0.aBy.a77.b7.focus();
  }, this.a36 = function () {
    aZ0.aC0.hQ();
  }, this.a38 = function () {
    var aZD = aI.b1.a30[0],
      aZD = aI.b1.jH[aZD],
      ex = (fU.bd(aZD.jJ, aZD.mapSeed), aBk.nw),
      a2l = aZE(aZD.jJ, aZD.mapSeed) + aZF(aZD.jK) + aZG(aZD.jP),
      aZD = L(472) + "   " + aZE(aZD.jL, aZD.jM) + aZF(aZD.jN) + aZG(aZD.jP, 1);
    ex[0].button.textContent === a2l && ex[1].button.textContent === aZD || (ex[0].button.textContent = a2l, ex[1].button.textContent = aZD, aBk.resize());
  }, this.a37 = function () {
    var aZD = aI.b1.a30[0],
      jG = aI.b1.jH[aZD];
    aZ0.aC7(jG.jI);
    for (var aY, aBH, aN = 0; aN < aI.aU.aV.length; aN++) aZ1[0][aN].hX.textContent = aI.aU.aV[aN].length, aZ1[1][aN].hX.textContent = (aY = aI.b1.jH[aN].jP, aBH = void 0, ((aBH = he.iA(aY, 60)) < 10 ? "0" : "") + aBH + ":" + ((aY %= 60) < 10 ? "0" : "") + aY);
    var jG = aI.aU.aV[aZD],
      aZI = jG.length,
      aZJ = aI.aU.jQ[aZD];
    aZ1[2][1].hX.textContent = "" + aZI, aZ1[3][1].hX.textContent = "" + aZJ;
    for (aN = 0; aN < 4; aN++) {
      var aZK = aI.b1.jH[aN];
      aZ2[aN] ? 0 === aZK.jI && (aZ2[aN].hX.textContent = fU.tu.a16[aZK.jJ]) : aZ2[aN] = new a6Q(fU.tu.a16[aZK.jJ], aBj.nw[aN].button, 1, 1), aR.h.startsWith(aZ5[aN], "🏆 ") ? aZK.jO || (aZ5[aN] = aZ5[aN].substring(3), aBj.nw[aN].button.textContent = aZ5[aN], aBj.nw[aN].button.appendChild(aZ1[1][aN].hX), aBj.nw[aN].button.appendChild(aZ1[0][aN].hX), aBj.nw[aN].button.appendChild(aZ2[aN].hX)) : aZK.jO && (aZ5[aN] = "🏆 " + aZ5[aN], aBj.nw[aN].button.textContent = aZ5[aN], aBj.nw[aN].button.appendChild(aZ1[1][aN].hX), aBj.nw[aN].button.appendChild(aZ1[0][aN].hX), aBj.nw[aN].button.appendChild(aZ2[aN].hX));
    }
    var aZL = "",
      aZM = "";
    0 === aZD && (aZL = aI.nd.aUg(jG, 0, aZI), aZM = aI.nd.aUg(jG, 0, aZJ)), aZ3[0].hX.textContent = aZL, aZ3[1].hX.textContent = aZM, aZ4[1].hX.textContent = "MP: " + aI.b1.jW[0] + "   SP: " + aI.b1.jW[1] + "   Lobby: " + aR.d.xd(aI.aU.aV);
  }, this.a3B = function () {
    aZ0.aBy.hQ();
  }, this.show = function () {
    aI.b1.a31++, aZ0.show(), this.resize(), aI.message.show();
  }, this.bU = function () {
    aZ0.bU(), aI.ne.bU(), aI.nf.bU(), aI.message.bU();
  }, this.resize = function () {
    aZ0.resize(1 - aI.b1.a30[2]), aI.message.resize();
  }, this.bV = function (bW) {
    2 === bW ? aI.b1.a30[3] ? aZ8(1) : aZ0.aC2[3].nw[0].bY() : bW < 2 && aZ8(1);
  }, aBj = new aJR([new ap(aZ5[0], function () {
    return aZ6(0, 0), 2;
  }), new ap(aZ5[1], function () {
    return aZ6(0, 1), 2;
  }), new ap(aZ5[2], function () {
    return aZ6(0, 2), 2;
  }), new ap(aZ5[3], function () {
    return aZ6(0, 3), 2;
  })], bG.aFq), (aBk = new aJR([new ap("", 0, 2), new ap("", 0, 2)], bG.aFr, 1)).nx.translate = !1;
  var aZ7 = new aJR([new ap(L(470), function () {
    return aZ6(2, 0), 2;
  }), new ap(L(23), function () {
    return aZ6(2, 1), 2;
  })], bG.aFq);
  aBm = new aJR([new ap(L(182, 0, 0, 1), function () {
    aq.mU(), aI.mV(), aF.b1.mS(3240), aq.fu(5, 5);
  }), new ap(L(471), function () {
    return aZ8(1), 2;
  })], bG.aFq), aZ0 = new aBi(aBj, aBk, aZ7, aBm, a2, aI.ne.aZ9);
  for (var aN = 0; aN < 4; aN++) aZ1[0][aN] = new a6Q("0", aBj.nw[aN].button), aZ1[1][aN] = new a6Q("0", aBj.nw[aN].button, 1);
  aZ1[2][1] = new a6Q("0", aZ7.nw[1].button), aZ1[3][1] = new a6Q("0", aBm.nw[1].button), (aZ3 = [new a6Q("", aZ7.nw[1].button, 1, 1), new a6Q("", aBm.nw[1].button, 1, 1)])[0].hX.style.bottom = "0em", aZ3[1].hX.style.bottom = "0em", aZ3[0].hX.translate = !1, aZ3[1].hX.translate = !1, aZA(0, aI.b1.a30[0], 1), aZA(2, aI.b1.a30[2], 1), (aZ4 = [new a6Q(L(57), aZ0.aCA(), 1, 0), new a6Q("", aZ0.aCA(), 1, 1)])[0].hX.style.fontSize = "0.4em", aZ4[1].hX.style.fontSize = "0.4em";
}
function aNZ() {
  this.aQ6 = function () {
    var aN;
    if (ft.size < bc.oD(23)) aF.b1.a2K(0, 3259);else {
      var pK = ft.bg(6),
        aM = ft.bg(10),
        data = [];
      if (9 === pK || 10 === pK || 11 === pK || 13 === pK) {
        for (aN = 0; aN < aM; aN++) data.push([ft.bg(30), aZ.bt.jS(5), ft.a2O(32), 0, ft.bg(30)]);
        8 === aq.fv && aq.mA().a2G(21, !0, {
          pK: pK,
          data: data
        });
      } else if (12 === pK) {
        for (aN = 0; aN < aM; aN++) data.push([ft.bg(20), ft.bg(30), ft.bg(30), ft.a2O(32), ft.bg(30), aZ.bt.jS(5), aZ.bt.jS(5)]);
        8 === aq.fv && aq.mA().a2G(21, !0, {
          pK: pK,
          data: data
        });
      } else {
        var pV = ft.bg(16);
        if (ft.a2J(39 + 16 * pV + aM * (0 === pK ? 111 : 1 === pK ? 101 : 2 === pK || 3 === pK ? 127 : 212))) {
          if (0 === pK) for (aN = 0; aN < aM; aN++) data.push([ft.bg(30), aZ.bz.a2L(ft.bg(5)), ft.bg(16), ft.bg(30), ft.bg(30)]);else if (1 === pK) for (aN = 0; aN < aM; aN++) data.push([ft.bg(16), aZ.bz.a2L(ft.bg(3)), ft.bg(16), aZ.bz.a2L(ft.bg(5)), ft.bg(31), ft.bg(30)]);else if (2 === pK || 3 === pK) for (aN = 0; aN < aM; aN++) data.push([ft.bg(30), aZ.bz.a2L(ft.bg(5)), ft.a2O(32), ft.bg(30), ft.bg(30)]);else for (aN = 0; aN < aM; aN++) data.push([ft.bg(20), ft.bg(30), ft.bg(30), ft.bg(30), ft.bg(30), ft.a2O(32), ft.bg(30), aZ.bz.a2L(ft.bg(5)), aZ.bz.a2L(ft.bg(5))]);
          8 === aq.fv && aq.mA().a2G(21, !0, {
            pK: pK,
            data: data
          });
        } else aF.b1.a2K(0, 3260);
      }
    }
  }, this.aQ7 = function () {
    if (ft.size < bc.oD(29)) aF.b1.a2K(0, 3265);else {
      var aZO = ft.bg(4),
        aZP = ft.bg(7),
        aZQ = ft.bg(11);
      if (ft.a2J(29 + 16 * aZP + 16 * aZQ + 11 * aZO)) {
        for (var data = [], aN = 0; aN < aZO; aN++) {
          for (var rd = aZ.bz.a2L(ft.bg(3)), aZR = ft.bg(8), s8 = [], aQ = 0; aQ < aZR; aQ++) s8.push(ft.bg(16));
          data.push({
            name: "[" + rd + "]",
            s8: s8
          });
        }
        8 === aq.fv && aq.mA().a2G(23, !0, data);
      } else aF.b1.a2K(0, 3266);
    }
  };
}
function a32() {
  this.jI = 0, this.jJ = 0, this.mapSeed = 0, this.jK = 0, this.jL = 0, this.jM = 0, this.jN = 0, this.jO = 0, this.jP = 0, this.spawningSeed = 0, this.c7 = 0, this.je = 0, this.jl = [], this.jm = 1048575, this.a3A = 0, this.jh = [{
    jJ: 0,
    mapSeed: 0,
    jK: 0,
    dz: 100,
    jO: 0
  }, {
    jJ: 1,
    mapSeed: 0,
    jK: 1,
    dz: 200,
    jO: 0
  }, {
    jJ: 2,
    mapSeed: 0,
    jK: 2,
    dz: 300,
    jO: 0
  }, {
    jJ: 3,
    mapSeed: 0,
    jK: 3,
    dz: 400,
    jO: 0
  }, {
    jJ: 0,
    mapSeed: 0,
    jK: 9,
    dz: 500,
    jO: 0
  }, {
    jJ: 1,
    mapSeed: 0,
    jK: 10,
    dz: 600,
    jO: 0
  }, {
    jJ: 2,
    mapSeed: 0,
    jK: 8,
    dz: 700,
    jO: 0
  }, {
    jJ: 3,
    mapSeed: 0,
    jK: 3,
    dz: 800,
    jO: 0
  }];
}
function aZS() {
  this.aZT = new Uint32Array(ct.cv), this.r = function () {
    10 === ct.cu && this.aZT.fill(0);
  }, this.f1 = function () {
    10 === ct.cu && this.nd();
  }, this.nd = function () {
    for (var d1, target, qr, aZT = this.aZT, ix = eI.eK, lL = d3.dL, aN = eI.eJ - 1; 0 <= aN; aN--) (d1 = ix[aN]) >= ct.dP || (target = Math.max(he.iA(lL[d1], 4), 2048), qr = Math.max(gw.qs(d1), 100), aZT[d1] += he.iA(qr * target, 1e4), aZT[d1] > target && (aZT[d1] = target));
  }, this.aZU = function (player, ki) {
    return 10 !== ct.cu || aR.f.eH(player) ? ki : Math.min(this.aZT[player], ki);
  }, this.aZV = function (player, ki) {
    10 !== ct.cu || aR.f.eH(player) || (this.aZT[player] -= ki);
  };
}
function aZW() {
  this.aO = 0, this.dA = 0, this.g2 = 0, this.g3 = 0, this.aZX = 0, this.aZY = 0, this.a3W = 0, this.aC6 = 0;
  var aZa = this.aZZ = 0;
  this.aZb = 0, this.aZc = 0, this.aZd = 0, this.tm = 0, this.af = 0, this.qK = null, this.mg = !1, this.aZe = -1, this.aZf = !1, this.aZg = [0, 0], this.mj = function () {
    this.qK = [L(473), L(29, 0, "Balance"), L(28, 0, "Interest"), L(474)];
  }, this.r = function () {
    this.mg = !1, this.aZe = -1, this.aZf = !1, this.resize();
  }, this.resize = function () {
    this.aO = d9.aO < 1.369 * d9.dA ? d9.aO : 1.369 * d9.dA;
    var fS = cA.hg.hh() && d9.aO < d9.dA ? 1 : cA.hg.hh() ? .8 : d9.aO < d9.dA ? .65 : .59;
    this.aO = Math.floor(fS * this.aO), this.aO -= cA.hg.hh() && d9.aO < d9.dA ? 2 * lS.gap + 2 : 0, this.dA = Math.floor(this.aO / 1.369), this.tm = Math.floor(this.dA / 150), this.tm = Math.max(this.tm, 1.5), this.g2 = Math.floor(1 + .02 * this.aO), this.g3 = Math.floor(1 + .04 * this.aO), this.a3W = this.g3, aZa = Math.floor(.75 * this.a3W), this.aC6 = Math.floor(1 + .075 * this.aO), this.aZb = Math.floor(1 + .1125 * this.aO), this.aZc = Math.floor(this.aO * (cA.hg.hh() ? .03 : .029)), this.aZc = Math.max(this.aZc, 4), this.aZd = Math.floor(.035 * this.aO), this.aZd = Math.max(this.aZd, 4), this.aZZ = this.dA - 2 * this.a3W - this.aC6 - this.aZb, this.mg && this.aZh();
  }, this.mv = function (dk, dl) {
    var ee, ed;
    return !!this.mg && (ed = dk, ee = dl, dk -= he.iA(d9.aO - this.aO, 2), dl -= he.iA(d9.dA - this.dA, 2), dk < 0 || dl < 0 || dk >= this.aO || dl >= this.dA || dk >= this.aO - this.aZb && dl < this.aZb ? -1 !== my.mv(ed, ee) || hM.mv(ed, ee) || this.bU() : dl < this.aZb || (dl < this.dA - this.aC6 ? (this.aZf = !0, this.aZe = (dk - 2 * this.g2 - this.aZX) / this.aZY, 3 !== this.af && (dy.gK = !0)) : (ed = (ed = Math.floor(dk / (this.aO / this.qK.length))) < 0 ? 0 : ed >= this.qK.length ? this.qK.length - 1 : ed) !== this.af && (this.af = ed, this.aZh(), dy.gK = !0)), !0);
  }, this.dh = function (dk, dl) {
    return this.aZg[0] = dk, this.aZg[1] = dl, !(!this.mg || !this.aZf || (dk -= he.iA(d9.aO - this.aO, 2), dl = this.aZe, this.aZe = (dk - 2 * this.g2 - this.aZX) / this.aZY, (0 <= this.aZe && this.aZe <= 1 || 0 <= dl && dl <= 1) && (dy.gK = !0), 0));
  }, this.uH = function () {
    this.aZf && (this.aZf = !1);
  }, this.n0 = function () {
    this.mg ? this.bU() : this.show();
  }, this.show = function () {
    hD.zF < 2 || (this.mg = !0, this.aZh());
  }, this.bU = function () {
    this.mg = !1, this.aZe = -1, dy.gK = !0;
  }, this.aZh = function () {
    this.af < 2 ? this.aZX = hK.measureText(aR.h.dG(hD.max[this.af]), aR.b.dF(0, this.aZc)) : 2 === this.af && (this.aZX = hK.measureText(aR.h.qd(6, 2), aR.b.dF(0, this.aZc))), this.aZY = this.aO - 2 * this.g2 - this.aZX - this.g3;
  }, this.hQ = function () {
    this.mg && this.aZh();
  }, this.dd = function () {
    this.mg && this.aV5();
  }, this.aV5 = function () {
    var eT = he.iA(d9.aO - this.aO, 2),
      eU = he.iA(d9.dA - this.dA, 2);
    dE.setTransform(1, 0, 0, 1, eT, eU), dE.fillStyle = bG.iq, dE.fillRect(0, this.aZb, this.aO, this.dA - this.aZb), this.aZi(), this.aKZ(), dE.strokeRect(0, 0, this.aO, this.dA), aR.b.textAlign(dE, 2), dE.font = aR.b.dF(0, this.aZc), 0 === this.af ? this.aZj(hD.aQL, eT, eU) : 1 === this.af ? this.aZj(hD.lL, eT, eU) : 2 === this.af ? this.aZk(eT, eU) : 3 === this.af && (this.aZl(eT, eU), this.aZm(eT, eU)), my.sU(Math.floor(eT + this.aO - .725 * this.aZb), Math.floor(eU + .275 * this.aZb), Math.floor(.45 * this.aZb)), dE.setTransform(1, 0, 0, 1, 0, 0);
  }, this.aZi = function () {
    var aN, eZ;
    for (dE.lineWidth = this.tm, aR.b.textBaseline(dE, 1), aR.b.textAlign(dE, 1), dE.strokeStyle = bG.bH, dE.font = aR.b.dF(1, this.aZd), eZ = this.aO / this.qK.length, dE.fillStyle = bG.aC3, dE.fillRect(this.af * eZ, this.dA - this.aC6, eZ, this.aC6), dE.fillStyle = bG.bH, dE.fillRect(0, this.dA - this.aC6 - .5 * this.tm, this.aO, this.tm), aN = 1; aN <= 3; aN++) dE.fillRect(aN * eZ, this.dA - this.aC6, this.tm, this.aC6);
    for (aN = this.qK.length - 1; 0 <= aN; aN--) dE.fillText(aR.j.qZ(this.qK[aN], 0, .9 * eZ), (aN + .5) * eZ, this.dA - .46 * this.aC6);
  }, this.aKZ = function () {
    dE.fillStyle = bG.aFZ, dE.fillRect(0, 0, this.aO, this.aZb), dE.fillStyle = bG.bH, dE.fillRect(0, this.aZb - .5 * this.tm, this.aO, this.tm), dE.font = aR.b.dF(1, .39 * this.aZb), dE.fillText(aR.j.qZ(L(475), 0, .8 * this.aO), Math.floor(this.aO / 2), Math.floor(.55 * this.aZb));
  }, this.aZj = function (a6, eT, eU) {
    var aW = hD.max[this.af],
      dj = (dE.setTransform(1, 0, 0, 1, eT + 2 * this.g2 + this.aZX, eU + this.a3W + this.aZb), dE.lineWidth = 2, this.aZZ / Math.sqrt(aW));
    dE.beginPath(), dE.moveTo(this.aZY, this.aZZ - dj * Math.sqrt(a6[hD.zF - 1]));
    for (var aN = hD.zF - 2; 0 <= aN; aN--) dE.lineTo(aN * this.aZY / (hD.zF - 1), this.aZZ - dj * Math.sqrt(a6[aN]));
    dE.stroke();
    eT = this.sU(a6, dj, .5);
    eT < .95 && dE.fillText(aR.h.dG(aW), -this.g2, 0), .05 < Math.abs(eT - .5) && dE.fillText(aR.h.dG(Math.floor(aW / 4)), -this.g2, Math.floor(this.aZZ / 2)), .05 < eT && dE.fillText("0", -this.g2, this.aZZ);
  }, this.aZk = function (eT, eU) {
    dE.setTransform(1, 0, 0, 1, eT + 2 * this.g2 + this.aZX, eU + this.a3W + this.aZb), dE.lineWidth = 2;
    var dj = this.aZZ / Math.max(hD.max[this.af], 1);
    dE.beginPath(), dE.moveTo(this.aZY, this.aZZ - dj * hD.qr[hD.zF - 1]);
    for (var aN = hD.zF - 2; 0 <= aN; aN--) dE.lineTo(aN * this.aZY / (hD.zF - 1), this.aZZ - dj * hD.qr[aN]);
    dE.stroke();
    eT = this.sU(hD.qr, dj, 1), eU = hD.max[this.af] / 100;
    eT < .95 && dE.fillText(aR.h.qd(eU, 2), -this.g2, 0), .05 < Math.abs(eT - .5) && dE.fillText(aR.h.qd(eU / 2, 2), -this.g2, Math.floor(this.aZZ / 2)), .05 < eT && dE.fillText(aR.h.qd(0, 2), -this.g2, this.aZZ);
  }, this.aZl = function (eT, eU) {
    dE.setTransform(1, 0, 0, 1, eT + .34 * this.aO, eU + 2 * aZa + this.aZb), aR.b.textAlign(dE, 2);
    for (var aAt = this.dA - 4 * aZa - this.aC6 - this.aZb, a6 = [0, 1, 19, 2, 20, 3, 4, 5, 6, 7], aN = 9; 0 <= aN; aN--) dE.fillText(aR.j.qZ(hD.aQO[a6[aN]], 0, .31 * this.aO), 0, aN * aAt / 9);
    var aY = hD.a48;
    for (dE.setTransform(1, 0, 0, 1, eT + .39 * this.aO, eU + 2 * aZa + this.aZb), aR.b.textAlign(dE, 0), dE.fillText(aR.h.qd(100 * aY[0] / (1024 * Math.max(aY[1], 1)), 1), 0, 0), aN = 8; 1 <= aN; aN--) dE.fillText(aY[a6[aN]].toString(), 0, aN * aAt / 9);
    dE.fillText(aR.h.qd(100 * (1 - d3.d4[ct.eG] / aY[7]), 0), 0, aAt);
  }, this.aZm = function (eT, eU) {
    dE.setTransform(1, 0, 0, 1, eT + .79 * this.aO, eU + 2 * aZa + this.aZb), aR.b.textAlign(dE, 2);
    var aN,
      aAt = this.dA - 4 * aZa - this.aC6 - this.aZb;
    for (dE.fillStyle = bG.aFJ, aN = 2; 0 <= aN; aN--) dE.fillText(aR.j.qZ(hD.aQO[aN + 8], 0, .31 * this.aO), 0, aN * aAt / 9);
    dE.fillText(aR.j.qZ(hD.aQO[18], 0, .31 * this.aO), 0, 3 * aAt / 9), dE.fillStyle = bG.aFI, dE.fillText(aR.j.qZ(hD.aQO[11], 0, .31 * this.aO), 0, 4 * aAt / 9), dE.fillStyle = bG.a94, dE.fillText(aR.j.qZ(hD.aQO[13], 0, .31 * this.aO), 0, 5 * aAt / 9), dE.fillText(aR.j.qZ(hD.aQO[15], 0, .31 * this.aO), 0, 6 * aAt / 9), dE.fillText(aR.j.qZ(hD.aQO[16], 0, .31 * this.aO), 0, 7 * aAt / 9), dE.fillText(aR.j.qZ(hD.aQO[12], 0, .31 * this.aO), 0, 8 * aAt / 9), dE.fillStyle = bG.yE, dE.fillText(aR.j.qZ(hD.aQO[17], 0, .31 * this.aO), 0, aAt), dE.fillStyle = bG.aFJ;
    var aY = hD.a48,
      ac = aY[8] + aY[9] + aY[10] + aY[18],
      ac = aR.h.dG(ac),
      sh = dE.measureText(ac).width,
      eT = (dE.setTransform(1, 0, 0, 1, eT + .83 * this.aO + sh, eU + 2 * aZa + this.aZb), dE.fillText(aR.h.dG(aY[8]), 0, 0), dE.fillText(aR.h.dG(aY[9]), 0, aAt / 9), dE.fillText(aR.h.dG(aY[10]), 0, 2 * aAt / 9), dE.fillText(aR.h.dG(aY[18]), 0, 3 * aAt / 9), dE.fillStyle = bG.aFI, dE.fillText(ac, 0, 4 * aAt / 9), dE.fillStyle = bG.a94, dE.fillText(aR.h.dG(aY[13]), 0, 5 * aAt / 9), dE.fillText(aR.h.dG(aY[15]), 0, 6 * aAt / 9), dE.fillText(aR.h.dG(aY[16]), 0, 7 * aAt / 9), dE.fillText(aR.h.dG(aY[12]), 0, 8 * aAt / 9), aY[12] + aY[13] + aY[15] + aY[16]);
    dE.fillStyle = bG.yE, dE.fillText(aR.h.dG(eT), 0, aAt), dE.fillStyle = bG.bH;
  }, this.sU = function (a6, dj, aVL) {
    var aN, b7, oL;
    return this.aZe < 0 || 1 < this.aZe ? .25 : (aN = this.aZe * (hD.zF - 1), oL = a6[b7 = Math.floor(aN)], oL += (aN - b7) * (a6[b7 < hD.zF - 1 ? b7 + 1 : b7] - oL), dE.strokeStyle = bG.aFA, .04 < this.aZe && this.aZp(0, this.aZZ - dj * Math.pow(oL, aVL), aN * this.aZY / (hD.zF - 1), this.aZZ - dj * Math.pow(oL, aVL)), .04 < oL / hD.max[this.af] && this.aZp(aN * this.aZY / (hD.zF - 1), this.aZZ, aN * this.aZY / (hD.zF - 1), this.aZZ - dj * Math.pow(oL, aVL)), dE.fillStyle = bG.aFS, dE.beginPath(), dE.arc(aN * this.aZY / (hD.zF - 1), this.aZZ - dj * Math.pow(oL, aVL), Math.max(2, .014 * this.dA), 0, 2 * Math.PI), dE.fill(), a6 = this.aZe * dy.gM, a6 = 0 === d3.eF[ct.eG] ? Math.floor(a6 * hD.aQN) : Math.floor(a6 * dy.f2()), dE.fillStyle = bG.bH, dE.fillText(1 === aVL ? aR.h.qd(oL / 100, 2) : aR.h.dG(Math.floor(oL)), -this.g2, this.aZZ - dj * Math.pow(oL, aVL)), aR.b.textAlign(dE, 1), dE.fillText(gG.qe(a6), aN * this.aZY / (hD.zF - 1), this.aZZ + this.aZc - (cA.hg.hh() ? 2 : 0) - this.tm), aR.b.textAlign(dE, 2), dj * Math.pow(oL, aVL) / this.aZZ);
  }, this.aZp = function (e3, e6, e8, e9) {
    dE.beginPath(), dE.moveTo(e3, e6), dE.lineTo(e8, e9), dE.stroke();
  };
}
function nm() {
  var aZq = null,
    aZr = null,
    aZs = 0,
    aZt = 0,
    aZu = null;
  function aZv() {
    0 !== aZr.aNn && (aI.ne.bU(), aq.fu(8, 29, new fw(25, {
      action: 0,
      ah: bs.aa.dG(aZr.ah, 5),
      fs: 0
    }, 29)));
  }
  function aZx() {
    return !aI.nc || aI.nd.aUf(aZr) ? 1 : 0;
  }
  function aZw() {
    var eT = aZq.eT,
      eU = aZq.eU,
      aa4 = (aI.ne.bU(), aZx());
    aZq = new a6L([new ap(a0B.aUX[5][0], function () {
      aa0(5, 0);
    }, aa4), new ap(a0B.aUX[5][1], function () {
      aa0(5, 1);
    }, aa4), new ap(a0B.aUX[5][2], function () {
      aa0(5, 2);
    }, aa4), new ap(a0B.aUX[5][3], function () {
      aa0(5, 3);
    }, aa4)]), aZz(eT, eU), aZt = aZs = 2;
  }
  function aZy() {
    29 === aq.fv && aq.mA().js(bs.aa.dG(aZr.ah, 5));
  }
  function aa0(id, value) {
    5 === id && aF.bO.bP({
      action: 3,
      ah: bs.aa.dG(aZr.ah, 5),
      value: value
    });
  }
  function aZz(eT, eU, a6U) {
    aZq.show(eT, eU, a6U), aI.nf.show(aZq.eT, aZq.eU, aZr, 1);
  }
  this.aZ9 = function (b7, c3) {
    aZs = 1, aZr = c3, aZq = new a6L([new ap(L(476), aZv, 0 === c3.aNn ? 1 : 0), new ap(L(477), aZw, aZx()), new ap(L(478), aZy, 0)]), aZz((aZu = {
      clientX: b7.clientX,
      clientY: b7.clientY
    }).clientX, aZu.clientY, 1);
  }, this.bV = function (code) {
    if (29 !== aq.fv) return !1;
    if (!aZr) return !1;
    if (!(code.length < 1)) if ("Escape" === code) this.bU();else if (aR.h.startsWith(code, "Numpad") || aR.h.startsWith(code, "Digit")) {
      code = parseInt(code[code.length - 1], 10);
      if (!isNaN(code)) if (0 === aZs) this.aZ9(aZu, aZr);else {
        if (!aZq) return !1;
        1 === aZs ? code <= 1 ? aZv() : 2 === code ? aZw() : (aZy(), this.bU()) : (aa0(aZt, he.hf(code - 1, 0, a0B.aUX[aZt].length - 1)), this.bU());
      }
    }
    return !0;
  }, this.bU = function () {
    aZs = 0, aZq && aZq.bU(), aZq = null, aI.nf.bU();
  };
}
function a75() {
  this.size = 0, this.af = 0, this.bk = null, this.r = function (bk) {
    this.af = 0, this.bk = bk, this.size = bk.length;
  }, this.bd = function (aa9) {
    return this.r(new Uint8Array(this.oD(aa9))), this.bk;
  }, this.mV = function () {
    this.bk = null;
  }, this.bh = function (size, aBN) {
    for (var bk = this.bk, fN = this.af + size - 1, aN = this.af; aN <= fN; aN++) bk[aN >> 3] |= (aBN >> fN - aN & 1) << 7 - (7 & aN);
    this.af += size, this.af > 8 * this.size && console.error("Wrapper Overflow");
  }, this.cK = function (size, aBN) {
    var ex = size >> 1,
      fS = 1 << ex;
    this.bh(size - ex, he.iA(aBN, fS)), this.bh(ex, aBN % fS);
  }, this.aaA = function (size) {
    for (var bk = this.bk, fN = this.af + size, aN = this.af; aN < fN; aN++) bk[aN >> 3] &= 255 ^ 128 >>> (7 & aN);
  }, this.oD = function (aa9) {
    return aa9 + 7 >> 3;
  }, this.aaB = function (a6, fO, fN, aaC) {
    for (var aN = fO; aN < fN; aN++) this.bh(aaC, a6[aN]);
  };
}
function aaD() {
  var tg, dA, aaE, aaF, aaG, aaH, aaI, aaJ, aaK;
  function mw() {
    return hB.nQ(fA.nR()) ? hC.mg ? __fx.settings.keybindButtons ? hB.eU - 2 * hB.dA - 3 * aaE : hB.eU - hB.dA - 2 * aaE : __fx.settings.keybindButtons ? hB.eU - hB.dA - 2 * aaE : hB.eU - aaE : hM.nQ(fA.nS()) ? hC.mg ? hM.mw() - hB.dA - 2 * aaE : hM.mw() - aaE : hC.mg ? d9.dA - hB.dA - (nT.nU() + 1) * aaE : d9.dA - nT.nU() * lS.gap;
  }
  function aaO(eZ, bS, id, d1, aaQ, aaR, gi, aaS, aaT, iz, aaX) {
    var aN,
      j,
      es,
      c3,
      aaY = void 0 !== aaT,
      aO = Math.floor(hK.measureText(bS, fA.lG) + 1.5 * aaF + (aaY ? dA : 1.5 * aaF));
    if (dy.gK = !0, aaX || v4.ip(bS, aaT), aO + 2 * aaE + hB.dA > d9.aO && !aaY && 50 !== id && 20 < bS.length) aaO(eZ, (aaX = aR.h.aCy(bS))[0], id, d1, aaQ, aaR, gi, aaS, aaT, iz, !0), aaO(eZ, aaX[1], id, d1, aaQ, aaR, gi, aaS, aaT, iz, !0);else if (aaX = aO + (50 === id ? aaG : 0), (es = document.createElement("canvas")).width = aO, es.height = dA, (j = es.getContext("2d", {
      alpha: !0
    })).font = fA.lG, aR.b.textBaseline(j, 1), aR.b.textAlign(j, 0), j.clearRect(0, 0, aO, dA), j.fillStyle = aaR, j.fillRect(0, 0, aO, dA), j.fillStyle = aaQ, j.fillText(bS, Math.floor(1.5 * aaF), Math.floor(dA / 2)), aaY && (j.imageSmoothingEnabled = !0, da.en.aYg(aaT, j, aO - dA, 0, dA)), 0 === (c3 = {
      dz: eZ,
      bS: bS,
      id: id,
      player: d1,
      canvas: es,
      aaQ: aaQ,
      aaR: aaR,
      aO: aO,
      aaV: aaX,
      gi: gi,
      aaS: aaS,
      aaT: aaT,
      iz: iz
    }).dz || 0 < tg.length && 0 < tg[0].dz) tg.unshift(c3);else {
      for (aN = 1; aN < tg.length; aN++) if (0 < tg[aN].dz) return void tg.splice(aN, 0, c3);
      tg.push(c3);
    }
  }
  function aaP(uW, kA, ex) {
    return "rgb(" + uW + "," + kA + "," + ex + ")";
  }
  function aaZ(id, aL) {
    for (var aM = tg.length, aN = 0; aN < aM; aN++) tg[aN].id === id && aL-- <= 0 && (tg.splice(aN, 1), aN--, aM--);
  }
  function aaa(id, player) {
    for (var kp = !1, aN = tg.length - 1; 0 <= aN; aN--) tg[aN].id !== id || player !== ct.cv && tg[aN].player !== player || (tg.splice(aN, 1), kp = !0);
    return kp;
  }
  function aak(bS) {
    aaO(340, bS, 6, 0, aaP(215, 245, 255), bG.iq, -1, !1);
  }
  this.a5I = "", this.r = function () {
    var self;
    aaJ = 0, aaI = cA.hg.hh() ? 7 : 12, aaH = {
      ix: [0, 0, 0],
      aaL: [0, 0, 0],
      u0: [220, 180, 180],
      sE: [0, 0, 0],
      bW: [0, 0, 0]
    }, tg = [], this.resize(), ct.dO && this.aEv(0, 18), fU.tu.tv[fU.jJ].name.length && aak(L(519, [fU.tu.tv[fU.jJ].name])), fU.tu.tv[fU.jJ].a1O && aak(L(520, [fU.tu.tv[fU.jJ].a1O])), aak(L(521, [fU.fV - 2 + "x" + (fU.iD - 2)])), aak(L(522, [aR.h.dG(vD.ms)])), vD.ms !== vD.aTz && aak(L(523, [aR.h.dG(vD.aTz) + " (" + aR.h.qd(100 * vD.aTz / vD.ms, 1) + ")"])), 0 < vD.aU0 && aak(L(499, [aR.h.dG(vD.aU0) + " (" + aR.h.qd(100 * vD.aU0 / vD.ms, 1) + ")"])), 0 < vD.aCR && aak(L(524, [aR.h.dG(vD.aCR) + " (" + aR.h.qd(100 * vD.aCR / vD.ms, 1) + ")"])), 10 === ct.cu && aaO(120, L(525), 6, 0, aaP(235, 255, 120), bG.iq, -1, !1), 0 !== (self = this).a5I.length && (aaO(200, self.a5I, 0, 0, bG.bH, bG.iq, -1, !1), self.a5I = ""), ct.ut && aaO(340, L(479), 6, 0, aaP(255, 200, 0), bG.iq, -1, !1);
  }, this.resize = function () {
    var a9Q, aN;
    if (dA = (dA = Math.floor((cA.hg.hh() ? .031 : .0249) * d9.dC)) < 10 ? 10 : dA, this.fontSize = Math.floor(2 * dA / 3), this.lG = aR.b.dF(1, this.fontSize), aaE = lS.gap, aaF = Math.floor(dA / 5), 0 < tg.length) for (a9Q = tg, tg = [], aN = a9Q.length - 1; 0 <= aN; aN--) aaO(a9Q[aN].dz, a9Q[aN].bS, a9Q[aN].id, a9Q[aN].player, a9Q[aN].aaQ, a9Q[aN].aaR, a9Q[aN].gi, a9Q[aN].aaS, a9Q[aN].aaT, a9Q[aN].iz, !0);
    this.aaU();
  }, this.aaU = function () {
    aaK = document.createElement("canvas");
    var bS = L(480),
      j = (aaG = hK.measureText(bS, this.lG) + 5 * aaF, aaK.height = dA, aaK.width = aaG, aaK.getContext("2d", {
        alpha: !0
      }));
    j.font = this.lG, aR.b.textBaseline(j, 1), aR.b.textAlign(j, 1), j.clearRect(0, 0, aaG, dA), j.fillStyle = bG.mQ, j.fillRect(0, 0, aaG, dA), j.fillStyle = bG.bH, j.fillText(bS, Math.floor(aaG / 2), Math.floor(dA / 2));
  }, this.nR = function () {
    var aM;
    return hC.mg ? hC.aO : 0 === (aM = tg.length) ? 0 : 1 === aM ? tg[0].aaV : lg(tg[0].aaV, tg[1].aaV);
  }, this.nS = function () {
    var aM = tg.length;
    return hC.mg ? aM ? lg(hC.aO, tg[0].aaV) : hC.aO : 0 === aM ? 0 : 1 === aM ? tg[0].aaV : 2 === aM ? lg(tg[0].aaV, tg[1].aaV) : lg(lg(tg[0].aaV, tg[1].aaV), tg[2].aaV);
  }, this.mv = function (eT, eU) {
    for (var e3, uS, aaW = mw(), aN = tg.length - 1; 0 <= aN; aN--) if ((uS = aaW - (aN + 1) * dA) <= eU && eU < uS + dA) return 50 === tg[aN].id ? eT >= d9.aO - aaG - aaE - tg[aN].aO && (eT >= d9.aO - aaG - aaE ? gD.f.aWn(tg[aN].player) : hI.aB9(tg[aN].player, 800, !1, 0), !0) : eT >= d9.aO - tg[aN].aO - aaE && (736 === tg[aN].id ? window.open("https://" + tg[aN].bS, "_blank") : tg[aN].aaS && (tg[aN].iz && tg[aN].iz.aQ ? (uS = tg[aN].iz.gm, e3 = dr.ht(uS) - 10, uS = dr.hu(uS) - 10, hI.aWE(e3, uS, 19 + e3, 19 + uS)) : tg[aN].iz && tg[aN].iz.ex ? hI.aWF(tg[aN].player, tg[aN].iz.kh) : (hI.aB9(tg[aN].player, 800, !1, 0), 0 <= tg[aN].gi && (e3 = tg[aN].gi, tg[aN].gi = tg[aN].player, tg[aN].player = e3))), !0);
    return !1;
  }, this.ip = function (eZ, bS, id, d1, aaQ, aaR, gi, aaS, aaT, iz) {
    aaO(eZ, bS, id, d1, aaQ, aaR, gi, aaS, aaT, iz);
  }, this.aOM = function (a0) {
    aaO(300, a0, 252, 0, bG.bH, bG.iq, -1, !1);
  }, this.nA = function (id) {
    for (var aN = tg.length - 1; 0 <= aN; aN--) tg[aN].id === id && (tg[aN].dz = 1);
  }, this.aEv = function (player, id) {
    0 === id ? (hK.kC(player, 0), aaZ(423, 2), aaO(160, L(481, [d3.dI[player]]), 423, player, "rgb(10,220,10)", bG.iq, -1, !1)) : 1 === id ? (aaa(50, ct.cv), hK.kC(player, 1), aaO(360, L(482, [d3.dI[player]]), 0, player, bG.aFV, bG.iq, -1, !0), hI.aB9(player, 2700, !1, 0)) : 2 === id ? (hK.kC(player, 2), aaO(0, L(483), 0, player, "rgb(10,255,255)", bG.iq, -1, !0), hI.aB9(player, 2700, !1, 0)) : 3 === id ? (hK.kC(player, 2), aaO(0, L(484, [d3.dI[player]]), 0, player, bG.bH, bG.iq, -1, !0), hI.aB9(player, 2700, !1, 0)) : 4 === id ? this.aab(1, player, player) : 5 === id ? aR.f.eH(ct.eG) || (function (id, a6b) {
      var aN,
        wy = 0,
        aM = tg.length;
      for (aN = 0; aN < aM; aN++) if (tg[aN].id === id && a6b <= ++wy) return tg.splice(aN, 1);
    }(1, 5), di.f9(player) && aaO(180, L(485, [d3.dI[player]]), 1, player, aaP(255, 200, 180), bG.iq, -1, !0), aR.f.ko(player, 10) && (aaZ(573, 0), aaO(180, L(486, [d3.dI[player]]), 573, player, bG.aFV, bG.iq, -1, !0))) : 18 === id ? aaO(255, L(487), 18, 0, bG.bH, bG.iq, -1, !1) : 21 === id ? aaO(220, L(488), id, 0, bG.bH, bG.iq, -1, !1) : 22 === id ? this.aab(2, player, player) : 59 === id && aaO(0, L(489), id, 0, bG.aFg, bG.iq, 0, !1);
  }, this.mI = function (a0) {
    aaO(200, L(490, [a0]), 94, 0, bG.bH, bG.aFT, -1, !1);
  }, this.aSb = function (aad) {
    if (ct.eG === aad && !ct.kD && !ct.mH) __fx.wins.count++, window.localStorage.setItem("fx_winCount", __fx.wins.count), aaO(0, "Your Win Count is now " + __fx.wins.count, 3, aad, bG.bH, bG.iq, -1, !0);
    d3.d4[aad] && (hK.kC(aad, 2), ct.dP < 100 ? aaO(0, L(484, [d3.dI[aad]]), 3, aad, bG.bH, bG.iq, -1, !0) : aaO(0, L(491, [d3.dI[aad]]), 3, aad, bG.bH, bG.iq, -1, !0));
  }, this.aYu = function (fK) {
    var bS,
      aae,
      aZn = "(" + dr.ht(fK >> 2) + ", " + dr.hu(fK >> 2) + ")",
      aaS = !1,
      player = 0;
    d5.kr(fK) ? d5.ho(fK) ? aZn = L(492, [aZn]) : (player = d5.hp(fK), ct.mH && !1 === __fx.hoveringTooltip.active && (ct.eG = player), bS = L(493, [aR.j.qZ(d3.rj[player], aR.b.dF(0, 10), 150)]) + "   ", bS = (bS += L(494, [aR.h.dG(d3.dL[player])]) + "   ") + L(495, [aR.h.dG(d3.d4[player])]) + "   ", ct.il && (aae = ey.rB[ey.iv[ey.iy[player]]], bS += L(56) + ": " + aae + "   "), aR.f.eH(player) && (bS += L(50) + ": " + tV.tW[tV.ki[player]] + "   "), aZn = bS = (bS += L(496, [player]) + "   ") + L(497, [aZn]), aaS = !0) : aZn = d5.aL6(fK) ? L(498, [aZn]) + "   #" + d5.hm(fK) : L(499, [aZn]), aaZ(55, 0), aaO(220, aZn, 55, player, bG.bH, bG.iq, -1, aaS, void 0, void 0, !0);
  }, this.aYv = function (aaf) {
    var aW = h0.b1,
      player = aW.kw[aaf] >> 3,
      bS = (dy.gK = !0, aaZ(55, 0), L(500, [d3.dI[player]]) + "   ");
    aaO(220, bS += L(494, [aR.h.dG(aW.kx[aaf])]), 55, player, bG.bH, bG.iq, -1, !0);
  }, this.aKe = function (a2A, k5, ek) {
    a2A === ct.eG ? aaO(175, " " + L(501, [d3.dI[k5]]) + ": ", 1001, k5, aaP(200, 255, 210), bG.iq, -1, !0, ek) : this.aag(a2A, ek);
  }, this.aag = function (a2A, ek) {
    aaZ(1e3, 0), aaO(175, d3.dI[a2A] + ": ", 1e3, a2A, bG.bH, "rgba(5,60,25,0.9)", -1, !0, ek);
  }, this.aSa = function () {
    var a0;
    ct.ux ? (a0 = L(502), hK.tt(L(503), 2, 1, 12), aaO(0, a0, 40, 0, "rgb(10,220,10)", bG.iq, -1, !1)) : (a0 = L(504), hK.tt(L(505), 2, 0, 16), aaO(0, a0, 41, 0, bG.bH, bG.iq, -1, !1));
  }, this.aQh = function () {
    var aL = d3.dI,
      fS = ct.data;
    aaO(300, aL[0] + " [" + ct.uu.aQn(fS.elo[0]) + "] vs " + aL[1] + " [" + ct.uu.aQn(fS.elo[1]) + "]", 65, 0, bG.r8, "rgba(100,255,255,0.75)", -1, !1);
  }, this.aah = function (a0) {
    aaO(350, a0, 0, 0, "rgb(40,255,200)", "rgba(10,60,40,0.9)", -1, !1);
  }, this.nB = function (mf) {
    aaO(0, L(mf ? 506 : 507), 247, 0, bG.bI, bG.iq, -1, !1);
  }, this.aQp = function (aQm, aQo, aai) {
    var fS = ct.data,
      aL = d3.dI;
    aaO(0, aL[0] + ": " + ct.uu.aQn(fS.elo[0]) + " -> " + aQm, 66, 0, bG.bH, aai[0], -1, !1), aaO(0, aL[1] + ": " + ct.uu.aQn(fS.elo[1]) + " -> " + aQo, 66, 1, bG.bH, aai[1], -1, !1);
  }, this.aQH = function (player, id) {
    0 === id ? aaa(50, player) ? (aaO(128, L(508, [d3.dI[player]]), 52, player, aaP(180, 255, 180), bG.iq, -1, !0), di.dU(player, 2, 255)) : aaO(384, L(509, [d3.dI[player]]), 51, player, aaP(210, 210, 255), bG.iq, -1, !0) : aaa(51, player) ? (aaO(128, L(510, [d3.dI[player]]), 52, player, bG.bH, "rgba(60,120,10,0.9)", -1, !0), di.dU(player, 2, 255)) : (aaO(384, L(511, [d3.dI[player]]), 50, player, bG.bH, "rgba(90,90,90,0.9)", -1, !0), di.dU(player, 2, 96));
  }, this.aWq = function (ix, target) {
    var color = aaP(210, 255, 210);
    1 < ix.length ? aaO(230, L(512, [ix.length, d3.dI[target]]), 66, target, color, bG.iq, -1, !0) : aaO(230, L(513, [d3.dI[ix[0]], d3.dI[target]]), 66, ix[0], color, bG.iq, target, !0);
  }, this.aQI = function (player, target) {
    aaO(230, L(514, [d3.dI[player], d3.dI[target]]), 66, player, bG.bH, "rgba(75,65,5,0.9)", target, !0);
  }, this.ik = function (id, aL) {
    aaZ(id, aL);
  }, this.fB = function (id, player) {
    aaa(id, void 0 === player ? ct.cv : player);
  }, this.ii = function (id) {
    for (var aN = tg.length - 1; 0 <= aN; aN--) if (tg[aN].id === id) return tg[aN];
    return null;
  }, this.a3t = function (d2, aaj, player) {
    2 !== d3.eL[ct.eG] && aaO(200, 1 === d2 ? L(515, [d3.dI[player]]) : L(516, [aR.h.dG(d2), d3.dI[player]]), 30, player, "rgb(190,255,190)", bG.iq, -1, !0);
  }, this.aQQ = function (d2, player) {
    2 !== d3.eL[ct.eG] && (aaZ(31, 0), d2 = " (" + aR.h.dG(d2) + ") 💸", aaO(150, d2 = aR.f.eH(player) ? L(517) + d2 : L(518, [d3.dI[player]]) + d2, 31, player, bG.r8, "rgba(205,205,205,0.9)", -1, !0));
  }, this.aal = function (dx) {
    for (var bW = dy.f2(), aN = 2; 0 <= aN; aN--) 0 < aaH.sE[aN] && (dx || aaH.bW[aN] < bW - 220) && this.aam(aN);
  }, this.aam = function (id) {
    var bS,
      aM = aaH.sE[id],
      player = aaH.ix[id];
    aaH.sE[id] = 0, 1 === aM ? (0 === id ? bS = L(526, [d3.dI[player], d3.dI[aaH.aaL[0]]]) : 1 === id ? bS = L(527, [d3.dI[player]]) : 2 === id ? bS = L(528, [d3.dI[player]]) : 3 === id && (bS = L(529, [d3.dI[player]])), aaZ(7, 0), aaO(aaH.u0[id], bS, 7, aaH.aaL[id], bG.bH, bG.iq, -1, !0)) : (bS = L(0 === id ? 530 : 1 === id ? 531 : 532, [aM]), aaZ(7, 0), aaO(aaH.u0[id], bS, 7, player, bG.bH, bG.iq, -1, !1));
  }, this.aab = function (id, g4, gi) {
    var bW = dy.f2(),
      aM = aaH.sE[id] + 1;
    aaH.sE[id]++, aaH.ix[id] = g4, aaH.aaL[id] = gi, 1 === aM && (aaH.bW[id] = bW), (1 === aM && (ct.qm < 32 || 2 === ct.dX) || 1 < aM && (aaH.bW[id] < bW - 140 || 2 === ct.dX)) && this.aam(id);
  }, this.f1 = function () {
    aan.f1();
    for (var ud = (ud = tg.length - aaI) <= 1 ? 1 : ud * ud, aN = tg.length - 1; 0 <= aN; aN--) 0 < tg[aN].dz && (tg[aN].dz -= ud, tg[aN].dz <= 0) && (dy.gK = !0, tg.splice(aN, 1));
    !function () {
      var aL, aN;
      if (128 !== aaJ && !(++aaJ < 128)) for (aL = 5, aN = eI.eJ - 1; 0 <= aN; aN--) 1 === d3.eL[eI.eK[aN]] && 0 < aL-- && aaO(240, L(529, [d3.dI[eI.eK[aN]]]), 1, eI.eK[aN], bG.r8, "rgba(255,255,255,0.75)", -1, !0);
    }(), this.aal(!1);
  }, this.dd = function () {
    for (var ee, eU = mw(), aN = tg.length - 1; 0 <= aN; aN--) ee = eU - (aN + 1) * dA, 50 === tg[aN].id ? (dE.drawImage(tg[aN].canvas, d9.aO - tg[aN].aO - aaG - aaE, ee), dE.drawImage(aaK, d9.aO - aaG - aaE, ee)) : dE.drawImage(tg[aN].canvas, d9.aO - tg[aN].aO - aaE, ee);
  }, this.aap = function (id, ki) {
    var aZn,
      aaq = bG.aFE;
    0 === id ? aZn = L(533) : 1 === id ? (aZn = L(534), aaq = bG.aFe) : 2 === id ? aZn = L(535) : 3 === id ? aZn = L(536) : (aZn = aR.h.dG(ki), aaq = 5 === id ? bG.aFe : bG.iq), aaZ(74, 0), aaO(0, aZn, 74, 0, bG.bH, aaq, -1, !1, void 0, void 0, !0);
  };
}
function aar() {
  var e3,
    e6,
    e8,
    e9,
    aas = 0,
    aat = 0;
  function aav() {
    return Math.pow(Math.pow(e8 - e3, 2) + Math.pow(e9 - e6, 2), .5);
  }
  function aau(b7) {
    e3 = d9.o5 * b7.touches[0].clientX, e6 = d9.o5 * b7.touches[0].clientY, e8 = d9.o5 * b7.touches[1].clientX, e9 = d9.o5 * b7.touches[1].clientY;
  }
  this.aHs = function (b7) {
    return 1 < b7.touches.length ? (aat = dy.dz, aas = 3, aau(b7), eu.bU(), !0) : (aas = 0, !1);
  }, this.aHt = function (b7) {
    var a66, hw, hx;
    return 0 !== ct.dX && 1 < b7.touches.length && (aas = Math.max(aas - 1, 0), hI.fN() && (a66 = aav(), aau(b7), b7 = aav(), hw = Math.floor((e3 + e8) / 2), hx = Math.floor((e6 + e9) / 2), qA.aDY(hw, hx, Math.max(.125, b7) / Math.max(.125, a66)), dy.gK = !0), !0);
  }, this.aIF = function () {
    var eT, eU;
    return !!(aas && (aas = 0, dy.dz < aat + 500)) && (eT = (e3 + e8) / 2, eU = (e6 + e9) / 2, eu.aIA(eT, eU), eu.click(eT, eU, !0) && (dy.gK = !0), !0);
  };
}
function aaw() {
  var aax = 0,
    aay = new Uint16Array(64);
  function lu(xm) {
    aax -= 2;
    for (var aN = xm; aN < aax; aN += 2) aay[aN] = aay[aN + 2], aay[aN + 1] = aay[aN + 3];
  }
  this.r = function () {
    aax = 0;
  }, this.f1 = function () {
    var aN, l5, i9;
    if (0 !== aax) if (0 === d3.eF[ct.eG]) aax = 0;else if (0 === lA.a9G(ct.eG)) aax = 0;else for (aN = aax - 2; 0 <= aN; aN -= 2) (l5 = aay[aN]) < ct.cv && 0 === d3.eF[l5] ? lu(aN) : (i9 = aay[aN + 1], (ct.cv <= l5 && kl.ab0(ct.eG) || l5 < ct.cv && kl.ab1(ct.eG, l5)) && (gD.n1.oY(i9, l5), lu(aN)));
  }, this.aQc = function (l5, i9) {
    !function (l5, i9) {
      for (var aN = 0; aN < aax; aN += 2) if (aay[aN] === l5) return aay[aN + 1] = Math.min(aay[aN + 1] + i9, 1023), 1;
      return;
    }(l5, i9) && 64 !== aax && (aay[aax] = l5, aay[aax + 1] = i9, aax += 2);
  };
}
function aTr() {
  var aUR = [L(537), L(538), L(539), L(540), L(541), L(542), L(543)],
    ab3 = [100, 60, 30, 15, 6, 1],
    ab4 = [[0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [1, 2, 1, 1, 1], [1, 3, 2, 1, 2], [1, 4, 2, 2, 3], [1, 4, 3, 3, 4], [1, 5, 3, 3, 5]],
    ab5 = [" 👢 kicked ", " 🔇 muted ", " ✂️ redacted the username of ", " deducted x from ", " seized x from ", " 🚩 reported "],
    ab6 = [".", ". Duration: x", ". Duration: x", ".", ".", ". Reason: x"];
  this.aUX = [["", "", ""], ["20 Seconds", "1 Minute", "5 Minutes", "1 Hour", "1 Day"], ["1 Minute", "1 Hour", "1 Day"], ["0.1 Elo Points", "0.2 Elo Points", "0.3 Elo Points"], ["0.5 Gold", "1 Gold", "2 Gold", "5 Gold", "10 Gold"], ["Offensive Name", "Hate Speech", "Cheater", "False Reporter", "Block Account", "Ban IP", "Gold Seizure", "Remove Punishments"]], this.aa2 = function (id, uW, af) {
    uW = this.ab7(uW);
    return +(ab4[uW][id] > af);
  }, this.ab7 = function (uW) {
    for (var aN = 0; aN < ab3.length; aN++) if (ab3[aN] <= uW) return aN;
    return ab3.length;
  }, this.aXV = function (uW) {
    return aUR[this.ab7(uW)];
  }, this.aUW = function (id, aWM) {
    return ab5[id].replace(new RegExp("x", "g"), aWM);
  }, this.aUY = function (id, aWM) {
    return ab6[id].replace(new RegExp("x", "g"), aWM);
  }, this.a0C = function (id, ab8) {
    return this.aUX[5][id];
  };
}
function ab9() {
  var aDi = 0,
    abA = 0,
    abB = 0,
    abC = 0,
    a5r = -1;
  function abF(fK) {
    if (a5r === fK) return !1;
    if (-1 === (a5r = fK)) aDi = 0, fA.aap(aDi, 0);else {
      if (d5.l3(fK)) return abB = d5.hp(fK), abG = d3.dL[abB] - d3.eX[abB], (4 !== aDi || abG !== abA) && (aDi = 4, abA = abG, fA.aap(aDi, abG), !0);
      if (d5.ho(fK)) return 3 !== aDi && (aDi = 3, fA.aap(aDi, 0), !0);
      if (d5.aL6(fK)) return 2 !== aDi && (aDi = 2, fA.aap(aDi, 0), !0);
      var abG = h0.nd.a4T(a5t.a5v, a5t.a5w);
      if (-1 === abG) return 1 !== aDi && (aDi = 1, fA.aap(aDi, 0), !0);
      fK = h0.b1.kx[abG];
      if (abB = h0.b1.pj[abG], abC = h0.b1.kw[abG] >> 3, 5 === aDi && fK === abA) return !1;
      aDi = 5, abA = fK, fA.aap(aDi, fK);
    }
    return !0;
  }
  this.r = function () {
    abC = abB = abA = aDi = 0, a5r = -1;
  }, this.f1 = function (dx) {
    var hs;
    !dx && a5t.a5u() || (dx = dr.ds(a5t.a5v), hs = dr.du(a5t.a5w), dr.iC(dx, hs) ? (dx = dr.iE(dx, hs), abF(dr.iI(dx))) : abF(-1));
  }, this.h9 = function () {
    var abH, abG, aYt, aLs;
    if (0 !== aDi && 2 !== aDi) if (a5t.a5u()) {
      if (1 !== aDi && 3 !== aDi) {
        if (4 === aDi) return void (abG = d3.dL[abB] - d3.eX[abB], abA === abG || (abA = abG, fA.aap(aDi, abG)));
        (aYt = h0.nd.a4O(abC, abB)) < 0 ? (aDi = 1, fA.aap(aDi, 0)) : (aLs = h0.b1.kx[aYt]) !== abA && (abA = aLs, fA.aap(aDi, aLs));
      }
    } else if (1 === aDi) -1 !== (aYt = h0.nd.a4T(a5t.a5v, a5t.a5w)) && (aDi = 5, abA = h0.b1.kx[aYt], fA.aap(aDi, abA));else if (3 === aDi) d5.l3(a5r) && (aDi = 4, abH = d5.hp(a5r), abA = d3.dL[abH] - d3.eX[abH], fA.aap(aDi, abA));else if (4 === aDi) {
      if (d5.l3(a5r)) return void (abH = d5.hp(a5r), abG = d3.dL[abH] - d3.eX[abH], abA === abG || (abA = abG, fA.aap(aDi, abG)));
      aDi = 3, fA.aap(aDi, 0);
    } else -1 === (aYt = h0.nd.a4T(a5t.a5v, a5t.a5w)) ? (aDi = 1, fA.aap(aDi, 0)) : (aLs = h0.b1.kx[aYt]) !== abA && (abA = aLs, fA.aap(aDi, aLs));
  };
}
function abI() {
  return 4095 & window.screen.width ^ 4095 & window.screen.height;
}
function aC1(aBo) {
  var a6N = document.createElement("div"),
    aBt = document.createElement("div");
  this.hQ = function () {
    aBt.textContent = "", aI.nf.aNf && aI.nf.bU(1);
    for (var aLW = document.createDocumentFragment(), abJ = aI.b1.a30[0], aU = aI.aU.aV[abJ], jQ = aI.aU.jQ[abJ], aN = 0; aN < aU.length; aN++) !function (aLW, c3, abL, abJ) {
      var hX = document.createElement("span");
      hX.textContent = (abL ? "🟢 " : "⚪ ") + aI.nd.aUb(c3, abJ), hX.style.color = aI.nd.aUc(c3.aNn), 11 === c3.aNn && (hX.style.textShadow = "-1px -1px 0 lightgray,1px -1px 0 lightgray,-1px 1px 0 lightgray,1px 1px 0 lightgray");
      hX.style.cursor = "pointer", hX.style.margin = "0.2em 0.2em 0.2em 0.2em", hX.style.width = hX.style.maxWidth = 2 === abJ ? "10em" : "9em", hX.style.height = hX.style.maxHeight = "1.4em", hX.style.whiteSpace = "nowrap", hX.style.overflow = "hidden", hX.style.textOverflow = "ellipsis", hX.style.font = "inherit", hX.style.display = "inline-block", __fx.settings.highlightDuplicateIps && (abL = __fx.utils.getDuplicateIpHighlightColor(c3, aI.aU.aV[abJ], "aNq")) && (hX.style.backgroundColor = abL, hX.style.borderRadius = "0.3em");
      aI.nd.aUf(c3) && (hX.style.textDecoration = "underline"), c3.ls && (hX.style.textDecorationLine = "underline", hX.style.textDecorationStyle = "dotted");
      hX.onclick = function (b7) {
        aBo(b7, c3);
      }, a5t.a5u() || (hX.onmouseover = function (b7) {
        aI.nf.aNi(b7.target, c3, 1);
      }), aLW.appendChild(hX);
    }(aLW, aU[aN], aN < jQ, abJ);
    aBt.appendChild(aLW);
  }, this.show = function (fX) {
    fX.appendChild(a6N);
  }, this.bU = function (fX) {
    aq.removeChild(fX, a6N);
  }, this.resize = function () {
    aBt.style.fontSize = aR.b.nz(aR.b.tJ(.02, .3));
  }, a6N.style.top = "0", a6N.style.left = "0", a6N.style.width = a6N.style.height = "100%", a6N.style.overflowX = "hidden", a6N.style.overflowY = "auto", a6N.style.font = "inherit", aBt.style.font = "inherit", aBt.style.margin = "0.4em", a6N.appendChild(aBt);
}
function a2a() {
  this.aLL = function () {
    for (var aM = eI.eJ, ix = eI.eK, aGO = [], aN = 0; aN < aM; aN++) {
      var d1 = ix[aN];
      aR.f.abM(d1) && aGO.push(d1);
    }
    return aGO;
  }, this.aLM = function () {
    if (0 === ey.iv[ct.uz]) return this.aLN();
    hE.a58(ct.uz);
    for (var aGO = [], aM = k3.a5A[0], a59 = k3.a59, aN = 0; aN < aM; aN++) {
      var d1 = a59[aN];
      aR.f.abM(d1) && aGO.push(d1);
    }
    return aGO;
  }, this.aLN = function () {
    var d1 = iw[0];
    return aR.f.abM(d1) ? [d1] : [];
  }, this.aLP = function (aGO) {
    for (var aM = aGO.length, eZ = 0, d4 = d3.d4, aN = 0; aN < aM; aN++) eZ += d4[aGO[aN]];
    return eZ;
  };
}
function v5() {
  this.kC = function (player, gm) {
    vH.aSI(player, dr.ht(gm), dr.hu(gm)) && (dy.gK = !0), ct.kD && this.f1();
  }, this.f1 = function () {
    ct.dO = !1;
    for (var aN = 0; aN < ct.dP; aN++) 0 !== d3.eF[aN] && 0 === d3.d4[aN] && vH.aSL(aN);
    0 !== d3.eF[ct.eG] ? (hD.a48[7] = d3.d4[ct.eG], hD.a48[8] = d3.dL[ct.eG], hB.a3Y(), gG.qX(), ct.mH || hI.aWE(d3.dM[ct.eG] - 5, d3.dN[ct.eG] - 5, d3.dS[ct.eG] + 5, d3.dT[ct.eG] + 5), hL.r()) : hJ.show(!1, !1, !1, !0), fA.nA(18), di.dR(), di.dY(!0), h5.b1.a4r(), eu.bU(), ct.gI = null, gJ.aJZ = !0, gJ.gW(), ct.kD && cA.hg.setState(1);
  };
}
function abN() {
  this.size = 0, this.af = 0, this.bk = null, this.r = function (bk) {
    this.af = 0, this.bk = bk, this.size = bk.length;
  }, this.mV = function () {
    this.bk = null;
  }, this.bg = function (size) {
    for (var aY = 0, bk = this.bk, fN = this.af + size - 1, aN = this.af; aN <= fN; aN++) aY |= (bk[aN >> 3] >> 7 - (7 & aN) & 1) << fN - aN;
    return this.af += size, this.af > 8 * this.size && console.error("Unwrapper Overflow"), aY;
  }, this.a2O = function (size) {
    var ex = size >> 1;
    return (1 << ex) * this.bg(size - ex) + this.bg(ex);
  }, this.a2J = function (aa9) {
    return this.size === bc.oD(aa9);
  }, this.a5W = function (a1T, a1U, abO) {
    var aL = this.bg(a1T);
    if (!aL) return null;
    for (var a1T = Math.max(aL, abO), a6 = new (a1U <= 8 ? Uint8Array : a1U <= 16 ? Uint16Array : Uint32Array)(a1T), aN = 0; aN < aL; aN++) a6[aN] = this.bg(a1U);
    abO = a6[aL - 1];
    return abO && a6.fill(abO, aL), a6;
  }, this.a5X = function (a1T, a1W, abO) {
    var aL = this.bg(a1T);
    if (!aL) return null;
    for (var a1T = Math.max(aL, abO), a6 = new Array(a1T), aN = 0; aN < aL; aN++) a6[aN] = this.a5U(a1W);
    return a6.fill(a6[aL - 1], aL), a6;
  }, this.a5U = function (a1T) {
    return aZ.bz.a2L(this.bg(a1T));
  }, this.a5V = function () {
    var oC = this.bg(30);
    if (!(6 * oC > 8 * this.size - this.af)) {
      var bS = bs.aa.fx(bs.aa.fy(oC)),
        bS = aR.h.a1Y(bS, "_", "/");
      bS = aR.h.a1Y(bS, "-", "+");
      for (var abP = ""; (bS.length + abP.length) % 4;) abP += "=";
      bS = "data:image/png;base64," + bS + abP;
      var a5N = new Image();
      a5N.onload = function () {
        gF.aKT.a5M(a5N), a5N.onload = null, a5N = null;
      }, a5N.src = bS;
    }
  };
}
function abQ() {
  var abR,
    abS,
    a8o,
    abT,
    abU,
    abV,
    abW,
    abX,
    abY,
    a8m,
    abZ,
    aba,
    abb,
    abc = 1,
    abe = 0;
  function abf(abg) {
    abg ? abb = (abb + 1) % aF.b1.aG3 : (aF.b1.close(abb, 3280), abc ? abc = 0 : (abb = (abb + 1) % aF.b1.aG3, aF.b1.close(abb, 3280))), aba = dy.dz, mF.aGC = abe, aF.b1.aG7(abb, 4, 1) && aF.aG.li(abb);
  }
  function abh() {
    0 === abb ? a71.mL(3249) : abf();
  }
  function abm(eU, aVF, jI) {
    var e3 = Math.floor((d9.aO - abT) / 2) + abW,
      e8 = e3 + Math.floor(jI * (abT - 2 * abW));
    dE.lineWidth = aVF, dE.beginPath(), dE.moveTo(e3, eU), dE.lineTo(e8, eU), dE.lineTo(Math.floor(e3 - abW + jI * abT), eU + a8o), dE.lineTo(e3 - abW, eU + a8o), dE.closePath();
  }
  this.a3D = 1, this.aGE = 0, this.aGC = 0, this.r = function () {
    hG.turnstile.a9h(), jE.setState(6), abR = 0, abS = 1, abX = "rgba(0,220,120,0.4)", abY = "rgba(0,0,0,0.8)", this.resize(), dy.gK = !0, abc = 1, abb = this.a3D - 1, abe = 0, abf(1);
  }, this.resize = function () {
    abT = Math.floor((cA.hg.hh() ? .5 : .25) * d9.dC), abU = abT + 12, a8o = Math.floor(.125 * abT), abW = 3 * a8o, abV = Math.floor(.225 * abT), abZ = Math.floor(.3 * a8o), a8m = aR.b.dF(0, abZ);
  }, this.mG = function (bb) {
    bb === abb && abh();
  }, this.mv = function (eT, eU) {
    var e3 = Math.floor((d9.aO - abU) / 2),
      e6 = Math.floor(.5 * (d9.dA - lS.gap - a8o - abV)) + a8o + lS.gap;
    return e3 < eT && eT < e3 + abU && e6 < eU && eU < e6 + abV && (this.aIM(), u7.dh(eT, eU, !1), !0);
  }, this.aIM = function () {
    aF.b1.mS(3260), aq.b1.mR();
  }, this.f1 = function () {
    6 === jE.jF() && (dy.dz > aba + 12e3 && abh(), 100 < (abR += .07 * abS * (abR < 16 ? 5 + abR : 84 < abR ? 105 - abR : 17)) ? (abR = 100, abS = -1) : abR < 0 && (abR = 0, abS = 1), abX = "rgba(0," + Math.floor(190 - 1.9 * abR) + "," + Math.floor(120 - 1.2 * abR) + "," + (.4 + .004 * abR) + ")", abY = "rgba(0," + Math.floor(1.9 * abR) + "," + Math.floor(1.2 * abR) + "," + (.8 - .004 * abR) + ")", dy.gK = !0);
  }, this.dd = function () {
    var eT = Math.floor((d9.aO - abU) / 2),
      eU = Math.floor(.5 * (d9.dA - lS.gap - a8o - abV));
    !function (title, eU, aVF, jI) {
      dE.fillStyle = abY, abm(eU, aVF, 1), dE.fill(), dE.fillStyle = abX, abm(eU, aVF, jI), dE.fill(), dE.strokeStyle = bG.bH, abm(eU, aVF, 1), dE.stroke(), function (abo, eU) {
        aR.b.textAlign(dE, 1), aR.b.textBaseline(dE, 1), dE.font = a8m, dE.fillStyle = bG.bH, dE.fillText(abo, Math.floor(.5 * d9.aO), Math.floor(eU + .58 * a8o));
      }(title, eU);
    }(L(544), eU, 3, abR / 100), function (eT, eU, aO, dA, aE) {
      dE.fillStyle = bG.uQ, dE.fillRect(eT, eU, aO, dA), dE.lineWidth = 3, dE.strokeStyle = bG.bH, dE.strokeRect(eT, eU, aO, dA);
      var aM = Math.floor(.3 * dA);
      aR.b.textAlign(dE, 1), aR.b.textBaseline(dE, 1), dE.font = aR.b.dF(0, aM), dE.fillStyle = bG.bH, dE.fillText(aE, Math.floor(eT + aO / 2), Math.floor(eU + dA / 2 + .1 * aM));
    }(eT, eU + a8o + lS.gap, abU, abV, L(1));
  };
}
function a3l() {
  this.bj = function (bS, a1T, abp) {
    for (var abq = [], aM = bS.length, max = 0, aN = 0; aN < aM; aN++) {
      var aY = bS.charCodeAt(aN);
      abq.push(aY), max = Math.max(max, aY);
    }
    var aVd = max < 128 ? 7 : 16;
    for (abp.bh(a1T, aM), abp.bh(1, +(16 == aVd)), aN = 0; aN < aM; aN++) abp.bh(aVd, abq[aN]);
  };
}
function abr() {
  this.db = new aUD(), this.en = new vx();
}
function abt() {
  function abu(b7) {
    var a6,
      b7 = b7.target.files;
    b7 && 0 < b7.length && (b7 = b7[0], "json" === (a6 = b7.name.split("."))[a6.length - 1].toLowerCase()) && ((a6 = new FileReader()).onload = ac1, a6.readAsText(b7));
  }
  function ac1(b7) {
    var ac4;
    ct.dX || (b7 = JSON.parse(b7.target.result), ac4 = ct.data = new nt(), ac5(b7, ac4, "mapType", 0, 2), ac5(b7, ac4, "mapProceduralIndex", 0, 255), ac5(b7, ac4, "mapRealisticIndex", 0, 255), ac5(b7, ac4, "mapSeed", 0, 16383), function (ac3, ac4, s9, max) {
      ac3 = ac3[s9];
      ac4[s9] = acB(ac3) ? ac3.slice(0, max) : ac4[s9];
    }(b7, ac4, "mapName", 20), function (ac3, ac4, s9) {
      var a5N;
      2 === ac4.mapType && (!acB(ac3 = ac3[s9]) || ac3.length <= 20 ? ac4.mapType = 0 : ((a5N = new Image()).onload = function () {
        gF.aKT.a5M(a5N, 1), a5N.onload = null, a5N = null;
      }, a5N.src = ac3));
    }(b7, ac4, "canvas"), ac5(b7, ac4, "passableWater", 0, 1), ac5(b7, ac4, "passableMountains", 0, 1), ac5(b7, ac4, "playerCount", 1, 512), ac5(b7, ac4, "humanCount", 1, 1), ac5(b7, ac4, "selectedPlayer", 0, 0), ac5(b7, ac4, "gameMode", 0, 1), ac5(b7, ac4, "playerMode", 0, 0), ac5(b7, ac4, "battleRoyaleMode", 0, 0), ac5(b7, ac4, "numberTeams", 0, 8), ac5(b7, ac4, "isZombieMode", 0, 0), ac5(b7, ac4, "isContest", 0, 0), ac5(b7, ac4, "isReplay", 0, 0), ac8(b7, ac4, "elo", 16, 2, 16383), ac5(b7, ac4, "colorsType", 0, 1), ac5(b7, ac4, "colorsPersonalized", 0, 1), ac8(b7, ac4, "colorsData", 32, 512, 262143), ac5(b7, ac4, "selectableColor", 0, 1), ac8(b7, ac4, "teamPlayerCount", 16, 9, 512), ac5(b7, ac4, "neutralBots", 0, 1), ac5(b7, ac4, "botDifficultyType", 0, 3), ac5(b7, ac4, "botDifficultyValue", 0, 15), ac8(b7, ac4, "botDifficultyTeam", 8, 9, 15), ac8(b7, ac4, "botDifficultyData", 8, 512, 15), ac5(b7, ac4, "spawningType", 0, 2), ac5(b7, ac4, "spawningSeed", 0, 16383), ac8(b7, ac4, "spawningData", 16, 1024, 4095), ac5(b7, ac4, "selectableSpawn", 0, 1), ac5(b7, ac4, "playerNamesType", 0, 2), function (ac3, ac4, s9, size, max) {
      var xV = ac3[s9];
      if (Array.isArray(xV)) {
        for (var xW = new Array(size), aM = Math.min(xV.length, size), aN = 0; aN < aM; aN++) xW[aN] = acB(xV[aN]) ? xV[aN].slice(0, max) : "";
        xW.fill("", aM), ac4[s9] = xW;
      }
    }(b7, ac4, "playerNamesData", 512, 20), ac5(b7, ac4, "selectableName", 0, 1), ac5(b7, ac4, "aIncomeType", 0, 2), ac5(b7, ac4, "aIncomeValue", 0, 255), ac8(b7, ac4, "aIncomeData", 8, 512, 255), ac5(b7, ac4, "tIncomeType", 0, 2), ac5(b7, ac4, "tIncomeValue", 0, 255), ac8(b7, ac4, "tIncomeData", 8, 512, 255), ac5(b7, ac4, "iIncomeType", 0, 2), ac5(b7, ac4, "iIncomeValue", 0, 255), ac8(b7, ac4, "iIncomeData", 8, 512, 255), ac5(b7, ac4, "sResourcesType", 0, 2), ac5(b7, ac4, "sResourcesValue", 0, 2047), ac8(b7, ac4, "sResourcesData", 16, 512, 2047), aq.mU(), aq.b1.fk[0] = 0, aq.fu(19));
  }
  function ac5(ac3, ac4, s9, min, max) {
    ac3 = ac3[s9];
    ac4[s9] = "number" == typeof ac3 && min <= ac3 && ac3 <= max ? Math.floor(ac3) : ac4[s9];
  }
  function acB(bS) {
    return "string" == typeof bS;
  }
  function ac8(ac3, ac4, s9, acC, size, max) {
    var xV = ac3[s9];
    if (Array.isArray(xV)) {
      for (var xW = new (8 === acC ? Uint8Array : 16 === acC ? Uint16Array : Uint32Array)(size), aM = Math.min(xV.length, size), aN = 0; aN < aM; aN++) xW[aN] = he.hf(xV[aN], 0, max);
      ac4[s9] = xW;
    }
  }
  this.a0h = function () {
    var input = document.createElement("input");
    input.type = "file", input.setAttribute("accept", ".json"), input.onchange = abu, input.click();
  }, this.a0i = function () {
    for (var abx, aOE, a9P = ct.data, keys = Object.keys(a9P), abv = {}, aN = 0; aN < keys.length; aN++) {
      var key = keys[aN];
      a9P[key] instanceof Uint8Array || a9P[key] instanceof Uint16Array || a9P[key] instanceof Uint32Array ? abv[key] = Array.from(a9P[key]) : abv[key] = a9P[key];
    }
    abv.canvas = 2 === abv.mapType && abv.canvas ? abv.canvas.toDataURL() : null, abx = abv, abx = JSON.stringify(abx, null, 2), abx = new Blob([abx], {
      type: "application/json"
    }), (aOE = document.createElement("a")).href = URL.createObjectURL(abx), aOE.download = "tt_scenario.json", aOE.click();
  };
}
function acD() {
  this.rj = new Array(ct.cv), this.dI = new Array(ct.cv), this.eL = new Uint8Array(ct.cv), this.eF = new Uint8Array(ct.cv), this.dM = new Uint16Array(ct.cv), this.dN = new Uint16Array(ct.cv), this.dS = new Uint16Array(ct.cv), this.dT = new Uint16Array(ct.cv), this.d4 = new Uint32Array(ct.cv), this.a7x = new Uint32Array(ct.cv), this.dL = new Uint32Array(ct.cv), this.lD = null, this.aGp = null, this.kn = null, this.aJk = null, this.oe = new Uint16Array(ct.cv), this.a5k = new Uint16Array(ct.cv), this.a5l = new Uint16Array(ct.cv), this.a5i = new Uint16Array(ct.cv), this.a5m = new Uint8Array(ct.cv), this.eX = new Uint16Array(ct.cv), this.r = function () {
    this.rj.fill(""), this.dI.fill(""), this.eL.fill(0), this.eF.fill(0), this.dM.fill(0), this.dN.fill(0), this.dS.fill(0), this.dT.fill(0), this.d4.fill(0), this.a7x.fill(0), this.dL.fill(0), this.lD = new Array(ct.cv), this.aGp = new Array(ct.cv), this.kn = new Array(ct.cv), this.aJk = new Array(ct.cv), this.oe.fill(0), this.a5k.fill(0), this.a5l.fill(0), this.a5i.fill(0), this.a5m.fill(0), this.eX.fill(0);
  };
}
function aGL(dx) {
  c8 && !dx || (aNa(), he = new a6h(), zK = new zU(), aR = new a(), bG = new aF9(), ct = new ul(), ad = new aTj(), bs = new a3i(), aZ = new tC(), tV = new aJ3(), gy = new aEU(), gu = new aF4(), hI = new aW0(), vH = new aRc(), vI = new acG(), acE = new acH(), eu = new aYV(), my = new zg(), fA = new aaD(), tA = new aBB(), h7 = new a8j(), hK = new tf(), hB = new a3M(), qA = new aDL(), uF = new aVE(), h6 = new lF(), h2 = new aAC(), gG = new qF(), hJ = new aIN(), u7 = new yo(), mF = new abQ(), jE = new u6(), dQ = new vZ(), d5 = new aKf(), a7y = new acI(), eI = new a7u(), gv = new ju(), pC = new aIi(), lA = new aHN(), gw = new a3m(), n8 = new aPI(), di = new cL(), d3 = new acD(), v8 = new a2h(), h3 = new aPi(), da = new abr(), vD = new aTx(), aEE = new aTA(), q9 = new pw(), aF = new aNO(), iW = new a6Y(), gz = new kE(), vF = new a9v(), aI6 = new aar(), hL = new aYS(), d9 = new aQs(), hC = new mX(), hO = new aUm(), gt = new aaw(), aan = new acJ(), aEz = new aN3(), gx = new aZS(), hA = new aCf(), a7Z = new a7V(), hN = new a5o(), h8 = new ab9(), gD = new aRW(), gF = new aWf(), hM = new aUv(), bc = new a75(), br = new a1Q(), ft = new abN(), aRB = new aR8(), a5t = new aHj(), dr = new hZ(), h0 = new acK(), k3 = new aYE(), h5 = new ly(), p9 = new aEu(), nH = new a2W(), fU = new aE9(), aIC = new aQU(), aq = new vy(), hG = new aM5(), cA = new aMr(), c8 = new aWZ(), be = new aRG(), b6 = new aEe(), ey = new r4(), hE = new a7A(), aA4 = new acL(), gJ = new aJW(), h4 = new aOG(), aR3 = new aXi(), hD = new aQJ(), vK = new aZW(), dy = new aEO(), nT = new aY7(), lS = new o1(), a71 = new m3(), ov = new acM(), a0g = new abt(), aI = new na(), nr = new a0v(), v4 = new acN(), aQZ = new aOw(), kl = new acO(), mT = new wX(), c8.r(), cA.r(), d9.mj(), b6.r(), ad.r(), ad.aTq(), (aFx = new aFs()).r(), aR.r(), h4.r(), aF.r(), bs.r(), aZ.r(), fU.r(), aq.r(), uE = new aWW(), d9.r(), dy.r(), lS.r(), aR3.r(), uD = new aO7(), iW.r(), gw.oH(), hG.r(), vD.r(), jE.r(), uF.r(), v8.r(), a5t.r(), dQ.r(), dy.gK = !0, setTimeout(function () {
    fU.bd(2, 14071);
  }, 0), aq.fu(5, 5), aRB.jg() || cA.hg.a9t(), d9.aR1(), c8.a6z = 1);
}
function acM() {
  this.ow = new qC();
}
function aRH() {
  var acQ = vY(),
    acR = aWv(),
    acS = abI();
  this.bg = function () {
    return 123;
  }, this.bj = function () {
    aZ.aa.pR(b6.buffer.data[183].value, 15), bc.bh(14, acQ), bc.bh(7, acR), bc.bh(12, acS);
  };
}
function a2X() {
  function acT() {
    if (2 === ct.dX) return 1;
    hC.nL(), ct.dX = 2, ct.qT = ct.qm;
  }
  function acU() {
    nH.a2d.z(), hJ.show(1 === ct.ux, !1, 2 === ct.ux), nH.result.z(), nH.a2f.f1(), nH.a2b.f1(), nH.a2b.aSc(), fA.aal(!0), fA.fB(247), fA.fB(956), fA.fB(957), h2.dY(!0), gG.dY(!0), hC.dY(), hM.aV4(), ct.mH && dy.aEP.acV(), dy.gK = !0, gJ.zq(), cA.hg.setState(0);
  }
  this.nJ = function () {
    acT() || (ct.uw = 2, acU());
  }, this.nK = function () {
    acT() || (ct.uw = 1, acU());
  };
}
function vx() {
  this.mg = !1;
  this.ep = [], this.eo = 100;
  var e3,
    e6,
    gap,
    el,
    acW,
    acY,
    acZ = 0,
    aca = new Array(9),
    acb = [],
    acc = [],
    acd = 0,
    ace = 0,
    acf = 0,
    acg = 0;
  function acl() {
    aca.sort(function (aQ, ex) {
      return ex.th - aQ.th;
    });
    for (var bS = "" + aca[0].ek, aN = 1; aN < 9; aN++) bS += "," + aca[aN].ek;
    for (aN = 0; aN < 9; aN++) bS += "," + aca[aN].th;
    b6.buffer.a9p(120, bS);
  }
  this.r = function () {
    for (var ach = [0, 1, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 6], aN = 0; aN < ach.length; aN++) {
      var color = 6 === ach[aN] ? bG.aFM : bG.a90;
      this.ep.push(aR.canvas.mk(dQ.get(3), ach[aN], color));
    }
    for (aN = 0; aN < da.db.eq; aN++) acc.push(da.db.aUF - da.db.eq + aN);
    for (aN = 0; aN < da.db.aUE; aN++) acc.push(da.db.aPp + aN);
    var zc = da.db.aUJ(zK.zc);
    for (__fx.quickEmojis = __fx.quickEmojis || {}, __fx.quickEmojis.realFlagCodes = zc.slice(), aN = 0; aN < zc.length; aN++) acc.push(zc[aN]);
    !function () {
      if (__fx.settings.customQuickEmojisEnabled && __fx.settings.customQuickEmojis && 9 === __fx.settings.customQuickEmojis.length) for (var q = 0; q < 9; q++) {
        var qcode = parseInt(__fx.settings.customQuickEmojis[q], 10);
        aca[q] = {
          ek: isNaN(qcode) ? 1015 + q : qcode,
          th: 0
        };
      } else {
        var aN,
          a6 = b6.buffer.data[120].value.split(",");
        if (18 !== a6.length) for (aN = 0; aN < 9; aN++) aca[aN] = {
          ek: 1015 + aN,
          th: 0
        };else for (aN = 0; aN < 9; aN++) {
          var aY = parseInt(a6[aN]),
            bW = (aY = 0 <= aY && aY < da.db.aUF ? aY : 0, parseInt(a6[aN + 9]));
          bW = 0 <= bW && bW < 1e3 ? bW : 0, aca[aN] = {
            ek: aY,
            th: bW
          };
        }
      }
    }();
  }, this.show = function (dk, dl, aLx) {
    var aN;
    if (acd = dk, ace = dl, acZ = aLx || 0, this.mg = !0, acb = [], 0 === acZ) for (aN = 0; aN < 9; aN++) acb.push(aca[aN].ek);else {
      var ex = 49 * acZ,
        aLx = ex - 49;
      for (aLx >= acc.length && (acZ = 1, aLx = 0, ex = 49), aN = aLx = (ex = Math.min(ex, acc.length)) - 49; aN < ex; aN++) acb.push(acc[aN]);
    }
    acb.push(1024);
    aLx = acb.length, el = Math.floor((cA.hg.hh() ? .075 : .0468) * d9.dC), gap = Math.floor(el / 3), (acf = 10 * (acW = el + gap)) > d9.aO && (acf = d9.aO, gap = (acW = acf / 10) - (el = 3 * acW / 4)), acY = he.iA(aLx, 10) + !!(aLx % 10), (acg = acY * acW) > d9.dA && (acg = d9.dA, gap = (acW = acg / acY) - (el = 3 * acW / 4)), aLx = .5 * gap;
    e3 = Math.min(Math.max(dk - .5 * acf + aLx, aLx), d9.aO - acf + aLx), e6 = Math.min(Math.max(dl - .5 * acg + aLx, aLx), d9.dA - acg + aLx);
  }, this.mv = function (dk, dl, player) {
    if (!this.mg) return !1;
    if (this.aB2(dk, dl)) {
      dk = he.hf(he.iA(dk - e3 + .5 * gap, acW), 0, 9);
      if ((dk += 10 * he.hf(he.iA(dl - e6 + .5 * gap, acW), 0, 9)) >= acb.length) return eu.bU(), !0;
      dl = acb[dk];
      if (1024 === dl) return this.show(acd, ace, acZ + 1), !0;
      !function (ek) {
        if (!__fx.settings.customQuickEmojisEnabled) {
          for (var aN = 0; aN < 9; aN++) aca[aN].th = Math.floor(.99 * aca[aN].th);
          for (aN = 0; aN < 9; aN++) if (ek === aca[aN].ek) return aca[aN].th = Math.min(aca[aN].th + 30, 999), acl();
          aca.splice(5, 0, {
            ek: ek,
            th: Math.max(aca[4].th, 30)
          }), aca.pop(), acl();
        }
      }(dl), player === ct.eG ? gD.n1.aKe(dl) : gD.f.aWm(dl, player);
    }
    return eu.bU(), !0;
  }, this.aB2 = function (dk, dl) {
    return !(dk < e3 - .5 * gap || dl < e6 - .5 * gap || e3 + acf - .5 * gap <= dk || e6 + acg - .5 * gap <= dl);
  }, this.dd = function () {
    dE.fillStyle = bG.iq, dE.fillRect(e3 - .5 * gap, e6 - .5 * gap, acf, acg);
    for (var dZ = .5 * lS.o2, aM = (dE.lineWidth = lS.o2, dE.strokeStyle = dE.fillStyle = bG.bH, dE.strokeRect(e3 - .5 * gap + dZ, e6 - .5 * gap + dZ, acf - 2 * dZ, acg - 2 * dZ), dE.imageSmoothingEnabled = !0, acb.length), aN = 0; aN < aM; aN++) this.aYg(acb[aN], dE, e3 + aN % 10 * acW, e6 + he.iA(aN, 10) * acW, el);
    dE.imageSmoothingEnabled = !1;
  }, this.aYg = function (ek, e2, eT, eU, el) {
    var fK;
    ek >= 1024 - da.db.eq ? (fK = el / this.eo, e2.setTransform(fK, 0, 0, fK, eT, eU), e2.drawImage(this.ep[ek - 1024 + da.db.eq], 0, 0), e2.setTransform(1, 0, 0, 1, 0, 0)) : (aR.b.textAlign(e2, 1), aR.b.textBaseline(e2, 1), e2.font = aR.b.dF(0, .89 * el), e2.fillText(da.db.er(ek), eT + .5 * el, eU + (.35 - aR.b.eW + .56) * el));
  };
}
function acH() {
  var acn, aco, acp;
  acn = [32, 65, 191, 913, 931], aco = [64, 127, 688, 930, 1155], acp = new Array(acn.length + 1);
  for (var aN = 0; aN < acp.length; aN++) {
    acp[aN] = 0;
    for (var aQ = aN - 1; 0 <= aQ; aQ--) acp[aN] += aco[aQ] - acn[aQ];
  }
  function acw(bW) {
    for (var aN = acn.length - 1; 0 <= aN; aN--) if (bW >= acn[aN] && bW < aco[aN]) return aN;
    return -1;
  }
  this.acr = function (bS) {
    return 0 !== (bS = bS.trim()).indexOf("Bot ") && 0 !== bS.indexOf("[Bot] ") && function (bS, act, acu) {
      var aM = (bS = bS.trim()).length;
      if (aM < act || acu < aM) return !1;
      for (var bW, acv = 0, aN = 0; aN < aM; aN++) if (bW = bS.charCodeAt(aN), acv += 65 <= bW && bW <= 90 || 1040 <= bW && bW <= 1071 ? 1 : 0, -1 === acw(bW)) return !1;
      if (3 < acv && acv > Math.floor(aM / 2)) return !1;
      return !0;
    }(bS, 3, 20);
  }, this.bj = function (bS) {
    for (var aM = (bS = bS.trim()).length, a6 = [], aN = 0; aN < aM; aN++) {
      var bW,
        d1 = acw(bW = bS.charCodeAt(aN));
      a6.push(acp[d1] + bW - acn[d1]);
    }
    return a6;
  }, this.jS = function (a6) {
    for (var bW, ex, bS = "", aM = a6.length, aN = 0; aN < aM; aN++) for (ex = 1; ex < acp.length; ex++) if (a6[aN] < acp[ex]) {
      bW = acn[ex - 1] + a6[aN] - acp[ex - 1], bS += String.fromCharCode(bW);
      break;
    }
    return bS;
  }, this.acx = function (bS) {
    for (var a6 = this.bj(bS), result = "", aN = 0; aN < a6.length; aN++) result = (result += a6[aN] < 10 ? "00" : a6[aN] < 100 ? "0" : "") + a6[aN].toString(10);
    return result;
  }, this.acy = function (bS) {
    for (var a6 = new Array(Math.floor(bS.length / 3)), aN = 0; aN < bS.length; aN += 3) a6[Math.floor(aN / 3)] = parseInt(bS.substring(aN, aN + 3));
    return this.jS(a6);
  }, this.acz = function (bS) {
    for (var aY, a6 = [bS.length], aN = 0; aN < bS.length; aN++) a6[aN] = bS.charCodeAt(aN) - 48;
    var result = "";
    for (aN = 0; aN < bS.length; aN++) aN === bS.length - 1 || 51 < 10 * a6[aN] + a6[aN + 1] ? result += a6[aN].toString() : (aY = 10 * a6[aN] + a6[aN + 1], result += String.fromCharCode(aY + (aY < 26 ? 65 : 71)), aN++);
    return result;
  }, this.ad0 = function (bS) {
    for (var bW, result = "", aN = 0; aN < bS.length; aN++) 48 <= (bW = bS.charCodeAt(aN)) && bW < 58 ? result += String.fromCharCode(bW) : 65 <= bW && bW < 75 ? result += "0" + (bW - 65).toString() : 75 <= bW && bW < 91 ? result += (bW - 65).toString() : 97 <= bW && bW < 123 && (result += (bW - 71).toString());
    return result;
  }, this.ad1 = function (bS) {
    for (var aM = bS.length, a6 = [], aN = 0; aN < aM; aN++) (bW = bS.charCodeAt(aN)) < 58 ? a6.push(bS[aN]) : (bW -= bW < 91 ? 65 : 71, a6.push(String(he.iA(bW, 10))), a6.push(String(bW - 10 * he.iA(bW, 10))));
    var aM = a6.length - 2,
      bW = 0,
      a1Z = [];
    for (aN = 0; aN < aM; aN += 3) a1Z[bW++] = parseInt(a6[aN] + a6[aN + 1] + a6[aN + 2]);
    return a1Z;
  }, this.ad2 = function () {
    for (var uW, ad3 = "", aN = 0; aN < 6; aN++) uW = 48 + iW.random() % 36, uW += 58 <= uW ? 39 : 0, ad3 += String.fromCharCode(uW);
    return ad3;
  };
}
function fw(id, lo, ad4) {
  var am, aBh;
  function ad7() {
    aBh.zf.innerHTML += "<br>" + L(547);
  }
  function ad8() {
    var ex = 1;
    aq.fu(4, 1, new mC(L(548), L(549), !1, [new ap("🔄 Reload", function () {
      ex && (setTimeout(function () {
        aq.fu(1);
      }, 5e3), cA.hg.mP()), ex = 0;
    }, bG.mQ)]));
  }
  function ad6() {
    bc.bd(90), bc.bh(30, Math.floor(he.pow(30) * Math.random())), bc.bh(30, Math.floor(he.pow(30) * Math.random())), bc.bh(30, Math.floor(he.pow(30) * Math.random())), ft.r(bc.bk), b6.bJ.bK(110, bs.aa.fx(bs.aa.fy(15))), aF.bO.aMV();
  }
  this.ad5 = !0, this.aT4 = id, this.show = function () {
    am.show(), this.resize(), 15 === id ? (aF.b1.aG9(id) ? ad6 : ad7)() : 16 === id ? aF.b1.aG9(id) ? aF.lk.bw(2) : ad7() : 17 === id ? aF.b1.aG9(id) ? aF.lk.bw(3) : ad7() : 18 === id ? (aF.b1.close(0, 3253), aF.b1.aG7(0, id, 0), ad7()) : 21 === id ? aF.b1.aG9(id) ? aF.aNS.pJ(lo.pK, lo.pL, lo.pM) : ad7() : 22 === id ? aF.b1.aG9(id) ? aF.aNS.pN(lo.pK, lo.pO, lo.pP) : ad7() : 23 === id ? aF.b1.aG9(id) ? aF.aNS.pS(lo.pT, lo.pU) : ad7() : 24 === id ? aF.b1.aG9(id) ? aF.aNS.pW(lo.pT, lo.pL, lo.pM) : ad7() : 25 === id ? aF.b1.aG9(id) ? aF.bO.aMZ(lo) : ad7() : 28 === id ? aF.b1.aG9(id) ? aF.aNS.pQ(lo.pK, lo.pO, lo.pP) : ad7() : 29 === id ? aF.b1.aG9(id) ? aF.bO.a79(lo) : ad7() : 30 === id && (aF.b1.aG9(id) ? ad.a2E() || ad8() : ad7());
  }, this.a2F = function () {
    15 === id ? ad6() : 16 === id ? aF.lk.bw(2) : 17 === id ? aF.lk.bw(3) : 18 === id ? aq.fu(8, this.mB, new fw(16)) : 21 === id ? aF.aNS.pJ(lo.pK, lo.pL, lo.pM) : 22 === id ? aF.aNS.pN(lo.pK, lo.pO, lo.pP) : 23 === id ? aF.aNS.pS(lo.pT, lo.pU) : 24 === id ? aF.aNS.pW(lo.pT, lo.pL, lo.pM) : 25 === id ? aF.bO.aMZ(lo) : 28 === id ? aF.aNS.pQ(lo.pK, lo.pO, lo.pP) : 29 === id ? aF.bO.a79(lo) : 30 === id ? ad.a2E() || ad8() : 1e3 === id && (this.aT4 = id = 25, aF.bO.aMZ(lo));
  }, this.a2G = function (code, dx, data) {
    !dx && code !== id || (15 === code || 16 === code ? aq.fu(7, this.mB) : 17 === code ? (aF.b1.close(0, 3252), b6.b1.j7(0), b6.buffer.data[117].fY && 0 < b6.buffer.data[117].fY.length ? (dx = b6.b1.j8(0), b6.bJ.bK(105, dx.ah), b6.bJ.bK(106, dx.password), aq.fu(8, this.mB, new fw(16))) : (b6.bJ.bK(105, ""), aq.b1.zC())) : 21 === code ? aq.fu(10, this.mB, new zx(data)) : 23 === code ? aq.fu(13, this.mB, new rp({
      data: data,
      pT: lo.pT
    })) : 25 === code ? (aq.b1.wD.ah = lo.ah, b6.aEh.hQ(lo.ah), aq.fu(15, this.mB)) : 30 === code && (data ? aq.fu(1) : ad8()));
  }, this.bU = function () {
    am.bU();
  }, this.resize = function () {
    am.resize(), aBh.resize();
  }, this.bV = function (bW) {
    2 === bW && am.bX[0].bY();
  }, am = new ao(L(545), [new ap("⬅️ " + L(1), function () {
    ad4 ? aq.fu(29) : aq.b1.zC();
  })]), aBh = new zd(am.au, L(546));
}
function g() {
  this.nW = function (mE) {
    return 0 === mE ? 1 === ct.dX && ct.dO : 1 === mE ? 1 === ct.dX && !ct.dO : 2 === ct.dX;
  }, this.kk = function (player) {
    return 0 !== d3.eF[player] && 2 !== d3.eL[player];
  }, this.qD = function (player) {
    return player === ct.eG && 2 !== d3.eL[player];
  }, this.a4i = function (player, l5) {
    return player !== l5 && (0 === ey.iy[player] || ey.iy[player] !== ey.iy[l5]);
  }, this.aIz = function () {
    return eI.eJ < 2 ? 0 : ct.il ? 1 < hE.a7K() : d3.d4[iw[1]];
  }, this.nE = function () {
    var eJ = eI.eJ;
    if (0 !== eJ) {
      if (!ct.il) return !this.eH(iw[0]);
      for (var iy = ey.iy, a57 = hE.iu(), eK = eI.eK, aN = eJ - 1; 0 <= aN; aN--) {
        var d1 = eK[aN];
        if (iy[d1] === a57 && !this.eH(d1)) return 1;
      }
    }
    return 0;
  }, this.aHd = function (player) {
    return player === ct.eG;
  }, this.ko = function (l5, fM) {
    return d3.dL[ct.eG] < fM * d3.dL[l5];
  }, this.eH = function (player) {
    return player >= ct.dP || 2 === d3.eL[player];
  }, this.ij = function (player) {
    return 0 !== d3.eF[player];
  }, this.abM = function (player) {
    return player < ct.dP;
  }, this.oZ = function (ad9, adA) {
    return ad9 !== adA;
  }, this.l7 = function (player, aY) {
    var min;
    return aY = this.adB(player, aY), d3.dL[player] += aY, d3.eX[player] && (min = Math.min(d3.eX[player], d3.dL[player]), d3.eX[player] -= min, d3.dL[player] -= min), aY;
  }, this.adB = function (player, aY) {
    var lL = d3.dL[player];
    return aY = Math.min(aY, d3.d4[player] * ct.uq - lL), aY = Math.min(aY, ct.dH - lL), Math.max(aY, 0);
  }, this.oa = function (player, i9, adC, adD) {
    var lL = d3.dL[player],
      i9 = he.iA(lL * (i9 + 1), 1024),
      adC = he.iA(adC * lL, 1024),
      i9 = Math.min(i9, lL - adC);
    return i9 = gx.aZU(player, i9), k3.k4[0] = i9, k3.k4[1] = adC, adD <= i9;
  }, this.k0 = function (player, ok, jy) {
    var player = d3.dL[player],
      adE = he.iA(64 * player, 1024);
    return ok = Math.min(ok, player - adE), ok = this.adB(jy, ok), k3.k4[0] = ok, k3.k4[1] = adE, 1 <= ok;
  }, this.adF = function (player, ok, jy) {
    var player = d3.dL[player],
      adE = he.iA(64 * player, 1024);
    return ok = Math.min(ok, player - adE), this.adB(jy, ok);
  }, this.a6g = function (ok, jy) {
    return ok = this.adB(jy, ok), k3.k4[0] = ok, k3.k4[1] = 0, 1 <= ok;
  }, this.i8 = function (player, adG) {
    return he.iA(d3.dL[player] * (adG + 1), 1024);
  }, this.adH = function (player, adC) {
    adC = he.iA(adC * d3.dL[player], 1024);
    k3.k4[1] = adC, d3.dL[player] -= adC;
  }, this.aK8 = function (player, adI) {
    var oN,
      oP,
      ex = d3.dL[player];
    return adI <= ex ? d3.dL[player] -= adI : (d3.dL[player] = 0, oP = d3.eX[player] + (oN = 5 * ((ex = adI - ex) >> 2)), hD.l6(player, oN - ex, 12), oP <= ct.un ? d3.eX[player] = oP : (d3.eX[player] = ct.un, hD.l6(player, oP - ct.un, 18))), adI;
  }, this.pF = function (player, i9) {
    var dL = d3.dL,
      lL = dL[player],
      i9 = he.iA(lL * (i9 + 1), 1024),
      adE = Math.max(he.iA(lL, 10), 1e3);
    return (i9 = Math.min(i9, lL - adE)) < 0 ? (dL[player] = 0, adE = Math.min(1e3, lL + ct.un - d3.eX[player]), k3.k4[1] = adE, d3.eX[player] += adE - lL, 0) : (k3.k4[1] = adE, i9 = gx.aZU(player, i9), dL[player] -= adE + i9, gx.aZV(player, i9), i9);
  }, this.oh = function (player) {
    var ki = k3.k4[0];
    d3.dL[player] -= ki + k3.k4[1], gx.aZV(player, ki);
  }, this.ob = function (player, l5) {
    return (l5 = Math.min(l5, ct.cv)) < ct.cv && 0 === d3.eF[l5] && (l5 = ct.cv), (k3.od[0] = l5) === ct.cv || kl.km(player, l5);
  }, this.jz = function (player, jy) {
    return 0 !== d3.eF[jy] && !kl.km(player, jy);
  }, this.nX = function (player, adJ) {
    for (var d1, aM = eI.eJ, aAu = 0, adK = iw, aN = 0; aN < aM; aN++) if (d1 = adK[aN], !this.eH(d1)) {
      if (player === d1) return !0;
      if (++aAu > adJ) return !1;
    }
    return !1;
  }, this.ih = function (d1) {
    var nF = ct.il ? hE.nG() : d3.d4[iw[0]];
    return nF >= he.iA(d1 * ct.kB, 100);
  }, this.a3F = function (aY, min, max) {
    return Math.floor(he.hf(isNaN(aY) ? 0 : Number(aY), min, max));
  };
}
function acO() {
  this.aJu = function () {
    for (var eT, eU, aN = aJt - 1; 0 <= aN; aN--) eT = he.iA(aKA[aN], 4) % fU.fV, eU = he.iA(aKA[aN], 4 * fU.fV), d3.dM[aJq] = Math.min(eT, d3.dM[aJq]), d3.dN[aJq] = Math.min(eU, d3.dN[aJq]), d3.dS[aJq] = Math.max(eT, d3.dS[aJq]), d3.dT[aJq] = Math.max(eU, d3.dT[aJq]);
  }, this.aOn = function () {
    var fS,
      d1,
      aN,
      aM = d3.lD[aJq].length,
      aCW = d5.aCW;
    loop: for (aN = aM - 1; 0 <= aN; aN--) {
      for (fS = 3; 0 <= fS; fS--) if (d1 = d3.lD[aJq][aN] + aCW[fS], d5.ho(d1) || d5.l3(d1) && d5.hp(d1) !== aJq) {
        d5.a6F(d3.lD[aJq][aN], aJq);
        continue loop;
      }
      d3.lD[aJq][aN] = d3.lD[aJq][aM - 1], d3.lD[aJq].pop(), aM--;
    }
  }, this.aOo = function () {
    var player = aJq,
      aGp = d3.aGp,
      kn = d3.kn,
      aJk = d3.aJk,
      aM = aGp[player].length,
      aCW = d5.aCW;
    loop: for (var aN = aM - 1; 0 <= aN; aN--) {
      for (var adL = !1, adM = !1, fS = 3; 0 <= fS; fS--) {
        var d1 = aGp[player][aN] + aCW[fS];
        if (d5.aL8(d1, player)) continue loop;
        adL = adL || d5.hl(d1), adM = adM || d5.aL4(d1);
      }
      adL ? kn[player].push(aGp[player][aN]) : adM ? aJk[player].push(aGp[player][aN]) : d5.a6I(aGp[player][aN], player), aGp[player][aN] = aGp[player][aM - 1], aGp[player].pop(), aM--;
    }
  }, this.aJi = function () {
    d3.d4[aJf] -= aJt;
  }, this.aJj = function (border) {
    for (var aM = border.length, aN = aM - 1; 0 <= aN; aN--) d5.fT(aJf, border[aN]) || (border[aN] = border[aM - 1], border.pop(), aM--);
  }, this.aJl = function (border) {
    for (var aM = border.length, aN = aM - 1; 0 <= aN; aN--) !d5.fT(aJf, border[aN]) && d5.kr(border[aN]) && (border[aN] = border[aM - 1], border.pop(), aM--);
  }, this.aJm = function (border) {
    for (var fS, d1, aM = border.length, aCW = d5.aCW, aN = aM - 1; 0 <= aN; aN--) for (fS = 3; 0 <= fS; fS--) if (d1 = border[aN] + aCW[fS], d5.aL8(d1, aJf)) {
      d3.aGp[aJf].push(border[aN]), border[aN] = border[aM - 1], border.pop(), aM--;
      break;
    }
  }, this.aJn = function () {
    for (var fS, d1, aCW = d5.aCW, aN = aJt - 1; 0 <= aN; aN--) for (fS = 3; 0 <= fS; fS--) d1 = aKA[aN] + aCW[fS], d5.l4(aJf, d1) && d5.aLC(d1) && (d3.aGp[aJf].push(d1), d5.a6H(d1, aJf));
  }, this.aJo = function () {
    var eT, eU;
    loop: for (; d3.dN[aJf] < d3.dT[aJf];) {
      for (eT = d3.dS[aJf]; eT >= d3.dM[aJf]; eT--) if (d5.fT(aJf, 4 * (d3.dN[aJf] * fU.fV + eT))) break loop;
      d3.dN[aJf]++;
    }
    loop: for (; d3.dN[aJf] < d3.dT[aJf];) {
      for (eT = d3.dS[aJf]; eT >= d3.dM[aJf]; eT--) if (d5.fT(aJf, 4 * (d3.dT[aJf] * fU.fV + eT))) break loop;
      d3.dT[aJf]--;
    }
    loop: for (; d3.dM[aJf] < d3.dS[aJf];) {
      for (eU = d3.dT[aJf]; eU >= d3.dN[aJf]; eU--) if (d5.fT(aJf, 4 * (eU * fU.fV + d3.dM[aJf]))) break loop;
      d3.dM[aJf]++;
    }
    loop: for (; d3.dM[aJf] < d3.dS[aJf];) {
      for (eU = d3.dT[aJf]; eU >= d3.dN[aJf]; eU--) if (d5.fT(aJf, 4 * (eU * fU.fV + d3.dS[aJf]))) break loop;
      d3.dS[aJf]--;
    }
  }, this.km = function (player, l5) {
    return 0 === ey.iy[player] || ey.iy[player] !== ey.iy[l5];
  }, this.aQb = function (player) {
    for (var aN, s9, aM = d3.aGp[player].length, aCW = d5.aCW, fS = 3; 0 <= fS; fS--) for (s9 = aCW[fS], aN = 0; aN < aM; aN++) if (d5.ho(d3.aGp[player][aN] + s9)) return !0;
    return !1;
  }, this.ab0 = function (player) {
    for (var aN, s9, aM = d3.aGp[player].length, aCW = d5.aCW, fS = 3; 0 <= fS; fS--) for (s9 = aCW[fS], aN = 0; aN < aM; aN++) if (d5.a6G(d3.aGp[player][aN]) && d5.ho(d3.aGp[player][aN] + s9)) return !0;
    return !1;
  }, this.aQd = function (ad9, adA) {
    for (var aN, eZ, s9, d1, aLd = d3.aGp[ad9].length, aLe = d3.aGp[adA].length, aCW = (aLe < aLd && (eZ = ad9, ad9 = adA, adA = eZ, eZ = aLd, aLd = aLe, 0), d5.aCW), fS = 3; 0 <= fS; fS--) for (s9 = aCW[fS], aN = 0; aN < aLd; aN++) if (d1 = d3.aGp[ad9][aN] + s9, d5.l3(d1) && d5.hp(d1) === adA) return !0;
    return !1;
  }, this.ab1 = function (ad9, adA) {
    for (var aN, s9, d1, aLd = d3.aGp[ad9].length, aCW = d5.aCW, fS = 3; 0 <= fS; fS--) for (s9 = aCW[fS], aN = 0; aN < aLd; aN++) if (d5.a6G(d3.aGp[ad9][aN]) && (d1 = d3.aGp[ad9][aN] + s9, d5.l3(d1)) && d5.hp(d1) === adA) return !0;
    return !1;
  };
}
function kH() {
  this.f1 = function (player) {
    return h0.os.aVo(player, function (player) {
      var aM = gz.j0.j1;
      if (0 === aM) return -1;
      for (var aW = Math.min(aM, gz.performance.a52 ? aM : 10), buffer = gz.j0.buffer, fO = he.iA(iW.random() * aM, iW.value(100)), b7 = fO + aW, dk = iW.iX(d3.dM[player], d3.dS[player]), dl = iW.iX(d3.dN[player], d3.dT[player]), rc = -1, rW = dr.i7(0, 0, fU.fV, fU.iD), aN = fO; aN < b7; aN++) {
        var s9 = aN % aM,
          adO = dr.hq(dk, dl, buffer[s9]);
        adO < rW && (rW = adO, rc = s9);
      }
      return -1 !== rc ? function (gm, dk, dl) {
        var hr = dr.ht(gm),
          hs = dr.hu(gm),
          df = dk - hr,
          dg = dl - hs;
        Math.abs(df) >= Math.abs(dg) ? (dg = 0, df = Math.sign(df)) : (df = 0, dg = Math.sign(dg));
        df === dg && (df = 1);
        for (;;) {
          if (hr += df, hs += dg, !dr.iH(hr, hs)) break;
          if (gm = dr.iE(hr, hs), d5.hl(dr.iI(gm))) return gm;
        }
        return -1;
      }(buffer[rc], dk, dl) : -1;
    }(player));
  };
}
function acG() {
  this.r = function () {
    if (0 === ct.data.sResourcesType) {
      for (var aLd = ct.dP, dL = d3.dL, aN = 0; aN < aLd; aN++) dL[aN] = 512;
      var aLe = ct.rZ,
        aJB = tV.aJB,
        ki = tV.ki;
      for (aN = aLd; aN < aLe; aN++) dL[aN] = aJB[ki[aN]];
    } else (1 === ct.data.sResourcesType ? function () {
      for (var aM = ct.rZ, dL = d3.dL, sResourcesValue = ct.data.sResourcesValue, aN = 0; aN < aM; aN++) dL[aN] = sResourcesValue;
    } : function () {
      for (var aM = ct.rZ, dL = d3.dL, sResourcesData = ct.data.sResourcesData, aN = 0; aN < aM; aN++) dL[aN] = sResourcesData[aN];
    })();
    hD.a48[8] = d3.dL[ct.eG];
  };
}
function c() {
  var adT = null;
  this.eW = 0, this.s = function () {
    var aY = b6.buffer.data[5].value;
    adT = "px " + aY, "system-ui" !== aY && (adT += ", system-ui"), this.eW = aF0(32, 32, ["a", "b", "m"], 200, adT);
  }, this.xo = function (aO, dA) {
    var bW = document.createElement("canvas");
    return bW.width = aO, bW.height = dA, bW;
  }, this.getContext = function (canvas, alpha) {
    return canvas.getContext("2d", {
      alpha: alpha
    });
  }, this.getImageData = function (j, aO, dA) {
    return j.getImageData(0, 0, aO, dA);
  }, this.dF = function (type, size) {
    return size = size.toFixed(2), 0 === type ? size + adT : 1 === type ? "bold " + size + adT : 2 === type ? "lighter " + size + adT : 3 === type ? "italic " + size + adT : 4 === type ? "oblique " + size + adT : 5 === type ? "small-caps " + size + adT : "small-caps bold " + size + adT;
  }, this.textAlign = function (e2, id) {
    e2.textAlign = 0 === id ? "left" : 1 === id ? "center" : "right";
  }, this.textBaseline = function (e2, id) {
    e2.textBaseline = 1 === id ? "middle" : 2 === id ? "bottom" : "top";
  }, this.g1 = function (b7, code, color) {
    color = this.nz(lS.o3) + " solid " + (color || bG.bH);
    5 === (code = code || 5) ? b7.style.border = color : 4 === code ? b7.style.borderLeft = color : 2 === code ? b7.style.borderBottom = color : 6 === code ? b7.style.borderRight = color : b7.style.borderTop = color;
  }, this.t5 = function (b7, eT, eU, aO, dA) {
    b7 = b7.style;
    b7.left = this.t6(eT), b7.top = this.t6(eU), b7.width = this.t6(aO), b7.height = this.t6(dA);
  }, this.o4 = function (aY) {
    return 1 + aY * cA.hg.hh();
  }, this.tJ = function (fM, s9) {
    return fM * this.o4(void 0 === s9 ? .5 : s9) * d9.dC / d9.o5;
  }, this.sJ = function (fM, s9) {
    return fM * this.o4(void 0 === s9 ? .5 : s9) * d9.dC;
  }, this.g0 = function (fM, s9, adU) {
    return this.o4(s9) * Math.min(fM * d9.dC, adU * d9.aO) / d9.o5;
  }, this.nz = function (aY) {
    return aY.toFixed(1) + "px";
  }, this.t6 = function (aY) {
    return this.aDp(aY).toFixed(1) + "px";
  }, this.aDp = function (aY) {
    return aY / d9.o5;
  }, this.zQ = function (zI) {
    for (var bS = "<ul>", aM = zI.length, aN = 0; aN < aM; aN++) bS += "<li>" + zI[aN][0] + ": <a href='" + zI[aN][1] + "' target='_blank'>" + zI[aN][0] + "</a></li>";
    return bS += "</ul>";
  }, this.aWY = function (aOD) {
    return "<a href='" + aOD + "' target='_blank'>" + aOD + "</a>";
  }, this.aXR = function (b7) {
    navigator.clipboard && navigator.clipboard.writeText(b7.value);
  }, this.bN = function (b7) {
    var eZ = b7.textContent;
    aR.h.aX(eZ, "✔") || (1 === eZ.length ? b7.textContent = "✔" : b7.textContent = eZ + " ✔", setTimeout(function () {
      b7.textContent = eZ;
    }, 500));
  }, this.measureText = function (bS) {
    return dE.measureText(bS).width;
  }, this.sv = function (wW) {
    wW.style.overflowX = "auto", wW.style.overflowY = "hidden", wW.style.whiteSpace = "nowrap", wW.addEventListener("wheel", function (b7) {
      Math.abs(b7.deltaY) < Math.abs(b7.deltaX) || (this.scrollLeft += b7.deltaY, this.t8 = this.scrollLeft, b7.preventDefault());
    }), wW.addEventListener("scroll", function () {
      this.t8 = this.scrollLeft;
    });
  };
}
function acI() {
  function adZ(player) {
    var eZ;
    aR.f.aHd(player) && (eZ = d3.dL[player] - d3.eX[player] + lA.a4W(player), hD.l6(player, Math.abs(eZ), eZ < 0 ? 18 : 12)), d3.dL[player] = 0, d3.eX[player] = 0;
  }
  function ade() {
    hJ.show(!1, !1, !1, !0), gG.qa(), nH.a2f.aGU();
  }
  function adX(player, aHf) {
    for (var aN = aHf.length - 1; 0 <= aN; aN--) lA.aHW(aHf[aN], player);
  }
  function adY(player) {
    var dM = d3.dM,
      dS = d3.dS,
      dN = d3.dN,
      dT = d3.dT,
      fV = fU.fV;
    if (d3.d4[player]) {
      d3.d4[player] = 0;
      for (var e3 = dM[player], e6 = dN[player], eT = dS[player]; e3 <= eT; eT--) for (var eU = dT[player]; e6 <= eU; eU--) {
        var d1 = 4 * (eU * fV + eT);
        d5.fT(player, d1) && d5.aLF(d1);
      }
    }
    dS[player] = dT[player] = 0, dM[player] = dN[player] = Math.max(fV, fU.iD);
  }
  this.jg = function (d1) {
    var player,
      eZ = d3.d4[d1] + d3.a7x[d1];
    h0.b1.a4P[d1] ? eZ && (adX(player = d1, lA.aHe(player)), di.dp(player), adY(player), gy.aEc(player), lA.clear(player), adZ(player), function (player) {
      d3.a7x[player] = 0, d3.lD[player] = [], d3.aGp[player] = [], d3.kn[player] = [], d3.aJk[player] = [];
    }(player)) : !eZ && d3.lD[d1].length || this.aEy(d1);
  }, this.aEy = function (player) {
    !function (player) {
      aR.f.eH(player) || (d3.a5i[player] = be.aLO.a5j(), ct.qT++);
      var aHf = lA.aHe(player);
      0 === aHf.length ? aR.f.qD(player) && ade() : (adX(player, aHf), function (player, aHf) {
        var adh = aHf[function (aHf) {
          var aN,
            af = 0;
          for (aN = aHf.length - 1; 1 <= aN; aN--) d3.d4[aHf[aN]] > d3.d4[aHf[af]] && (af = aN);
          return af;
        }(aHf)];
        9 === ct.cu && (1 === ey.iy[player] ? iW.a6c(8) && h3.aPn(adh) : tV.ki[player] && (fA.ik(765, 0), fA.ip(280, L(550, [d3.dI[adh], d3.dI[player]]), 765, adh, bG.r8, bG.aFp, -1, !0)));
        if (aR.f.qD(player)) ade(), fA.aEv(adh, 1);else {
          for (var aN = aHf.length - 1; 0 <= aN; aN--) if (aR.f.aHd(aHf[aN]) && (hD.a48[4 - aR.f.eH(player)]++, aR.f.qD(aHf[aN]))) return fA.aEv(player, 0);
          aR.f.eH(player) || fA.aab(0, player, adh);
        }
      }(player, aHf));
    }(player), di.dp(player), adY(player), adZ(player), function (player) {
      d3.eF[player] = 0, d3.lD[player] = null, d3.aGp[player] = null, d3.kn[player] = null, d3.aJk[player] = null;
    }(player), gy.aEc(player), lA.clear(player), h0.ke.add(player);
  };
}
function np() {
  var adi = [],
    sq = [],
    adj = [];
  function adl(c3) {
    for (var a0 = c3.a0, adk = [];;) {
      var bW = function adn(a0, position) {
        position = a0.indexOf("@", position);
        if (position < 0) return -1;
        var bS = a0.substring(position + 1, position + 6);
        if (5 !== bS.length) return adn(a0, position + 1);
        if (aR.h.startsWith(bS, "room")) return adn(a0, position + 1);
        var adu = new RegExp("^[a-zA-Z0-9_-]+$");
        if (!adu.test(bS)) return adn(a0, position + 1);
        adu = a0.substring(position + 6, position + 7);
        if (1 !== adu.length) return position;
        bS = new RegExp("^[ :!.]+$");
        if (!bS.test(adu)) return adn(a0, position + 1);
        return position;
      }(a0, 0);
      if (-1 === bW) {
        adk.push(ado(a0, c3));
        break;
      }
      0 === bW ? adk.push(adp(a0.substring(1, 6), c3, bW)) : (adk.push(ado(a0.substring(0, bW), c3)), adk.push(adp(a0.substring(bW + 1, bW + 6), c3, bW))), a0 = a0.substring(bW + 6);
    }
    return adk;
  }
  function adp(bS, c3, bW) {
    var aXk = function (bS) {
        var ah = aZ.aa.ab(bS, 5),
          aXk = aI.aU.aNr(ah);
        if (aXk) {
          for (adi.push(aXk); 75 < adi.length;) adi.shift();
          return aXk;
        }
        for (var a83 = aI.aU.a83, aN = a83.length - 1; 0 <= aN; aN--) if (aXk = a83[aN], ah === aXk.ah) return adi.push(aXk), aXk;
        for (aN = adi.length - 1; 0 <= aN; aN--) if (aXk = adi[aN], ah === aXk.ah) return adi.push(aXk), aXk;
        return aI.aU.aXl(ah, bS, 1, 999999, 999999, 0, 0, 0, 0, 1);
      }(bS),
      bS = (0 === bW && 0 === c3.a8D.id && c3.aOa && (c3.fontSize = aI.nd.aUd(aXk.aNn, aXk.aAu), c3.aUZ = aI.nd.aUe(aXk.aAu)), document.createElement("span"));
    return bS.textContent = function (aXk, c3, bW) {
      if (aXk.ads) return aXk.ads--, bW = 2 === c3.a8D.id || (3 === c3.a8D.id || 4 === c3.a8D.id) && 0 !== bW, aXk.username + (bW ? " (" + aXk.aXr + ")" : "");
      if (c3.a8D.aUl) return "Redacted " + bs.aa.dG(aXk.ah, 2);
      return aXk.username;
    }(aXk, c3, bW), bS.style.display = "inline-block", bS.style.color = aI.nd.aUc(aXk.aNn), 11 === aXk.aNn && (bS.style.textShadow = "-1px -1px 0 lightgray,1px -1px 0 lightgray,-1px 1px 0 lightgray,1px 1px 0 lightgray"), bS.style.cursor = "pointer", bS.style.margin = "0", bS.style.font = "inherit", bS.style.minWidth = bS.style.minHeight = "1em", aI.nd.aUf(aXk) && (bS.style.textDecoration = "underline"), aXk.ls && (bS.style.textDecorationLine = "underline", bS.style.textDecorationStyle = "dotted"), aI.nd.aUe(aXk.aAu) && (bS.style.fontWeight = "bold"), bS.onclick = function (b7) {
      aI.ne.aZ9(b7, aXk);
    }, a5t.a5u() || (bS.onmouseover = function (b7) {
      aI.nf.aNi(b7.target, aXk);
    }), sq.push(bS), bS;
  }
  function ado(a0, c3) {
    var hX = document.createElement("span");
    return hX.textContent = a0, hX.style.color = c3.aUa, hX.style.margin = "0", hX.style.font = "inherit", hX;
  }
  function adx(aXk, aXq, ah) {
    ah !== aXk.ah || aXk.aXr || (aXk.aXr = aXk.username, aXk.username = aXq);
  }
  this.mV = function () {
    for (var aN = 0; aN < sq.length; aN++) sq[aN].onclick = sq[aN].onmouseover = null;
    adj = sq = null;
  }, this.transform = function (c3) {
    for (var nx = document.createElement("div"), adk = adl(c3), aN = 0; aN < adk.length; aN++) nx.appendChild(adk[aN]);
    0 === c3.a8D.id && (nx.vx143 = c3.a8D, adj.push(nx)), nx.style.margin = "0.6em 0.6em", c3.aOa && (nx.style.marginLeft = nx.style.marginRight = "inherit"), nx.style.font = "inherit";
    var adm = 0 < c3.a8D.id;
    return c3.aUZ && (nx.style.fontWeight = "bold"), adm && (nx.style.paddingLeft = "0.7em"), adm && (nx.style.fontStyle = "italic"), nx.style.fontSize = c3.fontSize.toFixed(2) + "em", nx;
  }, this.jq = function (jo) {
    if (jo && (2 === jo.id && 1 === jo.aK || 3 === jo.id && 2 === jo.aK)) {
      var ah = 3 === jo.id ? jo.target : jo.ah;
      if (!aI.aU.aNr(ah)) {
        for (var aXq = "Redacted " + bs.aa.dG(ah, 2), a83 = aI.aU.a83, aN = a83.length - 1; 0 <= aN; aN--) adx(a83[aN], aXq, ah);
        for (aN = adi.length - 1; 0 <= aN; aN--) adx(adi[aN], aXq, ah);
      }
    }
  }, this.aXs = function (ah) {
    for (var ady = adj, adz = "@" + bs.aa.dG(ah, 5), aN = ady.length - 1; 0 <= aN; aN--) {
      var fS = ady[aN];
      if (fS.vx143.ah === ah || 0 <= fS.vx143.a0.indexOf(adz)) {
        for (; fS.firstChild;) aq.removeChild(fS, fS.firstChild);
        for (var adk = adl(aI.nd.a8F(fS.vx143, aI.nd.a8G(fS.vx143))), aQ = 0; aQ < adk.length; aQ++) fS.appendChild(adk[aQ]);
        ady.splice(aN, 1);
      }
    }
  }, this.a8E = function (ah) {
    for (var ady = adj, aN = ady.length - 1; 0 <= aN; aN--) {
      var fS = ady[aN];
      if (fS.vx143.ah === ah) {
        for (; fS.firstChild;) aq.removeChild(fS, fS.firstChild);
        fS.vx143.a0 = "[Redacted Message]";
        for (var adk = adl(aI.nd.a8F(fS.vx143, aI.nd.a8G(fS.vx143))), aQ = 0; aQ < adk.length; aQ++) fS.appendChild(adk[aQ]);
        ady.splice(aN, 1);
      }
    }
  };
}
function kO() {
  function ae6(player, l5, ae0) {
    3 <= ae0 && 2142 < dy.f2() && (l5 === ct.cv || d3.dL[l5] < he.iA(d3.dL[player], 20)) && tV.aJK(player, 20);
  }
  function ae7(player, ki, l5, ae0) {
    3 <= ae0 && ae0 < 6 && he.iA(d3.dL[player], 8) > d3.dL[l5] && (ki = Math.max(he.iA(11 * d3.dL[l5], 5), he.iA(d3.dL[player], 10)));
    ae0 = d3.lD[player].length;
    gz.kL.aGl(player, l5), gz.kL.aGn(player, l5, ae0, ki);
  }
  function ae5(player, ki) {
    var l5 = ct.cv,
      aM = d3.lD[player].length;
    gz.kL.aGk(player), d3.lD[player].length !== aM && gz.kL.aGn(player, l5, aM, ki);
  }
  this.a6f = new Uint8Array(ct.cv), this.r = function () {
    this.a6f.fill(0);
  }, this.aJN = function (player, ki) {
    var a3r, ae0, ae1, ae2;
    lA.lC(player) && (a3r = gw.k9(player), 3 <= (ae0 = tV.ki[player]) && ae0 < 6 && (ki = Math.max(d3.dL[player] - a3r, ki)), ae1 = d3.kn[player].length, ae2 = d3.aGp[player].length, 30 * d3.d4[player] > ct.kB && eQ[player] < 10 && 100 * ae2 <= ae1 && tV.aJK(player, 10), ct.il ? function (player, ki, ae0, a3r) {
      var l5;
      if (gz.kL.aGq(player, !1) || gz.kL.aGt(player, !1)) {
        if (!gz.kL.aGv(player)) if (gz.kL.aGu()) ae5(player, ki), ae6(player, ct.cv, ae0);else {
          if (iW.a6c(tV.aJA[ae0])) l5 = gz.kL.aGy(player);else {
            if (gz.kL.aGw() && iW.a6c(tV.aJ9[ae0]) && gz.kL.aGx(), 6 === ae0) return ae7(player, ki, gz.kL.aHB(), ae0);
            l5 = gz.kL.aH2(player);
          }
          ae7(player, ki, l5, ae0), ae6(player, l5, ae0);
        }
      } else h0.aF5.f1(player) || gz.kP.f1(player) || !function (player, ki, ae0, a3r) {
        var a6f = gz.kN.a6f;
        a6f[player] = 0;
        var ae9 = ey.iy[player];
        if (0 !== ae9) {
          var abG = d3.dL[player],
            d4 = d3.d4;
          if (player < ct.dP && (ki = abG), !(abG < d4[player] || 5 === ae0 && abG < a3r || 4 === ae0 && abG < he.iA(a3r, 2))) {
            hE.a58(ae9);
            for (var aM = k3.a5A[0], a59 = k3.a59, aN = iW.rU(aM), ex = 0; ex < aM; ex++) {
              var bW = a59[(ex + aN) % aM];
              if (a6f[bW]) return gD.l8.a6e(player, bW, ki);
            }
            var a4P = h0.b1.a4P;
            for (ex = 0; ex < aM; ex++) if (bW = a59[(ex + aN) % aM], a4P[bW] && bW !== player) return gD.l8.a6e(player, bW, ki);
          }
        }
      }(player, ki, ae0, a3r);
    }(player, ki, ae0, a3r) : (!ae2 || ae1 && (ae1 < ae2 && !iW.rU(10) || 100 * ae2 <= ae1 && iW.rU(3) || !iW.rU(8))) && h0.aF5.f1(player) || function (player, ki, ae0) {
      gz.kL.aGq(player, !0) || gz.kL.aGt(player, !0) ? gz.kL.aGv(player) || (gz.kL.aGu() ? ae5(player, ki) : iW.a6c(tV.aJA[ae0]) ? ae7(player, ki, gz.kL.aGy(player), ae0) : 5 === ae0 ? ae7(player, ki, gz.kL.aH7(), ae0) : (gz.kL.aGw() && iW.a6c(tV.aJ9[ae0]) && gz.kL.aGx(), ae7(player, ki, 6 === ae0 ? gz.kL.aHB() : gz.kL.aH2(player), ae0))) : gz.kP.f1(player);
    }(player, ki, ae0));
  };
}
function aES() {
  var aeA,
    aeB,
    aeC,
    g7,
    aeD,
    af = 0,
    dz = dy.dz;
  function aeG() {
    !function () {
      if (!ct.dO) return;
      if (ct.kD) return;
      if (2 !== ct.dX) if (aeD % 7 != 0) aeD++;else if (g7 === ct.gH) {
        if (!aeJ()) return;
        gG.gC(g7), ct.gI.f1();
      } else {
        if (!aeJ()) return;
        aeD++, g7++, di.dR(), di.dY(!0);
      }
      return 1;
    }() && aeJ() && gU();
  }
  function aeH() {
    af = 0, (ct.dO ? (dy.gK = gG.gC(g7 - (aeD % 7 == 0 ? 0 : 1) + aeD % 7 / 7) || dy.gK, gL) : my.mz || !hM.vX ? gL : (dy.gK = !0, gS))();
  }
  function aeJ() {
    var aN,
      aM,
      aeK = gF.oK.oJ,
      oL = gF.oK.oM,
      oN = gF.oK.oO,
      oP = gF.oK.oQ,
      aeL = gF.oK.oS,
      aeM = gF.oK.oR;
    if (!(aeA >= aeM.length)) {
      if (aeM = aeM[aeA], aeL[aeA]) {
        for (aM = aeB + aeM, aN = aeB; aN < aM; aN++) gD.gE.aXy(aeK[aN], oL[aN], oN[aN], oP[aN]);
        aeB += aeM, aeA++;
      } else ++aeC >= aeM && (aeA++, aeC = 0);
      return __fx.replay.tick++, 1;
    }
    fA.mI("Replay file smaller than expected."), hM.zo(!1), ct.dX = 2;
  }
  this.g6 = 0, this.r = function () {
    aeD = g7 = aeC = aeB = aeA = 0, __fx.replay.registerHooks({
      advance: () => aeG(),
      finishTick: () => gJ.render(),
      requestRedraw: () => {
        dy.gK = !0;
      },
      isEnded: () => 2 === ct.dX,
      getTickInterval: () => dy.gM
    });
  }, this.f1 = function () {
    var aM3;
    d9.f1(), __fx.replay.frame() ? gN() : hM.aUz() < 1.7 ? 0 === af ? dy.dz >= dz && (aM3 = dy.gM / hM.aUz(), dz += aM3 * Math.floor(1 + (dy.dz - dz) / aM3), 2 === ct.dX || my.mz || !hM.vX ? gN() : (aeG(), gJ.render()), af++) : aeH() : function () {
      var aM3;
      if (dy.dz >= dz) if (2 === ct.dX || my.mz || !hM.vX) gN(), dz = dy.dz;else {
        for (aM3 = dy.gM / hM.aUz(), 16 < (dy.dz - dz) / aM3 && (dz = dy.dz - 16 * aM3); dy.dz >= dz && 2 !== ct.dX;) dz += aM3, aeG();
        gJ.render();
      }
      aeH();
    }(), gQ(), dy.gK && (dy.gK = !1, gR());
  }, this.acV = function () {
    gF.oK.oR.length - aeA <= 2 || fA.mI("Replay file larger than expected.");
  };
}
function aEF() {
  var fY = aeN(fU.jJ);
  fY && aeO(fY[0], fY[1], fY[2], fY[3], fY[4]);
}
function aeN(jJ) {
  return 2 === jJ ? [[256], [256], [0, 205, 256], [500, 500, 0], [0, 0, 0]] : 7 === jJ ? [[512], [512], [0, 380, 512], [500, 500, 0], [0, 0, 0]] : 8 === jJ ? [[410], [410], [0, 120, 210], [0, 80, 640], [0, 0, 0]] : 9 === jJ ? [[512], [512], [0, 70, 180, 200, 290, 420, 512], [500, 500, 0, 0, 500, 500, 0], [0, 0, 0, 0, 0, 0, 0]] : 20 === jJ ? [[512], [512], [0, 380, 512], [500, 500, 0], [0, 0, 0]] : null;
}
function aeO(aeP, aeQ, aeR, aeS, aeT) {
  for (var eT, eU, a66, a67, dj, aeW, hy = aeP.length - 1, aeU = fU.fV + fU.iD, aM = (aeU *= aeU, aeR.length), aeV = Array(aM), aN = aM - 1; 0 <= aN; aN--) aeV[aN] = aeR[aN] * aeR[aN];
  var aeX = new Array(aM),
    sd = new Array(aM),
    aeY = new Array(aM),
    aY = aEE.aMG();
  if (void 0 === aeT) for (aeT = new Array(aM), aN = aM - 1; 0 <= aN; aN--) aeT[aN] = 0;
  for (aN = 1; aN < aM; aN++) aeX[aN] = aeV[aN] - aeV[aN - 1], sd[aN] = aeS[aN] - aeS[aN - 1], aeY[aN] = aeT[aN] - aeT[aN - 1];
  for (eT = fU.fV - 1; 0 <= eT; eT--) for (eU = fU.iD - 1; 0 <= eU; eU--) {
    for (a66 = aeU, aN = hy; 0 <= aN; aN--) a66 = (a67 = (eT - aeP[aN]) * (eT - aeP[aN]) + (eU - aeQ[aN]) * (eU - aeQ[aN])) < a66 ? a67 : a66;
    for (dj = aeS[aM - 1], aeW = aeT[aM - 1], aN = 1; aN < aM; aN++) if (a66 < aeV[aN]) {
      dj = aeS[aN - 1] + aL2((a66 - aeV[aN - 1]) * sd[aN], aeX[aN]), aeW = aeT[aN - 1] + aL2((a66 - aeV[aN - 1]) * aeY[aN], aeX[aN]);
      break;
    }
    aeZ(fU.fV * eU + eT, dj, aeW, aY);
  }
}
function aeZ(af, dj, aeW, aY) {
  dj < 500 ? aY[af] = he.iA(aY[af] * dj * 2, 1e3) : 500 < dj && (aY[af] += he.iA(2 * (1e4 - aY[af]) * (dj - 500), 1e3)), aY[af] += he.iA(aeW * (10 * dj - aY[af]), 1e3);
}
function acK() {
  this.ke = new aea(), this.m0 = new xf(), this.b1 = new aLb(), this.iO = new ya(), this.aA2 = new aON(), this.ph = new kW(), this.aF5 = new aIk(), this.os = new aWw(), this.aWy = new aPN(), this.aeb = new aIZ(), this.op = new aCd(), this.aQe = new aPS(), this.gd = new gX(), this.nd = new a49(), this.p0 = new a8R(), this.kc = new pX(), this.p2 = new aDJ(), this.r = function () {
    this.gd.r(), this.m0.r(), this.b1.r(), this.iO.r(), this.aA2.r(), this.aeb.r(), this.kc.r();
  }, this.dd = function () {
    this.aeb.dd(), this.m0.dd();
  };
}
function aea() {
  this.add = function (player) {
    for (var a4Q = h0.b1.a4Q, pL = player << 3, aN = pL + h0.b1.a4P[player] - 1; pL <= aN; aN--) this.kf(a4Q[aN]);
  }, this.kf = function (aec) {
    var b1 = h0.b1,
      aed = b1.ka - 1,
      aee = b1.kw[aec],
      aef = b1.yn[aec],
      aeg = b1.kY[aec];
    b1.ka = aed, b1.kw[aec] = b1.kw[aed], b1.kY[aec] = b1.kY[aed], b1.kZ[aec] = b1.kZ[aed], b1.kx[aec] = b1.kx[aed], b1.yn[aec] = b1.yn[aed], b1.pj[aec] = b1.pj[aed], b1.kX[aec] = b1.kX[aed], b1.y7[aec] = b1.y7[aed], b1.pn[aec] = b1.pn[aed], b1.kv[aec] = b1.kv[aed], b1.a4Q[b1.kw[aec]] = aec, function (a7U) {
      var player = a7U >> 3,
        b1 = h0.b1,
        aM = b1.a4P[player] - 1,
        aej = (player << 3) + aM;
      b1.a4P[player] = aM, aej !== a7U && (b1.a4Q[a7U] = b1.a4Q[aej], b1.kw[b1.a4Q[a7U]] = a7U);
    }(aee), h0.iO.iO[dr.iN(b1.kY[aec])][b1.yn[aec]] = aec, aed = dr.iN(aeg), aee = aef, aed = h0.iO.iO[aed], b1 = aed.pop(), aee !== aed.length && (aed[aee] = b1, h0.b1.yn[b1] = aee);
  };
}
function acN() {
  var a8k = [];
  this.a3s = function (player, jy, d2, ael) {
    player === ct.eG || jy === ct.eG || !ael && aR.f.eH(player) || aR.f.eH(jy) || this.ip(d3.dI[player] + " supported " + d3.dI[jy] + " with " + aR.h.dG(d2) + " ressource" + (1 === d2 ? "." : "s."));
  }, this.ip = function (bS, ek) {
    bS = {
      dz: gG.qf(),
      bS: bS,
      ek: ek
    };
    a8k.push(bS), 30 === aq.fv && aq.mA().ip(bS);
  }, this.clear = function () {
    a8k = [];
    var kA = aq.wU(30);
    kA && kA.clear();
  }, this.aLV = function () {
    return a8k;
  };
}
function tE() {
  this.a2L = function (size) {
    for (var a1g = ft, a6 = [], aN = 0; aN < size; aN++) a6.push(String.fromCharCode(a1g.bg(16)));
    return a6.join("");
  }, this.acr = function (bS) {
    return 20 < (bS = bS.trim()).length ? bS.substring(0, 20) : bS;
  };
}
function acL() {
  this.aAA = 0, this.aAB = 0, this.aA5 = 0, this.aA6 = 0, this.aA7 = 0, this.aA8 = 0, this.aJb = [0, 0, 0, 0], this.aDd = function () {
    this.aAA = qA.aDT(), this.aAB = qA.mw(), this.aA5 = -this.aAA, this.aA6 = -this.aAB, this.aA7 = d9.aO / e5, this.aA8 = d9.dA / e5, this.aJb[0] = Math.floor(this.aA5), this.aJb[1] = Math.floor(this.aA6), this.aJb[2] = Math.floor(this.aJb[0] + this.aA7 + 1), this.aJb[3] = Math.floor(this.aJb[1] + this.aA8 + 1), gJ.aJX = !0;
  };
}
function acJ() {
  var aba = 0,
    aem = !0;
  function aen(id) {
    id = [L(551), L(552), L(553), L(554)][id];
    fA.aah(id);
  }
  this.f1 = function () {
    var eZ, aBI;
    dy.dz < aba || (aba = dy.dz + 3e3, ct.mH) || ct.kD || aR.f.kk(ct.eG) || (eZ = new Date(), aBI = eZ.getUTCSeconds(), aem ? aBI < 43 && (aem = !1) : aBI < 43 || (aba += 52e3, aem = !0, (aBI = (eZ.getUTCMinutes() + 2) % 60) % 10 == 0 ? ct.cu < 7 && aen(0) : aBI % 10 == 5 ? 7 !== ct.cu && 10 !== ct.cu || aen(1) : aBI % 10 == 7 ? 8 === ct.cu && aen(2) : aBI % 10 == 2 && 9 === ct.cu && aen(3)));
  };
}
a6t(), self.aiCommand746 = function (aY) {
  0 === aY ? aGL() : 1 !== aY || !cA || 1 !== cA.id || cA.cB < 14 || a5t.aGM();
}, setTimeout(aGL, 1e4), window.onload = function () {
  aGL();
};