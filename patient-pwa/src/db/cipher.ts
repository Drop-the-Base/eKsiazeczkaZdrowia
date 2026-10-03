// Record encryption at rest: each row is AES-256-GCM over its JSON, blobs (photos, files) separately.
// The additional data binds a ciphertext to its table and id, so rows cannot be swapped.

export interface Sealed {
  iv: Uint8Array;
  data: ArrayBuffer;
}

/** What IndexedDB holds for every record: the id and ciphertext only. */
export interface StoredRow {
  id: string;
  enc: Sealed;
  blobs?: Record<string, Sealed & { type: string }>;
}

const utf8 = new TextEncoder();

export async function sealBytes(key: CryptoKey, bytes: BufferSource, aad: string): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: utf8.encode(aad) },
    key,
    bytes,
  );
  return { iv, data };
}

export function openBytes(key: CryptoKey, sealed: Sealed, aad: string): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: sealed.iv, additionalData: utf8.encode(aad) },
    key,
    sealed.data,
  );
}

export async function sealRecord<T extends { id: string }>(
  key: CryptoKey,
  table: string,
  record: T,
  blobFields: readonly string[],
): Promise<StoredRow> {
  const plain: Record<string, unknown> = { ...record };
  const blobs: NonNullable<StoredRow['blobs']> = {};
  for (const field of blobFields) {
    const value = plain[field];
    if (!(value instanceof Blob)) continue;
    delete plain[field];
    const sealed = await sealBytes(
      key,
      await value.arrayBuffer(),
      `${table}:${record.id}:${field}`,
    );
    blobs[field] = { ...sealed, type: value.type };
  }
  const row: StoredRow = {
    id: record.id,
    enc: await sealBytes(key, utf8.encode(JSON.stringify(plain)), `${table}:${record.id}`),
  };
  if (Object.keys(blobs).length > 0) row.blobs = blobs;
  return row;
}

/** Throws if the row was modified or belongs to another table / id. */
export async function openRecord<T>(key: CryptoKey, table: string, row: StoredRow): Promise<T> {
  const record = JSON.parse(
    new TextDecoder().decode(await openBytes(key, row.enc, `${table}:${row.id}`)),
  ) as Record<string, unknown>;
  for (const [field, sealed] of Object.entries(row.blobs ?? {})) {
    record[field] = new Blob([await openBytes(key, sealed, `${table}:${row.id}:${field}`)], {
      type: sealed.type,
    });
  }
  return record as T;
}

/** Rows written before encryption existed (development data) – encrypted on unlock. */
export const isSealed = (row: unknown): row is StoredRow =>
  typeof row === 'object' && row !== null && 'enc' in row;
