import type { SpeechEngine, SpeechErrorCode } from './types';

// Web Speech API nie ma typów w lib.dom TypeScriptu – tylko to, czego używamy.
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const ERRORS: Record<string, SpeechErrorCode> = {
  'not-allowed': 'not-allowed',
  'service-not-allowed': 'not-allowed',
  'no-speech': 'no-speech',
  network: 'network',
};

function listeners<T extends unknown[]>() {
  const set = new Set<(...args: T) => void>();
  return {
    add(cb: (...args: T) => void) {
      set.add(cb);
      return () => void set.delete(cb);
    },
    emit(...args: T) {
      set.forEach((cb) => cb(...args));
    },
  };
}

/** Web Speech API (Chrome: nagranie przetwarza usługa Google – mówimy o tym przy pierwszym użyciu). */
export function createWebSpeechEngine(): SpeechEngine {
  const partial = listeners<[string]>();
  const final = listeners<[string]>();
  const error = listeners<[SpeechErrorCode]>();
  const end = listeners<[]>();
  let current: Recognition | null = null;

  return {
    isAvailable: () => typeof window !== 'undefined' && recognitionCtor() !== undefined,
    start(lang) {
      const Ctor = recognitionCtor();
      if (!Ctor) {
        error.emit('unavailable');
        end.emit();
        return;
      }
      current?.abort();
      const rec = new Ctor();
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (!r) continue;
          if (r.isFinal) final.emit(r[0].transcript.trim());
          else interim += r[0].transcript;
        }
        if (interim) partial.emit(interim.trim());
      };
      rec.onerror = (e) => error.emit(ERRORS[e.error] ?? 'other');
      rec.onend = () => {
        if (current === rec) current = null;
        end.emit();
      };
      current = rec;
      rec.start();
    },
    stop() {
      current?.stop();
    },
    onPartial: partial.add,
    onFinal: final.add,
    onError: error.add,
    onEnd: end.add,
  };
}
