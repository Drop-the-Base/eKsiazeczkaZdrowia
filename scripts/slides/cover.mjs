// docs/cover/index.html → docs/cover/cover.png (3200×2400).
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const dir = fileURLToPath(new URL('../../docs/cover/', import.meta.url));
const executablePath =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(`${dir}index.html`).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${dir}cover.png` });
  console.log('docs/cover/cover.png');
} finally {
  await browser.close();
}
