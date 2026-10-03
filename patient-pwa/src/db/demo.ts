import { createDemoData, type IsoDateTime } from '@ez/shared';
import type { Db } from './createDb';
import type { HealthDatabase } from './database';
import type { Vault } from './vault';

/** Replaces all records with the "Pani Anna" demo data (encrypted like any other write). */
export async function loadDemoData(dexie: HealthDatabase, db: Db, now: IsoDateTime): Promise<void> {
  const d = createDemoData(now);
  await Promise.all(dexie.entityTables().map((t) => t.clear()));
  await db.profile.save(d.profile);
  const puts = [
    ...d.diagnoses.map((x) => db.diagnoses.put(x)),
    ...d.medications.map((x) => db.medications.put(x)),
    ...d.intakes.map((x) => db.intakes.put(x)),
    ...d.symptoms.map((x) => db.symptoms.put(x)),
    ...d.exams.map((x) => db.exams.put(x)),
    ...d.documents.map(({ content, ...meta }) =>
      db.documents.put({ ...meta, file: new Blob([content], { type: meta.mime }) }),
    ),
    ...d.visits.map((x) => db.visits.put(x)),
    ...d.visitNoteItems.map((x) => db.visitNoteItems.put(x)),
    ...d.reminders.map((x) => db.reminders.put(x)),
  ];
  await Promise.all(puts);
}

export type DemoInitResult = 'reset' | 'loaded' | 'skipped';

/**
 * `?demo=reset` wipes everything (also the PIN) and loads the demo once a new PIN is set.
 * Otherwise the demo goes only into an empty database, only when `autoLoad` is on (dev / `VITE_DEMO=1`),
 * after the app is unlocked.
 */
export async function initDemoData(
  dexie: HealthDatabase,
  db: Db,
  vault: Vault,
  opts: { search: string; autoLoad: boolean; now: IsoDateTime },
): Promise<DemoInitResult> {
  if (new URLSearchParams(opts.search).get('demo') === 'reset') {
    await vault.wipe();
    await vault.ready();
    await loadDemoData(dexie, db, opts.now);
    return 'reset';
  }
  if (!opts.autoLoad) return 'skipped';
  const empty = (await dexie.profile.count()) === 0 && (await dexie.medications.count()) === 0;
  if (!empty) return 'skipped';
  await vault.ready();
  await loadDemoData(dexie, db, opts.now);
  return 'loaded';
}
