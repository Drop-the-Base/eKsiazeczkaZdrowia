import { useEffect, useState, type FormEvent } from 'react';
import { DEMO_BASE, DEMO_PIN, isDemo } from '../../demoMode';
import { dbReady } from '../../db';
import { Button, LoadingState } from '../../ui';
import { PinField } from './components/PinField';
import { useAutoLock } from './autoLock';
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
      {lock.biometricOn && (
        <Button block onClick={lock.unlockBiometric} disabled={lock.busy}>
          Odblokuj odciskiem palca lub twarzą
        </Button>
      )}
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
  const locked = lock.status !== 'unlocked';
  const [demoError, setDemoError] = useState(false);
  // The demo sets its PIN by itself, and a visitor leaving the tab for a while must not be locked out.
  useAutoLock(!locked && !isDemo);
  useEffect(() => {
    if (!isDemo) return;
    let active = true;
    dbReady.catch(() => active && setDemoError(true));
    return () => {
      active = false;
    };
  }, []);
  // The page under the cover must not scroll (focus on the PIN field would scroll it and shift the cover).
  useEffect(() => {
    if (!locked) return;
    const { documentElement: html, body } = document;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.height = '100dvh';
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.height = '';
    };
  }, [locked]);
  if (!locked) return null;
  return (
    <div className={styles.cover} role="dialog" aria-modal="true" aria-label="Blokada aplikacji">
      <div className={styles.brand} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40">
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>eKsiazeczkaZdrowia</span>
      </div>
      {isDemo && !demoError && lock.status !== 'error' ? (
        <div className={styles.card}>
          <h1 className={styles.title}>Przygotowuję demo…</h1>
          <p className={styles.lead}>
            Dane Pani Anny są szyfrowane na tym urządzeniu PIN-em demo {DEMO_PIN}.
          </p>
          <LoadingState />
        </div>
      ) : (
        <>
          {lock.status === 'checking' && <LoadingState />}
          {lock.status === 'no-pin' && <SetupPin lock={lock} />}
          {lock.status === 'locked' && <UnlockPin lock={lock} />}
          {(lock.status === 'no-pin' || lock.status === 'locked') && (
            <a className={styles.demoLink} href={DEMO_BASE}>
              Zobacz demo w 3 minuty →
            </a>
          )}
        </>
      )}
      {(lock.status === 'error' || demoError) && (
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
