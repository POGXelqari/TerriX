/**
 * PoC 2: Client-Side Attack Throttle & Stamina Bypass
 * Targets: Rate Limiting Module (Class cZ / instance ao) in Territorial.io
 *
 * Vulnerability & Logic Flaw:
 * In Territorial.io, attack rate limiting (the 15-point stamina pool) is computed
 * and enforced strictly client-side inside `cZ.prototype.eh` and `cZ.prototype.i5`:
 *
 *   if (aMa[a7y] + aMf(a7y, aMd) > aMb) return false;
 *
 * If this client validation is bypassed (or hooked in memory), the client's internal
 * action dispatcher `bB.pi.qT(1, target, troopShare, ...)` can queue micro-attacks
 * on every single tick, circumventing human click cooldowns and dominating border friction.
 */

// Simulated Client State
const mockGameEngine = {
    currentTick: 120,
    localPlayerId: 1,
    troopCount: 500000,
    enemyPlayerId: 2,

    // Original Rate Limiter implementation from game.js (cZ)
    rateLimiter: {
        attackAccumulator: new Uint16Array(512),
        staminaLimit: 15,
        
        costFunction: function(targetId, ratio) {
            // Approximated from aMf in game.js
            return Math.floor(2 + (100 * ratio) / 10);
        },

        isAllowed: function(targetId, ratio) {
            const cost = this.costFunction(targetId, ratio);
            if (this.attackAccumulator[targetId] + cost > this.staminaLimit) {
                return false; // Throttled!
            }
            this.attackAccumulator[targetId] += cost;
            return true;
        }
    },

    // Action Queue
    actionQueue: [],

    // Standard Attack Handler
    standardAttack: function(targetId, ratio) {
        if (!this.rateLimiter.isAllowed(targetId, ratio)) {
            return { status: "REJECTED_BY_RATE_LIMITER", target: targetId };
        }
        const action = { opcode: 1, target: targetId, ratio: ratio, tick: this.currentTick };
        this.actionQueue.push(action);
        return { status: "QUEUED", action };
    },

    // Exploited Attack Handler (Circumventing Client Controls)
    automatedUnthrottledAttack: function(targetId, ratio) {
        // Direct injection into action dispatcher, ignoring rateLimiter.isAllowed()
        const action = { opcode: 1, target: targetId, ratio: ratio, tick: this.currentTick };
        this.actionQueue.push(action);
        return { status: "BYPASS_QUEUED", action };
    }
};

console.log("=== Testing Client Rate Limiter vs Unthrottled Attack Injection ===");

console.log("\n[*] 1. Standard UI Player attempting 5 rapid consecutive 20% attacks:");
for (let i = 1; i <= 5; i++) {
    const res = mockGameEngine.standardAttack(2, 0.20);
    console.log(`  Attack ${i}: Result = ${res.status}`);
}

console.log("\n[*] 2. Bypassing Client Throttle Hook:");
for (let i = 1; i <= 5; i++) {
    const res = mockGameEngine.automatedUnthrottledAttack(2, 0.05);
    console.log(`  Rapid Micro-Attack ${i}: Result = ${res.status} (Dispatched at tick ${res.action.tick})`);
}

console.log(`\n[+] Total actions queued for transmission: ${mockGameEngine.actionQueue.length}`);
console.log("[!] Architectural Finding: Rate limit checks exist solely on client input validation.");
