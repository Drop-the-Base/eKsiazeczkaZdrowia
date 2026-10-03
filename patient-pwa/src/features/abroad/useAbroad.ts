import { useState } from 'react';
import type { AbroadLanguage } from '@ez/shared';
import { db } from '../../db';
import { todayIso, useLive } from '../../ui';
import { buildAbroadSummary, LANGUAGES } from './abroad.logic';

const LANG_KEY = 'abroad-language';

function savedLanguage(): AbroadLanguage {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return LANGUAGES.includes(v as AbroadLanguage) ? (v as AbroadLanguage) : 'en';
  } catch {
    return 'en'; // storage unavailable – default language
  }
}

/** Summary from the local database only – works without internet. */
export function useAbroad() {
  const [lang, setLangState] = useState<AbroadLanguage>(savedLanguage);
  const data = useLive(async () => ({
    profile: await db.profile.get(),
    medications: await db.medications.list(),
    diagnoses: await db.diagnoses.list(),
  }));

  const setLang = (l: AbroadLanguage) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // not remembered – only a convenience
    }
  };

  const summary =
    data.status === 'ready' && data.data.profile
      ? buildAbroadSummary(
          data.data.profile,
          data.data.medications,
          data.data.diagnoses,
          todayIso(),
          lang,
        )
      : undefined;
  return { lang, setLang, loading: data.status === 'loading', summary };
}
