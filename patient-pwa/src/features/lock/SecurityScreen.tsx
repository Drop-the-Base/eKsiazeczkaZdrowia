import { useState, type FormEvent } from 'react';
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
      <div className={styles.content}>
        <p className={styles.lead}>
          Dane są zaszyfrowane kluczem z Twojego PIN-u. Aplikacja blokuje się sama po kilku minutach
          w tle.
        </p>
        <Card className={styles.card}>
          <h2 className={styles.heading}>Odblokowanie odciskiem palca lub twarzą</h2>
          {!sec.supported ? (
            <p className={styles.lead}>Niedostępne w tej przeglądarce. Używaj PIN-u.</p>
          ) : sec.enabled === undefined ? (
            <LoadingState />
          ) : sec.enabled ? (
            <>
              <p className={styles.on}>✓ Włączone. PIN dalej działa jako zapas.</p>
              <Button variant="secondary" onClick={sec.disable} disabled={sec.busy}>
                Wyłącz
              </Button>
            </>
          ) : (
            <form className={styles.form} onSubmit={submit}>
              <p className={styles.lead}>
                Potwierdź PIN – telefon poprosi o odcisk palca albo skan twarzy.
              </p>
              <PinField label="PIN" value={pin} onChange={setPin} />
              <Button type="submit" disabled={sec.busy || pin.length < 4}>
                {sec.busy ? 'Czekam na telefon…' : 'Włącz'}
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
