import { useState } from 'react';
import type { Medication } from '@ez/shared';
import { Button, EmptyState, LoadingState, PageHeader, todayIso } from '../../ui';
import { AnythingElseSheet } from './components/AnythingElseSheet';
import { MedicationGroups } from './components/MedicationGroups';
import { MedicationSheet } from './components/MedicationSheet';
import { groupMedications, isCurrent } from './meds.logic';
import { useMedications } from './useMedications';
import styles from './MedsScreen.module.css';

type Editing = { medication: Medication | undefined } | null;

export function MedsScreen() {
  const meds = useMedications();
  const [editing, setEditing] = useState<Editing>(null);
  const [askMore, setAskMore] = useState(false);
  const addNew = () => setEditing({ medication: undefined });
  const today = todayIso();

  return (
    <>
      <PageHeader
        title="Leki i suplementy"
        back="/profil"
        action={
          <Button variant="ghost" onClick={addNew}>
            + Dodaj
          </Button>
        }
      />
      <div className={styles.content}>
        {meds.status === 'loading' ? (
          <LoadingState />
        ) : meds.data.length === 0 ? (
          <EmptyState title="Nie masz jeszcze leków">
            Dodaj wszystko, co bierzesz – także leki bez recepty, suplementy i zioła.
            <Button onClick={addNew}>Dodaj lek</Button>
          </EmptyState>
        ) : (
          <MedicationGroups
            {...groupMedications(meds.data, today)}
            onOpen={(m) => setEditing({ medication: m })}
          />
        )}
      </div>
      <MedicationSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        medication={editing?.medication}
        onSaved={(_, isNew) => isNew && setAskMore(true)}
      />
      <AnythingElseSheet
        open={askMore}
        onClose={() => setAskMore(false)}
        current={meds.status === 'ready' ? meds.data.filter((m) => isCurrent(m, today)) : []}
      />
    </>
  );
}
