import { useRef, useState } from 'react';
import type { ExamForm } from '../../exams/exams.logic';
import { Button, todayIso } from '../../../ui';
import { ocrToExamForm } from '../ocr.logic';
import { recognizeText } from '../recognize';
import styles from './OcrButton.module.css';

type Props = { onRecognized: (form: ExamForm) => void };

/** „Zdjęcie wyniku”: aparat → OCR na telefonie → formularz badania do sprawdzenia. */
export function OcrButton({ onRecognized }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    setMessage(null);
    setProgress(0);
    try {
      const text = await recognizeText(file, setProgress);
      const form = ocrToExamForm(text, todayIso());
      if (form) onRecognized(form);
      else
        setMessage(
          'Nie rozpoznano wyników na zdjęciu. Użyj wyraźniejszego zdjęcia lub wprowadź wyniki ręcznie.',
        );
    } catch {
      setMessage(
        'Nie udało się przetworzyć zdjęcia. Pierwsze użycie wymaga połączenia z internetem w celu pobrania modelu.',
      );
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className={styles.ocr}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Button
        variant="secondary"
        block
        disabled={progress !== null}
        onClick={() => inputRef.current?.click()}
      >
        {progress === null
          ? 'Wczytaj wyniki ze zdjęcia'
          : `Przetwarzanie… ${Math.round(progress * 100)}%`}
      </Button>
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
