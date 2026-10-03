import { useState } from 'react';
import type { SnapshotPhoto } from '@ez/shared';
import { formatDate } from '../../format';
import { useShowMore } from './useShowMore';
import styles from './Sections.module.css';

const CATEGORY = { skin: 'skóra', wound: 'rana', swelling: 'obrzęk', other: 'inne' } as const;

/** Gallery; picking two photos shows them side by side. */
export function PhotosSection({ photos }: { photos: SnapshotPhoto[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const sorted = [...photos].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const more = useShowMore(sorted.length, 12);
  if (photos.length === 0) return <p className={styles.muted}>brak</p>;
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));
  const compare = picked
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is SnapshotPhoto => !!p);
  return (
    <>
      {compare.length === 2 && (
        <div className={styles.compare}>
          {compare.map((p) => (
            <figure key={p.id}>
              <img src={p.thumbnailDataUrl} alt={`Zdjęcie z ${formatDate(p.takenAt)}`} />
              <figcaption>{formatDate(p.takenAt)}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <p className={`${styles.muted} ${styles.screenOnly}`}>
        Zaznacz dwa zdjęcia, aby je porównać.
      </p>
      <div className={styles.gallery}>
        {sorted.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={[
              styles.photo,
              picked.includes(p.id) ? styles.picked : '',
              more.className(i) ?? '',
            ].join(' ')}
            onClick={() => toggle(p.id)}
          >
            <img src={p.thumbnailDataUrl} alt="" />
            <span>
              {formatDate(p.takenAt)} · {CATEGORY[p.category]}
            </span>
          </button>
        ))}
      </div>
      {more.button}
    </>
  );
}
