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
          Twoje dane są tylko na tym telefonie. Zapisz zaszyfrowaną kopię (np. na dysku albo w
          chmurze), żeby przenieść je na nowy telefon albo odzyskać po utracie tego.
        </p>
        <h2 className={styles.heading}>Zapisz kopię</h2>
        <Card className={styles.warning} role="note">
          <strong>Hasła nie da się odzyskać.</strong> Bez niego kopia jest bezużyteczna – także dla
          nas. Zapisz je w bezpiecznym miejscu.
        </Card>
        {exp.state.step === 'working' ? (
          <LoadingState label="Szyfruję kopię…" />
        ) : exp.state.step === 'done' ? (
          <Card>
            <p className={styles.success}>✓ Kopia zapisana: {exp.state.fileName}</p>
            <Button variant="secondary" onClick={exp.reset}>
              Zrób kolejną
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

        <h2 className={styles.heading}>Wczytaj kopię na tym telefonie</h2>
        <ImportForm />
      </div>
    </>
  );
}
