import { useCallback, useEffect, useState } from 'react';
import {
  createSession,
  relayUrl,
  type DoctorSession,
  type ShareSnapshot,
  type TransportStatus,
} from '@ez/shared';
import { isTerminal } from './session.logic';

export type EndReason = 'ended' | 'expired' | 'error';

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
  /** How the previous visit in this tab ended (shown once above the new QR code). */
  previousEnd?: EndReason;
  /** Ends the visit: tells the phone, then reloads the tab with an empty memory. */
  end(): void;
  /** Tries again after the server could not be reached. */
  retry(): void;
  rejectVerification(): void;
}

const END_PARAM = 'koniec';

/**
 * Reloads the tab. React keeps old component trees and detached DOM for a while, so a fresh page
 * is the only way to be sure the patient's data is gone from memory.
 */
function reloadClean(reason?: EndReason): void {
  const url = new URL(window.location.href);
  url.hash = '';
  if (reason) url.searchParams.set(END_PARAM, reason);
  else url.searchParams.delete(END_PARAM);
  window.location.replace(url);
}

/** Read once per page load (not in a state initializer: StrictMode would run it twice). */
const PREVIOUS_END: EndReason | undefined = (() => {
  const url = new URL(window.location.href);
  const reason = url.searchParams.get(END_PARAM);
  if (!reason) return undefined;
  url.searchParams.delete(END_PARAM);
  window.history.replaceState(null, '', url);
  return reason === 'ended' || reason === 'expired' || reason === 'error' ? reason : undefined;
})();

export function useDoctorSession(): DoctorSessionApi {
  const [session, setSession] = useState<DoctorSession>();
  const [state, setState] = useState<DoctorSessionState>({ status: 'connecting' });

  useEffect(() => {
    let cancelled = false;
    let current: DoctorSession | undefined;
    const offs: (() => void)[] = [];
    const unsubscribe = () => offs.splice(0).forEach((off) => off());

    createSession(relayUrl(window.location.origin))
      .then((s) => {
        if (cancelled) return s.close();
        current = s;
        setSession(s);
        setState((st) => ({ ...st, qrPayload: s.qrPayload, expiresAt: s.expiresAt }));
        let patientJoined = false;
        offs.push(
          s.onStatus((status) => {
            // Any end of the session: start over in a fresh page. An unused QR code is replaced silently.
            if (isTerminal(status))
              return reloadClean(patientJoined ? (status as EndReason) : undefined);
            setState((st) => ({ ...st, status }));
          }),
          s.onVerificationCode((code) => {
            patientJoined = true;
            setState((st) => ({ ...st, code }));
          }),
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

    // Closing the tab ends the visit for the phone too (without redirecting the closing tab).
    const onPageHide = () => {
      unsubscribe();
      current?.close();
    };
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      cancelled = true;
      unsubscribe();
      current?.close();
    };
  }, []);

  const end = useCallback(() => session?.close(), [session]);
  const retry = useCallback(() => reloadClean(), []);
  const rejectVerification = useCallback(() => session?.rejectVerification(), [session]);

  return { ...state, previousEnd: PREVIOUS_END, end, retry, rejectVerification };
}
