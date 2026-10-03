import type { Translated } from './types.js';

/** ICD-10 codes → names; looked up by the full code, then by the 3-character category. */
export const ICD10: Record<string, Translated> = {
  // demo
  'C92.1': {
    en: 'Chronic myeloid leukaemia',
    de: 'Chronische myeloische Leukämie',
    es: 'Leucemia mieloide crónica',
  },
  C92: { en: 'Myeloid leukaemia', de: 'Myeloische Leukämie', es: 'Leucemia mieloide' },
  I10: {
    en: 'Essential (primary) hypertension',
    de: 'Essentielle (primäre) Hypertonie',
    es: 'Hipertensión esencial (primaria)',
  },
  'I80.2': {
    en: 'Deep vein thrombosis of lower limb',
    de: 'Tiefe Venenthrombose der unteren Extremität',
    es: 'Trombosis venosa profunda de miembro inferior',
  },
  I80: {
    en: 'Phlebitis and thrombophlebitis',
    de: 'Phlebitis und Thrombophlebitis',
    es: 'Flebitis y tromboflebitis',
  },
  // common
  'C91.1': {
    en: 'Chronic lymphocytic leukaemia',
    de: 'Chronische lymphatische Leukämie',
    es: 'Leucemia linfocítica crónica',
  },
  'C90.0': { en: 'Multiple myeloma', de: 'Multiples Myelom', es: 'Mieloma múltiple' },
  C50: { en: 'Breast cancer', de: 'Brustkrebs', es: 'Cáncer de mama' },
  C34: { en: 'Lung cancer', de: 'Lungenkrebs', es: 'Cáncer de pulmón' },
  C18: { en: 'Colon cancer', de: 'Kolonkarzinom', es: 'Cáncer de colon' },
  C61: { en: 'Prostate cancer', de: 'Prostatakrebs', es: 'Cáncer de próstata' },
  D50: { en: 'Iron deficiency anaemia', de: 'Eisenmangelanämie', es: 'Anemia ferropénica' },
  E03: { en: 'Hypothyroidism', de: 'Hypothyreose', es: 'Hipotiroidismo' },
  E10: {
    en: 'Type 1 diabetes mellitus',
    de: 'Diabetes mellitus Typ 1',
    es: 'Diabetes mellitus tipo 1',
  },
  E11: {
    en: 'Type 2 diabetes mellitus',
    de: 'Diabetes mellitus Typ 2',
    es: 'Diabetes mellitus tipo 2',
  },
  E78: { en: 'Hyperlipidaemia', de: 'Hyperlipidämie', es: 'Hiperlipidemia' },
  F32: { en: 'Depressive episode', de: 'Depressive Episode', es: 'Episodio depresivo' },
  G40: { en: 'Epilepsy', de: 'Epilepsie', es: 'Epilepsia' },
  G43: { en: 'Migraine', de: 'Migräne', es: 'Migraña' },
  I25: {
    en: 'Chronic ischaemic heart disease',
    de: 'Chronische ischämische Herzkrankheit',
    es: 'Cardiopatía isquémica crónica',
  },
  I48: { en: 'Atrial fibrillation', de: 'Vorhofflimmern', es: 'Fibrilación auricular' },
  I50: { en: 'Heart failure', de: 'Herzinsuffizienz', es: 'Insuficiencia cardíaca' },
  I63: { en: 'Cerebral infarction', de: 'Hirninfarkt', es: 'Infarto cerebral' },
  J44: {
    en: 'Chronic obstructive pulmonary disease',
    de: 'Chronisch obstruktive Lungenerkrankung',
    es: 'Enfermedad pulmonar obstructiva crónica',
  },
  J45: { en: 'Asthma', de: 'Asthma bronchiale', es: 'Asma' },
  K21: {
    en: 'Gastro-oesophageal reflux disease',
    de: 'Gastroösophageale Refluxkrankheit',
    es: 'Enfermedad por reflujo gastroesofágico',
  },
  K50: { en: "Crohn's disease", de: 'Morbus Crohn', es: 'Enfermedad de Crohn' },
  M06: { en: 'Rheumatoid arthritis', de: 'Rheumatoide Arthritis', es: 'Artritis reumatoide' },
  M81: { en: 'Osteoporosis', de: 'Osteoporose', es: 'Osteoporosis' },
  N18: {
    en: 'Chronic kidney disease',
    de: 'Chronische Nierenkrankheit',
    es: 'Enfermedad renal crónica',
  },
};
