import { DOCTOR_DEMO_PATH, isDemo } from '../demo/demoMode';
import { useSession } from '../session/SessionContext';
import { formatRemaining } from '../session/session.logic';
import { useNow } from '../session/useNow';
import { useQrImage } from './useQrImage';
import styles from './Screens.module.css';

const PREVIOUS_END_TEXT = {
  ended: 'Wizyta zakończona.',
  expired: 'Sesja wygasła.',
  error: 'Połączenie z pacjentem zostało przerwane.',
  mismatch: 'Kody weryfikacyjne były niezgodne. Połączenie zostało przerwane.',
} as const;

export function QrScreen() {
  const { qrPayload, expiresAt, previousEnd } = useSession();
  const qr = useQrImage(qrPayload);
  const now = useNow();
  return (
    <section className={styles.center}>
      {previousEnd && (
        <p className={styles.notice} role="status">
          {PREVIOUS_END_TEXT[previousEnd]} Dane pacjenta zostały usunięte z pamięci tej karty.
        </p>
      )}
      <h1 className={styles.title}>Kod QR do zeskanowania przez pacjenta</h1>
      <p className={styles.lead}>
        W aplikacji pacjenta: <strong>Wizyta → Udostępnij lekarzowi</strong>. Dane są szyfrowane na
        telefonie i odszyfrowywane wyłącznie w tej karcie.
      </p>
      <div className={styles.qrBox} data-tour="qr">
        {qr.src && <img className={styles.qr} src={qr.src} alt="Kod QR sesji" />}
        {qr.error && <p className={styles.error}>{qr.error}</p>}
        {!qr.src && !qr.error && <p className={styles.muted}>Generowanie kodu…</p>}
      </div>
      {!isDemo && (
        <a className={styles.demoLink} href={DOCTOR_DEMO_PATH}>
          Wersja demonstracyjna
        </a>
      )}
      {expiresAt && (
        <p className={styles.muted}>
          Kod ważny przez {formatRemaining(expiresAt, now)}. Po tym czasie zostanie odświeżony
          automatycznie.
        </p>
      )}
    </section>
  );
}
