import type { ReactNode } from 'react';
import styles from './States.module.css';

// Stany ekranu z danymi (CLAUDE.md): ładowanie, pusto, błąd – plus same dane.

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.state}>
      <p className={styles.title}>{title}</p>
      {children}
    </div>
  );
}

export function LoadingState({ label = 'Wczytywanie…' }: { label?: string }) {
  return (
    <div className={styles.state} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={`${styles.state} ${styles.error}`} role="alert">
      <p className={styles.title}>Coś poszło nie tak</p>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
