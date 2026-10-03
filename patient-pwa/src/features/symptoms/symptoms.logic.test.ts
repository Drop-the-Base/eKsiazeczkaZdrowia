import { describe, expect, it } from 'vitest';
import { startedAtFor, validateSymptom } from './symptoms.logic';

const now = new Date(2026, 9, 3, 18, 30);

describe('startedAtFor', () => {
  it('maps quick choices to local times', () => {
    expect(startedAtFor('now', now)).toBe(now.toISOString());
    expect(new Date(startedAtFor('morning', now)!).getHours()).toBe(7);
    const y = new Date(startedAtFor('yesterday', now)!);
    expect([y.getDate(), y.getHours()]).toEqual([2, 12]);
  });

  it('parses custom datetime-local and rejects empty', () => {
    expect(new Date(startedAtFor('custom', now, '2026-10-01T09:15')!).getHours()).toBe(9);
    expect(startedAtFor('custom', now, '')).toBeNull();
  });
});

describe('validateSymptom', () => {
  const ok = { name: 'ból głowy', when: 'now' as const, custom: '', notes: '' };

  it('accepts a valid entry', () => {
    expect(validateSymptom(ok, now)).toEqual({});
  });

  it('requires a name and a past time', () => {
    expect(validateSymptom({ ...ok, name: ' ' }, now).name).toBeDefined();
    expect(validateSymptom({ ...ok, when: 'custom', custom: '' }, now).when).toBeDefined();
    expect(
      validateSymptom({ ...ok, when: 'custom', custom: '2026-10-04T10:00' }, now).when,
    ).toBeDefined();
  });
});
