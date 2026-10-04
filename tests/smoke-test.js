// tests/smoke-test.js
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8089;
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
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
});

async function runSmokeTest() {
    await new Promise(resolve => server.listen(PORT, resolve));
    console.log(`[SmokeTest] Serving build from http://localhost:${PORT}`);

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
        
        // 1. Verify Client Interface Initialization
        await page.waitForFunction(() => window.__fx && window.__fx.settingsManager, { timeout: 8000 });
        
        // 2. Validate Dictionary Integrity (Zero undefined pointers)
        const dictHealth = await page.evaluate(() => {
            if (typeof dictionary === 'undefined') return { valid: false, reason: "Dictionary undefined" };
            const keys = Object.keys(dictionary);
            if (keys.length === 0) return { valid: false, reason: "Dictionary empty" };
            for (const k of keys) {
                if (!dictionary[k] || typeof dictionary[k] !== 'string') {
                    return { valid: false, reason: `Invalid mapping for ${k}: ${dictionary[k]}` };
                }
            }
            return { valid: true, count: keys.length };
        });

        if (!dictHealth.valid) {
            throw new Error(`[SmokeTest] Dictionary Integrity Failure: ${dictHealth.reason}`);
        }

        // 3. Confirm Canvas Engine Instantiation
        await page.waitForSelector('#canvasA', { timeout: 5000 });

        // Filter known non-breaking sandbox warnings
        const criticalErrors = runtimeErrors.filter(err => 
            !err.includes('WebGL') && 
            !err.includes('audio') && 
            !err.includes('Turnstile') &&
            !err.includes('challenge-platform') &&
            !err.includes('favicon.ico')
        );

        if (criticalErrors.length > 0) {
            throw new Error(`[SmokeTest] Uncaught Runtime Errors:\n${criticalErrors.join('\n')}`);
        }

        // 4. Verify TerriX Scenario Studio Standalone Suite
        const studioPage = await browser.newPage();
        const studioErrors = [];
        studioPage.on('pageerror', err => studioErrors.push(err.message));
        studioPage.on('console', msg => {
            if (msg.type() === 'error') studioErrors.push(msg.text());
        });

        await studioPage.goto(`http://localhost:${PORT}/studio.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await studioPage.waitForFunction(() => window.__studio && window.__studio.store, { timeout: 8000 });

        const studioHealth = await studioPage.evaluate(() => {
            return {
                initialized: !!window.__studio,
                playerCount: window.__studio.store.get('playerCount'),
                canvasReady: !!window.__studio.canvasEditor
            };
        });

        if (!studioHealth.initialized || studioHealth.playerCount !== 512 || !studioHealth.canvasReady) {
            throw new Error(`[SmokeTest] Scenario Studio Initialization Failure`);
        }

        const criticalStudioErrors = studioErrors.filter(err => !err.includes('favicon.ico'));
        if (criticalStudioErrors.length > 0) {
            throw new Error(`[SmokeTest] Scenario Studio Runtime Errors:\n${criticalStudioErrors.join('\n')}`);
        }
        await studioPage.close();

        console.log(`[SmokeTest] Passed successfully with ${dictHealth.count} resolved symbols and verified Scenario Studio suite.`);
    } finally {
        await browser.close();
        server.close();
    }
}

runSmokeTest().catch(err => {
    console.error(err);
    process.exit(1);
});
