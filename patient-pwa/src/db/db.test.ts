import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import type { Medication, Profile } from '@ez/shared';
import { HealthDatabase } from './database';
import { createDb } from './createDb';

let dexie: HealthDatabase;
function freshDb() {
  dexie = new HealthDatabase(`test-${Math.random()}`);
  return createDb(dexie);
}
afterEach(async () => {
  await dexie.delete();
});

const med = (over: Partial<Medication> = {}): Omit<Medication, 'id'> => ({
  name: 'Lek A',
  dose: '100',
  unit: 'mg',
  schedule: { type: 'daily', times: ['08:00'] },
  category: 'prescription',
  startDate: '2026-08-01',
  source: 'manual',
  ...over,
});

describe('db', () => {
  it('adds, gets, updates and removes a record', async () => {
    const db = freshDb();
    const added = await db.medications.add(med());
    expect(added.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await db.medications.get(added.id)).toEqual(added);

    await db.medications.update(added.id, { endDate: '2026-09-01', stopReason: 'mdłości' });
    expect(await db.medications.get(added.id)).toMatchObject({
      endDate: '2026-09-01',
      stopReason: 'mdłości',
    });

    await db.medications.update(added.id, { endDate: undefined });
    expect((await db.medications.get(added.id))?.endDate).toBeUndefined();

    await db.medications.remove(added.id);
    expect(await db.medications.list()).toEqual([]);
  });

  it('throws when updating a missing record', async () => {
    const db = freshDb();
    await expect(db.symptoms.update('missing', { name: 'x' })).rejects.toThrow();
  });

  it('lists sorted by date and filters inclusively by range', async () => {
    const db = freshDb();
    for (const startedAt of [
      '2026-09-03T10:00:00.000Z',
      '2026-09-01T23:30:00.000Z',
      '2026-09-05T08:00:00.000Z',
    ]) {
      await db.symptoms.add({ name: 'ból głowy', startedAt, source: 'manual' });
    }
    expect((await db.symptoms.list()).map((s) => s.startedAt.slice(0, 10))).toEqual([
      '2026-09-01',
      '2026-09-03',
      '2026-09-05',
    ]);
    expect((await db.symptoms.between('2026-09-01', '2026-09-03')).length).toBe(2);
  });

  it('finds medications active within a range', async () => {
    const db = freshDb();
    await db.medications.add(
      med({ name: 'stary', startDate: '2026-01-01', endDate: '2026-02-01' }),
    );
    await db.medications.add(med({ name: 'trwa', startDate: '2026-03-01' }));
    await db.medications.add(
      med({ name: 'krótki', startDate: '2026-08-10', endDate: '2026-08-20' }),
    );
    await db.medications.add(med({ name: 'przyszły', startDate: '2026-12-01' }));
    const active = await db.medications.activeBetween('2026-08-01', '2026-09-30');
    expect(active.map((m) => m.name)).toEqual(['trwa', 'krótki']);
  });

  it('keeps a single profile', async () => {
    const db = freshDb();
    expect(await db.profile.get()).toBeUndefined();
    const p: Profile = {
      id: 'p1',
      name: 'Anna',
      birthDate: '1968-04-02',
      allergies: [],
      language: 'pl',
    };
    await db.profile.save(p);
    await db.profile.save({ ...p, id: 'p2', name: 'Anna K.' });
    expect(await db.profile.get()).toEqual({ ...p, id: 'p2', name: 'Anna K.' });
  });
});
