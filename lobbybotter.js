const WebSocket = require('ws');
const fs = require('fs');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');

const URL1 = 'wss://territorial.io/s52/';
const URL2 = 'wss://1.territorial.io/s52/';

const gameState = { buildNumber: null, isTerritorialDomain: true, isInIframe: false };
const platform = { id: 0, version: 0 };

const session = {
  username: 'dsc.gg/elizi[Elizzi]',
  gameMode: 0,
  rgbInt: -1,
  screenWidth: 1920,
  screenHeight: 1080,
};

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  bGreen: '\x1b[92m', bRed: '\x1b[91m', bYellow: '\x1b[93m',
  bCyan: '\x1b[96m', bWhite: '\x1b[97m', bgMagenta: '\x1b[45m', blue: '\x1b[34m',
};

function rgb(r, g, b) { return `\x1b[38;2;${r};${g};${b}m`; }

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

const START_COLOR = [75, 31, 255];
const END_COLOR = [244, 242, 252];

function banner() {
  console.clear();
  console.log(gradientText('  TERRITORIAL.IO LOBBY BOTTER', START_COLOR, END_COLOR));
  console.log(`${c.dim}${'  ' + '─'.repeat(34)}${c.reset}`);
  console.log();
}

function logInfo(msg)      { console.log(`${rgb(...START_COLOR)}${c.bold} ℹ  ${c.reset}${rgb(160, 120, 255)}${msg}${c.reset}`); }
function logSuccess(msg)   { console.log(`${c.bGreen}${c.bold} ✔  ${c.reset}${c.bGreen}${msg}${c.reset}`); }
function logError(msg)     { console.log(`${c.bRed}${c.bold} ✘  ${c.reset}\x1b[91m${msg}${c.reset}`); }
function logWarn(msg)      { console.log(`${c.bYellow}${c.bold} ⚠  ${c.reset}\x1b[93m${msg}${c.reset}`); }
function logSeparator()    { console.log(gradientText('  ' + '─'.repeat(52), START_COLOR, END_COLOR)); }

function logConnected(connId, count, username) {
  const tag   = gradientText(`[${connId}/${count}]`, START_COLOR, END_COLOR);
  const check = `${c.bGreen}${c.bold}✔${c.reset}`;
  const label = `${rgb(180, 160, 255)}BOT CONNECTED:${c.reset}`;
  const val   = `${c.bold}${c.bWhite}${username}${c.reset}`;
  console.log(` ${tag} ${check} ${label} ${val}`);
}

const BUILD_NUMBER_FILE = 'buildnumber.txt';

function parseBuildNumber(html) {
  const match = html.match(
    /function\s+[A-Za-z_$][\w$]*\s*\(\)\s*{\s*this\.[A-Za-z_$][\w$]*\s*=\s*(\d+)\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*2\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*\d+\s*;\s*var\s+[A-Za-z_$][\w$]*\s*=\s*\d+\s*;\s*this\.rVersion\s*=/,
  );
  if (!match) throw new Error('build number not found in current client');
  return Number(match[1]);
}

async function fetchBuildNumber() {
  try {
    logInfo('Fetching latest build number from territorial.io...');
    const response = await fetch('https://territorial.io/');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buildNumber = parseBuildNumber(await response.text());
    fs.writeFileSync(BUILD_NUMBER_FILE, String(buildNumber));
    logSuccess(`Fetched and saved build number: ${buildNumber}`);
    return buildNumber;
  } catch (err) {
    logError(`Failed to fetch build number: ${err.message}`);
    throw err;
  }
}

function loadBuildNumber() {
  if (!fs.existsSync(BUILD_NUMBER_FILE)) return null;
  const val = parseInt(fs.readFileSync(BUILD_NUMBER_FILE, 'utf8').trim(), 10);
  return isNaN(val) ? null : val;
}

async function initBuildNumber() {
  const saved = loadBuildNumber();
  if (saved !== null) {
    logInfo(`Loaded build number from file: ${saved}`);
    gameState.buildNumber = saved;
  } else {
    logWarn('buildnumber.txt not found — fetching from territorial.io');
    gameState.buildNumber = await fetchBuildNumber();
  }
}

function loadProxies() {
  if (!fs.existsSync('proxy.txt')) return [];
  return fs.readFileSync('proxy.txt', 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      if (line.includes('@')) {
        const [auth, hostport] = line.split('@');
        if (!auth || !hostport) return null;
        const [user, pass] = auth.split(':');
        const [host, port] = hostport.split(':');
        return { user, pass, host, port };
      }
      const parts = line.split(':');
      if (parts.length === 4) {
        const [host, port, user, pass] = parts;
        return { host, port, user, pass };
      }
      return null;
    })
    .filter(Boolean);
}

