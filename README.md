# eKsiazeczkaZdrowia

Prywatna oś czasu zdrowia na telefonie pacjenta, uzupełniana głosem, którą w kilka sekund można bezpiecznie pokazać dowolnemu lekarzowi. HackYeah 2026, Sport & Healthcare.

Plan, architektura i taski: [`TASKS.md`](TASKS.md). Zasady pracy agentów: [`CLAUDE.md`](CLAUDE.md).

## Struktura

| Folder | Co to jest |
|---|---|
| `patient-pwa/` | PWA pacjenta (React + Vite, Dexie, WebCrypto) |
| `doctor-app/` | Aplikacja webowa lekarza (React + Vite, bez service workera i trwałego zapisu) |
| `server/` | Node + `ws`: przekaźnik szyfrogramu i endpointy LLM |
| `shared/` | Typy, kontrakty, transport, krypto, słowniki (czysty TypeScript) |
| `data/` | Skrypt przetwarzający Rejestr Produktów Leczniczych |

## Uruchomienie

Wymagania: Node.js ≥ 20, npm ≥ 10.

```bash
npm install
npm run dev        # PWA :5173, lekarz :5174, serwer :8787
```

| Adres | Co |
|---|---|
| http://localhost:5173 | aplikacja pacjenta (`/dev/ui` – podgląd komponentów) |
| http://localhost:5174 | aplikacja lekarza |
| http://localhost:8787/health | serwer |

Inne polecenia:

```bash
npm run build      # typecheck (tsc) + build wszystkich workspace'ów
npm test           # Vitest (czysta logika, krypto, transport, baza)
npm run format     # Prettier
npm start          # serwer produkcyjny
```

## Na telefonie

Kamera, mikrofon i instalacja PWA wymagają **HTTPS**, więc sam adres z sieci lokalnej (`http://192.168…:5173`) nie wystarczy. Tunel HTTPS do serwera dev: patrz B06 (`npm run tunnel`, opis pojawi się tutaj po jego zmergowaniu).

## Praca z repo (agenci)

Każdy task to issue na GitHubie; agent bierze je skillem `/next-task`. Zmergowanie PR po rebase, buildzie i testach:

```bash
scripts/ship.sh            # dla PR z bieżącej gałęzi
```
