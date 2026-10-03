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

**Rozwiązanie w jednym zdaniu:** prywatna oś czasu zdrowia na telefonie pacjenta, uzupełniana głosem, którą w kilka sekund można bezpiecznie pokazać dowolnemu lekarzowi, także za granicą.

## 2. Czym się wyróżniamy

- **mojeIKP** wie, co lekarz przepisał. **My** wiemy, co pacjent faktycznie bierze, plus objawy, zdjęcia, notatki z wizyt i leki bez recepty, na jednej osi czasu.
- **Bearable** to dziennik objawów do samoobserwacji. **My** łączymy dane własne z oficjalnymi dokumentami i projektujemy widok dla lekarza.
- **Głos jako główny sposób obsługi:** wprowadzanie danych i zadawanie pytań o przeszłość.
- **Local-first:** dane tylko na telefonie, zaszyfrowane. Żaden serwer nie przechowuje ani nie widzi danych medycznych.

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
| **Dane tylko na telefonie, transfer P2P szyfrowany** | ❌ | ❌ (chmura) | ✅ |
| **Podsumowanie offline w języku lekarza (ATC, ICD-10)** | częściowo (MyHealth@EU) | ❌ | ✅ |

## 3. Funkcje

**Zbieranie danych**
- Wpis głosowy: *„od rana boli mnie głowa, wzięłam ibuprom”* → rozpoznany objaw + lek → zatwierdzenie jednym dotknięciem.
- Baza leków z **Rejestru Produktów Leczniczych** (dane otwarte): podpowiadanie nazw, substancje czynne, dawki, kod ATC, link do ulotki.
- **Import dokumentów z IKP:** pacjent pobiera dokument i udostępnia go aplikacji przez systemowe menu „Udostępnij”.
- **Zdjęcie wyniku badania** z rozpoznawaniem tekstu na urządzeniu.
- **Zdjęcia w czasie:** zrobione w aplikacji albo dodane z galerii.

**Codzienność**
- Przypomnienia o lekach z potwierdzeniem „wziąłem / pominąłem”.
- Przy odstawieniu lub zmianie leku pytanie o powód („mdłości”, „nie pomagało”).

**Wizyta u lekarza**
- **Lista na wizytę:** w dowolnej chwili *„powiem lekarzowi, że…”*; przed wizytą lista wyświetla się automatycznie.
- **Widok dla lekarza:** oś czasu, lista pytań i zdjęcia w przeglądarce lekarza (P2P).
- **Notatka głosowa po wizycie:** *„lekarz zmienił lek na X, kontrola za miesiąc”* → propozycja zmian w lekach i przypomnienia o kontroli do zatwierdzenia.

**Pytania o przeszłość** (model językowy zamienia pytanie na filtr; odpowiedź pochodzi z lokalnej bazy; model **nie dostaje historii**)
- *„Jakie leki brałam w ostatnich 2 miesiącach?”* (oddawanie krwi)
- *„Kiedy ostatnio brałam leki przeciwzakrzepowe?”* (przed zabiegiem; kategoria przez kod ATC B01)
- *„Od kiedy mam te bóle głowy?”* (nowy lekarz)

**Za granicą**
- Podsumowanie **offline** w języku lekarza: alergie, aktualne leki, choroby, z kodami **ATC** i **ICD-10**. Leki tłumaczone przez substancję czynną. Na ekranie albo jako PDF.

## 4. Happy path (scenariusz demo)

1. **Pani Anna** instaluje aplikację, importuje dokumenty z IKP i dodaje leki z apteczki.
2. Codziennie potwierdza leki jednym dotknięciem. Wieczorem mówi: *„od rana boli mnie głowa, wzięłam ibuprom”* i zatwierdza wpis.
3. Mówi: *„powiem lekarzowi, że po nowym leku kręci mi się w głowie”* → trafia na listę na wizytę.
4. Robi zdjęcie wysypki, które pojawia się na osi czasu obok nowego leku.
5. Na wizycie lekarz pokazuje QR w przeglądarce, Anna go skanuje. Lekarz widzi oś czasu, listę pytań i zdjęcia, i zauważa związek czasowy między lekiem a objawami.
6. Po wizycie Anna nagrywa notatkę: *„zmiana leku na X, kontrola za miesiąc”*. Aplikacja aktualizuje leki i ustawia przypomnienie.
7. Przed oddaniem krwi pyta głosem: *„jakie leki brałam w ostatnich dwóch miesiącach?”* i dostaje listę z datami.
8. Na wakacjach w Hiszpanii pokazuje lekarzowi podsumowanie po hiszpańsku, dostępne bez internetu.

