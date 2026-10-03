import { useState, type FormEvent } from 'react';
import type { Profile } from '@ez/shared';
import { BottomSheet, Button, Chip, TextField, todayIso } from '../../../ui';
import {
  addAllergy,
  BLOOD_TYPES,
  validateProfile,
  type ProfileErrors,
  type ProfileForm,
} from '../profile.logic';
import { saveProfile } from '../useProfile';
import styles from './ProfileSheet.module.css';

type Props = { open: boolean; onClose: () => void; profile: Profile | undefined };

const toForm = (p: Profile | undefined): ProfileForm => ({
  name: p?.name ?? '',
  birthDate: p?.birthDate ?? '',
  bloodType: p?.bloodType ?? '',
  allergies: p?.allergies ?? [],
});

export function ProfileSheet({ open, onClose, profile }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Edytuj profil">
      {/* key: świeży stan formularza przy każdym otwarciu */}
      {open && <ProfileFormView key={profile?.id ?? 'new'} profile={profile} onDone={onClose} />}
    </BottomSheet>
  );
}

function ProfileFormView({
  profile,
  onDone,
}: {
  profile: Profile | undefined;
  onDone: () => void;
}) {
  const [form, setForm] = useState(() => toForm(profile));
  const [allergyText, setAllergyText] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const addCurrentAllergy = () => {
    setForm((f) => ({ ...f, allergies: addAllergy(f.allergies, allergyText) }));
    setAllergyText('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const allergies = addAllergy(form.allergies, allergyText);
    const next = { ...form, allergies };
    const found = validateProfile(next, todayIso());
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile(next, profile);
      onDone();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nie udało się zapisać profilu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="Imię i nazwisko"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        autoComplete="name"
      />
      <TextField
        label="Data urodzenia"
        type="date"
        value={form.birthDate}
        max={todayIso()}
        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
        error={errors.birthDate}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Grupa krwi</legend>
        <div className={styles.chips}>
          {BLOOD_TYPES.map((t) => (
            <Chip
              key={t}
              selected={form.bloodType === t}
              onClick={() => setForm({ ...form, bloodType: form.bloodType === t ? '' : t })}
            >
              {t}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Alergie</legend>
        {form.allergies.length > 0 && (
          <div className={styles.chips}>
            {form.allergies.map((a) => (
              <Chip
                key={a}
                onClick={() =>
                  setForm({ ...form, allergies: form.allergies.filter((x) => x !== a) })
                }
              >
                {a} ✕
              </Chip>
            ))}
          </div>
        )}
        <div className={styles.addRow}>
          <TextField
            label="Dodaj alergię"
            value={allergyText}
            placeholder="np. penicylina"
            onChange={(e) => setAllergyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCurrentAllergy();
              }
            }}
          />
          <Button variant="secondary" onClick={addCurrentAllergy} disabled={!allergyText.trim()}>
            Dodaj
          </Button>
        </div>
      </fieldset>

      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}
      <Button type="submit" block disabled={saving}>
        {saving ? 'Zapisywanie…' : 'Zapisz'}
      </Button>
    </form>
  );
}
