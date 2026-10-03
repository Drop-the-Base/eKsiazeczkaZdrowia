import { describe, expect, it } from 'vitest';
import { alreadyTaking, quickSupplement } from './anythingElse.logic';

describe('quickSupplement', () => {
  it('creates a daily supplement starting today', () => {
    expect(quickSupplement('  Magnez ', '2026-10-03')).toEqual({
      name: 'Magnez',
      dose: '1',
      unit: 'porcja',
      schedule: { type: 'daily', times: ['08:00'] },
      category: 'supplement',
      startDate: '2026-10-03',
      source: 'manual',
    });
  });
});

describe('alreadyTaking', () => {
  it('compares names case-insensitively', () => {
    expect(alreadyTaking('magnez', [{ name: 'Magnez' }])).toBe(true);
    expect(alreadyTaking('Omega-3', [{ name: 'Magnez' }])).toBe(false);
  });
});
