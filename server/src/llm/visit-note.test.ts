import { describe, expect, it } from 'vitest';
import type { LlmClient } from './client';
import { createVisitNoteHandler, validateVisitNoteChanges } from './visit-note';

const today = '2026-10-03';
const body = { text: 'odstawić suplement, kontrola morfologii za dwa tygodnie', today };
const client = (answer: string | Error): LlmClient => ({
  complete: () => (answer instanceof Error ? Promise.reject(answer) : Promise.resolve(answer)),
});

describe('visit-note handler', () => {
  it('uses the model answer when it is valid', async () => {
    const handler = createVisitNoteHandler(
      client(
        '```json\n{"stopMeds":[{"name":"suplement z grzybów","reason":"zalecenie"}],"newMeds":[],"followUpDate":"2026-10-17"}\n```',
      ),
    );
    expect(await handler(body)).toEqual({
      stopMeds: [{ name: 'suplement z grzybów', reason: 'zalecenie' }],
      newMeds: [],
      followUpDate: '2026-10-17',
    });
  });

  it('falls back to the rules on a model error or an invalid answer', async () => {
    const expected = { stopMeds: [{ name: 'suplement' }], newMeds: [], followUpDate: '2026-10-17' };
    expect(await createVisitNoteHandler(client(new Error('down')))(body)).toEqual(expected);
    expect(await createVisitNoteHandler(client('{"stopMeds":"x"}'))(body)).toEqual(expected);
    expect(await createVisitNoteHandler(null)(body)).toEqual(expected);
  });

  it('sanitises the model answer', () => {
    expect(
      validateVisitNoteChanges(
        {
          stopMeds: [],
          newMeds: [
            {
              name: 'Bisocard',
              dose: '5',
              unit: 'mg',
              schedule: { type: 'daily', times: ['8 rano'] },
              category: 'x',
            },
          ],
          followUpDate: '2020-01-01',
        },
        today,
      ),
    ).toEqual({ stopMeds: [], newMeds: [{ name: 'Bisocard', dose: '5', unit: 'mg' }] });
    expect(validateVisitNoteChanges({ stopMeds: [{}], newMeds: [] }, today)).toBeNull();
  });
});
