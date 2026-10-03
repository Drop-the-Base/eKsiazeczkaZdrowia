import { useState, type FormEvent } from 'react';
import type { Diagnosis } from '@ez/shared';
import { BottomSheet, Button, Chip, TextField, todayIso } from '../../../ui';
import { validateDiagnosis, type DiagnosisErrors, type DiagnosisForm } from '../diagnoses.logic';
import { removeDiagnosis, saveDiagnosis } from '../useDiagnoses';
import styles from './ProfileSheet.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  /** `undefined` = nowa diagnoza. */
  diagnosis: Diagnosis | undefined;
};

export function DiagnosisSheet({ open, onClose, diagnosis }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={diagnosis ? 'Diagnoza' : 'Nowa diagnoza'}>
      {open && (
        <DiagnosisFormView key={diagnosis?.id ?? 'new'} diagnosis={diagnosis} onDone={onClose} />
      )}
    </BottomSheet>
  );
}

const toForm = (d: Diagnosis | undefined): DiagnosisForm => ({
  name: d?.name ?? '',
  icd10: d?.icd10 ?? '',
  diagnosedAt: d?.diagnosedAt ?? todayIso(),
  active: d?.active ?? true,
});

function DiagnosisFormView({
  diagnosis,
  onDone,
}: {
  diagnosis: Diagnosis | undefined;
  onDone: () => void;
}) {
  const [form, setForm] = useState(() => toForm(diagnosis));
  const [errors, setErrors] = useState<DiagnosisErrors>({});
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      onDone();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Nie udało się zapisać');
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateDiagnosis(form, todayIso());
    setErrors(found);
    if (Object.keys(found).length === 0) void run(() => saveDiagnosis(form, diagnosis));
  };

  const onRemove = () => {
    if (diagnosis && window.confirm(`Usunąć „${diagnosis.name}”?`)) {
      void run(() => removeDiagnosis(diagnosis.id));
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="Choroba"
        value={form.name}
        placeholder="np. nadciśnienie tętnicze"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <TextField
        label="Kod ICD-10 (opcjonalnie)"
        value={form.icd10}
        placeholder="np. I10"
        autoCapitalize="characters"
        onChange={(e) => setForm({ ...form, icd10: e.target.value })}
        error={errors.icd10}
        hint="Z karty informacyjnej lub skierowania; pomaga lekarzowi za granicą."
      />
      <TextField
        label="Data rozpoznania"
        type="date"
        value={form.diagnosedAt}
        max={todayIso()}
        onChange={(e) => setForm({ ...form, diagnosedAt: e.target.value })}
        error={errors.diagnosedAt}
      />
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Stan</legend>
        <div className={styles.chips}>
          <Chip selected={form.active} onClick={() => setForm({ ...form, active: true })}>
            Aktualna
          </Chip>
          <Chip selected={!form.active} onClick={() => setForm({ ...form, active: false })}>
            Przebyta
          </Chip>
        </div>
      </fieldset>

      {actionError && (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      )}
      <Button type="submit" block disabled={busy}>
        {busy ? 'Zapisywanie…' : 'Zapisz'}
      </Button>
      {diagnosis && (
        <Button variant="danger" block onClick={onRemove} disabled={busy}>
          Usuń
        </Button>
      )}
    </form>
  );
}