function buildProxyAgent({ user, pass, host, port }) {
  const url = (user && pass)
    ? `http://${user}:${pass}@${host}:${port}`
    : `http://${host}:${port}`;
  return new HttpsProxyAgent(url, { rejectUnauthorized: false });
}

function getProxyForIndex(proxies, index) {
  if (!proxies.length) return null;
  return proxies[index % proxies.length];
}

function wsOptions(proxy) {
  return proxy ? { agent: buildProxyAgent(proxy), rejectUnauthorized: false } : {};
}

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

function loadSessions() {
  if (!fs.existsSync('sessions.txt')) return [];
  return fs.readFileSync('sessions.txt', 'utf8')
    .split('\n').map(l => l.trim()).filter(Boolean)
    .map(hex => Buffer.from(hex, 'hex'));
}

function saveSession(sessionPacket) {
  fs.appendFileSync('sessions.txt', Buffer.from(sessionPacket).toString('hex') + '\n');
}

class DataWrapper {
  constructor() { this.size = 0; this.bitPosition = 0; this.buffer = null; }
  init(buffer) { this.bitPosition = 0; this.buffer = buffer; this.size = buffer.length; }
  allocateAndInitialize(totalBits) { this.init(new Uint8Array((totalBits + 7) >> 3)); return this.buffer; }
  writeBits(bitCount, value) {
    const end = this.bitPosition + bitCount - 1;
    for (let i = this.bitPosition; i <= end; i++) {
      this.buffer[i >> 3] |= ((value >> (end - i)) & 1) << (7 - (i & 7));
    }
    this.bitPosition += bitCount;
    if (this.bitPosition > 8 * this.size) console.error("Wrapper Overflow");
  }
}

class BitStreamReader {
  init(buffer) { this.buffer = buffer; this.size = buffer.length; this.bitPosition = 0; }
  readBits(size) {
    let value = 0;
    const end = this.bitPosition + size - 1;
    for (let i = this.bitPosition; i <= end; i++) {
      value |= ((this.buffer[i >> 3] >> (7 - (i & 7))) & 1) << (end - i);
    }
    this.bitPosition += size;
    if (this.bitPosition > 8 * this.size) console.error("Reader Overflow");
    return value;
  }
}

const encode64Table = new Uint8Array(78);
encode64Table[0] = 0;
encode64Table[50] = 37;
for (let i = 0; i < 10; i++) encode64Table[i + 3] = i + 1;
for (let i = 0; i < 26; i++) {
  encode64Table[i + 20] = i + 11;
  encode64Table[i + 52] = i + 38;
}

const reverseTable = new Array(64).fill('?');
reverseTable[0] = '-';
reverseTable[37] = '_';
for (let i = 0; i < 10; i++) reverseTable[i + 1] = String.fromCharCode(48 + i);
for (let i = 0; i < 26; i++) reverseTable[i + 11] = String.fromCharCode(65 + i);
for (let i = 0; i < 26; i++) reverseTable[i + 38] = String.fromCharCode(97 + i);

function cleanToken(value, length) {
  let result = String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
  if (result.length > length) return result.slice(0, length);
  while (result.length < length) result = "-" + result;
  return result;
}

function writeToken(dw, value, length) {
  const token = cleanToken(value, length);
  for (let i = 0; i < token.length; i++) {
    dw.writeBits(6, encode64Table[token.charCodeAt(i) - 45] || 0);
  }
}

function decodeData183(reader) {
  let result = '';
  for (let i = 0; i < 15; i++) result += reverseTable[reader.readBits(6)] || '-';
  return result;
}

class HashGenerator {
  constructor() { this.BUFFER_SIZE = 256; }

  generateHash(seedA, seedB) {
    const buffer = new Uint8Array(this.BUFFER_SIZE);
    let prngX = 3 + (4 + seedA) % 32768;
    let prngY = 12 + seedB % 32768;
    let prngZ = 17 + ((seedA & seedB) + (seedA | seedB) + seedA) % 32768;
    for (let i = 0; i < this.BUFFER_SIZE; i++) { prngX = 1 + (prngX * prngY) % prngZ; buffer[i] = prngX % 256; }
    for (let i = 0; i < this.BUFFER_SIZE; i++) {
      buffer[i] = (buffer[i] + ((seedA >> ((i + 2) % 30)) & 1)) % 256;
      buffer[i] = (buffer[i] + ((seedB >> ((i + 7) % 30)) & 1)) % 256;
    }
    let pos = 0;
    for (let i = 0; i < 30000; i++) {
      let temp = buffer[pos];
      buffer[pos] = (temp + i + buffer[(pos + i) % 256]) % 256;
      pos = (temp + i + pos + (temp & pos)) % 256;
    }
    let h1 = 1, h2 = 1;
    for (let i = 0; i < this.BUFFER_SIZE; i += 2) {
      h1 = ((1 + h1) * (buffer[i] + 1)) % 1073741824;
      h2 = ((1 + h2) * (buffer[i + 1] + 1)) % 1073741824;
    }
    return [h1, h2];
  }

