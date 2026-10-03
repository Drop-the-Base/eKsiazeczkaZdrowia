# eKsiazeczkaZdrowia – plan i zadania (HackYeah 2026, Sport & Healthcare)

**Deadline:** 4.10, 23:00 (HackTribe).
**Oddajemy:** tytuł, nazwę zespołu, listę członków, opis projektu, PDF max 10 slajdów (+ link do repo / demo).
**Kryteria:** Idea & Innovation 30% · Relation to Category 20% · Usability 20% · Design 20% · Completeness 10%.

---

## 1. Problem

**Dane medyczne** w tym projekcie to:
- **Przyjmowane leki:** co i kiedy pacjent faktycznie bierze (także leki bez recepty i suplementy).
- **Informacje o lekach:** dawkowanie, substancje czynne, informacje z ulotki (w tym przeciwwskazania, pokazywane jako fakty, **bez automatycznych ostrzeżeń**).
- **Historia badań:** wyniki i daty.
- **Diagnozy:** aktualne i przebyte.
- **Objawy i samopoczucie:** subiektywny stan w danym momencie (np. ból głowy, omdlenie).
- **Zdjęcia:** zmiany skórne, rany, obrzęki, dokumentowane w czasie.

**Główne problemy:**
- **Rozproszenie:** przychodnie, szpitale, laboratoria, aplikacje, papier. IKP zbiera dane oficjalne, ale nie wie, co pacjent faktycznie przyjmuje, jakie ma objawy ani co kupuje bez recepty.
- **Łatwo zgubić lub zapomnieć:** dawki, daty badań, objawy, zalecenia z wizyty, dokumenty.
- **Brak osadzenia w czasie:** trudno powiązać objaw z momentem rozpoczęcia nowego leku.
- **Za granicą:** lekarz nie ma dostępu do historii, a pacjent nie umie jej opisać w obcym języku.

**Przykład z życia (otwarcie pitchu):** pacjentka leczona na nowotwór krwi. Lekarze kolejno zmieniali leki, a po każdym wyniki krwi były złe. Nikt nie wiedział dlaczego. Pacjentka nie uznała za istotne, żeby wspomnieć o suplemencie z grzybów, który brała. Lekarze dowiedzieli się o nim przypadkiem, od jej córki.
→ **Pacjent nie wie, co jest istotne.** Zapisujemy wszystko, co bierze (także suplementy i zioła), i pokazujemy to lekarzowi na równi z lekami z recepty.

**Rozwiązanie w jednym zdaniu:** prywatna oś czasu zdrowia na telefonie pacjenta, uzupełniana głosem, którą w kilka sekund można bezpiecznie pokazać dowolnemu lekarzowi, także za granicą.

## 2. Czym się wyróżniamy

- **mojeIKP** wie, co lekarz przepisał. **My** wiemy, co pacjent faktycznie bierze, plus objawy, zdjęcia, notatki z wizyt i leki bez recepty, na jednej osi czasu.
- **Bearable** to dziennik objawów do samoobserwacji. **My** łączymy dane własne z oficjalnymi dokumentami i projektujemy widok dla lekarza.
- **Głos jako główny sposób obsługi:** wprowadzanie danych i zadawanie pytań o przeszłość.
- **Local-first:** dane tylko na telefonie, zaszyfrowane. **Historia zdrowia nigdy nie opuszcza telefonu.** Do modelu językowego idzie tylko pojedyncze pytanie lub notatka, anonimowo: bez imienia, profilu i historii, a serwer niczego nie zapisuje.

Konkurencja do slajdu: mojeIKP, Bearable (`play.google.com/store/apps/dev?id=8979963710425634832`), CareClinic (`play.google.com/store/apps/dev?id=4896576500808342115`, dziennik objawów i leków z przypomnieniami).

| | mojeIKP | Bearable / CareClinic | **eKsiazeczkaZdrowia** |
|---|---|---|---|
| Leki z recepty | ✅ | ręcznie | ✅ (+ import dokumentów z IKP) |
| Faktyczne przyjmowanie, OTC, suplementy | ❌ | ✅ | ✅ |
| Objawy, zdjęcia w czasie | ❌ | objawy | ✅ |
| **Jedna oś czasu: leki + objawy + badania + wizyty + zdjęcia** | ❌ | częściowo | ✅ |
| **Głos: wpisy i pytania o przeszłość** | ❌ | ❌ | ✅ |
| **Lista „powiem lekarzowi” + notatka po wizycie** | ❌ | ❌ | ✅ |
| **Widok dla lekarza przez QR, bez konta i instalacji** | ❌ | eksport PDF | ✅ |
| **Dane tylko na telefonie, przesył szyfrowany end-to-end** | ❌ | ❌ (chmura) | ✅ |
| **Podsumowanie offline w języku lekarza (ATC, ICD-10)** | częściowo (MyHealth@EU) | ❌ | ✅ |

## 3. Funkcje

**Zbieranie danych**
- **Pytanie o wszystko, co pacjent bierze:** przy dodawaniu leków aplikacja pyta wprost o suplementy, witaminy, zioła i leki bez recepty (*„czy bierzesz coś jeszcze, nawet herbatki ziołowe?”*).
- Wpis głosowy: *„od rana boli mnie głowa, wzięłam ibuprom”* → rozpoznany objaw + lek → zatwierdzenie jednym dotknięciem.
- Baza leków z **Rejestru Produktów Leczniczych** (dane otwarte): podpowiadanie nazw, substancje czynne, dawki, kod ATC, link do ulotki.
- **Import dokumentów z IKP:** pacjent pobiera dokument i udostępnia go aplikacji przez systemowe menu „Udostępnij”.
- **Zdjęcie wyniku badania** z rozpoznawaniem tekstu na urządzeniu.
- **Zdjęcia w czasie:** zrobione w aplikacji albo dodane z galerii.

**Codzienność**
- Przypomnienia o lekach z potwierdzeniem „wziąłem / pominąłem” (docelowo lokalne powiadomienia w aplikacji mobilnej; w PWA na demo symulowane, patrz T2.5).
- Przy odstawieniu lub zmianie leku pytanie o powód („mdłości”, „nie pomagało”).

