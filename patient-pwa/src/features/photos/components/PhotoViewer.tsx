import { useState } from 'react';
import type { Photo } from '@ez/shared';
import { BottomSheet, Button, formatDateTime } from '../../../ui';
import { CATEGORY_LABEL } from '../photos.logic';
import { removePhoto, useBlobUrl } from '../usePhotos';
import styles from './Photos.module.css';

export function PhotoViewer({ photo, onClose }: { photo: Photo | undefined; onClose: () => void }) {
  return (
    <BottomSheet
      open={photo !== undefined}
      onClose={onClose}
      title={photo ? formatDateTime(photo.takenAt) : undefined}
    >
      {photo && <Body key={photo.id} photo={photo} onClose={onClose} />}
    </BottomSheet>
  );
}

function Body({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const url = useBlobUrl(photo.blob);
  const [error, setError] = useState<string | null>(null);

  const onRemove = () => {
    if (!window.confirm('Usunąć zdjęcie?')) return;
    removePhoto(photo.id).then(onClose, (err: unknown) =>
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć'),
    );
  };

  return (
    <div className={styles.form}>
      {url && <img className={styles.full} src={url} alt="" />}
      <p className={styles.muted}>
        {[CATEGORY_LABEL[photo.category], photo.note].filter(Boolean).join(' · ')}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button variant="danger" onClick={onRemove}>
        Usuń zdjęcie
      </Button>
    </div>
  );
}
