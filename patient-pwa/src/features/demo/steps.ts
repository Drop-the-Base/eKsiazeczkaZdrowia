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
    title: 'Prawdziwy przypadek',
    text: [
      'Pacjentka leczona na nowotwór krwi. Lekarze kolejno zmieniali leki, a po każdej zmianie wyniki były złe. Nikt nie wiedział dlaczego.',
      'Pytali: „Jakie leki pani przyjmuje?”. Odpowiedziała zgodnie z prawdą. O suplemencie z grzybów nie wspomniała – dla niej to nie był lek.',
    ],
    punchline: 'Pacjent odpowiada na pytanie, które usłyszał.',
    why: 'Przejdź tę historię z naszą aplikacją – zajmie to około 3 minut. Prawdziwy przypadek z medycznej konferencji naukowej; imię, daty i wyniki zmienione. Dane demo zostają tylko w tej przeglądarce.',
  },
  {
    id: 'timeline',
    path: '/',
    target: 'timeline',
    title: 'Wszystko na jednej osi',
    text: [
      'Leki, objawy, badania i wizyty w czasie. Imatinib, nilotynib, dazatynib – po każdym złe wyniki morfologii.',
      'Jeden tor nie zmienia się przez cały czas: fioletowy suplement z grzybów.',
    ],
    story: 'Lekarze widzieli każdy wynik osobno – nie mieli powodu szukać wspólnego mianownika.',
    why: 'IKP wie, co lekarz przepisał. My wiemy, co pacjent faktycznie bierze.',
  },
  {
    id: 'meds',
    path: '/leki',
    target: 'supplements',
    title: 'Nie pytamy tylko o leki',
    text: [
      'Po dodaniu leku aplikacja pyta: „Czy bierzesz coś jeszcze? Suplementy, witaminy, zioła, herbatki?” – z podpowiedziami, bo pacjent nie musi wiedzieć, co się liczy.',
      'Suplement jest na liście na równi z lekami z recepty. Dotknij leku, a zobaczysz fakty z Rejestru Produktów Leczniczych.',
    ],
    story: 'Pytanie brzmiało „jakie leki?”. Suplement do niego nie pasował, więc nie padł.',
    why: 'Dlaczego nie ostrzegamy automatycznie? Suplementów zwykle nie ma w bazach interakcji, więc „brak ostrzeżenia” dawałby fałszywe poczucie bezpieczeństwa, a fałszywy alarm – pokusę odstawienia leku na własną rękę. Ocena należy do lekarza; my dbamy, żeby wiedział o wszystkim.',
  },
  {
    id: 'today',
    path: '/dzis',
    target: 'today',
    title: 'Codziennie jedno dotknięcie',
    text: [
      '„Wziąłem / pominąłem” przy każdym leku – także przy suplemencie. Przypomnienie nie pokazuje nazwy leku, bo widać je na zablokowanym ekranie.',
    ],
    why: 'Regularność przyjmowania to dane, których lekarz zwykle nie ma.',
  },
  {
    id: 'add',
    path: '/dodaj',
    target: 'voice',
    title: 'Mów jak do człowieka',
    text: [
      'Jedno zdanie – głosem albo z klawiatury – i aplikacja rozpoznaje objaw oraz lek. Zatwierdzasz jednym dotknięciem.',
    ],
    showMe: { say: 'od rana boli mnie głowa, wzięłam ibuprom' },
    why: 'Rozpoznawanie działa na telefonie – wpis nie wychodzi z urządzenia. Głos pomaga osobom starszym i w gorszym dniu.',
  },
  {
    id: 'visit',
    path: '/wizyta',
    target: 'voice',
    title: 'Powiem lekarzowi',
    text: [
      'Gdy coś przyjdzie do głowy – od razu na listę na wizytę. Przycisk jest na każdym ekranie, a przed wizytą kontrolną lista otwiera się sama.',
    ],
    showMe: { say: 'po nowym leku kręci mi się w głowie' },
    why: 'W gabinecie nic nie ucieka: lista pytań jest gotowa, zanim pacjent wejdzie.',
  },
  {
    id: 'share',
    path: '/wizyta/udostepnij',
    target: 'share-sections',
    title: 'Ty decydujesz, co widzi lekarz',
    text: [
      'Podsumowanie od ostatniej wizyty. Odznacz sekcję, której nie chcesz pokazać, potem „Dalej” i zeskanuj kod QR lekarza.',
      'Bez drugiego urządzenia: otwórz widok lekarza w nowej karcie.',
    ],
    why: 'Szyfrowanie end-to-end (ECDH → AES-256-GCM): serwer przekazuje tylko szyfrogram. Ten sam kod weryfikacyjny na obu ekranach chroni przed podmianą klucza. Lekarz nie potrzebuje konta ani instalacji, a dane znikają po zamknięciu karty.',
  },
  {
    id: 'post-visit',
    path: '/wizyta/po-wizycie',
    target: 'voice',
    title: 'Notatka po wizycie',
    text: [
      'Jedno zdanie po wyjściu z gabinetu – i propozycja: odstawienie suplementu z powodem oraz przypomnienie o kontroli. Nic nie zapisuje się samo, zatwierdzasz.',
    ],
    showMe: { say: 'odstawić suplement z grzybów, kontrola morfologii za dwa tygodnie' },
    story: 'Każdy kolejny lek wchodził w interakcję właśnie z tym suplementem.',
    why: 'Do modelu językowego trafia tylko to jedno zdanie – bez imienia, profilu i historii.',
  },
  {
    id: 'ask',
    path: '/zapytaj',
    target: 'voice',
    title: 'Zapytaj o przeszłość',
    text: [
      'Przed oddaniem krwi, zabiegiem albo u nowego lekarza: „jakie leki brałam w ostatnich dwóch miesiącach?” – lista z datami, razem z suplementem.',
    ],
    showMe: { say: 'jakie leki brałam w ostatnich dwóch miesiącach?' },
    why: 'Model zamienia pytanie na filtr, a odpowiedź powstaje z bazy na telefonie. Model nie widzi Twoich danych.',
  },
  {
    id: 'abroad',
    path: '/wizyta/za-granica',
    target: 'abroad',
    title: 'Na wakacjach w Hiszpanii',
    text: [
      'Podsumowanie w języku lekarza: alergie, leki i choroby z kodami ATC i ICD-10. Działa bez internetu, można zapisać PDF.',
    ],
    showMe: { press: 'lang-es' },
    why: 'Leki tłumaczymy przez substancję czynną – nazwy handlowe różnią się między krajami.',
  },
  {
    id: 'security',
    path: '/zabezpieczenia',
    target: 'security',
    title: 'Twoje dane, Twój telefon',
    text: [
      'Baza na telefonie jest zaszyfrowana kluczem z PIN-u (Argon2id + AES-256-GCM). Do tego odblokowanie odciskiem palca i zaszyfrowana kopia zapasowa. Dokumenty z IKP i zdjęcia wyników (OCR) dodasz w „Dodaj”.',
      `PIN tego demo: ${DEMO_PIN}.`,
    ],
    why: 'Historia zdrowia nigdy nie opuszcza telefonu. Nie mamy serwera z danymi, który dałoby się wykraść.',
  },
  {
    id: 'end',
    full: true,
    title: 'Wystarczyło inne pytanie',
    text: [
      'Każdy kolejny lek wchodził w interakcję z suplementem z grzybów – dlatego wyniki toksykologiczne były złe po każdej zmianie leczenia.',
      'Lekarze zapytali o leki. Pacjentka odpowiedziała o lekach. Nikt nie popełnił błędu, a informacja nie dotarła – lekarze dowiedzieli się o suplemencie przypadkiem, od córki.',
    ],
    punchline: 'Aplikacja pyta o wszystko i pokazuje wszystko. Ocenę zostawia lekarzowi.',
  },
];
