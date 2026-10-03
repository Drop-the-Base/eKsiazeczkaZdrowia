import type { ReactElement } from 'react';
import { AskIcon, PlusIcon, ProfileIcon, StethoscopeIcon, TimelineIcon } from './icons';

export type Tab = {
  path: string;
  label: string;
  icon: ReactElement;
};

/** Stała dolna nawigacja; ekrany rejestruje każda funkcja w swoim route.tsx. */
export const tabs: Tab[] = [
  { path: '/', label: 'Oś czasu', icon: <TimelineIcon /> },
  { path: '/dodaj', label: 'Dodaj', icon: <PlusIcon /> },
  { path: '/wizyta', label: 'Wizyta', icon: <StethoscopeIcon /> },
  { path: '/zapytaj', label: 'Zapytaj', icon: <AskIcon /> },
  { path: '/profil', label: 'Profil', icon: <ProfileIcon /> },
];
