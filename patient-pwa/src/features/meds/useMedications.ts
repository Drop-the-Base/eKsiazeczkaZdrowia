import { db } from '../../db';
import { useLive } from '../../ui';

export function useMedications() {
  return useLive(() => db.medications.list());
}
