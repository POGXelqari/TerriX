/**
 * PoC 3: Map Geometry & Spawn Location ESP (Information Disclosure)
 * Targets: Match State Unpacker (aXF) & Spawning Seed in Territorial.io
 *
 * Vulnerability:
 * Territorial.io does not perform server-side Fog of War culling during the spawning
 * phase. In `aXF`, the server transmits the complete match configuration:
 *   - rC.spawningSeed: 14-bit PRNG seed for all bot/neutral placements
 *   - rC.spawningData: Array of initial spawn coordinates (1024 slots)
 *   - rC.colorsData: Color identities and player assignments
 *
 * By intercepting this structure before the first tick, an automated client
 * can calculate every opponent's coordinate, neutral density clusters, and
 * optimal starting centroids with zero reconnaissance.
 */

// Simulated aXF Spawning Data Parser
class SpawnDataInspector {
    constructor() {
        this.players = [];
        this.neutralClusters = [];
    }

    parseMatchInitPacket(spawningSeed, rawSpawningArray, playerCount) {
        console.log(`[*] Received Spawning Seed: 0x${spawningSeed.toString(16)}`);
        console.log(`[*] Total Declared Players: ${playerCount}`);

        for (let i = 0; i < playerCount; i++) {
            const packedCoord = rawSpawningArray[i];
            const x = packedCoord & 0x7FF; // 11 bits for X
            const y = (packedCoord >> 11) & 0x7FF; // 11 bits for Y
            
            this.players.push({
                playerId: i,
                isLocal: i === 0,
                coordinates: { x, y },
                densityRiskScore: (x * y) % 100 // Simulated regional density calculation
            });
        }
        return this.players;
    }

    identifyOptimalExpansionVector(localPlayerId) {
        const local = this.players.find(p => p.playerId === localPlayerId);
        if (!local) return null;

        // Calculate distance to all threats before the round starts
        const threats = this.players
            .filter(p => p.playerId !== localPlayerId)
            .map(p => {
                const dist = Math.hypot(p.coordinates.x - local.coordinates.x, p.coordinates.y - local.coordinates.y);
                return { playerId: p.playerId, distance: Math.round(dist), coordinates: p.coordinates };
            })
            .sort((a, b) => a.distance - b.distance);

        return {
            localSpawn: local.coordinates,
            nearestEnemy: threats[0],
            safeExpansionCorridor: {
                recommendedHeadingDeg: Math.round((Math.atan2(-threats[0].coordinates.y + local.coordinates.y, -threats[0].coordinates.x + local.coordinates.x) * 180) / Math.PI)
            }
        };
    }
}

// Verification Harness
const inspector = new SpawnDataInspector();
const mockSpawningArray = new Uint32Array([
    (512 << 11) | 350,   // Local player: x=350, y=512
    (520 << 11) | 390,   // Enemy 1: x=390, y=520 (Close neighbor!)
    (100 << 11) | 900,   // Enemy 2: x=900, y=100
    (800 << 11) | 1200   // Enemy 3: x=1200, y=800
]);

const players = inspector.parseMatchInitPacket(14071, mockSpawningArray, 4);
console.log("\n[+] De-anonymized Spawn Map Extracted:");
players.forEach(p => console.log(`  Player ${p.playerId} ${p.isLocal ? '(Self)' : '(Opponent)'}: X=${p.coordinates.x}, Y=${p.coordinates.y}`));

const telemetry = inspector.identifyOptimalExpansionVector(0);
console.log("\n[+] Pre-computed Tactical Trajectory:");
console.log(`  Nearest Threat: Player ${telemetry.nearestEnemy.playerId} at distance ${telemetry.nearestEnemy.distance}px`);
console.log(`  Expansion Vector: ${telemetry.safeExpansionCorridor.recommendedHeadingDeg}° (Away from immediate conflict zone)`);
