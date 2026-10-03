import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DateRange, TimelineRef } from '@ez/shared';
import {
  anchoredScroll,
  clampZoom,
  maxZoom,
  revealScroll,
  ZOOM_STEP,
  type ScrollGeometry,
} from './zoom.logic';

/** Odstęp za torem (px, `padding-right` treści) – znaczniki z dziś nie są ucięte o połowę. */
export const TRACK_END_PAD = 10;

function geometry(el: HTMLElement): ScrollGeometry {
  const label = parseFloat(getComputedStyle(el).getPropertyValue('--tl-label')) || 0;
  return { scrollLeft: el.scrollLeft, label, fit: el.clientWidth - label - TRACK_END_PAD };
}

const distance = (t: TouchList) =>
  Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);

/**
 * Skala i przewijanie osi czasu: pinch, Ctrl/⌘ + kółko, przyciski. Punkt pod palcem / kursorem
 * zostaje na miejscu. Nowy zakres → skala „dopasuj” i widok na dziś (prawa krawędź).
 */
export function useTimelineZoom(range: DateRange, highlight: TimelineRef | undefined) {
  const key = `${range.from}|${range.to}`;
  const [state, setState] = useState({ key, zoom: 1 });
  const zoom = state.key === key ? state.zoom : 1;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const live = useRef({ key, zoom, range });
  live.current = { key, zoom, range };
  const pendingScroll = useRef<number | null>(null);

  /** `anchorX` – px od lewej krawędzi kontenera; domyślnie środek toru. */
  const zoomTo = useCallback((next: number, anchorX?: number) => {
    const el = scrollerRef.current;
    const { key: k, zoom: from, range: r } = live.current;
    const to = clampZoom(next, r);
    if (!el || to === from) return;
    const g = geometry(el);
    pendingScroll.current = anchoredScroll(g, anchorX ?? g.label + g.fit / 2, from, to);
    live.current.zoom = to;
    setState({ key: k, zoom: to });
  }, []);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el && pendingScroll.current !== null) el.scrollLeft = pendingScroll.current;
    pendingScroll.current = null;
  }, [zoom]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [key]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const xOf = (clientX: number) => clientX - el.getBoundingClientRect().left;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      // Jeden ząbek kółka (~100) ≈ krok przycisku; gest trackpada (małe delty) – płynnie.
      const delta = Math.max(-100, Math.min(100, e.deltaY));
      zoomTo(live.current.zoom * Math.exp(-delta * 0.005), xOf(e.clientX));
    };

    let pinch: { distance: number; zoom: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      pinch =
        e.touches.length === 2 ? { distance: distance(e.touches), zoom: live.current.zoom } : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const mid = (e.touches[0]!.clientX + e.touches[1]!.clientX) / 2;
      zoomTo((pinch.zoom * distance(e.touches)) / pinch.distance, xOf(mid));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [zoomTo]);

  // Podświetlona pozycja poza widokiem (np. kliknięta w podsumowaniu u lekarza) → przewiń do niej.
  useEffect(() => {
    const el = scrollerRef.current;
    const item = el?.querySelector<HTMLElement>('[data-highlighted]');
    if (!el || !item) return;
    const box = el.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const left = r.left - box.left + el.scrollLeft;
    const target = revealScroll(geometry(el), el.clientWidth, left, left + r.width);
    if (target !== undefined) el.scrollTo({ left: target, behavior: 'smooth' });
  }, [highlight]);

  return {
    zoom,
    scrollerRef,
    zoomIn: () => zoomTo(zoom * ZOOM_STEP),
    zoomOut: () => zoomTo(zoom / ZOOM_STEP),
    canZoomIn: zoom < maxZoom(range) - 1e-6,
    canZoomOut: zoom > 1,
  };
}
