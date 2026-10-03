import type { CSSProperties } from 'react';
import type { TimelineProps } from '@ez/shared';
import { EventTracks } from './EventTracks';
import { MedicationTracks } from './MedicationTracks';
import type { Grid } from './parts';
import { axisTicks, visitMarks } from './timeline.logic';
import { useTimelineZoom } from './useTimelineZoom';
import styles from './Timeline.module.css';

/**
 * Oś czasu: tory leków (grupy jak u lekarza), pod spodem badania, objawy, wizyty (też jako
 * pionowe linie przez całą oś), zdjęcia i dokumenty. Przewijana w poziomie i przybliżana
 * (pinch, Ctrl/⌘ + kółko, „+” / „−”); kolumna etykiet zostaje na miejscu.
 * Czysty komponent (tylko props) – używa go też aplikacja lekarza. Bez interpretacji i ostrzeżeń.
 */
export function Timeline({ data, range, highlight, onSelect }: TimelineProps) {
  const z = useTimelineZoom(range, highlight);
  const ticks = axisTicks(range, z.zoom);
  const grid: Grid = {
    ticks,
    visits: visitMarks(data.visits, range).map((v) => v.left),
    zoom: z.zoom,
  };

  return (
    <div className={styles.timeline} role="group" aria-label="Oś czasu">
      <div className={styles.zoom}>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={z.zoomOut}
          disabled={!z.canZoomOut}
          aria-label="Oddal oś czasu"
          data-tour="timeline-zoom-out"
        >
          −
        </button>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={z.zoomIn}
          disabled={!z.canZoomIn}
          aria-label="Przybliż oś czasu"
          data-tour="timeline-zoom-in"
        >
          +
        </button>
      </div>
      <div className={styles.scroller} ref={z.scrollerRef} data-tour="timeline-scroller">
        <div className={styles.content} style={{ '--tl-zoom': z.zoom } as CSSProperties}>
          <div className={styles.row}>
            <span className={styles.axisCorner} />
            <div className={styles.axis}>
              {ticks.map((t) => (
                <span key={t.left} className={styles.tick} style={{ left: `${t.left}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <MedicationTracks
            medications={data.medications}
            intakes={data.intakes}
            range={range}
            grid={grid}
            highlight={highlight}
            onSelect={onSelect}
          />
          <EventTracks
            data={data}
            range={range}
            grid={grid}
            highlight={highlight}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
