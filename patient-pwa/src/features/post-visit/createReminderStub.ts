import type { CreateReminder } from '@ez/shared';
import { db } from '../../db';

// Stand-in for `createReminder` from A26 (same contract); swapped for the import once A26 lands.
export const createReminder: CreateReminder = (input) => db.reminders.add(input);
