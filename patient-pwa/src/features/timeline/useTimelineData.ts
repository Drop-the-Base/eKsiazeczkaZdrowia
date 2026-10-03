import { useEffect, useState } from 'react';
import type { Photo, TimelineData, TimelinePhoto } from '@ez/shared';
import { db } from '../../db';
import { useLive, type Live } from '../../ui';

/** Wszystko, co pokazuje oś czasu – z lokalnej bazy, odświeżane na żywo. */
export function useTimelineData(): Live<TimelineData> {
  const raw = useLive(async () => {
    const [medications, intakes, symptoms, exams, visits, photos, documents] = await Promise.all([
      db.medications.list(),
      db.intakes.list(),
      db.symptoms.list(),
      db.exams.list(),
      db.visits.list(),
      db.photos.list(),
      db.documents.list(),
    ]);
    return {
      medications,
      intakes,
      symptoms,
      exams,
      visits,
      photos,
      documents: documents.map(({ file: _file, ...meta }) => meta),
    };
  });
  const photos = usePhotoUrls(raw.status === 'ready' ? raw.data.photos : undefined);
  if (raw.status === 'loading' || !photos) return { status: 'loading' };
  return { status: 'ready', data: { ...raw.data, photos } };
}

/** Miniatury jako object URL; zwalniane przy zmianie listy i przy odmontowaniu. */
function usePhotoUrls(photos: Photo[] | undefined): TimelinePhoto[] | undefined {
  const [result, setResult] = useState<TimelinePhoto[]>();
  useEffect(() => {
    if (!photos) return;
    const items = photos.map((p) => ({
      id: p.id,
      takenAt: p.takenAt,
      category: p.category,
      thumbnailUrl: URL.createObjectURL(p.blob),
    }));
    setResult(items);
    return () => items.forEach((i) => URL.revokeObjectURL(i.thumbnailUrl));
  }, [photos]);
  return result;
}
