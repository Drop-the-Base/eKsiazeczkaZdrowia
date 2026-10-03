import type { ReactNode } from 'react';
import styles from './Chip.module.css';

type Props = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /** Kolor kropki (np. `var(--color-rx)`) – grupy leków. */
  dotColor?: string;
  /** Kotwica przewodnika demo (`features/demo`). */
  'data-tour'?: string;
};

export function Chip({ children, selected, onClick, dotColor, 'data-tour': tour }: Props) {
  const className = [styles.chip, selected && styles.selected].filter(Boolean).join(' ');
  const dot = dotColor && <span className={styles.dot} style={{ background: dotColor }} />;
  if (!onClick) {
    return (
      <span className={className}>
        {dot}
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      onClick={onClick}
      data-tour={tour}
    >
      {dot}
      {children}
    </button>
  );
}