**Wizyta u lekarza**
- **Lista na wizytę:** w dowolnej chwili *„powiem lekarzowi, że…”*; przed wizytą lista wyświetla się automatycznie.
- **Podsumowanie danych:** przy wizycie aplikacja szykuje zestawienie, żeby lekarz od razu zobaczył potrzebne informacje (zmiany od ostatniej wizyty, objawy, regularność leków, nowe badania i zdjęcia).
- **Widok dla lekarza:** w przeglądarce lekarza (szyfrowane end-to-end). Bez przewijania: „Pacjent chce powiedzieć”, wszystko, co pacjent przyjmuje (recepty, bez recepty, suplementy i zioła na równi) oraz oś czasu z wynikami badań; niżej zdjęcia, wizyty, odstawione leki.
- **Notatka głosowa po wizycie:** *„lekarz zmienił lek na X, kontrola za miesiąc”* → propozycja zmian w lekach i przypomnienia o kontroli do zatwierdzenia.

**Pytania o przeszłość** (model językowy zamienia pytanie na filtr; odpowiedź pochodzi z lokalnej bazy; model **nie dostaje historii**)
- *„Jakie leki brałam w ostatnich 2 miesiącach?”* (oddawanie krwi)
- *„Kiedy ostatnio brałam leki przeciwzakrzepowe?”* (przed zabiegiem; kategoria przez kod ATC B01)
- *„Od kiedy mam te bóle głowy?”* (nowy lekarz)

**Za granicą**
- Podsumowanie **offline** w języku lekarza: alergie, aktualne leki, choroby, z kodami **ATC** i **ICD-10**. Leki tłumaczone przez substancję czynną. Na ekranie albo jako PDF.

## 4. Happy path (scenariusz demo)

1. **Pani Anna**, leczona na nowotwór krwi, instaluje aplikację i dodaje leki. Aplikacja pyta: *„czy bierzesz coś jeszcze, nawet suplementy albo zioła?”*. Anna dodaje suplement, który sama uważa za nieistotny.
2. Codziennie potwierdza leki i suplement jednym dotknięciem. Wieczorem mówi: *„od rana boli mnie głowa, wzięłam ibuprom”* i zatwierdza wpis.
3. Dodaje wyniki krwi po każdej zmianie leku. Na osi czasu widać, że wyniki są złe po każdym leku, a jedyną stałą jest suplement.
4. Mówi: *„powiem lekarzowi, że po nowym leku kręci mi się w głowie”* → trafia na listę na wizytę.
5. Na wizycie lekarz pokazuje QR w przeglądarce, Anna go skanuje. Lekarz widzi oś czasu, wyniki badań, listę pytań i aktualne leki, w tym **suplement na równi z lekami z recepty**. Zauważa go od razu, bez przypadkowej rozmowy z rodziną.
6. Po wizycie Anna nagrywa notatkę: *„odstawić suplement, kontrola morfologii za dwa tygodnie”*. Aplikacja zapisuje odstawienie z powodem i ustawia przypomnienie.
7. Przed oddaniem krwi pyta głosem: *„jakie leki brałam w ostatnich dwóch miesiącach?”* i dostaje listę z datami, razem z suplementem.
8. Na wakacjach w Hiszpanii pokazuje lekarzowi podsumowanie po hiszpańsku, dostępne bez internetu.

## 5. Architektura

```
┌──────────────────────┐   szyfrogram   ┌───────────────────────┐   szyfrogram   ┌────────────────────────┐
│  PWA pacjenta        │ ─────────────► │  SERWER (przekaźnik)  │ ─────────────► │  Aplikacja lekarza     │
│  (telefon)           │   WebSocket    │  Node + ws            │   WebSocket    │  (webowa, przeglądarka)│
│  zaszyfrowana baza   │                │  nie ma klucza,       │                │  QR z kluczem publ.    │
│  lokalna, głos, OCR  │                │  nic nie zapisuje     │                │  dane tylko w pamięci  │
└──────────────────────┘                └───────────────────────┘                └────────────────────────┘
      klucz AES-GCM z ECDH (jednorazowe klucze) zna tylko telefon i przeglądarka lekarza
      kod weryfikacyjny (4 cyfry) na obu ekranach: ochrona przed podmianą klucza przez serwer
                     LLM (przez serwer): tylko tekst pytania / notatki, nigdy historia
```

**Przesył danych (szyfrowany przekaźnik, decyzja: zamiast WebRTC P2P)**
1. Aplikacja lekarza generuje **jednorazową** parę kluczy ECDH P-256 (WebCrypto, nieeksportowalny klucz prywatny) i tworzy sesję na serwerze → QR: `sessionId` + **klucz publiczny lekarza**.
2. Pacjent skanuje QR, generuje własną jednorazową parę kluczy ECDH i wylicza wspólny sekret → HKDF-SHA-256 → klucz **AES-256-GCM**. Sekret nigdy nie jest przesyłany.
3. Oba ekrany pokazują **kod weryfikacyjny** (4 cyfry z skrótu obu kluczy publicznych). Pacjent i lekarz sprawdzają, czy jest taki sam; jeśli serwer podstawiłby swój klucz, kody by się nie zgadzały.
4. Pacjent szyfruje snapshot wybranych danych (zdjęcia zmniejszone; w kawałkach, każdy z własnym losowym nonce) i wysyła przez WebSocket: swój klucz publiczny + szyfrogram.
5. Serwer przekazuje bajty do przeglądarki lekarza. **Nie ma klucza**, nic nie zapisuje; widzi tylko rozmiar i czas przesyłu.
6. Lekarz wylicza ten sam klucz i odszyfrowuje dane **tylko w pamięci karty**.
7. Koniec wizyty / timeout → serwer usuwa sesję, obie strony zapominają klucze, lekarz czyści pamięć.

Dlaczego nie WebRTC: bezpieczeństwo praktycznie to samo (w obu wariantach ufamy serwerowi, który serwuje kod aplikacji lekarza, a gdy P2P się nie zestawi, TURN i tak jest przekaźnikiem), a przekaźnik działa w każdej sieci i jest dużo prostszy (bez SDP, ICE, TURN). Na slajdzie: „serwer jest listonoszem z zaklejoną kopertą”; P2P jako możliwa optymalizacja w przyszłości.

