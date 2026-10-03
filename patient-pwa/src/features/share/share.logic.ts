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
  type ShareSnapshot,
  type SnapshotPhoto,
} from '@ez/shared';

export interface ShareInput {
  profile: Profile;
  data: HealthData & { diagnoses: Diagnosis[]; documents: DocumentMeta[] };
  /** Start of the visit summary (default: last visit). */
  since: IsoDate;
  /** History sent for the timeline; `from` may be earlier than `since`. */
  range: DateRange;
  /** Downscaled photos as data URLs; photos without one are not sent. */
  thumbnails: ReadonlyMap<string, string>;
  now: IsoDateTime;
}

/**
 * What goes to the doctor: always the full record within the range. The patient decides only
 * whether to share at all, never which parts – a hidden part could mislead the doctor.
 */
export function buildShareSnapshot(input: ShareInput): ShareSnapshot {
  const { data, range, now } = input;
  const inRange = (value: string) => value >= range.from && value <= now;

  const photos = data.photos.flatMap(({ blob: _blob, ...meta }): SnapshotPhoto[] => {
    const thumbnailDataUrl = input.thumbnails.get(meta.id);
    return thumbnailDataUrl && inRange(meta.takenAt) ? [{ ...meta, thumbnailDataUrl }] : [];
  });

  const summary = buildVisitSummary(
    {
      medications: data.medications,
      intakes: data.intakes,
      symptoms: data.symptoms,
      exams: data.exams,
      photos: data.photos.filter((p) => input.thumbnails.has(p.id)),
      visitNoteItems: data.visitNoteItems,
      visits: data.visits,
    },
    input.since,
    now,
  );

  return {
    summary,
    profile: input.profile,
    medications: data.medications.filter(
      (m) => m.startDate <= now && (m.endDate === undefined || m.endDate >= range.from),
    ),
    intakes: data.intakes.filter((i) => inRange(i.scheduledAt)),
    symptoms: data.symptoms.filter((s) => inRange(s.startedAt)),
    diagnoses: data.diagnoses,
    exams: data.exams.filter((e) => inRange(e.date)),
    photos,
    documents: data.documents.filter((d) => inRange(d.date)),
    visitNoteItems: summary.visitNoteItems,
    visits: data.visits.filter((v) => inRange(v.date)),
    range,
    createdAt: now,
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
