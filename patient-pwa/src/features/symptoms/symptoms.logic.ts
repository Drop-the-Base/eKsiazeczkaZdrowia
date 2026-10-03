import type { IsoDateTime, Severity, Symptom } from '@ez/shared';

/** Najczęstsze objawy – podpowiedzi przy szybkim dodawaniu (nazwy jak w danych demo). */
export const COMMON_SYMPTOMS = [
  'ból głowy',
  'zawroty głowy',
  'zmęczenie',
  'nudności',
  'wysypka',
  'gorączka',
  'ból brzucha',
  'kaszel',
  'duszność',
  'kołatanie serca',
  'omdlenie',
  'bezsenność',
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  1: 'bardzo słabe',
  2: 'słabe',
  3: 'średnie',
  4: 'silne',
  5: 'bardzo silne',
};

export type WhenChoice = 'now' | 'morning' | 'yesterday' | 'custom';

/** Czas początku objawu z szybkiego wyboru (czas lokalny). `custom` = wartość z `datetime-local`. */
export function startedAtFor(choice: WhenChoice, now: Date, custom = ''): IsoDateTime | null {
  const at = (dayOffset: number, h: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, 0).toISOString();
  switch (choice) {
    case 'now':
      return now.toISOString();
    case 'morning':
      return at(0, 7);
    case 'yesterday':
      return at(-1, 12);
    case 'custom': {
      const t = new Date(custom);
      return custom && !Number.isNaN(t.getTime()) ? t.toISOString() : null;
    }
  }
}

export interface SymptomForm {
  name: string;
  severity?: Severity;
  when: WhenChoice;
  custom: string;
  notes: string;
}

export type SymptomErrors = Partial<Record<'name' | 'when', string>>;

export function validateSymptom(form: SymptomForm, now: Date): SymptomErrors {
  const errors: SymptomErrors = {};
  if (!form.name.trim()) errors.name = 'Wybierz albo wpisz objaw';
  const at = startedAtFor(form.when, now, form.custom);
  if (!at) errors.when = 'Podaj, kiedy się zaczęło';
  else if (at > now.toISOString()) errors.when = 'Czas nie może być w przyszłości';
  return errors;
}

/** Ostatnie objawy, od najnowszego. */
export function recentFirst(list: Symptom[]): Symptom[] {
  return [...list].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
