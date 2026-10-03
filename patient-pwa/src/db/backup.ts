// Encrypted backup file: everything in the database (with photos and files) under a key from the
// patient's password (Argon2id → AES-256-GCM). The file is useless without the password.
import { fromBase64Url, toBase64Url, type Profile } from '@ez/shared';
import { openBytes, sealBytes } from './cipher';
import type { Db } from './createDb';
import { ENTITY_TABLES, type HealthDatabase } from './database';
import { deriveKey, type KdfParams } from './kdf';
import { BLOB_FIELDS } from './vault';

export const BACKUP_FORMAT = 'eksiazeczka-zdrowia-backup';
export const MIN_PASSWORD = 8;
/** Stronger than the PIN key: the file may end up anywhere. */
const BACKUP_KDF: KdfParams = { memoryKiB: 65536, iterations: 3 };
const AAD = `${BACKUP_FORMAT}/1`;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  v: 1;
  createdAt: string;
  kdf: KdfParams;
  salt: string;
  iv: string;
  data: string;
}

type TableName = (typeof ENTITY_TABLES)[number];
/** Decrypted content: records per table; blobs as `{ $blob: base64, type }`. */
export type BackupPayload = Record<TableName, Record<string, unknown>[]>;

interface EncodedBlob {
  $blob: string;
  type: string;
}

const isEncodedBlob = (v: unknown): v is EncodedBlob =>
  typeof v === 'object' && v !== null && typeof (v as EncodedBlob).$blob === 'string';

async function encodeRecord(table: string, record: object): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { ...record };
  for (const field of BLOB_FIELDS[table] ?? []) {
    const value = out[field];
    if (value instanceof Blob) {
      out[field] = {
        $blob: toBase64Url(new Uint8Array(await value.arrayBuffer())),
        type: value.type,
      };
    }
  }
  return out;
}

/** Turns `{ $blob }` fields back into Blobs. */
export function decodeRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };
  for (const [k, v] of Object.entries(out)) {
    if (isEncodedBlob(v)) out[k] = new Blob([fromBase64Url(v.$blob)], { type: v.type });
  }
  return out;
}

export function checkPassword(password: string): string | undefined {
  return password.length >= MIN_PASSWORD ? undefined : `Hasło: co najmniej ${MIN_PASSWORD} znaków`;
}

export async function exportBackup(db: Db, password: string, now: string): Promise<BackupFile> {
  const invalid = checkPassword(password);
  if (invalid) throw new Error(invalid);
  const profile = await db.profile.get();
  const payload: Partial<BackupPayload> = { profile: profile ? [{ ...profile }] : [] };
  for (const table of ENTITY_TABLES) {
    if (table === 'profile') continue;
    const records: object[] = await db[table].list();
    payload[table] = await Promise.all(records.map((r) => encodeRecord(table, r)));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt, BACKUP_KDF);
  const sealed = await sealBytes(key, new TextEncoder().encode(JSON.stringify(payload)), AAD);
  return {
    format: BACKUP_FORMAT,
    v: 1,
    createdAt: now,
    kdf: BACKUP_KDF,
    salt: toBase64Url(salt),
    iv: toBase64Url(sealed.iv),
    data: toBase64Url(new Uint8Array(sealed.data)),
  };
}

/** Validates the file and decrypts it; a wrong password or a modified file throws. */
export async function decryptBackup(file: unknown, password: string): Promise<BackupPayload> {
  const f = file as Partial<BackupFile> | null;
  if (
    typeof f !== 'object' ||
    f === null ||
    f.format !== BACKUP_FORMAT ||
    f.v !== 1 ||
    typeof f.salt !== 'string' ||
    typeof f.iv !== 'string' ||
    typeof f.data !== 'string' ||
    typeof f.kdf?.memoryKiB !== 'number' ||
    typeof f.kdf.iterations !== 'number'
  ) {
    throw new Error('To nie jest plik kopii zapasowej eKsiazeczkaZdrowia');
  }
  const key = await deriveKey(password, fromBase64Url(f.salt), f.kdf);
  let plain: ArrayBuffer;
  try {
    plain = await openBytes(
      key,
      { iv: fromBase64Url(f.iv), data: fromBase64Url(f.data).buffer as ArrayBuffer },
      AAD,
    );
  } catch {
    throw new Error('Nieprawidłowe hasło albo uszkodzony plik');
  }
  const payload = JSON.parse(new TextDecoder().decode(plain)) as Partial<BackupPayload>;
  for (const table of ENTITY_TABLES) {
    if (!Array.isArray(payload[table])) throw new Error('Plik kopii jest niekompletny');
  }
  return payload as BackupPayload;
}

export type ImportSummary = Record<
  'medications' | 'exams' | 'symptoms' | 'photos' | 'visits',
  number
>;

/**
 * Replaces everything in this database with the backup. Records are written through the normal API,
 * so they are encrypted with this device's PIN key.
 */
export async function restoreBackup(
  dexie: HealthDatabase,
  db: Db,
  payload: BackupPayload,
): Promise<ImportSummary> {
  await Promise.all(dexie.entityTables().map((t) => t.clear()));
  const [profile] = payload.profile;
  if (profile) await db.profile.save(decodeRecord(profile) as unknown as Profile);
  for (const table of ENTITY_TABLES) {
    if (table === 'profile') continue;
    const api = db[table] as unknown as { put(record: unknown): Promise<void> };
    for (const record of payload[table]) await api.put(decodeRecord(record));
  }
  return {
    medications: payload.medications.length,
    exams: payload.exams.length,
    symptoms: payload.symptoms.length,
    photos: payload.photos.length,
    visits: payload.visits.length,
  };
}
