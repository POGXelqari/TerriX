const WebSocket = require('ws');
const fs = require('fs');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');

const { execFileSync } = require("child_process");

function parseBuildNumber(html) {
  const match = html.match(
    /function\s+[A-Za-z_$][\w$]*\s*\(\)\s*{\s*this\.[A-Za-z_$][\w$]*\s*=\s*(\d+)\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*2\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*\d+\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*\d+\s*;\s*this\.rVersion\s*=/,
  );

  if (!match) {
    throw new Error("buildNumber not found");
  }

  return Number(match[1]);
}

function getBuildNumber() {
  const html = execFileSync("curl", ["-fsSL", "https://territorial.io/"], {
    encoding: "utf8",
  });

  return parseBuildNumber(html);
}

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  bGreen: '\x1b[92m',
  bRed: '\x1b[91m',
  bYellow: '\x1b[93m',
  bCyan: '\x1b[96m',
  bWhite: '\x1b[97m',
  blue: '\x1b[34m',
};

function gradientText(text, startColor, endColor) {
  const [r1, g1, b1] = startColor;
  const [r2, g2, b2] = endColor;
  const len = text.length || 1;

  return text.split('').map((ch, i) => {
    const t = i / (len - 1 || 1);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `${rgb(r, g, b)}${ch}`;
  }).join('') + c.reset;
}

function rgb(r, g, b) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

const START_COLOR = [75, 31, 255];
const END_COLOR = [244, 242, 252];

function banner() {
  console.log();
  console.log(gradientText('  TERRITORIAL.IO ACCOUNT GENERATOR', START_COLOR, END_COLOR));
  console.log(`${c.dim}${'  ' + '─'.repeat(34)}${c.reset}`);
  console.log();
}

function logInfo(msg) {
  console.log(`${rgb(...START_COLOR)}${c.bold} ℹ  ${c.reset}${rgb(160, 120, 255)}${msg}${c.reset}`);
}

function logSuccess(msg) {
  console.log(`${c.bGreen}${c.bold} ✔  ${c.reset}${c.bGreen}${msg}${c.reset}`);
}

function logError(msg) {
  console.log(`${c.bRed}${c.bold} ✘  ${c.reset}\x1b[91m${msg}${c.reset}`);
}

function logWarn(msg) {
  console.log(`${c.bYellow}${c.bold} ⚠  ${c.reset}\x1b[93m${msg}${c.reset}`);
}

function logFound(user, pass, sessionHex) {
  const tag = gradientText('★ MATCH FOUND ★', [255, 200, 0], [255, 100, 0]);
  const uVal = `${c.bold}${c.bWhite}${user}${c.reset}`;
  const pVal = `${rgb(255, 200, 100)}${pass}${c.reset}`;
  const sVal = `${c.dim}${rgb(180, 180, 180)}${sessionHex}${c.reset}`;
  console.log(`\n${tag} → ${uVal} : ${pVal}`);
  console.log(`  ${rgb(150, 150, 150)}SESSION HEX:${c.reset} ${sVal}\n`);
}

function logAccount(i, total, user, pass) {
  const tag = gradientText(`[${i}/${total}]`, START_COLOR, END_COLOR);
  const check = `${c.bGreen}✅${c.reset}`;
  const uLabel = `${rgb(180, 160, 255)}USERNAME:${c.reset}`;
  const uVal = `${c.bold}${c.bWhite}${user}${c.reset}`;
  const pLabel = `${rgb(180, 160, 255)}PASSWORD:${c.reset}`;
  const pVal = `${rgb(200, 190, 255)}${pass}${c.reset}`;
  const gen = gradientText('GENERATED', START_COLOR, END_COLOR);

  console.log(`${gen} ${tag} ${check} ${uLabel} ${uVal} ${c.dim}|${c.reset} ${pLabel} ${pVal}`);
}

function logSeparator() {
  console.log(gradientText('  ' + '─'.repeat(52), START_COLOR, END_COLOR));
}

function loadProxies() {
  if (!fs.existsSync('proxy.txt')) {
    logWarn('No proxy.txt found using local IP.');
    return [];
  }

  const lines = fs.readFileSync('proxy.txt', 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    logWarn('proxy.txt is empty using local IP.');
    return [];
  }

  logInfo(`Loaded ${lines.length} proxy/proxies from proxy.txt.`);
  return lines;
}

