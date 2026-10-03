// Reguły: pytanie o przeszłość → QueryFilter (bez modelu językowego). Używane, gdy LLM nie jest
// skonfigurowany albo zwróci coś niepoprawnego. Tylko tekst pytania, żadnych danych pacjenta.
import type { IsoDate, QueryEntity, QueryFilter } from '@ez/shared';

const strip = (s: string) =>
  s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Grupy leków po kodzie ATC (tłumaczenie z języka potocznego, bez interpretacji). */
const ATC_GROUPS: { pattern: RegExp; atc: string }[] = [
  { pattern: /przeciwzakrzep|rozrzedz\w* krew|antykoagul/, atc: 'B01' },
  { pattern: /przeciwbol/, atc: 'N02' },
  { pattern: /przeciwzapal|niesterydow/, atc: 'M01' },
  { pattern: /antybiotyk/, atc: 'J01' },
  { pattern: /steryd|kortykosteroid/, atc: 'H02' },
  { pattern: /nasenn|na sen\b/, atc: 'N05C' },
  { pattern: /przeciwdepres|antydepres/, atc: 'N06A' },
  { pattern: /cukrzyc/, atc: 'A10' },
  { pattern: /nadcisnien|na cisnienie/, atc: 'C0' },
  { pattern: /przeciwnowotw|onkolog|na bialaczk|chemi/, atc: 'L01' },
  { pattern: /witamin/, atc: 'A11' },
];

/** Objawy w formie, w jakiej są zapisywane w aplikacji (`symptoms.logic.ts`). */
const SYMPTOMS: { pattern: RegExp; name: string }[] = [
  { pattern: /bol\w* glow/, name: 'ból głowy' },
  { pattern: /zawrot\w* glow|kreci/, name: 'zawroty głowy' },
  { pattern: /nudnosc|mdlosc/, name: 'nudności' },
  { pattern: /zmeczen/, name: 'zmęczenie' },
  { pattern: /bol\w* brzuch/, name: 'ból brzucha' },
  { pattern: /goraczk/, name: 'gorączka' },
  { pattern: /kaszel|kaszl/, name: 'kaszel' },
  { pattern: /dusznosc/, name: 'duszność' },
  { pattern: /wysypk/, name: 'wysypka' },
  { pattern: /bezsennosc/, name: 'bezsenność' },
  { pattern: /omdlen/, name: 'omdlenie' },
];

const NUMBERS: Record<string, number> = {
  jeden: 1,
  jednego: 1,
  dwa: 2,
  dwoch: 2,
  dwie: 2,
  trzy: 3,
  trzech: 3,
  cztery: 4,
  czterech: 4,
  piec: 5,
  pieciu: 5,
  szesc: 6,
  szesciu: 6,
};

const pad = (n: number) => String(n).padStart(2, '0');

function minus(today: IsoDate, days: number, months = 0): IsoDate {
  const [y = 0, m = 1, d = 1] = today.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 - months, d - days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** „w ostatnich 2 miesiącach”, „ostatni tydzień”, „ostatnie 10 dni”, „w tym roku”. */
function periodFrom(q: string, today: IsoDate): IsoDate | undefined {
  const m =
    /ostatni\w*\s+(\d+|[a-z]+)?\s*(dni|dzien|tydzien|tygodni\w*|miesiac\w*|miesiec\w*|rok|lat\w*)/.exec(
      q,
    );
  if (m) {
    const word = m[1];
    const n = word === undefined ? 1 : /^\d+$/.test(word) ? Number(word) : (NUMBERS[word] ?? 1);
    const unit = m[2]!;
    if (unit.startsWith('dni') || unit.startsWith('dzien')) return minus(today, n);
    if (unit.startsWith('tydz') || unit.startsWith('tygod')) return minus(today, 7 * n);
    if (unit.startsWith('miesi')) return minus(today, 0, n);
    return minus(today, 0, 12 * n);
  }
  if (/w tym roku/.test(q)) return `${today.slice(0, 4)}-01-01`;
  return undefined;
}

function entityOf(q: string, symptom: string | undefined): QueryEntity {
  if (/badani|wynik|morfologi|hemoglobin|plytk/.test(q)) return 'exam';
  if (symptom || /objaw|dolegliw|samopoczu/.test(q)) return 'symptom';
  return 'medication';
}

export function queryFilterByRules(question: string, today: IsoDate): QueryFilter {
  const q = strip(question);
  const symptom = SYMPTOMS.find((s) => s.pattern.test(q))?.name;
  const entity = entityOf(q, symptom);
  const filter: QueryFilter = { entity, sort: 'asc' };

  const from = periodFrom(q, today);
  if (from) filter.from = from;
  if (entity === 'medication') {
    const atc = ATC_GROUPS.find((g) => g.pattern.test(q))?.atc;
    if (atc) filter.atcPrefix = atc;
  }
  if (entity === 'symptom' && symptom) filter.name = symptom;
  if (entity === 'exam' && /morfologi/.test(q)) filter.name = 'morfologia';

  if (/kiedy ostatnio|ostatni raz/.test(q)) {
    filter.sort = 'desc';
    filter.limit = 1;
  }
  return filter;
}
