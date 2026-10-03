import type { ShareSnapshot } from '@ez/shared';
import { CurrentMeds } from './CurrentMeds';
import { PatientHeader } from './PatientHeader';
import { TellDoctor } from './TellDoctor';
import styles from './PatientView.module.css';

/** Doctor's view of the received snapshot (TASKS.md section 5, "Układ widoku lekarza"). */
export function PatientView({ snapshot }: { snapshot: ShareSnapshot }) {
  return (
    <div className={styles.view}>
      <PatientHeader snapshot={snapshot} />
      <aside className={styles.left}>
        <TellDoctor snapshot={snapshot} />
        <CurrentMeds snapshot={snapshot} />
      </aside>
      <section className={styles.right} aria-label="Historia">
        {/* B19: "Od ostatniej wizyty", timeline, tabs. */}
      </section>
    </div>
  );
}
