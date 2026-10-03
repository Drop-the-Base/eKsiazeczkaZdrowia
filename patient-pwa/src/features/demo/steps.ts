import { DEMO_PIN } from '../../demoMode';

/** What "Pokaż mi" does: types a sentence into the voice field and sends it, presses a button, or demonstrates zoom/scroll. */
export type ShowMe =
  | { say: string }
  | { press: string }
  | {
      action:
        | 'timeline-zoom-scroll'
        | 'meds-detail'
        | 'today-confirm'
        | 'share-toggle'
        | 'abroad-es'
        | 'security-fill';
    };

export interface TourStep {
  id: string;
  /** Screen to open (inside `/demo`). */
  path?: string;
  /** `data-tour` of the element to light up. */
  target?: string;
  /** `data-tour` of what "Pokaż mi" produced: the light moves there once the demonstration ends. */
  targetAfterShowMe?: string;
  title: string;
  text: string[];
  /** Bold line under the text. */
  punchline?: string;
  /** "W prawdziwej historii…" – only facts from the real case, never more. */
  story?: string;
  /** "Dlaczego to ważne" – the message for whoever is looking. */
  why?: string;
  showMe?: ShowMe;
  /** Whole-screen card without the app (start and end). */
  full?: boolean;
}

// The story is a real case (a medical conference case study, source not named). The app itself never
// interprets – conclusions are said only here, by the guide.
export const STEPS: TourStep[] = [
  {
    id: 'intro',
    full: true,
    title: 'Studium przypadku',
    text: [
      'Pacjentka w trakcie leczenia nowotworu krwi. Po każdej kolejnej zmianie leku wyniki badań ulegały pogorszeniu, a przyczyna pozostawała nieznana.',
      'Na pytanie o przyjmowane leki pacjentka odpowiadała zgodnie z prawdą. Nie wymieniła suplementu z grzybów, ponieważ nie traktowała go jako leku.',
    ],
    punchline: 'Pacjent odpowiada na zadane pytanie, a nie na to, co jest istotne klinicznie.',
    why: 'Prezentacja trwa około 3 minut. Przypadek opisano na konferencji medycznej; imię, daty i wyniki zostały zmienione. Dane demonstracyjne są przechowywane wyłącznie w tej przeglądarce.',
  },
  {
    id: 'timeline',
    path: '/',
    target: 'timeline',
    title: 'Oś czasu',
    text: [
      'Leki, objawy, badania i wizyty w jednym widoku chronologicznym. Po każdym z leków (imatynib, nilotynib, dazatynib) wyniki morfologii były nieprawidłowe.',
      'Jedyną pozycją przyjmowaną nieprzerwanie przez cały okres jest suplement z grzybów (kolor fioletowy).',
      'Oś można przybliżać (+ / −, gest uszczypnięcia) i przewijać w poziomie.',
    ],
    showMe: { action: 'timeline-zoom-scroll' },
    story: 'Lekarze analizowali wyniki osobno, bez wspólnego kontekstu czasowego.',
    why: 'IKP zawiera leki przepisane przez lekarza. Aplikacja uzupełnia je o to, co pacjent faktycznie przyjmuje.',
  },
  {
    id: 'meds',
    path: '/leki',
    target: 'supplements',
    title: 'Pełna lista przyjmowanych preparatów',
    text: [
      'Po dodaniu leku aplikacja pyta o pozostałe preparaty: suplementy, witaminy, zioła i herbaty ziołowe. Podpowiedzi ułatwiają kompletne wypełnienie listy.',
      'Suplementy są prezentowane na równi z lekami na receptę. Po wybraniu leku wyświetlane są dane z Rejestru Produktów Leczniczych.',
    ],
    showMe: { action: 'meds-detail' },
    story:
      'Pytanie dotyczyło wyłącznie leków, dlatego informacja o suplemencie nie została przekazana.',
    why: 'Aplikacja nie generuje automatycznych ostrzeżeń ani nie sugeruje odstawiania preparatów. Ocena kliniczna należy wyłącznie do lekarza, a aplikacja zapewnia mu pełną informację.',
  },
  {
    id: 'today',
    path: '/dzis',
    target: 'today',
    title: 'Potwierdzanie przyjęć',
    text: [
      'Każdą dawkę, również suplementu, pacjent oznacza jako przyjętą lub pominiętą. Ze względu na poufność przypomnienia nie zawierają nazwy leku.',
    ],
    showMe: { action: 'today-confirm' },
    why: 'Lekarz otrzymuje dane o regularności przyjmowania, które zwykle są niedostępne.',
  },
  {
    id: 'visit',
    path: '/wizyta',
    target: 'voice',
    title: 'Sprawy do omówienia',
    text: [
      'Pytania i obserwacje można zapisać w dowolnym momencie, przycisk jest dostępny na każdym ekranie. Przed wizytą kontrolną aplikacja automatycznie wyświetla listę.',
    ],
    showMe: { say: 'po nowym leku kręci mi się w głowie' },
    targetAfterShowMe: 'note-new',
    why: 'Lista spraw jest przygotowana przed wizytą, więc żadna z nich nie zostaje pominięta.',
  },
  {
    id: 'share',
    path: '/wizyta/udostepnij',
    target: 'share-sections',
    title: 'Kontrola udostępnianych danych',
    text: [
      'Pacjent widzi podsumowanie od ostatniej wizyty i może wykluczyć wybrane sekcje. Następnie skanuje kod QR wyświetlony przez lekarza.',
      'Widok lekarza można otworzyć w nowej karcie tej samej przeglądarki.',
    ],
    showMe: { action: 'share-toggle' },
    why: 'Szyfrowanie end-to-end (ECDH, AES-256-GCM): serwer przekazuje wyłącznie szyfrogram. Kod weryfikacyjny na obu ekranach chroni przed podmianą klucza. Lekarz nie potrzebuje konta ani instalacji, a dane są usuwane po zamknięciu karty.',
  },
  {
    id: 'abroad',
    path: '/wizyta/za-granica',
    target: 'abroad',
    title: 'Wizyta za granicą',
    text: [
      'Podsumowanie w języku lekarza: alergie, leki i rozpoznania z kodami ATC i ICD-10. Dostępne offline, z możliwością zapisu do PDF.',
    ],
    showMe: { action: 'abroad-es' },
    targetAfterShowMe: 'abroad-meds',
    why: 'Leki są opisywane nazwą substancji czynnej, ponieważ nazwy handlowe różnią się między krajami.',
  },
  {
    id: 'security',
    path: '/zabezpieczenia',
    target: 'security',
    title: 'Bezpieczeństwo danych',
    text: [
      'Lokalna baza danych jest szyfrowana kluczem wyprowadzonym z PIN-u (Argon2id, AES-256-GCM). Dostępne są także odblokowanie biometryczne i szyfrowana kopia zapasowa. Dokumenty z IKP i zdjęcia wyników (OCR) można dodać w sekcji „Dodaj”.',
      `PIN wersji demonstracyjnej: ${DEMO_PIN}.`,
    ],
    showMe: { action: 'security-fill' },
    why: 'Historia zdrowia nie opuszcza urządzenia. Brak centralnej bazy danych eliminuje ryzyko masowego wycieku.',
  },
  {
    id: 'end',
    full: true,
    title: 'Podsumowanie',
    text: [
      'Każdy kolejny lek wchodził w interakcję z suplementem z grzybów, co tłumaczy nieprawidłowe wyniki toksykologiczne po każdej zmianie leczenia.',
      'Pytanie dotyczyło leków i odpowiedź dotyczyła leków. Informacja o suplemencie dotarła do lekarzy przypadkiem, od córki pacjentki.',
    ],
    punchline:
      'Aplikacja gromadzi pełną informację o przyjmowanych preparatach. Ocena kliniczna pozostaje po stronie lekarza.',
  },
];
