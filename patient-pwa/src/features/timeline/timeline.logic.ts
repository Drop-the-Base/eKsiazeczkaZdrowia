import type { DateRange, Intake, IsoDate, Medication, MedicationCategory } from '@ez/shared';
import { CATEGORY_ORDER, describeDose } from '../meds/meds.logic';

// Czysta logika osi czasu – bez Reacta i bazy, bo komponent używa też aplikacja lekarza.

const DAY_MS = 24 * 60 * 60 * 1000;

/** `RRRR-MM-DD` → lokalna północ; pełny ISO → ten moment. */
export function toTime(iso: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y = 0, m = 1, d = 1] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  return new Date(iso).getTime();
}

export interface Bounds {
  start: number;
  /** Koniec ostatniego dnia zakresu (zakres jest włącznie). */
  end: number;
}

export function boundsOf(range: DateRange): Bounds {
  return { start: toTime(range.from), end: toTime(range.to) + DAY_MS };
}

/** Pozycja w % szerokości toru, przycięta do zakresu. */
export function pct(t: number, b: Bounds): number {
  return Math.min(100, Math.max(0, ((t - b.start) / (b.end - b.start)) * 100));
}

export function inBounds(t: number, b: Bounds): boolean {
  return t >= b.start && t < b.end;
}

function localIso(d: Date): IsoDate {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type RangePreset = 7 | 30 | 90 | 'all';

/** Zakres kończący się dziś; `all` – od najwcześniejszej daty w danych (min. 90 dni). */
export function rangeFor(preset: RangePreset, today: IsoDate, earliest?: IsoDate): DateRange {
  const days = preset === 'all' ? 90 : preset;
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number);
  const from = localIso(new Date(y, m - 1, d - (days - 1)));
  return { from: preset === 'all' && earliest && earliest < from ? earliest : from, to: today };
}

/**
 * Domyślny zakres dla lekarza: od najwcześniejszego startu / odstawienia leku z ostatniego roku
 * do dziś, min. 90 dni – żeby było widać wszystkie ostatnie zmiany leków.
 */
export function focusRange(meds: Medication[], today: IsoDate): DateRange {
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number);
  const yearAgo = localIso(new Date(y - 1, m - 1, d));
  const recent = meds
    .flatMap((med) => [med.startDate, med.endDate])
    .filter((date): date is string => date !== undefined && date >= yearAgo && date <= today)
    .sort();
  const base = rangeFor(90, today);
  const first = recent[0];
  return first && first < base.from ? { from: first, to: today } : base;
}

export interface Bar {
  medication: Medication;
  left: number;
  width: number;
  /** Trwa dalej poza prawą krawędzią (brak daty końca albo po zakresie). */
  ongoing: boolean;
  /** Lek doraźny: zamiast pełnego paska cienka linia + kropki przyjęć. */
  asNeeded: boolean;
  label: string;
}

export interface Dose {
  intake: Intake;
  left: number;
}

export interface MedLane {
  key: string;
  label: string;
  category: MedicationCategory;
  bars: Bar[];
  /** Przyjęcia leków doraźnych (wzięte) i pominięte dawki leków stałych. */
  doses: Dose[];
}

const laneKey = (m: Medication) => (m.activeSubstance || m.name).toLocaleLowerCase('pl');

/**
 * Jeden tor na substancję (zmiana dawki = dwa paski w tym samym torze),
 * tory w kolejności grup (recepta, bez recepty, suplementy), w grupie od najwcześniejszego startu.
 */
export function medicationLanes(
  meds: Medication[],
  range: DateRange,
  intakes: Intake[] = [],
): MedLane[] {
  const b = boundsOf(range);
  const lanes = new Map<string, MedLane & { firstStart: number }>();
  const laneOfMed = new Map<string, { lane: MedLane; asNeeded: boolean }>();
  for (const m of meds) {
    const start = toTime(m.startDate);
    const end = m.endDate ? toTime(m.endDate) + DAY_MS : Infinity;
    if (start >= b.end || end <= b.start) continue;
    const left = pct(start, b);
    const right = pct(end, b);
    const key = laneKey(m);
    const lane = lanes.get(key) ?? {
      key,
      label: m.name,
      category: m.category,
      bars: [],
      doses: [],
      firstStart: start,
    };
    lane.firstStart = Math.min(lane.firstStart, start);
    const asNeeded = m.schedule.type === 'asNeeded';
    lane.bars.push({
      medication: m,
      left,
      width: Math.max(right - left, 0.8),
      ongoing: end > b.end,
      asNeeded,
      label: describeDose(m),
    });
    lanes.set(key, lane);
    laneOfMed.set(m.id, { lane, asNeeded });
  }
  for (const intake of intakes) {
    const owner = laneOfMed.get(intake.medicationId);
    const t = toTime(intake.scheduledAt);
    if (!owner || !inBounds(t, b)) continue;
    // Leki stałe: tylko pominięcia (wzięte = pasek); doraźne: każde przyjęcie.
    if (owner.asNeeded ? intake.status === 'taken' : intake.status === 'skipped') {
      owner.lane.doses.push({ intake, left: pct(t, b) });
    }
  }
  return [...lanes.values()]
    .sort(
      (a, z) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(z.category) ||
        a.firstStart - z.firstStart,
    )
    .map(({ firstStart: _, ...lane }) => ({
      ...lane,
      bars: lane.bars.sort((a, z) => a.left - z.left),
      doses: lane.doses.sort((a, z) => a.left - z.left),
    }));
}

export interface Tick {
  left: number;
  label: string;
}

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MAX_TICKS = 7;

/**
 * Podziałka dopasowana do długości zakresu: dni (≤ 10), poniedziałki (≤ 62),
 * co n-ty miesiąc (≤ 2 lata), dalej lata. Iteracja po kalendarzu – zmiana czasu nie przesuwa dni.
 */
export function axisTicks(range: DateRange): Tick[] {
  const b = boundsOf(range);
  const days = Math.round((b.end - b.start) / DAY_MS);
  const first = new Date(b.start);
  const ticks: Tick[] = [];
  const push = (d: Date, label: string) => {
    if (inBounds(d.getTime(), b)) ticks.push({ left: pct(d.getTime(), b), label });
  };

  if (days <= 62) {
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    for (; d.getTime() < b.end; d.setDate(d.getDate() + 1)) {
      if (days <= 10 || d.getDay() === 1) push(new Date(d), `${d.getDate()}.${d.getMonth() + 1}`);
    }
    return ticks;
  }

  const months = days / 30.4;
  if (months <= 24) {
    const step = Math.max(1, Math.ceil(months / MAX_TICKS));
    const d = new Date(first.getFullYear(), first.getMonth(), 1); // przed startem odfiltruje push
    for (; d.getTime() < b.end; d.setMonth(d.getMonth() + 1)) {
      if (d.getMonth() % step !== 0) continue;
      push(
        new Date(d),
        d.getMonth() === 0 ? String(d.getFullYear()) : (MONTHS[d.getMonth()] ?? ''),
      );
    }
    return ticks;
  }

  const step = Math.max(1, Math.ceil(months / 12 / MAX_TICKS));
  for (let y = first.getFullYear() + 1; new Date(y, 0, 1).getTime() < b.end; y += step) {
    push(new Date(y, 0, 1), String(y));
  }
  return ticks;
}
