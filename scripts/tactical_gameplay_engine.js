/**
 * TerriX Autonomous Gameplay Engine - Tactical Spawn Optimizer & Autonomous Agent
 * Direct reverse-engineered integration with Territorial.io core engine.
 */
(() => {
    if (window.__terrix_agent_initialized) {
        console.log("[TerriX] Tactical Engine already active.");
        return;
    }
    window.__terrix_agent_initialized = true;

    console.log("[TerriX] Tactical Gameplay Engine v2.0 initializing...");

    class TerriXSpawnOptimizer {
        constructor() {
            this.engine = window.__terrix_engine || {};
            this.activeSpawn = null;
            this.spawnLockTime = null;
            this.lastEvaluationTime = 0;
            this.relocationCount = 0;
            this.candidateCache = null;
        }

        get e() {
            return window.__terrix_engine || {};
        }

        isReady() {
            const { aE, ad, bP, bV, bB, bu, ah } = this.e;
            return !!(aE && ad && bP && bV && bB && bu && ah);
        }

        isSpawnPhase() {
            if (!this.isReady()) return false;
            const aE = this.e.aE;
            return aE.a1N === 1 && !!aE.hp;
        }

        hasCommittedSpawn() {
            if (!this.isReady()) return false;
            const { aE, ah } = this.e;
            return ah.hF[aE.fB] > 0;
        }

        /**
         * Scans all other players to extract confirmed spawn locations and teams.
         */
        getOccupiedSpawns() {
            const { aE, ah, bj } = this.e;
            const enemies = [];
            const teammates = [];
            const myPlayerId = aE.fB;
            const isTeamGame = !!aE.iL;
            const myTeam = isTeamGame ? bj.fP[myPlayerId] : -1;
            const totalPlayers = aE.km || 0;

            for (let p = 0; p < totalPlayers; p++) {
                if (p === myPlayerId) continue;
                if (ah.nM[p] === 0 || ah.hF[p] === 0) continue;

                const cx = (ah.jK[p] + ah.jL[p]) / 2;
                const cy = (ah.jM[p] + ah.jN[p]) / 2;
                const pTeam = isTeamGame ? bj.fP[p] : -2;

                const spawnObj = {
                    playerId: p,
                    name: ah.a23[p] || `Player_${p}`,
                    x: cx,
                    y: cy,
                    team: pTeam,
                    isTeammate: isTeamGame && pTeam === myTeam && myTeam !== 0
                };

                if (spawnObj.isTeammate) {
                    teammates.push(spawnObj);
                } else {
                    enemies.push(spawnObj);
                }
            }

            return { enemies, teammates };
        }

        /**
         * Evaluates mathematical strategic fitness score of coordinate (x, y).
         */
        evaluateCandidate(x, y, enemies, teammates, swarmSpawns) {
            const { ad, bP, bV } = this.e;
            const w = bV.fc;
            const h = bV.fd;

            // Strict boundary safety margin
            if (x < 35 || x > w - 35 || y < 35 || y > h - 35) {
                return -999999;
            }

            const f5 = bP.j8(x, y);
            // Must be neutral land
            if (!ad.fI(f5)) return -999999;

            let score = 0;

            // 1. Territory Expansion Potential (Multi-Ring Concentric Sampling)
            const radii = [25, 55, 95, 145];
            const angles = 8;
            let neutralCount = 0;
            let obstaclePenalty = 0;

            for (const r of radii) {
                const weight = 1.0 / Math.sqrt(r);
                for (let a = 0; a < angles; a++) {
                    const theta = (a * 2 * Math.PI) / angles;
                    const sx = Math.round(x + r * Math.cos(theta));
                    const sy = Math.round(y + r * Math.sin(theta));

                    if (sx <= 0 || sx >= w - 1 || sy <= 0 || sy >= h - 1) {
                        obstaclePenalty += 0.5 * weight;
                        continue;
                    }

                    const sampleF5 = bP.j8(sx, sy);
                    if (ad.fI(sampleF5)) {
                        neutralCount += 1.0 * weight;
                    } else if (ad.y4(sampleF5)) {
                        // Mountain - blocks expansion path
                        obstaclePenalty += 2.0 * weight;
                    } else if (ad.ih(sampleF5)) {
                        // Water/Ocean
                        obstaclePenalty += 0.4 * weight;
                    }
                }
            }

            score += (neutralCount * 65.0) - (obstaclePenalty * 45.0);

            // 2. Enemy Separation / Threat Clearance
            const D_SAFE = 180.0;
            const D_LETHAL = 80.0;

            for (const e of enemies) {
                const dx = x - e.x;
                const dy = y - e.y;
                const dist = Math.hypot(dx, dy);

                if (dist < D_LETHAL) {
                    // Lethal proximity: imminent early war destruction
                    return -999999;
                } else if (dist < D_SAFE) {
                    const factor = (D_SAFE - dist) / D_SAFE;
                    score -= (factor * factor) * 2500.0;
                }
            }

            // 3. Flank / Defensive Coastline Bonus (Corner & Peninsula Meta)
            // Having water/border behind protects one flank and allows forward focus
            const cardinalOffsets = [
                { dx: 0, dy: -60 }, { dx: 0, dy: 60 },
                { dx: -60, dy: 0 }, { dx: 60, dy: 0 }
            ];
            let waterFlanks = 0;
            let landFlanks = 0;
            for (const off of cardinalOffsets) {
                const cx = x + off.dx;
                const cy = y + off.dy;
                if (cx <= 5 || cx >= w - 5 || cy <= 5 || cy >= h - 5) {
                    waterFlanks++;
                } else {
                    const cf5 = bP.j8(cx, cy);
                    if (ad.ih(cf5)) waterFlanks++;
                    else if (ad.fI(cf5)) landFlanks++;
                }
            }

            if (waterFlanks >= 1 && waterFlanks <= 2 && landFlanks >= 2) {
                score += 350.0; // Protected flank with forward expansion
            }

            // 4. Teammate Synergy (Team Mode)
            for (const tm of teammates) {
                const dist = Math.hypot(x - tm.x, y - tm.y);
                if (dist < 85.0) {
                    // Too close: starves both of land
                    score -= 800.0;
                } else if (dist >= 110.0 && dist <= 260.0) {
                    // Synergistic front line
                    score += 450.0;
                }
            }

            // 5. Swarm Coordination (Preventing TerriX bots from crowding each other)
            if (swarmSpawns && swarmSpawns.length > 0) {
                for (const sw of swarmSpawns) {
                    const dist = Math.hypot(x - sw.x, y - sw.y);
                    if (dist < 180.0) {
                        score -= 5000.0; // Strongly force swarm to claim separate sectors
                    }
                }
            }

            return score;
        }

        /**
         * Generates candidate sampling grid and computes the optimal spawn location.
         */
        findOptimalSpawn(swarmSpawns = []) {
            if (!this.isReady()) return null;

            const { bV, bP, bu } = this.e;
            const w = bV.fc;
            const h = bV.fd;
            const { enemies, teammates } = this.getOccupiedSpawns();

            const step = 20; // 20px sampling grid
            let bestScore = -Infinity;
            let bestCoord = null;

            // Generate candidates
            for (let y = 40; y < h - 40; y += step) {
                for (let x = 40; x < w - 40; x += step) {
                    const fD = bP.fo(x, y);
                    if (bu.hq(fD) === -1) continue;

                    const score = this.evaluateCandidate(x, y, enemies, teammates, swarmSpawns);
                    if (score > bestScore) {
                        bestScore = score;
                        bestCoord = { x, y, fD, score };
                    }
                }
            }

            // Local fine refinement (4px step around top candidate)
            if (bestCoord && bestScore > -50000) {
                const fineRadius = 16;
                const fineStep = 4;
                for (let fy = bestCoord.y - fineRadius; fy <= bestCoord.y + fineRadius; fy += fineStep) {
                    for (let fx = bestCoord.x - fineRadius; fx <= bestCoord.x + fineRadius; fx += fineStep) {
                        if (fx <= 30 || fx >= w - 30 || fy <= 30 || fy >= h - 30) continue;
                        const fD = bP.fo(fx, fy);
                        if (bu.hq(fD) === -1) continue;

                        const score = this.evaluateCandidate(fx, fy, enemies, teammates, swarmSpawns);
                        if (score > bestScore) {
                            bestScore = score;
                            bestCoord = { x: fx, y: fy, fD, score };
                        }
                    }
                }
            }

            return bestCoord;
        }

        /**
         * Commits spawn choice directly into the game engine and network layer.
         */
        commitSpawn(coord) {
            if (!this.isReady() || !coord) return false;
            const { bB, bP } = this.e;

            console.log(`[TerriX] Committing Spawn at (${coord.x}, ${coord.y}) [Tile fD: ${coord.fD}, Score: ${coord.score.toFixed(1)}]`);
            
            // 1. Direct engine dispatch (triggers b1.pm.pn network packet + local registration)
            bB.hr.hs(coord.fD);

            this.activeSpawn = coord;
            this.spawnLockTime = performance.now();
            window.__terrix_active_spawn = coord;
            return true;
        }

        /**
         * Checks if an opponent counter-spawned too close and relocates if necessary.
         */
        checkCounterSpawnThreat() {
            if (!this.activeSpawn) return;
            const { enemies } = this.getOccupiedSpawns();
            const { x, y } = this.activeSpawn;

            for (const e of enemies) {
                const dist = Math.hypot(x - e.x, y - e.y);
                if (dist < 80.0) {
                    console.warn(`[TerriX Alert] Enemy '${e.name}' counter-spawned too close (${dist.toFixed(1)}px)! Relocating...`);
                    const newSpawn = this.findOptimalSpawn(window.__terrix_swarm_spawns || []);
                    if (newSpawn && newSpawn.fD !== this.activeSpawn.fD) {
                        this.relocationCount++;
                        this.commitSpawn(newSpawn);
                        return true;
                    }
                }
            }
            return false;
        }
    }

    /**
     * TerriX Opening Land Rush & Tactical Expansion Engine
     * Governs early game expansion, compound interest curve preservation,
     * slider management, and transition to mid-game consolidation.
     */
    class TerriXExpansionEngine {
        constructor() {
            this.lastAttackTime = 0;
            this.attackCount = 0;
            this.expansionPhase = "OPENING_RUSH"; // "OPENING_RUSH" | "CONSOLIDATION" | "MID_GAME"
            this.targetSliderRatio = 0.22; // 22% default opening burst
            this.minTroopsThreshold = 180; // Minimum troops before bursting to prevent stalling interest
            this.attackIntervalMs = 1600; // Attack rhythm aligned with interest cycle (~1.6s)
            this.peakPixels = 0;
            this.startMatchTime = 0;
        }

        get e() {
            return window.__terrix_engine || {};
        }

        isReady() {
            const { aE, ah, bB } = this.e;
            return !!(aE && ah && bB && bB.hr);
        }

        isActiveMatch() {
            if (!this.isReady()) return false;
            const { aE, ah } = this.e;
            const myId = aE.fB;
            return aE.a1N === 1 && !aE.hp && ah.nM && ah.nM[myId] !== 0 && ah.hF && ah.hF[myId] > 0;
        }

        getMyState() {
            if (!this.isActiveMatch()) return null;
            const { aE, ah, bv, bj } = this.e;
            const myId = aE.fB;
            const pixels = ah.hF[myId] || 0;
            if (pixels > this.peakPixels) this.peakPixels = pixels;

            return {
                playerId: myId,
                pixels: pixels,
                peakPixels: this.peakPixels,
                troops: (ah.hT && ah.hT[myId]) || 0,
                hasNeutralFrontier: (bv && typeof bv.hx === "function") ? bv.hx(myId) : true,
                team: (bj && bj.fP) ? bj.fP[myId] : -1,
                attackCount: this.attackCount,
                phase: this.expansionPhase
            };
        }

        /**
         * Core tactical expansion tick:
         * 1. Monitors interest curve (never over-attacks below threshold)
         * 2. Adjusts slider percentage dynamically (20% - 25%)
         * 3. Dispatches expansion bursts into neutral land
         * 4. Automatically detects frontier depletion and transitions to mid-game
         */
        tickExpansion() {
            const state = this.getMyState();
            if (!state) return;

            if (this.startMatchTime === 0) {
                this.startMatchTime = performance.now();
            }

            const now = performance.now();
            if (now - this.lastAttackTime < this.attackIntervalMs) return;

            const { aE, bB } = this.e;

            // Phase 1: Opening Land Rush (Neutral Land Available)
            if (state.hasNeutralFrontier) {
                this.expansionPhase = "OPENING_RUSH";

                // Guard: preserve compound interest curve
                if (state.troops < this.minTroopsThreshold) {
                    return; // Hold troops to let interest compound
                }

                // Dynamic slider ratio calculation
                let ratio = this.targetSliderRatio; // default 0.22 (22%)
                if (state.troops > 4000) {
                    ratio = 0.25; // 25% if rich in troops
                } else if (state.troops < 500) {
                    ratio = 0.20; // 20% conservative expansion
                }

                // Convert ratio (0.0 - 1.0) to game engine 10-bit integer (0 - 1023)
                const sliderInt = Math.min(1023, Math.max(0, Math.floor(ratio * 1024 + 0.5) - 1));

                // Dispatch expansion attack into neutral land (aE.fO = 512 = neutral faction ID)
                bB.hr.hy(sliderInt, aE.fO);
                this.lastAttackTime = now;
                this.attackCount++;

                console.log(`[TerriX Expansion #${this.attackCount}] Dispatched ${Math.round(ratio * 100)}% attack (${sliderInt}) into Neutral Land. Pixels: ${state.pixels}, Troops: ${state.troops}`);
            } else {
                // Phase 2: Frontier Exhaustion / Mid-Game Transition
                if (this.expansionPhase === "OPENING_RUSH") {
                    this.expansionPhase = "MID_GAME_CONSOLIDATION";
                    console.log(`[TerriX Expansion] Opening Land Rush complete! All contiguous neutral land claimed. Pixels: ${state.pixels}. Transitioning to Consolidation & Player Border Management.`);
                }
            }
        }
    }

    // Register Classes on Window
    window.TerriXSpawnOptimizer = TerriXSpawnOptimizer;
    window.TerriXExpansionEngine = TerriXExpansionEngine;
    window.__terrix_optimizer = new TerriXSpawnOptimizer();
    window.__terrix_expansion = new TerriXExpansionEngine();

    let agentTick = 0;
    let spawnPhaseDetected = false;
    let spawnPhaseStartTime = 0;

    setInterval(() => {
        const opt = window.__terrix_optimizer;
        const exp = window.__terrix_expansion;
        if (!opt || !opt.isReady()) return;

        const isSpawning = opt.isSpawnPhase();

        if (isSpawning) {
            if (!spawnPhaseDetected) {
                spawnPhaseDetected = true;
                spawnPhaseStartTime = performance.now();
                console.log("[TerriX] Match loaded! Spawn selection phase ACTIVE.");
            }

            const elapsedSec = (performance.now() - spawnPhaseStartTime) / 1000.0;
            const hasSpawn = opt.hasCommittedSpawn();

            // Initial commit: wait 1.5s for early players to reveal locations, then lock optimal spawn
            if (!hasSpawn && elapsedSec >= 1.5) {
                const optimal = opt.findOptimalSpawn(window.__terrix_swarm_spawns || []);
                if (optimal) {
                    opt.commitSpawn(optimal);
                }
            }

            // Dynamic counter-spawn defense (re-evaluates if enemy counter-spawns nearby)
            if (hasSpawn && elapsedSec >= 2.5 && elapsedSec <= 35.0) {
                agentTick++;
                if (agentTick % 4 === 0) {
                    opt.checkCounterSpawnThreat();
                }
            }

            // Hard deadline watchdog (guarantees spawn before time is up)
            if (!hasSpawn && elapsedSec >= 22.0) {
                console.warn("[TerriX Failsafe] Hard deadline watchdog triggered! Forcing immediate spawn...");
                const emergencySpawn = opt.findOptimalSpawn([]);
                if (emergencySpawn) {
                    opt.commitSpawn(emergencySpawn);
                }
            }
        } else {
            if (spawnPhaseDetected) {
                console.log("[TerriX] Spawn phase concluded. Transitioning to Active Match Expansion Phase.");
                spawnPhaseDetected = false;
            }

            // Active match expansion engine execution
            if (exp && exp.isActiveMatch()) {
                exp.tickExpansion();
            }
        }
    }, 150);

    console.log("[TerriX] Tactical Engine successfully initialized and armed.");
})();
