import type { FeatureRoute, OverlayModule, RouteModule } from './featureRoute';

const routeModules = import.meta.glob<RouteModule>('../features/*/route.tsx', { eager: true });
const overlayModules = import.meta.glob<OverlayModule>('../features/*/overlay.tsx', {
  eager: true,
});

export const featureRoutes: FeatureRoute[] = Object.values(routeModules).flatMap((m) =>
  Array.isArray(m.default) ? m.default : [m.default],
);

export const overlays = Object.values(overlayModules).map((m) => m.default);
