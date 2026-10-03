// Zrzuty ekranów do slajdów (docs/slides/img/*.png) z działającej aplikacji.
// Wymaga serwera: `npm run build && PORT=8799 npm start`, potem `node scripts/slides/capture.mjs`.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE ?? 'http://localhost:8799';
const OUT = fileURLToPath(new URL('../../docs/slides/img/', import.meta.url));
const executablePath =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const xpButton = (text) =>
  `::-p-xpath(//*[self::button or self::a or self::summary][normalize-space()=${JSON.stringify(text)}])`;

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true });

/** Telefon: nowy profil w trybie demo (dane Pani Anny, PIN sam), potem kroki i zrzut widocznego ekranu. */
async function phone(name, path, steps = async () => {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/demo${path === '/' ? '' : path}`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  const close = await page.$(xpButton('Zamknij'));
  if (close) await close.click();
  await sleep(500);
  await steps(page);
  await page.screenshot({ path: `${OUT}${name}.png` });
  await context.close();
  console.log('✓', name);
}

async function click(page, text) {
  const el = await page.waitForSelector(xpButton(text), { timeout: 8000 });
  await el.click();
  await sleep(600);
}

try {
  await phone('os-czasu', '/');
  await phone('leki', '/leki');
  await phone('dodaj', '/dodaj', async (page) => {
    await page.type('textarea', 'od rana boli mnie głowa, wzięłam ibuprom');
    await click(page, 'Dalej');
    await sleep(2500);
  });
  await phone('powiem-lekarzowi', '/wizyta');
  await phone('zapytaj', '/zapytaj', async (page) => {
    await click(page, 'Jakie leki brałam w ostatnich 2 miesiącach?');
    await click(page, 'Rozumiem, zapytaj');
    await sleep(1500);
  });
  await phone('za-granica', '/wizyta/za-granica', async (page) => {
    const es = await page.$('::-p-xpath(//button[contains(., "Espa") or normalize-space()="ES"])');
    if (es) await es.click();
    await sleep(800);
  });

  // Lekarz: QR na komputerze + symulator telefonu (dane demo, ta sama szyfrowana droga).
  const doctor = await browser.newPage();
  await doctor.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await doctor.goto(`${BASE}/lekarz/?dev`, { waitUntil: 'networkidle2' });
  const link = await doctor.waitForSelector('::-p-text(Symulator pacjenta)', { timeout: 10000 });
  const href = await link.evaluate((a) => a.href);
  console.log('  sesja lekarza gotowa');
  const sim = await browser.newPage();
  await sim.goto(href, { waitUntil: 'networkidle2' });
  await (await sim.waitForSelector(xpButton('Wyślij dane demo'), { timeout: 15000 })).click();
  console.log('  symulator wysłał dane');
  await doctor.bringToFront();
  await (await doctor.waitForSelector(xpButton('Kody się zgadzają'), { timeout: 15000 })).click();
  await sleep(4000);
  await doctor.screenshot({ path: `${OUT}lekarz.png` });
  console.log('✓ lekarz');
} finally {
  await browser.close();
}