**Hosting: własny (decyzja).** Jeden proces Node pod jedną domeną: serwuje statycznie `patient-pwa` i `doctor-app` oraz WebSocket i endpointy LLM (bez CORS, jedno miejsce na nagłówki). Wymagania: działa ciągle (WebSockety), HTTPS/WSS z prawdziwym certyfikatem (kamera i mikrofon w PWA), `Cache-Control: no-store` + ścisły CSP dla aplikacji lekarza, brak logowania treści i IP na endpointach LLM. Awaryjnie: serwer na laptopie + tunel.

**Aplikacja lekarza = aplikacja webowa (nie desktopowa).** Lekarz otwiera adres w zwykłej przeglądarce na komputerze w gabinecie: bez instalacji, bez konta, bez zgody informatyka przychodni.

**Bezpieczeństwo danych u lekarza**
- Dane pacjenta są **tylko w pamięci otwartej karty przeglądarki**: nie zapisujemy ich w `localStorage`, IndexedDB, ciasteczkach ani cache service workera, a aplikacja lekarza nie ma service workera.
- Serwer widzi tylko szyfrogram: dane są szyfrowane na telefonie pacjenta i odszyfrowywane dopiero w karcie lekarza.
- Dane znikają przy: „Zakończ wizytę”, zamknięciu lub odświeżeniu karty, wygaśnięciu sesji (timeout).
- Nagłówki: `Cache-Control: no-store`, ścisły Content-Security-Policy (brak zewnętrznych skryptów), żeby nic nie wyciekło przez cache ani obce skrypty.
- **Uczciwie, czego to nie chroni** (na pytanie jury): lekarz może zrobić zdjęcie ekranu albo wydrukować PDF, bo widzi dane z założenia; złośliwe rozszerzenie przeglądarki na komputerze lekarza może czytać stronę. To ten sam poziom zaufania co pokazanie lekarzowi papierowej teczki, tylko bez zostawiania kopii.

**Układ widoku lekarza** (ekran komputera, ≥ 1280 px; decyzja wstępna, do poprawek po zbudowaniu)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ eKsiazeczkaZdrowia · ● Połączono · kod 4821 · sesja wygasa za 14:32   [Drukuj] [Zakończ wizytę] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ Anna K., 58 lat, gr. krwi A Rh+   │ Alergie: [penicylina]   │ Choroby: białaczka (C92), … │
├────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ PACJENT CHCE POWIEDZIEĆ    │ OŚ CZASU                         [30 dni] [90 dni] [Całość] │
│ 1. Po nowym leku kręci mi  │ Na receptę    Lek A ████████│                               │
│    się w głowie            │               Lek B         ██████████│                     │
│ 2. …                       │               Lek C                   ███████████████▶      │
│                            │ Bez recepty   Ibuprom    ▪    ▪ ▪          ▪                │
│ PRZYJMOWANE TERAZ          │ Suplementy    Grzyby  ████████████████████████████████▶     │
│ Na receptę                 │ ──────────────────────────────────────────────────────────  │
│  • Lek C 100 mg 1×dz.      │ Badania       ◆ HGB 9,1↓     ◆ HGB 8,7↓       ◆ HGB 8,9↓    │
│    od 12.09 · 95% przyjęć  │ Objawy                 ● zawroty  ● zawroty ● ból głowy     │
│ Bez recepty                │ Wizyty        │ 02.08          │ 30.08                     │
│  • Ibuprom 200 mg doraźnie │ Zdjęcia                    [▫]                              │
│ Suplementy i zioła         ├─────────────────────────────────────────────────────────────┤
│  • Suplement z grzybów     │ [Badania] [Zdjęcia] [Wizyty] [Odstawione leki] [Dokumenty]  │
│    1×dz. · od 03.2026      │  tabela / galeria / lista wybranej zakładki                 │
└────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

- **Pasek górny:** status połączenia, kod weryfikacyjny, czas do wygaśnięcia sesji, „Drukuj”, „Zakończ wizytę” (czyści pamięć).
- **Nagłówek na całą szerokość:** imię, wiek, grupa krwi; **alergie** jako wyraźne etykiety (fakt, nie ostrzeżenie); aktywne choroby z ICD-10.
- **Lewa kolumna (stała, ok. 360 px, nie przewija się z resztą):**
  1. **„Pacjent chce powiedzieć”** na samej górze: agenda pacjenta, numerowana.
  2. **„Przyjmowane teraz”** w trzech grupach zawsze w tej kolejności i z tym samym wyglądem pozycji: *Na receptę*, *Bez recepty*, *Suplementy i zioła*. Pusta grupa pokazuje „brak” (lekarz wie, że pacjent został o to zapytany). Pozycja: nazwa, substancja czynna, dawka, schemat, od kiedy, % potwierdzonych przyjęć.
- **Prawa kolumna:**
  0. **„Od ostatniej wizyty”** (podsumowanie z T2.6b) jako zwarty pasek nad osią czasu: nowe / odstawione / zmienione leki, regularność, objawy z liczbą wystąpień, nowe badania (poza normą na początku), nowe zdjęcia. Kliknięcie pozycji podświetla ją na osi czasu.
  1. **Oś czasu** (`<Timeline>` od A): jeden tor na substancję, pogrupowany jak lista po lewej (te same kolory grup); pod spodem tory badań (wartość przy znaczniku, poza normą oznaczone ↑/↓ wg zakresu referencyjnego z wyniku), objawów, wizyt (pionowe linie) i zdjęć (miniatury). Domyślnie zakres obejmujący wszystkie aktualnie i ostatnio przyjmowane leki (min. 90 dni). Kliknięcie znacznika: szczegóły w dymku.
  2. **Zakładki pod osią:** Badania (tabela, poza normą pogrubione), Zdjęcia (galeria, porównanie dwóch obok siebie), Wizyty (notatki), Odstawione leki (z datą i powodem), Dokumenty.
