import type {
  Drug,
  IsoDateTime,
  ParsedEntry,
  ParsedIntake,
  ParsedSymptom,
  Severity,
} from '@ez/shared';
import { normalize } from '../drugs/drugs.logic';

// Lokalne rozbijanie wpisu głosowego na objawy i przyjęte leki – bez modelu językowego.
// Wzorce działają na tekście bez polskich znaków (normalize).

const SYMPTOMS: { name: string; pattern: RegExp }[] = [
  { name: 'ból głowy', pattern: /bol\w* (mnie )?glow|glowa (mnie )?bol|bol glowy/ },
  { name: 'zawroty głowy', pattern: /kreci (mi )?sie w glowie|zawrot/ },
  { name: 'nudności', pattern: /mdli|nudnosc|niedobrze|wymiot/ },
  { name: 'zmęczenie', pattern: /zmeczon|zmeczeni|bez sil|brak sil|oslabien/ },
  { name: 'ból brzucha', pattern: /bol\w* (mnie )?brzuch|brzuch (mnie )?bol/ },
  { name: 'gorączka', pattern: /goraczk|temperatur/ },
  { name: 'kaszel', pattern: /kaszl|kaszel/ },
  { name: 'duszność', pattern: /dusz|brak tchu|brakuje (mi )?tchu/ },
  { name: 'wysypka', pattern: /wysypk|swedzi/ },
  { name: 'bezsenność', pattern: /nie (moge|moglam|moglem) (za)?spac|bezsenn/ },
  { name: 'kołatanie serca', pattern: /kolatani|serce (mi )?wali/ },
  { name: 'omdlenie', pattern: /zemdl|omdl/ },
];

/** Formy bez polskich znaków (np. `wzięłam` → `wzielam`). */
const TAKE_VERB =
  /\b(wzi(e|a)l(a|e)m|wzielam|wzialem|zazyl(a|e)m|lyknel(a|e)m|bral(a|e)m|wypil(a|e)m)\b/;

function severityOf(clause: string): Severity | undefined {
  if (/\b(bardzo|mocno|silnie|strasznie|okropnie)\b/.test(clause)) return 4;
  if (/\b(lekko|troche|lekki|lekka)\b/.test(clause)) return 2;
  return undefined;
}

type TimeRule = { pattern: RegExp; at: (now: Date) => Date; carries: boolean };

const at = (now: Date, dayOffset: number, h: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, 0);

/** Kolejność ma znaczenie: dłuższe wyrażenia najpierw. `carries` – obowiązuje też w kolejnych częściach zdania. */
const TIMES: TimeRule[] = [
  { pattern: /wczoraj wieczorem/, at: (n) => at(n, -1, 19), carries: true },
  { pattern: /wczoraj rano/, at: (n) => at(n, -1, 8), carries: true },
  { pattern: /od wczoraj/, at: (n) => at(n, -1, 12), carries: false },
  { pattern: /wczoraj/, at: (n) => at(n, -1, 12), carries: true },
  { pattern: /od rana/, at: (n) => at(n, 0, 7), carries: false },
  { pattern: /\brano\b/, at: (n) => at(n, 0, 8), carries: true },
  { pattern: /w poludnie|po obiedzie/, at: (n) => at(n, 0, 13), carries: true },
  { pattern: /wieczorem/, at: (n) => at(n, 0, 19), carries: true },
  { pattern: /w nocy/, at: (n) => at(n, 0, 2), carries: true },
];

/** Czas z części zdania; nigdy w przyszłości (np. „wieczorem” powiedziane rano → wczoraj nie zgadujemy, bierzemy teraz). */
function timeOf(clause: string, now: Date): { time: Date; carries: boolean } | undefined {
  for (const rule of TIMES) {
    if (rule.pattern.test(clause)) {
      const t = rule.at(now);
      return { time: t > now ? now : t, carries: rule.carries };
    }
  }
  return undefined;
}

/** Słowa po czasowniku „wzięłam …” (do przecinka / „i” / kropki), np. `ibuprom`, `dwie tabletki ibupromu`. */
function takenPhrase(clause: string): string | undefined {
  const m = TAKE_VERB.exec(clause);
  if (!m) return undefined;
  const rest = clause.slice(m.index + m[0].length).trim();
  const words = rest
    .split(' ')
    .filter(
      (w) =>
        w &&
        !/^(jedna|jeden|dwie|dwa|trzy|tabletk\w*|kapsulk\w*|lyzk\w*|na|jak|juz|sobie)$/.test(w),
    );
  return words.slice(0, 2).join(' ') || undefined;
}

export type DrugMatcher = (phrase: string) => Promise<Drug | undefined>;

/** Odmiana na końcu (ibupromu, apapu, magnezu) – próbujemy też bez końcówki. */
function candidates(phrase: string): string[] {
  const [first = '', second] = phrase.split(' ');
  const stems = [first, first.replace(/(u|a|em|ow|y|i)$/, '')].filter((w) => w.length >= 3);
  const list = second ? [`${first} ${second}`, ...stems] : stems;
  return [...new Set(list)];
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('pl') + s.slice(1);

/** Słowo z oryginalnej wypowiedzi (z polskimi znakami) odpowiadające znormalizowanemu. */
function originalWord(text: string, normalized: string): string {
  return text.split(/[^\p{L}\p{N}-]+/u).find((w) => normalize(w) === normalized) ?? normalized;
}

/**
 * „od rana boli mnie głowa, wzięłam ibuprom” → objaw ból głowy (od 7:00) + przyjęcie Ibupromu (teraz).
 * `matchDrug` szuka nazwy w bazie leków (RPL); bez dopasowania lek zostaje pod wypowiedzianą nazwą.
 */
export async function parseEntryWith(
  text: string,
  now: IsoDateTime,
  matchDrug: DrugMatcher,
): Promise<ParsedEntry> {
  const nowDate = new Date(now);
  const clauses = normalize(text)
    .split(/[,.;!?]|\bi\b|\boraz\b|\ba potem\b/)
    .map((c) => c.trim())
    .filter(Boolean);

  const symptoms: ParsedSymptom[] = [];
  const medications: ParsedIntake[] = [];
  let carried: Date | undefined;

  for (const clause of clauses) {
    const own = timeOf(clause, nowDate);
    const time = own?.time ?? carried ?? nowDate;
    if (own?.carries) carried = own.time;

    for (const s of SYMPTOMS) {
      if (s.pattern.test(clause) && !symptoms.some((x) => x.name === s.name)) {
        symptoms.push({
          name: s.name,
          severity: severityOf(clause),
          startedAt: time.toISOString(),
        });
      }
    }

    const phrase = takenPhrase(clause);
    if (phrase) {
      let drug: Drug | undefined;
      for (const c of candidates(phrase)) {
        drug = await matchDrug(c);
        if (drug) break;
      }
      const name = drug?.name ?? capitalize(originalWord(text, phrase.split(' ')[0] ?? phrase));
      medications.push({ name, drug, takenAt: time.toISOString() });
    }
  }
  return { symptoms, medications };
}
