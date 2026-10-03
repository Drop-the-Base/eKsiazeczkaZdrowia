import type { CSSProperties, ReactNode } from 'react';
import type { TimelineRef } from '@ez/shared';
import type { Tick } from './timeline.logic';
import styles from './Timeline.module.css';

export type Select = ((ref: TimelineRef) => void) | undefined;

export const isHighlighted = (
  h: TimelineRef | undefined,
  entity: TimelineRef['entity'],
  id: string,
) => h !== undefined && h.entity === entity && h.id === id;

export const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/** Siatka: podziałka + pionowe linie wizyt przez wszystkie tory. */
export interface Grid {
  ticks: Tick[];
  visits: number[];
  /** Skala osi (1 = cały zakres w karcie) – odstępy etykiet liczone w % toru. */
  zoom: number;
}

export function Lane({
  label,
  grid,
  children,
}: {
  label: string;
  grid: Grid;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label} title={label}>
        {label}
      </span>
      <div className={styles.track}>
        {grid.ticks.map((t) => (
          <span key={`t${t.left}`} className={styles.grid} style={{ left: `${t.left}%` }} />
        ))}
        {grid.visits.map((left) => (
          <span key={`v${left}`} className={styles.visitLine} style={{ left: `${left}%` }} />
        ))}
        {children}
      </div>
    </div>
  );
}

export function GroupHeader({ label, color }: { label: string; color?: string }) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>
        {color && <span className={styles.dot} style={{ background: color }} />}
        {label}
      </span>
    </div>
  );
}

/** Klikalny znacznik na torze (kropka, romb, miniatura). */
export function Marker({
  refTo,
  title,
  className,
  style,
  highlight,
  onSelect,
  children,
}: {
  refTo: TimelineRef;
  title: string;
  className: string | undefined;
  style: CSSProperties;
  highlight: TimelineRef | undefined;
  onSelect: Select;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx(
        className,
        isHighlighted(highlight, refTo.entity, refTo.id) && styles.highlight,
      )}
      style={style}
      data-highlighted={isHighlighted(highlight, refTo.entity, refTo.id) || undefined}
      title={title}
      aria-label={title}
      onClick={() => onSelect?.(refTo)}
    >
      {children}
    </button>
  );
}
