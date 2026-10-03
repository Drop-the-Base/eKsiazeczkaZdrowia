import { useEffect } from 'react';
import { vault } from '../../db';
import { shouldLock } from './lock.logic';

/**
 * Forgets the key and reloads the page: React state and detached DOM may still hold decrypted data,
 * a fresh page is the only way to be sure it is gone. The URL stays, so after the PIN the patient
 * is back on the same screen.
 */
export function lockNow(): void {
  vault.lock();
  window.location.reload();
}

/** Locks when the app comes back from the background after `LOCK_AFTER_MS`. */
export function useAutoLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    let hiddenAt: number | undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (shouldLock(hiddenAt, Date.now())) lockNow();
      else hiddenAt = undefined;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled]);
}