- **Bez interpretacji:** żadnych ostrzeżeń, podświetlania „podejrzanych” związków ani sugestii. Układ ma pozwolić lekarzowi zobaczyć wzorzec samemu (suplement ciągnie się przez cały okres złych wyników).
- **Węższy ekran (< 1280 px) i druk / PDF:** jedna kolumna w kolejności: nagłówek → „Pacjent chce powiedzieć” → „Przyjmowane teraz” → oś czasu → zakładki rozwinięte jedna pod drugą.
- **Przed danymi:** ekran z QR, a po połączeniu ekran „Sprawdź kod z telefonu pacjenta: 4821” z przyciskiem „Kody się zgadzają” / „Nie zgadzają się”.

**Produkt docelowo = aplikacja mobilna. Na hackathon = PWA hostowana w sieci**, bo łatwiej ją pokazać i uruchomić na każdym telefonie bez instalacji ze sklepu.

**Platforma na demo: Chrome** (telefon pacjenta: Chrome na Androidzie, lekarz: Chrome na komputerze). Zasada: **aplikacja ma działać i wyglądać jak najbardziej jednolicie** na każdym urządzeniu i w każdej przeglądarce. Każda funkcja zależna od platformy ma tę samą ścieżkę podstawową wszędzie (np. import z IKP przez wybór pliku), a funkcje tylko z Chrome / Androida (Web Share Target, passkey z PRF) są wyłącznie dodatkiem. **Interfejs po polsku**, inne języki tylko w podsumowaniu „Za granicą”.

**Przechowywanie i szyfrowanie: docelowo (mobilna) vs. w PWA na hackathon**

Spec opisuje zabezpieczenia aplikacji mobilnej. Część z nich nie istnieje w przeglądarce, więc w demo robimy odpowiedniki, a resztę pokazujemy na slajdzie jako wersję docelową.

| Wymaganie (docelowo) | W PWA na hackathon |
|---|---|
| Baza szyfrowana AES-256 (SQLCipher) | IndexedDB (Dexie), rekordy szyfrowane **AES-256-GCM** (WebCrypto) |
| Klucz chroniony sprzętowo (Keystore / Keychain) | Klucz bazy wyprowadzony z **PIN-u** (Argon2id → AES-256-GCM), trzymany **tylko w pamięci** po odblokowaniu, nigdy nie zapisywany |
| Zdjęcia i nagrania jako osobno szyfrowane pliki | Bloby szyfrowane osobno AES-GCM |
| Nagrania usuwane po rozpoznaniu tekstu | ✅ wprost |
| Blokada biometrią | PIN przy otwarciu (to on odblokowuje klucz); biometria przez passkey z rozszerzeniem PRF tylko jako opcja C |
| Brak danych medycznych w powiadomieniach | ✅ wprost („Czas na lek”) |
| Zaplanowane lokalne powiadomienia (przypomnienia o lekach) | ❌ PWA nie zaplanuje powiadomienia bez serwera → na demo powiadomienie wywołane przyciskiem; docelowo lokalne powiadomienia w aplikacji mobilnej, bez serwera |
| Brak podglądu w przełączniku, blokada zrzutów ekranu | ❌ niemożliwe w przeglądarce → slajd / wersja mobilna |
| Wyłączony systemowy backup | nie dotyczy PWA → slajd |

Droga do aplikacji mobilnej (roadmapa na slajd): ta sama aplikacja opakowana np. w Capacitor (SQLCipher, Keystore/Keychain, `FLAG_SECURE`), więc kod z hackathonu nie idzie do kosza.

**Kopia zapasowa i nowy telefon**
- Eksport do jednego pliku (baza + zdjęcia), szyfrowanego kluczem z hasła pacjenta (**Argon2id** → AES-256-GCM). Pacjent sam decyduje, gdzie go zapisze.
- Import na nowym telefonie: plik + hasło → dane zapisane w bazie zaszyfrowanej nowym kluczem urządzenia. Działa między Androidem a iOS.
- Przypomnienie o eksporcie (np. raz w miesiącu).
- **Brak „zapomniałem hasła”**: wyraźna informacja przy pierwszym eksporcie.

**Stack (wszędzie TypeScript)**
- `patient-pwa/`: React + Vite + `vite-plugin-pwa`, Dexie, WebCrypto, `html5-qrcode`, Web Speech API (`pl-PL`), MediaRecorder, Tesseract.js (OCR, `pol`), Web Share Target (import z IKP), `hash-wasm` (Argon2id).
- `doctor-app/`: aplikacja webowa (React + Vite), `qrcode`, druk do PDF; bez service workera i bez trwałego zapisu.
- `server/`: Node + `ws` (przekaźnik szyfrogramu) + endpointy LLM (pytanie → filtr, notatka → zmiany). **Dostawca LLM do ustalenia później:** serwer woła model przez interfejs `LlmClient` pod adresem z konfiguracji (`LLM_HOST`, `LLM_PORT`, opcjonalnie `LLM_API_KEY` w zmiennych środowiskowych); bez konfiguracji działa atrapa (gotowe odpowiedzi dla scenariuszy z happy path). Endpointy LLM są **anonimowe**: w żądaniu tylko tekst (bez imienia, profilu, identyfikatora urządzenia ani sesji), serwer nie loguje treści ani IP.
- `shared/`: typy, protokół, transport, krypto, słowniki (i18n, ICD-10, ATC).
- `data/`: skrypt przetwarzający Rejestr Produktów Leczniczych do kompaktowego JSON.
- Krypto przesyłu: WebCrypto (ECDH P-256 + HKDF-SHA-256 + AES-256-GCM), bez zewnętrznych bibliotek.

## 6. Model danych (do ustalenia na starcie, T0.3)

