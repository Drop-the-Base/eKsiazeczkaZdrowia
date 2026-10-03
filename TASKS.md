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

## 7. Zadania (2 osoby równolegle, podział po funkcjach)

Każdy robi swoje funkcje **od początku do końca**: ekran + technika pod spodem. Obaj mamy ekrany do pokazania na demo i obaj mamy trudniejsze technicznie kawałki.

### Podział

| | **Osoba A: „Dane i codzienność”** | **Osoba B: „Wizyta i bezpieczeństwo”** |
|---|---|---|
| Ekrany PWA | Profil i diagnozy, leki, potwierdzanie leków, objawy, badania, zdjęcia w czasie, **oś czasu**, przypomnienia, **Zapytaj**, import z IKP | Lista „powiem lekarzowi”, **Udostępnij lekarzowi**, **Po wizycie**, **Za granicą**, blokada aplikacji, kopia zapasowa |
| Technika | Rozpoznawanie mowy + rozbijanie wpisów, baza leków z RPL, OCR, import PDF, LLM: pytanie → filtr | Baza lokalna + szyfrowanie, serwer sygnalizacyjny, WebRTC, podpisywanie kluczami, TURN, **aplikacja lekarza**, LLM: notatka → zmiany, słowniki ATC/ICD-10, eksport/import z hasłem |
| Happy path (sekcja 4) | kroki 1, 2, 4, 7 | kroki 3, 5, 6, 8 |

### Własność folderów

| Osoba A | Osoba B | Wspólne (zmiana = uzgodnienie na głos) |
|---|---|---|
| `patient-pwa/src/features/{profile,meds,intake,symptoms,exams,photos,timeline,reminders,ask,ikp-import,voice,drugs,ocr}/` | `patient-pwa/src/features/{visit-list,share,post-visit,abroad,lock,backup}/` | `patient-pwa/src/app/` (nawigacja, routing) |
| `data/` (skrypt RPL) | `patient-pwa/src/db/` (baza + szyfrowanie) | `patient-pwa/src/ui/` (wspólne komponenty) |
| `server/src/llm/query.ts` | `server/` (reszta), `doctor-app/` | `shared/types.ts`, `shared/demo-data.ts` |
| | `shared/transport/`, `shared/crypto/`, `shared/dict/` | |

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
- [ ] **T0.6** (B, M) `shared/demo-data.ts`: profil **Pani Anna** zgodny z happy path: leki z recepty + OTC (ibuprom) + suplement, nowy lek z datą startu, ~3 tygodnie potwierdzeń i objawów (zawroty po nowym leku), zdjęcia wysypki, 2 badania, 2 diagnozy, 1 wcześniejsza wizyta, lek przeciwzakrzepowy w przeszłości, 1–2 przykładowe PDF-y „z IKP”.
- [ ] **T0.7** (A, M) `README.md` (uruchomienie) + `CLAUDE.md` (zasady + tabele własności z tej sekcji).
- [ ] **T0.8** (B, M) HTTPS od początku (tunel dla telefonu), wybór hostingu serwera (proces ciągły + WSS).

---

### Faza 1: Rdzeń

**A: dane**
- [ ] **T1.1** (M) Profil: alergie, grupa krwi, **diagnozy** aktualne / przebyte.
- [ ] **T1.2** (M) `data/` + `features/drugs/`: skrypt RPL (dane otwarte) → kompaktowy `drugs.json` (nazwa, substancja, moc, postać, ATC, link do ulotki); `searchDrugs` + `<DrugPicker>`.
- [ ] **T1.3** (M) Leki: lista (recepta / OTC / suplement), dodawanie przez `<DrugPicker>`, harmonogram, od–do; przy odstawieniu lub zmianie **pytanie o powód**.
- [ ] **T1.4** (M) Potwierdzanie leków: lista na dziś, „wziąłem / pominąłem” jednym dotknięciem.
- [ ] **T1.5** (M) Objawy: szybkie dodawanie (nazwa, nasilenie opcjonalnie, czas).
- [ ] **T1.6** (M) Badania: dodawanie ręczne (nazwa, data, wyniki).

**B: połączenie z lekarzem**
- [ ] **T1.7** (M) Serwer `ws`: `create-session`, `join-session`, przekazywanie `offer/answer/ice`, wygasanie sesji, nic nie zapisuje na dysku.
- [ ] **T1.8** (M) `shared/transport/`: RTCPeerConnection + DataChannel, JSON w kawałkach z potwierdzeniem; STUN + TURN.
- [ ] **T1.9** (M) Aplikacja lekarza: ekran z QR (odświeżany po wygaśnięciu), status połączenia.
- [ ] **T1.10** (M) Strona dev „symulator pacjenta” + test end-to-end na danych demo w dwóch kartach.
- [ ] **T1.11** (M) Lista **„powiem lekarzowi”**: pływający przycisk z każdego ekranu, dodawanie tekstem (głos po oddaniu `VoiceInput` przez A), odhaczanie „omówione”.
- [ ] **T1.12** (S) **Podpisywanie ofert:** klucze ECDSA z parowania (publiczny klucz lekarza w QR), podpis SDP (z odciskiem DTLS) po obu stronach, weryfikacja; odrzucenie połączenia przy złym podpisie.

