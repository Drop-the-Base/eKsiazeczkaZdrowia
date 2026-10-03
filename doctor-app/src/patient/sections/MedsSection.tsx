import type { ShareSnapshot } from '@ez/shared';
import { formatDate } from '../../format';
import { CurrentMeds } from '../CurrentMeds';
import { describeDose } from '../patient.logic';
import { useShowMore } from './useShowMore';
import styles from './Sections.module.css';

/** Everything taken now with details, then stopped medications with the reason. */
export function MedsSection({ snapshot }: { snapshot: ShareSnapshot }) {
  const stopped = snapshot.medications
    .filter((m) => m.endDate !== undefined)
    .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  const more = useShowMore(stopped.length, 8);
  return (
    <>
      <CurrentMeds snapshot={snapshot} />
      <h3 className={styles.subTitle}>Odstawione</h3>
      {stopped.length === 0 ? (
        <p className={styles.muted}>brak</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lek</th>
                <th>Od – do</th>
                <th>Powód odstawienia</th>
              </tr>
            </thead>
            <tbody>
              {stopped.map((m, i) => (
                <tr key={m.id} className={more.className(i)}>
                  <td>
                    {m.name} {describeDose(m)}
                  </td>
                  <td>
                    {formatDate(m.startDate)} – {formatDate(m.endDate ?? '')}
                  </td>
                  <td>{m.stopReason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {more.button}
        </>
      )}
    </>
  );
}
