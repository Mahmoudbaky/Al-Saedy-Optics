import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { I18nManager } from 'react-native';

import { reloadApp } from '@/utils/reload';

import { formatPrice, interpolate, localizeDigits } from './format';
import { DEFAULT_LOCALE, isRtlLocale, type Locale, type LocalizedString } from './locale';
import { readStoredLocale, writeStoredLocale } from './storage';
import { ar } from './translations/ar';
import { en } from './translations/en';
import type { Translations } from './translations/ar';

const translations: Record<Locale, Translations> = { ar, en };

type Params = Record<string, string | number>;

interface LocaleContextValue {
  locale: Locale;
  /** `true` once the user has explicitly picked a language on the splash screen. */
  hasChosenLocale: boolean;
  isRTL: boolean;
  /** Full translation tree for the active locale. */
  t: Translations;
  /** Replaces `{placeholders}` in a translation string. */
  tf: (template: string, params: Params) => string;
  /** Picks the active language from a bilingual value. */
  l: (value: LocalizedString) => string;
  /** Arabic-Indic digits in Arabic, unchanged otherwise. */
  n: (value: string | number) => string;
  price: (amount: number) => string;
  setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: PropsWithChildren) {
  const [stored, setStored] = useState<Locale | null>(readStoredLocale);
  const locale = stored ?? DEFAULT_LOCALE;

  const setLocale = useCallback(async (next: Locale) => {
    setStored(next);
    await writeStoredLocale(next);

    // React Native applies layout direction at startup, so a direction change needs a reload.
    const wantsRTL = isRtlLocale(next);
    if (I18nManager.isRTL !== wantsRTL) {
      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
      await reloadApp();
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const t = translations[locale];
    return {
      locale,
      hasChosenLocale: stored !== null,
      isRTL: isRtlLocale(locale),
      t,
      tf: interpolate,
      l: (v) => v[locale],
      n: (v) => localizeDigits(v, locale),
      price: (amount) => formatPrice(amount, locale, t.common.currency),
      setLocale,
    };
  }, [locale, stored, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
