import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PageHeader.module.css';

type Props = {
  title: string;
  action?: ReactNode;
  /** Ekran poza dolną nawigacją: strzałka wstecz (historia albo `fallback`). */
  back?: string;
};

export function PageHeader({ title, action, back }: Props) {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      {back !== undefined && (
        <button
          type="button"
          className={styles.back}
          aria-label="Wstecz"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(back))}
        >
          ‹
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      {action}
    </header>
  );
}
