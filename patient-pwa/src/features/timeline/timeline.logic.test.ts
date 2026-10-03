import type { Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { localDateTime } from '../intake/intake.logic';
import {
  axisTicks,
  boundsOf,
  examLanes,
  focusRange,
  symptomLanes,
  medicationLanes,
  pct,
  rangeFor,
  toTime,
} from './timeline.logic';

const med = (over: Partial<Medication>): Medication => ({
  id: over.id ?? over.name ?? 'x',
  name: 'x',
  dose: '100',
  unit: 'mg',
  schedule: { type: 'daily', times: ['08:00'] },
  category: 'prescription',
  startDate: '2026-01-01',
  source: 'manual',
  ...over,
});

const range = { from: '2026-09-04', to: '2026-10-03' }; // 30 dni

describe('bounds / pct', () => {
  it('covers whole days inclusive', () => {
    const b = boundsOf(range);
    expect(pct(toTime('2026-09-04'), b)).toBe(0);
    expect(pct(toTime('2026-10-04'), b)).toBe(100);
    expect(pct(toTime('2026-09-19'), b)).toBeCloseTo(50, 0);
  });
});

describe('rangeFor', () => {
  it('ends today and spans the preset', () => {
    expect(rangeFor(30, '2026-10-03')).toEqual(range);
    expect(rangeFor(7, '2026-10-03')).toEqual({ from: '2026-09-27', to: '2026-10-03' });
    expect(rangeFor('all', '2026-10-03', '2025-01-01').from).toBe('2025-01-01');
    expect(rangeFor('all', '2026-10-03', '2026-09-30').from).toBe('2026-07-06');
  });
});

describe('medicationLanes', () => {
  it('one lane per substance, ordered by category then start, clipped to range', () => {
    const lanes = medicationLanes(
      [
        med({ id: 'sup', name: 'Grzyby', category: 'supplement', startDate: '2026-03-01' }),
        med({
          id: 'd1',
          name: 'Dazatynib',
          activeSubstance: 'dasatinib',
          startDate: '2026-09-03',
          endDate: '2026-09-20',
        }),
        med({
          id: 'd2',
          name: 'Dazatynib',
          activeSubstance: 'dasatinib',
          dose: '140',
          startDate: '2026-09-21',
        }),
        med({ id: 'old', name: 'Xarelto', startDate: '2025-01-01', endDate: '2025-06-30' }),
        med({
          id: 'ibu',
          name: 'Ibuprom',
          category: 'otc',
          schedule: { type: 'asNeeded' },
          startDate: '2026-08-04',
        }),
      ],
      range,
    );
    expect(lanes.map((l) => l.label)).toEqual(['Dazatynib', 'Ibuprom', 'Grzyby']);
    const daz = lanes[0]!;
    expect(daz.bars.map((b) => b.medication.id)).toEqual(['d1', 'd2']);
    expect(daz.bars[0]!.left).toBe(0);
    expect(daz.bars[0]!.ongoing).toBe(false);
    expect(daz.bars[1]!.ongoing).toBe(true);
    expect(daz.bars[1]!.label).toBe('140 mg');
  });
});

describe('axisTicks', () => {
  it('uses Mondays for a month and month starts for long ranges', () => {
    const month = axisTicks(range);
    expect(month.length).toBeGreaterThanOrEqual(4);
    expect(month[0]!.label).toBe('7.9');
    const long = axisTicks({ from: '2026-04-01', to: '2026-10-03' });
    expect(long.map((t) => t.label)).toEqual(['kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź']);
    const years = axisTicks({ from: '2022-12-03', to: '2026-10-03' });
    expect(years.map((t) => t.label)).toEqual(['2023', '2024', '2025', '2026']);
  });
});

describe('doses', () => {
  it('as-needed lanes get taken intakes, daily lanes only skipped ones', () => {
    const ibu = med({
      id: 'ibu',
      name: 'Ibuprom',
      schedule: { type: 'asNeeded' },
      category: 'otc',
    });
    const daz = med({ id: 'daz', name: 'Dazatynib' });
    const intake = (
      id: string,
      medicationId: string,
      day: string,
      status: 'taken' | 'skipped',
    ) => ({
      id,
      medicationId,
      scheduledAt: localDateTime(day, '08:00'),
      status,
      confirmedAt: localDateTime(day, '08:10'),
    });
    const lanes = medicationLanes([ibu, daz], range, [
      intake('a', 'ibu', '2026-09-10', 'taken'),
      intake('b', 'daz', '2026-09-10', 'taken'),
      intake('c', 'daz', '2026-09-11', 'skipped'),
      intake('d', 'ibu', '2025-01-01', 'taken'),
    ]);
    const byLabel = Object.fromEntries(
      lanes.map((l) => [l.label, l.doses.map((d) => d.intake.id)]),
    );
    expect(byLabel).toEqual({ Dazatynib: ['c'], Ibuprom: ['a'] });
    expect(lanes.find((l) => l.label === 'Ibuprom')!.bars[0]!.asNeeded).toBe(true);
  });
});

describe('focusRange', () => {
  it('reaches back to recent medication changes, at least 90 days', () => {
    const meds = [
      med({ startDate: '2022-12-03' }),
      med({ id: 'i', startDate: '2026-04-06', endDate: '2026-06-15' }),
    ];
    expect(focusRange(meds, '2026-10-03')).toEqual({ from: '2026-04-06', to: '2026-10-03' });
    expect(focusRange([med({ startDate: '2022-12-03' })], '2026-10-03').from).toBe('2026-07-06');
  });
});

describe('tracks below medications', () => {
  it('exam lanes label the first out-of-range value', () => {
    const lanes = examLanes(
      [
        {
          id: 'e1',
          name: 'Morfologia krwi',
          date: '2026-09-23',
          results: [
            { name: 'Leukocyty (WBC)', value: 5, unit: 'tys/µl', refLow: 4, refHigh: 10 },
            { name: 'Hemoglobina (HGB)', value: 8.9, unit: 'g/dl', refLow: 12, refHigh: 16 },
          ],
        },
        { id: 'old', name: 'Morfologia krwi', date: '2025-01-01', results: [] },
      ],
      range,
    );
    expect(lanes).toHaveLength(1);
    expect(lanes[0]!.marks.map((m) => [m.label, m.outOfRange])).toEqual([['HGB 8,9↓', true]]);
  });

  it('symptom lanes per name in order of first occurrence', () => {
    const s = (id: string, name: string, day: string) => ({
      id,
      name,
      startedAt: localDateTime(day, '09:00'),
      source: 'manual' as const,
    });
    const lanes = symptomLanes(
      [
        s('a', 'ból głowy', '2026-09-20'),
        s('b', 'zawroty głowy', '2026-09-10'),
        s('c', 'Zawroty głowy', '2026-09-25'),
      ],
      range,
    );
    expect(lanes.map((l) => [l.name, l.marks.length])).toEqual([
      ['zawroty głowy', 2],
      ['ból głowy', 1],
    ]);
  });
});
