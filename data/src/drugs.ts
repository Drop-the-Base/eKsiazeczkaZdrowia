import { parseCsv } from './csv';

/**
 * Kompaktowy wiersz `drugs.json` (tablica zamiast obiektu – ~2× mniejszy plik):
 * [rplId, nazwa, substancja czynna, moc, postać, ATC, id ulotki (0 = brak), OTC (1/0)].
 * Odczyt i zamiana na `Drug`: `patient-pwa/src/features/drugs/`.
 */
export type DrugRow = [string, string, string, string, string, string, number, 0 | 1];

const COLUMNS = {
  id: 'Identyfikator Produktu Leczniczego',
  name: 'Nazwa Produktu Leczniczego',
  substance: 'Nazwa powszechnie stosowana',
  kind: 'Rodzaj preparatu',
  strength: 'Moc',
  form: 'Postać farmaceutyczna',
  atc: 'Kod ATC',
  packages: 'Opakowanie',
  leaflet: 'Ulotka',
} as const;

const LEAFLET_ID = /medicinal-products\/(\d+)\/leaflet/;

/** Z pełnego eksportu CSV RPL: tylko leki ludzkie, posortowane po nazwie. */
export function rplCsvToRows(csv: string): DrugRow[] {
  const [header, ...records] = parseCsv(csv);
  if (!header) throw new Error('Pusty plik CSV');
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`Brak kolumny „${name}” – zmienił się format RPL?`);
    return i;
  };
  const idx = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, name]) => [key, col(name)]),
  ) as Record<keyof typeof COLUMNS, number>;

  const rows: DrugRow[] = [];
  for (const r of records) {
    const get = (i: number) => (r[i] ?? '').trim();
    if (get(idx.kind) !== 'Ludzki' || !get(idx.id) || !get(idx.name)) continue;
    const leafletId = Number(LEAFLET_ID.exec(get(idx.leaflet))?.[1] ?? 0);
    rows.push([
      get(idx.id),
      get(idx.name),
      get(idx.substance),
      get(idx.strength),
      get(idx.form),
      get(idx.atc),
      leafletId,
      get(idx.packages).includes('¦ OTC ¦') ? 1 : 0,
    ]);
  }
  return rows.sort((a, b) => a[1].localeCompare(b[1], 'pl') || a[3].localeCompare(b[3], 'pl'));
}
