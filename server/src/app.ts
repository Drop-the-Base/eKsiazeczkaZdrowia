import { createServer, type Server } from 'node:http';
import { WebSocketServer } from 'ws';
import { LLM_QUERY_PATH, RELAY_MAX_MESSAGE_BYTES, RELAY_PATH } from '@ez/shared';
import { COMMON_HEADERS, DOCTOR_HEADERS } from './headers.js';
import { handleJson, sendJson, type JsonHandler } from './json.js';
import { handleRelayConnection } from './relay.js';
import { serveStatic } from './static.js';

/** Doctor app is served under this prefix (its Vite `base`), the patient PWA at the root. */
export const DOCTOR_BASE = '/lekarz/';

export interface AppOptions {
  patientDist: string;
  doctorDist: string;
  llmQuery: JsonHandler;
}

export function createApp(opts: AppOptions): Server {
  const wss = new WebSocketServer({ noServer: true, maxPayload: RELAY_MAX_MESSAGE_BYTES });
  wss.on('connection', handleRelayConnection);

  const server = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const method = req.method ?? 'GET';

    if (path === '/health') return sendJson(res, 200, { ok: true });
    if (path === LLM_QUERY_PATH) return void handleJson(req, res, opts.llmQuery);

    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, COMMON_HEADERS);
      return void res.end();
    }
    if (path === DOCTOR_BASE.slice(0, -1)) {
      res.writeHead(301, { ...COMMON_HEADERS, Location: DOCTOR_BASE });
      return void res.end();
    }

    const [root, subPath, headers] = path.startsWith(DOCTOR_BASE)
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

  return server;
}