```ts
Profile       { id, name, birthDate, bloodType?, allergies[], language, exportReminderAt? }
Drug          { rplId, name, activeSubstance, strength, form, atcCode, leafletUrl? }   // z RPL, tylko do odczytu
Medication    { id, rplId?, name, activeSubstance?, atcCode?, dose, unit, schedule, otc: boolean,
                startDate, endDate?, stopReason?, source: 'manual'|'voice'|'ikp'|'visit' }
Intake        { id, medicationId, scheduledAt, status: 'taken'|'skipped', confirmedAt }
Symptom       { id, name, severity?: 1-5, startedAt, endedAt?, notes?, source: 'manual'|'voice' }
Diagnosis     { id, name, icd10?, diagnosedAt, active: boolean, source: 'manual'|'ikp' }
Exam          { id, name, date, results: { name, value, unit, refLow?, refHigh? }[], ocrText?, documentId? }
Document      { id, title, date, fileBlob(enc), mime, ocrText?, source: 'ikp'|'photo' }
Photo         { id, blob(enc), takenAt, category: 'skin'|'wound'|'swelling'|'other', seriesId?, note? }
PhotoSeries   { id, name, bodyPart?, createdAt }
VisitNoteItem { id, text, createdAt, source: 'manual'|'voice', discussed: boolean, visitId? }  // „powiem lekarzowi”
Visit         { id, date, doctor?, specialty?, transcript, followUpDate?, appliedChanges[] }   // audio usuwane po transkrypcji
Reminder      { id, type: 'medication'|'followUp'|'export', at, medicationId?, visitId? }
VisitSummary  { since, medsStarted[], medsStopped[], medsChanged[], adherence: { taken, skipped }, symptoms: { name, count, maxSeverity, firstAt, afterNewMed? }[], newExams[], newPhotos[], visitNoteItems[] }
ShareSnapshot { summary: VisitSummary, profile, medications, intakes, symptoms, diagnoses, exams, photos(miniatury), visitNoteItems, visits, range }
QueryFilter   { entity: 'medication'|'symptom'|'exam', atcPrefix?, name?, from?, to?, sort?, limit? }  // wynik LLM
```

---

## 7. Zadania (2 osoby równolegle, podział po funkcjach)

Każdy robi swoje funkcje **od początku do końca**: ekran + technika pod spodem. Obaj mamy ekrany do pokazania na demo i obaj mamy trudniejsze technicznie kawałki.

### Podział

| | **Osoba A: „Dane i codzienność”** | **Osoba B: „Wizyta i bezpieczeństwo”** |
|---|---|---|
| Ekrany PWA | Profil i diagnozy, leki, potwierdzanie leków, objawy, badania, zdjęcia w czasie, **oś czasu**, przypomnienia, **Zapytaj**, import z IKP | Lista „powiem lekarzowi”, **Podsumowanie na wizytę**, **Udostępnij lekarzowi**, **Po wizycie**, **Za granicą**, blokada aplikacji, kopia zapasowa |
| Technika | Rozpoznawanie mowy + rozbijanie wpisów, baza leków z RPL, OCR, import PDF, LLM: pytanie → filtr | Baza lokalna + szyfrowanie, serwer-przekaźnik, szyfrowanie przesyłu (ECDH + AES-GCM) z kodem weryfikacyjnym, **aplikacja lekarza**, LLM: notatka → zmiany, słowniki ATC/ICD-10, eksport/import z hasłem |
| Happy path (sekcja 4) | kroki 1, 2, 3, 7 | kroki 4, 5, 6, 8 |

### Własność folderów

Aktualna tabela i zasady (bez folderów „wspólnych”): **`CLAUDE.md`**. W skrócie: `app/`, `ui/` i pliki root należą do A; `shared/types.ts`, `shared/contracts.ts`, `shared/demo-data.ts` do B. Zmiana w cudzym pliku = issue `[prośba] ...` z etykietą właściciela. Routing przez `features/*/route.tsx` + `import.meta.glob`, więc nowy ekran nie wymaga zmiany w `app/`.

### Gdzie się stykamy (kontrakty z T0.3)

| Kto daje | Co | Kto używa | Atrapa do czasu oddania |
|---|---|---|---|
| A | `<VoiceInput mode>` | B: lista „powiem lekarzowi”, Po wizycie | zwykłe pole tekstowe |
| A | `<DrugPicker>`, `searchDrugs` | B: Po wizycie (nowy lek) | 10 leków na sztywno |
| A | `createReminder()` | B: kontrola z notatki po wizycie, przypomnienie o eksporcie | `console.log` |
| A | `<Timeline data>` | B: widok lekarza (ten sam komponent albo jego kopia) | lista dat |
| B | `db` (Dexie, potem szyfrowanie bez zmiany API) | A: wszystkie ekrany | **B oddaje w Fazie 0** |
| B | `getActiveVisitList()` | A: nic / B: auto-pokazanie przed wizytą | — |

Priorytet: **M** = must (jest w happy path) · **S** = should (wyróżnik) · **C** = could (jeśli zostanie czas).

---

### Faza 0: Start (razem)

- [ ] **T0.1** (A+B, M) Przeczytać treść zadania od organizatorów, porównać z tym planem.
- [ ] **T0.2** (A, M) Monorepo: `patient-pwa/`, `doctor-app/`, `server/`, `shared/`, `data/`; workspaces, prettier. **Push jak najszybciej.**
- [ ] **T0.3** (A+B, M) **Kontrakt (potem zamrożony):** `shared/types.ts` (sekcja 6), protokół, sygnatury z tabeli „Gdzie się stykamy” oraz:
  - transport: `createSession() → { sessionId, qrPayload }`, `connect(qrPayload)`, `sendSnapshot(snapshot)`, `onSnapshot(cb)`
  - głos: `parseEntry(text) → { symptoms[], medications[] }`
  - pytania: `askHistory(question) → QueryFilter`, `runFilter(filter, db)`
  - notatka: `parseVisitNote(text) → { stopMeds[], newMeds[], followUpDate? }`
