import { describe, expect, it } from 'vitest';
import { createDemoSnapshot, type TimelineData } from '@ez/shared';
import { buildEvents, groupByDay, medsInRange, rangeFlag, rangeFor } from './timeline.logic';

const s = createDemoSnapshot('2026-10-03T18:00:00.000Z');
const data: TimelineData = { ...s, photos: [] };
const today = '2026-10-03';

describe('timeline logic', () => {
  it('"Leczenie" covers the medication changes and the supplement start (max one year)', () => {
    const r = rangeFor('treatment', data, today);
    expect(r.to).toBe(today);
    expect(r.from <= s.medications.find((m) => m.name === 'Imatinib')!.startDate).toBe(true);
    expect(r.from >= '2025-10-03').toBe(true);
    expect(rangeFor('30', data, today).from).toBe('2026-09-03');
  });

  it('shows the supplement as taken through the whole treatment range', () => {
    const names = medsInRange(s.medications, rangeFor('treatment', data, today)).map((m) => m.name);
    expect(names).toEqual(
      expect.arrayContaining(['Imatinib', 'Nilotynib', 'Dazatynib', 'Suplement z grzybów']),
    );
    expect(names).not.toContain('Xarelto');
  });

  it('builds sorted events with out-of-range exams flagged', () => {
    const events = buildEvents(data, rangeFor('treatment', data, today));
    expect(events.map((e) => e.at)).toEqual([...events.map((e) => e.at)].sort());
    const exams = events.filter((e) => e.kind === 'exam');
    expect(exams).toHaveLength(3);
    expect(exams.every((e) => e.outOfRange)).toBe(true);
    expect(exams[0]?.detail).toContain('9,1↓');
    expect(groupByDay(events).every((g) => g.events.every((e) => e.day === g.day))).toBe(true);
  });

  it('flags results by reference range', () => {
    expect(rangeFlag({ name: 'x', value: 20, unit: '', refHigh: 10 })).toBe('↑');
    expect(rangeFlag({ name: 'x', value: 5, unit: '', refLow: 10 })).toBe('↓');
    expect(rangeFlag({ name: 'x', value: 5, unit: '' })).toBe('');
  });
});
