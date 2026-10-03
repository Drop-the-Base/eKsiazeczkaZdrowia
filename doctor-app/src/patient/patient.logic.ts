import type {
  Intake,
  IsoDate,
  Medication,
  MedicationCategory,
  MedicationSchedule,
} from '@ez/shared';

/** Always this order and the same look: the doctor sees supplements on a par with prescriptions. */
export const MED_GROUPS: { category: MedicationCategory; label: string; color: string }[] = [
  { category: 'prescription', label: 'Na receptę', color: 'var(--color-rx)' },
  { category: 'otc', label: 'Bez recepty', color: 'var(--color-otc)' },
  { category: 'supplement', label: 'Suplementy i zioła', color: 'var(--color-supplement)' },
];

export function ageOn(birthDate: IsoDate, date: IsoDate): number {
  const [by, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

export const isCurrent = (m: Medication, today: IsoDate): boolean =>
  m.startDate <= today && (m.endDate === undefined || m.endDate >= today);

export function currentByGroup(
  meds: Medication[],
  today: IsoDate,
): Record<MedicationCategory, Medication[]> {
  const groups: Record<MedicationCategory, Medication[]> = {
    prescription: [],
    otc: [],
    supplement: [],
  };
  for (const m of meds
    .filter((x) => isCurrent(x, today))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))) {
    groups[m.category].push(m);
  }
  return groups;
}

export function describeDose(m: Pick<Medication, 'dose' | 'unit'>): string {
  return [m.dose, m.unit].filter(Boolean).join(' ');
}

export function describeSchedule(s: MedicationSchedule): string {
  if (s.type === 'asNeeded') return 'doraźnie';
  return `${s.times.length}× dziennie (${[...s.times].sort().join(', ')})`;
}

/**
 * Regular meds: share of confirmed intakes ("90% przyjęć"); as-needed: how often taken ("przyjęty 2×").
 * `undefined` without any confirmations.
 */
export function intakeSummary(med: Medication, intakes: Intake[]): string | undefined {
  const own = intakes.filter((i) => i.medicationId === med.id);
  if (own.length === 0) return undefined;
  const taken = own.filter((i) => i.status === 'taken').length;
  if (med.schedule.type === 'asNeeded') return `przyjęty ${taken}×`;
  return `${Math.round((100 * taken) / own.length)}% przyjęć`;
}
