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
