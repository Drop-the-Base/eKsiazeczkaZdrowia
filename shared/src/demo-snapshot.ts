import { createDemoData } from './demo-data.js';
import type { IsoDateTime, ShareSnapshot } from './types.js';

/**
 * "Pani Anna" as the doctor receives her (patient simulator, doctor view during development).
 * TODO(B15): build `summary` with `buildVisitSummary` instead of this minimal stand-in.
 */
export function createDemoSnapshot(now: IsoDateTime): ShareSnapshot {
  const d = createDemoData(now);
  const since = d.visits[0]?.date ?? now.slice(0, 10);
  const recentIntakes = d.intakes.filter((i) => i.scheduledAt >= since);
  return {
    summary: {
      since,
      medsStarted: d.medications.filter((m) => m.startDate >= since),
      medsStopped: d.medications.filter((m) => m.endDate !== undefined && m.endDate >= since),
      medsChanged: [],
      adherence: {
        taken: recentIntakes.filter((i) => i.status === 'taken').length,
        skipped: recentIntakes.filter((i) => i.status === 'skipped').length,
      },
      symptoms: [],
      newExams: d.exams.filter((e) => e.date >= since),
      newPhotos: [],
      visitNoteItems: d.visitNoteItems.filter((n) => !n.discussed),
    },
    profile: d.profile,
    medications: d.medications,
    intakes: d.intakes,
    symptoms: d.symptoms,
    diagnoses: d.diagnoses,
    exams: d.exams,
    photos: [],
    documents: d.documents.map(({ content: _content, ...meta }) => meta),
    visitNoteItems: d.visitNoteItems,
    visits: d.visits,
    range: {
      from: d.medications.reduce((min, m) => (m.startDate < min ? m.startDate : min), since),
      to: now.slice(0, 10),
    },
    createdAt: now,
  };
}
