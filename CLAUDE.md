# eKsiazeczkaZdrowia – zasady dla agenta

Plan, architektura, model danych i opis tasków: **`TASKS.md`** (źródło prawdy). Ten plik mówi, **jak** pracujemy.

## Kim jestem

Pracuje jeden agent, który ma pełny dostęp do całego repozytorium i realizuje wszystkie taski.

## Taski = issues na GitHubie

- Każdy task to issue z tytułem `[KLUCZ] ...`, etykiety: `prio-M|prio-S|prio-C`, `faza-0..4`. Etykieta `human` = robią ludzie, agent pomija.
- W treści issue: **Zależy od:** lista kluczy. Task można wziąć, gdy wszystkie zależności są zamknięte.
- Kolejność: najpierw `prio-M`, potem najniższa faza, potem najniższy numer klucza.
- Następny task: skill **`/next-task`** (`.claude/skills/next-task/SKILL.md`) – cały cykl od wyboru issue do merge.

## Struktura projektu

Jeden agent odpowiada za wszystkie moduły repozytorium:
- `patient-pwa/` (PWA pacjenta, routing, UI, funkcje, db, szyfrowanie)
- `doctor-app/` (aplikacja lekarza)
- `server/` (Node + ws, przekaźnik, LLM)
- `shared/` (typy, kontrakty, krypto, transport, słowniki)
- `data/` (skrypt RPL)
- `progress/progress.md` (postęp prac)

**Routing i moduły:**
- **Routing modularny:** każda funkcja eksportuje domyślnie z `features/<nazwa>/route.tsx` obiekt lub tablicę `FeatureRoute` (`{ path, element }`, typ w `app/featureRoute.ts`), a z `features/<nazwa>/overlay.tsx` opcjonalny komponent pływający; `app/` ładuje je przez `import.meta.glob`. Dolna nawigacja jest stała (`app/tabs.tsx`): `/` oś czasu, `/dodaj`, `/zapytaj`, `/profil`, `/wizyta`.
- **Endpointy serwera:** handlery w dedykowanych plikach `server/src/`, podpinane w `server/src/index.ts`.
- **Zależności npm:** można dodać paczkę do workspace'u, w którym pracujesz (`npm i -w patient-pwa <pkg>`).

## Git i PR

- Gałąź na task: `<KLUCZ>-<krótki-slug>` (z aktualnego `origin/main`).
- Commity małe, po polsku lub angielsku, z kluczem: `[KLUCZ] opis zmian`.
- PR: tytuł `[KLUCZ] ...`, w treści `Closes #<nr issue>`, co zrobione, jak sprawdzić, ewentualne odstępstwa.
- Przed merge: `git fetch && git rebase origin/main`, `npm run build` (i testy, jeśli są) muszą przejść.
- Merge samodzielnie: `gh pr merge --squash --delete-branch`. **Nigdy** `--force` na `main`, nigdy push bezpośrednio na `main`.
- W razie konfliktu – rozwiąż go przed merge.

## Lista zrobionych tasków

Po każdym zmergowanym tasku dopisz linię do pliku `progress/progress.md` (w tym samym PR, przed merge):

```
- [x] [KLUCZ] tytuł · PR #12 · 2026-10-03 18:40 · atrapy: brak
```

Issue zamyka się samo przez `Closes #N`.

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

`route/components` → `hooki` → `db` / czysta logika → `shared/`

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
