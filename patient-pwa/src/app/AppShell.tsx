import { NavLink, Outlet } from 'react-router-dom';
import { overlays } from './registry';
import { tabs } from './tabs';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        <Outlet />
      </main>
      {overlays.map((Overlay, i) => (
        <Overlay key={i} />
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
