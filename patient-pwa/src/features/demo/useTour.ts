import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { runShowMe } from './showMe';
import { STEPS } from './steps';
import { clampIndex, parseTourState, type TourState } from './tour.logic';

const STORAGE_KEY = 'demo-tour';
/** Below the page header: the lit element should not hide under the bottom card. */
const TARGET_TOP = 72;

export interface Spot {
  top: number;
  left: number;
  width: number;
  height: number;
}

function loadState(): TourState {
  if (new URLSearchParams(window.location.search).has('bez-przewodnika')) {
    return { index: 0, open: false };
  }
  try {
    return parseTourState(sessionStorage.getItem(STORAGE_KEY), STEPS.length);
  } catch {
    return parseTourState(null, STEPS.length); // storage blocked: start from the beginning
  }
}

function saveState(state: TourState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // not remembered – after a reload the guide starts over, which is harmless
  }
}

function spotOf(target: string | undefined): Spot | null {
  const el = target ? document.querySelector(`[data-tour="${target}"]`) : null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

const sameSpot = (a: Spot | null, b: Spot | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height));

/** The guide: current step, opening its screen, the lit element and "Pokaż mi". */
export function useTour() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState<TourState>(loadState);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [showing, setShowing] = useState(false);
  const [error, setError] = useState<string>();
  const step = STEPS[state.index] ?? STEPS[0]!;

  useEffect(() => saveState(state), [state]);

  // Open the step's screen once per step (the visitor may wander off afterwards).
  useEffect(() => {
    if (state.open && step.path) navigate(step.path);
  }, [state.open, step, navigate]);

  // Follow the lit element: it appears after its data loads and moves with scrolling.
  // Layout effect: measured before the new screen is painted, so screen and light appear together.
  useLayoutEffect(() => {
    setSpot(null);
    // Wait for the step's screen: the previous one may have an element with the same name.
    const onScreen = !step.path || pathname === step.path;
    if (!state.open || !step.target || !onScreen) return;
    let scrolled = false;
    const tick = () => {
      let next = spotOf(step.target);
      if (next && !scrolled) {
        // Instant, so the light appears straight in its place instead of travelling there.
        scrolled = true;
        window.scrollBy({ top: next.top - TARGET_TOP, behavior: 'instant' });
        next = spotOf(step.target);
      }
      setSpot((prev) => (sameSpot(prev, next) ? prev : next));
    };
    // Every frame: the light shows up in the same paint as the element (data loads a moment later).
    let frame = 0;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [state.open, step, pathname]);

  const go = useCallback((index: number) => {
    setError(undefined);
    setState({ index: clampIndex(index, STEPS.length), open: true });
  }, []);

  const showMe = async () => {
    if (!step.showMe) return;
    setShowing(true);
    setError(undefined);
    try {
      await runShowMe(step.showMe);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się wykonać demonstracji. Wykonaj ten krok ręcznie.',
      );
    } finally {
      setShowing(false);
    }
  };

  return {
    step,
    index: state.index,
    total: STEPS.length,
    open: state.open,
    spot,
    showing,
    error,
    next: () => go(state.index + 1),
    back: () => go(state.index - 1),
    go,
    close: () => setState((s) => ({ ...s, open: false })),
    reopen: () => setState((s) => ({ ...s, open: true })),
    showMe: () => showMe(),
  };
}
