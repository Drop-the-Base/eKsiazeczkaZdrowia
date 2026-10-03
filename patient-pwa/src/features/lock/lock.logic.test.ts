import { describe, expect, it } from 'vitest';
import { validateNewPin } from './lock.logic';

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
