import { useState } from 'react';
import { createDemoData, type TimelineRef } from '@ez/shared';
import { Chip, PageHeader, todayIso } from '../ui';
import { rangeFor, Timeline, type RangePreset } from '../features/timeline';

const PRESETS: RangePreset[] = [7, 30, 90, 'all'];

/** Podgląd `<Timeline>` na danych demo pod `/dev/timeline` (tak jak użyje go aplikacja lekarza). */
export function DevTimeline() {
  const [demo] = useState(() => createDemoData(new Date().toISOString()));
  const [preset, setPreset] = useState<RangePreset>(90);
  const [selected, setSelected] = useState<TimelineRef>();
  const earliest = demo.medications.map((m) => m.startDate).sort()[0];

  return (
    <>
      <PageHeader title="Oś czasu (dev)" />
      <div style={{ padding: '0 var(--space-4)', display: 'grid', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {PRESETS.map((p) => (
            <Chip key={p} selected={preset === p} onClick={() => setPreset(p)}>
              {p === 'all' ? 'Całość' : `${p} dni`}
            </Chip>
          ))}
        </div>
        <Timeline
          data={{
            medications: demo.medications,
            intakes: demo.intakes,
            symptoms: demo.symptoms,
            exams: demo.exams,
            visits: demo.visits,
            photos: [],
            documents: [],
          }}
          range={rangeFor(preset, todayIso(), earliest)}
          highlight={selected}
          onSelect={setSelected}
        />
        {selected && (
          <p>
            Wybrano: {selected.entity} {selected.id}
          </p>
        )}
      </div>
    </>
  );
}
