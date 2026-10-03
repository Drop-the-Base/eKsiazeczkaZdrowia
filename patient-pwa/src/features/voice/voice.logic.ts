import type { VoiceInputMode } from '@ez/shared';
import type { SpeechErrorCode } from './engines/types';

/** Dokleja rozpoznany fragment do tego, co już jest w polu (pacjent mógł coś dopisać ręcznie). */
export function appendTranscript(base: string, addition: string): string {
  const a = addition.trim();
  if (!a) return base;
  const b = base.trimEnd();
  return b ? `${b} ${a}` : a;
}

export const MODE_TEXT: Record<VoiceInputMode, { placeholder: string; submit: string }> = {
  entry: { placeholder: 'np. od rana boli mnie głowa, wzięłam ibuprom', submit: 'Dalej' },
  ask: { placeholder: 'np. jakie leki brałam w ostatnich 2 miesiącach?', submit: 'Zapytaj' },
  tellDoctor: { placeholder: 'np. po nowym leku kręci mi się w głowie', submit: 'Dodaj do listy' },
  postVisit: {
    placeholder: 'np. odstawić suplement, kontrola morfologii za dwa tygodnie',
    submit: 'Dalej',
  },
};

export const ERROR_TEXT: Record<SpeechErrorCode, string> = {
  'not-allowed': 'Brak dostępu do mikrofonu. Wpisz tekst.',
  'no-speech': 'Nie wykryto mowy. Spróbuj ponownie lub wpisz tekst.',
  network: 'Rozpoznawanie mowy wymaga połączenia z internetem. Wpisz tekst.',
  unavailable: 'Ta przeglądarka nie obsługuje rozpoznawania mowy. Wpisz tekst.',
  other: 'Nie udało się rozpoznać mowy. Wpisz tekst.',
};
