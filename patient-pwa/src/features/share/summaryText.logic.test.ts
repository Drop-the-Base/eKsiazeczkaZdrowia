import { describe, expect, it } from 'vitest';
import { adherenceLine, outOfRangeLine, symptomLine } from './summaryText.logic';

describe('summary texts', () => {
  it('describes a symptom with dates after a new medication', () => {
    expect(
      symptomLine({
        name: 'zawroty głowy',
        count: 5,
        maxSeverity: 4,
        firstAt: '2026-09-07T09:30:00',
        afterNewMed: { medicationId: 'm', medicationName: 'Dazatynib', startDate: '2026-09-03' },
      }),
    ).toBe('zawroty głowy ×5, najsilniej 4/5, od 07.09.2026 · 4 dni po rozpoczęciu: Dazatynib');
  });

  it('lists out-of-range results with the reference range', () => {
    expect(
      outOfRangeLine({
        id: 'e',
        name: 'Morfologia',
        date: '2026-09-23',
        results: [
          { name: 'HGB', value: 8.9, unit: 'g/dl', refLow: 12, refHigh: 16 },
          { name: 'WBC', value: 5, unit: 'tys/µl', refLow: 4, refHigh: 10 },
        ],
      }),
    ).toBe('poza zakresem: HGB 8,9 g/dl (12–16)');
  });

  it('describes adherence', () => {
    expect(adherenceLine({ taken: 61, skipped: 2 })).toBe(
      'Potwierdzone 61 z 63 dawek (pominięte: 2)',
    );
    expect(adherenceLine({ taken: 0, skipped: 0 })).toBe(
      'Brak potwierdzeń przyjęcia w tym okresie',
    );
  });
});
