// Domain model (TASKS.md section 6). Frozen contract: changes only via a `[prośba]` issue to agent B.
// All dates are ISO 8601 strings. Ids are `crypto.randomUUID()` strings.

/** Full timestamp, e.g. `2026-10-03T18:40:00.000Z`. */
export type IsoDateTime = string;
/** Calendar date, e.g. `2026-10-03`. */
export type IsoDate = string;

export type UiLanguage = 'pl';
/** Languages of the "Za granicą" summary. */
export type AbroadLanguage = 'en' | 'de' | 'es';

export interface Profile {
  id: string;
  name: string;
  birthDate: IsoDate;
  bloodType?: string;
  allergies: string[];
  language: UiLanguage;
  exportReminderAt?: IsoDateTime;
}

/** Read-only entry from the Rejestr Produktów Leczniczych (`drugs.json`). */
export interface Drug {
  rplId: string;
  name: string;
  activeSubstance: string;
  strength: string;
  form: string;
  atcCode: string;
  leafletUrl?: string;
}

/** The three groups shown side by side to the doctor, always in this order. */
export type MedicationCategory = 'prescription' | 'otc' | 'supplement';

export type MedicationSchedule =
  /** Fixed times of day, `HH:mm` local time. */
  { type: 'daily'; times: string[] } | { type: 'asNeeded' };

export type MedicationSource = 'manual' | 'voice' | 'ikp' | 'visit';

/**
 * A medication, OTC drug or supplement the patient actually takes.
 * A dose change = end the old record (`endDate`, `stopReason`) and add a new one.
 */
export interface Medication {
  id: string;
  rplId?: string;
  name: string;
  activeSubstance?: string;
  atcCode?: string;
  /** Amount per intake, e.g. `100`; free text allowed for supplements ("1 kapsułka"). */
  dose: string;
  unit: string;
  schedule: MedicationSchedule;
  category: MedicationCategory;
  startDate: IsoDate;
  endDate?: IsoDate;
  stopReason?: string;
  source: MedicationSource;
}

export type IntakeStatus = 'taken' | 'skipped';

export interface Intake {
  id: string;
  medicationId: string;
  scheduledAt: IsoDateTime;
  status: IntakeStatus;
  confirmedAt: IsoDateTime;
}

export type Severity = 1 | 2 | 3 | 4 | 5;

export interface Symptom {
  id: string;
  name: string;
  severity?: Severity;
  startedAt: IsoDateTime;
  endedAt?: IsoDateTime;
  notes?: string;
  source: 'manual' | 'voice';
}

export interface Diagnosis {
  id: string;
  name: string;
  icd10?: string;
  diagnosedAt: IsoDate;
  active: boolean;
  source: 'manual' | 'ikp';
}

export interface ExamResult {
  name: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
}

export interface Exam {
  id: string;
  name: string;
  date: IsoDate;
  results: ExamResult[];
  ocrText?: string;
  documentId?: string;
}

/** Imported file (IKP PDF or photo of a result). The db layer encrypts `file` at rest. */
export interface MedicalDocument {
  id: string;
  title: string;
  date: IsoDate;
  file: Blob;
  mime: string;
  ocrText?: string;
  source: 'ikp' | 'photo';
}
export type DocumentMeta = Omit<MedicalDocument, 'file'>;

export type PhotoCategory = 'skin' | 'wound' | 'swelling' | 'other';

/** The db layer encrypts `blob` at rest. */
export interface Photo {
  id: string;
  blob: Blob;
  takenAt: IsoDateTime;
  category: PhotoCategory;
  seriesId?: string;
  note?: string;
}
export type PhotoMeta = Omit<Photo, 'blob'>;

export interface PhotoSeries {
  id: string;
  name: string;
  bodyPart?: string;
  createdAt: IsoDateTime;
}

/** "Powiem lekarzowi" – an item on the patient's agenda for the next visit. */
export interface VisitNoteItem {
  id: string;
  text: string;
  createdAt: IsoDateTime;
  source: 'manual' | 'voice';
  discussed: boolean;
  visitId?: string;
}

/** A change applied to the data after a post-visit note was confirmed. */
export type AppliedChange =
  | { type: 'stopMedication'; medicationId: string; reason: string }
  | { type: 'newMedication'; medicationId: string }
  | { type: 'followUp'; reminderId: string };

/** Audio is deleted after transcription; only the text is kept. */
export interface Visit {
  id: string;
  date: IsoDate;
  doctor?: string;
  specialty?: string;
  transcript: string;
  followUpDate?: IsoDate;
  appliedChanges: AppliedChange[];
}

export type ReminderType = 'medication' | 'followUp' | 'export';

export interface Reminder {
  id: string;
  type: ReminderType;
  at: IsoDateTime;
  medicationId?: string;
  visitId?: string;
  /** Set when the reminder was handled ("Do potwierdzenia" list hides it). */
  doneAt?: IsoDateTime;
}

// ---------- Visit summary (T2.6b, built locally without LLM) ----------

/** Same substance/name stopped and started again within the summary range. */
export interface MedicationChange {
  from: Medication;
  to: Medication;
}

export interface SymptomSummary {
  name: string;
  count: number;
  maxSeverity?: Severity;
  firstAt: IsoDateTime;
  /** Symptom first appeared within ~14 days after this medication started. Dates only, no conclusion. */
  afterNewMed?: { medicationId: string; medicationName: string; startDate: IsoDate };
}

export interface VisitSummary {
  since: IsoDate;
  medsStarted: Medication[];
  medsStopped: Medication[];
  medsChanged: MedicationChange[];
  adherence: { taken: number; skipped: number };
  symptoms: SymptomSummary[];
  /** Exams with an out-of-range result first. */
  newExams: Exam[];
  newPhotos: PhotoMeta[];
  visitNoteItems: VisitNoteItem[];
}

// ---------- Snapshot sent to the doctor (encrypted end to end) ----------

/** Photo inside a snapshot: downscaled JPEG as a data URL. */
export interface SnapshotPhoto extends PhotoMeta {
  thumbnailDataUrl: string;
}

export interface DateRange {
  from: IsoDate;
  to: IsoDate;
}

/** Parts of the snapshot the patient can leave out before sending. */
export type ShareSection =
  | 'medications'
  | 'diagnoses'
  | 'symptoms'
  | 'exams'
  | 'photos'
  | 'visitNotes'
  | 'visits'
  | 'documents';

export interface ShareSnapshot {
  summary: VisitSummary;
  profile: Profile;
  medications: Medication[];
  intakes: Intake[];
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  exams: Exam[];
  photos: SnapshotPhoto[];
  documents: DocumentMeta[];
  visitNoteItems: VisitNoteItem[];
  visits: Visit[];
  range: DateRange;
  createdAt: IsoDateTime;
  /** Sections the patient chose not to share (empty arrays there mean "not shared", not "none"). */
  omitted?: ShareSection[];
}

// ---------- "Zapytaj" (LLM turns a question into a filter, the filter runs locally) ----------

export type QueryEntity = 'medication' | 'symptom' | 'exam';

export interface QueryFilter {
  entity: QueryEntity;
  /** ATC code prefix, e.g. `B01` for anticoagulants. */
  atcPrefix?: string;
  /** Case-insensitive substring of the name. */
  name?: string;
  from?: IsoDate;
  to?: IsoDate;
  sort?: 'asc' | 'desc';
  limit?: number;
}
