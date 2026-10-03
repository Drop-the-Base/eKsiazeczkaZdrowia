import type { IsoDate, Medication, MedicationSource } from '@ez/shared';
import { db } from '../../db';
import { toMedicationFields, type MedForm } from './medForm.logic';
import { changePlan, stopPatch } from './stop.logic';

export async function saveMedication(
  form: MedForm,
  existing: Medication | undefined,
  source: MedicationSource = 'manual',
): Promise<Medication> {
  const fields = toMedicationFields(form);
  if (existing) {
    await db.medications.update(existing.id, fields);
    return { ...existing, ...fields };
  }
  return db.medications.add({ ...fields, source });
}

export function stopMedication(m: Medication, reason: string, date: IsoDate): Promise<void> {
  return db.medications.update(m.id, stopPatch(reason, date));
}

export async function changeMedication(
  m: Medication,
  form: MedForm,
  reason: string,
  date: IsoDate,
): Promise<Medication> {
  const { oldPatch, next } = changePlan(m, form, reason, date);
  // Najpierw nowy rekord: gdyby drugi zapis się nie udał, lek nie zniknie z listy.
  const added = await db.medications.add(next);
  await db.medications.update(m.id, oldPatch);
  return added;
}
