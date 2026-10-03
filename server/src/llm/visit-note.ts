import type {
  IsoDate,
  LlmVisitNoteResponse,
  MedicationCategory,
  MedicationSchedule,
  VisitNoteChanges,
} from '@ez/shared';
import { BadRequest } from '../json.js';
import { createLlmClient, extractJson, llmConfigFromEnv, type LlmClient } from './client.js';
import { parseVisitNoteRules } from './visitNote.rules.js';

const MAX_TEXT = 2000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const SYSTEM = `Zamieniasz notatkę pacjenta po wizycie u lekarza na listę zmian w lekach w JSON. Nie oceniasz leczenia i nie dodajesz niczego, czego nie ma w notatce.
Zwróć wyłącznie JSON: {"stopMeds":[{"name":string,"reason"?:string}],"newMeds":[{"name":string,"dose"?:string,"unit"?:string,"schedule"?:{"type":"daily","times":["HH:mm"]}|{"type":"asNeeded"},"category"?:"prescription"|"otc"|"supplement"}],"followUpDate"?:"RRRR-MM-DD"}.
- Nazwy leków dokładnie tak, jak w notatce (np. "suplement", "Bisocard").
- "Zmienił lek X na Y" → X w stopMeds (reason: "zmiana leku"), Y w newMeds.
- Termin kontroli licz od dzisiejszej daty podanej w notatce; bez terminu pomiń followUpDate.`;

const str = (x: unknown, max: number) =>
  typeof x === 'string' && x.trim() !== '' && x.length <= max ? x.trim() : undefined;

function schedule(x: unknown): MedicationSchedule | undefined {
  if (typeof x !== 'object' || x === null) return undefined;
  const v = x as Record<string, unknown>;
  if (v.type === 'asNeeded') return { type: 'asNeeded' };
  if (
    v.type === 'daily' &&
    Array.isArray(v.times) &&
    v.times.length > 0 &&
    v.times.every((t) => typeof t === 'string' && TIME.test(t))
  ) {
    return { type: 'daily', times: v.times as string[] };
  }
  return undefined;
}

const CATEGORIES: MedicationCategory[] = ['prescription', 'otc', 'supplement'];

/** The model's answer must be a valid `VisitNoteChanges` (sanitised) – otherwise the rules are used. */
export function validateVisitNoteChanges(value: unknown, today: IsoDate): VisitNoteChanges | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.stopMeds) || !Array.isArray(v.newMeds)) return null;
  const result: VisitNoteChanges = { stopMeds: [], newMeds: [] };
  for (const item of v.stopMeds as unknown[]) {
    const o = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
    const name = str(o.name, 80);
    if (!name) return null;
    const reason = str(o.reason, 200);
    result.stopMeds.push(reason ? { name, reason } : { name });
  }
  for (const item of v.newMeds as unknown[]) {
    const o = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
    const name = str(o.name, 80);
    if (!name) return null;
    const med: VisitNoteChanges['newMeds'][number] = { name };
    const dose = str(o.dose, 20);
    if (dose) med.dose = dose;
    const unit = str(o.unit, 20);
    if (unit) med.unit = unit;
    const s = schedule(o.schedule);
    if (s) med.schedule = s;
    if (CATEGORIES.includes(o.category as MedicationCategory))
      med.category = o.category as MedicationCategory;
    result.newMeds.push(med);
  }
  if (
    typeof v.followUpDate === 'string' &&
    ISO_DATE.test(v.followUpDate) &&
    v.followUpDate >= today
  ) {
    result.followUpDate = v.followUpDate;
  }
  return result;
}

/**
 * `POST /llm/visit-note`: note text → proposed changes. Anonymous: the body is only the note and the
 * date, nothing is logged. Without a model, or when it fails, the note is read by rules.
 */
export function createVisitNoteHandler(client: LlmClient | null) {
  return async function handleVisitNote(body: unknown): Promise<LlmVisitNoteResponse> {
    if (typeof body !== 'object' || body === null) throw new BadRequest('Brak danych');
    const { text, today } = body as Record<string, unknown>;
    if (typeof text !== 'string' || text.trim() === '' || text.length > MAX_TEXT) {
      throw new BadRequest('Pole text: 1–2000 znaków');
    }
    if (typeof today !== 'string' || !ISO_DATE.test(today))
      throw new BadRequest('Pole today: RRRR-MM-DD');

    if (client) {
      try {
        const answer = await client.complete(SYSTEM, `Dziś jest ${today}. Notatka: ${text}`);
        const changes = validateVisitNoteChanges(extractJson(answer), today);
        if (changes) return changes;
      } catch {
        // deliberately no error content in logs – fall back to the rules
      }
    }
    return parseVisitNoteRules(text, today);
  };
}

export const handleVisitNote = createVisitNoteHandler(createLlmClient(llmConfigFromEnv()));
