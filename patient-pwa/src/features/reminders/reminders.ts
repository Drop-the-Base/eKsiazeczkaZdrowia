import type { CreateReminder } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { dueReminders } from './reminders.logic';

/** Kontrakt `CreateReminder` – zapis w bazie; w PWA bez zaplanowanych powiadomień (brak serwera push). */
export const createReminder: CreateReminder = (input) => db.reminders.add(input);

export function markDone(id: string): Promise<void> {
  return db.reminders.update(id, { doneAt: new Date().toISOString() });
}

export function useDueReminders() {
  return useLive(async () => dueReminders(await db.reminders.list(), new Date().toISOString()));
}

/**
 * Powiadomienie „Czas na lek” (bez nazwy leku) – na demo wywoływane przyciskiem, bo PWA nie
 * zaplanuje go bez serwera. Kliknięcie otwiera `/dzis` (obsługa w `public/sw-notifications.js`).
 */
export async function showMedicationNotification(): Promise<'shown' | 'denied' | 'unsupported'> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
  const permission =
    Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== 'granted') return 'denied';
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return 'unsupported';
  await registration.showNotification('Czas na lek', {
    body: 'Potwierdź: wziąłem / pominąłem',
    icon: '/icon.svg',
    tag: 'medication',
    data: { url: '/dzis' },
  });
  return 'shown';
}
