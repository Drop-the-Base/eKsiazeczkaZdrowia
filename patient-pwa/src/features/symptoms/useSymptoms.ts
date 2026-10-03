import type { Symptom } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { startedAtFor, type SymptomForm } from './symptoms.logic';

export function useSymptoms() {
  return useLive(() => db.symptoms.list());
}

export async function addSymptom(form: SymptomForm, now: Date): Promise<Symptom> {
  const startedAt = startedAtFor(form.when, now, form.custom);
  if (!startedAt) throw new Error('Brak czasu objawu');
  return db.symptoms.add({
    name: form.name.trim(),
    severity: form.severity,
    startedAt,
    notes: form.notes.trim() || undefined,
    source: 'manual',
  });
}

export function removeSymptom(id: string): Promise<void> {
  return db.symptoms.remove(id);
}
