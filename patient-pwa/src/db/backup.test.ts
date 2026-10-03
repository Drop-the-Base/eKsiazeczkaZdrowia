import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDemoData } from '@ez/shared';
import { decodeRecord, decryptBackup, exportBackup, restoreBackup } from './backup';
import type { HealthDatabase } from './database';
import { loadDemoData } from './demo';
import { openTestDb } from './testDb';

let dexie: HealthDatabase;
afterEach(async () => {
  await dexie.delete();
});
const now = '2026-10-03T18:00:00.000Z';

describe('backup export', () => {
  it('writes an encrypted file that only the password opens, with photos', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await loadDemoData(t.dexie, t.db, now);
    await t.db.photos.add({
      blob: new Blob(['zdjecie'], { type: 'image/jpeg' }),
      takenAt: now,
      category: 'skin',
    });

    const file = await exportBackup(t.db, 'dlugie-haslo', now);
    const text = JSON.stringify(file);
    expect(text).not.toContain('Kowalska');
    expect(text).not.toContain('Dazatynib');
    expect(file).toMatchObject({ format: 'eksiazeczka-zdrowia-backup', v: 1 });

    await expect(decryptBackup(file, 'zle-haslo-123')).rejects.toThrow('Nieprawidłowe hasło');
    const payload = await decryptBackup(JSON.parse(text), 'dlugie-haslo');
    expect(payload.profile[0]).toMatchObject({ name: 'Anna Kowalska' });
    expect(payload.medications).toHaveLength(createDemoData(now).medications.length);
    const photo = decodeRecord(payload.photos[0]!);
    expect(photo.blob).toBeInstanceOf(Blob);
    expect(await (photo.blob as Blob).text()).toBe('zdjecie');
  });

  it('rejects short passwords and foreign files', async () => {
    const t = await openTestDb();
    dexie = t.dexie;
    await expect(exportBackup(t.db, 'krotkie', now)).rejects.toThrow('8 znaków');
    await expect(decryptBackup({ hello: 1 }, 'dlugie-haslo')).rejects.toThrow(
      'To nie jest plik kopii',
    );
  });

  it('moves everything to another device with a different PIN', async () => {
    const a = await openTestDb('1111');
    dexie = a.dexie;
    await loadDemoData(a.dexie, a.db, now);
    await a.db.photos.add({
      blob: new Blob(['skora'], { type: 'image/jpeg' }),
      takenAt: now,
      category: 'skin',
    });
    const file = JSON.parse(
      JSON.stringify(await exportBackup(a.db, 'dlugie-haslo', now)),
    ) as unknown;

    const b = await openTestDb('2222');
    await b.db.symptoms.add({ name: 'stary wpis', startedAt: now, source: 'manual' });
    const summary = await restoreBackup(b.dexie, b.db, await decryptBackup(file, 'dlugie-haslo'));
    expect(summary.medications).toBe((await a.db.medications.list()).length);
    expect((await b.db.profile.get())?.name).toBe('Anna Kowalska');
    expect((await b.db.symptoms.list()).some((s) => s.name === 'stary wpis')).toBe(false);
    expect(await b.db.medications.get('demo-med-mushroom')).toEqual(
      await a.db.medications.get('demo-med-mushroom'),
    );
    const photo = (await b.db.photos.list())[0];
    expect(await photo?.blob.text()).toBe('skora');
    // stored under device B's key
    b.vault.lock();
    await expect(b.vault.unlock('1111')).rejects.toThrow();
    await b.dexie.delete();
  });
});
