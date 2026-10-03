/**
 * OCR na urządzeniu (Tesseract.js, język polski). Zdjęcie nie opuszcza telefonu; przy pierwszym
 * użyciu pobierany jest tylko model językowy (kilka MB), potem z cache przeglądarki.
 */
export async function recognizeText(
  image: Blob,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('pol', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
