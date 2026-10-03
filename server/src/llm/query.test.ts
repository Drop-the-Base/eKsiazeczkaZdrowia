import { describe, expect, it } from 'vitest';
import { BadRequest } from '../json';
import { extractJson, llmConfigFromEnv, type LlmClient } from './client';
import { createQueryHandler, validateFilter } from './query';

const fake = (answer: string | Error): LlmClient => ({
  complete: async () => {
    if (answer instanceof Error) throw answer;
    return answer;
  },
});

describe('validateFilter', () => {
  it('keeps only known, well-formed fields', () => {
    expect(
      validateFilter({
        entity: 'medication',
        atcPrefix: 'B01',
        from: '2026-08-03',
        to: 'wczoraj',
        sort: 'up',
        limit: 1,
        extra: 'x',
      }),
    ).toEqual({ entity: 'medication', atcPrefix: 'B01', from: '2026-08-03', limit: 1 });
    expect(validateFilter({ entity: 'drug' })).toBeNull();
    expect(validateFilter('medication')).toBeNull();
  });
});

describe('createQueryHandler', () => {
  const body = { question: 'Kiedy ostatnio brałam leki przeciwzakrzepowe?', today: '2026-10-03' };

  it('uses the model answer when it is a valid filter', async () => {
    const handler = createQueryHandler(
      fake('```json\n{"entity":"medication","atcPrefix":"B01"}\n```'),
    );
    expect(await handler(body)).toEqual({ filter: { entity: 'medication', atcPrefix: 'B01' } });
  });

  it('falls back to rules without a model, on errors and on invalid answers', async () => {
    const rules = { entity: 'medication', atcPrefix: 'B01', sort: 'desc', limit: 1 };
    expect(await createQueryHandler(null)(body)).toEqual({ filter: rules });
    expect(await createQueryHandler(fake(new Error('timeout')))(body)).toEqual({ filter: rules });
    expect(await createQueryHandler(fake('nie wiem'))(body)).toEqual({ filter: rules });
  });

  it('rejects bad input', async () => {
    await expect(createQueryHandler(null)({ question: '' })).rejects.toBeInstanceOf(BadRequest);
    await expect(createQueryHandler(null)(null)).rejects.toBeInstanceOf(BadRequest);
  });
});

describe('client helpers', () => {
  it('reads config from env', () => {
    expect(llmConfigFromEnv({})).toBeNull();
    expect(llmConfigFromEnv({ LLM_HOST: 'localhost', LLM_PORT: '11434' })?.baseUrl).toBe(
      'http://localhost:11434',
    );
    expect(llmConfigFromEnv({ LLM_HOST: 'https://api.example.com/' })?.baseUrl).toBe(
      'https://api.example.com',
    );
  });

  it('extracts JSON from fenced answers', () => {
    expect(extractJson('Oto filtr: {"a":1} dzięki')).toEqual({ a: 1 });
    expect(() => extractJson('brak')).toThrow();
  });
});
