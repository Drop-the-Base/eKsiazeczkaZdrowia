// docs/slides/index.html → docs/slides/eksiazeczka-zdrowia.pdf (10 stron 1280×720).
// Użycie: node scripts/slides/build-pdf.mjs [--png] (z --png także podgląd każdej strony).
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const dir = fileURLToPath(new URL('../../docs/slides/', import.meta.url));
const executablePath =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(pathToFileURL(`${dir}index.html`).href, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: `${dir}eksiazeczka-zdrowia.pdf`,
    width: '1280px',
    height: '720px',
    printBackground: true,
  });
  const count = await page.$$eval('.slide', (s) => s.length);
  console.log(`PDF: ${count} slajdów → docs/slides/eksiazeczka-zdrowia.pdf`);
  if (process.argv.includes('--png')) {
    const slides = await page.$$('.slide');
    for (const [i, s] of slides.entries()) {
      await s.screenshot({ path: `${dir}preview-${i + 1}.png` });
    }
  }
} finally {
  await browser.close();
}
