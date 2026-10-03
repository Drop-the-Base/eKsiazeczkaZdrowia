import type { TransportStatus } from '@ez/shared';

const LABELS: Record<TransportStatus, string> = {
  connecting: 'Łączenie z serwerem…',
  'waiting-for-patient': 'Czeka na pacjenta',
  connected: 'Połączono',
  transferring: 'Odbieranie danych…',
  received: 'Dane odebrane',
  ended: 'Wizyta zakończona',
  expired: 'Sesja wygasła',
  error: 'Połączenie przerwane',
};

export const statusLabel = (status: TransportStatus): string => LABELS[status];

/** `mm:ss` until `expiresAt`, never negative. */
export function formatRemaining(expiresAt: string, now: number): string {
  const total = Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Statuses after which the patient's data must be gone from memory. */
export const isTerminal = (status: TransportStatus): boolean =>
  status === 'ended' || status === 'expired' || status === 'error';
