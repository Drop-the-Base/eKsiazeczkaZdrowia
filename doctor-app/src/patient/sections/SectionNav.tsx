import type { SectionId, SectionTab } from './sections.logic';
import styles from './Sections.module.css';

type Props = { tabs: SectionTab[]; current: SectionId; onChange: (id: SectionId) => void };

export function SectionNav({ tabs, current, onChange }: Props) {
  return (
    <nav className={styles.nav} aria-label="Sekcje">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-current={t.id === current ? 'page' : undefined}
          disabled={t.disabled}
          title={t.omitted ? 'Pacjent nie udostępnił' : undefined}
          data-tour={`tab-${t.id}`}
          className={t.id === current ? `${styles.navItem} ${styles.navActive}` : styles.navItem}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={styles.count}>{t.omitted ? '–' : t.count}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
