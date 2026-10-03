import type { DateRange, ExamResult, IsoDate, TimelineData } from '@ez/shared';

const DAY_MS = 24 * 3600 * 1000;

export type RangePreset = 'treatment' | '30' | '90' | 'all';

export const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'treatment', label: 'Leczenie' },
  { id: '30', label: '30 dni' },
  { id: '90', label: '90 dni' },
  { id: 'all', label: 'Całość' },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day of an ISO date or timestamp. */
export function localDay(iso: string): IsoDate {
  if (iso.length === 10) return iso;
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftDays(day: IsoDate, days: number): IsoDate {
  return new Date(Date.parse(day) + days * DAY_MS).toISOString().slice(0, 10);
}

export function rangeFlag(r: ExamResult): '↑' | '↓' | '' {
  if (r.refHigh !== undefined && r.value > r.refHigh) return '↑';
  if (r.refLow !== undefined && r.value < r.refLow) return '↓';
  return '';
}

/**
 * "Leczenie": back to the earliest start of medications taken now or stopped in the last 90 days,
 * at least 90 and at most 365 days.
 */
export function rangeFor(preset: RangePreset, data: TimelineData, today: IsoDate): DateRange {
  if (preset === '30' || preset === '90')
    return { from: shiftDays(today, -Number(preset)), to: today };
  const days = [
    ...data.medications.map((m) => m.startDate),
    ...data.exams.map((e) => e.date),
    ...data.symptoms.map((s) => localDay(s.startedAt)),
    ...data.visits.map((v) => v.date),
  ];
  if (preset === 'all')
    return { from: days.reduce((min, d) => (d < min ? d : min), today), to: today };
  const recentFrom = shiftDays(today, -90);
  const recent = data.medications.filter((m) => m.endDate === undefined || m.endDate >= recentFrom);
  const earliest = recent.reduce((min, m) => (m.startDate < min ? m.startDate : min), recentFrom);
  const capped = shiftDays(today, -365);
  return { from: earliest < capped ? capped : earliest, to: today };
}
