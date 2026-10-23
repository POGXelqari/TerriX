// tests/verify-features.js
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8092;
const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), 'build', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end();
    }
    const ext = path.extname(filePath);
    const mimeMap = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.avif': 'image/avif',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

async function runFeatureVerification() {
    await new Promise(resolve => server.listen(PORT, resolve));
    console.log(`[FeatureTest] Server listening on http://localhost:${PORT}`);

    const browser = await chromium.launch({
        headless: true,
        args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox']
    });

    const page = await browser.newPage();
    const runtimeErrors = [];

    page.on('pageerror', err => {
        console.error('[PageError]', err.message);
        runtimeErrors.push(err.message);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('[ConsoleError]', msg.text());
            runtimeErrors.push(msg.text());
        }
    });

    try {
        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForFunction(() => window.__fx && window.__fx.spawnOptimizer, { timeout: 8000 });

        // 1. Verify getVar property mapping
        const varChecks = await page.evaluate(() => {
            const getVar = window.__fx.getVar;
            return {
                hasGetVar: typeof getVar === 'function',
                hasPlayerNames: typeof dictionary.playerNames === 'string',
                hasPlayerStates: typeof dictionary.playerStates === 'string',
                hasGBots: typeof dictionary.gBots === 'string',
                hasGMaxPlayers: typeof dictionary.gMaxPlayers === 'string',
                hasGGameType: typeof dictionary.gGameType === 'string',
                hasSelectableSpawn: typeof dictionary.gSelectableSpawn === 'string'
            };
        });

        console.log('[FeatureTest] Var mapping checks:', JSON.stringify(varChecks));
        if (!varChecks.hasPlayerNames || !varChecks.hasPlayerStates || !varChecks.hasGBots || !varChecks.hasGMaxPlayers) {
            throw new Error('[FeatureTest] getVar dictionary mapping incomplete!');
        }

        // 2. Verify Spawn Optimizer & Auto-Picker in runtime context
        const optimizerResult = await page.evaluate(() => {
            const opt = window.__fx.spawnOptimizer;
            if (!opt) return { valid: false, reason: "spawnOptimizer not found on __fx" };

            // Mock minimal engine frame context
            const canvas = document.getElementById("canvasA") || document.createElement("canvas");
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext("2d");

            // Mock selectable spawn game state
            const mockGame = {
                bH: 1, // Spawning phase
                ao: true, // Selectable spawn
                aI: 2, // 2 humans
                aH: false,
                t: 0, // Player ID
                bk: 30, // Total countdown ticks
                data: { spawningSeed: 12345, mapSeed: 67890 }
            };

            const mockPlayerData = {
                an: new Uint8Array(512),
                xR: new Uint8Array(512),
                aO: new Uint32Array(512),
                oE: new Uint16Array(512),
                oG: new Uint16Array(512),
                oF: new Uint16Array(512),
                oH: new Uint16Array(512)
            };

            // Inject into window global scope for engine parity
            window.c = mockGame;
            window.y = mockPlayerData;
            window.gW = {
                gX: 100,
                gY: 100,
                u3: new Uint8ClampedArray(100 * 100 * 4) // RGBA
            };
            // Fill land: R=100, G=200, B=50 (green land)
            for (let i = 0; i < 100 * 100 * 4; i += 4) {
                window.gW.u3[i] = 100;
                window.gW.u3[i + 1] = 200;
                window.gW.u3[i + 2] = 50;
                window.gW.u3[i + 3] = 255;
            }

            // Fill water border (Blue > Red && Blue > Green)
            for (let x = 0; x < 100; x++) {
                const idx = (0 * 100 + x) * 4;
                window.gW.u3[idx] = 20;
                window.gW.u3[idx + 1] = 30;
                window.gW.u3[idx + 2] = 220;
            }

            window.j1 = {
                uZ: (fD) => {
                    const b = window.gW.u3;
                    return !(b[fD + 2] > b[fD] && b[fD + 2] > b[fD + 1]);
                },
                zY: (fD) => true,
                zZ: (fD) => 0
            };

            window.bc = {
                yR: { sS: 28 }, // 28/30 ticks -> 2 ticks remaining = 784ms <= 1200ms
                bd: 56,
                iV: performance.now()
            };

            let packetDispatched = false;
            window.ss = {
                a1M: {
                    xm: (tileIdx) => { packetDispatched = true; }
                }
            };

            const ctxObj = {
                ws: ctx,
                im: 1.0,
                offsetX: 0,
                offsetY: 0,
                game: mockGame,
                playerData: mockPlayerData
            };

            opt.update(ctxObj);
            opt.render(ctxObj);

            return {
                valid: true,
                packetDispatched: packetDispatched
            };
        });

        console.log('[FeatureTest] Optimizer & Auto-Picker execution:', JSON.stringify(optimizerResult));
        if (!optimizerResult.valid || !optimizerResult.packetDispatched) {
            throw new Error('[FeatureTest] Auto-Picker failed to dispatch spawn selection packet before countdown expiry!');
        }

        // 3. Verify Frontline Troops & Territory Patterns rendering cycle
        const cosmeticResult = await page.evaluate(() => {
            if (!window.__TERRIX_ENGINE__ || !window.__TERRIX_HOOK_RENDER__) {
                return { valid: false, reason: "Engine hook not exposed on window" };
            }

            const canvas = document.createElement("canvas");
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext("2d");

            // Mock attack manager with active confrontation between player 0 and player 1
            window.a0n = {
                pv: (fromP, toP) => {
                    if (fromP === 0 && toP === 1) return 150000;
                    if (fromP === 1 && toP === 0) return 85000;
                    return 0;
                }
            };

            // Mock boat manager
            window.bQ = {
                fH: {
                    jO: 1,
                    j6: [0 << 3], // player 0
                    zg: [25000],  // 25k troops
                    jG: [[5050, 5051]], // path
                    il: [1]
                }
            };

            // Set player 0 active territory and borders
            window.y.an[0] = 1;
            window.y.an[1] = 1;
            window.y.aO[0] = 2500;
            window.y.aO[1] = 1800;
            window.y.oE[0] = 20;
            window.y.oG[0] = 20;
            window.y.oF[0] = 60;
            window.y.oH[0] = 60;
            window.y.bW = new Array(512);
            for (let i = 0; i < 512; i++) window.y.bW[i] = [];
            window.y.bW[0] = [20 * 400 + 30 * 4, 20 * 400 + 31 * 4];
            window.y.bW[1] = [20 * 400 + 32 * 4];

            window.j1 = {
                uZ: (fD) => true,
                zY: (fD) => true,
                zZ: (fD) => (fD >= (20 * 400 + 32 * 4) ? 1 : 0),
                a5q: (player, fD) => (player === 0 ? fD < (20 * 400 + 32 * 4) : fD >= (20 * 400 + 32 * 4))
            };

            window.c.bH = 2; // In-game active match
            window.c.t = 0;  // Player 0
            window.c.c2 = 512;

            // Trigger render hook
            let hookExecuted = false;
            try {
                window.__TERRIX_HOOK_RENDER__(ctx, canvas, 1.0, 0, 0);
                hookExecuted = true;
            } catch(e) {
                return { valid: false, reason: e.message };
            }

            const telemetryNodes = window.__TERRIX_TELEMETRY_NODES__;
            const nodeKeys = Object.keys(telemetryNodes || {});

            return {
                valid: true,
                hookExecuted: hookExecuted,
                nodeCount: nodeKeys.length,
                hasFrontlineKey: nodeKeys.includes("0_1")
            };
        });

        console.log('[FeatureTest] Cosmetic & Frontline Troops result:', JSON.stringify(cosmeticResult));
        if (!cosmeticResult.valid || !cosmeticResult.hookExecuted || !cosmeticResult.hasFrontlineKey) {
            throw new Error(`[FeatureTest] Frontline Troops Telemetry failed: ${JSON.stringify(cosmeticResult)}`);
        }

        console.log('[FeatureTest] ALL FEATURE VERIFICATION CHECKS PASSED EMPIRICALLY!');
    } finally {
        await browser.close();
        server.close();
    }
}

runFeatureVerification().catch(err => {
    console.error('[FeatureTest Error]', err);
    process.exit(1);
});
