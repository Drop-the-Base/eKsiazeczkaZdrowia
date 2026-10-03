import { isOutOfRange, type ShareSnapshot, type TimelineRef } from '@ez/shared';
import { formatDate, formatNumber } from '../../format';
import { describeDose } from '../patient.logic';
import { localDay, rangeFlag } from './timeline.logic';
import styles from './Sections.module.css';

type Props = { snapshot: ShareSnapshot; onSelect: (ref: TimelineRef) => void };

const DAY_MS = 24 * 3600 * 1000;
const MAX_SYMPTOMS = 3;
const MAX_EXAMS = 2;

/** A few lines of "what changed since the last visit" (T2.6b); a click leads to the section / the timeline. */
export function SinceLastVisit({ snapshot, onSelect }: Props) {
  const s = snapshot.summary;
  const item = (ref: TimelineRef, text: string, strong?: boolean) => (
    <button
      key={`${ref.entity}-${ref.id}-${text}`}
      type="button"
      className={styles.item}
      onClick={() => onSelect(ref)}
    >
      {strong ? <strong>{text}</strong> : text}
    </button>
  );
  const firstSymptomId = (name: string) =>
    snapshot.symptoms.find(
      (x) =>
        x.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        localDay(x.startedAt) >= s.since,
    )?.id;
  const rest = (n: number) => (n > 0 ? <span className={styles.muted}>i {n} więcej</span> : null);

  const rows: { label: string; content: React.ReactNode }[] = [];
  const meds = [
    ...s.medsStarted.map((m) =>
      item({ entity: 'medication', id: m.id }, `nowy: ${m.name} ${describeDose(m)}`),
    ),
    ...s.medsChanged.map((c) =>
      item(
        { entity: 'medication', id: c.to.id },
        `zmiana: ${c.to.name} ${describeDose(c.from)} → ${describeDose(c.to)}`,
      ),
    ),
    ...s.medsStopped.map((m) =>
      item(
        { entity: 'medication', id: m.id },
        `odstawiony: ${m.name}${m.stopReason ? ` (${m.stopReason})` : ''}`,
      ),
    ),
  ];
  rows.push({ label: 'Leki i suplementy', content: meds.length > 0 ? meds : 'bez zmian' });
  const total = s.adherence.taken + s.adherence.skipped;
  rows.push({
    label: 'Regularność',
    content: total > 0 ? `potwierdzone ${s.adherence.taken} z ${total} dawek` : 'brak potwierdzeń',
  });
  rows.push({
    label: 'Objawy',
    content:
      s.symptoms.length > 0 ? (
        <>
          {s.symptoms.slice(0, MAX_SYMPTOMS).map((x) => {
            const parts = [`${x.name} ×${x.count}`];
            if (x.maxSeverity) parts.push(`maks. ${x.maxSeverity}/5`);
            parts.push(`od ${formatDate(x.firstAt)}`);
            if (x.afterNewMed) {
              const days = Math.round(
                (Date.parse(x.firstAt) - Date.parse(x.afterNewMed.startDate)) / DAY_MS,
              );
              parts.push(`${days} dni po rozpoczęciu: ${x.afterNewMed.medicationName}`);
            }
            const id = firstSymptomId(x.name);
            return id ? (
              item({ entity: 'symptom', id }, parts.join(', '))
            ) : (
              <span key={x.name}>{parts.join(', ')}</span>
            );
          })}
          {rest(s.symptoms.length - MAX_SYMPTOMS)}
        </>
      ) : (
        'brak'
      ),
  });
  rows.push({
    label: 'Nowe badania',
    content:
      s.newExams.length > 0 ? (
        <>
          {s.newExams.slice(0, MAX_EXAMS).map((e) => {
            const out = e.results
              .filter(isOutOfRange)
              .map((r) => `${r.name} ${formatNumber(r.value)}${rangeFlag(r)}`);
            return item(
              { entity: 'exam', id: e.id },
              `${e.name} ${formatDate(e.date)}${out.length > 0 ? `: ${out.join(', ')}` : ''}`,
              out.length > 0,
            );
          })}
          {rest(s.newExams.length - MAX_EXAMS)}
        </>
      ) : (
        'brak'
      ),
  });
  if (s.newPhotos.length > 0) {
    rows.push({
      label: 'Nowe zdjęcia',
      content: item(
        { entity: 'photo', id: s.newPhotos[0]!.id },
        `${s.newPhotos.length} (od ${formatDate(s.newPhotos[0]!.takenAt)})`,
      ),
    });
  }

  return (
    <section className={styles.box} aria-label="Od ostatniej wizyty">
      <h2 className={styles.title}>Od ostatniej wizyty ({formatDate(s.since)})</h2>
      <dl className={styles.rows}>
        {rows.map((r) => (
          <div key={r.label} className={styles.row}>
            <dt>{r.label}</dt>
            <dd>{r.content}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
