import type { Medication, MedicationSource } from '@ez/shared';
import { db } from '../../db';
import { toMedicationFields, type MedForm } from './medForm.logic';

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
