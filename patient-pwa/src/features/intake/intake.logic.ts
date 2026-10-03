import type { Intake, IsoDate, IsoDateTime, Medication } from '@ez/shared';
import { isCurrent } from '../meds/meds.logic';

export interface ScheduledDose {
  medication: Medication;
  /** `HH:mm` lokalnie. */
  time: string;
  scheduledAt: IsoDateTime;
  intake?: Intake;
}

/** Lokalny dzień + godzina → ISO (tak samo zapisuje dane demo). */
export function localDateTime(day: IsoDate, time: string): IsoDateTime {
  const [y = 0, m = 1, d = 1] = day.split('-').map(Number);
  const [hh = 0, mm = 0] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

/** Dawki zaplanowane na `day` (leki codzienne aktualne tego dnia), z potwierdzeniem, jeśli jest. */
export function dosesForDay(meds: Medication[], intakes: Intake[], day: IsoDate): ScheduledDose[] {
  const byKey = new Map(intakes.map((i) => [`${i.medicationId}|${i.scheduledAt}`, i]));
  const doses: ScheduledDose[] = [];
  for (const medication of meds) {
    if (medication.schedule.type !== 'daily' || !isCurrent(medication, day)) continue;
    for (const time of medication.schedule.times) {
      const scheduledAt = localDateTime(day, time);
      doses.push({
        medication,
        time,
        scheduledAt,
        intake: byKey.get(`${medication.id}|${scheduledAt}`),
      });
    }
  }
  return doses.sort(
    (a, b) =>
      a.time.localeCompare(b.time) || a.medication.name.localeCompare(b.medication.name, 'pl'),
  );
}

/** Leki doraźne aktualne tego dnia (np. Ibuprom) – przyjęcie zapisuje się „teraz”. */
export function asNeededForDay(meds: Medication[], day: IsoDate): Medication[] {
  return meds
    .filter((m) => m.schedule.type === 'asNeeded' && isCurrent(m, day))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

export function progress(doses: ScheduledDose[]): { done: number; total: number } {
  return { done: doses.filter((d) => d.intake).length, total: doses.length };
}
