import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import type { HealthDatabase } from './database';
import { startDemo } from './demo';
import { openTestDb } from './testDb';

const now = '2026-10-03T18:00:00.000Z';
let dexie: HealthDatabase;
afterEach(async () => {
  await dexie.delete();
});

describe('startDemo', () => {
  it('fresh: wipes everything, sets the demo PIN and loads Pani Anna', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await t.db.symptoms.add({ name: 'kaszel', startedAt: now, source: 'manual' });
    await startDemo(t.dexie, t.db, t.vault, { pin: '1234', fresh: true, now });
    expect(t.vault.status).toBe('unlocked');
    expect((await t.db.symptoms.list()).some((s) => s.name === 'kaszel')).toBe(false);
    expect((await t.db.profile.get())?.name).toBe('Anna Kowalska');
    expect((await t.db.medications.list()).length).toBeGreaterThan(3);
    const doc = await t.db.documents.get('demo-doc-cbc');
    expect(await doc?.file.text()).toContain('HGB');
    await t.vault.verifyPin('1234');
  });

  it('reload: keeps what the visitor added and unlocks with the demo PIN', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await startDemo(t.dexie, t.db, t.vault, { pin: '1234', fresh: true, now });
    await t.db.symptoms.add({ name: 'kaszel', startedAt: now, source: 'manual' });
    t.vault.lock();
    await startDemo(t.dexie, t.db, t.vault, { pin: '1234', fresh: false, now });
    expect(t.vault.status).toBe('unlocked');
    expect((await t.db.symptoms.list()).some((s) => s.name === 'kaszel')).toBe(true);
  });
});
