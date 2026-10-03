import { createContext, useContext, type ReactNode } from 'react';
import { useDoctorSession, type DoctorSessionApi } from './useDoctorSession';

const SessionContext = createContext<DoctorSessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  return <SessionContext.Provider value={useDoctorSession()}>{children}</SessionContext.Provider>;
}

export function useSession(): DoctorSessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession poza SessionProvider');
  return ctx;
}
