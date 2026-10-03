import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import type { HealthDatabase } from './database';
import { initDemoData } from './demo';
import { openTestDb } from './testDb';

const now = '2026-10-03T18:00:00.000Z';
let dexie: HealthDatabase;
afterEach(async () => {
  await dexie.delete();
});

describe('initDemoData', () => {
  it('loads the demo into an empty database when auto-load is on', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    expect(await initDemoData(t.dexie, t.db, t.vault, { search: '', autoLoad: true, now })).toBe(
      'loaded',
    );
    expect((await t.db.profile.get())?.name).toBe('Anna Kowalska');
    expect((await t.db.medications.list()).length).toBeGreaterThan(3);
    const doc = await t.db.documents.get('demo-doc-cbc');
    expect(await doc?.file.text()).toContain('HGB');
  });

  it('does nothing without auto-load or when data exists', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    expect(await initDemoData(t.dexie, t.db, t.vault, { search: '', autoLoad: false, now })).toBe(
      'skipped',
    );
    expect(await t.dexie.medications.count()).toBe(0);
    await t.db.profile.save({
      id: 'me',
      name: 'Ja',
      birthDate: '1990-01-01',
      allergies: [],
      language: 'pl',
    });
    expect(await initDemoData(t.dexie, t.db, t.vault, { search: '', autoLoad: true, now })).toBe(
      'skipped',
    );
    expect((await t.db.profile.get())?.name).toBe('Ja');
  });

  it('?demo=reset wipes data and PIN, then loads the demo after a new PIN', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await t.db.symptoms.add({ name: 'kaszel', startedAt: now, source: 'manual' });
    const done = initDemoData(t.dexie, t.db, t.vault, {
      search: '?demo=reset',
      autoLoad: false,
      now,
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(t.vault.status).toBe('no-pin');
    await t.vault.setup('4321');
    expect(await done).toBe('reset');
    expect((await t.db.symptoms.list()).some((s) => s.name === 'kaszel')).toBe(false);
    expect((await t.db.profile.get())?.name).toBe('Anna Kowalska');
  });
});
