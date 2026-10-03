# data/

`npm run drugs -w data` pobiera eksport CSV [Rejestru Produktów Leczniczych](https://rejestrymedyczne.ezdrowie.gov.pl) (dane otwarte, ~17 MB) i zapisuje `patient-pwa/public/data/drugs.json`. Opcjonalnie: `npm run drugs -w data -- ścieżka/do/rpl.csv`.

- Tylko leki ludzkie: **20 248** rekordów (03.10.2026), **2,2 MB** JSON, **0,39 MB** gzip.
- Wiersz to tablica: `[rplId, nazwa, substancja czynna, moc, postać, ATC, id ulotki (0 = brak), OTC (1/0)]` (`src/drugs.ts`, typ `DrugRow`).
- Link do ulotki: `https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/<id ulotki>/leaflet`.
- `OTC = 1`, gdy którekolwiek opakowanie ma kategorię dostępności OTC.

Plik wynikowy jest w repo, więc build i deploy nie potrzebują sieci ani tego skryptu.
