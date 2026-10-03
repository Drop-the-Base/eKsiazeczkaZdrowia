import { Chip, TextField } from '../../../ui';
import { STOP_REASONS } from '../stop.logic';
import styles from './MedicationForm.module.css';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** Szybkie powody + własny tekst (pytanie o powód przy odstawieniu / zmianie). */
export function ReasonPicker({ label, value, onChange, error }: Props) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.chips}>
        {STOP_REASONS.map((r) => (
          <Chip key={r} selected={value === r} onClick={() => onChange(value === r ? '' : r)}>
            {r}
          </Chip>
        ))}
      </div>
      <TextField
        label="Inny powód"
        value={STOP_REASONS.includes(value) ? '' : value}
        placeholder="np. wysypka"
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    </fieldset>
  );
}
