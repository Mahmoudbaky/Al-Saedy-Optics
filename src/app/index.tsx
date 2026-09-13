import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';

import { Screen } from '@/components/layout';
import { Button, Pressable, Text } from '@/components/ui';
import { useLocale, type Locale } from '@/i18n';
import { radius, spacing, useThemedStyles, type Palette } from '@/theme';

const mark = require('@/assets/brand/mark.png');

/** Splash + language picker. Shown once; later launches go straight to the tabs. */
export default function SplashScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, locale, hasChosenLocale, setLocale } = useLocale();
  const [choice, setChoice] = useState<Locale>(locale);

  if (hasChosenLocale) return <Redirect href="/(tabs)" />;

  // Storing the choice flips `hasChosenLocale`, which redirects into the tabs.
  // A direction change reloads the app first so the new layout direction applies.
  const start = () => setLocale(choice);

  return (
    <Screen background="brand" edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.markBox}>
          <Image source={mark} style={styles.mark} contentFit="contain" />
        </View>
        <View style={styles.copy}>
          <Text variant="displayLg" color="onNavy" align="center">{t.common.appName}</Text>
          <Text variant="body" color="onNavyMuted" align="center" style={styles.tagline}>{t.splash.tagline}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Text variant="label" color="onNavySubtle" align="center">{t.splash.chooseLanguage}</Text>
        <View style={styles.languages}>
          <LanguageOption label={t.splash.arabic} selected={choice === 'ar'} onPress={() => setChoice('ar')} />
          <LanguageOption label={t.splash.english} selected={choice === 'en'} onPress={() => setChoice('en')} />
        </View>
        <Button label={t.splash.start} onPress={start} />
        <Pressable onPress={() => router.replace('/(tabs)/account')} accessibilityRole="link" style={styles.signIn}>
          <Text variant="label" color="onNavySubtle" align="center">{t.splash.haveAccount}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function LanguageOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.language, selected ? styles.languageSelected : styles.languageIdle]}
    >
      <Text variant="bodyLg" color={selected ? 'brand' : 'onNavy'} weight={selected ? 'bold' : 'regular'}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  screen: { paddingHorizontal: 28 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  markBox: { width: 112, height: 124, borderRadius: 28, backgroundColor: colors.onNavy, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 74, height: 82 },
  copy: { gap: spacing.sm },
  tagline: { lineHeight: 26 },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
  languages: { flexDirection: 'row', gap: 10 },
  language: { flex: 1, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', overflow: 'hidden' },
  languageSelected: { backgroundColor: colors.onNavy },
  languageIdle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  signIn: { paddingTop: 2 },
});
