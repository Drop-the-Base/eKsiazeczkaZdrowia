import type { Translated } from './types.js';

/** Common allergens (Polish key without diacritics). */
export const ALLERGENS: Record<string, Translated> = {
  penicylina: { en: 'penicillin', de: 'Penicillin', es: 'penicilina' },
  amoksycylina: { en: 'amoxicillin', de: 'Amoxicillin', es: 'amoxicilina' },
  sulfonamidy: { en: 'sulfonamides', de: 'Sulfonamide', es: 'sulfamidas' },
  aspiryna: { en: 'aspirin', de: 'Aspirin', es: 'aspirina' },
  'kwas acetylosalicylowy': {
    en: 'acetylsalicylic acid',
    de: 'Acetylsalicylsäure',
    es: 'ácido acetilsalicílico',
  },
  ibuprofen: { en: 'ibuprofen', de: 'Ibuprofen', es: 'ibuprofeno' },
  nlpz: { en: 'NSAIDs', de: 'NSAR', es: 'AINE' },
  jod: { en: 'iodine', de: 'Jod', es: 'yodo' },
  lateks: { en: 'latex', de: 'Latex', es: 'látex' },
  orzechy: { en: 'nuts', de: 'Nüsse', es: 'frutos secos' },
  'orzeszki ziemne': { en: 'peanuts', de: 'Erdnüsse', es: 'cacahuetes' },
  jaja: { en: 'eggs', de: 'Eier', es: 'huevos' },
  mleko: { en: 'milk', de: 'Milch', es: 'leche' },
  laktoza: { en: 'lactose', de: 'Laktose', es: 'lactosa' },
  gluten: { en: 'gluten', de: 'Gluten', es: 'gluten' },
  'owoce morza': { en: 'seafood', de: 'Meeresfrüchte', es: 'mariscos' },
  ryby: { en: 'fish', de: 'Fisch', es: 'pescado' },
  pylki: { en: 'pollen', de: 'Pollen', es: 'polen' },
  'jad pszczoly': { en: 'bee venom', de: 'Bienengift', es: 'veneno de abeja' },
  'jad osy': { en: 'wasp venom', de: 'Wespengift', es: 'veneno de avispa' },
};

/** Units of a dose. */
export const UNITS: Record<string, Translated> = {
  kapsulki: { en: 'capsules', de: 'Kapseln', es: 'cápsulas' },
  kapsulka: { en: 'capsule', de: 'Kapsel', es: 'cápsula' },
  tabletki: { en: 'tablets', de: 'Tabletten', es: 'comprimidos' },
  tabletka: { en: 'tablet', de: 'Tablette', es: 'comprimido' },
  krople: { en: 'drops', de: 'Tropfen', es: 'gotas' },
  saszetka: { en: 'sachet', de: 'Beutel', es: 'sobre' },
  dawka: { en: 'dose', de: 'Dosis', es: 'dosis' },
};
