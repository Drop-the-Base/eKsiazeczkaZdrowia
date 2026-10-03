---
name: next-task
description: Weź następny task (issue) z GitHuba i przeprowadź go do końca – branch, implementacja, PR, merge, wpis w progress. Użyj, gdy użytkownik mówi "next task", "bierz następny", "/next-task" albo podaje klucz taska (np. "/next-task T07").
---

# /next-task

Zasady, architektura i konwencje: `CLAUDE.md`. Plan i szczegóły tasków: `TASKS.md`.

Na Windows `gh` może nie być w PATH: użyj `"/c/Program Files/GitHub CLI/gh.exe"`.

## 1. Wybór taska

Jeśli podano klucz w argumencie – weź ten issue. W przeciwnym razie:

```bash
gh issue list --state open --limit 100 --json number,title,labels,body,assignees
```

1. Odrzuć: z etykietą `human`, przypisane do kogoś innego, z otwartym PR (`gh pr list --search "<klucz>"`).
2. Odrzuć te, których zależności (**Zależy od:** w treści) są otwarte.
3. Kolejność: `prio-M` → `prio-S` → `prio-C`, potem najniższa `faza-N`, potem najniższy numer w kluczu.

Przypisz się: `gh issue edit <nr> --add-assignee @me`. Powiedz użytkownikowi w jednej linii, który task bierzesz.

## 2. Branch

```bash
git fetch origin && git switch -c <KLUCZ>-<krótki-slug> origin/main
```

Jeśli masz niezacommitowane zmiany z innego taska – zatrzymaj się i zapytaj.

## 3. Implementacja

- Przeczytaj issue i odpowiadający fragment `TASKS.md` (numer T w issue).
- Trzymaj się zakresu issue. Nowy pomysł / brakujący kawałek → nowe issue, nie rozszerzaj nadmiernie bieżącego.
- Commity małe: `[KLUCZ] opis`.

## 4. Weryfikacja

- `npm run build` (i `npm test`, jeśli istnieje) w root musi przejść.
- Sprawdź kryteria „Gotowe gdy” z issue. Jeśli to ekran – sprawdź, że się poprawnie renderuje.
- Nie da się czegoś sprawdzić → napisz to wprost w PR.

## 5. Progress

Dopisz na końcu `progress/progress.md`:

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

`scripts/ship.sh`: fetch → rebase na `origin/main` → `npm install` → build → testy → `push --force-with-lease` → squash merge → `main` lokalnie. W razie problemów / konfliktów napraw u siebie.

## 7. Raport

Jedna–trzy linie dla użytkownika: co zmergowane (link do PR), co ewentualnie odblokowane. Potem zapytaj, czy brać następny (albo bierz od razu, jeśli użytkownik prosił o pracę w pętli).
