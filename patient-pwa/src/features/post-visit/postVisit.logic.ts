import type {
  IsoDate,
  Medication,
  MedicationCategory,
  MedicationSchedule,
  VisitNoteChanges,
} from '@ez/shared';
import { normalize } from '../drugs';

export interface StopProposal {
  key: string;
  /** Name as said in the note. */
  said: string;
  reason: string;
  /** Whether the name matched any current medication. */
  matched: boolean;
  /** Matching current medications, or all current ones when nothing matched; the patient picks one. */
  candidates: Medication[];
  medicationId?: string;
  selected: boolean;
}

export interface AddProposal {
  key: string;
  name: string;
  dose: string;
  unit: string;
  schedule: MedicationSchedule;
  category: MedicationCategory;
  selected: boolean;
}

export interface PostVisitPlan {
  stops: StopProposal[];
  adds: AddProposal[];
  followUp?: { date: IsoDate; selected: boolean };
}

const DEFAULT_REASON = 'zalecenie lekarza';

/** Current medications matching a name from the note ("suplement" also matches the supplements group). */
export function matchMedications(said: string, current: Medication[]): Medication[] {
  const n = normalize(said);
  if (!n) return [];
  const byName = current.filter((m) => {
    const names = [m.name, m.activeSubstance ?? ''].map(normalize).filter(Boolean);
    return names.some((x) => x.includes(n) || n.includes(x));
  });
  if (byName.length > 0) return byName;
  if (n.includes('suplement')) return current.filter((m) => m.category === 'supplement');
  return [];
}

export function buildPlan(changes: VisitNoteChanges, current: Medication[]): PostVisitPlan {
  const plan: PostVisitPlan = {
    stops: changes.stopMeds.map((s, i) => {
      const matches = matchMedications(s.name, current);
      const candidates = matches.length > 0 ? matches : current;
      return {
        key: `stop-${i}`,
        said: s.name,
        reason: s.reason ?? DEFAULT_REASON,
        matched: matches.length > 0,
        candidates,
        medicationId: matches.length === 1 ? matches[0]!.id : undefined,
        selected: matches.length === 1,
      };
    }),
    adds: changes.newMeds.map((m, i) => ({
      key: `add-${i}`,
      name: m.name,
      dose: m.dose ?? '',
      unit: m.unit ?? '',
      schedule: m.schedule ?? { type: 'daily', times: ['08:00'] },
      category: m.category ?? 'prescription',
      selected: true,
    })),
  };
  if (changes.followUpDate) plan.followUp = { date: changes.followUpDate, selected: true };
  return plan;
}

export const isEmptyPlan = (p: PostVisitPlan): boolean =>
  p.stops.length === 0 && p.adds.length === 0 && !p.followUp;

/** Validates the server response (boundary of the app). */
export function isVisitNoteChanges(v: unknown): v is VisitNoteChanges {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  const named = (x: unknown) =>
    typeof x === 'object' && x !== null && typeof (x as { name?: unknown }).name === 'string';
  return (
    Array.isArray(o.stopMeds) &&
    o.stopMeds.every(named) &&
    Array.isArray(o.newMeds) &&
    o.newMeds.every(named) &&
    (o.followUpDate === undefined ||
      (typeof o.followUpDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.followUpDate)))
  );
}

/** Follow-up reminder at 9:00 local time on the day of the follow-up. */
export function followUpReminderAt(date: IsoDate): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, 9, 0).toISOString();
}
