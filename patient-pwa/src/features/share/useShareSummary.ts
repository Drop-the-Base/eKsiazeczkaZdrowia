import { useMemo, useState } from 'react';
import { todayIso } from '../../ui';
import { buildShareSnapshot, defaultSince, earliestDate } from './share.logic';
import { useShareData } from './useShareData';
import { useThumbnails } from './useThumbnails';

/** Summary preview state: the snapshot that goes to the doctor. */
export function useShareSummary() {
  const live = useShareData();
  // Fixed for the lifetime of the screen, so the preview does not change under the patient's finger.
  const [now] = useState(() => new Date().toISOString());
  const thumbs = useThumbnails(live.status === 'ready' ? live.data.data.photos : undefined);

  const built = useMemo(() => {
    if (live.status !== 'ready' || !live.data.profile || thumbs.status !== 'ready')
      return undefined;
    const { profile, data } = live.data;
    const since = defaultSince(data.visits, now);
    return {
      since,
      snapshot: buildShareSnapshot({
        profile,
        data,
        since,
        range: { from: earliestDate(data, todayIso()), to: todayIso() },
        thumbnails: thumbs.thumbnails,
        now,
      }),
      photoCount: thumbs.thumbnails.size,
      photosFailed: thumbs.failed,
    };
  }, [live, now, thumbs]);

  return {
    status:
      live.status === 'loading'
        ? ('loading' as const)
        : built
          ? ('ready' as const)
          : ('no-profile' as const),
    ...built,
  };
}
