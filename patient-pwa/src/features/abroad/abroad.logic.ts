import {
  ABROAD_LABELS,
  translateAllergy,
  translateDiagnosis,
  translateDose,
  translateMedication,
  translateSchedule,
  type AbroadLabels,
  type AbroadLanguage,
  type Diagnosis,
  type DictText,
  type IsoDate,
  type Medication,
  type MedicationCategory,
  type Profile,
} from '@ez/shared';

export const LANGUAGES: AbroadLanguage[] = ['en', 'de', 'es'];

export interface AbroadMedication {
  id: string;
  substance: DictText;
  /** Brand name as on the package – helps to find the box. */
  brand?: string;
  atc?: string;
  dose: string;
  schedule: string;
  since: IsoDate;
}

export interface AbroadSummary {
  lang: AbroadLanguage;
  labels: AbroadLabels;
  name: string;
  birthDate: IsoDate;
  bloodType?: string;
  allergies: DictText[];
  medications: { category: MedicationCategory; label: string; items: AbroadMedication[] }[];
  conditions: { id: string; text: DictText; icd10?: string }[];
  pastConditions: { id: string; text: DictText; icd10?: string }[];
  /** Some item is shown in Polish because the dictionary has no entry. */
  hasUntranslated: boolean;
}

const ORDER: MedicationCategory[] = ['prescription', 'otc', 'supplement'];

/** Offline summary in the doctor's language: allergies, current medicines (substance + ATC), conditions (ICD-10). */
export function buildAbroadSummary(
  profile: Profile,
  medications: Medication[],
  diagnoses: Diagnosis[],
  today: IsoDate,
  lang: AbroadLanguage,
): AbroadSummary {
  const labels = ABROAD_LABELS[lang];
  const current = medications
    .filter((m) => m.startDate <= today && (m.endDate === undefined || m.endDate >= today))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  const meds = ORDER.map((category) => ({
    category,
    label: labels.categories[category],
    items: current
      .filter((m) => m.category === category)
      .map((m): AbroadMedication => {
        const t = translateMedication(m, lang);
        const item: AbroadMedication = {
          id: m.id,
          substance: t.substance,
          dose: translateDose(m, lang),
          schedule: translateSchedule(m.schedule, lang),
          since: m.startDate,
        };
        if (t.atc) item.atc = t.atc;
        if (t.substance.text.toLowerCase() !== m.name.toLowerCase()) item.brand = m.name;
        return item;
      }),
  }));
  const dx = (d: Diagnosis) => ({ id: d.id, text: translateDiagnosis(d, lang), icd10: d.icd10 });
  const allergies = profile.allergies.map((a) => translateAllergy(a, lang));
  const conditions = diagnoses.filter((d) => d.active).map(dx);
  const pastConditions = diagnoses.filter((d) => !d.active).map(dx);

  const texts = [
    ...allergies,
    ...meds.flatMap((g) => g.items.map((i) => i.substance)),
    ...conditions.map((c) => c.text),
    ...pastConditions.map((c) => c.text),
  ];
  return {
    lang,
    labels,
    name: profile.name,
    birthDate: profile.birthDate,
    bloodType: profile.bloodType,
    allergies,
    medications: meds,
    conditions,
    pastConditions,
    hasUntranslated: texts.some((t) => !t.translated),
  };
}
