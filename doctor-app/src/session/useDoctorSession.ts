import { useCallback, useEffect, useState } from 'react';
import {
  createSession,
  relayUrl,
  type DoctorSession,
  type ShareSnapshot,
  type TransportStatus,
} from '@ez/shared';
import { isTerminal } from './session.logic';

export interface DoctorSessionState {
  status: TransportStatus;
  qrPayload?: string;
  expiresAt?: string;
  code?: string;
  /** Patient data – only ever in this state, never persisted. */
  snapshot?: ShareSnapshot;
  error?: string;
}

export interface DoctorSessionApi extends DoctorSessionState {
  /** Ends the visit: tells the phone, forgets keys and data. */
  end(): void;
  /** Starts a fresh session with a new QR code (and an empty memory). */
  restart(): void;
  rejectVerification(): void;
}

export function useDoctorSession(): DoctorSessionApi {
  const [generation, setGeneration] = useState(0);
  const [session, setSession] = useState<DoctorSession>();
  const [state, setState] = useState<DoctorSessionState>({ status: 'connecting' });

  useEffect(() => {
    let cancelled = false;
    let current: DoctorSession | undefined;
    const offs: (() => void)[] = [];
    setState({ status: 'connecting' });

    createSession(relayUrl(window.location.origin))
      .then((s) => {
        if (cancelled) return s.close();
        current = s;
        setSession(s);
        setState((st) => ({ ...st, qrPayload: s.qrPayload, expiresAt: s.expiresAt }));
        offs.push(
          s.onStatus((status) =>
            setState((st) =>
              isTerminal(status)
                ? { status, qrPayload: st.qrPayload, expiresAt: st.expiresAt }
                : { ...st, status },
            ),
          ),
          s.onVerificationCode((code) => setState((st) => ({ ...st, code }))),
          s.onSnapshot((snapshot) => setState((st) => ({ ...st, snapshot }))),
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            error: err instanceof Error ? err.message : 'Nie udało się połączyć',
          });
        }
      });

    return () => {
      cancelled = true;
      offs.forEach((off) => off());
      current?.close();
      setSession(undefined);
    };
  }, [generation]);

  // An unused QR code is replaced automatically; after a patient connected, the doctor decides.
  useEffect(() => {
    if (state.status === 'expired' && !state.code) setGeneration((g) => g + 1);
  }, [state.status, state.code]);

  const end = useCallback(() => {
    session?.close();
    setState({ status: 'ended' });
  }, [session]);
  const restart = useCallback(() => setGeneration((g) => g + 1), []);
  const rejectVerification = useCallback(() => session?.rejectVerification(), [session]);

  return { ...state, end, restart, rejectVerification };
}
