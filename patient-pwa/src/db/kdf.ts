import { argon2id } from 'hash-wasm';

export interface KdfParams {
  memoryKiB: number;
  iterations: number;
}

/** OWASP minimum for Argon2id (19 MiB, 2 passes) – usable on a phone in well under a second. */
export const KDF_PARAMS: KdfParams = { memoryKiB: 19456, iterations: 2 };

/**
 * AES-256-GCM key from a PIN or password (Argon2id). The key is non-extractable and lives only in memory.
 * Shared by the database (PIN) and the encrypted backup (password, B30).
 */
export async function deriveKey(
  secret: string,
  salt: Uint8Array,
  params: KdfParams = KDF_PARAMS,
): Promise<CryptoKey> {
  const raw = await argon2id({
    password: secret,
    salt,
    parallelism: 1,
    iterations: params.iterations,
    memorySize: params.memoryKiB,
    hashLength: 32,
    outputType: 'binary',
  });
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
