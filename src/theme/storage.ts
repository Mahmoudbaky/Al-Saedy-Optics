import Storage from 'expo-sqlite/kv-store';

const THEME_KEY = 'app.theme';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function readStoredThemePreference(): ThemePreference {
  try {
    const value = Storage.getItemSync(THEME_KEY);
    return isThemePreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export async function writeStoredThemePreference(value: ThemePreference): Promise<void> {
  await Storage.setItem(THEME_KEY, value);
}
