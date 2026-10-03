import { useId } from 'react';
import styles from '../LockScreen.module.css';

type Props = { label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean };

export function PinField({ label, value, onChange, autoFocus }: Props) {
  const id = useId();
  return (
    <label htmlFor={id} className={styles.field}>
      {label}
      <input
        id={id}
        className={styles.pin}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={8}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      />
    </label>
  );
}
