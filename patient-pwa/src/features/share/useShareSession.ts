import { useCallback, useEffect, useRef, useState } from 'react';
import { connect, relayUrl, type PatientConnection, type ShareSnapshot } from '@ez/shared';

export type ShareSessionState =
  | { step: 'scan'; error?: string }
  | { step: 'connecting' }
  | { step: 'ready'; code: string; error?: string }
  | { step: 'sending'; code: string; sent: number; total: number }
  | { step: 'sent'; code: string }
  | { step: 'ended'; reason: string };

const ENDED: Record<string, string> = {
  ended: 'Wizyta została zakończona przez lekarza.',
  expired: 'Sesja wygasła. Poproś lekarza o wygenerowanie nowego kodu.',
  error: 'Połączenie zostało przerwane. Poproś lekarza o wygenerowanie nowego kodu.',
};

/** Phone side of sharing: join from the scanned QR, send the snapshot, leave or end. */
export function useShareSession() {
  const [state, setState] = useState<ShareSessionState>({ step: 'scan' });
  const conn = useRef<PatientConnection>();
  const sent = useRef(false);

  // Leaving the screen after sending keeps the doctor's view; leaving before ends the session.
  useEffect(
    () => () => {
      if (sent.current) conn.current?.disconnect();
      else conn.current?.close();
    },
    [],
  );

  const join = useCallback(async (qrPayload: string) => {
    setState({ step: 'connecting' });
    try {
      const c = await connect(relayUrl(window.location.origin), qrPayload);
      conn.current = c;
      c.onStatus((status) => {
        if (status === 'ended' || status === 'expired' || status === 'error') {
          if (conn.current === c)
            setState({ step: 'ended', reason: ENDED[status] ?? ENDED.error! });
        }
      });
      setState((s) => (s.step === 'ended' ? s : { step: 'ready', code: c.verificationCode }));
    } catch (err) {
      setState({
        step: 'scan',
        error: err instanceof Error ? err.message : 'Nie udało się połączyć z lekarzem',
      });
    }
  }, []);

  const send = useCallback(async (snapshot: ShareSnapshot) => {
    const c = conn.current;
    if (!c) return;
    const code = c.verificationCode;
    setState({ step: 'sending', code, sent: 0, total: 1 });
    try {
      await c.sendSnapshot(snapshot, (n, total) =>
        setState({ step: 'sending', code, sent: n, total }),
      );
      sent.current = true;
      setState({ step: 'sent', code });
    } catch (err) {
      setState((s) =>
        s.step === 'ended'
          ? s
          : {
              step: 'ready',
              code,
              error: err instanceof Error ? err.message : 'Nie udało się wysłać danych',
            },
      );
    }
  }, []);

  /** The code on the doctor's screen is different: abort, nothing is sent. */
  const rejectCode = useCallback(() => {
    const c = conn.current;
    conn.current = undefined;
    c?.rejectVerification();
    setState({
      step: 'ended',
      reason:
        'Kody weryfikacyjne były niezgodne, dlatego dane nie zostały wysłane. Poproś lekarza o nowy kod i zeskanuj go ponownie.',
    });
  }, []);

  /** "Zakończ udostępnianie": the doctor's tab forgets the data. */
  const end = useCallback(() => {
    const c = conn.current;
    conn.current = undefined;
    c?.close();
    setState({
      step: 'ended',
      reason: 'Udostępnianie zakończone. Dane nie są już dostępne dla lekarza.',
    });
  }, []);

  const rescan = useCallback(() => {
    conn.current?.close();
    conn.current = undefined;
    sent.current = false;
    setState({ step: 'scan' });
  }, []);

  return { state, join, send, end, rescan, rejectCode };
}
