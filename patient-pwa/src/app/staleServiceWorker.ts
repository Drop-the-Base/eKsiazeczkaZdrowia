import { DOCTOR_DEMO_PATH } from '../demoMode';

const RESET_KEY = 'sw-reset';

/**
 * `/demo/lekarz` belongs to the doctor app, which the server serves. A service worker installed by an
 * older version of this app does not know that and answers with this PWA instead; drop it and load
 * the page again from the network. Once per tab, so a server without the doctor app cannot loop.
 * Resolves true when a reload was started.
 */
export async function leaveStaleServiceWorker(): Promise<boolean> {
  if (!window.location.pathname.startsWith(DOCTOR_DEMO_PATH)) return false;
  try {
    if (sessionStorage.getItem(RESET_KEY)) return false;
    sessionStorage.setItem(RESET_KEY, '1');
  } catch {
    return false; // storage blocked: cannot guard against a loop, so do not try
  }
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((r) => r.unregister()));
  window.location.reload();
  return true;
}
