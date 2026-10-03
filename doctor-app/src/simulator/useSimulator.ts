import { useCallback, useEffect, useRef, useState } from 'react';
import {
  connect,
  createDemoSnapshot,
  relayUrl,
  type PatientConnection,
  type TransportStatus,
} from '@ez/shared';

export interface SimulatorState {
  status: TransportStatus | 'idle';
  code?: string;
  progress?: { sent: number; total: number };
  error?: string;
}

/** Plays the patient's phone: joins the doctor's session and sends the "Pani Anna" demo snapshot. */
export function useSimulator() {
  const [state, setState] = useState<SimulatorState>({ status: 'idle' });
  const conn = useRef<PatientConnection>();
  const offStatus = useRef<() => void>();

  const disconnect = useCallback(() => {
    offStatus.current?.();
    conn.current?.close();
    conn.current = undefined;
  }, []);
  useEffect(() => disconnect, [disconnect]);

  const join = useCallback(
    async (qrPayload: string) => {
      disconnect();
      setState({ status: 'connecting' });
      try {
        const c = await connect(relayUrl(window.location.origin), qrPayload.trim());
        conn.current = c;
        offStatus.current = c.onStatus((status) => setState((s) => ({ ...s, status })));
        setState((s) => ({ ...s, code: c.verificationCode }));
      } catch (err) {
        setState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Nie udało się połączyć',
        });
      }
    },
    [disconnect],
  );

  const send = useCallback(async () => {
    const c = conn.current;
    if (!c) return;
    setState((s) => ({ ...s, error: undefined, progress: undefined }));
    try {
      await c.sendSnapshot(createDemoSnapshot(new Date().toISOString()), (sent, total) =>
        setState((s) => ({ ...s, progress: { sent, total } })),
      );
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Nie udało się wysłać',
      }));
    }
  }, []);

  const end = useCallback(() => {
    disconnect();
    setState({ status: 'ended' });
  }, [disconnect]);

  return { ...state, join, send, end };
}
