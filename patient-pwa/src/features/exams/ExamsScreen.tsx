import { useState } from 'react';
import { Button, Card, EmptyState, LoadingState, PageHeader, formatDate } from '../../ui';
import { ExamResults } from './components/ExamResults';
import { ExamSheet } from './components/ExamSheet';
import { FLAG_ARROW, flagOf, newestFirst, outOfRange } from './exams.logic';
import { removeExam, useExams } from './useExams';
import styles from './ExamsScreen.module.css';

export function ExamsScreen() {
  const exams = useExams();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRemove = (id: string, name: string) => {
    if (!window.confirm(`Usunąć badanie „${name}”?`)) return;
    removeExam(id).catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć'),
    );
  };

  return (
    <>
      <PageHeader
        title="Badania"
        action={
          <Button variant="ghost" onClick={() => setAdding(true)}>
            + Dodaj
          </Button>
        }
      />
      <div className={styles.content}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {exams.status === 'loading' ? (
          <LoadingState />
        ) : exams.data.length === 0 ? (
          <EmptyState title="Brak badań">
            <Button onClick={() => setAdding(true)}>Dodaj wyniki</Button>
          </EmptyState>
        ) : (
          newestFirst(exams.data).map((exam) => {
            const out = outOfRange(exam);
            return (
              <Card key={exam.id} className={styles.exam}>
                <details>
                  <summary className={styles.summary}>
                    <span className={styles.title}>
                      {exam.name}
                      <span className={styles.date}>{formatDate(exam.date)}</span>
                    </span>
                    {out.length > 0 && (
                      <span className={styles.flags}>
                        {out
                          .map((r) => `${r.name.split(' ')[0]} ${FLAG_ARROW[flagOf(r)!]}`)
                          .join(' · ')}
                      </span>
                    )}
                  </summary>
                  <ExamResults exam={exam} />
                  <Button variant="ghost" onClick={() => onRemove(exam.id, exam.name)}>
                    Usuń
                  </Button>
                </details>
              </Card>
            );
          })
        )}
      </div>
      <ExamSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
