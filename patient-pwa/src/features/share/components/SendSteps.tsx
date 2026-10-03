import { Button, LoadingState } from '../../../ui';
import type { ShareSessionState } from '../useShareSession';
import styles from './Steps.module.css';

type Props = {
  state: Exclude<ShareSessionState, { step: 'scan' }>;
  onSend: () => void;
  onReject: () => void;
  onEnd: () => void;
  onRescan: () => void;
  onDone: () => void;
};

function Code({ code }: { code: string }) {
  return (
    <div className={styles.codeBox}>
      <span className={styles.codeLabel}>Kod weryfikacyjny</span>
      <span className={styles.code}>{code}</span>
      <span className={styles.codeLabel}>Lekarz musi widzieć ten sam kod</span>
    </div>
  );
}

export function SendSteps({ state, onSend, onReject, onEnd, onRescan, onDone }: Props) {
  switch (state.step) {
    case 'connecting':
      return <LoadingState label="Łączenie z lekarzem…" />;
    case 'ready':
      return (
        <div className={styles.step}>
          <Code code={state.code} />
          {state.error && (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          )}
          <p className={styles.lead}>Czy lekarz widzi na swoim ekranie ten sam kod?</p>
          <Button block onClick={onSend}>
            Tak, wyślij dane lekarzowi
          </Button>
          <Button block variant="danger" onClick={onReject}>
            Kod się nie zgadza
          </Button>
          <Button block variant="ghost" onClick={onEnd}>
            Anuluj
          </Button>
        </div>
      );
    case 'sending':
      return (
        <div className={styles.step}>
          <Code code={state.code} />
          <progress className={styles.progress} value={state.sent} max={state.total} />
          <p className={styles.lead}>Wysyłanie zaszyfrowanych danych…</p>
        </div>
      );
    case 'sent':
      return (
        <div className={styles.step}>
          <p className={styles.success}>✓ Przesłano</p>
          <p className={styles.lead}>
            Lekarz widzi Twoje dane do końca wizyty. Dane nie zostają na jego komputerze ani na
            serwerze.
          </p>
          <Button block onClick={onDone}>
            Gotowe
          </Button>
          <Button block variant="danger" onClick={onEnd}>
            Zakończ udostępnianie teraz
          </Button>
        </div>
      );
    case 'ended':
      return (
        <div className={styles.step}>
          <p className={styles.lead}>{state.reason}</p>
          <Button block variant="secondary" onClick={onRescan}>
            Zeskanuj nowy kod
          </Button>
          <Button block variant="ghost" onClick={onDone}>
            Wróć
          </Button>
        </div>
      );
  }
}
