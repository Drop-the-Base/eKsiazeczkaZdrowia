import { useState } from 'react';
import type { Medication } from '@ez/shared';
import { BottomSheet, Button, todayIso } from '../../../ui';
import { DrugInfoCard } from '../../drugs';
import { isCurrent } from '../meds.logic';
import { MedicationForm } from './MedicationForm';
import { StopForm } from './StopForm';
import styles from './MedicationForm.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  /** `undefined` = nowy lek. */
  medication: Medication | undefined;
  onSaved?: (saved: Medication, isNew: boolean) => void;
};

type View = 'edit' | 'change' | 'stop';

const TITLES: Record<View, string> = {
  edit: '',
  change: 'Zmiana dawki',
  stop: 'Odstawienie',
};

export function MedicationSheet({ open, onClose, medication, onSaved }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={medication ? medication.name : 'Nowy lek'}>
      {open && (
        <SheetBody
          key={medication?.id ?? 'new'}
          medication={medication}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </BottomSheet>
  );
}

function SheetBody({ medication, onClose, onSaved }: Omit<Props, 'open'>) {
  const [view, setView] = useState<View>('edit');
  const canStop = medication !== undefined && isCurrent(medication, todayIso());

  const saved = (m: Medication, isNew: boolean) => {
    onClose();
    onSaved?.(m, isNew);
  };

  return (
    <div className={styles.form}>
      {view !== 'edit' && (
        <div className={styles.picked}>
          <strong>{TITLES[view]}</strong>
          <Button variant="ghost" onClick={() => setView('edit')}>
            Wróć
          </Button>
        </div>
      )}

      {view === 'edit' && medication && <DrugInfoCard medication={medication} />}

      {view === 'stop' && medication ? (
        <StopForm medication={medication} onDone={onClose} />
      ) : (
        <MedicationForm
          key={view}
          medication={medication}
          mode={view === 'change' ? 'change' : 'edit'}
          onSaved={saved}
        />
      )}

      {view === 'edit' && canStop && (
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setView('change')}>
            Zmień dawkę
          </Button>
          <Button variant="danger" onClick={() => setView('stop')}>
            Odstaw
          </Button>
        </div>
      )}
    </div>
  );
}
