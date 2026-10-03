/** `eksiazeczka-kopia-2026-10-03.json` */
export function backupFileName(today: string): string {
  return `eksiazeczka-kopia-${today}.json`;
}

export function validateNewPassword(
  password: string,
  repeat: string,
  min: number,
): string | undefined {
  if (password.length < min) return `Hasło musi mieć co najmniej ${min} znaków`;
  if (password !== repeat) return 'Hasła się różnią';
  return undefined;
}

const DAY_MS = 24 * 3600 * 1000;
/** Next export reminder: a month after the last backup, at 10:00 local time. */
export function nextExportReminder(now: Date): string {
  const d = new Date(now.getTime() + 30 * DAY_MS);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}
