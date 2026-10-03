import { describe, expect, it } from 'vitest';
import type { DrugEntry } from '../drugs';
import {
  applyPick,
  doseFromStrength,
  emptyMedForm,
  toggleTime,
  toMedicationFields,
  validateMedForm,
} from './medForm.logic';

const ibuprom: DrugEntry = {
  rplId: '100197985',
  name: 'Ibuprom',
  activeSubstance: 'Ibuprofenum',
  strength: '200 mg',
  form: 'Tabletki powlekane',
  atcCode: 'M01AE01',
  otc: true,
};

describe('doseFromStrength', () => {
  it('uses simple strengths and falls back for combined ones', () => {
    expect(doseFromStrength('200 mg')).toEqual({ dose: '200', unit: 'mg' });
    expect(doseFromStrength('2,5 mg')).toEqual({ dose: '2.5', unit: 'mg' });
    expect(doseFromStrength('200 mg + 30 mg')).toEqual({ dose: '1', unit: 'tabl.' });
  });
});

describe('applyPick', () => {
  const base = emptyMedForm('2026-10-03');

  it('fills drug data and suggests OTC group', () => {
    const form = applyPick(base, { drug: ibuprom, name: 'Ibuprom' });
    expect(form).toMatchObject({
      name: 'Ibuprom',
      rplId: '100197985',
      atcCode: 'M01AE01',
      category: 'otc',
      dose: '200',
      unit: 'mg',
    });
  });

  it('free text becomes a supplement without RPL data', () => {
    const fromDrug = applyPick(base, { drug: ibuprom, name: 'Ibuprom' });
    const form = applyPick(fromDrug, { name: 'Suplement z grzybów' });
    expect(form).toMatchObject({ name: 'Suplement z grzybów', category: 'supplement' });
    expect(form.rplId).toBeUndefined();
    expect(form.atcCode).toBeUndefined();
  });
});

describe('validateMedForm', () => {
  const ok = { ...emptyMedForm('2026-10-03'), name: 'Ibuprom', dose: '200', unit: 'mg' };

  it('accepts a valid form', () => {
    expect(validateMedForm(ok)).toEqual({});
    expect(validateMedForm({ ...ok, scheduleType: 'asNeeded', times: [] })).toEqual({});
  });

  it('reports missing fields and bad ranges', () => {
    const errors = validateMedForm({
      ...ok,
      name: '',
      dose: ' ',
      times: [],
      endDate: '2026-01-01',
    });
    expect(Object.keys(errors).sort()).toEqual(['dose', 'endDate', 'name', 'times']);
  });
});

describe('toMedicationFields / toggleTime', () => {
  it('builds the schedule and drops empty end date', () => {
    const fields = toMedicationFields({
      ...emptyMedForm('2026-10-03'),
      name: ' Ibuprom ',
      dose: '200',
      unit: 'mg',
      times: ['20:00', '08:00'],
    });
    expect(fields.name).toBe('Ibuprom');
    expect(fields.schedule).toEqual({ type: 'daily', times: ['08:00', '20:00'] });
    expect(fields.endDate).toBeUndefined();
  });

  it('toggles times keeping them sorted', () => {
    expect(toggleTime(['08:00'], '20:00')).toEqual(['08:00', '20:00']);
    expect(toggleTime(['08:00', '20:00'], '08:00')).toEqual(['20:00']);
  });
});
