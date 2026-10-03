import { useEffect } from 'react';
import { DEMO_QR_CHANNEL } from './demoMode';

/** Answers the patient demo tab's request with the QR payload of the session waiting for a patient. */
export function useQrChannel(qrPayload: string | undefined): void {
  useEffect(() => {
    if (!qrPayload) return;
    const channel = new BroadcastChannel(DEMO_QR_CHANNEL);
    channel.onmessage = (e: MessageEvent<unknown>) => {
      const data = e.data;
      if (typeof data === 'object' && data !== null && 'type' in data && data.type === 'request') {
        channel.postMessage({ type: 'qr', payload: qrPayload });
      }
    };
    return () => channel.close();
  }, [qrPayload]);
}
