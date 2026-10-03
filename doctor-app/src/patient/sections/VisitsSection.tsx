import type { ShareSnapshot } from '@ez/shared';
import { formatDate } from '../../format';
import { useShowMore } from './useShowMore';
import styles from './Sections.module.css';

export function VisitsSection({ snapshot }: { snapshot: ShareSnapshot }) {
  const visits = [...snapshot.visits].sort((a, b) => b.date.localeCompare(a.date));
  const more = useShowMore(visits.length, 5);
  if (visits.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <>
      <ul className={styles.list}>
        {visits.map((v, i) => (
          <li key={v.id} className={more.className(i)}>
            <strong>
              {formatDate(v.date)} {[v.specialty, v.doctor].filter(Boolean).join(', ')}
            </strong>
            <p>{v.transcript}</p>
            {v.followUpDate && (
              <p className={styles.muted}>Kontrola: {formatDate(v.followUpDate)}</p>
            )}
          </li>
        ))}
      </ul>
      {more.button}
    </>
  );
}
