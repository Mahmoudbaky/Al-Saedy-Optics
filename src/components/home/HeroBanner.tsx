import { I18nManager, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ImageSlot, Pressable, Text } from '@/components/ui';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface HeroBannerProps {
  title: string;
  subtitle?: string | null;
  ctaLabel: string;
  placeholder: string;
  imageUrl?: string | null;
  onPress?: () => void;
}

/** Campaign banner with a navy gradient that fades from the reading start. */
export function HeroBanner({ title, subtitle, ctaLabel, placeholder, imageUrl, onPress }: HeroBannerProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ImageSlot tone="hero" source={imageUrl ? { uri: imageUrl } : undefined} placeholder={placeholder} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.navy88, colors.navy15]}
        start={{ x: I18nManager.isRTL ? 1 : 0, y: 0.5 }}
        end={{ x: I18nManager.isRTL ? 0.22 : 0.78, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text variant="displayMd" color="onNavy">{title}</Text>
        {subtitle ? <Text variant="bodySm" color="onNavyMuted">{subtitle}</Text> : null}
        <Pressable onPress={onPress} accessibilityRole="button" style={styles.cta} rippleColor="rgba(255,255,255,0.25)">
          <Text variant="label" color="onNavy" weight="bold">{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  container: { height: 172, borderRadius: radius.hero, overflow: 'hidden' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: spacing.sm, padding: 22 },
  cta: { backgroundColor: colors.red, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, overflow: 'hidden' },
});
