// End-to-end encryption between the patient's phone and the doctor's tab (TASKS.md section 5):
// one-time ECDH P-256 → HKDF-SHA-256 → AES-256-GCM. WebCrypto only, no libraries.
import { fromBase64Url, toBase64Url } from './base64url.js';

/** WebCrypto key; derived from `crypto.subtle` so it type-checks with DOM and Node typings alike. */
export type Key = Awaited<ReturnType<typeof crypto.subtle.deriveKey>>;

const ECDH = { name: 'ECDH', namedCurve: 'P-256' } as const;
const HKDF_INFO = new TextEncoder().encode('eksiazeczka-zdrowia/share/v1');
const RAW_P256_LENGTH = 65;
const IV_BYTES = 12;

export interface EphemeralKeyPair {
  /** Non-extractable; never leaves this tab. */
  privateKey: Key;
  /** Raw uncompressed point, base64url – goes into the QR code / `hello` message. */
  publicKey: string;
}

export interface EncryptedChunk {
  iv: string;
  data: string;
}

export async function generateKeyPair(): Promise<EphemeralKeyPair> {
  const pair = await crypto.subtle.generateKey(ECDH, false, ['deriveBits']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  return { privateKey: pair.privateKey, publicKey: toBase64Url(raw) };
}

function decodePublicKey(publicKey: string): Uint8Array {
  const raw = fromBase64Url(publicKey);
  if (raw.length !== RAW_P256_LENGTH || raw[0] !== 0x04)
    throw new Error('Niepoprawny klucz publiczny');
  return raw;
}

/** Both public keys in a fixed order, so both sides hash the same bytes. */
function sortedKeys(a: string, b: string): Uint8Array {
  const [first, second] = [a, b].sort().map(decodePublicKey) as [Uint8Array, Uint8Array];
  const out = new Uint8Array(first.length + second.length);
  out.set(first);
  out.set(second, first.length);
  return out;
}

/** AES-256-GCM key shared by both sides. The salt binds it to both public keys. */
export async function deriveSessionKey(own: EphemeralKeyPair, peerPublicKey: string): Promise<Key> {
  const peer = await crypto.subtle.importKey(
    'raw',
    decodePublicKey(peerPublicKey),
    ECDH,
    false,
    [],
  );
  const secret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peer },
    own.privateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
  const salt = await crypto.subtle.digest('SHA-256', sortedKeys(own.publicKey, peerPublicKey));
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: HKDF_INFO },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * 4 digits shown on both screens. If the server swapped a public key, the codes differ.
 * Order of arguments does not matter.
 */
export async function verificationCode(publicKeyA: string, publicKeyB: string): Promise<string> {
  const hash = new DataView(
    await crypto.subtle.digest('SHA-256', sortedKeys(publicKeyA, publicKeyB)),
  );
  return String(hash.getUint32(0) % 10_000).padStart(4, '0');
}

/** `aad` (e.g. `snapshotId:index:total`) is authenticated, so chunks cannot be swapped or reordered. */
export async function encryptChunk(
  key: Key,
  plaintext: Uint8Array,
  aad: string,
): Promise<EncryptedChunk> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) },
    key,
    plaintext,
  );
  return { iv: toBase64Url(iv), data: toBase64Url(new Uint8Array(data)) };
}

/** Throws if the chunk was modified, the key is wrong or `aad` does not match. */
export async function decryptChunk(
  key: Key,
  chunk: EncryptedChunk,
  aad: string,
): Promise<Uint8Array> {
  const iv = fromBase64Url(chunk.iv);
  if (iv.length !== IV_BYTES) throw new Error('Niepoprawny nonce');
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(aad) },
    key,
    fromBase64Url(chunk.data),
  );
  return new Uint8Array(plain);
}
