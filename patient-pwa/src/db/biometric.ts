// Biometric unlock (optional, B29): a passkey with the WebAuthn PRF extension gives a secret that only
// this device's authenticator (fingerprint / face) can produce. It encrypts the PIN; unlocking with the
// fingerprint decrypts the PIN and opens the database as usual. The PIN always works as a fallback.
import { openBytes, sealBytes } from './cipher';
import type { HealthDatabase } from './database';
import type { Vault } from './vault';

const RP_NAME = 'eKsiazeczkaZdrowia';
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export class BiometricUnavailableError extends Error {
  constructor() {
    super('Ten telefon albo przeglądarka nie obsługuje odblokowania biometrią');
  }
}

export function biometricSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof PublicKeyCredential !== 'undefined'
  );
}

const aesKey = (out: BufferSource): Promise<CryptoKey> => {
  const bytes = ArrayBuffer.isView(out)
    ? new Uint8Array(out.buffer, out.byteOffset, out.byteLength)
    : new Uint8Array(out);
  return crypto.subtle.importKey('raw', bytes.slice(), 'AES-GCM', false, ['encrypt', 'decrypt']);
};

/** Asks the authenticator (fingerprint / face) for the PRF output and turns it into an AES key. */
async function prfKey(credentialId: Uint8Array, salt: Uint8Array): Promise<CryptoKey> {
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge: random(32),
      allowCredentials: [{ type: 'public-key', id: credentialId }],
      userVerification: 'required',
      timeout: 60_000,
      extensions: { prf: { eval: { first: salt } } },
    },
  })) as PublicKeyCredential | null;
  const out = cred?.getClientExtensionResults().prf?.results?.first;
  if (!out) throw new BiometricUnavailableError();
  return aesKey(out);
}

export function createBiometric(dexie: HealthDatabase, vault: Vault) {
  return {
    async isEnabled(): Promise<boolean> {
      return (await dexie.biometric.count()) > 0;
    },
    /** Registers a passkey (asks for the fingerprint) and seals the PIN with its PRF secret. */
    async enable(pin: string): Promise<void> {
      if (!biometricSupported()) throw new BiometricUnavailableError();
      await vault.verifyPin(pin);
      const salt = random(32);
      const created = (await navigator.credentials.create({
        publicKey: {
          rp: { name: RP_NAME },
          user: { id: random(16), name: 'pacjent', displayName: 'Pacjent' },
          challenge: random(32),
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60_000,
          // Most authenticators return the secret right away; a second prompt is only a fallback
          // (Safari refuses a second WebAuthn call without a fresh tap).
          extensions: { prf: { eval: { first: salt } } },
        },
      })) as PublicKeyCredential | null;
      const prf = created?.getClientExtensionResults().prf;
      if (!created || (!prf?.enabled && !prf?.results)) throw new BiometricUnavailableError();
      const credentialId = new Uint8Array(created.rawId);
      const first = prf.results?.first;
      const key = first ? await aesKey(first) : await prfKey(credentialId, salt);
      const sealedPin = await sealBytes(key, new TextEncoder().encode(pin), 'biometric');
      await dexie.biometric.put({ id: 'biometric', credentialId, salt, sealedPin });
    },
    async unlock(): Promise<void> {
      const meta = await dexie.biometric.get('biometric');
      if (!meta) throw new BiometricUnavailableError();
      const key = await prfKey(meta.credentialId, meta.salt);
      const pin = new TextDecoder().decode(await openBytes(key, meta.sealedPin, 'biometric'));
      await vault.unlock(pin);
    },
    /** Forgets the sealed PIN (the passkey itself is removed in the phone's settings). */
    async disable(): Promise<void> {
      await dexie.biometric.clear();
    },
  };
}
