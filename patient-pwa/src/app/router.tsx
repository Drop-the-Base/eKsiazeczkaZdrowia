import { createBrowserRouter } from 'react-router-dom';
import { DEMO_BASE, isDemo } from '../demoMode';
import { AppShell } from './AppShell';
import { DevTimeline } from './DevTimeline';
import { DevUi } from './DevUi';
import { NotFound } from './NotFound';
import { featureRoutes } from './registry';

export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      children: [
        ...featureRoutes.map(({ path, element }) => ({ path, element })),
        ...(import.meta.env.DEV
          ? [
              { path: '/dev/ui', element: <DevUi /> },
              { path: '/dev/timeline', element: <DevTimeline /> },
            ]
          : []),
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: isDemo ? DEMO_BASE : undefined },
);
