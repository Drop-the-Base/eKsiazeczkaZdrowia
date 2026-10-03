/**
 * Inclusive range check on ISO strings. `to` matches by prefix, so `to = '2026-10-03'`
 * includes `'2026-10-03T23:59:00.000Z'`.
 */
export function inRange(value: string, from: string, to: string): boolean {
  return value >= from && value <= `${to}￿`;
}
