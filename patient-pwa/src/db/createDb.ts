import type { Medication, PatientDb, Profile } from '@ez/shared';
import { HealthDatabase } from './database';
import { createEntityApi, type DatedEntityApi } from './entityApi';

export interface MedicationsApi extends DatedEntityApi<Medication> {
  /** Medications taken at any point within `[from, to]` (started before `to`, not ended before `from`). */
  activeBetween(from: string, to: string): Promise<Medication[]>;
}

export function createDb(dexie: HealthDatabase) {
  const medicationsBase = createEntityApi(dexie.medications, 'startDate');
  const medications: MedicationsApi = {
    ...medicationsBase,
    async activeBetween(from, to) {
      const all = await medicationsBase.list();
      return all.filter((m) => m.startDate <= to && (m.endDate === undefined || m.endDate >= from));
    },
  };
  return {
    profile: {
      get: (): Promise<Profile | undefined> => dexie.profile.toCollection().first(),
      async save(profile: Profile): Promise<void> {
        await dexie.transaction('rw', dexie.profile, async () => {
          await dexie.profile.clear();
          await dexie.profile.put(profile);
        });
      },
    },
    medications,
    intakes: createEntityApi(dexie.intakes, 'scheduledAt'),
    symptoms: createEntityApi(dexie.symptoms, 'startedAt'),
    diagnoses: createEntityApi(dexie.diagnoses, 'diagnosedAt'),
    exams: createEntityApi(dexie.exams, 'date'),
    documents: createEntityApi(dexie.documents, 'date'),
    photos: createEntityApi(dexie.photos, 'takenAt'),
    photoSeries: createEntityApi(dexie.photoSeries, 'createdAt'),
    visitNoteItems: createEntityApi(dexie.visitNoteItems, 'createdAt'),
    visits: createEntityApi(dexie.visits, 'date'),
    reminders: createEntityApi(dexie.reminders, 'at'),
  } satisfies PatientDb;
}

export type Db = ReturnType<typeof createDb>;
