import { LLM_QUERY_PATH, type AskHistory, type LlmQueryResponse } from '@ez/shared';
import { todayIso } from '../../ui/format';

/**
 * Kontrakt `AskHistory`: na serwer idzie **tylko tekst pytania** (i dzisiejsza data telefonu,
 * żeby „ostatnie 2 miesiące” liczyć od dziś pacjenta). Filtr wykonuje się lokalnie (`runFilter`).
 */
export const askHistory: AskHistory = async (question) => {
  const res = await fetch(LLM_QUERY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, today: todayIso() }),
  });
  if (!res.ok) throw new Error(`Serwer odpowiedział błędem (${res.status})`);
  const body = (await res.json()) as Partial<LlmQueryResponse>;
  const entity = body.filter?.entity;
  if (entity !== 'medication' && entity !== 'symptom' && entity !== 'exam') {
    throw new Error('Nie zrozumiałem pytania');
  }
  return body.filter!;
};
