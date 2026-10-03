import type { ShareSnapshot } from '@ez/shared';
import { formatDateTime } from '../format';
import { CurrentMeds } from './CurrentMeds';
import { PatientHeader } from './PatientHeader';
import { RightColumn } from './right/RightColumn';
import { TellDoctor } from './TellDoctor';
import styles from './PatientView.module.css';

/** Doctor's view of the received snapshot (TASKS.md section 5, "Układ widoku lekarza"). */
export function PatientView({ snapshot }: { snapshot: ShareSnapshot }) {
  return (
    <div className={styles.view}>
      <p className={styles.printHeader}>
        eKsiazeczkaZdrowia · dane przekazane z telefonu pacjenta{' '}
        {formatDateTime(snapshot.createdAt)} · wydrukowano{' '}
        {formatDateTime(new Date().toISOString())}
      </p>
      <PatientHeader snapshot={snapshot} />
      <aside className={styles.left}>
        <TellDoctor snapshot={snapshot} />
        <CurrentMeds snapshot={snapshot} />
      </aside>
      <section className={styles.right} aria-label="Historia">
        <RightColumn snapshot={snapshot} />
      </section>
    </div>
  );
}
