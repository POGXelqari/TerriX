/**
 * TerriX Scenario Studio - Interactive Spawn Placer & Auto-Distributor
 * Distributes player/bot spawns across valid landmasses using electrostatic repulsion and team clustering.
 */

export class SpawnPlacer {
  constructor(width, height, validator) {
    this.width = width;
    this.height = height;
    this.validator = validator;
  }

  /**
   * Distributes N spawns evenly across valid land tiles using electrostatic repulsion relaxation.
   */
  distributeEvenly(playerCount = 512, iterations = 8) {
    const w = this.width;
    const h = this.height;
    const validLand = [];

    // Collect all valid land indices
    for (let y = 4; y < h - 4; y += 2) {
      for (let x = 4; x < w - 4; x += 2) {
        if (this.validator.isLand(x, y)) {
          validLand.push({ x, y });
        }
      }
    }

    if (validLand.length < playerCount) {
      console.warn("[SpawnPlacer] Insufficient land tiles for full player distribution");
      return new Uint16Array(playerCount * 2);
    }

    // Initial random placement from land pool
    const spawns = [];
    const step = Math.floor(validLand.length / playerCount);
    for (let i = 0; i < playerCount; i++) {
      const idx = (i * step) % validLand.length;
      spawns.push({ x: validLand[idx].x, y: validLand[idx].y });
    }

    // Electrostatic repulsion iterations
    for (let iter = 0; iter < iterations; iter++) {
      const forces = spawns.map(() => ({ fx: 0, fy: 0 }));

      for (let i = 0; i < playerCount; i++) {
        for (let j = i + 1; j < playerCount; j++) {
          const dx = spawns[i].x - spawns[j].x;
          const dy = spawns[i].y - spawns[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < 160000) { // Interaction radius ~400px
            const dist = Math.sqrt(distSq);
            const force = 1000 / (distSq + 25);
            const ux = dx / dist;
            const uy = dy / dist;

            forces[i].fx += ux * force;
            forces[i].fy += uy * force;
            forces[j].fx -= ux * force;
            forces[j].fy -= uy * force;
          }
        }
      }

      // Apply forces and snap to nearest valid land tile
      for (let i = 0; i < playerCount; i++) {
        const nx = Math.max(2, Math.min(w - 3, Math.round(spawns[i].x + forces[i].fx)));
        const ny = Math.max(2, Math.min(h - 3, Math.round(spawns[i].y + forces[i].fy)));

        if (this.validator.isLand(nx, ny)) {
          spawns[i].x = nx;
          spawns[i].y = ny;
        }
      }
    }

    // Pack into Uint16Array [x0, y0, x1, y1, ...]
    const out = new Uint16Array(playerCount * 2);
    for (let i = 0; i < playerCount; i++) {
      out[i * 2] = spawns[i].x;
      out[i * 2 + 1] = spawns[i].y;
    }
    return out;
  }

  /**
   * Distributes spawns by clustering allied teammates together while separating opposing teams.
   */
  distributeTeamClustered(teamPlayerCounts = [0, 256, 256], clusterRadius = 80) {
    const w = this.width;
    const h = this.height;
    const totalPlayers = teamPlayerCounts.reduce((a, b) => a + b, 0);
    const out = new Uint16Array(totalPlayers * 2);

    // Identify active teams
    const activeTeams = [];
    for (let t = 1; t < teamPlayerCounts.length; t++) {
      if (teamPlayerCounts[t] > 0) activeTeams.push({ team: t, count: teamPlayerCounts[t] });
    }

    if (activeTeams.length === 0) {
      return this.distributeEvenly(totalPlayers);
    }

    // Pick team anchor centers widely separated across map quadrants
    const anchors = [];
    const angleStep = (Math.PI * 2) / activeTeams.length;
    const mapCenter = { x: w / 2, y: h / 2 };
    const orbitRadius = Math.min(w, h) * 0.32;

    for (let i = 0; i < activeTeams.length; i++) {
      const angle = i * angleStep;
      let ax = Math.round(mapCenter.x + Math.cos(angle) * orbitRadius);
      let ay = Math.round(mapCenter.y + Math.sin(angle) * orbitRadius);

      // Spiral search for closest land tile
      if (!this.validator.isLand(ax, ay)) {
        let found = false;
        for (let r = 5; r < 300; r += 8) {
          for (let a = 0; a < Math.PI * 2; a += 0.4) {
            const sx = Math.round(ax + Math.cos(a) * r);
            const sy = Math.round(ay + Math.sin(a) * r);
            if (this.validator.isLand(sx, sy)) {
              ax = sx;
              ay = sy;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
      anchors.push({ x: ax, y: ay });
    }

    // Place team members around their team anchor
    let pIdx = 0;
    for (let t = 0; t < activeTeams.length; t++) {
      const anchor = anchors[t];
      const count = activeTeams[t].count;

      for (let i = 0; i < count; i++) {
        let px = anchor.x;
        let py = anchor.y;

        // Spread in circle around anchor
        const r = Math.sqrt((i + 1) / count) * clusterRadius;
        const theta = i * 2.39996; // Golden angle
        const testX = Math.round(anchor.x + Math.cos(theta) * r);
        const testY = Math.round(anchor.y + Math.sin(theta) * r);

        if (this.validator.isLand(testX, testY)) {
          px = testX;
          py = testY;
        }

        out[pIdx * 2] = px;
        out[pIdx * 2 + 1] = py;
        pIdx++;
      }
    }

    return out;
  }
}
