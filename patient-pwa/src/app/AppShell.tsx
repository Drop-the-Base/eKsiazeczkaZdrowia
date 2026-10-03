import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { overlays } from './registry';
import { tabs } from './tabs';
import styles from './AppShell.module.css';

export function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {overlays.map((Overlay, i) => (
        <ErrorBoundary key={i}>
          <Overlay />
        </ErrorBoundary>
      ))}
      <nav className={styles.nav} aria-label="Główna nawigacja">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) => (isActive ? `${styles.tab} ${styles.active}` : styles.tab)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
