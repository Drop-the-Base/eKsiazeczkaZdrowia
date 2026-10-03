import { useEffect, useState } from 'react';
import type { Photo } from '@ez/shared';
import { makeThumbnail } from './thumbnails';

export type ThumbnailsState =
  | { status: 'loading' }
  | { status: 'ready'; thumbnails: ReadonlyMap<string, string>; failed: number };

/** Downscales all photos once; a photo that cannot be decoded is skipped and counted. */
export function useThumbnails(photos: Photo[] | undefined): ThumbnailsState {
  const [state, setState] = useState<ThumbnailsState>({ status: 'loading' });
  const key = photos?.map((p) => p.id).join(',');

  useEffect(() => {
    if (!photos) return;
    let cancelled = false;
    setState({ status: 'loading' });
    void Promise.allSettled(
      photos.map(async (p) => [p.id, await makeThumbnail(p.blob)] as const),
    ).then((results) => {
      if (cancelled) return;
      const thumbnails = new Map<string, string>();
      for (const r of results) if (r.status === 'fulfilled') thumbnails.set(r.value[0], r.value[1]);
      setState({ status: 'ready', thumbnails, failed: photos.length - thumbnails.size });
    });
    return () => {
      cancelled = true;
    };
    // Recompute only when the set of photos changes, not on every live-query refresh.
  }, [key]);

  return state;
}
