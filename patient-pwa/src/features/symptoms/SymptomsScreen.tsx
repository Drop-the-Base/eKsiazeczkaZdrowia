import { useState } from 'react';
import {
  Button,
  EmptyState,
  List,
  ListItem,
  LoadingState,
  PageHeader,
  formatDateTime,
} from '../../ui';
import { SymptomSheet } from './components/SymptomSheet';
import { recentFirst, SEVERITY_LABEL } from './symptoms.logic';
import { removeSymptom, useSymptoms } from './useSymptoms';
import styles from './SymptomsScreen.module.css';

export function SymptomsScreen() {
  const symptoms = useSymptoms();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRemove = (id: string, name: string) => {
    if (!window.confirm(`Usunąć wpis „${name}”?`)) return;
    removeSymptom(id).catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć'),
    );
  };

  return (
    <>
      <PageHeader
        title="Objawy"
        back="/profil"
        action={
          <Button variant="ghost" onClick={() => setAdding(true)}>
            + Dodaj
          </Button>
        }
      />
      <div className={styles.content}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {symptoms.status === 'loading' ? (
          <LoadingState />
        ) : symptoms.data.length === 0 ? (
          <EmptyState title="Brak objawów">
            <Button onClick={() => setAdding(true)}>Dodaj objaw</Button>
          </EmptyState>
        ) : (
          <List>
            {recentFirst(symptoms.data).map((s) => (
              <ListItem
                key={s.id}
                title={s.name}
                subtitle={[
                  formatDateTime(s.startedAt),
                  s.severity && `nasilenie ${s.severity}/5 (${SEVERITY_LABEL[s.severity]})`,
                  s.notes,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                trailing="✕"
                onClick={() => onRemove(s.id, s.name)}
              />
            ))}
          </List>
        )}
      </div>
      <SymptomSheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
