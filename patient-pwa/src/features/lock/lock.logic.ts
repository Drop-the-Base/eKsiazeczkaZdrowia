import { PIN_PATTERN } from '../../db';

/** Error for the new-PIN form, or undefined when it can be saved. */
export function validateNewPin(pin: string, repeat: string): string | undefined {
  if (!PIN_PATTERN.test(pin)) return 'PIN musi mieć od 4 do 8 cyfr';
  if (pin !== repeat) return 'PIN-y się różnią';
  return undefined;
}
