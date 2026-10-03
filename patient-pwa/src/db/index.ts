import { HealthDatabase } from './database';
import { createDb } from './createDb';
import { initDemoData, loadDemoData } from './demo';

const dexie = new HealthDatabase();

/** The only way the app touches the local database. Returns domain types from `@ez/shared`. */
export const db = createDb(dexie);

/**
 * Demo data on start (see `initDemoData`). Screens read through `useLiveQuery`,
 * so they re-render once this finishes; await it only if you need the data up front.
 */
export const dbReady: Promise<void> = initDemoData(dexie, {
  search: window.location.search,
  autoLoad: import.meta.env.DEV || import.meta.env.VITE_DEMO === '1',
  now: new Date().toISOString(),
}).then((result) => {
  if (result === 'reset') {
    const url = new URL(window.location.href);
    url.searchParams.delete('demo');
    window.history.replaceState(null, '', url);
  }
});
dbReady.catch((err: unknown) => console.error('Nie udało się wczytać danych demo', err));

/** Replaces all data with the "Pani Anna" demo (e.g. a "Wczytaj demo" button). */
export const resetDemoData = (): Promise<void> => loadDemoData(dexie, new Date().toISOString());

export type { Db, MedicationsApi } from './createDb';
export type { DatedEntityApi } from './entityApi';
export { newId } from './ids';
