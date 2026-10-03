import type { Photo } from '@ez/shared';
import { formatDate } from '../../../ui';
import { useBlobUrl } from '../usePhotos';
import styles from './Photos.module.css';

type Props = { photo: Photo; selected?: boolean; onClick: () => void };

export function Thumb({ photo, selected, onClick }: Props) {
  const url = useBlobUrl(photo.blob);
  return (
    <button
      type="button"
      className={[styles.thumb, selected && styles.selected].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Zdjęcie z ${formatDate(photo.takenAt)}`}
    >
      {url && <img src={url} alt="" />}
      <span className={styles.thumbDate}>{formatDate(photo.takenAt)}</span>
    </button>
  );
}
