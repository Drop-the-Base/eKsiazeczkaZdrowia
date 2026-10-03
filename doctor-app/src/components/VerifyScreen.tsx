import { useSession } from '../session/SessionContext';
import styles from './Screens.module.css';

/** Before any data: both screens must show the same code (protects against a key swapped by the server). */
export function VerifyScreen({ code }: { code: string }) {
  const { confirmCode, rejectVerification } = useSession();
  return (
    <section className={styles.center}>
      <h1 className={styles.title}>Weryfikacja połączenia</h1>
      <p className={styles.code} aria-label="Kod weryfikacyjny" data-tour="code">
        {code}
      </p>
      <p className={styles.lead}>
        Porównaj kod z kodem wyświetlanym na telefonie pacjenta. Kody muszą być identyczne.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={confirmCode}>
          Kody są zgodne
        </button>
        <button type="button" className={styles.danger} onClick={rejectVerification}>
          Kody są różne
        </button>
      </div>
    </section>
  );
}
