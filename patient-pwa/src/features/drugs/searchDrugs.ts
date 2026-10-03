import type { SearchDrugs } from '@ez/shared';
import {
  rowToDrug,
  searchIndex,
  toSearchable,
  type DrugEntry,
  type DrugRow,
  type SearchableDrug,
} from './drugs.logic';

const DRUGS_URL = '/data/drugs.json';

let indexPromise: Promise<SearchableDrug[]> | null = null;

/** Baza RPL ładowana leniwie przy pierwszym wyszukiwaniu (~0,4 MB gzip); po błędzie można spróbować ponownie. */
export function loadDrugIndex(): Promise<SearchableDrug[]> {
  indexPromise ??= fetch(DRUGS_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Nie udało się pobrać bazy leków (HTTP ${res.status})`);
      return res.json() as Promise<DrugRow[]>;
    })
    .then((rows) => rows.map((row) => toSearchable(rowToDrug(row))))
    .catch((err: unknown) => {
      indexPromise = null;
      throw err;
    });
  return indexPromise;
}

export async function searchDrugs(query: string, limit = 10): Promise<DrugEntry[]> {
  return searchIndex(await loadDrugIndex(), query, limit);
}

// Zgodność z kontraktem z `@ez/shared`.
searchDrugs satisfies SearchDrugs;
