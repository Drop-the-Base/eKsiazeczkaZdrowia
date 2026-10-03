import { describe, expect, it } from 'vitest';
import type { Reminder } from '@ez/shared';
import { upcomingFollowUp, whenText } from './beforeVisit.logic';

const now = new Date(2026, 9, 3, 18, 0); // 03.10.2026, local time
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 9).toISOString();
const followUp = (id: string, iso: string, doneAt?: string): Reminder => ({
  id,
  type: 'followUp',
  at: iso,
  doneAt,
});

describe('upcomingFollowUp', () => {
  it('finds a follow-up tomorrow', () => {
    expect(upcomingFollowUp([followUp('r', at(2026, 10, 4))], now)).toEqual({
      reminderId: 'r',
      date: '2026-10-04',
      daysLeft: 1,
    });
  });

  it('includes today, skips far, past, done and other reminders', () => {
    const reminders: Reminder[] = [
      followUp('far', at(2026, 10, 20)),
      followUp('past', at(2026, 10, 1)),
      followUp('done', at(2026, 10, 4), '2026-10-02T10:00:00Z'),
      { id: 'med', type: 'medication', at: at(2026, 10, 3) },
      followUp('today', at(2026, 10, 3)),
    ];
    expect(upcomingFollowUp(reminders, now)?.reminderId).toBe('today');
    expect(upcomingFollowUp(reminders.slice(0, 4), now)).toBeUndefined();
  });

  it('describes when', () => {
    expect([0, 1, 3].map(whenText)).toEqual(['dziś', 'jutro', 'za 3 dni']);
  });
});
