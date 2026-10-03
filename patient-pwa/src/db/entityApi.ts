import type { Table, UpdateSpec } from 'dexie';
import type { EntityApi, NewEntity } from '@ez/shared';
import { inRange } from './dates';
import { newId } from './ids';

/** Keys of `T` holding an ISO date string, used for sorting and date queries. */
type DateKey<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T];

export interface DatedEntityApi<T extends { id: string }> extends EntityApi<T> {
  /** Records whose date field is within `[from, to]` (inclusive, ISO strings), sorted ascending. */
  between(from: string, to: string): Promise<T[]>;
}

// Records are read whole and filtered in memory: the data set is small, and encryption (B27)
// can then wrap reads and writes here without changing the API.
export function createEntityApi<T extends { id: string }>(
  table: Table<T, string>,
  dateKey: DateKey<T>,
): DatedEntityApi<T> {
  const sorted = (rows: T[]): T[] =>
    rows.sort((a, b) => String(a[dateKey]).localeCompare(String(b[dateKey])));

  return {
    async list() {
      return sorted(await table.toArray());
    },
    get(id) {
      return table.get(id);
    },
    async add(input: NewEntity<T>) {
      const record = { ...input, id: newId() } as T;
      await table.add(record);
      return record;
    },
    async update(id, patch) {
      // A top-level partial is a valid UpdateSpec; `undefined` values remove the field.
      const changed = await table.update(id, patch as unknown as UpdateSpec<T>);
      if (changed === 0 && !(await table.get(id))) throw new Error(`Nie znaleziono rekordu ${id}`);
    },
    remove(id) {
      return table.delete(id);
    },
    async between(from, to) {
      const rows = await table.toArray();
      return sorted(rows.filter((r) => inRange(String(r[dateKey]), from, to)));
    },
  };
}
