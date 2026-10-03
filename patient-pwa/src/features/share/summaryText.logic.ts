import {
  isOutOfRange,
  type Exam,
  type ExamResult,
  type SymptomSummary,
  type VisitSummary,
} from '@ez/shared';
import { formatDate } from '../../ui';

const DAY_MS = 24 * 3600 * 1000;
const num = (v: number) => v.toLocaleString('pl-PL');

function refRange(r: ExamResult): string {
  if (r.refLow !== undefined && r.refHigh !== undefined)
    return ` (${num(r.refLow)}–${num(r.refHigh)})`;
  if (r.refLow !== undefined) return ` (min. ${num(r.refLow)})`;
  if (r.refHigh !== undefined) return ` (maks. ${num(r.refHigh)})`;
  return '';
}

/** "zawroty głowy ×5, najsilniej 4/5, od 07.09.2026 · 4 dni po rozpoczęciu: Dazatynib" */
export function symptomLine(s: SymptomSummary): string {
  const parts = [`${s.name} ×${s.count}`];
  if (s.maxSeverity) parts.push(`najsilniej ${s.maxSeverity}/5`);
  parts.push(`od ${formatDate(s.firstAt)}`);
  let line = parts.join(', ');
  if (s.afterNewMed) {
    const days = Math.round((Date.parse(s.firstAt) - Date.parse(s.afterNewMed.startDate)) / DAY_MS);
    line += ` · ${days} ${days === 1 ? 'dzień' : 'dni'} po rozpoczęciu: ${s.afterNewMed.medicationName}`;
  }
  return line;
}

/** Out-of-range results as facts with the reference range, e.g. "HGB 8,9 g/dl (12–16)". */
export function outOfRangeLine(exam: Exam): string | undefined {
  const out = exam.results.filter(isOutOfRange);
  if (out.length === 0) return undefined;
  return `poza zakresem: ${out.map((r) => `${r.name} ${num(r.value)} ${r.unit}${refRange(r)}`).join('; ')}`;
}

export function adherenceLine(a: VisitSummary['adherence']): string {
  const total = a.taken + a.skipped;
  if (total === 0) return 'Brak potwierdzeń przyjęcia w tym okresie';
  return (
    `Potwierdzone ${a.taken} z ${total} dawek` + (a.skipped > 0 ? ` (pominięte: ${a.skipped})` : '')
  );
}
