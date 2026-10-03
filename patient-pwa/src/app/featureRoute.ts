import type { ComponentType, ReactElement } from 'react';

/**
 * Kontrakt rejestracji ekranów. Każda funkcja eksportuje domyślnie z `features/<nazwa>/route.tsx`
 * jeden obiekt albo tablicę; opcjonalnie z `features/<nazwa>/overlay.tsx` komponent pływający.
 */
export type FeatureRoute = {
  path: string;
  element: ReactElement;
};

export type RouteModule = { default: FeatureRoute | FeatureRoute[] };
export type OverlayModule = { default: ComponentType };