- [ ] **T0.4** (A+B, M) **Szkielet aplikacji pacjenta:** nawigacja (Oś czasu / Dodaj / Wizyta / Zapytaj / Profil), kolory, typografia, wspólne komponenty w `ui/` (przycisk, karta, lista, arkusz od dołu, duży przycisk mikrofonu). Puste ekrany z podpisem właściciela. Po tym każdy pracuje już tylko w swoich `features/`.
- [ ] **T0.5** (B, M) `db/`: Dexie ze schematem z sekcji 6 (na razie bez szyfrowania) + `loadDemoData()` → push.
- [ ] **T0.6** (B, M) `shared/demo-data.ts`: profil **Pani Anna** zgodny z happy path: nowotwór krwi wśród diagnoz; **suplement z grzybów przyjmowany codziennie przez cały okres** (dokładna nazwa i wyniki krwi: dostarczymy później; do tego czasu ogólnie, bez sugerowania mechanizmu); 2–3 kolejne leki z datami start–koniec i powodem zmiany; **morfologia po każdej zmianie leku ze złymi wynikami**; OTC (ibuprom); ~3 tygodnie potwierdzeń i objawów (zawroty po nowym leku); 1 wcześniejsza wizyta; lek przeciwzakrzepowy w przeszłości; zdjęcia (opcjonalnie); 1–2 przykładowe PDF-y „z IKP”.
- [ ] **T0.7** (A, M) `README.md` (uruchomienie) + `CLAUDE.md` (zasady + tabele własności z tej sekcji).
- [ ] **T0.8** (B, M) HTTPS od początku (tunel dla telefonu); postawić własny host (proces ciągły + WSS + certyfikat), deploy jednym poleceniem.

---

### Faza 1: Rdzeń

**A: dane**
- [ ] **T1.1** (M) Profil: alergie, grupa krwi, **diagnozy** aktualne / przebyte.
- [ ] **T1.2** (M) `data/` + `features/drugs/`: skrypt RPL (dane otwarte) → kompaktowy `drugs.json` (nazwa, substancja, moc, postać, ATC, link do ulotki); `searchDrugs` + `<DrugPicker>`.
- [ ] **T1.3** (M) Leki: lista (recepta / OTC / suplement), dodawanie przez `<DrugPicker>`, harmonogram, od–do; przy odstawieniu lub zmianie **pytanie o powód**. Po dodaniu leków pytanie *„czy bierzesz coś jeszcze? suplementy, witaminy, zioła”* (suplementów może nie być w RPL, więc wpis wolnym tekstem).
- [ ] **T1.4** (M) Potwierdzanie leków: lista na dziś, „wziąłem / pominąłem” jednym dotknięciem.
- [ ] **T1.5** (M) Objawy: szybkie dodawanie (nazwa, nasilenie opcjonalnie, czas).
- [ ] **T1.6** (M) Badania: dodawanie ręczne (nazwa, data, wyniki), wartości poza normą wyróżnione; widoczne na osi czasu obok zmian leków (kluczowe dla kroku 3).

**B: połączenie z lekarzem**
- [ ] **T1.7** (M) Serwer `ws`: `create-session`, `join-session`, przekazywanie wiadomości (klucz publiczny pacjenta, kawałki szyfrogramu, „koniec”) między dwiema stronami sesji, wygasanie sesji, limit rozmiaru, nic nie zapisuje na dysku ani w logach.
- [ ] **T1.8** (M) `shared/transport/` + `shared/crypto/`: ECDH → HKDF → AES-256-GCM, snapshot w zaszyfrowanych kawałkach (losowy nonce na kawałek) z potwierdzeniem, ponowne połączenie WebSocketu.
- [ ] **T1.9** (M) Aplikacja webowa lekarza: ekran z QR (odświeżany po wygaśnięciu), status połączenia.
- [ ] **T1.10** (M) Strona dev „symulator pacjenta” + test end-to-end na danych demo w dwóch kartach.
- [ ] **T1.11** (M) Lista **„powiem lekarzowi”**: pływający przycisk z każdego ekranu, dodawanie tekstem (głos po oddaniu `VoiceInput` przez A), odhaczanie „omówione”.
- [ ] **T1.12** (S) **Kod weryfikacyjny:** 4 cyfry ze skrótu SHA-256 obu kluczy publicznych, pokazane na telefonie i u lekarza; przycisk „kody się nie zgadzają” przerywa sesję.

**🔁 Synchronizacja po Fazie 1:** merge do `main`. A: leki, objawy i badania działają na danych demo. B: transport działa między kartami, lista „powiem lekarzowi” gotowa.

---

### Faza 2: Happy path

**A: głos, oś czasu, pytania**
- [ ] **T2.1** (M) `features/voice/`: `VoiceInput` (zawsze z polem tekstowym obok mikrofonu) + interfejs `SpeechEngine { isAvailable(), start(lang), stop(), onPartial(cb), onFinal(cb), onError(cb) }`; jedyna implementacja na hackathon: `webSpeechEngine.ts` (Web Speech API `pl-PL`), wybór silnika w jednym miejscu (`engines/index.ts`); `VoiceInput` nie importuje nic z Web Speech bezpośrednio. Jednorazowa informacja przy pierwszym użyciu mikrofonu (O1) + `parseEntry` (lokalnie: słownik objawów + `searchDrugs`, „od rana”, „wieczorem”, „wzięłam”) → propozycja wpisów do zatwierdzenia jednym dotknięciem. **Oddać B jak najwcześniej.**
- [ ] **T2.2** (M) **Oś czasu:** leki jako paski (start–koniec, z powodem odstawienia), potwierdzenia, objawy, zdjęcia (miniatury), badania, wizyty, dokumenty; filtr 7/30/90 dni. Związek „nowy lek → objaw” widoczny na pierwszy rzut oka. Komponent wielokrotnego użytku (B użyje go u lekarza).
- [ ] **T2.3** (M) **Zdjęcia w czasie:** aparat lub galeria, kategoria (skóra / rana / obrzęk), seria, porównanie dwóch zdjęć obok siebie, miniatury na osi czasu.
- [ ] **T2.4** (M) **Zapytaj:** mikrofon + 3 szybkie przyciski (scenariusze z happy path) → `server/src/llm/query.ts`: **tylko tekst pytania** → `QueryFilter` (np. „przeciwzakrzepowe” → `atcPrefix: B01`) → `runFilter` lokalnie → lista z datami. Fallback bez sieci: 3 gotowe filtry.
- [ ] **T2.5** (M) **Przypomnienia:** o lekach („Czas na lek”, bez nazwy leku), z powiadomienia prosto do potwierdzenia; `createReminder()` dla B. **W PWA na demo:** bez Web Push i bez serwera; przypomnienia, których czas minął, widoczne po otwarciu aplikacji jako „Do potwierdzenia”, plus przycisk demo, który od razu pokazuje lokalne powiadomienie „Czas na lek”. Docelowo (mobilka): zaplanowane lokalne powiadomienia.

