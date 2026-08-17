#!/usr/bin/env node
/* eslint-disable no-console */
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';

const DEVTOOLS_HOST = process.env.DEVTOOLS_HOST ?? '127.0.0.1';
const DEVTOOLS_PORT = Number(process.env.DEVTOOLS_PORT ?? '9222');
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? '20000');

class BufferedSocket {
  /** @param {net.Socket} socket */
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.closed = false;
    this.error = null;
    this.waiters = [];

    socket.on('data', (chunk) => {
      this.buf = Buffer.concat([this.buf, chunk]);
      this._notify();
    });
    socket.on('end', () => {
      this.closed = true;
      this._notify();
    });
    socket.on('error', (err) => {
      this.error = err;
      this.closed = true;
      this._notify();
    });
  }

  _notify() {
    const waiters = this.waiters;
    this.waiters = [];
    for (const w of waiters) w();
  }

  _waitFor(predicate) {
    if (predicate()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (this.error) return reject(this.error);
        if (this.closed) return reject(new Error('socket closed'));
        if (predicate()) return resolve();
        if (Date.now() - start > TIMEOUT_MS) return reject(new Error('timeout waiting for socket data'));
        this.waiters.push(tick);
      };
      this.waiters.push(tick);
    });
  }

  async readN(n) {
    await this._waitFor(() => this.buf.length >= n);
    const out = this.buf.slice(0, n);
    this.buf = this.buf.slice(n);
    return out;
  }

  async readUntil(needle, maxBytes) {
    const needleBuf = Buffer.from(needle, 'utf8');
    await this._waitFor(() => this.buf.indexOf(needleBuf) !== -1 || this.buf.length > maxBytes);
    const idx = this.buf.indexOf(needleBuf);
    if (idx === -1) throw new Error('readUntil exceeded maxBytes');
    const out = this.buf.slice(0, idx + needleBuf.length).toString('utf8');
    this.buf = this.buf.slice(idx + needleBuf.length);
    return out;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const httpGetJson = (path) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: DEVTOOLS_HOST, port: DEVTOOLS_PORT, path, method: 'GET' },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
};

const parseWsUrl = (wsUrl) => {
  const u = new URL(wsUrl);
  return { host: u.hostname, port: Number(u.port), path: u.pathname + u.search };
};

const wsHandshake = async (socketBuf, { host, path }) => {
  const key = crypto.randomBytes(16).toString('base64');
  const req =
    `GET ${path} HTTP/1.1\r\n` +
    `Host: ${host}\r\n` +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Key: ${key}\r\n` +
    'Sec-WebSocket-Version: 13\r\n' +
    '\r\n';
  socketBuf.socket.write(req);
  const header = await socketBuf.readUntil('\r\n\r\n', 32 * 1024);
  if (!header.includes(' 101 ')) {
    throw new Error(`WebSocket handshake failed: ${header.split('\r\n')[0] ?? header}`);
  }
};

const wsSendText = (socket, text) => {
  const payload = Buffer.from(text, 'utf8');
  const mask = crypto.randomBytes(4);

  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text
    header[1] = 0x80 | payload.length; // masked
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    throw new Error('payload too large');
  }

  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i++) {
    masked[i] = payload[i] ^ mask[i % 4];
  }

  socket.write(Buffer.concat([header, mask, masked]));
};

const wsReadFrame = async (socketBuf) => {
  const first2 = await socketBuf.readN(2);
  const opcode = first2[0] & 0x0f;
  const masked = (first2[1] & 0x80) !== 0;
  let len = first2[1] & 0x7f;

  if (len === 126) {
    len = (await socketBuf.readN(2)).readUInt16BE(0);
  } else if (len === 127) {
    throw new Error('64-bit lengths not supported');
  }

  const mask = masked ? await socketBuf.readN(4) : null;
  const payload = len ? await socketBuf.readN(len) : Buffer.alloc(0);
  const data = mask
    ? Buffer.from(payload.map((b, i) => b ^ mask[i % 4]))
    : payload;

  return { opcode, data };
};

const cdpCall = async (socketBuf, id, method, params) => {
  wsSendText(socketBuf.socket, JSON.stringify({ id, method, params }));
  while (true) {
    const frame = await wsReadFrame(socketBuf);
    if (frame.opcode !== 1) continue; // text only
    const msg = JSON.parse(frame.data.toString('utf8'));
    if (msg.id !== id) continue;
    if (msg.error) throw new Error(`CDP error: ${JSON.stringify(msg.error)}`);
    return msg.result;
  }
};

const cdpEval = async (socketBuf, id, expression, { awaitPromise = false, contextId = undefined } = {}) => {
  const result = await cdpCall(socketBuf, id, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
    ...(contextId === undefined ? {} : { contextId })
  });
  return result?.result?.value;
};

const connectToTarget = async (target) => {
  if (!target.webSocketDebuggerUrl) throw new Error('target missing webSocketDebuggerUrl');
  const ws = parseWsUrl(target.webSocketDebuggerUrl);
  const socket = net.connect({ host: ws.host, port: ws.port });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('error', reject);
  });
  const socketBuf = new BufferedSocket(socket);
  await wsHandshake(socketBuf, ws);
  return socketBuf;
};

const findTarget = async (predicate, label) => {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    const targets = await httpGetJson('/json/list');
    const t = targets.find(predicate);
    if (t) return t;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for target: ${label}`);
};

