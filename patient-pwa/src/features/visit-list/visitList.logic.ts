import type { VisitNoteItem } from '@ez/shared';

export const MAX_NOTE_LENGTH = 500;

// "powiem lekarzowi, że …" / "zapytać lekarza o …" said or typed out of habit.
const PREFIX =
  /^(?:powiem|powiedzieć|powiedz|zapytam|zapytać|zapytaj)\s+lekarz(?:owi|a)\s*,?\s*(?:(?:że|o)(?:\s+|$))?/i;

export type NoteParse = { ok: true; text: string } | { ok: false; error: string };

/** Trims, drops the "powiem lekarzowi, że" prefix and capitalises; empty or too long → error. */
export function parseNoteText(input: string): NoteParse {
  const text = input.replace(/\s+/g, ' ').trim().replace(PREFIX, '').trim();
  if (text.length === 0) return { ok: false, error: 'Wpisz, co chcesz powiedzieć lekarzowi' };
  if (text.length > MAX_NOTE_LENGTH)
    return { ok: false, error: `Maksymalnie ${MAX_NOTE_LENGTH} znaków` };
  return { ok: true, text: text.charAt(0).toUpperCase() + text.slice(1) };
}

/** Not yet discussed, oldest first – the order the patient will go through them. */
export function activeItems(items: VisitNoteItem[]): VisitNoteItem[] {
  return items.filter((i) => !i.discussed).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Discussed, newest first. */
export function discussedItems(items: VisitNoteItem[]): VisitNoteItem[] {
  return items.filter((i) => i.discussed).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
