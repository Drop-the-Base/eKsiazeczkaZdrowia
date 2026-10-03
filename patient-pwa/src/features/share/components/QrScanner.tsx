import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './QrScanner.module.css';

/** Back camera QR scanner; calls `onResult` once with the decoded text. */
export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const id = `qr-${useId().replace(/:/g, '')}`;
  const [error, setError] = useState<string>();
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const scanner = new Html5Qrcode(id, { verbose: false });
    let done = false;
    const started = scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (text) => {
          if (done) return;
          done = true;
          onResultRef.current(text);
        },
        () => undefined, // called for every frame without a QR code – not an error
      )
      .then(() => true)
      .catch(() => {
        setError(
          'Brak dostępu do aparatu. Zezwól na aparat w przeglądarce albo wklej kod poniżej.',
        );
        return false;
      });

    return () => {
      done = true;
      void started
        .then((running) => (running ? scanner.stop() : undefined))
        .then(() => scanner.clear())
        .catch((err: unknown) => console.warn('Nie udało się zatrzymać aparatu', err));
    };
  }, [id]);

  return (
    <div className={styles.wrap}>
      <div id={id} className={styles.viewport} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