function makeAgent(proxyStr) {
  try {
    const url = `http://${proxyStr}`;
    return new HttpsProxyAgent(url);
  } catch (e) {
    console.error(`wrong proxy format: ${proxyStr}`);
    return null;
  }
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

class DataWrapper {
  constructor() {
    this.size = 0;
    this.bitPosition = 0;
    this.buffer = null;
  }
  init(buffer) {
    this.bitPosition = 0;
    this.buffer = buffer;
    this.size = buffer.length;
  }
  allocateAndInitialize(totalBits) {
    this.init(new Uint8Array((totalBits + 7) >> 3));
    return this.buffer;
  }
  writeBits(bitCount, value) {
    const end = this.bitPosition + bitCount - 1;
    for (let i = this.bitPosition; i <= end; i++)
      this.buffer[i >> 3] |= ((value >> (end - i)) & 1) << (7 - (i & 7));
    this.bitPosition += bitCount;
    if (this.bitPosition > 8 * this.size) console.error("Wrapper Overflow");
  }
}

class BitStreamReader {
  init(buffer) {
    this.buffer = buffer;
    this.size = buffer.length;
    this.bitPosition = 0;
  }
  readBits(size) {
    let value = 0;
    const end = this.bitPosition + size - 1;
    for (let i = this.bitPosition; i <= end; i++)
      value |= ((this.buffer[i >> 3] >> (7 - (i & 7))) & 1) << (end - i);
    this.bitPosition += size;
    if (this.bitPosition > 8 * this.size) console.error("Reader Overflow");
    return value;
  }
}

class HashGenerator {
  constructor() { this.BUFFER_SIZE = 256; }
  generateHash(seedA, seedB) {
    const buffer = new Uint8Array(this.BUFFER_SIZE);
    let prngX = 3 + (4 + seedA) % 32768, prngY = 12 + seedB % 32768;
    let prngZ = 17 + ((seedA & seedB) + (seedA | seedB) + seedA) % 32768;
    for (let i = 0; i < this.BUFFER_SIZE; i++) { prngX = 1 + (prngX * prngY) % prngZ; buffer[i] = prngX % 256; }
    for (let i = 0; i < this.BUFFER_SIZE; i++) {
      buffer[i] = (buffer[i] + ((seedA >> ((i + 2) % 30)) & 1)) % 256;
      buffer[i] = (buffer[i] + ((seedB >> ((i + 7) % 30)) & 1)) % 256;
    }
    let pos = 0;
    for (let i = 0; i < 30000; i++) { let t = buffer[pos]; buffer[pos] = (t + i + buffer[(pos + i) % 256]) % 256; pos = (t + i + pos + (t & pos)) % 256; }
    let h1 = 1, h2 = 1;
    for (let i = 0; i < this.BUFFER_SIZE; i += 2) {
      h1 = ((1 + h1) * (buffer[i] + 1)) % 1073741824;
      h2 = ((1 + h2) * (buffer[i + 1] + 1)) % 1073741824;
    }
    return [h1, h2];
  }
  bruteForceFindPreimage(bitLength, seedA, seedB, targetHash) {
    const max = 1 << bitLength;
    for (let i = 0; i < max; i++) if (this.computeMixedHash(i, seedA, seedB) === targetHash) return i;
    return 0;
  }
  computeMixedHash(inputValue, seedA, seedB) {
    let tempL = seedA + inputValue, tempU = seedB + inputValue;
    let hash = (tempL + tempU) & 2147483647;
    for (let i = 1; i <= 16; i++) {
      hash ^= hash >> i; hash >>>= 1 + (tempL & 3);
      hash = (hash * (7 + ((tempL | tempU) & 1023))) & 1073741823;
      hash += (tempU & 65535); tempL >>= 1 + (hash & 1); tempU >>= 1 + (tempL & 1);
    }
    return hash & 1073741823;
  }
}

const reverseTable = new Array(64).fill('-');
reverseTable[0] = '-';
for (let i = 0; i < 10; i++) reverseTable[i + 1] = String.fromCharCode(48 + i);
for (let i = 0; i < 26; i++) reverseTable[i + 11] = String.fromCharCode(65 + i);
for (let i = 0; i < 26; i++) reverseTable[i + 38] = String.fromCharCode(97 + i);
reverseTable[37] = '_';

const base64NameReverseTable = new Array(64).fill('-');
base64NameReverseTable[0] = '-';
for (let i = 0; i < 10; i++) base64NameReverseTable[i + 1] = String.fromCharCode(48 + i);
for (let i = 0; i < 26; i++) base64NameReverseTable[i + 11] = String.fromCharCode(65 + i);
for (let i = 0; i < 26; i++) base64NameReverseTable[i + 38] = String.fromCharCode(97 + i);
base64NameReverseTable[37] = '_';

const base64NameLookupTable = new Uint8Array(78);
base64NameLookupTable[50] = 37;
for (let i = 0; i < 10; i++) base64NameLookupTable[i + 3] = i + 1;
for (let i = 0; i < 26; i++) {
  base64NameLookupTable[i + 20] = i + 11;
  base64NameLookupTable[i + 52] = i + 38;
}

function decodeFixedString(reader, length) {
  let result = '';
  for (let i = 0; i < length; i++) result += reverseTable[reader.readBits(6)] || '?';
  return result;
}

function writeFixedLengthBase64Name(dw, str, size) {
  str = String(str ?? '').trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
  if (str.length > size) str = str.substring(0, size);
  while (str.length < size) str = '-' + str;

  for (let i = 0; i < str.length; i++) {
    dw.writeBits(6, base64NameLookupTable[str.charCodeAt(i) - 45]);
  }
}

function loadFilter() {
  if (!fs.existsSync('filter.txt')) return null;
  const names = fs.readFileSync('filter.txt', 'utf-8')
    .split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);
  if (names.length === 0) return null;
  logInfo(`Loaded ${names.length} name(s) from filter.txt`);
  return new Set(names);
}

