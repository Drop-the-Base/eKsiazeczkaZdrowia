import type { Diagnosis, ExamResult, IsoDate, Medication } from '@ez/shared';
import { normalize } from '../drugs/drugs.logic';

// Odczyt tekstu dokumentu z IKP (karta informacyjna, e-recepta, wynik badania) → propozycje
// do zatwierdzenia. Tylko to, co jest w tekście – bez zgadywania i bez interpretacji.

export interface FoundDiagnosis {
  name: string;
  icd10: string;
}

const ICD = '[A-TV-Z]\\d{2}(?:\\.\\d{1,2})?';
const NAME_THEN_CODE = new RegExp(`([\\p{Lu}\\p{Ll}][\\p{L} ,-]{2,80}?)\\s*\\((${ICD})\\)`, 'gu');
const CODE_THEN_NAME = new RegExp(`\\b(${ICD})\\s+[-–]?\\s*([\\p{L}][\\p{L} ,-]{2,80})`, 'gu');
const LABEL = /^(rozpoznanie|rozpoznania|diagnoza|choroba|choroby)\s*:\s*/iu;

/** „Rozpoznanie: Przewlekła białaczka szpikowa (C92.1)” albo „C92.1 Przewlekła białaczka szpikowa”. */
export function findDiagnoses(text: string): FoundDiagnosis[] {
  const found = new Map<string, FoundDiagnosis>();
  for (const line of text.split('\n')) {
    const clean = line.replace(LABEL, '').trim();
    for (const m of clean.matchAll(NAME_THEN_CODE)) {
      found.set(m[2]!, { name: m[1]!.trim().replace(/[,-]$/, ''), icd10: m[2]! });
    }
    if (!/\(/.test(clean)) {
      for (const m of clean.matchAll(CODE_THEN_NAME)) {
        if (!found.has(m[1]!)) found.set(m[1]!, { name: m[2]!.trim(), icd10: m[1]! });
      }
    }
  }
  return [...found.values()];
}

const num = (s: string) => Number(s.replace(',', '.'));
const RESULT =
  /^\s*([\p{L}][\p{L}() ]{0,40}?)\s+(\d+(?:[.,]\d+)?)\s*([\p{L}µ/%^\d.]*)\s*\(\s*(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*\)/u;

/** Linie „HGB 8,9 g/dl (12–16)” → wynik z normą. */
export function findResults(text: string): ExamResult[] {
  const results: ExamResult[] = [];
  for (const line of text.split('\n')) {
    const m = RESULT.exec(line);
    if (!m) continue;
    results.push({
      name: m[1]!.trim(),
      value: num(m[2]!),
      unit: m[3] ?? '',
      refLow: num(m[4]!),
      refHigh: num(m[5]!),
    });
  }
  return results;
}

/** Nazwa badania: przy jednym wyniku – jego nazwa; inaczej pierwsza linia dokumentu. */
export function examName(text: string, fallback: string): string {
  const results = findResults(text);
  if (results.length === 1) return results[0]!.name;
  const first = text
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean);
  return first && first.length <= 60 && !RESULT.test(first) ? first : fallback;
}

const DRUG_LINE = /^(?:rp\.?|lek|leki|nazwa leku|przepisano|zalecono)\s*:?\s*(.+)$/iu;
const DOSE_AFTER =
  /^([\p{Lu}][\p{L}-]{2,30}(?: [\p{L}-]{2,20})?)\s+(\d+(?:[.,]\d+)?\s*(?:mg|µg|mcg|g|ml|j\.m\.))/u;

export interface DrugCandidate {
  name: string;
  /** Moc z dokumentu, np. `20 mg` – do wyboru właściwej pozycji z RPL. */
  strength?: string;
}

/** Kandydaci na leki: po „Rp.”, „Lek:” albo nazwa przed dawką („Xarelto 20 mg”); bez linii wyników. */
export function findDrugCandidates(text: string): DrugCandidate[] {
  const out = new Map<string, DrugCandidate>();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (RESULT.test(line)) continue; // „Glukoza 104 mg/dl (70–99)” to wynik, nie lek
    const labelled = DRUG_LINE.exec(line);
    const target = labelled ? labelled[1]!.trim() : line;
    const dosed = DOSE_AFTER.exec(target);
    if (dosed) {
      out.set(dosed[1]!, { name: dosed[1]!, strength: dosed[2]!.replace(/\s+/g, ' ') });
    } else if (labelled) {
      const name = target.split(/[\s,]+/)[0]!;
      if (!out.has(name)) out.set(name, { name });
    }
  }
  return [...out.values()].filter((c) => c.name.length >= 3);
}

const compact = (s: string) => s.replace(',', '.').replace(/\s+/g, '').toLowerCase();

/** Pozycja z RPL o mocy z dokumentu (np. 20 mg zamiast 1 mg/ml); bez mocy – pierwsza. */
export function pickByStrength<T extends { strength: string }>(
  drugs: T[],
  strength?: string,
): T | undefined {
  if (!strength) return drugs[0];
  return drugs.find((d) => compact(d.strength) === compact(strength)) ?? drugs[0];
}

/** Bez propozycji tego, co już jest zapisane. */
export function newDiagnoses(found: FoundDiagnosis[], existing: Diagnosis[]): FoundDiagnosis[] {
  return found.filter(
    (f) =>
      !existing.some(
        (d) => d.icd10?.toUpperCase() === f.icd10 || normalize(d.name) === normalize(f.name),
      ),
  );
}

export function alreadyHasMedication(name: string, meds: Medication[], today: IsoDate): boolean {
  const n = normalize(name);
  return meds.some(
    (m) => normalize(m.name).startsWith(n) && (m.endDate === undefined || m.endDate >= today),
  );
}

/** „Data: 12.09.2026” / „z dnia 2026-09-12” → ISO; inaczej `undefined`. */
export function findDate(text: string): IsoDate | undefined {
  const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(text);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const pl = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/.exec(text);
  if (pl) return `${pl[3]}-${pl[2]!.padStart(2, '0')}-${pl[1]!.padStart(2, '0')}`;
  return undefined;
}
