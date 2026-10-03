import { useSession } from '../session/SessionContext';
import { formatRemaining, statusLabel } from '../session/session.logic';
import { useNow } from '../session/useNow';
import styles from './TopBar.module.css';

export function TopBar() {
  const { status, code, expiresAt, end } = useSession();
  const now = useNow();
  const live = status === 'connected' || status === 'transferring' || status === 'received';
  return (
    <header className={styles.bar}>
      <strong className={styles.brand}>eKsiazeczkaZdrowia</strong>
      <span className={styles.status} data-status={status}>
        <span className={styles.dot} aria-hidden />
        {statusLabel(status)}
      </span>
      {live && code && <span className={styles.meta}>kod {code}</span>}
      {live && expiresAt && (
        <span className={styles.meta}>sesja wygasa za {formatRemaining(expiresAt, now)}</span>
      )}
      <span className={styles.spacer} />
      {status === 'received' && (
        <button type="button" className={styles.print} onClick={() => window.print()}>
          Drukuj
        </button>
      )}
      {live && (
        <button type="button" className={styles.end} onClick={end} data-tour="end-visit">
          Zakończ wizytę
        </button>
      )}
    </header>
  );
}
