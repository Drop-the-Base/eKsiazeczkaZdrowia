import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { rplCsvToRows } from './drugs';

// Pobiera eksport CSV Rejestru Produktów Leczniczych (dane otwarte) i zapisuje kompaktowy
// `patient-pwa/public/data/drugs.json`. Użycie: `npm run drugs -w data` (opcjonalnie ścieżka do CSV).
const RPL_CSV_URL =
  'https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/public-pl-report/get-csv';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../patient-pwa/public/data/drugs.json');

async function loadCsv(localPath: string | undefined): Promise<string> {
  if (localPath) return readFile(localPath, 'utf8');
  console.log(`Pobieram ${RPL_CSV_URL} …`);
  const res = await fetch(RPL_CSV_URL);
  if (!res.ok) throw new Error(`RPL: HTTP ${res.status}`);
  return res.text();
}

const rows = rplCsvToRows(await loadCsv(process.argv[2]));
const json = JSON.stringify(rows);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, json);
console.log(
  `${rows.length} leków → ${out} (${(json.length / 1e6).toFixed(1)} MB, gzip ${(gzipSync(json).length / 1e6).toFixed(2)} MB)`,
);
