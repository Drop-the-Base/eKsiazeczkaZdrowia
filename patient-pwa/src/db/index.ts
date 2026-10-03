import { createDb } from './createDb';
import { HealthDatabase } from './database';
import { createBiometric } from './biometric';
import { createVault } from './vault';
import { DEMO_PIN, demoStarted, isDemo, markDemoStarted } from '../demoMode';

// The demo has its own database, so it never touches the patient's real data.
const dexie = new HealthDatabase(isDemo ? 'eksiazeczka-zdrowia-demo' : undefined);

/** Database key from the PIN (only in memory). The lock screen sets it up and unlocks it. */
export const vault = createVault(dexie);

// Another tab wiped the data or set a new PIN (e.g. a second `/demo` tab starting afresh): the key
// held here no longer fits. On a wipe stop using it (lock), once the new key exists start over.
// Reloading only after `setup` avoids two tabs wiping each other's fresh start in turn.
if (typeof BroadcastChannel !== 'undefined') {
  const rekeyChannel = new BroadcastChannel(`vault-rekey:${dexie.name}`);
  vault.onRekey((kind) => rekeyChannel.postMessage(kind));
  rekeyChannel.onmessage = (e: MessageEvent<unknown>) => {
    if (e.data === 'setup') window.location.reload();
    else vault.lock();
  };
}

/** Optional fingerprint / face unlock (passkey with PRF), on top of the PIN. */
export const biometric = createBiometric(dexie, vault);

/** The only way the app touches the local database. Returns domain types from `@ez/shared`. */
export const db = createDb(dexie, vault);

/** Resolves once the demo data is in (`/demo` only); outside the demo at once. */
export const dbReady: Promise<void> = isDemo
  ? import('./demo')
      .then((m) =>
        m.startDemo(dexie, db, vault, {
          pin: DEMO_PIN,
          fresh: !demoStarted(),
          now: new Date().toISOString(),
        }),
      )
      .then(markDemoStarted)
  : Promise.resolve();
dbReady.catch((err: unknown) => console.error('Nie udało się przygotować demo', err));

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
export { biometricSupported, BiometricUnavailableError } from './biometric';