## 5. Architektura

```
┌──────────────────────┐   sygnalizacja: tylko „kto z kim”     ┌────────────────────────┐
│  PWA pacjenta        │ ◄────────────►  SERWER  ◄───────────► │  Aplikacja lekarza     │
│  (telefon)           │   (Node + WebSocket, nic nie zapisuje) │  (przeglądarka)        │
│  zaszyfrowana baza   │                                        │  QR z kluczem publ.    │
│  lokalna, głos, OCR  │                                        │  dane tylko w pamięci  │
└──────────┬───────────┘                                        └──────────▲─────────────┘
           │   WebRTC DataChannel P2P (DTLS), oferty podpisane kluczami z QR │
           │   gdy P2P się nie uda: TURN (widzi tylko zaszyfrowane dane)     │
           └─────────────────────────────────────────────────────────────────┘
                     LLM (przez serwer): tylko tekst pytania / notatki, nigdy historia
```

**Przesył danych (P2P przez WebRTC)**
1. Aplikacja lekarza generuje parę kluczy (ECDSA P-256, WebCrypto) i tworzy sesję na serwerze → QR: `sessionId` + **klucz publiczny lekarza**.
2. Pacjent skanuje QR, generuje własną parę kluczy, wysyła ofertę SDP **podpisaną** swoim kluczem (+ swój klucz publiczny).
3. Lekarz odpowiada odpowiedzią SDP **podpisaną** swoim kluczem; pacjent weryfikuje podpis kluczem z QR.
4. SDP zawiera odcisk certyfikatu DTLS, więc podpis wiąże szyfrowany kanał z kluczami z parowania: serwer nie może ani podsłuchać, ani podszyć się pod żadną stronę.
5. Otwiera się DataChannel → pacjent wysyła snapshot wybranych danych (w kawałkach, zdjęcia zmniejszone).
6. Gdy bezpośrednie połączenie się nie uda (np. sieć komórkowa): **TURN** przekazuje ruch, widzi tylko zaszyfrowane dane.
7. Koniec wizyty / timeout → serwer usuwa sesję, lekarz czyści pamięć.

**Hosting:** do ustalenia. Serwer musi działać ciągle (WebSockety) i mieć HTTPS/WSS (kamera i mikrofon w PWA). Awaryjnie: serwer na laptopie + tunel.

**Produkt docelowo = aplikacja mobilna. Na hackathon = PWA hostowana w sieci**, bo łatwiej ją pokazać i uruchomić na każdym telefonie bez instalacji ze sklepu.

**Przechowywanie i szyfrowanie: docelowo (mobilna) vs. w PWA na hackathon**

Spec opisuje zabezpieczenia aplikacji mobilnej. Część z nich nie istnieje w przeglądarce, więc w demo robimy odpowiedniki, a resztę pokazujemy na slajdzie jako wersję docelową.

| Wymaganie (docelowo) | W PWA na hackathon |
|---|---|
| Baza szyfrowana AES-256 (SQLCipher) | IndexedDB (Dexie), rekordy szyfrowane **AES-256-GCM** (WebCrypto) |
| Klucz chroniony sprzętowo (Keystore / Keychain) | Klucz `CryptoKey` nieeksportowalny; odblokowanie przez **passkey (WebAuthn)** lub PIN |
| Zdjęcia i nagrania jako osobno szyfrowane pliki | Bloby szyfrowane osobno AES-GCM |
| Nagrania usuwane po rozpoznaniu tekstu | ✅ wprost |
| Blokada biometrią | WebAuthn (odcisk / twarz przez system) |
| Brak danych medycznych w powiadomieniach | ✅ wprost („Czas na lek”) |
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
- `doctor-app/`: React + Vite, `qrcode`, druk do PDF.
- `server/`: Node + `ws` (sygnalizacja) + endpointy LLM (pytanie → filtr, notatka → zmiany).
- `shared/`: typy, protokół, transport, krypto, słowniki (i18n, ICD-10, ATC).
- `data/`: skrypt przetwarzający Rejestr Produktów Leczniczych do kompaktowego JSON.
- ICE: STUN (`stun:stun.l.google.com:19302`) + TURN (np. Metered / Cloudflare).

