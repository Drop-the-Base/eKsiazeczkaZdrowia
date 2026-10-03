import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDb } from './createDb';
import type { HealthDatabase } from './database';
import { openTestDb } from './testDb';
import { createVault, WrongPinError } from './vault';

let dexie: HealthDatabase;
afterEach(async () => {
  await dexie.delete();
});

const symptom = {
  name: 'zawroty głowy',
  startedAt: '2026-10-01T10:00:00.000Z',
  source: 'manual' as const,
};

describe('encrypted database', () => {
  it('stores only ciphertext in IndexedDB', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await t.db.symptoms.add(symptom);
    await t.db.profile.save({
      id: 'p',
      name: 'Anna Kowalska',
      birthDate: '1968-04-02',
      allergies: ['penicylina'],
      language: 'pl',
    });
    const raw = [...(await t.dexie.symptoms.toArray()), ...(await t.dexie.profile.toArray())];
    const dump = JSON.stringify(raw, (_k, v: unknown) =>
      v instanceof ArrayBuffer || ArrayBuffer.isView(v)
        ? new TextDecoder().decode(v as ArrayBuffer)
        : v,
    );
    expect(dump).not.toContain('zawroty');
    expect(dump).not.toContain('Kowalska');
    expect(Object.keys(raw[0]!).sort()).toEqual(['enc', 'id']);
    expect((await t.db.symptoms.list())[0]).toMatchObject(symptom);
  });

  it('encrypts blobs and restores them', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    const photo = await t.db.photos.add({
      blob: new Blob(['zdjęcie-skóry'], { type: 'image/jpeg' }),
      takenAt: '2026-10-01T10:00:00.000Z',
      category: 'skin',
    });
    const raw = await t.dexie.photos.get(photo.id);
    expect(raw?.blobs?.blob?.type).toBe('image/jpeg');
    const back = await t.db.photos.get(photo.id);
    expect(back?.blob.type).toBe('image/jpeg');
    expect(await back?.blob.text()).toBe('zdjęcie-skóry');
  });

  it('waits while locked, rejects a wrong PIN and unlocks with the right one', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await t.db.symptoms.add(symptom);
    t.vault.lock();
    expect(t.vault.status).toBe('locked');
    let read: unknown;
    const pending = t.db.symptoms.list().then((r) => (read = r));
    await new Promise((r) => setTimeout(r, 30));
    expect(read).toBeUndefined();
    await expect(t.vault.unlock('0000')).rejects.toBeInstanceOf(WrongPinError);
    await t.vault.unlock('1234');
    await pending;
    expect(read).toHaveLength(1);
  });

  it('finds the PIN set on the next start and refuses a tampered row', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    const s = await t.db.symptoms.add(symptom);
    const vault2 = createVault(t.dexie);
    await new Promise((r) => setTimeout(r, 30));
    expect(vault2.status).toBe('locked');
    await vault2.unlock('1234');
    const db2 = createDb(t.dexie, vault2);
    const row = (await t.dexie.symptoms.get(s.id))!;
    await t.dexie.symptoms.put({ ...row, id: 'other' }); // ciphertext moved to another id
    await expect(db2.symptoms.get('other')).rejects.toThrow();
    expect(await db2.symptoms.get(s.id)).toMatchObject(symptom);
  });

  it('encrypts plain rows from before encryption when the PIN is set', async () => {
    const t = await openTestDb(null);
    dexie = t.dexie;
    await t.dexie.symptoms.put({ id: 'old', ...symptom } as never);
    await t.vault.setup('1234');
    expect(Object.keys((await t.dexie.symptoms.get('old'))!).sort()).toEqual(['enc', 'id']);
    expect(await t.db.symptoms.get('old')).toMatchObject(symptom);
  });

  it('validates the PIN format', async () => {
    const t = await openTestDb(null);
    dexie = t.dexie;
    await expect(t.vault.setup('12a4')).rejects.toThrow('PIN');
  });
});
