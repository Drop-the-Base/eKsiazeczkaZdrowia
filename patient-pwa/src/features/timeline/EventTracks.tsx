import type { DateRange, TimelineData, TimelineRef } from '@ez/shared';
import { formatDate, formatDateTime } from '../../ui/format';
import { cx, GroupHeader, Lane, Marker, type Grid, type Select } from './parts';
import { documentMarks, examLanes, photoMarks, symptomLanes, visitMarks } from './timeline.logic';
import styles from './Timeline.module.css';

/**
 * Etykiety tylko co ~15% widocznej szerokości – przy długim zakresie nie nachodzą na siebie
 * (pełne dane w tooltipie); po przybliżeniu pokazuje się ich więcej.
 */
function withSpacedLabels<T extends { left: number }>(
  marks: T[],
  zoom: number,
): (T & { showLabel: boolean })[] {
  let last = -Infinity;
  return marks.map((m) => {
    const showLabel = (m.left - last) * zoom >= 15;
    if (showLabel) last = m.left;
    return { ...m, showLabel };
  });
}

type Props = {
  data: TimelineData;
  range: DateRange;
  grid: Grid;
  highlight: TimelineRef | undefined;
  onSelect: Select;
};

/** Tory pod lekami: badania, objawy, wizyty, zdjęcia, dokumenty. Puste sekcje się nie pokazują. */
export function EventTracks({ data, range, grid, highlight, onSelect }: Props) {
  const exams = examLanes(data.exams, range);
  const symptoms = symptomLanes(data.symptoms, range);
  const visits = visitMarks(data.visits, range);
  const photos = photoMarks(data.photos, range);
  const docs = documentMarks(data.documents, range);
  const common = { highlight, onSelect };

  return (
    <>
      {exams.length > 0 && <GroupHeader label="Badania" />}
      {exams.map((lane) => (
        <Lane key={lane.name} label={lane.name} grid={grid}>
          {withSpacedLabels(lane.marks, grid.zoom).map(
            ({ item, left, label, outOfRange, showLabel }) => (
              <Marker
                key={item.id}
                refTo={{ entity: 'exam', id: item.id }}
                title={`${item.name} ${formatDate(item.date)}: ${item.results
                  .map((r) => `${r.name} ${r.value} ${r.unit}`)
                  .join(', ')}`}
                className={cx(styles.examMark, outOfRange && styles.outOfRange)}
                style={{ left: `${left}%` }}
                {...common}
              >
                {showLabel && (
                  <span
                    className={cx(
                      styles.examLabel,
                      (100 - left) * grid.zoom < 35 && styles.examLabelLeft,
                    )}
                  >
                    {label}
                  </span>
                )}
              </Marker>
            ),
          )}
        </Lane>
      ))}

      {symptoms.length > 0 && <GroupHeader label="Objawy" />}
      {symptoms.map((lane) => (
        <Lane key={lane.name} label={lane.name} grid={grid}>
          {lane.marks.map(({ item, left }) => (
            <Marker
              key={item.id}
              refTo={{ entity: 'symptom', id: item.id }}
              title={[
                `${item.name} ${formatDateTime(item.startedAt)}`,
                item.severity && `nasilenie ${item.severity}/5`,
                item.notes,
              ]
                .filter(Boolean)
                .join(' · ')}
              className={styles.symptomMark}
              style={{ left: `${left}%`, opacity: item.severity ? 0.4 + item.severity * 0.12 : 1 }}
              {...common}
            />
          ))}
        </Lane>
      ))}

      {visits.length > 0 && (
        <Lane label="Wizyty" grid={grid}>
          {visits.map(({ item, left }) => (
            <Marker
              key={item.id}
              refTo={{ entity: 'visit', id: item.id }}
              title={[`Wizyta ${formatDate(item.date)}`, item.doctor, item.specialty]
                .filter(Boolean)
                .join(' · ')}
              className={styles.visitMark}
              style={{ left: `${left}%` }}
              {...common}
            />
          ))}
        </Lane>
      )}

      {photos.length > 0 && (
        <Lane label="Zdjęcia" grid={grid}>
          {photos.map(({ item, left }) => (
            <Marker
              key={item.id}
              refTo={{ entity: 'photo', id: item.id }}
              title={`Zdjęcie ${formatDateTime(item.takenAt)}`}
              className={styles.photoMark}
              style={{ left: `${left}%`, backgroundImage: `url(${item.thumbnailUrl})` }}
              {...common}
            />
          ))}
        </Lane>
      )}

      {docs.length > 0 && (
        <Lane label="Dokumenty" grid={grid}>
          {docs.map(({ item, left }) => (
            <Marker
              key={item.id}
              refTo={{ entity: 'document', id: item.id }}
              title={`${item.title} ${formatDate(item.date)}`}
              className={styles.docMark}
              style={{ left: `${left}%` }}
              {...common}
            />
          ))}
        </Lane>
      )}
    </>
  );
}
