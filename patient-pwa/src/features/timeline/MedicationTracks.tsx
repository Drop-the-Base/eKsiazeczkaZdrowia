import type { DateRange, Intake, Medication, MedicationCategory, TimelineRef } from '@ez/shared';
import { formatDate, formatDateTime } from '../../ui/format';
import { CATEGORY_LABEL } from '../meds/meds.logic';
import { cx, GroupHeader, Lane, Marker, type Grid, type Select } from './parts';
import { medicationLanes } from './timeline.logic';
import styles from './Timeline.module.css';

/** Kolory grup z fallbackiem – komponent działa też w aplikacji lekarza (bez `ui/tokens.css`). */
const GROUP_COLOR: Record<MedicationCategory, string> = {
  prescription: 'var(--color-rx, #2563eb)',
  otc: 'var(--color-otc, #d97706)',
  supplement: 'var(--color-supplement, #7c3aed)',
};

type Props = {
  medications: Medication[];
  intakes: Intake[];
  range: DateRange;
  grid: Grid;
  highlight: TimelineRef | undefined;
  onSelect: Select;
};

export function MedicationTracks({
  medications,
  intakes,
  range,
  grid,
  highlight,
  onSelect,
}: Props) {
  const lanes = medicationLanes(medications, range, intakes);
  if (lanes.length === 0) return <p className={styles.empty}>Brak leków w tym okresie</p>;
  let lastCategory: MedicationCategory | undefined;

  return lanes.map((lane) => {
    const header = lane.category !== lastCategory;
    lastCategory = lane.category;
    const color = GROUP_COLOR[lane.category];
    return (
      <div key={lane.key}>
        {header && <GroupHeader label={CATEGORY_LABEL[lane.category]} color={color} />}
        <Lane label={lane.label} grid={grid}>
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
              <Marker
                key={m.id}
                refTo={{ entity: 'medication', id: m.id }}
                title={title}
                className={cx(
                  styles.bar,
                  bar.ongoing && styles.ongoing,
                  bar.asNeeded && styles.asNeeded,
                )}
                style={{ left: `${bar.left}%`, width: `${bar.width}%`, background: color }}
                highlight={highlight}
                onSelect={onSelect}
              >
                {!bar.asNeeded && bar.width * grid.zoom >= 20 && (
                  <span className={styles.barLabel}>{bar.label}</span>
                )}
              </Marker>
            );
          })}
          {lane.doses.map(({ intake, left }) => {
            const taken = intake.status === 'taken';
            return (
              <Marker
                key={intake.id}
                refTo={{ entity: 'intake', id: intake.id }}
                title={`${lane.label}: ${taken ? 'wzięty' : 'pominięty'} ${formatDateTime(intake.scheduledAt)}`}
                className={cx(styles.dotMark, !taken && styles.hollow)}
                style={{
                  left: `${left}%`,
                  borderColor: color,
                  background: taken ? color : undefined,
                }}
                highlight={highlight}
                onSelect={onSelect}
              />
            );
          })}
        </Lane>
      </div>
    );
  });
}
