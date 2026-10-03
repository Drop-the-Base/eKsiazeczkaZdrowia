import Dexie, { type Table } from 'dexie';
import type { StoredRow, Sealed } from './cipher';
import type { KdfParams } from './kdf';

/** Unencrypted: only what is needed to check the PIN. */
export interface VaultMeta {
  id: 'vault';
  salt: Uint8Array;
  kdf: KdfParams;
  /** A known text encrypted with the key – decrypting it proves the PIN is right. */
  check: Sealed;
}

/** Unencrypted: the PIN sealed with a key from the passkey's PRF output (biometric unlock, B29). */
export interface BiometricMeta {
  id: 'biometric';
  credentialId: Uint8Array;
  salt: Uint8Array;
  sealedPin: Sealed;
}

export const ENTITY_TABLES = [
  'profile',
  'medications',
  'intakes',
  'symptoms',
  'diagnoses',
  'exams',
  'documents',
  'photos',
  'photoSeries',
  'visitNoteItems',
  'visits',
  'reminders',
] as const;

export class HealthDatabase extends Dexie {
  profile!: Table<StoredRow, string>;
  medications!: Table<StoredRow, string>;
  intakes!: Table<StoredRow, string>;
  symptoms!: Table<StoredRow, string>;
  diagnoses!: Table<StoredRow, string>;
  exams!: Table<StoredRow, string>;
  documents!: Table<StoredRow, string>;
  photos!: Table<StoredRow, string>;
  photoSeries!: Table<StoredRow, string>;
  visitNoteItems!: Table<StoredRow, string>;
  visits!: Table<StoredRow, string>;
  reminders!: Table<StoredRow, string>;
  meta!: Table<VaultMeta, string>;
  biometric!: Table<BiometricMeta, string>;

  constructor(name = 'eksiazeczka-zdrowia') {
    super(name);
    // Primary keys only: records are encrypted, queries filter in memory (see entityApi.ts).
    this.version(1).stores(Object.fromEntries(ENTITY_TABLES.map((t) => [t, 'id'])));
    this.version(2).stores({ meta: 'id' });
    this.version(3).stores({ biometric: 'id' });
  }

  entityTables(): Table<StoredRow, string>[] {
    return ENTITY_TABLES.map((t) => this[t]);
  }
}
