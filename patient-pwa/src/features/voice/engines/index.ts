import type { SpeechEngine } from './types';
import { createWebSpeechEngine } from './webSpeechEngine';

/** Jedyne miejsce wyboru silnika mowy. W aplikacji mobilnej: rozpoznawanie na urządzeniu. */
export const speechEngine: SpeechEngine = createWebSpeechEngine();

export type { SpeechEngine, SpeechErrorCode } from './types';
