import { useEffect, useRef } from 'react';
import type { TimelineProps } from '@ez/shared';
import { formatDate } from '../../format';
import { describeDose, MED_GROUPS } from '../patient.logic';
import { buildEvents, groupByDay, medsInRange, sameRef } from './timeline.logic';
import styles from './Right.module.css';

const KIND_LABEL = {
  medStart: 'lek',
  medStop: 'lek',
  exam: 'badanie',
  symptom: 'objaw',
  visit: 'wizyta',
  photo: 'zdjęcie',
  document: 'dokument',
} as const;

const groupColor = (category: string) => MED_GROUPS.find((g) => g.category === category)?.color;

/**
 * Stand-in for A's `<Timeline>` (same props): medication bars over the range, then events by day.
 * Swapped for the real component once A18/A19 land.
 */
export function TimelineStandIn({ data, range, highlight, onSelect }: TimelineProps) {
  const events = buildEvents(data, range);
  const meds = medsInRange(data.medications, range);
  const span = Math.max(1, Date.parse(range.to) - Date.parse(range.from));
  const pos = (day: string) =>
    Math.min(100, Math.max(0, ((Date.parse(day) - Date.parse(range.from)) / span) * 100));
  const highlighted = useRef<HTMLLIElement>(null);

  useEffect(() => {
    highlighted.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlight]);

  return (
    <div className={styles.timeline}>
      <ul className={styles.bars} aria-label="Leki w tym okresie">
        {meds.map((m) => {
          const left = pos(m.startDate);
          const right = m.endDate ? pos(m.endDate) : 100;
          return (
            <li
              key={m.id}
              className={
                sameRef(highlight, { entity: 'medication', id: m.id }) ? styles.hl : undefined
              }
            >
              <button
                type="button"
                className={styles.barLabel}
                onClick={() => onSelect?.({ entity: 'medication', id: m.id })}
              >
                {m.name} {describeDose(m)}
              </button>
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(1, right - left)}%`,
                    background: groupColor(m.category),
                  }}
                  title={`${formatDate(m.startDate)} – ${m.endDate ? formatDate(m.endDate) : 'nadal'}`}
                />
              </span>
            </li>
          );
        })}
      </ul>
      <ol className={styles.days}>
        {groupByDay(events).map((g) => (
          <li key={g.day} className={styles.day}>
            <span className={styles.date}>{formatDate(g.day)}</span>
            <ul className={styles.events}>
              {g.events.map((e) => {
                const isHl = sameRef(highlight, e.ref);
                return (
                  <li
                    key={`${e.kind}-${e.ref.id}`}
                    ref={isHl ? highlighted : undefined}
                    className={isHl ? styles.hl : undefined}
                  >
                    <button
                      type="button"
                      className={styles.event}
                      onClick={() => onSelect?.(e.ref)}
                    >
                      <span className={styles.kind} data-kind={e.kind}>
                        {KIND_LABEL[e.kind]}
                      </span>
                      {e.thumbnailUrl && (
                        <img className={styles.thumb} src={e.thumbnailUrl} alt="" />
                      )}
                      <span className={e.outOfRange ? styles.strong : undefined}>{e.title}</span>
                      {e.detail && <span className={styles.detail}>{e.detail}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
