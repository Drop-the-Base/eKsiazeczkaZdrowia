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
- **Routing bez wspólnego pliku:** każda funkcja eksportuje `features/<nazwa>/route.tsx` (`{ path, element, tab? }`); `app/` ładuje je przez `import.meta.glob`. Nowy ekran B **nie wymaga** zmiany w `app/`.
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

## Zasady produktu (skrót z TASKS.md)

- Interfejs po polsku; inne języki tylko w „Za granicą”.
- Dane medyczne tylko na telefonie; do serwera idzie wyłącznie szyfrogram (przekaźnik) albo pojedyncze anonimowe zdanie do LLM.
- Aplikacja lekarza: dane tylko w pamięci karty (bez `localStorage`, IndexedDB, service workera).
- Informacje o lekach jako fakty, **bez automatycznych ostrzeżeń i interpretacji**.
- Każda funkcja głosowa działa też z pola tekstowego.
- Stack: TypeScript wszędzie, React + Vite, Dexie, WebCrypto, Node + `ws`.
