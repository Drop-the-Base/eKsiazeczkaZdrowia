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
  title: 'Bez konta i instalacji',
  text: [
    'Lekarz otwiera tę stronę w przeglądarce. Pacjent skanuje kod w aplikacji (Wizyta → Udostępnij lekarzowi), a dane są przesyłane do tej karty.',
    'Bez telefonu można użyć symulacji telefonu pacjentki (przycisk poniżej) lub otworzyć demo pacjentki w drugiej karcie, które automatycznie pobierze ten kod.',
  ],
  target: 'qr',
  why: 'Dane są szyfrowane na telefonie (ECDH, AES-256-GCM). Serwer pośredniczący przekazuje wyłącznie szyfrogram, ponieważ klucz jest wyznaczany na obu urządzeniach i nie jest przesyłany przez serwer.',
};

export const VERIFY_STEP: GuideStep = {
  title: 'Weryfikacja połączenia',
  text: [
    'Kod weryfikacyjny jest wyznaczany z kluczy obu stron. Podmiana klucza w trakcie transmisji spowodowałaby niezgodność kodów.',
    'Przed wyświetleniem danych lekarz potwierdza, że kod jest identyczny z kodem na telefonie pacjenta.',
  ],
  target: 'code',
  why: 'Dane są wyświetlane dopiero po potwierdzeniu zgodności kodów.',
};

export const VIEW_STEPS: GuideStep[] = [
  {
    title: 'Sprawy zgłoszone przez pacjenta',
    text: ['Pytania i obserwacje zapisane przez pacjenta są wyświetlane na początku widoku.'],
    target: 'tell',
    tab: 'summary',
    why: 'Żadna ze zgłoszonych spraw nie zostaje pominięta w trakcie wizyty.',
  },
  {
    title: 'Pełna lista przyjmowanych preparatów',
    text: [
      'Leki na receptę, leki bez recepty, suplementy i zioła są prezentowane na jednej liście, na równych prawach.',
    ],
    target: 'meds-now',
    tab: 'summary',
    story: 'Informacja o suplemencie dotarła do lekarzy przypadkiem, od córki pacjentki.',
    why: 'Informacje o lekach są prezentowane jako fakty, bez automatycznych ostrzeżeń. Ocena kliniczna należy do lekarza.',
  },
  {
    title: 'Oś czasu z wynikami',
    text: [
      'Leki, objawy i wyniki badań w jednym widoku chronologicznym, z wyraźnym zestawieniem zmian w czasie.',
    ],
    target: 'section-timeline',
    tab: 'timeline',
    story: 'Każdy kolejny lek wchodził w interakcję z tym samym suplementem.',
    why: 'Aplikacja nie interpretuje danych. Wnioski kliniczne formułuje lekarz.',
  },
  {
    title: 'Szczegóły badań na osi czasu',
    text: [
      'Kliknięcie znacznika na osi czasu (rombu badania krwi) otwiera dokładne wyniki laboratoryjne z wartościami referencyjnymi i oznaczeniem odchyleń.',
      'Wyniki pokazują małopłytkowość (PLT 92 tys/µl) powtarzającą się mimo kolejnych modyfikacji leczenia onkologicznego.',
    ],
    target: 'timeline-details',
    tab: 'timeline',
    story:
      'Złe wyniki morfologii były powodem odstawiania kolejnych leków, podczas gdy przyczyną była interakcja ze stale przyjmowanym suplementem.',
    why: 'Szybki podgląd parametrów laboratoryjnych bezpośrednio z osi czasu ułatwia weryfikację dynamiki zmian.',
  },
  {
    title: 'Zakończenie wizyty',
    text: [
      'Dane są przechowywane wyłącznie w pamięci tej karty, bez zapisu na dysku. Po zakończeniu wizyty lub zamknięciu karty są trwale usuwane.',
      'Widok można wydrukować albo zapisać jako PDF (Drukuj).',
    ],
    target: 'end-visit',
    why: 'Na komputerze lekarza nie pozostają żadne dane pacjenta.',
  },
];

export const GUIDE_TOTAL = 2 + VIEW_STEPS.length;
