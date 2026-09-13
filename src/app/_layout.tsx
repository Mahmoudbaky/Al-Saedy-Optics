import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '@/store';
import { fontAssets, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

/** Rendered inside the providers so the navigator can follow the active theme. */
function RootNavigator() {
  const { colors, isDark } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: { ...base.colors, primary: colors.navy, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="prescription" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders/[id]" />
        <Stack.Screen name="book-exam" />
        <Stack.Screen name="wishlist" />
      </Stack>
    </NavigationThemeProvider>
  );
}
