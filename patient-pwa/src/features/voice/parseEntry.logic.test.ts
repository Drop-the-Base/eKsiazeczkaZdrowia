import type { Drug } from '@ez/shared';
import { describe, expect, it } from 'vitest';
import { parseEntryWith } from './parseEntry.logic';

const ibuprom: Drug = {
  rplId: '1',
  name: 'Ibuprom',
  activeSubstance: 'Ibuprofenum',
  strength: '200 mg',
  form: 'Tabletki',
  atcCode: 'M01AE01',
};
const match = async (q: string) => (q === 'ibuprom' ? ibuprom : undefined);

const now = new Date(2026, 9, 3, 20, 30);
const iso = now.toISOString();
const hourOf = (s: string) => new Date(s).getHours();
const dayOf = (s: string) => new Date(s).getDate();

describe('parseEntryWith', () => {
  it('happy path: headache since morning + ibuprom taken now', async () => {
    const r = await parseEntryWith('od rana boli mnie głowa, wzięłam ibuprom', iso, match);
    expect(r.symptoms).toHaveLength(1);
    expect(r.symptoms[0]).toMatchObject({ name: 'ból głowy' });
    expect(hourOf(r.symptoms[0]!.startedAt)).toBe(7);
    expect(r.medications).toEqual([{ name: 'Ibuprom', drug: ibuprom, takenAt: iso }]);
  });

  it('matches inflected drug names and carries point-in-time phrases', async () => {
    const r = await parseEntryWith(
      'wczoraj wieczorem bardzo bolała mnie głowa i wzięłam dwie tabletki ibupromu',
      iso,
      match,
    );
    expect(r.symptoms[0]).toMatchObject({ name: 'ból głowy', severity: 4 });
    expect([dayOf(r.symptoms[0]!.startedAt), hourOf(r.symptoms[0]!.startedAt)]).toEqual([2, 19]);
    expect(r.medications[0]?.drug).toBe(ibuprom);
    expect(hourOf(r.medications[0]!.takenAt)).toBe(19);
  });

  it('recognises several symptoms and unknown drugs by spoken name', async () => {
    const r = await parseEntryWith('kręci mi się w głowie i mdli mnie, wzięłam melisę', iso, match);
    expect(r.symptoms.map((s) => s.name)).toEqual(['zawroty głowy', 'nudności']);
    expect(r.medications).toEqual([{ name: 'Melisę', drug: undefined, takenAt: iso }]);
  });

  it('never dates an entry in the future', async () => {
    const morning = new Date(2026, 9, 3, 9, 0).toISOString();
    const r = await parseEntryWith('wieczorem boli mnie brzuch', morning, match);
    expect(r.symptoms[0]?.startedAt).toBe(morning);
  });

  it('returns nothing for unrelated text', async () => {
    expect(await parseEntryWith('ładna pogoda', iso, match)).toEqual({
      symptoms: [],
      medications: [],
    });
  });
});