function isValuableUsername(username) {
  const u = username.toLowerCase();
  const freq = {};
  for (const ch of u) freq[ch] = (freq[ch] || 0) + 1;
  const maxFreq = Math.max(...Object.values(freq));

  if (maxFreq >= 4) return true;

  if (u[0] === u[2] && u[2] === u[4] && u[1] === u[3] && u[0] !== u[1]) return true;

  return false;
}

function checkAndSaveIfMatch(username, password, sessionHex, filterSet) {
  const matched =
    (filterSet && filterSet.has(username.toLowerCase())) ||
    isValuableUsername(username);

  if (matched) {
    fs.appendFileSync('found.txt', `${username}:${password}:${sessionHex}\n`);
    logFound(username, password, sessionHex);
  }
}

function convertAccountSyncToSessionPacket(sessionHex) {
  if (sessionHex.startsWith('14')) return `22${sessionHex.slice(2)}`;
  if (sessionHex.startsWith('15')) return `23${sessionHex.slice(2)}`;
  return sessionHex;
}

const gameState = { buildNumber: null, isNotTerritorialDomain: true, isInIframe: false };
const platform = { id: 0, version: 0 };
const screenHash = { canvasFontFingerprint: 9794, screenWidth: 1920, screenHeight: 1080 };
const initLastChallengeSolved = 0;

function timeZoneSomething() {
  const offset = (new Date()).getTimezoneOffset();
  return Math.abs(Math.floor((900 + offset + 0.5) / 15)) & 127;
}

function screenSizeHash() {
  return (screenHash.screenWidth & 0xFFF) ^ (screenHash.screenHeight & 0xFFF);
}

function writeInitPayload(dw) {
  dw.writeBits(14, gameState.buildNumber);
  dw.writeBits(4, platform.id);
  dw.writeBits(7, platform.version);
  dw.writeBits(1, +gameState.isNotTerritorialDomain);
  dw.writeBits(1, +gameState.isInIframe);
  dw.writeBits(5, (new Date()).getHours() % 24);
  dw.writeBits(8, 0);
  dw.writeBits(8, 0);
}

function writeScreenHash(dw) {
  writeFixedLengthBase64Name(dw, initLastChallengeSolved, 15);
  dw.writeBits(14, screenHash.canvasFontFingerprint & 16383);
  dw.writeBits(7, timeZoneSomething());
  dw.writeBits(12, screenSizeHash());
}

function buildInitPacket() {
  const dw = new DataWrapper();
  dw.allocateAndInitialize(1 + 6 + (14 + 4 + 7 + 1 + 1 + 5 + 2 * 8) + (15 * 6 + 14 + 7 + 12));
  dw.writeBits(1, 0);
  dw.writeBits(6, 13);
  writeInitPayload(dw);
  writeScreenHash(dw);
  return dw.buffer;
}

function buildChallengeResponse(challengeResponse, eventType) {
  const dw = new DataWrapper();
  dw.allocateAndInitialize(1 + 6 + 3 + 30 + 30);
  dw.writeBits(1, 0);
  dw.writeBits(6, 30);
  dw.writeBits(3, eventType);
  dw.writeBits(30, challengeResponse);
  // Current clients send a second 30-bit challenge-response value. The
  // browser passes zero for this connection flow.
  dw.writeBits(30, 0);
  return dw.buffer;
}

