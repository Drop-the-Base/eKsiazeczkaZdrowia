import type { Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { describeDose, describeSchedule, groupMedications, isCurrent } from './meds.logic';

const med = (over: Partial<Medication>): Medication => ({
  id: over.name ?? 'x',
  name: 'x',
  dose: '1',
  unit: 'tabl.',
  schedule: { type: 'daily', times: ['08:00'] },
  category: 'prescription',
  startDate: '2026-01-01',
  source: 'manual',
  ...over,
});

const today = '2026-10-03';

describe('isCurrent', () => {
  it('is current from start date until end date inclusive', () => {
    expect(isCurrent(med({}), today)).toBe(true);
    expect(isCurrent(med({ endDate: today }), today)).toBe(true);
    expect(isCurrent(med({ endDate: '2026-10-02' }), today)).toBe(false);
    expect(isCurrent(med({ startDate: '2026-10-04' }), today)).toBe(false);
  });
});

describe('groupMedications', () => {
  it('groups current by category (sorted by name) and lists stopped newest first', () => {
    const { current, stopped } = groupMedications(
      [
        med({ name: 'Zeta' }),
        med({ name: 'Alfa' }),
        med({ name: 'Grzyby', category: 'supplement' }),
        med({ name: 'Old', endDate: '2025-01-01' }),
        med({ name: 'Newer', endDate: '2026-09-01' }),
      ],
      today,
    );
    expect(current.prescription.map((m) => m.name)).toEqual(['Alfa', 'Zeta']);
    expect(current.otc).toEqual([]);
    expect(current.supplement.map((m) => m.name)).toEqual(['Grzyby']);
    expect(stopped.map((m) => m.name)).toEqual(['Newer', 'Old']);
  });
});

describe('describe*', () => {
  it('formats schedule and dose', () => {
    expect(describeSchedule({ type: 'asNeeded' })).toBe('doraźnie');
    expect(describeSchedule({ type: 'daily', times: ['20:00', '08:00'] })).toBe(
      '2× dziennie (08:00, 20:00)',
    );
    expect(describeDose({ dose: '400', unit: 'mg' })).toBe('400 mg');
    expect(describeDose({ dose: '1 kapsułka', unit: '' })).toBe('1 kapsułka');
  });
});
