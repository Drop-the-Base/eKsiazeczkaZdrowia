export type SpeechErrorCode = 'not-allowed' | 'no-speech' | 'network' | 'unavailable' | 'other';

/**
 * Silnik rozpoznawania mowy. `VoiceInput` zna tylko ten interfejs, więc podmiana silnika
 * (np. rozpoznawanie na urządzeniu w aplikacji mobilnej) to jeden plik w `engines/`.
 */
export interface SpeechEngine {
  isAvailable(): boolean;
  start(lang: string): void;
  stop(): void;
  /** Każdy callback zwraca funkcję odpinającą. */
  onPartial(cb: (text: string) => void): () => void;
  onFinal(cb: (text: string) => void): () => void;
  onError(cb: (code: SpeechErrorCode) => void): () => void;
  /** Silnik przestał słuchać (koniec wypowiedzi, `stop()` albo błąd). */
  onEnd(cb: () => void): () => void;
}
