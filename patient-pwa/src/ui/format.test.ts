import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, todayIso } from './format';

describe('format', () => {
  it('todayIso uses local date parts', () => {
    expect(todayIso(new Date(2026, 9, 3, 23, 59))).toBe('2026-10-03');
    expect(todayIso(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });

  it('formatDate handles plain dates and full ISO', () => {
    expect(formatDate('2026-10-03')).toBe('03.10.2026');
    const local = new Date(2026, 9, 3, 18, 40);
    expect(formatDate(local.toISOString())).toBe('03.10.2026');
  });

  it('formatDateTime shows local time', () => {
    const local = new Date(2026, 9, 3, 8, 5);
    expect(formatDateTime(local.toISOString())).toBe('03.10.2026, 08:05');
  });
});
