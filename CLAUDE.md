# eKsiazeczkaZdrowia – zasady dla agentów

Plan, architektura, model danych i opis tasków: **`TASKS.md`** (źródło prawdy). Ten plik mówi, **jak** pracujemy.

## Kim jestem

Pracują dwa agenty, każdy na innym komputerze, na własnym klonie repo:

- **Agent A – „Dane i codzienność”** (etykieta `agent-a`, gałęzie `a/...`)
- **Agent B – „Wizyta i bezpieczeństwo”** (etykieta `agent-b`, gałęzie `b/...`)

Rola jest zapisana w `CLAUDE.local.md` (plik lokalny, nie w gicie), np. `Jestem agentem A`. **Jeśli go nie ma, zapytaj użytkownika o rolę i utwórz go.** Nigdy nie bierz tasków drugiego agenta.

## Taski = issues na GitHubie

- Każdy task to issue z tytułem `[A07] ...` / `[B12] ...` (klucz = agent + numer), etykiety: `agent-a|agent-b`, `prio-M|prio-S|prio-C`, `faza-0..4`. Etykieta `human` = robią ludzie, agent pomija.
- W treści issue: **Zależy od:** lista kluczy. Task można wziąć, gdy wszystkie zależności są zamknięte; jeśli zależność drugiego agenta nie jest gotowa, a da się zrobić atrapę zgodną z kontraktem (`shared/types.ts`, `shared/contracts.ts`), rób z atrapą.
- Kolejność: najpierw `prio-M`, potem najniższa faza, potem najniższy numer klucza.
- Następny task: skill **`/next-task`** (`.claude/skills/next-task/SKILL.md`) – cały cykl od wyboru issue do merge.

## Własność folderów (twarda zasada: edytujesz tylko swoje)

| Agent A | Agent B |
|---|---|
| `patient-pwa/src/features/{profile,meds,intake,symptoms,exams,photos,timeline,reminders,ask,ikp-import,voice,drugs,ocr}/` | `patient-pwa/src/features/{visit-list,share,post-visit,abroad,lock,backup}/` |
| `patient-pwa/src/app/`, `patient-pwa/src/ui/` (szkielet i wspólne komponenty) | `patient-pwa/src/db/` (baza + szyfrowanie) |
| `data/` (skrypt RPL) | `server/` (poza `server/src/llm/query.ts`), `doctor-app/` |
| `server/src/llm/query.ts`, `server/src/llm/client.ts` | `shared/types.ts`, `shared/contracts.ts`, `shared/demo-data.ts`, `shared/transport/`, `shared/crypto/`, `shared/dict/` |
| root: `package.json`, `tsconfig*.json`, `.prettierrc`, `.gitignore`, `README.md` | `progress/agent-b.md` |
| `progress/agent-a.md` | |

**Jak nie wchodzić sobie w drogę:**
- **Routing bez wspólnego pliku:** każda funkcja eksportuje domyślnie z `features/<nazwa>/route.tsx` obiekt lub tablicę `FeatureRoute` (`{ path, element }`, typ w `app/featureRoute.ts`), a z `features/<nazwa>/overlay.tsx` opcjonalny komponent pływający; `app/` ładuje je przez `import.meta.glob`. Dolna nawigacja jest stała (`app/tabs.tsx`): `/` oś czasu, `/dodaj`, `/zapytaj`, `/profil` – A; **`/wizyta` – B rejestruje ją w jednej ze swoich funkcji**. Zakładka bez zarejestrowanego ekranu pokazuje placeholder. Nowy ekran B **nie wymaga** zmiany w `app/`.
- **Endpointy serwera:** `server/src/llm/query.ts` eksportuje handler, B podpina go w `server/src/index.ts`.
- **Potrzebujesz zmiany w cudzym pliku** (np. nowe pole w `shared/types.ts`, nowy komponent w `ui/`)? Nie edytuj. Załóż issue z etykietą drugiego agenta (`gh issue create --label agent-x --title "[prośba] ..."`), a do tego czasu atrapa / lokalna kopia w swoim folderze. Drugi agent bierze prośby **przed** zwykłymi taskami.
- **`shared/`:** `shared/package.json` i `shared/tsconfig.json` należą do A (monorepo), `shared/src/**` do B.
- **Zależności npm:** każdy może dodać paczkę do workspace'u, w którym pracuje (`npm i -w patient-pwa <pkg>`), bez proszenia. Konflikt w `package.json` → zachowaj obie strony; konflikt w `package-lock.json` → `git checkout --theirs package-lock.json && npm i` i zacommituj wynik.
- Wyjątek: drobna, oczywista poprawka typu literówka w imporcie, która blokuje build – można, w osobnym commicie, opisana w PR.

