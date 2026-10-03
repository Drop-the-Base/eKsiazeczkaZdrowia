import type { Exam, ExamResult, IsoDate, NewEntity } from '@ez/shared';

export type Flag = 'low' | 'high';

/** Poza zakresem referencyjnym z wyniku – fakt, bez interpretacji. */
export function flagOf(r: ExamResult): Flag | undefined {
  if (r.refLow !== undefined && r.value < r.refLow) return 'low';
  if (r.refHigh !== undefined && r.value > r.refHigh) return 'high';
  return undefined;
}

export const FLAG_ARROW: Record<Flag, string> = { low: '↓', high: '↑' };

export function outOfRange(exam: Exam): ExamResult[] {
  return exam.results.filter((r) => flagOf(r) !== undefined);
}

export function newestFirst(exams: Exam[]): Exam[] {
  return [...exams].sort((a, b) => b.date.localeCompare(a.date));
}

export interface ResultRow {
  name: string;
  value: string;
  unit: string;
  refLow: string;
  refHigh: string;
}

export interface ExamForm {
  name: string;
  date: IsoDate;
  rows: ResultRow[];
}

export const emptyRow = (): ResultRow => ({
  name: '',
  value: '',
  unit: '',
  refLow: '',
  refHigh: '',
});

/** Gotowe zestawy – zakresy jak na typowym wydruku (pacjent i tak przepisuje swoje). */
export const PRESETS: Record<string, ResultRow[]> = {
  'Morfologia krwi': [
    { name: 'Hemoglobina (HGB)', value: '', unit: 'g/dl', refLow: '12', refHigh: '16' },
    { name: 'Płytki krwi (PLT)', value: '', unit: 'tys/µl', refLow: '150', refHigh: '400' },
    { name: 'Leukocyty (WBC)', value: '', unit: 'tys/µl', refLow: '4', refHigh: '10' },
  ],
  Glukoza: [{ name: 'Glukoza na czczo', value: '', unit: 'mg/dl', refLow: '70', refHigh: '99' }],
  CRP: [{ name: 'CRP', value: '', unit: 'mg/l', refLow: '', refHigh: '5' }],
  TSH: [{ name: 'TSH', value: '', unit: 'µIU/ml', refLow: '0.27', refHigh: '4.2' }],
};

/** „12,5” albo „12.5” → 12.5; puste / niepoprawne → `undefined`. */
export function parseNumber(text: string): number | undefined {
  const t = text.trim().replace(',', '.');
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export type ExamErrors = { name?: string; date?: string; rows?: string; rowErrors: string[] };

export function validateExam(form: ExamForm, today: IsoDate): ExamErrors {
  const errors: ExamErrors = { rowErrors: [] };
  if (!form.name.trim()) errors.name = 'Podaj nazwę badania';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errors.date = 'Podaj datę badania';
  else if (form.date > today) errors.date = 'Data nie może być w przyszłości';
  // Wiersz bez wartości (np. z gotowego zestawu) jest pomijany – pacjent wpisuje tylko to, co ma.
  if (!form.rows.some((r) => r.value.trim())) errors.rows = 'Wpisz przynajmniej jeden wynik';
  form.rows.forEach((r, i) => {
    if (!r.value.trim()) return;
    if (!r.name.trim()) errors.rowErrors[i] = 'Podaj nazwę parametru';
    else if (parseNumber(r.value) === undefined) errors.rowErrors[i] = 'Wartość musi być liczbą';
    else if (
      (r.refLow.trim() && parseNumber(r.refLow) === undefined) ||
      (r.refHigh.trim() && parseNumber(r.refHigh) === undefined)
    ) {
      errors.rowErrors[i] = 'Zakres musi być liczbą';
    }
  });
  return errors;
}

export const hasErrors = (e: ExamErrors) =>
  Boolean(e.name || e.date || e.rows || e.rowErrors.some(Boolean));

export function toExam(form: ExamForm): NewEntity<Exam> {
  return {
    name: form.name.trim(),
    date: form.date,
    results: form.rows
      .filter((r) => r.name.trim() && parseNumber(r.value) !== undefined)
      .map((r) => ({
        name: r.name.trim(),
        value: parseNumber(r.value)!,
        unit: r.unit.trim(),
        refLow: parseNumber(r.refLow),
        refHigh: parseNumber(r.refHigh),
      })),
  };
}
