import { createServer, type Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  LLM_QUERY_PATH,
  LLM_VISIT_NOTE_PATH,
  RELAY_MAX_MESSAGE_BYTES,
  RELAY_PATH,
} from '@ez/shared';
import { COMMON_HEADERS, DOCTOR_HEADERS } from './headers.js';
import { handleJson, sendJson, type JsonHandler } from './json.js';
import { createRelay, type RelayOptions } from './relay.js';
import { serveStatic } from './static.js';

/** Doctor app is served under this prefix (its Vite `base`), the patient PWA at the root. */
export const DOCTOR_BASE = '/lekarz/';
/** The same doctor app in demo mode (guide + simulated phone); its assets still load from DOCTOR_BASE. */
export const DOCTOR_DEMO_BASE = '/demo/lekarz/';

export interface AppOptions {
  patientDist: string;
  doctorDist: string;
  llmQuery: JsonHandler;
  llmVisitNote: JsonHandler;
  relay?: RelayOptions;
}

/** Dead connections (phone asleep, network switch) are dropped after one missed ping. */
const HEARTBEAT_MS = 30_000;

export function createApp(opts: AppOptions): Server {
  const wss = new WebSocketServer({ noServer: true, maxPayload: RELAY_MAX_MESSAGE_BYTES });
  const relay = createRelay(opts.relay);
  const alive = new WeakSet<WebSocket>();
  wss.on('connection', (ws) => {
    alive.add(ws);
    ws.on('pong', () => alive.add(ws));
    relay.handleConnection(ws);
  });
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!alive.has(ws)) ws.terminate();
      else {
        alive.delete(ws);
        ws.ping();
      }
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();

  const server = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const method = req.method ?? 'GET';

    if (path === '/health') return sendJson(res, 200, { ok: true });
    if (path === LLM_QUERY_PATH) return void handleJson(req, res, opts.llmQuery);
    if (path === LLM_VISIT_NOTE_PATH) return void handleJson(req, res, opts.llmVisitNote);

    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, COMMON_HEADERS);
      return void res.end();
    }
    for (const base of [DOCTOR_BASE, DOCTOR_DEMO_BASE]) {
      if (path === base.slice(0, -1)) {
        res.writeHead(301, { ...COMMON_HEADERS, Location: base });
        return void res.end();
      }
    }

    const [root, subPath, headers] = path.startsWith(DOCTOR_DEMO_BASE)
      ? [opts.doctorDist, '/', DOCTOR_HEADERS]
      : path.startsWith(DOCTOR_BASE)
        ? [opts.doctorDist, path.slice(DOCTOR_BASE.length - 1), DOCTOR_HEADERS]
        : [opts.patientDist, path, COMMON_HEADERS];

    serveStatic(res, root, subPath, headers, method)
      .then((served) => {
        if (served) return;
        res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Nie znaleziono');
      })
      .catch(() => {
        if (!res.headersSent) res.writeHead(500, headers);
        res.end();
      });
  });

  server.on('upgrade', (req, socket, head) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    if (path !== RELAY_PATH) return void socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  server.on('close', () => {
    clearInterval(heartbeat);
    relay.close();
  });

  return server;
}
