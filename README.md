# Prywatna Karta Zdrowia

Prywatna oś czasu zdrowia na telefonie pacjenta, uzupełniana głosem, którą w kilka sekund można bezpiecznie pokazać dowolnemu lekarzowi. HackYeah 2026, Sport & Healthcare.

Plan, architektura i taski: [`TASKS.md`](TASKS.md). Zasady pracy agentów: [`CLAUDE.md`](CLAUDE.md).

## Demo

Dla osoby, która ma kilka minut: dane Pani Anny (fikcyjne, oparte na prawdziwym przypadku) są wczytane od razu, a przewodnik prowadzi przez najważniejsze funkcje.

- `/demo`: aplikacja pacjentki z przewodnikiem (PIN demo `1234`, ustawiany sam, osobna baza w przeglądarce).
- `/demo/lekarz`: widok lekarza z przewodnikiem; „Symuluj telefon pacjentki” łączy się prawdziwym, szyfrowanym kanałem. Z kartą `/demo` w tej samej przeglądarce kod QR przekazuje się sam.
- `?bez-przewodnika` wyłącza przewodnik (zrzuty ekranu). Prawdziwa aplikacja (`/`, `/lekarz/`) nie zawiera danych demo.
- Lokalnie: `npm run build && npm start`, potem `http://localhost:8787/demo` (`/demo/lekarz` obsługuje tylko serwer, nie `npm run dev`).

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

Kamera, mikrofon i instalacja PWA wymagają **HTTPS**, więc sam adres z sieci lokalnej (`http://192.168…:5173`) nie wystarczy. Używamy darmowego tunelu Cloudflare (bez konta), który daje adres `https://…trycloudflare.com`.

Jednorazowo: `brew install cloudflared` (macOS) albo `winget install Cloudflare.cloudflared` (Windows).

```bash
npm run build && npm start         # terminal 1: serwer produkcyjny :8787 (PWA na /, lekarz na /lekarz/)
npm run tunnel -w server           # terminal 2: wypisze adres https://…trycloudflare.com
```

Na telefonie otwórz wypisany adres, a na komputerze `<adres>/lekarz/` (albo `http://localhost:8787/lekarz/`). Przekaźnik (`wss://…/relay`) i LLM idą przez ten sam tunel. Adres zmienia się przy każdym uruchomieniu tunelu.

Tryb dev z hot reloadem: `npm run dev`, potem `npm run tunnel -w server -- dev` (tunel do PWA na :5173).

## Praca z repo (agenci)

Każdy task to issue na GitHubie; agent bierze je skillem `/next-task`. Zmergowanie PR po rebase, buildzie i testach:

```bash
scripts/ship.sh            # dla PR z bieżącej gałęzi
```

Zrzut ekranu z klikaniem (sprawdzanie ekranów bez ręcznego klikania; puppeteer-core + zainstalowany Chrome, nowy profil przy każdym uruchomieniu – dane demo pod `/demo/...`):

```bash
npm run build -w patient-pwa && npx vite preview --port 4173 -c patient-pwa/vite.config.ts patient-pwa &
node scripts/shot.mjs "http://localhost:4173/demo/leki?bez-przewodnika" out.png "click:+ Dodaj" "type:input[type=search]|ibupr" "wait:1000"
```

## Slajdy

`docs/slides/prywatna-karta-zdrowia.pdf` (10 slajdów, 1280×720) z `docs/slides/index.html`. Odświeżenie zrzutów i PDF:

```bash
npm run build && PORT=8799 npm start &       # serwer z PWA, aplikacją lekarza i przekaźnikiem
node scripts/slides/capture.mjs              # zrzuty ekranów → docs/slides/img/
node scripts/slides/build-pdf.mjs --png      # PDF (+ podglądy preview-N.png, poza gitem)
```
