import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useSimulator } from '../simulator/useSimulator';

interface DemoPhone {
  /** Plays the patient's phone: joins with the QR payload and sends Pani Anna's data. */
  simulate(qrPayload: string): Promise<void>;
  busy: boolean;
  error?: string;
}

const Ctx = createContext<DemoPhone | null>(null);

/** Lives above the screens: the connection must survive the QR screen being replaced by the data. */
export function DemoPhoneProvider({ children }: { children: ReactNode }) {
  const sim = useSimulator();
  const { join, send } = sim;
  const simulate = useCallback(
    async (qrPayload: string) => {
      await join(qrPayload);
      await send();
    },
    [join, send],
  );
  const busy = sim.status === 'connecting' || sim.status === 'transferring';
  return <Ctx.Provider value={{ simulate, busy, error: sim.error }}>{children}</Ctx.Provider>;
}

export function useDemoPhone(): DemoPhone {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDemoPhone poza DemoPhoneProvider');
  return ctx;
}
