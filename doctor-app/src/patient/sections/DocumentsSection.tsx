import type { ShareSnapshot } from '@ez/shared';
import { formatDate } from '../../format';
import { useShowMore } from './useShowMore';
import styles from './Sections.module.css';

export function DocumentsSection({ snapshot }: { snapshot: ShareSnapshot }) {
  const docs = [...snapshot.documents].sort((a, b) => b.date.localeCompare(a.date));
  const more = useShowMore(docs.length, 8);
  if (docs.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <>
      <ul className={styles.list}>
        {docs.map((d, i) => (
          <li key={d.id} className={more.className(i)}>
            {formatDate(d.date)} · {d.title}{' '}
            <span className={styles.muted}>({d.source === 'ikp' ? 'z IKP' : 'zdjęcie'})</span>
          </li>
        ))}
      </ul>
      {more.button}
    </>
  );
}
