import { describe, expect, it } from 'vitest';
import { cleanOcrText, ocrToExamForm } from './ocr.logic';

describe('ocrToExamForm', () => {
  it('turns a printed blood count into a form', () => {
    const text = `  Morfologia krwi
Data: 01.10.2026
HGB   8,9  g/dl  (12 – 16)
PLT 92 tys/µl (15O-400)

`;
    expect(ocrToExamForm(text, '2026-10-03')).toEqual({
      name: 'Morfologia krwi',
      date: '2026-10-01',
      rows: [
        { name: 'HGB', value: '8,9', unit: 'g/dl', refLow: '12', refHigh: '16' },
        { name: 'PLT', value: '92', unit: 'tys/µl', refLow: '150', refHigh: '400' },
      ],
    });
  });

  it('returns null without recognisable results and ignores future dates', () => {
    expect(ocrToExamForm('nieczytelne', '2026-10-03')).toBeNull();
    expect(ocrToExamForm('CRP 7 mg/l (0-5)\nData: 01.01.2027', '2026-10-03')?.date).toBe(
      '2026-10-03',
    );
  });

  it('cleans OCR noise', () => {
    expect(cleanOcrText('  a\t b  \n\n 1O-2O ')).toBe('a b\n10-20');
  });
});
