import type { LlmVisitNoteResponse } from '@ez/shared';
import { BadRequest } from '../json.js';
import { parseVisitNoteRules } from './visitNote.rules.js';

const MAX_TEXT = 2000;

/**
 * `POST /llm/visit-note`: note text → proposed changes. Anonymous: the body is only the note and the
 * date, nothing is logged. Until the LLM client (A23) is in, the note is read by rules.
 */
export async function handleVisitNote(body: unknown): Promise<LlmVisitNoteResponse> {
  if (typeof body !== 'object' || body === null) throw new BadRequest('Brak danych');
  const { text, today } = body as Record<string, unknown>;
  if (typeof text !== 'string' || text.trim() === '' || text.length > MAX_TEXT) {
    throw new BadRequest('Pole text: 1–2000 znaków');
  }
  if (typeof today !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(today)) {
    throw new BadRequest('Pole today: RRRR-MM-DD');
  }
  return parseVisitNoteRules(text, today);
}
