import { describe, expect, it } from 'vitest';
import { createDemoSnapshot, type Intake, type Medication } from '@ez/shared';
import { ageOn, currentByGroup, describeSchedule, intakeSummary } from './patient.logic';

describe('doctor view logic', () => {
  it('computes age on a date', () => {
    expect(ageOn('1968-04-02', '2026-10-03')).toBe(58);
    expect(ageOn('1968-10-04', '2026-10-03')).toBe(57);
    expect(ageOn('1968-10-03', '2026-10-03')).toBe(58);
  });

  it('puts the supplement in its own group next to prescriptions', () => {
    const s = createDemoSnapshot('2026-10-03T18:00:00.000Z');
    const g = currentByGroup(s.medications, '2026-10-03');
    expect(g.prescription.map((m) => m.name)).toEqual(['Amlodipina', 'Dazatynib']);
    expect(g.otc.map((m) => m.name)).toEqual(['Ibuprom']);
    expect(g.supplement.map((m) => m.name)).toEqual(['Suplement z grzybów']);
  });

  it('computes adherence and describes the schedule', () => {
    const intake = (status: Intake['status']): Intake => ({
      id: Math.random().toString(),
      medicationId: 'm',
      scheduledAt: '2026-10-01T08:00:00Z',
      status,
      confirmedAt: '2026-10-01T08:00:00Z',
    });
    const med = (schedule: Medication['schedule']): Medication => ({
      id: 'm',
      name: 'Lek',
      dose: '1',
      unit: 'mg',
      schedule,
      category: 'prescription',
      startDate: '2026-01-01',
      source: 'manual',
    });
    const daily = med({ type: 'daily', times: ['08:00'] });
    expect(intakeSummary(daily, [intake('taken'), intake('taken'), intake('skipped')])).toBe(
      '67% przyjęć',
    );
    expect(intakeSummary(med({ type: 'asNeeded' }), [intake('taken'), intake('taken')])).toBe(
      'przyjęty 2×',
    );
    expect(intakeSummary({ ...daily, id: 'x' }, [intake('taken')])).toBeUndefined();
    expect(describeSchedule({ type: 'daily', times: ['20:00', '08:00'] })).toBe(
      '2× dziennie (08:00, 20:00)',
    );
  });
});
