import { useSession } from '../session/SessionContext';
import { formatRemaining } from '../session/session.logic';
import { useNow } from '../session/useNow';
import { useQrImage } from './useQrImage';
import styles from './Screens.module.css';

export function QrScreen() {
  const { qrPayload, expiresAt } = useSession();
  const qr = useQrImage(qrPayload);
  const now = useNow();
  return (
    <section className={styles.center}>
      <h1 className={styles.title}>Zeskanuj kod telefonem pacjenta</h1>
      <p className={styles.lead}>
        W aplikacji pacjenta: <strong>Wizyta → Udostępnij lekarzowi</strong>. Dane są szyfrowane na
        telefonie i odszyfrowywane tylko w tej karcie.
      </p>
      <div className={styles.qrBox}>
        {qr.src && <img className={styles.qr} src={qr.src} alt="Kod QR sesji" />}
        {qr.error && <p className={styles.error}>{qr.error}</p>}
        {!qr.src && !qr.error && <p className={styles.muted}>Generowanie kodu…</p>}
      </div>
      {expiresAt && (
        <p className={styles.muted}>
          Kod ważny jeszcze {formatRemaining(expiresAt, now)}; potem odświeży się sam.
        </p>
      )}
    </section>
  );
}
