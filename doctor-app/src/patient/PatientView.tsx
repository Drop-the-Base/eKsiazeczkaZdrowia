import { useState } from 'react';
import type { ShareSnapshot, TimelineRef } from '@ez/shared';
import { formatDateTime } from '../format';
import { isOmitted } from './patient.logic';
import { PatientHeader } from './PatientHeader';
import { DocumentsSection } from './sections/DocumentsSection';
import { ExamsSection } from './sections/ExamsSection';
import { MedsSection } from './sections/MedsSection';
import { PhotosSection } from './sections/PhotosSection';
import { SectionNav } from './sections/SectionNav';
import { sectionTabs, targetOf, type SectionId } from './sections/sections.logic';
import { SummarySection } from './sections/SummarySection';
import { TimelineSection } from './sections/TimelineSection';
import { VisitsSection } from './sections/VisitsSection';
import sectionStyles from './sections/Sections.module.css';
import styles from './PatientView.module.css';

/**
 * Doctor's view of the received snapshot: the summary first, everything else one click away.
 * All sections stay rendered (only the current one is visible), so printing contains everything.
 */
export function PatientView({ snapshot }: { snapshot: ShareSnapshot }) {
  const [section, setSection] = useState<SectionId>('summary');
  const [highlight, setHighlight] = useState<TimelineRef>();
  const tabs = sectionTabs(snapshot);

  const open = (ref: TimelineRef) => {
    setHighlight(ref);
    setSection(targetOf(ref));
  };
  const notShared = (id: SectionId) => tabs.find((t) => t.id === id)?.omitted;

  const sections: { id: SectionId; title: string; hint?: string; body: React.ReactNode }[] = [
    {
      id: 'summary',
      title: 'Podsumowanie',
      body: <SummarySection snapshot={snapshot} onSelect={open} />,
    },
    {
      id: 'timeline',
      title: 'Oś czasu',
      body: <TimelineSection snapshot={snapshot} highlight={highlight} onSelect={setHighlight} />,
    },
    {
      id: 'meds',
      title: 'Wszystko, co przyjmuje',
      hint: 'leki z recepty, bez recepty, suplementy i zioła',
      body: <MedsSection snapshot={snapshot} />,
    },
    { id: 'exams', title: 'Badania', body: <ExamsSection snapshot={snapshot} /> },
    { id: 'photos', title: 'Zdjęcia', body: <PhotosSection photos={snapshot.photos} /> },
    { id: 'visits', title: 'Wizyty', body: <VisitsSection snapshot={snapshot} /> },
    { id: 'documents', title: 'Dokumenty', body: <DocumentsSection snapshot={snapshot} /> },
  ];

  return (
    <div className={styles.view}>
      <p className={styles.printHeader}>
        Prywatna Karta Zdrowia · dane przekazane z telefonu pacjenta{' '}
        {formatDateTime(snapshot.createdAt)} · wydrukowano{' '}
        {formatDateTime(new Date().toISOString())}
      </p>
      <PatientHeader snapshot={snapshot} />
      <SectionNav tabs={tabs} current={section} onChange={setSection} />
      {sections.map((s) => (
        <section
          key={s.id}
          aria-label={s.title}
          className={
            s.id === section
              ? sectionStyles.section
              : `${sectionStyles.section} ${sectionStyles.inactive}`
          }
        >
          {s.id !== 'summary' && <h2 className={sectionStyles.sectionTitle}>{s.title}</h2>}
          {s.hint && <p className={sectionStyles.muted}>{s.hint}</p>}
          {notShared(s.id) || (s.id === 'meds' && isOmitted(snapshot, 'medications')) ? (
            <p className={sectionStyles.muted}>nie udostępniono</p>
          ) : (
            s.body
          )}
        </section>
      ))}
    </div>
  );
}
