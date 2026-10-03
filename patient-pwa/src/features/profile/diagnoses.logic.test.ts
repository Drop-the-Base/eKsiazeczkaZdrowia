import type { Diagnosis } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { normalizeIcd10, splitDiagnoses, validateDiagnosis } from './diagnoses.logic';

const dx = (id: string, diagnosedAt: string, active: boolean): Diagnosis => ({
  id,
  name: id,
  diagnosedAt,
  active,
  source: 'manual',
});

describe('splitDiagnoses', () => {
  it('splits by active and sorts newest first', () => {
    const { active, past } = splitDiagnoses([
      dx('a', '2024-01-01', true),
      dx('b', '2025-01-01', true),
      dx('c', '2023-01-01', false),
    ]);
    expect(active.map((d) => d.id)).toEqual(['b', 'a']);
    expect(past.map((d) => d.id)).toEqual(['c']);
  });
});

describe('validateDiagnosis', () => {
  const ok = { name: 'Białaczka', icd10: 'c92.1', diagnosedAt: '2026-03-01', active: true };

  it('accepts lowercase ICD-10 and empty code', () => {
    expect(validateDiagnosis(ok, '2026-10-03')).toEqual({});
    expect(validateDiagnosis({ ...ok, icd10: '' }, '2026-10-03')).toEqual({});
  });

  it('rejects bad code, missing name and future date', () => {
    const errors = validateDiagnosis(
      { ...ok, name: ' ', icd10: '92C', diagnosedAt: '2027-01-01' },
      '2026-10-03',
    );
    expect(Object.keys(errors).sort()).toEqual(['diagnosedAt', 'icd10', 'name']);
  });

  it('normalizes the code', () => {
    expect(normalizeIcd10(' c92,1 ')).toBe('C92.1');
  });
});
