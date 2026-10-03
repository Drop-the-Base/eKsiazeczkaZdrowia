import type { IntakeStatus, Medication } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { localDateTime, type ScheduledDose } from './intake.logic';

/** Leki + potwierdzenia z danego dnia (lokalnie). */
export function useDayData(day: string) {
  return useLive(async () => {
    const from = localDateTime(day, '00:00');
    const to = localDateTime(day, '23:59');
    const [medications, intakes] = await Promise.all([
      db.medications.list(),
      db.intakes.between(from, to),
    ]);
    return { medications, intakes };
  }, [day]);
}

export async function confirmDose(dose: ScheduledDose, status: IntakeStatus): Promise<void> {
  const confirmedAt = new Date().toISOString();
  if (dose.intake) {
    await db.intakes.update(dose.intake.id, { status, confirmedAt });
    return;
  }
  await db.intakes.add({
    medicationId: dose.medication.id,
    scheduledAt: dose.scheduledAt,
    status,
    confirmedAt,
  });
}

export async function undoDose(dose: ScheduledDose): Promise<void> {
  if (dose.intake) await db.intakes.remove(dose.intake.id);
}

/** Lek doraźny: przyjęcie „teraz”. */
export async function takeNow(medication: Medication): Promise<void> {
  const now = new Date().toISOString();
  await db.intakes.add({
    medicationId: medication.id,
    scheduledAt: now,
    status: 'taken',
    confirmedAt: now,
  });
}
