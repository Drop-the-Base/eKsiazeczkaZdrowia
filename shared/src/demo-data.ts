// Demo profile "Pani Anna" for the happy path (TASKS.md section 4, T0.6).
// Dates are relative to `now`, so the demo always looks current.
// TODO(H02): exact supplement name and blood results come from the real case.
import type {
  Diagnosis,
  DocumentMeta,
  Exam,
  ExamResult,
  Intake,
  IsoDate,
  IsoDateTime,
  Medication,
  MedicationSchedule,
  Profile,
  Reminder,
  Symptom,
  Visit,
  VisitNoteItem,
} from './types.js';

/** Document without the file: the PWA turns `content` into a Blob when loading the demo. */
export interface DemoDocument extends DocumentMeta {
  content: string;
}

export interface DemoData {
  profile: Profile;
  diagnoses: Diagnosis[];
  medications: Medication[];
  intakes: Intake[];
  symptoms: Symptom[];
  exams: Exam[];
  documents: DemoDocument[];
  visits: Visit[];
  visitNoteItems: VisitNoteItem[];
  reminders: Reminder[];
}

/** Days of daily confirmations before today (today is left for the live demo). */
export const DEMO_INTAKE_DAYS = 21;

const SKIPPED_DAYS = new Set([4, 13]);

