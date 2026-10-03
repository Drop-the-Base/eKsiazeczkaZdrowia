import { useState } from 'react';
import type { Photo } from '@ez/shared';
import { Button, EmptyState, LoadingState, PageHeader } from '../../ui';
import { AddPhotoSheet } from './components/AddPhotoSheet';
import { PhotoViewer } from './components/PhotoViewer';
import { Thumb } from './components/Thumb';
import { groupBySeries } from './photos.logic';
import { usePhotoData } from './usePhotos';
import styles from './PhotosScreen.module.css';

/** Zdjęcia w czasie (zmiany skórne, rany, obrzęki), pogrupowane w serie. */
export function PhotosScreen() {
  const data = usePhotoData();
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<Photo>();

  return (
    <>
      <PageHeader
        title="Zdjęcia"
        action={
          <Button variant="ghost" onClick={() => setAdding(true)}>
            + Dodaj
          </Button>
        }
      />
      <div className={styles.content}>
        {data.status === 'loading' ? (
          <LoadingState />
        ) : data.data.photos.length === 0 ? (
          <EmptyState title="Brak zdjęć">
            Rób zdjęcie zmiany co kilka dni – lekarz zobaczy, jak się zmienia.
            <Button onClick={() => setAdding(true)}>📷 Dodaj zdjęcie</Button>
          </EmptyState>
        ) : (
          groupBySeries(data.data.photos, data.data.series).map((g) => (
            <section key={g.series?.id ?? 'none'} className={styles.group}>
              <h2 className={styles.title}>
                {g.series?.name ?? 'Bez serii'}
                <span className={styles.count}>{g.photos.length}</span>
              </h2>
              <div className={styles.strip}>
                {g.photos.map((p) => (
                  <Thumb key={p.id} photo={p} onClick={() => setViewing(p)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <AddPhotoSheet
        open={adding}
        onClose={() => setAdding(false)}
        series={data.status === 'ready' ? data.data.series : []}
      />
      <PhotoViewer photo={viewing} onClose={() => setViewing(undefined)} />
    </>
  );
}
