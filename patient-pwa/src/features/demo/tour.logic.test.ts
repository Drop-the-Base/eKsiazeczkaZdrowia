import { describe, expect, it } from 'vitest';
import { STEPS } from './steps';
import { clampIndex, INITIAL_TOUR, isEditableTarget, parseTourState } from './tour.logic';

describe('clampIndex', () => {
  it('keeps the index inside the steps', () => {
    expect(clampIndex(-1, 5)).toBe(0);
    expect(clampIndex(7, 5)).toBe(4);
    expect(clampIndex(2, 5)).toBe(2);
  });
});

describe('parseTourState', () => {
  it('reads a saved state', () => {
    expect(parseTourState('{"index":3,"open":false}', 10)).toEqual({ index: 3, open: false });
  });

  it('starts over on anything malformed', () => {
    expect(parseTourState(null, 10)).toEqual(INITIAL_TOUR);
    expect(parseTourState('nope', 10)).toEqual(INITIAL_TOUR);
    expect(parseTourState('{"index":"3","open":true}', 10)).toEqual(INITIAL_TOUR);
  });

  it('clamps an index from an older, longer guide', () => {
    expect(parseTourState('{"index":40,"open":true}', 10).index).toBe(9);
  });
});

describe('STEPS', () => {
  it('starts and ends with a whole-screen card', () => {
    expect(STEPS[0]?.full).toBe(true);
    expect(STEPS.at(-1)?.full).toBe(true);
  });

  it('has unique ids and an in-app path for every inner step', () => {
    expect(new Set(STEPS.map((s) => s.id)).size).toBe(STEPS.length);
    for (const s of STEPS.slice(1, -1)) expect(s.path).toMatch(/^\//);
  });
});

describe('isEditableTarget', () => {
  it('returns false for null or non-element targets', () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({} as unknown as EventTarget)).toBe(false);
  });

  it('detects input, textarea, and select elements', () => {
    expect(isEditableTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'textarea' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'SELECT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'DIV' } as unknown as EventTarget)).toBe(false);
  });

  it('detects contentEditable elements', () => {
    expect(
      isEditableTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget),
    ).toBe(true);
  });

  it('detects elements nested inside input/editable containers', () => {
    const nestedInEditable = {
      tagName: 'SPAN',
      closest: (sel: string) => sel.includes('contenteditable'),
    };
    expect(isEditableTarget(nestedInEditable as unknown as EventTarget)).toBe(true);

    const normalSpan = {
      tagName: 'SPAN',
      closest: () => null,
    };
    expect(isEditableTarget(normalSpan as unknown as EventTarget)).toBe(false);
  });
});
