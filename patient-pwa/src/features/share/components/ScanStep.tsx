import { useState } from 'react';
import { isDemo } from '../../../demoMode';
import { Button } from '../../../ui';
import { DemoDoctorLink } from '../../demo';
import { QrScanner } from './QrScanner';
import styles from './Steps.module.css';

export function ScanStep({
  onPayload,
  error,
}: {
  onPayload: (payload: string) => void;
  error?: string;
}) {
  const [manual, setManual] = useState('');
  return (
    <div className={styles.step}>
      <p className={styles.lead}>Skieruj aparat na kod QR wyświetlony na ekranie lekarza.</p>
      {isDemo && <DemoDoctorLink onPayload={onPayload} />}
      <QrScanner onResult={onPayload} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <details className={styles.manual}>
        <summary>Aparat niedostępny? Wklej kod ręcznie</summary>
        <textarea
          className={styles.textarea}
          rows={3}
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Dane z kodu QR"
        />
        <Button
          variant="secondary"
          disabled={!manual.trim()}
          onClick={() => onPayload(manual.trim())}
        >
          Połącz
        </Button>
      </details>
    </div>
  );
}
