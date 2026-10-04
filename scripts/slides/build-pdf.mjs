// <folder>/index.html → <folder>/<nazwa>.pdf i .pptx (slajdy 16:9).
// PPTX: każdy slajd jako obraz 2560×1440 + notatki prelegenta z <aside class="notes">.
// Nazwa pliku z <html data-output="…">, domyślnie eksiazeczka-zdrowia.
// Użycie: node scripts/slides/build-pdf.mjs [folder] [--png]
//   folder: domyślnie docs/slides; --png zapisuje też podglądy preview-N.png (poza gitem).
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pptxgen from 'pptxgenjs';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('../../', import.meta.url));
const folder = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'docs/slides';
const dir = `${resolve(root, folder)}/`;
const executablePath =
  process.env.CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'C:/Program Files/Google/Chrome/Application/chrome.exe');

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(`${dir}index.html`).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const name = await page.evaluate(
    () => document.documentElement.dataset.output ?? 'eksiazeczka-zdrowia',
  );
  await page.pdf({
    path: `${dir}${name}.pdf`,
    width: '1280px',
    height: '720px',
    printBackground: true,
  });
  const slides = await page.$$('.slide');
  console.log(`PDF: ${slides.length} slajdów → ${folder}/${name}.pdf`);

  const notes = await page.$$eval('.slide', (els) =>
    els.map((s) => s.querySelector('.notes')?.textContent?.trim() ?? ''),
  );
  // Linki (<a href>) w PPTX: przezroczysty prostokąt z hiperłączem nad obrazem slajdu.
  const links = await page.$$eval('.slide', (els) =>
    els.map((s) => {
      const box = s.getBoundingClientRect();
      return [...s.querySelectorAll('a[href]')].map((a) => {
        const r = a.getBoundingClientRect();
        return { url: a.href, x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
      });
    }),
  );
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = await page.title();
  pres.author = 'Drop the Base';
  for (const [i, s] of slides.entries()) {
    const png = await s.screenshot({ type: 'png' });
    if (process.argv.includes('--png')) await s.screenshot({ path: `${dir}preview-${i + 1}.png` });
    const slide = pres.addSlide();
    slide.addImage({
      data: `image/png;base64,${Buffer.from(png).toString('base64')}`,
      x: 0,
      y: 0,
      w: 10,
      h: 5.625,
      altText: `Slajd ${i + 1}`,
    });
    for (const l of links[i]) {
      const inch = 10 / 1280;
      slide.addText('', {
        x: l.x * inch,
        y: l.y * inch,
        w: l.w * inch,
        h: l.h * inch,
        hyperlink: { url: l.url },
        fill: { color: 'FFFFFF', transparency: 100 },
        isTextBox: true,
      });
    }
    if (notes[i]) slide.addNotes(notes[i]);
  }
  await pres.writeFile({ fileName: `${dir}${name}.pptx` });
  console.log(`PPTX → ${folder}/${name}.pptx`);
} finally {
  await browser.close();
}
