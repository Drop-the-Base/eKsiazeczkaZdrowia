import type { ReactNode } from 'react';
import styles from './Chip.module.css';

type Props = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /** Kolor kropki (np. `var(--color-rx)`) – grupy leków. */
  dotColor?: string;
};

export function Chip({ children, selected, onClick, dotColor }: Props) {
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
    <button type="button" className={className} aria-pressed={selected} onClick={onClick}>
      {dot}
      {children}
    </button>
  );
}
