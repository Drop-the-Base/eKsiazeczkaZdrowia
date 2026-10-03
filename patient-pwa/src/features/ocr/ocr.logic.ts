import type { IsoDate } from '@ez/shared';
import type { ExamForm, ResultRow } from '../exams/exams.logic';
import { examName, findDate, findResults } from '../ikp-import/ikp.logic';

/** Typowe pomyłki OCR w wynikach: „8.9” / „8,9”, „O” zamiast 0 w liczbach, różne myślniki w normie. */
export function cleanOcrText(text: string): string {
  return text
    .replace(/(\d)[oO](?=\d|\b)/g, '$10')
    .replace(/[—–]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

const str = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','));

/** Tekst z OCR → formularz badania (do sprawdzenia przez pacjenta przed zapisem). */
export function ocrToExamForm(text: string, today: IsoDate): ExamForm | null {
  const clean = cleanOcrText(text);
  const results = findResults(clean);
  if (results.length === 0) return null;
  const rows: ResultRow[] = results.map((r) => ({
    name: r.name,
    value: str(r.value),
    unit: r.unit,
    refLow: str(r.refLow),
    refHigh: str(r.refHigh),
  }));
  const date = findDate(clean);
  return {
    name: examName(clean, 'Wynik badania'),
    date: date && date <= today ? date : today,
    rows,
  };
}
