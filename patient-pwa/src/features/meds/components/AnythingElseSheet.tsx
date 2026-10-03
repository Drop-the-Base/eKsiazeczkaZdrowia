import { useState } from 'react';
import type { Medication } from '@ez/shared';
import { db } from '../../../db';
import { BottomSheet, Button, Chip, TextField, todayIso } from '../../../ui';
import { alreadyTaking, COMMON_EXTRAS, quickSupplement } from '../anythingElse.logic';
import styles from './MedicationForm.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Aktualne leki – żeby nie proponować tego, co już jest. */
  current: Medication[];
};

/**
 * Po dodaniu leku: pytanie wprost o suplementy, witaminy i zioła.
 * Pacjent często nie wie, co jest istotne (TASKS.md, „Przykład z życia”).
 */
export function AnythingElseSheet({ open, onClose, current }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Inne przyjmowane preparaty">
      {open && <Body onClose={onClose} current={current} />}
    </BottomSheet>
  );
}

function Body({ onClose, current }: Omit<Props, 'open'>) {
  const [text, setText] = useState('');
  const [added, setAdded] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const taken = [...current, ...added.map((name) => ({ name }))];

  const add = async (name: string) => {
    if (!name.trim() || alreadyTaking(name, taken)) return;
    setError(null);
    try {
      await db.medications.add(quickSupplement(name, todayIso()));
      setAdded((a) => [...a, name.trim()]);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się dodać');
    }
  };

  return (
    <div className={styles.form}>
      <p className={styles.muted}>
        Uwzględnij suplementy, witaminy i herbaty ziołowe. Lekarz zobaczy je na równi z lekami na
        receptę, ponieważ mogą mieć znaczenie kliniczne.
      </p>
      <div className={styles.chips}>
        {COMMON_EXTRAS.filter((name) => !alreadyTaking(name, taken)).map((name) => (
          <Chip key={name} onClick={() => void add(name)}>
            + {name}
          </Chip>
        ))}
      </div>
      <div className={styles.row}>
        <TextField
          label="Inny preparat"
          value={text}
          placeholder="np. kurkuma"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void add(text);
            }
          }}
        />
        <Button variant="secondary" onClick={() => void add(text)} disabled={!text.trim()}>
          Dodaj
        </Button>
      </div>
      {added.length > 0 && (
        <p className={styles.muted}>Dodano: {added.join(', ')}. Szczegóły zmienisz na liście.</p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button block onClick={onClose}>
        {added.length > 0 ? 'Gotowe' : 'Lista jest kompletna'}
      </Button>
    </div>
  );
}
