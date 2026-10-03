import type { Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { describeFilter, headline, quickQuestions } from './ask.logic';

const xarelto: Medication = {
  id: 'x',
  name: 'Xarelto',
  dose: '20',
  unit: 'mg',
  schedule: { type: 'daily', times: ['08:00'] },
  category: 'prescription',
  startDate: '2025-01-01',
  endDate: '2025-06-30',
  source: 'manual',
};

describe('quickQuestions', () => {
  it('two months back from today', () => {
    expect(quickQuestions('2026-10-03')[0]?.filter.from).toBe('2026-08-03');
  });
});

describe('describeFilter / headline', () => {
  it('describes how the question was understood', () => {
    expect(describeFilter({ entity: 'medication', atcPrefix: 'B01', sort: 'desc', limit: 1 })).toBe(
      'leki · grupa ATC B01 · ostatni raz',
    );
  });

  it('answers "when last" with the end date', () => {
    expect(
      headline({ entity: 'medication', sort: 'desc', limit: 1 }, [
        { entity: 'medication', item: xarelto },
      ]),
    ).toBe('Ostatnio: Xarelto, do 30.06.2025.');
    expect(headline({ entity: 'exam' }, [])).toBe('Brak wyników.');
  });
});
