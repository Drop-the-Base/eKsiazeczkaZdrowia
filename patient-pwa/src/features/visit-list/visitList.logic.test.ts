import { describe, expect, it } from 'vitest';
import type { VisitNoteItem } from '@ez/shared';
import { activeItems, discussedItems, MAX_NOTE_LENGTH, parseNoteText } from './visitList.logic';

const item = (id: string, createdAt: string, discussed: boolean): VisitNoteItem => ({
  id,
  text: id,
  createdAt,
  source: 'manual',
  discussed,
});

describe('parseNoteText', () => {
  it('strips the "powiem lekarzowi, że" prefix and capitalises', () => {
    expect(parseNoteText('  powiem lekarzowi, że po nowym leku kręci mi się w głowie ')).toEqual({
      ok: true,
      text: 'Po nowym leku kręci mi się w głowie',
    });
    expect(parseNoteText('zapytać lekarza o   dawkę')).toEqual({
      ok: true,
      text: 'Zapytać lekarza o dawkę',
    });
    expect(parseNoteText('boli mnie kolano')).toEqual({ ok: true, text: 'Boli mnie kolano' });
  });

  it('rejects empty and too long notes', () => {
    expect(parseNoteText('   ').ok).toBe(false);
    expect(parseNoteText('powiem lekarzowi, że').ok).toBe(false);
    expect(parseNoteText('a'.repeat(MAX_NOTE_LENGTH + 1)).ok).toBe(false);
  });
});

describe('active / discussed', () => {
  const items = [
    item('b', '2026-10-02T10:00:00Z', false),
    item('a', '2026-10-01T10:00:00Z', false),
    item('c', '2026-09-01T10:00:00Z', true),
    item('d', '2026-09-20T10:00:00Z', true),
  ];
  it('lists open items oldest first and discussed newest first', () => {
    expect(activeItems(items).map((i) => i.id)).toEqual(['a', 'b']);
    expect(discussedItems(items).map((i) => i.id)).toEqual(['d', 'c']);
  });
});
