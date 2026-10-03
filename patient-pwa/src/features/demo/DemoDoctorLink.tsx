import { useEffect, useRef, useState } from 'react';
import { DEMO_QR_CHANNEL, DOCTOR_DEMO_PATH } from '../../demoMode';
import { Button } from '../../ui';
import styles from './DemoDoctorLink.module.css';

type Reply = { type: 'qr'; payload: string };

function isReply(v: unknown): v is Reply {
  return (
    typeof v === 'object' &&
    v !== null &&
    'type' in v &&
    v.type === 'qr' &&
    'payload' in v &&
    typeof v.payload === 'string'
  );
}

/**
 * Demo replacement for the camera: the doctor tab (`/demo/lekarz`, same browser) hands over its
 * QR payload through a BroadcastChannel. Everything after that - relay, keys, code - is the real thing.
 */
export function DemoDoctorLink({ onPayload }: { onPayload: (payload: string) => void }) {
  const channel = useRef<BroadcastChannel>();
  const taken = useRef(false);
  const latest = useRef(onPayload);
  latest.current = onPayload; // the parent passes a new function every render
  const [waiting, setWaiting] = useState(true);

  const request = () => channel.current?.postMessage({ type: 'request' });

  useEffect(() => {
    const ch = new BroadcastChannel(DEMO_QR_CHANNEL);
    channel.current = ch;
    ch.onmessage = (e: MessageEvent<unknown>) => {
      if (!isReply(e.data) || taken.current) return;
      taken.current = true; // a second answer would be rejected as "session full"
      setWaiting(false);
      latest.current(e.data.payload);
    };
    ch.postMessage({ type: 'request' });
    return () => ch.close();
  }, []);

  return (
    <div className={styles.box} role="status">
      <strong>Demo bez kamery</strong>
      <p>
        {waiting
          ? 'Szukam otwartej karty z widokiem lekarza w tej przeglądarce…'
          : 'Połączono z kartą lekarza.'}
      </p>
      {waiting && (
        <>
          <Button variant="secondary" onClick={request}>
            Spróbuj ponownie
          </Button>
          <a className={styles.link} href={DOCTOR_DEMO_PATH} target="_blank" rel="noreferrer">
            Otwórz widok lekarza w nowej karcie
          </a>
        </>
      )}
    </div>
  );
}
