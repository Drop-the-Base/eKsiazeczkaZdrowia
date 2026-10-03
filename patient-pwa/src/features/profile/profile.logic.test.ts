import { describe, expect, it } from 'vitest';
import { addAllergy, ageOn, validateProfile } from './profile.logic';

describe('ageOn', () => {
  it('counts full years', () => {
    expect(ageOn('1968-04-02', '2026-10-03')).toBe(58);
    expect(ageOn('1968-10-04', '2026-10-03')).toBe(57);
    expect(ageOn('1968-10-03', '2026-10-03')).toBe(58);
  });
});

describe('validateProfile', () => {
  const ok = { name: 'Anna', birthDate: '1968-04-02', bloodType: '', allergies: [] };

  it('accepts a valid profile', () => {
    expect(validateProfile(ok, '2026-10-03')).toEqual({});
  });

  it('requires name and a past birth date', () => {
    expect(validateProfile({ ...ok, name: '  ' }, '2026-10-03').name).toBeDefined();
    expect(validateProfile({ ...ok, birthDate: '' }, '2026-10-03').birthDate).toBeDefined();
    expect(
      validateProfile({ ...ok, birthDate: '2027-01-01' }, '2026-10-03').birthDate,
    ).toBeDefined();
  });
});

describe('addAllergy', () => {
  it('trims and skips empty or duplicate entries', () => {
    expect(addAllergy([], '  penicylina ')).toEqual(['penicylina']);
    expect(addAllergy(['penicylina'], 'Penicylina')).toEqual(['penicylina']);
    expect(addAllergy(['penicylina'], '   ')).toEqual(['penicylina']);
    expect(addAllergy(['penicylina'], 'orzechy')).toEqual(['penicylina', 'orzechy']);
  });
});