const flattenFrameTree = (frameTree) => {
  const out = [frameTree];
  for (const child of frameTree.childFrames ?? []) {
    out.push(...flattenFrameTree(child));
  }
  return out;
};

const connectToTargetWithFrameContext = async (targetPredicate, framePredicate, targetLabel, frameLabel) => {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    const targets = await httpGetJson('/json/list');
    for (const target of targets.filter(targetPredicate)) {
      let socketBuf;
      try {
        socketBuf = await connectToTarget(target);
        const tree = await cdpCall(socketBuf, 101, 'Page.getFrameTree', {});
        const frameNode = flattenFrameTree(tree.frameTree).find((node) => framePredicate(node.frame));
        if (!frameNode) {
          socketBuf.socket.end();
          continue;
        }
        const world = await cdpCall(socketBuf, 102, 'Page.createIsolatedWorld', {
          frameId: frameNode.frame.id,
          worldName: 'ytcf-verify',
          grantUniveralAccess: true
        });
        return { socketBuf, contextId: world.executionContextId, target };
      } catch {
        socketBuf?.socket.destroy();
      }
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${targetLabel} with ${frameLabel}`);
};

const clickByText = async (socketBuf, id, text) => {
  const expr = `
    (() => {
      const text = ${JSON.stringify(text)};
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => (b.textContent || '').replace(/\\s+/g,' ').trim().includes(text));
      if (!btn) return false;
      btn.click();
      return true;
    })()
  `;
  return await cdpEval(socketBuf, id, expr);
};

const waitForSelector = async (socketBuf, id, selector) => {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    const ok = await cdpEval(socketBuf, id, `!!document.querySelector(${JSON.stringify(selector)})`);
    if (ok) return true;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for selector: ${selector}`);
};

