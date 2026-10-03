import { describe, expect, it } from 'vitest';
import type { HealthData } from '../contracts';
import { createDemoData } from '../demo-data';
import type { Exam, Medication } from '../types';
import { buildVisitSummary, isOutOfRange, lastVisitDate } from './buildVisitSummary';

const now = '2026-10-03T18:00:00.000Z';

function demoHealthData(): HealthData {
  const d = createDemoData(now);
  return { ...d, photos: [] };
}

describe('buildVisitSummary on the demo (since the last visit)', () => {
  const data = demoHealthData();
  const since = lastVisitDate(data.visits, now)!;
  const s = buildVisitSummary(data, since, now);

  it('lists the new and the stopped medication with its reason', () => {
    expect(s.medsStarted.map((m) => m.name)).toEqual(['Dazatynib']);
    expect(s.medsStopped.map((m) => [m.name, m.stopReason])).toEqual([
      ['Nilotynib', 'złe wyniki morfologii'],
    ]);
    expect(s.medsChanged).toEqual([]);
  });

  it('counts intakes in the range', () => {
    // 3 daily meds × 21 days − 2 skipped + 2 Ibuprom
    expect(s.adherence).toEqual({ taken: 63, skipped: 2 });
  });

  it('summarises symptoms with dates after the new medication', () => {
    expect(s.symptoms.map((x) => [x.name, x.count, x.maxSeverity])).toEqual([
      ['zawroty głowy', 5, 4],
      ['ból głowy', 2, 3],
    ]);
    expect(s.symptoms[0]?.afterNewMed).toMatchObject({ medicationName: 'Dazatynib' });
  });

  it('includes the new exam (out of range) and the open visit note', () => {
    expect(s.newExams).toHaveLength(1);
    expect(s.newExams[0]?.results.some(isOutOfRange)).toBe(true);
    expect(s.visitNoteItems.map((n) => n.id)).toEqual(['demo-note-2']);
  });
});

describe('buildVisitSummary rules', () => {
  const med = (over: Partial<Medication>): Medication => ({
    id: over.id ?? over.name ?? 'm',
    name: 'Lek',
    dose: '1',
    unit: 'mg',
    schedule: { type: 'asNeeded' },
    category: 'prescription',
    startDate: '2026-01-01',
    source: 'manual',
    ...over,
  });
  const empty: HealthData = {
    medications: [],
    intakes: [],
    symptoms: [],
    exams: [],
    photos: [],
    visitNoteItems: [],
    visits: [],
  };

  it('pairs a dose change of the same substance', () => {
    const s = buildVisitSummary(
      {
        ...empty,
        medications: [
          med({
            id: 'old',
            activeSubstance: 'amlodypina',
            dose: '5',
            endDate: '2026-09-10',
            stopReason: 'ciśnienie',
          }),
          med({ id: 'new', activeSubstance: 'Amlodypina', dose: '10', startDate: '2026-09-10' }),
          med({ id: 'other', activeSubstance: 'x', startDate: '2026-09-12' }),
        ],
      },
      '2026-09-01',
      now,
    );
    expect(s.medsChanged.map((c) => [c.from.id, c.to.id])).toEqual([['old', 'new']]);
    expect(s.medsStarted.map((m) => m.id)).toEqual(['other']);
    expect(s.medsStopped).toEqual([]);
  });

  it('puts out-of-range exams first and ignores the future', () => {
    const exam = (id: string, date: string, value: number): Exam => ({
      id,
      name: 'CRP',
      date,
      results: [{ name: 'CRP', value, unit: 'mg/l', refHigh: 5 }],
    });
    const s = buildVisitSummary(
      {
        ...empty,
        exams: [
          exam('ok', '2026-09-20', 1),
          exam('high', '2026-09-10', 30),
          exam('future', '2026-12-01', 50),
        ],
      },
      '2026-09-01',
      now,
    );
    expect(s.newExams.map((e) => e.id)).toEqual(['high', 'ok']);
  });

  it('groups symptom names case-insensitively and keeps the first occurrence ever', () => {
    const s = buildVisitSummary(
      {
        ...empty,
        symptoms: [
          { id: '1', name: 'Kaszel', startedAt: '2026-08-01T10:00:00Z', source: 'manual' },
          {
            id: '2',
            name: 'kaszel ',
            startedAt: '2026-09-05T10:00:00Z',
            source: 'voice',
            severity: 2,
          },
          { id: '3', name: 'kaszel', startedAt: '2026-09-06T10:00:00Z', source: 'manual' },
        ],
      },
      '2026-09-01',
      now,
    );
    expect(s.symptoms).toEqual([
      { name: 'kaszel ', count: 2, maxSeverity: 2, firstAt: '2026-08-01T10:00:00Z' },
    ]);
  });
});
