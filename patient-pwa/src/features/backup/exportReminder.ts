import { db } from '../../db';
import { createReminder, markDone } from '../reminders';
import { nextExportReminder } from './backup.logic';

/** After a backup: earlier export reminders are done, the next one is in a month. */
export async function scheduleNextExportReminder(now = new Date()): Promise<void> {
  for (const r of await db.reminders.list()) {
    if (r.type === 'export' && !r.doneAt) await markDone(r.id);
  }
  await createReminder({ type: 'export', at: nextExportReminder(now) });
}