**B: wizyta i za granicą**
- [ ] **T2.6** (M) **Udostępnij lekarzowi** (ekran pacjenta): wybór zakresu → skan QR → `connect` + `sendSnapshot`; zmniejszanie zdjęć; status „przesłano”.
- [ ] **T2.6b** (M) **Podsumowanie na wizytę:** funkcja `buildVisitSummary(db, od) → VisitSummary`, liczona **lokalnie, bez LLM**, domyślnie od ostatniej wizyty:
  - leki: nowe, odstawione (z powodem), zmienione; regularność przyjmowania (np. „8 pominięć z 30”),
  - objawy: lista z liczbą wystąpień, najwyższym nasileniem i datą pierwszego wystąpienia; zaznaczenie objawów, które zaczęły się w ciągu ~14 dni po starcie nowego leku (bez wniosków, tylko zestawienie dat),
  - nowe badania (z wynikami poza zakresem referencyjnym na górze), nowe zdjęcia, lista „powiem lekarzowi”.
  Pacjent widzi podsumowanie przed wysłaniem i może odznaczyć sekcje. Podsumowanie jedzie w `ShareSnapshot` i jest **pierwszym ekranem u lekarza** (T2.7). Typ `VisitSummary` dopisać do `shared/types.ts` (uzgodnić z A).
- [ ] **T2.7** (M) **Widok lekarza** wg „Układ widoku lekarza” (sekcja 5): pasek górny, nagłówek, lewa kolumna („Pacjent chce powiedzieć” + „Przyjmowane teraz” w trzech grupach na równi), prawa kolumna (pasek „Od ostatniej wizyty” z podsumowania T2.6b + oś czasu z `<Timeline>` od A + zakładki). Czytelny w 30 s. Koniec sesji: przycisk + timeout, czyszczenie pamięci. Dane **tylko w pamięci karty** (bez `localStorage` / IndexedDB / cache), nagłówki `no-store` + CSP.
- [ ] **T2.8** (M) **Po wizycie:** `VoiceInput mode="postVisit"` → endpoint `POST /llm/visit-note` → `{ stopMeds[], newMeds[], followUpDate? }` → lista zmian z checkboxami → zatwierdź → leki zaktualizowane (z powodem), `createReminder` na kontrolę, nagranie usunięte.
- [ ] **T2.9** (M) Lista „powiem lekarzowi” **pokazuje się automatycznie przed wizytą** (gdy zbliża się data kontroli).
- [ ] **T2.10** (M) **Za granicą:** podsumowanie **offline** (alergie, aktualne leki przez substancję czynną + ATC, choroby + ICD-10) w EN/DE/ES; słowniki w `shared/dict/`; widok na ekranie + PDF.
- [ ] **T2.11** (S) Druk / PDF widoku lekarza.

**🔁 Synchronizacja po Fazie 2:** merge, **pełny happy path na telefonie**. Lista poprawek, decyzja, które S/C robimy.

---

### Faza 3: Wyróżniki i bezpieczeństwo

**A: import i informacje o lekach**
- [ ] **T3.1** (S) `features/ikp-import/`: wybór pliku jako ścieżka podstawowa (działa wszędzie) + Web Share Target jako dodatek w Chrome na Androidzie (PWA odbiera PDF z menu „Udostępnij”) → `Document` → tekst z PDF (pdf.js) → propozycje leków / diagnoz / badań do zatwierdzenia.
- [ ] **T3.2** (S) `features/ocr/`: zdjęcie wyniku → Tesseract.js (`pol`) na urządzeniu → tekst + próba wyciągnięcia wyników (nazwa, wartość, jednostka) → formularz badania do zatwierdzenia.
- [ ] **T3.3** (S) `<DrugInfoCard>`: substancja czynna, dawkowanie, informacje z ulotki (w tym przeciwwskazania) **jako fakty, bez ostrzeżeń**; link do pełnej ulotki.
- ~~**T3.4** Akcent „Sport”~~: decyzja, nie robimy nic sportowego (ani w aplikacji, ani w pitchu).
- [ ] **T3.5** (C) `parseEntry` przez LLM jako fallback dla dłuższych zdań (z jasną informacją, że tekst wpisu idzie do modelu).

**B: szyfrowanie i kopia zapasowa**
- [ ] **T3.6** (M) **Szyfrowanie bazy:** każdy rekord i blob AES-256-GCM (WebCrypto); klucz z PIN-u (Argon2id, ta sama funkcja co w T3.8) trzymany tylko w pamięci; **bez zmiany API `db`**, więc ekrany A działają dalej.
- [ ] **T3.7** (M) **Blokada aplikacji:** PIN przy otwarciu i po powrocie do aplikacji po kilku minutach (odblokowuje klucz z T3.6; po zablokowaniu klucz usuwany z pamięci). (C) Biometria przez passkey z PRF, gdy działa na telefonie demo; PIN zawsze jako zapas.
- [ ] **T3.8** (S) **Eksport:** hasło → Argon2id → AES-256-GCM całości (baza + zdjęcia) → jeden plik; wyraźny komunikat przy pierwszym eksporcie: brak odzyskiwania hasła.
- [ ] **T3.9** (S) **Import:** plik + hasło → odszyfrowanie → zapis z nowym kluczem urządzenia; przypomnienie o eksporcie raz w miesiącu.
- [ ] **T3.10** (S) Test przesyłu w różnych sieciach (telefon na danych komórkowych, laptop na Wi-Fi hackathonu) + duży snapshot ze zdjęciami.

**🔁 Synchronizacja po Fazie 3:** feature freeze. Od teraz tylko poprawki i prezentacja.

---

### Faza 4: Szlif i oddanie

