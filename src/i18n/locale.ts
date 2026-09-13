export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === 'ar';
}

/** A string that carries both languages, used by mock data. */
export type LocalizedString = Readonly<Record<Locale, string>>;
