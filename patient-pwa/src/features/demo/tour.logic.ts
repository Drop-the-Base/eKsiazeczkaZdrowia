/** Where the visitor is in the guide; kept per tab, so a reload does not start from the beginning. */
export interface TourState {
  index: number;
  open: boolean;
}

export const INITIAL_TOUR: TourState = { index: 0, open: true };

export function clampIndex(index: number, total: number): number {
  return Math.min(Math.max(Math.round(index), 0), total - 1);
}

/** Saved state from storage – anything malformed means "start from the beginning". */
export function parseTourState(raw: string | null, total: number): TourState {
  if (!raw) return INITIAL_TOUR;
  try {
    const v: unknown = JSON.parse(raw);
    if (
      typeof v === 'object' &&
      v !== null &&
      'index' in v &&
      'open' in v &&
      typeof v.index === 'number' &&
      typeof v.open === 'boolean'
    ) {
      return { index: clampIndex(v.index, total), open: v.open };
    }
  } catch {
    // not JSON – fall through to the start
  }
  return INITIAL_TOUR;
}
