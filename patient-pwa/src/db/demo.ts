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

/**
 * Demo start: a fresh "Pani Anna" under `pin` on the first load in a tab (`fresh`), and only an
 * automatic unlock on a reload, so what the visitor added stays. Never runs outside `/demo`.
 */
export async function startDemo(
  dexie: HealthDatabase,
  db: Db,
  vault: Vault,
  opts: { pin: string; fresh: boolean; now: IsoDateTime },
): Promise<void> {
  if (!opts.fresh && (await dexie.meta.get('vault'))) return vault.unlock(opts.pin);
  await vault.wipe();
  await vault.setup(opts.pin);
  await loadDemoData(dexie, db, opts.now);
}
