import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import { createApp } from './app';
import { handleQueryStub } from './queryStub';
import { resolveStaticPath } from './static';

let base = '';
let close: () => void = () => {};

beforeAll(async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ez-'));
  const patient = join(dir, 'patient');
  const doctor = join(dir, 'doctor');
  await mkdir(join(patient, 'assets'), { recursive: true });
  await mkdir(doctor, { recursive: true });
  await writeFile(join(patient, 'index.html'), 'patient');
  await writeFile(join(patient, 'assets', 'a.js'), 'js');
  await writeFile(join(doctor, 'index.html'), 'doctor');
  const server = createApp({ patientDist: patient, doctorDist: doctor, llmQuery: handleQueryStub });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});
afterAll(() => close());

describe('server', () => {
  it('answers /health', async () => {
    expect(await (await fetch(`${base}/health`)).json()).toEqual({ ok: true });
  });

  it('serves the patient PWA with SPA fallback and immutable assets', async () => {
    const page = await fetch(`${base}/os-czasu`);
    expect(await page.text()).toBe('patient');
    expect(page.headers.get('cache-control')).toBe('no-cache');
    const asset = await fetch(`${base}/assets/a.js`);
    expect(asset.headers.get('cache-control')).toContain('immutable');
    expect((await fetch(`${base}/assets/missing.js`)).status).toBe(404);
  });

  it('serves the doctor app with no-store and CSP', async () => {
    const res = await fetch(`${base}/lekarz/sesja`);
    expect(await res.text()).toBe('doctor');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('content-security-policy')).toContain("script-src 'self'");
    const redirect = await fetch(`${base}/lekarz`, { redirect: 'manual' });
    expect(redirect.headers.get('location')).toBe('/lekarz/');
  });

  it('answers the LLM query stub and rejects bad bodies', async () => {
    const ok = await fetch(`${base}/llm/query`, {
      method: 'POST',
      body: JSON.stringify({ question: 'Kiedy ostatnio brałam leki przeciwzakrzepowe?' }),
    });
    expect(((await ok.json()) as { filter: unknown }).filter).toMatchObject({
      entity: 'medication',
      atcPrefix: 'B01',
    });
    expect((await fetch(`${base}/llm/query`, { method: 'POST', body: '{' })).status).toBe(400);
    expect((await fetch(`${base}/llm/query`, { method: 'POST', body: '{}' })).status).toBe(400);
  });

  it('accepts WebSocket upgrades only on /relay', async () => {
    const msg = await new Promise<string>((resolve, reject) => {
      const ws = new WebSocket(`${base.replace('http', 'ws')}/relay`);
      ws.on('message', (data) => resolve(String(data)));
      ws.on('error', reject);
    });
    expect(JSON.parse(msg).type).toBe('error');
    await expect(
      new Promise((resolve, reject) => {
        const ws = new WebSocket(`${base.replace('http', 'ws')}/other`);
        ws.on('open', resolve);
        ws.on('error', reject);
      }),
    ).rejects.toThrow();
  });
});

describe('resolveStaticPath', () => {
  it('blocks path traversal', () => {
    expect(resolveStaticPath('/srv/app', '/../etc/passwd')).toBeNull();
    expect(resolveStaticPath('/srv/app', '/%2e%2e/etc/passwd')).toBeNull();
    expect(resolveStaticPath('/srv/app', '/%E0%A4%A')).toBeNull();
    expect(resolveStaticPath('/srv/app', '/..\\..\\etc\\passwd')).toBeNull();
    expect(resolveStaticPath('/srv/app', '/assets/a.js')).toBe(
      join(resolve('/srv/app'), 'assets', 'a.js'),
    );
  });
});
