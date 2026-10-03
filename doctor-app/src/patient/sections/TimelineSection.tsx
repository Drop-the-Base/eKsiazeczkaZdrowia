import { useEffect, useMemo, useState } from 'react';
import type { ShareSnapshot, TimelineData, TimelineRef } from '@ez/shared';
import { Timeline } from '@pwa-timeline';
import { RANGE_PRESETS, rangeFor, type RangePreset } from './timeline.logic';
import { TimelineDetails } from './TimelineDetails';
import styles from './Sections.module.css';

type Props = {
  snapshot: ShareSnapshot;
  highlight?: TimelineRef;
  onSelect: (ref: TimelineRef) => void;
};

/** Full-width timeline (A's `<Timeline>`) with range presets and element details. */
export function TimelineSection({ snapshot, highlight, onSelect }: Props) {
  const [preset, setPreset] = useState<RangePreset>('treatment');
  const [selected, setSelected] = useState<TimelineRef | undefined>(highlight);

  useEffect(() => {
    if (highlight) setSelected(highlight);
  }, [highlight]);

  const handleSelect = (ref: TimelineRef) => {
    setSelected(ref);
    onSelect(ref);
  };

  const handleClose = () => {
    setSelected(undefined);
  };

  const data: TimelineData = useMemo(
    () => ({
      ...snapshot,
      photos: snapshot.photos.map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        category: p.category,
        thumbnailUrl: p.thumbnailDataUrl,
      })),
    }),
    [snapshot],
  );
  const range = rangeFor(preset, data, snapshot.createdAt.slice(0, 10));

  return (
    <>
      <div className={styles.presets}>
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={p.id === preset}
            className={p.id === preset ? `${styles.preset} ${styles.presetActive}` : styles.preset}
            onClick={() => setPreset(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Timeline data={data} range={range} highlight={highlight || selected} onSelect={handleSelect} />
      {selected && <TimelineDetails selected={selected} data={data} onClose={handleClose} />}
    </>
  );
}
