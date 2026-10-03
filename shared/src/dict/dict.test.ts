import { describe, expect, it } from 'vitest';
import { createDemoData } from '../demo-data';
import type { AbroadLanguage } from '../types';
import {
  ABROAD_LABELS,
  translateAllergy,
  translateDiagnosis,
  translateDose,
  translateMedication,
  translateSchedule,
} from './index';

const demo = createDemoData('2026-10-03T18:00:00.000Z');
const LANGS: AbroadLanguage[] = ['en', 'de', 'es'];

describe('dict: every demo item is translated', () => {
  it.each(LANGS)('%s', (lang) => {
    for (const m of demo.medications.filter((x) => x.activeSubstance)) {
      const t = translateMedication(m, lang);
      expect(t.substance.translated, m.name).toBe(true);
      expect(t.atc).toBe(m.atcCode);
    }
    for (const d of demo.diagnoses)
      expect(translateDiagnosis(d, lang).translated, d.name).toBe(true);
    for (const a of demo.profile.allergies)
      expect(translateAllergy(a, lang).translated, a).toBe(true);
    for (const m of demo.medications) expect(translateDose(m, lang)).not.toMatch(/kapsułki/);
    expect(Object.values(ABROAD_LABELS[lang]).every((v) => v !== '')).toBe(true);
  });
});

describe('dict rules', () => {
  const med = demo.medications.find((m) => m.name === 'Dazatynib')!;

  it('translates through the active substance, not the brand', () => {
    expect(translateMedication(med, 'es')).toEqual({
      substance: { text: 'dasatinib', translated: true },
      atc: 'L01EA02',
    });
    const xarelto = demo.medications.find((m) => m.name === 'Xarelto')!;
    expect(translateMedication(xarelto, 'de').substance.text).toBe('Rivaroxaban');
  });

  it('keeps unknown items in Polish and marks them', () => {
    const supplement = demo.medications.find((m) => m.category === 'supplement')!;
    expect(translateMedication(supplement, 'en')).toEqual({
      substance: { text: 'Suplement z grzybów', translated: false },
    });
    expect(translateAllergy('truskawki', 'en')).toEqual({ text: 'truskawki', translated: false });
  });

  it('falls back to the ICD-10 category and translates schedules', () => {
    expect(
      translateDiagnosis(
        {
          id: 'x',
          name: 'Cukrzyca',
          icd10: 'E11.9',
          diagnosedAt: '2020-01-01',
          active: true,
          source: 'manual',
        },
        'de',
      ).text,
    ).toBe('Diabetes mellitus Typ 2');
    expect(translateSchedule({ type: 'daily', times: ['20:00', '08:00'] }, 'es')).toBe(
      'dos veces al día (08:00, 20:00)',
    );
    expect(translateSchedule({ type: 'asNeeded' }, 'en')).toBe('as needed');
    expect(translateDose({ dose: '2', unit: 'kapsułki' }, 'de')).toBe('2 Kapseln');
  });
});
