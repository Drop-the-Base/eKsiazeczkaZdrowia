import type { Drug, Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { acceptsMatch, findMedication, newAsNeededMedication } from './applyEntry.logic';

const ibuprom: Drug & { otc: boolean } = {
  rplId: 'r1',
  name: 'Ibuprom Max',
  activeSubstance: 'Ibuprofenum',
  strength: '400 mg',
  form: 'Tabletki',
  atcCode: 'M01AE01',
  otc: true,
};

const med = (over: Partial<Medication>): Medication => ({
  id: over.name ?? 'x',
  name: 'x',
  dose: '1',
  unit: 'tabl.',
  schedule: { type: 'asNeeded' },
  category: 'otc',
  startDate: '2026-01-01',
  source: 'manual',
  ...over,
});

describe('acceptsMatch', () => {
  it('accepts spoken words covering most of the first name word', () => {
    expect(acceptsMatch('ibuprom', ibuprom)).toBe(true);
    expect(acceptsMatch('ibupro', ibuprom)).toBe(true);
    expect(acceptsMatch('ibu', ibuprom)).toBe(false);
    expect(acceptsMatch('leki', { ...ibuprom, name: 'Lekadolum' })).toBe(false);
  });
});

describe('findMedication', () => {
  const today = '2026-10-03';
  it('matches by RPL id, then substance, then name; only current ones', () => {
    const byRpl = med({ name: 'A', rplId: 'r1' });
    const bySubstance = med({ name: 'Nurofen', activeSubstance: 'ibuprofenum' });
    const stopped = med({ name: 'Ibuprom Max', endDate: '2026-01-02', stopReason: 'x' });
    const intake = { name: 'Ibuprom Max', drug: ibuprom, takenAt: '' };
    expect(findMedication([bySubstance, byRpl], intake, today)).toBe(byRpl);
    expect(findMedication([bySubstance], intake, today)).toBe(bySubstance);
    expect(findMedication([stopped], intake, today)).toBeUndefined();
    expect(
      findMedication([med({ name: 'Melisa' })], { name: 'melisa', takenAt: '' }, today)?.name,
    ).toBe('Melisa');
  });
});

describe('newAsNeededMedication', () => {
  it('creates an as-needed OTC medication from RPL, supplement otherwise', () => {
    expect(
      newAsNeededMedication({ name: 'Ibuprom Max', drug: ibuprom, takenAt: '' }, '2026-10-03'),
    ).toMatchObject({
      dose: '400',
      unit: 'mg',
      category: 'otc',
      schedule: { type: 'asNeeded' },
      source: 'voice',
    });
    expect(newAsNeededMedication({ name: 'Melisę', takenAt: '' }, '2026-10-03').category).toBe(
      'supplement',
    );
  });
});
