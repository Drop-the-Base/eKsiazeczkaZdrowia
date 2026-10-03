import type { AbroadLanguage, Diagnosis, Medication, MedicationSchedule } from '../types.js';
import { ICD10 } from './icd10.js';
import { ABROAD_LABELS } from './labels.js';
import { ALLERGENS, UNITS } from './misc.js';
import { SUBSTANCES } from './substances.js';
import { dictKey } from './types.js';

/** A translated text, or the Polish original when the dictionary has no entry (shown as such). */
export interface DictText {
  text: string;
  translated: boolean;
}

const original = (text: string): DictText => ({ text, translated: false });

/**
 * A medicine abroad = its active substance (INN) + ATC, never the Polish brand name alone.
 * The ATC code from the record wins over the dictionary.
 */
export function translateMedication(
  m: Medication,
  lang: AbroadLanguage,
): { substance: DictText; atc?: string } {
  const entry = SUBSTANCES[dictKey(m.activeSubstance ?? m.name)];
  const atc = m.atcCode ?? entry?.atc;
  const substance = entry
    ? { text: entry[lang], translated: true }
    : original(m.activeSubstance ?? m.name);
  return atc ? { substance, atc } : { substance };
}

export function translateDiagnosis(d: Diagnosis, lang: AbroadLanguage): DictText {
  const entry = d.icd10
    ? (ICD10[d.icd10.toUpperCase()] ?? ICD10[d.icd10.toUpperCase().slice(0, 3)])
    : undefined;
  return entry ? { text: entry[lang], translated: true } : original(d.name);
}

export function translateAllergy(allergy: string, lang: AbroadLanguage): DictText {
  const entry = ALLERGENS[dictKey(allergy)];
  return entry ? { text: entry[lang], translated: true } : original(allergy);
}

export function translateDose(m: Pick<Medication, 'dose' | 'unit'>, lang: AbroadLanguage): string {
  const unit = UNITS[dictKey(m.unit)]?.[lang] ?? m.unit;
  return [m.dose, unit].filter(Boolean).join(' ');
}

export function translateSchedule(s: MedicationSchedule, lang: AbroadLanguage): string {
  const l = ABROAD_LABELS[lang];
  if (s.type === 'asNeeded') return l.asNeeded;
  return `${l.timesDaily(s.times.length)} (${[...s.times].sort().join(', ')})`;
}
