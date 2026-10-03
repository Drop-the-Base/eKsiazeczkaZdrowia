import { useSession } from '../session/SessionContext';
import styles from './Screens.module.css';

const MESSAGES = {
  connecting: { title: 'Łączenie z serwerem…', lead: '' },
  connected: { title: 'Telefon pacjenta połączony', lead: 'Oczekiwanie na przesłanie danych przez pacjenta.' },
  transferring: { title: 'Odbieranie danych…', lead: 'Dane są odszyfrowywane lokalnie w tej karcie.' },
  error: { title: 'Nie udało się połączyć z serwerem', lead: 'Sprawdź połączenie z internetem.' },
} as const;

export type StatusScreenStatus = keyof typeof MESSAGES;

export function StatusScreen({ status }: { status: StatusScreenStatus }) {
  const { retry, error } = useSession();
  const msg = MESSAGES[status];
  return (
    <section className={styles.center}>
      <h1 className={styles.title}>{msg.title}</h1>
      {msg.lead && <p className={styles.lead}>{msg.lead}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {status === 'error' && (
        <button type="button" className={styles.primary} onClick={retry}>
          Spróbuj ponownie
        </button>
      )}
    </section>
  );
}