**🔁 Synchronizacja po Fazie 1:** merge do `main`. A: leki, objawy i badania działają na danych demo. B: transport działa między kartami, lista „powiem lekarzowi” gotowa.

---

### Faza 2: Happy path

**A: głos, oś czasu, pytania**
- [ ] **T2.1** (M) `features/voice/`: `VoiceInput` (silnik rozpoznawania mowy: patrz O1; interfejs taki, żeby dało się go podmienić; na start Web Speech API `pl-PL`) + `parseEntry` (lokalnie: słownik objawów + `searchDrugs`, „od rana”, „wieczorem”, „wzięłam”) → propozycja wpisów do zatwierdzenia jednym dotknięciem. **Oddać B jak najwcześniej.**
- [ ] **T2.2** (M) **Oś czasu:** leki jako paski (start–koniec, z powodem odstawienia), potwierdzenia, objawy, zdjęcia (miniatury), badania, wizyty, dokumenty; filtr 7/30/90 dni. Związek „nowy lek → objaw” widoczny na pierwszy rzut oka. Komponent wielokrotnego użytku (B użyje go u lekarza).
- [ ] **T2.3** (M) **Zdjęcia w czasie:** aparat lub galeria, kategoria (skóra / rana / obrzęk), seria, porównanie dwóch zdjęć obok siebie, miniatury na osi czasu.
- [ ] **T2.4** (M) **Zapytaj:** mikrofon + 3 szybkie przyciski (scenariusze z happy path) → `server/src/llm/query.ts`: **tylko tekst pytania** → `QueryFilter` (np. „przeciwzakrzepowe” → `atcPrefix: B01`) → `runFilter` lokalnie → lista z datami. Fallback bez sieci: 3 gotowe filtry.
- [ ] **T2.5** (M) **Przypomnienia:** o lekach („Czas na lek”, bez nazwy leku), z powiadomienia prosto do potwierdzenia; `createReminder()` dla B.

**B: wizyta i za granicą**
- [ ] **T2.6** (M) **Udostępnij lekarzowi** (ekran pacjenta): wybór zakresu → skan QR → `connect` + `sendSnapshot`; zmniejszanie zdjęć; status „przesłano”.
- [ ] **T2.7** (M) **Widok lekarza:** nagłówek (pacjent, wiek, alergie, choroby), aktualne leki, **„Pacjent chce powiedzieć”** wysoko, oś czasu (`<Timeline>` od A), galeria zdjęć, badania, poprzednie wizyty. Czytelny w 30 s. Koniec sesji: przycisk + timeout, czyszczenie pamięci.
- [ ] **T2.8** (M) **Po wizycie:** `VoiceInput mode="postVisit"` → endpoint `POST /llm/visit-note` → `{ stopMeds[], newMeds[], followUpDate? }` → lista zmian z checkboxami → zatwierdź → leki zaktualizowane (z powodem), `createReminder` na kontrolę, nagranie usunięte.
- [ ] **T2.9** (M) Lista „powiem lekarzowi” **pokazuje się automatycznie przed wizytą** (gdy zbliża się data kontroli).
- [ ] **T2.10** (M) **Za granicą:** podsumowanie **offline** (alergie, aktualne leki przez substancję czynną + ATC, choroby + ICD-10) w EN/DE/ES; słowniki w `shared/dict/`; widok na ekranie + PDF.
- [ ] **T2.11** (S) Druk / PDF widoku lekarza.

**🔁 Synchronizacja po Fazie 2:** merge, **pełny happy path na telefonie**. Lista poprawek, decyzja, które S/C robimy.

---

### Faza 3: Wyróżniki i bezpieczeństwo

**A: import i informacje o lekach**
- [ ] **T3.1** (S) `features/ikp-import/`: Web Share Target (PWA odbiera PDF z menu „Udostępnij”) + wybór pliku jako alternatywa → `Document` → tekst z PDF (pdf.js) → propozycje leków / diagnoz / badań do zatwierdzenia.
- [ ] **T3.2** (S) `features/ocr/`: zdjęcie wyniku → Tesseract.js (`pol`) na urządzeniu → tekst + próba wyciągnięcia wyników (nazwa, wartość, jednostka) → formularz badania do zatwierdzenia.
- [ ] **T3.3** (S) `<DrugInfoCard>`: substancja czynna, dawkowanie, informacje z ulotki (w tym przeciwwskazania) **jako fakty, bez ostrzeżeń**; link do pełnej ulotki.
- [ ] **T3.4** (C) Akcent „Sport”: aktywność / treningi na osi czasu obok objawów.
- [ ] **T3.5** (C) `parseEntry` przez LLM jako fallback dla dłuższych zdań (z jasną informacją, że tekst wpisu idzie do modelu).

