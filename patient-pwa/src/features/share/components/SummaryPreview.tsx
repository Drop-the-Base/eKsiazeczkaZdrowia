import type { ShareSnapshot } from '@ez/shared';
import { describeDose } from '../../meds';
import { formatDate } from '../../../ui';
import { adherenceLine, outOfRangeLine, symptomLine } from '../summaryText.logic';
import { SectionCard } from './SectionCard';

type Section =
  | 'medications'
  | 'visitNotes'
  | 'symptoms'
  | 'exams'
  | 'diagnoses'
  | 'photos'
  | 'visits'
  | 'documents';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'medications', label: 'Leki i regularność' },
  { id: 'visitNotes', label: 'Do omówienia z lekarzem' },
  { id: 'symptoms', label: 'Objawy' },
  { id: 'exams', label: 'Badania' },
  { id: 'diagnoses', label: 'Choroby' },
  { id: 'photos', label: 'Zdjęcia' },
  { id: 'visits', label: 'Poprzednie wizyty' },
  { id: 'documents', label: 'Dokumenty' },
];

type Props = {
  /** Exactly what goes to the doctor. */
  snapshot: ShareSnapshot;
  photoCount: number;
  photosFailed: number;
};

const none = <p>brak</p>;

export function SummaryPreview({ snapshot: full, photoCount, photosFailed }: Props) {
  const s = full.summary;
  const body: Record<Section, JSX.Element> = {
    medications: (
      <>
        {s.medsStarted.map((m) => (
          <p key={m.id}>
            Nowy: {m.name} {describeDose(m)} (od {formatDate(m.startDate)})
          </p>
        ))}
        {s.medsChanged.map((c) => (
          <p key={c.to.id}>
            Zmiana: {c.to.name} {describeDose(c.from)} → {describeDose(c.to)}
          </p>
        ))}
        {s.medsStopped.map((m) => (
          <p key={m.id}>
            Odstawiony: {m.name} ({formatDate(m.endDate ?? m.startDate)})
            {m.stopReason && ` – ${m.stopReason}`}
          </p>
        ))}
        <p>{adherenceLine(s.adherence)}</p>
        <p>Wszystkie leki, w tym bez recepty, suplementy i zioła: {full.medications.length}</p>
      </>
    ),
    visitNotes:
      s.visitNoteItems.length > 0 ? (
        <ol>
          {s.visitNoteItems.map((n) => (
            <li key={n.id}>{n.text}</li>
          ))}
        </ol>
      ) : (
        none
      ),
    symptoms:
      s.symptoms.length > 0 ? (
        <ul>
          {s.symptoms.map((x) => (
            <li key={x.name}>{symptomLine(x)}</li>
          ))}
        </ul>
      ) : (
        none
      ),
    exams:
      s.newExams.length > 0 ? (
        <ul>
          {s.newExams.map((e) => (
            <li key={e.id}>
              {e.name} {formatDate(e.date)}
              {outOfRangeLine(e) && ` – ${outOfRangeLine(e)}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>Brak nowych badań. Wcześniejsze badania: {full.exams.length}</p>
      ),
    diagnoses:
      full.diagnoses.length > 0 ? (
        <p>{full.diagnoses.map((d) => (d.active ? d.name : `${d.name} (przebyta)`)).join(', ')}</p>
      ) : (
        none
      ),
    photos: (
      <p>
        {photoCount > 0 ? `Zdjęć: ${photoCount} (zmniejszone)` : 'brak'}
        {photosFailed > 0 && ` · nie udało się przetworzyć: ${photosFailed}`}
      </p>
    ),
    visits: <p>{full.visits.length > 0 ? `Notatki z wizyt: ${full.visits.length}` : 'brak'}</p>,
    documents: (
      <p>{full.documents.length > 0 ? full.documents.map((d) => d.title).join(', ') : 'brak'}</p>
    ),
  };

  return (
    <>
      {SECTIONS.map(({ id, label }) => (
        <SectionCard key={id} label={label}>
          {body[id]}
        </SectionCard>
      ))}
    </>
  );
}
