import { useState, type FormEvent } from 'react';
import { DEMO_PIN, isDemo } from '../../demoMode';
import { Button, Card, LoadingState, PageHeader } from '../../ui';
import { lockNow } from './autoLock';
import { PinField } from './components/PinField';
import { useSecurity } from './useSecurity';
import styles from './SecurityScreen.module.css';

export function SecurityScreen() {
  const sec = useSecurity();
  const [pin, setPin] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    sec.enable(pin);
    setPin('');
  };
  return (
    <>
      <PageHeader title="Zabezpieczenia" />
      <div className={styles.content} data-tour="security">
        <p className={styles.lead}>
          Dane są szyfrowane kluczem wyprowadzonym z PIN-u. Aplikacja blokuje się automatycznie po
          kilku minutach działania w tle.
        </p>
        {isDemo && (!sec.supported || sec.enabled) && (
          <div className={styles.demoHint}>
            <span>
              PIN w trybie demo: <strong>{DEMO_PIN}</strong>
            </span>
          </div>
        )}
        <Card className={styles.card}>
          <h2 className={styles.heading}>Odblokowanie biometryczne</h2>
          {!sec.supported ? (
            <p className={styles.lead}>Funkcja niedostępna w tej przeglądarce. Użyj PIN-u.</p>
          ) : sec.enabled === undefined ? (
            <LoadingState />
          ) : sec.enabled ? (
            <>
              <p className={styles.on}>Włączone. PIN pozostaje aktywny jako alternatywna metoda.</p>
              <Button variant="secondary" onClick={sec.disable} disabled={sec.busy}>
                Wyłącz
              </Button>
            </>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <p className={styles.lead}>
                Potwierdź PIN. Następnie urządzenie poprosi o weryfikację biometryczną.
              </p>
              <PinField label="PIN" value={pin} onChange={setPin} />
              {isDemo && (
                <div className={styles.demoHint}>
                  <span>
                    PIN w trybie demo: <strong>{DEMO_PIN}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.demoFill}
                    onClick={() => setPin(DEMO_PIN)}
                    data-tour="demo-fill-pin"
                  >
                    Uzupełnij
                  </button>
                </div>
              )}
              <Button type="submit" disabled={sec.busy || pin.length < 4}>
                {sec.busy ? 'Oczekiwanie na urządzenie…' : 'Włącz'}
              </Button>
            </form>
          )}
          {sec.error && (
            <p className={styles.error} role="alert">
              {sec.error}
            </p>
          )}
        </Card>
        <Button block variant="secondary" onClick={lockNow}>
          Zablokuj teraz
        </Button>
      </div>
    </>
  );
}