## 6. Model danych (do ustalenia na starcie, T0.3)

```ts
Profile       { id, name, birthDate, bloodType?, allergies[], language, exportReminderAt? }
Drug          { rplId, name, activeSubstance, strength, form, atcCode, leafletUrl? }   // z RPL, tylko do odczytu
Medication    { id, rplId?, name, activeSubstance?, atcCode?, dose, unit, schedule, otc: boolean,
                startDate, endDate?, stopReason?, source: 'manual'|'voice'|'ikp'|'visit' }
Intake        { id, medicationId, scheduledAt, status: 'taken'|'skipped', confirmedAt }
Symptom       { id, name, severity?: 1-5, startedAt, endedAt?, notes?, source: 'manual'|'voice' }
Diagnosis     { id, name, icd10?, diagnosedAt, active: boolean, source: 'manual'|'ikp' }
Exam          { id, name, date, results: { name, value, unit }[], ocrText?, documentId? }
Document      { id, title, date, fileBlob(enc), mime, ocrText?, source: 'ikp'|'photo' }
Photo         { id, blob(enc), takenAt, category: 'skin'|'wound'|'swelling'|'other', seriesId?, note? }
PhotoSeries   { id, name, bodyPart?, createdAt }
VisitNoteItem { id, text, createdAt, source: 'manual'|'voice', discussed: boolean, visitId? }  // „powiem lekarzowi”
Visit         { id, date, doctor?, specialty?, transcript, followUpDate?, appliedChanges[] }   // audio usuwane po transkrypcji
Reminder      { id, type: 'medication'|'followUp'|'export', at, medicationId?, visitId? }
ShareSnapshot { profile, medications, intakes, symptoms, diagnoses, exams, photos(miniatury), visitNoteItems, visits, range }
QueryFilter   { entity: 'medication'|'symptom'|'exam', atcPrefix?, name?, from?, to?, sort?, limit? }  // wynik LLM
```

---

## 7. Zadania (2 osoby równolegle)

### Podział własności

| | **Osoba A** | **Osoba B** |
|---|---|---|
| Rola | Ekrany PWA, zaszyfrowana baza lokalna, kopia zapasowa, przypomnienia, design, slajdy | Serwer, transport P2P, aplikacja lekarza, „moduły” dla PWA (głos, leki, OCR, import IKP, LLM, za granicą) |
| Foldery (tylko właściciel edytuje) | `patient-pwa/src/` **poza** `features/` należącymi do B | `server/`, `doctor-app/`, `data/`, `shared/transport/`, `shared/crypto/`, `shared/dict/`, `patient-pwa/src/features/{voice,drugs,ocr,ikp-import,ask,abroad}/` |
| Wspólne (zmiana = uzgodnienie na głos) | `shared/types.ts`, `shared/demo-data.ts` | ← to samo |

**Jak nie czekać na siebie:**
- Typy i sygnatury ustalamy w Fazie 0 i **zamrażamy**.
- A pracuje na `demo-data.ts` i atrapach modułów B (zwykłe pole tekstowe zamiast głosu, `sendSnapshot` = `console.log`, autouzupełnianie z 10 leków na sztywno).
- B buduje widok lekarza na `demo-data.ts` + strona dev „symulator pacjenta”, bez czekania na ekrany A.

Priorytet: **M** = must (jest w happy path) · **S** = should (wyróżnik) · **C** = could (jeśli zostanie czas).

---

### Faza 0: Start

| A | B |
|---|---|
| **Razem:** T0.1, T0.3 | **Razem:** T0.1, T0.3 |
| T0.2 szkielet repo → push, T0.5 | T0.6 tunel/HTTPS, hosting, T0.4 |

