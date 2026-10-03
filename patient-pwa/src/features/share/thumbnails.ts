/** Longest side of a photo sent to the doctor: enough to see a skin change, small enough to send fast. */
const MAX_SIDE = 800;
const JPEG_QUALITY = 0.7;

/** Downscaled JPEG data URL of a photo blob (runs on the phone, the original never leaves it). */
export async function makeThumbnail(blob: Blob): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Brak obsługi canvas');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
