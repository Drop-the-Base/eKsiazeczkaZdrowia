import type { ShareSnapshot } from '@ez/shared';
import { isOmitted } from './patient.logic';
import styles from './PatientView.module.css';

/** The patient's agenda, first thing in the left column. */
export function TellDoctor({ snapshot }: { snapshot: ShareSnapshot }) {
  const items = snapshot.visitNoteItems.filter((n) => !n.discussed);
  return (
    <section className={styles.block}>
      <h2 className={styles.blockTitle}>Pacjent chce powiedzieć</h2>
      {isOmitted(snapshot, 'visitNotes') ? (
        <p className={styles.muted}>nie udostępniono</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>brak</p>
      ) : (
        <ol className={styles.agenda}>
          {items.map((n) => (
            <li key={n.id}>{n.text}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
