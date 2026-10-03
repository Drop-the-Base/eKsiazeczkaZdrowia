import { useLiveQuery } from 'dexie-react-hooks';

export type Live<T> = { status: 'loading' } | { status: 'ready'; data: T };

/**
 * `useLiveQuery`, które odróżnia „jeszcze ładuje” od „wynik = undefined”.
 * Błąd zapytania jest rzucany w renderze i łapie go ErrorBoundary w `app/`.
 */
export function useLive<T>(query: () => Promise<T>, deps: unknown[] = []): Live<T> {
  const result = useLiveQuery(async () => ({ data: await query() }), deps);
  return result ? { status: 'ready', data: result.data } : { status: 'loading' };
}
