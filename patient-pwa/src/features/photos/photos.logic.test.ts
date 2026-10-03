import type { PhotoMeta, PhotoSeries } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { fitWithin, groupBySeries } from './photos.logic';

describe('fitWithin', () => {
  it('scales the longer side down and never up', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1000, 3000, 1600)).toEqual({ width: 533, height: 1600 });
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('groupBySeries', () => {
  const series: PhotoSeries[] = [
    { id: 's1', name: 'Wysypka', createdAt: '2026-09-01T10:00:00Z' },
    { id: 's2', name: 'Kolano', createdAt: '2026-08-01T10:00:00Z' },
  ];
  const p = (id: string, takenAt: string, seriesId?: string): PhotoMeta => ({
    id,
    takenAt,
    category: 'skin',
    seriesId,
  });

  it('series first (most recently updated), loose photos last, oldest first inside', () => {
    const groups = groupBySeries(
      [
        p('a', '2026-09-02T10:00:00Z', 's1'),
        p('b', '2026-09-01T10:00:00Z', 's1'),
        p('c', '2026-09-20T10:00:00Z', 's2'),
        p('d', '2026-09-30T10:00:00Z'),
      ],
      series,
    );
    expect(groups.map((g) => g.series?.name ?? '-')).toEqual(['Kolano', 'Wysypka', '-']);
    expect(groups[1]!.photos.map((x) => x.id)).toEqual(['b', 'a']);
  });
});
