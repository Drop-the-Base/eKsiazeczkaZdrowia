// `/demo/...`: the same app on a separate database with the "Pani Anna" data, for people who have
// a few minutes to see it. `/demo/lekarz` is the doctor app (served by the server, not this PWA).

export const DEMO_BASE = '/demo';
export const DOCTOR_DEMO_PATH = '/demo/lekarz';
/** Set automatically in the demo, shown on the security step. */
export const DEMO_PIN = '1234';

const path = window.location.pathname;
export const isDemo =
  (path === DEMO_BASE || path.startsWith(`${DEMO_BASE}/`)) && !path.startsWith(DOCTOR_DEMO_PATH);

const STARTED_KEY = 'demo-started';

/** True after the first start in this tab: a reload keeps what the visitor added. */
export function demoStarted(): boolean {
  try {
    return sessionStorage.getItem(STARTED_KEY) === '1';
  } catch {
    return false; // storage blocked: every load starts a fresh demo, which is fine
  }
}

export function markDemoStarted(): void {
  try {
    sessionStorage.setItem(STARTED_KEY, '1');
  } catch {
    // not remembered – the next reload starts a fresh demo
  }
}

/** Fresh "Pani Anna" data and the guide from the first step. */
export function restartDemo(): void {
  try {
    sessionStorage.clear();
  } catch {
    // nothing stored – the reload below starts fresh anyway
  }
  window.location.assign(DEMO_BASE);
}