export function createDemoData(now: IsoDateTime): DemoData {
  const today = new Date(now);
  const shift = (days: number, time = '12:00'): Date => {
    const [h, m] = time.split(':').map(Number);
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + days, h ?? 0, m ?? 0);
  };
  const day = (days: number): IsoDate => {
    const d = shift(days);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  const at = (days: number, time: string): IsoDateTime => shift(days, time).toISOString();

  const profile: Profile = {
    id: 'demo-profile',
    name: 'Anna Kowalska',
    birthDate: '1968-04-02',
    bloodType: 'A Rh+',
    allergies: ['penicylina'],
    language: 'pl',
  };

  const diagnoses: Diagnosis[] = [
    {
      id: 'demo-dx-cml',
      name: 'Przewlekła białaczka szpikowa',
      icd10: 'C92.1',
      diagnosedAt: day(-215),
      active: true,
      source: 'ikp',
    },
    {
      id: 'demo-dx-htn',
      name: 'Nadciśnienie tętnicze',
      icd10: 'I10',
      diagnosedAt: day(-1400),
      active: true,
      source: 'manual',
    },
    {
      id: 'demo-dx-dvt',
      name: 'Zakrzepica żył głębokich kończyny dolnej',
      icd10: 'I80.2',
      diagnosedAt: day(-640),
      active: false,
      source: 'ikp',
    },
  ];

  const daily = (): MedicationSchedule => ({ type: 'daily', times: ['08:00'] });
  const medications: Medication[] = [
    {
      id: 'demo-med-imatinib',
      name: 'Imatinib',
      activeSubstance: 'imatinib',
      atcCode: 'L01EA01',
      dose: '400',
      unit: 'mg',
      schedule: daily(),
      category: 'prescription',
      startDate: day(-180),
      endDate: day(-110),
      stopReason: 'złe wyniki morfologii',
      source: 'visit',
    },
    {
      id: 'demo-med-nilotinib',
      name: 'Nilotynib',
      activeSubstance: 'nilotynib',
      atcCode: 'L01EA03',
      dose: '300',
      unit: 'mg',
      schedule: { type: 'daily', times: ['08:00', '20:00'] },
      category: 'prescription',
      startDate: day(-110),
      endDate: day(-30),
      stopReason: 'złe wyniki morfologii',
      source: 'visit',
    },
    {
      id: 'demo-med-dasatinib',
      name: 'Dazatynib',
      activeSubstance: 'dazatynib',
      atcCode: 'L01EA02',
      dose: '100',
      unit: 'mg',
      schedule: daily(),
      category: 'prescription',
      startDate: day(-30),
      source: 'visit',
    },
    {
      id: 'demo-med-amlodipine',
      name: 'Amlodipina',
      activeSubstance: 'amlodypina',
      atcCode: 'C08CA01',
      dose: '5',
      unit: 'mg',
      schedule: daily(),
      category: 'prescription',
      startDate: day(-1400),
      source: 'manual',
    },
    {
      id: 'demo-med-mushroom',
      name: 'Suplement z grzybów',
      dose: '2',
      unit: 'kapsułki',
      schedule: daily(),
      category: 'supplement',
      startDate: day(-200),
      source: 'manual',
    },
    {
      id: 'demo-med-ibuprom',
      name: 'Ibuprom',
      activeSubstance: 'ibuprofen',
      atcCode: 'M01AE01',
      dose: '200',
      unit: 'mg',
      schedule: { type: 'asNeeded' },
      category: 'otc',
      startDate: day(-60),
      source: 'manual',
    },
    {
      id: 'demo-med-rivaroxaban',
      name: 'Xarelto',
      activeSubstance: 'rywaroksaban',
      atcCode: 'B01AF01',
      dose: '20',
      unit: 'mg',
      schedule: daily(),
      category: 'prescription',
      startDate: day(-640),
      endDate: day(-460),
      stopReason: 'zakończone leczenie zakrzepicy',
      source: 'ikp',
    },
  ];

  const intakes: Intake[] = [];
  for (let d = -DEMO_INTAKE_DAYS; d < 0; d++) {
    for (const medId of ['demo-med-dasatinib', 'demo-med-amlodipine', 'demo-med-mushroom']) {
      const skipped = medId === 'demo-med-dasatinib' && SKIPPED_DAYS.has(-d);
      intakes.push({
        id: `demo-intake-${medId.slice(9)}-${-d}`,
        medicationId: medId,
        scheduledAt: at(d, '08:00'),
        status: skipped ? 'skipped' : 'taken',
        confirmedAt: at(d, '08:20'),
      });
    }
  }
  for (const d of [-20, -8]) {
    intakes.push({
      id: `demo-intake-ibuprom-${-d}`,
      medicationId: 'demo-med-ibuprom',
      scheduledAt: at(d, '10:00'),
      status: 'taken',
      confirmedAt: at(d, '10:00'),
    });
  }

  const symptom = (
    id: string,
    name: string,
    d: number,
    time: string,
    severity: Symptom['severity'],
  ): Symptom => ({
    id: `demo-sym-${id}`,
    name,
    severity,
    startedAt: at(d, time),
    source: 'manual',
  });
  const symptoms: Symptom[] = [
    symptom('fatigue-1', 'zmęczenie', -50, '15:00', 2),
    symptom('dizzy-1', 'zawroty głowy', -26, '09:30', 2),
    symptom('head-1', 'ból głowy', -20, '09:00', 3),
    symptom('dizzy-2', 'zawroty głowy', -19, '10:00', 3),
    symptom('dizzy-3', 'zawroty głowy', -12, '09:15', 3),
    symptom('head-2', 'ból głowy', -8, '08:45', 2),
    symptom('dizzy-4', 'zawroty głowy', -5, '11:00', 4),
    symptom('dizzy-5', 'zawroty głowy', -2, '09:40', 3),
  ];

  const bloodCount = (hgb: number, plt: number, wbc: number): ExamResult[] => [
    { name: 'Hemoglobina (HGB)', value: hgb, unit: 'g/dl', refLow: 12, refHigh: 16 },
    { name: 'Płytki krwi (PLT)', value: plt, unit: 'tys/µl', refLow: 150, refHigh: 400 },
    { name: 'Leukocyty (WBC)', value: wbc, unit: 'tys/µl', refLow: 4, refHigh: 10 },
  ];
  const exams: Exam[] = [
    {
      id: 'demo-exam-1',
      name: 'Morfologia krwi',
      date: day(-160),
      results: bloodCount(9.1, 98, 3.1),
    },
    {
      id: 'demo-exam-2',
      name: 'Morfologia krwi',
      date: day(-90),
      results: bloodCount(8.7, 85, 2.8),
    },
    {
      id: 'demo-exam-3',
      name: 'Morfologia krwi',
      date: day(-10),
      results: bloodCount(8.9, 92, 3.0),
      documentId: 'demo-doc-cbc',
    },
  ];

  const documents: DemoDocument[] = [
    {
      id: 'demo-doc-discharge',
      title: 'Karta informacyjna – rozpoznanie',
      date: day(-215),
      mime: 'text/plain',
      source: 'ikp',
      content: `Karta informacyjna\nPacjentka: Anna Kowalska\nRozpoznanie: Przewlekła białaczka szpikowa (C92.1)\nZalecenia: leczenie w poradni hematologicznej.`,
    },
    {
      id: 'demo-doc-cbc',
      title: 'Wynik badania – morfologia krwi',
      date: day(-10),
      mime: 'text/plain',
      source: 'ikp',
      content: `Morfologia krwi\nHGB 8,9 g/dl (12–16)\nPLT 92 tys/µl (150–400)\nWBC 3,0 tys/µl (4–10)`,
    },
  ];

  const visits: Visit[] = [
    {
      id: 'demo-visit-1',
      date: day(-30),
      doctor: 'dr Nowak',
      specialty: 'hematolog',
      transcript:
        'Lekarz odstawił nilotynib i zalecił dazatynib 100 mg raz dziennie. Kontrola z morfologią za miesiąc.',
      followUpDate: day(3),
      appliedChanges: [
        {
          type: 'stopMedication',
          medicationId: 'demo-med-nilotinib',
          reason: 'złe wyniki morfologii',
        },
        { type: 'newMedication', medicationId: 'demo-med-dasatinib' },
        { type: 'followUp', reminderId: 'demo-rem-followup' },
      ],
    },
  ];

  const visitNoteItems: VisitNoteItem[] = [
    {
      id: 'demo-note-1',
      text: 'Czy mogę dalej brać lek na ciśnienie razem z nowym lekiem?',
      createdAt: at(-33, '19:00'),
      source: 'manual',
      discussed: true,
      visitId: 'demo-visit-1',
    },
    {
      id: 'demo-note-2',
      text: 'Od kilku tygodni jestem bardziej zmęczona po południu',
      createdAt: at(-6, '18:30'),
      source: 'manual',
      discussed: false,
    },
  ];

  const reminders: Reminder[] = [
    { id: 'demo-rem-followup', type: 'followUp', at: at(3, '09:00'), visitId: 'demo-visit-1' },
  ];

  return {
    profile,
    diagnoses,
    medications,
    intakes,
    symptoms,
    exams,
    documents,
    visits,
    visitNoteItems,
    reminders,
  };
}
