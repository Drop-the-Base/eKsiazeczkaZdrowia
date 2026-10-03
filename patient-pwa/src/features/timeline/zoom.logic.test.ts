import { describe, expect, it } from 'vitest';
import { anchoredScroll, clampZoom, maxZoom, revealScroll } from './zoom.logic';

const month = { from: '2026-09-04', to: '2026-10-03' };

describe('zoom limits', () => {
  it('fits the whole range at 1 and shows at least a week when zoomed in', () => {
    expect(maxZoom(month)).toBeCloseTo(30 / 7);
    expect(maxZoom({ from: '2026-09-28', to: '2026-10-03' })).toBe(1);
    expect(clampZoom(0.3, month)).toBe(1);
    expect(clampZoom(100, month)).toBeCloseTo(30 / 7);
    expect(clampZoom(2, month)).toBe(2);
  });
});

describe('anchoredScroll', () => {
  const g = { scrollLeft: 0, label: 100, fit: 200 };

  it('keeps the point under the cursor in place', () => {
    // Kursor na środku toru (x = 200 → 50% toru); po 2× ten punkt jest na 200 px toru.
    const s = anchoredScroll(g, 200, 1, 2);
    expect(s).toBe(100);
    const at = (s + 200 - g.label) / (g.fit * 2);
    expect(at).toBe(0.5);
  });

  it('treats a point over the labels as the start of the track and never goes below 0', () => {
    expect(anchoredScroll(g, 20, 1, 3)).toBe(0);
    expect(anchoredScroll({ ...g, scrollLeft: 300 }, 150, 4, 1)).toBe(37.5);
    expect(anchoredScroll({ ...g, scrollLeft: 10 }, 400, 4, 1)).toBe(0);
  });
});

describe('revealScroll', () => {
  const g = { scrollLeft: 400, label: 100, fit: 300 };

  it('leaves a visible item alone', () => {
    expect(revealScroll(g, 400, 550, 560)).toBeUndefined();
  });

  it('centres an item hidden under the labels or off screen', () => {
    // Środek toru w widoku: 100 + 300/2 = 250 px od lewej krawędzi.
    expect(revealScroll(g, 400, 420, 430)).toBe(175);
    expect(revealScroll(g, 400, 1200, 1210)).toBe(955);
    expect(revealScroll(g, 400, 100, 110)).toBe(0);
  });
});
