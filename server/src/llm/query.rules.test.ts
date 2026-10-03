import { describe, expect, it } from 'vitest';
import { queryFilterByRules } from './query.rules';

const today = '2026-10-03';

describe('queryFilterByRules – happy path questions', () => {
  it('medications in the last 2 months', () => {
    expect(queryFilterByRules('Jakie leki brałam w ostatnich 2 miesiącach?', today)).toEqual({
      entity: 'medication',
      from: '2026-08-03',
      sort: 'asc',
    });
  });

  it('last anticoagulant → ATC B01, newest first, one result', () => {
    expect(queryFilterByRules('Kiedy ostatnio brałam leki przeciwzakrzepowe?', today)).toEqual({
      entity: 'medication',
      atcPrefix: 'B01',
      sort: 'desc',
      limit: 1,
    });
  });

  it('since when headaches → symptom by stored name, oldest first', () => {
    expect(queryFilterByRules('Od kiedy mam te bóle głowy?', today)).toEqual({
      entity: 'symptom',
      name: 'ból głowy',
      sort: 'asc',
    });
  });
});

describe('queryFilterByRules – other phrasings', () => {
  it('reads number words and weeks', () => {
    expect(queryFilterByRules('co brałam przez ostatnie dwa tygodnie', today).from).toBe(
      '2026-09-19',
    );
    expect(queryFilterByRules('leki w ostatnim miesiącu', today).from).toBe('2026-09-03');
  });

  it('detects exams', () => {
    expect(queryFilterByRules('pokaż wyniki morfologii z tego roku', today)).toMatchObject({
      entity: 'exam',
      name: 'morfologia',
    });
  });
});
