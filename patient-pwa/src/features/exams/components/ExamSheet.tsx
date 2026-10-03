import { useState, type FormEvent } from 'react';
import { BottomSheet, Button, Chip, TextField, todayIso } from '../../../ui';
import {
  emptyRow,
  hasErrors,
  PRESETS,
  validateExam,
  type ExamErrors,
  type ExamForm,
  type ResultRow,
} from '../exams.logic';
import { addExam } from '../useExams';
import styles from './ExamSheet.module.css';

export function ExamSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Nowe badanie">
      {open && <ExamFormView onDone={onClose} />}
    </BottomSheet>
  );
}

function ExamFormView({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState<ExamForm>({ name: '', date: todayIso(), rows: [emptyRow()] });
  const [errors, setErrors] = useState<ExamErrors>({ rowErrors: [] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setRow = (i: number, patch: Partial<ResultRow>) =>
    setForm({ ...form, rows: form.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  const applyPreset = (name: string) =>
    setForm({ ...form, name, rows: (PRESETS[name] ?? [emptyRow()]).map((r) => ({ ...r })) });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateExam(form, todayIso());
    setErrors(found);
    if (hasErrors(found)) return;
    setSaving(true);
    setSaveError(null);
    try {
      await addExam(form);
      onDone();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nie udało się zapisać badania');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.chips}>
        {Object.keys(PRESETS).map((name) => (
          <Chip key={name} selected={form.name === name} onClick={() => applyPreset(name)}>
            {name}
          </Chip>
        ))}
      </div>
      <div className={styles.row2}>
        <TextField
          label="Badanie"
          value={form.name}
          placeholder="np. Morfologia krwi"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <TextField
          label="Data"
          type="date"
          value={form.date}
          max={todayIso()}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          error={errors.date}
        />
      </div>

      <div className={styles.results}>
        {form.rows.map((r, i) => (
          <fieldset key={i} className={styles.result}>
            <legend className={styles.legend}>Wynik {i + 1}</legend>
            <TextField
              label="Parametr"
              value={r.name}
              placeholder="np. Hemoglobina"
              onChange={(e) => setRow(i, { name: e.target.value })}
            />
            <div className={styles.row3}>
              <TextField
                label="Wartość"
                inputMode="decimal"
                value={r.value}
                onChange={(e) => setRow(i, { value: e.target.value })}
              />
              <TextField
                label="Jednostka"
                value={r.unit}
                onChange={(e) => setRow(i, { unit: e.target.value })}
              />
            </div>
            <div className={styles.row3}>
              <TextField
                label="Norma od"
                inputMode="decimal"
                value={r.refLow}
                onChange={(e) => setRow(i, { refLow: e.target.value })}
              />
              <TextField
                label="Norma do"
                inputMode="decimal"
                value={r.refHigh}
                onChange={(e) => setRow(i, { refHigh: e.target.value })}
              />
            </div>
            {errors.rowErrors[i] && <span className={styles.error}>{errors.rowErrors[i]}</span>}
          </fieldset>
        ))}
        {errors.rows && <span className={styles.error}>{errors.rows}</span>}
        <Button
          variant="secondary"
          onClick={() => setForm({ ...form, rows: [...form.rows, emptyRow()] })}
        >
          + Kolejny wynik
        </Button>
      </div>

      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <Button type="submit" block disabled={saving}>
        {saving ? 'Zapisywanie…' : 'Zapisz badanie'}
      </Button>
    </form>
  );
}
