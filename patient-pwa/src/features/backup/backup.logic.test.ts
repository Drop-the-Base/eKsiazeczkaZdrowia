import { describe, expect, it } from 'vitest';
import { backupFileName, nextExportReminder, validateNewPassword } from './backup.logic';

describe('backup logic', () => {
  it('names the file by date', () => {
    expect(backupFileName('2026-10-03')).toBe('eksiazeczka-kopia-2026-10-03.json');
  });
  it('validates the password twice', () => {
    expect(validateNewPassword('dlugie-haslo', 'dlugie-haslo', 8)).toBeUndefined();
    expect(validateNewPassword('krotkie', 'krotkie', 8)).toMatch(/8 znaków/);
    expect(validateNewPassword('dlugie-haslo', 'inne-haslo', 8)).toMatch(/różnią/);
  });
});

describe('nextExportReminder', () => {
  it('is a month later at 10:00 local time', () => {
    const at = new Date(nextExportReminder(new Date(2026, 9, 3, 18, 0)));
    expect([at.getFullYear(), at.getMonth(), at.getDate(), at.getHours()]).toEqual([
      2026, 10, 2, 10,
    ]);
  });
});