## Git i PR

- Gałąź na task: `a/A07-rpl-script`, `b/B12-visit-list` (z aktualnego `origin/main`).
- Commity małe, po polsku lub angielsku, z kluczem: `[A07] skrypt RPL -> drugs.json`.
- PR: tytuł `[A07] ...`, w treści `Closes #<nr issue>`, co zrobione, jak sprawdzić, atrapy / odstępstwa.
- Przed merge: `git fetch && git rebase origin/main`, `npm run build` (i testy, jeśli są) muszą przejść.
- Merge samodzielnie: `gh pr merge --squash --delete-branch`. **Nigdy** `--force` na `main`, nigdy push bezpośrednio na `main`.
- Konflikt w swoich plikach – rozwiąż. Konflikt w cudzych plikach – zatrzymaj się i zapytaj użytkownika.

## Lista zrobionych tasków

Po każdym zmergowanym tasku dopisz linię do **swojego** pliku `progress/agent-a.md` / `progress/agent-b.md` (w tym samym PR, przed merge):

```
- [x] [A07] skrypt RPL -> drugs.json · PR #12 · 2026-10-03 18:40 · atrapa: brak
```

Każdy agent edytuje tylko swój plik, więc nie ma konfliktów. Issue zamyka się samo przez `Closes #N`.

## Architektura kodu

Cel: **prosto, czytelnie, bez bugów**. To hackathon, nie platforma – żadnego overengineeringu.

**Feature folders (pionowe plastry).** Każda funkcja w `patient-pwa/src/features/<nazwa>/`:

```
features/meds/
  route.tsx        # ekran(y) + rejestracja w routerze ({ path, element, tab? })
  components/      # komponenty tej funkcji
  useMeds.ts       # hooki: stan ekranu + odczyt/zapis przez db
  meds.logic.ts    # czysta logika (bez Reacta, bez db) – tu są testy
  index.ts         # publiczne API dla innych funkcji (tylko to wolno importować z zewnątrz)
```

**Warstwy i kierunek zależności** (strzałka = „może importować”):

`route/components` → `hooki` → `db` (B) / czysta logika → `shared/`

- **Komponenty** tylko renderują i wołają hooki; **nigdy** nie dotykają Dexie, `fetch` ani WebCrypto bezpośrednio.
- **Hooki** (`useX`) trzymają stan ekranu i rozmawiają z `db` (odczyt reaktywny: `useLiveQuery` z `dexie-react-hooks`) i z serwerem.
- **Czysta logika** (`*.logic.ts`, np. `parseEntry`, `buildVisitSummary`, `runFilter`): funkcje dane → dane, bez efektów ubocznych. Daty przekazuj parametrem (`now`), nie wołaj `new Date()` w środku.
- **`db/`** to jedyne miejsce z Dexie; API po encjach (`db.medications.list()`, `add`, `update`…), zwraca typy z `shared/types.ts`.
- **`shared/`**: czysty TypeScript – bez Reacta i bez DOM (wyjątek: WebCrypto w `shared/crypto/`).
- **Inna funkcja** importowana tylko przez jej `index.ts` – wyjątek: czysta logika (`features/x/x.logic.ts`) może importować cudzy `*.logic.ts` bezpośrednio, żeby testy w Node nie ciągnęły komponentów i bazy. Bez cykli między funkcjami.
- **`server/`**: cienki. `index.ts` = routing i nagłówki; jeden plik na handler; jedyny stan to sesje przekaźnika w pamięci.
- **`doctor-app/`**: ten sam podział (komponenty → hooki → logika), stan sesji w jednym hooku / kontekście, nic trwałego.

