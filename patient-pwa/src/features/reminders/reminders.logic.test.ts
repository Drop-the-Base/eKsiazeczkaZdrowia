import type { Reminder } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { dueReminders } from './reminders.logic';

const r = (id: string, type: Reminder['type'], at: string, doneAt?: string): Reminder => ({
  id,
  type,
  at,
  doneAt,
});

describe('dueReminders', () => {
  it('past, not done, without follow-ups, oldest first', () => {
    const now = '2026-10-03T12:00:00.000Z';
    const list = [
      r('later', 'medication', '2026-10-03T20:00:00.000Z'),
      r('b', 'medication', '2026-10-03T08:00:00.000Z'),
      r('a', 'export', '2026-10-01T08:00:00.000Z'),
      r('done', 'medication', '2026-10-02T08:00:00.000Z', '2026-10-02T08:05:00.000Z'),
      r('visit', 'followUp', '2026-10-02T08:00:00.000Z'),
    ];
    expect(dueReminders(list, now).map((x) => x.id)).toEqual(['a', 'b']);
  });
});
