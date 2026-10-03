import type { IncomingMessage, ServerResponse } from 'node:http';
import { API_HEADERS } from './headers.js';

/** Thrown by handlers for invalid input → 400 with this message. */
export class BadRequest extends Error {}

export type JsonHandler = (body: unknown) => Promise<unknown>;

const MAX_BODY_BYTES = 16 * 1024;

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    size += buf.length;
    if (size > MAX_BODY_BYTES) throw new BadRequest('Za duże żądanie');
    chunks.push(buf);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new BadRequest('Niepoprawny JSON');
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, API_HEADERS);
  res.end(JSON.stringify(body));
}

/** Runs a JSON POST handler. Request content is never logged (LLM endpoints are anonymous). */
export async function handleJson(
  req: IncomingMessage,
  res: ServerResponse,
  handler: JsonHandler,
): Promise<void> {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Tylko POST' });
  try {
    sendJson(res, 200, await handler(await readJson(req)));
  } catch (err) {
    if (err instanceof BadRequest) return sendJson(res, 400, { error: err.message });
    console.error('Błąd handlera', err instanceof Error ? err.name : 'unknown');
    sendJson(res, 500, { error: 'Błąd serwera' });
  }
}
