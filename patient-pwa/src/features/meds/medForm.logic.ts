import type { IsoDate, Medication, MedicationCategory, NewEntity } from '@ez/shared';
import type { DrugEntry } from '../drugs';

export interface MedForm {
  name: string;
  rplId?: string;
  activeSubstance?: string;
  atcCode?: string;
  category: MedicationCategory;
  dose: string;
  unit: string;
  scheduleType: 'daily' | 'asNeeded';
  times: string[];
  startDate: IsoDate;
  endDate: IsoDate;
}

export type MedFormErrors = Partial<
  Record<'name' | 'dose' | 'times' | 'startDate' | 'endDate', string>
>;

export const PRESET_TIMES = ['08:00', '12:00', '20:00'];

const SIMPLE_STRENGTH = /^(\d+(?:[.,]\d+)?)\s*(mg|g|µg|mcg|ml|j\.m\.|IU)$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** „200 mg” → dawka 200 mg; złożone moce („200 mg + 30 mg”) → 1 tabletka itp. do poprawienia. */
export function doseFromStrength(strength: string): { dose: string; unit: string } {
  const m = SIMPLE_STRENGTH.exec(strength.trim());
  return m ? { dose: m[1]!.replace(',', '.'), unit: m[2]! } : { dose: '1', unit: 'tabl.' };
}

export function emptyMedForm(today: IsoDate): MedForm {
  return {
    name: '',
    category: 'prescription',
    dose: '',
    unit: '',
    scheduleType: 'daily',
    times: ['08:00'],
    startDate: today,
    endDate: '',
  };
}

/** Po wyborze z `<DrugPicker>`: lek z RPL albo wolny tekst (suplement, zioła). */
export function applyPick(form: MedForm, pick: { drug?: DrugEntry; name: string }): MedForm {
  if (!pick.drug) {
    return {
      ...form,
      name: pick.name,
      rplId: undefined,
      activeSubstance: undefined,
      atcCode: undefined,
      category: 'supplement',
      dose: form.dose || '1',
      unit: form.unit || 'kaps.',
    };
  }
  const { drug } = pick;
  return {
    ...form,
    name: drug.name,
    rplId: drug.rplId,
    activeSubstance: drug.activeSubstance,
    atcCode: drug.atcCode,
    category: drug.otc ? 'otc' : 'prescription',
    ...doseFromStrength(drug.strength),
  };
}

export function medFormFrom(m: Medication): MedForm {
  return {
    name: m.name,
    rplId: m.rplId,
    activeSubstance: m.activeSubstance,
    atcCode: m.atcCode,
    category: m.category,
    dose: m.dose,
    unit: m.unit,
    scheduleType: m.schedule.type,
    times: m.schedule.type === 'daily' ? m.schedule.times : ['08:00'],
    startDate: m.startDate,
    endDate: m.endDate ?? '',
  };
}

export function toggleTime(times: string[], time: string): string[] {
  return times.includes(time) ? times.filter((t) => t !== time) : [...times, time].sort();
}

export function validateMedForm(form: MedForm): MedFormErrors {
  const errors: MedFormErrors = {};
  if (!form.name.trim()) errors.name = 'Wybierz lek albo wpisz nazwę';
  if (!form.dose.trim()) errors.dose = 'Podaj dawkę';
  if (form.scheduleType === 'daily') {
    if (form.times.length === 0) errors.times = 'Wybierz przynajmniej jedną godzinę';
    else if (!form.times.every((t) => TIME.test(t))) errors.times = 'Niepoprawna godzina';
  }
  if (!DATE.test(form.startDate)) errors.startDate = 'Podaj datę rozpoczęcia';
  if (form.endDate) {
    if (!DATE.test(form.endDate)) errors.endDate = 'Niepoprawna data';
    else if (form.endDate < form.startDate) errors.endDate = 'Koniec nie może być przed początkiem';
  }
  return errors;
}

/** Pola rekordu z formularza (bez `id`, `source`, `stopReason`). */
export function toMedicationFields(
  form: MedForm,
): Omit<NewEntity<Medication>, 'source' | 'stopReason'> {
  return {
    name: form.name.trim(),
    rplId: form.rplId,
    activeSubstance: form.activeSubstance,
    atcCode: form.atcCode,
    category: form.category,
    dose: form.dose.trim(),
    unit: form.unit.trim(),
    schedule:
      form.scheduleType === 'daily'
        ? { type: 'daily', times: [...form.times].sort() }
        : { type: 'asNeeded' },
    startDate: form.startDate,
    endDate: form.endDate || undefined,
  };
}
