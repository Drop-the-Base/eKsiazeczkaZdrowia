import type { Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { medFormFrom } from './medForm.logic';
import { changePlan, dayBefore, stopPatch, validateReason } from './stop.logic';

const old: Medication = {
  id: 'm1',
  name: 'Nilotynib',
  dose: '300',
  unit: 'mg',
  schedule: { type: 'daily', times: ['08:00', '20:00'] },
  category: 'prescription',
  startDate: '2026-05-01',
  source: 'manual',
};

describe('dayBefore', () => {
  it('handles month and year boundaries', () => {
    expect(dayBefore('2026-10-03')).toBe('2026-10-02');
    expect(dayBefore('2026-03-01')).toBe('2026-02-28');
    expect(dayBefore('2026-01-01')).toBe('2025-12-31');
  });
});

describe('stop', () => {
  it('requires a reason and sets end date', () => {
    expect(validateReason('  ')).toBeDefined();
    expect(validateReason('mdłości')).toBeUndefined();
    expect(stopPatch(' mdłości ', '2026-10-03')).toEqual({
      endDate: '2026-10-03',
      stopReason: 'mdłości',
    });
  });
});

describe('changePlan', () => {
  it('ends the old record the day before and starts the new one on the change date', () => {
    const form = { ...medFormFrom(old), dose: '400' };
    const { oldPatch, next } = changePlan(old, form, 'nie pomagało', '2026-10-03');
    expect(oldPatch).toEqual({ endDate: '2026-10-02', stopReason: 'zmiana: nie pomagało' });
    expect(next).toMatchObject({ name: 'Nilotynib', dose: '400', startDate: '2026-10-03' });
    expect(next.endDate).toBeUndefined();
  });
});
