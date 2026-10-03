import type { AbroadLanguage } from '../types.js';

/** One text in every language of the "Za granicą" summary. */
export type Translated = Record<AbroadLanguage, string>;

/** Lookup key: lower case, no Polish diacritics, single spaces. */
export function dictKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .trim();
}
