import { describe, expect, it } from 'vitest';
import {
  emptyRow,
  flagOf,
  hasErrors,
  parseNumber,
  toExam,
  validateExam,
  type ExamForm,
} from './exams.logic';

describe('flagOf', () => {
  const r = { name: 'HGB', value: 10, unit: 'g/dl', refLow: 12, refHigh: 16 };
  it('flags values outside the reference range', () => {
    expect(flagOf(r)).toBe('low');
    expect(flagOf({ ...r, value: 17 })).toBe('high');
    expect(flagOf({ ...r, value: 12 })).toBeUndefined();
    expect(flagOf({ name: 'x', value: 1, unit: '' })).toBeUndefined();
  });
});

describe('parseNumber', () => {
  it('accepts comma decimals', () => {
    expect(parseNumber(' 12,5 ')).toBe(12.5);
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('abc')).toBeUndefined();
  });
});

describe('validateExam / toExam', () => {
  const form: ExamForm = {
    name: 'Morfologia krwi',
    date: '2026-10-01',
    rows: [{ name: 'HGB', value: '9,1', unit: 'g/dl', refLow: '12', refHigh: '16' }, emptyRow()],
  };

  it('skips preset rows without a value', () => {
    const preset = {
      ...form,
      rows: [...form.rows, { ...emptyRow(), name: 'PLT', unit: 'tys/µl' }],
    };
    expect(hasErrors(validateExam(preset, '2026-10-03'))).toBe(false);
    expect(toExam(preset).results).toHaveLength(1);
  });

  it('accepts a valid form and skips empty rows', () => {
    expect(hasErrors(validateExam(form, '2026-10-03'))).toBe(false);
    expect(toExam(form)).toEqual({
      name: 'Morfologia krwi',
      date: '2026-10-01',
      results: [{ name: 'HGB', value: 9.1, unit: 'g/dl', refLow: 12, refHigh: 16 }],
    });
  });

  it('reports bad values, missing results and future dates', () => {
    const bad = validateExam(
      { name: '', date: '2026-10-04', rows: [{ ...emptyRow(), name: 'HGB', value: 'x' }] },
      '2026-10-03',
    );
    expect(bad.name).toBeDefined();
    expect(bad.date).toBeDefined();
    expect(bad.rowErrors[0]).toBeDefined();
    expect(validateExam({ ...form, rows: [emptyRow()] }, '2026-10-03').rows).toBeDefined();
  });
});
