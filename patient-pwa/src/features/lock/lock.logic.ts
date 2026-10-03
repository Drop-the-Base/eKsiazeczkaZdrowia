import { PIN_PATTERN } from '../../db/vault';

/** Error for the new-PIN form, or undefined when it can be saved. */
export function validateNewPin(pin: string, repeat: string): string | undefined {
  if (!PIN_PATTERN.test(pin)) return 'PIN musi mieć od 4 do 8 cyfr';
  if (pin !== repeat) return 'PIN-y się różnią';
  return undefined;
}

/** Back from the background after this long → PIN again. */
export const LOCK_AFTER_MS = 5 * 60 * 1000;

export function shouldLock(
  hiddenAt: number | undefined,
  now: number,
  limit = LOCK_AFTER_MS,
): boolean {
  return hiddenAt !== undefined && now - hiddenAt >= limit;
}
