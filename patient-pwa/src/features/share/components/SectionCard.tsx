import type { ReactNode } from 'react';
import { Card } from '../../../ui';
import styles from './SectionCard.module.css';

type Props = {
  label: string;
  children: ReactNode;
};

/** One part of the summary preview. */
export function SectionCard({ label, children }: Props) {
  return (
    <Card className={styles.card}>
      <h3 className={styles.label}>{label}</h3>
      <div className={styles.body}>{children}</div>
    </Card>
  );
}