**Wzorce i konwencje**
- **TypeScript `strict`**, zero `any` (w ostateczności `unknown` + zawężenie). Typy domenowe tylko z `shared/types.ts` – nie twórz równoległych kopii.
- **Walidacja na granicach**: body żądań na serwerze, payload z QR, odebrany snapshot, plik importu – sprawdź kształt przed użyciem (prosty type guard albo `zod`, tylko tam).
- **Stan**: `useState` / `useReducer` lokalnie, dane trwałe z `db` przez `useLiveQuery`. Bez Reduxa / Zustanda; React Context tylko dla stanu globalnego (blokada aplikacji, sesja lekarza).
- **Daty**: w bazie i w protokole ISO 8601 (string); formatowanie do wyświetlenia w jednym helperze.
- **Style**: CSS Modules + zmienne z `ui/`. Bez bibliotek UI.
- **Nazwy**: komponenty `PascalCase.tsx`, hooki `useX.ts`, logika `x.logic.ts`, testy `x.test.ts` obok pliku. Kod i nazwy po angielsku, teksty w UI po polsku.
- **Testy**: Vitest dla czystej logiki, kryptografii i transportu (to tam są bugi). Testów UI nie wymagamy.

**Żeby nie było bugów**
- Każdy ekran z danymi obsługuje 4 stany: **ładowanie, pusto, błąd, dane**.
- Żadnych cichych `catch {}` – błąd trafia do stanu ekranu (komunikat po polsku) albo jest rzucany dalej. Żadnych „wiszących” promise'ów (`await` albo jawne `void` z obsługą błędu).
- `useEffect` sprząta po sobie (subskrypcje, timery, WebSocket, kamera, mikrofon).
- Wartości z formularzy parsuj i sprawdzaj (liczby, daty) przed zapisem.
- Przed PR: `npm run build` (z `tsc --noEmit`) i `npm test` przechodzą, ekran sprawdzony ręcznie.

**Bez overengineeringu**
- Abstrakcja dopiero przy **drugim** użyciu; nie przygotowujemy „na przyszłość”.
- Bez generycznych repozytoriów, DI, fabryk, event busów, własnych frameworków. Funkcja + hook wystarczą.
- Nowa zależność npm tylko, gdy oszczędza realną pracę (np. Dexie, `qrcode`, `html5-qrcode`, pdf.js, Tesseract, `hash-wasm`).
- Małe pliki i funkcje; jeśli plik ma > ~250 linii, podziel go według tego układu, nie wymyślaj nowego.
- Bez zakomentowanego kodu i martwych opcji konfiguracji. Komentarz tylko tam, gdzie „dlaczego” nie wynika z kodu.

## Zasady produktu (skrót z TASKS.md)

- Interfejs po polsku; inne języki tylko w „Za granicą”.
- Dane medyczne tylko na telefonie; do serwera idzie wyłącznie szyfrogram (przekaźnik) albo pojedyncze anonimowe zdanie do LLM.
- Aplikacja lekarza: dane tylko w pamięci karty (bez `localStorage`, IndexedDB, service workera).
- Informacje o lekach jako fakty, **bez automatycznych ostrzeżeń i interpretacji**.
- Każda funkcja głosowa działa też z pola tekstowego.
- Stack: TypeScript wszędzie, React + Vite, Dexie, WebCrypto, Node + `ws`.
