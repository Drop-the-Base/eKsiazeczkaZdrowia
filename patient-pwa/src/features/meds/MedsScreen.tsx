import { EmptyState, LoadingState, PageHeader, todayIso } from '../../ui';
import { MedicationGroups } from './components/MedicationGroups';
import { groupMedications } from './meds.logic';
import { useMedications } from './useMedications';
import styles from './MedsScreen.module.css';

export function MedsScreen() {
  const meds = useMedications();

  return (
    <>
      <PageHeader title="Leki i suplementy" />
      <div className={styles.content}>
        {meds.status === 'loading' ? (
          <LoadingState />
        ) : meds.data.length === 0 ? (
          <EmptyState title="Nie masz jeszcze leków">
            Dodaj wszystko, co bierzesz – także leki bez recepty, suplementy i zioła.
          </EmptyState>
        ) : (
          <MedicationGroups {...groupMedications(meds.data, todayIso())} />
        )}
      </div>
    </>
  );
}
