import { createDb } from './createDb';
import { HealthDatabase } from './database';
import { createVault } from './vault';

/** A separate database per test, unlocked with PIN 1234 unless `pin` is null. Test-only helper. */
export async function openTestDb(pin: string | null = '1234') {
  const dexie = new HealthDatabase(`test-${Math.random()}`);
  const vault = createVault(dexie);
  const db = createDb(dexie, vault);
  if (pin) await vault.setup(pin);
  return { dexie, vault, db };
}
