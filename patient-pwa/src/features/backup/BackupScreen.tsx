import { useState, type FormEvent } from 'react';
import { MIN_PASSWORD } from '../../db';
import { Button, Card, LoadingState, PageHeader, TextField } from '../../ui';
import { ImportForm } from './components/ImportForm';
import { useExport } from './useExport';
import styles from './BackupScreen.module.css';

export function BackupScreen() {
  const exp = useExport();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void exp.run(password, repeat);
  };
  return (
    <>
      <PageHeader title="Kopia zapasowa" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Dane są przechowywane wyłącznie na tym urządzeniu. Zaszyfrowana kopia zapasowa (np. na
          dysku lub w chmurze) umożliwia przeniesienie danych na nowe urządzenie lub ich
          odtworzenie.
        </p>
        <h2 className={styles.heading}>Utwórz kopię</h2>
        <Card className={styles.warning} role="note">
          <strong>Hasła nie można odzyskać.</strong> Bez niego odtworzenie danych z kopii nie jest
          możliwe. Przechowuj je w bezpiecznym miejscu.
        </Card>
        {exp.state.step === 'working' ? (
          <LoadingState label="Szyfrowanie kopii…" />
        ) : exp.state.step === 'done' ? (
          <Card>
            <p className={styles.success}>Kopia zapisana: {exp.state.fileName}</p>
            <Button variant="secondary" onClick={exp.reset}>
              Utwórz kolejną
            </Button>
          </Card>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <TextField
              label={`Hasło do kopii (min. ${MIN_PASSWORD} znaków)`}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Powtórz hasło"
              type="password"
              autoComplete="new-password"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              error={exp.state.error}
            />
            <Button type="submit" block>
              Zapisz zaszyfrowaną kopię
            </Button>
          </form>
        )}

        <h2 className={styles.heading}>Przywracanie danych z kopii</h2>
        <ImportForm />
      </div>
    </>
  );
}
