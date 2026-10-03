import type { AbroadLanguage, MedicationCategory } from '../types.js';

export interface AbroadLabels {
  languageName: string;
  title: string;
  intro: string;
  patient: string;
  born: string;
  bloodType: string;
  allergies: string;
  noAllergies: string;
  medications: string;
  noMedications: string;
  categories: Record<MedicationCategory, string>;
  substance: string;
  dose: string;
  schedule: string;
  since: string;
  conditions: string;
  noConditions: string;
  pastConditions: string;
  untranslated: string;
  /** Name of the ICD-10 classification in this language. */
  icd: string;
  generated: string;
  disclaimer: string;
  asNeeded: string;
  timesDaily: (n: number) => string;
}

export const ABROAD_LABELS: Record<AbroadLanguage, AbroadLabels> = {
  en: {
    languageName: 'English',
    title: 'Medical summary',
    intro:
      'Prepared by the patient from their own records. Medicines are listed by active substance with ATC codes, conditions with ICD-10 codes.',
    patient: 'Patient',
    born: 'Date of birth',
    bloodType: 'Blood type',
    allergies: 'Allergies',
    noAllergies: 'none reported',
    medications: 'Current medicines',
    noMedications: 'none',
    categories: {
      prescription: 'Prescription',
      otc: 'Over the counter',
      supplement: 'Supplements and herbs',
    },
    substance: 'Active substance',
    dose: 'Dose',
    schedule: 'How often',
    since: 'Since',
    conditions: 'Current conditions',
    noConditions: 'none reported',
    pastConditions: 'Past conditions',
    untranslated: 'not translated, in Polish',
    icd: 'ICD-10',
    generated: 'Generated',
    disclaimer: 'Not a medical document. Please verify with the patient.',
    asNeeded: 'as needed',
    timesDaily: (n) => (n === 1 ? 'once daily' : n === 2 ? 'twice daily' : `${n} times daily`),
  },
  de: {
    languageName: 'Deutsch',
    title: 'Medizinische Zusammenfassung',
    intro:
      'Vom Patienten aus eigenen Aufzeichnungen erstellt. Arzneimittel nach Wirkstoff mit ATC-Code, Erkrankungen mit ICD-10-Code.',
    patient: 'Patient/in',
    born: 'Geburtsdatum',
    bloodType: 'Blutgruppe',
    allergies: 'Allergien',
    noAllergies: 'keine bekannt',
    medications: 'Aktuelle Arzneimittel',
    noMedications: 'keine',
    categories: {
      prescription: 'Verschreibungspflichtig',
      otc: 'Rezeptfrei',
      supplement: 'Nahrungsergänzung und Kräuter',
    },
    substance: 'Wirkstoff',
    dose: 'Dosis',
    schedule: 'Einnahme',
    since: 'Seit',
    conditions: 'Aktuelle Erkrankungen',
    noConditions: 'keine bekannt',
    pastConditions: 'Frühere Erkrankungen',
    untranslated: 'nicht übersetzt, auf Polnisch',
    icd: 'ICD-10',
    generated: 'Erstellt',
    disclaimer: 'Kein ärztliches Dokument. Bitte mit dem Patienten überprüfen.',
    asNeeded: 'bei Bedarf',
    timesDaily: (n) => (n === 1 ? '1× täglich' : `${n}× täglich`),
  },
  es: {
    languageName: 'Español',
    title: 'Resumen médico',
    intro:
      'Elaborado por el paciente a partir de sus propios registros. Medicamentos por principio activo con código ATC, enfermedades con código CIE-10.',
    patient: 'Paciente',
    born: 'Fecha de nacimiento',
    bloodType: 'Grupo sanguíneo',
    allergies: 'Alergias',
    noAllergies: 'ninguna conocida',
    medications: 'Medicación actual',
    noMedications: 'ninguna',
    categories: {
      prescription: 'Con receta',
      otc: 'Sin receta',
      supplement: 'Suplementos y hierbas',
    },
    substance: 'Principio activo',
    dose: 'Dosis',
    schedule: 'Frecuencia',
    since: 'Desde',
    conditions: 'Enfermedades actuales',
    noConditions: 'ninguna conocida',
    pastConditions: 'Enfermedades previas',
    untranslated: 'sin traducir, en polaco',
    icd: 'CIE-10',
    generated: 'Generado',
    disclaimer: 'No es un documento médico. Verifíquelo con el paciente.',
    asNeeded: 'a demanda',
    timesDaily: (n) =>
      n === 1 ? 'una vez al día' : n === 2 ? 'dos veces al día' : `${n} veces al día`,
  },
};