  bruteForceFindPreimage(bitLength, seedA, seedB, targetHash) {
    const max = 1 << bitLength;
    for (let i = 0; i < max; i++) {
      if (this.computeMixedHash(i, seedA, seedB) === targetHash) return i;
    }
    return 0;
  }

  computeMixedHash(inputValue, seedA, seedB) {
    let tempL = seedA + inputValue;
    let tempU = seedB + inputValue;
    let hash = (tempL + tempU) & 2147483647;
    for (let i = 1; i <= 16; i++) {
      hash ^= hash >> i;
      hash >>>= 1 + (tempL & 3);
      hash = (hash * (7 + ((tempL | tempU) & 1023))) & 1073741823;
      hash += (tempU & 65535);
      tempL >>= 1 + (hash & 1);
      tempU >>= 1 + (tempL & 1);
    }
    return hash & 1073741823;
  }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function getPlayerColorId(rgbInt) {
  const fX = clamp(rgbInt, -1, 262143);
  return fX === -1 ? ~~(Math.random() * 262144) : fX;
}

function getPlayerColorArray(playerColorId) {
  return [(playerColorId >> 12) & 63, (playerColorId >> 6) & 63, playerColorId & 63];
}

function writeUsername(dw, username) {
  dw.writeBits(5, username.length);
  for (let i = 0; i < username.length; i++) dw.writeBits(16, username.charCodeAt(i));
}

function buildLobbyJoinPacket(username, gameMode, rgbInt, screenWidth, screenHeight) {
  username = username.slice(0, 20);
  const playerColorId = getPlayerColorId(rgbInt);
  const playerColor = getPlayerColorArray(playerColorId);
  const timeBasedSeed = new Date().getTime() % 1048576;
  const totalBits = 1 + 6 + 10 + 2 + 5 + username.length * 16 + 18;
  const dw = new DataWrapper();
  dw.allocateAndInitialize(totalBits);
  dw.writeBits(1, 0); dw.writeBits(6, 1);
  dw.writeBits(10, timeBasedSeed);
  dw.writeBits(2, gameMode);
  writeUsername(dw, username);
  dw.writeBits(6, playerColor[0]);
  dw.writeBits(6, playerColor[1]);
  dw.writeBits(6, playerColor[2]);
  return dw.buffer;
}

function buildSessionRequestPacket(id) {
  const dw = new DataWrapper();
  dw.allocateAndInitialize(1 + 6 + 6);
  dw.writeBits(1, 0);
  dw.writeBits(6, 15);
  dw.writeBits(6, id);
  return dw.buffer;
}

function transformSessionPacket(data) {
  const bytes = new Uint8Array(data);
  if (bytes[0] === 0x14) bytes[0] = 0x22;
  else if (bytes[0] === 0x15) bytes[0] = 0x23;
  return bytes;
}

function solveChallengePacket(reader) {
  const eventType = reader.readBits(3);
  const bitLength = reader.readBits(5);
  const seedA     = reader.readBits(30);
  const seedB     = reader.readBits(30);
  const targetHash = reader.readBits(30);
  const solution = new HashGenerator().bruteForceFindPreimage(bitLength, seedA, seedB, targetHash);
  const dw = new DataWrapper();
  dw.allocateAndInitialize(1 + 6 + 3 + 30 + 30);
  dw.writeBits(1, 0); dw.writeBits(6, 30);
  dw.writeBits(3, eventType);
  dw.writeBits(30, solution);
  dw.writeBits(30, 0);
  return dw.buffer;
}


function buildInitBuffer(token, initValues) {
  const dw = new DataWrapper();
  dw.allocateAndInitialize(178);
  dw.writeBits(1, 0); dw.writeBits(6, 13);
  dw.writeBits(14, gameState.buildNumber);
  dw.writeBits(4, platform.id);
  dw.writeBits(7, platform.version);
  dw.writeBits(1, +gameState.isTerritorialDomain);
  dw.writeBits(1, +gameState.isInIframe);
  dw.writeBits(5, new Date().getHours() % 24);
  dw.writeBits(8, initValues.colorA);
  dw.writeBits(8, initValues.colorB);
  writeToken(dw, token, 15);
  dw.writeBits(14, initValues.fontCheck);
  dw.writeBits(7, initValues.timezoneCheck);
  dw.writeBits(12, initValues.screenCheck);
  return dw.buffer;
}

function runPhase1ForConnection(proxy, connId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL1, wsOptions(proxy));
    let capturedData183 = null;
    const initValues = { colorA: 53, colorB: 53, fontCheck: 9819, timezoneCheck: 52, screenCheck: 650 };

