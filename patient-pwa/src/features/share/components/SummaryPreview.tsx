import type { ShareSection, ShareSnapshot } from '@ez/shared';
import { describeDose } from '../../meds';
import { formatDate } from '../../../ui';
import { SECTIONS } from '../share.logic';
import { adherenceLine, outOfRangeLine, symptomLine } from '../summaryText.logic';
import { SectionCard } from './SectionCard';

type Props = {
  /** Snapshot with every section on – the preview shows what each checkbox controls. */
  full: ShareSnapshot;
  photoCount: number;
  photosFailed: number;
  sections: ReadonlySet<ShareSection>;
  onToggle: (section: ShareSection, on: boolean) => void;
};

const none = <p>brak</p>;

export function SummaryPreview({ full, photoCount, photosFailed, sections, onToggle }: Props) {
  const s = full.summary;
  const body: Record<ShareSection, JSX.Element> = {
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
        <p>Wszystkie leki, także bez recepty, suplementy i zioła: {full.medications.length}</p>
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
        <p>Brak nowych badań; wcześniejsze: {full.exams.length}</p>
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
        {photosFailed > 0 && ` · nie udało się przygotować: ${photosFailed}`}
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
        <SectionCard
          key={id}
          label={label}
          checked={sections.has(id)}
          onToggle={(on) => onToggle(id, on)}
        >
          {body[id]}
        </SectionCard>
      ))}
    </>
  );
}
