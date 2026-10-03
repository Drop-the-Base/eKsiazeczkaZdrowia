import type { Diagnosis } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { normalizeIcd10, type DiagnosisForm } from './diagnoses.logic';

export function useDiagnoses() {
  return useLive(() => db.diagnoses.list());
}

const toRecord = (form: DiagnosisForm) => ({
  name: form.name.trim(),
  icd10: normalizeIcd10(form.icd10) || undefined,
  diagnosedAt: form.diagnosedAt,
  active: form.active,
});

export async function saveDiagnosis(form: DiagnosisForm, existing?: Diagnosis): Promise<void> {
  if (existing) await db.diagnoses.update(existing.id, toRecord(form));
  else await db.diagnoses.add({ ...toRecord(form), source: 'manual' });
}

export function removeDiagnosis(id: string): Promise<void> {
  return db.diagnoses.remove(id);
}