    ws.on('open', () => ws.send(buildInitBuffer("---------------", initValues)));

    ws.on('message', (data) => {
      const bytes = new Uint8Array(data);
      const reader = new BitStreamReader();
      reader.init(bytes);
      reader.readBits(1);
      const opcode = reader.readBits(6);

      if (opcode === 9) {
        capturedData183 = decodeData183(reader);

        const r = new BitStreamReader();
        r.init(bytes);
        r.readBits(1); r.readBits(6);
        const challengeResponse = solveChallengePacket(r);
        ws.send(challengeResponse);
        ws.send(buildSessionRequestPacket(0));
      }

      if (bytes[0] === 0x14 || bytes[0] === 0x15) {
        const savedSessionPacket = transformSessionPacket(data);
        ws.close();
        resolve({ sessionPacket: savedSessionPacket, data183: capturedData183, initValues });
      }
    });

    ws.on('close', async (code, reason) => {
      if (code !== 1000 && code !== undefined) {
        logWarn(`Conn ${connId} — Lobby socket closed: code=${code} reason=${reason || '(none)'}`);
      }
      if (code === 4211) {
        logWarn(`Phase 1 — Disconnected with code 4211 (build number mismatch). Fetching new build number...`);
        gameState.buildNumber = await fetchBuildNumber();
        reject(new Error('Build number mismatch (4211) — retry'));
      } else if (code !== 1000 && code !== undefined) {
        reject(new Error(`Phase 1 closed unexpectedly: code=${code} reason=${reason}`));
      }
    });

    ws.on('error', reject);
  });
}

function isProxyError(err) {
  const s = err?.statusCode;
  if (s === 561 || s === 562 || s === 568 || s === 502) return true;
  return /Unexpected server response: (502|56[12568])/.test(err?.message || '');
}

function runPhase2ForConnection(proxy, savedSessionPacket, connId, count, data183, initValues) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL2, wsOptions(proxy));
    let settled = false;
    const done = (fn, val) => { if (!settled) { settled = true; fn(val); } };

    ws.on('open', () => ws.send(buildInitBuffer(data183, initValues)));

    ws.on('message', (data) => {
      const reader = new BitStreamReader();
      reader.init(new Uint8Array(data));
      reader.readBits(1);
      const opcode = reader.readBits(6);

      if (opcode === 9) {
        const r = new BitStreamReader();
        r.init(new Uint8Array(data));
        r.readBits(1); r.readBits(6);
        ws.send(solveChallengePacket(r));
        ws.send(savedSessionPacket);
        const username = `${session.username}`;
        ws.send(buildLobbyJoinPacket(username, session.gameMode, session.rgbInt, session.screenWidth, session.screenHeight));
        logConnected(connId, count, username);
        // wait for close to resolve/reject
      }

      if (opcode === 20) {
        const r = new BitStreamReader();
        r.init(new Uint8Array(data));
        r.readBits(1); r.readBits(6);
        ws.send(solveChallengePacket(r));
      }
    });

    ws.on('close', async (code, reason) => {
      if (code === 4211) {
        logWarn(`Conn ${connId} — Disconnected with code 4211 (build number mismatch). Fetching new build number...`);
        gameState.buildNumber = await fetchBuildNumber();
        done(reject, new Error('Build number mismatch (4211) — retry'));
      } else if (code === 4563) {
        logWarn(`Conn ${connId} — Disconnected: code=4563, reconnecting...`);
        done(reject, new Error('Reconnect (4563)'));
      } else if (code !== 1000 && code !== undefined) {
        if (!settled) logError(`Conn ${connId} — Disconnected: code=${code} reason=${reason}`);
        done(resolve);
      } else {
        done(resolve);
      }
    });

    ws.on('error', (err) => {
      if (isProxyError(err)) {
        logWarn(`Conn ${connId} — Proxy rejected (${err.statusCode}), will retry`);
        done(reject, err);
      } else {
        logError(`Conn ${connId} — Phase 2 WS error: ${err.message}`);
        done(resolve);
      }
    });
  });
}

