import type { Diagnosis, IsoDate } from '@ez/shared';

export interface DiagnosisForm {
  name: string;
  icd10: string;
  diagnosedAt: IsoDate;
  active: boolean;
}

export type DiagnosisErrors = Partial<Record<'name' | 'icd10' | 'diagnosedAt', string>>;

const ICD10 = /^[A-Z]\d{2}(\.\d{1,2})?$/;

/** Aktualne i przebyte, w każdej grupie od najnowszej. */
export function splitDiagnoses(list: Diagnosis[]): { active: Diagnosis[]; past: Diagnosis[] } {
  const byDateDesc = (a: Diagnosis, b: Diagnosis) => b.diagnosedAt.localeCompare(a.diagnosedAt);
  return {
    active: list.filter((d) => d.active).sort(byDateDesc),
    past: list.filter((d) => !d.active).sort(byDateDesc),
  };
}

export function normalizeIcd10(text: string): string {
  return text.trim().toUpperCase().replace(',', '.');
}

export function validateDiagnosis(form: DiagnosisForm, today: IsoDate): DiagnosisErrors {
  const errors: DiagnosisErrors = {};
  if (!form.name.trim()) errors.name = 'Podaj nazwę choroby';
  const icd = normalizeIcd10(form.icd10);
  if (icd && !ICD10.test(icd)) errors.icd10 = 'Kod ICD-10 ma postać np. C92 albo C92.1';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.diagnosedAt)) errors.diagnosedAt = 'Podaj datę rozpoznania';
  else if (form.diagnosedAt > today) errors.diagnosedAt = 'Data nie może być w przyszłości';
  return errors;
}
