// Visit summary computed locally, without LLM (TASKS.md T2.6b). Facts and dates only, no conclusions.
import type { HealthData } from '../contracts.js';
import type {
  Exam,
  ExamResult,
  IsoDate,
  IsoDateTime,
  Medication,
  MedicationChange,
  Severity,
  Symptom,
  SymptomSummary,
  VisitSummary,
} from '../types.js';

const DAY_MS = 24 * 3600 * 1000;
/** A symptom is listed "after a new medication" when it first appeared this many days after the start. */
export const AFTER_NEW_MED_DAYS = 14;

export function isOutOfRange(r: ExamResult): boolean {
  return (
    (r.refLow !== undefined && r.value < r.refLow) ||
    (r.refHigh !== undefined && r.value > r.refHigh)
  );
}

export const hasOutOfRange = (exam: Exam): boolean => exam.results.some(isOutOfRange);

/** Most recent visit date before `now`, or `undefined` when there was none. */
export function lastVisitDate(visits: HealthData['visits'], now: IsoDateTime): IsoDate | undefined {
  return visits
    .map((v) => v.date)
    .filter((d) => d <= now)
    .sort()
    .at(-1);
}

const substanceKey = (m: Medication) => (m.activeSubstance ?? m.name).trim().toLowerCase();
const symptomKey = (name: string) => name.trim().toLowerCase();
const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / DAY_MS;

/** Stopped and started again with the same substance within a day = a change (e.g. new dose). */
function pairChanges(stopped: Medication[], started: Medication[]): MedicationChange[] {
  const changes: MedicationChange[] = [];
  const used = new Set<string>();
  for (const from of stopped) {
    const to = started.find(
      (m) =>
        !used.has(m.id) &&
        substanceKey(m) === substanceKey(from) &&
        from.endDate !== undefined &&
        Math.abs(daysBetween(from.endDate, m.startDate)) <= 1,
    );
    if (to) {
      used.add(to.id);
      changes.push({ from, to });
    }
  }
  return changes;
}

function afterNewMed(
  firstAt: IsoDateTime,
  medications: Medication[],
): SymptomSummary['afterNewMed'] {
  const candidate = medications
    .filter((m) => {
      const days = daysBetween(m.startDate, firstAt);
      return days >= 0 && days <= AFTER_NEW_MED_DAYS;
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  return (
    candidate && {
      medicationId: candidate.id,
      medicationName: candidate.name,
      startDate: candidate.startDate,
    }
  );
}

function summariseSymptoms(
  all: Symptom[],
  inRange: Symptom[],
  medications: Medication[],
): SymptomSummary[] {
  const groups = new Map<string, Symptom[]>();
  for (const s of inRange)
    groups.set(symptomKey(s.name), [...(groups.get(symptomKey(s.name)) ?? []), s]);

  return [...groups.entries()]
    .map(([key, items]): SymptomSummary => {
      // First occurrence ever ("od kiedy"), not only within the range.
      const firstAt = all
        .filter((s) => symptomKey(s.name) === key)
        .map((s) => s.startedAt)
        .sort()[0]!;
      const severities = items.map((s) => s.severity).filter((s): s is Severity => s !== undefined);
      const summary: SymptomSummary = { name: items[0]!.name, count: items.length, firstAt };
      if (severities.length > 0) summary.maxSeverity = Math.max(...severities) as Severity;
      const med = afterNewMed(firstAt, medications);
      if (med) summary.afterNewMed = med;
      return summary;
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl'));
}

/** Everything that happened in `[since, now]`. */
export function buildVisitSummary(
  data: HealthData,
  since: IsoDate,
  now: IsoDateTime,
): VisitSummary {
  const within = (value: string) => value >= since && value <= now;

  const started = data.medications.filter((m) => within(m.startDate));
  const stopped = data.medications.filter((m) => m.endDate !== undefined && within(m.endDate));
  const medsChanged = pairChanges(stopped, started);
  const changedIds = new Set(medsChanged.flatMap((c) => [c.from.id, c.to.id]));

  const intakes = data.intakes.filter((i) => within(i.scheduledAt));
  const symptoms = data.symptoms.filter((s) => within(s.startedAt));

  return {
    since,
    medsStarted: started.filter((m) => !changedIds.has(m.id)),
    medsStopped: stopped.filter((m) => !changedIds.has(m.id)),
    medsChanged,
    adherence: {
      taken: intakes.filter((i) => i.status === 'taken').length,
      skipped: intakes.filter((i) => i.status === 'skipped').length,
    },
    symptoms: summariseSymptoms(data.symptoms, symptoms, data.medications),
    newExams: data.exams
      .filter((e) => within(e.date))
      .sort(
        (a, b) =>
          Number(hasOutOfRange(b)) - Number(hasOutOfRange(a)) || b.date.localeCompare(a.date),
      ),
    newPhotos: data.photos
      .filter((p) => within(p.takenAt))
      .sort((a, b) => a.takenAt.localeCompare(b.takenAt))
      .map(({ blob: _blob, ...meta }) => meta),
    visitNoteItems: data.visitNoteItems
      .filter((n) => !n.discussed)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}
