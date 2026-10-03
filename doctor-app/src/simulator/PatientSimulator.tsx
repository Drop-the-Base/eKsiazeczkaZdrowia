import { useEffect, useRef, useState } from 'react';
import { statusLabel } from '../session/session.logic';
import styles from '../components/Screens.module.css';
import { useSimulator } from './useSimulator';

/** Dev page `/lekarz/?symulator#<qr payload>`: a stand-in for the patient's phone. */
export function PatientSimulator() {
  const sim = useSimulator();
  const [payload, setPayload] = useState(() => decodeURIComponent(window.location.hash.slice(1)));
  const { join } = sim;
  // Once only: StrictMode re-runs effects, and a second join would be rejected as "session full".
  const autoJoined = useRef(false);

  useEffect(() => {
    const fromHash = decodeURIComponent(window.location.hash.slice(1));
    if (!fromHash || autoJoined.current) return;
    autoJoined.current = true;
    void join(fromHash);
  }, [join]);

  const connected =
    sim.status === 'connected' || sim.status === 'transferring' || sim.status === 'received';
  return (
    <section className={styles.center}>
      <h1 className={styles.title}>Symulator telefonu pacjenta</h1>
      <p className={styles.lead}>
        Wysyła dane demo Pani Anny do aplikacji lekarza tą samą, szyfrowaną drogą co telefon.
      </p>
      {sim.status === 'idle' || sim.status === 'error' || sim.status === 'ended' ? (
        <>
          <textarea
            className={styles.textarea}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Dane z kodu QR lekarza"
            rows={4}
          />
          <button
            type="button"
            className={styles.primary}
            disabled={!payload.trim()}
            onClick={() => void join(payload)}
          >
            Połącz z lekarzem
          </button>
        </>
      ) : (
        <p>Status: {statusLabel(sim.status)}</p>
      )}
      {sim.code && connected && (
        <p className={styles.title} aria-label="Kod weryfikacyjny">
          Kod: {sim.code}
        </p>
      )}
      {connected && (
        <button
          type="button"
          className={styles.primary}
          disabled={sim.status === 'transferring'}
          onClick={() => void sim.send()}
        >
          Wyślij dane demo
        </button>
      )}
      {sim.progress && (
        <p className={styles.muted}>
          Wysłano {sim.progress.sent} z {sim.progress.total} części
        </p>
      )}
      {sim.status === 'received' && <p>Lekarz potwierdził odbiór danych.</p>}
      {sim.error && <p className={styles.error}>{sim.error}</p>}
      {connected && (
        <button type="button" className={styles.secondary} onClick={sim.end}>
          Rozłącz
        </button>
      )}
    </section>
  );
}
