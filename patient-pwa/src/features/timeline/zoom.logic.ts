import type { DateRange } from '@ez/shared';
import { boundsOf } from './timeline.logic';

// Skala osi czasu: zoom = ile razy tor jest szerszy niż widoczna część karty (1 = cały zakres w karcie).

const DAY_MS = 24 * 60 * 60 * 1000;
/** Przy maksymalnym przybliżeniu na ekranie mieści się tydzień. */
export const MIN_VISIBLE_DAYS = 7;
export const ZOOM_STEP = 1.6;

export function maxZoom(range: DateRange): number {
  const b = boundsOf(range);
  return Math.max(1, (b.end - b.start) / DAY_MS / MIN_VISIBLE_DAYS);
}

export function clampZoom(zoom: number, range: DateRange): number {
  return Math.min(maxZoom(range), Math.max(1, zoom));
}

export interface ScrollGeometry {
  scrollLeft: number;
  /** Szerokość stałej kolumny etykiet (px) – tor zaczyna się za nią. */
  label: number;
  /** Szerokość toru przy zoom = 1 (px). */
  fit: number;
}

/**
 * Nowy `scrollLeft` po zmianie skali, tak żeby punkt pod palcem / kursorem (`anchorX` – px od lewej
 * krawędzi kontenera) został w tym samym miejscu.
 */
export function anchoredScroll(
  g: ScrollGeometry,
  anchorX: number,
  from: number,
  to: number,
): number {
  const x = Math.max(anchorX, g.label);
  const at = (g.scrollLeft + x - g.label) / (g.fit * from);
  return Math.max(0, at * g.fit * to + g.label - x);
}

/**
 * `scrollLeft`, przy którym element [itemLeft, itemRight] (px w układzie treści) jest na środku toru,
 * albo `undefined`, gdy już jest widoczny w całości.
 */
export function revealScroll(
  g: ScrollGeometry,
  viewWidth: number,
  itemLeft: number,
  itemRight: number,
): number | undefined {
  const viewStart = g.scrollLeft + g.label;
  const viewEnd = g.scrollLeft + viewWidth;
  if (itemLeft >= viewStart && itemRight <= viewEnd) return undefined;
  const center = g.label + (viewWidth - g.label) / 2;
  return Math.max(0, (itemLeft + itemRight) / 2 - center);
}
