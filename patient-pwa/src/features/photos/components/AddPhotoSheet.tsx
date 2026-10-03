import { useRef, useState } from 'react';
import type { PhotoCategory, PhotoSeries } from '@ez/shared';
import { BottomSheet, Button, Chip, TextField } from '../../../ui';
import { CATEGORY_LABEL } from '../photos.logic';
import { addPhoto, useBlobUrl } from '../usePhotos';
import styles from './Photos.module.css';

type Props = { open: boolean; onClose: () => void; series: PhotoSeries[] };

const CATEGORIES = Object.keys(CATEGORY_LABEL) as PhotoCategory[];

/** `datetime-local` z daty (czas lokalny). */
const toLocalInput = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export function AddPhotoSheet({ open, onClose, series }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Nowe zdjęcie">
      {open && <Body series={series} onDone={onClose} />}
    </BottomSheet>
  );
}

function Body({ series, onDone }: { series: PhotoSeries[]; onDone: () => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const preview = useBlobUrl(file);
  const [category, setCategory] = useState<PhotoCategory>('skin');
  const [seriesId, setSeriesId] = useState<string | undefined>(series[0]?.id);
  const [newSeries, setNewSeries] = useState('');
  const [note, setNote] = useState('');
  const [takenAt, setTakenAt] = useState(() => toLocalInput(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (f: File | undefined, fromGallery: boolean) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('To nie jest zdjęcie');
    setError(null);
    setFile(f);
    // Z galerii: czas zrobienia ≈ data pliku; z aparatu: teraz.
    if (fromGallery && f.lastModified) setTakenAt(toLocalInput(new Date(f.lastModified)));
  };

  const save = async () => {
    if (!file) return;
    const at = new Date(takenAt);
    if (Number.isNaN(at.getTime()) || at > new Date()) return setError('Niepoprawna data zdjęcia');
    setSaving(true);
    setError(null);
    try {
      await addPhoto({
        file,
        category,
        seriesId: newSeries.trim() ? undefined : seriesId,
        newSeriesName: newSeries,
        note,
        takenAt: at.toISOString(),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać zdjęcia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.form}>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => pick(e.target.files?.[0], false)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => pick(e.target.files?.[0], true)}
      />
      {preview ? (
        <img className={styles.preview} src={preview} alt="Podgląd" />
      ) : (
        <div className={styles.row}>
          <Button onClick={() => cameraRef.current?.click()}>Zrób zdjęcie</Button>
          <Button variant="secondary" onClick={() => galleryRef.current?.click()}>
            Z galerii
          </Button>
        </div>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Kategoria</legend>
        <div className={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Seria (to samo miejsce w czasie)</legend>
        {series.length > 0 && (
          <div className={styles.chips}>
            {series.map((s) => (
              <Chip
                key={s.id}
                selected={!newSeries.trim() && seriesId === s.id}
                onClick={() => {
                  setSeriesId(seriesId === s.id ? undefined : s.id);
                  setNewSeries('');
                }}
              >
                {s.name}
              </Chip>
            ))}
          </div>
        )}
        <TextField
          label="Nowa seria"
          value={newSeries}
          placeholder="np. wysypka na przedramieniu"
          onChange={(e) => setNewSeries(e.target.value)}
        />
      </fieldset>

      <TextField
        label="Kiedy"
        type="datetime-local"
        value={takenAt}
        onChange={(e) => setTakenAt(e.target.value)}
      />
      <TextField
        label="Notatka (opcjonalnie)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button block disabled={!file || saving} onClick={() => void save()}>
        {saving ? 'Zapisywanie…' : 'Zapisz zdjęcie'}
      </Button>
    </div>
  );
}
