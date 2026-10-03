import type { IsoDate, Medication, MedicationCategory, MedicationSchedule } from '@ez/shared';

/** Zawsze w tej kolejności – na liście, na osi czasu i u lekarza. */
export const CATEGORY_ORDER: MedicationCategory[] = ['prescription', 'otc', 'supplement'];

export const CATEGORY_LABEL: Record<MedicationCategory, string> = {
  prescription: 'Na receptę',
  otc: 'Bez recepty',
  supplement: 'Suplementy i zioła',
};

/** Zmienne CSS z `ui/tokens.css`. */
export const CATEGORY_COLOR: Record<MedicationCategory, string> = {
  prescription: 'var(--color-rx)',
  otc: 'var(--color-otc)',
  supplement: 'var(--color-supplement)',
};

/**
 * Lek jest aktualny, jeśli już się zaczął i nie ma daty końca albo kończy się dziś lub później.
 * Wyjątek: odstawiony (z powodem) dziś – pacjent właśnie go odstawił, więc już nie jest aktualny.
 */
export function isCurrent(m: Medication, today: IsoDate): boolean {
  if (m.startDate > today || m.endDate === undefined) return m.startDate <= today;
  return m.stopReason ? m.endDate > today : m.endDate >= today;
}

export interface GroupedMedications {
  current: Record<MedicationCategory, Medication[]>;
  /** Odstawione, od ostatnio odstawionego. */
  stopped: Medication[];
}

export function groupMedications(meds: Medication[], today: IsoDate): GroupedMedications {
  const byName = (a: Medication, b: Medication) => a.name.localeCompare(b.name, 'pl');
  const current: GroupedMedications['current'] = { prescription: [], otc: [], supplement: [] };
  const stopped: Medication[] = [];
  for (const m of meds) {
    if (isCurrent(m, today)) current[m.category].push(m);
    else if (m.endDate !== undefined && m.endDate <= today) stopped.push(m);
  }
  for (const c of CATEGORY_ORDER) current[c].sort(byName);
  stopped.sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  return { current, stopped };
}

export function describeSchedule(schedule: MedicationSchedule): string {
  if (schedule.type === 'asNeeded') return 'doraźnie';
  const times = [...schedule.times].sort();
  return `${times.length}× dziennie (${times.join(', ')})`;
}

export function describeDose(m: Pick<Medication, 'dose' | 'unit'>): string {
  return [m.dose, m.unit].filter(Boolean).join(' ');
}
