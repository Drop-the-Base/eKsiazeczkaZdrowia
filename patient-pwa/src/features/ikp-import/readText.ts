/** Tekst z pliku: PDF przez pdf.js (ładowany dopiero tu – ~1 MB), tekst wprost. Wszystko lokalnie. */
export async function readText(file: Blob): Promise<string> {
  if (file.type === 'application/pdf') return readPdf(file);
  if (file.type.startsWith('text/') || file.type === '') return file.text();
  throw new Error('Obsługiwane są pliki PDF i tekstowe');
}

async function readPdf(file: Blob): Promise<string> {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // Kolejne fragmenty w linii; `hasEOL` = koniec linii w PDF.
      let line = '';
      const lines: string[] = [];
      for (const item of content.items) {
        if (!('str' in item)) continue;
        line += item.str;
        if (item.hasEOL) {
          lines.push(line.trim());
          line = '';
        } else if (!line.endsWith(' ')) {
          line += ' ';
        }
      }
      if (line.trim()) lines.push(line.trim());
      pages.push(lines.filter(Boolean).join('\n'));
    }
    return pages.join('\n');
  } finally {
    await doc.destroy();
  }
}
