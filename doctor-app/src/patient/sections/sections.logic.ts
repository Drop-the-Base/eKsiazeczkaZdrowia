import type { ShareSection, ShareSnapshot, TimelineRef } from '@ez/shared';
import { currentByGroup, isOmitted } from '../patient.logic';

export type SectionId =
  'summary' | 'timeline' | 'meds' | 'exams' | 'photos' | 'visits' | 'documents';

export interface SectionTab {
  id: SectionId;
  label: string;
  /** Shown next to the label; undefined = no counter. */
  count?: number;
  /** No data, or the patient did not share it – greyed out. */
  disabled: boolean;
  omitted: boolean;
}

const SHARED_AS: Partial<Record<SectionId, ShareSection>> = {
  meds: 'medications',
  exams: 'exams',
  photos: 'photos',
  visits: 'visits',
  documents: 'documents',
};

export function sectionTabs(s: ShareSnapshot): SectionTab[] {
  const today = s.createdAt.slice(0, 10);
  const current = Object.values(currentByGroup(s.medications, today)).flat().length;
  const counts: Partial<Record<SectionId, number>> = {
    meds: current,
    exams: s.exams.length,
    photos: s.photos.length,
    visits: s.visits.length,
    documents: s.documents.length,
  };
  const labels: Record<SectionId, string> = {
    summary: 'Podsumowanie',
    timeline: 'Oś czasu',
    meds: 'Leki',
    exams: 'Badania',
    photos: 'Zdjęcia',
    visits: 'Wizyty',
    documents: 'Dokumenty',
  };
  return (Object.keys(labels) as SectionId[]).map((id) => {
    const shared = SHARED_AS[id];
    const omitted = shared !== undefined && isOmitted(s, shared);
    const count = counts[id];
    const hasStopped = id === 'meds' && s.medications.length > 0;
    return {
      id,
      label: labels[id],
      count,
      omitted,
      disabled: omitted || (count === 0 && !hasStopped),
    };
  });
}

/** Where a click in "Od ostatniej wizyty" leads: exams and photos to their section, the rest onto the timeline. */
export function targetOf(ref: TimelineRef): SectionId {
  if (ref.entity === 'exam') return 'exams';
  if (ref.entity === 'photo') return 'photos';
  return 'timeline';
}
