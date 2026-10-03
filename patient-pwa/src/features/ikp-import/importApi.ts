import type { Drug, ExamResult, IsoDate, MedicalDocument } from '@ez/shared';
import { db } from '../../db';
import { todayIso } from '../../ui/format';
import { searchDrugs, type DrugEntry } from '../drugs';
import { doseFromStrength } from '../meds/medForm.logic';
import { acceptsMatch } from '../voice/applyEntry.logic';
import {
  alreadyHasMedication,
  examName,
  findDate,
  findDiagnoses,
  findDrugCandidates,
  findResults,
  newDiagnoses,
  pickByStrength,
  type FoundDiagnosis,
} from './ikp.logic';
import { readText } from './readText';

export type ImportProposal =
  | { kind: 'diagnosis'; item: FoundDiagnosis }
  | { kind: 'exam'; name: string; results: ExamResult[] }
  | { kind: 'medication'; drug: DrugEntry };

export interface ImportResult {
  document: Pick<MedicalDocument, 'id' | 'title' | 'date'>;
  text: string;
  proposals: ImportProposal[];
}

async function proposalsFor(text: string, fallbackName: string): Promise<ImportProposal[]> {
  const [diagnoses, meds] = await Promise.all([db.diagnoses.list(), db.medications.list()]);
  const proposals: ImportProposal[] = newDiagnoses(findDiagnoses(text), diagnoses).map((item) => ({
    kind: 'diagnosis',
    item,
  }));
  const results = findResults(text);
  if (results.length > 0)
    proposals.push({ kind: 'exam', name: examName(text, fallbackName), results });
  for (const candidate of findDrugCandidates(text)) {
    const drug = pickByStrength(await searchDrugs(candidate.name, 30), candidate.strength);
    if (
      drug &&
      acceptsMatch(candidate.name, drug) &&
      !alreadyHasMedication(drug.name, meds, todayIso())
    ) {
      proposals.push({ kind: 'medication', drug });
    }
  }
  return proposals;
}

/** Nowy plik z IKP: zapis dokumentu (źródło) + propozycje z jego tekstu. */
export async function importFile(file: File): Promise<ImportResult> {
  const text = await readText(file);
  const date = findDate(text) ?? todayIso();
  const title = file.name.replace(/\.[^.]+$/, '') || 'Dokument z IKP';
  const document = await db.documents.add({
    title,
    date,
    file,
    mime: file.type || 'text/plain',
    ocrText: text,
    source: 'ikp',
  });
  return { document, text, proposals: await proposalsFor(text, title) };
}

/** Dokument już zapisany (np. z danych demo) – odczyt ponownie. */
export async function readStoredDocument(doc: MedicalDocument): Promise<ImportResult> {
  const text = doc.ocrText ?? (await readText(doc.file));
  return { document: doc, text, proposals: await proposalsFor(text, doc.title) };
}

/** Zapis zatwierdzonych propozycji; data rozpoznania / badania / startu = data dokumentu. */
export async function saveImport(proposals: ImportProposal[], documentId: string, date: IsoDate) {
  for (const p of proposals) {
    if (p.kind === 'diagnosis') {
      await db.diagnoses.add({
        name: p.item.name,
        icd10: p.item.icd10,
        diagnosedAt: date,
        active: true,
        source: 'ikp',
      });
    } else if (p.kind === 'exam') {
      await db.exams.add({ name: p.name, date, results: p.results, documentId });
    } else {
      const d: Drug & { otc?: boolean } = p.drug;
      await db.medications.add({
        name: d.name,
        rplId: d.rplId,
        activeSubstance: d.activeSubstance,
        atcCode: d.atcCode,
        ...doseFromStrength(d.strength),
        schedule: { type: 'daily', times: ['08:00'] },
        category: d.otc ? 'otc' : 'prescription',
        startDate: date,
        source: 'ikp',
      });
    }
  }
}
