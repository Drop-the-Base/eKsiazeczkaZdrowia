import { describe, expect, it } from 'vitest';
import {
  examName,
  findDate,
  findDiagnoses,
  findDrugCandidates,
  findResults,
  newDiagnoses,
  pickByStrength,
} from './ikp.logic';

const discharge = `Karta informacyjna
Pacjentka: Anna Kowalska
Rozpoznanie: Przewlekła białaczka szpikowa (C92.1)
Zalecenia: leczenie w poradni hematologicznej.`;

const cbc = `Morfologia krwi
HGB 8,9 g/dl (12–16)
PLT 92 tys/µl (150–400)
WBC 3,0 tys/µl (4–10)`;

describe('findDiagnoses', () => {
  it('reads "name (ICD)" and "ICD name" forms', () => {
    expect(findDiagnoses(discharge)).toEqual([
      { name: 'Przewlekła białaczka szpikowa', icd10: 'C92.1' },
    ]);
    expect(findDiagnoses('Rozpoznanie: Cukrzyca typu 2 (E11)')).toEqual([
      { name: 'Cukrzyca typu 2', icd10: 'E11' },
    ]);
    expect(findDiagnoses('I10 Nadciśnienie tętnicze pierwotne')).toEqual([
      { name: 'Nadciśnienie tętnicze pierwotne', icd10: 'I10' },
    ]);
  });

  it('skips already stored diagnoses', () => {
    const found = findDiagnoses(discharge);
    expect(
      newDiagnoses(found, [
        {
          id: 'x',
          name: 'Białaczka',
          icd10: 'c92.1',
          diagnosedAt: '2026-01-01',
          active: true,
          source: 'manual',
        },
      ]),
    ).toEqual([]);
  });
});

describe('findResults', () => {
  it('reads value, unit and reference range', () => {
    expect(findResults(cbc)).toEqual([
      { name: 'HGB', value: 8.9, unit: 'g/dl', refLow: 12, refHigh: 16 },
      { name: 'PLT', value: 92, unit: 'tys/µl', refLow: 150, refHigh: 400 },
      { name: 'WBC', value: 3, unit: 'tys/µl', refLow: 4, refHigh: 10 },
    ]);
    expect(examName(cbc, 'Badanie')).toBe('Morfologia krwi');
    expect(examName('Recepta' + String.fromCharCode(10) + 'Glukoza 104 mg/dl (70-99)', 'x')).toBe(
      'Glukoza',
    );
    expect(findResults(discharge)).toEqual([]);
  });
});

describe('findDrugCandidates', () => {
  it('reads Rp./Lek: lines and names before a dose', () => {
    expect(
      findDrugCandidates('Rp. Xarelto 20 mg, 1 x dziennie\nLek: Amlodipina\nPacjent: Anna'),
    ).toEqual([{ name: 'Xarelto', strength: '20 mg' }, { name: 'Amlodipina' }]);
    expect(findDrugCandidates('Glukoza 104 mg/dl (70-99)')).toEqual([]);
  });
});

describe('findDate', () => {
  it('reads ISO and Polish dates', () => {
    expect(findDate('Data wystawienia: 12.09.2026')).toBe('2026-09-12');
    expect(findDate('z dnia 2026-03-02')).toBe('2026-03-02');
    expect(findDate('brak')).toBeUndefined();
  });
});

describe('pickByStrength', () => {
  it('prefers the strength from the document', () => {
    const drugs = [{ strength: '1 mg/ml' }, { strength: '20 mg' }];
    expect(pickByStrength(drugs, '20 mg')).toBe(drugs[1]);
    expect(pickByStrength(drugs, '5 mg')).toBe(drugs[0]);
    expect(pickByStrength(drugs)).toBe(drugs[0]);
  });
});
