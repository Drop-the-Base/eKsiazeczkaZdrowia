import { isOutOfRange, type ShareSnapshot } from '@ez/shared';
import { formatDate, formatNumber } from '../../format';
import { rangeFlag } from './timeline.logic';
import { useShowMore } from './useShowMore';
import styles from './Sections.module.css';

/** All results, newest first; out of the reference range in bold with ↑/↓ (a fact from the result). */
export function ExamsSection({ snapshot }: { snapshot: ShareSnapshot }) {
  const exams = [...snapshot.exams].sort((a, b) => b.date.localeCompare(a.date));
  const more = useShowMore(exams.length, 5);
  if (exams.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Badanie</th>
            <th>Parametr</th>
            <th>Wynik</th>
            <th>Zakres</th>
          </tr>
        </thead>
        <tbody>
          {exams.flatMap((e, examIndex) =>
            e.results.map((r, i) => (
              <tr
                key={`${e.id}-${r.name}`}
                className={[
                  isOutOfRange(r) ? styles.strong : '',
                  more.className(examIndex) ?? '',
                ].join(' ')}
              >
                <td>{i === 0 ? formatDate(e.date) : ''}</td>
                <td>{i === 0 ? e.name : ''}</td>
                <td>{r.name}</td>
                <td>
                  {formatNumber(r.value)} {r.unit} {rangeFlag(r)}
                </td>
                <td>
                  {r.refLow !== undefined ? formatNumber(r.refLow) : ''}–
                  {r.refHigh !== undefined ? formatNumber(r.refHigh) : ''}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      {more.button}
    </>
  );
}
