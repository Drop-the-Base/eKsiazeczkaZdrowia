import { useState } from 'react';
import type { Diagnosis } from '@ez/shared';
import { Button, EmptyState, List, ListItem, LoadingState, formatDate } from '../../../ui';
import { splitDiagnoses } from '../diagnoses.logic';
import { useDiagnoses } from '../useDiagnoses';
import { DiagnosisSheet } from './DiagnosisSheet';
import styles from './DiagnosesSection.module.css';

type Editing = { diagnosis: Diagnosis | undefined } | null;

export function DiagnosesSection() {
  const diagnoses = useDiagnoses();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>Choroby</h2>
        <Button variant="ghost" onClick={() => setEditing({ diagnosis: undefined })}>
          + Dodaj
        </Button>
      </div>

      {diagnoses.status === 'loading' ? (
        <LoadingState />
      ) : diagnoses.data.length === 0 ? (
        <EmptyState title="Brak diagnoz">Dodaj choroby aktualne i przebyte.</EmptyState>
      ) : (
        <DiagnosisGroups
          {...splitDiagnoses(diagnoses.data)}
          onOpen={(d) => setEditing({ diagnosis: d })}
        />
      )}

      <DiagnosisSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        diagnosis={editing?.diagnosis}
      />
    </section>
  );
}

function DiagnosisGroups({
  active,
  past,
  onOpen,
}: {
  active: Diagnosis[];
  past: Diagnosis[];
  onOpen: (d: Diagnosis) => void;
}) {
  const group = (label: string, items: Diagnosis[]) => (
    <div className={styles.group}>
      <h3 className={styles.groupLabel}>{label}</h3>
      {items.length === 0 ? (
        <p className={styles.none}>brak</p>
      ) : (
        <List>
          {items.map((d) => (
            <ListItem
              key={d.id}
              title={d.name}
              subtitle={[d.icd10, `od ${formatDate(d.diagnosedAt)}`].filter(Boolean).join(' · ')}
              trailing="›"
              onClick={() => onOpen(d)}
            />
          ))}
        </List>
      )}
    </div>
  );
  return (
    <>
      {group('Aktualne', active)}
      {group('Przebyte', past)}
    </>
  );
}
