import { HealthDatabase } from './database';
import { createDb } from './createDb';

/** The only way the app touches the local database. Returns domain types from `@ez/shared`. */
export const db = createDb(new HealthDatabase());

export type { Db, MedicationsApi } from './createDb';
export type { DatedEntityApi } from './entityApi';
export { newId } from './ids';
