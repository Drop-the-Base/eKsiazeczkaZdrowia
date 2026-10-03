import {
  buildVisitSummary,
  lastVisitDate,
  type DateRange,
  type Diagnosis,
  type DocumentMeta,
  type HealthData,
  type IsoDate,
  type IsoDateTime,
  type Profile,
  type ShareSection,
  type ShareSnapshot,
  type SnapshotPhoto,
} from '@ez/shared';

export const SECTIONS: { id: ShareSection; label: string }[] = [
  { id: 'medications', label: 'Leki i regularność' },
  { id: 'visitNotes', label: 'Powiem lekarzowi' },
  { id: 'symptoms', label: 'Objawy' },
  { id: 'exams', label: 'Badania' },
  { id: 'diagnoses', label: 'Choroby' },
  { id: 'photos', label: 'Zdjęcia' },
  { id: 'visits', label: 'Poprzednie wizyty' },
  { id: 'documents', label: 'Dokumenty' },
];

export interface ShareInput {
  profile: Profile;
  data: HealthData & { diagnoses: Diagnosis[]; documents: DocumentMeta[] };
  sections: ReadonlySet<ShareSection>;
  /** Start of the visit summary (default: last visit). */
  since: IsoDate;
  /** History sent for the timeline; `from` may be earlier than `since`. */
  range: DateRange;
  /** Downscaled photos as data URLs; photos without one are not sent. */
  thumbnails: ReadonlyMap<string, string>;
  now: IsoDateTime;
}

/** What goes to the doctor. Unchecked sections are removed from the summary and from the history. */
export function buildShareSnapshot(input: ShareInput): ShareSnapshot {
  const { data, sections, range, now } = input;
  const on = (s: ShareSection) => sections.has(s);
  const inRange = (value: string) => value >= range.from && value <= now;
  const empty: never[] = [];

  const medications = on('medications')
    ? data.medications.filter(
        (m) => m.startDate <= now && (m.endDate === undefined || m.endDate >= range.from),
      )
    : empty;
  const photos = on('photos')
    ? data.photos.flatMap(({ blob: _blob, ...meta }): SnapshotPhoto[] => {
        const thumbnailDataUrl = input.thumbnails.get(meta.id);
        return thumbnailDataUrl && inRange(meta.takenAt) ? [{ ...meta, thumbnailDataUrl }] : [];
      })
    : empty;

  const summary = buildVisitSummary(
    {
      medications: on('medications') ? data.medications : empty,
      intakes: on('medications') ? data.intakes : empty,
      symptoms: on('symptoms') ? data.symptoms : empty,
      exams: on('exams') ? data.exams : empty,
      photos: on('photos') ? data.photos.filter((p) => input.thumbnails.has(p.id)) : empty,
      visitNoteItems: on('visitNotes') ? data.visitNoteItems : empty,
      visits: data.visits,
    },
    input.since,
    now,
  );

  return {
    summary,
    profile: input.profile,
    medications,
    intakes: on('medications') ? data.intakes.filter((i) => inRange(i.scheduledAt)) : empty,
    symptoms: on('symptoms') ? data.symptoms.filter((s) => inRange(s.startedAt)) : empty,
    diagnoses: on('diagnoses') ? data.diagnoses : empty,
    exams: on('exams') ? data.exams.filter((e) => inRange(e.date)) : empty,
    photos,
    documents: on('documents') ? data.documents.filter((d) => inRange(d.date)) : empty,
    visitNoteItems: on('visitNotes') ? summary.visitNoteItems : empty,
    visits: on('visits') ? data.visits.filter((v) => inRange(v.date)) : empty,
    range,
    createdAt: now,
    omitted: SECTIONS.map((s) => s.id).filter((s) => !on(s)),
  };
}

/** Earliest date in the history, so "Całość" really means everything. */
export function earliestDate(data: ShareInput['data'], fallback: IsoDate): IsoDate {
  const dates = [
    ...data.medications.map((m) => m.startDate),
    ...data.symptoms.map((s) => s.startedAt.slice(0, 10)),
    ...data.exams.map((e) => e.date),
    ...data.diagnoses.map((d) => d.diagnosedAt),
    ...data.visits.map((v) => v.date),
  ];
  return dates.reduce((min, d) => (d < min ? d : min), fallback);
}

/** Summary start: the last visit, or 30 days back when there was none. */
export function defaultSince(visits: HealthData['visits'], now: IsoDateTime): IsoDate {
  const last = lastVisitDate(visits, now);
  if (last) return last;
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}
