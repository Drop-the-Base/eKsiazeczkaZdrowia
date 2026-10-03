import type { TimelineData, TimelineRef } from '@ez/shared';
import { BottomSheet, formatDate, formatDateTime } from '../../../ui';
import { ExamResults } from '../../exams';
import { describeDose, describeSchedule } from '../../meds';
import styles from './SelectionSheet.module.css';

type Props = { selected: TimelineRef | undefined; data: TimelineData; onClose: () => void };

/** Szczegóły klikniętego znacznika – same fakty z zapisanych danych. */
export function SelectionSheet({ selected, data, onClose }: Props) {
  const content = selected ? describe(selected, data) : null;
  return (
    <BottomSheet open={content !== null} onClose={onClose} title={content?.title}>
      {content && <div className={styles.body}>{content.body}</div>}
    </BottomSheet>
  );
}

function describe(ref: TimelineRef, data: TimelineData) {
  const line = (...parts: (string | undefined | false)[]) => (
    <p className={styles.line}>{parts.filter(Boolean).join(' · ')}</p>
  );
  switch (ref.entity) {
    case 'medication': {
      const m = data.medications.find((x) => x.id === ref.id);
      return m
        ? {
            title: m.name,
            body: (
              <>
                {line(describeDose(m), describeSchedule(m.schedule))}
                {line(
                  `${formatDate(m.startDate)} – ${m.endDate ? formatDate(m.endDate) : 'nadal'}`,
                  m.stopReason && `powód: ${m.stopReason}`,
                )}
                {line(m.activeSubstance, m.atcCode && `ATC ${m.atcCode}`)}
              </>
            ),
          }
        : null;
    }
    case 'intake': {
      const i = data.intakes.find((x) => x.id === ref.id);
      const m = i && data.medications.find((x) => x.id === i.medicationId);
      return i
        ? {
            title: m?.name ?? 'Dawka',
            body: line(
              i.status === 'taken' ? 'wzięty' : 'pominięty',
              formatDateTime(i.scheduledAt),
            ),
          }
        : null;
    }
    case 'symptom': {
      const s = data.symptoms.find((x) => x.id === ref.id);
      return s
        ? {
            title: s.name,
            body: (
              <>
                {line(formatDateTime(s.startedAt), s.severity && `nasilenie ${s.severity}/5`)}
                {s.notes && line(s.notes)}
              </>
            ),
          }
        : null;
    }
    case 'exam': {
      const e = data.exams.find((x) => x.id === ref.id);
      return e
        ? {
            title: `${e.name} · ${formatDate(e.date)}`,
            body: <ExamResults exam={e} />,
          }
        : null;
    }
    case 'visit': {
      const v = data.visits.find((x) => x.id === ref.id);
      return v
        ? {
            title: `Wizyta ${formatDate(v.date)}`,
            body: (
              <>
                {line(v.doctor, v.specialty)}
                {v.transcript && <p className={styles.quote}>{v.transcript}</p>}
                {v.followUpDate && line(`kontrola: ${formatDate(v.followUpDate)}`)}
              </>
            ),
          }
        : null;
    }
    case 'photo': {
      const p = data.photos.find((x) => x.id === ref.id);
      return p
        ? {
            title: `Zdjęcie · ${formatDateTime(p.takenAt)}`,
            body: <img className={styles.photo} src={p.thumbnailUrl} alt="" />,
          }
        : null;
    }
    case 'document': {
      const d = data.documents.find((x) => x.id === ref.id);
      return d
        ? { title: d.title, body: line(formatDate(d.date), d.source === 'ikp' && 'z IKP') }
        : null;
    }
  }
}
