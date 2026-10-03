// Zrzut ekranu PWA z kliknięciami (puppeteer-core + zainstalowany Chrome).
// Użycie: node scripts/shot.mjs <url> <plik.png> [krok...]
//   krok: "click:fragment tekstu" | "exact:Cały tekst przycisku" | "try:jak exact, jeśli jest" | "pin:1234" | "sel:selektor CSS" | "upload:selektor|plik" | "type:selektor|tekst" | "wait:ms"
import puppeteer from 'puppeteer-core';

const [url, out, ...steps] = process.argv.slice(2);
if (!url || !out) {
  console.error(
    'Użycie: node scripts/shot.mjs <url> <plik.png> [click:tekst|exact:tekst|type:sel|tekst|wait:ms]...',
  );
  process.exit(1);
}

const executablePath =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 860, deviceScaleFactor: 1 });
  page.on('pageerror', (err) => console.error('pageerror:', err.message));
  page.on('console', (msg) => msg.type() === 'error' && console.error('console:', msg.text()));
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));
  for (const step of steps) {
    const [kind, arg = ''] = step.split(/:(.*)/s);
    if (kind === 'click') {
      const el = await page.waitForSelector(`::-p-text(${arg})`, { timeout: 5000 });
      await el.click();
    } else if (kind === 'exact') {
      const el = await page.waitForSelector(
        `::-p-xpath(//*[self::button or self::summary or self::a][normalize-space()=${JSON.stringify(arg)}])`,
        { timeout: 5000 },
      );
      await el.click();
    } else if (kind === 'try') {
      // Jak `exact:`, ale bez błędu, gdy przycisku nie ma (np. arkusz, który pojawia się tylko czasem).
      const el = await page.$(
        `::-p-xpath(//*[self::button or self::summary or self::a][normalize-space()=${JSON.stringify(arg)}])`,
      );
      if (el) await el.click();
    } else if (kind === 'pin') {
      // Ekran blokady (B27/B28): wypełnia wszystkie pola PIN-u i zatwierdza.
      const fields = await page.$$('input[type=password]');
      for (const f of fields) await f.type(arg, { delay: 20 });
      const submit = await page.$(
        '::-p-xpath(//button[normalize-space()="Ustaw PIN" or normalize-space()="Odblokuj"])',
      );
      if (submit) await submit.click();
      await new Promise((r) => setTimeout(r, 1500));
    } else if (kind === 'sel') {
      const el = await page.waitForSelector(arg, { timeout: 5000 });
      await el.click();
    } else if (kind === 'upload') {
      const [sel = '', file = ''] = arg.split(/\|(.*)/s);
      const input = await page.waitForSelector(sel, { timeout: 5000 });
      await input.uploadFile(file);
    } else if (kind === 'type') {
      const [sel = '', text = ''] = arg.split(/\|(.*)/s);
      await page.type(sel, text, { delay: 20 });
    } else if (kind === 'wait') {
      await new Promise((r) => setTimeout(r, Number(arg)));
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: out, fullPage: true });
  console.log(`zapisano ${out}`);
} finally {
  await browser.close();
}
