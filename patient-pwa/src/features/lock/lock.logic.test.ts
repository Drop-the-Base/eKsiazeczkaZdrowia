import { describe, expect, it } from 'vitest';
import { LOCK_AFTER_MS, shouldLock, validateNewPin } from './lock.logic';

describe('validateNewPin', () => {
  it('accepts 4–8 digits typed twice', () => {
    expect(validateNewPin('1234', '1234')).toBeUndefined();
    expect(validateNewPin('12345678', '12345678')).toBeUndefined();
  });
  it('rejects short, non-digit and different PINs', () => {
    expect(validateNewPin('123', '123')).toMatch(/4 do 8/);
    expect(validateNewPin('12a4', '12a4')).toMatch(/4 do 8/);
    expect(validateNewPin('1234', '1235')).toMatch(/różnią/);
  });
});

describe('shouldLock', () => {
  it('locks only after the limit in the background', () => {
    expect(shouldLock(undefined, 1_000_000)).toBe(false);
    expect(shouldLock(0, LOCK_AFTER_MS - 1)).toBe(false);
    expect(shouldLock(0, LOCK_AFTER_MS)).toBe(true);
  });
});