- [ ] **T0.1** (A+B, M) Przeczytać treść zadania od organizatorów, porównać z tym planem.
- [ ] **T0.2** (A, M) Monorepo: `patient-pwa/`, `doctor-app/`, `server/`, `shared/`, `data/`; workspaces, prettier. **Push jak najszybciej.**
- [ ] **T0.3** (A+B, M) **Kontrakt (potem zamrożony):** `shared/types.ts` (sekcja 6), wiadomości protokołu, sygnatury:
  - transport: `createSession() → { sessionId, qrPayload }`, `connect(qrPayload)`, `sendSnapshot(snapshot)`, `onSnapshot(cb)`
  - głos: `<VoiceInput mode="entry|visitNote|postVisit|question" onResult />`, `parseEntry(text) → { symptoms[], medications[] }`
  - leki: `searchDrugs(query) → Drug[]`, `<DrugPicker onSelect />`, `<DrugInfoCard rplId />`
  - OCR / import: `ocrImage(blob) → { text, results[] }`, `importDocument(file) → Document + propozycje`
  - pytania: `askHistory(question) → QueryFilter`, `runFilter(filter, db) → wynik`
  - notatka: `parseVisitNote(text) → { stopMeds[], newMeds[], followUpDate? }`
  - za granicą: `<AbroadSummary lang />`, `exportAbroadPdf(lang)`
- [ ] **T0.4** (B, M) `shared/demo-data.ts`: profil **Pani Anna** zgodny z happy path: leki z recepty + OTC (ibuprom) + suplement, nowy lek z datą startu, ~3 tygodnie potwierdzeń i objawów (zawroty po nowym leku), zdjęcia wysypki, 2 badania, 2 diagnozy, 1 wcześniejsza wizyta, lek przeciwzakrzepowy w przeszłości (do pytania z happy path), 1–2 przykładowe PDF-y „z IKP”.
- [ ] **T0.5** (A, M) `README.md` (uruchomienie) + `CLAUDE.md` (zasady + tabela własności folderów).
- [ ] **T0.6** (B, M) HTTPS od początku (tunel dla telefonu), wybór hostingu serwera (proces ciągły + WSS).

---

### Faza 1: Rdzeń

| A – PWA | B – serwer, transport, lekarz, dane leków |
|---|---|
| T1.1 → T1.2 → T1.3 → T1.4 → T1.5 → T1.6 → T1.7 | T1.8 → T1.9 → T1.10 → T1.11 → T1.12 → T1.13 |

**A**
- [ ] **T1.1** (M) Szkielet PWA: manifest, service worker (działanie offline), instalowalność, nawigacja (Oś czasu / Dodaj / Wizyta / Zapytaj / Profil).
- [ ] **T1.2** (M) Baza Dexie + warstwa szyfrowania: każdy rekord i blob szyfrowany AES-256-GCM, klucz nieeksportowalny; przycisk „wczytaj dane demo”.
- [ ] **T1.3** (M) Profil: alergie, grupa krwi, **diagnozy** aktualne / przebyte.
- [ ] **T1.4** (M) Leki: lista (recepta / OTC / suplement), dodawanie z miejscem na `<DrugPicker>` od B, harmonogram, od–do; przy odstawieniu lub zmianie **pytanie o powód** (szybkie odpowiedzi + własny tekst).
- [ ] **T1.5** (M) Potwierdzanie leków: lista na dziś, „wziąłem / pominąłem” jednym dotknięciem.
- [ ] **T1.6** (M) Objawy: szybkie dodawanie (nazwa, nasilenie opcjonalnie, czas).
- [ ] **T1.7** (M) Badania: dodawanie ręczne (nazwa, data, wyniki), miejsce na „zrób zdjęcie wyniku” (OCR od B).

**B**
- [ ] **T1.8** (M) Serwer `ws`: `create-session`, `join-session`, przekazywanie `offer/answer/ice`, wygasanie sesji, nic nie zapisuje na dysku.
- [ ] **T1.9** (M) `shared/transport/`: RTCPeerConnection + DataChannel, JSON w kawałkach z potwierdzeniem; STUN + TURN.
- [ ] **T1.10** (M) Aplikacja lekarza: ekran z QR (odświeżany po wygaśnięciu), status połączenia.
- [ ] **T1.11** (M) Strona dev „symulator pacjenta” + test end-to-end na danych demo w dwóch kartach.
- [ ] **T1.12** (M) `data/`: skrypt pobierający dane otwarte RPL → kompaktowy `drugs.json` (nazwa, substancja, moc, postać, ATC, link do ulotki); `searchDrugs` + `<DrugPicker>`.
- [ ] **T1.13** (S) **Podpisywanie ofert:** klucze ECDSA z parowania, podpis SDP (z odciskiem DTLS) po obu stronach, weryfikacja; odrzucenie połączenia przy złym podpisie.

