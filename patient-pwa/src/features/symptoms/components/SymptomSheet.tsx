import { useState, type FormEvent } from 'react';
import type { Severity } from '@ez/shared';
import { BottomSheet, Button, Chip, TextField } from '../../../ui';
import {
  COMMON_SYMPTOMS,
  SEVERITY_LABEL,
  validateSymptom,
  type SymptomErrors,
  type SymptomForm,
  type WhenChoice,
} from '../symptoms.logic';
import { addSymptom } from '../useSymptoms';
import styles from './SymptomSheet.module.css';

const WHEN: { value: WhenChoice; label: string }[] = [
  { value: 'now', label: 'Teraz' },
  { value: 'morning', label: 'Od rana' },
  { value: 'yesterday', label: 'Wczoraj' },
  { value: 'custom', label: 'Inny czas' },
];

const SEVERITIES: Severity[] = [1, 2, 3, 4, 5];

export function SymptomSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Nowy objaw">
      {open && <SymptomFormView onDone={onClose} />}
    </BottomSheet>
  );
}

function SymptomFormView({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState<SymptomForm>({ name: '', when: 'now', custom: '', notes: '' });
  const [errors, setErrors] = useState<SymptomErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const found = validateSymptom(form, now);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await addSymptom(form, now);
      onDone();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nie udało się zapisać objawu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.chips}>
        {COMMON_SYMPTOMS.map((s) => (
          <Chip key={s} selected={form.name === s} onClick={() => setForm({ ...form, name: s })}>
            {s}
          </Chip>
        ))}
      </div>
      <TextField
        label="Objaw"
        value={form.name}
        placeholder="albo wpisz własny"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Nasilenie (opcjonalnie)</legend>
        <div className={styles.chips}>
          {SEVERITIES.map((s) => (
            <Chip
              key={s}
              selected={form.severity === s}
              onClick={() => setForm({ ...form, severity: form.severity === s ? undefined : s })}
            >
              {s} · {SEVERITY_LABEL[s]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Od kiedy</legend>
        <div className={styles.chips}>
          {WHEN.map((w) => (
            <Chip
              key={w.value}
              selected={form.when === w.value}
              onClick={() => setForm({ ...form, when: w.value })}
            >
              {w.label}
            </Chip>
          ))}
        </div>
        {form.when === 'custom' && (
          <TextField
            label="Data i godzina"
            type="datetime-local"
            value={form.custom}
            onChange={(e) => setForm({ ...form, custom: e.target.value })}
          />
        )}
        {errors.when && <span className={styles.error}>{errors.when}</span>}
      </fieldset>

      <TextField
        label="Notatka (opcjonalnie)"
        value={form.notes}
        placeholder="np. po wstaniu z łóżka"
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <Button type="submit" block disabled={saving}>
        {saving ? 'Zapisywanie…' : 'Zapisz objaw'}
      </Button>
    </form>
  );
}
