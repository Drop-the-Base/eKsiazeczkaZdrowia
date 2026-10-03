import type {
  Diagnosis,
  Exam,
  Intake,
  MedicalDocument,
  Medication,
  PatientDb,
  Photo,
  PhotoSeries,
  Profile,
  Reminder,
  Symptom,
  Visit,
  VisitNoteItem,
} from '@ez/shared';
import { openRecord, sealRecord } from './cipher';
import type { HealthDatabase } from './database';
import { createEntityApi, type DatedEntityApi } from './entityApi';
import type { Vault } from './vault';

export interface MedicationsApi extends DatedEntityApi<Medication> {
  /** Medications taken at any point within `[from, to]` (started before `to`, not ended before `from`). */
  activeBetween(from: string, to: string): Promise<Medication[]>;
}

export function createDb(dexie: HealthDatabase, vault: Vault) {
  const medicationsBase = createEntityApi<Medication>(dexie.medications, 'startDate', vault);
  const medications: MedicationsApi = {
    ...medicationsBase,
    async activeBetween(from, to) {
      const all = await medicationsBase.list();
      return all.filter((m) => m.startDate <= to && (m.endDate === undefined || m.endDate >= from));
    },
  };
  return {
    profile: {
      async get(): Promise<Profile | undefined> {
        const row = await dexie.profile.toCollection().first();
        return row ? openRecord<Profile>(await vault.ready(), 'profile', row) : undefined;
      },
      async save(profile: Profile): Promise<void> {
        const row = await sealRecord(await vault.ready(), 'profile', profile, []);
        await dexie.transaction('rw', dexie.profile, async () => {
          await dexie.profile.clear();
          await dexie.profile.put(row);
        });
      },
    },
    medications,
    intakes: createEntityApi<Intake>(dexie.intakes, 'scheduledAt', vault),
    symptoms: createEntityApi<Symptom>(dexie.symptoms, 'startedAt', vault),
    diagnoses: createEntityApi<Diagnosis>(dexie.diagnoses, 'diagnosedAt', vault),
    exams: createEntityApi<Exam>(dexie.exams, 'date', vault),
    documents: createEntityApi<MedicalDocument>(dexie.documents, 'date', vault),
    photos: createEntityApi<Photo>(dexie.photos, 'takenAt', vault),
    photoSeries: createEntityApi<PhotoSeries>(dexie.photoSeries, 'createdAt', vault),
    visitNoteItems: createEntityApi<VisitNoteItem>(dexie.visitNoteItems, 'createdAt', vault),
    visits: createEntityApi<Visit>(dexie.visits, 'date', vault),
    reminders: createEntityApi<Reminder>(dexie.reminders, 'at', vault),
  } satisfies PatientDb;
}

export type Db = ReturnType<typeof createDb>;
