import type { Drug, IsoDate, Medication, NewEntity, ParsedIntake } from '@ez/shared';
import { normalize } from '../drugs/drugs.logic';
import { isCurrent } from '../meds/meds.logic';
import { doseFromStrength } from '../meds/medForm.logic';

/**
 * Dopasowanie z bazy RPL przyjmujemy tylko, gdy wypowiedziane słowo pokrywa większość
 * pierwszego słowa nazwy (żeby „wzięłam leki” nie znalazło przypadkowego leku).
 */
export function acceptsMatch(spoken: string, drug: Drug): boolean {
  const first = normalize(drug.name).split(' ')[0] ?? '';
  const s = normalize(spoken);
  return s.length >= 4 && first.startsWith(s) && s.length >= first.length * 0.7;
}

/** Lek pacjenta, którego dotyczy przyjęcie: ten sam lek z RPL, ta sama substancja albo nazwa. */
export function findMedication(
  meds: Medication[],
  intake: ParsedIntake,
  today: IsoDate,
): Medication | undefined {
  const name = normalize(intake.name);
  const substance = intake.drug && normalize(intake.drug.activeSubstance);
  const current = meds.filter((m) => isCurrent(m, today));
  return (
    current.find((m) => intake.drug && m.rplId === intake.drug.rplId) ??
    current.find(
      (m) => substance && m.activeSubstance && normalize(m.activeSubstance) === substance,
    ) ??
    current.find((m) => normalize(m.name) === name)
  );
}

/** Nowy lek doraźny dla przyjęcia spoza listy (np. Ibuprom kupiony bez recepty). */
export function newAsNeededMedication(intake: ParsedIntake, day: IsoDate): NewEntity<Medication> {
  const d = intake.drug;
  return {
    name: intake.name,
    rplId: d?.rplId,
    activeSubstance: d?.activeSubstance,
    atcCode: d?.atcCode,
    ...(d ? doseFromStrength(d.strength) : { dose: '1', unit: 'porcja' }),
    schedule: { type: 'asNeeded' },
    category: d ? ('otc' in d && d.otc === false ? 'prescription' : 'otc') : 'supplement',
    startDate: day,
    source: 'voice',
  };
}
