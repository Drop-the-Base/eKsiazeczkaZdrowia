import { useCallback, useEffect, useState } from 'react';
import { biometric, biometricSupported, BiometricUnavailableError, WrongPinError } from '../../db';

/** Biometric unlock settings (passkey with PRF); the PIN always stays as a fallback. */
export function useSecurity() {
  const supported = biometricSupported();
  const [enabled, setEnabled] = useState<boolean>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setEnabled(await biometric.isEnabled());
    } catch {
      setError('Nie udało się odczytać ustawień');
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(
        err instanceof WrongPinError
          ? 'Nieprawidłowy PIN'
          : err instanceof BiometricUnavailableError
            ? err.message
            : 'Operacja nie powiodła się. Spróbuj ponownie.',
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    supported,
    enabled,
    error,
    busy,
    enable: (pin: string) => void run(() => biometric.enable(pin)),
    disable: () => void run(() => biometric.disable()),
  };
}
