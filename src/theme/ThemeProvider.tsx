import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Appearance, StyleSheet, useColorScheme } from 'react-native';

import { palettes, type Palette } from './colors';
import { readStoredThemePreference, writeStoredThemePreference, type ThemePreference } from './storage';

type Scheme = keyof typeof palettes;

interface ThemeContextValue {
  scheme: Scheme;
  isDark: boolean;
  colors: Palette;
  /** What the user picked; `system` follows the OS setting. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Pushes the preference into React Native so native UI (switches, alerts, tabs) follows too. */
function applyPreference(preference: ThemePreference) {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredThemePreference);
  const systemScheme = useColorScheme();

  useEffect(() => {
    applyPreference(preference);
  }, [preference]);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await writeStoredThemePreference(next);
  }, []);

  const scheme: Scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, isDark: scheme === 'dark', colors: palettes[scheme], preference, setPreference }),
    [scheme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

type NamedStyles<T> = { [P in keyof T]: StyleSheet.NamedStyles<T>[P] };

/**
 * Builds a StyleSheet from the active palette. Pass a module-level factory so the
 * result is memoised per palette: `const styles = useThemedStyles(makeStyles)`.
 */
export function useThemedStyles<T extends NamedStyles<T>>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
