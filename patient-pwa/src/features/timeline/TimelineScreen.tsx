import { useState } from 'react';
import type { TimelineRef } from '@ez/shared';
import { Card, Chip, EmptyState, LoadingState, PageHeader, todayIso } from '../../ui';
import { SelectionSheet } from './components/SelectionSheet';
import { TodayCard } from './components/TodayCard';
import { Timeline } from './Timeline';
import { focusRange, rangeFor, type RangePreset } from './timeline.logic';
import { useTimelineData } from './useTimelineData';
import styles from './TimelineScreen.module.css';

type Choice = RangePreset | 'focus';

const CHOICES: { value: Choice; label: string }[] = [
  { value: 7, label: '7 dni' },
  { value: 30, label: '30 dni' },
  { value: 'focus', label: 'Ostatnie zmiany' },
  { value: 'all', label: 'Całość' },
];

/** Ekran startowy: wszystko na jednej osi czasu (związek „nowy lek → objaw” na pierwszy rzut oka). */
export function TimelineScreen() {
  const data = useTimelineData();
  const [choice, setChoice] = useState<Choice>('focus');
  const [selected, setSelected] = useState<TimelineRef>();
  const today = todayIso();

  if (data.status === 'loading') {
    return (
      <>
        <PageHeader title="Oś czasu" />
        <LoadingState />
      </>
    );
  }

  const d = data.data;
  const empty = d.medications.length + d.symptoms.length + d.exams.length + d.visits.length === 0;
  const earliest = d.medications.map((m) => m.startDate).sort()[0];
  const range =
    choice === 'focus' ? focusRange(d.medications, today) : rangeFor(choice, today, earliest);

  return (
    <>
      <PageHeader title="Oś czasu" />
      <div className={styles.content}>
        <TodayCard medications={d.medications} intakes={d.intakes} />
        {empty ? (
          <EmptyState title="Twoja oś czasu jest pusta">
            Dodaj leki, objawy albo wyniki badań – albo wczytaj dane demo w profilu.
          </EmptyState>
        ) : (
          <>
            <div className={styles.chips}>
              {CHOICES.map((c) => (
                <Chip
                  key={String(c.value)}
                  selected={choice === c.value}
                  onClick={() => setChoice(c.value)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <Card className={styles.timeline}>
              <Timeline data={d} range={range} highlight={selected} onSelect={setSelected} />
            </Card>
          </>
        )}
      </div>
      <SelectionSheet selected={selected} data={d} onClose={() => setSelected(undefined)} />
    </>
  );
}
