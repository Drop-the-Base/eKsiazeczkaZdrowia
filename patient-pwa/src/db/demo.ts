import { createDemoData, type IsoDateTime } from '@ez/shared';
import type { HealthDatabase } from './database';

/** Replaces everything in the database with the "Pani Anna" demo data. */
export async function loadDemoData(dexie: HealthDatabase, now: IsoDateTime): Promise<void> {
  const d = createDemoData(now);
  await dexie.transaction('rw', dexie.tables, async () => {
    await Promise.all(dexie.tables.map((t) => t.clear()));
    await dexie.profile.add(d.profile);
    await dexie.diagnoses.bulkAdd(d.diagnoses);
    await dexie.medications.bulkAdd(d.medications);
    await dexie.intakes.bulkAdd(d.intakes);
    await dexie.symptoms.bulkAdd(d.symptoms);
    await dexie.exams.bulkAdd(d.exams);
    await dexie.documents.bulkAdd(
      d.documents.map(({ content, ...meta }) => ({
        ...meta,
        file: new Blob([content], { type: meta.mime }),
      })),
    );
    await dexie.visits.bulkAdd(d.visits);
    await dexie.visitNoteItems.bulkAdd(d.visitNoteItems);
    await dexie.reminders.bulkAdd(d.reminders);
  });
}

export type DemoInitResult = 'reset' | 'loaded' | 'skipped';

/**
 * `?demo=reset` in the URL always reloads the demo; otherwise the demo is loaded
 * only into an empty database and only when `autoLoad` is on (dev / `VITE_DEMO=1`).
 */
export async function initDemoData(
  dexie: HealthDatabase,
  opts: { search: string; autoLoad: boolean; now: IsoDateTime },
): Promise<DemoInitResult> {
  if (new URLSearchParams(opts.search).get('demo') === 'reset') {
    await loadDemoData(dexie, opts.now);
    return 'reset';
  }
  if (!opts.autoLoad) return 'skipped';
  const empty = (await dexie.profile.count()) === 0 && (await dexie.medications.count()) === 0;
  if (!empty) return 'skipped';
  await loadDemoData(dexie, opts.now);
  return 'loaded';
}
