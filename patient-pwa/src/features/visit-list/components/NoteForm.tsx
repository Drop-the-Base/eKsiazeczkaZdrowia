import { VoiceInput } from '../../voice';
import { useAddVisitNote } from '../useVisitList';
import styles from './NoteForm.module.css';

/** "Powiem lekarzowi" – spoken or typed. The field is reset only after a successful save. */
export function NoteForm({ onSaved }: { onSaved?: () => void }) {
  const form = useAddVisitNote();
  return (
    <div className={styles.form}>
      <VoiceInput
        key={form.savedCount}
        mode="tellDoctor"
        placeholder="np. po nowym leku kręci mi się w głowie"
        submitLabel="Dodaj do listy"
        clearOnSubmit={false}
        disabled={form.saving}
        onSubmit={(text) => {
          void form.submit(text).then((saved) => {
            if (saved) onSaved?.();
          });
        }}
      />
      {form.error && (
        <p className={styles.error} role="alert">
          {form.error}
        </p>
      )}
    </div>
  );
}
