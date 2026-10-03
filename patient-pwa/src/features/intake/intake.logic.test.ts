import type { Intake, Medication } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { asNeededForDay, dosesForDay, localDateTime, progress } from './intake.logic';

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

const day = '2026-10-03';

describe('dosesForDay', () => {
  const meds = [
    med({ name: 'Dazatynib' }),
    med({ name: 'Nilotynib', schedule: { type: 'daily', times: ['20:00', '08:00'] } }),
    med({ name: 'Imatinib', endDate: '2026-06-15', stopReason: 'x' }),
    med({ name: 'Ibuprom', schedule: { type: 'asNeeded' }, category: 'otc' }),
  ];

  it('lists daily doses of current medications, sorted by time then name', () => {
    const doses = dosesForDay(meds, [], day);
    expect(doses.map((d) => `${d.time} ${d.medication.name}`)).toEqual([
      '08:00 Dazatynib',
      '08:00 Nilotynib',
      '20:00 Nilotynib',
    ]);
  });

  it('attaches the matching intake', () => {
    const intake: Intake = {
      id: 'i1',
      medicationId: 'Dazatynib',
      scheduledAt: localDateTime(day, '08:00'),
      status: 'taken',
      confirmedAt: localDateTime(day, '08:10'),
    };
    const doses = dosesForDay(meds, [intake], day);
    expect(doses[0]?.intake).toBe(intake);
    expect(doses[1]?.intake).toBeUndefined();
    expect(progress(doses)).toEqual({ done: 1, total: 3 });
  });

  it('lists as-needed medications separately', () => {
    expect(asNeededForDay(meds, day).map((m) => m.name)).toEqual(['Ibuprom']);
  });
});

describe('localDateTime', () => {
  it('uses local time', () => {
    expect(new Date(localDateTime(day, '08:05')).getHours()).toBe(8);
    expect(new Date(localDateTime(day, '08:05')).getDate()).toBe(3);
  });
});
