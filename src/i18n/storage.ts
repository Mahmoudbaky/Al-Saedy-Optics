import Storage from 'expo-sqlite/kv-store';

import { isLocale, type Locale } from './locale';

const LOCALE_KEY = 'app.locale';

/** Synchronous read so the first render already knows the language. */
export function readStoredLocale(): Locale | null {
  try {
    const value = Storage.getItemSync(LOCALE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export async function writeStoredLocale(locale: Locale): Promise<void> {
  await Storage.setItem(LOCALE_KEY, locale);
}
