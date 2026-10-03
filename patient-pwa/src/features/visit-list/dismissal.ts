// "Do not show again today" for the before-visit sheet: a per-device convenience, not health data.
// Storage may be unavailable (private mode); then the sheet simply shows again.

const key = (reminderId: string, day: string) => `before-visit-dismissed:${reminderId}:${day}`;

export function isDismissed(reminderId: string, day: string): boolean {
  try {
    return localStorage.getItem(key(reminderId, day)) === '1';
  } catch {
    return false;
  }
}

export function dismiss(reminderId: string, day: string): void {
  try {
    localStorage.setItem(key(reminderId, day), '1');
  } catch {
    // not remembered – shown again on the next start, which is harmless
  }
}
