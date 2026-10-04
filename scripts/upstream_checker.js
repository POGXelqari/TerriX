// scripts/upstream_checker.js
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const UPSTREAM_URL = "https://territorial.io/";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const ROOT_DIR = process.cwd();
const VERSION_PATH = path.join(ROOT_DIR, "version.json");
const GAME_DIR = path.join(ROOT_DIR, "game");

function fetchUpstreamHtml() {
    return new Promise((resolve, reject) => {
        https.get(UPSTREAM_URL, {
            headers: { "User-Agent": USER_AGENT }
        }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch upstream: HTTP ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

export async function checkAndFetchUpstream(force = false) {
    console.log("[*] Probing upstream https://territorial.io/ for updates...");
    const html = await fetchUpstreamHtml();

    const scriptMatch = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    if (!scriptMatch) {
        throw new Error("[CRITICAL] Could not locate <script> block in upstream HTML.");
    }

    const scriptContent = scriptMatch[1].replace(/\r?\n|\r/g, "");
    const scriptHash = crypto.createHash('sha256').update(scriptContent, 'utf8').digest('hex');

    let versionData = {};
    if (fs.existsSync(VERSION_PATH)) {
        try {
            versionData = JSON.parse(fs.readFileSync(VERSION_PATH, 'utf8'));
        } catch (e) {
            versionData = {};
        }
    }

    const previousHash = versionData.upstream_hash || "";
    const isNewRelease = previousHash !== scriptHash;

    if (!isNewRelease && !force) {
        console.log(`[=] Upstream is up to date (SHA256: ${scriptHash.slice(0, 16)}...). No update required.`);
        return { updated: false, hash: scriptHash };
    }

    console.log(`[!] Upstream change detected (or --force active)! New SHA256: ${scriptHash.slice(0, 16)}...`);

    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, { recursive: true });
    }

    // Persist raw latest assets
    fs.writeFileSync(path.join(GAME_DIR, "latest.html"), html, 'utf8');
    fs.writeFileSync(path.join(GAME_DIR, "latest.js"), scriptContent, 'utf8');

    // Attempt to extract upstream version if present
    const versionMatch = scriptContent.match(/this\.dw\s*=\s*(\d+);\s*this\.rVersion\s*=\s*(\d+);/);
    if (versionMatch) {
        versionData.asset_version = parseInt(versionMatch[1], 10);
        versionData.rVersion = parseInt(versionMatch[2], 10);
        versionData.upstream_version = `${versionMatch[2]}.${versionMatch[1]}`;
    }

    versionData.upstream_hash = scriptHash;
    versionData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(VERSION_PATH, JSON.stringify(versionData, null, 2), 'utf8');

    console.log(`[+] Wrote latest upstream assets to ./game/latest.js and updated ${VERSION_PATH}`);
    return { updated: true, hash: scriptHash };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('upstream_checker.js')) {
    const force = process.argv.includes('--force');
    checkAndFetchUpstream(force)
        .then(result => {
            console.log(`[UpstreamChecker] Completed with status: ${result.updated ? 'UPDATED' : 'CURRENT'}`);
            process.exit(0);
        })
        .catch(err => {
            console.error(`[UpstreamChecker] Fatal Error:`, err);
            process.exit(1);
        });
}
