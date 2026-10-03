import { useNavigate } from 'react-router-dom';
import type { Intake, Medication } from '@ez/shared';
import { Card, todayIso } from '../../../ui';
import { dosesForDay } from '../../intake';
import styles from './TodayCard.module.css';

/** „Leki na dziś: 1 z 3” – wejście do potwierdzania jednym dotknięciem. */
export function TodayCard({
  medications,
  intakes,
}: {
  medications: Medication[];
  intakes: Intake[];
}) {
  const navigate = useNavigate();
  const doses = dosesForDay(medications, intakes, todayIso());
  if (doses.length === 0) return null;
  const done = doses.filter((d) => d.intake).length;
  const allDone = done === doses.length;

  return (
    <Card className={styles.card}>
      <button type="button" className={styles.button} onClick={() => navigate('/dzis')}>
        <span>
          <strong>Leki na dziś</strong>
          <span className={styles.muted}>
            {allDone ? 'Wszystko potwierdzone' : `Potwierdzone ${done} z ${doses.length}`}
          </span>
        </span>
        <span className={allDone ? styles.done : styles.cta}>{allDone ? '✓' : 'Potwierdź ›'}</span>
      </button>
    </Card>
  );
}
