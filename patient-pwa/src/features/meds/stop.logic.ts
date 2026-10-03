import type { IsoDate, Medication, NewEntity } from '@ez/shared';
import { toMedicationFields, type MedForm } from './medForm.logic';

export const STOP_REASONS = [
  'mdłości',
  'nie pomagało',
  'skutki uboczne',
  'zalecenie lekarza',
  'zakończone leczenie',
];

/** Dzień wcześniej (`RRRR-MM-DD`), liczony w UTC, żeby zmiana czasu nie przesuwała daty. */
export function dayBefore(date: IsoDate): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function validateReason(reason: string): string | undefined {
  return reason.trim() ? undefined : 'Podaj powód odstawienia';
}

export function stopPatch(
  reason: string,
  date: IsoDate,
): Pick<Medication, 'endDate' | 'stopReason'> {
  return { endDate: date, stopReason: reason.trim() };
}

/**
 * Zmiana dawki / schematu = zakończenie starego rekordu dzień przed zmianą
 * i nowy rekord od dnia zmiany (model z `shared/types.ts`), żeby oś czasu pokazała obie dawki.
 */
export function changePlan(
  old: Medication,
  form: MedForm,
  reason: string,
  date: IsoDate,
): { oldPatch: Pick<Medication, 'endDate' | 'stopReason'>; next: NewEntity<Medication> } {
  return {
    oldPatch: { endDate: dayBefore(date), stopReason: `zmiana: ${reason.trim()}` },
    next: {
      ...toMedicationFields({ ...form, startDate: date, endDate: '' }),
      source: old.source === 'visit' ? 'visit' : 'manual',
    },
  };
}
