import type { IsoDate, Medication, NewEntity } from '@ez/shared';

/** Podpowiedzi rzeczy, które pacjenci często pomijają, bo uważają je za nieistotne. */
export const COMMON_EXTRAS = [
  'Witamina D',
  'Magnez',
  'Omega-3',
  'Żelazo',
  'Melisa',
  'Dziurawiec',
  'Herbatka ziołowa',
  'Suplement z grzybów',
];

/** Szybkie dodanie suplementu / zioła: codziennie rano, 1 porcja – szczegóły można poprawić później. */
export function quickSupplement(name: string, today: IsoDate): NewEntity<Medication> {
  return {
    name: name.trim(),
    dose: '1',
    unit: 'porcja',
    schedule: { type: 'daily', times: ['08:00'] },
    category: 'supplement',
    startDate: today,
    source: 'manual',
  };
}

/** Czy taka nazwa już jest na liście aktualnych (bez względu na wielkość liter). */
export function alreadyTaking(name: string, current: Pick<Medication, 'name'>[]): boolean {
  const n = name.trim().toLocaleLowerCase('pl');
  return current.some((m) => m.name.toLocaleLowerCase('pl') === n);
}
