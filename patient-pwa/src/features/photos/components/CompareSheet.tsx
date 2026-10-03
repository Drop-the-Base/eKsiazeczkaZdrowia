import type { Photo } from '@ez/shared';
import { BottomSheet, formatDateTime } from '../../../ui';
import { daysBetween } from '../photos.logic';
import { useBlobUrl } from '../usePhotos';
import styles from './Compare.module.css';

/** Dwa zdjęcia obok siebie, starsze po lewej – bez oceny, tylko daty. */
export function CompareSheet({
  pair,
  onClose,
}: {
  pair: [Photo, Photo] | null;
  onClose: () => void;
}) {
  const sorted = pair && [...pair].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  return (
    <BottomSheet
      open={sorted !== null}
      onClose={onClose}
      title={
        sorted
          ? `Porównanie · ${daysBetween(sorted[0]!.takenAt, sorted[1]!.takenAt)} dni różnicy`
          : undefined
      }
    >
      {sorted && (
        <div className={styles.pair}>
          <Side photo={sorted[0]!} />
          <Side photo={sorted[1]!} />
        </div>
      )}
    </BottomSheet>
  );
}

function Side({ photo }: { photo: Photo }) {
  const url = useBlobUrl(photo.blob);
  return (
    <figure className={styles.side}>
      {url && <img src={url} alt="" />}
      <figcaption>
        {formatDateTime(photo.takenAt)}
        {photo.note && <span className={styles.note}>{photo.note}</span>}
      </figcaption>
    </figure>
  );
}
