# Postęp – agent B („Wizyta i bezpieczeństwo”)

Zmergowane taski (dopisuje agent B po każdym merge, patrz `CLAUDE.md`).

- [x] [B01] Kontrakt: shared/types.ts + shared/contracts.ts · issue #5 · 2026-10-03 17:34 · atrapy: brak
- [x] [B02] db/: Dexie ze schematem i typowanym API · issue #7 · 2026-10-03 17:37 · atrapy: brak (szyfrowanie w B27)
- [x] [B03] shared/demo-data.ts: Pani Anna · issue #9 · 2026-10-03 17:40 · atrapy: nazwa suplementu i wyniki krwi ogólne (czekają na H02), bez zdjęć
- [x] [B04] loadDemoData() i reset danych demo · issue #11 · 2026-10-03 17:41 · atrapy: brak
- [x] [B05] Serwer: szkielet Node + ws, statyki, nagłówki, podpięcie LLM · issue #12 · 2026-10-03 17:44 · atrapy: POST /llm/query (do A23), /relay odpowiada błędem (do B08)
- [x] [B06] HTTPS w dev: tunel dla telefonu · issue #13 · 2026-10-03 17:46 · atrapy: brak
- [x] [prośba #89] resolveStaticPath na Windowsie · issue #89 · 2026-10-03 17:48 · atrapy: brak
- [x] [B08] Przekaźnik WebSocket: sesje, przekazywanie, wygasanie · issue #19 · 2026-10-03 17:50 · atrapy: brak
- [x] [B09] shared/crypto: ECDH → HKDF → AES-256-GCM + kod weryfikacyjny · issue #21 · 2026-10-03 17:52 · atrapy: brak
- [x] [B10] shared/transport: zaszyfrowany snapshot w kawałkach · issue #23 · 2026-10-03 17:56 · atrapy: brak
- [x] [B11] Aplikacja lekarza: ekran z QR i status połączenia · issue #25 · 2026-10-03 18:00 · atrapy: po odebraniu danych tymczasowe podsumowanie (widok w B18)
- [x] [B12] Symulator pacjenta + test end-to-end w dwóch kartach · issue #27 · 2026-10-03 18:04 · atrapy: summary w createDemoSnapshot uproszczone do B15
- [x] [B13] Lista „powiem lekarzowi” + pływający przycisk · issue #29 · 2026-10-03 18:07 · atrapy: pole tekstowe zamiast VoiceInput (A16)
- [x] [B15] buildVisitSummary(db, od) – lokalnie, bez LLM · issue #34 · 2026-10-03 18:10 · atrapy: brak
- [x] [B16] Ekran podsumowania przed wysłaniem (odznaczanie sekcji) · issue #36 · 2026-10-03 18:14 · atrapy: przycisk „Dalej” nieaktywny do B17, zdjęcia bez miniatur do B17
- [x] [B17] Udostępnij lekarzowi: skan QR, wysyłka, status · issue #38 · 2026-10-03 18:18 · atrapy: brak (porównanie kodów z przyciskami w B14)
- [x] [B18] Widok lekarza: pasek górny, nagłówek, lewa kolumna · issue #40 · 2026-10-03 18:24 · atrapy: prawa kolumna pusta do B19
- [x] [B19] Widok lekarza: „Od ostatniej wizyty”, oś czasu, zakładki · issue #42 · 2026-10-03 18:29 · atrapy: TimelineStandIn zamiast <Timeline> od A (B37)
