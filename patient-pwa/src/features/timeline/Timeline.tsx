import type { TimelineProps } from '@ez/shared';
import { EventTracks } from './EventTracks';
import { MedicationTracks } from './MedicationTracks';
import type { Grid } from './parts';
import { axisTicks, visitMarks } from './timeline.logic';
import styles from './Timeline.module.css';

/**
 * Oś czasu: tory leków (grupy jak u lekarza), pod spodem badania, objawy, wizyty (też jako
 * pionowe linie przez całą oś), zdjęcia i dokumenty.
 * Czysty komponent (tylko props) – używa go też aplikacja lekarza. Bez interpretacji i ostrzeżeń.
 */
export function Timeline({ data, range, highlight, onSelect }: TimelineProps) {
  const ticks = axisTicks(range);
  const grid: Grid = { ticks, visits: visitMarks(data.visits, range).map((v) => v.left) };

  return (
    <div className={styles.timeline} role="group" aria-label="Oś czasu">
      <div className={styles.row}>
        <span className={styles.label} />
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
  );
}
