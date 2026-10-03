import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { HealthDatabase } from './database';
import { createDb } from './createDb';
import { initDemoData } from './demo';

const now = '2026-10-03T18:00:00.000Z';
let dexie: HealthDatabase;
const fresh = () => (dexie = new HealthDatabase(`demo-${Math.random()}`));
afterEach(async () => {
  await dexie.delete();
});

describe('initDemoData', () => {
  it('loads the demo into an empty database when auto-load is on', async () => {
    fresh();
    expect(await initDemoData(dexie, { search: '', autoLoad: true, now })).toBe('loaded');
    const db = createDb(dexie);
    expect((await db.profile.get())?.name).toBe('Anna Kowalska');
    expect((await db.medications.list()).length).toBeGreaterThan(3);
    const doc = (await db.documents.list())[0];
    expect(doc?.file).toBeInstanceOf(Blob);
  });

  it('does nothing without auto-load or when data exists', async () => {
    fresh();
    expect(await initDemoData(dexie, { search: '', autoLoad: false, now })).toBe('skipped');
    expect(await dexie.medications.count()).toBe(0);

    const db = createDb(dexie);
    await db.symptoms.add({ name: 'kaszel', startedAt: now, source: 'manual' });
    await db.profile.save({
      id: 'me',
      name: 'Ja',
      birthDate: '1990-01-01',
      allergies: [],
      language: 'pl',
    });
    expect(await initDemoData(dexie, { search: '', autoLoad: true, now })).toBe('skipped');
    expect((await db.profile.get())?.name).toBe('Ja');
  });

  it('resets everything on ?demo=reset', async () => {
    fresh();
    const db = createDb(dexie);
    await db.symptoms.add({ name: 'kaszel', startedAt: now, source: 'manual' });
    expect(await initDemoData(dexie, { search: '?demo=reset', autoLoad: false, now })).toBe(
      'reset',
    );
    expect((await db.symptoms.list()).some((s) => s.name === 'kaszel')).toBe(false);
    expect((await db.profile.get())?.name).toBe('Anna Kowalska');
  });
});
