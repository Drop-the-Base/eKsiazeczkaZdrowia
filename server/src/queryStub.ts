import type { LlmQueryResponse, QueryFilter } from '@ez/shared';
import { BadRequest } from './json.js';

// Stand-in for A23 (`llm/query.ts`) with the three happy-path questions. Removed once A23 lands.
export async function handleQueryStub(body: unknown): Promise<LlmQueryResponse> {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('question' in body) ||
    typeof body.question !== 'string'
  ) {
    throw new BadRequest('Brak pola question');
  }
  const q = body.question.toLowerCase();
  let filter: QueryFilter;
  if (q.includes('przeciwzakrzep')) {
    filter = { entity: 'medication', atcPrefix: 'B01', sort: 'desc', limit: 1 };
  } else if (q.includes('ból') || q.includes('bóle') || q.includes('od kiedy')) {
    filter = { entity: 'symptom', name: 'ból głowy', sort: 'asc' };
  } else {
    const from = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    filter = { entity: 'medication', from, sort: 'asc' };
  }
  return { filter };
}
