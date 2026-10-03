import { useState, type FormEvent } from 'react';
import { DEMO_BACKUP_PASSWORD, isDemo } from '../../../demoMode';
import { Button, Card, LoadingState, TextField } from '../../../ui';
import { useImport } from '../useImport';
import styles from '../BackupScreen.module.css';

export function ImportForm() {
  const imp = useImport();
  const [file, setFile] = useState<File>();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void imp.run(file, password, confirmed);
  };

  if (imp.state.step === 'working') return <LoadingState label="Odszyfrowywanie kopii…" />;
  if (imp.state.step === 'done') {
    const s = imp.state.summary;
    return (
      <Card>
        <p className={styles.success}>Dane przywrócone z kopii</p>
        <p className={styles.lead}>
          Leki: {s.medications} · badania: {s.exams} · objawy: {s.symptoms} · zdjęcia: {s.photos} ·
          wizyty: {s.visits}
        </p>
      </Card>
    );
  }
  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.file}>
        Plik kopii (.json)
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </label>
      {isDemo && (
        <div className={styles.demoHint}>
          <span>
            Hasło do testów demo: <strong>{DEMO_BACKUP_PASSWORD}</strong>
          </span>
          <button
            type="button"
            className={styles.demoFill}
            onClick={() => setPassword(DEMO_BACKUP_PASSWORD)}
          >
            Uzupełnij
          </button>
        </div>
      )}
      <TextField
        label="Hasło kopii"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        Zastąp wszystkie dane na tym urządzeniu danymi z kopii
      </label>
      {imp.state.error && (
        <p className={styles.error} role="alert">
          {imp.state.error}
        </p>
      )}
      <Button type="submit" block variant="secondary">
        Przywróć dane
      </Button>
    </form>
  );
}
