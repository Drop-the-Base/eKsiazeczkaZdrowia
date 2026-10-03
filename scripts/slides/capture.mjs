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
  await page.goto(`${BASE}/demo${path === '/' ? '' : path}?bez-przewodnika`, {
    waitUntil: 'networkidle0',
  });
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

  // Lekarz: /demo/lekarz, przewodnik gra telefon pacjentki (dane Pani Anny, ta sama szyfrowana droga).
  const doctor = await browser.newPage();
  await doctor.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await doctor.goto(`${BASE}/demo/lekarz/`, { waitUntil: 'networkidle2' });
  // Klikanie poza podświetleniem jest wyłączone, więc przyciski przewodnika wciskamy z poziomu strony.
  const guide = (label) =>
    doctor.evaluate((text) => {
      const b = [...document.querySelectorAll('aside[aria-label="Przewodnik demo"] button')].find(
        (el) => el.textContent?.trim() === text,
      );
      if (!b) throw new Error(`brak przycisku ${text}`);
      b.click();
    }, label);
  await doctor.waitForSelector('aside[aria-label="Przewodnik demo"]', { timeout: 10000 });
  await sleep(1500);
  await guide('Symuluj telefon pacjentki');
  console.log('  symulator wysłał dane');
  await doctor.waitForSelector('[data-tour="code"]', { timeout: 15000 });
  await sleep(500);
  await guide('Kody się zgadzają');
  await sleep(2500);
  await guide('Zamknij przewodnik');
  await sleep(1500);
  await doctor.screenshot({ path: `${OUT}lekarz.png` });
  console.log('✓ lekarz');
} finally {
  await browser.close();
}
