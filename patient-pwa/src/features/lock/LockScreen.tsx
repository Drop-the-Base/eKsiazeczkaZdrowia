import { useState, type FormEvent } from 'react';
import { Button, LoadingState } from '../../ui';
import { PinField } from './components/PinField';
import { useLock } from './useLock';
import styles from './LockScreen.module.css';

function SetupPin({ lock }: { lock: ReturnType<typeof useLock> }) {
  const [pin, setPin] = useState('');
  const [repeat, setRepeat] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    lock.setup(pin, repeat);
  };
  return (
    <form className={styles.card} onSubmit={submit}>
      <h1 className={styles.title}>Ustaw PIN</h1>
      <p className={styles.lead}>
        PIN szyfruje Twoje dane zdrowotne na tym telefonie. Bez niego nikt ich nie odczyta – także
        my. <strong>PIN-u nie da się odzyskać.</strong>
      </p>
      <PinField label="PIN (4–8 cyfr)" value={pin} onChange={setPin} autoFocus />
      <PinField label="Powtórz PIN" value={repeat} onChange={setRepeat} />
      {lock.error && (
        <p className={styles.error} role="alert">
          {lock.error}
        </p>
      )}
      <Button type="submit" block disabled={lock.busy}>
        {lock.busy ? 'Szyfruję…' : 'Ustaw PIN'}
      </Button>
    </form>
  );
}

function UnlockPin({ lock }: { lock: ReturnType<typeof useLock> }) {
  const [pin, setPin] = useState('');
  const [forgot, setForgot] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    lock.unlock(pin);
    setPin('');
  };
  return (
    <form className={styles.card} onSubmit={submit}>
      <h1 className={styles.title}>Wpisz PIN</h1>
      <PinField label="PIN" value={pin} onChange={setPin} autoFocus />
      {lock.error && (
        <p className={styles.error} role="alert">
          {lock.error}
        </p>
      )}
      <Button type="submit" block disabled={lock.busy || pin.length < 4}>
        {lock.busy ? 'Odblokowuję…' : 'Odblokuj'}
      </Button>
      {!forgot ? (
        <button type="button" className={styles.link} onClick={() => setForgot(true)}>
          Nie pamiętam PIN-u
        </button>
      ) : (
        <div className={styles.forgot}>
          <p>
            Dane są zaszyfrowane PIN-em i nie da się ich odczytać bez niego. Możesz usunąć dane z
            tego telefonu i zacząć od nowa (albo potem wczytać kopię zapasową).
          </p>
          <Button block variant="danger" onClick={lock.wipe} disabled={lock.busy}>
            Usuń wszystkie dane i zacznij od nowa
          </Button>
        </div>
      )}
    </form>
  );
}

/** Covers the whole app until the encrypted database is unlocked. */
export function LockScreen() {
  const lock = useLock();
  if (lock.status === 'unlocked') return null;
  return (
    <div className={styles.cover} role="dialog" aria-modal="true" aria-label="Blokada aplikacji">
      {lock.status === 'checking' && <LoadingState />}
      {lock.status === 'no-pin' && <SetupPin lock={lock} />}
      {lock.status === 'locked' && <UnlockPin lock={lock} />}
      {lock.status === 'error' && (
        <div className={styles.card}>
          <h1 className={styles.title}>Nie udało się otworzyć danych</h1>
          <Button block onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}
    </div>
  );
}
