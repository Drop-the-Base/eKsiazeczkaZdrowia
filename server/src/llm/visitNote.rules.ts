// Rule-based reading of a post-visit note (stand-in until the LLM client from A23).
// Only extracts what is said; medication names are matched to records on the phone.
import type { IsoDate, MedicationSchedule, VisitNoteChanges } from '@ez/shared';

const NUMBER_WORDS: Record<string, number> = {
  jeden: 1,
  jedna: 1,
  jedną: 1,
  jednego: 1,
  dwa: 2,
  dwie: 2,
  dwóch: 2,
  trzy: 3,
  trzech: 3,
  cztery: 4,
  czterech: 4,
  pięć: 5,
  sześć: 6,
  siedem: 7,
  osiem: 8,
  dziewięć: 9,
  dziesięć: 10,
};

const STOP =
  /^(?:odstawi\p{L}*|przesta\p{L}*\s+(?:brać|przyjmować)|zrezygnowa\p{L}*\s+z|nie\s+brać(?:\s+już)?)\s+(.+)$/iu;
const NEW =
  /^(?:(?:lekarz(?:ka)?\s+)?zmieni\p{L}*\s+(?:mi\s+)?(?:lek\s+)?na|przepisa\p{L}*(?:\s+mi)?|zaczą\p{L}*\s+(?:brać|przyjmować)|zacznę\s+brać|nowy\s+lek:?|dosta\p{L}*)\s+(.+)$/iu;
const FOLLOW_UP =
  /kontrol\p{L}*|wizyt\p{L}*\s+kontroln\p{L}*|następn\p{L}*\s+wizyt\p{L}*|przyjść\s+ponownie/iu;
const IN_TIME =
  /za\s+(\d+|\p{L}+)?\s*(dzie[nń]|dni|tydzie[nń]|tygodnie|tygodni|miesiąc|miesiące|miesięcy|rok|lata)/iu;
const DATE = /(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/;
const DOSE = /(\d+(?:[.,]\d+)?)\s*(mg|g|µg|mcg|ml|j\.?m?\.?|tabl\p{L}*|kaps\p{L}*)/iu;
const REASON = /\s*(?:,\s*)?(?:bo|ponieważ|z\s+powodu)\s+(.+)$/iu;

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

function addToDate(today: IsoDate, amount: number, unit: string): IsoDate {
  const [y, m, d] = today.split('-').map(Number) as [number, number, number];
  const u = unit.toLowerCase();
  if (u.startsWith('dzie') || u === 'dni') return iso(new Date(Date.UTC(y, m - 1, d + amount)));
  if (u.startsWith('tydz') || u.startsWith('tygod'))
    return iso(new Date(Date.UTC(y, m - 1, d + 7 * amount)));
  if (u.startsWith('miesi')) return iso(new Date(Date.UTC(y, m - 1 + amount, d)));
  return iso(new Date(Date.UTC(y + amount, m - 1, d)));
}

function followUpDate(clause: string, today: IsoDate): IsoDate | undefined {
  const inTime = IN_TIME.exec(clause);
  if (inTime) {
    const word = inTime[1]?.toLowerCase();
    const amount = word === undefined ? 1 : /^\d+$/.test(word) ? Number(word) : NUMBER_WORDS[word];
    if (amount !== undefined) return addToDate(today, amount, inTime[2]!);
  }
  const date = DATE.exec(clause);
  if (date) {
    const [, dd, mm, yyyy] = date;
    const year = yyyy ? Number(yyyy) : Number(today.slice(0, 4));
    let result = `${year}-${pad(Number(mm))}-${pad(Number(dd))}`;
    if (!yyyy && result < today) result = `${year + 1}-${pad(Number(mm))}-${pad(Number(dd))}`;
    return result;
  }
  return undefined;
}

function schedule(clause: string): MedicationSchedule | undefined {
  const c = clause.toLowerCase();
  if (/doraźnie|w razie potrzeby|przy bólu/.test(c)) return { type: 'asNeeded' };
  if (/(?:2|dwa)\s*(?:razy|x)\s*dziennie|rano\s+i\s+wieczorem/.test(c))
    return { type: 'daily', times: ['08:00', '20:00'] };
  if (/(?:3|trzy)\s*(?:razy|x)\s*dziennie/.test(c))
    return { type: 'daily', times: ['08:00', '14:00', '20:00'] };
  if (/wieczorem|na\s+noc/.test(c)) return { type: 'daily', times: ['20:00'] };
  if (/raz\s+dziennie|1\s*x\s*dziennie|codziennie|rano/.test(c))
    return { type: 'daily', times: ['08:00'] };
  return undefined;
}

/** Name = words before the dose / schedule, without "lek", "leku", "tabletki". */
function cleanName(raw: string): string {
  return raw
    .split(
      /\s+(?=\d)|\s+(?:raz|dwa|trzy|\d)\s*(?:razy|x)\b|\s+(?:rano|wieczorem|codziennie|doraźnie|na\s+noc|w\s+razie)\b/iu,
    )[0]!
    .replace(/^(?:lek(?:u|i)?|tabletk\p{L}*|suplement(?=\s+\p{L}))\s+/iu, '')
    .replace(/[.!?]+$/, '')
    .trim();
}

/** Splits on sentence ends (not dates like 15.01), commas, "oraz" and "i" before a new instruction. */
const clauses = (text: string) =>
  text
    .split(
      /\.(?=\s|$)|[;\n]+|,\s*(?=\p{L})|\s+(?:oraz|a\s+także|i(?=\s+(?:odstaw|zmieni|przepis|kontrol|zaczą)))\s+/iu,
    )
    .map((c) => c.trim())
    .filter(Boolean);

export function parseVisitNoteRules(text: string, today: IsoDate): VisitNoteChanges {
  const result: VisitNoteChanges = { stopMeds: [], newMeds: [] };
  for (const clause of clauses(text)) {
    const stop = STOP.exec(clause);
    if (stop) {
      const reason = REASON.exec(stop[1]!);
      const name = cleanName(reason ? stop[1]!.slice(0, reason.index) : stop[1]!);
      if (name) result.stopMeds.push(reason ? { name, reason: reason[1]!.trim() } : { name });
      continue;
    }
    const add = NEW.exec(clause);
    if (add) {
      const name = cleanName(add[1]!);
      if (!name) continue;
      const med: VisitNoteChanges['newMeds'][number] = { name };
      const dose = DOSE.exec(add[1]!);
      if (dose) {
        med.dose = dose[1]!.replace(',', '.');
        med.unit = dose[2]!;
      }
      const s = schedule(add[1]!);
      if (s) med.schedule = s;
      result.newMeds.push(med);
      continue;
    }
    if (FOLLOW_UP.test(clause) && !result.followUpDate) {
      const date = followUpDate(clause, today);
      if (date) result.followUpDate = date;
    }
  }
  return result;
}
