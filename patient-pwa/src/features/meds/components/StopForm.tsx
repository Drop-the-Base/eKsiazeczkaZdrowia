import { useState, type FormEvent } from 'react';
import type { Medication } from '@ez/shared';
import { Button, TextField, todayIso } from '../../../ui';
import { stopMedication } from '../saveMedication';
import { validateReason } from '../stop.logic';
import { ReasonPicker } from './ReasonPicker';
import styles from './MedicationForm.module.css';

export function StopForm({ medication, onDone }: { medication: Medication; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateReason(reason);
    setError(found);
    if (found) return;
    setSaving(true);
    setSaveError(null);
    try {
      await stopMedication(
        medication,
        reason,
        date < medication.startDate ? medication.startDate : date,
      );
      onDone();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nie udało się odstawić leku');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <ReasonPicker
        label="Powód odstawienia"
        value={reason}
        onChange={setReason}
        error={error}
      />
      <TextField
        label="Ostatni dzień przyjmowania"
        type="date"
        value={date}
        min={medication.startDate}
        onChange={(e) => setDate(e.target.value)}
      />
      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <Button type="submit" variant="danger" block disabled={saving}>
        {saving ? 'Zapisywanie…' : 'Odstaw lek'}
      </Button>
    </form>
  );
}
