import Dexie, { type Table } from 'dexie';
import type {
  Diagnosis,
  Exam,
  Intake,
  MedicalDocument,
  Medication,
  Photo,
  PhotoSeries,
  Profile,
  Reminder,
  Symptom,
  Visit,
  VisitNoteItem,
} from '@ez/shared';

export class HealthDatabase extends Dexie {
  profile!: Table<Profile, string>;
  medications!: Table<Medication, string>;
  intakes!: Table<Intake, string>;
  symptoms!: Table<Symptom, string>;
  diagnoses!: Table<Diagnosis, string>;
  exams!: Table<Exam, string>;
  documents!: Table<MedicalDocument, string>;
  photos!: Table<Photo, string>;
  photoSeries!: Table<PhotoSeries, string>;
  visitNoteItems!: Table<VisitNoteItem, string>;
  visits!: Table<Visit, string>;
  reminders!: Table<Reminder, string>;

  constructor(name = 'eksiazeczka-zdrowia') {
    super(name);
    // Primary keys only: queries filter in memory (see entityApi.ts).
    this.version(1).stores({
      profile: 'id',
      medications: 'id',
      intakes: 'id',
      symptoms: 'id',
      diagnoses: 'id',
      exams: 'id',
      documents: 'id',
      photos: 'id',
      photoSeries: 'id',
      visitNoteItems: 'id',
      visits: 'id',
      reminders: 'id',
    });
  }
}
