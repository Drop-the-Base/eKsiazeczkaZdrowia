import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '@ez/shared';
import { sectionTabs, targetOf } from './sections.logic';

const s = createDemoSnapshot('2026-10-03T18:00:00.000Z');

describe('section tabs', () => {
  it('counts the demo data and greys out empty sections', () => {
    const tabs = Object.fromEntries(sectionTabs(s).map((t) => [t.id, t]));
    expect(tabs.summary).toMatchObject({ disabled: false, count: undefined });
    expect(tabs.meds).toMatchObject({ count: 4, disabled: false });
    expect(tabs.exams).toMatchObject({ count: 3, disabled: false });
    expect(tabs.photos).toMatchObject({ count: 0, disabled: true });
  });

  it('marks sections the patient did not share', () => {
    const tabs = sectionTabs({ ...s, exams: [], omitted: ['exams'] });
    expect(tabs.find((t) => t.id === 'exams')).toMatchObject({ omitted: true, disabled: true });
  });

  it('sends summary clicks to the right section', () => {
    expect(targetOf({ entity: 'exam', id: 'e' })).toBe('exams');
    expect(targetOf({ entity: 'photo', id: 'p' })).toBe('photos');
    expect(targetOf({ entity: 'symptom', id: 's' })).toBe('timeline');
    expect(targetOf({ entity: 'medication', id: 'm' })).toBe('timeline');
  });
});
