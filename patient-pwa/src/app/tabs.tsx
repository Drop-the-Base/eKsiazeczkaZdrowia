import type { ReactElement } from 'react';
import { AskIcon, PlusIcon, ProfileIcon, StethoscopeIcon, TimelineIcon } from './icons';

export type Tab = {
  path: string;
  label: string;
  icon: ReactElement;
  /** Kto rejestruje ekran pod tą ścieżką (`features/*\/route.tsx`). */
  owner: 'A' | 'B';
};

/** Stała dolna nawigacja. Ekran dla zakładki dostarcza funkcja właściciela; do tego czasu placeholder. */
export const tabs: Tab[] = [
  { path: '/', label: 'Oś czasu', icon: <TimelineIcon />, owner: 'A' },
  { path: '/dodaj', label: 'Dodaj', icon: <PlusIcon />, owner: 'A' },
  { path: '/wizyta', label: 'Wizyta', icon: <StethoscopeIcon />, owner: 'B' },
  { path: '/zapytaj', label: 'Zapytaj', icon: <AskIcon />, owner: 'A' },
  { path: '/profil', label: 'Profil', icon: <ProfileIcon />, owner: 'A' },
];
