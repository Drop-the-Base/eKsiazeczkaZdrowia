import { describe, expect, it } from 'vitest';
import { parseVisitNoteRules } from './visitNote.rules';

const today = '2026-10-03';

describe('parseVisitNoteRules', () => {
  it('reads the happy-path note', () => {
    expect(
      parseVisitNoteRules('odstawić suplement, kontrola morfologii za dwa tygodnie', today),
    ).toEqual({
      stopMeds: [{ name: 'suplement' }],
      newMeds: [],
      followUpDate: '2026-10-17',
    });
  });

  it('reads a medication change with dose and schedule and a follow-up in a month', () => {
    expect(
      parseVisitNoteRules(
        'Lekarz zmienił lek na Bisocard 5 mg raz dziennie. Kontrola za miesiąc.',
        today,
      ),
    ).toEqual({
      stopMeds: [],
      newMeds: [
        { name: 'Bisocard', dose: '5', unit: 'mg', schedule: { type: 'daily', times: ['08:00'] } },
      ],
      followUpDate: '2026-11-03',
    });
  });

  it('keeps the reason of stopping', () => {
    expect(parseVisitNoteRules('przestać brać ibuprom bo boli żołądek', today).stopMeds).toEqual([
      { name: 'ibuprom', reason: 'boli żołądek' },
    ]);
  });

  it('reads several instructions and explicit dates', () => {
    const r = parseVisitNoteRules(
      'odstawić Xarelto i przepisał Eliquis 2,5 mg 2 razy dziennie, wizyta kontrolna 15.01',
      today,
    );
    expect(r.stopMeds).toEqual([{ name: 'Xarelto' }]);
    expect(r.newMeds).toEqual([
      {
        name: 'Eliquis',
        dose: '2.5',
        unit: 'mg',
        schedule: { type: 'daily', times: ['08:00', '20:00'] },
      },
    ]);
    expect(r.followUpDate).toBe('2027-01-15');
  });

  it('returns nothing for a note without instructions', () => {
    expect(parseVisitNoteRules('lekarz był miły', today)).toEqual({ stopMeds: [], newMeds: [] });
    expect(parseVisitNoteRules('kontrola za 10 dni', today).followUpDate).toBe('2026-10-13');
  });
});
