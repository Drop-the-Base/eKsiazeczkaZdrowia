import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  biometric,
  biometricSupported,
  BiometricUnavailableError,
  vault,
  WrongPinError,
} from '../../db';
import { validateNewPin } from './lock.logic';

/** Lock state of the encrypted database and the actions of the lock screen. */
export function useLock() {
  const status = useSyncExternalStore(vault.onChange, () => vault.status);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);

  useEffect(() => {
    if (status !== 'locked' || !biometricSupported()) return;
    let active = true;
    biometric
      .isEnabled()
      .then((on) => active && setBiometricOn(on))
      .catch(() => active && setBiometricOn(false)); // no biometric option – the PIN still works
    return () => {
      active = false;
    };
  }, [status]);

  const run = useCallback(async (action: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      setError(
        err instanceof WrongPinError
          ? 'Nieprawidłowy PIN'
          : err instanceof BiometricUnavailableError
            ? err.message
            : fallback,
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const setup = (pin: string, repeat: string) => {
    const invalid = validateNewPin(pin, repeat);
    if (invalid) return setError(invalid);
    void run(() => vault.setup(pin), 'Nie udało się zapisać PIN-u');
  };
  const unlock = (pin: string) =>
    void run(async () => {
      await vault.unlock(pin);
      try {
        sessionStorage.removeItem('demo-locked');
      } catch {
        // storage blocked
      }
    }, 'Nie udało się odblokować');
  const wipe = () => void run(() => vault.wipe(), 'Nie udało się usunąć danych');
  const unlockBiometric = () =>
    void run(() => biometric.unlock(), 'Odblokowanie biometryczne nie powiodło się. Wpisz PIN.');

  return { status, error, busy, setup, unlock, wipe, biometricOn, unlockBiometric };
}
