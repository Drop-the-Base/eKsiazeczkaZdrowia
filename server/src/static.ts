import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.traineddata': 'application/octet-stream',
};

/** Maps a URL path inside an app to a file under `root`; `null` if it escapes the root or is malformed. */
export function resolveStaticPath(root: string, urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const file = normalize(join(root, decoded));
  return file === root || file.startsWith(root + sep) ? file : null;
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * Serves `urlPath` from `root` with SPA fallback to `index.html` for paths without an extension.
 * Returns false when nothing matched (caller sends 404).
 */
export async function serveStatic(
  res: ServerResponse,
  root: string,
  urlPath: string,
  headers: Record<string, string>,
  method: string,
): Promise<boolean> {
  const resolved = resolveStaticPath(root, urlPath === '/' ? '/index.html' : urlPath);
  if (resolved === null) return false;

  let file = resolved;
  if (!(await isFile(file))) {
    if (extname(urlPath) !== '') return false;
    file = join(root, 'index.html');
    if (!(await isFile(file))) return false;
  }

  const type = MIME[extname(file)] ?? 'application/octet-stream';
  // Hashed Vite assets never change; everything else must be revalidated (index.html, sw.js, manifest).
  const cache = file.includes(`${sep}assets${sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache, ...headers });
  if (method === 'HEAD') {
    res.end();
    return true;
  }
  createReadStream(file)
    .on('error', () => res.destroy())
    .pipe(res);
  return true;
}
