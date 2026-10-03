import { useMemo, useState } from 'react';
import type { ShareSection } from '@ez/shared';
import { todayIso } from '../../ui';
import { buildShareSnapshot, defaultSince, earliestDate, SECTIONS } from './share.logic';
import { useShareData } from './useShareData';

const ALL = new Set<ShareSection>(SECTIONS.map((s) => s.id));
const NO_THUMBNAILS = new Map<string, string>();

/** Summary preview state: which sections go to the doctor and the resulting snapshot. */
export function useShareSummary() {
  const live = useShareData();
  const [sections, setSections] = useState<ReadonlySet<ShareSection>>(ALL);
  // Fixed for the lifetime of the screen, so the preview does not change under the patient's finger.
  const [now] = useState(() => new Date().toISOString());

  const built = useMemo(() => {
    if (live.status !== 'ready' || !live.data.profile) return undefined;
    const { profile, data } = live.data;
    const base = {
      profile,
      data,
      since: defaultSince(data.visits, now),
      range: { from: earliestDate(data, todayIso()), to: todayIso() },
      // TODO(B17): downscaled photos.
      thumbnails: NO_THUMBNAILS,
      now,
    };
    return {
      since: base.since,
      full: buildShareSnapshot({ ...base, sections: ALL }),
      selected: buildShareSnapshot({ ...base, sections }),
      photoCount: data.photos.length,
    };
  }, [live, sections, now]);

  const toggle = (section: ShareSection, on: boolean) =>
    setSections((prev) => {
      const next = new Set(prev);
      if (on) next.add(section);
      else next.delete(section);
      return next;
    });

  return {
    status:
      live.status === 'loading'
        ? ('loading' as const)
        : built
          ? ('ready' as const)
          : ('no-profile' as const),
    sections,
    toggle,
    ...built,
  };
}
