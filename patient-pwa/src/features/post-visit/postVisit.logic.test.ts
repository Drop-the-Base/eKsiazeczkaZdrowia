import { describe, expect, it } from 'vitest';
import { createDemoData, type Medication } from '@ez/shared';
import { buildPlan, isVisitNoteChanges, matchMedications } from './postVisit.logic';

const today = '2026-10-03';
const current: Medication[] = createDemoData(`${today}T18:00:00.000Z`).medications.filter(
  (m) => m.startDate <= today && (m.endDate === undefined || m.endDate >= today),
);

describe('post-visit plan', () => {
  it('matches "suplement" to the supplement and names without Polish letters', () => {
    expect(matchMedications('suplement', current).map((m) => m.name)).toEqual([
      'Suplement z grzybów',
    ]);
    expect(matchMedications('dazatynib', current).map((m) => m.name)).toEqual(['Dazatynib']);
    expect(matchMedications('amlodypine', current)).toEqual([]);
    expect(matchMedications('amlodypina', current).map((m) => m.name)).toEqual(['Amlodipina']);
  });

  it('builds the happy-path plan: stop the supplement, follow-up', () => {
    const plan = buildPlan(
      { stopMeds: [{ name: 'suplement' }], newMeds: [], followUpDate: '2026-10-17' },
      current,
    );
    expect(plan.stops).toEqual([
      expect.objectContaining({
        said: 'suplement',
        reason: 'zalecenie lekarza',
        medicationId: 'demo-med-mushroom',
        selected: true,
      }),
    ]);
    expect(plan.followUp).toEqual({ date: '2026-10-17', selected: true });
  });

  it('leaves an unmatched stop unselected and fills defaults for a new medication', () => {
    const plan = buildPlan(
      {
        stopMeds: [{ name: 'witamina C' }],
        newMeds: [{ name: 'Bisocard', dose: '5', unit: 'mg' }],
      },
      current,
    );
    expect(plan.stops[0]).toMatchObject({
      matched: false,
      selected: false,
      medicationId: undefined,
    });
    expect(plan.stops[0]?.candidates).toHaveLength(current.length);
    expect(plan.adds[0]).toMatchObject({
      name: 'Bisocard',
      schedule: { type: 'daily', times: ['08:00'] },
      category: 'prescription',
    });
  });

  it('validates the server response', () => {
    expect(
      isVisitNoteChanges({ stopMeds: [{ name: 'x' }], newMeds: [], followUpDate: '2026-10-17' }),
    ).toBe(true);
    expect(isVisitNoteChanges({ stopMeds: [{}], newMeds: [] })).toBe(false);
    expect(isVisitNoteChanges({ stopMeds: [], newMeds: [], followUpDate: 'jutro' })).toBe(false);
  });
});
