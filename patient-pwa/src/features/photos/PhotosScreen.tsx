import { useState } from 'react';
import type { Photo } from '@ez/shared';
import { Button, EmptyState, LoadingState, PageHeader } from '../../ui';
import { AddPhotoSheet } from './components/AddPhotoSheet';
import { CompareSheet } from './components/CompareSheet';
import { PhotoViewer } from './components/PhotoViewer';
import { Thumb } from './components/Thumb';
import { groupBySeries, toggleCompare } from './photos.logic';
import { usePhotoData } from './usePhotos';
import styles from './PhotosScreen.module.css';

/** Zdjęcia w czasie (zmiany skórne, rany, obrzęki), pogrupowane w serie; porównanie dwóch obok siebie. */
export function PhotosScreen() {
  const data = usePhotoData();
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<Photo>();
  const [comparing, setComparing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [pair, setPair] = useState<[Photo, Photo] | null>(null);

  const photos = data.status === 'ready' ? data.data.photos : [];
  const onThumb = (p: Photo) =>
    comparing ? setSelected((s) => toggleCompare(s, p.id)) : setViewing(p);

  const showCompare = () => {
    const [a, b] = selected.map((id) => photos.find((p) => p.id === id));
    if (a && b) setPair([a, b]);
  };

  const stopComparing = () => {
    setComparing(false);
    setSelected([]);
  };

  return (
    <>
      <PageHeader
        title="Zdjęcia"
        back="/profil"
        action={
          <Button variant="ghost" onClick={() => setAdding(true)}>
            + Dodaj
          </Button>
        }
      />
      <div className={styles.content}>
        {photos.length >= 2 &&
          (comparing ? (
            <div className={styles.compareBar}>
              <span>Wybierz 2 zdjęcia ({selected.length}/2)</span>
              <Button disabled={selected.length < 2} onClick={showCompare}>
                Porównaj
              </Button>
              <Button variant="ghost" onClick={stopComparing}>
                Anuluj
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setComparing(true)}>
              Porównaj dwa zdjęcia
            </Button>
          ))}

        {data.status === 'loading' ? (
          <LoadingState />
        ) : photos.length === 0 ? (
          <EmptyState title="Brak zdjęć">
            Dokumentuj zmianę zdjęciami co kilka dni, aby lekarz mógł ocenić jej przebieg.
            <Button onClick={() => setAdding(true)}>Dodaj zdjęcie</Button>
          </EmptyState>
        ) : (
          groupBySeries(photos, data.data.series).map((g) => (
            <section key={g.series?.id ?? 'none'} className={styles.group}>
              <h2 className={styles.title}>
                {g.series?.name ?? 'Bez serii'}
                <span className={styles.count}>{g.photos.length}</span>
              </h2>
              <div className={styles.strip}>
                {g.photos.map((p) => (
                  <Thumb
                    key={p.id}
                    photo={p}
                    selected={comparing && selected.includes(p.id)}
                    onClick={() => onThumb(p)}
                  />
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
      <CompareSheet pair={pair} onClose={() => setPair(null)} />
    </>
  );
}
