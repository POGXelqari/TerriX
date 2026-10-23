import { getVar } from "./gameInterface.js";
import { getSettings } from "./settings.js";

export const spawnOptimizer = new (function() {
  let isMapAnalyzed = false;
  let mapWidth = 0;
  let mapHeight = 0;
  let landmassLabels = null; // Uint16Array: component ID per tile
  let waterDistTable = null; // Uint8Array: BFS distance to water
  let componentSizes = new Map();
  let maxComponentSize = 0;
  let totalLandTiles = 0;
  let validComponents = new Set();

  let targetTile = { x: 0, y: 0, valid: false };
  let currentLerp = { x: 0, y: 0, initialized: false };
  let lastEvalTime = 0;
  let lastRenderTime = 0;
  let lastPlayerPositionsHash = "";
  let userOverridden = false;

  // Track match session to detect consecutive games autonomously
  let currentMatchToken = "";
  let wasInSpawningPhase = false;

  // Precomputed local density sample offsets (radius R = 22, grid step 4)
  const DENSITY_OFFSETS_R22 = [];
  (function() {
    const r = 22;
    for (let dy = -r; dy <= r; dy += 4) {
      for (let dx = -r; dx <= r; dx += 4) {
        if (dx * dx + dy * dy <= r * r) {
          DENSITY_OFFSETS_R22.push({ dx, dy });
        }
      }
    }
  })();

  this.reset = function() {
    isMapAnalyzed = false;
    mapWidth = 0;
    mapHeight = 0;
    landmassLabels = null;
    waterDistTable = null;
    componentSizes.clear();
    validComponents.clear();
    maxComponentSize = 0;
    totalLandTiles = 0;
    targetTile = { x: 0, y: 0, valid: false };
    currentLerp = { x: 0, y: 0, initialized: false };
    lastPlayerPositionsHash = "";
    userOverridden = false;
    lastEvalTime = 0;
    lastRenderTime = 0;
  };

  function isWaterTile(byteOffset) {
    const pixels = (window.gW && window.gW.u3) ? window.gW.u3 : (window.xy || null);
    if (pixels && byteOffset + 2 < pixels.length) {
      return pixels[byteOffset + 2] > pixels[byteOffset] && pixels[byteOffset + 2] > pixels[byteOffset + 1];
    }
    if (window.j1 && typeof window.j1.uZ === "function") return !window.j1.uZ(byteOffset);
    if (window.ad && typeof window.ad.iq === "function") return window.ad.iq(byteOffset);
    return false;
  }

  function isLandTile(byteOffset) {
    return !isWaterTile(byteOffset);
  }

  // 1. Dynamic Map Topology & Continental Classification
  function analyzeMapTopology() {
    const bV = window.bV;
    const gW = window.gW;
    const xx = window.xx;
    const mapW = (gW && typeof gW.gX === "number") ? gW.gX : ((xx && typeof xx.width === "number") ? xx.width : ((bV && bV.fk) ? bV.fk : 0));
    const mapH = (gW && typeof gW.gY === "number") ? gW.gY : ((xx && typeof xx.height === "number") ? xx.height : ((bV && bV.fl) ? bV.fl : 0));
    if (mapW <= 0 || mapH <= 0) return false;

    mapWidth = mapW;
    mapHeight = mapH;
    const totalTiles = mapWidth * mapHeight;
    landmassLabels = new Uint16Array(totalTiles);
    waterDistTable = new Uint8Array(totalTiles);
    waterDistTable.fill(255);

    const waterQueue = [];
    let currentComponentId = 1;
    componentSizes.clear();
    validComponents.clear();
    maxComponentSize = 0;
    totalLandTiles = 0;

    // Pass 1: BFS Flood Fill to determine land components and collect water tiles
    for (let y = 0; y < mapHeight; y++) {
      const rowOffset = y * mapWidth;
      for (let x = 0; x < mapWidth; x++) {
        const idx = rowOffset + x;
        const fD = idx << 2;

        if (isWaterTile(fD)) {
          waterDistTable[idx] = 0;
          waterQueue.push(idx);
        } else if (isLandTile(fD) && landmassLabels[idx] === 0) {
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
              if (isLandTile(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cx < mapWidth - 1) {
              const nIdx = curr + 1;
              if (isLandTile(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cy > 0) {
              const nIdx = curr - mapWidth;
              if (isLandTile(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
            if (cy < mapHeight - 1) {
              const nIdx = curr + mapWidth;
              if (isLandTile(nIdx << 2) && landmassLabels[nIdx] === 0) {
                landmassLabels[nIdx] = currentComponentId;
                q.push(nIdx);
              }
            }
          }
          componentSizes.set(currentComponentId, size);
          totalLandTiles += size;
          if (size > maxComponentSize) maxComponentSize = size;
          currentComponentId++;
        }
      }
    }

    // Pass 2: Dynamic Map Archetype Classification
    // Continental Map: largest component holds >= 35% of total land
    // Archipelago Map: largest component holds < 35% of total land
    const isContinental = totalLandTiles > 0 && maxComponentSize >= (totalLandTiles * 0.35);
    const sizeRatioThreshold = isContinental ? 0.65 : 0.40;

    componentSizes.forEach((size, id) => {
      if (size >= maxComponentSize * sizeRatioThreshold) {
        validComponents.add(id);
      }
    });

    // Fallback: If no component met the threshold (e.g. highly fragmented archipelago), select top components
    if (validComponents.size === 0 && maxComponentSize > 0) {
      componentSizes.forEach((size, id) => {
        if (size >= maxComponentSize * 0.30) {
          validComponents.add(id);
        }
      });
    }

    // Pass 3: Multi-Source BFS for Coastline Distance (depth up to 90 tiles)
    let head = 0;
    while (head < waterQueue.length) {
      const curr = waterQueue[head++];
      const d = waterDistTable[curr];
      if (d >= 90) continue;

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

  // 2. Extract Active Human Player Spawns (Bots Excluded)
  function getActiveSpawns() {
    const pd = (typeof dictionary !== 'undefined' && dictionary.playerData && window[dictionary.playerData]) ? window[dictionary.playerData] : (window.y || window.ah);
    const g = (typeof dictionary !== 'undefined' && dictionary.game && window[dictionary.game]) ? window[dictionary.game] : (window.c || window.aE);
    if (!pd || !g) return [];

    const gHumans = (typeof getVar === 'function' ? getVar("gHumans") : null) || (g ? (g.aI ?? g.humanCount ?? 0) : 0);
    const myId = (typeof getVar === 'function' ? getVar("playerId") : null) ?? (g ? (g.t ?? g.playerId ?? 0) : 0);
    const spawns = [];
    const isTeam = typeof getVar === 'function' ? !!getVar("gIsTeamGame") : !!g.bJ;
    const myTeam = isTeam ? ((window.cD && window.cD.c1) ? window.cD.c1[myId] : (window.bj && window.bj.fX ? window.bj.fX[myId] : null)) : null;

    for (let p = 0; p < gHumans; p++) {
      if (p === myId) continue;
      const hasSpawned = (pd.an ? pd.an[p] > 0 : (pd.hN ? pd.hN[p] > 0 : false));
      if (!hasSpawned) continue;
      // Skip dead players
      if (pd.xR && pd.xR[p] === 2) continue;
      if (window.bD && window.bD.gv && typeof window.bD.gv.kH === "function" && window.bD.gv.kH(p)) continue;

      let x = -1;
      let y = -1;

      // Centroid from player bounding box (upstream: pd.oE/oF/oG/oH; legacy: pd.jS/jT/jU/jV)
      if (pd.oF && pd.oE && pd.oF[p] >= pd.oE[p] && pd.oE[p] > 0) {
        x = (pd.oE[p] + pd.oF[p]) >> 1;
        y = (pd.oG[p] + pd.oH[p]) >> 1;
      } else if (pd.jT && pd.jS && pd.jT[p] >= pd.jS[p] && pd.jS[p] > 0) {
        x = (pd.jS[p] + pd.jT[p]) >> 1;
        y = (pd.jU[p] + pd.jV[p]) >> 1;
      } else if (window.ag && window.ag.aLp && window.ag.aLp[p] > 0) {
        const lw = window.ag.aLr ? (window.ag.aLr[p] || 0) : 0;
        x = window.ag.aLp[p] + (lw >> 1);
        y = window.ag.aLq[p];
      }

      if (x > 0 && y > 0) {
        const pTeam = isTeam ? ((window.cD && window.cD.c1) ? window.cD.c1[p] : (window.bj && window.bj.fX ? window.bj.fX[p] : null)) : null;
        const isAlly = isTeam && myTeam !== null && pTeam !== null && pTeam === myTeam;
        const tileIdx = y * mapWidth + x;
        const compId = (landmassLabels && tileIdx >= 0 && tileIdx < landmassLabels.length) ? landmassLabels[tileIdx] : 0;
        spawns.push({ x, y, isAlly, compId });
      }
    }
    return spawns;
  }

  // 3. Local Land Expansion Density (Radius R = 22)
  function evaluateLocalDensity(cx, cy) {
    let landCount = 0;
    for (let i = 0; i < DENSITY_OFFSETS_R22.length; i++) {
      const nx = cx + DENSITY_OFFSETS_R22[i].dx;
      const ny = cy + DENSITY_OFFSETS_R22[i].dy;
      if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
        if (isLandTile((ny * mapWidth + nx) << 2)) {
          landCount++;
        }
      }
    }
    return landCount / DENSITY_OFFSETS_R22.length;
  }

  // 4. Unified Fitness Function (Exact parity between Macro & Micro scans)
  function evaluateFitness(x, y, spawns, isTeam, isZombie) {
    const idx = y * mapWidth + x;
    const compId = landmassLabels[idx];
    if (!validComponents.has(compId) || !isLandTile(idx << 2)) {
      return -Infinity;
    }

    const coastDist = waterDistTable[idx];

    // A. Contiguous Mass Priority Scalar (Strongly favors primary continental landmass)
    const compSize = componentSizes.get(compId) || 0;
    const massRatio = maxComponentSize > 0 ? (compSize / maxComponentSize) : 1;
    let score = 35.0 * (massRatio * massRatio);

    // B. Re-balanced Coastline Weighting (25-50 tile sweet spot)
    if (coastDist < 15) {
      score -= (15 - coastDist) * 12.0; // Sharp penalty: shoreline choke
    } else if (coastDist >= 25 && coastDist <= 50) {
      score += 20.0; // Optimal 360-degree opening + 40s naval access
    } else if (coastDist > 50 && coastDist <= 80) {
      score += 20.0 - (coastDist - 50) * 0.5;
    } else {
      score += 5.0 - (coastDist - 80) * 0.2; // Mild landlocked penalty
    }

    // C. Local Land Expansion Density (Choke/Peninsula Filter)
    const density = evaluateLocalDensity(x, y);
    if (density < 0.70) {
      score -= (0.70 - density) * 60.0;
    } else if (density >= 0.85) {
      score += 15.0;
    }

    // D. Geodesic & Component-Aware Human Repulsion
    let minEnemyDist = Infinity;
    let minAllyDist = Infinity;

    for (let i = 0; i < spawns.length; i++) {
      const sp = spawns[i];
      const sameLand = (sp.compId === compId);
      const rawDist = Math.hypot(x - sp.x, y - sp.y);
      // If across ocean, clamp distance to neutral horizon (120 tiles) to remove artificial island boosts
      const effectiveDist = sameLand ? rawDist : Math.max(rawDist, 120);

      if (sp.isAlly) {
        if (effectiveDist < minAllyDist) minAllyDist = effectiveDist;
      } else {
        if (effectiveDist < minEnemyDist) minEnemyDist = effectiveDist;
      }
    }

    // Enemy Scoring
    if (minEnemyDist !== Infinity) {
      if (minEnemyDist < 35) {
        score -= (35 - minEnemyDist) * 15.0; // Lethal early clash
      } else {
        score += Math.min(minEnemyDist, 150) * 0.5;
      }
    } else {
      score += 50.0;
    }

    // Ally Corridor Scoring (Team Mode)
    if (isTeam && minAllyDist !== Infinity) {
      if (minAllyDist < 45) {
        score -= (45 - minAllyDist) * 10.0; // Don't crowd teammates
      } else if (minAllyDist >= 60 && minAllyDist <= 110) {
        score += 25.0; // Optimal mutual expansion corridor
      } else if (minAllyDist > 110) {
        score += Math.max(0, 15.0 - (minAllyDist - 110) * 0.2);
      }
    }

    // Zombie Mode Specialty: Cluster near teammates, maximize distance to bots
    if (isZombie && minAllyDist !== Infinity && minAllyDist <= 80) {
      score += 30.0;
    }

    return score;
  }

  // 5. Hierarchical Search (Macro Delta = 10, Micro Delta = 1)
  function computeBestLocation() {
    if (!isMapAnalyzed && !analyzeMapTopology()) return;

    const spawns = getActiveSpawns();
    const g = (typeof dictionary !== 'undefined' && dictionary.game && window[dictionary.game]) ? window[dictionary.game] : (window.c || window.aE);
    const isZombie = (g && g.d === 9) || (g && g.lC === 9) || !!(g?.data?.isZombieMode);
    const isTeam = typeof getVar === 'function' ? !!getVar("gIsTeamGame") : !!(g && g.bJ);

    const macroStep = 10;
    let bestScore = -Infinity;
    let candidate = null;

    // Tier 1: Macro Grid Scan
    for (let y = 14; y < mapHeight - 14; y += macroStep) {
      for (let x = 14; x < mapWidth - 14; x += macroStep) {
        const score = evaluateFitness(x, y, spawns, isTeam, isZombie);
        if (score > bestScore) {
          bestScore = score;
          candidate = { x, y };
        }
      }
    }

    // Tier 2: Micro Scan (1x1 refinement around candidate)
    if (candidate) {
      let refinedBest = bestScore;
      let refinedCoord = { ...candidate };
      const range = macroStep;

      for (let dy = -range; dy <= range; dy++) {
        const ny = candidate.y + dy;
        if (ny <= 2 || ny >= mapHeight - 3) continue;

        for (let dx = -range; dx <= range; dx++) {
          const nx = candidate.x + dx;
          if (nx <= 2 || nx >= mapWidth - 3) continue;

          const score = evaluateFitness(nx, ny, spawns, isTeam, isZombie);
          if (score > refinedBest) {
            refinedBest = score;
            refinedCoord = { x: nx, y: ny };
          }
        }
      }
      targetTile = { x: refinedCoord.x, y: refinedCoord.y, valid: true };
    }
  }

  // 6. Lifecycle & Auto-Picker Execution
  this.update = function(context) {
    const settings = getSettings();
    if (!settings.spawnOptimizer && !settings.autoSpawnPicker) return;

    const g = context?.game || (typeof dictionary !== 'undefined' && dictionary.game && window[dictionary.game]) || window.c || window.aE;
    const isSingleplayer = (typeof getVar === 'function' ? getVar("gIsSingleplayer") : null) ?? (g ? !!g.aH : false);
    const isSelectableSpawn = Boolean((typeof getVar === 'function' ? getVar("gSelectableSpawn") : null) ?? (g ? g.ao : false));
    const gameState = (typeof getVar === 'function' ? getVar("gameState") : null) ?? (g ? (g.bH ?? g.gameState) : 0);

    // Autonomous match-boundary detection via unique spawning seed and state transition
    const bV = window.bV;
    const currentSpawningSeed = g && g.data && g.data.spawningSeed != null ? g.data.spawningSeed : 0;
    const currentMapSeed = (g && g.data && g.data.mapSeed != null) ? g.data.mapSeed : (bV && bV.mapSeed != null ? bV.mapSeed : 0);
    const matchToken = `${currentSpawningSeed}_${currentMapSeed}_${mapWidth}x${mapHeight}`;

    const isSpawningPhase = (!isSingleplayer && isSelectableSpawn && gameState === 1);

    // Detect transition into a new match spawning phase
    if (isSpawningPhase) {
      if (!wasInSpawningPhase || matchToken !== currentMatchToken) {
        this.reset();
        currentMatchToken = matchToken;
        wasInSpawningPhase = true;
      }
    } else {
      if (wasInSpawningPhase) {
        wasInSpawningPhase = false;
        targetTile.valid = false;
        currentLerp.initialized = false;
      }
      return;
    }

    // Check if player has placed their spawn
    const myId = (typeof getVar === 'function' ? getVar("playerId") : null) ?? (g ? g.t : 0);
    const pd = context?.playerData || (typeof dictionary !== 'undefined' && dictionary.playerData && window[dictionary.playerData]) || window.y || window.ah;
    const hasMySpawnPlaced = (pd && pd.an && pd.an[myId] > 0) || (pd && pd.hN && pd.hN[myId] > 0);
    if (hasMySpawnPlaced) {
      userOverridden = true;
      return;
    }

    const now = performance.now();
    const activeSpawns = getActiveSpawns();
    const posHash = activeSpawns.map(s => `${s.x},${s.y}`).join("|");

    if (posHash !== lastPlayerPositionsHash || now - lastEvalTime > 250 || !targetTile.valid) {
      lastPlayerPositionsHash = posHash;
      lastEvalTime = now;
      computeBestLocation();
    }

    // Auto-Picker Execution (<= 1.2s before countdown expiry)
    if (settings.autoSpawnPicker && !userOverridden && targetTile.valid) {
      const totalTicks = (g && typeof g.bk === "number") ? g.bk : ((g && typeof g.a6g === "number") ? g.a6g : 30);
      const currentTick = (window.bc && window.bc.yR && typeof window.bc.yR.sS === "number") ? window.bc.yR.sS :
                          ((window.bi && window.bi.a2Q && typeof window.bi.a2Q.aIr === "number") ? window.bi.a2Q.aIr : 0);
      const ticksRemaining = Math.max(0, totalTicks - currentTick);
      const timeRemainingMs = ticksRemaining * 392;

      if (timeRemainingMs <= 1200 && timeRemainingMs > 0) {
        this.dispatchSpawnSelection(targetTile.x, targetTile.y);
        userOverridden = true;
      }
    }
  };

  this.dispatchSpawnSelection = function(tileX, tileY) {
    const tileIdx = tileY * mapWidth + tileX;
    if (window.ss && window.ss.a1M && typeof window.ss.a1M.xm === "function") {
      try { window.ss.a1M.xm(tileIdx); } catch(e) {}
    } else if (window.bB && window.bB.hz && typeof window.bB.hz.i0 === "function") {
      try { window.bB.hz.i0(tileIdx); } catch(e) {}
    }
    const canvas = document.getElementById("canvasA");
    if (canvas) {
      const ox = (window.gd && typeof window.gd.g7 === "function") ? window.gd.g7() : (window.aT && typeof window.aT.a0L === "function" ? window.aT.a0L() : 0);
      const oy = (window.gd && typeof window.gd.g8 === "function") ? window.gd.g8() : (window.aT && typeof window.aT.a0M === "function" ? window.aT.a0M() : 0);
      const zoom = (typeof window.fu === "number") ? window.fu : (window.__TERRIX_LAST_CTX__?.im || 1.0);
      const screenX = (tileX + ox) * zoom;
      const screenY = (tileY + oy) * zoom;
      const rect = canvas.getBoundingClientRect();
      if (typeof MouseEvent !== "undefined") {
        const opts = { bubbles: true, cancelable: true, clientX: rect.left + screenX, clientY: rect.top + screenY, button: 0 };
        canvas.dispatchEvent(new MouseEvent("mousedown", opts));
        canvas.dispatchEvent(new MouseEvent("mouseup", opts));
        canvas.dispatchEvent(new MouseEvent("click", opts));
      }
    }
  };

  // 7. Kinematic LERP Animation Rendering (lambda = 14.0)
  this.render = function(context) {
    if (!getSettings().spawnOptimizer || !targetTile.valid || userOverridden) return;

    const ws = context.ws;
    if (!ws || !ws.canvas) return;

    const zoom = (typeof context.im === "number") ? context.im : ((typeof window.fu === "number") ? window.fu : 1.0);
    const ox = context.offsetX !== undefined ? context.offsetX : ((window.gd && typeof window.gd.g7 === "function") ? window.gd.g7() : (window.aT ? window.aT.a0L() : 0));
    const oy = context.offsetY !== undefined ? context.offsetY : ((window.gd && typeof window.gd.g8 === "function") ? window.gd.g8() : (window.aT ? window.aT.a0M() : 0));

    const now = performance.now();
    const dt = lastRenderTime > 0 ? Math.min((now - lastRenderTime) / 1000, 0.1) : 0.016;
    lastRenderTime = now;

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

    const isTeam = typeof getVar === 'function' ? !!getVar("gIsTeamGame") : false;
    const primaryColor = isTeam ? "rgba(255, 215, 0, 0.9)" : "rgba(0, 240, 255, 0.9)";
    const glowColor = isTeam ? "rgba(255, 215, 0, 0.25)" : "rgba(0, 240, 255, 0.25)";

    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius * 1.35, 0, 2 * Math.PI);
    ws.fillStyle = glowColor;
    ws.fill();

    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius, time, time + Math.PI * 1.5);
    ws.strokeStyle = primaryColor;
    ws.lineWidth = 2.5;
    ws.stroke();

    ws.beginPath();
    ws.arc(screenX, screenY, outerRadius * 0.72, -time * 1.5, -time * 1.5 + Math.PI);
    ws.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ws.lineWidth = 1.5;
    ws.stroke();

    ws.beginPath();
    ws.arc(screenX, screenY, innerRadius, 0, 2 * Math.PI);
    ws.fillStyle = "#ffffff";
    ws.fill();

    ws.font = "bold 11px sans-serif";
    ws.textAlign = "center";
    ws.fillStyle = primaryColor;
    ws.shadowColor = "#000000";
    ws.shadowBlur = 4;
    ws.fillText("OPTIMAL SPAWN", screenX, screenY - outerRadius - 6);

    ws.restore();
  };

  this.registerUserOverride = function() {
    userOverridden = true;
  };
})();
