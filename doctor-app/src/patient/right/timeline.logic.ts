import {
  isOutOfRange,
  type DateRange,
  type ExamResult,
  type IsoDate,
  type Medication,
  type TimelineData,
  type TimelineRef,
} from '@ez/shared';
import { describeDose } from '../patient.logic';
import { formatNumber } from '../../format';

const DAY_MS = 24 * 3600 * 1000;

export type RangePreset = 'treatment' | '30' | '90' | 'all';

export const RANGE_PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'treatment', label: 'Leczenie' },
  { id: '30', label: '30 dni' },
  { id: '90', label: '90 dni' },
  { id: 'all', label: 'Całość' },
];

export interface TimelineEvent {
  ref: TimelineRef;
  /** ISO date or timestamp, for sorting. */
  at: string;
  day: IsoDate;
  kind: 'medStart' | 'medStop' | 'exam' | 'symptom' | 'visit' | 'photo' | 'document';
  title: string;
  detail?: string;
  /** Exam with a result outside the reference range. */
  outOfRange?: boolean;
  thumbnailUrl?: string;
}

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

const inRange = (day: IsoDate, range: DateRange) => day >= range.from && day <= range.to;

/** Medications taken at any point of the range – drawn as bars above the events. */
export function medsInRange(meds: Medication[], range: DateRange): Medication[] {
  return meds
    .filter((m) => m.startDate <= range.to && (m.endDate === undefined || m.endDate >= range.from))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function buildEvents(data: TimelineData, range: DateRange): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const m of data.medications) {
    const ref: TimelineRef = { entity: 'medication', id: m.id };
    if (inRange(m.startDate, range)) {
      events.push({
        ref,
        at: m.startDate,
        day: m.startDate,
        kind: 'medStart',
        title: `Początek: ${m.name} ${describeDose(m)}`,
      });
    }
    if (m.endDate && inRange(m.endDate, range)) {
      events.push({
        ref,
        at: m.endDate,
        day: m.endDate,
        kind: 'medStop',
        title: `Odstawiony: ${m.name}`,
        detail: m.stopReason,
      });
    }
  }
  for (const e of data.exams.filter((x) => inRange(x.date, range))) {
    events.push({
      ref: { entity: 'exam', id: e.id },
      at: e.date,
      day: e.date,
      kind: 'exam',
      title: e.name,
      detail: e.results.map((r) => `${r.name} ${formatNumber(r.value)}${rangeFlag(r)}`).join(' · '),
      outOfRange: e.results.some(isOutOfRange),
    });
  }
  for (const s of data.symptoms) {
    const day = localDay(s.startedAt);
    if (!inRange(day, range)) continue;
    events.push({
      ref: { entity: 'symptom', id: s.id },
      at: s.startedAt,
      day,
      kind: 'symptom',
      title: s.name,
      detail: s.severity ? `nasilenie ${s.severity}/5` : undefined,
    });
  }
  for (const v of data.visits.filter((x) => inRange(x.date, range))) {
    const who = [v.specialty, v.doctor].filter(Boolean).join(', ');
    events.push({
      ref: { entity: 'visit', id: v.id },
      at: v.date,
      day: v.date,
      kind: 'visit',
      title: `Wizyta${who ? `: ${who}` : ''}`,
    });
  }
  for (const p of data.photos) {
    const day = localDay(p.takenAt);
    if (!inRange(day, range)) continue;
    events.push({
      ref: { entity: 'photo', id: p.id },
      at: p.takenAt,
      day,
      kind: 'photo',
      title: 'Zdjęcie',
      thumbnailUrl: p.thumbnailUrl,
    });
  }
  for (const d of data.documents.filter((x) => inRange(x.date, range))) {
    events.push({
      ref: { entity: 'document', id: d.id },
      at: d.date,
      day: d.date,
      kind: 'document',
      title: d.title,
    });
  }
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

export function groupByDay(events: TimelineEvent[]): { day: IsoDate; events: TimelineEvent[] }[] {
  const groups: { day: IsoDate; events: TimelineEvent[] }[] = [];
  for (const e of events) {
    const last = groups.at(-1);
    if (last?.day === e.day) last.events.push(e);
    else groups.push({ day: e.day, events: [e] });
  }
  return groups;
}

export const sameRef = (a: TimelineRef | undefined, b: TimelineRef): boolean =>
  a !== undefined && a.entity === b.entity && a.id === b.id;
