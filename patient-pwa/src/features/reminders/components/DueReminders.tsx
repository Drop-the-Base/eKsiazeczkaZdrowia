import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, formatDateTime } from '../../../ui';
import { markDone, useDueReminders } from '../reminders';
import { REMINDER_TEXT } from '../reminders.logic';
import styles from './DueReminders.module.css';

/** „Do potwierdzenia” na ekranie startowym: przypomnienia, których czas minął (PWA bez pushy). */
export function DueReminders() {
  const due = useDueReminders();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  if (due.status === 'loading' || due.data.length === 0) return null;

  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>Do potwierdzenia</h2>
      <ul className={styles.list}>
        {due.data.map((r) => (
          <li key={r.id} className={styles.item}>
            <span>
              {REMINDER_TEXT[r.type]}
              <span className={styles.muted}>{formatDateTime(r.at)}</span>
            </span>
            {r.type === 'medication' && (
              <Button variant="ghost" onClick={() => navigate('/dzis')}>
                Otwórz
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() =>
                markDone(r.id).catch((err: unknown) =>
                  setError(err instanceof Error ? err.message : 'Nie udało się zapisać'),
                )
              }
            >
              Gotowe
            </Button>
          </li>
        ))}
      </ul>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