**🔁 Synchronizacja po Fazie 1:** merge do `main`. A: dane demo widoczne w PWA, szyfrowanie działa. B: transport działa między kartami, `<DrugPicker>` gotowy do wpięcia.

---

### Faza 2: Główne funkcje (happy path)

| A – ekrany PWA | B – lekarz + moduły |
|---|---|
| T2.1 Oś czasu | T2.8 Widok lekarza |
| T2.2 Lista „powiem lekarzowi” | T2.9 `VoiceInput` + `parseEntry` → **oddać jak najwcześniej** |
| T2.3 Zdjęcia w czasie | T2.10 Pytania o przeszłość (LLM → filtr) |
| T2.4 Udostępnij lekarzowi (wpina transport) | T2.11 Notatka po wizycie (LLM → zmiany) |
| T2.5 Ekran „Po wizycie” (zatwierdzanie zmian) | T2.12 Podsumowanie za granicą |
| T2.6 Ekran „Zapytaj” | T2.13 Koniec sesji, kompresja zdjęć |
| T2.7 Przypomnienia | |

**A**
- [ ] **T2.1** (M) **Oś czasu:** leki jako paski (start–koniec, z powodem odstawienia), potwierdzenia, objawy, zdjęcia (miniatury), badania, wizyty, dokumenty; filtr 7/30/90 dni. Związek „nowy lek → objaw” musi być widoczny na pierwszy rzut oka.
- [ ] **T2.2** (M) **Lista „powiem lekarzowi”:** dodawanie głosem lub tekstem z każdego miejsca (pływający przycisk); przed wizytą (data z przypomnienia o kontroli) lista wyświetla się automatycznie; odhaczanie „omówione”.
- [ ] **T2.3** (M) **Zdjęcia w czasie:** aparat lub galeria, kategoria (skóra / rana / obrzęk), seria, porównanie dwóch zdjęć obok siebie, miniatury na osi czasu. Bloby szyfrowane.
- [ ] **T2.4** (M) **Udostępnij lekarzowi:** wybór zakresu → skan QR → `connect` + `sendSnapshot`; status „przesłano”.
- [ ] **T2.5** (M) **Po wizycie:** `VoiceInput mode="postVisit"` → `parseVisitNote` (B) → lista proponowanych zmian z checkboxami → zatwierdź → leki zaktualizowane (z powodem), przypomnienie o kontroli ustawione, nagranie usunięte.
- [ ] **T2.6** (M) **Zapytaj:** przycisk mikrofonu + 3 szybkie przyciski (scenariusze z happy path) → `askHistory` → `runFilter` → lista z datami, do pokazania na ekranie.
- [ ] **T2.7** (M) **Przypomnienia:** o lekach (powiadomienie „Czas na lek”, bez nazwy), o kontroli, o eksporcie; z powiadomienia prosto do potwierdzenia.

**B**
- [ ] **T2.8** (M) **Widok lekarza:** nagłówek (pacjent, wiek, alergie, choroby), aktualne leki, **„Pacjent chce powiedzieć”** wysoko, oś czasu leków i objawów z wyraźnym związkiem czasowym, galeria zdjęć, badania, poprzednie wizyty. Czytelny w 30 s.
- [ ] **T2.9** (M) `features/voice/`: `VoiceInput` (silnik rozpoznawania mowy: patrz O1; interfejs taki, żeby dało się go podmienić; na start Web Speech API `pl-PL`) + `parseEntry` (lokalnie: słownik objawów + `searchDrugs` dla leków, „od rana”, „wieczorem”, „wzięłam”) → propozycja wpisów do zatwierdzenia jednym dotknięciem. Testy na zdaniach z happy path.
- [ ] **T2.10** (M) `features/ask/` + endpoint `POST /llm/query`: **tylko tekst pytania** → `QueryFilter` (np. „przeciwzakrzepowe” → `atcPrefix: B01`) → `runFilter` lokalnie na Dexie. Fallback bez sieci: 3 gotowe filtry dla scenariuszy z happy path.
- [ ] **T2.11** (M) Endpoint `POST /llm/visit-note`: transkrypcja → `{ stopMeds[], newMeds[], followUpDate? }` (na start atrapa, żeby A robił UI).
- [ ] **T2.12** (M) `features/abroad/`: podsumowanie **offline** (alergie, aktualne leki przez substancję czynną + ATC, choroby + ICD-10) w EN/DE/ES; słowniki w `shared/dict/` (etykiety, substancje, kody dla danych demo); widok na ekranie + PDF.
- [ ] **T2.13** (M) Koniec sesji u lekarza (przycisk + timeout, czyszczenie pamięci) + zmniejszanie zdjęć przed wysyłką.
- [ ] **T2.14** (S) Druk / PDF widoku lekarza.

