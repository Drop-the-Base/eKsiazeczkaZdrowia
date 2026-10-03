import { useMemo, useState } from 'react';
import type { ShareSnapshot, TimelineData, TimelineRef } from '@ez/shared';
import { HistoryTabs } from './HistoryTabs';
import { SinceLastVisit } from './SinceLastVisit';
import { TimelineStandIn } from './TimelineStandIn';
import { RANGE_PRESETS, rangeFor, type RangePreset } from './timeline.logic';
import styles from './Right.module.css';

export function RightColumn({ snapshot }: { snapshot: ShareSnapshot }) {
  const [preset, setPreset] = useState<RangePreset>('treatment');
  const [highlight, setHighlight] = useState<TimelineRef>();
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
      <SinceLastVisit snapshot={snapshot} onSelect={setHighlight} />
      <section className={styles.timelineBox} aria-label="Oś czasu">
        <div className={styles.timelineHead}>
          <h2 className={styles.title}>Oś czasu</h2>
          <div className={styles.presets}>
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === preset}
                className={
                  p.id === preset ? `${styles.preset} ${styles.presetActive}` : styles.preset
                }
                onClick={() => setPreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <TimelineStandIn data={data} range={range} highlight={highlight} onSelect={setHighlight} />
      </section>
      <HistoryTabs snapshot={snapshot} />
    </>
  );
}
