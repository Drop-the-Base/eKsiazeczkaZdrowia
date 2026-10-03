import { createDemoData } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { runFilter } from './runFilter.logic';

// Trzy scenariusze z happy path na danych demo (Pani Anna), „dziś” = 03.10.2026.
const now = new Date(2026, 9, 3, 12, 0).toISOString();
const demo = createDemoData(now);
const data = { medications: demo.medications, symptoms: demo.symptoms, exams: demo.exams };
const names = (r: ReturnType<typeof runFilter>) =>
  r.map((x) => (x.entity === 'exam' ? x.item.name : x.item.name));

describe('runFilter on demo data', () => {
  it('medications in the last 2 months include the supplement', () => {
    const r = runFilter({ entity: 'medication', from: '2026-08-03', sort: 'asc' }, data);
    const list = names(r);
    expect(list).toContain('Suplement z grzybów');
    expect(list).toContain('Ibuprom');
    expect(list).not.toContain('Xarelto');
    expect(list).not.toContain('Imatinib');
  });

  it('last anticoagulant (ATC B01) is Xarelto with its end date', () => {
    const r = runFilter({ entity: 'medication', atcPrefix: 'B01', sort: 'desc', limit: 1 }, data);
    expect(r).toHaveLength(1);
    expect(r[0]?.entity === 'medication' && r[0].item.name).toBe('Xarelto');
    expect(r[0]?.entity === 'medication' && r[0].item.endDate).toBeDefined();
  });

  it('headaches oldest first, without other symptoms', () => {
    const r = runFilter({ entity: 'symptom', name: 'ból głowy', sort: 'asc' }, data);
    expect(r.length).toBeGreaterThanOrEqual(2);
    expect(new Set(names(r))).toEqual(new Set(['ból głowy']));
    const dates = r.map((x) => (x.entity === 'symptom' ? x.item.startedAt : ''));
    expect([...dates].sort()).toEqual(dates);
  });
});

describe('runFilter edge cases', () => {
  it('ongoing medications come first for "when last"', () => {
    const r = runFilter({ entity: 'medication', sort: 'desc', limit: 2 }, data);
    expect(r.every((x) => x.entity === 'medication' && x.item.endDate === undefined)).toBe(true);
  });

  it('matches names without diacritics and filters exams by date', () => {
    expect(runFilter({ entity: 'symptom', name: 'bol glowy' }, data).length).toBeGreaterThan(0);
    expect(runFilter({ entity: 'exam', from: '2027-01-01' }, data)).toEqual([]);
  });
});
