import { isSealed, openBytes, sealBytes, sealRecord } from './cipher';
import type { HealthDatabase } from './database';
import { deriveKey, KDF_PARAMS } from './kdf';

export type VaultStatus = 'checking' | 'no-pin' | 'locked' | 'unlocked' | 'error';

export class WrongPinError extends Error {
  constructor() {
    super('Nieprawidłowy PIN');
  }
}

const CHECK_TEXT = new TextEncoder().encode('eksiazeczka-zdrowia');
export const PIN_PATTERN = /^\d{4,8}$/;

/** Fields holding a Blob, encrypted separately from the record. */
export const BLOB_FIELDS: Record<string, readonly string[]> = {
  documents: ['file'],
  photos: ['blob'],
};

/**
 * The database key: derived from the PIN, kept only in memory, forgotten on `lock()`.
 * Reads wait for it (`ready()`), so screens simply show "loading" until the app is unlocked.
 */
export function createVault(dexie: HealthDatabase) {
  let key: CryptoKey | null = null;
  let status: VaultStatus = 'checking';
  const listeners = new Set<(s: VaultStatus) => void>();
  let waiters: ((k: CryptoKey) => void)[] = [];

  const setStatus = (s: VaultStatus) => {
    status = s;
    listeners.forEach((l) => l(s));
  };
  const open = (k: CryptoKey) => {
    key = k;
    setStatus('unlocked');
    const w = waiters;
    waiters = [];
    w.forEach((resolve) => resolve(k));
  };

  dexie.meta
    .get('vault')
    .then((meta) => {
      if (status === 'checking') setStatus(meta ? 'locked' : 'no-pin');
    })
    .catch((err: unknown) => {
      console.error('Nie udało się otworzyć bazy', err);
      setStatus('error');
    });

  /** Encrypts rows that were stored in plain text (data from before encryption). */
  async function sealLegacyRows(k: CryptoKey) {
    for (const table of dexie.entityTables()) {
      for (const row of await table.toArray()) {
        if (isSealed(row)) continue;
        const record = row as unknown as { id: string };
        await table.put(await sealRecord(k, table.name, record, BLOB_FIELDS[table.name] ?? []));
      }
    }
  }

  return {
    get status() {
      return status;
    },
    onChange(cb: (s: VaultStatus) => void): () => void {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    /** Resolves with the key once the app is unlocked. */
    ready(): Promise<CryptoKey> {
      return key ? Promise.resolve(key) : new Promise((resolve) => waiters.push(resolve));
    },
    async setup(pin: string): Promise<void> {
      if (!PIN_PATTERN.test(pin)) throw new Error('PIN: 4–8 cyfr');
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const k = await deriveKey(pin, salt, KDF_PARAMS);
      await dexie.meta.put({
        id: 'vault',
        salt,
        kdf: KDF_PARAMS,
        check: await sealBytes(k, CHECK_TEXT, 'vault'),
      });
      await sealLegacyRows(k);
      open(k);
    },
    async unlock(pin: string): Promise<void> {
      const meta = await dexie.meta.get('vault');
      if (!meta) throw new Error('Brak ustawionego PIN-u');
      const k = await deriveKey(pin, meta.salt, meta.kdf);
      try {
        await openBytes(k, meta.check, 'vault');
      } catch {
        throw new WrongPinError();
      }
      await sealLegacyRows(k);
      open(k);
    },
    /** Forgets the key; reads wait again until the next unlock. */
    lock(): void {
      if (status !== 'unlocked') return;
      key = null;
      setStatus('locked');
    },
    /** Deletes all data and the PIN (demo reset / forgotten PIN). */
    async wipe(): Promise<void> {
      key = null;
      await Promise.all([...dexie.entityTables(), dexie.meta].map((t) => t.clear()));
      setStatus('no-pin');
    },
  };
}

export type Vault = ReturnType<typeof createVault>;
