import type { Exam } from '@ez/shared';
import { FLAG_ARROW, flagOf } from '../exams.logic';
import styles from './ExamResults.module.css';

const fmt = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 2 });

/** Tabela wyników; poza normą pogrubione z ↑/↓ (bez komentarza). */
export function ExamResults({ exam }: { exam: Exam }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Parametr</th>
          <th>Wynik</th>
          <th>Norma</th>
        </tr>
      </thead>
      <tbody>
        {exam.results.map((r) => {
          const flag = flagOf(r);
          return (
            <tr key={r.name} className={flag ? styles.out : undefined}>
              <td>{r.name}</td>
              <td>
                {fmt(r.value)} {r.unit} {flag && FLAG_ARROW[flag]}
              </td>
              <td className={styles.ref}>
                {r.refLow !== undefined || r.refHigh !== undefined
                  ? `${r.refLow !== undefined ? fmt(r.refLow) : '…'}–${r.refHigh !== undefined ? fmt(r.refHigh) : '…'}`
                  : '–'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
