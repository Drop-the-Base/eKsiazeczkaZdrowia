import { describe, expect, it } from 'vitest';
import { createDemoData } from '@ez/shared';
import { buildAbroadSummary } from './abroad.logic';

const d = createDemoData('2026-10-03T18:00:00.000Z');
const build = (lang: 'en' | 'de' | 'es') =>
  buildAbroadSummary(d.profile, d.medications, d.diagnoses, '2026-10-03', lang);

describe('buildAbroadSummary', () => {
  it('lists current medicines by active substance with ATC in Spanish', () => {
    const es = build('es');
    expect(es.labels.title).toBe('Resumen médico');
    const rx = es.medications.find((g) => g.category === 'prescription')!;
    expect(rx.items.map((i) => [i.substance.text, i.atc, i.dose])).toEqual([
      ['amlodipino', 'C08CA01', '5 mg'],
      ['dasatinib', 'L01EA02', '100 mg'],
    ]);
    expect(rx.items[0]?.brand).toBe('Amlodipina');
    expect(es.allergies).toEqual([{ text: 'penicilina', translated: true }]);
  });

  it('shows the supplement on a par, in Polish and marked; stopped medicines are left out', () => {
    const en = build('en');
    const supplements = en.medications.find((g) => g.category === 'supplement')!;
    expect(supplements.items[0]?.substance).toEqual({
      text: 'Suplement z grzybów',
      translated: false,
    });
    expect(supplements.items[0]?.dose).toBe('2 capsules');
    expect(en.hasUntranslated).toBe(true);
    expect(en.medications.flatMap((g) => g.items.map((i) => i.substance.text))).not.toContain(
      'rivaroxaban',
    );
  });

  it('splits current and past conditions with ICD-10', () => {
    const de = build('de');
    expect(de.conditions.map((c) => [c.text.text, c.icd10])).toEqual([
      ['Chronische myeloische Leukämie', 'C92.1'],
      ['Essentielle (primäre) Hypertonie', 'I10'],
    ]);
    expect(de.pastConditions.map((c) => c.icd10)).toEqual(['I80.2']);
  });
});
