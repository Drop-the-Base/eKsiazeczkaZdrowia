import type { FormEvent } from 'react';
import { Button, TextField } from '../../../ui';
import { useAddVisitNote } from '../useVisitList';
import styles from './NoteForm.module.css';

/** Text now; `<VoiceInput mode="tellDoctor">` replaces the field once A16 lands. */
export function NoteForm({ onSaved, autoFocus }: { onSaved?: () => void; autoFocus?: boolean }) {
  const form = useAddVisitNote();
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (await form.submit()) onSaved?.();
  };
  return (
    <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
      <TextField
        label="Powiem lekarzowi, że…"
        placeholder="np. po nowym leku kręci mi się w głowie"
        value={form.text}
        onChange={(e) => form.setText(e.target.value)}
        error={form.error}
        autoFocus={autoFocus}
        enterKeyHint="done"
      />
      <Button type="submit" disabled={form.saving} block>
        Dodaj do listy
      </Button>
    </form>
  );
}
