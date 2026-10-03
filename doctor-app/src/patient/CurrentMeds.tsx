import { useState } from 'react';
import type { Medication, ShareSnapshot } from '@ez/shared';
import { formatDate } from '../format';
import {
  currentByGroup,
  describeDose,
  describeSchedule,
  intakeSummary,
  isOmitted,
  MED_GROUPS,
} from './patient.logic';
import styles from './PatientView.module.css';

function details(med: Medication, intakes?: string): string {
  return [
    med.activeSubstance && med.activeSubstance.toLowerCase() !== med.name.toLowerCase()
      ? med.activeSubstance
      : undefined,
    `od ${formatDate(med.startDate)}`,
    intakes,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Compact: name, dose, schedule – details after a click. Full: details always (section "Leki", print). */
function MedItem({
  med,
  intakes,
  compact,
}: {
  med: Medication;
  intakes?: string;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  const head = (
    <>
      <span className={styles.medName}>
        {med.name} {describeDose(med)}
      </span>
      <span className={styles.medSchedule}>{describeSchedule(med.schedule)}</span>
    </>
  );
  return (
    <li className={styles.med}>
      {compact ? (
        <button
          type="button"
          className={styles.medToggle}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {head}
        </button>
      ) : (
        <div className={styles.medHead}>{head}</div>
      )}
      {(!compact || open) && <span className={styles.medDetails}>{details(med, intakes)}</span>}
    </li>
  );
}

/** Everything the patient takes now, in three equal groups (supplements on a par). An empty group says "brak". */
export function CurrentMeds({
  snapshot,
  compact = false,
}: {
  snapshot: ShareSnapshot;
  compact?: boolean;
}) {
  const groups = currentByGroup(snapshot.medications, snapshot.createdAt.slice(0, 10));
  if (isOmitted(snapshot, 'medications')) return <p className={styles.muted}>nie udostępniono</p>;
  return (
    <div className={styles.groups}>
      {MED_GROUPS.map(({ category, label, color }) => (
        <div key={category} className={styles.group} style={{ borderColor: color }}>
          <h3 className={styles.groupTitle}>{label}</h3>
          {groups[category].length === 0 ? (
            <p className={styles.muted}>brak</p>
          ) : (
            <ul className={styles.meds}>
              {groups[category].map((m) => (
                <MedItem
                  key={m.id}
                  med={m}
                  intakes={intakeSummary(m, snapshot.intakes)}
                  compact={compact}
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
