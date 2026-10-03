import type { Table } from 'dexie';
import type { EntityApi, NewEntity } from '@ez/shared';
import { openRecord, sealRecord, type StoredRow } from './cipher';
import { inRange } from './dates';
import { newId } from './ids';
import { BLOB_FIELDS, type Vault } from './vault';

/** Keys of `T` holding an ISO date string, used for sorting and date queries. */
type DateKey<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T];

export interface DatedEntityApi<T extends { id: string }> extends EntityApi<T> {
  /** Records whose date field is within `[from, to]` (inclusive, ISO strings), sorted ascending. */
  between(from: string, to: string): Promise<T[]>;
  /** Writes a record with its own id (demo data, backup import). */
  put(record: T): Promise<void>;
}

// Every row is encrypted (cipher.ts), so queries read whole tables and filter in memory – the data set
// is small. Rows are read before waiting for the key, so `useLiveQuery` keeps tracking the table.
export function createEntityApi<T extends { id: string }>(
  table: Table<StoredRow, string>,
  dateKey: DateKey<T>,
  vault: Vault,
): DatedEntityApi<T> {
  const name = table.name;
  const blobFields = BLOB_FIELDS[name] ?? [];
  const sorted = (rows: T[]): T[] =>
    rows.sort((a, b) => String(a[dateKey]).localeCompare(String(b[dateKey])));
  const decrypt = async (rows: StoredRow[]): Promise<T[]> => {
    const key = await vault.ready();
    return Promise.all(rows.map((r) => openRecord<T>(key, name, r)));
  };
  const put = async (record: T) => {
    const key = await vault.ready();
    await table.put(await sealRecord(key, name, record, blobFields));
  };

  return {
    async list() {
      return sorted(await decrypt(await table.toArray()));
    },
    async get(id) {
      const row = await table.get(id);
      return row ? (await decrypt([row]))[0] : undefined;
    },
    async add(input: NewEntity<T>) {
      const record = { ...input, id: newId() } as T;
      const key = await vault.ready();
      await table.add(await sealRecord(key, name, record, blobFields));
      return record;
    },
    async update(id, patch) {
      const row = await table.get(id);
      if (!row) throw new Error(`Nie znaleziono rekordu ${id}`);
      const next: Record<string, unknown> = { ...(await decrypt([row]))[0] };
      // `undefined` removes the field (as Dexie's update did before encryption).
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) delete next[k];
        else next[k] = v;
      }
      await put(next as T);
    },
    remove(id) {
      return table.delete(id);
    },
    put,
    async between(from, to) {
      const rows = await decrypt(await table.toArray());
      return sorted(rows.filter((r) => inRange(String(r[dateKey]), from, to)));
    },
  };
}
