import type { PhotoCategory, PhotoMeta, PhotoSeries } from '@ez/shared';

export const CATEGORY_LABEL: Record<PhotoCategory, string> = {
  skin: 'Skóra',
  wound: 'Rana',
  swelling: 'Obrzęk',
  other: 'Inne',
};

/** Wymiary po zmniejszeniu: dłuższy bok ≤ `max`, proporcje zachowane, bez powiększania. */
export function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export interface PhotoGroup<T extends PhotoMeta = PhotoMeta> {
  series: PhotoSeries | undefined;
  photos: T[];
}

/** Grupy: serie (od ostatnio uzupełnianej), na końcu zdjęcia bez serii; w grupie od najstarszego. */
export function groupBySeries<T extends PhotoMeta>(
  photos: T[],
  series: PhotoSeries[],
): PhotoGroup<T>[] {
  const byId = new Map(series.map((s) => [s.id, s]));
  const groups = new Map<string, PhotoGroup<T>>();
  for (const p of photos) {
    const s = p.seriesId ? byId.get(p.seriesId) : undefined;
    const key = s?.id ?? '';
    const g = groups.get(key) ?? { series: s, photos: [] };
    g.photos.push(p);
    groups.set(key, g);
  }
  const latest = (g: PhotoGroup<T>) =>
    g.photos.reduce((m, p) => (p.takenAt > m ? p.takenAt : m), '');
  for (const g of groups.values()) g.photos.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  return [...groups.values()].sort((a, b) => {
    if (!a.series !== !b.series) return a.series ? -1 : 1;
    return latest(b).localeCompare(latest(a));
  });
}