**B: szyfrowanie i kopia zapasowa**
- [ ] **T3.6** (S) **Szyfrowanie bazy:** każdy rekord i blob AES-256-GCM (WebCrypto), klucz nieeksportowalny; **bez zmiany API `db`**, więc ekrany A działają dalej.
- [ ] **T3.7** (S) **Blokada aplikacji:** passkey (WebAuthn, biometria systemu) lub PIN przy otwarciu.
- [ ] **T3.8** (S) **Eksport:** hasło → Argon2id → AES-256-GCM całości (baza + zdjęcia) → jeden plik; wyraźny komunikat przy pierwszym eksporcie: brak odzyskiwania hasła.
- [ ] **T3.9** (S) **Import:** plik + hasło → odszyfrowanie → zapis z nowym kluczem urządzenia; przypomnienie o eksporcie raz w miesiącu.
- [ ] **T3.10** (S) Test połączenia przez TURN (telefon na danych komórkowych, laptop na Wi-Fi).

**🔁 Synchronizacja po Fazie 3:** feature freeze. Od teraz tylko poprawki i prezentacja.

---

### Faza 4: Szlif i oddanie

- [ ] **T4.1** (A+B, M) Design: każdy dopieszcza swoje ekrany; wspólnie pilnujemy spójności (`ui/`).
- [ ] **T4.2** (B, M) Deploy + test na **prawdziwym telefonie i w sieci hackathonu**.
- [ ] **T4.3** (A+B, M) Przejść happy path kilka razy bez błędów; nagrać **wideo demo** jako zabezpieczenie.
- [ ] **T4.4** (A, M) Slajdy (max 10): problem → Pani Anna → rozwiązanie (zbieranie / codzienność / wizyta / pytania / za granicą) → demo (zrzuty) → prywatność i szyfrowanie (local-first, P2P, podpisy, kopia z hasłem) → vs mojeIKP i Bearable → aplikacja mobilna i rozwój (Capacitor, integracja z IKP, MyHealth@EU) → zespół.
- [ ] **T4.5** (B, M) Opis projektu + README z linkami (repo, demo, wideo) + **opisany happy path** (sekcja 4).
- [ ] **T4.6** (A+B, M) **Wysłać na HackTribe przed deadlinem** (z zapasem).
- [ ] **T4.7** (A+B, S) Pitch i odpowiedzi na trudne pytania (poniżej). Każdy pokazuje swoją część happy path.

---

## 8. Ryzyka i odpowiedzi

| Ryzyko | Co robimy |
|---|---|
| Web Speech API wysyła dźwięk do Google | **Do rozkminienia**, patrz sekcja 9 (O1) |
| Zabezpieczenia mobilne (SQLCipher, Keystore, blokada zrzutów) niemożliwe w PWA | PWA to forma na hackathon; odpowiedniki w PWA (sekcja 5), na slajdzie wersja mobilna |
| WebRTC nie łączy się w sieci hackathonu / komórkowej | TURN + wideo demo |
| Hosting bez WebSocketów (serverless) | Hosting z ciągłym procesem; awaryjnie laptop + tunel |
| Brak HTTPS → nie działa kamera ani mikrofon | HTTPS/tunel od początku (T0.8) |
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
  Decyzja wpływa na T2.1 (A).

## 10. Zasady pracy

- **Każdy edytuje tylko swoje foldery** (tabela w sekcji 7). Wtedy merge prawie nigdy nie ma konfliktów.
- `shared/types.ts` i `shared/demo-data.ts`: zmiana tylko po uzgodnieniu na głos, w osobnym małym commicie, od razu na `main`.
- `main` zawsze działa; gałęzie `a/...` i `b/...`; merge często i na każdej synchronizacji. Przed merge: `git pull`, uruchomić, sprawdzić.
- Gdy moduł od drugiej osoby nie jest gotowy, nie czekamy: atrapa zgodna z sygnaturą z T0.3 i robimy dalej.
- Jeśli „M” nie jest gotowe, porzucamy „S/C”.
- Przed przerwą: push i krótka notatka „co działa / co dalej”.
- Każdy ma Claude Code w swojej kopii repo; `CLAUDE.md` mówi mu, które foldery należą do kogo.
