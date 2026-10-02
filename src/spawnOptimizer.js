import { getVar } from "./gameInterface.js";
import { getSettings } from "./settings.js";

export const spawnOptimizer = new (function() {
  let isMapAnalyzed = false;
  let mapWidth = 0;
  let mapHeight = 0;
  let landmassLabels = null; // Uint16Array: component ID per tile
  let waterDistTable = null; // Uint8Array: distance to water per tile
  let validComponents = new Set();

  let targetTile = { x: 0, y: 0, valid: false };
  let currentLerp = { x: 0, y: 0, initialized: false };
  let lastEvalTime = 0;
  let lastRenderTime = 0;
  let lastPlayerPositionsHash = "";
  let userOverridden = false;

  // Reset engine state between matches
  this.reset = function() {
    isMapAnalyzed = false;
    mapWidth = 0;
    mapHeight = 0;
    landmassLabels = null;
    waterDistTable = null;
    validComponents.clear();
    targetTile = { x: 0, y: 0, valid: false };
    currentLerp = { x: 0, y: 0, initialized: false };
    lastPlayerPositionsHash = "";
    userOverridden = false;
    lastEvalTime = 0;
    lastRenderTime = 0;
  };

  // 1. Static Topology Analysis (Island Filtering & Water Distance Transform)
  function analyzeMapTopology() {
    const bV = window.bV;
    const tm = window.ad;
    if (!bV || !tm || !bV.fk || !bV.fl) return false;

    mapWidth = bV.fk;
    mapHeight = bV.fl;
    const totalTiles = mapWidth * mapHeight;
    landmassLabels = new Uint16Array(totalTiles);
    waterDistTable = new Uint8Array(totalTiles);
    waterDistTable.fill(255);

    const waterQueue = [];
    let currentComponentId = 1;
    const componentSizes = new Map();

    // Pass 1: Identify Landmasses via BFS Flood Fill & Enqueue Water Borders
    for (let y = 1; y < mapHeight - 1; y++) {
      const rowOffset = y * mapWidth;
      for (let x = 1; x < mapWidth - 1; x++) {
        const idx = rowOffset + x;
        const fD = idx << 2;

        if (tm.iq(fD)) {
          waterDistTable[idx] = 0;
          waterQueue.push(idx);
        } else if (tm.fQ(fD) && landmassLabels[idx] === 0) {
          let size = 0;
          const q = [idx];
          landmassLabels[idx] = currentComponentId;

          while (q.length > 0) {
            const curr = q.pop();
            size++;
            const cx = curr % mapWidth;
            const cy = Math.floor(curr / mapWidth);

            const neighbors = [curr - 1, curr + 1, curr - mapWidth, curr + mapWidth];
            for (let n = 0; n < 4; n++) {
              const nIdx = neighbors[n];
              if (nIdx >= 0 && nIdx < totalTiles && tm.fQ(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
          }
          componentSizes.set(currentComponentId, size);
          currentComponentId++;
        }
      }
    }

    // Filter out isolated island components (< 1.5% total land or < 1200 tiles)
    const islandThreshold = Math.max(1200, Math.floor(totalTiles * 0.015));
    componentSizes.forEach((size, id) => {
      if (size >= islandThreshold) {
        validComponents.add(id);
      }
    });

    // Pass 2: Multi-Source BFS for Distance to Coastline (capped at depth 35)
    let head = 0;
    while (head < waterQueue.length) {
      const curr = waterQueue[head++];
      const d = waterDistTable[curr];
      if (d >= 35) continue;

      const cx = curr % mapWidth;
      const cy = Math.floor(curr / mapWidth);
      const neighbors = [];
      if (cx > 1) neighbors.push(curr - 1);
      if (cx < mapWidth - 2) neighbors.push(curr + 1);
      if (cy > 1) neighbors.push(curr - mapWidth);
      if (cy < mapHeight - 2) neighbors.push(curr + mapWidth);

      for (let i = 0; i < neighbors.length; i++) {
        const nIdx = neighbors[i];
        if (waterDistTable[nIdx] > d + 1) {
          waterDistTable[nIdx] = d + 1;
          waterQueue.push(nIdx);
        }
      }
    }

    isMapAnalyzed = true;
    return true;
  }

  // 2. Extract Human Players' Spawn Coordinates
  function getActiveSpawns() {
    const pd = window.ah;
    const g = window.aE;
    if (!pd || !g) return [];

    const gHumans = getVar("gHumans") || 0;
    const myId = getVar("playerId");
    const spawns = [];
    const isTeam = !!getVar("gIsTeamGame");
    const myTeam = isTeam && window.bj && window.bj.fX ? window.bj.fX[myId] : null;

    for (let p = 0; p < gHumans; p++) {
      if (p === myId) continue;
      if (pd.nU && pd.nU[p] === 0) continue;

      let x = -1;
      let y = -1;

      // Centroid from player bounding box
      if (pd.jT && pd.jS && pd.jT[p] >= pd.jS[p] && pd.jS[p] > 0) {
        x = (pd.jS[p] + pd.jT[p]) >> 1;
        y = (pd.jU[p] + pd.jV[p]) >> 1;
      } else if (window.ag && window.ag.aLp && window.ag.aLp[p] > 0) {
        // Centroid from nametag anchor
        const lw = window.ag.aLr ? (window.ag.aLr[p] || 0) : 0;
        x = window.ag.aLp[p] + (lw >> 1);
        y = window.ag.aLq[p];
      }

      if (x > 0 && y > 0) {
        const pTeam = isTeam && window.bj && window.bj.fX ? window.bj.fX[p] : null;
        const isAlly = isTeam && myTeam !== null && pTeam === myTeam;
        spawns.push({ x, y, isAlly });
      }
    }
    return spawns;
  }

  // 3. Fitness Function Evaluator (Hierarchical Coarse-to-Fine Grid Search)
  function computeBestLocation() {
    const bV = window.bV;
    if (bV && (bV.fk !== mapWidth || bV.fl !== mapHeight)) {
      isMapAnalyzed = false;
    }
    if (!isMapAnalyzed && !analyzeMapTopology()) return;

    const spawns = getActiveSpawns();
    const tm = window.ad;
    const step = 8; // Tier 1 Macro step size
    let bestScore = -Infinity;
    let candidate = null;

    // Tier 1: Macro Grid Scan
    for (let y = 12; y < mapHeight - 12; y += step) {
      const rowOffset = y * mapWidth;
      for (let x = 12; x < mapWidth - 12; x += step) {
        const idx = rowOffset + x;
        const compId = landmassLabels[idx];
        if (!validComponents.has(compId)) continue;
        if (!tm.fQ(idx << 2)) continue;

        const coastDist = waterDistTable[idx];
        if (coastDist > 30) continue; // Avoid deep landlocked zones

        let score = 0;

        // Coastline accessibility metric: optimal window [4, 18], peak at ~9
        score += 15.0 - Math.abs(coastDist - 9);

        // Player Distance Penalties & Bonuses
        let minEnemyDist = Infinity;
        let minAllyDist = Infinity;

        for (let i = 0; i < spawns.length; i++) {
          const sp = spawns[i];
          const dist = Math.hypot(x - sp.x, y - sp.y);
          if (sp.isAlly) {
            if (dist < minAllyDist) minAllyDist = dist;
          } else {
            if (dist < minEnemyDist) minEnemyDist = dist;
          }
        }

        // Enemy Repulsion (strong penalty under lethal proximity of 25 tiles)
        if (minEnemyDist !== Infinity) {
          if (minEnemyDist < 25) {
            score -= (25 - minEnemyDist) * 8.0;
          } else {
            score += Math.min(minEnemyDist, 180) * 0.7;
          }
        } else {
          score += 50.0;
        }

        // Ally Spacing (maintain 35-75 tile corridor)
        if (minAllyDist !== Infinity) {
          if (minAllyDist < 30) {
            score -= (30 - minAllyDist) * 4.0;
          } else if (minAllyDist >= 35 && minAllyDist <= 75) {
            score += 18.0;
          }
        }

        if (score > bestScore) {
          bestScore = score;
          candidate = { x, y };
        }
      }
    }

    // Tier 2: Micro Scan (1x1 scan around candidate centroid)
    if (candidate) {
      let refinedBest = bestScore;
      let refinedCoord = { ...candidate };
      const range = step;

      for (let dy = -range; dy <= range; dy++) {
        const ny = candidate.y + dy;
        if (ny <= 2 || ny >= mapHeight - 3) continue;
        const rOff = ny * mapWidth;

        for (let dx = -range; dx <= range; dx++) {
          const nx = candidate.x + dx;
          if (nx <= 2 || nx >= mapWidth - 3) continue;
          const idx = rOff + nx;
          if (!validComponents.has(landmassLabels[idx]) || !tm.fQ(idx << 2)) continue;

          const coastDist = waterDistTable[idx];
          let score = 15.0 - Math.abs(coastDist - 9);

          for (let i = 0; i < spawns.length; i++) {
            const sp = spawns[i];
            const dist = Math.hypot(nx - sp.x, ny - sp.y);
            if (sp.isAlly) {
              if (dist < 30) score -= (30 - dist) * 4.0;
              else if (dist >= 35 && dist <= 75) score += 18.0;
            } else {
              if (dist < 25) score -= (25 - dist) * 8.0;
              else score += Math.min(dist, 180) * 0.7;
            }
          }

          if (score > refinedBest) {
            refinedBest = score;
            refinedCoord = { x: nx, y: ny };
          }
        }
      }
      targetTile = { x: refinedCoord.x, y: refinedCoord.y, valid: true };
    }
  }

  // 4. Lifecycle Update & Automated Dispatch
  this.update = function(context) {
    const settings = getSettings();
    if (!settings.spawnOptimizer) return;

    // Active multiplayer pre-match spawn selection only
    const isSingleplayer = getVar("gIsSingleplayer");
    const isSelectableSpawn = getVar("gSelectableSpawn");
    const gameState = getVar("gameState");

    if (isSingleplayer || !isSelectableSpawn || gameState !== 1) {
      if (targetTile.valid) this.reset();
      return;
    }

    // Auto-disable if local player has already placed a spawn
    const myId = getVar("playerId");
    const pd = window.ah;
    if (pd && pd.nU && pd.nU[myId] !== 0) {
      userOverridden = true;
    }

    const now = performance.now();
    const activeSpawns = getActiveSpawns();
    const posHash = activeSpawns.map(s => `${s.x},${s.y}`).join("|");

    // Recalculate on spawn placement changes or every 250ms
    if (posHash !== lastPlayerPositionsHash || now - lastEvalTime > 250) {
      lastPlayerPositionsHash = posHash;
      lastEvalTime = now;
      computeBestLocation();
    }

    // Auto-pick execution at T <= 1.2s before countdown ends
    if (settings.autoSpawnPicker && !userOverridden && targetTile.valid) {
      const timeRemaining = (window.aX && typeof window.aX.a7G === "function") ? window.aX.a7G() : 9999;
      if (timeRemaining <= 1200 && timeRemaining > 0) {
        this.dispatchSpawnSelection(targetTile.x, targetTile.y);
        userOverridden = true;
      }
    }
  };

  // Dispatch spawn selection via protocol packet or synthetic pointer event fallback
  this.dispatchSpawnSelection = function(tileX, tileY) {
    const tileIdx = tileY * mapWidth + tileX;

    // Primary protocol packet method
    if (window.bB && window.bB.hz && typeof window.bB.hz.i0 === "function") {
      window.bB.hz.i0(tileIdx);
      return;
    }

    // Fallback: Synthetic pointer events on canvasA
    const canvas = document.getElementById("canvasA");
    if (canvas && window.aT) {
      const ox = typeof window.aT.a0L === "function" ? window.aT.a0L() : 0;
      const oy = typeof window.aT.a0M === "function" ? window.aT.a0M() : 0;
      const zoom = window.__TERRIX_LAST_CTX__?.im || 1.0;
      const screenX = (tileX + ox) * zoom;
      const screenY = (tileY + oy) * zoom;
      const rect = canvas.getBoundingClientRect();
      const clientX = rect.left + screenX;
      const clientY = rect.top + screenY;

      const opts = { bubbles: true, cancelable: true, clientX, clientY, pointerId: 1, isPrimary: true, button: 0 };
      canvas.dispatchEvent(new PointerEvent("pointerdown", opts));
      canvas.dispatchEvent(new PointerEvent("pointerup", opts));
    }
  };

  // 5. Canvas 2D Rendering with Kinematic LERP Interpolation
  this.render = function(context) {
    if (!getSettings().spawnOptimizer || !targetTile.valid) return;

    const ws = context.ws;
    if (!ws || !ws.canvas) return;

    const zoom = context.im || 1.0;
    const ox = context.offsetX !== undefined ? context.offsetX : (window.aT ? window.aT.a0L() : 0);
    const oy = context.offsetY !== undefined ? context.offsetY : (window.aT ? window.aT.a0M() : 0);

    const now = performance.now();
    const dt = lastRenderTime > 0 ? Math.min((now - lastRenderTime) / 1000, 0.1) : 0.016;
    lastRenderTime = now;

    // Kinematic LERP smoothing (lambda = 12.0)
    if (!currentLerp.initialized) {
      currentLerp.x = targetTile.x;
      currentLerp.y = targetTile.y;
      currentLerp.initialized = true;
    } else {
      const factor = 1.0 - Math.exp(-12.0 * dt);
      currentLerp.x += (targetTile.x - currentLerp.x) * factor;
      currentLerp.y += (targetTile.y - currentLerp.y) * factor;
    }

    const screenX = (currentLerp.x + ox) * zoom;
    const screenY = (currentLerp.y + oy) * zoom;

    // Viewport Frustum Culling
    const sw = ws.canvas.width;
    const sh = ws.canvas.height;
    if (screenX < -100 || screenX > sw + 100 || screenY < -100 || screenY > sh + 100) return;

    const time = now * 0.003;
    const pulse = (Math.sin(time * 2.5) + 1.0) * 0.5;
    const scaleFactor = Math.max(0.7, Math.min(zoom, 1.4));
    const outerRadius = (22 + pulse * 6) * scaleFactor;
    const innerRadius = 5 * scaleFactor;

    ws.save();
    ws.setTransform(1, 0, 0, 1, 0, 0);

    // Color: Gold in Team game, Aqua in FFA
    const isTeam = !!getVar("gIsTeamGame");
    const primaryColor = isTeam ? "rgba(255, 215, 0, 0.9)" : "rgba(0, 240, 255, 0.9)";
    const glowColor = isTeam ? "rgba(255, 215, 0, 0.25)" : "rgba(0, 240, 255, 0.25)";

    // Radial Strategic Anchor Glow
    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius * 1.35, 0, 2 * Math.PI);
    ws.fillStyle = glowColor;
    ws.fill();

    // Outer Rotating Segmented Reticle
    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius, time, time + Math.PI * 1.5);
    ws.strokeStyle = primaryColor;
    ws.lineWidth = 2.5;
    ws.stroke();

    // Secondary Opposite Ring
    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius * 0.72, -time * 1.5, -time * 1.5 + Math.PI);
    ws.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ws.lineWidth = 1.5;
    ws.stroke();

    // Solid Target Core
    ws.beginPath();
    ws.arc(screenX, screenY, innerRadius, 0, 2 * Math.PI);
    ws.fillStyle = "#ffffff";
    ws.fill();

    // Target Text Annotation
    ws.font = "bold 11px sans-serif";
    ws.textAlign = "center";
    ws.fillStyle = primaryColor;
    ws.shadowColor = "#000000";
    ws.shadowBlur = 4;
    ws.fillText("OPTIMAL SPAWN", screenX, screenY - outerRadius - 6);

    ws.restore();
  };

  // Flag manual user override when player manually selects or clicks
  this.registerUserOverride = function() {
    userOverridden = true;
  };
})();
