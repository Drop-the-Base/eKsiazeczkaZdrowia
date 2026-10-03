import type { ReactNode } from 'react';
import { Card } from '../../../ui';
import styles from './SectionCard.module.css';

type Props = {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  children: ReactNode;
  dataTour?: string;
};

/** One part of the summary with a checkbox: unchecked parts are not sent to the doctor. */
export function SectionCard({ label, checked, onToggle, children, dataTour }: Props) {
  return (
    <Card className={checked ? styles.card : `${styles.card} ${styles.off}`}>
      <label className={styles.header} data-tour={dataTour}>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className={styles.label}>{label}</span>
        {!checked && <span className={styles.badge}>wykluczone</span>}
      </label>
      {checked && <div className={styles.body}>{children}</div>}
    </Card>
  );
}
