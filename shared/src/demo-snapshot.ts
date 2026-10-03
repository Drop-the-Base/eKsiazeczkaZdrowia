import { createDemoData } from './demo-data.js';
import { buildVisitSummary, lastVisitDate } from './summary/buildVisitSummary.js';
import type { IsoDateTime, ShareSnapshot } from './types.js';

/** "Pani Anna" as the doctor receives her (patient simulator, doctor view during development). */
export function createDemoSnapshot(now: IsoDateTime): ShareSnapshot {
  const d = createDemoData(now);
  const since = lastVisitDate(d.visits, now) ?? now.slice(0, 10);
  return {
    summary: buildVisitSummary({ ...d, photos: [] }, since, now),
    profile: d.profile,
    medications: d.medications,
    intakes: d.intakes,
    symptoms: d.symptoms,
    diagnoses: d.diagnoses,
    exams: d.exams,
    photos: [],
    documents: d.documents.map(({ content: _content, ...meta }) => meta),
    visitNoteItems: d.visitNoteItems.filter((n) => !n.discussed),
    visits: d.visits,
    range: {
      from: d.medications.reduce((min, m) => (m.startDate < min ? m.startDate : min), since),
      to: now.slice(0, 10),
    },
    createdAt: now,
  };
}