const waitForEval = async (socketBuf, id, expression, label, options = {}) => {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    const ok = await cdpEval(socketBuf, id, expression, options);
    if (ok) return true;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for: ${label}`);
};

const main = async () => {
  const swTarget = await findTarget(
    (t) => t.type === 'service_worker' && typeof t.url === 'string' && t.url.includes('chat-background'),
    'ytcfilter service worker'
  );
  const sw = await connectToTarget(swTarget);
  // Force a clean "first run" setup state for verification.
  await cdpEval(
    sw,
    99,
    `
      (async () => {
        await new Promise(r => chrome.storage.local.remove([
          'ytcf.initialSetupDone',
          'ytcf.currentStorageVersion'
        ], r));
        await new Promise(r => chrome.storage.local.set({
          'ytcf.initialSetupDone': false
        }, r));
        await new Promise(r => chrome.storage.sync.remove([
          'ytcf.initialSetupDone',
          'ytcf.currentStorageVersion'
        ], r));
        return true;
      })()
    `,
    { awaitPromise: true }
  );
  const storageSnapshot = await cdpEval(
    sw,
    100,
    `
      (async () => {
        const local = await new Promise(r => chrome.storage.local.get([
          'ytcf.initialSetupDone',
          'ytcf.currentStorageVersion'
        ], r));
        const sync = await new Promise(r => chrome.storage.sync.get([
          'ytcf.initialSetupDone',
          'ytcf.currentStorageVersion'
        ], r));
        return { local, sync };
      })()
    `,
    { awaitPromise: true }
  );
  sw.socket.end();
  console.log('storage snapshot:', JSON.stringify(storageSnapshot));

  const { socketBuf: live, contextId: liveContextId } = await connectToTargetWithFrameContext(
    (t) => t.type === 'page' && typeof t.url === 'string' && t.url.includes('/watch') && t.url.includes('X4VbdwhkE10'),
    (frame) => frame.name === 'chatframe' && frame.url.includes('/live_chat') && frame.url.includes('continuation='),
    'youtube watch page',
    'embedded live chat frame'
  );

  // Injected bar exists.
  await waitForEval(
    live,
    1,
    "!!document.querySelector('.ytcf-launch-button') && !!document.querySelector('.ytcf-iframe')",
    'injected YTCF controls on embedded live_chat frame',
    { contextId: liveContextId }
  );

  // Use "Popout" so the embed surface becomes a top-level CDP target.
  await cdpEval(live, 3, "document.querySelector('.ytcf-popout-button')?.click(); true", { contextId: liveContextId });

  // First run should redirect the embed to setup.html.
  const setupTarget = await findTarget(
    (t) => typeof t.url === 'string' && t.url.includes('setup.html'),
    'setup.html'
  );
  const setup = await connectToTarget(setupTarget);

  await waitForSelector(setup, 10, 'button');
  const clickedStartSetup = await clickByText(setup, 11, 'Start Setup');
  if (!clickedStartSetup) throw new Error('setup: missing "Start Setup" button');

  const clickedStartImport = await clickByText(setup, 12, 'Start Import');
  if (!clickedStartImport) throw new Error('setup: missing "Start Import" button');

  // Wait for done panel.
  await waitForSelector(setup, 13, 'button');
  const clickedLetsGo = await clickByText(setup, 14, "Let's Go!");
  if (!clickedLetsGo) throw new Error("setup: missing \"Let's Go!\" button");
  setup.socket.end();

  // After setup, the embed frame should land back on youtube embed and mount UI.
  const ytEmbedTarget = await findTarget(
    (t) => typeof t.url === 'string' && t.url.includes('/embed/ytcfilter_embed'),
    'youtube embed ytcfilter_embed'
  );
  const ytEmbed = await connectToTarget(ytEmbedTarget);
  await waitForSelector(ytEmbed, 20, '.hyperchat-root');

  const hasPresetSelector = await cdpEval(ytEmbed, 21, "!!document.querySelector('.preset-selector')");
  if (!hasPresetSelector) throw new Error('embed: expected preset selector in mounted UI');
  ytEmbed.socket.end();

  // Open Settings from injected bar.
  await cdpEval(live, 30, "document.querySelector('.ytcf-settings-button')?.click(); true", { contextId: liveContextId });
  const optionsTarget = await findTarget(
    (t) => typeof t.url === 'string' && t.url.includes('options.html'),
    'options.html'
  );
  const options = await connectToTarget(optionsTarget);
  await waitForSelector(options, 40, '.navbar');
  const tabCount = await cdpEval(options, 41, "document.querySelectorAll('.navbar-item').length");
  if (tabCount < 3) throw new Error(`options: expected 3 tabs, got ${tabCount}`);

  // Filters tab should show "Create New Filter".
  await waitForSelector(options, 42, '.add-filter-button');
  const beforeFilters = await cdpEval(options, 43, "document.querySelectorAll('.filter').length");
  await cdpEval(options, 44, "document.querySelector('.add-filter-button')?.click(); true");

  // New filter should open in edit mode and expose a Save button.
  await waitForSelector(options, 45, '.filter .filter-name');
  const clickedSave = await cdpEval(
    options,
    46,
    `
      (() => {
        const btn = Array.from(document.querySelectorAll('.filter button'))
          .find(b => (b.textContent || '').replace(/\\s+/g,' ').trim().startsWith('Save'));
        if (!btn) return false;
        btn.click();
        return true;
      })()
    `
  );
  if (!clickedSave) throw new Error('options: new filter did not expose a Save button');

  // Should persist into the preset store; a simple proxy is that filter count increments.
  const afterFilters = await cdpEval(options, 47, "document.querySelectorAll('.filter').length");
  if (afterFilters <= beforeFilters) {
    throw new Error(`options: expected filter count to increase (${beforeFilters} -> ${afterFilters})`);
  }

  // Give the store time to flush into chrome.storage (MV3 service worker).
  // Also wait for the editor UI to collapse back to summary mode.
  const startCollapse = Date.now();
  while (Date.now() - startCollapse < TIMEOUT_MS) {
    const editing = await cdpEval(options, 47_1, "document.querySelectorAll('.filter .filter-name').length");
    if (editing === 0) break;
    await sleep(200);
  }
  await sleep(800);

  // Reload and ensure count stays.
  await cdpEval(options, 48, 'location.reload(); true');
  await waitForSelector(options, 49, '.add-filter-button');
  const afterReloadFilters = await cdpEval(options, 50, "document.querySelectorAll('.filter').length");
  if (afterReloadFilters < afterFilters) {
    throw new Error(`options: expected filter count to persist after reload (${afterFilters} -> ${afterReloadFilters})`);
  }

  options.socket.end();
  live.socket.end();

  console.log(JSON.stringify({
    ok: true,
    embedUrl: ytEmbedTarget.url,
    tabCount,
    beforeFilters,
    afterFilters,
    afterReloadFilters
  }, null, 2));
};

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});
