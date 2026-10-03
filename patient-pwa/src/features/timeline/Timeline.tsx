import type { ReactNode } from 'react';
import type { MedicationCategory, TimelineProps, TimelineRef } from '@ez/shared';
import { formatDate, formatDateTime } from '../../ui/format';
import { CATEGORY_LABEL } from '../meds/meds.logic';
import { axisTicks, medicationLanes, type Tick } from './timeline.logic';
import styles from './Timeline.module.css';

/** Kolory grup z fallbackiem – komponent działa też w aplikacji lekarza (bez `ui/tokens.css`). */
const GROUP_COLOR: Record<MedicationCategory, string> = {
  prescription: 'var(--color-rx, #2563eb)',
  otc: 'var(--color-otc, #d97706)',
  supplement: 'var(--color-supplement, #7c3aed)',
};

const isHighlighted = (h: TimelineRef | undefined, entity: TimelineRef['entity'], id: string) =>
  h !== undefined && h.entity === entity && h.id === id;

/**
 * Oś czasu: jeden tor na lek, pod spodem badania, objawy, wizyty i zdjęcia (A19).
 * Czysty komponent (tylko props) – używa go też aplikacja lekarza. Bez interpretacji i ostrzeżeń.
 */
export function Timeline({ data, range, highlight, onSelect }: TimelineProps) {
  const ticks = axisTicks(range);
  const lanes = medicationLanes(data.medications, range, data.intakes);
  let lastCategory: MedicationCategory | undefined;

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

      {lanes.length === 0 && <p className={styles.empty}>Brak leków w tym okresie</p>}

      {lanes.map((lane) => {
        const header = lane.category !== lastCategory;
        lastCategory = lane.category;
        const color = GROUP_COLOR[lane.category];
        return (
          <div key={lane.key}>
            {header && (
              <div className={styles.group}>
                <span className={styles.dot} style={{ background: color }} />
                {CATEGORY_LABEL[lane.category]}
              </div>
            )}
            <div className={styles.row}>
              <span className={styles.label} title={lane.label}>
                {lane.label}
              </span>
              <Track ticks={ticks}>
                {lane.bars.map((bar) => {
                  const m = bar.medication;
                  const title = [
                    `${m.name} ${bar.label}`,
                    `${formatDate(m.startDate)} – ${m.endDate ? formatDate(m.endDate) : 'nadal'}`,
                    m.stopReason,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={[
                        styles.bar,
                        bar.ongoing && styles.ongoing,
                        bar.asNeeded && styles.asNeeded,
                        isHighlighted(highlight, 'medication', m.id) && styles.highlight,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ left: `${bar.left}%`, width: `${bar.width}%`, background: color }}
                      title={title}
                      aria-label={title}
                      onClick={() => onSelect?.({ entity: 'medication', id: m.id })}
                    >
                      {!bar.asNeeded && <span className={styles.barLabel}>{bar.label}</span>}
                    </button>
                  );
                })}
                {lane.doses.map(({ intake, left }) => {
                  const taken = intake.status === 'taken';
                  const title = `${lane.label}: ${taken ? 'wzięty' : 'pominięty'} ${formatDateTime(intake.scheduledAt)}`;
                  return (
                    <button
                      key={intake.id}
                      type="button"
                      className={[
                        styles.doseMark,
                        taken ? undefined : styles.skipped,
                        isHighlighted(highlight, 'intake', intake.id) && styles.highlight,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        left: `${left}%`,
                        borderColor: color,
                        background: taken ? color : undefined,
                      }}
                      title={title}
                      aria-label={title}
                      onClick={() => onSelect?.({ entity: 'intake', id: intake.id })}
                    />
                  );
                })}
              </Track>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Track({ ticks, children }: { ticks: Tick[]; children: ReactNode }) {
  return (
    <div className={styles.track}>
      {ticks.map((t) => (
        <span key={t.left} className={styles.grid} style={{ left: `${t.left}%` }} />
      ))}
      {children}
    </div>
  );
}
