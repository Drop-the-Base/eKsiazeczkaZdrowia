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

function MedItem({ med, intakes }: { med: Medication; intakes?: string }) {
  const details = [
    med.activeSubstance && med.activeSubstance.toLowerCase() !== med.name.toLowerCase()
      ? med.activeSubstance
      : undefined,
    describeSchedule(med.schedule),
    `od ${formatDate(med.startDate)}`,
    intakes,
  ].filter(Boolean);
  return (
    <li className={styles.med}>
      <span className={styles.medName}>
        {med.name} {describeDose(med)}
      </span>
      <span className={styles.medDetails}>{details.join(' · ')}</span>
    </li>
  );
}

/** Everything the patient takes now, in three equal groups. An empty group says "brak". */
export function CurrentMeds({ snapshot }: { snapshot: ShareSnapshot }) {
  const groups = currentByGroup(snapshot.medications, snapshot.createdAt.slice(0, 10));
  return (
    <section className={styles.block}>
      <h2 className={styles.blockTitle}>Przyjmowane teraz</h2>
      {isOmitted(snapshot, 'medications') ? (
        <p className={styles.muted}>nie udostępniono</p>
      ) : (
        MED_GROUPS.map(({ category, label, color }) => (
          <div key={category} className={styles.group} style={{ borderColor: color }}>
            <h3 className={styles.groupTitle}>{label}</h3>
            {groups[category].length === 0 ? (
              <p className={styles.muted}>brak</p>
            ) : (
              <ul className={styles.meds}>
                {groups[category].map((m) => (
                  <MedItem key={m.id} med={m} intakes={intakeSummary(m, snapshot.intakes)} />
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </section>
  );
}
