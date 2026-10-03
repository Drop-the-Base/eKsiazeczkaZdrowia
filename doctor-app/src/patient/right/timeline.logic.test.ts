import { describe, expect, it } from 'vitest';
import { createDemoSnapshot, type TimelineData } from '@ez/shared';
import { rangeFlag, rangeFor } from './timeline.logic';

const s = createDemoSnapshot('2026-10-03T18:00:00.000Z');
const data: TimelineData = { ...s, photos: [] };
const today = '2026-10-03';

describe('timeline range and flags', () => {
  it('"Leczenie" covers the medication changes and the supplement start (max one year)', () => {
    const r = rangeFor('treatment', data, today);
    expect(r.to).toBe(today);
    expect(r.from <= s.medications.find((m) => m.name === 'Imatinib')!.startDate).toBe(true);
    expect(r.from <= s.medications.find((m) => m.category === 'supplement')!.startDate).toBe(true);
    expect(r.from >= '2025-10-03').toBe(true);
    expect(rangeFor('30', data, today).from).toBe('2026-09-03');
  });

  it('flags results by reference range', () => {
    expect(rangeFlag({ name: 'x', value: 20, unit: '', refHigh: 10 })).toBe('↑');
    expect(rangeFlag({ name: 'x', value: 5, unit: '', refLow: 10 })).toBe('↓');
    expect(rangeFlag({ name: 'x', value: 5, unit: '' })).toBe('');
  });
});
