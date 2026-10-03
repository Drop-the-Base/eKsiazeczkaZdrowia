# Aplikacja lekarza

Webowa, bez instalacji i konta. Serwer podaje ją pod `/lekarz/`. Dane pacjenta są tylko w pamięci karty (bez `localStorage`, IndexedDB i service workera); nagłówki `Cache-Control: no-store` + ścisły CSP (`server/src/headers.ts`).

## Test bez telefonu: symulator pacjenta

Symulator (`/lekarz/?symulator`) gra telefon pacjenta: dołącza do sesji z kodu QR i wysyła dane demo Pani Anny tą samą szyfrowaną drogą (ECDH → AES-256-GCM przez przekaźnik).

1. `npm run build && npm start` (albo `npm run dev`; wtedy lekarz jest na `http://localhost:5174/lekarz/`).
2. Karta 1: `http://localhost:8787/lekarz/?dev` → ekran z kodem QR. (`?dev` pokazuje link do symulatora poza trybem dev.)
3. Kliknij **Symulator pacjenta (bez telefonu)** → karta 2 łączy się sama (dane QR są w `#…` adresu, nie trafiają na serwer).
4. Oba ekrany pokazują **ten sam 4-cyfrowy kod**; lekarz: „Połączono”.
5. Karta 2: **Wyślij dane demo** → postęp „Wysłano n z n części”, potem „Lekarz potwierdził odbiór danych”.
6. Karta 1: „Dane odebrane” i dane Pani Anny.
7. Karta 1: **Zakończ wizytę** → „Dane pacjenta usunięte z pamięci tej karty”; karta 2 rozłączona.

Ręcznie: zamiast linku można skopiować dane QR do pola w symulatorze.
