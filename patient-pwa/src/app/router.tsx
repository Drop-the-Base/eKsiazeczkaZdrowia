import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { DEMO_BASE, isDemo } from '../demoMode';
import { AppShell } from './AppShell';
import { DevTimeline } from './DevTimeline';
import { DevUi } from './DevUi';
import { Placeholder } from './Placeholder';
import { featureRoutes } from './registry';
import { tabs } from './tabs';

const registeredPaths = new Set(featureRoutes.map((r) => r.path));

// Zakładki, których właściciel nie zarejestrował jeszcze ekranu, pokazują placeholder.
const placeholderRoutes: RouteObject[] = tabs
  .filter((tab) => !registeredPaths.has(tab.path))
  .map((tab) => ({ path: tab.path, element: <Placeholder title={tab.label} owner={tab.owner} /> }));

export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        ...featureRoutes.map(({ path, element }) => ({ path, element })),
        ...placeholderRoutes,
        ...(import.meta.env.DEV
          ? [
              { path: '/dev/ui', element: <DevUi /> },
              { path: '/dev/timeline', element: <DevTimeline /> },
            ]
          : []),
        { path: '*', element: <Placeholder title="Nie znaleziono" owner="A" /> },
      ],
    },
  ],
  { basename: isDemo ? DEMO_BASE : undefined },
);
