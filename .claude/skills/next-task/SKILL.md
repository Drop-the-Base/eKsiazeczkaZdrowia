---
name: next-task
description: Weź następny task (issue) swojego agenta z GitHuba i przeprowadź go do końca – branch, implementacja, PR, merge, wpis w progress. Użyj, gdy użytkownik mówi "next task", "bierz następny", "/next-task" albo podaje klucz taska (np. "/next-task A07").
---

# /next-task

Zasady, własność folderów i konwencje: `CLAUDE.md`. Plan i szczegóły tasków: `TASKS.md`.

## 0. Rola

Przeczytaj `CLAUDE.local.md`. Brak → zapytaj użytkownika „agent A czy B?” i zapisz `Jestem agentem A` / `Jestem agentem B`. Dalej `X` = `a` lub `b`.

Na Windows `gh` może nie być w PATH: użyj `"/c/Program Files/GitHub CLI/gh.exe"`.

## 1. Wybór taska

Jeśli podano klucz w argumencie – weź ten issue. W przeciwnym razie:

```bash
gh issue list --label agent-X --state open --limit 100 --json number,title,labels,body,assignees
```

1. Najpierw issues z tytułem `[prośba] ...` (prośby od drugiego agenta).
2. Odrzuć: z etykietą `human`, przypisane do kogoś innego, z otwartym PR (`gh pr list --search "<klucz>"`).
3. Odrzuć te, których zależności (**Zależy od:** w treści) są otwarte – **chyba że** zależność należy do drugiego agenta i da się zrobić atrapę zgodną z kontraktem (wtedy zanotuj atrapę w PR).
4. Kolejność: `prio-M` → `prio-S` → `prio-C`, potem najniższa `faza-N`, potem najniższy numer w kluczu.

Przypisz się: `gh issue edit <nr> --add-assignee @me`. Powiedz użytkownikowi w jednej linii, który task bierzesz.

## 2. Branch

```bash
git fetch origin && git switch -c X/<KLUCZ>-<krótki-slug> origin/main
```

Jeśli masz niezacommitowane zmiany z innego taska – zatrzymaj się i zapytaj.

## 3. Implementacja

- Przeczytaj issue i odpowiadający fragment `TASKS.md` (numer T w issue).
- Edytuj **tylko swoje foldery** (`CLAUDE.md`). Potrzebna zmiana u drugiego agenta → issue `[prośba] ...` z jego etykietą + atrapa u siebie.
- Trzymaj się zakresu issue. Nowy pomysł / brakujący kawałek → nowe issue ze swoją etykietą, nie rozszerzaj bieżącego.
- Commity małe: `[KLUCZ] opis`.

## 4. Weryfikacja

- `npm run build` (i `npm test`, jeśli istnieje) w root musi przejść.
- Sprawdź kryteria „Gotowe gdy” z issue. Jeśli to ekran – uruchom dev server i sprawdź, że się renderuje (skill `run`, jeśli dostępny).
- Nie da się czegoś sprawdzić → napisz to wprost w PR.

## 5. Progress

Dopisz na końcu `progress/agent-X.md`:

```
- [x] [KLUCZ] tytuł · issue #<nr> · RRRR-MM-DD GG:MM · atrapy: <brak | co>
```

i zacommituj to na gałęzi taska (trafia do `main` razem z PR).

## 6. PR i merge

```bash
git push -u origin HEAD
gh pr create --title "[KLUCZ] tytuł" --body "Closes #<nr>

## Co
...
## Jak sprawdzić
...
## Atrapy / odstępstwa
..."
bash scripts/ship.sh
```

`scripts/ship.sh`: fetch → rebase na `origin/main` → `npm install` → build → testy → `push --force-with-lease` → squash merge → `main` lokalnie; ponawia, gdy drugi agent zmergował w międzyczasie. Konflikt przy rebase w cudzych plikach → STOP, zapytaj. Build / testy padają po rebase → napraw u siebie albo `[prośba]` do drugiego agenta.

## 7. Raport

Jedna–trzy linie dla użytkownika: co zmergowane (link do PR), co jest atrapą, co odblokowane. Potem zapytaj, czy brać następny (albo bierz od razu, jeśli użytkownik prosił o pracę w pętli).
