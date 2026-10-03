// Signatures where agents A and B meet (TASKS.md T0.3, "Gdzie się stykamy").
// Frozen contract: changes only via a `[prośba]` issue to agent B.
import type {
  DateRange,
  Diagnosis,
  MedicalDocument,
  DocumentMeta,
  Drug,
  Exam,
  Intake,
  IsoDate,
  IsoDateTime,
  Medication,
  MedicationCategory,
  MedicationSchedule,
  Photo,
  PhotoSeries,
  Profile,
  QueryFilter,
  Reminder,
  ShareSnapshot,
  Symptom,
  Visit,
  VisitNoteItem,
  VisitSummary,
} from './types.js';

// ---------- Local database (B, `patient-pwa/src/db/`) ----------

/** Input for `add`: everything except the generated id. */
export type NewEntity<T extends { id: string }> = Omit<T, 'id'>;

/**
 * Per-entity API. Every method is a Dexie query, so it can be used inside `useLiveQuery`.
 * Encryption (B27) is added later without changing this API.
 */
export interface EntityApi<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  add(input: NewEntity<T>): Promise<T>;
  update(id: string, patch: Partial<NewEntity<T>>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface PatientDb {
  /** Single profile; `get` returns `undefined` before onboarding. */
  profile: { get(): Promise<Profile | undefined>; save(profile: Profile): Promise<void> };
  medications: EntityApi<Medication>;
  intakes: EntityApi<Intake>;
  symptoms: EntityApi<Symptom>;
  diagnoses: EntityApi<Diagnosis>;
  exams: EntityApi<Exam>;
  documents: EntityApi<MedicalDocument>;
  photos: EntityApi<Photo>;
  photoSeries: EntityApi<PhotoSeries>;
  visitNoteItems: EntityApi<VisitNoteItem>;
  visits: EntityApi<Visit>;
  reminders: EntityApi<Reminder>;
}

/** B: open "powiem lekarzowi" items (not yet discussed), oldest first. */
export type GetActiveVisitList = () => Promise<VisitNoteItem[]>;

// ---------- Visit summary (B, T2.6b) ----------

/** Plain data the summary and the "Zapytaj" filter are computed from. */
export interface HealthData {
  medications: Medication[];
  intakes: Intake[];
  symptoms: Symptom[];
  exams: Exam[];
  photos: Photo[];
  visitNoteItems: VisitNoteItem[];
  visits: Visit[];
}

/** Pure: `since` defaults to the last visit date at the call site. */
export type BuildVisitSummary = (
  data: HealthData,
  since: IsoDate,
  now: IsoDateTime,
) => VisitSummary;

// ---------- Drugs (A, `features/drugs/`) ----------

export type SearchDrugs = (query: string, limit?: number) => Promise<Drug[]>;

/** Props of `<DrugPicker>`; free text is allowed (supplements are often not in RPL). */
export interface DrugPickerProps {
  onSelect: (pick: { drug?: Drug; name: string }) => void;
  placeholder?: string;
}

// ---------- Voice (A, `features/voice/`) ----------

export type VoiceInputMode = 'entry' | 'ask' | 'tellDoctor' | 'postVisit';

/** Props of `<VoiceInput>`: always renders a text field next to the microphone. */
export interface VoiceInputProps {
  mode: VoiceInputMode;
  /** Final text, from speech or typed. */
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface ParsedSymptom {
  name: string;
  severity?: Symptom['severity'];
  startedAt: IsoDateTime;
}

export interface ParsedIntake {
  /** Name as recognised; `drug` when matched in RPL. */
  name: string;
  drug?: Drug;
  takenAt: IsoDateTime;
}

export interface ParsedEntry {
  symptoms: ParsedSymptom[];
  medications: ParsedIntake[];
}

/** A, local: "od rana boli mnie głowa, wzięłam ibuprom" → proposals to confirm. */
export type ParseEntry = (text: string, now: IsoDateTime) => Promise<ParsedEntry>;

// ---------- "Zapytaj" (A) ----------

/** A: sends only the question text to `POST /llm/query`. */
export type AskHistory = (question: string) => Promise<QueryFilter>;

export type QueryResultItem =
  | { entity: 'medication'; item: Medication }
  | { entity: 'symptom'; item: Symptom }
  | { entity: 'exam'; item: Exam };

/** A, pure, runs on the phone. */
export type RunFilter = (
  filter: QueryFilter,
  data: Pick<HealthData, 'medications' | 'symptoms' | 'exams'>,
) => QueryResultItem[];

// ---------- Post-visit note (B) ----------

/** Names only: the server never sees the medication list, the client matches names to records. */
export interface VisitNoteChanges {
  stopMeds: { name: string; reason?: string }[];
  newMeds: {
    name: string;
    dose?: string;
    unit?: string;
    schedule?: MedicationSchedule;
    category?: MedicationCategory;
  }[];
  followUpDate?: IsoDate;
}

/** B: sends only the note text to `POST /llm/visit-note`. */
export type ParseVisitNote = (text: string, today: IsoDate) => Promise<VisitNoteChanges>;

// ---------- Reminders (A, `features/reminders/`) ----------

export type CreateReminder = (input: NewEntity<Reminder>) => Promise<Reminder>;

// ---------- Timeline (A, `<Timeline>`; B reuses it in doctor-app) ----------

/** Photo on the timeline: the caller supplies a displayable URL (object URL or data URL). */
export interface TimelinePhoto {
  id: string;
  takenAt: IsoDateTime;
  category: Photo['category'];
  thumbnailUrl: string;
}

export interface TimelineData {
  medications: Medication[];
  intakes: Intake[];
  symptoms: Symptom[];
  exams: Exam[];
  visits: Visit[];
  photos: TimelinePhoto[];
  documents: DocumentMeta[];
}

export interface TimelineRef {
  entity: 'medication' | 'intake' | 'symptom' | 'exam' | 'visit' | 'photo' | 'document';
  id: string;
}

export interface TimelineProps {
  data: TimelineData;
  range: DateRange;
  highlight?: TimelineRef;
  onSelect?: (ref: TimelineRef) => void;
}

// ---------- LLM HTTP endpoints (server, anonymous: only the text, nothing is logged) ----------

export interface LlmQueryRequest {
  question: string;
  /** The phone's local date, so "last 2 months" counts from the patient's day. */
  today?: IsoDate;
}
export interface LlmQueryResponse {
  filter: QueryFilter;
}
export interface LlmVisitNoteRequest {
  text: string;
  today: IsoDate;
}
export type LlmVisitNoteResponse = VisitNoteChanges;

export const LLM_QUERY_PATH = '/llm/query';
export const LLM_VISIT_NOTE_PATH = '/llm/visit-note';

// ---------- Encrypted relay (B, `server/` + `shared/transport/`) ----------

export const RELAY_PATH = '/relay';
export const SESSION_TTL_MS = 15 * 60 * 1000;
/** Max size of one WebSocket message; the server drops larger ones. */
export const RELAY_MAX_MESSAGE_BYTES = 256 * 1024;
/** Plaintext bytes per encrypted snapshot chunk (fits in one message after base64). */
export const SNAPSHOT_CHUNK_BYTES = 64 * 1024;

/** Encoded in the doctor's QR code as JSON. */
export interface QrPayload {
  v: 1;
  sessionId: string;
  /** Doctor's one-time ECDH P-256 public key, raw, base64url. */
  doctorPublicKey: string;
}

export type RelayRole = 'doctor' | 'patient';

/** Messages a browser sends to the relay server. */
export type ClientMessage =
  | { type: 'create-session' }
  | { type: 'join-session'; sessionId: string }
  /** After a dropped WebSocket: same role, token from `session-created` / `joined`. */
  | { type: 'resume-session'; sessionId: string; resumeToken: string }
  | { type: 'relay'; payload: PeerMessage }
  | { type: 'end-session' };

export type SessionEndReason = 'ended' | 'expired' | 'peer-left';

export type RelayErrorCode =
  'bad-message' | 'too-large' | 'no-session' | 'session-full' | 'no-peer';

/** Messages the relay server sends to a browser. */
export type ServerMessage =
  | { type: 'session-created'; sessionId: string; resumeToken: string; expiresAt: IsoDateTime }
  | { type: 'joined'; resumeToken: string; expiresAt: IsoDateTime }
  | { type: 'peer-joined' }
  | { type: 'peer-disconnected' }
  | { type: 'relay'; payload: PeerMessage }
  | { type: 'session-ended'; reason: SessionEndReason }
  | { type: 'error'; code: RelayErrorCode; message: string };

/** End-to-end messages between patient and doctor; the server only forwards them. */
export type PeerMessage =
  /** Patient → doctor: patient's one-time ECDH public key (raw, base64url). */
  | { kind: 'hello'; patientPublicKey: string }
  /** Patient → doctor: AES-256-GCM ciphertext of one snapshot chunk, own random 12-byte IV. */
  | { kind: 'chunk'; snapshotId: string; index: number; total: number; iv: string; data: string }
  /** Doctor → patient: chunk received and decrypted. */
  | { kind: 'ack'; snapshotId: string; index: number }
  /** Either side: verification codes differ, abort the session. */
  | { kind: 'verify-mismatch' };

export type TransportStatus =
  | 'connecting'
  | 'waiting-for-patient'
  | 'connected'
  | 'transferring'
  | 'received'
  | 'ended'
  | 'expired'
  | 'error';

/** Doctor side (doctor-app). */
export interface DoctorSession {
  sessionId: string;
  /** JSON of `QrPayload`. */
  qrPayload: string;
  expiresAt: IsoDateTime;
  /** 4 digits; available after the patient's `hello`. */
  onVerificationCode(cb: (code: string) => void): () => void;
  onSnapshot(cb: (snapshot: ShareSnapshot) => void): () => void;
  onStatus(cb: (status: TransportStatus) => void): () => void;
  /** Mismatch → `verify-mismatch` to the patient and session end. */
  rejectVerification(): void;
  close(): void;
}

export type CreateSession = (relayUrl: string) => Promise<DoctorSession>;

/** Patient side (PWA). */
export interface PatientConnection {
  /** 4 digits from SHA-256 of both public keys. */
  verificationCode: string;
  /** Resolves when every chunk is acknowledged. */
  sendSnapshot(
    snapshot: ShareSnapshot,
    onProgress?: (sent: number, total: number) => void,
  ): Promise<void>;
  onStatus(cb: (status: TransportStatus) => void): () => void;
  /** The codes differ: tells the doctor's tab and ends the session (possible key swap by the server). */
  rejectVerification(): void;
  /** Leaves the session: the phone disconnects, the doctor keeps the data until the visit ends. */
  disconnect(): void;
  /** Ends the session for both sides: the doctor's tab forgets the data. */
  close(): void;
}

export type Connect = (relayUrl: string, qrPayload: string) => Promise<PatientConnection>;
