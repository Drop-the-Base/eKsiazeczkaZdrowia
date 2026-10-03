import type { IsoDate, LlmQueryResponse, QueryFilter } from '@ez/shared';
import { BadRequest } from '../json.js';
import { createLlmClient, extractJson, llmConfigFromEnv, type LlmClient } from './client.js';
import { queryFilterByRules } from './query.rules.js';

const MAX_QUESTION = 500;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const SYSTEM = `Zamieniasz pytanie pacjenta o jego historię zdrowia na filtr JSON. Nie odpowiadasz na pytanie i nie oceniasz zdrowia.
Zwróć wyłącznie JSON: {"entity":"medication"|"symptom"|"exam","atcPrefix"?:string,"name"?:string,"from"?:"RRRR-MM-DD","to"?:"RRRR-MM-DD","sort"?:"asc"|"desc","limit"?:number}.
- Grupy leków jako prefiks ATC (np. przeciwzakrzepowe → "B01", przeciwbólowe → "N02", antybiotyki → "J01").
- Objawy w mianowniku liczby pojedynczej, małymi literami (np. "ból głowy", "zawroty głowy").
- Okresy licz od dzisiejszej daty podanej w pytaniu.
- „Kiedy ostatnio” → "sort":"desc","limit":1. „Od kiedy” → "sort":"asc".`;

/** Odpowiedź modelu musi być poprawnym `QueryFilter` – inaczej używamy reguł. */
export function validateFilter(value: unknown): QueryFilter | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (v.entity !== 'medication' && v.entity !== 'symptom' && v.entity !== 'exam') return null;
  const filter: QueryFilter = { entity: v.entity };
  const str = (x: unknown, max = 60) =>
    typeof x === 'string' && x.trim() !== '' && x.length <= max ? x.trim() : undefined;
  const atc = str(v.atcPrefix, 7);
  if (atc && /^[A-Z][0-9A-Z]*$/.test(atc)) filter.atcPrefix = atc;
  const name = str(v.name);
  if (name) filter.name = name;
  if (typeof v.from === 'string' && ISO_DATE.test(v.from)) filter.from = v.from;
  if (typeof v.to === 'string' && ISO_DATE.test(v.to)) filter.to = v.to;
  if (v.sort === 'asc' || v.sort === 'desc') filter.sort = v.sort;
  if (typeof v.limit === 'number' && Number.isInteger(v.limit) && v.limit > 0 && v.limit <= 100) {
    filter.limit = v.limit;
  }
  return filter;
}

const todayUtc = (): IsoDate => new Date().toISOString().slice(0, 10);

/**
 * `POST /llm/query`: tekst pytania → filtr wykonywany na telefonie. Anonimowo: w żądaniu tylko
 * pytanie (opcjonalnie dzisiejsza data z telefonu), nic nie jest logowane. Bez modelu lub przy
 * błędzie modelu – reguły (`query.rules.ts`).
 */
export function createQueryHandler(client: LlmClient | null) {
  return async function handleQuery(body: unknown): Promise<LlmQueryResponse> {
    if (typeof body !== 'object' || body === null) throw new BadRequest('Brak danych');
    const { question, today: rawToday } = body as Record<string, unknown>;
    if (typeof question !== 'string' || question.trim() === '' || question.length > MAX_QUESTION) {
      throw new BadRequest(`Pole question: 1–${MAX_QUESTION} znaków`);
    }
    const today = typeof rawToday === 'string' && ISO_DATE.test(rawToday) ? rawToday : todayUtc();

    if (client) {
      try {
        const answer = await client.complete(SYSTEM, `Dziś jest ${today}. Pytanie: ${question}`);
        const filter = validateFilter(extractJson(answer));
        if (filter) return { filter };
      } catch {
        // celowo bez treści błędu w logach – przechodzimy na reguły
      }
    }
    return { filter: queryFilterByRules(question, today) };
  };
}

/** Handler z konfiguracją ze zmiennych środowiskowych – do podpięcia w `server/src/index.ts`. */
export const handleQuery = createQueryHandler(createLlmClient(llmConfigFromEnv()));
