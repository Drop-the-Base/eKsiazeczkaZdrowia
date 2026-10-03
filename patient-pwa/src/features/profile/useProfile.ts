import type { Profile } from '@ez/shared';
import { db, newId } from '../../db';
import { useLive } from '../../ui';
import type { ProfileForm } from './profile.logic';

export function useProfile() {
  return useLive(() => db.profile.get());
}

export async function saveProfile(form: ProfileForm, existing: Profile | undefined): Promise<void> {
  await db.profile.save({
    ...existing,
    id: existing?.id ?? newId(),
    language: 'pl',
    name: form.name.trim(),
    birthDate: form.birthDate,
    bloodType: form.bloodType || undefined,
    allergies: form.allergies,
  });
}
