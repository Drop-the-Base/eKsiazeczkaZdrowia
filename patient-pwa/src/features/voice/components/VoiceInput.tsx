import { useCallback, useId, useState } from 'react';
import type { VoiceInputProps } from '@ez/shared';
import { Button, MicButton } from '../../../ui';
import { useSpeech } from '../useSpeech';
import { appendTranscript, ERROR_TEXT, MODE_TEXT } from '../voice.logic';
import styles from './VoiceInput.module.css';

type Props = VoiceInputProps & {
  /** Etykieta przycisku zamiast domyślnej dla trybu. */
  submitLabel?: string;
  /** Czyścić pole po wysłaniu (domyślnie tak). */
  clearOnSubmit?: boolean;
};

/** Mikrofon + pole tekstowe obok (zawsze). Każda funkcja głosowa działa też bez głosu. */
export function VoiceInput({
  mode,
  onSubmit,
  placeholder,
  disabled,
  submitLabel,
  clearOnSubmit = true,
}: Props) {
  const fieldId = useId();
  const [text, setText] = useState('');
  const [pendingStart, setPendingStart] = useState(false);
  const onFinal = useCallback((t: string) => setText((prev) => appendTranscript(prev, t)), []);
  const speech = useSpeech(onFinal);
  const texts = MODE_TEXT[mode];

  const onMic = () => {
    if (speech.listening) return speech.stop();
    if (!speech.noticeSeen) return setPendingStart(true);
    speech.start();
  };

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const value = appendTranscript(text, speech.partial).trim();
    if (!value) return;
    speech.stop();
    onSubmit(value);
    if (clearOnSubmit) setText('');
  };

  const shown = speech.listening && speech.partial ? appendTranscript(text, speech.partial) : text;

  return (
    <form className={styles.voice} onSubmit={submit} data-tour="voice">
      {pendingStart && !speech.noticeSeen && (
        <div className={styles.notice} role="note">
          <p>
            Rozpoznawanie mowy w tej przeglądarce działa przez usługę Google – nagranie jest tam
            zamieniane na tekst. Twoja historia zdrowia nie jest wysyłana. Zamiast mówić, możesz
            zawsze wpisać tekst.
          </p>
          <Button
            onClick={() => {
              speech.acceptNotice();
              setPendingStart(false);
              speech.start();
            }}
          >
            Rozumiem, mów
          </Button>
        </div>
      )}

      <label htmlFor={fieldId} className={styles.label}>
        {speech.listening ? 'Słucham…' : 'Powiedz albo wpisz'}
      </label>
      <textarea
        id={fieldId}
        className={styles.field}
        value={shown}
        rows={3}
        placeholder={placeholder ?? texts.placeholder}
        disabled={disabled}
        readOnly={speech.listening}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) submit(e);
        }}
      />
      {speech.error && <p className={styles.error}>{ERROR_TEXT[speech.error]}</p>}

      <div className={styles.actions}>
        {speech.available && (
          <MicButton listening={speech.listening} disabled={disabled} onClick={onMic} />
        )}
        <Button type="submit" disabled={disabled || !shown.trim()}>
          {submitLabel ?? texts.submit}
        </Button>
      </div>
    </form>
  );
}
