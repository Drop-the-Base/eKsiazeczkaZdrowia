import {
  LLM_VISIT_NOTE_PATH,
  type AppliedChange,
  type IsoDate,
  type LlmVisitNoteRequest,
  type Visit,
  type VisitNoteChanges,
} from '@ez/shared';
import { db } from '../../db';
import { searchDrugs } from '../drugs';
import { stopMedication } from '../meds';
import { createReminder, markDone } from '../reminders';
import { followUpReminderAt, isVisitNoteChanges, type PostVisitPlan } from './postVisit.logic';

/** Only the note text and today's date go to the server – no name, profile or history. */
export async function parseVisitNote(text: string, today: IsoDate): Promise<VisitNoteChanges> {
  const body: LlmVisitNoteRequest = { text, today };
  let res: Response;
  try {
    res = await fetch(LLM_VISIT_NOTE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Brak połączenia z internetem. Spróbuj ponownie albo wprowadź zmiany w lekach ręcznie.',
    );
  }
  if (!res.ok) throw new Error('Nie udało się odczytać notatki. Spróbuj ponownie.');
  const data: unknown = await res.json();
  if (!isVisitNoteChanges(data)) throw new Error('Niepoprawna odpowiedź serwera.');
  return data;
}

/** RPL data for a new medication when the name is found; the medication is saved either way. */
async function lookupDrug(name: string) {
  try {
    return (await searchDrugs(name, 1))[0];
  } catch {
    return undefined; // drug database unavailable (offline): saved with the name only
  }
}

export interface ApplyResult {
  stopped: string[];
  added: string[];
  followUp?: IsoDate;
}

/** Applies the confirmed plan and records the visit with its transcript (the recording is never stored). */
export async function applyPlan(
  plan: PostVisitPlan,
  transcript: string,
  today: IsoDate,
  markDiscussed: boolean,
): Promise<ApplyResult> {
  const applied: AppliedChange[] = [];
  const result: ApplyResult = { stopped: [], added: [] };

  for (const add of plan.adds.filter((a) => a.selected)) {
    const drug = await lookupDrug(add.name);
    const med = await db.medications.add({
      name: add.name,
      dose: add.dose || (drug?.strength ?? ''),
      unit: add.unit,
      schedule: add.schedule,
      category: add.category,
      startDate: today,
      source: 'visit',
      ...(drug && {
        rplId: drug.rplId,
        activeSubstance: drug.activeSubstance,
        atcCode: drug.atcCode,
      }),
    });
    applied.push({ type: 'newMedication', medicationId: med.id });
    result.added.push(med.name);
  }

  for (const stop of plan.stops.filter((s) => s.selected && s.medicationId)) {
    const med = stop.candidates.find((m) => m.id === stop.medicationId);
    if (!med) continue;
    await stopMedication(med, stop.reason, today);
    applied.push({ type: 'stopMedication', medicationId: med.id, reason: stop.reason });
    result.stopped.push(med.name);
  }

  // This visit is the follow-up the earlier reminders were about.
  for (const r of await db.reminders.list()) {
    if (r.type === 'followUp' && !r.doneAt) await markDone(r.id);
  }

  const visit: Omit<Visit, 'id'> = { date: today, transcript, appliedChanges: applied };
  if (plan.followUp?.selected) visit.followUpDate = plan.followUp.date;
  const saved = await db.visits.add(visit);

  if (plan.followUp?.selected) {
    const reminder = await createReminder({
      type: 'followUp',
      at: followUpReminderAt(plan.followUp.date),
      visitId: saved.id,
    });
    applied.push({ type: 'followUp', reminderId: reminder.id });
    await db.visits.update(saved.id, { appliedChanges: applied });
    result.followUp = plan.followUp.date;
  }

  if (markDiscussed) {
    const open = (await db.visitNoteItems.list()).filter((i) => !i.discussed);
    for (const item of open) {
      await db.visitNoteItems.update(item.id, { discussed: true, visitId: saved.id });
    }
  }
  return result;
}
