/** Where the guide stands: from the session status, then a step through the received data. */
export type Stage = 'qr' | 'verify' | 'view';

export interface GuideStep {
  title: string;
  text: string[];
  /** `data-tour` of the element to light up. */
  target: string;
  /** Section tab opened for this step. */
  tab?: 'summary' | 'timeline';
  story?: string;
  why?: string;
}

// Same real case as in the patient demo (features/demo/steps.ts); the app itself never interprets.
export const QR_STEP: GuideStep = {
  title: 'Bez konta i bez instalacji',
  text: [
    'Lekarz otwiera tę stronę i to wszystko. Pacjent skanuje kod w aplikacji (Wizyta, Udostępnij lekarzowi) i dane płyną na tę kartę.',
    'Nie masz telefonu pod ręką? Przycisk niżej zagra telefon pacjentki. Albo przejdź demo pacjentki w drugiej karcie, a ona sama pobierze ten kod.',
  ],
  target: 'qr',
  why: 'Dane są szyfrowane na telefonie (ECDH, AES-256-GCM). Przekaźnik widzi tylko szyfrogram, bo klucz powstaje na obu urządzeniach i nigdy nie przechodzi przez serwer.',
};

export const VERIFY_STEP: GuideStep = {
  title: 'Ten sam kod na obu ekranach',
  text: [
    'Kod weryfikacyjny jest wyliczany z kluczy obu stron. Gdyby ktoś podmienił klucz po drodze, kody by się różniły.',
    'Przed pokazaniem danych lekarz sprawdza, czy kod jest taki sam jak na telefonie pacjenta.',
  ],
  target: 'code',
  why: 'Dopiero po potwierdzeniu kodu pokazujemy jakiekolwiek dane.',
};

export const VIEW_STEPS: GuideStep[] = [
  {
    title: 'Pacjent chce powiedzieć',
    text: ['Lista spraw i pytań z telefonu jest na samej górze, zanim lekarz zacznie mówić.'],
    target: 'tell',
    tab: 'summary',
    why: 'Na wizycie nic nie ucieka: pacjent nie musi pamiętać, o co chciał zapytać.',
  },
  {
    title: 'Wszystko, co przyjmuje, a nie tylko leki',
    text: [
      'Recepta, leki bez recepty, suplementy i zioła na jednej liście, na równi. Lekarz nie musi wiedzieć, o co dopytać.',
    ],
    target: 'meds-now',
    tab: 'summary',
    story: 'O suplemencie lekarze dowiedzieli się przypadkiem, od córki pacjentki.',
    why: 'Informacje o lekach pokazujemy jako fakty, bez automatycznych ostrzeżeń. Ocena należy do lekarza.',
  },
  {
    title: 'Oś czasu z wynikami',
    text: [
      'Kolejne leki, objawy i wyniki badań na jednej osi. Widać, co zmieniało się w tym samym czasie, a co nie zmieniało się wcale.',
    ],
    target: 'section-timeline',
    tab: 'timeline',
    story: 'Każdy kolejny lek wchodził w interakcję z tym samym suplementem.',
    why: 'Aplikacja niczego nie interpretuje: wniosek wyciąga lekarz.',
  },
  {
    title: 'Koniec wizyty, dane znikają',
    text: [
      'Dane są tylko w pamięci tej karty: bez konta, bez zapisu na dysku, bez service workera. Zakończ wizytę albo zamknij kartę, a strona wraca pusta.',
      'Widok można wydrukować albo zapisać jako PDF (Drukuj).',
    ],
    target: 'end-visit',
    why: 'Lekarz nie zostawia po sobie żadnych danych pacjenta na komputerze.',
  },
];

export const GUIDE_TOTAL = 2 + VIEW_STEPS.length;
