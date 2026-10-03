import { describe, expect, it } from 'vitest';
import { backupFileName, validateNewPassword } from './backup.logic';

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
