import type { IsoDate, QueryFilter, QueryResultItem } from '@ez/shared';
import { formatDate, formatDateTime } from '../../ui/format';
import { describeDose } from '../meds/meds.logic';

function monthsBefore(today: IsoDate, months: number): IsoDate {
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 - months, d));
  return t.toISOString().slice(0, 10);
}

/** Szybkie pytania z happy path – z gotowym filtrem, więc działają też bez sieci. */
export function quickQuestions(today: IsoDate): { question: string; filter: QueryFilter }[] {
  return [
    {
      question: 'Jakie leki brałam w ostatnich 2 miesiącach?',
      filter: { entity: 'medication', from: monthsBefore(today, 2), sort: 'asc' },
    },
    {
      question: 'Kiedy ostatnio brałam leki przeciwzakrzepowe?',
      filter: { entity: 'medication', atcPrefix: 'B01', sort: 'desc', limit: 1 },
    },
    {
      question: 'Od kiedy mam te bóle głowy?',
      filter: { entity: 'symptom', name: 'ból głowy', sort: 'asc' },
    },
  ];
}

/** Czego szukaliśmy – po ludzku, żeby było widać, jak zrozumiano pytanie. */
export function describeFilter(f: QueryFilter): string {
  const what = { medication: 'leki', symptom: 'objawy', exam: 'badania' }[f.entity];
  return [
    what,
    f.name && `„${f.name}”`,
    f.atcPrefix && `grupa ATC ${f.atcPrefix}`,
    f.from && `od ${formatDate(f.from)}`,
    f.to && `do ${formatDate(f.to)}`,
    f.sort === 'desc' && f.limit === 1 ? 'ostatni raz' : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Jednozdaniowa odpowiedź nad listą (bez wniosków, tylko daty). */
export function headline(f: QueryFilter, results: QueryResultItem[]): string {
  const first = results[0];
  if (!first) return 'Nic nie znalazłem w Twoich zapisach.';
  if (first.entity === 'medication' && f.sort === 'desc' && f.limit === 1) {
    const m = first.item;
    return m.endDate
      ? `Ostatnio: ${m.name}, do ${formatDate(m.endDate)}.`
      : `${m.name} – przyjmujesz nadal (od ${formatDate(m.startDate)}).`;
  }
  if (first.entity === 'symptom' && f.sort !== 'desc') {
    return `Pierwszy wpis: ${formatDateTime(first.item.startedAt)} · razem ${results.length}.`;
  }
  return `Znalezione: ${results.length}.`;
}

export function resultLine(r: QueryResultItem): { title: string; detail: string } {
  switch (r.entity) {
    case 'medication':
      return {
        title: `${r.item.name} ${describeDose(r.item)}`.trim(),
        detail: [
          `${formatDate(r.item.startDate)} – ${r.item.endDate ? formatDate(r.item.endDate) : 'nadal'}`,
          r.item.stopReason,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    case 'symptom':
      return {
        title: r.item.name,
        detail: [
          formatDateTime(r.item.startedAt),
          r.item.severity && `nasilenie ${r.item.severity}/5`,
        ]
          .filter(Boolean)
          .join(' · '),
      };
    case 'exam':
      return { title: r.item.name, detail: formatDate(r.item.date) };
  }
}
