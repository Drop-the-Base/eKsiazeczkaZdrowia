import type { ShareSnapshot } from '@ez/shared';
import styles from './PatientView.module.css';

/** The patient's agenda – the first thing the doctor reads. */
export function TellDoctor({ snapshot }: { snapshot: ShareSnapshot }) {
  const items = snapshot.visitNoteItems.filter((n) => !n.discussed);
  if (items.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <ol className={styles.agenda}>
      {items.map((n) => (
        <li key={n.id}>{n.text}</li>
      ))}
    </ol>
  );
}
