import type { Medication } from '@ez/shared';
import { BottomSheet } from '../../../ui';
import { MedicationForm } from './MedicationForm';

type Props = {
  open: boolean;
  onClose: () => void;
  /** `undefined` = nowy lek. */
  medication: Medication | undefined;
  onSaved?: (saved: Medication, isNew: boolean) => void;
};

export function MedicationSheet({ open, onClose, medication, onSaved }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={medication ? medication.name : 'Nowy lek'}>
      {open && (
        <MedicationForm
          key={medication?.id ?? 'new'}
          medication={medication}
          onSaved={(saved, isNew) => {
            onClose();
            onSaved?.(saved, isNew);
          }}
        />
      )}
    </BottomSheet>
  );
}