async function runConnection(connId, proxy, count, existingSession) {
  const MAX_BUILD_RETRIES = 3;
  let buildAttempt = 0;
  let currentSession = existingSession;
  while (true) {
    try {
      let savedSessionPacket;
      let data183 = "---------------";
      let initValues = { colorA: 53, colorB: 53, fontCheck: 9819, timezoneCheck: 52, screenCheck: 650 };

      if (currentSession) {
        savedSessionPacket = currentSession;
      } else {
        const phase1Result = await runPhase1ForConnection(proxy, connId);
        if (!phase1Result?.sessionPacket) {
          logError(`Conn ${connId} — Phase 1 returned no session packet`);
          return;
        }
        savedSessionPacket = phase1Result.sessionPacket;
        data183 = phase1Result.data183 || "---------------";
        initValues = phase1Result.initValues;
        saveSession(savedSessionPacket);
      }

      await runPhase2ForConnection(proxy, savedSessionPacket, connId, count, data183, initValues);
      logInfo(`Conn ${connId} — Lobby socket ended; reconnecting with the existing session...`);
      await new Promise(r => setTimeout(r, 1000));
      currentSession = savedSessionPacket;
    } catch (err) {
      if (err.message.includes('4211')) {
        buildAttempt++;
        if (buildAttempt >= MAX_BUILD_RETRIES) {
          logError(`Conn ${connId} — Failed after ${MAX_BUILD_RETRIES} build number retries`);
          return;
        }
        logWarn(`Conn ${connId} — Retrying with new build number (attempt ${buildAttempt + 1}/${MAX_BUILD_RETRIES})...`);
        currentSession = null;
      } else if (err.message.includes('4563')) {
        // reuse currentSession, skip phase 1
      } else if (isProxyError(err)) {
        const delay = 3000 + Math.random() * 4000;
        logWarn(`Conn ${connId} — Proxy congestion, retrying in ${(delay / 1000).toFixed(1)}s...`);
        await new Promise(r => setTimeout(r, delay));
        currentSession = null;
      } else {
        logError(`Conn ${connId} — ${err.message}`);
        return;
      }
    }
  }
}

async function main() {
  banner();
  logSeparator();
  await initBuildNumber();
  logSeparator();

  const proxies = loadProxies();
  if (proxies.length === 0) {
    logWarn('No proxies loaded — running without proxy');
  } else {
    logInfo(`Loaded ${c.bWhite}${proxies.length}${c.reset}${rgb(160, 120, 255)} proxies`);
  }
  logSeparator();

  const modeInput = await prompt(`${rgb(...START_COLOR)}${c.bold} ›  ${c.reset}${rgb(160, 120, 255)}Use existing sessions? (y/n): ${c.reset}`);
  const useExisting = modeInput.toLowerCase() === 'y';

  let sessions = [];
  if (useExisting) {
    sessions = loadSessions();
    if (sessions.length === 0) { logError('No sessions found in sessions.txt'); return; }
    logInfo(`Loaded ${c.bWhite}${sessions.length}${rgb(160, 120, 255)} sessions`);
  }
  logSeparator();

  const input = await prompt(`${c.bYellow} How many Connections${c.bWhite}?${c.reset} ${c.dim}›${c.reset} `);
  const count = parseInt(input, 10);
  if (isNaN(count) || count < 1) { logError('Invalid connection count'); return; }

  if (useExisting && count > sessions.length) {
    logError(`Not enough sessions — you have ${sessions.length} but requested ${count}`);
    return;
  }

  logSeparator();
  logInfo(`Spawning ${c.bWhite}${count}${rgb(160, 120, 255)} connections...`);
  logSeparator();
  console.log();

  const tasks = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 50));
    tasks.push(runConnection(i + 1, getProxyForIndex(proxies, i), count, useExisting ? sessions[i] : null));
  }
  await Promise.allSettled(tasks);

  console.log();
  logSeparator();
  logSuccess('All connections done');
  if (!useExisting) logInfo(`Sessions saved to ${c.bWhite}sessions.txt`);
  logSeparator();
}

if (require.main === module) {
  main().catch((error) => {
    logError(error.message || String(error));
    process.exitCode = 1;
  });
}

module.exports = {
  BitStreamReader,
  URL2,
  buildInitBuffer,
  buildLobbyJoinPacket,
  getProxyForIndex,
  parseBuildNumber,
  solveChallengePacket,
};
