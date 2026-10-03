import type { IsoDate } from '@ez/shared';

export const BLOOD_TYPES = [
  '0 Rh+',
  '0 Rh-',
  'A Rh+',
  'A Rh-',
  'B Rh+',
  'B Rh-',
  'AB Rh+',
  'AB Rh-',
];

export interface ProfileForm {
  name: string;
  birthDate: IsoDate;
  bloodType: string;
  allergies: string[];
}

export type ProfileErrors = Partial<Record<'name' | 'birthDate', string>>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Pełne lata w dniu `today` (obie daty `RRRR-MM-DD`). */
export function ageOn(birthDate: IsoDate, today: IsoDate): number {
  const [by = 0, bm = 0, bd = 0] = birthDate.split('-').map(Number);
  const [ty = 0, tm = 0, td = 0] = today.split('-').map(Number);
  const hadBirthday = tm > bm || (tm === bm && td >= bd);
  return ty - by - (hadBirthday ? 0 : 1);
}

export function validateProfile(form: ProfileForm, today: IsoDate): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!form.name.trim()) errors.name = 'Podaj imię';
  if (!ISO_DATE.test(form.birthDate) || Number.isNaN(Date.parse(form.birthDate))) {
    errors.birthDate = 'Podaj datę urodzenia';
  } else if (form.birthDate > today) {
    errors.birthDate = 'Data urodzenia nie może być w przyszłości';
  }
  return errors;
}

/** Dodaje alergię bez pustych wpisów i duplikatów (bez względu na wielkość liter). */
export function addAllergy(allergies: string[], text: string): string[] {
  const value = text.trim();
  if (!value) return allergies;
  const exists = allergies.some((a) => a.toLocaleLowerCase('pl') === value.toLocaleLowerCase('pl'));
  return exists ? allergies : [...allergies, value];
}
