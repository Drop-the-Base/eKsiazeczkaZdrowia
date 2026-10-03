import { describe, expect, it } from 'vitest';
import { rplCsvToRows } from './drugs';

const header =
  '"Identyfikator Produktu Leczniczego";"Nazwa Produktu Leczniczego";"Nazwa powszechnie stosowana";"Rodzaj preparatu";"Moc";"Postać farmaceutyczna";"Kod ATC";"Opakowanie";"Ulotka"';

describe('rplCsvToRows', () => {
  it('keeps human products with leaflet id and OTC flag, sorted by name', () => {
    const csv = [
      header,
      '"2";"Ibuprom";"Ibuprofenum";"Ludzki";"200 mg";"Tabletki";"M01AE01";"0590 ¦ OTC ¦ 1\n50 tabl.";"https://x/api/rpl/medicinal-products/77/leaflet"',
      '"3";"Vetmedin";"Pimobendanum";"Weterynaryjny";"5 mg";"Kapsułki";"QC01CE90";"";""',
      '"1";"Acard";"Acidum acetylsalicylicum";"Ludzki";"75 mg";"Tabletki";"B01AC06";"0590 ¦ Rp ¦ 2";""',
    ].join('\n');

    expect(rplCsvToRows(csv)).toEqual([
      ['1', 'Acard', 'Acidum acetylsalicylicum', '75 mg', 'Tabletki', 'B01AC06', 0, 0],
      ['2', 'Ibuprom', 'Ibuprofenum', '200 mg', 'Tabletki', 'M01AE01', 77, 1],
    ]);
  });

  it('fails loudly when a column is missing', () => {
    expect(() => rplCsvToRows('"Nazwa Produktu Leczniczego"\n"x"')).toThrow(/Brak kolumny/);
  });
});
