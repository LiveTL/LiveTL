#!/usr/bin/env node
/* eslint-disable no-console */
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';

const DEVTOOLS_HOST = process.env.DEVTOOLS_HOST ?? '127.0.0.1';
const DEVTOOLS_PORT = Number(process.env.DEVTOOLS_PORT ?? '9222');
const TARGET_URL_SUBSTR = process.env.TARGET_URL_SUBSTR ?? 'live_chat';
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? '10000');

class BufferedSocket {
  /** @param {net.Socket} socket */
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.closed = false;
    this.error = null;
    /** @type {Array<() => void>} */
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
  const header = await socketBuf.readUntil('\r\n\r\n', 16 * 1024);
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

const cdpEval = async (socketBuf, id, expression) => {
  const result = await cdpCall(socketBuf, id, 'Runtime.evaluate', {
    expression,
    returnByValue: true
  });
  return result?.result?.value;
};

const main = async () => {
  const targets = await httpGetJson('/json/list');
  const target = targets.find((t) => typeof t.url === 'string' && t.url.includes(TARGET_URL_SUBSTR));
  if (!target) {
    console.error(`No target URL containing ${JSON.stringify(TARGET_URL_SUBSTR)} found on DevTools port ${DEVTOOLS_PORT}.`);
    process.exit(2);
  }
  if (!target.webSocketDebuggerUrl) {
    console.error('Target missing webSocketDebuggerUrl:', target);
    process.exit(2);
  }

  const ws = parseWsUrl(target.webSocketDebuggerUrl);
  const socket = net.connect({ host: ws.host, port: ws.port });
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('error', reject);
  });
  const socketBuf = new BufferedSocket(socket);
  await wsHandshake(socketBuf, ws);

  // Minimal "does the injector UI exist" check.
  const hasButtons = await cdpEval(socketBuf, 1, "!!document.querySelector('.ytcf-launch-button')");
  const hasMount = await cdpEval(socketBuf, 2, "!!document.querySelector('.ytcf-iframe')");

  // Try mounting (best-effort): click the button once, then check for embed iframe src.
  await cdpEval(socketBuf, 3, "document.querySelector('.ytcf-launch-button')?.click(); true");
  const iframeSrc = await cdpEval(socketBuf, 4, "document.querySelector('.ytcf-iframe iframe')?.src ?? ''");

  socket.end();

  console.log(JSON.stringify({
    targetUrl: target.url,
    hasButtons,
    hasMount,
    iframeSrc
  }, null, 2));

  if (!hasButtons || !hasMount) process.exit(1);
};

main().catch((err) => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});

