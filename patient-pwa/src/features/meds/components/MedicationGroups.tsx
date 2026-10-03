import type { Medication } from '@ez/shared';
import { List, ListItem, formatDate } from '../../../ui';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  describeDose,
  describeSchedule,
  type GroupedMedications,
} from '../meds.logic';
import styles from './MedicationGroups.module.css';

type Props = GroupedMedications & { onOpen?: (m: Medication) => void };

export function MedicationGroups({ current, stopped, onOpen }: Props) {
  return (
    <div className={styles.groups}>
      {CATEGORY_ORDER.map((category) => (
        <section
          key={category}
          className={styles.group}
          data-tour={category === 'supplement' ? 'supplements' : undefined}
        >
          <h2 className={styles.label}>
            <span className={styles.dot} style={{ background: CATEGORY_COLOR[category] }} />
            {CATEGORY_LABEL[category]}
          </h2>
          {current[category].length === 0 ? (
            <p className={styles.none}>brak</p>
          ) : (
            <List>
              {current[category].map((m) => (
                <ListItem
                  key={m.id}
                  title={`${m.name} ${describeDose(m)}`.trim()}
                  subtitle={`${describeSchedule(m.schedule)} · od ${formatDate(m.startDate)}`}
                  trailing={onOpen ? '›' : undefined}
                  onClick={onOpen ? () => onOpen(m) : undefined}
                  dataTour={m.rplId ? 'med-item-rpl' : 'med-item'}
                />
              ))}
            </List>
          )}
        </section>
      ))}

      {stopped.length > 0 && (
        <details className={styles.stopped}>
          <summary className={styles.label}>Odstawione ({stopped.length})</summary>
          <List>
            {stopped.map((m) => (
              <ListItem
                key={m.id}
                title={m.name}
                subtitle={[
                  `${formatDate(m.startDate)} – ${m.endDate ? formatDate(m.endDate) : ''}`,
                  m.stopReason,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                onClick={onOpen ? () => onOpen(m) : undefined}
              />
            ))}
          </List>
        </details>
      )}
    </div>
  );
}
