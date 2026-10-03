import type { ShareSnapshot, TimelineRef } from '@ez/shared';
import { CurrentMeds } from '../CurrentMeds';
import { TellDoctor } from '../TellDoctor';
import { SinceLastVisit } from './SinceLastVisit';
import styles from './Sections.module.css';

type Props = { snapshot: ShareSnapshot; onSelect: (ref: TimelineRef) => void };

/** Start of the visit: what the patient wants to say, what changed, what they take now. */
export function SummarySection({ snapshot, onSelect }: Props) {
  return (
    <div className={styles.summary}>
      <div className={styles.summaryMain}>
        <section
          className={styles.box}
          aria-label="Sprawy zgłoszone przez pacjenta"
          data-tour="tell"
        >
          <h2 className={styles.title}>Sprawy zgłoszone przez pacjenta</h2>
          <TellDoctor snapshot={snapshot} />
        </section>
        <SinceLastVisit snapshot={snapshot} onSelect={onSelect} />
      </div>
      <section
        className={`${styles.box} ${styles.screenOnly}`}
        aria-label="Przyjmowane teraz"
        data-tour="meds-now"
      >
        <h2 className={styles.title}>Przyjmowane teraz</h2>
        <CurrentMeds snapshot={snapshot} compact />
      </section>
    </div>
  );
}
