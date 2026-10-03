import { useLayoutEffect, useState } from 'react';

export interface Spot {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Below the top bar: the lit element is scrolled to just under it. */
const TARGET_TOP = 80;

function spotOf(target: string): Spot | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null; // hidden section
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const same = (a: Spot | null, b: Spot | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height));

/**
 * Position of the `data-tour` element, measured every frame before paint: the light appears together
 * with the element (which renders a moment after the data arrives) and never travels. `key` restarts it.
 */
export function useSpot(target: string | undefined, key: unknown): Spot | null {
  const [spot, setSpot] = useState<Spot | null>(null);
  useLayoutEffect(() => {
    setSpot(null);
    if (!target) return;
    let scrolled = false;
    let frame = 0;
    const tick = () => {
      let next = spotOf(target);
      if (next && !scrolled) {
        scrolled = true;
        window.scrollBy({ top: next.top - TARGET_TOP, behavior: 'instant' });
        next = spotOf(target);
      }
      setSpot((prev) => (same(prev, next) ? prev : next));
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [target, key]);
  return spot;
}
