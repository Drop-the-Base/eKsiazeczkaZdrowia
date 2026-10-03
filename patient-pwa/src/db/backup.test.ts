import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDemoData } from '@ez/shared';
import { decodeRecord, decryptBackup, exportBackup } from './backup';
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
});
