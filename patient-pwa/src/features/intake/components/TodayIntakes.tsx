import { useState } from 'react';
import type { IntakeStatus, Medication } from '@ez/shared';
import { Card, EmptyState, LoadingState, todayIso } from '../../../ui';
import { describeDose } from '../../meds';
import { asNeededForDay, dosesForDay, progress, type ScheduledDose } from '../intake.logic';
import { confirmDose, takeNow, undoDose, useDayData } from '../useIntake';
import styles from './TodayIntakes.module.css';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

/** Lista „na dziś”: potwierdzenie dawki jednym dotknięciem. */
export function TodayIntakes() {
  const today = todayIso();
  const data = useDayData(today);
  const [error, setError] = useState<string | null>(null);

  const run = (action: Promise<void>) => {
    setError(null);
    action.catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać'),
    );
  };

  if (data.status === 'loading') return <LoadingState />;
  const doses = dosesForDay(data.data.medications, data.data.intakes, today);
  const asNeeded = asNeededForDay(data.data.medications, today);
  if (doses.length === 0 && asNeeded.length === 0) {
    return <EmptyState title="Na dziś nie ma leków do potwierdzenia" />;
  }
  const { done, total } = progress(doses);

  return (
    <div className={styles.today}>
      {total > 0 && (
        <p className={styles.progress}>
          Potwierdzone {done} z {total}
        </p>
      )}
      {doses.map((dose) => (
        <DoseRow
          key={`${dose.medication.id}|${dose.time}`}
          dose={dose}
          onConfirm={(status) => run(confirmDose(dose, status))}
          onUndo={() => run(undoDose(dose))}
        />
      ))}
      {asNeeded.length > 0 && (
        <>
          <h3 className={styles.subheading}>Doraźnie</h3>
          {asNeeded.map((m) => (
            <AsNeededRow
              key={m.id}
              medication={m}
              takenAt={data.data.intakes
                .filter((i) => i.medicationId === m.id && i.status === 'taken')
                .map((i) => timeOf(i.confirmedAt))}
              onTake={() => run(takeNow(m))}
            />
          ))}
        </>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function DoseRow({
  dose,
  onConfirm,
  onUndo,
}: {
  dose: ScheduledDose;
  onConfirm: (status: IntakeStatus) => void;
  onUndo: () => void;
}) {
  const status = dose.intake?.status;
  return (
    <Card className={[styles.row, status && styles[status]].filter(Boolean).join(' ')}>
      <span className={styles.time}>{dose.time}</span>
      <span className={styles.name}>
        {dose.medication.name}
        <span className={styles.dose}>{describeDose(dose.medication)}</span>
      </span>
      {status ? (
        <button type="button" className={styles.undo} onClick={onUndo}>
          {status === 'taken' ? '✓ Wzięte' : 'Pominięte'} · cofnij
        </button>
      ) : (
        <span className={styles.actions}>
          <button
            type="button"
            className={styles.skip}
            onClick={() => onConfirm('skipped')}
            aria-label={`Pominąłem ${dose.medication.name}`}
          >
            Pomiń
          </button>
          <button
            type="button"
            className={styles.take}
            onClick={() => onConfirm('taken')}
            aria-label={`Wziąłem ${dose.medication.name}`}
          >
            ✓ Wziąłem
          </button>
        </span>
      )}
    </Card>
  );
}

function AsNeededRow({
  medication,
  takenAt,
  onTake,
}: {
  medication: Medication;
  takenAt: string[];
  onTake: () => void;
}) {
  return (
    <Card className={styles.row}>
      <span className={styles.name}>
        {medication.name}
        <span className={styles.dose}>
          {describeDose(medication)}
          {takenAt.length > 0 && ` · dziś: ${takenAt.join(', ')}`}
        </span>
      </span>
      <button type="button" className={styles.take} onClick={onTake}>
        Wziąłem teraz
      </button>
    </Card>
  );
}
