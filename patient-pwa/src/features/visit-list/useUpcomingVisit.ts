import { db } from '../../db';
import { useLive } from '../../ui';
import { upcomingFollowUp } from './beforeVisit.logic';
import { activeItems } from './visitList.logic';

/** Nearest pending follow-up (if within a few days) and the open "powiem lekarzowi" items. */
export function useUpcomingVisit() {
  return useLive(async () => ({
    upcoming: upcomingFollowUp(await db.reminders.list(), new Date()),
    items: activeItems(await db.visitNoteItems.list()),
  }));
}