**🔁 Synchronizacja po Fazie 2:** merge, **pełny happy path na telefonie**. Lista poprawek, decyzja, które S/C robimy.

---

### Faza 3: Import, OCR, bezpieczeństwo, kopia zapasowa

| A | B |
|---|---|
| T3.1 Eksport kopii | T3.5 Import dokumentów z IKP |
| T3.2 Import kopii | T3.6 OCR zdjęcia wyniku |
| T3.3 Blokada passkey / PIN | T3.7 `<DrugInfoCard>` (fakty z ulotki) |
| T3.4 Przypomnienie o eksporcie + ostrzeżenie o haśle | T3.8 Test TURN w sieci komórkowej |

**A**
- [ ] **T3.1** (S) **Eksport:** hasło → Argon2id → AES-256-GCM całości (baza + zdjęcia) → jeden plik do zapisania przez użytkownika.
- [ ] **T3.2** (S) **Import:** plik + hasło → odszyfrowanie → zapis w bazie z nowym kluczem urządzenia.
- [ ] **T3.3** (S) **Blokada aplikacji:** passkey (WebAuthn, biometria systemu) lub PIN przy otwarciu.
- [ ] **T3.4** (S) Przypomnienie o eksporcie raz w miesiącu + wyraźny komunikat przy pierwszym eksporcie: brak odzyskiwania hasła.

**B**
- [ ] **T3.5** (S) `features/ikp-import/`: Web Share Target (PWA odbiera PDF z menu „Udostępnij”) + wybór pliku jako alternatywa → zapis jako `Document` → wyciągnięcie tekstu (pdf.js) → propozycje leków / diagnoz / badań do zatwierdzenia.
- [ ] **T3.6** (S) `features/ocr/`: Tesseract.js (`pol`) na urządzeniu → tekst + próba wyciągnięcia wyników (nazwa, wartość, jednostka) → formularz badania do zatwierdzenia.
- [ ] **T3.7** (S) `<DrugInfoCard>`: substancja czynna, dawkowanie, informacje z ulotki (w tym przeciwwskazania) **jako fakty, bez ostrzeżeń**; link do pełnej ulotki.
- [ ] **T3.8** (S) Test połączenia przez TURN (telefon na danych komórkowych, laptop na Wi-Fi).

**Could (jeśli zostanie czas)**
- [ ] **T3.9** (A, C) Akcent „Sport”: aktywność / treningi na osi czasu obok objawów.
- [ ] **T3.10** (B, C) `parseEntry` przez LLM jako fallback dla dłuższych zdań (z jasną informacją, że tekst wpisu idzie do modelu).

**🔁 Synchronizacja po Fazie 3:** feature freeze. Od teraz tylko poprawki i prezentacja.

---

### Faza 4: Szlif i oddanie

| A | B |
|---|---|
| T4.1 design i poprawki PWA | T4.2 deploy + test na telefonie i w sieci hackathonu |
| **Razem:** T4.3 happy path + wideo | **Razem:** T4.3 |
| T4.4 slajdy | T4.5 opis + README + happy path |
| **Razem:** T4.6 wysyłka, T4.7 pitch | **Razem:** T4.6, T4.7 |

