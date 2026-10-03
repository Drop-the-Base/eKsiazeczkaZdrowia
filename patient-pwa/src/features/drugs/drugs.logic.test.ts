import { describe, expect, it } from 'vitest';
import { normalize, rowToDrug, searchIndex, toSearchable, type DrugRow } from './drugs.logic';

const rows: DrugRow[] = [
  ['1', 'Ibuprom', 'Ibuprofenum', '200 mg', 'Tabletki powlekane', 'M01AE01', 19798, 1],
  ['2', 'Ibuprom', 'Ibuprofenum', '200 mg', 'Tabletki powlekane', 'M01AE01', 0, 1],
  ['3', 'Ibuprom Max', 'Ibuprofenum', '400 mg', 'Tabletki', 'M01AE01', 0, 1],
  ['4', 'Nurofen', 'Ibuprofenum', '200 mg', 'Kapsułki', 'M01AE01', 0, 1],
  ['5', 'Xarelto', 'Rivaroxabanum', '20 mg', 'Tabletki', 'B01AF01', 0, 0],
  ['6', 'Polopiryna Ł', 'Acidum acetylsalicylicum', '300 mg', 'Tabletki', 'N02BA01', 0, 1],
];
const index = rows.map(rowToDrug).map(toSearchable);

describe('rowToDrug', () => {
  it('builds leaflet url and OTC flag', () => {
    const drug = rowToDrug(rows[0]!);
    expect(drug.leafletUrl).toMatch(/\/19798\/leaflet$/);
    expect(drug.otc).toBe(true);
    expect(rowToDrug(rows[4]!).leafletUrl).toBeUndefined();
  });
});

describe('normalize', () => {
  it('strips Polish diacritics and case', () => {
    expect(normalize('  Kapsułki  ŻÓŁTE ')).toBe('kapsulki zolte');
  });
});

describe('searchIndex', () => {
  it('ranks name prefix first, then substance matches, and dedupes imports', () => {
    expect(searchIndex(index, 'ibu').map((d) => d.rplId)).toEqual(['1', '3', '4']);
  });

  it('matches without diacritics and by substance', () => {
    expect(searchIndex(index, 'polopiryna l').map((d) => d.rplId)).toEqual(['6']);
    expect(searchIndex(index, 'rivaroks')).toEqual([]);
    expect(searchIndex(index, 'rivarox').map((d) => d.name)).toEqual(['Xarelto']);
  });

  it('needs at least two characters and respects the limit', () => {
    expect(searchIndex(index, 'i')).toEqual([]);
    expect(searchIndex(index, 'ibu', 1)).toHaveLength(1);
  });
});
