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

  constructor(name = 'eksiazeczka-zdrowia') {
    super(name);
    // Primary keys only: records are encrypted, queries filter in memory (see entityApi.ts).
    this.version(1).stores(Object.fromEntries(ENTITY_TABLES.map((t) => [t, 'id'])));
    this.version(2).stores({ meta: 'id' });
  }

  entityTables(): Table<StoredRow, string>[] {
    return ENTITY_TABLES.map((t) => this[t]);
  }
}
