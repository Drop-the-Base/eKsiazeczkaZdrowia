import { describe, expect, it } from 'vitest';
import { createDemoData, DEMO_INTAKE_DAYS } from './demo-data';
import type { Medication } from './types';

const now = '2026-10-03T18:00:00.000Z';
const data = createDemoData(now);
const med = (id: string): Medication => {
  const m = data.medications.find((x) => x.id === id);
  if (!m) throw new Error(id);
  return m;
};
const outOfRange = (r: { value: number; refLow?: number; refHigh?: number }) =>
  (r.refLow !== undefined && r.value < r.refLow) ||
  (r.refHigh !== undefined && r.value > r.refHigh);

describe('createDemoData', () => {
  it('has a blood cancer diagnosis', () => {
    expect(data.diagnoses.some((d) => d.active && d.icd10?.startsWith('C9'))).toBe(true);
  });

  it('keeps the supplement running through every exam', () => {
    const supplement = med('demo-med-mushroom');
    expect(supplement.category).toBe('supplement');
    expect(supplement.endDate).toBeUndefined();
    for (const exam of data.exams) expect(supplement.startDate <= exam.date).toBe(true);
  });

  it('has a bad blood count after every medication change', () => {
    const starts = ['demo-med-imatinib', 'demo-med-nilotinib', 'demo-med-dasatinib'].map(
      (id) => med(id).startDate,
    );
    for (const start of starts) {
      const exam = data.exams.find((e) => e.date > start);
      expect(exam?.results.some(outOfRange)).toBe(true);
    }
    expect(med('demo-med-imatinib').stopReason).toBeTruthy();
    expect(med('demo-med-nilotinib').stopReason).toBeTruthy();
  });

  it('has an anticoagulant in the past and an OTC drug', () => {
    expect(data.medications.some((m) => m.atcCode?.startsWith('B01') && m.endDate)).toBe(true);
    expect(data.medications.some((m) => m.category === 'otc')).toBe(true);
  });

  it('has daily confirmations before today and dizziness after the newest drug', () => {
    const days = new Set(data.intakes.map((i) => i.scheduledAt.slice(0, 10)));
    expect(days.size).toBe(DEMO_INTAKE_DAYS);
    expect(data.intakes.every((i) => i.scheduledAt < now)).toBe(true);
    const start = med('demo-med-dasatinib').startDate;
    expect(
      data.symptoms.filter((s) => s.name === 'zawroty głowy' && s.startedAt >= start).length,
    ).toBeGreaterThan(2);
  });

  it('has a past visit, an upcoming follow-up and an open visit note', () => {
    expect(data.visits[0]?.followUpDate && data.visits[0].followUpDate > now.slice(0, 10)).toBe(
      true,
    );
    expect(data.visitNoteItems.some((n) => !n.discussed)).toBe(true);
    expect(data.documents.filter((d) => d.source === 'ikp').length).toBeGreaterThanOrEqual(1);
  });

  it('uses unique ids and valid references', () => {
    const all = [
      ...data.diagnoses,
      ...data.medications,
      ...data.intakes,
      ...data.symptoms,
      ...data.exams,
      ...data.documents,
      ...data.visits,
      ...data.visitNoteItems,
      ...data.reminders,
    ].map((x) => x.id);
    expect(new Set(all).size).toBe(all.length);
    const medIds = new Set(data.medications.map((m) => m.id));
    expect(data.intakes.every((i) => medIds.has(i.medicationId))).toBe(true);
    const docIds = new Set(data.documents.map((d) => d.id));
    expect(data.exams.every((e) => !e.documentId || docIds.has(e.documentId))).toBe(true);
  });
});