function solveChallenge(reader) {
  const eventType = reader.readBits(3);
  const difficultyBits = reader.readBits(5);
  const seedA = reader.readBits(30);
  const seedB = reader.readBits(30);
  const targetHash = reader.readBits(30);
  const hashGen = new HashGenerator();

  return {
    eventType,
    challengeResponse: hashGen.bruteForceFindPreimage(difficultyBits, seedA, seedB, targetHash),
  };
}

function generateAccount(proxyStr, index, total, filterSet) {
  return new Promise((resolve) => {
    const wsOptions = {};
    if (proxyStr) {
      const agent = makeAgent(proxyStr);
      if (agent) wsOptions.agent = agent;
    }

    const ws = new WebSocket('wss://territorial.io/s52/', wsOptions);

    const timeout = setTimeout(() => {
      logError(`[${index}/${total}] Timed out.`);
      ws.terminate();
      resolve(null);
    }, 15000);

    ws.on('open', () => {
      ws.send(buildInitPacket());
    });

    ws.on('message', (data) => {
      const reader = new BitStreamReader();
      reader.init(new Uint8Array(data));
      reader.readBits(1);
      const opcode = reader.readBits(6);

      if (opcode === 9 || opcode === 20) {
        const challenge = solveChallenge(reader);
        ws.send(buildChallengeResponse(challenge.challengeResponse, challenge.eventType));

        if (opcode === 20) return;
        ws.send(Buffer.from([0x1e, 0x00]));
      }

      if (opcode === 10) {
        const r = new BitStreamReader();
        r.init(new Uint8Array(data));
        r.readBits(1); r.readBits(6);
        const username = decodeFixedString(r, 5);
        const password = decodeFixedString(r, 15);

        const sessionHex = Buffer.from(data).toString('hex');
        const reusableSessionHex = convertAccountSyncToSessionPacket(sessionHex);

        logAccount(index, total, username, password);

        fs.appendFileSync('accounts.txt', `${username}:${password}\n`);
        fs.appendFileSync('sessions.txt', `${reusableSessionHex}\n`);

        checkAndSaveIfMatch(username, password, sessionHex, filterSet);

        clearTimeout(timeout);
        ws.close();
        resolve({ username, password });
      }
    });

    ws.on('close', () => resolve(null));
    ws.on('error', (err) => {
      if (err.message && err.message.includes('socket hang up')) {
        clearTimeout(timeout);
        ws.terminate();
        resolve('hangup');
        return;
      }
      logError(`[${index}/${total}] WS Error: ${err.message}`);
      clearTimeout(timeout);
      resolve(null);
    });
  });
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

async function main() {
  banner();

  gameState.buildNumber = getBuildNumber();

  const proxies = loadProxies();

  const countInput = await prompt(`${c.bCyan}${c.bold} ? ${c.reset}${c.blue} How many accounts to generate? ${c.reset}`);
  const count = parseInt(countInput);
  if (isNaN(count) || count < 1) { logError('Invalid number.'); process.exit(1); }

  const threadInput = await prompt(`${c.bCyan}${c.bold} ? ${c.reset}${c.bRed} How many concurrent connections? (recommended: 5–20) ${c.reset}`);
  const concurrency = Math.max(1, parseInt(threadInput) || 5);

  logInfo(`Generating ${count} account(s) with ${concurrency} concurrent connections...`);
  logInfo('Results will be saved to accounts.txt');
  logSeparator();
  const filterSet = loadFilter();

  const tasks = Array.from({ length: count }, (_, i) => () => {
    const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;
    return generateAccount(proxy, i + 1, count, filterSet);
  });

  const results = await runWithConcurrency(tasks, concurrency);

  const success = results.filter(r => r && r !== 'hangup' && r.username).length;
  const hangups = results.filter(r => r === 'hangup').length;
  const failures = results.filter(r => r === null).length;

  logSeparator();
  logSuccess(`Done! ${success}/${count} accounts generated successfully.`);
  if (hangups > 0) logWarn(`${hangups} connections closed by server (ignored).`);
  if (failures > 0) logError(`${failures} proxy errors.`);
  logInfo('Saved to → accounts.txt');
}

if (require.main === module) {
  main().catch((error) => {
    logError(error.message || String(error));
    process.exitCode = 1;
  });
}

module.exports = {
  BitStreamReader,
  buildChallengeResponse,
  decodeFixedString,
  parseBuildNumber,
};
