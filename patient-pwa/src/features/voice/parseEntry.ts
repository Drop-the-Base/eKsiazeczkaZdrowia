import type { ParseEntry, ParsedEntry, ParsedIntake, ParsedSymptom } from '@ez/shared';
import { db } from '../../db';
import { todayIso } from '../../ui/format';
import { searchDrugs } from '../drugs';
import { acceptsMatch, findMedication, newAsNeededMedication } from './applyEntry.logic';
import { parseEntryWith } from './parseEntry.logic';

/** Kontrakt `ParseEntry`: lokalnie, z bazą leków RPL. */
export const parseEntry: ParseEntry = (text, now) =>
  parseEntryWith(text, now, async (phrase) => {
    const [first] = await searchDrugs(phrase, 1);
    return first && acceptsMatch(phrase, first) ? first : undefined;
  });

export type Proposal =
  | { kind: 'symptom'; item: ParsedSymptom }
  | { kind: 'intake'; item: ParsedIntake; existing?: string };

/** Propozycje do zatwierdzenia; przy przyjęciu – nazwa leku z listy, jeśli już jest. */
export async function toProposals(entry: ParsedEntry): Promise<Proposal[]> {
  const meds = await db.medications.list();
  const today = todayIso();
  return [
    ...entry.symptoms.map((item) => ({ kind: 'symptom' as const, item })),
    ...entry.medications.map((item) => ({
      kind: 'intake' as const,
      item,
      existing: findMedication(meds, item, today)?.name,
    })),
  ];
}

/** Zapis zatwierdzonych propozycji: objawy, przyjęcia (nowy lek doraźny, gdy go nie ma na liście). */
export async function saveProposals(proposals: Proposal[]): Promise<void> {
  const confirmedAt = new Date().toISOString();
  for (const p of proposals) {
    if (p.kind === 'symptom') {
      await db.symptoms.add({ ...p.item, source: 'voice' });
      continue;
    }
    const day = todayIso(new Date(p.item.takenAt));
    const meds = await db.medications.list();
    const medication =
      findMedication(meds, p.item, day) ??
      (await db.medications.add(newAsNeededMedication(p.item, day)));
    await db.intakes.add({
      medicationId: medication.id,
      scheduledAt: p.item.takenAt,
      status: 'taken',
      confirmedAt,
    });
  }
}