- [ ] **T4.1** (A+B, M) Design: każdy dopieszcza swoje ekrany; wspólnie pilnujemy spójności (`ui/`).
- [ ] **T4.2** (B, M) Deploy + test na **prawdziwym telefonie i w sieci hackathonu**.
- [ ] **T4.3** (A+B, M) Przejść happy path kilka razy bez błędów; nagrać **wideo demo** jako zabezpieczenie.
- [ ] **T4.4** (A, M) Slajdy (max 10): przypadek pacjentki z nowotworem krwi i suplementem → problem → Pani Anna → rozwiązanie (zbieranie / codzienność / wizyta / pytania / za granicą) → demo (zrzuty) → prywatność i szyfrowanie (local-first, przesył end-to-end przez „listonosza z zaklejoną kopertą”, kod weryfikacyjny, kopia z hasłem) → vs mojeIKP i Bearable → aplikacja mobilna i rozwój (Capacitor, integracja z IKP, MyHealth@EU) → zespół.
- [ ] **T4.5** (B, M) Opis projektu + README z linkami (repo, demo, wideo) + **opisany happy path** (sekcja 4).
- [ ] **T4.6** (A+B, M) **Wysłać na HackTribe przed deadlinem** (z zapasem).
- [ ] **T4.7** (A+B, S) Pitch i odpowiedzi na trudne pytania (poniżej). Każdy pokazuje swoją część happy path.

---

## 8. Ryzyka i odpowiedzi

| Ryzyko | Co robimy |
|---|---|
| Web Speech API wysyła dźwięk do Google | Mówimy wprost + jednorazowa informacja; silnik za interfejsem `SpeechEngine`, w wersji mobilnej rozpoznawanie na urządzeniu (O1) |
| Zabezpieczenia mobilne (SQLCipher, Keystore, blokada zrzutów) niemożliwe w PWA | PWA to forma na hackathon; odpowiedniki w PWA (sekcja 5), na slajdzie wersja mobilna |
| Przesył nie działa w sieci hackathonu / komórkowej | Przekaźnik przez WebSocket (działa wszędzie, gdzie strona) + wideo demo |
| Własny host pada w trakcie demo | Awaryjnie laptop + tunel, sprawdzone wcześniej; wideo demo |
| Brak HTTPS → nie działa kamera ani mikrofon | HTTPS/tunel od początku (T0.8) |
| Funkcje działające tylko w części przeglądarek (Web Share Target, PRF, Web Speech) | Demo w Chrome; wszędzie ta sama ścieżka podstawowa (wybór pliku, PIN, pole tekstowe), funkcje zależne od platformy tylko jako dodatek |
| RPL jest duży | Skrypt w `data/` → kompaktowy JSON tylko z potrzebnymi polami |
| Błąd tłumaczenia leku lub dawki | Tłumaczenie przez substancję czynną + kody ATC / ICD-10, a nie wolny tekst |
| LLM a prywatność | Hasło złagodzone (sekcja 2): historia nigdy nie opuszcza telefonu. Do modelu idzie tylko pojedyncze pytanie / notatka, **anonimowo** (bez imienia, profilu, historii i identyfikatorów; serwer nie loguje treści ani IP); filtr wykonywany lokalnie. Przy pierwszym użyciu jednorazowa informacja: „to zdanie zostanie wysłane do modelu językowego” |
| „Czym różnicie się od IKP?” | Sekcja 2: oficjalne vs. faktyczne + objawy + głos + widok dla lekarza |
| „Czy to wyrób medyczny?” | Nie: zapisujemy i porządkujemy; informacje o lekach to fakty z ulotki, **bez automatycznych ostrzeżeń** |
| Nagrywanie lekarza | Notatka to pacjent mówiący po wizycie, nagranie usuwane po transkrypcji |
| Dane pacjenta na komputerze lekarza | Aplikacja webowa trzyma je tylko w pamięci karty, kasuje po wizycie; nie chroni przed zrzutem ekranu (lekarz i tak widzi dane z założenia) |
| Utrata telefonu | Zaszyfrowana kopia z hasłem + przypomnienia o eksporcie |

## 9. Do rozkminienia

- [x] **O1. Rozpoznawanie mowy a prywatność → decyzja: Web Speech API, łatwy do podmiany.**
  - Na hackathon Web Speech API (`pl-PL`). Mówimy wprost: nagranie idzie do usługi Google; przy pierwszym użyciu mikrofonu jednorazowa informacja o tym.
  - Pole tekstowe zawsze dostępne jako alternatywa (głos to dodatek, każda funkcja głosowa działa też bez głosu).
  - Silnik za interfejsem `SpeechEngine` (patrz T2.1), więc podmiana to jeden plik: w wersji mobilnej systemowe rozpoznawanie na urządzeniu (Android / iOS on-device), ewentualnie Whisper w przeglądarce.
- [ ] **O2. Do dopracowania po zbudowaniu aplikacji** (najpierw aplikacja, potem dokładny happy path):
  - dokładny przebieg happy path i które kroki pokazujemy na żywo,
  - ewentualne poprawki układu widoku lekarza (wersja wstępna w sekcji 5),
  - dane przypadku: nazwa suplementu z grzybów i które wyniki krwi były złe (T0.6),
  - dostawca LLM i adres (`LLM_HOST` / `LLM_PORT`),
  - język pitchu i slajdów.

## 10. Zasady pracy

Pracują dwa agenty Claude Code (A u jednej osoby, B u drugiej). Pełny workflow: **`CLAUDE.md`** + skill **`/next-task`**.

- Każdy task to **issue na GitHubie** (`[A07] ...`, etykiety `agent-a|agent-b`, `prio-*`, `faza-*`); taski są atomowe i dotykają tylko folderów jednego agenta.
- Gałąź na task (`a/A07-...`, `b/B12-...`) → PR z `Closes #N` → rebase na `main` + build → squash merge przez agenta.
- Po każdym merge agent dopisuje linię do **swojego** `progress/agent-a.md` / `progress/agent-b.md` (lista zrobionych tasków, zero konfliktów).
- Każdy edytuje tylko swoje foldery; potrzeba zmiany u drugiego = issue `[prośba] ...`, a do tego czasu atrapa zgodna z kontraktem.
- `main` zawsze się buduje. Jeśli „M” nie jest gotowe, porzucamy „S/C”.
- Etykieta `human`: zadania dla ludzi (treść zadania, dane przypadku, LLM, hosting, wideo, wysyłka).
