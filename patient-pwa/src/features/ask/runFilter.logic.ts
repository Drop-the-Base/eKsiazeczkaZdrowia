import type {
  Exam,
  Medication,
  QueryFilter,
  QueryResultItem,
  RunFilter,
  Symptom,
} from '@ez/shared';
import { normalize } from '../drugs/drugs.logic';

// Filtr z „Zapytaj” wykonywany na telefonie – model językowy nigdy nie widzi tych danych.

const contains = (text: string | undefined, query: string) =>
  text !== undefined && normalize(text).includes(normalize(query));

/** Zakres dat włącznie; `to` porównujemy prefiksem (dzień obejmuje całe ISO z godziną). */
const inRange = (date: string, from?: string, to?: string) =>
  (from === undefined || date >= from) && (to === undefined || date <= `${to}￿`);

function medications(meds: Medication[], f: QueryFilter): Medication[] {
  const found = meds.filter(
    (m) =>
      (f.atcPrefix === undefined || (m.atcCode ?? '').toUpperCase().startsWith(f.atcPrefix)) &&
      (f.name === undefined || contains(m.name, f.name) || contains(m.activeSubstance, f.name)) &&
      // Lek przyjmowany w okresie: zaczął się przed końcem i nie skończył przed początkiem.
      (f.to === undefined || m.startDate <= f.to) &&
      (f.from === undefined || m.endDate === undefined || m.endDate >= f.from),
  );
  // „Kiedy ostatnio” (desc): najpierw trwające, potem po dacie odstawienia; inaczej po starcie.
  return f.sort === 'desc'
    ? found.sort((a, b) => (b.endDate ?? '￿').localeCompare(a.endDate ?? '￿'))
    : found.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function symptoms(list: Symptom[], f: QueryFilter): Symptom[] {
  const found = list.filter(
    (s) => (f.name === undefined || contains(s.name, f.name)) && inRange(s.startedAt, f.from, f.to),
  );
  const dir = f.sort === 'desc' ? -1 : 1;
  return found.sort((a, b) => dir * a.startedAt.localeCompare(b.startedAt));
}

function exams(list: Exam[], f: QueryFilter): Exam[] {
  const found = list.filter(
    (e) => (f.name === undefined || contains(e.name, f.name)) && inRange(e.date, f.from, f.to),
  );
  const dir = f.sort === 'desc' ? -1 : 1;
  return found.sort((a, b) => dir * a.date.localeCompare(b.date));
}

export const runFilter: RunFilter = (filter, data) => {
  const limit = (items: QueryResultItem[]) =>
    filter.limit !== undefined ? items.slice(0, filter.limit) : items;
  switch (filter.entity) {
    case 'medication':
      return limit(
        medications(data.medications, filter).map((item) => ({ entity: 'medication', item })),
      );
    case 'symptom':
      return limit(symptoms(data.symptoms, filter).map((item) => ({ entity: 'symptom', item })));
    case 'exam':
      return limit(exams(data.exams, filter).map((item) => ({ entity: 'exam', item })));
  }
};
