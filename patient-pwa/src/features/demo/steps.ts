import { DEMO_PIN } from '../../demoMode';

/** What "Pokaż mi" does: types a sentence into the voice field and sends it, or presses a button. */
export type ShowMe = { say: string } | { press: string };

export interface TourStep {
  id: string;
  /** Screen to open (inside `/demo`). */
  path?: string;
  /** `data-tour` of the element to light up. */
  target?: string;
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
    ],
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
    story:
      'Pytanie dotyczyło wyłącznie leków, dlatego informacja o suplemencie nie została przekazana.',
    why: 'Aplikacja nie generuje automatycznych ostrzeżeń. Suplementy rzadko występują w bazach interakcji, więc brak ostrzeżenia mógłby dawać fałszywe poczucie bezpieczeństwa, a fałszywy alarm skłaniać do samodzielnego odstawienia leku. Ocena kliniczna należy do lekarza, a aplikacja zapewnia mu pełną informację.',
  },
  {
    id: 'today',
    path: '/dzis',
    target: 'today',
    title: 'Potwierdzanie przyjęć',
    text: [
      'Każdą dawkę, również suplementu, pacjent oznacza jako przyjętą lub pominiętą. Ze względu na poufność przypomnienia nie zawierają nazwy leku.',
    ],
    why: 'Lekarz otrzymuje dane o regularności przyjmowania, które zwykle są niedostępne.',
  },
  {
    id: 'add',
    path: '/dodaj',
    target: 'voice',
    title: 'Wprowadzanie głosowe',
    text: [
      'Na podstawie jednego zdania, wypowiedzianego lub wpisanego, aplikacja rozpoznaje objaw i lek. Wpis wymaga zatwierdzenia przez użytkownika.',
    ],
    showMe: { say: 'od rana boli mnie głowa, wzięłam ibuprom' },
    why: 'Analiza wpisu odbywa się na urządzeniu. Obsługa głosowa ułatwia korzystanie z aplikacji osobom starszym i z ograniczoną sprawnością.',
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
    why: 'Szyfrowanie end-to-end (ECDH, AES-256-GCM): serwer przekazuje wyłącznie szyfrogram. Kod weryfikacyjny na obu ekranach chroni przed podmianą klucza. Lekarz nie potrzebuje konta ani instalacji, a dane są usuwane po zamknięciu karty.',
  },
  {
    id: 'post-visit',
    path: '/wizyta/po-wizycie',
    target: 'voice',
    title: 'Notatka po wizycie',
    text: [
      'Na podstawie krótkiej notatki aplikacja proponuje zmiany: odstawienie suplementu wraz z powodem oraz przypomnienie o kontroli. Zmiany są zapisywane dopiero po zatwierdzeniu.',
    ],
    showMe: { say: 'odstawić suplement z grzybów, kontrola morfologii za dwa tygodnie' },
    story: 'Każdy kolejny lek wchodził w interakcję z tym suplementem.',
    why: 'Do modelu językowego przekazywana jest wyłącznie treść notatki, bez danych osobowych i historii leczenia.',
  },
  {
    id: 'ask',
    path: '/zapytaj',
    target: 'voice',
    title: 'Wyszukiwanie w historii',
    text: [
      'Przed oddaniem krwi, zabiegiem lub wizytą u nowego lekarza pacjent może zapytać o leki z wybranego okresu. Wynik zawiera daty i obejmuje również suplementy.',
    ],
    showMe: { say: 'jakie leki brałam w ostatnich dwóch miesiącach?' },
    why: 'Model językowy przekształca pytanie w filtr, a odpowiedź jest generowana z lokalnej bazy. Model nie ma dostępu do danych pacjenta.',
  },
  {
    id: 'abroad',
    path: '/wizyta/za-granica',
    target: 'abroad',
    title: 'Wizyta za granicą',
    text: [
      'Podsumowanie w języku lekarza: alergie, leki i rozpoznania z kodami ATC i ICD-10. Dostępne offline, z możliwością zapisu do PDF.',
    ],
    showMe: { press: 'lang-es' },
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
