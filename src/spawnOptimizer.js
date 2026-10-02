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

  // Precomputed radial offsets for radius R = 20 (16 radial samples)
  const SAMPLE_OFFSETS_R20 = [
    { dx: 20, dy: 0 },
    { dx: 18, dy: 8 },
    { dx: 14, dy: 14 },
    { dx: 8, dy: 18 },
    { dx: 0, dy: 20 },
    { dx: -8, dy: 18 },
    { dx: -14, dy: 14 },
    { dx: -18, dy: 8 },
    { dx: -20, dy: 0 },
    { dx: -18, dy: -8 },
    { dx: -14, dy: -14 },
    { dx: -8, dy: -18 },
    { dx: 0, dy: -20 },
    { dx: 8, dy: -18 },
    { dx: 14, dy: -14 },
    { dx: 18, dy: -8 }
  ];

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

  // 1. Static Topology Analysis (Continental Filtering & Water Distance Transform)
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
    for (let y = 0; y < mapHeight; y++) {
      const rowOffset = y * mapWidth;
      for (let x = 0; x < mapWidth; x++) {
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

            if (cx > 0) {
              const nIdx = curr - 1;
              if (tm.fQ(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cx < mapWidth - 1) {
              const nIdx = curr + 1;
              if (tm.fQ(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cy > 0) {
              const nIdx = curr - mapWidth;
              if (tm.fQ(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cy < mapHeight - 1) {
              const nIdx = curr + mapWidth;
              if (tm.fQ(nIdx << 2) && landmassLabels[nIdx] === 0) {
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

    // Pass 1b: Continental Landmass Identification
    let totalLandTiles = 0;
    let maxComponentSize = 0;
    componentSizes.forEach((size) => {
      totalLandTiles += size;
      if (size > maxComponentSize) maxComponentSize = size;
    });

    const relMaxThresh = Math.floor(maxComponentSize * 0.60);
    const relTotalThresh = Math.floor(totalLandTiles * 0.10);
    componentSizes.forEach((size, id) => {
      if ((size >= relMaxThresh && size >= relTotalThresh) || size >= 4000) {
        validComponents.add(id);
      }
    });

    // Fallback: Ensure at least one viable component is selected in extreme archipelago setups
    if (validComponents.size === 0 && maxComponentSize > 0) {
      componentSizes.forEach((size, id) => {
        if (size >= maxComponentSize * 0.5) {
          validComponents.add(id);
        }
      });
    }

    // Pass 2: Multi-Source BFS for Distance to Coastline (capped at depth 70)
    let head = 0;
    while (head < waterQueue.length) {
      const curr = waterQueue[head++];
      const d = waterDistTable[curr];
      if (d >= 70) continue;

      const cx = curr % mapWidth;
      const cy = Math.floor(curr / mapWidth);

      if (cx > 0) {
        const nIdx = curr - 1;
        if (waterDistTable[nIdx] > d + 1) {
          waterDistTable[nIdx] = d + 1;
          waterQueue.push(nIdx);
        }
      }
      if (cx < mapWidth - 1) {
        const nIdx = curr + 1;
        if (waterDistTable[nIdx] > d + 1) {
          waterDistTable[nIdx] = d + 1;
          waterQueue.push(nIdx);
        }
      }
      if (cy > 0) {
        const nIdx = curr - mapWidth;
        if (waterDistTable[nIdx] > d + 1) {
          waterDistTable[nIdx] = d + 1;
          waterQueue.push(nIdx);
        }
      }
      if (cy < mapHeight - 1) {
        const nIdx = curr + mapWidth;
        if (waterDistTable[nIdx] > d + 1) {
          waterDistTable[nIdx] = d + 1;
          waterQueue.push(nIdx);
        }
      }
    }

    isMapAnalyzed = true;
    return true;
  }

  // 2. Extract Human Players' Spawn Coordinates (Ignoring Bots)
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
      if (!pd.hN || pd.hN[p] === 0) continue;

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
        const isAlly = isTeam && myTeam !== null && pTeam !== null && pTeam === myTeam;
        spawns.push({ x, y, isAlly });
      }
    }
    return spawns;
  }

  // 3. Composite Fitness Evaluation for a Given Tile
  function evaluateFitness(x, y, spawns, tm) {
    const idx = y * mapWidth + x;
    const compId = landmassLabels[idx];
    if (!validComponents.has(compId) || !tm.fQ(idx << 2)) {
      return -Infinity;
    }

    const coastDist = waterDistTable[idx];

    // 3a. Balanced Coastline Reachability (Peak in [18, 42], penalized < 12 and > 42)
    let coastScore = 0;
    if (coastDist < 12) {
      coastScore = -(12 - coastDist) * 8.0;
    } else if (coastDist < 18) {
      coastScore = (coastDist - 12) * 2.5;
    } else if (coastDist <= 42) {
      coastScore = 15.0;
    } else {
      const effDist = Math.min(coastDist, 70);
      coastScore = 15.0 - (effDist - 42) * 0.35;
    }

    // 3b. Local Landmass Density (R = 20)
    let landSamples = 0;
    for (let i = 0; i < SAMPLE_OFFSETS_R20.length; i++) {
      const sx = x + SAMPLE_OFFSETS_R20[i].dx;
      const sy = y + SAMPLE_OFFSETS_R20[i].dy;
      if (sx >= 0 && sx < mapWidth && sy >= 0 && sy < mapHeight) {
        if (tm.fQ((sy * mapWidth + sx) << 2)) {
          landSamples++;
        }
      }
    }
    const landDensity = landSamples / SAMPLE_OFFSETS_R20.length;
    let densityScore = 0;
    if (landDensity < 0.65) {
      densityScore = (landDensity - 0.65) * 60.0;
    } else if (landDensity >= 0.85) {
      densityScore = 10.0;
    }

    // 3c. Human Player Proximity (Enemies & Team Allies)
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

    // Enemy Repulsion (penalize clash < 30 tiles, reward distance up to 180)
    let enemyScore = 0;
    if (minEnemyDist !== Infinity) {
      if (minEnemyDist < 30) {
        enemyScore = -(30 - minEnemyDist) * 12.0;
      } else {
        enemyScore = Math.min(minEnemyDist, 180) * 0.6;
      }
    } else {
      enemyScore = 60.0;
    }

    // Ally Cooperative Corridor (maintain 50-90 tile buffer)
    let allyScore = 0;
    if (minAllyDist !== Infinity) {
      if (minAllyDist < 35) {
        allyScore = -(35 - minAllyDist) * 4.0;
      } else if (minAllyDist >= 50 && minAllyDist <= 90) {
        allyScore = 20.0;
      } else if (minAllyDist > 140) {
        allyScore = -5.0;
      }
    }

    return coastScore + densityScore + enemyScore + allyScore;
  }

  // 4. Hierarchical Grid Search (Macro Delta = 10, Micro Delta = 1)
  function computeBestLocation() {
    const bV = window.bV;
    if (bV && (bV.fk !== mapWidth || bV.fl !== mapHeight)) {
      isMapAnalyzed = false;
    }
    if (!isMapAnalyzed && !analyzeMapTopology()) return;

    const spawns = getActiveSpawns();
    const tm = window.ad;
    const macroStep = 10;
    let bestScore = -Infinity;
    let candidate = null;

    // Tier 1: Macro Grid Scan
    for (let y = macroStep; y < mapHeight - macroStep; y += macroStep) {
      for (let x = macroStep; x < mapWidth - macroStep; x += macroStep) {
        const score = evaluateFitness(x, y, spawns, tm);
        if (score > bestScore) {
          bestScore = score;
          candidate = { x, y };
        }
      }
    }

    // Tier 2: Micro Scan (1x1 scan around candidate within +- 10 tiles)
    if (candidate) {
      let refinedBest = bestScore;
      let refinedCoord = { ...candidate };
      const microRange = 10;

      for (let dy = -microRange; dy <= microRange; dy++) {
        const ny = candidate.y + dy;
        if (ny < 1 || ny >= mapHeight - 1) continue;

        for (let dx = -microRange; dx <= microRange; dx++) {
          const nx = candidate.x + dx;
          if (nx < 1 || nx >= mapWidth - 1) continue;

          const score = evaluateFitness(nx, ny, spawns, tm);
          if (score > refinedBest) {
            refinedBest = score;
            refinedCoord = { x: nx, y: ny };
          }
        }
      }
      targetTile = { x: refinedCoord.x, y: refinedCoord.y, valid: true };
    }
  }

  // 5. Lifecycle Update & Automated Dispatch
  this.update = function(context) {
    const settings = getSettings();
    if (!settings.spawnOptimizer && !settings.autoSpawnPicker) return;

    const isSingleplayer = getVar("gIsSingleplayer");
    const isSelectableSpawn = getVar("gSelectableSpawn");
    const gameState = getVar("gameState");

    if (isSingleplayer || !isSelectableSpawn || gameState !== 1) {
      if (targetTile.valid) this.reset();
      return;
    }

    // Check if player has ACTUALLY placed a spawn (territory > 0, NOT pd.nU)
    const myId = getVar("playerId");
    const pd = window.ah;
    if (pd && pd.hN && pd.hN[myId] > 0) {
      userOverridden = true;
      return;
    }

    const now = performance.now();
    const activeSpawns = getActiveSpawns();
    const posHash = activeSpawns.map(s => `${s.x},${s.y}`).join("|");

    // Recalculate on spawn placement changes, every 250ms, or when uninitialized
    if (posHash !== lastPlayerPositionsHash || now - lastEvalTime > 250 || !targetTile.valid) {
      lastPlayerPositionsHash = posHash;
      lastEvalTime = now;
      computeBestLocation();
    }

    // Synchronized Auto Spawn Dispatch (T <= 1.2s or <= 3 ticks)
    if (settings.autoSpawnPicker && !userOverridden && targetTile.valid) {
      const totalTicks = (window.aE && typeof window.aE.a6g === "number") ? window.aE.a6g : 30;
      const currentTick = (window.bi && window.bi.a2Q && typeof window.bi.a2Q.aIr === "number") ? window.bi.a2Q.aIr : 0;
      const ticksRemaining = Math.max(0, totalTicks - currentTick);
      const timeRemainingMs = ticksRemaining * 392;

      if (timeRemainingMs <= 1200) {
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
    }

    // Fallback: Synthetic mouse events on canvasA
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

      const opts = { bubbles: true, cancelable: true, clientX, clientY, button: 0 };
      canvas.dispatchEvent(new MouseEvent("mousedown", opts));
      canvas.dispatchEvent(new MouseEvent("mouseup", opts));
      canvas.dispatchEvent(new MouseEvent("click", opts));
    }
  };

  // 6. Canvas 2D Rendering with Kinematic LERP Interpolation (lambda = 14.0)
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

    // Kinematic LERP smoothing (lambda = 14.0)
    if (!currentLerp.initialized) {
      currentLerp.x = targetTile.x;
      currentLerp.y = targetTile.y;
      currentLerp.initialized = true;
    } else {
      const factor = 1.0 - Math.exp(-14.0 * dt);
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
