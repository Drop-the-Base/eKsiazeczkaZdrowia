import type { IsoDate, Reminder } from '@ez/shared';

/** The list pops up this many days before a follow-up (and on the day). */
export const DAYS_BEFORE = 3;

export interface UpcomingVisit {
  reminderId: string;
  date: IsoDate;
  daysLeft: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const localDay = (d: Date): IsoDate =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Earliest pending follow-up from today to `withinDays` days ahead (local calendar days). */
export function upcomingFollowUp(
  reminders: Reminder[],
  now: Date,
  withinDays = DAYS_BEFORE,
): UpcomingVisit | undefined {
  const today = localDay(now);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return reminders
    .filter((r) => r.type === 'followUp' && !r.doneAt)
    .map((r) => {
      const date = localDay(new Date(r.at));
      const [y, m, d] = date.split('-').map(Number) as [number, number, number];
      const daysLeft = Math.round((new Date(y, m - 1, d).getTime() - startOfToday) / 86_400_000);
      return { reminderId: r.id, date, daysLeft };
    })
    .filter((v) => v.date >= today && v.daysLeft <= withinDays)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function whenText(daysLeft: number): string {
  if (daysLeft <= 0) return 'dziś';
  if (daysLeft === 1) return 'jutro';
  return `za ${daysLeft} dni`;
}
