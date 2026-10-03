#!/usr/bin/env bash
# Rebase bieżącej gałęzi na origin/main → install → build → test → push → squash merge PR.
# Ponawia, gdy main zmienił się w trakcie (drugi agent zmergował). Użycie: scripts/ship.sh [nr PR]
set -uo pipefail

GH="${GH:-gh}"
command -v "$GH" >/dev/null 2>&1 || GH="/c/Program Files/GitHub CLI/gh.exe"
PR="${1:-}"

for attempt in 1 2 3 4 5; do
  git fetch -q origin
  if ! git rebase -q origin/main; then
    echo "KONFLIKT przy rebase – rozwiąż (tylko swoje pliki) albo zapytaj użytkownika." >&2
    exit 1
  fi
  npm install --no-audit --no-fund >/dev/null 2>&1
  if ! npm run build >/tmp/ship-build.log 2>&1; then
    echo "BUILD nie przechodzi po rebase – log: /tmp/ship-build.log" >&2
    tail -30 /tmp/ship-build.log >&2
    exit 1
  fi
  # SKIP_TESTS=1 tylko gdy czerwony test należy do drugiego agenta i jest na niego issue [prośba].
  if [ "${SKIP_TESTS:-}" != "1" ] && ! npm test >/tmp/ship-test.log 2>&1; then
    echo "TESTY nie przechodzą po rebase – log: /tmp/ship-test.log" >&2
    tail -30 /tmp/ship-test.log >&2
    exit 1
  fi
  git push -q --force-with-lease
  if "$GH" pr merge $PR --squash --delete-branch >/dev/null 2>&1; then
    git switch -q main && git pull -q --ff-only
    echo "ZMERGOWANE (próba $attempt): $(git log --oneline -1)"
    exit 0
  fi
  echo "main się zmienił, ponawiam ($attempt)…"
  sleep 5
done

echo "Nie udało się zmergować po 5 próbach." >&2
exit 1
