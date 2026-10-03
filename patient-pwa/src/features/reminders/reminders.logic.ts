import type { IsoDateTime, Reminder } from '@ez/shared';

/** „Do potwierdzenia”: czas minął, nieobsłużone. Kontrole po wizycie pokazuje lista „powiem lekarzowi” (B). */
export function dueReminders(list: Reminder[], now: IsoDateTime): Reminder[] {
  return list
    .filter((r) => r.type !== 'followUp' && !r.doneAt && r.at <= now)
    .sort((a, b) => a.at.localeCompare(b.at));
}

export const REMINDER_TEXT: Record<Reminder['type'], string> = {
  medication: 'Czas na lek',
  followUp: 'Wizyta kontrolna',
  export: 'Zrób kopię zapasową danych',
};
