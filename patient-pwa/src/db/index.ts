import { createDb } from './createDb';
import { HealthDatabase } from './database';
import { initDemoData, loadDemoData } from './demo';
import { createVault } from './vault';

const dexie = new HealthDatabase();

/** Database key from the PIN (only in memory). The lock screen sets it up and unlocks it. */
export const vault = createVault(dexie);

/** The only way the app touches the local database. Returns domain types from `@ez/shared`. */
export const db = createDb(dexie, vault);

/**
 * Demo data on start (see `initDemoData`). Screens read through `useLiveQuery`,
 * so they re-render once this finishes; await it only if you need the data up front.
 */
export const dbReady: Promise<void> = initDemoData(dexie, db, vault, {
  search: window.location.search,
  autoLoad: import.meta.env.DEV || import.meta.env.VITE_DEMO === '1',
  now: new Date().toISOString(),
}).then((result) => {
  if (result === 'reset') {
    const url = new URL(window.location.href);
    url.searchParams.delete('demo');
    window.history.replaceState(null, '', url);
  }
});
dbReady.catch((err: unknown) => console.error('Nie udało się wczytać danych demo', err));

/** Replaces all data with the "Pani Anna" demo (e.g. a "Wczytaj demo" button). */
export const resetDemoData = (): Promise<void> => loadDemoData(dexie, db, new Date().toISOString());

export type { Db, MedicationsApi } from './createDb';
export type { DatedEntityApi } from './entityApi';
export { deriveKey, KDF_PARAMS, type KdfParams } from './kdf';
export { checkPassword, MIN_PASSWORD, type BackupFile } from './backup';
import {
  decryptBackup,
  exportBackup as exportBackupOf,
  restoreBackup,
  type ImportSummary,
} from './backup';
export type { ImportSummary } from './backup';

/** Encrypted backup of everything, with the patient's password. */
export const exportBackup = (password: string): ReturnType<typeof exportBackupOf> =>
  exportBackupOf(db, password, new Date().toISOString());

/** Reads a backup file (parsed JSON) with its password and replaces all data on this device. */
export async function importBackup(file: unknown, password: string): Promise<ImportSummary> {
  return restoreBackup(dexie, db, await decryptBackup(file, password));
}
export { newId } from './ids';
export { PIN_PATTERN, WrongPinError, type VaultStatus } from './vault';
