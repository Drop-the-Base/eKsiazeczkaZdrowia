import { useSession } from '../session/SessionContext';
import styles from './Screens.module.css';

const MESSAGES = {
  connecting: { title: 'Łączenie z serwerem…', lead: '' },
  connected: { title: 'Telefon pacjenta połączony', lead: 'Czekamy, aż pacjent wyśle dane.' },
  transferring: { title: 'Odbieranie danych…', lead: 'Dane są odszyfrowywane w tej karcie.' },
  ended: { title: 'Wizyta zakończona', lead: 'Dane pacjenta usunięte z pamięci tej karty.' },
  expired: { title: 'Sesja wygasła', lead: 'Dane pacjenta usunięte z pamięci tej karty.' },
  error: { title: 'Połączenie przerwane', lead: 'Dane pacjenta usunięte z pamięci tej karty.' },
} as const;

export function StatusScreen({ status }: { status: keyof typeof MESSAGES }) {
  const { restart, error } = useSession();
  const msg = MESSAGES[status];
  const canRestart = status === 'ended' || status === 'expired' || status === 'error';
  return (
    <section className={styles.center}>
      <h1 className={styles.title}>{msg.title}</h1>
      {msg.lead && <p className={styles.lead}>{msg.lead}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {canRestart && (
        <button type="button" className={styles.primary} onClick={restart}>
          Nowa wizyta
        </button>
      )}
    </section>
  );
}
