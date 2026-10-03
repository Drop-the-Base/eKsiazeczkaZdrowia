import type { Drug } from '@ez/shared';

/** Wiersz `public/data/drugs.json` – format z `data/src/drugs.ts`. */
export type DrugRow = [string, string, string, string, string, string, number, 0 | 1];

/** `Drug` + informacja z RPL, czy lek jest dostępny bez recepty (podpowiedź grupy przy dodawaniu). */
export interface DrugEntry extends Drug {
  otc: boolean;
}

const LEAFLET_URL = (id: number) =>
  `https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/${id}/leaflet`;

export function rowToDrug([
  rplId,
  name,
  activeSubstance,
  strength,
  form,
  atcCode,
  leafletId,
  otc,
]: DrugRow): DrugEntry {
  return {
    rplId,
    name,
    activeSubstance,
    strength,
    form,
    atcCode,
    leafletUrl: leafletId ? LEAFLET_URL(leafletId) : undefined,
    otc: otc === 1,
  };
}

/** Małe litery, bez polskich znaków i nadmiarowych spacji – do porównań w wyszukiwarce. */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SearchableDrug {
  drug: DrugEntry;
  name: string;
  substance: string;
}

export function toSearchable(drug: DrugEntry): SearchableDrug {
  return { drug, name: normalize(drug.name), substance: normalize(drug.activeSubstance) };
}

/** Im mniejsza liczba, tym lepsze dopasowanie; `null` = brak dopasowania. */
function rank(entry: SearchableDrug, q: string): number | null {
  if (entry.name.startsWith(q)) return 0;
  if (entry.name.includes(` ${q}`)) return 1;
  if (entry.substance.startsWith(q)) return 2;
  if (entry.name.includes(q)) return 3;
  if (entry.substance.includes(q)) return 4;
  return null;
}

/**
 * Wyszukiwanie po nazwie handlowej i substancji czynnej (bez polskich znaków).
 * Ten sam lek (nazwa + moc) z kilku importów równoległych / postaci pokazujemy raz.
 */
export function searchIndex(index: SearchableDrug[], query: string, limit = 10): DrugEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const hits: { entry: SearchableDrug; rank: number }[] = [];
  for (const entry of index) {
    const r = rank(entry, q);
    if (r !== null) hits.push({ entry, rank: r });
  }
  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.entry.name.length - b.entry.name.length ||
      a.entry.name.localeCompare(b.entry.name),
  );

  const seen = new Set<string>();
  const result: DrugEntry[] = [];
  for (const { entry } of hits) {
    const key = `${entry.name}|${entry.drug.strength}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry.drug);
    if (result.length >= limit) break;
  }
  return result;
}
