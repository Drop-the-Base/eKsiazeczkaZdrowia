import { useCallback, useState, useSyncExternalStore } from 'react';
import { vault, WrongPinError } from '../../db';
import { validateNewPin } from './lock.logic';

/** Lock state of the encrypted database and the actions of the lock screen. */
export function useLock() {
  const status = useSyncExternalStore(vault.onChange, () => vault.status);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      setError(err instanceof WrongPinError ? 'Nieprawidłowy PIN' : fallback);
    } finally {
      setBusy(false);
    }
  }, []);

  const setup = (pin: string, repeat: string) => {
    const invalid = validateNewPin(pin, repeat);
    if (invalid) return setError(invalid);
    void run(() => vault.setup(pin), 'Nie udało się zapisać PIN-u');
  };
  const unlock = (pin: string) => void run(() => vault.unlock(pin), 'Nie udało się odblokować');
  const wipe = () => void run(() => vault.wipe(), 'Nie udało się usunąć danych');

  return { status, error, busy, setup, unlock, wipe };
}
