import { useCallback, useEffect, useRef, useState } from 'react';
import { speechEngine, type SpeechErrorCode } from './engines';

const NOTICE_KEY = 'ez.voiceNoticeSeen';

function readNoticeSeen(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return false; // brak dostępu do storage (tryb prywatny) – pokażemy informację jeszcze raz
  }
}

function writeNoticeSeen() {
  try {
    localStorage.setItem(NOTICE_KEY, '1');
  } catch {
    // jw. – to tylko wygoda
  }
}

/**
 * Stan słuchania + wyniki z silnika. Silnik jest jeden na aplikację, więc instancja
 * przyjmuje zdarzenia tylko w trakcie własnej sesji (np. dwa `VoiceInput` na ekranie).
 */
export function useSpeech(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<SpeechErrorCode | null>(null);
  const [noticeSeen, setNoticeSeen] = useState(readNoticeSeen);
  const active = useRef(false);

  useEffect(() => {
    const offs = [
      speechEngine.onPartial((text) => active.current && setPartial(text)),
      speechEngine.onFinal((text) => {
        if (!active.current) return;
        setPartial('');
        onFinal(text);
      }),
      speechEngine.onError((code) => active.current && setError(code)),
      speechEngine.onEnd(() => {
        if (!active.current) return;
        active.current = false;
        setListening(false);
        setPartial('');
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [onFinal]);

  // Zamknięcie ekranu w trakcie słuchania wyłącza mikrofon.
  useEffect(
    () => () => {
      if (active.current) speechEngine.stop();
    },
    [],
  );

  const start = useCallback(() => {
    setError(null);
    active.current = true;
    setListening(true);
    speechEngine.start('pl-PL');
  }, []);

  const stop = useCallback(() => {
    if (active.current) speechEngine.stop();
  }, []);

  const acceptNotice = useCallback(() => {
    writeNoticeSeen();
    setNoticeSeen(true);
  }, []);

  return {
    available: speechEngine.isAvailable(),
    listening,
    partial,
    error,
    noticeSeen,
    acceptNotice,
    start,
    stop,
  };
}
