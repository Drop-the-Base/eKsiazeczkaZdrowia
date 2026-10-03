import type { ShareSnapshot } from '@ez/shared';
import { ageOn, isOmitted } from './patient.logic';
import styles from './PatientView.module.css';

export function PatientHeader({ snapshot }: { snapshot: ShareSnapshot }) {
  const { profile } = snapshot;
  const active = snapshot.diagnoses.filter((d) => d.active);
  return (
    <section className={styles.header} aria-label="Pacjent">
      <div className={styles.identity}>
        <strong className={styles.name}>{profile.name}</strong>
        <span>{ageOn(profile.birthDate, snapshot.createdAt.slice(0, 10))} lat</span>
        {profile.bloodType && <span>gr. krwi {profile.bloodType}</span>}
      </div>
      <div className={styles.facts}>
        <span className={styles.factLabel}>Alergie:</span>
        {profile.allergies.length > 0 ? (
          profile.allergies.map((a) => (
            <span key={a} className={styles.tag}>
              {a}
            </span>
          ))
        ) : (
          <span className={styles.muted}>brak zgłoszonych</span>
        )}
      </div>
      <div className={styles.facts}>
        <span className={styles.factLabel}>Choroby:</span>
        {isOmitted(snapshot, 'diagnoses') ? (
          <span className={styles.muted}>nie udostępniono</span>
        ) : active.length > 0 ? (
          active.map((d) => (
            <span key={d.id}>
              {d.name}
              {d.icd10 && <span className={styles.code}> ({d.icd10})</span>}
            </span>
          ))
        ) : (
          <span className={styles.muted}>brak</span>
        )}
      </div>
    </section>
  );
}
