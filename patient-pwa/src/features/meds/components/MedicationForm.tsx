import { useState, type FormEvent } from 'react';
import type { Medication } from '@ez/shared';
import { Button, Chip, TextField, todayIso } from '../../../ui';
import { DrugPicker } from '../../drugs';
import { CATEGORY_COLOR, CATEGORY_LABEL, CATEGORY_ORDER } from '../meds.logic';
import {
  applyPick,
  emptyMedForm,
  medFormFrom,
  PRESET_TIMES,
  toggleTime,
  validateMedForm,
  type MedFormErrors,
} from '../medForm.logic';
import { changeMedication, saveMedication } from '../saveMedication';
import { validateReason } from '../stop.logic';
import { ReasonPicker } from './ReasonPicker';
import styles from './MedicationForm.module.css';

type Props = {
  medication: Medication | undefined;
  /** `change`: zmiana dawki / schematu – stary rekord się kończy, powstaje nowy (z powodem). */
  mode?: 'edit' | 'change';
  onSaved: (saved: Medication, isNew: boolean) => void;
};

export function MedicationForm({ medication, mode = 'edit', onSaved }: Props) {
  const changing = mode === 'change' && medication !== undefined;
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [changeDate, setChangeDate] = useState(todayIso());
  const [form, setForm] = useState(() =>
    medication ? medFormFrom(medication) : emptyMedForm(todayIso()),
  );
  const [customTime, setCustomTime] = useState('');
  const [errors, setErrors] = useState<MedFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateMedForm(form);
    const foundReason = changing ? validateReason(reason) : undefined;
    setErrors(found);
    setReasonError(foundReason);
    if (Object.keys(found).length > 0 || foundReason) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (changing) {
        const date = changeDate > medication.startDate ? changeDate : medication.startDate;
        onSaved(await changeMedication(medication, form, reason, date), true);
      } else {
        onSaved(await saveMedication(form, medication), !medication);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nie udało się zapisać leku');
    } finally {
      setSaving(false);
    }
  };

  const addCustomTime = () => {
    if (customTime && !form.times.includes(customTime)) {
      setForm({ ...form, times: toggleTime(form.times, customTime) });
    }
    setCustomTime('');
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {form.name ? (
        <div className={styles.picked}>
          <div>
            <strong>{form.name}</strong>
            <span className={styles.muted}>
              {[form.activeSubstance, form.atcCode].filter(Boolean).join(' · ') || 'spoza bazy RPL'}
            </span>
          </div>
          {!medication && (
            <Button variant="ghost" onClick={() => setForm({ ...form, name: '' })}>
              Zmień
            </Button>
          )}
        </div>
      ) : (
        <>
          <DrugPicker onSelect={(pick) => setForm(applyPick(form, pick))} />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </>
      )}

      {changing && (
        <>
          <ReasonPicker
            label="Dlaczego zmiana?"
            value={reason}
            onChange={setReason}
            error={reasonError}
          />
          <TextField
            label="Od kiedy nowa dawka"
            type="date"
            value={changeDate}
            min={medication.startDate}
            onChange={(e) => setChangeDate(e.target.value)}
          />
        </>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Rodzaj</legend>
        <div className={styles.chips}>
          {CATEGORY_ORDER.map((c) => (
            <Chip
              key={c}
              dotColor={CATEGORY_COLOR[c]}
              selected={form.category === c}
              onClick={() => setForm({ ...form, category: c })}
            >
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <TextField
          label="Dawka"
          value={form.dose}
          inputMode="decimal"
          placeholder="np. 200 albo 1"
          onChange={(e) => setForm({ ...form, dose: e.target.value })}
          error={errors.dose}
        />
        <TextField
          label="Jednostka"
          value={form.unit}
          placeholder="mg, tabl., kaps."
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Kiedy</legend>
        <div className={styles.chips}>
          <Chip
            selected={form.scheduleType === 'daily'}
            onClick={() => setForm({ ...form, scheduleType: 'daily' })}
          >
            Codziennie
          </Chip>
          <Chip
            selected={form.scheduleType === 'asNeeded'}
            onClick={() => setForm({ ...form, scheduleType: 'asNeeded' })}
          >
            Doraźnie
          </Chip>
        </div>
        {form.scheduleType === 'daily' && (
          <>
            <div className={styles.chips}>
              {[...new Set([...PRESET_TIMES, ...form.times])].sort().map((t) => (
                <Chip
                  key={t}
                  selected={form.times.includes(t)}
                  onClick={() => setForm({ ...form, times: toggleTime(form.times, t) })}
                >
                  {t}
                </Chip>
              ))}
            </div>
            <div className={styles.row}>
              <TextField
                label="Inna godzina"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
              <Button variant="secondary" onClick={addCustomTime} disabled={!customTime}>
                Dodaj
              </Button>
            </div>
            {errors.times && <span className={styles.error}>{errors.times}</span>}
          </>
        )}
      </fieldset>

      {!changing && (
        <div className={styles.row}>
          <TextField
            label="Od"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            error={errors.startDate}
          />
          <TextField
            label="Do (opcjonalnie)"
            type="date"
            value={form.endDate}
            min={form.startDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            error={errors.endDate}
          />
        </div>
      )}

      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <Button type="submit" block disabled={saving}>
        {saving
          ? 'Zapisywanie…'
          : changing
            ? 'Zapisz nową dawkę'
            : medication
              ? 'Zapisz zmiany'
              : 'Dodaj lek'}
      </Button>
    </form>
  );
}
