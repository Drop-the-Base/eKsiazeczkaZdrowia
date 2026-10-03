import { describe, expect, it } from 'vitest';
import { formatRemaining, isTerminal, statusLabel } from './session.logic';

describe('session logic', () => {
  it('formats the remaining time', () => {
    const now = Date.parse('2026-10-03T18:00:00.000Z');
    expect(formatRemaining('2026-10-03T18:14:32.000Z', now)).toBe('14:32');
    expect(formatRemaining('2026-10-03T17:59:00.000Z', now)).toBe('00:00');
  });

  it('labels statuses in Polish and marks terminal ones', () => {
    expect(statusLabel('waiting-for-patient')).toBe('Oczekiwanie na pacjenta');
    expect(isTerminal('expired')).toBe(true);
    expect(isTerminal('received')).toBe(false);
  });
});
