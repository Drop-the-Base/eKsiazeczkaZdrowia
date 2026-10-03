import { useEffect } from 'react';
import { isDemo } from '../../demoMode';
import { vault } from '../../db';
import { shouldLock } from './lock.logic';

export const DEMO_LOCKED_KEY = 'demo-locked';

/**
 * Forgets the key. In production reloads the page to clear decrypted memory; in demo keeps
 * the state and records the lock so automatic startDemo does not unlock it immediately.
 */
export function lockNow(): void {
  vault.lock();
  if (isDemo) {
    try {
      sessionStorage.setItem(DEMO_LOCKED_KEY, '1');
    } catch {
      // storage blocked
    }
    return;
  }
  window.location.reload();
}

/** After any unlock in the demo: a reload may unlock automatically again. */
export function clearDemoLock(): void {
  try {
    sessionStorage.removeItem(DEMO_LOCKED_KEY);
  } catch {
    // storage blocked
  }
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