- [ ] **T4.1** (A, M) Design: spójne kolory, ikony, szybki UI (wpis w kilka sekund), duży przycisk mikrofonu.
- [ ] **T4.2** (B, M) Deploy + test na **prawdziwym telefonie i w sieci hackathonu**.
- [ ] **T4.3** (A+B, M) Przejść happy path kilka razy bez błędów; nagrać **wideo demo** jako zabezpieczenie.
- [ ] **T4.4** (A, M) Slajdy (max 10): problem → Pani Anna → rozwiązanie (zbieranie / codzienność / wizyta / pytania / za granicą) → demo (zrzuty) → prywatność i szyfrowanie (local-first, P2P, podpisy, kopia z hasłem) → vs mojeIKP i Bearable → aplikacja mobilna i rozwój (Capacitor, integracja z IKP, MyHealth@EU) → zespół.
- [ ] **T4.5** (B, M) Opis projektu + README z linkami (repo, demo, wideo) + **opisany happy path** (sekcja 4).
- [ ] **T4.6** (A+B, M) **Wysłać na HackTribe przed deadlinem** (z zapasem).
- [ ] **T4.7** (A+B, S) Pitch i odpowiedzi na trudne pytania (poniżej).

---

## 8. Ryzyka i odpowiedzi

| Ryzyko | Co robimy |
|---|---|
| Web Speech API wysyła dźwięk do Google | **Do rozkminienia**, patrz sekcja 9 (O1) |
| Zabezpieczenia mobilne (SQLCipher, Keystore, blokada zrzutów) niemożliwe w PWA | PWA to forma na hackathon; odpowiedniki w PWA (sekcja 5), na slajdzie wersja mobilna |
| WebRTC nie łączy się w sieci hackathonu / komórkowej | TURN + wideo demo |
| Hosting bez WebSocketów (serverless) | Hosting z ciągłym procesem; awaryjnie laptop + tunel |
| Brak HTTPS → nie działa kamera ani mikrofon | HTTPS/tunel od początku (T0.6) |
| Web Share Target nie działa na iOS | Na iOS wybór pliku; demo na Androidzie |
| RPL jest duży | Skrypt w `data/` → kompaktowy JSON tylko z potrzebnymi polami |
| Błąd tłumaczenia leku lub dawki | Tłumaczenie przez substancję czynną + kody ATC / ICD-10, a nie wolny tekst |
| LLM a prywatność | Do modelu idzie tylko pytanie / notatka, nigdy historia; filtr wykonywany lokalnie |
| „Czym różnicie się od IKP?” | Sekcja 2: oficjalne vs. faktyczne + objawy + głos + widok dla lekarza |
| „Czy to wyrób medyczny?” | Nie: zapisujemy i porządkujemy; informacje o lekach to fakty z ulotki, **bez automatycznych ostrzeżeń** |
| Nagrywanie lekarza | Notatka to pacjent mówiący po wizycie, nagranie usuwane po transkrypcji |
| Utrata telefonu | Zaszyfrowana kopia z hasłem + przypomnienia o eksporcie |

## 9. Do rozkminienia

- [ ] **O1. Rozpoznawanie mowy a „żaden serwer nie widzi danych”.** Web Speech API w Chrome wysyła nagranie do serwerów Google, więc kłóci się z local-first. Opcje do przemyślenia:
  - zostawić Web Speech na demo i powiedzieć o tym wprost w pitchu,
  - rozpoznawanie na urządzeniu w przeglądarce (np. Whisper w WebAssembly / transformers.js; pytanie o jakość polskiego i wagę modelu),
  - w wersji mobilnej systemowe rozpoznawanie na urządzeniu (Android / iOS on-device).
  Decyzja wpływa na T2.9 (B).

## 10. Zasady pracy

- **Każdy edytuje tylko swoje foldery** (tabela w sekcji 7). Wtedy merge prawie nigdy nie ma konfliktów.
- `shared/types.ts` i `shared/demo-data.ts`: zmiana tylko po uzgodnieniu na głos, w osobnym małym commicie, od razu na `main`.
- `main` zawsze działa; gałęzie `a/...` i `b/...`; merge często i na każdej synchronizacji. Przed merge: `git pull`, uruchomić, sprawdzić.
- Gdy moduł od drugiej osoby nie jest gotowy, nie czekamy: atrapa zgodna z sygnaturą z T0.3 i robimy dalej.
- Jeśli „M” nie jest gotowe, porzucamy „S/C”.
- Przed przerwą: push i krótka notatka „co działa / co dalej”.
- Każdy ma Claude Code w swojej kopii repo; `CLAUDE.md` mówi mu, które foldery należą do kogo.
