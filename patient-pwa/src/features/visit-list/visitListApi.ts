import type { VisitNoteItem } from '@ez/shared';
import { db } from '../../db';
import { activeItems } from './visitList.logic';

/** Open "powiem lekarzowi" items, oldest first (contract `GetActiveVisitList`). */
export async function getActiveVisitList(): Promise<VisitNoteItem[]> {
  return activeItems(await db.visitNoteItems.list());
}

export function addVisitNote(
  text: string,
  source: VisitNoteItem['source'],
  now: string,
): Promise<VisitNoteItem> {
  return db.visitNoteItems.add({ text, source, createdAt: now, discussed: false });
}

export function setDiscussed(id: string, discussed: boolean): Promise<void> {
  return db.visitNoteItems.update(id, { discussed });
}

export function removeVisitNote(id: string): Promise<void> {
  return db.visitNoteItems.remove(id);
}
