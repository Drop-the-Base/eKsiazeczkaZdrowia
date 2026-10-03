import { useEffect, useState } from 'react';
import type { Photo, PhotoCategory } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { fitWithin } from './photos.logic';

const MAX_SIDE = 1600;

export function usePhotoData() {
  return useLive(async () => {
    const [photos, series] = await Promise.all([db.photos.list(), db.photoSeries.list()]);
    return { photos, series };
  });
}

/** Object URL dla bloba zdjęcia, zwalniany przy zmianie i odmontowaniu. */
export function useBlobUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

/** Zmniejsza zdjęcie (dłuższy bok ≤ 1600 px, JPEG) – mniej miejsca w telefonie i szybsze wysyłanie. */
async function downscale(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ?? file;
  } finally {
    bitmap.close();
  }
}

export interface NewPhoto {
  file: Blob;
  category: PhotoCategory;
  /** Istniejąca seria albo nazwa nowej. */
  seriesId?: string;
  newSeriesName?: string;
  note?: string;
  takenAt: string;
}

export async function addPhoto(input: NewPhoto): Promise<Photo> {
  let seriesId = input.seriesId;
  if (!seriesId && input.newSeriesName?.trim()) {
    const series = await db.photoSeries.add({
      name: input.newSeriesName.trim(),
      createdAt: new Date().toISOString(),
    });
    seriesId = series.id;
  }
  return db.photos.add({
    blob: await downscale(input.file),
    takenAt: input.takenAt,
    category: input.category,
    seriesId,
    note: input.note?.trim() || undefined,
  });
}

export function removePhoto(id: string): Promise<void> {
  return db.photos.remove(id);
}
